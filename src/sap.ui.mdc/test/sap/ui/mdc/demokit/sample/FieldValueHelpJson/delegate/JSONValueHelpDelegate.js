sap.ui.define([
	"./SearchValueHelpDelegate",
	"sap/ui/mdc/p13n/StateUtil",
	"sap/ui/mdc/condition/Condition",
	"sap/ui/mdc/enums/ConditionValidated"
], function (
	ValueHelpDelegate,
	StateUtil,
	Condition,
	ConditionValidated
) {
	"use strict";

	const JSONValueHelpDelegate = Object.assign({}, ValueHelpDelegate);

	JSONValueHelpDelegate.createConditionPayload = function (oValueHelp, oContent, aValues, oContext) {
		const sIdentifier = oContent.getId();
		const oConditionPayload = {};
		oConditionPayload[sIdentifier] = [];

		if (oContent.getId().endsWith("locationTypeAhead")) {
			if (oContext) {
				oConditionPayload[sIdentifier].push({
					countryId: oContext.getProperty("countryId")
				});
			}
		}
		return oConditionPayload;
	};

	// This delegate method sets the out-parameter for the "Country"
	JSONValueHelpDelegate.onConditionPropagation = function (oValueHelp, sReason, oConfig) {
		if (sReason !== "ControlChange") {
			return;
		}

		const oFilterField = oValueHelp.getControl();
		const oFilterBar = oFilterField.getParent();

		// find all conditions carrying country information
		const aAllConditionCountrysAndRegions = oFilterField?.getConditions().reduce(function (aResult, oCondition) {
			if (oCondition.payload) {
				Object.values(oCondition.payload).forEach(function (aSegments) {
					aSegments.forEach(function (oSegment) {
						if (oSegment["countryId"] && aResult.indexOf(oSegment["countryId"]) === -1) {
							aResult.push(oSegment["countryId"]);
						}
					});
				});
			}
			return aResult;
		}, []);

		if (aAllConditionCountrysAndRegions?.length) {
			StateUtil.retrieveExternalState(oFilterBar).then(function (oState) {
				let bModify = false;
				aAllConditionCountrysAndRegions.forEach(function (sCountry) {
					const bExists = oState.filter && oState.filter['buildingCountry'] && oState.filter['buildingCountry'].find(function (oCondition) {
						return oCondition.values[0] === sCountry;
					});
					if (!bExists) {
						const oNewConditionCountry = Condition.createCondition("EQ", [sCountry], undefined, undefined, ConditionValidated.Validated);
						oState.filter['buildingCountry'] = oState.filter && oState.filter['buildingCountry'] || [];
						oState.filter['buildingCountry'].push(oNewConditionCountry);
						bModify = true;
					}
				});

				if (bModify) {
					StateUtil.applyExternalState(oFilterBar, oState);
				}
			});
		}
	};

	JSONValueHelpDelegate.getFilterConditions = function (oValueHelp, oContent, oConfig) {
		const oFilterBar = oValueHelp.getControl().getParent();
		const oConditions = oFilterBar.getConditions();
		const oFilterConditions = {};

		if (oConditions["buildingCountry"]) {
			oFilterConditions["countryId"] = oConditions["buildingCountry"];
		}

		return oFilterConditions;
	};

	return JSONValueHelpDelegate;
});