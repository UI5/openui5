/*!
 * ${copyright}
 */

sap.ui.define([], function () {
	"use strict";
	var ProductSwitchItemRenderer = {
		apiVersion: 2
	};

	ProductSwitchItemRenderer.render = function (oRm, oControl) {
		var oProductSwitch = oControl._getProductSwitch(),
			oAccessibilityState = {
				role: "menuitemradio"
			},
			sTooltip = oControl.getTooltip_AsString();

		if (oProductSwitch) {
			oAccessibilityState.setsize = oProductSwitch._getItemsCount();
			oAccessibilityState.posinset = oProductSwitch._getItemPosition(oControl);
			oAccessibilityState.checked = oControl.getId() === oProductSwitch.getSelectedItem() ? "true" : "false";
		}

		oRm.openStart("div", oControl);
		oRm.class("sapFPSItemContainer");
		if (sTooltip) {
			oRm.attr("title", sTooltip);
		}
		oRm.accessibilityState(oControl, oAccessibilityState);

		oRm.openEnd();
			oRm.openStart("span");
			oRm.class("sapFPSItemIconPlaceholder");
			oRm.class("sapUiTinyMarginBottom");
			oRm.openEnd();

			if (oControl.getImageSrc()) {
				oRm.renderControl(oControl._getAvatar());
			} else if (oControl.getSrc()) {
				oRm.renderControl(oControl._getIcon());
			}

			oRm.close("span");
			oRm.openStart("div");
			oRm.class("sapFPSItemTextSection");
			oRm.openEnd();
				if (oControl.getTitle()) {
					oRm.renderControl(oControl._getTitle());
				}

				if (oControl.getSubTitle()) {
					oRm.openStart("div");
					oRm.class("sapFPSItemSubTitle");
					oRm.class("sapFPSItemTitle");
					oRm.openEnd();
						oRm.text(oControl.getSubTitle());
					oRm.close("div");
				}
			oRm.close("div");
		oRm.close("div");
	};

	return ProductSwitchItemRenderer;

});