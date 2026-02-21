/*
 global QUnit
 */
sap.ui.define([
	'sap/ui/test/Opa5',
	'sap/ui/test/opaQunit',
	'./CookiePreferencesJourney'
], function (Opa5, opaTest) {
	"use strict";

	QUnit.module("Navigation Journey");

	opaTest("Should start the app and see the app page", function (Given, When, Then) {
		// Arrangements
		Given.iStartMyApp();
		// Assertions
		Then.onTheAppPage.iShouldSeeTheAppPage();
	});

	opaTest("Should see the Welcome page", function (Given, When, Then) {
		// Action
		When.iLookAtTheScreen();
		// Assertions
		Then.onTheWelcomePage.iShouldSeeTheWelcomePage();
	});

	opaTest("Should navigate to Topic Master Page", function (Given, When, Then) {
		// Action
		When.onTheAppPage.iPressTheTopicMasterTabButton();
		// Assertions
		Then.onTheTopicMasterPage.iShouldSeeTheTopicMasterPage();
	});

	opaTest("Should navigate to API Reference Page", function (Given, When, Then) {
		// Action
		When.onTheAppPage.iPressTheApiMasterTabButton();
		// Assertions
		Then.onTheApiMasterPage.iShouldSeeTheApiMasterPage();
	});

	opaTest("Should navigate to Controls Master Page", function (Given, When, Then) {
		// Action
		When.onTheAppPage.iPressTheControlsMasterTabButton();
		// Assertions
		Then.onTheControlsMasterPage.iShouldSeeTheControlsMasterPage();
	});

	opaTest("Should navigate to Demo Apps Page", function (Given, When, Then) {
		// Action
		When.onTheAppPage.iPressTheDemoAppsTabButton();
		// Assertions
		Then.onTheDemoAppsPage.iShouldSeeTheDemoAppsPage();
	});

	opaTest("Should navigate to Resources Page", function (Given, When, Then) {
		// Action
		When.onTheAppPage.iPressTheResourcesTabButton();
		// Assertions
		Then.onTheResourcesPage.iShouldSeeTheResourcesPage();
	});

	opaTest("Should navigate to Welcome Page", function (Given, When, Then) {
		// Action
		When.onTheAppPage.iPressTheWelcomeTabButton();
		// Assertions
		Then.onTheWelcomePage.iShouldSeeTheWelcomePage();
	});

	opaTest("Should teardown my app", function(Given, When, Then) {
		Opa5.assert.expect(0);
		Then.iTeardownMyApp();
	});

});
