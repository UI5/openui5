sap.ui.define([
	"sap/m/App",
	"sap/m/Page",
	"sap/m/Label",
	"sap/m/Link",
	"sap/m/Title",
	"sap/ui/layout/VerticalLayout",
	"sap/ui/core/library"
], function(App, Page, Label, Link, Title, VerticalLayout, coreLibrary) {
	"use strict";

	// shortcut for sap.ui.core.TitleLevel
	var TitleLevel = coreLibrary.TitleLevel;

	function getTitle(sText) {
		return new Title({
			text: sText,
			level: TitleLevel.H2,
			wrapping: true,
			titleStyle: TitleLevel.H5
		}).addStyleClass("sapUiMediumMarginTop");
	}

	var oRegularLinksLayout = new VerticalLayout({
		content: [
			getTitle("Regular Links"),

			new Label({ text: "With href:", wrapping: true, labelFor: "destination1" }).addStyleClass("sapUiSmallMarginTop"),
			new Link("destination1", { text: "destination 1", href: "https://www.sap.com" }),

			new Label({ text: "Without href:", wrapping: true, labelFor: "destination2" }).addStyleClass("sapUiSmallMarginTop"),
			new Link("destination2", { text: "destination 2" }),

			new Label("regularLinkLabelledBy", { text: "Using ariaLabelledBy association:", wrapping: true }).addStyleClass("sapUiSmallMarginTop"),
			new Link({ text: "destination 3", href: "https://www.sap.com", ariaLabelledBy: "regularLinkLabelledBy" }),

			new Label("regularLinkDescribedBy", { text: "Using ariaDescribedBy association:", wrapping: true }).addStyleClass("sapUiSmallMarginTop"),
			new Link({ text: "destination 4", href: "https://www.sap.com", ariaDescribedBy: "regularLinkDescribedBy" }),

			new Label({ text: "With tooltip:", wrapping: true, labelFor: "destination5" }).addStyleClass("sapUiSmallMarginTop"),
			new Link("destination5", { text: "destination 5", href: "https://www.sap.com", tooltip: "Opens in a new tab or window", target: "_blank" })
		]
	}).addStyleClass("sapUiContentPadding");

	var oSubtleLinksLayout = new VerticalLayout({
		content: [
			getTitle("Subtle Links"),

			new Label({ text: "With href:", wrapping: true, labelFor: "destination6" }).addStyleClass("sapUiSmallMarginTop"),
			new Link("destination6", { text: "destination 6", href: "https://www.sap.com", subtle: true }),

			new Label({ text: "Without href:", wrapping: true, labelFor: "destination7" }).addStyleClass("sapUiSmallMarginTop"),
			new Link("destination7", { text: "destination 7", subtle: true }),

			new Label("subtleLinkLabelledBy", { text: "Using ariaLabelledBy association:", wrapping: true }).addStyleClass("sapUiSmallMarginTop"),
			new Link({ text: "destination 8", href: "https://www.sap.com", ariaLabelledBy: "subtleLinkLabelledBy", subtle: true }),

			new Label("subtleLinkDescribedBy", { text: "Using ariaDescribedBy association:", wrapping: true }).addStyleClass("sapUiSmallMarginTop"),
			new Link({ text: "destination 9", href: "https://www.sap.com", ariaDescribedBy: "subtleLinkDescribedBy", subtle: true }),

			new Label({ text: "With tooltip:", wrapping: true, labelFor: "destination10" }).addStyleClass("sapUiSmallMarginTop"),
			new Link("destination10", { text: "destination 10", href: "https://www.sap.com", subtle: true, tooltip: "Opens in a new tab or window", target: "_blank" })
		]
	}).addStyleClass("sapUiContentPadding");

	var oEmphasizedLayout = new VerticalLayout({
		content: [
			getTitle("Emphasized Links"),

			new Label({ text: "With href:", wrapping: true, labelFor: "destination11" }).addStyleClass("sapUiSmallMarginTop"),
			new Link("destination11", { text: "destination 11", href: "https://www.sap.com", emphasized: true }),

			new Label({ text: "Without href:", wrapping: true, labelFor: "destination12" }).addStyleClass("sapUiSmallMarginTop"),
			new Link("destination12", { text: "destination 12", emphasized: true }),

			new Label("emphasizedLinkLabelledBy", { text: "Using ariaLabelledBy association:", wrapping: true }).addStyleClass("sapUiSmallMarginTop"),
			new Link({ text: "destination 13", href: "https://www.sap.com", ariaLabelledBy: "emphasizedLinkLabelledBy", emphasized: true }),

			new Label("emphasizedLinkDescribedBy", { text: "Using ariaDescribedBy association:", wrapping: true }).addStyleClass("sapUiSmallMarginTop"),
			new Link({ text: "destination 14", href: "https://www.sap.com", ariaDescribedBy: "emphasizedLinkDescribedBy", emphasized: true }),

			new Label({ text: "With tooltip:", wrapping: true, labelFor: "destination15" }).addStyleClass("sapUiSmallMarginTop"),
			new Link("destination15", { text: "destination 15", href: "https://www.sap.com", emphasized: true, tooltip: "Opens in a new tab or window", target: "_blank" })
		]
	}).addStyleClass("sapUiContentPadding");

	var oCombinedLayout = new VerticalLayout({
		content: [
			getTitle("Combined Links (Subtle & Emphasized)"),

			new Label({ text: "With href:", wrapping: true, labelFor: "destination16" }).addStyleClass("sapUiSmallMarginTop"),
			new Link("destination16", { text: "destination 16", href: "https://www.sap.com", subtle: true, emphasized: true }),

			new Label({ text: "Without href:", wrapping: true, labelFor: "destination17" }).addStyleClass("sapUiSmallMarginTop"),
			new Link("destination17", { text: "destination 17", subtle: true, emphasized: true }),

			new Label("combinedLinkLabelledBy", { text: "Using ariaLabelledBy association:", wrapping: true }).addStyleClass("sapUiSmallMarginTop"),
			new Link({ text: "destination 18", href: "https://www.sap.com", ariaLabelledBy: "combinedLinkLabelledBy", subtle: true, emphasized: true }),

			new Label("combinedLinkDescribedBy", { text: "Using ariaDescribedBy association:", wrapping: true }).addStyleClass("sapUiSmallMarginTop"),
			new Link({ text: "destination 19", href: "https://www.sap.com", ariaDescribedBy: "combinedLinkDescribedBy", subtle: true, emphasized: true }),

			new Label({ text: "With tooltip:", wrapping: true, labelFor: "destination20" }).addStyleClass("sapUiSmallMarginTop"),
			new Link("destination20", { text: "destination 20", href: "https://www.sap.com", subtle: true, emphasized: true, tooltip: "Opens in a new tab or window", target: "_blank" })
		]
	}).addStyleClass("sapUiContentPadding");

	var oApp = new App(),
		oPage = new Page({
			title: "Link Accessibility Test Page",
			titleLevel: TitleLevel.H1,
			content: [
				oRegularLinksLayout,
				oSubtleLinksLayout,
				oEmphasizedLayout,
				oCombinedLayout
			]
		});

	oApp.addPage(oPage);
	oApp.placeAt("body");
});
