sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/base/security/URLListValidator",
	"sap/base/Log"
], function(Controller, URLListValidator, Log) {
	"use strict";
	return Controller.extend("sap.ui.integration.localServices.oath3lo.consentApp.Controller", {
		onInit: function () {
			// this happens in the 3th party app where the login and giving a consent happens.
			const oUrlParams = new URLSearchParams(window.location.search);
			this._sRedirect = oUrlParams.get('redirect');

			this.byId("redirectText").setText("After consent you will be redirected to " + this._sRedirect);
		},

		giveConsent: function () {
			if (this._validateRedirectUrl(this._sRedirect)) {
				window.location.href = this._sRedirect;
			}
		},

		_validateRedirectUrl: function (sUrl) {
			try {
				const sNormalized = new URL(sUrl, document.baseURI).href;

				if (!URLListValidator.validate(sNormalized)) {
					Log.error("URL validation failed: " + sUrl);
					return false;
				}

				return true;
			} catch (e) {
				Log.error("Invalid URL: " + sUrl);

				return false;
			}
		}
	});
});
