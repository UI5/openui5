/*global describe, it, browser, takeScreenshot, expect*/

describe("sap.f.DynamicPageWithWizard", function () {
	"use strict";

	browser.testrunner.currentSuite.meta.controlName = "sap.f.DynamicPage";

	it("Initial state", function () {
		expect(takeScreenshot()).toLookAs("initial");
	});

	it("With overlay scrollbar", function () {
		simulateOverlayScrollbar().then(function () {
			expect(takeScreenshot()).toLookAs("overlay_scrollbar");
		});
	});

	function simulateOverlayScrollbar() {
		return browser.executeScript(function () {
			var Element = sap.ui.require("sap/ui/core/Element");
			var oDynamicPage = Element.closestTo(document.querySelector(".sapFDynamicPage"));
			if (oDynamicPage) {
				oDynamicPage._hasOverlayScrollbar = function () { return true; };
				oDynamicPage._getEffectiveScrollbarWidth = function () { return 12; };
				oDynamicPage._toggleSpaceForScrollbar(true);
			}
		});
	}
});
