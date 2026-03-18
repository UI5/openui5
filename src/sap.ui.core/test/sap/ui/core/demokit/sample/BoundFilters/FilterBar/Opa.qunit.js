/*!
 * ${copyright}
 */
/*global QUnit */
sap.ui.define([
	"sap/base/i18n/Localization",
	"sap/ui/core/sample/BoundFilters/FilterBar/pages/Main",
	"sap/ui/test/opaQunit"
], function (Localization, _Main, opaTest) {
	"use strict";

	const sDefaultLanguage = Localization.getLanguage();

	QUnit.module("sap.ui.core.sample.BoundFilters.FilterBar", {
		before: () => {
			Localization.setLanguage("en-US");
		},
		after: () => {
			Localization.setLanguage(sDefaultLanguage);
		}
	});

	//*****************************************************************************
	opaTest("Initial state shows 15 rows", (Given, _When, Then) => {
		Given.iStartMyUIComponent({
			autoWait: true,
			componentConfig: {
				name: "sap.ui.core.sample.BoundFilters.FilterBar"
			}
		});

		Then.onTheMainPage.iSeeTableRowCount(15);

		Then.iTeardownMyUIComponent();
	});

	//*****************************************************************************
	opaTest("Department 'Dev' shows 7 rows, adding location 'Wal' shows 2 rows,"
			+ " toggling clears organizational filters", (Given, When, Then) => {
		Given.iStartMyUIComponent({
			autoWait: true,
			componentConfig: {
				name: "sap.ui.core.sample.BoundFilters.FilterBar"
			}
		});

		When.onTheMainPage.iEnterDepartmentPrefix("Dev");
		Then.onTheMainPage.iSeeTableRowCount(7);

		When.onTheMainPage.iEnterLocationPrefix("Wal");
		// John Doe, Jessica Williams (Development + Walldorf)
		Then.onTheMainPage.iSeeTableRowCount(2);

		When.onTheMainPage.iToggleFilters();
		// Switching to personal clears department and location filters
		Then.onTheMainPage.iSeeTableRowCount(15);

		Then.iTeardownMyUIComponent();
	});

	//*****************************************************************************
	opaTest("First name 'J' shows 4 rows, adding last name 'S' shows 1 row",
			(Given, When, Then) => {
		Given.iStartMyUIComponent({
			autoWait: true,
			componentConfig: {
				name: "sap.ui.core.sample.BoundFilters.FilterBar"
			}
		});

		When.onTheMainPage.iToggleFilters();
		Then.onTheMainPage.iSeeTableRowCount(15);

		When.onTheMainPage.iEnterFirstNamePrefix("J");
		// John Doe, Jane Smith, Jessica Williams, James Taylor
		Then.onTheMainPage.iSeeTableRowCount(4);

		When.onTheMainPage.iEnterLastNamePrefix("S");
		// Jane Smith (first name "J" + last name "S")
		Then.onTheMainPage.iSeeTableRowCount(1);

		Then.iTeardownMyUIComponent();
	});
});
