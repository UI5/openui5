/*!
 * ${copyright}
 */

sap.ui.define([], () => {
	"use strict";

	/**
	 * FilterBar renderer.
	 * @namespace
	 */
	const FilterBarBaseRenderer = {
		apiVersion: 2
	};

	/**
	 * CSS class to be applied to the HTML root element of the {@link sap.ui.mdc.FilterBar FilterBar} control.
	 *
	 * @readonly
	 * @const {string}
	 */
	FilterBarBaseRenderer.CSS_CLASS = "sapUiMdcFilterBarBase";

	FilterBarBaseRenderer.render = function(oRm, oFilterBar) {
		oRm.openStart("div", oFilterBar);
		oRm.class(FilterBarBaseRenderer.CSS_CLASS);
		if (oFilterBar.isA("sap.ui.mdc.filterbar.p13n.AdaptationFilterBar") && oFilterBar.getProperty("_useFixedWidth")) {
			oRm.style("width", oFilterBar.getWidth());
		}
		oRm.openEnd();

		oFilterBar.getAggregation("invisibleTexts")?.forEach((oInvisibleText) => oRm.renderControl(oInvisibleText));

		const oInnerLayout = oFilterBar.getAggregation("layout") ? oFilterBar.getAggregation("layout").getInner() : null;
		oRm.renderControl(oInnerLayout);
		oRm.close("div");
	};

	return FilterBarBaseRenderer;
});
