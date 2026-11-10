/*global QUnit, sinon */

sap.ui.define([
	"sap/ui/table/qunit/TableQUnitUtils",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/table/RowAction",
	"sap/ui/table/RowActionItem",
	"sap/ui/table/Row",
	"sap/ui/table/Table",
	"sap/ui/table/utils/TableUtils",
	"sap/ui/core/Element",
	"sap/ui/Device"
], function(
	TableQUnitUtils,
	qutils,
	nextUIUpdate,
	RowAction,
	RowActionItem,
	Row,
	Table,
	TableUtils,
	Element,
	Device
) {
	"use strict";

	QUnit.module("API", {
		beforeEach: function() {
			this.oRowAction = new RowAction();
		},
		afterEach: function() {
			this.oRowAction.destroy();
		}
	});

	QUnit.test("getRow", function(assert) {
		const oRow = new Row();
		const oTable = new Table();

		assert.strictEqual(this.oRowAction.getRow(), null, "Returns null if there is no parent");

		oTable.addDependent(this.oRowAction);
		assert.strictEqual(this.oRowAction.getRow(), null, "Returns null if the parent is not a row");

		oRow.addDependent(this.oRowAction);
		assert.equal(this.oRowAction.getRow(), oRow, "Returns the parent row");

		oRow.destroy();
		oTable.destroy();
	});

	QUnit.test("_getSize", function(assert) {
		const oRow = new Row();
		const oTable = new Table();

		assert.strictEqual(this.oRowAction._getSize(), 3, "Returns the maximum of 3 for the row action count");

		oTable.addDependent(oRow);
		oRow.addDependent(this.oRowAction);
		assert.strictEqual(this.oRowAction._getSize(), oTable.getRowActionCount(), "Returns the row action count of the table");

		oTable.setRowActionCount(1);
		assert.strictEqual(this.oRowAction._getSize(), 1, "Returns the row action count of the table");

		oTable.setRowActionCount(4);
		assert.strictEqual(this.oRowAction._getSize(), 3, "Returns the maximum of 3 for the row action count");

		oRow.destroy();
		oTable.destroy();
	});

	QUnit.test("_getVisibleItems", function(assert) {
		this.oRowAction.addItem(new RowActionItem());
		this.oRowAction.addItem(new RowActionItem());
		this.oRowAction.addItem(new RowActionItem());

		assert.deepEqual(this.oRowAction._getVisibleItems(), this.oRowAction.getItems(), "All items visible");

		this.oRowAction.getItems()[1].setVisible(false);
		assert.deepEqual(this.oRowAction._getVisibleItems(), [this.oRowAction.getItems()[0], this.oRowAction.getItems()[2]], "Some items visible");

		this.oRowAction.getItems()[0].setVisible(false);
		this.oRowAction.getItems()[2].setVisible(false);
		assert.deepEqual(this.oRowAction._getVisibleItems(), [], "No items visible");
	});

	QUnit.test("Item.setEnabled before and after icon creation", function(assert) {
		const oItem = new RowActionItem({type: "Delete"});
		this.oRowAction.addItem(oItem);

		oItem.setEnabled(false);
		assert.notOk(oItem._oIcon, "Disabling does not create an icon");

		const oIcon = oItem._getIcon();
		assert.ok(oIcon.getNoTabStop(), "A newly created disabled icon has no tab stop");
		assert.ok(oIcon.hasStyleClass("sapUiTableActionItemDisabled"), "A newly created icon reflects the disabled state");

		oItem.setEnabled(true);
		assert.strictEqual(oItem._oIcon, oIcon, "The existing icon is reused");
		assert.notOk(oIcon.getNoTabStop(), "Re-enabling immediately restores the tab stop");
		assert.notOk(oIcon.hasStyleClass("sapUiTableActionItemDisabled"), "Re-enabling immediately removes the disabled style");

		oItem.setEnabled(false);
		assert.ok(oIcon.getNoTabStop(), "Disabling the existing icon removes the tab stop");
		assert.ok(oIcon.hasStyleClass("sapUiTableActionItemDisabled"), "Disabling the existing icon applies the disabled style");

		oItem.setEnabled(true);
		assert.strictEqual(oItem._oIcon, oIcon, "Re-enabling again reuses the existing icon");
		assert.notOk(oIcon.getNoTabStop(), "Re-enabling again restores the tab stop");
		assert.notOk(oIcon.hasStyleClass("sapUiTableActionItemDisabled"), "Re-enabling again removes the disabled style");
	});

	QUnit.test("Item icon and text updates preserve the enabled state", function(assert) {
		const oItem = new RowActionItem({enabled: false});
		this.oRowAction.addItem(oItem);

		oItem.setIcon("sap-icon://search");
		assert.notOk(oItem._oIcon, "Setting the source does not create an icon");
		oItem.setText("Search");
		assert.notOk(oItem._oIcon, "Setting the text does not create an icon");

		const oIcon = oItem._getIcon();
		assert.strictEqual(oIcon.getSrc(), "sap-icon://search", "The initial icon source is applied");
		assert.strictEqual(oIcon.getTooltip(), "Search", "The initial text is applied");

		oItem.setIcon("sap-icon://edit");
		assert.strictEqual(oIcon.getSrc(), "sap-icon://edit", "The existing icon source is updated");
		assert.strictEqual(oIcon.getTooltip(), "Search", "Changing the source preserves the tooltip");

		oItem.setText("Edit");
		assert.strictEqual(oIcon.getTooltip(), "Edit", "The existing icon tooltip is updated");
		assert.strictEqual(oIcon.getSrc(), "sap-icon://edit", "Changing the text preserves the source");
		assert.ok(oIcon.getNoTabStop(), "Updating the source and text preserves the disabled tab stop");
		assert.ok(oIcon.hasStyleClass("sapUiTableActionItemDisabled"), "Updating the source and text preserves the disabled style");

		oItem.setEnabled(true);
		assert.strictEqual(oIcon.getSrc(), "sap-icon://edit", "Re-enabling preserves the source");
		assert.strictEqual(oIcon.getTooltip(), "Edit", "Re-enabling preserves the tooltip");
	});

	QUnit.test("Item overflow updates do not create or revive menu items", function(assert) {
		const oItem = new RowActionItem();
		this.oRowAction.addItem(oItem);

		oItem.setText("Search").setIcon("sap-icon://search").setEnabled(false);
		assert.notOk(oItem._oMenuItem, "Updating properties does not create an overflow menu item");

		const oMenuItem = oItem._getOverflowMenuItem();
		assert.strictEqual(oMenuItem.getText(), "Search", "The initial menu text is applied");
		assert.strictEqual(oMenuItem.getIcon(), "sap-icon://search", "The initial menu icon is applied");
		assert.notOk(oMenuItem.getEnabled(), "The initial menu enabled state is applied");
		oMenuItem.destroy();

		const aSetters = ["setText", "setIcon", "setEnabled"].map((sMethod) => this.spy(oMenuItem, sMethod));
		oItem.setText("Edit").setIcon("sap-icon://edit").setEnabled(true);
		assert.ok(aSetters.every((oSpy) => !oSpy.called), "Destroyed menu items are not updated");
		assert.strictEqual(oItem._oMenuItem, oMenuItem, "Updating properties does not create a replacement menu item");
	});

	QUnit.test("Item.getRowAction", function(assert) {
		const oItem = new RowActionItem();
		const oRow = new Row();

		assert.strictEqual(oItem.getRowAction(), null, "Returns null if there is no parent");

		oRow.addDependent(oItem);
		assert.strictEqual(oItem.getRowAction(), null, "Returns null if the parent is not a row action");

		this.oRowAction.addDependent(oItem);
		assert.equal(oItem.getRowAction(), this.oRowAction, "Returns the parent row action");

		oItem.destroy();
		oRow.destroy();
	});

	QUnit.test("Item._getIconUri", function(assert) {
		const oItem = new RowActionItem();

		this.oRowAction.addItem(oItem);
		assert.ok(!oItem._getIconUri(), "No Icon set");

		oItem.setType("Navigation");
		assert.equal(oItem._getIconUri(), "sap-icon://navigation-right-arrow", "No Icon set but type");

		oItem.setIcon("sap-icon://search");
		assert.equal(oItem._getIconUri(), "sap-icon://search", "Custom Icon set");
	});

	QUnit.test("Item._getText", function(assert) {
		const oItem = new RowActionItem();
		const sText = TableUtils.getResourceText("TBL_ROW_ACTION_NAVIGATE");

		this.oRowAction.addItem(oItem);
		assert.ok(!oItem._getText(false), "No Text or Tooltip set (Text preferred)");
		assert.ok(!oItem._getText(true), "No Text or Tooltip set (Tooltip preferred)");

		oItem.setType("Navigation");
		assert.equal(oItem._getText(false), sText, "No Text or Tooltip set but type (Text preferred)");
		assert.equal(oItem._getText(true), sText, "No Text or Tooltip set but type (Tooltip preferred)");

		oItem.setTooltip("TT");
		assert.equal(oItem._getText(false), "TT", "No Text or Tooltip set but type (Text preferred)");
		assert.equal(oItem._getText(true), "TT", "No Text or Tooltip set but type (Tooltip preferred)");

		oItem.setText("T");
		assert.equal(oItem._getText(false), "T", "No Text or Tooltip set but type (Text preferred)");
		assert.equal(oItem._getText(true), "TT", "No Text or Tooltip set but type (Tooltip preferred)");
	});

	QUnit.module("Rendering", {
		beforeEach: async function() {
			this.oRowAction = new RowAction();
			this.oRowAction.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function() {
			this.oRowAction.destroy();
		}
	});

	async function checkRendering(oRowAction, assert) {
		await nextUIUpdate();

		const aRowActionItems = oRowAction._getVisibleItems();
		const oNavigationItem = aRowActionItems.find((oItem) => oItem.getType() === "Navigation");
		// move the navigation item to the end of the array
		if (oNavigationItem) {
			aRowActionItems.push(aRowActionItems.splice(aRowActionItems.indexOf(oNavigationItem), 1)[0]);
		}

		const aChildren = oRowAction.getDomRef().children;
		assert.equal(aChildren.length, aRowActionItems.length, "Number of icons is correct");

		for (let i = 0; i < aRowActionItems.length; i++) {
			assert.ok(aChildren[i].classList.contains("sapUiTableActionIcon"), "Icon is rendered");

			let sText = aRowActionItems[i].getText();
			if (!sText) {
				if (aRowActionItems[i].getType() === "Navigation") {
					sText = TableUtils.getResourceText("TBL_ROW_ACTION_NAVIGATE");
				} else if (aRowActionItems[i].getType() === "Delete") {
					sText = TableUtils.getResourceText("TBL_ROW_ACTION_DELETE");
				}
			}
			assert.equal(aChildren[i].getAttribute("aria-label"), sText, "Aria-label is correct");
			const oTitleEl = aChildren[i].querySelector(".sapUiIconTitle");
			assert.equal(oTitleEl && oTitleEl.getAttribute("title"), sText, "Tooltip is correct");
			assert.equal(Element.closestTo(aChildren[i]).getSrc(), aRowActionItems[i]._getIconUri(), "Icon src is correct");
		}
	}

	QUnit.test("addItem / removeItem", async function(assert) {
		this.oRowAction.addItem(new RowActionItem({icon: "sap-icon://search", text: "Search"}));
		this.oRowAction.addItem(new RowActionItem({icon: "sap-icon://delete", text: "Delete"}));
		await checkRendering(this.oRowAction, assert);

		this.oRowAction.removeItem(this.oRowAction.getItems()[0]);
		await checkRendering(this.oRowAction, assert);
	});

	QUnit.test("insertItem / removeAllItems", async function(assert) {
		this.oRowAction.insertItem(new RowActionItem({icon: "sap-icon://search", text: "Search"}), 0);
		await checkRendering(this.oRowAction, assert);

		this.oRowAction.insertItem(new RowActionItem({icon: "sap-icon://delete", text: "Delete"}), 0);
		await checkRendering(this.oRowAction, assert);

		this.oRowAction.insertItem(new RowActionItem({icon: "sap-icon://account", text: "Account"}), 1);
		await checkRendering(this.oRowAction, assert);

		this.oRowAction.removeAllItems();
		await checkRendering(this.oRowAction, assert);
	});

	QUnit.test("addItem / destroyItems", async function(assert) {
		this.oRowAction.addItem(new RowActionItem({icon: "sap-icon://search", text: "Search"}));
		await checkRendering(this.oRowAction, assert);

		this.oRowAction.destroyItems();
		await checkRendering(this.oRowAction, assert);
	});

	QUnit.test("Item.setVisible", async function(assert) {
		this.oRowAction.addItem(new RowActionItem({icon: "sap-icon://search", text: "Search"}));
		await checkRendering(this.oRowAction, assert);

		this.oRowAction.getItems()[0].setVisible(false);
		await checkRendering(this.oRowAction, assert);
	});

	QUnit.test("Type Navigation", async function(assert) {
		this.oRowAction.addItem(new RowActionItem({type: "Navigation"}));
		await checkRendering(this.oRowAction, assert);

		this.oRowAction.addItem(new RowActionItem({icon: "sap-icon://search", text: "Search"}));
		await checkRendering(this.oRowAction, assert);

		this.oRowAction.addItem(new RowActionItem({type: "Delete"}));
		await checkRendering(this.oRowAction, assert);
	});

	QUnit.test("Item type and tooltip updates", async function(assert) {
		const oItem = new RowActionItem({type: "Navigation"});
		this.oRowAction.addItem(oItem);
		await nextUIUpdate();
		const oIcon = oItem._oIcon;

		oItem.setType("Delete");
		await checkRendering(this.oRowAction, assert);
		assert.strictEqual(oItem._oIcon, oIcon, "Changing the type reuses the existing icon");

		oItem.setText("Remove").setTooltip("Remove this entry");
		await nextUIUpdate();
		assert.strictEqual(oIcon.getTooltip(), "Remove this entry", "An explicit tooltip takes precedence");
		assert.strictEqual(oIcon.getDomRef().querySelector(".sapUiIconTitle").getAttribute("title"), "Remove this entry",
			"The explicit tooltip is rendered");

		oItem.setText("Delete entry").setEnabled(false).setIcon("sap-icon://edit");
		assert.strictEqual(oIcon.getTooltip(), "Remove this entry", "Text, enabled, and icon updates preserve an explicit tooltip");

		oItem.setTooltip(null);
		await nextUIUpdate();
		assert.strictEqual(oIcon.getTooltip(), "Delete entry", "Removing the tooltip restores the text");

		oItem.setText("").setIcon(null);
		assert.strictEqual(oIcon.getTooltip(), TableUtils.getResourceText("TBL_ROW_ACTION_DELETE"),
			"Clearing text restores the type's default text");
		assert.strictEqual(oIcon.getSrc(), oItem._getIconUri(), "Clearing the custom icon restores the type's default icon");
		assert.ok(oIcon.getNoTabStop(), "Updating the type, text, and tooltip preserves the disabled state");
	});

	QUnit.test("No icons with a row action count of zero", async function(assert) {
		const oItem = new RowActionItem({type: "Navigation"});
		this.oRowAction.addItem(oItem);
		this.oRowAction.addItem(new RowActionItem({type: "Delete"}));
		const oGetSizeStub = this.stub(this.oRowAction, "_getSize").returns(0);
		await nextUIUpdate();

		assert.strictEqual(this.oRowAction.getDomRef().children.length, 0, "Neither actions nor overflow are rendered");
		assert.notOk(oItem._oIcon, "No action icon is created");
		assert.notOk(this.oRowAction._oOverflowIcon, "No overflow icon is created");

		oGetSizeStub.returns(1);
		this.oRowAction.invalidate();
		await nextUIUpdate();
		assert.strictEqual(this.oRowAction.getDomRef().children.length, 1, "Increasing the count renders overflow");

		oGetSizeStub.returns(0);
		this.oRowAction.invalidate();
		await nextUIUpdate();
		assert.strictEqual(this.oRowAction.getDomRef().children.length, 0, "Reducing the count removes the cached overflow icon");

		oGetSizeStub.returns(2);
		this.oRowAction.invalidate();
		await checkRendering(this.oRowAction, assert);
	});

	QUnit.test("Overflow", async function(assert) {
		const oTable = TableQUnitUtils.createTable({
			rows: {path: "/"},
			models: TableQUnitUtils.createJSONModel(1),
			rowActionCount: 3,
			columns: [
				TableQUnitUtils.createTextColumn({
					label: "A",
					text: "A",
					bind: true
				})
			],
			rowActionTemplate: new RowAction({
				items: [
					new RowActionItem({icon: "sap-icon://search", text: "Search"}),
					new RowActionItem({icon: "sap-icon://delete", text: "Delete"}),
					new RowActionItem({icon: "sap-icon://account", text: "Account"}),
					new RowActionItem({icon: "sap-icon://attachment", text: "Attachment"})
				]
			})
		});
		oTable.placeAt("qunit-fixture");
		await nextUIUpdate();

		const oRowAction = oTable.getRows()[0].getRowAction();
		const aChildren = oRowAction.getDomRef().children;
		const sOverflowButtonLabel = TableUtils.getResourceText("TBL_ROW_ACTION_MORE");

		assert.equal(aChildren.length, 3, "Number of icons is correct");
		assert.ok(aChildren[0].classList.contains("sapUiTableActionIcon"), "Icon is rendered");
		assert.equal(aChildren[0].getAttribute("aria-label"), "Search", "Aria-label is correct");
		assert.equal(aChildren[0].querySelector(".sapUiIconTitle").getAttribute("title"), "Search", "Tooltip is correct");
		assert.equal(Element.closestTo(aChildren[0]).getSrc(), "sap-icon://search", "Icon is correct");

		assert.ok(aChildren[1].classList.contains("sapUiTableActionIcon"), "Icon is rendered");
		assert.equal(aChildren[1].getAttribute("aria-label"), "Delete", "Aria-label is correct");
		assert.equal(aChildren[1].querySelector(".sapUiIconTitle").getAttribute("title"), "Delete", "Tooltip is correct");
		assert.equal(Element.closestTo(aChildren[1]).getSrc(), "sap-icon://delete", "Icon is correct");

		assert.ok(aChildren[2].classList.contains("sapUiTableActionIcon"), "Icon is rendered");
		assert.equal(aChildren[2].getAttribute("aria-label"), sOverflowButtonLabel, "Aria-label is correct");
		assert.equal(aChildren[2].querySelector(".sapUiIconTitle").getAttribute("title"), sOverflowButtonLabel, "Tooltip is correct");
		assert.equal(Element.closestTo(aChildren[2]).getSrc(), "sap-icon://overflow", "Icon is correct");
		assert.equal(aChildren[2].getAttribute("aria-haspopup"), "menu", "aria-haspopup on overflow icon");
		assert.equal(oTable._oRowActionOverflowMenu, undefined, "Menu not initialized");

		qutils.triggerEvent(Device.support.touch && !Device.system.desktop ? "tap" : "click", aChildren[2]);
		await nextUIUpdate();
		assert.ok(oTable._oRowActionOverflowMenu, "Menu initialized");
		assert.ok(oTable._oRowActionOverflowMenu.isA("sap.ui.unified.Menu"), "Menu is of type sap.ui.unified.Menu");
		assert.ok(oTable._oRowActionOverflowMenu.isOpen(), "Menu is open");

		let aMenuItems = oTable._oRowActionOverflowMenu.getItems();
		const aPreviousMenuItems = aMenuItems.slice();

		assert.equal(aMenuItems.length, 2, "Menu has 2 items");
		assert.equal(aMenuItems[0].getText(), "Account", "Menu item text is correct");
		assert.equal(aMenuItems[0].getIcon(), "sap-icon://account", "Menu item icon is correct");
		assert.equal(aMenuItems[1].getText(), "Attachment", "Menu item text is correct");
		assert.equal(aMenuItems[1].getIcon(), "sap-icon://attachment", "Menu item icon is correct");

		oRowAction.addItem(new RowActionItem({type: "Navigation"}));
		await nextUIUpdate();

		assert.equal(aChildren.length, 3, "Number of icons is correct");
		assert.ok(aChildren[0].classList.contains("sapUiTableActionIcon"), "Icon is rendered");
		assert.equal(aChildren[0].getAttribute("aria-label"), "Search", "Aria-label is correct");
		assert.equal(aChildren[0].querySelector(".sapUiIconTitle").getAttribute("title"), "Search", "Tooltip is correct");
		assert.equal(Element.closestTo(aChildren[0]).getSrc(), "sap-icon://search", "Icon is correct");

		assert.ok(aChildren[1].classList.contains("sapUiTableActionIcon"), "Icon is rendered");
		assert.equal(aChildren[1].getAttribute("aria-label"), sOverflowButtonLabel, "Aria-label is correct");
		assert.equal(aChildren[1].querySelector(".sapUiIconTitle").getAttribute("title"), sOverflowButtonLabel, "Tooltip is correct");
		assert.equal(Element.closestTo(aChildren[1]).getSrc(), "sap-icon://overflow", "Icon is correct");
		assert.equal(aChildren[1].getAttribute("aria-haspopup"), "menu", "aria-haspopup on overflow icon");

		qutils.triggerEvent(Device.support.touch && !Device.system.desktop ? "tap" : "click", aChildren[1]);
		await nextUIUpdate();
		assert.ok(oTable._oRowActionOverflowMenu.isA("sap.ui.unified.Menu"), "Menu is of type sap.ui.unified.Menu");
		assert.ok(oTable._oRowActionOverflowMenu.isOpen(), "Menu is open");
		aMenuItems = oTable._oRowActionOverflowMenu.getItems();
		assert.ok(aPreviousMenuItems.every((oItem) => oItem.isDestroyed()), "Replaced menu items are destroyed");
		assert.equal(aMenuItems.length, 3, "Menu has 3 items");
		assert.equal(aMenuItems[0].getText(), "Delete", "Menu item text is correct");
		assert.equal(aMenuItems[0].getIcon(), "sap-icon://delete", "Menu item icon is correct");
		assert.equal(aMenuItems[1].getText(), "Account", "Menu item text is correct");
		assert.equal(aMenuItems[1].getIcon(), "sap-icon://account", "Menu item icon is correct");
		assert.equal(aMenuItems[2].getText(), "Attachment", "Menu item text is correct");
		assert.equal(aMenuItems[2].getIcon(), "sap-icon://attachment", "Menu item icon is correct");

		assert.ok(aChildren[2].classList.contains("sapUiTableActionIcon"), "Icon is rendered");
		assert.equal(aChildren[2].getAttribute("aria-label"), "Details", "Aria-label is correct");
		assert.equal(aChildren[2].querySelector(".sapUiIconTitle").getAttribute("title"), "Details", "Tooltip is correct");
		assert.equal(Element.closestTo(aChildren[2]).getSrc(), "sap-icon://navigation-right-arrow", "Icon is correct");

		const oIconSearch = Element.closestTo(aChildren[0]);
		const oIconOverflow = Element.closestTo(aChildren[1]);
		const oIconDetails = Element.closestTo(aChildren[2]);
		oTable.destroy();
		assert.ok(oIconSearch.isDestroyed(), "Search icon destroyed");
		assert.ok(oIconOverflow.isDestroyed(), "Overflow icon destroyed");
		assert.ok(oIconDetails.isDestroyed(), "Details icon destroyed");
		assert.ok(oRowAction.isDestroyed(), "RowAction destroyed");
		assert.ok(oTable._oRowActionOverflowMenu.isDestroyed(), "Overflow menu destroyed");
	});

	QUnit.module("Behavior", {
		beforeEach: async function() {
			this.oRowAction = new RowAction();
			this.oRowAction.addItem(new RowActionItem({icon: "sap-icon://search", text: "A"}));
			this.oRowAction.addItem(new RowActionItem({icon: "sap-icon://delete", tooltip: "B"}));
			this.oRow = new Row();
			sinon.stub(this.oRowAction, "getRow").returns(this.oRow);
			this.oRowAction.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function() {
			this.oRow.destroy();
			this.oRowAction.destroy();
		}
	});

	QUnit.test("Press on first item", function(assert) {
		let oEventParams = null;
		this.oRowAction.getItems()[0].attachPress((oEvent) => {
			oEventParams = oEvent.getParameters();
		});
		qutils.triggerEvent("click", this.oRowAction.getDomRef().children[0]);
		assert.ok(!!oEventParams, "Press Event Triggered");
		assert.equal(oEventParams.row, this.oRow, "Event Parameter 'row'");
		assert.equal(oEventParams.item, this.oRowAction.getItems()[0], "Event Parameter 'item'");
	});

	QUnit.test("Press on second item", function(assert) {
		let oEventParams = null;
		this.oRowAction.getItems()[1].attachPress((oEvent) => {
			oEventParams = oEvent.getParameters();
		});
		qutils.triggerEvent("click", this.oRowAction.getDomRef().children[1]);
		assert.ok(!!oEventParams, "Press Event Triggered");
		assert.equal(oEventParams.row, this.oRow, "Event Parameter 'row'");
		assert.equal(oEventParams.item, this.oRowAction.getItems()[1], "Event Parameter 'item'");
	});

	QUnit.test("Press on menu item", async function(assert) {
		const oTable = TableQUnitUtils.createTable({
			rows: {path: "/"},
			models: TableQUnitUtils.createJSONModel(1),
			rowActionCount: 3,
			columns: [
				TableQUnitUtils.createTextColumn({
					label: "A",
					text: "A",
					bind: true
				})
			],
			rowActionTemplate: new RowAction({
				items: [
					new RowActionItem({icon: "sap-icon://search", text: "Search"}),
					new RowActionItem({icon: "sap-icon://delete", text: "Delete"}),
					new RowActionItem({icon: "sap-icon://account", text: "Account"}),
					new RowActionItem({icon: "sap-icon://attachment", text: "Attachment"})
				]
			})
		});
		oTable.placeAt("qunit-fixture");
		await nextUIUpdate();

		const oRowAction = oTable.getRows()[0].getRowAction();
		qutils.triggerEvent(Device.support.touch && !Device.system.desktop ? "tap" : "click", oRowAction.getDomRef().children[2]);

		const oMenu = oTable._oRowActionOverflowMenu;
		assert.ok(oMenu, "Menu initialized");
		assert.ok(oMenu.isA("sap.ui.unified.Menu"), "Menu is of type sap.ui.unified.Menu");
		assert.ok(oMenu.isOpen(), "Menu is open");
		assert.equal(oMenu.getItems().length, 2, "Menu has 2 items");

		let oEventParams = null;
		oRowAction.getItems()[2].attachPress((oEvent) => {
			oEventParams = oEvent.getParameters();
		});

		qutils.triggerEvent("click", oMenu.getItems()[0].getDomRef());
		assert.ok(!!oEventParams, "Press Event Triggered");
		assert.equal(oEventParams.row, oTable.getRows()[0], "Event Parameter 'row'");
		assert.equal(oEventParams.item, oRowAction.getItems()[2], "Event Parameter 'item'");

		oTable.destroy();
	});

	QUnit.test("onKeyboardShortcut", function(assert) {
		let oEventParams1;
		let oEventParams2;
		const oRowActionItem1 = new RowActionItem("I1", {type: "Navigation", press: (oEvent) => { oEventParams1 = oEvent.getParameters(); }});
		const oRowActionItem2 = new RowActionItem("I2", {type: "Delete", press: (oEvent) => { oEventParams2 = oEvent.getParameters(); }});
		this.oRowAction.addItem(oRowActionItem1);
		this.oRowAction.addItem(oRowActionItem2);

		oRowActionItem1.onKeyboardShortcut("navigation");
		oRowActionItem2.onKeyboardShortcut("navigation");

		assert.ok(!!oEventParams1, "Press Event Triggered on navigation item");
		assert.equal(oEventParams1.row, this.oRow, "Event Parameter 'row'");
		assert.equal(oEventParams1.item, oRowActionItem1, "Event Parameter 'item'");
		assert.notOk(!!oEventParams2, "Press Event not Triggered on deletion item");
	});

	QUnit.test("Disabled actions suppress pointer, keyboard, and shortcut activation", async function(assert) {
		const oItem = this.oRowAction.getItems()[0];
		oItem.setType("Navigation");
		const fnPress = this.spy();
		oItem.attachPress(fnPress);
		oItem.setEnabled(false);
		await nextUIUpdate();

		const oIcon = oItem._getIcon();
		qutils.triggerEvent("click", oIcon.getDomRef());
		qutils.triggerEvent("tap", oIcon.getDomRef());
		qutils.triggerKeydown(oIcon.getDomRef(), "ENTER");
		qutils.triggerKeyup(oIcon.getDomRef(), "ENTER");
		qutils.triggerKeydown(oIcon.getDomRef(), "SPACE");
		qutils.triggerKeyup(oIcon.getDomRef(), "SPACE");
		oItem.onKeyboardShortcut("navigation");
		assert.notOk(fnPress.called, "Disabled actions never fire press");

		oItem.setEnabled(true);
		await nextUIUpdate();
		qutils.triggerEvent(Device.support.touch && !Device.system.desktop ? "tap" : "click", oIcon.getDomRef());
		oItem.onKeyboardShortcut("navigation");
		assert.strictEqual(fnPress.callCount, 2, "Re-enabled actions support pointer and shortcut activation");
		assert.strictEqual(fnPress.firstCall.args[0].getParameter("item"), oItem, "The item parameter is preserved");
		assert.strictEqual(fnPress.firstCall.args[0].getParameter("row"), this.oRow, "The row parameter is preserved");
	});

	QUnit.test("Hidden actions suppress pointer and shortcut activation", async function(assert) {
		const oItem = this.oRowAction.getItems()[0];
		const fnPress = this.spy();
		oItem.setType("Navigation").attachPress(fnPress);
		const oIcon = oItem._getIcon();
		const oGetSizeStub = this.stub(this.oRowAction, "_getSize").returns(3);

		oItem.setVisible(false);
		await nextUIUpdate();
		assert.notOk(oIcon.getDomRef(), "An invisible item's icon is not rendered");
		oItem.onKeyboardShortcut("navigation");
		assert.notOk(fnPress.called, "Invisible items do not fire press");

		oItem.setVisible(true);
		this.oRowAction.setVisible(false);
		await nextUIUpdate();
		assert.ok(this.oRowAction.getDomRef().classList.contains("sapUiTableActionHidden"), "The row action is marked as hidden");
		qutils.triggerEvent("click", oIcon.getDomRef());
		oItem.onKeyboardShortcut("navigation");
		assert.notOk(fnPress.called, "Items in an invisible row action do not fire press");

		this.oRowAction.setVisible(true);
		oGetSizeStub.returns(0);
		await nextUIUpdate();
		assert.notOk(oIcon.getDomRef(), "No action icon is rendered with zero slots");
		oItem.onKeyboardShortcut("navigation");
		assert.notOk(fnPress.called, "Items do not fire press when the row action column is hidden");

		oGetSizeStub.returns(3);
		this.oRowAction.invalidate();
		await nextUIUpdate();
		assert.ok(oIcon.getDomRef(), "Restoring visibility and slots renders the action icon");
		qutils.triggerEvent("click", oIcon.getDomRef());
		oItem.onKeyboardShortcut("navigation");
		assert.strictEqual(fnPress.callCount, 2, "Restoring visibility and slots restores pointer and shortcut activation");
	});

	QUnit.test("Item.setEnabled updates the icon without rendering the row action", async function(assert) {
		const oItem = this.oRowAction.getItems()[0];
		const oIcon = oItem._getIcon();
		const fnRowActionRendering = this.spy();
		const fnIconRendering = this.spy();
		this.oRowAction.addEventDelegate({onBeforeRendering: fnRowActionRendering});
		oIcon.addEventDelegate({onBeforeRendering: fnIconRendering});

		for (const bEnabled of [false, true]) {
			oItem.setEnabled(bEnabled);
			await nextUIUpdate();

			assert.strictEqual(oIcon.getDomRef().getAttribute("aria-disabled"), bEnabled ? null : "true",
				"The accessibility state is updated with enabled=" + bEnabled);
			assert.strictEqual(oIcon.getNoTabStop(), !bEnabled, "The tab stop is updated with enabled=" + bEnabled);
			assert.strictEqual(oIcon.hasStyleClass("sapUiTableActionItemDisabled"), !bEnabled,
				"The disabled style is updated with enabled=" + bEnabled);
		}

		assert.ok(fnIconRendering.calledTwice, "The icon renders for each state change");
		assert.notOk(fnRowActionRendering.called, "The row action does not render");
	});

	QUnit.test("Disabled appearance and accessibility", async function(assert) {
		const oItem = this.oRowAction.getItems()[0];
		oItem.setEnabled(false);
		await nextUIUpdate();

		const oIcon = oItem._getIcon();
		const oDomRef = oIcon.getDomRef();
		const oStyle = getComputedStyle(oDomRef);
		assert.ok(oDomRef.classList.contains("sapUiTableActionItemDisabled"), "The disabled style is applied");
		assert.strictEqual(oStyle.opacity, oStyle.getPropertyValue("--sapContent_DisabledOpacity").trim(),
			"The theme's disabled opacity is used");
		assert.strictEqual(oStyle.cursor, "default", "The disabled action has no pointer cursor");
		assert.strictEqual(oStyle.pointerEvents, "none", "The disabled action is excluded from pointer hit-testing");
		assert.strictEqual(oDomRef.getAttribute("role"), "button", "The action retains its button semantics");
		assert.strictEqual(oDomRef.getAttribute("aria-disabled"), "true", "The disabled state is announced");

		oItem.setEnabled(true);
		await nextUIUpdate();
		assert.notOk(oIcon.hasStyleClass("sapUiTableActionItemDisabled"), "Re-enabling removes the disabled style");
		assert.strictEqual(getComputedStyle(oIcon.getDomRef()).pointerEvents, "auto", "Re-enabling restores pointer hit-testing");
		assert.notOk(oIcon.getDomRef().hasAttribute("aria-disabled"), "Re-enabling removes the disabled accessibility state");
	});

	["sapUiSizeCompact", "sapUiSizeCozy", "sapUiSizeCondensed"].forEach((sDensity) => {
		QUnit.test("Disabling preserves layout: " + sDensity, async function(assert) {
			this.oRowAction.addStyleClass(sDensity);
			await nextUIUpdate();

			const oItem = this.oRowAction.getItems()[0];
			const oIcon = oItem._getIcon();
			const oEnabledRect = oIcon.getDomRef().getBoundingClientRect();
			const iNextItemLeft = this.oRowAction.getDomRef().children[1].getBoundingClientRect().left;

			assert.ok(oEnabledRect.width > 0 && oEnabledRect.height > 0, "The action has a measurable size");

			for (const bEnabled of [false, true]) {
				oItem.setEnabled(bEnabled);
				await nextUIUpdate();

				const oRect = oIcon.getDomRef().getBoundingClientRect();
				assert.strictEqual(oRect.width, oEnabledRect.width, "Width is preserved with enabled=" + bEnabled);
				assert.strictEqual(oRect.height, oEnabledRect.height, "Height is preserved with enabled=" + bEnabled);
				assert.strictEqual(this.oRowAction.getDomRef().children[1].getBoundingClientRect().left, iNextItemLeft,
					"Other actions do not shift with enabled=" + bEnabled);
			}
		});
	});

	QUnit.module("Overflow handling", {
		async beforeEach() {
			this.oTable = TableQUnitUtils.createTable({
				rows: {path: "/"},
				models: TableQUnitUtils.createJSONModel(2),
				rowActionCount: 2,
				columns: [TableQUnitUtils.createTextColumn({label: "A", text: "A", bind: true})],
				rowActionTemplate: new RowAction()
			});
			this.oTable.placeAt("qunit-fixture");
			await nextUIUpdate();
			this.oRowAction = this.oTable.getRows()[0].getRowAction();
		},
		afterEach() {
			this.oTable.destroy();
		}
	});

	[1, 2, 3].forEach((iSize) => {
		QUnit.test("Duplicate action types appear exactly once with " + iSize + " slots", async function(assert) {
			const mTypes = {N: "Navigation", D: "Delete", C: "Custom"};
			const aScenarios = [
				{
					items: ["D1", "D2"],
					direct: [["overflow"], ["D1", "D2"], ["D1", "D2"]],
					overflow: [["D1", "D2"], [], []]
				},
				{
					items: ["N1", "N2"],
					direct: [["overflow"], ["N1", "N2"], ["N1", "N2"]],
					overflow: [["N1", "N2"], [], []]
				},
				{
					items: ["N1", "D1"],
					direct: [["overflow"], ["D1", "N1"], ["D1", "N1"]],
					overflow: [["D1", "N1"], [], []]
				},
				{
					items: ["N1", "D1", "N2"],
					direct: [["overflow"], ["overflow", "N1"], ["D1", "N1", "N2"]],
					overflow: [["D1", "N1", "N2"], ["D1", "N2"], []]
				},
				{
					items: ["D1", "N1", "D2", "N2"],
					direct: [["overflow"], ["overflow", "N1"], ["overflow", "N1", "N2"]],
					overflow: [["D1", "D2", "N1", "N2"], ["D1", "D2", "N2"], ["D1", "D2"]]
				},
				{
					items: ["N1", "N2", "N3", "N4"],
					direct: [["overflow"], ["overflow", "N1"], ["overflow", "N1", "N2"]],
					overflow: [["N1", "N2", "N3", "N4"], ["N2", "N3", "N4"], ["N3", "N4"]]
				},
				{
					items: ["C1", "D1", "C2", "D2"],
					direct: [["overflow"], ["C1", "overflow"], ["C1", "D1", "overflow"]],
					overflow: [["C1", "D1", "C2", "D2"], ["D1", "C2", "D2"], ["C2", "D2"]]
				}
			];
			this.oTable.setRowActionCount(iSize);

			for (const oScenario of aScenarios) {
				this.oRowAction.destroyItems();
				const fnPress = this.spy();
				const aItems = oScenario.items.map((sText, iIndex) => new RowActionItem({
					type: mTypes[sText[0]],
					icon: sText.startsWith("C") ? "sap-icon://edit" : null,
					text: sText,
					enabled: iIndex % 2 === 0,
					press: fnPress
				}));
				aItems.forEach((oItem) => this.oRowAction.addItem(oItem));
				this.oRowAction.addItem(new RowActionItem({type: "Navigation", text: "Hidden navigation", visible: false}));
				this.oRowAction.addItem(new RowActionItem({type: "Delete", text: "Hidden delete", visible: false}));
				await nextUIUpdate();

				const sContext = oScenario.items.join(", ") + ": ";
				const aIcons = Array.from(this.oRowAction.getDomRef().children, (oChild) => Element.closestTo(oChild));
				assert.deepEqual(aIcons.map((oIcon) => (oIcon === this.oRowAction._oOverflowIcon ? "overflow" : oIcon.getParent().getText())),
					oScenario.direct[iSize - 1], sContext + "Direct actions retain their order and navigation priority");

				for (const oIcon of aIcons) {
					if (oIcon !== this.oRowAction._oOverflowIcon) {
						qutils.triggerEvent("click", oIcon.getDomRef());
					}
				}

				if (oScenario.overflow[iSize - 1].length > 0) {
					qutils.triggerEvent("click", this.oRowAction._oOverflowIcon.getDomRef());
					await nextUIUpdate();
					const oMenu = this.oTable._oRowActionOverflowMenu;
					assert.deepEqual(oMenu.getItems().map((oItem) => oItem.getText()), oScenario.overflow[iSize - 1],
						sContext + "Every remaining action appears once in overflow");
					for (const oMenuItem of oMenu.getItems()) {
						const oItem = aItems.find((oActionItem) => oActionItem.getText() === oMenuItem.getText());
						assert.strictEqual(oMenuItem.getEnabled(), oItem.getEnabled(),
							sContext + oItem.getText() + " retains its enabled state");
						if (!oMenu.isOpen()) {
							qutils.triggerEvent("click", this.oRowAction._oOverflowIcon.getDomRef());
							await nextUIUpdate();
						}
						const oCurrentMenuItem = oMenu.getItems().find((oCurrentItem) => oCurrentItem.getText() === oItem.getText());
						qutils.triggerEvent("click", oCurrentMenuItem.getDomRef());
					}
					oMenu.close();
				}

				assert.strictEqual(fnPress.callCount, aItems.filter((oItem) => oItem.getEnabled()).length,
					sContext + "Each enabled action fires once; disabled actions never fire");
				for (const oItem of aItems) {
					assert.strictEqual(fnPress.getCalls().filter((oCall) => oCall.args[0].getParameter("item") === oItem).length,
						oItem.getEnabled() ? 1 : 0, sContext + oItem.getText() + " retains its individual handler");
				}
			}
		});
	});

	QUnit.test("Switching rows destroys replaced menu items and recreates their current state", async function(assert) {
		const aRowActions = this.oTable.getRows().slice(0, 2).map((oRow) => oRow.getRowAction());
		aRowActions.forEach((oRowAction) => {
			oRowAction.addItem(new RowActionItem({type: "Delete", text: "First"}));
			oRowAction.addItem(new RowActionItem({type: "Delete", text: "Second", enabled: false}));
			oRowAction.addItem(new RowActionItem({type: "Delete", text: "Third"}));
		});
		await nextUIUpdate();

		qutils.triggerEvent("click", aRowActions[0]._oOverflowIcon.getDomRef());
		await nextUIUpdate();
		const oMenu = this.oTable._oRowActionOverflowMenu;
		const aFirstRowMenuItems = oMenu.getItems().slice();
		assert.notOk(aFirstRowMenuItems[0].getEnabled(), "The first row has a disabled overflow action");
		oMenu.close();

		qutils.triggerEvent("click", aRowActions[1]._oOverflowIcon.getDomRef());
		await nextUIUpdate();
		const aSecondRowMenuItems = oMenu.getItems().slice();
		assert.ok(aFirstRowMenuItems.every((oItem) => oItem.isDestroyed()), "Switching rows destroys the first row's menu items");
		aRowActions[0].getItems()[1].setEnabled(true).setText("Updated").setIcon("sap-icon://edit");
		assert.notOk(aSecondRowMenuItems[0].getEnabled(), "Updating the previous row does not affect the current row's menu");
		assert.strictEqual(aSecondRowMenuItems[0].getText(), "Second", "The current row's text is unchanged");
		oMenu.close();

		qutils.triggerEvent("click", aRowActions[0]._oOverflowIcon.getDomRef());
		await nextUIUpdate();
		assert.strictEqual(this.oTable._oRowActionOverflowMenu, oMenu, "Both rows share the same menu");
		assert.ok(aSecondRowMenuItems.every((oItem) => oItem.isDestroyed()), "Reopening destroys the second row's menu items");
		assert.ok(oMenu.getItems()[0].getEnabled(), "Recreated menu items use the current enabled state");
		assert.strictEqual(oMenu.getItems()[0].getText(), "Updated", "Recreated menu items use the current text");
		assert.strictEqual(oMenu.getItems()[0].getIcon(), "sap-icon://edit", "Recreated menu items use the current icon");
	});

	QUnit.module("Disabled overflow actions", {
		async beforeEach() {
			this.oTable = TableQUnitUtils.createTable({
				rows: {path: "/"},
				models: TableQUnitUtils.createJSONModel(1),
				rowActionCount: 2,
				columns: [TableQUnitUtils.createTextColumn({label: "A", text: "A", bind: true})],
				rowActionTemplate: new RowAction({
					items: [
						new RowActionItem({type: "Navigation", text: "First"}),
						new RowActionItem({icon: "sap-icon://search", text: "Second", enabled: false}),
						new RowActionItem({icon: "sap-icon://delete", text: "Third"})
					]
				})
			});
			this.oTable.placeAt("qunit-fixture");
			await nextUIUpdate();
			this.oRowAction = this.oTable.getRows()[0].getRowAction();
		},
		afterEach() {
			this.oTable.destroy();
		}
	});

	QUnit.test("Disabled overflow actions and changes while the menu is open", async function(assert) {
		const oItem = this.oRowAction.getItems()[1];
		const fnPress = this.spy();
		oItem.attachPress(fnPress);
		qutils.triggerEvent("click", this.oRowAction._oOverflowIcon.getDomRef());
		await nextUIUpdate();

		const oMenuItem = this.oTable._oRowActionOverflowMenu.getItems()[0];
		assert.strictEqual(oMenuItem.getText(), "Second", "Disabled actions remain in overflow");
		assert.notOk(oMenuItem.getEnabled(), "Disabled actions use the menu's disabled state");
		qutils.triggerEvent("click", oMenuItem.getDomRef());
		assert.notOk(fnPress.called, "Selecting a disabled action does not fire press");

		oItem.setEnabled(true);
		await nextUIUpdate();
		assert.ok(oMenuItem.getEnabled(), "Re-enabling updates the open menu");
		qutils.triggerEvent("click", oMenuItem.getDomRef());
		assert.ok(fnPress.calledOnce, "The re-enabled menu action fires press");
		assert.strictEqual(fnPress.firstCall.args[0].getParameter("row"), this.oTable.getRows()[0], "The menu action supplies its row");

		oItem.setEnabled(false);
		await nextUIUpdate();
		assert.notOk(oMenuItem.getEnabled(), "Disabling updates the open menu");
		qutils.triggerEvent("click", oMenuItem.getDomRef());
		assert.ok(fnPress.calledOnce, "Disabling again suppresses press");
	});

	QUnit.test("Text and icon changes update the open overflow menu", async function(assert) {
		const oItem = this.oRowAction.getItems()[1];
		qutils.triggerEvent("click", this.oRowAction._oOverflowIcon.getDomRef());
		await nextUIUpdate();

		const oMenu = this.oTable._oRowActionOverflowMenu;
		const oMenuItem = oMenu.getItems()[0];
		oItem.setText("Edit").setIcon("sap-icon://edit");

		assert.strictEqual(oMenu.getItems()[0], oMenuItem, "The existing overflow menu item is updated");
		assert.strictEqual(oMenuItem.getText(), "Edit", "The menu text reflects the action text");
		assert.strictEqual(oMenuItem.getIcon(), "sap-icon://edit", "The menu icon reflects the action icon");
		assert.notOk(oMenuItem.getEnabled(), "Updating text and icon preserves the disabled state");
		assert.ok(oMenu.isOpen(), "The menu remains open");
	});

	QUnit.module("ACC", {
		beforeEach: async function() {
			this.oRowAction = new RowAction();
			this.oRowAction.addItem(new RowActionItem({icon: "sap-icon://search", text: "A"}));
			this.oRowAction.addItem(new RowActionItem({icon: "sap-icon://delete", tooltip: "B"}));
			this.oRowAction.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function() {
			this.oRowAction.destroy();
		}
	});

	QUnit.test("getAccessibilityInfo", function(assert) {
		const oGetSizeStub = this.stub(this.oRowAction, "_getSize");

		oGetSizeStub.returns(2);
		assert.equal(this.oRowAction.getAccessibilityInfo().focusable, true, "ACCInfo.focusable: 2 Items");
		assert.equal(this.oRowAction.getAccessibilityInfo().enabled, true, "ACCInfo.enabled: 2 Items");
		assert.equal(this.oRowAction.getAccessibilityInfo().description,
			TableUtils.getResourceText("TBL_ROW_ACTION_MULTIPLE_ACTION", [2]), "ACCInfo.description: 2 Items");

		this.oRowAction.setVisible(false);
		assert.equal(this.oRowAction.getAccessibilityInfo().focusable, false, "ACCInfo.focusable: 2 Items - invisible");
		assert.equal(this.oRowAction.getAccessibilityInfo().enabled, false, "ACCInfo.enabled: 2 Items - invisible");
		assert.equal(this.oRowAction.getAccessibilityInfo().description, TableUtils.getResourceText("TBL_ROW_ACTION_NO_ACTION"),
			"ACCInfo.description: 2 Items - invisible");

		oGetSizeStub.returns(0);
		this.oRowAction.setVisible(true);
		assert.equal(this.oRowAction.getAccessibilityInfo().focusable, false, "ACCInfo.focusable: 2 Items - no Count");
		assert.equal(this.oRowAction.getAccessibilityInfo().enabled, false, "ACCInfo.enabled: 2 Items - no Count");
		assert.equal(this.oRowAction.getAccessibilityInfo().description, TableUtils.getResourceText("TBL_ROW_ACTION_NO_ACTION"),
			"ACCInfo.description: 2 Items - no Count");

		oGetSizeStub.returns(2);
		this.oRowAction.getItems()[0].setVisible(false);
		assert.equal(this.oRowAction.getAccessibilityInfo().focusable, true, "ACCInfo.focusable: 2 Items - 1 invisible");
		assert.equal(this.oRowAction.getAccessibilityInfo().enabled, true, "ACCInfo.enabled: 2 Items - 1 invisible");
		assert.equal(this.oRowAction.getAccessibilityInfo().description, TableUtils.getResourceText("TBL_ROW_ACTION_SINGLE_ACTION"),
			"ACCInfo.description: 2 Items - 1 invisible");

		this.oRowAction.destroyItems();
		assert.equal(this.oRowAction.getAccessibilityInfo().focusable, false, "ACCInfo.focusable: 0 Items");
		assert.equal(this.oRowAction.getAccessibilityInfo().enabled, false, "ACCInfo.enabled: 0 Items");
		assert.equal(this.oRowAction.getAccessibilityInfo().description, TableUtils.getResourceText("TBL_ROW_ACTION_NO_ACTION"),
			"ACCInfo.description: 0 Items");
	});

	QUnit.test("Accessibility excludes hidden, group, and summary rows", function(assert) {
		const oRow = new Row();
		this.oRowAction.addDependent(oRow);
		this.stub(this.oRowAction, "getRow").returns(oRow);
		const aRowStateStubs = ["isContentHidden", "isGroupHeader", "isSummary"].map((sMethod) => this.stub(oRow, sMethod).returns(false));

		assert.ok(this.oRowAction.getAccessibilityInfo().focusable, "A regular row exposes its actions");

		for (const oStub of aRowStateStubs) {
			oStub.returns(true);
			const oInfo = this.oRowAction.getAccessibilityInfo();
			assert.notOk(oInfo.focusable, "An excluded row has no focusable actions");
			assert.notOk(oInfo.enabled, "An excluded row has no enabled actions");
			assert.strictEqual(oInfo.description, TableUtils.getResourceText("TBL_ROW_ACTION_NO_ACTION"),
				"An excluded row announces no actions");
			oStub.returns(false);
		}

		assert.ok(this.oRowAction.getAccessibilityInfo().focusable, "Restoring the regular row restores its actions");
		this.oRowAction.getItems().forEach((oItem) => oItem.setEnabled(false));
		assert.notOk(this.oRowAction.getAccessibilityInfo().focusable, "Disabled actions in a regular row remain non-interactive");
	});

	QUnit.test("Action count includes only visible enabled items in and outside overflow", function(assert) {
		const aItems = this.oRowAction.getItems();
		const oThirdItem = new RowActionItem({type: "Navigation"});
		this.oRowAction.addItem(oThirdItem);
		const oGetSizeStub = this.stub(this.oRowAction, "_getSize");

		for (const iSize of [1, 3]) {
			oGetSizeStub.returns(iSize);
			aItems[0].setEnabled(false);
			aItems[1].setEnabled(true);
			oThirdItem.setVisible(true);
			assert.strictEqual(this.oRowAction.getAccessibilityInfo().description,
				TableUtils.getResourceText("TBL_ROW_ACTION_MULTIPLE_ACTION", [2]), "Two enabled actions with " + iSize + " slots");

			oThirdItem.setVisible(false);
			assert.strictEqual(this.oRowAction.getAccessibilityInfo().description,
				TableUtils.getResourceText("TBL_ROW_ACTION_SINGLE_ACTION"), "The hidden enabled action is excluded with " + iSize + " slots");

			aItems[1].setEnabled(false);
			assert.strictEqual(this.oRowAction.getAccessibilityInfo().description, "", "No enabled visible actions with " + iSize + " slots");

			aItems[0].setEnabled(true);
			assert.strictEqual(this.oRowAction.getAccessibilityInfo().description,
				TableUtils.getResourceText("TBL_ROW_ACTION_SINGLE_ACTION"), "Re-enabling an action restores the count with " + iSize + " slots");
		}
	});

	QUnit.test("Accessibility of disabled actions", async function(assert) {
		this.oRowAction.getItems()[0].setEnabled(false);
		assert.ok(this.oRowAction.getAccessibilityInfo().focusable, "An enabled action keeps the row action interactive");
		assert.strictEqual(this.oRowAction.getAccessibilityInfo().description,
			TableUtils.getResourceText("TBL_ROW_ACTION_SINGLE_ACTION"), "Only the enabled action is announced");

		this.oRowAction.getItems()[1].setEnabled(false);
		assert.notOk(this.oRowAction.getAccessibilityInfo().focusable, "Disabled actions are not focusable");
		assert.notOk(this.oRowAction.getAccessibilityInfo().enabled, "A row action with only disabled icons is not enabled");
		assert.strictEqual(this.oRowAction.getAccessibilityInfo().description, "", "No count is announced when all actions are disabled");

		this.stub(this.oRowAction, "_getSize").returns(1);
		assert.ok(this.oRowAction.getAccessibilityInfo().focusable, "Overflow remains accessible even if all its actions are disabled");
		assert.ok(this.oRowAction.getAccessibilityInfo().enabled, "The overflow menu can still be opened");
		assert.strictEqual(this.oRowAction.getAccessibilityInfo().description, "", "An all-disabled overflow does not announce a count");

		this.oRowAction._getSize.returns(3);
		await nextUIUpdate();
		const oItem = this.oRowAction.getItems()[0];
		const oIcon = Element.closestTo(this.oRowAction.getDomRef().children[0]);
		const oSecondIcon = Element.closestTo(this.oRowAction.getDomRef().children[1]);
		assert.strictEqual(oIcon.getDomRef().getAttribute("aria-disabled"), "true", "The first action is announced as disabled");
		assert.strictEqual(oIcon.getDomRef().getAttribute("aria-label"), "A", "The disabled action retains its label");
		assert.strictEqual(oSecondIcon.getDomRef().getAttribute("aria-disabled"), "true", "The second action is announced as disabled");

		oIcon.invalidate();
		await nextUIUpdate();
		assert.strictEqual(oIcon.getDomRef().getAttribute("aria-disabled"), "true", "The disabled state survives independent icon rendering");

		oItem.setEnabled(true);
		await nextUIUpdate();
		assert.notOk(oIcon.getDomRef().hasAttribute("aria-disabled"), "The enabled icon has no disabled attribute");
		assert.strictEqual(oIcon.getDomRef().getAttribute("aria-label"), "A", "Re-enabling preserves the action label");
		assert.strictEqual(oSecondIcon.getDomRef().getAttribute("aria-disabled"), "true", "Re-enabling one action does not enable the other");

		oIcon.invalidate();
		await nextUIUpdate();
		assert.notOk(oIcon.getDomRef().hasAttribute("aria-disabled"), "The disabled attribute stays absent after independent icon rendering");
	});

	QUnit.test("Menu icon", async function(assert) {
		const oTable = TableQUnitUtils.createTable({
			rows: {path: "/"},
			models: TableQUnitUtils.createJSONModel(1),
			rowActionCount: 3,
			columns: [
				TableQUnitUtils.createTextColumn({
					label: "A",
					text: "A",
					bind: true
				})
			],
			rowActionTemplate: new RowAction({
				items: [
					new RowActionItem({icon: "sap-icon://search", text: "Search"}),
					new RowActionItem({icon: "sap-icon://delete", text: "Delete"}),
					new RowActionItem({icon: "sap-icon://account", text: "Account"}),
					new RowActionItem({icon: "sap-icon://attachment", text: "Attachment"})
				]
			})
		});
		oTable.placeAt("qunit-fixture");
		await nextUIUpdate();

		const oRowAction = oTable.getRows()[0].getRowAction();
		const aChildren = oRowAction.getDomRef().children;

		assert.equal(aChildren[0].getAttribute("aria-haspopup"), undefined, "aria-haspopup on icon 0");
		assert.equal(aChildren[1].getAttribute("aria-haspopup"), undefined, "aria-haspopup on icon 1");
		assert.equal(aChildren[2].getAttribute("aria-haspopup"), "menu", "aria-haspopup on icon 2");

		const oOverflowIcon = Element.closestTo(aChildren[2]);
		assert.strictEqual(aChildren[0].getAttribute("aria-label"), "Search", "The regular action retains its label");
		assert.strictEqual(aChildren[2].getAttribute("aria-label"), TableUtils.getResourceText("TBL_ROW_ACTION_MORE"),
			"The overflow icon retains its label");

		oOverflowIcon.invalidate();
		await nextUIUpdate();
		assert.strictEqual(oOverflowIcon.getDomRef().getAttribute("aria-haspopup"), "menu",
			"Popup semantics survive independent overflow icon rendering");

		oTable.destroy();
	});
});