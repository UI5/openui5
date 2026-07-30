/*!
 * ${copyright}
 */

// Provides control sap.ui.unified.DateTypeRange.
sap.ui.define([
	'./DateRange',
	'./library',
	'sap/ui/core/library'
],
function(
	DateRange,
	library,
	coreLibrary
) {
	"use strict";

	// shortcut for sap.ui.unified.CalendarDayType
	var CalendarDayType = library.CalendarDayType;

	// shortcut for sap.ui.core.aria.HasPopup
	var AriaHasPopup = coreLibrary.aria.HasPopup;



	/**
	 * Constructor for a new DateTypeRange.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * Date range with calendar day type information. Used to visualize special days in the Calendar.
	 * @extends sap.ui.unified.DateRange
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.24.0
	 * @alias sap.ui.unified.DateTypeRange
	 */
	var DateTypeRange = DateRange.extend("sap.ui.unified.DateTypeRange", /** @lends sap.ui.unified.DateTypeRange.prototype */ { metadata : {

		library : "sap.ui.unified",
		properties : {

			/**
			 * Type of the date range.
			 */
			type : {type : "sap.ui.unified.CalendarDayType", group : "Appearance", defaultValue : CalendarDayType.Type01},

			/**
			 * Applies additional <code>sap.ui.unified.CalendarDayType</code>, with which <code>sap.ui.unified.CalendarDayType.NonWorking</code>
			 * or <code>sap.ui.unified.CalendarDayType.Working</code> types could be represented as well.
			 * @since 1.81.0
			 */
			secondaryType : {type : "sap.ui.unified.CalendarDayType", group : "Appearance", defaultValue : CalendarDayType.None},

			/**
			 * Background color of the <code>Calendar</code> <code>specialDates</code> aggregation.
			 * If set, this color will override the default background color defined in <code>Calendar</code> <code>specialDates</code> aggregation
			 * @since 1.76.0
			 */
			color : {type : "sap.ui.core.CSSColor", group : "Appearance", defaultValue : null},

			/**
			 * Defines the value of the <code>aria-haspopup</code> attribute of the day cell.
			 *
			 * <b>Note:</b> Use this property only when the cell is related to a popover/popup.
			 * The value should be equal to the main/root role of the popup.
			 *
			 * <b>Note:</b> Setting <code>type</code> to <code>sap.ui.unified.CalendarDayType.None</code>
			 * together with this property allows adding the attribute without any visual marking.
			 * @since 1.152.0
			 */
			ariaHasPopup : {type : "sap.ui.core.aria.HasPopup", group : "Accessibility", defaultValue : AriaHasPopup.None}
		}
	}});

	return DateTypeRange;

});
