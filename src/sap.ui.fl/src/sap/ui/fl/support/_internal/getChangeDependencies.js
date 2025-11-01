/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/support/_internal/extractChangeDependencies"
], function(
	extractChangeDependencies
) {
	"use strict";

	/**
	 * Provides an object with the changes for the current application as well as
	 * further information. I.e. if the changes were applied and their dependencies.
	 *
	 * @namespace sap.ui.fl.support._internal.getChangeDependencies
	 * @since 1.98
	 * @version ${version}
	 * @private
	 * @ui5-restricted sap.ui.fl.support.api.SupportAPI
	 */

	function getChangeDependencies(oCurrentAppContainerObject) {
		var oAppComponent = oCurrentAppContainerObject.oContainer.getComponentInstance();
		return extractChangeDependencies.extract(oAppComponent);
	}

	return function(oAppComponent) {
		return Promise.resolve(getChangeDependencies(oAppComponent));
	};
});
