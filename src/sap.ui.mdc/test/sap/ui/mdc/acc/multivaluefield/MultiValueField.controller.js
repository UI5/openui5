sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/mdc/field/FieldMultiInput", // to have content controls initially loaded and prevent async. effects for ACC test
	"./MultiValueField.delegate"
], function(
	Controller,
	JSONModel,
	FieldMultiInput,
	MultiValueFieldDelegate
) {
	"use strict";

	return Controller.extend("sap.ui.mdc.acc.multivaluefield.MultiValueField", {

		onInit: function(oEvent) {

			var oView = this.getView();
			oView.bindElement("/ProductCollection('1239102')");

			var oViewModel = new JSONModel({
				editMode: false,
				productItems: [
					{ProductId: "22134T", Name: "Webcam", Date: new Date(2014, 3, 18)},
					{ProductId: "89932-922", Name: "Laser Allround Pro", Date: new Date(2014, 3, 18)}
				],
				categoryItems: [
					{Category: "Projector"},
					{Category: "Graphics Card"}
				],
				statusItems: [
					{StatusId: "S1", Name: "Available"}
				],
				materialItems: []
			});
			oView.setModel(oViewModel, "view");
		}

	});
});
