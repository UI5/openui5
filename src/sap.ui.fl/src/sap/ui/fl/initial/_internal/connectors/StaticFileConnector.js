/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/strings/hash",
	"sap/base/util/LoaderExtensions",
	"sap/base/util/merge",
	"sap/base/util/ObjectPath",
	"sap/base/Log",
	"sap/ui/core/Component",
	"sap/ui/core/Supportability",
	"sap/ui/fl/initial/_internal/connectors/Utils",
	"sap/ui/fl/initial/_internal/StorageUtils",
	"sap/ui/fl/interfaces/BaseLoadConnector"
], function(
	hash,
	LoaderExtensions,
	merge,
	ObjectPath,
	Log,
	Component,
	Supportability,
	ConnectorUtils,
	StorageUtils,
	BaseConnector
) {
	"use strict";

	function getBundle(sReference, sBundleName) {
		var sBundleResourcePath = `${sReference.replace(/\./g, "/")}/changes/${sBundleName}.json`;
		var bBundleLoaded = !!sap.ui.loader._.getModuleState(sBundleResourcePath);
		// the bundle is usually part of the component-preload
		// if the preload is suppressed, we send a potentially failing request
		if (bBundleLoaded || Supportability.isDebugModeEnabled() || Component.getComponentPreloadMode() === "off") {
			try {
				return LoaderExtensions.loadResource(sBundleResourcePath);
			} catch (e) {
				// JSON parse error of bundle file --> log error
				if (e.name.includes("SyntaxError")) {
					Log.error(e);
				}
				Log.warning(`flexibility did not find a ${sBundleName}.json for the application: ${sReference}`);
			}
		}
	}

	/**
	 * Connector for requesting flexibility data generated as part of the applications build step.
	 *
	 * @namespace sap.ui.fl.initial._internal.connectors.StaticFileConnector
	 * @implements {sap.ui.fl.interfaces.BaseLoadConnector}
	 * @since 1.67
	 * @private
	 * @ui5-restricted sap.ui.fl.apply._internal.Storage
	 */
	const StaticFileConnector = merge({}, BaseConnector, {
		/**
		 * Provides the flex data stored in the built flexibility- or changes-bundle JSON file.
		 *
		 * @param {object} mPropertyBag Properties needed by the connector
		 * @param {string} mPropertyBag.reference Reference of the application
		 * @param {string} [mPropertyBag.componentName] Component name of the current application which may differ in case of an app variant
		 * @returns {Promise<Object>} Resolving with an object containing a data contained in the bundle
		 */
		loadFlexData(mPropertyBag) {
			// fallback in case the loadFlexData was called without passing the component name
			const sComponentName = mPropertyBag.componentName || mPropertyBag.reference.replace(/.Component/g, "");

			let oFlexData;
			const oFlexBundle = getBundle(sComponentName, "flexibility-bundle");
			if (oFlexBundle) {
				// TODO: remove as soon as the client also does the separation of compVariants and changes
				oFlexBundle.changes = oFlexBundle.changes.concat(oFlexBundle.compVariants);
				delete oFlexBundle.compVariants;
				oFlexData = oFlexBundle;
			}

			const oChangesBundle = getBundle(sComponentName, "changes-bundle");
			if (oChangesBundle) {
				oFlexData = {
					changes: oChangesBundle
				};
			}

			if (StorageUtils.isStorageResponseFilled(oFlexData)) {
				// Collect all flex objects to calculate the cacheKey
				const aFlexObjects = StorageUtils.getAllFlexObjectNamespaces().reduce(function(aFlexObjects, sKey) {
					const aCurrentFlexObjects = ObjectPath.get(sKey, oFlexData);
					return aCurrentFlexObjects?.length ? aFlexObjects.concat(aCurrentFlexObjects) : aFlexObjects;
				}, []);
				oFlexData.cacheKey = ConnectorUtils.calculateCacheKey(aFlexObjects);
			}
			return Promise.resolve(oFlexData);
		},

		loadFeatures() {
			return Promise.resolve({});
		},

		loadVariantsAuthors() {
			return Promise.resolve({});
		}
	});

	return StaticFileConnector;
});
