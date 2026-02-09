/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/unified/library",
	"sap/ui/core/Lib",
	"sap/base/i18n/date/CalendarType"
],
	function(
		library,
		coreLibrary,
		CalendarType
	) {
	"use strict";

	const CalendarIntervalType = library.CalendarIntervalType;

	/**
	 * WeeksRow renderer.
	 * @namespace
	 */
	const WeeksRowRenderer = {
		apiVersion: 2
	};

	WeeksRowRenderer.render = function (oRm, oWeeksRow) {
		const bShowWeekNumbers = oWeeksRow.getShowWeekNumbers();
		const sPrimaryCalendarType = oWeeksRow.getPrimaryCalendarType();
		const sViewKey = oWeeksRow.getViewKey();
		if (!bShowWeekNumbers || sPrimaryCalendarType !== CalendarType.Gregorian) {
			return;
		}

		oRm.openStart("div", oWeeksRow);
		oRm.class("sapUiCalWeeksRow");
		oRm.class(`sapMPlanWeeksRow${sViewKey}View`);
		oRm.openEnd();
		oRm.openStart("div");
		oRm.class("sapMPlanWeeksLabelRow");
		oRm.openEnd();
		if (sViewKey === CalendarIntervalType.Month) {
			const oResourceBundle = coreLibrary.getResourceBundleFor("sap.ui.unified");
			oRm.openStart("div");
			oRm.class("sapUiCalRowWeekLabel");
			oRm.openEnd();
			oRm.text(oResourceBundle.getText("CALENDAR_WEEK_NUMBERS"));
			oRm.close("div");
		}
		oRm.close("div");
		oRm.openStart("div");
		oRm.class("sapMPlanWeeksDataRow");
		oRm.openEnd();
		if (sViewKey === CalendarIntervalType.Month) {
			this.renderMonthsWeeks(oRm, oWeeksRow);
		} else if (sViewKey === CalendarIntervalType.Day) {
			this.renderDaysWeeks(oRm, oWeeksRow);
		}
		oRm.close("div");
		oRm.close("div");
	};

	WeeksRowRenderer.renderMonthsWeeks = function(oRm, oWeeksRow) {
		const iInterval = oWeeksRow.getInterval();
		const aWeeks = oWeeksRow._getMonthsFirstAndLastWeekNumbers();
		const sWidth = ( 100 / iInterval ) + "%";

		oRm.openStart("div");
		oRm.class("sapUiCalRowWeekNumbers");
		oRm.openEnd();
		for (var i = 0; i < iInterval; i++) {
			const oWeekInfo = aWeeks[i];
			oRm.openStart("div", i + "-week");
			oRm.class("sapUiCalRowWeekNumber");
			if (sWidth) {
				oRm.style("width", sWidth);
			}
			oRm.openEnd();
			oRm.text(`${oWeekInfo.first} - ${oWeekInfo.last}`);
			oRm.close("div");
		}

		oRm.close("div");
	};

	WeeksRowRenderer.renderDaysWeeks = function(oRm, oWeeksRow) {
		const iDays = oWeeksRow.getInterval();
		const iDaysWidth = 100 / iDays;
		const aWeekNumbers = oWeeksRow._getWeekNumbers();
		const oResourceBundle = coreLibrary.getResourceBundleFor("sap.ui.unified");

		oRm.openStart("div");
		oRm.class("sapUiCalRowWeekNumbers");
		oRm.openEnd();

		aWeekNumbers.forEach(function(oWeek) {
			oRm.openStart("div", oWeeksRow.getId() + "-week-" + oWeek.number + "-text");
			oRm.class('sapUiCalRowWeekNumber');
			oRm.style("width", oWeek.len * iDaysWidth + "%");
			oRm.attr("data-sap-ui-week", oWeek.number);
			oRm.openEnd();
			oRm.text(oResourceBundle.getText('CALENDAR_DATES_ROW_WEEK_NUMBER', [oWeek.number]));
			oRm.close("div");
		});

		oRm.close("div");
	};

	return WeeksRowRenderer;
});