/*global QUnit */

sap.ui.define([
	"sap/ui/unified/RecurringCalendarAppointment",
	"sap/ui/unified/RecurrenceRule",
	"sap/ui/unified/library",
	"sap/ui/core/date/UI5Date"
], function(
	RecurringCalendarAppointment,
	RecurrenceRule,
	library,
	UI5Date
) {
	"use strict";

	const RecurrenceType = library.RecurrenceType;

	QUnit.module("Defaults");

	QUnit.test("Default property values", function (assert) {
		const oApp = new RecurringCalendarAppointment();

		assert.strictEqual(oApp.getRecurrenceType(), undefined, "recurrenceType defaults to undefined");
		assert.strictEqual(oApp.getRecurrenceEndDate(), undefined, "recurrenceEndDate defaults to undefined");
		assert.strictEqual(oApp.getRecurrencePattern(), 1, "recurrencePattern defaults to 1");
		assert.strictEqual(oApp.getRecurrenceRule(), null, "recurrenceRule aggregation defaults to null");

		oApp.destroy();
	});

	QUnit.module("isRecurring");

	QUnit.test("Returns false when no recurrenceType is set", function (assert) {
		const oApp = new RecurringCalendarAppointment();
		assert.notOk(oApp.isRecurring(), "Not recurring without recurrenceType");
		oApp.destroy();
	});

	QUnit.test("Returns true when recurrenceType is set", function (assert) {
		const oApp = new RecurringCalendarAppointment({
			recurrenceType: RecurrenceType.Daily,
			startDate: UI5Date.getInstance(2025, 0, 1, 9, 0),
			endDate: UI5Date.getInstance(2025, 0, 1, 10, 0)
		});
		assert.ok(oApp.isRecurring(), "Recurring with Daily type");
		oApp.destroy();
	});

	QUnit.module("getDuration");

	QUnit.test("Returns duration in milliseconds", function (assert) {
		const oApp = new RecurringCalendarAppointment({
			startDate: UI5Date.getInstance(2025, 0, 1, 9, 0),
			endDate: UI5Date.getInstance(2025, 0, 1, 10, 30)
		});

		// 1.5 hours = 90 minutes = 5400000 ms
		assert.strictEqual(oApp.getDuration(), 5400000, "Duration is 90 minutes in ms");
		oApp.destroy();
	});

	QUnit.module("getStartAndEndDate");

	QUnit.test("Projects appointment time onto a given date", function (assert) {
		const oApp = new RecurringCalendarAppointment({
			startDate: UI5Date.getInstance(2025, 0, 1, 9, 30),
			endDate: UI5Date.getInstance(2025, 0, 1, 11, 0)
		});

		const oTargetDate = UI5Date.getInstance(2025, 5, 15); // June 15
		const oResult = oApp.getStartAndEndDate(oTargetDate);

		assert.strictEqual(oResult.startDate.getFullYear(), 2025, "Year is 2025");
		assert.strictEqual(oResult.startDate.getMonth(), 5, "Month is June");
		assert.strictEqual(oResult.startDate.getDate(), 15, "Day is 15");
		assert.strictEqual(oResult.startDate.getHours(), 9, "Start hour is 9");
		assert.strictEqual(oResult.startDate.getMinutes(), 30, "Start minute is 30");

		assert.strictEqual(oResult.endDate.getHours(), 11, "End hour is 11");
		assert.strictEqual(oResult.endDate.getMinutes(), 0, "End minute is 0");

		oApp.destroy();
	});

	QUnit.module("hasAppointmentAtDate — Daily");

	QUnit.test("Daily recurrence matches every day", function (assert) {
		const oApp = new RecurringCalendarAppointment({
			recurrenceType: RecurrenceType.Daily,
			recurrencePattern: 1,
			startDate: UI5Date.getInstance(2025, 0, 1, 9, 0),
			endDate: UI5Date.getInstance(2025, 0, 1, 10, 0)
		});

		assert.ok(oApp.hasAppointmentAtDate(UI5Date.getInstance(2025, 0, 1)), "Matches start date");
		assert.ok(oApp.hasAppointmentAtDate(UI5Date.getInstance(2025, 0, 2)), "Matches next day");
		assert.ok(oApp.hasAppointmentAtDate(UI5Date.getInstance(2025, 0, 10)), "Matches 10 days later");
		assert.notOk(oApp.hasAppointmentAtDate(UI5Date.getInstance(2024, 11, 31)), "Does not match before start");

		oApp.destroy();
	});

	QUnit.test("Daily recurrence with pattern 3 (every 3 days)", function (assert) {
		const oApp = new RecurringCalendarAppointment({
			recurrenceType: RecurrenceType.Daily,
			recurrencePattern: 3,
			startDate: UI5Date.getInstance(2025, 0, 1, 9, 0),
			endDate: UI5Date.getInstance(2025, 0, 1, 10, 0)
		});

		assert.ok(oApp.hasAppointmentAtDate(UI5Date.getInstance(2025, 0, 1)), "Day 0 matches");
		assert.notOk(oApp.hasAppointmentAtDate(UI5Date.getInstance(2025, 0, 2)), "Day 1 no match");
		assert.notOk(oApp.hasAppointmentAtDate(UI5Date.getInstance(2025, 0, 3)), "Day 2 no match");
		assert.ok(oApp.hasAppointmentAtDate(UI5Date.getInstance(2025, 0, 4)), "Day 3 matches");
		assert.ok(oApp.hasAppointmentAtDate(UI5Date.getInstance(2025, 0, 7)), "Day 6 matches");

		oApp.destroy();
	});

	QUnit.test("Daily recurrence respects recurrenceEndDate", function (assert) {
		const oApp = new RecurringCalendarAppointment({
			recurrenceType: RecurrenceType.Daily,
			recurrencePattern: 1,
			recurrenceEndDate: UI5Date.getInstance(2025, 0, 5),
			startDate: UI5Date.getInstance(2025, 0, 1, 9, 0),
			endDate: UI5Date.getInstance(2025, 0, 1, 10, 0)
		});

		assert.ok(oApp.hasAppointmentAtDate(UI5Date.getInstance(2025, 0, 5)), "Matches end date");
		assert.notOk(oApp.hasAppointmentAtDate(UI5Date.getInstance(2025, 0, 6)), "Does not match after end date");

		oApp.destroy();
	});

	QUnit.module("hasAppointmentAtDate — Weekly");

	QUnit.test("Weekly recurrence without specific days matches same day of week", function (assert) {
		// Jan 1, 2025 is Wednesday (day 3)
		const oApp = new RecurringCalendarAppointment({
			recurrenceType: RecurrenceType.Weekly,
			recurrencePattern: 1,
			startDate: UI5Date.getInstance(2025, 0, 1, 9, 0),
			endDate: UI5Date.getInstance(2025, 0, 1, 10, 0)
		});

		assert.ok(oApp.hasAppointmentAtDate(UI5Date.getInstance(2025, 0, 1)), "Matches start date (Wed)");
		assert.ok(oApp.hasAppointmentAtDate(UI5Date.getInstance(2025, 0, 8)), "Matches next Wednesday");
		assert.notOk(oApp.hasAppointmentAtDate(UI5Date.getInstance(2025, 0, 2)), "Does not match Thursday");

		oApp.destroy();
	});

	QUnit.test("Weekly recurrence with specific days", function (assert) {
		// Mon=1, Wed=3, Fri=5
		const oApp = new RecurringCalendarAppointment({
			recurrenceType: RecurrenceType.Weekly,
			recurrencePattern: 1,
			startDate: UI5Date.getInstance(2025, 0, 6, 9, 0), // Monday Jan 6
			endDate: UI5Date.getInstance(2025, 0, 6, 10, 0),
			recurrenceRule: new RecurrenceRule({
				days: [1, 3, 5]
			})
		});

		assert.ok(oApp.hasAppointmentAtDate(UI5Date.getInstance(2025, 0, 6)), "Mon Jan 6 matches");
		assert.notOk(oApp.hasAppointmentAtDate(UI5Date.getInstance(2025, 0, 7)), "Tue Jan 7 no match");
		assert.ok(oApp.hasAppointmentAtDate(UI5Date.getInstance(2025, 0, 8)), "Wed Jan 8 matches");
		assert.notOk(oApp.hasAppointmentAtDate(UI5Date.getInstance(2025, 0, 9)), "Thu Jan 9 no match");
		assert.ok(oApp.hasAppointmentAtDate(UI5Date.getInstance(2025, 0, 10)), "Fri Jan 10 matches");

		oApp.destroy();
	});

	QUnit.test("Bi-weekly recurrence", function (assert) {
		const oApp = new RecurringCalendarAppointment({
			recurrenceType: RecurrenceType.Weekly,
			recurrencePattern: 2,
			startDate: UI5Date.getInstance(2025, 0, 6, 9, 0), // Monday Jan 6
			endDate: UI5Date.getInstance(2025, 0, 6, 10, 0)
		});

		assert.ok(oApp.hasAppointmentAtDate(UI5Date.getInstance(2025, 0, 6)), "Week 0 matches");
		assert.notOk(oApp.hasAppointmentAtDate(UI5Date.getInstance(2025, 0, 13)), "Week 1 no match");
		assert.ok(oApp.hasAppointmentAtDate(UI5Date.getInstance(2025, 0, 20)), "Week 2 matches");

		oApp.destroy();
	});

	QUnit.module("hasAppointmentAtDate — Monthly");

	QUnit.test("Monthly simple — same day of month from startDate", function (assert) {
		const oApp = new RecurringCalendarAppointment({
			recurrenceType: RecurrenceType.Monthly,
			recurrencePattern: 1,
			startDate: UI5Date.getInstance(2025, 0, 15, 9, 0), // Jan 15
			endDate: UI5Date.getInstance(2025, 0, 15, 10, 0)
		});

		assert.ok(oApp.hasAppointmentAtDate(UI5Date.getInstance(2025, 0, 15)), "Jan 15 matches");
		assert.ok(oApp.hasAppointmentAtDate(UI5Date.getInstance(2025, 1, 15)), "Feb 15 matches");
		assert.ok(oApp.hasAppointmentAtDate(UI5Date.getInstance(2025, 2, 15)), "Mar 15 matches");
		assert.notOk(oApp.hasAppointmentAtDate(UI5Date.getInstance(2025, 1, 14)), "Feb 14 no match");
		assert.notOk(oApp.hasAppointmentAtDate(UI5Date.getInstance(2025, 1, 16)), "Feb 16 no match");

		oApp.destroy();
	});

	QUnit.test("Monthly with DayOfMonth rule — explicit day", function (assert) {
		const oApp = new RecurringCalendarAppointment({
			recurrenceType: RecurrenceType.Monthly,
			recurrencePattern: 1,
			startDate: UI5Date.getInstance(2025, 0, 1, 9, 0),
			endDate: UI5Date.getInstance(2025, 0, 1, 10, 0),
			recurrenceRule: new RecurrenceRule({
				type: "DayOfMonth",
				dayOfMonth: 20
			})
		});

		assert.ok(oApp.hasAppointmentAtDate(UI5Date.getInstance(2025, 0, 20)), "Jan 20 matches");
		assert.ok(oApp.hasAppointmentAtDate(UI5Date.getInstance(2025, 1, 20)), "Feb 20 matches");
		assert.notOk(oApp.hasAppointmentAtDate(UI5Date.getInstance(2025, 0, 1)), "Jan 1 (start date) no match");
		assert.notOk(oApp.hasAppointmentAtDate(UI5Date.getInstance(2025, 0, 19)), "Jan 19 no match");

		oApp.destroy();
	});

	QUnit.test("Monthly with DayOfMonth rule — dayOfMonth=0 falls back to startDate", function (assert) {
		const oApp = new RecurringCalendarAppointment({
			recurrenceType: RecurrenceType.Monthly,
			recurrencePattern: 1,
			startDate: UI5Date.getInstance(2025, 0, 10, 9, 0),
			endDate: UI5Date.getInstance(2025, 0, 10, 10, 0),
			recurrenceRule: new RecurrenceRule({
				type: "DayOfMonth",
				dayOfMonth: 0
			})
		});

		assert.ok(oApp.hasAppointmentAtDate(UI5Date.getInstance(2025, 0, 10)), "Jan 10 matches (fallback to startDate day)");
		assert.ok(oApp.hasAppointmentAtDate(UI5Date.getInstance(2025, 1, 10)), "Feb 10 matches");
		assert.notOk(oApp.hasAppointmentAtDate(UI5Date.getInstance(2025, 0, 20)), "Jan 20 no match");

		oApp.destroy();
	});

	QUnit.test("Monthly with DayOfWeek rule — second Tuesday", function (assert) {
		const oApp = new RecurringCalendarAppointment({
			recurrenceType: RecurrenceType.Monthly,
			recurrencePattern: 1,
			startDate: UI5Date.getInstance(2025, 0, 1, 9, 0),
			endDate: UI5Date.getInstance(2025, 0, 1, 10, 0),
			recurrenceRule: new RecurrenceRule({
				type: "DayOfWeek",
				weekOfMonth: "Second",
				dayOfWeek: 2 // Tuesday
			})
		});

		// Second Tuesday of Jan 2025 = Jan 14
		assert.ok(oApp.hasAppointmentAtDate(UI5Date.getInstance(2025, 0, 14)), "Jan 14 is 2nd Tuesday — matches");
		assert.notOk(oApp.hasAppointmentAtDate(UI5Date.getInstance(2025, 0, 7)), "Jan 7 is 1st Tuesday — no match");
		assert.notOk(oApp.hasAppointmentAtDate(UI5Date.getInstance(2025, 0, 21)), "Jan 21 is 3rd Tuesday — no match");

		// Second Tuesday of Feb 2025 = Feb 11
		assert.ok(oApp.hasAppointmentAtDate(UI5Date.getInstance(2025, 1, 11)), "Feb 11 is 2nd Tuesday — matches");

		oApp.destroy();
	});

	QUnit.test("Monthly with DayOfWeek rule — last Friday", function (assert) {
		const oApp = new RecurringCalendarAppointment({
			recurrenceType: RecurrenceType.Monthly,
			recurrencePattern: 1,
			startDate: UI5Date.getInstance(2025, 0, 1, 9, 0),
			endDate: UI5Date.getInstance(2025, 0, 1, 10, 0),
			recurrenceRule: new RecurrenceRule({
				type: "DayOfWeek",
				weekOfMonth: "Last",
				dayOfWeek: 5 // Friday
			})
		});

		// Last Friday of Jan 2025 = Jan 31
		assert.ok(oApp.hasAppointmentAtDate(UI5Date.getInstance(2025, 0, 31)), "Jan 31 is last Friday — matches");
		assert.notOk(oApp.hasAppointmentAtDate(UI5Date.getInstance(2025, 0, 24)), "Jan 24 is not last Friday — no match");

		// Last Friday of Feb 2025 = Feb 28
		assert.ok(oApp.hasAppointmentAtDate(UI5Date.getInstance(2025, 1, 28)), "Feb 28 is last Friday — matches");

		oApp.destroy();
	});

	QUnit.test("Monthly with pattern 2 (every other month)", function (assert) {
		const oApp = new RecurringCalendarAppointment({
			recurrenceType: RecurrenceType.Monthly,
			recurrencePattern: 2,
			startDate: UI5Date.getInstance(2025, 0, 15, 9, 0), // Jan 15
			endDate: UI5Date.getInstance(2025, 0, 15, 10, 0)
		});

		assert.ok(oApp.hasAppointmentAtDate(UI5Date.getInstance(2025, 0, 15)), "Jan matches (month 0)");
		assert.notOk(oApp.hasAppointmentAtDate(UI5Date.getInstance(2025, 1, 15)), "Feb no match (month 1)");
		assert.ok(oApp.hasAppointmentAtDate(UI5Date.getInstance(2025, 2, 15)), "Mar matches (month 2)");
		assert.notOk(oApp.hasAppointmentAtDate(UI5Date.getInstance(2025, 3, 15)), "Apr no match (month 3)");

		oApp.destroy();
	});

	QUnit.module("hasAppointmentAtDate — Yearly");

	QUnit.test("Yearly simple — same month and day", function (assert) {
		const oApp = new RecurringCalendarAppointment({
			recurrenceType: RecurrenceType.Yearly,
			recurrencePattern: 1,
			startDate: UI5Date.getInstance(2025, 2, 20, 9, 0), // Mar 20
			endDate: UI5Date.getInstance(2025, 2, 20, 10, 0)
		});

		assert.ok(oApp.hasAppointmentAtDate(UI5Date.getInstance(2025, 2, 20)), "2025 Mar 20 matches");
		assert.ok(oApp.hasAppointmentAtDate(UI5Date.getInstance(2026, 2, 20)), "2026 Mar 20 matches");
		assert.notOk(oApp.hasAppointmentAtDate(UI5Date.getInstance(2025, 2, 21)), "Wrong day no match");
		assert.notOk(oApp.hasAppointmentAtDate(UI5Date.getInstance(2025, 3, 20)), "Wrong month no match");

		oApp.destroy();
	});

	QUnit.test("Yearly with DayOfMonth rule — specific day in specific month", function (assert) {
		const oApp = new RecurringCalendarAppointment({
			recurrenceType: RecurrenceType.Yearly,
			recurrencePattern: 1,
			startDate: UI5Date.getInstance(2025, 0, 1, 9, 0),
			endDate: UI5Date.getInstance(2025, 0, 1, 10, 0),
			recurrenceRule: new RecurrenceRule({
				type: "DayOfMonth",
				dayOfMonth: 25,
				month: 11 // December
			})
		});

		assert.ok(oApp.hasAppointmentAtDate(UI5Date.getInstance(2025, 11, 25)), "Dec 25 2025 matches");
		assert.ok(oApp.hasAppointmentAtDate(UI5Date.getInstance(2026, 11, 25)), "Dec 25 2026 matches");
		assert.notOk(oApp.hasAppointmentAtDate(UI5Date.getInstance(2025, 11, 24)), "Dec 24 no match");
		assert.notOk(oApp.hasAppointmentAtDate(UI5Date.getInstance(2025, 0, 25)), "Jan 25 wrong month no match");

		oApp.destroy();
	});

	QUnit.test("Yearly with DayOfWeek rule — last Friday of December", function (assert) {
		const oApp = new RecurringCalendarAppointment({
			recurrenceType: RecurrenceType.Yearly,
			recurrencePattern: 1,
			startDate: UI5Date.getInstance(2025, 0, 1, 9, 0),
			endDate: UI5Date.getInstance(2025, 0, 1, 10, 0),
			recurrenceRule: new RecurrenceRule({
				type: "DayOfWeek",
				weekOfMonth: "Last",
				dayOfWeek: 5, // Friday
				month: 11 // December
			})
		});

		// Last Friday of Dec 2025 = Dec 26
		assert.ok(oApp.hasAppointmentAtDate(UI5Date.getInstance(2025, 11, 26)), "Dec 26 2025 is last Friday — matches");
		assert.notOk(oApp.hasAppointmentAtDate(UI5Date.getInstance(2025, 11, 19)), "Dec 19 is not last Friday — no match");
		assert.notOk(oApp.hasAppointmentAtDate(UI5Date.getInstance(2025, 10, 28)), "Nov 28 wrong month — no match");

		// Last Friday of Dec 2026 = Dec 25
		assert.ok(oApp.hasAppointmentAtDate(UI5Date.getInstance(2026, 11, 25)), "Dec 25 2026 is last Friday — matches");

		oApp.destroy();
	});

	QUnit.test("Yearly with pattern 2 (every other year)", function (assert) {
		const oApp = new RecurringCalendarAppointment({
			recurrenceType: RecurrenceType.Yearly,
			recurrencePattern: 2,
			startDate: UI5Date.getInstance(2025, 5, 1, 9, 0),
			endDate: UI5Date.getInstance(2025, 5, 1, 10, 0)
		});

		assert.ok(oApp.hasAppointmentAtDate(UI5Date.getInstance(2025, 5, 1)), "2025 matches");
		assert.notOk(oApp.hasAppointmentAtDate(UI5Date.getInstance(2026, 5, 1)), "2026 no match");
		assert.ok(oApp.hasAppointmentAtDate(UI5Date.getInstance(2027, 5, 1)), "2027 matches");

		oApp.destroy();
	});

	QUnit.module("RecurrenceRule aggregation");

	QUnit.test("Set and get recurrenceRule", function (assert) {
		const oRule = new RecurrenceRule({
			days: [1, 3, 5]
		});
		const oApp = new RecurringCalendarAppointment({
			recurrenceRule: oRule
		});

		assert.strictEqual(oApp.getRecurrenceRule(), oRule, "RecurrenceRule aggregation is set");
		assert.deepEqual(oApp.getRecurrenceRule().getDays(), [1, 3, 5], "Rule properties accessible");

		oApp.destroy();
	});

	QUnit.module("Caching");

	QUnit.test("hasOccurrenceOnDateCached returns same result and uses cache", function (assert) {
		const oApp = new RecurringCalendarAppointment({
			recurrenceType: RecurrenceType.Daily,
			recurrencePattern: 1,
			startDate: UI5Date.getInstance(2025, 0, 1, 9, 0),
			endDate: UI5Date.getInstance(2025, 0, 1, 10, 0)
		});

		const oDate = UI5Date.getInstance(2025, 0, 5);
		const bResult1 = oApp.hasOccurrenceOnDateCached(oDate);
		const bResult2 = oApp.hasOccurrenceOnDateCached(oDate);

		assert.ok(bResult1, "First call returns true");
		assert.strictEqual(bResult1, bResult2, "Second call returns same cached result");

		oApp.destroy();
	});

	QUnit.test("setRecurrenceType invalidates cache", function (assert) {
		const oApp = new RecurringCalendarAppointment({
			recurrenceType: RecurrenceType.Daily,
			recurrencePattern: 1,
			startDate: UI5Date.getInstance(2025, 0, 1, 9, 0),
			endDate: UI5Date.getInstance(2025, 0, 1, 10, 0)
		});

		oApp.hasOccurrenceOnDateCached(UI5Date.getInstance(2025, 0, 5));
		assert.ok(oApp._occurrenceCache.size > 0, "Cache has entries");

		oApp.setRecurrenceType(RecurrenceType.Weekly);
		assert.strictEqual(oApp._occurrenceCache.size, 0, "Cache cleared after setRecurrenceType");

		oApp.destroy();
	});

	QUnit.test("setRecurrencePattern invalidates cache", function (assert) {
		const oApp = new RecurringCalendarAppointment({
			recurrenceType: RecurrenceType.Daily,
			recurrencePattern: 1,
			startDate: UI5Date.getInstance(2025, 0, 1, 9, 0),
			endDate: UI5Date.getInstance(2025, 0, 1, 10, 0)
		});

		oApp.hasOccurrenceOnDateCached(UI5Date.getInstance(2025, 0, 5));
		assert.ok(oApp._occurrenceCache.size > 0, "Cache has entries");

		oApp.setRecurrencePattern(3);
		assert.strictEqual(oApp._occurrenceCache.size, 0, "Cache cleared after setRecurrencePattern");

		oApp.destroy();
	});

	QUnit.test("getCachedOccurrences / setCachedOccurrences round-trip", function (assert) {
		const oApp = new RecurringCalendarAppointment({
			recurrenceType: RecurrenceType.Daily,
			startDate: UI5Date.getInstance(2025, 0, 1, 9, 0),
			endDate: UI5Date.getInstance(2025, 0, 1, 10, 0)
		});

		const oRangeStart = UI5Date.getInstance(2025, 0, 1);
		const oRangeEnd = UI5Date.getInstance(2025, 0, 7);
		const aMockOccurrences = ["a", "b"];

		assert.strictEqual(oApp.getCachedOccurrences(oRangeStart, oRangeEnd), null, "No cached occurrences initially");

		oApp.setCachedOccurrences(oRangeStart, oRangeEnd, aMockOccurrences);
		assert.deepEqual(oApp.getCachedOccurrences(oRangeStart, oRangeEnd), aMockOccurrences, "Cached occurrences retrieved");

		oApp.destroy();
	});

	QUnit.test("setRecurrenceType clears range cache", function (assert) {
		const oApp = new RecurringCalendarAppointment({
			recurrenceType: RecurrenceType.Daily,
			recurrencePattern: 1,
			startDate: UI5Date.getInstance(2025, 0, 1, 9, 0),
			endDate: UI5Date.getInstance(2025, 0, 1, 10, 0)
		});

		oApp.setCachedOccurrences(
			UI5Date.getInstance(2025, 0, 1),
			UI5Date.getInstance(2025, 0, 7),
			["x"]
		);
		assert.ok(oApp._rangeCache && oApp._rangeCache.size > 0, "Range cache has entries");

		oApp.setRecurrenceType(RecurrenceType.Weekly);
		assert.strictEqual(oApp._rangeCache.size, 0, "Range cache cleared after setRecurrenceType");

		oApp.destroy();
	});

	QUnit.test("Different date ranges produce separate cache entries", function (assert) {
		const oApp = new RecurringCalendarAppointment({
			recurrenceType: RecurrenceType.Daily,
			startDate: UI5Date.getInstance(2025, 0, 1, 9, 0),
			endDate: UI5Date.getInstance(2025, 0, 1, 10, 0)
		});

		const oStart1 = UI5Date.getInstance(2025, 0, 1);
		const oEnd1 = UI5Date.getInstance(2025, 0, 7);
		const oStart2 = UI5Date.getInstance(2025, 1, 1);
		const oEnd2 = UI5Date.getInstance(2025, 1, 7);

		oApp.setCachedOccurrences(oStart1, oEnd1, ["week1"]);
		oApp.setCachedOccurrences(oStart2, oEnd2, ["week2"]);

		assert.deepEqual(oApp.getCachedOccurrences(oStart1, oEnd1), ["week1"], "First range returns own cache");
		assert.deepEqual(oApp.getCachedOccurrences(oStart2, oEnd2), ["week2"], "Second range returns own cache");

		oApp.destroy();
	});

	QUnit.module("Single-day recurrence (start == end == 16.03.2026)");

	QUnit.test("Daily recurrence ending same day — only matches that date", function (assert) {
		const oApp = new RecurringCalendarAppointment({
			recurrenceType: RecurrenceType.Daily,
			recurrencePattern: 1,
			recurrenceEndDate: UI5Date.getInstance(2026, 2, 16),
			startDate: UI5Date.getInstance(2026, 2, 16, 10, 0),
			endDate: UI5Date.getInstance(2026, 2, 16, 10, 15)
		});

		assert.ok(oApp.hasAppointmentAtDate(UI5Date.getInstance(2026, 2, 16)), "Mar 16 matches");
		assert.notOk(oApp.hasAppointmentAtDate(UI5Date.getInstance(2026, 2, 15)), "Mar 15 (day before) no match");
		assert.notOk(oApp.hasAppointmentAtDate(UI5Date.getInstance(2026, 2, 17)), "Mar 17 (day after) no match");

		oApp.destroy();
	});

	QUnit.test("Weekly recurrence ending same day — only matches that date", function (assert) {
		const oApp = new RecurringCalendarAppointment({
			recurrenceType: RecurrenceType.Weekly,
			recurrencePattern: 1,
			recurrenceEndDate: UI5Date.getInstance(2026, 2, 16),
			startDate: UI5Date.getInstance(2026, 2, 16, 10, 0), // Monday
			endDate: UI5Date.getInstance(2026, 2, 16, 10, 15)
		});

		assert.ok(oApp.hasAppointmentAtDate(UI5Date.getInstance(2026, 2, 16)), "Mar 16 matches");
		assert.notOk(oApp.hasAppointmentAtDate(UI5Date.getInstance(2026, 2, 23)), "Next Monday blocked by endDate");
		assert.notOk(oApp.hasAppointmentAtDate(UI5Date.getInstance(2026, 2, 9)), "Previous Monday before start");

		oApp.destroy();
	});

	QUnit.test("Weekly recurrence with days ending same day — only matches that date", function (assert) {
		// Mar 16, 2026 = Monday (day 1)
		const oApp = new RecurringCalendarAppointment({
			recurrenceType: RecurrenceType.Weekly,
			recurrencePattern: 1,
			recurrenceEndDate: UI5Date.getInstance(2026, 2, 16),
			startDate: UI5Date.getInstance(2026, 2, 16, 10, 0),
			endDate: UI5Date.getInstance(2026, 2, 16, 10, 15),
			recurrenceRule: new RecurrenceRule({ days: [1, 3, 5] }) // Mon, Wed, Fri
		});

		assert.ok(oApp.hasAppointmentAtDate(UI5Date.getInstance(2026, 2, 16)), "Monday Mar 16 matches");
		assert.notOk(oApp.hasAppointmentAtDate(UI5Date.getInstance(2026, 2, 18)), "Wed Mar 18 blocked by endDate");
		assert.notOk(oApp.hasAppointmentAtDate(UI5Date.getInstance(2026, 2, 20)), "Fri Mar 20 blocked by endDate");

		oApp.destroy();
	});

	QUnit.test("Monthly recurrence ending same day — only matches that date", function (assert) {
		const oApp = new RecurringCalendarAppointment({
			recurrenceType: RecurrenceType.Monthly,
			recurrencePattern: 1,
			recurrenceEndDate: UI5Date.getInstance(2026, 2, 16),
			startDate: UI5Date.getInstance(2026, 2, 16, 10, 0),
			endDate: UI5Date.getInstance(2026, 2, 16, 10, 15)
		});

		assert.ok(oApp.hasAppointmentAtDate(UI5Date.getInstance(2026, 2, 16)), "Mar 16 matches");
		assert.notOk(oApp.hasAppointmentAtDate(UI5Date.getInstance(2026, 3, 16)), "Apr 16 blocked by endDate");
		assert.notOk(oApp.hasAppointmentAtDate(UI5Date.getInstance(2026, 1, 16)), "Feb 16 before start");

		oApp.destroy();
	});

	QUnit.test("Monthly DayOfMonth recurrence ending same day — only matches that date", function (assert) {
		const oApp = new RecurringCalendarAppointment({
			recurrenceType: RecurrenceType.Monthly,
			recurrencePattern: 1,
			recurrenceEndDate: UI5Date.getInstance(2026, 2, 16),
			startDate: UI5Date.getInstance(2026, 2, 16, 10, 0),
			endDate: UI5Date.getInstance(2026, 2, 16, 10, 15),
			recurrenceRule: new RecurrenceRule({ type: "DayOfMonth", dayOfMonth: 16 })
		});

		assert.ok(oApp.hasAppointmentAtDate(UI5Date.getInstance(2026, 2, 16)), "Mar 16 matches");
		assert.notOk(oApp.hasAppointmentAtDate(UI5Date.getInstance(2026, 3, 16)), "Apr 16 blocked by endDate");

		oApp.destroy();
	});

	QUnit.test("Monthly DayOfWeek recurrence ending same day — only matches that date", function (assert) {
		// Mar 16, 2026 = 3rd Monday of March
		const oApp = new RecurringCalendarAppointment({
			recurrenceType: RecurrenceType.Monthly,
			recurrencePattern: 1,
			recurrenceEndDate: UI5Date.getInstance(2026, 2, 16),
			startDate: UI5Date.getInstance(2026, 2, 16, 10, 0),
			endDate: UI5Date.getInstance(2026, 2, 16, 10, 15),
			recurrenceRule: new RecurrenceRule({ type: "DayOfWeek", weekOfMonth: "Third", dayOfWeek: 1 })
		});

		assert.ok(oApp.hasAppointmentAtDate(UI5Date.getInstance(2026, 2, 16)), "3rd Monday Mar 16 matches");
		assert.notOk(oApp.hasAppointmentAtDate(UI5Date.getInstance(2026, 3, 20)), "3rd Monday Apr 20 blocked by endDate");

		oApp.destroy();
	});

	QUnit.test("Yearly recurrence ending same day — only matches that date", function (assert) {
		const oApp = new RecurringCalendarAppointment({
			recurrenceType: RecurrenceType.Yearly,
			recurrencePattern: 1,
			recurrenceEndDate: UI5Date.getInstance(2026, 2, 16),
			startDate: UI5Date.getInstance(2026, 2, 16, 10, 0),
			endDate: UI5Date.getInstance(2026, 2, 16, 10, 15)
		});

		assert.ok(oApp.hasAppointmentAtDate(UI5Date.getInstance(2026, 2, 16)), "Mar 16 2026 matches");
		assert.notOk(oApp.hasAppointmentAtDate(UI5Date.getInstance(2027, 2, 16)), "Mar 16 2027 blocked by endDate");
		assert.notOk(oApp.hasAppointmentAtDate(UI5Date.getInstance(2025, 2, 16)), "Mar 16 2025 before start");

		oApp.destroy();
	});

	QUnit.test("Yearly DayOfMonth recurrence ending same day — only matches that date", function (assert) {
		const oApp = new RecurringCalendarAppointment({
			recurrenceType: RecurrenceType.Yearly,
			recurrencePattern: 1,
			recurrenceEndDate: UI5Date.getInstance(2026, 2, 16),
			startDate: UI5Date.getInstance(2026, 2, 16, 10, 0),
			endDate: UI5Date.getInstance(2026, 2, 16, 10, 15),
			recurrenceRule: new RecurrenceRule({ type: "DayOfMonth", dayOfMonth: 16, month: 2 })
		});

		assert.ok(oApp.hasAppointmentAtDate(UI5Date.getInstance(2026, 2, 16)), "Mar 16 2026 matches");
		assert.notOk(oApp.hasAppointmentAtDate(UI5Date.getInstance(2027, 2, 16)), "Mar 16 2027 blocked by endDate");

		oApp.destroy();
	});

	QUnit.test("Yearly DayOfWeek recurrence ending same day — only matches that date", function (assert) {
		// Mar 16, 2026 = 3rd Monday of March
		const oApp = new RecurringCalendarAppointment({
			recurrenceType: RecurrenceType.Yearly,
			recurrencePattern: 1,
			recurrenceEndDate: UI5Date.getInstance(2026, 2, 16),
			startDate: UI5Date.getInstance(2026, 2, 16, 10, 0),
			endDate: UI5Date.getInstance(2026, 2, 16, 10, 15),
			recurrenceRule: new RecurrenceRule({ type: "DayOfWeek", weekOfMonth: "Third", dayOfWeek: 1, month: 2 })
		});

		assert.ok(oApp.hasAppointmentAtDate(UI5Date.getInstance(2026, 2, 16)), "3rd Monday Mar 2026 matches");
		assert.notOk(oApp.hasAppointmentAtDate(UI5Date.getInstance(2027, 2, 21)), "3rd Monday Mar 2027 blocked by endDate");

		oApp.destroy();
	});

	// ─────────────────────────────────────────────────────────────────────────
	// Edit scenarios
	// ─────────────────────────────────────────────────────────────────────────
	QUnit.module("Edit scenarios — keep type, change date/time");

	QUnit.test("Daily: move startDate forward — old dates no longer match", function (assert) {
		const oApp = new RecurringCalendarAppointment({
			recurrenceType: RecurrenceType.Daily,
			recurrencePattern: 1,
			startDate: UI5Date.getInstance(2025, 0, 1, 9, 0),   // Jan 1
			endDate:   UI5Date.getInstance(2025, 0, 1, 10, 0)
		});

		assert.ok(oApp.hasAppointmentAtDate(UI5Date.getInstance(2025, 0, 5)), "Jan 5 matches before edit");

		// Edit: move start to Jan 10
		oApp.setStartDate(UI5Date.getInstance(2025, 0, 10, 9, 0));

		assert.notOk(oApp.hasAppointmentAtDate(UI5Date.getInstance(2025, 0, 5)), "Jan 5 no longer matches (before new start)");
		assert.ok(oApp.hasAppointmentAtDate(UI5Date.getInstance(2025, 0, 15)), "Jan 15 matches after edit");

		oApp.destroy();
	});

	QUnit.test("Weekly: move startDate to different day-of-week", function (assert) {
		// Start: Monday Jan 6. Edit to Wednesday Jan 8.
		const oApp = new RecurringCalendarAppointment({
			recurrenceType: RecurrenceType.Weekly,
			recurrencePattern: 1,
			startDate: UI5Date.getInstance(2025, 0, 6, 9, 0),   // Monday
			endDate:   UI5Date.getInstance(2025, 0, 6, 10, 0)
		});

		assert.ok(oApp.hasAppointmentAtDate(UI5Date.getInstance(2025, 0, 13)), "Monday Jan 13 matches before edit");
		assert.notOk(oApp.hasAppointmentAtDate(UI5Date.getInstance(2025, 0, 15)), "Wednesday Jan 15 no match before edit");

		// Edit: move start to Wednesday Jan 8
		oApp.setStartDate(UI5Date.getInstance(2025, 0, 8, 9, 0));
		oApp.setEndDate(UI5Date.getInstance(2025, 0, 8, 10, 0));

		assert.notOk(oApp.hasAppointmentAtDate(UI5Date.getInstance(2025, 0, 13)), "Monday Jan 13 no longer matches");
		assert.ok(oApp.hasAppointmentAtDate(UI5Date.getInstance(2025, 0, 15)), "Wednesday Jan 15 matches after edit");
		assert.ok(oApp.hasAppointmentAtDate(UI5Date.getInstance(2025, 0, 22)), "Wednesday Jan 22 matches after edit");

		oApp.destroy();
	});

	QUnit.test("Monthly: move startDate changes anchor day", function (assert) {
		const oApp = new RecurringCalendarAppointment({
			recurrenceType: RecurrenceType.Monthly,
			recurrencePattern: 1,
			startDate: UI5Date.getInstance(2025, 0, 15, 9, 0),  // 15th
			endDate:   UI5Date.getInstance(2025, 0, 15, 10, 0)
		});

		assert.ok(oApp.hasAppointmentAtDate(UI5Date.getInstance(2025, 1, 15)), "Feb 15 matches before edit");
		assert.notOk(oApp.hasAppointmentAtDate(UI5Date.getInstance(2025, 1, 20)), "Feb 20 no match before edit");

		// Edit: move to the 20th
		oApp.setStartDate(UI5Date.getInstance(2025, 0, 20, 9, 0));

		assert.notOk(oApp.hasAppointmentAtDate(UI5Date.getInstance(2025, 1, 15)), "Feb 15 no longer matches");
		assert.ok(oApp.hasAppointmentAtDate(UI5Date.getInstance(2025, 1, 20)), "Feb 20 matches after edit");

		oApp.destroy();
	});

	QUnit.test("Daily: move recurrenceEndDate extends series", function (assert) {
		const oApp = new RecurringCalendarAppointment({
			recurrenceType: RecurrenceType.Daily,
			recurrencePattern: 1,
			startDate:          UI5Date.getInstance(2025, 0, 1, 9, 0),
			endDate:            UI5Date.getInstance(2025, 0, 1, 10, 0),
			recurrenceEndDate:  UI5Date.getInstance(2025, 0, 5)
		});

		assert.ok(oApp.hasAppointmentAtDate(UI5Date.getInstance(2025, 0, 5)), "Jan 5 matches before edit");
		assert.notOk(oApp.hasAppointmentAtDate(UI5Date.getInstance(2025, 0, 10)), "Jan 10 no match — series ended");

		// Edit: extend end to Jan 15
		oApp.setRecurrenceEndDate(UI5Date.getInstance(2025, 0, 15));

		assert.ok(oApp.hasAppointmentAtDate(UI5Date.getInstance(2025, 0, 10)), "Jan 10 matches after extending");
		assert.notOk(oApp.hasAppointmentAtDate(UI5Date.getInstance(2025, 0, 16)), "Jan 16 still no match");

		oApp.destroy();
	});

	QUnit.module("Edit scenarios — change type, keep date/time");

	QUnit.test("Daily → Weekly: intermediate days stop matching", function (assert) {
		// Jan 6 2025 = Monday
		const oApp = new RecurringCalendarAppointment({
			recurrenceType: RecurrenceType.Daily,
			recurrencePattern: 1,
			startDate: UI5Date.getInstance(2025, 0, 6, 9, 0),
			endDate:   UI5Date.getInstance(2025, 0, 6, 10, 0)
		});

		assert.ok(oApp.hasAppointmentAtDate(UI5Date.getInstance(2025, 0, 7)), "Tue Jan 7 matches (Daily)");
		assert.ok(oApp.hasAppointmentAtDate(UI5Date.getInstance(2025, 0, 8)), "Wed Jan 8 matches (Daily)");

		// Edit: change type to Weekly (keep same startDate = Monday)
		oApp.setRecurrenceType(RecurrenceType.Weekly);

		assert.notOk(oApp.hasAppointmentAtDate(UI5Date.getInstance(2025, 0, 7)), "Tue Jan 7 no longer matches (Weekly)");
		assert.notOk(oApp.hasAppointmentAtDate(UI5Date.getInstance(2025, 0, 8)), "Wed Jan 8 no longer matches (Weekly)");
		assert.ok(oApp.hasAppointmentAtDate(UI5Date.getInstance(2025, 0, 13)), "Mon Jan 13 matches (Weekly)");

		oApp.destroy();
	});

	QUnit.test("Weekly → Monthly: only same day-of-month matches", function (assert) {
		// Jan 15 2025 = Wednesday
		const oApp = new RecurringCalendarAppointment({
			recurrenceType: RecurrenceType.Weekly,
			recurrencePattern: 1,
			startDate: UI5Date.getInstance(2025, 0, 15, 9, 0),  // Wed 15th
			endDate:   UI5Date.getInstance(2025, 0, 15, 10, 0)
		});

		assert.ok(oApp.hasAppointmentAtDate(UI5Date.getInstance(2025, 0, 22)), "Wed Jan 22 matches (Weekly)");
		assert.notOk(oApp.hasAppointmentAtDate(UI5Date.getInstance(2025, 1, 15)), "Feb 15 no match (Weekly — wrong week)");

		// Edit: change to Monthly
		oApp.setRecurrenceType(RecurrenceType.Monthly);

		assert.notOk(oApp.hasAppointmentAtDate(UI5Date.getInstance(2025, 0, 22)), "Wed Jan 22 no longer matches (Monthly)");
		assert.ok(oApp.hasAppointmentAtDate(UI5Date.getInstance(2025, 1, 15)), "Feb 15 matches (Monthly — same day)");
		assert.ok(oApp.hasAppointmentAtDate(UI5Date.getInstance(2025, 2, 15)), "Mar 15 matches (Monthly)");

		oApp.destroy();
	});

	QUnit.test("Monthly → Yearly: only same month+day matches", function (assert) {
		const oApp = new RecurringCalendarAppointment({
			recurrenceType: RecurrenceType.Monthly,
			recurrencePattern: 1,
			startDate: UI5Date.getInstance(2025, 2, 10, 9, 0),  // Mar 10
			endDate:   UI5Date.getInstance(2025, 2, 10, 10, 0)
		});

		assert.ok(oApp.hasAppointmentAtDate(UI5Date.getInstance(2025, 3, 10)), "Apr 10 matches (Monthly)");
		assert.ok(oApp.hasAppointmentAtDate(UI5Date.getInstance(2025, 4, 10)), "May 10 matches (Monthly)");

		// Edit: change to Yearly
		oApp.setRecurrenceType(RecurrenceType.Yearly);

		assert.notOk(oApp.hasAppointmentAtDate(UI5Date.getInstance(2025, 3, 10)), "Apr 10 no longer matches (Yearly)");
		assert.ok(oApp.hasAppointmentAtDate(UI5Date.getInstance(2026, 2, 10)), "Mar 10 2026 matches (Yearly)");
		assert.notOk(oApp.hasAppointmentAtDate(UI5Date.getInstance(2026, 3, 10)), "Apr 10 2026 no match (Yearly)");

		oApp.destroy();
	});

	QUnit.test("Changing recurrenceRule days updates which weekdays match", function (assert) {
		// Mon/Wed/Fri rule
		const oApp = new RecurringCalendarAppointment({
			recurrenceType: RecurrenceType.Weekly,
			recurrencePattern: 1,
			startDate: UI5Date.getInstance(2025, 0, 6, 9, 0),  // Mon Jan 6
			endDate:   UI5Date.getInstance(2025, 0, 6, 10, 0),
			recurrenceRule: new RecurrenceRule({ days: [1, 3, 5] })
		});

		assert.notOk(oApp.hasAppointmentAtDate(UI5Date.getInstance(2025, 0, 7)), "Tue no match (M/W/F rule)");
		assert.ok(oApp.hasAppointmentAtDate(UI5Date.getInstance(2025, 0, 8)), "Wed matches (M/W/F rule)");

		// Edit: change rule to Tue/Thu
		oApp.setRecurrenceRule(new RecurrenceRule({ days: [2, 4] }));

		assert.ok(oApp.hasAppointmentAtDate(UI5Date.getInstance(2025, 0, 7)), "Tue now matches (T/Th rule)");
		assert.notOk(oApp.hasAppointmentAtDate(UI5Date.getInstance(2025, 0, 8)), "Wed no longer matches");
		assert.ok(oApp.hasAppointmentAtDate(UI5Date.getInstance(2025, 0, 9)), "Thu matches (T/Th rule)");

		oApp.destroy();
	});

	QUnit.module("Edit scenarios — change both type and date/time");

	QUnit.test("Daily (Jan 1) → Weekly (Feb 3, Monday): only Mondays from Feb 3 match", function (assert) {
		const oApp = new RecurringCalendarAppointment({
			recurrenceType: RecurrenceType.Daily,
			recurrencePattern: 1,
			startDate: UI5Date.getInstance(2025, 0, 1, 9, 0),
			endDate:   UI5Date.getInstance(2025, 0, 1, 10, 0)
		});

		assert.ok(oApp.hasAppointmentAtDate(UI5Date.getInstance(2025, 0, 5)), "Jan 5 matches (Daily from Jan 1)");

		// Edit: new type Weekly, new startDate Monday Feb 3
		oApp.setRecurrenceType(RecurrenceType.Weekly);
		oApp.setStartDate(UI5Date.getInstance(2025, 1, 3, 9, 0));
		oApp.setEndDate(UI5Date.getInstance(2025, 1, 3, 10, 0));

		assert.notOk(oApp.hasAppointmentAtDate(UI5Date.getInstance(2025, 0, 5)), "Jan 5 no longer matches");
		assert.notOk(oApp.hasAppointmentAtDate(UI5Date.getInstance(2025, 0, 1)), "Jan 1 (old start) no match");
		assert.ok(oApp.hasAppointmentAtDate(UI5Date.getInstance(2025, 1, 3)), "Mon Feb 3 matches (new start)");
		assert.notOk(oApp.hasAppointmentAtDate(UI5Date.getInstance(2025, 1, 4)), "Tue Feb 4 no match (Weekly)");
		assert.ok(oApp.hasAppointmentAtDate(UI5Date.getInstance(2025, 1, 10)), "Mon Feb 10 matches (Weekly)");

		oApp.destroy();
	});

	QUnit.test("Weekly (Jan 6) → Monthly (Feb 15): pattern and anchor both change", function (assert) {
		const oApp = new RecurringCalendarAppointment({
			recurrenceType: RecurrenceType.Weekly,
			recurrencePattern: 1,
			startDate: UI5Date.getInstance(2025, 0, 6, 9, 0),   // Mon Jan 6
			endDate:   UI5Date.getInstance(2025, 0, 6, 10, 0)
		});

		assert.ok(oApp.hasAppointmentAtDate(UI5Date.getInstance(2025, 0, 13)), "Mon Jan 13 matches (Weekly)");

		// Edit: Monthly from Feb 15, pattern 2
		oApp.setRecurrenceType(RecurrenceType.Monthly);
		oApp.setRecurrencePattern(2);
		oApp.setStartDate(UI5Date.getInstance(2025, 1, 15, 9, 0));
		oApp.setEndDate(UI5Date.getInstance(2025, 1, 15, 10, 0));

		assert.notOk(oApp.hasAppointmentAtDate(UI5Date.getInstance(2025, 0, 13)), "Mon Jan 13 no match (Monthly now)");
		assert.ok(oApp.hasAppointmentAtDate(UI5Date.getInstance(2025, 1, 15)), "Feb 15 matches (new start)");
		assert.notOk(oApp.hasAppointmentAtDate(UI5Date.getInstance(2025, 2, 15)), "Mar 15 no match (pattern=2, skip month)");
		assert.ok(oApp.hasAppointmentAtDate(UI5Date.getInstance(2025, 3, 15)), "Apr 15 matches (every 2 months)");

		oApp.destroy();
	});

	QUnit.test("Monthly (Jan 20) → Yearly (Mar 5) with DayOfWeek rule", function (assert) {
		const oApp = new RecurringCalendarAppointment({
			recurrenceType: RecurrenceType.Monthly,
			recurrencePattern: 1,
			startDate: UI5Date.getInstance(2025, 0, 20, 9, 0),
			endDate:   UI5Date.getInstance(2025, 0, 20, 10, 0)
		});

		assert.ok(oApp.hasAppointmentAtDate(UI5Date.getInstance(2025, 1, 20)), "Feb 20 matches (Monthly)");

		// Edit: Yearly from Mar 2025, first Monday of March
		oApp.setRecurrenceType(RecurrenceType.Yearly);
		oApp.setStartDate(UI5Date.getInstance(2025, 2, 3, 9, 0));  // Mar 3 (1st Monday of Mar 2025)
		oApp.setEndDate(UI5Date.getInstance(2025, 2, 3, 10, 0));
		oApp.setRecurrenceRule(new RecurrenceRule({
			type: "DayOfWeek", weekOfMonth: "First", dayOfWeek: 1, month: 2 // Monday, March
		}));

		assert.notOk(oApp.hasAppointmentAtDate(UI5Date.getInstance(2025, 1, 20)), "Feb 20 no longer matches");
		assert.ok(oApp.hasAppointmentAtDate(UI5Date.getInstance(2025, 2, 3)), "Mar 3 2025 matches (1st Monday of Mar)");
		assert.notOk(oApp.hasAppointmentAtDate(UI5Date.getInstance(2025, 2, 10)), "Mar 10 no match (2nd Monday)");
		// First Monday of March 2026 = Mar 2
		assert.ok(oApp.hasAppointmentAtDate(UI5Date.getInstance(2026, 2, 2)), "Mar 2 2026 matches (1st Monday of Mar)");

		oApp.destroy();
	});

	// ─────────────────────────────────────────────────────────────────
	// Monthly DayOfWeek — First / Third / Fourth weekOfMonth
	// ─────────────────────────────────────────────────────────────────
	QUnit.module("hasAppointmentAtDate — Monthly DayOfWeek weekOfMonth variants");

	QUnit.test("Monthly DayOfWeek — First Monday", function (assert) {
		const oApp = new RecurringCalendarAppointment({
			recurrenceType: RecurrenceType.Monthly,
			recurrencePattern: 1,
			startDate: UI5Date.getInstance(2025, 0, 6, 9, 0),  // Jan 6 (1st Monday)
			endDate:   UI5Date.getInstance(2025, 0, 6, 10, 0),
			recurrenceRule: new RecurrenceRule({type: "DayOfWeek", weekOfMonth: "First", dayOfWeek: 1})
		});

		// 1st Monday Jan 2025 = Jan 6
		assert.ok(oApp.hasAppointmentAtDate(UI5Date.getInstance(2025, 0, 6)),  "Jan 6 (1st Mon) matches");
		assert.notOk(oApp.hasAppointmentAtDate(UI5Date.getInstance(2025, 0, 13)), "Jan 13 (2nd Mon) no match");
		// 1st Monday Feb 2025 = Feb 3
		assert.ok(oApp.hasAppointmentAtDate(UI5Date.getInstance(2025, 1, 3)),  "Feb 3 (1st Mon) matches");
		// 1st Monday Mar 2025 = Mar 3
		assert.ok(oApp.hasAppointmentAtDate(UI5Date.getInstance(2025, 2, 3)),  "Mar 3 (1st Mon) matches");

		oApp.destroy();
	});

	QUnit.test("Monthly DayOfWeek — Third Monday", function (assert) {
		const oApp = new RecurringCalendarAppointment({
			recurrenceType: RecurrenceType.Monthly,
			recurrencePattern: 1,
			startDate: UI5Date.getInstance(2025, 0, 20, 9, 0),  // Jan 20 (3rd Monday)
			endDate:   UI5Date.getInstance(2025, 0, 20, 10, 0),
			recurrenceRule: new RecurrenceRule({type: "DayOfWeek", weekOfMonth: "Third", dayOfWeek: 1})
		});

		// 3rd Monday Jan 2025 = Jan 20
		assert.ok(oApp.hasAppointmentAtDate(UI5Date.getInstance(2025, 0, 20)), "Jan 20 (3rd Mon) matches");
		assert.notOk(oApp.hasAppointmentAtDate(UI5Date.getInstance(2025, 0, 13)), "Jan 13 (2nd Mon) no match");
		assert.notOk(oApp.hasAppointmentAtDate(UI5Date.getInstance(2025, 0, 27)), "Jan 27 (4th Mon) no match");
		// 3rd Monday Feb 2025 = Feb 17
		assert.ok(oApp.hasAppointmentAtDate(UI5Date.getInstance(2025, 1, 17)), "Feb 17 (3rd Mon) matches");

		oApp.destroy();
	});

	QUnit.test("Monthly DayOfWeek — Fourth Monday", function (assert) {
		const oApp = new RecurringCalendarAppointment({
			recurrenceType: RecurrenceType.Monthly,
			recurrencePattern: 1,
			startDate: UI5Date.getInstance(2025, 0, 27, 9, 0),  // Jan 27 (4th Monday)
			endDate:   UI5Date.getInstance(2025, 0, 27, 10, 0),
			recurrenceRule: new RecurrenceRule({type: "DayOfWeek", weekOfMonth: "Fourth", dayOfWeek: 1})
		});

		// 4th Monday Jan 2025 = Jan 27
		assert.ok(oApp.hasAppointmentAtDate(UI5Date.getInstance(2025, 0, 27)), "Jan 27 (4th Mon) matches");
		assert.notOk(oApp.hasAppointmentAtDate(UI5Date.getInstance(2025, 0, 20)), "Jan 20 (3rd Mon) no match");
		// 4th Monday Feb 2025 = Feb 24
		assert.ok(oApp.hasAppointmentAtDate(UI5Date.getInstance(2025, 1, 24)), "Feb 24 (4th Mon) matches");

		oApp.destroy();
	});

	// ─────────────────────────────────────────────────────────────────
	// Monthly DayOfWeek + pattern > 1
	// ─────────────────────────────────────────────────────────────────
	QUnit.module("hasAppointmentAtDate — Monthly DayOfWeek with pattern > 1");

	QUnit.test("Monthly DayOfWeek — 2nd Tuesday every 2 months", function (assert) {
		const oApp = new RecurringCalendarAppointment({
			recurrenceType: RecurrenceType.Monthly,
			recurrencePattern: 2,
			startDate: UI5Date.getInstance(2025, 0, 14, 9, 0),  // Jan 14 (2nd Tuesday of Jan)
			endDate:   UI5Date.getInstance(2025, 0, 14, 10, 0),
			recurrenceRule: new RecurrenceRule({type: "DayOfWeek", weekOfMonth: "Second", dayOfWeek: 2})
		});

		// 2nd Tuesday Jan 2025 = Jan 14 (month 0, base)
		assert.ok(oApp.hasAppointmentAtDate(UI5Date.getInstance(2025, 0, 14)), "Jan 14 (2nd Tue) matches");
		// Feb (month 1) — skip (pattern=2)
		assert.notOk(oApp.hasAppointmentAtDate(UI5Date.getInstance(2025, 1, 11)), "Feb 11 no match (skip month)");
		// 2nd Tuesday Mar 2025 = Mar 11 (month 2)
		assert.ok(oApp.hasAppointmentAtDate(UI5Date.getInstance(2025, 2, 11)), "Mar 11 (2nd Tue) matches");
		// Apr (month 3) — skip
		assert.notOk(oApp.hasAppointmentAtDate(UI5Date.getInstance(2025, 3, 8)), "Apr 8 no match (skip month)");
		// 2nd Tuesday May 2025 = May 13 (month 4)
		assert.ok(oApp.hasAppointmentAtDate(UI5Date.getInstance(2025, 4, 13)), "May 13 (2nd Tue) matches");

		oApp.destroy();
	});

	// ─────────────────────────────────────────────────────────────────
	// Yearly DayOfWeek without explicit month → uses startDate month
	// ─────────────────────────────────────────────────────────────────
	QUnit.module("hasAppointmentAtDate — Yearly DayOfWeek without explicit month");

	QUnit.test("Yearly DayOfWeek — first Monday of January (month inherited from startDate)", function (assert) {
		const oApp = new RecurringCalendarAppointment({
			recurrenceType: RecurrenceType.Yearly,
			recurrencePattern: 1,
			startDate: UI5Date.getInstance(2025, 0, 6, 9, 0),   // Jan 6 (1st Monday of Jan)
			endDate:   UI5Date.getInstance(2025, 0, 6, 10, 0),
			recurrenceRule: new RecurrenceRule({
				type: "DayOfWeek", weekOfMonth: "First", dayOfWeek: 1
				// no month set → defaults to 0 → resolved as startDate month (January)
			})
		});

		// 1st Monday Jan 2025 = Jan 6
		assert.ok(oApp.hasAppointmentAtDate(UI5Date.getInstance(2025, 0, 6)),  "Jan 6 2025 matches");
		assert.notOk(oApp.hasAppointmentAtDate(UI5Date.getInstance(2025, 0, 13)), "Jan 13 no match (2nd Mon)");
		// 1st Monday Jan 2026 = Jan 5
		assert.ok(oApp.hasAppointmentAtDate(UI5Date.getInstance(2026, 0, 5)),  "Jan 5 2026 matches");
		// 1st Monday Jan 2027 = Jan 4
		assert.ok(oApp.hasAppointmentAtDate(UI5Date.getInstance(2027, 0, 4)),  "Jan 4 2027 matches");
		// Wrong month
		assert.notOk(oApp.hasAppointmentAtDate(UI5Date.getInstance(2025, 1, 3)),  "Feb 3 no match (wrong month)");

		oApp.destroy();
	});

	// ─────────────────────────────────────────────────────────────────
	// getOccurrencesInRange — appointment-level tests
	// ─────────────────────────────────────────────────────────────────
	QUnit.module("getOccurrencesInRange — appointment level");

	QUnit.test("Daily every day — 5 occurrences in 5-day range", function (assert) {
		const oApp = new RecurringCalendarAppointment({
			recurrenceType: RecurrenceType.Daily,
			recurrencePattern: 1,
			startDate: UI5Date.getInstance(2025, 0, 1, 9, 0),
			endDate:   UI5Date.getInstance(2025, 0, 1, 10, 0)
		});

		const aOccs = oApp.getOccurrencesInRange(
			UI5Date.getInstance(2025, 0, 1),
			UI5Date.getInstance(2025, 0, 5)
		);

		assert.strictEqual(aOccs.length, 5, "5 occurrences in Jan 1–5");
		assert.strictEqual(aOccs[0].getDate(), 1, "1st occurrence Jan 1");
		assert.strictEqual(aOccs[4].getDate(), 5, "5th occurrence Jan 5");

		oApp.destroy();
	});

	QUnit.test("Weekly — 3 occurrences in 3-week range", function (assert) {
		const oApp = new RecurringCalendarAppointment({
			recurrenceType: RecurrenceType.Weekly,
			recurrencePattern: 1,
			startDate: UI5Date.getInstance(2025, 0, 6, 9, 0),   // Mon Jan 6
			endDate:   UI5Date.getInstance(2025, 0, 6, 10, 0)
		});

		const aOccs = oApp.getOccurrencesInRange(
			UI5Date.getInstance(2025, 0, 6),
			UI5Date.getInstance(2025, 0, 20)  // Jan 20 (Mon)
		);

		assert.strictEqual(aOccs.length, 3, "3 occurrences: Jan 6, 13, 20");
		assert.strictEqual(aOccs[0].getDate(), 6,  "Jan 6");
		assert.strictEqual(aOccs[1].getDate(), 13, "Jan 13");
		assert.strictEqual(aOccs[2].getDate(), 20, "Jan 20");

		oApp.destroy();
	});

	QUnit.test("Monthly — 3 occurrences in Q1 range", function (assert) {
		const oApp = new RecurringCalendarAppointment({
			recurrenceType: RecurrenceType.Monthly,
			recurrencePattern: 1,
			startDate: UI5Date.getInstance(2025, 0, 15, 9, 0),  // Jan 15
			endDate:   UI5Date.getInstance(2025, 0, 15, 10, 0)
		});

		const aOccs = oApp.getOccurrencesInRange(
			UI5Date.getInstance(2025, 0, 1),
			UI5Date.getInstance(2025, 2, 31)  // Jan 1 – Mar 31
		);

		assert.strictEqual(aOccs.length, 3, "3 occurrences: Jan 15, Feb 15, Mar 15");
		assert.strictEqual(aOccs[0].getDate(), 15, "Jan 15");
		assert.strictEqual(aOccs[0].getMonth(), 0,  "month: Jan");
		assert.strictEqual(aOccs[1].getMonth(), 1,  "month: Feb");
		assert.strictEqual(aOccs[2].getMonth(), 2,  "month: Mar");

		oApp.destroy();
	});

	QUnit.test("Yearly — 3 occurrences in 3-year range", function (assert) {
		const oApp = new RecurringCalendarAppointment({
			recurrenceType: RecurrenceType.Yearly,
			recurrencePattern: 1,
			startDate: UI5Date.getInstance(2025, 2, 20, 9, 0),  // Mar 20
			endDate:   UI5Date.getInstance(2025, 2, 20, 10, 0)
		});

		const aOccs = oApp.getOccurrencesInRange(
			UI5Date.getInstance(2025, 0, 1),
			UI5Date.getInstance(2027, 11, 31)
		);

		assert.strictEqual(aOccs.length, 3, "3 occurrences: Mar 20 in 2025, 2026, 2027");
		assert.strictEqual(aOccs[0].getFullYear(), 2025, "2025");
		assert.strictEqual(aOccs[1].getFullYear(), 2026, "2026");
		assert.strictEqual(aOccs[2].getFullYear(), 2027, "2027");

		oApp.destroy();
	});

	QUnit.test("getOccurrencesInRange respects recurrenceEndDate", function (assert) {
		const oApp = new RecurringCalendarAppointment({
			recurrenceType: RecurrenceType.Daily,
			recurrencePattern: 1,
			startDate:          UI5Date.getInstance(2025, 0, 1, 9, 0),
			endDate:            UI5Date.getInstance(2025, 0, 1, 10, 0),
			recurrenceEndDate:  UI5Date.getInstance(2025, 0, 3)   // ends Jan 3
		});

		const aOccs = oApp.getOccurrencesInRange(
			UI5Date.getInstance(2025, 0, 1),
			UI5Date.getInstance(2025, 0, 10)
		);

		assert.strictEqual(aOccs.length, 3, "Only 3 occurrences (Jan 1–3)");
		assert.strictEqual(aOccs[2].getDate(), 3, "Last occurrence Jan 3");

		oApp.destroy();
	});

	// ─────────────────────────────────────────────────────────────────
	// Cache invalidation
	// ─────────────────────────────────────────────────────────────────
	QUnit.module("Cache invalidation");

	QUnit.test("setStartDate invalidates cache so new start date is reflected", function (assert) {
		const oApp = new RecurringCalendarAppointment({
			recurrenceType: RecurrenceType.Daily,
			recurrencePattern: 1,
			startDate: UI5Date.getInstance(2025, 0, 1, 9, 0),
			endDate:   UI5Date.getInstance(2025, 0, 1, 10, 0)
		});

		// Warm up cache — every day from Jan 1 matches
		assert.ok(oApp.hasAppointmentAtDate(UI5Date.getInstance(2025, 0, 5)), "Jan 5 matches before edit");
		assert.ok(oApp.hasAppointmentAtDate(UI5Date.getInstance(2025, 0, 1)), "Jan 1 matches before edit");

		// Move start to Jan 3 — Jan 1 and Jan 2 should no longer match
		oApp.setStartDate(UI5Date.getInstance(2025, 0, 3, 9, 0));
		oApp.setEndDate(UI5Date.getInstance(2025, 0, 3, 10, 0));

		assert.notOk(oApp.hasAppointmentAtDate(UI5Date.getInstance(2025, 0, 1)), "Jan 1 no match after start moved to Jan 3");
		assert.notOk(oApp.hasAppointmentAtDate(UI5Date.getInstance(2025, 0, 2)), "Jan 2 no match after start moved to Jan 3");
		assert.ok(oApp.hasAppointmentAtDate(UI5Date.getInstance(2025, 0, 3)), "Jan 3 matches (new start)");
		assert.ok(oApp.hasAppointmentAtDate(UI5Date.getInstance(2025, 0, 5)), "Jan 5 still matches");

		oApp.destroy();
	});

	QUnit.test("setRecurrenceEndDate invalidates cache so end date is reflected", function (assert) {
		const oApp = new RecurringCalendarAppointment({
			recurrenceType: RecurrenceType.Daily,
			recurrencePattern: 1,
			startDate: UI5Date.getInstance(2025, 0, 1, 9, 0),
			endDate:   UI5Date.getInstance(2025, 0, 1, 10, 0)
		});

		// Warm up
		assert.ok(oApp.hasAppointmentAtDate(UI5Date.getInstance(2025, 0, 10)), "Jan 10 matches (no end date)");

		// Set recurrenceEndDate to Jan 5
		oApp.setRecurrenceEndDate(UI5Date.getInstance(2025, 0, 5));

		assert.ok(oApp.hasAppointmentAtDate(UI5Date.getInstance(2025, 0, 5)),  "Jan 5 matches (=endDate)");
		assert.notOk(oApp.hasAppointmentAtDate(UI5Date.getInstance(2025, 0, 6)),  "Jan 6 no match (after endDate)");
		assert.notOk(oApp.hasAppointmentAtDate(UI5Date.getInstance(2025, 0, 10)), "Jan 10 no match (after endDate)");

		oApp.destroy();
	});

	// ─────────────────────────────────────────────────────────────────
	// Weekly bi-weekly + specific days
	// ─────────────────────────────────────────────────────────────────
	QUnit.module("hasAppointmentAtDate — Weekly bi-weekly with specific days");

	QUnit.test("Bi-weekly on Monday and Wednesday", function (assert) {
		const oApp = new RecurringCalendarAppointment({
			recurrenceType: RecurrenceType.Weekly,
			recurrencePattern: 2,
			startDate: UI5Date.getInstance(2025, 0, 6, 9, 0),   // Mon Jan 6 (ISO week 2)
			endDate:   UI5Date.getInstance(2025, 0, 6, 10, 0),
			recurrenceRule: new RecurrenceRule({days: [1, 3]})    // Monday=1, Wednesday=3
		});

		// Week 2 (Jan 6–12): Mon Jan 6 ✓, Wed Jan 8 ✓
		assert.ok(oApp.hasAppointmentAtDate(UI5Date.getInstance(2025, 0, 6)),  "Jan 6 (Mon, wk2) matches");
		assert.ok(oApp.hasAppointmentAtDate(UI5Date.getInstance(2025, 0, 8)),  "Jan 8 (Wed, wk2) matches");
		// Week 3 (Jan 13–19): skip
		assert.notOk(oApp.hasAppointmentAtDate(UI5Date.getInstance(2025, 0, 13)), "Jan 13 (Mon, wk3) no match");
		assert.notOk(oApp.hasAppointmentAtDate(UI5Date.getInstance(2025, 0, 15)), "Jan 15 (Wed, wk3) no match");
		// Week 4 (Jan 20–26): Mon Jan 20 ✓, Wed Jan 22 ✓
		assert.ok(oApp.hasAppointmentAtDate(UI5Date.getInstance(2025, 0, 20)), "Jan 20 (Mon, wk4) matches");
		assert.ok(oApp.hasAppointmentAtDate(UI5Date.getInstance(2025, 0, 22)), "Jan 22 (Wed, wk4) matches");

		oApp.destroy();
	});

	// ─────────────────────────────────────────────────────────────────
	// Yearly Feb 29 (leap years only)
	// ─────────────────────────────────────────────────────────────────
	QUnit.module("hasAppointmentAtDate — Yearly Feb 29 (leap year)");

	QUnit.test("Yearly on Feb 29 — only fires on leap years", function (assert) {
		const oApp = new RecurringCalendarAppointment({
			recurrenceType: RecurrenceType.Yearly,
			recurrencePattern: 1,
			startDate: UI5Date.getInstance(2024, 1, 29, 9, 0),  // Feb 29 2024 (leap)
			endDate:   UI5Date.getInstance(2024, 1, 29, 10, 0)
		});

		assert.ok(oApp.hasAppointmentAtDate(UI5Date.getInstance(2024, 1, 29)), "Feb 29 2024 matches (leap)");
		// 2025 is not a leap year → Feb 29 doesn't exist → no match
		assert.notOk(oApp.hasAppointmentAtDate(UI5Date.getInstance(2025, 1, 28)), "Feb 28 2025 no match");
		// Mar 1 2025 is not Feb 29
		assert.notOk(oApp.hasAppointmentAtDate(UI5Date.getInstance(2025, 2, 1)),  "Mar 1 2025 no match");
		// 2028 is leap → Feb 29 matches
		assert.ok(oApp.hasAppointmentAtDate(UI5Date.getInstance(2028, 1, 29)), "Feb 29 2028 matches (leap)");

		oApp.destroy();
	});

	// ─────────────────────────────────────────────────────────────────
	// setRecurrencePattern — validation
	// Bug: pattern=0 causes infinite loop in _getNextPotentialOccurrence.
	// ─────────────────────────────────────────────────────────────────
	QUnit.module("setRecurrencePattern — validation");

	QUnit.test("Throws for pattern 0", function (assert) {
		const oApp = new RecurringCalendarAppointment();
		assert.throws(function () { oApp.setRecurrencePattern(0); }, /pattern/i, "Throws for 0");
		oApp.destroy();
	});

	QUnit.test("Throws for negative pattern", function (assert) {
		const oApp = new RecurringCalendarAppointment();
		assert.throws(function () { oApp.setRecurrencePattern(-1); }, /pattern/i, "Throws for -1");
		oApp.destroy();
	});

	// ─────────────────────────────────────────────────────────────────
	// Cache invalidation — hasOccurrenceOnDateCached
	// Bug: setStartDate/setEndDate/setRecurrenceEndDate don't call invalidateCache.
	// ─────────────────────────────────────────────────────────────────
	QUnit.module("Cache invalidation — hasOccurrenceOnDateCached");

	QUnit.test("setStartDate invalidates hasOccurrenceOnDateCached", function (assert) {
		const oApp = new RecurringCalendarAppointment({
			recurrenceType: RecurrenceType.Daily,
			recurrencePattern: 1,
			startDate: UI5Date.getInstance(2025, 0, 1, 9, 0),
			endDate:   UI5Date.getInstance(2025, 0, 1, 10, 0)
		});

		assert.ok(oApp.hasOccurrenceOnDateCached(UI5Date.getInstance(2025, 0, 1)), "Jan 1 matches before edit");

		oApp.setStartDate(UI5Date.getInstance(2025, 0, 3, 9, 0));
		oApp.setEndDate(UI5Date.getInstance(2025, 0, 3, 10, 0));

		assert.notOk(oApp.hasOccurrenceOnDateCached(UI5Date.getInstance(2025, 0, 1)), "Jan 1 no longer matches after start moved to Jan 3");

		oApp.destroy();
	});

	QUnit.test("setRecurrenceEndDate invalidates hasOccurrenceOnDateCached", function (assert) {
		const oApp = new RecurringCalendarAppointment({
			recurrenceType: RecurrenceType.Daily,
			recurrencePattern: 1,
			startDate: UI5Date.getInstance(2025, 0, 1, 9, 0),
			endDate:   UI5Date.getInstance(2025, 0, 1, 10, 0)
		});

		assert.ok(oApp.hasOccurrenceOnDateCached(UI5Date.getInstance(2025, 0, 10)), "Jan 10 matches before setting endDate");

		oApp.setRecurrenceEndDate(UI5Date.getInstance(2025, 0, 5));

		assert.notOk(oApp.hasOccurrenceOnDateCached(UI5Date.getInstance(2025, 0, 10)), "Jan 10 no match after recurrenceEndDate set to Jan 5");

		oApp.destroy();
	});
});
