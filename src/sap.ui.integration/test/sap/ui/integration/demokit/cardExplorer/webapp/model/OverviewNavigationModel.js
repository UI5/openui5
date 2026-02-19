sap.ui.define([
	"sap/ui/model/json/JSONModel"
], function (JSONModel) {
	"use strict";

	return new JSONModel({
		selectedKey: "overview",
		navigation: [
			{
				title: "Introduction",
				icon: "sap-icon://home",
				target: "overview",
				key: "introduction"
			},
			{
				title: "Card Types",
				icon: "sap-icon://initiative",
				target: "overview",
				key: "cardTypes"
			},
			{
				title: "Developing Cards",
				icon: "sap-icon://header",
				target: "overview",
				key: "developingCards"
			},
			{
				title: "AI Generation",
				icon: "sap-icon://ai",
				target: "overview",
				key: "aiGeneration"
			},
			{
				title: "Supported Platforms",
				icon: "sap-icon://desktop-mobile",
				target: "overview",
				key: "supportedPlatforms"
			},
			{
				title: 'Security Policy',
				icon: 'sap-icon://shield',
				target: "overview",
				key: "security"
			},
			{
				title: "References",
				icon: "sap-icon://list",
				target: "overview",
				key: "references"
			}
		]
	});
});
