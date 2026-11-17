/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/sample/common/Helper",
	"sap/ui/test/Opa5",
	"sap/ui/test/actions/EnterText",
	"sap/ui/test/actions/Press"
], function (Helper, Opa5, EnterText, Press) {
	"use strict";

	const sViewName = "sap.ui.core.sample.odata.v4.SimpleNonDraft.Main";

	Opa5.createPageObjects({
		onTheMainPage : {
			actions : {
				changeNoteForSalesOrder : function (sSalesOrderID, sNote) {
					this.waitFor({
						actions : new EnterText({clearTextFirst : true, text : sNote}),
						controlType : "sap.m.Input",
						matchers : function (oInput) {
							return oInput.getBindingContext().getProperty("SalesOrderID")
								=== sSalesOrderID;
						},
						success : function ([oInput]) {
							Opa5.assert.strictEqual(oInput.getValue(), sNote,
								"Note of " + sSalesOrderID + " set to: " + sNote);
						},
						errorMessage : "Could not find the Note input for " + sSalesOrderID,
						viewName : sViewName
					});
				},
				closeMessageBox : function (sTitle) {
					this.waitFor({
						controlType : "sap.m.Dialog",
						matchers : (oDialog) => oDialog.getTitle() === sTitle,
						searchOpenDialogs : true,
						success : function ([oMessageBox]) {
							new Press().executeOn(oMessageBox.getButtons()[0]);
							Opa5.assert.ok(true, sTitle + " message box closed");
						},
						errorMessage : "No " + sTitle + " message box to close"
					});
				},
				enterDialogInputValue : function (sInputId, sValue) {
					Helper.changeInputValue(this, sViewName, sInputId, sValue, undefined,
						/*bSearchOpenDialogs*/true);
				},
				pressButton : function (sButtonId) {
					Helper.pressButton(this, sViewName, sButtonId);
				},
				pressDialogButton : function (sButtonId) {
					Helper.pressButton(this, sViewName, sButtonId, /*bSearchOpenDialogs*/true);
				},
				selectSalesOrder : function (sBuyerID) {
					this.waitFor({
						actions : (oCheckBox) => {
							if (!oCheckBox.getSelected()) {
								new Press().executeOn(oCheckBox);
							}
						},
						controlType : "sap.m.CheckBox",
						id : /selectMulti/,
						matchers : (oCheckBox) => {
							const oContext = oCheckBox.getBindingContext();

							return oContext && oContext.getProperty("BuyerID") === sBuyerID;
						},
						success : function () {
							Opa5.assert.ok(true, "Selected sales order of buyer: " + sBuyerID);
						},
						errorMessage : "Could not find the row of buyer: " + sBuyerID,
						viewName : sViewName
					});
				}
			},
			assertions : {
				checkButtonDisabled : function (sButtonId) {
					Helper.checkButtonDisabled(this, sViewName, sButtonId);
				},
				checkButtonEnabled : function (sButtonId) {
					Helper.checkButtonEnabled(this, sViewName, sButtonId);
				},
				checkDialogIsOpen : function (bExpected) {
					this.waitFor({
						id : "createDialog",
						success : function (oCreateDialog) {
							Opa5.assert.strictEqual(oCreateDialog.isOpen(), bExpected,
								"Create dialog is open: " + bExpected);
						},
						viewName : sViewName,
						visible : false
					});
				},
				checkFirstEntry : function (oExpectedData) {
					this.waitFor({
						id : "salesOrderList",
						success : function (oSalesOrderTable) {
							const aCells = oSalesOrderTable.getItems()[0].getCells();
							const aKeys = ["SalesOrderID", "Buyer", "GrossAmount", "Currency",
								"Note", "LifecycleStatus"];
							aKeys.forEach((sKey, i) => {
								if (sKey in oExpectedData) {
									// the "Note" cell is an Input, all others are Text controls
									const sActual = sKey === "Note"
										? aCells[i].getValue()
										: aCells[i].getText();
									Opa5.assert.strictEqual(sActual, oExpectedData[sKey],
										"First entry contains expected data for " + sKey);
								}
							});
						},
						viewName : sViewName,
						visible : false
					});
				},
				checkMessageBox : function (sTitle, sExpectedText) {
					this.waitFor({
						controlType : "sap.m.Dialog",
						matchers : (oDialog) => oDialog.getTitle() === sTitle,
						searchOpenDialogs : true,
						success : function ([oMessageBox]) {
							Opa5.assert.ok(oMessageBox.$().text().includes(sExpectedText),
								sTitle + " message box shows: " + sExpectedText);
						},
						errorMessage : "No " + sTitle + " message box with text: " + sExpectedText
					});
				},
				checkNoteForSalesOrder : function (sSalesOrderID, sExpectedNote) {
					this.waitFor({
						controlType : "sap.m.Input",
						matchers : function (oInput) {
							return oInput.getBindingContext().getProperty("SalesOrderID")
								=== sSalesOrderID;
						},
						success : function ([oInput]) {
							Opa5.assert.strictEqual(oInput.getValue(), sExpectedNote,
								"Note of " + sSalesOrderID + " is: " + sExpectedNote);
						},
						errorMessage : "Could not find the Note input for " + sSalesOrderID,
						viewName : sViewName
					});
				},
				checkNumberOfEntries : function (iExpectedLength) {
					this.waitFor({
						id : "salesOrderList",
						success : function (oSalesOrderTable) {
							Opa5.assert.strictEqual(oSalesOrderTable.getItems().length,
								iExpectedLength,
								"Number of entries in the table: " + iExpectedLength);
						},
						viewName : sViewName,
						visible : false
					});
				},
				checkSalesOrderExists : function (sBuyerID, bExpected) {
					this.waitFor({
						id : "salesOrderList",
						success : function (oSalesOrderTable) {
							const bFound = oSalesOrderTable.getItems().some(
								(oItem) => oItem.getBindingContext().getProperty("BuyerID")
									=== sBuyerID);
							Opa5.assert.strictEqual(bFound, bExpected,
								"Sales order of buyer " + sBuyerID + " exists: " + bExpected);
						},
						viewName : sViewName,
						visible : false
					});
				},
				checkSalesOrderOrder : function (aExpectedSalesOrderIDs) {
					this.waitFor({
						id : "salesOrderList",
						success : function (oSalesOrderTable) {
							const aActualSalesOrderIDs = oSalesOrderTable.getItems().map(
								(oItem) => oItem.getBindingContext()
									.getProperty("SalesOrderID"));
							Opa5.assert.deepEqual(aActualSalesOrderIDs, aExpectedSalesOrderIDs,
								"Sales orders appear in order: "
									+ aExpectedSalesOrderIDs.join(", "));
						},
						viewName : sViewName,
						visible : false
					});
				},
				iShouldSeeMessageToast : function (sExpectedText) {
					this.waitFor({
						autoWait : false,
						controlType : "sap.m.Table",
						id : "salesOrderList",
						check : function () {
							return !!Opa5.getJQuery()(
								".sapMMessageToast:contains('" + sExpectedText + "')").length;
						},
						success : function () {
							Opa5.assert.ok(true,
								"MessageToast is shown with text: " + sExpectedText);
						},
						errorMessage : "No MessageToast shown with text: " + sExpectedText,
						viewName : sViewName
					});
				}
			}
		}
	});
});
