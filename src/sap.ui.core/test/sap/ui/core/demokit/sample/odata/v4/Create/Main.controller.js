sap.ui.define([
	"sap/m/MessageBox",
	"sap/ui/core/Messaging",
	"sap/ui/core/message/MessageType",
	"sap/ui/core/mvc/Controller"
], function (MessageBox, Messaging, MessageType, Controller) {
	"use strict";

	return Controller.extend("sap.ui.core.sample.odata.v4.Create.Main", {
		onCancelSalesOrder : function (oEvent) {
			oEvent.getSource().getBindingContext().delete();
		},

		onCreateSalesOrder : function () {
			const oListBinding = this.byId("salesOrderList").getBinding("items");
			const oContext = oListBinding.create(
				// Since a default for CurrencyCode is defined in metadata, no need to set this here
				{BuyerID : "0100000000", LifecycleStatus : "N"}, /*bSkipRefresh*/true);

			const oDialog = this.byId("createDialog");
			oDialog.setBindingContext(oContext);
			oDialog.open();
			oListBinding.attachEventOnce("createSent", () => oDialog.setBusy(true));
			oListBinding.attachEventOnce("createCompleted", () => oDialog.setBusy(false));

			oContext.created().then(function () {
				oDialog.close();
				MessageBox.success("Sales Order Created");
			}, function (oError) {
				if (!oError.canceled) {
					throw oError; // unexpected error
				}
				oDialog.close();
			});
		},

		onSaveSalesOrder : function () {
			const aAllMessages = Messaging.getMessageModel().getObject("/");
			const aValidationErrors = aAllMessages.filter((oMessage) => {
				return oMessage.getType() === MessageType.Error && !oMessage.getPersistent();
			});
			if (!aValidationErrors.length) {
				Messaging.removeMessages( // drop old backend messages to try again
					aAllMessages.filter((oMessage) => oMessage.getPersistent()));

				this.getView().getModel().submitBatch("update");
			}
		}
	});
});
