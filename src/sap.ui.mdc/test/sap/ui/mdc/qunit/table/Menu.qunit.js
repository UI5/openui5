/* global QUnit, sinon */
sap.ui.define([
	"./QUnitUtils",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/core/Element",
	"sap/ui/core/Lib",
	"sap/ui/mdc/Table",
	"sap/ui/mdc/table/Column",
	"sap/ui/mdc/table/utils/Personalization",
	"sap/ui/mdc/enums/TableType",
	"test-resources/sap/ui/mdc/delegates/TableDelegate",
	"sap/m/Text",
	"sap/m/plugins/ColumnResizer",
	"sap/ui/performance/trace/FESRHelper"
], function(
	TableQUnitUtils,
	nextUIUpdate,
	Element,
	Library,
	Table,
	Column,
	PersonalizationUtils,
	TableType,
	TableDelegate,
	Text,
	ColumnResizer,
	FESRHelper
) {
	"use strict";

	const sDelegatePath = "test-resources/sap/ui/mdc/delegates/TableDelegate";

	function wait(iMilliseconds) {
		return new Promise(function(resolve) {
			setTimeout(resolve, iMilliseconds);
		});
	}

	TableDelegate.getSupportedFeatures = function() {
		return {p13nModes: ["Column", "Sort", "Filter", "Group", "Aggregate"]};
	};

	QUnit.module("Menu", {
		createTable: function() {
			this.oTable = new Table({
				columns: [
					new Column({
						header: "A",
						propertyKey: "A",
						template: new Text()
					}),
					new Column({
						header: "B",
						propertyKey: "B",
						template: new Text()
					})
				],
				delegate: {
					name: sDelegatePath,
					payload: {
						collectionPath: "/testPath",
						propertyInfo: [{
							key: "A",
							label: "A",
							dataType: "String",
							path: "A"
						}, {
							key: "B",
							label: "B",
							dataType: "String",
							path: "B",
							sortable: false
						}]
					}
				}
			});
		},
		beforeEach: function() {
			this.createTable();
			return this.oTable.initialized().then(async function() {
				this.oTable.placeAt("qunit-fixture");
				await nextUIUpdate();
			}.bind(this));
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("Initialize", async function(assert) {
		const oTable = this.oTable;
		const oOpenSpy = sinon.spy(oTable._oColumnHeaderMenu, "openBy");

		oTable.setP13nMode([
			"Sort"
		]);
		oTable.setEnableColumnResize(false);

		assert.ok(oTable._oColumnHeaderMenu, "The ColumnMenu is initialized");
		assert.ok(oTable._oColumnHeaderMenu.isA("sap.m.table.columnmenu.Menu"), "The ColumnMenu is instance of the correct class");
		assert.equal(FESRHelper.getSemanticStepname(oTable._oColumnHeaderMenu, "beforeOpen"), "mdc:tbl:p13n:col", "Correct FESR StepName");
		assert.ok(oTable._oQuickActionContainer, "The QuickActionContainer is initialized");
		assert.ok(oTable._oQuickActionContainer.isA("sap.m.table.columnmenu.QuickActionContainer"),
			"The QuickActionContainer is instance of the correct class");
		assert.equal(oTable._oQuickActionContainer.getEffectiveQuickActions().length, 0, "The ColumnMenu contains no quick actions");
		assert.ok(!oTable._oColumnHeaderMenu._oPopover, "The popover is not initialized");

		await TableQUnitUtils.openColumnMenu(oTable, 0);
		assert.equal(oTable._oQuickActionContainer.getEffectiveQuickActions().length, 1, "The ColumnMenu contains quick actions");
		assert.ok(oOpenSpy.calledWithExactly(oTable.getColumns()[0].getInnerColumn(), true), "openBy is called once with the correct parameters");

		this.oTable.destroy();
		this.createTable();
		this.oTable.setP13nMode([]);
		this.oTable.setEnableColumnResize(false);
		await this.oTable.initialized();
		this.oTable.placeAt("qunit-fixture");
		await nextUIUpdate();

		assert.notOk(this.oTable._oColumnHeaderMenu, "The ColumnMenu is not initialized when there are no active p13n modes and no column resizing");
	});

	QUnit.test("Update", async function(assert) {
		const oTable = this.oTable;
		const oColumn = oTable.getColumns()[0].getInnerColumn();
		let oColumnHeaderMenu;

		assert.ok(oTable._oColumnHeaderMenu, "The column menu is created because enableColumnResize is true");
		assert.ok(oColumn.getDomRef().getAttribute("aria-haspopup"), "The column does have the aria-haspopup attribute");

		oColumnHeaderMenu = oTable._oColumnHeaderMenu;
		oTable.setEnableColumnResize(false);
		assert.notOk(oTable._oColumnHeaderMenu, "No column menu when enableColumnResize is set to false and no active p13nMode");
		assert.ok(oColumnHeaderMenu.isDestroyed(), "The old column menu is destroyed");
		await nextUIUpdate();
		assert.notOk(oColumn.getDomRef().getAttribute("aria-haspopup"), "The column does not have the aria-haspopup attribute");

		oTable.setP13nMode(["Sort"]);
		assert.ok(oTable._oColumnHeaderMenu, "The column menu is created when p13nMode is set");
		await nextUIUpdate();
		assert.ok(oColumn.getDomRef().getAttribute("aria-haspopup"), "The column has the aria-haspopup attribute");

		oColumnHeaderMenu = oTable._oColumnHeaderMenu;
		this.stub(oTable.getControlDelegate(), "getSupportedFeatures").returns({p13nModes: []});
		oTable.setType(TableType.ResponsiveTable);
		await oTable.initialized();
		assert.notOk(oTable._oColumnHeaderMenu, "Column menu is updated when the table type is set");
		assert.ok(oColumnHeaderMenu.isDestroyed(), "The old column menu is destroyed");
		await nextUIUpdate();
		assert.notOk(oColumn.getDomRef().getAttribute("aria-haspopup"), "The column does not have the aria-haspopup attribute");

		oTable.getControlDelegate().getSupportedFeatures.restore();
		oTable.setType(TableType.Table);
		await oTable.initialized();
		assert.ok(oTable._oColumnHeaderMenu, "Column menu is updated when the table type is set");
		await nextUIUpdate();
		assert.ok(oColumn.getDomRef().getAttribute("aria-haspopup"), "The column has the aria-haspopup attribute");
	});

	QUnit.test("Open menu before the table is fully initialized", function(assert) {
		const oTable = this.oTable;
		let oColumn;
		let oColumnMenu;
		let oOpenMenuSpy;

		oTable.setP13nMode([
			"Sort"
		]);

		return Promise.all([
			oTable.initialized().then(function() {
				return new Promise(function(resolve) {
					oColumn = oTable._oTable.getColumns()[0];
					oColumnMenu = Element.getElementById(oColumn.getHeaderMenu());
					oColumnMenu.openBy(oColumn);

					oOpenMenuSpy = sinon.spy(oTable._oColumnHeaderMenu, "openBy");
					assert.ok(oOpenMenuSpy.notCalled, "Menu does not open because the PropertyInfos are not yet final");
					resolve();
				});
			}),

			oTable.propertiesFinalized().then(function() {
				wait(0).then(function() {
					return new Promise(function(resolve) {
						assert.ok(oOpenMenuSpy.calledOnce, "Menu opens after the table is fully initialized");
						resolve();
					});
				});
			})
		]);
	});

	QUnit.module("QuickActionContainer", {
		beforeEach: function() {
			this.oTable = new Table({
				columns: [
					new Column({
						header: "test",
						propertyKey: "test",
						template: new Text()
					})
				],
				delegate: {
					name: sDelegatePath,
					payload: {
						collectionPath: "/testPath",
						propertyInfo: [{
							key: "test",
							label: "Test",
							path: "test",
							dataType: "String",
							sortable: true,
							groupable: true
						}]
					}
				}
			});

			return this.oTable.initialized().then(async function() {
				this.oTable.placeAt("qunit-fixture");
				await nextUIUpdate();
			}.bind(this));
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("Responsive table - Sort", function(assert) {
		const oTable = this.oTable;

		oTable.setType("ResponsiveTable");
		oTable.setP13nMode([
			"Sort"
		]);

		return TableQUnitUtils.openColumnMenu(oTable, 0).then(function() {
			const oQuickAction = oTable._oQuickActionContainer.getQuickActions()[0];
			assert.ok(oQuickAction.isA("sap.m.table.columnmenu.QuickSort"), "The QuickActionContainer contains a QuickSort");

			const fSortSpy = sinon.spy(PersonalizationUtils, "createSortChange");
			const aSortItemContent = oQuickAction.getItems()[0]._getAction().getContent();

			aSortItemContent[0].getButtons()[1].firePress();
			assert.ok(fSortSpy.calledOnce, "createSortChange is called");
			assert.ok(fSortSpy.calledWithExactly(oTable, {
				propertyKey: "test",
				sortOrder: "Ascending"
			}), "createSortChange is called with the correct parameters");

			fSortSpy.restore();
		});
	});

	QUnit.test("Responsive table - Resize on touch devices", function(assert) {
		const oTable = this.oTable;

		sinon.stub(ColumnResizer, "_isInTouchMode").returns(true);
		oTable.setType("ResponsiveTable");

		return TableQUnitUtils.openColumnMenu(oTable, 0).then(function() {
			const oQuickAction = oTable._oQuickActionContainer.getQuickActions()[0];
			assert.equal(oQuickAction.getLabel(), "", "label is empty");
			assert.equal(oQuickAction.getContent()[0].getText(), Library.getResourceBundleFor("sap.m").getText("table.COLUMNMENU_RESIZE"),
				"button text is correct");

			const oColumnResizer = oTable._oTable.getDependents()[0];
			oColumnResizer.startResizing = function() {};
			const fnResizeSpy = sinon.spy(oColumnResizer, "startResizing");
			oQuickAction.getContent()[0].firePress();
			assert.ok(fnResizeSpy.calledOnce, "Resizing started");

			ColumnResizer._isInTouchMode.restore();
		});
	});

	QUnit.test("Responsive table - Accessible resize alternative", function(assert) {
		const oTable = this.oTable;

		oTable.setType("ResponsiveTable");

		return TableQUnitUtils.openColumnMenu(oTable, 0).then(function() {
			const oQuickResize = oTable._oQuickActionContainer.getQuickActions().filter(function(oQuickAction) {
				return oQuickAction.isA("sap.m.table.columnmenu.QuickResize");
			})[0];
			assert.ok(oQuickResize, "The QuickActionContainer contains a QuickResize");
			const oQuickResizeAction = oQuickResize.getEffectiveQuickActions()[0];
			const oStepInput = oQuickResizeAction.getContent()[0];
			assert.ok(oStepInput.isA("sap.m.StepInput"), "The content is a StepInput");

			const oColumn = oTable.getColumns()[0].getInnerColumn();
			assert.equal(oStepInput.getValue(), parseInt(getComputedStyle(oColumn.getDomRef()).width),
						"The StepInput value is correct");
			oStepInput.setValue(300);
			oStepInput.fireChange({value: 300});
			assert.equal(oColumn.getWidth(), "300px", "The column width is set correctly");
		});
	});

	QUnit.test("Grid table - Group", function(assert) {
		const oTable = this.oTable;

		oTable.setP13nMode([
			"Group"
		]);

		return TableQUnitUtils.openColumnMenu(oTable, 0).then(function() {
			const oQuickAction = oTable._oQuickActionContainer.getQuickActions()[0];
			assert.ok(oQuickAction.isA("sap.m.table.columnmenu.QuickGroup"), "The QuickActionContainer contains a QuickGroup");

			const fGroupSpy = sinon.spy(PersonalizationUtils, "createGroupChange");
			const aGroupItemContent = oQuickAction.getEffectiveQuickActions()[0].getContent()[0];

			aGroupItemContent.fireChange();
			assert.ok(fGroupSpy.calledOnce, "createGroupChange is called");
			assert.ok(fGroupSpy.calledWithExactly(oTable, {
				propertyKey: "test"
			}), "createGroupChange is called with the correct parameters");

			fGroupSpy.restore();
		});
	});

	QUnit.test("updateQuickActions", function(assert) {
		const oTable = this.oTable;

		function testUpdateQuickActions(sSortOrder, bGrouped, bTotaled) {
			oTable._oQuickActionContainer.updateQuickActions(["Sort", "Group"]);
			oTable._oQuickActionContainer.getEffectiveQuickActions().forEach(function(oQuickAction) {
				if (oQuickAction.getCategory() === "Sort") {
					assert.equal(oQuickAction.getContent()[0].getSelectedKey(), sSortOrder);
				} else if (oQuickAction.getCategory() === "Group") {
					assert.ok(oQuickAction.getContent()[0].getState() === bGrouped);
				} else if (oQuickAction.getCategory() === "Total") {
					assert.ok(oQuickAction.getContent()[0].getState() === bTotaled);
				}
			});
		}

		oTable.setP13nMode([
			"Sort", "Group"
		]);

		return TableQUnitUtils.openColumnMenu(oTable, 0).then(function() {
			oTable._getSortedProperties = function() {
				return [{key: "test", Descending: false}];
			};
			oTable._getGroupedProperties = function() {
				return [];
			};
			testUpdateQuickActions("Ascending", false);

			oTable._getSortedProperties = function() {
				return [];
			};
			oTable._getGroupedProperties = function() {
				return [{key: "test"}];
			};
			testUpdateQuickActions("None", true);
		});
	});
});