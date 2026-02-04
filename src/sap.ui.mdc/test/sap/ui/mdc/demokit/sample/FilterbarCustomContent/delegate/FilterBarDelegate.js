/* eslint-disable require-await */
sap.ui.define([
	"sap/ui/mdc/FilterBarDelegate",
	"mdc/sample/model/metadata/JSONPropertyInfo",
	"sap/ui/mdc/FilterField",
	"sap/ui/mdc/field/ConditionsType",
	"sap/ui/mdc/field/ConditionType",
	"sap/m/Slider",
	"sap/m/Token",
	"sap/m/SegmentedButtonItem",
	"../controls/CustomSegmentedButton",
	"../controls/CustomMultiInput",
	"sap/ui/core/mvc/View"
], function (FilterBarDelegate, JSONPropertyInfo, FilterField, ConditionsType, ConditionType, Slider, Token, SegmentedButtonItem, CustomSegmentedButton, CustomMultiInput, View) {
	"use strict";

	const JSONFilterBarDelegate = Object.assign({}, FilterBarDelegate);

	JSONFilterBarDelegate.fetchProperties = async () => JSONPropertyInfo;

	const _createFilterField = (sId, oProperty, oFilterBar) => {
		const sPropertyKey = oProperty.key;
		let oContentEdit;
		let sValueHelpId;

		if (sPropertyKey === "numberWords") {
			oContentEdit = new Slider(sId + "-S", {
				value: {path: '$field>/conditions', type: new ConditionsType()},
				min: 0,
				max: 100000
			});
		} else if (sPropertyKey === "descr") {
			oContentEdit = new CustomMultiInput(sId + "-CMI", {
				value: {path: '$field>/conditions', type: new ConditionsType()},
				tokens: {
					path: '$field>/conditions',
					template: new Token({
						text: {path: '$field>', type: new ConditionType()},
						key: {path: '$field>', type: new ConditionType()}
					})
				}
			});
			const oView = getViewForControl(oFilterBar);
			sValueHelpId = oView.createId("VH-Conditions");
		} else if (sPropertyKey === "status") {
			const oPlanningButton = new SegmentedButtonItem(sId + "-SB-planning", { text: "Planning", key: "planning" });
			const oInProcessButton = new SegmentedButtonItem(sId + "-SB-inProcess", { text: "In Process", key: "inProcess" });
			const oDoneButton = new SegmentedButtonItem(sId + "-SB-done", { text: "Done", key: "done" });

			oContentEdit = new CustomSegmentedButton(sId + "-SB", {
				conditions: "{path: '$field>/conditions'}",
				items: [
					oPlanningButton,
					oInProcessButton,
					oDoneButton
				]
			});
		}

		const oFilterField = new FilterField(sId, {
			propertyKey: sPropertyKey,
			contentEdit: oContentEdit,
			valueHelp: sValueHelpId,
			delegate: { name: "sap/ui/mdc/field/FieldBaseDelegate", payload: {} }
		});

		return oFilterField;
	};

	JSONFilterBarDelegate.addItem = async (oFilterBar, sPropertyName) => {
		const oProperty = JSONPropertyInfo.find((oPI) => oPI.key === sPropertyName);
		const sId = oFilterBar.getId() + "--filter--" + sPropertyName;
		return Promise.resolve(_createFilterField(sId, oProperty, oFilterBar));
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