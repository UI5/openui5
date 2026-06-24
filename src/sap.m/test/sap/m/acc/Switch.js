sap.ui.define([
	"sap/m/library",
	"sap/ui/core/library",
	"sap/m/Title",
	"sap/ui/layout/VerticalLayout",
	"sap/m/Switch",
	"sap/m/Label",
	"sap/m/App",
	"sap/m/Page"
], function(mobileLibrary, coreLibrary, Title, VerticalLayout, Switch, Label, App, Page) {
	"use strict";

	// shortcut for sap.ui.core.TitleLevel
	var TitleLevel = coreLibrary.TitleLevel;

	// shortcut for sap.m.SwitchType
	var SwitchType = mobileLibrary.SwitchType;

	function getTitle(sText) {
		return new Title({
			text: sText,
			level: TitleLevel.H2,
			titleStyle: TitleLevel.H5,
			wrapping: true
		}).addStyleClass("sapUiMediumMarginTop");
	}

	var oDefaultType = new VerticalLayout({
		content: [
			getTitle("Default type"),

			new Label({text: "Enable notifications", wrapping: true, labelFor: "notificationSwitch"}),
			new Switch("notificationSwitch", {}),

			new Label({text: "Dark mode", wrapping: true, labelFor: "darkModeSwitch"}),
			new Switch("darkModeSwitch", { state: true }),

			new Label({text: "Enable WiFi (system setting unavailable)", wrapping: true, labelFor: "wifiSwitch"}),
			new Switch("wifiSwitch", { enabled: false }),

			new Label("doNotDisturbLabel", {text: "Do not disturb", wrapping: true}),
			new Switch({ ariaLabelledBy: "doNotDisturbLabel" })
		]
	}).addStyleClass("sapUiContentPadding");

	var oDefaultCustomTextLayout = new VerticalLayout({
		content: [
			getTitle("Default type with custom text"),

			new Label({ text: "Location services", wrapping: true, labelFor: "locationToggle" }),
			new Switch("locationToggle", { customTextOn: "On", customTextOff: "Off" }),

			new Label({ text: "Bluetooth (unavailable in offline mode)", wrapping: true, labelFor: "bluetoothToggle" }),
			new Switch("bluetoothToggle", { customTextOn: "On", customTextOff: "Off", enabled: false })
		]
	}).addStyleClass("sapUiContentPadding");

	var oAcceptRejectLayout = new VerticalLayout({
		content: [
			getTitle("AcceptReject type"),

			new Label({ text: "Accept terms and conditions", labelFor: "termsAcceptSwitch", wrapping: true }),
			new Switch("termsAcceptSwitch", { type: SwitchType.AcceptReject }),

			new Label({ text: "Accept privacy policy (locked)", labelFor: "privacyAcceptSwitch", wrapping: true }),
			new Switch("privacyAcceptSwitch", { type: SwitchType.AcceptReject, enabled: false })
		]
	}).addStyleClass("sapUiContentPadding");

	var oApp = new App(),
		oPage = new Page({
			title: "Switch Accessibility Test Page",
			titleLevel: TitleLevel.H1,
			content: [
				oDefaultType,
				oDefaultCustomTextLayout,
				oAcceptRejectLayout
			]
		});

	oApp.addPage(oPage);
	oApp.placeAt("body");
});
