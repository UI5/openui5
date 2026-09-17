sap.ui.define([
	"sap/ui/core/mvc/XMLView"
], async function (XMLView) {
	"use strict";

	const view = await XMLView.create({
		viewName: "local/App"
	});
	view.placeAt("content");
});
