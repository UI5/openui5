/*global QUnit */

sap.ui.define([
	"sap/ui/table/qunit/TableQUnitUtils.ODataV2",
	"sap/ui/table/Row",
	"sap/ui/table/rowmodes/Fixed",
	"sap/ui/table/utils/TableUtils"
], function(
	TableQUnitUtils,
	Row,
	FixedRowMode,
	TableUtils
) {
	"use strict";

	QUnit.module("Hierarchy modes", {
		beforeEach: function() {
			this.oTable = TableQUnitUtils.createTable({
				models: TableQUnitUtils.createJSONModelWithEmptyRows(12),
				columns: [
					TableQUnitUtils.createTextColumn()
				],
				rowMode: new FixedRowMode({
					rowCount: 12
				}),
				rows: "{/}"
			});
			this.oTable.qunit.setRowStates(this.aRowStates);

			return this.oTable.qunit.rendered();
		},
		afterEach: function() {
			this.oTable.destroy();
		},
		aRowStates: [{
			title: "Non-expandable standard row",
			type: Row.prototype.Type.Standard,
			level: 1,
			expandable: false
		}, {
			title: "Collapsed standard row",
			type: Row.prototype.Type.Standard,
			level: 2,
			expandable: true,
			expanded: false
		}, {
			title: "Expanded standard row",
			type: Row.prototype.Type.Standard,
			level: 3,
			expandable: true,
			expanded: true
		}, {
			title: "Standard row",
			type: Row.prototype.Type.Standard,
			level: 4
		}, {
			title: "Standard row",
			type: Row.prototype.Type.Standard,
			level: 5
		}, {
			title: "Non-expandable group header row",
			type: Row.prototype.Type.GroupHeader,
			level: 1,
			expandable: false
		}, {
			title: "Collapsed group header row",
			type: Row.prototype.Type.GroupHeader,
			level: 2,
			expandable: true,
			expanded: false
		}, {
			title: "Expanded group header row",
			type: Row.prototype.Type.GroupHeader,
			level: 3,
			expandable: true,
			expanded: true
		}, {
			title: "Standard row",
			type: Row.prototype.Type.Standard,
			level: 4
		}, {
			title: "Non-expandable summary row",
			type: Row.prototype.Type.Summary,
			level: 1,
			expandable: false
		}, {
			title: "Collapsed summary row",
			type: Row.prototype.Type.Summary,
			level: 2,
			expandable: true,
			expanded: false
		}, {
			title: "Expanded summary row",
			type: Row.prototype.Type.Summary,
			level: 5,
			expandable: true,
			expanded: true
		}],
		assertRowIndentation: function(assert, aIndentations) {
			const aRows = this.oTable.getRows();

			function getCSSPixelSize(iPixel) {
				return iPixel === 0 ? "" : iPixel + "px";
			}

			for (let i = 0; i < aRows.length; i++) {
				const oRow = aRows[i];
				const mRowDomRefs = oRow.getDomRefs();
				const oRowHeader = mRowDomRefs.rowHeaderPart;
				const oFirstCellContentInRow = mRowDomRefs.rowScrollPart.querySelector("td.sapUiTableCellFirst > .sapUiTableCellInner");
				const sMessagePrefix = "Indentation; " + oRow.getTitle() + "; Level " + oRow.getLevel() + "; Index " + oRow.getIndex() + ": ";

				if (TableUtils.Grouping.isInGroupMode(this.oTable)) {
					const oGroupShield = oRowHeader.querySelector(".sapUiTableGroupShield");

					assert.equal(oRowHeader.style["right"], getCSSPixelSize(aIndentations[i]), sMessagePrefix + "Row header");
					assert.equal(oGroupShield.style["marginRight"], getCSSPixelSize(-aIndentations[i]), sMessagePrefix + "Group shield");
					assert.equal(oFirstCellContentInRow.style["paddingRight"], getCSSPixelSize(aIndentations[i] > 0 ? aIndentations[i] + 8 : 0),
						sMessagePrefix + "Content of first cell");
				} else if (TableUtils.Grouping.isInTreeMode(this.oTable)) {
					const oTreeIcon = mRowDomRefs.rowScrollPart.querySelector(".sapUiTableTreeIcon");

					assert.equal(oTreeIcon.style["marginRight"], getCSSPixelSize(aIndentations[i]), sMessagePrefix + "Tree icon");
				} else {
					assert.equal(oRowHeader.style["right"], getCSSPixelSize(aIndentations[i]), sMessagePrefix + "Row header");
					assert.equal(oFirstCellContentInRow.style["paddingRight"], getCSSPixelSize(aIndentations[i] > 0 ? aIndentations[i] + 8 : 0),
						sMessagePrefix + "Content of first cell");
				}
			}
		}
	});

	QUnit.test(TableUtils.Grouping.HierarchyMode.Group, async function(assert) {
		TableUtils.Grouping.setHierarchyMode(this.oTable, TableUtils.Grouping.HierarchyMode.Group);
		await this.oTable.qunit.rendered();
		this.assertRowIndentation(assert, [0, 0, 24, 36, 44, 0, 24, 36, 36, 0, 0, 44]);
	});

	QUnit.test(TableUtils.Grouping.HierarchyMode.Tree, async function(assert) {
		TableUtils.Grouping.setHierarchyMode(this.oTable, TableUtils.Grouping.HierarchyMode.Tree);
		await this.oTable.qunit.rendered();
		this.assertRowIndentation(assert, [0, 17, 34, 51, 68, 0, 17, 34, 51, 0, 17, 68]);
	});

	QUnit.test(TableUtils.Grouping.HierarchyMode.GroupedTree, async function(assert) {
		TableUtils.Grouping.setHierarchyMode(this.oTable, TableUtils.Grouping.HierarchyMode.GroupedTree);
		await this.oTable.qunit.rendered();
		this.assertRowIndentation(assert, [0, 24, 36, 44, 52, 0, 24, 36, 44, 0, 24, 52]);
	});
});