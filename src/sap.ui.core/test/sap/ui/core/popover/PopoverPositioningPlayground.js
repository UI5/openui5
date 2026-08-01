sap.ui.define([
	"sap/m/Popover",
	"sap/m/Button",
	"sap/m/Text",
	"sap/m/VBox",
	"sap/m/HBox",
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
	VBox,
	HBox,
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

	// 3x3 opener grid cells; coordinates resolved at reposition time.
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
	let sPlacement = PlacementType.Top;
	let sSize = "medium";                           // "short" | "medium" | "huge"
	let bWithinArea = false;                        // whether the within-area is active
	let bShowArrow = true;                          // whether the popover shows its arrow (Popover only)
	let bScroll = false;                            // whether the page is made scrollable + scrolled to bottom-right
	let oCurrent = null;                            // currently open Popover/Tooltip

	// UI5 content root, so <body> is not a UIArea and UI5's preserve sweep leaves
	// the plain flow container / within-area overlay (its <body> siblings) alone.
	const oRoot = document.createElement("div");
	oRoot.id = "ppp-root";
	document.body.appendChild(oRoot);

	// Flow container: tall spacers around the opener row. In scroll mode it makes
	// a real long page; in grid mode the spacers collapse.
	const oFlow = document.createElement("div");
	oFlow.innerHTML =
		"<div id='ppp-spacer-top'></div>" +
		"<div id='ppp-openers-row'></div>" +
		"<div id='ppp-spacer-bottom'></div>";
	document.body.appendChild(oFlow);

	// Centered within-area overlay for non-scroll mode. In scroll mode the flow
	// row itself acts as the within-area instead.
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

	// Flow-mode opener row: a size-filling 3x3 grid (row-major TL..BR), edges
	// spread. Grey full-viewport frame for scroll-only; blue within-area-sized
	// frame for scroll+within.
	function rowFlowCss(sWidth, sHeight, sBorder, sBg) {
		return "display:grid;box-sizing:border-box;width:" + sWidth + ";height:" + sHeight + ";margin:0 auto;" +
			"grid-template-columns:repeat(3, max-content);grid-template-rows:repeat(3, max-content);" +
			"justify-content:space-between;align-content:space-between;" +
			"padding:12px;border:" + sBorder + ";background:" + sBg;
	}

	// Applies the current (Scroll, Within area) combo: sizes the row, sets the
	// clamp target, positions openers, scrolls into view.
	function applyLayout() {
		const oRow = document.getElementById("ppp-openers-row");
		const bFlowWithin = bScroll && bWithinArea;

		// Tall spacers put the grid mid-document: after scrollIntoView it sits near
		// the viewport bottom with document still below — triggers the flip bug.
		document.getElementById("ppp-spacer-top").style.height = bScroll ? "1400px" : "0";
		document.getElementById("ppp-spacer-bottom").style.height = bScroll ? "1600px" : "0";

		// Fixed overlay only for non-scroll within-area.
		oWithinArea.style.display = bWithinArea && !bScroll ? "block" : "none";

		if (bScroll) {
			oRow.style.cssText = bFlowWithin
				? rowFlowCss("60vw", "60vh", "3px dashed #0070f2", "rgba(0, 112, 242, 0.08)")
				: rowFlowCss("auto", "100vh", "2px dashed #888", "transparent");
		} else {
			oRow.style.cssText = "";
		}

		// Clamp target: flow row (scroll+within), fixed overlay (within only), else none.
		let oClamp = null;
		if (bFlowWithin) {
			oClamp = oRow;
		} else if (bWithinArea) {
			oClamp = oWithinArea;
		}
		Popup.setWithinArea(oClamp);

		repositionOpeners();

		if (bScroll) {
			oRow.scrollIntoView({ block: "end" });
		} else {
			window.scrollTo(0, 0);
		}
	}

	// ---- Behaviour ------------------------------------------------------

	function closeCurrent() {
		// Clear oCurrent before close(): afterClose may fire synchronously and null it.
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

	// showArrow applies to sap.m.Popover only; the core Tooltip has no such property.
	const oShowArrowCheck = new CheckBox({
		text: "Show arrow",
		selected: bShowArrow,
		select: function (oEvent) {
			bShowArrow = oEvent.getParameter("selected");
			closeCurrent();
		}
	});

	const oControlSwitch = new SegmentedButton({
		id: "ppp-control",
		contentMode: "ContentFit",
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
		id: "ppp-placement",
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
		id: "ppp-size",
		contentMode: "ContentFit",
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

	// Pins a control to the viewport, re-applied on each render. Returns the
	// mutable style map so drag can update the pinned position.
	function pin(oControl, mCss) {
		const mFixed = Object.assign({ position: "fixed", zIndex: 1 }, mCss);
		oControl.addEventDelegate({
			onAfterRendering: function () {
				Object.assign(oControl.getDomRef().style, mFixed);
			}
		});
		oControl.placeAt("ppp-root");

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
			closeCurrent();
			applyLayout();
		}
	});

	const oScrollCheck = new CheckBox({
		text: "Scroll",
		selected: bScroll,
		select: function (oEvent) {
			bScroll = oEvent.getParameter("selected");
			closeCurrent();
			applyLayout();
		}
	});

	// ---- UI: single draggable panel holding both rows ------------------
	// grip + two HBox rows in one VBox; moves as one pinned/draggable panel.
	const oRows = new VBox({
		items: [
			new HBox({
				alignItems: "Center",
				items: [
					new Label({ text: "Control:" }).addStyleClass("sapUiTinyMarginEnd"),
					oControlSwitch,
					new Label({ text: "Content:" }).addStyleClass("sapUiTinyMarginBegin sapUiTinyMarginEnd"),
					oSizeSwitch,
					oWithinAreaCheck.addStyleClass("sapUiTinyMarginBegin"),
					oScrollCheck.addStyleClass("sapUiTinyMarginBegin")
				]
			}),
			new HBox({
				alignItems: "Center",
				items: [
					new Label({ text: "Placement:" }).addStyleClass("sapUiTinyMarginEnd"),
					oPlacementSelect,
					oShowArrowCheck.addStyleClass("sapUiTinyMarginBegin")
				]
			}).addStyleClass("sapUiTinyMarginTop")
		]
	});

	const oPanel = new HBox({
		alignItems: "Center",
		items: [
			oDragHandle,
			oRows
		]
	});
	let bDragBound = false;
	oPanel.addEventDelegate({
		onAfterRendering: function () {
			if (!bDragBound) {
				bindDrag();
			}
		}
	});

	// Pin the panel; border/background/shadow live here so the pin's re-render
	// hook keeps them.
	const mPanelPin = pin(oPanel, {
		top: "25%", bottom: "auto", left: "50%", transform: "translate(-50%, -50%)", zIndex: 3,
		padding: ".5rem .75rem",
		background: "var(--sapObjectHeader_Background, #fff)",
		border: "1px solid var(--sapList_BorderColor, #ccc)",
		borderRadius: ".5rem",
		boxShadow: "0 2px 8px rgba(0,0,0,.15)"
	});

	// Drag: only the grip starts a drag, so panel controls stay clickable.
	let bDragging = false;
	let iStartX, iStartY, iOrigLeft, iOrigTop;

	document.addEventListener("mousemove", function (e) {
		if (!bDragging) {
			return;
		}
		const iLeft = iOrigLeft + e.clientX - iStartX;
		const iTop = iOrigTop + e.clientY - iStartY;
		// Persist into the pin map so re-renders keep the dragged position.
		mPanelPin.left = iLeft + "px";
		mPanelPin.top = iTop + "px";
		const oDom = oPanel.getDomRef();
		oDom.style.left = mPanelPin.left;
		oDom.style.top = mPanelPin.top;
	});

	document.addEventListener("mouseup", function () {
		bDragging = false;
	});

	// Bind the grip mousedown once both the panel and grip DOM exist.
	function bindDrag() {
		const oDom = oPanel.getDomRef();
		const oGrip = oDragHandle.getDomRef();
		if (!oDom || !oGrip || bDragBound) {
			return;
		}
		bDragBound = true;
		oGrip.style.cursor = "move";
		oGrip.addEventListener("mousedown", function (e) {
			bDragging = true;
			const oRect = oDom.getBoundingClientRect();
			iOrigLeft = oRect.left;
			iOrigTop = oRect.top;
			iStartX = e.clientX;
			iStartY = e.clientY;
			// Switch pin to absolute px and drop the centering transform.
			mPanelPin.left = iOrigLeft + "px";
			mPanelPin.top = iOrigTop + "px";
			mPanelPin.bottom = "auto";
			mPanelPin.transform = "none";
			oDom.style.left = mPanelPin.left;
			oDom.style.top = mPanelPin.top;
			oDom.style.transform = "none";
			e.preventDefault();
		});
	}

	// ---- UI: opener grid ------------------------------------------------

	const aOpenerButtons = aOpeners.map(function (oDef) {
		const oBtn = new Button({
			id: "ppp-opener-" + oDef.id,
			text: oDef.id,
			tooltip: "Open from " + oDef.id,
			press: function () { openFrom(oBtn); }
		});
		// Positioning per mode is set by repositionOpeners().
		oBtn.addEventDelegate({
			onAfterRendering: function () {
				oBtn.getDomRef().style.zIndex = 2;
				repositionOpeners();
			}
		});
		oBtn.placeAt("ppp-openers-row");
		return { def: oDef, btn: oBtn };
	});

	// Two opener layouts (openers always live in the flow row):
	//  - grid mode (Scroll off): position:fixed in the 3x3 cell; row collapses.
	//  - flow mode (Scroll on): position:static — genuine document-flow children of
	//    the scrolled row, the case that exercises the popup scroll-flip.
	function repositionOpeners() {
		if (bScroll) {
			// Flow mode: static; the row's CSS grid lays the openers out.
			aOpenerButtons.forEach(function (o) {
				const oDom = o.btn.getDomRef();
				if (!oDom) {
					return;
				}
				oDom.style.position = "static";
				oDom.style.left = oDom.style.top = "auto";
				oDom.style.transform = "none";
			});
			return;
		}

		// Grid mode: pin each opener to its cell. clientWidth/clientHeight exclude
		// the scrollbar gutter, keeping right/bottom openers clear of scrollbars.
		const oArea = bWithinArea
			? oWithinArea.getBoundingClientRect()
			: { top: 0, left: 0, width: document.documentElement.clientWidth, height: document.documentElement.clientHeight };

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

			oDom.style.position = "fixed";
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
