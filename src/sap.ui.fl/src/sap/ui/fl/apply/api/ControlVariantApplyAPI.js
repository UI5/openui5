/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/Log",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/core/Component",
	"sap/ui/core/Element",
	"sap/ui/fl/apply/_internal/controlVariants/URLHandler",
	"sap/ui/fl/apply/_internal/controlVariants/Utils",
	"sap/ui/fl/apply/_internal/flexState/controlVariants/VariantManagementState",
	"sap/ui/fl/apply/_internal/flexState/FlexObjectState",
	"sap/ui/fl/initial/_internal/ManifestUtils",
	"sap/ui/fl/Utils",
	"sap/ui/fl/apply/_internal/init"
], function(
	Log,
	JsControlTreeModifier,
	Component,
	Element,
	URLHandler,
	VariantUtil,
	VariantManagementState,
	FlexObjectState,
	ManifestUtils,
	Utils
) {
	"use strict";

	var VARIANT_MODEL_NAME = "$FlexVariants";

	// The API methods can be called before the model is set on the component
	function waitForVariantModel(oAppComponent) {
		var oVariantModel = oAppComponent.getModel(VARIANT_MODEL_NAME);
		if (oVariantModel) {
			return Promise.resolve(oVariantModel);
		}
		return new Promise(function(resolve) {
			function onModelContextChange() {
				oVariantModel = oAppComponent.getModel(VARIANT_MODEL_NAME);
				if (oVariantModel) {
					oAppComponent.detachModelContextChange(onModelContextChange);
					resolve(oVariantModel);
				}
			}
			oAppComponent.attachModelContextChange(onModelContextChange);
		});
	}

	function handleInitialLoadScenario(sVMReference, oVariantManagementControl, sFlexReference) {
		const aVariantChangesForVariant = VariantManagementState.getVariantChangesForVariant({
			vmReference: sVMReference,
			reference: sFlexReference
		});

		const sDefaultVariantReference = VariantManagementState.getDefaultVariantReference({
			vmReference: sVMReference,
			reference: sFlexReference
		});

		if (
			oVariantManagementControl.getExecuteOnSelectionForStandardDefault()
			&& sDefaultVariantReference === sVMReference
			&& !aVariantChangesForVariant.some((oVariantChange) => oVariantChange.getChangeType() === "setExecuteOnSelect")
		) {
			const oStandardVariant = VariantManagementState.getVariant({
				vmReference: sVMReference,
				reference: sFlexReference,
				vReference: sVMReference
			});
			// set executeOnSelect without creating a change
			oStandardVariant.instance.setExecuteOnSelection(true);
			VariantManagementState.updateVariant({
				reference: sFlexReference,
				variant: oStandardVariant.instance
			});
			return true;
		}
		return false;
	}

	function waitForInitialVariantChanges(mPropertyBag) {
		const aCurrentVariantChanges = VariantManagementState.getInitialUIChanges({
			vmReference: mPropertyBag.vmReference,
			reference: mPropertyBag.reference
		});
		const aSelectors = aCurrentVariantChanges.reduce((aCurrentControls, oChange) => {
			const oSelector = oChange.getSelector();
			const oControl = JsControlTreeModifier.bySelector(oSelector, mPropertyBag.appComponent);
			if (oControl && Utils.indexOfObject(aCurrentControls, { selector: oControl }) === -1) {
				aCurrentControls.push({ selector: oControl });
			}
			return aCurrentControls;
		}, []);
		return aSelectors.length ? FlexObjectState.waitForFlexObjectsToBeApplied(aSelectors) : Promise.resolve();
	}

	function waitForControlToBeRendered(oControl) {
		return new Promise((resolve) => {
			if (oControl.getDomRef()) {
				resolve();
			} else {
				oControl.addEventDelegate({
					onAfterRendering() {
						resolve();
					}
				});
			}
		});
	}

	/**
	 * Provides an API for applications to work with control variants. See also {@link sap.ui.fl.variants.VariantManagement}.
	 *
	 * @namespace sap.ui.fl.apply.api.ControlVariantApplyAPI
	 * @since 1.67
	 * @public
	 */
	var ControlVariantApplyAPI = /** @lends sap.ui.fl.apply.api.ControlVariantApplyAPI */{
		/**
		 * Returns the name of the Variant Model
		 *
		 * @returns {string} Name of the Variant Model
		 *
		 * @private
		 * @ui5-restricted sap.ui.fl, sap.ui.rta
		 */
		getVariantModelName() {
			return VARIANT_MODEL_NAME;
		},

		/**
		 * Returns a promise that resolves to the variant model once it is available
		 *
		 * @param {sap.ui.core.Component} oAppComponent - Application component
		 * @returns {Promise} Promise resolving to the Variant Model
		 *
		 * @private
		 * @ui5-restricted sap.ui.fl, sap.ui.rta
		 */
		getVariantModel(oAppComponent) {
			return waitForVariantModel(oAppComponent);
		},

		/**
		 * Returns the variant management control instance for a variant management reference.
		 *
		 * @param {string} sVariantManagementReference - Reference to the variant management control
		 * @param {sap.ui.core.Component} oAppComponent - Application component
		 * @returns {sap.ui.fl.variants.VariantManagement} The variant management control instance
		 */
		getVariantManagementControlByVMReference(sVariantManagementReference, oAppComponent) {
			const sVMControlId = oAppComponent.byId(sVariantManagementReference)
				? oAppComponent.createId(sVariantManagementReference)
				: sVariantManagementReference;
			return Element.getElementById(sVMControlId);
		},

		/**
		 * Clears URL technical parameter <code>sap-ui-fl-control-variant-id</code> for control variants.
		 * Use this method in case you normally want the variant parameter in the URL,
		 * but have a few special navigation patterns where you want to clear it.
		 * If you don't want that parameter in general, set the <code>updateVariantInURL</code> parameter
		 * on your variant management control to <code>false</code>. SAP Fiori elements use this method.
		 * If a variant management control is given as a parameter, only parameters specific to that control are cleared.
		 *
		 * @param {object} mPropertyBag - Object with parameters as properties
		 * @param {sap.ui.base.ManagedObject} mPropertyBag.control - Variant management control for which the URL technical parameter has to be cleared
		 *
		 * @public
		 */
		clearVariantParameterInURL(mPropertyBag) {
			var aUpdatedVariantParameters;
			var oAppComponent = Utils.getAppComponentForControl(mPropertyBag.control);
			var oVariantModel = oAppComponent && oAppComponent.getModel(VARIANT_MODEL_NAME);
			if (!oVariantModel) {
				// technical parameters are not updated, only URL hash is updated
				Log.error("Variant model could not be found on the provided control");
				return;
			}

			// check if variant for the passed variant management control is present
			if (mPropertyBag.control.isA("sap.ui.fl.variants.VariantManagement")) {
				var sVariantManagementReference = oVariantModel.getLocalId(mPropertyBag.control.getId(), oAppComponent);
				var mCleansedParametersWithIndex = URLHandler.removeURLParameterForVariantManagement({
					model: oVariantModel,
					vmReference: sVariantManagementReference
				});
				aUpdatedVariantParameters = mCleansedParametersWithIndex.parameters;
			}

			// both technical parameters and URL hash updated
			URLHandler.update({
				parameters: aUpdatedVariantParameters || [],
				updateURL: true,
				updateHashEntry: !!oVariantModel,
				model: oVariantModel || {},
				silent: !oVariantModel
			});
		},

		/**
		 * Activates the passed variant applicable to the passed control/component. The corresponding variant management control must be
		 * available when this function is called.
		 * If the variant is not found and the backend supports lazy loading, a backend request is made to fetch the variant.
		 * If the flag standardVariant is set to true, the standard variant is activated and the variantReference is ignored: in this
		 * scenario, the passed element must be the variant management control.
		 *
		 * @param {object} mPropertyBag - Object with parameters as properties
		 * @param {sap.ui.base.ManagedObject|string} mPropertyBag.element - Component or control (instance or ID) on which the <code>variantModel</code> is set
		 * @param {string} mPropertyBag.variantReference - Reference to the variant that needs to be activated
		 * @param {boolean} [mPropertyBag.standardVariant] - If set to true, the standard variant is activated and the variantReference is ignored
		 *
		 * @returns {Promise} Resolves after the variant is activated or rejects if an error occurs
		 *
		 * @public
		 */
		async activateVariant(mPropertyBag) {
			function logAndThrowError(oError) {
				Log.error(oError);
				throw oError;
			}

			let oElement;
			if (typeof mPropertyBag.element === "string") {
				oElement = Component.getComponentById(mPropertyBag.element);
				if (!(oElement instanceof Component)) {
					oElement = Element.getElementById(mPropertyBag.element);

					if (!(oElement instanceof Element)) {
						logAndThrowError(Error("No valid component or control found for the provided ID"));
					}
				}
			} else if (mPropertyBag.element instanceof Component || mPropertyBag.element instanceof Element) {
				oElement = mPropertyBag.element;
			}

			const oAppComponent = Utils.getAppComponentForControl(oElement);
			const sFlexReference = ManifestUtils.getFlexReferenceForControl(oElement);
			if (!oAppComponent) {
				logAndThrowError(
					Error("A valid variant management control or component (instance or ID) should be passed as parameter")
				);
			}

			const oVariantModel = oAppComponent.getModel(VARIANT_MODEL_NAME);
			if (!oVariantModel) {
				logAndThrowError(Error("No variant management model found for the passed control or application component"));
			}

			if (mPropertyBag.standardVariant && !oElement.isA("sap.ui.fl.variants.VariantManagement")) {
				logAndThrowError(
					Error("With using standardVariant and no variantReference, a variant management control must be passed as element")
				);
			}

			let sVariantManagementReference;
			let sVariantReference;
			let oVMControl;
			if (mPropertyBag.standardVariant) {
				sVariantManagementReference = oElement.getVariantManagementReference();
				sVariantReference = sVariantManagementReference;
				oVMControl = oElement;
			} else {
				sVariantManagementReference = VariantManagementState.getVariantManagementReferenceForVariant(
					sFlexReference,
					mPropertyBag.variantReference
				);
				sVariantReference = mPropertyBag.variantReference;

				if (!sVariantManagementReference) {
					// if the variant management reference is not available, the variant is maybe not yet loaded
					try {
						await VariantManagementState.loadVariant({
							reference: sFlexReference,
							variantReference: sVariantReference
						});

						sVariantManagementReference = VariantManagementState.getVariantManagementReferenceForVariant(
							sFlexReference,
							mPropertyBag.variantReference
						);
					} catch (oError) {
						logAndThrowError(Error(`Variant with reference '${sVariantReference}' could not be found`));
					}
					if (!sVariantManagementReference) {
						logAndThrowError(Error("Variant management reference not found. Check the passed element and variantReference"));
					}
				}
				oVMControl = this.getVariantManagementControlByVMReference(sVariantManagementReference, oAppComponent);
			}

			// sap/fe is using this API very early during app start, sometimes before FlexState is initialized
			await oVMControl.waitForInit();

			try {
				await oVariantModel.updateCurrentVariant({
					variantManagementReference: sVariantManagementReference,
					newVariantReference: sVariantReference,
					appComponent: oAppComponent
				});
			} catch (oError) {
				logAndThrowError(oError);
			}
		},

		/**
		 * Saves a function that will be called after a variant has been applied with the new variant as parameter.
		 * Even if the same variant is selected again the callback is called.
		 * The function also performs a sanity check after the control has been rendered.
		 * If the passed variant control ID does not match the responsible variant management control, the callback will not be saved.
		 * Optionally this function is also called after the initial variant is applied without a sanity check.
		 *
		 * @param {object} mPropertyBag - Object with parameters as properties
		 * @param {sap.ui.fl.Selector} mPropertyBag.selector - Selector of the control
		 * @param {string} mPropertyBag.vmControlId - ID of the variant management control
		 * @param {function} mPropertyBag.callback - Callback that will be called after a variant has been applied
		 * @param {boolean} [mPropertyBag.callAfterInitialVariant] - The callback will also be called after the initial variant is applied
		 *
		 * @public
		 */
		async attachVariantApplied(mPropertyBag) {
			const oVariantManagementControl = Element.getElementById(mPropertyBag.vmControlId);
			await oVariantManagementControl.waitForInit();

			const oControl = mPropertyBag.selector.id && Element.getElementById(mPropertyBag.selector.id) || mPropertyBag.selector;
			const oAppComponent = Utils.getAppComponentForControl(oControl);
			const sVMReference = oVariantManagementControl.getVariantManagementReference();
			const sFlexReference = ManifestUtils.getFlexReferenceForControl(oVariantManagementControl);

			const bInitialLoad = handleInitialLoadScenario(sVMReference, oVariantManagementControl, sFlexReference);
			// if the parameter callAfterInitialVariant or initialLoad is true call the function without check
			if (mPropertyBag.callAfterInitialVariant || bInitialLoad) {
				waitForInitialVariantChanges({
					appComponent: oAppComponent,
					reference: sFlexReference,
					vmReference: sVMReference
				}).then(() => {
					const sCurrentVariantReference = VariantManagementState.getCurrentVariantReference({
						vmReference: sVMReference,
						reference: sFlexReference
					});
					const oVariant = VariantManagementState.getVariant({
						vmReference: sVMReference,
						reference: sFlexReference,
						vReference: sCurrentVariantReference
					});
					mPropertyBag.callback(oVariant);
				});
			}

			// first check if the passed vmControlId is correct, then save the callback
			// for this check the control has to be in the control tree already
			await waitForControlToBeRendered(oControl);
			if (VariantUtil.getRelevantVariantManagementControlId(oControl) === mPropertyBag.vmControlId) {
				// showExecuteOnSelection is only relevant when a control can react to the variant applied event
				// e.g. for ListReport, Table, etc.
				oVariantManagementControl.setShowExecuteOnSelection(true);
				oVariantManagementControl._addVariantAppliedListener(oControl, mPropertyBag.callback);
			} else {
				Log.error(
					"Error in attachVariantApplied: The passed VariantManagement ID doesn't match the responsible VariantManagement control"
				);
			}
		},

		/**
		 * Removes the saved callback for the given control and variant management control.
		 *
		 * @param {object} mPropertyBag - Object with parameters as properties
		 * @param {sap.ui.fl.Selector} mPropertyBag.selector - Selector of the control
		 * @param {string} mPropertyBag.vmControlId - ID of the variant management control
		 *
		 * @public
		 */
		async detachVariantApplied(mPropertyBag) {
			const oVariantManagementControl = Element.getElementById(mPropertyBag.vmControlId);
			const oControl = mPropertyBag.selector.id && Element.getElementById(mPropertyBag.selector.id) || mPropertyBag.selector;
			// Ensure that the variant attach process is finished before removing the listener
			await Promise.all([oVariantManagementControl.waitForInit(), waitForControlToBeRendered(oControl)]);
			oVariantManagementControl._removeVariantAppliedListener(oControl);
		}
	};

	return ControlVariantApplyAPI;
});
