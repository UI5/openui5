/*!
 * ${copyright}
 */

sap.ui.define([], function() {
	"use strict";

	/**
	 * TimePickerInputs renderer.
	 * @namespace
	 */
	var TimePickerInputsRenderer = {
		apiVersion: 2
	};

	/**
	 * Maps a numeric input's ID suffix to the corresponding Label instance on the control.
	 * Returns null for non-numeric inputs (e.g. AM/PM SegmentedButton).
	 *
	 * @param {sap.m.TimePickerInputs} oControl
	 * @param {sap.ui.core.Control} oInput
	 * @returns {sap.m.Label|null}
	 * @private
	 */
	TimePickerInputsRenderer._getLabelForInput = function(oControl, oInput) {
		switch (oInput.getId().slice(-7)) {
			case "-inputH": return oControl._oLabelH || null;
			case "-inputM": return oControl._oLabelM || null;
			case "-inputS": return oControl._oLabelS || null;
			default:        return null;
		}
	};

	/**
	 * Renders the HTML for the given {@link sap.m.TimePickerInputs} control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRM The RenderManager that can be used for writing to the render output buffer
	 * @param {sap.m.TimePickerInputs} oControl An object representation of the control that should be rendered
	 */
	TimePickerInputsRenderer.render = function(oRm, oControl) {
		var aInputs = oControl.getAggregation("_inputs"),
			oSegButton = oControl.getAggregation("_buttonAmPm"),
			iIndex,
			oLabel;

		if (!aInputs) {
			return;
		}

		oRm.openStart("div", oControl); // outer wrapper
		oRm.class("sapMTPInputsContainer");
		if (oControl._bInlineActions) {
			oRm.class("sapMTPHasInlineActions");
		}
		oRm.attr("role", "application");
		oRm.attr("aria-roledescription", oControl._getAriaRoleDescription());
		oRm.openEnd();

		// Render H, M, S inputs — each wrapped with its label, separated by ":"
		for (iIndex = 0; iIndex < aInputs.length; iIndex++) {
			oLabel = TimePickerInputsRenderer._getLabelForInput(oControl, aInputs[iIndex]);

			oRm.openStart("div");
			oRm.class("sapMTPInputWrapper");
			oRm.openEnd();

			if (oLabel) {
				oRm.renderControl(oLabel);
			}

			oRm.renderControl(aInputs[iIndex]);
			oRm.close("div"); // .sapMTPInputWrapper

			// ":" separator between inputs, not after the last one
			if (iIndex < aInputs.length - 1) {
				oRm.openStart("span");
				oRm.class("sapMTPInputsSeparator");
				oRm.attr("aria-hidden", "true");
				oRm.openEnd();
				oRm.text(":");
				oRm.close("span");
			}
		}

		// AM/PM and Now are grouped so they always wrap as a single unit
		oRm.openStart("div");
		oRm.class("sapMTPSecondRow");
		oRm.openEnd();
		if (oSegButton) {
			oRm.renderControl(oSegButton);
		}
		oRm.renderControl(oControl._getCurrentTimeButton());
		oRm.close("div"); // .sapMTPSecondRow

		if (oControl._bInlineActions) {
			// Inline action row — buttons float right, not full-width toolbar
			oRm.openStart("div");
			oRm.class("sapMTPNumericActionRow");
			oRm.openEnd();
			oRm.renderControl(oControl._getOkButton());
			oRm.renderControl(oControl._getCancelButton());
			oRm.close("div"); // .sapMTPNumericActionRow
		}

		oRm.close("div"); // outer wrapper
	};

	return TimePickerInputsRenderer;
});
