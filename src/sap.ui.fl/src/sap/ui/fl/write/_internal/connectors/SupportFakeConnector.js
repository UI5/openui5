/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/util/merge",
	"sap/ui/fl/Layer",
	"sap/ui/fl/initial/_internal/StorageUtils",
	"sap/ui/fl/write/connectors/BaseConnector"
], function(
	merge,
	Layer,
	StorageUtils,
	BaseConnector
) {
	"use strict";

	/**
	 * Connector for saving data to the <code>window.localStorage</code>.
	 * This connector is used by Flexibility Support Chrome extension. It replaces the default connector
	 * and allows to apply changes from the JSON file which has been created by the Flexibility Data Export Tool
	 *
	 * @namespace sap.ui.fl.write._internal.connectors.SupportFakeConnector
	 * @since 1.146
	 * @private
	 * @ui5-restricted sap.ui.fl.write._internal.Connector
	 */
	var SupportFakeConnector = merge({}, BaseConnector, /** @lends sap.ui.fl.write._internal.connectors.SupportFakeConnector */ {
		storage: undefined,
		layers: [
			Layer.CUSTOMER,
			Layer.PUBLIC,
			Layer.USER
		],

		versions: {
			load() {
				return Promise.resolve([]);
			},
			activate() {
				return Promise.resolve("Activating not supported for SupportFakeConnector. No action taken.");
			}
		}
	});

	/**
	 * Loads flexibility features from local storage.
	 *
	 * Retrieves the applied flexibility data from <code>window.localStorage</code> and extracts
	 * the feature settings. The feature settings array is converted from an array of objects with
	 * "key" and "value" properties into a map object where each key maps directly to its corresponding value.
	 *
	 * @returns {Promise<object>} Resolves with an object containing the feature settings as key-value pairs,
	 *                            or an empty object if no data is available in local storage.
	 *
	 * @private
	 * @ui5-restricted sap.ui.fl.write._internal
	 */
	SupportFakeConnector.loadFeatures = function() {
		const sImportedFlexData = window.localStorage.getItem("UI5.Flexibility.Support.appliedData");
		const oImportedFlexData = sImportedFlexData ? JSON.parse(sImportedFlexData) : null;
		if (oImportedFlexData) {
			// convert the imported flex data features into the expected format
			const aFeatures = oImportedFlexData.flexSettings;
			const mFeatures = aFeatures.reduce((aFeatures, oCurrent) => {
				aFeatures[oCurrent.key] = oCurrent.value;
				return aFeatures;
			}, {});
			return Promise.resolve(mFeatures);
		}
		return Promise.resolve({});
	};

	/**
	 * Loads flexibility data from local storage.
	 *
	 * Retrieves the applied flexibility data from <code>window.localStorage</code> and returns
	 * a flex data response object with the loaded changes. If no data is available, resolves with an empty object.
	 *
	 * @returns {Promise<object>} Resolves with the loaded flex data response object or an empty object if not available.
	 *
	 * @private
	 * @ui5-restricted sap.ui.fl.write._internal
	 */
	SupportFakeConnector.loadFlexData = function() {
		const sImportedFlexData = window.localStorage.getItem("UI5.Flexibility.Support.appliedData");
		const oImportedFlexData = sImportedFlexData ? JSON.parse(sImportedFlexData) : null;
		if (oImportedFlexData) {
			// First get the empty structure
			const oLoadedFlexData = StorageUtils.getEmptyFlexDataResponse();
			// Then fill it with the imported data
			oLoadedFlexData.changes = oImportedFlexData.flexObjectInfos.allFlexObjectFileContents || [];
			return Promise.resolve(oLoadedFlexData);
		}
		return Promise.resolve({});
	};

	/**
	 * Condenses flexibility changes.
	 *
	 * This method is a placeholder for the condense operation, which is not supported
	 * by the SupportFakeConnector. It always resolves with a message indicating that
	 * condensing is not supported and no action is taken.
	 *
	 * @returns {Promise<string>} Resolves with a message stating that condensing is not supported.
	 *
	 * @private
	 * @ui5-restricted sap.ui.fl.write._internal
	 */
	SupportFakeConnector.condense = function() {
		return Promise.resolve("Condensing not supported for SupportFakeConnector. No action taken.");
	};

	return SupportFakeConnector;
});