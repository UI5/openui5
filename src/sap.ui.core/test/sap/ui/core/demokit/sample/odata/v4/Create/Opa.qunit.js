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
		When.onTheMainPage.pressButton("createSalesOrderButton");
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
		When.onTheMainPage.changeInputValue("noteInput", "New note");
		Then.onTheMainPage.checkFirstEntry({
			SalesOrderID : "",
			Buyer : " (0100000000)",
			GrossAmount : "",
			Currency : "EUR",
			Note : "New note",
			LifecycleStatus : ""
		});
		When.onTheMainPage.pressButton("cancelButton");
		Then.onTheMainPage.checkDialogIsOpen(false);
		Then.onTheMainPage.checkNumberOfEntries(2);

		When.onTheMainPage.pressButton("createSalesOrderButton");
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

		When.onTheMainPage.changeInputValue("buyerIdInput", "FOO");
		When.onTheMainPage.pressButton("saveButton");
		Then.onTheMainPage.checkDialogIsOpen(true);
		Then.onTheMainPage.checkInputValueState("buyerIdInput", "Error");
		//TODO check error message?
		//TODO find a better place? value state should change, if possible

		When.onTheMainPage.changeInputValue("buyerIdInput", "");
		When.onTheMainPage.pressButton("saveButton");
		Then.onTheMainPage.checkDialogIsOpen(true);
		Then.onTheMainPage.checkInputValueState("buyerIdInput", "Error");
		When.onTheMainPage.changeInputValue("buyerIdInput", "0100000004");
		// Note: the backend error has not yet been removed
		Then.onTheMainPage.checkInputValueState("buyerIdInput", "Error");

		When.onTheMainPage.changeInputValue("currencyInput", "");
		When.onTheMainPage.pressButton("saveButton");
		Then.onTheMainPage.checkDialogIsOpen(true);
		Then.onTheMainPage.checkInputValueState("currencyInput", "Error");
		When.onTheMainPage.changeInputValue("currencyInput", "USD");
		Then.onTheMainPage.checkInputValueState("currencyInput", "None");

		When.onTheMainPage.changeInputValue("noteInput", "New note");
		When.onTheMainPage.pressButton("saveButton");
		// Note: "Save" removes the backend error, but the dialog closes too fast
		// Then.onTheMainPage.checkInputValueState("buyerIdInput", "None");
		Then.onTheMainPage.checkDialogIsOpen(false);
		Then.onTheMainPage.checkSuccessMessageIsVisible(true);
		When.onAnyPage.pressOkButton();
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
