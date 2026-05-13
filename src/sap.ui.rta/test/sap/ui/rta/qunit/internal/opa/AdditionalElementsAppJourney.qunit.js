/* global QUnit */
sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/opaQunit"
], (
	Opa5,
	opaTest
) => {
	"use strict";

	Opa5.extendConfig({
		assertions: new Opa5({
			iShouldSeeTheLayout() {
				return this.waitFor({
					id: "application-masterDetail-display-component---idMain1--ObjectPageLayout",
					success() {
						QUnit.assert.ok(true, "App is visible");
					},
					errorMessage: "Did not find the app"
				});
			}
		})
	});

	QUnit.begin(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
	QUnit.module("AppStart");

	// the flpSandbox doesn't work in the voter because the sandbox2.js can't be loaded
	opaTest("I open the App", (Given, When, Then) => {
		Given.iStartMyAppInAFrame({
			source: "test-resources/sap/ui/rta/internal/testdata/additionalElements/index.html",
			autoWait: true,
			timeout: 180
		});

		Then.iShouldSeeTheLayout();
		Then.iTeardownMyApp();
	});
});