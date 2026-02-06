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

	const oPropertyInfos = {
		"mountains": [
			{
				key: "rank",
				label: "Rank",
				visible: true,
				path: "rank",
				dataType: "sap.ui.model.type.Integer",
				formatOptions:{emptyString: 0},
				constraints:{minimum: 0}
			},{
				key: "name",
				label: "Name",
				visible: true,
				path: "name",
				dataType: "sap.ui.model.type.String"
			},{
				key: "height",
				label: "Height",
				visible: true,
				path: "height",
				dataType: "sap.ui.model.type.Integer",
				formatOptions:{emptyString: null}
			},{
				key: "prominence",
				label: "Prominence",
				visible: true,
				path: "prominence",
				dataType: "sap.ui.model.type.Float",
				formatOptions:{emptyString: null}
			},{
				key: "range",
				label: "Range",
				visible: true,
				path: "range",
				dataType: "sap.ui.model.type.String"
			},{
				key: "coordinates",
				label: "Coordinates",
				visible: true,
				path: "coordinates",
				dataType: "sap.ui.model.type.String"
			},{
				key: "parent_mountain",
				label: "Has parent mountain",
				visible: true,
				path: "parent_mountain",
				dataType: "sap.ui.model.type.Boolean",
				maxConditions: 1
			},{
				key: "first_ascent",
				label: "First Ascent",
				visible: true,
				path: "first_ascent",
				dataType: "sap.ui.model.type.Date",
				formatOptions:{
					style: "long"
				},
				maxConditions: 1
			},{
				key: "countries",
				label: "Countries",
				visible: true,
				path: "countries",
				dataType: "sap.ui.model.type.String",
				constraints: {
					maxLength: 2
				}
			},{
				key: "$search",
				label: "Search",
				visible: true,
				maxConditions: 1,
				dataType: "sap.ui.model.type.String"
			}
		],
		"ranges": [
			{
				key: "range",
				label: "Range",
				visible: true,
				path: "range",
				dataType: "sap.ui.model.type.String"
			},{
				key: "countries",
				label: "Countries",
				visible: true,
				path: "countries",
				dataType: "sap.ui.model.type.String",
				constraints: {
					maxLength: 2
				}
			}
		],
		"countries": [
			{
				key: "code",
				label: "Country Code",
				visible: true,
				path: "code",
				text: "name",
				caseSensitive: false,
				dataType: "sap.ui.model.type.String",
				constraints: {
					maxLength: 2
				}
			},{
				key: "name",
				label: "Country Name",
				visible: true,
				path: "name",
				dataType: "sap.ui.model.type.String"
			}
		]
	};

	return oPropertyInfos;
});
