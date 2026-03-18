/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/actions/EnterText",
	"sap/ui/test/actions/Press"
], function (Opa5, EnterText, Press) {
	"use strict";

	const sViewName = "sap.ui.core.sample.BoundFilters.FilterBar.V";

	Opa5.createPageObjects({
		onTheMainPage: {
			actions: {
				iToggleFilters() {
					return this.waitFor({
						id: "toggleFiltersButton",
						viewName: sViewName,
						actions: new Press(),
						errorMessage: "Could not find the toggle filters button"
					});
				},
				iEnterDepartmentPrefix(sText) {
					return this.waitFor({
						id: "departmentInput",
						viewName: sViewName,
						actions: new EnterText({text: sText, clearTextFirst: true, pressEnterKey: true}),
						errorMessage: "Could not find the department prefix input"
					});
				},
				iEnterLocationPrefix(sText) {
					return this.waitFor({
						id: "locationInput",
						viewName: sViewName,
						actions: new EnterText({text: sText, clearTextFirst: true, pressEnterKey: true}),
						errorMessage: "Could not find the location prefix input"
					});
				},
				iEnterFirstNamePrefix(sText) {
					return this.waitFor({
						id: "firstNameInput",
						viewName: sViewName,
						actions: new EnterText({text: sText, clearTextFirst: true, pressEnterKey: true}),
						errorMessage: "Could not find the first name prefix input"
					});
				},
				iEnterLastNamePrefix(sText) {
					return this.waitFor({
						id: "lastNameInput",
						viewName: sViewName,
						actions: new EnterText({text: sText, clearTextFirst: true, pressEnterKey: true}),
						errorMessage: "Could not find the last name prefix input"
					});
				}
			},
			assertions: {
				iSeeTableRowCount(iExpectedCount) {
					return this.waitFor({
						id: "myTable",
						viewName: sViewName,
						matchers(oTable) {
							return oTable.getBinding("rows").getLength() === iExpectedCount;
						},
						success(oTable) {
							Opa5.assert.strictEqual(oTable.getBinding("rows").getLength(),
								iExpectedCount,
								`Table shows ${iExpectedCount} rows`);
						},
						errorMessage: `Table does not show ${iExpectedCount} rows`
					});
				}
			}
		}
	});
});
