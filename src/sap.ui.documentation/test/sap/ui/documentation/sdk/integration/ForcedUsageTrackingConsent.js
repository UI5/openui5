sap.ui.define([], function () {
	"use strict";

	/**
	 * Wraps CookiesConsentManager.create so that every instance it returns immediately
	 * reports user consent for usage tracking.  The override is applied as an own-property
	 * on the instance after construction, which shadows the prototype method on both
	 * DefaultConsentManager and ThirdPartyConsentManager.
	 *
	 * The caller is responsible for passing the CookiesConsentManager module from the
	 * same JavaScript realm as the app (test window or iframe window).
	 *
	 * @param {object} CookiesConsentManager - The module object whose `create` is patched.
	 * @returns {{ restore: function }} An object with a `restore()` function that removes the patch.
	 */
	function applyForcedUsageTrackingConsent(CookiesConsentManager) {
		var fnOriginalCreate = CookiesConsentManager.create;
		CookiesConsentManager.create = function (oComponent, oConfig) {
			var oManager = fnOriginalCreate.call(this, oComponent, oConfig);
			oManager.checkUserAcceptsUsageTracking = function (fnCallback) {
				fnCallback(true);
			};
			return oManager;
		};
		return {
			restore: function () {
				CookiesConsentManager.create = fnOriginalCreate;
			}
		};
	}

	return { applyForcedUsageTrackingConsent: applyForcedUsageTrackingConsent };
});
