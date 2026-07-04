/* global QUnit */

sap.ui.define([
	"sap/ui/mdc/Table",
	"sap/ui/mdc/table/TreeTableType"
], function(
	Table,
	TreeTableType
) {
	"use strict";

	QUnit.module("Inner table settings", {
		beforeEach: async function() {
			this.oTable = new Table({
				type: new TreeTableType()
			});
			await this.oTable.initialized();
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("Control types", async function(assert) {
		await this.oTable.initialized();
		assert.ok(this.oTable._oTable.isA("sap.ui.table.TreeTable"), "Inner table type is sap.ui.table.TreeTable");
	});

	QUnit.test("Flag to enable V4 support", async function(assert) {
		await this.oTable.initialized();
		assert.strictEqual(this.oTable._oTable._oProxy._bEnableV4, true, "'_bEnableV4' flag on the TreeBinding proxy");
	});

	QUnit.test("typeSettings", async function(assert) {
		await this.oTable.initialized();
		assert.deepEqual(this.oTable._oTable.getModel("$typeSettings").oData, {p13nFixedColumnCount: null},
			"TreeTable has a model with the typeSettings");
	});

	QUnit.module("API", {
		beforeEach: function() {
			this.oType = new TreeTableType();
		},
		afterEach: function() {
			this.oType.destroy();
		}
	});

	QUnit.test("createTable returns null when there is no parent", function(assert) {
		assert.strictEqual(this.oType.createTable("myId"), null);
	});

	QUnit.test("loadModules resolves immediately once the inner TreeTable module is already loaded", async function(assert) {
		// First call ensures the inner TreeTable module is loaded.
		await this.oType.loadModules();

		// Spy on sap.ui.require to ensure it is not called again for the inner TreeTable module.
		const oRequireSpy = this.spy(sap.ui, "require");

		await this.oType.loadModules();

		const bRequiredTreeTable = oRequireSpy.getCalls().some((oCall) => {
			return Array.isArray(oCall.args[0]) && oCall.args[0].includes("sap/ui/table/TreeTable");
		});
		assert.notOk(bRequiredTreeTable, "sap.ui.require was not called again for sap/ui/table/TreeTable");
	});
});
