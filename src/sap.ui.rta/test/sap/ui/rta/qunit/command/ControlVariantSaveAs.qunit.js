/* global QUnit */

sap.ui.define([
	"sap/ui/fl/apply/_internal/flexObjects/FlVariant",
	"sap/ui/fl/variants/VariantManagement",
	"sap/ui/fl/variants/VariantManager",
	"sap/ui/fl/write/api/ContextSharingAPI",
	"sap/ui/fl/Layer",
	"sap/ui/rta/command/CommandFactory",
	"sap/ui/rta/library",
	"sap/ui/rta/Utils",
	"sap/ui/thirdparty/sinon-4",
	"test-resources/sap/ui/rta/qunit/RtaQunitUtils"
], function(
	FlVariant,
	VariantManagement,
	VariantManager,
	ContextSharingAPI,
	Layer,
	CommandFactory,
	rtaLibrary,
	Utils,
	sinon,
	RtaQunitUtils
) {
	"use strict";

	const sandbox = sinon.createSandbox();
	const oMockedAppComponent = RtaQunitUtils.createAndStubAppComponent(sinon, "Dummy");

	QUnit.module("FlVariant Save as", {
		beforeEach() {
			this.oHandleSaveStub = sandbox.stub(VariantManager, "handleSaveEvent");
			this.oVariantManagement = new VariantManagement("variantMgmtId1");
			sandbox.spy(this.oVariantManagement, "detachCancel");
			sandbox.spy(this.oVariantManagement, "detachSave");
			sandbox.stub(Utils, "getRtaStyleClassName").returns("myRtaStyleClass");
			this.oOpenDialogStub = sandbox.stub(this.oVariantManagement, "openSaveAsDialogForKeyUser");
		},
		afterEach() {
			this.oVariantManagement.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("execute and undo", async function(assert) {
			const mFlexSettings = {layer: Layer.CUSTOMER};
			const oSourceVariantReference = "mySourceReference";
			sandbox.stub(this.oVariantManagement, "getDefaultVariantKey").returns("variantMgmtId1");
			const oCreateComponentStub = sandbox.stub(ContextSharingAPI, "createComponent").returns("myContextSharing");
			this.oOpenDialogStub.callsFake(function(sStyleClass, oContextSharing) {
				assert.strictEqual(sStyleClass, "myRtaStyleClass", "the style class was passed");
				assert.strictEqual(oContextSharing, "myContextSharing", "the context sharing component was passed");
				const oArgs = oCreateComponentStub.getCall(0).args[0];
				assert.equal(oArgs.layer, Layer.CUSTOMER, "then the correct layer is used");
				assert.ok(oArgs.variantManagementControl, "then the correct control is used");
				this.oVariantManagement.fireSave({
					name: "newName",
					overwrite: false,
					key: "newKey"
				});
			}.bind(this));
			const aChanges = [
				new FlVariant("foo", {flexObjectMetadata: {reference: "myReference"}}),
				RtaQunitUtils.createUIChange({
					fileName: "change1",
					reference: "Dummy",
					variantReference: "variantMgmtId1",
					fileType: "change"
				}),
				RtaQunitUtils.createUIChange({
					fileName: "change2",
					reference: "Dummy",
					variantReference: "variantMgmtId1",
					fileType: "ctrl_variant_management_change"
				})
			];
			this.oHandleSaveStub.resolves(aChanges);
			const aExistingChanges = [
				RtaQunitUtils.createUIChange({
					fileName: "change0",
					reference: "Dummy",
					variantReference: "variantMgmtId1",
					fileType: "change"
				}),
				RtaQunitUtils.createUIChange({
					fileName: "change3",
					reference: "Dummy",
					variantReference: "variantMgmtId1",
					fileType: "change"
				})
			];
			aExistingChanges[0].setSavedToVariant(true);
			sandbox.stub(VariantManager, "getControlChangesForVariant")
			.withArgs("Dummy", "variantMgmtId1", "mySourceReference")
			.returns(aExistingChanges);
			const oRemoveStub = sandbox.stub(VariantManager, "removeVariant").resolves();
			const oApplyChangeStub = sandbox.stub(VariantManager, "addAndApplyChangesOnVariant");

			const oSaveAsCommand = await CommandFactory.getCommandFor(this.oVariantManagement, "saveAs", {
				sourceVariantReference: oSourceVariantReference
			}, null, mFlexSettings);

			assert.strictEqual(oSaveAsCommand.getSourceDefaultVariant(), "variantMgmtId1", "the source default variant is set");
			assert.deepEqual(oSaveAsCommand.getNewVariantParameters(), {
				name: "newName",
				overwrite: false,
				key: "newKey",
				id: "variantMgmtId1-vm"
			}, "the parameters were saved in the command");
			assert.strictEqual(this.oVariantManagement.detachSave.callCount, 1, "the save event was detached");
			assert.strictEqual(this.oVariantManagement.detachCancel.callCount, 1, "the cancel event was detached");

			await oSaveAsCommand.execute();
			const mExpectedParams = {
				id: "variantMgmtId1-vm",
				key: "newKey",
				name: "newName",
				overwrite: false,
				layer: Layer.CUSTOMER,
				generator: rtaLibrary.GENERATOR_NAME,
				newVariantReference: undefined
			};
			assert.strictEqual(this.oHandleSaveStub.callCount, 1, "the model was called");
			assert.strictEqual(
				this.oHandleSaveStub.firstCall.args[0].getId(),
				"variantMgmtId1",
				"the VM Control is the first argument"
			);
			assert.deepEqual(this.oHandleSaveStub.firstCall.args[1], mExpectedParams, "the property bag was enhanced");

			await oSaveAsCommand.undo();
			const mExpectedProperties = {
				variant: aChanges[0],
				sourceVariantReference: "mySourceReference",
				variantManagementReference: "variantMgmtId1",
				appComponent: oMockedAppComponent
			};
			assert.strictEqual(oRemoveStub.callCount, 1, "removeVariant was called");
			assert.deepEqual(oRemoveStub.firstCall.args[0], mExpectedProperties, "the correct properties were passed-1");
			assert.deepEqual(oRemoveStub.firstCall.args[1], true, "the correct properties were passed-2");
			assert.strictEqual(oApplyChangeStub.callCount, 1, "one change was applied again");
			assert.strictEqual(oApplyChangeStub.lastCall.args[0].length, 1, "only one change get added");
			assert.strictEqual(oApplyChangeStub.lastCall.args[0][0].getId(), "change3", "the correct change got added");
		});

		QUnit.test("cancel", async function(assert) {
			this.oOpenDialogStub.callsFake(function() {
				this.oVariantManagement._fireCancel({});
			}.bind(this));

			const oSaveCommand = await CommandFactory.getCommandFor(this.oVariantManagement, "saveAs", {
				sourceVariantReference: "mySourceReference",
				model: this.oModel
			});

			assert.notOk(oSaveCommand, "no command was created");
			assert.strictEqual(this.oVariantManagement.detachSave.callCount, 1, "the save event was detached");
			assert.strictEqual(this.oVariantManagement.detachCancel.callCount, 1, "the cancel event was detached");
		});
	});

	QUnit.done(function() {
		oMockedAppComponent._restoreGetAppComponentStub();
		oMockedAppComponent.destroy();
		document.getElementById("qunit-fixture").style.display = "none";
	});
});