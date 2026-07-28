sap.ui.define([
	'sap/ui/model/json/JSONModel',
	'sap/ui/core/mvc/Controller'
],
function(JSONModel, Controller) {
	"use strict";

	// constraints for the minimum and maximum Badge value
	var BADGE_MIN_VALUE = 1,
		BADGE_MAX_VALUE = 9999,
		BUTTON_IDS = ["DefaultIconButton", "DefaultTextButton"];

		var PageController = Controller.extend("sap.m.sample.ButtonWithBadge.Page", {

		onInit: function () {
			// create model with settings
			this.oModel = new JSONModel();
			this.oModel.setData({
				badgeMin:			"1",
				badgeMax:			"9999",
				badgeCurrent:		1,
				buttonType:			"Default"
			});
			this.getView().setModel(this.oModel);

			// create internal vars with instances of controls
			this.oButton = this.byId("DefaultIconButton");
			this.oMin = this.byId("MinInput");
			this.oMax = this.byId("MaxInput");
			this.oCurrent = this.byId("CurrentValue");
			this.iMinValue = parseInt(this.oMin.getValue());
			this.iMaxValue = parseInt(this.oMax.getValue());

			// initialize Badge
			this.currentChangeHandler();
		},

		// current value or min/max values change handler
		currentChangeHandler: function() {
			var sValue = this.oCurrent.getValue().toString();

			BUTTON_IDS.forEach(function(sId) {
				var oButton = this.byId(sId);
				var oCustomData = oButton && oButton.getBadgeCustomData();
				if (oCustomData) {
					oCustomData.setValue(sValue);
				}
			}, this);
		},

		minChangeHandler: function() {
			var iMin = parseInt(this.oModel.getProperty("/badgeMin"));
			if (iMin >= BADGE_MIN_VALUE && iMin <= this.iMaxValue) {
				BUTTON_IDS.forEach(function(sId) {
					this.byId(sId).setBadgeMinValue(iMin);
				}, this);
				this.iMinValue = iMin;
			} else {
				this.oMin.setValue(this.iMinValue);
			}
		},

		maxChangeHandler: function() {
			var iMax = parseInt(this.oModel.getProperty("/badgeMax"));
			if (iMax <= BADGE_MAX_VALUE && iMax >= this.iMinValue) {
				BUTTON_IDS.forEach(function(sId) {
					this.byId(sId).setBadgeMaxValue(iMax);
				}, this);
				this.iMaxValue = iMax;
			} else {
				this.oMax.setValue(this.iMaxValue);
			}
		}

	});

	return PageController;

});
