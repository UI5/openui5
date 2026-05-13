sap.ui.define([
	"sap/m/Shell",
	"sap/ui/core/ComponentContainer",
	"sap/ui/core/Component"
], async (Shell, ComponentContainer, Component) => {
	"use strict";

	// initialize the UI component
	const oComponent = await Component.create({
		name: "sap.ui.rta.test.additionalElements",
		id: "application-masterDetail-display-component",
		componentData: {
			showAdaptButton: true
		}
	});
	new Shell({
		app: new ComponentContainer({
			height: "100%",
			component: oComponent
		})
	}).placeAt("content");
});