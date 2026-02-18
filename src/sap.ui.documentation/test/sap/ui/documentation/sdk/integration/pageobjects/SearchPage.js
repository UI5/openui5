sap.ui.define([
	'sap/ui/test/Opa5',
	'sap/ui/test/matchers/PropertyStrictEquals'
], function (Opa5, PropertyStrictEquals) {
	"use strict";

	Opa5.createPageObjects({
		onTheSearchPage: {
			viewName: "SearchPage",

			actions: {
				// No actions needed for initial implementation
			},

			assertions: {
				/**
				 * Verify the search results page is displayed
				 */
				iShouldSeeTheSearchResultsPage: function () {
					return this.waitFor({
						controlType: "sap.uxap.ObjectPageLayout",
						success: function (aPages) {
							Opa5.assert.ok(aPages.length > 0, "Search results page is displayed");
						},
						errorMessage: "Search results page was not found"
					});
				},

				/**
				 * Verify the page title contains the search query
				 * @param {string} sExpectedQuery - The expected search query in the title
				 */
				iShouldSeeSearchResultsTitle: function (sExpectedQuery) {
					return this.waitFor({
						controlType: "sap.uxap.ObjectPageHeader",
						success: function (aHeaders) {
							var oHeader = aHeaders[0];
							var sTitle = oHeader.getObjectTitle();
							Opa5.assert.ok(
								sTitle.includes(sExpectedQuery),
								"Page title includes search query '" + sExpectedQuery + "': " + sTitle
							);
						},
						errorMessage: "Search results page header was not found"
					});
				},

				/**
				 * Verify "All Results" section is displayed
				 */
				iShouldSeeAllResultsSection: function () {
					return this.waitFor({
						id: "allSummaryTitle",
						autoWait: false,
						visible: false,
						success: function (oSection) {
							Opa5.assert.ok(oSection, "All Results section is present");
							Opa5.assert.ok(oSection.getVisible(), "All Results section is visible");
						},
						errorMessage: "All Results section was not found"
					});
				},

				/**
				 * Verify the search results list is present
				 */
				iShouldSeeSearchResultsList: function () {
					return this.waitFor({
						controlType: "sap.m.List",
						viewName: "SearchPage",
						matchers: new PropertyStrictEquals({
							name: "growing",
							value: true
						}),
						autoWait: false,
						success: function (aLists) {
							Opa5.assert.ok(aLists.length > 0, "Search results list is present");
							var oList = aLists[0];
							Opa5.assert.ok(
								oList.getGrowingThreshold() === 25,
								"List has correct growing threshold (25)"
							);
						},
						errorMessage: "Search results list was not found"
					});
				},

				/**
				 * Verify the URL hash contains the search query
				 * @param {string} sExpectedQuery - The expected search query in the URL
				 */
				iShouldSeeSearchQueryInURL: function (sExpectedQuery) {
					return this.waitFor({
						success: function () {
							// Use Opa5.getWindow() to get the app's window (works in both component and iframe tests)
							var oWindow = Opa5.getWindow();
							var sHash = oWindow.location.hash;
							Opa5.assert.ok(
								sHash.includes("search/" + sExpectedQuery),
								"URL hash contains 'search/" + sExpectedQuery + "': " + sHash
							);
						},
						errorMessage: "URL hash does not contain expected search query"
					});
				}
			}
		}
	});
});
