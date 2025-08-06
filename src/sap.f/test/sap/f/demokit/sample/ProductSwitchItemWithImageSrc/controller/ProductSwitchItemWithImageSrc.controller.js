sap.ui.define([
	"sap/ui/Device",
	"sap/ui/core/mvc/Controller",
	"sap/m/Button",
	"sap/m/MessageToast",
	"sap/ui/core/Fragment",
	"sap/m/library"
], function (Device, Controller, Button, MessageToast, Fragment, library) {
	"use strict";

	// Shortcut for sap.m.URLHelper
	var URLHelper = library.URLHelper;

	return Controller.extend("sap.f.sample.ProductSwitchItemWithImageSrc.controller.ProductSwitchItemWithImageSrc", {
		onInit: function () {
			var oView = this.getView();

			if (!this._pPopover) {
				this._pPopover = Fragment.load({
					id: oView.getId(),
					name: "sap.f.sample.ProductSwitchItemWithImageSrc.view.ProductSwitchItemWithImageSrc",
					controller: this
				}).then(function(oPopover){
					oView.addDependent(oPopover);
					if (Device.system.phone) {
						oPopover.setEndButton(new Button({text: "Close", type: "Emphasized", press: this.fnClose.bind(this)}));
					}
					return oPopover;
				}.bind(this));
			}
		},
		fnChange: function (oEvent) {
			var oItemPressed = oEvent.getParameter("itemPressed"),
				sTargetSrc = oItemPressed.getTargetSrc();

			MessageToast.show("Redirecting to " + sTargetSrc);

			// Open the targetSrc manually
			URLHelper.redirect(sTargetSrc, true);
		},
		fnOpen: function (oEvent) {
			var oButton = this.getView().byId("pSwitchBtn");
			this._pPopover.then(function(oPopover){
				oPopover.openBy(oButton);
			});
		},
		fnClose: function () {
			this._pPopover.then(function(oPopover){
				oPopover.close();
			});
		}
	});
});