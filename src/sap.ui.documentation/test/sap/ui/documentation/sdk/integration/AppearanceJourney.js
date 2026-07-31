/*
 global QUnit
 */
sap.ui.define([
	'sap/ui/test/Opa5',
	'sap/ui/test/opaQunit'
], function (Opa5, opaTest) {
	"use strict";

	QUnit.module("Appearance Journey");

	opaTest("Should apply Light theme", function (Given, When, Then) {
		Given.iStartMyApp();
		When.onTheAppPage.iPressTheSettingsMenuButton();
		When.onTheAppPage.iSelectAppearanceOption("light");
		Then.onTheAppPage.iShouldSeeThemeApplied("sap_horizon");
	});

	opaTest("Should apply Dark theme", function (Given, When, Then) {
		When.onTheAppPage.iPressTheSettingsMenuButton();
		When.onTheAppPage.iSelectAppearanceOption("dark");
		Then.onTheAppPage.iShouldSeeThemeApplied("sap_horizon_dark");
	});

	opaTest("Should apply High Contrast Black theme", function (Given, When, Then) {
		When.onTheAppPage.iPressTheSettingsMenuButton();
		When.onTheAppPage.iSelectAppearanceOption("hcb");
		Then.onTheAppPage.iShouldSeeThemeApplied("sap_horizon_hcb");
	});

	opaTest("Should apply High Contrast White theme", function (Given, When, Then) {
		When.onTheAppPage.iPressTheSettingsMenuButton();
		When.onTheAppPage.iSelectAppearanceOption("hcw");
		Then.onTheAppPage.iShouldSeeThemeApplied("sap_horizon_hcw");
	});

	opaTest("Should apply Auto theme (light or dark based on OS)", function (Given, When, Then) {
		When.onTheAppPage.iPressTheSettingsMenuButton();
		When.onTheAppPage.iSelectAppearanceOption("auto");
		Then.onTheAppPage.iShouldSeeThemeApplied("sap_horizon");
		Then.iTeardownMyApp();
	});
});
