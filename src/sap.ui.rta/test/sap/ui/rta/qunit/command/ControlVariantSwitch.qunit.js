/* global QUnit */

sap.ui.define([
	"sap/ui/fl/apply/api/ControlVariantApplyAPI",
	"sap/ui/fl/variants/VariantManagement",
	"sap/ui/fl/variants/VariantManager",
	"sap/ui/rta/command/CommandFactory",
	"sap/ui/thirdparty/sinon-4",
	"test-resources/sap/ui/rta/qunit/RtaQunitUtils"
], function(
	ControlVariantApplyAPI,
	VariantManagement,
	VariantManager,
	CommandFactory,
	sinon,
	RtaQunitUtils
) {
	"use strict";

	const sandbox = sinon.createSandbox();

	QUnit.module("Given a VariantManagement control and its designtime metadata are created...", {
		beforeEach() {
			this.sVariantManagementReference = "variantManagementReference-1";
			this.oVariantManagement = new VariantManagement(this.sVariantManagementReference, {});
			this.oMockedAppComponent = RtaQunitUtils.createAndStubAppComponent(sandbox);

			this.oActivateVariantStub = sandbox.stub(ControlVariantApplyAPI, "activateVariant").resolves();
		},
		afterEach() {
			this.oMockedAppComponent.destroy();
			this.oVariantManagement.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when getting a switch command for VariantManagement...", async function(assert) {
			const oSwitchCommandData = {
				targetVariantReference: "newVariantReference",
				sourceVariantReference: "oldVariantReference"
			};

			const oSwitchCommand = await CommandFactory.getCommandFor(this.oVariantManagement, "switch", oSwitchCommandData);
			assert.notOk(oSwitchCommand.getRelevantForSave(), "then the relevantForSave property is set to false");
			await oSwitchCommand.execute();
			assert.equal(this.oActivateVariantStub.callCount, 1, "then activateVariant after execute command is called once");
			assert.deepEqual(this.oActivateVariantStub.getCall(0).args[0], {
				element: this.oVariantManagement,
				variantReference: oSwitchCommandData.targetVariantReference
			}, "then activateVariant after execute command is called with the correct parameters");
			await oSwitchCommand.undo();
			assert.equal(
				this.oActivateVariantStub.callCount,
				2,
				"then activateVariant after undo command is called once again"
			);
			assert.deepEqual(this.oActivateVariantStub.getCall(1).args[0], {
				element: this.oVariantManagement,
				variantReference: oSwitchCommandData.sourceVariantReference
			}, "then activateVariant after undo command is called with the correct parameters");
		});

		QUnit.test("when getting a switch command for VariantManagement and discardVariantContent is true", async function(assert) {
			const oSwitchCommandData = {
				targetVariantReference: "newVariantReference",
				sourceVariantReference: "oldVariantReference",
				discardVariantContent: true
			};

			const aDirtyChanges = [
				RtaQunitUtils.createUIChange({
					fileName: "change1",
					reference: "Dummy",
					variantReference: "oldVariantReference",
					fileType: "change"
				}),
				RtaQunitUtils.createUIChange({
					fileName: "change2",
					reference: "Dummy",
					variantReference: "oldVariantReference",
					fileType: "ctrl_variant_management_change"
				})
			];

			const oAddAndApplyChangesStub = sandbox.stub(VariantManager, "addAndApplyChangesOnVariant").resolves();
			sandbox.stub(VariantManager, "eraseDirtyChangesOnVariant").resolves(aDirtyChanges);

			const oSwitchCommand = await CommandFactory.getCommandFor(this.oVariantManagement, "switch", oSwitchCommandData);
			await oSwitchCommand.execute();
			assert.deepEqual(
				oSwitchCommand.getDiscardedChanges(),
				aDirtyChanges,
				"then the dirty changes are retrieved correctly"
			);
			assert.equal(this.oActivateVariantStub.callCount, 1, "then activateVariant after execute command is called once");
			assert.deepEqual(this.oActivateVariantStub.getCall(0).args[0], {
				element: this.oVariantManagement,
				variantReference: oSwitchCommandData.targetVariantReference
			}, "then activateVariant after execute command is called with the correct parameters");

			await oSwitchCommand.undo();

			assert.deepEqual(oAddAndApplyChangesStub.getCall(0).args[0], aDirtyChanges, "then the changes are applied again");
			assert.deepEqual(oSwitchCommand.getDiscardedChanges(), [], "then the dirty changes are cleared on the command");
			assert.equal(
				this.oActivateVariantStub.callCount,
				2,
				"then activateVariant after undo command is called once again"
			);
			assert.deepEqual(this.oActivateVariantStub.getCall(1).args[0], {
				element: this.oVariantManagement,
				variantReference: oSwitchCommandData.sourceVariantReference
			}, "then activateVariant after undo command is called with the correct parameters");
			assert.ok(
				this.oActivateVariantStub.calledBefore(oAddAndApplyChangesStub),
				"then the variant is updated before the dirty changes are applied"
			);
		});

		QUnit.test("when getting a switch command for VariantManagement with equal source and target variantId ...", async function(assert) {
			const oSwitchCommandData = {
				targetVariantReference: "variantReference",
				sourceVariantReference: "variantReference"
			};

			const oSwitchCommand = await CommandFactory.getCommandFor(this.oVariantManagement, "switch", oSwitchCommandData);
			await oSwitchCommand.execute();
			assert.equal(this.oActivateVariantStub.callCount, 0, "then activateVariant after execute command is not called");
			await oSwitchCommand.undo();
			assert.equal(this.oActivateVariantStub.callCount, 0, "then activateVariant after undo command is not called");
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
