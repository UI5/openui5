sap.ui.define([
	"sap/m/MessageBox",
	"sap/ui/core/Messaging",
	"sap/ui/core/mvc/Controller"
], function (MessageBox, Messaging, Controller) {
	"use strict";

	return Controller.extend("sap.ui.core.sample.odata.v4.Create.Main", {
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
			const aMessages = Messaging.getMessageModel().getObject("/").filter((oMessage) => {
				return oMessage.type === "Error" && oMessage.getControlId();
			});

			if (aMessages.length) {
				this.byId(aMessages[0].getControlId()).focus();
			} else {
				this.getView().getModel().submitBatch("update");
				this.byId("createDialog").close();
			}
		},
		onCancelSalesOrder : function (oEvent) {
			const oContext = oEvent.getSource().getBindingContext();
			oContext.delete();
			this.byId("createDialog").close();
		}
	});
});
