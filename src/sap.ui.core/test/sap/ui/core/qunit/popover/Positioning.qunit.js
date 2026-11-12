/*global QUnit, sinon */
sap.ui.define([
	"sap/ui/core/popover/Positioning",
	"sap/ui/core/library",
	"sap/ui/core/popover/PopoverFlipMode",
	"sap/base/i18n/Localization",
	"sap/ui/dom/getScrollbarSize",
	"sap/base/Log"
], (Positioning, coreLibrary, FlipMode, Localization, getScrollbarSize, Log) => {
	"use strict";

	const PopoverPlacement = coreLibrary.popover.PopoverPlacement;
	const PopoverHorizontalAlign = coreLibrary.popover.PopoverHorizontalAlign;
	const PopoverVerticalAlign = coreLibrary.popover.PopoverVerticalAlign;

	// Plain rect helper used by the computeArrowOffset tests, which accept
	// pre-measured openerRect/popoverRect rects directly (no DOM needed).
	const rect = (top, left, width, height) => ({
		top,
		left,
		width,
		height,
		bottom: top + height,
		right: left + width
	});

	// The helpers below create fixed-position
	// elements with pinned sizes so the geometry is deterministic regardless of
	// the test runner's own viewport and scroll position.
	const aCleanup = [];

	// Pinned document-height accessors, restored in testDone.
	const aDocHeightProps = [];

	// Pin the viewport width/height to a deterministic size. computePopoverPositionCss
	// and computeMaxContentSize read document.documentElement.clientWidth/clientHeight
	// internally; the test runner is unscrolled so window.scrollX/scrollY stay 0.
	function stubViewport(iWidth, iHeight) {
		Object.defineProperty(document.documentElement, "clientWidth", { configurable: true, get: () => iWidth });
		Object.defineProperty(document.documentElement, "clientHeight", { configurable: true, get: () => iHeight });
	}

	function restoreViewport() {
		delete document.documentElement.clientWidth;
		delete document.documentElement.clientHeight;
	}

	// A within-area of the given inner size, pinned top-left with no padding.
	// Also pins the document-end height to iHeight so getBottomBound() is
	// deterministic regardless of the runner page.
	function makeWithinArea(iWidth, iHeight) {
		const oEl = document.createElement("div");
		oEl.style.cssText = "position:fixed;top:0;left:0;box-sizing:border-box;padding:0;border:0;"
			+ "width:" + iWidth + "px;height:" + iHeight + "px;";
		document.body.appendChild(oEl);
		aCleanup.push(oEl);

		["scrollHeight", "offsetHeight"].forEach((sProp) => {
			Object.defineProperty(document.body, sProp, { configurable: true, get: () => iHeight });
			aDocHeightProps.push([document.body, sProp]);
		});
		["clientHeight", "offsetHeight"].forEach((sProp) => {
			Object.defineProperty(document.documentElement, sProp, { configurable: true, get: () => iHeight });
			aDocHeightProps.push([document.documentElement, sProp]);
		});
		return oEl;
	}

	// An opener pinned (position:fixed, unscrolled) at the given coordinates, so
	// its getBoundingClientRect matches {top,left,width,height} exactly and its
	// page-relative top equals its viewport-relative top.
	function makeOpener(iTop, iLeft, iWidth, iHeight) {
		const oEl = document.createElement("div");
		oEl.style.cssText = "position:fixed;box-sizing:border-box;padding:0;border:0;"
			+ "top:" + iTop + "px;left:" + iLeft + "px;width:" + iWidth + "px;height:" + iHeight + "px;";
		document.body.appendChild(oEl);
		aCleanup.push(oEl);
		return oEl;
	}

	// A popover / tooltip element of the given size, measured internally by
	// resolvePlacement via getBoundingClientRect.
	function makePopover(iWidth, iHeight) {
		const oEl = document.createElement("div");
		oEl.style.cssText = "position:fixed;top:0;left:0;box-sizing:border-box;padding:0;border:0;"
			+ "width:" + iWidth + "px;height:" + iHeight + "px;";
		document.body.appendChild(oEl);
		aCleanup.push(oEl);
		return oEl;
	}

	QUnit.testDone(() => {
		aCleanup.splice(0).forEach((oEl) => oEl.remove());
		aDocHeightProps.splice(0).forEach(([oTarget, sProp]) => delete oTarget[sProp]);
	});

	const NO_MARGINS = { top: 0, right: 0, bottom: 0, left: 0 };

	// ---------------------------------------------------------------------
	QUnit.module("resolvePlacement — Never keeps the strict vertical side");

	[
		{ placement: PopoverPlacement.Top, expected: "Top" },
		{ placement: PopoverPlacement.Bottom, expected: "Bottom" }
	].forEach(({ placement, expected }) => {
		QUnit.test(`'${placement}' with Never returns ${expected} regardless of space`, (assert) => {
			const sResult = Positioning.resolvePlacement({
				placement,
				flipMode: FlipMode.Never,
				openerRef: makeOpener(0, 0, 10, 10),
				popoverRef: makePopover(5000, 5000), // absurdly large — would never "fit"
				withinAreaRef: makeWithinArea(100, 100),
				margin: NO_MARGINS,
				arrowSize: 0
			});
			assert.strictEqual(sResult, expected, "Never never flips the vertical side");
		});
	});

	// ---------------------------------------------------------------------
	QUnit.module("resolvePlacement — strict Begin/End (Never) never flip");

	QUnit.test("'Begin' stays Left when the left side fits", (assert) => {
		assert.strictEqual(Positioning.resolvePlacement({
			placement: PopoverPlacement.Begin,
			flipMode: FlipMode.Never,
			openerRef: makeOpener(0, 200, 10, 10), // room on the left
			popoverRef: makePopover(50, 50),
			withinAreaRef: makeWithinArea(400, 400),
			margin: NO_MARGINS,
			arrowSize: 0
		}), "Left", "left fits → Left");
	});

	QUnit.test("'Begin' stays Left even when the left side has no room", (assert) => {
		assert.strictEqual(Positioning.resolvePlacement({
			placement: PopoverPlacement.Begin,
			flipMode: FlipMode.Never,
			openerRef: makeOpener(0, 0, 10, 10), // pinned to the left edge
			popoverRef: makePopover(50, 50),
			withinAreaRef: makeWithinArea(400, 400),
			margin: NO_MARGINS,
			arrowSize: 0
		}), "Left", "no left room → still Left (Popup 'fit' handles overflow, no flip)");
	});

	QUnit.test("'End' stays Right even when the right side has no room", (assert) => {
		assert.strictEqual(Positioning.resolvePlacement({
			placement: PopoverPlacement.End,
			flipMode: FlipMode.Never,
			openerRef: makeOpener(0, 390, 10, 10), // pinned to the right edge (within 400)
			popoverRef: makePopover(50, 50),
			withinAreaRef: makeWithinArea(400, 400),
			margin: NO_MARGINS,
			arrowSize: 0
		}), "Right", "no right room → still Right (Popup 'fit' handles overflow, no flip)");
	});

	QUnit.test("'Begin' stays Left when neither side fits", (assert) => {
		assert.strictEqual(Positioning.resolvePlacement({
			placement: PopoverPlacement.Begin,
			flipMode: FlipMode.Never,
			openerRef: makeOpener(0, 0, 10, 10),
			popoverRef: makePopover(5000, 50), // wider than either side
			withinAreaRef: makeWithinArea(400, 400),
			margin: NO_MARGINS,
			arrowSize: 0
		}), "Left", "neither fits → keep requested side");
	});

	// ---------------------------------------------------------------------
	QUnit.module("resolvePlacement — vertical (Top/Bottom)");

	QUnit.test("Auto picks the side with more free space", (assert) => {
		const oWithin = makeWithinArea(500, 500);
		// opener near the top → more space below → Bottom
		assert.strictEqual(Positioning.resolvePlacement({
			placement: PopoverPlacement.Top,
			auto: true,
			openerRef: makeOpener(50, 0, 50, 50),
			popoverRef: makePopover(50, 50),
			withinAreaRef: oWithin,
			margin: NO_MARGINS,
			arrowSize: 0
		}), "Bottom", "opener high on screen → Bottom");

		// opener near the bottom → more space above → Top
		assert.strictEqual(Positioning.resolvePlacement({
			placement: PopoverPlacement.Top,
			auto: true,
			openerRef: makeOpener(450, 0, 50, 50),
			popoverRef: makePopover(50, 50),
			withinAreaRef: oWithin,
			margin: NO_MARGINS,
			arrowSize: 0
		}), "Top", "opener low on screen → Top");
	});

	QUnit.test("MoreSpace honours the preference when it fits", (assert) => {
		// Enough space above (top=400, popover 50 + arrow 0 < 400) → Top even though bottom has more.
		assert.strictEqual(Positioning.resolvePlacement({
			placement: PopoverPlacement.Top,
			flipMode: FlipMode.MoreSpace,
			openerRef: makeOpener(400, 0, 50, 50),
			popoverRef: makePopover(50, 50),
			withinAreaRef: makeWithinArea(500, 500),
			margin: NO_MARGINS,
			arrowSize: 0
		}), "Top", "prefers Top when it fits");
	});

	QUnit.test("MoreSpace falls back to Bottom when Top doesn't fit", (assert) => {
		// top space = 40, popover height 50 → doesn't fit above → Bottom
		assert.strictEqual(Positioning.resolvePlacement({
			placement: PopoverPlacement.Top,
			flipMode: FlipMode.MoreSpace,
			openerRef: makeOpener(40, 0, 50, 50),
			popoverRef: makePopover(50, 50),
			withinAreaRef: makeWithinArea(500, 500),
			margin: NO_MARGINS,
			arrowSize: 0
		}), "Bottom", "insufficient top space → Bottom");
	});

	QUnit.test("Opposite flips to Bottom when Top is too small", (assert) => {
		assert.strictEqual(Positioning.resolvePlacement({
			placement: PopoverPlacement.Top,
			flipMode: FlipMode.Opposite,
			openerRef: makeOpener(40, 0, 50, 50),
			popoverRef: makePopover(50, 50),
			withinAreaRef: makeWithinArea(500, 500),
			margin: NO_MARGINS,
			arrowSize: 0
		}), "Bottom", "flips to Bottom");

		assert.strictEqual(Positioning.resolvePlacement({
			placement: PopoverPlacement.Top,
			flipMode: FlipMode.Opposite,
			openerRef: makeOpener(150, 0, 50, 50),
			popoverRef: makePopover(50, 50),
			withinAreaRef: makeWithinArea(500, 500),
			margin: NO_MARGINS,
			arrowSize: 0
		}), "Top", "stays Top when it fits");
	});

	// ---------------------------------------------------------------------
	QUnit.module("resolvePlacement — scrolled page (window within-area)", {
		beforeEach() {
			// Simulate a page scrolled down 1000px with a 500px-tall viewport.
			// A position:fixed opener keeps a small viewport-relative top, but its
			// page-relative top is inflated by the scroll — the vertical space
			// math must use the visible (viewport) gap, not the page-relative top.
			this._scrollY = Object.getOwnPropertyDescriptor(window, "scrollY");
			this._innerH = Object.getOwnPropertyDescriptor(window, "innerHeight");
			Object.defineProperty(window, "scrollY", { configurable: true, get: () => 1000 });
			Object.defineProperty(window, "innerHeight", { configurable: true, get: () => 500 });
			stubViewport(500, 500);
		},
		afterEach() {
			restoreViewport();
			if (this._scrollY) { Object.defineProperty(window, "scrollY", this._scrollY); } else { delete window.scrollY; }
			if (this._innerH) { Object.defineProperty(window, "innerHeight", this._innerH); } else { delete window.innerHeight; }
		}
	});

	QUnit.test("Top/MoreSpace flips to Bottom when the opener is near the viewport top on a scrolled page", (assert) => {
		// Fixed opener sits 40px below the viewport top; only 40px of visible space
		// above → 50px popover cannot fit → must flip to Bottom (regression: the
		// page-relative top of ~1040px falsely reported "room above" → stuck Top).
		assert.strictEqual(Positioning.resolvePlacement({
			placement: PopoverPlacement.Top,
			flipMode: FlipMode.MoreSpace,
			openerRef: makeOpener(40, 0, 50, 50),
			popoverRef: makePopover(50, 50),
			withinAreaRef: window,
			margin: NO_MARGINS,
			arrowSize: 0
		}), "Bottom", "no visible space above → Bottom, not Top-over-opener");
	});

	QUnit.test("Top/Auto picks Bottom for a viewport-top opener on a scrolled page", (assert) => {
		assert.strictEqual(Positioning.resolvePlacement({
			placement: PopoverPlacement.Top,
			auto: true,
			openerRef: makeOpener(40, 0, 50, 50),
			popoverRef: makePopover(50, 50),
			withinAreaRef: window,
			margin: NO_MARGINS,
			arrowSize: 0
		}), "Bottom", "more visible space below → Bottom");
	});

	// ---------------------------------------------------------------------
	QUnit.module("resolvePlacement — custom within-area bottom bound", {
		beforeEach() {
			// A tall document (5000px) with a within-area that occupies only a
			// band of it (top 200, height 300 → bottom 500). getBottomBound must
			// measure to the within-area's bottom (500), NOT area.top + docHeight.
			this._scrollHeight = Object.getOwnPropertyDescriptor(document.body, "scrollHeight");
			Object.defineProperty(document.body, "scrollHeight", { configurable: true, get: () => 5000 });
			stubViewport(500, 5000);
		},
		afterEach() {
			restoreViewport();
			if (this._scrollHeight) { Object.defineProperty(document.body, "scrollHeight", this._scrollHeight); } else { delete document.body.scrollHeight; }
		}
	});

	// Within-area placed at page top 200, height 300 (bottom 500). Not pinned to
	// doc height, unlike makeWithinArea — reproduces the live BL-opener bug.
	function makeOffsetWithinArea(iTop, iWidth, iHeight) {
		const oEl = document.createElement("div");
		oEl.style.cssText = "position:fixed;box-sizing:border-box;padding:0;border:0;"
			+ "top:" + iTop + "px;left:0;width:" + iWidth + "px;height:" + iHeight + "px;";
		document.body.appendChild(oEl);
		aCleanup.push(oEl);
		return oEl;
	}

	QUnit.test("Bottom/MoreSpace flips to Top for an opener at the within-area bottom", (assert) => {
		// Opener sits at the area bottom (top 450, bottom 500 = area bottom) →
		// ~0 space below inside the area → must flip Top (regression: the bottom
		// bound used area.top + docHeight, falsely reporting huge room below).
		assert.strictEqual(Positioning.resolvePlacement({
			placement: PopoverPlacement.Bottom,
			flipMode: FlipMode.MoreSpace,
			openerRef: makeOpener(450, 0, 50, 50),
			popoverRef: makePopover(50, 50),
			withinAreaRef: makeOffsetWithinArea(200, 500, 300),
			margin: NO_MARGINS,
			arrowSize: 0
		}), "Top", "no space below within-area → Top");
	});

	// ---------------------------------------------------------------------
	QUnit.module("resolvePlacement — horizontal (Begin/End)");

	// calcHorizontal resolves Begin to the physical Left label and End to the
	// physical Right label, but in RTL it still measures the OPPOSITE side's free
	// space (iStartSpace = s.right, iEndSpace = s.left). The tests below pin RTL and
	// assert the side the current source actually resolves for each opener position.

	QUnit.test("MoreSpace/Begin in RTL flips to Right when the RTL start-space is cramped", (assert) => {
		const oStub = sinon.stub(Localization, "getRTL").returns(true);
		// opener at the physical-right edge → RTL start-space (physical right) ~0, end-space roomier → End label.
		assert.strictEqual(Positioning.resolvePlacement({
			placement: PopoverPlacement.Begin,
			flipMode: FlipMode.MoreSpace,
			openerRef: makeOpener(0, 450, 50, 50),
			popoverRef: makePopover(100, 50),
			withinAreaRef: makeWithinArea(500, 500),
			margin: NO_MARGINS,
			arrowSize: 0
		}), "Right", "RTL MoreSpace/Begin: no RTL start-space → Right");
		oStub.restore();
	});

	QUnit.test("MoreSpace/Begin in RTL stays Left when the RTL start-space fits", (assert) => {
		const oStub = sinon.stub(Localization, "getRTL").returns(true);
		// opener at the physical-left edge → RTL start-space (physical right) is roomy and fits → Left label.
		assert.strictEqual(Positioning.resolvePlacement({
			placement: PopoverPlacement.Begin,
			flipMode: FlipMode.MoreSpace,
			openerRef: makeOpener(0, 0, 50, 50),
			popoverRef: makePopover(100, 50),
			withinAreaRef: makeWithinArea(500, 500),
			margin: NO_MARGINS,
			arrowSize: 0
		}), "Left", "RTL MoreSpace/Begin: RTL start-space fits → Left");
		oStub.restore();
	});

	QUnit.test("Opposite/Begin in RTL keeps Left for a left-edge opener", (assert) => {
		const oStub = sinon.stub(Localization, "getRTL").returns(true);
		// opener at the physical-left edge → RTL start-space (physical right) fits → Begin stays Left (no flip).
		assert.strictEqual(Positioning.resolvePlacement({
			placement: PopoverPlacement.Begin,
			flipMode: FlipMode.Opposite,
			openerRef: makeOpener(0, 0, 50, 50),
			popoverRef: makePopover(100, 50),
			withinAreaRef: makeWithinArea(500, 500),
			margin: NO_MARGINS,
			arrowSize: 0
		}), "Left", "RTL Opposite/Begin: RTL start-space fits → stays Left");
		oStub.restore();
	});

	QUnit.test("MoreSpace/End in RTL resolves to Left when the RTL end-space fits", (assert) => {
		const oStub = sinon.stub(Localization, "getRTL").returns(true);
		// opener at the physical-left edge → RTL end-space (physical left) ~0, start-space roomier → Start label (Left).
		assert.strictEqual(Positioning.resolvePlacement({
			placement: PopoverPlacement.End,
			flipMode: FlipMode.MoreSpace,
			openerRef: makeOpener(0, 0, 50, 50),
			popoverRef: makePopover(100, 50),
			withinAreaRef: makeWithinArea(500, 500),
			margin: NO_MARGINS,
			arrowSize: 0
		}), "Left", "RTL MoreSpace/End: cramped RTL end-space → Left");
		oStub.restore();
	});

	QUnit.test("MoreSpace/End in RTL resolves to Right for a right-edge opener", (assert) => {
		const oStub = sinon.stub(Localization, "getRTL").returns(true);
		// opener at the physical-right edge → RTL end-space (physical left) is roomy → End label (Right).
		assert.strictEqual(Positioning.resolvePlacement({
			placement: PopoverPlacement.End,
			flipMode: FlipMode.MoreSpace,
			openerRef: makeOpener(0, 450, 50, 50),
			popoverRef: makePopover(100, 50),
			withinAreaRef: makeWithinArea(500, 500),
			margin: NO_MARGINS,
			arrowSize: 0
		}), "Right", "RTL MoreSpace/End: RTL end-space fits → Right");
		oStub.restore();
	});

	QUnit.test("Opposite/End in RTL keeps Right for a right-edge opener", (assert) => {
		const oStub = sinon.stub(Localization, "getRTL").returns(true);
		assert.strictEqual(Positioning.resolvePlacement({
			placement: PopoverPlacement.End,
			flipMode: FlipMode.Opposite,
			openerRef: makeOpener(0, 450, 50, 50),
			popoverRef: makePopover(100, 50),
			withinAreaRef: makeWithinArea(500, 500),
			margin: NO_MARGINS,
			arrowSize: 0
		}), "Right", "RTL Opposite/End: RTL end-space fits → stays Right");
		oStub.restore();
	});

	QUnit.test("MoreSpace keeps the preferred side on an exact space tie in RTL", (assert) => {
		const oStub = sinon.stub(Localization, "getRTL").returns(true);
		const oCenter = makeOpener(0, 225, 50, 50); // left gap 225 == right gap 225; popover 400 fits neither
		assert.strictEqual(Positioning.resolvePlacement({
			placement: PopoverPlacement.Begin,
			flipMode: FlipMode.MoreSpace,
			openerRef: oCenter,
			popoverRef: makePopover(400, 50),
			withinAreaRef: makeWithinArea(500, 500),
			margin: NO_MARGINS,
			arrowSize: 0
		}), "Left", "RTL tie honours the preferred Begin → Left label");

		assert.strictEqual(Positioning.resolvePlacement({
			placement: PopoverPlacement.End,
			flipMode: FlipMode.MoreSpace,
			openerRef: oCenter,
			popoverRef: makePopover(400, 50),
			withinAreaRef: makeWithinArea(500, 500),
			margin: NO_MARGINS,
			arrowSize: 0
		}), "Right", "RTL tie honours the preferred End → Right label");
		oStub.restore();
	});

	QUnit.test("RTL mirrors the LTR physical side for every Begin/End case", (assert) => {
		// calcHorizontal swaps the measured space in RTL but keeps the physical
		// Left/Right labels, so for a horizontal (Begin/End) placement the RTL
		// result is the mirror of the LTR result (Left <-> Right). Assert that
		// relationship directly across a matrix.
		const mirror = (sSide) => (sSide === "Left" ? "Right" : "Left");
		const aCases = [
			{ placement: PopoverPlacement.Begin, flipMode: FlipMode.MoreSpace, left: 0 },
			{ placement: PopoverPlacement.Begin, flipMode: FlipMode.MoreSpace, left: 450 },
			{ placement: PopoverPlacement.End, flipMode: FlipMode.MoreSpace, left: 0 },
			{ placement: PopoverPlacement.End, flipMode: FlipMode.MoreSpace, left: 450 },
			{ placement: PopoverPlacement.Begin, flipMode: FlipMode.Opposite, left: 0 },
			{ placement: PopoverPlacement.End, flipMode: FlipMode.Opposite, left: 450 }
		];

		aCases.forEach((oCase, i) => {
			const makeOpts = () => ({
				placement: oCase.placement,
				flipMode: oCase.flipMode,
				openerRef: makeOpener(0, oCase.left, 50, 50),
				popoverRef: makePopover(100, 50),
				withinAreaRef: makeWithinArea(500, 500),
				margin: NO_MARGINS,
				arrowSize: 0
			});

			const sLtr = Positioning.resolvePlacement(makeOpts());
			const oStub = sinon.stub(Localization, "getRTL").returns(true);
			const sRtl = Positioning.resolvePlacement(makeOpts());
			oStub.restore();

			assert.strictEqual(sRtl, mirror(sLtr), `case ${i} (${oCase.placement}/${oCase.flipMode}, left ${oCase.left}): RTL side is the mirror of LTR (${sLtr} → ${sRtl})`);
		});
	});

	QUnit.test("Opposite flips to End when Begin is too small (LTR)", (assert) => {
		assert.strictEqual(Positioning.resolvePlacement({
			placement: PopoverPlacement.Begin,
			flipMode: FlipMode.Opposite,
			openerRef: makeOpener(0, 40, 50, 50),
			popoverRef: makePopover(50, 50),
			withinAreaRef: makeWithinArea(500, 500),
			margin: NO_MARGINS,
			arrowSize: 0
		}), "Right", "flips to Right");

		assert.strictEqual(Positioning.resolvePlacement({
			placement: PopoverPlacement.Begin,
			flipMode: FlipMode.Opposite,
			openerRef: makeOpener(0, 400, 50, 50),
			popoverRef: makePopover(50, 50),
			withinAreaRef: makeWithinArea(500, 500),
			margin: NO_MARGINS,
			arrowSize: 0
		}), "Left", "stays Left when it fits");
	});

	QUnit.test("MoreSpace/Begin honours the preference when Begin fits (LTR)", (assert) => {
		// opener on the right, popover fits left → stays Left, no flip
		assert.strictEqual(Positioning.resolvePlacement({
			placement: PopoverPlacement.Begin,
			flipMode: FlipMode.MoreSpace,
			openerRef: makeOpener(225, 450, 50, 50),
			popoverRef: makePopover(100, 50),
			withinAreaRef: makeWithinArea(500, 500),
			margin: NO_MARGINS,
			arrowSize: 0
		}), "Left", "prefers Left when it fits");
	});

	QUnit.test("MoreSpace/Begin flips to Right when the opener is at the within-area left edge", (assert) => {
		assert.strictEqual(Positioning.resolvePlacement({
			placement: PopoverPlacement.Begin,
			flipMode: FlipMode.MoreSpace,
			openerRef: makeOpener(0, 0, 50, 50), // flush against the within-area left
			popoverRef: makePopover(100, 50),
			withinAreaRef: makeWithinArea(500, 500),
			margin: NO_MARGINS,
			arrowSize: 0
		}), "Right", "no left room inside the within-area → Right");
	});

	QUnit.test("MoreSpace/End flips to Left when the opener is at the within-area right edge", (assert) => {
		assert.strictEqual(Positioning.resolvePlacement({
			placement: PopoverPlacement.End,
			flipMode: FlipMode.MoreSpace,
			openerRef: makeOpener(0, 450, 50, 50), // right edge at 500 = within-area right
			popoverRef: makePopover(100, 50),
			withinAreaRef: makeWithinArea(500, 500),
			margin: NO_MARGINS,
			arrowSize: 0
		}), "Left", "no right room inside the within-area → Left");
	});

	QUnit.test("MoreSpace keeps the preferred side on an exact space tie", (assert) => {
		const oCenter = makeOpener(0, 225, 50, 50); // left gap 225 == right gap 225; popover 400 fits neither
		assert.strictEqual(Positioning.resolvePlacement({
			placement: PopoverPlacement.Begin,
			flipMode: FlipMode.MoreSpace,
			openerRef: oCenter,
			popoverRef: makePopover(400, 50),
			withinAreaRef: makeWithinArea(500, 500),
			margin: NO_MARGINS,
			arrowSize: 0
		}), "Left", "tie honours the preferred Begin → Left");

		assert.strictEqual(Positioning.resolvePlacement({
			placement: PopoverPlacement.End,
			flipMode: FlipMode.MoreSpace,
			openerRef: oCenter,
			popoverRef: makePopover(400, 50),
			withinAreaRef: makeWithinArea(500, 500),
			margin: NO_MARGINS,
			arrowSize: 0
		}), "Right", "tie honours the preferred End → Right");
	});

	QUnit.test("MoreSpace keeps the preferred vertical side on an exact space tie", (assert) => {
		const oCenter = makeOpener(225, 0, 50, 50); // top gap 225 == bottom gap 225
		assert.strictEqual(Positioning.resolvePlacement({
			placement: PopoverPlacement.Top,
			flipMode: FlipMode.MoreSpace,
			openerRef: oCenter,
			popoverRef: makePopover(50, 400),
			withinAreaRef: makeWithinArea(500, 500),
			margin: NO_MARGINS,
			arrowSize: 0
		}), "Top", "tie honours the preferred Top");

		assert.strictEqual(Positioning.resolvePlacement({
			placement: PopoverPlacement.Bottom,
			flipMode: FlipMode.MoreSpace,
			openerRef: oCenter,
			popoverRef: makePopover(50, 400),
			withinAreaRef: makeWithinArea(500, 500),
			margin: NO_MARGINS,
			arrowSize: 0
		}), "Bottom", "tie honours the preferred Bottom");
	});

	// ---------------------------------------------------------------------
	QUnit.module("resolvePlacement — absent popoverRef");

	QUnit.test("null popoverRef does not throw and resolves from opener geometry", (assert) => {
		const oWithin = makeWithinArea(500, 500);
		assert.strictEqual(Positioning.resolvePlacement({
			placement: PopoverPlacement.Top,
			auto: true,
			openerRef: makeOpener(50, 0, 50, 50), // high on screen → more room below
			popoverRef: null,                     // not rendered yet
			withinAreaRef: oWithin,
			margin: NO_MARGINS,
			arrowSize: 0
		}), "Bottom", "opener high on screen → Bottom, no crash");

		assert.strictEqual(Positioning.resolvePlacement({
			placement: PopoverPlacement.Top,
			auto: true,
			openerRef: makeOpener(450, 0, 50, 50), // low on screen → more room above
			popoverRef: null,
			withinAreaRef: oWithin,
			margin: NO_MARGINS,
			arrowSize: 0
		}), "Top", "opener low on screen → Top, no crash");
	});

	QUnit.test("null popoverRef with strict Begin (Never) still returns Left", (assert) => {
		assert.strictEqual(Positioning.resolvePlacement({
			placement: PopoverPlacement.Begin,
			flipMode: FlipMode.Never,
			openerRef: makeOpener(0, 200, 10, 10),
			popoverRef: null,
			withinAreaRef: makeWithinArea(400, 400),
			margin: NO_MARGINS,
			arrowSize: 0
		}), "Left", "strict side resolves without measuring the popover");
	});

	QUnit.test("null popoverRef matches an explicit zero-size popover", (assert) => {
		const makeOpts = (popoverRef) => ({
			placement: PopoverPlacement.Bottom,
			flipMode: FlipMode.MoreSpace,
			openerRef: makeOpener(50, 0, 50, 50),
			popoverRef,
			withinAreaRef: makeWithinArea(500, 500),
			margin: NO_MARGINS,
			arrowSize: 0
		});
		const sWithNull = Positioning.resolvePlacement(makeOpts(null));
		const sWithZero = Positioning.resolvePlacement(makeOpts(makePopover(0, 0)));
		assert.strictEqual(sWithNull, sWithZero, "absent popoverRef is equivalent to a 0×0 popover");
	});

	QUnit.test("a missing popoverRef logs a warning", (assert) => {
		const oWarningSpy = sinon.spy(Log, "warning");

		Positioning.resolvePlacement({
			placement: PopoverPlacement.Top,
			auto: true,
			openerRef: makeOpener(50, 0, 50, 50),
			popoverRef: null,
			withinAreaRef: makeWithinArea(500, 500),
			margin: NO_MARGINS,
			arrowSize: 0
		});

		assert.ok(oWarningSpy.calledWithMatch(/popoverRef is missing/), "Log.warning was called for the missing popoverRef");
		oWarningSpy.restore();
	});

	// ---------------------------------------------------------------------
	QUnit.module("resolvePlacement — Auto");

	QUnit.test("Auto in landscape picks the roomier horizontal side (right)", (assert) => {
		const s = Positioning.resolvePlacement({
			auto: true,
			openerRef: makeOpener(200, 20, 20, 20),
			popoverRef: makePopover(50, 50),
			withinAreaRef: makeWithinArea(800, 400),
			margin: NO_MARGINS,
			arrowSize: 0
		});
		assert.strictEqual(s, "Right", "landscape → horizontal → Right (right roomier)");
	});

	QUnit.test("Auto in landscape picks the roomier horizontal side (left)", (assert) => {
		const s = Positioning.resolvePlacement({
			auto: true,
			openerRef: makeOpener(200, 700, 20, 20),
			popoverRef: makePopover(50, 50),
			withinAreaRef: makeWithinArea(800, 400),
			margin: NO_MARGINS,
			arrowSize: 0
		});
		assert.strictEqual(s, "Left", "landscape → horizontal → Left (left roomier)");
	});

	QUnit.test("Auto horizontal tie resolves to the End side (Right in LTR)", (assert) => {
		const s = Positioning.resolvePlacement({
			auto: true,
			openerRef: makeOpener(200, 390, 20, 20),
			popoverRef: makePopover(50, 50),
			withinAreaRef: makeWithinArea(800, 400),
			margin: NO_MARGINS,
			arrowSize: 0
		});
		assert.strictEqual(s, "Right", "tie → Right (matches legacy sap.m.Popover)");
	});

	QUnit.test("Auto in portrait picks the roomier vertical side (bottom)", (assert) => {
		const s = Positioning.resolvePlacement({
			auto: true,
			openerRef: makeOpener(20, 200, 20, 20),
			popoverRef: makePopover(50, 50),
			withinAreaRef: makeWithinArea(400, 800),
			margin: NO_MARGINS,
			arrowSize: 0
		});
		assert.strictEqual(s, "Bottom", "portrait → vertical → Bottom (bottom roomier)");
	});

	QUnit.test("Auto in portrait picks the roomier vertical side (top)", (assert) => {
		const s = Positioning.resolvePlacement({
			auto: true,
			openerRef: makeOpener(700, 20, 20, 20),
			popoverRef: makePopover(50, 50),
			withinAreaRef: makeWithinArea(400, 800),
			margin: NO_MARGINS,
			arrowSize: 0
		});
		assert.strictEqual(s, "Top", "portrait → vertical → Top (top roomier)");
	});

	QUnit.test("Auto vertical tie resolves to Bottom", (assert) => {
		const s = Positioning.resolvePlacement({
			auto: true,
			openerRef: makeOpener(390, 200, 20, 20),
			popoverRef: makePopover(50, 50),
			withinAreaRef: makeWithinArea(400, 800),
			margin: NO_MARGINS,
			arrowSize: 0
		});
		assert.strictEqual(s, "Bottom", "tie → Bottom (matches legacy sap.m.Popover)");
	});

	QUnit.test("Auto falls back to best-position scoring when nothing fits", (assert) => {
		const s = Positioning.resolvePlacement({
			auto: true,
			openerRef: makeOpener(20, 20, 20, 20),
			popoverRef: makePopover(360, 360),
			withinAreaRef: makeWithinArea(400, 400),
			margin: NO_MARGINS,
			arrowSize: 0
		});
		assert.strictEqual(s, "Bottom", "best-position scoring → Bottom (most coverage below opener)");
	});

	QUnit.test("Auto best-position in RTL mirrors the LTR physical side", (assert) => {
		// Landscape, opener near the physical-right edge, popover too big to fit any
		// side → best-position scoring. calcBestPos keeps the RTL-swapped coverage
		// (fStartCoverage = fRightCoverage in RTL) while returning physical labels,
		// so the RTL result is the mirror of the LTR result.
		const oArgs = () => ({
			auto: true,
			openerRef: makeOpener(180, 740, 20, 20),
			popoverRef: makePopover(700, 260),
			withinAreaRef: makeWithinArea(800, 400),
			margin: NO_MARGINS,
			arrowSize: 0
		});

		assert.strictEqual(Positioning.resolvePlacement(oArgs()), "Left", "LTR: most room on the left → Left");

		const oStub = sinon.stub(Localization, "getRTL").returns(true);
		assert.strictEqual(Positioning.resolvePlacement(oArgs()), "Right", "RTL: best-position mirrors the LTR side → Right");
		oStub.restore();
	});

	QUnit.test("Auto ignores flipMode Never (resolves by space)", (assert) => {
		const s = Positioning.resolvePlacement({
			auto: true,
			flipMode: FlipMode.Never,
			openerRef: makeOpener(200, 20, 20, 20),
			popoverRef: makePopover(50, 50),
			withinAreaRef: makeWithinArea(800, 400),
			margin: NO_MARGINS,
			arrowSize: 0
		});
		assert.strictEqual(s, "Right", "auto + Never still resolves by space");
	});

	QUnit.test("unknown placement value defaults to Bottom", (assert) => {
		assert.strictEqual(Positioning.resolvePlacement({
			placement: "NotARealPlacement",
			flipMode: FlipMode.MoreSpace,
			openerRef: makeOpener(0, 0, 10, 10),
			popoverRef: makePopover(10, 10),
			withinAreaRef: makeWithinArea(100, 100),
			margin: NO_MARGINS,
			arrowSize: 0
		}), "Bottom", "unknown → Bottom");
	});

	// ---------------------------------------------------------------------
	QUnit.module("computeArrowOffset");

	QUnit.test("centers the arrow under the opener on the Top/Bottom axis", (assert) => {
		// opener centered at x=100 (left 90, width 20 → center 100)
		// popover left 40, width 120 → popover center 100
		// arrow width 12 → along = (90-40) + 0.5*(20-12) = 50 + 4 = 54
		const o = Positioning.computeArrowOffset({
			side: "Bottom",
			openerRect: rect(0, 90, 20, 20),
			popoverRect: rect(30, 40, 120, 40),
			arrowSize: 10,
			arrowWidth: 12,
			arrowHeight: 12
		});
		assert.strictEqual(o.along, 54, "arrow along-offset points at opener center");
		assert.strictEqual(o.cross, 0, "cross offset is 0 for the standard case");
	});

	QUnit.test("clamps the arrow to the near corner (min = arrowSize)", (assert) => {
		// opener far to the left of the popover → raw along would be negative → clamp to arrowSize
		const o = Positioning.computeArrowOffset({
			side: "Bottom",
			openerRect: rect(0, 0, 20, 20),
			popoverRect: rect(30, 200, 120, 40),
			arrowSize: 10,
			arrowWidth: 12,
			arrowHeight: 12
		});
		assert.strictEqual(o.along, 10, "clamped to arrowSize on the near corner");
	});

	QUnit.test("clamps the arrow to the far corner (max)", (assert) => {
		// opener far to the right of the popover → raw along would exceed width → clamp
		// max = popover.width(120) - arrowSize(10) - arrowWidth(12) = 98
		const o = Positioning.computeArrowOffset({
			side: "Top",
			openerRect: rect(0, 400, 20, 20),
			popoverRect: rect(30, 40, 120, 40),
			arrowSize: 10,
			arrowWidth: 12,
			arrowHeight: 12
		});
		assert.strictEqual(o.along, 98, "clamped to far corner");
	});

	QUnit.test("measures along the vertical edge for Left/Right", (assert) => {
		// opener centered at y=100 (top 90, height 20)
		// popover top 40, height 120 → along = (90-40) + 0.5*(20-12) = 54
		const o = Positioning.computeArrowOffset({
			side: "Left",
			openerRect: rect(90, 0, 20, 20),
			popoverRect: rect(40, 30, 40, 120),
			arrowSize: 10,
			arrowWidth: 12,
			arrowHeight: 12
		});
		assert.strictEqual(o.along, 54, "vertical-edge arrow offset");
	});

	QUnit.test("arrowWidth/arrowHeight default to arrowSize when omitted", (assert) => {
		const o = Positioning.computeArrowOffset({
			side: "Bottom",
			openerRect: rect(0, 90, 20, 20),
			popoverRect: rect(30, 40, 120, 40),
			arrowSize: 12
		});
		// along = (90-40) + 0.5*(20-12) = 54, same as the explicit-width case
		assert.strictEqual(o.along, 54, "arrowSize used as the arrow width fallback");
	});

	QUnit.test("centers the arrow when the popover is too small to clamp (band inverts)", (assert) => {
		// A tiny tooltip: height 28, arrow 12, corner inset via arrowSize 10.
		// Clamp band = [10, 28-10-12=6] → inverts → arrow is centered:
		// (28 - 12) / 2 = 8, regardless of where the opener sits.
		const o = Positioning.computeArrowOffset({
			side: "Left",
			openerRect: rect(0, 0, 20, 20),   // opener top far above the popover
			popoverRect: rect(200, 100, 60, 28),
			arrowSize: 10,
			arrowWidth: 12,
			arrowHeight: 12
		});
		assert.strictEqual(o.along, 8, "short popover centers the arrow instead of corner-pinning");
	});

	QUnit.test("cornerInset overrides arrowSize for the clamp band", (assert) => {
		// Same tiny tooltip, but a small cornerInset (4) keeps the band valid:
		// band = [4, 28-4-12=12]. Opener centered at popover center → raw along
		// = (200-200) + 0.5*(28-12) = 8, which is inside [4,12] → stays 8.
		const o = Positioning.computeArrowOffset({
			side: "Left",
			openerRect: rect(200, 0, 20, 28),
			popoverRect: rect(200, 100, 60, 28),
			arrowSize: 10,
			arrowWidth: 12,
			arrowHeight: 12,
			cornerInset: 4
		});
		assert.strictEqual(o.along, 8, "small cornerInset keeps the clamp band valid and honours the centered offset");
	});

	QUnit.test("borderNear is subtracted from the along-offset", (assert) => {
		// Same geometry as the Top/Bottom centering case (raw along = 54), but a
		// 1px near-edge border shifts the arrow to 53.
		const o = Positioning.computeArrowOffset({
			side: "Bottom",
			openerRect: rect(0, 90, 20, 20),
			popoverRect: rect(30, 40, 120, 40),
			arrowSize: 10,
			arrowWidth: 12,
			arrowHeight: 12,
			borderNear: 1
		});
		assert.strictEqual(o.along, 53, "near-edge border subtracted");
		assert.strictEqual(o.rtlRight, false, "LTR → not right-anchored");
	});

	QUnit.test("RTL anchors the Top/Bottom arrow to the popover right edge", (assert) => {
		const oStub = sinon.stub(Localization, "getRTL").returns(true);
		// opener left 90, width 20 (right edge 110); popover left 30, width 120
		// (right edge 150). RTL along = (150) - (110) + 0.5*(20-12) = 40 + 4 = 44,
		// measured from the popover's right edge.
		const o = Positioning.computeArrowOffset({
			side: "Bottom",
			openerRect: rect(0, 90, 20, 20),
			popoverRect: rect(30, 30, 120, 40),
			arrowSize: 10,
			arrowWidth: 12,
			arrowHeight: 12
		});
		assert.strictEqual(o.along, 44, "RTL along measured from the right edge");
		assert.strictEqual(o.rtlRight, true, "flagged as right-anchored");
		oStub.restore();
	});

	QUnit.test("rtl does not affect the Left/Right axis", (assert) => {
		const oStub = sinon.stub(Localization, "getRTL").returns(true);
		const o = Positioning.computeArrowOffset({
			side: "Left",
			openerRect: rect(90, 0, 20, 20),
			popoverRect: rect(40, 30, 40, 120),
			arrowSize: 10,
			arrowWidth: 12,
			arrowHeight: 12
		});
		assert.strictEqual(o.along, 54, "Left/Right unaffected by rtl");
		assert.strictEqual(o.rtlRight, false, "vertical edge is never right-anchored");
		oStub.restore();
	});

	// ---------------------------------------------------------------------
	QUnit.module("computeAnchor");

	QUnit.test("mirror:true (default) emits logical tokens Popup flips in RTL", (assert) => {
		assert.deepEqual(Positioning.computeAnchor({ side: "Top", arrowSize: 10 }),
			{ my: "center bottom", at: "center top", offset: "0 -10" }, "Top");
		assert.deepEqual(Positioning.computeAnchor({ side: "Bottom", arrowSize: 10 }),
			{ my: "center top", at: "center bottom", offset: "0 10" }, "Bottom");
		assert.deepEqual(Positioning.computeAnchor({ side: "Left", arrowSize: 10 }),
			{ my: "end center", at: "begin center", offset: "-10 0" }, "Left");
		assert.deepEqual(Positioning.computeAnchor({ side: "Right", arrowSize: 10 }),
			{ my: "begin center", at: "end center", offset: "10 0" }, "Right");
	});

	QUnit.test("mirror:false emits physical tokens for a pre-resolved side", (assert) => {
		assert.deepEqual(Positioning.computeAnchor({ side: "Top", arrowSize: 10, mirror: false }),
			{ my: "center bottom", at: "center top", offset: "0 -10" }, "Top unchanged");
		assert.deepEqual(Positioning.computeAnchor({ side: "Bottom", arrowSize: 10, mirror: false }),
			{ my: "center top", at: "center bottom", offset: "0 10" }, "Bottom unchanged");
		assert.deepEqual(Positioning.computeAnchor({ side: "Left", arrowSize: 10, mirror: false }),
			{ my: "right center", at: "left center", offset: "-10 0" }, "Left physical");
		assert.deepEqual(Positioning.computeAnchor({ side: "Right", arrowSize: 10, mirror: false }),
			{ my: "left center", at: "right center", offset: "10 0" }, "Right physical");
	});

	QUnit.test("showArrow:false, mirror:true (default) uses the start-aligned, zero-gap spec", (assert) => {
		assert.deepEqual(Positioning.computeAnchor({ side: "Top", arrowSize: 10, showArrow: false }),
			{ my: "begin bottom", at: "begin top", offset: "0 0" }, "Top no-arrow");
		assert.deepEqual(Positioning.computeAnchor({ side: "Bottom", arrowSize: 10, showArrow: false }),
			{ my: "begin top", at: "begin bottom", offset: "0 0" }, "Bottom no-arrow");
		assert.deepEqual(Positioning.computeAnchor({ side: "Left", arrowSize: 10, showArrow: false }),
			{ my: "end center", at: "begin center", offset: "0 0" }, "Left no-arrow");
		assert.deepEqual(Positioning.computeAnchor({ side: "Right", arrowSize: 10, showArrow: false }),
			{ my: "begin center", at: "end center", offset: "0 0" }, "Right no-arrow");
	});

	QUnit.test("showArrow:false, mirror:false uses physical zero-gap spec", (assert) => {
		assert.deepEqual(Positioning.computeAnchor({ side: "Left", arrowSize: 10, showArrow: false, mirror: false }),
			{ my: "right center", at: "left center", offset: "0 0" }, "Left no-arrow physical");
		assert.deepEqual(Positioning.computeAnchor({ side: "Right", arrowSize: 10, showArrow: false, mirror: false }),
			{ my: "left center", at: "right center", offset: "0 0" }, "Right no-arrow physical");
	});

	// ---------------------------------------------------------------------
	QUnit.module("computePopoverPositionCss", {
		beforeEach: () => stubViewport(1000, 1000),
		afterEach: restoreViewport
	});

	// The viewport is stubbed to 1000x1000 unscrolled in beforeEach so the math is
	// deterministic regardless of the test runner's viewport size. popoverRef is a
	// fake element whose getBoundingClientRect returns the given rect.
	function fakeEl(oRect) {
		const r = Object.assign({ left: 400, top: 400, width: 200, height: 200 }, oRect);
		return { getBoundingClientRect: () => r };
	}

	function posOpts(oRect, oOverrides) {
		return Object.assign({
			popoverRef: fakeEl(oRect),
			margin: { top: 10, right: 10, bottom: 10, left: 10 },
			hasVerticalScrollbar: false
		}, oOverrides);
	}

	QUnit.test("no side set when the popover is fully inside", (assert) => {
		const o = Positioning.computePopoverPositionCss(posOpts());
		assert.strictEqual(o.top, undefined, "top not set");
		assert.strictEqual(o.left, undefined, "left not set");
	});

	QUnit.test("clamps to the left margin when overflowing left", (assert) => {
		const o = Positioning.computePopoverPositionCss(posOpts({ left: -20 }));
		assert.strictEqual(o.left, 10, "left pinned to marginLeft");
	});

	QUnit.test("clamps to the right margin and clears left when overflowing right", (assert) => {
		// left 900, width 200 → right border pos = 1000-900-200 = -100 < marginRight
		const o = Positioning.computePopoverPositionCss(posOpts({ left: 900 }));
		assert.strictEqual(o.right, 10, "right pinned to marginRight");
		assert.strictEqual(o.left, "", "left cleared so only one side is set");
	});

	QUnit.test("clamps to the bottom margin and clears top when overflowing bottom", (assert) => {
		// top 900, height 200 → bottom pos = 1000-900-200 = -100 < marginBottom
		const o = Positioning.computePopoverPositionCss(posOpts({ top: 900 }));
		assert.strictEqual(o.bottom, 10, "bottom pinned to marginBottom");
		assert.strictEqual(o.top, "", "top cleared so only one side is set");
	});

	QUnit.test("RTL clears the right side when overflowing left", (assert) => {
		const oStub = sinon.stub(Localization, "getRTL").returns(true);
		const o = Positioning.computePopoverPositionCss(posOpts({ left: -20 }));
		assert.strictEqual(o.left, 10, "left pinned to marginLeft");
		assert.strictEqual(o.right, "", "right cleared in RTL");
		oStub.restore();
	});

	QUnit.test("both sides pinned when the popover exceeds the available width", (assert) => {
		// doc - margins = 980 < popoverWidth 990 → exceed
		const o = Positioning.computePopoverPositionCss(posOpts({ width: 990 }));
		assert.strictEqual(o.left, 10, "left pinned");
		assert.strictEqual(o.right, 10, "right pinned");
	});

	QUnit.test("hasVerticalScrollbar reserves the scrollbar width on the right", (assert) => {
		const iBar = getScrollbarSize().width;
		// Place the popover so its right gap fits without a scrollbar but overflows
		// once the scrollbar width is counted. gap = marginRight + bar - 1 (>= marginRight).
		const iTargetGap = 10 + Math.max(iBar, 1) - 1;
		const iLeft = 1000 - 200 - iTargetGap;

		const oNoBar = Positioning.computePopoverPositionCss(posOpts({ left: iLeft }));
		assert.strictEqual(oNoBar.right, undefined, "no right clamp without a scrollbar");

		const oBar = Positioning.computePopoverPositionCss(posOpts({ left: iLeft }, { hasVerticalScrollbar: true }));
		if (iBar > 0) {
			assert.strictEqual(oBar.right, 10, "right clamped once the scrollbar width is counted");
		} else {
			// Overlay scrollbars (width 0): the flag makes no difference.
			assert.strictEqual(oBar.right, undefined, "zero-width scrollbar reserves nothing");
		}
	});

	// ---------------------------------------------------------------------
	QUnit.module("getEffectiveMargins (no opener = pure within-area inflation)");

	QUnit.test("window within-area reduces to base margin (plus scroll/shadow)", (assert) => {
		const o = Positioning.getEffectiveMargins({
			withinAreaRef: window,
			margin: { top: 10, right: 10, bottom: 10, left: 10 },
			shadowSize: 0
		});
		assert.deepEqual(o, { top: 10, left: 10, right: 10, bottom: 10 }, "window case = base margin");
	});

	QUnit.test("shadow is added to every side", (assert) => {
		const o = Positioning.getEffectiveMargins({
			withinAreaRef: window,
			margin: { top: 10, right: 10, bottom: 10, left: 10 },
			shadowSize: 5
		});
		assert.deepEqual(o, { top: 15, left: 15, right: 15, bottom: 15 }, "each side + shadow");
	});

	QUnit.test("a within-area rect inflates margins by its inset from the window edges", (assert) => {
		const iInnerW = window.innerWidth;
		const iInnerH = window.innerHeight;
		// Fake within-area: 100px inset from every window edge.
		const oWithin = {
			getBoundingClientRect: () => ({ left: 100, top: 100, width: iInnerW - 200, height: iInnerH - 200 }),
			offsetWidth: iInnerW - 200,
			offsetHeight: iInnerH - 200
		};
		const o = Positioning.getEffectiveMargins({
			withinAreaRef: oWithin,
			margin: { top: 10, right: 10, bottom: 10, left: 10 },
			shadowSize: 0
		});
		// base 10 + 100px inset on each side.
		assert.strictEqual(o.top, 110, "top = margin + inset");
		assert.strictEqual(o.left, 110, "left = margin + inset");
		assert.strictEqual(o.right, 110, "right = margin + (innerWidth - within.right)");
		assert.strictEqual(o.bottom, 110, "bottom = margin + (innerHeight - within.bottom)");
	});

	QUnit.test("physical-Right reserves the opener-facing margin, mirrored by RTL", (assert) => {
		const oOpener = makeOpener(0, 200, 50, 50);
		const oArgs = {
			side: "Right",
			openerRef: oOpener,
			withinAreaRef: window,
			margin: { top: 10, right: 10, bottom: 10, left: 10 },
			arrowSize: 8,
			shadowSize: 0
		};

		const oLtr = Positioning.getEffectiveMargins(oArgs);
		assert.strictEqual(oLtr.left, 200 + 50 + 8, "LTR reserves left = opener right edge + arrow");
		assert.strictEqual(oLtr.right, 10, "LTR leaves the right margin at base");

		const oStub = sinon.stub(Localization, "getRTL").returns(true);
		const oRtl = Positioning.getEffectiveMargins(oArgs);
		oStub.restore();

		assert.strictEqual(oRtl.right, window.innerWidth - 50 - 200 + 8, "RTL reserves right = innerWidth - opener width - opener left + arrow");
		assert.strictEqual(oRtl.left, 10, "RTL leaves the left margin at base");
	});

	QUnit.test("physical-Left reserves the opener-facing margin, mirrored by RTL", (assert) => {
		const oOpener = makeOpener(0, 200, 50, 50);
		const oArgs = {
			side: "Left",
			openerRef: oOpener,
			withinAreaRef: window,
			margin: { top: 10, right: 10, bottom: 10, left: 10 },
			arrowSize: 8,
			shadowSize: 0
		};

		const oLtr = Positioning.getEffectiveMargins(oArgs);
		assert.strictEqual(oLtr.right, window.innerWidth - 200 + 8, "LTR reserves right = innerWidth - opener left + arrow");
		assert.strictEqual(oLtr.left, 10, "LTR leaves the left margin at base");

		const oStub = sinon.stub(Localization, "getRTL").returns(true);
		const oRtl = Positioning.getEffectiveMargins(oArgs);
		oStub.restore();

		assert.strictEqual(oRtl.left, 200 + 50 + 8, "RTL reserves left = opener right edge + arrow");
		assert.strictEqual(oRtl.right, 10, "RTL leaves the right margin at base");
	});

	QUnit.module("computeMaxContentSize", { afterEach: restoreViewport });

	QUnit.test("subtracts opposing margins from the reference dimension", (assert) => {
		stubViewport(1000, 800);
		const o = Positioning.computeMaxContentSize({
			margin: { top: 10, right: 20, bottom: 30, left: 40 }
		});
		assert.strictEqual(o.maxWidth, 1000 - 40 - 20, "maxWidth = width - left - right");
		assert.strictEqual(o.maxHeight, 800 - 10 - 30, "maxHeight = height - top - bottom");
	});

	QUnit.test("subtracts reserved (border / header / footer / padding)", (assert) => {
		stubViewport(1000, 800);
		const o = Positioning.computeMaxContentSize({
			margin: { top: 10, right: 10, bottom: 10, left: 10 },
			reservedWidth: 4,
			reservedHeight: 60
		});
		assert.strictEqual(o.maxWidth, 1000 - 20 - 4, "maxWidth = width - margins - reservedWidth");
		assert.strictEqual(o.maxHeight, 800 - 20 - 60, "maxHeight = height - margins - reservedHeight");
	});

	QUnit.test("clamps maxHeight to a minimum of 0 but leaves maxWidth unclamped", (assert) => {
		stubViewport(50, 50);
		const o = Positioning.computeMaxContentSize({
			margin: { top: 100, right: 100, bottom: 100, left: 100 }
		});
		// maxWidth stays negative on purpose: an invalid max-width is ignored by the
		// browser, so wide content wraps instead of collapsing to 0.
		assert.strictEqual(o.maxWidth, -150, "maxWidth left unclamped (may be negative)");
		assert.strictEqual(o.maxHeight, 0, "maxHeight never negative");
	});

	QUnit.test("reserved defaults to 0 when omitted", (assert) => {
		stubViewport(500, 400);
		const o = Positioning.computeMaxContentSize({
			margin: { top: 0, right: 0, bottom: 0, left: 0 }
		});
		assert.strictEqual(o.maxWidth, 500, "no reservedWidth = full width");
		assert.strictEqual(o.maxHeight, 400, "no reservedHeight = full height");
	});

	// ---------------------------------------------------------------------
	QUnit.module("getWithinAreaBounds", { afterEach: restoreViewport });

	QUnit.test("returns the document viewport when there is no within-area", (assert) => {
		stubViewport(1000, 800);
		const o = Positioning.getWithinAreaBounds();
		assert.deepEqual(o, { left: 0, top: 0, right: 1000, bottom: 800 }, "falls back to the viewport");
	});

	QUnit.test("returns the document viewport for the window", (assert) => {
		stubViewport(640, 480);
		const o = Positioning.getWithinAreaBounds(window);
		assert.deepEqual(o, { left: 0, top: 0, right: 640, bottom: 480 }, "window = viewport");
	});

	QUnit.test("returns the within-area's rect when one is given", (assert) => {
		const oWithin = makeWithinArea(300, 200);
		const o = Positioning.getWithinAreaBounds(oWithin);
		// makeWithinArea pins the element at top-left (0,0).
		assert.strictEqual(o.left, 0, "left from the within-area rect");
		assert.strictEqual(o.top, 0, "top from the within-area rect");
		assert.strictEqual(o.right, 300, "right from the within-area rect");
		assert.strictEqual(o.bottom, 200, "bottom from the within-area rect");
	});

	// ---------------------------------------------------------------------
	QUnit.module("isCrossAxisOpenerBound");

	QUnit.test("vertical sides are driven by horizontalAlign", (assert) => {
		["Top", "Bottom"].forEach((sSide) => {
			assert.notOk(
				Positioning.isCrossAxisOpenerBound({ side: sSide, horizontalAlign: PopoverHorizontalAlign.Center }),
				sSide + " + Center is not opener-bound"
			);
			[PopoverHorizontalAlign.Begin, PopoverHorizontalAlign.End, PopoverHorizontalAlign.Stretch].forEach((sAlign) => {
				assert.ok(
					Positioning.isCrossAxisOpenerBound({ side: sSide, horizontalAlign: sAlign }),
					sSide + " + " + sAlign + " is opener-bound"
				);
			});
		});
	});

	QUnit.test("horizontal sides are driven by verticalAlign", (assert) => {
		["Left", "Right"].forEach((sSide) => {
			assert.notOk(
				Positioning.isCrossAxisOpenerBound({ side: sSide, verticalAlign: PopoverVerticalAlign.Center }),
				sSide + " + Center is not opener-bound"
			);
			[PopoverVerticalAlign.Top, PopoverVerticalAlign.Bottom, PopoverVerticalAlign.Stretch].forEach((sAlign) => {
				assert.ok(
					Positioning.isCrossAxisOpenerBound({ side: sSide, verticalAlign: sAlign }),
					sSide + " + " + sAlign + " is opener-bound"
				);
			});
		});
	});

	// ---------------------------------------------------------------------
	QUnit.module("computeAlignedMaxSize", { afterEach: restoreViewport });

	QUnit.test("returns empty without an opener", (assert) => {
		assert.deepEqual(Positioning.computeAlignedMaxSize({ side: "Bottom" }), {}, "no opener = no limit");
	});

	QUnit.test("Center alignments impose no limit", (assert) => {
		stubViewport(1000, 800);
		const oOpener = makeOpener(100, 300, 180, 60);
		assert.deepEqual(
			Positioning.computeAlignedMaxSize({ side: "Bottom", openerRef: oOpener, horizontalAlign: PopoverHorizontalAlign.Center }),
			{},
			"Top/Bottom + Center = no width limit"
		);
		assert.deepEqual(
			Positioning.computeAlignedMaxSize({ side: "Left", openerRef: oOpener, verticalAlign: PopoverVerticalAlign.Center }),
			{},
			"Left/Right + Center = no height limit"
		);
	});

	QUnit.test("Begin leaves only the room towards the end of the within-area", (assert) => {
		stubViewport(1000, 800);
		const oOpener = makeOpener(100, 300, 180, 60);
		const o = Positioning.computeAlignedMaxSize({
			side: "Bottom",
			openerRef: oOpener,
			horizontalAlign: PopoverHorizontalAlign.Begin,
			edgeMargin: 10
		});
		assert.strictEqual(o.maxWidth, 1000 - 300 - 10, "measured from the opener's left edge to the right bound");
		assert.strictEqual(o.maxHeight, undefined, "no height limit on a vertical side");
	});

	QUnit.test("End leaves only the room towards the start of the within-area", (assert) => {
		stubViewport(1000, 800);
		const oOpener = makeOpener(100, 300, 180, 60);
		const o = Positioning.computeAlignedMaxSize({
			side: "Top",
			openerRef: oOpener,
			horizontalAlign: PopoverHorizontalAlign.End,
			edgeMargin: 10
		});
		// opener right edge = 300 + 180 = 480, left bound = 0.
		assert.strictEqual(o.maxWidth, 480 - 0 - 10, "measured from the opener's right edge to the left bound");
	});

	QUnit.test("Begin/End are mirrored in RTL", (assert) => {
		stubViewport(1000, 800);
		const oOpener = makeOpener(100, 300, 180, 60);
		const oStub = sinon.stub(Localization, "getRTL").returns(true);
		const oBegin = Positioning.computeAlignedMaxSize({
			side: "Bottom", openerRef: oOpener, horizontalAlign: PopoverHorizontalAlign.Begin, edgeMargin: 10
		});
		oStub.restore();
		// In RTL, Begin pins the opener's right edge and keeps the room towards the left.
		assert.strictEqual(oBegin.maxWidth, 480 - 0 - 10, "RTL Begin measured from the opener's right edge");
	});

	QUnit.test("Stretch reports the opener's own width", (assert) => {
		stubViewport(1000, 800);
		const oOpener = makeOpener(100, 300, 180, 60);
		const o = Positioning.computeAlignedMaxSize({
			side: "Bottom", openerRef: oOpener, horizontalAlign: PopoverHorizontalAlign.Stretch, edgeMargin: 10
		});
		assert.strictEqual(o.maxWidth, 180, "maxWidth = opener width (edgeMargin ignored)");
	});

	QUnit.test("vertical Top/Bottom cap the height towards the opposite bound", (assert) => {
		stubViewport(1000, 800);
		const oOpener = makeOpener(100, 300, 180, 60);
		const oTop = Positioning.computeAlignedMaxSize({
			side: "Left", openerRef: oOpener, verticalAlign: PopoverVerticalAlign.Top, edgeMargin: 10
		});
		assert.strictEqual(oTop.maxHeight, 800 - 100 - 10, "Top: opener top edge to the bottom bound");

		const oBottom = Positioning.computeAlignedMaxSize({
			side: "Left", openerRef: oOpener, verticalAlign: PopoverVerticalAlign.Bottom, edgeMargin: 10
		});
		// opener bottom edge = 100 + 60 = 160, top bound = 0.
		assert.strictEqual(oBottom.maxHeight, 160 - 0 - 10, "Bottom: opener bottom edge to the top bound");

		const oStretch = Positioning.computeAlignedMaxSize({
			side: "Left", openerRef: oOpener, verticalAlign: PopoverVerticalAlign.Stretch, edgeMargin: 10
		});
		assert.strictEqual(oStretch.maxHeight, 60, "Stretch: opener height");
	});

	// ---------------------------------------------------------------------
	QUnit.module("computeFittedMaxSize", { afterEach: restoreViewport });

	QUnit.test("without an alignment cap it equals the within-area cap and reports no aligned values", (assert) => {
		stubViewport(1000, 800);
		const oOpener = makeOpener(100, 300, 180, 60);
		const oArgs = {
			margin: { top: 10, right: 10, bottom: 10, left: 10 },
			side: "Bottom",
			openerRef: oOpener,
			horizontalAlign: PopoverHorizontalAlign.Center
		};
		const oBox = Positioning.computeMaxContentSize(oArgs);
		const o = Positioning.computeFittedMaxSize(oArgs);
		assert.strictEqual(o.maxWidth, oBox.maxWidth, "maxWidth = within-area width cap");
		assert.strictEqual(o.maxHeight, oBox.maxHeight, "maxHeight = within-area height cap");
		assert.strictEqual(o.alignedWidth, undefined, "no aligned width cap");
		assert.strictEqual(o.alignedHeight, undefined, "no aligned height cap");
	});

	QUnit.test("folds the aligned cap in with Math.min and reports the raw aligned width", (assert) => {
		stubViewport(1000, 800);
		// opener left 300 → Begin aligned cap = 1000 - 300 - 10 = 690, tighter than the
		// within-area width cap.
		const oOpener = makeOpener(100, 300, 180, 60);
		const oArgs = {
			margin: { top: 10, right: 10, bottom: 10, left: 10 },
			side: "Bottom",
			openerRef: oOpener,
			horizontalAlign: PopoverHorizontalAlign.Begin,
			edgeMargin: 10
		};
		const oBox = Positioning.computeMaxContentSize(oArgs);
		const o = Positioning.computeFittedMaxSize(oArgs);
		assert.strictEqual(o.alignedWidth, 1000 - 300 - 10, "raw aligned width reported");
		assert.strictEqual(o.maxWidth, Math.min(oBox.maxWidth, 690), "maxWidth folds to the tighter aligned cap");
		assert.strictEqual(o.maxHeight, oBox.maxHeight, "height still the within-area cap on a vertical side");
	});

	// ---------------------------------------------------------------------
	QUnit.module("computeCrossAxisEdges");

	QUnit.test("vertical sides span the left/right edges", (assert) => {
		assert.deepEqual(Positioning.computeCrossAxisEdges("Top"), ["left", "right"], "Top");
		assert.deepEqual(Positioning.computeCrossAxisEdges("Bottom"), ["left", "right"], "Bottom");
	});

	QUnit.test("horizontal sides span the top/bottom edges", (assert) => {
		assert.deepEqual(Positioning.computeCrossAxisEdges("Left"), ["top", "bottom"], "Left");
		assert.deepEqual(Positioning.computeCrossAxisEdges("Right"), ["top", "bottom"], "Right");
	});

	// ---------------------------------------------------------------------
	QUnit.module("computeCrossAxisDockDelta");

	QUnit.test("returns null when the cross axis is not opener-bound", (assert) => {
		const oOpener = makeOpener(100, 300, 180, 60);
		const oPopover = makePopover(120, 40);
		assert.strictEqual(
			Positioning.computeCrossAxisDockDelta({
				side: "Bottom", openerRef: oOpener, popoverRef: oPopover, horizontalAlign: PopoverHorizontalAlign.Center
			}),
			null,
			"Center = no dock correction"
		);
	});

	QUnit.test("returns null without opener/popover refs", (assert) => {
		assert.strictEqual(
			Positioning.computeCrossAxisDockDelta({ side: "Bottom", horizontalAlign: PopoverHorizontalAlign.Begin }),
			null,
			"missing refs = null"
		);
	});

	QUnit.test("vertical side Begin docks the left edges", (assert) => {
		// opener left = 300, popover left = 320 → shift left by -20 to align.
		const oOpener = makeOpener(100, 300, 180, 60);
		const oPopover = makeOpener(200, 320, 120, 40);
		const o = Positioning.computeCrossAxisDockDelta({
			side: "Bottom", openerRef: oOpener, popoverRef: oPopover, horizontalAlign: PopoverHorizontalAlign.Begin
		});
		assert.strictEqual(o.near, "left", "near edge = left");
		assert.strictEqual(o.far, "right", "far edge = right");
		assert.strictEqual(o.delta, 300 - 320, "delta = opener.left - popover.left");
	});

	QUnit.test("vertical side End docks the right edges", (assert) => {
		// opener right = 480, popover right = 440 → shift right by +40.
		const oOpener = makeOpener(100, 300, 180, 60);
		const oPopover = makeOpener(200, 320, 120, 40);
		const o = Positioning.computeCrossAxisDockDelta({
			side: "Bottom", openerRef: oOpener, popoverRef: oPopover, horizontalAlign: PopoverHorizontalAlign.End
		});
		assert.strictEqual(o.delta, (300 + 180) - (320 + 120), "delta = opener.right - popover.right");
	});

	QUnit.test("vertical side is mirrored in RTL (Begin pins the right edge)", (assert) => {
		const oOpener = makeOpener(100, 300, 180, 60);
		const oPopover = makeOpener(200, 320, 120, 40);
		const oStub = sinon.stub(Localization, "getRTL").returns(true);
		const o = Positioning.computeCrossAxisDockDelta({
			side: "Bottom", openerRef: oOpener, popoverRef: oPopover, horizontalAlign: PopoverHorizontalAlign.Begin
		});
		oStub.restore();
		assert.strictEqual(o.delta, (300 + 180) - (320 + 120), "RTL Begin = opener.right - popover.right");
	});

	QUnit.test("horizontal side Top docks the top edges", (assert) => {
		const oOpener = makeOpener(100, 300, 180, 60);
		const oPopover = makeOpener(120, 500, 120, 40);
		const o = Positioning.computeCrossAxisDockDelta({
			side: "Right", openerRef: oOpener, popoverRef: oPopover, verticalAlign: PopoverVerticalAlign.Top
		});
		assert.strictEqual(o.near, "top", "near edge = top");
		assert.strictEqual(o.far, "bottom", "far edge = bottom");
		assert.strictEqual(o.delta, 100 - 120, "delta = opener.top - popover.top");
	});

	QUnit.test("horizontal side Bottom docks the bottom edges", (assert) => {
		const oOpener = makeOpener(100, 300, 180, 60);
		const oPopover = makeOpener(120, 500, 120, 40);
		const o = Positioning.computeCrossAxisDockDelta({
			side: "Right", openerRef: oOpener, popoverRef: oPopover, verticalAlign: PopoverVerticalAlign.Bottom
		});
		assert.strictEqual(o.delta, (100 + 60) - (120 + 40), "delta = opener.bottom - popover.bottom");
	});

	QUnit.test("clamps the docked box inside the within-area near bound (Begin, opener off-screen start)", (assert) => {
		// Within-area [0, 500]; opener's left edge is at -40 (partially off-screen
		// start). Docking Begin on the opener's left would push the box to -40, so
		// the clamp pulls its left edge back to the edge margin (10).
		const oWithin = makeWithinArea(500, 400);
		const oOpener = makeOpener(100, -40, 180, 60);
		const oPopover = makeOpener(200, 20, 120, 40);
		const o = Positioning.computeCrossAxisDockDelta({
			side: "Bottom", openerRef: oOpener, popoverRef: oPopover,
			withinAreaRef: oWithin, horizontalAlign: PopoverHorizontalAlign.Begin, edgeMargin: 10
		});
		// popover.left (20) + delta must land on the near bound (0 + 10).
		assert.strictEqual(20 + o.delta, 10, "box left edge clamped to within-area left + margin");
	});

	QUnit.test("clamps the docked box inside the within-area far bound (End, opener off-screen end)", (assert) => {
		// Within-area [0, 500]; opener's right edge is at 540 (past the end bound).
		// Docking End on the opener's right would push the box past 540, so the
		// clamp pulls its right edge back to within-area right - margin (490).
		const oWithin = makeWithinArea(500, 400);
		const oOpener = makeOpener(100, 360, 180, 60);
		const oPopover = makeOpener(200, 300, 120, 40);
		const o = Positioning.computeCrossAxisDockDelta({
			side: "Bottom", openerRef: oOpener, popoverRef: oPopover,
			withinAreaRef: oWithin, horizontalAlign: PopoverHorizontalAlign.End, edgeMargin: 10
		});
		// popover.right (420) + delta must land on the far bound (500 - 10).
		assert.strictEqual(420 + o.delta, 490, "box right edge clamped to within-area right - margin");
	});

	QUnit.test("no clamp when the docked box fits inside the within-area", (assert) => {
		// Opener fully visible: the raw dock delta is kept untouched.
		const oWithin = makeWithinArea(500, 400);
		const oOpener = makeOpener(100, 200, 120, 60);
		const oPopover = makeOpener(200, 240, 100, 40);
		const o = Positioning.computeCrossAxisDockDelta({
			side: "Bottom", openerRef: oOpener, popoverRef: oPopover,
			withinAreaRef: oWithin, horizontalAlign: PopoverHorizontalAlign.Begin, edgeMargin: 10
		});
		assert.strictEqual(o.delta, 200 - 240, "delta = opener.left - popover.left, unclamped");
	});

	QUnit.test("over-wide box overflows the far edge, never the near edge (Begin)", (assert) => {
		// Box wider than the visible band: pin the near (left) edge to the margin
		// and let the far edge overflow, so the box is never dragged off the near side.
		const oWithin = makeWithinArea(200, 400);
		const oOpener = makeOpener(100, -30, 120, 60);
		const oPopover = makeOpener(200, 10, 300, 40);
		const o = Positioning.computeCrossAxisDockDelta({
			side: "Bottom", openerRef: oOpener, popoverRef: oPopover,
			withinAreaRef: oWithin, horizontalAlign: PopoverHorizontalAlign.Begin, edgeMargin: 10
		});
		assert.strictEqual(10 + o.delta, 10, "box left edge pinned to within-area left + margin");
	});

	QUnit.test("clamps the docked box inside the within-area (vertical align, horizontal side)", (assert) => {
		// Horizontal side (Left/Right) → vertical cross axis. Opener's top is above
		// the top bound, so docking Top would push the box off-screen upward.
		const oWithin = makeWithinArea(500, 400);
		const oOpener = makeOpener(-20, 300, 120, 60);
		const oPopover = makeOpener(40, 500, 120, 40);
		const o = Positioning.computeCrossAxisDockDelta({
			side: "Right", openerRef: oOpener, popoverRef: oPopover,
			withinAreaRef: oWithin, verticalAlign: PopoverVerticalAlign.Top, edgeMargin: 10
		});
		assert.strictEqual(o.near, "top", "near edge = top");
		assert.strictEqual(40 + o.delta, 10, "box top edge clamped to within-area top + margin");
	});

	// ---------------------------------------------------------------------
	QUnit.module("resolveCrossAxisAlign", { afterEach: restoreViewport });

	QUnit.test("returns the requested align without refs", (assert) => {
		assert.strictEqual(
			Positioning.resolveCrossAxisAlign({ side: "Bottom", horizontalAlign: PopoverHorizontalAlign.Begin }),
			PopoverHorizontalAlign.Begin,
			"missing refs → unchanged"
		);
	});

	QUnit.test("Center and Stretch never flip", (assert) => {
		stubViewport(500, 500);
		const oWithin = makeWithinArea(500, 500);
		const oOpener = makeOpener(0, 450, 50, 50); // opener at the right edge
		const oPopover = makePopover(300, 50);      // too wide to grow right

		[PopoverHorizontalAlign.Center, PopoverHorizontalAlign.Stretch].forEach((sAlign) => {
			assert.strictEqual(
				Positioning.resolveCrossAxisAlign({
					side: "Bottom", openerRef: oOpener, popoverRef: oPopover,
					withinAreaRef: oWithin, horizontalAlign: sAlign
				}),
				sAlign,
				sAlign + " is not flipped"
			);
		});
	});

	QUnit.test("Begin keeps Begin when the end-side room fits (LTR)", (assert) => {
		stubViewport(500, 500);
		const oWithin = makeWithinArea(500, 500);
		const oOpener = makeOpener(0, 50, 50, 50); // room to the right (450)
		const oPopover = makePopover(100, 50);     // fits the end-side room
		assert.strictEqual(
			Positioning.resolveCrossAxisAlign({
				side: "Bottom", openerRef: oOpener, popoverRef: oPopover,
				withinAreaRef: oWithin, horizontalAlign: PopoverHorizontalAlign.Begin
			}),
			PopoverHorizontalAlign.Begin,
			"fits → stays Begin"
		);
	});

	QUnit.test("Begin flips to End when the end-side room is too small and the start side has more (LTR)", (assert) => {
		stubViewport(500, 500);
		const oWithin = makeWithinArea(500, 500);
		// opener left edge at 450 → end-side room = 50; start-side room = 500 (opener right).
		const oOpener = makeOpener(0, 450, 50, 50);
		const oPopover = makePopover(200, 50); // wider than the 50px end-side room
		assert.strictEqual(
			Positioning.resolveCrossAxisAlign({
				side: "Bottom", openerRef: oOpener, popoverRef: oPopover,
				withinAreaRef: oWithin, horizontalAlign: PopoverHorizontalAlign.Begin
			}),
			PopoverHorizontalAlign.End,
			"no end-side room, more start-side room → End"
		);
	});

	QUnit.test("End flips to Begin symmetrically (LTR)", (assert) => {
		stubViewport(500, 500);
		const oWithin = makeWithinArea(500, 500);
		// opener right edge at 50 → End grows towards start, room = 50; Begin side room = 450.
		const oOpener = makeOpener(0, 0, 50, 50);
		const oPopover = makePopover(200, 50);
		assert.strictEqual(
			Positioning.resolveCrossAxisAlign({
				side: "Bottom", openerRef: oOpener, popoverRef: oPopover,
				withinAreaRef: oWithin, horizontalAlign: PopoverHorizontalAlign.End
			}),
			PopoverHorizontalAlign.Begin,
			"no start-side room, more end-side room → Begin"
		);
	});

	QUnit.test("keeps the requested align when neither side fits", (assert) => {
		stubViewport(500, 500);
		const oWithin = makeWithinArea(500, 500);
		const oOpener = makeOpener(0, 225, 50, 50); // centered → 275 each side
		const oPopover = makePopover(400, 50);      // fits neither side
		assert.strictEqual(
			Positioning.resolveCrossAxisAlign({
				side: "Bottom", openerRef: oOpener, popoverRef: oPopover,
				withinAreaRef: oWithin, horizontalAlign: PopoverHorizontalAlign.Begin
			}),
			PopoverHorizontalAlign.Begin,
			"neither fits → keep Begin"
		);
	});

	QUnit.test("the horizontal flip is mirrored in RTL", (assert) => {
		stubViewport(500, 500);
		const oWithin = makeWithinArea(500, 500);
		// RTL: Begin grows towards the left (locale start = right edge). opener left-edge
		// at 0 → leftwards room = 50; rightwards room = 500 → flip to End.
		const oOpener = makeOpener(0, 0, 50, 50);
		const oPopover = makePopover(200, 50);
		const oStub = sinon.stub(Localization, "getRTL").returns(true);
		const sResult = Positioning.resolveCrossAxisAlign({
			side: "Bottom", openerRef: oOpener, popoverRef: oPopover,
			withinAreaRef: oWithin, horizontalAlign: PopoverHorizontalAlign.Begin
		});
		oStub.restore();
		assert.strictEqual(sResult, PopoverHorizontalAlign.End, "RTL Begin with no leftwards room → End");
	});

	QUnit.test("Top flips to Bottom on a horizontal side when the downward room is too small", (assert) => {
		stubViewport(500, 500);
		const oWithin = makeWithinArea(500, 500);
		// opener top edge at 450 → downward room = 50; upward room = 500.
		const oOpener = makeOpener(450, 0, 50, 50);
		const oPopover = makePopover(50, 200);
		assert.strictEqual(
			Positioning.resolveCrossAxisAlign({
				side: "Right", openerRef: oOpener, popoverRef: oPopover,
				withinAreaRef: oWithin, verticalAlign: PopoverVerticalAlign.Top
			}),
			PopoverVerticalAlign.Bottom,
			"no downward room → Bottom"
		);
	});

	QUnit.test("Bottom flips to Top on a horizontal side symmetrically", (assert) => {
		stubViewport(500, 500);
		const oWithin = makeWithinArea(500, 500);
		// opener bottom edge at 50 → upward room = 50; downward room = 450.
		const oOpener = makeOpener(0, 0, 50, 50);
		const oPopover = makePopover(50, 200);
		assert.strictEqual(
			Positioning.resolveCrossAxisAlign({
				side: "Left", openerRef: oOpener, popoverRef: oPopover,
				withinAreaRef: oWithin, verticalAlign: PopoverVerticalAlign.Bottom
			}),
			PopoverVerticalAlign.Top,
			"no upward room → Top"
		);
	});
});
