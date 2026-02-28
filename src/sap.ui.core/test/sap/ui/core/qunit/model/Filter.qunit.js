/* global  QUnit */
sap.ui.define([
	"sap/base/Log",
	"sap/base/i18n/Localization",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function(Log, Localization, Filter, FilterOperator) {
	"use strict";

	var sDefaultLanguage = Localization.getLanguage();

	QUnit.module("sap.ui.model.Filter", {
		beforeEach : function () {
			Localization.setLanguage("en-US");
			this.oLogMock = this.mock(Log);
			this.oLogMock.expects("error").never();
			this.oLogMock.expects("warning").never();
		},

		afterEach : function () {
			Localization.setLanguage(sDefaultLanguage);
		}
	});

	QUnit.test("Filter getters", function (assert) {
		var fnComparator = function () {},
			sCondition = "condition",
			aFilters = [new Filter("path2", "operator", "value1")],
			sOperator = "operator",
			sPath = "path",
			fnTest = function () {},
			sValue1 = "value1",
			sValue2 = "value2",
			sVariable = "variable";

		// code under test (object notation of vFilterInfo used in constructor)
		let oFilter = new Filter({
			and : "~bAnd",
			caseSensitive : "~bCaseSensitive~",
			comparator : fnComparator,
			condition : sCondition,
			operator : sOperator,
			path : sPath,
			test : fnTest,
			value1 : sValue1,
			value2 : sValue2,
			variable : sVariable
		});

		assert.strictEqual(oFilter.isAnd(), true);
		assert.strictEqual(oFilter.isCaseSensitive(), "~bCaseSensitive~");
		assert.deepEqual(oFilter.getFilters(), undefined);
		assert.strictEqual(oFilter.getComparator(), fnComparator);
		assert.strictEqual(oFilter.getCondition(), sCondition);
		assert.strictEqual(oFilter.getOperator(), sOperator);
		assert.strictEqual(oFilter.getPath(), sPath);
		assert.strictEqual(oFilter.getValue1(), sValue1);
		assert.strictEqual(oFilter.getValue2(), sValue2);
		assert.strictEqual(oFilter.getVariable(), sVariable);
		assert.strictEqual(oFilter.getTest(), fnTest);

		// code under test (object notation of vFilterInfo, but with multifilter)
		oFilter = new Filter({
			and : "~bAnd",
			caseSensitive : "~bCaseSensitive~",
			comparator : fnComparator,
			condition : sCondition,
			filters : aFilters,
			test : fnTest,
			variable : sVariable
		});

		assert.strictEqual(oFilter.isAnd(), true);
		assert.strictEqual(oFilter.isCaseSensitive(), "~bCaseSensitive~");
		assert.deepEqual(oFilter.getFilters(), aFilters);
		assert.notStrictEqual(oFilter.getFilters(), aFilters);
		assert.strictEqual(oFilter.getComparator(), fnComparator);
		assert.strictEqual(oFilter.getCondition(), sCondition);
		assert.strictEqual(oFilter.getOperator(), undefined);
		assert.strictEqual(oFilter.getPath(), undefined);
		assert.strictEqual(oFilter.getValue1(), undefined);
		assert.strictEqual(oFilter.getValue2(), undefined);
		assert.strictEqual(oFilter.getVariable(), sVariable);
		assert.strictEqual(oFilter.getTest(), fnTest);

		// code under test (non-object notation used in constructor)
		oFilter = new Filter(sPath, sOperator, sValue1, sValue2);

		assert.strictEqual(oFilter.getPath(), sPath);
		assert.strictEqual(oFilter.getOperator(), sOperator);
		assert.strictEqual(oFilter.getValue1(), sValue1);
		assert.strictEqual(oFilter.getValue2(), sValue2);

		// code under test (non-object notation, operator as function)
		oFilter = new Filter(sPath, fnTest, sValue1, sValue2);
		assert.strictEqual(oFilter.getOperator(), undefined);
		assert.strictEqual(oFilter.getTest(), fnTest);
		assert.strictEqual(oFilter.getPath(), sPath);
		assert.strictEqual(oFilter.getValue1(), sValue1);
		assert.strictEqual(oFilter.getValue2(), sValue2);

		// code under test (legacy names bAnd and aFilters used in constructor)
		oFilter = new Filter({
			bAnd : 0, // some falsy value,
			aFilters : aFilters
		});

		assert.strictEqual(oFilter.isAnd(), false);
		assert.deepEqual(oFilter.getFilters(), aFilters);
		assert.notStrictEqual(oFilter.getFilters(), aFilters);

		// code under test (aFilters is undefined)
		assert.strictEqual(new Filter({
			path : sPath,
			operator : sOperator,
			value1 : sValue1
		}).getFilters(), undefined);
	});

	//*********************************************************************************************
	QUnit.test("Filter construction results in console logs",  function (oFixture) {
		this.oLogMock.expects("error").withExactArgs("Wrong parameters defined for filter.");

		// code under test: missing path
		// eslint-disable-next-line no-new
		new Filter({operator: "EQ", value1: 1});

		this.oLogMock.expects("error").withExactArgs("Filter in aggregation of multi filter has to "
			+ "be instance of sap.ui.model.Filter");

		// code under test: every multifilter has to be an instance of Filter
		// eslint-disable-next-line no-new
		new Filter({filters : [new Filter("path", FilterOperator.EQ, 42), {/*no Filter*/}]});
	});

	//*********************************************************************************************
	QUnit.test("defaultComparator: basics", function (assert) {

		// code under test (less)
		assert.strictEqual(Filter.defaultComparator(42, 43), -1);

		// code under test (equal)
		assert.strictEqual(Filter.defaultComparator(42, 42), 0);

		// code under test (greater)
		assert.strictEqual(Filter.defaultComparator(43, 42), 1);

		// code under test (NaN)
		assert.ok(Number.isNaN(Filter.defaultComparator(42, null)));
		assert.ok(Number.isNaN(Filter.defaultComparator(null, 43)));
		assert.ok(Number.isNaN(Filter.defaultComparator(42, {})));
		assert.ok(Number.isNaN(Filter.defaultComparator(42, NaN)));
	});

	//*********************************************************************************************
	QUnit.test("defaultComparator: localeCompare with language tag", function (assert) {
		var oLocalizationMock = this.mock(Localization);

		oLocalizationMock.expects("getLanguageTag").withExactArgs().returns("foo");
		this.mock(String.prototype).expects("localeCompare")
			.withExactArgs("~b", "foo")
			.on("~a")
			.returns("bar");

		// code under test
		assert.strictEqual(Filter.defaultComparator("~a", "~b"), "bar");

		// Otherwise, the call in "afterEach" leads to an error.
		oLocalizationMock.verify();
	});

	//*********************************************************************************************
	QUnit.test("defaultComparator: localeCompare for different locales", function (assert) {
		Localization.setLanguage("de");

		// code under test
		assert.strictEqual(Filter.defaultComparator("ä", "z"), -1);

		Localization.setLanguage("sv");

		// code under test
		assert.strictEqual(Filter.defaultComparator("ä", "z"), 1);
	});

	QUnit.test("constructor - create Filter Any/All - ok", function (assert) {
		// code under test - "Any", object syntax
		let oFilter = new Filter({
			path: "Order_Details",
			operator: FilterOperator.Any,
			variable: "d",
			condition: new Filter("path", FilterOperator.EQ, 200)
		});

		assert.ok(oFilter.getMetadata().isA("sap.ui.model.Filter"), "Filter 'Any' (object syntax) created");
		assert.strictEqual(oFilter.getPath(), "Order_Details");
		assert.strictEqual(oFilter.getOperator(), FilterOperator.Any);
		assert.strictEqual(oFilter.getVariable(), "d");
		assert.ok(oFilter.getCondition() instanceof Filter);

		// code under test
		oFilter = new Filter({
			path: "Order_Details",
			operator: FilterOperator.Any
		});

		assert.strictEqual(oFilter.getVariable(), undefined);
		assert.strictEqual(oFilter.getCondition(), undefined);
	});

	QUnit.test("constructor - create Filter NotAny - ok", function (assert) {
		// code under test - "NotAny", object syntax
		let oFilter = new Filter({
			path: "Order_Details",
			operator: FilterOperator.NotAny,
			variable: "d",
			condition: new Filter("path", FilterOperator.EQ, 200)
		});

		assert.ok(oFilter.getMetadata().isA("sap.ui.model.Filter"), "Filter 'NotAny' (object syntax) created");
		assert.strictEqual(oFilter.getPath(), "Order_Details");
		assert.strictEqual(oFilter.getOperator(), FilterOperator.NotAny);
		assert.strictEqual(oFilter.getVariable(), "d");
		assert.ok(oFilter.getCondition() instanceof Filter);

		// code under test
		oFilter = new Filter({
			path: "Order_Details",
			operator: FilterOperator.NotAny
		});

		assert.strictEqual(oFilter.getVariable(), undefined);
		assert.strictEqual(oFilter.getCondition(), undefined);
	});

	QUnit.test("constructor - create Filter NotAll - ok", function (assert) {
		// code under test - "NotAll", object syntax
		const oFilter = new Filter({
			path: "Order_Details",
			operator: FilterOperator.NotAll,
			variable: "d",
			condition: new Filter("path", FilterOperator.EQ, 200)
		});

		assert.ok(oFilter.getMetadata().isA("sap.ui.model.Filter"), "Filter 'NotAll' (object syntax) created");
		assert.strictEqual(oFilter.getPath(), "Order_Details");
		assert.strictEqual(oFilter.getOperator(), FilterOperator.NotAll);
		assert.strictEqual(oFilter.getVariable(), "d");
		assert.ok(oFilter.getCondition() instanceof Filter);
	});

[FilterOperator.Any, FilterOperator.All, FilterOperator.NotAny, FilterOperator.NotAll].forEach((sOperator) => {
	QUnit.test("constructor - wrong args (legacy syntax) - " + sOperator, (assert) => {
		const sLegacyAnyAll = "The filter operators 'Any', 'All', 'NotAny', and 'NotAll' are only supported with the"
			+ " parameter object notation.";

		// code under test
		assert.throws(() => new Filter("test", sOperator, "notSupported"),
			new Error(sLegacyAnyAll),
			"'" + sOperator + "' is not accepted with legacy syntax");
		// code under test
		assert.throws(() => new Filter("test", sOperator),
			new Error(sLegacyAnyAll),
			"'" + sOperator + "' is not accepted with legacy syntax and missing 3rd and 4th argument");
	});
});

[FilterOperator.Any, FilterOperator.NotAny].forEach((sOperator) => {
	QUnit.test("constructor - wrong args (object syntax: missing condition) - " + sOperator, (assert) => {
		// code under test
		assert.throws(() => new Filter({path: "foo", operator: sOperator, variable: "blub"}),
			new Error("When using the filter operator 'Any' or 'NotAny', you need to provide both a lambda variable and"
				+ " a condition, or neither."),
			"Error thrown if condition is Missing in '" + sOperator + "'."
		);
	});
});

[FilterOperator.All, FilterOperator.NotAll].forEach((sOperator) => {
	QUnit.test("constructor - wrong args (object syntax: missing variable/condition) - " + sOperator, (assert) => {
		// code under test
		assert.throws(() => new Filter({path: "foo", operator: sOperator, variable: "blub"}),
			new Error("When using the filter operator 'Any', 'All', 'NotAny', or 'NotAll', a valid instance of"
				+ " sap.ui.model.Filter has to be given as the 'condition' argument."),
			"Error thrown if condition is Missing in '" + sOperator + "'."
		);
		// code under test
		assert.throws(() => new Filter({path: "foo", operator: sOperator}),
			new Error("When using the filter operators 'Any', 'All', 'NotAny', or 'NotAll', a string has to be given"
				+ " as the 'variable' argument."),
			"Error thrown if no args are given with '" + sOperator + "' operator"
		);
	});
});

	QUnit.test("getAST: Simple filters", function (assert) {
		assert.deepEqual(new Filter("path", FilterOperator.EQ, "value").getAST(), {
			type: "Binary",
			op: "==",
			left: {
				type: "Reference",
				path: "path"
			},
			right: {
				type: "Literal",
				value: "value"
			}
		}, "EQ operator");

		assert.deepEqual(new Filter("path", FilterOperator.NE, "value").getAST(), {
			type: "Binary",
			op: "!=",
			left: {
				type: "Reference",
				path: "path"
			},
			right: {
				type: "Literal",
				value: "value"
			}
		}, "NE operator");

		assert.deepEqual(new Filter("path", FilterOperator.GT, "value").getAST(), {
			type: "Binary",
			op: ">",
			left: {
				type: "Reference",
				path: "path"
			},
			right: {
				type: "Literal",
				value: "value"
			}
		}, "GT operator");

		assert.deepEqual(new Filter("path", FilterOperator.LT, "value").getAST(), {
			type: "Binary",
			op: "<",
			left: {
				type: "Reference",
				path: "path"
			},
			right: {
				type: "Literal",
				value: "value"
			}
		}, "LT operator");

		assert.deepEqual(new Filter("path", FilterOperator.GE, "value").getAST(), {
			type: "Binary",
			op: ">=",
			left: {
				type: "Reference",
				path: "path"
			},
			right: {
				type: "Literal",
				value: "value"
			}
		}, "GE operator");

		assert.deepEqual(new Filter("path", FilterOperator.LE, "value").getAST(), {
			type: "Binary",
			op: "<=",
			left: {
				type: "Reference",
				path: "path"
			},
			right: {
				type: "Literal",
				value: "value"
			}
		}, "LE operator");

		assert.deepEqual(new Filter("path", FilterOperator.BT, "value1", "value2").getAST(), {
			type: "Logical",
			op: "&&",
			left: {
				type: "Binary",
				op: ">=",
				left: {
					type: "Reference",
					path: "path"
				},
				right: {
					type: "Literal",
					value: "value1"
				}
			},
			right: {
				type: "Binary",
				op: "<=",
				left: {
					type: "Reference",
					path: "path"
				},
				right: {
					type: "Literal",
					value: "value2"
				}
			}
		}, "BT operator");

		assert.deepEqual(new Filter("path", FilterOperator.NB, "value1", "value2").getAST(), {
			type: "Logical",
			op: "||",
			left: {
				type: "Binary",
				op: "<",
				left: {
					type: "Reference",
					path: "path"
				},
				right: {
					type: "Literal",
					value: "value1"
				}
			},
			right: {
				type: "Binary",
				op: ">",
				left: {
					type: "Reference",
					path: "path"
				},
				right: {
					type: "Literal",
					value: "value2"
				}
			}
		}, "NB operator");

		assert.deepEqual(new Filter("path", FilterOperator.Contains, "value").getAST(), {
			type: "Call",
			name: "contains",
			args: [
				{
					type: "Reference",
					path: "path"
				},
				{
					type: "Literal",
					value: "value"
				}
			]
		}, "Contains operator");

		assert.deepEqual(new Filter("path", FilterOperator.StartsWith, "value").getAST(), {
			type: "Call",
			name: "startswith",
			args: [
				{
					type: "Reference",
					path: "path"
				},
				{
					type: "Literal",
					value: "value"
				}
			]
		}, "StartsWith operator");

		assert.deepEqual(new Filter("path", FilterOperator.EndsWith, "value").getAST(), {
			type: "Call",
			name: "endswith",
			args: [
				{
					type: "Reference",
					path: "path"
				},
				{
					type: "Literal",
					value: "value"
				}
			]
		}, "EndsWith operator");

		assert.deepEqual(new Filter("path", FilterOperator.NotContains, "value").getAST(), {
			type: "Unary",
			op: "!",
			arg: {
				type: "Call",
				name: "contains",
				args: [
					{
						type: "Reference",
						path: "path"
					},
					{
						type: "Literal",
						value: "value"
					}
				]
			}
		}, "NotContains operator");

		assert.deepEqual(new Filter("path", FilterOperator.NotStartsWith, "value").getAST(), {
			type: "Unary",
			op: "!",
			arg: {
				type: "Call",
				name: "startswith",
				args: [
					{
						type: "Reference",
						path: "path"
					},
					{
						type: "Literal",
						value: "value"
					}
				]
			}
		}, "NotStartsWith operator");

		assert.deepEqual(new Filter("path", FilterOperator.NotEndsWith, "value").getAST(), {
			type: "Unary",
			op: "!",
			arg: {
				type: "Call",
				name: "endswith",
				args: [
					{
						type: "Reference",
						path: "path"
					},
					{
						type: "Literal",
						value: "value"
					}
				]
			}
		}, "NotEndsWith operator");
	});

	QUnit.test("getAST: Multi filters", function (assert) {
		var oFilter;

		oFilter = new Filter([
			new Filter("path", FilterOperator.EQ, "value")
		]);
		assert.deepEqual(oFilter.getAST(), {
			type: "Binary",
			op: "==",
			left: {
				type: "Reference",
				path: "path"
			},
			right: {
				type: "Literal",
				value: "value"
			}
		}, "Multifilter containing a single filter");

		oFilter = new Filter([
			new Filter("path", FilterOperator.EQ, "value1"),
			new Filter("path", FilterOperator.EQ, "value2")
		]);
		assert.deepEqual(oFilter.getAST(), {
			type: "Logical",
			op: "||",
			left: {
				type: "Binary",
				op: "==",
				left: {
					type: "Reference",
					path: "path"
				},
				right: {
					type: "Literal",
					value: "value1"
				}
			},
			right: {
				type: "Binary",
				op: "==",
				left: {
					type: "Reference",
					path: "path"
				},
				right: {
					type: "Literal",
					value: "value2"
				}
			}
		}, "Multifilter containing two filters ORed");

		oFilter = new Filter([
			new Filter("path", FilterOperator.EQ, "value1"),
			new Filter("path", FilterOperator.EQ, "value2"),
			new Filter("path", FilterOperator.EQ, "value3")
		]);
		assert.deepEqual(oFilter.getAST(), {
			type: "Logical",
			op: "||",
			left: {
				type: "Binary",
				op: "==",
				left: {
					type: "Reference",
					path: "path"
				},
				right: {
					type: "Literal",
					value: "value1"
				}
			},
			right: {
				type: "Logical",
				op: "||",
				left: {
					type: "Binary",
					op: "==",
					left: {
						type: "Reference",
						path: "path"
					},
					right: {
						type: "Literal",
						value: "value2"
					}
				},
				right: {
					type: "Binary",
					op: "==",
					left: {
						type: "Reference",
						path: "path"
					},
					right: {
						type: "Literal",
						value: "value3"
					}
				}
			}
		}, "Multifilter containing three filters ORed");

		oFilter = new Filter([
			new Filter("path", FilterOperator.EQ, "value1"),
			new Filter("path", FilterOperator.EQ, "value2")
		], true);
		assert.deepEqual(oFilter.getAST(), {
			type: "Logical",
			op: "&&",
			left: {
				type: "Binary",
				op: "==",
				left: {
					type: "Reference",
					path: "path"
				},
				right: {
					type: "Literal",
					value: "value1"
				}
			},
			right: {
				type: "Binary",
				op: "==",
				left: {
					type: "Reference",
					path: "path"
				},
				right: {
					type: "Literal",
					value: "value2"
				}
			}
		}, "Multifilter containing two filters ANDed");

		oFilter = new Filter([
			new Filter([
				new Filter("path1", FilterOperator.EQ, "value1"),
				new Filter("path1", FilterOperator.EQ, "value2")
			]),
			new Filter([
				new Filter("path2", FilterOperator.EQ, "value1"),
				new Filter("path2", FilterOperator.EQ, "value2")
			])
		], true);

		assert.deepEqual(oFilter.getAST(), {
			type: "Logical",
			op: "&&",
			left: {
				type: "Logical",
				op: "||",
				left: {
					type: "Binary",
					op: "==",
					left: {
						type: "Reference",
						path: "path1"
					},
					right: {
						type: "Literal",
						value: "value1"
					}
				},
				right: {
					type: "Binary",
					op: "==",
					left: {
						type: "Reference",
						path: "path1"
					},
					right: {
						type: "Literal",
						value: "value2"
					}
				}
			},
			right: {
				type: "Logical",
				op: "||",
				left: {
					type: "Binary",
					op: "==",
					left: {
						type: "Reference",
						path: "path2"
					},
					right: {
						type: "Literal",
						value: "value1"
					}
				},
				right: {
					type: "Binary",
					op: "==",
					left: {
						type: "Reference",
						path: "path2"
					},
					right: {
						type: "Literal",
						value: "value2"
					}
				}
			}
		}, "Multifilter nested OR in AND");

	});

[FilterOperator.Any, FilterOperator.All].forEach((sOperator) => {
	QUnit.test("getAST: Lambda filters - " + sOperator, function (assert) {
		const oFilter = new Filter({
			operator: sOperator,
			path: "path",
			variable: "item",
			condition: new Filter("item/path", FilterOperator.EQ, "value")
		});
		assert.deepEqual(oFilter.getAST(), {
			type: "Lambda",
			op: sOperator,
			ref: {
				type: "Reference",
				path: "path"
			},
			variable: {
				type: "Variable",
				name: "item"
			},
			condition: {
				type: "Binary",
				op: "==",
				left: {
					type: "Reference",
					path: "item/path"
				},
				right: {
					type: "Literal",
					value: "value"
				}
			}
		}, "Lambdafilter " + sOperator);
	});
});

[FilterOperator.NotAny, FilterOperator.NotAll].forEach((sOperator) => {
	QUnit.test("getAST: Lambda filters - " + sOperator, function (assert) {
		const oFilter = new Filter({
			operator: sOperator,
			path: "path",
			variable: "item",
			condition: new Filter("item/path", FilterOperator.EQ, "value")
		});
		assert.deepEqual(oFilter.getAST(), {
			type: "Unary",
			op: "!",
			arg: {
				type: "Lambda",
				op: sOperator === FilterOperator.NotAny ? FilterOperator.Any : FilterOperator.All,
				ref: {
					type: "Reference",
					path: "path"
				},
				variable: {
					type: "Variable",
					name: "item"
				},
				condition: {
					type: "Binary",
					op: "==",
					left: {
						type: "Reference",
						path: "item/path"
					},
					right: {
						type: "Literal",
						value: "value"
					}
				}
			}
		}, "Lambdafilter " + sOperator);
	});
});

	QUnit.test("getAST: Origin information", function (assert) {
		assert.equal(new Filter("path", FilterOperator.EQ, "value").getAST(true).origin, "EQ");
		assert.equal(new Filter("path", FilterOperator.NE, "value").getAST(true).origin, "NE");
		assert.equal(new Filter("path", FilterOperator.GT, "value").getAST(true).origin, "GT");
		assert.equal(new Filter("path", FilterOperator.LT, "value").getAST(true).origin, "LT");
		assert.equal(new Filter("path", FilterOperator.BT, "value").getAST(true).origin, "BT");
		assert.equal(new Filter("path", FilterOperator.NB, "value").getAST(true).origin, "NB");
		assert.equal(new Filter("path", FilterOperator.Contains, "value").getAST(true).origin, "Contains");
		assert.equal(new Filter("path", FilterOperator.StartsWith, "value").getAST(true).origin, "StartsWith");
		assert.equal(new Filter("path", FilterOperator.EndsWith, "value").getAST(true).origin, "EndsWith");
		assert.equal(new Filter("path", FilterOperator.NotContains, "value").getAST(true).origin, "NotContains");
		assert.equal(new Filter("path", FilterOperator.NotStartsWith, "value").getAST(true).origin, "NotStartsWith");
		assert.equal(new Filter("path", FilterOperator.NotEndsWith, "value").getAST(true).origin, "NotEndsWith");
		assert.equal(new Filter([
			new Filter("path", FilterOperator.EQ, "value"),
			new Filter("path", FilterOperator.EQ, "value")
		], false).getAST(true).origin, "OR");
		assert.equal(new Filter([
			new Filter("path", FilterOperator.EQ, "value"),
			new Filter("path", FilterOperator.EQ, "value")
		], true).getAST(true).origin, "AND");

		assert.equal(new Filter([
			new Filter("path", FilterOperator.EQ, "value")
		], false).getAST(true).origin, "EQ", "Multifilter with single filter should have inner filter origin");


	});

	//*********************************************************************************************
	QUnit.test("getAST: Static never fulfilled filter", function(assert) {
		assert.ok(Filter.NONE instanceof Filter);
		assert.strictEqual(Filter.NONE.getPath(), "/");
		assert.strictEqual(typeof Filter.NONE.getTest(), "function");
		assert.strictEqual(Filter.NONE.getTest()(), false);
		assert.throws(() => {
			// code under test
			Filter.NONE.getAST();
		}, new Error("Unknown operator: undefined"));
	});

	//*********************************************************************************************
[
	{filters : [{}, Filter.NONE]},
	[{}, Filter.NONE],
	{condition : Filter.NONE}
].forEach((oFixture, i) => {
	QUnit.test("Filter.NONE passed to constructor, " + i, function(assert) {
		assert.throws(() => {
			// code under test
			new Filter(oFixture);
		}, new Error("Filter.NONE not allowed "
			+ (oFixture.condition ? "as condition" : "in multiple filter")));
	});
});

	//*********************************************************************************************
	QUnit.test("checkFilterNone", function(assert) {
		// code under test
		Filter.checkFilterNone();

		// code under test
		Filter.checkFilterNone(Filter.NONE);

		// code under test
		Filter.checkFilterNone([Filter.NONE]);

		const oFilter = new Filter("path", FilterOperator.EQ, "value");
		oFilter.length = 2;

		// code under test - no error in case of tagged filter or Filter subclass with length property
		Filter.checkFilterNone(oFilter);

		// code under test
		assert.throws(() => {
			Filter.checkFilterNone([new Filter("path", FilterOperator.EQ, "value"), Filter.NONE]);
		}, new Error("Filter.NONE cannot be used together with other filters"));
	});

	//*********************************************************************************************
	QUnit.test("constructor initializes members for fractional seconds", function (assert) {
		// code under test
		const oFilter = new Filter({path : "~path", operator : "~operator", value1 : "~value1"});

		assert.strictEqual(oFilter.sPath, "~path");
		assert.strictEqual(oFilter.sFractionalSeconds1, undefined);
		assert.ok(oFilter.hasOwnProperty("sFractionalSeconds1"));
		assert.strictEqual(oFilter.sFractionalSeconds2, undefined);
		assert.ok(oFilter.hasOwnProperty("sFractionalSeconds2"));
	});

	//*********************************************************************************************
	QUnit.test("appendFractionalSeconds(1|2)", function (assert) {
		const oFilter = new Filter({path : "~path", operator : "~operator", value1 : "~value1"});

		// code under test
		oFilter.appendFractionalSeconds1("~f1");

		assert.strictEqual(oFilter.sFractionalSeconds1, "~f1");

		// code under test
		oFilter.appendFractionalSeconds2("~f2");

		assert.strictEqual(oFilter.sFractionalSeconds2, "~f2");
	});

	//*********************************************************************************************
	QUnit.test("isMultiFilter", function (assert) {
		let oFilter = new Filter({path : "~path", operator : "~operator", value1 : "~value1"});

		// code under test
		assert.strictEqual(oFilter.isMultiFilter(), false);

		oFilter = new Filter({filters : [
			new Filter({path : "~path1", operator : "~operator", value1 : "~value1"}),
			new Filter({path : "~path2", operator : "~operator", value1 : "~value2"})
		]});

		// code under test
		assert.strictEqual(oFilter.isMultiFilter(), true);
	});

	//*********************************************************************************************
	QUnit.test("bResolved property, setResolved", function (assert) {
		const oFilter = new Filter({path : "~path", operator : "~operator", value1 : "~value1"});

		// code under test
		assert.strictEqual(oFilter.bResolved, undefined, "bResolved initially undefined");
		assert.ok(oFilter.hasOwnProperty("bResolved"));

		// code under test
		oFilter.setResolved("~bResolved");

		assert.strictEqual(oFilter.bResolved, true, "bResolved set correctly (truthy)");

		// code under test
		oFilter.setResolved(null);

		assert.strictEqual(oFilter.bResolved, false, "bResolved set correctly (falsy)");
	});

	//*********************************************************************************************
	QUnit.test("isResolved, single filter", function (assert) {
		const oSingleFilter = new Filter({path : "~path", operator : "~operator", value1 : "~value1"});

		// code under test
		assert.strictEqual(oSingleFilter.isResolved(), true, "constant single filter");

		oSingleFilter.setResolved(false);

		// code under test
		assert.strictEqual(oSingleFilter.isResolved(), false, "non-resolved single filter");

		oSingleFilter.setResolved(true);

		// code under test
		assert.strictEqual(oSingleFilter.isResolved(), true, "resolved single filter");
	});

	//*********************************************************************************************
	QUnit.test("isResolved, multi-filter", function (assert) {
		const oSingleFilter1 = new Filter({path : "~path", operator : "~operator", value1 : "~value1.1"});
		const oSingleFilter2 = new Filter({path : "~path2", operator : "~operator", value1 : "~value1.2"});
		const oMultiFilter = new Filter({filters : [oSingleFilter1, oSingleFilter2]});

		// code under test
		assert.strictEqual(oMultiFilter.isResolved(), true, "multi-filter with constant single filters");

		oSingleFilter1.setResolved(false);
		oSingleFilter2.setResolved(false);

		// code under test
		assert.strictEqual(oMultiFilter.isResolved(), false, "(1) multi-filter with unresolved single filters");

		oSingleFilter1.setResolved(true);

		// code under test
		assert.strictEqual(oMultiFilter.isResolved(), false, "(2) multi-filter with unresolved single filters");

		oSingleFilter2.setResolved(true);

		// code under test
		assert.strictEqual(oMultiFilter.isResolved(), true, "multi-filter with resolved single filters");
	});

	//*********************************************************************************************
[undefined, true, "noGeneratedTestFunction"].forEach((vGenerated) => {
	QUnit.test("cloneWithValues, vGenerated: " + vGenerated, function (assert) {
		const fnComparator = () => {};
		const fnTest = () => {};
		const oFilter = new Filter({
			path: "~path~",
			operator: "~operator~",
			value1: "~value1~",
			value2: "~value2~",
			variable: "~variable~",
			condition: new Filter("~conditionPath~", "~conditionOperator~", "~conditionValue1~"),
			and: "~and~",
			test: fnTest,
			comparator: fnComparator,
			caseSensitive: "~caseSensitive~"
		});
		oFilter.bBound = "~bound~";
		if (vGenerated === "noGeneratedTestFunction") {
			delete oFilter.fnTest;
		} else {
			oFilter.fnTest[Filter.generated] = vGenerated;
		}

		// code under test
		const oClone = oFilter.cloneWithValues("~newValue1~", "~newValue2~");

		assert.ok(oClone.isA("sap.ui.model.Filter"));
		assert.notStrictEqual(oClone, oFilter);
		assert.strictEqual(oClone.getPath(), oFilter.getPath());
		assert.strictEqual(oClone.getOperator(), oFilter.getOperator());
		assert.strictEqual(oClone.getValue1(), "~newValue1~");
		assert.strictEqual(oClone.getValue2(), "~newValue2~");
		assert.strictEqual(oClone.getVariable(), oFilter.getVariable());
		assert.strictEqual(oClone.getCondition(), oFilter.getCondition(), "condition filter not cloned");
		assert.strictEqual(oClone.isAnd(), oFilter.isAnd());
		assert.strictEqual(oClone.getTest(), vGenerated ? undefined : fnTest);
		assert.strictEqual(oClone.getComparator(), oFilter.getComparator());
		assert.strictEqual(oClone.isCaseSensitive(), oFilter.isCaseSensitive());
		assert.strictEqual(oClone._bMultiFilter, false);
		assert.strictEqual(oClone.bBound, "~bound~");
	});
});

	//*********************************************************************************************
[[undefined, undefined], [false, true], [true, true]].forEach(([bResolved, expectedResolved], i) => {
	QUnit.test("cloneWithValues, bResolved, " + i, function (assert) {
		const oFilter = new Filter({
			path: "~path~",
			operator: "~operator~",
			value1: "~value1~"
		});
		oFilter.bResolved = bResolved;

		// code under test
		const oClone = oFilter.cloneWithValues(undefined, undefined);

		assert.ok(oClone.isA("sap.ui.model.Filter"));
		assert.notStrictEqual(oClone, oFilter);
		assert.strictEqual(oClone.getPath(), oFilter.getPath());
		assert.strictEqual(oClone.getOperator(), oFilter.getOperator());
		assert.strictEqual(oClone.getValue1(), undefined);
		assert.strictEqual(oClone.getValue2(), undefined);
		assert.strictEqual(oClone.bResolved, expectedResolved);
	});
});

	//*********************************************************************************************
	QUnit.test("cloneWithValues, error on multi-filter", function (assert) {
		const oSingleFilter1 = new Filter({path : "~path", operator : "~operator", value1 : "~value1.1"});
		const oSingleFilter2 = new Filter({path : "~path2", operator : "~operator", value1 : "~value1.2"});
		const oMultiFilter = new Filter({filters : [oSingleFilter1, oSingleFilter2]});

		// code under test
		assert.throws(() => { oMultiFilter.cloneWithValues("v1", "v2"); }, new Error("Cannot clone multi-filter"));
	});

	//*********************************************************************************************
	QUnit.test("cloneIfContained on single filter", function (assert) {
		const oSingleFilter = new Filter({path : "~path~", operator : "~operator~", value1 : "~value1~"});
		const oSingleFilterClone = new Filter({path : "~path~", operator : "~operator~", value1 : "~newValue1~"});

		// code under test
		let oFilterClone = oSingleFilter.cloneIfContained(oSingleFilter, oSingleFilterClone);

		assert.strictEqual(oFilterClone, oSingleFilterClone);

		const oSingleFilter2 = new Filter({path : "~path~", operator : "~operator~", value1 : "~value1~"});

		// code under test
		oFilterClone = oSingleFilter2.cloneIfContained(oSingleFilter, oSingleFilterClone);

		assert.strictEqual(oFilterClone, oSingleFilter2);
	});

	//*********************************************************************************************
	QUnit.test("cloneIfContained on multi-filter", function (assert) {
		const oSingleFilter1 = new Filter({path : "~path", operator : "~operator", value1 : "~value1.1"});
		const oSingleFilter2 = new Filter({path : "~path2", operator : "~operator", value1 : "~value1.2"});
		const oSingleFilter3 = new Filter({path : "~path3", operator : "~operator", value1 : "~value1.3"});
		const oMultiFilter = new Filter({filters : [oSingleFilter1, oSingleFilter2, oSingleFilter1]});
		oMultiFilter.bAnd = "~and~";
		const oSingleFilterClone = new Filter({path : "~path~", operator : "~operator~", value1 : "~newValue1~"});

		// code under test - single filter is found
		let oFilterClone = oMultiFilter.cloneIfContained(oSingleFilter1, oSingleFilterClone);

		assert.notStrictEqual(oFilterClone, oMultiFilter);
		assert.ok(oFilterClone._bMultiFilter);
		assert.strictEqual(oFilterClone.bAnd, "~and~");
		let aFilters = oFilterClone.aFilters;
		assert.notStrictEqual(aFilters, oMultiFilter.aFilters);
		assert.strictEqual(aFilters.length, 3);
		assert.strictEqual(aFilters[0], oSingleFilterClone);
		assert.strictEqual(aFilters[1], oSingleFilter2);
		assert.strictEqual(aFilters[2], oSingleFilterClone);

		// code under test - single filter is not found
		oFilterClone = oMultiFilter.cloneIfContained(oSingleFilter3, oSingleFilterClone);

		assert.strictEqual(oFilterClone, oMultiFilter);

		const oMultiFilter2 = new Filter({filters : [oSingleFilter2, oMultiFilter, oSingleFilter3]});
		oMultiFilter.bAnd = "~and_1~";
		oMultiFilter2.bAnd = "~and_2~";

		// code under test - nested multi-filter, single filter is found only in nested multi-filter
		oFilterClone = oMultiFilter2.cloneIfContained(oSingleFilter1, oSingleFilterClone);

		assert.notStrictEqual(oFilterClone, oMultiFilter2);
		assert.ok(oFilterClone._bMultiFilter);
		assert.strictEqual(oFilterClone.bAnd, "~and_2~");
		aFilters = oFilterClone.aFilters;
		assert.notStrictEqual(aFilters, oMultiFilter2.aFilters);
		assert.strictEqual(aFilters.length, 3);
		assert.strictEqual(aFilters[0], oSingleFilter2);
		assert.strictEqual(aFilters[2], oSingleFilter3);
		// check nested multi-filter
		assert.ok(aFilters[1]._bMultiFilter);
		assert.notStrictEqual(aFilters[1], oMultiFilter);
		assert.strictEqual(aFilters[1].bAnd, "~and_1~");
		let aInnerFilters = aFilters[1].aFilters;
		assert.notStrictEqual(aInnerFilters, oMultiFilter.aFilters);
		assert.strictEqual(aInnerFilters.length, 3);
		assert.strictEqual(aInnerFilters[0], oSingleFilterClone);
		assert.strictEqual(aInnerFilters[1], oSingleFilter2);
		assert.strictEqual(aInnerFilters[2], oSingleFilterClone);

		const oMultiFilter3 = new Filter({filters : [oSingleFilter1, oMultiFilter, oSingleFilter2]});
		oMultiFilter.bAnd = "~and_1.1~";
		oMultiFilter3.bAnd = "~and_3~";

		// code under test - nested multi-filter, single filter is found
		oFilterClone = oMultiFilter3.cloneIfContained(oSingleFilter1, oSingleFilterClone);

		assert.notStrictEqual(oFilterClone, oMultiFilter3);
		assert.ok(oFilterClone._bMultiFilter);
		assert.strictEqual(oFilterClone.bAnd, "~and_3~");
		aFilters = oFilterClone.aFilters;
		assert.notStrictEqual(aFilters, oMultiFilter3.aFilters);
		assert.strictEqual(aFilters.length, 3);
		assert.strictEqual(aFilters[0], oSingleFilterClone);
		assert.strictEqual(aFilters[2], oSingleFilter2);
		// check nested multi-filter
		assert.ok(aFilters[1]._bMultiFilter);
		assert.strictEqual(aFilters[1].bAnd, "~and_1.1~");
		aInnerFilters = aFilters[1].aFilters;
		assert.notStrictEqual(aInnerFilters, oMultiFilter.aFilters);
		assert.strictEqual(aInnerFilters.length, 3);
		assert.strictEqual(aInnerFilters[0], oSingleFilterClone);
		assert.strictEqual(aInnerFilters[1], oSingleFilter2);
		assert.strictEqual(aInnerFilters[2], oSingleFilterClone);
	});

	//*********************************************************************************************
	QUnit.test("removeAllNeutrals: single filter", function (assert) {
		let oFilter = new Filter({path: "~path", operator: "~operator", value1: "~value1"});
		this.mock(oFilter).expects("isNeutral").withExactArgs().returns(true);

		// code under test
		assert.strictEqual(oFilter.removeAllNeutrals(), undefined);

		oFilter = new Filter({path: "~path", operator: "~operator", value1: "~value1"});
		this.mock(oFilter).expects("isNeutral").withExactArgs().returns(false);

		// code under test
		assert.strictEqual(oFilter.removeAllNeutrals(), oFilter);
	});

	//*********************************************************************************************
	QUnit.test("removeAllNeutrals: multi-filter", function (assert) {
		const oFilter0 = new Filter({path: "~path", operator: "~operator", value1: "~value1"});
		const oFilter1 = new Filter({path: "~path", operator: "~operator", value1: "~value1"});
		const oMultiFilter = new Filter({filters: [oFilter0, oFilter1]});

		const oFilter0Mock = this.mock(oFilter0);
		const oFilter1Mock = this.mock(oFilter1);
		oFilter0Mock.expects("removeAllNeutrals").withExactArgs().returns(oFilter0);
		oFilter1Mock.expects("removeAllNeutrals").withExactArgs().returns(oFilter1);

		// code under test
		assert.strictEqual(oMultiFilter.removeAllNeutrals(), oMultiFilter);

		oFilter0Mock.expects("removeAllNeutrals").withExactArgs().returns(undefined);
		oFilter1Mock.expects("removeAllNeutrals").withExactArgs().returns(undefined);

		// code under test
		assert.strictEqual(oMultiFilter.removeAllNeutrals(), undefined);

		oFilter0Mock.expects("removeAllNeutrals").withExactArgs().returns(undefined);
		oFilter1Mock.expects("removeAllNeutrals").withExactArgs().returns(oFilter1);

		// code under test
		const oResultFilter = oMultiFilter.removeAllNeutrals();

		assert.strictEqual(oResultFilter.aFilters.length, 1);
		assert.strictEqual(oResultFilter.aFilters[0], oFilter1);
		assert.deepEqual(oResultFilter.isAnd(), oMultiFilter.isAnd());
	});

	//*********************************************************************************************
	QUnit.test("isNeutral", function (assert) {
		let oFilter = new Filter({path: "~path", operator: "~operator", value1: undefined});

		// code under test - oFilter.bResolved = undefined
		assert.strictEqual(oFilter.isNeutral(), false, "constant filter is always not neutral");

		oFilter = new Filter({path: "~path", operator: "~operator", value1: undefined});
		oFilter.bResolved = true;

		// code under test
		assert.strictEqual(oFilter.isNeutral(), true, "bound filter with undefined value");

		oFilter = new Filter({path: "~path", operator: "~operator", value1: null});
		oFilter.bResolved = true;

		// code under test
		assert.strictEqual(oFilter.isNeutral(), true, "bound filter with null value");

		oFilter = new Filter({path: "~path", operator: "~operator", value1: "~value"});
		oFilter.bResolved = true;

		// code under test
		assert.strictEqual(oFilter.isNeutral(), false, "bound filter with non-nullish value");

		oFilter = new Filter({path: "~path", operator: "~operator", value1: "{/path}"});
		oFilter.bResolved = false;

		// code under test
		assert.strictEqual(oFilter.isNeutral(), true, "unresolved bound filter");

		oFilter = new Filter({path: "~path", operator: "BT", value1: "~value", value2: undefined});
		oFilter.bResolved = true;

		// code under test
		assert.strictEqual(oFilter.isNeutral(), true, "BT and value2 undefined");

		oFilter = new Filter({path: "~path", operator: "NB", value1: "~value", value2: null});
		oFilter.bResolved = true;

		// code under test
		assert.strictEqual(oFilter.isNeutral(), true, "NB and value2 null");

		oFilter = new Filter({filters: [new Filter({path: "~path", operator: "~operator", value1: undefined})]});
		assert.throws(() => {
			// code under test
			oFilter.isNeutral();
		}, new Error("Multi-filter unsupported"));
	});

	//*********************************************************************************************
	QUnit.test("bBound property, setBound / isBound", function (assert) {
		const oFilter = new Filter({path : "~path", operator : "~operator", value1 : "~value1"});

		// code under test - initialize with *undefined*
		assert.strictEqual(oFilter.bBound, undefined, "bBound initially falsy");

		// code under test
		oFilter.setBound();

		assert.strictEqual(oFilter.bBound, true);

		// code under test
		assert.strictEqual(oFilter.isBound(), true);

		const oFilter2 = new Filter({path : "~path2", operator : "~operator", value1 : "~value1.2"});

		// code under test
		assert.strictEqual(oFilter2.isBound(), false);
	});
});