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

	const sViewName = "sap.ui.core.sample.odata.v4.CreateInline.Main";

	Opa5.createPageObjects({
		onTheMainPage : {
			actions : {
				iEnterBuyerInRow : function (iRow, sBuyerId) {
					Helper.changeInputValue(this, sViewName, /buyerInput/, sBuyerId, iRow);
				},
				iEnterNoteInRow : function (iRow, sNote) {
					Helper.changeInputValue(this, sViewName, /noteInput/, sNote, iRow);
				},
				iPressDeleteInRow : function (iRow) {
					this.waitFor({
						actions : new Press(),
						controlType : "sap.m.Button",
						id : /deleteButton/,
						matchers : (oButton) => oButton.getBindingContext().getIndex() === iRow,
						success : function () {
							Opa5.assert.ok(true, "Delete pressed in row " + iRow);
						},
						errorMessage : "Could not find the Delete button in row " + iRow,
						viewName : sViewName
					});
				},
				iPressRefresh : function () {
					Helper.pressButton(this, sViewName, "refreshButton");
				},
				iPressSort : function () {
					Helper.pressButton(this, sViewName, "sortButton");
				},
				iSearchFor : function (sSearchText) {
					this.waitFor({
						controlType : "sap.m.SearchField",
						id : "searchField",
						actions : new EnterText({
							clearTextFirst : true,
							pressEnterKey : true,
							text : sSearchText
						}),
						success : function () {
							Opa5.assert.ok(true, "Searched for: \"" + sSearchText + "\"");
						},
						errorMessage : "Could not find the search field",
						viewName : sViewName
					});
				}
			},
			assertions : {
				checkBuyerInRow : function (iRow, sExpectedBuyer) {
					Helper.checkInputValue(this, sViewName, /buyerInput/, sExpectedBuyer, iRow);
				},
				checkBuyerIsEditable : function (iRow, bExpected) {
					this.waitFor({
						controlType : "sap.m.Input",
						id : /buyerInput/,
						matchers : (oInput) => oInput.getBindingContext().getIndex() === iRow,
						success : function ([oInput]) {
							Opa5.assert.strictEqual(oInput.getEditable(), bExpected,
								"Buyer input in row " + iRow + " is "
									+ (bExpected ? "editable" : "read-only"));
						},
						errorMessage : "Cannot find buyer input in row " + iRow,
						viewName : sViewName
					});
				},
				checkBuyerNameInRow : function (iRow, sExpectedName) {
					this.waitFor({
						controlType : "sap.m.Input",
						id : /buyerInput/,
						matchers : (oInput) => oInput.getBindingContext().getIndex() === iRow,
						success : function ([oInput]) {
							Opa5.assert.strictEqual(oInput.getDescription(), sExpectedName,
								"Buyer name in row " + iRow + " is: " + sExpectedName);
						},
						errorMessage : "Cannot find buyer input in row " + iRow,
						viewName : sViewName
					});
				},
				checkBuyerValueStateInRow : function (iRow, sValueState, sValueStateText = "") {
					Helper.checkValueState(this, sViewName, /buyerInput/, sValueState,
						sValueStateText, undefined, iRow);
				},
				checkCurrencyInRow : function (iRow, sExpectedCurrency) {
					Helper.checkTextValue(this, sViewName, /currencyText/, sExpectedCurrency,
						iRow);
				},
				checkDeleteButtonVisibleInRow : function (iRow, bExpected) {
					this.waitFor({
						controlType : "sap.m.Button",
						id : /deleteButton/,
						visible : false,
						matchers : (oButton) => oButton.getBindingContext().getIndex() === iRow,
						success : function ([oButton]) {
							Opa5.assert.strictEqual(oButton.getVisible(), bExpected,
								"Delete button in row " + iRow + " is "
									+ (bExpected ? "visible" : "not visible"));
						},
						errorMessage : "Cannot find delete button in row " + iRow,
						viewName : sViewName
					});
				},
				checkGrossAmountInRow : function (iRow, sExpectedAmount) {
					Helper.checkTextValue(this, sViewName, /grossAmountText/, sExpectedAmount,
						iRow);
				},
				checkSalesOrderIdInRow : function (iRow, sExpectedId) {
					Helper.checkTextValue(this, sViewName, /salesOrderIdText/, sExpectedId,
						iRow);
				},
				checkStatusInRow : function (iRow, sExpectedStatus) {
					Helper.checkTextValue(this, sViewName, /statusText/, sExpectedStatus,
						iRow);
				},
				checkNoteInRow : function (iRow, sExpectedNote) {
					Helper.checkInputValue(this, sViewName, /noteInput/, sExpectedNote, iRow);
				},
				checkNumberOfItems : function (iExpectedCount) {
					this.waitFor({
						controlType : "sap.m.Table",
						id : "salesOrderList",
						success : function (oSalesOrderTable) {
							Opa5.assert.strictEqual(oSalesOrderTable.getItems().length,
								iExpectedCount,
								"Number of items in the table: " + iExpectedCount);
						},
						viewName : sViewName
					});
				},
				checkSalesOrderCount : function (iExpectedCount) {
					this.waitFor({
						controlType : "sap.m.Title",
						id : "salesOrdersTitle",
						success : function (oTitle) {
							Opa5.assert.strictEqual(oTitle.getText(),
								iExpectedCount + " Sales Orders",
								"Header count: " + iExpectedCount + " Sales Orders");
						},
						errorMessage : "Cannot find sales orders title",
						viewName : sViewName
					});
				},
				checkSortButtonIcon : function (sExpectedIcon) {
					this.waitFor({
						controlType : "sap.m.Button",
						id : "sortButton",
						success : function (oButton) {
							Opa5.assert.strictEqual(oButton.getIcon(), sExpectedIcon,
								"Sort button icon: " + sExpectedIcon);
						},
						errorMessage : "Cannot find sort button",
						viewName : sViewName
					});
				},
				checkRowHighlight : function (iRow, sExpectedHighlight) {
					this.waitFor({
						controlType : "sap.m.ColumnListItem",
						matchers : function (oColumnListItem) {
							return oColumnListItem.getBindingContext().getIndex() === iRow;
						},
						success : function ([oItem]) {
							Opa5.assert.strictEqual(oItem.getHighlight(), sExpectedHighlight,
								"Row " + iRow + " has highlight: " + sExpectedHighlight);
						},
						errorMessage : "Cannot find row " + iRow,
						viewName : sViewName
					});
				},
				checkRowStateTooltip : function (iRow, sExpectedTooltip) {
					this.waitFor({
						controlType : "sap.ui.core.Icon",
						id : /stateIcon/,
						matchers : (oIcon) => oIcon.getBindingContext().getIndex() === iRow,
						success : function ([oIcon]) {
							Opa5.assert.strictEqual(oIcon.getTooltip(), sExpectedTooltip,
								"State icon in row " + iRow + " has tooltip: " + sExpectedTooltip);
						},
						errorMessage : "Cannot find state icon in row " + iRow,
						viewName : sViewName
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
				},
				iShouldSeeTheApp : function () {
					this.waitFor({
						controlType : "sap.m.Table",
						id : "salesOrderList",
						success : function (oSalesOrderTable) {
							Opa5.assert.ok(oSalesOrderTable, "The sales order table is rendered");
						},
						viewName : sViewName
					});
				}
			}
		}
	});
});
