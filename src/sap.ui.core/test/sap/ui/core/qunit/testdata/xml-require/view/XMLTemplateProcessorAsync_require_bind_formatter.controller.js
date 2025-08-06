/*global sinon*/
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel"
], function(Controller, JSONModel) {
	"use strict";

	return Controller.extend("testdata.xml-require.view.XMLTemplateProcessorAsync_require_bind_controller", {
		onInit: function () {
			const oModel = new JSONModel();
			oModel.setData({
				buttonText: "Click Me!",
				alternativeText: "Hidden Text!"
			});
			this.getView().setModel(oModel);
		},
		formatter: function(text) {
			if (this.getId().endsWith("btn_5")) {
				sinon.assert.pass("btn_5: formatter called with the correct 'this' context.");
			} else {
				sinon.assert.fail(`btn_5: formatter called with the wrong 'this' context: ${this.toString()}`);
			}
			return `${text} formatted by $controller but with control as this context`;
		},
		customDataFormatter: function(text) {
			if (this.isA("sap.ui.core.CustomData")) {
				sinon.assert.pass("customDataFormatter called with the correct 'this' context (sap.ui.core.CustomData).");
			} else {
				sinon.assert.fail("customDataFormatter called with the wrong 'this' context.");
			}
			return `${text} (formatted by customDataFormatter)`;
		}
	});
});
