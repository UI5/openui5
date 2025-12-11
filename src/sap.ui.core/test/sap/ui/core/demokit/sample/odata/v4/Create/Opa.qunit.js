/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/sample/common/Helper",
	"sap/ui/core/sample/common/pages/Any",
	"sap/ui/core/sample/odata/v4/Create/pages/Main",
	"sap/ui/test/opaQunit",
	"sap/ui/core/sample/odata/v4/Create/SandboxModel" // preload only
], function (Helper, Any, Main, opaTest) {
	"use strict";

	Helper.qUnitModule("sap.ui.core.sample.odata.v4.Create - Create");

	//*****************************************************************************
	opaTest("Create", function (Given, When, Then) {
		Given.iStartMyUIComponent({
			autoWait : true,
			componentConfig : {
				name : "sap.ui.core.sample.odata.v4.Create"
			}
		});
		Then.onAnyPage.iTeardownMyUIComponentInTheEnd();

		Then.onTheMainPage.checkNumberOfEntries(2);
		When.onTheMainPage.pressCreateNewSalesOrderButton();
		Then.onTheMainPage.checkFirstEntry({
			SalesOrderID : "",
			Buyer : " (0100000000)",
			GrossAmount : "",
			Currency : "EUR",
			Note : "",
			LifecycleStatus : ""
			// CreatedAt is not checked because the value of it changes permanently
		});
		Then.onTheMainPage.checkNumberOfEntries(3);
		Then.onTheMainPage.checkDialogIsOpen(true);
		When.onTheCreateNewSalesOrderDialog.changeInputValue("noteInput", "New note");
		Then.onTheMainPage.checkFirstEntry({
			SalesOrderID : "",
			Buyer : " (0100000000)",
			GrossAmount : "",
			Currency : "EUR",
			Note : "New note",
			LifecycleStatus : ""
		});
		When.onTheCreateNewSalesOrderDialog.pressButton("cancelButton");
		Then.onTheMainPage.checkDialogIsOpen(false);
		Then.onTheMainPage.checkNumberOfEntries(2);

		When.onTheMainPage.pressCreateNewSalesOrderButton();
		Then.onTheMainPage.checkFirstEntry({
			SalesOrderID : "",
			Buyer : " (0100000000)",
			GrossAmount : "",
			Currency : "EUR",
			Note : "",
			LifecycleStatus : ""
		});
		Then.onTheMainPage.checkNumberOfEntries(3);
		Then.onTheMainPage.checkDialogIsOpen(true);

		When.onTheCreateNewSalesOrderDialog.changeInputValue("buyerIdInput", "");
		When.onTheCreateNewSalesOrderDialog.pressButton("saveButton");
		Then.onTheMainPage.checkDialogIsOpen(true);
		Then.onTheCreateNewSalesOrderDialog.checkHasFocus("buyerIdInput");
		Then.onTheCreateNewSalesOrderDialog.checkInputValueState("buyerIdInput", "Error");
		When.onTheCreateNewSalesOrderDialog.changeInputValue("buyerIdInput", "0100000004");
		Then.onTheCreateNewSalesOrderDialog.checkInputValueState("buyerIdInput", "None");

		When.onTheCreateNewSalesOrderDialog.changeInputValue("currencyInput", "");
		When.onTheCreateNewSalesOrderDialog.pressButton("saveButton");
		Then.onTheMainPage.checkDialogIsOpen(true);
		Then.onTheCreateNewSalesOrderDialog.checkHasFocus("currencyInput");
		Then.onTheCreateNewSalesOrderDialog.checkInputValueState("currencyInput", "Error");
		When.onTheCreateNewSalesOrderDialog.changeInputValue("currencyInput", "USD");
		Then.onTheCreateNewSalesOrderDialog.checkInputValueState("currencyInput", "None");

		When.onTheCreateNewSalesOrderDialog.changeInputValue("noteInput", "New note");
		When.onTheCreateNewSalesOrderDialog.pressButton("saveButton");
		Then.onTheMainPage.checkDialogIsOpen(false);
		Then.onTheMainPage.checkSuccessMessageIsVisible(true);
		When.onTheSuccessMessageBox.pressOkButton();
		Then.onTheMainPage.checkSuccessMessageIsVisible(false);
		Then.onTheMainPage.checkFirstEntry({
			SalesOrderID : "0500000002",
			Buyer : "Panorama Studios (0100000004)",
			GrossAmount : "0.00",
			Currency : "USD",
			Note : "New note",
			LifecycleStatus : "New"
		});
		Then.onTheMainPage.checkNumberOfEntries(3);
	});
});
