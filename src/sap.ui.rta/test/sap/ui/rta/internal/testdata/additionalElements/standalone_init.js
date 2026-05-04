sap.ui.define([
	"sap/m/Shell",
	"sap/ui/core/ComponentContainer",
	"sap/ui/core/Component"
], function(Shell, ComponentContainer, Component) {
	"use strict";
	// initialize the UI component
	Component.create({
		name: "sap.ui.rta.test.additionalElements",
		componentData: {
			showAdaptButton: true
		}
	}).then(function(oComponent) {
		new Shell({
			app: new ComponentContainer({
				height: "100%",
				component: oComponent
			})
		}).placeAt("content");
	});
});