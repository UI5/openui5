sap.ui.define([
	"sap/m/AvatarSize",
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast",
	"sap/uxap/library"
], function (AvatarSize, Controller, MessageToast, uxapLibrary) {
	"use strict";

	var ObjectPageLayoutMediaRange = uxapLibrary.ObjectPageLayoutMediaRange;

	return Controller.extend("sap.uxap.sample.ObjectPageResponsiveAvatar.controller.ObjectPageResponsiveAvatar", {

		onInit: function () {
			// Attach to the breakpointChanged event to adjust Avatar sizes
			var oObjectPage = this.byId("ObjectPageLayout");
			oObjectPage.attachBreakpointChanged(this.onBreakpointChanged, this);
		},

		onBreakpointChanged: function (oEvent) {
			var sCurrentRange = oEvent.getParameter("currentRange"),
				iCurrentWidth = oEvent.getParameter("currentWidth");

			// Update Avatar sizes
			this._updateAvatarSizes(sCurrentRange);

			// Show toast message for demo purposes
			MessageToast.show(
				"Media Range: " + sCurrentRange + " (" + iCurrentWidth + "px)\n" +
				"Avatar Size: " + this._getAvatarSizeForRange(sCurrentRange)
			);
		},

		_updateAvatarSizes: function (sCurrentRange) {
			var oHeaderAvatar = this.byId("headerAvatar"),
				oSnappedAvatar = this.byId("snappedAvatar"),
				sAvatarSize = this._getAvatarSizeForRange(sCurrentRange);

			// Update both avatars
			if (oHeaderAvatar) {
				oHeaderAvatar.setDisplaySize(sAvatarSize);
			}
			if (oSnappedAvatar) {
				oSnappedAvatar.setDisplaySize(sAvatarSize);
			}
		},

		_getAvatarSizeForRange: function (sCurrentRange) {
			// Map media range to Avatar size
			// Phone: M (4rem), Tablet: L (5rem), Desktop: XL (7rem), DesktopExtraLarge: XL (7rem)
			switch (sCurrentRange) {
				case ObjectPageLayoutMediaRange.Phone:
					return AvatarSize.M;
				case ObjectPageLayoutMediaRange.Tablet:
					return AvatarSize.L;
				case ObjectPageLayoutMediaRange.Desktop:
				case ObjectPageLayoutMediaRange.DesktopExtraLarge:
					return AvatarSize.XL;
				default:
					return AvatarSize.L;
			}
		},

		handleLink1Press: function () {
			MessageToast.show("Page 1 a very long link clicked");
		},

		handleLink2Press: function () {
			MessageToast.show("Page 2 long link clicked");
		},

		handleEditBtnPress: function () {
			MessageToast.show("Edit header button pressed");
		},

		toggleFooter: function () {
			var oObjectPage = this.byId("ObjectPageLayout");
			oObjectPage.setShowFooter(!oObjectPage.getShowFooter());
		}
	});
});
