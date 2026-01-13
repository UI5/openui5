/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/Log",
	"sap/base/util/isEmptyObject",
	"sap/base/util/isPlainObject",
	"sap/ui/fl/support/api/SupportAPI",
	"sap/ui/VersionInfo"
], function(
	Log,
	isEmptyObject,
	isPlainObject,
	SupportAPI,
	VersionInfo
) {
	"use strict";

	const oUserMap = new Map();

	function isValidObject(vValue) {
		return typeof vValue === "object"
		&& vValue !== null
		&& Array.isArray(vValue) === false
		&& !isEmptyObject(vValue);
	}

	// The settings object contains currently one property for anonymization: "userId"
	function anonymizeSettingsObject(bAnonymizeUsers, aFlexSettings) {
		if (bAnonymizeUsers && aFlexSettings) {
			aFlexSettings.forEach((oSetting) => {
				oSetting.value = anonymizeValue(oSetting.key, oSetting.value);
			});
		}
		return aFlexSettings;
	}

	// Currently, only "userId" and "user" properties are relevant for anonymization in Flex Objects.
	// If other properties are identified, it might be better to list them in the FlexObject and
	// retrieve them from there.
	function anonymizeValue(sKey, vValue) {
		if (["userId", "user"].includes(sKey) && typeof vValue === "string") {
			if (!oUserMap.has(vValue)) {
				const sAnonymizedUser = `USER_${oUserMap.size + 1}`;
				oUserMap.set(vValue, sAnonymizedUser);
			}
			return oUserMap.get(vValue);
		}
		return vValue;
	}

	// recursive function to anonymize all user-related data in a plain Flex Object
	function anonymizeObject(vObject) {
		const oReturnObject = {};
		if (isValidObject) {
			for (const sKey in vObject) {
				if (Object.hasOwn(vObject, sKey)) {
					const vValue = vObject[sKey];
					if (isValidObject(vValue) || Array.isArray(vValue)) {
						oReturnObject[sKey] = anonymizeObject(vValue);
					} else {
						oReturnObject[sKey] = anonymizeValue(sKey, vValue);
					}
				}
			}
			return oReturnObject;
		} else if (Array.isArray(vObject)) {
			return vObject.map((vItem) => anonymizeObject(vItem));
		}
		return vObject;
	}

	function cloneFlexObject(vValue, bAnonymizeUsers) {
		try {
			return bAnonymizeUsers
				? JSON.parse(JSON.stringify(vValue, anonymizeValue))
				: JSON.parse(JSON.stringify(vValue));
		} catch (error) {
			return `${vValue.getMetadata?.()?.getName?.() || "Instance"} ${vValue.getId?.() || "(no ID)"} `
			+ "is not serializable.";
		}
	}

	// recursive function to handle nested structures
	function cloneHandler(bAnonymizeUsers, vValue, sKey, fnFlexObjectCallback) {
		let vClonedValue;
		if (isPlainObject(vValue)) {
			vClonedValue = cloneFlexData(bAnonymizeUsers, vValue, fnFlexObjectCallback);
		} else if (Array.isArray(vValue)) {
			vClonedValue = vValue.map((vItem) => {
				return cloneHandler(bAnonymizeUsers, vItem, null, fnFlexObjectCallback);
			});
		} else if (isValidObject(vValue)) {
			// complex object (e.g., class instance)
			vClonedValue = vValue.isA("sap.ui.fl.apply._internal.flexObjects.FlexObject") ?
				fnFlexObjectCallback(vValue, bAnonymizeUsers) :
				cloneFlexData(bAnonymizeUsers, vValue, fnFlexObjectCallback);
		} else {
			vClonedValue = vValue;
		}
		return vClonedValue;
	}

	function cloneFlexData(bAnonymizeUsers, vFlexData, fnFlexObjectCallback) {
		if (Array.isArray(vFlexData)) {
			return vFlexData.map((vItem) => cloneHandler(bAnonymizeUsers, vItem, null, fnFlexObjectCallback));
		}
		// Clone to ensure the original object is not modified during anonymization
		return Object.keys(vFlexData).reduce((oAcc, sKey) => {
			const vValue = vFlexData[sKey];
			oAcc[sKey] = cloneHandler(bAnonymizeUsers, vValue, sKey, fnFlexObjectCallback);
			return oAcc;
		}, {});
	}

	function getReducedLiveDependencyMap(oFlexObjectInfos) {
		const oLiveDependencyMap = cloneFlexData(
			false,
			oFlexObjectInfos.liveDependencyMap,
			(oChange) => oChange.getId() // replace flex object with its ID
		);
		return oLiveDependencyMap;
	}

	function getApplyStates(oFlexObjectInfos) {
		return (oFlexObjectInfos?.allUIChanges || []).reduce((oApplyStates, oChange) => {
			oApplyStates[oChange.getId()] = oChange.getApplyState();
			return oApplyStates;
		}, {});
	}

	async function extractReducedFlexibilityData(bAnonymizeUsers) {
		const oFlexData = {
			flexObjectInfos: {}
		};

		const oFlexObjectInfos = await SupportAPI.getFlexObjectInfos();

		// specific convertation and anonymization of Flex Objects upfront. After convertation in plain objects
		// it is not possible anymore to identify Flex Objects in a generic way to anonymize them properly.
		oFlexData.flexObjectInfos.allFlexObjectFileContents = oFlexObjectInfos.allFlexObjects.map((oFlexContext) => {
			const oFileContent = oFlexContext.convertToFileContent();
			return bAnonymizeUsers ? anonymizeObject(oFileContent) : oFileContent;
		});
		oFlexData.flexObjectInfos.liveDependencyMap = getReducedLiveDependencyMap(oFlexObjectInfos);
		oFlexData.flexObjectInfos.applyStates = getApplyStates(oFlexObjectInfos);

		return oFlexData;
	}

	async function extractFullFlexibilityData(bAnonymizeUsers) {
		const oFullFlexData = {};
		[
			oFullFlexData.changeDependencies,
			oFullFlexData.flexObjectInfos
		] = await Promise.all([
			SupportAPI.getChangeDependencies(),
			SupportAPI.getFlexObjectInfos()
		]);

		if (bAnonymizeUsers) {
			// mChangesEntries are plain objects representing Flex Objects. We need to anonymize them upfront as it is not
			// possible afterwards to identify them in a generic way.
			oFullFlexData.changeDependencies.mChangesEntries = Object.keys(oFullFlexData.changeDependencies.mChangesEntries)
			.reduce((mAcc, sChangeId) => {
				const oChangeEntry = oFullFlexData.changeDependencies.mChangesEntries[sChangeId];
				mAcc[sChangeId] = anonymizeObject(oChangeEntry);
				return mAcc;
			}, {});
		}
		return oFullFlexData;
	}

	const FlexibilityDataExtractor = {
		/**
		 * This module extracts the flexibility data from the current application in the diagnostics tool.
		 * The data downloads as a JSON file, so it must be serializable. When the application sends data to the tool,
		 * it transforms into a serializable object. It returns two different sets of data, depending on the parameters
		 *
		 * @param {boolean} bAnonymizeUsers - Whether user-related data should be anonymized
		 * @param {boolean} bExportFullData - Whether a full data set should be exported. If false, a reduced data set is exported.
		 *
		 * @private
		 * @ui5-restricted sap.ui.fl.support.diagnostics
		 */
		async extractFlexibilityData(bAnonymizeUsers, bExportFullData) {
			let oFlexData = {};
			oUserMap.clear();

			// Version the data format to support future changes
			oFlexData.extractorVersion = "2.0";
			oFlexData.extractionTimeStamp = new Date().toISOString();
			const oVersionInfo = await VersionInfo.load();
			oFlexData.ui5Version = oVersionInfo.version;
			const oAppComponent = await SupportAPI.getApplicationComponent();
			if (!oAppComponent) {
				Log.error("No application component found");
				return {};
			}
			oFlexData.appVersion = oAppComponent.getManifestObject().getEntry("/sap.app/applicationVersion/version");
			oFlexData.appACH = oAppComponent.getManifestObject().getEntry("/sap.app/ach");
			const aFlexSettings = await SupportAPI.getFlexSettings();
			oFlexData.flexSettings = anonymizeSettingsObject(bAnonymizeUsers, aFlexSettings);

			if (bExportFullData) {
				const oFullFlexData = await extractFullFlexibilityData(bAnonymizeUsers);
				oFlexData = { ...oFlexData, ...oFullFlexData };
			} else {
				const oReducedFlexData = await extractReducedFlexibilityData(bAnonymizeUsers);
				oFlexData = { ...oFlexData, ...oReducedFlexData };
			}

			// Generic cloning and anonymization of Flex Objects included as instances in the Flex Data
			return cloneFlexData(bAnonymizeUsers, oFlexData, cloneFlexObject);
		}
	};

	return FlexibilityDataExtractor;
});