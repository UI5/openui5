/*global QUnit, sinon */

sap.ui.define([
	"sap/ui/table/qunit/TableQUnitUtils",
	"sap/ui/table/rowmodes/Type",
	"sap/ui/table/rowmodes/Fixed",
	'sap/ui/Device',
	"sap/ui/model/Filter"
], function(
	TableQUnitUtils,
	RowModeType,
	FixedRowMode,
	Device,
	Filter
) {
	"use strict";

	QUnit.module("Lifecycle", {
		before: function() {
			Device.os.ios = true;
		},
		beforeEach: async function() {
			this.oTable = TableQUnitUtils.createTable();

			await new Promise((resolve) => {
				sap.ui.require(["sap/ui/table/extensions/ScrollingIOS"], resolve);
			});
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("Initialization", function(assert) {
		const oExtension = this.oTable._getScrollIOSExtension();
		assert.ok(oExtension, "Extension available in table");
	});

	QUnit.test("Destruction", function(assert) {
		const oExtension = this.oTable._getScrollIOSExtension();

		this.oTable.destroy();
		assert.ok(!oExtension.getTable(), "Reference to table removed");
	});

	QUnit.module("Scrollbar", {
		before: function() {
			Device.os.ios = true;
		},
		beforeEach: async function() {
			this.oTable = TableQUnitUtils.createTable({
				columns: [TableQUnitUtils.createTextColumn()],
				rows: {path: "/"},
				models: TableQUnitUtils.createJSONModelWithEmptyRows(6),
				rowMode: new FixedRowMode({
					rowCount: 6
				})
			});

			await Promise.all([
				this.oTable.qunit.rendered(),
				new Promise((resolve) => {
					sap.ui.require(["sap/ui/table/extensions/ScrollingIOS"], resolve);
				})
			]);
		},
		afterEach: function() {
			this.oTable.destroy();
		},
		assertThumbHeight: function(assert) {
			const oTable = this.oTable;
			const oScrollExtension = oTable._getScrollExtension();
			const iVerticalScrollbarHeight = oScrollExtension.getVerticalScrollbarHeight();
			const iVerticalScrollHeight = oScrollExtension.getVerticalScrollHeight();
			const oVSb = oScrollExtension.getVerticalScrollbar();
			const oVSbIOS = oVSb.nextSibling;
			const oVSbThumb = oVSbIOS.firstChild;

			assert.strictEqual(oVSbThumb.style.height, Math.round(Math.pow(iVerticalScrollbarHeight, 2) / iVerticalScrollHeight) + "px",
				"The thumb height is correct");
		}
	});

	QUnit.test("Visibility, thumb height and position update", async function(assert) {
		const oScrollExtension = this.oTable._getScrollExtension();
		const oVSb = oScrollExtension.getVerticalScrollbar();
		let oVSbIOS = oVSb.nextSibling;
		let oVSbThumb = oVSbIOS.firstChild;
		const oScrollIOSExtension = this.oTable._getScrollIOSExtension();
		const oTotalRowCountChangeSpy = sinon.spy(oScrollIOSExtension, "onTotalRowCountChanged");
		const oUpdateVerticalScrollbarPositionSpy = sinon.spy(oScrollIOSExtension, "updateVerticalScrollbarPosition");
		const oUpdateThumbPositionSpy = sinon.spy(oScrollIOSExtension, "updateVerticalScrollbarThumbPosition");

		assert.ok(oVSbIOS.parentElement.classList.contains("sapUiTableHidden") && oVSbThumb.style.height === "0px",
			"Table content fits height -> Vertical scrollbar is not visible");

		this.oTable.getRowMode().setRowCount(3);
		await this.oTable.qunit.rendered();
		oVSbIOS = oVSb.nextSibling;
		oVSbThumb = oVSbIOS.firstChild;
		assert.ok(oUpdateVerticalScrollbarPositionSpy.called, "updateVerticalScrollbarPosition has been called");
		assert.ok(oUpdateThumbPositionSpy.called, "updateVerticalScrollbarThumbPosition has been called");
		assert.equal(oVSbIOS.style.bottom, oScrollExtension.getVerticalScrollbarBottomOffset(this.oTable) + "px",
			"Vertical scrollbar bottom offset is correct");
		assert.ok(!oVSbIOS.classList.contains("sapUiTableHidden") && oVSbThumb.style.height !== "0px",
			"Table content does not fit height -> Vertical scrollbar is visible");
		this.assertThumbHeight(assert);

		this.oTable.getBinding().filter(new Filter("A", "EQ", "A1"));
		await this.oTable.qunit.rendered();
		assert.ok(oTotalRowCountChangeSpy.calledOnce, "onTotalRowCountChanged hook has been called once");
		assert.ok(oVSbIOS.parentElement.classList.contains("sapUiTableHidden") && oVSbThumb.style.height === "0px",
			"Table content fits height -> Vertical scrollbar is not visible");
	});

	QUnit.module("Scrolling", {
		before: function() {
			Device.os.ios = true;
			Device.support.pointer = false;
			Device.support.touch = true;
		},
		beforeEach: async function() {
			this.oTable = TableQUnitUtils.createTable({
				columns: [TableQUnitUtils.createTextColumn()],
				rows: {path: "/"},
				models: TableQUnitUtils.createJSONModelWithEmptyRows(100)
			});

			await Promise.all([
				this.oTable.qunit.rendered(),
				new Promise((resolve) => {
					sap.ui.require(["sap/ui/table/extensions/ScrollingIOS"], resolve);
				})
			]);
		},
		afterEach: function() {
			this.oTable.destroy();
		},
		scrollWithTouch: function(iScrollDelta) {
			return async () => {
				TableQUnitUtils.doTouchScrolling(0, iScrollDelta);
				await this.oTable.qunit.vScrolled();
				await this.oTable.qunit.rendered();
			};
		},
		assertThumbPosition: function(assert) {
			const oScrollExtension = this.oTable._getScrollExtension();
			const oVSb = oScrollExtension.getVerticalScrollbar();
			const oVSbIOS = oVSb.nextSibling;
			const oVSbThumb = oVSbIOS.firstChild;
			const iVerticalScrollbarHeight = oScrollExtension.getVerticalScrollbarHeight();
			const iVerticalScrollHeight = oScrollExtension.getVerticalScrollHeight();
			const iVerticalScrollTop = oScrollExtension.getVerticalScrollbar().scrollTop;

			const iThumbHeight = this.oTable._getScrollIOSExtension().getCalculateThumbHeight();
			const iScrollPosition = Math.round(iVerticalScrollTop * (iVerticalScrollbarHeight - iThumbHeight) /
				(iVerticalScrollHeight - iThumbHeight));
			assert.strictEqual(oVSbThumb.style.top, iScrollPosition + "px", "Thumb position is correct");
		}
	});

	QUnit.test("Scroll by setting FirstVisibleRow", async function(assert) {
		const that = this;
		const oTable = this.oTable;

		await oTable.qunit.rendered();
		that.assertThumbPosition(assert);
		oTable.setFirstVisibleRow(10);
		that.assertThumbPosition(assert);
		oTable.setFirstVisibleRow(50);
		await oTable.qunit.rendered();
		that.assertThumbPosition(assert);
		oTable.setFirstVisibleRow(90);
		await oTable.qunit.rendered();
		that.assertThumbPosition(assert);
	});

	QUnit.test("Touch scroll on table content", async function(assert) {
		const that = this;
		const oTable = this.oTable;

		await oTable.qunit.rendered();
		oTable.qunit.preventFocusOnTouch();
		TableQUnitUtils.startTouchScrolling(oTable.qunit.getDataCell(0, 0));
		await that.scrollWithTouch(200)();
		that.assertThumbPosition(assert);
		await that.scrollWithTouch(300)();
		that.assertThumbPosition(assert);
		await that.scrollWithTouch(-300)();
		that.assertThumbPosition(assert);
		await that.scrollWithTouch(-1000, true, "Scrolled to the top")();
		that.assertThumbPosition(assert);
		TableQUnitUtils.endTouchScrolling();
	});

	QUnit.test("touchMove on scroll thumb", async function(assert) {
		const that = this;
		const oTable = this.oTable;

		try {
			await oTable.qunit.rendered();
			oTable.qunit.preventFocusOnTouch();
			TableQUnitUtils.startTouchScrolling(oTable._getScrollIOSExtension().getVerticalScrollbarThumb());
			await that.scrollWithTouch(-400)();
			that.assertThumbPosition(assert);
			await that.scrollWithTouch(-400)();
			that.assertThumbPosition(assert);
			await that.scrollWithTouch(1000)();
			that.assertThumbPosition(assert);
		} finally {
			TableQUnitUtils.endTouchScrolling();
		}
	});

	QUnit.test("pointerDown on scrollbar", async function(assert) {
		const that = this;
		const oTable = this.oTable;
		const oTarget = oTable._getScrollIOSExtension().getVerticalScrollbar();

		await oTable.qunit.rendered();
		oTarget.dispatchEvent(new PointerEvent("pointerdown", {
			clientX: oTarget.getBoundingClientRect().x + 5,
			clientY: oTarget.getBoundingClientRect().y + 200
		}));
		await that.oTable.qunit.vScrolled();
		await that.oTable.qunit.rendered();
		that.assertThumbPosition(assert);
		oTarget.dispatchEvent(new PointerEvent("pointerdown", {
			clientX: oTarget.getBoundingClientRect().x + 5,
			clientY: oTarget.getBoundingClientRect().y + 400
		}));
		await that.oTable.qunit.vScrolled();
		await that.oTable.qunit.rendered();
		that.assertThumbPosition(assert);
	});

	QUnit.test("pointerDown on scrollbar after rendering only rows", async function(assert) {
		const that = this;
		const oTable = this.oTable;

		oTable.setRowMode(RowModeType.Auto);

		await oTable.qunit.rendered();
		const oTarget = oTable._getScrollIOSExtension().getVerticalScrollbar();
		oTarget.dispatchEvent(new PointerEvent("pointerdown", {
			clientX: oTarget.getBoundingClientRect().x + 5,
			clientY: oTarget.getBoundingClientRect().y + 200
		}));
		await that.oTable.qunit.vScrolled();
		await that.oTable.qunit.rendered();
		that.assertThumbPosition(assert);
	});
});