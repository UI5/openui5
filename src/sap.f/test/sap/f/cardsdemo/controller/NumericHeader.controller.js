sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/integration/ActionDefinition"
], function (Controller, ActionDefinition) {
	"use strict";

	return Controller.extend("sap.f.cardsdemo.controller.DefaultHeader", {
		onInit: function () {
			const oCard6 = this.getView().byId("kpicard6");
			const oCard7 = this.getView().byId("kpicard7");
			const oCard8 = this.getView().byId("kpicard8");

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
		}
	});
});
