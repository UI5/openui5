sap.ui.define([
], function() {
	"use strict";

	const aPropertyInfos = [{
		key: "id",
		label: "ID",
		path: "id",
		dataType: "sap.ui.model.type.Integer"
	}, {
		key: "name",
		label: "Name",
		path: "name",
		dataType: "sap.ui.model.type.String"
	}, {
		key: "position",
		label: "Position",
		path: "position",
		dataType: "sap.ui.model.type.String",
		groupable: true
	}, {
		key: "department",
		label: "Department",
		path: "department",
		dataType: "sap.ui.model.type.String",
		groupable: true
	}, {
		key: "email",
		label: "E-Mail",
		path: "email",
		dataType: "sap.ui.model.type.String"
	}, {
		key: "phone",
		label: "Phone Number",
		path: "phone",
		dataType: "sap.ui.model.type.String",
		sortable: false
	}, {
		key: "location",
		label: "Location",
		path: "location",
		dataType: "sap.ui.model.type.String",
		groupable: true
	}, {
		key: "hireDate",
		label: "Hire Date",
		path: "hireDate",
		dataType: "sap.ui.model.type.Date"
	}];

	return aPropertyInfos;
});
