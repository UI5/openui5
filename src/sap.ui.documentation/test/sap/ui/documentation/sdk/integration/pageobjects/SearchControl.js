sap.ui.define([
	'sap/ui/test/Opa5'
], function (Opa5) {
	"use strict";

	var SEARCH_CONTROL_ID = "searchControl";
	var SEARCH_CONTROL_TYPE = "sap.f.gen.ui5.webcomponents_fiori.dist.ShellBarSearch";

	Opa5.createPageObjects({
		onTheSearchControl: {
			viewName: "App",

			actions: {
				/**
				 * Enter text in the Web Component search field.
				 * The <code>ShellBarSearch</code> renders in shadow DOM, so the value is set
				 * on the control and the native <code>input</code> event handler is triggered.
				 * @param {string} sSearchQuery - The text to enter in the search field
				 */
				iEnterTextInTheSearchField: function (sSearchQuery) {
					return this.waitFor({
						id: SEARCH_CONTROL_ID,
						success: function (oSearchField) {
							oSearchField.setValue(sSearchQuery);
							oSearchField.fireEvent("input");
						},
						errorMessage: "Could not enter text in search field"
					});
				},

				/**
				 * Clear the search field.
				 */
				iClearTheSearchField: function () {
					return this.waitFor({
						id: SEARCH_CONTROL_ID,
						success: function (oSearchField) {
							oSearchField.setValue("");
							oSearchField.fireEvent("input");
						},
						errorMessage: "Could not clear the search field"
					});
				},

				/**
				 * Trigger the native search (Enter key / search button).
				 */
				iPressTheSearchButton: function () {
					return this.waitFor({
						id: SEARCH_CONTROL_ID,
						success: function (oSearchField) {
							oSearchField.fireEvent("search");
						},
						errorMessage: "Could not trigger the search"
					});
				}
			},

			assertions: {
				/**
				 * Verify the search field is present and is the ShellBarSearch Web Component.
				 */
				iShouldSeeTheSearchField: function () {
					return this.waitFor({
						id: SEARCH_CONTROL_ID,
						success: function (oSearchField) {
							Opa5.assert.ok(
								oSearchField.isA(SEARCH_CONTROL_TYPE),
								"Search field is the Web Component ShellBarSearch"
							);
						},
						errorMessage: "Search field was not found"
					});
				},

				/**
				 * Verify the search field has a specific value.
				 * @param {string} sExpectedValue - The expected value in the search field
				 */
				iShouldSeeSearchFieldValue: function (sExpectedValue) {
					return this.waitFor({
						id: SEARCH_CONTROL_ID,
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
				 * Verify the search field is empty.
				 */
				iShouldSeeEmptySearchField: function () {
					return this.waitFor({
						id: SEARCH_CONTROL_ID,
						success: function (oSearchField) {
							Opa5.assert.strictEqual(
								oSearchField.getValue(),
								"",
								"Search field is empty"
							);
						},
						errorMessage: "Search field is not empty"
					});
				}
			}
		}
	});
});
