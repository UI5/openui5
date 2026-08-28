sap.ui.define(["sap/ui/core/mvc/XMLView", "sap/ui/model/json/JSONModel"], async (XMLView, JSONModel) => {
	"use strict";

	const myModel = new JSONModel({
		title: "Hello World!",
		buttons: [{
			buttonText: "Button A"
		},{
			buttonText: "Button B"
		},{
			buttonText: "Button C"
		}]
	});

	const view = await XMLView.create({
		viewName: "htmlsample.Main",
		models: {
			// same model, two different names to show how to use them in XML
			undefined: myModel,
			"myModel": myModel
		}
	});
	view.placeAt("content");
});