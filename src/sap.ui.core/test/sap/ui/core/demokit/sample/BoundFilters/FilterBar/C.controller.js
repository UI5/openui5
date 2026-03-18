sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel"
], function (Controller, JSONModel) {
	"use strict";

	return Controller.extend("sap.ui.core.sample.BoundFilters.FilterBar.C", {
		onInit() {
			const oFilterModel = new JSONModel({
				departmentPrefix: undefined,
				locationPrefix: undefined,
				firstName: undefined,
				lastName: undefined
			});
			this.getView().setModel(oFilterModel, "filter");

			const oUiModel = new JSONModel({showOrganizational: true});
			this.getView().setModel(oUiModel, "ui");
		},

		onToggleFilters() {
			const oUiModel = this.getView().getModel("ui");
			const bShowOrganizational = !oUiModel.getProperty("/showOrganizational");
			oUiModel.setProperty("/showOrganizational", bShowOrganizational);
			const oFilterModel = this.getView().getModel("filter");
			if (bShowOrganizational) {
				oFilterModel.setProperty("/firstName", null);
				oFilterModel.setProperty("/lastName", null);
			} else {
				oFilterModel.setProperty("/departmentPrefix", null);
				oFilterModel.setProperty("/locationPrefix", null);
			}
		}
	});
});
