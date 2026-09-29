sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel"
], function (Controller, JSONModel) {
	"use strict";

	return Controller.extend("contextLoadingComponent.Main", {
		onInit: function () {
			var oComponent = this.getOwnerComponent(),
				oCard = oComponent.card,
				sUserName = oCard.getCombinedParameters().userName;

			this.getView().setModel(new JSONModel({
				userName: sUserName
			}));
		}
	});
});
