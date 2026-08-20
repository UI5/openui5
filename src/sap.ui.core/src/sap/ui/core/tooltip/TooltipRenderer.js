/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/Renderer"
], (
	Renderer
) => {
	"use strict";

	/**
	 * Tooltip renderer.
	 *
	 * @namespace
	 * @private
	 */
	const TooltipRenderer = Renderer.extend("sap.ui.core.TooltipRenderer", {
		apiVersion: 2
	});

	/**
	 * @param {sap.ui.core.RenderManager} oRm
	 * @param {sap.ui.core.tooltip.Tooltip} oTooltip
	 */
	TooltipRenderer.render = function(oRm, oTooltip) {
		oRm.openStart("div", oTooltip);
		oRm.class("sapUiCoreTooltip");

		if (oTooltip._sCalcedPos) {
			oRm.class("sapUiCoreTooltip-" + oTooltip._sCalcedPos);
		}

		oRm.attr("tabindex", "-1");
		oRm.attr("role", "dialog");
		oRm.attr("aria-modal", "true");
		oRm.openEnd();

		// Arrow
		oRm.openStart("span", oTooltip.getId() + "-arrow");
		oRm.class("sapUiCoreTooltipArrow");
		oRm.openEnd();
		oRm.close("span");

		// Tooltip text.
		oRm.openStart("div", oTooltip.getId() + "-cont");
		oRm.class("sapUiCoreTooltipCont");
		oRm.openEnd();

		oRm.openStart("span");
		oRm.class("sapUiCoreTooltipText");
		oRm.openEnd();
		oRm.text(oTooltip.getText());
		oRm.close("span");

		oRm.close("div");

		oRm.close("div");
	};

	return TooltipRenderer;
});
