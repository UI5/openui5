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
	"sap/ui/core/library",
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
	coreLibrary,
	Tooltip
) {
	"use strict";

	const PlacementType = mLibrary.PlacementType;
	const PopoverPlacement = coreLibrary.popover.PopoverPlacement;

	// ---- Configuration --------------------------------------------------
	const aPopoverPlacements = [
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
	const aTooltipPlacements = Object.values(PopoverPlacement);

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

	const OPENER_INSET = 8;

	// ---- State ----------------------------------------------------------

	let sControl = "Popover";
	let sPlacement = PlacementType.Top;
	let sSize = "medium";
	let bWithinArea = false;
	let bShowArrow = true;
	let bScroll = false;
	let bScrollH = false;
	let oCurrent = null;

	// Content root so <body> is not a UIArea; UI5's preserve sweep leaves the plain
	// flow container / within-area overlay alone.
	const oRoot = document.createElement("div");
	oRoot.id = "ppp-root";
	document.body.appendChild(oRoot);

	// Spacers around the opener row create real overflow in scroll mode; the mid
	// band is a horizontal flex: [left spacer][row][right spacer].
	const oFlow = document.createElement("div");
	oFlow.innerHTML =
		"<div id='ppp-spacer-top'></div>" +
		"<div id='ppp-mid-band' style='display:flex;align-items:stretch'>" +
			"<div id='ppp-spacer-left'></div>" +
			"<div id='ppp-openers-row'></div>" +
			"<div id='ppp-spacer-right'></div>" +
		"</div>" +
		"<div id='ppp-spacer-bottom'></div>";
	document.body.appendChild(oFlow);

	// Centered within-area overlay for non-scroll mode.
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

	// Size-filling 3x3 grid, edges spread.
	function rowFlowCss(sWidth, sHeight, sBorder, sBg) {
		return "flex:0 0 auto;display:grid;box-sizing:border-box;width:" + sWidth + ";height:" + sHeight + ";" +
			"grid-template-columns:repeat(3, max-content);grid-template-rows:repeat(3, max-content);" +
			"justify-content:space-between;align-content:space-between;" +
			"padding:12px;border:" + sBorder + ";background:" + sBg;
	}

	// Applies the current (Scroll V/H, Within area) combo.
	function applyLayout() {
		const oRow = document.getElementById("ppp-openers-row");
		const bFlow = bScroll || bScrollH;
		const bFlowWithin = bFlow && bWithinArea;

		// Spacers put the grid mid-document; scrollIntoView leaves room past it,
		// exercising the popup scroll-flip.
		document.getElementById("ppp-spacer-top").style.height = bScroll ? "1400px" : "0";
		document.getElementById("ppp-spacer-bottom").style.height = bScroll ? "1600px" : "0";
		document.getElementById("ppp-spacer-left").style.width = bScrollH ? "1400px" : "0";
		document.getElementById("ppp-spacer-right").style.width = bScrollH ? "1600px" : "0";
		document.getElementById("ppp-spacer-left").style.flex = "0 0 auto";
		document.getElementById("ppp-spacer-right").style.flex = "0 0 auto";

		oWithinArea.style.display = bWithinArea && !bFlow ? "block" : "none";

		// Lock the non-scrolling axis; vw/vh ignore the active scrollbar and would
		// leak a phantom bar on the other axis.
		document.documentElement.style.overflowX = bScrollH ? "auto" : "hidden";
		document.documentElement.style.overflowY = bScroll ? "auto" : "hidden";

		if (bFlow) {
			// Non-scrolling axis sized from the client box (scrollbar-aware) so the
			// grid spreads without leaking overflow.
			const sW = bScrollH ? "100vw" : document.documentElement.clientWidth + "px";
			const sH = bScroll ? "100vh" : document.documentElement.clientHeight + "px";
			oRow.style.cssText = bFlowWithin
				? rowFlowCss("60vw", "60vh", "3px dashed #0070f2", "rgba(0, 112, 242, 0.08)")
				: rowFlowCss(sW, sH, "2px dashed #888", "transparent");
		} else {
			oRow.style.cssText = "";
		}

		let oClamp = null;
		if (bFlowWithin) {
			oClamp = oRow;
		} else if (bWithinArea) {
			oClamp = oWithinArea;
		}
		Popup.setWithinArea(oClamp);

		repositionOpeners();

		if (bFlow) {
			oRow.scrollIntoView({
				block: bScroll ? "end" : "nearest",
				inline: bScrollH ? "end" : "nearest"
			});
		} else {
			window.scrollTo(0, 0);
		}
	}

	// ---- Behaviour ------------------------------------------------------

	function closeCurrent() {
		// Clear before close(): afterClose may fire synchronously and null it.
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

	// showArrow is a sap.m.Popover property; the core Tooltip has none.
	const oShowArrowCheck = new CheckBox({
		text: "Show arrow",
		selected: bShowArrow,
		select: function (oEvent) {
			bShowArrow = oEvent.getParameter("selected");
			closeCurrent();
		}
	});

	const oPlacementSelect = new Select({
		id: "ppp-placement",
		selectedKey: sPlacement,
		items: aPopoverPlacements.map(function (s) {
			return new Item({ key: s, text: s });
		}),
		change: function (oEvent) {
			sPlacement = oEvent.getParameter("selectedItem").getKey();
			closeCurrent();
		}
	});

	// Rebuild the placement dropdown for the active control's enum.
	function syncPlacementItems() {
		const aValues = sControl === "Tooltip" ? aTooltipPlacements : aPopoverPlacements;
		if (aValues.indexOf(sPlacement) === -1) {
			sPlacement = aValues[0];
		}
		oPlacementSelect.destroyItems();
		aValues.forEach(function (s) {
			oPlacementSelect.addItem(new Item({ key: s, text: s }));
		});
		oPlacementSelect.setSelectedKey(sPlacement);
	}

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
			oShowArrowCheck.setVisible(sControl === "Popover");
			syncPlacementItems();
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
		text: "Scroll V",
		selected: bScroll,
		select: function (oEvent) {
			bScroll = oEvent.getParameter("selected");
			closeCurrent();
			applyLayout();
		}
	});

	const oScrollHCheck = new CheckBox({
		text: "Scroll H",
		selected: bScrollH,
		select: function (oEvent) {
			bScrollH = oEvent.getParameter("selected");
			closeCurrent();
			applyLayout();
		}
	});

	// ---- UI: single draggable panel ------------------------------------

	const oRows = new VBox({
		items: [
			new HBox({
				alignItems: "Center",
				items: [
					new Label({ text: "Control", showColon: true }).addStyleClass("sapUiTinyMarginEnd"),
					oControlSwitch,
					new Label({ text: "Content", showColon: true }).addStyleClass("sapUiTinyMarginBegin sapUiTinyMarginEnd"),
					oSizeSwitch,
					oWithinAreaCheck.addStyleClass("sapUiTinyMarginBegin"),
					oScrollCheck.addStyleClass("sapUiTinyMarginBegin"),
					oScrollHCheck.addStyleClass("sapUiTinyMarginBegin")
				]
			}),
			new HBox({
				alignItems: "Center",
				items: [
					new Label({ text: "PopoverPlacement", showColon: true }).addStyleClass("sapUiTinyMarginEnd"),
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
		mPanelPin.left = iLeft + "px";
		mPanelPin.top = iTop + "px";
		const oDom = oPanel.getDomRef();
		oDom.style.left = mPanelPin.left;
		oDom.style.top = mPanelPin.top;
	});

	document.addEventListener("mouseup", function () {
		bDragging = false;
	});

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
		oBtn.addEventDelegate({
			onAfterRendering: function () {
				oBtn.getDomRef().style.zIndex = 2;
				repositionOpeners();
			}
		});
		oBtn.placeAt("ppp-openers-row");
		return { def: oDef, btn: oBtn };
	});

	// Grid mode (scroll off): openers position:fixed in their cell.
	// Flow mode (scroll on): openers static, laid out by the row's CSS grid.
	function repositionOpeners() {
		if (bScroll || bScrollH) {
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

	window.addEventListener("resize", repositionOpeners);
});