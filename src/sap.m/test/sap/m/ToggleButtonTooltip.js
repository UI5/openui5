sap.ui.require([
	"sap/m/App",
	"sap/m/Page",
	"sap/m/Panel",
	"sap/m/HBox",
	"sap/m/VBox",
	"sap/m/ToggleButton",
	"sap/m/Switch",
	"sap/m/Label",
	"sap/m/Text",
	"sap/m/FormattedText",
	"sap/m/MessageToast",
	"sap/ui/core/Core",
	"sap/ui/core/ShortcutHintsMixin"
], async function (App, Page, Panel, HBox, VBox, ToggleButton, Switch, Label, Text,
		FormattedText, MessageToast, Core, ShortcutHintsMixin) {
	"use strict";

	await Core.ready();

	const SHORTCUT = "Ctrl+S";
	const TOOLTIP_TEXT = "Save document";
	const SAVE_ICON = "sap-icon://save";

	function registerShortcut(oControl) {
		ShortcutHintsMixin.addConfig(
			oControl,
			{ event: "press", message: SHORTCUT },
			oControl
		);
	}

	// Panel 1: text and icon-only ToggleButtons, with and without shortcut.
	// Buttons have stable IDs so visual tests can target them by ID.
	const oTextNoShortcut = new ToggleButton("toggleTextNoShortcut", {
		text: "Save",
		tooltip: TOOLTIP_TEXT,
		press: function (oEvent) {
			MessageToast.show("ToggleButton pressed – pressed: " + oEvent.getSource().getPressed());
		}
	});

	const oIconNoShortcut = new ToggleButton("toggleIconNoShortcut", {
		icon: SAVE_ICON,
		tooltip: TOOLTIP_TEXT,
		press: function (oEvent) {
			MessageToast.show("Icon ToggleButton pressed – pressed: " + oEvent.getSource().getPressed());
		}
	});

	const oTextShortcut = new ToggleButton("toggleTextShortcut", {
		text: "Save",
		tooltip: TOOLTIP_TEXT,
		press: function (oEvent) {
			MessageToast.show("ToggleButton pressed – pressed: " + oEvent.getSource().getPressed());
		}
	});
	registerShortcut(oTextShortcut);

	const oIconShortcut = new ToggleButton("toggleIconShortcut", {
		icon: SAVE_ICON,
		tooltip: TOOLTIP_TEXT,
		press: function (oEvent) {
			MessageToast.show("Icon ToggleButton pressed – pressed: " + oEvent.getSource().getPressed());
		}
	});
	registerShortcut(oIconShortcut);

	const oTooltipSwitch1 = new Switch({
		state: true, customTextOn: "On", customTextOff: "Off",
		change: function (oEvent) {
			const bOn = oEvent.getParameter("state");
			oTextNoShortcut.setTooltip(bOn ? TOOLTIP_TEXT : null);
			oIconNoShortcut.setTooltip(bOn ? TOOLTIP_TEXT : null);
			oTextShortcut.setTooltip(bOn ? TOOLTIP_TEXT : null);
			oIconShortcut.setTooltip(bOn ? TOOLTIP_TEXT : null);
		}
	});

	const oPressedSwitch1 = new Switch({
		state: false, customTextOn: "On", customTextOff: "Off",
		change: function (oEvent) {
			const bOn = oEvent.getParameter("state");
			oTextNoShortcut.setPressed(bOn);
			oIconNoShortcut.setPressed(bOn);
			oTextShortcut.setPressed(bOn);
			oIconShortcut.setPressed(bOn);
		}
	});

	const oEnabledSwitch1 = new Switch({
		state: true, customTextOn: "On", customTextOff: "Off",
		change: function (oEvent) {
			const bOn = oEvent.getParameter("state");
			oTextNoShortcut.setEnabled(bOn);
			oIconNoShortcut.setEnabled(bOn);
			oTextShortcut.setEnabled(bOn);
			oIconShortcut.setEnabled(bOn);
		}
	});

	const oPanel1 = new Panel({
		headerText: "1. ToggleButton – tooltip and shortcut",
		expandable: false, width: "30rem",
		content: [
			new Text({
				text: "Text and icon-only ToggleButtons, with and without shortcut. " +
					"Use Pressed and Enabled to verify tooltip behaviour across all states."
			}).addStyleClass("sapUiSmallMarginBegin sapUiSmallMarginBottom"),
			new VBox({
				items: [
					new HBox({
						alignItems: "Center", renderType: "Bare",
						items: [
							new Text({ text: "No shortcut:" }).addStyleClass("sapUiSmallMarginEnd"),
							oTextNoShortcut,
							new HBox({ width: "1rem" }),
							oIconNoShortcut
						]
					}).addStyleClass("sapUiSmallMarginBottom sapUiSmallMarginEnd"),
					new HBox({
						alignItems: "Center", renderType: "Bare",
						items: [
							new Text({ text: "Shortcut:" }).addStyleClass("sapUiSmallMarginEnd"),
							oTextShortcut,
							new HBox({ width: "1rem" }),
							oIconShortcut
						]
					}).addStyleClass("sapUiSmallMarginBottom sapUiSmallMarginEnd"),
					new HBox({ alignItems: "Center", items: [
						new Label({ text: "Tooltip", labelFor: oTooltipSwitch1 }).addStyleClass("sapUiSmallMarginEnd"),
						oTooltipSwitch1
					]}).addStyleClass("sapUiTinyMarginBottom"),
					new HBox({ alignItems: "Center", items: [
						new Label({ text: "Pressed", labelFor: oPressedSwitch1 }).addStyleClass("sapUiSmallMarginEnd"),
						oPressedSwitch1
					]}).addStyleClass("sapUiTinyMarginBottom"),
					new HBox({ alignItems: "Center", items: [
						new Label({ text: "Enabled", labelFor: oEnabledSwitch1 }).addStyleClass("sapUiSmallMarginEnd"),
						oEnabledSwitch1
					]})
				]
			}).addStyleClass("sapUiSmallMarginBegin")
		]
	}).addStyleClass("sapUiResponsiveMargin");

	// Panel 2: icon-only, tooltip from icon label (no explicit tooltip set).
	const oIconLabelNoShortcut = new ToggleButton("toggleIconLabelNoShortcut", { icon: SAVE_ICON });
	const oIconLabelShortcut = new ToggleButton("toggleIconLabelShortcut", { icon: SAVE_ICON });
	registerShortcut(oIconLabelShortcut);

	const oEnabledSwitch2 = new Switch({
		state: true, customTextOn: "On", customTextOff: "Off",
		change: function (oEvent) {
			const bOn = oEvent.getParameter("state");
			oIconLabelNoShortcut.setEnabled(bOn);
			oIconLabelShortcut.setEnabled(bOn);
		}
	});

	const oPanel2 = new Panel({
		headerText: "2. ToggleButton – icon-only, tooltip from icon label",
		expandable: false, width: "30rem",
		content: [new VBox({ items: [
			new Text({ text: "No explicit tooltip — tooltip comes from the icon's accessible name ('save')."
				+ " Left: no shortcut → 'save'. Right: with shortcut → 'save (Ctrl+S)'."
			}).addStyleClass("sapUiTinyMarginBottom"),
			new HBox({
				alignItems: "Center", renderType: "Bare",
				items: [
					new Text({ text: "No shortcut:" }).addStyleClass("sapUiSmallMarginEnd"),
					oIconLabelNoShortcut,
					new HBox({ width: "2rem" }),
					new Text({ text: "With shortcut:" }).addStyleClass("sapUiSmallMarginEnd"),
					oIconLabelShortcut
				]
			}).addStyleClass("sapUiSmallMarginBottom"),
			new HBox({ alignItems: "Center", items: [
				new Label({ text: "Enabled", labelFor: oEnabledSwitch2 }).addStyleClass("sapUiSmallMarginEnd"),
				oEnabledSwitch2
			]})
		]}).addStyleClass("sapUiSmallMarginBegin")]
	}).addStyleClass("sapUiResponsiveMargin");

	// Panel 3: text ToggleButton with shortcut but no tooltip — no popup expected.
	const oTextNoTooltip = new ToggleButton("toggleTextNoTooltip", { text: "Save" });
	registerShortcut(oTextNoTooltip);

	const oEnabledSwitch3 = new Switch({
		state: true, customTextOn: "On", customTextOff: "Off",
		change: function (oEvent) { oTextNoTooltip.setEnabled(oEvent.getParameter("state")); }
	});

	const oPanel3 = new Panel({
		headerText: "3. ToggleButton – shortcut without tooltip (no popup expected)",
		expandable: false, width: "30rem",
		content: [new VBox({ items: [
			new Text({ text: "Shortcut (" + SHORTCUT + ") registered but no tooltip set."
				+ " No custom tooltip popup should appear on hover or focus."
			}).addStyleClass("sapUiTinyMarginBottom"),
			new HBox({ items: [oTextNoTooltip] }).addStyleClass("sapUiSmallMarginBottom"),
			new HBox({ alignItems: "Center", items: [
				new Label({ text: "Enabled", labelFor: oEnabledSwitch3 }).addStyleClass("sapUiSmallMarginEnd"),
				oEnabledSwitch3
			]})
		]}).addStyleClass("sapUiSmallMarginBegin")]
	}).addStyleClass("sapUiResponsiveMargin");

	const oIntro = new FormattedText({
		htmlText:
			"Bootstrap runs with <code>data-sap-ui-xx-tooltip=&quot;enhanced&quot;</code> so each " +
			"<code>sap.m.ToggleButton</code> wires itself to <code>sap.ui.core.tooltip.TooltipEnablement</code>. " +
			"The tooltip popup appears on hover and keyboard focus regardless of the pressed state. " +
			"Press <kbd>Esc</kbd> to dismiss any open tooltip."
	}).addStyleClass("sapUiResponsiveMargin");

	const oPage = new Page({
		title: "sap.m.ToggleButton + sap.m.Tooltip integration",
		content: [oIntro, oPanel1, oPanel2, oPanel3]
	});

	new App({ pages: [oPage] }).placeAt("content");
});
