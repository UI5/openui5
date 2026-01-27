sap.ui.define([
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel',
		'sap/ui/model/Filter',
		'sap/m/MessageToast'
	], function(Controller, JSONModel, Filter, MessageToast) {
	"use strict";

	let aStandardListAvatarItems = [];
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
				content: "Show Data",
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

		onContentChange: function (oEvent) {
			const sKey = oEvent.getParameter("selectedItem").getKey();
			const oStandardListIcon = this.byId("standardListIcon");
			const oStandardListAvatar =	this.byId("standardListAvatar");
			const oGroupedList = this.byId("groupedList");

			if (sKey === "No Data") {
				oStandardListIcon.getBinding("items").filter([new Filter("title", "Contains", "123456789")]);
				aStandardListAvatarItems = oStandardListAvatar.getItems();
				oStandardListAvatar.removeAllItems();
				oGroupedList.getBinding("items").filter([new Filter("title", "Contains", "123456789")]);
			} else if (sKey === "Show Data") {
				oStandardListIcon.getBinding("items").filter([]);
				aStandardListAvatarItems.forEach(function (oItem) {
					oStandardListAvatar.addItem(oItem);
				});
				oGroupedList.getBinding("items").filter([]);
			}
		},

		onItemActionPress: function (oEvent) {
			const oItem = oEvent.getParameter("listItem");
			const oAction = oEvent.getParameter("action");
			const iItemIndex = oItem.getParent().indexOfItem(oItem) + 1;
			const sAction = oAction.getText() || oAction.getType();
			MessageToast.show(`${sAction} action of row ${iItemIndex} is pressed`);
		},

		onStandardListIconItemPress: function (oEvent) {
			const oItem = oEvent.getSource();
			const iItemIndex = oItem.getParent().indexOfItem(oItem) + 1;
			MessageToast.show(`Item ${iItemIndex} is pressed`);
		},

		onAvatarPress: function (oEvent) {
			const oAvatar = oEvent.getSource();
			MessageToast.show(`Avatar of ${oAvatar.getParent().getTitle()} is pressed`);
		},

		onDisplayListItemPress: function (oEvent) {
			const oItem = oEvent.getSource();
			MessageToast.show(`Display List Item ${oItem.getLabel()} is pressed`);
		}
	});

	return ListController;

});