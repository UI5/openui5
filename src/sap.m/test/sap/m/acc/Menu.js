sap.ui.define([
	"sap/m/App",
	"sap/m/Page",
	"sap/m/Menu",
	"sap/m/MenuItem",
	"sap/m/MenuItemGroup",
	"sap/m/Label",
	"sap/m/MenuButton",
	"sap/m/Button",
	"sap/m/MessageToast",
	"sap/ui/layout/VerticalLayout",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/library"
], function(
	App,
	Page,
	Menu,
	MenuItem,
	MenuItemGroup,
	Label,
	MenuButton,
	Button,
	MessageToast,
	VerticalLayout,
	JSONModel,
	coreLibrary
) {
	"use strict";

	// shortcut for sap.ui.core.TitleLevel
	var TitleLevel = coreLibrary.TitleLevel;

	// shortcut for sap.ui.core.ItemSelectionMode
	var ItemSelectionMode = coreLibrary.ItemSelectionMode;

	var oMenu = new Menu({
		title: "random",
		itemSelected: function(oEvent) {
			var oItem = oEvent.getParameter("item"),
					sItemPath = "";
			while (oItem instanceof MenuItem) {
				sItemPath = oItem.getText() + " - " + sItemPath;
				oItem = oItem.getParent();
			}

			sItemPath = sItemPath.substr(0, sItemPath.lastIndexOf(" - "));

			MessageToast.show("itemSelected: " + sItemPath);
		}
	});

	oMenu.addItem(new MenuItem({
		text: "fridge",
		icon: "sap-icon://fridge",
		shortcutText: "Alt + F4",
		items: [
			new MenuItem({
				text: "accidental leave",
				icon: "sap-icon://accidental-leave",
				items: [
					new MenuItem({
						icon: "sap-icon://factory",
						text: "factory"
					}),
					new MenuItem({
						icon: "sap-icon://flag",
						text: "flag"
					}),
					new MenuItem({
						icon: "sap-icon://flight",
						text: "flight"
					})
				]
			}),
			new MenuItem({
				text: "iphone",
				items: [
					new MenuItem({
						icon: "sap-icon://video",
						text: "video"
					}),
					new MenuItem({
						text: "loan"
					}),
					new MenuItem({
						icon: "sap-icon://commission-check",
						text: "commission check",
						startsSection: true
					}),
					new MenuItem({
						icon: "sap-icon://doctor",
						text: "doctor"
					})
				]
			})
		]
	}));

	oMenu.addItem(new MenuItem({
		text: "iphone",
		icon: "sap-icon://iphone",
		items: [
			new MenuItem({
				icon: "sap-icon://video",
				text: "no icons",
				items: [
					new MenuItem({
						text: "new"
					}),
					new MenuItem({
						text: "save and open",
						items: [
							new MenuItem({
								text: "save as",
								enabled: false
							}),
							new MenuItem({
								text: "save",
								enabled: false
							}),new MenuItem({
								text: "open from"
							}),
							new MenuItem({
								text: "open"
							})
						]
					})
				]
			}),
			new MenuItem({
				icon: "sap-icon://loan",
				text: "loan"
			}),
			new MenuItem({
				icon: "sap-icon://commission-check",
				text: "commission check"
			}),
			new MenuItem({
				icon: "sap-icon://doctor",
				text: "doctor"
			})
		]
	}));

	var oButton = new MenuButton("button1", {
		text: "Open Menu",
		menu: oMenu
	});

	var oMenu2 = new Menu();
	var oModel = new JSONModel();

	function bindAggregations(dataNumber) {
		if (!dataNumber) {
			var template = new MenuItem({
				text: "{text}",
				icon: "{icon}",
				items: {
					path: 'items',
					template: new MenuItem({
						text: "{text}",
						icon: "{icon}",
						items: {
							path: 'items',
							template: new MenuItem({
								text: "{text}",
								icon: "{icon}"
							}),
							templateShareable: true
						}
					}),
					templateShareable: true
				}
			});

			oModel.setData({
				items: [
					{
						text: "item1",
						icon: "sap-icon://accidental-leave"
					},
					{
						text: "item2",
						icon: "sap-icon://accidental-leave",
						items: [
							{
								text: "sub-item1",
								icon: "sap-icon://accidental-leave",
								items: [
									{
										text: "sub-sub-item1",
										icon: "sap-icon://accidental-leave"
									}
								]
							}
						]
					}
				]
			});

			oMenu2.setModel(oModel);
			oMenu2.bindAggregation("items", "/items", template);
		} else {
			var oSecondData = {
				items: [
					{
						text: "second-item1",
						icon: "sap-icon://accidental-leave"
					},
					{
						text: "second-item2",
						icon: "sap-icon://accidental-leave",
						items: [
							{
								text: "second-sub-item1",
								icon: "sap-icon://accidental-leave",
								items: [
									{
										text: "second-sub-sub-item1",
										icon: "sap-icon://accidental-leave"
									},
									{
										text: "second-sub-sub-item2",
										icon: "sap-icon://accidental-leave"
									}
								]
							}
						]
					}
				]
			};
			oSecondData.items.push({
				text: "second-item3",
				icon: "sap-icon://accidental-leave"
			});
			oMenu2.getModel().setProperty('/items', oSecondData.items);
		}
	}

	bindAggregations();

	var oButton2 = new MenuButton("button2",{
		text: "Test binding",
		menu: oMenu2
	});

	var oMenu3 = new Menu({
			items: [
				new MenuItem({
					text: "New",
					icon: "sap-icon://create",
					shortcutText: "Ctrl + N"
				}),
				new MenuItem({
					text: "Open",
					icon: "sap-icon://open-folder",
					shortcutText: "Ctrl + O"
				}),
				new MenuItem({
					text: "Save",
					shortcutText: "Ctrl + Shift + S",
					items: [
						new MenuItem({
							text: "Save Locally",
							icon: "sap-icon://save",
							shortcutText: "Ctrl + S"
						}),
						new MenuItem({
							text: "Save to Cloud",
							icon: "sap-icon://upload-to-cloud",
							shortcutText: "Alt + S"
						})
					]
				}),
				new MenuItem({
					text: "Delete",
					shortcutText: "Ctrl + D"
				}),
				new MenuItem({
					text: "Close",
					icon: "sap-icon://decline",
					shortcutText: "Ctrl + X"
				})
			]
		});

	var oButton3 = new MenuButton("button3", {
		text: "File Menu",
		menu: oMenu3
	});

	// Menu with selectable items using MenuItemGroup - Single Select
	var oMenu4 = new Menu({
		title: "Document View Options",
		itemSelected: function(oEvent) {
			var oItem = oEvent.getParameter("item");
			MessageToast.show("Selected view: " + oItem.getText());
		},
		items: [
			new MenuItemGroup({
				itemSelectionMode: ItemSelectionMode.SingleSelect,
				items: [
					new MenuItem({
						text: "List View",
						icon: "sap-icon://list",
						selected: true
					}),
					new MenuItem({
						text: "Card View",
						icon: "sap-icon://card"
					}),
					new MenuItem({
						text: "Table View",
						icon: "sap-icon://table-view"
					}),
					new MenuItem({
						text: "Tile View",
						icon: "sap-icon://grid"
					})
				]
			}),
			new MenuItem({
				text: "Refresh",
				icon: "sap-icon://refresh",
				startsSection: true,
				shortcutText: "F5"
			})
		]
	});

	var oButton4 = new MenuButton("button4", {
		text: "View Options (Single Select)",
		menu: oMenu4
	});

	// Menu with selectable items using MenuItemGroup - Multi Select
	var oMenu5 = new Menu({
		title: "Display Settings",
		itemSelected: function(oEvent) {
			var oItem = oEvent.getParameter("item");
			var sState = oItem.getSelected() ? "enabled" : "disabled";
			MessageToast.show(oItem.getText() + " " + sState);
		},
		items: [
			new MenuItemGroup({
				itemSelectionMode: ItemSelectionMode.MultiSelect,
				items: [
					new MenuItem({
						text: "Show Toolbar",
						icon: "sap-icon://toolbar",
						selected: true
					}),
					new MenuItem({
						text: "Show Status Bar",
						icon: "sap-icon://status-positive",
						selected: false
					}),
					new MenuItem({
						text: "Show Line Numbers",
						icon: "sap-icon://numbered-text",
						selected: true
					}),
					new MenuItem({
						text: "Word Wrap",
						icon: "sap-icon://text-align-justified",
						selected: false
					})
				]
			}),
			new MenuItem({
				text: "Reset to Defaults",
				icon: "sap-icon://reset",
				startsSection: true
			})
		]
	});

	var oButton5 = new MenuButton("button5", {
		text: "Display Settings (Multi Select)",
		menu: oMenu5
	});

	// Menu with endContent - buttons in menu items
	var oMenu6 = new Menu({
		title: "Actions with Quick Access",
		itemSelected: function(oEvent) {
			var oItem = oEvent.getParameter("item");
			MessageToast.show("Item selected: " + oItem.getText());
		},
		items: [
			new MenuItem({
				text: "Send Email",
				icon: "sap-icon://email",
				endContent: [
					new Button({
						icon: "sap-icon://action",
						type: "Transparent",
						tooltip: "Quick send",
						press: function() {
							MessageToast.show("Quick send email action");
						}
					})
				]
			}),
			new MenuItem({
				text: "Print Document",
				icon: "sap-icon://print",
				endContent: [
					new Button({
						icon: "sap-icon://download",
						type: "Transparent",
						tooltip: "Download PDF",
						press: function() {
							MessageToast.show("Download PDF action");
						}
					})
				]
			}),
			new MenuItem({
				text: "Share",
				icon: "sap-icon://share-2",
				endContent: [
					new Button({
						icon: "sap-icon://copy",
						type: "Transparent",
						tooltip: "Copy link",
						press: function() {
							MessageToast.show("Link copied to clipboard");
						}
					})
				]
			}),
			new MenuItem({
				text: "Archive",
				icon: "sap-icon://archive",
				startsSection: true
			})
		]
	});

	var oButton6 = new MenuButton("button6", {
		text: "Actions with Buttons",
		menu: oMenu6
	});

	// Context menu demonstration
	var oContextMenu = new Menu({
		title: "Context Actions",
		itemSelected: function(oEvent) {
			var oItem = oEvent.getParameter("item");
			MessageToast.show("Context action: " + oItem.getText());
		},
		items: [
			new MenuItem({
				text: "Copy",
				icon: "sap-icon://copy",
				shortcutText: "Ctrl+C"
			}),
			new MenuItem({
				text: "Paste",
				icon: "sap-icon://paste",
				shortcutText: "Ctrl+V"
			}),
			new MenuItem({
				text: "Cut",
				icon: "sap-icon://scissors",
				shortcutText: "Ctrl+X"
			}),
			new MenuItem({
				text: "Properties",
				icon: "sap-icon://detail-view",
				startsSection: true
			})
		]
	});

	var oContextArea = new Button("contextArea", {
		text: "Right-click me for context menu",
		width: "300px",
		press: function(oEvent) {
			MessageToast.show("Use right-click for context menu");
		}
	});

	// Attach context menu to the button
	oContextArea.attachBrowserEvent("contextmenu", function(oEvent) {
		oEvent.preventDefault();
		oContextMenu.openAsContextMenu(oEvent, oContextArea);
	});

	// Menu with mixed groups and regular items
	var oMenu7 = new Menu({
		title: "Advanced Settings",
		itemSelected: function(oEvent) {
			var oItem = oEvent.getParameter("item");
			MessageToast.show("Settings: " + oItem.getText());
		},
		items: [
			new MenuItem({
				text: "General Settings",
				icon: "sap-icon://settings"
			}),
			new MenuItemGroup({
				itemSelectionMode: ItemSelectionMode.SingleSelect,
				items: [
					new MenuItem({
						text: "Theme: Fiori 3",
						selected: true
					}),
					new MenuItem({
						text: "Theme: High Contrast"
					}),
					new MenuItem({
						text: "Theme: Dark"
					})
				]
			}),
			new MenuItemGroup({
				itemSelectionMode: ItemSelectionMode.MultiSelect,
				items: [
					new MenuItem({
						text: "Enable Animations",
						selected: true
					}),
					new MenuItem({
						text: "Show Tooltips",
						selected: true
					}),
					new MenuItem({
						text: "Auto-save",
						selected: false
					})
				]
			}),
			new MenuItem({
				text: "Export Settings",
				icon: "sap-icon://download",
				startsSection: true
			}),
			new MenuItem({
				text: "Import Settings",
				icon: "sap-icon://upload"
			})
		]
	});

	var oButton7 = new MenuButton("button7", {
		text: "Advanced Settings",
		menu: oMenu7
	});

	var oLayout = new VerticalLayout({
		content: [
			new Label({text: "Regular menu with nested items and icons", wrapping: true, labelFor: "button1"}),
			oButton,
			new Label({text: "Menu initialized via data binding", wrapping: true, labelFor: "button2"}),
			oButton2,
			new Label({text: "File operations menu with shortcuts", wrapping: true, labelFor: "button3"}),
			oButton3,
			new Label({text: "Single-select menu with radio-button behavior", wrapping: true, labelFor: "button4"}),
			oButton4,
			new Label({text: "Multi-select menu with checkbox behavior", wrapping: true, labelFor: "button5"}),
			oButton5,
			new Label({text: "Menu items with interactive end content buttons", wrapping: true, labelFor: "button6"}),
			oButton6,
			new Label({text: "Right-click context menu demonstration", wrapping: true, labelFor: "contextArea"}),
			oContextArea,
			new Label({text: "Mixed groups with different selection modes", wrapping: true, labelFor: "button7"}),
			oButton7
		]
	}).addStyleClass("sapUiContentPadding");

	var oApp = new App();
	var oPage = new Page({
		title: "Menu Accessibility Test Page",
		titleLevel: TitleLevel.H1,
		content: oLayout
	});

	oApp.addPage(oPage);
	oApp.placeAt("body");
});
