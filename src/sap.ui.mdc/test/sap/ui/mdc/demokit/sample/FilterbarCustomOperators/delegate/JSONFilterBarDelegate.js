/* eslint-disable require-await */
sap.ui.define([
	"sap/ui/core/Element",
	"sap/ui/mdc/FilterBarDelegate",
	"sap/ui/mdc/FilterField",
	"mdc/sample/model/metadata/JSONPropertyInfo"
], function (Element, FilterBarDelegate, FilterField, JSONPropertyInfo) {
	"use strict";

	const JSONFilterBarDelegate = Object.assign({}, FilterBarDelegate);

	JSONFilterBarDelegate.fetchProperties = async () => JSONPropertyInfo;

	const _createFilterField = (sId, oProperty, oFilterBar) => {
		const sPropertyKey = oProperty.key;
		const oFilterField = new FilterField(sId, {
			propertyKey: sPropertyKey,
			delegate: {name: "sap/ui/mdc/field/FieldBaseDelegate", payload: {}}
		});

		if (sPropertyKey === "rank") {
			oFilterField.setOperators(["SRANGE","NOTSRANGE","EQ"]);
		} else if (sPropertyKey === "first_ascent") {
			oFilterField.setOperators(["MYNEXTDAYS","EQ"]);
		}
		return oFilterField;
	};

	JSONFilterBarDelegate.addItem = async (oFilterBar, sPropertyName) => {
		const oProperty = JSONPropertyInfo.find((oPI) => oPI.key === sPropertyName);
		const sId = oFilterBar.getId() + "--filter--" + sPropertyName;
		return Promise.resolve(Element.getElementById(sId) ?? _createFilterField(sId, oProperty, oFilterBar));
	};

	return JSONFilterBarDelegate;
});