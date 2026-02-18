sap.ui.define([
	'sap/ui/test/Opa5',
	'sap/ui/test/actions/EnterText',
	'sap/ui/test/actions/Press'
], function (Opa5, EnterText, Press) {
	"use strict";

	Opa5.createPageObjects({
		onTheSearchControl: {
			viewName: "App",

			actions: {
				/**
				 * Enter text in the search field
				 * @param {string} sSearchQuery - The text to enter in the search field
				 */
				iEnterTextInTheSearchField: function (sSearchQuery) {
					return this.waitFor({
						id: "searchControl-searchField",
						actions: new EnterText({
							text: sSearchQuery,
							clearTextFirst: true,
							keepFocus: true
						}),
						errorMessage: "Could not enter text in search field"
					});
				},

				/**
				 * Clear the search field
				 */
				iClearTheSearchField: function () {
					return this.waitFor({
						id: "searchControl-searchField",
						actions: new EnterText({
							text: "",
							clearTextFirst: true
						}),
						errorMessage: "Could not clear the search field"
					});
				},

				/**
				 * Press the search button (for collapsed state, e.g., on phone)
				 */
				iPressTheSearchButton: function () {
					return this.waitFor({
						controlType: "sap.ui.documentation.Search",
						actions: new Press(),
						errorMessage: "Could not press the search button"
					});
				}
			},

			assertions: {
				/**
				 * Verify the search field is visible and enabled
				 */
				iShouldSeeTheSearchField: function () {
					return this.waitFor({
						id: "searchControl-searchField",
						success: function (oSearchField) {
							Opa5.assert.ok(oSearchField.getVisible(), "Search field is visible");
							Opa5.assert.ok(oSearchField.getEnabled(), "Search field is enabled");
						},
						errorMessage: "Search field was not found"
					});
				},

				/**
				 * Verify the search field has a specific value
				 * @param {string} sExpectedValue - The expected value in the search field
				 */
				iShouldSeeSearchFieldValue: function (sExpectedValue) {
					return this.waitFor({
						id: "searchControl-searchField",
						success: function (oSearchField) {
							Opa5.assert.strictEqual(
								oSearchField.getValue(),
								sExpectedValue,
								"Search field has the expected value: " + sExpectedValue
							);
						},
						errorMessage: "Search field value was not correct"
					});
				},

				/**
				 * Verify the search field is empty
				 */
				iShouldSeeEmptySearchField: function () {
					return this.waitFor({
						id: "searchControl-searchField",
						success: function (oSearchField) {
							Opa5.assert.strictEqual(
								oSearchField.getValue(),
								"",
								"Search field is empty"
							);
						},
						errorMessage: "Search field is not empty"
					});
				},

				/**
				 * Verify the search control is collapsed (button visible)
				 */
				iShouldSeeSearchButton: function () {
					return this.waitFor({
						controlType: "sap.ui.documentation.Search",
						success: function (aSearchControls) {
							var oSearch = aSearchControls[0];
							Opa5.assert.ok(
								!oSearch.getIsOpen(),
								"Search control is collapsed (button visible)"
							);
						},
						errorMessage: "Search control state is incorrect"
					});
				},

				/**
				 * Verify that special characters are properly escaped/displayed in the search field
				 * @param {string} sExpectedValue - The expected value including special characters
				 */
				iShouldSeeSpecialCharactersInSearchField: function (sExpectedValue) {
					return this.waitFor({
						id: "searchControl-searchField",
						success: function (oSearchField) {
							var sActualValue = oSearchField.getValue();
							Opa5.assert.strictEqual(
								sActualValue,
								sExpectedValue,
								"Search field correctly displays special characters"
							);
						},
						errorMessage: "Search field special character handling failed"
					});
				}
			}
		}
	});
});
