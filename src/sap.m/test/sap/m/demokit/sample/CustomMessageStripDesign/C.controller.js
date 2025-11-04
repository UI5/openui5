sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/library"
], function(Controller, mobileLibrary) {
	"use strict";

	var MessageStripColorSet = mobileLibrary.MessageStripColorSet;

	return Controller.extend("sap.m.sample.CustomMessageStripDesign.C", {

		onColorSetChange: function(oEvent) {
			var sSelectedColorSet = oEvent.getParameter("selectedItem").getKey();
			this._updateDesignForColorSet(sSelectedColorSet);
		},

		_updateDesignForColorSet: function(sColorSet) {
			var aMessageStripData = [
				{ id: "messageStrip_scheme1", colorScheme: 1 },
				{ id: "messageStrip_scheme2", colorScheme: 2 },
				{ id: "messageStrip_scheme3", colorScheme: 3 },
				{ id: "messageStrip_scheme4", colorScheme: 4 },
				{ id: "messageStrip_scheme5", colorScheme: 5 },
				{ id: "messageStrip_scheme6", colorScheme: 6 },
				{ id: "messageStrip_scheme7", colorScheme: 7 },
				{ id: "messageStrip_scheme8", colorScheme: 8 },
				{ id: "messageStrip_scheme9", colorScheme: 9 },
				{ id: "messageStrip_scheme10", colorScheme: 10 }
			];

			var sColorSetValue;
			if (sColorSet === "1") {
				sColorSetValue = MessageStripColorSet.ColorSet1;
			} else {
				sColorSetValue = MessageStripColorSet.ColorSet2;
			}

			var that = this;
			aMessageStripData.forEach(function(oData) {
				var oMessageStrip = that.byId(oData.id);
				if (oMessageStrip) {
					oMessageStrip.setColorSet(sColorSetValue);
					oMessageStrip.setColorScheme(oData.colorScheme);
				}
			});
		}
	});
});
