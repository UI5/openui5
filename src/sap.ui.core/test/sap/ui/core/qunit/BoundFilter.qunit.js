/* global sinon, QUnit */
sap.ui.define([
	"sap/ui/base/BindingInfo",
	"sap/ui/base/BoundFilter",
	"sap/ui/model/FilterType",
	"sap/ui/model/ManagedObjectBindingSupport"
], function(BindingInfo, BoundFilter, FilterType, ManagedObjectBindingSupport) {
	"use strict";

	QUnit.module("sap.ui.base.BoundFilter");

	//*********************************************************************************************
	QUnit.test("constructor", function (assert) {
		// code under test
		const oBoundFilter = new BoundFilter({value1: "~value1~", value2: "~value2~"}, "~filter~", "~binding~");

		assert.ok(oBoundFilter instanceof BoundFilter);
		assert.ok(oBoundFilter.isA("sap.ui.base.BoundFilter"));
		assert.ok(oBoundFilter.isA("sap.ui.base.ManagedObject"));
		assert.strictEqual(oBoundFilter.oFilter, "~filter~");
		assert.strictEqual(oBoundFilter.oBinding, "~binding~");
		assert.strictEqual(oBoundFilter.getValue1(), "~value1~");
		assert.strictEqual(oBoundFilter.getValue2(), "~value2~");

		let oPropertyMetadata = oBoundFilter.getMetadata().getProperty("value1");
		assert.strictEqual(oPropertyMetadata.type, "any");
		assert.strictEqual(oPropertyMetadata.group, "Misc");
		assert.strictEqual(oPropertyMetadata.defaultValue, null);
		oPropertyMetadata = oBoundFilter.getMetadata().getProperty("value2");
		assert.strictEqual(oPropertyMetadata.type, "any");
		assert.strictEqual(oPropertyMetadata.group, "Misc");
		assert.strictEqual(oPropertyMetadata.defaultValue, null);
	});

	//*********************************************************************************************
	QUnit.test("getBinding", function (assert) {
		const oBoundFilter = new BoundFilter({}, "~filter~", "~binding~");

		// code under test
		assert.strictEqual(oBoundFilter.getBinding(), "~binding~");
	});

	//*********************************************************************************************
	QUnit.test("setValue1, no binding info", function (assert) {
		const oBoundFilter = new BoundFilter({}, "~filter~", "~binding~");
		this.mock(oBoundFilter).expects("setProperty").withExactArgs("value1", "~newValue~");
		this.mock(oBoundFilter).expects("getBindingInfo").withExactArgs("value1").returns(false);

		// code under test
		assert.strictEqual(oBoundFilter.setValue1("~newValue~"), oBoundFilter);
	});

	//*********************************************************************************************
	QUnit.test("setValue1, with binding info", function (assert) {
		const oBinding = {_updateFilter() {}};
		const oBoundFilter = new BoundFilter({}, "~filter~", oBinding);
		this.mock(oBoundFilter).expects("setProperty").withExactArgs("value1", "~newValue~");
		this.mock(oBoundFilter).expects("getBindingInfo").withExactArgs("value1").returns(true);
		this.mock(oBoundFilter).expects("getValue2").withExactArgs().returns("~value2~");
		this.mock(oBinding).expects("_updateFilter")
			.withExactArgs("~filter~", "~newValue~", "~value2~")
			.returns("~newFilter~");

		// code under test
		assert.strictEqual(oBoundFilter.setValue1("~newValue~"), oBoundFilter);

		assert.strictEqual(oBoundFilter.oFilter, "~newFilter~");
	});

	//*********************************************************************************************
	QUnit.test("setValue2, no binding info", function (assert) {
		const oBoundFilter = new BoundFilter({}, "~filter~", "~binding~");
		this.mock(oBoundFilter).expects("setProperty").withExactArgs("value2", "~newValue~");
		this.mock(oBoundFilter).expects("getBindingInfo").withExactArgs("value2").returns(false);

		// code under test
		assert.strictEqual(oBoundFilter.setValue2("~newValue~"), oBoundFilter);
	});

	//*********************************************************************************************
	QUnit.test("setValue2, with binding info", function (assert) {
		const oBinding = {_updateFilter() {}};
		const oBoundFilter = new BoundFilter({}, "~filter~", oBinding);
		this.mock(oBoundFilter).expects("setProperty").withExactArgs("value2", "~newValue~");
		this.mock(oBoundFilter).expects("getBindingInfo").withExactArgs("value2").returns(true);
		this.mock(oBoundFilter).expects("getValue1").withExactArgs().returns("~value1~");
		this.mock(oBinding).expects("_updateFilter")
			.withExactArgs("~filter~", "~value1~", "~newValue~")
			.returns("~newFilter~");

		// code under test
		assert.strictEqual(oBoundFilter.setValue2("~newValue~"), oBoundFilter);

		assert.strictEqual(oBoundFilter.oFilter, "~newFilter~");
	});

	//*********************************************************************************************
	QUnit.test("ManagedObjectBindingSupport#_processFilters: no bound filters", function (assert) {
		const oBindingInfo = {filters: "~filters~"};

		// code under test
		assert.strictEqual(ManagedObjectBindingSupport._processFilters(oBindingInfo, () => "unused"), "~filters~");
	});

	//*********************************************************************************************
	QUnit.test("ManagedObjectBindingSupport#_processFilters: tree binding", function (assert) {
		const oBindingInfo = {filters: "~filters~", boundFilters: "~boundFilters~"};

		// code under test
		assert.strictEqual(ManagedObjectBindingSupport._processFilters(oBindingInfo, () => "unused", true), "~filters~");
	});

	//*********************************************************************************************
[{
	boundFilters: "~boundFilter~", result: ["~boundFilter~"]
}, {
	boundFilters: ["~boundFilter0~", "~boundFilter1~"], result: ["~boundFilter0~", "~boundFilter1~"]
}, {
	boundFilters: "~boundFilter~", filters: "~filter~", result: ["~filter~", "~boundFilter~"]
}, {
	boundFilters: ["~boundFilter~"], filters: "~filter~", result: ["~filter~", "~boundFilter~"]
}, {
	boundFilters: "~boundFilter~", filters: ["~filter~"], result: ["~filter~", "~boundFilter~"]
}, {
	boundFilters: ["~boundFilter~"], filters: ["~filter~"], result: ["~filter~", "~boundFilter~"]
}].forEach(({boundFilters, filters, result}, i) => {
	QUnit.test("ManagedObjectBindingSupport#_processFilters: with bound filters, " + i, function (assert) {
		const oBindingInfo = {boundFilters: boundFilters, filters: filters};
		const getBinding = () => "unused";
		const oManagedObject = {};
		const oManagedObjectMock = this.mock(oManagedObject);
		Object.assign(oManagedObject, ManagedObjectBindingSupport); // simulate mixin, cf. Model#mixinBindingSupport

		[boundFilters].flat().forEach((sBoundFilter) => {
			oManagedObjectMock.expects("_createBoundFilter").withExactArgs(sBoundFilter, sinon.match.same(getBinding));
		});

		// code under test
		assert.deepEqual(oManagedObject._processFilters(oBindingInfo, getBinding), result);
	});
});

	//*********************************************************************************************
	QUnit.test("ManagedObjectBindingSupport#_createBoundFilter: no binding expressions", function () {
		const oFilter = {isMultiFilter() {}, setBound() {}, setResolved() {}, oValue1: "constantValue1",
			oValue2: "constantValue2"};

		this.mock(oFilter).expects("setBound").withExactArgs();
		this.mock(oFilter).expects("isMultiFilter").withExactArgs().returns(false);
		this.mock(oFilter).expects("setResolved").never();
		const oBindingInfoMock = this.mock(BindingInfo);
		oBindingInfoMock.expects("extract").withExactArgs("constantValue1", undefined, true).returns(undefined);
		oBindingInfoMock.expects("extract").withExactArgs("constantValue2", undefined, true).returns(undefined);
		this.mock(sap.ui).expects("require").withExactArgs(["sap/ui/base/BoundFilter"], sinon.match.func).never();

		// code under test
		ManagedObjectBindingSupport._createBoundFilter(oFilter, () => "unused");
	});

	//*********************************************************************************************
[
	{value1: "{filter>/p1}", bindingInfo1: "bindingInfo1", value2: "foo", bindingInfo2: undefined},
	{value1: "bar", bindingInfo1: undefined, value2: "{filter>/p2}", bindingInfo2: "bindingInfo2"}
].forEach(({value1, bindingInfo1, value2, bindingInfo2}, i) => {
	QUnit.test("ManagedObjectBindingSupport#_createBoundFilter: w/ binding expressions, " + i, function (assert) {
		const oFilter = {isMultiFilter() {}, setBound() {}, setResolved() {}, oValue1: value1, oValue2: value2};
		const oManagedObject = {addDependent() {}};
		Object.assign(oManagedObject, ManagedObjectBindingSupport); // simulate mixin, cf. Model#mixinBindingSupport

		this.mock(oFilter).expects("setBound").withExactArgs();
		this.mock(oFilter).expects("isMultiFilter").withExactArgs().returns(false);
		const oBindingInfoMock = this.mock(BindingInfo);
		oBindingInfoMock.expects("extract").withExactArgs(value1, undefined, true).returns(bindingInfo1);
		oBindingInfoMock.expects("extract").withExactArgs(value2, undefined, true).returns(bindingInfo2);
		this.mock(oFilter).expects("setResolved").withExactArgs(false);

		const oRequireCall = this.mock(sap.ui).expects("require")
			.withExactArgs(["sap/ui/base/BoundFilter"], sinon.match.func);
		let oBinding = "initial";
		const fnGetBinding = () => oBinding;

		// code under test
		oManagedObject._createBoundFilter(oFilter, fnGetBinding);

		const oAddDependentCall = this.mock(oManagedObject).expects("addDependent")
			.withExactArgs(sinon.match.object);
		// calls from ManagedObject.applySettings on BoundFilter construction
		oBindingInfoMock.expects("extract").atLeast(1).callThrough();

		// code under test - call require callback *asynchronously*
		const fnRequireCallback = oRequireCall.getCall(0).args[1];
		const oRequirePromise = Promise.resolve(BoundFilter)
			.then(fnRequireCallback)
			.then(() => {
				const oBoundFilter = oAddDependentCall.getCall(0).args[0];
				if (bindingInfo1) {
					assert.strictEqual(oBoundFilter.getValue1(), null, "binding info for value1 unresolved => null");
					assert.ok(oBoundFilter.getBindingInfo("value1"));
				} else {
					assert.strictEqual(oBoundFilter.getValue1(), value1, "constant filter value1");
					assert.notOk(oBoundFilter.getBindingInfo("value1"));
				}
				if (bindingInfo2) {
					assert.strictEqual(oBoundFilter.getValue2(), null, "binding info for value2 unresolved => null");
					assert.ok(oBoundFilter.getBindingInfo("value2"));
				} else {
					assert.strictEqual(oBoundFilter.getValue2(), value2, "constant filter value2");
					assert.notOk(oBoundFilter.getBindingInfo("value2"));
				}
				assert.strictEqual(oBoundFilter.oFilter, oFilter);
				assert.strictEqual(oBoundFilter.oBinding, "~oBinding~");
			});
		oBinding = "~oBinding~";
		return oRequirePromise;
	});
});

	//*********************************************************************************************
	QUnit.test("ManagedObjectBindingSupport#_createBoundFilter: w/ multi-filter", function (assert) {
		const oFilter = {
			isMultiFilter() {},
			setBound() {},
			aFilters: [
				{isMultiFilter() {}, setBound() {}, oValue1 : "v1.1", oValue2 : "v2.1"},
				{isMultiFilter() {}, setBound() {}, oValue1 : "v1.2", oValue2 : "v2.2"}
			]
		};

		const oManagedObject = {};
		Object.assign(oManagedObject, ManagedObjectBindingSupport); // simulate mixin, cf. Model#mixinBindingSupport
		// outer multi-filter
		this.mock(oFilter).expects("setBound").withExactArgs();
		this.mock(oFilter).expects("isMultiFilter").withExactArgs().returns(true);
		// inner single filters
		this.mock(oFilter.aFilters[0]).expects("setBound").withExactArgs();
		this.mock(oFilter.aFilters[0]).expects("isMultiFilter").withExactArgs().returns(false);
		this.mock(oFilter.aFilters[1]).expects("setBound").withExactArgs();
		this.mock(oFilter.aFilters[1]).expects("isMultiFilter").withExactArgs().returns(false);

		const oBindingInfoMock = this.mock(BindingInfo);
		oBindingInfoMock.expects("extract").withExactArgs("v1.1", undefined, true).returns(undefined);
		oBindingInfoMock.expects("extract").withExactArgs("v2.1", undefined, true).returns(undefined);
		oBindingInfoMock.expects("extract").withExactArgs("v1.2", undefined, true).returns(undefined);
		oBindingInfoMock.expects("extract").withExactArgs("v2.2", undefined, true).returns(undefined);
		const oSpy = this.spy(oManagedObject, "_createBoundFilter");

		// code under test
		oManagedObject._createBoundFilter(oFilter, "~fnGetBinding~");

		assert.strictEqual(oSpy.callCount, 3);
		assert.strictEqual(oSpy.getCall(1).args[1], "~fnGetBinding~");
		assert.strictEqual(oSpy.getCall(2).args[1], "~fnGetBinding~");
	});

	//*********************************************************************************************
[false, true].forEach((bIsTreeBinding) => {
	const sTitle = "ManagedObjectBindingSupport#_bindAggregation - bound filter handling, isTree=" + bIsTreeBinding;
	QUnit.test(sTitle, function (assert) {
		const oBinding = {attachChange() {}, attachEvents() {}, attachRefresh() {}, initialize() {}};
		const oBindingInfo = {events: "~events~", filters: "~filters~", model: "model", parameters: "~parameters~",
			path: "path", sorter: "~sorter~"};
		const oManagedObject = {getBindingContext() {}, getMetadata() {}, getModel() {}, isTreeBinding() {}};
		const oMetadata = {getAggregation() {}};
		const oModel = {bindList() {}, bindTree() {}};

		Object.assign(oManagedObject, ManagedObjectBindingSupport); // simulate mixin, cf. Model#mixinBindingSupport
		this.mock(oManagedObject).expects("getMetadata").withExactArgs().returns(oMetadata);
		this.mock(oMetadata).expects("getAggregation").withExactArgs("items").returns("~aggregationInfo");

		this.mock(oManagedObject).expects("isTreeBinding").withExactArgs("items").returns(bIsTreeBinding);
		const oProcessFiltersCall = this.mock(oManagedObject).expects("_processFilters")
			.withExactArgs(sinon.match.same(oBindingInfo), sinon.match.func, bIsTreeBinding).returns("~aFilters~");

		this.mock(oManagedObject).expects("getModel").withExactArgs("model").returns(oModel);
		this.mock(oManagedObject).expects("getBindingContext").withExactArgs("model").returns("~context~");
		if (bIsTreeBinding) {
			this.mock(oModel).expects("bindTree")
				.withExactArgs("path", "~context~", "~aFilters~", "~parameters~", "~sorter~")
				.returns(oBinding);
		} else {
			this.mock(oModel).expects("bindList")
				.withExactArgs("path", "~context~", "~sorter~", "~aFilters~", "~parameters~")
				.returns(oBinding);
			this.mock(oManagedObject.computeApplicationFilters)
				.expects("bind")
				.withExactArgs(sinon.match.same(oManagedObject), sinon.match.same(oBinding))
				.returns("~fnComputeAF~");
		}
		this.mock(oBinding).expects("attachChange").withExactArgs(sinon.match.func);
		this.mock(oBinding).expects("attachRefresh").withExactArgs(sinon.match.func);
		this.mock(oBinding).expects("attachEvents").withExactArgs("~events~");
		this.mock(oBinding).expects("initialize").withExactArgs();

		// code under test
		oManagedObject._bindAggregation("items", oBindingInfo);

		assert.strictEqual(oBinding.computeApplicationFilters, bIsTreeBinding ? undefined : "~fnComputeAF~");

		const fnGetBinding = oProcessFiltersCall.getCall(0).args[1];

		// code under test
		assert.strictEqual(fnGetBinding(), oBinding);
	});
});

	//*********************************************************************************************
	QUnit.test("ManagedObjectBindingSupport#_unbindAggregation: destroy bound filters", function () {
		const oManagedObject = {};
		Object.assign(oManagedObject, ManagedObjectBindingSupport); // simulate mixin
		oManagedObject._bIsBeingDestroyed = false;
		this.mock(oManagedObject).expects("_detachAggregationBindingHandlers").withExactArgs("items");
		const oBinding = {destroy() {}};
		this.mock(oManagedObject).expects("_removeBoundFilters").withExactArgs(sinon.match.same(oBinding));
		this.mock(oBinding).expects("destroy").withExactArgs();

		// code under test
		oManagedObject._unbindAggregation({binding: oBinding}, "items");
	});

	//*********************************************************************************************
	QUnit.test("ManagedObjectBindingSupport#_removeBoundFilters", function () {
		const oManagedObject = {getDependents() {}, removeDependent() {}};
		Object.assign(oManagedObject, ManagedObjectBindingSupport); // simulate mixin
		const oBinding = {};
		const oDependent0 = {destroy() {}, isA() {}, getBinding() {}};
		const oDependent1 = {destroy() {}, isA() {}, getBinding() {}};
		const oDependent2 = {destroy() {}, isA() {}, getBinding() {}};

		const oManagedObjectMock = this.mock(oManagedObject);
		const oDependent0Mock = this.mock(oDependent0);
		const oDependent1Mock = this.mock(oDependent1);
		const oDependent2Mock = this.mock(oDependent2);
		oDependent0Mock.expects("isA").withExactArgs("sap.ui.base.BoundFilter").returns(false);
		oDependent1Mock.expects("isA").withExactArgs("sap.ui.base.BoundFilter").returns(true);
		oDependent2Mock.expects("isA").withExactArgs("sap.ui.base.BoundFilter").returns(true);
		oDependent1Mock.expects("getBinding").withExactArgs().returns({});
		oDependent2Mock.expects("getBinding").withExactArgs().returns(oBinding);
		oManagedObjectMock.expects("removeDependent").withExactArgs(sinon.match.same(oDependent2));

		oDependent0Mock.expects("destroy").never();
		oDependent1Mock.expects("destroy").never();
		oDependent2Mock.expects("destroy").withExactArgs();

		this.mock(oManagedObject).expects("getDependents").withExactArgs().returns([oDependent0, oDependent1, oDependent2]);

		// code under test
		oManagedObject._removeBoundFilters(oBinding);

		const oManagedObject2 = {};
		Object.assign(oManagedObject2, ManagedObjectBindingSupport); // simulate mixin

		// code under test - managed object is not an Element => has no dependents aggregation
		oManagedObject2._removeBoundFilters(oBinding);
	});

	//*********************************************************************************************
	QUnit.test("ManagedObjectBindingSupport#computeApplicationFilters, type ApplicationBound", function (assert) {
		const oManagedObject = {};
		Object.assign(oManagedObject, ManagedObjectBindingSupport); // simulate mixin
		const oFilter0 = {isBound() {}};
		const oFilter1 = {isBound() {}};
		const oBinding = {aApplicationFilters: [oFilter0, oFilter1], _isBoundFilterUpdate() {}};
		const oBindingMock = this.mock(oBinding);

		oBindingMock.expects("_isBoundFilterUpdate").withExactArgs().returns(true);

		// code under test
		let aFilters = oManagedObject.computeApplicationFilters(oBinding, "~vFilters~");

		assert.strictEqual(aFilters, "~vFilters~", "Just return filters in case of bound filter update");

		oBindingMock.expects("_isBoundFilterUpdate").withExactArgs().returns(false);
		this.mock(oManagedObject).expects("_removeBoundFilters").withExactArgs(sinon.match.same(oBinding));
		this.mock(oFilter0).expects("isBound").withExactArgs().returns(false);
		this.mock(oFilter1).expects("isBound").withExactArgs().returns(true);
		const oProcessFiltersCall = this.mock(oManagedObject).expects("_processFilters")
			.withExactArgs(sinon.match((oFilters) => {
					const aConstantFilters = oFilters.filters;
					return aConstantFilters.length === 1 && aConstantFilters[0] === oFilter0
						&& oFilters.boundFilters === "~vFilters~";
				}),
				sinon.match.func, false)
			.returns("~processedFilters~");

		// code under test
		aFilters = oManagedObject.computeApplicationFilters(oBinding,"~vFilters~", FilterType.ApplicationBound);

		assert.strictEqual(aFilters, "~processedFilters~");

		// code under test - call getBinding callback
		assert.strictEqual(oProcessFiltersCall.getCall(0).args[1](), oBinding);
	});

	//*********************************************************************************************
	QUnit.test("ManagedObjectBindingSupport#computeApplicationFilters, type Application", function (assert) {
		const oManagedObject = {};
		Object.assign(oManagedObject, ManagedObjectBindingSupport); // simulate mixin
		const oFilter0 = {isBound() {}};
		const oFilter1 = {isBound() {}};
		const aPreviousFilters = [oFilter0, oFilter1];
		const oBinding = {aApplicationFilters: aPreviousFilters, _isBoundFilterUpdate() {}};
		const oBindingMock = this.mock(oBinding);

		oBindingMock.expects("_isBoundFilterUpdate").withExactArgs().returns(false);
		this.mock(oManagedObject).expects("_removeBoundFilters").never();
		this.mock(oManagedObject).expects("_processFilters").never();
		const oFilter0Mock = this.mock(oFilter0);
		const oFilter1Mock = this.mock(oFilter1);
		oFilter0Mock.expects("isBound").withExactArgs().returns(false);
		oFilter1Mock.expects("isBound").withExactArgs().returns(false);
		const aFilters = ["~newFilter~"];

		// code under test - only unbound application filters
		let aResult = oManagedObject.computeApplicationFilters(oBinding, aFilters, FilterType.Application);

		assert.strictEqual(aResult, aFilters);

		oBindingMock.expects("_isBoundFilterUpdate").withExactArgs().returns(false);
		oFilter0Mock.expects("isBound").withExactArgs().returns(false);
		oFilter1Mock.expects("isBound").withExactArgs().returns(true);

		// code under test - with bound application filters, array of filters case
		aResult = oManagedObject.computeApplicationFilters(oBinding, aFilters, FilterType.Application);

		assert.strictEqual(aResult.length, 2);
		assert.strictEqual(aResult[0], "~newFilter~");
		assert.strictEqual(aResult[1], oFilter1);

		oBindingMock.expects("_isBoundFilterUpdate").withExactArgs().returns(false);
		oFilter0Mock.expects("isBound").withExactArgs().returns(true);
		oFilter1Mock.expects("isBound").withExactArgs().returns(false);

		// code under test - with bound application filters, single filter case
		aResult = oManagedObject.computeApplicationFilters(oBinding, "~singleFilter~", FilterType.Application);

		assert.strictEqual(aResult.length, 2);
		assert.strictEqual(aResult[0], "~singleFilter~");
		assert.strictEqual(aResult[1], oFilter0);

		oBindingMock.expects("_isBoundFilterUpdate").withExactArgs().returns(false);
		oFilter0Mock.expects("isBound").withExactArgs().returns(true);
		oFilter1Mock.expects("isBound").withExactArgs().returns(false);

		// code under test - with bound application filters, undefined filter case
		aResult = oManagedObject.computeApplicationFilters(oBinding, undefined, FilterType.Application);

		assert.strictEqual(aResult.length, 1);
		assert.strictEqual(aResult[0], oFilter0);
	});

	//*********************************************************************************************
	QUnit.test("ManagedObjectBindingSupport#computeApplicationFilters, error for type Control", function (assert) {
		const oManagedObject = {};
		Object.assign(oManagedObject, ManagedObjectBindingSupport); // simulate mixin

		// code under test
		assert.throws(() => {
			oManagedObject.computeApplicationFilters("~oBinding~", "~vFilters~", FilterType.Control);
		}, new Error("Must not use filter type Control"));
	});
});