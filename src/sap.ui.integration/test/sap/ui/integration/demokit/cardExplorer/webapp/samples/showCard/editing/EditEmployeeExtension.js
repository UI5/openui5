sap.ui.define([
	"sap/ui/integration/Extension",
	"sap/ui/integration/library"
], function (Extension, integrationLibrary) {
	"use strict";

	const CardActionType = integrationLibrary.CardActionType;
	const CardMessageType = integrationLibrary.CardMessageType;

	const EditEmployeeExtension = Extension.extend("card.explorer.extension.editEmployee.EditEmployeeExtension");

	EditEmployeeExtension.prototype.init = function () {
		Extension.prototype.init.apply(this, arguments);
		this.attachAction(this._handleAction.bind(this));
	};

	EditEmployeeExtension.prototype._handleAction = function (oEvent) {
		const sActionType = oEvent.getParameter("type");

		// Handle Submit action from child cards
		if (sActionType === CardActionType.Submit) {
			this._handleSubmitAction(oEvent);
			return;
		}
	};

	EditEmployeeExtension.prototype._handleSubmitAction = function (oEvent) {
		const oCard = this.getCard();
		const oData = oEvent.getParameter("formData");

		// Send the update request
		this.getCard().request({
			url: "/employees/edit/{parameters>/employeeId/value}",
			method: "PUT",
			headers: {
				"Content-Type": "application/json"
			},
			parameters: oData
		})
		.then(function(sResponseText) {
			oCard.showMessage(sResponseText, CardMessageType.Success);
			oCard.refreshData();

			const oParentCard = oCard.getOpener();
			if (oParentCard) {
				oParentCard.refreshData();
			}
		})
		.catch(function (oErrorInfo) {
			if (oErrorInfo && oErrorInfo.response && oErrorInfo.response.text) {
				oErrorInfo.response.text().then(function (sText) {
					oCard.showMessage(sText, CardMessageType.Error);
				});
			} else {
				oCard.showMessage("Failed to update employee information", CardMessageType.Error);
			}
		});
	};

	return EditEmployeeExtension;
});