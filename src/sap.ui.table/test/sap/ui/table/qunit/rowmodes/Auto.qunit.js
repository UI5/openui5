/*global QUnit, sinon */

sap.ui.define([
	"sap/ui/table/qunit/TableQUnitUtils",
	"sap/ui/table/qunit/rowmodes/shared/FixedRowHeight",
	"sap/ui/table/qunit/rowmodes/shared/RowCountConstraints",
	"sap/ui/table/qunit/rowmodes/shared/RowsUpdated",
	"sap/ui/table/rowmodes/Auto",
	"sap/ui/table/Table",
	"sap/ui/table/Column",
	"sap/ui/table/CreationRow",
	"sap/ui/table/utils/TableUtils",
	"sap/ui/core/Control",
	"sap/ui/Device",
	"sap/ui/test/utils/nextUIUpdate"
], function(
	TableQUnitUtils,
	FixedRowHeightTest,
	RowCountConstraintsTest,
	RowsUpdatedTest,
	AutoRowMode,
	Table,
	Column,
	CreationRow,
	TableUtils,
	Control,
	Device,
	nextUIUpdate
) {
	"use strict";

	const HeightTestControl = TableQUnitUtils.HeightTestControl;

	TableQUnitUtils.setDefaultSettings({
		rowMode: new AutoRowMode(),
		rows: {path: "/"}
	});

	QUnit.module("Automatic row count adjustment", {
		beforeEach: function() {
			this.oTable = TableQUnitUtils.createTable({
				extension: [
					new HeightTestControl({height: "100px"})
				],
				footer: new HeightTestControl({height: "100px"}),
				columns: [
					TableQUnitUtils.createTextColumn()
				],
				models: TableQUnitUtils.createJSONModelWithEmptyRows(1),
				creationRow: new CreationRow()
			});

			return this.oTable.qunit.rendered();
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("After rendering", function(assert) {
		assert.equal(this.oTable.getRows().length, 13, "Row count");
	});

	QUnit.test("Change visibility of the table", async function(assert) {
		const oTableContainer = document.getElementById("qunit-fixture");
		const sOriginalContainerHeight = oTableContainer.style.height;

		this.oTable.setVisible(false);
		await nextUIUpdate();
		oTableContainer.setAttribute("style", "height: 765px");
		this.oTable.setVisible(true);
		await this.oTable.qunit.rendered();
		assert.equal(this.oTable.getRows().length, 9, "Row count after showing the table");

		oTableContainer.setAttribute("style", `height: ${sOriginalContainerHeight}`);
		await this.oTable.qunit.nextRender();
		assert.equal(this.oTable.getRows().length, 13, "Row count after resize");
	});

	QUnit.test("Change visibility of the table parent", async function(assert) {
		const TableContainer = Control.extend("sap.ui.table.test.TableContainer", {
			metadata: {
				aggregations: {
					table: {type: "sap.ui.table.Table", multiple: false}
				},
				properties: {
					height: {type: "sap.ui.core.CSSSize", defaultValue: "1000px"}
				}
			},
			renderer: {
				apiVersion: 2,
				render: function(oRm, oControl) {
					oRm.openStart("div", oControl);
					oRm.style("height", oControl.getHeight());
					oRm.openEnd();
					oRm.renderControl(oControl.getTable());
					oRm.close("div");
				}
			}
		});
		const oTableContainer = new TableContainer({
			table: this.oTable
		});

		oTableContainer.placeAt("qunit-fixture");
		await nextUIUpdate();
		oTableContainer.setVisible(false);
		await nextUIUpdate();
		oTableContainer.setHeight("765px");
		oTableContainer.setVisible(true);
		await this.oTable.qunit.rendered(() => this.oTable.getRows().length === 9);
		assert.equal(this.oTable.getRows().length, 9, "Row count after showing the parent");

		oTableContainer.setHeight();
		await this.oTable.qunit.rendered(() => this.oTable.getRows().length === 13);
		assert.equal(this.oTable.getRows().length, 13, "Row count after resize");

		oTableContainer.destroy();
	});

	QUnit.test("Resize", async function(assert) {
		await this.oTable.qunit.resize({height: "765px"});
		assert.equal(this.oTable.getRows().length, 9, "Row count after decreasing height");
		await this.oTable.qunit.resetSize();
		assert.equal(this.oTable.getRows().length, 13, "Row count after increasing height");
	});

	QUnit.test("Changing visibility of an extension", async function(assert) {
		this.oTable.getExtension()[0].setVisible(false);
		await this.oTable.qunit.nextRender();
		assert.equal(this.oTable.getRows().length, 15, "Row count after hiding an extension");

		this.oTable.getExtension()[0].setVisible(true);
		await this.oTable.qunit.nextRender();
		assert.equal(this.oTable.getRows().length, 13, "Row count after showing an extension");
	});

	QUnit.test("Changing visibility of the footer", async function(assert) {
		this.oTable.destroyAggregation("extension");
		this.oTable.destroyAggregation("creationRow");
		await this.oTable.qunit.resize({height: "430px"});

		const iInitialRowCount = this.oTable.getRows().length;

		this.oTable.getFooter().setVisible(false);
		await this.oTable.qunit.rendered(() => this.oTable.getRows().length === iInitialRowCount + 2);
		assert.equal(this.oTable.getRows().length, iInitialRowCount + 2, "Row count increased after hiding the footer");

		this.oTable.getFooter().setVisible(true);
		await this.oTable.qunit.rendered(() => this.oTable.getRows().length === iInitialRowCount);
		assert.equal(this.oTable.getRows().length, iInitialRowCount, "Row count restored after showing the footer");

		await this.oTable.qunit.resetSize();
	});

	QUnit.test("Changing visibility of the creation row", async function(assert) {
		this.oTable.getCreationRow().setVisible(false);
		await this.oTable.qunit.rendered(() => this.oTable.getRows().length === 14);
		assert.equal(this.oTable.getRows().length, 14, "Row count after hiding the creation row");

		this.oTable.getCreationRow().setVisible(true);
		await this.oTable.qunit.rendered(() => this.oTable.getRows().length === 13);
		assert.equal(this.oTable.getRows().length, 13, "Row count after showing the creation row");
	});

	QUnit.test("Elements with margins", async function(assert) {
		const oTableContainer = this.oTable.getDomRef().parentNode;

		this.oTable.getExtension()[0].addStyleClass("sapUiLargeMargin");
		this.oTable.addExtension(this.oTable.getExtension()[0].clone());
		this.oTable.getFooter().addStyleClass("sapUiLargeMargin");
		this.oTable.destroyAggregation("creationRow");
		await this.oTable.qunit.rendered(() => oTableContainer.clientHeight === oTableContainer.scrollHeight);
		assert.equal(oTableContainer.clientHeight, oTableContainer.scrollHeight, "The table container has no vertical overflow");
	});

	QUnit.test("Table is not rendered", function(assert) {
		const oRowMode = new AutoRowMode();
		const oTable = new Table({rowMode: oRowMode});
		const oInvalidateSpy = this.spy(oRowMode, "invalidate");

		oRowMode.adjustRowCountToAvailableSpace();

		assert.ok(oInvalidateSpy.notCalled, "No invalidation triggered");
		assert.strictEqual(oRowMode.getComputedRowCounts().count, 0,
			"Computed row count stays at the initial 0 without a rendered DOM to measure against");

		oTable.destroy();
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
		const oDisableNoDataSpy = sinon.spy(AutoRowMode.prototype, "disableNoData");
		const oEnableNoDataSpy = sinon.spy(AutoRowMode.prototype, "enableNoData");
		const oTableInvalidateSpy = sinon.spy(this.oTable, "invalidate");

		this.oTable.setAggregation("rowMode", new AutoRowMode().setHideEmptyRows(false));

		assert.ok(oDisableNoDataSpy.notCalled, "#disableNoData was not called");
		assert.ok(oEnableNoDataSpy.calledOnce, "#enableNoData was called once");
		assert.notOk(this.oTable.getRowMode().isNoDataDisabled(), "NoData is enabled");
		assert.ok(oTableInvalidateSpy.calledOnce, "Table is invalidated");

		oDisableNoDataSpy.restore();
		oEnableNoDataSpy.restore();
		oTableInvalidateSpy.restore();
	});

	QUnit.test("Initialize with hideEmptyRows=true", function(assert) {
		const oDisableNoDataSpy = sinon.spy(AutoRowMode.prototype, "disableNoData");
		const oEnableNoDataSpy = sinon.spy(AutoRowMode.prototype, "enableNoData");
		const oTableInvalidateSpy = sinon.spy(this.oTable, "invalidate");

		this.oTable.setAggregation("rowMode", new AutoRowMode().setHideEmptyRows(true));

		assert.ok(oDisableNoDataSpy.calledOnce, "#disableNoData was called once");
		assert.ok(oEnableNoDataSpy.notCalled, "#enableNoData was not called");
		assert.ok(this.oTable.getRowMode().isNoDataDisabled(), "NoData is disabled");
		assert.ok(oTableInvalidateSpy.calledOnce, "Table is invalidated");

		oDisableNoDataSpy.restore();
		oEnableNoDataSpy.restore();
		oTableInvalidateSpy.restore();
	});

	QUnit.test("Change 'hideEmptyRows' property", function(assert) {
		const oRowMode = new AutoRowMode();
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
		before: function() {
			this.iOriginalDeviceHeight = Device.resize.height;
			Device.resize.height = 500;
		},
		beforeEach: function() {
			this.oGetContextsSpy = sinon.spy(Table.prototype, "_getContexts");
		},
		afterEach: function() {
			if (this.oTable) {
				this.oTable.destroy();
			}
			this.oGetContextsSpy.restore();
		},
		after: function() {
			Device.resize.height = this.iOriginalDeviceHeight;
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
		assert.strictEqual(this.oGetContextsSpy.callCount, 1, "Method to get contexts called once"); // auto rerender
		assert.ok(this.oGetContextsSpy.getCall(0).calledWithExactly(0, this.oTable.getRowMode().getComputedRowCounts().count, 100),
			"The call considers the row count");
	});

	QUnit.test("Initialization; Variable row heights", async function(assert) {
		const oTable = this.createTable(true);

		await oTable.qunit.rendered();
		assert.strictEqual(this.oGetContextsSpy.callCount, 1, "Method to get contexts called once"); // auto render
		assert.ok(this.oGetContextsSpy.getCall(0).calledWithExactly(0, this.oTable.getRowMode().getComputedRowCounts().count + 1, 100),
			"The call considers the row count");
	});

	QUnit.test("Resize", async function(assert) {
		const oGetContextsSpy = this.oGetContextsSpy;
		const oTable = this.createTable();

		await oTable.qunit.rendered();
		oGetContextsSpy.resetHistory();
		await oTable.qunit.resize({height: "756px"});
		assert.strictEqual(oGetContextsSpy.callCount, 1,
			"Height decreased when scroll to top: Method to get contexts called once");
		assert.ok(oGetContextsSpy.calledWithExactly(0, oTable.getRowMode().getComputedRowCounts().count, 100),
			"The call considers the row count");

		oGetContextsSpy.resetHistory();
		await oTable.qunit.resetSize();
		assert.strictEqual(oGetContextsSpy.callCount, 1,
			"Height increased when scroll to top: Method to get contexts called once");
		assert.ok(oGetContextsSpy.calledWithExactly(0, oTable.getRowMode().getComputedRowCounts().count, 100),
			"The call considers the row count");

		oTable.setFirstVisibleRow(10);
		await oTable.qunit.rendered();
		oGetContextsSpy.resetHistory();
		await oTable.qunit.resize({height: "756px"});
		assert.strictEqual(oGetContextsSpy.callCount, 1,
			"Height decreased when scrolled in middle: Method to get contexts called once");
		assert.ok(oGetContextsSpy.calledWithExactly(10, oTable.getRowMode().getComputedRowCounts().count, 100),
			"The call considers the row count");

		oTable.setFirstVisibleRow(10);
		await oTable.qunit.rendered();
		oGetContextsSpy.resetHistory();
		await oTable.qunit.resetSize();
		assert.strictEqual(oGetContextsSpy.callCount, 1,
			"Height increased when scrolled in middle: Method to get contexts called once");
		assert.ok(oGetContextsSpy.calledWithExactly(10, oTable.getRowMode().getComputedRowCounts().count, 100),
			"The call considers the row count");

		oTable.setFirstVisibleRow(100);
		await oTable.qunit.rendered();
		oGetContextsSpy.resetHistory();
		const iFirstVisibleRow = oTable.getFirstVisibleRow();
		await oTable.qunit.resize({height: "756px"});
		assert.strictEqual(oGetContextsSpy.callCount, 1,
			"Height decreased when scrolled to bottom: Method to get contexts called once");
		assert.ok(oGetContextsSpy.calledWithExactly(iFirstVisibleRow, oTable.getRowMode().getComputedRowCounts().count, 100),
			"The call considers the row count");

		oTable.setFirstVisibleRow(100);
		await oTable.qunit.rendered();
		oGetContextsSpy.resetHistory();
		await oTable.qunit.resetSize();
		const iRowCount = oTable.getRowMode().getComputedRowCounts().count;
		assert.strictEqual(oGetContextsSpy.callCount, 1,
			"Height increased when scrolled to bottom: Method to get contexts called once");
		assert.ok(oGetContextsSpy.calledWithExactly(100 - iRowCount, iRowCount, 100),
			"The call considers the row count");
	});

	FixedRowHeightTest.registerTo(QUnit);

	RowCountConstraintsTest.test("Force fixed rows if row count too low", async function(assert) {
		this.oRowMode.setMaxRowCount(1);
		this.oTable._setRowCountConstraints({fixedTop: true, fixedBottom: true});

		await this.oTable.qunit.rendered();
		TableQUnitUtils.assertRenderedRows(assert, this.oTable, 0, 1, 0);
	});

	RowCountConstraintsTest.registerTo(QUnit, function(assert, fnOriginalTest) {
		this.oTable.getRowMode().setMinRowCount(10).setMaxRowCount(10);
		return fnOriginalTest();
	});

	RowsUpdatedTest.test("Resize", async function(assert) {
		this.createTable();
		try {
			await this.oTable.qunit.rendered();
			this.resetRowsUpdatedSpy();
			await this.oTable.qunit.resize({height: "500px"});
			await this.checkRowsUpdated(assert, [
				TableUtils.RowsUpdateReason.Render
			]);
		} finally {
			await this.oTable.qunit.resetSize();
		}
	});

	RowsUpdatedTest.test("Animation", async function(assert) {
		this.createTable();
		await this.oTable.qunit.rendered();
		this.resetRowsUpdatedSpy();
		this.oTable.getRowMode().setProperty("rowContentHeight", 30, true); // Simulate that the row count changes after animation.
		document.body.dispatchEvent(new Event("transitionend"));
		await TableQUnitUtils.nextFrame();
		await this.checkRowsUpdated(assert, [
			TableUtils.RowsUpdateReason.Render
		]);
	});

	RowsUpdatedTest.test("Render when theme not applied", async function(assert) {
		const oIsThemeApplied = sinon.stub(TableUtils, "isThemeApplied").returns(false);
		this.createTable();
		try {
			await this.checkRowsUpdated(assert, []);
			this.resetRowsUpdatedSpy();
			this.oTable.invalidate();
			await this.checkRowsUpdated(assert, []);
			this.resetRowsUpdatedSpy();
			oIsThemeApplied.returns(true);
			this.oTable.onThemeChanged();
			await this.checkRowsUpdated(assert, [
				TableUtils.RowsUpdateReason.Render
			]);
		} finally {
			oIsThemeApplied.restore();
		}
	});

	RowsUpdatedTest.registerTo(QUnit, function(assert, fnOriginalTest) {
		switch (QUnit.config.current.testName) {
			case "Initial rendering without binding":
			case "Initial rendering without binding in invisible container":
			case "Initial rendering with binding":
				return testWithStableRowCount(fnOriginalTest);
			case "Initial rendering with binding in invisible container":
				return RowsUpdatedTestInvisibleInitialRendering.apply(this, arguments);
			case "Re-render without binding":
				return RowsUpdatedTestRerenderWithoutBinding.apply(this, arguments);
			case "Re-render without binding in invisible container":
				return RowsUpdatedTestInvisibleRerenderWithoutBinding.apply(this, arguments);
			case "Re-render with binding":
				return RowsUpdatedTestRerenderWithBinding.apply(this, arguments);
			case "Re-render with binding in invisible container":
				return RowsUpdatedTestInvisibleRerenderWithBinding.apply(this, arguments);
			default:
				return fnOriginalTest();
		}
	});

	QUnit.module("Table bottom placeholder styles", {
		beforeEach: function() {
			this.oTable = TableQUnitUtils.createTable({
				rowMode: new AutoRowMode({
					maxRowCount: 10
				}),
				columns: [
					new Column({template: new HeightTestControl({height: "1px"})}),
					new Column({template: new HeightTestControl({height: "1px"})})
				],
				models: TableQUnitUtils.createJSONModelWithEmptyRows(3)
			});
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("getTableBottomPlaceholderStyles - hideEmptyRows=false", async function(assert) {
		await this.oTable.qunit.rendered();
		assert.strictEqual(this.oTable.getRowMode().getTableBottomPlaceholderStyles(), undefined);
	});

	QUnit.test("getTableBottomPlaceholderStyles - hideEmptyRows=true, before rendering", function(assert) {
		const oRowMode = this.oTable.getRowMode();

		oRowMode.setHideEmptyRows(true);
		assert.deepEqual(oRowMode.getTableBottomPlaceholderStyles(), {
			height: 5 * oRowMode.getBaseRowHeightOfTable() + "px"
		});
	});

	QUnit.test("getTableBottomPlaceholderStyles - hideEmptyRows=true, with less data than min rows", async function(assert) {
		const oRowMode = this.oTable.getRowMode();

		oRowMode.setHideEmptyRows(true);
		await this.oTable.qunit.rendered();
		assert.deepEqual(oRowMode.getTableBottomPlaceholderStyles(), {
			height: 7 * oRowMode.getBaseRowHeightOfTable() + "px"
		});
	});

	QUnit.test("getTableBottomPlaceholderStyles - hideEmptyRows=true, with more data than min rows", async function(assert) {
		const oRowMode = this.oTable.getRowMode();

		oRowMode.setHideEmptyRows(true);
		this.oTable.setModel(TableQUnitUtils.createJSONModelWithEmptyRows(6));
		await this.oTable.qunit.rendered();
		assert.deepEqual(oRowMode.getTableBottomPlaceholderStyles(), {
			height: 4 * oRowMode.getBaseRowHeightOfTable() + "px"
		});
	});

	QUnit.test("Adding a row when empty rows are hidden", async function(assert) {
		const oRowMode = this.oTable.getRowMode();

		oRowMode.setHideEmptyRows(true);

		await this.oTable.qunit.rendered();
		assert.strictEqual(oRowMode.getComputedRowCounts().count, 3, "Initial computed row count");
		assert.deepEqual(oRowMode.getTableBottomPlaceholderStyles(), {
			height: 7 * oRowMode.getBaseRowHeightOfTable() + "px"
		}, "Initial bottom placeholder styles");

		const oInvalidate = sinon.spy(oRowMode, "invalidate");
		this.oTable.setModel(TableQUnitUtils.createJSONModelWithEmptyRows(4));
		await this.oTable.qunit.rendered();
		assert.strictEqual(oRowMode.getComputedRowCounts().count, 4, "Added one data row: new computed row count");
		assert.deepEqual(oRowMode.getTableBottomPlaceholderStyles(), {
			height: 6 * oRowMode.getBaseRowHeightOfTable() + "px"
		}, "Added one data row: Bottom placeholder styles");
		assert.ok(oInvalidate.notCalled, "Added one data row: Row mode was not invalidated");
		oInvalidate.restore();
	});

	QUnit.test("Resize the table reducing the placeholder height", async function(assert) {
		const oRowMode = this.oTable.getRowMode();

		oRowMode.setHideEmptyRows(true);

		await this.oTable.qunit.rendered();
		assert.strictEqual(oRowMode.getComputedRowCounts().count, 3, "Initial computed row count");
		assert.deepEqual(oRowMode.getTableBottomPlaceholderStyles(), {
			height: 7 * oRowMode.getBaseRowHeightOfTable() + "px"
		}, "Initial bottom placeholder styles");

		const oInvalidate = sinon.spy(oRowMode, "invalidate");
		await this.oTable.qunit.resize({height: "550px"});
		assert.strictEqual(oRowMode.getComputedRowCounts().count, 3, "After resize: computed row count");
		assert.deepEqual(oRowMode.getTableBottomPlaceholderStyles(), {
			height: 6 * oRowMode.getBaseRowHeightOfTable() + "px"
		}, "After resize: bottom placeholder styles");
		assert.ok(oInvalidate.called, "After resize: Row mode was invalidated");
		oInvalidate.restore();

		await this.oTable.qunit.resetSize();
	});

	// To add a test case where the table does not need to adjust the row count to the available space after rendering.
	function testWithStableRowCount(fnTest) {
		return fnTest().then(() => {
			const oRowMode = TableQUnitUtils.getDefaultSettings().rowMode;

			oRowMode.minRowCount = 10;
			oRowMode.maxRowCount = 10;

			return fnTest().then(() => {
				delete oRowMode.minRowCount;
				delete oRowMode.maxRowCount;
			});
		});
	}

	function RowsUpdatedTestInvisibleInitialRendering(assert, fnOriginalTest) {
		return testWithStableRowCount(() => {
			return TableQUnitUtils.hideTestContainer().then(() => {
				this.createTable();
				return this.checkRowsUpdated(assert, []);
			}).then(() => {
				this.resetRowsUpdatedSpy();
				return TableQUnitUtils.showTestContainer();
			}).then(() => {
				return this.checkRowsUpdated(assert, [
					TableUtils.RowsUpdateReason.Render
				]);
			});
		});
	}

	function RowsUpdatedTestRerenderWithoutBinding(assert, fnOriginalTest) {
		return fnOriginalTest().then(() => {
			this.resetRowsUpdatedSpy();
			this.oTable.getRowMode().setRowContentHeight(this.oTable._getDefaultRowHeight() + 20); // The table will show less rows.
			return this.checkRowsUpdated(assert, []);
		});
	}

	function RowsUpdatedTestInvisibleRerenderWithoutBinding(assert, fnOriginalTest) {
		return fnOriginalTest().then(() => {
			this.resetRowsUpdatedSpy();
			return TableQUnitUtils.hideTestContainer();
		}).then(() => {
			this.oTable.getRowMode().setRowContentHeight(this.oTable._getDefaultRowHeight() + 20); // The table will show less rows.
			return this.checkRowsUpdated(assert, []);
		}).then(() => {
			this.resetRowsUpdatedSpy();
			return TableQUnitUtils.showTestContainer();
		}).then(() => {
			return this.checkRowsUpdated(assert, []);
		});
	}

	function RowsUpdatedTestRerenderWithBinding(assert, fnOriginalTest) {
		return fnOriginalTest().then(() => {
			this.resetRowsUpdatedSpy();
			this.oTable.getRowMode().setRowContentHeight(this.oTable._getDefaultRowHeight() + 20); // The table will show less rows.
			return this.checkRowsUpdated(assert, [
				TableUtils.RowsUpdateReason.Render, // Invalidation on propery change
				TableUtils.RowsUpdateReason.Render // Row count adjustment
			]);
		}).then(() => {
			this.resetRowsUpdatedSpy();
			this.oTable.getRowMode().setRowContentHeight(this.oTable._getDefaultRowHeight() + 21); // Does not change number of rows.
			return this.checkRowsUpdated(assert, [
				TableUtils.RowsUpdateReason.Render // Invalidation on propery change
			]);
		});
	}

	function RowsUpdatedTestInvisibleRerenderWithBinding(assert, fnOriginalTest) {
		return fnOriginalTest().then(() => {
			this.resetRowsUpdatedSpy();
			return TableQUnitUtils.hideTestContainer();
		}).then(() => {
			this.oTable.getRowMode().setRowContentHeight(this.oTable._getDefaultRowHeight() + 20); // The table will show less rows.
			return this.checkRowsUpdated(assert, [
				TableUtils.RowsUpdateReason.Render // Due to invalidation on property change
			]);
		}).then(() => {
			this.resetRowsUpdatedSpy();
			return TableQUnitUtils.showTestContainer();
		}).then(() => {
			return new Promise((resolve) => {
				this.oTable.attachEventOnce("_rowsUpdated", resolve);
			});
		}).then(() => {
			return this.checkRowsUpdated(assert, [
				TableUtils.RowsUpdateReason.Render
			]);
		});
	}

	QUnit.module("Per-instance adjustRowCountToAvailableSpace");

	QUnit.test("Instances do not share the throttled function", function(assert) {
		const oRowMode1 = new AutoRowMode();
		const oRowMode2 = new AutoRowMode();

		assert.notStrictEqual(oRowMode1.adjustRowCountToAvailableSpace, oRowMode2.adjustRowCountToAvailableSpace);

		oRowMode1.destroy();
		oRowMode2.destroy();
	});

	QUnit.test("Scheduling on one instance does not cancel the other", function(assert) {
		const done = assert.async();
		let bCallback1Called = false;
		let bCallback2Called = false;

		const fnThrottled1 = TableUtils.throttleFrameWise(() => { bCallback1Called = true; });
		const fnThrottled2 = TableUtils.throttleFrameWise(() => { bCallback2Called = true; });

		fnThrottled1();
		fnThrottled2();

		window.requestAnimationFrame(() => {
			assert.ok(bCallback1Called, "First callback executed");
			assert.ok(bCallback2Called, "Second callback executed");
			done();
		});
	});

	QUnit.module("Chrome zoom row-height workaround", {
		beforeEach: async function() {
			this.oTable = TableQUnitUtils.createTable({
				models: TableQUnitUtils.createJSONModelWithEmptyRows(10)
			});
			await this.oTable.qunit.rendered();
		},
		afterEach: function() {
			this.oTable.destroy();

			if (this.bChromeZoomFaked) {
				Device.browser.chrome = this.bOriginalChrome;
				if (this.oOriginalDevicePixelRatio) {
					Object.defineProperty(window, "devicePixelRatio", this.oOriginalDevicePixelRatio);
				} else {
					delete window.devicePixelRatio;
				}
			}
		},
		fakeChromeZoom: function(fRatio) {
			this.bChromeZoomFaked = true;
			this.bOriginalChrome = Device.browser.chrome;
			this.oOriginalDevicePixelRatio = Object.getOwnPropertyDescriptor(window, "devicePixelRatio");
			Device.browser.chrome = true;
			Object.defineProperty(window, "devicePixelRatio", {configurable: true, value: fRatio});
		}
	});

	QUnit.test("Chrome with fractional devicePixelRatio still returns a valid row-container height", function(assert) {
		const oRowMode = this.oTable.getRowMode();
		const mBaselineStyles = oRowMode.getRowContainerStyles();

		this.fakeChromeZoom(1.25);
		const mZoomStyles = oRowMode.getRowContainerStyles();

		const iBaselineHeight = parseInt(mBaselineStyles.height);
		const iZoomHeight = parseInt(mZoomStyles.height);

		assert.ok(/^\d+px$/.test(mZoomStyles.height), "Row-container height is a positive pixel value under Chrome zoom");
		assert.ok(iZoomHeight >= iBaselineHeight, `Zoom-workaround height (${iZoomHeight}px) is at least the baseline height (${iBaselineHeight}px)`);
	});

	QUnit.test("Chrome zoom row-container height reflects a configured row content height", function(assert) {
		const oRowMode = this.oTable.getRowMode();
		const mDefaultStyles = oRowMode.getRowContainerStyles();

		this.fakeChromeZoom(1.5);
		oRowMode.setRowContentHeight(60);
		const mConfiguredStyles = oRowMode.getRowContainerStyles();

		assert.ok(parseInt(mConfiguredStyles.height) > parseInt(mDefaultStyles.height),
			"Configuring a larger row content height enlarges the returned row-container height");
	});

	QUnit.module("Table refresh row-count adjustment", {
		beforeEach: async function() {
			this.oTable = TableQUnitUtils.createTable({
				models: TableQUnitUtils.createJSONModelWithEmptyRows(100)
			});
			await this.oTable.qunit.rendered();
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("Table#refreshRows requests contexts and initializes rows for the configured count", function(assert) {
		const oRowMode = this.oTable.getRowMode();
		const iConfiguredRowCount = oRowMode.getConfiguredRowCount();
		const oInitRowsSpy = this.spy(oRowMode, "initTableRowsAfterDataRequested");
		const oGetContextsSpy = this.spy(oRowMode, "getRowContexts");

		assert.ok(iConfiguredRowCount > 0, "Precondition: configured row count is positive");

		this.oTable.refreshRows();

		assert.ok(oInitRowsSpy.calledOnceWithExactly(iConfiguredRowCount),
			"initTableRowsAfterDataRequested called with the configured row count");
		assert.ok(oGetContextsSpy.calledWithExactly(iConfiguredRowCount), "getRowContexts called with the configured row count");
	});

	QUnit.test("Table#refreshRows on a freshly attached row mode skips row initialization", function(assert) {
		const oRowMode = new AutoRowMode();
		const oInitRowsSpy = this.spy(oRowMode, "initTableRowsAfterDataRequested");
		const oGetContextsSpy = this.spy(oRowMode, "getRowContexts");

		this.oTable.setRowMode(oRowMode);
		oInitRowsSpy.resetHistory();
		oGetContextsSpy.resetHistory();

		this.oTable.refreshRows();

		assert.ok(oInitRowsSpy.notCalled, "initTableRowsAfterDataRequested not called while row count is still initial");
		assert.ok(oGetContextsSpy.calledOnceWithExactly(oRowMode.getConfiguredRowCount()),
			"getRowContexts called with the configured row count");
	});
});