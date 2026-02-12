/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/rta/toolbar/BaseRenderer"
], function(
	BaseRenderer
) {
	"use strict";

	const AdaptationRenderer = BaseRenderer.extend("sap.ui.rta.toolbar.AdaptationRenderer", {
		apiVersion: 2,
		enhanceRootTag(oRM, oControl) {
			oRM.class("sapUiRtaToolbarAdaptation");
			BaseRenderer.enhanceRootTag(oRM, oControl);
		}
	});

	return AdaptationRenderer;
});
