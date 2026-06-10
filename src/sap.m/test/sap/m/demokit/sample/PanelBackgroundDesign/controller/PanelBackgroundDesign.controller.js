sap.ui.define([
		'sap/ui/core/mvc/Controller'
	], function(Controller) {
	"use strict";

	return Controller.extend("sap.m.sample.PanelBackgroundDesign.controller.PanelBackgroundDesign", {

		onBackgroundDesignChange: function (oEvent) {
			var sSelectedKey = oEvent.getParameter("selectedItem").getKey();
			this.byId("demoPanel").setBackgroundDesign(sSelectedKey);
		}
	});
});
