/*global QUnit */

sap.ui.define([
	"sap/ui/test/opaQunit",
	"./pages/NavigationList",
	"./pages/ExploreSamples"
], function (opaTest) {
	"use strict";

	const MOCKED_VERSION = "1.99.0";
	const MOCKED_SCHEMA_URL = "https://raw.githubusercontent.com/SAP/ui5-manifest/v" + MOCKED_VERSION + "/schema.json";

	QUnit.module("Schema version injection");

	opaTest("_version and $schema are injected into card manifest displayed in the editor", function (Given, When, Then) {
		Given.iStartMyApp({ hash: "explore/list/highlight" });

		Then.onTheExploreSamplesPage.iShouldSeeVersionInEditor(MOCKED_VERSION);
		Then.onTheExploreSamplesPage.iShouldSeeSchemaUrlInEditor(MOCKED_SCHEMA_URL);

		Then.iTeardownMyApp();
	});

	opaTest("Non-JSON files should not cause errors when loading samples with multiple file types", function (Given, When, Then) {
		// The list/highlight sample contains both .json and .js files
		// This test verifies that modifyFile doesn't try to parse .js files as JSON
		Given.iStartMyApp({ hash: "explore/list/highlight" });

		// If the page loads successfully without console errors, the test passes
		Then.onTheExploreSamplesPage.iShouldSeeSampleCard("card.explorer.highlight.list.card");

		Then.iTeardownMyApp();
	});
});
