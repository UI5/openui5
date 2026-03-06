/* global QUnit */

sap.ui.define([
	"sap/ui/fl/apply/_internal/flexObjects/FlexObjectFactory",
	"sap/ui/fl/apply/_internal/flexState/controlVariants/VariantManagementState",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/apply/api/ControlVariantApplyAPI",
	"sap/ui/fl/variants/VariantManagement",
	"sap/ui/fl/variants/VariantManager",
	"sap/ui/fl/variants/VariantModel",
	"sap/ui/fl/write/_internal/flexState/FlexObjectManager",
	"sap/ui/fl/write/api/ControlVariantWriteAPI",
	"sap/ui/fl/Layer",
	"sap/ui/thirdparty/sinon-4",
	"test-resources/sap/ui/rta/qunit/RtaQunitUtils"
], function(
	FlexObjectFactory,
	VariantManagementState,
	FlexState,
	ControlVariantApplyAPI,
	VariantManagement,
	VariantManager,
	VariantModel,
	FlexObjectManager,
	ControlVariantWriteAPI,
	Layer,
	sinon,
	RtaQunitUtils
) {
	"use strict";

	const sandbox = sinon.createSandbox();
	const sVMReference = "variantManagementId1";
	const sReference = "myFlexReference";
	const oAppComponent = RtaQunitUtils.createAndStubAppComponent(sinon, sReference);

	function createChanges(aPassedChangeIds, sReference, sLayer, sVariantReference) {
		const oChanges = (aPassedChangeIds || ["change1", "change2", "change3"]).map((sChangeId) => {
			return FlexObjectFactory.createUIChange({
				fileName: sChangeId,
				reference: sReference,
				layer: sLayer || Layer.USER,
				variantReference: sVariantReference || "variant1"
			});
		});
		return FlexObjectManager.addDirtyFlexObjects(sReference, sReference, oChanges);
	}

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

	QUnit.module("ControlVariantWriteAPI", {
		beforeEach() {
			this.oVMControl = new VariantManagement(sVMReference);
			this.oModel = new VariantModel({}, {
				appComponent: oAppComponent
			});
			oAppComponent.setModel(this.oModel, ControlVariantApplyAPI.getVariantModelName());
		},
		afterEach() {
			sandbox.restore();
			this.oVMControl.destroy();
			this.oModel.destroy();
			FlexState.clearState();
		}
	}, function() {
		QUnit.test("When getDirtyControlChangesFromVariant is called", function(assert) {
			const aControlChanges = createChanges(
				["dirtyChange1", "dirtyChange2"],
				sReference,
				Layer.CUSTOMER,
				"variant1"
			);
			const oGetDirtyControlChangesSpy = sandbox.spy(VariantManager, "getDirtyControlChangesFromVariant");

			const aResult = ControlVariantWriteAPI.getDirtyControlChangesFromVariant(aControlChanges, sReference);
			assert.deepEqual(aResult, aControlChanges, "then the correct changes are returned");
			assert.strictEqual(
				oGetDirtyControlChangesSpy.calledOnceWith(aControlChanges, sReference),
				true,
				"then VariantManager.getDirtyControlChangesFromVariant is called with correct parameters"
			);
		});

		QUnit.test("When setSavedToVariant is called with changes", function(assert) {
			const aChanges = createChanges(
				["change1", "change2"],
				sReference,
				Layer.CUSTOMER,
				"variant1"
			);
			const oVariant = createVariant({
				fileName: "variant1",
				reference: sReference,
				variantManagementReference: sVMReference,
				title: "Variant 1"
			});
			aChanges.push(oVariant);
			const oCheckUpdateStub = sandbox.stub(VariantManagementState.getVariantManagementMap(), "checkUpdate");

			ControlVariantWriteAPI.setSavedToVariant(sReference, aChanges, true);

			assert.strictEqual(
				aChanges[0].getSavedToVariant(),
				true,
				"then first change is marked as saved to variant"
			);
			assert.strictEqual(
				aChanges[1].getSavedToVariant(),
				true,
				"then second change is marked as saved to variant"
			);
			assert.strictEqual(
				oCheckUpdateStub.calledOnceWith({ reference: sReference }),
				true,
				"then variant management map is updated"
			);
		});

		QUnit.test("When addVariantChanges is called", function(assert) {
			const mPropertyBag = {
				variantManagementReference: "VMReference",
				appComponent: this.oAppComponent,
				changeContents: [],
				generatorName: RtaQunitUtils.GENERATOR_NAME
			};
			const aExpectedResult = [{ fileName: "change1" }, { fileName: "change2" }];
			const oAddVariantChangesStub = sandbox.stub(VariantManager, "addVariantChanges")
			.returns(aExpectedResult);

			const aResult = ControlVariantWriteAPI.addVariantChanges(mPropertyBag);

			assert.deepEqual(aResult, aExpectedResult, "then the correct changes are returned");
			assert.strictEqual(
				oAddVariantChangesStub.calledOnceWith(mPropertyBag),
				true,
				"then VariantManager.addVariantChanges is called with correct parameters"
			);
		});

		QUnit.test("When handleSaveEvent is called", async function(assert) {
			const mParameters = {
				name: "Test Variant",
				newVariantReference: "variant1",
				layer: Layer.USER,
				generator: RtaQunitUtils.GENERATOR_NAME,
				overwrite: false,
				contexts: [],
				def: undefined,
				deleted: undefined,
				fav: undefined,
				renamed: undefined,
				exe: undefined
			};
			const aExpectedResult = [{ fileName: "change1" }, { fileName: "change2" }];
			const oHandleSaveEventStub = sandbox.stub(VariantManager, "handleSaveEvent")
			.resolves(aExpectedResult);

			const aResult = await ControlVariantWriteAPI.handleSaveEvent(this.oVMControl, mParameters);
			assert.deepEqual(aResult, aExpectedResult, "then the correct changes are returned");
			assert.strictEqual(
				oHandleSaveEventStub.calledOnceWith(this.oVMControl, mParameters),
				true,
				"then VariantManager.handleSaveEvent is called with correct parameters"
			);
		});

		QUnit.test("When handleManageViewDialogExecution is called", async function(assert) {
			const mPropertyBag = {
				variantManagementReference: "vmRef",
				appComponent: oAppComponent,
				changeContents: [],
				vmControl: this.oVMControl,
				newDefaultVariantReferenceParameter: "newDefVarRef",
				generatorName: RtaQunitUtils.GENERATOR_NAME,
				variantsToBeDeleted: []
			};
			const aExpectedResult = ["oldRef", ["createdChanges"], ["deletedFlexObjects"]];
			const oHandleVariantConfigStub = sandbox.stub(VariantManager, "handleManageViewDialogExecution")
			.resolves(aExpectedResult);

			const aResult = await ControlVariantWriteAPI.handleManageViewDialogExecution(mPropertyBag);
			assert.deepEqual(aResult, aExpectedResult, "then the correct result is returned");
			assert.strictEqual(
				oHandleVariantConfigStub.calledOnceWith(mPropertyBag),
				true,
				"then VariantManager.handleManageViewDialogExecution is called with correct parameters"
			);
		});

		QUnit.test("When removeVariant is called", function(assert) {
			const mPropertyBag = {
				variantManagementReference: sVMReference,
				appComponent: oAppComponent,
				variant: { fileName: "variant1" },
				sourceVariantReference: "variant0",
				vmControl: this.oVMControl
			};
			const oRemoveVariantStub = sandbox.stub(VariantManager, "removeVariant");

			ControlVariantWriteAPI.removeVariant(mPropertyBag);

			assert.strictEqual(
				oRemoveVariantStub.calledOnceWith(mPropertyBag),
				true,
				"then VariantManager.removeVariant is called with correct parameters"
			);
		});

		QUnit.test("When deleteVariantChange is called", function(assert) {
			const mPropertyBag = {
				appComponent: oAppComponent
			};
			const oChange = createChanges(["change1"], sReference)[0];
			const oVariant = createVariant({
				fileName: "variant1",
				reference: sReference,
				variantManagementReference: sVMReference,
				title: "Variant 1"
			});
			this.oModel = new VariantModel({}, {
				appComponent: oAppComponent
			});
			sandbox.stub(this.oModel, "setVariantProperties").returns(oVariant);
			oAppComponent.setModel(this.oModel, ControlVariantApplyAPI.getVariantModelName());
			const oDeleteFlexObjectsStub = sandbox.stub(FlexObjectManager, "deleteFlexObjects");

			ControlVariantWriteAPI.deleteVariantChange(sVMReference, mPropertyBag, oChange);

			assert.strictEqual(
				this.oModel.setVariantProperties.calledOnceWith(sVMReference, mPropertyBag),
				true,
				"then variant properties are set"
			);
			assert.strictEqual(
				oDeleteFlexObjectsStub.calledOnceWith({
					reference: sReference,
					flexObjects: [oChange],
					componentId: "myFlexReference"
				}),
				true,
				"then change is deleted"
			);
		});

		QUnit.test("When deleteVariantChange is called without variant model", function(assert) {
			const mPropertyBag = {
				appComponent: oAppComponent
			};
			const oChange = { fileName: "change1" };
			sandbox.stub(oAppComponent, "getModel").returns(null);

			assert.throws(function() {
				ControlVariantWriteAPI.deleteVariantChange(sVMReference, mPropertyBag, oChange);
			}, "then an error is thrown when variant model is not available");
		});

		QUnit.test("When eraseDirtyChangesOnVariant is called", async function(assert) {
			const aDummyChanges = createChanges(["dummyChange1", "dummyChange2"], sReference, Layer.CUSTOMER, "variant1");
			const oEraseDirtyChangesStub = sandbox.stub(VariantManager, "eraseDirtyChangesOnVariant")
			.resolves(aDummyChanges);

			const aResult = await ControlVariantWriteAPI.eraseDirtyChangesOnVariant({
				variantManagementReference: sVMReference,
				variantReference: "variant1",
				control: this.oVMControl,
				revert: true
			});
			assert.deepEqual(aResult, aDummyChanges, "then the correct changes are returned");
			assert.strictEqual(
				oEraseDirtyChangesStub.calledOnceWith({
					variantManagementReference: sVMReference,
					variantReference: "variant1",
					control: this.oVMControl,
					revert: true
				}),
				true,
				"then VariantManager.eraseDirtyChangesOnVariant is called with correct parameters"
			);
		});

		QUnit.test("When addAndApplyControlChangesOnVariant is called", async function(assert) {
			const aChanges = createChanges(["change1", "change2"], sReference);
			const oAddAndApplyStub = sandbox.stub(VariantManager, "addAndApplyControlChangesOnVariant")
			.resolves();

			await ControlVariantWriteAPI.addAndApplyControlChangesOnVariant(aChanges, this.oVMControl);
			assert.strictEqual(
				oAddAndApplyStub.calledOnceWith(aChanges, this.oVMControl),
				true,
				"then VariantManager.addAndApplyControlChangesOnVariant is called with correct parameters"
			);
			aChanges.forEach((oChange) => { oChange.destroy(); });
		});

		QUnit.test("When openManageVariantsDialog is called", async function(assert) {
			const sLayer = Layer.CUSTOMER;
			const sClass = "sapUiSizeCompact";
			const oContextSharingPromise = Promise.resolve();
			const oopenManageVariantsDialogStub = sandbox.stub(VariantManager, "openManageVariantsDialog")
			.resolves();

			await ControlVariantWriteAPI.openManageVariantsDialog({
				variantManagementControl: this.oVMControl,
				layer: sLayer,
				styleClass: sClass,
				contextSharingComponentPromise: oContextSharingPromise
			});
			assert.strictEqual(
				oopenManageVariantsDialogStub.calledOnceWith({
					variantManagementControl: this.oVMControl,
					layer: sLayer,
					styleClass: sClass,
					contextSharingComponentPromise: oContextSharingPromise
				}),
				true,
				"then VariantManager.openManageVariantsDialog is called with correct parameters"
			);
		});

		QUnit.test("When getControlChangesForVariant is called", function(assert) {
			const aExpectedChanges = [{ fileName: "change1" }, { fileName: "change2" }];
			const oGetVariantStub = sandbox.stub(VariantManagementState, "getVariant")
			.returns({ controlChanges: aExpectedChanges });

			const aResult = ControlVariantWriteAPI.getControlChangesForVariant(sReference, sVMReference, "variant1");

			assert.deepEqual(aResult, aExpectedChanges, "then the correct control changes are returned");
			assert.strictEqual(
				oGetVariantStub.calledOnceWith({
					reference: sReference,
					vmReference: sVMReference,
					vReference: "variant1"
				}),
				true,
				"then VariantManagementState.getVariant is called with correct parameters"
			);
		});
	});

	QUnit.done(function() {
		oAppComponent._restoreGetAppComponentStub();
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
