/* eslint-disable require-await */
sap.ui.define([
	"sap/ui/mdc/ListDelegate",
	"sap/ui/mdc/FilterField",
	"sap/ui/core/Element",
	"mdc/sample/model/metadata/JSONPropertyInfo"
], function(ListDelegate, FilterField, Element, JSONPropertyInfo) {
	"use strict";

	const JSONListDelegate = Object.assign({}, ListDelegate);

	JSONListDelegate.fetchProperties = async () => JSONPropertyInfo;

	JSONListDelegate.updateBindingInfo = function(oList, oBindingInfo) {
		ListDelegate.updateBindingInfo.call(JSONListDelegate, oList, oBindingInfo);
		oBindingInfo.path = oBindingInfo.path || oList.getPayload()?.bindingPath;
	};

	JSONListDelegate.getFilterDelegate = function() {
		return {
			addItem: function(oList, sPropertyKey) {
				const oProperty = JSONPropertyInfo.find((oProp) => oProp.key === sPropertyKey);
				if (!oProperty) {
					return Promise.resolve(null);
				}
				const sId = oList.getId() + "--filter--" + sPropertyKey;
				const oExisting = Element.getElementById(sId);
				if (oExisting) {
					return Promise.resolve(oExisting);
				}
				return Promise.resolve(new FilterField(sId, {
					dataType: oProperty.dataType,
					conditions: "{$filters>/conditions/" + sPropertyKey + "}",
					propertyKey: sPropertyKey,
					label: oProperty.label,
					maxConditions: oProperty.maxConditions,
					delegate: {name: "sap/ui/mdc/field/FieldBaseDelegate", payload: {}}
				}));
			},
			addCondition: function(oList, sPropertyKey, mPropertyBag) {
				return Promise.resolve();
			},
			removeCondition: function(oList, sPropertyKey, mPropertyBag) {
				return Promise.resolve();
			}
		};
	};

	return JSONListDelegate;
}, /* bExport= */false);
