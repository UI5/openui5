sap.ui.require([
	"sap/f/HeroBanner",
	"sap/f/Card",
	"sap/f/cards/Header",
	"sap/f/cards/NumericHeader",
	"sap/f/cards/NumericSideIndicator",
	"sap/m/Button",
	"sap/m/List",
	"sap/m/StandardListItem",
	"sap/m/CheckBox",
	"sap/m/App",
	"sap/m/Page",
	"sap/m/Panel",
	"sap/m/Select",
	"sap/m/Label",
	"sap/m/HBox",
	"sap/ui/core/Item"
], function (HeroBanner, Card, Header, NumericHeader, NumericSideIndicator, Button, List, StandardListItem, CheckBox, App, Page, Panel, Select, Label, HBox, Item) {
	"use strict";

	var oStartCard = new Card({
		header: new NumericHeader({
			title: "Pending Approvals",
			number: "3",
			scale: "",
			sideIndicators: [
				new NumericSideIndicator({ title: "Open Tasks", number: "2" }),
				new NumericSideIndicator({ title: "Unread", number: "1" })
			]
		}),
		content: new List({
			items: [
				new StandardListItem({ title: "Expense Report Q2", description: "Submitted 2 days ago" }),
				new StandardListItem({ title: "Travel Request – Berlin", description: "Submitted yesterday" }),
				new StandardListItem({ title: "Purchase Order #4471", description: "Submitted today" })
			]
		})
	});

	var oEndCard = new Card({
		header: new Header({
			title: "Upcoming Events",
			subtitle: "Today"
		}),
		content: new List({
			items: [
				new StandardListItem({ title: "Team Meeting", description: "14:00 – Conference Room B" }),
				new StandardListItem({ title: "Quarterly Review", description: "16:00 – Online" })
			]
		})
	});

	var oHeroBanner = new HeroBanner({
		headerText: "Good morning, John",
		overlineText: "Thursday, July 10, 2026",
		columnsRatio: "FirstWider",
		actionsPlacement: "TopEnd",
		actions: [
			new Button({ text: "Explore", type: "Emphasized" }),
			new Button({ text: "Settings" })
		],
		startContent: [oStartCard],
		endContent: [oEndCard]
	});

	// --- Controls panel ---
	var oColumnsRatioSelect = new Select({
		items: [
			new Item({ key: "FirstWider", text: "FirstWider (default)" }),
			new Item({ key: "Equal", text: "Equal" })
		],
		change: function (oEvent) {
			oHeroBanner.setColumnsRatio(oEvent.getParameter("selectedItem").getKey());
		}
	});

	var oActionsPlacementSelect = new Select({
		items: [
			new Item({ key: "TopEnd", text: "TopEnd (default)" }),
			new Item({ key: "BottomStart", text: "BottomStart" })
		],
		change: function (oEvent) {
			oHeroBanner.setActionsPlacement(oEvent.getParameter("selectedItem").getKey());
		}
	});

	var oHeaderBlockPlacementSelect = new Select({
		items: [
			new Item({ key: "Top", text: "Top (default)" }),
			new Item({ key: "Bottom", text: "Bottom" })
		],
		change: function (oEvent) {
			oHeroBanner.setHeaderBlockPlacement(oEvent.getParameter("selectedItem").getKey());
		}
	});

	var oControlsPanel = new Panel({
		headerText: "Configuration",
		expandable: true,
		content: [
			new HBox({
				alignItems: "Center",
				items: [
					new Label({ text: "columnsRatio:", labelFor: oColumnsRatioSelect }),
					oColumnsRatioSelect
				]
			}),
			new HBox({
				alignItems: "Center",
				items: [
					new Label({ text: "actionsPlacement:", labelFor: oActionsPlacementSelect }),
					oActionsPlacementSelect
				]
			}),
			new HBox({
				alignItems: "Center",
				items: [
					new Label({ text: "headerBlockPlacement:", labelFor: oHeaderBlockPlacementSelect }),
					oHeaderBlockPlacementSelect
				]
			}),
			new CheckBox({
				text: "Show startContent (default slot)",
				selected: true,
				select: function (oEvent) {
					if (oEvent.getParameter("selected")) {
						oHeroBanner.addStartContent(oStartCard);
					} else {
						oHeroBanner.removeAllStartContent();
					}
				}
			}),
			new CheckBox({
				text: "Show endContent",
				selected: true,
				select: function (oEvent) {
					if (oEvent.getParameter("selected")) {
						oHeroBanner.addEndContent(oEndCard);
					} else {
						oHeroBanner.removeAllEndContent();
					}
				}
			})
		]
	});

	new App({
		pages: [
			new Page({
				title: "HeroBanner Sample",
				content: [
					oHeroBanner,
					oControlsPanel
				]
			})
		]
	}).placeAt("content");

});
