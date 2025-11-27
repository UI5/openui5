sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast"
], function (Controller, MessageToast) {
	"use strict";

	return Controller.extend("sap.f.cardsdemo.controller.ObjectContent", {

		onInit: function() {
			const oRadioButtonSubmitCard = this.byId("radioButtonSubmitCard");

			if (oRadioButtonSubmitCard) {
				oRadioButtonSubmitCard.attachAction(function (oEvent) {
					const mFormData = oEvent.getParameter("formData");

					const sFormDataText = JSON.stringify({formData: mFormData}, null, 2);
					MessageToast.show("Form Data:\n" + sFormDataText, {
						duration: 5000,
						width: "25em"
					});
				});
			}

			const oRadioButtonSubmitCardWithValidation = this.byId("radioButtonSubmitCardWithValidation");

			if (oRadioButtonSubmitCardWithValidation) {
				oRadioButtonSubmitCardWithValidation.attachAction(function (oEvent) {
					const mFormData = oEvent.getParameter("formData");

					const sFormDataText = JSON.stringify({formData: mFormData}, null, 2);
					MessageToast.show("Form Data:\n" + sFormDataText, {
						duration: 5000,
						width: "25em"
					});
				});
			}
		}

	});
});