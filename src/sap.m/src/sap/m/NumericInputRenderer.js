/*!
 * ${copyright}
 */
sap.ui.define([], function () {
	"use strict";

	/**
	 * <code>NumericInput renderer</code>
	 * @namespace
	 */
	var NumericInputRenderer = {
		apiVersion: 2
	};

	NumericInputRenderer.render = function (oRm, oControl) {
		var oInput = oControl._getInput(),
			sWidth = oControl.getWidth(),
			bEnabled = oControl.getEnabled(),
			bEditable = oControl.getEditable(),
			sValueState = oControl.getValueState();

		oRm.openStart("div", oControl);
		oRm.style("width", sWidth);
		oRm.class("sapMNumericInput");
		oRm.class("sapMNumericInput-CTX");
		!bEnabled && oRm.class("sapMNumericInputReadOnly");
		!bEditable && oRm.class("sapMNumericInputNotEditable");
		if (sValueState === "Error" || sValueState === "Warning") {
			oRm.class("sapMNumericInput" + sValueState);
		}
		oRm.openEnd();

		oRm.renderControl(oInput);

		oRm.close("div");
	};

	return NumericInputRenderer;

});
