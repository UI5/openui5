sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/UIComponent",
	"sap/m/MessageToast",
	"sap/ui/model/json/JSONModel"
], function (Controller, UIComponent, MessageToast, JSONModel) {

	"use strict";

	var SUPPLIERS = [
		{name: "Lead",     items: {Laptop: 2100, Mouse: 500,  "HDMI Cable": 480}},
		{name: "Tiger IT", items: {Pen:    2050, Mouse: 490}},
		{name: "NeuTech",  items: {Laptop: 2080}},
		{name: "BestBuy",  items: {Laptop: 2000, Mouse: 470,  "HDMI Cable": 455}},
		{name: "TechPro",  items: {Laptop: 1980, Mouse: 460,  "HDMI Cable": 430}},
		{name: "GizmoHub", items: {Laptop: 1950, Mouse: 440}}
	];
	var OFFSETS = [0, 370, 730, 1105, 1480, 1840, 2210, 2570, 2940, 3300]; // seconds

	return Controller.extend("sap.ui.v4demo.controller.Books", {

		onInit: function () {
			this.byId("bookChart").attachSelectionDetailsActionPressed(function(oEvent) {
				MessageToast.show(oEvent.getParameter("action").getText() + " is pressed" + "\n " + oEvent.getParameter("itemContexts").length + " items selected" + "\n level is: " + oEvent.getParameter("level"));
			});

			this.byId("bookChart-2").attachSelectionDetailsActionPressed(function(oEvent) {
				MessageToast.show(oEvent.getParameter("action").getText() + " is pressed" + "\n " + oEvent.getParameter("itemContexts").length + " items selected" + "\n level is: " + oEvent.getParameter("level"));
			});

			this._initBidHistoryChart();
		},

		_initBidHistoryChart: function () {
			var nBase = Date.now();
			var aData = [];

			SUPPLIERS.forEach(function (oSupplier) {
				Object.keys(oSupplier.items).forEach(function (sItem) {
					var nPrice = oSupplier.items[sItem];
					OFFSETS.forEach(function (nOffset, i) {
						aData.push({
							ts: new Date(nBase + nOffset * 1000).toISOString(),
							supplier: oSupplier.name + " — " + sItem,
							price: Math.round((nPrice - i * nPrice * 0.015) * 100) / 100
						});
					});
				});
			});

			var oChart = this.byId("bookChart-timeseries");
			oChart.setModel(new JSONModel({data: aData}));
		},

		onFiltersChanged: function(oEvent) {
			var oText = this.getView().byId("statusTextExpanded");
			if (oText) {
				oText.setText(oEvent.getParameters().filtersTextExpanded);
			}

			oText = this.getView().byId("statusTextCollapsed");
			if (oText) {
				oText.setText(oEvent.getParameters().filtersText);
			}
		}
	});
});
