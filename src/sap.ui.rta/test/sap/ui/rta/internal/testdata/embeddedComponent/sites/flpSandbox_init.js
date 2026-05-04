sap.ui.define([
	"sap/ushell/Container"
], function(Container) {
	"use strict";

	Container.createRendererInternal(null).then(function(oContent) {
		oContent.placeAt("content");
	});
});