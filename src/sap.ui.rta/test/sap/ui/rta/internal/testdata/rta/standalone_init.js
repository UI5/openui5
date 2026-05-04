sap.ui.define([
	"sap/ui/core/ComponentContainer",
	"sap/ui/core/Component"
], function(ComponentContainer, Component) {
	"use strict";

	// initialize the UI component
	Component.create({
		name: "sap.ui.rta.test",
		id: "Comp1",
		componentData: {
			showAdaptButton: true
		}
	}).then(function(oComponent) {
		new ComponentContainer({
			async: true,
			component: oComponent
		}).placeAt("content");
	});
});