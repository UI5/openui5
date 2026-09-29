sap.ui.define([
	"delegates/odata/v4/vizChart/ChartDelegate"
], function (VizChartDelegate) {
	"use strict";

	var BidHistoryDelegate = Object.assign({}, VizChartDelegate);

	BidHistoryDelegate.fetchProperties = function (oChart) {
		return Promise.resolve(oChart.getPropertyInfo());
	};

	BidHistoryDelegate.getBindingInfo = function (oChart) {
		return {path: "/data"};
	};

	BidHistoryDelegate.updateBindingInfo = function (oChart, oBindingInfo) {
		oBindingInfo.path = "/data";
	};

	BidHistoryDelegate.getAdditionalVizProperties = function (oChart) {
		return {
			timeAxis: {
				levels: ["minute"],
				interval: {unit: "minute", step: 15}
			}
		};
	};

	return BidHistoryDelegate;
});
