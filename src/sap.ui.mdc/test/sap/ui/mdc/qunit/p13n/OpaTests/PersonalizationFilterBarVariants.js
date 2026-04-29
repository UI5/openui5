sap.ui.define([
	'sap/ui/test/Opa5',
	'test-resources/sap/ui/mdc/qunit/p13n/OpaTests/utility/Arrangement',
	'test-resources/sap/ui/mdc/qunit/p13n/OpaTests/utility/Util',
	'test-resources/sap/ui/mdc/qunit/p13n/OpaTests/utility/Action',
	'test-resources/sap/ui/mdc/qunit/p13n/OpaTests/utility/Assertion',
	'sap/ui/Device'
], function (Opa5, Arrangement, TestUtil, Action, Assertion, Device) {
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


		// ----------------------------------------------------------------
		// Define new FilterFields and enter values
		// ----------------------------------------------------------------
		opaTestOrSkip("When I press on 'Adapt Filters' button, I change the FilterField selection", function (Given, When, Then) {
			//add 3 new FilterFields
			When.iPersonalizeFilterColumns({
                Artists: ["Name", "Founding Year", "artistUUID", "Breakout Year", "Country", "cityOfOrigin_city"],
                Countries: ["Country Name"]
            });
			oFilterItems["Artists"][3].selected = true;
			oFilterItems["Artists"][2].selected = true;
			oFilterItems["Countries"][2].selected = true;

			//Enter some values
			When.iEnterFilterValue("Founding Year", "Artists", ["1989"]);
			oFilterItems["Artists"][4].value = ["1989"];
			When.iEnterFilterValue("Country Name", "Countries", ["DE"]);
			oFilterItems["Countries"][2].value = ["DE"];


			//check that variant is dirty
			Then.theVariantManagementIsDirty(true);

			//save as a new variant
			Then.iShouldSeeSelectedVariant("Standard");
			When.iSaveVariantAs("Standard", "FilterBarVariant");
			Then.iShouldSeeSelectedVariant("FilterBarVariant");

			//select a default variant
			When.iSelectDefaultVariant("FilterBarVariant");
			Then.iShouldSeeSelectedVariant("FilterBarVariant");

			//shut down app frame for next test
			Then.iTeardownMyAppFrame();

		});

		opaTestOrSkip("When I start the 'appUnderTestTable' app, the current variant should affect the FilterBar", function (Given, When, Then) {
			//insert application
			Given.iStartMyAppInAFrame({
				source: 'test-resources/sap/ui/mdc/qunit/p13n/OpaTests/appUnderTestTable/TableOpaApp.html?sap-ui-xx-new-adapt-filters=true',
				autoWait: true
			});
			When.iLookAtTheScreen();

			Then.iShouldSeeButtonWithText(Arrangement.P13nDialog.AdaptFilter.getButtonCountText(2));
			Then.iShouldSeeButtonWithText(Arrangement.P13nDialog.AdaptFilter.go);

			//check initially visible FilterFields
			Then.iShouldSeeVisibleFiltersInOrderInFilterBar(["Name", "Founding Year", "artistUUID", "Breakout Year", "Country", "cityOfOrigin_city", "Country Name"]);

			Then.theVariantManagementIsDirty(false);

			//check if the correct variant is selected
			Then.iShouldSeeSelectedVariant("FilterBarVariant");
		});

		opaTestOrSkip("Recheck dialog", function (Given, When, Then) {
			When.iPressButtonWithText(Arrangement.P13nDialog.AdaptFilter.getButtonCountText(2));
			When.onTheMDCFilterBar.iChangeAdaptFiltersView("Group");

			Then.iShouldSeeSelectedListFilterItems(oFilterItems["Artists"]);
			Then.iShouldSeeSelectedListFilterItems(oFilterItems["Countries"]);

			//close modal dialog
			When.iPressDialogOk();
		});

		// ----------------------------------------------------------------
		// Create dirty changes on existing variant 'FilterBarTest'
		// ----------------------------------------------------------------
		opaTestOrSkip("When I press on 'Adapt Filters' button, I change the FilterField selection for an existing variant", function (Given, When, Then) {
			When.iPressButtonWithText(Arrangement.P13nDialog.AdaptFilter.getButtonCountText(2));
			Then.thePersonalizationDialogOpens(false);

			//Enter a different value
			When.iEnterTextInFilterDialog("Country Name", "GB");

			//deselect a selected field stored in the variant
			When.iDeselectColumn("Country", oFilterItems["Countries"]);

			//close modal dialog
			When.iPressDialogOk();

			//check that variant is dirty
			Then.theVariantManagementIsDirty(true);
		});

		// ----------------------------------------------------------------
		// Reset dirty changes for variant 'FilterBarTest'
		// ----------------------------------------------------------------
		opaTestOrSkip("When I press on 'Adapt Filters' button, I reset my changes made", function (Given, When, Then) {
			When.iPressButtonWithText(Arrangement.P13nDialog.AdaptFilter.getButtonCountText(2));

			When.iPressResetInDialog();
			When.iConfirmResetWarning();

			//The old values stored in the variant should be present in the dialog
			Then.iShouldSeeSelectedListFilterItems(oFilterItems["Artists"]);
			Then.iShouldSeeSelectedListFilterItems(oFilterItems["Countries"]);

			//close modal dialog
			When.iPressDialogOk();
		});

		// ----------------------------------------------------------------
		// Recheck FilterBar after reset
		// ----------------------------------------------------------------
		opaTestOrSkip("Check the 'FilterBarTest' variant after reset", function (Given, When, Then) {

			//check visible FilterFields
			Then.iShouldSeeVisibleFiltersInOrderInFilterBar(["Name", "Founding Year", "artistUUID", "Breakout Year", "Country", "cityOfOrigin_city", "Country Name"]);

			//check if the correct variant is selected
			Then.iShouldSeeSelectedVariant("FilterBarVariant");

		});

		opaTestOrSkip("When I switch back to standard variant I should see the default items", function (Given, When, Then) {
			//Select "Standard"
			When.iSelectVariant("Standard");

			//Check default FilterItems
			Then.iShouldSeeVisibleFiltersInOrderInFilterBar(["Name", "Founding Year", "artistUUID", "Breakout Year"]);

			//check dialog + Filter values
			When.iPressButtonWithText(Arrangement.P13nDialog.AdaptFilter.button);

			//Check "Countries" FilterFields
			oFilterItems["Countries"][2].value = null;
			oFilterItems["Countries"][2].selected = false;
			Then.iShouldSeeSelectedListFilterItems(oFilterItems["Countries"]);

			//Check "Artists" FilterFields
			oFilterItems["Artists"][4].value = null;
			oFilterItems["Artists"][3].selected = false;
			oFilterItems["Artists"][2].selected = false;
			Then.iShouldSeeSelectedListFilterItems(oFilterItems["Artists"]);

			Given.enableAndDeleteLrepLocalStorage();
			Then.iTeardownMyAppFrame();
		});
	};

});
