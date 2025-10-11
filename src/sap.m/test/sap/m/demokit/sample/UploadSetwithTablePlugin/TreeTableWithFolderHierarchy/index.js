sap.ui.define([
	"sap/ui/core/ComponentContainer",
	"sap/ui/core/Component"
], function (ComponentContainer, Component) {
	"use strict";
	Component.create({
		name: "sap.m.sample.UploadSetwithTablePlugin.TreeTableWithFolderHierarchy"
	}).then(function (oComponent) {
		new ComponentContainer({
			component: oComponent,
			height: "100%"
		}).placeAt("content");
	});
});