sap.ui.define([
	"sap/m/App",
	"sap/m/Page",
	"sap/ui/core/mvc/XMLView",
	"sap/ui/model/json/JSONModel"
], function(App, Page, XMLView, JSONModel) {
	"use strict";

	// Load documents model
	var oModel = new JSONModel("documents.json");

	XMLView.create({
		id: 'UploadSetWithTablePluginView',
		viewName: 'sap.m.test.acc.UploadSetWithTablePlugin'
	}).then(function(oView) {
		oView.setModel(oModel, "documents");
		var oPage = new Page({
			content: [oView]
		});
		var app = new App("myApp");
		app.addPage(oPage);
		app.placeAt("content");
	});
});
