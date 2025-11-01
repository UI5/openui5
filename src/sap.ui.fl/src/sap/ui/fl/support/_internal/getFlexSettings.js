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
			let vValue = oSettings[oProperty._sGetter]();

			if (sKey === "versioning") {
				vValue = vValue.CUSTOMER || vValue.ALL;
			}

			return {
				key: sKey,
				value: vValue
			};
		});
	}

	/**
	 * Provides an object with the flex Settings.
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
