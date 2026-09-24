sap.ui.require([
	"sap/m/App",
	"sap/m/Page",
	"sap/m/Panel",
	"sap/m/HBox",
	"sap/m/VBox",
	"sap/m/Button",
	"sap/m/SegmentedButton",
	"sap/m/SegmentedButtonItem",
	"sap/m/Switch",
	"sap/m/Label",
	"sap/m/Text",
	"sap/m/FormattedText",
	"sap/m/MessageToast",
	"sap/ui/core/Core",
	"sap/ui/core/ShortcutHintsMixin"
], async function (App, Page, Panel, HBox, VBox, Button, SegmentedButton,
		SegmentedButtonItem, MenuButton, Menu, MenuItem, Switch, Label, Text,
		FormattedText, MessageToast, Core, ShortcutHintsMixin) {
	"use strict";

	await Core.ready();

	const SHORTCUT = "Ctrl+S";
	const TOOLTIP_TEXT = "TOOLTIP_TEXT";
	const ICON_CUSTOM_TOOLTIP = "Save document";
	const SAVE_ICON = "sap-icon://save";

	// Registers a Ctrl+S shortcut hint on a Button via ShortcutHintsMixin.
	// The mixin has no public "remove" API, so this is one-way: once a
	// scenario's shortcut is added, the corresponding Switch is locked.
	function registerShortcut(oButton) {
		ShortcutHintsMixin.addConfig(
			oButton,
			{ event: "press", message: SHORTCUT },
			oButton
		);
	}

	// Builds one scenario panel: the host Button under test with switches for
	// tooltip, enabled state, and optionally a Ctrl+S shortcut (one-way).
	// Pass hideShortcutSwitch: true when the shortcut state is fixed.
	function buildScenario(mConfig) {
		const sTooltipText = mConfig.tooltipText || TOOLTIP_TEXT;
		const oHost = new Button({
			id: mConfig.id,
			text: mConfig.iconOnly ? null : "Save",
			icon: mConfig.iconOnly ? SAVE_ICON : null,
			tooltip: mConfig.tooltip ? sTooltipText : null,
			press: function () {
				MessageToast.show("Save pressed (" + mConfig.heading + ")");
			}
		});
		if (mConfig.shortcut) {
			registerShortcut(oHost);
		}

		const oTooltipSwitch = new Switch({
			state: !!oHost.getTooltip(),
			customTextOn: "On",
			customTextOff: "Off",
			change: function (oEvent) {
				oHost.setTooltip(oEvent.getParameter("state") ? sTooltipText : null);
			}
		});

		const oEnabledSwitch = new Switch({
			state: true,
			customTextOn: "On",
			customTextOff: "Off",
			change: function (oEvent) {
				oHost.setEnabled(oEvent.getParameter("state"));
			}
		});

		const aRows = [
			new HBox({
				alignItems: "Center",
				items: [oHost]
			}).addStyleClass("sapUiSmallMarginBottom"),
			new HBox({
				alignItems: "Center",
				items: [
					new Label({
						text: mConfig.iconOnly ? "Custom Tooltip" : "Tooltip",
						labelFor: oTooltipSwitch
					}).addStyleClass("sapUiSmallMarginEnd"),
					oTooltipSwitch
				]
			}).addStyleClass("sapUiTinyMarginBottom"),
			new HBox({
				alignItems: "Center",
				items: [
					new Label({ text: "Enabled", labelFor: oEnabledSwitch })
						.addStyleClass("sapUiSmallMarginEnd"),
					oEnabledSwitch
				]
			}).addStyleClass("sapUiTinyMarginBottom")
		];

		if (!mConfig.hideShortcutSwitch) {
			const oShortcutSwitch = new Switch({
				state: !!mConfig.shortcut,
				enabled: !mConfig.shortcut,
				customTextOn: "On",
				customTextOff: "Off",
				change: function (oEvent) {
					if (oEvent.getParameter("state")) {
						registerShortcut(oHost);
						oHost.invalidate();
						oShortcutSwitch.setEnabled(false);
					}
				}
			});
			aRows.push(new HBox({
				alignItems: "Center",
				items: [
					new Label({
						text: "Shortcut (" + SHORTCUT + ")",
						labelFor: oShortcutSwitch
					}).addStyleClass("sapUiSmallMarginEnd"),
					oShortcutSwitch
				]
			}));
		}

		return new Panel({
			headerText: mConfig.heading,
			expandable: false,
			width: "30rem",
			content: [
				new Text({ text: mConfig.intro })
					.addStyleClass("sapUiSmallMarginBegin sapUiSmallMarginBottom"),
				new VBox({ items: aRows }).addStyleClass("sapUiSmallMarginBegin")
			]
		}).addStyleClass("sapUiResponsiveMargin");
	}

	function buildSegmentedButtonPanel() {
		// ---- Panel 6: shared tooltip + shortcut on container, text items ----
		const oSeg = new SegmentedButton({
			tooltip: TOOLTIP_TEXT,
			items: [
				new SegmentedButtonItem({ text: "Day" }),
				new SegmentedButtonItem({ text: "Week" }),
				new SegmentedButtonItem({ text: "Month" })
			]
		});
		registerShortcut(oSeg);
		const oEnabledSwitch6 = new Switch({
			state: true, customTextOn: "On", customTextOff: "Off",
			change: function (oEvent) { oSeg.setEnabled(oEvent.getParameter("state")); }
		});
		const oPanel6 = new Panel({
			headerText: "6. SegmentedButton – shared tooltip + shortcut on container",
			expandable: false, width: "30rem",
			content: [new VBox({ items: [
				new Text({ text: "All segments share the container tooltip and shortcut."
					+ " Disable to verify no popup appears." }).addStyleClass("sapUiTinyMarginBottom"),
				new HBox({ items: [oSeg] }).addStyleClass("sapUiTinyMarginBottom"),
				new HBox({ alignItems: "Center", items: [
					new Label({ text: "Enabled", labelFor: oEnabledSwitch6 }).addStyleClass("sapUiSmallMarginEnd"),
					oEnabledSwitch6
				]})
			]}).addStyleClass("sapUiSmallMarginBegin")]
		}).addStyleClass("sapUiResponsiveMargin");

		// ---- Panel 7: icon-only segments, shared container tooltip + shortcut ----
		const oSegIcons = new SegmentedButton({
			tooltip: TOOLTIP_TEXT,
			items: [
				new SegmentedButtonItem({ icon: "sap-icon://grid" }),
				new SegmentedButtonItem({ icon: "sap-icon://list" }),
				new SegmentedButtonItem({ icon: "sap-icon://table-view" })
			]
		});
		registerShortcut(oSegIcons);
		const oEnabledSwitch7 = new Switch({
			state: true, customTextOn: "On", customTextOff: "Off",
			change: function (oEvent) { oSegIcons.setEnabled(oEvent.getParameter("state")); }
		});
		const oPanel7 = new Panel({
			headerText: "7. SegmentedButton – icon-only segments",
			expandable: false, width: "30rem",
			content: [new VBox({ items: [
				new Text({ text: "Icon-only segments inherit the container tooltip and shortcut."
					+ " The icon label is accessible to screen readers via aria-label." }).addStyleClass("sapUiTinyMarginBottom"),
				new HBox({ items: [oSegIcons] }).addStyleClass("sapUiTinyMarginBottom"),
				new HBox({ alignItems: "Center", items: [
					new Label({ text: "Enabled", labelFor: oEnabledSwitch7 }).addStyleClass("sapUiSmallMarginEnd"),
					oEnabledSwitch7
				]})
			]}).addStyleClass("sapUiSmallMarginBegin")]
		}).addStyleClass("sapUiResponsiveMargin");

		// ---- Panel 8: per-item tooltip and per-item shortcut ----
		const oSegPerItem = new SegmentedButton({
			items: [
				new SegmentedButtonItem({ text: "Day", tooltip: "Switch to daily view" }),
				new SegmentedButtonItem({ text: "Week", tooltip: "Switch to weekly view" }),
				new SegmentedButtonItem({ text: "Month", tooltip: "Switch to monthly view" })
			]
		});
		const [oBtn8a, oBtn8b, oBtn8c] = oSegPerItem.getButtons();
		ShortcutHintsMixin.addConfig(oBtn8a, { event: "press", message: "Ctrl+1" }, oBtn8a);
		ShortcutHintsMixin.addConfig(oBtn8b, { event: "press", message: "Ctrl+2" }, oBtn8b);
		ShortcutHintsMixin.addConfig(oBtn8c, { event: "press", message: "Ctrl+3" }, oBtn8c);
		const oEnabledSwitch8 = new Switch({
			state: true, customTextOn: "On", customTextOff: "Off",
			change: function (oEvent) { oSegPerItem.setEnabled(oEvent.getParameter("state")); }
		});
		const oPanel8 = new Panel({
			headerText: "8. SegmentedButton – per-item tooltip and shortcut",
			expandable: false, width: "30rem",
			content: [new VBox({ items: [
				new Text({ text: "Each segment has its own tooltip and shortcut (Ctrl+1/2/3)."
					+ " Hovering each segment should show a different popup." }).addStyleClass("sapUiTinyMarginBottom"),
				new HBox({ items: [oSegPerItem] }).addStyleClass("sapUiTinyMarginBottom"),
				new HBox({ alignItems: "Center", items: [
					new Label({ text: "Enabled", labelFor: oEnabledSwitch8 }).addStyleClass("sapUiSmallMarginEnd"),
					oEnabledSwitch8
				]})
			]}).addStyleClass("sapUiSmallMarginBegin")]
		}).addStyleClass("sapUiResponsiveMargin");

		// ---- Panel 9: shortcut without tooltip (no popup expected) ----
		const oSegNoTooltip = new SegmentedButton({
			items: [
				new SegmentedButtonItem({ text: "Day" }),
				new SegmentedButtonItem({ text: "Week" }),
				new SegmentedButtonItem({ text: "Month" })
			]
		});
		registerShortcut(oSegNoTooltip);
		const oEnabledSwitch9 = new Switch({
			state: true, customTextOn: "On", customTextOff: "Off",
			change: function (oEvent) { oSegNoTooltip.setEnabled(oEvent.getParameter("state")); }
		});
		const oPanel9 = new Panel({
			headerText: "9. SegmentedButton – shortcut without tooltip (no popup expected)",
			expandable: false, width: "30rem",
			content: [new VBox({ items: [
				new Text({ text: "A shortcut (" + SHORTCUT + ") is registered but no tooltip is set."
					+ " No custom tooltip popup should appear on hover or focus." }).addStyleClass("sapUiTinyMarginBottom"),
				new HBox({ items: [oSegNoTooltip] }).addStyleClass("sapUiTinyMarginBottom"),
				new HBox({ alignItems: "Center", items: [
					new Label({ text: "Enabled", labelFor: oEnabledSwitch9 }).addStyleClass("sapUiSmallMarginEnd"),
					oEnabledSwitch9
				]})
			]}).addStyleClass("sapUiSmallMarginBegin")]
		}).addStyleClass("sapUiResponsiveMargin");

		// ---- Panel 10: mixed — first item overrides parent tooltip, others inherit ----
		const oSegMixed = new SegmentedButton({
			tooltip: TOOLTIP_TEXT,
			items: [
				new SegmentedButtonItem({ text: "Day", tooltip: "Custom day tooltip" }),
				new SegmentedButtonItem({ text: "Week" }),
				new SegmentedButtonItem({ text: "Month" })
			]
		});
		registerShortcut(oSegMixed);
		const oEnabledSwitch10 = new Switch({
			state: true, customTextOn: "On", customTextOff: "Off",
			change: function (oEvent) { oSegMixed.setEnabled(oEvent.getParameter("state")); }
		});
		const oPanel10 = new Panel({
			headerText: "10. SegmentedButton – mixed: own vs. inherited tooltip",
			expandable: false, width: "30rem",
			content: [new VBox({ items: [
				new Text({ text: "'Day' has its own tooltip ('Custom day tooltip') — shortcut not shown"
					+ " because the shortcut is on the container, not the item."
					+ " 'Week' and 'Month' inherit the container tooltip + shortcut." }).addStyleClass("sapUiTinyMarginBottom"),
				new HBox({ items: [oSegMixed] }).addStyleClass("sapUiTinyMarginBottom"),
				new HBox({ alignItems: "Center", items: [
					new Label({ text: "Enabled", labelFor: oEnabledSwitch10 }).addStyleClass("sapUiSmallMarginEnd"),
					oEnabledSwitch10
				]})
			]}).addStyleClass("sapUiSmallMarginBegin")]
		}).addStyleClass("sapUiResponsiveMargin");

		// ---- Panel 11: icon-only segments, per-item shortcut, tooltip from icon label ----
		const oSegIconShortcut = new SegmentedButton({
			items: [
				new SegmentedButtonItem({ icon: "sap-icon://grid" }),
				new SegmentedButtonItem({ icon: "sap-icon://list" }),
				new SegmentedButtonItem({ icon: "sap-icon://table-view" })
			]
		});
		const [oBtn11a, oBtn11b, oBtn11c] = oSegIconShortcut.getButtons();
		ShortcutHintsMixin.addConfig(oBtn11a, { event: "press", message: "Ctrl+1" }, oBtn11a);
		ShortcutHintsMixin.addConfig(oBtn11b, { event: "press", message: "Ctrl+2" }, oBtn11b);
		ShortcutHintsMixin.addConfig(oBtn11c, { event: "press", message: "Ctrl+3" }, oBtn11c);
		const oEnabledSwitch11 = new Switch({
			state: true, customTextOn: "On", customTextOff: "Off",
			change: function (oEvent) { oSegIconShortcut.setEnabled(oEvent.getParameter("state")); }
		});
		const oPanel11 = new Panel({
			headerText: "11. SegmentedButton – icon-only with per-item shortcut (icon label as tooltip)",
			expandable: false, width: "30rem",
			content: [new VBox({ items: [
				new Text({ text: "No explicit tooltip — each segment's tooltip comes from the icon's"
					+ " accessible name (e.g. 'grid', 'list', 'table view')."
					+ " Per-item shortcuts (Ctrl+1/2/3) are on the inner buttons."
					+ " Expected: '<icon label> (Ctrl+N)' popup per segment." }).addStyleClass("sapUiTinyMarginBottom"),
				new HBox({ items: [oSegIconShortcut] }).addStyleClass("sapUiTinyMarginBottom"),
				new HBox({ alignItems: "Center", items: [
					new Label({ text: "Enabled", labelFor: oEnabledSwitch11 }).addStyleClass("sapUiSmallMarginEnd"),
					oEnabledSwitch11
				]})
			]}).addStyleClass("sapUiSmallMarginBegin")]
		}).addStyleClass("sapUiResponsiveMargin");

		return [oPanel6, oPanel7, oPanel8, oPanel9, oPanel10, oPanel11];
	}

	// Row of mixed buttons for tab-focus testing: text/icon-only crossed with
	// tooltip/no-tooltip/shortcut so quick Tab switching exercises the
	// open-on-focus, close-on-blur and "switch from one tooltip to another"
	// flows in a single place.
	function buildTabFocusRow() {
		const aButtons = [
			new Button({ text: "Plain" }),
			new Button({ text: "With tooltip", tooltip: "Tooltip on text button" }),
			new Button({ text: "With shortcut" }),
			new Button({ text: "Tooltip + shortcut", tooltip: "Save the document" }),
			new Button({ icon: SAVE_ICON }),
			new Button({ icon: SAVE_ICON, tooltip: "Custom icon tooltip" }),
			new Button({ icon: SAVE_ICON, tooltip: "Save (with shortcut)" }),
			new Button({ id: "btnDisabled", text: "Disabled", tooltip: "Tooltip on disabled button", enabled: false }),
			new Button({ icon: SAVE_ICON, tooltip: "Disabled icon tooltip", enabled: false })
		];
		registerShortcut(aButtons[2]);
		registerShortcut(aButtons[3]);
		registerShortcut(aButtons[6]);

		return new Panel({
			headerText: "4. Tab-focus sequence (mixed buttons)",
			expandable: false,
			width: "30rem",
			content: [
				new Text({
					text: "Tab through the buttons to test quick focus switching between buttons with and without tooltips"
				}).addStyleClass("sapUiSmallMarginBegin sapUiSmallMarginBottom"),
				new HBox({
					alignItems: "Center",
					items: aButtons.map((oBtn) =>
						new HBox({ items: [oBtn] }).addStyleClass("sapUiTinyMarginEnd"))
				}).addStyleClass("sapUiSmallMarginBegin")
			]
		}).addStyleClass("sapUiResponsiveMargin");
	}

	const oIntro = new FormattedText({
		htmlText:
			"Bootstrap runs with <code>data-sap-ui-xx-tooltip=&quot;enhanced&quot;</code> so each " +
			"<code>sap.m.Button</code> wires itself to <code>sap.ui.core.tooltip.TooltipEnablement</code>. " +
			"Hover or keyboard-focus a button to see the resulting tooltip; press <kbd>Esc</kbd> " +
			"to dismiss. Use the switches to toggle the tooltip text and to add a keyboard " +
			"shortcut after the button is already rendered. Pressing the host Save button shows " +
			"a toast so you can confirm the activation."
	}).addStyleClass("sapUiResponsiveMargin");

	const oPage = new Page({
		title: "sap.m.Button + sap.m.Tooltip integration",
		content: [
			oIntro,
			buildScenario({
				id: "btnTooltipOnly",
				heading: "1. Button without shortcut",
				intro: "Hover or focus shows the tooltip text. Toggle tooltip or enabled off to verify the respective behaviours.",
				tooltip: true,
				shortcut: false,
				hideShortcutSwitch: true
			}),
			buildScenario({
				id: "btnTooltipShortcut",
				heading: "2. Button with shortcut (" + SHORTCUT + ")",
				intro: "Hover or focus shows <tooltip> (<shortcut>) in a single tooltip surface. Toggle the tooltip off to verify only the shortcut hint remains.",
				tooltip: true,
				shortcut: true,
				hideShortcutSwitch: true
			}),
			buildScenario({
				id: "btnIconOnly",
				heading: "3. Icon-only button",
				intro: "No tooltip or shortcut by default — the Button falls back to the icon's name. Toggle tooltip or shortcut on to see them applied.",
				tooltip: false,
				tooltipText: ICON_CUSTOM_TOOLTIP,
				shortcut: false,
				iconOnly: true
			}),
			buildTabFocusRow(),
			...buildSegmentedButtonPanel()
		]
	});

	new App({ pages: [oPage] }).placeAt("content");
});
