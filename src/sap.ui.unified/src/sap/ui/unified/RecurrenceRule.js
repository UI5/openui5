/*!
 * ${copyright}
 */

// Provides control sap.ui.unified.RecurrenceRule.
sap.ui.define([
	"sap/ui/core/Element",
	"./library",
	"./calendar/RecurrenceUtils"
], function(Element, library, RecurrenceUtils) {
	"use strict";

	const RecurrenceRuleType = library.RecurrenceRuleType;
	const WeekOfMonth = library.WeekOfMonth;

	/**
	 * Constructor for a new <code>RecurrenceRule</code>.
	 *
	 * @param {string} [sId] ID for the new element, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new element
	 *
	 * @class
	 * Binding DTO for recurrence rule configuration. Carries all possible recurrence properties
	 * along with the <code>recurrenceType</code> that determines which properties are relevant.
	 *
	 * When set on a parent aggregation, the parent internally creates the correct concrete
	 * subclass ({@link sap.ui.unified.WeeklyRecurrenceRule}, {@link sap.ui.unified.MonthlyRecurrenceRule},
	 * or {@link sap.ui.unified.YearlyRecurrenceRule}) via {@link sap.ui.unified.RecurrenceRule._factory}.
	 *
	 * <h3>Usage in XML binding</h3>
	 * <pre>
	 * &lt;unified:recurrenceRule&gt;
	 *   &lt;unified:RecurrenceRule
	 *     recurrenceType="{/RecurrenceType}"
	 *     days="{/Days}"
	 *     weekOfMonth="{/WeekOfMonth}"
	 *     dayOfMonth="{/DayOfMonth}"
	 *     month="{/Month}" /&gt;
	 * &lt;/unified:recurrenceRule&gt;
	 * </pre>
	 *
	 * @extends sap.ui.core.Element
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @ui5-experimental-since 1.149
	 * @alias sap.ui.unified.RecurrenceRule
	 */
	const RecurrenceRule = Element.extend("sap.ui.unified.RecurrenceRule", {
		metadata: {
			library: "sap.ui.unified",
			properties: {
				/**
				 * The recurrence type. Determines which properties are relevant and
				 * which concrete subclass is created internally by the parent.
				 */
				recurrenceType: {type: "sap.ui.unified.RecurrenceType", group: "Behavior"},

				/**
				 * Days of week for weekly recurrence (0–6, 0 = Sunday).
				 * Relevant when <code>recurrenceType</code> is <code>Weekly</code>.
				 */
				days: {type: "int[]", defaultValue: []},

				/**
				 * Type of the advanced recurrence pattern.
				 * Relevant when <code>recurrenceType</code> is <code>Monthly</code> or <code>Yearly</code>.
				 */
				type: {type: "sap.ui.unified.RecurrenceRuleType", group: "Behavior", defaultValue: RecurrenceRuleType.DayOfMonth},

				/**
				 * Day of month (1–31). A value of <code>0</code> means "inherit from parent start date".
				 * Relevant when <code>type</code> is <code>DayOfMonth</code>.
				 */
				dayOfMonth: {type: "int", group: "Behavior", defaultValue: 0},

				/**
				 * Week of month (First, Second, Third, Fourth, Last).
				 * Relevant when <code>type</code> is <code>DayOfWeek</code>.
				 */
				weekOfMonth: {type: "sap.ui.unified.WeekOfMonth", group: "Behavior", defaultValue: WeekOfMonth.First},

				/**
				 * Day of week (0–6, 0 = Sunday).
				 * Relevant when <code>type</code> is <code>DayOfWeek</code>.
				 */
				dayOfWeek: {type: "int", group: "Behavior", defaultValue: 0},

				/**
				 * Month of year (0–11, 0 = January).
				 * Relevant when <code>recurrenceType</code> is <code>Yearly</code>.
				 */
				month: {type: "int", group: "Behavior", defaultValue: -1}
			}
		}
	});

	/**
	 * Sets the days of week (0–6, 0 = Sunday).
	 * @param {number|number[]} vDays
	 * @returns {this}
	 * @public
	 */
	RecurrenceRule.prototype.setDays = function(vDays) {
		return this.setProperty("days", RecurrenceUtils._normalizeRecurrenceDays(vDays));
	};

	return RecurrenceRule;
});
