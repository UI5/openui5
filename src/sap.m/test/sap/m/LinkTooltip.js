sap.ui.require([
	"sap/m/App",
	"sap/m/Page",
	"sap/m/Panel",
	"sap/m/HBox",
	"sap/m/VBox",
	"sap/m/Link",
	"sap/m/Label",
	"sap/m/Switch",
	"sap/m/Text",
	"sap/m/FormattedText",
	"sap/m/MessageToast",
	"sap/m/library",
	"sap/ui/core/InvisibleText",
	"sap/ui/core/Core"
], async function (App, Page, Panel, HBox, VBox, Link, Label, Switch, Text,
		FormattedText, MessageToast, mobileLibrary, InvisibleText, Core) {
	"use strict";

	await Core.ready();

	const LinkAccessibleRole = mobileLibrary.LinkAccessibleRole;
	const EmptyIndicatorMode = mobileLibrary.EmptyIndicatorMode;

	const TOOLTIP_TEXT = "Open the SAP homepage in a new tab";

	// Wraps a Link and an explanatory Text into a single labelled panel.
	function scenario(sHeading, sIntro, oLink) {
		return new Panel({
			headerText: sHeading,
			expandable: false,
			width: "40rem",
			content: [
				new Text({ text: sIntro })
					.addStyleClass("sapUiSmallMarginBegin sapUiSmallMarginBottom"),
				new HBox({
					alignItems: "Center",
					items: [oLink]
				}).addStyleClass("sapUiSmallMarginBegin")
			]
		}).addStyleClass("sapUiResponsiveMargin");
	}

	// 1. Baseline
	const oLink1 = new Link({
		id: "link_tooltip_baseline",
		text: "SAP",
		href: "https://www.sap.com",
		target: "_blank",
		tooltip: TOOLTIP_TEXT
	});

	// 2. No tooltip
	const oLink2 = new Link({
		text: "SAP (no tooltip)",
		href: "https://www.sap.com",
		target: "_blank"
	});

	// 3. Disabled with tooltip
	const oLink3 = new Link({
		text: "Disabled SAP",
		href: "https://www.sap.com",
		target: "_blank",
		enabled: false,
		tooltip: "Disabled link tooltip"
	});

	// 4. Wrapping link
	const oLink4 = new Link({
		text: "This is a very long link text that should wrap when the container is narrow enough to force a line break",
		href: "https://www.sap.com",
		target: "_blank",
		wrapping: true,
		tooltip: "Wrapping link tooltip"
	});

	// 5. Link with start icon
	const oLink5 = new Link({
		text: "SAP with start icon",
		href: "https://www.sap.com",
		target: "_blank",
		icon: "sap-icon://home",
		tooltip: "Home page"
	});

	// 6. Link with end icon
	const oLink6 = new Link({
		text: "SAP with end icon",
		href: "https://www.sap.com",
		target: "_blank",
		endIcon: "sap-icon://arrow-right",
		tooltip: "Go to SAP"
	});

	// 7. Subtle link
	const oLink7 = new Link({
		text: "Subtle SAP",
		href: "https://www.sap.com",
		target: "_blank",
		subtle: true,
		tooltip: "Subtle link tooltip"
	});

	// 8. Emphasized link
	const oLink8 = new Link({
		text: "Emphasized SAP",
		href: "https://www.sap.com",
		target: "_blank",
		emphasized: true,
		tooltip: "Emphasized link tooltip"
	});

	// 9. Empty-indicator link
	const oLink9 = new Link({
		text: "",
		href: "https://www.sap.com",
		target: "_blank",
		emptyIndicatorMode: EmptyIndicatorMode.On,
		tooltip: "Empty indicator tooltip"
	});

	// 10. accessibleRole=Button
	const oLink10 = new Link({
		text: "Action link (button role)",
		accessibleRole: LinkAccessibleRole.Button,
		tooltip: "Triggers an action, not a navigation",
		press: function () {
			MessageToast.show("Action link pressed");
		}
	});

	// 11. ariaHasPopup
	const oLink11 = new Link({
		text: "Opens a menu",
		accessibleRole: LinkAccessibleRole.Button,
		ariaHasPopup: "Menu",
		tooltip: "Opens a menu with related actions",
		press: function () {
			MessageToast.show("Menu link pressed");
		}
	});

	// 12. ariaLabelledBy triggers self-reference
	const oExternalLabel = new Label({
		text: "External label:",
		labelFor: null
	}).addStyleClass("sapUiTinyMarginEnd");
	const oLink12 = new Link({
		text: "SAP labelled externally",
		href: "https://www.sap.com",
		target: "_blank",
		tooltip: "Self-reference kicks in when ariaLabelledBy is set",
		ariaLabelledBy: [oExternalLabel]
	});

	// 13. Runtime toggle
	const oRuntimeLink = new Link({
		text: "Runtime toggle link",
		href: "https://www.sap.com",
		target: "_blank",
		tooltip: "Toggleable tooltip"
	});

	const oTooltipSwitch = new Switch({
		state: true,
		customTextOn: "On",
		customTextOff: "Off",
		change: function (oEvent) {
			oRuntimeLink.setTooltip(oEvent.getParameter("state") ? "Toggleable tooltip" : null);
			oRuntimeLink.invalidate();
		}
	});

	const oEnabledSwitch = new Switch({
		state: true,
		customTextOn: "On",
		customTextOff: "Off",
		change: function (oEvent) {
			oRuntimeLink.setEnabled(oEvent.getParameter("state"));
		}
	});

	const oRuntimePanel = new Panel({
		headerText: "13. Runtime toggle",
		expandable: false,
		width: "40rem",
		content: [
			new Text({
				text: "Flip the switches and inspect aria-describedby on the anchor. " +
					"When tooltip is Off the invisible anchor id disappears; when On it re-appears."
			}).addStyleClass("sapUiSmallMarginBegin sapUiSmallMarginBottom"),
			new VBox({
				items: [
					new HBox({
						alignItems: "Center",
						items: [oRuntimeLink]
					}).addStyleClass("sapUiSmallMarginBottom"),
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
							new Label({ text: "Enabled", labelFor: oEnabledSwitch })
								.addStyleClass("sapUiSmallMarginEnd"),
							oEnabledSwitch
						]
					})
				]
			}).addStyleClass("sapUiSmallMarginBegin")
		]
	}).addStyleClass("sapUiResponsiveMargin");

	// 15. Existing ariaDescribedBy ids + tooltip id
	const oExtraDescriptionA = new InvisibleText({
		text: "Additional describedBy text A"
	}).toStatic();
	const oExtraDescriptionB = new InvisibleText({
		text: "Additional describedBy text B"
	}).toStatic();
	const oLink15 = new Link({
		text: "SAP with extra describedBy",
		href: "https://www.sap.com",
		target: "_blank",
		tooltip: "Tooltip plus additional descriptions",
		ariaDescribedBy: [oExtraDescriptionA.getId(), oExtraDescriptionB.getId()]
	});

	const oExtraDescribedByPanel = new Panel({
		headerText: "15. Existing ariaDescribedBy + tooltip",
		expandable: false,
		width: "40rem",
		content: [
			new Text({
				text: "This link already has two ariaDescribedBy IDs. With tooltip set, aria-describedby contains both IDs plus the tooltip anchor ID."
			}).addStyleClass("sapUiSmallMarginBegin sapUiSmallMarginBottom"),
			new HBox({
				alignItems: "Center",
				items: [oLink15]
			}).addStyleClass("sapUiSmallMarginBegin")
		]
	}).addStyleClass("sapUiResponsiveMargin");

	// 14. Tab-focus sequence row
	function buildTabFocusRow() {
		const aLinks = [
			new Link({ text: "Plain", href: "https://www.sap.com", target: "_blank" }),
			new Link({ text: "With tooltip", href: "https://www.sap.com", target: "_blank", tooltip: "Tooltip on plain link" }),
			new Link({ text: "Disabled", href: "https://www.sap.com", target: "_blank", enabled: false, tooltip: "Disabled tooltip" }),
			new Link({ text: "Button role", accessibleRole: LinkAccessibleRole.Button, tooltip: "Action link tooltip",
				press: function () { MessageToast.show("Action pressed"); } }),
			new Link({ text: "Icon link", href: "https://www.sap.com", target: "_blank", icon: "sap-icon://home", tooltip: "Home page" })
		];

		return new Panel({
			headerText: "14. Tab-focus sequence (mixed links)",
			expandable: false,
			width: "60rem",
			content: [
				new Text({
					text: "Tab through the links to test focus-driven open/close and quick switching between tooltips."
				}).addStyleClass("sapUiSmallMarginBegin sapUiSmallMarginBottom"),
				new HBox({
					alignItems: "Center",
					items: aLinks.map((oLink) =>
						new HBox({ items: [oLink] }).addStyleClass("sapUiSmallMarginEnd"))
				}).addStyleClass("sapUiSmallMarginBegin")
			]
		}).addStyleClass("sapUiResponsiveMargin");
	}

	const oIntro = new FormattedText({
		htmlText:
			"Bootstrap runs with <code>data-sap-ui-xx-tooltip=&quot;enhanced&quot;</code> so each " +
			"<code>sap.m.Link</code> wires itself to <code>sap.ui.core.tooltip.TooltipEnablement</code>. " +
			"Hover or keyboard-focus a link to see the resulting tooltip; press <kbd>Esc</kbd> to dismiss. " +
			"Inspect the anchor in DevTools to verify <code>aria-describedby</code> references the invisible " +
			"tooltip span, and that no native <code>title</code> attribute is present."
	}).addStyleClass("sapUiResponsiveMargin");

	const oPage = new Page({
		title: "sap.m.Link + sap.m.Tooltip integration",
		content: [
			oIntro,
			scenario("1. Baseline", "Link with tooltip. Hover or focus shows the enhanced tooltip.", oLink1),
			scenario("2. No tooltip", "Link without tooltip. No tooltip surface appears.", oLink2),
			scenario("3. Disabled with tooltip", "Disabled link. Enhanced tooltip does not appear, but native one appears.", oLink3),
			scenario("4. Wrapping link", "Long wrapping link with tooltip.", oLink4),
			scenario("5. Start icon", "Link with a start icon and tooltip.", oLink5),
			scenario("6. End icon", "Link with an end icon and tooltip.", oLink6),
			scenario("7. Subtle", "Subtle link. aria-describedby also references the LINK_SUBTLE static id.", oLink7),
			scenario("8. Emphasized", "Emphasized link. aria-describedby also references the LINK_EMPHASIZED static id.", oLink8),
			scenario("9. Empty indicator", "Empty-indicator link with tooltip.", oLink9),
			scenario("10. accessibleRole=Button", "Link rendered with role=\"button\" and no navigation; press fires an action.", oLink10),
			scenario("11. ariaHasPopup=Menu", "Link with aria-haspopup=\"menu\".", oLink11),
			new Panel({
				headerText: "12. ariaLabelledBy (self-reference)",
				expandable: false,
				width: "40rem",
				content: [
					new Text({
						text: "External label is set. aria-labelledby contains the link's own id plus the label id; " +
							"aria-describedby contains the tooltip anchor id."
					}).addStyleClass("sapUiSmallMarginBegin sapUiSmallMarginBottom"),
					new HBox({
						alignItems: "Center",
						items: [oExternalLabel, oLink12]
					}).addStyleClass("sapUiSmallMarginBegin")
				]
			}).addStyleClass("sapUiResponsiveMargin"),
			oRuntimePanel,
			buildTabFocusRow(),
			oExtraDescribedByPanel
		]
	});

	new App({ pages: [oPage] }).placeAt("content");
});
