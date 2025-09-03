sap.ui.define([
	"sap/ui/core/mvc/Controller"
], (
	Controller
) => {
	"use strict";

	return Controller.extend("sap.f.cardsdemo.controller.ChangesChildCards", {
		onInit: function () {
			const aChanges = [
				{
					"/sap.card/header/title": "Title Set Through Manifest Changes",
					"/sap.card/configuration/childCards/childCard1/_manifestChanges": {
						"/sap.card/header/title": "Child Card Title From Manifest Changes",
						"/sap.card/configuration/parameters/firstColumnTitle/value": "This Column Title Comes From Manifest Changes"
					},
					"/sap.card/configuration/childCards/childCard2/_manifestChanges": {
						"/sap.card/header/title": "Child Card 2 From Manifest Changes",
						"/sap.card/configuration/childCards/childCard2.1/_manifestChanges": {
							"/sap.card/header/title": " Child Card 2.1 From Nested Manifest Changes"
						}
					}
				},
				{
					"/sap.card/configuration/childCards/childCard2/_manifestChanges": {
						"/sap.card/configuration/childCards/childCard2.1/_manifestChanges": {
							"/sap.card/header/title": "Admin level: Child Card 2.1 From Nested Manifest Changes"
						},
						"/sap.card/configuration/childCards/childCard2.2/_manifestChanges": {
							"/sap.card/header/title": "Admin level: Child Card 2.2 From Nested Manifest Changes"
						}
					}
				}
			];

			this.byId("card").setManifestChanges(aChanges);
			this.byId("changes").setValue(JSON.stringify(aChanges, null, "\t"));
		}
	});
});