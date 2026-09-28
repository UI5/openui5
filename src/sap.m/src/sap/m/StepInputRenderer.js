/*!
 * ${copyright}
 */
sap.ui.define([], function () {
	"use strict";

	/**
	 * <code>StepInput</code> renderer.
	 * @namespace
	 */
	var StepInputRenderer = {
		apiVersion: 2
	};

	StepInputRenderer.render = function (oRm, oControl) {
		var oNumericInput = oControl._getNumericInput();

		oRm.openStart("div", oControl);
		oRm.class("sapMStepInput");
		oRm.openEnd();

		oRm.renderControl(oNumericInput);

		oRm.close("div");
	};

	return StepInputRenderer;

}, /* bExport= */ true);
