/* eslint-env node */
/* global describe, it, browser */

var utils = require("./cardVisualTestUtils");

describe("sap.ui.integration.CardXSZoomVisualTests", function () {
	"use strict";
	browser.testrunner.currentSuite.meta.controlName = "sap.ui.integration.widgets.Card";

	// ACC-260: at <= 180px header width (a 360px device at 200% text zoom) the card
	// header switches to the XS layout. A ResizeHandler on the header toggles the
	// `sapFCardXSHeader` class, which drives the XS layout rules. Tile variants are
	// excluded from the XS rules in CSS (via :not(.sapUiIntCardTile)), so none of the
	// cards below are tiles. These cards are rendered at a fixed width of 180px in the
	// ExtraSmallCards demo view, so the XS layout is always applied and can be captured
	// for visual regression.
	// The IDs below mirror the XS cards defined in
	// sap.f/test/sap/f/cardsdemo/view/ExtraSmallCards.view.xml. A representative subset
	// is captured - one card per distinct XS layout variant - to keep the number of
	// reference images maintainable.
	var aXSCardIds = [
		"xsCard1",                 // B1: avatar, no toolbar - title/subtitle next to avatar
		"xsCard3",                 // B2: avatar + action/status/timestamp - title/subtitle below, 3-dots top-right
		"xsBulletChart",           // numeric header: full-width microchart below the indicators
		"xsLongInfoSection",       // info section wrapping/padding + numeric part + chart
		"xs4Indicators"            // C: side indicators wrapping in the 2-column grid
	];

	it("XS card header layout (180px / 200% zoom)", function () {
		utils.navigateTo("Extra Small Cards");

		aXSCardIds.forEach(function (sId) {
			utils.takePictureOfElement({
				control: {
					viewNamespace: "sap.f.cardsdemo.view.",
					viewName: "ExtraSmallCards",
					interaction: "root",
					id: sId
				}
			}, "XS_Header_" + sId);
		});

		utils.navigateBack();
	});
});
