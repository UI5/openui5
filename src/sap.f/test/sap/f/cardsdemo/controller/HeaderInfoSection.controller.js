sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/integration/ActionDefinition"
], function (Controller, ActionDefinition) {
	"use strict";

	return Controller.extend("sap.f.cardsdemo.controller.HeaderInfoSection", {
		onInit: function () {
			const oCard7 = this.getView().byId("card7");

			oCard7.attachManifestReady(function () {
				oCard7.addActionDefinition(new ActionDefinition({
					type: "Custom",
					text: "Button"
				}));
			});

		}
	});
});
