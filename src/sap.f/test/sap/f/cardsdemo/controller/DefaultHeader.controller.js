sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/integration/ActionDefinition"
], function (Controller, ActionDefinition) {
	"use strict";

	return Controller.extend("sap.f.cardsdemo.controller.DefaultHeader", {
		onInit: function () {
			const oCard5 = this.getView().byId("card5");
			const oCard6 = this.getView().byId("card6");
			const oCard8 = this.getView().byId("card8");
			const oCardActionableHeader = this.getView().byId("actionableHeaderCustomActions");

			oCard6.attachManifestReady(function () {
				oCard6.addActionDefinition(new ActionDefinition({
					type: "Custom",
					text: "Button"
				}));
			});

			oCard5.attachManifestReady(function () {
				oCard5.addActionDefinition(new ActionDefinition({
					type: "Custom",
					text: "Button"
				}));
			});

			oCard8.attachManifestReady(function () {
				oCard8.addActionDefinition(new ActionDefinition({
					type: "Custom",
					text: "Button"
				}));
			});

			oCardActionableHeader.attachManifestReady(function () {
				oCardActionableHeader.addActionDefinition(new ActionDefinition({
					type: "Custom",
					text: "Button"
				}));
			});
		}
	});
});
