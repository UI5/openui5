/* global QUnit */
sap.ui.define([
	"sap/ui/support/supportRules/util/EvalUtils"
], function (EvalUtils) {
	"use strict";

	QUnit.module("EvalUtils.js methods");

	QUnit.test("#evalFunction when syntax is correct", function (assert) {
		if (!EvalUtils.isEvalAllowed()) {
			assert.ok(true, "Skipped: Function constructor is blocked by CSP");
			return;
		}

		// act
		const fn = EvalUtils.evalFunction("function () { return 42; }");

		// assert
		assert.strictEqual(typeof fn, "function", "Should return a function");
		assert.strictEqual(fn(), 42, "Returned function should be callable");
	});

	QUnit.test("#evalFunction with parameters", function (assert) {
		if (!EvalUtils.isEvalAllowed()) {
			assert.ok(true, "Skipped: Function constructor is blocked by CSP");
			return;
		}

		// act
		const fn = EvalUtils.evalFunction("function (a, b) { return a + b; }");

		// assert
		assert.strictEqual(fn(2, 3), 5, "Should correctly handle function parameters");
	});

	QUnit.test("#evalFunction when syntax is incorrect", function (assert) {
		if (!EvalUtils.isEvalAllowed()) {
			assert.ok(true, "Skipped: Function constructor is blocked by CSP");
			return;
		}

		// assert
		assert.throws(function () {
			EvalUtils.evalFunction("some invalid function () {}");
		}, "Error should be thrown when function syntax is incorrect");
	});
});
