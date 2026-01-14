/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/initial/_internal/Settings"
], function(
	Settings
) {
	"use strict";

	async function getSettings() {
		const oSettings = await Settings.getInstance();
		return Object.entries(oSettings.getMetadata().getProperties()).map(function([sKey, oProperty]) {
			return {
				key: sKey,
				value: oSettings[oProperty._sGetter]()
			};
		});
	}

	/**
	 * Provides an object with the flex Settings.
	 * WARNING: No deep clone - Returns original object references to ensure that prototype methods
	 * stay intact. Do not mutate.
	 *
	 * @namespace sap.ui.fl.support._internal.getFlexSettings
	 * @since 1.99
	 * @version ${version}
	 * @param {sap.ui.core.UIComponent} oAppComponent - Application Component
	 * @returns {Promise<Object>} Promise resolving with the flex settings
	 * @private
	 * @ui5-restricted sap.ui.fl.support.api.SupportAPI
	 */
	return function(oAppComponent) {
		return getSettings(oAppComponent);
	};
});
