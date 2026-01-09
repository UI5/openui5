/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/sample/common/Helper",
	"sap/ui/test/Opa5"
], function (Helper, Opa5) {
	"use strict";

	const sViewName = "sap.ui.core.sample.odata.v4.Create.Main";

	Opa5.createPageObjects({
		onTheMainPage : {
			actions : {
				changeInputValue : function (sInputId, sInput) {
					Helper.changeInputValue(this, sViewName, sInputId, sInput);
				},
				pressButton : function (sButtonId) {
					Helper.pressButton(this, sViewName, sButtonId);
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
				checkInputValueState : function (sInputId, sValueState) {
					Helper.checkValueState(this, sViewName, sInputId, sValueState);
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
		}
	});
});
