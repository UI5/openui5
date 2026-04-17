/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/fl/apply/_internal/changes/Applier",
	"sap/ui/fl/apply/_internal/changes/Reverter",
	"sap/ui/fl/apply/_internal/flexState/changes/DependencyHandler",
	"sap/ui/fl/apply/_internal/flexState/controlVariants/VariantManagementState",
	"sap/ui/fl/apply/_internal/flexState/FlexObjectState",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/initial/_internal/ManifestUtils",
	"sap/ui/fl/initial/_internal/Storage",
	"sap/ui/fl/requireAsync",
	"sap/ui/fl/Utils"
], function(
	JsControlTreeModifier,
	Applier,
	Reverter,
	DependencyHandler,
	VariantManagementState,
	FlexObjectState,
	FlexState,
	ManifestUtils,
	Storage,
	requireAsync,
	Utils
) {
	"use strict";

	/**
	 * Provides functionality for managing variants in the "apply" context.
	 * For example: switching variants.
	 * See also {@link sap.ui.fl.variants.VariantManagement}.
	 *
	 * @namespace sap.ui.fl.apply._internal.flexState.controlVariants.VariantManagerApply
	 * @since 1.144
	 * @version ${version}
	 * @private
	 * @ui5-restricted
	 */
	const VariantManagerApply = {};

	function getControlChangesForVariantSwitch(mPropertyBag) {
		const aChangesOnCurrentVariant = VariantManagementState.getControlChangesForVariant({
			vmReference: mPropertyBag.vmReference,
			reference: mPropertyBag.reference,
			vReference: mPropertyBag.currentVReference
		});
		const aChangesOnNewVariant = VariantManagementState.getControlChangesForVariant({
			vmReference: mPropertyBag.vmReference,
			reference: mPropertyBag.reference,
			vReference: mPropertyBag.newVReference
		});

		// Skip changes that are the same in both variants, e.g. when referenced from lower layers
		const iDivergenceIndex = aChangesOnCurrentVariant.findIndex((oChange, iIndex) => {
			const oChangeOnNewVariant = aChangesOnNewVariant[iIndex];
			return !oChangeOnNewVariant || oChange.getId() !== oChangeOnNewVariant.getId();
		});
		const iSlicingIndex = iDivergenceIndex >= 0 ? iDivergenceIndex : aChangesOnCurrentVariant.length;

		return {
			changesToBeReverted: aChangesOnCurrentVariant.slice(iSlicingIndex).reverse(),
			changesToBeApplied: aChangesOnNewVariant.slice(iSlicingIndex)
		};
	}

	async function switchVariant(mPropertyBag) {
		// Check if variant content needs to be loaded (lazy loading)
		if (
			VariantManagementState.isVariantContentRemoved({
				reference: mPropertyBag.reference,
				vmReference: mPropertyBag.vmReference,
				variantId: mPropertyBag.newVReference
			})
		) {
			await VariantManagerApply.loadVariantContent({
				reference: mPropertyBag.reference,
				componentId: mPropertyBag.appComponent.getId(),
				vmReference: mPropertyBag.vmReference,
				variantId: mPropertyBag.newVReference
			});
		}

		const mChangesToBeSwitched = getControlChangesForVariantSwitch(mPropertyBag);
		const oLiveDependencyMap = FlexObjectState.getLiveDependencyMap(mPropertyBag.reference);

		// Early setting the changes as queued for revert/apply prevents potential timing issues
		// when e.g. evaluating the App State after the switch
		mChangesToBeSwitched.changesToBeReverted.forEach((oChange) => oChange.setQueuedForRevert());
		mChangesToBeSwitched.changesToBeApplied.forEach((oChange) => {
			if (!oChange.isApplyProcessFinished()) {
				oChange.setQueuedForApply();
				// Add change to the dependency map in advance so that any dependent changes are aware of the change
				DependencyHandler.addRuntimeChangeToMap(oChange, mPropertyBag.appComponent, oLiveDependencyMap);
			}
		});

		if (mChangesToBeSwitched.changesToBeReverted.length > 0) {
			await Reverter.revertMultipleChanges(mChangesToBeSwitched.changesToBeReverted, { ...mPropertyBag, skipSetQueued: true });
		}
		if (mChangesToBeSwitched.changesToBeApplied.length > 0) {
			await Applier.applyMultipleChanges(mChangesToBeSwitched.changesToBeApplied, { ...mPropertyBag, skipSetQueued: true });
		}
		VariantManagementState.setCurrentVariant(mPropertyBag);
	}

	/**
	 * Adds the passed function to the variant switch promise and returns the whole promise chain.
	 * If there are multiple switches triggered very quickly, this function makes sure that they are
	 * being executed one after the other.
	 *
	 * @param {function} fnCallback - Callback function returning a promise
	 * @param {string} sFlexReference - Flex reference of the app
	 * @param {string} sVMReference - Variant Management reference
	 * @returns {Promise} Resolves when the variant model is not busy anymore
	 * @private
	 */
	VariantManagerApply.executeAfterSwitch = function(fnCallback, sFlexReference, sVMReference) {
		const oNewPromise = VariantManagementState.waitForVariantSwitch(sFlexReference, sVMReference)
		.catch(function() {
			// Catch previous errors to not block the queue
		})
		.then(fnCallback);
		VariantManagementState.setVariantSwitchPromise(sFlexReference, sVMReference, oNewPromise);
		return oNewPromise;
	};

	/**
	 * Switches the current variant and triggers all switch listeners.
	 *
	 * @param {object} mPropertyBag - Object with properties
	 * @param {string} mPropertyBag.newVariantReference - Variant reference to be set as current
	 * @param {sap.ui.fl.variants.VariantManagement} mPropertyBag.vmControl - Variant management control
	 * @param {sap.ui.core.Component} [mPropertyBag.appComponent] - App component
	 * @param {boolean} [mPropertyBag.skipExecuteAfterSwitch] - When called from VariantManagerApply.handleSelectVariant or VariantManager.copyVariant
	 * @param {string} [mPropertyBag.scenario] - Scenario why the variant is switched
	 * @returns {Promise} Resolves when the variant has been switched
	 */
	VariantManagerApply.updateCurrentVariant = function(mPropertyBag) {
		const sVMReference = mPropertyBag.vmControl.getVariantManagementReference();
		const oAppComponent = mPropertyBag.appComponent || Utils.getAppComponentForControl(mPropertyBag.vmControl);
		const sFlexReference = ManifestUtils.getFlexReferenceForControl(oAppComponent);

		const fnSwitchVariant = async () => {
			const oNewVariant = VariantManagementState.getVariant({
				reference: sFlexReference,
				vmReference: sVMReference,
				vReference: mPropertyBag.newVariantReference
			});
			if (mPropertyBag.scenario) {
				// Only relevant for the callback - no need to persist this information
				oNewVariant.createScenario = mPropertyBag.scenario;
			}
			const sCurrentVariantReference = mPropertyBag.vmControl.getCurrentVariantReference();
			if (sCurrentVariantReference !== mPropertyBag.newVariantReference) {
				await switchVariant({
					vmReference: sVMReference,
					currentVReference: sCurrentVariantReference,
					newVReference: mPropertyBag.newVariantReference,
					appComponent: oAppComponent,
					modifier: JsControlTreeModifier,
					reference: sFlexReference
				});
			}
			mPropertyBag.vmControl._executeAllVariantAppliedListeners(oNewVariant);
		};

		// When the update is called internally, e.g. from handleSelectVariant, we do not need to queue the switch
		if (mPropertyBag.skipExecuteAfterSwitch) {
			return fnSwitchVariant();
		}
		return VariantManagerApply.executeAfterSwitch(
			fnSwitchVariant,
			sFlexReference,
			sVMReference
		);
	};

	/**
	 * Handler for "select" event fired from a variant management control.
	 * Resolves when new variant (if applicable) has been switched and all source variant dirty changes have been removed.
	 * It is possible to select the currently selected variant again - in this case only the dirty changes are removed.
	 *
	 * @param {sap.ui.base.Event} oEvent - Event object
	 * @param {sap.ui.fl.variants.VariantManagement} oVMControl - Variant management control
	 * @returns {Promise<undefined>} Resolves with undefined
	 */
	VariantManagerApply.handleSelectVariant = async function(oEvent, oVMControl) {
		const oAppComponent = Utils.getAppComponentForControl(oVMControl);
		const sVMReference = oVMControl.getVariantManagementReference();
		const bOldVariantWasModified = oVMControl.getModified();
		const sTargetVReference = oEvent.getParameter("key");
		const sSourceVReference = oVMControl.getCurrentVariantReference();
		const bVariantSwitch = sSourceVReference !== sTargetVReference;
		await VariantManagerApply.updateCurrentVariant({
			newVariantReference: sTargetVReference,
			appComponent: oAppComponent,
			vmControl: oVMControl,
			skipExecuteAfterSwitch: true
		});

		if (bOldVariantWasModified) {
			const VariantManager = await requireAsync("sap/ui/fl/variants/VariantManager");
			// Only revert if the variant is not switched, otherwise the revert will happen on switch
			await VariantManager.eraseDirtyChangesOnVariant({
				variantManagementReference: sVMReference,
				variantReference: sSourceVReference,
				control: oVMControl,
				revert: !bVariantSwitch
			});
		}
	};

	/**
	 * Loads the flex objects for a specified variant reference and adds them to the FlexState.
	 *
	 * @param {object} mPropertyBag - Object with the necessary properties
	 * @param {string} mPropertyBag.reference - Flexibility reference
	 * @param {string} mPropertyBag.variantReference - Variant reference to be loaded
	 * @param {string} mPropertyBag.componentId - Component ID
	 * @returns {Promise<object>} Resolves with the new data that was added
	 */
	VariantManagerApply.loadVariant = async function(mPropertyBag) {
		const oBackendResponse = await Storage.loadFlVariant({
			variantReference: mPropertyBag.variantReference,
			reference: mPropertyBag.reference
		});

		FlexState.addNewObjects({
			reference: mPropertyBag.reference,
			componentId: mPropertyBag.componentId,
			newData: oBackendResponse
		});

		return oBackendResponse;
	};

	/**
	 * Loads all FL variants for a variant management control.
	 * Used for lazy loading when opening the Manage Views dialog or
	 * when saving a new variant.
	 *
	 * @param {object} mPropertyBag - Object with the necessary properties
	 * @param {string} mPropertyBag.reference - Flex reference
	 * @param {string} mPropertyBag.componentId - Component ID
	 * @param {string} mPropertyBag.vmReference - Variant management reference
	 * @returns {Promise<object>} Resolves with the new data that was added
	 */
	VariantManagerApply.loadAllVariantsForVM = async function(mPropertyBag) {
		const oBackendResponse = await Storage.loadAllFlVariants({
			reference: mPropertyBag.reference,
			vmReference: mPropertyBag.vmReference
		});

		FlexState.addNewObjects({
			reference: mPropertyBag.reference,
			componentId: mPropertyBag.componentId,
			newData: oBackendResponse
		});

		// Mark that all variants have been loaded for this VM
		FlexState.addLazyVariantsLoaded(mPropertyBag.reference, mPropertyBag.vmReference);

		return oBackendResponse;
	};

	/**
	 * Loads the UI changes for a specific FL variant.
	 * Used for lazy loading when switching to a variant with variantContentRemoved: true.
	 *
	 * @param {object} mPropertyBag - Object with the necessary properties
	 * @param {string} mPropertyBag.reference - Flex reference
	 * @param {string} mPropertyBag.componentId - Component ID
	 * @param {string} mPropertyBag.vmReference - Variant management reference
	 * @param {string} mPropertyBag.variantId - Variant ID to load content for
	 * @returns {Promise<object>} Resolves with the new data that was added
	 */
	VariantManagerApply.loadVariantContent = async function(mPropertyBag) {
		const oBackendResponse = await Storage.loadFlVariantContent({
			reference: mPropertyBag.reference,
			variantId: mPropertyBag.variantId
		});

		FlexState.addNewObjects({
			reference: mPropertyBag.reference,
			componentId: mPropertyBag.componentId,
			newData: oBackendResponse
		});

		// Reset the flag so the content is not loaded again
		const oVariant = VariantManagementState.getVariant({
			reference: mPropertyBag.reference,
			vmReference: mPropertyBag.vmReference,
			vReference: mPropertyBag.variantId
		});
		oVariant.instance.setVariantContentRemoved(false);

		return oBackendResponse;
	};

	return VariantManagerApply;
});
