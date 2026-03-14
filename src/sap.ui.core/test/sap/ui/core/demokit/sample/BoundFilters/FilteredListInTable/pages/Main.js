/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/test/Opa5"
], function (Opa5) {
	"use strict";

	const sViewName = "sap.ui.core.sample.BoundFilters.FilteredListInTable.V";

	const isSelectInRow = (iRow) => (oSelect) => {
		const oContext = oSelect.getBindingContext();
		return oContext && oContext.getPath() === `/customers/${iRow}`;
	};

	Opa5.createPageObjects({
		onTheMainPage : {
			assertions : {
				iSeeSelectItemCount(iRow, iExpectedCount) {
					return this.waitFor({
						controlType : "sap.m.Select",
						viewName : sViewName,
						matchers : isSelectInRow(iRow),
						success : (aSelects) => {
							Opa5.assert.strictEqual(aSelects[0].getItems().length, iExpectedCount,
								`Select in row ${iRow} has ${iExpectedCount} items`);
						},
						errorMessage : `Could not find Select in row ${iRow}`
					});
				},
				iSeeSelectItemTexts(iRow, aExpectedTexts) {
					return this.waitFor({
						controlType : "sap.m.Select",
						viewName : sViewName,
						matchers : isSelectInRow(iRow),
						success : (aSelects) => {
							Opa5.assert.deepEqual(
								aSelects[0].getItems().map((oItem) => oItem.getText()),
								aExpectedTexts,
								`Select in row ${iRow} shows correct items`);
						},
						errorMessage : `Could not find Select in row ${iRow}`
					});
				}
			}
		}
	});
});
