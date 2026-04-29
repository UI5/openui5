sap.ui.define([
	"sap/ui/core/ComponentContainer",
	"sap/ui/core/Component"
], async (Shell, ComponentContainer, Component) => {
	"use strict";

	// initialize the UI component
	const oComponent = await Component.create({
		name: "sap.ui.rta.test",
		id: "Comp1",
		componentData: {
			showAdaptButton: true
		}
	});
	new ComponentContainer({
		async: true,
		component: oComponent
	}).placeAt("content");
});