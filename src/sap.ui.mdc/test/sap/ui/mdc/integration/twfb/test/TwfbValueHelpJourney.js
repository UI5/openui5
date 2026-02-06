/*!
 * ${copyright}
 */

/* global QUnit */

sap.ui.define([
	"sap/ui/test/Opa5",
	"test-resources/sap/ui/mdc/testutils/opa/valueHelp/Actions",
	"test-resources/sap/ui/mdc/testutils/opa/filterfield/Actions",
	"sap/ui/test/opaQunit",
	"sap/ui/events/KeyCodes"
], function(
	Opa5,
	ValueHelpActions,
	FilterFieldActions,
	opaTest,
	KeyCodes
) {
	"use strict";

	Opa5.extendConfig({
		actions: new Opa5({
			iToggleTheValueHelpListItem: function (sText, sValueHelpId) {
				return ValueHelpActions.iToggleTheValueHelpListItem.call(this, sText, sValueHelpId);
			},
			iEnterTextOnTheFilterField: function(vIdentifier, sValue, oConfig) {
				return FilterFieldActions.iEnterTextOnTheFilterField.call(this, vIdentifier, sValue,oConfig);
			},
			iPressKeyOnTheFilterField: function(vIdentifier, keyCode) {
				return FilterFieldActions.iPressKeyOnTheFilterField.call(this, vIdentifier, keyCode);
			}
		})
	});

	const oModuleSettings = {
		beforeEach: function() {},
		afterEach: function() {}
	};

	QUnit.module("TwFb - ValueHelp", oModuleSettings);

	opaTest("twfb - start app and test filterfield and valuehelp", function(Given, When, Then) {
		Given.iStartMyAppInAFrame("test-resources/sap/ui/mdc/internal/TableWithFilterBar/index.html");

		let sFieldID = "container-v4demo---books--ff1";
		When.onTheMDCFilterField.iOpenTheValueHelpForFilterField(sFieldID, true);

		Then.onTheMDCValueHelp.iShouldSeeTheValueHelpDialog("container-v4demo---books--FH1");
		Then.onTheMDCValueHelp.iShouldSeeValueHelpListItems("Austen, Jane");

		When.onTheMDCValueHelp.iNavigateToValueHelpContent({label: "Author ID"});
		Then.onTheMDCValueHelp.iShouldSeeValueHelpContent({label: "Author ID"});
		When.onTheMDCValueHelp.iNavigateToValueHelpContent({title: "Default"});

		When.iToggleTheValueHelpListItem("Austen, Jane");

		When.onTheMDCValueHelp.iCloseTheValueHelpDialog();
		Then.onTheMDCFilterField.iShouldSeeTheFilterFieldWithValues(sFieldID, "Austen, Jane");


		When.onTheMDCFilterField.iOpenTheValueHelpForFilterField(sFieldID, true);

		When.iToggleTheValueHelpListItem("Carroll, Lewis");
		When.iToggleTheValueHelpListItem("Twain, Mark");

		Then.onTheMDCValueHelp.iShouldSeeValueHelpToken("Austen, Jane");
		Then.onTheMDCValueHelp.iShouldSeeValueHelpToken("Carroll, Lewis");
		Then.onTheMDCValueHelp.iShouldSeeValueHelpToken("Twain, Mark");

		When.onTheMDCValueHelp.iRemoveValueHelpToken("Austen, Jane");
		When.onTheMDCValueHelp.iRemoveAllValueHelpTokens();


		When.onTheMDCValueHelp.iCloseTheValueHelpDialog(true);

		sFieldID = "container-v4demo---books--ff2";
		When.onTheMDCFilterField.iOpenTheValueHelpForFilterField(sFieldID, true);
		When.onTheMDCValueHelp.iCloseTheValueHelpDialog(true);

		When.iEnterTextOnTheFilterField(sFieldID, "The Yellow", {
			keepFocus: true
		});
		Then.onTheMDCValueHelp.iShouldSeeValueHelpPopover("container-v4demo---books--FH4");
		When.iPressKeyOnTheFilterField(sFieldID, KeyCodes.ESCAPE);
		Then.onTheMDCFilterField.iShouldSeeTheFilterFieldWithValues(sFieldID, "");

		When.iEnterTextOnTheFilterField(sFieldID, "Pride", {
			keepFocus: true
		});
		Then.onTheMDCValueHelp.iShouldSeeValueHelpPopover("container-v4demo---books--FH4");
		When.iPressKeyOnTheFilterField(sFieldID, KeyCodes.ENTER);
		Then.onTheMDCFilterField.iShouldSeeTheFilterFieldWithValues(sFieldID, "Pride and Prejudice");

		When.iEnterTextOnTheFilterField(sFieldID, "The Yellow", {
			keepFocus: true
		});
		Then.onTheMDCValueHelp.iShouldSeeValueHelpPopover("container-v4demo---books--FH4");
		When.iPressKeyOnTheFilterField(sFieldID, KeyCodes.ENTER);
		Then.onTheMDCFilterField.iShouldSeeTheFilterFieldWithValues(sFieldID, "The Yellow Wallpaper");

		Then.iTeardownMyAppFrame();
	});

	QUnit.module("TwFb - Books/New", oModuleSettings);

	opaTest("twfb - start app and test field and valuehelp", function(Given, When, Then) {
		Given.iStartMyAppInAFrame("test-resources/sap/ui/mdc/internal/TableWithFilterBar/index.html#Books/new");

		const sAuthorsFieldID = "container-v4demo---bookdetails--fAuthor";
		const sAuthorsValueHelpID = "container-v4demo---bookdetails--FH1";

		Then.onTheMDCField.iShouldSeeTheFieldWithValues(sAuthorsFieldID, "105 (Kafka, Franz)");

		When.onTheMDCField.iOpenTheValueHelpForField(sAuthorsFieldID, true);
		Then.onTheMDCValueHelp.iShouldSeeTheValueHelpDialog(sAuthorsValueHelpID);
		Then.onTheMDCValueHelp.iShouldSeeValueHelpListItems("Austen, Jane");
		When.iToggleTheValueHelpListItem("Austen, Jane");

		Then.onTheMDCField.iShouldSeeTheFieldWithValues(sAuthorsFieldID, "101 (Austen, Jane)");

		Then.iTeardownMyAppFrame();
	});
});
