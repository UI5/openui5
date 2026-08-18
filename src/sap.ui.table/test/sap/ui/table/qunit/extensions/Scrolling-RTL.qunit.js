/*global QUnit */

sap.ui.define([
	"sap/ui/table/qunit/TableQUnitUtils",
	"sap/ui/table/RowAction",
	"sap/ui/table/RowActionItem",
	"sap/ui/table/rowmodes/Fixed",
	"sap/ui/table/utils/TableUtils",
	"sap/ui/Device",
	"sap/ui/table/library",
	"sap/ui/table/Column",
	"sap/ui/core/Control",
	"sap/ui/thirdparty/jquery",
	// provides jQuery.fn.scrollLeftRTL
	"sap/ui/dom/jquery/scrollLeftRTL"
], function(
	TableQUnitUtils,
	RowAction,
	RowActionItem,
	FixedRowMode,
	TableUtils,
	Device,
	tableLibrary,
	Column,
	Control,
	jQuery
) {
	"use strict";

	QUnit.module("Scrollbars", {
		beforeEach: async function() {
			this.oTable = TableQUnitUtils.createTable({
				width: "500px",
				columns: [TableQUnitUtils.createTextColumn().setWidth("500px")],
				rows: {path: "/"},
				models: TableQUnitUtils.createJSONModelWithEmptyRows(6),
				rowMode: new FixedRowMode({rowCount: 1}),
				rowActionCount: 2,
				rowActionTemplate: new RowAction({items: [new RowActionItem({type: tableLibrary.RowActionType.Navigation})]})
			});

			await this.oTable.qunit.rendered();
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	// Test fails in Safari, skip until fixed
	QUnit[Device.browser.safari ? "skip" : "test"]("Horizontal scrollbar position", function(assert) {
		const oHSb = this.oTable._getScrollExtension().getHorizontalScrollbar();
		const oHSbContent = this.oTable.getDomRef("hsb-content");
		const oHSbComputedStyle = window.getComputedStyle(oHSb);
		const oHSbContentComputedStyle = window.getComputedStyle(oHSbContent);

		assert.strictEqual(oHSbComputedStyle.marginLeft, "91px", "Left margin");
		assert.strictEqual(oHSbComputedStyle.marginRight, "48px", "Right margin");
		assert.strictEqual(oHSbContentComputedStyle.width, "500px", "Scroll range");
	});

	QUnit.module("Horizontal scrolling", {
		beforeEach: async function() {
			this.oTable = TableQUnitUtils.createTable({
				rows: {path: "/"},
				models: TableQUnitUtils.createJSONModelWithEmptyRows(10),
				columns: [
					TableQUnitUtils.createTextColumn(),
					TableQUnitUtils.createTextColumn().setWidth("800px"),
					TableQUnitUtils.createTextColumn().setWidth("100px"),
					TableQUnitUtils.createTextColumn().setWidth("800px"),
					TableQUnitUtils.createTextColumn().setWidth("100px")
				],
				fixedColumnCount: 1
			});

			await this.oTable.qunit.rendered();
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("Focus", async function(assert) {
		const oTable = this.oTable;

		function getScrollLeft() {
			return jQuery(oTable._getScrollExtension().getHorizontalScrollbar()).scrollLeftRTL();
		}

		function isScrolledIntoView(oCell) {
			const oRowContainer = oTable.getDomRef("sapUiTableCtrlScr");
			const iScrollLeft = getScrollLeft();
			const iRowContainerWidth = oRowContainer.clientWidth;
			const iCellLeft = oCell.offsetLeft;
			const iCellRight = iCellLeft + oCell.offsetWidth;
			const iOffsetLeft = iCellLeft - iScrollLeft;
			const iOffsetRight = iCellRight - iRowContainerWidth - iScrollLeft;

			return iOffsetLeft >= 0 && iOffsetRight <= 0;
		}

		async function test(sTestTitle, oDomElementToFocus, iInitialScrollLeft, bScrollPositionShouldChange) {
			document.body.focus();
			await oTable.qunit.scrollHSbTo(iInitialScrollLeft);
			await oTable.qunit.focus(oDomElementToFocus);
			if (bScrollPositionShouldChange) {
				await oTable.qunit.hScrolled();
				assert.notStrictEqual(getScrollLeft(), iInitialScrollLeft, sTestTitle + ": The horizontal scroll position did change");
				assert.ok(isScrolledIntoView(oDomElementToFocus), sTestTitle + ": The focused cell is fully visible");
			} else {
				await TableQUnitUtils.sleep(50);
				assert.strictEqual(getScrollLeft(), iInitialScrollLeft, sTestTitle + ": The horizontal scroll position did not change");
			}
		}

		await test("Focus header cell in column 3 (scrollable column)", oTable.qunit.getColumnHeaderCell(2), 950, true);
		await test("Focus header cell in column 1 (fixed column)", oTable.qunit.getColumnHeaderCell(0), 880, false);
		await test("Focus header cell in column 2 (scrollable column)", oTable.qunit.getColumnHeaderCell(1), 880, true);
		await test("Focus header cell in column 3 (scrollable column)", oTable.qunit.getColumnHeaderCell(2), 100, true);
		await test("Focus header cell in column 4 (scrollable column)", oTable.qunit.getColumnHeaderCell(3), 750, true);
		await test("Focus data cell in column 3, row 1 (scrollable column)", oTable.qunit.getDataCell(0, 2), 950, true);
		await test("Focus data cell in column 1, row 1 (fixed column)", oTable.qunit.getDataCell(0, 0), 880, false);
		await test("Focus data cell in column 2, row 1 (scrollable column)", oTable.qunit.getDataCell(0, 1), 880, true);
		await test("Focus data cell in column 3, row 1 (scrollable column)", oTable.qunit.getDataCell(0, 2), 100, true);
		await test("Focus data cell in column 4, row 1 (scrollable column)", oTable.qunit.getDataCell(0, 3), 750, true);
		oTable.getColumns()[1].setWidth("1000px");
		oTable.getColumns()[3].setWidth("1000px");
		await oTable.qunit.rendered();
		await test("Focus header cell in column 2 (scrollable column)", oTable.qunit.getColumnHeaderCell(1), 1250, false);
		await test("Focus header cell in column 4 (scrollable column)", oTable.qunit.getColumnHeaderCell(3), 150, false);
		await test("Focus data cell in column 2, row 1 (scrollable column)", oTable.qunit.getDataCell(0, 1), 1250, false);
		await test("Focus data cell in column 2, row 2 (scrollable column)", oTable.qunit.getDataCell(1, 1), 1250, false);
		await test("Focus data cell in column 4, row 1 (scrollable column)", oTable.qunit.getDataCell(0, 3), 150, false);
		await test("Focus data cell in column 4, row 2 (scrollable column)", oTable.qunit.getDataCell(1, 3), 150, false);
	});

	QUnit.module("Special cases");

	QUnit.test("Scrolling inside the cell", async function(assert) {
		const DummyControl = Control.extend("sap.ui.table.test.DummyControl", {
			renderer: {
				apiVersion: 2,
				render: function(oRm, oControl) {
					oRm.openStart("div");
					oRm.style("display", "flex");
					oRm.style("flex-direction", "column");
					oRm.openEnd();

					oRm.openStart("span");
					oRm.attr("tabindex", "0");
					oRm.style("width", "100px");
					oRm.style("margin-top", "100px");
					oRm.openEnd();
					oRm.text("really very looooooooooong text");
					oRm.close("span");

					oRm.openStart("span", oControl); // This element should be returned by getDomRef()
					oRm.attr("tabindex", "0");
					oRm.style("width", "100px");
					oRm.style("margin-left", "100px");
					oRm.openEnd();
					oRm.text("really very looooooooooong text");
					oRm.close("span");

					oRm.close("div");
				}
			}
		});

		const oTable = TableQUnitUtils.createTable({
			columns: [
				new Column({template: new DummyControl(), width: "20px"}),
				new Column({template: new DummyControl(), width: "20px"})
			],
			rows: {path: "/"},
			models: TableQUnitUtils.createJSONModelWithEmptyRows(1),
			rowMode: new FixedRowMode({
				rowCount: 1,
				rowContentHeight: 10
			}),
			fixedColumnCount: 1
		});

		async function test(sTitle, iColumnIndex) {
			const oCellContent = oTable.getRows()[0].getCells()[iColumnIndex].getDomRef();
			await oTable.qunit.focus(oCellContent);
			const $InnerCellElement = TableUtils.getCell(oTable, oCellContent).find(".sapUiTableCellInner");

			assert.strictEqual($InnerCellElement.scrollLeftRTL(), $InnerCellElement[0].scrollWidth - $InnerCellElement[0].clientWidth,
				sTitle + ": The cell content is not scrolled horizontally");
			assert.strictEqual($InnerCellElement[0].scrollTop, 0, sTitle + ": The cell content is not scrolled vertically");
		}

		await oTable.qunit.rendered();
		await test("Fixed column", 0);
		await test("Scrollable column", 1);
		oTable.destroy();
	});
});