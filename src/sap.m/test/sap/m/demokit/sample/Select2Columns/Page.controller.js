sap.ui.define([
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel'
	], function(Controller, JSONModel) {
	"use strict";

	var PageController = Controller.extend("sap.m.sample.Select2Columns.Page", {

		onInit: function () {
			var aItems1 = [],
				aItems2 = [];

			for (var i = 1; i <= 10; i++) {
				aItems1.push({
					firstColumnText: "First column text ".repeat(5) + " " + i,
					secondColumnText: "Second column text ".repeat(5) + " " + i
				});

				aItems2.push({
					firstColumnText: "First column text",
					secondColumnText: "Second column text"
				});
			}

			var oModel = new JSONModel({items1: aItems1, items2: aItems2});
			this.getView().setModel(oModel);
		},

		fnFirstSliderChange: function(event) {
			var iSecondSliderValue = this.byId("secondSlider").getValue(),
				iFirstSliderNewValue = event.getParameter("value");

			this.setCorrectData(iFirstSliderNewValue, iSecondSliderValue);
		},

		fnSwitch: function(event) {
			var oSelect = this.byId("select");

			oSelect.setWrapItemsText(event.getParameter("state"));
		},

		fnSecondSliderChange: function(event) {
			var iSecondSliderValue = event.getParameter("value"),
				iFirstSliderNewValue = this.byId("firstSlider").getValue();

			this.setCorrectData(iFirstSliderNewValue, iSecondSliderValue);
		},

		fnTwoColumnSeparatorChange: function () {
			var oSelectSeparator = this.byId("selectSeparator"),
				oSelectToChange = this.byId("select2"),
				sSelectedKey = oSelectSeparator.getSelectedKey();

			oSelectToChange.setTwoColumnSeparator(sSelectedKey);
		},

		fnSwitchEditableChange: function () {
			var oSelect = this.byId("select2"),
				bEditable = this.byId("switchEditable").getState();

			oSelect.setEditable(bEditable);
		},

		setCorrectData: function(iFirstColumnRatio, iSecondColumnRatio) {
			var oSelect = this.byId("select"),
				oRatioText = this.byId("text1"),
				oPercentagesText = this.byId("text2"),
				iTotalProportions = iFirstColumnRatio + iSecondColumnRatio,
				iFirstColumnProportion = Math.round(iFirstColumnRatio / iTotalProportions * 100),
				iSecondColumnProportion = 100 - iFirstColumnProportion;

			oSelect.setColumnRatio(iFirstColumnRatio + ":" + iSecondColumnRatio);
			oRatioText.setText(iFirstColumnRatio + ":" + iSecondColumnRatio);
			oPercentagesText.setText(iFirstColumnProportion + "%:" + iSecondColumnProportion + "%");
		}
	});

	return PageController;
});