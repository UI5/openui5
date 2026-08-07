/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/m/OverflowToolbarRenderer"
],
function(
	OverflowToolbarRenderer
) {
	"use strict";

	const BaseRenderer = OverflowToolbarRenderer.extend("sap.ui.rta.toolbar.BaseRenderer", {
		apiVersion: 2,
		decorateRootElement(...aArgs) {
			OverflowToolbarRenderer.decorateRootElement.apply(this, aArgs);
			const [oRM, oControl] = aArgs;

			oRM.class("sapUiRtaToolbar");
			oRM.class(`color_${oControl.getColor()}`);

			// setting type if it exists
			if (oControl.type) {
				oRM.class(`type_${oControl.type}`);
			}

			// setting z-index if control's ZIndex is set
			const iZIndex = oControl.getZIndex();
			if (iZIndex > 0) {
				oRM.style("z-index", iZIndex);
			}
		}
	});

	return BaseRenderer;
});
