sap.ui.require([
	"local/FakeControls",
	"sap/m/Page",
	"sap/m/Panel",
	"sap/m/Text",
	"sap/m/Label",
	"sap/m/Button",
	"sap/m/Dialog",
	"sap/m/Popover",
	"sap/m/VBox",
	"sap/m/HBox",
	"sap/ui/core/Core"
], async function (FakeControls, Page, Panel, Text, Label, Button, Dialog, Popover, VBox, HBox, Core) {
	"use strict";

	const { FakeButton, FakeText, FakeLink } = FakeControls;
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
		return new Panel({
			headerText: sTitle,
			content: aContent
		}).addStyleClass("sapUiSmallMarginBottom");
	}

	function row(aContent) {
		return new HBox({
			items: aContent,
			alignItems: "Center",
			wrap: "Wrap"
		}).addStyleClass("sapUiTinyMarginBottom").setWidth("100%");
	}

	// --- Buttons with tooltip text ---
	const oButtonsPanel = panel("Buttons with tooltip text", [
		row([
			label("Default:"),
			new FakeButton({ text: "Default", tooltipText: "Default tooltip" }),
			new FakeButton({ text: "Short text", tooltipText: "Short" }),
			new FakeButton({ text: "Long text", tooltipText: LONG_TOOLTIP }),
			new FakeButton({ text: "Very long text", tooltipText: VERY_LONG_TOOLTIP })
		])
	]);

	// --- Text with tooltip (non-focusable) ---
	const oTextPanel = panel("Text with tooltip (no focus, no extended tab chain)", [
		new Text({ text: "The phrase below is a non-focusable fake text with a tooltip. On desktop, hover it. On mobile, long-press it." }).addStyleClass("sapUiTinyMarginBottom"),
		row([
			label("Non-focusable text:"),
			new FakeText({ text: "highlighted phrase for testing", tooltipText: "Tooltip on plain (non-focusable) text" })
		])
	]);

	// --- Focusable text with tooltip ---
	const oFocusTextPanel = panel("Focusable text with tooltip (isolated)", [
		new Text({ text: "The phrase below is focusable (tabindex=0). Tab to focus it, hover, or long-press to open the tooltip." }).addStyleClass("sapUiTinyMarginBottom"),
		row([
			label("Focusable text:"),
			new FakeText({ text: "focusable phrase for testing", tooltipText: "Tooltip on focusable text (Tab to focus, hover, or long-press)", focusable: true })
		])
	]);

	// --- Right-click on selected text ---
	const oRClickPanel = panel("Right-click on selected text (should NOT clear selection)", [
		new Text({ text: "Select text on the page, then right-click on the text below. The native context menu should appear and the selection should remain intact — the tooltip must not open while a selection exists." }).addStyleClass("sapUiTinyMarginBottom"),
		row([
			label("Right-click on text:"),
			new FakeText({ text: "Selectable text with a tooltip", tooltipText: "Tooltip on selectable text — should not open while text is selected", focusable: true })
		])
	]);

	// --- Links ---
	const oLinksPanel = panel("Links - mobile long-press behavior", [
		new Text({ text: "On desktop, hover/keyboard-focus the links to see the tooltip. On touch-only devices the tooltip is disabled for links so the native context menu remains available on long-press." }).addStyleClass("sapUiTinyMarginBottom"),
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

	new Page({
		title: "sap.ui.core.tooltip.TooltipEnablement - showcase",
		content: [
			new VBox({
				items: [
					new Text({ text: "Hover or keyboard-focus the fake controls to see the tooltip wired through TooltipEnablement. Press Esc to dismiss." }).addStyleClass("sapUiSmallMarginBottom"),
					oButtonsPanel,
					oTextPanel,
					oFocusTextPanel,
					oRClickPanel,
					oLinksPanel,
					oContainersPanel
				]
			}).addStyleClass("sapUiContentPadding")
		]
	}).placeAt("content");
});
