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

	BidHistoryDelegate._performInitialBind = function (oChart, oBindingInfo) {
		if (!oChart || !oBindingInfo || !this._getChart(oChart)) {
			return;
		}

		var oInnerChart = this._getChart(oChart);
		var oState = this._getState(oChart);

		oInnerChart.bindData(oBindingInfo);
		this._setBindingInfoForState(oChart, oBindingInfo);
		oState.innerChartBound = true;

		oInnerChart.attachEventOnce("renderComplete", function () {
			oInnerChart.setVizProperties({
				timeAxis: {
					levels: ["minute"],
					interval: {unit: "minute", step: 15}
				}
			});
			oChart.setBusy(false);
			oChart._innerChartDataLoadComplete({});
		});
	};

	return BidHistoryDelegate;
});
