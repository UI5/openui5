/*global QUnit*/

sap.ui.define([
	"sap/ui/table/AnalyticalColumn",
	"sap/ui/table/library",
	"sap/ui/table/utils/TableUtils",
	"sap/ui/model/type/Boolean",
	"sap/ui/model/type/DateTime",
	"sap/ui/model/type/Float",
	"sap/ui/model/type/Integer",
	"sap/ui/model/type/Time",
	"sap/m/Label",
	"sap/base/Log"
], function(
	AnalyticalColumn,
	library,
	TableUtils,
	BooleanType,
	DateTime,
	Float,
	Integer,
	Time,
	Label,
	Log
) {
	"use strict";

	const GroupEventType = library.GroupEventType;

	/**
	 * Creates a lightweight fake AnalyticalTable parent whose <code>isA</code> check via
	 * <code>TableUtils.isA</code> returns <code>true</code> for the AnalyticalTable type.
	 * The individual test decides which methods (getBinding, _addGroupedColumn, ...) to add.
	 * @param {object} [mMethods] additional methods/properties merged into the fake parent
	 * @returns {object} fake parent
	 */
	function createFakeAnalyticalTable(mMethods) {
		return Object.assign({
			_addGroupedColumn: function() {},
			_removeGroupedColumn: function() {},
			_updateColumns: function() {},
			updateAnalyticalInfo: function() {},
			_updateTableColumnDetails: function() {},
			fireGroup: function() {},
			getBinding: function() { return null; },
			_aGroupedColumns: [],
			_bSuspendUpdateAnalyticalInfo: false
		}, mMethods);
	}

	/**
	 * Stubs <code>TableUtils.isA</code> so it returns <code>true</code> only for the given fake parent
	 * when checked against <code>sap.ui.table.AnalyticalTable</code> and delegates otherwise.
	 * @param {sinon.SinonSandbox} oSandbox the test sandbox (this)
	 * @param {object} oFakeParent the fake parent that should be recognised as AnalyticalTable
	 */
	function stubIsAForFakeParent(oSandbox, oFakeParent) {
		const fnOriginal = TableUtils.isA;
		oSandbox.stub(TableUtils, "isA").callsFake((oObject, vTypeName) => {
			if (oObject === oFakeParent && vTypeName === "sap.ui.table.AnalyticalTable") {
				return true;
			}
			return fnOriginal.call(TableUtils, oObject, vTypeName);
		});
	}

	QUnit.module("shouldRender", {
		beforeEach: function() {
			this.oColumn = new AnalyticalColumn();
		},
		afterEach: function() {
			this.oColumn.destroy();
		}
	});

	QUnit.test("Combinations of visibility, grouping and template", function(assert) {
		const oColumn = this.oColumn;
		const test = (bShouldRender, bVisible, bGrouped, vTemplate) => {
			oColumn.setVisible(bVisible);
			oColumn.setGrouped(bGrouped);
			oColumn.setTemplate(vTemplate);
			assert.strictEqual(oColumn.shouldRender(), bShouldRender,
				`visible=${bVisible}, grouped=${bGrouped}, template=${vTemplate ? "set" : "unset"}`);
		};

		test(true, true, false, new Label({text: "{dummy}"}));
		test(false, true, true, new Label({text: "{dummy}"}));
		test(false, false, false, new Label({text: "{dummy}"}));
		test(false, false, true, new Label({text: "{dummy}"}));
		test(false, true, true, null);
		test(false, true, false, null);
		test(false, false, false, null);
		test(false, false, true, null);
	});

	QUnit.test("Considers _bLastGroupAndGrouped and _bDependendGrouped flags", function(assert) {
		this.oColumn.setVisible(true);
		this.oColumn.setTemplate(new Label({text: "x"}));
		this.oColumn.setGrouped(true);

		this.oColumn._bLastGroupAndGrouped = true;
		assert.strictEqual(this.oColumn.shouldRender(), true, "Grouped column renders if _bLastGroupAndGrouped is true");

		this.oColumn._bLastGroupAndGrouped = false;
		this.oColumn.setShowIfGrouped(true);
		assert.strictEqual(this.oColumn.shouldRender(), true, "Grouped column renders if showIfGrouped is true");

		this.oColumn.setGrouped(false);
		this.oColumn._bDependendGrouped = true;
		assert.strictEqual(this.oColumn.shouldRender(), false, "_bDependendGrouped without _bLastGroupAndGrouped hides the column");

		this.oColumn._bLastGroupAndGrouped = true;
		assert.strictEqual(this.oColumn.shouldRender(), true, "_bLastGroupAndGrouped overrides _bDependendGrouped");
	});

	QUnit.module("Grouped handling with AnalyticalTable parent", {
		beforeEach: function() {
			this.oColumn = new AnalyticalColumn();
			this.oFakeParent = createFakeAnalyticalTable();
			stubIsAForFakeParent(this, this.oFakeParent);
			this.stub(this.oColumn, "getParent").returns(this.oFakeParent);
		},
		afterEach: function() {
			this.oColumn.destroy();
		}
	});

	QUnit.test("setGrouped(true) adds the column to the analytical table's grouped columns", function(assert) {
		const oAddSpy = this.spy(this.oFakeParent, "_addGroupedColumn");
		const oUpdateSpy = this.spy(this.oFakeParent, "_updateColumns");

		this.oColumn.setGrouped(true);

		assert.ok(oAddSpy.calledOnceWithExactly(this.oColumn.getId()), "_addGroupedColumn called with column id");
		assert.strictEqual(this.oColumn.getGrouped(), true, "Grouped property is true");
		assert.ok(oUpdateSpy.calledOnce, "_updateColumns triggered on parent");
	});

	QUnit.test("setGrouped(false) removes the column from the analytical table's grouped columns", function(assert) {
		const oRemoveSpy = this.spy(this.oFakeParent, "_removeGroupedColumn");
		const oUpdateSpy = this.spy(this.oFakeParent, "_updateColumns");

		this.oColumn.setGrouped(false);

		assert.ok(oRemoveSpy.calledOnceWithExactly(this.oColumn.getId()), "_removeGroupedColumn called with column id");
		assert.strictEqual(this.oColumn.getGrouped(), false, "Grouped property is false");
		assert.ok(oUpdateSpy.calledOnce, "_updateColumns triggered on parent");
	});

	QUnit.test("_setGrouped fires the group event and forwards to setGrouped", function(assert) {
		const oFireSpy = this.spy(this.oFakeParent, "fireGroup");
		this.oFakeParent._aGroupedColumns = ["existing"];
		// _getTable comes from Column.prototype and uses TableUtils.isA against "sap.ui.table.Table" — must accept the fake parent too.
		this.oColumn._getTable = () => this.oFakeParent;

		this.oColumn._setGrouped(true);

		assert.strictEqual(this.oColumn.getGrouped(), true, "Grouped set to true");
		assert.ok(oFireSpy.calledOnce, "fireGroup called once");
		const mArgs = oFireSpy.firstCall.args[0];
		assert.strictEqual(mArgs.column, this.oColumn, "Event carries the column");
		assert.strictEqual(mArgs.type, GroupEventType.group, "Group event type is 'group' when grouping");
		assert.deepEqual(mArgs.groupedColumns, ["existing"], "Grouped columns forwarded");

		this.oColumn._setGrouped(false);
		assert.strictEqual(oFireSpy.secondCall.args[0].type, GroupEventType.ungroup, "Group event type is 'ungroup' when ungrouping");
	});

	QUnit.module("setGrouped / setVisible / setSummed without AnalyticalTable parent", {
		beforeEach: function() {
			this.oColumn = new AnalyticalColumn();
		},
		afterEach: function() {
			this.oColumn.destroy();
		}
	});

	QUnit.test("setGrouped without analytical parent still updates the property", function(assert) {
		const oReturn = this.oColumn.setGrouped(true);
		assert.strictEqual(this.oColumn.getGrouped(), true, "Grouped property updated");
		assert.strictEqual(oReturn, this.oColumn, "setGrouped returns the column instance");
	});

	QUnit.test("setSummed updates property and returns the column instance", function(assert) {
		const oReturn = this.oColumn.setSummed(true);
		assert.strictEqual(this.oColumn.getSummed(), true, "Summed property updated");
		assert.strictEqual(oReturn, this.oColumn, "setSummed returns the column instance");
	});

	QUnit.test("setVisible delegates to Column.prototype.setVisible and returns this", function(assert) {
		const oReturn = this.oColumn.setVisible(false);
		assert.strictEqual(this.oColumn.getVisible(), false, "Visible property updated");
		assert.strictEqual(oReturn, this.oColumn, "setVisible returns the column instance");
	});

	QUnit.module("getFilterProperty / getSortProperty", {
		beforeEach: function() {
			this.oColumn = new AnalyticalColumn({leadingProperty: "Amount"});
			this.oFakeParent = createFakeAnalyticalTable();
			stubIsAForFakeParent(this, this.oFakeParent);
			this.stub(this.oColumn, "getParent").returns(this.oFakeParent);
		},
		afterEach: function() {
			this.oColumn.destroy();
		}
	});

	QUnit.test("Explicit filterProperty / sortProperty win over derivation from binding", function(assert) {
		this.oColumn.setFilterProperty("ExplicitFilter");
		this.oColumn.setSortProperty("ExplicitSort");
		this.oFakeParent.getBinding = () => ({
			getFilterablePropertyNames: () => ["Amount"],
			getSortablePropertyNames: () => ["Amount"]
		});

		assert.strictEqual(this.oColumn.getFilterProperty(), "ExplicitFilter", "Explicit filter property returned");
		assert.strictEqual(this.oColumn.getSortProperty(), "ExplicitSort", "Explicit sort property returned");
	});

	QUnit.test("Filter and sort property derived from leadingProperty when binding allows it", function(assert) {
		this.oFakeParent.getBinding = () => ({
			getFilterablePropertyNames: () => ["Amount", "OtherField"],
			getSortablePropertyNames: () => ["Amount"]
		});

		assert.strictEqual(this.oColumn.getFilterProperty(), "Amount", "leadingProperty used as filter property");
		assert.strictEqual(this.oColumn.getSortProperty(), "Amount", "leadingProperty used as sort property");
	});

	QUnit.test("Filter and sort property not derived when leading property is not filterable/sortable", function(assert) {
		this.oFakeParent.getBinding = () => ({
			getFilterablePropertyNames: () => ["OtherField"],
			getSortablePropertyNames: () => ["OtherField"]
		});

		assert.notOk(this.oColumn.getFilterProperty(), "No filter property derived");
		assert.notOk(this.oColumn.getSortProperty(), "No sort property derived");
	});

	QUnit.test("getFilterProperty / getSortProperty return no value without binding", function(assert) {
		this.oFakeParent.getBinding = () => null;
		assert.notOk(this.oColumn.getFilterProperty(), "No filter property derived");
		assert.notOk(this.oColumn.getSortProperty(), "No sort property derived");
	});

	QUnit.test("getFilterProperty / getSortProperty return no value without AnalyticalTable parent", function(assert) {
		TableUtils.isA.restore();
		this.stub(TableUtils, "isA").returns(false);
		assert.notOk(this.oColumn.getFilterProperty(), "No filter property derived");
		assert.notOk(this.oColumn.getSortProperty(), "No sort property derived");
	});

	QUnit.module("getFilterType", {
		beforeEach: function() {
			this.oColumn = new AnalyticalColumn({leadingProperty: "P"});
			this.oFakeParent = createFakeAnalyticalTable();
			stubIsAForFakeParent(this, this.oFakeParent);
			this.stub(this.oColumn, "getParent").returns(this.oFakeParent);
		},
		afterEach: function() {
			this.oColumn.destroy();
		}
	});

	QUnit.test("Explicitly set filterType is returned unchanged", function(assert) {
		const oCustomType = new Float();
		this.oColumn.setFilterType(oCustomType);
		assert.strictEqual(this.oColumn.getFilterType(), oCustomType, "Explicit filter type returned");
	});

	QUnit.test("Derived filter type", function(assert) {
		const mExpected = {
			"Edm.Time": AnalyticalColumn._DEFAULT_FILTERTYPES.Time,
			"Edm.DateTime": AnalyticalColumn._DEFAULT_FILTERTYPES.DateTime,
			"Edm.DateTimeOffset": AnalyticalColumn._DEFAULT_FILTERTYPES.DateTime,
			"Edm.Single": AnalyticalColumn._DEFAULT_FILTERTYPES.Float,
			"Edm.Double": AnalyticalColumn._DEFAULT_FILTERTYPES.Float,
			"Edm.Decimal": AnalyticalColumn._DEFAULT_FILTERTYPES.Float,
			"Edm.SByte": AnalyticalColumn._DEFAULT_FILTERTYPES.Integer,
			"Edm.Int16": AnalyticalColumn._DEFAULT_FILTERTYPES.Integer,
			"Edm.Int32": AnalyticalColumn._DEFAULT_FILTERTYPES.Integer,
			"Edm.Int64": AnalyticalColumn._DEFAULT_FILTERTYPES.Integer,
			"Edm.Boolean": AnalyticalColumn._DEFAULT_FILTERTYPES.Boolean
		};

		Object.entries(mExpected).forEach(([sEdmType, oExpected]) => {
			this.oFakeParent.getBinding = () => ({
				getProperty: () => ({type: sEdmType})
			});
			assert.strictEqual(this.oColumn.getFilterType(), oExpected, `${sEdmType} maps to expected type`);
		});
	});

	QUnit.test("Unknown filter type falls through without setting a type", function(assert) {
		this.oFakeParent.getBinding = () => ({
			getProperty: () => ({type: "Edm.String"})
		});
		assert.notOk(this.oColumn.getFilterType(), "Unknown Edm type yields no filter type");
	});

	QUnit.test("Missing property, binding, or analytical parent yields no filter type", function(assert) {
		this.oFakeParent.getBinding = () => ({getProperty: () => null});
		assert.notOk(this.oColumn.getFilterType(), "No property metadata yields no filter type");

		this.oFakeParent.getBinding = () => null;
		assert.notOk(this.oColumn.getFilterType(), "Missing binding yields no filter type");

		TableUtils.isA.restore();
		this.stub(TableUtils, "isA").returns(false);
		assert.notOk(this.oColumn.getFilterType(), "Missing analytical parent yields no filter type");
	});

	QUnit.module("getLabel", {
		beforeEach: function() {
			this.oColumn = new AnalyticalColumn({leadingProperty: "P"});
			this.oFakeParent = createFakeAnalyticalTable();
			stubIsAForFakeParent(this, this.oFakeParent);
			this.stub(this.oColumn, "getParent").returns(this.oFakeParent);
		},
		afterEach: function() {
			this.oColumn.destroy();
		}
	});

	QUnit.test("Explicit label aggregation short-circuits derivation", function(assert) {
		const oLabel = new Label({text: "Explicit"});
		this.oColumn.setLabel(oLabel);
		assert.strictEqual(this.oColumn.getLabel(), oLabel, "Aggregation label returned directly");
	});

	QUnit.test("Label derived from binding via _getTableTemplateHelper", async function(assert) {
		const oBindingLabel = new Label();
		const oSetTextSpy = this.spy(oBindingLabel, "setText");
		this.stub(TableUtils, "_getTableTemplateHelper").returns({createLabel: () => oBindingLabel});

		let fnResolveMetadata;
		this.oFakeParent._metadataLoaded = () => new Promise((resolve) => { fnResolveMetadata = resolve; });
		this.oFakeParent.getBinding = () => ({
			getPropertyLabel: (sName) => `Label of ${sName}`
		});

		const oLabel = this.oColumn.getLabel();
		assert.strictEqual(oLabel, oBindingLabel, "Binding label returned");

		fnResolveMetadata();
		await Promise.resolve();
		assert.ok(oSetTextSpy.calledWith("Label of P"), "Text set from binding property label once metadata resolves");

		// Subsequent call returns the cached _oBindingLabel without recreating it.
		const oCreateSpy = this.spy();
		TableUtils._getTableTemplateHelper.returns({createLabel: oCreateSpy});
		assert.strictEqual(this.oColumn.getLabel(), oBindingLabel, "Cached binding label reused");
		assert.ok(oCreateSpy.notCalled, "createLabel not called again");
	});

	QUnit.test("Errors while deriving label are caught and logged as warnings", function(assert) {
		const oLogWarning = this.stub(Log, "warning");
		this.stub(TableUtils, "_getTableTemplateHelper").throws(new Error("boom"));
		this.oFakeParent.getBinding = () => ({getPropertyLabel: () => "x"});

		assert.notOk(this.oColumn.getLabel(), "No label returned when derivation throws");
		assert.ok(oLogWarning.calledOnce, "Log.warning invoked");
	});

	QUnit.test("Without binding no label is derived", function(assert) {
		this.oFakeParent.getBinding = () => null;
		assert.notOk(this.oColumn.getLabel(), "No label derived without binding");
	});

	QUnit.test("Without analytical parent no label is derived", function(assert) {
		TableUtils.isA.restore();
		this.stub(TableUtils, "isA").returns(false);
		assert.notOk(this.oColumn.getLabel(), "No label derived");
	});

	QUnit.module("isFilterableByMenu", {
		beforeEach: function() {
			this.oColumn = new AnalyticalColumn({leadingProperty: "Amount"});
			this.oFakeParent = createFakeAnalyticalTable();
			stubIsAForFakeParent(this, this.oFakeParent);
			this.stub(this.oColumn, "getParent").returns(this.oFakeParent);
		},
		afterEach: function() {
			this.oColumn.destroy();
		}
	});

	QUnit.test("False when filter property cannot be resolved", function(assert) {
		this.oFakeParent.getBinding = () => ({
			getFilterablePropertyNames: () => [],
			getProperty: () => null
		});
		assert.strictEqual(this.oColumn.isFilterableByMenu(), false);
	});

	QUnit.test("False when showFilterMenuEntry is disabled", function(assert) {
		this.oColumn.setFilterProperty("Amount");
		this.oColumn.setShowFilterMenuEntry(false);
		assert.strictEqual(this.oColumn.isFilterableByMenu(), false);
	});

	QUnit.test("True when binding exposes filterable property with metadata", function(assert) {
		this.oColumn.setFilterProperty("Amount");
		this.oFakeParent.getBinding = () => ({
			getFilterablePropertyNames: () => ["Amount"],
			getProperty: () => ({type: "Edm.Decimal"})
		});
		assert.strictEqual(this.oColumn.isFilterableByMenu(), true);
	});

	QUnit.test("False when binding exposes the property but metadata is missing", function(assert) {
		this.oColumn.setFilterProperty("Amount");
		this.oFakeParent.getBinding = () => ({
			getFilterablePropertyNames: () => ["Amount"],
			getProperty: () => null
		});
		assert.strictEqual(this.oColumn.isFilterableByMenu(), false);
	});

	QUnit.test("False when the property is not in the binding's filterable list", function(assert) {
		this.oColumn.setFilterProperty("Amount");
		this.oFakeParent.getBinding = () => ({
			getFilterablePropertyNames: () => ["Other"],
			getProperty: () => ({type: "Edm.Decimal"})
		});
		assert.strictEqual(this.oColumn.isFilterableByMenu(), false);
	});

	QUnit.test("False when there is no binding", function(assert) {
		this.oColumn.setFilterProperty("Amount");
		this.oFakeParent.getBinding = () => null;
		assert.strictEqual(this.oColumn.isFilterableByMenu(), false);
	});

	QUnit.test("False when the parent is not an AnalyticalTable", function(assert) {
		this.oColumn.setFilterProperty("Amount");
		TableUtils.isA.restore();
		this.stub(TableUtils, "isA").returns(false);
		assert.strictEqual(this.oColumn.isFilterableByMenu(), false);
	});

	QUnit.module("isGroupableByMenu / _isGroupableByMenu", {
		beforeEach: function() {
			this.oColumn = new AnalyticalColumn({leadingProperty: "P"});
			this.oFakeParent = createFakeAnalyticalTable();
			stubIsAForFakeParent(this, this.oFakeParent);
			this.stub(this.oColumn, "getParent").returns(this.oFakeParent);
		},
		afterEach: function() {
			this.oColumn.destroy();
		}
	});

	QUnit.test("True when a dimension is sortable and filterable", function(assert) {
		const oDimension = {getName: () => "P"};
		this.oFakeParent.getBinding = () => ({
			getAnalyticalQueryResult: () => ({findDimensionByPropertyName: () => oDimension}),
			getSortablePropertyNames: () => ["P"],
			getFilterablePropertyNames: () => ["P"]
		});
		assert.strictEqual(this.oColumn.isGroupableByMenu(), true);
		assert.strictEqual(this.oColumn._isGroupableByMenu(), true, "_isGroupableByMenu delegates to isGroupableByMenu");
	});

	QUnit.test("False when dimension is not sortable", function(assert) {
		const oDimension = {getName: () => "P"};
		this.oFakeParent.getBinding = () => ({
			getAnalyticalQueryResult: () => ({findDimensionByPropertyName: () => oDimension}),
			getSortablePropertyNames: () => [],
			getFilterablePropertyNames: () => ["P"]
		});
		assert.strictEqual(this.oColumn.isGroupableByMenu(), false);
	});

	QUnit.test("False when dimension is not filterable", function(assert) {
		const oDimension = {getName: () => "P"};
		this.oFakeParent.getBinding = () => ({
			getAnalyticalQueryResult: () => ({findDimensionByPropertyName: () => oDimension}),
			getSortablePropertyNames: () => ["P"],
			getFilterablePropertyNames: () => []
		});
		assert.strictEqual(this.oColumn.isGroupableByMenu(), false);
	});

	QUnit.test("False when no dimension is found for the leading property", function(assert) {
		this.oFakeParent.getBinding = () => ({
			getAnalyticalQueryResult: () => ({findDimensionByPropertyName: () => null}),
			getSortablePropertyNames: () => [],
			getFilterablePropertyNames: () => []
		});
		assert.strictEqual(this.oColumn.isGroupableByMenu(), false);
	});

	QUnit.test("False when there is no analytical query result", function(assert) {
		this.oFakeParent.getBinding = () => ({getAnalyticalQueryResult: () => null});
		assert.strictEqual(this.oColumn.isGroupableByMenu(), false);
	});

	QUnit.test("False when there is no binding", function(assert) {
		this.oFakeParent.getBinding = () => null;
		assert.strictEqual(this.oColumn.isGroupableByMenu(), false);
	});

	QUnit.test("False when the parent is not an AnalyticalTable", function(assert) {
		TableUtils.isA.restore();
		this.stub(TableUtils, "isA").returns(false);
		assert.strictEqual(this.oColumn.isGroupableByMenu(), false);
	});

	QUnit.module("_isAggregatableByMenu", {
		beforeEach: function() {
			this.oColumn = new AnalyticalColumn({leadingProperty: "Amount"});
			this.oFakeParent = createFakeAnalyticalTable();
			stubIsAForFakeParent(this, this.oFakeParent);
			this.stub(this.oColumn, "_getTable").returns(this.oFakeParent);
		},
		afterEach: function() {
			this.oColumn.destroy();
		}
	});

	QUnit.test("Truthy when the leading property is a measure in the analytical query result", function(assert) {
		const oMeasure = {name: "Amount"};
		this.oFakeParent.getBinding = () => ({
			getAnalyticalQueryResult: () => ({findMeasureByPropertyName: () => oMeasure})
		});
		assert.strictEqual(this.oColumn._isAggregatableByMenu(), oMeasure, "Returns the measure object");
	});

	QUnit.test("Falsy when the leading property is not a measure", function(assert) {
		this.oFakeParent.getBinding = () => ({
			getAnalyticalQueryResult: () => ({findMeasureByPropertyName: () => undefined})
		});
		assert.notOk(this.oColumn._isAggregatableByMenu(), "No measure found");
	});

	QUnit.test("Falsy when there is no analytical query result", function(assert) {
		this.oFakeParent.getBinding = () => ({getAnalyticalQueryResult: () => null});
		assert.notOk(this.oColumn._isAggregatableByMenu());
	});

	QUnit.test("Falsy when there is no binding", function(assert) {
		this.oFakeParent.getBinding = () => null;
		assert.notOk(this.oColumn._isAggregatableByMenu());
	});

	QUnit.module("_updateColumns / _updateTableAnalyticalInfo / _updateTableColumnDetails / _applySorters", {
		beforeEach: function() {
			this.oColumn = new AnalyticalColumn();
			this.oFakeParent = createFakeAnalyticalTable();
			stubIsAForFakeParent(this, this.oFakeParent);
			this.stub(this.oColumn, "getParent").returns(this.oFakeParent);
		},
		afterEach: function() {
			this.oColumn.destroy();
		}
	});

	QUnit.test("_updateColumns forwards arguments to the analytical parent", function(assert) {
		const oSpy = this.spy(this.oFakeParent, "_updateColumns");
		this.oColumn._updateColumns(true, false);
		assert.ok(oSpy.calledOnceWithExactly(true, false), "Arguments forwarded");
	});

	QUnit.test("_updateColumns is a no-op without analytical parent", function(assert) {
		TableUtils.isA.restore();
		this.stub(TableUtils, "isA").returns(false);
		const oSpy = this.spy(this.oFakeParent, "_updateColumns");
		this.oColumn._updateColumns();
		assert.ok(oSpy.notCalled, "Parent update not called");
	});

	QUnit.test("_updateTableAnalyticalInfo calls updateAnalyticalInfo when not suspended", function(assert) {
		const oSpy = this.spy(this.oFakeParent, "updateAnalyticalInfo");
		this.oColumn._updateTableAnalyticalInfo(true);
		assert.ok(oSpy.calledOnceWithExactly(true), "updateAnalyticalInfo called with bSupressRefresh");
	});

	QUnit.test("_updateTableAnalyticalInfo is skipped when updates are suspended", function(assert) {
		this.oFakeParent._bSuspendUpdateAnalyticalInfo = true;
		const oSpy = this.spy(this.oFakeParent, "updateAnalyticalInfo");
		this.oColumn._updateTableAnalyticalInfo();
		assert.ok(oSpy.notCalled, "updateAnalyticalInfo not called");
	});

	QUnit.test("_updateTableAnalyticalInfo is a no-op without analytical parent", function(assert) {
		TableUtils.isA.restore();
		this.stub(TableUtils, "isA").returns(false);
		const oSpy = this.spy(this.oFakeParent, "updateAnalyticalInfo");
		this.oColumn._updateTableAnalyticalInfo();
		assert.ok(oSpy.notCalled, "updateAnalyticalInfo not called");
	});

	QUnit.test("_updateTableColumnDetails forwards to the analytical parent when not suspended", function(assert) {
		const oSpy = this.spy(this.oFakeParent, "_updateTableColumnDetails");
		this.oColumn._updateTableColumnDetails();
		assert.ok(oSpy.calledOnce);
	});

	QUnit.test("_updateTableColumnDetails is skipped when updates are suspended", function(assert) {
		this.oFakeParent._bSuspendUpdateAnalyticalInfo = true;
		const oSpy = this.spy(this.oFakeParent, "_updateTableColumnDetails");
		this.oColumn._updateTableColumnDetails();
		assert.ok(oSpy.notCalled);
	});

	QUnit.test("_updateTableColumnDetails is a no-op without analytical parent", function(assert) {
		TableUtils.isA.restore();
		this.stub(TableUtils, "isA").returns(false);
		const oSpy = this.spy(this.oFakeParent, "_updateTableColumnDetails");
		this.oColumn._updateTableColumnDetails();
		assert.ok(oSpy.notCalled);
	});

	QUnit.test("_applySorters updates analytical info before delegating to the base implementation", function(assert) {
		const oUpdateSpy = this.spy(this.oColumn, "_updateTableAnalyticalInfo");
		// Prevent the base implementation from hitting real table internals.
		const oBaseProto = Object.getPrototypeOf(AnalyticalColumn.prototype);
		const oOriginal = oBaseProto._applySorters;
		const oBaseStub = this.stub();
		oBaseProto._applySorters = oBaseStub;

		try {
			this.oColumn._applySorters("foo");
			assert.ok(oUpdateSpy.calledOnceWithExactly(true), "Analytical info updated with suppress refresh");
			assert.ok(oBaseStub.calledOnce, "Base _applySorters delegated to");
			assert.ok(oUpdateSpy.calledBefore(oBaseStub), "Analytical info update happens before base call");
		} finally {
			oBaseProto._applySorters = oOriginal;
		}
	});

	QUnit.module("_setCellContentVisibilitySettings", {
		beforeEach: function() {
			this.oColumn = new AnalyticalColumn();
		},
		afterEach: function() {
			this.oColumn.destroy();
		}
	});

	QUnit.test("Is overridden to a no-op that ignores its arguments", function(assert) {
		assert.strictEqual(this.oColumn._setCellContentVisibilitySettings({standard: false}), undefined,
			"returns undefined for any settings");
		assert.notStrictEqual(this.oColumn._setCellContentVisibilitySettings,
			Object.getPrototypeOf(AnalyticalColumn.prototype)._setCellContentVisibilitySettings,
			"overrides the Column implementation");
	});
});