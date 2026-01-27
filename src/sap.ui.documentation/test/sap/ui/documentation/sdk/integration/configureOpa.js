sap.ui.define([
	"sap/ui/test/Opa5",
	"./pageobjects/App",
	"./pageobjects/Welcome",
	"./pageobjects/TopicMaster",
	"./pageobjects/ApiMaster",
	"./pageobjects/ControlsMaster",
	"./pageobjects/DemoApps",
	"./pageobjects/ApiDetail",
	"./pageobjects/SubApiDetail",
	"./pageobjects/Entity",
	"./pageobjects/Sample",
	"./pageobjects/Code"
], function (Opa5) {
	"use strict";

	Opa5.extendConfig({
		actions: new Opa5({
			iLookAtTheScreen : function () {
				return this;
			}
		}),
		viewNamespace: "sap.ui.documentation.sdk.view.",
		autoWait: true,
		appParams:  {
			"sap-ui-xx-tracking": true
		}
	});
});

