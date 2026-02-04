sap.ui.define([
], function() {
	"use strict";

	const aPropertyInfos = [{
		key: "numberWords",
		label: "Number of words (single-value)",
		visible: true,
		path: "numberWords",
		dataType:"sap.ui.model.type.Integer",
		maxConditions: 1
	},{
		key: "descr",
		label: "Description (multi-value)",
		visible: true,
		path: "descr",
		dataType: "sap.ui.model.type.String"
	},{
		key: "status",
		label: "Status (single-value)",
		visible: true,
		path: "status",
		dataType: "sap.ui.model.type.String",
		maxConditions: 1
	}];

	return aPropertyInfos;
});
