/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/util/uid",
	"sap/ui/fl/util/FocusPolicy"
], function(
	uid,
	FocusPolicy
) {
	"use strict";

	function _setDimensionAsStyle(oRm, sDimension, sValue) {
		if (sValue !== "" || sValue.toLowerCase() === "auto") {
			oRm.style(sDimension, sValue);
		}
	}

	function createsSandboxAttributesString(oAdvancedSettings) {
		return Object.keys(oAdvancedSettings)
		.filter((sKey) => oAdvancedSettings[sKey])
		.map((sKey) => sKey.replace(/[A-Z]/g, "-$&").toLowerCase())
		.join(" ");
	}

	/**
	 * IFrame renderer.
	 * @namespace
	 */
	var IFrameRenderer = { apiVersion: 2 };

	/**
	 * Renders the HTML for the given control, using the provided
	 * {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm
	 *            The RenderManager that can be used for writing to
	 *            the Render-Output-Buffer
	 * @param {sap.ui.fl.util.IFrame} oIFrame
	 *            The iframe to be rendered
	 */
	IFrameRenderer.render = function(oRm, oIFrame) {
		oRm.openStart("div", oIFrame);
		// Render dimensions on container to avoid flickering
		_setDimensionAsStyle(oRm, "width", oIFrame.getWidth());
		_setDimensionAsStyle(oRm, "height", oIFrame.getHeight());
		oRm.openEnd();

		// Assign a unique id to render a fresh dom element for the iframe on every rerender
		// This will avoid that src changes add to the history as the src is always the initial value of the new element
		oRm.openStart("iframe", `${oIFrame.getId()}-${uid()}`);
		oRm.style("width", "100%");
		oRm.style("height", "100%");
		oRm.style("display", "block");
		oRm.style("border", "none");

		const sTitle = oIFrame.getTitle();
		const oAdvancedSettings = oIFrame.getAdvancedSettings();
		const { additionalSandboxParameters: aAdditionalSandboxParameters, ...oFilteredAdvancedSettings } = oAdvancedSettings;
		const sAdditionalSandboxParameters = aAdditionalSandboxParameters?.join(" ");
		const sSandboxAttributes = createsSandboxAttributesString(oFilteredAdvancedSettings);
		const sCombinedSandboxAttributes = sAdditionalSandboxParameters ? `${sSandboxAttributes} ${sAdditionalSandboxParameters}` : sSandboxAttributes;
		oRm.attr("src", oIFrame.getUrl());
		if (sTitle) {
			oRm.attr("title", sTitle);
		}
		oRm.attr("sandbox", sCombinedSandboxAttributes);
		if (FocusPolicy.isFocusPolicySupported() && !oIFrame.getAllowFocusWithoutUserActivation()) {
			oRm.attr("allow", "focus-without-user-activation 'none'");
		}
		oRm.openEnd();
		oRm.close("iframe");
		oRm.close("div");
	};

	return IFrameRenderer;
});
