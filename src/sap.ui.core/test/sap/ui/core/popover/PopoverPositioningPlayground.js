sap.ui.define([
	"sap/m/Popover",
	"sap/m/Button",
	"sap/m/Text",
	"sap/m/Toolbar",
	"sap/m/ToolbarSpacer",
	"sap/m/Label",
	"sap/m/SegmentedButton",
	"sap/m/SegmentedButtonItem",
	"sap/m/Select",
	"sap/m/CheckBox",
	"sap/ui/core/Item",
	"sap/ui/core/Icon",
	"sap/ui/core/Popup",
	"sap/m/library",
	"sap/ui/core/tooltip/Tooltip"
], function (
	Popover,
	Button,
	Text,
	Toolbar,
	ToolbarSpacer,
	Label,
	SegmentedButton,
	SegmentedButtonItem,
	Select,
	CheckBox,
	Item,
	Icon,
	Popup,
	mLibrary,
	Tooltip
) {
	"use strict";

	const PlacementType = mLibrary.PlacementType;

	// ---- Configuration --------------------------------------------------

	const aPlacements = [
		PlacementType.Top,
		PlacementType.Bottom,
		PlacementType.Left,
		PlacementType.Right,
		PlacementType.Vertical,
		PlacementType.Horizontal,
		PlacementType.VerticalPreferredTop,
		PlacementType.VerticalPreferredBottom,
		PlacementType.HorizontalPreferredLeft,
		PlacementType.HorizontalPreferredRight,
		PlacementType.PreferredTopOrFlip,
		PlacementType.PreferredBottomOrFlip,
		PlacementType.PreferredLeftOrFlip,
		PlacementType.PreferredRightOrFlip,
		PlacementType.Auto
	];

	const mContent = {
		"short": "Short tooltip text.",
		medium: "This is a medium-length popover content spanning about two sentences so the box has a realistic size.",
		huge: (
			"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis pharetra hendrerit convallis. " +
			"Mauris quis est metus. Curabitur convallis vel arcu id cursus. Maecenas augue neque, lacinia sed " +
			"pulvinar eu, malesuada sagittis mauris. Praesent malesuada erat vel tortor dictum, non tempor mauris " +
			"finibus. Sed eu porttitor velit, quis consequat lectus. Fusce volutpat nisl augue, eget dictum mi " +
			"dictum sit amet. "
		).repeat(6)
	};

	// 3x3 opener grid cells. Coordinates are resolved at reposition time,
	// relative to the active area (viewport, or the within-area when active).
	const aOpeners = [
		{ id: "TL", row: "top",    col: "left" },
		{ id: "T",  row: "top",    col: "center" },
		{ id: "TR", row: "top",    col: "right" },
		{ id: "L",  row: "middle", col: "left" },
		{ id: "C",  row: "middle", col: "center" },
		{ id: "R",  row: "middle", col: "right" },
		{ id: "BL", row: "bottom", col: "left" },
		{ id: "B",  row: "bottom", col: "center" },
		{ id: "BR", row: "bottom", col: "right" }
	];

	// Inset from the active-area edges, in px.
	const OPENER_INSET = 8;

	// ---- State ----------------------------------------------------------

	let sControl = "Popover";                       // "Popover" | "Tooltip"
	let sPlacement = PlacementType.VerticalPreferredTop;
	let sSize = "medium";                           // "short" | "medium" | "huge"
	let bWithinArea = false;                        // whether the within-area is active
	let bShowArrow = true;                          // whether the popover shows its arrow (Popover only)
	let oCurrent = null;                            // currently open Popover/Tooltip

	// A smaller, centered within-area. Hidden by default (unset within-area =
	// whole window). When shown, popups are clamped to it and the openers move
	// inside it.
	const oWithinArea = document.createElement("div");
	oWithinArea.setAttribute("aria-hidden", "true");
	oWithinArea.style.cssText = [
		"position: fixed",
		"top: 50%",
		"left: 50%",
		"width: 60vw",
		"height: 60vh",
		"transform: translate(-50%, -50%)",
		"box-sizing: border-box",
		"border: 3px dashed #0070f2",
		"background: rgba(0, 112, 242, 0.08)",
		"z-index: 1",
		"pointer-events: none",
		"display: none"
	].join(";");
	document.body.appendChild(oWithinArea);

	// ---- Behaviour ------------------------------------------------------

	function closeCurrent() {
		// Take a local ref and clear oCurrent first: close() can fire afterClose
		// synchronously, whose handler nulls oCurrent — so reading it again after
		// close() (for destroy) would hit null.
		const oToClose = oCurrent;
		oCurrent = null;

		if (oToClose) {
			oToClose.close();
			oToClose.destroy();
		}
	}

	function openFrom(oOpener) {
		closeCurrent();

		const sText = mContent[sSize];

		if (sControl === "Tooltip") {
			oCurrent = new Tooltip({ placement: sPlacement, text: sText, delay: 0 });
			oCurrent.attachAfterClose(function () { oCurrent = null; });
			oCurrent.openBy(oOpener, 0);
		} else {
			oCurrent = new Popover({
				placement: sPlacement,
				showArrow: bShowArrow,
				showHeader: false,
				content: [new Text({ text: sText })]
			});
			oCurrent.attachAfterClose(function () { oCurrent = null; });
			oCurrent.openBy(oOpener);
		}
	}

	// ---- UI: control panel ---------------------------------------------

	const oControlSwitch = new SegmentedButton({
		selectedKey: sControl,
		items: [
			new SegmentedButtonItem({ key: "Popover", text: "sap.m.Popover" }),
			new SegmentedButtonItem({ key: "Tooltip", text: "core Tooltip" })
		],
		selectionChange: function (oEvent) {
			sControl = oEvent.getParameter("item").getKey();
			// showArrow is a sap.m.Popover property; the core Tooltip has none.
			oShowArrowCheck.setVisible(sControl === "Popover");
			closeCurrent();
		}
	});

	const oPlacementSelect = new Select({
		selectedKey: sPlacement,
		items: aPlacements.map(function (s) {
			return new Item({ key: s, text: s });
		}),
		change: function (oEvent) {
			sPlacement = oEvent.getParameter("selectedItem").getKey();
			closeCurrent();
		}
	});

	const oSizeSwitch = new SegmentedButton({
		selectedKey: sSize,
		items: [
			new SegmentedButtonItem({ key: "short", text: "Short" }),
			new SegmentedButtonItem({ key: "medium", text: "Medium" }),
			new SegmentedButtonItem({ key: "huge", text: "Huge" })
		],
		selectionChange: function (oEvent) {
			sSize = oEvent.getParameter("item").getKey();
			closeCurrent();
		}
	});

	// Pins an element to the viewport via inline styles, re-applied after every
	// render so it survives control invalidation. Returns the mutable style map
	// so callers (e.g. drag) can update the pinned position and have it persist
	// across re-renders.
	function pin(oControl, mCss) {
		const mFixed = Object.assign({ position: "fixed", zIndex: 10 }, mCss);
		oControl.addEventDelegate({
			onAfterRendering: function () {
				oControl.$().css(mFixed);
			}
		});
		oControl.placeAt("body");

		return mFixed;
	}

	const oDragHandle = new Icon({
		src: "sap-icon://vertical-grip",
		tooltip: "Drag to move"
	});
	oDragHandle.addStyleClass("sapUiTinyMarginEnd");

	const oWithinAreaCheck = new CheckBox({
		text: "Within area",
		selected: bWithinArea,
		select: function (oEvent) {
			bWithinArea = oEvent.getParameter("selected");
			oWithinArea.style.display = bWithinArea ? "block" : "none";
			Popup.setWithinArea(bWithinArea ? oWithinArea : null);
			closeCurrent();
			repositionOpeners();
		}
	});

	// showArrow applies to sap.m.Popover only; the core Tooltip has no such property.
	const oShowArrowCheck = new CheckBox({
		text: "Show arrow",
		selected: bShowArrow,
		select: function (oEvent) {
			bShowArrow = oEvent.getParameter("selected");
			closeCurrent();
		}
	});

	const oToolbar = new Toolbar({
		width: "auto",
		content: [
			oDragHandle,
			new Label({ text: "Control:" }), oControlSwitch,
			new ToolbarSpacer({ width: "1rem" }),
			new Label({ text: "Placement:" }), oPlacementSelect,
			new ToolbarSpacer({ width: "1rem" }),
			new Label({ text: "Content:" }), oSizeSwitch,
			new ToolbarSpacer({ width: "1rem" }),
			oWithinAreaCheck,
			new ToolbarSpacer({ width: "1rem" }),
			oShowArrowCheck,
			new ToolbarSpacer(),
			new Button({ text: "Close", press: closeCurrent })
		]
	});

	// Pin the toolbar centered between the top and middle opener rows, so it
	// clears every opener cell. Dragging is via the grip icon only.
	oToolbar.addStyleClass("sapUiSmallMargin");
	const mToolbarPin = pin(oToolbar, { top: "25%", bottom: "auto", left: "50%", transform: "translate(-50%, -50%)", zIndex: 20 });

	// Simple drag: press the grip icon and move the toolbar. Only the grip
	// starts a drag, so the toolbar's controls (checkbox, selects, buttons)
	// stay clickable.
	let bDragging = false;
	let iStartX, iStartY, iOrigLeft, iOrigTop;

	// Document-level move/up listeners: attached once, not per render.
	document.addEventListener("mousemove", function (e) {
		if (!bDragging) {
			return;
		}
		const iLeft = iOrigLeft + e.clientX - iStartX;
		const iTop = iOrigTop + e.clientY - iStartY;
		// Persist into the pin style map so re-renders keep the dragged position.
		mToolbarPin.left = iLeft + "px";
		mToolbarPin.top = iTop + "px";
		oToolbar.$().css({ left: mToolbarPin.left, top: mToolbarPin.top });
	});

	document.addEventListener("mouseup", function () {
		bDragging = false;
	});

	oToolbar.addEventDelegate({
		onAfterRendering: function () {
			const oDom = oToolbar.getDomRef();
			const oGrip = oDragHandle.getDomRef();
			if (!oGrip || oGrip.dataset.dragBound) {
				return;
			}
			oGrip.dataset.dragBound = "true";
			oGrip.style.cursor = "move";
			oGrip.addEventListener("mousedown", function (e) {
				bDragging = true;
				const oRect = oDom.getBoundingClientRect();
				iOrigLeft = oRect.left;
				iOrigTop = oRect.top;
				iStartX = e.clientX;
				iStartY = e.clientY;
				// Switch the pin to absolute px coords and drop the centering
				// transform, so the pin map fully describes the position.
				mToolbarPin.left = iOrigLeft + "px";
				mToolbarPin.top = iOrigTop + "px";
				mToolbarPin.bottom = "auto";
				mToolbarPin.transform = "none";
				oDom.style.left = mToolbarPin.left;
				oDom.style.top = mToolbarPin.top;
				oDom.style.transform = "none";
				e.preventDefault();
			});
		}
	});

	// ---- UI: opener grid ------------------------------------------------

	// Each entry: { def, btn } — the grid cell descriptor and its Button.
	const aOpenerButtons = aOpeners.map(function (oDef) {
		const oBtn = new Button({
			text: oDef.id,
			tooltip: "Open from " + oDef.id,
			press: function () { openFrom(oBtn); }
		});
		// Fixed positioning; exact coordinates are set by repositionOpeners().
		oBtn.addEventDelegate({
			onAfterRendering: function () {
				oBtn.$().css({ position: "fixed", zIndex: 10 });
				repositionOpeners();
			}
		});
		oBtn.placeAt("body");
		return { def: oDef, btn: oBtn };
	});

	// Positions every opener inside the active area (the within-area when it is
	// active, otherwise the whole viewport), pinned to its grid cell with an
	// inset. Uses each opener's measured size so right/bottom/center align to
	// the opener box, not its top-left corner.
	function repositionOpeners() {
		const oArea = bWithinArea
			? oWithinArea.getBoundingClientRect()
			: { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };

		aOpenerButtons.forEach(function (o) {
			const oDom = o.btn.getDomRef();
			if (!oDom) {
				return;
			}
			const iW = oDom.offsetWidth;
			const iH = oDom.offsetHeight;

			let iLeft;
			if (o.def.col === "left") {
				iLeft = oArea.left + OPENER_INSET;
			} else if (o.def.col === "right") {
				iLeft = oArea.left + oArea.width - iW - OPENER_INSET;
			} else {
				iLeft = oArea.left + (oArea.width - iW) / 2;
			}

			let iTop;
			if (o.def.row === "top") {
				iTop = oArea.top + OPENER_INSET;
			} else if (o.def.row === "bottom") {
				iTop = oArea.top + oArea.height - iH - OPENER_INSET;
			} else {
				iTop = oArea.top + (oArea.height - iH) / 2;
			}

			oDom.style.left = Math.round(iLeft) + "px";
			oDom.style.top = Math.round(iTop) + "px";
			oDom.style.right = "auto";
			oDom.style.bottom = "auto";
			oDom.style.transform = "none";
		});
	}

	// Keep openers aligned to the active area on viewport changes.
	window.addEventListener("resize", repositionOpeners);
});
