/*!
 * ${copyright}
 */

sap.ui.define([], function() {
	"use strict";

	/**
	 * ConnectorFeaturesMerger class for Connector implementations (initial).
	 *
	 * @namespace sap.ui.fl.initial._internal.StorageFeaturesMerger
	 * @since 1.70
	 * @version ${version}
	 * @private
	 * @ui5-restricted sap.ui.fl.initial._internal.Storage
	 */

	return {
		/**
		 * Merges the results from all involved connectors;
		 * If there is a layer configuration for a feature (mandatory for all write operations),
		 * only the values from the connectors that have the correct layers defined are considered.
		 * Some connectors also have the layer "ALL" defined to indicate that their result is valid for all layers.
		 *
		 * @param {object[]} aResponses - All responses provided by the different connectors
		 * @param {object} oLayerConfig - Layer Configuration for write operations
		 * @returns {object} Merged result
		 */
		mergeResults(aResponses, oLayerConfig) {
			return aResponses.reduce((oAccumulatedFeatures, oResponse) => {
				Object.keys(oResponse.features).forEach((sKey) => {
					if (!oLayerConfig[sKey]) {
						oAccumulatedFeatures[sKey] = oResponse.features[sKey];
					} else if (oLayerConfig[sKey].concat("ALL").some((sLayer) => (oResponse.layers || []).includes(sLayer))) {
						oAccumulatedFeatures[sKey] = oResponse.features[sKey];
					}
				});
				return oAccumulatedFeatures;
			}, {});
		}
	};
});
