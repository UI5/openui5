sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/json/JSONModel'
], function(Controller, JSONModel) {
	"use strict";

	return Controller.extend("sap.m.sample.SelectGrouping.Page", {

		onInit: function () {
			var oModel = new JSONModel({
				selectedKey: "AR",
				selectedText: "Argentina",
				countries: [
					{ key: "AR", name: "Argentina",  region: "Americas" },
					{ key: "BR", name: "Brazil",     region: "Americas" },
					{ key: "CA", name: "Canada",     region: "Americas" },
					{ key: "MX", name: "Mexico",     region: "Americas" },
					{ key: "DE", name: "Germany",    region: "Europe" },
					{ key: "FR", name: "France",     region: "Europe" },
					{ key: "IT", name: "Italy",      region: "Europe" },
					{ key: "ES", name: "Spain",      region: "Europe" },
					{ key: "CN", name: "China",      region: "Asia" },
					{ key: "JP", name: "Japan",      region: "Asia" },
					{ key: "IN", name: "India",      region: "Asia" },
					{ key: "SG", name: "Singapore",  region: "Asia" }
				]
			});
			this.getView().setModel(oModel);
		},

		onSelectionChange: function (oEvent) {
			var oItem = oEvent.getParameter("selectedItem");
			this.getView().getModel().setProperty("/selectedText", oItem.getText());
		}
	});
});
