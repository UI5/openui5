sap.ui.define([
	"sap/ui/table/qunit/TableQUnitUtils",
	"sap/ui/table/plugins/PluginBase"
], function(
	TableQUnitUtils,
	PluginBase
) {
	"use strict";

	const QUnit = TableQUnitUtils.createQUnitTestCollector();

	QUnit.module("Row count constraints", {
		beforeEach: function() {
			this.oTable = TableQUnitUtils.createTable({
				rows: {path: "/"},
				models: TableQUnitUtils.createJSONModelWithEmptyRows(100),
				columns: [TableQUnitUtils.createTextColumn()]
			});
			this.oRowMode = this.oTable.getRowMode();
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("Force fixed rows", async function(assert) {
		this.oTable._setRowCountConstraints({fixedTop: true, fixedBottom: true});

		await this.oTable.qunit.rendered();
		TableQUnitUtils.assertRenderedRows(assert, this.oTable, 1, 8, 1);
	});

	QUnit.test("Disable fixed rows", async function(assert) {
		this.oRowMode.setFixedTopRowCount(2);
		this.oRowMode.setFixedBottomRowCount(2);
		this.oTable._setRowCountConstraints({fixedTop: false, fixedBottom: false});

		await this.oTable.qunit.rendered();
		TableQUnitUtils.assertRenderedRows(assert, this.oTable, 0, 10, 0);
	});

	QUnit.test("Change constraints", async function(assert) {
		this.oRowMode.setFixedTopRowCount(2);
		this.oRowMode.setFixedBottomRowCount(2);
		this.oTable._setRowCountConstraints({fixedTop: false, fixedBottom: false});

		await this.oTable.qunit.rendered();
		this.oTable._setRowCountConstraints({fixedTop: false});
		await this.oTable.qunit.rendered();
		TableQUnitUtils.assertRenderedRows(assert, this.oTable, 0, 8, 2);
	});

	return QUnit;
});