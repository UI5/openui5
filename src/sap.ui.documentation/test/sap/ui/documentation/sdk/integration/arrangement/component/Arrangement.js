sap.ui.define(['sap/ui/test/Opa5', '../BaseArrangement',
	'sap/ui/documentation/sdk/controller/util/CookiesConsentManager',
	'test-resources/sap/ui/documentation/sdk/integration/ForcedUsageTrackingConsent'
], function (Opa5, BaseArrangement, CookiesConsentManager, ForcedUsageTrackingConsent) {
	"use strict";

	function addSaveForLater() {
		var sStateToAdd;
		if (window.location.search) {
			sStateToAdd = "&";
		} else {
			sStateToAdd = "?";
		}

		sStateToAdd += "safeForLater=true";

		window.history.replaceState("dummy", {}, window.location.pathname + window.location.search + sStateToAdd + window.location.hash);
	}

	return BaseArrangement.extend("test-resources.sap.ui.documentation.sdk.integration.arrangement.component.Arrangement", {
		iStartMyApp : function () {
			this.iDisableUsageTracking();
			return this.iStartMyUIComponent({
				componentConfig: {
					name: "sap.ui.documentation.sdk",
					manifest: true
				},
				hash: ""
			});
		},

		// feature toggle tests
		iStartMyAppSafeForLaterActivated: function () {
			if (!new URLSearchParams(window.location.search).has("safeForLater")) {
				addSaveForLater();
			}
			return this.iStartMyApp();
		},

		iStartMyAppComponentWithUsageTracking: function (sHash) {
			var oConsent = ForcedUsageTrackingConsent.applyForcedUsageTrackingConsent(CookiesConsentManager);
			window.adobeDataLayer = [];
			var oPromise = this.iStartMyUIComponent({
				componentConfig: {
					name: "sap.ui.documentation.sdk",
					manifest: true
				},
				hash: sHash || ""
			});
			return oPromise.then(function () {
				oConsent.restore();
			}, function (oErr) {
				oConsent.restore();
				return Promise.reject(oErr);
			});
		},

		iStartMyAppWithUsageTracking: function (sHash) {
			return this.iStartMyAppComponentWithUsageTracking(sHash);
		}
	});
});
