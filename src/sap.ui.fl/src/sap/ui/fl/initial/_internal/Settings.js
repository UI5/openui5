/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/Log",
	"sap/ui/base/ManagedObject",
	"sap/ui/fl/initial/_internal/Storage",
	"sap/ui/fl/Layer",
	"sap/ui/fl/Utils"
], function(
	Log,
	ManagedObject,
	Storage,
	Layer,
	Utils
) {
	"use strict";

	let oSettingsInstance;
	let oLoadSettingsPromise;

	async function retrieveUserId() {
		const oUShellContainer = Utils.getUshellContainer();
		if (oUShellContainer) {
			try {
				const oUserInfoService = await Utils.getUShellService("UserInfo");
				return oUserInfoService.getUser()?.getId();
			} catch (oError) {
				Log.error(`Error getting service from Unified Shell: ${oError.message}`);
			}
		}
		return Promise.resolve("");
	}

	/**
	 * Holds all the system settings. Properties are classified as information or write operation.
	 * Write operations must have a layer configuration to determine which layers support the feature
	 *
	 * @class Settings class
	 * @extends sap.ui.base.ManagedObject
	 * @alias sap.ui.fl.initial._internal.Settings
	 * @since 1.137
	 * @version ${version}
	 * @private
	 * @ui5-restricted sap.ui.fl
	 */
	const Settings = ManagedObject.extend("sap.ui.fl.initial._internal.Settings", {
		metadata: {
			library: "sap.ui.fl",
			properties: {

				/**
				 * Client number, only set by ABAP systems
				 */
				client: { type: "string" },

				/**
				 * Indicates whether the CF services are split into two (KeyUser and Personalization)
				 * TODO remove this property and check the connector configuration directly where this property is used
				 */
				hasPersoConnector: { type: "boolean", defaultValue: false },

				/**
				 * Indicates whether the backend can handle annotation changes
				 */
				isAnnotationChangeEnabled: { type: "boolean", defaultValue: false },

				/**
				 * Indicates whether the app variant save as functionality is enabled
				 */
				isAppVariantSaveAsEnabled: { type: "boolean", defaultValue: false },

				/**
				 * Indicates whether the Adaptation Transport Organizer is enabled, only available in ABAP systems
				 */
				isAtoEnabled: { type: "boolean", defaultValue: false },

				/**
				 * Indicates whether the backend supports condensing
				 */
				isCondensingEnabled: { type: "boolean", defaultValue: false },

				/**
				 * Indicates whether the backend supports context-based adaptation
				 */
				isContextBasedAdaptationEnabled: { type: "boolean", defaultValue: false },

				/**
				 * Indicates whether the backend supports context sharing for views
				 */
				isContextSharingEnabled: { type: "boolean", defaultValue: true },

				/**
				 * Indicates whether the proper Authorization are set to be a Key User
				 */
				isKeyUser: { type: "boolean", defaultValue: false },

				/**
				 * Indicates whether the backend supports translation for key users. Only applicable for CF
				 */
				isKeyUserTranslationEnabled: { type: "boolean", defaultValue: false },

				/**
				 * Indicates whether the backend supports the local reset action
				 */
				isLocalResetEnabled: { type: "boolean", defaultValue: false },

				/**
				 * Indicates whether the backend is a productive system
				 */
				isProductiveSystem: { type: "boolean", defaultValue: true },

				/**
				 * Indicates whether public FlVariants are enabled. Customers can change this setting per system
				 */
				isPublicFlVariantEnabled: { type: "boolean", defaultValue: false },

				/**
				 * Indicates whether the backend supports the public layer
				 */
				isPublicLayerAvailable: { type: "boolean", defaultValue: false },

				/**
				 * Indicates whether the system has transports configured and is able to publish to another system
				 */
				isPublishAvailable: { type: "boolean", defaultValue: false },

				/**
				 * Indicates whether the backend can save already seen what's new features
				 */
				isSeenFeaturesAvailable: { type: "boolean", defaultValue: false },

				/**
				 * Indicates whether UI Adaptation at runtime or designtime are enabled for the SmartVariantManagement control
				 */
				isVariantAdaptationEnabled: { type: "boolean", defaultValue: false },

				/**
				 * Indicates whether there is a route to fetch variant author names
				 */
				isVariantAuthorNameAvailable: { type: "boolean", defaultValue: false },

				/**
				 * Indicates whether personalization of views is enabled.
				 * In ABAP, there is settings that customer can say no personalized on views at all
				 */
				isVariantPersonalizationEnabled: { type: "boolean", defaultValue: true },

				/**
				 * Indicates whether sharing of views is enabled via the "Public" checkbox
				 */
				isVariantSharingEnabled: { type: "boolean", defaultValue: false },

				/**
				 * Indicates per layer if draft handling is enabled
				 */
				isVersioningEnabled: { type: "boolean", defaultValue: false },

				/**
				 * Indicates system Id of the ABAP backend system
				 */
				system: { type: "string" },

				/**
				 * Indicates system type of the ABAP backend system
				 */
				systemType: { type: "string" },

				/**
				 * User Id, only set by the CF service
				 */
				userId: { type: "string" }
			}
		},
		constructor: function(...aArgs) {
			ManagedObject.apply(this, aArgs);

			const oUriParameters = new URLSearchParams(window.location.search);
			if (oUriParameters.has("sap-ui-xx-rta-adaptations")) {
				this.setProperty("isContextBasedAdaptationEnabled", oUriParameters.get("sap-ui-xx-rta-adaptations") === "true");
			}
		}
	});

	const oLayerConfig = {
		isAnnotationChangeEnabled: [Layer.CUSTOMER],
		isAppVariantSaveAsEnabled: [Layer.CUSTOMER],
		isCondensingEnabled: [Layer.USER, Layer.PUBLIC, Layer.CUSTOMER, Layer.CUSTOMER_BASE, Layer.VENDOR],
		isContextBasedAdaptationEnabled: [Layer.CUSTOMER],
		isKeyUser: [Layer.CUSTOMER],
		isKeyUserTranslationEnabled: [Layer.CUSTOMER],
		isLocalResetEnabled: [Layer.CUSTOMER, Layer.CUSTOMER_BASE, Layer.VENDOR],
		isPublicFlVariantEnabled: [Layer.PUBLIC],
		isPublishAvailable: [Layer.CUSTOMER],
		isSeenFeaturesAvailable: [Layer.CUSTOMER],
		isVariantPersonalizationEnabled: [Layer.USER],
		isVersioningEnabled: [Layer.CUSTOMER]
	};

	function loadSettings() {
		oLoadSettingsPromise = Storage.loadFeatures(oLayerConfig).then(async function(oLoadedSettings) {
			const oSettingsProperties = Object.assign({}, oLoadedSettings);
			if (oSettingsProperties.logonUser) {
				oSettingsProperties.userId = oSettingsProperties.logonUser;
				delete oSettingsProperties.logonUser;
			} else {
				oSettingsProperties.userId = await retrieveUserId();
			}

			// to keep the properties to a minimum, delete no longer used properties
			delete oSettingsProperties.isZeroDowntimeUpgradeRunning;
			delete oSettingsProperties.isAtoAvailable;

			// to avoid failing assertions, remove any unknown properties
			const aUnknownPropertyNames = Object.keys(oSettingsProperties)
			.map((sProperty) => {
				if (!Settings.getMetadata().getAllProperties()[sProperty]) {
					delete oSettingsProperties[sProperty];
					return sProperty;
				}
				return null;
			})
			.filter(Boolean);
			Log.warning(`Unknown settings received from the backend: ${aUnknownPropertyNames.join(", ")}`);

			// The following line is used by the Flex Support Tool to set breakpoints - please adjust the tool if you change it!
			oSettingsInstance = new Settings(oSettingsProperties);
			return oSettingsInstance;
		});
		return oLoadSettingsPromise;
	}

	/**
	 * Resolves with the settings instance. If the settings were not yet loaded, it loads them first.
	 * @returns {Promise<Settings>} Resolves with the settings instance
	 */
	Settings.getInstance = async function() {
		if (!oSettingsInstance) {
			if (oLoadSettingsPromise) {
				await oLoadSettingsPromise;
			} else {
				await loadSettings();
			}
		}
		return oSettingsInstance;
	};

	/**
	 * If the settings instance is already loaded, it returns it. If not, it returns undefined.
	 * @returns {Settings|undefined} Returns the settings instance or undefined if it is not yet loaded
	 */
	Settings.getInstanceOrUndef = function() {
		return oSettingsInstance;
	};

	// This function is used in the test only
	Settings.clearInstance = function() {
		oSettingsInstance = undefined;
		oLoadSettingsPromise = undefined;
	};

	return Settings;
});
