/*global QUnit, sinon */

sap.ui.define([
	"sap/ui/table/qunit/TableQUnitUtils.ODataV2",
	"sap/ui/model/Sorter",
	"sap/ui/model/Filter"
], function(TableQUnitUtils, Sorter, Filter) {
	"use strict";

	QUnit.module("Automatic deselection", {
		before: function() {
			this.oMockServer = TableQUnitUtils.startMockServer();
			this.oDataModel = TableQUnitUtils.createODataModel();

			TableQUnitUtils.setDefaultSettings({
				rows: {path: "/Products"},
				models: this.oDataModel
			});

			return this.oDataModel.metadataLoaded();
		},
		after: function() {
			this.oMockServer.destroy();
			this.oDataModel.destroy();
			TableQUnitUtils.setDefaultSettings();
		}
	});

	QUnit.test("Rebind", async function(assert) {
		const oTable = TableQUnitUtils.createTable();
		const oSelectionChangeSpy = sinon.spy();

		await oTable.qunit.rendered();
		oTable.setSelectionInterval(2, 6);
		oTable.attachRowSelectionChange(oSelectionChangeSpy);
		oTable.bindRows(oTable.getBindingInfo("rows"));
		assert.deepEqual(oTable.getSelectedIndices(), [], "Selection");
		await oTable.qunit.bindingChangeEvent();
		await oTable.qunit.rendered();
		assert.equal(oSelectionChangeSpy.callCount, 0, "rowSelectionChange event not fired");
		oTable.destroy();
	});

	QUnit.test("Unbind", async function(assert) {
		const oTable = TableQUnitUtils.createTable();
		const oSelectionChangeSpy = sinon.spy();

		await oTable.qunit.rendered();
		oTable.setSelectionInterval(2, 6);
		assert.deepEqual(oTable.getSelectedIndices(), [2, 3, 4, 5, 6], "Selection before unbind");
		oTable.attachRowSelectionChange(oSelectionChangeSpy);
		oTable.unbindRows();
		assert.deepEqual(oTable.getSelectedIndices(), [], "Selection after unbind");
		await oTable.qunit.rendered();
		assert.equal(oSelectionChangeSpy.callCount, 0, "rowSelectionChange event not fired");
		oTable.destroy();
	});

	QUnit.test("Sort", async function(assert) {
		const oTable = TableQUnitUtils.createTable();
		const oSelectionChangeSpy = sinon.spy();

		await oTable.qunit.rendered();
		oTable.setSelectionInterval(2, 6);
		oTable.attachRowSelectionChange(oSelectionChangeSpy);
		oTable.getBinding().sort(new Sorter({path: "Name"}));
		assert.deepEqual(oTable.getSelectedIndices(), [2, 3, 4, 5, 6], "Selection before binding change");
		await oTable.qunit.bindingChangeEvent();
		assert.deepEqual(oTable.getSelectedIndices(), [], "Selection after binding change");
		await oTable.qunit.rendered();
		assert.equal(oSelectionChangeSpy.callCount, 1, "rowSelectionChange event fired");
		oTable.destroy();
	});

	QUnit.test("Filter", async function(assert) {
		const oTable = TableQUnitUtils.createTable();
		const oSelectionChangeSpy = sinon.spy();

		await oTable.qunit.rendered();
		oTable.setSelectionInterval(2, 6);
		oTable.attachRowSelectionChange(oSelectionChangeSpy);
		oTable.getBinding().filter(new Filter({path: "Name", operator: "EQ", value1: "Gladiator MX"}));
		assert.deepEqual(oTable.getSelectedIndices(), [2, 3, 4, 5, 6], "Selection before binding change");
		await oTable.qunit.bindingChangeEvent();
		assert.deepEqual(oTable.getSelectedIndices(), [], "Selection after binding change");
		await oTable.qunit.rendered();
		assert.equal(oSelectionChangeSpy.callCount, 1, "rowSelectionChange event fired");
		oTable.destroy();
	});

	QUnit.test("Initial change of total number of rows", async function(assert) {
		const oTable = TableQUnitUtils.createTable((oTable) => {
			oTable.setSelectionInterval(2, 6);
		});

		await oTable.qunit.rendered();
		assert.deepEqual(oTable.getSelectedIndices(), [2, 3, 4, 5, 6], "Selection");
		oTable.destroy();
	});

	QUnit.test("Selection during rebind", async function(assert) {
		const oTable = TableQUnitUtils.createTable();

		await oTable.qunit.rendered();
		oTable.bindRows(oTable.getBindingInfo("rows"));
		oTable.setSelectionInterval(2, 6);
		await oTable.qunit.bindingChangeEvent();
		await oTable.qunit.rendered();
		assert.deepEqual(oTable.getSelectedIndices(), [2, 3, 4, 5, 6], "Selection");
		oTable.destroy();
	});

	QUnit.test("#handleKeyboardShortcut - Event Marking", async function(assert) {
		const oTable = TableQUnitUtils.createTable();
		const sEventMarker = "sapUiTableClearAll";
		const oEvent = {
			setMarked: function() {}
		};
		const oSelectionPlugin = oTable._getSelectionPlugin();
		const oClearSelectionSpy = sinon.spy(oSelectionPlugin, "clearSelection");
		const oSelectAllSpy = sinon.spy(oSelectionPlugin, "selectAll");
		const oSetMarkedSpy = sinon.spy(oEvent, "setMarked");

		await oTable.qunit.rendered();
		oSelectionPlugin.handleKeyboardShortcut("toggle", oEvent);
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
		assert.ok(oSelectAllSpy.callCount, 2, "select all called");
		assert.ok(oSetMarkedSpy.notCalled, "Event has not been marked");

		oSelectionPlugin.handleKeyboardShortcut("toggle", oEvent);
		assert.ok(oClearSelectionSpy.calledThrice, "clear all called");
		assert.ok(oSetMarkedSpy.calledOnceWithExactly(sEventMarker), `Event has been marked with ${sEventMarker}`);

		oSetMarkedSpy.reset();
		oClearSelectionSpy.reset();
		oSelectAllSpy.reset();

		oTable.destroy();
	});
});