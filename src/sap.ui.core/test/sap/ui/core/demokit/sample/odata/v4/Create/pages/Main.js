/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/sample/common/Helper",
	"sap/ui/test/Opa5",
	"sap/ui/test/actions/Press"
], function (Helper, Opa5, Press) {
	"use strict";

	const sViewName = "sap.ui.core.sample.odata.v4.Create.Main";

	Opa5.createPageObjects({
		onTheCreateNewSalesOrderDialog : {
			actions : {
				changeInputValue : function (sInputId, sInput) {
					Helper.changeInputValue(this, sViewName, sInputId, sInput);
				},
				pressButton : function (sButtonId) {
					Helper.pressButton(this, sViewName, sButtonId);
				}
			},
			assertions : {
				checkHasFocus : function (sControlId) {
					// checks if the test runs in an iFrame, because the check is not possible there
					if (window.parent !== window) {
						return;
					}
					this.waitFor({
						id : sControlId,
						success : function (oControl) {
							Opa5.assert.strictEqual(oControl.getFocusDomRef(),
								document.activeElement, sControlId + " has focus");
						},
						viewName : sViewName
					});
				},
				checkInputValueState : function (sInputId, sValueState) {
					Helper.checkValueState(this, sViewName, sInputId, sValueState);
				}
			}
		},
		onTheMainPage : {
			actions : {
				pressCreateNewSalesOrderButton : function () {
					Helper.pressButton(this, sViewName, "createSalesOrderButton");
				}
			},
			assertions : {
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
								Opa5.assert.strictEqual(aCells[i].getText(), oExpectedData[sKey],
									"New entry contains expected data for " + sKey);
							});
						},
						viewName : sViewName,
						visible : false
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
				checkSuccessMessageIsVisible : function (bExpected) {
					this.waitFor({
						controlType : "sap.m.Dialog",
						success : function (aDialogs) {
							const bDialogFound = aDialogs
								.some((oDialog) => oDialog.getTitle() === "Success");
							Opa5.assert.strictEqual(bDialogFound, bExpected,
								"Success MessageBox is visible: " + bExpected);
						},
						visible : false
					});
				}
			}
		},
		onTheSuccessMessageBox : {
			actions : {
				pressOkButton : function () {
					this.waitFor({
						actions : new Press(),
						controlType : "sap.m.Button",
						matchers : function (oButton) {
							return oButton.getText() === "OK";
						},
						searchOpenDialogs : true,
						success : function () {
							Opa5.assert.ok(true, "OK button pressed");
						}
					});
				}
			}
		}
	});
});
