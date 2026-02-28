// Note: the HTML page 'SelectionDetails.html' loads this module via data-sap-ui-on-init

sap.ui.define([
	"sap/m/ActionListItem",
	"sap/m/App",
	"sap/m/Button",
	"sap/m/HBox",
	"sap/m/Label",
	"sap/m/List",
	"sap/m/MessageToast",
	"sap/m/Page",
	"sap/m/SelectionDetails",
	"sap/m/SelectionDetailsItem",
	"sap/m/SelectionDetailsItemLine",
	"sap/ui/core/Item",
	"sap/ui/core/Theming",
	"sap/ui/model/json/JSONModel"
], function(
	ActionListItem,
	App,
	Button,
	HBox,
	Label,
	List,
	MessageToast,
	Page,
	SelectionDetails,
	SelectionDetailsItem,
	SelectionDetailsItemLine,
	Item,
	Theming,
	JSONModel
) {
	"use strict";

	var fnCreateLine = function(id, context) {
		return new SelectionDetailsItemLine(id, {
			label: "{label}",
			value: "{value}",
			displayValue: "{displayValue}",
			unit: "{unit}"
		});
	};

	var aItems = [
		new SelectionDetailsItem({
		lines: {
			path: "/lines/0",
			factory: fnCreateLine
		},
		actions: [
			new Item("item_action_1", {
				key: "1",
				text: "item action 1"
			}),
			new Item("item_action_2", {
				key: "2",
				text: "item action 2"
			}),
			new Item("item_action_3", {
				key: "3",
				text: "item action 3"
			}),
			new Item("item_action_4", {
				key: "4",
				text: "item action 4"
			})],
		enableNav: true
	}),
	new SelectionDetailsItem({
		lines: {
			path: "/lines/0",
			factory: fnCreateLine
		},
		actions: [
			new Item("item_action_21", {
				key: "21",
				text: "item action 21"
			}),
			new Item("item_action_22", {
				key: "22",
				text: "item action 22"
			}),
			new Item("item_action_23", {
				key: "23",
				text: "item action 23"
			}),
			new Item("item_action_24", {
				key: "24",
				text: "item action 24"
			})
		],
		enableNav: true
	}),
	new SelectionDetailsItem({
		lines: {
			path: "/lines/1",
			factory: fnCreateLine
		},
		enableNav: false
	})
];

var oModel = new JSONModel({
	lines: [
		[
			{
				label: "Company Name",
				value: "Titanium laptop manufacturing company"
			}, {
				label: "Product Category",
				value: "Laptop"
			}, {
				label: "Currency Code",
				value: "EUR"
			}, {
				label: "Date",
				displayValue: new Date().toLocaleString()
			}, {
				label: "Price",
				value: "939,00",
				unit: "EUR"
			}, {
				label: "Purchased on",
				value: {
					day: "Aug 25, 2017",
					time: "10:30"
				}
			}
		], [
			{
				label: "Company Name",
				value: "Future Industries"
			}, {
				label: "Product Category",
				value: "Satomobiles"
			}, {
				label: "Price",
				value: "10,000.00",
				unit: "Yuons"
			}
		]
	],
	actions: [
		{
			key: "1",
			text: "action 1"
		},
		{
			key: "2",
			text: "action 2"
		},
		{
			key: "3",
			text: "action 3"
		},
		{
			key: "4",
			text: "action 4"
		},
		{
			key: "5",
			text: "action 5"
		},
		{
			key: "6",
			text: "action 6"
		}
	],
	actionGroups: [
		{
			key: "1",
			text: "action group 1"
		},
		{
			key: "2",
			text: "action group 2"
		}
	],
	contentActionItems: [
		{
			text: "Reject"
		}, {
			text: "Accept"
		}, {
			text: "Cancel"
		}
	]
});

var oActionTemplate = new Item({
	key: "{key}",
	text: "{text}"
});

var oActionGroupTemplate = new Item({
	key: "{key}",
	text: "{text}"
});

var oActionGroupsListTemplate = new ActionListItem({
	text: "{text}"
});

var oActionGroupsList = new List("actionGroupsList", {
	items: {
		path: "/contentActionItems",
		template: oActionGroupsListTemplate
	}
});

var oSelectionDetails = new SelectionDetails("selectionDetails", {
	items: aItems,
	actions: {
		path: "/actions",
		template: oActionTemplate
	},
	actionGroups: {
		path: "/actionGroups",
		template: oActionGroupTemplate
	},
	actionPress: function(oEvent) {
		MessageToast.show(oEvent.getParameter("action").getText() + " is pressed" + "\n " + oEvent.getParameter("items").length + " items selected"
				+ "\n level is: " + oEvent.getParameter("level"));
		if (oEvent.getParameter("level") === "Group") {
			oSelectionDetails.navTo(oEvent.getSource().getId() + " first level of navigation", oActionGroupsList);
		}
	},
	navigate: function(oEvent) {
		if (oEvent.getParameter("direction") === "back") {
			return;
		}
		MessageToast.show("Event 'navigate' triggered originating from " + oEvent.getParameter("item").getId() + " item");
		var oSelectionDetails = oEvent.getParameter("item").getParent();
		var sId = oEvent.getParameter("item").getId();
		oSelectionDetails.navTo(sId + " first level of navigation",
			new Button({
				text: "go further",
				press: function() {
					oSelectionDetails.navTo(sId + " second level of navigation",
						new Label({
							text: "some text"
						})
					);
				}
			})
		);
	},
	beforeOpen: function () {
		MessageToast.show("Event 'beforeOpen' triggered");
	},
	beforeClose: function () {
		MessageToast.show("Event 'beforeClose' triggered");
	}
});

var oApp = new App({
	pages: new Page({
		title: "SelectionDetails",
		content: [
			new HBox({
				items: [
					oSelectionDetails,
					new Button({
						text: "Add Item",
						icon: "sap-icon://add",
						press: function () {
							oSelectionDetails.addItem(new SelectionDetailsItem({
								lines: {
									path: "/lines/0",
									factory: fnCreateLine
								},
								actions: [
									new Item({
										key: "1",
										text: "item action 1"
									})
								],
								enableNav: true
							}));
						}
					}),
					new Button({
						text: "Remove Item",
						icon: "sap-icon://delete",
						press: function () {
							var aItems = oSelectionDetails.getItems();
							if (aItems.length > 0) {
								aItems.pop().destroy();
							}
						}
					})
				]
			})
		]
	}),
	models: oModel
});
oApp.placeAt("content");

//set the contrast class for belize plus
if (Theming.getTheme() === "sap_belize_plus") {
	oApp.addStyleClass("sapContrastPlus");
}
});