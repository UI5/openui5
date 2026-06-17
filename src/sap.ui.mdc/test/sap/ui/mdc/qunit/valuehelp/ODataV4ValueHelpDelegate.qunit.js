/* global QUnit, sinon */
/*eslint max-nested-callbacks: [2, 5]*/

sap.ui.define([
	"sap/ui/mdc/odata/v4/ValueHelpDelegate",
	"sap/ui/mdc/condition/Condition",
	"sap/ui/mdc/enums/OperatorName",
	"sap/ui/mdc/enums/BaseType",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/FilterType",
	"sap/ui/model/odata/v4/ODataListBinding",
	"sap/ui/model/odata/v4/ODataModel",
	"sap/ui/model/odata/type/Boolean"
], (
	ODataV4ValueHelpDelegate,
	Condition,
	OperatorName,
	BaseType,
	Filter,
	FilterOperator,
	FilterType,
	ODataV4ListBinding,
	ODataV4Model,
	BooleanType
) => {
	"use strict";

	let oConditions;
	const oFakeFilterBar = {
		getConditions: () => oConditions
	};

	const oModel = new ODataV4Model({
		serviceUrl: "/fake/",
		synchronizationMode: "None"
	});

	let oListBinding;
	let oBindingInfo;

	const oFakeContent = {
		isA: (sName) => true,
		isPropertyInitial: () => true,
		getActiveFilterBar: () => oFakeFilterBar,
		getSearch: () => "",
		isSearchSupported: () => false,
		isTypeahead: () => false,
		getListBindingInfo: () => oBindingInfo,
		getCaseSensitive: () => true
	};

	const oFakeValueHelp = {
		getDisplay: () => "Value"
	};

	QUnit.module("OData V4 specific behavior", {
		beforeEach() {
			oListBinding = oModel.bindList("/Products");
			sinon.stub(oListBinding, "changeParameters");
			sinon.stub(oListBinding, "filter");
			sinon.stub(oListBinding, "suspend");
			sinon.stub(oListBinding, "resume");
			sinon.stub(oListBinding, "isSuspended").returns(false);
			sinon.stub(oListBinding, "getRootBinding").returns(null);

			oBindingInfo = {
				path: "/Products",
				model: oModel,
				parameters: {},
				filters: undefined
			};
		},
		afterEach() {
			oListBinding.destroy();
			oListBinding = undefined;
			oBindingInfo = undefined;
			oConditions = undefined;
		}
	});

	QUnit.test("updateBindingInfo - no conditions", (assert) => {
		ODataV4ValueHelpDelegate.updateBindingInfo(oFakeValueHelp, oFakeContent, oBindingInfo);

		assert.deepEqual(oBindingInfo.parameters, {}, "oBindingInfo.parameters");
		assert.equal(oBindingInfo.filters?.length, 0, "oBindingInfo initially no filter set");
	});

	QUnit.test("updateBindingInfo - with FilterBar conditions", (assert) => {
		oConditions = {
			Category: [Condition.createCondition(OperatorName.EQ, ["Electronics"])]
		};

		ODataV4ValueHelpDelegate.updateBindingInfo(oFakeValueHelp, oFakeContent, oBindingInfo);

		assert.deepEqual(oBindingInfo.parameters, {}, "oBindingInfo.parameters");
		assert.equal(oBindingInfo.filters?.length, 1, "oBindingInfo filter set");
		assert.equal(oBindingInfo.filters?.[0]?.getPath(), "Category", "oBindingInfo filter path");
		assert.equal(oBindingInfo.filters?.[0]?.getOperator(), FilterOperator.EQ, "oBindingInfo filter operator");
		assert.equal(oBindingInfo.filters?.[0]?.getValue1(), "Electronics", "oBindingInfo filter value1");
	});

	QUnit.test("updateBindingInfo - with search", (assert) => {
		sinon.stub(oFakeContent, "isSearchSupported").returns(true);
		sinon.stub(oFakeContent, "getSearch").returns("test");

		ODataV4ValueHelpDelegate.updateBindingInfo(oFakeValueHelp, oFakeContent, oBindingInfo);

		assert.equal(oBindingInfo.parameters.$search, "test", "$search parameter set");

		oFakeContent.isSearchSupported.restore();
		oFakeContent.getSearch.restore();
	});

	QUnit.test("updateBindingInfo - empty search should be undefined", (assert) => {
		sinon.stub(oFakeContent, "isSearchSupported").returns(true);
		sinon.stub(oFakeContent, "getSearch").returns("");

		ODataV4ValueHelpDelegate.updateBindingInfo(oFakeValueHelp, oFakeContent, oBindingInfo);

		assert.equal(oBindingInfo.parameters.$search, undefined, "$search parameter not set for empty search");

		oFakeContent.isSearchSupported.restore();
		oFakeContent.getSearch.restore();
	});

	QUnit.test("isSearchSupported - with binding", (assert) => {
		const oTestBinding = oModel.bindList("/Products");
		oTestBinding.changeParameters = () => {};

		assert.ok(ODataV4ValueHelpDelegate.isSearchSupported(oFakeValueHelp, oFakeContent, oTestBinding), "Search supported when changeParameters exists");

		oTestBinding.destroy();
	});

	QUnit.test("isSearchSupported - without binding", (assert) => {
		assert.ok(ODataV4ValueHelpDelegate.isSearchSupported(oFakeValueHelp, oFakeContent, null), "Search supported by default when no binding");
	});

	QUnit.test("updateBinding - updates binding correctly", (assert) => {
		const oFilter = new Filter({path: "Category", operator: FilterOperator.EQ, value1: "Electronics"});
		oBindingInfo.filters = [oFilter];
		oBindingInfo.parameters = {$search: "test"};

		// Initially not suspended, will be suspended by updateBinding
		let bSuspended = false;
		oListBinding.isSuspended.callsFake(() => bSuspended);
		oListBinding.suspend.callsFake(() => { bSuspended = true; });
		oListBinding.resume.callsFake(() => { bSuspended = false; });

		ODataV4ValueHelpDelegate.updateBinding(oFakeValueHelp, oListBinding, oBindingInfo);

		assert.ok(oListBinding.suspend.calledOnce, "ListBinding suspended");
		assert.ok(oListBinding.changeParameters.calledWith(oBindingInfo.parameters), "changeParameters called with correct parameters");
		assert.ok(oListBinding.filter.calledWith(oBindingInfo.filters, FilterType.Application), "filter called with correct filters");
		assert.ok(oListBinding.resume.calledOnce, "ListBinding resumed");
	});

	QUnit.test("updateBinding - with root binding", (assert) => {
		let bRootSuspended = false;
		const oRootBinding = {
			suspend: sinon.spy(() => { bRootSuspended = true; }),
			resume: sinon.spy(() => { bRootSuspended = false; }),
			isSuspended: sinon.stub().callsFake(() => bRootSuspended)
		};
		oListBinding.getRootBinding.returns(oRootBinding);

		ODataV4ValueHelpDelegate.updateBinding(oFakeValueHelp, oListBinding, oBindingInfo);

		assert.ok(oRootBinding.suspend.calledOnce, "RootBinding suspended");
		assert.ok(oRootBinding.resume.calledOnce, "RootBinding resumed");
	});

	QUnit.test("executeFilter", (assert) => {
		sinon.stub(oListBinding, "getContexts").returns([]);
		sinon.stub(oListBinding, "requestContexts").returns(Promise.resolve([]));

		return ODataV4ValueHelpDelegate.executeFilter(oFakeValueHelp, oListBinding, 10).then((oResult) => {
			assert.equal(oResult, oListBinding, "ListBinding returned");
			assert.ok(oListBinding.getContexts.calledWith(0, 10), "getContexts called with correct parameters");
		});
	});

	QUnit.test("checkListBindingPending - no binding", (assert) => {
		const bPending = ODataV4ValueHelpDelegate.checkListBindingPending(oFakeValueHelp, null, 10);
		assert.notOk(bPending, "No binding returns false");
	});

	QUnit.test("checkListBindingPending - suspended binding", (assert) => {
		oListBinding.isSuspended.returns(true);

		const bPending = ODataV4ValueHelpDelegate.checkListBindingPending(oFakeValueHelp, oListBinding, 10);
		assert.notOk(bPending, "Suspended binding returns false");
	});

	QUnit.test("checkListBindingPending - with contexts", (assert) => {
		sinon.stub(oListBinding, "requestContexts").returns(Promise.resolve([{}, {}]));

		return ODataV4ValueHelpDelegate.checkListBindingPending(oFakeValueHelp, oListBinding, 10).then((bPending) => {
			assert.notOk(bPending, "Contexts available returns false");
		});
	});

	QUnit.test("checkListBindingPending - no contexts", (assert) => {
		sinon.stub(oListBinding, "requestContexts").returns(Promise.resolve([]));

		return ODataV4ValueHelpDelegate.checkListBindingPending(oFakeValueHelp, oListBinding, 10).then((bPending) => {
			assert.ok(bPending, "No contexts returns true");
		});
	});

	QUnit.test("getTypeMap", (assert) => {
		const oTypeMap = ODataV4ValueHelpDelegate.getTypeMap();
		assert.ok(oTypeMap, "TypeMap returned");
	});

	QUnit.test("updateBindingInfo - uses correct TypeMap for OData types", (assert) => {
		// Create a condition with a Boolean field
		oConditions = {
			IsActive: [Condition.createCondition(OperatorName.EQ, [true])]
		};

		// Create a template with OData Boolean type to simulate real binding
		const oBooleanType = new BooleanType();
		oBindingInfo.template = {
			mAggregations: {
				cells: [
					{mBindingInfos: [{parts: [{path: "IsActive", type: oBooleanType}]}]}
				]
			}
		};

		ODataV4ValueHelpDelegate.updateBindingInfo(oFakeValueHelp, oFakeContent, oBindingInfo);

		// Verify filter was created correctly
		assert.equal(oBindingInfo.filters?.length, 1, "Filter created for Boolean condition");
		assert.equal(oBindingInfo.filters?.[0]?.getPath(), "IsActive", "Filter path correct");
		assert.equal(oBindingInfo.filters?.[0]?.getOperator(), FilterOperator.EQ, "Filter operator correct");
		assert.equal(oBindingInfo.filters?.[0]?.getValue1(), true, "Filter value correct");

		// Verify that the correct TypeMap is used by checking the type conversion
		const oTypesForConditions = ODataV4ValueHelpDelegate.getTypesForConditions(
			oFakeValueHelp,
			oFakeContent,
			oConditions
		);
		assert.ok(oTypesForConditions.IsActive, "Type info retrieved for Boolean field");
		assert.equal(oTypesForConditions.IsActive.type, oBooleanType, "Correct type instance");
		assert.equal(oTypesForConditions.IsActive.baseType, BaseType.Boolean, "Correct base type (Boolean)");
	});
});
