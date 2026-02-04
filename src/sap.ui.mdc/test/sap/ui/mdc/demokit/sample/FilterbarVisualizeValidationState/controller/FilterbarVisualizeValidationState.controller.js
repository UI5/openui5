sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/mdc/util/FilterUtil",
	"../model/formatter"
], function(
	Controller,
	JSONModel,
	FilterUtil,
	formatter
) {
	"use strict";

	return Controller.extend("mdc.sample.controller.FilterbarVisualizeValidationState", {
		formatter: formatter,
		onInit: function() {
			const oModel = new JSONModel({
				conditionsText: "",
				modelFilterText: "",
				editorHeight: 400,
				headerExpanded: true
			});
			this.getView().setModel(oModel);
			this.initConditionsText();
		},
		handleValidateCollapsedFilterBarPress: function() {
			const oFilterBar = this.getView().byId("mountainsFilterbar");
			oFilterBar.validate();
		},
		handleFiltersChanged: function(oEvent) {
			const oFilterbar = oEvent.getSource();
			const oConditions = oFilterbar.getConditions();
			this.updateConditionsText(oConditions, oFilterbar);
		},
		initConditionsText: function() {
			const oFilterbar = this.getView().byId("mountainsFilterbar");
			const oConditions = oFilterbar.getConditions();
			this.updateConditionsText(oConditions, oFilterbar);
		},
		updateConditionsText: function(oConditions, oFilterbar) {
			const oModel = this.getView().getModel();
			if (!oModel) {
				return;
			}

			Promise.all([oFilterbar.awaitControlDelegate(), oFilterbar.awaitPropertyHelper()]).then(() => {
				const oModelFilter = FilterUtil.getFilterInfo(oFilterbar.getTypeMap(), oConditions, oFilterbar.getPropertyHelper().getProperties());
				const sModelFilter = this.stringifyModelFilter(oModelFilter?.filters);
				oModel.setProperty("/modelFilterText", sModelFilter);
			});

			const sConditions = JSON.stringify(oConditions, "\t", 4);
			oModel.setProperty("/conditionsText", sConditions);
		},
		stringifyModelFilter: function(oModelFilter) {
			if (!oModelFilter) {
				return "{}";
			}
			const oCleanObject = JSON.parse(JSON.stringify(oModelFilter));
			delete oCleanObject._bMultiFilter;
			if ("aFilters" in oCleanObject){
				oCleanObject.aFilters.forEach((oFilter) => {
					delete oFilter._bMultiFilter;
					if ("aFilters" in oFilter) {
						oFilter.aFilters.forEach((oFilter) => {
							delete oFilter._bMultiFilter;
						});
					}
				});
			}

			return JSON.stringify(oCleanObject, "\t", 4);
		}
	});
});
