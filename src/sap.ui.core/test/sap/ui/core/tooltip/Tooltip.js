sap.ui.require([
	"local/FakeControls",
	"sap/m/Page",
	"sap/m/Panel",
	"sap/m/Text",
	"sap/m/Label",
	"sap/m/Button",
	"sap/m/Dialog",
	"sap/m/Popover",
	"sap/m/CheckBox",
	"sap/m/VBox",
	"sap/m/HBox",
	"sap/ui/core/tooltip/Tooltip",
	"sap/m/library",
	"sap/ui/core/Core"
], async function (FakeControls, Page, Panel, Text, Label, Button, Dialog, Popover, CheckBox, VBox, HBox, Tooltip, mLibrary, Core) {
	"use strict";

	const { FakeButton, FakeText, FakeLink, PlainButton } = FakeControls;
	const PlacementType = mLibrary.PlacementType;
	const LONG_TOOLTIP = "This is a noticeably longer tooltip text used to verify wrapping behavior.";
	const VERY_LONG_TOOLTIP =
		"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis pharetra hendrerit convallis. " +
		"Mauris quis est metus. Curabitur convallis vel arcu id cursus. Maecenas augue neque, lacinia sed " +
		"pulvinar eu, malesuada sagittis mauris. Praesent malesuada erat vel tortor dictum, non tempor mauris finibus.";

	await Core.ready();

	function label(sText) {
		return new Label({ text: sText, width: "12rem" });
	}

	function panel(sTitle, aContent) {
		return new Panel({ headerText: sTitle, content: aContent }).addStyleClass("sapUiSmallMarginBottom");
	}

	function row(aContent) {
		return new HBox({ items: aContent, alignItems: "Center", wrap: "Wrap" }).addStyleClass("sapUiTinyMarginBottom").setWidth("100%");
	}

	// Groups a label with its control so they stay together, with generous
	// spacing between pairs when several sit in one wrapping row.
	function pair(sLabel, oControl) {
		return new HBox({
			items: [new Label({ text: sLabel }).addStyleClass("sapUiTinyMarginEnd"), oControl],
			alignItems: "Center"
		}).addStyleClass("sapUiMediumMarginEnd sapUiTinyMarginBottom");
	}

	// Drives a sap.ui.core.tooltip.Tooltip directly onto a PlainButton for
	// scenarios that vary placement or delay. Listens on mouseenter/mouseleave
	// and focusin/focusout (desktop) — enough to exercise placement and
	// open-delay behavior of the Tooltip itself.
	function withPlacement(oControl, mSettings) {
		const oTooltip = new Tooltip({
			text: mSettings.text,
			placement: mSettings.placement,
			delay: mSettings.delay !== undefined ? mSettings.delay : 500
		});
		oControl.addEventDelegate({
			onAfterRendering: function () {
				const oDomRef = oControl.getDomRef();
				oDomRef.addEventListener("mouseenter", () => oTooltip.openBy(oControl));
				oDomRef.addEventListener("mouseleave", () => oTooltip.close());
				oDomRef.addEventListener("focusin", () => {
					if (oDomRef.matches(":focus-visible")) {
						oTooltip.openBy(oControl);
					}
				});
				oDomRef.addEventListener("focusout", () => oTooltip.close());
			}
		});
		return oControl;
	}

	// --- Default placement (via TooltipEnablement on fake buttons) ---
	const oFirstButton = new FakeButton("defaultBtn", { text: "Default", tooltipText: "Default tooltip" });
	const oDefaultPanel = panel("Text and default placement", [
		row([
			label("Default (VerticalPreferredTop):"),
			oFirstButton,
			new FakeButton({ text: "Short text", tooltipText: "Short" }),
			new FakeButton({ text: "Long text", tooltipText: LONG_TOOLTIP }),
			new FakeButton({ text: "Very long text", tooltipText: VERY_LONG_TOOLTIP })
		])
	]);

	// --- Placement (every PlacementType value) — via Tooltip directly ---
	const oPlacementPanel = panel("Placement", [
		row([
			pair("Top:", withPlacement(new PlainButton({ text: "Top" }), { text: "Top", placement: PlacementType.Top })),
			pair("Bottom:", withPlacement(new PlainButton({ text: "Bottom" }), { text: "Bottom", placement: PlacementType.Bottom })),
			pair("Left:", withPlacement(new PlainButton("placeLeft", { text: "Left" }), { text: "Left", placement: PlacementType.Left })),
			pair("Right:", withPlacement(new PlainButton("placeRight", { text: "Right" }), { text: "Right", placement: PlacementType.Right }))
		]),
		row([
			pair("VerticalPreferredTop:", withPlacement(new PlainButton({ text: "VPreferredTop" }), { text: "VerticalPreferredTop", placement: PlacementType.VerticalPreferredTop })),
			pair("VerticalPreferredBottom:", withPlacement(new PlainButton({ text: "VPreferredBottom" }), { text: "VerticalPreferredBottom", placement: PlacementType.VerticalPreferredBottom })),
			pair("HorizontalPreferredLeft:", withPlacement(new PlainButton({ text: "HPreferredLeft" }), { text: "HorizontalPreferredLeft", placement: PlacementType.HorizontalPreferredLeft })),
			pair("HorizontalPreferredRight:", withPlacement(new PlainButton({ text: "HPreferredRight" }), { text: "HorizontalPreferredRight", placement: PlacementType.HorizontalPreferredRight }))
		]),
		row([
			pair("PreferredTopOrFlip:", withPlacement(new PlainButton({ text: "TopOrFlip" }), { text: "PreferredTopOrFlip", placement: PlacementType.PreferredTopOrFlip })),
			pair("PreferredBottomOrFlip:", withPlacement(new PlainButton({ text: "BottomOrFlip" }), { text: "PreferredBottomOrFlip", placement: PlacementType.PreferredBottomOrFlip })),
			pair("PreferredLeftOrFlip:", withPlacement(new PlainButton({ text: "LeftOrFlip" }), { text: "PreferredLeftOrFlip", placement: PlacementType.PreferredLeftOrFlip })),
			pair("PreferredRightOrFlip:", withPlacement(new PlainButton({ text: "RightOrFlip" }), { text: "PreferredRightOrFlip", placement: PlacementType.PreferredRightOrFlip }))
		])
	]);

	// --- Delay ---
	const oDelayPanel = panel("Delay (open delay in ms)", [
		row([
			pair("delay = 0:", withPlacement(new PlainButton("delayImmediate", { text: "Immediate" }), { text: "Opens immediately (delay 0)", delay: 0 })),
			pair("delay = 500 (default):", withPlacement(new PlainButton({ text: "Default" }), { text: "Default 500ms delay", delay: 500 })),
			pair("delay = 1500:", withPlacement(new PlainButton({ text: "Slow" }), { text: "Slow 1500ms delay", delay: 1500 }))
		])
	]);

	// --- Programmatic API: openBy / close ---
	const oAnchor = new PlainButton("apiAnchor", { text: "Anchor" });
	const oApiTooltip = new Tooltip({ text: "Opened programmatically via Tooltip#openBy" });
	const oApiPanel = panel("Programmatic API: openBy / close", [
		row([
			pair("Anchor:", oAnchor),
			new Button("apiOpen", { text: "openBy(anchor)", press: () => oApiTooltip.openBy(oAnchor, 0) }).addStyleClass("sapUiTinyMarginEnd"),
			new Button("apiClose", { text: "close(0)", press: () => oApiTooltip.close(0) })
		])
	]);

	// --- Deterministic open states (for visual testing) ---
	// One tooltip via openBy(anchor, 0) onto a centered anchor; stable IDs (vt*) let the uiveri5 spec target each state.
	const SHORT_TOOLTIP = "Short tooltip";
	const oVtAnchor = new PlainButton("vtAnchor", { text: "Anchor" });
	const oVtTooltip = new Tooltip("vtTooltip", { text: SHORT_TOOLTIP, placement: PlacementType.Top });

	function vtButton(sId, sLabel, sText, sPlacement) {
		return new Button(sId, {
			text: sLabel,
			press: function () {
				oVtTooltip.setText(sText);
				oVtTooltip.setPlacement(sPlacement);
				oVtTooltip.openBy(oVtAnchor, 0);
			}
		}).addStyleClass("sapUiTinyMarginEnd sapUiTinyMarginBottom");
	}

	const oVtPanel = panel("Deterministic open states (for visual testing)", [
		new Text({ text: "Each button opens the tooltip immediately (delay 0) on the anchor and leaves it open in a single isolated state — suited for screenshot comparison. Placement buttons vary the arrow side; text buttons vary wrapping within the tooltip's max width. The anchor is centered with generous margins so every placement renders without clipping." }).addStyleClass("sapUiTinyMarginBottom"),
		new HBox({
			justifyContent: "Center",
			items: [oVtAnchor]
		}).addStyleClass("sapUiMediumMarginTop sapUiMediumMarginBottom").setWidth("100%"),
		row([
			vtButton("vtTop", "Top", SHORT_TOOLTIP, PlacementType.Top),
			vtButton("vtBottom", "Bottom", SHORT_TOOLTIP, PlacementType.Bottom),
			vtButton("vtLeft", "Left", SHORT_TOOLTIP, PlacementType.Left),
			vtButton("vtRight", "Right", SHORT_TOOLTIP, PlacementType.Right)
		]),
		row([
			vtButton("vtShort", "Short text", SHORT_TOOLTIP, PlacementType.Bottom),
			vtButton("vtLong", "Long text", LONG_TOOLTIP, PlacementType.Bottom),
			vtButton("vtVeryLong", "Very long text", VERY_LONG_TOOLTIP, PlacementType.Bottom),
			new Button("vtClose", { text: "Close", press: () => oVtTooltip.close(0) }).addStyleClass("sapUiTinyMarginBottom")
		])
	]);

	// --- Auto-flip near viewport edges (deterministic, for visual testing) ---
	// Edge-pinned anchors force a placement toward the edge so the tooltip flips;
	// hidden by default (vtFlipShow) to avoid leaking into other screenshots.
	const oFlipTooltip = new Tooltip("vtFlipTooltip", { text: SHORT_TOOLTIP });

	function flipAnchor(sId, sText, mPos) {
		const oBtn = new PlainButton(sId, { text: sText });
		oBtn.addEventDelegate({
			onAfterRendering: function () {
				const oStyle = oBtn.getDomRef().style;
				oStyle.position = "fixed";
				oStyle.zIndex = "100";
				Object.assign(oStyle, mPos);
			}
		});
		return oBtn;
	}

	const oFlipTopAnchor = flipAnchor("vtFlipTopAnchor", "Top edge", { top: "0.5rem", left: "45%" });
	const oFlipBottomAnchor = flipAnchor("vtFlipBottomAnchor", "Bottom edge", { bottom: "0.5rem", left: "45%" });
	const oFlipLeftAnchor = flipAnchor("vtFlipLeftAnchor", "Left edge", { top: "45%", left: "0.5rem" });
	const oFlipRightAnchor = flipAnchor("vtFlipRightAnchor", "Right edge", { top: "45%", right: "0.5rem" });

	const oFlipContainer = new HBox("vtFlipContainer", {
		items: [oFlipTopAnchor, oFlipBottomAnchor, oFlipLeftAnchor, oFlipRightAnchor],
		visible: false
	});
	const oFlipToggle = new CheckBox("vtFlipShow", {
		text: "Show viewport-edge anchors",
		select: (oEvent) => oFlipContainer.setVisible(oEvent.getParameter("selected"))
	});

	function flipButton(sId, sLabel, oAnchor, sPlacement) {
		return new Button(sId, {
			text: sLabel,
			press: function () {
				oFlipTooltip.setPlacement(sPlacement);
				oFlipTooltip.openBy(oAnchor, 0);
			}
		}).addStyleClass("sapUiTinyMarginEnd sapUiTinyMarginBottom");
	}

	const oFlipPanel = panel("Auto-flip near viewport edges (deterministic, for visual testing)", [
		new Text({ text: "Tick the checkbox to reveal the fixed-position anchors in the viewport edges, then use a flip button. Each button opens the tooltip immediately with a strict placement toward the nearby edge; with no room on that side, the tooltip flips to the opposite side instead of being clipped." }).addStyleClass("sapUiTinyMarginBottom"),
		oFlipToggle,
		row([
			flipButton("vtFlipTop", "Top → flips down", oFlipTopAnchor, PlacementType.Top),
			flipButton("vtFlipBottom", "Bottom → flips up", oFlipBottomAnchor, PlacementType.Bottom),
			flipButton("vtFlipLeft", "Left → flips right", oFlipLeftAnchor, PlacementType.Left),
			flipButton("vtFlipRight", "Right → flips left", oFlipRightAnchor, PlacementType.Right),
			new Button("vtFlipClose", { text: "Close", press: () => oFlipTooltip.close(0) }).addStyleClass("sapUiTinyMarginBottom")
		]),
		oFlipContainer
	]);

	// --- Tooltip above a modal Dialog (deterministic, for visual testing) ---
	// Opens a modal Dialog, then a tooltip on an anchor inside it; the tooltip's Popover must layer ABOVE the dialog's block layer.
	let oVtDialog;
	const oDialogTooltip = new Tooltip("vtDialogTooltip", { text: SHORT_TOOLTIP, placement: PlacementType.Bottom });
	const oVtDialogAnchor = new PlainButton("vtDialogAnchor", { text: "Anchor in dialog" });
	const oVtDialogShowBtn = new Button("vtDialogShow", {
		text: "Show tooltip",
		press: () => oDialogTooltip.openBy(oVtDialogAnchor, 0)
	});
	const oDialogPanel = panel("Tooltip above a modal Dialog (deterministic, for visual testing)", [
		new Text({ text: "Open the modal dialog, then use its \"Show tooltip\" button. The tooltip must render above the dialog and its modal block layer." }).addStyleClass("sapUiTinyMarginBottom"),
		row([
			new Button("vtDialogOpen", {
				text: "Open Dialog",
				press: function () {
					if (!oVtDialog) {
						oVtDialog = new Dialog("vtDialog", {
							title: "Tooltip above this Dialog",
							contentWidth: "22rem",
							content: new VBox({
								items: [
									new Text({ text: "Click \"Show tooltip\" to open a tooltip on the anchor below — it should appear above this dialog." }).addStyleClass("sapUiSmallMarginBottom"),
									new HBox({ justifyContent: "Center", items: [oVtDialogAnchor] }).addStyleClass("sapUiSmallMarginTop sapUiSmallMarginBottom").setWidth("100%"),
									oVtDialogShowBtn
								]
							}).addStyleClass("sapUiSmallMargin"),
							endButton: new Button("vtDialogClose", { text: "Close", press: () => oVtDialog.close() })
						});
					}
					oVtDialog.open();
				}
			})
		])
	]);

	// --- Text with tooltip (non-focusable) ---
	const oTextPanel = panel("Text with tooltip (no focus, no extended tab chain)", [
		new Text({ text: "The phrase below is a non-focusable fake text with a tooltip. On desktop, hover it; on mobile, long-press it." }).addStyleClass("sapUiTinyMarginBottom"),
		row([
			label("Non-focusable text:"),
			new FakeText("textPlain", { text: "highlighted phrase for testing", tooltipText: "Tooltip on plain (non-focusable) text" })
		])
	]);

	// --- Focusable text with tooltip ---
	const oFocusTextPanel = panel("Focusable text with tooltip (isolated)", [
		new Text({ text: "The phrase below is focusable (tabindex=0). Tab to focus, hover, or long-press to open the tooltip." }).addStyleClass("sapUiTinyMarginBottom"),
		row([
			label("Focusable text:"),
			new FakeText("textFocusable", { text: "focusable phrase for testing", tooltipText: "Tooltip on focusable text (Tab to focus, hover, or long-press)", focusable: true })
		])
	]);

	// --- Right-click on selected text ---
	const oRClickPanel = panel("Right-click on selected text (should NOT clear selection)", [
		new Text({ text: "Select text on the page, then right-click on the text below. The native context menu should appear and the selection should remain intact." }).addStyleClass("sapUiTinyMarginBottom"),
		row([
			label("Right-click on text:"),
			new FakeText({ text: "Selectable text with a tooltip", tooltipText: "Tooltip on selectable text — should not open while text is selected", focusable: true })
		])
	]);

	// --- Links ---
	const oLinksPanel = panel("Links - mobile long-press behavior", [
		new Text({ text: "On desktop, hover/keyboard-focus the links to see the tooltip. On touch-only devices the tooltip is disabled for links so the native context menu remains available." }).addStyleClass("sapUiTinyMarginBottom"),
		row([
			label("Link with tooltip:"),
			new FakeLink("linkSap", { text: "SAP", href: "https://sap.com", tooltipText: "Tooltip on a link (desktop only, disabled for touch-only devices)" }),
			label("Long text on link:"),
			new FakeLink({ text: "SAP (long tooltip)", href: "https://sap.com", tooltipText: LONG_TOOLTIP })
		])
	]);

	// --- Tooltip host inside Dialog / Popover / nested ---
	function containerContent(sContext) {
		return [
			new FakeButton({ text: "Button in " + sContext, tooltipText: "Tooltip on a button in the " + sContext }).addStyleClass("sapUiSmallMarginBottom"),
			new FakeText({ text: "Focusable text in " + sContext, tooltipText: "Tooltip on focusable text in the " + sContext, focusable: true }).addStyleClass("sapUiSmallMarginBottom"),
			new FakeLink({ text: "Link in " + sContext, href: "https://sap.com", tooltipText: "Tooltip on a link in the " + sContext })
		];
	}

	let oDialog;
	let oPopover;
	let oNestedDialog;
	let oNestedPopover;

	// A tooltip opened on an anchor inside a Popover / nested Popover, to verify it layers ABOVE the container.
	const oContainerTooltip = new Tooltip("ctTooltip", { text: SHORT_TOOLTIP, placement: PlacementType.Bottom });

	const oOpenDialogBtn = new Button("ctOpenDialog", {
		text: "Open Dialog",
		press: function () {
			if (!oDialog) {
				oDialog = new Dialog("ctDialog", {
					title: "Tooltip hosts inside a Dialog",
					contentWidth: "24rem",
					content: new VBox({ items: containerContent("Dialog") }).addStyleClass("sapUiSmallMargin"),
					endButton: new Button("ctDialogClose", { text: "Close", press: () => oDialog.close() })
				});
			}
			oDialog.open();
		}
	});

	const oOpenPopoverBtn = new Button("ctOpenPopover", {
		text: "Open Popover",
		press: function () {
			if (!oPopover) {
				const oPopoverAnchor = new PlainButton("ctPopoverAnchor", { text: "Anchor in popover" });
				oPopover = new Popover("ctPopover", {
					title: "Tooltip hosts inside a Popover",
					placement: PlacementType.PreferredTopOrFlip,
					content: new VBox({
						items: [
							...containerContent("Popover"),
							new HBox({ justifyContent: "Center", items: [oPopoverAnchor] }).addStyleClass("sapUiSmallMarginTop sapUiSmallMarginBottom").setWidth("100%"),
							new Button("ctPopoverShow", { text: "Show tooltip", press: () => oContainerTooltip.openBy(oPopoverAnchor, 0) })
						]
					}).addStyleClass("sapUiSmallMargin")
				});
			}
			oPopover.openBy(oOpenPopoverBtn);
		}
	});

	const oOpenNestedBtn = new Button("ctOpenNested", {
		text: "Open Popover-in-Dialog",
		press: function () {
			if (!oNestedDialog) {
				const oOpenInnerPopoverBtn = new Button("ctNestedInnerOpen", {
					text: "Open Popover inside this Dialog",
					press: function () {
						if (!oNestedPopover) {
							const oNestedAnchor = new PlainButton("ctNestedAnchor", { text: "Anchor in nested popover" });
							oNestedPopover = new Popover("ctNestedPopover", {
								title: "Popover nested in a Dialog",
								placement: PlacementType.PreferredTopOrFlip,
								content: new VBox({
									items: [
										...containerContent("nested Popover"),
										new HBox({ justifyContent: "Center", items: [oNestedAnchor] }).addStyleClass("sapUiSmallMarginTop sapUiSmallMarginBottom").setWidth("100%"),
										new Button("ctNestedShow", { text: "Show tooltip", press: () => oContainerTooltip.openBy(oNestedAnchor, 0) })
									]
								}).addStyleClass("sapUiSmallMargin")
							});
						}
						oNestedPopover.openBy(oOpenInnerPopoverBtn);
					}
				});
				oNestedDialog = new Dialog("ctNestedDialog", {
					title: "Dialog hosting a nested Popover",
					contentWidth: "26rem",
					content: new VBox({
						items: [
							new Text({ text: "This dialog contains tooltip hosts, plus a button that opens a Popover nested inside the dialog — also with tooltip hosts." }).addStyleClass("sapUiTinyMarginBottom"),
							...containerContent("Dialog"),
							oOpenInnerPopoverBtn
						]
					}).addStyleClass("sapUiSmallMargin"),
					endButton: new Button("ctNestedClose", { text: "Close", press: () => oNestedDialog.close() })
				});
			}
			oNestedDialog.open();
		}
	});

	const oContainersPanel = panel("Tooltip host inside Dialog / Popover / nested Popover-in-Dialog", [
		row([oOpenDialogBtn.addStyleClass("sapUiTinyMarginEnd"), oOpenPopoverBtn.addStyleClass("sapUiTinyMarginEnd"), oOpenNestedBtn])
	]);

	// --- Viewport corners (auto-flip placement) ---
	const oCornerTL = withPlacement(new PlainButton("cornerTL", { text: "Top-Left (Top)" }), { text: "Tooltip flips to bottom because there is no space above", placement: PlacementType.Top });
	const oCornerTR = withPlacement(new PlainButton("cornerTR", { text: "Top-Right (Right)" }), { text: "Tooltip flips to left because there is no space on the right", placement: PlacementType.Right });
	const oCornerBL = withPlacement(new PlainButton("cornerBL", { text: "Bottom-Left (Left)" }), { text: "Tooltip flips to right because there is no space on the left", placement: PlacementType.Left });
	const oCornerBR = withPlacement(new PlainButton("cornerBR", { text: "Bottom-Right (Bottom)" }), { text: "Tooltip flips to top because there is no space below", placement: PlacementType.Bottom });

	function placeCorner(oControl, sPos) {
		oControl.addEventDelegate({
			onAfterRendering: function () {
				const oStyle = oControl.getDomRef().style;
				oStyle.position = "fixed";
				oStyle.zIndex = "100";
				Object.assign(oStyle, sPos);
			}
		});
		return oControl;
	}
	placeCorner(oCornerTL, { top: "3rem", left: "0.5rem" });
	placeCorner(oCornerTR, { top: "3rem", right: "0.5rem" });
	placeCorner(oCornerBL, { bottom: "0.5rem", left: "0.5rem" });
	placeCorner(oCornerBR, { bottom: "0.5rem", right: "0.5rem" });

	const oCornerContainer = new HBox("cornerContainer", { items: [oCornerTL, oCornerTR, oCornerBL, oCornerBR], visible: false });
	const oCornerToggle = new CheckBox("cornerShow", {
		text: "Show viewport-corner buttons",
		select: function (oEvent) {
			oCornerContainer.setVisible(oEvent.getParameter("selected"));
		}
	});
	const oCornerPanel = panel("Viewport edges (auto-flip placement)", [
		new Text({ text: "The fixed-position buttons in each viewport corner use a placement that prefers off-screen. The tooltip should flip to the opposite side instead of being clipped." }).addStyleClass("sapUiTinyMarginBottom"),
		oCornerToggle,
		oCornerContainer
	]);

	new Page({
		title: "sap.ui.core.tooltip.Tooltip - showcase",
		content: [
			new VBox({
				items: [
					new Text("pageIntro", { text: "Hover or keyboard-focus the fake controls to see the tooltip. Press Esc to dismiss." }).addStyleClass("sapUiSmallMarginBottom"),
					oDefaultPanel,
					oPlacementPanel,
					oDelayPanel,
					oApiPanel,
					oVtPanel,
					oFlipPanel,
					oDialogPanel,
					oTextPanel,
					oFocusTextPanel,
					oRClickPanel,
					oLinksPanel,
					oContainersPanel,
					oCornerPanel
				]
			}).addStyleClass("sapUiContentPadding")
		]
	}).placeAt("content");

	// Focus the first button on load (regular browser behaviour) to verify the
	// tooltip does NOT open on the initial page-load focus.
	oFirstButton.addEventDelegate({
		onAfterRendering: function () {
			this.focus();
		}
	}, oFirstButton);
});
