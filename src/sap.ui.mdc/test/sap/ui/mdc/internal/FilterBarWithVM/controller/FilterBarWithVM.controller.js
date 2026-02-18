sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/Item",
	"sap/ui/model/json/JSONModel",
	"../model/formatter",
	"sap/m/Label",
	"sap/m/VBox",
	"sap/ui/mdc/FilterField"

], function(
	Controller,
	Item,
	JSONModel,
	formatter,
	Label,
	VBox,
	FilterField
) {
	"use strict";

	return Controller.extend("mdc.sample.controller.FilterBarWithVM", {
		formatter: formatter,
		onInit: function() {
			const oModel = new JSONModel({
				conditionsText: "",
				editorHeight: 400
			});
			this.getView().setModel(oModel);

			// Add custom view to the Adapt Filters dialog
			this._addCustomViewToFilterBar();
		},

		/**
		 * Adds a custom view to the FilterBar's Adapt Filters panel.
		 * This is not the way to do it in real applications, only for test purposes.
		 */
		_addCustomViewToFilterBar: function() {
			const oFilterBar = this.getView().byId("mountainsFilterbar");

			const oCustomContent = new VBox().addStyleClass("sapUiSmallMargin");

			const oCustomViewItem = new Item({
				key: "customView",
				text: "Custom View"
			});

			oFilterBar.initialized().then(() => {
				return oFilterBar.retrieveInbuiltFilter();
			}).then((oAdaptationFilterBar) => {
				if (!oAdaptationFilterBar) {
					return;
				}
				const oPanel = oAdaptationFilterBar._oFilterBarLayout.getInner();

				oPanel.addCustomView({
					item: oCustomViewItem,
					content: oCustomContent,
					selectionChange: (sKey) => {
						if (sKey === "customView" && oCustomContent.getItems().length === 0) {
							const sConditionModelName = oAdaptationFilterBar.getConditionModelName();
							const oConditionModel = oAdaptationFilterBar.getModel(sConditionModelName);

							const oLabel = new Label({ text: "Country (Custom View Only)" });
							const oCountryFilterField = new FilterField({
								propertyKey: "country",
								label: "Country (Custom View Only)",
								delegate: { name: "sap/ui/mdc/field/FieldBaseDelegate", payload: {} },
								conditions: "{" + sConditionModelName + ">/conditions/country}"
							});
							oCountryFilterField.setModel(oConditionModel, sConditionModelName);
							oCustomContent.addItem(oLabel);
							oCustomContent.addItem(oCountryFilterField);
						}
					}
				});
			});
		},

		onFiltersChanged: function(oEvent) {
			const oModel = this.getView().getModel();
			if (!oModel) {
				return;
			}

			const oConditions = this.getView().byId("mountainsFilterbar").getConditions();
			const sConditions = JSON.stringify(oConditions, "\t", 4);
			oModel.setProperty("/conditionsText", sConditions);
		}
	});
});
