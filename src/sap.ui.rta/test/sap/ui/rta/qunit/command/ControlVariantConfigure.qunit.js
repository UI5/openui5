/* global QUnit */

sap.ui.define([
	"sap/base/util/restricted/_omit",
	"sap/ui/fl/apply/api/ControlVariantApplyAPI",
	"sap/ui/fl/variants/VariantManagement",
	"sap/ui/fl/write/api/ControlVariantWriteAPI",
	"sap/ui/fl/write/api/ChangesWriteAPI",
	"sap/ui/fl/Layer",
	"sap/ui/rta/command/CommandFactory",
	"sap/ui/rta/library",
	"sap/ui/thirdparty/sinon-4",
	"test-resources/sap/ui/rta/qunit/RtaQunitUtils"
], function(
	_omit,
	ControlVariantApplyAPI,
	VariantManagement,
	ControlVariantWriteAPI,
	ChangesWriteAPI,
	Layer,
	CommandFactory,
	rtaLibrary,
	sinon,
	RtaQunitUtils
) {
	"use strict";

	const sandbox = sinon.createSandbox();
	const sReference = "myFlexReference";
	const oMockedAppComponent = RtaQunitUtils.createAndStubAppComponent(sinon, sReference);

	QUnit.module("ControlVariantConfigure, when calling command factory for configure and undo", {
		beforeEach() {
			this.oVariantManagement = new VariantManagement("variantMgmtId1");
			sandbox.stub(this.oVariantManagement, "getCurrentVariantReference").returns("variant1");
			this.oDeleteVariantChangeStub = sandbox.stub(ControlVariantWriteAPI, "deleteVariantChange");
			this.oActivateVariantStub = sandbox.stub(ControlVariantApplyAPI, "activateVariant").resolves();
		},
		afterEach() {
			this.oVariantManagement.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("with setTitle, setFavorite, setVisible and setDefault changes", async function(assert) {
			const oTitleChange = {
				changeType: "setTitle",
				layer: Layer.CUSTOMER,
				originalTitle: "variant A",
				title: "test",
				variantReference: "variant0",
				generator: rtaLibrary.GENERATOR_NAME
			};
			const oTitleUndoChange = {
				...oTitleChange,
				generator: rtaLibrary.GENERATOR_NAME,
				originalTitle: "test",
				title: "variant A"
			};
			const oFavoriteChange = {
				changeType: "setFavorite",
				favorite: false,
				layer: Layer.CUSTOMER,
				originalFavorite: true,
				variantReference: "variant0",
				generator: rtaLibrary.GENERATOR_NAME
			};
			const oFavoriteUndoChange = {
				...oFavoriteChange,
				generator: rtaLibrary.GENERATOR_NAME,
				originalFavorite: false,
				favorite: true
			};
			const oVisibleChange = {
				changeType: "setVisible",
				layer: Layer.CUSTOMER,
				variantReference: "variant0",
				visible: false,
				generator: rtaLibrary.GENERATOR_NAME
			};
			const oVisibleUndoChange = { ...oVisibleChange, generator: rtaLibrary.GENERATOR_NAME, visible: true };
			const oContextsChange = {
				changeType: "setContexts",
				layer: Layer.CUSTOMER,
				variantReference: "variant0",
				contexts: { role: ["ROLE1", "ROLE2"], country: ["DE", "IT"] },
				originalContexts: { role: ["OGROLE1", "OGROLE2"], country: ["OR"] },
				generator: rtaLibrary.GENERATOR_NAME
			};
			const oContextsUndoChange = {
				...oContextsChange,
				generator: rtaLibrary.GENERATOR_NAME,
				originalContexts: { role: ["ROLE1", "ROLE2"], country: ["DE", "IT"] },
				contexts: { role: ["OGROLE1", "OGROLE2"], country: ["OR"] }
			};
			const oDefaultChange = {
				changeType: "setDefault",
				defaultVariant: "variantMgmtId1",
				layer: Layer.CUSTOMER,
				originalDefaultVariant: "variant0",
				variantManagementReference: "variantMgmtId1",
				generator: rtaLibrary.GENERATOR_NAME
			};
			const oDefaultUndoChange = {
				...oDefaultChange,
				generator: rtaLibrary.GENERATOR_NAME,
				originalDefaultVariant: "variantMgmtId1",
				defaultVariant: "variant0"
			};
			const aChanges = [oTitleChange, oFavoriteChange, oVisibleChange, oContextsChange, oDefaultChange];

			const aDummyDeletedFlexObjects = ["deletedFlexObject1", "deletedFlexObject2"];
			const aDeletedVariants = ["variant0"];
			this.oHandleVariantConfigExecuteStub = sandbox.stub(ControlVariantWriteAPI, "handleManageViewDialogExecution")
			.resolves([
				aChanges, aDummyDeletedFlexObjects, null
			]);

			const oRestoreDeletedFlexObjectsStub = sandbox.stub(ControlVariantWriteAPI, "restoreDeletedFlexObjects");

			const oConfigureCommand = await CommandFactory.getCommandFor(this.oVariantManagement, "configure", {
				control: this.oVariantManagement,
				changes: aChanges,
				deletedVariants: aDeletedVariants
			}, {}, { layer: Layer.CUSTOMER });

			await oConfigureCommand.execute();

			assert.strictEqual(this.oHandleVariantConfigExecuteStub.callCount, 1, "handleManageViewDialogExecution got called once");
			const aPreparedChanges = oConfigureCommand.getPreparedChange();
			assert.deepEqual(aPreparedChanges, aChanges, "all changes are saved in the command");
			assert.strictEqual(
				this.oHandleVariantConfigExecuteStub.calledWith({
					vmReference: "variantMgmtId1",
					appComponent: oMockedAppComponent,
					changeContents: aChanges,
					vmControl: this.oVariantManagement,
					newDefaultVariantReferenceParameter: undefined,
					generatorName: rtaLibrary.GENERATOR_NAME,
					variantsToBeDeleted: aDeletedVariants,
					layer: Layer.CUSTOMER
				}),
				true,
				"handleManageViewDialogExecution was called with correct parameters"
			);

			assert.deepEqual(
				oConfigureCommand._aDeletedFlexObjects,
				aDummyDeletedFlexObjects,
				"the deleted flex objects are saved in the command"
			);

			await oConfigureCommand.undo();
			assert.ok(
				oRestoreDeletedFlexObjectsStub.calledWith({
					reference: sReference,
					componentId: "myFlexReference",
					flexObjects: aDummyDeletedFlexObjects
				}),
				"the flex objects got restored"
			);
			assert.strictEqual(this.oDeleteVariantChangeStub.callCount, 5, "all changes got removed");
			assert.deepEqual(
				_omit(this.oDeleteVariantChangeStub.getCall(0).args[1], "appComponent"), oTitleUndoChange,
				"the change was correctly removed"
			);
			assert.deepEqual(
				_omit(this.oDeleteVariantChangeStub.getCall(1).args[1], "appComponent"), oFavoriteUndoChange,
				"the change was correctly removed"
			);
			assert.deepEqual(
				_omit(this.oDeleteVariantChangeStub.getCall(2).args[1], "appComponent"), oVisibleUndoChange,
				"the change was correctly removed"
			);
			assert.deepEqual(
				_omit(this.oDeleteVariantChangeStub.getCall(3).args[1], "appComponent"), oContextsUndoChange,
				"the change was correctly removed"
			);
			assert.deepEqual(
				_omit(this.oDeleteVariantChangeStub.getCall(4).args[1], "appComponent"), oDefaultUndoChange,
				"the change was correctly removed"
			);
			assert.notOk(oConfigureCommand.getPreparedChange(), "the prepared changes got removed");
			assert.strictEqual(this.oActivateVariantStub.callCount, 0, "the variant was not switched");
		});

		QUnit.test("with deleting the current variant", async function(assert) {
			const oVisibleChange = {
				changeType: "setVisible",
				layer: Layer.CUSTOMER,
				variantReference: "variant1",
				visible: false
			};

			this.oHandleVariantConfigExecuteStub = sandbox.stub(ControlVariantWriteAPI, "handleManageViewDialogExecution")
			.resolves([
				oVisibleChange, ["variant1"], "variant1"
			]);

			const oConfigureCommand = await CommandFactory.getCommandFor(this.oVariantManagement, "configure", {
				control: this.oVariantManagement,
				changes: [oVisibleChange],
				deletedVariants: ["variant1"]
			}, {}, { layer: Layer.CUSTOMER });

			sandbox.stub(ControlVariantWriteAPI, "restoreDeletedFlexObjects");
			await oConfigureCommand.execute();

			assert.strictEqual(
				this.oHandleVariantConfigExecuteStub.calledWith({
					vmReference: "variantMgmtId1",
					appComponent: oMockedAppComponent,
					changeContents: [oVisibleChange],
					vmControl: this.oVariantManagement,
					newDefaultVariantReferenceParameter: undefined,
					generatorName: rtaLibrary.GENERATOR_NAME,
					variantsToBeDeleted: ["variant1"],
					layer: Layer.CUSTOMER
				}),
				true,
				"handleManageViewDialogExecution was called with correct parameters"
			);

			await oConfigureCommand.undo();

			assert.strictEqual(this.oDeleteVariantChangeStub.callCount, 1, "all changes got removed");
			assert.strictEqual(this.oActivateVariantStub.callCount, 1, "the variant was switched after undo");
			assert.deepEqual(this.oActivateVariantStub.lastCall.args[0], {
				element: this.oVariantManagement,
				variantReference: "variant1"
			}, "the correct variant was switched to");
		});
	});

	QUnit.done(function() {
		oMockedAppComponent.destroy();
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
