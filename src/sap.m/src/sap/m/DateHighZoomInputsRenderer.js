/*!
 * ${copyright}
 */

sap.ui.define(["sap/ui/core/Lib", "./library"], function(Library, library) {
	"use strict";

	const oResourceBundle = Library.getResourceBundleFor("sap.m");

	/**
	 * DateHighZoomInputs renderer.
	 * @namespace
	 */
	const DateHighZoomInputsRenderer = { apiVersion: 2 };

	/**
	 * Renders the HTML for the given control.
	 *
	 * @param {sap.ui.core.RenderManager} oRm
	 * @param {sap.m.DateHighZoomInputs} oControl
	 */
	DateHighZoomInputsRenderer.render = function(oRm, oControl) {
		const bPickerVisible = oControl.getProperty("_yearPickerVisible");
		const bRange = oControl.getMode() === library.DateHighZoomInputsMode.Range;

		oRm.openStart("div", oControl);
		oRm.class("sapMDPHZInputs");
		if (bRange) {
			oRm.class("sapMDPHZRange");
		}
		oRm.openEnd();

		// Date inputs section (hidden when year picker is open)
		oRm.openStart("div");
		oRm.attr("id", oControl.getId() + "-inputs");
		oRm.class("sapMDPHZContainer");
		if (bPickerVisible) {
			oRm.style("display", "none");
		}
		oRm.openEnd();

		if (bRange) {
			oControl._createEndDateControls();

			// Start-date group
			oRm.openStart("div").class("sapMDPHZRangeGroup").openEnd();
			oRm.openStart("div").class("sapMDPHZRangeGroupLabel").openEnd();
			oRm.text(oResourceBundle.getText("DATEPICKER_HZ_FROM_LABEL"));
			oRm.close("div");
			DateHighZoomInputsRenderer._renderFields(oRm, oControl, false);
			oRm.close("div");

			// End-date group
			oRm.openStart("div").class("sapMDPHZRangeGroup").openEnd();
			oRm.openStart("div").class("sapMDPHZRangeGroupLabel").openEnd();
			oRm.text(oResourceBundle.getText("DATEPICKER_HZ_TO_LABEL"));
			oRm.close("div");
			DateHighZoomInputsRenderer._renderFields(oRm, oControl, true);
			oRm.close("div");
		} else {
			DateHighZoomInputsRenderer._renderFields(oRm, oControl, false);
		}

		oRm.close("div"); // inputs section

		// Year picker section
		oRm.openStart("div");
		oRm.attr("id", oControl.getId() + "-yearpicker");
		oRm.class("sapMDPHZContainer");
		if (!bPickerVisible) {
			oRm.style("display", "none");
		}
		oRm.openEnd();

		oRm.renderControl(oControl._oYearNavHeader);
		oRm.renderControl(oControl._oYearPicker);

		oRm.close("div");

		oRm.close("div");
	};

	/**
	 * Renders Year/Month/Day field rows for either the start or end group.
	 * @param {sap.ui.core.RenderManager} oRm
	 * @param {sap.m.DateHighZoomInputs} oControl
	 * @param {boolean} bEnd
	 */
	DateHighZoomInputsRenderer._renderFields = function(oRm, oControl, bEnd) {
		const bYear  = oControl._isYearVisible();
		const bMonth = oControl._isMonthVisible();
		const bDay   = oControl._isDayVisible();

		const aFields = bEnd
			? [
				{ label: oControl._oYearLabelEnd,  ctrl: oControl._oYearInputEnd,   show: bYear  },
				{ label: oControl._oMonthLabelEnd, ctrl: oControl._oMonthSelectEnd,  show: bMonth },
				{ label: oControl._oDayLabelEnd,   ctrl: oControl._oDaySelectEnd,    show: bDay   }
			]
			: [
				{ label: oControl._oYearLabel,  ctrl: oControl._oYearInput,    show: bYear  },
				{ label: oControl._oMonthLabel, ctrl: oControl._oMonthSelect,   show: bMonth },
				{ label: oControl._oDayLabel,   ctrl: oControl._oDaySelect,     show: bDay   }
			];

		aFields.filter((f) => f.show).forEach(({ label, ctrl }) => {
			oRm.openStart("div").class("sapMDPHZRow").openEnd();
			oRm.renderControl(label);
			oRm.renderControl(ctrl);
			oRm.close("div");
		});
	};

	return DateHighZoomInputsRenderer;

});
