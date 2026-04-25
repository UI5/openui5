/* global QUnit, sinon */
sap.ui.define([
	"sap/ui/mdc/Table",
	"sap/ui/mdc/table/Column",
	"sap/m/Text",
	"sap/ui/core/TooltipBase",
	"sap/ui/test/utils/nextUIUpdate"
], function(
	Table,
	Column,
	Text,
	TooltipBase,
	nextUIUpdate
) {
	"use strict";

	QUnit.module("Lifecycle", {
		beforeEach: function() {
			this.oColumn = new Column();
		},
		afterEach: function() {
			this.oColumn.destroy();
		}
	});

	QUnit.test("Initialize skip propagation", function(assert) {
		assert.deepEqual(this.oColumn.mSkipPropagation, {
			template: true,
			creationTemplate: true
		}, "Skip propagation is correctly initialized for template aggregations");
	});

	QUnit.test("Destroy", async function(assert) {
		this.oColumn.setTemplate(new Text());

		const oTable = new Table();
		oTable.addColumn(this.oColumn);
		await oTable.initialized();

		const oInnerColumn = this.oColumn.getInnerColumn();
		const oTemplateClone = this.oColumn.getTemplateClone();
		const oHeaderLabel = this.oColumn.getHeaderLabel();

		this.oColumn.destroy();
		assert.ok(oInnerColumn.isDestroyed(), "Inner column is destroyed");
		assert.ok(oTemplateClone.isDestroyed(), "Template clone is destroyed");
		assert.ok(oHeaderLabel.isDestroyed(), "Header label is destroyed");

		oTable.destroy();
	});

	QUnit.test("Destroy with pending deferred disconnect", async function(assert) {
		const oTable = new Table();
		oTable.addColumn(this.oColumn);
		await oTable.initialized();

		const oInnerColumn = this.oColumn.getInnerColumn();
		oTable.removeColumn(this.oColumn);
		assert.ok(!!this.oColumn._iDeferredParentChangeTimer, "Deferred disconnect timer is pending");

		this.oColumn.destroy();
		assert.ok(!this.oColumn._iDeferredParentChangeTimer, "Deferred disconnect timer is cleared");
		assert.ok(oInnerColumn.isDestroyed(), "Inner column is destroyed");

		oTable.destroy();
	});

	QUnit.module("API", {
		beforeEach: function() {
			this.oColumn = new Column();
		},
		afterEach: function() {
			this.oColumn.destroy();
		}
	});

	QUnit.test("getInnerColumn", async function(assert) {
		const oTable = new Table();

		assert.notOk(!!this.oColumn.getInnerColumn(), "No parent: #getInnerColumn does not return a column");

		oTable.addColumn(this.oColumn);
		await oTable.initialized();
		const oInnerColumn = this.oColumn.getInnerColumn();
		assert.ok(!!oInnerColumn, "Child of an initialized table: Inner column exists");
		assert.strictEqual(this.oColumn.getInnerColumn(), oInnerColumn, "Returns the cached inner column");

		oInnerColumn.destroy();
		const oNewInnerColumn = this.oColumn.getInnerColumn();
		assert.ok(!!oNewInnerColumn, "Creates a new inner column if the current one is destroyed");
		assert.notStrictEqual(oNewInnerColumn, oInnerColumn, "New inner column is a different instance");

		oTable.destroy();
	});

	QUnit.test("getTemplateClone", function(assert) {
		this.oColumn.setTemplate(new Text());

		assert.ok(!this.oColumn._oTemplateClone, "No template clone exists initially");

		const oTemplateClone = this.oColumn.getTemplateClone();
		assert.strictEqual(this.oColumn._oTemplateClone, oTemplateClone, "Reference to the template clone is saved");
		assert.strictEqual(this.oColumn.getTemplateClone(), oTemplateClone, "Existing template clone is returned");
		assert.notStrictEqual(this.oColumn.getTemplate(), oTemplateClone, "Template and clone are different instances");

		this.oColumn.destroy();
		assert.ok(oTemplateClone.isDestroyed(), "The template clone was destroyed");
		assert.ok(!this.oColumn._oTemplateClone, "Reference to the template clone is removed");
	});

	QUnit.test("getHeaderLabel", function(assert) {
		assert.ok(!this.oColumn._oColumnHeaderLabel, "No header label exists initially");

		const oHeaderLabel = this.oColumn.getHeaderLabel();

		assert.ok(oHeaderLabel.isA("sap.ui.mdc.table.ColumnHeaderLabel"), "Returns an instance of sap.ui.mdc.table.ColumnHeaderLabel");
		assert.strictEqual(this.oColumn._oColumnHeaderLabel, oHeaderLabel, "Reference to the header label is saved");
		assert.strictEqual(this.oColumn.getHeaderLabel(), oHeaderLabel, "Existing header label is returned");

		oHeaderLabel.destroy();
		const oNewHeaderLabel = this.oColumn.getHeaderLabel({text: "myLabelText"});
		assert.notStrictEqual(oNewHeaderLabel, oHeaderLabel, "A new header label is created after destroying the old one");
		assert.strictEqual(this.oColumn._oColumnHeaderLabel, oNewHeaderLabel, "Reference to the new header label is saved");
		assert.equal(oNewHeaderLabel.getLabel().getText(), "myLabelText", "Settings (here 'text') are passed to the label control");

		this.oColumn.destroy();
		assert.ok(oNewHeaderLabel.isDestroyed(), "Column destroyed: The header label was destroyed");
		assert.ok(!this.oColumn._oColumnHeaderLabel, "Column destroyed: Reference to the header label is removed");
	});

	QUnit.test("setTooltip", function(assert) {
		const oTooltip = new TooltipBase();

		this.oColumn.setTooltip(oTooltip);
		assert.equal(this.oColumn.getTooltip(), null, "TooltipBase is not supported");

		oTooltip.destroy();
	});

	QUnit.module("Connect and disconnect", {
		beforeEach: function() {
			this.oColumn = new Column();
		},
		afterEach: function() {
			this.oColumn?.destroy();
		}
	});

	QUnit.test("Add to table", function(assert) {
		const oTable = new Table();
		const oConnectSpy = sinon.spy(Column.prototype, "_connectToTable");
		const oDisconnectSpy = sinon.spy(Column.prototype, "_disconnectFromTable");

		oTable.addColumn(this.oColumn);
		assert.ok(oConnectSpy.calledOnce, "_connectToTable called");
		assert.ok(oDisconnectSpy.notCalled, "_disconnectFromTable not called");

		oConnectSpy.restore();
		oDisconnectSpy.restore();
		oTable.destroy();
	});

	QUnit.test("Remove from table", async function(assert) {
		const oTable = new Table();
		oTable.addColumn(this.oColumn);
		await oTable.initialized();

		const oInnerColumn = this.oColumn.getInnerColumn();
		const oConnectSpy = sinon.spy(Column.prototype, "_connectToTable");
		const oDisconnectSpy = sinon.spy(Column.prototype, "_disconnectFromTable");

		oTable.removeColumn(this.oColumn);
		assert.ok(oConnectSpy.notCalled, "_connectToTable not called");
		assert.ok(oDisconnectSpy.notCalled, "_disconnectFromTable not called synchronously");
		assert.ok(!oInnerColumn.isDestroyed(), "Inner column not yet destroyed");

		await new Promise(function(resolve) { setTimeout(resolve, 0); });
		assert.ok(oDisconnectSpy.calledOnce, "_disconnectFromTable called after deferred disconnect");
		assert.ok(oInnerColumn.isDestroyed(), "Inner column destroyed");

		oConnectSpy.restore();
		oDisconnectSpy.restore();
		oTable.destroy();
	});

	QUnit.test("Move within same table", async function(assert) {
		const oTable = new Table();
		oTable.addColumn(this.oColumn);
		await oTable.initialized();

		const oInnerColumn = this.oColumn.getInnerColumn();
		const oConnectSpy = sinon.spy(Column.prototype, "_connectToTable");
		const oDisconnectSpy = sinon.spy(Column.prototype, "_disconnectFromTable");

		oTable.removeColumn(this.oColumn);
		oTable.insertColumn(this.oColumn, 0);
		assert.ok(oConnectSpy.notCalled, "_connectToTable not called");
		assert.ok(oDisconnectSpy.notCalled, "_disconnectFromTable not called");
		assert.strictEqual(this.oColumn.getInnerColumn(), oInnerColumn, "Inner column is reused");

		await new Promise(function(resolve) { setTimeout(resolve, 0); });
		assert.ok(oDisconnectSpy.notCalled, "_disconnectFromTable not called after timeout");
		assert.ok(!oInnerColumn.isDestroyed(), "Inner column still alive");

		oConnectSpy.restore();
		oDisconnectSpy.restore();
		oTable.destroy();
	});

	QUnit.test("Move to different table", async function(assert) {
		const oTable1 = new Table();
		const oTable2 = new Table();
		oTable1.addColumn(this.oColumn);
		await oTable1.initialized();
		await oTable2.initialized();

		const oInnerColumn = this.oColumn.getInnerColumn();
		const oConnectSpy = sinon.spy(Column.prototype, "_connectToTable");
		const oDisconnectSpy = sinon.spy(Column.prototype, "_disconnectFromTable");

		oTable1.removeColumn(this.oColumn);
		oTable2.addColumn(this.oColumn);
		assert.ok(oDisconnectSpy.calledOnce, "_disconnectFromTable called synchronously");
		assert.ok(oConnectSpy.calledOnce, "_connectToTable called synchronously");
		assert.ok(oInnerColumn.isDestroyed(), "Old inner column is destroyed");
		assert.ok(!!this.oColumn.getInnerColumn(), "New inner column exists");
		assert.notStrictEqual(this.oColumn.getInnerColumn(), oInnerColumn, "New inner column is a different instance");

		oConnectSpy.restore();
		oDisconnectSpy.restore();
		oTable1.destroy();
		oTable2.destroy();
	});

	QUnit.test("Remove all from table", async function(assert) {
		const oTable = new Table();
		const oColumn2 = new Column();
		oTable.addColumn(this.oColumn);
		oTable.addColumn(oColumn2);
		await oTable.initialized();

		const oInnerColumn1 = this.oColumn.getInnerColumn();
		const oInnerColumn2 = oColumn2.getInnerColumn();
		const oDisconnectSpy = sinon.spy(Column.prototype, "_disconnectFromTable");

		const aRemoved = oTable.removeAllColumns();
		assert.equal(aRemoved.length, 2, "Two columns returned");
		assert.ok(oDisconnectSpy.notCalled, "_disconnectFromTable not called synchronously");

		await new Promise(function(resolve) { setTimeout(resolve, 0); });
		assert.ok(oDisconnectSpy.calledTwice, "_disconnectFromTable called for each column after deferred disconnect");
		assert.ok(oInnerColumn1.isDestroyed(), "First inner column destroyed");
		assert.ok(oInnerColumn2.isDestroyed(), "Second inner column destroyed");

		oDisconnectSpy.restore();
		oColumn2.destroy();
		oTable.destroy();
	});

	QUnit.module("sap.ui.mdc.table.ColumnHeaderLabel", {
		beforeEach: function() {
			this.oColumn = new Column();
		},
		afterEach: function() {
			this.oColumn.destroy();
		}
	});

	QUnit.test("API", function(assert) {
		const oHeaderLabel = this.oColumn.getHeaderLabel();
		const oLabel = oHeaderLabel.getLabel();

		assert.ok(oLabel.isA("sap.m.Label"), "Label control is a sap.m.Label");

		this.stub(oLabel, "getText").returns("myHeaderText");
		this.stub(oLabel, "clone").returns("myClone");
		this.stub(oLabel, "getRequired").returns("myRequired");
		this.stub(oLabel, "getAccessibilityInfo").returns("myAccInfo");
		this.spy(oLabel, "setIsInColumnHeaderContext");

		assert.strictEqual(oHeaderLabel.getText(), "myHeaderText", "#getText calls Label#getText");
		assert.strictEqual(oHeaderLabel.clone(), "myClone", "#clone calls Label#clone");
		assert.strictEqual(oHeaderLabel.getRequired(), "myRequired", "#getRequired calls Label#getRequired");
		assert.deepEqual(oHeaderLabel.getAccessibilityInfo(), "myAccInfo", "#getAccessibilityInfo calls Label#getAccessibilityInfo");
		oHeaderLabel.setIsInColumnHeaderContext(true);
		assert.ok(oLabel.setIsInColumnHeaderContext.calledWithExactly(true), "Label#setIsInColumnHeaderContext called with true");

		oHeaderLabel.destroy();
		assert.strictEqual(oHeaderLabel.getText(), undefined, "Destroyed: #getText call");
		assert.strictEqual(oHeaderLabel.clone(), undefined, "Destroyed: #clone call");
		assert.strictEqual(oHeaderLabel.getRequired(), undefined, "Destroyed: #getRequired call");
		assert.deepEqual(oHeaderLabel.getAccessibilityInfo(), undefined, "Destroyed: #getAccessibilityInfo call");
		oHeaderLabel.setIsInColumnHeaderContext(true); // Should not throw error
	});

	QUnit.test("Label settings with default column settings", async function(assert) {
		const oTable = new Table({columns: this.oColumn});
		await oTable.initialized();

		const oLabel = this.oColumn.getHeaderLabel().getLabel();

		assert.ok(oLabel.isA("sap.m.Label"), "Label control is a sap.m.Label");
		assert.equal(oLabel.getWidth(), "100%", "width");
		assert.equal(oLabel.getText(), "", "text");
		assert.equal(oLabel.getTextAlign(), "Begin", "textAlign");
		assert.equal(oLabel.getRequired(), false, "required");
	});

	QUnit.test("Label settings after changing column properties", async function(assert) {
		const oTable = new Table({columns: this.oColumn});
		await oTable.initialized();

		const oLabel = this.oColumn.getHeaderLabel().getLabel();

		this.oColumn.setHeader("Text1");
		assert.equal(oLabel.getText(), "Text1", "Change 'header': text");

		this.oColumn.setHAlign("Center");
		assert.equal(oLabel.getTextAlign(), "Center", "Change 'hAlign': textAlign");

		this.oColumn.setRequired(true);
		assert.equal(oLabel.getRequired(), true, "Change 'required': required");

		this.oColumn.setHeaderVisible(false);
		assert.equal(oLabel.getWidth(), "0px", "Set 'headerVisible' to false: width");

		this.oColumn.setHeaderVisible(true);
		assert.equal(oLabel.getWidth(), "100%", "Set 'headerVisible' to true: width");

		oTable.destroy();
	});

	QUnit.test("Rendering", async function(assert) {
		const oHeaderLabel = this.oColumn.getHeaderLabel();

		oHeaderLabel.placeAt("qunit-fixture");
		await nextUIUpdate();

		assert.ok(oHeaderLabel.getDomRef(), "Header label is rendered");
		assert.ok(oHeaderLabel.getDomRef().contains(this.oColumn.getDomRef()), "Column is rendered in header label");
		assert.ok(oHeaderLabel.getDomRef().contains(oHeaderLabel.getLabel().getDomRef()), "Label is rendered in header label");
	});
});