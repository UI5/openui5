/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/apply/_internal/flexState/changes/UIChangesState",
	"sap/ui/fl/apply/_internal/flexState/controlVariants/VariantManagementState",
	"sap/ui/fl/apply/_internal/flexState/FlexObjectState",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/initial/_internal/ManifestUtils"
], function(
	UIChangesState,
	VariantManagementState,
	FlexObjectState,
	FlexState,
	ManifestUtils
) {
	"use strict";

	/**
	 * Returns an array with several FlexObject infos for the application.
	 *
	 * @namespace sap.ui.fl.support._internal.getFlexObjectInfos
	 * @since 1.128
	 * @version ${version}
	 * @private
	 * @ui5-restricted sap.ui.fl.support.api.SupportAPI
	 */

	function getFlexObjectInfos(oCurrentAppContainerObject) {
		const oAppComponent = oCurrentAppContainerObject.oContainer.getComponentInstance();
		const sReference = ManifestUtils.getFlexReferenceForControl(oAppComponent);
		return {
			allUIChanges: UIChangesState.getAllUIChanges(sReference),
			allFlexObjects: FlexState.getFlexObjectsDataSelector().get({ reference: sReference }),
			dirtyFlexObjects: FlexObjectState.getDirtyFlexObjects(sReference),
			completeDependencyMap: FlexObjectState.getCompleteDependencyMap(sReference),
			liveDependencyMap: FlexObjectState.getLiveDependencyMap(sReference),
			variantManagementMap: VariantManagementState.getVariantManagementMap().get({ reference: sReference })
		};
	}

	return function(oAppComponent) {
		return Promise.resolve(getFlexObjectInfos(oAppComponent));
	};
});
