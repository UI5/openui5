/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/Log",
	"sap/base/util/clamp",
	"sap/base/i18n/Localization",
	"sap/ui/dom/getScrollbarSize",
	"sap/ui/core/popover/PopoverPhysicalSide",
	"sap/ui/core/popover/PopoverFlipMode",
	"sap/ui/core/library"
], (Log, clamp, Localization, getScrollbarSize, PopoverPhysicalSide, PopoverFlipMode, coreLib) => {
	"use strict";

	// Shortcut for sap.ui.core.popover.PopoverPlacement
	const PopoverPlacement = coreLib.popover.PopoverPlacement;

	// Shortcut for sap.ui.core.popover.PopoverHorizontalAlign
	const PopoverHorizontalAlign = coreLib.popover.PopoverHorizontalAlign;

	// Shortcut for sap.ui.core.popover.PopoverVerticalAlign
	const PopoverVerticalAlign = coreLib.popover.PopoverVerticalAlign;

	/**
	 * @namespace sap.ui.core.popover.Positioning
	 * @since 1.151
	 * @private
	 * @ui5-restricted sap.m, sap.ui.core
	 */
	const Positioning = {};

	// Cross-axis alignment -> jquery-ui-position token. Stretch pins the near edge
	// (begin / top) and relies on the caller to size the popover to the opener.
	const CROSS_HORIZONTAL_TOKENS = {
		[PopoverHorizontalAlign.Center]: "center",
		[PopoverHorizontalAlign.Begin]: "begin",
		[PopoverHorizontalAlign.End]: "end",
		[PopoverHorizontalAlign.Stretch]: "begin"
	};

	const CROSS_VERTICAL_TOKENS = {
		[PopoverVerticalAlign.Center]: "center",
		[PopoverVerticalAlign.Top]: "top",
		[PopoverVerticalAlign.Bottom]: "bottom",
		[PopoverVerticalAlign.Stretch]: "top"
	};

	// Page-relative Y of the top bound: viewport top (scroll offset) for the
	// window, or the within-area's page top.
	const getTopBound = (oWithinArea) => {
		if (!oWithinArea || oWithinArea === window) {
			return window.scrollY;
		}

		return oWithinArea.getBoundingClientRect().top + window.scrollY;
	};

	// Page-relative Y of the bottom bound: viewport bottom for the window, or the
	// within-area's page bottom.
	const getBottomBound = (oWithinArea) => {
		if (!oWithinArea || oWithinArea === window) {
			return window.innerHeight + window.scrollY;
		}

		return oWithinArea.getBoundingClientRect().bottom + window.scrollY;
	};

	// Viewport-relative X of the left bound: 0 for the window, or the within-area's
	// left edge. Viewport-relative (no scrollX) to match openerRect.left.
	const getLeftBound = (oWithinArea) => {
		if (!oWithinArea || oWithinArea === window) {
			return 0;
		}

		return oWithinArea.getBoundingClientRect().left;
	};

	// Viewport-relative X of the right bound: clientWidth (excludes scrollbar) for
	// the window, matching getViewport; the within-area's right edge otherwise.
	// A coordinate, not a width.
	const getRightBound = (oWithinArea) => {
		if (!oWithinArea || oWithinArea === window) {
			return document.documentElement.clientWidth;
		}

		return oWithinArea.getBoundingClientRect().right;
	};

	/**
	 * Compute the four "space on side" values used by every space-based
	 * decision below.
	 *
	 * @param {object} o see resolvePlacement input.
	 * @returns {{top: number,bottom: number,left: number,right: number}} free space in px on each side of the opener.
	 * @private
	 */
	const computeSpaces = (o) => {
		const { openerRect, margin } = o;
		const iOffsetX = o.offsetX ?? 0;
		const iOffsetY = o.offsetY ?? 0;

		return {
			top: openerRect.top - getTopBound(o.withinAreaRef) - margin.top + iOffsetY,
			bottom: getBottomBound(o.withinAreaRef) - openerRect.bottom - margin.bottom - iOffsetY,
			left: openerRect.left - getLeftBound(o.withinAreaRef) - margin.left + iOffsetX,
			right: getRightBound(o.withinAreaRef) - openerRect.right - margin.right - iOffsetX
		};
	};

	// Resolve a vertical (Top/Bottom) placement from placement + flipMode.
	const calcVertical = (o) => {
		const s = computeSpaces(o);
		const iFits = o.popoverSize.height + (o.arrowSize ?? 0);
		const bMoreTop = s.top > s.bottom;
		const sRoomier = bMoreTop ? PopoverPhysicalSide.Top : PopoverPhysicalSide.Bottom;

		if (o.auto) {
			return sRoomier;
		}

		if (o.flipMode === PopoverFlipMode.PureSpace) {
			return sRoomier;
		}

		const bOpposite = o.flipMode === PopoverFlipMode.Opposite;

		if (o.placement === PopoverPlacement.Top) {
			if (s.top > iFits) {
				return PopoverPhysicalSide.Top;
			}
			// MoreSpace: keep the preferred side on a tie (equal space) — flip only
			// when the opposite side is strictly roomier.
			const sMoreSpace = s.top >= s.bottom ? PopoverPhysicalSide.Top : PopoverPhysicalSide.Bottom;
			return bOpposite ? PopoverPhysicalSide.Bottom : sMoreSpace;
		}

		// placement Bottom
		if (s.bottom > iFits) {
			return PopoverPhysicalSide.Bottom;
		}
		const sMoreSpace = s.bottom >= s.top ? PopoverPhysicalSide.Bottom : PopoverPhysicalSide.Top;
		return bOpposite ? PopoverPhysicalSide.Top : sMoreSpace;
	};

	// Resolve the logical "start"/"end" horizontal side to a physical side,
	// flipping for right-to-left. `start` is Left in LTR, Right in RTL.
	const physicalStart = (bRtl) => (bRtl ? PopoverPhysicalSide.Right : PopoverPhysicalSide.Left);
	const physicalEnd = (bRtl) => (bRtl ? PopoverPhysicalSide.Left : PopoverPhysicalSide.Right);

	/**
	 * Maps a physical horizontal side to the logical side the clamp and margin helpers expect,
	 * by swapping <code>Left</code> and <code>Right</code> in RTL.
	 *
	 * The space-based helpers ({@link sap.ui.core.popover.Positioning.computePopoverPositionCss},
	 * {@link sap.ui.core.popover.Positioning.getEffectiveMargins}) re-derive the
	 * physical side from the locale, as <code>sap.m.Popover</code> feeds them a
	 * logical side. A caller that has already resolved an actual physical side (for example, the tooltip)
	 * must undo that re-derivation by passing the logical side this returns.
	 * <code>Top</code> and <code>Bottom</code> sides and LTR pass through unchanged.
	 *
	 * @param {sap.ui.core.popover.PopoverPhysicalSide} sSide The physical side.
	 * @returns {sap.ui.core.popover.PopoverPhysicalSide} The logical side to feed the clamp or margin helpers
	 * @public
	 * @since 1.155
	 * @ui5-restricted sap.m, sap.ui.core
	 */
	Positioning.toLogicalSide = (sSide) => {
		if (!Localization.getRTL()) {
			return sSide;
		}

		if (sSide === PopoverPhysicalSide.Left) {
			return PopoverPhysicalSide.Right;
		}

		if (sSide === PopoverPhysicalSide.Right) {
			return PopoverPhysicalSide.Left;
		}

		return sSide;
	};

	// Resolve a horizontal (Begin/End) placement from placement + flipMode.
	// Begin resolves to the logical start side, End to the logical end side; both
	// space checks and the returned side are mapped through RTL together.
	const calcHorizontal = (o) => {
		const s = computeSpaces(o);
		const iFits = o.popoverSize.width + (o.arrowSize ?? 0);
		const bRtl = Localization.getRTL();
		const sStart = physicalStart(bRtl);
		const sEnd = physicalEnd(bRtl);
		const iStartSpace = bRtl ? s.right : s.left;
		const iEndSpace = bRtl ? s.left : s.right;
		const sRoomier = iStartSpace > iEndSpace ? sStart : sEnd;

		if (o.auto) {
			return sRoomier;
		}

		if (o.flipMode === PopoverFlipMode.PureSpace) {
			return sRoomier;
		}

		const bOpposite = o.flipMode === PopoverFlipMode.Opposite;

		if (o.placement === PopoverPlacement.Begin) {
			if (iStartSpace > iFits) {
				return sStart;
			}
			// MoreSpace: keep the preferred side on a tie (equal space) — flip only
			// when the opposite side is strictly roomier.
			const sMoreSpace = iStartSpace >= iEndSpace ? sStart : sEnd;
			return bOpposite ? sEnd : sMoreSpace;
		}

		// placement End
		if (iEndSpace > iFits) {
			return sEnd;
		}
		const sMoreSpace = iEndSpace >= iStartSpace ? sEnd : sStart;
		return bOpposite ? sStart : sMoreSpace;
	};

	const checkHorizontal = (o) => {
		const s = computeSpaces(o);
		const iWidth = o.popoverSize.width + (o.arrowSize ?? 0);

		return (iWidth <= s.left) || (iWidth <= s.right);
	};

	const checkVertical = (o) => {
		const s = computeSpaces(o);
		const iHeight = o.popoverSize.height + (o.arrowSize ?? 0);

		return (iHeight <= s.top) || (iHeight <= s.bottom);
	};

	const calcBestPos = (o) => {
		const s = computeSpaces(o);
		const { width: iW, height: iH } = o.popoverSize;
		const { width: iVpW, height: iVpH } = o.viewport;
		const { top: iMgT, right: iMgR, bottom: iMgB, left: iMgL } = o.margin;
		const bRtl = Localization.getRTL();

		const fPopoverSize = iH * iW;

		const fAvailableHeight = ((iVpH - iMgT - iMgB) >= iH) ? iH : (iVpH - iMgT - iMgB);
		const fAvailableWidth = ((iVpW - iMgL - iMgR) >= iW) ? iW : (iVpW - iMgL - iMgR);

		const fLeftCoverage = (fAvailableHeight * s.left) / fPopoverSize;
		const fRightCoverage = (fAvailableHeight * s.right) / fPopoverSize;
		const fTopCoverage = (fAvailableWidth * s.top) / fPopoverSize;
		const fBottomCoverage = (fAvailableWidth * s.bottom) / fPopoverSize;

		const fStartCoverage = bRtl ? fRightCoverage : fLeftCoverage;
		const fEndCoverage = bRtl ? fLeftCoverage : fRightCoverage;

		const fMaxH = Math.max(fStartCoverage, fEndCoverage);
		const fMaxV = Math.max(fTopCoverage, fBottomCoverage);

		if (fMaxH > fMaxV) {
			return (fMaxH === fStartCoverage) ? physicalStart(bRtl) : physicalEnd(bRtl);
		}

		if (fMaxV > fMaxH) {
			return (fMaxV === fTopCoverage) ? PopoverPhysicalSide.Top : PopoverPhysicalSide.Bottom;
		}

		// equal — pick vertical in portrait, horizontal in landscape
		if (iVpH > iVpW) {
			return (fMaxV === fTopCoverage) ? PopoverPhysicalSide.Top : PopoverPhysicalSide.Bottom;
		}

		return (fMaxH === fStartCoverage) ? physicalStart(bRtl) : physicalEnd(bRtl);
	};

	const calcAuto = (o) => {
		if (o.viewport.width > o.viewport.height) {
			// landscape → horizontal first
			if (checkHorizontal(o)) {
				return calcHorizontal(o);
			}

			if (checkVertical(o)) {
				return calcVertical(o);
			}

			return calcBestPos(o);
		}

		// portrait → vertical first
		if (checkVertical(o)) {
			return calcVertical(o);
		}

		if (checkHorizontal(o)) {
			return calcHorizontal(o);
		}

		return calcBestPos(o);
	};

	// Fully page-relative rect of a DOM element: border-box size from
	// getBoundingClientRect, with left/top shifted by the document scroll.
	const pageRect = (oDomRef) => {
		const oBcr = oDomRef.getBoundingClientRect();

		return {
			left: Math.round(oBcr.left) + window.scrollX,
			top: Math.round(oBcr.top) + window.scrollY,
			width: Math.round(oBcr.width),
			height: Math.round(oBcr.height)
		};
	};

	// Viewport size. Only feeds calcAuto/calcBestPos; space math uses the bounds above.
	const getViewport = (oWithinArea) => {
		if (!oWithinArea || oWithinArea === window) {
			const oDoc = document.documentElement;

			return { width: oDoc.clientWidth, height: oDoc.clientHeight };
		}

		const oStyle = window.getComputedStyle(oWithinArea);
		const fPadX = parseFloat(oStyle.paddingLeft) + parseFloat(oStyle.paddingRight);
		const fPadY = parseFloat(oStyle.paddingTop) + parseFloat(oStyle.paddingBottom);

		return {
			width: oWithinArea.clientWidth - (fPadX || 0),
			height: oWithinArea.clientHeight - (fPadY || 0)
		};
	};

	// Returns the given element's rect used for placement.
	//
	// left/right/width/height come from getBoundingClientRect() (viewport-relative,
	// matching the within-area width). top/bottom are page-relative (rect top plus
	// the document scroll, matching the page-relative bottom bound). The two axes
	// intentionally use different frames so each matches its comparison reference
	// in resolvePlacement.
	const getOpenerRect = (oDomRef) => {
		const oBcr = oDomRef.getBoundingClientRect();
		// Round to avoid subpixel dock
		const iLeft = Math.round(oBcr.left);                 // viewport-relative (horizontal axis)
		const iTop = Math.round(oBcr.top) + window.scrollY;  // page-relative (vertical axis)
		const iWidth = Math.round(oBcr.width);
		const iHeight = Math.round(oBcr.height);

		return {
			top: iTop,
			left: iLeft,
			width: iWidth,
			height: iHeight,
			bottom: iTop + iHeight,
			right: iLeft + iWidth
		};
	};

	// Returns the popover's border width on the edge the arrow is measured from:
	// the top border for Left/Right, the right border for Top/Bottom in RTL, the
	// left border otherwise. The arrow offset is measured from the popover's
	// border-box near corner, so this border is subtracted (added for the RTL
	// right-anchored case) to land the arrow correctly. Returns 0 when no element.
	const getBorderNear = (oPopoverEl, sSide, bRtl) => {
		if (!oPopoverEl || !oPopoverEl.ownerDocument) {
			return 0;
		}

		const oStyle = window.getComputedStyle(oPopoverEl);
		let sProp;

		if (sSide === PopoverPhysicalSide.Left || sSide === PopoverPhysicalSide.Right) {
			sProp = "borderTopWidth";
		} else {
			sProp = bRtl ? "borderRightWidth" : "borderLeftWidth";
		}

		return parseFloat(oStyle[sProp]) || 0;
	};

	// Base screen-edge margins, inflated by the within-area's inset from each window
	// edge (+ scroll for top/left, + shadow). Reduces to the base margin when the
	// within-area is the window.
	const getMargins = (o) => {
		const iShadow = o.shadowSize ?? 0;
		const iWindowLeft = window.scrollX;
		const iWindowTop = window.scrollY;
		const iWindowWidth = window.innerWidth;
		const iWindowHeight = window.innerHeight;

		const oWithin = o.withinAreaRef;
		const bHasWithin = oWithin && oWithin !== window && oWithin.getBoundingClientRect;

		// Page-relative within-area offset
		const iOffLeft = bHasWithin ? (oWithin.getBoundingClientRect().left + iWindowLeft) : 0;
		const iOffTop = bHasWithin ? (oWithin.getBoundingClientRect().top + iWindowTop) : 0;
		const iWithinWidth = bHasWithin ? Math.min(oWithin.offsetWidth, iWindowWidth) : iWindowWidth;
		const iWithinHeight = bHasWithin ? Math.min(oWithin.offsetHeight, iWindowHeight) : iWindowHeight;

		return {
			top: iWindowTop + o.margin.top + iOffTop + iShadow,
			left: iWindowLeft + o.margin.left + iOffLeft + iShadow,
			right: iWindowWidth - iOffLeft - iWithinWidth + o.margin.right + iShadow,
			bottom: iWindowHeight - iOffTop - iWithinHeight + o.margin.bottom + iShadow
		};
	};

	// Inflate the opener-facing margin so a later clamp can't push the popover back
	// over its opener. Returns a new object; input not mutated. RTL from Localization.
	const recalcOpenerMargins = (o) => {
		const oOpener = pageRect(o.openerRef);
		const iArrow = o.arrowSize ?? 0;
		const iShadow = o.shadowSize ?? 0;
		const iOffsetX = o.offsetX ?? 0;
		const iOffsetY = o.offsetY ?? 0;
		const iWindowWidth = window.innerWidth;
		const iWindowHeight = window.innerHeight;
		const bRtl = Localization.getRTL();

		// Copy so the caller's object is not mutated.
		const oMargins = {
			top: o.foldedMargin.top,
			right: o.foldedMargin.right,
			bottom: o.foldedMargin.bottom,
			left: o.foldedMargin.left
		};

		switch (o.side) {
			case PopoverPhysicalSide.Left:
				if (bRtl) {
					oMargins.left = oOpener.left + oOpener.width + iArrow - iOffsetX + iShadow;
				} else {
					oMargins.right = iWindowWidth - oOpener.left + iArrow - iOffsetX + iShadow;
				}
				break;
			case PopoverPhysicalSide.Right:
				if (bRtl) {
					oMargins.right = iWindowWidth - oOpener.width - oOpener.left + iArrow + iShadow;
				} else {
					oMargins.left = oOpener.left + oOpener.width + iArrow + iOffsetX + iShadow;
				}
				break;
			case PopoverPhysicalSide.Top: {
				const fNewCalc = iWindowHeight - oOpener.top + iArrow - iOffsetY + iShadow;
				oMargins.bottom = fNewCalc > oMargins.bottom ? fNewCalc : oMargins.bottom;
				break;
			}
			case PopoverPhysicalSide.Bottom:
				oMargins.top = oOpener.top + oOpener.height + iArrow + iOffsetY + iShadow;
				break;
			default:
				break;
		}

		return oMargins;
	};

	// Full fold: within-area inflation (getMargins) + optional opener reservation
	// (recalcOpenerMargins when side/openerRef given).
	const resolveMargins = (o) => {
		let oMargins = getMargins({
			withinAreaRef: o.withinAreaRef,
			margin: o.margin,
			shadowSize: o.shadowSize
		});

		if (o.side && o.openerRef) {
			oMargins = recalcOpenerMargins({
				side: o.side,
				openerRef: o.openerRef,
				arrowSize: o.arrowSize,
				shadowSize: o.shadowSize,
				offsetX: o.offsetX,
				offsetY: o.offsetY,
				foldedMargin: oMargins
			});
		}

		return oMargins;
	};

	/**
	 * Decide which strict side (Top/Bottom/Left/Right) the popover ends
	 * up on given a preferred placement value + viewport space.
	 *
	 * @param {object} oOptions The options bag.
	 * @param {sap.ui.core.popover.PopoverPlacement} oOptions.placement
	 *   The requested placement. <code>Begin</code>/<code>End</code> are
	 *   RTL-relative horizontal. Ignored when <code>auto</code> is set.
	 * @param {sap.ui.core.popover.PopoverFlipMode} [oOptions.flipMode]
	 *   How to react when the preferred side does not fit.
	 *   Ignored when <code>auto</code> is set.
	 * @param {boolean} [oOptions.auto]
	 *   When <code>true</code>, the best side is picked automatically by
	 *   coverage, ignoring <code>placement</code> and <code>flipMode</code>.
	 * @param {Element} oOptions.openerRef
	 *   The opener DOM element the popover is positioned relative to; measured
	 *   internally.
	 * @param {Element} oOptions.popoverRef
	 *   The popover DOM element as currently rendered;
	 * @param {Element|Window} oOptions.withinAreaRef
	 *   The within-area.
	 * @param {{top: number,right: number,bottom: number,left: number}} oOptions.margin
	 *   Screen-edge margins that must be preserved.
	 * @param {number} oOptions.arrowSize
	 *   Distance in px between opener and popover reserved for the arrow triangle.
	 * @param {number} [oOptions.offsetX=0]
	 *   Extra horizontal offset the caller wants applied on top of the
	 *   opener rect when computing free space.
	 * @param {number} [oOptions.offsetY=0]
	 *   Extra vertical offset the caller wants applied on top of the
	 *   opener rect when computing free space.
	 * @returns {sap.ui.core.popover.PopoverPhysicalSide} the resolved strict side.
	 * @public
	 * @since 1.151
	 */
	Positioning.resolvePlacement = (oOptions) => {
		const sPlacement = oOptions.placement;

		// Never: strict physical side, no measurement / flip.
		if (oOptions.flipMode === PopoverFlipMode.Never && !oOptions.auto) {
			if (sPlacement === PopoverPlacement.Begin) {
				return physicalStart(Localization.getRTL());
			}
			if (sPlacement === PopoverPlacement.End) {
				return physicalEnd(Localization.getRTL());
			}
			return sPlacement; // Top | Bottom pass through
		}

		if (!oOptions.openerRef) {
			Log.warning("Positioning.resolvePlacement: openerRef is missing", null, "sap.ui.core.popover.Positioning");
		}
		if (!oOptions.popoverRef) {
			Log.warning("Positioning.resolvePlacement: popoverRef is missing", null, "sap.ui.core.popover.Positioning");
		}

		const oPopoverRect = oOptions.popoverRef
			? getOpenerRect(oOptions.popoverRef)
			: { top: 0, left: 0, width: 0, height: 0, bottom: 0, right: 0 };
		const oOpts = Object.assign({}, oOptions, {
			openerRect: getOpenerRect(oOptions.openerRef),
			popoverSize: { width: oPopoverRect.width, height: oPopoverRect.height },
			viewport: getViewport(oOptions.withinAreaRef)
		});

		if (oOptions.auto) {
			return calcAuto(oOpts);
		}

		if (sPlacement === PopoverPlacement.Top || sPlacement === PopoverPlacement.Bottom) {
			return calcVertical(oOpts);
		}

		if (sPlacement === PopoverPlacement.Begin || sPlacement === PopoverPlacement.End) {
			return calcHorizontal(oOpts);
		}

		return PopoverPhysicalSide.Bottom;
	};

	/**
	 * Compute the arrow's offset along the popover edge that faces the
	 * opener, plus its perpendicular offset (usually 0 unless the arrow
	 * has to be clamped inside the popover edge because the opener is
	 * shorter than the popover on that axis).
	 *
	 * Computes the arrow's near-edge offset using the opener/popover geometry,
	 * then clamps it so the arrow never crosses the popover corners.
	 *
	 * @param {object} oOptions The options bag.
	 * @param {sap.ui.core.popover.PopoverPhysicalSide} oOptions.side
	 *   The resolved side the popover is anchored on.
	 * @param {Element} [oOptions.openerRef]
	 *   The opener DOM element. Its rect is measured internally. Preferred over
	 *   <code>openerRect</code>.
	 * @param {Element} [oOptions.popoverRef]
	 *   The popover DOM element. Its rect and near-edge border are measured
	 *   internally. Preferred over <code>popoverRect</code>.
	 * @param {Element} [oOptions.arrowRef]
	 *   The arrow DOM element. When given, its width/height are measured instead
	 *   of using <code>arrowWidth</code>/<code>arrowHeight</code>.
	 * @param {{top: number,left: number,right: number,bottom: number,width: number,height: number}} [oOptions.openerRect]
	 *   Pre-measured opener rect (fallback when <code>openerRef</code> is absent).
	 * @param {{top: number,left: number,right: number,bottom: number,width: number,height: number}} [oOptions.popoverRect]
	 *   Pre-measured popover rect (fallback when <code>popoverRef</code> is absent).
	 * @param {number} oOptions.arrowSize
	 *   Width of the arrow triangle along the popover edge (also used as
	 *   min offset from the corner so the arrow is never flush with the
	 *   popover border-radius).
	 * @param {number} [oOptions.arrowWidth]
	 *   Optional exact arrow width (defaults to <code>arrowSize</code>). Ignored
	 *   when <code>arrowRef</code> is given.
	 * @param {number} [oOptions.arrowHeight]
	 *   Optional exact arrow height on the cross axis (defaults to
	 *   <code>arrowSize</code>). Ignored when <code>arrowRef</code> is given.
	 * @param {number} [oOptions.cornerInset]
	 *   Minimum distance the arrow keeps from each popover corner (defaults
	 *   to <code>arrowSize</code>). For very small
	 *   popovers (e.g. a tooltip) where the available band is narrower than
	 *   twice the inset, the arrow is centered instead of corner-clamped.
	 * @param {number} [oOptions.borderNear]
	 *   Popover near-edge border width. When omitted it is read from
	 *   <code>popoverRef</code> via <code>getComputedStyle</code> (0 if there is
	 *   no ref).
	 * @param {sap.ui.core.popover.PopoverHorizontalAlign} [oOptions.horizontalAlign]
	 *   The cross-axis alignment used for the vertical sides (<code>Top</code>/<code>Bottom</code>),
	 *   that is, the same value passed to {@link sap.ui.core.popover.Positioning.computeAnchor}.
	 *   With <code>Begin</code>/<code>End</code> the arrow is pinned to the aligned
	 *   corner (at <code>cornerInset</code>) instead of pointing at the opener's
	 *   center. <code>Center</code>/<code>Stretch</code> keep the opener-centered
	 *   behavior. Ignored for the horizontal sides.
	 * @param {sap.ui.core.popover.PopoverVerticalAlign} [oOptions.verticalAlign]
	 *   The cross-axis alignment used for the horizontal sides (<code>Left</code>/<code>Right</code>).
	 *   With <code>Top</code>/<code>Bottom</code> the arrow is pinned to the aligned
	 *   corner. Ignored for the vertical sides.
	 * @returns {{along: number, cross: number, rtlRight: boolean}} the arrow offset.
	 *   <code>along</code>: pixel offset along the popover edge. Measured from the
	 *   near corner (top for Left/Right, left for Top/Bottom LTR) unless
	 *   <code>rtlRight</code> is true, in which case it is measured from the
	 *   popover's right edge. <code>cross</code>: pixel offset on the cross axis,
	 *   0 in typical cases. <code>rtlRight</code>: true when <code>along</code> is
	 *   a right-edge offset (Top/Bottom in RTL) — the caller applies it as
	 *   <code>right</code> rather than <code>left</code>. RTL is read from
	 *   <code>Localization.getRTL()</code> and only affects Top/Bottom.
	 * @public
	 * @since 1.151
	 */
	Positioning.computeArrowOffset = (oOptions) => {
		const { side } = oOptions;

		// DOM refs are measured internally; plain rects are used as-is.
		const oOpener = oOptions.openerRef ? getOpenerRect(oOptions.openerRef) : oOptions.openerRect;
		const oPopover = oOptions.popoverRef ? getOpenerRect(oOptions.popoverRef) : oOptions.popoverRect;

		const iArrow = oOptions.arrowSize ?? 0;
		let iArrowWidth;
		let iArrowHeight;
		if (oOptions.arrowRef) {
			const oArrowBcr = oOptions.arrowRef.getBoundingClientRect();
			iArrowWidth = oArrowBcr.width;
			iArrowHeight = oArrowBcr.height;
		} else {
			iArrowWidth = (typeof oOptions.arrowWidth === "number") ? oOptions.arrowWidth : iArrow;
			iArrowHeight = (typeof oOptions.arrowHeight === "number") ? oOptions.arrowHeight : iArrow;
		}
		const iInset = (typeof oOptions.cornerInset === "number") ? oOptions.cornerInset : iArrow;

		const bRtl = Localization.getRTL();
		const iBorderNear = (typeof oOptions.borderNear === "number")
			? oOptions.borderNear
			: getBorderNear(oOptions.popoverRef, side, bRtl);

		// Place the arrow in the band [inset, extent - inset - arrowExtent].
		// If the popover is too small for that band to exist, center the arrow
		// instead of pinning it to a corner.
		const placeAlong = (fRaw, iExtent, iArrowExtent) => {
			const fLo = iInset;
			const fHi = iExtent - iInset - iArrowExtent;

			return (fHi < fLo) ? (iExtent - iArrowExtent) / 2 : clamp(fRaw, fLo, fHi);
		};

		let iAlong;
		let bRtlRight = false;

		const bVerticalSide = side === PopoverPhysicalSide.Top || side === PopoverPhysicalSide.Bottom;
		const sHorizontalAlign = oOptions.horizontalAlign;
		const sVerticalAlign = oOptions.verticalAlign;

		// Edge-aligned cross axis: the popover sits on the opener's start/end (or
		// top/bottom) corner, so an opener-centered arrow would be clamped to a
		// corner anyway — and for an opener much wider than the popover it would
		// point away from the aligned edge. Pin the arrow to the aligned corner
		// instead, at the same inset the clamp band uses.
		if (bVerticalSide && (sHorizontalAlign === PopoverHorizontalAlign.Begin || sHorizontalAlign === PopoverHorizontalAlign.End)) {
			const bNearStart = sHorizontalAlign === PopoverHorizontalAlign.Begin;

			// The locale start is the left edge in LTR and the right edge in RTL;
			// measuring from the aligned edge keeps the inset exact either way.
			return {
				along: placeAlong(iInset, oPopover.width, iArrowWidth),
				cross: 0,
				rtlRight: bRtl ? bNearStart : !bNearStart
			};
		}

		if (!bVerticalSide && (sVerticalAlign === PopoverVerticalAlign.Top || sVerticalAlign === PopoverVerticalAlign.Bottom)) {
			// Vertical offsets are always measured from the popover's top edge.
			const fRaw = (sVerticalAlign === PopoverVerticalAlign.Top)
				? iInset
				: oPopover.height - iInset - iArrowHeight;

			return {
				along: placeAlong(fRaw, oPopover.height, iArrowHeight),
				cross: 0,
				rtlRight: false
			};
		}

		if (side === PopoverPhysicalSide.Left || side === PopoverPhysicalSide.Right) {
			// Arrow sits on the vertical edge — its offset is measured
			// from the top of the popover downward.
			iAlong = (oOpener.top - oPopover.top) - iBorderNear + 0.5 * (oOpener.height - iArrowHeight);
			iAlong = placeAlong(iAlong, oPopover.height, iArrowHeight);
		} else if (bRtl) {
			// Arrow sits on the horizontal edge — in RTL the offset is measured
			// from the popover's right edge inward.
			iAlong = (oPopover.left + oPopover.width) - (oOpener.left + oOpener.width) + iBorderNear + 0.5 * (oOpener.width - iArrowWidth);
			iAlong = placeAlong(iAlong, oPopover.width, iArrowWidth);
			bRtlRight = true;
		} else {
			// Arrow sits on the horizontal edge — offset from the left.
			iAlong = (oOpener.left - oPopover.left) - iBorderNear + 0.5 * (oOpener.width - iArrowWidth);
			iAlong = placeAlong(iAlong, oPopover.width, iArrowWidth);
		}

		return { along: iAlong, cross: 0, rtlRight: bRtlRight };
	};

	/**
	 * Given a resolved side + arrow size, return the jquery-ui-position
	 * <code>my</code> / <code>at</code> / <code>offset</code> spec that
	 * <code>sap.ui.core.Popup.setPosition</code> accepts.
	 *
	 * @param {object} oOptions The options bag.
	 * @param {sap.ui.core.popover.PopoverPhysicalSide} oOptions.side The resolved side the popover is anchored on.
	 * @param {number} oOptions.arrowSize
	 *   Perpendicular offset (in px) between opener and popover.
	 * @param {boolean} [oOptions.showArrow=true]
	 *   Whether the popover has an arrow. With an arrow the popover is centered on
	 *   the opener (arrow points at the center). Without an arrow it is start-aligned
	 *   (<code>begin</code>) on the cross axis.
	 * @param {boolean} [oOptions.mirror=true]
	 *   Whether the caller relies on <code>sap.ui.core.Popup</code> to mirror the
	 *   anchor tokens in RTL. When <code>true</code> (default), the horizontal sides
	 *   emit logical <code>begin</code>/<code>end</code> tokens that Popup flips in
	 *   RTL. When <code>false</code>, the caller has already resolved a TRUE physical
	 *   <code>side</code>; the horizontal sides emit physical <code>left</code>/<code>right</code>
	 *   tokens that pass through Popup untouched, avoiding a double flip.
	 * @param {sap.ui.core.popover.PopoverHorizontalAlign} [oOptions.horizontalAlign]
	 *   Cross-axis alignment for the vertical sides (<code>Top</code>/<code>Bottom</code>).
	 *   <code>Begin</code>/<code>End</code> are emitted as locale-relative tokens that
	 *   <code>sap.ui.core.Popup</code> flips in RTL. <code>Stretch</code> aligns like
	 *   <code>Begin</code> — the caller is responsible for sizing the popover to the
	 *   opener's width. Ignored for the horizontal sides. When omitted, the previous
	 *   default is kept (<code>center</code> with an arrow, <code>begin</code> without).
	 * @param {sap.ui.core.popover.PopoverVerticalAlign} [oOptions.verticalAlign]
	 *   Cross-axis alignment for the horizontal sides (<code>Left</code>/<code>Right</code>).
	 *   <code>Stretch</code> aligns like <code>Top</code> — the caller is responsible for
	 *   sizing the popover to the opener's height. Ignored for the vertical sides.
	 *   Defaults to <code>center</code>.
	 * @returns {{my: string, at: string, offset: string}} the jquery-ui-position spec.
	 * @public
	 * @since 1.151
	 */
	Positioning.computeAnchor = (oOptions) => {
		const iArrow = oOptions.arrowSize ?? 0;
		const bShowArrow = oOptions.showArrow !== false;
		const bMirror = oOptions.mirror !== false;

		// Horizontal cross-axis tokens: logical begin/end when Popup mirrors in RTL,
		// physical left/right when the caller already resolved the physical side.
		const sStartToken = bMirror ? "end" : "right";
		const sEndToken = bMirror ? "begin" : "left";

		// Cross-axis alignment tokens. Begin/End stay logical so Popup flips them in
		// RTL; Stretch pins the near edge and leaves the sizing to the caller.
		let sCrossH = bShowArrow ? "center" : "begin";

		if (oOptions.horizontalAlign) {
			sCrossH = CROSS_HORIZONTAL_TOKENS[oOptions.horizontalAlign] ?? sCrossH;
		}

		const sCrossV = CROSS_VERTICAL_TOKENS[oOptions.verticalAlign] ?? "center";

		if (!bShowArrow) {
			switch (oOptions.side) {
				case PopoverPhysicalSide.Top:
					return { my: `${sCrossH} bottom`, at: `${sCrossH} top`, offset: "0 0" };
				case PopoverPhysicalSide.Left:
					return { my: `${sStartToken} ${sCrossV}`, at: `${sEndToken} ${sCrossV}`, offset: "0 0" };
				case PopoverPhysicalSide.Right:
					return { my: `${sEndToken} ${sCrossV}`, at: `${sStartToken} ${sCrossV}`, offset: "0 0" };
				case PopoverPhysicalSide.Bottom:
				default:
					return { my: `${sCrossH} top`, at: `${sCrossH} bottom`, offset: "0 0" };
			}
		}

		switch (oOptions.side) {
			case PopoverPhysicalSide.Top:
				return { my: `${sCrossH} bottom`, at: `${sCrossH} top`, offset: `0 ${-iArrow}` };
			case PopoverPhysicalSide.Left:
				return { my: `${sStartToken} ${sCrossV}`, at: `${sEndToken} ${sCrossV}`, offset: `${-iArrow} 0` };
			case PopoverPhysicalSide.Right:
				return { my: `${sEndToken} ${sCrossV}`, at: `${sStartToken} ${sCrossV}`, offset: `${iArrow} 0` };
			case PopoverPhysicalSide.Bottom:
			default:
				return { my: `${sCrossH} top`, at: `${sCrossH} bottom`, offset: `0 ${iArrow}` };
		}
	};

	/**
	 * Compute a popover's on-screen CSS position, clamping it inside the document
	 * while respecting the caller's margins.
	 *
	 * @param {object} o The options bag.
	 * @param {Element} o.popoverRef The popover DOM element. Its page-relative
	 *   rect is measured internally (border-box size + document scroll).
	 * @param {{top: number,right: number,bottom: number,left: number}} o.margin
	 *   Base screen-edge margins, folded here against <code>withinAreaRef</code> and
	 *   the opener.
	 * @param {Element|Window} [o.withinAreaRef] Within-area.
	 * @param {sap.ui.core.popover.PopoverPhysicalSide} [o.side] Resolved side; with
	 *   <code>openerRef</code> reserves the opener-facing margin.
	 * @param {Element} [o.openerRef] Opener element (used with <code>side</code>).
	 * @param {number} [o.arrowSize] Arrow gap (used with <code>side</code> + <code>openerRef</code>).
	 * @param {number} [o.offsetX] Horizontal opener offset (used with <code>side</code>).
	 * @param {number} [o.offsetY] Vertical opener offset (used with <code>side</code>).
	 * @param {boolean} [o.pinBothSidesOnHorizontalOverflow] On horizontal exceed, pin both sides into a
	 *   fixed narrow column. When omitted, pin only the opener-facing
	 *   side and overflow the far edge, keeping small content readable.
	 * @param {boolean} o.hasVerticalScrollbar Whether the popover has a vertical
	 *   scrollbar whose width must be reserved on the right edge.
	 * @returns {{top:(number|undefined|string), bottom:(number|undefined|string), left:(number|undefined|string), right:(number|undefined|string)}}
	 *   The CSS values to apply to the popover (a side is <code>undefined</code>
	 *   when it should not be set, or <code>""</code> when it must be explicitly
	 *   cleared).
	 * @public
	 * @since 1.151
	 */
	Positioning.computePopoverPositionCss = (o) => {
		const oMargins = resolveMargins(o);
		const { top: iMgT, right: iMgR, bottom: iMgB, left: iMgL } = oMargins;
		const { left: iPopLeft, top: iPopTop, width: iPopWidth, height: iPopHeight } = pageRect(o.popoverRef);

		const iWindowLeft = window.scrollX;
		const iWindowTop = window.scrollY;
		const iDocumentWidth = iWindowLeft + document.documentElement.clientWidth;
		const iDocumentHeight = iWindowTop + document.documentElement.clientHeight;

		let iLeft;
		let iRight;
		let iTop;
		let iBottom;

		const iPosToRightBorder = iDocumentWidth - iPopLeft - iPopWidth;
		const iPosToBottomBorder = iDocumentHeight - iPopTop - iPopHeight;
		const bExceedHorizontal = (iDocumentWidth - iMgR - iMgL) < iPopWidth;
		const bExceedVertical = (iDocumentHeight - iMgT - iMgB) < iPopHeight;
		const bOverLeft = iPopLeft < iMgL;
		const iScrollbarSize = o.hasVerticalScrollbar ? getScrollbarSize().width : 0;
		const bOverRight = iPosToRightBorder < (iMgR + iScrollbarSize);
		const bOverTop = iPopTop < iMgT;
		const bOverBottom = iPosToBottomBorder < iMgB;

		if (bExceedHorizontal) {
			// pinBothSidesOnHorizontalOverflow: fixed-width callers (sap.m.Popover) pin BOTH sides into a
			// narrow column that can't react to content size (legacy behavior). When
			// omitted, pin only the opener-facing side and let the box keep its natural
			// (max-)width, overflowing the far edge so small content stays readable (tooltips).
			if (!o.pinBothSidesOnHorizontalOverflow && o.side === PopoverPhysicalSide.Left) {
				iLeft = iMgL;
				iRight = "";
			} else if (!o.pinBothSidesOnHorizontalOverflow && o.side === PopoverPhysicalSide.Right) {
				iRight = iMgR;
				iLeft = "";
			} else {
				iLeft = iMgL;
				iRight = iMgR;
			}
		} else if (bOverLeft) {
			iLeft = iMgL;
			if (Localization.getRTL()) {
				// when only one side of the popover goes beyond the defined border make sure that
				// only one from the iLeft and iRight is set because Popover has a fixed size and
				// can't react to content size change when both are set
				iRight = "";
			}
		} else if (bOverRight) {
			iRight = iMgR;
			// when only one side of the popover goes beyond the defined border make sure that
			// only one from the iLeft and iRight is set because Popover has a fixed size and
			// can't react to content size change when both are set
			iLeft = "";
		}

		if (bExceedVertical) {
			iTop = iMgT;
			iBottom = iMgB;
		} else if (bOverTop) {
			iTop = iMgT;
		} else if (bOverBottom) {
			iBottom = iMgB;
			// when only one side of the popover goes beyond the defined border make sure that
			// only one from the iLeft and iRight is set because Popover has a fixed size and
			// can't react to content size change when both are set
			iTop = "";
		}

		return {
			top: iTop,
			bottom: iBottom - iWindowTop,
			left: iLeft,
			right: typeof iRight === "number" ? iRight - iWindowLeft : iRight
		};
	};

	/**
	 * Compute the max size available to the scrollable content.
	 *
	 * @param {object} o The options bag.
	 * @param {{top: number,right: number,bottom: number,left: number}} o.margin
	 *   Base margins, folded here against <code>withinAreaRef</code> + opener.
	 * @param {Element|Window} [o.withinAreaRef] Within-area.
	 * @param {sap.ui.core.popover.PopoverPhysicalSide} [o.side] Resolved side.
	 * @param {Element} [o.openerRef] Opener element (used with <code>side</code>).
	 * @param {number} [o.arrowSize] Arrow gap (used with <code>side</code> + <code>openerRef</code>).
	 * @param {number} [o.offsetX] Horizontal opener offset (used with <code>side</code>).
	 * @param {number} [o.offsetY] Vertical opener offset (used with <code>side</code>).
	 * @param {number} [o.reservedWidth=0] Fixed non-content width (borders).
	 * @param {number} [o.reservedHeight=0] Fixed non-content height (borders,
	 *   header, sub-header, footer, content margins, or root padding).
	 * @returns {{maxWidth: number,maxHeight: number}} the max content size.
	 *   <code>maxHeight</code> is clamped to a minimum of 0; <code>maxWidth</code>
	 *   may be negative (an invalid max-width the browser ignores, letting wide
	 *   content wrap).
	 * @public
	 * @since 1.151
	 */
	Positioning.computeMaxContentSize = (o) => {
		const oMargins = resolveMargins(o);
		const iReservedWidth = o.reservedWidth ?? 0;
		const iReservedHeight = o.reservedHeight ?? 0;
		const iWidth = window.scrollX + document.documentElement.clientWidth;
		const iHeight = window.scrollY + document.documentElement.clientHeight;

		return {
			// maxWidth is left unclamped: a negative value yields an invalid
			// max-width that the browser ignores, so wide content wraps to the
			// available space instead of collapsing to 0.
			maxWidth: iWidth - oMargins.left - oMargins.right - iReservedWidth,
			maxHeight: Math.max(iHeight - oMargins.top - oMargins.bottom - iReservedHeight, 0)
		};
	};

	/**
	 * Resolve the effective (folded) screen-edge margins:
	 * the base <code>margin</code> inflated by the within-area inset and, when an
	 * opener is given, by the opener-facing side so a later overflow-clamp cannot
	 * push the element back over its opener. This is the same fold used internally
	 * by <code>computePopoverPositionCss</code> and <code>computeMaxContentSize</code>;
	 * exposed for callers that need the folded margins as scalars (e.g. drag bounds).
	 *
	 * @param {object} o The options bag.
	 * @param {{top: number,right: number,bottom: number,left: number}} o.margin Base screen-edge margins.
	 * @param {Element|Window} [o.withinAreaRef] Within-area (window when omitted).
	 * @param {sap.ui.core.popover.PopoverPhysicalSide} [o.side] Resolved side; with <code>openerRef</code> reserves the opener-facing margin.
	 * @param {Element} [o.openerRef] Opener element (used with <code>side</code>).
	 * @param {number} [o.arrowSize] Arrow gap (used with <code>side</code> + <code>openerRef</code>).
	 * @param {number} [o.shadowSize=0] Extra shadow allowance.
	 * @param {number} [o.offsetX=0] Horizontal opener offset the caller applied.
	 * @param {number} [o.offsetY=0] Vertical opener offset the caller applied.
	 * @returns {{top: number,right: number,bottom: number,left: number}} the folded margins.
	 * @public
	 * @since 1.151
	 */
	Positioning.getEffectiveMargins = resolveMargins;

	// Whether the given side is one of the vertical sides (Top/Bottom), whose
	// cross axis is horizontal. Left/Right are the horizontal sides.
	const isVerticalSide = (sSide) =>
		sSide === PopoverPhysicalSide.Top || sSide === PopoverPhysicalSide.Bottom;

	/**
	 * Viewport-relative bounds of the within-area, or of the document viewport
	 * when there is no within-area (or it is the window).
	 *
	 * The rect is viewport-relative (no scroll offset added) so it can be compared
	 * directly against an opener's <code>getBoundingClientRect()</code>.
	 *
	 * @param {Element|Window} [oWithinAreaRef] The within-area (window when omitted).
	 * @returns {{left: number,top: number,right: number,bottom: number}} The bounds rect
	 * @public
	 * @since 1.155
	 * @ui5-restricted sap.m, sap.ui.core
	 */
	Positioning.getWithinAreaBounds = (oWithinAreaRef) => {
		if (oWithinAreaRef && oWithinAreaRef !== window && oWithinAreaRef.getBoundingClientRect) {
			return oWithinAreaRef.getBoundingClientRect();
		}

		return {
			left: 0,
			top: 0,
			right: document.documentElement.clientWidth,
			bottom: document.documentElement.clientHeight
		};
	};

	/**
	 * Indicates whether the popover's cross axis is tied to the opener rather than centered on it, that is,
	 * whether it was docked to an opener edge or sized to match the opener.
	 * The generic overflow clamp is alignment-blind and would re-pin such a box to the screen edge,
	 * silently undoing the alignment. Callers must skip the cross-axis clamp when this method
	 * returns <code>true</code>.
	 *
	 * The cross axis is horizontal for the vertical sides (<code>Top</code>/<code>Bottom</code>,
	 * driven by <code>horizontalAlign</code>) and vertical for the horizontal sides
	 * (<code>Left</code>/<code>Right</code>, driven by <code>verticalAlign</code>).
	 *
	 * @param {object} oOptions The options bag.
	 * @param {sap.ui.core.popover.PopoverPhysicalSide} oOptions.side The resolved side.
	 * @param {sap.ui.core.popover.PopoverHorizontalAlign} [oOptions.horizontalAlign] Cross-axis alignment for the vertical sides.
	 * @param {sap.ui.core.popover.PopoverVerticalAlign} [oOptions.verticalAlign] Cross-axis alignment for the horizontal sides.
	 * @returns {boolean} Whether the cross axis is opener-bound
	 * @public
	 * @since 1.155
	 * @ui5-restricted sap.m, sap.ui.core
	 */
	Positioning.isCrossAxisOpenerBound = (oOptions) => {
		if (isVerticalSide(oOptions.side)) {
			return oOptions.horizontalAlign !== PopoverHorizontalAlign.Center;
		}

		return oOptions.verticalAlign !== PopoverVerticalAlign.Center;
	};

	/**
	 * Resolves the effective cross-axis alignment by flipping an edge-bound alignment
	 * to its opposite when the popover does not fit in its growth direction and
	 * the opposite direction has more room.
	 *
	 * An edge-bound alignment docks the popover's near edge to an opener edge and
	 * lets the box grow towards the other side: <code>Begin</code> grows towards the
	 * locale end, <code>End</code> towards the locale start; <code>Top</code> grows
	 * downwards, <code>Bottom</code> upwards. When that growth direction is cramped
	 * (opener near the far within-area edge) the box would be size-capped into a
	 * sliver, so this flips to the opposite alignment where there is more room —
	 * mirroring the {@link sap.ui.core.popover.PopoverFlipMode.MoreSpace} semantics
	 * used for the main placement axis.
	 *
	 * The requested value is returned unchanged for <code>Center</code>/<code>Stretch</code>,
	 * for an unknown value, when refs are missing, and when the popover fits.
	 * If the popover fits neither direction, the preference is kept on a tie,
	 * like <code>calcHorizontal</code>/<code>calcVertical</code>.
	 *
	 * @param {object} oOptions The options bag.
	 * @param {sap.ui.core.popover.PopoverPhysicalSide} oOptions.side The resolved side.
	 * @param {Element} oOptions.openerRef The opener DOM element, measured internally.
	 * @param {Element} oOptions.popoverRef The popover DOM element; its cross-axis extent is measured internally.
	 * @param {Element|Window} [oOptions.withinAreaRef] The within-area (window when omitted).
	 * @param {sap.ui.core.popover.PopoverHorizontalAlign} [oOptions.horizontalAlign] Cross-axis alignment for the vertical sides.
	 * @param {sap.ui.core.popover.PopoverVerticalAlign} [oOptions.verticalAlign] Cross-axis alignment for the horizontal sides.
	 * @param {number} [oOptions.edgeMargin=0] Gap kept from the opposite within-area edge.
	 * @returns {sap.ui.core.popover.PopoverHorizontalAlign|sap.ui.core.popover.PopoverVerticalAlign}
	 *   The effective alignment for the active axis
	 * @public
	 * @since 1.155
	 * @ui5-restricted sap.m, sap.ui.core
	 */
	Positioning.resolveCrossAxisAlign = (oOptions) => {
		const bVertical = isVerticalSide(oOptions.side);
		const sAlign = bVertical ? oOptions.horizontalAlign : oOptions.verticalAlign;

		if (!oOptions.openerRef || !oOptions.popoverRef) {
			return sAlign;
		}

		const iEdgeMargin = oOptions.edgeMargin ?? 0;
		const oBounds = Positioning.getWithinAreaBounds(oOptions.withinAreaRef);
		const oHostRect = oOptions.openerRef.getBoundingClientRect();
		const oTipRect = oOptions.popoverRef.getBoundingClientRect();

		if (bVertical) {
			if (sAlign !== PopoverHorizontalAlign.Begin && sAlign !== PopoverHorizontalAlign.End) {
				return sAlign;
			}

			// The requested alignment pins one opener edge and grows towards the other
			// within-area bound; the opposite alignment pins the other edge and grows
			// the other way. In RTL the locale start is the right edge, so Begin grows
			// leftwards instead.
			const bGrowsRight = (sAlign === PopoverHorizontalAlign.Begin) !== Localization.getRTL();
			const iRequestedRoom = (bGrowsRight ? oBounds.right - oHostRect.left : oHostRect.right - oBounds.left) - iEdgeMargin;
			const iOppositeRoom = (bGrowsRight ? oHostRect.right - oBounds.left : oBounds.right - oHostRect.left) - iEdgeMargin;

			if (oTipRect.width > iRequestedRoom && iOppositeRoom > iRequestedRoom) {
				return sAlign === PopoverHorizontalAlign.Begin ? PopoverHorizontalAlign.End : PopoverHorizontalAlign.Begin;
			}

			return sAlign;
		}

		if (sAlign !== PopoverVerticalAlign.Top && sAlign !== PopoverVerticalAlign.Bottom) {
			return sAlign;
		}

		const bGrowsDown = sAlign === PopoverVerticalAlign.Top;
		const iRequestedRoom = (bGrowsDown ? oBounds.bottom - oHostRect.top : oHostRect.bottom - oBounds.top) - iEdgeMargin;
		const iOppositeRoom = (bGrowsDown ? oHostRect.bottom - oBounds.top : oBounds.bottom - oHostRect.top) - iEdgeMargin;

		if (oTipRect.height > iRequestedRoom && iOppositeRoom > iRequestedRoom) {
			return sAlign === PopoverVerticalAlign.Top ? PopoverVerticalAlign.Bottom : PopoverVerticalAlign.Top;
		}

		return sAlign;
	};

	/**
	 * Resolves the placement side and the effective cross-axis alignment in a single measured call.
	 * {@link sap.ui.core.popover.Positioning.resolvePlacement} picks the strict side,
	 * then {@link sap.ui.core.popover.Positioning.resolveCrossAxisAlign} flips an edge-bound alignment to
	 * its opposite on the side's cross axis when that axis is cramped.
	 *
	 * Only the active axis's alignment can change — the vertical sides
	 * (<code>Top</code>/<code>Bottom</code>) own <code>horizontalAlign</code>, the
	 * horizontal sides own <code>verticalAlign</code>; the inactive axis is returned
	 * as requested. Callers that resolve a physical side (no Popup RTL mirror) get the
	 * side back unchanged and can feed it to {@link sap.ui.core.popover.Positioning.toLogicalSide}
	 * for the clamp/margin helpers.
	 *
	 * @param {object} oOptions The options bag — the union of
	 *   {@link sap.ui.core.popover.Positioning.resolvePlacement}'s and
	 *   {@link sap.ui.core.popover.Positioning.resolveCrossAxisAlign}'s inputs.
	 * @param {sap.ui.core.popover.PopoverPlacement} [oOptions.placement] Preferred placement.
	 * @param {sap.ui.core.popover.PopoverFlipMode} [oOptions.flipMode] How to react when the side does not fit.
	 * @param {boolean} [oOptions.auto] When set, the side is picked automatically by coverage.
	 * @param {Element} oOptions.openerRef The opener DOM element, measured internally.
	 * @param {Element} oOptions.popoverRef The popover DOM element, measured internally.
	 * @param {Element|Window} [oOptions.withinAreaRef] The within-area (window when omitted).
	 * @param {{top: number,right: number,bottom: number,left: number}} oOptions.margin Screen-edge margins.
	 * @param {number} oOptions.arrowSize Distance in px reserved between opener and popover for the arrow.
	 * @param {number} [oOptions.offsetX=0] Extra horizontal opener offset.
	 * @param {number} [oOptions.offsetY=0] Extra vertical opener offset.
	 * @param {sap.ui.core.popover.PopoverHorizontalAlign} [oOptions.horizontalAlign] Cross-axis alignment for the vertical sides.
	 * @param {sap.ui.core.popover.PopoverVerticalAlign} [oOptions.verticalAlign] Cross-axis alignment for the horizontal sides.
	 * @param {number} [oOptions.edgeMargin=0] Gap kept from the opposite within-area edge for the alignment flip.
	 * @returns {{side: sap.ui.core.popover.PopoverPhysicalSide, horizontalAlign: sap.ui.core.popover.PopoverHorizontalAlign, verticalAlign: sap.ui.core.popover.PopoverVerticalAlign}}
	 *   The resolved side and the effective alignments for both axes
	 * @public
	 * @since 1.155
	 * @ui5-restricted sap.m, sap.ui.core
	 */
	Positioning.resolvePlacementAndAlign = (oOptions) => {
		const sSide = Positioning.resolvePlacement(oOptions);
		const sEffective = Positioning.resolveCrossAxisAlign(Object.assign({}, oOptions, { side: sSide }));
		const bVertical = isVerticalSide(sSide);

		return {
			side: sSide,
			horizontalAlign: bVertical ? sEffective : oOptions.horizontalAlign,
			verticalAlign: bVertical ? oOptions.verticalAlign : sEffective
		};
	};

	/**
	 * Size limit imposed on the cross axis by an opener-bound alignment.
	 *
	 * With <code>Begin</code>/<code>End</code> (resp. <code>Top</code>/<code>Bottom</code>)
	 * the popover's near edge is docked to an opener edge, so the room it has is
	 * only what remains between that edge and the opposite within-area bound — not
	 * the full within-area. Without this cap a long content would keep its natural
	 * size, overflow the bound, and then get yanked back by the position clamp,
	 * silently breaking the alignment. Capping instead makes the content wrap and
	 * keeps the box docked where it was aligned.
	 *
	 * <code>Stretch</code> reports the opener's own extent so a caller that sized
	 * the box to the opener is not then cut down by a theme <code>max-width</code>.
	 *
	 * @param {object} oOptions The options bag.
	 * @param {sap.ui.core.popover.PopoverPhysicalSide} oOptions.side The resolved side.
	 * @param {Element} oOptions.openerRef The opener DOM element, measured internally.
	 * @param {Element|Window} [oOptions.withinAreaRef] The within-area (window when omitted).
	 * @param {sap.ui.core.popover.PopoverHorizontalAlign} [oOptions.horizontalAlign] Cross-axis alignment for the vertical sides.
	 * @param {sap.ui.core.popover.PopoverVerticalAlign} [oOptions.verticalAlign] Cross-axis alignment for the horizontal sides.
	 * @param {number} [oOptions.edgeMargin=0] Gap kept from the opposite within-area edge.
	 * @returns {{maxWidth: (number|undefined), maxHeight: (number|undefined)}}
	 *   The limit for the cross axis, empty for the centered alignments
	 * @public
	 * @since 1.155
	 * @ui5-restricted sap.m, sap.ui.core
	 */
	Positioning.computeAlignedMaxSize = (oOptions) => {
		if (!oOptions.openerRef) {
			return {};
		}

		const iEdgeMargin = oOptions.edgeMargin ?? 0;
		const oBounds = Positioning.getWithinAreaBounds(oOptions.withinAreaRef);
		const oHostRect = oOptions.openerRef.getBoundingClientRect();

		if (isVerticalSide(oOptions.side)) {
			const sAlign = oOptions.horizontalAlign;

			if (sAlign === PopoverHorizontalAlign.Stretch) {
				return { maxWidth: oHostRect.width };
			}

			if (sAlign !== PopoverHorizontalAlign.Begin && sAlign !== PopoverHorizontalAlign.End) {
				return {};
			}

			// The pinned edge is the opener's locale start for Begin and its locale
			// end for End; the room is what is left towards the other side.
			const bPinnedLeft = (sAlign === PopoverHorizontalAlign.Begin) !== Localization.getRTL();

			return {
				maxWidth: bPinnedLeft
					? oBounds.right - oHostRect.left - iEdgeMargin
					: oHostRect.right - oBounds.left - iEdgeMargin
			};
		}

		const sVerticalAlign = oOptions.verticalAlign;

		if (sVerticalAlign === PopoverVerticalAlign.Stretch) {
			return { maxHeight: oHostRect.height };
		}

		if (sVerticalAlign === PopoverVerticalAlign.Top) {
			return { maxHeight: oBounds.bottom - oHostRect.top - iEdgeMargin };
		}

		if (sVerticalAlign === PopoverVerticalAlign.Bottom) {
			return { maxHeight: oHostRect.bottom - oBounds.top - iEdgeMargin };
		}

		return {};
	};

	/**
	 * Combines the within-area content cap ({@link sap.ui.core.popover.Positioning.computeMaxContentSize})
	 * with the opener-bound alignment cap ({@link sap.ui.core.popover.Positioning.computeAlignedMaxSize})
	 * into the single maximum size a popover may take.
	 *
	 * The two caps are folded with <code>Math.min</code>: the box may never exceed the
	 * room left inside the within-area, and an edge-bound alignment shrinks it further
	 * to the room on the side it grows towards. The raw aligned values are returned
	 * alongside (<code>alignedWidth</code>/<code>alignedHeight</code>, <code>undefined</code>
	 * when the alignment imposes no cap) so a caller can distinguish a genuine alignment cap
	 * apart from the within-area cap and decide whether to apply it unconditionally.
	 *
	 * @param {object} o The options bag — the union of
	 *   {@link sap.ui.core.popover.Positioning.computeMaxContentSize}'s and
	 *   {@link sap.ui.core.popover.Positioning.computeAlignedMaxSize}'s inputs.
	 * @param {{top: number,right: number,bottom: number,left: number}} o.margin Base screen-edge margins.
	 * @param {Element|Window} [o.withinAreaRef] Within-area.
	 * @param {sap.ui.core.popover.PopoverPhysicalSide} [o.side] Resolved side (logical, as the clamp helpers expect).
	 * @param {Element} [o.openerRef] Opener element.
	 * @param {number} [o.arrowSize] Arrow gap.
	 * @param {number} [o.offsetX] Horizontal opener offset.
	 * @param {number} [o.offsetY] Vertical opener offset.
	 * @param {number} [o.reservedWidth=0] Fixed non-content width.
	 * @param {number} [o.reservedHeight=0] Fixed non-content height.
	 * @param {sap.ui.core.popover.PopoverHorizontalAlign} [o.horizontalAlign] Cross-axis alignment for the vertical sides.
	 * @param {sap.ui.core.popover.PopoverVerticalAlign} [o.verticalAlign] Cross-axis alignment for the horizontal sides.
	 * @param {number} [o.edgeMargin=0] Gap kept from the opposite within-area edge for the alignment cap.
	 * @returns {{maxWidth: number, maxHeight: number, alignedWidth: (number|undefined), alignedHeight: (number|undefined)}}
	 *   The folded caps plus the raw aligned values
	 * @public
	 * @since 1.155
	 * @ui5-restricted sap.m, sap.ui.core
	 */
	Positioning.computeFittedMaxSize = (o) => {
		const oBoxMax = Positioning.computeMaxContentSize(o);
		const oAligned = Positioning.computeAlignedMaxSize(o);

		return {
			maxWidth: Math.min(oBoxMax.maxWidth, oAligned.maxWidth ?? Infinity),
			maxHeight: Math.min(oBoxMax.maxHeight, oAligned.maxHeight ?? Infinity),
			alignedWidth: oAligned.maxWidth,
			alignedHeight: oAligned.maxHeight
		};
	};

	/**
	 * Computes the two CSS edge names that span a side's cross axis: <code>["left", "right"]</code>
	 * for the vertical sides (<code>Top</code>/<code>Bottom</code>) and
	 * <code>["top", "bottom"]</code> for the horizontal sides (<code>Left</code>/<code>Right</code>).
	 *
	 * The alignment-blind position clamp would re-pin these edges to the screen and
	 * undo an opener-bound alignment, so a caller that keeps the Popup's cross-axis
	 * dock skips exactly these edges when applying the clamp.
	 *
	 * @param {sap.ui.core.popover.PopoverPhysicalSide} sSide The resolved side.
	 * @returns {string[]} The near or far CSS edge names of the cross axis
	 * @public
	 * @since 1.155
	 * @ui5-restricted sap.m, sap.ui.core
	 */
	Positioning.computeCrossAxisEdges = (sSide) => {
		return isVerticalSide(sSide) ? ["left", "right"] : ["top", "bottom"];
	};

	/**
	 * Computes the shift needed to re-dock an opener-bound cross axis on the opener's live rect.
	 *
	 * A Popup dock cannot be trusted to land exactly on the aligned edge: size caps
	 * applied afterwards may have changed the box's extent, and a
	 * <code>right</code>/<code>bottom</code> dock is computed against the viewport
	 * while the box is laid out against its offset parent — a scrollbar between the
	 * two shifts it. Both surface as a few pixels of drift on the axis the alignment
	 * owns. The caller applies the returned <code>delta</code> to whichever of
	 * <code>near</code>/<code>far</code> its dock actually set. The far edge grows
	 * against the delta, so its sign is flipped by the caller.
	 *
	 * The delta docks the box on the opener's aligned edge, then clamps the docked
	 * box inside the within-area (keeping <code>edgeMargin</code> from each bound):
	 * an edge-bound alignment pins the box to an opener edge and the generic
	 * position clamp is skipped on this axis, so without this a partially-visible
	 * opener would drag the box off-screen with it. The clamp is a no-op whenever
	 * the opener is fully visible, so a valid alignment is never disturbed. The box
	 * is kept inside the near bound first, so when it is wider than the visible band
	 * it overflows the far edge rather than disappearing past the near one.
	 *
	 * @param {object} oOptions The options bag.
	 * @param {sap.ui.core.popover.PopoverPhysicalSide} oOptions.side The resolved side.
	 * @param {Element} oOptions.openerRef The opener DOM element, measured internally.
	 * @param {Element} oOptions.popoverRef The popover DOM element, measured internally.
	 * @param {Element|Window} [oOptions.withinAreaRef] The within-area (window when omitted).
	 * @param {sap.ui.core.popover.PopoverHorizontalAlign} [oOptions.horizontalAlign] Cross-axis alignment for the vertical sides.
	 * @param {sap.ui.core.popover.PopoverVerticalAlign} [oOptions.verticalAlign] Cross-axis alignment for the horizontal sides.
	 * @param {number} [oOptions.edgeMargin=0] Gap kept from each within-area edge by the clamp.
	 * @returns {{near: string, far: string, delta: number}|null} The CSS edge names
	 * spanning the cross axis and the pixel delta to apply, or <code>null</code>
	 * when the cross axis is not opener-bound
	 * @public
	 * @since 1.155
	 * @ui5-restricted sap.m, sap.ui.core
	 */
	Positioning.computeCrossAxisDockDelta = (oOptions) => {
		if (!oOptions.openerRef || !oOptions.popoverRef || !Positioning.isCrossAxisOpenerBound(oOptions)) {
			return null;
		}

		const oHostRect = oOptions.openerRef.getBoundingClientRect();
		const oTipRect = oOptions.popoverRef.getBoundingClientRect();
		const oBounds = Positioning.getWithinAreaBounds(oOptions.withinAreaRef);
		const iEdgeMargin = oOptions.edgeMargin ?? 0;

		// Add to fDockDelta the extra shift that keeps the docked box inside the
		// within-area. fNear/fFar are the box's near/far cross-axis edges AFTER the
		// dock; iLoBound/iHiBound are the visible band (inset by the edge margin).
		// Pull in against the near bound first so an over-wide box overflows the far
		// edge instead of vanishing past the near one.
		const clampDock = (fDockDelta, fNear, fFar, iLoBound, iHiBound) => {
			const fDockedNear = fNear + fDockDelta;
			const fDockedFar = fFar + fDockDelta;
			let fClamp = 0;

			if (fDockedFar > iHiBound) {
				fClamp = iHiBound - fDockedFar;
			}

			if (fDockedNear + fClamp < iLoBound) {
				fClamp = iLoBound - fDockedNear;
			}

			return fDockDelta + fClamp;
		};

		if (isVerticalSide(oOptions.side)) {
			// Stretch docks like Begin; only End pins the locale end.
			const bPinnedLeft = (oOptions.horizontalAlign !== PopoverHorizontalAlign.End) !== Localization.getRTL();
			const fDockDelta = bPinnedLeft
				? oHostRect.left - oTipRect.left
				: oHostRect.right - oTipRect.right;

			return {
				near: "left",
				far: "right",
				delta: clampDock(fDockDelta, oTipRect.left, oTipRect.right, oBounds.left + iEdgeMargin, oBounds.right - iEdgeMargin)
			};
		}

		// Stretch docks like Top; only Bottom pins the lower edge.
		const fDockDelta = oOptions.verticalAlign === PopoverVerticalAlign.Bottom
			? oHostRect.bottom - oTipRect.bottom
			: oHostRect.top - oTipRect.top;

		return {
			near: "top",
			far: "bottom",
			delta: clampDock(fDockDelta, oTipRect.top, oTipRect.bottom, oBounds.top + iEdgeMargin, oBounds.bottom - iEdgeMargin)
		};
	};

	return Positioning;
});
