/*global QUnit, sinon */

sap.ui.define([
	"sap/ui/table/qunit/TableQUnitUtils",
	"sap/ui/table/plugins/MultiSelectionPlugin",
	"sap/ui/table/plugins/SelectionPlugin",
	"sap/ui/table/rowmodes/Fixed",
	"sap/ui/table/utils/TableUtils",
	"sap/ui/table/library",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/model/Sorter",
	"sap/ui/model/Filter",
	"sap/ui/core/IconPool"
], function(
	TableQUnitUtils,
	MultiSelectionPlugin,
	SelectionPlugin,
	FixedRowMode,
	TableUtils,
	library,
	qutils,
	Sorter,
	Filter,
	IconPool
) {
	"use strict";

	const SelectionMode = library.SelectionMode;

	QUnit.module("Basics", {
		beforeEach: function() {
			this.oTable = TableQUnitUtils.createTable({
				rows: {path: "/"},
				models: TableQUnitUtils.createJSONModelWithEmptyRows(10)
			});
		},
		afterEach: function() {
			this.oTable.destroy();
		},
		assertHeaderSelector: function(assert, oHeaderSelector, mExpectedConfig, sTitle) {
			if (mExpectedConfig.visible === false) {
				assert.strictEqual(oHeaderSelector.getVisible(), false, sTitle + "; HeaderSelector is not visible");
			} else {
				assert.strictEqual(oHeaderSelector.getVisible(), mExpectedConfig.visible, sTitle + "; Visible: " + mExpectedConfig.visible);
				assert.strictEqual(oHeaderSelector.getType(), mExpectedConfig.type, sTitle + "; Type: " + mExpectedConfig.type);
				assert.strictEqual(oHeaderSelector.getEnabled(), mExpectedConfig.enabled, sTitle + "; Enabled: " + mExpectedConfig.enabled);
				assert.strictEqual(oHeaderSelector.getCheckBoxSelected(),
					mExpectedConfig.selected, sTitle + "; CheckBoxSelected: " + mExpectedConfig.selected);

				if (mExpectedConfig.icon) {
					assert.strictEqual(oHeaderSelector.getIcon(), IconPool.getIconURI(mExpectedConfig.icon),
						sTitle + "; Icon: " + mExpectedConfig.icon);
				} if (mExpectedConfig.tooltip) {
					assert.strictEqual(oHeaderSelector.getTooltip(), mExpectedConfig.tooltip, sTitle + "; Tooltip: " + mExpectedConfig.tooltip);
				}
			}
		}
	});

	QUnit.test("Initialization", function(assert) {
		const oMultiSelectionPlugin = new MultiSelectionPlugin();
		assert.equal(oMultiSelectionPlugin.oInnerSelectionPlugin, null, "The MultiSelectionPlugin has no internal default selection plugin");
	});

	QUnit.test("Add to and remove from table", function(assert) {
		const oMultiSelectionPlugin = new MultiSelectionPlugin();

		this.oTable.addDependent(oMultiSelectionPlugin);
		assert.notEqual(oMultiSelectionPlugin.oInnerSelectionPlugin, null, "The MultiSelectionPlugin has an internal default selection plugin");

		this.oTable.removeDependent(oMultiSelectionPlugin);
		assert.equal(oMultiSelectionPlugin.oInnerSelectionPlugin, null, "The MultiSelectionPlugin has no internal default selection plugin");
	});

	QUnit.test("Destruction", function(assert) {
		const oMultiSelectionPlugin = new MultiSelectionPlugin();

		this.oTable.addDependent(oMultiSelectionPlugin);
		const oInnerSelectionPlugin = oMultiSelectionPlugin.oInnerSelectionPlugin;

		oMultiSelectionPlugin.destroy();
		assert.ok(oInnerSelectionPlugin.isDestroyed(), "The internal default selection plugin is destroyed");
		assert.equal(oMultiSelectionPlugin.oInnerSelectionPlugin, null, "The reference to the internal default selection plugin is cleared");
	});

	QUnit.test("HeaderSelector", async function(assert) {
		const oMultiSelectionPlugin = new MultiSelectionPlugin();
		const sDeselectAll = TableUtils.getResourceText("TBL_DESELECT_ALL");
		const sSelectAll = TableUtils.getResourceText("TBL_SELECT_ALL");

		this.oTable.addDependent(oMultiSelectionPlugin);
		const oHeaderSelector = this.oTable._getHeaderSelector();

		this.assertHeaderSelector(assert, oHeaderSelector, {
			type: "Icon",
			icon: TableUtils.ThemeParameters.checkboxIcon,
			visible: true,
			enabled: true,
			selected: false,
			tooltip: sSelectAll
		}, "MultiToggle");

		oMultiSelectionPlugin.setSelectionMode(SelectionMode.Single);
		this.assertHeaderSelector(assert, oHeaderSelector, {
			visible: false
		}, "Single");

		oMultiSelectionPlugin.setSelectionMode(SelectionMode.MultiToggle);
		oMultiSelectionPlugin.setShowHeaderSelector(false);
		this.assertHeaderSelector(assert, oHeaderSelector, {
			visible: false
		}, "MultiToggle; HeaderSelector hidden");

		oMultiSelectionPlugin.setShowHeaderSelector(true);
		oMultiSelectionPlugin.setLimit(0);
		this.assertHeaderSelector(assert, oHeaderSelector, {
			type: "CheckBox",
			visible: true,
			enabled: true,
			selected: false,
			tooltip: null
		}, "MultiToggle; Limit disabled");

		await oMultiSelectionPlugin.selectAll();
		this.assertHeaderSelector(assert, oHeaderSelector, {
			type: "CheckBox",
			visible: true,
			enabled: true,
			selected: true,
			tooltip: null
		}, "MultiToggle; Limit disabled; All rows selected");

		oMultiSelectionPlugin.setLimit(1);
		await oMultiSelectionPlugin.setSelectionInterval(1, 1);
		this.assertHeaderSelector(assert, oHeaderSelector, {
			type: "Icon",
			icon: TableUtils.ThemeParameters.clearSelectionIcon,
			visible: true,
			enabled: true,
			selected: false,
			tooltip: sDeselectAll
		}, "MultiToggle; One row selected");

		oMultiSelectionPlugin.setSelectionMode(SelectionMode.Single);
		await oMultiSelectionPlugin.setSelectionInterval(1, 1);
		this.assertHeaderSelector(assert, oHeaderSelector, {
			visible: false
		}, "Single; One row selected");

		oMultiSelectionPlugin.setSelectionMode(SelectionMode.MultiToggle);
		oMultiSelectionPlugin.setEnabled(false);
		this.assertHeaderSelector(assert, oHeaderSelector, {
			visible: false
		}, "MultiToggle; Plugin disabled");

		oMultiSelectionPlugin.setEnabled(true);
		oMultiSelectionPlugin.setSelectionMode(SelectionMode.None);
		this.assertHeaderSelector(assert, oHeaderSelector, {
			visible: false
		}, "None");
	});

	QUnit.test("#setSelected", async function(assert) {
		const oMultiSelectionPlugin = new MultiSelectionPlugin();

		await this.oTable.qunit.rendered();

		oMultiSelectionPlugin.setSelected(this.oTable.getRows()[0], true);
		assert.deepEqual(oMultiSelectionPlugin.getSelectedIndices(), [], "Select a row when not assigned to a table");

		this.oTable.addDependent(oMultiSelectionPlugin);
		oMultiSelectionPlugin.setSelected(this.oTable.getRows()[0], true);
		await TableQUnitUtils.nextEvent("selectionChange", oMultiSelectionPlugin);

		assert.deepEqual(oMultiSelectionPlugin.getSelectedIndices(), [0], "Select a row");
		oMultiSelectionPlugin.setSelected(this.oTable.getRows()[2], true, {range: true});
		await TableQUnitUtils.nextEvent("selectionChange", oMultiSelectionPlugin);

		assert.deepEqual(oMultiSelectionPlugin.getSelectedIndices(), [0, 1, 2], "Select a range");
		oMultiSelectionPlugin.setSelected(this.oTable.getRows()[1], false);
		assert.deepEqual(oMultiSelectionPlugin.getSelectedIndices(), [0, 2], "Deselect a row");

		oMultiSelectionPlugin.clearSelection();
		this.oTable.getModel().setData();
		await this.oTable.qunit.rendered();

		oMultiSelectionPlugin.setSelected(this.oTable.getRows()[0], true);
		await TableQUnitUtils.sleep(100);

		assert.deepEqual(oMultiSelectionPlugin.getSelectedIndices(), [], "Select a row that is not selectable");
	});

	QUnit.test("findOn", function(assert) {
		const oMultiSelectionPlugin = new MultiSelectionPlugin();
		this.oTable.addDependent(oMultiSelectionPlugin);

		assert.ok(SelectionPlugin.findOn(this.oTable) === oMultiSelectionPlugin,
			"Plugin found on dependents aggregation via SelectionPlugin.findOn");
		assert.ok(MultiSelectionPlugin.findOn(this.oTable) === oMultiSelectionPlugin,
			"Plugin found on dependents aggregation via MultiSelectionPlugin.findOn");

		/**
		 * @deprecated As of version 1.120
		 */
		if (this.oTable.addPlugin) {
			this.oTable.addPlugin(oMultiSelectionPlugin);
			assert.ok(SelectionPlugin.findOn(this.oTable) === oMultiSelectionPlugin,
				"Plugin found on plugin aggregation via SelectionPlugin.findOn");
			assert.ok(MultiSelectionPlugin.findOn(this.oTable) === oMultiSelectionPlugin,
				"Plugin found on plugin aggregation via MultiSelectionPlugin.findOn");
		}
	});

	QUnit.module("_internalTrigger selectionChange event parameter", {
		beforeEach: async function() {
			this.oMultiSelectionPlugin = new MultiSelectionPlugin();
			this.oTable = TableQUnitUtils.createTable({
				rows: {path: "/"},
				models: TableQUnitUtils.createJSONModelWithEmptyRows(10),
				dependents: this.oMultiSelectionPlugin
			});
			await this.oTable.qunit.rendered();
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("Selection change", async function(assert) {
		this.oMultiSelectionPlugin.attachEventOnce("selectionChange", (oEvent) => {
			assert.deepEqual(oEvent.getParameter("_internalTrigger"), undefined);
		});
		await this.oMultiSelectionPlugin.addSelectionInterval(0, 4);
	});

	QUnit.test("Binding length change", async function(assert) {
		await this.oMultiSelectionPlugin.addSelectionInterval(0, 4);
		this.oMultiSelectionPlugin.attachEventOnce("selectionChange", (oEvent) => {
			assert.deepEqual(oEvent.getParameter("_internalTrigger"), true);
		});
		this.oTable.getBinding().getModel().getData().push({});
		this.oTable.getBinding().refresh();
	});

	QUnit.test("Sort", async function(assert) {
		await this.oMultiSelectionPlugin.addSelectionInterval(0, 4);
		this.oMultiSelectionPlugin.attachEventOnce("selectionChange", (oEvent) => {
			assert.deepEqual(oEvent.getParameter("_internalTrigger"), true);
		});
		this.oTable.getBinding().sort(new Sorter({path: "something"}));
	});

	QUnit.test("Filter", async function(assert) {
		await this.oMultiSelectionPlugin.addSelectionInterval(0, 4);
		this.oMultiSelectionPlugin.attachEventOnce("selectionChange", (oEvent) => {
			assert.deepEqual(oEvent.getParameter("_internalTrigger"), true);
		});
		this.oTable.getBinding().filter(new Filter({path: "something", operator: "EQ", value1: "something"}));
	});

	QUnit.module("HeaderSelector", {
		beforeEach: function() {
			this.oTable = TableQUnitUtils.createTable({
				dependents: [
					new MultiSelectionPlugin()
				],
				models: TableQUnitUtils.createJSONModelWithEmptyRows(10)
			});
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("Enable/Disable", async function(assert) {
		const oTable = this.oTable;
		const oSelectionPlugin = oTable._getSelectionPlugin();
		const oHeaderSelector = oTable._getHeaderSelector();

		await oTable.qunit.rendered();
		assert.strictEqual(oHeaderSelector.getEnabled(), false, "Before bindRows: HeaderSelector is disabled");
		assert.strictEqual(oHeaderSelector.getIcon(), IconPool.getIconURI(TableUtils.ThemeParameters.checkboxIcon), "checkboxIcon is correct");
		assert.strictEqual(oHeaderSelector.getTooltip(), TableUtils.getResourceText("TBL_SELECT_ALL"), "Tooltip is correct");

		oTable.bindRows({path: "/"});
		await oTable.qunit.rendered();
		assert.ok(oTable.getBinding().getLength() > 0, "After bindRows: Table has data");
		assert.strictEqual(oHeaderSelector.getEnabled(), true, "After bindRows: HeaderSelector is enabled");
		assert.strictEqual(oHeaderSelector.getVisible(), true, "After bindRows: HeaderSelector is visible");
		assert.strictEqual(oHeaderSelector.getIcon(), IconPool.getIconURI(TableUtils.ThemeParameters.checkboxIcon), "checkboxIcon is correct");
		assert.strictEqual(oHeaderSelector.getTooltip(), TableUtils.getResourceText("TBL_SELECT_ALL"), "Tooltip is correct");

		await new Promise((resolve) => {
			oSelectionPlugin.attachEventOnce("selectionChange", (oEvent) => {
				assert.strictEqual(oHeaderSelector.getEnabled(), true, "After rows are selected: HeaderSelector is enabled");
				oTable.unbindRows();
				resolve();
			});
			oSelectionPlugin.setSelectedIndex(0);
		});
		await oTable.qunit.rendered();
		assert.strictEqual(oHeaderSelector.getEnabled(), false, "After unbindRows: HeaderSelector is disabled");
	});

	QUnit.module("Multi selection behavior", {
		beforeEach: function() {
			this.oTable = TableQUnitUtils.createTable({
				dependents: [
					new MultiSelectionPlugin()
				],
				rows: "{/}",
				models: TableQUnitUtils.createJSONModelWithEmptyRows(16),
				rowMode: new FixedRowMode()
			});

			return this.oTable.qunit.rendered();
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("HeaderSelector", async function(assert) {
		const oTable = this.oTable;
		const oHeaderSelector = oTable._getHeaderSelector();
		const oSelectionPlugin = oTable._getSelectionPlugin();

		assert.ok(oSelectionPlugin.isA("sap.ui.table.plugins.MultiSelectionPlugin"), "MultiSelectionPlugin is initialised");
		assert.strictEqual(oHeaderSelector.getType(), "Icon", "HeaderSelector type is icon");
		assert.strictEqual(oHeaderSelector.getTooltip(), "Select All", "Tooltip is correct");
		assert.strictEqual(oHeaderSelector.getEnabled(), true, "HeaderSelector is enabled");
		assert.strictEqual(oHeaderSelector.getVisible(), true, "HeaderSelector is visible");

		oTable.setEnableSelectAll(false);
		assert.strictEqual(oHeaderSelector.getTooltip(), "Select All", "Tooltip is correct");
		assert.strictEqual(oHeaderSelector.getEnabled(), true, "HeaderSelector is enabled");
		assert.strictEqual(oHeaderSelector.getVisible(), true, "HeaderSelector is visible");

		const nextSelectionChange = TableQUnitUtils.nextEvent("selectionChange", oSelectionPlugin);

		oSelectionPlugin.setSelectedIndex(0);
		await nextSelectionChange;

		assert.strictEqual(oHeaderSelector.getTooltip(), "Deselect All", "Tooltip is correct");
		assert.strictEqual(oHeaderSelector.getEnabled(), true, "HeaderSelector is enabled");
		oTable.setEnableSelectAll(true);

		const oSetPropertySpy = sinon.spy(oSelectionPlugin, "setProperty");
		oSelectionPlugin.setLimit(5);
		await oTable.qunit.rendered();

		assert.ok(oSetPropertySpy.calledOnceWithExactly("limit", 5, true), "setProperty called once with the correct parameters");
		oSetPropertySpy.resetHistory();

		oSelectionPlugin.setLimit(0);
		await oTable.qunit.rendered();

		assert.ok(oSetPropertySpy.calledOnceWithExactly("limit", 0, false), "setProperty called once with the correct parameters");
		assert.strictEqual(oHeaderSelector.getType(), "CheckBox", "HeaderSelector type is checkbox when limit is disabled");
		assert.strictEqual(oHeaderSelector.getTooltip(), null, "Tooltip is correct");
	});

	QUnit.test("Change SelectionMode", function(assert) {
		const oMultiSelectionPlugin = new MultiSelectionPlugin({
			selectionMode: library.SelectionMode.Single
		});

		assert.equal(this.oTable._getSelectionPlugin().getSelectionMode(), SelectionMode.MultiToggle, "SelectionMode is correctly initialized");

		this.oTable.destroyDependents();
		this.oTable.addDependent(oMultiSelectionPlugin);
		assert.equal(oMultiSelectionPlugin.getSelectionMode(), SelectionMode.Single, "SelectionMode is correctly initialized");
		assert.equal(oMultiSelectionPlugin.oInnerSelectionPlugin.getSelectionMode(), SelectionMode.Single,
			"SelectionMode is properly set in the inner selection plugin");
		assert.equal(this.oTable.getSelectionMode(), SelectionMode.Single, "SelectionMode is properly set in the Table");

		oMultiSelectionPlugin.setSelectionMode(SelectionMode.MultiToggle);
		assert.equal(oMultiSelectionPlugin.getSelectionMode(), SelectionMode.MultiToggle, "SelectionMode is properly set");
		assert.equal(oMultiSelectionPlugin.oInnerSelectionPlugin.getSelectionMode(), SelectionMode.MultiToggle,
			"SelectionMode is properly set in the inner selection plugin");
		assert.equal(this.oTable.getSelectionMode(), SelectionMode.MultiToggle, "The SelectionMode is properly set in the Table");

		oMultiSelectionPlugin.setEnabled(false);
		assert.equal(oMultiSelectionPlugin.getSelectionMode(), SelectionMode.MultiToggle, "SelectionMode is properly set");
		assert.equal(this.oTable.getSelectionMode(), SelectionMode.None, "The SelectionMode is properly set in the Table");

		oMultiSelectionPlugin.setSelectionMode(SelectionMode.Single);
		assert.equal(oMultiSelectionPlugin.getSelectionMode(), SelectionMode.Single, "SelectionMode is properly set");
		assert.equal(this.oTable.getSelectionMode(), SelectionMode.None, "The SelectionMode is properly set in the Table");

		oMultiSelectionPlugin.setEnabled(true);
		assert.equal(oMultiSelectionPlugin.getSelectionMode(), SelectionMode.Single, "SelectionMode is correctly initialized");
		assert.equal(oMultiSelectionPlugin.oInnerSelectionPlugin.getSelectionMode(), SelectionMode.Single,
			"SelectionMode is properly set in the inner selection plugin");
		assert.equal(this.oTable.getSelectionMode(), SelectionMode.Single, "SelectionMode is properly set in the Table");

		oMultiSelectionPlugin.setSelectionMode(SelectionMode.None);
		assert.equal(oMultiSelectionPlugin.getSelectionMode(), SelectionMode.None, "SelectionMode is properly set");
		assert.equal(oMultiSelectionPlugin.oInnerSelectionPlugin.getSelectionMode(), SelectionMode.None,
			"SelectionMode is properly set in the inner selection plugin");
		assert.equal(this.oTable.getSelectionMode(), SelectionMode.None, "The SelectionMode is properly set in the Table");

		oMultiSelectionPlugin.setSelectionMode();
		assert.equal(oMultiSelectionPlugin.getSelectionMode(), SelectionMode.MultiToggle, "SelectionMode is properly set");
		assert.equal(oMultiSelectionPlugin.oInnerSelectionPlugin.getSelectionMode(), SelectionMode.MultiToggle,
			"SelectionMode is properly set in the inner selection plugin");
		assert.equal(this.oTable.getSelectionMode(), SelectionMode.MultiToggle, "The SelectionMode is properly set in the Table");
	});

	QUnit.test("Selection using addSelectionInterval: Selection not possible", async function(assert) {
		const oSelectionPlugin = this.oTable._getSelectionPlugin();
		const fnGetContexts = sinon.spy(this.oTable.getBinding(), "getContexts");
		const oSelectionChangeSpy = sinon.spy();
		const iHighestSelectableIndex = oSelectionPlugin._getHighestSelectableIndex();

		oSelectionPlugin.attachSelectionChange(oSelectionChangeSpy);

		try {
			await oSelectionPlugin.addSelectionInterval(-1, -2);
			assert.ok(false, "The promise should have been rejected because the indices are out of range");
		} catch (oError) {
			assert.deepEqual(oError.toString(), "Error: Out of range", "Promise rejected with Error: Out of range");
			assert.ok(fnGetContexts.notCalled, "getContexts was not called");
			assert.equal(oSelectionPlugin.getSelectedCount(), 0, "No items are selected");
			assert.ok(oSelectionChangeSpy.notCalled, "The \"selectionChange\" event was not fired");
		}

		sinon.stub(oSelectionPlugin, "_getHighestSelectableIndex").returns(-1);
		fnGetContexts.resetHistory();
		oSelectionChangeSpy.resetHistory();
		try {
			await oSelectionPlugin.addSelectionInterval(0, 0);
			assert.ok(false, "The promise should have been rejected because the indices are out of range");
		} catch (oError) {
			assert.equal(oError.toString(), "Error: Out of range", "Promise rejected with Error: Out of range");
			assert.ok(fnGetContexts.notCalled, "getContexts was not called");
			assert.equal(oSelectionPlugin.getSelectedCount(), 0, "No items are selected");
			assert.ok(oSelectionChangeSpy.notCalled, "The \"selectionChange\" event was not fired");
			oSelectionPlugin._getHighestSelectableIndex.restore();
		}

		fnGetContexts.resetHistory();
		oSelectionChangeSpy.resetHistory();
		try {
			await oSelectionPlugin.addSelectionInterval(iHighestSelectableIndex + 1, iHighestSelectableIndex + 1);
			assert.ok(false, "The promise should have been rejected because the indices are out of range");
		} catch (oError) {
			assert.equal(oError.toString(), "Error: Out of range", "Promise rejected with Error: Out of range");
			assert.ok(fnGetContexts.notCalled, "getContexts was not called");
			assert.equal(oSelectionPlugin.getSelectedCount(), 0, "No items are selected");
			assert.ok(oSelectionChangeSpy.notCalled, "The \"selectionChange\" event was not fired");
		}

		oSelectionPlugin.setSelectionMode(SelectionMode.None);
		fnGetContexts.resetHistory();
		oSelectionChangeSpy.resetHistory();
		oSelectionPlugin.addSelectionInterval(6, 7).then(() => {
			assert.ok(false, "The promise should have been rejected because the selection mode is \"None\"");
		}).catch((oError) => {
			assert.equal(oError.toString(), "Error: SelectionMode is 'None'", "Promise rejected with Error: SelectionMode is 'None'");
			assert.ok(fnGetContexts.notCalled, "getContexts was not called");
			assert.equal(oSelectionPlugin.getSelectedCount(), 0, "No items are selected");
			assert.ok(oSelectionChangeSpy.notCalled, "The \"selectionChange\" event was not fired");
		});

		oSelectionPlugin.setEnabled(false);
		fnGetContexts.resetHistory();
		oSelectionChangeSpy.resetHistory();
		oSelectionPlugin.addSelectionInterval(6, 7).then(() => {
			assert.ok(false, "The promise should have been rejected because the plugin is disabled");
		}).catch((oError) => {
			assert.equal(oError.toString(), "Error: Plugin is disabled", "Promise rejected with Error: Plugin is disabled");
			assert.ok(fnGetContexts.notCalled, "getContexts was not called");
			assert.equal(oSelectionPlugin.getSelectedCount(), 0, "No items are selected");
			assert.ok(oSelectionChangeSpy.notCalled, "The \"selectionChange\" event was not fired");
		});
	});

	QUnit.test("Selection using addSelectionInterval: Number of items in range below limit", async function(assert) {
		const oSelectionPlugin = this.oTable._getSelectionPlugin();
		const fnGetContexts = sinon.spy(this.oTable.getBinding(), "getContexts");
		const oSelectionChangeSpy = sinon.spy();
		const iSelectableCount = oSelectionPlugin.getSelectableCount();

		oSelectionPlugin.setLimit(5);
		oSelectionPlugin.attachSelectionChange(oSelectionChangeSpy);

		oSelectionPlugin.attachEventOnce("selectionChange", (oEvent) => {
			assert.deepEqual(oEvent.getParameters().rowIndices, [0, 1, 2, 3, 4], "selectionChange event: \"rowIndices\" parameter is correct");
			assert.notOk(oEvent.getParameters().limitReached, "selectionChange event: \"limitReached\" parameter is correct");
		});
		await oSelectionPlugin.addSelectionInterval(0, 4);
		assert.ok(fnGetContexts.calledOnceWithExactly(0, 5, 0, true), "getContexts was called once with the correct parameters");
		assert.deepEqual(oSelectionPlugin.getSelectedIndices(), [0, 1, 2, 3, 4],
			"Range selection is possible for number of items below limit");
		assert.ok(oSelectionChangeSpy.calledOnce, "The \"selectionChange\" event was fired once");

		oSelectionPlugin.attachEventOnce("selectionChange", (oEvent) => {
			assert.deepEqual(oEvent.getParameters().rowIndices, [5], "selectionChange event: \"rowIndices\" parameter is correct");
			assert.notOk(oEvent.getParameters().limitReached, "selectionChange event: \"limitReached\" parameter is correct");
		});
		fnGetContexts.resetHistory();
		oSelectionChangeSpy.resetHistory();
		await oSelectionPlugin.addSelectionInterval(-1, 5);
		assert.ok(fnGetContexts.calledOnceWithExactly(1, 5, 0, true), "getContexts was called once with the correct parameters");
		assert.deepEqual(oSelectionPlugin.getSelectedIndices(), [0, 1, 2, 3, 4, 5],
			"Multiple selections are possible. When indexFrom is already selected, the selection starts from the next index");
		assert.ok(oSelectionChangeSpy.calledOnce, "The \"selectionChange\" event was fired once");

		fnGetContexts.resetHistory();
		oSelectionChangeSpy.resetHistory();
		oSelectionPlugin.addSelectionInterval(5, 5);
		await TableQUnitUtils.sleep(100);

		assert.ok(fnGetContexts.calledOnceWithExactly(5, 1, 0, true), "getContexts was called once with the correct parameters");
		assert.deepEqual(oSelectionPlugin.getSelectedIndices(), [0, 1, 2, 3, 4, 5],
			"The selection is not changed because the index was already selected");
		assert.ok(oSelectionChangeSpy.notCalled, "The \"selectionChange\" event was not fired");

		oSelectionPlugin.attachEventOnce("selectionChange", (oEvent) => {
			assert.deepEqual(oEvent.getParameters().rowIndices, [iSelectableCount - 1],
				"selectionChange event: \"rowIndices\" parameter is correct");
			assert.notOk(oEvent.getParameters().limitReached, "selectionChange event: \"limitReached\" parameter is correct");
		});
		fnGetContexts.resetHistory();
		oSelectionChangeSpy.resetHistory();
		await oSelectionPlugin.addSelectionInterval(iSelectableCount - 1, iSelectableCount + 100);
		assert.ok(fnGetContexts.calledOnceWithExactly(iSelectableCount - 1, 1, 0, true),
			"getContexts was called once with the correct parameters");
		assert.deepEqual(oSelectionPlugin.getSelectedIndices(), [0, 1, 2, 3, 4, 5, iSelectableCount - 1],
			"Range selection is possible for number of items below limit");
		assert.ok(oSelectionChangeSpy.calledOnce, "The \"selectionChange\" event was fired once");

		try {
			await oSelectionPlugin.addSelectionInterval(-1, -1);
		} catch {
			assert.deepEqual(oSelectionPlugin.getSelectedIndices(), [0, 1, 2, 3, 4, 5, iSelectableCount - 1], "The selection did not change");
		}
	});

	QUnit.test("Reverse selection using addSelectionInterval: Number of items in range below limit", async function(assert) {
		const oSelectionPlugin = this.oTable._getSelectionPlugin();
		const fnGetContexts = sinon.spy(this.oTable.getBinding(), "getContexts");

		oSelectionPlugin.setLimit(5);

		await new Promise((resolve) => {
			oSelectionPlugin.attachEventOnce("selectionChange", (oEvent) => {
				assert.ok(fnGetContexts.calledOnceWithExactly(5, 5, 0, true), "getContexts was called once with the correct parameters");
				assert.deepEqual(oEvent.getParameters().rowIndices, [5, 6, 7, 8, 9], "rowIndices parameter is correct");
				assert.notOk(oEvent.getParameters().limitReached, "limitReached parameter is correct");
				assert.deepEqual(oSelectionPlugin.getSelectedIndices(), [5, 6, 7, 8, 9],
					"Reverse range selection is possible for number of items below limit");
				resolve();
			});
			oSelectionPlugin.addSelectionInterval(9, 5);
		});

		fnGetContexts.resetHistory();
		await new Promise((resolve) => {
			oSelectionPlugin.attachEventOnce("selectionChange", (oEvent) => {
				assert.ok(fnGetContexts.calledOnceWithExactly(4, 5, 0, true), "getContexts was called once with the correct parameters");
				assert.deepEqual(oEvent.getParameters().rowIndices, [4], "rowIndices parameter is correct");
				assert.notOk(oEvent.getParameters().limitReached, "limitReached parameter is correct");
				assert.deepEqual(oSelectionPlugin.getSelectedIndices(), [4, 5, 6, 7, 8, 9],
					"Multiple selections are possible. When indexFrom is already selected, the selection starts from the previous index");
				resolve();
			});

			oSelectionPlugin.addSelectionInterval(9, 4);
		});
	});

	QUnit.test("Selection using addSelectionInterval: Number of items in range above limit", async function(assert) {
		const oTable = this.oTable;
		const oSelectionPlugin = oTable._getSelectionPlugin();
		const fnGetContexts = sinon.spy(oTable.getBinding(), "getContexts");
		const oSelectionChangeSpy = sinon.spy();
		const oFirstVisibleRowChangedSpy = sinon.spy();
		const oRowsUpdatedSpy = sinon.spy();

		oTable.getRowMode().setRowCount(3);
		oSelectionPlugin.setLimit(5);
		await oTable.qunit.rendered();

		oSelectionPlugin.attachSelectionChange(oSelectionChangeSpy);
		oTable.attachFirstVisibleRowChanged(oFirstVisibleRowChangedSpy);
		oTable.attachRowsUpdated(oRowsUpdatedSpy);

		await new Promise((resolve) => {
			oSelectionPlugin.attachEventOnce("selectionChange", (oEvent) => {
				assert.ok(fnGetContexts.calledOnceWithExactly(0, 1, 0, true), "getContexts was called once with the correct parameters");
				assert.deepEqual(oSelectionPlugin.getSelectedIndices(), [0], "First row is selected");
				assert.deepEqual(oEvent.getParameters().rowIndices, [0], "rowIndices parameter is correct");
				assert.notOk(oEvent.getParameters().limitReached, "limitReached parameter is correct");
				resolve();
			});
			fnGetContexts.resetHistory();
			oSelectionChangeSpy.resetHistory();
			oFirstVisibleRowChangedSpy.resetHistory();
			oRowsUpdatedSpy.resetHistory();
			oSelectionPlugin.addSelectionInterval(0, 0);
		});

		oSelectionPlugin.attachEventOnce("selectionChange", (oEvent) => {
			assert.deepEqual(oEvent.getParameters().rowIndices, [1, 2, 3, 4, 5], "rowIndices parameter is correct");
			assert.ok(oEvent.getParameters().limitReached, "limitReached parameter is correct");
			assert.ok(fnGetContexts.calledOnceWithExactly(1, 6, 0, true), "getContexts was called once with the correct parameters");
		});
		fnGetContexts.resetHistory();
		oSelectionChangeSpy.resetHistory();
		oFirstVisibleRowChangedSpy.resetHistory();
		oRowsUpdatedSpy.resetHistory();
		await oSelectionPlugin.addSelectionInterval(0, 10);
		assert.deepEqual(oSelectionPlugin.getSelectedIndices(), [0, 1, 2, 3, 4, 5],
			"Selection is cut down to the possible limit. The first index was already selected, 5 new indices are added to the selection.");
		assert.equal(oTable.getFirstVisibleRow(), 4, "The firstVisibleRow is correct");
		assert.ok(oSelectionChangeSpy.calledOnce, "The \"selectionChange\" event was fired once");
		assert.ok(oFirstVisibleRowChangedSpy.calledOnce, "The \"firstVisibleRowChanged\" event was fired");
		assert.ok(oRowsUpdatedSpy.calledOnce, "The \"rowsUpdated\" event was fired");

		oSelectionPlugin.setEnableNotification(true);
		oSelectionPlugin.attachEventOnce("selectionChange", (oEvent) => {
			assert.deepEqual(oEvent.getParameters().rowIndices, [6, 7, 8, 9, 10], "rowIndices parameter is correct");
			assert.ok(oEvent.getParameters().limitReached, "limitReached parameter is correct");
			assert.ok(fnGetContexts.calledOnceWithExactly(6, 6, 0, true), "getContexts was called once with the correct parameters");
		});
		fnGetContexts.resetHistory();
		oSelectionChangeSpy.resetHistory();
		oFirstVisibleRowChangedSpy.resetHistory();
		oRowsUpdatedSpy.resetHistory();
		await oSelectionPlugin.addSelectionInterval(6, 15);
		assert.deepEqual(oSelectionPlugin.getSelectedIndices(), [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
			"Selection is cut down to the possible limit. The first index was already selected, 5 new indices are added to the selection.");
		assert.equal(oTable.getFirstVisibleRow(), 9, "The firstVisibleRow is correct");
		assert.ok(oSelectionChangeSpy.calledOnce, "The \"selectionChange\" event was fired once");
		assert.ok(oFirstVisibleRowChangedSpy.calledOnce, "The \"firstVisibleRowChanged\" event was fired");
		assert.ok(oRowsUpdatedSpy.calledOnce, "The \"rowsUpdated\" event was fired");
	});

	QUnit.test("Reverse selection using addSelectionInterval: Number of items in range above limit", async function(assert) {
		const oSelectionPlugin = this.oTable._getSelectionPlugin();
		const fnGetContexts = sinon.spy(this.oTable.getBinding(), "getContexts");

		oSelectionPlugin.setLimit(5);

		const nextSelectionChange = TableQUnitUtils.nextEvent("selectionChange", oSelectionPlugin);
		oSelectionPlugin.addSelectionInterval(9, 0);
		const oEvent = await nextSelectionChange;

		assert.ok(fnGetContexts.calledOnceWithExactly(4, 6, 0, true),
			"getContexts was called once with the correct parameters"); // the table will scroll one extra row
		assert.deepEqual(oEvent.getParameters().rowIndices, [5, 6, 7, 8, 9], "rowIndices parameter is correct");
		assert.ok(oEvent.getParameters().limitReached, "limitReached parameter is correct");
		assert.deepEqual(oSelectionPlugin.getSelectedIndices(), [5, 6, 7, 8, 9],
			"Selection is cut down to the possible limit.");
	});

	QUnit.test("Selection using setSelectionInterval: Selection not possible", async function(assert) {
		const oSelectionPlugin = this.oTable._getSelectionPlugin();
		const fnGetContexts = sinon.spy(this.oTable.getBinding(), "getContexts");
		const oSelectionChangeSpy = sinon.spy();
		const iHighestSelectableIndex = oSelectionPlugin._getHighestSelectableIndex();

		oSelectionPlugin.attachSelectionChange(oSelectionChangeSpy);

		try {
			await oSelectionPlugin.setSelectionInterval(-1, -2);
			assert.ok(false, "The promise should have been rejected because the indices are out of range");
		} catch (oError) {
			assert.deepEqual(oError.toString(), "Error: Out of range", "Promise rejected with Error: Out of range");
			assert.ok(fnGetContexts.notCalled, "getContexts was not called");
			assert.equal(oSelectionPlugin.getSelectedCount(), 0, "No items are selected");
			assert.ok(oSelectionChangeSpy.notCalled, "The \"selectionChange\" event was not fired");
		}

		sinon.stub(oSelectionPlugin, "_getHighestSelectableIndex").returns(-1);
		fnGetContexts.resetHistory();
		oSelectionChangeSpy.resetHistory();
		try {
			await oSelectionPlugin.setSelectionInterval(0, 0);
			assert.ok(false, "The promise should have been rejected because the indices are out of range");
		} catch (oError) {
			assert.equal(oError.toString(), "Error: Out of range", "Promise rejected with Error: Out of range");
			assert.ok(fnGetContexts.notCalled, "getContexts was not called");
			assert.equal(oSelectionPlugin.getSelectedCount(), 0, "No items are selected");
			assert.ok(oSelectionChangeSpy.notCalled, "The \"selectionChange\" event was not fired");
			oSelectionPlugin._getHighestSelectableIndex.restore();
		}

		fnGetContexts.resetHistory();
		oSelectionChangeSpy.resetHistory();
		try {
			await oSelectionPlugin.setSelectionInterval(iHighestSelectableIndex + 1, iHighestSelectableIndex + 1);
			assert.ok(false, "The promise should have been rejected because the indices are out of range");
		} catch (oError) {
			assert.equal(oError.toString(), "Error: Out of range", "Promise rejected with Error: Out of range");
			assert.ok(fnGetContexts.notCalled, "getContexts was not called");
			assert.equal(oSelectionPlugin.getSelectedCount(), 0, "No items are selected");
			assert.ok(oSelectionChangeSpy.notCalled, "The \"selectionChange\" event was not fired");
		}

		oSelectionPlugin.setSelectionMode(SelectionMode.None);
		fnGetContexts.resetHistory();
		oSelectionChangeSpy.resetHistory();
		oSelectionPlugin.setSelectionInterval(6, 7).then(() => {
			assert.ok(false, "The promise should have been rejected because the selection mode is \"None\"");
		}).catch((oError) => {
			assert.equal(oError.toString(), "Error: SelectionMode is 'None'", "Promise rejected with Error: SelectionMode is 'None'");
			assert.ok(fnGetContexts.notCalled, "getContexts was not called");
			assert.equal(oSelectionPlugin.getSelectedCount(), 0, "No items are selected");
			assert.ok(oSelectionChangeSpy.notCalled, "The \"selectionChange\" event was not fired");
		});

		oSelectionPlugin.setEnabled(false);
		fnGetContexts.resetHistory();
		oSelectionChangeSpy.resetHistory();
		oSelectionPlugin.setSelectionInterval(6, 7).then(() => {
			assert.ok(false, "The promise should have been rejected because the plugin is disabled");
		}).catch((oError) => {
			assert.equal(oError.toString(), "Error: Plugin is disabled", "Promise rejected with Error: Plugin is disabled");
			assert.ok(fnGetContexts.notCalled, "getContexts was not called");
			assert.equal(oSelectionPlugin.getSelectedCount(), 0, "No items are selected");
			assert.ok(oSelectionChangeSpy.notCalled, "The \"selectionChange\" event was not fired");
		});
	});

	QUnit.test("Selection using setSelectionInterval", async function(assert) {
		const oSelectionPlugin = this.oTable._getSelectionPlugin();
		const fnGetContexts = sinon.spy(this.oTable.getBinding(), "getContexts");
		const oSelectionChangeSpy = sinon.spy();
		const iSelectableCount = oSelectionPlugin.getSelectableCount();

		oSelectionPlugin.setLimit(5);
		oSelectionPlugin.attachSelectionChange(oSelectionChangeSpy);
		oSelectionPlugin.attachEventOnce("selectionChange", (oEvent) => {
			assert.deepEqual(oEvent.getParameters().rowIndices, [0, 1, 2, 3, 4], "selectionChange event: \"rowIndices\" parameter is correct");
			assert.ok(oEvent.getParameters().limitReached, "selectionChange event: \"limitReached\" parameter is correct");
		});
		fnGetContexts.resetHistory();
		oSelectionChangeSpy.resetHistory();

		await oSelectionPlugin.setSelectionInterval(-1, 10);
		assert.ok(fnGetContexts.calledOnceWithExactly(0, 6, 0, true), "getContexts was called once with the correct parameters");
		assert.deepEqual(oSelectionPlugin.getSelectedIndices(), [0, 1, 2, 3, 4], "Selection is cut down to the possible limit");
		assert.ok(oSelectionChangeSpy.calledOnce, "The \"selectionChange\" event was fired once");

		oSelectionPlugin.attachEventOnce("selectionChange", (oEvent) => {
			assert.deepEqual(oEvent.getParameters().rowIndices, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
				"selectionChange event: \"rowIndices\" parameter is correct");
			assert.ok(oEvent.getParameters().limitReached, "selectionChange event: \"limitReached\" parameter is correct");
		});
		fnGetContexts.resetHistory();
		oSelectionChangeSpy.resetHistory();
		await oSelectionPlugin.setSelectionInterval(5, 15);
		assert.ok(fnGetContexts.calledOnceWithExactly(5, 6, 0, true), "getContexts was called once with the correct parameters");
		assert.deepEqual(oSelectionPlugin.getSelectedIndices(), [5, 6, 7, 8, 9], "Selection is cut down to the possible limit");
		assert.ok(oSelectionChangeSpy.calledOnce, "The \"selectionChange\" event was fired once");

		fnGetContexts.resetHistory();
		oSelectionChangeSpy.resetHistory();
		oSelectionPlugin.setSelectionInterval(5, 10); // Limit reached
		await TableQUnitUtils.sleep(100);

		assert.ok(fnGetContexts.calledOnceWithExactly(5, 6, 0, true), "getContexts was called once with the correct parameters");
		assert.deepEqual(oSelectionPlugin.getSelectedIndices(), [5, 6, 7, 8, 9], "The selection did not change");
		assert.ok(oSelectionChangeSpy.notCalled, "The selectionChange event was not fired");

		fnGetContexts.resetHistory();
		oSelectionChangeSpy.resetHistory();
		oSelectionPlugin.setSelectionInterval(5, 9); // Limit not reached
		await TableQUnitUtils.sleep(100);

		assert.ok(fnGetContexts.calledOnceWithExactly(5, 5, 0, true), "getContexts was called once with the correct parameters");
		assert.deepEqual(oSelectionPlugin.getSelectedIndices(), [5, 6, 7, 8, 9], "The selection did not change");
		assert.ok(oSelectionChangeSpy.notCalled, "The selectionChange event was not fired");

		oSelectionPlugin.attachEventOnce("selectionChange", (oEvent) => {
			assert.deepEqual(oEvent.getParameters().rowIndices, [5, 6, 7, 8, 9, iSelectableCount - 1],
				"selectionChange event: \"rowIndices\" parameter is correct");
			assert.notOk(oEvent.getParameters().limitReached, "selectionChange event: \"limitReached\" parameter is correct");
		});
		fnGetContexts.resetHistory();
		oSelectionChangeSpy.resetHistory();
		await oSelectionPlugin.setSelectionInterval(iSelectableCount - 1, iSelectableCount + 100);
		assert.ok(fnGetContexts.calledOnceWithExactly(iSelectableCount - 1, 1, 0, true),
			"getContexts was called once with the correct parameters");
		assert.deepEqual(oSelectionPlugin.getSelectedIndices(), [iSelectableCount - 1], "The correct index is selected");
		assert.ok(oSelectionChangeSpy.calledOnce, "The \"selectionChange\" event was fired once");

		try {
			await oSelectionPlugin.setSelectionInterval(-1, -1);
		} catch {
			assert.deepEqual(oSelectionPlugin.getSelectedIndices(), [iSelectableCount - 1], "The selection did not change");
		}
	});

	QUnit.test("Selection using setSelectedIndex: Selection not possible", async function(assert) {
		const oSelectionPlugin = this.oTable._getSelectionPlugin();
		const fnGetContexts = sinon.spy(this.oTable.getBinding(), "getContexts");
		const oSelectionChangeSpy = sinon.spy();
		const iHighestSelectableIndex = oSelectionPlugin._getHighestSelectableIndex();

		oSelectionPlugin.attachSelectionChange(oSelectionChangeSpy);

		try {
			await oSelectionPlugin.setSelectedIndex(-1);
			assert.ok(false, "The promise should have been rejected because the indices are out of range");
		} catch (oError) {
			assert.deepEqual(oError.toString(), "Error: Out of range", "Promise rejected with Error: Out of range");
			assert.ok(fnGetContexts.notCalled, "getContexts was not called");
			assert.equal(oSelectionPlugin.getSelectedCount(), 0, "No items are selected");
			assert.ok(oSelectionChangeSpy.notCalled, "The \"selectionChange\" event was not fired");
		}

		sinon.stub(oSelectionPlugin, "_getHighestSelectableIndex").returns(-1);
		fnGetContexts.resetHistory();
		oSelectionChangeSpy.resetHistory();
		try {
			await oSelectionPlugin.setSelectedIndex(0);
			assert.ok(false, "The promise should have been rejected because the indices are out of range");
		} catch (oError) {
			assert.equal(oError.toString(), "Error: Out of range", "Promise rejected with Error: Out of range");
			assert.ok(fnGetContexts.notCalled, "getContexts was not called");
			assert.equal(oSelectionPlugin.getSelectedCount(), 0, "No items are selected");
			assert.ok(oSelectionChangeSpy.notCalled, "The \"selectionChange\" event was not fired");
			oSelectionPlugin._getHighestSelectableIndex.restore();
		}

		fnGetContexts.resetHistory();
		oSelectionChangeSpy.resetHistory();
		try {
			await oSelectionPlugin.setSelectedIndex(iHighestSelectableIndex + 1);
			assert.ok(false, "The promise should have been rejected because the indices are out of range");
		} catch (oError) {
			assert.equal(oError.toString(), "Error: Out of range", "Promise rejected with Error: Out of range");
			assert.ok(fnGetContexts.notCalled, "getContexts was not called");
			assert.equal(oSelectionPlugin.getSelectedCount(), 0, "No items are selected");
			assert.ok(oSelectionChangeSpy.notCalled, "The \"selectionChange\" event was not fired");
		}

		oSelectionPlugin.setSelectionMode(SelectionMode.None);
		fnGetContexts.resetHistory();
		oSelectionChangeSpy.resetHistory();
		oSelectionPlugin.setSelectedIndex(1).then(() => {
			assert.ok(false, "The promise should have been rejected because the selection mode is \"None\"");
		}).catch((oError) => {
			assert.equal(oError.toString(), "Error: SelectionMode is 'None'", "Promise rejected with Error: SelectionMode is 'None'");
			assert.ok(fnGetContexts.notCalled, "getContexts was not called");
			assert.equal(oSelectionPlugin.getSelectedCount(), 0, "No items are selected");
			assert.ok(oSelectionChangeSpy.notCalled, "The \"selectionChange\" event was not fired");
		});

		oSelectionPlugin.setEnabled(false);
		fnGetContexts.resetHistory();
		oSelectionChangeSpy.resetHistory();
		oSelectionPlugin.setSelectedIndex(1).then(() => {
			assert.ok(false, "The promise should have been rejected because the plugin is disabled");
		}).catch((oError) => {
			assert.equal(oError.toString(), "Error: Plugin is disabled", "Promise rejected with Error: Plugin is disabled");
			assert.ok(fnGetContexts.notCalled, "getContexts was not called");
			assert.equal(oSelectionPlugin.getSelectedCount(), 0, "No items are selected");
			assert.ok(oSelectionChangeSpy.notCalled, "The \"selectionChange\" event was not fired");
		});
	});

	QUnit.test("Selection using setSelectedIndex", async function(assert) {
		const oSelectionPlugin = this.oTable._getSelectionPlugin();
		const fnGetContexts = sinon.spy(this.oTable.getBinding(), "getContexts");
		const oSelectionChangeSpy = sinon.spy();

		oSelectionPlugin.setLimit(5);
		oSelectionPlugin.attachSelectionChange(oSelectionChangeSpy);

		oSelectionPlugin.attachEventOnce("selectionChange", (oEvent) => {
			assert.deepEqual(oEvent.getParameters().rowIndices, [3], "selectionChange event: \"rowIndices\" parameter is correct");
			assert.notOk(oEvent.getParameters().limitReached, "selectionChange event: \"limitReached\" parameter is correct");
		});
		await oSelectionPlugin.setSelectedIndex(3);
		assert.ok(fnGetContexts.calledOnceWithExactly(3, 1, 0, true), "getContexts was called once with the correct parameters");
		assert.deepEqual(oSelectionPlugin.getSelectedIndices(), [3], "The selection is correct");
		assert.ok(oSelectionChangeSpy.calledOnce, "The \"selectionChange\" event was fired once");

		oSelectionPlugin.attachEventOnce("selectionChange", (oEvent) => {
			assert.deepEqual(oEvent.getParameters().rowIndices, [3, 5], "selectionChange event: \"rowIndices\" parameter is correct");
			assert.notOk(oEvent.getParameters().limitReached, "selectionChange event: \"limitReached\" parameter is correct");
		});
		fnGetContexts.resetHistory();
		oSelectionChangeSpy.resetHistory();
		await oSelectionPlugin.setSelectedIndex(5);
		assert.ok(fnGetContexts.calledOnceWithExactly(5, 1, 0, true), "getContexts was called once with the correct parameters");
		assert.deepEqual(oSelectionPlugin.getSelectedIndices(), [5], "The selection is correct");
		assert.ok(oSelectionChangeSpy.calledOnce, "The \"selectionChange\" event was fired once");

		try {
			await oSelectionPlugin.setSelectedIndex(-1);
		} catch {
			assert.deepEqual(oSelectionPlugin.getSelectedIndices(), [5], "The selection did not change");
		}
	});

	QUnit.test("selectionChange event: custom payload", async function(assert) {
		const oTable = this.oTable;
		const oSelectionPlugin = oTable._getSelectionPlugin();

		oSelectionPlugin.setLimit(0);

		await oSelectionPlugin.setSelectionInterval(0, 1);
		const aPromises = [];

		oSelectionPlugin.attachSelectionChange((oEvent) => {
			const oCustomPayload = oEvent.getParameter("customPayload");
			assert.step(oCustomPayload ? oCustomPayload.d : "" + oCustomPayload);
		});

		aPromises.push(oSelectionPlugin.addSelectionInterval(0, 0, {d: "addSelectionInterval"}));
		oSelectionPlugin.removeSelectionInterval(0, 0, {d: "removeSelectionInterval"});
		aPromises.push(oSelectionPlugin.setSelectionInterval(0, 2, {d: "setSelectionInterval"}));
		aPromises.push(oSelectionPlugin.setSelectionInterval(3, 3, "not an object"));
		oSelectionPlugin.clearSelection({d: "clearSelection"});
		aPromises.push(oSelectionPlugin.setSelectedIndex(4, {d: "setSelectedIndex"}));
		aPromises.push(oSelectionPlugin.selectAll({d: "selectAll"}));

		await Promise.all(aPromises);
		assert.verifySteps([
			"removeSelectionInterval",
			"clearSelection",
			"addSelectionInterval",
			"setSelectionInterval",
			"null", // not an object
			"setSelectedIndex",
			"selectAll"
		], "The custom event payload is correctly transported to the event listener");
	});

	QUnit.test("Mouse interaction", async function(assert) {
		const oTable = this.oTable;
		const oSelectionPlugin = oTable._getSelectionPlugin();

		function doSelection(fnSelect) {
			return Promise.race([
				new Promise((resolve) => {
					oSelectionPlugin.attachEventOnce("selectionChange", resolve);
					fnSelect();
				}),
				// Maximum wait time required if, for example, fnSelect does not trigger a selectionChange event.
				TableQUnitUtils.sleep(10)
			]);
		}

		function pressHeaderSelector() {
			return doSelection(() => {
				oSelectionPlugin.handleHeaderSelectorPress();
			});
		}

		await pressHeaderSelector();
		assert.equal(oSelectionPlugin.getSelectedIndices().length, 16,
			"Limit enabled: Pressing the HeaderSelector triggers select all and selects until its limit is reached");

		await doSelection(() => {
			oSelectionPlugin.addSelectionInterval(0, 5);
		});
		await pressHeaderSelector();
		assert.equal(oSelectionPlugin.getSelectedIndices().length, 0,
			"Limit enabled: Pressing the HeaderSelector deselects everything if something is selected");

		oSelectionPlugin.setLimit(0);

		await pressHeaderSelector();
		assert.equal(oSelectionPlugin.getSelectedIndices().length, oTable.getBinding().getLength(),
			"Limit disabled: Pressing the HeaderSelector selects everything if not everything is selected");
		await pressHeaderSelector();
		assert.equal(oSelectionPlugin.getSelectedIndices().length, 0,
			"Limit disabled: Pressing the HeaderSelector deselects everything if everything is selected");

		oSelectionPlugin.setShowHeaderSelector(false);

		await doSelection(() => {
			oSelectionPlugin.addSelectionInterval(0, 5);
		});
		await pressHeaderSelector();
		assert.deepEqual(oSelectionPlugin.getSelectedIndices(), [0, 1, 2, 3, 4, 5],
			"Limit disabled, HeaderSelector hidden: Pressing the HeaderSelector does not change the selection");

		oSelectionPlugin.setLimit(200);

		await pressHeaderSelector();
		assert.deepEqual(oSelectionPlugin.getSelectedIndices(), [0, 1, 2, 3, 4, 5],
			"Limit enabled, HeaderSelector hidden: Pressing the HeaderSelector does not change the selection");
	});

	QUnit.test("Keyboard interaction", async function(assert) {
		const oTable = this.oTable;
		const oSelectionPlugin = oTable._getSelectionPlugin();

		function doSelection(fnSelect) {
			return Promise.race([
				new Promise((resolve) => {
					oSelectionPlugin.attachEventOnce("selectionChange", resolve);
					fnSelect();
				}),
				// Maximum wait time required if, for example, fnSelect does not trigger a selectionChange event.
				TableQUnitUtils.sleep(10)
			]);
		}

		function pressKeyboardShortcut(sType) {
			return doSelection(() => {
				oSelectionPlugin.handleKeyboardShortcut(sType, {setMarked: () => { }});
			});
		}

		await doSelection(() => {
			oSelectionPlugin.addSelectionInterval(0, 5);
			oSelectionPlugin.setLimit(7);
		});
		await pressKeyboardShortcut("toggle");
		assert.deepEqual(oSelectionPlugin.getSelectedIndices(), [0, 1, 2, 3, 4, 5, 6, 7],
			"Limit enabled: The \"toggle\" shortcut selects untill the limit is reached");

		await pressKeyboardShortcut("clear");
		assert.equal(oSelectionPlugin.getSelectedIndices().length, 0,
			"Limit enabled: The \"clear\" shortcut deselects everything");
		await pressKeyboardShortcut("clear");
		assert.equal(oSelectionPlugin.getSelectedIndices().length, 0,
			"Limit enabled: The \"clear\" shortcut does not change the selection if nothing is selected");

		oSelectionPlugin.setLimit(0);

		await pressKeyboardShortcut("toggle");
		assert.equal(oSelectionPlugin.getSelectedIndices().length, oTable.getBinding().getLength(),
			"Limit disabled: The \"toggle\" shortcut selects everything if not everything is selected");
		await pressKeyboardShortcut("toggle");
		assert.equal(oSelectionPlugin.getSelectedIndices().length, 0,
			"Limit disabled: The \"toggle\" shortcut deselects everything if everything is selected");

		await doSelection(() => {
			oSelectionPlugin.addSelectionInterval(0, 5);
		});
		await pressKeyboardShortcut("clear");
		assert.equal(oSelectionPlugin.getSelectedIndices().length, 0,
			"Limit disabled: The \"clear\" shortcut deselects everything");
		await pressKeyboardShortcut("clear");
		assert.equal(oSelectionPlugin.getSelectedIndices().length, 0,
			"Limit disabled: The \"clear\" shortcut does not change the selection if nothing is selected");
	});

	QUnit.test("Selection using SelectAll: Selection not possible", async function(assert) {
		const oSelectionPlugin = this.oTable._getSelectionPlugin();
		const fnGetContexts = sinon.spy(this.oTable.getBinding(), "getContexts");
		const oSelectionChangeSpy = sinon.spy();

		oSelectionPlugin.attachSelectionChange(oSelectionChangeSpy);
		sinon.stub(oSelectionPlugin, "getSelectableCount").returns(0);

		try {
			await oSelectionPlugin.selectAll();
			assert.ok(false, "The promise should have been rejected because the limit is enabled");
		} catch (oError) {
			assert.deepEqual(oError.toString(), "Error: Not possible if the limit is enabled",
				"Promise rejected with Error: Not possible if the limit is enabled");
			assert.ok(fnGetContexts.notCalled, "getContexts was not called");
			assert.equal(oSelectionPlugin.getSelectedCount(), 0, "No items are selected");
			assert.ok(oSelectionChangeSpy.notCalled, "The \"selectionChange\" event was not fired");
		}

		oSelectionPlugin.setLimit(0);
		fnGetContexts.resetHistory();
		oSelectionChangeSpy.resetHistory();
		try {
			await oSelectionPlugin.selectAll();
			assert.ok(false, "The promise should have been rejected because there is nothing to select");
		} catch (oError) {
			assert.equal(oError.toString(), "Error: Nothing to select", "Promise rejected with Error: Nothing to select");
			assert.ok(fnGetContexts.notCalled, "getContexts was not called");
			assert.equal(oSelectionPlugin.getSelectedCount(), 0, "No items are selected");
			assert.ok(oSelectionChangeSpy.notCalled, "The \"selectionChange\" event was not fired");
			oSelectionPlugin.getSelectableCount.restore();
		}

		oSelectionPlugin.setSelectionMode(SelectionMode.None);
		fnGetContexts.resetHistory();
		oSelectionChangeSpy.resetHistory();
		oSelectionPlugin.selectAll().then(() => {
			assert.ok(false, "The promise should have been rejected because the selection mode is \"None\"");
		}).catch((oError) => {
			assert.equal(oError.toString(), "Error: SelectionMode is 'None'", "Promise rejected with Error: SelectionMode is 'None'");
			assert.ok(fnGetContexts.notCalled, "getContexts was not called");
			assert.equal(oSelectionPlugin.getSelectedCount(), 0, "No items are selected");
			assert.ok(oSelectionChangeSpy.notCalled, "The \"selectionChange\" event was not fired");
		});

		oSelectionPlugin.setEnabled(false);
		fnGetContexts.resetHistory();
		oSelectionChangeSpy.resetHistory();
		oSelectionPlugin.selectAll().then(() => {
			assert.ok(false, "The promise should have been rejected because the plugin is disabled");
		}).catch((oError) => {
			assert.equal(oError.toString(), "Error: Plugin is disabled", "Promise rejected with Error: Plugin is disabled");
			assert.ok(fnGetContexts.notCalled, "getContexts was not called");
			assert.equal(oSelectionPlugin.getSelectedCount(), 0, "No items are selected");
			assert.ok(oSelectionChangeSpy.notCalled, "The \"selectionChange\" event was not fired");
		});
	});

	QUnit.test("Select All", async function(assert) {
		const oTable = this.oTable;
		const oSelectionPlugin = oTable._getSelectionPlugin();
		const fnGetContexts = sinon.spy(oTable.getBinding(), "getContexts");
		const oSelectionChangeSpy = sinon.spy();
		const iHighestSelectableIndex = oSelectionPlugin._getHighestSelectableIndex();
		const oHeaderSelector = oTable._getHeaderSelector();

		assert.equal(oHeaderSelector.getType(), "Icon", "The headerSelector type is icon");

		oSelectionPlugin.setLimit(0);
		oSelectionPlugin.attachSelectionChange(oSelectionChangeSpy);
		await oTable.qunit.rendered();

		assert.equal(oHeaderSelector.getType(), "CheckBox", "The headerSelector type is checkbox");

		fnGetContexts.resetHistory();
		oSelectionPlugin.attachEventOnce("selectionChange", (oEvent) => {
			assert.deepEqual(oEvent.getParameters().rowIndices, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
				"selectionChange event: \"rowIndices\" parameter is correct");
			assert.notOk(oEvent.getParameters().limitReached, "selectionChange event: \"limitReached\" parameter is correct");
		});
		await oSelectionPlugin.selectAll();
		assert.ok(fnGetContexts.calledOnceWithExactly(0, iHighestSelectableIndex + 1, 0, true),
			"getContexts was called once with the correct parameters");
		assert.deepEqual(oSelectionPlugin.getSelectedIndices().length, iHighestSelectableIndex + 1, "The correct indices are selected");
		assert.ok(oSelectionChangeSpy.calledOnce, "The \"selectionChange\" event was fired once");

		const oSelectionSpy = sinon.spy(oSelectionPlugin, "addSelectionInterval");

		sinon.stub(oSelectionPlugin, "_getHighestSelectableIndex").returns(15);
		sinon.stub(oSelectionPlugin, "getSelectableCount").returns(10);

		oSelectionPlugin.clearSelection();
		await oSelectionPlugin.selectAll();
		assert.ok(oSelectionSpy.calledOnceWithExactly(0, iHighestSelectableIndex, undefined),
			"addSelectionInterval was called once with the correct parameters");

		oSelectionPlugin.setLimit(5);
		try {
			await oSelectionPlugin.selectAll();
		} catch {
			assert.deepEqual(oSelectionPlugin.getSelectedIndices().length, iHighestSelectableIndex + 1, "The selection did not change");
		}
	});

	QUnit.test("Select All when count is not available and context length is lower than the limit", async function(assert) {
		const oTable = this.oTable;
		const oSelectionPlugin = oTable._getSelectionPlugin();
		const oHeaderSelector = oTable._getHeaderSelector();

		const oSelectionChangeSpy = sinon.spy();
		oSelectionPlugin.attachSelectionChange(oSelectionChangeSpy);

		await oTable.qunit.rendered();
		assert.equal(oHeaderSelector.getType(), "Icon", "The headerSelector type is correct");

		sinon.stub(oSelectionPlugin, "_getHighestSelectableIndex").returns(250); // simulate count is not available

		await new Promise((resolve) => {
			oSelectionPlugin.attachEventOnce("selectionChange", resolve);
			oSelectionPlugin.handleHeaderSelectorPress();
		});

		assert.ok(oSelectionChangeSpy.calledOnce, "The \"selectionChange\" event was fired once");
		assert.deepEqual(oSelectionChangeSpy.getCall(0).args[0].getParameter("rowIndices"), [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
			"The \"rowIndices\" parameter is correct");
		assert.equal(oSelectionChangeSpy.getCall(0).args[0].getParameter("limitReached"), false, "The \"limitReached\" parameter is correct");
		assert.equal(oTable.getFirstVisibleRow(), 0, "The table is not scrolled because the limit is not reached");
	});

	QUnit.test("Scroll position", async function(assert) {
		const oSelectionPlugin = this.oTable._getSelectionPlugin();
		const oSelectionSpy = sinon.spy(oSelectionPlugin, "addSelectionInterval");
		let $Cell;
		const that = this;

		this.oTable.getRowMode().setRowCount(3);
		oSelectionPlugin.setLimit(5);
		await this.oTable.qunit.rendered();
		await TableQUnitUtils.sleep(100);

		const nextSelectionChange = TableQUnitUtils.nextEvent("selectionChange", oSelectionPlugin);

		$Cell = that.oTable.$("rowsel0");
		qutils.triggerEvent("tap", $Cell);
		await nextSelectionChange;

		const nextRowsUpdated = TableQUnitUtils.nextEvent("rowsUpdated", that.oTable);

		that.oTable.setFirstVisibleRow(7);
		$Cell = that.oTable.$("rowsel1");
		qutils.triggerEvent("tap", $Cell, {shiftKey: true});
		await nextRowsUpdated;

		assert.equal(oSelectionSpy.callCount, 2, "The selection was added and then the table was scrolled");
		assert.equal(that.oTable.getFirstVisibleRow(), 4, "Table is scrolled at the correct position");

		that.oTable.getRowMode().setRowCount(10);
		const oScrollSpy = sinon.spy(that.oTable, "setFirstVisibleRow");
		oSelectionPlugin.setSelectionInterval(5, 10);
		await TableQUnitUtils.sleep(100);

		assert.ok(oScrollSpy.notCalled, "The table is not scrolled because the last selected row is already visible");
	});

	QUnit.test("Scroll position (reverse range selection)", async function(assert) {
		const oSelectionPlugin = this.oTable._getSelectionPlugin();
		const oSelectionSpy = sinon.spy(oSelectionPlugin, "addSelectionInterval");
		let $Cell;
		const that = this;

		this.oTable.getRowMode().setRowCount(3);
		oSelectionPlugin.setLimit(5);
		await this.oTable.qunit.rendered();
		await TableQUnitUtils.sleep(100);

		that.oTable.setFirstVisibleRow(7);

		const nextSelectionChange = TableQUnitUtils.nextEvent("selectionChange", oSelectionPlugin);

		$Cell = that.oTable.$("rowsel2");
		qutils.triggerEvent("tap", $Cell);
		await nextSelectionChange;

		const nextRowsUpdated = TableQUnitUtils.nextEvent("rowsUpdated", that.oTable);

		that.oTable.setFirstVisibleRow(0);
		$Cell = that.oTable.$("rowsel0");
		qutils.triggerEvent("tap", $Cell, {shiftKey: true});
		await nextRowsUpdated;

		assert.ok(oSelectionSpy.calledTwice, "The selection was added and then the table was scrolled");
		assert.equal(that.oTable.getFirstVisibleRow(), 3, "Table is scrolled at the correct position");

		that.oTable.getRowMode().setRowCount(10);
		const oScrollSpy = sinon.spy(that.oTable, "setFirstVisibleRow");
		oSelectionPlugin.setSelectionInterval(10, 5);
		await TableQUnitUtils.sleep(100);

		assert.ok(oScrollSpy.notCalled, "The table is not scrolled because the last selected row is already visible");
	});

	QUnit.test("Selection (selectionMode = Single)", async function(assert) {
		const oSelectionPlugin = this.oTable._getSelectionPlugin();

		oSelectionPlugin.setSelectionMode(SelectionMode.Single);
		await this.oTable.qunit.rendered();

		const oCell = this.oTable.getDomRef("selall");
		const fnGetContexts = sinon.spy(this.oTable.getBinding(), "getContexts");

		assert.ok(!oCell.hasAttribute("role"), "DeselectAll role is not set");
		assert.ok(!oCell.hasAttribute("title"), "DeselectAll title is not set");
		assert.ok(!oCell.hasChildNodes(), "No DeselectAll icon");

		let nextSelectionChange = TableQUnitUtils.nextEvent("selectionChange", oSelectionPlugin);
		oSelectionPlugin.addSelectionInterval(0, 9);
		await nextSelectionChange;

		assert.ok(fnGetContexts.calledOnceWithExactly(9, 1, 0, true), "getContexts was called once with the correct parameters");
		assert.deepEqual(oSelectionPlugin.getSelectedIndices(), [9], "Only one item is selected (iIndexTo)");

		nextSelectionChange = TableQUnitUtils.nextEvent("selectionChange", oSelectionPlugin);
		fnGetContexts.resetHistory();
		oSelectionPlugin.setSelectionInterval(0, 4);
		await nextSelectionChange;

		assert.ok(fnGetContexts.calledOnceWithExactly(4, 1, 0, true), "getContexts was called once with the correct parameters");
		assert.deepEqual(oSelectionPlugin.getSelectedIndices(), [4], "Only one item is selected (iIndexTo)");

		qutils.triggerEvent("click", oCell);
		assert.equal(oSelectionPlugin.getSelectedCount(), 1, "the selection is not cleared");
	});

	QUnit.test("Selection (selectionMode = None)", async function(assert) {
		const oSelectionPlugin = this.oTable._getSelectionPlugin();

		oSelectionPlugin.setSelectionMode(SelectionMode.None);
		await this.oTable.qunit.rendered();

		const oCell = this.oTable.getDomRef("selall");
		const fnGetContexts = sinon.spy(this.oTable.getBinding(), "getContexts");

		assert.ok(!oCell.hasAttribute("role"), "DeselectAll role is not set");
		assert.ok(!oCell.hasAttribute("title"), "DeselectAll title is not set");
		assert.ok(!oCell.hasChildNodes(), "No DeselectAll icon");

		oSelectionPlugin.addSelectionInterval(0, 9);
		oSelectionPlugin.setSelectionInterval(0, 9);
		oSelectionPlugin.setSelectedIndex(0);
		oSelectionPlugin.selectAll();

		assert.ok(fnGetContexts.notCalled, "getContexts is not called");
		assert.deepEqual(oSelectionPlugin.getSelectedCount(), 0, "Nothing is selected");
		await TableQUnitUtils.sleep(100);

		assert.ok(fnGetContexts.notCalled, "getContexts is not called");
		assert.deepEqual(oSelectionPlugin.getSelectedCount(), 0, "Nothing is selected");
	});

	QUnit.test("Limit notification", async function(assert) {
		const iLimit = 5;
		const oTable = this.oTable;
		const oSelectionPlugin = this.oTable._getSelectionPlugin();

		function resetSpies() {
			oPopoverOpenBySpy.resetHistory();
			oPopoverCloseSpy.resetHistory();
		}

		assert.notOk(oTable._oNotificationPopover, "Notification popover does not exist");

		oSelectionPlugin.setEnableNotification(true);

		// Ensures that the Popover control is loaded and initialized
		await TableUtils.showNotificationPopoverAtIndex(oTable, 0, oSelectionPlugin.getLimit());
		assert.ok(oTable._oNotificationPopover, "Notification popover was created");

		await new Promise((resolve) => {
			oTable._oNotificationPopover.attachEventOnce("afterClose", () => {
				resolve();
			});
			oTable._oNotificationPopover.close();
		});

		const oPopoverOpenBySpy = sinon.spy(oTable._oNotificationPopover, "openBy");
		const oPopoverCloseSpy = sinon.spy(oTable._oNotificationPopover, "close");

		oSelectionPlugin.setLimit(iLimit);
		oSelectionPlugin.setEnableNotification(false);
		await oSelectionPlugin.setSelectionInterval(0, iLimit);
		await TableQUnitUtils.sleep(200);
		assert.ok(oPopoverOpenBySpy.notCalled, "Popover.openBy is not called because enableNotification is false");
		resetSpies();

		oSelectionPlugin.setEnableNotification(true);
		await oSelectionPlugin.setSelectionInterval(0, iLimit - 1);
		await TableQUnitUtils.sleep(200);
		assert.ok(oPopoverOpenBySpy.notCalled, "Popover.openBy is not called because the limit is not reached");
		resetSpies();

		await new Promise((resolve) => {
			oTable._oNotificationPopover.attachEventOnce("afterOpen", resolve);
			oSelectionPlugin.setSelectionInterval(0, iLimit);
		});
		await new Promise((resolve) => {
			oTable._oNotificationPopover.attachEventOnce("afterClose", resolve);
			oTable.setFirstVisibleRow(oTable.getFirstVisibleRow() + 1);
		});
		assert.equal(oPopoverOpenBySpy.callCount, 1, "Popover.openBy is called once");
		assert.ok(oPopoverOpenBySpy.calledOnceWithExactly(oTable.getRows()[iLimit - 1].getDomRefs().rowSelector),
			"Popover.openBy is called once with the correct parameters");
		assert.ok(oPopoverCloseSpy.calledOnce, "Popover.close is called once");
		resetSpies();
	});

	QUnit.test("Header selection icon - limit 5", async function(assert) {
		const oSelectionPlugin = this.oTable._getSelectionPlugin();
		const oHeaderSelector = this.oTable._getHeaderSelector();

		oSelectionPlugin.setLimit(5);

		assert.strictEqual(oHeaderSelector.getIcon(), IconPool.getIconURI(TableUtils.ThemeParameters.checkboxIcon),
			"HeaderSelector icon is correct - checkboxIcon");

		let nextSelectionChange = TableQUnitUtils.nextEvent("selectionChange", oSelectionPlugin);
		oSelectionPlugin.addSelectionInterval(0, 4);
		await nextSelectionChange;

		assert.deepEqual(oSelectionPlugin.getSelectedIndices(), [0, 1, 2, 3, 4], "Row index [0, 1, 2, 3, 4] selected");
		assert.strictEqual(oHeaderSelector.getIcon(), IconPool.getIconURI(TableUtils.ThemeParameters.clearSelectionIcon),
			"HeaderSelector icon is correct - clearSelectionIcon");

		nextSelectionChange = TableQUnitUtils.nextEvent("selectionChange", oSelectionPlugin);
		oSelectionPlugin.addSelectionInterval(5, 9);
		await nextSelectionChange;

		assert.deepEqual(oSelectionPlugin.getSelectedIndices(), [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
			"Row index [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] selected");
		assert.strictEqual(oHeaderSelector.getIcon(), IconPool.getIconURI(TableUtils.ThemeParameters.clearSelectionIcon),
			"HeaderSelector icon is correct - clearSelectionIcon");

		nextSelectionChange = TableQUnitUtils.nextEvent("selectionChange", oSelectionPlugin);
		oSelectionPlugin.addSelectionInterval(10, 12);
		await nextSelectionChange;

		assert.deepEqual(oSelectionPlugin.getSelectedIndices(), [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
			"Row index [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] selected");
		assert.strictEqual(oHeaderSelector.getIcon(), IconPool.getIconURI(TableUtils.ThemeParameters.clearSelectionIcon),
			"HeaderSelector icon is correct - clearSelectionIcon");

		nextSelectionChange = TableQUnitUtils.nextEvent("selectionChange", oSelectionPlugin);
		oSelectionPlugin.addSelectionInterval(13, 15);
		await nextSelectionChange;

		assert.deepEqual(oSelectionPlugin.getSelectedIndices(), [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
			"Row index [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15] - all indexes selected");
		assert.strictEqual(oHeaderSelector.getIcon(), IconPool.getIconURI(TableUtils.ThemeParameters.allSelectedIcon),
			"HeaderSelector icon is correct - allSelectedIcon");

		nextSelectionChange = TableQUnitUtils.nextEvent("selectionChange", oSelectionPlugin);
		oSelectionPlugin.removeSelectionInterval(1, 15);
		await nextSelectionChange;

		assert.deepEqual(oSelectionPlugin.getSelectedIndices(), [0], "Row index 0 selected");
		assert.strictEqual(oHeaderSelector.getIcon(), IconPool.getIconURI(TableUtils.ThemeParameters.clearSelectionIcon),
			"HeaderSelector icon is correct - clearSelectionIcon");

		nextSelectionChange = TableQUnitUtils.nextEvent("selectionChange", oSelectionPlugin);
		oSelectionPlugin.removeSelectionInterval(0, 15);
		await nextSelectionChange;

		assert.deepEqual(oSelectionPlugin.getSelectedIndices(), [], "Nothing selected");
		assert.strictEqual(oHeaderSelector.getIcon(), IconPool.getIconURI(TableUtils.ThemeParameters.checkboxIcon),
			"HeaderSelector icon is correct - checkboxIcon");
	});

	QUnit.test("Header selection icon - limit deactivated", async function(assert) {
		const oSelectionPlugin = this.oTable._getSelectionPlugin();

		oSelectionPlugin.setLimit(0);
		await this.oTable.qunit.rendered();

		let nextSelectionChange = TableQUnitUtils.nextEvent("selectionChange", oSelectionPlugin);
		oSelectionPlugin.addSelectionInterval(0, 2);
		await nextSelectionChange;

		assert.deepEqual(oSelectionPlugin.getSelectedIndices(), [0, 1, 2], "Row index [0, 1, 2] selected");

		nextSelectionChange = TableQUnitUtils.nextEvent("selectionChange", oSelectionPlugin);
		oSelectionPlugin.addSelectionInterval(9, 4);
		await nextSelectionChange;

		assert.deepEqual(oSelectionPlugin.getSelectedIndices(), [0, 1, 2, 4, 5, 6, 7, 8, 9],
			"Row index [0, 1, 2, 4, 5, 6, 7, 8, 9] selected");

		nextSelectionChange = TableQUnitUtils.nextEvent("selectionChange", oSelectionPlugin);
		oSelectionPlugin.removeSelectionInterval(1, 9);
		await nextSelectionChange;

		assert.deepEqual(oSelectionPlugin.getSelectedIndices(), [0], "Row index [0] selected");

		nextSelectionChange = TableQUnitUtils.nextEvent("selectionChange", oSelectionPlugin);
		oSelectionPlugin.removeSelectionInterval(0, 9);
		await nextSelectionChange;

		assert.deepEqual(oSelectionPlugin.getSelectedIndices(), [], "Nothing selected");
	});

	QUnit.test("#handleKeyboardShortcut - Event Marking", async function(assert) {
		const sEventMarker = "sapUiTableClearAll";
		const oEvent = {
			setMarked: function() { }
		};
		const oSelectionPlugin = this.oTable._getSelectionPlugin();
		const oClearSelectionSpy = sinon.spy(oSelectionPlugin, "clearSelection");
		const oSelectAllSpy = sinon.spy(oSelectionPlugin, "selectAll");
		const oSetMarkedSpy = sinon.spy(oEvent, "setMarked");

		oSelectionPlugin.setLimit(0);
		await this.oTable.qunit.rendered();

		let nextSelectionChange = TableQUnitUtils.nextEvent("selectionChange", oSelectionPlugin);
		oSelectionPlugin.handleKeyboardShortcut("toggle", oEvent);
		await nextSelectionChange;

		assert.ok(oSelectAllSpy.calledOnce, "select all called");
		assert.ok(oSetMarkedSpy.notCalled, `Event has not been marked with ${sEventMarker}`);

		oSelectionPlugin.handleKeyboardShortcut("toggle", oEvent);
		assert.ok(oClearSelectionSpy.calledOnce, "clear all called");
		assert.ok(oSetMarkedSpy.calledOnceWithExactly(sEventMarker), `Event has been marked with ${sEventMarker}`);

		oSelectionPlugin.handleKeyboardShortcut("clear", oEvent);
		assert.ok(oClearSelectionSpy.calledTwice, "Selection is cleared");
		assert.ok(oSetMarkedSpy.calledTwice, `Event marked twice`);
		assert.ok(oSetMarkedSpy.calledWithExactly(sEventMarker), `Event has been marked with ${sEventMarker}`);

		oSetMarkedSpy.reset();
		oSelectionPlugin.handleKeyboardShortcut("toggle", oEvent);
		await TableQUnitUtils.nextEvent("selectionChange", oSelectionPlugin);

		assert.ok(oSelectAllSpy.callCount, 2, "select all called");
		assert.ok(oSetMarkedSpy.notCalled, "Event has not been marked");

		oSelectionPlugin.handleKeyboardShortcut("toggle", oEvent);
		assert.ok(oClearSelectionSpy.calledThrice, "clear all called");
		assert.ok(oSetMarkedSpy.calledOnceWithExactly(sEventMarker), `Event has been marked with ${sEventMarker}`);

		oSetMarkedSpy.reset();
		oClearSelectionSpy.reset();

		nextSelectionChange = TableQUnitUtils.nextEvent("selectionChange", oSelectionPlugin);
		oSelectionPlugin.addSelectionInterval(0, 2);
		await nextSelectionChange;

		oSelectionPlugin.handleKeyboardShortcut("clear", oEvent);
		assert.ok(oClearSelectionSpy.calledOnce, "Selection is cleared");
		assert.ok(oSetMarkedSpy.calledOnce, `Event marked once`);
		assert.ok(oSetMarkedSpy.calledWithExactly(sEventMarker), `Event has been marked with ${sEventMarker}`);

		oSetMarkedSpy.reset();
		oClearSelectionSpy.reset();
		oSelectAllSpy.reset();
	});

	QUnit.module("Busy Indicator", {
		beforeEach: function() {
			this.oTable = TableQUnitUtils.createTable({
				dependents: [new MultiSelectionPlugin()],
				rows: "{/}",
				models: TableQUnitUtils.createJSONModelWithEmptyRows(16)
			});
			return this.oTable.qunit.rendered();
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("TableUtils.loadContexts is called with busy=true", async function(assert) {
		const oLoadContextsSpy = sinon.spy(TableUtils, "loadContexts");
		const oPlugin = this.oTable._getSelectionPlugin();

		await oPlugin.addSelectionInterval(0, 4);
		assert.strictEqual(oLoadContextsSpy.args[0][3], true, "TableUtils.loadContexts called with busy=true");

		oLoadContextsSpy.restore();
	});
});