sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/FilterType"
], function (Controller, JSONModel, Filter, FilterOperator, FilterType) {
	"use strict";

	const aOrgFilters = [
		new Filter({
			path: 'department',
			operator: FilterOperator.StartsWith,
			value1: '{filter>/departmentPrefix}'
		}),
		new Filter({
			path: 'location',
			operator: FilterOperator.StartsWith,
			value1: '{filter>/locationPrefix}'
		})
	];
	const aPersonFilters = [
		new Filter({
			path: 'firstName',
			operator: FilterOperator.StartsWith,
			value1: '{filter>/firstName}'
		}),
		new Filter({
			path: 'lastName',
			operator: FilterOperator.StartsWith,
			value1: '{filter>/lastName}'
		})
	];

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
			const aFilters = bShowOrganizational ? aOrgFilters : aPersonFilters;
			const oListBinding = this.getView().byId("myTable").getBinding("rows");
			oListBinding.filter(aFilters, FilterType.ApplicationBound);
		}
	});
});
