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
});