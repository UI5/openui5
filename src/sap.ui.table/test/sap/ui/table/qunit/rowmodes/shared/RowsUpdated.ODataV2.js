sap.ui.define([
	"sap/ui/table/qunit/TableQUnitUtils.ODataV2",
	"sap/ui/table/utils/TableUtils",
	"sap/ui/model/Sorter",
	"sap/ui/model/Filter"
], function(
	TableQUnitUtils,
	TableUtils,
	Sorter,
	Filter
) {
	"use strict";

	const QUnit = TableQUnitUtils.createQUnitTestCollector();

	QUnit.module("RowsUpdated event", {
		before: function() {
			this.oMockServer = TableQUnitUtils.startMockServer();
		},
		afterEach: function() {
			this.oTable.destroy();
		},
		after: function() {
			this.oMockServer.destroy();
		},
		createTable: function(mSettings) {
			if (this.oTable) {
				this.oTable.destroy();
			}

			this.oTable = TableQUnitUtils.createTable(Object.assign({}, {
				rows: "{/Products}",
				models: TableQUnitUtils.createODataModel(),
				columns: [
					TableQUnitUtils.createTextColumn({
						label: "Name",
						text: "Name",
						bind: true
					})
					.setSortProperty("Name")
					.setFilterProperty("Name")
				]
			}, mSettings), (oTable) => {
				oTable.qunit.iRowsUpdatedEvents = 0;
				oTable.attachEvent("rowsUpdated", () => {
					oTable.qunit.iRowsUpdatedEvents++;
				});
			});

			return this.oTable;
		},
		checkRowsUpdated: function(assert, iExpectedCalls, iDelay) {
			return new Promise((resolve) => {
				setTimeout(() => {
					assert.equal(this.oTable.qunit.iRowsUpdatedEvents, iExpectedCalls,
						`The event rowsUpdated has been fired ${iExpectedCalls} times`);
					resolve();
				}, iDelay == null ? 500 : iDelay);
			});
		},
		resetRowsUpdatedSpy: function() {
			this.oTable.qunit.iRowsUpdatedEvents = 0;
		}
	});

	QUnit.test("Initial rendering", function(assert) {
		this.createTable();
		return this.checkRowsUpdated(assert, 1);
	});

	QUnit.test("Initial rendering in invisible container", async function(assert) {
		await TableQUnitUtils.hideTestContainer();
		this.createTable();
		await this.checkRowsUpdated(assert, 1);
		this.resetRowsUpdatedSpy();
		await TableQUnitUtils.showTestContainer();
		await this.checkRowsUpdated(assert, 0);
	});

	QUnit.test("Re-render and refresh", async function(assert) {
		this.createTable();

		await this.oTable.qunit.bindingChangeEvent();
		await this.oTable.qunit.rendered();
		this.resetRowsUpdatedSpy();
		this.oTable.invalidate();
		this.oTable.getBinding().refresh(true);
		await this.oTable.qunit.rendered();
		await this.checkRowsUpdated(assert, 1);
	});

	QUnit.test("Refresh", async function(assert) {
		this.createTable();

		await this.oTable.qunit.bindingChangeEvent();
		await this.oTable.qunit.rendered();
		this.resetRowsUpdatedSpy();
		this.oTable.getBinding().refresh(true);
		await this.checkRowsUpdated(assert, 1);
	});

	QUnit.test("Sort with Table#sort", async function(assert) {
		this.createTable();

		await this.oTable.qunit.bindingChangeEvent();
		await this.oTable.qunit.rendered();
		this.resetRowsUpdatedSpy();
		this.oTable.sort(this.oTable.getColumns()[0], "Ascending");
		await this.checkRowsUpdated(assert, 1);
	});

	QUnit.test("Sort with Binding#sort", async function(assert) {
		this.createTable();

		await this.oTable.qunit.bindingChangeEvent();
		await this.oTable.qunit.rendered();
		this.resetRowsUpdatedSpy();
		this.oTable.getBinding().sort(new Sorter(this.oTable.getColumns()[0].getSortProperty()));
		await this.checkRowsUpdated(assert, 1);
	});

	QUnit.test("Filter with Table#filter", async function(assert) {
		this.createTable();

		await this.oTable.qunit.bindingChangeEvent();
		await this.oTable.qunit.rendered();
		this.resetRowsUpdatedSpy();
		this.oTable.filter(this.oTable.getColumns()[0], "test");
		await this.checkRowsUpdated(assert, 1);
	});

	QUnit.test("Filter with Binding#filter", async function(assert) {
		this.createTable();

		await this.oTable.qunit.bindingChangeEvent();
		await this.oTable.qunit.rendered();
		this.resetRowsUpdatedSpy();
		this.oTable.getBinding().filter(new Filter(this.oTable.getColumns()[0].getFilterProperty(), "Contains", "test"));
		await this.checkRowsUpdated(assert, 1);
	});

	QUnit.test("Bind", async function(assert) {
		this.createTable();
		this.oBindingInfo = this.oTable.getBindingInfo("rows");

		await this.oTable.qunit.bindingChangeEvent();
		await this.oTable.qunit.rendered();
		this.oTable.unbindRows();
		await this.oTable.qunit.rendered();
		this.resetRowsUpdatedSpy();
		this.oTable.bindRows(this.oBindingInfo);
		await this.checkRowsUpdated(assert, 1);
	});

	return QUnit;
});