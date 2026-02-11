/* eslint-disable require-await */
sap.ui.define([
	"sap/ui/core/Element",
	'sap/ui/core/util/reflection/JsControlTreeModifier',
	"sap/ui/mdc/FilterBarDelegate",
	"mdc/sample/model/metadata/JSONPropertyInfo",
	"sap/ui/fl/Utils"
], function (Element, JsControlTreeModifier, FilterBarDelegate, JSONPropertyInfo, FlUtils) {
	"use strict";

	const JSONFilterBarDelegate = Object.assign({}, FilterBarDelegate);

	JSONFilterBarDelegate.fetchProperties = async () => JSONPropertyInfo;

	const _createFilterField = async (sId, oProperty, oFilterBar, mPropertyBag) => {
		const {modifier, appComponent, view} = mPropertyBag || {};
		const oModifier = modifier || JsControlTreeModifier;
		const oAppComponent = appComponent || FlUtils.getAppComponentForControl(oFilterBar);
		const oView = view || FlUtils.getViewForControl(oFilterBar);
		const sPropertyKey = oProperty.key;
		const mFielterFieldSettings = {
			propertyKey: sPropertyKey,
			delegate: {name: "sap/ui/mdc/field/FieldBaseDelegate", payload: {}}
		};
		if (sPropertyKey === "first_ascent") {
			mFielterFieldSettings.operators = ["EQ", "BT", "TODAY", "YESTERDAY", "TOMORROW", "TODAYFROMTO", "LASTDAYS", "NEXTDAYS"];
		} else if (sPropertyKey === "rank") {
			mFielterFieldSettings.operators = ["EQ"];
		} else if (sPropertyKey === "name") {
			mFielterFieldSettings.valueHelp = oView.createId("VH1");
		}

		const oFilterField = await oModifier.createControl("sap.ui.mdc.FilterField", oAppComponent, oView, sId, mFielterFieldSettings);
		return oFilterField;
	};

	JSONFilterBarDelegate.addItem = async (oFilterBar, sPropertyName, mPropertyBag) => {
		const oProperty = JSONPropertyInfo.find((oPI) => oPI.key === sPropertyName);
		const sId = (oFilterBar.getId?.() || oFilterBar.id) + "--filter--" + sPropertyName;
		return Element.getElementById(sId) ?? (await _createFilterField(sId, oProperty, oFilterBar, mPropertyBag));
	};

	JSONFilterBarDelegate.removeItem = async (oFilterBar, oFilterField) => {
		oFilterField.destroy();
		return true; // allow default handling
	};

	return JSONFilterBarDelegate;
});