/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/util/restricted/_merge",
	"sap/ui/fl/initial/_internal/FlexInfoSession",
	"sap/ui/fl/initial/_internal/storageResultDisassemble",
	"sap/ui/fl/initial/_internal/StorageFeaturesMerger",
	"sap/ui/fl/initial/_internal/StorageResultMerger",
	"sap/ui/fl/initial/_internal/StorageUtils",
	"sap/ui/fl/Layer"
], function(
	_merge,
	FlexInfoSession,
	storageResultDisassemble,
	StorageFeaturesMerger,
	StorageResultMerger,
	StorageUtils,
	Layer
) {
	"use strict";

	/**
	 * Abstraction providing an API to handle communication with persistence like back ends, local & session storage or work spaces.
	 *
	 * @namespace sap.ui.fl.initial._internal.Storage
	 * @since 1.67
	 * @version ${version}
	 * @private
	 * @ui5-restricted sap.ui.fl
	 */

	function loadFlexDataFromConnectors(mPropertyBag, aConnectors) {
		const aConnectorPromises = aConnectors.map(function(oConnectorConfig) {
			const oFlexInfoSession = FlexInfoSession.getByReference(mPropertyBag.reference);
			const oConnectorSpecificPropertyBag = {
				...mPropertyBag,
				url: oConnectorConfig.url,
				path: oConnectorConfig.path
			};

			if (
				!oConnectorConfig.layers
				|| (
					oConnectorConfig.layers[0] !== "ALL"
					&& oConnectorConfig.layers.indexOf(Layer.CUSTOMER) === -1
				)
			) {
				delete oConnectorSpecificPropertyBag.version;
			}
			// a sign that we are either loading RTA mode or are already in the RTA mode
			// and allContexts query parameter should be set for flex/data request
			// and the cacheKey should be removed to disable browser caching
			// and lazy loading of views should be disabled to ensure all variants and their contents are loaded for RTA
			if (oFlexInfoSession.adaptationMode || window.sessionStorage.getItem(`sap.ui.rta.restart.${Layer.CUSTOMER}`)) {
				oConnectorSpecificPropertyBag.allContexts = true;
				delete oConnectorSpecificPropertyBag.cacheKey;
				// todos#18: this property is not set yet because the client cannot handle lazy loading of Comp variant contents.
				// It will be added as soon as the client can handle the full scenario.
				delete oConnectorSpecificPropertyBag.lazyLoadingViewsEnabled;
			}
			return oConnectorConfig.loadConnectorModule.loadFlexData(oConnectorSpecificPropertyBag)
			.then(function(oResponse) {
				// ensure an object with the corresponding properties
				return oResponse || StorageUtils.getEmptyFlexDataResponse();
			})
			.catch(StorageUtils.logAndResolveDefault.bind(
				undefined,
				StorageUtils.getEmptyFlexDataResponse(),
				oConnectorConfig,
				"loadFlexData"
			));
		});

		return Promise.all(aConnectorPromises);
	}

	function flattenResponses(aResponses) {
		var aFlattenedResponses = [];

		aResponses.forEach(function(oResponse) {
			if (Array.isArray(oResponse)) {
				aFlattenedResponses = aFlattenedResponses.concat(oResponse);
			} else {
				aFlattenedResponses.push(oResponse);
			}
		});

		return aFlattenedResponses;
	}

	function disassembleVariantSectionsIfNecessary(aResponses) {
		return aResponses.map(function(oResponse) {
			return storageResultDisassemble(oResponse);
		});
	}

	function flattenAndMergeResultPromise(aResponses) {
		return Promise.resolve(aResponses)
		.then(flattenResponses)
		.then(disassembleVariantSectionsIfNecessary)
		.then(flattenResponses)
		.then(StorageResultMerger.merge);
	}

	function loadFlexDataFromStaticFileConnector(mPropertyBag) {
		return StorageUtils.getStaticFileConnector().then(loadFlexDataFromConnectors.bind(this, mPropertyBag));
	}

	function sendLoadFeaturesToConnector(aConnectors) {
		var aConnectorPromises = aConnectors.map(function(oConnectorConfig) {
			// Tolerance for connectors that do not have loadFeature implemented
			if (!oConnectorConfig?.loadConnectorModule?.loadFeatures) {
				return Promise.resolve(StorageUtils.logAndResolveDefault({
					features: {},
					layers: oConnectorConfig.layers
				}, oConnectorConfig, "loadFeatures"));
			}
			return oConnectorConfig.loadConnectorModule.loadFeatures({ url: oConnectorConfig.url })
			.then(function(oFeatures) {
				return {
					features: oFeatures,
					layers: oConnectorConfig.layers
				};
			})
			.catch(StorageUtils.logAndResolveDefault.bind(null, {
				features: {},
				layers: oConnectorConfig.layers
			}, oConnectorConfig, "loadFeatures"));
		});

		return Promise.all(aConnectorPromises);
	}

	async function loadVariantsAuthorsFromConnectors(sReference, aConnectors) {
		const aResponses = await Promise.all(aConnectors.map(function(oConnectorConfig) {
			// Tolerance for connectors that do not have loadFeature implemented
			if (!oConnectorConfig?.loadConnectorModule?.loadVariantsAuthors) {
				return Promise.resolve(StorageUtils.logAndResolveDefault({}, oConnectorConfig, "loadVariantsAuthors"));
			}
			const oConnectorSpecificPropertyBag = {
				reference: sReference,
				url: oConnectorConfig.url
			};
			return oConnectorConfig.loadConnectorModule.loadVariantsAuthors(oConnectorSpecificPropertyBag)
			.then((oResponse) => oResponse || {})
			.catch(StorageUtils.logAndResolveDefault.bind(
				undefined,
				{},
				oConnectorConfig,
				"loadVariantsAuthors"
			));
		}));
		return _merge({}, ...aResponses);
	}

	var Storage = {};

	/**
	 * Provides the information which features are provided based on the responses of the involved connectors.
	 *
	 * @param {object} oLayerConfig - Layer Configuration for write operations
	 * @returns {Promise<Object>} Map feature flags and additional provided information from the connectors
	 */
	Storage.loadFeatures = async function(oLayerConfig) {
		const oLoadConnectors = await StorageUtils.getLoadConnectors();
		const aResponses = await sendLoadFeaturesToConnector(oLoadConnectors);
		return StorageFeaturesMerger.mergeResults(aResponses, oLayerConfig);
	};

	/**
	 * Provides the flex bundle data for a given application based on the application reference and its version.
	 *
	 * @param {object} mPropertyBag properties needed by the connectors
	 * @param {string} mPropertyBag.reference reference of the application for which the flex data is requested
	 * @param {object} mPropertyBag.partialFlexData contains partial FlexState
	 * @param {string} [mPropertyBag.componentName] componentName of the application which may differ from the reference in case of an app variant
	 * @returns {Promise<object>} Resolves with the responses from all configured connectors merged into one object
	 */
	Storage.completeFlexData = function(mPropertyBag) {
		if (!mPropertyBag || !mPropertyBag.reference) {
			return Promise.reject(new Error("No reference was provided"));
		}

		return Promise.all([loadFlexDataFromStaticFileConnector(mPropertyBag), mPropertyBag.partialFlexData])
		.then(flattenAndMergeResultPromise);
	};

	/**
	 * Provides the flex data for a given application based on the configured connectors, the application reference and its version.
	 *
	 * @param {object} mPropertyBag properties needed by the connectors
	 * @param {string} mPropertyBag.reference reference of the application for which the flex data is requested
	 * @param {string} [mPropertyBag.componentName] componentName of the application which may differ from the reference in case of an app variant
	 * @param {string} [mPropertyBag.cacheKey] cacheKey which can be used to etag / cachebuster the request
	 * @param {number} [mPropertyBag.version] - Number of the version for which the data should be loaded
	 * @param {boolean} [mPropertyBag.allContexts] Includes also restricted context
	 * @param {string} [mPropertyBag.adaptationId] - Context-based adaptation to be loaded
	 * @param {string} [mPropertyBag.skipLoadBundle=false] - If true only the partial flex data is loaded, without the bundle
	 * @returns {Promise<object>} Resolves with the responses from all configured connectors merged into one object
	 */
	Storage.loadFlexData = function(mPropertyBag) {
		if (!mPropertyBag || !mPropertyBag.reference) {
			return Promise.reject(new Error("No reference was provided"));
		}

		return StorageUtils.getLoadConnectors(mPropertyBag.skipLoadBundle)
		.then(loadFlexDataFromConnectors.bind(this, mPropertyBag))
		.then(flattenAndMergeResultPromise);
	};

	/**
	 * Load the names of variants' authors for a given application.
	 *
	 * @param {string} sReference - Flex reference of application
	 * @returns {Promise<object>} Resolving with a list of maps between variant ID and author name
	 */
	Storage.loadVariantsAuthors = function(sReference) {
		if (!sReference) {
			return Promise.reject(new Error("No reference was provided"));
		}
		return StorageUtils.getLoadConnectors()
		.then(loadVariantsAuthorsFromConnectors.bind(this, sReference));
	};

	/**
	 * Loads variant-related data from connectors.
	 *
	 * @param {object} mPropertyBag - Object with the necessary properties
	 * @param {string} sMethodName - Name of the connector method to call (loadFlVariant, loadAllFlVariants, loadFlVariantContent)
	 * @returns {Promise<object>} Resolves with merged variant data
	 */
	async function loadVariantDataFromConnectors(mPropertyBag, sMethodName) {
		const aConnectors = await StorageUtils.getLoadConnectors();
		const aResponses = [];

		for (const oConnectorConfig of aConnectors) {
			if (oConnectorConfig?.loadConnectorModule?.[sMethodName]) {
				const oConnectorSpecificPropertyBag = {
					...mPropertyBag,
					url: oConnectorConfig.url,
					layers: oConnectorConfig.layers
				};
				try {
					const oResponse = await oConnectorConfig.loadConnectorModule[sMethodName](oConnectorSpecificPropertyBag);
					aResponses.push(oResponse || {});
				} catch (oError) {
					aResponses.push({});
				}
			}
		}

		return StorageResultMerger.merge(aResponses);
	}

	/**
	 * Loads a single FL variant with its related changes.
	 *
	 * @param {object} mPropertyBag - Object with the necessary properties
	 * @param {string} mPropertyBag.reference - Flexibility reference
	 * @param {string} mPropertyBag.variantReference - Variant reference to load
	 * @returns {Promise<object>} Resolves with variants, variantChanges, and variantDependentControlChanges
	 */
	Storage.loadFlVariant = function(mPropertyBag) {
		return loadVariantDataFromConnectors(mPropertyBag, "loadFlVariant");
	};

	/**
	 * Loads all FL variants and their metadata changes for a given variant management control.
	 * Used for lazy loading when opening the Manage Views or Save As dialog.
	 *
	 * @param {object} mPropertyBag - Object with the necessary properties
	 * @param {string} mPropertyBag.reference - Flexibility reference
	 * @param {string} mPropertyBag.vmReference - Variant management control reference
	 * @returns {Promise<object>} Resolves with variants, variantChanges, and variantDependentControlChanges
	 */
	Storage.loadAllFlVariants = function(mPropertyBag) {
		return loadVariantDataFromConnectors(mPropertyBag, "loadAllFlVariants");
	};

	/**
	 * Loads the UI changes (variantDependentControlChanges) for a given FL variant.
	 * Used for lazy loading when switching to a variant that has variantContentRemoved: true.
	 *
	 * @param {object} mPropertyBag - Object with the necessary properties
	 * @param {string} mPropertyBag.reference - Flexibility reference
	 * @param {string} mPropertyBag.variantId - Variant ID to load content for
	 * @returns {Promise<object>} Resolves with variants (including referenced), variantChanges, and variantDependentControlChanges
	 */
	Storage.loadFlVariantContent = function(mPropertyBag) {
		return loadVariantDataFromConnectors(mPropertyBag, "loadFlVariantContent");
	};

	/**
	 * Loads all comp variants and their changes for a given persistency key.
	 * Used for lazy loading when opening the Manage Views dialog or saving
	 * a new variant (to avoid duplicate titles).
	 *
	 * @param {object} mPropertyBag - Object with the necessary properties
	 * @param {string} mPropertyBag.reference - Flexibility reference
	 * @param {string} mPropertyBag.persistencyKey - Persistency key of the SVM control
	 * @returns {Promise<object>} Resolves with merged comp variant data in storage response format
	 */
	Storage.loadAllCompVariants = function(mPropertyBag) {
		return loadVariantDataFromConnectors(mPropertyBag, "loadAllCompVariants");
	};

	return Storage;
});
