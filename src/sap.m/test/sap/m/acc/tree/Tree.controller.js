sap.ui.define([
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel',
		'sap/m/MessageToast'
	], function(Controller, JSONModel, MessageToast) {
	"use strict";

	var TreeController = Controller.extend("sap.m.acc.tree.Tree", {

		onInit: function () {
			// set explored app's demo model on this sample
			var oModel = new JSONModel(sap.ui.require.toUrl("sap/m/acc/tree/mock/Tree.json"));
			this.getView().setModel(oModel);

			const oConfigModel = new JSONModel({
				selectionMode: "None",
				showRowActions: false,
				withIcon: false
			});
			this.getView().setModel(oConfigModel, "treeConfig");
		},

		onItemActionPress: function (oEvent) {
			const oItem = oEvent.getParameter("listItem");
			const oAction = oEvent.getParameter("action");
			const iItemIndex = oItem.getParent().indexOfItem(oItem) + 1;
			const sAction = oAction.getText() || oAction.getType();
			MessageToast.show(`${sAction} action of row ${iItemIndex} is pressed`);
		}
	});


	return TreeController;

});