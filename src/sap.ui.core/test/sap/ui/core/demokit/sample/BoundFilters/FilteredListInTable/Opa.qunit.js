/*!
 * ${copyright}
 */
/*global QUnit */
sap.ui.define([
	"sap/base/i18n/Localization",
	"sap/ui/core/sample/BoundFilters/FilteredListInTable/pages/Main",
	"sap/ui/test/opaQunit"
], function (Localization, Main, opaTest) {
	"use strict";
	const sDefaultLanguage = Localization.getLanguage();

	QUnit.module("sap.ui.core.sample.BoundFilters.FilteredListInTable", {
		before : () => {
			Localization.setLanguage("en-US");
		},
		after : () => {
			Localization.setLanguage(sDefaultLanguage);
		}
	});

	//*****************************************************************************
	opaTest("Bound filter shows only Americas managers for Americas customer", (Given, When, Then) => {
		Given.iStartMyUIComponent({
			autoWait : true,
			componentConfig : {
				name : "sap.ui.core.sample.BoundFilters.FilteredListInTable"
			}
		});

		// Row 0: TechCorp Solutions, Americas - 5 account managers
		Then.onTheMainPage.iSeeSelectItemCount(0, 5);
		Then.onTheMainPage.iSeeSelectItemTexts(0, [
			"John Smith",
			"Sarah Johnson",
			"Mike Williams",
			"Jennifer Brown",
			"David Jones"
		]);

		Then.iTeardownMyUIComponent();
	});

	//*****************************************************************************
	opaTest("Bound filter shows only EMEA managers for EMEA customer", (Given, When, Then) => {
		Given.iStartMyUIComponent({
			autoWait : true,
			componentConfig : {
				name : "sap.ui.core.sample.BoundFilters.FilteredListInTable"
			}
		});

		// Row 2: Global Industries Ltd, EMEA - 4 account managers
		Then.onTheMainPage.iSeeSelectItemCount(2, 4);
		Then.onTheMainPage.iSeeSelectItemTexts(2, [
			"Emma Anderson",
			"Lucas Mueller",
			"Sophie Dubois",
			"Marco Rossi"
		]);

		Then.iTeardownMyUIComponent();
	});

	//*****************************************************************************
	opaTest("Bound filter shows only APJ managers for APJ customer", (Given, When, Then) => {
		Given.iStartMyUIComponent({
			autoWait : true,
			componentConfig : {
				name : "sap.ui.core.sample.BoundFilters.FilteredListInTable"
			}
		});

		// Row 3: Asia Pacific Ventures, APJ - 4 account managers
		Then.onTheMainPage.iSeeSelectItemCount(3, 4);
		Then.onTheMainPage.iSeeSelectItemTexts(3, [
			"Yuki Tanaka",
			"Raj Patel",
			"Li Chen",
			"Priya Sharma"
		]);

		Then.iTeardownMyUIComponent();
	});
});
