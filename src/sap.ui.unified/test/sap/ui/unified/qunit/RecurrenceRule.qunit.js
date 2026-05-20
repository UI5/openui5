/*global QUnit */

sap.ui.define([
	"sap/ui/unified/RecurrenceRule",
	"sap/ui/unified/MonthlyRecurrenceRule",
	"sap/ui/unified/YearlyRecurrenceRule",
	"sap/ui/unified/library"
], function(
	RecurrenceRule,
	MonthlyRecurrenceRule,
	YearlyRecurrenceRule,
	library
) {
	"use strict";

	const RecurrenceRuleType = library.RecurrenceRuleType;
	const WeekOfMonth = library.WeekOfMonth;

	QUnit.module("Defaults");

	QUnit.test("Default property values", function (assert) {
		const oRule = new RecurrenceRule();

		assert.deepEqual(oRule.getDays(), [], "days defaults to empty array");
		assert.strictEqual(oRule.getType(), RecurrenceRuleType.DayOfMonth, "type defaults to DayOfMonth");
		assert.strictEqual(oRule.getDayOfMonth(), 0, "dayOfMonth defaults to 0 (inherit from start date)");
		assert.strictEqual(oRule.getWeekOfMonth(), WeekOfMonth.First, "weekOfMonth defaults to First");
		assert.strictEqual(oRule.getDayOfWeek(), 0, "dayOfWeek defaults to 0 (Sunday)");
		assert.strictEqual(oRule.getMonth(), -1, "month defaults to -1 (inherit from start date)");

		oRule.destroy();
	});

	QUnit.module("setDays — normalization");

	QUnit.test("Sets JS-style days (0–6) unchanged", function (assert) {
		const oRule = new RecurrenceRule();
		oRule.setDays([0, 3, 6]);
		assert.deepEqual(oRule.getDays(), [0, 3, 6], "Days 0, 3, 6 remain as-is");
		oRule.destroy();
	});

	QUnit.test("Accepts a single number", function (assert) {
		const oRule = new RecurrenceRule();
		oRule.setDays(3);
		assert.deepEqual(oRule.getDays(), [3], "Single number wrapped in array");
		oRule.destroy();
	});

	QUnit.test("Removes duplicates and sorts", function (assert) {
		const oRule = new RecurrenceRule();
		oRule.setDays([5, 1, 3, 1, 5]);
		assert.deepEqual(oRule.getDays(), [1, 3, 5], "Duplicates removed, sorted");
		oRule.destroy();
	});

	QUnit.test("Handles null/undefined gracefully", function (assert) {
		const oRule = new RecurrenceRule();
		oRule.setDays(null);
		assert.deepEqual(oRule.getDays(), [], "null → empty array");
		oRule.setDays(undefined);
		assert.deepEqual(oRule.getDays(), [], "undefined → empty array");
		oRule.destroy();
	});

	QUnit.test("Ignores NaN values in array", function (assert) {
		const oRule = new RecurrenceRule();
		oRule.setDays([1, "abc", 3]);
		assert.deepEqual(oRule.getDays(), [1, 3], "NaN values filtered out");
		oRule.destroy();
	});

	QUnit.test("Returns this for chaining", function (assert) {
		const oRule = new RecurrenceRule();
		const oResult = oRule.setDays([1]);
		assert.strictEqual(oResult, oRule, "setDays returns this");
		oRule.destroy();
	});

	QUnit.module("setDayOfWeek — validation");

	QUnit.test("Accepts valid day range 0–6", function (assert) {
		const oRule = new MonthlyRecurrenceRule();
		for (let i = 0; i <= 6; i++) {
			oRule.setDayOfWeek(i);
			assert.strictEqual(oRule.getDayOfWeek(), i, `Day ${i} accepted`);
		}
		oRule.destroy();
	});

	QUnit.test("Throws on negative day", function (assert) {
		const oRule = new MonthlyRecurrenceRule();
		assert.throws(() => {
			oRule.setDayOfWeek(-1);
		}, /dayOfWeek must be between 0/, "Throws for -1");
		oRule.destroy();
	});

	QUnit.test("Throws on day > 6", function (assert) {
		const oRule = new MonthlyRecurrenceRule();
		assert.throws(() => {
			oRule.setDayOfWeek(7);
		}, /dayOfWeek must be between 0/, "Throws for 7");
		oRule.destroy();
	});

	QUnit.module("setMonth — validation");

	QUnit.test("Accepts valid month range 0–11", function (assert) {
		const oRule = new YearlyRecurrenceRule();
		for (let i = 0; i <= 11; i++) {
			oRule.setMonth(i);
			assert.strictEqual(oRule.getMonth(), i, `Month ${i} accepted`);
		}
		oRule.destroy();
	});

	QUnit.test("Throws on invalid month value", function (assert) {
		const oRule = new YearlyRecurrenceRule();
		assert.throws(() => {
			oRule.setMonth(-2);
		}, /month must be between 0 and 11/, "Throws for -2");
		assert.throws(() => {
			oRule.setMonth(12);
		}, /month must be between 0 and 11/, "Throws for 12");
		oRule.destroy();
	});

	QUnit.test("Accepts -1 as sentinel (inherit from start date)", function (assert) {
		const oRule = new YearlyRecurrenceRule();
		oRule.setMonth(5);
		assert.strictEqual(oRule.getMonth(), 5, "Month set to 5");
		oRule.setMonth(-1);
		assert.strictEqual(oRule.getMonth(), -1, "setMonth(-1) resets to inherit-from-start-date");
		oRule.destroy();
	});

	QUnit.module("Constructor settings");

	QUnit.test("All properties via constructor", function (assert) {
		const oRule = new RecurrenceRule({
			days: [1, 3, 5],
			type: RecurrenceRuleType.DayOfWeek,
			dayOfMonth: 15,
			weekOfMonth: WeekOfMonth.Last,
			dayOfWeek: 5,
			month: 11
		});

		assert.deepEqual(oRule.getDays(), [1, 3, 5], "days set via constructor");
		assert.strictEqual(oRule.getType(), RecurrenceRuleType.DayOfWeek, "type set via constructor");
		assert.strictEqual(oRule.getDayOfMonth(), 15, "dayOfMonth set via constructor");
		assert.strictEqual(oRule.getWeekOfMonth(), WeekOfMonth.Last, "weekOfMonth set via constructor");
		assert.strictEqual(oRule.getDayOfWeek(), 5, "dayOfWeek set via constructor");
		assert.strictEqual(oRule.getMonth(), 11, "month set via constructor");

		oRule.destroy();
	});
});
