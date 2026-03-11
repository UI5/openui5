sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/json/JSONModel'
], function (Controller, JSONModel) {
	"use strict";

	return Controller.extend("appUnderTest.view.Main", {

		onInit: function () {
			var oModel = new JSONModel({
				items: [
					{id: "1", name: "Item 1", category: "Category A"},
					{id: "2", name: "Item 2", category: "Category B"},
					{id: "3", name: "Item 3", category: "Category A"},
					{id: "4", name: "Item 4", category: "Category C"},
					{id: "5", name: "Item 5", category: "Category B"},
					{id: "6", name: "Item 6", category: "Category A"},
					{id: "7", name: "Item 7", category: "Category C"},
					{id: "8", name: "Item 8", category: "Category B"},
					{id: "9", name: "Item 9", category: "Category A"},
					{id: "10", name: "Item 10", category: "Category C"}
				],
				selectedCount: 0,
				contextMenuAction: "None"
			});
			this.getView().setModel(oModel);
		},

		onNavToContextMenu: function () {
			this.byId("myApp").to(this.byId("contextMenuPage").getId());
		},

		onBack: function () {
			this.byId("myApp").to(this.byId("multiSelectionPage").getId());
		},

		onSelectionChange: function (oEvent) {
			var oTable = oEvent.getSource();
			var aSelectedItems = oTable.getSelectedItems();
			this.getView().getModel().setProperty("/selectedCount", aSelectedItems.length);
		},

		onContextMenuEdit: function () {
			this.getView().getModel().setProperty("/contextMenuAction", "Edit Item");
		},

		onContextMenuDelete: function () {
			this.getView().getModel().setProperty("/contextMenuAction", "Delete Item");
		},

		onContextMenuDetails: function () {
			this.getView().getModel().setProperty("/contextMenuAction", "View Details");
		}
	});

});
