/*!
 * ${copyright}
 */
sap.ui.define([
		'sap/ui/unified/library'
	], function(library) {
"use strict";

// shortcut for sap.ui.unified.CalendarAppointmentRoundWidth
const CalendarAppointmentRoundWidth = library.CalendarAppointmentRoundWidth;

/**
 * PlanningCalendar renderer.
 * @namespace
 */
const PlanningCalendarRenderer = {
	apiVersion: 2
};

/**
 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
 *
 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
 * @param {sap.m.PlanningCalendar} oPC An object representation of the <code>PlanningCalendar</code> control that should be rendered.
 */
PlanningCalendarRenderer.render = function(oRm, oPC){

	const sId = oPC.getId();
	const sTooltip = oPC.getTooltip_AsString();
	const oHeader = oPC._getHeader();
	const sTitleId = oHeader.getTitle().getId();

	oRm.openStart("div", oPC);
	oRm.class("sapMPlanCal");
	oRm.accessibilityState({
		role: "region",
		roledescription: oPC._oRB.getText("PLANNINGCALENDAR"),
		labelledby: {
			value: sTitleId,
			append: true
		}
	});
	this.addAdditionalClasses(oRm, oPC);

	switch (oPC.getAppointmentRoundWidth()) {
		case CalendarAppointmentRoundWidth.HalfColumn :
			oRm.class("sapUiCalendarAppHalfColumnRounding");
		break;
	}

	if (!oPC.getSingleSelection()) {
		oRm.class("sapMPlanCalMultiSel");
	}

	if (!oPC.getShowRowHeaders()) {
		oRm.class("sapMPlanCalNoHead");
	}

	if (oPC.getShowWeekNumbers() && oPC._viewAllowsWeekNumbers(oPC.getViewKey())) {
		oRm.class("sapMPlanCalWithWeekNumbers");
	}

	if (oPC.getShowDayNamesLine() && oPC._viewAllowsDayNamesLine(oPC.getViewKey())) {
		oRm.class("sapMPlanCalWithDayNamesLine");
	}

	if (sTooltip) {
		oRm.attr('title', sTooltip);
	}

	const sWidth = oPC.getWidth();
	if (sWidth) {
		oRm.style("width", sWidth);
	}

	const sHeight = oPC.getHeight();
	if (sHeight) {
		oRm.style("height", sHeight);
	}

	oRm.accessibilityState(oPC);
	oRm.openEnd(); // div element

	oRm.renderControl(oHeader);

	const oTable = oPC.getAggregation("table");
	oRm.renderControl(oTable);

	let sAriaText = oPC._oRB.getText("PLANNINGCALENDAR");
	oRm.openStart("span", sId + "-Descr");
	oRm.class("sapUiInvisibleText");
	oRm.openEnd(); //span
	oRm.text(sAriaText);
	oRm.close("span");

	sAriaText = oPC._oRB.getText("PLANNINGCALENDAR_VIEW");
	oRm.openStart("span", sId + "-SelDescr");
	oRm.class("sapUiInvisibleText");
	oRm.openEnd(); //span
	oRm.text(sAriaText);
	oRm.close("span");
	oRm.close("div");
};

/**
 * A hook for extended classes to include additional classes.
 *
 * @private
 */
PlanningCalendarRenderer.addAdditionalClasses = function () {};

return PlanningCalendarRenderer;

});
