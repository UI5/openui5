/* global QUnit */

sap.ui.define([
	"sap/base/Log",
	"sap/ui/fl/apply/_internal/flexState/compVariants/CompVariantManagementState",
	"sap/ui/fl/apply/_internal/flexObjects/FlexObjectFactory",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/Layer",
	"sap/ui/thirdparty/sinon-4",
	"test-resources/sap/ui/fl/qunit/FlQUnitUtils"
], function(
	Log,
	CompVariantManagementState,
	FlexObjectFactory,
	FlexState,
	Layer,
	sinon,
	FlQUnitUtils
) {
	"use strict";
	const sandbox = sinon.createSandbox();

	const sReference = "myApp";
	const sComponentId = "comp_id1";
	const sPersistencyKey = "id1";

	async function initializeFlexState() {
		await FlexState.initialize({
			componentId: sComponentId,
			reference: sReference
		});
	}
	function cleanup() {
		FlexState.clearState();
		FlexState.clearRuntimeSteadyObjects(sReference, sComponentId);
		CompVariantManagementState.getCompEntitiesDataSelector().clearCachedResult({ reference: sReference });
		CompVariantManagementState.getSetDefaultDataSelector().clearCachedResult({ reference: sReference });
		sandbox.restore();
	}

	QUnit.module("getVariant", {
		async beforeEach() {
			await initializeFlexState();
		},
		afterEach() {
			cleanup();
		}
	}, function() {
		QUnit.test("with a stored setDefaultVariant change for the persistency key", function(assert) {
			const oSetDefaultChange1 = FlexObjectFactory.createFromFileContent({
				reference: "myApp",
				fileType: "change",
				changeType: "defaultVariant",
				selector: {
					persistencyKey: sPersistencyKey
				},
				layer: Layer.CUSTOMER
			});
			const oSetDefaultChange2 = FlexObjectFactory.createFromFileContent({
				reference: "myApp",
				fileType: "change",
				changeType: "defaultVariant",
				selector: {
					persistencyKey: sPersistencyKey
				},
				layer: Layer.USER
			});

			FlQUnitUtils.stubFlexObjectsSelector(sandbox, [oSetDefaultChange1, oSetDefaultChange2]);
			const aDefaultChanges = CompVariantManagementState.getDefaultChanges({
				reference: "myApp",
				persistencyKey: sPersistencyKey
			});
			assert.strictEqual(aDefaultChanges.length, 2);
			assert.deepEqual(aDefaultChanges[0], oSetDefaultChange1, "default Change 1 was found");
			assert.deepEqual(aDefaultChanges[1], oSetDefaultChange2, "default Change 2 was found");
		});

		QUnit.test("with two stored setDefaultVariant changes for the persistency key", function(assert) {
			const oSetDefaultChange1 = FlexObjectFactory.createFromFileContent({
				reference: "myApp",
				fileType: "change",
				changeType: "defaultVariant",
				selector: {
					persistencyKey: sPersistencyKey
				},
				layer: Layer.CUSTOMER
			});
			const oSetDefaultChange2 = FlexObjectFactory.createFromFileContent({
				reference: "myApp",
				fileType: "change",
				changeType: "defaultVariant",
				selector: {
					persistencyKey: "someOtherId"
				},
				layer: Layer.USER
			});
			FlQUnitUtils.stubFlexObjectsSelector(sandbox, [oSetDefaultChange1, oSetDefaultChange2]);
			assert.deepEqual(CompVariantManagementState.getDefaultChanges(
				{ reference: "myApp", persistencyKey: sPersistencyKey }), [oSetDefaultChange1], "the first set default change gets returned");
		});

		QUnit.test("with one stored setDefaultVariant change and another variant change for the same persistency key", function(assert) {
			const sPersistencyKey = "id1";
			const oSetDefaultChange1 = FlexObjectFactory.createFromFileContent({
				reference: "myApp",
				fileType: "change",
				changeType: "defaultVariant",
				selector: {
					persistencyKey: sPersistencyKey
				},
				layer: Layer.CUSTOMER
			});

			const oSetDefaultChange2 = FlexObjectFactory.createFromFileContent({
				reference: "myApp",
				fileType: "change",
				changeType: "setContent",
				selector: {
					persistencyKey: sPersistencyKey,
					variantId: "hugo"
				},
				layer: Layer.USER
			});
			FlQUnitUtils.stubFlexObjectsSelector(sandbox, [oSetDefaultChange1, oSetDefaultChange2]);
			assert.deepEqual(CompVariantManagementState.getDefaultChanges(
				{ reference: "myApp", persistencyKey: sPersistencyKey }), [oSetDefaultChange1], "the first set default change gets returned");
		});

		QUnit.test("with one stored setDefaultVariant change with an empty string as persistency key", function(assert) {
			const sPersistencyKey = "";
			const oSetDefaultChange1 = FlexObjectFactory.createFromFileContent({
				reference: "myApp",
				fileType: "change",
				changeType: "defaultVariant",
				selector: {
					persistencyKey: sPersistencyKey
				},
				layer: Layer.CUSTOMER
			});
			FlQUnitUtils.stubFlexObjectsSelector(sandbox, [oSetDefaultChange1]);
			// making sure the getDefaultChanges DataSelector is properly handling an empty String as persistency key
			assert.deepEqual(CompVariantManagementState.getDefaultChanges(
				{ reference: "myApp", persistencyKey: sPersistencyKey }), [oSetDefaultChange1], "the set default change gets returned from getDefaultChanges");
			// making sure the getCompEntitiesByPersistencyKey DataSelector is properly handling an empty String as persistency key
			assert.deepEqual(CompVariantManagementState.getCompEntitiesByPersistencyKey(
				{ reference: "myApp", persistencyKey: sPersistencyKey }), [oSetDefaultChange1], "the set default change gets returned from getCompEntitiesByPersistencyKey");
		});
	});

	QUnit.module("CompVariantManagementState.addExternalVariants", {
		async beforeEach() {
			await initializeFlexState();
		},
		afterEach() {
			cleanup();
		}
	}, function() {
		QUnit.test("when called with an special character '#'", function(assert) {
			const oAddRuntimeSteadyObjectStub = sandbox.stub(FlexState, "addRuntimeSteadyObject");

			CompVariantManagementState.addExternalVariants({
				persistencyKey: sPersistencyKey,
				reference: "myApp",
				variants: [{
					id: "#externalVariantId1",
					name: ""
				}]
			});

			assert.equal(oAddRuntimeSteadyObjectStub.getCall(0).args[2].getId(), "_HASHTAG_externalVariantId1");
		});

		QUnit.test("when called with an special character '$'", function(assert) {
			const oLogErrorStub = sandbox.stub(Log, "error");
			const oAddRuntimeSteadyObjectStub = sandbox.stub(FlexState, "addRuntimeSteadyObject");

			CompVariantManagementState.addExternalVariants({
				persistencyKey: sPersistencyKey,
				reference: "myApp",
				variants: [{
					id: "$externalVariantId1",
					name: ""
				}]
			});

			assert.equal(oLogErrorStub.callCount, 1, "an error was logged");
			assert.equal(oAddRuntimeSteadyObjectStub.callCount, 0, "no item was added");
		});
	});

	QUnit.module("VariantsMapSelector.checkInvalidation", {
		async beforeEach() {
			await initializeFlexState();
		},
		afterEach() {
			cleanup();
		}
	}, function() {
		QUnit.test("when updateInfo is missing", function(assert) {
			const oUIChange = FlexObjectFactory.createFromFileContent({
				reference: "myApp",
				fileType: "change",
				changeType: "defaultVariant",
				selector: {
					persistencyKey: sPersistencyKey
				},
				layer: Layer.CUSTOMER
			});
			FlQUnitUtils.stubFlexObjectsSelector(sandbox, [oUIChange]);
			const oDataSelector = CompVariantManagementState.getSetDefaultDataSelector();
			const oClearCacheSpy = sandbox.spy(oDataSelector, "_clearCache");
			oDataSelector.checkUpdate({ reference: sReference, persistencyKey: sPersistencyKey });
			assert.strictEqual(oClearCacheSpy.callCount, 1, "then the update happened");
		});

		QUnit.test("when updateType 'addFlexObject' with variant related updated object is provided", function(assert) {
			const oUIChange = FlexObjectFactory.createFromFileContent({
				id: "someSetDefaultChange",
				layer: Layer.CUSTOMER,
				selector: {
					persistencyKey: sPersistencyKey
				},
				fileType: "change",
				changeType: "defaultVariant"
			});
			const oDataSelector = CompVariantManagementState.getSetDefaultDataSelector();
			const oClearCacheSpy = sandbox.spy(oDataSelector, "_clearCache");
			const mParameters = {
				reference: sReference,
				persistencyKey: sPersistencyKey
			};
			oDataSelector.checkUpdate(mParameters, [{ type: "addFlexObject", updatedObject: oUIChange }]);
			assert.strictEqual(oClearCacheSpy.callCount, 1, "then the cache has been invalidated");
		});

		QUnit.test("when updateType 'addFlexObject' without an updated object is provided", function(assert) {
			const oDataSelector = CompVariantManagementState.getSetDefaultDataSelector();
			const oClearCacheSpy = sandbox.spy(oDataSelector, "_clearCache");
			oDataSelector.checkUpdate(
				{ reference: sReference },
				[{ type: "addFlexObject" }]
			);
			assert.strictEqual(oClearCacheSpy.callCount, 0, "then the cache has not been invalidated");
		});

		QUnit.test("when updateTypes 'addFlexObject' & 'removeFlexObject' with a default variant change object as updated object is provided", function(assert) {
			const oDefaultVariantChange = FlexObjectFactory.createFromFileContent({
				reference: "myApp",
				fileType: "change",
				changeType: "defaultVariant",
				selector: {
					persistencyKey: sPersistencyKey
				},
				layer: Layer.CUSTOMER
			});
			const oDataSelector = CompVariantManagementState.getSetDefaultDataSelector();
			const oClearCacheSpy = sandbox.spy(oDataSelector, "_clearCache");
			oDataSelector.checkUpdate(
				{ reference: sReference, persistencyKey: sPersistencyKey },
				[
					{ type: "addFlexObject", updatedObject: oDefaultVariantChange },
					{ type: "removeFlexObject", updatedObject: oDefaultVariantChange }
				]
			);
			assert.equal(oClearCacheSpy.callCount, 1, "then the cache has been invalidated");
		});

		QUnit.test("when just invalid updateInfos are provided", function(assert) {
			const oUIChangeWithoutVariantReference = FlexObjectFactory.createFromFileContent({
				id: "someUIChange",
				layer: Layer.CUSTOMER
			});
			const oDataSelector = CompVariantManagementState.getSetDefaultDataSelector();
			const oClearCacheSpy = sandbox.spy(oDataSelector, "_clearCache");
			oDataSelector.checkUpdate(
				{ reference: sReference },
				[
					{ type: "justAnotherType", updatedObject: oUIChangeWithoutVariantReference },
					{ type: "anotherType" }
				]
			);
			assert.equal(oClearCacheSpy.callCount, 0, "then the cache has not been invalidated");
		});
	});

	QUnit.module("CompVariantManagementState.getDefaultVariantId", {
		async beforeEach() {
			await initializeFlexState();
		},
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when called an no default changes are stored", function(assert) {
			const sDefaultVariantId = CompVariantManagementState.getDefaultVariantId({
				persistencyKey: sPersistencyKey,
				reference: "myApp",
				variants: []
			});
			assert.equal(sDefaultVariantId, "", "then '' is returned");
		});

		QUnit.test("when called an default changes is stored with an 'undefined' key and is requested", function(assert) {
			const sDefaultVariantName = "expectedDefaultVariantName";

			const oSetDefaultChange = FlexObjectFactory.createFromFileContent({
				reference: "myApp",
				fileType: "change",
				changeType: "defaultVariant",
				selector: {
					persistencyKey: sPersistencyKey
				},
				layer: Layer.CUSTOMER,
				content: {
					defaultVariantName: sDefaultVariantName
				}
			});
			FlQUnitUtils.stubFlexObjectsSelector(sandbox, [oSetDefaultChange]);

			const sDefaultVariantId = CompVariantManagementState.getDefaultVariantId({
				persistencyKey: sPersistencyKey,
				reference: "myApp",
				variants: [{
					getVariantId: () => sDefaultVariantName
				}],
				includeUndefined: true
			});
			assert.equal(sDefaultVariantId, sDefaultVariantName, "then the key is returned");
		});
	});

	QUnit.module("CompVariantManagementState can handle changes on multiple different standard variants", {
		async beforeEach() {
			await initializeFlexState();
		},
		afterEach() {
			cleanup();
		}
	}, function() {
		QUnit.test("when changes are present for multiple different persistency keys", async function(assert) {
			const oUpdateVariantChange0 = FlexObjectFactory.createFromFileContent({
				reference: sReference,
				fileType: "change",
				changeType: "updateVariant",
				selector: {
					persistencyKey: "anotherPersistencyKey",
					variantId: "*standard*"
				},
				layer: Layer.CUSTOMER,
				content: {
					executeOnSelection: true
				}
			});

			const oChangeContent = {
				bField: {
					visible: true
				}
			};

			const oUpdateVariantChange1 = FlexObjectFactory.createFromFileContent({
				reference: sReference,
				fileType: "change",
				changeType: "updateVariant",
				selector: {
					persistencyKey: sPersistencyKey,
					variantId: "*standard*"
				},
				layer: Layer.CUSTOMER,
				content: {
					variantContent: oChangeContent
				}
			});

			FlQUnitUtils.stubFlexObjectsSelector(sandbox, [oUpdateVariantChange0, oUpdateVariantChange1]);

			const aVariants = await CompVariantManagementState.assembleVariantList({
				reference: sReference,
				persistencyKey: sPersistencyKey,
				componentId: sComponentId
			});

			assert.equal(aVariants.length, 1, "the standard variant is returned");
			assert.deepEqual(aVariants[0].getContent(), oChangeContent, "the content was updated");
			assert.equal(aVariants[0].getExecuteOnSelection(), false, "the execute on selection was NOT updated");
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});