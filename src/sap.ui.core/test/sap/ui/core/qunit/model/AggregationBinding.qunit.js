/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/model/AggregationBinding",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterType"
], function (asAggregationBinding, Filter, FilterType) {
	/*global QUnit, sinon*/
	"use strict";

	/**
	 * Constructs a test aggregation binding object.
	 */
	function AggregationBinding() {
		asAggregationBinding.call(this);

		this.filter = () => {};
	}

	//*********************************************************************************************
	QUnit.module("sap.ui.model.AggregationBinding", {
		before : function () {
			asAggregationBinding(AggregationBinding.prototype);
		}
	});

	//*********************************************************************************************
	QUnit.test("mixin member", function (assert) {
		var oBinding = new AggregationBinding();

		// code under test
		assert.strictEqual(oBinding.bBoundFilterUpdate, false);
	});

	//*********************************************************************************************
	QUnit.test("_isBoundFilterUpdate", function (assert) {
		const oBinding = new AggregationBinding();
		oBinding.bBoundFilterUpdate = "~bBoundFilterUpdate~";

		// code under test
		assert.strictEqual(oBinding._isBoundFilterUpdate(), "~bBoundFilterUpdate~");
	});

	//*********************************************************************************************
	QUnit.test("_updateFilter", function (assert) {
		const oFilter = new Filter("~sPath", "EQ", "~v1");
		const oFilter2 = new Filter("~sPath2", "EQ", "~v2");
		const oBinding = new AggregationBinding();
		oBinding.aApplicationFilters = [oFilter, oFilter2];
		this.mock(oFilter).expects("cloneWithValues").withExactArgs("~v1New", "~v2New").returns("~clonedFilter~");
		this.mock(oFilter).expects("cloneIfContained").withExactArgs(sinon.match.same(oFilter), "~clonedFilter~")
			.returns("~clonedFilterElement~");
		this.mock(oFilter2).expects("cloneIfContained").withExactArgs(sinon.match.same(oFilter), "~clonedFilter~")
			.returns(oFilter2);
		this.mock(oBinding).expects("filter")
			.withExactArgs(["~clonedFilterElement~", oFilter2], FilterType.Application).callsFake(() => {
				assert.strictEqual(oBinding.bBoundFilterUpdate, true);
			});

		assert.strictEqual(oBinding.bBoundFilterUpdate, false);

		// code under test
		const oUpdatedFilter = oBinding._updateFilter(oFilter, "~v1New", "~v2New");

		assert.strictEqual(oUpdatedFilter, "~clonedFilter~");
		assert.strictEqual(oBinding.bBoundFilterUpdate, false);
	});

	//*********************************************************************************************
	QUnit.test("_updateFilter, error if filter not found", function (assert) {
		const oFilter = new Filter("~sPath", "EQ", "~v1");
		const oFilter2 = new Filter("~sPath2", "EQ", "~v2");
		const oBinding = new AggregationBinding();
		oBinding.aApplicationFilters = [oFilter2];
		this.mock(oFilter).expects("cloneWithValues").withExactArgs("~v1New", "~v2New").returns("~clonedFilter~");
		this.mock(oFilter2).expects("cloneIfContained").withExactArgs(sinon.match.same(oFilter), "~clonedFilter~")
			.returns(oFilter2);
		this.mock(oBinding).expects("filter").never();

		// code under test
		assert.throws(() => {
			oBinding._updateFilter(oFilter, "~v1New", "~v2New");
		}, new Error("Filter cannot be updated: Not found in binding's application filters"));
	});

	//*********************************************************************************************
	QUnit.test("computeApplicationFilters", function (assert) {
		const oBinding = new AggregationBinding("~model~", "~path~"/* other parameters do not matter for this test */);

		// code under test
		assert.strictEqual(oBinding.computeApplicationFilters("~filters~", FilterType.Application), "~filters~");

		// code under test
		assert.throws(() => {
			oBinding.computeApplicationFilters("~filter~", FilterType.ApplicationBound);
		}, new Error("Binding has not been created for an aggregation of a control: Must not use filter type "
			+ "ApplicationBound"));

		// code under test
		assert.throws(() => {
			oBinding.computeApplicationFilters("~filter~", FilterType.Control);
		}, new Error("Must not use filter type Control"));
	});
});