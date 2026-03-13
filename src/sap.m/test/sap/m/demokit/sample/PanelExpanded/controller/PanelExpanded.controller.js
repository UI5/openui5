sap.ui.define([
		'sap/ui/core/mvc/Controller'
	], function(Controller) {
	"use strict";

	return Controller.extend("sap.m.sample.PanelExpanded.controller.PanelExpanded", {
		onOverflowToolbarPress : function () {
			var oPanel = this.byId("expandablePanel");
			oPanel.setExpanded(!oPanel.getExpanded());
		}
	});
});