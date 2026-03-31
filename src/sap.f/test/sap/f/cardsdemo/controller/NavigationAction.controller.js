sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/base/Log",
	"sap/ui/util/openWindow"
], (Controller, Log, openWindow) => {
	"use strict";

	return Controller.extend("sap.f.cardsdemo.controller.NavigationAction", {

		onAction(oEvent) {
			// informs CardActions that the action was handled and no further processing is needed on CardActions' end
			oEvent.preventDefault();

			const oParameters = oEvent.getParameter("parameters");
			const sUrl = oParameters?.url;
			openWindow(sUrl, "_blank");
		},

		onActionLog(oEvent) {
			Log.info("[CARD]" + oEvent.getParameter("type"));
			Log.info("[CARD]" + JSON.stringify(oEvent.getParameter("parameters"), null, 2));
			Log.info("[CARD]" + oEvent.getParameter("actionSource"));
		}

	});
});
