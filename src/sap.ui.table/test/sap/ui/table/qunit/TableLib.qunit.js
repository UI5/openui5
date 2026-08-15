/*global QUnit */

sap.ui.define(["sap/ui/core/Lib"], function(Library) {
	"use strict";

	QUnit.module("Library", {});

	QUnit.test("load", async function(assert) {
		try {
			await Library.load("sap.ui.table");
			const tableNamespace = sap.ui.require("sap/ui/table/library");
			assert.ok(!!tableNamespace, "Table Lib loaded");
		} catch (e) {
			assert.ok(false, "Fail on load");
		}
	});

	/**
	 * @deprecated As of version 1.118
	 */
	QUnit.test("TableHelper", function(assert) {
		assert.expect(5);

		const tableNamespace = sap.ui.require("sap/ui/table/library");
		const oHelper = tableNamespace.TableHelper;

		assert.ok(!!oHelper, "TableHelper exists");
		assert.ok(!oHelper.bFinal, "TableHelper is not final");
		assert.equal(oHelper.addTableClass(), "", "TableHelper.addTableClass");
		try {
			oHelper.createLabel();
		} catch (e) {
			assert.ok(true, "TableHelper.createLabel");
		}
		try {
			oHelper.createTextView();
		} catch (e) {
			assert.ok(true, "TableHelper.createTextView");
		}
	});
});