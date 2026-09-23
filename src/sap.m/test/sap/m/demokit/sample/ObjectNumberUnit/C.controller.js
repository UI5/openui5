sap.ui.define([
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel'
	], function(Controller, JSONModel) {
	"use strict";

	return Controller.extend("sap.m.sample.ObjectNumberUnit.C", {

		onInit : function () {
			const oModel = new JSONModel({
				items: [
					{ number: 17.5,    unit: "kilogram-metric-ton" },
					{ number:  5.0,    unit: "kilogram-metric-ton" },
					{ number: 120.25,  unit: "kilometer-per-hour" },
					{ number:   0.75,  unit: "kilometer-per-hour" },
					{ number:  42.0,   unit: "celsius" }
				]
			});
			this.getView().setModel(oModel);
		}
	});

});
