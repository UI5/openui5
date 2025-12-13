
/* global QUnit */

sap.ui.define([
	"sap/base/util/Deferred",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/fl/apply/_internal/changes/Applier",
	"sap/ui/fl/apply/_internal/changes/Reverter",
	"sap/ui/fl/apply/_internal/controlVariants/Utils",
	"sap/ui/fl/apply/_internal/flexObjects/FlexObjectFactory",
	"sap/ui/fl/apply/_internal/flexObjects/States",
	"sap/ui/fl/apply/_internal/flexState/changes/DependencyHandler",
	"sap/ui/fl/apply/_internal/flexState/controlVariants/VariantManagementState",
	"sap/ui/fl/apply/_internal/flexState/controlVariants/VariantManagerApply",
	"sap/ui/fl/apply/_internal/flexState/FlexObjectState",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/apply/api/ControlVariantApplyAPI",
	"sap/ui/fl/variants/VariantManagement",
	"sap/ui/fl/variants/VariantManager",
	"sap/ui/fl/variants/VariantModel",
	"sap/ui/fl/Layer",
	"sap/ui/thirdparty/sinon-4",
	"test-resources/sap/ui/fl/qunit/FlQUnitUtils",
	"test-resources/sap/ui/rta/qunit/RtaQunitUtils"
], function(
	Deferred,
	JsControlTreeModifier,
	Applier,
	Reverter,
	VariantUtil,
	FlexObjectFactory,
	States,
	DependencyHandler,
	VariantManagementState,
	VariantManagerApply,
	FlexObjectState,
	FlexState,
	ControlVariantApplyAPI,
	VariantManagement,
	VariantManager,
	VariantModel,
	Layer,
	sinon,
	FlQUnitUtils,
	RtaQunitUtils
) {
	"use strict";

	const sandbox = sinon.createSandbox();
	const sVMReference = "variantManagementId1";
	const sReference = "myFlexReference";
	const oComponent = RtaQunitUtils.createAndStubAppComponent(sinon, sReference);

	function createVariant(mVariantProperties) {
		return FlexObjectFactory.createFlVariant({
			id: mVariantProperties.fileName || mVariantProperties.key,
			reference: mVariantProperties.reference || sReference,
			layer: mVariantProperties.layer,
			user: mVariantProperties.author,
			variantReference: mVariantProperties.variantReference,
			variantManagementReference: mVariantProperties.variantManagementReference || sVMReference,
			variantName: mVariantProperties.title,
			contexts: mVariantProperties.contexts
		});
	}

	QUnit.module("VariantManagerApply", {
		async beforeEach() {
			this.oVariant1 = createVariant({
				author: "SAP",
				key: sVMReference,
				layer: Layer.BASE,
				title: "Standard variant",
				variantManagementReference: sVMReference
			});
			this.oVariant2 = createVariant({
				author: "Me",
				key: "variant2",
				layer: Layer.USER,
				title: "User variant",
				variantManagementReference: sVMReference,
				variantReference: sVMReference
			});
			this.oVariant3 = createVariant({
				author: "Me",
				key: "variant3",
				layer: Layer.USER,
				title: "Another user variant",
				variantManagementReference: sVMReference
			});

			this.oSharedFlexObjectStandardV2 = FlexObjectFactory.createFromFileContent({
				fileName: "change1",
				variantReference: sVMReference,
				layer: Layer.CUSTOMER
			});
			this.oSecondSharedFlexObjectStandardV2 = FlexObjectFactory.createFromFileContent({
				fileName: "change2",
				variantReference: sVMReference,
				layer: Layer.CUSTOMER
			});
			this.oUniqueFlexObjectV2 = FlexObjectFactory.createFromFileContent({
				fileName: "change3",
				 variantReference: "variant2",
				 layer: Layer.USER
			});
			this.oUniqueFlexObjectV3 = FlexObjectFactory.createFromFileContent({
				fileName: "change4",
				variantReference: "variant3",
				layer: Layer.USER
			});

			this.oFlexObjectsSelectorStub = FlQUnitUtils.stubFlexObjectsSelector(sandbox, [
				this.oVariant1,
				this.oVariant2,
				this.oVariant3,
				this.oSharedFlexObjectStandardV2,
				this.oSecondSharedFlexObjectStandardV2,
				this.oUniqueFlexObjectV2,
				this.oUniqueFlexObjectV3
			]);

			this.oRevertStub = sandbox.stub(Reverter, "revertMultipleChanges").resolves();
			this.oApplyStub = sandbox.stub(Applier, "applyMultipleChanges").resolves();
			this.oAddRuntimeChangeToMapSpy = sandbox.spy(DependencyHandler, "addRuntimeChangeToMap");
			this.oSetCurrentVariantSpy = sandbox.spy(VariantManagementState, "setCurrentVariant");
			this.oSetVariantSwitchPromiseSpy = sandbox.spy(VariantManagementState, "setVariantSwitchPromise");

			this.oVMControl = new VariantManagement(sVMReference);
			this.oCallVariantSwitchListenersSpy = sandbox.spy(this.oVMControl, "_executeAllVariantAppliedListeners");
			this.oModel = new VariantModel({}, {
				appComponent: oComponent
			});
			oComponent.setModel(this.oModel, ControlVariantApplyAPI.getVariantModelName());
			await FlexState.initialize({
				reference: sReference,
				componentId: sReference
			});
			await this.oModel.initialize();

			this.mPropertyBag = {
				reference: sReference,
				appComponent: oComponent,
				vmReference: sVMReference,
				modifier: JsControlTreeModifier,
				currentVReference: sVMReference
			};
		},
		afterEach() {
			this.oVMControl.destroy();
			this.oModel.destroy();
			FlexState.clearState();
			FlexState.clearRuntimeSteadyObjects(sReference, sReference);
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when switching to an inheriting variant (standard -> variant2)", async function(assert) {
			await VariantManagerApply.updateCurrentVariant({
				vmControl: this.oVMControl,
				newVariantReference: "variant2",
				appComponent: oComponent
			});

			assert.ok(
				this.oRevertStub.notCalled,
				"then no revert of changes was triggered, as there are no unique changes on standard variant"
			);

			assert.deepEqual(
				this.oApplyStub.getCall(0).args,
				[
					[this.oUniqueFlexObjectV2],
					{ ...this.mPropertyBag, newVReference: "variant2", skipSetQueued: true }
				],
				"then apply of changes was correctly triggered, only for the unique changes"
			);

			assert.ok(
				this.oUniqueFlexObjectV2.isQueuedForApply(),
				"then the unique change was set to queued for apply"
			);
			assert.deepEqual(
				this.oSetCurrentVariantSpy.getCall(0).args,
				[{ ...this.mPropertyBag, newVReference: "variant2" }],
				"then setting current variant was correctly triggered"
			);
			assert.deepEqual(
				this.oAddRuntimeChangeToMapSpy.getCall(0).args,
				[this.oUniqueFlexObjectV2, oComponent, FlexObjectState.getLiveDependencyMap(sReference)],
				"then the change to be applied was added to the dependency map"
			);
			assert.ok(
				this.oSetVariantSwitchPromiseSpy.calledBefore(this.oApplyStub),
				"then the switch variant promise was set before changes were applied"
			);
			assert.strictEqual(this.oCallVariantSwitchListenersSpy.callCount, 1, "then the listeners were called");
		});

		QUnit.test("when switching to a variant with no shared changes (standard -> variant3)", async function(assert) {
			await VariantManagerApply.updateCurrentVariant({
				vmControl: this.oVMControl,
				newVariantReference: "variant3"
				// no app component as parameter - test appComponent retrieval from VMControl
			});

			assert.deepEqual(
				Reverter.revertMultipleChanges.getCall(0).args,
				[
					[this.oSecondSharedFlexObjectStandardV2, this.oSharedFlexObjectStandardV2],
					{ ...this.mPropertyBag, newVReference: "variant3", skipSetQueued: true }
				],
				"then revert of changes was correctly triggered"
			);
			assert.ok(
				this.oSecondSharedFlexObjectStandardV2.isQueuedForRevert(),
				"then the first shared change was set to queued for revert"
			);
			assert.ok(
				this.oSharedFlexObjectStandardV2.isQueuedForRevert(),
				"then the second shared change was set to queued for revert"
			);
			assert.strictEqual(
				this.oApplyStub.getCall(0).args[0][0],
				this.oUniqueFlexObjectV3,
				"then apply of changes was correctly triggered"
			);
			assert.ok(
				this.oUniqueFlexObjectV3.isQueuedForApply(),
				"then the unique change was set to queued for apply"
			);
			assert.deepEqual(
				this.oSetCurrentVariantSpy.getCall(0).args,
				[{ ...this.mPropertyBag, newVReference: "variant3" }],
				"then setting current variant was correctly triggered"
			);
			assert.deepEqual(
				this.oAddRuntimeChangeToMapSpy.getCall(0).args,
				[this.oUniqueFlexObjectV3, oComponent, FlexObjectState.getLiveDependencyMap(sReference)],
				"then the change to be applied was added to the dependency map"
			);
			assert.ok(
				this.oSetVariantSwitchPromiseSpy.calledBefore(this.oRevertStub),
				"then the switch variant promise was set before changes were reverted"
			);
			assert.strictEqual(this.oCallVariantSwitchListenersSpy.callCount, 1, "then the listeners were called");
		});

		QUnit.test("when calling 'updateCurrentVariant' twice without waiting for the apply to be finished", async function(assert) {
			const oApplyDeferred = new Deferred();
			this.oApplyStub.onFirstCall().returns(oApplyDeferred.promise);

			// first call - standard -> variant2
			VariantManagerApply.updateCurrentVariant({
				variantManagementReference: sVMReference,
				newVariantReference: "variant2",
				appComponent: oComponent,
				vmControl: this.oVMControl
			});

			// second call - variant2 -> standard
			VariantManagerApply.updateCurrentVariant({
				variantManagementReference: sVMReference,
				newVariantReference: sVMReference,
				appComponent: oComponent,
				vmControl: this.oVMControl
			});

			oApplyDeferred.resolve();
			await VariantManagementState.waitForVariantSwitch(sReference, sVMReference);

			assert.strictEqual(this.oApplyStub.callCount, 1, "then Apply Changes was called twice");
			assert.strictEqual(this.oRevertStub.callCount, 1, "then Revert Changes was called once");
			assert.strictEqual(
				this.oSetVariantSwitchPromiseSpy.callCount,
				2,
				"then the variant switch promise was set twice"
			);
			assert.strictEqual(this.oCallVariantSwitchListenersSpy.callCount, 2, "then the listeners were called twice");
		});

		QUnit.test("when calling 'updateCurrentVariant' twice without waiting, and the first apply fails", async function(assert) {
			let bRejected = false;

			const oApplyDeferred = new Deferred();
			this.oApplyStub.onFirstCall().returns(oApplyDeferred.promise);

			// first call - standard -> variant2
			VariantManagerApply.updateCurrentVariant({
				variantManagementReference: sVMReference,
				newVariantReference: "variant2",
				appComponent: oComponent,
				vmControl: this.oVMControl
			})
			.catch(function() {
				bRejected = true;
			});

			// second call - standard -> variant3
			VariantManagerApply.updateCurrentVariant({
				variantManagementReference: sVMReference,
				newVariantReference: "variant3",
				appComponent: oComponent,
				vmControl: this.oVMControl
			});

			oApplyDeferred.reject();
			await VariantManagementState.waitForVariantSwitch(sReference, sVMReference);

			assert.strictEqual(this.oApplyStub.callCount, 2, "then Apply Changes was called twice (one failed)");
			assert.strictEqual(this.oRevertStub.callCount, 1, "then Revert Changes was called once");
			assert.ok(bRejected, "then the first promise was rejected");
			assert.strictEqual(
				this.oSetVariantSwitchPromiseSpy.callCount,
				2,
				"then the variant switch promise was set twice"
			);
			assert.strictEqual(this.oCallVariantSwitchListenersSpy.callCount, 1, "then the listeners were called once");
		});

		QUnit.test("when switching to a variant with parameter 'scenario' set", async function(assert) {
			await VariantManagerApply.updateCurrentVariant({
				vmControl: this.oVMControl,
				newVariantReference: "variant2",
				appComponent: oComponent,
				scenario: "testScenario"
			});

			assert.strictEqual(
				this.oCallVariantSwitchListenersSpy.firstCall.args[0].createScenario,
				"testScenario",
				"then the 'createScenario' parameter was set for the variant switch listeners"
			);
		});

		QUnit.test("when calling 'updateCurrentVariant' in between setToModel calls", async function(assert) {
			const sVMReference2 = "varMgmtRef2";
			const sVMReference3 = "varMgmtRef3";
			const oUIChange1 = FlexObjectFactory.createUIChange({
				id: "someUIChange",
				selector: {
					id: "someControlId"
				},
				layer: Layer.CUSTOMER,
				variantReference: sVMReference
			});
			oUIChange1.setState(States.LifecycleState.PERSISTED);
			oUIChange1.markSuccessful("result");
			const oUIChange2 = FlexObjectFactory.createUIChange({
				id: "someUIChange2",
				selector: {
					id: "someControlId"
				},
				layer: Layer.CUSTOMER,
				variantReference: sVMReference2
			});
			oUIChange2.setState(States.LifecycleState.PERSISTED);
			oUIChange2.markSuccessful("result");
			const oUIChange3 = FlexObjectFactory.createUIChange({
				id: "someUIChange3",
				selector: {
					id: "someControlId"
				},
				layer: Layer.CUSTOMER,
				variantReference: "variant0"
			});
			oUIChange3.setState(States.LifecycleState.PERSISTED);
			oUIChange3.markSuccessful("result");
			this.oFlexObjectsSelectorStub.restore();
			this.oFlexObjectsSelectorStub = FlQUnitUtils.stubFlexObjectsSelector(sandbox, [
				createVariant({
					author: VariantUtil.DEFAULT_AUTHOR,
					key: sVMReference,
					layer: Layer.VENDOR,
					title: "Standard",
					contexts: {},
					variantManagementReference: sVMReference
				}),
				createVariant({
					author: "Me",
					key: sVMReference2,
					layer: Layer.CUSTOMER,
					title: "Standard",
					variantManagementReference: sVMReference2
				}),
				createVariant({
					author: "Me",
					key: "variant0",
					layer: Layer.CUSTOMER,
					title: "variant A",
					variantManagementReference: sVMReference2
				}),
				oUIChange1, oUIChange2, oUIChange3
			]);

			this.oVMControl.setModel(this.oModel, ControlVariantApplyAPI.getVariantModelName());

			const oVariantManagement2 = new VariantManagement(sVMReference2);
			oVariantManagement2.setModel(this.oModel, ControlVariantApplyAPI.getVariantModelName());

			await oVariantManagement2.waitForInit();
			await VariantManagerApply.updateCurrentVariant({
				variantManagementReference: sVMReference2,
				newVariantReference: "variant0",
				appComponent: this.oModel.oAppComponent,
				vmControl: oVariantManagement2
			});

			const oVariantManagement3 = new VariantManagement(sVMReference3);
			oVariantManagement3.setModel(this.oModel, ControlVariantApplyAPI.getVariantModelName());

			await VariantManagementState.waitForAllVariantSwitches(sReference);
			assert.ok(true, "the variant switch promise was resolved");
			oVariantManagement2.destroy();
			oVariantManagement3.destroy();
		});

		QUnit.test("when calling 'updateCurrentVariant' with a currently selected variant", async function(assert) {
			await VariantManagerApply.updateCurrentVariant({
				variantManagementReference: sVMReference,
				newVariantReference: sVMReference,
				appComponent: oComponent,
				vmControl: this.oVMControl
			});
			assert.strictEqual(this.oCallVariantSwitchListenersSpy.callCount, 1, "then the listeners were called");
			assert.strictEqual(this.oSetCurrentVariantSpy.callCount, 0, "then setting current variant was not triggered");
			assert.strictEqual(this.oRevertStub.callCount, 0, "then no revert of changes was triggered");
			assert.strictEqual(this.oApplyStub.callCount, 0, "then no apply of changes was triggered");
		});

		QUnit.test("when 'handleSelectVariant' is called", async function(assert) {
			const oExecuteAfterSwitchSpy = sandbox.spy(VariantManagerApply, "executeAfterSwitch");
			const oEvent = {
				getParameter(sParam) {
					if (sParam === "key") {
						return "variant2";
					}
					return null;
				}
			};

			await VariantManagerApply.handleSelectVariant(oEvent, this.oVMControl);

			assert.deepEqual(
				this.oSetCurrentVariantSpy.getCall(0).args,
				[{ ...this.mPropertyBag, newVReference: "variant2" }],
				"then setting current variant was correctly triggered"
			);
			assert.deepEqual(
				this.oApplyStub.getCall(0).args,
				[
					[this.oUniqueFlexObjectV2],
					{ ...this.mPropertyBag, newVReference: "variant2", skipSetQueued: true }
				],
				"then apply of changes was correctly triggered"
			);

			assert.ok(
				oExecuteAfterSwitchSpy.notCalled,
				"then 'executeAfterSwitch' was not called"
			);
		});

		QUnit.test("when 'handleSelectVariant' is called for the already selected variant", async function(assert) {
			const sSelectedVariantKey = "variant2";
			sandbox.stub(this.oVMControl, "getCurrentVariantReference").returns(sSelectedVariantKey);
			const oUpdateCurrentVariantSpy = sandbox.spy(VariantManagerApply, "updateCurrentVariant");
			const oEvent = {
				getParameter(sParam) {
					if (sParam === "key") {
						return sSelectedVariantKey;
					}
					return null;
				}
			};

			await VariantManagerApply.handleSelectVariant(oEvent, this.oVMControl);

			assert.strictEqual(oUpdateCurrentVariantSpy.callCount, 1, "then 'updateCurrentVariant' was called");
			assert.strictEqual(this.oSetCurrentVariantSpy.callCount, 0, "then setting current variant was not triggered");

			assert.strictEqual(
				this.oCallVariantSwitchListenersSpy.firstCall.args[0].key,
				sSelectedVariantKey,
				"then the listeners were called for the correct variant"
			);
		});

		QUnit.test("when 'handleSelectVariant' is called and there are dirty changes", async function(assert) {
			const sNewVariantKey = "variant3";
			sandbox.stub(this.oVMControl, "getModified").returns(true);
			const oEraseDirtyChangesOnVariantStub = sandbox.stub(VariantManager, "eraseDirtyChangesOnVariant").resolves();
			const oEvent = {
				getParameter(sParam) {
					if (sParam === "key") {
						return sNewVariantKey;
					}
					return null;
				}
			};
			await VariantManagerApply.handleSelectVariant(oEvent, this.oVMControl);

			assert.deepEqual(
				oEraseDirtyChangesOnVariantStub.getCall(0).args,
				[sVMReference, sVMReference, this.oVMControl, false],
				"differente variant: dirty changes were erased before switching the variant, no revert needed"
			);

			await VariantManagerApply.handleSelectVariant(oEvent, this.oVMControl);

			assert.deepEqual(
				oEraseDirtyChangesOnVariantStub.getCall(1).args,
				[sVMReference, sNewVariantKey, this.oVMControl, true],
				"same variant: dirty changes were erased before switching the variant, revert needed"
			);
		});
	});

	QUnit.done(function() {
		oComponent._restoreGetAppComponentStub();
		document.getElementById("qunit-fixture").style.display = "none";
	});
});