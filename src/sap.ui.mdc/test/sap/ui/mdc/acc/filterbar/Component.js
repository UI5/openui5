sap.ui.define([
	"sap/ui/core/UIComponent",
	"delegates/odata/v4/FieldBaseDelegate", // to render FilterFields immediately
	"sap/ui/mdc/field/FieldMultiInput",
	"sap/ui/mdc/field/FieldSelect",
	"sap/m/DynamicDateRange",
	"sap/ui/mdc/condition/OperatorDynamicDateOption",
	"sap/ui/mdc/field/DynamicDateRangeConditionsType",
	"sap/ui/model/type/String",
	"sap/ui/model/type/Boolean",
	"sap/ui/model/type/Integer",
	"sap/ui/model/type/Float",
	"sap/ui/model/odata/type/Date"
  ], function (UIComponent) {
	"use strict";

	return UIComponent.extend("sap.ui.mdc.acc.filterbar.Component", {
		"metadata": {
			"manifest": "json"
		}
	});
});