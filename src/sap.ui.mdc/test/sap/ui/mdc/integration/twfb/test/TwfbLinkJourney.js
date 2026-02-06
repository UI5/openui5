/*!
 * ${copyright}
 */

/* global QUnit */

sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/opaQunit"
], function(
	Opa5,
	opaTest
) {
	"use strict";


	const oModuleSettings = {
		beforeEach: function() {},
		afterEach: function() {}
	};

	QUnit.module("TwFb - Link", oModuleSettings);

	opaTest("twfb - start app and test mdc links", function(Given, When, Then) {
		Given.iStartMyAppInAFrame("test-resources/sap/ui/mdc/internal/TableWithFilterBar/index.html");

		const firstLink = {text: "Pride and Prejudice"};
		When.onTheMDCLink.iPressTheLink(firstLink);
		Then.onTheMDCLink.iShouldSeeAPopover(firstLink);
		When.onTheMDCLink.iCloseThePopover();

		const secondLink = {text: "The Yellow Wallpaper"};
		When.onTheMDCLink.iPressTheLink(secondLink);
		Then.onTheMDCLink.iShouldSeeAPopover(secondLink);
		Then.onTheMDCLink.iShouldSeeLinksOnPopover(secondLink, ["Manage book"]);
		When.onTheMDCLink.iCloseThePopover();

		When.onTheMDCLink.iPersonalizeTheLinks(secondLink, ["Manage book", "Manage author"]);
		Then.onTheMDCLink.iShouldSeeLinksOnPopover(secondLink, ["Manage book", "Manage author"]);

		When.onTheMDCLink.iPressTheLink(secondLink);
		//When.onTheMDCLink.iPressLinkOnPopover(secondLink, "Manage book");
		//When.onTheMDCLink.iPressLinkOnPopover(secondLink, "Manage author");
		//Then.iShouldSeeApp("Book: The Yellow Wallpaper"});
		When.onTheMDCLink.iCloseThePopover();

		Then.iTeardownMyAppFrame();
	});
});
