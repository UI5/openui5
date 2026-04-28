/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/util/deepEqual",
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
	const mComponentDestroyObservers = {};
	// RTA activation is per app, thus safe to store as a module-level singleton
	let bIsDesignTimeMode = false;

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
	 * @param {string} sFlexReference - Flex reference
	 *
	 * @returns {object} oIfUpdateIsRequiredWithCurrentVariants
	 * @returns {boolean} oIfUpdateIsRequiredWithCurrentVariants.updateRequired - If update is required
	 * @returns {object} oIfUpdateIsRequiredWithCurrentVariants.currentVariantReferences - Current variant references
	 */
	function getUpdatedURLParameters(aNewHashParameters, sFlexReference) {
		const aAddedVMReferences = [];
		return aNewHashParameters.reduce(function(oResultantParameters, sVariantReference) {
			const sVariantManagementReference = VariantManagementState.getVariantManagementReferenceForVariant(
				sFlexReference, sVariantReference
			);

			if (sVariantManagementReference) {
				// check if a URL parameter for this variant management reference was already added
				if (aAddedVMReferences.includes(sVariantManagementReference)) {
					oResultantParameters.updateRequired = true;
					return oResultantParameters;
				}
				aAddedVMReferences.push(sVariantManagementReference);

				const sCurrentVariant = VariantManagementState.getCurrentVariantReference({
					vmReference: sVariantManagementReference,
					reference: sFlexReference
				});

				// if current variant has changed
				if (sCurrentVariant !== sVariantReference) {
					oResultantParameters.updateRequired = true;
					const sDefaultVariant = VariantManagementState.getDefaultVariantReference({
						vmReference: sVariantManagementReference,
						reference: sFlexReference
					});
					if (sCurrentVariant !== sDefaultVariant) {
						// the current variant is not equal to default variant
						// add the updated variant
						oResultantParameters.parameters.push(sCurrentVariant);
					}
				} else {
					oResultantParameters.parameters.push(sVariantReference);
				}
			} else {
				// when the variant management reference is unknown
				oResultantParameters.parameters.push(sVariantReference);
			}

			return oResultantParameters;
		}, { updateRequired: false, parameters: [] });
	}

	function checkAndUpdateURLParameters(sFlexReference, oAppComponent, sHash) {
		const oURLParsingService = getUShellService("URLParsing");
		const oParsedHash = oURLParsingService?.parseShellHash(sHash || hasher.getHash());
		let vRelevantParameters = ObjectPath.get(["params", VariantUtil.VARIANT_TECHNICAL_PARAMETER], oParsedHash);
		// In legacy urls the parameter was present multiple times
		if (Array.isArray(vRelevantParameters) && vRelevantParameters.length === 1) {
			vRelevantParameters = vRelevantParameters[0].split(",");
		}
		if (vRelevantParameters) {
			const oUpdatedParameters = getUpdatedURLParameters(vRelevantParameters, sFlexReference);
			if (oUpdatedParameters.updateRequired) {
				URLHandler.update({
					updateURL: !bIsDesignTimeMode, // not required in UI Adaptation mode
					parameters: oUpdatedParameters.parameters,
					updateHashEntry: true,
					flexReference: sFlexReference,
					appComponent: oAppComponent
				});
			}
		}
	}

	/**
	 * Navigation filter attached to the ushell ShellNavigationInternal service.
	 * Each time a shell navigation occurs this function is called.
	 *
	 * @param {string} sFlexReference - Flex reference
	 * @param {sap.ui.core.Component} oAppComponent - App Component
	 * @param {string} sNewHash - New hash
	 *
	 * @returns {string} Value that signifies "Continue" navigation in the "ShellNavigationInternal" service of ushell
	 * (see {@link sap.ushell.services.ShellNavigationInternal})
	 *
	 * @private
	 */
	function handleVariantIdChangeInURL(sFlexReference, oAppComponent, sNewHash) {
		try {
			const oURLParsingService = getUShellService("URLParsing");
			if (oURLParsingService) {
				checkAndUpdateURLParameters(sFlexReference, oAppComponent, sNewHash);
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
	 * @param {string} sFlexReference - Flex reference
	 * @param {sap.ui.core.Component} oAppComponent - App Component
	 *
	 * @private
	 */
	function registerNavigationFilter(sFlexReference, oAppComponent) {
		const oShellNavigationInternalService = getUShellService("ShellNavigationInternal");
		if (!_mVariantIdChangeHandlers[sFlexReference]) {
			_mVariantIdChangeHandlers[sFlexReference] = handleVariantIdChangeInURL.bind(null, sFlexReference, oAppComponent);
			if (oShellNavigationInternalService) {
				oShellNavigationInternalService.registerNavigationFilter(_mVariantIdChangeHandlers[sFlexReference]);
			}
		}
	}

	/**
	 * De-registers navigation filter function for the ushell ShellNavigationInternal service.
	 *
	 * @param {string} sFlexReference - Flex reference
	 *
	 * @private
	 */
	function deRegisterNavigationFilter(sFlexReference) {
		const oShellNavigationInternalService = getUShellService("ShellNavigationInternal");
		if (oShellNavigationInternalService) {
			oShellNavigationInternalService.unregisterNavigationFilter(_mVariantIdChangeHandlers[sFlexReference]);
			delete _mVariantIdChangeHandlers[sFlexReference];
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
	 * @param {string} mPropertyBag.flexReference - Flex reference
	 *
	 * @returns {object} oParametersWithIndex - Return object
	 * @returns {int} oParametersWithIndex.index - The index in the array of variant URL parameters
	 * @returns {undefined | string[]} [oParametersWithIndex.parameters] - array of variant URL parameters or undefined when no shell is present
	 *
	 * @private
	 */
	function getVariantIndexInURL(mPropertyBag) {
		const mReturnObject = { index: -1 };

		// if ushell container is not present an empty object is returned
		const oURLParsingService = getUShellService("URLParsing");
		const mURLParameters = oURLParsingService?.parseShellHash(hasher.getHash()).params;

		if (mURLParameters) {
			mReturnObject.parameters = [];
			// in UI Adaptation the URL parameters are empty
			// the current URL parameters are retrieved from the stored hash data
			if (bIsDesignTimeMode) {
				mURLParameters[VariantUtil.VARIANT_TECHNICAL_PARAMETER] = URLHandler.getStoredHashParams({
					flexReference: mPropertyBag.flexReference
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
					if (VariantManagementState.getVariant({
						vmReference: mPropertyBag.vmReference,
						vReference: sParamDecoded,
						reference: mPropertyBag.flexReference
					})) {
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
	 * Initializes hash data for the passed component.
	 *
	 * @param {object} mPropertyBag - Property bag
	 * @param {string} mPropertyBag.flexReference - Flex reference
	 * @param {sap.ui.core.Component} mPropertyBag.appComponent - App component
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

		// register navigation filters and component creation / destroy observers
		URLHandler.attachHandlers(mPropertyBag);

		// Initialize module-level hash data for this flexReference
		_mHashData[mPropertyBag.flexReference] = {
			hashParams: [],
			controlPropertyObservers: [],
			variantControlIds: []
		};

		// to trigger checks on parameters
		checkAndUpdateURLParameters(mPropertyBag.flexReference, mPropertyBag.appComponent);
	};

	/**
	 * Updates the variant reference in URL at the correct index.
	 *
	 * @param {object} mPropertyBag - Property bag
	 * @param {string} mPropertyBag.vmReference - Variant management reference
	 * @param {string} mPropertyBag.newVReference - Variant reference to be set
	 * @param {string} mPropertyBag.flexReference - Flex reference
	 * @param {sap.ui.core.Component} mPropertyBag.appComponent - App component
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
		const sDefaultVariant = VariantManagementState.getDefaultVariantReference({
			vmReference: mPropertyBag.vmReference,
			reference: mPropertyBag.flexReference
		});
		const bIsDefaultVariant = mPropertyBag.newVReference === sDefaultVariant;

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
				updateURL: !bIsDesignTimeMode,
				updateHashEntry: true,
				flexReference: mPropertyBag.flexReference,
				appComponent: mPropertyBag.appComponent
			});
		}
	};

	/**
	 * Removes the variant URL parameter for the passed variant management
	 * and returns the index at which the passed variant management is present.
	 *
	 * @param {object} mPropertyBag - Property bag
	 * @param {string} mPropertyBag.vmReference - Variant management reference
	 * @param {string} mPropertyBag.flexReference - Flex reference
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
	 * @param {string} mPropertyBag.flexReference - Flex reference
	 * @param {sap.ui.core.Component} mPropertyBag.appComponent - App component
	 * @param {boolean} [mPropertyBag.updateURL] - Indicating if <code>updateVariantInURL</code> property is enabled for the passed variant management reference
	 *
	 * @private
	 * @ui5-restricted sap.ui.fl.variants.VariantModel
	 */
	URLHandler.attachHandlers = function(mPropertyBag) {
		async function observerHandler() {
			// variant switch promise needs to be checked, since there might be a pending on-going variants switch
			// which might result in unnecessary data being stored
			await VariantManagementState.waitForAllVariantSwitches(mPropertyBag.flexReference);
			const oHashData = getHashDataForReference(mPropertyBag.flexReference);
			oHashData.controlPropertyObservers.forEach(function(oObserver) {
				oObserver.destroy();
			});
			// deregister navigation filter if ushell is available
			deRegisterNavigationFilter(mPropertyBag.flexReference);

			// clean up module-level data for this flex reference
			delete _mHashData[mPropertyBag.flexReference];

			// The component does not automatically destroy programmatically set models.
			// The variant model must be explicitly destroyed to reset variant state.
			const oVariantModel = mPropertyBag.appComponent.getModel("$FlexVariants");
			if (oVariantModel) {
				oVariantModel.destroy();
			}

			const oObserver = mComponentDestroyObservers[mPropertyBag.flexReference];
			if (oObserver) {
				oObserver.unobserve(mPropertyBag.appComponent, { destroy: true });
				oObserver.destroy();
				delete mComponentDestroyObservers[mPropertyBag.flexReference];
			}
		}

		// register navigation filter for custom navigation
		registerNavigationFilter(mPropertyBag.flexReference, mPropertyBag.appComponent);

		if (!mComponentDestroyObservers[mPropertyBag.flexReference] && mPropertyBag.appComponent instanceof Component) {
			const oComponentDestroyObserver = new ManagedObjectObserver(observerHandler);
			oComponentDestroyObserver.observe(mPropertyBag.appComponent, { destroy: true });
			mComponentDestroyObservers[mPropertyBag.flexReference] = oComponentDestroyObserver;
		}
	};

	/**
	 * Registers a variant management control for URL handling
	 *
	 * @param {object} mPropertyBag - Property bag
	 * @param {string} mPropertyBag.vmReference - Variant management reference
	 * @param {string} mPropertyBag.flexReference - Flex reference
	 * @param {boolean} mPropertyBag.updateURL - Indicating if <code>updateVariantInURL</code> property is enabled for the passed variant management reference
	 *
	 * @private
	 * @ui5-restricted sap.ui.fl.variants.VariantModel
	 */
	URLHandler.registerControl = function(mPropertyBag) {
		if (mPropertyBag.updateURL) {
			getHashDataForReference(mPropertyBag.flexReference).variantControlIds.push(mPropertyBag.vmReference);
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
	 * @param {sap.ui.core.Component} mPropertyBag.appComponent - App Component
	 * @param {string} mPropertyBag.flexReference - Flex reference
	 * @private
	 * @ui5-restricted sap.ui.fl.variants.VariantModel
	 */
	URLHandler.handleModelContextChange = function(mPropertyBag) {
		const sContextChangeEvent = "modelContextChange";

		function handleContextChange(oEvent, oParams) {
			const sVariantManagementReference = oEvent.getSource().getVariantManagementReference();
			const oHashData = getHashDataForReference(oParams.flexReference);
			const aVariantManagements = oHashData.variantControlIds;
			// variant management will only exist in the hash data if 'updateInVariantURL' property is set (see attachHandlers())
			const iIndex = aVariantManagements.indexOf(sVariantManagementReference);
			if (iIndex > -1) {
				// all controls which were later initialized need to be reset to default variant
				aVariantManagements.slice(iIndex).forEach((sVariantManagementToBeReset) => {
					const mResult = getVariantIndexInURL({
						vmReference: sVariantManagementToBeReset,
						flexReference: mPropertyBag.flexReference
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

		const oControlPropertyObserver = new ManagedObjectObserver(function(oEvent) {
			if (oEvent.current === true && oEvent.old === false) {
				oEvent.object.attachEvent(
					sContextChangeEvent,
					{ flexReference: mPropertyBag.flexReference },
					handleContextChange
				);
			} else if (oEvent.current === false && oEvent.old === true) {
				oEvent.object.detachEvent(sContextChangeEvent, handleContextChange);
			}
		});

		oControlPropertyObserver.observe(mPropertyBag.vmControl, { properties: ["resetOnContextChange"] });

		getHashDataForReference(mPropertyBag.flexReference).controlPropertyObservers.push(oControlPropertyObserver);

		if (mPropertyBag.vmControl.getResetOnContextChange() !== false) {
			mPropertyBag.vmControl.attachEvent(
				sContextChangeEvent,
				{ flexReference: mPropertyBag.flexReference },
				handleContextChange
			);
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

	/**
	 * Sets the design time mode for the URL Handler, which is used to determine whether the URL should be updated or not
	 * and where to retrieve the current variant URL parameters from.
	 *
	 * @param {boolean} bIsDesignTime - <code>true</code> if the URL Handler should be in design time mode, <code>false</code> otherwise
	 * @private
	 * @ui5-restricted sap.ui.fl.designtime
	 */
	URLHandler.setDesigntimeMode = function(bIsDesignTime) {
		bIsDesignTimeMode = bIsDesignTime;
	};

	/**
	 * Resets all module-level state. For testing purposes only.
	 *
	 * @private
	 * @ui5-restricted sap.ui.fl tests
	 */
	URLHandler._reset = function() {
		Object.keys(_mVariantIdChangeHandlers).forEach((sKey) => { delete _mVariantIdChangeHandlers[sKey]; });
		Object.keys(_mHashData).forEach((sKey) => { delete _mHashData[sKey]; });
		Object.keys(_mUShellServices).forEach((sKey) => { delete _mUShellServices[sKey]; });
		Object.keys(mComponentDestroyObservers).forEach((sKey) => {
			mComponentDestroyObservers[sKey].destroy();
			delete mComponentDestroyObservers[sKey];
		});
		bIsDesignTimeMode = false;
	};

	return URLHandler;
});
