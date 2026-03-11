/* global QUnit */
sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/opaQunit",
	"sap/ui/test/matchers/Properties",
	"sap/ui/test/actions/Press"
], function (Opa5,
			 opaTest,
			 Properties,
			 Press) {
	"use strict";

	Opa5.extendConfig({
		viewNamespace: "appUnderTest.view.",
		viewName: "Main",
		autoWait: true,
		asyncPolling: true
	});

	QUnit.module("Multi-Selection with Shift Key");

	opaTest("Should select a range of items using Shift keydown and keyup", function (Given, When, Then) {
		Given.iStartMyUIComponent({
			componentConfig: {
				name: "appUnderTest"
			}
		});

		// Step 1: Press first checkbox normally (select it)
		When.waitFor({
			controlType: "sap.m.CheckBox",
			properties: {
				editable: true
			},
			ancestor: {
				controlType: "sap.m.ColumnListItem",
				bindingPath: {
					path: "/items/1"
				},
				ancestor: {
					id: "multiSelectTable"
				}
			},
			actions: new Press({
				idSuffix: "CbBg"
			}),
			errorMessage: "Could not press first checkbox"
		});

		// Step 2: Dispatch Shift keydown on first checkbox
		When.waitFor({
			controlType: "sap.m.CheckBox",
			properties: {
				editable: true
			},
			ancestor: {
				controlType: "sap.m.ColumnListItem",
				bindingPath: {
					path: "/items/1"
				},
				ancestor: {
					id: "multiSelectTable"
				}
			},
			actions: new Press({
				idSuffix: "CbBg",
				keyDown: true,
				shiftKey: true
			}),
			errorMessage: "Could not dispatch Shift keydown"
		});

		// Step 3: Press last checkbox (triggers range selection)
		When.waitFor({
			controlType: "sap.m.CheckBox",
			properties: {
				editable: true
			},
			ancestor: {
				controlType: "sap.m.ColumnListItem",
				bindingPath: {
					path: "/items/4"
				},
				ancestor: {
					id: "multiSelectTable"
				}
			},
			actions: new Press({
				idSuffix: "CbBg"
			}),
			errorMessage: "Could not press last checkbox"
		});

		// Step 4: Dispatch Shift keyup on last checkbox
		When.waitFor({
			controlType: "sap.m.CheckBox",
			properties: {
				editable: true
			},
			ancestor: {
				controlType: "sap.m.ColumnListItem",
				bindingPath: {
					path: "/items/4"
				},
				ancestor: {
					id: "multiSelectTable"
				}
			},
			actions: new Press({
				idSuffix: "CbBg",
				keyUp: true,
				shiftKey: true
			}),
			errorMessage: "Could not dispatch Shift keyup"
		});

		// Verify that items 1-4 are selected (4 items total)
		Then.waitFor({
			id: "multiSelectTable",
			success: function (oTable) {
				var aSelectedItems = oTable.getSelectedItems();
				Opa5.assert.strictEqual(aSelectedItems.length, 4, "4 items should be selected");

				// Verify specific items are selected
				var aSelectedIndices = aSelectedItems.map(function(oItem) {
					return oTable.indexOfItem(oItem);
				}).sort(function(a, b) { return a - b; });

				Opa5.assert.deepEqual(aSelectedIndices, [1, 2, 3, 4], "Items at indices 1-4 should be selected");
			},
			errorMessage: "Could not verify selection"
		});

		// Verify selected count in the model
		Then.waitFor({
			id: "multiSelectionPage",
			success: function (oPage) {
				var iSelectedCount = oPage.getModel().getProperty("/selectedCount");
				Opa5.assert.strictEqual(iSelectedCount, 4, "Selected count should be 4");
			},
			errorMessage: "Could not verify selected count"
		});
	});

	opaTest("Should navigate to context menu page", function (Given, When, Then) {
		When.waitFor({
			id: "navigationButton",
			actions: new Press(),
			errorMessage: "Could not press navigation button"
		});

		Then.waitFor({
			id: "contextMenuPage",
			success: function () {
				Opa5.assert.ok(true, "Navigation to context menu page was successful");
			},
			errorMessage: "Could not navigate to context menu page"
		});
	});

	QUnit.module("Right-Click Context Menu");

	opaTest("Should open context menu using right-click action", function (Given, When, Then) {
		// Right-click on the first item to open context menu
		When.waitFor({
			controlType: "sap.m.ColumnListItem",
			bindingPath: {
				path: "/items/0"
			},
			ancestor: {
				id: "contextMenuTable"
			},
			actions: new Press({
				rightClick: true,
				xPercentage: 50,
				yPercentage: 50
			}),
			errorMessage: "Could not right-click on first item"
		});

		// Verify context menu is open
		Then.waitFor({
			controlType: "sap.m.ResponsivePopover",
			success: function (aPopovers) {
				var oPopover = aPopovers.find(function(oPopover) {
					return oPopover.isOpen();
				});
				Opa5.assert.ok(oPopover, "Context menu popover should be open");
				Opa5.assert.ok(oPopover.isOpen(), "Context menu popover should be in open state");
			},
			errorMessage: "Context menu was not opened"
		});
	});

	opaTest("Should select 'Edit Item' from context menu", function (Given, When, Then) {
		// Click on "Edit Item" menu item
		When.waitFor({
			controlType: "sap.m.MenuItem",
			matchers: new Properties({
				text: "Edit Item"
			}),
			actions: new Press(),
			errorMessage: "Could not press Edit Item menu item"
		});

		// Verify the context menu action was executed
		Then.waitFor({
			id: "contextMenuPage",
			success: function (oPage) {
				var sAction = oPage.getModel().getProperty("/contextMenuAction");
				Opa5.assert.strictEqual(sAction, "Edit Item", "Context menu action should be 'Edit Item'");
			},
			errorMessage: "Context menu action was not set correctly"
		});
	});

	opaTest("Should open context menu and select 'Delete Item'", function (Given, When, Then) {
		// Right-click on the second item
		When.waitFor({
			controlType: "sap.m.ColumnListItem",
			bindingPath: {
				path: "/items/1"
			},
			ancestor: {
				id: "contextMenuTable"
			},
			actions: new Press({
				rightClick: true,
				xPercentage: 30,
				yPercentage: 50
			}),
			errorMessage: "Could not right-click on second item"
		});

		// Click on "Delete Item" menu item
		When.waitFor({
			controlType: "sap.m.MenuItem",
			matchers: new Properties({
				text: "Delete Item"
			}),
			actions: new Press(),
			errorMessage: "Could not press Delete Item menu item"
		});

		// Verify the context menu action was executed
		Then.waitFor({
			id: "contextMenuPage",
			success: function (oPage) {
				var sAction = oPage.getModel().getProperty("/contextMenuAction");
				Opa5.assert.strictEqual(sAction, "Delete Item", "Context menu action should be 'Delete Item'");
			},
			errorMessage: "Context menu action was not set correctly"
		});
	});

	opaTest("Should open context menu and select 'View Details'", function (Given, When, Then) {
		// Right-click on the third item with different coordinates
		When.waitFor({
			controlType: "sap.m.ColumnListItem",
			bindingPath: {
				path: "/items/2"
			},
			ancestor: {
				id: "contextMenuTable"
			},
			actions: new Press({
				rightClick: true,
				xPercentage: 70,
				yPercentage: 50
			}),
			errorMessage: "Could not right-click on third item"
		});

		// Click on "View Details" menu item
		When.waitFor({
			controlType: "sap.m.MenuItem",
			matchers: new Properties({
				text: "View Details"
			}),
			actions: new Press(),
			errorMessage: "Could not press View Details menu item"
		});

		// Verify the context menu action was executed
		Then.waitFor({
			id: "contextMenuPage",
			success: function (oPage) {
				var sAction = oPage.getModel().getProperty("/contextMenuAction");
				Opa5.assert.strictEqual(sAction, "View Details", "Context menu action should be 'View Details'");
			},
			errorMessage: "Context menu action was not set correctly"
		});

		Then.iTeardownMyApp();
	});
});
