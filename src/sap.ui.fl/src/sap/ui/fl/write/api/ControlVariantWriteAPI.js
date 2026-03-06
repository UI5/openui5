/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/apply/_internal/flexState/controlVariants/VariantManagementState",
	"sap/ui/fl/variants/VariantManager",
	"sap/ui/fl/write/_internal/flexState/FlexObjectManager"
], function(
	VariantManagementState,
	VariantManager,
	FlexObjectManager
) {
	"use strict";

	/**
	 * Provides an API that enables tools such as {@link sap.ui.rta} to manage with control variants.
	 * See also {@link sap.ui.fl.variants.VariantManager}.
	 *
	 * @namespace sap.ui.fl.write.api.ControlVariantWriteAPI
	 * @since 1.146
	 * @private
	 * @ui5-restricted sap.ui.rta
	 */
	const ControlVariantWriteAPI = {};

	/**
	 * Returns the dirty changes from the given control changes.
	 *
	 * @param {sap.ui.fl.apply._internal.flexObjects.FlexObject[]} aControlChanges - Array of changes to be checked
	 * @param {string} sFlexReference - Flex reference of the app
	 * @returns {sap.ui.fl.apply._internal.flexObjects.FlexObject[]} Array of filtered changes
	 * @private
	 */
	ControlVariantWriteAPI.getDirtyControlChangesFromVariant = function(aControlChanges, sFlexReference) {
		return VariantManager.getDirtyControlChangesFromVariant(aControlChanges, sFlexReference);
	};

	/**
	 * Returns the variant management reference for the given variant reference.
	 *
	 * @param {string} sFlexReference - Flex reference of the app
	 * @param {string} sVariantManagementReference - Variant management reference
	 * @returns {string} Variant management reference for the given variant reference
	 * @private
	 */
	ControlVariantWriteAPI.getVariantManagementReferenceForVariant = function(sFlexReference, sVariantManagementReference) {
		return VariantManagementState.getVariantManagementReferenceForVariant(
			sFlexReference,
			sVariantManagementReference
		);
	};

	/**
	 * Returns all control changes for the given variant.
	 * @param {string} sFlexReference - Flex reference of the app
	 * @param {string} sVMReference - Variant Management reference
	 * @param {string} sVReference - Variant reference
	 * @returns {sap.ui.fl.apply._internal.flexObjects.FlexObject[]} Array of control changes for the given variant
	 */
	ControlVariantWriteAPI.getControlChangesForVariant = function(sFlexReference, sVMReference, sVReference) {
		return VariantManagementState.getVariant({
			reference: sFlexReference,
			vmReference: sVMReference,
			vReference: sVReference
		}).controlChanges;
	};

	/**
	 * Mark or unmark changes are saved as variant.
	 * Invalidates the variant management map for the given flex reference.
	 * This ensures that the variant management map is updated when changes are made.
	 *
	 * @param {string} sFlexReference - Flex reference of the app
	 * @param {sap.ui.fl.apply._internal.flexObjects.FlexObject[]} aChanges - Array of changes to be marked
	 * @param {boolean} bSetSavedToVariant - Whether to mark the changes as saved to variant or not
	 * @private
	 */
	ControlVariantWriteAPI.setSavedToVariant = function(sFlexReference, aChanges, bSetSavedToVariant) {
		aChanges.forEach((oChange) => {
			if (oChange.getFileType() === "change") {
				oChange.setSavedToVariant(bSetSavedToVariant);
			}
		});
		VariantManagementState.getVariantManagementMap().checkUpdate({ reference: sFlexReference });
	};

	/**
	 * Sets the variant properties and adds variant changes.
	 *
	 * @param {object} mPropertyBag - Map of properties
	 * @param {string} mPropertyBag.variantManagementReference - Variant management reference
	 * @param {sap.ui.core.Component} mPropertyBag.appComponent - App component
	 * @param {object[]} mPropertyBag.changeContents - Array of change content objects
	 * @param {string} [mPropertyBag.generatorName] - Generator name for the changes
	 * @returns {sap.ui.fl.apply._internal.flexObjects.FlexObject[]} Created Change objects
	 */
	ControlVariantWriteAPI.addVariantChanges = function(mPropertyBag) {
		return VariantManager.addVariantChanges(mPropertyBag);
	};

	/**
	 * Handles the Save event for a variant management control.
	 *
	 * @param {sap.ui.core.Control} oVariantManagementControl - Variant management control
	 * @param {object} mParameters - Parameters for saving the variant
	 * @param {string} mParameters.name - Name of the variant
	 * @param {string} mParameters.newVariantReference - Reference of the new variant
	 * @param {string} mParameters.layer - Layer in which the variant should be saved
	 * @param {string} [mParameters.generator] - Generator name for the changes
	 * @param {boolean} [mParameters.overwrite] - Whether to overwrite an existing variant
	 * @param {object[]} mParameters.contexts - Contexts for which the variant should be saved
	 * @param {string} [mParameters.def] - Whether the variant is default
	 * @param {string[]} [mParameters.deleted] - Whether the variant is deleted
	 * @param {object[]} [mParameters.fav] - Whether the variant is favorite
	 * @param {object[]} [mParameters.renamed] - Whether the variant is renamed
	 * @param {object[]} [mParameters.exe] - Whether to execute on selection is true
	 * @returns {Promise<Array<sap.ui.fl.apply._internal.flexObjects.FlexObject>>} Promise resolving with the created changes
	 */
	ControlVariantWriteAPI.handleSaveEvent = function(oVariantManagementControl, mParameters) {
		return VariantManager.handleSaveEvent(oVariantManagementControl, mParameters);
	};

	/**
	 * Handles the execution of variant configuration after the manage variants dialog is closed.
	 *
	 * @param {object} mPropertyBag - Map of properties
	 * @param {string} mPropertyBag.variantManagementReference - Variant management reference
	 * @param {sap.ui.core.Component} mPropertyBag.appComponent - App component
	 * @param {object[]} mPropertyBag.changeContents - Array of change content objects
	 * @param {object} mPropertyBag.vmControl - Variant management control
	 * @param {string} [mPropertyBag.newDefaultVariantReferenceParameter] - New default variant reference
	 * @param {string} [mPropertyBag.generatorName] - Generator name for the changes
	 * @param {object[]} [mPropertyBag.variantsToBeDeleted] - Array of variants required to be deleted variants
	 * @param {string} [mPropertyBag.layer] - Layer in which the changes should be deleted
	 * @returns {Promise<Array<string, Array<sap.ui.fl.apply._internal.flexObjects.FlexObject>, Array<sap.ui.fl.apply._internal.flexObjects.FlexObject>>>} Promise resolving with old variant reference, created changes and deleted changes
	 */
	ControlVariantWriteAPI.handleManageViewDialogExecution = async function(mPropertyBag) {
		return await VariantManager.handleManageViewDialogExecution(mPropertyBag);
	};

	/**
	 * Removes a variant and switches to the provided sourceVariantReference.
	 *
	 * @param {object} mPropertyBag - Map of properties
	 * @param {string} mPropertyBag.variantManagementReference - Variant management reference
	 * @param {sap.ui.core.Component} mPropertyBag.appComponent - App component
	 * @param {sap.ui.fl.variants.Variant} mPropertyBag.variant - Variant to be removed
	 * @param {string} mPropertyBag.sourceVariantReference - Source variant reference that should be set as current after removing
	 * @param {sap.ui.fl.variants.VariantManagement} mPropertyBag.vmControl - Variant management control
	 */
	ControlVariantWriteAPI.removeVariant = function(mPropertyBag) {
		VariantManager.removeVariant(mPropertyBag);
	};

	/**
	 * Sets the variant properties and deletes a variant change.
	 *
	 * @param {string} sVariantManagementReference - Variant management reference
	 * @param {object} mPropertyBag - Property bag with variant properties to be set before deleting the change
	 * @param {sap.ui.core.Component} mPropertyBag.appComponent - App component
	 * @param {string} [mPropertyBag.variantReference] - Variant reference for which properties should be set
	 * @param {string} [mPropertyBag.changeType] - Change type due to which properties are being set
	 * @param {string} [mPropertyBag.layer] - Current layer
	 * @param {string} [mPropertyBag.title] - New variant title value for <code>setTitle</code> change type
	 * @param {boolean} [mPropertyBag.visible] - New visible value for <code>setVisible</code> change type
	 * @param {object} [mPropertyBag.contexts] - New contexts object (e.g. roles) for <code>setContexts</code> change type
	 * @param {boolean} [mPropertyBag.favorite] - New favorite value for <code>setFavorite</code> change type
	 * @param {boolean} [mPropertyBag.executeOnSelect] - New executeOnSelect value for <code>setExecuteOnSelect</code> change type
	 * @param {string} [mPropertyBag.defaultVariant] - New default variant for <code>setDefault</code> change type
	 * @param {sap.ui.fl.apply._internal.flexObjects.FlexObject} oChange - Variant change to be deleted
	 */
	ControlVariantWriteAPI.deleteVariantChange = function(sVariantManagementReference, mPropertyBag, oChange) {
		const oVariantModel = mPropertyBag.appComponent.getModel("$FlexVariants");
		oVariantModel.setVariantProperties(sVariantManagementReference, mPropertyBag);
		FlexObjectManager.deleteFlexObjects({
			reference: oVariantModel.sFlexReference,
			flexObjects: [oChange],
			componentId: mPropertyBag.appComponent.getId()
		});
	};

	/**
	 * Erases dirty changes on a given variant and returns the dirty changes.
	 *
	 * @param {object} mPropertyBag - Map of properties
	 * @param {string} mPropertyBag.variantManagementReference - Variant management reference
	 * @param {string} mPropertyBag.variantReference - Variant reference to remove dirty changes from
	 * @param {sap.ui.core.Control} mPropertyBag.control - Control instance to fetch the variant model
	 * @param {boolean} [mPropertyBag.revert] - Whether the changes should be reverted
	 * @returns {Promise<sap.ui.fl.apply._internal.flexObjects.FlexObject[]>} Resolves with the removed dirty changes
	 */
	ControlVariantWriteAPI.eraseDirtyChangesOnVariant = function(mPropertyBag) {
		return VariantManager.eraseDirtyChangesOnVariant(mPropertyBag);
	};

	/**
	 * Restores previously deleted FlexObjects. Objects are restored to the state they were in before deletion.
	 * If the flex object was not persisted, it is added as a dirty object again.
	 * Once the deletion is persisted, changes will not be restored.
	 *
	 * @param {object} mPropertyBag - Object with parameters as properties
	 * @param {string} mPropertyBag.reference - Flex reference of the application
	 * @param {string} mPropertyBag.componentId - Id of the application instance
	 * @param {sap.ui.fl.apply._internal.flexObjects.FlexObject[]} mPropertyBag.flexObjects - FlexObjects to be restored
	 * @private
	 * @ui5-restricted sap.ui.fl, sap.ui.rta, similar tools
	 */
	ControlVariantWriteAPI.restoreDeletedFlexObjects = function(mPropertyBag) {
		FlexObjectManager.restoreDeletedFlexObjects(mPropertyBag);
	};

	/**
	 * Adds and applies the given control changes.
	 *
	 * @param {Array<sap.ui.fl.apply._internal.flexObjects.FlexObject>} aChanges Changes to be added and applied
	 * @param {sap.ui.core.Control} oControl - Control instance to fetch the variant model
	 * @returns {Promise<undefined>} Promise resolving when all changes are added and applied
	 */
	ControlVariantWriteAPI.addAndApplyControlChangesOnVariant = function(aChanges, oControl) {
		return VariantManager.addAndApplyControlChangesOnVariant(aChanges, oControl);
	};

	/**
	 * Opens the <i>Manage Views</i> dialog in Adaptation mode. Called from the ControlVariant plugin.
	 * For Personalization, handleManageEvent is used.
	 * Returns a promise that resolves to changes made from the manage dialog, based on the parameters passed.
	 *
	 * @param {object} mPropertyBag - Map of properties
	 * @param {sap.ui.fl.variants.VariantManagement} mPropertyBag.variantManagementControl - Variant management control
	 * @param {string} mPropertyBag.layer - Current layer
	 * @param {string} mPropertyBag.styleClass - Style class assigned to the management dialog
	 * @param {Promise<sap.ui.core.ComponentContainer>} mPropertyBag.contextSharingComponentPromise - Promise resolving with the ComponentContainer
	 * @returns {Promise<object<{changes: array, variantsToBeDeleted: array}>>} Resolves when "manage" event is fired from the variant management control
	 * @private
	 * @ui5-restricted
	 */
	ControlVariantWriteAPI.openManageVariantsDialog = function(mPropertyBag) {
		return VariantManager.openManageVariantsDialog(mPropertyBag);
	};

	return ControlVariantWriteAPI;
});