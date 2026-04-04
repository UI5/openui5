/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log"
], function(
	Log
) {
	"use strict";

	/**
	 * @constant {string} SCHEMA_MAPPING_URL URL to the schema mapping file.
	 */
	const SCHEMA_MAPPING_URL = "https://raw.githubusercontent.com/SAP/ui5-manifest/main/mapping.json";

	/**
	 * @constant {string} FALLBACK_SCHEMA_VERSION Fallback schema version in case of fetch failure.
	 */
	const FALLBACK_SCHEMA_VERSION = "1.80.0";

	/**
	 * @type {Promise<string>} oFetchPromise Promise storing the ongoing fetch request.
	 */
	let oFetchPromise;

	return {
		/**
		 * Fetches the latest schema version from the central schema mapping file.
		 * @returns {Promise<string>} The latest schema version.
		 */
		fetchLatestVersion: function () {
			if (oFetchPromise) {
				return oFetchPromise;
			}

			oFetchPromise = (async () => {
				try {
					const oMapping = await (await fetch(SCHEMA_MAPPING_URL)).json();
					return oMapping.latest;
				} catch (sError) {
					Log.error(`Failed to fetch the latest schema version: ${sError}. Fallback to version ${FALLBACK_SCHEMA_VERSION}.`);
					return FALLBACK_SCHEMA_VERSION;
				}
			})();

			return oFetchPromise;
		},

		/**
		 * Returns the schema URL for the given version.
		 * @param {string} sVersion The schema version.
		 * @returns {string} The schema URL.
		 */
		getSchemaUrl: function (sVersion) {
			return "https://raw.githubusercontent.com/SAP/ui5-manifest/v" + sVersion + "/schema.json";
		}
	};
});
