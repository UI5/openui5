/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/model/odata/v4/lib/_AggregationHelper",
	"sap/ui/model/odata/v4/lib/_ConcatHelper"
], function (Log, _AggregationHelper, _ConcatHelper) {
	/*eslint camelcase: 0 */
	"use strict";

	//*********************************************************************************************
	QUnit.module("sap.ui.model.odata.v4.lib._ConcatHelper", {
		beforeEach : function () {
			this.oLogMock = this.mock(Log);
			this.oLogMock.expects("warning").never();
			this.oLogMock.expects("error").never();
		}
	});

	//*********************************************************************************************
[false, true].forEach(function (bHasFilterBeforeAggregate) {
	[false, true].forEach(function (bHasExclusiveFilter) {
		[undefined, sinon.spy()].forEach(function (fnGrandTotal) {
			[undefined, sinon.spy()].forEach(function (fnLeaves) {
	const sTitle = "enhanceCache, fnGrandTotal: " + fnGrandTotal + ", fnLeaves: " + fnLeaves
		+ ", has $$filterBeforeAggregate: " + bHasFilterBeforeAggregate
		+ ", has exclusive filter: " + bHasExclusiveFilter;

	QUnit.test(sTitle, function (assert) {
		var oAggregationHelperMock = this.mock(_AggregationHelper),
			fnCount = sinon.spy(),
			oCountRow = {
				UI5__count : "26",
				"UI5__count@odata.type" : "#Decimal"
			},
			oDataRow = {},
			oExpectedQueryOptions = {$skip : 42, $top : 57, "sap-client" : "123"},
			// handleResponse must be at the prototype
			oFirstLevelCache = Object.assign(Object.create({
				handleResponse : sinon.stub().returns("~result~")
			}), {
				aElements : [],
				sMetaPath : "/meta/path",
				mQueryOptions : bHasFilterBeforeAggregate
					? {$$filterBeforeAggregate : "~filterBeforeAggregate~", "sap-client" : "123"}
					: {"sap-client" : "123"},
				oRequestor : {
					buildQueryString : function () {}
				},
				sResourcePath : "SalesOrderList",
				getExclusiveFilter : function () {
					throw new Error("Must be mocked");
				}
			}),
			oFirstLevelCacheMock = this.mock(oFirstLevelCache),
			oGrandTotalRow = {},
			fnHandleResponse = oFirstLevelCache.handleResponse,
			oLeavesRow = {},
			mQueryOptions = oFirstLevelCache.mQueryOptions,
			sQueryOptionsJSON = JSON.stringify(mQueryOptions),
			oRequestorMock = this.mock(oFirstLevelCache.oRequestor),
			sResourcePath,
			oResult = {value : [oCountRow, oDataRow]};

		oFirstLevelCache.aElements.$created = 2;
		if (bHasExclusiveFilter) {
			oExpectedQueryOptions.$$filterBeforeAggregate = bHasFilterBeforeAggregate
				? "(~filterBeforeAggregate~) and ~exclusiveFilter~"
				: "~exclusiveFilter~";
		} else if (bHasFilterBeforeAggregate) {
			oExpectedQueryOptions.$$filterBeforeAggregate = "~filterBeforeAggregate~";
		}

		// code under test
		_ConcatHelper.enhanceCache(oFirstLevelCache, "~oAggregation~",
			[fnLeaves, fnCount, fnGrandTotal], "~mAlias2MeasureAndMethod~");

		assert.throws(function () {
			// code under test
			oFirstLevelCache.getResourcePathWithQuery(1, 100);
		}, new Error("Must not request created element"));

		oFirstLevelCacheMock.expects("getExclusiveFilter").twice().withExactArgs()
			.returns(bHasExclusiveFilter ? "~exclusiveFilter~" : undefined);
		oAggregationHelperMock.expects("buildApply")
			.withExactArgs("~oAggregation~", oExpectedQueryOptions, 1, undefined,
				"~mAlias2MeasureAndMethod~")
			.returns("~mQueryOptionsWithApply1~");
		oRequestorMock.expects("buildQueryString")
			.withExactArgs(oFirstLevelCache.sMetaPath, "~mQueryOptionsWithApply1~", false, true)
			.returns("?$apply=1st");

		// code under test
		sResourcePath = oFirstLevelCache.getResourcePathWithQuery(42 + 2, 99 - 42);

		assert.strictEqual(sResourcePath, "SalesOrderList?$apply=1st");
		assert.strictEqual(JSON.stringify(mQueryOptions), sQueryOptionsJSON, "unmodified");

		oAggregationHelperMock.expects("buildApply")
			.withExactArgs("~oAggregation~", oExpectedQueryOptions, 1, true,
				"~mAlias2MeasureAndMethod~")
			.returns("~mQueryOptionsWithApply2~");
		oRequestorMock.expects("buildQueryString")
			.withExactArgs(oFirstLevelCache.sMetaPath, "~mQueryOptionsWithApply2~", false, true)
			.returns("?$apply=2nd");

		// code under test
		sResourcePath = oFirstLevelCache.getResourcePathWithQuery(42 + 2, 99 - 42);

		assert.strictEqual(sResourcePath, "SalesOrderList?$apply=2nd");
		assert.strictEqual(JSON.stringify(mQueryOptions), sQueryOptionsJSON, "unmodified");

		if (fnGrandTotal) {
			oResult.value.splice(1, 0, oGrandTotalRow);
		}
		if (fnLeaves) {
			oResult.value.unshift(oLeavesRow);
		}

		assert.strictEqual(
			// code under test
			oFirstLevelCache.handleResponse(oResult, "a", "b", "c", "..."),
			"~result~");

		assert.notOk(oFirstLevelCache.hasOwnProperty("handleResponse"), "reverted to prototype");
		if (fnLeaves) {
			assert.strictEqual(fnLeaves.callCount, 1);
			assert.ok(fnLeaves.calledWith(sinon.match.same(oLeavesRow)));
		}
		assert.strictEqual(fnCount.callCount, 1);
		assert.ok(fnCount.calledWith(sinon.match.same(oCountRow)));
		if (fnGrandTotal) {
			assert.strictEqual(fnGrandTotal.callCount, 1);
			assert.ok(fnGrandTotal.calledWith(sinon.match.same(oGrandTotalRow)));
			fnGrandTotal.resetHistory(); // Note: fnGrandTotal is reused by inner forEach!
		}
		assert.strictEqual(fnHandleResponse.callCount, 1);
		assert.ok(fnHandleResponse.calledWith(sinon.match.same(oResult), "a", "b", "c", "..."));
		assert.strictEqual(oResult["@odata.count"], "26");
		assert.strictEqual(oResult.value.length, 1, "extra rows removed");
		assert.strictEqual(oResult.value[0], oDataRow);
	});
			});
		});
	});
});
});
