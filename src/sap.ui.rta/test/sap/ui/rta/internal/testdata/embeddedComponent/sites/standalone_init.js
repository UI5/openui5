sap.ui.define([
	"sap/m/Shell",
	"sap/ui/core/ComponentContainer"
], function (Shell, ComponentContainer) {
	"use strict";
	// initialize the UI component
	new Shell({
		app: new ComponentContainer({
			height: "100%",
			name: "sap.ui.rta.test.embeddedComponent"
		})
	}).placeAt("content");
});