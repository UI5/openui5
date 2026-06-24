/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/util/deepEqual",
	"sap/base/util/merge",
	"sap/base/util/ObjectPath",
	"sap/base/Log",
	"sap/ui/base/ManagedObjectObserver",
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
	VariantUtil,
	VariantManagementState,
	VariantManagerApply,
	Utils,
	hasher
) {
	"use strict";

	/**
	 * URL handler for a single variant management control.
	 *
	 * @class
	 * @alias sap.ui.fl.apply._internal.controlVariants.URLHandler
	 * @since 1.149
	 * @private
	 * @ui5-restricted sap.ui.fl.variants.VariantModel, sap.ui.fl.variants.VariantManager
	 */
	class URLHandler {
		#sVMReference;
		#sFlexReference;
		#oAppComponent;
		#oControlPropertyObserver = null;
		#oVMControl = null;
		#fnHandleContextChange = null;
		#bContextChangeAttached = false;
		#fnNavigationFilter = null;
		#bUpdateURL = false;
		#mUShellServices = {};
		#bDesignTimeMode = false;

		/**
		 * @param {object} mPropertyBag - Property bag
		 * @param {string} mPropertyBag.vmReference - Variant management reference this instance handles
		 * @param {string} mPropertyBag.flexReference - Flex reference (component reference)
		 * @param {sap.ui.core.Component} mPropertyBag.appComponent - App component instance
		 */
		constructor(mPropertyBag) {
			this.#sVMReference = mPropertyBag.vmReference;
			this.#sFlexReference = mPropertyBag.flexReference;
			this.#oAppComponent = mPropertyBag.appComponent;
		}

		/**
		 * Initializes the URL handler by resolving UShell services.
		 * @returns {Promise<void>} Promise that resolves when initialization is complete
		 */
		async initialize() {
			await Promise.allSettled(["URLParsing", "Navigation", "ShellNavigationInternal"]
			.map(async (sServiceName) => {
				try {
					this.#mUShellServices[sServiceName] = await Utils.getUShellService(sServiceName);
				} catch (vError) {
					Log.error(`Error getting service ${sServiceName} from Unified Shell: ${vError}`);
				}
			}));
		}

		/**
		 * Destroys the URL handler instance, deregistering the navigation filter and clearing state.
		 */
		destroy() {
			this.#deregisterNavigationFilter();
			this.#oControlPropertyObserver?.destroy();
			if (this.#bContextChangeAttached && this.#oVMControl && !this.#oVMControl.bIsDestroyed) {
				this.#oVMControl.detachEvent("modelContextChange", this.#fnHandleContextChange);
			}
		}

		#registerNavigationFilter() {
			const oShellNavigationInternalService = this.#mUShellServices.ShellNavigationInternal;
			if (oShellNavigationInternalService && !this.#fnNavigationFilter) {
				this.#fnNavigationFilter = this.#handleVariantIdChangeInURL.bind(this);
				oShellNavigationInternalService.registerNavigationFilter(this.#fnNavigationFilter);
			}
		}

		#deregisterNavigationFilter() {
			const oShellNavigationInternalService = this.#mUShellServices.ShellNavigationInternal;
			if (oShellNavigationInternalService && this.#fnNavigationFilter) {
				oShellNavigationInternalService.unregisterNavigationFilter(this.#fnNavigationFilter);
				this.#fnNavigationFilter = null;
			}
		}

		#handleVariantIdChangeInURL(sNewHash) {
			try {
				this.#checkAndUpdateURLParameters(sNewHash);
			} catch (oError) {
				Log.error(oError.message);
			}
			return this.#mUShellServices.ShellNavigationInternal?.NavigationFilterStatus.Continue;
		}

		#checkAndUpdateURLParameters(sHash) {
			const oURLParsingService = this.#mUShellServices.URLParsing;
			const oParsedHash = oURLParsingService?.parseShellHash(sHash || hasher.getHash());
			let vRelevantParameters = oParsedHash?.params?.[VariantUtil.VARIANT_TECHNICAL_PARAMETER];
			if (Array.isArray(vRelevantParameters) && vRelevantParameters.length === 1) {
				vRelevantParameters = vRelevantParameters[0].split(",");
			}
			if (vRelevantParameters) {
				const { updateRequired, parameters } = this.#getUpdatedURLParameters(vRelevantParameters);
				if (updateRequired) {
					this.update({
						updateURL: !this.#bDesignTimeMode,
						parameters
					});
				}
			}
		}

		#getUpdatedURLParameters(aNewHashParameters) {
			return aNewHashParameters.reduce((oResultantParameters, sVariantReference) => {
				const sVariantManagementReference =
					VariantManagementState.getVariantManagementReferenceForVariant(
						this.#sFlexReference, sVariantReference
					);

				// Each URLHandler instance only acts on parameters that belong to its own VM
				// to avoid races between multiple registered navigation filters of different VMs.
				if (sVariantManagementReference !== this.#sVMReference) {
					oResultantParameters.parameters.push(sVariantReference);
					return oResultantParameters;
				}

				const sCurrentVariant = VariantManagementState.getCurrentVariantReference({
					vmReference: sVariantManagementReference,
					reference: this.#sFlexReference
				});

				if (sCurrentVariant !== sVariantReference) {
					oResultantParameters.updateRequired = true;
					const sDefaultVariant = VariantManagementState.getDefaultVariantReference({
						vmReference: sVariantManagementReference,
						reference: this.#sFlexReference
					});
					if (sCurrentVariant !== sDefaultVariant) {
						oResultantParameters.parameters.push(sCurrentVariant);
					}
				} else {
					oResultantParameters.parameters.push(sVariantReference);
				}

				return oResultantParameters;
			}, { updateRequired: false, parameters: [] });
		}

		#getVariantIndexInURL() {
			const mReturnObject = { index: -1 };

			const oURLParsingService = this.#mUShellServices.URLParsing;
			const mURLParameters = oURLParsingService?.parseShellHash(hasher.getHash()).params;

			if (mURLParameters) {
				mReturnObject.parameters = [];

				if (Array.isArray(mURLParameters[VariantUtil.VARIANT_TECHNICAL_PARAMETER])) {
					const aTechnicalParams = mURLParameters[VariantUtil.VARIANT_TECHNICAL_PARAMETER];
					if (aTechnicalParams.length > 1) {
						mURLParameters[VariantUtil.VARIANT_TECHNICAL_PARAMETER] =
							aTechnicalParams.map(decodeURIComponent);
					} else if (aTechnicalParams.length === 1) {
						const sParamDecoded =
							aTechnicalParams[0] && decodeURIComponent(aTechnicalParams[0]);
						mURLParameters[VariantUtil.VARIANT_TECHNICAL_PARAMETER] = sParamDecoded
							? sParamDecoded.split(",") : [];
					}

					mURLParameters[VariantUtil.VARIANT_TECHNICAL_PARAMETER]
					.some((sParamDecoded, iIndex) => {
						if (VariantManagementState.getVariant({
							vmReference: this.#sVMReference,
							vReference: sParamDecoded,
							reference: this.#sFlexReference
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

		#setTechnicalURLParameterValues(mPropertyBag) {
			const oURLParsingService = this.#mUShellServices.URLParsing;
			const oNavigationService = this.#mUShellServices.Navigation;
			const oParsedHash = oURLParsingService?.parseShellHash(hasher.getHash());

			if (oParsedHash?.params) {
				const mOldHashParams = { ...oParsedHash.params };
				const mTechnicalParameters =
					this.#oAppComponent?.getComponentData?.()?.technicalParameters;
				if (!mTechnicalParameters) {
					Log.warning(
						"Component instance not provided, so technical parameters in component data"
						+ " and browser history remain unchanged"
					);
				}
				if (mPropertyBag.parameters.length === 0) {
					delete oParsedHash.params[VariantUtil.VARIANT_TECHNICAL_PARAMETER];
					if (mTechnicalParameters) {
						delete mTechnicalParameters[VariantUtil.VARIANT_TECHNICAL_PARAMETER];
					}
				} else {
					oParsedHash.params[VariantUtil.VARIANT_TECHNICAL_PARAMETER] =
						[mPropertyBag.parameters.toString()];
					if (mTechnicalParameters) {
						mTechnicalParameters[VariantUtil.VARIANT_TECHNICAL_PARAMETER] =
							[mPropertyBag.parameters.toString()];
					}
				}

				if (mPropertyBag.silent) {
					hasher.changed.active = false;
					hasher.replaceHash(oURLParsingService.constructShellHash(oParsedHash));
					hasher.changed.active = true;
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
		 * Marks this instance as participating in URL updates,
		 * registers the navigation filter, and checks current URL parameters.
		 */
		registerControl() {
			this.#bUpdateURL = true;
			this.#registerNavigationFilter();
			this.#checkAndUpdateURLParameters();
		}

		/**
		 * Updates the variant reference in the URL at the correct index.
		 * @param {string} sNewVReference - New variant reference to set in the URL
		 */
		updateVariantInURL(sNewVReference) {
			const { index: iIndex, parameters: aCurrentParameters } =
				this.removeURLParameterForVariantManagement();

			if (!aCurrentParameters) {
				return;
			}

			let aParameters = aCurrentParameters;
			const sDefaultVariant = VariantManagementState.getDefaultVariantReference({
				vmReference: this.#sVMReference,
				reference: this.#sFlexReference
			});
			const bIsDefaultVariant = sNewVReference === sDefaultVariant;

			if (!bIsDefaultVariant) {
				if (iIndex === -1) {
					aParameters = [...aParameters, sNewVReference];
				} else {
					aParameters = [
						...aParameters.slice(0, iIndex), sNewVReference, ...aParameters.slice(iIndex)
					];
				}
			}

			if (!bIsDefaultVariant || iIndex > -1) {
				this.update({
					parameters: aParameters,
					updateURL: !this.#bDesignTimeMode
				});
			}
		}

		/**
		 * Removes the variant URL parameter for this variant management and returns the result
		 * @returns {object} Object containing the index of the removed parameter and the updated parameters array
		 */
		removeURLParameterForVariantManagement() {
			const mVariantParametersInURL = this.#getVariantIndexInURL();
			if (mVariantParametersInURL.index > -1) {
				mVariantParametersInURL.parameters.splice(mVariantParametersInURL.index, 1);
			}
			return mVariantParametersInURL;
		}

		/**
		 * Updates the URL hash.
		 * @param {object} mPropertyBag - Property bag
		 * @param {string[]} mPropertyBag.parameters - Array of variant URL parameter values
		 * @param {boolean} [mPropertyBag.updateURL] - Whether to update the URL
		 * @param {boolean} [mPropertyBag.silent] - Whether to set without triggering event listeners
		 */
		update(mPropertyBag) {
			if (mPropertyBag.updateURL) {
				this.#setTechnicalURLParameterValues({
					parameters: mPropertyBag.parameters,
					silent: mPropertyBag.silent
				});
			}
		}

		/**
		 * Returns the current variant URL parameters from the live hash.
		 *
		 * @returns {string[]} Variant URL parameters
		 */
		getStoredHashParams() {
			const oURLParsingService = this.#mUShellServices.URLParsing;
			const oParsedHash = oURLParsingService?.parseShellHash(hasher.getHash());
			let vParams = oParsedHash?.params?.[VariantUtil.VARIANT_TECHNICAL_PARAMETER];
			if (Array.isArray(vParams) && vParams.length === 1) {
				vParams = vParams[0].split(",");
			}
			return Array.isArray(vParams) ? vParams.slice() : [];
		}

		/**
		 * Clears all variant URL parameters if any are present.
		 */
		clearAllVariantURLParameters() {
			const oURLParsingService = this.#mUShellServices.URLParsing;
			const oParsedHash = oURLParsingService?.parseShellHash(hasher.getHash());
			if (oParsedHash?.params?.[VariantUtil.VARIANT_TECHNICAL_PARAMETER]) {
				this.update({
					updateURL: true,
					parameters: []
				});
			}
		}

		/**
		 * Sets up an observer on the <code>resetOnContextChange</code> property of the given VM control
		 * and attaches/detaches the <code>modelContextChange</code> event handler accordingly.
		 *
		 * @param {sap.ui.fl.variants.VariantManagement} oVMControl - Variant management control
		 */
		handleModelContextChange(oVMControl) {
			if (this.#oControlPropertyObserver) {
				return;
			}
			const sContextChangeEvent = "modelContextChange";

			this.#oVMControl = oVMControl;
			this.#fnHandleContextChange = () => {
				if (!this.#bUpdateURL) {
					return;
				}
				const { index: iIndex } = this.#getVariantIndexInURL();
				if (iIndex === -1) {
					VariantManagerApply.updateCurrentVariant({
						newVariantReference: oVMControl.getDefaultVariantKey(),
						vmControl: oVMControl,
						appComponent: this.#oAppComponent
					});
				}
			};

			this.#oControlPropertyObserver = new ManagedObjectObserver((oEvent) => {
				if (oEvent.current === true && oEvent.old === false) {
					oVMControl.attachEvent(sContextChangeEvent, this.#fnHandleContextChange);
					this.#bContextChangeAttached = true;
				} else if (oEvent.current === false && oEvent.old === true) {
					oVMControl.detachEvent(sContextChangeEvent, this.#fnHandleContextChange);
					this.#bContextChangeAttached = false;
				}
			});

			this.#oControlPropertyObserver.observe(oVMControl, { properties: ["resetOnContextChange"] });

			if (oVMControl.getResetOnContextChange() !== false) {
				oVMControl.attachEvent(sContextChangeEvent, this.#fnHandleContextChange);
				this.#bContextChangeAttached = true;
			}
		}

		/**
		 * Sets or unsets design time mode.
		 * When leaving design time mode, the URL is synced with the current variant from the model state,
		 * so that any variant switches that happened during design time (and were not reflected in the URL)
		 * are now applied.
		 * @param {boolean} bIsDesignTime - <code>true</code> to enable design time mode
		 */
		setDesigntimeMode(bIsDesignTime) {
			const bWasDesignTime = this.#bDesignTimeMode;
			this.#bDesignTimeMode = bIsDesignTime;
			if (bWasDesignTime && !bIsDesignTime && this.#bUpdateURL) {
				const sCurrentVariant = VariantManagementState.getCurrentVariantReference({
					vmReference: this.#sVMReference,
					reference: this.#sFlexReference
				});
				if (sCurrentVariant) {
					this.updateVariantInURL(sCurrentVariant);
				}
			}
		}

		/**
		 * Removes the variant technical parameter from the current URL hash without
		 * triggering a navigation. Does not require a per-VM URLHandler instance.
		 *
		 * @returns {Promise<undefined>} Resolves when the URL has been updated
		 * @private
		 * @ui5-restricted sap.ui.fl
		 */
		static async removeVariantParameterFromURL() {
			const oURLParsingService = await Utils.getUShellService("URLParsing");
			const oParsedHash = oURLParsingService?.parseShellHash(hasher.getHash());
			if (!oParsedHash?.params?.[VariantUtil.VARIANT_TECHNICAL_PARAMETER]) {
				return;
			}
			delete oParsedHash.params[VariantUtil.VARIANT_TECHNICAL_PARAMETER];
			hasher.changed.active = false;
			hasher.replaceHash(oURLParsingService.constructShellHash(oParsedHash));
			hasher.changed.active = true;
		}
	}

	return URLHandler;
});
