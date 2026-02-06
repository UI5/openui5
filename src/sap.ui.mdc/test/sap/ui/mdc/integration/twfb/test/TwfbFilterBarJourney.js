/*!
 * ${copyright}
 */

/* global QUnit, sinon */

sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/opaQunit",
	"sap/ui/test/actions/Press",
	"sap/ui/test/matchers/PropertyStrictEquals"
], function(
	Opa5,
	opaTest,
	Press,
	PropertyStrictEquals
) {
	"use strict";


	const oModuleSettings = {
		beforeEach: function() {},
		afterEach: function() {}
	};

	QUnit.module("TwFb - FilterBar", oModuleSettings);

	opaTest("twfb - start app and test filterbar", function(Given, When, Then) {
		Given.iStartMyAppInAFrame("test-resources/sap/ui/mdc/internal/TableWithFilterBar/index.html");

		const sFilterBarID = "container-v4demo---books--booksFilterBar";
		// for the Filterbar the sFilterBarID can be Object instance or id string.
		When.onTheMDCFilterBar.iPersonalizeFilter(sFilterBarID, { Books: ["Author ID"] });
		//    When.onTheMDCChart.iPersonalizeFilter(sFilterBarID, [{key : "language_code", operator: "EQ", values: ["DE"], inputControl: "__component0---books--booksTable--filter--language_code"}]);
		//TODO no assertions available
		When.onTheMDCFilterBar.iResetThePersonalization(sFilterBarID);

		When.onTheMDCFilterBar.iEnterFilterValue(sFilterBarID, { // Why does this action always change FilterValues on the Adapt Filters dialog and not directly on the FB?
			Books: {
				label: "Author ID",
				values: ["101"] //, "102" ]
			}
		});
		When.onTheMDCFilterBar.iEnterFilterValue(sFilterBarID, { // Why does this action always change FilterValues on the Adapt Filters dialog and not directly on the FB?
			Books: {
				label: "Title",
				values: ["Pride and Prejudice"]
			}
		});
		Then.onTheMDCFilterBar.iShouldSeeFilters(sFilterBarID, {
			// Why do I not need the Books group in the iShouldSeeFilters?
			// Why can I not test the expected values in the format values: [ "101", "102" ]?
			"Author ID": [
				{
					operator: "EQ",
					values: [ 101, "Austen, Jane" ]
				} //,
				// {
				// 	operator: "EQ",
				// 	values: [ 102, "Gilman, Charlotte Perkins" ]
				// }
			]
		});

		When.onTheMDCFilterBar.iExpectSearch(sFilterBarID);

		//ERROR Clear does not work. It waits for tokens which are not visible on the field
		When.onTheMDCFilterBar.iClearFilterValue(sFilterBarID, "Author ID");
		Then.onTheMDCFilterBar.iShouldSeeFilters(sFilterBarID, {
			"Author ID": []
		});
		When.onTheMDCFilterBar.iExpectSearch(sFilterBarID);

		Then.iTeardownMyAppFrame();
	});

	QUnit.module("TwFb - End-to-End", oModuleSettings);

	opaTest("twfb - Search one book, navigate to factsheet, change the price and save it.", function(Given, When, Then) {
		const booksComponentID = "container-v4demo---books--";
		const sFilterBarID = booksComponentID + "booksFilterBar";

		// I start the Manage Books TwFb example app
		// Already possible to start the app, but we see the current Books Service content and not a new (fresh) set of data.
		Given.iStartMyAppInAFrame("test-resources/sap/ui/mdc/internal/TableWithFilterBar/index.html");



		// I should see the Standard Variant and Filterbar with empty FilterFields
		// Then.onTheMDCVariant.iShouldSeeTheVariantManagerButton("Standard");

		Then.onTheMDCFilterBar.iShouldSeeTheFilterBar();
		Then.onTheMDCFilterBar.iShouldSeeTheAdaptFiltersButton();
		//TODO iShouldSeeTheFilterFieldsWithLabels does not work when we have a basic search field on the Filterbar.
		//Then.onTheMDCFilterBar.iShouldSeeTheFilterFieldsWithLabels(["", "Author ID", "Title", "Stock range", "Published", "Language", "Genre", "Sub Genre"]);

		// Chart (I should see a "Books Chart" Chart with Bars chart)
		const sChartID = "container-v4demo---books--bookChart";
		Then.onTheMDCChart.iShouldSeeAChart();
		Then.onTheMDCChart.iShouldSeeTheChartWithChartType(sChartID, "column");



		// I search books with titles "Wallpaper" using the Search Books filter field
		//TODO iEnterTextOnTheFilterField only works for FilterFields having a label, but not for the basic search
		//TODO should work with id instead of label as parameter
		// When.onTheMDCFilterField.iEnterTextOnTheFilterField("Title", "*Wallpaper*");

		When.onTheMDCFilterBar.iEnterFilterValue(sFilterBarID, {
			Books: {
				label: "Title",
				values: ["*Wallpaper*"]
			}
		});
		Then.onTheMDCFilterBar.iShouldSeeFilters(sFilterBarID, {
			"Title": [
				{
					operator: "Contains",
					values: ["Wallpaper" ]
				}
			]
		});



		//I press the Go button (or press enter in the search field)
		When.onTheMDCFilterBar.iExpectSearch(sFilterBarID);

		// I click on the row The Yellow Wallpaper
		const link = {text: "The Yellow Wallpaper"};
		When.onTheMDCLink.iPressTheLink(link);
		When.onTheMDCLink.iPressLinkOnPopover(link, "Manage book");



		//I should see a new Factsheet screen….
		// Not available



		//I toggle the screen into  edit mode (press Edit button)
		When.util.iPressButton("Edit");



		//I should see an editable field Price with value 22.00 GBP
		const sFieldId = "container-v4demo---bookdetails--fPrice";
		// Then.onTheMDCField.iShouldSeeTheFieldWithValues(sFieldId, ['22', 'GBP']);



		//I change the Price to 48.79 GBP
		// TODO How can I change value and unit
		When.onTheMDCField.iEnterTextOnTheField(sFieldId, '48.79');



		//I save the changed price
		When.util.iPressButton("Save");


		// TODO revert the database modifications
		// When.onTheMDCLink.iPressTheLink(link);
		// When.onTheMDCLink.iPressLinkOnPopover(link, "Manage book");
		// When.util.iPressButton("Edit");
		// When.onTheMDCField.iEnterTextOnTheField(sFieldId, "22.00");
		// When.util.iPressButton("Save");

		Then.iTeardownMyAppFrame();
	});

	opaTest("twfb - Search a book via Created On DateTime filterfield.", function(Given, When, Then) {
		const booksComponentID = "container-v4demo---books--";
		const sFilterBarID = booksComponentID + "booksFilterBar";

		// I start the Manage Books TwFb example app
		Given.iStartMyAppInAFrame("test-resources/sap/ui/mdc/internal/TableWithFilterBar/index.html");

		When.onTheMDCFilterBar.iPersonalizeFilter(sFilterBarID, {	Books: ["Created On"] });
		When.onTheMDCFilterField.iEnterTextOnTheFilterField({ label: "Created On" }, "Feb 22, 2005, 6:24:25 PM");

		//I press the Go button (or press enter in the search field)
		When.onTheMDCFilterBar.iExpectSearch(sFilterBarID);

		Then.iTeardownMyAppFrame();
	});

	opaTest("twfb - when resetting invalid field with variant management, no error should occur", function(Given, When, Then) {
		Given.iStartMyAppInAFrame({source: "test-resources/sap/ui/mdc/internal/TableWithFilterBar/index.html"});

		const sAppBaseId = "container-v4demo---books";
		const sFilterBarId = sAppBaseId + "--booksFilterBar";
		const sSearchButtonId = sFilterBarId + "-btnSearch";
		const sVariantManagementId = sAppBaseId + "--IDVariantManagementOfTable-vm-trigger";

		// Enter invalid value into Language filter field
		When.onTheMDCFilterField.iEnterTextOnTheFilterField({ label: "Language" }, "1234");

		// Open variant management and reset to standard variant
		When.waitFor({
			id: sVariantManagementId,
			success: function (oVariantBtn) {
				new Press().executeOn(oVariantBtn);

				When.waitFor({
					controlType: "sap.ui.core.Item",
					matchers: new PropertyStrictEquals({name: "text", value: "Standard"}),
					success: function(aItems) {
						// reset to standard variant
						new Press().executeOn(aItems[0]);

						// Verify filter field has been reset
						Then.onTheMDCFilterField.iShouldSeeTheFilterFieldWithValues({ label: "Language" }, "");

						When.waitFor({
							id: sFilterBarId,
							success: function (oFilterBar) {
								// If an error message is shown, it is called from within visualizeValidationState in the FilterBar delegate
								const visualizeSpy = sinon.spy(oFilterBar.getControlDelegate(), "visualizeValidationState");

								When.waitFor({
									id: sSearchButtonId,
									success: function (oSearchBtn) {
										// Trigger the "go" button
										new Press().executeOn(oSearchBtn);

										// Give some time to the filterBar to process the search and call the delegate methods
										When.iWaitForPromise(new Promise(function (resolve) { setTimeout(resolve, 100);})).then(() => {
											// Verify that visualizeValidationState was called with a "NoError" status
											Opa5.assert.strictEqual(visualizeSpy.getCall(0).args[1].status, "NoError", "No error message box shown");
											visualizeSpy.restore();
										});
									}
								});
							}
						});
					}
				});
			}
		});

		// Reset the app
		Then.iTeardownMyAppFrame();
	});
});
