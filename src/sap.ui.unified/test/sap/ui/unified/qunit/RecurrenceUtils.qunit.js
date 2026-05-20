/*global QUnit*/
sap.ui.define([
	"sap/ui/unified/calendar/RecurrenceUtils",
	"sap/ui/unified/NonWorkingPeriod",
	"sap/ui/unified/RecurringNonWorkingPeriod",
	"sap/ui/unified/RecurringCalendarAppointment",
	"sap/ui/unified/RecurrenceRule",
	"sap/ui/unified/TimeRange",
	"sap/ui/core/date/UI5Date"
], function(
	RecurrenceUtils,
	NonWorkingPeriod,
	RecurringNonWorkingPeriod,
	RecurringCalendarAppointment,
	RecurrenceRule,
	TimeRange,
	UI5Date
) {
	"use strict";

	function createNonWorkingPeriod(oDate, sStart, sEnd) {
		return new NonWorkingPeriod({
			date: oDate,
			timeRange: new TimeRange({
				start: sStart,
				end: sEnd
			})
		});
	}

	QUnit.module("working and non working segments");

	QUnit.test("Small segments of non-work periods within an hour", function (assert) {
		// Prepare
		const aNonWorkingPeriods = [];
		const oCellStartDate = UI5Date.getInstance(2024, 0, 1, 0, 0, 0);
		let iExpectDuration = 0;

		aNonWorkingPeriods.push(createNonWorkingPeriod(oCellStartDate, "00:05", "00:10"));
		aNonWorkingPeriods.push(createNonWorkingPeriod(oCellStartDate, "00:15", "00:20"));
		aNonWorkingPeriods.push(createNonWorkingPeriod(oCellStartDate, "00:25", "00:30"));
		aNonWorkingPeriods.push(createNonWorkingPeriod(oCellStartDate, "00:35", "00:40"));

		// Act
		const aResult = RecurrenceUtils.getWorkingAndNonWorkingSegments(oCellStartDate, aNonWorkingPeriods);

		// Assert
		assert.strictEqual(aResult.length, 9, "Nine items need to be filtered for this hour");
		for (let i = 0; i < aResult.length; i++) {
			if (i % 2 === 0) {
				iExpectDuration = i === aResult.length - 1 ? 20 : 5;
				assert.strictEqual(aResult[i].type, "working", "The type must be defined as working");
				assert.strictEqual(aResult[i].duration, iExpectDuration, "The duration of the period is correct");
			} else {
				iExpectDuration = 5;
				assert.strictEqual(aResult[i].type, "non-working", "The type must be defined as non-working");
				assert.strictEqual(aResult[i].duration, iExpectDuration, "The duration of the period is correct");
			}
		}
	});

	QUnit.test("One segments of non-work periods within an hour(start in 00min)", (assert) => {
		// Prepare
		const aNonWorkingPeriods = [];
		const oCellStartDate = UI5Date.getInstance(2024, 0, 1, 1, 0, 0);
		const iExpectDuration = 15;
		const iMinutesInOneHours = 60;

		aNonWorkingPeriods.push(createNonWorkingPeriod(oCellStartDate, "01:00", "01:15"));

		// Act
		const aResult = RecurrenceUtils.getWorkingAndNonWorkingSegments(oCellStartDate, aNonWorkingPeriods);

		// Assert
		assert.strictEqual(aResult.length, 2, "two items need to be filtered for this hour");

		assert.strictEqual(aResult[0].type, "non-working", "The type must be defined as non-working");
		assert.strictEqual(aResult[0].duration, iExpectDuration, "The duration of the period is correct");

		assert.strictEqual(aResult[1].type, "working", "The type must be defined as working");
		assert.strictEqual(aResult[1].duration, iMinutesInOneHours - iExpectDuration, "The duration of the period is correct");
	});

	QUnit.test("One segments of non-work periods within an hour(end in 00min)", (assert) => {
		// Prepare
		const aNonWorkingPeriods = [];
		const oCellStartDate = UI5Date.getInstance(2024, 0, 1, 1, 0, 0);
		const iExpectDuration = 45;
		const iMinutesInOneHours = 60;

		aNonWorkingPeriods.push(createNonWorkingPeriod(oCellStartDate, "01:45", "02:00"));

		// Act
		const aResult = RecurrenceUtils.getWorkingAndNonWorkingSegments(oCellStartDate, aNonWorkingPeriods);

		// Assert
		assert.strictEqual(aResult.length, 2, "two items need to be filtered for this hour");

		assert.strictEqual(aResult[0].type, "working", "The type must be defined as working");
		assert.strictEqual(aResult[0].duration, iExpectDuration, "The duration of the period is correct");

		assert.strictEqual(aResult[1].type, "non-working", "The type must be defined as non-working");
		assert.strictEqual(aResult[1].duration, iMinutesInOneHours - iExpectDuration, "The duration of the period is correct");
	});

	QUnit.test("A non-work period extending over three consecutive hours", function (assert) {
		// Prepare
		const aNonWorkingPeriods = [];
		const oCellStartDate = UI5Date.getInstance(2024, 0, 1, 0, 0, 0);
		let iExpectDuration = 0;

		aNonWorkingPeriods.push(createNonWorkingPeriod(oCellStartDate, "00:40", "02:10"));


		// Act
		let aResult = RecurrenceUtils.getWorkingAndNonWorkingSegments(oCellStartDate, aNonWorkingPeriods);
		iExpectDuration = 40;

		// Assert
		assert.strictEqual(aResult.length, 2, "Five items need to be filtered for this hour");
		assert.strictEqual(aResult[0].type, "working", "The type must be defined as working");
		assert.strictEqual(aResult[0].duration, iExpectDuration, "The duration of the period is correct");

		// Act
		iExpectDuration = 20;

		// Assert
		assert.strictEqual(aResult[1].type, "non-working", "The type must be defined as non-working");
		assert.strictEqual(aResult[1].duration, iExpectDuration, "The duration of the period is correct");

		// Act
		// next hour ("01:00")
		oCellStartDate.setHours(oCellStartDate.getHours() + 1);
		aResult = RecurrenceUtils.getWorkingAndNonWorkingSegments(oCellStartDate, aNonWorkingPeriods);
		iExpectDuration = 60;

		// Assert
		assert.strictEqual(aResult.length, 1, "One items need to be filtered for this hour");
		assert.strictEqual(aResult[0].type, "non-working", "The type must be defined as non-working");
		assert.strictEqual(aResult[0].duration, iExpectDuration, "The duration of the period is correct");

		// Act
		// next hour ("02:00")
		oCellStartDate.setHours(oCellStartDate.getHours() + 1);
		aResult = RecurrenceUtils.getWorkingAndNonWorkingSegments(oCellStartDate, aNonWorkingPeriods);
		iExpectDuration = 10;

		// Assert
		assert.strictEqual(aResult.length, 2, "Two items need to be filtered for this hour");
		assert.strictEqual(aResult[0].type, "non-working", "The type must be defined as non-working");
		assert.strictEqual(aResult[0].duration, iExpectDuration, "The duration of the period is correct");

		// Act
		iExpectDuration = 50;

		// Assert
		assert.strictEqual(aResult[1].type, "working", "The type must be defined as working");
		assert.strictEqual(aResult[1].duration, iExpectDuration, "The duration of the period is correct");
	});

	QUnit.test("A non-work period extending over three full consecutive hours.", function (assert) {
		// Prepare
		const aNonWorkingPeriods = [];
		const oCellStartDate = UI5Date.getInstance(2024, 0, 1, 0, 0, 0);
		const iExpectDuration = 60;

		aNonWorkingPeriods.push(createNonWorkingPeriod(oCellStartDate, "00:00", "03:00"));

		// Act
		let aResult = RecurrenceUtils.getWorkingAndNonWorkingSegments(oCellStartDate, aNonWorkingPeriods);

		// Assert
		assert.strictEqual(aResult.length, 1, "One items need to be filtered for this hour");
		assert.strictEqual(aResult[0].type, "non-working", "The type must be defined as non-working");
		assert.strictEqual(aResult[0].duration, iExpectDuration, "The duration of the period is correct");

		// Act
		// next hour ("01:00")
		oCellStartDate.setHours(oCellStartDate.getHours() + 1);
		aResult = RecurrenceUtils.getWorkingAndNonWorkingSegments(oCellStartDate, aNonWorkingPeriods);

		// Assert
		assert.strictEqual(aResult.length, 1, "One items need to be filtered for this hour");
		assert.strictEqual(aResult[0].type, "non-working", "The type must be defined as non-working");
		assert.strictEqual(aResult[0].duration, iExpectDuration, "The duration of the period is correct");

		// Act
		// next hour ("02:00")
		oCellStartDate.setHours(oCellStartDate.getHours() + 1);
		aResult = RecurrenceUtils.getWorkingAndNonWorkingSegments(oCellStartDate, aNonWorkingPeriods);

		// Assert
		assert.strictEqual(aResult.length, 1, "One items need to be filtered for this hour");
		assert.strictEqual(aResult[0].type, "non-working", "The type must be defined as non-working");
		assert.strictEqual(aResult[0].duration, iExpectDuration, "The duration of the period is correct");
	});

	QUnit.test("A non-work period lasting one hour within two consecutive hours.", function (assert) {
		// Prepare
		const aNonWorkingPeriods = [];
		const oCellStartDate = UI5Date.getInstance(2024, 0, 1, 0, 0, 0);
		const iExpectDuration = 30;

		aNonWorkingPeriods.push(createNonWorkingPeriod(oCellStartDate, "00:30", "01:30"));

		// Act
		let aResult = RecurrenceUtils.getWorkingAndNonWorkingSegments(oCellStartDate, aNonWorkingPeriods);

		// Assert
		assert.strictEqual(aResult.length, 2, "Two items need to be filtered for this hour");
		assert.strictEqual(aResult[0].type, "working", "The type must be defined as working");
		assert.strictEqual(aResult[0].duration, iExpectDuration, "The duration of the period is correct");
		assert.strictEqual(aResult[1].type, "non-working", "The type must be defined as non-working");
		assert.strictEqual(aResult[1].duration, iExpectDuration, "The duration of the period is correct");

		// Act
		// next hour ("01:00")
		oCellStartDate.setHours(oCellStartDate.getHours() + 1);
		aResult = RecurrenceUtils.getWorkingAndNonWorkingSegments(oCellStartDate, aNonWorkingPeriods);

		// Assert
		assert.strictEqual(aResult.length, 2, "Two items need to be filtered for this hour");
		assert.strictEqual(aResult[0].type, "non-working", "The type must be defined as non-working");
		assert.strictEqual(aResult[0].duration, iExpectDuration, "The duration of the period is correct");
		assert.strictEqual(aResult[1].type, "working", "The type must be defined as working");
		assert.strictEqual(aResult[1].duration, iExpectDuration, "The duration of the period is correct");
	});

	QUnit.module("hasOccurrenceOnDate");

	QUnit.test("hasOccurrenceOnDate for a leap year", (assert) => {
		// Prepare
		const oEndDate = UI5Date.getInstance(2025, 11, 2);
		const oRecurrencePeriod = new RecurringNonWorkingPeriod({
			recurrenceType: "Daily",
			recurrenceEndDate: UI5Date.getInstance(2025, 11, 1),
			recurrencePattern: 1,
			date: UI5Date.getInstance(2024, 11 ,30),
			timeRange: new TimeRange({
				start: "1:55",
				end:"2:15",
				valueFormat:"HH:mm"
			})
		});
		const hasOccurrenceOnDate = RecurrenceUtils.hasOccurrenceOnDate.bind(oRecurrencePeriod);
		const oCurrentDate = UI5Date.getInstance(2024, 11 ,29);

		// Assert
		assert.notOk(hasOccurrenceOnDate(oCurrentDate), "It has been correctly determined that there is no non-working period for a date outside the recurring non-working interval");

		// Act
		oCurrentDate.setDate(oCurrentDate.getDate() + 1);

		while (oCurrentDate.getTime() < oEndDate.getTime()) {
			// Assert
			assert.ok(hasOccurrenceOnDate(oCurrentDate), "It has been correctly determined that there is a non-working period for a date within the recurring non-working interval");

			// Act
			oCurrentDate.setDate(oCurrentDate.getDate() + 1);
		}

		// Assert
		assert.notOk(hasOccurrenceOnDate(oCurrentDate), "It has been correctly determined that there is no non-working period for a date outside the recurring non-working interval");
	});

	QUnit.test("Daily with pattern 2 — every other day", function (assert) {
		const oApp = new RecurringCalendarAppointment({
			recurrenceType: "Daily",
			recurrencePattern: 2,
			startDate: UI5Date.getInstance(2025, 0, 1, 9, 0),
			endDate: UI5Date.getInstance(2025, 0, 1, 10, 0)
		});
		const hasOcc = RecurrenceUtils.hasOccurrenceOnDate.bind(oApp);

		assert.ok(hasOcc(UI5Date.getInstance(2025, 0, 1)), "Day 0 matches");
		assert.notOk(hasOcc(UI5Date.getInstance(2025, 0, 2)), "Day 1 no match");
		assert.ok(hasOcc(UI5Date.getInstance(2025, 0, 3)), "Day 2 matches");
		assert.notOk(hasOcc(UI5Date.getInstance(2025, 0, 4)), "Day 3 no match");

		oApp.destroy();
	});

	QUnit.test("Weekly — matches same day of week each week", function (assert) {
		// Jan 6, 2025 = Monday
		const oApp = new RecurringCalendarAppointment({
			recurrenceType: "Weekly",
			recurrencePattern: 1,
			startDate: UI5Date.getInstance(2025, 0, 6, 9, 0),
			endDate: UI5Date.getInstance(2025, 0, 6, 10, 0)
		});
		const hasOcc = RecurrenceUtils.hasOccurrenceOnDate.bind(oApp);

		assert.ok(hasOcc(UI5Date.getInstance(2025, 0, 6)), "Start Monday matches");
		assert.ok(hasOcc(UI5Date.getInstance(2025, 0, 13)), "Next Monday matches");
		assert.notOk(hasOcc(UI5Date.getInstance(2025, 0, 7)), "Tuesday no match");
		assert.notOk(hasOcc(UI5Date.getInstance(2025, 0, 5)), "Before start no match");

		oApp.destroy();
	});

	QUnit.test("Weekly with specific days via RecurrenceRule", function (assert) {
		// Mon=1, Wed=3, Fri=5
		const oApp = new RecurringCalendarAppointment({
			recurrenceType: "Weekly",
			recurrencePattern: 1,
			startDate: UI5Date.getInstance(2025, 0, 6, 9, 0), // Monday
			endDate: UI5Date.getInstance(2025, 0, 6, 10, 0),
			recurrenceRule: new RecurrenceRule({ days: [1, 3, 5] })
		});
		const hasOcc = RecurrenceUtils.hasOccurrenceOnDate.bind(oApp);

		assert.ok(hasOcc(UI5Date.getInstance(2025, 0, 6)), "Mon Jan 6 matches");
		assert.notOk(hasOcc(UI5Date.getInstance(2025, 0, 7)), "Tue no match");
		assert.ok(hasOcc(UI5Date.getInstance(2025, 0, 8)), "Wed Jan 8 matches");
		assert.notOk(hasOcc(UI5Date.getInstance(2025, 0, 9)), "Thu no match");
		assert.ok(hasOcc(UI5Date.getInstance(2025, 0, 10)), "Fri Jan 10 matches");
		assert.notOk(hasOcc(UI5Date.getInstance(2025, 0, 11)), "Sat no match");

		oApp.destroy();
	});

	QUnit.test("Bi-weekly with Mon/Wed/Fri — every 2 weeks", function (assert) {
		// Jan 6 2025 = Monday. Pattern=2 means: week 0 matches, week 1 skips, week 2 matches...
		const oApp = new RecurringCalendarAppointment({
			recurrenceType: "Weekly",
			recurrencePattern: 2,
			startDate: UI5Date.getInstance(2025, 0, 6, 9, 0), // Monday Jan 6
			endDate: UI5Date.getInstance(2025, 0, 6, 10, 0),
			recurrenceRule: new RecurrenceRule({ days: [1, 3, 5] }) // Mon, Wed, Fri
		});
		const hasOcc = RecurrenceUtils.hasOccurrenceOnDate.bind(oApp);

		// Week 0 — all three days should match
		assert.ok(hasOcc(UI5Date.getInstance(2025, 0, 6)),  "Week 0 Mon Jan 6 matches");
		assert.ok(hasOcc(UI5Date.getInstance(2025, 0, 8)),  "Week 0 Wed Jan 8 matches");
		assert.ok(hasOcc(UI5Date.getInstance(2025, 0, 10)), "Week 0 Fri Jan 10 matches");

		// Week 1 — all three days should NOT match
		assert.notOk(hasOcc(UI5Date.getInstance(2025, 0, 13)), "Week 1 Mon Jan 13 no match");
		assert.notOk(hasOcc(UI5Date.getInstance(2025, 0, 15)), "Week 1 Wed Jan 15 no match");
		assert.notOk(hasOcc(UI5Date.getInstance(2025, 0, 17)), "Week 1 Fri Jan 17 no match");

		// Week 2 — all three days should match again
		assert.ok(hasOcc(UI5Date.getInstance(2025, 0, 20)), "Week 2 Mon Jan 20 matches");
		assert.ok(hasOcc(UI5Date.getInstance(2025, 0, 22)), "Week 2 Wed Jan 22 matches");
		assert.ok(hasOcc(UI5Date.getInstance(2025, 0, 24)), "Week 2 Fri Jan 24 matches");

		// Week 3 — skip again
		assert.notOk(hasOcc(UI5Date.getInstance(2025, 0, 27)), "Week 3 Mon Jan 27 no match");
		assert.notOk(hasOcc(UI5Date.getInstance(2025, 0, 29)), "Week 3 Wed Jan 29 no match");
		assert.notOk(hasOcc(UI5Date.getInstance(2025, 0, 31)), "Week 3 Fri Jan 31 no match");

		// Week 4 — matches again
		assert.ok(hasOcc(UI5Date.getInstance(2025, 1, 3)),  "Week 4 Mon Feb 3 matches");
		assert.ok(hasOcc(UI5Date.getInstance(2025, 1, 5)),  "Week 4 Wed Feb 5 matches");
		assert.ok(hasOcc(UI5Date.getInstance(2025, 1, 7)),  "Week 4 Fri Feb 7 matches");

		oApp.destroy();
	});

	QUnit.test("Bi-weekly with Mon/Wed/Fri — getOccurrencesInRange count", function (assert) {
		// 4 weeks (Jan 6 – Feb 2): week 0 (3 days) + week 1 (skip) + week 2 (3 days) + week 3 (skip) = 6 occurrences
		const oApp = new RecurringCalendarAppointment({
			recurrenceType: "Weekly",
			recurrencePattern: 2,
			startDate: UI5Date.getInstance(2025, 0, 6, 9, 0),
			endDate: UI5Date.getInstance(2025, 0, 6, 10, 0),
			recurrenceRule: new RecurrenceRule({ days: [1, 3, 5] })
		});

		const aOccurrences = RecurrenceUtils.getOccurrencesInRange.call(
			oApp,
			UI5Date.getInstance(2025, 0, 6),
			UI5Date.getInstance(2025, 1, 2)
		);

		assert.strictEqual(aOccurrences.length, 6, "2 active weeks × 3 days = 6 occurrences");

		oApp.destroy();
	});

	QUnit.test("Bi-weekly recurrence", function (assert) {
		const oApp = new RecurringCalendarAppointment({
			recurrenceType: "Weekly",
			recurrencePattern: 2,
			startDate: UI5Date.getInstance(2025, 0, 6, 9, 0), // Monday
			endDate: UI5Date.getInstance(2025, 0, 6, 10, 0)
		});
		const hasOcc = RecurrenceUtils.hasOccurrenceOnDate.bind(oApp);

		assert.ok(hasOcc(UI5Date.getInstance(2025, 0, 6)), "Week 0 Mon matches");
		assert.notOk(hasOcc(UI5Date.getInstance(2025, 0, 13)), "Week 1 Mon no match");
		assert.ok(hasOcc(UI5Date.getInstance(2025, 0, 20)), "Week 2 Mon matches");

		oApp.destroy();
	});

	QUnit.test("Bi-weekly Mon/Wed/Fri — start on Friday (non-Monday regression)", function (assert) {
		// Today is Friday March 20, 2026. Appointment starts today, repeats every 2 weeks Mon/Wed/Fri.
		// The current week (week 0): only Fri Mar 20 should match (Mon Mar 16 and Wed Mar 18 are before start).
		// Next week (week 1 — same ISO calendar week + 1): Mon Mar 23, Wed Mar 25, Fri Mar 27 → SKIP week.
		// Week 2 (ISO): Mon Mar 30, Wed Apr 1, Fri Apr 3 → match.
		const oApp = new RecurringCalendarAppointment({
			recurrenceType: "Weekly",
			recurrencePattern: 2,
			startDate: UI5Date.getInstance(2026, 2, 20, 9, 0), // Friday March 20, 2026
			endDate: UI5Date.getInstance(2026, 2, 20, 10, 0),
			recurrenceRule: new RecurrenceRule({ days: [1, 3, 5] }) // Mon=1, Wed=3, Fri=5
		});
		const hasOcc = RecurrenceUtils.hasOccurrenceOnDate.bind(oApp);

		// Week 0 (ISO week of Mar 20): only Fri Mar 20 is on/after start date
		assert.ok(hasOcc(UI5Date.getInstance(2026, 2, 20)), "Fri Mar 20 matches (start day)");

		// Next ISO week (skip week): Mon Mar 23, Wed Mar 25, Fri Mar 27 must NOT match
		assert.notOk(hasOcc(UI5Date.getInstance(2026, 2, 23)), "Mon Mar 23 — skip week, no match");
		assert.notOk(hasOcc(UI5Date.getInstance(2026, 2, 25)), "Wed Mar 25 — skip week, no match");
		assert.notOk(hasOcc(UI5Date.getInstance(2026, 2, 27)), "Fri Mar 27 — skip week, no match");

		// Two ISO weeks later (active week): Mon Mar 30, Wed Apr 1, Fri Apr 3 must match
		assert.ok(hasOcc(UI5Date.getInstance(2026, 2, 30)), "Mon Mar 30 — active week, matches");
		assert.ok(hasOcc(UI5Date.getInstance(2026, 3, 1)),  "Wed Apr 1 — active week, matches");
		assert.ok(hasOcc(UI5Date.getInstance(2026, 3, 3)),  "Fri Apr 3 — active week, matches");

		// Three ISO weeks later (skip week): Mon Apr 6, Wed Apr 8, Fri Apr 10 must NOT match
		assert.notOk(hasOcc(UI5Date.getInstance(2026, 3, 6)),  "Mon Apr 6 — skip week, no match");
		assert.notOk(hasOcc(UI5Date.getInstance(2026, 3, 8)),  "Wed Apr 8 — skip week, no match");
		assert.notOk(hasOcc(UI5Date.getInstance(2026, 3, 10)), "Fri Apr 10 — skip week, no match");

		oApp.destroy();
	});

	QUnit.test("Monthly simple — same day of month", function (assert) {
		const oApp = new RecurringCalendarAppointment({
			recurrenceType: "Monthly",
			recurrencePattern: 1,
			startDate: UI5Date.getInstance(2025, 0, 15, 9, 0),
			endDate: UI5Date.getInstance(2025, 0, 15, 10, 0)
		});
		const hasOcc = RecurrenceUtils.hasOccurrenceOnDate.bind(oApp);

		assert.ok(hasOcc(UI5Date.getInstance(2025, 0, 15)), "Jan 15 matches");
		assert.ok(hasOcc(UI5Date.getInstance(2025, 1, 15)), "Feb 15 matches");
		assert.ok(hasOcc(UI5Date.getInstance(2025, 5, 15)), "Jun 15 matches");
		assert.notOk(hasOcc(UI5Date.getInstance(2025, 0, 14)), "Jan 14 no match");

		oApp.destroy();
	});

	QUnit.test("Monthly DayOfMonth — explicit day", function (assert) {
		const oApp = new RecurringCalendarAppointment({
			recurrenceType: "Monthly",
			recurrencePattern: 1,
			startDate: UI5Date.getInstance(2025, 0, 1, 9, 0),
			endDate: UI5Date.getInstance(2025, 0, 1, 10, 0),
			recurrenceRule: new RecurrenceRule({ type: "DayOfMonth", dayOfMonth: 20 })
		});
		const hasOcc = RecurrenceUtils.hasOccurrenceOnDate.bind(oApp);

		assert.ok(hasOcc(UI5Date.getInstance(2025, 0, 20)), "Jan 20 matches");
		assert.ok(hasOcc(UI5Date.getInstance(2025, 1, 20)), "Feb 20 matches");
		assert.notOk(hasOcc(UI5Date.getInstance(2025, 0, 1)), "Start date no match");

		oApp.destroy();
	});

	QUnit.test("Monthly DayOfMonth — dayOfMonth=0 inherits from startDate", function (assert) {
		const oApp = new RecurringCalendarAppointment({
			recurrenceType: "Monthly",
			recurrencePattern: 1,
			startDate: UI5Date.getInstance(2025, 0, 10, 9, 0),
			endDate: UI5Date.getInstance(2025, 0, 10, 10, 0),
			recurrenceRule: new RecurrenceRule({ type: "DayOfMonth", dayOfMonth: 0 })
		});
		const hasOcc = RecurrenceUtils.hasOccurrenceOnDate.bind(oApp);

		assert.ok(hasOcc(UI5Date.getInstance(2025, 0, 10)), "Falls back to day 10 from startDate");
		assert.ok(hasOcc(UI5Date.getInstance(2025, 1, 10)), "Feb 10 matches");
		assert.notOk(hasOcc(UI5Date.getInstance(2025, 0, 20)), "Day 20 no match");

		oApp.destroy();
	});

	QUnit.test("Monthly DayOfWeek — second Tuesday of each month", function (assert) {
		const oApp = new RecurringCalendarAppointment({
			recurrenceType: "Monthly",
			recurrencePattern: 1,
			startDate: UI5Date.getInstance(2025, 0, 1, 9, 0),
			endDate: UI5Date.getInstance(2025, 0, 1, 10, 0),
			recurrenceRule: new RecurrenceRule({ type: "DayOfWeek", weekOfMonth: "Second", dayOfWeek: 2 })
		});
		const hasOcc = RecurrenceUtils.hasOccurrenceOnDate.bind(oApp);

		// 2nd Tuesday of Jan 2025 = Jan 14
		assert.ok(hasOcc(UI5Date.getInstance(2025, 0, 14)), "Jan 14 = 2nd Tue — matches");
		assert.notOk(hasOcc(UI5Date.getInstance(2025, 0, 7)), "Jan 7 = 1st Tue — no match");
		// 2nd Tuesday of Feb 2025 = Feb 11
		assert.ok(hasOcc(UI5Date.getInstance(2025, 1, 11)), "Feb 11 = 2nd Tue — matches");

		oApp.destroy();
	});

	QUnit.test("Monthly DayOfWeek — last Friday of each month", function (assert) {
		const oApp = new RecurringCalendarAppointment({
			recurrenceType: "Monthly",
			recurrencePattern: 1,
			startDate: UI5Date.getInstance(2025, 0, 1, 9, 0),
			endDate: UI5Date.getInstance(2025, 0, 1, 10, 0),
			recurrenceRule: new RecurrenceRule({ type: "DayOfWeek", weekOfMonth: "Last", dayOfWeek: 5 })
		});
		const hasOcc = RecurrenceUtils.hasOccurrenceOnDate.bind(oApp);

		// Last Friday of Jan 2025 = Jan 31
		assert.ok(hasOcc(UI5Date.getInstance(2025, 0, 31)), "Jan 31 = last Fri — matches");
		assert.notOk(hasOcc(UI5Date.getInstance(2025, 0, 24)), "Jan 24 = not last Fri — no match");
		// Last Friday of Feb 2025 = Feb 28
		assert.ok(hasOcc(UI5Date.getInstance(2025, 1, 28)), "Feb 28 = last Fri — matches");

		oApp.destroy();
	});

	QUnit.test("Monthly with pattern 2 — every other month", function (assert) {
		const oApp = new RecurringCalendarAppointment({
			recurrenceType: "Monthly",
			recurrencePattern: 2,
			startDate: UI5Date.getInstance(2025, 0, 15, 9, 0),
			endDate: UI5Date.getInstance(2025, 0, 15, 10, 0)
		});
		const hasOcc = RecurrenceUtils.hasOccurrenceOnDate.bind(oApp);

		assert.ok(hasOcc(UI5Date.getInstance(2025, 0, 15)), "Jan (month 0) matches");
		assert.notOk(hasOcc(UI5Date.getInstance(2025, 1, 15)), "Feb (month 1) no match");
		assert.ok(hasOcc(UI5Date.getInstance(2025, 2, 15)), "Mar (month 2) matches");
		assert.notOk(hasOcc(UI5Date.getInstance(2025, 3, 15)), "Apr (month 3) no match");

		oApp.destroy();
	});

	QUnit.test("Yearly simple — same month and day", function (assert) {
		const oApp = new RecurringCalendarAppointment({
			recurrenceType: "Yearly",
			recurrencePattern: 1,
			startDate: UI5Date.getInstance(2025, 2, 20, 9, 0),
			endDate: UI5Date.getInstance(2025, 2, 20, 10, 0)
		});
		const hasOcc = RecurrenceUtils.hasOccurrenceOnDate.bind(oApp);

		assert.ok(hasOcc(UI5Date.getInstance(2025, 2, 20)), "2025 Mar 20 matches");
		assert.ok(hasOcc(UI5Date.getInstance(2026, 2, 20)), "2026 Mar 20 matches");
		assert.notOk(hasOcc(UI5Date.getInstance(2025, 2, 21)), "Wrong day no match");
		assert.notOk(hasOcc(UI5Date.getInstance(2025, 3, 20)), "Wrong month no match");

		oApp.destroy();
	});

	QUnit.test("Yearly DayOfMonth — 25th of December each year", function (assert) {
		const oApp = new RecurringCalendarAppointment({
			recurrenceType: "Yearly",
			recurrencePattern: 1,
			startDate: UI5Date.getInstance(2025, 0, 1, 9, 0),
			endDate: UI5Date.getInstance(2025, 0, 1, 10, 0),
			recurrenceRule: new RecurrenceRule({ type: "DayOfMonth", dayOfMonth: 25, month: 11 })
		});
		const hasOcc = RecurrenceUtils.hasOccurrenceOnDate.bind(oApp);

		assert.ok(hasOcc(UI5Date.getInstance(2025, 11, 25)), "Dec 25 2025 matches");
		assert.ok(hasOcc(UI5Date.getInstance(2026, 11, 25)), "Dec 25 2026 matches");
		assert.notOk(hasOcc(UI5Date.getInstance(2025, 11, 24)), "Dec 24 no match");
		assert.notOk(hasOcc(UI5Date.getInstance(2025, 0, 25)), "Jan 25 wrong month no match");

		oApp.destroy();
	});

	QUnit.test("Yearly DayOfWeek — last Friday of December", function (assert) {
		const oApp = new RecurringCalendarAppointment({
			recurrenceType: "Yearly",
			recurrencePattern: 1,
			startDate: UI5Date.getInstance(2025, 0, 1, 9, 0),
			endDate: UI5Date.getInstance(2025, 0, 1, 10, 0),
			recurrenceRule: new RecurrenceRule({ type: "DayOfWeek", weekOfMonth: "Last", dayOfWeek: 5, month: 11 })
		});
		const hasOcc = RecurrenceUtils.hasOccurrenceOnDate.bind(oApp);

		// Last Friday of Dec 2025 = Dec 26
		assert.ok(hasOcc(UI5Date.getInstance(2025, 11, 26)), "Dec 26 2025 = last Fri — matches");
		assert.notOk(hasOcc(UI5Date.getInstance(2025, 11, 19)), "Dec 19 not last Fri — no match");
		assert.notOk(hasOcc(UI5Date.getInstance(2025, 10, 28)), "Wrong month — no match");

		oApp.destroy();
	});

	QUnit.test("Yearly DayOfWeek — first Monday of March (no explicit month set, regression)", function (assert) {
		// Bug: when month is not set on rule (defaults to 0 = January), yearly DayOfWeek recurrence
		// would only ever match in January. Expected: inherit month from start date.
		const oApp = new RecurringCalendarAppointment({
			recurrenceType: "Yearly",
			recurrencePattern: 1,
			startDate: UI5Date.getInstance(2026, 2, 24, 9, 0), // March 24, 2026
			endDate: UI5Date.getInstance(2026, 2, 24, 10, 0),
			recurrenceRule: new RecurrenceRule({ type: "DayOfWeek", weekOfMonth: "First", dayOfWeek: 1 }) // First Monday — no month set
		});
		const hasOcc = RecurrenceUtils.hasOccurrenceOnDate.bind(oApp);

		// First Monday of March 2027 = March 1
		assert.ok(hasOcc(UI5Date.getInstance(2027, 2, 1)), "First Monday of March 2027 matches");
		// First Monday of March 2028 = March 6
		assert.ok(hasOcc(UI5Date.getInstance(2028, 2, 6)), "First Monday of March 2028 matches");
		// Wrong weekday
		assert.notOk(hasOcc(UI5Date.getInstance(2027, 2, 2)), "Tuesday no match");
		// Wrong week order
		assert.notOk(hasOcc(UI5Date.getInstance(2027, 2, 8)), "Second Monday no match");
		// Wrong month (January should not match since start date is March)
		assert.notOk(hasOcc(UI5Date.getInstance(2027, 0, 4)), "January Monday no match");

		oApp.destroy();
	});

	QUnit.test("Yearly with pattern 2 — every other year", function (assert) {
		const oApp = new RecurringCalendarAppointment({
			recurrenceType: "Yearly",
			recurrencePattern: 2,
			startDate: UI5Date.getInstance(2025, 5, 1, 9, 0),
			endDate: UI5Date.getInstance(2025, 5, 1, 10, 0)
		});
		const hasOcc = RecurrenceUtils.hasOccurrenceOnDate.bind(oApp);

		assert.ok(hasOcc(UI5Date.getInstance(2025, 5, 1)), "2025 matches");
		assert.notOk(hasOcc(UI5Date.getInstance(2026, 5, 1)), "2026 no match");
		assert.ok(hasOcc(UI5Date.getInstance(2027, 5, 1)), "2027 matches");

		oApp.destroy();
	});

	QUnit.test("Date before startDate returns false", function (assert) {
		const oApp = new RecurringCalendarAppointment({
			recurrenceType: "Daily",
			recurrencePattern: 1,
			startDate: UI5Date.getInstance(2025, 0, 10, 9, 0),
			endDate: UI5Date.getInstance(2025, 0, 10, 10, 0)
		});
		const hasOcc = RecurrenceUtils.hasOccurrenceOnDate.bind(oApp);

		assert.notOk(hasOcc(UI5Date.getInstance(2025, 0, 9)), "Day before start returns false");
		assert.notOk(hasOcc(UI5Date.getInstance(2024, 11, 31)), "Year before start returns false");

		oApp.destroy();
	});

	QUnit.test("Date after recurrenceEndDate returns false", function (assert) {
		const oApp = new RecurringCalendarAppointment({
			recurrenceType: "Daily",
			recurrencePattern: 1,
			recurrenceEndDate: UI5Date.getInstance(2025, 0, 15),
			startDate: UI5Date.getInstance(2025, 0, 10, 9, 0),
			endDate: UI5Date.getInstance(2025, 0, 10, 10, 0)
		});
		const hasOcc = RecurrenceUtils.hasOccurrenceOnDate.bind(oApp);

		assert.ok(hasOcc(UI5Date.getInstance(2025, 0, 15)), "End date itself matches");
		assert.notOk(hasOcc(UI5Date.getInstance(2025, 0, 16)), "Day after end returns false");

		oApp.destroy();
	});

	QUnit.module("getOccurrencesInRange");

	QUnit.test("Daily occurrences in a one-week range", function (assert) {
		const oApp = new RecurringCalendarAppointment({
			recurrenceType: "Daily",
			recurrencePattern: 1,
			startDate: UI5Date.getInstance(2025, 0, 1, 9, 0),
			endDate: UI5Date.getInstance(2025, 0, 1, 10, 0)
		});

		const aOccurrences = RecurrenceUtils.getOccurrencesInRange.call(
			oApp,
			UI5Date.getInstance(2025, 0, 1),
			UI5Date.getInstance(2025, 0, 7)
		);

		assert.strictEqual(aOccurrences.length, 7, "7 daily occurrences in 7-day range");

		oApp.destroy();
	});

	QUnit.test("Weekly occurrences in a four-week range", function (assert) {
		const oApp = new RecurringCalendarAppointment({
			recurrenceType: "Weekly",
			recurrencePattern: 1,
			startDate: UI5Date.getInstance(2025, 0, 6, 9, 0), // Monday
			endDate: UI5Date.getInstance(2025, 0, 6, 10, 0)
		});

		const aOccurrences = RecurrenceUtils.getOccurrencesInRange.call(
			oApp,
			UI5Date.getInstance(2025, 0, 6),
			UI5Date.getInstance(2025, 1, 2)
		);

		assert.strictEqual(aOccurrences.length, 4, "4 weekly occurrences in ~4-week range");

		oApp.destroy();
	});

	QUnit.test("No occurrences when range is before start", function (assert) {
		const oApp = new RecurringCalendarAppointment({
			recurrenceType: "Daily",
			recurrencePattern: 1,
			startDate: UI5Date.getInstance(2025, 6, 1, 9, 0),
			endDate: UI5Date.getInstance(2025, 6, 1, 10, 0)
		});

		const aOccurrences = RecurrenceUtils.getOccurrencesInRange.call(
			oApp,
			UI5Date.getInstance(2025, 0, 1),
			UI5Date.getInstance(2025, 0, 31)
		);

		assert.strictEqual(aOccurrences.length, 0, "No occurrences when range is before start");

		oApp.destroy();
	});

	QUnit.module("_normalizeRecurrenceDays");

	QUnit.test("Accepts JS-style 0-6 and sorts/deduplicates", function (assert) {
		const aResult = RecurrenceUtils._normalizeRecurrenceDays([1, 2, 0]);
		assert.deepEqual(aResult, [0, 1, 2], "JS 0=Sun, 1=Mon, 2=Tue → sorted [0,1,2]");
	});

	QUnit.test("Removes duplicates", function (assert) {
		const aResult = RecurrenceUtils._normalizeRecurrenceDays([3, 3, 5, 5]);
		assert.deepEqual(aResult, [3, 5], "Duplicates removed");
	});

	QUnit.test("Handles null input", function (assert) {
		const aResult = RecurrenceUtils._normalizeRecurrenceDays(null);
		assert.deepEqual(aResult, [], "null → empty array");
	});

	QUnit.test("Accepts single number", function (assert) {
		const aResult = RecurrenceUtils._normalizeRecurrenceDays(3);
		assert.deepEqual(aResult, [3], "Single number wrapped in array");
	});

	QUnit.module("_matchesWeekOrderInMonth");

	QUnit.test("First Monday of January 2025", function (assert) {
		const oAdvanced = new RecurrenceRule({ type: "DayOfWeek", weekOfMonth: "First", dayOfWeek: 1 });
		// First Monday of Jan 2025 = Jan 6
		assert.ok(
			RecurrenceUtils._matchesWeekOrderInMonth(UI5Date.getInstance(2025, 0, 6), oAdvanced),
			"Jan 6 is 1st Monday"
		);
		assert.notOk(
			RecurrenceUtils._matchesWeekOrderInMonth(UI5Date.getInstance(2025, 0, 13), oAdvanced),
			"Jan 13 is 2nd Monday"
		);
		oAdvanced.destroy();
	});

	QUnit.test("Third and Fourth week order", function (assert) {
		// Jan 2025: Mondays are 6, 13, 20, 27
		const oAdvancedThird = new RecurrenceRule({ type: "DayOfWeek", weekOfMonth: "Third", dayOfWeek: 1 });
		assert.ok(
			RecurrenceUtils._matchesWeekOrderInMonth(UI5Date.getInstance(2025, 0, 20), oAdvancedThird),
			"Jan 20 is 3rd Monday"
		);
		assert.notOk(
			RecurrenceUtils._matchesWeekOrderInMonth(UI5Date.getInstance(2025, 0, 13), oAdvancedThird),
			"Jan 13 is 2nd Monday, not 3rd"
		);

		const oAdvancedFourth = new RecurrenceRule({ type: "DayOfWeek", weekOfMonth: "Fourth", dayOfWeek: 1 });
		assert.ok(
			RecurrenceUtils._matchesWeekOrderInMonth(UI5Date.getInstance(2025, 0, 27), oAdvancedFourth),
			"Jan 27 is 4th Monday"
		);
		assert.notOk(
			RecurrenceUtils._matchesWeekOrderInMonth(UI5Date.getInstance(2025, 0, 20), oAdvancedFourth),
			"Jan 20 is 3rd Monday, not 4th"
		);

		oAdvancedThird.destroy();
		oAdvancedFourth.destroy();
	});

	QUnit.test("Day 1 of month is always First occurrence", function (assert) {
		// Feb 2025 starts on Saturday (day 6)
		const oAdvanced = new RecurrenceRule({ type: "DayOfWeek", weekOfMonth: "First", dayOfWeek: 6 });
		assert.ok(
			RecurrenceUtils._matchesWeekOrderInMonth(UI5Date.getInstance(2025, 1, 1), oAdvanced),
			"Feb 1 (Saturday) is 1st Saturday"
		);
		assert.notOk(
			RecurrenceUtils._matchesWeekOrderInMonth(UI5Date.getInstance(2025, 1, 8), oAdvanced),
			"Feb 8 is 2nd Saturday"
		);
		oAdvanced.destroy();
	});

	QUnit.module("getOccurrencesInRange — additional cases");

	QUnit.test("recurrenceEndDate clips the range", function (assert) {
		// Daily from Jan 1, ends Jan 4 — range Jan 1–Jan 10 → only 4 occurrences
		const oApp = new RecurringCalendarAppointment({
			recurrenceType: "Daily",
			recurrencePattern: 1,
			recurrenceEndDate: UI5Date.getInstance(2025, 0, 4),
			startDate: UI5Date.getInstance(2025, 0, 1, 9, 0),
			endDate: UI5Date.getInstance(2025, 0, 1, 10, 0)
		});

		const aOccurrences = RecurrenceUtils.getOccurrencesInRange.call(
			oApp,
			UI5Date.getInstance(2025, 0, 1),
			UI5Date.getInstance(2025, 0, 10)
		);

		assert.strictEqual(aOccurrences.length, 4, "recurrenceEndDate clips to 4 occurrences (Jan 1–4)");
		oApp.destroy();
	});

	QUnit.test("Weekly with specific days — correct count in range", function (assert) {
		// Mon+Wed+Fri every week, Jan 6–Jan 26 = 3 weeks × 3 days = 9 occurrences
		const oApp = new RecurringCalendarAppointment({
			recurrenceType: "Weekly",
			recurrencePattern: 1,
			startDate: UI5Date.getInstance(2025, 0, 6, 9, 0),
			endDate: UI5Date.getInstance(2025, 0, 6, 10, 0),
			recurrenceRule: new RecurrenceRule({ days: [1, 3, 5] })
		});

		const aOccurrences = RecurrenceUtils.getOccurrencesInRange.call(
			oApp,
			UI5Date.getInstance(2025, 0, 6),
			UI5Date.getInstance(2025, 0, 26)
		);

		assert.strictEqual(aOccurrences.length, 9, "3 weeks × 3 days = 9 occurrences");
		oApp.destroy();
	});

	QUnit.test("Monthly DayOfWeek — getOccurrencesInRange (second Tuesday, 3 months)", function (assert) {
		// Second Tuesday: Jan 14, Feb 11, Mar 11 in 2025
		const oApp = new RecurringCalendarAppointment({
			recurrenceType: "Monthly",
			recurrencePattern: 1,
			startDate: UI5Date.getInstance(2025, 0, 1, 9, 0),
			endDate:   UI5Date.getInstance(2025, 0, 1, 10, 0),
			recurrenceRule: new RecurrenceRule({ type: "DayOfWeek", weekOfMonth: "Second", dayOfWeek: 2 })
		});
		const aOcc = RecurrenceUtils.getOccurrencesInRange.call(
			oApp,
			UI5Date.getInstance(2025, 0,  1),
			UI5Date.getInstance(2025, 2, 31)
		);
		assert.strictEqual(aOcc.length, 3, "One per month: Jan 14, Feb 11, Mar 11");
		assert.strictEqual(aOcc[0].getDate(), 14, "Jan 14 = 2nd Tue");
		assert.strictEqual(aOcc[1].getDate(), 11, "Feb 11 = 2nd Tue");
		assert.strictEqual(aOcc[2].getDate(), 11, "Mar 11 = 2nd Tue");
		oApp.destroy();
	});

	QUnit.test("Monthly DayOfWeek — getOccurrencesInRange (last Friday, 3 months)", function (assert) {
		// Last Friday: Jan 31, Feb 28, Mar 28 in 2025
		const oApp = new RecurringCalendarAppointment({
			recurrenceType: "Monthly",
			recurrencePattern: 1,
			startDate: UI5Date.getInstance(2025, 0, 1, 9, 0),
			endDate:   UI5Date.getInstance(2025, 0, 1, 10, 0),
			recurrenceRule: new RecurrenceRule({ type: "DayOfWeek", weekOfMonth: "Last", dayOfWeek: 5 })
		});
		const aOcc = RecurrenceUtils.getOccurrencesInRange.call(
			oApp,
			UI5Date.getInstance(2025, 0,  1),
			UI5Date.getInstance(2025, 2, 31)
		);
		assert.strictEqual(aOcc.length, 3, "One per month: Jan 31, Feb 28, Mar 28");
		assert.strictEqual(aOcc[0].getDate(), 31, "Jan 31 = last Fri");
		assert.strictEqual(aOcc[1].getDate(), 28, "Feb 28 = last Fri");
		assert.strictEqual(aOcc[2].getDate(), 28, "Mar 28 = last Fri");
		oApp.destroy();
	});

	QUnit.test("Yearly DayOfWeek — getOccurrencesInRange (first Monday of July, 3 years)", function (assert) {
		// First Monday of July: 2025=Jul 7, 2026=Jul 6, 2027=Jul 5
		const oApp = new RecurringCalendarAppointment({
			recurrenceType: "Yearly",
			recurrencePattern: 1,
			startDate: UI5Date.getInstance(2025, 0, 1, 9, 0),
			endDate:   UI5Date.getInstance(2025, 0, 1, 10, 0),
			recurrenceRule: new RecurrenceRule({ type: "DayOfWeek", weekOfMonth: "First", dayOfWeek: 1, month: 6 }) // July
		});
		const aOcc = RecurrenceUtils.getOccurrencesInRange.call(
			oApp,
			UI5Date.getInstance(2025, 0,  1),
			UI5Date.getInstance(2027, 11, 31)
		);
		assert.strictEqual(aOcc.length, 3, "One per year: Jul 2025, 2026, 2027");
		assert.strictEqual(aOcc[0].getMonth(), 6, "First occurrence is in July");
		assert.strictEqual(aOcc[0].getDay(),   1, "First occurrence is a Monday");
		assert.strictEqual(aOcc[1].getMonth(), 6, "Second occurrence is in July");
		assert.strictEqual(aOcc[1].getDay(),   1, "Second occurrence is a Monday");
		oApp.destroy();
	});

	QUnit.test("Range entirely after recurrenceEndDate returns empty", function (assert) {
		const oApp = new RecurringCalendarAppointment({
			recurrenceType: "Daily",
			recurrencePattern: 1,
			recurrenceEndDate: UI5Date.getInstance(2025, 0, 5),
			startDate: UI5Date.getInstance(2025, 0, 1, 9, 0),
			endDate: UI5Date.getInstance(2025, 0, 1, 10, 0)
		});

		const aOccurrences = RecurrenceUtils.getOccurrencesInRange.call(
			oApp,
			UI5Date.getInstance(2025, 1, 1),
			UI5Date.getInstance(2025, 1, 28)
		);

		assert.strictEqual(aOccurrences.length, 0, "No occurrences after recurrenceEndDate");
		oApp.destroy();
	});

	// ─── DAILY edge cases ────────────────────────────────────────────────────

	QUnit.module("Daily — edge cases");

	QUnit.test("Daily — crossing year boundary Dec→Jan", function (assert) {
		const oApp = new RecurringCalendarAppointment({
			recurrenceType: "Daily",
			recurrencePattern: 1,
			startDate: UI5Date.getInstance(2024, 11, 29, 9, 0),
			endDate:   UI5Date.getInstance(2024, 11, 29, 10, 0)
		});
		const hasOcc = RecurrenceUtils.hasOccurrenceOnDate.bind(oApp);

		assert.ok(hasOcc(UI5Date.getInstance(2024, 11, 29)), "Dec 29 matches");
		assert.ok(hasOcc(UI5Date.getInstance(2024, 11, 30)), "Dec 30 matches");
		assert.ok(hasOcc(UI5Date.getInstance(2024, 11, 31)), "Dec 31 matches");
		assert.ok(hasOcc(UI5Date.getInstance(2025,  0,  1)), "Jan 1 matches");
		assert.ok(hasOcc(UI5Date.getInstance(2025,  0,  2)), "Jan 2 matches");

		const aOcc = RecurrenceUtils.getOccurrencesInRange.call(
			oApp,
			UI5Date.getInstance(2024, 11, 29),
			UI5Date.getInstance(2025,  0,  2)
		);
		assert.strictEqual(aOcc.length, 5, "5 occurrences spanning year boundary");
		oApp.destroy();
	});

	QUnit.test("Daily — crossing leap-day Feb 28→Mar 1 in 2024", function (assert) {
		const oApp = new RecurringCalendarAppointment({
			recurrenceType: "Daily",
			recurrencePattern: 1,
			startDate: UI5Date.getInstance(2024, 1, 27, 9, 0),
			endDate:   UI5Date.getInstance(2024, 1, 27, 10, 0)
		});
		const aOcc = RecurrenceUtils.getOccurrencesInRange.call(
			oApp,
			UI5Date.getInstance(2024, 1, 27),
			UI5Date.getInstance(2024, 2,  2)
		);
		// Feb 27, 28, 29 (leap), Mar 1, 2 = 5 dates
		assert.strictEqual(aOcc.length, 5, "Feb 27–Mar 2 in leap year = 5 dates including Feb 29");
		oApp.destroy();
	});

	QUnit.test("Daily — crossing leap-day Feb 28→Mar 1 in non-leap 2025", function (assert) {
		const oApp = new RecurringCalendarAppointment({
			recurrenceType: "Daily",
			recurrencePattern: 1,
			startDate: UI5Date.getInstance(2025, 1, 27, 9, 0),
			endDate:   UI5Date.getInstance(2025, 1, 27, 10, 0)
		});
		const aOcc = RecurrenceUtils.getOccurrencesInRange.call(
			oApp,
			UI5Date.getInstance(2025, 1, 27),
			UI5Date.getInstance(2025, 2,  2)
		);
		// Feb 27, 28, Mar 1, 2 = 4 dates (no Feb 29 in 2025)
		assert.strictEqual(aOcc.length, 4, "Feb 27–Mar 2 in non-leap year = 4 dates, no Feb 29");
		oApp.destroy();
	});

	// ─── WEEKLY edge cases ───────────────────────────────────────────────────

	QUnit.module("Weekly — edge cases");

	QUnit.test("Weekly — Sunday start, no rule days", function (assert) {
		// Jan 5, 2025 = Sunday
		const oApp = new RecurringCalendarAppointment({
			recurrenceType: "Weekly",
			recurrencePattern: 1,
			startDate: UI5Date.getInstance(2025, 0, 5, 9, 0),
			endDate:   UI5Date.getInstance(2025, 0, 5, 10, 0)
		});
		const hasOcc = RecurrenceUtils.hasOccurrenceOnDate.bind(oApp);

		assert.ok(hasOcc(UI5Date.getInstance(2025, 0,  5)), "Sun Jan 5 matches");
		assert.notOk(hasOcc(UI5Date.getInstance(2025, 0,  6)), "Mon Jan 6 no match");
		assert.ok(hasOcc(UI5Date.getInstance(2025, 0, 12)), "Sun Jan 12 matches");
		assert.ok(hasOcc(UI5Date.getInstance(2025, 0, 19)), "Sun Jan 19 matches");
		assert.notOk(hasOcc(UI5Date.getInstance(2025, 0, 18)), "Sat Jan 18 no match");
		oApp.destroy();
	});

	QUnit.test("Weekly — bi-weekly Sunday start", function (assert) {
		// Jan 5, 2025 = Sunday, pattern=2
		const oApp = new RecurringCalendarAppointment({
			recurrenceType: "Weekly",
			recurrencePattern: 2,
			startDate: UI5Date.getInstance(2025, 0, 5, 9, 0),
			endDate:   UI5Date.getInstance(2025, 0, 5, 10, 0)
		});
		const hasOcc = RecurrenceUtils.hasOccurrenceOnDate.bind(oApp);

		assert.ok(hasOcc(UI5Date.getInstance(2025, 0,  5)), "Week 0 Sun Jan 5 matches");
		assert.notOk(hasOcc(UI5Date.getInstance(2025, 0, 12)), "Week 1 Sun Jan 12 skip");
		assert.ok(hasOcc(UI5Date.getInstance(2025, 0, 19)), "Week 2 Sun Jan 19 matches");
		assert.notOk(hasOcc(UI5Date.getInstance(2025, 0, 26)), "Week 3 Sun Jan 26 skip");
		oApp.destroy();
	});

	QUnit.test("Weekly — all 7 days, every day matches", function (assert) {
		const oApp = new RecurringCalendarAppointment({
			recurrenceType: "Weekly",
			recurrencePattern: 1,
			startDate: UI5Date.getInstance(2025, 0, 1, 9, 0), // Wednesday
			endDate:   UI5Date.getInstance(2025, 0, 1, 10, 0),
			recurrenceRule: new RecurrenceRule({ days: [0, 1, 2, 3, 4, 5, 6] })
		});
		const aOcc = RecurrenceUtils.getOccurrencesInRange.call(
			oApp,
			UI5Date.getInstance(2025, 0, 1),
			UI5Date.getInstance(2025, 0, 7)
		);
		assert.strictEqual(aOcc.length, 7, "All 7 days of the week match");
		oApp.destroy();
	});

	QUnit.test("Weekly — range starts mid-skip week, still respects bi-weekly pattern", function (assert) {
		// Start Mon Jan 6. Bi-weekly Mon/Wed/Fri.
		// Range starts Jan 17 (Fri of skip week) — skip week days must not appear.
		const oApp = new RecurringCalendarAppointment({
			recurrenceType: "Weekly",
			recurrencePattern: 2,
			startDate: UI5Date.getInstance(2025, 0, 6, 9, 0),
			endDate:   UI5Date.getInstance(2025, 0, 6, 10, 0),
			recurrenceRule: new RecurrenceRule({ days: [1, 3, 5] })
		});
		const aOcc = RecurrenceUtils.getOccurrencesInRange.call(
			oApp,
			UI5Date.getInstance(2025, 0, 15), // mid skip week
			UI5Date.getInstance(2025, 0, 24)  // end of next active week
		);
		// Active days in range: Jan 20 (Mon), 22 (Wed), 24 (Fri) = 3
		assert.strictEqual(aOcc.length, 3, "Skip week excluded, 3 active days in next active week");
		oApp.destroy();
	});

	// ─── Monthly — start date within first occurrence month ─────────────────

	QUnit.module("Monthly — starts mid-month (user regression: May 4 2026)");

	QUnit.test("Monthly pattern=1 — startDate=May 4, range covers May → occurrence must appear in May", function (assert) {
		const oApp = new RecurringCalendarAppointment({
			recurrenceType: "Monthly",
			recurrencePattern: 1,
			recurrenceEndDate: UI5Date.getInstance(2026, 11, 31),
			startDate: UI5Date.getInstance(2026, 4, 4, 9, 0),
			endDate:   UI5Date.getInstance(2026, 4, 4, 10, 0)
		});
		const hasOcc = RecurrenceUtils.hasOccurrenceOnDate.bind(oApp);

		assert.ok(hasOcc(UI5Date.getInstance(2026, 4, 4)),  "May 4 matches (start day)");
		assert.ok(hasOcc(UI5Date.getInstance(2026, 5, 4)),  "Jun 4 matches");
		assert.ok(hasOcc(UI5Date.getInstance(2026, 6, 4)),  "Jul 4 matches");
		assert.ok(hasOcc(UI5Date.getInstance(2026, 7, 4)),  "Aug 4 matches");
		assert.ok(hasOcc(UI5Date.getInstance(2026, 11, 4)), "Dec 4 matches");
		assert.notOk(hasOcc(UI5Date.getInstance(2026, 4, 3)),  "May 3 no match");
		assert.notOk(hasOcc(UI5Date.getInstance(2026, 4, 5)),  "May 5 no match");
		assert.notOk(hasOcc(UI5Date.getInstance(2027, 0, 4)),  "Jan 2027 after recurrenceEndDate — no match");

		// Range starts before appointment: May 1 – May 31
		const aOccMay = RecurrenceUtils.getOccurrencesInRange.call(
			oApp,
			UI5Date.getInstance(2026, 4, 1),
			UI5Date.getInstance(2026, 4, 30)
		);
		assert.strictEqual(aOccMay.length, 1, "Range May 1–30: exactly 1 occurrence");
		assert.strictEqual(aOccMay[0].getDate(), 4, "Occurrence is on May 4");

		// Range June: 1 occurrence
		const aOccJun = RecurrenceUtils.getOccurrencesInRange.call(
			oApp,
			UI5Date.getInstance(2026, 5, 1),
			UI5Date.getInstance(2026, 5, 30)
		);
		assert.strictEqual(aOccJun.length, 1, "Range June: exactly 1 occurrence");
		assert.strictEqual(aOccJun[0].getDate(), 4, "June occurrence on 4th");

		// Full range May–Dec: 8 occurrences (May–Dec each on 4th)
		const aOccFull = RecurrenceUtils.getOccurrencesInRange.call(
			oApp,
			UI5Date.getInstance(2026, 4, 1),
			UI5Date.getInstance(2026, 11, 31)
		);
		assert.strictEqual(aOccFull.length, 8, "Full range May-Dec: 8 occurrences");
		assert.strictEqual(aOccFull[0].getMonth(), 4,  "1st occurrence in May");
		assert.strictEqual(aOccFull[0].getDate(),  4,  "1st occurrence on 4th");
		assert.strictEqual(aOccFull[7].getMonth(), 11, "8th occurrence in December");
		assert.strictEqual(aOccFull[7].getDate(),  4,  "8th occurrence on 4th");

		oApp.destroy();
	});

	QUnit.test("Monthly pattern=1 — startDate=May 4, explicit DayOfMonth=4 rule, same behaviour", function (assert) {
		const oApp = new RecurringCalendarAppointment({
			recurrenceType: "Monthly",
			recurrencePattern: 1,
			recurrenceEndDate: UI5Date.getInstance(2026, 11, 31),
			startDate: UI5Date.getInstance(2026, 4, 4, 9, 0),
			endDate:   UI5Date.getInstance(2026, 4, 4, 10, 0),
			recurrenceRule: new RecurrenceRule({ type: "DayOfMonth", dayOfMonth: 4 })
		});
		const hasOcc = RecurrenceUtils.hasOccurrenceOnDate.bind(oApp);

		assert.ok(hasOcc(UI5Date.getInstance(2026, 4, 4)),  "May 4 matches");
		assert.ok(hasOcc(UI5Date.getInstance(2026, 5, 4)),  "Jun 4 matches");
		assert.ok(hasOcc(UI5Date.getInstance(2026, 7, 4)),  "Aug 4 matches");
		assert.ok(hasOcc(UI5Date.getInstance(2026, 11, 4)), "Dec 4 matches");
		assert.notOk(hasOcc(UI5Date.getInstance(2026, 4, 5)), "May 5 no match");

		const aOccMay = RecurrenceUtils.getOccurrencesInRange.call(
			oApp,
			UI5Date.getInstance(2026, 4, 1),
			UI5Date.getInstance(2026, 4, 30)
		);
		assert.strictEqual(aOccMay.length, 1, "May: 1 occurrence on 4th");
		assert.strictEqual(aOccMay[0].getDate(), 4, "May occurrence on 4th");

		const aOccFull = RecurrenceUtils.getOccurrencesInRange.call(
			oApp,
			UI5Date.getInstance(2026, 4, 1),
			UI5Date.getInstance(2026, 11, 31)
		);
		assert.strictEqual(aOccFull.length, 8, "Full range May–Dec: 8 occurrences");

		oApp.destroy();
	});

	QUnit.test("Monthly pattern=3 — every 3 months from May 4 2026 (no explicit rule)", function (assert) {
		// Occurrences: May 4, Aug 4, Nov 4 — 3 total until Dec 31 2026
		const oApp = new RecurringCalendarAppointment({
			recurrenceType: "Monthly",
			recurrencePattern: 3,
			recurrenceEndDate: UI5Date.getInstance(2026, 11, 31),
			startDate: UI5Date.getInstance(2026, 4, 4, 9, 0),
			endDate:   UI5Date.getInstance(2026, 4, 4, 10, 0)
		});
		const hasOcc = RecurrenceUtils.hasOccurrenceOnDate.bind(oApp);

		assert.ok(hasOcc(UI5Date.getInstance(2026, 4, 4)),   "May 4 matches (start)");
		assert.notOk(hasOcc(UI5Date.getInstance(2026, 5, 4)), "Jun 4 — skipped month, no match");
		assert.notOk(hasOcc(UI5Date.getInstance(2026, 6, 4)), "Jul 4 — skipped month, no match");
		assert.ok(hasOcc(UI5Date.getInstance(2026, 7, 4)),   "Aug 4 matches (+3 months)");
		assert.notOk(hasOcc(UI5Date.getInstance(2026, 8, 4)), "Sep 4 — skipped month, no match");
		assert.notOk(hasOcc(UI5Date.getInstance(2026, 9, 4)), "Oct 4 — skipped month, no match");
		assert.ok(hasOcc(UI5Date.getInstance(2026, 10, 4)),  "Nov 4 matches (+6 months)");
		assert.notOk(hasOcc(UI5Date.getInstance(2026, 11, 4)), "Dec 4 — skipped month, no match");

		// May: 1 occurrence
		const aOccMay = RecurrenceUtils.getOccurrencesInRange.call(
			oApp,
			UI5Date.getInstance(2026, 4, 1),
			UI5Date.getInstance(2026, 4, 30)
		);
		assert.strictEqual(aOccMay.length, 1, "May: 1 occurrence (May 4)");

		// Jun: 0 occurrences
		const aOccJun = RecurrenceUtils.getOccurrencesInRange.call(
			oApp,
			UI5Date.getInstance(2026, 5, 1),
			UI5Date.getInstance(2026, 5, 30)
		);
		assert.strictEqual(aOccJun.length, 0, "June: 0 occurrences (skipped)");

		// Aug: 1 occurrence
		const aOccAug = RecurrenceUtils.getOccurrencesInRange.call(
			oApp,
			UI5Date.getInstance(2026, 7, 1),
			UI5Date.getInstance(2026, 7, 31)
		);
		assert.strictEqual(aOccAug.length, 1, "August: 1 occurrence (Aug 4)");
		assert.strictEqual(aOccAug[0].getDate(), 4, "August occurrence on 4th");

		// Full range May–Dec: 3 occurrences
		const aOccFull = RecurrenceUtils.getOccurrencesInRange.call(
			oApp,
			UI5Date.getInstance(2026, 4, 1),
			UI5Date.getInstance(2026, 11, 31)
		);
		assert.strictEqual(aOccFull.length, 3, "Full range: 3 occurrences (May, Aug, Nov)");
		assert.strictEqual(aOccFull[0].getMonth(), 4,  "1st: May");
		assert.strictEqual(aOccFull[0].getDate(),  4,  "1st: 4th");
		assert.strictEqual(aOccFull[1].getMonth(), 7,  "2nd: August");
		assert.strictEqual(aOccFull[1].getDate(),  4,  "2nd: 4th");
		assert.strictEqual(aOccFull[2].getMonth(), 10, "3rd: November");
		assert.strictEqual(aOccFull[2].getDate(),  4,  "3rd: 4th");

		oApp.destroy();
	});

	QUnit.test("Monthly pattern=3, DayOfMonth=10 — startDate May 4 (dayOfMonth ≠ start day)", function (assert) {
		const oApp = new RecurringCalendarAppointment({
			recurrenceType: "Monthly",
			recurrencePattern: 3,
			recurrenceEndDate: UI5Date.getInstance(2026, 11, 31),
			startDate: UI5Date.getInstance(2026, 4, 4, 14, 0),
			endDate:   UI5Date.getInstance(2026, 4, 4, 15, 0),
			recurrenceRule: new RecurrenceRule({ type: "DayOfMonth", dayOfMonth: 10 })
		});
		const hasOcc = RecurrenceUtils.hasOccurrenceOnDate.bind(oApp);

		// Valid occurrences: May 10, Aug 10, Nov 10
		assert.ok(hasOcc(UI5Date.getInstance(2026, 4, 10)),  "May 10 matches");
		assert.ok(hasOcc(UI5Date.getInstance(2026, 7, 10)),  "Aug 10 matches");
		assert.ok(hasOcc(UI5Date.getInstance(2026, 10, 10)), "Nov 10 matches");

		// Start date itself and adjacent days must NOT match
		assert.notOk(hasOcc(UI5Date.getInstance(2026, 4, 4)),  "May 4 (start date) no match");
		assert.notOk(hasOcc(UI5Date.getInstance(2026, 5, 10)), "Jun 10 — skipped month, no match");
		assert.notOk(hasOcc(UI5Date.getInstance(2026, 6, 10)), "Jul 10 — skipped month, no match");
		assert.notOk(hasOcc(UI5Date.getInstance(2026, 11, 10)), "Dec 10 — skipped month, no match");

		// Range = May 1–31: must find May 10 (this was the reported bug — no occurrence in May)
		const aOccMay = RecurrenceUtils.getOccurrencesInRange.call(
			oApp,
			UI5Date.getInstance(2026, 4, 1),
			UI5Date.getInstance(2026, 4, 31)
		);
		assert.strictEqual(aOccMay.length, 1, "May: 1 occurrence (May 10)");
		assert.strictEqual(aOccMay[0].getDate(), 10, "May occurrence on 10th");

		// Range = June: 0 occurrences (skipped)
		const aOccJun = RecurrenceUtils.getOccurrencesInRange.call(
			oApp,
			UI5Date.getInstance(2026, 5, 1),
			UI5Date.getInstance(2026, 5, 30)
		);
		assert.strictEqual(aOccJun.length, 0, "June: 0 occurrences (skipped month)");

		// Range = August: 1 occurrence on 10th
		const aOccAug = RecurrenceUtils.getOccurrencesInRange.call(
			oApp,
			UI5Date.getInstance(2026, 7, 1),
			UI5Date.getInstance(2026, 7, 31)
		);
		assert.strictEqual(aOccAug.length, 1, "August: 1 occurrence");
		assert.strictEqual(aOccAug[0].getDate(), 10, "August occurrence on 10th");

		// Full range May–Dec: 3 occurrences (May 10, Aug 10, Nov 10)
		const aOccFull = RecurrenceUtils.getOccurrencesInRange.call(
			oApp,
			UI5Date.getInstance(2026, 4, 1),
			UI5Date.getInstance(2026, 11, 31)
		);
		assert.strictEqual(aOccFull.length, 3, "Full range May–Dec: 3 occurrences");
		assert.strictEqual(aOccFull[0].getMonth(), 4,  "1st: May");
		assert.strictEqual(aOccFull[0].getDate(),  10, "1st: 10th");
		assert.strictEqual(aOccFull[1].getMonth(), 7,  "2nd: August");
		assert.strictEqual(aOccFull[1].getDate(),  10, "2nd: 10th");
		assert.strictEqual(aOccFull[2].getMonth(), 10, "3rd: November");
		assert.strictEqual(aOccFull[2].getDate(),  10, "3rd: 10th");

		oApp.destroy();
	});

	QUnit.test("Monthly pattern=3, DayOfMonth=10 — narrow weekly ranges must not skip occurrences", function (assert) {
		const oApp = new RecurringCalendarAppointment({
			recurrenceType: "Monthly",
			recurrencePattern: 3,
			recurrenceEndDate: UI5Date.getInstance(2026, 11, 31),
			startDate: UI5Date.getInstance(2026, 4, 4, 14, 0),
			endDate:   UI5Date.getInstance(2026, 4, 4, 15, 0),
			recurrenceRule: new RecurrenceRule({ type: "DayOfMonth", dayOfMonth: 10 })
		});

		// Range July 27–Aug 2 (week before Aug 10): no occurrence expected
		const aOccJuly27 = RecurrenceUtils.getOccurrencesInRange.call(
			oApp,
			UI5Date.getInstance(2026, 6, 27),
			UI5Date.getInstance(2026, 7, 2)
		);
		assert.strictEqual(aOccJuly27.length, 0, "July 27-Aug 2: no occurrence (Aug 10 is outside range)");

		// Range July 1–Aug 31 (wider range spanning the gap): Aug 10 must be found
		const aOccJulAug = RecurrenceUtils.getOccurrencesInRange.call(
			oApp,
			UI5Date.getInstance(2026, 6, 1),
			UI5Date.getInstance(2026, 7, 31)
		);
		assert.strictEqual(aOccJulAug.length, 1, "July 1-Aug 31: 1 occurrence");
		assert.strictEqual(aOccJulAug[0].getMonth(), 7,  "occurrence in August");
		assert.strictEqual(aOccJulAug[0].getDate(),  10, "occurrence on 10th");

		// Range Aug 10–16 (week containing Aug 10): must find Aug 10
		const aOccAug10 = RecurrenceUtils.getOccurrencesInRange.call(
			oApp,
			UI5Date.getInstance(2026, 7, 10),
			UI5Date.getInstance(2026, 7, 16)
		);
		assert.strictEqual(aOccAug10.length, 1, "Aug 10-16: 1 occurrence");
		assert.strictEqual(aOccAug10[0].getDate(), 10, "occurrence on 10th");

		// Range Sep 1–Oct 31 (gap between Aug 10 and Nov 10): no occurrence
		const aOccSepOct = RecurrenceUtils.getOccurrencesInRange.call(
			oApp,
			UI5Date.getInstance(2026, 8, 1),
			UI5Date.getInstance(2026, 9, 31)
		);
		assert.strictEqual(aOccSepOct.length, 0, "Sep-Oct: no occurrence");

		// Range Oct 27–Nov 2 (week before Nov 10): no occurrence
		const aOccOct27 = RecurrenceUtils.getOccurrencesInRange.call(
			oApp,
			UI5Date.getInstance(2026, 9, 27),
			UI5Date.getInstance(2026, 10, 2)
		);
		assert.strictEqual(aOccOct27.length, 0, "Oct 27-Nov 2: no occurrence (Nov 10 is outside range)");

		// Range Nov 9–15 (week containing Nov 10): must find Nov 10
		const aOccNov10 = RecurrenceUtils.getOccurrencesInRange.call(
			oApp,
			UI5Date.getInstance(2026, 10, 9),
			UI5Date.getInstance(2026, 10, 15)
		);
		assert.strictEqual(aOccNov10.length, 1, "Nov 9-15: 1 occurrence");
		assert.strictEqual(aOccNov10[0].getDate(), 10, "occurrence on 10th");

		oApp.destroy();
	});

	QUnit.test("Monthly pattern=3 — explicit DayOfMonth=4, every 3 months from May 4 2026", function (assert) {
		const oApp = new RecurringCalendarAppointment({
			recurrenceType: "Monthly",
			recurrencePattern: 3,
			recurrenceEndDate: UI5Date.getInstance(2026, 11, 31),
			startDate: UI5Date.getInstance(2026, 4, 4, 9, 0),
			endDate:   UI5Date.getInstance(2026, 4, 4, 10, 0),
			recurrenceRule: new RecurrenceRule({ type: "DayOfMonth", dayOfMonth: 4 })
		});
		const hasOcc = RecurrenceUtils.hasOccurrenceOnDate.bind(oApp);

		assert.ok(hasOcc(UI5Date.getInstance(2026, 4, 4)),   "May 4 matches");
		assert.notOk(hasOcc(UI5Date.getInstance(2026, 5, 4)), "Jun 4 no match");
		assert.notOk(hasOcc(UI5Date.getInstance(2026, 6, 4)), "Jul 4 no match");
		assert.ok(hasOcc(UI5Date.getInstance(2026, 7, 4)),   "Aug 4 matches");
		assert.notOk(hasOcc(UI5Date.getInstance(2026, 8, 4)), "Sep 4 no match");
		assert.notOk(hasOcc(UI5Date.getInstance(2026, 9, 4)), "Oct 4 no match");
		assert.ok(hasOcc(UI5Date.getInstance(2026, 10, 4)),  "Nov 4 matches");
		assert.notOk(hasOcc(UI5Date.getInstance(2026, 11, 4)), "Dec 4 no match");

		const aOccFull = RecurrenceUtils.getOccurrencesInRange.call(
			oApp,
			UI5Date.getInstance(2026, 4, 1),
			UI5Date.getInstance(2026, 11, 31)
		);
		assert.strictEqual(aOccFull.length, 3, "3 occurrences: May 4, Aug 4, Nov 4");
		assert.strictEqual(aOccFull[0].getMonth(), 4,  "1st: May");
		assert.strictEqual(aOccFull[1].getMonth(), 7,  "2nd: August");
		assert.strictEqual(aOccFull[2].getMonth(), 10, "3rd: November");

		oApp.destroy();
	});

	// ─── MONTHLY edge cases ──────────────────────────────────────────────────

	QUnit.module("Monthly — edge cases");

	QUnit.test("Monthly day 31 — skips months with fewer than 31 days", function (assert) {
		const oApp = new RecurringCalendarAppointment({
			recurrenceType: "Monthly",
			recurrencePattern: 1,
			startDate: UI5Date.getInstance(2025, 0, 31, 9, 0),
			endDate:   UI5Date.getInstance(2025, 0, 31, 10, 0),
			recurrenceRule: new RecurrenceRule({ type: "DayOfMonth", dayOfMonth: 31 })
		});
		const hasOcc = RecurrenceUtils.hasOccurrenceOnDate.bind(oApp);

		// Months with 31 days in 2025
		assert.ok(hasOcc(UI5Date.getInstance(2025, 0, 31)), "Jan 31 matches");
		assert.ok(hasOcc(UI5Date.getInstance(2025, 2, 31)), "Mar 31 matches");
		assert.ok(hasOcc(UI5Date.getInstance(2025, 4, 31)), "May 31 matches");
		assert.ok(hasOcc(UI5Date.getInstance(2025, 6, 31)), "Jul 31 matches");
		assert.ok(hasOcc(UI5Date.getInstance(2025, 7, 31)), "Aug 31 matches");
		assert.ok(hasOcc(UI5Date.getInstance(2025, 9, 31)), "Oct 31 matches");
		assert.ok(hasOcc(UI5Date.getInstance(2025, 11, 31)), "Dec 31 matches");

		// Months with 30 days — day 31 does not exist
		assert.notOk(hasOcc(UI5Date.getInstance(2025,  3, 30)), "Apr 30 no match (rule=31, not 30)");
		assert.notOk(hasOcc(UI5Date.getInstance(2025,  5, 30)), "Jun 30 no match");
		assert.notOk(hasOcc(UI5Date.getInstance(2025,  8, 30)), "Sep 30 no match");
		assert.notOk(hasOcc(UI5Date.getInstance(2025, 10, 30)), "Nov 30 no match");

		// Feb — neither 28 nor 29 should match rule=31
		assert.notOk(hasOcc(UI5Date.getInstance(2025, 1, 28)), "Feb 28 no match (non-leap)");

		oApp.destroy();
	});

	QUnit.test("Monthly day 31 — getOccurrencesInRange returns only valid months", function (assert) {
		const oApp = new RecurringCalendarAppointment({
			recurrenceType: "Monthly",
			recurrencePattern: 1,
			startDate: UI5Date.getInstance(2025, 0, 31, 9, 0),
			endDate:   UI5Date.getInstance(2025, 0, 31, 10, 0),
			recurrenceRule: new RecurrenceRule({ type: "DayOfMonth", dayOfMonth: 31 })
		});
		const aOcc = RecurrenceUtils.getOccurrencesInRange.call(
			oApp,
			UI5Date.getInstance(2025, 0,  1),
			UI5Date.getInstance(2025, 11, 31)
		);
		// 7 months have 31 days: Jan, Mar, May, Jul, Aug, Oct, Dec
		assert.strictEqual(aOcc.length, 7, "Only 7 months with 31 days match in a full year");
		oApp.destroy();
	});

	QUnit.test("Monthly day 29 — matches Feb 29 in leap year, skips in non-leap", function (assert) {
		const oApp = new RecurringCalendarAppointment({
			recurrenceType: "Monthly",
			recurrencePattern: 1,
			startDate: UI5Date.getInstance(2024, 0, 29, 9, 0),
			endDate:   UI5Date.getInstance(2024, 0, 29, 10, 0),
			recurrenceRule: new RecurrenceRule({ type: "DayOfMonth", dayOfMonth: 29 })
		});
		const hasOcc = RecurrenceUtils.hasOccurrenceOnDate.bind(oApp);

		assert.ok(hasOcc(UI5Date.getInstance(2024, 1, 29)), "Feb 29, 2024 (leap) matches");
		assert.notOk(hasOcc(UI5Date.getInstance(2025, 1, 28)), "Feb 28, 2025 (non-leap) no match");
		assert.ok(hasOcc(UI5Date.getInstance(2025, 0, 29)), "Jan 29, 2025 matches");
		assert.ok(hasOcc(UI5Date.getInstance(2025, 2, 29)), "Mar 29, 2025 matches");

		oApp.destroy();
	});

	QUnit.test("Monthly day 29 — getOccurrencesInRange: leap year has Feb, non-leap skips Feb", function (assert) {
		const oApp = new RecurringCalendarAppointment({
			recurrenceType: "Monthly",
			recurrencePattern: 1,
			startDate: UI5Date.getInstance(2024, 0, 29, 9, 0),
			endDate:   UI5Date.getInstance(2024, 0, 29, 10, 0),
			recurrenceRule: new RecurrenceRule({ type: "DayOfMonth", dayOfMonth: 29 })
		});

		// Leap year 2024: all 12 months have a 29th (Feb 29 exists)
		const aOcc2024 = RecurrenceUtils.getOccurrencesInRange.call(
			oApp,
			UI5Date.getInstance(2024, 0,  1),
			UI5Date.getInstance(2024, 11, 31)
		);
		assert.strictEqual(aOcc2024.length, 12, "2024 (leap year): all 12 months include the 29th");

		// Non-leap year 2025: 11 months match (Feb 29 doesn't exist)
		const aOcc2025 = RecurrenceUtils.getOccurrencesInRange.call(
			oApp,
			UI5Date.getInstance(2025, 0,  1),
			UI5Date.getInstance(2025, 11, 31)
		);
		assert.strictEqual(aOcc2025.length, 11, "2025 (non-leap year): 11 months, Feb 29 skipped");

		oApp.destroy();
	});

	QUnit.test("Monthly DayOfWeek Last — month with 5 occurrences of that weekday", function (assert) {
		// January 2025: Wednesdays are 1, 8, 15, 22, 29 → 5 Wednesdays, last = 29
		const oApp = new RecurringCalendarAppointment({
			recurrenceType: "Monthly",
			recurrencePattern: 1,
			startDate: UI5Date.getInstance(2025, 0, 1, 9, 0),
			endDate:   UI5Date.getInstance(2025, 0, 1, 10, 0),
			recurrenceRule: new RecurrenceRule({ type: "DayOfWeek", weekOfMonth: "Last", dayOfWeek: 3 })
		});
		const hasOcc = RecurrenceUtils.hasOccurrenceOnDate.bind(oApp);

		assert.ok(hasOcc(UI5Date.getInstance(2025, 0, 29)), "Jan 29 = 5th (last) Wed — matches");
		assert.notOk(hasOcc(UI5Date.getInstance(2025, 0, 22)), "Jan 22 = 4th Wed — no match");

		// March 2025: Wednesdays are 5, 12, 19, 26 → 4 Wednesdays, last = 26
		assert.ok(hasOcc(UI5Date.getInstance(2025, 2, 26)), "Mar 26 = 4th (last) Wed — matches");
		assert.notOk(hasOcc(UI5Date.getInstance(2025, 2, 19)), "Mar 19 = 3rd Wed — no match");

		oApp.destroy();
	});

	QUnit.test("Monthly DayOfWeek Fourth — Feb 2025 has exactly 4 Mondays", function (assert) {
		// Feb 2025 Mondays: 3, 10, 17, 24 → 4th Monday = Feb 24
		const oApp = new RecurringCalendarAppointment({
			recurrenceType: "Monthly",
			recurrencePattern: 1,
			startDate: UI5Date.getInstance(2025, 0, 1, 9, 0),
			endDate:   UI5Date.getInstance(2025, 0, 1, 10, 0),
			recurrenceRule: new RecurrenceRule({ type: "DayOfWeek", weekOfMonth: "Fourth", dayOfWeek: 1 })
		});
		const hasOcc = RecurrenceUtils.hasOccurrenceOnDate.bind(oApp);

		assert.ok(hasOcc(UI5Date.getInstance(2025, 1, 24)), "Feb 24 = 4th Mon — matches");
		assert.notOk(hasOcc(UI5Date.getInstance(2025, 1, 17)), "Feb 17 = 3rd Mon — no match");

		oApp.destroy();
	});

	// ─── YEARLY edge cases ───────────────────────────────────────────────────

	QUnit.module("Yearly — edge cases");

	QUnit.test("Yearly Feb 29 — matches only in leap years", function (assert) {
		const oApp = new RecurringCalendarAppointment({
			recurrenceType: "Yearly",
			recurrencePattern: 1,
			startDate: UI5Date.getInstance(2024, 1, 29, 9, 0), // Feb 29, 2024 (leap)
			endDate:   UI5Date.getInstance(2024, 1, 29, 10, 0)
		});
		const hasOcc = RecurrenceUtils.hasOccurrenceOnDate.bind(oApp);

		// Leap years
		assert.ok(hasOcc(UI5Date.getInstance(2024, 1, 29)), "2024 Feb 29 (start) matches");
		assert.ok(hasOcc(UI5Date.getInstance(2028, 1, 29)), "2028 Feb 29 (leap) matches");

		// Non-leap years — Feb 28 and Feb 29 must NOT match
		assert.notOk(hasOcc(UI5Date.getInstance(2025, 1, 28)), "2025 Feb 28 (non-leap) no match");
		assert.notOk(hasOcc(UI5Date.getInstance(2026, 1, 28)), "2026 Feb 28 (non-leap) no match");
		assert.notOk(hasOcc(UI5Date.getInstance(2027, 1, 28)), "2027 Feb 28 (non-leap) no match");

		oApp.destroy();
	});

	QUnit.test("Yearly DayOfMonth — Feb 29 with explicit rule (leap years only)", function (assert) {
		const oApp = new RecurringCalendarAppointment({
			recurrenceType: "Yearly",
			recurrencePattern: 1,
			startDate: UI5Date.getInstance(2024, 0, 1, 9, 0),
			endDate:   UI5Date.getInstance(2024, 0, 1, 10, 0),
			recurrenceRule: new RecurrenceRule({ type: "DayOfMonth", dayOfMonth: 29, month: 1 }) // Feb 29
		});
		const hasOcc = RecurrenceUtils.hasOccurrenceOnDate.bind(oApp);

		assert.ok(hasOcc(UI5Date.getInstance(2024, 1, 29)), "2024 Feb 29 matches");
		assert.notOk(hasOcc(UI5Date.getInstance(2025, 1, 28)), "2025 Feb 28 — day 29 doesn't exist, no match");
		assert.ok(hasOcc(UI5Date.getInstance(2028, 1, 29)), "2028 Feb 29 matches");

		oApp.destroy();
	});

	QUnit.test("Yearly DayOfWeek — first Monday of March across multiple years", function (assert) {
		// Verify _matchesWeekOrderInMonth is correct for different year structures
		// Mar 2025: first Mon = Mar 3
		// Mar 2026: first Mon = Mar 2
		// Mar 2027: first Mon = Mar 1
		const oApp = new RecurringCalendarAppointment({
			recurrenceType: "Yearly",
			recurrencePattern: 1,
			startDate: UI5Date.getInstance(2025, 2, 3, 9, 0),
			endDate:   UI5Date.getInstance(2025, 2, 3, 10, 0),
			recurrenceRule: new RecurrenceRule({ type: "DayOfWeek", weekOfMonth: "First", dayOfWeek: 1, month: 2 }) // March
		});
		const hasOcc = RecurrenceUtils.hasOccurrenceOnDate.bind(oApp);

		assert.ok(hasOcc(UI5Date.getInstance(2025, 2,  3)), "2025 Mar 3 = 1st Mon — matches");
		assert.notOk(hasOcc(UI5Date.getInstance(2025, 2, 10)), "2025 Mar 10 = 2nd Mon — no match");
		assert.ok(hasOcc(UI5Date.getInstance(2026, 2,  2)), "2026 Mar 2 = 1st Mon — matches");
		assert.ok(hasOcc(UI5Date.getInstance(2027, 2,  1)), "2027 Mar 1 = 1st Mon — matches");
		assert.notOk(hasOcc(UI5Date.getInstance(2026, 2,  9)), "2026 Mar 9 = 2nd Mon — no match");

		oApp.destroy();
	});

	QUnit.test("Yearly DayOfWeek — last Friday of December across leap/non-leap years", function (assert) {
		// Dec 2024: last Fri = Dec 27
		// Dec 2025: last Fri = Dec 26
		// Dec 2028: last Fri = Dec 29 (leap year, but Dec has 31 days regardless)
		const oApp = new RecurringCalendarAppointment({
			recurrenceType: "Yearly",
			recurrencePattern: 1,
			startDate: UI5Date.getInstance(2024, 0, 1, 9, 0),
			endDate:   UI5Date.getInstance(2024, 0, 1, 10, 0),
			recurrenceRule: new RecurrenceRule({ type: "DayOfWeek", weekOfMonth: "Last", dayOfWeek: 5, month: 11 }) // Dec
		});
		const hasOcc = RecurrenceUtils.hasOccurrenceOnDate.bind(oApp);

		assert.ok(hasOcc(UI5Date.getInstance(2024, 11, 27)), "2024 Dec 27 = last Fri — matches");
		assert.ok(hasOcc(UI5Date.getInstance(2025, 11, 26)), "2025 Dec 26 = last Fri — matches");
		assert.notOk(hasOcc(UI5Date.getInstance(2024, 11, 20)), "2024 Dec 20 = not last Fri — no match");
		assert.notOk(hasOcc(UI5Date.getInstance(2024, 10, 29)), "2024 Nov 29 = wrong month — no match");

		oApp.destroy();
	});

	// ─── getOccurrencesInRange — additional edge cases ────────────────────────

	QUnit.module("getOccurrencesInRange — additional edge cases");

	QUnit.test("Monthly — range starting after first occurrence", function (assert) {
		// Monthly day 15. Start Jan 15. Range Feb–Apr — Jan 15 must NOT appear.
		const oApp = new RecurringCalendarAppointment({
			recurrenceType: "Monthly",
			recurrencePattern: 1,
			startDate: UI5Date.getInstance(2025, 0, 15, 9, 0),
			endDate:   UI5Date.getInstance(2025, 0, 15, 10, 0)
		});
		const aOcc = RecurrenceUtils.getOccurrencesInRange.call(
			oApp,
			UI5Date.getInstance(2025, 1,  1),
			UI5Date.getInstance(2025, 3, 30)
		);
		assert.strictEqual(aOcc.length, 3, "Feb 15, Mar 15, Apr 15 — exactly 3 occurrences");
		oApp.destroy();
	});

	QUnit.test("Yearly — getOccurrencesInRange returns one per year", function (assert) {
		const oApp = new RecurringCalendarAppointment({
			recurrenceType: "Yearly",
			recurrencePattern: 1,
			startDate: UI5Date.getInstance(2024, 2, 15, 9, 0),
			endDate:   UI5Date.getInstance(2024, 2, 15, 10, 0)
		});
		const aOcc = RecurrenceUtils.getOccurrencesInRange.call(
			oApp,
			UI5Date.getInstance(2025,  0,  1),
			UI5Date.getInstance(2027, 11, 31)
		);
		assert.strictEqual(aOcc.length, 3, "Mar 15 in 2025, 2026, 2027 = 3 occurrences");
		oApp.destroy();
	});

	QUnit.test("getOccurrencesInRange — range is a single day (start = end)", function (assert) {
		const oApp = new RecurringCalendarAppointment({
			recurrenceType: "Daily",
			recurrencePattern: 1,
			startDate: UI5Date.getInstance(2025, 0, 15, 9, 0),
			endDate:   UI5Date.getInstance(2025, 0, 15, 10, 0)
		});
		const aOcc = RecurrenceUtils.getOccurrencesInRange.call(
			oApp,
			UI5Date.getInstance(2025, 0, 15),
			UI5Date.getInstance(2025, 0, 15)
		);
		assert.strictEqual(aOcc.length, 1, "Single-day range returns exactly 1 occurrence");
		oApp.destroy();
	});

	QUnit.test("recurrenceEndDate equals startDate — only one occurrence total", function (assert) {
		const oApp = new RecurringCalendarAppointment({
			recurrenceType: "Daily",
			recurrencePattern: 1,
			recurrenceEndDate: UI5Date.getInstance(2025, 0, 15),
			startDate: UI5Date.getInstance(2025, 0, 15, 9, 0),
			endDate:   UI5Date.getInstance(2025, 0, 15, 10, 0)
		});
		const aOcc = RecurrenceUtils.getOccurrencesInRange.call(
			oApp,
			UI5Date.getInstance(2025, 0,  1),
			UI5Date.getInstance(2025, 0, 31)
		);
		assert.strictEqual(aOcc.length, 1, "RecurrenceEndDate = startDate yields exactly 1 occurrence");
		oApp.destroy();
	});

	QUnit.test("Monthly day 31 — getOccurrencesInRange in leap year 2024", function (assert) {
		const oApp = new RecurringCalendarAppointment({
			recurrenceType: "Monthly",
			recurrencePattern: 1,
			startDate: UI5Date.getInstance(2024, 0, 31, 9, 0),
			endDate:   UI5Date.getInstance(2024, 0, 31, 10, 0),
			recurrenceRule: new RecurrenceRule({ type: "DayOfMonth", dayOfMonth: 31 })
		});
		const aOcc = RecurrenceUtils.getOccurrencesInRange.call(
			oApp,
			UI5Date.getInstance(2024, 0,  1),
			UI5Date.getInstance(2024, 11, 31)
		);
		// Jan, Mar, May, Jul, Aug, Oct, Dec = 7 months with 31 days (Feb 29 exists but day 31 doesn't)
		assert.strictEqual(aOcc.length, 7, "Leap year 2024: still only 7 months have a 31st");
		oApp.destroy();
	});

	// ─── _normalizeRecurrenceDays — additional edge cases ────────────────────

	QUnit.module("_normalizeRecurrenceDays — additional edge cases");

	QUnit.test("Out-of-range values are ignored", function (assert) {
		const aResult = RecurrenceUtils._normalizeRecurrenceDays([-1, -8, 7, 8]);
		assert.deepEqual(aResult, [], "Values outside 0-6 are ignored");
	});

	QUnit.test("Deduplicates same JS-style values", function (assert) {
		// 0=Sun appears twice, 3=Wed once
		const aResult = RecurrenceUtils._normalizeRecurrenceDays([0, 0, 3]);
		assert.deepEqual(aResult, [0, 3], "Duplicate 0 collapsed, result sorted [0,3]");
	});

	QUnit.test("Empty array returns empty array", function (assert) {
		const aResult = RecurrenceUtils._normalizeRecurrenceDays([]);
		assert.deepEqual(aResult, [], "Empty array input → empty array output");
	});

	// ─── _matchesWeekOrderInMonth — additional edge cases ────────────────────

	QUnit.module("_matchesWeekOrderInMonth — additional edge cases");

	QUnit.test("Last — month with 5 of that weekday, 5th is last", function (assert) {
		// January 2025 has 5 Wednesdays: 1, 8, 15, 22, 29 — last = 29
		const oRule = new RecurrenceRule({ type: "DayOfWeek", weekOfMonth: "Last", dayOfWeek: 3 });

		assert.ok(
			RecurrenceUtils._matchesWeekOrderInMonth(UI5Date.getInstance(2025, 0, 29), oRule),
			"Jan 29 is 5th (last) Wednesday"
		);
		assert.notOk(
			RecurrenceUtils._matchesWeekOrderInMonth(UI5Date.getInstance(2025, 0, 22), oRule),
			"Jan 22 is 4th Wednesday, not last"
		);
		oRule.destroy();
	});

	QUnit.test("First — weekday falls on day 1 of month (Feb 1, 2025 = Saturday)", function (assert) {
		const oRule = new RecurrenceRule({ type: "DayOfWeek", weekOfMonth: "First", dayOfWeek: 6 });

		assert.ok(
			RecurrenceUtils._matchesWeekOrderInMonth(UI5Date.getInstance(2025, 1, 1), oRule),
			"Feb 1, 2025 (Saturday) is 1st Saturday"
		);
		assert.notOk(
			RecurrenceUtils._matchesWeekOrderInMonth(UI5Date.getInstance(2025, 1, 8), oRule),
			"Feb 8 is 2nd Saturday"
		);
		oRule.destroy();
	});

	QUnit.test("Second — first weekday in month is on day 7", function (assert) {
		// Find a month where a weekday first appears on day 7 (e.g. Oct 2025: first Sun = Oct 5, but let's find day 7)
		// April 2025: first Saturday = Apr 5 → second Saturday = Apr 12
		// Let's verify: Mar 2025 first Sunday = Mar 2, second = Mar 9
		const oRule = new RecurrenceRule({ type: "DayOfWeek", weekOfMonth: "Second", dayOfWeek: 0 }); // Sunday

		// March 2025: Sundays are 2, 9, 16, 23, 30
		assert.ok(
			RecurrenceUtils._matchesWeekOrderInMonth(UI5Date.getInstance(2025, 2, 9), oRule),
			"Mar 9 is 2nd Sunday"
		);
		assert.notOk(
			RecurrenceUtils._matchesWeekOrderInMonth(UI5Date.getInstance(2025, 2, 2), oRule),
			"Mar 2 is 1st Sunday"
		);
		oRule.destroy();
	});

	// ─────────────────────────────────────────────────────────────────────────
	// DST (Daylight Saving Time) tests
	// These tests verify correctness across DST boundaries.
	// In timezones without DST (e.g. UTC) the tests pass trivially.
	// In European timezones (CET/CEST) they catch DST-related bugs.
	// Strategy: compare getOccurrencesInRange output against hasOccurrenceOnDate
	// for each calendar day in the range — both must agree.
	// ─────────────────────────────────────────────────────────────────────────
	QUnit.module("DST — Daylight Saving Time boundary tests");

	// Helper: collect every date in [start, end] where hasOccurrenceOnDate returns true
	function collectViaHasOccurrence(oAppointment, oStart, oEnd) {
		const aDates = [];
		const oCur = UI5Date.getInstance(oStart.getFullYear(), oStart.getMonth(), oStart.getDate());
		const oEndDay = UI5Date.getInstance(oEnd.getFullYear(), oEnd.getMonth(), oEnd.getDate(), 23, 59, 59, 999);
		while (oCur.getTime() <= oEndDay.getTime()) {
			if (RecurrenceUtils.hasOccurrenceOnDate.call(oAppointment, oCur)) {
				aDates.push(UI5Date.getInstance(oCur));
			}
			oCur.setDate(oCur.getDate() + 1);
		}
		return aDates;
	}

	// European DST spring-forward: last Sunday of March 2024 = March 31.
	// Clocks jump 02:00 → 03:00, so that day is only 23 hours.
	// A local-time subtraction would under-estimate the day count by 1.

	QUnit.test("Daily every 1 day across spring-forward (Mar 29 - Apr 4, 2024)", function (assert) {
		const oAppointment = new RecurringCalendarAppointment({
			startDate: UI5Date.getInstance(2024, 2, 29, 9, 0, 0),  // Mar 29
			endDate:   UI5Date.getInstance(2024, 2, 29, 10, 0, 0),
			recurrenceType: "Daily",
			recurrencePattern: 1
		});
		const oRangeStart = UI5Date.getInstance(2024, 2, 29);
		const oRangeEnd   = UI5Date.getInstance(2024, 3, 4);  // Apr 4

		const aRange  = RecurrenceUtils.getOccurrencesInRange.call(oAppointment, oRangeStart, oRangeEnd);
		const aExpect = collectViaHasOccurrence(oAppointment, oRangeStart, oRangeEnd);

		assert.strictEqual(aRange.length, aExpect.length, "Daily/1 across spring-forward: same count as hasOccurrenceOnDate");
		aRange.forEach((oDate, i) => {
			assert.strictEqual(
				oDate.toDateString(), aExpect[i].toDateString(),
				`Day ${i} matches: ${oDate.toDateString()}`
			);
		});
		oAppointment.destroy();
	});

	QUnit.test("Daily every 2 days across spring-forward (start Mar 29, range Apr 1 – Apr 7, 2024)", function (assert) {
		const oAppointment = new RecurringCalendarAppointment({
			startDate: UI5Date.getInstance(2024, 2, 29, 9, 0, 0),  // Mar 29 (day 0)
			endDate:   UI5Date.getInstance(2024, 2, 29, 10, 0, 0),
			recurrenceType: "Daily",
			recurrencePattern: 2
		});
		// Apr 2 = day 4, Apr 4 = day 6, Apr 6 = day 8
		const oRangeStart = UI5Date.getInstance(2024, 3, 1);   // Apr 1
		const oRangeEnd   = UI5Date.getInstance(2024, 3, 7);   // Apr 7

		const aRange  = RecurrenceUtils.getOccurrencesInRange.call(oAppointment, oRangeStart, oRangeEnd);
		const aExpect = collectViaHasOccurrence(oAppointment, oRangeStart, oRangeEnd);

		assert.strictEqual(aRange.length, aExpect.length, "Daily/2 across spring-forward: same count");
		aRange.forEach((oDate, i) => {
			assert.strictEqual(oDate.toDateString(), aExpect[i].toDateString(), `Match day ${i}`);
		});
		oAppointment.destroy();
	});

	QUnit.test("Daily every 3 days across spring-forward (start Mar 28, range Mar 31 – Apr 9, 2024)", function (assert) {
		const oAppointment = new RecurringCalendarAppointment({
			startDate: UI5Date.getInstance(2024, 2, 28, 9, 0, 0),  // Mar 28 (day 0)
			endDate:   UI5Date.getInstance(2024, 2, 28, 10, 0, 0),
			recurrenceType: "Daily",
			recurrencePattern: 3
		});
		// Mar 31 = day 3, Apr 3 = day 6, Apr 6 = day 9
		const oRangeStart = UI5Date.getInstance(2024, 2, 31);  // Mar 31 (spring-forward day)
		const oRangeEnd   = UI5Date.getInstance(2024, 3, 9);   // Apr 9

		const aRange  = RecurrenceUtils.getOccurrencesInRange.call(oAppointment, oRangeStart, oRangeEnd);
		const aExpect = collectViaHasOccurrence(oAppointment, oRangeStart, oRangeEnd);

		assert.strictEqual(aRange.length, aExpect.length, "Daily/3 across spring-forward: same count");
		aRange.forEach((oDate, i) => {
			assert.strictEqual(oDate.toDateString(), aExpect[i].toDateString(), `Match day ${i}`);
		});
		oAppointment.destroy();
	});

	// European DST fall-back: last Sunday of October 2024 = October 27.
	// Clocks go 03:00 → 02:00, so that day is 25 hours.

	QUnit.test("Daily every 2 days across fall-back (start Oct 25, range Oct 28 – Nov 3, 2024)", function (assert) {
		const oAppointment = new RecurringCalendarAppointment({
			startDate: UI5Date.getInstance(2024, 9, 25, 9, 0, 0),  // Oct 25 (day 0)
			endDate:   UI5Date.getInstance(2024, 9, 25, 10, 0, 0),
			recurrenceType: "Daily",
			recurrencePattern: 2
		});
		// Oct 29 = day 4, Oct 31 = day 6, Nov 2 = day 8
		const oRangeStart = UI5Date.getInstance(2024, 9, 28);   // Oct 28
		const oRangeEnd   = UI5Date.getInstance(2024, 10, 3);   // Nov 3

		const aRange  = RecurrenceUtils.getOccurrencesInRange.call(oAppointment, oRangeStart, oRangeEnd);
		const aExpect = collectViaHasOccurrence(oAppointment, oRangeStart, oRangeEnd);

		assert.strictEqual(aRange.length, aExpect.length, "Daily/2 across fall-back: same count");
		aRange.forEach((oDate, i) => {
			assert.strictEqual(oDate.toDateString(), aExpect[i].toDateString(), `Match day ${i}`);
		});
		oAppointment.destroy();
	});

	QUnit.test("Weekly bi-weekly across spring-forward (start Mar 18, range Apr 1 – Apr 14, 2024)", function (assert) {
		const oAppointment = new RecurringCalendarAppointment({
			startDate: UI5Date.getInstance(2024, 2, 18, 9, 0, 0),  // Mar 18 (Mon, week 0)
			endDate:   UI5Date.getInstance(2024, 2, 18, 10, 0, 0),
			recurrenceType: "Weekly",
			recurrencePattern: 2
		});
		// Bi-weekly Mon: Mar 18 (w0), Apr 1 (w2), Apr 15 (w4) outside range
		const oRangeStart = UI5Date.getInstance(2024, 3, 1);   // Apr 1
		const oRangeEnd   = UI5Date.getInstance(2024, 3, 14);  // Apr 14

		const aRange  = RecurrenceUtils.getOccurrencesInRange.call(oAppointment, oRangeStart, oRangeEnd);
		const aExpect = collectViaHasOccurrence(oAppointment, oRangeStart, oRangeEnd);

		assert.strictEqual(aRange.length, aExpect.length, "Bi-weekly across spring-forward: same count");
		aRange.forEach((oDate, i) => {
			assert.strictEqual(oDate.toDateString(), aExpect[i].toDateString(), `Match day ${i}`);
		});
		oAppointment.destroy();
	});

	QUnit.test("Weekly bi-weekly across fall-back (start Oct 14, range Oct 28 – Nov 10, 2024)", function (assert) {
		const oAppointment = new RecurringCalendarAppointment({
			startDate: UI5Date.getInstance(2024, 9, 14, 9, 0, 0),  // Oct 14 (Mon, week 0)
			endDate:   UI5Date.getInstance(2024, 9, 14, 10, 0, 0),
			recurrenceType: "Weekly",
			recurrencePattern: 2
		});
		// Bi-weekly Mon: Oct 14 (w0), Oct 28 (w2), Nov 11 (w4) outside range
		const oRangeStart = UI5Date.getInstance(2024, 9, 28);   // Oct 28
		const oRangeEnd   = UI5Date.getInstance(2024, 10, 10);  // Nov 10

		const aRange  = RecurrenceUtils.getOccurrencesInRange.call(oAppointment, oRangeStart, oRangeEnd);
		const aExpect = collectViaHasOccurrence(oAppointment, oRangeStart, oRangeEnd);

		assert.strictEqual(aRange.length, aExpect.length, "Bi-weekly across fall-back: same count");
		aRange.forEach((oDate, i) => {
			assert.strictEqual(oDate.toDateString(), aExpect[i].toDateString(), `Match day ${i}`);
		});
		oAppointment.destroy();
	});

	// ─── YEARLY DayOfMonth regression ───────────────────────────────────────────

	QUnit.module("Yearly — DayOfMonth with explicit month (user regression)");

	QUnit.test("Yearly DayOfMonth=12, Month=January — startDate May 4 2026, until 2029-01-31", function (assert) {
		const oApp = new RecurringCalendarAppointment({
			recurrenceType: "Yearly",
			recurrencePattern: 1,
			recurrenceEndDate: UI5Date.getInstance(2029, 0, 31),
			startDate: UI5Date.getInstance(2026, 4, 4, 15, 0),
			endDate:   UI5Date.getInstance(2026, 4, 4, 16, 0),
			recurrenceRule: new RecurrenceRule({ type: "DayOfMonth", dayOfMonth: 12, month: 0 })
		});
		const hasOcc = RecurrenceUtils.hasOccurrenceOnDate.bind(oApp);

		// Valid occurrences
		assert.ok(hasOcc(UI5Date.getInstance(2027, 0, 12)), "Jan 12 2027 matches");
		assert.ok(hasOcc(UI5Date.getInstance(2028, 0, 12)), "Jan 12 2028 matches");
		assert.ok(hasOcc(UI5Date.getInstance(2029, 0, 12)), "Jan 12 2029 matches");

		// Start date itself must NOT match (different month)
		assert.notOk(hasOcc(UI5Date.getInstance(2026, 4, 4)), "May 4 2026 (start date) no match");
		// Jan 12 2026 is before startDate
		assert.notOk(hasOcc(UI5Date.getInstance(2026, 0, 12)), "Jan 12 2026 before startDate — no match");
		// Wrong day
		assert.notOk(hasOcc(UI5Date.getInstance(2027, 0, 11)), "Jan 11 2027 no match");
		// After recurrenceEndDate
		assert.notOk(hasOcc(UI5Date.getInstance(2030, 0, 12)), "Jan 12 2030 after endDate — no match");

		// Range = Jan 2027: must find Jan 12
		const aOcc2027 = RecurrenceUtils.getOccurrencesInRange.call(
			oApp,
			UI5Date.getInstance(2027, 0, 1),
			UI5Date.getInstance(2027, 0, 31)
		);
		assert.strictEqual(aOcc2027.length, 1, "Jan 2027: 1 occurrence");
		assert.strictEqual(aOcc2027[0].getDate(), 12, "Jan 2027 occurrence on 12th");

		// Range = Jan 2028
		const aOcc2028 = RecurrenceUtils.getOccurrencesInRange.call(
			oApp,
			UI5Date.getInstance(2028, 0, 1),
			UI5Date.getInstance(2028, 0, 31)
		);
		assert.strictEqual(aOcc2028.length, 1, "Jan 2028: 1 occurrence");

		// Range = Jan 2029
		const aOcc2029 = RecurrenceUtils.getOccurrencesInRange.call(
			oApp,
			UI5Date.getInstance(2029, 0, 1),
			UI5Date.getInstance(2029, 0, 31)
		);
		assert.strictEqual(aOcc2029.length, 1, "Jan 2029: 1 occurrence");

		// Range = May–Dec 2026 (start year, Jan already passed — no occurrence expected)
		const aOcc2026 = RecurrenceUtils.getOccurrencesInRange.call(
			oApp,
			UI5Date.getInstance(2026, 4, 1),
			UI5Date.getInstance(2026, 11, 31)
		);
		assert.strictEqual(aOcc2026.length, 0, "May–Dec 2026: no occurrence (Jan 2026 < startDate)");

		// Full range May 2026 – Jan 2029: 3 occurrences
		const aOccFull = RecurrenceUtils.getOccurrencesInRange.call(
			oApp,
			UI5Date.getInstance(2026, 4, 1),
			UI5Date.getInstance(2029, 0, 31)
		);
		assert.strictEqual(aOccFull.length, 3, "Full range: 3 occurrences");
		assert.strictEqual(aOccFull[0].getFullYear(), 2027, "1st in 2027");
		assert.strictEqual(aOccFull[1].getFullYear(), 2028, "2nd in 2028");
		assert.strictEqual(aOccFull[2].getFullYear(), 2029, "3rd in 2029");

		oApp.destroy();
	});

	// ─── Monthly DayOfMonth=10, pattern=1, 3-year span ───────────────────────

	QUnit.module("Monthly — 3-year span, DayOfMonth=10, 1-hour appointment");

	QUnit.test("hasOccurrenceOnDate — 10th of every month across 3 years", function (assert) {
		const oApp = new RecurringCalendarAppointment({
			recurrenceType: "Monthly",
			recurrencePattern: 1,
			recurrenceEndDate: UI5Date.getInstance(2026, 11, 31),
			startDate: UI5Date.getInstance(2024, 0, 10, 9, 0),
			endDate:   UI5Date.getInstance(2024, 0, 10, 10, 0),
			recurrenceRule: new RecurrenceRule({ type: "DayOfMonth", dayOfMonth: 10 })
		});
		const hasOcc = RecurrenceUtils.hasOccurrenceOnDate.bind(oApp);

		// First and last occurrence within the span
		assert.ok(hasOcc(UI5Date.getInstance(2024, 0,  10)), "Jan 10, 2024 — first occurrence");
		assert.ok(hasOcc(UI5Date.getInstance(2026, 11, 10)), "Dec 10, 2026 — last occurrence");

		// Middle of span
		assert.ok(hasOcc(UI5Date.getInstance(2025, 5,  10)), "Jun 10, 2025 matches");
		assert.ok(hasOcc(UI5Date.getInstance(2025, 11, 10)), "Dec 10, 2025 matches");
		assert.ok(hasOcc(UI5Date.getInstance(2026, 0,  10)), "Jan 10, 2026 matches");

		// Wrong day in valid month
		assert.notOk(hasOcc(UI5Date.getInstance(2025, 5,  9)), "Jun 9, 2025 — wrong day, no match");
		assert.notOk(hasOcc(UI5Date.getInstance(2025, 5, 11)), "Jun 11, 2025 — wrong day, no match");

		// Before start date
		assert.notOk(hasOcc(UI5Date.getInstance(2023, 11, 10)), "Dec 10, 2023 — before start, no match");

		// After recurrenceEndDate
		assert.notOk(hasOcc(UI5Date.getInstance(2027, 0, 10)), "Jan 10, 2027 — after end, no match");

		oApp.destroy();
	});

	QUnit.test("getOccurrencesInRange — full 3-year span returns exactly 36 occurrences", function (assert) {
		const oApp = new RecurringCalendarAppointment({
			recurrenceType: "Monthly",
			recurrencePattern: 1,
			recurrenceEndDate: UI5Date.getInstance(2026, 11, 31),
			startDate: UI5Date.getInstance(2024, 0, 10, 9, 0),
			endDate:   UI5Date.getInstance(2024, 0, 10, 10, 0),
			recurrenceRule: new RecurrenceRule({ type: "DayOfMonth", dayOfMonth: 10 })
		});

		const aOcc = RecurrenceUtils.getOccurrencesInRange.call(
			oApp,
			UI5Date.getInstance(2024, 0, 1),
			UI5Date.getInstance(2026, 11, 31)
		);

		// Jan 2024 – Dec 2026 = 36 months × 1 occurrence each
		assert.strictEqual(aOcc.length, 36, "Full 3-year range: 36 occurrences");

		assert.strictEqual(aOcc[0].getFullYear(), 2024, "First: year 2024");
		assert.strictEqual(aOcc[0].getMonth(),    0,    "First: January");
		assert.strictEqual(aOcc[0].getDate(),     10,   "First: day 10");

		assert.strictEqual(aOcc[35].getFullYear(), 2026, "Last: year 2026");
		assert.strictEqual(aOcc[35].getMonth(),    11,   "Last: December");
		assert.strictEqual(aOcc[35].getDate(),     10,   "Last: day 10");

		// Every occurrence must be on the 10th
		const bAllOnDay10 = aOcc.every((oDate) => oDate.getDate() === 10);
		assert.ok(bAllOnDay10, "All 36 occurrences are on the 10th of their respective month");

		oApp.destroy();
	});

	QUnit.test("hasOccurrenceOnDate + getOccurrencesInRange — loop over every month in 3-year span", function (assert) {
		const oApp = new RecurringCalendarAppointment({
			recurrenceType: "Monthly",
			recurrencePattern: 1,
			recurrenceEndDate: UI5Date.getInstance(2026, 11, 31),
			startDate: UI5Date.getInstance(2024, 0, 10, 9, 0),
			endDate:   UI5Date.getInstance(2024, 0, 10, 10, 0),
			recurrenceRule: new RecurrenceRule({ type: "DayOfMonth", dayOfMonth: 10 })
		});
		const hasOcc = RecurrenceUtils.hasOccurrenceOnDate.bind(oApp);
		const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

		// Iterate every month from Jan 2024 to Dec 2026
		for (let iYear = 2024; iYear <= 2026; iYear++) {
			for (let iMonth = 0; iMonth <= 11; iMonth++) {
				const sLabel = `${MONTH_NAMES[iMonth]} ${iYear}`;

				// The 10th must match
				assert.ok(
					hasOcc(UI5Date.getInstance(iYear, iMonth, 10)),
					`${sLabel} 10th — hasOccurrenceOnDate matches`
				);

				// Adjacent days must not match
				assert.notOk(
					hasOcc(UI5Date.getInstance(iYear, iMonth, 9)),
					`${sLabel} 9th — no match`
				);
				assert.notOk(
					hasOcc(UI5Date.getInstance(iYear, iMonth, 11)),
					`${sLabel} 11th — no match`
				);

				// getOccurrencesInRange for the whole month must return exactly 1
				const iLastDay = UI5Date.getInstance(iYear, iMonth + 1, 0).getDate();
				const aOcc = RecurrenceUtils.getOccurrencesInRange.call(
					oApp,
					UI5Date.getInstance(iYear, iMonth, 1),
					UI5Date.getInstance(iYear, iMonth, iLastDay)
				);
				assert.strictEqual(aOcc.length, 1, `${sLabel}: getOccurrencesInRange returns 1`);
				assert.strictEqual(aOcc[0].getDate(), 10, `${sLabel}: occurrence is on the 10th`);
			}
		}

		oApp.destroy();
	});

	QUnit.test("narrow 3-day window (9th-11th) - every month in 3-year span returns exactly 1", function (assert) {
		const oApp = new RecurringCalendarAppointment({
			recurrenceType: "Monthly",
			recurrencePattern: 1,
			recurrenceEndDate: UI5Date.getInstance(2026, 11, 31),
			startDate: UI5Date.getInstance(2024, 0, 10, 9, 0),
			endDate:   UI5Date.getInstance(2024, 0, 10, 10, 0),
			recurrenceRule: new RecurrenceRule({ type: "DayOfMonth", dayOfMonth: 10 })
		});
		const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

		for (let iYear = 2024; iYear <= 2026; iYear++) {
			for (let iMonth = 0; iMonth <= 11; iMonth++) {
				const sLabel = `${MONTH_NAMES[iMonth]} ${iYear}`;
				// Narrow window: 9th–11th — must always contain exactly one occurrence on the 10th
				const aOcc = RecurrenceUtils.getOccurrencesInRange.call(
					oApp,
					UI5Date.getInstance(iYear, iMonth, 9),
					UI5Date.getInstance(iYear, iMonth, 11)
				);
				assert.strictEqual(aOcc.length, 1, `${sLabel} [9th–11th]: 1 occurrence`);
				if (aOcc.length === 1) {
					assert.strictEqual(aOcc[0].getDate(), 10, `${sLabel}: occurrence on the 10th`);
				}
			}
		}

		oApp.destroy();
	});

	QUnit.test("SPC simulation — non-overlapping 7-day windows across 3 years find exactly 36 occurrences", function (assert) {
		const oApp = new RecurringCalendarAppointment({
			recurrenceType: "Monthly",
			recurrencePattern: 1,
			recurrenceEndDate: UI5Date.getInstance(2026, 11, 31),
			startDate: UI5Date.getInstance(2024, 0, 10, 9, 0),
			endDate:   UI5Date.getInstance(2024, 0, 10, 10, 0),
			recurrenceRule: new RecurrenceRule({ type: "DayOfMonth", dayOfMonth: 10 })
		});

		let iTotalFound = 0;
		const aFoundDates = [];
		let oWindowStart = UI5Date.getInstance(2024, 0, 1); // Jan 1, 2024
		const oSpanEnd    = UI5Date.getInstance(2026, 11, 31);

		while (oWindowStart <= oSpanEnd) {
			const oWindowEnd = UI5Date.getInstance(oWindowStart);
			oWindowEnd.setDate(oWindowEnd.getDate() + 6); // 7-day window

			const aOcc = RecurrenceUtils.getOccurrencesInRange.call(oApp, oWindowStart, oWindowEnd);
			for (const oDate of aOcc) {
				iTotalFound++;
				aFoundDates.push(`${oDate.getFullYear()}-${oDate.getMonth() + 1}-${oDate.getDate()}`);
			}

			// advance 7 days (non-overlapping)
			oWindowStart = UI5Date.getInstance(oWindowEnd);
			oWindowStart.setDate(oWindowStart.getDate() + 1);
		}

		assert.strictEqual(iTotalFound, 36,
			`Expected 36 occurrences across 3 years, got ${iTotalFound}. Found: ${aFoundDates.join(", ")}`
		);

		oApp.destroy();
	});

	QUnit.test("getOccurrencesInRange — last month and after-end boundary", function (assert) {
		const oApp = new RecurringCalendarAppointment({
			recurrenceType: "Monthly",
			recurrencePattern: 1,
			recurrenceEndDate: UI5Date.getInstance(2026, 11, 31),
			startDate: UI5Date.getInstance(2024, 0, 10, 9, 0),
			endDate:   UI5Date.getInstance(2024, 0, 10, 10, 0),
			recurrenceRule: new RecurrenceRule({ type: "DayOfMonth", dayOfMonth: 10 })
		});

		// Last month of recurrence
		const aOccDec = RecurrenceUtils.getOccurrencesInRange.call(
			oApp,
			UI5Date.getInstance(2026, 11, 1),
			UI5Date.getInstance(2026, 11, 31)
		);
		assert.strictEqual(aOccDec.length, 1, "Dec 2026: 1 occurrence");
		assert.strictEqual(aOccDec[0].getDate(), 10, "Dec occurrence on 10th");

		// First month after recurrenceEndDate
		const aOccAfter = RecurrenceUtils.getOccurrencesInRange.call(
			oApp,
			UI5Date.getInstance(2027, 0, 1),
			UI5Date.getInstance(2027, 0, 31)
		);
		assert.strictEqual(aOccAfter.length, 0, "Jan 2027 — after recurrence end: 0 occurrences");

		oApp.destroy();
	});

	QUnit.test("createOccurrenceClones — preserves 1-hour duration and start time", function (assert) {
		const oApp = new RecurringCalendarAppointment({
			recurrenceType: "Monthly",
			recurrencePattern: 1,
			recurrenceEndDate: UI5Date.getInstance(2026, 11, 31),
			startDate: UI5Date.getInstance(2024, 0, 10, 9, 0),
			endDate:   UI5Date.getInstance(2024, 0, 10, 10, 0),
			recurrenceRule: new RecurrenceRule({ type: "DayOfMonth", dayOfMonth: 10 })
		});

		const aClones = oApp.createOccurrenceClones(
			UI5Date.getInstance(2025, 2, 1),
			UI5Date.getInstance(2025, 2, 31)
		);

		assert.strictEqual(aClones.length, 1, "March 2025: 1 clone");

		const oClone = aClones[0];
		assert.strictEqual(oClone.getStartDate().getDate(),     10,   "Clone start: day 10");
		assert.strictEqual(oClone.getStartDate().getMonth(),     2,   "Clone start: March (month=2)");
		assert.strictEqual(oClone.getStartDate().getFullYear(), 2025, "Clone start: year 2025");
		assert.strictEqual(oClone.getStartDate().getHours(),     9,   "Clone start: 09:00");
		assert.strictEqual(oClone.getEndDate().getHours(),      10,   "Clone end: 10:00");

		const iDuration = oClone.getEndDate().getTime() - oClone.getStartDate().getTime();
		assert.strictEqual(iDuration, 3600000, "Clone duration = 1 hour (3 600 000 ms)");

		aClones.forEach((o) => o.destroy());
		oApp.destroy();
	});

	// ─────────────────────────────────────────────────────────────────
	// Yearly — Feb 29 leap year in getOccurrencesInRange
	// Bug: _findFirstOccurrenceInRange calls setFullYear() on Feb 29 → JS overflows to March 1.
	// ─────────────────────────────────────────────────────────────────
	QUnit.module("Yearly — Feb 29 getOccurrencesInRange (leap year)");

	QUnit.test("No occurrence in non-leap year 2025, occurrence on Feb 29 in 2028", function (assert) {
		const oApp = new RecurringCalendarAppointment({
			recurrenceType: "Yearly",
			recurrencePattern: 1,
			recurrenceEndDate: UI5Date.getInstance(2030, 11, 31),
			startDate: UI5Date.getInstance(2024, 1, 29, 9, 0),
			endDate:   UI5Date.getInstance(2024, 1, 29, 10, 0)
		});

		// Range starting after the base occurrence — spans 2025-2030.
		// Without the fix, _findFirstOccurrenceInRange computes March 1, 2025 (overflow),
		// then _getNextPotentialOccurrence stays in March every year, missing Feb 29, 2028.
		const aOcc = RecurrenceUtils.getOccurrencesInRange.call(
			oApp,
			UI5Date.getInstance(2025, 2, 1),   // Mar 1, 2025
			UI5Date.getInstance(2030, 11, 31)
		);
		assert.strictEqual(aOcc.length, 1, "Exactly 1 occurrence (Feb 29, 2028) in range 2025-2030");
		if (aOcc.length === 1) {
			assert.strictEqual(aOcc[0].getFullYear(), 2028, "Occurrence in 2028");
			assert.strictEqual(aOcc[0].getMonth(), 1, "Occurrence in February");
			assert.strictEqual(aOcc[0].getDate(), 29, "Occurrence on Feb 29");
		}

		// Bonus: single-year 2025 range returns nothing (2025 is not a leap year)
		const aOcc2025 = RecurrenceUtils.getOccurrencesInRange.call(
			oApp,
			UI5Date.getInstance(2025, 0, 1),
			UI5Date.getInstance(2025, 11, 31)
		);
		assert.strictEqual(aOcc2025.length, 0, "2025 is not a leap year: 0 occurrences");

		oApp.destroy();
	});

	// ─────────────────────────────────────────────────────────────────────────
	// Monthly DayOfWeek — range starts mid-month before the occurrence
	// Bug: _findFirstOccurrenceInRange sets candidate to day 1 of the target month,
	// then sees day-1 < rangeStart and advances to the NEXT month, skipping the
	// valid occurrence that is still within the current month.
	// ─────────────────────────────────────────────────────────────────────────
	QUnit.module("Monthly DayOfWeek — mid-month range start");

	QUnit.test("Third Sunday found in week Jan 18–24 2026 (range starts on the occurrence)", function (assert) {
		// Appointment: Monthly, every 1 month, Third Sunday.
		// startDate = Jan 1, 2026. Third Sunday of Jan 2026 = Jan 18.
		// A 7-day window starting exactly on Jan 18 must return that occurrence.
		const oApp = new RecurringCalendarAppointment({
			recurrenceType: "Monthly",
			recurrencePattern: 1,
			recurrenceEndDate: UI5Date.getInstance(2026, 11, 31),
			startDate: UI5Date.getInstance(2026, 0, 1, 9, 0),
			endDate:   UI5Date.getInstance(2026, 0, 1, 10, 0),
			recurrenceRule: new RecurrenceRule({ type: "DayOfWeek", weekOfMonth: "Third", dayOfWeek: 0 })
		});

		const aOcc = RecurrenceUtils.getOccurrencesInRange.call(
			oApp,
			UI5Date.getInstance(2026, 0, 18), // Jan 18 (3rd Sunday)
			UI5Date.getInstance(2026, 0, 24)  // Jan 24
		);
		assert.strictEqual(aOcc.length, 1, "Exactly 1 occurrence in week Jan 18–24");
		if (aOcc.length >= 1) {
			assert.strictEqual(aOcc[0].getDate(), 18, "Occurrence falls on Jan 18");
		}
		oApp.destroy();
	});

	QUnit.test("Third Sunday found in week Jan 12–18 2026 (range ends on the occurrence)", function (assert) {
		const oApp = new RecurringCalendarAppointment({
			recurrenceType: "Monthly",
			recurrencePattern: 1,
			recurrenceEndDate: UI5Date.getInstance(2026, 11, 31),
			startDate: UI5Date.getInstance(2026, 0, 1, 9, 0),
			endDate:   UI5Date.getInstance(2026, 0, 1, 10, 0),
			recurrenceRule: new RecurrenceRule({ type: "DayOfWeek", weekOfMonth: "Third", dayOfWeek: 0 })
		});

		const aOcc = RecurrenceUtils.getOccurrencesInRange.call(
			oApp,
			UI5Date.getInstance(2026, 0, 12), // Jan 12
			UI5Date.getInstance(2026, 0, 18)  // Jan 18 (3rd Sunday, last day of window)
		);
		assert.strictEqual(aOcc.length, 1, "Exactly 1 occurrence in week Jan 12–18");
		if (aOcc.length >= 1) {
			assert.strictEqual(aOcc[0].getDate(), 18, "Occurrence falls on Jan 18");
		}
		oApp.destroy();
	});

	QUnit.test("Full year 2026 — 12 Third Sundays found", function (assert) {
		// Third Sunday of each month in 2026:
		// Jan 18, Feb 15, Mar 15, Apr 19, May 17, Jun 21, Jul 19, Aug 16, Sep 20, Oct 18, Nov 15, Dec 20
		const aExpectedDays = [18, 15, 15, 19, 17, 21, 19, 16, 20, 18, 15, 20];
		const oApp = new RecurringCalendarAppointment({
			recurrenceType: "Monthly",
			recurrencePattern: 1,
			recurrenceEndDate: UI5Date.getInstance(2026, 11, 31),
			startDate: UI5Date.getInstance(2026, 0, 1, 9, 0),
			endDate:   UI5Date.getInstance(2026, 0, 1, 10, 0),
			recurrenceRule: new RecurrenceRule({ type: "DayOfWeek", weekOfMonth: "Third", dayOfWeek: 0 })
		});

		const aOcc = RecurrenceUtils.getOccurrencesInRange.call(
			oApp,
			UI5Date.getInstance(2026, 0, 1),
			UI5Date.getInstance(2026, 11, 31)
		);
		assert.strictEqual(aOcc.length, 12, "12 occurrences in 2026");
		aExpectedDays.forEach(function (iDay, iIdx) {
			if (aOcc[iIdx]) {
				assert.strictEqual(aOcc[iIdx].getMonth(), iIdx, "Month " + iIdx + " — correct month");
				assert.strictEqual(aOcc[iIdx].getDate(), iDay, "Month " + iIdx + " — day " + iDay);
			}
		});
		oApp.destroy();
	});

	// ─────────────────────────────────────────────────────────────────────────
	// Yearly DayOfWeek — range starts after target month in same year
	// Bug: _findFirstOccurrenceInRange placed the candidate in the start date's month
	// (e.g. January) instead of the rule's target month (e.g. July), so when the
	// range started after January but before July, the advance logic pushed the
	// candidate to January of the NEXT year — skipping the July occurrence entirely.
	// ─────────────────────────────────────────────────────────────────────────
	QUnit.module("Yearly DayOfWeek — range starts after target month");

	QUnit.test("First Monday of July found in range Jul 1–31 2025 (range spans the occurrence)", function (assert) {
		// startDate Jan 1 2024; rule: First Monday of July.
		// First Monday of July 2025 = July 7.
		// Before the fix, _findFirstOccurrenceInRange placed candidate at Jan 1 2025,
		// then advanced to Jan 1 2026 (outside range) → 0 results.
		const oApp = new RecurringCalendarAppointment({
			recurrenceType: "Yearly",
			recurrencePattern: 1,
			recurrenceEndDate: UI5Date.getInstance(2026, 11, 31),
			startDate: UI5Date.getInstance(2024, 0, 1, 9, 0),
			endDate:   UI5Date.getInstance(2024, 0, 1, 10, 0),
			recurrenceRule: new RecurrenceRule({ type: "DayOfWeek", month: 6, weekOfMonth: "First", dayOfWeek: 1 })
		});

		const aOcc = RecurrenceUtils.getOccurrencesInRange.call(
			oApp,
			UI5Date.getInstance(2025, 6, 1),   // Jul 1, 2025
			UI5Date.getInstance(2025, 6, 31)    // Jul 31, 2025
		);
		assert.strictEqual(aOcc.length, 1, "Exactly 1 occurrence in Jul 2025");
		if (aOcc.length === 1) {
			assert.strictEqual(aOcc[0].getFullYear(), 2025, "Occurrence in 2025");
			assert.strictEqual(aOcc[0].getMonth(), 6, "Occurrence in July");
			assert.strictEqual(aOcc[0].getDate(), 7, "Occurrence on Jul 7 (First Monday)");
		}
		oApp.destroy();
	});

	QUnit.test("Range starts after target month (Aug 1 – Jul 31 2026) finds Jul 6 2026", function (assert) {
		// Range Aug 1 2025 → Jul 31 2026: July 2025 is in the past, so only July 2026 is in range.
		// First Monday of July 2026 = July 6.
		const oApp = new RecurringCalendarAppointment({
			recurrenceType: "Yearly",
			recurrencePattern: 1,
			recurrenceEndDate: UI5Date.getInstance(2026, 11, 31),
			startDate: UI5Date.getInstance(2024, 0, 1, 9, 0),
			endDate:   UI5Date.getInstance(2024, 0, 1, 10, 0),
			recurrenceRule: new RecurrenceRule({ type: "DayOfWeek", month: 6, weekOfMonth: "First", dayOfWeek: 1 })
		});

		const aOcc = RecurrenceUtils.getOccurrencesInRange.call(
			oApp,
			UI5Date.getInstance(2025, 7, 1),   // Aug 1, 2025
			UI5Date.getInstance(2026, 6, 31)    // Jul 31, 2026
		);
		assert.strictEqual(aOcc.length, 1, "Exactly 1 occurrence in Aug 2025 – Jul 2026 range");
		if (aOcc.length === 1) {
			assert.strictEqual(aOcc[0].getFullYear(), 2026, "Occurrence in 2026");
			assert.strictEqual(aOcc[0].getMonth(), 6, "Occurrence in July");
			assert.strictEqual(aOcc[0].getDate(), 6, "Occurrence on Jul 6 (First Monday)");
		}
		oApp.destroy();
	});

	QUnit.test("Full range 2024–2026 finds 3 First Mondays of July", function (assert) {
		// Jul 1 2024 (Mon), Jul 7 2025 (Mon), Jul 6 2026 (Mon)
		const oApp = new RecurringCalendarAppointment({
			recurrenceType: "Yearly",
			recurrencePattern: 1,
			recurrenceEndDate: UI5Date.getInstance(2026, 11, 31),
			startDate: UI5Date.getInstance(2024, 0, 1, 9, 0),
			endDate:   UI5Date.getInstance(2024, 0, 1, 10, 0),
			recurrenceRule: new RecurrenceRule({ type: "DayOfWeek", month: 6, weekOfMonth: "First", dayOfWeek: 1 })
		});

		const aOcc = RecurrenceUtils.getOccurrencesInRange.call(
			oApp,
			UI5Date.getInstance(2024, 0, 1),
			UI5Date.getInstance(2026, 11, 31)
		);
		assert.strictEqual(aOcc.length, 3, "3 occurrences in 2024–2026");
		if (aOcc.length === 3) {
			assert.strictEqual(aOcc[0].getFullYear(), 2024, "First: 2024");
			assert.strictEqual(aOcc[0].getMonth(), 6, "First: July");
			assert.strictEqual(aOcc[0].getDate(), 1, "First: Jul 1");

			assert.strictEqual(aOcc[1].getFullYear(), 2025, "Second: 2025");
			assert.strictEqual(aOcc[1].getMonth(), 6, "Second: July");
			assert.strictEqual(aOcc[1].getDate(), 7, "Second: Jul 7");

			assert.strictEqual(aOcc[2].getFullYear(), 2026, "Third: 2026");
			assert.strictEqual(aOcc[2].getMonth(), 6, "Third: July");
			assert.strictEqual(aOcc[2].getDate(), 6, "Third: Jul 6");
		}
		oApp.destroy();
	});
});
