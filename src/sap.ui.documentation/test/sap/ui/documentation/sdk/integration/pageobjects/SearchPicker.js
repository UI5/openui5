sap.ui.define([
	'sap/ui/test/Opa5'
], function (Opa5) {
	"use strict";

	var SEARCH_CONTROL_ID = "searchControl";

	Opa5.createPageObjects({
		onTheSearchPicker: {
			viewName: "App",

			actions: {
				/**
				 * Navigate to the search results page by triggering the native search.
				 * The WC suggestion popup does not expose per-category items as discrete
				 * UI5 controls, so category-level navigation cannot be distinguished here.
				 * TODO: verify category-specific routing once the WC API supports it.
				 * @param {string} sCategoryTitle - Kept for API compatibility (not used for routing)
				 */
				iClickOnCategoryInSearchPicker: function (sCategoryTitle) {
					return this.waitFor({
						id: SEARCH_CONTROL_ID,
						success: function (oSearchField) {
							oSearchField.fireEvent("search");
						},
						errorMessage: "Could not trigger the search from the picker"
					});
				}
			},

			assertions: {
				/**
				 * Verify the native suggestion popup is populated with suggestion items.
				 */
				iShouldSeeTheSearchPicker: function () {
					return this.waitFor({
						id: SEARCH_CONTROL_ID,
						check: function (oSearchField) {
							return oSearchField.getItems().length > 0;
						},
						success: function (oSearchField) {
							Opa5.assert.ok(
								oSearchField.getItems().length > 0,
								"Native search suggestions are displayed"
							);
						},
						errorMessage: "Native search suggestions were not found"
					});
				},

				/**
				 * The phone view no longer uses a separate dialog - the native popup is used.
				 * Kept as an alias for the suggestion popup assertion.
				 */
				iShouldSeeTheSearchDialog: function () {
					return this.iShouldSeeTheSearchPicker();
				},

				/**
				 * Verify suggestions are grouped by category (Documentation / API Reference / Samples).
				 */
				iShouldSeeSearchResultCategories: function () {
					return this.waitFor({
						id: SEARCH_CONTROL_ID,
						check: function (oSearchField) {
							return oSearchField.getItems().length > 0;
						},
						success: function (oSearchField) {
							var aGroups = oSearchField.getItems().filter(function (oItem) {
								return oItem.isA("sap.f.gen.ui5.webcomponents_fiori.dist.SearchItemGroup");
							});
							Opa5.assert.ok(
								aGroups.length > 0,
								"Grouped search suggestions are present"
							);
						},
						errorMessage: "Grouped search suggestions were not found"
					});
				},

				/**
				 * Verify the native suggestion popup is closed.
				 */
				iShouldNotSeeTheSearchPicker: function () {
					return this.waitFor({
						id: SEARCH_CONTROL_ID,
						check: function (oSearchField) {
							return !oSearchField.getOpen();
						},
						success: function (oSearchField) {
							Opa5.assert.ok(
								!oSearchField.getOpen(),
								"Search suggestion popup is closed"
							);
						},
						errorMessage: "Search suggestion popup is still open"
					});
				},

				/**
				 * Verify the "no results" state is shown for a query without matches.
				 * The renderer represents this as a single no-data placeholder item
				 * (custom data <code>_payload.type === "noData"</code>) inside the results
				 * group, and renders no category items - not by leaving the list empty.
				 */
				iShouldSeeNoResultsMessage: function () {
					var fnHasNoDataPlaceholder = function (oSearchField) {
						// Flatten group items into a single list of leaf SearchItems.
						var aLeafItems = oSearchField.getItems().reduce(function (aAcc, oItem) {
							return aAcc.concat(oItem.getItems ? oItem.getItems() : [oItem]);
						}, []);

						var aPayloads = aLeafItems.map(function (oItem) {
							var oData = oItem.data("_payload");
							return oData ? oData.type : undefined;
						});

						// The no-results state contains the noData placeholder and no
						// actual result or category suggestions.
						return aPayloads.indexOf("noData") !== -1
							&& aPayloads.indexOf("result") === -1
							&& aPayloads.indexOf("category") === -1;
					};

					return this.waitFor({
						id: SEARCH_CONTROL_ID,
						check: fnHasNoDataPlaceholder,
						success: function (oSearchField) {
							Opa5.assert.ok(
								fnHasNoDataPlaceholder(oSearchField),
								"The no-results placeholder is shown for a query without matches"
							);
						},
						errorMessage: "The no-results placeholder was not displayed"
					});
				}
			}
		}
	});
});
