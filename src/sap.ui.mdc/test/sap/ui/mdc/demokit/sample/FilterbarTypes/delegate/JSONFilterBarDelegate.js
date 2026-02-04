/* eslint-disable require-await */
sap.ui.define([
	"sap/ui/core/Element",
	"sap/ui/mdc/FilterBarDelegate",
	"mdc/sample/model/metadata/JSONPropertyInfo",
	"sap/ui/mdc/FilterField",
	"sap/ui/core/mvc/View"
], function (Element, FilterBarDelegate, JSONPropertyInfo, FilterField, View) {
	"use strict";

	const JSONFilterBarDelegate = Object.assign({}, FilterBarDelegate);

	JSONFilterBarDelegate.fetchProperties = async () => JSONPropertyInfo;

	const _createFilterField = (sId, oProperty, oFilterBar) => {
		const sPropertyKey = oProperty.key;
		const oFilterField = new FilterField(sId, {
			propertyKey: sPropertyKey,
			delegate: {name: "sap/ui/mdc/field/FieldBaseDelegate", payload: {}}
		});
		if (sPropertyKey === "first_ascent") {
			oFilterField.setOperators(["EQ", "BT", "TODAY", "YESTERDAY", "TOMORROW", "TODAYFROMTO", "LASTDAYS", "NEXTDAYS"]);
		} else if (sPropertyKey === "rank") {
			oFilterField.setOperators(["EQ"]);
		} else if (sPropertyKey === "name") {
			const oView = getViewForControl(oFilterBar);
			oFilterField.setValueHelp(oView.createId("VH1"));
		}
		return oFilterField;
	};

	JSONFilterBarDelegate.addItem = async (oFilterBar, sPropertyName) => {
		const oProperty = JSONPropertyInfo.find((oPI) => oPI.key === sPropertyName);
		const sId = oFilterBar.getId() + "--filter--" + sPropertyName;
		return Promise.resolve(Element.getElementById(sId) ?? _createFilterField(sId, oProperty, oFilterBar));
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