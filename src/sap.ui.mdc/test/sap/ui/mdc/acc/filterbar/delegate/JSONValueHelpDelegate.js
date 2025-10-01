sap.ui.define([
	"delegates/ValueHelpDelegate",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], (
	ValueHelpDelegate,
	Filter,
	FilterOperator
) => {
	"use strict";

	const JSONValueHelpDelegate = Object.assign({}, ValueHelpDelegate);

	return JSONValueHelpDelegate;

});