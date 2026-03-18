/*!
 * ${copyright}
 */

// Provides default renderer for control sap.m.Avatar
sap.ui.define(["sap/m/AvatarSize", "sap/m/AvatarType", "sap/base/security/encodeCSS", "sap/ui/core/IconPool"], function(AvatarSize, AvatarType, encodeCSS, IconPool) {
	"use strict";

	/**
	 * <code>Avatar</code> renderer.
	 * @author SAP SE
	 * @namespace
	 */
	var AvatarRenderer = {
		apiVersion: 2
	};


	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.m.Avatar} oAvatar an object representation of the control that should be rendered
	 */
	AvatarRenderer.render = function (oRm, oAvatar) {

		var bEnabled = oAvatar.getEnabled(),
			sInitials = oAvatar.getInitials(),
			sActualDisplayType = oAvatar._getActualDisplayType(),
			sImageFallbackType = oAvatar._getImageFallbackType(),
			sDisplaySize = oAvatar.getDisplaySize(),
			sDisplayShape = oAvatar.getDisplayShape(),
			sImageFitType = oAvatar.getImageFitType(),
			sCustomDisplaySize = oAvatar.getCustomDisplaySize(),
			sCustomFontSize = oAvatar.getCustomFontSize(),
			sSrc = oAvatar._getAvatarSrc(),
			bIsIconURI = IconPool.isIconURI(sSrc),
			bHasDetailBox = !!oAvatar.getDetailBox(),
			bHasBadgeIcon = !!oAvatar.getBadgeIcon(),
			sAvatarClass = "sapFAvatar",
			sTooltip = oAvatar.getTooltip_AsString(),
			aLabelledBy = oAvatar._getAriaLabelledBy(),
			aDescribedBy = oAvatar.getAriaDescribedBy(),
			aHasPopup = oAvatar.getAriaHasPopup(),
			bHasSrc = (!oAvatar._getUseDefaultIcon() && bHasDetailBox) || (!bHasDetailBox),
			bHideBadge = bHasDetailBox && bIsIconURI && !bHasBadgeIcon,
			oBadge = bHasSrc && !bHideBadge ?  oAvatar._getBadge() : null,
			sInitialsLength = sInitials.length,
			sRole = oAvatar._getRole(),
			bActive = oAvatar.getActive() && bEnabled && sRole === "button",
			sAriaLabel = oAvatar._getAriaLabel();

		oRm.openStart("span", oAvatar);
		oRm.class(sAvatarClass);
		oRm.class("sapFAvatarColor" + oAvatar._getActualBackgroundColor());
		oRm.class(sAvatarClass + sDisplaySize);
		oRm.class(sAvatarClass + sActualDisplayType);
		oRm.class(sAvatarClass + sDisplayShape);

		if (bActive) {
			oRm.class("sapMAvatarPressed");
		}

		// Set role using the centralized logic from Avatar._getRole()
		if (bEnabled) {
			oRm.attr("role", sRole);

			if (sRole === "button") {
				oRm.class("sapMPointer");
				oRm.class(sAvatarClass + "Focusable");
				oRm.attr("tabindex", 0);
			} else if (sRole === "presentation") {
				oRm.attr("aria-hidden", "true");
			}
		} else {
			oRm.attr("disabled", "disabled");
			oRm.class("sapMAvatarDisabled");
		}
		if (oAvatar.getShowBorder()) {
			oRm.class("sapFAvatarBorder");
		}
		if (sDisplaySize === AvatarSize.Custom) {
			oRm.style("width", sCustomDisplaySize);
			oRm.style("height", sCustomDisplaySize);
			oRm.style("font-size", sCustomFontSize);
		}

		// Set aria-label using the centralized logic from Avatar._getAriaLabel()
		if (sAriaLabel) {
			// If tooltip property is set, also set the title attribute
			if (sTooltip) {
				oRm.attr("title", sTooltip);
			}
			oRm.attr("aria-label", sAriaLabel);
		}

		// aria-labelledby references
		if (aLabelledBy && aLabelledBy.length > 0) {
			oRm.attr("aria-labelledby", aLabelledBy.join(" "));
		}
		// aria-describedby references
		if (aDescribedBy && aDescribedBy.length > 0) {
			oRm.attr("aria-describedby", aDescribedBy.join(" "));
		}
		// aria-haspopup references
		if (aHasPopup && aHasPopup !== "None") {
			oRm.attr("aria-haspopup", aHasPopup.toLowerCase());
		}
		oRm.openEnd();
		if (sActualDisplayType === AvatarType.Icon || sImageFallbackType === AvatarType.Icon) {
			oRm.renderControl(oAvatar._getIcon().addStyleClass(sAvatarClass + "TypeIcon"));
		} else if ((sActualDisplayType === AvatarType.Initials || sImageFallbackType === AvatarType.Initials) ){
			if (sInitialsLength === 3) {
			//we render both icon and avatar, for the case where we have 3 initials set to the avatar and they are overflowing,
			//in this case we want to show icon instead of the initials after the rendering of the control
				oRm.renderControl(oAvatar._getIcon().addStyleClass(sAvatarClass + "TypeIcon").addStyleClass(sAvatarClass + "HiddenIcon"));
			}

			oRm.openStart("span");
			oRm.class(sAvatarClass + "InitialsHolder");
			oRm.openEnd();
			oRm.text(sInitials);
			oRm.close("span");

		}
		if (sActualDisplayType === AvatarType.Image) {
			oRm.openStart("span");
			oRm.class(sAvatarClass + "ImageHolder");
			oRm.class(sAvatarClass + sActualDisplayType + sImageFitType);
			oRm.style("background-image", "url('" + encodeCSS(sSrc) + "')");
			oRm.openEnd();
			oRm.close("span");
		}
		// HTML element for the badge icon
		if (oBadge) {
			oRm.openStart("div");
			oRm.class(sAvatarClass + "BadgeIconActiveArea");
			// we want to make sure icon, used for badge, scales proportionally with the custom size
			if (sCustomDisplaySize) {
				oRm.style("font-size", sCustomDisplaySize);
			}
			oRm.openEnd();
				oRm.openStart("span");
				oRm.class(sAvatarClass + "BadgeIcon");
				oRm.openEnd();
				oRm.renderControl(oBadge);
				oRm.close("span");
			oRm.close("div");
		}

		oRm.close("span");
	};

	return AvatarRenderer;
});
