/*!
 * ${copyright}
 */

// Provides control sap.ui.unified.YearlyRecurrenceRule.
sap.ui.define([
	"./MonthlyRecurrenceRule"
], function(MonthlyRecurrenceRule) {
	"use strict";

	/**
	 * Constructor for a new <code>YearlyRecurrenceRule</code>.
	 *
	 * @param {string} [sId] ID for the new element, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new element
	 *
	 * @class
	 * Concrete recurrence rule for <code>Yearly</code> recurrence.
	 * Extends {@link sap.ui.unified.MonthlyRecurrenceRule} with a <code>month</code> property.
	 * Created internally by the parent when a {@link sap.ui.unified.RecurrenceRule} DTO
	 * with <code>recurrenceType</code> set to <code>Yearly</code> is provided.
	 *
	 * @extends sap.ui.unified.MonthlyRecurrenceRule
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @ui5-experimental-since 1.149
	 * @alias sap.ui.unified.YearlyRecurrenceRule
	 */
	const YearlyRecurrenceRule = MonthlyRecurrenceRule.extend("sap.ui.unified.YearlyRecurrenceRule", {
		metadata: {
			library: "sap.ui.unified"
		}
	});

	/**
	 * Sets the month with validation.
	 * @param {int} iMonth - Month (0-11)
	 * @returns {this}
	 * @private
	 */
	YearlyRecurrenceRule.prototype.setMonth = function(iMonth) {
		if (iMonth < -1 || iMonth > 11) {
			throw new Error("month must be between 0 and 11");
		}
		return this.setProperty("month", iMonth);
	};

	return YearlyRecurrenceRule;
});
