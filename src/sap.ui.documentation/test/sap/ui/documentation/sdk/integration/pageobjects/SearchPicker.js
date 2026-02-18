sap.ui.define([
	'sap/ui/test/Opa5',
	'sap/ui/test/actions/Press',
	'sap/ui/test/matchers/PropertyStrictEquals'
], function (Opa5, Press, PropertyStrictEquals) {
	"use strict";

	Opa5.createPageObjects({
		onTheSearchPicker: {
			viewName: "App",

			actions: {
				/**
				 * Click on a category in the search picker
				 * @param {string} sCategoryTitle - The title of the category to click (e.g., "API Reference", "Documentation")
				 */
				iClickOnCategoryInSearchPicker: function (sCategoryTitle) {
					return this.waitFor({
						controlType: "sap.m.StandardListItem",
						searchOpenDialogs: true,
						matchers: new PropertyStrictEquals({
							name: "title",
							value: sCategoryTitle
						}),
						actions: new Press(),
						errorMessage: "Could not find or press category item: " + sCategoryTitle
					});
				}
			},

			assertions: {
				/**
				 * Verify the search picker (popover) opens automatically
				 */
				iShouldSeeTheSearchPicker: function () {
					return this.waitFor({
						controlType: "sap.m.Popover",
						searchOpenDialogs: true,
						success: function (aPopovers) {
							Opa5.assert.ok(aPopovers.length > 0, "Search picker popover is displayed");
							var oPopover = aPopovers[0];
							Opa5.assert.ok(oPopover.isOpen(), "Popover is open");
						},
						errorMessage: "Search picker popover was not found or not open"
					});
				},

				/**
				 * Verify the search dialog opens (for phone view)
				 */
				iShouldSeeTheSearchDialog: function () {
					return this.waitFor({
						controlType: "sap.m.Dialog",
						searchOpenDialogs: true,
						success: function (aDialogs) {
							Opa5.assert.ok(aDialogs.length > 0, "Search dialog is displayed");
							var oDialog = aDialogs[0];
							Opa5.assert.ok(oDialog.isOpen(), "Dialog is open");
						},
						errorMessage: "Search dialog was not found or not open"
					});
				},

				/**
				 * Verify search result categories are present in the picker
				 */
				iShouldSeeSearchResultCategories: function () {
					return this.waitFor({
						controlType: "sap.m.List",
						searchOpenDialogs: true,
						matchers: new PropertyStrictEquals({
							name: "mode",
							value: "None"
						}),
						success: function (aLists) {
							// Find the list containing category items
							var oCategoryList = aLists.find(function(oList) {
								var aItems = oList.getItems();
								return aItems.some(function(oItem) {
									return oItem.getMetadata().getName() === "sap.m.StandardListItem" &&
										   (oItem.getTitle() === "API Reference" ||
											oItem.getTitle() === "Documentation" ||
											oItem.getTitle() === "Samples");
								});
							});

							Opa5.assert.ok(oCategoryList, "Category list was found");

							if (oCategoryList) {
								var aCategoryTitles = oCategoryList.getItems()
									.filter(function(oItem) {
										return oItem.getMetadata().getName() === "sap.m.StandardListItem";
									})
									.map(function(oItem) {
										return oItem.getTitle();
									});

								Opa5.assert.ok(
									aCategoryTitles.includes("API Reference"),
									"API Reference category is present"
								);
								Opa5.assert.ok(
									aCategoryTitles.includes("Documentation"),
									"Documentation category is present"
								);
								Opa5.assert.ok(
									aCategoryTitles.includes("Samples"),
									"Samples category is present"
								);
							}
						},
						errorMessage: "Search result categories were not found"
					});
				},

				/**
				 * Verify the search picker is closed
				 */
				iShouldNotSeeTheSearchPicker: function () {
					return this.waitFor({
						controlType: "sap.m.Popover",
						visible: false,
						success: function (aPopovers) {
							var bAllClosed = aPopovers.length === 0 || aPopovers.every(function(oPopover) {
								return !oPopover.isOpen();
							});
							Opa5.assert.ok(bAllClosed, "Search picker is closed");
						},
						errorMessage: "Search picker is still open"
					});
				},

				/**
				 * Verify no results message or empty state is shown
				 */
				iShouldSeeNoResultsMessage: function () {
					return this.waitFor({
						controlType: "sap.m.List",
						searchOpenDialogs: true,
						success: function (aLists) {
							var bHasNoResults = aLists.some(function(oList) {
								// Check if list has no items AND has a non-empty noDataText
								var bEmpty = oList.getItems().length === 0;
								var sNoDataText = oList.getNoDataText();
								return bEmpty && sNoDataText && sNoDataText.length > 0;
							});
							Opa5.assert.ok(bHasNoResults, "No results state is shown (empty list with noDataText)");
						},
						errorMessage: "No results state was not displayed"
					});
				}
			}
		}
	});
});
