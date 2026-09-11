sap.ui.require([
	"sap/m/App",
	"sap/m/Page",
	"sap/m/Panel",
	"sap/m/HBox",
	"sap/m/VBox",
	"sap/m/SegmentedButton",
	"sap/m/SegmentedButtonItem",
	"sap/m/Switch",
	"sap/m/Label",
	"sap/m/Text",
	"sap/m/FormattedText",
	"sap/ui/core/Core",
	"sap/ui/core/ShortcutHintsMixin"
], async function (App, Page, Panel, HBox, VBox, SegmentedButton, SegmentedButtonItem,
		Switch, Label, Text, FormattedText, Core, ShortcutHintsMixin) {
	"use strict";

	await Core.ready();

	const SHORTCUT = "Ctrl+S";
	const TOOLTIP_TEXT = "Save document";

	function registerShortcut(oControl) {
		ShortcutHintsMixin.addConfig(
			oControl,
			{ event: "press", message: SHORTCUT },
			oControl
		);
	}

	function buildEnabledSwitch(oControl) {
		return new Switch({
			state: true, customTextOn: "On", customTextOff: "Off",
			change: function (oEvent) { oControl.setEnabled(oEvent.getParameter("state")); }
		});
	}

	function buildPanel(sHeading, sIntro, oSeg, oEnabledSwitch) {
		return new Panel({
			headerText: sHeading,
			expandable: false, width: "30rem",
			content: [new VBox({ items: [
				new Text({ text: sIntro }).addStyleClass("sapUiTinyMarginBottom"),
				new HBox({ items: [oSeg] }).addStyleClass("sapUiTinyMarginBottom"),
				new HBox({ alignItems: "Center", items: [
					new Label({ text: "Enabled", labelFor: oEnabledSwitch })
						.addStyleClass("sapUiSmallMarginEnd"),
					oEnabledSwitch
				]})
			]}).addStyleClass("sapUiSmallMarginBegin")]
		}).addStyleClass("sapUiResponsiveMargin");
	}

	// Panel 1: shared container tooltip + shortcut, text items.
	// Items have stable IDs so visual tests can target the <li> elements by ID.
	const oSeg1 = new SegmentedButton({
		tooltip: TOOLTIP_TEXT,
		items: [
			new SegmentedButtonItem("segSharedItem0", { text: "Day" }),
			new SegmentedButtonItem("segSharedItem1", { text: "Week" }),
			new SegmentedButtonItem("segSharedItem2", { text: "Month" })
		]
	});
	registerShortcut(oSeg1);
	const oPanel1 = buildPanel(
		"1. Shared tooltip + shortcut on container",
		"All segments share the container tooltip and shortcut (" + SHORTCUT + ")."
			+ " Disable to verify no popup appears.",
		oSeg1, buildEnabledSwitch(oSeg1)
	);

	// Panel 2: icon-only segments, shared container tooltip + shortcut.
	const oSeg2 = new SegmentedButton({
		tooltip: TOOLTIP_TEXT,
		items: [
			new SegmentedButtonItem({ icon: "sap-icon://grid" }),
			new SegmentedButtonItem({ icon: "sap-icon://list" }),
			new SegmentedButtonItem({ icon: "sap-icon://table-view" })
		]
	});
	registerShortcut(oSeg2);
	const oPanel2 = buildPanel(
		"2. Icon-only segments, shared tooltip + shortcut",
		"Icon-only segments inherit the container tooltip and shortcut."
			+ " The icon label is accessible to screen readers via aria-label.",
		oSeg2, buildEnabledSwitch(oSeg2)
	);

	// Panel 3: per-item tooltip and per-item shortcut.
	// Items have stable IDs so visual tests can target the <li> elements by ID.
	const oSeg3 = new SegmentedButton({
		items: [
			new SegmentedButtonItem("segPerItemDay",
				{ text: "Day", tooltip: "Switch to daily view" }),
			new SegmentedButtonItem("segPerItemWeek",
				{ text: "Week", tooltip: "Switch to weekly view" }),
			new SegmentedButtonItem("segPerItemMonth",
				{ text: "Month", tooltip: "Switch to monthly view" })
		]
	});
	const [oBtn3a, oBtn3b, oBtn3c] = oSeg3.getButtons();
	ShortcutHintsMixin.addConfig(oBtn3a, { event: "press", message: "Ctrl+1" }, oBtn3a);
	ShortcutHintsMixin.addConfig(oBtn3b, { event: "press", message: "Ctrl+2" }, oBtn3b);
	ShortcutHintsMixin.addConfig(oBtn3c, { event: "press", message: "Ctrl+3" }, oBtn3c);
	const oPanel3 = buildPanel(
		"3. Per-item tooltip and shortcut",
		"Each segment has its own tooltip and shortcut (Ctrl+1/2/3)."
			+ " Hovering each segment shows a different popup.",
		oSeg3, buildEnabledSwitch(oSeg3)
	);

	// Panel 4: shortcut without tooltip — no popup expected.
	const oSeg4 = new SegmentedButton({
		items: [
			new SegmentedButtonItem({ text: "Day" }),
			new SegmentedButtonItem({ text: "Week" }),
			new SegmentedButtonItem({ text: "Month" })
		]
	});
	registerShortcut(oSeg4);
	const oPanel4 = buildPanel(
		"4. Shortcut without tooltip (no popup expected)",
		"A shortcut (" + SHORTCUT + ") is registered but no tooltip is set."
			+ " No custom tooltip popup should appear on hover or focus.",
		oSeg4, buildEnabledSwitch(oSeg4)
	);

	// Panel 5: mixed — first item has own tooltip, others inherit container tooltip.
	const oSeg5 = new SegmentedButton({
		tooltip: TOOLTIP_TEXT,
		items: [
			new SegmentedButtonItem({ text: "Day", tooltip: "Custom day tooltip" }),
			new SegmentedButtonItem({ text: "Week" }),
			new SegmentedButtonItem({ text: "Month" })
		]
	});
	registerShortcut(oSeg5);
	const oPanel5 = buildPanel(
		"5. Mixed: own vs. inherited tooltip",
		"'Day' has its own tooltip — shortcut is not shown because the shortcut"
			+ " is on the container, not the item."
			+ " 'Week' and 'Month' inherit the container tooltip + shortcut.",
		oSeg5, buildEnabledSwitch(oSeg5)
	);

	// Panel 6: icon-only segments, per-item shortcut, tooltip from icon label.
	const oSeg6 = new SegmentedButton({
		items: [
			new SegmentedButtonItem({ icon: "sap-icon://grid" }),
			new SegmentedButtonItem({ icon: "sap-icon://list" }),
			new SegmentedButtonItem({ icon: "sap-icon://table-view" })
		]
	});
	const [oBtn6a, oBtn6b, oBtn6c] = oSeg6.getButtons();
	ShortcutHintsMixin.addConfig(oBtn6a, { event: "press", message: "Ctrl+1" }, oBtn6a);
	ShortcutHintsMixin.addConfig(oBtn6b, { event: "press", message: "Ctrl+2" }, oBtn6b);
	ShortcutHintsMixin.addConfig(oBtn6c, { event: "press", message: "Ctrl+3" }, oBtn6c);
	const oPanel6 = buildPanel(
		"6. Icon-only with per-item shortcut (icon label as tooltip)",
		"No explicit tooltip — each segment's tooltip comes from the icon's accessible"
			+ " name (e.g. 'Grid', 'List', 'Table View')."
			+ " Per-item shortcuts (Ctrl+1/2/3) are on the inner buttons."
			+ " Expected: '<icon label> (Ctrl+N)' popup per segment.",
		oSeg6, buildEnabledSwitch(oSeg6)
	);

	const oIntro = new FormattedText({
		htmlText:
			"Bootstrap runs with <code>data-sap-ui-xx-tooltip=&quot;enhanced&quot;</code> so each " +
			"inner button of <code>sap.m.SegmentedButton</code> wires itself to " +
			"<code>sap.ui.core.tooltip.TooltipEnablement</code>. " +
			"A tooltip set on a segment item is shown directly; if no item tooltip is set, " +
			"the container tooltip is used as fallback. " +
			"Shortcuts registered on the container are forwarded to the inner button tooltip surface. " +
			"Press <kbd>Esc</kbd> to dismiss any open tooltip."
	}).addStyleClass("sapUiResponsiveMargin");

	const oPage = new Page({
		title: "sap.m.SegmentedButton + sap.m.Tooltip integration",
		content: [oIntro, oPanel1, oPanel2, oPanel3, oPanel4, oPanel5, oPanel6]
	});

	new App({ pages: [oPage] }).placeAt("content");
});
