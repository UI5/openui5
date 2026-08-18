/*global QUnit, sinon */

sap.ui.define([
	"sap/ui/table/qunit/TableQUnitUtils",
	"sap/ui/table/qunit/rowmodes/shared/FixedRowHeight",
	"sap/ui/table/qunit/rowmodes/shared/RowCountConstraints",
	"sap/ui/table/qunit/rowmodes/shared/RowsUpdated",
	"sap/ui/table/rowmodes/Fixed",
	"sap/ui/table/Table",
	"sap/ui/table/Column"
], function(
	TableQUnitUtils,
	FixedRowHeightTest,
	RowCountConstraintsTest,
	RowsUpdatedTest,
	FixedRowMode,
	Table,
	Column
) {
	"use strict";

	const HeightTestControl = TableQUnitUtils.HeightTestControl;

	TableQUnitUtils.setDefaultSettings({
		rowMode: new FixedRowMode(),
		rows: {path: "/"}
	});

	QUnit.module("Hide empty rows", {
		beforeEach: function() {
			this.oTable = TableQUnitUtils.createTable({
				columns: [
					new Column({template: new HeightTestControl({height: "1px"})}),
					new Column({template: new HeightTestControl({height: "1px"})})
				],
				models: TableQUnitUtils.createJSONModelWithEmptyRows(1)
			});
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("Initialize with hideEmptyRows=false", function(assert) {
		const oDisableNoDataSpy = sinon.spy(FixedRowMode.prototype, "disableNoData");
		const oEnableNoDataSpy = sinon.spy(FixedRowMode.prototype, "enableNoData");
		const oTableInvalidateSpy = sinon.spy(this.oTable, "invalidate");

		this.oTable.setAggregation("rowMode", new FixedRowMode().setHideEmptyRows(false));

		assert.ok(oDisableNoDataSpy.notCalled, "#disableNoData was not called");
		assert.ok(oEnableNoDataSpy.calledOnce, "#enableNoData was called once");
		assert.notOk(this.oTable.getRowMode().isNoDataDisabled(), "NoData is enabled");
		assert.ok(oTableInvalidateSpy.calledOnce, "Table is invalidated");

		oDisableNoDataSpy.restore();
		oEnableNoDataSpy.restore();
		oTableInvalidateSpy.restore();
	});

	QUnit.test("Initialize with hideEmptyRows=true", function(assert) {
		const oDisableNoDataSpy = sinon.spy(FixedRowMode.prototype, "disableNoData");
		const oEnableNoDataSpy = sinon.spy(FixedRowMode.prototype, "enableNoData");
		const oTableInvalidateSpy = sinon.spy(this.oTable, "invalidate");

		this.oTable.setAggregation("rowMode", new FixedRowMode().setHideEmptyRows(true));

		assert.ok(oDisableNoDataSpy.calledOnce, "#disableNoData was called once");
		assert.ok(oEnableNoDataSpy.notCalled, "#enableNoData was not called");
		assert.ok(this.oTable.getRowMode().isNoDataDisabled(), "NoData is disabled");
		assert.ok(oTableInvalidateSpy.calledOnce, "Table is invalidated");

		oDisableNoDataSpy.restore();
		oEnableNoDataSpy.restore();
		oTableInvalidateSpy.restore();
	});

	QUnit.test("Change 'hideEmptyRows' property", function(assert) {
		const oRowMode = new FixedRowMode();
		const oDisableNoData = sinon.spy(oRowMode, "disableNoData");
		const oEnableNoData = sinon.spy(oRowMode, "enableNoData");

		oRowMode.setHideEmptyRows(false);
		assert.ok(oDisableNoData.notCalled, "Change from true to false: #disableNoData was not called");
		assert.equal(oEnableNoData.callCount, 1, "Change from true to false: #enableNoData was called once");

		oDisableNoData.resetHistory();
		oEnableNoData.resetHistory();
		oRowMode.setHideEmptyRows(true);
		assert.equal(oDisableNoData.callCount, 1, "Change from false to true: #disableNoData was called once");
		assert.ok(oEnableNoData.notCalled, "Change from false to true: #enableNoData was not called");
	});

	QUnit.module("Get contexts", {
		beforeEach: function() {
			this.oGetContextsSpy = sinon.spy(Table.prototype, "_getContexts");
		},
		afterEach: function() {
			if (this.oTable) {
				this.oTable.destroy();
			}
			this.oGetContextsSpy.restore();
		},
		createTable: function(bVariableRowHeightEnabled) {
			this.oTable = TableQUnitUtils.createTable({
				models: TableQUnitUtils.createJSONModelWithEmptyRows(100),
				_bVariableRowHeightEnabled: bVariableRowHeightEnabled
			});

			return this.oTable;
		}
	});

	QUnit.test("Initialization", async function(assert) {
		const oTable = this.createTable();

		await oTable.qunit.rendered();
		assert.strictEqual(this.oGetContextsSpy.callCount, 1, "Method to get contexts called once");
		assert.ok(this.oGetContextsSpy.calledWithExactly(0, 10, 100), "The call considers the row count");
	});

	QUnit.test("Initialization; Variable row heights", async function(assert) {
		const oTable = this.createTable(true);

		await oTable.qunit.rendered();
		assert.strictEqual(this.oGetContextsSpy.callCount, 2, "Method to get contexts called twice");
		assert.ok(this.oGetContextsSpy.getCall(1).calledWithExactly(0, 11, 100), "The second call considers the row count");
	});

	QUnit.test("Change row count", async function(assert) {
		const oTable = this.createTable();
		const oGetContextsSpy = this.oGetContextsSpy;

		oTable.setFirstVisibleRow(10);

		await oTable.qunit.rendered();
		oGetContextsSpy.resetHistory();
		oTable.getRowMode().setRowCount(8);
		await oTable.qunit.rendered();
		assert.strictEqual(oGetContextsSpy.callCount, 1, "Decreased row count: Method to get contexts called once");
		assert.ok(oGetContextsSpy.calledWithExactly(10, 8, 100), "Decreased row count: The call considers the row count");

		oGetContextsSpy.resetHistory();
		oTable.getRowMode().setRowCount(10);
		await oTable.qunit.rendered();
		assert.strictEqual(oGetContextsSpy.callCount, 1, "Increased row count: Method to get contexts called once");
		assert.ok(oGetContextsSpy.calledWithExactly(10, 10, 100), "Decreased row count: The call considers the row count");

		oTable.setFirstVisibleRow(100);
		await oTable.qunit.rendered();
		oGetContextsSpy.resetHistory();
		oTable.getRowMode().setRowCount(8);
		await oTable.qunit.rendered();
		assert.strictEqual(oGetContextsSpy.callCount, 1,
			"Decreased row count when scrolled to bottom: Method to get contexts called once");
		assert.ok(oGetContextsSpy.calledWithExactly(90, 8, 100),
			"Decreased row count when scrolled to bottom: The call considers the row count");

		oTable.setFirstVisibleRow(100);
		await oTable.qunit.rendered();
		oGetContextsSpy.resetHistory();
		oTable.getRowMode().setRowCount(10);
		await oTable.qunit.rendered();
		assert.strictEqual(oGetContextsSpy.callCount, 1,
			"Increased row count when scrolled to bottom: Method to get contexts called once");
		assert.ok(oGetContextsSpy.calledWithExactly(90, 10, 100),
			"Increased row count when scrolled to bottom: The call considers the row count");
	});

	RowCountConstraintsTest.test("Force fixed rows if row count too low", async function(assert) {
		this.oRowMode.setRowCount(1);
		this.oTable._setRowCountConstraints({fixedTop: true, fixedBottom: true});

		await this.oTable.qunit.rendered();
		TableQUnitUtils.assertRenderedRows(assert, this.oTable, 0, 1, 0);
	});

	FixedRowHeightTest.registerTo(QUnit);
	RowCountConstraintsTest.registerTo(QUnit);
	RowsUpdatedTest.registerTo(QUnit);
});