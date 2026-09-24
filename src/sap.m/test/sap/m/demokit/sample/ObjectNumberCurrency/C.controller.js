sap.ui.define([
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel'
	], function(Controller, JSONModel) {
	"use strict";

	return Controller.extend("sap.m.sample.ObjectNumberCurrency.C", {

		onInit : function () {
			const oModel = new JSONModel({
				items: [
					{ number: 1234.56, currency: "EUR" },
					{ number:  987.00, currency: "USD" },
					{ number: 3456789.10, currency: "JPY" },
					{ number:   42.50, currency: "GBP" },
					{ number:  100.00, currency: "CHF" }
				]
			});
			this.getView().setModel(oModel);
		}
	});

});
