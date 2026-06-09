sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/integration/ActionDefinition"
], function (Controller, ActionDefinition) {
	"use strict";

	return Controller.extend("sap.f.cardsdemo.controller.ExtraSmallCards", {
		onInit: function () {
			var oView = this.getView();

			["xsCard2", "xsCard3", "normalCard2", "normalCard3",
			 "xsActionStatusTimestamp", "normalActionStatusTimestamp"].forEach(function (sId) {
				var oCard = oView.byId(sId);
				if (oCard) {
					oCard.attachManifestReady(function () {
						oCard.addActionDefinition(new ActionDefinition({
							type: "Custom",
							text: "Action 1"
						}));
					});
				}
			});
		}
	});
});
