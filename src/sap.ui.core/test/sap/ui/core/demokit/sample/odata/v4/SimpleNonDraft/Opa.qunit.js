/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/sample/common/Helper",
	"sap/ui/core/sample/common/pages/Any",
	"sap/ui/core/sample/odata/v4/SimpleNonDraft/pages/Main",
	"sap/ui/test/opaQunit",
	"sap/ui/core/sample/odata/v4/SimpleNonDraft/SandboxModel" // preload only
], function (Helper, Any, Main, opaTest) {
	"use strict";

	Helper.qUnitModule("sap.ui.core.sample.odata.v4.SimpleNonDraft - SimpleNonDraft");

	/**
	 * Performs the preparation shared by the rollback (Scenario 3) and persist (Scenario 4)
	 * flows: creates a new sales order for buyer "0100000001", changes the note of sales order
	 * "0500000000" to "Modified note" and deletes the sales order of buyer "0100000004". This
	 * produces the same three pending changes for both scenarios, which then either cancel or
	 * save them.
	 *
	 * @param {object} When - The OPA5 "When" page objects
	 * @param {object} Then - The OPA5 "Then" page objects
	 */
	function prepareChanges(When, Then) {
		When.onTheMainPage.pressButton("createButton");
		Then.onTheMainPage.checkDialogIsOpen(true);
		When.onTheMainPage.enterDialogInputValue("buyerIdInput", "0100000001");
		When.onTheMainPage.enterDialogInputValue("noteInput", "Dialog note");
		When.onTheMainPage.pressDialogButton("createDialogConfirmButton");
		Then.onTheMainPage.checkDialogIsOpen(false);
		Then.onTheMainPage.checkFirstEntry({
			SalesOrderID : "",
			Buyer : " (0100000001)",
			GrossAmount : "",
			Currency : "EUR",
			Note : "Dialog note",
			LifecycleStatus : ""
		});
		Then.onTheMainPage.checkNumberOfEntries(3);
		When.onTheMainPage.changeNoteForSalesOrder("0500000000", "Modified note");
		Then.onTheMainPage.checkNoteForSalesOrder("0500000000", "Modified note");
		When.onTheMainPage.selectSalesOrder("0100000004");
		Then.onTheMainPage.checkButtonEnabled("deleteButton");
		When.onTheMainPage.pressButton("deleteButton");
		Then.onTheMainPage.checkSalesOrderExists("0100000004", false);
	}

	//*****************************************************************************
	opaTest("Simple non-draft CRUD with deferred update group", function (Given, When, Then) {
		const sOriginalNote = "EPM DG: SO ID 0500000000 Deliver as fast as possible";

		Given.iStartMyUIComponent({
			autoWait : true,
			componentConfig : {
				name : "sap.ui.core.sample.odata.v4.SimpleNonDraft"
			}
		});
		Then.onAnyPage.iTeardownMyUIComponentInTheEnd();

		// Scenario 1: Initial load and empty-state feedback
		Then.onTheMainPage.checkNumberOfEntries(2);
		When.onTheMainPage.pressButton("saveButton");
		Then.onTheMainPage.iShouldSeeMessageToast("No changes to save");
		When.onTheMainPage.pressButton("cancelButton");
		Then.onTheMainPage.iShouldSeeMessageToast("No changes to cancel");

		// Scenario 2: Create dialog - Cancel discards the transient row
		When.onTheMainPage.pressButton("createButton");
		Then.onTheMainPage.checkDialogIsOpen(true);
		Then.onTheMainPage.checkNumberOfEntries(3);
		Then.onTheMainPage.checkFirstEntry({
			SalesOrderID : "",
			Buyer : " ()",
			GrossAmount : "",
			Currency : "EUR",
			Note : "",
			LifecycleStatus : ""
		});
		When.onTheMainPage.pressDialogButton("createDialogCancelButton");
		Then.onTheMainPage.checkDialogIsOpen(false);
		Then.onTheMainPage.checkNumberOfEntries(2);
		When.onTheMainPage.pressButton("cancelButton");
		Then.onTheMainPage.iShouldSeeMessageToast("No changes to cancel");

		// Scenario 3: Rollback flow - create, modify and delete, then Cancel
		prepareChanges(When, Then);
		Then.onTheMainPage.checkButtonDisabled("deleteButton");
		Then.onTheMainPage.checkNumberOfEntries(2);

		When.onTheMainPage.pressButton("cancelButton");

		Then.onTheMainPage.iShouldSeeMessageToast("Changes have been canceled");
		Then.onTheMainPage.checkNumberOfEntries(2);
		Then.onTheMainPage.checkSalesOrderExists("0100000001", false);
		Then.onTheMainPage.checkSalesOrderExists("0100000004", true);
		Then.onTheMainPage.checkNoteForSalesOrder("0500000000", sOriginalNote);

		// Scenario 4: Persist flow - same preparation, Refresh blocked, then Save
		prepareChanges(When, Then);
		When.onTheMainPage.pressButton("refreshButton");
		Then.onTheMainPage.checkMessageBox("Alert", "Refresh not possible with pending changes");
		When.onTheMainPage.closeMessageBox("Alert");
		Then.onTheMainPage.checkFirstEntry({
			SalesOrderID : "",
			Buyer : " (0100000001)",
			GrossAmount : "",
			Currency : "EUR",
			Note : "Dialog note",
			LifecycleStatus : ""
		});
		Then.onTheMainPage.checkNoteForSalesOrder("0500000000", "Modified note");
		Then.onTheMainPage.checkSalesOrderExists("0100000004", false);

		When.onTheMainPage.pressButton("saveButton");

		Then.onTheMainPage.iShouldSeeMessageToast("Changes have been saved");
		Then.onTheMainPage.checkFirstEntry({
			SalesOrderID : "0500000002",
			Buyer : "Becker Berlin (0100000001)",
			GrossAmount : "0.00",
			Currency : "EUR",
			Note : "Dialog note",
			LifecycleStatus : "New"
		});
		Then.onTheMainPage.checkNoteForSalesOrder("0500000000", "Modified note");
		Then.onTheMainPage.checkSalesOrderExists("0100000004", false);
		Then.onTheMainPage.checkNumberOfEntries(2);
		Then.onTheMainPage.checkSalesOrderOrder(["0500000002", "0500000000"]);
		When.onTheMainPage.pressButton("refreshButton");
		Then.onTheMainPage.iShouldSeeMessageToast("Data refreshed");
		Then.onTheMainPage.checkSalesOrderOrder(["0500000000", "0500000002"]);
		Then.onTheMainPage.checkNoteForSalesOrder("0500000000", "Modified note");
		Then.onTheMainPage.checkNoteForSalesOrder("0500000002", "Dialog note");

		// Scenario 5: Save flow - back-end error on create
		When.onTheMainPage.pressButton("createButton");
		When.onTheMainPage.enterDialogInputValue("buyerIdInput", "123");
		When.onTheMainPage.pressDialogButton("createDialogConfirmButton");
		Then.onTheMainPage.checkDialogIsOpen(false);
		Then.onTheMainPage.checkFirstEntry({
			SalesOrderID : "",
			Buyer : " (123)"
		});
		When.onTheMainPage.pressButton("saveButton");
		Then.onTheMainPage.checkMessageBox("Error",
			"Business Partner with key '123' does not exist");
		When.onTheMainPage.closeMessageBox("Error");
		Then.onTheMainPage.checkSalesOrderExists("123", true);
		When.onTheMainPage.selectSalesOrder("123");
		Then.onTheMainPage.checkButtonEnabled("deleteButton");
		When.onTheMainPage.pressButton("deleteButton");
		Then.onTheMainPage.checkSalesOrderExists("123", false);
		Then.onTheMainPage.checkButtonDisabled("deleteButton");
		When.onTheMainPage.pressButton("cancelButton");
		Then.onTheMainPage.iShouldSeeMessageToast("No changes to cancel");
	});
});
