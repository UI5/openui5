sap.ui.define([
], function() {
	"use strict";

	/* Property Example:
	{
	  "rank": 1,
	  "name": "Mount Everest",
	  "height": 8848,
	  "prominence": 8848,
	  "range": "Mahalangur Himalaya",
	  "coordinates": "27°59'17''N 86°55'31''E",
	  "parent_mountain": "-",
	  "first_ascent": 1953,
	  "countries": "Nepal, China"
	} */

	const aPropertyInfos = [{
		key: "rank",
		label: "Rank (Integer)",
		visible: true,
		path: "rank",
		dataType: "sap.ui.model.type.Integer",
		formatOptions: {emptyString: 0},
		constraints: {minimum: 0}
	},{
		key: "name",
		label: "Name (String)",
		visible: true,
		path: "name",
		dataType: "sap.ui.model.type.String"
	},{
		key: "height",
		label: "Height (Integer)",
		visible: true,
		path: "height",
		dataType: "sap.ui.model.type.Integer",
		formatOptions: {emptyString: null}
	},{
		key: "prominence",
		label: "Prominence (Float)",
		visible: true,
		path: "prominence",
		dataType: "sap.ui.model.type.Float",
		formatOptions: {emptyString: null}
	},{
		key: "range",
		label: "Range (String)",
		visible: true,
		path: "range",
		dataType: "sap.ui.model.type.String"
	},{
		key: "coordinates",
		label: "Coordinates (String)",
		visible: true,
		path: "coordinates",
		dataType: "sap.ui.model.type.String"
	},{
		key: "parent_mountain",
		label: "Has parent mountain (Boolean)",
		visible: true,
		path: "parent_mountain",
		dataType: "sap.ui.model.type.Boolean",
		maxConditions: 1
	},{
		key: "first_ascent",
		label: "First Ascent (Date)",
		visible: true,
		path: "first_ascent",
		dataType: "sap.ui.model.type.Date",
		formatOptions: {
			style: "long"
		},
		maxConditions: 1
	},{
		key: "countries",
		label: "Countries (String)",
		visible: true,
		path: "countries",
		dataType: "sap.ui.model.type.String"
	},{
		key: "$search",
		label: "Search",
		visible: true,
		maxConditions: 1,
		dataType: "sap.ui.model.type.String"
	}];

	return aPropertyInfos;
});
