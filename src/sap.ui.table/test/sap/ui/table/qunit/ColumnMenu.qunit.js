/*global QUnit */

sap.ui.define([
	"sap/ui/table/ColumnMenu",
	"sap/ui/table/utils/TableUtils",
	"sap/ui/unified/Menu",
	"sap/ui/unified/MenuItem",
	"sap/ui/unified/MenuTextFieldItem"
], function(
	ColumnMenu,
	TableUtils,
	Menu,
	MenuItem,
	MenuTextFieldItem
) {
	"use strict";

	/**
	 * @deprecated As of version 1.117
	 */
	QUnit.module("Lifecycle and parent handling", {
		beforeEach: function() {
			this.oMenu = new ColumnMenu();
		},
		afterEach: function() {
			this.oMenu.destroy();
		}
	});

	QUnit.test("init adds style class and initializes internal state", function(assert) {
		assert.ok(this.oMenu.hasStyleClass("sapUiTableColumnMenu"), "Style class set");
		assert.strictEqual(this.oMenu._bInvalidated, true, "_bInvalidated flag initialized to true");
		assert.strictEqual(this.oMenu._iPopupClosedTimeoutId, null, "_iPopupClosedTimeoutId initialized to null");
	});

	QUnit.test("setParent invalidates the menu and delegates to base implementation", function(assert) {
		const oInvalidateSpy = this.spy(this.oMenu, "_invalidate");
		const oParent = new Menu();

		this.oMenu.setParent(oParent);

		assert.ok(oInvalidateSpy.calledOnce, "_invalidate called during setParent");
		assert.strictEqual(this.oMenu.getParent(), oParent, "Parent updated via base implementation");

		oParent.destroy();
	});

	QUnit.test("exit clears popup timeout and destroys column visibility menu item on table", function(assert) {
		const oTable = {_oColumnVisibilityMenuItem: new MenuItem()};
		const oDestroySpy = this.spy(oTable._oColumnVisibilityMenuItem, "destroy");
		this.stub(this.oMenu, "_getTable").returns(oTable);
		this.oMenu._iPopupClosedTimeoutId = 12345;
		const oClearTimeoutSpy = this.spy(window, "clearTimeout");

		this.oMenu.exit();

		assert.ok(oClearTimeoutSpy.calledWith(12345), "clearTimeout called with stored id");
		assert.ok(oDestroySpy.calledOnce, "Column visibility menu item destroyed");
		assert.strictEqual(oTable._oColumnVisibilityMenuItem, null, "Reference cleared");
	});

	QUnit.test("onThemeChanged invalidates only when DOM ref exists", function(assert) {
		const oInvalidateSpy = this.spy(this.oMenu, "_invalidate");
		this.stub(this.oMenu, "getDomRef").returns(null);

		this.oMenu.onThemeChanged();
		assert.ok(oInvalidateSpy.notCalled, "_invalidate skipped without DOM ref");

		this.oMenu.getDomRef.returns(document.createElement("div"));
		this.oMenu.onThemeChanged();
		assert.ok(oInvalidateSpy.calledOnce, "_invalidate called when DOM ref present");
	});

	/**
	 * @deprecated As of version 1.117
	 */
	QUnit.module("_getColumn / _getTable", {
		beforeEach: function() {
			this.oMenu = new ColumnMenu();
		},
		afterEach: function() {
			this.oMenu.destroy();
		}
	});

	QUnit.test("_getColumn returns parent when it is a sap.ui.table.Column, else null", function(assert) {
		const oColumn = {some: "column"};
		this.stub(this.oMenu, "getParent").returns(oColumn);
		const oIsAStub = this.stub(TableUtils, "isA");
		oIsAStub.withArgs(oColumn, "sap.ui.table.Column").returns(true);

		assert.strictEqual(this.oMenu._getColumn(), oColumn, "Returns column when parent is a Column");

		oIsAStub.withArgs(oColumn, "sap.ui.table.Column").returns(false);
		assert.strictEqual(this.oMenu._getColumn(), null, "Returns null when parent is not a Column");
	});

	QUnit.test("_getTable returns column's table or null when no column", function(assert) {
		const oTable = {id: "t"};
		const oColumn = {_getTable: this.stub().returns(oTable)};
		const oGetColumnStub = this.stub(this.oMenu, "_getColumn").returns(oColumn);

		assert.strictEqual(this.oMenu._getTable(), oTable, "Returns table when column exists");

		oGetColumnStub.returns(null);
		assert.strictEqual(this.oMenu._getTable(), null, "Returns null when no column");
	});

	/**
	 * @deprecated As of version 1.117
	 */
	QUnit.module("_destroyColumnVisibilityMenuItem (static)");

	QUnit.test("Ignores missing table or missing menu item", function(assert) {
		ColumnMenu._destroyColumnVisibilityMenuItem(null);
		assert.ok(true, "No throw when table is null");

		const oTable = {};
		ColumnMenu._destroyColumnVisibilityMenuItem(oTable);
		assert.ok(true, "No throw when _oColumnVisibilityMenuItem missing");
	});

	QUnit.test("Destroys the visibility menu item and clears reference", function(assert) {
		const oItem = new MenuItem();
		const oDestroySpy = this.spy(oItem, "destroy");
		const oTable = {_oColumnVisibilityMenuItem: oItem};

		ColumnMenu._destroyColumnVisibilityMenuItem(oTable);

		assert.ok(oDestroySpy.calledOnce, "destroy called");
		assert.strictEqual(oTable._oColumnVisibilityMenuItem, null, "Reference cleared");
	});

	/**
	 * @deprecated As of version 1.117
	 */
	QUnit.module("_invalidate / _removeColumnVisibilityFromAggregation", {
		beforeEach: function() {
			this.oMenu = new ColumnMenu();
		},
		afterEach: function() {
			this.oMenu.destroy();
		}
	});

	QUnit.test("_invalidate destroys items, calls remove, and sets flag", function(assert) {
		this.oMenu.addItem(new MenuItem());
		this.stub(this.oMenu, "_getTable").returns(null);
		this.oMenu._bInvalidated = false;

		this.oMenu._invalidate();

		assert.strictEqual(this.oMenu.getItems().length, 0, "Items destroyed");
		assert.strictEqual(this.oMenu._bInvalidated, true, "Invalidated flag set");
	});

	QUnit.test("_removeColumnVisibilityFromAggregation is a no-op without a table", function(assert) {
		const oRemoveAggregationSpy = this.spy(this.oMenu, "removeAggregation");
		this.stub(this.oMenu, "_getTable").returns(null);

		this.oMenu._removeColumnVisibilityFromAggregation();

		assert.ok(oRemoveAggregationSpy.notCalled, "removeAggregation not called");
	});

	QUnit.test("_removeColumnVisibilityFromAggregation is a no-op when menu item exists on table", function(assert) {
		const oRemoveAggregationSpy = this.spy(this.oMenu, "removeAggregation");
		this.stub(this.oMenu, "_getTable").returns({_oColumnVisibilityMenuItem: new MenuItem()});

		this.oMenu._removeColumnVisibilityFromAggregation();

		assert.ok(oRemoveAggregationSpy.notCalled, "removeAggregation not called");
	});

	QUnit.test("_removeColumnVisibilityFromAggregation removes the item when table has no cached item", function(assert) {
		const oRemoveAggregationSpy = this.spy(this.oMenu, "removeAggregation");
		this.stub(this.oMenu, "_getTable").returns({_oColumnVisibilityMenuItem: null});

		this.oMenu._removeColumnVisibilityFromAggregation();

		assert.ok(oRemoveAggregationSpy.calledOnceWithExactly("items", null, true), "removeAggregation called with items");
	});

	/**
	 * @deprecated As of version 1.117
	 */
	QUnit.module("open", {
		beforeEach: function() {
			this.oMenu = new ColumnMenu();
			this.oParentOpenStub = this.stub(Menu.prototype, "open");
		},
		afterEach: function() {
			this.oMenu.destroy();
		}
	});

	QUnit.test("Does not open when items list is empty", function(assert) {
		this.stub(this.oMenu, "_getColumn").returns(null);
		this.oMenu._bInvalidated = true;

		this.oMenu.open();

		assert.ok(this.oParentOpenStub.notCalled, "Parent open not called when no items");
	});

	QUnit.test("Rebuilds items when invalidated and delegates to parent open", function(assert) {
		this.oMenu._bInvalidated = true;
		const oAddMenuItemsStub = this.stub(this.oMenu, "_addMenuItems").callsFake(() => {
			this.oMenu.addItem(new MenuItem());
		});

		this.oMenu.open("a", "b", "c", "d", "focusRef");

		assert.ok(oAddMenuItemsStub.calledOnce, "_addMenuItems called when invalidated");
		assert.strictEqual(this.oMenu._bInvalidated, false, "Invalidated flag reset");
		assert.strictEqual(this.oMenu._lastFocusedDomRef, "focusRef", "Last focused DOM ref stored");
		assert.ok(this.oParentOpenStub.calledOnce, "Parent open called");
	});

	QUnit.test("Refreshes column visibility item when not invalidated and a column is set", function(assert) {
		this.oMenu._bInvalidated = false;
		this.stub(this.oMenu, "_getColumn").returns({});
		this.stub(this.oMenu, "_getTable").returns(null);
		const oAddVisibilityStub = this.stub(this.oMenu, "_addColumnVisibilityMenuItem").callsFake(() => {
			this.oMenu.addItem(new MenuItem());
		});
		const oAddMenuItemsStub = this.stub(this.oMenu, "_addMenuItems");

		this.oMenu.open();

		assert.ok(oAddVisibilityStub.calledOnce, "_addColumnVisibilityMenuItem called");
		assert.ok(oAddMenuItemsStub.notCalled, "_addMenuItems not called");
		assert.ok(this.oParentOpenStub.calledOnce, "Parent open called");
	});

	/**
	 * @deprecated As of version 1.117
	 */
	QUnit.module("_addMenuItems", {
		beforeEach: function() {
			this.oMenu = new ColumnMenu();
			this.stub(this.oMenu, "_getTable").returns(null);
		},
		afterEach: function() {
			this.oMenu.destroy();
		}
	});

	QUnit.test("Skips everything when no column is set", function(assert) {
		this.stub(this.oMenu, "_getColumn").returns(null);
		const oSortStub = this.stub(this.oMenu, "_addSortMenuItem");
		const oFilterStub = this.stub(this.oMenu, "_addFilterMenuItem");

		this.oMenu._addMenuItems();

		assert.ok(oSortStub.notCalled, "_addSortMenuItem not called");
		assert.ok(oFilterStub.notCalled, "_addFilterMenuItem not called");
	});

	QUnit.test("Adds sort (asc + desc), filter, group, freeze and column visibility items when a column is set", function(assert) {
		this.stub(this.oMenu, "_getColumn").returns({});
		const oSortStub = this.stub(this.oMenu, "_addSortMenuItem");
		const oFilterStub = this.stub(this.oMenu, "_addFilterMenuItem");
		const oGroupStub = this.stub(this.oMenu, "_addGroupMenuItem");
		const oFreezeStub = this.stub(this.oMenu, "_addFreezeMenuItem");
		const oVisStub = this.stub(this.oMenu, "_addColumnVisibilityMenuItem");

		this.oMenu._addMenuItems();

		assert.ok(oSortStub.calledTwice, "_addSortMenuItem called twice (asc + desc)");
		assert.strictEqual(oSortStub.firstCall.args[0], false, "First call with bDesc=false");
		assert.strictEqual(oSortStub.secondCall.args[0], true, "Second call with bDesc=true");
		assert.ok(oFilterStub.calledOnce, "_addFilterMenuItem called");
		assert.ok(oGroupStub.calledOnce, "_addGroupMenuItem called");
		assert.ok(oFreezeStub.calledOnce, "_addFreezeMenuItem called");
		assert.ok(oVisStub.calledOnce, "_addColumnVisibilityMenuItem called");
	});

	/**
	 * @deprecated As of version 1.117
	 */
	QUnit.module("_addSortMenuItem", {
		beforeEach: function() {
			this.oMenu = new ColumnMenu();
			this.oColumn = {
				isSortableByMenu: this.stub().returns(true),
				sort: this.stub()
			};
			this.stub(this.oMenu, "_getColumn").returns(this.oColumn);
			this.stub(this.oMenu, "_getTable").returns(null);
		},
		afterEach: function() {
			this.oMenu.destroy();
		}
	});

	QUnit.test("Adds nothing when column is not sortable", function(assert) {
		this.oColumn.isSortableByMenu.returns(false);

		this.oMenu._addSortMenuItem(false);
		this.oMenu._addSortMenuItem(true);

		assert.strictEqual(this.oMenu.getItems().length, 0, "No items added");
	});

	QUnit.test("Ascending item uses sort-ascending icon; select delegates to column.sort with ctrlKey flag", function(assert) {
		this.oMenu._addSortMenuItem(false);

		const oItem = this.oMenu.getItems()[0];
		assert.strictEqual(oItem.getIcon(), "sap-icon://sort-ascending", "Correct icon");
		assert.ok(oItem.getId().endsWith("-asc"), "Correct id suffix");

		oItem.fireSelect({ctrlKey: true});
		assert.ok(this.oColumn.sort.calledOnceWithExactly(false, true), "column.sort called with (false, true)");
	});

	QUnit.test("Descending item uses sort-descending icon; select passes bDesc=true", function(assert) {
		this.oMenu._addSortMenuItem(true);

		const oItem = this.oMenu.getItems()[0];
		assert.strictEqual(oItem.getIcon(), "sap-icon://sort-descending", "Correct icon");

		oItem.fireSelect({ctrlKey: false});
		assert.ok(this.oColumn.sort.calledOnceWithExactly(true, false), "column.sort called with (true, false)");
	});

	/**
	 * @deprecated As of version 1.117
	 */
	QUnit.module("_addFilterMenuItem", {
		beforeEach: function() {
			this.oMenu = new ColumnMenu();
			this.oTable = {
				getEnableCustomFilter: this.stub().returns(false),
				fireCustomFilter: this.stub()
			};
			this.oColumn = {
				isFilterableByMenu: this.stub().returns(true),
				getParent: () => this.oTable,
				getFilterValue: this.stub().returns("initialValue"),
				filter: this.stub()
			};
			this.stub(this.oMenu, "_getColumn").returns(this.oColumn);
			this.stub(this.oMenu, "_getTable").returns(null);
		},
		afterEach: function() {
			this.oMenu.destroy();
		}
	});

	QUnit.test("Adds nothing when column is not filterable", function(assert) {
		this.oColumn.isFilterableByMenu.returns(false);

		this.oMenu._addFilterMenuItem();

		assert.strictEqual(this.oMenu.getItems().length, 0, "No items added");
	});

	QUnit.test("Adds a MenuTextFieldItem prefilled with the column filter value when custom filter disabled", function(assert) {
		this.oMenu._addFilterMenuItem();

		const oItem = this.oMenu.getItems()[0];
		assert.ok(oItem.isA("sap.ui.unified.MenuTextFieldItem"), "MenuTextFieldItem created");
		assert.strictEqual(oItem.getValue(), "initialValue", "Initial filter value applied");

		oItem.setValue("newValue");
		oItem.fireSelect();
		assert.ok(this.oColumn.filter.calledOnceWithExactly("newValue"), "column.filter called with new value");
	});

	QUnit.test("Fires customFilter event when custom filter enabled", function(assert) {
		this.oTable.getEnableCustomFilter.returns(true);

		this.oMenu._addFilterMenuItem();

		const oItem = this.oMenu.getItems()[0];
		assert.ok(oItem.isA("sap.ui.unified.MenuItem"), "MenuItem (not text field) created");

		oItem.fireSelect();
		assert.ok(this.oTable.fireCustomFilter.calledOnce, "customFilter event fired");
		assert.deepEqual(this.oTable.fireCustomFilter.firstCall.args[0], {column: this.oColumn}, "Column passed as event param");
	});

	/**
	 * @deprecated As of version 1.117
	 */
	QUnit.module("_addGroupMenuItem", {
		beforeEach: function() {
			this.oMenu = new ColumnMenu();
			this.oColumn = {
				isGroupableByMenu: this.stub().returns(true)
			};
			this.oTable = {
				setGroupBy: this.stub(),
				getDomRef: this.stub()
			};
			this.stub(this.oMenu, "_getColumn").returns(this.oColumn);
			this.stub(this.oMenu, "_getTable").returns(this.oTable);
		},
		afterEach: function() {
			this.oMenu.destroy();
		}
	});

	QUnit.test("Adds nothing when column is not groupable", function(assert) {
		this.oColumn.isGroupableByMenu.returns(false);

		this.oMenu._addGroupMenuItem();

		assert.strictEqual(this.oMenu.getItems().length, 0, "No items added");
	});

	QUnit.test("Select focuses noDataCnt when NoData is visible", function(assert) {
		const oNoDataRef = document.createElement("div");
		oNoDataRef.tabIndex = -1;
		document.body.appendChild(oNoDataRef);
		this.oTable.getDomRef.withArgs("noDataCnt").returns(oNoDataRef);
		this.stub(TableUtils, "isNoDataVisible").returns(true);
		const oFocusSpy = this.spy(oNoDataRef, "focus");

		this.oMenu._addGroupMenuItem();
		this.oMenu.getItems()[0].fireSelect();

		assert.ok(this.oTable.setGroupBy.calledOnceWithExactly(this.oColumn), "setGroupBy called");
		assert.ok(oFocusSpy.calledOnce, "noDataCnt focused");

		document.body.removeChild(oNoDataRef);
	});

	QUnit.test("Select focuses rowsel0 when NoData is not visible", function(assert) {
		const oRowSelRef = document.createElement("div");
		oRowSelRef.tabIndex = -1;
		document.body.appendChild(oRowSelRef);
		this.oTable.getDomRef.withArgs("rowsel0").returns(oRowSelRef);
		this.stub(TableUtils, "isNoDataVisible").returns(false);
		const oFocusSpy = this.spy(oRowSelRef, "focus");

		this.oMenu._addGroupMenuItem();
		this.oMenu.getItems()[0].fireSelect();

		assert.ok(oFocusSpy.calledOnce, "rowsel0 focused");

		document.body.removeChild(oRowSelRef);
	});

	QUnit.test("Select tolerates missing DOM ref", function(assert) {
		this.oTable.getDomRef.returns(null);
		this.stub(TableUtils, "isNoDataVisible").returns(false);

		this.oMenu._addGroupMenuItem();
		this.oMenu.getItems()[0].fireSelect();

		assert.ok(this.oTable.setGroupBy.calledOnce, "setGroupBy still called");
	});

	/**
	 * @deprecated As of version 1.117
	 */
	QUnit.module("_addFreezeMenuItem", {
		beforeEach: function() {
			this.oMenu = new ColumnMenu();
			this.oColumn = {
				getIndex: this.stub().returns(2)
			};
			this.oTable = {
				getEnableColumnFreeze: this.stub().returns(true),
				getComputedFixedColumnCount: this.stub().returns(0),
				fireColumnFreeze: this.stub().returns(true),
				setFixedColumnCount: this.stub()
			};
			this.oApplyFreezeSpy = this.spy(TableUtils, "applyUserColumnFreeze");
			this.stub(this.oMenu, "_getColumn").returns(this.oColumn);
			this.stub(this.oMenu, "_getTable").returns(this.oTable);
			this.stub(TableUtils.Column, "getHeaderSpan").returns(1);
		},
		afterEach: function() {
			this.oMenu.destroy();
		}
	});

	QUnit.test("Adds nothing when column freeze not enabled", function(assert) {
		this.oTable.getEnableColumnFreeze.returns(false);

		this.oMenu._addFreezeMenuItem();

		assert.strictEqual(this.oMenu.getItems().length, 0, "No items added");
	});

	QUnit.test("Adds nothing when table is missing", function(assert) {
		this.oMenu._getTable.returns(null);

		this.oMenu._addFreezeMenuItem();

		assert.strictEqual(this.oMenu.getItems().length, 0, "No items added");
	});

	QUnit.test("Freezes the column up to and including its index when not yet frozen", function(assert) {
		this.oMenu._addFreezeMenuItem();

		this.oMenu.getItems()[0].fireSelect();

		assert.ok(this.oTable.fireColumnFreeze.calledOnce, "columnFreeze event fired");
		assert.ok(this.oApplyFreezeSpy.calledOnceWithExactly(this.oTable, 3),
			"applyUserColumnFreeze is triggered with the correct parameters on user interaction");
	});

	QUnit.test("Unfreezes when the column is currently the last fixed column", function(assert) {
		this.oTable.getComputedFixedColumnCount.returns(3);

		this.oMenu._addFreezeMenuItem();

		this.oMenu.getItems()[0].fireSelect();

		assert.ok(this.oApplyFreezeSpy.calledOnceWithExactly(this.oTable, 0),
			"applyUserColumnFreeze is triggered with the correct parameters on user interaction");
	});

	QUnit.test("Skips execution when columnFreeze event is prevented", function(assert) {
		this.oTable.fireColumnFreeze.returns(false);

		this.oMenu._addFreezeMenuItem();

		this.oMenu.getItems()[0].fireSelect();

		assert.ok(this.oApplyFreezeSpy.notCalled,
			"applyUserColumnFreeze is not triggered when the columnFreeze event is prevented");
	});

	/**
	 * @deprecated As of version 1.117
	 */
	QUnit.module("_addColumnVisibilityMenuItem", {
		beforeEach: function() {
			this.oMenu = new ColumnMenu();
			this.oTable = {
				getShowColumnVisibilityMenu: this.stub().returns(true),
				getColumns: this.stub().returns([]),
				_getVisibleColumns: this.stub().returns([]),
				getBinding: this.stub().returns(null),
				getId: () => "tbl",
				_oColumnVisibilityMenuItem: null
			};
			this.stub(this.oMenu, "_getTable").returns(this.oTable);
		},
		afterEach: function() {
			if (this.oTable._oColumnVisibilityMenuItem) {
				this.oTable._oColumnVisibilityMenuItem.destroy();
				this.oTable._oColumnVisibilityMenuItem = null;
			}
			this.oMenu.destroy();
		}
	});

	QUnit.test("Adds nothing when column visibility menu is disabled", function(assert) {
		this.oTable.getShowColumnVisibilityMenu.returns(false);

		this.oMenu._addColumnVisibilityMenuItem();

		assert.strictEqual(this.oMenu.getItems().length, 0, "No items added");
	});

	QUnit.test("Adds nothing when table is missing", function(assert) {
		this.oMenu._getTable.returns(null);

		this.oMenu._addColumnVisibilityMenuItem();

		assert.strictEqual(this.oMenu.getItems().length, 0, "No items added");
	});

	QUnit.test("Creates a new visibility item with submenu and caches it on the table", function(assert) {
		this.oMenu._addColumnVisibilityMenuItem();

		assert.strictEqual(this.oMenu.getItems().length, 1, "Visibility item added to menu");
		assert.ok(this.oTable._oColumnVisibilityMenuItem, "Item cached on table");
		assert.ok(this.oTable._oColumnVisibilityMenuItem.getSubmenu(), "Submenu attached");
	});

	QUnit.test("Recreates the visibility item if the previous one was destroyed", function(assert) {
		const oOld = new MenuItem();
		oOld.destroy();
		this.oTable._oColumnVisibilityMenuItem = oOld;

		this.oMenu._addColumnVisibilityMenuItem();

		assert.notStrictEqual(this.oTable._oColumnVisibilityMenuItem, oOld, "Old destroyed item replaced");
		assert.ok(this.oTable._oColumnVisibilityMenuItem.getSubmenu(), "New submenu attached");
	});

	/**
	 * @deprecated As of version 1.117
	 */
	QUnit.module("_createColumnVisibilityMenuItem and _updateColumnVisibilityMenuItem", {
		beforeEach: function() {
			this.oMenu = new ColumnMenu();

			this.oColumnA = {
				getVisible: this.stub().returns(true),
				setVisible: this.stub(),
				getId: () => "colA",
				focus: this.stub(),
				isA: (sType) => sType === "sap.ui.table.Column"
			};
			this.oColumnB = {
				getVisible: this.stub().returns(false),
				setVisible: this.stub(),
				getId: () => "colB",
				focus: this.stub(),
				isA: (sType) => sType === "sap.ui.table.Column"
			};

			this.oFocusRef = {getAttribute: this.stub().returns("something-else")};
			this.oTable = {
				getId: () => "tbl",
				getColumns: () => [this.oColumnA, this.oColumnB],
				_getVisibleColumns: () => [this.oColumnA],
				getBinding: () => null,
				getFocusDomRef: () => this.oFocusRef,
				fireColumnVisibility: this.stub().returns(true),
				_oColumnVisibilityMenuItem: null
			};
			this.stub(this.oMenu, "_getTable").returns(this.oTable);
			this.stub(TableUtils.Column, "getHeaderText").callsFake((oCol) => oCol.getId() + "-text");
			this.oIsAStub = this.stub(TableUtils, "isA").callThrough();
			this.oIsAStub.withArgs(this.oTable, "sap.ui.table.Table").returns(true);
		},
		afterEach: function() {
			if (this.oTable._oColumnVisibilityMenuItem) {
				this.oTable._oColumnVisibilityMenuItem.destroy();
				this.oTable._oColumnVisibilityMenuItem = null;
			}
			this.oMenu.destroy();
		}
	});

	QUnit.test("Menu item icon and aria-labelledby reflect column visibility", function(assert) {
		const oItemA = this.oMenu._createColumnVisibilityMenuItem(this.oColumnA);
		const oItemB = this.oMenu._createColumnVisibilityMenuItem(this.oColumnB);

		assert.strictEqual(oItemA.getIcon(), "sap-icon://accept", "Visible column shows accept icon");
		assert.strictEqual(oItemB.getIcon(), "", "Invisible column has no icon");
		assert.deepEqual(oItemA.getAriaLabelledBy(), ["tbl-ariahidecolmenu"], "Visible aria points to hide label");
		assert.deepEqual(oItemB.getAriaLabelledBy(), ["tbl-ariashowcolmenu"], "Invisible aria points to show label");

		oItemA.destroy();
		oItemB.destroy();
	});

	QUnit.test("Select toggles visibility and fires columnVisibility event", function(assert) {
		const oItem = this.oMenu._createColumnVisibilityMenuItem(this.oColumnB);

		oItem.fireSelect();

		assert.ok(this.oTable.fireColumnVisibility.calledOnce, "columnVisibility event fired");
		assert.deepEqual(
			this.oTable.fireColumnVisibility.firstCall.args[0],
			{column: this.oColumnB, newVisible: true},
			"Event carries column and target visibility"
		);
		assert.ok(this.oColumnB.setVisible.calledOnceWithExactly(true), "Column visibility toggled");

		oItem.destroy();
	});

	QUnit.test("Select is a no-op when hiding the last visible column", function(assert) {
		this.oTable._getVisibleColumns = () => [this.oColumnA];
		const oItem = this.oMenu._createColumnVisibilityMenuItem(this.oColumnA);

		oItem.fireSelect();

		assert.ok(this.oTable.fireColumnVisibility.notCalled, "Event not fired");
		assert.ok(this.oColumnA.setVisible.notCalled, "Visibility not toggled");

		oItem.destroy();
	});

	QUnit.test("Select skips visibility change when default is prevented", function(assert) {
		this.oColumnA.getVisible.returns(true);
		this.oTable._getVisibleColumns = () => [this.oColumnA, this.oColumnB];
		this.oColumnB.getVisible.returns(true);
		this.oTable.fireColumnVisibility.returns(false);

		const oItem = this.oMenu._createColumnVisibilityMenuItem(this.oColumnA);

		oItem.fireSelect();

		assert.ok(this.oTable.fireColumnVisibility.calledOnce, "Event fired");
		assert.ok(this.oColumnA.setVisible.notCalled, "setVisible not called when default prevented");

		oItem.destroy();
	});

	QUnit.test("Select moves focus to next visible column when currently focused column is being hidden", function(assert) {
		this.oColumnA.getVisible.returns(true);
		this.oColumnB.getVisible.returns(true);
		const oColumnC = {
			getVisible: this.stub().returns(true),
			setVisible: this.stub(),
			getId: () => "colC",
			focus: this.stub(),
			isA: (sType) => sType === "sap.ui.table.Column"
		};
		this.oTable._getVisibleColumns = () => [this.oColumnA, this.oColumnB, oColumnC];
		this.oFocusRef.getAttribute.returns("colA");

		const oItem = this.oMenu._createColumnVisibilityMenuItem(this.oColumnA);

		oItem.fireSelect();

		assert.ok(this.oColumnB.focus.calledOnce, "Focus moved to another visible column");
		assert.ok(this.oColumnA.setVisible.calledOnceWithExactly(false), "Column hidden");

		oItem.destroy();
	});

	QUnit.test("_updateColumnVisibilityMenuItem is a no-op without a cached item", function(assert) {
		this.oTable._oColumnVisibilityMenuItem = null;

		this.oMenu._updateColumnVisibilityMenuItem();

		assert.ok(true, "No throw when there is no cached item");
	});

	QUnit.test("_updateColumnVisibilityMenuItem is a no-op without a submenu", function(assert) {
		this.oTable._oColumnVisibilityMenuItem = new MenuItem();

		this.oMenu._updateColumnVisibilityMenuItem();

		assert.ok(true, "No throw when the cached item has no submenu");
	});

	QUnit.test("_updateColumnVisibilityMenuItem creates one submenu item per column and reflects visibility", function(assert) {
		const oCachedItem = new MenuItem();
		oCachedItem.setSubmenu(new Menu());
		this.oTable._oColumnVisibilityMenuItem = oCachedItem;

		this.oMenu._updateColumnVisibilityMenuItem();

		const aItems = oCachedItem.getSubmenu().getItems();
		assert.strictEqual(aItems.length, 2, "One submenu item per column");
		assert.strictEqual(aItems[0].getIcon(), "sap-icon://accept", "Visible column has accept icon");
		assert.strictEqual(aItems[1].getIcon(), "", "Invisible column has empty icon");
		assert.strictEqual(aItems[0].getEnabled(), false, "Sole visible column disabled (cannot hide last one)");
		assert.strictEqual(aItems[1].getEnabled(), true, "Invisible column enabled (can be shown)");
	});

	QUnit.test("_updateColumnVisibilityMenuItem reuses existing submenu items and destroys stale ones", function(assert) {
		const oCachedItem = new MenuItem();
		oCachedItem.setSubmenu(new Menu());
		this.oTable._oColumnVisibilityMenuItem = oCachedItem;

		this.oMenu._updateColumnVisibilityMenuItem();
		const aItemsFirst = oCachedItem.getSubmenu().getItems().slice();

		// Second call with fewer columns should destroy the surplus items.
		this.oTable.getColumns = () => [this.oColumnA];
		this.oMenu._updateColumnVisibilityMenuItem();

		const aItemsSecond = oCachedItem.getSubmenu().getItems();
		assert.strictEqual(aItemsSecond.length, 1, "Surplus submenu items removed");
		assert.strictEqual(aItemsSecond[0], aItemsFirst[0], "Existing item for kept column reused");
		assert.strictEqual(aItemsFirst[1].bIsDestroyed, true, "Surplus item destroyed");
	});

	QUnit.test("_updateColumnVisibilityMenuItem reorders existing items using a custom sorter", function(assert) {
		const oCachedItem = new MenuItem();
		oCachedItem.setSubmenu(new Menu());
		this.oTable._oColumnVisibilityMenuItem = oCachedItem;

		this.oMenu._updateColumnVisibilityMenuItem();
		const aItemsBefore = oCachedItem.getSubmenu().getItems().slice();

		// Simulate a custom sorter that reverses the column order.
		this.oTable.getColumnVisibilityMenuSorter = () => (a, b) => (a === this.oColumnA ? 1 : -1);

		this.oMenu._updateColumnVisibilityMenuItem();

		const aItemsAfter = oCachedItem.getSubmenu().getItems();
		assert.strictEqual(aItemsAfter[0], aItemsBefore[1], "Items reordered according to the sorter");
		assert.strictEqual(aItemsAfter[1], aItemsBefore[0], "Items reordered according to the sorter");
	});

	QUnit.test("_updateColumnVisibilityMenuItem ignores custom sorter when not a function", function(assert) {
		const oCachedItem = new MenuItem();
		oCachedItem.setSubmenu(new Menu());
		this.oTable._oColumnVisibilityMenuItem = oCachedItem;
		this.oTable.getColumnVisibilityMenuSorter = () => "not a function";

		this.oMenu._updateColumnVisibilityMenuItem();

		assert.strictEqual(oCachedItem.getSubmenu().getItems().length, 2, "Both items created");
	});

	QUnit.test("_updateColumnVisibilityMenuItem skips analytical columns hidden by metadata", function(assert) {
		const oAnalyticalColumn = {
			getVisible: this.stub().returns(true),
			setVisible: this.stub(),
			getId: () => "colAna",
			focus: this.stub(),
			getLeadingProperty: () => "prop",
			isA: (sType) => sType === "sap.ui.table.AnalyticalColumn" || sType === "sap.ui.table.Column"
		};
		const oBinding = {
			getAnalyticalQueryResult: () => ({
				getEntityType: () => ({getTypeDescription: () => ({name: "T"})})
			}),
			getModel: () => ({
				getProperty: () => ({value: "false"})
			})
		};
		this.oTable.getBinding = () => oBinding;
		this.oTable.getColumns = () => [oAnalyticalColumn];
		this.oIsAStub.withArgs(oBinding, "sap.ui.model.analytics.AnalyticalBinding").returns(true);

		const oCachedItem = new MenuItem();
		oCachedItem.setSubmenu(new Menu());
		this.oTable._oColumnVisibilityMenuItem = oCachedItem;

		this.oMenu._updateColumnVisibilityMenuItem();

		assert.strictEqual(oCachedItem.getSubmenu().getItems().length, 0, "Analytical invisible-by-metadata column skipped");
	});

	QUnit.test("_updateColumnVisibilityMenuItem includes analytical columns visible by metadata", function(assert) {
		const oAnalyticalColumn = {
			getVisible: this.stub().returns(true),
			setVisible: this.stub(),
			getId: () => "colAna",
			focus: this.stub(),
			getLeadingProperty: () => "prop",
			isA: (sType) => sType === "sap.ui.table.AnalyticalColumn" || sType === "sap.ui.table.Column"
		};
		const oBinding = {
			getAnalyticalQueryResult: () => ({
				getEntityType: () => ({getTypeDescription: () => ({name: "T"})})
			}),
			getModel: () => ({
				getProperty: () => null
			})
		};
		this.oTable.getBinding = () => oBinding;
		this.oTable.getColumns = () => [oAnalyticalColumn];
		this.oTable._getVisibleColumns = () => [oAnalyticalColumn];
		this.oIsAStub.withArgs(oBinding, "sap.ui.model.analytics.AnalyticalBinding").returns(true);

		const oCachedItem = new MenuItem();
		oCachedItem.setSubmenu(new Menu());
		this.oTable._oColumnVisibilityMenuItem = oCachedItem;

		this.oMenu._updateColumnVisibilityMenuItem();

		assert.strictEqual(oCachedItem.getSubmenu().getItems().length, 1, "Analytical column with visible metadata included");
	});

	/**
	 * @deprecated As of version 1.117
	 */
	QUnit.module("_createMenuTextFieldItem", {
		beforeEach: function() {
			this.oMenu = new ColumnMenu("testMenu");
		},
		afterEach: function() {
			this.oMenu.destroy();
		}
	});

	QUnit.test("Creates MenuTextFieldItem with default handler when none provided", function(assert) {
		const oItem = this.oMenu._createMenuTextFieldItem("foo", "TBL_FILTER", "filter", "val");

		assert.ok(oItem.isA("sap.ui.unified.MenuTextFieldItem"), "Correct type");
		assert.strictEqual(oItem.getId(), "testMenu-foo", "Id composed of menu id and suffix");
		assert.strictEqual(oItem.getIcon(), "sap-icon://filter", "Icon prefixed with sap-icon://");
		assert.strictEqual(oItem.getValue(), "val", "Initial value applied");

		// Fire select with default handler - no throw.
		oItem.fireSelect();
		assert.ok(true, "Default handler is a no-op");

		oItem.destroy();
	});

	QUnit.test("Uses null icon when no icon key is provided", function(assert) {
		const oItem = this.oMenu._createMenuTextFieldItem("bar", "TBL_FILTER", null, "");

		assert.strictEqual(oItem.getIcon(), "", "No icon set (default value)");

		oItem.destroy();
	});

	/**
	 * @deprecated As of version 1.117
	 */
	QUnit.module("_setFilterValue / _setFilterState", {
		beforeEach: function() {
			this.oMenu = new ColumnMenu("filterMenu");
			this.oFilterField = new MenuTextFieldItem("filterMenu-filter");
			this.oTable = {getEnableCustomFilter: this.stub().returns(false)};
			this.oColumn = {getParent: () => this.oTable};
			this.stub(this.oMenu, "getParent").returns(this.oColumn);
		},
		afterEach: function() {
			this.oFilterField.destroy();
			this.oMenu.destroy();
		}
	});

	QUnit.test("_setFilterValue writes value into filter field and returns this", function(assert) {
		const oSetValueSpy = this.spy(this.oFilterField, "setValue");

		const oReturn = this.oMenu._setFilterValue("abc");

		assert.strictEqual(oReturn, this.oMenu, "Returns this for chaining");
		assert.ok(oSetValueSpy.calledOnceWithExactly("abc"), "setValue called with new value");
	});

	QUnit.test("_setFilterValue is a no-op when custom filter is enabled", function(assert) {
		this.oTable.getEnableCustomFilter.returns(true);
		const oSetValueSpy = this.spy(this.oFilterField, "setValue");

		this.oMenu._setFilterValue("abc");

		assert.ok(oSetValueSpy.notCalled, "setValue not called when custom filter enabled");
	});

	QUnit.test("_setFilterValue is a no-op when filter field is absent", function(assert) {
		this.oFilterField.destroy();
		this.oFilterField = new MenuTextFieldItem(); // dummy so afterEach can destroy safely

		const oReturn = this.oMenu._setFilterValue("abc");

		assert.strictEqual(oReturn, this.oMenu, "Still returns this");
	});

	QUnit.test("_setFilterState writes value state into filter field and returns this", function(assert) {
		const oSetValueStateSpy = this.spy(this.oFilterField, "setValueState");

		const oReturn = this.oMenu._setFilterState("Error");

		assert.strictEqual(oReturn, this.oMenu, "Returns this for chaining");
		assert.ok(oSetValueStateSpy.calledOnceWithExactly("Error"), "setValueState called with new state");
	});

	QUnit.test("_setFilterState is a no-op when custom filter is enabled", function(assert) {
		this.oTable.getEnableCustomFilter.returns(true);
		const oSetValueStateSpy = this.spy(this.oFilterField, "setValueState");

		this.oMenu._setFilterState("Error");

		assert.ok(oSetValueStateSpy.notCalled, "setValueState not called");
	});
});