sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast"
], function (Controller, MessageToast) {
	"use strict";

	return Controller.extend("sap.ui.mdc.demokit.sample.Chart.ChartJS.controller.Demo", {

		onExportChartPress: function () {
			const oChart = this.byId("chart");
			const oInnerChart = oChart && oChart.getControlDelegate()._getInnerChart(oChart);
			const oChartJS = oInnerChart && oInnerChart.getInnerChart();
			if (!oChartJS) {
				MessageToast.show("Chart not ready");
				return;
			}
			const sDataUrl = oChartJS.toBase64Image("image/png", 1);
			const oLink = document.createElement("a");
			oLink.href = sDataUrl;
			oLink.download = "chart.png";
			oLink.click();
		},

		onFiltersChanged: function (oEvent) {
			const oChart = this.byId("chart");
			if (oChart) {
				oChart.rebind();
			}
		}
	});
});
