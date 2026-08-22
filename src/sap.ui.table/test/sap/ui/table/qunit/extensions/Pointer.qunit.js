/*global QUnit, sinon */

sap.ui.define([
	"sap/ui/table/qunit/TableQUnitUtils",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/test/utils/nextUIUpdate",
	"sap/ui/table/extensions/Pointer",
	"sap/ui/table/Table",
	"sap/ui/table/TreeTable",
	"sap/ui/table/Row",
	"sap/ui/table/Column",
	"sap/ui/table/utils/TableUtils",
	"sap/ui/table/library",
	"sap/ui/table/rowmodes/Fixed",
	"sap/ui/thirdparty/jquery",
	"sap/ui/Device"
], function(
	TableQUnitUtils,
	qutils,
	nextUIUpdate,
	PointerExtension,
	Table,
	TreeTable,
	Row,
	Column,
	TableUtils,
	library,
	FixedRowMode,
	jQuery,
	Device
) {
	"use strict";

	const iNumberOfRows = 8;

	TableQUnitUtils.setDefaultSettings({
		rows: {path: "/"},
		models: TableQUnitUtils.createJSONModel(iNumberOfRows),
		rowMode: new FixedRowMode({rowCount: 3}),
		fixedColumnCount: 1,
		columns: ["A", "B", "C", "D", "E"].map((sField) => TableQUnitUtils.createTextColumn({
			label: sField + "_TITLE",
			text: sField,
			bind: true
		}))
	});

	const mTreeTableSettings = () => ({
		rows: {path: "/", parameters: {arrayNames: ["children"]}},
		selectionMode: "Single",
		groupHeaderProperty: "A",
		columns: ["A", "B", "C", "D", "E"].map((sField) => TableQUnitUtils.createTextColumn({
			label: sField + "_TITLE",
			text: sField,
			bind: true
		}))
	});

	function createPointerEvent(sEventType) {
		return new window.PointerEvent(sEventType, {
			bubbles: true,
			cancelable: true
		});
	}

	QUnit.module("Lifecycle", {
		beforeEach: function() {
			this.oTable = TableQUnitUtils.createTable();
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("Initialization", function(assert) {
		const oExtension = this.oTable._getPointerExtension();
		let iDelegateCount = 0;

		assert.ok(oExtension, "Extension available in table");

		for (const oDelegate of this.oTable.aDelegates) {
			if (oDelegate.oDelegate === oExtension._delegate) {
				iDelegateCount++;
			}
		}

		assert.equal(iDelegateCount, 1, "Pointer delegate registered");
	});

	QUnit.test("Destruction", function(assert) {
		const oExtension = this.oTable._getPointerExtension();

		this.oTable.destroy();
		assert.ok(!oExtension.getTable(), "Reference to table removed");
		assert.ok(!oExtension._delegate, "Delegate cleared");
	});

	QUnit.module("Column Resizing", {
		beforeEach: async function() {
			this.bOriginalSystemDesktop = Device.system.desktop;

			this.oTable = TableQUnitUtils.createTable({
				models: TableQUnitUtils.createJSONModel(iNumberOfRows)
			});
			await this.oTable.qunit.rendered();

			// Ensure that the last column is "streched" and the others have their defined size
			const oLastColumn = this.oTable.getColumns()[this.oTable.getColumns().length - 1];
			oLastColumn.setWidth(null);

			// Ensure bigger cell content for the column with index 1 ("B"). Mutate cloned rows,
			// not the shared test data, so other modules keep the default values.
			const oModel = this.oTable.getModel();
			oModel.setData(oModel.getData().map((oRow, i) => ({...oRow, B: "AAAAAAAAAAAAAAAAAAAAAAAAA" + i})));
			oModel.refresh(true);

			this.oColumn = this.oTable.getColumns()[1];
			this.oColumn.setResizable(false);

			await nextUIUpdate();

			// Extend auto resize logic to know about the test control
			PointerExtension._fnCheckTextBasedControl = function(oControl) {
				return oControl.getMetadata().getName() === "TestControl";
			};
		},
		afterEach: function() {
			Device.system.desktop = this.bOriginalSystemDesktop;

			this.oTable.destroy();
			PointerExtension._fnCheckTextBasedControl = null;
		}
	});

	function moveResizer(oColumn, assert, bExpect, iIndex) {
		const oTable = oColumn.getParent();
		qutils.triggerEvent("mousemove", oColumn.getId(), {
			clientX: Math.floor(oColumn.getDomRef().getBoundingClientRect().left + 10),
			clientY: Math.floor(oColumn.getDomRef().getBoundingClientRect().top + 100)
		});

		if (assert) {
			const iDistance = oTable.getDomRef("rsz").getBoundingClientRect().left - oColumn.getDomRef().getBoundingClientRect().right;
			const bCorrect = Math.abs(iDistance) < 5;
			assert.ok(bExpect && bCorrect || !bExpect && !bCorrect, "Position of Resizer");
			assert.equal(oTable._iLastHoveredVisibleColumnIndex, iIndex, "Index of last hovered resizable column");
		}
	}

	QUnit.test("Moving Resizer", function(assert) {
		const oTable = this.oTable;
		const aVisibleColumns = oTable._getVisibleColumns();
		moveResizer(aVisibleColumns[0], assert, true, 0);
		moveResizer(aVisibleColumns[1], assert, false, 0);
		assert.ok(Math.abs(oTable.getDomRef("rsz").getBoundingClientRect().left - aVisibleColumns[0].getDomRef().getBoundingClientRect().right) < 5,
			"Position of Resizer still on column 0");
		moveResizer(aVisibleColumns[2], assert, true, 2);
	});

	QUnit.test("Moving Resizer with padding on the root element", function(assert) {
		const oTable = this.oTable;
		oTable.getDomRef().style.padding = "1rem";
		const aVisibleColumns = oTable._getVisibleColumns();
		moveResizer(aVisibleColumns[0], assert, true, 0);
		moveResizer(aVisibleColumns[1], assert, false, 0);
		assert.ok(Math.abs(oTable.getDomRef("rsz").getBoundingClientRect().left - aVisibleColumns[0].getDomRef().getBoundingClientRect().right) < 5,
			"Position of Resizer still on column 0");
		moveResizer(aVisibleColumns[2], assert, true, 2);
	});

	QUnit.test("Automatic Column Resize via Double Click", async function(assert) {
		const oTable = this.oTable;
		const assertAutoResizeCalled = (bCalled) => {
			const sMessage =
				` - resizable=${this.oColumn.getResizable()}, autoResizable=${this.oColumn.getAutoResizable()}, desktop=${Device.system.desktop}`;

			if (bCalled) {
				assert.ok(this.oColumn.autoResize.calledOnceWithExactly(), "Column#autoResize called once with correct parameters" + sMessage);
			} else {
				assert.ok(this.oColumn.autoResize.notCalled, "Column#autoResize not called" + sMessage);
			}

			this.oColumn.autoResize.resetHistory();
		};
		const triggerDoubleClick = async () => {
			const oResizer = oTable.getDomRef("rsz");

			// Move resizer to correct column
			moveResizer(this.oColumn);

			// Simulate double click on resizer
			await new Promise((resolve) => {
				oResizer.dispatchEvent(createPointerEvent("mousedown"));
				oResizer.dispatchEvent(createPointerEvent("mouseup"));
				oResizer.dispatchEvent(createPointerEvent("click"));
				setTimeout(resolve, 50);
			});
			await new Promise((resolve) => {
				oResizer.dispatchEvent(createPointerEvent("mousedown"));
				oResizer.dispatchEvent(createPointerEvent("mouseup"));
				oResizer.dispatchEvent(createPointerEvent("click"));
				oResizer.dispatchEvent(createPointerEvent("dblclick"));
				setTimeout(resolve, 50);
			});
		};

		sinon.spy(this.oColumn, "autoResize");

		Device.system.desktop = true;
		await triggerDoubleClick();
		assertAutoResizeCalled(false);

		this.oColumn.setAutoResizable(true);
		await nextUIUpdate();
		await triggerDoubleClick();
		assertAutoResizeCalled(false);

		this.oColumn.setResizable(true);
		await nextUIUpdate();
		Device.system.desktop = false;
		await triggerDoubleClick();
		assertAutoResizeCalled(false);

		Device.system.desktop = true;
		await triggerDoubleClick();
		assertAutoResizeCalled(true);

		this.oColumn.setAutoResizable(false);
		await triggerDoubleClick();
		assertAutoResizeCalled(false);
	});

	QUnit.test("Resize via Drag&Drop", async function(assert) {
		const oTable = this.oTable;
		const oColumn = this.oColumn;
		let $Resizer = oTable.$("rsz");

		// resizer should be way out of screen when the table gets rendered
		const nLeft = oTable.$("rsz").position().left;
		assert.equal(nLeft, "-5", "Resizer is at the correct initial position");

		const iWidth = oColumn.$().width();
		assert.ok(Math.abs(iWidth - 100) < 10, "check column width before resize: " + iWidth);

		// Resizer moved to the correct position when column is resizable
		moveResizer(oColumn, assert, false, 0);
		oColumn.setAutoResizable(true);
		await nextUIUpdate();

		moveResizer(oColumn, assert, false, 0);
		oColumn.setResizable(true);
		await nextUIUpdate();

		moveResizer(oColumn, assert, true, 1);
		await TableQUnitUtils.nextEvent("rowsUpdated", oTable);

		// drag resizer to resize column
		$Resizer = oTable.$("rsz");
		const iResizeHandlerTop = Math.floor(oColumn.getDomRef().getBoundingClientRect().top + 100);
		const iResizeHandlerLeft = $Resizer.offset().left;

		qutils.triggerMouseEvent($Resizer, "mousedown", 1, 1, iResizeHandlerLeft, iResizeHandlerTop, 0);
		qutils.triggerMouseEvent($Resizer, "mousemove", 1, 1, iResizeHandlerLeft + 90, iResizeHandlerTop, 0);
		qutils.triggerMouseEvent($Resizer, "mousemove", 1, 1, iResizeHandlerLeft + 90 + 40, iResizeHandlerTop, 0);
		qutils.triggerMouseEvent($Resizer, "mouseup", 1, 1, iResizeHandlerLeft + 90 + 40, iResizeHandlerTop, 0);
		await TableQUnitUtils.nextEvent("rowsUpdated", oTable);

		const iNewWidth = oColumn.getDomRef().offsetWidth;
		assert.ok(Math.abs(iNewWidth - iWidth - 90 - 40) < 5, "check column width after resize: " + iNewWidth);
	});

	QUnit.test("Skip trigger resize when resizing already started", function(assert) {
		const oTable = this.oTable;
		oTable._getPointerExtension()._debug();
		const ColumnResizeHelper = oTable._getPointerExtension()._ColumnResizeHelper;
		oTable._bIsColumnResizerMoving = true;
		assert.ok(!oTable.getDomRef().classList.contains("sapUiTableResizing"), "Before Trigger");
		ColumnResizeHelper.initColumnResizing(oTable);
		assert.ok(!oTable.getDomRef().classList.contains("sapUiTableResizing"), "After Trigger");
	});

	QUnit.module("Context menu", {
		beforeEach: async function() {
			this.oTable = TableQUnitUtils.createTable();
			await this.oTable.qunit.rendered();
			this.oPointerExtension = this.oTable._getPointerExtension();
			this.oPointerExtension._debug();
		},
		afterEach: function() {
			this.oTable.destroy();
		},
		/**
		 * Triggers a mouse down event on the passed element simulating the specified button.
		 *
		 * @param {jQuery|HTMLElement} oElement The target of the event.
		 * @param {int} iButton 0 = Left mouse button,
		 *                      1 = Middle mouse button,
		 *                      2 = Right mouse button
		 */
		triggerMouseDownEvent: function(oElement, iButton) {
			qutils.triggerMouseEvent(oElement, "mousedown", null, null, null, null, iButton);
		},
		assertOpenContextMenuCall: function(oTable, oContextMenuEvent) {
			QUnit.assert.equal(TableUtils.Menu.openContextMenu.callCount, 1, "openContextMenu call");
			QUnit.assert.deepEqual([
				TableUtils.Menu.openContextMenu.firstCall.args[0],
				TableUtils.Menu.openContextMenu.firstCall.args[1].originalEvent
			], [
				oTable,
				oContextMenuEvent
			], "openContextMenu call parameters");
			TableUtils.Menu.openContextMenu.resetHistory();
		}
	});

	QUnit.test("Data cell", function(assert) {
		const oTable = this.oTable;
		const oElem = oTable.qunit.getDataCell(0, 0);
		const oContextMenuEvent = createPointerEvent("contextmenu");

		this.spy(TableUtils.Menu, "openContextMenu");

		// Try to open the menu with the left mouse button.
		this.triggerMouseDownEvent(oElem, 0);
		qutils.triggerMouseEvent(oElem, "click");
		assert.notOk(TableUtils.Menu.openContextMenu.called, "openContextMenu call");
		TableQUnitUtils.assertFocus(assert, oElem);

		// Try to open the menu with the right mouse button.
		this.triggerMouseDownEvent(oElem, 2);
		oElem.dispatchEvent(oContextMenuEvent);
		this.assertOpenContextMenuCall(oTable, oContextMenuEvent);
		TableQUnitUtils.assertFocus(assert, oElem);

		// Open the menu with the right mouse button on the same element.
		this.triggerMouseDownEvent(oElem, 2);
		oElem.dispatchEvent(oContextMenuEvent);
		this.assertOpenContextMenuCall(oTable, oContextMenuEvent);

		// If an interactive/clickable element inside a data cell was clicked, open the default context menu instead of the column or cell context
		// menu.
		const aKnownClickableControls = this.oPointerExtension._KNOWNCLICKABLECONTROLS;
		const $CellContent = oTable.getRows()[0].getCells()[0].$();

		for (const sClass of aKnownClickableControls) {
			TableUtils.Menu.openContextMenu.resetHistory();
			$CellContent.toggleClass(sClass, true);
			this.triggerMouseDownEvent($CellContent, 2);
			$CellContent[0].dispatchEvent(oContextMenuEvent);
			assert.notOk(TableUtils.Menu.openContextMenu.called, "openContextMenu call");
			$CellContent.toggleClass(sClass, false);
		}
	});

	QUnit.module("Mousedown", {
		beforeEach: async function() {
			this.oTable = TableQUnitUtils.createTable();
			await this.oTable.qunit.rendered();
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("Column header long press doesn't open menu", async function(assert) {
		const oTable = this.oTable;
		const oSettings = computeSettingsForReordering(oTable, 2, true);
		const oColumn = oSettings.column;
		const oOpenHeaderMenuSpy = this.spy(oColumn, "_openHeaderMenu");

		assert.equal(oTable.indexOfColumn(oColumn), 2, "Initial index of column");

		qutils.triggerMouseEvent(oColumn.$(), "mousedown", 1, 1, oSettings.left, oSettings.top, 0);
		await TableQUnitUtils.sleep(250);
		assert.ok(oTable._oReorderGhost, "Column Reordering triggered");
		assert.ok(oTable.getDomRef().classList.contains("sapUiTableDragDrop"), "Table has drag drop class");

		qutils.triggerMouseEvent(oTable.qunit.getColumnHeaderCell(3), "mouseup", 1, 1, oSettings.left, oSettings.top, 0);
		await TableQUnitUtils.sleep(100);
		assert.ok(oOpenHeaderMenuSpy.notCalled, "_openHeaderMenu is not called");
	});

	QUnit.test("Resizer position is updated on mousemove only on desktop devices", async function(assert) {
		function assertResizerPosition(oTable, bUpdated) {
			const oDomRef = oTable.getDomRef("sapUiTableCnt");
			const oTableRect = oDomRef.getBoundingClientRect();
			const oColumn1HeaderRect = oTable._aTableHeaders[0].getBoundingClientRect();
			const iResizerPositionX = oTable._bRtlMode ? oColumn1HeaderRect.left - oTableRect.left : oColumn1HeaderRect.right - oTableRect.left;

			oTable.$().toggleClass("sapUiTableResizing", true);
			oTable._oColResize = oTable.getDomRef("rsz");
			oTable._oColResize.classList.toggle("sapUiTableColRszActive", true);
			oTable.$("rsz").css("left", iResizerPositionX + "px");

			const oEvent = jQuery.Event({type: "mousemove"});
			oEvent.target = oTable.getColumns()[1].getDomRef();
			const oColumn2HeaderRect = oTable._aTableHeaders[1].getBoundingClientRect();
			oEvent.clientX = oColumn2HeaderRect.left + 50;
			jQuery(oEvent.target).trigger(oEvent);

			const oColumnHeaderRect = bUpdated ? oColumn2HeaderRect : oColumn1HeaderRect;
			assert.equal(oTable.$("rsz").css("left"), oColumnHeaderRect.left - oTableRect.left + oColumnHeaderRect.width + "px",
				"Resizer is at the correct position");
		}

		assertResizerPosition(this.oTable, true);

		this.oTable.destroy();
		const bOriginalDesktopSupport = Device.system.desktop;
		Device.system.desktop = false;
		this.oTable = TableQUnitUtils.createTable();
		await this.oTable.qunit.rendered();

		assertResizerPosition(this.oTable, false);

		Device.system.desktop = bOriginalDesktopSupport;
	});

	QUnit.test("Scrollbar", function(assert) {
		const oTable = this.oTable;
		const oEvent = jQuery.Event({type: "mousedown"});
		oEvent.target = oTable._getScrollExtension().getHorizontalScrollbar();
		oEvent.button = 0;
		jQuery(oEvent.target).trigger(oEvent);
		assert.ok(oEvent.isDefaultPrevented(), "Prevent Default of mousedown on horizontal scrollbar");

		oEvent.target = oTable._getScrollExtension().getVerticalScrollbar();
		oEvent.button = 0;
		jQuery(oEvent.target).trigger(oEvent);
		assert.ok(oEvent.isDefaultPrevented(), "Prevent Default of mousedown on vertical scrollbar");
	});

	QUnit.module("Click", {
		beforeEach: async function() {
			this.oTable = TableQUnitUtils.createTable();
			this.oTreeTable = TableQUnitUtils.createTable(TreeTable, mTreeTableSettings());
			await Promise.all([
				this.oTable.qunit.rendered(),
				this.oTreeTable.qunit.rendered()
			]);
		},
		afterEach: function() {
			this.oTable.destroy();
			this.oTreeTable.destroy();
		}
	});

	QUnit.test("Tree Icon", async function(assert) {
		const oTreeTable = this.oTreeTable;
		const oExtension = oTreeTable._getPointerExtension();
		oExtension._debug();

		assert.equal(oTreeTable._getTotalRowCount(), iNumberOfRows, "Row count before expand");
		assert.ok(!oTreeTable.getBinding().isExpanded(0), "!Expanded");
		oExtension._ExtensionHelper.__handleClickSelection = oExtension._ExtensionHelper._handleClickSelection;
		oExtension._ExtensionHelper._handleClickSelection = function() {
			assert.ok(false, "_doSelect was not called");
		};

		const oTreeIcon = oTreeTable.getRows()[0].getDomRef("col0").querySelector(".sapUiTableTreeIcon");
		qutils.triggerMouseEvent(oTreeIcon, "tap");
		await TableQUnitUtils.nextEvent("rowsUpdated", oTreeTable);
		await nextUIUpdate();

		assert.equal(oTreeTable._getTotalRowCount(), iNumberOfRows + 1, "Row count after expand");
		assert.ok(oTreeTable.getBinding().isExpanded(0), "Expanded");
		oExtension._ExtensionHelper._handleClickSelection = oExtension._ExtensionHelper.__handleClickSelection;
		oExtension._ExtensionHelper.__handleClickSelection = null;
	});

	QUnit.test("Group Header", async function(assert) {
		const oTreeTable = this.oTreeTable;
		const oExtension = oTreeTable._getPointerExtension();
		oExtension._debug();

		oTreeTable.setUseGroupMode(true);
		await nextUIUpdate();
		oExtension._ExtensionHelper.__handleClickSelection = oExtension._ExtensionHelper._handleClickSelection;
		oExtension._ExtensionHelper._handleClickSelection = function() {
			assert.ok(false, "_doSelect was not called");
		};

		assert.equal(oTreeTable._getTotalRowCount(), iNumberOfRows, "Row count before expand");
		assert.ok(!oTreeTable.getBinding().isExpanded(0), "!Expanded");

		const oGroupHeader = oTreeTable.getRows()[0].getDomRef("groupHeader");
		qutils.triggerMouseEvent(oGroupHeader, "tap");
		await TableQUnitUtils.nextEvent("rowsUpdated", oTreeTable);
		await nextUIUpdate();

		assert.equal(oTreeTable._getTotalRowCount(), iNumberOfRows + 1, "Row count after expand");
		assert.ok(oTreeTable.getBinding().isExpanded(0), "Expanded");
		oExtension._ExtensionHelper._handleClickSelection = oExtension._ExtensionHelper.__handleClickSelection;
		oExtension._ExtensionHelper.__handleClickSelection = null;
	});

	QUnit.test("Cell + Cell Click Event", function(assert) {
		const oTable = this.oTable;
		const oTreeTable = this.oTreeTable;
		let oExtension = oTreeTable._getPointerExtension();
		oExtension._debug();

		let iSelectCount = 0;
		oExtension._ExtensionHelper.__handleClickSelection = oExtension._ExtensionHelper._handleClickSelection;
		oExtension._ExtensionHelper._handleClickSelection = function() {
			iSelectCount++;
		};

		let fnClickHandler; let bClickHandlerCalled;

		function initCellClickHandler(fnHandler) {
			if (fnClickHandler) {
				oTreeTable.detachCellClick(fnClickHandler);
				fnClickHandler = null;
			}
			bClickHandlerCalled = false;
			if (fnHandler) {
				oTreeTable.attachCellClick(fnHandler);
				fnClickHandler = fnHandler;
			}
		}

		const oRowColCell = TableUtils.getRowColCell(oTreeTable, 1, 2);
		initCellClickHandler(function(oEvent) {
			bClickHandlerCalled = true;
			assert.ok(oEvent.getParameter("cellControl") === oRowColCell.cell, "Cell Click Event: Parameter cellControl");
			assert.ok(oEvent.getParameter("cellDomRef") === document.getElementById(oTreeTable.getId() + "-rows-row1-col2"),
				"Cell Click Event: Parameter cellDomRef");
			assert.equal(oEvent.getParameter("rowIndex"), 1, "Cell Click Event: Parameter rowIndex");
			assert.equal(oEvent.getParameter("columnIndex"), 2, "Cell Click Event: Parameter columnIndex");
			assert.equal(oEvent.getParameter("columnId"), oRowColCell.column.getId(), "Cell Click Event: Parameter columnId");
			assert.ok(oEvent.getParameter("rowBindingContext") === oRowColCell.row.getBindingContext(),
				"Cell Click Event: Parameter rowBindingContext");
		});
		let $Cell = oRowColCell.cell.$();
		qutils.triggerMouseEvent($Cell, "tap"); // Should increase the counter
		assert.equal(iSelectCount, 1, iSelectCount + " selections performed");
		assert.ok(bClickHandlerCalled, "Cell Click Event handler called");

		initCellClickHandler(function(oEvent) {
			oEvent.preventDefault();
			bClickHandlerCalled = true;
		});
		qutils.triggerMouseEvent($Cell, "tap");
		assert.equal(iSelectCount, 1, iSelectCount + " selections performed");
		assert.ok(bClickHandlerCalled, "Cell Click Event handler called");

		initCellClickHandler(function(oEvent) {
			bClickHandlerCalled = true;
		});
		$Cell = oTreeTable.getRows()[0].$("col0");
		qutils.triggerMouseEvent($Cell, "tap"); // Should increase the counter
		assert.equal(iSelectCount, 2, iSelectCount + " selections performed");
		assert.ok(bClickHandlerCalled, "Cell Click Event handler called");

		bClickHandlerCalled = false;
		const oEvent = jQuery.Event({type: "tap"});
		oEvent.setMarked();
		$Cell.trigger(oEvent);
		assert.equal(iSelectCount, 2, iSelectCount + " selections performed");
		assert.ok(!bClickHandlerCalled, "Cell Click Event handler not called");

		qutils.triggerMouseEvent(oTreeTable.getDomRef("rowsel0"), "tap"); // Should increase the counter
		assert.equal(iSelectCount, 3, iSelectCount + " selections performed");
		assert.ok(!bClickHandlerCalled, "Cell Click Event handler not called");

		qutils.triggerMouseEvent(oTable._getVisibleColumns()[0].getDomRef(), "tap");
		assert.equal(iSelectCount, 3, iSelectCount + " selections performed");
		assert.ok(!bClickHandlerCalled, "Cell Click Event handler not called");

		// Prevent Click on interactive controls

		oExtension = oTable._getPointerExtension();
		oExtension._debug();
		const aKnownClickableControls = oExtension._KNOWNCLICKABLECONTROLS;

		$Cell = oRowColCell.cell.$();
		for (const sClass of aKnownClickableControls) {
			$Cell.toggleClass(sClass, true);
			qutils.triggerMouseEvent($Cell, "tap");
			assert.equal(iSelectCount, 3, iSelectCount + " selections performed");
			assert.ok(!bClickHandlerCalled, "Cell Click Event handler not called");
			$Cell.toggleClass(sClass, false);
		}

		oRowColCell.cell.getEnabled = function() { return false; };
		$Cell = oRowColCell.cell.$();
		const iStartCount = iSelectCount;
		for (const [i, sClass] of aKnownClickableControls.entries()) {
			$Cell.toggleClass(sClass, true);
			qutils.triggerMouseEvent($Cell, "tap");
			assert.equal(iSelectCount, iStartCount + i + 1, iSelectCount + " selections performed");
			assert.ok(bClickHandlerCalled, "Cell Click Event handler called");
			$Cell.toggleClass(sClass, false);
		}

		oExtension._ExtensionHelper._handleClickSelection = oExtension._ExtensionHelper.__handleClickSelection;
		oExtension._ExtensionHelper.__handleClickSelection = null;
	});

	QUnit.test("Single Selection", async function(assert) {
		const oTable = this.oTable;
		oTable.clearSelection();
		oTable.setSelectionBehavior(library.SelectionBehavior.Row);
		oTable.setSelectionMode(library.SelectionMode.Single);
		oTable.setRowActionTemplate(TableQUnitUtils.createRowAction(null));
		oTable.setRowActionCount(1);
		await nextUIUpdate();

		assert.ok(!oTable.isIndexSelected(0), "First row is not selected");

		qutils.triggerMouseEvent(oTable.qunit.getDataCell(0, 0), "tap");
		assert.ok(oTable.isIndexSelected(0), "Click on data cell in first row -> First row selected");

		qutils.triggerMouseEvent(oTable.qunit.getRowHeaderCell(0), "tap");
		assert.ok(!oTable.isIndexSelected(0), "Click on row header cell in first row -> First row  not selected");

		qutils.triggerMouseEvent(oTable.qunit.getRowActionCell(0), "tap");
		assert.ok(oTable.isIndexSelected(0), "Click on row action cell in first row -> First row selected");

		qutils.triggerMouseEvent(oTable.qunit.getDataCell(1, 0), "tap");
		assert.deepEqual(oTable.getSelectedIndices(), [1], "Click on data cell in second row -> Second row selected");
	});

	QUnit.test("MultiToggle Selection - Range", async function(assert) {
		const oTable = this.oTable;
		oTable.clearSelection();
		oTable.setSelectionBehavior(library.SelectionBehavior.Row);
		oTable.setRowActionTemplate(TableQUnitUtils.createRowAction(null));
		oTable.setRowActionCount(1);
		await nextUIUpdate();

		qutils.triggerMouseEvent(oTable.qunit.getDataCell(0, 0), "tap");
		assert.ok(oTable.isIndexSelected(0), "Click on first row -> Row selected");

		oTable.setFirstVisibleRow(3); // Scroll down 3 rows
		await nextUIUpdate();
		qutils.triggerEvent("tap", oTable.qunit.getDataCell(2, 0), {shiftKey: true});
		assert.deepEqual(oTable.getSelectedIndices(), [0, 1, 2, 3, 4, 5], "Range selection with Shift + Click selected the correct rows");
		assert.strictEqual(window.getSelection().toString(), "", "Range selection with Shift + Click did not select text");

		qutils.triggerMouseEvent(oTable.qunit.getDataCell(0, 0), "tap"); // Deselect row with index 3
		qutils.triggerMouseEvent(oTable.qunit.getDataCell(0, 0), "tap"); // Select row with index 3
		qutils.triggerMouseEvent(oTable.qunit.getDataCell(0, 0), "tap"); // Deselect row with index 3
		qutils.triggerEvent("tap", oTable.qunit.getDataCell(2, 0), {shiftKey: true});
		assert.deepEqual(oTable.getSelectedIndices(), [0, 1, 2, 4, 5], "Range selection with Shift + Click did not deselect");
	});

	QUnit.test("MultiToggle Selection - Toggle", async function(assert) {
		const oTable = this.oTable;
		oTable.clearSelection();
		oTable.setSelectionBehavior(library.SelectionBehavior.Row);
		oTable.setRowActionTemplate(TableQUnitUtils.createRowAction(null));
		oTable.setRowActionCount(1);
		await nextUIUpdate();

		qutils.triggerMouseEvent(oTable.qunit.getDataCell(0, 0), "tap");
		assert.deepEqual(oTable.getSelectedIndices(), [0], "Click on unselected row with index 0");

		qutils.triggerMouseEvent(oTable.qunit.getDataCell(1, 0), "tap");
		assert.deepEqual(oTable.getSelectedIndices(), [0, 1], "Click on unselected row with index 1");

		qutils.triggerMouseEvent(oTable.qunit.getDataCell(0, 0), "tap");
		assert.deepEqual(oTable.getSelectedIndices(), [1], "Click on selected row with index 0");
	});

	QUnit.module("Selection plugin integration", {
		beforeEach: function() {
			this.oSelectionPlugin = new TableQUnitUtils.TestSelectionPlugin();
			this.oTable = TableQUnitUtils.createTable({
				rowMode: new FixedRowMode({
					rowCount: 5
				}),
				rows: {path: "/"},
				models: TableQUnitUtils.createJSONModel(4),
				columns: [
					TableQUnitUtils.createTextColumn(),
					TableQUnitUtils.createInputColumn()
				],
				rowActionTemplate: TableQUnitUtils.createRowAction(null),
				rowActionCount: 1,
				dependents: [this.oSelectionPlugin]
			});
			this.oSetSelected = this.spy(this.oSelectionPlugin, "setSelected");

			return this.oTable.qunit.rendered();
		},
		afterEach: function() {
			this.oTable.destroy();
		},
		testRowSelection: function(oTarget, mSettings = {}) {
			const oRow = this.oTable.getRows()[TableUtils.getCellInfo(TableUtils.getCell(this.oTable, oTarget)).rowIndex];
			const bExpectSelected = !this.oSelectionPlugin.isSelected(oRow);
			let bCellClickFired = false;
			const onCellClick = (oEvent) => {
				oEvent.preventDefault();
				bCellClickFired = true;
			};

			if (mSettings.cellClickPreventDefault) {
				this.oTable.attachCellClick(onCellClick);
			}

			this.oSetSelected.resetHistory();

			sinon.assert.pass("Test: " + JSON.stringify({
				selectionBehavior: this.oTable.getSelectionBehavior(),
				target: oTarget.id,
				...mSettings
			}));

			qutils.triggerMouseEvent(oTarget, "tap");

			if (mSettings.cellClickPreventDefault && !bCellClickFired) {
				sinon.assert.fail("cellClick was expected to be fired, but was not fired");
			}

			if (mSettings.cellClickPreventDefault || mSettings.shouldNotCallPlugin) {
				sinon.assert.notCalled(this.oSetSelected);
			} else {
				sinon.assert.alwaysCalledWithExactly(this.oSetSelected, oRow, bExpectSelected);
				sinon.assert.callCount(this.oSetSelected, 1);
			}

			this.oTable.detachCellClick(onCellClick);
		}
	});

	QUnit.test("Row selection", function(assert) {
		// selectionBehavior = RowSelector
		this.testRowSelection(this.oTable.qunit.getRowHeaderCell(0));
		this.testRowSelection(this.oTable.qunit.getDataCell(0, 0), {shouldNotCallPlugin: true});
		this.testRowSelection(this.oTable.qunit.getRowActionCell(0), {shouldNotCallPlugin: true});

		this.oTable.setSelectionBehavior(library.SelectionBehavior.Row);
		this.testRowSelection(this.oTable.qunit.getRowHeaderCell(0));
		this.testRowSelection(this.oTable.qunit.getDataCell(0, 0));
		this.testRowSelection(this.oTable.qunit.getDataCell(0, 0), {cellClickPreventDefault: true});
		this.testRowSelection(this.oTable.qunit.getRowActionCell(0));

		this.oTable.setSelectionBehavior(library.SelectionBehavior.RowOnly);
		this.testRowSelection(this.oTable.qunit.getRowHeaderCell(0), {shouldNotCallPlugin: true});
		this.testRowSelection(this.oTable.qunit.getDataCell(0, 0));
		this.testRowSelection(this.oTable.qunit.getDataCell(0, 0), {cellClickPreventDefault: true});
		this.testRowSelection(this.oTable.qunit.getRowActionCell(0));
	});

	QUnit.test("Cell in group header row", async function(assert) {
		TableUtils.Grouping.setHierarchyMode(TableUtils.Grouping.HierarchyMode.Group);
		await this.oTable.qunit.setRowStates([{type: Row.prototype.Type.GroupHeader}]);

		// selectionBehavior = RowSelector
		this.testRowSelection(this.oTable.qunit.getRowHeaderCell(0));
		this.testRowSelection(this.oTable.qunit.getDataCell(0, 0), {shouldNotCallPlugin: true});
		this.testRowSelection(this.oTable.qunit.getRowActionCell(0), {shouldNotCallPlugin: true});

		this.oTable.setSelectionBehavior(library.SelectionBehavior.Row);
		this.testRowSelection(this.oTable.qunit.getRowHeaderCell(0));
		this.testRowSelection(this.oTable.qunit.getDataCell(0, 0));
		this.testRowSelection(this.oTable.qunit.getDataCell(0, 0), {cellClickPreventDefault: true});
		this.testRowSelection(this.oTable.qunit.getRowActionCell(0));

		this.oTable.setSelectionBehavior(library.SelectionBehavior.RowOnly);
		this.testRowSelection(this.oTable.qunit.getRowHeaderCell(0), {shouldNotCallPlugin: true});
		this.testRowSelection(this.oTable.qunit.getDataCell(0, 0));
		this.testRowSelection(this.oTable.qunit.getDataCell(0, 0), {cellClickPreventDefault: true});
		this.testRowSelection(this.oTable.qunit.getRowActionCell(0));
	});

	QUnit.test("Cell in summary row", async function(assert) {
		await this.oTable.qunit.setRowStates([{type: Row.prototype.Type.Summary}]);

		// selectionBehavior = RowSelector
		this.testRowSelection(this.oTable.qunit.getRowHeaderCell(0), {shouldNotCallPlugin: true});
		this.testRowSelection(this.oTable.qunit.getDataCell(0, 0), {shouldNotCallPlugin: true});
		this.testRowSelection(this.oTable.qunit.getRowActionCell(0), {shouldNotCallPlugin: true});

		this.oTable.setSelectionBehavior(library.SelectionBehavior.Row);
		this.testRowSelection(this.oTable.qunit.getRowHeaderCell(0), {shouldNotCallPlugin: true});
		this.testRowSelection(this.oTable.qunit.getDataCell(0, 0), {shouldNotCallPlugin: true});
		this.testRowSelection(this.oTable.qunit.getRowActionCell(0), {shouldNotCallPlugin: true});

		this.oTable.setSelectionBehavior(library.SelectionBehavior.RowOnly);
		this.testRowSelection(this.oTable.qunit.getRowHeaderCell(0), {shouldNotCallPlugin: true});
		this.testRowSelection(this.oTable.qunit.getDataCell(0, 0), {shouldNotCallPlugin: true});
		this.testRowSelection(this.oTable.qunit.getRowActionCell(0), {shouldNotCallPlugin: true});
	});

	QUnit.test("Cell in empty row", function(assert) {
		this.oTable.setSelectionBehavior(library.SelectionBehavior.Row);
		this.testRowSelection(this.oTable.qunit.getRowHeaderCell(-1), {shouldNotCallPlugin: true});
		this.testRowSelection(this.oTable.qunit.getDataCell(-1, -1), {shouldNotCallPlugin: true});
		this.testRowSelection(this.oTable.qunit.getRowActionCell(-1), {shouldNotCallPlugin: true});
	});

	QUnit.test("Range selection", function(assert) {
		const testRangeSelection = (oTarget, bExpectPluginCall = true) => {
			this.oSetSelected.resetHistory();

			sinon.assert.pass("Test: " + JSON.stringify({
				selectionBehavior: this.oTable.getSelectionBehavior(),
				target: oTarget.id
			}));

			qutils.triggerEvent("tap", oTarget, {shiftKey: true});

			if (bExpectPluginCall) {
				const oRow = this.oTable.getRows()[TableUtils.getCellInfo(TableUtils.getCell(this.oTable, oTarget)).rowIndex];
				sinon.assert.alwaysCalledWithExactly(this.oSetSelected, oRow, true, {range: true});
				sinon.assert.callCount(this.oSetSelected, 1);
			} else {
				sinon.assert.notCalled(this.oSetSelected);
			}
		};

		// selectionBehavior = RowSelector
		testRangeSelection(this.oTable.qunit.getRowHeaderCell(0));
		testRangeSelection(this.oTable.qunit.getRowHeaderCell(4), false); // Empty row
		testRangeSelection(this.oTable.qunit.getRowHeaderCell(1));
		testRangeSelection(this.oTable.qunit.getDataCell(0, 0), false);
		testRangeSelection(this.oTable.qunit.getRowActionCell(0), false);

		this.oTable.setSelectionBehavior(library.SelectionBehavior.Row);
		testRangeSelection(this.oTable.qunit.getRowHeaderCell(0));
		testRangeSelection(this.oTable.qunit.getDataCell(0, 0));
		testRangeSelection(this.oTable.qunit.getRowActionCell(0));

		this.oTable.setSelectionBehavior(library.SelectionBehavior.RowOnly);
		testRangeSelection(this.oTable.qunit.getRowHeaderCell(0), false);
		testRangeSelection(this.oTable.qunit.getDataCell(0, 0));
		testRangeSelection(this.oTable.qunit.getRowActionCell(0));
	});

	QUnit.test("Header selector press", function(assert) {
		const oHeaderSelectorPress = this.spy(this.oSelectionPlugin, "onHeaderSelectorPress");

		qutils.triggerMouseEvent(this.oTable.qunit.getSelectAllCell(), "tap");
		sinon.assert.alwaysCalledWithExactly(oHeaderSelectorPress);
		sinon.assert.callCount(oHeaderSelectorPress, 1);
	});

	QUnit.module("Column Reordering", {
		beforeEach: async function() {
			this.oTable = TableQUnitUtils.createTable();
			this.oTreeTable = TableQUnitUtils.createTable(TreeTable, mTreeTableSettings());
			await Promise.all([
				this.oTable.qunit.rendered(),
				this.oTreeTable.qunit.rendered()
			]);
		},
		afterEach: function() {
			this.oTable.destroy();
			this.oTreeTable.destroy();
		}
	});

	function computeSettingsForReordering(oTable, iIndex, bIncreaseIndex) {
		const oSettings = {
			column: oTable._getVisibleColumns()[iIndex],
			relatedColumn: oTable._getVisibleColumns()[bIncreaseIndex ? iIndex + 1 : iIndex - 1]
		};

		const initialXPos = 2; //Move mouse 2px from left onto the column

		oSettings.top = Math.floor(oSettings.column.getDomRef().getBoundingClientRect().top);
		oSettings.left = Math.floor(oSettings.column.getDomRef().getBoundingClientRect().left) + initialXPos;
		oSettings.breakeven = (bIncreaseIndex ? oSettings.column.$().outerWidth() : 0) - initialXPos + oSettings.relatedColumn.$().outerWidth() / 2;

		return oSettings;
	}

	QUnit.test("Reordering via Drag&Drop - increase Index", async function(assert) {
		const oTable = this.oTable;
		const oSettings = computeSettingsForReordering(oTable, 2, true);
		const oColumn = oSettings.column;
		const iLeft = oSettings.left + oSettings.breakeven;

		assert.equal(oTable.indexOfColumn(oColumn), 2, "Initial index of column");

		qutils.triggerMouseEvent(oColumn.$(), "mousedown", 1, 1, oSettings.left, oSettings.top, 0);
		await TableQUnitUtils.sleep(250);

		qutils.triggerMouseEvent(oColumn.$(), "mousemove", 1, 1, iLeft - 30, oSettings.top, 0);
		qutils.triggerMouseEvent(oColumn.$(), "mousemove", 1, 1, iLeft - 20, oSettings.top, 0);
		qutils.triggerMouseEvent(oColumn.$(), "mouseup", 1, 1, iLeft - 20, oSettings.top, 0);
		await TableQUnitUtils.sleep(100);
		await nextUIUpdate();

		assert.equal(oTable.indexOfColumn(oColumn), 2, "Index of column not changed because not dragged enough");
		qutils.triggerMouseEvent(oColumn.$(), "mousedown", 1, 1, oSettings.left, oSettings.top, 0);
		await TableQUnitUtils.sleep(250);

		qutils.triggerMouseEvent(oColumn.$(), "mousemove", 1, 1, iLeft - 20, oSettings.top, 0);
		qutils.triggerMouseEvent(oColumn.$(), "mousemove", 1, 1, iLeft + 20, oSettings.top, 0);
		qutils.triggerMouseEvent(oColumn.$(), "mouseup", 1, 1, iLeft + 20, oSettings.top, 0);
		assert.equal(oTable.indexOfColumn(oColumn), 3, "Index of column changed");

		await nextUIUpdate();
		assert.strictEqual(document.activeElement, oColumn.getDomRef(), "Focused element");
		assert.strictEqual(oTable._getKeyboardExtension()._itemNavigation.getFocusedDomRef(), oColumn.getDomRef(),
			"Focused element in item navigation");
	});

	QUnit.test("Reordering via Drag&Drop - decrease Index", async function(assert) {
		const oTable = this.oTable;
		const oSettings = computeSettingsForReordering(oTable, 2, false);
		const oColumn = oSettings.column;
		const iLeft = oSettings.left - oSettings.breakeven;

		assert.equal(oTable.indexOfColumn(oColumn), 2, "Initial index of column");

		qutils.triggerMouseEvent(oColumn.$(), "mousedown", 1, 1, oSettings.left, oSettings.top, 0);
		await TableQUnitUtils.sleep(250);

		qutils.triggerMouseEvent(oColumn.$(), "mousemove", 1, 1, iLeft + 30, oSettings.top, 0);
		qutils.triggerMouseEvent(oColumn.$(), "mousemove", 1, 1, iLeft + 20, oSettings.top, 0);
		qutils.triggerMouseEvent(oColumn.$(), "mouseup", 1, 1, iLeft + 20, oSettings.top, 0);
		await TableQUnitUtils.sleep(100);

		await nextUIUpdate();
		assert.equal(oTable.indexOfColumn(oColumn), 2, "Index of column not changed because not dragged enough");

		qutils.triggerMouseEvent(oColumn.$(), "mousedown", 1, 1, oSettings.left, oSettings.top, 0);
		await TableQUnitUtils.sleep(250);

		qutils.triggerMouseEvent(oColumn.$(), "mousemove", 1, 1, iLeft + 20, oSettings.top, 0);
		qutils.triggerMouseEvent(oColumn.$(), "mousemove", 1, 1, iLeft - 20, oSettings.top, 0);
		qutils.triggerMouseEvent(oColumn.$(), "mouseup", 1, 1, iLeft - 20, oSettings.top, 0);
		assert.equal(oTable.indexOfColumn(oColumn), 1, "Index of column changed");

		await nextUIUpdate();
		assert.strictEqual(document.activeElement, oColumn.getDomRef(), "Focused element");
		assert.strictEqual(oTable._getKeyboardExtension()._itemNavigation.getFocusedDomRef(), oColumn.getDomRef(),
			"Focused element in item navigation");
	});

	QUnit.test("No Reordering of fixed columns (within fixed)", async function(assert) {
		const oTable = this.oTable;
		oTable.setFixedColumnCount(4);
		await nextUIUpdate();

		const oSettings = computeSettingsForReordering(oTable, 2, true);
		const oColumn = oSettings.column;
		const iLeft = oSettings.left + oSettings.breakeven;

		assert.equal(oTable.indexOfColumn(oColumn), 2, "Initial index of column");

		qutils.triggerMouseEvent(oColumn.$(), "mousedown", 1, 1, oSettings.left, oSettings.top, 0);
		await TableQUnitUtils.sleep(250);

		qutils.triggerMouseEvent(oColumn.$(), "mousemove", 1, 1, iLeft - 30, oSettings.top, 0);
		qutils.triggerMouseEvent(oColumn.$(), "mousemove", 1, 1, iLeft + 20, oSettings.top, 0);
		qutils.triggerMouseEvent(oColumn.$(), "mouseup", 1, 1, iLeft + 20, oSettings.top, 0);
		await TableQUnitUtils.sleep(100);

		await nextUIUpdate();
		assert.equal(oTable.indexOfColumn(oColumn), 2, "Index of column not changed");
	});

	QUnit.test("No Reordering of fixed columns (fixed to not fixed)", async function(assert) {
		const oTable = this.oTable;
		oTable.setFixedColumnCount(3);
		await nextUIUpdate();

		const oSettings = computeSettingsForReordering(oTable, 2, true);
		const oColumn = oSettings.column;
		const iLeft = oSettings.left + oSettings.breakeven;

		assert.equal(oTable.indexOfColumn(oColumn), 2, "Initial index of column");

		qutils.triggerMouseEvent(oColumn.$(), "mousedown", 1, 1, oSettings.left, oSettings.top, 0);
		await TableQUnitUtils.sleep(250);

		qutils.triggerMouseEvent(oColumn.$(), "mousemove", 1, 1, iLeft - 30, oSettings.top, 0);
		qutils.triggerMouseEvent(oColumn.$(), "mousemove", 1, 1, iLeft + 20, oSettings.top, 0);
		qutils.triggerMouseEvent(oColumn.$(), "mouseup", 1, 1, iLeft + 20, oSettings.top, 0);
		await TableQUnitUtils.sleep(100);

		await nextUIUpdate();
		assert.equal(oTable.indexOfColumn(oColumn), 2, "Index of column not changed");
	});

	QUnit.test("No Reordering of fixed columns (not fixed to fixed)", async function(assert) {
		const oTable = this.oTable;
		oTable.setFixedColumnCount(2);
		await nextUIUpdate();

		const oSettings = computeSettingsForReordering(oTable, 2, false);
		const oColumn = oSettings.column;
		const iLeft = oSettings.left - oSettings.breakeven;

		assert.equal(oTable.indexOfColumn(oColumn), 2, "Initial index of column");

		qutils.triggerMouseEvent(oColumn.$(), "mousedown", 1, 1, oSettings.left, oSettings.top, 0);
		await TableQUnitUtils.sleep(250);

		qutils.triggerMouseEvent(oColumn.$(), "mousemove", 1, 1, iLeft + 30, oSettings.top, 0);
		qutils.triggerMouseEvent(oColumn.$(), "mousemove", 1, 1, iLeft - 20, oSettings.top, 0);
		qutils.triggerMouseEvent(oColumn.$(), "mouseup", 1, 1, iLeft - 20, oSettings.top, 0);
		await TableQUnitUtils.sleep(100);

		await nextUIUpdate();
		assert.equal(oTable.indexOfColumn(oColumn), 2, "Index of column not changed");
	});

	QUnit.test("TreeTable - No Reordering via Drag&Drop of first column - increase index", async function(assert) {
		const oTreeTable = this.oTreeTable;
		const done = assert.async();
		oTreeTable.setFixedColumnCount(0);
		await nextUIUpdate();

		const oSettings = computeSettingsForReordering(oTreeTable, 0, true);
		const oColumn = oSettings.column;
		const iLeft = oSettings.left + oSettings.breakeven;

		assert.equal(oTreeTable.indexOfColumn(oColumn), 0, "Initial index of column");

		qutils.triggerMouseEvent(oColumn.$(), "mousedown", 1, 1, oSettings.left, oSettings.top, 0);
		await TableQUnitUtils.sleep(250);

		qutils.triggerMouseEvent(oColumn.$(), "mousemove", 1, 1, iLeft - 30, oSettings.top, 0);
		qutils.triggerMouseEvent(oColumn.$(), "mousemove", 1, 1, iLeft - 20, oSettings.top, 0);
		qutils.triggerMouseEvent(oColumn.$(), "mouseup", 1, 1, iLeft - 20, oSettings.top, 0);
		await TableQUnitUtils.sleep(100);
		await nextUIUpdate();

		assert.equal(oTreeTable.indexOfColumn(oColumn), 0, "Index of column not changed because not dragged enough");

		qutils.triggerMouseEvent(oColumn.$(), "mousedown", 1, 1, oSettings.left, oSettings.top, 0);
		await TableQUnitUtils.sleep(250);

		qutils.triggerMouseEvent(oColumn.$(), "mousemove", 1, 1, iLeft - 30, oSettings.top, 0);
		qutils.triggerMouseEvent(oColumn.$(), "mousemove", 1, 1, iLeft + 20, oSettings.top, 0);
		qutils.triggerMouseEvent(oColumn.$(), "mouseup", 1, 1, iLeft + 20, oSettings.top, 0);
		await TableQUnitUtils.sleep(100);

		await nextUIUpdate();
		assert.equal(oTreeTable.indexOfColumn(oColumn), 0, "Index of column not changed");
		done();
	});

	QUnit.test("TreeTable - No Reordering via Drag&Drop of first column - decrease index", async function(assert) {
		const oTreeTable = this.oTreeTable;
		const done = assert.async();
		oTreeTable.setFixedColumnCount(0);
		await nextUIUpdate();

		const oSettings = computeSettingsForReordering(oTreeTable, 1, false);
		const oColumn = oSettings.column;
		const iLeft = oSettings.left - oSettings.breakeven;

		assert.equal(oTreeTable.indexOfColumn(oColumn), 1, "Initial index of column");

		qutils.triggerMouseEvent(oColumn.$(), "mousedown", 1, 1, oSettings.left, oSettings.top, 0);
		setTimeout(() => {
			qutils.triggerMouseEvent(oColumn.$(), "mousemove", 1, 1, iLeft + 30, oSettings.top, 0);
			qutils.triggerMouseEvent(oColumn.$(), "mousemove", 1, 1, iLeft - 20, oSettings.top, 0);
			qutils.triggerMouseEvent(oColumn.$(), "mouseup", 1, 1, iLeft - 20, oSettings.top, 0);
			setTimeout(async () => {
				await nextUIUpdate();
				assert.equal(oTreeTable.indexOfColumn(oColumn), 1, "Index of column not changed");
				done();
			}, 100);
		}, 250);
	});

	QUnit.module("Reorder helpers - Ghost", {
		beforeEach: async function() {
			this.oTable = TableQUnitUtils.createTable({
				columns: [
					// Single-header column (plain label aggregation)
					new Column({
						label: new TableQUnitUtils.TestControl({text: "Single"}),
						template: new TableQUnitUtils.TestControl({text: "content"})
					}),
					// Multi-header: label in the first header row, second row empty
					new Column({
						multiLabels: [
							new TableQUnitUtils.TestControl({text: "R1only"})
						],
						template: new TableQUnitUtils.TestControl({text: "content"})
					}),
					// Multi-header: label in the second header row, first row empty
					new Column({
						multiLabels: [
							new TableQUnitUtils.TestControl({text: "Group", visible: false}),
							new TableQUnitUtils.TestControl({text: "R2only"})
						],
						template: new TableQUnitUtils.TestControl({text: "content"})
					}),
					// Multi-header: label in both header rows
					new Column({
						multiLabels: [
							new TableQUnitUtils.TestControl({text: "Both1"}),
							new TableQUnitUtils.TestControl({text: "Both2"})
						],
						template: new TableQUnitUtils.TestControl({text: "content"})
					})
				]
			});
			await this.oTable.qunit.rendered();
			const oPointerExtension = this.oTable._getPointerExtension();
			oPointerExtension._debug();
			this.oReorderHelper = oPointerExtension._ReorderHelper;
		},
		afterEach: function() {
			this.oTable.destroy();
		},
		getGhostText: function() {
			const oGhost = this.oTable.getDomRef("roghost");
			return oGhost ? oGhost.textContent.trim() : null;
		},
		cleanupReorder: function() {
			// Unbind the document handlers attached by initReordering and remove the created DOM
			jQuery(document).off(".sapUiColumnMove");
			this.oTable._oReorderGhost?.remove();
			delete this.oTable._oReorderGhost;
			this.oTable._oReorderIndicator?.remove();
			delete this.oTable._oReorderIndicator;
		}
	});

	QUnit.test("Single-header column in a single-row header", async function(assert) {
		// Collapse the multi-header columns to plain labels so the table renders only a single header row
		this.oTable.getColumns().forEach((oColumn, iIndex) => {
			if (oColumn.getMultiLabels().length > 0) {
				oColumn.destroyMultiLabels();
				oColumn.setLabel(new TableQUnitUtils.TestControl({text: "Plain" + iIndex}));
			}
		});
		await this.oTable.qunit.rendered();

		this.oReorderHelper.initReordering(this.oTable, 1, createPointerEvent("mousedown"));

		assert.strictEqual(this.getGhostText(), "Plain1", "Ghost contains the column header label");

		this.cleanupReorder();
	});

	QUnit.test("Single-header column in a multi-row header", function(assert) {
		this.oReorderHelper.initReordering(this.oTable, 0, createPointerEvent("mousedown"));

		assert.strictEqual(this.getGhostText(), "Single", "Ghost contains the column header label");

		this.cleanupReorder();
	});

	QUnit.test("Multi-header column", function(assert) {
		const aScenarios = [
			{index: 1, expected: "R1only", description: "Label in the first header row, second row empty"},
			{index: 2, expected: "R2only", description: "Label in the second header row, first row empty"},
			{index: 3, expected: "Both2", description: "Label in both header rows"}
		];

		assert.strictEqual(TableUtils.getHeaderRowCount(this.oTable), 2, "Table renders two header rows");

		aScenarios.forEach((oScenario) => {
			this.oReorderHelper.initReordering(this.oTable, oScenario.index, createPointerEvent("mousedown"));
			assert.strictEqual(this.getGhostText(), oScenario.expected, oScenario.description);
			this.cleanupReorder();
		});
	});

	QUnit.module("Row Hover Effect", {
		beforeEach: async function() {
			this.oTable = TableQUnitUtils.createTable();
			await this.oTable.qunit.rendered();
			this.oTable.setSelectionBehavior(library.SelectionBehavior.Row);
			this.oTable.invalidate();
			await nextUIUpdate();
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("RowHeader", function(assert) {
		const oTable = this.oTable;
		assert.ok(!jQuery(oTable.qunit.getRowHeaderCell(0)).parent().hasClass("sapUiTableRowHvr"), "No hover effect on row header");
		assert.ok(!jQuery(oTable.qunit.getDataCell(0, 0)).parent().hasClass("sapUiTableRowHvr"), "No hover effect on fixed part of row");
		assert.ok(!jQuery(oTable.qunit.getDataCell(0, 2)).parent().hasClass("sapUiTableRowHvr"), "No hover effect on scroll part of row");
		jQuery(oTable.qunit.getRowHeaderCell(0)).trigger("mouseover");
		assert.ok(jQuery(oTable.qunit.getRowHeaderCell(0)).parent().hasClass("sapUiTableRowHvr"), "Hover effect on row header");
		assert.ok(jQuery(oTable.qunit.getDataCell(0, 0)).parent().hasClass("sapUiTableRowHvr"), "Hover effect on fixed part of row");
		assert.ok(jQuery(oTable.qunit.getDataCell(0, 2)).parent().hasClass("sapUiTableRowHvr"), "Hover effect on scroll part of row");
		jQuery(oTable.qunit.getRowHeaderCell(0)).trigger("mouseout");
		assert.ok(!jQuery(oTable.qunit.getRowHeaderCell(0)).parent().hasClass("sapUiTableRowHvr"), "No hover effect on row header");
		assert.ok(!jQuery(oTable.qunit.getDataCell(0, 0)).parent().hasClass("sapUiTableRowHvr"), "No hover effect on fixed part of row");
		assert.ok(!jQuery(oTable.qunit.getDataCell(0, 2)).parent().hasClass("sapUiTableRowHvr"), "No hover effect on scroll part of row");
	});

	QUnit.test("Fixed column area", function(assert) {
		const oTable = this.oTable;
		assert.ok(!jQuery(oTable.qunit.getRowHeaderCell(0)).parent().hasClass("sapUiTableRowHvr"), "No hover effect on row header");
		assert.ok(!jQuery(oTable.qunit.getDataCell(0, 0)).parent().hasClass("sapUiTableRowHvr"), "No hover effect on fixed part of row");
		assert.ok(!jQuery(oTable.qunit.getDataCell(0, 2)).parent().hasClass("sapUiTableRowHvr"), "No hover effect on scroll part of row");
		jQuery(oTable.qunit.getDataCell(0, 0)).trigger("mouseover");
		assert.ok(jQuery(oTable.qunit.getRowHeaderCell(0)).parent().hasClass("sapUiTableRowHvr"), "Hover effect on row header");
		assert.ok(jQuery(oTable.qunit.getDataCell(0, 0)).parent().hasClass("sapUiTableRowHvr"), "Hover effect on fixed part of row");
		assert.ok(jQuery(oTable.qunit.getDataCell(0, 2)).parent().hasClass("sapUiTableRowHvr"), "Hover effect on scroll part of row");
		jQuery(oTable.qunit.getDataCell(0, 0)).trigger("mouseout");
		assert.ok(!jQuery(oTable.qunit.getRowHeaderCell(0)).parent().hasClass("sapUiTableRowHvr"), "No hover effect on row header");
		assert.ok(!jQuery(oTable.qunit.getDataCell(0, 0)).parent().hasClass("sapUiTableRowHvr"), "No hover effect on fixed part of row");
		assert.ok(!jQuery(oTable.qunit.getDataCell(0, 2)).parent().hasClass("sapUiTableRowHvr"), "No hover effect on scroll part of row");
	});

	QUnit.test("Scroll column area", function(assert) {
		const oTable = this.oTable;
		assert.ok(!jQuery(oTable.qunit.getRowHeaderCell(0)).parent().hasClass("sapUiTableRowHvr"), "No hover effect on row header");
		assert.ok(!jQuery(oTable.qunit.getDataCell(0, 0)).parent().hasClass("sapUiTableRowHvr"), "No hover effect on fixed part of row");
		assert.ok(!jQuery(oTable.qunit.getDataCell(0, 2)).parent().hasClass("sapUiTableRowHvr"), "No hover effect on scroll part of row");
		jQuery(oTable.qunit.getDataCell(0, 2)).trigger("mouseover");
		assert.ok(jQuery(oTable.qunit.getRowHeaderCell(0)).parent().hasClass("sapUiTableRowHvr"), "Hover effect on row header");
		assert.ok(jQuery(oTable.qunit.getDataCell(0, 0)).parent().hasClass("sapUiTableRowHvr"), "Hover effect on fixed part of row");
		assert.ok(jQuery(oTable.qunit.getDataCell(0, 2)).parent().hasClass("sapUiTableRowHvr"), "Hover effect on scroll part of row");
		jQuery(oTable.qunit.getDataCell(0, 2)).trigger("mouseout");
		assert.ok(!jQuery(oTable.qunit.getRowHeaderCell(0)).parent().hasClass("sapUiTableRowHvr"), "No hover effect on row header");
		assert.ok(!jQuery(oTable.qunit.getDataCell(0, 0)).parent().hasClass("sapUiTableRowHvr"), "No hover effect on fixed part of row");
		assert.ok(!jQuery(oTable.qunit.getDataCell(0, 2)).parent().hasClass("sapUiTableRowHvr"), "No hover effect on scroll part of row");
	});

	QUnit.test("Row Hover Effect depending on SelectionMode and SelectionBehavior", async function(assert) {
		const oTable = this.oTable;
		oTable.setSelectionMode("None");
		oTable.invalidate();
		await nextUIUpdate();
		jQuery(oTable.qunit.getDataCell(0, 2)).trigger("mouseover");
		assert.ok(!jQuery(oTable.qunit.getRowHeaderCell(0)).parent().hasClass("sapUiTableRowHvr"), "No hover effect on row header");
		assert.ok(!jQuery(oTable.qunit.getDataCell(0, 0)).parent().hasClass("sapUiTableRowHvr"), "No hover effect on fixed part of row");
		assert.ok(!jQuery(oTable.qunit.getDataCell(0, 2)).parent().hasClass("sapUiTableRowHvr"), "No hover effect on scroll part of row");
		jQuery(oTable.qunit.getDataCell(0, 2)).trigger("mouseout");
		oTable.setSelectionBehavior(library.SelectionBehavior.RowOnly);
		oTable.invalidate();
		await nextUIUpdate();
		jQuery(oTable.qunit.getDataCell(0, 2)).trigger("mouseover");
		assert.ok(!jQuery(oTable.qunit.getRowHeaderCell(0)).parent().hasClass("sapUiTableRowHvr"), "No hover effect on row header");
		assert.ok(!jQuery(oTable.qunit.getDataCell(0, 0)).parent().hasClass("sapUiTableRowHvr"), "No hover effect on fixed part of row");
		assert.ok(!jQuery(oTable.qunit.getDataCell(0, 2)).parent().hasClass("sapUiTableRowHvr"), "No hover effect on scroll part of row");
		jQuery(oTable.qunit.getDataCell(0, 2)).trigger("mouseout");
		oTable.setSelectionMode("MultiToggle");
		oTable.setSelectionBehavior(library.SelectionBehavior.Row);
		oTable.invalidate();
		await nextUIUpdate();
		jQuery(oTable.qunit.getDataCell(0, 2)).trigger("mouseover");
		assert.ok(jQuery(oTable.qunit.getRowHeaderCell(0)).parent().hasClass("sapUiTableRowHvr"), "Hover effect on row header");
		assert.ok(jQuery(oTable.qunit.getDataCell(0, 0)).parent().hasClass("sapUiTableRowHvr"), "Hover effect on fixed part of row");
		assert.ok(jQuery(oTable.qunit.getDataCell(0, 2)).parent().hasClass("sapUiTableRowHvr"), "Hover effect on scroll part of row");
		jQuery(oTable.qunit.getDataCell(0, 2)).trigger("mouseout");
		oTable.setSelectionBehavior(library.SelectionBehavior.RowOnly);
		oTable.invalidate();
		await nextUIUpdate();
		jQuery(oTable.qunit.getDataCell(0, 2)).trigger("mouseover");
		assert.ok(jQuery(oTable.qunit.getRowHeaderCell(0)).parent().hasClass("sapUiTableRowHvr"), "Hover effect on row header");
		assert.ok(jQuery(oTable.qunit.getDataCell(0, 0)).parent().hasClass("sapUiTableRowHvr"), "Hover effect on fixed part of row");
		assert.ok(jQuery(oTable.qunit.getDataCell(0, 2)).parent().hasClass("sapUiTableRowHvr"), "Hover effect on scroll part of row");
		jQuery(oTable.qunit.getDataCell(0, 2)).trigger("mouseout");
		oTable.setSelectionMode("None");
		oTable.setSelectionBehavior(library.SelectionBehavior.RowSelector);
		oTable.invalidate();
		await nextUIUpdate();
		oTable.attachCellClick(() => {});
		jQuery(oTable.qunit.getDataCell(0, 2)).trigger("mouseover");
		assert.ok(jQuery(oTable.qunit.getRowHeaderCell(0)).parent().hasClass("sapUiTableRowHvr"), "Hover effect on row header");
		assert.ok(jQuery(oTable.qunit.getDataCell(0, 0)).parent().hasClass("sapUiTableRowHvr"), "Hover effect on fixed part of row");
		assert.ok(jQuery(oTable.qunit.getDataCell(0, 2)).parent().hasClass("sapUiTableRowHvr"), "Hover effect on scroll part of row");
	});

	QUnit.module("Helpers", {
		beforeEach: async function() {
			this.oTable = TableQUnitUtils.createTable();
			await this.oTable.qunit.rendered();
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("_debug()", function(assert) {
		const oTable = this.oTable;
		const oExtension = oTable._getPointerExtension();
		assert.ok(!oExtension._ExtensionHelper, "_ExtensionHelper: No debug mode");
		assert.ok(!oExtension._ColumnResizeHelper, "_ColumnResizeHelper: No debug mode");
		assert.ok(!oExtension._ReorderHelper, "_ReorderHelper: No debug mode");
		assert.ok(!oExtension._ExtensionDelegate, "_ExtensionDelegate: No debug mode");
		assert.ok(!oExtension._RowHoverHandler, "_RowHoverHandler: No debug mode");
		assert.ok(!oExtension._KNOWNCLICKABLECONTROLS, "_KNOWNCLICKABLECONTROLS: No debug mode");

		oExtension._debug();
		assert.ok(!!oExtension._delegate, "_Delegate: Debug mode");
		assert.ok(!!oExtension._ExtensionHelper, "_ExtensionHelper: Debug mode");
		assert.ok(!!oExtension._ColumnResizeHelper, "_ColumnResizeHelper: Debug mode");
		assert.ok(!!oExtension._ReorderHelper, "_ReorderHelper: Debug mode");
		assert.ok(!!oExtension._ExtensionDelegate, "_ExtensionDelegate: Debug mode");
		assert.ok(!!oExtension._RowHoverHandler, "_RowHoverHandler: Debug mode");
		assert.ok(!!oExtension._KNOWNCLICKABLECONTROLS, "_KNOWNCLICKABLECONTROLS: Debug mode");
	});

	QUnit.test("showColumnResizer", function(assert) {
		const oTable = this.oTable;
		const oExtension = oTable._getPointerExtension();
		const oColumn = oTable._getVisibleColumns()[1];
		const oColumnHeaderRect = oTable._aTableHeaders[oColumn.getIndex()].getBoundingClientRect();
		const oTableRect = oTable.getDomRef("sapUiTableCnt").getBoundingClientRect();

		oExtension.showColumnResizer(oColumn);

		assert.ok(oTable.getDomRef().classList.contains("sapUiTableResizing"), "Table has resizing class");
		assert.ok(oTable._oColResize.classList.contains("sapUiTableColRszActive"), "Resizer marked active");
		assert.strictEqual(oTable._oColResize.style.left, (oColumnHeaderRect.right - oTableRect.left) + "px",
			"Resizer positioned at the column's right edge in LTR mode");
	});

	QUnit.test("showColumnResizer in RTL mode", function(assert) {
		const oTable = this.oTable;
		const oExtension = oTable._getPointerExtension();
		const oColumn = oTable._getVisibleColumns()[1];
		const oColumnHeaderRect = oTable._aTableHeaders[oColumn.getIndex()].getBoundingClientRect();
		const oTableRect = oTable.getDomRef("sapUiTableCnt").getBoundingClientRect();

		oTable._bRtlMode = true;
		oExtension.showColumnResizer(oColumn);
		oTable._bRtlMode = false;

		assert.strictEqual(oTable._oColResize.style.left, (oColumnHeaderRect.left - oTableRect.left) + "px",
			"Resizer positioned at the column's left edge in RTL mode");
	});

	QUnit.module("Column resize helpers", {
		beforeEach: async function() {
			this.oTable = TableQUnitUtils.createTable();
			await this.oTable.qunit.rendered();
			this.oPointerExtension = this.oTable._getPointerExtension();
			this.oPointerExtension._debug();
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("onMouseMoveWhileColumnResizing prevents default for touch events", function(assert) {
		const oTable = this.oTable;
		const ColumnResizeHelper = this.oPointerExtension._ColumnResizeHelper;

		oTable._oColResize = oTable.getDomRef("rsz");
		oTable._iColumnResizeStart = 0;

		const oEvent = jQuery.Event({type: "touchmove"});
		oEvent.originalEvent = {
			touches: [{pageX: 100, pageY: 0, clientX: 100, clientY: 0}],
			stopPropagation: function() {},
			preventDefault: function() {}
		};

		ColumnResizeHelper.onMouseMoveWhileColumnResizing.call(oTable, oEvent);

		assert.ok(oEvent.isDefaultPrevented(), "Default is prevented on touch");
		assert.ok(oEvent.isPropagationStopped(), "Propagation is stopped on touch");
	});

	QUnit.test("Resizer position is not updated while a resize is already in progress", function(assert) {
		const oTable = this.oTable;
		oTable._bIsColumnResizerMoving = true;
		const sInitialLeft = oTable.$("rsz").css("left");

		const oEvent = jQuery.Event({type: "mousemove"});
		oEvent.target = oTable.getColumns()[1].getDomRef();
		oEvent.clientX = oTable._aTableHeaders[1].getBoundingClientRect().left + 50;
		jQuery(oEvent.target).trigger(oEvent);

		assert.strictEqual(oTable.$("rsz").css("left"), sInitialLeft, "Resizer position unchanged");

		oTable._bIsColumnResizerMoving = false;
	});

	QUnit.test("Resizer position tracking in RTL mode", function(assert) {
		const oTable = this.oTable;
		oTable._bRtlMode = true;

		const oColumnHeaderRect = oTable._aTableHeaders[1].getBoundingClientRect();
		const oEvent = jQuery.Event({type: "mousemove"});
		oEvent.target = oTable.getColumns()[1].getDomRef();
		oEvent.clientX = oColumnHeaderRect.left + 5;
		jQuery(oEvent.target).trigger(oEvent);

		// In RTL, we expect the resizer to snap to the left of the hovered column
		const oTableRect = oTable.getDomRef("sapUiTableCnt").getBoundingClientRect();
		const iExpectedLeft = oColumnHeaderRect.left - oTableRect.left;
		assert.strictEqual(oTable.$("rsz").css("left"), iExpectedLeft + "px",
			"Resizer at left edge of column in RTL mode");

		oTable._bRtlMode = false;
	});

	QUnit.module("Tap and context menu handling", {
		beforeEach: async function() {
			this.oTable = TableQUnitUtils.createTable();
			await this.oTable.qunit.rendered();
			this.oPointerExtension = this.oTable._getPointerExtension();
			this.oPointerExtension._debug();
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("_skipClick returns true when event is marked on data cell", function(assert) {
		const oTable = this.oTable;
		const ExtensionHelper = this.oPointerExtension._ExtensionHelper;
		const $Cell = jQuery(oTable.qunit.getDataCell(0, 0));
		const oCellInfo = TableUtils.getCellInfo($Cell);
		const oEvent = jQuery.Event({type: "tap"});

		oEvent.setMarked();

		assert.strictEqual(ExtensionHelper._skipClick(oEvent, jQuery($Cell[0]), oCellInfo), true);
	});

	QUnit.test("oncontextmenu on non-cell content sets default menu flag", function(assert) {
		const oTable = this.oTable;
		const oEvent = jQuery.Event({type: "mousedown"});
		oEvent.button = 2;
		oEvent.target = oTable.getDomRef("sapUiTableCnt"); // container, not a cell
		jQuery(oEvent.target).trigger(oEvent);

		assert.ok(this.oPointerExtension._bShowDefaultMenu, "_bShowDefaultMenu set for non-cell right click");

		delete this.oPointerExtension._bShowDefaultMenu;
	});

	QUnit.test("ontap returns early for non-cell targets", function(assert) {
		const oTable = this.oTable;
		const oHandleClickSpy = this.spy(this.oPointerExtension._ExtensionHelper, "_handleClickSelection");
		const oOpenContextMenuSpy = this.spy(TableUtils.Menu, "openContextMenu");

		const oEvent = jQuery.Event({type: "tap"});
		oEvent.target = oTable.getDomRef("sapUiTableCnt");
		jQuery(oEvent.target).trigger(oEvent);

		assert.ok(oHandleClickSpy.notCalled, "_handleClickSelection not called");
		assert.ok(oOpenContextMenuSpy.notCalled, "openContextMenu not called");
	});

	QUnit.test("ontap on data cell is skipped when browser has an active text selection", function(assert) {
		const oTable = this.oTable;
		const oHandleClickSpy = this.spy(this.oPointerExtension._ExtensionHelper, "_handleClickSelection");
		const oGetSelectionStub = this.stub(window, "getSelection");

		oGetSelectionStub.returns({toString: () => "selected text"});

		qutils.triggerMouseEvent(oTable.qunit.getDataCell(0, 0), "tap");

		assert.ok(oHandleClickSpy.notCalled, "Selection prevents click handling");
	});

	QUnit.test("oncontextmenu is prevented while a column reorder is in progress", function(assert) {
		const oTable = this.oTable;
		this.oPointerExtension._bReorderInProgress = true;

		const oEvent = jQuery.Event({type: "contextmenu"});
		oEvent.target = oTable.qunit.getDataCell(0, 0);
		jQuery(oEvent.target).trigger(oEvent);

		assert.ok(oEvent.isDefaultPrevented(), "Default context menu prevented");
		assert.ok(oEvent.isMarked("sapUiTableHandledByPointerExtension"), "Event marked as handled");

		this.oPointerExtension._bReorderInProgress = false;
	});

	QUnit.module("Reorder helpers", {
		beforeEach: async function() {
			this.oTable = TableQUnitUtils.createTable();
			await this.oTable.qunit.rendered();
			this.oPointerExtension = this.oTable._getPointerExtension();
			this.oPointerExtension._debug();
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("findColumnForPosition returns null when position is outside every column", function(assert) {
		const oTable = this.oTable;
		const ReorderHelper = this.oPointerExtension._ReorderHelper;

		assert.strictEqual(ReorderHelper.findColumnForPosition(oTable, -10000), null, "Far-left position");
		assert.strictEqual(ReorderHelper.findColumnForPosition(oTable, 100000), null, "Far-right position");
	});

	QUnit.test("adaptReorderMarkerPosition returns without effect when position is falsy", function(assert) {
		const oTable = this.oTable;
		assert.expect(0);
		const ReorderHelper = this.oPointerExtension._ReorderHelper;

		// Both branches (bShow = true and bShow = false) must be safe to invoke without a position.
		ReorderHelper.adaptReorderMarkerPosition(oTable, null, true);
		ReorderHelper.adaptReorderMarkerPosition(oTable, undefined, false);
	});

	QUnit.test("onMouseMoveWhileReordering restores previous position when target column is missing", function(assert) {
		const oTable = this.oTable;
		const ReorderHelper = this.oPointerExtension._ReorderHelper;

		oTable._iDnDColIndex = 2;
		oTable._iNewColPos = 5;
		oTable._oReorderGhost = document.createElement("div");
		document.body.appendChild(oTable._oReorderGhost);
		this.stub(ReorderHelper, "findColumnForPosition").returns(null);

		const oEvent = jQuery.Event({type: "mousemove"});
		oEvent.clientX = -99999;
		oEvent.clientY = 0;

		ReorderHelper.onMouseMoveWhileReordering.call(oTable, oEvent);

		assert.strictEqual(oTable._iNewColPos, 5, "New position restored to previous value");

		oTable._oReorderGhost.remove();
		delete oTable._oReorderGhost;
		delete oTable._iDnDColIndex;
		delete oTable._iNewColPos;
	});

	QUnit.test("onMouseMoveWhileReordering triggers scroll near the trailing edge", function(assert) {
		const ReorderHelper = this.oPointerExtension._ReorderHelper;
		const oDoScrollStub = this.stub(ReorderHelper, "doScroll");
		const oAdaptStub = this.stub(ReorderHelper, "adaptReorderMarkerPosition");
		const oPos = {left: 0, center: 0, right: 0, width: 100, index: 1, id: "col", before: false, after: true};
		this.stub(ReorderHelper, "findColumnForPosition").returns(oPos);

		const oScrollArea = document.createElement("div");
		oScrollArea.style.width = "200px";
		oScrollArea.style.height = "20px";
		oScrollArea.style.overflow = "auto";
		document.body.appendChild(oScrollArea);
		const oInner = document.createElement("div");
		oInner.style.width = "99999px";
		oInner.style.height = "20px";
		oScrollArea.appendChild(oInner);

		const oGhost = document.createElement("div");
		document.body.appendChild(oGhost);
		const oScrollAreaRect = oScrollArea.getBoundingClientRect();
		const oFakeTable = {
			_iDnDColIndex: 0,
			_iNewColPos: 0,
			_bRtlMode: false,
			_bReorderScroll: false,
			_oReorderGhost: oGhost,
			_isTouchEvent: () => false,
			getDomRef: () => oScrollArea,
			getColumns: () => []
		};

		const oEvent = jQuery.Event({type: "mousemove"});
		oEvent.pageX = oScrollAreaRect.right - 5;
		oEvent.pageY = 0;

		ReorderHelper.onMouseMoveWhileReordering.call(oFakeTable, oEvent);

		assert.ok(oFakeTable._bReorderScroll, "Reorder scroll active");
		assert.ok(oDoScrollStub.calledWith(oFakeTable, true), "doScroll called with forward=true");
		assert.ok(oAdaptStub.calledWith(oFakeTable, oPos, false), "adaptReorderMarkerPosition called");

		oScrollArea.remove();
		oGhost.remove();
	});

	QUnit.test("onMouseMoveWhileReordering triggers scroll near the leading edge", function(assert) {
		const ReorderHelper = this.oPointerExtension._ReorderHelper;
		const oDoScrollStub = this.stub(ReorderHelper, "doScroll");
		const oAdaptStub = this.stub(ReorderHelper, "adaptReorderMarkerPosition");
		const oPos = {left: 0, center: 0, right: 0, width: 100, index: 1, id: "col", before: false, after: true};
		this.stub(ReorderHelper, "findColumnForPosition").returns(oPos);

		const oScrollArea = document.createElement("div");
		oScrollArea.style.width = "200px";
		oScrollArea.style.height = "20px";
		oScrollArea.style.overflow = "auto";
		document.body.appendChild(oScrollArea);
		const oInner = document.createElement("div");
		oInner.style.width = "99999px";
		oInner.style.height = "20px";
		oScrollArea.appendChild(oInner);
		oScrollArea.scrollLeft = 100;

		const oGhost = document.createElement("div");
		document.body.appendChild(oGhost);
		const oScrollAreaRect = oScrollArea.getBoundingClientRect();
		const oFakeTable = {
			_iDnDColIndex: 0,
			_iNewColPos: 0,
			_bRtlMode: false,
			_bReorderScroll: false,
			_oReorderGhost: oGhost,
			_isTouchEvent: () => false,
			getDomRef: () => oScrollArea,
			getColumns: () => []
		};

		const oEvent = jQuery.Event({type: "mousemove"});
		oEvent.pageX = oScrollAreaRect.left + 5;
		oEvent.pageY = 0;

		ReorderHelper.onMouseMoveWhileReordering.call(oFakeTable, oEvent);

		assert.ok(oFakeTable._bReorderScroll, "Reorder scroll active");
		assert.ok(oDoScrollStub.calledWith(oFakeTable, false), "doScroll called with forward=false (LTR + leading edge)");
		assert.ok(oAdaptStub.calledWith(oFakeTable, oPos, false), "adaptReorderMarkerPosition called");

		oScrollArea.remove();
		oGhost.remove();
	});

	QUnit.test("doScroll clears a pending timer and schedules a follow-up", function(assert) {
		const oTable = this.oTable;
		const ReorderHelper = this.oPointerExtension._ReorderHelper;
		const oClearTimeoutSpy = this.spy(window, "clearTimeout");
		const oSetTimeoutSpy = this.spy(window, "setTimeout");

		oTable._mTimeouts.horizontalReorderScrollTimerId = 12345;
		oTable._bReorderScroll = true;

		ReorderHelper.doScroll(oTable, true);

		assert.ok(oClearTimeoutSpy.calledWith(12345), "Previous timer cleared");
		assert.ok(oSetTimeoutSpy.calledWith(sinon.match.func, 60), "Follow-up scroll scheduled after 60ms");

		clearTimeout(oTable._mTimeouts.horizontalReorderScrollTimerId);
		oTable._mTimeouts.horizontalReorderScrollTimerId = null;
		oTable._bReorderScroll = false;
	});

	QUnit.test("doScroll uses scrollLeftRTL in RTL mode", function(assert) {
		const oTable = this.oTable;
		const ReorderHelper = this.oPointerExtension._ReorderHelper;
		const oOriginal$ = oTable.$;
		const $Scr = oTable.$("sapUiTableColHdrScr");
		const oScrollLeftRTLStub = this.stub().returns(0);
		$Scr.scrollLeftRTL = oScrollLeftRTLStub;
		this.stub(oTable, "$").callsFake(function(sId) {
			if (sId === "sapUiTableColHdrScr") {
				return $Scr;
			}
			return oOriginal$.apply(this, arguments);
		});

		oTable._bRtlMode = true;
		oTable._bReorderScroll = true;

		ReorderHelper.doScroll(oTable, true);

		assert.ok(oScrollLeftRTLStub.called, "scrollLeftRTL used in RTL mode");

		clearTimeout(oTable._mTimeouts.horizontalReorderScrollTimerId);
		oTable._mTimeouts.horizontalReorderScrollTimerId = null;
		oTable._bReorderScroll = false;
		oTable._bRtlMode = false;
	});
});