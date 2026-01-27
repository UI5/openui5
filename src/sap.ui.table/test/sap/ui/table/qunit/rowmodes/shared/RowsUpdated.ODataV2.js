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

	QUnit.test("Initial rendering in invisible container", function(assert) {
		return TableQUnitUtils.hideTestContainer().then(() => {
			this.createTable();
			return this.checkRowsUpdated(assert, 1);
		}).then(() => {
			this.resetRowsUpdatedSpy();
			return TableQUnitUtils.showTestContainer();
		}).then(() => {
			return this.checkRowsUpdated(assert, 0);
		});
	});

	QUnit.test("Re-render and refresh", function(assert) {
		this.createTable();

		return this.oTable.qunit.whenBindingChange().then(this.oTable.qunit.whenRenderingFinished).then(async () => {
			this.resetRowsUpdatedSpy();
			this.oTable.invalidate();
			this.oTable.getBinding().refresh(true);
			await this.oTable.qunit.whenRenderingFinished();
			return this.checkRowsUpdated(assert, 1);
		});
	});

	QUnit.test("Refresh", function(assert) {
		this.createTable();

		return this.oTable.qunit.whenBindingChange().then(this.oTable.qunit.whenRenderingFinished).then(() => {
			this.resetRowsUpdatedSpy();
			this.oTable.getBinding().refresh(true);
			return this.checkRowsUpdated(assert, 1);
		});
	});

	QUnit.test("Sort with Table#sort", function(assert) {
		this.createTable();

		return this.oTable.qunit.whenBindingChange().then(this.oTable.qunit.whenRenderingFinished).then(() => {
			this.resetRowsUpdatedSpy();
			this.oTable.sort(this.oTable.getColumns()[0], "Ascending");
			return this.checkRowsUpdated(assert, 1);
		});
	});

	QUnit.test("Sort with Binding#sort", function(assert) {
		this.createTable();

		return this.oTable.qunit.whenBindingChange().then(this.oTable.qunit.whenRenderingFinished).then(() => {
			this.resetRowsUpdatedSpy();
			this.oTable.getBinding().sort(new Sorter(this.oTable.getColumns()[0].getSortProperty()));
			return this.checkRowsUpdated(assert, 1);
		});
	});

	QUnit.test("Filter with Table#filter", function(assert) {
		this.createTable();

		return this.oTable.qunit.whenBindingChange().then(this.oTable.qunit.whenRenderingFinished).then(() => {
			this.resetRowsUpdatedSpy();
			this.oTable.filter(this.oTable.getColumns()[0], "test");
			return this.checkRowsUpdated(assert, 1);
		});
	});

	QUnit.test("Filter with Binding#filter", function(assert) {
		this.createTable();

		return this.oTable.qunit.whenBindingChange().then(this.oTable.qunit.whenRenderingFinished).then(() => {
			this.resetRowsUpdatedSpy();
			this.oTable.getBinding().filter(new Filter(this.oTable.getColumns()[0].getFilterProperty(), "Contains", "test"));
			return this.checkRowsUpdated(assert, 1);
		});
	});

	QUnit.test("Bind", function(assert) {
		this.createTable();
		this.oBindingInfo = this.oTable.getBindingInfo("rows");

		return this.oTable.qunit.whenBindingChange().then(this.oTable.qunit.whenRenderingFinished).then(() => {
			this.oTable.unbindRows();
		}).then(this.oTable.qunit.whenRenderingFinished).then(() => {
			this.resetRowsUpdatedSpy();
			this.oTable.bindRows(this.oBindingInfo);
			return this.checkRowsUpdated(assert, 1);
		});
	});

	return QUnit;
});