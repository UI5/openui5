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
		const sPropertyName = oProperty.key;
		const oFilterField = await oModifier.createControl("sap.ui.mdc.FilterField", oAppComponent, oView, sId, {
			dataType: oProperty.dataType,
			conditions: "{$filters>/conditions/" + sPropertyName + '}',
			propertyKey: sPropertyName,
			required: oProperty.required,
			label: oProperty.label,
			maxConditions: oProperty.maxConditions,
			delegate: {name: "sap/ui/mdc/field/FieldBaseDelegate", payload: {}}
		});
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