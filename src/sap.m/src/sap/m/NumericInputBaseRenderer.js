/*!
 * ${copyright}
 */

sap.ui.define(["sap/base/i18n/Localization", "sap/ui/core/Renderer", "./InputRenderer", "sap/ui/Device", "sap/ui/core/Element"],
	function(Localization, Renderer, InputRenderer, Device, Element) {
	"use strict";

	/**
	* NumericInputBase renderer.
	*
	* NumericInputBaseRenderer extends the InputRenderer.
	*
	* @namespace
	*/
	var NumericInputBaseRenderer = Renderer.extend(InputRenderer);
	NumericInputBaseRenderer.apiVersion = 2;

	NumericInputBaseRenderer.writeInnerAttributes = function(oRm, oControl) {
		var oNumericInput = oControl._getParent(),
			mAccAttributes = this.getAccessibilityState(oControl);

		oRm.attr("type", Device.system.desktop ? "text" : "number");

		// inside the Input this function also sets explicitly textAlign to "End" if the type
		// of the Input is Numeric (our case)
		// so we have to overwrite it by leaving only the text direction
		// and the textAlign will be controlled by textAlign property of the NumericInput

		if (Localization.getRTL()) {
			oRm.attr("dir", "ltr");
		}
		// prevent rendering of aria-disabled attribute to avoid having
		// both aria-disabled and disabled at the same time
		mAccAttributes.disabled = null;

		if (!NumericInputBaseRenderer._isNumericInput(oNumericInput)) {
			return;
		}

		var oAccElement = oNumericInput._getOwnerControlId()
			? Element.getElementById(oNumericInput._getOwnerControlId()) || oNumericInput
			: oNumericInput;
		oRm.accessibilityState(oAccElement, mAccAttributes);
	};

	/**
	 * Returns aria accessibility role for the control.
	 *
	 * @protected
	 * @override
	 * @param {sap.m.Input} oControl An object representation of the control
	 * @returns {string}
	 */
	NumericInputBaseRenderer.getAriaRole = function (oControl) {
		return "spinbutton";
	};

	//Accessibility behavior of the Input needs to be extended
	/**
	* Overwrites the accessibility state using the <code>getAccessibilityState</code> method of the <code>InputBaseRenderer</code>.
	*
	* @param {sap.m.NumericInputBase} oNumericInputBase The numeric input base instance
	* @returns {object} mAccessibilityState
	*/
	NumericInputBaseRenderer.getAccessibilityState = function(oNumericInputBase) {
		var mAccessibilityState = InputRenderer.getAccessibilityState.apply(this, arguments),
			oNumericInput = oNumericInputBase._getParent(),
			sValue = oNumericInputBase.getValue();

		if (!NumericInputBaseRenderer._isNumericInput(oNumericInput)) {
			return mAccessibilityState;
		}

		var fMin = oNumericInput._getMin(),
			fMax = oNumericInput._getMax(),
			fNow = oNumericInput.getValue(),
			sDescription = oNumericInput.getDescription(),
			sDescribedBy = oNumericInput.getAriaDescribedBy().join(" ");

		mAccessibilityState.valuenow = fNow;

		if (Device.system.desktop && sValue) {
			mAccessibilityState.valuetext = sValue;
		}

		if (sDescription) {
			mAccessibilityState.labelledby = { value: oNumericInput._getInput().getId() + "-descr", append: true };
		}

		if (typeof fMin === "number") {
			mAccessibilityState.valuemin = fMin;
		}

		if (typeof fMax === "number") {
			mAccessibilityState.valuemax = fMax;
		}

		if (!oNumericInput.getEditable()) {
			mAccessibilityState.readonly = true;
		}

		if (sDescribedBy) {
			mAccessibilityState.describedby = { value: sDescribedBy, append: true };
		}

		return mAccessibilityState;
	};

	NumericInputBaseRenderer._isNumericInput = function(oControl) {
		return oControl && oControl.getMetadata().getName() === "sap.m.NumericInput";
	};

	return NumericInputBaseRenderer;
});
