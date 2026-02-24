
sap.ui.define([
	"sap/f/library",
	"sap/m/App",
	"sap/m/Page",
	"sap/m/VBox",
	"sap/f/AvatarGroup",
	"sap/f/AvatarGroupItem"
], function (fLibrary, App, Page, VBox, AvatarGroup, AvatarGroupItem) {
	"use strict";

	var AvatarGroupType = fLibrary.AvatarGroupType;

	new App({
		pages: new Page("avatar-group-page", {
			title: "AvatarGroup",
			titleLevel: "H1",
			content: [
				new VBox({
					items: [
												new AvatarGroup({
																				avatarDisplaySize: "XS",

							items: [
								new AvatarGroupItem({ initials: "AG" }),
								new AvatarGroupItem({ initials: "AG" }),
								new AvatarGroupItem({ initials: "AG" }),
								new AvatarGroupItem({ initials: "AG" }),
								new AvatarGroupItem({ initials: "AG" }),
								new AvatarGroupItem({ initials: "AG" }),
								new AvatarGroupItem({ initials: "AG" }),
								new AvatarGroupItem({ initials: "AG" }),
								new AvatarGroupItem({ initials: "AG" }),
								new AvatarGroupItem({ initials: "AG" })
							]
						}),
						new AvatarGroup({
							items: [
								new AvatarGroupItem({ initials: "AG" }),
								new AvatarGroupItem({ initials: "AG" }),
								new AvatarGroupItem({ initials: "AG" }),
								new AvatarGroupItem({ initials: "AG" }),
								new AvatarGroupItem({ initials: "AG" }),
								new AvatarGroupItem({ initials: "AG" }),
								new AvatarGroupItem({ initials: "AG" }),
								new AvatarGroupItem({ initials: "AG" }),
								new AvatarGroupItem({ initials: "AG" }),
								new AvatarGroupItem({ initials: "AG" })
							]
						}),
												new AvatarGroup({
														avatarDisplaySize: "M",

							items: [
								new AvatarGroupItem({ initials: "AG" }),
								new AvatarGroupItem({ initials: "AG" }),
								new AvatarGroupItem({ initials: "AG" }),
								new AvatarGroupItem({ initials: "AG" }),
								new AvatarGroupItem({ initials: "AG" }),
								new AvatarGroupItem({ initials: "AG" }),
								new AvatarGroupItem({ initials: "AG" }),
								new AvatarGroupItem({ initials: "AG" }),
								new AvatarGroupItem({ initials: "AG" }),
								new AvatarGroupItem({ initials: "AG" })
							]
						}),
												new AvatarGroup({
											avatarDisplaySize: "L",

							items: [
								new AvatarGroupItem({ initials: "AG" }),
								new AvatarGroupItem({ initials: "AG" }),
								new AvatarGroupItem({ initials: "AG" }),
								new AvatarGroupItem({ initials: "AG" }),
								new AvatarGroupItem({ initials: "AG" }),
								new AvatarGroupItem({ initials: "AG" }),
								new AvatarGroupItem({ initials: "AG" }),
								new AvatarGroupItem({ initials: "AG" }),
								new AvatarGroupItem({ initials: "AG" }),
								new AvatarGroupItem({ initials: "AG" })
							]
						}),
												new AvatarGroup({
											avatarDisplaySize: "XL",
							items: [
								new AvatarGroupItem({ initials: "AG" }),
								new AvatarGroupItem({ initials: "AG" }),
								new AvatarGroupItem({ initials: "AG" }),
								new AvatarGroupItem({ initials: "AG" }),
								new AvatarGroupItem({ initials: "AG" }),
								new AvatarGroupItem({ initials: "AG" }),
								new AvatarGroupItem({ initials: "AG" }),
								new AvatarGroupItem({ initials: "AG" }),
								new AvatarGroupItem({ initials: "AG" }),
								new AvatarGroupItem({ initials: "AG" })
							]
						}),
						new AvatarGroup({
							groupType: AvatarGroupType.Individual,
							items: [
								new AvatarGroupItem({ initials: "AG" }),
								new AvatarGroupItem({ initials: "AG" }),
								new AvatarGroupItem({ initials: "AG" }),
								new AvatarGroupItem({ initials: "AG" }),
								new AvatarGroupItem({ initials: "AG" }),
								new AvatarGroupItem({ initials: "AG" }),
								new AvatarGroupItem({ initials: "AG" }),
								new AvatarGroupItem({ initials: "AG" }),
								new AvatarGroupItem({ initials: "AG" }),
								new AvatarGroupItem({ initials: "AG" })
							]
						})
					]
				}).addStyleClass("sapUiLargeMargin"),
				new VBox({
					width: "300px",
					items: [
						new AvatarGroup({
							items: [
								new AvatarGroupItem({ initials: "AG" }),
								new AvatarGroupItem({ initials: "AG" }),
								new AvatarGroupItem({ initials: "AG" }),
								new AvatarGroupItem({ initials: "AG" }),
								new AvatarGroupItem({ initials: "AG" }),
								new AvatarGroupItem({ initials: "AG" }),
								new AvatarGroupItem({ initials: "AG" }),
								new AvatarGroupItem({ initials: "AG" }),
								new AvatarGroupItem({ initials: "AG" }),
								new AvatarGroupItem({ initials: "AG" })
							]
						}),
						new AvatarGroup({
							groupType: AvatarGroupType.Individual,
							avatarDisplaySize: "XS",
							items: [
								new AvatarGroupItem({ initials: "AG" }),
								new AvatarGroupItem({ initials: "AG" }),
								new AvatarGroupItem({ initials: "AG" }),
								new AvatarGroupItem({ initials: "AG" }),
								new AvatarGroupItem({ initials: "AG" }),
								new AvatarGroupItem({ initials: "AG" }),
								new AvatarGroupItem({ initials: "AG" }),
								new AvatarGroupItem({ initials: "AG" }),
								new AvatarGroupItem({ initials: "AG" }),
								new AvatarGroupItem({ initials: "AG" })
							]
						}),
						new AvatarGroup({
							groupType: AvatarGroupType.Individual,
							items: [
								new AvatarGroupItem({ initials: "AG" }),
								new AvatarGroupItem({ initials: "AG" }),
								new AvatarGroupItem({ initials: "AG" }),
								new AvatarGroupItem({ initials: "AG" }),
								new AvatarGroupItem({ initials: "AG" }),
								new AvatarGroupItem({ initials: "AG" }),
								new AvatarGroupItem({ initials: "AG" }),
								new AvatarGroupItem({ initials: "AG" }),
								new AvatarGroupItem({ initials: "AG" }),
								new AvatarGroupItem({ initials: "AG" })
							]
						}),
						new AvatarGroup({
							groupType: AvatarGroupType.Individual,
							avatarDisplaySize: "M",
							items: [
								new AvatarGroupItem({ initials: "AG" }),
								new AvatarGroupItem({ initials: "AG" }),
								new AvatarGroupItem({ initials: "AG" }),
								new AvatarGroupItem({ initials: "AG" }),
								new AvatarGroupItem({ initials: "AG" }),
								new AvatarGroupItem({ initials: "AG" }),
								new AvatarGroupItem({ initials: "AG" }),
								new AvatarGroupItem({ initials: "AG" }),
								new AvatarGroupItem({ initials: "AG" }),
								new AvatarGroupItem({ initials: "AG" })
							]
						}),
						new AvatarGroup({
							groupType: AvatarGroupType.Individual,
							avatarDisplaySize: "L",
							items: [
								new AvatarGroupItem({ initials: "AG" }),
								new AvatarGroupItem({ initials: "AG" }),
								new AvatarGroupItem({ initials: "AG" }),
								new AvatarGroupItem({ initials: "AG" }),
								new AvatarGroupItem({ initials: "AG" }),
								new AvatarGroupItem({ initials: "AG" }),
								new AvatarGroupItem({ initials: "AG" }),
								new AvatarGroupItem({ initials: "AG" }),
								new AvatarGroupItem({ initials: "AG" }),
								new AvatarGroupItem({ initials: "AG" })
							]
						}),
						new AvatarGroup({
							groupType: AvatarGroupType.Individual,
							avatarDisplaySize: "XL",
							items: [
								new AvatarGroupItem({ initials: "AG" }),
								new AvatarGroupItem({ initials: "AG" }),
								new AvatarGroupItem({ initials: "AG" }),
								new AvatarGroupItem({ initials: "AG" }),
								new AvatarGroupItem({ initials: "AG" }),
								new AvatarGroupItem({ initials: "AG" }),
								new AvatarGroupItem({ initials: "AG" }),
								new AvatarGroupItem({ initials: "AG" }),
								new AvatarGroupItem({ initials: "AG" }),
								new AvatarGroupItem({ initials: "AG" })
							]
						})
					]
				}).addStyleClass("sapUiLargeMargin"),
				new VBox({
					width: "300px",
					items: [
						new AvatarGroup({
							items: [
								new AvatarGroupItem({ initials: "do" }),
								new AvatarGroupItem({ initials: "AG" }),
								new AvatarGroupItem({ initials: "AG" }),
								new AvatarGroupItem({ initials: "AG" }),
								new AvatarGroupItem({ initials: "AG" }),
								new AvatarGroupItem({ initials: "AG" }),
								new AvatarGroupItem({ initials: "AG" }),
								new AvatarGroupItem({ initials: "AG" }),
								new AvatarGroupItem({ initials: "AG" }),
								new AvatarGroupItem({ initials: "AG" }),
								new AvatarGroupItem({ initials: "AG" }),
								new AvatarGroupItem({ initials: "AG" }),
								new AvatarGroupItem({ initials: "AG" }),
								new AvatarGroupItem({ initials: "AG" }),
								new AvatarGroupItem({ initials: "AG" })
							],
							groupType: AvatarGroupType.Group,
							avatarDisplaySize: "Custom",
							avatarCustomDisplaySize: "40px",
							avatarCustomFontSize: "18px"
						}),
						new AvatarGroup({
							groupType: AvatarGroupType.Individual,
							items: [
								new AvatarGroupItem({ initials: "AG" }),
								new AvatarGroupItem({ initials: "AG" }),
								new AvatarGroupItem({ initials: "AG" }),
								new AvatarGroupItem({ initials: "AG" }),
								new AvatarGroupItem({ initials: "AG" }),
								new AvatarGroupItem({ initials: "AG" }),
								new AvatarGroupItem({ initials: "AG" }),
								new AvatarGroupItem({ initials: "AG" }),
								new AvatarGroupItem({ initials: "AG" }),
								new AvatarGroupItem({ initials: "AG" })
							],
							avatarDisplaySize: "Custom",
							avatarCustomDisplaySize: "5rem",
							avatarCustomFontSize: "1.2rem"
						})
					]
				}).addStyleClass("sapUiLargeMargin")
			]
		})
	}).placeAt("body");
});