/*!
 * ${copyright}
 */

// Provides control sap.ui.unified.MonthlyRecurrenceRule.
sap.ui.define([
	"./RecurrenceRule"
], function(RecurrenceRule) {
	"use strict";

	/**
	 * Constructor for a new <code>MonthlyRecurrenceRule</code>.
	 *
	 * @param {string} [sId] ID for the new element, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new element
	 *
	 * @class
	 * Concrete recurrence rule for <code>Monthly</code> recurrence.
	 * Created internally by the parent when a {@link sap.ui.unified.RecurrenceRule} DTO
	 * with <code>recurrenceType</code> set to <code>Monthly</code> is provided.
	 *
	 * Supports two patterns:
	 * <ul>
	 *   <li><code>DayOfMonth</code> — e.g. "the 15th of each month"</li>
	 *   <li><code>DayOfWeek</code> — e.g. "second Tuesday of each month"</li>
	 * </ul>
	 *
	 * @extends sap.ui.unified.RecurrenceRule
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @ui5-experimental-since 1.149
	 * @alias sap.ui.unified.MonthlyRecurrenceRule
	 */
	const MonthlyRecurrenceRule = RecurrenceRule.extend("sap.ui.unified.MonthlyRecurrenceRule", {
		metadata: {
			library: "sap.ui.unified"
		}
	});

	/**
	 * Sets the day of week with validation.
	 * @param {int} iDay - Day of week (0-6, 0=Sunday)
	 * @returns {this}
	 * @private
	 */
	MonthlyRecurrenceRule.prototype.setDayOfWeek = function(iDay) {
		if (iDay < 0 || iDay > 6) {
			throw new Error("dayOfWeek must be between 0 (Sunday) and 6 (Saturday)");
		}
		return this.setProperty("dayOfWeek", iDay);
	};

	return MonthlyRecurrenceRule;
});
