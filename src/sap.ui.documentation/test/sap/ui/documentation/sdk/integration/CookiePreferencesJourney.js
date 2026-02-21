/*
 global QUnit
 */
sap.ui.define([
	'sap/ui/test/Opa5',
	'sap/ui/test/opaQunit'
], function (Opa5, opaTest) {
	"use strict";

	QUnit.module("Cookie Preferences Journey");

	opaTest("Should start the app and see the cookie preferences blackbar", function (Given, When, Then) {
		// Arrangements
		Given.iClearAllData();
		Given.iStartMyApp("sap-ui-xx-tracking=true");
		// Assertions
		Then.onTheAppPage.iShouldSeeTheCookiePreferencesBlackbar();
	});

	opaTest("Should accept all cookies and teardown my app", function (Given, When, Then) {
		// Action
		When.onTheAppPage.iPressTheAcceptAllCookiesButton();
		Opa5.assert.expect(0);
		Then.iTeardownMyApp();
	});

});
