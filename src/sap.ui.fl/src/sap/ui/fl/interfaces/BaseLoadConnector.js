/*!
 * ${copyright}
 */

sap.ui.define([], function() {
	"use strict";

	/**
	 * Base class for connectors.
	 *
	 * @name sap.ui.fl.interfaces.BaseLoadConnector
	 * @since 1.79
	 * @version ${version}
	 *
	 * @private
	 * @ui5-restricted SAP Web IDE (Visual Editor), UX Tools
	 * @interface
	 */
	var BaseConnector = /** @lends sap.ui.fl.interfaces.BaseLoadConnector */ {
		/**
		 * Interface called to get the flex data, including changes and variants.
		 *
		 * @param {object} mPropertyBag Properties needed by the connectors
		 * @param {string} mPropertyBag.flexReference Reference of the application
		 * @param {string} [mPropertyBag.url] Configured URL for the connector
		 * @param {string} [mPropertyBag.cacheKey] Key which can be used to etag / cachebuster the request
		 * @param {boolean} [mPropertyBag.lazyLoadingViewsEnabled] Signals to the back end that lazy loading of variants is supported, must not be set when starting key user adaptation
		 * @returns {Promise<Object>} Promise resolving with an object containing a flex data response
		 *
		 * @private
		 * @ui5-restricted SAP Web IDE (Visual Editor), UX Tools
		 */
		loadFlexData(/* mPropertyBag */) {
			return Promise.reject(new Error("loadFlexData is not implemented"));
		},

		/**
		 * Interface called to get the flex feature.
		 *
		 * @returns {Promise<object>} Resolves with an object containing the data for the flex features
		 */
		loadFeatures() {
			return Promise.reject(new Error("loadFeatures is not implemented"));
		},

		/**
		 * Get the names of variants' authors.
		 *
		 * @param {object} mPropertyBag - Property bag
		 * @param {string} mPropertyBag.reference - Flexibility reference
		 * @param {string} [mPropertyBag.url] - Configured URL for the connector
		 * @returns {Promise<object>} Resolves with a map between variant IDs and their authors' names containing the data for the flex features
		 */
		loadVariantsAuthors() {
			return Promise.reject(new Error("loadVariantsAuthors is not implemented"));
		},

		/**
		 * Fetches all flex objects related to the given variant reference
		 *
		 * @param {object} mPropertyBag - Property bag
		 * @param {string} mPropertyBag.reference - Flexibility reference
		 * @param {string} mPropertyBag.variantReference - Variant reference to be loaded
		 * @param {string} [mPropertyBag.url] - Configured URL for the connector
		 * @param {sap.ui.fl.Layer} [mPropertyBag.layer] - Layer of the objects to be loaded
		 * @returns {Promise<object>} Resolves with the data for variant
		 */
		loadFlVariant() {
			return Promise.reject(new Error("loadFlVariant is not implemented"));
		},

		/**
		 * Load all FL variants and their metadata for Manage Views dialog.
		 * @param {object} mPropertyBag Property bag
		 * @param {string} mPropertyBag.reference Flexibility reference
		 * @param {string} mPropertyBag.vmReference Id of the control for which the variants should be loaded
		 * @returns {Promise<object>} Promise resolves with an object containing the flex variants for the given control
		 */
		loadAllFLVariants() {
			return Promise.reject(new Error("loadAllFLVariants is not implemented"));
		},

		/**
		 * Load missing UI changes when switching to a variant that has variantDependentControlChangesRemoved: true
		 * @param {object} mPropertyBag Property bag
		 * @param {string} mPropertyBag.reference Flexibility reference
		 * @param {string} mPropertyBag.id Id of the variant for which the content should be loaded
		 * @returns {Promise<object>} Promise resolves with an object containing the flex variant content for the given variant ID
		 */
		loadFlVariantContent() {
			return Promise.reject(new Error("loadFlVariantContent is not implemented"));
		},

		/**
		 * Load all comp variants and their metadata for Manage Views dialog.
		 * @param {object} mPropertyBag Property bag
		 * @param {string} mPropertyBag.reference Flexibility reference
		 * @param {string} mPropertyBag.persistencyKey Persistency key of the control for which the variants should be loaded
		 * @returns {Promise<object>} Promise resolves with an object containing the flex variants for the given control
		 */
		loadAllCompVariants() {
			return Promise.reject(new Error("loadAllCompVariants is not implemented"));
		},

		/**
		 * Load missing content when switching to a variant that has contentRemoved: true.
		 * @param {object} mPropertyBag Property bag
		 * @param {string} mPropertyBag.reference Flexibility reference
		 * @param {string} mPropertyBag.id Id of the variant for which the content should be loaded
		 * @returns {Promise<object>} Promise resolves with an object containing the flex variant content for the given variant ID
		 */
		loadCompVariantContent() {
			return Promise.reject(new Error("loadCompVariantContent is not implemented"));
		}
	};

	return BaseConnector;
});
