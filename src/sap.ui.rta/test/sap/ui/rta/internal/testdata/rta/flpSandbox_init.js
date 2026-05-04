sap.ui.define([
	"sap/ushell/Container"
], function(Container) {
	"use strict";
	Container.createRenderer(true).then(function(oRenderer) {
		oRenderer.placeAt("content");
	});
});