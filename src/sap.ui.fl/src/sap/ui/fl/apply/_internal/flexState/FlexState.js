/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/util/restricted/_omit",
	"sap/base/util/Deferred",
	"sap/base/util/each",
	"sap/base/util/merge",
	"sap/base/util/ObjectPath",
	"sap/base/Log",
	"sap/ui/core/Component",
	"sap/ui/fl/apply/_internal/flexObjects/FlexObjectFactory",
	"sap/ui/fl/apply/_internal/flexObjects/States",
	"sap/ui/fl/apply/_internal/flexState/changes/DependencyHandler",
	"sap/ui/fl/apply/_internal/flexState/DataSelector",
	"sap/ui/fl/apply/_internal/flexState/InitialPrepareFunctions",
	"sap/ui/fl/initial/_internal/Loader",
	"sap/ui/fl/initial/_internal/ManifestUtils",
	"sap/ui/fl/initial/_internal/FlexInfoSession",
	"sap/ui/fl/initial/_internal/StorageUtils",
	"sap/ui/fl/LayerUtils",
	"sap/ui/fl/apply/_internal/init"
], function(
	_omit,
	Deferred,
	each,
	merge,
	ObjectPath,
	Log,
	Component,
	FlexObjectFactory,
	States,
	DependencyHandler,
	DataSelector,
	InitialPrepareFunctions,
	Loader,
	ManifestUtils,
	FlexInfoSession,
	StorageUtils,
	LayerUtils
) {
	"use strict";

	const sAppDescriptorNamespace = "sap.ui.fl.apply._internal.flexObjects.AppDescriptorChange";
	const sAnnotationNamespace = "sap.ui.fl.apply._internal.flexObjects.AnnotationChange";

	/**
	 * Flex state class to persist maps and raw state (cache) for a given component reference.
	 * The persistence happens inside an object mapped to the component reference, with the following properties:
	 *
	 *	{
	 * 		storageResponse: {
	 * 			changes: {...}, // see Loader.js
	 * 		},
	 * 		runtimePersistence: {
	 * 			flexObjects: [...],
	 * 			runtimeOnlyData: {
	 * 				liveDependencyMap: {...}
	 * 			}
	 * 		},
	 * 		maxLayer: <string>,
	 * 		emptyState: <boolean>,
	 *		skipLoadBundle: <boolean>,
	 *		componentId: "<componentId>",
	 *		componentData: {...}
	 *	}
	 *
	 * @namespace sap.ui.fl.apply._internal.flexState.FlexState
	 * @since 1.73
	 * @version ${version}
	 * @private
	 * @ui5-restricted sap.ui.fl.apply._internal
	 */
	const FlexState = {};

	const _mInstances = {};
	const _mInitPromises = {};
	const _mFlexObjectInfo = {
		appDescriptorChanges: {
			pathInResponse: []
		},
		annotationChanges: {
			pathInResponse: []
		},
		changes: {
			initialPreparationFunctionName: "uiChanges",
			pathInResponse: ["changes"]
		},
		variants: {
			initialPreparationFunctionName: "variants",
			pathInResponse: ["variants", "variantChanges", "variantDependentControlChanges", "variantManagementChanges"]
		},
		comp: {
			pathInResponse: ["comp.changes", "comp.defaultVariants", "comp.standardVariants", "comp.variants"]
		}
	};

	// some runtime data is only fetched once (e.g. during control init) and has to survive an invalidation of the FlexState
	// TODO: Move to runtime persistence as soon as flex objects are no longer deleted during cache invalidation
	// but instead updated with the new data from the flex response
	const _mExternalData = {
		flexObjects: {},
		smartVariantManagementControls: {}
	};

	function prepareChangeDefinitions(sStorageResponseKey, vStorageResponsePart) {
		var fnPreparation = {
			comp() {
				return Object.values(vStorageResponsePart).reduce(function(aChangeDefinitions, oChangeDefinition) {
					return aChangeDefinitions.concat(oChangeDefinition);
				}, []);
			},
			variants() {
				return vStorageResponsePart.map(function(oVariant) {
					var bParentVariantExists = (
						oVariant.variantReference === oVariant.variantManagementReference
						|| vStorageResponsePart.some(function(oOtherVariant) {
							return (
								oOtherVariant.variantManagementReference === oVariant.variantManagementReference
								&& oOtherVariant.fileName === oVariant.variantReference
							);
						})
					);
					// If the parent variant no longer exists, change the reference to the standard variant
					if (!bParentVariantExists) {
						return { ...oVariant, variantReference: oVariant.variantManagementReference };
					}
					return oVariant;
				});
			}
		}[sStorageResponseKey];
		if (fnPreparation) {
			return fnPreparation();
		}
		return Array.isArray(vStorageResponsePart) ? vStorageResponsePart : [];
	}

	function enhancePropertyBag(mPropertyBag) {
		var oComponent = Component.getComponentById(mPropertyBag.componentId);
		mPropertyBag.componentData ||= (oComponent && oComponent.getComponentData()) || {};
		mPropertyBag.manifest ||= mPropertyBag.rawManifest || (oComponent && oComponent.getManifestObject()) || {};
		mPropertyBag.reference ||= ManifestUtils.getFlexReference(mPropertyBag);
	}

	function createFlexObjects(oStorageResponse) {
		var aFlexObjects = [];
		each(oStorageResponse.changes, function(sKey, vValue) {
			prepareChangeDefinitions(sKey, vValue).forEach(function(oChangeDef) {
				aFlexObjects.push(FlexObjectFactory.createFromFileContent(oChangeDef, null, true));
			});
		});
		return aFlexObjects;
	}

	function runInitialPreparation(sMapName, mPropertyBag) {
		var sPreparationFunctionName = _mFlexObjectInfo[sMapName].initialPreparationFunctionName;
		var fnPreparation = InitialPrepareFunctions[sPreparationFunctionName];
		if (fnPreparation) {
			return fnPreparation(mPropertyBag);
		}
		return undefined;
	}

	var oFlexObjectsDataSelector = new DataSelector({
		id: "flexObjects",
		parameterKey: "reference",
		executeFunction(oData, mParameters) {
			if (!_mInstances[mParameters.reference]) {
				return [];
			}
			var oPersistence = _mInstances[mParameters.reference].runtimePersistence;
			return oPersistence.flexObjects.concat(
				oPersistence.runtimeOnlyData.flexObjects || [],
				_mExternalData.flexObjects[mParameters.reference][_mInstances[mParameters.reference].componentId] || []
			);
		}
	});

	const oAppDescriptorChangesDataSelector = new DataSelector({
		id: "appDescriptorChanges",
		parentDataSelector: oFlexObjectsDataSelector,
		executeFunction(aFlexObjects) {
			return aFlexObjects.filter((oFlexObject) => {
				return oFlexObject.isA(sAppDescriptorNamespace);
			});
		},
		checkInvalidation(mParameters, oUpdateInfo) {
			const bRelevantType = ["addFlexObject", "removeFlexObject"].includes(oUpdateInfo.type);
			return bRelevantType && oUpdateInfo.updatedObject?.isA(sAppDescriptorNamespace);
		}
	});

	const oAnnotationChangesDataSelector = new DataSelector({
		id: "annotationChanges",
		parentDataSelector: oFlexObjectsDataSelector,
		executeFunction(aFlexObjects) {
			return aFlexObjects.filter((oFlexObject) => {
				return oFlexObject.isA(sAnnotationNamespace);
			});
		},
		checkInvalidation(mParameters, oUpdateInfo) {
			const bRelevantType = ["addFlexObject", "removeFlexObject"].includes(oUpdateInfo.type);
			return bRelevantType && oUpdateInfo.updatedObject?.isA(sAnnotationNamespace);
		}
	});

	function buildRuntimePersistence(oFlexStateInstance, aExternalFlexObjects) {
		const oStorageResponse = oFlexStateInstance.storageResponse;
		var oRuntimePersistence = {
			flexObjects: createFlexObjects(oStorageResponse),
			runtimeOnlyData: {
				liveDependencyMap: DependencyHandler.createEmptyDependencyMap(),
				flexObjects: []
			}
		};
		if (!oFlexStateInstance.componentId) {
			// the initial preparation needs the component Id to work properly
			// as soon as the FlexState is initialized with the component Id, the state is rebuild and
			// the initial preparation is executed
			return oRuntimePersistence;
		}

		Object.keys(_mFlexObjectInfo).forEach(function(sMapName) {
			var oUpdate = runInitialPreparation(sMapName, {
				storageResponse: oStorageResponse,
				externalData: aExternalFlexObjects,
				flexObjects: oRuntimePersistence.flexObjects,
				componentId: oFlexStateInstance.componentId
			});
			if (oUpdate) {
				oRuntimePersistence = merge(oRuntimePersistence, oUpdate);
			}
		});
		return oRuntimePersistence;
	}

	function updateRuntimePersistence(sReference, oStorageResponse, oRuntimePersistence) {
		const aFlexObjects = oRuntimePersistence.flexObjects.slice();
		const iInitialFlexObjectsLength = aFlexObjects.length;
		const aChangeDefinitions = [];
		let bUpdate;

		each(oStorageResponse.changes, function(sKey, vValue) {
			prepareChangeDefinitions(sKey, vValue).forEach(function(oChangeDef) {
				aChangeDefinitions.push(oChangeDef);
			});
		});

		_mInstances[sReference].runtimePersistence = {
			...oRuntimePersistence,
			flexObjects: aChangeDefinitions.map(function(oChangeDef) {
				let iObjectIndex;
				// Only keep FlexObjects found in the storage change definitions
				const oExistingFlexObject = aFlexObjects.find(function(oFlexObject, iIndex) {
					iObjectIndex = iIndex;
					return oFlexObject.getId() === oChangeDef.fileName;
				});
				if (oExistingFlexObject) {
					aFlexObjects.splice(iObjectIndex, 1);
					// Only update FlexObjects which were modified (new, updated)
					if (oExistingFlexObject.getState() !== States.LifecycleState.PERSISTED) {
						oExistingFlexObject.setResponse(oChangeDef);
						bUpdate = true;
					}
					return oExistingFlexObject;
				}

				// The backend creates new changes in some scenarios (e.g. context filtering of FlVariants),
				// which are not known to the runtimePersistence before
				if (
					oChangeDef.fileType === "ctrl_variant_change"
					&& oChangeDef.fileName.endsWith("flVariant_contextFiltering_setVisible")
				) {
					return FlexObjectFactory.createFromFileContent(oChangeDef, null, true);
				}

				// If unknown change definitions are found, throw error (storage does not create flex objects)
				const sErrorText = "Error updating runtime persistence: storage returned unknown flex objects";
				Log.error(sErrorText);
				throw new Error(sErrorText);
			})
		};

		// If the final length is different, an object is no longer there (e.g. new version requested)
		if (iInitialFlexObjectsLength !== _mInstances[sReference].runtimePersistence.flexObjects.length) {
			bUpdate = true;
		}

		return bUpdate;
	}

	function initializeNewInstance(mPropertyBag, oFlexData) {
		var sReference = mPropertyBag.reference;
		var bDataUpdated = false;
		if (!_mInstances[sReference].componentData && mPropertyBag.componentId) {
			var oComponent = Component.getComponentById(mPropertyBag.componentId);
			_mInstances[sReference].componentData = oComponent ? oComponent.getComponentData() : mPropertyBag.componentData;
			bDataUpdated = true;
		}
		if (!_mInstances[sReference].storageResponse) {
			_mInstances[sReference].storageResponse = filterByMaxLayer(sReference, oFlexData);
			// Flex objects need to be recreated
			delete _mInstances[sReference].runtimePersistence;
			bDataUpdated = true;
		}

		if (!ObjectPath.get(["flexObjects", sReference, mPropertyBag.componentId], _mExternalData)) {
			ObjectPath.set(["flexObjects", sReference, mPropertyBag.componentId], [], _mExternalData);
		}

		if (!_mInstances[sReference].runtimePersistence) {
			_mInstances[sReference].runtimePersistence = buildRuntimePersistence(
				_mInstances[sReference],
				_mExternalData.flexObjects[sReference][mPropertyBag.componentId] || []
			);
			bDataUpdated = true;
		}

		if (bDataUpdated) {
			oFlexObjectsDataSelector.checkUpdate({ reference: sReference });
		}
	}

	function filterByMaxLayer(sReference, mResponse) {
		const mFilteredReturn = merge({}, mResponse);
		mFilteredReturn.changes = { ...StorageUtils.getEmptyFlexDataResponse(), ...mFilteredReturn.changes };
		const mFlexObjects = mFilteredReturn.changes;
		const oFlexInfoSession = FlexInfoSession.getByReference(sReference);
		if (LayerUtils.isLayerFilteringRequired(sReference)) {
			each(_mFlexObjectInfo, function(iIndex, mFlexObjectInfo) {
				mFlexObjectInfo.pathInResponse.forEach(function(sPath) {
					const aFilterByMaxLayer = ObjectPath.get(sPath, mFlexObjects).filter(function(oChangeDefinition) {
						return !oChangeDefinition.layer || !LayerUtils.isOverLayer(oChangeDefinition.layer, oFlexInfoSession.maxLayer);
					});
					ObjectPath.set(sPath, aFilterByMaxLayer, mFlexObjects);
				});
			});
		}
		_mInstances[sReference].maxLayer = oFlexInfoSession.maxLayer;
		return mFilteredReturn;
	}

	function prepareNewInstance(mPropertyBag, sLoaderCacheKey) {
		// The following line is used by the Flex Support Tool to set breakpoints - please adjust the tool if you change it!
		_mInstances[mPropertyBag.reference] = merge({}, {
			componentId: mPropertyBag.componentId,
			componentData: mPropertyBag.componentData,
			skipLoadBundle: mPropertyBag.skipLoadBundle,
			loaderCacheKey: sLoaderCacheKey
		});
	}

	function checkComponentIdChanged(mInitProperties) {
		var sFlexInstanceComponentId = _mInstances[mInitProperties.reference].componentId;
		// if the component with the same reference was rendered with a new ID - clear existing state
		return sFlexInstanceComponentId !== mInitProperties.componentId;
	}

	function rebuildResponseIfMaxLayerChanged(sReference, oFlexData) {
		if (_mInstances[sReference]?.maxLayer !== FlexInfoSession.getByReference(sReference).maxLayer) {
			FlexState.rebuildFilteredResponse(sReference, oFlexData);
		}
	}

	function initializeEmptyStateIfNeeded(sReference, sComponentId) {
		if (!sComponentId) {
			throw new Error(`No FlexState instance created for reference ${sReference} - missing component ID`);
		}

		// State already initialized for the component ID
		if (_mInstances[sReference]?.componentId === sComponentId) {
			return;
		}

		_mInstances[sReference] = {
			emptyState: true,
			// this makes sure that a proper initialize will still work as expected
			reInitialize: true,
			componentId: sComponentId
		};
		const oNewInitPromise = new Deferred();
		_mInitPromises[sReference] = oNewInitPromise;
		oNewInitPromise.resolve();
		const oEmptyResponse = Loader.initializeEmptyCache(sReference);
		initializeNewInstance({ reference: sReference }, oEmptyResponse);
	}

	FlexState.getRuntimeOnlyData = function(sReference) {
		return _mInstances[sReference]?.runtimePersistence?.runtimeOnlyData;
	};

	FlexState.addFlexObjectsToRuntimeOnlyData = function(sReference, sComponentId, aFlexObjects) {
		initializeEmptyStateIfNeeded(sReference, sComponentId);
		_mInstances[sReference].runtimePersistence.runtimeOnlyData.flexObjects.push(...aFlexObjects);
	};

	/**
	 * Initializes the FlexState for a given reference. A request for the flex data is sent to the Loader and the response is saved.
	 * The FlexState can only be initialized once, every subsequent init call will just resolve as soon as it is initialized.
	 *
	 * @param {object} mPropertyBag - Contains additional data needed for reading and storing changes
	 * @param {string} mPropertyBag.componentId - ID of the component
	 * @param {string} [mPropertyBag.reference] - Flex reference of the app
	 * @param {object} [mPropertyBag.manifest] - Manifest that belongs to current component
	 * @param {object} [mPropertyBag.rawManifest] - Raw JSON manifest that belongs to current component
	 * @param {string} [mPropertyBag.componentData] - Component data of the current component
	 * @param {object} [mPropertyBag.asyncHints] - Async hints passed from the app index to the component processing
	 * @param {boolean} [mPropertyBag.skipLoadBundle=false] - If true state is initialized partially and does not include flex bundles
	 * @returns {Promise<undefined>} Resolves a promise as soon as FlexState is initialized
	 */
	FlexState.initialize = async function(mPropertyBag) {
		const mProperties = merge({}, mPropertyBag);
		enhancePropertyBag(mProperties);
		const sFlexReference = mProperties.reference;

		// TODO: Probably obsolete, as the init call is awaited in the Loader
		const oOldInitPromise = _mInitPromises[sFlexReference];
		const oNewInitPromise = new Deferred();
		_mInitPromises[sFlexReference] = oNewInitPromise;

		if (oOldInitPromise) {
			await oOldInitPromise.promise;
		}

		const oLoaderData = await Loader.getFlexData(mProperties);
		if (
			!_mInstances[mProperties.reference]?.storageResponse
			|| oLoaderData.parameters.loaderCacheKey !== _mInstances[mProperties.reference].loaderCacheKey
			|| checkComponentIdChanged(mProperties)
		) {
			prepareNewInstance(mProperties, oLoaderData.parameters.loaderCacheKey);
		} else {
			rebuildResponseIfMaxLayerChanged(mProperties.reference, oLoaderData.data);
		}

		initializeNewInstance(mProperties, oLoaderData.data);
		oNewInitPromise.resolve();
	};

	/**
	 * Waits until the FlexState is initialized
	 * This is only necessary if <code>FlexState.initialize</code> cannot be called directly
	 * due to missing information for the backend request (e.g. asyncHints)
	 *
	 * @param {string} sFlexReference - Flex reference of the app
	 * @returns {Promise<undefined>} Promise that resolves as soon as FlexState is initialized
	 */
	FlexState.waitForInitialization = function(sFlexReference) {
		const oInitPromise = _mInitPromises[sFlexReference]?.promise;
		if (!oInitPromise) {
			Log.error("FlexState.waitForInitialization was called before FlexState.initialize");
			return Promise.resolve();
		}
		return oInitPromise;
	};

	/**
	 * Checks whether flex state of an associated reference or a control has been initialized or not
	 *
	 * @param {object} mPropertyBag - Contains additional data needed for reading and storing changes
	 * @param {object} [mPropertyBag.control] - ID of the control
	 * @param {string} [mPropertyBag.reference] - Flex reference of the app
	 * @returns {boolean} <code>true</code> in case flex state has been initialized
	 */
	FlexState.isInitialized = function(mPropertyBag) {
		var sReference = mPropertyBag.reference ? mPropertyBag.reference : ManifestUtils.getFlexReferenceForControl(mPropertyBag.control);
		return !!_mInstances[sReference];
	};

	/**
	 * Lazy loads the flex variant for a specific reference and adds it to the runtime persistence
	 *
	 * @param {object} mPropertyBag - Contains additional data needed for reading and storing changes
	 * @param {string} mPropertyBag.reference - Flex reference of the app
	 * @param {string} mPropertyBag.componentId - ID of the component
	 * @param {string} mPropertyBag.variantReference - The reference of the variant to load.
	 */
	FlexState.lazyLoadFlVariant = async function(mPropertyBag) {
		initializeEmptyStateIfNeeded(mPropertyBag.reference, mPropertyBag.componentId);
		const oResult = await Loader.loadFlVariant(mPropertyBag);
		const oInstance = _mInstances[mPropertyBag.reference];
		oInstance.loaderCacheKey = oResult.completeLoaderData.parameters.loaderCacheKey;
		oInstance.storageResponse = filterByMaxLayer(mPropertyBag.reference, oResult.completeLoaderData.data);
		oInstance.runtimePersistence.flexObjects =
		[
			...oInstance.runtimePersistence.flexObjects,
			...createFlexObjects(filterByMaxLayer(mPropertyBag.reference, { changes: oResult.newData }))
		];
		oFlexObjectsDataSelector.checkUpdate({ reference: mPropertyBag.reference });
	};

	/**
	 * Triggers a call to the backend to fetch new data and update the runtime persistence
	 *
	 * @param {object} mPropertyBag - Contains additional data needed for reading and storing changes
	 * @param {string} mPropertyBag.componentId - ID of the component
	 * @param {string} [mPropertyBag.reference] - Flex reference of the app
	 * @param {object} [mPropertyBag.manifest] - Manifest that belongs to actual component
	 * @param {string} [mPropertyBag.componentData] - Component data of the current component
	 * @returns {Promise<undefined>} Resolves when the data is loaded and the runtime persistence is updated
	 */
	FlexState.reinitialize = async function(mPropertyBag) {
		enhancePropertyBag(mPropertyBag);
		const sReference = mPropertyBag.reference;

		const oOldInitPromise = _mInitPromises[sReference];
		const oNewInitPromise = new Deferred();
		_mInitPromises[sReference] = oNewInitPromise;

		if (oOldInitPromise) {
			await oOldInitPromise.promise;
		}

		mPropertyBag.reInitialize = true;
		const oResponse = await Loader.getFlexData(mPropertyBag);

		if (!_mInstances[sReference]) {
			prepareNewInstance(mPropertyBag, oResponse.parameters.loaderCacheKey);
			initializeNewInstance(mPropertyBag, oResponse.data);
		} else {
			const oCurrentRuntimePersistence = _mInstances[sReference].runtimePersistence;
			prepareNewInstance(mPropertyBag, oResponse.parameters.loaderCacheKey);
			_mInstances[sReference].storageResponse = filterByMaxLayer(sReference, oResponse.data);
			const bUpdated = updateRuntimePersistence(
				sReference,
				_mInstances[sReference].storageResponse,
				oCurrentRuntimePersistence
			);
			if (bUpdated) {
				oFlexObjectsDataSelector.checkUpdate({ reference: sReference });
			}
		}
		oNewInitPromise.resolve();
	};

	/**
	 * Some save operations don't require a complete new data request, so the storage response gets a live update.
	 * This will also update the runtime persistence.
	 *
	 * @param {string} sReference - Flex reference of the app
	 * @param {object[]} aUpdates - All new FlexObjects in JSON format
	 */
	FlexState.update = function(sReference, aUpdates) {
		const aFlexObjectUpdates = [];
		StorageUtils.updateStorageResponse(_mInstances[sReference].storageResponse, aUpdates);
		const sNewLoaderCacheKey = Loader.updateCachedResponse(sReference, aUpdates);
		_mInstances[sReference].loaderCacheKey = sNewLoaderCacheKey;
		aUpdates.forEach((oUpdate) => {
			if (oUpdate.type !== "ui2") {
				// In some scenarios the runtime persistence is already updated
				const iExistingFlexObjectIndex = _mInstances[sReference].runtimePersistence.flexObjects.findIndex(
					(oFlexObject) => oFlexObject.getId() === oUpdate.flexObject.fileName
				);
				const oExistingFlexObject = _mInstances[sReference].runtimePersistence.flexObjects[iExistingFlexObjectIndex];
				switch (oUpdate.type) {
					case "add":
						if (iExistingFlexObjectIndex < 0) {
							throw new Error("Flex response includes unknown flex object");
						}
						break;
					case "delete":
						if (iExistingFlexObjectIndex >= 0) {
							_mInstances[sReference].runtimePersistence.flexObjects.splice(iExistingFlexObjectIndex, 1);
							aFlexObjectUpdates.push({ type: "removeFlexObject", updatedObject: oExistingFlexObject });
						}
						break;
					case "update":
						if (oExistingFlexObject && oExistingFlexObject.getState() !== States.LifecycleState.PERSISTED) {
							oExistingFlexObject.setResponse(oUpdate.flexObject);
							aFlexObjectUpdates.push({ type: "updateFlexObject", updatedObject: oExistingFlexObject });
						}
						break;
					default:
				}
			}
		});
		if (aFlexObjectUpdates.length) {
			oFlexObjectsDataSelector.checkUpdate({ reference: sReference }, aFlexObjectUpdates);
		}
	};

	FlexState.clearState = function(sReference) {
		Loader.clearCache(sReference);
		if (sReference) {
			delete _mInstances[sReference];
			delete _mInitPromises[sReference];
			oFlexObjectsDataSelector.clearCachedResult({ reference: sReference });
		} else {
			Object.keys(_mInstances).forEach((sReference) => delete _mInstances[sReference]);
			Object.keys(_mInitPromises).forEach((sReference) => delete _mInitPromises[sReference]);
			oFlexObjectsDataSelector.clearCachedResult();
		}
	};

	/**
	 * Adds a runtime-steady object to the external data map which survives when the FlexState is cleared.
	 * For example: a fake standard variant.
	 * Fake standard variant refers to a variant that was not created based on file content returned from the backend.
	 * If the flex response contains no variants that inherited from the standard variant, it is impossible
	 * to know its ID without access to the related variant management control. Thus the standard variant cannot
	 * be created during initialization but has to be added by the VariantManagement control via this method.
	 * @param {string} sReference - Flex reference of the app
	 * @param {string} sComponentId - ID of the component
	 * @param {object} oFlexObject - Flex object to be added as runtime-steady
	 */
	FlexState.addRuntimeSteadyObject = function(sReference, sComponentId, oFlexObject) {
		initializeEmptyStateIfNeeded(sReference, sComponentId);
		// with setting the state to persisted it is made sure that they not show up as a dirty flex object
		oFlexObject.setState(States.LifecycleState.PERSISTED);
		_mExternalData.flexObjects[sReference] ||= {};
		_mExternalData.flexObjects[sReference][sComponentId] ||= [];
		_mExternalData.flexObjects[sReference][sComponentId].push(oFlexObject);
		oFlexObjectsDataSelector.checkUpdate(
			{ reference: sReference },
			[{ type: "addFlexObject", updatedObject: oFlexObject }]
		);
	};

	/**
	 * Clears the runtime-steady objects of the given component.
	 *
	 * @param {string} sReference - Flex reference of the app
	 * @param {string} sComponentId - ID of the component
	 */
	FlexState.clearRuntimeSteadyObjects = function(sReference, sComponentId) {
		// External data is currently only used to store the standard variant
		if (_mExternalData.flexObjects[sReference]) {
			delete _mExternalData.flexObjects[sReference][sComponentId];
			// Only called during destruction, no need to recalculate new state immediately
			oFlexObjectsDataSelector.clearCachedResult({ reference: sReference });
		}
	};

	/**
	 * Recreates the saved filtered storage response and runtime persistence
	 * and removes the internal maps for the given reference.
	 *
	 * @param {string} sReference - Flex reference of the app
	 * @param {object} oFlexData - Flex data to be used for rebuilding the response
	 */
	FlexState.rebuildFilteredResponse = function(sReference, oFlexData) {
		if (_mInstances[sReference]) {
			_mInstances[sReference].storageResponse = filterByMaxLayer(sReference, oFlexData);
			// Storage response has changed, recreate the flex objects
			_mInstances[sReference].runtimePersistence = buildRuntimePersistence(
				_mInstances[sReference],
				_mExternalData.flexObjects[sReference][_mInstances[sReference].componentId] || []
			);
			oFlexObjectsDataSelector.checkUpdate({ reference: sReference });
		}
	};

	/**
	 * Adds a list of dirty flex objects to the flex state.
	 *
	 * @param {string} sReference - Flexibility reference of the app
	 * @param {Array<sap.ui.fl.apply._internal.flexObjects.FlexObject>} aFlexObjects - Flex objects
	 * @param {string} [sComponentId] - ID of the component, required if an empty state needs to be initialized
	 * @returns {sap.ui.fl.apply._internal.flexObjects.FlexObject[]} The flex objects that were added
	 */
	FlexState.addDirtyFlexObjects = function(sReference, aFlexObjects, sComponentId) {
		// TODO: Check why sComponentId is optional here todos#13
		if (sComponentId) {
			initializeEmptyStateIfNeeded(sReference, sComponentId);
		}
		const sAdaptationLayer = FlexInfoSession.getByReference(sReference).adaptationLayer;
		const aFilteredFlexObjects = aFlexObjects
		.filter((oFlexObject) => !sAdaptationLayer || !LayerUtils.isOverLayer(oFlexObject.getLayer(), sAdaptationLayer))
		.filter((oFlexObject) => (
			!_mInstances[sReference].runtimePersistence.flexObjects
			.some((oExistingFlexObject) => (oExistingFlexObject.getId() === oFlexObject.getId()))
		));

		if (aFilteredFlexObjects.length > 0) {
			_mInstances[sReference].runtimePersistence.flexObjects =
				_mInstances[sReference].runtimePersistence.flexObjects.concat(aFilteredFlexObjects);
			oFlexObjectsDataSelector.checkUpdate(
				{ reference: sReference },
				aFilteredFlexObjects.map(function(oFlexObject) {
					return { type: "addFlexObject", updatedObject: oFlexObject };
				})
			);
		}

		return aFilteredFlexObjects;
	};

	FlexState.removeDirtyFlexObjects = function(sReference, aFlexObjects) {
		const aRemovedFlexObjects = [];
		if (aFlexObjects.length > 0) {
			const aCurrentFlexObjects = _mInstances[sReference].runtimePersistence.flexObjects;
			aFlexObjects.forEach(function(oFlexObject) {
				const iIndex = aCurrentFlexObjects.indexOf(oFlexObject);
				if (iIndex >= 0) {
					aRemovedFlexObjects.push(oFlexObject);
					aCurrentFlexObjects.splice(iIndex, 1);
				}
			});
			if (aRemovedFlexObjects.length > 0) {
				oFlexObjectsDataSelector.checkUpdate(
					{ reference: sReference },
					aFlexObjects.map(function(oFlexObject) {
						return { type: "removeFlexObject", updatedObject: oFlexObject };
					})
				);
			}
		}
		return aRemovedFlexObjects;
	};

	FlexState.getComponentIdForReference = function(sReference) {
		return _mInstances[sReference]?.componentId;
	};

	FlexState.getFlexObjectsDataSelector = function() {
		return oFlexObjectsDataSelector;
	};

	FlexState.getAppDescriptorChanges = function(sReference) {
		return oAppDescriptorChangesDataSelector.get({ reference: sReference });
	};

	FlexState.getAnnotationChanges = function(sReference) {
		return oAnnotationChangesDataSelector.get({ reference: sReference });
	};

	FlexState.getUI2Personalization = function(sReference) {
		return merge({}, _mInstances[sReference].storageResponse.changes.ui2personalization);
	};

	FlexState.callPrepareFunction = function(sMapName, mPropertyBag) {
		return _mFlexObjectInfo[sMapName].prepareFunction(mPropertyBag);
	};

	// TODO: used by the CompVariantState to mutate the storage response, this has to be changed
	FlexState.getStorageResponse = async function(sReference) {
		if (_mInitPromises[sReference]) {
			await _mInitPromises[sReference].promise;
			return Loader.getCachedFlexData(sReference).data;
		}
		return undefined;
	};

	FlexState.getComponentData = function(sReference) {
		return _mInstances[sReference] && _mInstances[sReference].componentData;
	};

	FlexState.addSVMControl = function(sReference, oControl) {
		_mExternalData.smartVariantManagementControls[sReference] ||= [];
		_mExternalData.smartVariantManagementControls[sReference].push(oControl);
	};

	FlexState.getSVMControls = function(sReference) {
		return _mExternalData.smartVariantManagementControls[sReference] || [];
	};

	return FlexState;
});
