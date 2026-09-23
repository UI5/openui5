sap.ui.require([
	"sap/m/App",
	"sap/m/Page",
	"sap/m/Panel",
	"sap/m/VBox",
	"sap/m/MessageStrip",
	"sap/m/Link",
	"sap/m/Text",
	"sap/m/FormattedText",
	"sap/ui/core/Core"
], async function (App, Page, Panel, VBox, MessageStrip, Link, Text,
		FormattedText, Core) {
	"use strict";

	await Core.ready();

	// Wraps a MessageStrip and an explanatory Text into a single labelled panel.
	function scenario(sHeading, sIntro, oStrip) {
		return new Panel({
			headerText: sHeading,
			expandable: false,
			width: "40rem",
			content: [
				new Text({ text: sIntro })
					.addStyleClass("sapUiSmallMarginBegin sapUiSmallMarginBottom"),
				new VBox({
					items: [oStrip]
				}).addStyleClass("sapUiSmallMarginBegin sapUiSmallMarginEnd")
			]
		}).addStyleClass("sapUiResponsiveMargin");
	}

	// 1. Close button, no link
	const oStrip1 = new MessageStrip({
		text: "Information message with a close button.",
		type: "Information",
		showIcon: true,
		showCloseButton: true
	});

	// 2. No close button, no link
	const oStrip2 = new MessageStrip({
		text: "Success message without a close button and without a link.",
		type: "Success",
		showIcon: true,
		showCloseButton: false
	});

	// 3. Link (end of message) + close button
	const oStrip3 = new MessageStrip({
		text: "Warning message with a trailing link and a close button.",
		type: "Warning",
		showIcon: true,
		showCloseButton: true,
		link: new Link({
			text: "Learn more",
			href: "https://www.sap.com",
			target: "_blank",
			tooltip: "Open the SAP homepage in a new tab"
		})
	});

	// 4. Link (end of message), no close button
	const oStrip4 = new MessageStrip({
		text: "Error message with a trailing link but no close button.",
		type: "Error",
		showIcon: true,
		showCloseButton: false,
		link: new Link({
			text: "Contact support",
			href: "https://www.sap.com",
			target: "_blank",
			tooltip: "Open a support request"
		})
	});

	// 5. Link inside the text (formatted-text placeholder) + close button
	const oStrip5 = new MessageStrip({
		text: "Formatted message with an inline %%0 replacing the placeholder.",
		type: "Information",
		showIcon: true,
		showCloseButton: true,
		enableFormattedText: true,
		controls: [
			new Link({
				text: "link",
				href: "https://www.sap.com",
				target: "_blank",
				tooltip: "Inline link tooltip"
			})
		]
	});

	// 6. No close button, no link, plain text (baseline)
	const oStrip6 = new MessageStrip({
		text: "Plain information message: no close button, no link.",
		type: "Information",
		showIcon: false,
		showCloseButton: false
	});

	const oIntro = new FormattedText({
		htmlText:
			"Bootstrap runs with <code>data-sap-ui-xx-tooltip=&quot;enhanced&quot;</code>. " +
			"<code>sap.m.MessageStrip</code> itself has no tooltip, but its inner " +
			"<code>_closeButton</code> (a <code>sap.m.Button</code>) and any " +
			"<code>sap.m.Link</code> in the <code>link</code> or <code>controls</code> " +
			"aggregation each wire themselves to <code>sap.ui.core.tooltip.TooltipEnablement</code>. " +
			"Hover or keyboard-focus the close button or a link to see the enhanced tooltip; " +
			"press <kbd>Esc</kbd> to dismiss. Inspect the anchor in DevTools to verify " +
			"<code>aria-describedby</code> references the invisible tooltip span."
	}).addStyleClass("sapUiResponsiveMargin");

	const oPage = new Page({
		title: "sap.m.MessageStrip + sap.m.Tooltip integration",
		content: [
			oIntro,
			scenario("1. Close button, no link", "Close button has a built-in tooltip. Hover or focus it.", oStrip1),
			scenario("2. No close button, no link", "No interactive element, so no enhanced tooltip surface appears.", oStrip2),
			scenario("3. Link + close button", "Both the trailing link and the close button expose enhanced tooltips.", oStrip3),
			scenario("4. Link, no close button", "Only the trailing link exposes an enhanced tooltip.", oStrip4),
			scenario("5. Inline link in text", "Link replaces the %%0 placeholder in the formatted text and exposes a tooltip.", oStrip5),
			scenario("6. Plain (baseline)", "No close button and no link; nothing to enhance.", oStrip6)
		]
	});

	new App({ pages: [oPage] }).placeAt("content");
});
