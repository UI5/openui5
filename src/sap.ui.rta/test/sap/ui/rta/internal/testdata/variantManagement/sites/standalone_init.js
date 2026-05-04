sap.ui.define([
	"sap/m/Shell",
	"sap/ui/core/ComponentContainer",
	"sap/ui/core/Component"
], function (Shell, ComponentContainer, Component) {
	"use strict";
	return Component.create({
		name: "sap.ui.rta.test.variantManagement"
	})
	.then(function(oComponent) {
		return new ComponentContainer({
			height: "100%",
			component: oComponent,
			async: true
		});
	})
	.then(function (oComponentContainer) {
		// initialize the UI component
		return new Shell({
			app: oComponentContainer
		}).placeAt("content");
	});
});
