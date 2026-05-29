sap.ui.define([
	"sap/ui/core/InvisibleText",
	"sap/m/MessageToast",
	"sap/m/Page",
	"sap/m/Avatar",
	"sap/m/Text",
	"sap/m/VBox",
	"sap/ui/layout/Grid",
	"sap/m/LightBox",
	"sap/m/LightBoxItem",
	"sap/m/App"
], function(InvisibleText, MessageToast, Page, Avatar, Text, VBox, Grid, LightBox, LightBoxItem, App) {
	"use strict";

	new InvisibleText("avatar_label", {text: "My label"}).toStatic();

	function onAvatarPress(oEvent) {
		MessageToast.show(oEvent.getSource().getId() + " pressed");
	}

	function createAvatarItem(oAvatar, sDescription) {
		return new VBox({
			alignItems: "Center",
			items: [
				oAvatar,
				new Text({
					text: sDescription
				}).addStyleClass("sapUiSmallMarginTop")
			]
		});
	}

	var oPage = new Page("avatar-page", {
		title: "sap.m.Avatar",
		titleLevel: "H1",
		content: [
			new Grid({
				defaultSpan: "XL2 L3 M6 S6",
				content: [
					createAvatarItem(new Avatar("defaultXSSquareAvatar", {
						displaySize: "XS",
						displayShape: "Square",
						tooltip: "XS size Avatar"
					}), "XS square avatar"),
					createAvatarItem(new Avatar("defaultAvatar", {
						tooltip: "S size Avatar"
					}), "Default avatar"),
					createAvatarItem(new Avatar("decorativeAvatar", {
						decorative: true,
						tooltip: "S size Avatar decorative"
					}), "Decorative avatar"),
					createAvatarItem(new Avatar("initialsMCircleAvatar", {
						initials: "BP",
						displaySize: "M",
						tooltip: "М size Avatar with initials"
					}), "Avatar with initials"),
					createAvatarItem(new Avatar("iconLAvatar", {
						src: "sap-icon://lab",
						displaySize: "L",
						tooltip: "L size Avatar with icon"
					}), "Avatar with icon"),
					createAvatarItem(new Avatar("imageXL", {
						src: "images/Woman_avatar_01.png",
						displaySize: "XL",
						tooltip: "XL size Avatar with image"
					}), "Avatar with image"),
					// if image cannot be found, the initials will be shown if provided
					createAvatarItem(new Avatar("imageXL2", {
						initials: "YY",
						src: "images/cannotfind_Woman_avatar_01.png",
						displaySize: "XL",
						tooltip: "XL size Avatar with initials"
					}), "Invalid image source with initials fallback"),
					createAvatarItem(new Avatar("imageXLSquareCover", {
						ariaLabelledBy: "avatar_label",
						tooltip: "XL Avatar with Image with cover fit type",
						src: "images/Screw_avatar_01.jpg",
						displaySize: "XL",
						displayShape: "Square",
						imageFitType: "Cover",
						press: onAvatarPress
					}), "Square image avatar with Cover fit"),
					createAvatarItem(new Avatar("imageXLSquareContain", {
						ariaLabelledBy: "avatar_label",
						tooltip: "XL Avatar with Image with contain fit type",
						src: "images/Lamp_avatar_01.jpg",
						displaySize: "XL",
						displayShape: "Square",
						imageFitType: "Contain",
						press: onAvatarPress
					}), "Square image avatar with Contain fit"),
					createAvatarItem(new Avatar("initialsCustomAvatar", {
						ariaLabelledBy: "avatar_label",
						tooltip: "Avatar with Custom size and font size",
						initials: "BP",
						displaySize: "Custom",
						customDisplaySize: "10rem",
						customFontSize: "2rem",
						badgeIcon: "sap-icon://zoom-in",
						badgeTooltip: "Zoom in",
						press: onAvatarPress
					}), "Avatar with custom size and font size"),
					createAvatarItem(new Avatar({
						ariaLabelledBy: "avatar_label",
						tooltip: "M size Avatar",
						initials: "LB",
						displaySize: "M",
						badgeTooltip: "Zoom in",
						detailBox: new LightBox({
							id: "lightBox",
							imageContent: new LightBoxItem({
								imageSrc: "images/Woman_avatar_01.png",
								title: "LightBox example"
							})
						})
					}), "Avatar with LightBox detail")
				]
			}).addStyleClass("sapUiSmallMarginTop")
		]
	});

	var oApp = new App();
	oApp.addPage(oPage).placeAt("body");
});
