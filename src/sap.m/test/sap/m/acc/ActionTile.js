sap.ui.define([
	"sap/m/ActionTile",
	"sap/m/ActionTileContent",
	"sap/m/App",
	"sap/m/Button",
	"sap/m/ContentConfig",
	"sap/m/library",
	"sap/m/Link",
	"sap/m/MessageToast",
	"sap/m/Page",
	"sap/m/TileAttribute"
], function(
	ActionTile,
	ActionTileContent,
	App,
	Button,
	ContentConfig,
	mobileLibrary,
	Link,
	MessageToast,
	Page,
	TileAttribute
) {
	"use strict";

	// Enum shortcuts
	var ButtonType = mobileLibrary.ButtonType;

	var oActionTile = new ActionTile("myActionTile", {
		header: "Check Purchase Requisition Item 15080742 00040",
		state: "Loaded",
		priority: "High",
		priorityText: "High Priority",
		headerImage: "sap-icon://workflow-tasks",
		enableIconFrame: true,
		pressEnabled: true,
		press: function(oEvent) {
			var oTile = oEvent.getSource();
			MessageToast.show("Tile Pressed: " + oTile.getHeader());
		},
		enableNavigationButton: true,
		badgeIcon: "sap-icon://high-priority",
		badgeValueState: "Error",
		enableDynamicHeight: true,
		width: "352px",
		tileContent: new ActionTileContent({
			priority: "High",
			priorityText: "High Priority",
			enableGridLayout: true,
			headerLink: new Link({
				text: "SAP Standard User for Business Workflow",
				press: function() {
					MessageToast.show("Link Pressed!");
				}
			}),
			attributes: [
				new TileAttribute({
					label: "Net Purchase Order Price:",
					contentConfig: new ContentConfig({
						type: "Text",
						text: "1000.00"
					})
				}),
				new TileAttribute({
					label: "Document Currency:",
					contentConfig: new ContentConfig({
						type: "Text",
						text: "This is a long text to check if this will be wrapped"
					})
				}),
				new TileAttribute({
					label: "Supplier title column to check if this is not wrapped:",
					contentConfig: new ContentConfig({
						type: "Text",
						text: "Standard Vendor"
					})
				}),
				new TileAttribute({
					label: "Connected System:",
					contentConfig: new ContentConfig({
						type: "Text",
						text: "EUROPE"
					})
				})
			]
		}),
		actionButtons: [
			new Button({
				text: "Approve",
				type: ButtonType.Accept
			}).addStyleClass("sapUiTinyMarginEnd"),
			new Button({
				text: "Reject",
				type: ButtonType.Reject
			})
		]
	}).addStyleClass("sapUiSmallMargin").addStyleClass("myCustomTile");

	var oPage = new Page({
		showHeader: false,
		content: [oActionTile]
	});

	var oApp = new App({
		pages: [oPage]
	});

	oApp.placeAt("body");
});
