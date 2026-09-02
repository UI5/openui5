sap.ui.require([
	"sap/m/App",
	"sap/m/Page",
	"sap/m/Panel",
	"sap/m/HBox",
	"sap/m/VBox",
	"sap/m/Button",
	"sap/m/ToggleButton",
	"sap/m/SegmentedButton",
	"sap/m/SegmentedButtonItem",
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
], async function (App, Page, Panel, HBox, VBox, Button, ToggleButton, SegmentedButton,
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

	// Hosts a text ToggleButton and an icon-only ToggleButton side by side.
	// All switches apply to both buttons simultaneously.
	function buildToggleScenario() {
		const oTextBtn = new ToggleButton({
			text: "Save",
			tooltip: TOOLTIP_TEXT,
			press: function (oEvent) {
				MessageToast.show("ToggleButton pressed – pressed: " + oEvent.getSource().getPressed());
			}
		});
		registerShortcut(oTextBtn);

		const oIconBtn = new ToggleButton({
			icon: SAVE_ICON,
			tooltip: ICON_CUSTOM_TOOLTIP,
			press: function (oEvent) {
				MessageToast.show("Icon ToggleButton pressed – pressed: " + oEvent.getSource().getPressed());
			}
		});
		registerShortcut(oIconBtn);

		const oTextBtnNoShortcut = new ToggleButton({
			text: "Save",
			tooltip: TOOLTIP_TEXT,
			press: function (oEvent) {
				MessageToast.show("ToggleButton (no shortcut) pressed – pressed: " + oEvent.getSource().getPressed());
			}
		});

		const oIconBtnNoShortcut = new ToggleButton({
			icon: SAVE_ICON,
			tooltip: ICON_CUSTOM_TOOLTIP,
			press: function (oEvent) {
				MessageToast.show("Icon ToggleButton (no shortcut) pressed – pressed: " + oEvent.getSource().getPressed());
			}
		});

		const oTooltipSwitch = new Switch({
			state: true,
			customTextOn: "On",
			customTextOff: "Off",
			change: function (oEvent) {
				const bOn = oEvent.getParameter("state");
				oTextBtn.setTooltip(bOn ? TOOLTIP_TEXT : null);
				oIconBtn.setTooltip(bOn ? ICON_CUSTOM_TOOLTIP : null);
				oTextBtnNoShortcut.setTooltip(bOn ? TOOLTIP_TEXT : null);
				oIconBtnNoShortcut.setTooltip(bOn ? ICON_CUSTOM_TOOLTIP : null);
			}
		});

		const oPressedSwitch = new Switch({
			state: false,
			customTextOn: "On",
			customTextOff: "Off",
			change: function (oEvent) {
				const bOn = oEvent.getParameter("state");
				oTextBtn.setPressed(bOn);
				oIconBtn.setPressed(bOn);
				oTextBtnNoShortcut.setPressed(bOn);
				oIconBtnNoShortcut.setPressed(bOn);
			}
		});

		const oEnabledSwitch = new Switch({
			state: true,
			customTextOn: "On",
			customTextOff: "Off",
			change: function (oEvent) {
				const bOn = oEvent.getParameter("state");
				oTextBtn.setEnabled(bOn);
				oIconBtn.setEnabled(bOn);
				oTextBtnNoShortcut.setEnabled(bOn);
				oIconBtnNoShortcut.setEnabled(bOn);
			}
		});

		return new Panel({
			headerText: "5. ToggleButton – tooltip and shortcut",
			expandable: false,
			width: "30rem",
			content: [
				new Text({
					text: "Text and icon-only ToggleButtons, both with tooltip and shortcut. " +
						"Use Pressed and Enabled to verify tooltip behaviour across all states."
				}).addStyleClass("sapUiSmallMarginBegin sapUiSmallMarginBottom"),
				new VBox({
					items: [
						new HBox({
							alignItems: "Center",
							items: [
								new Text({ text: "No shortcut:" }).addStyleClass("sapUiSmallMarginEnd"),
								oTextBtnNoShortcut,
								new HBox({ width: "1rem" }),
								oIconBtnNoShortcut
							],
							renderType: "Bare"
						}).addStyleClass("sapUiSmallMarginBottom sapUiSmallMarginEnd"),
						new HBox({
							alignItems: "Center",
							items: [
								new Text({ text: "Shortcut:" }).addStyleClass("sapUiSmallMarginEnd"),
								oTextBtn,
								new HBox({ width: "1rem" }),
								oIconBtn
							],
							renderType: "Bare"
						}).addStyleClass("sapUiSmallMarginBottom sapUiSmallMarginEnd"),
						new HBox({
							alignItems: "Center",
							items: [
								new Label({ text: "Tooltip", labelFor: oTooltipSwitch })
									.addStyleClass("sapUiSmallMarginEnd"),
								oTooltipSwitch
							]
						}).addStyleClass("sapUiTinyMarginBottom"),
						new HBox({
							alignItems: "Center",
							items: [
								new Label({ text: "Pressed", labelFor: oPressedSwitch })
									.addStyleClass("sapUiSmallMarginEnd"),
								oPressedSwitch
							]
						}).addStyleClass("sapUiTinyMarginBottom"),
						new HBox({
							alignItems: "Center",
							items: [
								new Label({ text: "Enabled", labelFor: oEnabledSwitch })
									.addStyleClass("sapUiSmallMarginEnd"),
								oEnabledSwitch
							]
						})
					]
				}).addStyleClass("sapUiSmallMarginBegin")
			]
		}).addStyleClass("sapUiResponsiveMargin");
	}

	function buildSegmentedButtonPanel() {
		const oSeg = new SegmentedButton({
			tooltip: TOOLTIP_TEXT,
			items: [
				new SegmentedButtonItem({ text: "Day" }),
				new SegmentedButtonItem({ text: "Week" }),
				new SegmentedButtonItem({ text: "Month" })
			]
		});
		registerShortcut(oSeg);

		const oEnabledSwitch = new Switch({
			state: true,
			customTextOn: "On",
			customTextOff: "Off",
			change: function (oEvent) {
				oSeg.setEnabled(oEvent.getParameter("state"));
			}
		});

		return new Panel({
			headerText: "6. SegmentedButton – should have regular tooltip",
			expandable: false,
			width: "30rem",
			content: [
				new VBox({
					items: [
						new HBox({ items: [oSeg] }).addStyleClass("sapUiTinyMarginBottom"),
						new HBox({
							alignItems: "Center",
							items: [
								new Label({ text: "Enabled", labelFor: oEnabledSwitch })
									.addStyleClass("sapUiSmallMarginEnd"),
								oEnabledSwitch
							]
						})
					]
				}).addStyleClass("sapUiSmallMarginBegin")
			]
		}).addStyleClass("sapUiResponsiveMargin");
	}

	function buildMenuButtonPanel() {
		const oMenu = new Menu({
			items: [
				new MenuItem({ text: "Save", icon: SAVE_ICON }),
				new MenuItem({ text: "Save As..." }),
				new MenuItem({ text: "Export" })
			]
		});
		const oMenuButton = new MenuButton({
			text: "Save",
			tooltip: TOOLTIP_TEXT,
			menu: oMenu
		});
		registerShortcut(oMenuButton);

		const oMenuSplit = new Menu({
			items: [
				new MenuItem({ text: "Save", icon: SAVE_ICON }),
				new MenuItem({ text: "Save As..." }),
				new MenuItem({ text: "Export" })
			]
		});
		const oMenuButtonSplit = new MenuButton({
			text: "Save",
			tooltip: TOOLTIP_TEXT,
			buttonMode: "Split",
			menu: oMenuSplit,
			defaultAction: function () {
				MessageToast.show("Default action pressed");
			}
		});
		registerShortcut(oMenuButtonSplit);

		const oEnabledSwitch = new Switch({
			state: true,
			customTextOn: "On",
			customTextOff: "Off",
			change: function (oEvent) {
				const bOn = oEvent.getParameter("state");
				oMenuButton.setEnabled(bOn);
				oMenuButtonSplit.setEnabled(bOn);
			}
		});

		return new Panel({
			headerText: "7. MenuButton – Should have regular tooltip",
			expandable: false,
			width: "30rem",
			content: [
				new VBox({
					items: [
						new HBox({ items: [oMenuButton] }).addStyleClass("sapUiTinyMarginBottom"),
						new HBox({ items: [oMenuButtonSplit] }).addStyleClass("sapUiTinyMarginBottom"),
						new HBox({
							alignItems: "Center",
							items: [
								new Label({ text: "Enabled", labelFor: oEnabledSwitch })
									.addStyleClass("sapUiSmallMarginEnd"),
								oEnabledSwitch
							]
						})
					]
				}).addStyleClass("sapUiSmallMarginBegin")
			]
		}).addStyleClass("sapUiResponsiveMargin");
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
			buildToggleScenario(),
			buildSegmentedButtonPanel(),
			buildMenuButtonPanel()
		]
	});

	new App({ pages: [oPage] }).placeAt("content");
});
