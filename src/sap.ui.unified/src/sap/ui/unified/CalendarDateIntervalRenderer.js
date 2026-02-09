/*!
 * ${copyright}
 */

sap.ui.define(['sap/ui/core/Renderer', './CalendarRenderer'],
	function(Renderer, CalendarRenderer) {
	"use strict";


	/**
	 * CalendarDateInterval renderer.
	 * @namespace
	 */
	var CalendarDateIntervalRenderer = Renderer.extend(CalendarRenderer);
	CalendarDateIntervalRenderer.apiVersion = 2;

	CalendarDateIntervalRenderer.renderCalContentOverlay = function() {
	// we don't need the ContentOverlay in CalendarDateInterval case
	};

	CalendarDateIntervalRenderer.renderCalContentAndArrowsOverlay = function(oRm, oCal, sId) {

		if (oCal.getPickerPopup()) {
			oRm.openStart("div", sId + "-contentOver");
			oRm.class("sapUiCalContentOver");
			if (!oCal._oPopup || !oCal._oPopup.isOpen()) {
				oRm.style("display", "none");
			}
			oRm.openEnd();
			oRm.close("div");
		}

	};

	CalendarDateIntervalRenderer.renderMonths = function(oRm, oCal, aMonths) {
		// Call base implementation to render the months (days)
		CalendarRenderer.renderMonths.call(this, oRm, oCal, aMonths);

		// Render WeeksRow aggregation after the days if showWeekNumbers is enabled
		if (oCal.getShowWeekNumbers()) {
			const oWeeksRow = oCal.getAggregation("_weeksRow");
			if (oWeeksRow) {
				oRm.renderControl(oWeeksRow);
			}
		}
	};

	CalendarDateIntervalRenderer.addAttributes = function(oRm, oCal) {

		oRm.class("sapUiCalInt");
		oRm.class("sapUiCalDateInt");
		var iDays = oCal._getDays();

		if (iDays > oCal._getDaysLarge()) {
			oRm.class("sapUiCalIntLarge");
		}

		if (iDays > oCal._iDaysMonthHead) {
			oRm.class("sapUiCalIntHead");
		}

		if (oCal.getShowDayNamesLine()) {
			oRm.class("sapUiCalWithDayNamesLine");
		}

		if (oCal.getShowWeekNumbers()) {
			oRm.class("sapUiCalWithWeekNumbers");
		}

	};

	return CalendarDateIntervalRenderer;

}, /* bExport= */ true);
