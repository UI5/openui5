/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/apply/_internal/flexState/changes/UIChangesState",
	"sap/ui/fl/initial/_internal/ManifestUtils"
], function(
	UIChangesState,
	ManifestUtils
) {
	"use strict";

	/**
	 * Returns an array with all UI Changes for the application.
	 *
	 * @namespace sap.ui.fl.support._internal.getAllUIChanges
	 * @since 1.121
	 * @version ${version}
	 * @private
	 * @ui5-restricted sap.ui.fl.support.api.SupportAPI
	 */

	function getAllUIChangesFromChangesState(oCurrentAppContainerObject) {
		const oAppComponent = oCurrentAppContainerObject.oContainer.getComponentInstance();
		const sReference = ManifestUtils.getFlexReferenceForControl(oAppComponent);
		return UIChangesState.getAllUIChanges(sReference);
	}

	return function(oAppComponent) {
		return Promise.resolve(getAllUIChangesFromChangesState(oAppComponent));
	};
});
