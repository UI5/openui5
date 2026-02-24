sap.ui.define([
	'sap/ui/test/Opa5',
	'test-resources/sap/ui/mdc/qunit/p13n/OpaTests/utility/Arrangement',
	'test-resources/sap/ui/mdc/qunit/p13n/OpaTests/utility/Util',
	'test-resources/sap/ui/mdc/qunit/p13n/OpaTests/utility/Action',
	'test-resources/sap/ui/mdc/qunit/p13n/OpaTests/utility/Assertion',
	'sap/ui/Device',
	'sap/ui/core/Lib'
], function (Opa5, Arrangement, TestUtil, Action, Assertion, Device, Library) {
	'use strict';

	return function (opaTestOrSkip) {
		if (window.blanket) {
			//window.blanket.options("sap-ui-cover-only", "sap/ui/mdc");
			window.blanket.options("sap-ui-cover-never", "sap/viz");
		}

		Opa5.extendConfig({
			arrangements: new Arrangement(),
			actions: new Action(),
			assertions: new Assertion(),
			viewNamespace: "view.",
			autoWait: true
		});

		const oRb = Library.getResourceBundleFor("sap.ui.mdc");
		const oErrorAndWarningTexts = {
			Info: oRb.getText("adaptFiltersPanel.INFO_INVISIBLE_WITH_VALUE"),
			Warning1: oRb.getText("adaptFiltersPanel.WARNING_INVISIBLE_EMPTY_REMOVE")
		};

		const oFilterItems = {
			"Artists": [
				{p13nItem: "artistUUID", selected: true},
				{p13nItem: "Breakout Year", selected: true},
				{p13nItem: "cityOfOrigin_city", selected: false},
				{p13nItem: "Country", selected: false},
				{p13nItem: "Founding Year", selected: true},
				{p13nItem: "Name", selected: true},
				{p13nItem: "regionOfOrigin_code", selected: false}
			],
			"Countries": [
				{p13nItem: "Country Country Code", selected: false},
				{p13nItem: "Country Description", selected: false},
				{p13nItem: "Country Name", selected: false}
			],
			"Countries_texts": [
				{p13nItem: "Localized Country Code", selected: false},
				{p13nItem: "Localized Description", selected: false},
				{p13nItem: "Localized locale", selected: false},
				{p13nItem: "Localized Name", selected: false}
			],
			"Regions": [
				{p13nItem: "Region Country", selected: false},
				{p13nItem: "Region Region Code", selected: false},
				{p13nItem: "Region Region Name", selected: false}
			],
			"Cities": [
				{p13nItem: "City Code", selected: false},
				{p13nItem: "City Name", selected: false},
				{p13nItem: "Country Code", selected: false},
				{p13nItem: "Region Code", selected: false}
			]
		};

		opaTestOrSkip("When I start the 'appUnderTestTable' app, the FilterBar should appear", function (Given, When, Then) {
			//insert application
			Given.iStartMyAppInAFrame({
				source: 'test-resources/sap/ui/mdc/qunit/p13n/OpaTests/appUnderTestTable/TableOpaApp.html?sap-ui-xx-new-adapt-filters=true',
				autoWait: true
			});
			When.iLookAtTheScreen();

			//check buttons
			Then.iShouldSeeButtonWithText(Arrangement.P13nDialog.AdaptFilter.button);
			Then.iShouldSeeButtonWithText(Arrangement.P13nDialog.AdaptFilter.go);

			//check initially visible FilterFields
			Then.iShouldSeeVisibleFiltersInOrderInFilterBar(["Name", "Founding Year", "artistUUID", "Breakout Year"]);

			Then.theVariantManagementIsDirty(false);
		});

		opaTestOrSkip("When I press on 'Adapt Filters' button, the 'Adapt Filters' Dialog opens", function (Given, When, Then) {
			When.onTheMDCFilterBar.iPressOnTheAdaptFiltersButton();
			When.onTheMDCFilterBar.iChangeAdaptFiltersView("List");

			Then.thePersonalizationDialogOpens(false);
			Then.iShouldSeeAdaptFiltersTitle(Arrangement.P13nDialog.Titles.adaptFilter);

			Then.iShouldSeeSelectedListFilterItems(oFilterItems["Artists"]);

		});

		opaTestOrSkip("When I close the 'Adapt Filters' button, the FilterBar has not been changed", function (Given, When, Then) {
			When.onTheMDCFilterBar.iCloseTheAdaptFiltersDialogWithOk();

			//close p13n dialog
			Then.thePersonalizationDialogShouldBeClosed();

			//check initially visible FilterFields
			Then.iShouldSeeVisibleFiltersInOrderInFilterBar(["Name", "Founding Year", "artistUUID", "Breakout Year"]);

			//check dirty flag
			Then.theVariantManagementIsDirty(false);
		});


		// ----------------------------------------------------------------
		// Define new FilterFields
		// ----------------------------------------------------------------
		opaTestOrSkip("When I press on 'Adapt Filters' button, I change the FilterField selection", function (Given, When, Then) {
			When.iPersonalizeFilterColumns({
				Artists: ["Name", "Founding Year", "artistUUID", "Breakout Year", "Country", "cityOfOrigin_city"],
				Countries: ["Country Name"]
			});
			oFilterItems["Artists"][2].selected = true;
			oFilterItems["Artists"][3].selected = true;
			oFilterItems["Countries"][2].selected = true;

			When.onTheMDCFilterBar.iPressOnTheAdaptFiltersButton();
			Then.iShouldSeeSelectedListFilterItems(oFilterItems["Artists"]);
			Then.iShouldSeeSelectedListFilterItems(oFilterItems["Countries"]);

			When.onTheMDCFilterBar.iCloseTheAdaptFiltersDialogWithOk();

			Then.iShouldSeeVisibleFiltersInOrderInFilterBar(["Name", "Founding Year", "artistUUID", "Breakout Year", "Country", "cityOfOrigin_city", "Country Name"]);

			//check dirty flag
			Then.theVariantManagementIsDirty(true);
		});

		// ----------------------------------------------------------------
		// Move a FilterField to the top
		// ----------------------------------------------------------------
		opaTestOrSkip("When I select the 'Country' column and move it to the top, the FilterBar should be changed", function (Given, When, Then) {
			When.onTheMDCFilterBar.iPressOnTheAdaptFiltersButton();
			When.onTheMDCFilterBar.iChangeAdaptFiltersView("List");
			When.iToogleEditAndSortMode(false);
			When.onTheMDCFilterBar.iReorderFilterItem("Country", "Name", true);

			// Update the expected filter items after reordering
			oFilterItems["Artists"][3].selected = true; // Country
			oFilterItems["Artists"][2].selected = true; // cityOfOrigin_city

			Then.iShouldSeeSelectedListFilterItems(oFilterItems["Artists"]);
			When.onTheMDCFilterBar.iCloseTheAdaptFiltersDialogWithOk();
			Then.iShouldSeeVisibleFiltersInOrderInFilterBar(["Country", "Name", "Founding Year", "artistUUID", "Breakout Year", "cityOfOrigin_city", "Country Name"]);

		});

		// ----------------------------------------------------------------
		// Check view toggle
		// ----------------------------------------------------------------
		opaTestOrSkip("When toggling to list view to select filters and switch back the filters should be selected in both view modes", function(Given, When, Then){
			When.iPersonalizeFilterColumns({
				Artists: ["Name", "Founding Year", "artistUUID", "Breakout Year", "Country", "cityOfOrigin_city"],
				Countries: ["Country Name"],
				Countries_texts: ["Localized Country Code"]
			});

			oFilterItems["Countries_texts"][0].selected = true;

			When.onTheMDCFilterBar.iPressOnTheAdaptFiltersButton();
			When.onTheMDCFilterBar.iChangeAdaptFiltersView("Group");

			Then.iShouldSeeSelectedListFilterItems(oFilterItems["Artists"]);
			Then.iShouldSeeSelectedListFilterItems(oFilterItems["Countries"]);
			Then.iShouldSeeSelectedListFilterItems(oFilterItems["Countries_texts"]);
			Then.iShouldSeeSelectedListFilterItems(oFilterItems["Regions"]);
			Then.iShouldSeeSelectedListFilterItems(oFilterItems["Cities"]);
			When.onTheMDCFilterBar.iCloseTheAdaptFiltersDialogWithOk();
		});

		// ----------------------------------------------------------------
		// Define new FilterFields
		// ----------------------------------------------------------------
		opaTestOrSkip("Recheck Dialog on reopening and add/remove some more FilterFields", function (Given, When, Then) {

			//check dirty flag
			Then.theVariantManagementIsDirty(true);

			When.onTheMDCFilterBar.iPressOnTheAdaptFiltersButton();
			Then.thePersonalizationDialogOpens(false);
			When.onTheMDCFilterBar.iChangeAdaptFiltersView("List");
			When.iToogleEditAndSortMode(true);
			//deselect a FilterField
			When.iDeselectColumn("Country", oFilterItems["Artists"]);
			oFilterItems["Artists"][3].selected = false;
			Then.iShouldSeeSelectedListFilterItems(oFilterItems["Artists"]);

			When.onTheMDCFilterBar.iCloseTheAdaptFiltersDialogWithOk();

			Then.iShouldSeeVisibleFiltersInOrderInFilterBar(["Name", "Founding Year", "artistUUID", "Breakout Year", "cityOfOrigin_city", "Country Name", "Localized Country Code"]);

			//Select FilterField from different group
			When.iPersonalizeFilterColumns({
				Artists: ["Name", "Founding Year", "artistUUID", "Breakout Year", "cityOfOrigin_city"],
				Countries_texts: ["Localized Country Code"],
				Countries: ["Country Name"]
			});

			Then.iShouldSeeVisibleFiltersInOrderInFilterBar(["Name", "Founding Year", "artistUUID", "Breakout Year", "cityOfOrigin_city", "Country Name", "Localized Country Code"]);
		});


		// ----------------------------------------------------------------
		// Enter some values in Adapt Filters Dialog
		// ----------------------------------------------------------------
		opaTestOrSkip("Open the filter personalization dialog and enter some values", function (Given, When, Then) {
			When.iEnterFilterValue("Founding Year", "Artists", ["1989"]);
			oFilterItems["Artists"][4].value = ["1989"];

			When.iEnterFilterValue("Country Name", "Countries", ["DE"]);
			oFilterItems["Countries"][2].value = ["DE"];

		});

		opaTestOrSkip("When the AdaptFilters Dialog closed, the FilterBar has not been changed", function (Given, When, Then) {
			Then.thePersonalizationDialogShouldBeClosed();

			//check initially visible FilterFields
			Then.iShouldSeeVisibleFiltersInOrderInFilterBar(["Name", "Founding Year", "artistUUID", "Breakout Year", "cityOfOrigin_city", "Country Name", "Localized Country Code"]);

			//check dirty flag
			Then.theVariantManagementIsDirty(true);
		});

		opaTestOrSkip("Reopen Dialog to check values", function (Given, When, Then) {
			When.onTheMDCFilterBar.iPressOnTheAdaptFiltersButton();

			//recheck values upon opening
			Then.iShouldSeeSelectedListFilterItems(oFilterItems["Countries"]);
			Then.iShouldSeeSelectedListFilterItems(oFilterItems["Artists"]);

			//shut down app frame for next test
			Then.iTeardownMyAppFrame();
		});

		opaTestOrSkip("When I start the 'appUnderTestTable' app, the FilterBar should be toggled to not persist values (modify p13nMode)", function (Given, When, Then) {
			//insert application
			Given.iStartMyAppInAFrame({
				source: 'test-resources/sap/ui/mdc/qunit/p13n/OpaTests/appUnderTestTable/TableOpaApp.html?sap-ui-xx-new-adapt-filters=true',
				autoWait: true
			});
			When.iLookAtTheScreen();

			When.iSetP13nMode("sap.ui.mdc.FilterBar", ["Item"]);

			//open dialig
			When.onTheMDCFilterBar.iPressOnTheAdaptFiltersButton();
			When.onTheMDCFilterBar.iChangeAdaptFiltersView("Group");
			Then.thePersonalizationDialogOpens(false);
			When.onTheMDCFilterBar.iCloseTheAdaptFiltersDialogWithOk();

			//Go to "Artists" and enter a value
			When.iEnterFilterValue("Founding Year", "Artists", ["1989"]);
			oFilterItems["Artists"][4].value = ["1989"];
			//check dirty flag
			//since 1.115 Value is always implicitly set.
			Then.theVariantManagementIsDirty(true);

			Then.iTeardownMyAppFrame();
		});

		// ----------------------------------------------------------------
		// Prepare dirty changes for reset tests
		// ----------------------------------------------------------------
		opaTestOrSkip("When I start the 'appUnderTestTable' app and create new p13n changes - create some changes", function (Given, When, Then) {
			//insert application
			Given.iStartMyAppInAFrame({
				source: 'test-resources/sap/ui/mdc/qunit/p13n/OpaTests/appUnderTestTable/TableOpaApp.html?sap-ui-xx-new-adapt-filters=true',
				autoWait: true
			});
			When.iLookAtTheScreen();

			When.iSetP13nMode("sap.ui.mdc.FilterBar", ["Item","Value"]);

			//open dialig
			When.onTheMDCFilterBar.iPressOnTheAdaptFiltersButton();
			When.onTheMDCFilterBar.iChangeAdaptFiltersView("Group");
			Then.thePersonalizationDialogOpens(false);
			When.onTheMDCFilterBar.iCloseTheAdaptFiltersDialogWithOk();

			When.iEnterFilterValue("Founding Year", "Artists", ["1989"]);
			oFilterItems["Artists"][4].value = ["1989"];
			When.iPersonalizeFilterColumns({
				Artists: ["Name", "Founding Year", "artistUUID", "Breakout Year", "Country"]
			});
			oFilterItems["Artists"][2].selected = false;//needs to be reset due to prior test
			//check dirty flag
			Then.theVariantManagementIsDirty(true);

		});

		// ----------------------------------------------------------------
		// Open Dialog, Press escape and reopen it
		// ----------------------------------------------------------------
		opaTestOrSkip("When I press 'Escape' the Dialog should close and open again after triggering 'Adapt Filters' afterwards", function (Given, When, Then) {

			//open dialig
			When.onTheMDCFilterBar.iPressOnTheAdaptFiltersButton();
			Then.thePersonalizationDialogOpens(false);

			//Press 'Escape'
			When.iPressEscapeInDialog();

			//check that p13n dialog is closed
			Then.thePersonalizationDialogShouldBeClosed();

			//open dialig (--> Check that cleanup works as expected)
			When.onTheMDCFilterBar.iPressOnTheAdaptFiltersButton();
			Then.thePersonalizationDialogOpens(false);
		});

		// ----------------------------------------------------------------
		// Cancel Reset (Standard variant) --> no changes reverted
		// ----------------------------------------------------------------
		opaTestOrSkip("Press reset and cancel - no changes expected", function(Given, When, Then){

			Then.iShouldSeeSelectedListFilterItems(oFilterItems["Artists"]);
			When.iPressResetInDialog();
			When.iCancelResetWarning();

			When.onTheMDCFilterBar.iCloseTheAdaptFiltersDialogWithOk();
		});

		// ----------------------------------------------------------------
		// Confirm Reset (Standard variant) --> dirty changes reverted
		// ----------------------------------------------------------------
		opaTestOrSkip("Press reset and confirm - reset should revert the changes based on the current variant", function(Given, When, Then){

			When.iResetTheAdaptFiltersDialog();
			When.onTheMDCFilterBar.iPressOnTheAdaptFiltersButton();

			//Only array will trigger a check --> reset should also clear filter values not just the selection
			//[undefined] = no value in field
			oFilterItems["Artists"][4].value = [undefined];
			oFilterItems["Artists"][3].selected = false;

			Then.iShouldSeeSelectedListFilterItems(oFilterItems["Artists"]);

			When.onTheMDCFilterBar.iCloseTheAdaptFiltersDialogWithOk();

			Given.enableAndDeleteLrepLocalStorage();
			Then.iTeardownMyAppFrame();
		});

		// ----------------------------------------------------------------
		// test funconilities of new Adapt Filters dialog
		// ----------------------------------------------------------------
		opaTestOrSkip("Search for Filter via Search Field", function(Given, When, Then){
			Given.iStartMyAppInAFrame({
				source: 'test-resources/sap/ui/mdc/qunit/p13n/OpaTests/appUnderTestTable/TableOpaApp.html?sap-ui-xx-new-adapt-filters=true',
				autoWait: true
			});
			When.onTheMDCFilterBar.iPressOnTheAdaptFiltersButton();
			When.iSearchForFilter("Breakout Year");
			Then.iShouldSeeFilterSearchResultInADP("Breakout Year");

			Then.iTeardownMyAppFrame();
		});

		opaTestOrSkip("Check Validation", function(Given, When, Then){
			Given.iStartMyAppInAFrame({
				source: 'test-resources/sap/ui/mdc/qunit/p13n/OpaTests/appUnderTestTable/TableOpaApp.html?sap-ui-xx-new-adapt-filters=true',
				autoWait: true
			});
			When.onTheMDCFilterBar.iPressOnTheAdaptFiltersButton();
			When.iDeselectColumn("Name", oFilterItems["Artists"]);
			Then.iShouldSeeValueStateInAdaptFiltersPanel("Name", "Warning", oErrorAndWarningTexts.Warning1);
			oFilterItems["Artists"][0].selected = false;
			When.onTheMDCFilterBar.iCloseTheAdaptFiltersDialogWithOk();
			When.iEnterFilterValue("Founding Year", "Artists", ["1989"]);
			When.onTheMDCFilterBar.iPressOnTheAdaptFiltersButton();
			When.iDeselectColumn("Founding Year", oFilterItems["Artists"]);
			Then.iShouldSeeValueStateInAdaptFiltersPanel("Founding Year", "Information", oErrorAndWarningTexts.Info);
			oFilterItems["Artists"][1].selected = false;

			When.onTheMDCFilterBar.iCloseTheAdaptFiltersDialogWithOk();
			When.iResetTheAdaptFiltersDialog();
			When.onTheMDCFilterBar.iPressOnTheAdaptFiltersButton();
			Then.iShouldSeeValueStateInAdaptFiltersPanel("Name", "None", "");
			Then.iShouldSeeValueStateInAdaptFiltersPanel("Founding Year", "None", "");
			Then.iShouldSeeValueStateInAdaptFiltersPanel("artistUUID", "None", "");
			Then.iShouldSeeValueStateInAdaptFiltersPanel("Breakout Year", "None", "");

			// test required field in unit test because of issue when setting required in delegate

			Then.iTeardownMyAppFrame();
		});

	};
});
