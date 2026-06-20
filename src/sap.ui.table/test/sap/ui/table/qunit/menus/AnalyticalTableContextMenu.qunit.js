/*global QUnit, sinon */

sap.ui.define([
	"sap/ui/table/qunit/TableQUnitUtils",
	"sap/ui/table/menus/AnalyticalTableContextMenu",
	"sap/ui/table/AnalyticalTable",
	"sap/ui/table/AnalyticalColumn",
	"sap/ui/table/Row",
	"sap/ui/table/utils/TableUtils",
	"sap/ui/table/library",
	"sap/ui/core/library"
], function(
	TableQUnitUtils,
	AnalyticalTableContextMenu,
	AnalyticalTable,
	AnalyticalColumn,
	Row,
	TableUtils,
	TableLibrary,
	CoreLibrary
) {
	"use strict";

	const GroupEventType = TableLibrary.GroupEventType;
	const SortOrder = CoreLibrary.SortOrder;

	QUnit.module("Menu items", {
		beforeEach: function() {
			this.oContextMenu = new AnalyticalTableContextMenu();
			this.oTable = new AnalyticalTable();
			this.oRow = new Row();
			this.oContextMenu.setParent(this.oTable);
		},
		afterEach: function() {
			this.oContextMenu.destroy();
			this.oTable.destroy();
			this.oRow.destroy();
		}
	});

	QUnit.test("Group header row", function(assert) {
		sinon.stub(this.oRow, "isGroupHeader").returns(true);
		this.oContextMenu.initContent(this.oRow);

		const aMenuItems = this.oContextMenu.getMenu().getItems();
		assert.equal(aMenuItems.length, 6, "Menu items");

		assert.equal(aMenuItems[0].getText(), TableUtils.getResourceText("TBL_UNGROUP"), "Ungroup; Text");
		assert.equal(aMenuItems[0].getVisible(), true, "Ungroup; Visible");
		assert.equal(aMenuItems[0].getEnabled(), true, "Ungroup; Enabled");
		assert.equal(aMenuItems[0].getSubmenu().getItems()[0].getText(),
			TableUtils.getResourceText("TBL_UNGROUP_LEVEL"), "Ungroup level; Text");
		assert.equal(aMenuItems[0].getSubmenu().getItems()[0].getVisible(), true, "Ungroup level; Visible");
		assert.equal(aMenuItems[0].getSubmenu().getItems()[0].getEnabled(), true, "Ungroup level; Enabled");
		assert.equal(aMenuItems[0].getSubmenu().getItems()[1].getText(),
			TableUtils.getResourceText("TBL_UNGROUP_ALL"), "Ungroup all; Text");
		assert.equal(aMenuItems[0].getSubmenu().getItems()[1].getVisible(), true, "Ungroup all; Visible");
		assert.equal(aMenuItems[0].getSubmenu().getItems()[1].getEnabled(), true, "Ungroup all; Enabled");

		assert.equal(aMenuItems[1].getText(), TableUtils.getResourceText("TBL_COLLAPSE"), "Collapse; Text");
		assert.equal(aMenuItems[1].getVisible(), true, "Collapse; Visible");
		assert.equal(aMenuItems[1].getEnabled(), true, "Collapse; Enabled");
		assert.equal(aMenuItems[1].getIcon(), "sap-icon://collapse-all", "Collapse; Icon");
		assert.equal(aMenuItems[1].getSubmenu().getItems()[0].getText(),
			TableUtils.getResourceText("TBL_COLLAPSE_LEVEL"), "Collapse level; Text");
		assert.equal(aMenuItems[1].getSubmenu().getItems()[0].getVisible(), true, "Collapse level; Visible");
		assert.equal(aMenuItems[1].getSubmenu().getItems()[0].getEnabled(), true, "Collapse level; Enabled");
		assert.equal(aMenuItems[1].getSubmenu().getItems()[1].getText(),
			TableUtils.getResourceText("TBL_COLLAPSE_ALL"), "Collapse all; Text");
		assert.equal(aMenuItems[1].getSubmenu().getItems()[1].getVisible(), true, "Collapse all; Visible");
		assert.equal(aMenuItems[1].getSubmenu().getItems()[1].getEnabled(), true, "Collapse all; Enabled");

		assert.equal(aMenuItems[2].getText(), TableUtils.getResourceText("TBL_EXPAND"), "Expand; Text");
		assert.equal(aMenuItems[2].getVisible(), true, "Expand; Visible");
		assert.equal(aMenuItems[2].getEnabled(), true, "Expand; Enabled");
		assert.equal(aMenuItems[2].getIcon(), "sap-icon://expand-all", "Expand; Icon");
		assert.equal(aMenuItems[2].getSubmenu().getItems()[0].getText(),
			TableUtils.getResourceText("TBL_EXPAND_LEVEL"), "Expand level; Text");
		assert.equal(aMenuItems[2].getSubmenu().getItems()[0].getVisible(), true, "Expand level; Visible");
		assert.equal(aMenuItems[2].getSubmenu().getItems()[0].getEnabled(), true, "Expand level; Enabled");
		assert.equal(aMenuItems[2].getSubmenu().getItems()[1].getText(),
			TableUtils.getResourceText("TBL_EXPAND_ALL"), "Expand all; Text");
		assert.equal(aMenuItems[2].getSubmenu().getItems()[1].getVisible(), true, "Expand all; Visible");
		assert.equal(aMenuItems[2].getSubmenu().getItems()[1].getEnabled(), true, "Expand all; Enabled");

		assert.equal(aMenuItems[3].getText(), TableUtils.getResourceText("TBL_SHOW_COLUMN"), "Show column");
		assert.equal(aMenuItems[3].getVisible(), true, "Show column; Visible");
		assert.equal(aMenuItems[3].getEnabled(), true, "Show column; Enabled");

		assert.equal(aMenuItems[4].getText(), TableUtils.getResourceText("TBL_MOVE"), "Move group; Text");
		assert.equal(aMenuItems[4].getVisible(), true, "Move group; Visible");
		assert.equal(aMenuItems[4].getEnabled(), true, "Move group; Enabled");
		assert.equal(aMenuItems[4].getSubmenu().getItems()[0].getText(),
			TableUtils.getResourceText("TBL_MOVE_UP"), "Move group one level up; Text");
		assert.equal(aMenuItems[4].getSubmenu().getItems()[0].getVisible(), true, "Move group one level up; Visible");
		assert.equal(aMenuItems[4].getSubmenu().getItems()[0].getEnabled(), true, "Move group one level up; Enabled");
		assert.equal(aMenuItems[4].getSubmenu().getItems()[0].getIcon(), "sap-icon://arrow-top", "Move group one level up; Icon");
		assert.equal(aMenuItems[4].getSubmenu().getItems()[1].getText(),
			TableUtils.getResourceText("TBL_MOVE_DOWN"), "Move group one level down; Text");
		assert.equal(aMenuItems[4].getSubmenu().getItems()[1].getVisible(), true, "Move group one level down; Visible");
		assert.equal(aMenuItems[4].getSubmenu().getItems()[1].getEnabled(), true, "Move group one level down; Enabled");
		assert.equal(aMenuItems[4].getSubmenu().getItems()[1].getIcon(), "sap-icon://arrow-bottom", "Move group one level down; Icon");

		assert.equal(aMenuItems[5].getText(), TableUtils.getResourceText("TBL_SORT"), "Sort; Text");
		assert.equal(aMenuItems[5].getVisible(), true, "Sort; Visible");
		assert.equal(aMenuItems[5].getEnabled(), true, "Sort; Enabled");
		assert.equal(aMenuItems[5].getIcon(), "sap-icon://sort", "Sort; Icon");
	});

	QUnit.test("Group header row; Basic menu items", function(assert) {
		this.oTable.setProperty("extendedGroupHeaderMenu", false);
		sinon.stub(this.oRow, "isGroupHeader").returns(true);
		this.oContextMenu.initContent(this.oRow);

		const aMenuItems = this.oContextMenu.getMenu().getItems();
		assert.equal(aMenuItems.length, 6, "Menu items");

		assert.equal(aMenuItems[0].getText(), TableUtils.getResourceText("TBL_UNGROUP"), "Ungroup; Text");
		assert.equal(aMenuItems[0].getVisible(), true, "Ungroup; Visible");
		assert.equal(aMenuItems[0].getEnabled(), true, "Ungroup; Enabled");
		assert.equal(aMenuItems[0].getSubmenu().getItems()[0].getText(),
			TableUtils.getResourceText("TBL_UNGROUP_LEVEL"), "Ungroup level; Text");
		assert.equal(aMenuItems[0].getSubmenu().getItems()[0].getVisible(), true, "Ungroup level; Visible");
		assert.equal(aMenuItems[0].getSubmenu().getItems()[0].getEnabled(), true, "Ungroup level; Enabled");
		assert.equal(aMenuItems[0].getSubmenu().getItems()[1].getText(),
			TableUtils.getResourceText("TBL_UNGROUP_ALL"), "Ungroup all; Text");
		assert.equal(aMenuItems[0].getSubmenu().getItems()[1].getVisible(), true, "Ungroup all; Visible");
		assert.equal(aMenuItems[0].getSubmenu().getItems()[1].getEnabled(), true, "Ungroup all; Enabled");

		assert.equal(aMenuItems[1].getText(), TableUtils.getResourceText("TBL_COLLAPSE"), "Collapse; Text");
		assert.equal(aMenuItems[1].getVisible(), true, "Collapse; Visible");
		assert.equal(aMenuItems[1].getEnabled(), true, "Collapse; Enabled");
		assert.equal(aMenuItems[1].getIcon(), "sap-icon://collapse-all", "Collapse; Icon");
		assert.equal(aMenuItems[1].getSubmenu().getItems()[0].getText(),
			TableUtils.getResourceText("TBL_COLLAPSE_LEVEL"), "Collapse level; Text");
		assert.equal(aMenuItems[1].getSubmenu().getItems()[0].getVisible(), true, "Collapse level; Visible");
		assert.equal(aMenuItems[1].getSubmenu().getItems()[0].getEnabled(), true, "Collapse level; Enabled");
		assert.equal(aMenuItems[1].getSubmenu().getItems()[1].getText(),
			TableUtils.getResourceText("TBL_COLLAPSE_ALL"), "Collapse all; Text");
		assert.equal(aMenuItems[1].getSubmenu().getItems()[1].getVisible(), true, "Collapse all; Visible");
		assert.equal(aMenuItems[1].getSubmenu().getItems()[1].getEnabled(), true, "Collapse all; Enabled");

		assert.equal(aMenuItems[2].getText(), TableUtils.getResourceText("TBL_EXPAND"), "Expand; Text");
		assert.equal(aMenuItems[2].getVisible(), true, "Expand; Visible");
		assert.equal(aMenuItems[2].getEnabled(), true, "Expand; Enabled");
		assert.equal(aMenuItems[2].getIcon(), "sap-icon://expand-all", "Expand; Icon");
		assert.equal(aMenuItems[2].getSubmenu().getItems()[0].getText(),
			TableUtils.getResourceText("TBL_EXPAND_LEVEL"), "Expand level; Text");
		assert.equal(aMenuItems[2].getSubmenu().getItems()[0].getVisible(), true, "Expand level; Visible");
		assert.equal(aMenuItems[2].getSubmenu().getItems()[0].getEnabled(), true, "Expand level; Enabled");
		assert.equal(aMenuItems[2].getSubmenu().getItems()[1].getText(),
			TableUtils.getResourceText("TBL_EXPAND_ALL"), "Expand all; Text");
		assert.equal(aMenuItems[2].getSubmenu().getItems()[1].getVisible(), true, "Expand all; Visible");
		assert.equal(aMenuItems[2].getSubmenu().getItems()[1].getEnabled(), true, "Expand all; Enabled");

		assert.equal(aMenuItems[3].getText(), TableUtils.getResourceText("TBL_SHOW_COLUMN"), "Show column");
		assert.equal(aMenuItems[3].getVisible(), false, "Show column; Visible");
		assert.equal(aMenuItems[3].getEnabled(), true, "Show column; Enabled");

		assert.equal(aMenuItems[4].getText(), TableUtils.getResourceText("TBL_MOVE"), "Move group; Text");
		assert.equal(aMenuItems[4].getVisible(), false, "Move group; Visible");
		assert.equal(aMenuItems[4].getEnabled(), true, "Move group; Enabled");
		assert.equal(aMenuItems[4].getSubmenu().getItems()[0].getText(),
			TableUtils.getResourceText("TBL_MOVE_UP"), "Move group one level up; Text");
		assert.equal(aMenuItems[4].getSubmenu().getItems()[0].getVisible(), true, "Move group one level up; Visible");
		assert.equal(aMenuItems[4].getSubmenu().getItems()[0].getEnabled(), true, "Move group one level up; Enabled");
		assert.equal(aMenuItems[4].getSubmenu().getItems()[0].getIcon(), "sap-icon://arrow-top", "Move group one level up; Icon");
		assert.equal(aMenuItems[4].getSubmenu().getItems()[1].getText(),
			TableUtils.getResourceText("TBL_MOVE_DOWN"), "Move group one level down; Text");
		assert.equal(aMenuItems[4].getSubmenu().getItems()[1].getVisible(), true, "Move group one level down; Visible");
		assert.equal(aMenuItems[4].getSubmenu().getItems()[1].getEnabled(), true, "Move group one level down; Enabled");
		assert.equal(aMenuItems[4].getSubmenu().getItems()[1].getIcon(), "sap-icon://arrow-bottom", "Move group one level down; Icon");

		assert.equal(aMenuItems[5].getText(), TableUtils.getResourceText("TBL_SORT"), "Sort; Text");
		assert.equal(aMenuItems[5].getVisible(), false, "Sort; Visible");
		assert.equal(aMenuItems[5].getEnabled(), true, "Sort; Enabled");
		assert.equal(aMenuItems[5].getIcon(), "sap-icon://sort", "Sort; Icon");

		this.oTable.setProperty("extendedGroupHeaderMenu", true);
		this.oContextMenu.initContent(this.oRow);

		assert.equal(aMenuItems[0].getVisible(), true, "Ungroup; Visible");
		assert.equal(aMenuItems[1].getVisible(), true, "Collapse; Visible");
		assert.equal(aMenuItems[2].getVisible(), true, "Expand; Visible");
		assert.equal(aMenuItems[3].getVisible(), true, "Show column; Visible");
		assert.equal(aMenuItems[4].getVisible(), true, "Move group; Visible");
		assert.equal(aMenuItems[5].getVisible(), true, "Sort; Visible");
	});

	QUnit.test("Standard row", function(assert) {
		this.oContextMenu.initContent(this.oRow);
		assert.equal(this.oContextMenu.getMenu().getItems().length, 0, "Menu items");
	});

	QUnit.test("Summary row", function(assert) {
		sinon.stub(this.oRow, "isSummary").returns(true);
		this.oContextMenu.initContent(this.oRow);
		assert.equal(this.oContextMenu.getMenu().getItems().length, 0, "Menu items");
	});

	QUnit.test("Standard row after group header row", function(assert) {
		sinon.stub(this.oRow, "isGroupHeader").returns(true);
		this.oContextMenu.initContent(this.oRow);
		assert.equal(this.oContextMenu.getMenu().getItems().length, 6, "Menu items; Group header row");

		this.oRow.isGroupHeader.restore();
		this.oContextMenu.initContent(this.oRow);
		assert.equal(this.oContextMenu.getMenu().getItems().length, 6, "Menu items; Standard row");

		this.oContextMenu.getMenu().getItems().forEach((oItem) => {
			assert.equal(oItem.getVisible(), false, "Menu item visibility; " + oItem.getText());
		});

		sinon.stub(this.oRow, "isGroupHeader").returns(true);
		this.oContextMenu.initContent(this.oRow);
		assert.equal(this.oContextMenu.getMenu().getItems().length, 6, "Menu items; Group header row");

		this.oContextMenu.getMenu().getItems().forEach((oItem) => {
			assert.equal(oItem.getVisible(), true, "Menu item visibility; " + oItem.getText());
		});
	});

	QUnit.module("Visibility item text and Move enabled states", {
		beforeEach: function() {
			this.oContextMenu = new AnalyticalTableContextMenu();
			this.oTable = new AnalyticalTable();
			this.oRow = new Row();
			this.oColumnA = new AnalyticalColumn();
			this.oColumnB = new AnalyticalColumn();
			this.oColumnC = new AnalyticalColumn();
			this.oTable.addColumn(this.oColumnA);
			this.oTable.addColumn(this.oColumnB);
			this.oTable.addColumn(this.oColumnC);
			this.oContextMenu.setParent(this.oTable);
			sinon.stub(this.oRow, "isGroupHeader").returns(true);
		},
		afterEach: function() {
			this.oContextMenu.destroy();
			this.oTable.destroy();
			this.oRow.destroy();
		}
	});

	QUnit.test("Visibility item text; column with showIfGrouped=true", function(assert) {
		this.oColumnB.setShowIfGrouped(true);
		this.oTable._aGroupedColumns = [this.oColumnA.getId(), this.oColumnB.getId(), this.oColumnC.getId()];
		sinon.stub(this.oRow, "getLevel").returns(2); // points to oColumnB

		this.oContextMenu.initContent(this.oRow);

		const oVisibilityItem = this.oContextMenu.getMenu().getItems()[3];
		assert.equal(oVisibilityItem.getText(), TableUtils.getResourceText("TBL_HIDE_COLUMN"),
			"Visibility item shows 'Hide column' when column is currently shown");
	});

	QUnit.test("Visibility item text; column with showIfGrouped=false", function(assert) {
		this.oColumnB.setShowIfGrouped(false);
		this.oTable._aGroupedColumns = [this.oColumnA.getId(), this.oColumnB.getId(), this.oColumnC.getId()];
		sinon.stub(this.oRow, "getLevel").returns(2);

		this.oContextMenu.initContent(this.oRow);

		const oVisibilityItem = this.oContextMenu.getMenu().getItems()[3];
		assert.equal(oVisibilityItem.getText(), TableUtils.getResourceText("TBL_SHOW_COLUMN"),
			"Visibility item shows 'Show column' when column is currently hidden");
	});

	QUnit.test("Move up/down; first grouped level", function(assert) {
		this.oTable._aGroupedColumns = [this.oColumnA.getId(), this.oColumnB.getId(), this.oColumnC.getId()];
		sinon.stub(this.oRow, "getLevel").returns(1); // first level

		this.oContextMenu.initContent(this.oRow);

		const aMoveSubItems = this.oContextMenu.getMenu().getItems()[4].getSubmenu().getItems();
		assert.equal(aMoveSubItems[0].getEnabled(), false, "Move up disabled at first group level");
		assert.equal(aMoveSubItems[1].getEnabled(), true, "Move down enabled at first group level");
	});

	QUnit.test("Move up/down; last grouped level", function(assert) {
		this.oTable._aGroupedColumns = [this.oColumnA.getId(), this.oColumnB.getId(), this.oColumnC.getId()];
		sinon.stub(this.oRow, "getLevel").returns(3); // last level

		this.oContextMenu.initContent(this.oRow);

		const aMoveSubItems = this.oContextMenu.getMenu().getItems()[4].getSubmenu().getItems();
		assert.equal(aMoveSubItems[0].getEnabled(), true, "Move up enabled at last group level");
		assert.equal(aMoveSubItems[1].getEnabled(), false, "Move down disabled at last group level");
	});

	QUnit.test("Move up/down; middle grouped level", function(assert) {
		this.oTable._aGroupedColumns = [this.oColumnA.getId(), this.oColumnB.getId(), this.oColumnC.getId()];
		sinon.stub(this.oRow, "getLevel").returns(2); // middle level

		this.oContextMenu.initContent(this.oRow);

		const aMoveSubItems = this.oContextMenu.getMenu().getItems()[4].getSubmenu().getItems();
		assert.equal(aMoveSubItems[0].getEnabled(), true, "Move up enabled at middle group level");
		assert.equal(aMoveSubItems[1].getEnabled(), true, "Move down enabled at middle group level");
	});

	QUnit.test("No grouped column for level; Move up/down both enabled", function(assert) {
		// _aGroupedColumns is empty so getGroupedColumn returns undefined → else-branch
		this.oTable._aGroupedColumns = [];
		sinon.stub(this.oRow, "getLevel").returns(1);

		this.oContextMenu.initContent(this.oRow);

		const aMoveSubItems = this.oContextMenu.getMenu().getItems()[4].getSubmenu().getItems();
		assert.equal(aMoveSubItems[0].getEnabled(), true, "Move up enabled when no grouped column found");
		assert.equal(aMoveSubItems[1].getEnabled(), true, "Move down enabled when no grouped column found");
	});

	QUnit.module("Select handlers", {
		beforeEach: function() {
			this.oContextMenu = new AnalyticalTableContextMenu();
			this.oTable = new AnalyticalTable();
			this.oRow = new Row();
			this.oColumnA = new AnalyticalColumn();
			this.oColumnB = new AnalyticalColumn();
			this.oColumnC = new AnalyticalColumn();
			this.oTable.addColumn(this.oColumnA);
			this.oTable.addColumn(this.oColumnB);
			this.oTable.addColumn(this.oColumnC);
			this.oTable._aGroupedColumns = [this.oColumnA.getId(), this.oColumnB.getId(), this.oColumnC.getId()];
			this.oContextMenu.setParent(this.oTable);
			sinon.stub(this.oRow, "isGroupHeader").returns(true);
			sinon.stub(this.oRow, "getLevel").returns(2); // middle level → points to oColumnB
		},
		afterEach: function() {
			this.oContextMenu.destroy();
			this.oTable.destroy();
			this.oRow.destroy();
		}
	});

	QUnit.test("Ungroup level select handler", function(assert) {
		this.oContextMenu.initContent(this.oRow);

		const oSpy = sinon.spy(this.oTable, "fireGroup");
		const oColumnSpy = sinon.spy(this.oColumnB, "setGrouped");
		const oUngroupLevel = this.oContextMenu.getMenu().getItems()[0].getSubmenu().getItems()[0];

		oUngroupLevel.fireSelect();

		assert.ok(oColumnSpy.calledWith(false), "Column.setGrouped(false) called");
		assert.ok(oSpy.calledOnce, "Table#fireGroup called once");
		const oArgs = oSpy.firstCall.args[0];
		assert.strictEqual(oArgs.column, this.oColumnB, "fireGroup column param");
		assert.strictEqual(oArgs.type, GroupEventType.ungroup, "fireGroup type param");
		assert.strictEqual(oArgs.groupedColumns, this.oTable._aGroupedColumns, "fireGroup groupedColumns param");
	});

	QUnit.test("Ungroup all select handler", function(assert) {
		this.oContextMenu.initContent(this.oRow);

		const oSuspendSpy = sinon.spy(this.oTable, "suspendUpdateAnalyticalInfo");
		const oResumeSpy = sinon.spy(this.oTable, "resumeUpdateAnalyticalInfo");
		const oFireSpy = sinon.spy(this.oTable, "fireGroup");
		const oColumnASpy = sinon.spy(this.oColumnA, "setGrouped");
		const oColumnBSpy = sinon.spy(this.oColumnB, "setGrouped");
		const oColumnCSpy = sinon.spy(this.oColumnC, "setGrouped");
		const oUngroupAll = this.oContextMenu.getMenu().getItems()[0].getSubmenu().getItems()[1];

		oUngroupAll.fireSelect();

		assert.ok(oSuspendSpy.calledOnce, "suspendUpdateAnalyticalInfo called");
		assert.ok(oResumeSpy.calledOnce, "resumeUpdateAnalyticalInfo called");
		assert.ok(oSuspendSpy.calledBefore(oResumeSpy), "suspend called before resume");
		assert.ok(oColumnASpy.calledWith(false), "Column A ungrouped");
		assert.ok(oColumnBSpy.calledWith(false), "Column B ungrouped");
		assert.ok(oColumnCSpy.calledWith(false), "Column C ungrouped");
		assert.ok(oFireSpy.calledOnce, "Table#fireGroup called once");
		const oArgs = oFireSpy.firstCall.args[0];
		assert.strictEqual(oArgs.column, undefined, "fireGroup column undefined");
		assert.deepEqual(oArgs.groupedColumns, [], "fireGroup groupedColumns empty");
		assert.strictEqual(oArgs.type, GroupEventType.ungroupAll, "fireGroup type ungroupAll");
	});

	QUnit.test("Collapse level select handler", function(assert) {
		this.oContextMenu.initContent(this.oRow);

		const oBinding = {collapseToLevel: sinon.spy()};
		const oSelectionPlugin = {clearSelection: sinon.spy()};
		sinon.stub(this.oTable, "getBinding").returns(oBinding);
		sinon.stub(this.oTable, "_getSelectionPlugin").returns(oSelectionPlugin);
		const oFirstVisibleSpy = sinon.spy(this.oTable, "setFirstVisibleRow");

		const oCollapseLevel = this.oContextMenu.getMenu().getItems()[1].getSubmenu().getItems()[0];
		oCollapseLevel.fireSelect();

		assert.ok(oBinding.collapseToLevel.calledOnceWithExactly(1), "binding.collapseToLevel called with iGroupLevel - 1");
		assert.ok(oFirstVisibleSpy.calledOnceWithExactly(0), "setFirstVisibleRow(0) called");
		assert.ok(oSelectionPlugin.clearSelection.calledOnce, "selection cleared");
	});

	QUnit.test("Collapse all select handler", function(assert) {
		this.oContextMenu.initContent(this.oRow);

		const oBinding = {collapseToLevel: sinon.spy()};
		const oSelectionPlugin = {clearSelection: sinon.spy()};
		sinon.stub(this.oTable, "getBinding").returns(oBinding);
		sinon.stub(this.oTable, "_getSelectionPlugin").returns(oSelectionPlugin);
		const oFirstVisibleSpy = sinon.spy(this.oTable, "setFirstVisibleRow");

		const oCollapseAll = this.oContextMenu.getMenu().getItems()[1].getSubmenu().getItems()[1];
		oCollapseAll.fireSelect();

		assert.ok(oBinding.collapseToLevel.calledOnceWithExactly(0), "binding.collapseToLevel(0) called");
		assert.ok(oFirstVisibleSpy.calledOnceWithExactly(0), "setFirstVisibleRow(0) called");
		assert.ok(oSelectionPlugin.clearSelection.calledOnce, "selection cleared");
	});

	QUnit.test("Expand level select handler", function(assert) {
		this.oContextMenu.initContent(this.oRow);

		const oBinding = {expandToLevel: sinon.spy()};
		const oSelectionPlugin = {clearSelection: sinon.spy()};
		sinon.stub(this.oTable, "getBinding").returns(oBinding);
		sinon.stub(this.oTable, "_getSelectionPlugin").returns(oSelectionPlugin);
		const oFirstVisibleSpy = sinon.spy(this.oTable, "setFirstVisibleRow");

		const oExpandLevel = this.oContextMenu.getMenu().getItems()[2].getSubmenu().getItems()[0];
		oExpandLevel.fireSelect();

		assert.ok(oBinding.expandToLevel.calledOnceWithExactly(2), "binding.expandToLevel called with iGroupLevel");
		assert.ok(oFirstVisibleSpy.calledOnceWithExactly(0), "setFirstVisibleRow(0) called");
		assert.ok(oSelectionPlugin.clearSelection.calledOnce, "selection cleared");
	});

	QUnit.test("Expand all select handler", function(assert) {
		this.oContextMenu.initContent(this.oRow);

		const oExpandAllSpy = sinon.stub(this.oTable, "expandAll");
		const oExpandAll = this.oContextMenu.getMenu().getItems()[2].getSubmenu().getItems()[1];
		oExpandAll.fireSelect();

		assert.ok(oExpandAllSpy.calledOnce, "Table#expandAll called");
	});

	QUnit.test("Visibility select handler; toggle from shown to hidden", function(assert) {
		this.oColumnB.setShowIfGrouped(true);
		this.oContextMenu.initContent(this.oRow);

		const oFireSpy = sinon.spy(this.oTable, "fireGroup");
		const oVisibilityItem = this.oContextMenu.getMenu().getItems()[3];

		oVisibilityItem.fireSelect();

		assert.equal(this.oColumnB.getShowIfGrouped(), false, "showIfGrouped toggled to false");
		assert.ok(oFireSpy.calledOnce, "fireGroup called once");
		const oArgs = oFireSpy.firstCall.args[0];
		assert.strictEqual(oArgs.column, this.oColumnB, "fireGroup column param");
		assert.strictEqual(oArgs.type, GroupEventType.hideGroupedColumn, "fireGroup hideGroupedColumn type");
	});

	QUnit.test("Visibility select handler; toggle from hidden to shown", function(assert) {
		this.oColumnB.setShowIfGrouped(false);
		this.oContextMenu.initContent(this.oRow);

		const oFireSpy = sinon.spy(this.oTable, "fireGroup");
		const oVisibilityItem = this.oContextMenu.getMenu().getItems()[3];

		oVisibilityItem.fireSelect();

		assert.equal(this.oColumnB.getShowIfGrouped(), true, "showIfGrouped toggled to true");
		assert.ok(oFireSpy.calledOnce, "fireGroup called once");
		const oArgs = oFireSpy.firstCall.args[0];
		assert.strictEqual(oArgs.column, this.oColumnB, "fireGroup column param");
		assert.strictEqual(oArgs.type, GroupEventType.showGroupedColumn, "fireGroup showGroupedColumn type");
	});

	QUnit.test("Move up select handler; from middle level swaps with previous", function(assert) {
		this.oContextMenu.initContent(this.oRow);

		const oUpdateSpy = sinon.stub(this.oTable, "updateAnalyticalInfo");
		const oFireSpy = sinon.spy(this.oTable, "fireGroup");
		const aBefore = this.oTable._aGroupedColumns.slice();
		const oMoveUp = this.oContextMenu.getMenu().getItems()[4].getSubmenu().getItems()[0];

		oMoveUp.fireSelect();

		assert.deepEqual(this.oTable._aGroupedColumns, [aBefore[1], aBefore[0], aBefore[2]], "Grouped columns reordered: B,A,C");
		assert.ok(oUpdateSpy.calledOnce, "updateAnalyticalInfo called");
		assert.ok(oFireSpy.calledOnce, "fireGroup called once");
		const oArgs = oFireSpy.firstCall.args[0];
		assert.strictEqual(oArgs.column, this.oColumnB, "fireGroup column param");
		assert.strictEqual(oArgs.type, GroupEventType.moveUp, "fireGroup moveUp type");
	});

	QUnit.test("Move down select handler; from middle level swaps with next", function(assert) {
		this.oContextMenu.initContent(this.oRow);

		const oUpdateSpy = sinon.stub(this.oTable, "updateAnalyticalInfo");
		const oFireSpy = sinon.spy(this.oTable, "fireGroup");
		const aBefore = this.oTable._aGroupedColumns.slice();
		const oMoveDown = this.oContextMenu.getMenu().getItems()[4].getSubmenu().getItems()[1];

		oMoveDown.fireSelect();

		assert.deepEqual(this.oTable._aGroupedColumns, [aBefore[0], aBefore[2], aBefore[1]], "Grouped columns reordered: A,C,B");
		assert.ok(oUpdateSpy.calledOnce, "updateAnalyticalInfo called");
		assert.ok(oFireSpy.calledOnce, "fireGroup called once");
		const oArgs = oFireSpy.firstCall.args[0];
		assert.strictEqual(oArgs.column, this.oColumnB, "fireGroup column param");
		assert.strictEqual(oArgs.type, GroupEventType.moveDown, "fireGroup moveDown type");
	});

	QUnit.test("Sort ascending select handler", function(assert) {
		this.oContextMenu.initContent(this.oRow);

		const oSortStub = sinon.stub(this.oTable, "sort");
		const oSortAsc = this.oContextMenu.getMenu().getItems()[5].getSubmenu().getItems()[0];

		oSortAsc.fireSelect();

		assert.ok(oSortStub.calledOnceWithExactly(this.oColumnB, SortOrder.Ascending), "Table#sort called with column and ascending order");
	});

	QUnit.test("Sort descending select handler", function(assert) {
		this.oContextMenu.initContent(this.oRow);

		const oSortStub = sinon.stub(this.oTable, "sort");
		const oSortDesc = this.oContextMenu.getMenu().getItems()[5].getSubmenu().getItems()[1];

		oSortDesc.fireSelect();

		assert.ok(oSortStub.calledOnceWithExactly(this.oColumnB, SortOrder.Descending), "Table#sort called with column and descending order");
	});
});