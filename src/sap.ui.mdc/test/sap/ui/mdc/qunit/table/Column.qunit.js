/* global QUnit */
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

	QUnit.module("Initialization", {
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
		let oInnerColumn;

		assert.ok(!this.oColumn._oInnerColumn, "No parent: Inner column does not exist");

		oTable.addColumn(this.oColumn);
		await oTable.initialized();
		assert.ok(!!this.oColumn._oInnerColumn, "Child of an initialized table: Inner column exists");
		assert.strictEqual(this.oColumn.getInnerColumn(), this.oColumn._oInnerColumn, "#getInnerColumn returns the inner column");

		oInnerColumn = this.oColumn.getInnerColumn();
		oTable.insertColumn(this.oColumn, 0);
		assert.ok(oInnerColumn.isDestroyed(), "Remove from table and add back to the same table: Old inner column is destroyed");
		assert.notStrictEqual(this.oColumn.getInnerColumn(), oInnerColumn, "#getInnerColumn returns a new inner column");

		oInnerColumn = this.oColumn.getInnerColumn();
		oTable.removeColumn(this.oColumn);
		assert.ok(oInnerColumn.isDestroyed(), "Remove from table: Old inner column is destroyed");
		assert.notOk(!!this.oColumn.getInnerColumn(), "#getInnerColumn does not return a column");

		oTable.addColumn(this.oColumn);
		oInnerColumn = this.oColumn.getInnerColumn();
		oTable.destroy();
		assert.ok(oInnerColumn.isDestroyed(), "Inner column is destroyed");
		assert.strictEqual(this.oColumn._oInnerColumn, undefined, "Reference to inner column is deleted");
		assert.notOk(!!this.oColumn.getInnerColumn(), "#getInnerColumn does not return a column");
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