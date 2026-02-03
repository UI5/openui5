/* global QUnit */

sap.ui.define([
	"sap/ui/test/opaQunit",
	"test-resources/sap/ui/mdc/qunit/table/OpaTests/pages/Util",
	"sap/ui/test/actions/Press",
	"sap/ui/mdc/enums/TableP13nMode",
	"sap/ui/core/library"
], function(
	/** @type sap.ui.test.opaQunit */ opaTest,
	/** @type sap.ui.mdc.qunit.table.OpaTests.pages.Util */ Util,
	Press,
	TableP13nMode,
	coreLibrary
) {
	"use strict";

	const sTableId = "mdcTable";

	QUnit.module("Toolbar content");

	opaTest("Title should be visible", function(Given, When, Then) {
		Then.onTheAppMDCTable.iShouldSeeTheHeaderText(sTableId, "Products");
	});

	opaTest("Row count should be visible", function(Given, When, Then) {
		Then.onTheAppMDCTable.iShouldSeeTheCount(sTableId);
	});

	opaTest("Variant management should be visible", function(Given, When, Then) {
		Then.onTheAppMDCTable.iShouldSeeTheVariantManagement(sTableId);
	});

	opaTest("Paste button should be visible", function(Given, When, Then) {
		Then.onTheAppMDCTable.iShouldSeeThePasteButton(sTableId);
	});

	opaTest("P13n button should be visible", function(Given, When, Then) {
		Then.onTheAppMDCTable.iShouldSeeTheP13nButton(sTableId);
	});

	opaTest("P13n button should be hidden", function(Given, When, Then) {
		When.onTheApp.iGetTheTableInstance(sTableId, function(oTable) {
			oTable._setShowP13nButton(false);
		});
		Then.onTheAppMDCTable.iShouldSeeTheP13nButton(sTableId, false);
	});

	QUnit.module("Filter info bar");

	opaTest("Open filter dialog via filter info bar", function(Given, When, Then) {
		// Add a filter
		When.onTheMDCTable.iPersonalizeFilter(sTableId, [{key: "Category", values: ["*Notebooks*"], inputControl: sTableId + "--filter--Category"}]);

		// Check if filter info bar is visible
		Then.onTheAppMDCTable.iShouldSeeFilterInfoBarWithFilters(sTableId, ["Category"]);

		// Press filter info bar and check if filter dialog is opened with correct filters
		When.onTheAppMDCTable.iPressFilterInfoBar(sTableId);
		Then.P13nAssertions.iShouldSeeTheFilterDialog();
		Then.onTheAppMDCTable.iShouldSeeValuesInFilterDialog("Category", "Notebooks");

		// Focus should return to filter info bar after closing the dialog
		When.P13nActions.iPressDialogOk();
		Then.onTheAppMDCTable.iShouldSeeFocusOnControl(sTableId + "-filterInfoBar");

		// Open the dialog again and clear all filters
		When.onTheAppMDCTable.iPressFilterInfoBar(sTableId);
		Then.P13nAssertions.iShouldSeeTheFilterDialog();
		Then.P13nActions.iRemoveFiltersInFilterDialog();

		// Filter info bar will be hidden. Focus must not leave the table.
		When.P13nActions.iPressDialogOk();
		Then.onTheAppMDCTable.iShouldNotSeeFilterInfoBar(sTableId);
		Then.onTheAppMDCTable.iShouldSeeFocusOnControl(sTableId);
	});

	opaTest("Remove all filters via filter info bar", function(Given, When, Then) {
		When.onTheMDCTable.iPersonalizeFilter(sTableId, [{key: "Category", values: ["*Notebooks*"], inputControl: sTableId + "--filter--Category"}]);
		Then.onTheAppMDCTable.iShouldSeeFilterInfoBarWithFilters(sTableId, ["Category"]);
		When.onTheAppMDCTable.iPressRemoveAllFiltersOnFilterInfoBar(sTableId);
		Then.onTheAppMDCTable.iShouldNotSeeFilterInfoBar(sTableId);
		Then.onTheAppMDCTable.iShouldSeeFocusOnControl(sTableId);
	});

	QUnit.module("Column menu");

	opaTest("Open column menu", function(Given, When, Then) {
		When.onTheApp.iGetTheTableInstance(sTableId, function(oTable) {
			// TODO: Move tests related to grouping to ResponsiveTableJourney and DataAggregation app -> TableJourney. The mock server used in this
			//       app does not support grouping of the GridTable.
			oTable.setP13nMode(oTable.getP13nMode().concat(TableP13nMode.Group));
		});

		When.onTheAppMDCTable.iPressOnColumnHeader(sTableId, "Category");
		Then.onTheAppMDCTable.iShouldSeeTheColumnMenu();
		Then.onTheAppMDCTable.iShouldSeeNumberOfColumnMenuQuickActions(3);
		Then.onTheAppMDCTable.iShouldSeeColumnMenuQuickSort({key: "Category", label: "Category", sortOrder: coreLibrary.SortOrder.None});
		Then.onTheAppMDCTable.iShouldSeeColumnMenuQuickGroup({key: "Category", label: "Category", grouped: false});
		Then.onTheAppMDCTable.iShouldSeeNumberOfColumnMenuItems(0);
		Then.onTheAppMDCTable.iShouldSeeTableSettingsButton();
	});

	opaTest("Sort with column menu quick action", function(Given, When, Then) {
		When.onTheAppMDCTable.iUseColumnMenuQuickSort({key: "Category", sortOrder: coreLibrary.SortOrder.Ascending});
		Then.onTheAppMDCTable.iShouldSeeColumnSorted(sTableId, "Category", false);
		Then.onTheAppMDCTable.iShouldNotSeeTheColumnMenu();

		When.onTheAppMDCTable.iPressOnColumnHeader(sTableId, "Category");
		Then.onTheAppMDCTable.iShouldSeeTheColumnMenu();
		Then.onTheAppMDCTable.iShouldSeeColumnMenuQuickSort({key: "Category", label: "Category", sortOrder: coreLibrary.SortOrder.Ascending});
		When.onTheAppMDCTable.iCloseTheColumnMenu();
		Then.onTheAppMDCTable.iShouldNotSeeTheColumnMenu();
	});

	opaTest("Group with column menu quick action", function(Given, When, Then) {
		When.onTheAppMDCTable.iPressOnColumnHeader(sTableId, "Category");
		Then.onTheAppMDCTable.iShouldSeeTheColumnMenu();
		When.onTheAppMDCTable.iUseColumnMenuQuickGroup({key: "Category", grouped: true});
		Then.onTheAppMDCTable.iShouldNotSeeTheColumnMenu();

		When.onTheAppMDCTable.iPressOnColumnHeader(sTableId, "Category");
		Then.onTheAppMDCTable.iShouldSeeTheColumnMenu();
		Then.onTheAppMDCTable.iShouldSeeColumnMenuQuickGroup({key: "Category", label: "Category", grouped: true});
		When.onTheAppMDCTable.iCloseTheColumnMenu();
		Then.onTheAppMDCTable.iShouldNotSeeTheColumnMenu();
	});

	opaTest("Group with column menu quick action", function(Given, When, Then) {
		When.onTheAppMDCTable.iPressOnColumnHeader(sTableId, "Category");
		Then.onTheAppMDCTable.iShouldSeeTheColumnMenu();
		When.onTheAppMDCTable.iUseColumnMenuQuickGroup({key: "Category", grouped: false});
		Then.onTheAppMDCTable.iShouldNotSeeTheColumnMenu();
	});

	opaTest("P13n button hidden", function(Given, When, Then) {
		When.onTheApp.iGetTheTableInstance(sTableId, function(oTable) {
			oTable._setShowP13nButton(false);
		});
		When.onTheAppMDCTable.iPressOnColumnHeader(sTableId, "Category");
		Then.onTheAppMDCTable.iShouldSeeTheColumnMenu();
		Then.onTheAppMDCTable.iShouldNotSeeColumnMenuItems();
		Then.onTheAppMDCTable.iShouldNotSeeColumnMenuSettings();
		When.onTheAppMDCTable.iCloseTheColumnMenu();
		Then.onTheAppMDCTable.iShouldNotSeeTheColumnMenu();
		When.onTheApp.iGetTheTableInstance(sTableId, function(oTable) {
			oTable._setShowP13nButton(true);
		});
	});

	opaTest('Open P13nDialog via the column menu', function(Given, When, Then) {
		When.onTheAppMDCTable.iPressOnColumnHeader(sTableId, "Category");
		Then.onTheAppMDCTable.iShouldSeeTheColumnMenu();
		Then.onTheAppMDCTable.iShouldSeeTableSettingsButton();
		When.onTheAppMDCTable.iPressTableSettingsButton();
		Then.P13nAssertions.iShouldSeeTheP13nDialog();
		Then.onTheAppMDCTable.iShouldNotSeeTheColumnMenu();
	});

	QUnit.module("DataStateIndicator");

	opaTest("Set Messages", function(Given, When, Then) {
		When.waitFor({
			id: "setMessagesButton",
			actions: new Press()
		});
		Then.onTheAppMDCTable.iCheckBindingLength(sTableId, 201);
	});

	opaTest("Filter by messages", function(Given, When, Then) {
		When.onTheAppMDCTable.iPressFilterOfDataStateIndicator(sTableId);
		Then.onTheAppMDCTable.iCheckBindingLength(sTableId, 1);
		Then.onTheAppMDCTable.iCheckRowData(sTableId, {index: 0, data: {ProductID: "HT-1002"}});
	});

	opaTest("Press filter info bar to open filter dialog", function(Given, When, Then) {
		When.onTheAppMDCTable.iPressFilterInfoBarOfDataStateIndicator(sTableId);
		Then.P13nAssertions.iShouldSeeTheFilterDialog();
		Then.P13nActions.iPressDialogCancel();
	});

	opaTest("Remove message filtering", function(Given, When, Then) {
		When.onTheAppMDCTable.iPressFilterOfDataStateIndicator(sTableId);
		Then.onTheAppMDCTable.iCheckBindingLength(sTableId, 201);
	});
});