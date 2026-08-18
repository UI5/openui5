sap.ui.define([
	"sap/ui/table/qunit/TableQUnitUtils",
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
		afterEach: function() {
			this.oTable.destroy();
		},
		createTable: function(mSettings) {
			if (this.oTable) {
				this.oTable.destroy();
			}

			this.oTable = TableQUnitUtils.createTable(Object.assign({}, {
				rows: "{/}",
				models: TableQUnitUtils.createJSONModelWithEmptyRows(100),
				columns: [
					TableQUnitUtils.createTextColumn({
						label: "Last Name",
						text: "lastName",
						bind: true
					})
						.setSortProperty("lastName")
						.setFilterProperty("lastName")
				]
			}, mSettings), (oTable) => {
				oTable.qunit.aRowsUpdatedEvents = [];
				oTable.attachEvent("_rowsUpdated", (oEvent) => {
					oTable.qunit.aRowsUpdatedEvents.push(oEvent.getParameter("reason"));
				});
			});

			return this.oTable;
		},
		checkRowsUpdated: function(assert, aExpectedReasons, iDelay) {
			return new Promise((resolve) => {
				setTimeout(() => {
					assert.deepEqual(this.oTable.qunit.aRowsUpdatedEvents, aExpectedReasons,
						aExpectedReasons.length > 0
							? "The event _rowsUpdated has been fired in order with reasons: " + aExpectedReasons.join(", ")
							: "The event _rowsUpdated has not been fired"
					);
					resolve();
				}, iDelay == null ? 500 : iDelay);
			});
		},
		resetRowsUpdatedSpy: function() {
			this.oTable.qunit.aRowsUpdatedEvents = [];
		}
	});

	QUnit.test("Initial rendering without binding", function(assert) {
		this.createTable({rows: ""});
		return this.checkRowsUpdated(assert, []);
	});

	QUnit.test("Initial rendering without binding in invisible container", async function(assert) {
		await TableQUnitUtils.hideTestContainer();
		this.createTable({rows: ""});
		await this.checkRowsUpdated(assert, []);
		this.resetRowsUpdatedSpy();
		await TableQUnitUtils.showTestContainer();
		await this.checkRowsUpdated(assert, []);
	});

	QUnit.test("Initial rendering with binding", function(assert) {
		this.createTable();

		return this.checkRowsUpdated(assert, [
			TableUtils.RowsUpdateReason.Render
		]);
	});

	QUnit.test("Initial rendering with binding in invisible container", async function(assert) {
		await TableQUnitUtils.hideTestContainer();
		this.createTable();
		await this.checkRowsUpdated(assert, [
			TableUtils.RowsUpdateReason.Render
		]);
		this.resetRowsUpdatedSpy();
		await TableQUnitUtils.showTestContainer();
		await this.checkRowsUpdated(assert, []);
	});

	QUnit.test("Re-render without binding", async function(assert) {
		this.createTable({rows: ""});
		await this.oTable.qunit.rendered();
		this.resetRowsUpdatedSpy();
		this.oTable.invalidate();
		await this.oTable.qunit.rendered();
		await this.checkRowsUpdated(assert, []);
	});

	QUnit.test("Re-render without binding in invisible container", async function(assert) {
		this.createTable({rows: ""});
		await this.oTable.qunit.rendered();
		this.resetRowsUpdatedSpy();
		await TableQUnitUtils.hideTestContainer();
		this.oTable.invalidate();
		await this.oTable.qunit.rendered();
		await this.checkRowsUpdated(assert, []);
		this.resetRowsUpdatedSpy();
		await TableQUnitUtils.showTestContainer();
		await this.checkRowsUpdated(assert, []);
	});

	QUnit.test("Re-render with binding", async function(assert) {
		this.createTable();
		await this.oTable.qunit.rendered();
		this.resetRowsUpdatedSpy();
		this.oTable.invalidate();
		await this.oTable.qunit.rendered();
		await this.checkRowsUpdated(assert, [
			TableUtils.RowsUpdateReason.Render
		]);
	});

	QUnit.test("Re-render with binding in invisible container", async function(assert) {
		this.createTable();
		await this.oTable.qunit.rendered();
		this.resetRowsUpdatedSpy();
		await TableQUnitUtils.hideTestContainer();
		this.oTable.invalidate();
		await this.oTable.qunit.rendered();
		await this.checkRowsUpdated(assert, [
			TableUtils.RowsUpdateReason.Render
		]);
		this.resetRowsUpdatedSpy();
		await TableQUnitUtils.showTestContainer();
		await this.checkRowsUpdated(assert, []);
	});

	QUnit.test("Sort with Table#sort", async function(assert) {
		this.createTable();

		await this.oTable.qunit.rendered();
		this.resetRowsUpdatedSpy();
		this.oTable.sort(this.oTable.getColumns()[0], "Ascending");
		await this.checkRowsUpdated(assert, [
			TableUtils.RowsUpdateReason.Render
		]);
	});

	QUnit.test("Sort with Binding#sort", async function(assert) {
		this.createTable();

		await this.oTable.qunit.rendered();
		this.resetRowsUpdatedSpy();
		this.oTable.getBinding().sort(new Sorter(this.oTable.getColumns()[0].getSortProperty()));
		await this.checkRowsUpdated(assert, [
			TableUtils.RowsUpdateReason.Sort
		]);
	});

	QUnit.test("Filter with Table#filter", async function(assert) {
		this.createTable();

		await this.oTable.qunit.rendered();
		this.resetRowsUpdatedSpy();
		this.oTable.filter(this.oTable.getColumns()[0], "test");
		await this.checkRowsUpdated(assert, [
			TableUtils.RowsUpdateReason.Render
		]);
	});

	QUnit.test("Filter with Binding#filter", async function(assert) {
		this.createTable();

		await this.oTable.qunit.rendered();
		this.resetRowsUpdatedSpy();
		this.oTable.getBinding().filter(new Filter(this.oTable.getColumns()[0].getFilterProperty(), "Contains", "test"));
		await this.checkRowsUpdated(assert, [
			TableUtils.RowsUpdateReason.Filter
		]);
	});

	QUnit.test("Unbind with showNoData=true", async function(assert) {
		this.createTable();

		await this.oTable.qunit.rendered();
		this.resetRowsUpdatedSpy();
		this.oTable.unbindRows();
		await this.checkRowsUpdated(assert, []);
	});

	QUnit.test("Unbind with showNoData=false", async function(assert) {
		this.createTable({showNoData: false});

		await this.oTable.qunit.rendered();
		this.resetRowsUpdatedSpy();
		this.oTable.unbindRows();
		await this.checkRowsUpdated(assert, [
			TableUtils.RowsUpdateReason.Unbind
		]);
	});

	QUnit.test("Unbind when invalid", async function(assert) {
		this.createTable();

		await this.oTable.qunit.rendered();
		this.resetRowsUpdatedSpy();
		this.oTable.invalidate();
		this.oTable.unbindRows();

		// Because the table was invalidated, rows will be re-rendered, clearing all modifications that were done in a "rowsUpdated" event
		// listener. It is therefore not required to fire the event because of the unbind. In general, the "rowsUpdated" event is not fired
		// if the table has no binding for the rows aggregation.
		await this.checkRowsUpdated(assert, []);
	});

	QUnit.test("Bind with client binding", async function(assert) {
		this.createTable();
		this.oBindingInfo = this.oTable.getBindingInfo("rows");

		await this.oTable.qunit.rendered();
		this.oTable.unbindRows();
		await this.oTable.qunit.rendered();
		this.resetRowsUpdatedSpy();
		this.oTable.bindRows(this.oBindingInfo);
		await this.checkRowsUpdated(assert, [
			TableUtils.RowsUpdateReason.Render
		]);
	});

	QUnit.test("Vertical scrolling", async function(assert) {
		this.createTable();

		await this.oTable.qunit.rendered();
		this.resetRowsUpdatedSpy();
		this.oTable._getScrollExtension().getVerticalScrollbar().scrollTop = 100;
		await this.checkRowsUpdated(assert, [
			TableUtils.RowsUpdateReason.VerticalScroll
		]);
	});

	QUnit.test("Change first visible row by API call (setFirstVisibleRow)", async function(assert) {
		this.createTable();

		await this.oTable.qunit.rendered();
		this.resetRowsUpdatedSpy();
		this.oTable.setFirstVisibleRow(1);
		await this.checkRowsUpdated(assert, [
			TableUtils.RowsUpdateReason.FirstVisibleRowChange
		]);
		this.resetRowsUpdatedSpy();
		this.oTable.setFirstVisibleRow();
		await this.checkRowsUpdated(assert, [
			TableUtils.RowsUpdateReason.FirstVisibleRowChange
		]);
		this.resetRowsUpdatedSpy();
		this.oTable.setFirstVisibleRow(null);
		await this.checkRowsUpdated(assert, []);
	});

	QUnit.test("Theme change", async function(assert) {
		this.createTable();

		await this.oTable.qunit.rendered();
		this.resetRowsUpdatedSpy();
		this.oTable.onThemeChanged();
		await this.oTable.qunit.rendered();
		await this.checkRowsUpdated(assert, [
			TableUtils.RowsUpdateReason.Render
		]);
	});

	return QUnit;
});