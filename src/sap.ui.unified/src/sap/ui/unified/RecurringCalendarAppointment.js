/*!
 * ${copyright}
 */
// Provides control sap.ui.unified.RecurringCalendarAppointment.
sap.ui.define([
	'./CalendarAppointment',
	'./calendar/RecurrenceUtils',
	'./library',
	"sap/ui/core/date/UI5Date",
	"./WeeklyRecurrenceRule",
	"./MonthlyRecurrenceRule",
	"./YearlyRecurrenceRule"
],
	function(
		CalendarAppointment,
		RecurrenceUtils,
		library,
		UI5Date,
		WeeklyRecurrenceRule,
		MonthlyRecurrenceRule,
		YearlyRecurrenceRule
	) {
	"use strict";

	/**
	 * Constructor for a new <code>RecurringCalendarAppointment</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * An appointment for use in a <code>PlanningCalendar</code> or similar. The rendering must be done in the Row collecting the appointments.
	 * (Because there are different visualizations possible.)
	 *
	 * Applications could inherit from this element to add own fields.
	 * @extends sap.ui.unified.CalendarAppointment
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @ui5-experimental-since 1.149
	 * @alias sap.ui.unified.RecurringCalendarAppointment
	 */
	const RecurringCalendarAppointment = CalendarAppointment.extend("sap.ui.unified.RecurringCalendarAppointment", /** @lends sap.ui.unified.RecurringCalendarAppointment.prototype */ { metadata : {
		library : "sap.ui.unified",
		properties : {
			/**
			 * The recurrence type (Daily, Weekly, Monthly, Yearly).
			 */
			recurrenceType: {type: "sap.ui.unified.RecurrenceType", group: "Misc"},

			/**
			 * End date of the recurrence. Must be a UI5Date or JavaScript Date object.
			 */
			recurrenceEndDate: {type: "object", group: "Data"},

			/**
			 * Recurrence interval. E.g. 1 = every day/week/month/year, 2 = every second, etc.
			 */
			recurrencePattern: {type: "int", group: "Behavior", defaultValue: 1}
		},
		defaultAggregation: "recurrenceRule",
		aggregations: {
			/**
			 * Advanced recurrence rule configuration.
			 * @see sap.ui.unified.RecurrenceRule
			 */
			recurrenceRule: {type: "sap.ui.unified.RecurrenceRule", multiple: false}
		}
	}});

	RecurringCalendarAppointment.prototype.setRecurrenceRule = function(oRule) {
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

	RecurringCalendarAppointment.prototype.getDuration = function () {
		return Math.abs(this.getStartDate().getTime() - this.getEndDate().getTime());
	};

	RecurringCalendarAppointment.prototype.getStartAndEndDate = function(oDate) {
		const oStartDate = UI5Date.getInstance(oDate.getFullYear(), oDate.getMonth(), oDate.getDate(),
			this.getStartDate().getHours(), this.getStartDate().getMinutes());
		const oEndDate = UI5Date.getInstance(oStartDate.getTime() + this.getDuration());
		return {startDate: oStartDate, endDate: oEndDate};
	};

	/**
	 * Creates <code>CalendarAppointment</code> clones for each occurrence of this recurring appointment within the given date range.
	 * @param {Date|module:sap/ui/core/date/UI5Date} oRangeStart Start of the visible range (inclusive)
	 * @param {Date|module:sap/ui/core/date/UI5Date} oRangeEnd End of the visible range (inclusive)
	 * @returns {sap.ui.unified.CalendarAppointment[]} Array of cloned appointments, one per occurrence
	 * @public
	 */
	RecurringCalendarAppointment.prototype.createOccurrenceClones = function(oRangeStart, oRangeEnd) {
		const oAppStartDate = this.getStartDate();
		const iDuration = this.getDuration();

		let aOccurrences = RecurrenceUtils.getCachedOccurrences.call(this, oRangeStart, oRangeEnd);
		if (!aOccurrences) {
			aOccurrences = RecurrenceUtils.getOccurrencesInRange.call(this, oRangeStart, oRangeEnd);
			RecurrenceUtils.setCachedOccurrences.call(this, oRangeStart, oRangeEnd, aOccurrences);
		}

		return aOccurrences.map((oOccurrenceDate) => {
			const oOccurrenceStart = UI5Date.getInstance(oOccurrenceDate);
			oOccurrenceStart.setHours(oAppStartDate.getHours(), oAppStartDate.getMinutes(), oAppStartDate.getSeconds());
			const oOccurrenceEnd = UI5Date.getInstance(oOccurrenceStart.getTime() + iDuration);

			return new CalendarAppointment({
				startDate: oOccurrenceStart,
				endDate: oOccurrenceEnd,
				title: this.getTitle(),
				text: this.getText(),
				type: this.getType(),
				selected: this.getSelected(),
				tentative: this.getTentative(),
				icon: this.getIcon()
			});
		});
	};

	RecurringCalendarAppointment.prototype.hasAppointmentAtDate = function(oDate) {
		return RecurrenceUtils.hasOccurrenceOnDate.call(this, oDate);
	};

	RecurringCalendarAppointment.prototype.isRecurring = function() {
		return !!this.getRecurrenceType();
	};

	RecurringCalendarAppointment.prototype.setRecurrenceType = function(sValue) {
		RecurrenceUtils.invalidateCache.call(this);
		return this.setProperty("recurrenceType", sValue);
	};

	RecurringCalendarAppointment.prototype.setRecurrencePattern = function(iValue) {
		if (iValue < 1) {
			throw new Error("recurrencePattern must be >= 1");
		}
		RecurrenceUtils.invalidateCache.call(this);
		return this.setProperty("recurrencePattern", iValue);
	};

	RecurringCalendarAppointment.prototype.setStartDate = function(oDate) {
		RecurrenceUtils.invalidateCache.call(this);
		return this.setProperty("startDate", oDate);
	};

	RecurringCalendarAppointment.prototype.setEndDate = function(oDate) {
		RecurrenceUtils.invalidateCache.call(this);
		return this.setProperty("endDate", oDate);
	};

	RecurringCalendarAppointment.prototype.setRecurrenceEndDate = function(oDate) {
		RecurrenceUtils.invalidateCache.call(this);
		return this.setProperty("recurrenceEndDate", oDate);
	};

	RecurringCalendarAppointment.prototype.hasOccurrenceOnDateCached = function(oDate) {
		return RecurrenceUtils.hasOccurrenceOnDateCached.call(this, oDate);
	};

	/**
	 * Returns all occurrence dates within the given date range.
	 * @param {Date|module:sap/ui/core/date/UI5Date} oStartDate - Start date of range (inclusive)
	 * @param {Date|module:sap/ui/core/date/UI5Date} oEndDate - End date of range (inclusive)
	 * @returns {Date[]} Array of occurrence dates (UI5Date instances)
	 * @public
	 */
	RecurringCalendarAppointment.prototype.getOccurrencesInRange = function(oStartDate, oEndDate) {
		return RecurrenceUtils.getOccurrencesInRange.call(this, oStartDate, oEndDate);
	};

	/**
	 * Gets cached occurrences for a date range.
	 * Returns cached result if available, or null if not cached.
	 * @param {Date|module:sap/ui/core/date/UI5Date} oStartDate - Start date of range
	 * @param {Date|module:sap/ui/core/date/UI5Date} oEndDate - End date of range
	 * @returns {Date[]|null} Cached occurrence dates or null
	 * @private
	 */
	RecurringCalendarAppointment.prototype.getCachedOccurrences = function(oStartDate, oEndDate) {
		return RecurrenceUtils.getCachedOccurrences.call(this, oStartDate, oEndDate);
	};

	/**
	 * Sets cached occurrences for a date range.
	 * @param {Date|module:sap/ui/core/date/UI5Date} oStartDate - Start date of range
	 * @param {Date|module:sap/ui/core/date/UI5Date} oEndDate - End date of range
	 * @param {Date[]} aOccurrences - Array of occurrence dates to cache
	 * @private
	 */
	RecurringCalendarAppointment.prototype.setCachedOccurrences = function(oStartDate, oEndDate, aOccurrences) {
		RecurrenceUtils.setCachedOccurrences.call(this, oStartDate, oEndDate, aOccurrences);
	};

	return RecurringCalendarAppointment;
});
