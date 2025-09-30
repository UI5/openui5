sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/integration/ActionDefinition",
	"sap/ui/integration/Host"
], function (Controller, ActionDefinition, Host) {
	"use strict";

	return Controller.extend("sap.f.cardsdemo.controller.DefaultHeader", {
		onInit: function () {
			const oCard6 = this.getView().byId("kpicard6");
			const oCard7 = this.getView().byId("kpicard7");
			const oCard8 = this.getView().byId("kpicard8");
			const oMyCard = this.getView().byId("cardWithActionStatusAndTimestamp");

			oCard6.attachManifestReady(function () {
				oCard6.addActionDefinition(new ActionDefinition({
					type: "Custom",
					text: "Button"
				}));
			});

			oCard7.attachManifestReady(function () {
				oCard7.addActionDefinition(new ActionDefinition({
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

			oMyCard.attachManifestReady(function () {
				oMyCard.addActionDefinition(new ActionDefinition({
					type: "Custom",
					text: "Button"
				}));
			});

			const oHost = new Host();
			oHost.useExperimentalCaching();
			oMyCard.setHost(oHost);

			this.getView().byId("cardWithStatusAndTimestamp").setHost(oHost);
			this.getView().byId("cardWithTimestamp").setHost(oHost);
			this.getView().byId("cardWithTimestampAndNoSubtitle").setHost(oHost);
		}
	});
});
