/*global describe,it,element,by,takeScreenshot,expect,browser,protractor*/

describe("sap.ui.core.Tooltip", function () {
	"use strict";

	browser.testrunner.currentSuite.meta.controlName = "sap.ui.core.tooltip.Tooltip";

	// Drives the showcase page (test-resources/sap/ui/core/Tooltip.html): each button opens exactly
	// ONE tooltip immediately (delay 0) via its stable id, so every screenshot is a clean, comparable image.

	// Centers the deterministic-states anchor so a tooltip opened on it (Top /
	// Bottom / Left / Right) is fully within the viewport and not clipped.
	function centerAnchor() {
		browser.executeScript(function () {
			var oAnchor = document.getElementById("vtAnchor");
			if (oAnchor) {
				oAnchor.scrollIntoView({ block: "center", inline: "center" });
			}
		});
	}

	// Give the open delay (0ms timer) and the Popover open animation time to
	// settle before the screenshot is taken.
	function settle() {
		browser.sleep(750);
	}

	// Hover a host by id (scroll into view, move mouse over, wait for open delay + animation) to drive
	// the real mouseenter path, as opposed to the deterministic openBy() states above.
	function hover(sId) {
		browser.executeScript(function (id) {
			var oEl = document.getElementById(id);
			if (oEl) {
				oEl.scrollIntoView({ block: "center", inline: "center" });
			}
		}, sId);
		browser.actions().mouseMove(element(by.id(sId))).perform();
		browser.sleep(1500);
	}

	// Move the mouse off any host (onto the page intro text) so a hover tooltip
	// closes before the next, unrelated state is captured.
	function moveAway() {
		browser.actions().mouseMove(element(by.id("pageIntro"))).perform();
		browser.sleep(500);
	}

	it("should load test page", function () {
		expect(takeScreenshot()).toLookAs("initial");
	});

	// --- Placement: distinct arrow side per placement ---
	[
		{ id: "vtTop", name: "placement-top" },
		{ id: "vtBottom", name: "placement-bottom" },
		{ id: "vtLeft", name: "placement-left" },
		{ id: "vtRight", name: "placement-right" }
	].forEach(function (oCase) {
		it("should open tooltip with " + oCase.name, function () {
			element(by.id("vtClose")).click();
			centerAnchor();
			element(by.id(oCase.id)).click();
			settle();
			expect(takeScreenshot()).toLookAs(oCase.name);
		});
	});

	// --- Text length: single-line vs wrapped within the tooltip max width ---
	[
		{ id: "vtShort", name: "text-short" },
		{ id: "vtLong", name: "text-long" },
		{ id: "vtVeryLong", name: "text-very-long" }
	].forEach(function (oCase) {
		it("should open tooltip with " + oCase.name, function () {
			element(by.id("vtClose")).click();
			centerAnchor();
			element(by.id(oCase.id)).click();
			settle();
			expect(takeScreenshot()).toLookAs(oCase.name);
		});
	});

	// --- Auto-flip near the viewport edges ---
	it("should reveal the viewport-edge anchors", function () {
		element(by.id("vtClose")).click();
		// Tick the checkbox once so the fixed-position anchors are rendered
		// before any flip button opens a tooltip on them.
		element(by.id("vtFlipShow")).click();
	});

	[
		{ id: "vtFlipTop", name: "flip-top-to-bottom" },
		{ id: "vtFlipBottom", name: "flip-bottom-to-top" },
		{ id: "vtFlipLeft", name: "flip-left-to-right" },
		{ id: "vtFlipRight", name: "flip-right-to-left" }
	].forEach(function (oCase) {
		it("should flip tooltip: " + oCase.name, function () {
			element(by.id("vtFlipClose")).click();
			element(by.id(oCase.id)).click();
			settle();
			expect(takeScreenshot()).toLookAs(oCase.name);
		});
	});

	// --- Tooltip layered above a modal Dialog ---
	it("should show tooltip above a modal dialog", function () {
		// Close the last flip tooltip and hide the fixed-position edge anchors so
		// they don't bleed into this screenshot over the dialog's block layer.
		element(by.id("vtFlipClose")).click();
		element(by.id("vtFlipShow")).click();
		element(by.id("vtDialogOpen")).click();
		settle();
		element(by.id("vtDialogShow")).click();
		settle();
		expect(takeScreenshot()).toLookAs("dialog-tooltip-above");
		element(by.id("vtDialogClose")).click();
	});

	// --- Programmatic API: openBy(anchor, 0) / close(0) ---
	it("should open a tooltip via openBy(anchor)", function () {
		element(by.id("apiOpen")).click();
		settle();
		expect(takeScreenshot()).toLookAs("api-opened");
		element(by.id("apiClose")).click();
		settle();
	});

	// --- Tooltip hosts inside Popover / nested Popover-in-Dialog ---
	// Each state captures the tooltip open and layered above its container (the Dialog case is "dialog-tooltip-above" above).
	it("should layer a tooltip above a Popover", function () {
		element(by.id("ctOpenPopover")).click();
		settle();
		element(by.id("ctPopoverShow")).click();
		settle();
		expect(takeScreenshot()).toLookAs("container-popover-tooltip");
		// Click outside the (non-modal) popover to dismiss it and its tooltip.
		element(by.id("pageIntro")).click();
		settle();
	});

	it("should layer a tooltip above a nested Popover-in-Dialog", function () {
		element(by.id("ctOpenNested")).click();
		settle();
		element(by.id("ctNestedInnerOpen")).click();
		settle();
		element(by.id("ctNestedShow")).click();
		settle();
		expect(takeScreenshot()).toLookAs("container-nested-tooltip");
		// Unwind the stack with Esc: tooltip, then nested popover, then the
		// modal dialog (each Esc dismisses the current topmost popup).
		browser.actions().sendKeys(protractor.Key.ESCAPE).perform();
		settle();
		browser.actions().sendKeys(protractor.Key.ESCAPE).perform();
		settle();
		browser.actions().sendKeys(protractor.Key.ESCAPE).perform();
		settle();
	});

	// --- Hover-driven states (real mouseenter path) ---
	it("should show tooltip on hover of the default button", function () {
		hover("defaultBtn");
		expect(takeScreenshot()).toLookAs("default-hover");
	});

	it("should show tooltip on hover of a placement button", function () {
		hover("placeRight");
		expect(takeScreenshot()).toLookAs("placement-hover-right");
	});

	it("should show tooltip on hover with delay 0", function () {
		hover("delayImmediate");
		expect(takeScreenshot()).toLookAs("delay-hover-immediate");
	});

	it("should show tooltip on hover of non-focusable text", function () {
		hover("textPlain");
		expect(takeScreenshot()).toLookAs("text-plain-hover");
	});

	it("should show tooltip on hover of focusable text", function () {
		hover("textFocusable");
		expect(takeScreenshot()).toLookAs("text-focusable-hover");
	});

	it("should show tooltip on hover of a link", function () {
		hover("linkSap");
		expect(takeScreenshot()).toLookAs("link-hover");
	});

	// --- Viewport-corner buttons: strict placement flips away from the edge ---
	it("should reveal the viewport-corner buttons", function () {
		moveAway();
		element(by.id("cornerShow")).click();
	});

	[
		{ id: "cornerTL", name: "corner-top-left" },
		{ id: "cornerTR", name: "corner-top-right" },
		{ id: "cornerBL", name: "corner-bottom-left" },
		{ id: "cornerBR", name: "corner-bottom-right" }
	].forEach(function (oCase) {
		it("should flip tooltip in " + oCase.name, function () {
			hover(oCase.id);
			expect(takeScreenshot()).toLookAs(oCase.name);
		});
	});
});
