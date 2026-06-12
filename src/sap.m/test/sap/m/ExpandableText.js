sap.ui.define([
	"sap/m/MessageToast",
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/mvc/XMLView",
	"sap/ui/model/json/JSONModel"
], function(MessageToast, Controller, XMLView, JSONModel) {
	"use strict";

	var MyController = Controller.extend("myController", {
		onInit: function() {
			var model = new JSONModel();
			model.setData({
				buttonText: "Click Me!",
				gridRows: [
					{ col1: "Row 1 Col 1", col2: "This is a long text that can be expanded to show more details.", col3: "Row 1 Col 3" },
					{ col1: "Row 2 Col 1", col2: "Another long text that can be expanded.", col3: "Row 2 Col 3" }
				]
			});
			this.getView().setModel(model);
		},
		doSomething: function() {
			MessageToast.show("Hello World!");
		}
	});

	XMLView.create({
		definition: document.getElementById('myXml').textContent,
		controller: new MyController()
	}).then(function(oView) {
		oView.placeAt("content");
	});
});
