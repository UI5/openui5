sap.ui.define([
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel'
	], function(Controller, JSONModel) {
	"use strict";

	return Controller.extend("sap.m.sample.MultiComboBoxMaxPickerHeight.controller.MultiComboBoxMaxPickerHeight", {

		onInit: function () {
			// Create a model with many items to demonstrate scrolling
			var aItems = [];
			for (var i = 1; i <= 100; i++) {
				aItems.push({
					key: "item" + i,
					text: "Item " + i
				});
			}

			var oModel = new JSONModel({
				items: aItems
			});
			this.getView().setModel(oModel);
		}
	});
});
