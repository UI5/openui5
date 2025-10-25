/* global QUnit */

sap.ui.define([
	"sap/ui/fl/variants/VariantManagement",
	"sap/ui/fl/variants/VariantManager",
	"sap/ui/fl/Layer",
	"sap/ui/rta/command/CommandFactory",
	"sap/ui/rta/library",
	"sap/ui/thirdparty/sinon-4",
	"test-resources/sap/ui/rta/qunit/RtaQunitUtils"
], function(
	VariantManagement,
	VariantManager,
	Layer,
	CommandFactory,
	rtaLibrary,
	sinon,
	RtaQunitUtils
) {
	"use strict";

	const sandbox = sinon.createSandbox();
	const oMockedAppComponent = RtaQunitUtils.createAndStubAppComponent(sinon, "Dummy");

	QUnit.module("FLVariant Set Title", {
		beforeEach() {
			this.oVariantManagement = new VariantManagement("variantMgmtId1");
		},
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("execute and undo", async function(assert) {
			const sNewText = "Test";
			const oAddChangeStub = sandbox.stub(VariantManager, "addVariantChange").resolves("setTitleChange");
			const oDeleteStub = sandbox.stub(VariantManager, "deleteVariantChange").resolves();
			sandbox.stub(this.oVariantManagement, "getCurrentVariantReference").returns("variant0");
			sandbox.stub(this.oVariantManagement, "getVariantByKey").returns({
				getTitle() { return "variant A"; }
			});

			const oSetTitleCommand = await CommandFactory.getCommandFor(this.oVariantManagement, "setTitle", {
				newText: sNewText
			}, null, { layer: Layer.CUSTOMER });

			await oSetTitleCommand.execute();
			assert.strictEqual(oSetTitleCommand.getOldText(), "variant A", "the old text was set in the command");
			const mExpectedParams = {
				appComponent: oMockedAppComponent,
				variantReference: "variant0",
				changeType: "setTitle",
				title: sNewText,
				layer: Layer.CUSTOMER,
				generator: rtaLibrary.GENERATOR_NAME
			};
			assert.strictEqual(oAddChangeStub.callCount, 1, "the add function was called once");
			assert.deepEqual(
				oAddChangeStub.firstCall.args[0],
				"variantMgmtId1",
				"the first parameter is the variantManagement reference"
			);
			assert.deepEqual(
				oAddChangeStub.firstCall.args[1],
				mExpectedParams,
				"the second parameter is the correct property bag"
			);

			await oSetTitleCommand.undo();
			const mExpectedParams2 = {
				variantReference: "variant0",
				changeType: "setTitle",
				title: "variant A",
				appComponent: oMockedAppComponent
			};
			assert.strictEqual(oDeleteStub.callCount, 1, "the change got deleted");
			assert.strictEqual(oDeleteStub.firstCall.args[0], "variantMgmtId1", "the vm reference was passed");
			assert.deepEqual(oDeleteStub.firstCall.args[1], mExpectedParams2, "the propertyBag was passed");
			assert.strictEqual(oDeleteStub.firstCall.args[2], "setTitleChange", "the change was passed");
		});
	});

	QUnit.done(function() {
		oMockedAppComponent._restoreGetAppComponentStub();
		oMockedAppComponent.destroy();
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
