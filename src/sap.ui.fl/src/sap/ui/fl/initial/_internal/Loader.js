/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/util/merge",
	"sap/base/util/ObjectPath",
	"sap/ui/base/ManagedObject",
	"sap/ui/fl/initial/_internal/FlexInfoSession",
	"sap/ui/fl/initial/_internal/ManifestUtils",
	"sap/ui/fl/initial/_internal/Settings",
	"sap/ui/fl/initial/_internal/Storage",
	"sap/ui/fl/initial/_internal/StorageUtils"
], function(
	merge,
	ObjectPath,
	ManagedObject,
	FlexInfoSession,
	ManifestUtils,
	Settings,
	Storage,
	StorageUtils
) {
	"use strict";

	const _mCachedFlexData = {};

	/**
	 * Class for loading Flex Data from the backend via the Connectors.
	 *
	 * @namespace sap.ui.fl.apply._internal.flexState.Loader
	 * @since 1.74
	 * @version ${version}
	 * @private
	 * @ui5-restricted sap.ui.fl.apply._internal.flexState
	 */
	const Loader = {};

	function getIdIsLocalTrueObject(vSelector) {
		if (typeof vSelector === "string") {
			vSelector = {id: vSelector};
		}
		vSelector.idIsLocal = true;

		return vSelector;
	}

	function migrateOVPSelectorFlags(oManifest, mFlexData) {
		if (ManifestUtils.getOvpEntry(oManifest)) {
			[
				mFlexData.changes,
				mFlexData.variantChanges,
				mFlexData.variantDependentControlChanges,
				mFlexData.variantManagementChanges
			]
			.flat()
			.filter((oFlexObject) => (
				oFlexObject.selector
				&& !oFlexObject.selector.idIsLocal
			))
			.forEach(function(oFlexObject) {
				oFlexObject.selector = getIdIsLocalTrueObject(oFlexObject.selector);

				if (oFlexObject.dependentSelector) {
					Object.keys(oFlexObject.dependentSelector).forEach((sCategory) => {
						const vDependentSelector = oFlexObject.dependentSelector[sCategory];
						if (Array.isArray(vDependentSelector)) {
							oFlexObject.dependentSelector[sCategory] = vDependentSelector.map(getIdIsLocalTrueObject);
						} else {
							oFlexObject.dependentSelector[sCategory] = getIdIsLocalTrueObject(vDependentSelector);
						}
					});
				}
			});
		}

		return mFlexData;
	}

	function filterInvalidFileNames(mFlexData) {
		StorageUtils.getAllFlexObjectNamespaces().forEach(function(vKey) {
			const aFlexItems = ObjectPath.get(vKey, mFlexData);
			if (aFlexItems) {
				ObjectPath.set(vKey, aFlexItems.filter((oFlexItem) => {
					let oTemporaryInstance;
					try {
						oTemporaryInstance = new ManagedObject(oFlexItem.fileName);
					} catch (error) {
						return false;
					}
					oTemporaryInstance.destroy();
					return true;
				}), mFlexData);
			}
		});
		return mFlexData;
	}

	function getSideId(oComponentData) {
		if (oComponentData?.startupParameters && Array.isArray(oComponentData.startupParameters.hcpApplicationId)) {
			return oComponentData.startupParameters.hcpApplicationId[0];
		}
	}

	/**
	 * Removes the changes that should be deactivated and the deactivate changes from the Flex Data.
	 * This is the equivalent of deleting changes from the backend.
	 * Example Scenario: When creating an annotation rename change, any control based rename changes should be removed.
	 * But Developer changes can't be deleted from the backend, so they are deactivated.
	 *
	 * @param {object} mFlexData - Flex Data as returned from the Storage
	 * @returns {object} Flex Data without the deactivate and deactivated changes
	 */
	function applyDeactivateChanges(mFlexData) {
		const sDeactivateChangeType = "deactivateChanges";
		const aToBeDeactivatedIds = mFlexData.changes.map((oChange) => {
			if (oChange.changeType === sDeactivateChangeType) {
				return [oChange.fileName, ...oChange.content.changeIds];
			}
		})
		.flat()
		.filter(Boolean);

		// Filter all changes that should be deactivated (also already includes the id of the deactivate changes)
		if (aToBeDeactivatedIds.length) {
			StorageUtils.getAllFlexObjectNamespaces().forEach(function(vKey) {
				const aFlexItems = ObjectPath.get(vKey, mFlexData);
				if (aFlexItems.length) {
					ObjectPath.set(vKey, aFlexItems.filter((oFlexItem) => !aToBeDeactivatedIds.includes(oFlexItem.fileName)), mFlexData);
				}
			});
		}
		return mFlexData;
	}

	/**
	 * Provides the flex data for a given application based on the configured connectors.
	 * This function needs a manifest object, async hints and either an ID to an instantiated component or component data as parameter.
	 * The fetched data is cached statically in the Loader class. Together with the data, all parameters that have been used
	 * for the request are cached as well. If the function is called again with the same parameters,
	 * the cached data is returned instead of a new request to the backend.
	 *
	 * @param {object} mPropertyBag - Contains additional data needed for loading changes
	 * @param {object} mPropertyBag.manifest - ManifestObject that belongs to current component
	 * @param {string} mPropertyBag.reference - Flex Reference
	 * @param {object} mPropertyBag.componentData - Component data of the current component
	 * @param {boolean} [mPropertyBag.reInitialize] - Flag if the application is reinitialized even if it was loaded before
	 * @param {object} [mPropertyBag.asyncHints] - Async hints passed from the app index to the component processing
	 * @param {boolean} [mPropertyBag.skipLoadBundle=false] - If true only the partial flex data is loaded, without the bundle
	 * @returns {Promise<object>} Resolves with the change file for the given component from the Storage
	 */
	Loader.getFlexData = async function(mPropertyBag) {
		// the FlexInfoSession is used to adjust the parameters of the request
		let oFlexInfoSession = FlexInfoSession.getByReference(mPropertyBag.reference);
		const mPropertyBagCopy = merge({}, mPropertyBag, {
			version: oFlexInfoSession.version,
			adaptationId: oFlexInfoSession.displayedAdaptationId,
			allContextsProvided: oFlexInfoSession.allContextsProvided
		});
		const sReference = mPropertyBagCopy.reference;

		const bRequiresNewLoadRequest =
			mPropertyBag.reInitialize
			|| !_mCachedFlexData[mPropertyBag.reference]
			|| _mCachedFlexData[sReference].parameters.emptyState
			|| _mCachedFlexData[sReference].parameters.version !== mPropertyBagCopy.version
			|| _mCachedFlexData[sReference].parameters.allContextsProvided !== mPropertyBagCopy.allContextsProvided
			|| _mCachedFlexData[sReference].parameters.adaptationId !== mPropertyBagCopy.adaptationId;

		const bRequiresOnlyCompletion =
			_mCachedFlexData[sReference]
			&& !_mCachedFlexData[sReference].parameters.emptyState
			&& _mCachedFlexData[sReference].parameters.bundleNotLoaded
			&& !mPropertyBagCopy.skipLoadBundle;

		if (!bRequiresNewLoadRequest && !bRequiresOnlyCompletion) {
			return {
				data: _mCachedFlexData[sReference].data,
				cacheInvalidated: false
			};
		}

		let oFlexData;
		const sComponentName = ManifestUtils.getBaseComponentNameFromManifest(mPropertyBagCopy.manifest);
		if (bRequiresNewLoadRequest) {
			// the cache key cannot be used in case of a reinitialization
			const sCacheKey = mPropertyBagCopy.reInitialize
				? undefined
				: ManifestUtils.getCacheKeyFromAsyncHints(sReference, mPropertyBagCopy.asyncHints);

			oFlexData = await Storage.loadFlexData({
				preview: ManifestUtils.getPreviewSectionFromAsyncHints(mPropertyBagCopy.asyncHints),
				reference: sReference,
				componentName: sComponentName,
				cacheKey: sCacheKey,
				siteId: getSideId(mPropertyBagCopy.componentData),
				appDescriptor: mPropertyBagCopy.manifest.getRawJson ? mPropertyBagCopy.manifest.getRawJson() : mPropertyBagCopy.manifest,
				version: mPropertyBagCopy.version,
				adaptationId: mPropertyBagCopy.adaptationId,
				skipLoadBundle: mPropertyBagCopy.skipLoadBundle
			});
			oFlexData.authors = await Loader.loadVariantsAuthors(sReference);
		} else {
			oFlexData = await Storage.completeFlexData({
				reference: sReference,
				componentName: sComponentName,
				partialFlexData: _mCachedFlexData[sReference].data.changes
			});
		}

		const oFlexDataCopy = Object.assign({}, oFlexData);
		applyDeactivateChanges(oFlexDataCopy);
		filterInvalidFileNames(oFlexDataCopy);
		migrateOVPSelectorFlags(mPropertyBagCopy.manifest, oFlexDataCopy);

		const oFormattedFlexData = {
			changes: oFlexDataCopy,
			cacheKey: oFlexDataCopy.cacheKey
		};

		_mCachedFlexData[sReference] = {
			data: oFormattedFlexData,
			parameters: {
				bundleNotLoaded: !!mPropertyBagCopy.skipLoadBundle,
				version: mPropertyBagCopy.version,
				allContextsProvided: mPropertyBagCopy.allContexts,
				adaptationId: mPropertyBagCopy.adaptationId
			}
		};

		if (oFormattedFlexData.changes.info !== undefined) {
			oFlexInfoSession = { ...oFlexInfoSession, ...oFormattedFlexData.changes.info };
		}
		FlexInfoSession.setByReference(oFlexInfoSession, sReference);

		return {
			data: oFormattedFlexData,
			cacheInvalidated: true
		};
	};

	/**
	 * Initializes an empty cache for a specific reference.
	 *
	 * @param {string} sReference - The flex reference for which to initialize the cache.
	 * @returns {object} The empty Flex Data object
	 */
	Loader.initializeEmptyCache = function(sReference) {
		const oInitialFlexData = { changes: StorageUtils.getEmptyFlexDataResponse() };
		_mCachedFlexData[sReference] = {
			data: oInitialFlexData,
			parameters: {
				bundleNotLoaded: true,
				emptyState: true
			}
		};
		return oInitialFlexData;
	};

	/**
	 * Clears the cache for a specific reference or for all references if no reference is provided.
	 * Should only be used in tests.
	 *
	 * @param {string} [sReference] - The flex reference for which to clear the cache.
	 */
	Loader.clearCache = function(sReference) {
		if (sReference) {
			delete _mCachedFlexData[sReference];
		} else {
			Object.keys(_mCachedFlexData).forEach((sReference) => {
				delete _mCachedFlexData[sReference];
			});
		}
	};

	/**
	 * Loads a FlVariant and updates the cached flex data.
	 *
	 * @param {object} mPropertyBag - The property bag containing the variant reference and other parameters.
	 * @param {string} mPropertyBag.variantReference - The reference of the variant to load.
	 * @param {string} mPropertyBag.reference - The flex reference of the application.
	 * @returns {Promise<object>} Resolves with the loaded variant data.
	 */
	Loader.loadFlVariant = async function(mPropertyBag) {
		const oNewData = await Storage.loadFlVariant({
			variantReference: mPropertyBag.variantReference,
			reference: mPropertyBag.reference
		});
		Object.entries(oNewData).forEach(([sKey, vValue]) => {
			_mCachedFlexData[mPropertyBag.reference].data.changes[sKey].push(...vValue);
		});
		return {
			newData: oNewData,
			completeData: _mCachedFlexData[mPropertyBag.reference].data
		};
	};

	/**
	 * Updates the storage response for a specific reference.
	 *
	 * @param {string} sReference - The flex reference for which to update the storage response.
	 * @param {object[]} aUpdates - The updates to apply to the storage response.
	 */
	Loader.updateCachedResponse = function(sReference, aUpdates) {
		StorageUtils.updateStorageResponse(_mCachedFlexData[sReference].data, aUpdates);
	};

	/**
	 * Retrieves the cached flexibility data for a specific reference.
	 *
	 * @param {string} sReference - The flex reference for which to retrieve the cached data.
	 * @returns {object} The cached flexibility data or an empty object if not found.
	 */
	Loader.getCachedFlexData = function(sReference) {
		// TODO return copy of the data once the CompVariantManager does not mutate it anymore
		return _mCachedFlexData[sReference]?.data || {};
	};

	/**
	 * Load the names of variants' authors for a given application.
	 *
	 * @param {string} sReference - Flex reference of application
	 * @returns {Promise<object>} Resolving with a list of maps between user's ID and name
	 */
	Loader.loadVariantsAuthors = function(sReference) {
		// the settings are available due to previous loadFlexData calls or
		// not available due to an async hint stating that no changes are available, thus also no author mapping needed
		const oSettings = Settings.getInstanceOrUndef();
		return oSettings?.getIsVariantAuthorNameAvailable() ? Storage.loadVariantsAuthors(sReference) : Promise.resolve({});
	};

	/**
	 * This function is temporary and will be removed once the allContextsProvided property is part of the flex/data requests in ABAP
	 * The allContextsProvided property is not part of the initial flex/data request and needs to be set later to prevent
	 * FlexState from being reinitialized
	 *
	 * @param {string} sReference - Flexibility reference of the app
	 * @param {boolean} bAllContextsProvided - Flag to indicate if all contexts are provided
	 */
	Loader.setAllContextsProvided = function(sReference, bAllContextsProvided) {
		if (_mCachedFlexData[sReference] && _mCachedFlexData[sReference].parameters.allContextsProvided === undefined) {
			_mCachedFlexData[sReference].parameters.allContextsProvided = bAllContextsProvided;
		}
	};

	return Loader;
});
