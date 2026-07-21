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
	const oDefaultPanel = panel("Text and default placement", [
		row([
			label("Default (VerticalPreferredTop):"),
			new FakeButton({ text: "Default", tooltipText: "Default tooltip" }),
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
			pair("Left:", withPlacement(new PlainButton({ text: "Left" }), { text: "Left", placement: PlacementType.Left })),
			pair("Right:", withPlacement(new PlainButton({ text: "Right" }), { text: "Right", placement: PlacementType.Right }))
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
			pair("delay = 0:", withPlacement(new PlainButton({ text: "Immediate" }), { text: "Opens immediately (delay 0)", delay: 0 })),
			pair("delay = 500 (default):", withPlacement(new PlainButton({ text: "Default" }), { text: "Default 500ms delay", delay: 500 })),
			pair("delay = 1500:", withPlacement(new PlainButton({ text: "Slow" }), { text: "Slow 1500ms delay", delay: 1500 }))
		])
	]);

	// --- Programmatic API: openBy / close ---
	const oAnchor = new PlainButton({ text: "Anchor" });
	const oApiTooltip = new Tooltip({ text: "Opened programmatically via Tooltip#openBy" });
	const oApiPanel = panel("Programmatic API: openBy / close", [
		row([
			pair("Anchor:", oAnchor),
			new Button({ text: "openBy(anchor)", press: () => oApiTooltip.openBy(oAnchor, 0) }).addStyleClass("sapUiTinyMarginEnd"),
			new Button({ text: "close(0)", press: () => oApiTooltip.close(0) })
		])
	]);

	// --- Text with tooltip (non-focusable) ---
	const oTextPanel = panel("Text with tooltip (no focus, no extended tab chain)", [
		new Text({ text: "The phrase below is a non-focusable fake text with a tooltip. On desktop, hover it; on mobile, long-press it." }).addStyleClass("sapUiTinyMarginBottom"),
		row([
			label("Non-focusable text:"),
			new FakeText({ text: "highlighted phrase for testing", tooltipText: "Tooltip on plain (non-focusable) text" })
		])
	]);

	// --- Focusable text with tooltip ---
	const oFocusTextPanel = panel("Focusable text with tooltip (isolated)", [
		new Text({ text: "The phrase below is focusable (tabindex=0). Tab to focus, hover, or long-press to open the tooltip." }).addStyleClass("sapUiTinyMarginBottom"),
		row([
			label("Focusable text:"),
			new FakeText({ text: "focusable phrase for testing", tooltipText: "Tooltip on focusable text (Tab to focus, hover, or long-press)", focusable: true })
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
			new FakeLink({ text: "SAP", href: "https://sap.com", tooltipText: "Tooltip on a link (desktop only, disabled for touch-only devices)" }),
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

	const oOpenDialogBtn = new Button({
		text: "Open Dialog",
		press: function () {
			if (!oDialog) {
				oDialog = new Dialog({
					title: "Tooltip hosts inside a Dialog",
					contentWidth: "24rem",
					content: new VBox({ items: containerContent("Dialog") }).addStyleClass("sapUiSmallMargin"),
					endButton: new Button({ text: "Close", press: () => oDialog.close() })
				});
			}
			oDialog.open();
		}
	});

	const oOpenPopoverBtn = new Button({
		text: "Open Popover",
		press: function () {
			if (!oPopover) {
				oPopover = new Popover({
					title: "Tooltip hosts inside a Popover",
					placement: "Bottom",
					content: new VBox({ items: containerContent("Popover") }).addStyleClass("sapUiSmallMargin")
				});
			}
			oPopover.openBy(oOpenPopoverBtn);
		}
	});

	const oOpenNestedBtn = new Button({
		text: "Open Popover-in-Dialog",
		press: function () {
			if (!oNestedDialog) {
				const oOpenInnerPopoverBtn = new Button({
					text: "Open Popover inside this Dialog",
					press: function () {
						if (!oNestedPopover) {
							oNestedPopover = new Popover({
								title: "Popover nested in a Dialog",
								placement: "Bottom",
								content: new VBox({ items: containerContent("nested Popover") }).addStyleClass("sapUiSmallMargin")
							});
						}
						oNestedPopover.openBy(oOpenInnerPopoverBtn);
					}
				});
				oNestedDialog = new Dialog({
					title: "Dialog hosting a nested Popover",
					contentWidth: "26rem",
					content: new VBox({
						items: [
							new Text({ text: "This dialog contains tooltip hosts, plus a button that opens a Popover nested inside the dialog — also with tooltip hosts." }).addStyleClass("sapUiTinyMarginBottom"),
							...containerContent("Dialog"),
							oOpenInnerPopoverBtn
						]
					}).addStyleClass("sapUiSmallMargin"),
					endButton: new Button({ text: "Close", press: () => oNestedDialog.close() })
				});
			}
			oNestedDialog.open();
		}
	});

	const oContainersPanel = panel("Tooltip host inside Dialog / Popover / nested Popover-in-Dialog", [
		row([oOpenDialogBtn.addStyleClass("sapUiTinyMarginEnd"), oOpenPopoverBtn.addStyleClass("sapUiTinyMarginEnd"), oOpenNestedBtn])
	]);

	// --- Viewport corners (auto-flip placement) ---
	const oCornerTL = withPlacement(new PlainButton({ text: "Top-Left (Top)" }), { text: "Tooltip flips to bottom because there is no space above", placement: PlacementType.Top });
	const oCornerTR = withPlacement(new PlainButton({ text: "Top-Right (Right)" }), { text: "Tooltip flips to left because there is no space on the right", placement: PlacementType.Right });
	const oCornerBL = withPlacement(new PlainButton({ text: "Bottom-Left (Left)" }), { text: "Tooltip flips to right because there is no space on the left", placement: PlacementType.Left });
	const oCornerBR = withPlacement(new PlainButton({ text: "Bottom-Right (Bottom)" }), { text: "Tooltip flips to top because there is no space below", placement: PlacementType.Bottom });

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

	const oCornerContainer = new HBox({ items: [oCornerTL, oCornerTR, oCornerBL, oCornerBR], visible: false });
	const oCornerToggle = new CheckBox({
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
					new Text({ text: "Hover or keyboard-focus the fake controls to see the tooltip. Press Esc to dismiss." }).addStyleClass("sapUiSmallMarginBottom"),
					oDefaultPanel,
					oPlacementPanel,
					oDelayPanel,
					oApiPanel,
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
});
