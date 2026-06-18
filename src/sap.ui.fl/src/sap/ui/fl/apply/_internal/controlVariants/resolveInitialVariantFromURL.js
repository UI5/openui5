/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/apply/_internal/controlVariants/Utils",
	"sap/ui/fl/apply/_internal/flexState/controlVariants/VariantManagementState",
	"sap/ui/fl/apply/_internal/flexState/controlVariants/VariantManagerApply",
	"sap/ui/fl/apply/_internal/flexState/FlexState"
], function(
	VariantsApplyUtil,
	VariantManagementState,
	VariantManagerApply,
	FlexState
) {
	"use strict";

	function shouldLoad(sReference, sVMReference, sVariantId) {
		const sOwningVMReference = VariantManagementState.getVariantManagementReferenceForVariant(sReference, sVariantId);
		// Variant is unknown to every loaded VM - load speculatively.
		// loadVariantDependentControlChanges discards the response if the variant turns
		// out to belong to a different VM, so a wrong guess is harmless.
		if (!sOwningVMReference) {
			return true;
		}
		// Variant belongs to this VM. Load only if the UI changes were stripped.
		if (sOwningVMReference === sVMReference) {
			return VariantManagementState.areVariantDependentControlChangesRemoved({
				reference: sReference,
				vmReference: sVMReference,
				variantId: sVariantId
			});
		}
		// Variant belongs to another VM - that VM's own registerToModel handles it.
		return false;
	}

	/**
	 * For a single variant management, ensure that any variant referenced in the URL
	 * technical parameter is fully loaded with its UI changes. Each URL id is checked
	 * independently: if the id is unknown to every loaded VM, this VM loads it
	 * speculatively (loadVariantDependentControlChanges discards the response if the
	 * variant turns out to belong to a different VM). If the id matches a variant in
	 * this VM whose content was lazily stripped, the content is loaded. Ids that
	 * already belong to another VM are left for that VM's registration step.
	 *
	 * @param {object} mPropertyBag - Object with the necessary properties
	 * @param {string} mPropertyBag.reference - Flex reference of the application
	 * @param {string} mPropertyBag.componentId - Component ID of the application
	 * @param {string} mPropertyBag.vmReference - Variant management reference
	 * @returns {Promise<undefined>} Resolves once any required loads have completed
	 * @private
	 * @ui5-restricted sap.ui.fl
	 */
	return async function resolveInitialVariantFromURL(mPropertyBag) {
		const { reference: sReference, componentId: sComponentId, vmReference: sVMReference } = mPropertyBag;
		const aURLVariantIds = VariantsApplyUtil.getVariantReferencesFromURL(
			FlexState.getComponentData(sReference)
		);

		for (const sVariantId of aURLVariantIds) {
			if (!shouldLoad(sReference, sVMReference, sVariantId)) {
				continue;
			}
			await VariantManagerApply.loadVariantDependentControlChanges({
				reference: sReference,
				componentId: sComponentId,
				vmReference: sVMReference,
				variantId: sVariantId
			});
		}
	};
});
