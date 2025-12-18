sap.ui.define([
	"sap/m/MessageBox",
	"sap/ui/core/Messaging",
	"sap/ui/core/message/MessageType",
	"sap/ui/core/mvc/Controller"
], function (MessageBox, Messaging, MessageType, Controller) {
	"use strict";

	return Controller.extend("sap.ui.core.sample.odata.v4.Create.Main", {
		onCancelSalesOrder : function (oEvent) {
			const oContext = oEvent.getSource().getBindingContext();
			oContext.delete();
			this.byId("createDialog").close();
		},

		onCreateSalesOrder : function () {
			const oContext = this.byId("salesOrderList").getBinding("items")
				// Since a default for CurrencyCode is defined in metadata, no need to set this here
				.create({BuyerID : "0100000000", LifecycleStatus : "N"});

			oContext.created().then(function () {
				MessageBox.success("Sales Order Created");
			}).catch(function (oError) {
				if (!oError.canceled) {
					throw oError; // unexpected error
				}
				// Message handling is used to treat failed request. Since this is part of another
				// sample, this is deliberately omitted here.
			});
			const oDialog = this.byId("createDialog");
			oDialog.setBindingContext(oContext);
			oDialog.open();
		},

		onSaveSalesOrder : function () {
			const aErrors = Messaging.getMessageModel().getObject("/").filter((oMessage) => {
				return oMessage.getType() === MessageType.Error;
			});
			if (aErrors.length) {
				return;
			}

			this.getView().getModel().submitBatch("update");
			this.byId("createDialog").close();
		}
	});
});
