/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"sap/ui/core/Messaging",
	"sap/ui/core/mvc/Controller"
], function (MessageBox, MessageToast, Messaging, Controller) {
	"use strict";

	return Controller.extend("sap.ui.core.sample.odata.v4.SimpleNonDraft.Main", {
		onInit : function () {
			this.getView().attachEventOnce("modelContextChange", () => {
				const oView = this.getView();
				const oListBinding = this.byId("salesOrderList").getBinding("items");

				oView.setModel(oView.getModel(), "header");
				oView.setBindingContext(oListBinding.getHeaderContext(), "header");
			});
		},

		onCreate : function () {
			const oListBinding = this.byId("salesOrderList").getBinding("items");
			const oContext = oListBinding.create({
					BuyerID : "",
					CurrencyCode : "EUR",
					LifecycleStatus : "N",
					Note : ""
				}, /*bSkipRefresh*/true);

			oContext.created().catch((oError) => {
				if (!oError.canceled) {
					MessageBox.error(oError.message);
				}
			});

			const oDialog = this.byId("createDialog");
			oDialog.setBindingContext(oContext);
			oDialog.open();
		},

		onCreateDialogConfirm : function () {
			this.byId("createDialog").close();
		},

		onCreateDialogCancel : function () {
			const oDialog = this.byId("createDialog");

			oDialog.getBindingContext().delete();
			oDialog.close();
		},

		onDelete : function () {
			const oTable = this.byId("salesOrderList");

			oTable.getSelectedContexts().forEach((oContext) => {
				oContext.delete().catch((oError) => {
					if (!oError.canceled) {
						MessageBox.error(oError.message);
					}
				});
			});
		},

		onRefresh : function () {
			if (this.getView().getModel().hasPendingChanges()) {
				MessageBox.alert("Refresh not possible with pending changes");
				return;
			}

			this.byId("salesOrderList").getBinding("items").requestRefresh().then(() => {
				MessageToast.show("Data refreshed");
			});
		},

		onSave : function () {
			const oView = this.getView();
			const oModel = oView.getModel();

			if (!oModel.hasPendingChanges("update")) {
				MessageToast.show("No changes to save");
				return;
			}

			const oMessageModel = Messaging.getMessageModel();
			Messaging.removeMessages(
				oMessageModel.getObject("/").filter((oMessage) => !oMessage.isValidation()));

			oView.setBusy(true);
			oModel.submitBatch("update").then(() => {
				const aErrors = oMessageModel.getObject("/").filter(
					(oMessage) => !oMessage.isValidation());

				if (aErrors.length) {
					MessageBox.error(
						aErrors.map((oMessage) => oMessage.getMessage()).join("\n"));
				} else {
					MessageToast.show("Changes have been saved");
				}
			}, (oError) => {
				MessageBox.error(oError.message);
			}).finally(() => {
				oView.setBusy(false);
			});
		},

		onCancel : function () {
			const oModel = this.getView().getModel();

			if (!oModel.hasPendingChanges("update")) {
				MessageToast.show("No changes to cancel");
				return;
			}

			oModel.resetChanges("update");
			MessageToast.show("Changes have been canceled");
		}
	});
});
