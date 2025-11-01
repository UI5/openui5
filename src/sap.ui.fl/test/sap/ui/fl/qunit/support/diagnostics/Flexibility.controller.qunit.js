/* global QUnit */
sap.ui.define([
	"sap/ui/fl/support/diagnostics/Flexibility.controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/thirdparty/sinon-4"
], function(
	FlexibilityController,
	JSONModel,
	sinon
) {
	"use strict";

	const oSandbox = sinon.createSandbox();
	document.getElementById("qunit-fixture").style.display = "none";

	QUnit.module("sap.ui.fl.support.diagnostics.Flexibility.controller", {
		beforeEach() {
			this.oController = new FlexibilityController();

			this.oFlexToolSettingsModel = new JSONModel({ anonymizeData: false });

			this.oMockPlugin = {
				sendGetDataEvent: oSandbox.stub()
			};

			this.oMockView = {
				getModel: oSandbox.stub(),
				getViewData: oSandbox.stub().returns({ plugin: this.oMockPlugin })
			};
			this.oMockView.getModel.withArgs("flexToolSettings").returns(this.oFlexToolSettingsModel);

			this.oController.getView = oSandbox.stub().returns(this.oMockView);
		},

		afterEach() {
			oSandbox.restore();
			this.oController.destroy();
			this.oFlexToolSettingsModel.destroy();
			this.oMockView = null;
			this.oMockPlugin = null;
		}
	});

	QUnit.test("onDownloadPress - calls plugin sendGetDataEvent with anonymization setting false", function(assert) {
		// anonymizeData is already false by default in beforeEach
		this.oController.onDownloadPress();

		assert.ok(this.oMockPlugin.sendGetDataEvent.calledOnce, "sendGetDataEvent is called once");
		assert.ok(this.oMockPlugin.sendGetDataEvent.calledWith(false), "sendGetDataEvent is called with false for anonymization");
	});

	QUnit.test("onDownloadPress - calls plugin sendGetDataEvent with anonymization setting true", function(assert) {
		this.oFlexToolSettingsModel.setProperty("/anonymizeData", true);

		this.oController.onDownloadPress();

		assert.ok(this.oMockPlugin.sendGetDataEvent.calledOnce, "sendGetDataEvent is called once");
		assert.ok(this.oMockPlugin.sendGetDataEvent.calledWith(true), "sendGetDataEvent is called with true for anonymization");
	});
});