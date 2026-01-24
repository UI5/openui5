/* eslint-disable require-await */
sap.ui.define([
	"sap/ui/core/Element",
	"sap/ui/mdc/FilterBarDelegate",
	"../model/metadata/JSONPropertyInfo",
	"sap/ui/mdc/FilterField",
	"sap/ui/mdc/odata/v4/TypeMap", // as for Date the V4 type is used
	"sap/ui/core/Fragment",
	"sap/ui/core/mvc/View"
], function (Element, FilterBarDelegate, JSONPropertyInfo, FilterField, ODataV4TypeMap, Fragment, View) {
	"use strict";

	const JSONFilterBarDelegate = Object.assign({}, FilterBarDelegate);

	JSONFilterBarDelegate.getTypeMap = function (oPayload) {
		return ODataV4TypeMap;
	};

	JSONFilterBarDelegate.fetchProperties = async (oFilterBar) => {
		return JSONPropertyInfo.mountains;
	};

	const _createFilterField = async (sId, oProperty, oFilterBar) => {
		const sPropertyKey = oProperty.key;
		const oFilterField = new FilterField(sId, {
			dataType: oProperty.dataType,
			dataTypeFormatOptions: oProperty.formatOptions,
			dataTypeConstraints: oProperty.constraints,
			conditions: "{$filters>/conditions/" + sPropertyKey + '}',
			propertyKey: sPropertyKey,
			required: oProperty.required,
			label: oProperty.label,
			maxConditions: oProperty.maxConditions,
			delegate: oProperty.dataType?.startsWith("sap.ui.model.odata") ? {name: "delegates/odata/v4/FieldBaseDelegate", payload: {}} : {name: "sap/ui/mdc/field/FieldBaseDelegate", payload: {}}
		});
		if (oProperty.dataType?.startsWith("sap.ui.model.odata")) {
			oFilterField.setOperators(["EQ", "BT", "TODAY", "YESTERDAY", "TOMORROW", "TODAYFROMTO", "LASTDAYS", "NEXTDAYS"]);
		} else if (sPropertyKey === "rank") {
			oFilterField.setOperators(["EQ"]);
		} else if (sPropertyKey === "name") {
			const oView = getViewForControl(oFilterBar);
			oFilterField.setValueHelp(oView.createId("VHName"));
		} else if (sPropertyKey === "countries") {
			const oView = getViewForControl(oFilterBar);
			oFilterField.setValueHelp(oView.createId("VHCountries"));
		} else if (sPropertyKey === "range") {
			const oView = getViewForControl(oFilterBar);
			oFilterField.setValueHelp(oView.createId("VHRange"));
		}
		return oFilterField;
	};

	JSONFilterBarDelegate.addItem = async (oFilterBar, sPropertyName) => {
		const oProperty = JSONPropertyInfo.mountains.find((oPI) => oPI.key === sPropertyName);
		const sId = oFilterBar.getId() + "--filter--" + sPropertyName;
		return Element.getElementById(sId) ?? (await _createFilterField(sId, oProperty, oFilterBar));
	};

	JSONFilterBarDelegate.removeItem = async (oFilterBar, oFilterField) => {
		oFilterField.destroy();
		return true; // allow default handling
	};

	function getViewForControl(oControl) {
		if (oControl instanceof View) {
			return oControl;
		}
		if (oControl && typeof oControl.getParent === "function") {
			oControl = oControl.getParent();
			return getViewForControl(oControl);
		}
		return undefined;
	}

	return JSONFilterBarDelegate;
});