/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/util/deepEqual",
	"sap/base/util/isEmptyObject",
	"sap/base/util/merge",
	"sap/base/util/ObjectPath",
	"sap/base/Log",
	"sap/ui/base/ManagedObjectObserver",
	"sap/ui/core/Component",
	"sap/ui/fl/apply/_internal/controlVariants/Utils",
	"sap/ui/fl/apply/_internal/flexState/controlVariants/VariantManagementState",
	"sap/ui/fl/apply/_internal/flexState/controlVariants/VariantManagerApply",
	"sap/ui/fl/Utils",
	"sap/ui/thirdparty/hasher"
], function(
	deepEqual,
	isEmptyObject,
	merge,
	ObjectPath,
	Log,
	ManagedObjectObserver,
	Component,
	VariantUtil,
	VariantManagementState,
	VariantManagerApply,
	Utils,
	hasher
) {
	"use strict";

	const _mVariantIdChangeHandlers = {};
	const _mHashData = {};
	const _mUShellServices = {};

	/**
	 * URL handler utility for <code>sap.ui.fl variants</code> (see {@link sap.ui.fl.variants.VariantManagement})
	 *
	 * @namespace
	 * @alias sap.ui.fl.apply._internal.controlVariants.URLHandler
	 * @since 1.72
	 * @private
	 * @ui5-restricted sap.ui.fl.variants.VariantModel, sap.ui.fl.variants.VariantManager
	 */
	const URLHandler = {};

	function getUShellService(sServiceName) {
		return _mUShellServices[sServiceName];
	}

	function getHashDataForReference(sFlexReference) {
		return _mHashData[sFlexReference];
	}

	/**
	 * Checks if the parsed shell hash contains outdated variant parameters.
	 *
	 * @param {array} aNewHashParameters - Variant URL Parameters
	 * @param {sap.ui.fl.variants.VariantModel} oModel - Variant model
	 *
	 * @returns {object} oIfUpdateIsRequiredWithCurrentVariants
	 * @returns {boolean} oIfUpdateIsRequiredWithCurrentVariants.updateRequired - If update is required
	 * @returns {object} oIfUpdateIsRequiredWithCurrentVariants.currentVariantReferences - Current variant references
	 */
	function getUpdatedURLParameters(aNewHashParameters, oModel) {
		var aAddedVMReferences = [];
		return aNewHashParameters.reduce(function(oResultantParameters, sVariantReference) {
			var sVariantManagementReference = oModel.getVariantManagementReference(sVariantReference).variantManagementReference;

			if (sVariantManagementReference) {
				// check if a URL parameter for this variant management reference was already added
				if (aAddedVMReferences.includes(sVariantManagementReference)) {
					oResultantParameters.updateRequired = true;
					return oResultantParameters;
				}
				aAddedVMReferences.push(sVariantManagementReference);
			}
			// if there exists a variant management reference AND current variant has changed
			if (sVariantManagementReference && oModel.oData[sVariantManagementReference].currentVariant !== sVariantReference) {
				oResultantParameters.updateRequired = true;
				if (oModel.oData[sVariantManagementReference].currentVariant !== oModel.oData[sVariantManagementReference].defaultVariant) {
					// the current variant is not equal to default variant
					// add the updated variant
					oResultantParameters.parameters.push(oModel.oData[sVariantManagementReference].currentVariant);
				}
			} else {
				// when the variant management reference is unknown OR the current variant hasn't changed
				oResultantParameters.parameters.push(sVariantReference);
			}

			return oResultantParameters;
		}, { updateRequired: false, parameters: [] });
	}

	function checkAndUpdateURLParameters(oModel, sHash) {
		const oURLParsingService = getUShellService("URLParsing");
		const oParsedHash = oURLParsingService?.parseShellHash(sHash || hasher.getHash());
		var vRelevantParameters = ObjectPath.get(["params", VariantUtil.VARIANT_TECHNICAL_PARAMETER], oParsedHash);
		// In legacy urls the parameter was present multiple times
		if (Array.isArray(vRelevantParameters) && vRelevantParameters.length === 1) {
			vRelevantParameters = vRelevantParameters[0].split(",");
		}
		if (vRelevantParameters) {
			var oUpdatedParameters = getUpdatedURLParameters(vRelevantParameters, oModel);
			if (oUpdatedParameters.updateRequired) {
				URLHandler.update({
					updateURL: !oModel._bDesignTimeMode, // not required in UI Adaptation mode
					parameters: oUpdatedParameters.parameters,
					updateHashEntry: true,
					flexReference: oModel.sFlexReference,
					appComponent: oModel.oAppComponent
				});
			}
		}
	}

	/**
	 * Navigation filter attached to the ushell ShellNavigationInternal service.
	 * Each time a shell navigation occurs this function is called.
	 *
	 * @param {sap.ui.fl.variants.VariantModel} oModel - Variant Model
	 * @param {string} sNewHash - New hash
	 *
	 * @returns {string} Value that signifies "Continue" navigation in the "ShellNavigationInternal" service of ushell
	 * (see {@link sap.ushell.services.ShellNavigationInternal})
	 *
	 * @private
	 */
	function handleVariantIdChangeInURL(oModel, sNewHash) {
		try {
			const oURLParsingService = getUShellService("URLParsing");
			if (oURLParsingService) {
				checkAndUpdateURLParameters(oModel, sNewHash);
			}
		} catch (oError) {
			Log.error(oError.message);
		}
		const oShellNavigationInternalService = getUShellService("ShellNavigationInternal");
		return oShellNavigationInternalService?.NavigationFilterStatus.Continue;
	}

	/**
	 * Registers navigation filter function for the ushell ShellNavigationInternal service.
	 *
	 * @param {sap.ui.fl.variants.VariantModel} oModel - Variant Model
	 *
	 * @private
	 */
	function registerNavigationFilter(oModel) {
		const oShellNavigationInternalService = getUShellService("ShellNavigationInternal");
		if (!_mVariantIdChangeHandlers[oModel.sFlexReference]) {
			_mVariantIdChangeHandlers[oModel.sFlexReference] = handleVariantIdChangeInURL.bind(null, oModel);
			if (oShellNavigationInternalService) {
				oShellNavigationInternalService.registerNavigationFilter(_mVariantIdChangeHandlers[oModel.sFlexReference]);
			}
		}
	}

	/**
	 * De-registers navigation filter function for the ushell ShellNavigationInternal service.
	 *
	 * @param {sap.ui.fl.variants.VariantModel} oModel - Variant Model
	 *
	 * @private
	 */
	function deRegisterNavigationFilter(oModel) {
		const oShellNavigationInternalService = getUShellService("ShellNavigationInternal");
		if (oShellNavigationInternalService) {
			oShellNavigationInternalService.unregisterNavigationFilter(_mVariantIdChangeHandlers[oModel.sFlexReference]);
			delete _mVariantIdChangeHandlers[oModel.sFlexReference];
		}
	}

	/**
	 * Sets the values for url hash and technical parameters for the component data.
	 * Deactivates hash based navigation while performing the operations, which is then re-activated upon completion.
	 * If the passed doesn't exist in the url hash or technical parameters, then a new object is added respectively.
	 *
	 * @param {object} mPropertyBag - Property bag
	 * @param {string[]} mPropertyBag.parameters - Array of values for the technical parameter
	 * @param {sap.ui.core.Component} mPropertyBag.appComponent - App component
	 * @param {boolean} [mPropertyBag.silent] - <code>true</code> if the technical parameter should be set without triggering event listeners
	 *
	 * @private
	 */
	function setTechnicalURLParameterValues(mPropertyBag) {
		const oURLParsingService = getUShellService("URLParsing");
		const oNavigationService = getUShellService("Navigation");
		const oParsedHash = oURLParsingService?.parseShellHash(hasher.getHash());

		if (oParsedHash?.params) {
			const mOldHashParams = { ...oParsedHash.params };
			const mTechnicalParameters = mPropertyBag.appComponent?.getComponentData?.()?.technicalParameters;
			// if mTechnicalParameters are not available we write a warning and continue updating the hash
			if (!mTechnicalParameters) {
				Log.warning(
					"Component instance not provided, so technical parameters in component data and browser history remain unchanged"
				);
			}
			if (mPropertyBag.parameters.length === 0) {
				delete oParsedHash.params[VariantUtil.VARIANT_TECHNICAL_PARAMETER];
				// Case when ControlVariantsAPI.clearVariantParameterInURL is called with a parameter
				if (mTechnicalParameters) {
					delete mTechnicalParameters[VariantUtil.VARIANT_TECHNICAL_PARAMETER];
				}
			} else {
				oParsedHash.params[VariantUtil.VARIANT_TECHNICAL_PARAMETER] = [mPropertyBag.parameters.toString()];
				// Technical parameters need to be in sync with the URL hash
				if (mTechnicalParameters) {
					mTechnicalParameters[VariantUtil.VARIANT_TECHNICAL_PARAMETER] = [mPropertyBag.parameters.toString()];
				}
			}

			if (mPropertyBag.silent) {
				hasher.changed.active = false; // disable changed signal
				hasher.replaceHash(oURLParsingService.constructShellHash(oParsedHash));
				hasher.changed.active = true; // re-enable changed signal
			} else if (!deepEqual(mOldHashParams, oParsedHash.params)) {
				oNavigationService.navigate({
					target: {
						semanticObject: oParsedHash.semanticObject,
						action: oParsedHash.action,
						context: oParsedHash.contextRaw
					},
					params: oParsedHash.params,
					appSpecificRoute: oParsedHash.appSpecificRoute,
					writeHistory: false
				});
			}
		}
	}

	/**
	 * Returns the index at which the passed variant management reference is present.
	 *
	 * @param {object} mPropertyBag - Property bag
	 * @param {string} mPropertyBag.vmReference - Variant management reference
	 * @param {sap.ui.fl.variants.VariantModel} mPropertyBag.model - Variant management model
	 *
	 * @returns {object} oParametersWithIndex - Return object
	 * @returns {int} oParametersWithIndex.index - The index in the array of variant URL parameters
	 * @returns {undefined | string[]} [oParametersWithIndex.parameters] - array of variant URL parameters or undefined when no shell is present
	 *
	 * @private
	 */
	function getVariantIndexInURL(mPropertyBag) {
		var mReturnObject = { index: -1 };
		var oModel = mPropertyBag.model;

		// if ushell container is not present an empty object is returned
		const oURLParsingService = getUShellService("URLParsing");
		const mURLParameters = oURLParsingService?.parseShellHash(hasher.getHash()).params;

		if (mURLParameters) {
			mReturnObject.parameters = [];
			// in UI Adaptation the URL parameters are empty
			// the current URL parameters are retrieved from the stored hash data
			if (oModel._bDesignTimeMode) {
				mURLParameters[VariantUtil.VARIANT_TECHNICAL_PARAMETER] = URLHandler.getStoredHashParams({
					flexReference: oModel.sFlexReference
				});
			}

			if (Array.isArray(mURLParameters[VariantUtil.VARIANT_TECHNICAL_PARAMETER])) {
				// Support legacy Urls where the parameter was present multiple times
				if (mURLParameters[VariantUtil.VARIANT_TECHNICAL_PARAMETER].length > 1) {
					mURLParameters[VariantUtil.VARIANT_TECHNICAL_PARAMETER] =
						mURLParameters[VariantUtil.VARIANT_TECHNICAL_PARAMETER].map(decodeURIComponent);
				} else if (mURLParameters[VariantUtil.VARIANT_TECHNICAL_PARAMETER].length === 1) {
					// New mode where the parameter is a comma separated list
					const sParam = mURLParameters[VariantUtil.VARIANT_TECHNICAL_PARAMETER][0];
					const sParamDecoded = sParam && decodeURIComponent(sParam);
					mURLParameters[VariantUtil.VARIANT_TECHNICAL_PARAMETER] = sParamDecoded ? sParamDecoded.split(",") : [];
				}

				mURLParameters[VariantUtil.VARIANT_TECHNICAL_PARAMETER].some(function(sParamDecoded, iIndex) {
					if (!isEmptyObject(oModel.getVariant(sParamDecoded, mPropertyBag.vmReference))) {
						mReturnObject.index = iIndex;
						return true;
					}
					return false;
				});
			}
		}
		return merge(
			mReturnObject,
			mURLParameters
			&& mURLParameters[VariantUtil.VARIANT_TECHNICAL_PARAMETER]
			&& { parameters: mURLParameters[VariantUtil.VARIANT_TECHNICAL_PARAMETER] }
		);
	}

	URLHandler.variantTechnicalParameterName = "sap-ui-fl-control-variant-id";

	/**
	 * Initializes hash data for the passed variant model
	 * (see {@link sap.ui.fl.variants.VariantModel}).
	 *
	 * @param {object} mPropertyBag - Property bag
	 * @param {sap.ui.fl.variants.VariantModel} mPropertyBag.model - Variant model
	 *
	 * @private
	 * @ui5-restricted sap.ui.fl.variants.VariantModel
	 */
	URLHandler.initialize = async function(mPropertyBag) {
		if (Utils.getUshellContainer()) {
			await Promise.allSettled(["UserInfo", "URLParsing", "Navigation", "ShellNavigationInternal"]
			.map(async (sServiceName) => {
				try {
					_mUShellServices[sServiceName] = await Utils.getUShellService(sServiceName);
				} catch (vError) {
					Log.error(`Error getting service ${sServiceName} from Unified Shell: ${vError}`);
				}
			}));
		}

		var oModel = mPropertyBag.model;
		// register navigation filters and component creation / destroy observers
		URLHandler.attachHandlers(mPropertyBag);

		// Initialize module-level hash data for this flexReference
		_mHashData[oModel.sFlexReference] = {
			hashParams: [],
			controlPropertyObservers: [],
			variantControlIds: []
		};

		// to trigger checks on parameters
		checkAndUpdateURLParameters(oModel);
	};

	/**
	 * Updates the variant reference in URL at the correct index.
	 *
	 * @param {object} mPropertyBag - Property bag
	 * @param {string} mPropertyBag.vmReference - Variant management reference
	 * @param {string} mPropertyBag.newVReference - Variant reference to be set
	 * @param {sap.ui.fl.variants.VariantModel} mPropertyBag.model - Variant model
	 *
	 * @private
	 * @ui5-restricted sap.ui.fl.variants.VariantModel
	 */
	URLHandler.updateVariantInURL = function(mPropertyBag) {
		// remove parameter for variant management if available
		const mUpdatedParameters = URLHandler.removeURLParameterForVariantManagement(mPropertyBag);

		// standalone mode
		if (!mUpdatedParameters.parameters) {
			return;
		}

		let aParameters = mUpdatedParameters.parameters || [];
		const iIndex = mUpdatedParameters.index;
		const bIsDefaultVariant = mPropertyBag.newVReference === mPropertyBag.model.oData[mPropertyBag.vmReference].defaultVariant;

		// default variant should not be added as parameter to the URL (no parameter => default)
		if (!bIsDefaultVariant) {
			if (iIndex === -1) {
				aParameters = aParameters.concat([mPropertyBag.newVReference]);
			} else {
				// insert variant reference at index, without mutating original parameters
				aParameters = aParameters.slice(0, iIndex).concat([mPropertyBag.newVReference], aParameters.slice(iIndex));
			}
		}
		// update required only when the passed variant is:
		// not a default variant OR default variant where a parameter was removed
		if (!bIsDefaultVariant || iIndex > -1) {
			URLHandler.update({
				parameters: aParameters,
				updateURL: !mPropertyBag.model._bDesignTimeMode,
				updateHashEntry: true,
				flexReference: mPropertyBag.model.sFlexReference,
				appComponent: mPropertyBag.model.oAppComponent
			});
		}
	};

	/**
	 * Removes the variant URL parameter for the passed variant management
	 * and returns the index at which the passed variant management is present.
	 *
	 * @param {object} mPropertyBag - Property bag
	 * @param {string} mPropertyBag.vmReference - Variant management reference
	 * @param {sap.ui.fl.variants.VariantModel} mPropertyBag.model - Variant management model
	 *
	 * @returns {object} Object with two properties: the index of the URL parameter as 'index' and an array of variant URL parameters after the removal as 'parameters'
	 *
	 * @private
	 * @ui5-restricted sap.ui.fl
	 */
	URLHandler.removeURLParameterForVariantManagement = function(mPropertyBag) {
		const mVariantParametersInURL = getVariantIndexInURL(mPropertyBag);
		if (mVariantParametersInURL.index > -1) {
			mVariantParametersInURL.parameters.splice(mVariantParametersInURL.index, 1);
		}
		return mVariantParametersInURL;
	};

	/**
	 * Attaches initial handlers for component lifecycle and persists the loaded variant management.
	 *
	 * @param {object} mPropertyBag - Property bag
	 * @param {string} [mPropertyBag.vmReference] - Variant management reference
	 * @param {sap.ui.fl.variants.VariantModel} mPropertyBag.model - Variant model
	 * @param {boolean} [mPropertyBag.updateURL] - Indicating if <code>updateVariantInURL</code> property is enabled for the passed variant management reference
	 *
	 * @private
	 * @ui5-restricted sap.ui.fl.variants.VariantModel
	 */
	URLHandler.attachHandlers = function(mPropertyBag) {
		async function observerHandler() {
			// variant switch promise needs to be checked, since there might be a pending on-going variants switch
			// which might result in unnecessary data being stored
			await VariantManagementState.waitForAllVariantSwitches(mPropertyBag.model.sFlexReference);
			const oHashData = getHashDataForReference(mPropertyBag.model.sFlexReference);
			oHashData.controlPropertyObservers.forEach(function(oObserver) {
				oObserver.destroy();
			});
			// deregister navigation filter if ushell is available
			deRegisterNavigationFilter(mPropertyBag.model);

			// clean up module-level data for this flex reference
			delete _mHashData[mPropertyBag.model.sFlexReference];

			// this promise is not returned since the component is getting destroyed,
			// which will also destroy the variant model anyway,
			// but this is just to ensure the model is in sync with the variants state (which is persisted)
			mPropertyBag.model.destroy();
			mPropertyBag.model.oComponentDestroyObserver.unobserve(mPropertyBag.model.oAppComponent, { destroy: true });
			mPropertyBag.model.oComponentDestroyObserver.destroy();
		}

		// register navigation filter for custom navigation
		registerNavigationFilter(mPropertyBag.model);

		if (!mPropertyBag.model.oComponentDestroyObserver && mPropertyBag.model.oAppComponent instanceof Component) {
			mPropertyBag.model.oComponentDestroyObserver = new ManagedObjectObserver(observerHandler.bind(null));
			mPropertyBag.model.oComponentDestroyObserver.observe(mPropertyBag.model.oAppComponent, { destroy: true });
		}
	};

	/**
	 * Registers a variant management control for URL handling
	 *
	 * @param {object} mPropertyBag - Property bag
	 * @param {string} mPropertyBag.vmReference - Variant management reference
	 * @param {sap.ui.fl.variants.VariantModel} mPropertyBag.model - Variant model
	 * @param {boolean} mPropertyBag.updateURL - Indicating if <code>updateVariantInURL</code> property is enabled for the passed variant management reference
	 *
	 * @private
	 * @ui5-restricted sap.ui.fl.variants.VariantModel
	 */
	URLHandler.registerControl = function(mPropertyBag) {
		if (mPropertyBag.updateURL) {
			getHashDataForReference(mPropertyBag.model.sFlexReference).variantControlIds.push(mPropertyBag.vmReference);
		}
	};

	/**
	 * Optionally updates the hash data with hash parameters and / or updates the variant URL parameter.
	 *
	 * @param {object} mPropertyBag - Properties for hash update
	 * @param {string[]} mPropertyBag.parameters - Array of variant URL parameter values
	 * @param {string} mPropertyBag.flexReference - Flex reference
	 * @param {sap.ui.core.Component} mPropertyBag.appComponent - App component
	 * @param {boolean} [mPropertyBag.updateURL] - Indicates if URL needs to be updated
	 * @param {boolean} [mPropertyBag.updateHashEntry] - Indicates if hash data should be updated
	 * @param {boolean} [mPropertyBag.silent] - <code>true</code> if the technical parameter should be set without triggering event listeners
	 *
	 * @private
	 * @ui5-restricted sap.ui.fl.variants.VariantModel, sap.ui.fl.variants.VariantManager
	 */
	URLHandler.update = function(mPropertyBag) {
		if (!Array.isArray(mPropertyBag.parameters)) {
			Log.info("Variant URL parameters could not be updated since invalid parameters were received");
			return;
		}
		if (mPropertyBag.updateURL) {
			setTechnicalURLParameterValues(mPropertyBag);
		}
		if (mPropertyBag.updateHashEntry) {
			getHashDataForReference(mPropertyBag.flexReference).hashParams = mPropertyBag.parameters;
		}
	};

	/**
	 * Returns a copy of the current hash parameters for the given flex reference.
	 *
	 * @param {object} mPropertyBag - Property bag
	 * @param {string} mPropertyBag.flexReference - Flex reference
	 *
	 * @returns {array} Array of variant parameter values in the URL
	 *
	 * @private
	 * @ui5-restricted sap.ui.fl.variants.VariantModel, sap.ui.fl.variants.VariantManager
	 */
	URLHandler.getStoredHashParams = function(mPropertyBag) {
		return getHashDataForReference(mPropertyBag.flexReference).hashParams.slice();
	};

	/**
	 * Handles model context change by resetting the respective variant management reference to default.
	 * Also, listens to change in <code>resetOnContextChange</code> property, for attaching and detaching handlers.
	 *
	 * @param {object} mPropertyBag - Property bag
	 * @param {sap.ui.fl.variants.VariantManagement} mPropertyBag.vmControl - Variant management control
	 * @param {sap.ui.fl.variants.VariantModel} mPropertyBag.model - Variant model
	 * @param {sap.ui.core.Component} mPropertyBag.appComponent - App Component
	 * @private
	 * @ui5-restricted sap.ui.fl.variants.VariantModel
	 */
	URLHandler.handleModelContextChange = function(mPropertyBag) {
		var sContextChangeEvent = "modelContextChange";

		function handleContextChange(oEvent, oParams) {
			const sVariantManagementReference = oEvent.getSource().getVariantManagementReference();
			const oHashData = getHashDataForReference(oParams.model.sFlexReference);
			const aVariantManagements = oHashData.variantControlIds;
			// variant management will only exist in the hash data if 'updateInVariantURL' property is set (see attachHandlers())
			const iIndex = aVariantManagements.indexOf(sVariantManagementReference);
			if (iIndex > -1) {
				// all controls which were later initialized need to be reset to default variant
				aVariantManagements.slice(iIndex).forEach((sVariantManagementToBeReset) => {
					const mResult = getVariantIndexInURL({
						vmReference: sVariantManagementToBeReset,
						model: mPropertyBag.model
					});
					// only reset if the variant management reference is NOT present in the URL
					if (mResult.index === -1) {
						const oAffectedVMControl = VariantUtil.getVariantManagementControlByVMReference(
							sVariantManagementToBeReset,
							mPropertyBag.appComponent
						);
						VariantManagerApply.updateCurrentVariant({
							newVariantReference: oAffectedVMControl.getDefaultVariantKey(),
							vmControl: oAffectedVMControl,
							appComponent: mPropertyBag.appComponent
						});
					}
				});
			}
		}

		var oControlPropertyObserver = new ManagedObjectObserver(function(oEvent) {
			if (oEvent.current === true && oEvent.old === false) {
				oEvent.object.attachEvent(sContextChangeEvent, { model: mPropertyBag.model }, handleContextChange);
			} else if (oEvent.current === false && oEvent.old === true) {
				oEvent.object.detachEvent(sContextChangeEvent, handleContextChange);
			}
		});

		oControlPropertyObserver.observe(mPropertyBag.vmControl, { properties: ["resetOnContextChange"] });

		getHashDataForReference(mPropertyBag.model.sFlexReference).controlPropertyObservers.push(oControlPropertyObserver);

		if (mPropertyBag.vmControl.getResetOnContextChange() !== false) {
			mPropertyBag.vmControl.attachEvent(sContextChangeEvent, { model: mPropertyBag.model }, handleContextChange);
		}
	};

	/**
	 * Clears all variant URL parameters.
	 *
	 * @param {object} mPropertyBag - Property bag
	 * @param {string} mPropertyBag.flexReference - Flex reference
	 * @param {sap.ui.core.Component} mPropertyBag.appComponent - App component
	 *
	 * @private
	 * @ui5-restricted sap.ui.fl.variants.VariantModel
	 */
	URLHandler.clearAllVariantURLParameters = function(mPropertyBag) {
		const oURLParsingService = getUShellService("URLParsing");
		const oParsedHash = oURLParsingService?.parseShellHash(hasher.getHash());
		if (oParsedHash?.params?.[VariantUtil.VARIANT_TECHNICAL_PARAMETER]) {
			URLHandler.update({
				updateURL: true,
				parameters: [],
				updateHashEntry: false,
				flexReference: mPropertyBag.flexReference,
				appComponent: mPropertyBag.appComponent
			});
		}
	};

	return URLHandler;
});