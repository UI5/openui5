/*!
 * ${copyright}
 */
sap.ui.define([
	'./_IconRegistry',
	'./_IconSVGStrategy',
	'./library',
	'sap/base/security/encodeCSS'
], function(_IconRegistry, SVGStrategy, library, encodeCSS) {
	"use strict";

	// shortcut for enum(s)
	const IconColor = library.IconColor;

	/**
	 * Font-Icon renderer.
	 * @namespace
	 * @alias sap.ui.core.IconRenderer
	 */
	const IconRenderer = {
		apiVersion: 2
	};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
	 * @param {sap.ui.core.Icon} oControl An object representation of the control that should be rendered.
	 */
	IconRenderer.render = function(oRm, oControl) {
		// write the HTML into the render manager
		const vIconInfo = _IconRegistry.getIconInfo(oControl.getSrc(), undefined, "mixed");

		const sWidth = oControl.getWidth(),
			sHeight = oControl.getHeight(),
			sColor = oControl.getColor(),
			sBackgroundColor = oControl.getBackgroundColor(),
			sSize = oControl.getSize(),
			sTitle = oControl._getOutputTitle(vIconInfo);

		let aLabelledBy, oInvisibleText, oAccAttributes, bIconInfo = false;

		if (vIconInfo instanceof Promise) {
			// if the icon info is still being loaded,
			// an invalidation is triggered after the icon info is available
			vIconInfo.then(oControl.invalidate.bind(oControl));
		} else if (vIconInfo) {
			// render icon info in renderer
			bIconInfo = true;
			aLabelledBy = oControl.getAriaLabelledBy();

			oAccAttributes = oControl._getAccessibilityAttributes(vIconInfo);
			// oInvisibleText must be retrieved after calling _getAccessibilityAttributes
			// because it may be created within the function
			oInvisibleText = oControl.getAggregation("_invisibleText");
		}

		oRm.openStart("span", oControl);
		oRm.class("sapUiIcon");

		if (bIconInfo && !vIconInfo.suppressMirroring) {
			oRm.class("sapUiIconMirrorInRTL");
		}

		const sType = bIconInfo ? vIconInfo.type : _IconRegistry.getIconType(oControl.getSrc());

		if (sType === _IconRegistry.TYPE_FONT) {
			if (bIconInfo) {
				oRm.attr("data-sap-ui-icon-content", vIconInfo.content);
				oRm.style("font-family", "'" + encodeCSS(vIconInfo.fontFamily) + "'");
			}
		} else if (sType === _IconRegistry.TYPE_SVG) {
			oRm.class("sapUiIconSVG");

			if (bIconInfo && vIconInfo.content) {
				oRm.attr("data-sap-ui-icon-content", vIconInfo.content);
			}

			if (bIconInfo && vIconInfo.collection) {
				oRm.attr("data-sap-ui-icon-collection", vIconInfo.collection);
			}

			if (bIconInfo) {
				oRm.class("sapUiIconSVGMask");
				const sCSSVar = SVGStrategy.getCSSVarName(vIconInfo);
				oRm.style("--sapUiIconSVGMaskUrl", "var(" + sCSSVar + ")");
			}
		}

		if (bIconInfo) {
			oRm.accessibilityState(oControl, oAccAttributes);
		}

		if (oControl.hasListeners("press")) {
			oRm.class("sapUiIconPointer");
			if (!oControl.getNoTabStop()) {
				oRm.attr("tabindex", "0");
			}
		}

		oRm.style("width", sWidth);
		oRm.style("height", sHeight);
		oRm.style("line-height", sHeight);
		oRm.style("font-size", sSize);

		if (sColor && !(sColor in IconColor)) {
			oRm.style("color", sColor);
		}

		if (sBackgroundColor && !(sBackgroundColor in IconColor)) {
			oRm.style("background-color", sBackgroundColor);
		}

		oRm.openEnd();

		if (sTitle) {
			oRm.openStart("span").class("sapUiIconTitle").attr("title", sTitle).attr("aria-hidden", true).openEnd().close("span");
		}

		if (aLabelledBy && aLabelledBy.length && oInvisibleText) {
			oRm.renderControl(oInvisibleText);
		}

		oRm.close("span");
	};

	return IconRenderer;

}, /* bExport= */ true);