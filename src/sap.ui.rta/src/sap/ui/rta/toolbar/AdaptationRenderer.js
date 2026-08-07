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
		decorateRootElement(...aArgs) {
			BaseRenderer.decorateRootElement.apply(this, aArgs);
			const [oRM] = aArgs;
			oRM.class("sapUiRtaToolbarAdaptation");
		}
	});

	return AdaptationRenderer;
});
