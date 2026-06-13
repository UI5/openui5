/*!
 * ${copyright}
 */

// Provides control sap.ui.unified.RecurringNonWorkingPeriod.
sap.ui.define([
	"./NonWorkingPeriod",
	"./calendar/RecurrenceUtils",
	"./library",
	"./WeeklyRecurrenceRule",
	"./MonthlyRecurrenceRule",
	"./YearlyRecurrenceRule"
],
	function(
		NonWorkingPeriod,
		RecurrenceUtils,
		library,
		WeeklyRecurrenceRule,
		MonthlyRecurrenceRule,
		YearlyRecurrenceRule
	) {
	"use strict";

	/**
	 * Constructor for a new <code>RecurringNonWorkingPeriod</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * A <code>RecurringNonWorkingPeriod</code> for use in a <code>PlanningCalendar</code> and <code>SinglePlanningCalendar</code>.
	 *
	 * Applications can inherit from this element to add own fields.
	 * @extends sap.ui.unified.NonWorkingPeriod
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @ui5-experimental-since 1.127.0
	 * @alias sap.ui.unified.RecurringNonWorkingPeriod
	 */
	const RecurringNonWorkingPeriod = NonWorkingPeriod.extend("sap.ui.unified.RecurringNonWorkingPeriod", /** @lends sap.ui.unified.RecurringNonWorkingPeriod.prototype */ { metadata : {

		library : "sap.ui.unified",
		properties : {
			/**
			 * The recurrenceType determines the pattern of recurrence for a given calendar item.
			 */
			recurrenceType: {type: "sap.ui.unified.RecurrenceType", group: "Misc"},

			/**
			 * Determines the end date of the calendar item, as a UI5Date or JavaScript Date object. It is considered as a local date.
			 */
			recurrenceEndDate: {type : "object", group : "Data"},

			/**
			 * The recurrencePattern is an integer value which, in combination with the recurrenceType, sets the recurrence frequency for a calendar item.
			 * For example, if the recurrenceType is set to "Daily" and the recurrencePattern is set to 1, it signifies that repetition is set for every day.
			 * If the recurrencePattern is set to 3, this would imply the calendar item is recurring once for every three days.
			 */
			recurrencePattern: {type : "int", group : "Behavior", defaultValue : 1}
		},
		aggregations: {
			/**
			 * Advanced recurrence rule configuration.
			 * @see sap.ui.unified.RecurrenceRule
			 */
			recurrenceRule: {type: "sap.ui.unified.RecurrenceRule", multiple: false}
		}
	}});

	RecurringNonWorkingPeriod.prototype.setRecurrenceRule = function(oRule) {
		RecurrenceUtils.invalidateCache.call(this);
		if (oRule && oRule.getMetadata().getName() === "sap.ui.unified.RecurrenceRule") {
			const RecurrenceType = library.RecurrenceType;
			switch (oRule.getRecurrenceType()) {
				case RecurrenceType.Weekly:
					oRule = new WeeklyRecurrenceRule({days: oRule.getDays()});
					break;
				case RecurrenceType.Monthly:
					oRule = new MonthlyRecurrenceRule({
						type: oRule.getType(), dayOfMonth: oRule.getDayOfMonth(),
						weekOfMonth: oRule.getWeekOfMonth(), dayOfWeek: oRule.getDayOfWeek()
					});
					break;
				case RecurrenceType.Yearly: {
					const mSettings = {
						type: oRule.getType(), dayOfMonth: oRule.getDayOfMonth(),
						weekOfMonth: oRule.getWeekOfMonth(), dayOfWeek: oRule.getDayOfWeek()
					};
					if (oRule.getMonth() >= 0) {
						mSettings.month = oRule.getMonth();
					}
					oRule = new YearlyRecurrenceRule(mSettings);
					break;
				}
				default:
					break;
			}
		}
		return this.setAggregation("recurrenceRule", oRule);
	};

	/**
	 * Determines whether the current instance has recurrence or not.
	 * @return {boolean} The result is <code>true</code> when the instance has recurrence.
	 * @private
	 */
	RecurringNonWorkingPeriod.prototype.isRecurring = function () {
		return !!this.getRecurrenceType();
	};

	/**
	 * Returns the recurrence start date. Falls back to the calendar date (midnight) when
	 * no timeRange is set, which is the normal case for RecurringNonWorkingPeriod.
	 * RecurrenceUtils.hasOccurrenceOnDate normalises to midnight itself, so this is safe.
	 * @returns {Date|module:sap/ui/core/date/UI5Date} The start date
	 * @private
	 */
	RecurringNonWorkingPeriod.prototype.getStartDate = function() {
		if (this.getTimeRange()) {
			return NonWorkingPeriod.prototype.getStartDate.call(this);
		}
		return this.getDate();
	};

	/**
	 * Checks if a given date (without time) is a non-working day.
	 * @param {Date|module:sap/ui/core/date/UI5Date} oDate - Date to check
	 * @returns {boolean} True if the date is non-working
	 * @public
	 */
	RecurringNonWorkingPeriod.prototype.hasNonWorkingAtDate = function(oDate) {
		// Delegate to RecurrenceUtils
		const hasOccurrenceOnDate = RecurrenceUtils.hasOccurrenceOnDate.bind(this);
		return hasOccurrenceOnDate(oDate);
	};

	RecurringNonWorkingPeriod.prototype.setRecurrenceType = function(sValue) {
		RecurrenceUtils.invalidateCache.call(this);
		return this.setProperty("recurrenceType", sValue);
	};

	RecurringNonWorkingPeriod.prototype.setRecurrencePattern = function(iValue) {
		if (iValue < 1) {
			throw new Error("recurrencePattern must be >= 1");
		}
		RecurrenceUtils.invalidateCache.call(this);
		return this.setProperty("recurrencePattern", iValue);
	};

	RecurringNonWorkingPeriod.prototype.setRecurrenceEndDate = function(oDate) {
		RecurrenceUtils.invalidateCache.call(this);
		return this.setProperty("recurrenceEndDate", oDate);
	};

	RecurringNonWorkingPeriod.prototype.hasOccurrenceOnDateCached = function(oDate) {
		return RecurrenceUtils.hasOccurrenceOnDateCached.call(this, oDate);
	};

	/**
	 * Gets cached non-working periods for a date range.
	 * Returns cached result if available, or null if not cached.
	 * @param {Date|module:sap/ui/core/date/UI5Date} oStartDate - Start date of range
	 * @param {Date|module:sap/ui/core/date/UI5Date} oEndDate - End date of range
	 * @returns {sap.ui.unified.NonWorkingPeriod[]|null} Cached non-working periods or null
	 * @public
	 */
	RecurringNonWorkingPeriod.prototype.getCachedOccurrences = function(oStartDate, oEndDate) {
		return RecurrenceUtils.getCachedOccurrences.call(this, oStartDate, oEndDate);
	};

	/**
	 * Sets cached non-working periods for a date range.
	 * @param {Date|module:sap/ui/core/date/UI5Date} oStartDate - Start date of range
	 * @param {Date|module:sap/ui/core/date/UI5Date} oEndDate - End date of range
	 * @param {sap.ui.unified.NonWorkingPeriod[]} aPeriods - Array of non-working periods to cache
	 * @public
	 */
	RecurringNonWorkingPeriod.prototype.setCachedOccurrences = function(oStartDate, oEndDate, aPeriods) {
		RecurrenceUtils.setCachedOccurrences.call(this, oStartDate, oEndDate, aPeriods);
	};

	return RecurringNonWorkingPeriod;
});
