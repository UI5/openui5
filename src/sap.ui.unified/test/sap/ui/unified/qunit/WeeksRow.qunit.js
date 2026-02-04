/*global QUnit */

sap.ui.define([
	"sap/ui/unified/calendar/WeeksRow",
	"sap/ui/core/date/UI5Date",
	"sap/base/i18n/date/CalendarType",
	"sap/base/i18n/Formatting",
	"sap/base/i18n/LanguageTag"
], function(WeeksRow, UI5Date, CalendarType, Formatting, LanguageTag) {
	"use strict";

	QUnit.module("WeeksRow private week number methods (en_GB locale)", {
		beforeEach: function () {
			this.oStub = this.stub(Formatting, "getLanguageTag").callsFake(function () {
				return new LanguageTag("en_GB");
			});
		},
		afterEach: function () {
			this.oStub.restore();
		}
	});

	QUnit.test("_getWeekNumbers returns correct week numbers for January 2026", function(assert) {
		const oWeeksRow = new WeeksRow({
			startDate: UI5Date.getInstance(2026, 0, 1),
			interval: 31,
			primaryCalendarType: CalendarType.Gregorian
		});
		const aWeekNumbers = oWeeksRow._getWeekNumbers();
		assert.ok(Array.isArray(aWeekNumbers), "Result is an array");
		assert.ok(aWeekNumbers.length > 0, "There are week numbers returned");
		aWeekNumbers.forEach(function(oWeek) {
			assert.ok(typeof oWeek.number === "number", "Week number is a number");
			assert.ok(typeof oWeek.len === "number", "Week length is a number");
			assert.ok(oWeek.len > 0, "Week length is positive");
		});
		oWeeksRow.destroy();
	});

	QUnit.test("_getWeekNumbers returns expected week numbers for Jan 1-10, 2026", function(assert) {
		const oWeeksRow = new WeeksRow({
			startDate: UI5Date.getInstance(2026, 0, 1),
			interval: 10,
			primaryCalendarType: CalendarType.Gregorian
		});
		const aWeekNumbers = oWeeksRow._getWeekNumbers();
		assert.deepEqual(aWeekNumbers, [
			{ number: 1, len: 4 },
			{ number: 2, len: 6 }
		], "Week numbers and lengths are correct for Jan 1-10, 2026");
		oWeeksRow.destroy();
	});

	QUnit.test("_getMonthsFirstAndLastWeekNumbers returns correct mapping for 3 months", function(assert) {
		const oWeeksRow = new WeeksRow({
			startDate: UI5Date.getInstance(2026, 0, 1),
			interval: 3,
			primaryCalendarType: CalendarType.Gregorian
		});
		const oMonthWeeks = oWeeksRow._getMonthsFirstAndLastWeekNumbers();
		assert.ok(typeof oMonthWeeks === "object", "Result is an object");
		assert.strictEqual(Object.keys(oMonthWeeks).length, 3, "There are 3 months in the mapping");
		Object.keys(oMonthWeeks).forEach(function(idx) {
			const o = oMonthWeeks[idx];
			assert.ok(typeof o.first === "number", "First week number is a number");
			assert.ok(typeof o.last === "number", "Last week number is a number");
		});
		oWeeksRow.destroy();
	});

	QUnit.test("_getMonthsFirstAndLastWeekNumbers returns expected mapping for Jan, Feb, Mar 2026", function(assert) {
		const oWeeksRow = new WeeksRow({
			startDate: UI5Date.getInstance(2026, 0, 1),
			interval: 3,
			primaryCalendarType: CalendarType.Gregorian
		});
		const oMonthWeeks = oWeeksRow._getMonthsFirstAndLastWeekNumbers();
		assert.deepEqual(oMonthWeeks, {
			0: { first: 1, last: 5 },
			1: { first: 5, last: 9 },
			2: { first: 9, last: 14 }
		}, "Month to week mapping is correct for Jan, Feb, Mar 2026");
		oWeeksRow.destroy();
	});

	QUnit.test("_getWeekNumbers returns empty array for zero interval", function(assert) {
		const oWeeksRow = new WeeksRow({
			startDate: UI5Date.getInstance(2026, 0, 1),
			interval: 0,
			primaryCalendarType: CalendarType.Gregorian
		});
		const aWeekNumbers = oWeeksRow._getWeekNumbers();
		assert.deepEqual(aWeekNumbers, [], "Returns empty array for zero interval");
		oWeeksRow.destroy();
	});

	QUnit.test("_getMonthsFirstAndLastWeekNumbers returns empty object for zero interval", function(assert) {
		const oWeeksRow = new WeeksRow({
			startDate: UI5Date.getInstance(2026, 0, 1),
			interval: 0,
			primaryCalendarType: CalendarType.Gregorian
		});
		const oMonthWeeks = oWeeksRow._getMonthsFirstAndLastWeekNumbers();
		assert.deepEqual(oMonthWeeks, {}, "Returns empty object for zero interval");
		oWeeksRow.destroy();
	});
});
