/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/m/HBoxRenderer"
],
function(
	HBoxRenderer
) {
	"use strict";

	const BaseRenderer = HBoxRenderer.extend("sap.ui.rta.toolbar.BaseRenderer", {
		apiVersion: 2,
		enhanceRootTag(oRM, oControl) {
			oRM.class("sapUiRtaToolbar");
			oRM.class(`color_${oControl.getColor()}`);

			// setting type if exists
			oControl.type && oRM.class(`type_${oControl.type}`);

			// setting z-index if exists
			var iZIndex = oControl.getZIndex();
			iZIndex && oRM.style("z-index", iZIndex);
		}
	});

	return BaseRenderer;
});
