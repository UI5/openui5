sap.ui.define([
	"sap/m/AvatarSize",
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast",
	"sap/f/library"
], function (AvatarSize, Controller, MessageToast, fLibrary) {
	"use strict";

	var DynamicPageMediaRange = fLibrary.DynamicPageMediaRange;

	return Controller.extend("sap.f.sample.DynamicPageResponsiveAvatar.controller.DynamicPageResponsiveAvatar", {

		onInit: function () {
			var oDynamicPage = this.byId("dynamicPageId");
			oDynamicPage.attachBreakpointChange(this.onBreakpointChange, this);
		},

		onBreakpointChange: function (oEvent) {
			var sCurrentRange = oEvent.getParameter("currentRange");
			var iCurrentWidth = oEvent.getParameter("currentWidth");

			// Update Avatar sizes
			this._updateAvatarSizes(sCurrentRange);

			// Show notification
			MessageToast.show("Media Range: " + sCurrentRange + " (" + iCurrentWidth + "px)");
		},

		_updateAvatarSizes: function (sCurrentRange) {
			var oHeaderAvatar = this.byId("headerAvatar");
			var oSnappedAvatar = this.byId("snappedAvatar");
			var sSize;

			// Map media range to Avatar size
			if (sCurrentRange === DynamicPageMediaRange.Phone) {
				sSize = AvatarSize.M;
			} else if (sCurrentRange === DynamicPageMediaRange.Tablet) {
				sSize = AvatarSize.L;
			} else {
				// Desktop and DesktopExtraLarge both use XL
				sSize = AvatarSize.XL;
			}

			// Update both avatars
			if (oHeaderAvatar) {
				oHeaderAvatar.setDisplaySize(sSize);
			}
			if (oSnappedAvatar) {
				oSnappedAvatar.setDisplaySize(sSize);
			}
		},

		handleLink1Press: function () {
			MessageToast.show("Home pressed");
		},

		handleLink2Press: function () {
			MessageToast.show("Examples pressed");
		},

		handleAvatarPress: function () {
			MessageToast.show("Avatar pressed");
		},

		toggleFooter: function () {
			var oDynamicPage = this.byId("dynamicPageId");
			oDynamicPage.setShowFooter(!oDynamicPage.getShowFooter());
		}
	});
});
