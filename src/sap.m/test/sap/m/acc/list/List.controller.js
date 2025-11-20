sap.ui.define([
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel',
		'sap/m/MessageToast'
	], function(Controller, JSONModel, MessageToast) {
	"use strict";

	var ListController = Controller.extend("sap.m.acc.list.List", {

		onInit: function () {
			// set explored app's demo model on this sample
			var oSupplierModel = new JSONModel(sap.ui.require.toUrl("sap/m/acc/list/mock/supplier.json"));
			this.getView().setModel(oSupplierModel, "supplier");

			var oProductsModel = new JSONModel(sap.ui.require.toUrl("sap/m/acc/list/mock/products.json"));
			this.getView().setModel(oProductsModel, "products");

			var oNamesModel = new JSONModel(sap.ui.require.toUrl("sap/m/acc/list/mock/names.json"));
			this.getView().setModel(oNamesModel, "names");

			const oConfigModel = new JSONModel({
				selectionMode: "None",
				showRowActions: false
			});
			this.getView().setModel(oConfigModel, "listConfig");
		},

		onOverviewListItemPress: function (oEvent) {
			var navCon = this.byId("navCon");
			var target = oEvent.getSource().data("target");
			if (target) {
				navCon.to(this.byId(target), "slide");
			} else {
				navCon.back();
			}
		},

		onNavBackButtonPress: function () {
			var navCon = this.byId("navCon");
			navCon.back();
		},

		onItemActionPress: function (oEvent) {
			const oItem = oEvent.getParameter("listItem");
			const oAction = oEvent.getParameter("action");
			const iItemIndex = oItem.getParent().indexOfItem(oItem) + 1;
			const sAction = oAction.getText() || oAction.getType();
			MessageToast.show(`${sAction} action of row ${iItemIndex} is pressed`);
		}
	});

	return ListController;

});