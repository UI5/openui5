sap.ui.require([
	"sap/m/App",
	"sap/m/Page",
	"sap/m/Panel",
	"sap/m/HBox",
	"sap/m/VBox",
	"sap/m/MenuButton",
	"sap/m/Menu",
	"sap/m/MenuItem",
	"sap/m/Switch",
	"sap/m/Label",
	"sap/m/Text",
	"sap/m/FormattedText",
	"sap/m/MessageToast",
	"sap/ui/core/Core",
	"sap/ui/core/ShortcutHintsMixin"
], async function (App, Page, Panel, HBox, VBox, MenuButton, Menu, MenuItem,
		Switch, Label, Text, FormattedText, MessageToast, Core, ShortcutHintsMixin) {
	"use strict";

	await Core.ready();

	const SHORTCUT = "Ctrl+S";
	const TOOLTIP_TEXT = "Save document";
	const SAVE_ICON = "sap-icon://save";

	function makeMenu() {
		return new Menu({
			items: [
				new MenuItem({ text: "Save", icon: SAVE_ICON }),
				new MenuItem({ text: "Save As..." }),
				new MenuItem({ text: "Export" })
			]
		});
	}

	function registerShortcut(oControl) {
		ShortcutHintsMixin.addConfig(
			oControl,
			{ event: "press", message: SHORTCUT },
			oControl
		);
	}

	function buildSwitchRow(sLabel, oSwitch) {
		return new HBox({
			alignItems: "Center",
			items: [
				new Label({ text: sLabel, labelFor: oSwitch }).addStyleClass("sapUiSmallMarginEnd"),
				oSwitch
			]
		}).addStyleClass("sapUiTinyMarginBottom");
	}

	// Builds one scenario panel for a MenuButton under test.
	// mConfig: { id, heading, intro, buttonMode, icon, tooltip, shortcut, hideShortcutSwitch }
	function buildScenario(mConfig) {
		const oMenuButton = new MenuButton({
			id: mConfig.id,
			text: mConfig.icon ? undefined : "Save",
			icon: mConfig.icon || undefined,
			tooltip: mConfig.tooltip ? TOOLTIP_TEXT : undefined,
			buttonMode: mConfig.buttonMode || "Regular",
			menu: makeMenu(),
			defaultAction: function () {
				MessageToast.show("Default action (" + mConfig.heading + ")");
			}
		});
		if (mConfig.shortcut) {
			registerShortcut(oMenuButton);
		}

		const oTooltipSwitch = new Switch({
			state: !!oMenuButton.getTooltip(),
			customTextOn: "On",
			customTextOff: "Off",
			change: function (oEvent) {
				oMenuButton.setTooltip(oEvent.getParameter("state") ? TOOLTIP_TEXT : undefined);
			}
		});

		const oEnabledSwitch = new Switch({
			state: true,
			customTextOn: "On",
			customTextOff: "Off",
			change: function (oEvent) {
				oMenuButton.setEnabled(oEvent.getParameter("state"));
			}
		});

		const aRows = [
			new HBox({ items: [oMenuButton] }).addStyleClass("sapUiSmallMarginBottom"),
			buildSwitchRow(mConfig.icon ? "Custom Tooltip" : "Tooltip", oTooltipSwitch),
			buildSwitchRow("Enabled", oEnabledSwitch)
		];

		if (!mConfig.hideShortcutSwitch) {
			const oShortcutSwitch = new Switch({
				state: !!mConfig.shortcut,
				enabled: !mConfig.shortcut,
				customTextOn: "On",
				customTextOff: "Off",
				change: function (oEvent) {
					if (oEvent.getParameter("state")) {
						registerShortcut(oMenuButton);
						oMenuButton.invalidate();
						oShortcutSwitch.setEnabled(false);
					}
				}
			});
			aRows.push(buildSwitchRow("Shortcut (" + SHORTCUT + ")", oShortcutSwitch));
		}

		return new Panel({
			headerText: mConfig.heading,
			expandable: false,
			width: "30rem",
			content: [
				new Text({ text: mConfig.intro }).addStyleClass("sapUiSmallMarginBegin sapUiSmallMarginBottom"),
				new VBox({ items: aRows }).addStyleClass("sapUiSmallMarginBegin")
			]
		}).addStyleClass("sapUiResponsiveMargin");
	}

	// Tab-focus row: Regular and Split buttons side by side to exercise
	// open-on-focus / close-on-blur / switching between tooltip surfaces.
	function buildTabFocusRow() {
		const aButtons = [
			new MenuButton({ text: "Plain", menu: makeMenu() }),
			new MenuButton({ text: "With tooltip", tooltip: "Regular mode tooltip", menu: makeMenu() }),
			new MenuButton({ text: "Tooltip + shortcut", tooltip: "Save the document", menu: makeMenu() }),
			new MenuButton({ text: "Split plain", buttonMode: "Split", menu: makeMenu() }),
			new MenuButton({ text: "Split tooltip", tooltip: "Split mode tooltip", buttonMode: "Split", menu: makeMenu(),
				defaultAction: function () { MessageToast.show("Split default action"); }
			}),
			new MenuButton({ text: "Split + shortcut", tooltip: "Save (split)", buttonMode: "Split", menu: makeMenu(),
				defaultAction: function () { MessageToast.show("Split + shortcut default action"); }
			}),
			new MenuButton({ icon: SAVE_ICON, tooltip: "Icon-only regular", menu: makeMenu() }),
			new MenuButton({ icon: SAVE_ICON, buttonMode: "Split", menu: makeMenu(),
				defaultAction: function () { MessageToast.show("Icon split default action"); }
			})
		];
		registerShortcut(aButtons[2]);
		registerShortcut(aButtons[5]);

		return new Panel({
			headerText: "5. Tab-focus sequence (Regular and Split)",
			expandable: false,
			width: "60rem",
			content: [
				new Text({
					text: "Tab through to test focus switching between Regular and Split MenuButtons with and without tooltips."
				}).addStyleClass("sapUiSmallMarginBegin sapUiSmallMarginBottom"),
				new HBox({
					wrap: "Wrap",
					alignItems: "Center",
					items: aButtons.map(function (oBtn) {
						return new HBox({ items: [oBtn] }).addStyleClass("sapUiTinyMarginEnd sapUiTinyMarginBottom");
					})
				}).addStyleClass("sapUiSmallMarginBegin")
			]
		}).addStyleClass("sapUiResponsiveMargin");
	}

	const oIntro = new FormattedText({
		htmlText:
			"Bootstrap runs with <code>data-sap-ui-xx-tooltip=&quot;enhanced&quot;</code> so each " +
			"<code>sap.m.MenuButton</code> wires itself to <code>sap.ui.core.tooltip.TooltipEnablement</code>. " +
			"In <b>Regular</b> mode the tooltip appears on the single button. " +
			"In <b>Split</b> mode the tooltip appears on the text/action part; the arrow button " +
			"carries its own fixed &ldquo;Open Menu&rdquo; tooltip. " +
			"Shortcuts registered on the outer <code>MenuButton</code> are picked up by the inner text button. " +
			"Press <kbd>Esc</kbd> to dismiss any open tooltip."
	}).addStyleClass("sapUiResponsiveMargin");

	const oPage = new Page({
		title: "sap.m.MenuButton + sap.m.Tooltip integration",
		content: [
			oIntro,
			buildScenario({
				id: "mbRegularTooltip",
				heading: "1. Regular mode – text button with tooltip",
				intro: "Tooltip appears on the button. Toggle tooltip or enabled to verify behaviour.",
				buttonMode: "Regular",
				tooltip: true,
				shortcut: false,
				hideShortcutSwitch: true
			}),
			buildScenario({
				id: "mbRegularShortcut",
				heading: "2. Regular mode – tooltip and shortcut (" + SHORTCUT + ")",
				intro: "Tooltip and shortcut are combined into a single tooltip surface.",
				buttonMode: "Regular",
				tooltip: true,
				shortcut: true,
				hideShortcutSwitch: true
			}),
			buildScenario({
				id: "mbRegularIcon",
				heading: "3. Regular mode – icon-only",
				intro: "No tooltip set by default — falls back to icon name. Toggle tooltip on to see the custom text.",
				buttonMode: "Regular",
				icon: SAVE_ICON,
				tooltip: false
			}),
			buildScenario({
				id: "mbSplitTooltip",
				heading: "4. Split mode – text button with tooltip",
				intro: "Tooltip appears on the text/action part. The arrow button always shows its own fixed tooltip.",
				buttonMode: "Split",
				tooltip: true,
				shortcut: false,
				hideShortcutSwitch: true
			}),
			buildScenario({
				id: "mbSplitShortcut",
				heading: "5. Split mode – tooltip and shortcut (" + SHORTCUT + ")",
				intro: "Shortcut registered on the outer MenuButton is resolved through to the text button tooltip surface.",
				buttonMode: "Split",
				tooltip: true,
				shortcut: true,
				hideShortcutSwitch: true
			}),
			buildScenario({
				id: "mbSplitIcon",
				heading: "6. Split mode – icon-only",
				intro: "No tooltip set by default — falls back to icon name on the text part. Toggle tooltip on to apply a custom text.",
				buttonMode: "Split",
				icon: SAVE_ICON,
				tooltip: false
			}),
			buildTabFocusRow()
		]
	});

	new App({ pages: [oPage] }).placeAt("content");
});
