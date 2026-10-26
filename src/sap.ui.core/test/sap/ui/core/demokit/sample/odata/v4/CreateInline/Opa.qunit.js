/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/sample/common/Helper",
	"sap/ui/core/sample/common/pages/Any",
	"sap/ui/core/sample/odata/v4/CreateInline/pages/Main",
	"sap/ui/test/opaQunit",
	"sap/ui/core/sample/odata/v4/CreateInline/SandboxModel" // preload only
], function (Helper, Any, Main, opaTest) {
	"use strict";

	Helper.qUnitModule("sap.ui.core.sample.odata.v4.CreateInline - CreateInline");

	//*****************************************************************************
	opaTest("Create inactive, activate, filter, sort, and delete", function (Given, When, Then) {
		Given.iStartMyUIComponent({
			autoWait : true,
			componentConfig : {
				name : "sap.ui.core.sample.odata.v4.CreateInline"
			}
		});
		Then.onAnyPage.iTeardownMyUIComponentInTheEnd();

		// Scenario 1: Initial load and rendering
		Then.onTheMainPage.iShouldSeeTheApp();
		Then.onTheMainPage.checkNumberOfItems(7);
		Then.onTheMainPage.checkSalesOrderCount(6);
		Then.onTheMainPage.checkRowStateTooltip(0, "Inactive");
		Then.onTheMainPage.checkRowStateTooltip(1, "From Server");
		Then.onTheMainPage.checkBuyerIsEditable(0, true);
		Then.onTheMainPage.checkCurrencyInRow(0, "EUR");
		Then.onTheMainPage.checkSalesOrderIdInRow(0, "");
		Then.onTheMainPage.checkGrossAmountInRow(0, "");
		Then.onTheMainPage.checkStatusInRow(0, "");
		Then.onTheMainPage.checkDeleteButtonVisibleInRow(0, false);
		Then.onTheMainPage.checkRowHighlight(0, "None");

		// Scenario 2: Successful inline creation with $auto submit
		When.onTheMainPage.iEnterBuyerInRow(0, "0100000000");
		Then.onTheMainPage.checkBuyerInRow(0, "0100000000");
		Then.onTheMainPage.checkBuyerValueStateInRow(0, "None");
		Then.onTheMainPage.checkNumberOfItems(8);

		Then.onTheMainPage.iShouldSeeMessageToast("Sales Order 0500000006 created");
		Then.onTheMainPage.checkRowStateTooltip(0, "Persisted");
		Then.onTheMainPage.checkRowHighlight(0, "Information");
		Then.onTheMainPage.checkSalesOrderIdInRow(0, "0500000006");
		Then.onTheMainPage.checkGrossAmountInRow(0, "0.00");
		Then.onTheMainPage.checkStatusInRow(0, "New");
		Then.onTheMainPage.checkBuyerIsEditable(0, false);
		Then.onTheMainPage.checkBuyerNameInRow(0, "SAP");
		Then.onTheMainPage.checkSalesOrderCount(7);

		When.onTheMainPage.iEnterNoteInRow(0, "Test inline create");
		Then.onTheMainPage.checkNoteInRow(0, "Test inline create");

		// activating row 0 created a new, empty inactive row below it at row 1
		Then.onTheMainPage.checkRowStateTooltip(1, "Inactive");
		Then.onTheMainPage.checkBuyerIsEditable(1, true);
		Then.onTheMainPage.checkNoteInRow(1, "");

		// Scenario 3: Validation — empty Buyer prevents activation
		// Part A: reset the prevented row via Delete
		When.onTheMainPage.iEnterNoteInRow(1, "No buyer yet");
		// editing the inactive row 1 spawns a new, empty inactive row below it at row 2
		Then.onTheMainPage.checkRowStateTooltip(2, "Inactive");
		Then.onTheMainPage.checkBuyerIsEditable(2, true);
		Then.onTheMainPage.checkNoteInRow(2, "");
		Then.onTheMainPage.checkNoteInRow(1, "No buyer yet");
		Then.onTheMainPage.checkBuyerValueStateInRow(1, "Error", "Buyer ID must not be empty");
		Then.onTheMainPage.checkRowStateTooltip(1, "Inactive");
		Then.onTheMainPage.checkRowHighlight(1, "Information");
		Then.onTheMainPage.checkNumberOfItems(9);
		Then.onTheMainPage.checkSalesOrderCount(7);

		When.onTheMainPage.iPressDeleteInRow(1);
		Then.onTheMainPage.checkNumberOfItems(8);
		Then.onTheMainPage.checkBuyerValueStateInRow(1, "None");
		Then.onTheMainPage.checkRowStateTooltip(1, "Inactive");
		Then.onTheMainPage.checkRowHighlight(1, "None");
		Then.onTheMainPage.checkSalesOrderCount(7);

		// Part B: resolve the prevented activation by entering a valid Buyer ID
		When.onTheMainPage.iEnterNoteInRow(1, "Buyer to be added");
		Then.onTheMainPage.checkNoteInRow(1, "Buyer to be added");
		Then.onTheMainPage.checkBuyerValueStateInRow(1, "Error", "Buyer ID must not be empty");
		Then.onTheMainPage.checkRowStateTooltip(1, "Inactive");
		Then.onTheMainPage.checkNumberOfItems(9);
		Then.onTheMainPage.checkSalesOrderCount(7);

		When.onTheMainPage.iEnterBuyerInRow(1, "0100000001");
		Then.onTheMainPage.checkBuyerInRow(1, "0100000001");
		Then.onTheMainPage.checkBuyerValueStateInRow(1, "None");
		Then.onTheMainPage.iShouldSeeMessageToast("Sales Order 0500000007 created");
		Then.onTheMainPage.checkRowStateTooltip(1, "Persisted");
		Then.onTheMainPage.checkRowHighlight(1, "Information");
		Then.onTheMainPage.checkSalesOrderIdInRow(1, "0500000007");
		Then.onTheMainPage.checkGrossAmountInRow(1, "0.00");
		Then.onTheMainPage.checkStatusInRow(1, "New");
		Then.onTheMainPage.checkBuyerIsEditable(1, false);
		Then.onTheMainPage.checkBuyerNameInRow(1, "Becker Berlin");
		Then.onTheMainPage.checkNumberOfItems(9);
		Then.onTheMainPage.checkSalesOrderCount(8);

		// Clean up Part B: delete the created row to restore the state for the next scenarios
		When.onTheMainPage.iPressDeleteInRow(1);
		Then.onTheMainPage.checkNumberOfItems(8);
		Then.onTheMainPage.checkRowStateTooltip(1, "Inactive");
		Then.onTheMainPage.checkBuyerValueStateInRow(1, "None");
		Then.onTheMainPage.checkSalesOrderCount(7);

		// Scenario 4: Toolbar operations — refresh, sort and filter
		When.onTheMainPage.iPressRefresh();
		Then.onTheMainPage.checkNumberOfItems(8);
		Then.onTheMainPage.checkSalesOrderCount(7);
		Then.onTheMainPage.checkRowStateTooltip(0, "Inactive");
		Then.onTheMainPage.checkSalesOrderIdInRow(7, "0500000006");

		When.onTheMainPage.iPressSort();
		Then.onTheMainPage.checkSortButtonIcon("sap-icon://sort-ascending");
		Then.onTheMainPage.checkSalesOrderIdInRow(1, "0500000000");

		When.onTheMainPage.iPressSort();
		Then.onTheMainPage.checkSortButtonIcon("sap-icon://sort-descending");
		Then.onTheMainPage.checkSalesOrderIdInRow(1, "0500000006");

		When.onTheMainPage.iPressSort();
		Then.onTheMainPage.checkSortButtonIcon("sap-icon://sort");
		Then.onTheMainPage.checkSalesOrderIdInRow(1, "0500000000");

		When.onTheMainPage.iSearchFor("0100000001");
		Then.onTheMainPage.checkNumberOfItems(3);
		Then.onTheMainPage.checkSalesOrderCount(2);
		Then.onTheMainPage.checkRowStateTooltip(0, "Inactive");
		Then.onTheMainPage.checkSalesOrderIdInRow(1, "0500000002");
		Then.onTheMainPage.checkSalesOrderIdInRow(2, "0500000005");

		When.onTheMainPage.iSearchFor("");
		Then.onTheMainPage.checkNumberOfItems(8);
		Then.onTheMainPage.checkSalesOrderCount(7);

		// Scenario 5: Delete a persisted row
		When.onTheMainPage.iPressDeleteInRow(1);
		Then.onTheMainPage.checkNumberOfItems(7);
		Then.onTheMainPage.checkSalesOrderCount(6);
		Then.onTheMainPage.checkSalesOrderIdInRow(1, "0500000001");

		When.onTheMainPage.iPressRefresh();
		Then.onTheMainPage.checkNumberOfItems(7);
		Then.onTheMainPage.checkSalesOrderCount(6);
		Then.onTheMainPage.checkRowStateTooltip(0, "Inactive");
		Then.onTheMainPage.checkSalesOrderIdInRow(1, "0500000001");

		Then.onAnyPage.checkLog();
	});
});
