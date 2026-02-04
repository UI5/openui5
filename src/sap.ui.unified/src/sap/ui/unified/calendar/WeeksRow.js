/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/i18n/date/CalendarType",
	"sap/ui/unified/library",
	"sap/ui/core/Control",
	"./WeeksRowRenderer",
	"sap/ui/core/date/UI5Date",
	"sap/ui/unified/calendar/CalendarUtils",
	"sap/ui/unified/calendar/CalendarDate",
	"sap/ui/core/Locale",
	"sap/base/i18n/Formatting"
], function (
	CalendarType,
	unifiedLibrary,
	Control,
	WeeksRowRenderer,
	UI5Date,
	CalendarUtils,
	CalendarDate,
	Locale,
	Formatting
) {
	"use strict";
	const CalendarIntervalType = unifiedLibrary.CalendarIntervalType;

	/**
	 * Constructor for a new sap.ui.unified.calendar.WeeksRow.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is provided.
	 * @param {object} [mSettings] Initial settings for the new control.
	 *
	 * @class
	 * Renders a row of weeks, each consisting of days, for use in calendar-based controls such as the PlanningCalendar.
	 * The WeeksRow control is not intended for standalone usage, but as an internal part of higher-level calendar components.
	 *
	 * The WeeksRow works with UI5Date or JavaScript Date objects for its API, but internally uses CalendarDate objects for calculations.
	 *
	 * @extends sap.ui.core.Control
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @since 1.145.0
	 * @alias sap.ui.unified.calendar.WeeksRow
	 */
	const WeeksRow = Control.extend("sap.ui.unified.calendar.WeeksRow", /** @lends sap.ui.unified.calendar.WeeksRow.prototype */ {
		metadata : {
			library : "sap.ui.unified",
			properties : {

				/**
				 * Determines the start date of the row, as a UI5Date or JavaScript Date object. The current date is used as default.
				 */
				startDate : { type : "object", group : "Data" },

				/**
				 * If set, the calendar type is used for display.
				 * If not set, the calendar type of the global configuration is used.
				 */
				primaryCalendarType : { type : "sap.base.i18n.date.CalendarType", group : "Appearance", defaultValue : CalendarType.Gregorian },

				/**
			 	 * number weeks displayed
			 	 */
				interval : { type : "int", group : "Appearance" },

				/**
				 * Defines the key of the <code>PlanningCalendarView</code> used for the output.
				 *
				 * <b>Note:</b> The default value is set <code>Hour</code>. If you are using your own views, the keys of these
				 * views should be used instead.
				 */
				viewKey : {type : "string", group : "Appearance", defaultValue : CalendarIntervalType.Hour},

				/**
				 * Determines if the week numbers are displayed.
				 */
				showWeekNumbers : {type : "boolean", group : "Appearance", defaultValue : false},

				/**
				 * If set, the calendar week numbering is used for display.
				 * If not set, the calendar week numbering of the global configuration is used.
				 */
				calendarWeekNumbering : { type : "sap.base.i18n.date.CalendarWeekNumbering", group : "Appearance", defaultValue: null}
			}
		},
		renderer: WeeksRowRenderer
	});

	/**
	 * Sets the ARIA role for the row container.
	 * @param {string} sRole The ARIA role to be assigned.
	 * @returns {sap.ui.unified.calendar.WeeksRow} The current instance for method chaining.
	 * @private
	 */
	WeeksRow.prototype._setAriaRole = function(sRole){
		this._ariaRole = sRole;

		return this;
	};

	/**
	 * Retrieves the locale used by this control.
	 * If the parent control specifies a locale it will be used; otherwise the
	 * control falls back to the runtime language tag.
	 *
	 * @returns {string} The locale identifier.
	 * @private
	 */
	WeeksRow.prototype._getLocale = function(){
		const oParent = this.getParent();

		if (oParent && oParent.getLocale) {
			return oParent.getLocale();
		} else if (!this._sLocale) {
			this._sLocale = new Locale(Formatting.getLanguageTag()).toString();
		}

		return this._sLocale;

	};

	/**
	 * Returns the weekday index of the start date (0 = Sunday, 6 = Saturday).
	 * @returns {int} The index of the weekday corresponding to the start date.
	 * @private
	 */
	WeeksRow.prototype._getFirstWeekDay = function(){
		return this.getStartDate().getDay();
	};

	/**
	 * Calculates and returns the week numbers for the currently displayed
	 * interval. The result is an array of objects, where each object contains
	 * a `number` (the week number) and `len` (how many days of that week are
	 * displayed in the interval).
	 *
	 * @returns {Array<{len: int, number: int}>} Week numbers and lengths.
	 * @private
	 */
	WeeksRow.prototype._getWeekNumbers = function() {
		const iDays = this.getInterval(),
			sLocale = this._getLocale(),
			oCalType = this.getPrimaryCalendarType(),
			oStartDate = CalendarDate.fromLocalJSDate(this.getStartDate(), oCalType),
			oDate = new CalendarDate(oStartDate, oCalType),
			oEndDate = new CalendarDate(oStartDate, oCalType).setDate(oDate.getDate() + iDays),
			aDisplayedDates = [],
			sCalendarWeekNumbering = this.getCalendarWeekNumbering() || "Default";

		while (oDate.isBefore(oEndDate)) {
			aDisplayedDates.push(new CalendarDate(oDate, oCalType));
			oDate.setDate(oDate.getDate() + 1);
		}

		const weekNumbers = aDisplayedDates.reduce(function (aWeekNumbers, oDay) {
			const iWeekNumber = CalendarUtils.calculateWeekNumber(oDay, oCalType, sLocale, sCalendarWeekNumbering, this._getFirstWeekDay());

			if (!aWeekNumbers.length || aWeekNumbers[aWeekNumbers.length - 1].number !== iWeekNumber) {
				aWeekNumbers.push({
					len: 0,
					number: iWeekNumber
				});
			}

			aWeekNumbers[aWeekNumbers.length - 1].len++;

			return aWeekNumbers;
		}.bind(this), []);

		return weekNumbers;
	};

	/**
	 * Helper that returns the first and last week numbers for each month
	 * in the current interval. The returned object maps the month index
	 * (0..n-1) to an object with `first` and `last` week numbers.
	 *
	 * @returns {Object<number, {first: number, last: number}>} Mapping of month index to week numbers.
	 * @private
	 */
	WeeksRow.prototype._getMonthsFirstAndLastWeekNumbers = function() {
		const oStartDate = this.getStartDate();
		const iInterval = this.getInterval();
		const iCurrentYear = oStartDate.getFullYear();
		let iCurrentDateMonth = oStartDate.getMonth();
		const oWeeks = {};
		const sPrimaryCalendarType = this.getPrimaryCalendarType();
		const sCalendarWeekNumbering = this.getCalendarWeekNumbering() || "Default";

		for (let i = 0; i < iInterval; i++) {
			const oFirstDateOfMonth = UI5Date.getInstance(iCurrentYear, iCurrentDateMonth, 1);
			const oLastDateOfMonth = CalendarUtils.getLastDateOfMonth(oFirstDateOfMonth);
			const oFirstDateOfStartWeek = CalendarUtils.getFirstDateOfWeek(oFirstDateOfMonth);
			const oFirstDateOfEndWeek = CalendarUtils.getFirstDateOfWeek(oLastDateOfMonth);

			// Calculate week numbers for the first and last week of the month
			const iFirstWeekNumber = iCurrentDateMonth === 0 ? 1 : CalendarUtils.calculateWeekNumber(new CalendarDate(CalendarDate.fromLocalJSDate(oFirstDateOfMonth), sPrimaryCalendarType), sPrimaryCalendarType, this._getLocale(), sCalendarWeekNumbering, oFirstDateOfStartWeek.getDay());
			const iLastWeekNumber = CalendarUtils.calculateWeekNumber(new CalendarDate(CalendarDate.fromLocalJSDate(oLastDateOfMonth.oDate), sPrimaryCalendarType), sPrimaryCalendarType, this._getLocale(), sCalendarWeekNumbering, oFirstDateOfEndWeek.getDay());

			oWeeks[i] = {
				first: iFirstWeekNumber,
				last: iLastWeekNumber
			};

			iCurrentDateMonth++;
		}

		return oWeeks;
	};

	return WeeksRow;

});