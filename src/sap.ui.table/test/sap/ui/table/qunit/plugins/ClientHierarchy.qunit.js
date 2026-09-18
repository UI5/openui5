/*global QUnit */

sap.ui.define([
	"sap/ui/table/qunit/TableQUnitUtils",
	"sap/ui/table/Table",
	"sap/ui/table/TreeTable",
	"sap/ui/table/plugins/ClientHierarchy",
	"sap/ui/table/utils/TableUtils",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/ClientTreeBindingAdapter"
], function(
	TableQUnitUtils,
	Table,
	TreeTable,
	ClientHierarchy,
	TableUtils,
	JSONModel,
	ClientTreeBindingAdapter
) {
	"use strict";

	TableQUnitUtils.setDefaultSettings({
		models: new JSONModel({
			root: {
				0: {
					name: "item1",
					0: {
						name: "subitem1-1",
						0: {name: "subsubitem1-1-1"},
						1: {name: "subsubitem1-1-2"}
					},
					1: {
						name: "subitem1-2",
						0: {name: "subsubitem1-2-1"}
					}
				},
				1: {
					name: "item2",
					0: {name: "subitem2-1"}
				},
				2: {
					name: "item3"
				}
			}
		}),
		rows: {path: "/root", parameters: {numberOfExpandedLevels: 2}},
		columns: [TableQUnitUtils.createTextColumn({text: "name", bind: true})],
		dependents: [new ClientHierarchy()]
	});

	QUnit.module("API", {
		beforeEach: function() {
			this.oTable = TableQUnitUtils.createTable();
			this.oPlugin = this.oTable.getDependents()[0];
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test(".findOn", function(assert) {
		assert.ok(ClientHierarchy.findOn(this.oTable) === this.oPlugin, "Plugin found");
	});

	QUnit.module("isApplicable");

	QUnit.test("Applied to a Table", function(assert) {
		const oPlugin = new ClientHierarchy();

		this.oTable = new Table({
			dependents: [oPlugin]
		});

		assert.ok(oPlugin.isActive(), "Plugin is applicable and active on sap.ui.table.Table");

		this.oTable.destroy();
	});

	QUnit.test("Applied to a TreeTable", function(assert) {
		assert.throws(() => {
			this.oTreeTable = new TreeTable({
				dependents: [new ClientHierarchy()]
			});
		}, "Plugin is not applicable to sap.ui.table.TreeTable");
	});

	QUnit.module("Activation and deactivation", {
		beforeEach: function() {
			this.oTable = TableQUnitUtils.createTable();
			this.oPlugin = this.oTable.getDependents()[0];
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("The binding is a ClientTreeBinding when the plugin is active", function(assert) {
		assert.ok(this.oTable.getBinding().isA("sap.ui.model.ClientTreeBinding"), "rows binding is a ClientTreeBinding when the plugin is active");
	});

	QUnit.test("getBinding applies the adapter to the rows binding lazily and only once", function(assert) {
		this.oTable.removeDependent(this.oPlugin);
		this.oTable.unbindRows();
		this.oTable.addDependent(this.oPlugin);

		const oSpy = this.spy(ClientTreeBindingAdapter, "apply");
		this.oTable.bindRows({path: "/root"});

		const oBinding = this.oTable.getBinding("rows");
		assert.ok(oSpy.calledOnceWithExactly(oBinding), "Adapter applied once to the rows binding on first call");

		oSpy.resetHistory();
		this.oTable.getBinding("rows");
		assert.ok(oSpy.notCalled, "Adapter not re-applied on a second rows getBinding call");

		this.stub(this.oTable, "getBinding").withArgs("columns").returns({});
		this.oTable.getBinding("columns");
		assert.ok(oSpy.notCalled, "Adapter not applied for a non-rows aggregation");
	});

	QUnit.test("getBinding with no argument returns the rows binding", function(assert) {
		assert.strictEqual(this.oTable.getBinding(), this.oTable.getBinding("rows"), "No argument is treated as 'rows'");
	});

	QUnit.test("getBinding returns the binding for the specified aggregation", function(assert) {
		this.stub(Table.prototype, "getBinding").withArgs("columns").returns("columnsBinding");
		assert.strictEqual(this.oTable.getBinding("columns"), "columnsBinding", "Returns the columns binding");
	});

	QUnit.test("Setting a new model rebinds to a ClientTreeBinding", function(assert) {
		const oNewModel = new JSONModel({root: {0: {name: "item1"}}});
		this.oTable.setModel(oNewModel);

		assert.ok(this.oTable.getBinding().isA("sap.ui.model.ClientTreeBinding"), "rows binding is a ClientTreeBinding after setModel");
		assert.ok("getLength" in this.oTable.getBinding(), "Adapter is applied to the new binding");
	});

	QUnit.test("Hierarchy mode is 'Tree' when the plugin is active", function(assert) {
		assert.strictEqual(TableUtils.Grouping.getHierarchyMode(this.oTable), TableUtils.Grouping.HierarchyMode.Tree);
	});

	QUnit.test("Hierarchy mode is 'Flat' after deactivation", function(assert) {
		this.oPlugin.setEnabled(false);
		assert.strictEqual(TableUtils.Grouping.getHierarchyMode(this.oTable), TableUtils.Grouping.HierarchyMode.Flat);
	});

	QUnit.test("isTreeBinding override is removed after deactivation", function(assert) {
		this.oPlugin.setEnabled(false);
		assert.notOk(Object.hasOwn(this.oTable, "isTreeBinding"), "isTreeBinding instance override is deleted");
		assert.notOk(this.oTable.isTreeBinding("rows"), "rows aggregation is no longer reported as a tree binding");
	});

	QUnit.test("isTreeBinding returns false for non-rows aggregations while the plugin is active", function(assert) {
		assert.notOk(this.oTable.isTreeBinding("columns"), "isTreeBinding returns false for non-rows aggregation");
	});

	QUnit.test("getBinding override is removed after deactivation", function(assert) {
		this.oPlugin.setEnabled(false);
		assert.notOk(Object.hasOwn(this.oTable, "getBinding"), "getBinding instance override is deleted");
	});

	QUnit.test("Tree binding is replaced with a list binding after deactivation", function(assert) {
		this.oPlugin.setEnabled(false);
		assert.notOk(this.oTable.getBinding().isA("sap.ui.model.ClientTreeBinding"),
			"rows binding is no longer a ClientTreeBinding after deactivation");
	});

	QUnit.module("Validation of model and binding types", {
		beforeEach: function() {
			this.oTable = TableQUnitUtils.createTable();
			this.oPlugin = this.oTable.getDependents()[0];
		},
		afterEach: function() {
			this.oTable.destroy();
		},
		makeModelUnsupported: function() {
			const oModel = this.oTable.getModel();
			const oStub = this.stub(oModel, "isA");
			oStub.callsFake((sType) => (sType === "sap.ui.model.ClientModel" ? false : oStub.wrappedMethod.call(oModel, sType)));
		}
	});

	QUnit.test("No error when the table is not bound", function(assert) {
		this.oTable.removeDependent(this.oPlugin);
		this.oTable.unbindRows();
		this.oTable.addDependent(this.oPlugin);
		assert.ok(true, "No error thrown");
	});

	QUnit.test("No error when the table has no model", function(assert) {
		this.oTable.removeDependent(this.oPlugin);
		this.oTable.unbindRows();
		this.oTable.setModel(null);
		this.oTable.addDependent(this.oPlugin);
		assert.ok(true, "No error thrown");
	});

	QUnit.test("Applying the plugin when already bound to an unsupported model throws", function(assert) {
		this.oTable.removeDependent(this.oPlugin);
		this.makeModelUnsupported();

		assert.throws(() => {
			this.oTable.addDependent(this.oPlugin);
		}, new Error("Only sap.ui.model.ClientModel is supported"), "Throws at activation for an unsupported model");
	});

	QUnit.test("Binding rows to an unsupported model throws", function(assert) {
		this.makeModelUnsupported();

		assert.throws(() => {
			this.oTable.bindRows({path: "/root"});
		}, new Error("Only sap.ui.model.ClientModel is supported"));
	});

	QUnit.test("Setting an unsupported model throws", function(assert) {
		const oUnsupportedModel = new JSONModel({root: {}});
		const oStub = this.stub(oUnsupportedModel, "isA");
		oStub.callsFake((sType) => (sType === "sap.ui.model.ClientModel" ? false : oStub.wrappedMethod.call(oUnsupportedModel, sType)));

		assert.throws(() => {
			this.oTable.setModel(oUnsupportedModel);
		}, new Error("Only sap.ui.model.ClientModel is supported"));
	});

	QUnit.test("Binding rows to a ClientModel whose bindTree does not return a ClientTreeBinding throws", function(assert) {
		const oModel = this.oTable.getModel();
		const oStub = this.stub(oModel, "bindTree").callsFake((...args) => {
			const oBinding = oStub.wrappedMethod.apply(oModel, args);
			const oIsAStub = this.stub(oBinding, "isA");
			oIsAStub.callsFake((sType) => (sType === "sap.ui.model.ClientTreeBinding" ? false : oIsAStub.wrappedMethod.call(oBinding, sType)));
			return oBinding;
		});

		assert.throws(() => {
			this.oTable.bindRows({path: "/root"});
		}, new Error("Only sap.ui.model.ClientTreeBinding is supported"));
	});

	QUnit.test("Validation is no longer active after deactivation", function(assert) {
		this.oPlugin.setEnabled(false);

		const oModel = this.oTable.getModel();
		const oStub = this.stub(oModel, "bindList").callsFake((...args) => {
			const oBinding = oStub.wrappedMethod.apply(oModel, args);
			const oIsAStub = this.stub(oBinding, "isA");
			oIsAStub.callsFake((sType) => (sType === "sap.ui.model.ClientTreeBinding" ? false : oIsAStub.wrappedMethod.call(oBinding, sType)));
			return oBinding;
		});

		this.oTable.bindRows({path: "/root"});
		assert.ok(true, "No error thrown after deactivation");
	});

	QUnit.module("tolerateUnsupportedModel = true", {
		beforeEach: function() {
			this.oTable = TableQUnitUtils.createTable({
				rows: null,
				dependents: [new ClientHierarchy({tolerateUnsupportedModel: true})]
			});
			this.oPlugin = this.oTable.getDependents()[0];
		},
		afterEach: function() {
			this.oTable.destroy();
		},
		makeModelUnsupported: function() {
			const oModel = this.oTable.getModel();
			const oStub = this.stub(oModel, "isA");
			oStub.callsFake((sType) => (sType === "sap.ui.model.ClientModel" ? false : oStub.wrappedMethod.call(oModel, sType)));
		}
	});

	QUnit.test("Bound to an unsupported model", function(assert) {
		this.makeModelUnsupported();
		this.oTable.bindRows({path: "/root"});

		assert.ok(this.oPlugin.isActive(), "Plugin stays applied and active");
		assert.notOk(this.oTable.getBinding().isA("sap.ui.model.ClientTreeBinding"), "rows binding is a list binding");
		assert.notOk("getNodes" in this.oTable.getBinding(), "ClientTreeBindingAdapter is not applied to the list binding");
		assert.strictEqual(TableUtils.Grouping.getHierarchyMode(this.oTable), TableUtils.Grouping.HierarchyMode.Flat, "Hierarchy mode");
		assert.notOk(this.oTable.isTreeBinding("rows"), "isTreeBinding");
	});

	QUnit.test("Activated while already bound to an unsupported model", function(assert) {
		this.oTable.removeDependent(this.oPlugin);
		this.makeModelUnsupported();
		this.oTable.bindRows({path: "/root"});
		this.oTable.addDependent(this.oPlugin);

		assert.ok(this.oPlugin.isActive(), "Plugin stays applied and active");
		assert.notOk(this.oTable.getBinding().isA("sap.ui.model.ClientTreeBinding"), "rows binding is a list binding");
		assert.notOk("getNodes" in this.oTable.getBinding(), "ClientTreeBindingAdapter is not applied to the list binding");
		assert.strictEqual(TableUtils.Grouping.getHierarchyMode(this.oTable), TableUtils.Grouping.HierarchyMode.Flat, "Hierarchy mode");
		assert.notOk(this.oTable.isTreeBinding("rows"), "isTreeBinding");
	});

	QUnit.test("Switching from an unsupported to a supported model enables the tree binding", function(assert) {
		this.makeModelUnsupported();
		this.oTable.bindRows({path: "/root"});
		assert.notOk(this.oTable.getBinding().isA("sap.ui.model.ClientTreeBinding"), "List binding for the unsupported model");
		assert.strictEqual(TableUtils.Grouping.getHierarchyMode(this.oTable), TableUtils.Grouping.HierarchyMode.Flat, "Hierarchy mode");

		this.oTable.getModel().isA.restore();
		this.oTable.bindRows({path: "/root"});

		assert.ok(this.oTable.getBinding().isA("sap.ui.model.ClientTreeBinding"), "Tree binding after switching to a supported model");
		assert.strictEqual(TableUtils.Grouping.getHierarchyMode(this.oTable), TableUtils.Grouping.HierarchyMode.Tree, "Hierarchy mode");
	});

	QUnit.test("Row state defaults are preserved for an unsupported model", async function(assert) {
		// Use a fresh model so contexts are not shared with other tests (the default settings
		// model is reused, and previously stamped hierarchy info would contaminate this test).
		const oFreshModel = new JSONModel({root: {0: {name: "item1"}, 1: {name: "item2"}}});
		this.oTable.setModel(oFreshModel);

		this.makeModelUnsupported();
		this.oTable.bindRows({path: "/root"});

		await this.oTable.qunit.rendered();

		const aRows = this.oTable.getRows().filter((oRow) => oRow.getBindingContext());

		assert.ok(aRows.length > 0, "Table has bound rows");
		aRows.forEach((oRow) => {
			assert.strictEqual(oRow.getLevel(), 1, `Row ${oRow.getId()} level is flat-list default 1`);
			assert.notOk(oRow.isExpandable(), `Row ${oRow.getId()} is not expandable`);
			assert.notOk(oRow.isExpanded(), `Row ${oRow.getId()} is not expanded`);
		});
	});

	QUnit.module("Row state", {
		beforeEach: async function() {
			this.oTable = TableQUnitUtils.createTable();
			await this.oTable.qunit.rendered();
		},
		afterEach: function() {
			this.oTable.destroy();
		},
		assertRowState: function(oRow, mState) {
			QUnit.assert.deepEqual({
				type: oRow.getType(),
				level: oRow.getLevel(),
				expandable: oRow.isExpandable(),
				expanded: oRow.isExpanded()
			}, mState, `State of row ${oRow.getId()}`);
		}
	});

	QUnit.test("After rendering", function(assert) {
		const aRows = this.oTable.getRows();

		// With numberOfExpandedLevels: 2, levels 1 and 2 are auto-expanded.
		// Flattened visible rows:
		//   0: item1              level 1, expandable, expanded
		//   1:   subitem1-1       level 2, expandable, expanded
		//   2:     subsubitem1-1-1 level 3, leaf
		this.assertRowState(aRows[0], {type: "Standard", level: 1, expandable: true, expanded: true});
		this.assertRowState(aRows[1], {type: "Standard", level: 2, expandable: true, expanded: true});
		this.assertRowState(aRows[2], {type: "Standard", level: 3, expandable: false, expanded: false});
	});

	QUnit.test("No error when the table has no rows", async function(assert) {
		// Exercises the aContexts.length === 0 early return in the _getContexts override.
		const oTable = TableQUnitUtils.createTable({
			rows: {path: "/empty"},
			models: new JSONModel({empty: {}})
		});
		await oTable.qunit.rendered();
		assert.strictEqual(oTable.getRows().filter((oRow) => oRow.getBindingContext()).length, 0, "No bound rows");
		oTable.destroy();
	});

	QUnit.test("Row states when the plugin is activated before the rows are bound", async function() {
		const oTable = TableQUnitUtils.createTable({
			rows: null
		}, (oTable) => {
			oTable.bindRows({
				path: "/root",
				parameters: {numberOfExpandedLevels: 1}
			});
		});

		await oTable.qunit.rendered();

		// Flattened visible rows (numberOfExpandedLevels: 1):
		//   0: item1       level 1, expandable, EXPANDED
		//   1: subitem1-1  level 2, expandable, COLLAPSED   (has children)
		//   2: subitem1-2  level 2, expandable, COLLAPSED   (has children)
		//   3: item2       level 1, expandable, EXPANDED    (has children, all level-0 nodes auto-expanded)
		const aRows = oTable.getRows();
		this.assertRowState(aRows[0], {type: "Standard", level: 1, expandable: true, expanded: true});
		this.assertRowState(aRows[1], {type: "Standard", level: 2, expandable: true, expanded: false});
		this.assertRowState(aRows[2], {type: "Standard", level: 2, expandable: true, expanded: false});
		this.assertRowState(aRows[3], {type: "Standard", level: 1, expandable: true, expanded: true});

		oTable.destroy();
	});

	QUnit.test("Row state is correct after rebinding", async function() {
		this.oTable.bindRows({path: "/root", parameters: {numberOfExpandedLevels: 0}});
		await this.oTable.qunit.rendered();

		// With numberOfExpandedLevels: 0, only root nodes are visible and collapsed.
		this.assertRowState(this.oTable.getRows()[0], {type: "Standard", level: 1, expandable: true, expanded: false});
	});

	QUnit.module("Expand/Collapse", {
		beforeEach: async function() {
			this.oTable = TableQUnitUtils.createTable();
			await this.oTable.qunit.rendered();
			this.oBinding = this.oTable.getBinding();
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("Row#expand delegates to the binding", function(assert) {
		const oRow = this.oTable.getRows()[1]; // subitem1-1, expandable
		const oExpandSpy = this.spy(this.oBinding, "expand");

		this.stub(oRow, "isExpanded").returns(false);
		oRow.expand();

		assert.ok(oExpandSpy.calledOnceWithExactly(oRow.getIndex()), "Binding#expand called with the row index");
	});

	QUnit.test("Row#collapse delegates to the binding", function(assert) {
		const oRow = this.oTable.getRows()[1]; // subitem1-1, expandable and expanded
		const oCollapseSpy = this.spy(this.oBinding, "collapse");

		oRow.collapse();

		assert.ok(oCollapseSpy.calledOnceWithExactly(oRow.getIndex()), "Binding#collapse called with the row index");
	});
});