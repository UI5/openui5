sap.ui.define([
	"sap/m/DynamicDateOption",
	"sap/m/DynamicDateValueHelpUIType",
	"sap/ui/core/format/DateFormat",
	"sap/ui/core/date/UI5Date"
], function(DynamicDateOption, DynamicDateValueHelpUIType, DateFormat, UI5Date) {
	"use strict";

	return DynamicDateOption.extend("sap.m.sample.DynamicDateRangeWithCustomOptions.CustomBusinessDay", {

		getValueHelpUITypes: function() {
			return [new DynamicDateValueHelpUIType({ type: "date", text: "Select a date" })];
		},

		getValueHelpUIFooterFormatTypes: function() {
			return "datetime";
		},

		format: function(oValue) {
			return "Business Day: " + DateFormat.getDateInstance().format(oValue.values[0]) + " (9 AM - 5 PM)";
		},

		parse: function(sValue) {
			var sPrefix = "Business Day: ";
			if (sValue.startsWith(sPrefix)) {
				var oDate = DateFormat.getDateInstance().parse(sValue.slice(sPrefix.length));
				if (oDate) {
					return { operator: this.getKey(), values: [oDate] };
				}
			}
			return null;
		},

		toDates: function(oValue) {
			var oStart = UI5Date.getInstance(oValue.values[0]);
			oStart.setHours(9, 0, 0, 0);

			var oEnd = UI5Date.getInstance(oValue.values[0]);
			oEnd.setHours(17, 0, 0, 0);

			return [oStart, oEnd];
		},

		getGroup: function() {
			return "Custom";
		}
	});
});
