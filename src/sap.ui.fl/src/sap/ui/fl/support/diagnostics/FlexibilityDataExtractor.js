/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/Log",
	"sap/ui/fl/support/api/SupportAPI",
	"sap/ui/VersionInfo"
], function(
	Log,
	SupportAPI,
	VersionInfo
) {
	"use strict";

	// Currently, only "user" properties are relevant for anonymization.
	// If other properties are identified, it might be better to list them in the FlexObject and
	// retrieve them from there.
	function anonymizeFlexibilityData(oFlexData) {
		const oUserMap = new Map();

		// Flex Settings "userId"
		if (Array.isArray(oFlexData.flexSettings)) {
			oFlexData.flexSettings.forEach((oSetting) => {
				if (oSetting.key === "userId" && typeof oSetting.value === "string") {
					if (!oUserMap.has(oSetting.value)) {
						const sAnonymizedUser = `USER_${oUserMap.size + 1}`;
						oUserMap.set(oSetting.value, sAnonymizedUser);
					}
					oSetting.value = oUserMap.get(oSetting.value);
				}
			});
		}

		// Every other "user" property, recursively
		function anonymizeObject(oObject) {
			for (const sKey in oObject) {
				if (Object.hasOwn(oObject, sKey)) {
					const vValue = oObject[sKey];
					if ((sKey === "user") && typeof vValue === "string") {
						if (!oUserMap.has(vValue)) {
							const sAnonymizedUser = `USER_${oUserMap.size + 1}`;
							oUserMap.set(vValue, sAnonymizedUser);
						}
						oObject[sKey] = oUserMap.get(vValue);
					} else if (typeof vValue === "object" && vValue !== null) {
						anonymizeObject(vValue);
					}
				}
			}
		}

		anonymizeObject(oFlexData);
	}

	const FlexibilityDataExtractor = {
		/**
		 * This module extracts the flexibility data from the current application in the diagnostics tool.
		 * The data downloads as a JSON file, so it must be serializable. When the application sends data to the tool,
		 * it transforms into a serializable object.
		 *
		 * @param {boolean} bAnonymizeUsers - Whether user-related data should be anonymized
		 *
		 * @private
		 * @ui5-restricted sap.ui.fl.support.diagnostics
		 */
		async extractFlexibilityData(bAnonymizeUsers) {
			const oFlexData = {};

			// Version the data format to support future changes
			oFlexData.extractorVersion = "1.0";

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

			const aCollectedFlexData = await Promise.all([
				SupportAPI.getFlexSettings(),
				SupportAPI.getChangeDependencies(),
				SupportAPI.getFlexObjectInfos()
			]);
			// Clone to ensure the original objects are not modified during anonymization
			// Use JSON instead of deepClone as these objects are not plain and still
			// have a prototype
			[
				oFlexData.flexSettings,
				oFlexData.changeDependencies,
				oFlexData.flexObjectInfos
			] = JSON.parse(JSON.stringify((aCollectedFlexData)));

			if (bAnonymizeUsers) {
				anonymizeFlexibilityData(oFlexData);
			}

			return oFlexData;
		}
	};

	return FlexibilityDataExtractor;
});