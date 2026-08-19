/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/core/Element",
	"sap/ui/fl/apply/_internal/flexState/FlexObjectState",
	"sap/ui/fl/initial/_internal/ManifestUtils"
], function(
	JsControlTreeModifier,
	Element,
	FlexObjectState,
	ManifestUtils
) {
	"use strict";

	// The dependencies are retrieved for VM-independent changes + the changes from the currently selected variant(s) in the app
	function enhanceExportWithChangeData(oExport, oAppComponent) {
		const mInitialDependencies = FlexObjectState.getCompleteDependencyMap(oExport.sComponentName).mDependencies;
		for (const sChangeId in mInitialDependencies) {
			const oChange = mInitialDependencies[sChangeId].changeObject;
			oExport.mChangesEntries[sChangeId] = {
				mDefinition: oChange.convertToFileContent(),
				aControlsDependencies: [],
				aDependencies: []
			};

			if (oChange._aDependentSelectorList && oAppComponent) {
				oChange._aDependentSelectorList.forEach(function(oSelector) {
					const mControlData = {
						bPresent: !!JsControlTreeModifier.bySelector(oSelector, oAppComponent),
						aAppliedChanges: [],
						aAppliedChangesXml: [],
						aAppliedChangesJs: [],
						aFailedChangesJs: [],
						aFailedChangesXml: [],
						aNotApplicableChanges: []
					};

					oExport.mControlData[oSelector.id] = mControlData;
				});
			}
		}

		enhanceExportWithDependencyData(oExport.sComponentName, oExport);
	}

	function enhanceExportWithDependencyData(sReference, oExport) {
		const mInitialDependencies = FlexObjectState.getCompleteDependencyMap(sReference).mDependencies;
		for (const sChangeId in mInitialDependencies) {
			const mChangeSpecificDependencies = mInitialDependencies[sChangeId];
			oExport.mChangesEntries[sChangeId].aControlsDependencies = mChangeSpecificDependencies.controlsDependencies;
			oExport.mChangesEntries[sChangeId].aDependencies = mChangeSpecificDependencies.dependencies;
		}
	}

	function enhanceWithChangetypeSpecificData(oExport, sExportParameterName, mControlData, sControlDataParameterName, aCustomDataChanges) {
		if (aCustomDataChanges) {
			mControlData[sControlDataParameterName] = aCustomDataChanges;
			// sExportParameterName is optional: when omitted the data is only stored per control and not
			// aggregated into a top-level array (used for the XML-applied subset, which is already part of
			// the top-level applied changes)
			if (sExportParameterName) {
				mControlData[sControlDataParameterName].forEach(function(sChangeId) {
					if (!oExport[sExportParameterName].includes(sChangeId)) {
						oExport[sExportParameterName].push(sChangeId);
					}
				});
			}
		}
	}

	function getChangesForControlFromCustomData(oControl, sIdentifier, sExcludedIdentifier) {
		const aCustomData = oControl.getCustomData();
		const aChangeIds = [];
		aCustomData.forEach(function(oCustomData) {
			const sKey = oCustomData.getKey();
			if (sKey.startsWith(sIdentifier) && !(sExcludedIdentifier && sKey.startsWith(sExcludedIdentifier))) {
				aChangeIds.push(sKey.replace(sIdentifier, ""));
			}
		});
		return aChangeIds;
	}

	function enhanceExportWithControlData(oExport) {
		// collect applied changes

		for (const sControlId in FlexObjectState.getLiveDependencyMap(oExport.sComponentName).mChanges) {
			const mControlData = {
				bPresent: false,
				aAppliedChanges: [],
				aAppliedChangesXml: [],
				aAppliedChangesJs: [],
				aFailedChangesJs: [],
				aFailedChangesXml: [],
				aNotApplicableChanges: []
			};

			const oControl = Element.getElementById(sControlId);

			if (oControl) {
				mControlData.bPresent = true;
				enhanceWithChangetypeSpecificData(
					oExport,
					"aAppliedChanges",
					mControlData,
					"aAppliedChanges",
					// exclude the XML-applied marker so it is not counted as a separate (bogus) applied change
					getChangesForControlFromCustomData(oControl, "sap.ui.fl.appliedChanges.", "sap.ui.fl.appliedChanges.xml.")
				);
				enhanceWithChangetypeSpecificData(
					oExport,
					null,
					mControlData,
					"aAppliedChangesXml",
					getChangesForControlFromCustomData(oControl, "sap.ui.fl.appliedChanges.xml.")
				);
				// the JS-applied changes are the applied changes that were not marked as XML-applied;
				// there is no dedicated marker for the JS applier, so the set is derived here
				mControlData.aAppliedChangesJs = mControlData.aAppliedChanges.filter(function(sChangeId) {
					return !mControlData.aAppliedChangesXml.includes(sChangeId);
				});
				enhanceWithChangetypeSpecificData(
					oExport,
					"aFailedChanges",
					mControlData,
					"aFailedChangesJs",
					getChangesForControlFromCustomData(oControl, "sap.ui.fl.failedChanges.js.")
				);
				enhanceWithChangetypeSpecificData(
					oExport,
					"aFailedChanges",
					mControlData,
					"aFailedChangesXml",
					getChangesForControlFromCustomData(oControl, "sap.ui.fl.failedChanges.xml.")
				);
				enhanceWithChangetypeSpecificData(
					oExport,
					"aNotApplicableChanges",
					mControlData,
					"aNotApplicableChanges",
					getChangesForControlFromCustomData(oControl, "sap.ui.fl.notApplicableChanges.")
				);
			}
			oExport.mControlData[sControlId] = mControlData;
		}
	}

	function extractChangeDependencies(oAppComponent) {
		if (!oAppComponent) {
			return undefined;
		}

		const sComponentName = ManifestUtils.getFlexReferenceForControl(oAppComponent);

		const oExport = {
			sVersion: "1",
			bIsInvestigationExport: true,
			mControlData: {},
			aAppliedChanges: [],
			aFailedChanges: [],
			aNotApplicableChanges: [],
			mChangesEntries: {},
			mVariantsChanges: {},
			sComponentName
		};

		enhanceExportWithChangeData(oExport, oAppComponent);
		enhanceExportWithControlData(oExport);

		return oExport;
	}

	return {
		extract: extractChangeDependencies
	};
});