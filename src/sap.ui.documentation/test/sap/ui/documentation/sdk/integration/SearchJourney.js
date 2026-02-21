/*
 global QUnit
 */
sap.ui.define([
	'sap/ui/test/opaQunit',
	'sap/ui/test/Opa5',
	'./CookiePreferencesJourney' // to ensure that the CookiePreferencesJourney is executed first
], function (opaTest, Opa5) {
	"use strict";

	QUnit.module("Search Journey");

	opaTest("Should see the search field", function (Given, When, Then) {
		// Actions
		Given.iStartMyApp();

		// Assertions
		Then.onTheSearchControl.iShouldSeeTheSearchField();
	});

	opaTest("Should enter search query and see the search picker", function (Given, When, Then) {
		Given.iSetupSearchMock();

		// Actions
		When.onTheSearchControl.iEnterTextInTheSearchField("button");

		// Assertions
		Then.onTheSearchControl.iShouldSeeSearchFieldValue("button");
		Then.onTheSearchPicker.iShouldSeeTheSearchPicker();
	});

	opaTest("Should see search result categories in the picker", function (Given, When, Then) {
		// Actions
		When.iLookAtTheScreen();

		// Assertions
		Then.onTheSearchPicker.iShouldSeeSearchResultCategories();
	});

	opaTest("Should navigate to search results page by clicking a category", function (Given, When, Then) {
		// Actions
		When.onTheSearchPicker.iClickOnCategoryInSearchPicker("API Reference");

		// Assertions
		Then.onTheSearchPage.iShouldSeeTheSearchResultsPage();
		Then.onTheSearchPage.iShouldSeeSearchResultsTitle("button");
		Then.onTheSearchPage.iShouldSeeSearchQueryInURL("button");
	});

	opaTest("Should see the search results sections and list", function (Given, When, Then) {
		// Actions
		When.iLookAtTheScreen();

		// Assertions
		Then.onTheSearchPage.iShouldSeeAllResultsSection();
		Then.onTheSearchPage.iShouldSeeSearchResultsList();
	});

	opaTest("Should navigate back to home and clear search", function (Given, When, Then) {
		// Actions
		When.onTheAppPage.iPressTheWelcomeTabButton();

		// Assertions
		Then.onTheWelcomePage.iShouldSeeTheWelcomePage();
	});

	opaTest("Should enter a new search query", function (Given, When, Then) {
		// Actions
		When.onTheSearchControl.iEnterTextInTheSearchField("table");

		// Assertions
		Then.onTheSearchControl.iShouldSeeSearchFieldValue("table");
		Then.onTheSearchPicker.iShouldSeeTheSearchPicker();
	});

	opaTest("Should clear the search field and close the picker", function (Given, When, Then) {
		// Actions
		When.onTheSearchControl.iClearTheSearchField();

		// Assertions
		Then.onTheSearchControl.iShouldSeeEmptySearchField();
		Then.onTheSearchPicker.iShouldNotSeeTheSearchPicker();
	});

	opaTest("Should search from API Reference section", function (Given, When, Then) {
		// Actions
		When.onTheAppPage.iPressTheApiMasterTabButton();
		When.onTheSearchControl.iEnterTextInTheSearchField("Button");

		// Assertions
		Then.onTheSearchControl.iShouldSeeSearchFieldValue("Button");
		Then.onTheSearchPicker.iShouldSeeTheSearchPicker();
	});

	opaTest("Should navigate to search results from API section", function (Given, When, Then) {
		// Actions
		When.onTheSearchPicker.iClickOnCategoryInSearchPicker("API Reference");

		// Assertions
		Then.onTheSearchPage.iShouldSeeTheSearchResultsPage();
		Then.onTheSearchPage.iShouldSeeSearchResultsTitle("Button");
	});

	opaTest("Should search with query that has no results", function (Given, When, Then) {
		// Actions
		When.onTheAppPage.iPressTheWelcomeTabButton();
		When.onTheSearchControl.iEnterTextInTheSearchField("xyzabc123notfound");

		// Assertions
		Then.onTheSearchControl.iShouldSeeSearchFieldValue("xyzabc123notfound");
		Then.onTheSearchPicker.iShouldSeeTheSearchPicker();
	});

	opaTest("Should see no results message", function (Given, When, Then) {
		// Actions
		When.iLookAtTheScreen();

		// Assertions
		Then.onTheSearchPicker.iShouldSeeNoResultsMessage();
	});

	// =====================================================
	// Edge Cases and Negative Tests
	// =====================================================

	opaTest("Should handle special characters in search query", function (Given, When, Then) {
		// Actions - enter query with special characters (ampersand, angle brackets)
		When.onTheSearchControl.iClearTheSearchField();
		When.onTheSearchControl.iEnterTextInTheSearchField("test&value<tag>");

		// Assertions - verify special characters are displayed correctly
		Then.onTheSearchControl.iShouldSeeSearchFieldValue("test&value<tag>");
		Then.onTheSearchPicker.iShouldSeeTheSearchPicker();
	});

	opaTest("Should handle single character search", function (Given, When, Then) {
		// Actions - minimum viable search query
		When.onTheSearchControl.iClearTheSearchField();
		When.onTheSearchControl.iEnterTextInTheSearchField("a");

		// Assertions
		Then.onTheSearchControl.iShouldSeeSearchFieldValue("a");
		Then.onTheSearchPicker.iShouldSeeTheSearchPicker();
	});

	opaTest("Should teardown my app", function(Given, When, Then) {
		Opa5.assert.expect(0);
		Then.iTeardownMyApp();
	});

});
