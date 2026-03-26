/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/util/merge",
	"sap/ui/fl/Layer",
	"sap/ui/fl/write/_internal/connectors/BackendConnector",
	"sap/ui/fl/write/_internal/connectors/KeyUserConnector",
	"sap/ui/fl/initial/_internal/connectors/BtpServiceConnector",
	"sap/ui/fl/initial/_internal/connectors/Utils"
], function(
	merge,
	Layer,
	BackendConnector,
	KeyUserConnector,
	InitialConnector,
	InitialUtils
) {
	"use strict";

	/**
	 * Connector for saving and deleting data from SAPUI5 Flexibility KeyUser service - including personalization.
	 *
	 * @namespace sap.ui.fl.write._internal.connectors.BtpServiceConnector
	 * @version ${version}
	 * @private
	 * @ui5-restricted sap.ui.fl.write._internal.Storage
	 */
	var BtpServiceConnector = merge({}, KeyUserConnector, /** @lends sap.ui.fl.write._internal.connectors.BtpServiceConnector */ {
		layers: [
			Layer.CUSTOMER,
			Layer.PUBLIC,
			Layer.USER
		],
		ROUTES: {
			CHANGES: InitialConnector.ROOT + "/changes",
			SETTINGS: InitialConnector.ROOT + "/settings",
			TOKEN: InitialConnector.ROOT + "/settings",
			VERSIONS: {
				GET: InitialConnector.ROOT + "/versions",
				ACTIVATE: InitialConnector.ROOT + "/versions/activate",
				DISCARD: InitialConnector.ROOT + "/versions/draft",
				PUBLISH: InitialConnector.ROOT + "/versions/publish"
			},
			TRANSLATION: {
				UPLOAD: InitialConnector.ROOT + "/translation/texts",
				DOWNLOAD: InitialConnector.ROOT + "/translation/texts",
				GET_SOURCELANGUAGE: InitialConnector.ROOT + "/translation/sourcelanguages"
			},
			CONTEXTS: InitialConnector.ROOT + "/contexts"
		},
		versions: {
			load: function (mPropertyBag) {
				mPropertyBag.initialConnector = InitialConnector;
				mPropertyBag.xsrfToken = InitialConnector.xsrfToken;
				mPropertyBag.tokenUrl = this.ROUTES.TOKEN;
				var mParameters = {};
				InitialUtils.addLanguageInfo(mParameters);
				mParameters.limit = mPropertyBag.limit;
				var sVersionsUrl = InitialUtils.getUrl(this.ROUTES.VERSIONS.GET, mPropertyBag, mParameters);
				return InitialUtils.sendRequest(sVersionsUrl, "GET", mPropertyBag).then(function (oResult) {
					return oResult.response.versions.map(function (oVersion) {
						oVersion.version = oVersion.versionNumber;
						delete oVersion.versionNumber;
						return oVersion;
					});
				});
			}
		},
		remove: function (mPropertyBag) {
			// public comp variants are save as customer layer and must be handle with the v1 route, because the backend has some extra logic, e.g. version
			if (mPropertyBag.flexObject && mPropertyBag.flexObject.layer === Layer.CUSTOMER && mPropertyBag.flexObject.fileType === "variant") {
				mPropertyBag.flexObject.layer = Layer.PUBLIC;
			}
			return BackendConnector.remove.call(this, mPropertyBag);
		},
		update: function (mPropertyBag) {
			// public comp variants are save as customer layer and must be handle with the v1 route, because the backend has some extra logic, e.g. version
			if (mPropertyBag.flexObject && mPropertyBag.flexObject.layer === Layer.CUSTOMER && mPropertyBag.flexObject.fileType === "variant") {
				mPropertyBag.flexObject.layer = Layer.PUBLIC;
			}
			return BackendConnector.update.call(this, mPropertyBag);
		},
		write: function (mPropertyBag) {
			// public comp variants are save as customer layer and must be handle with the v1 route, because the backend has some extra logic, e.g. version
			if (mPropertyBag.flexObjects.length && mPropertyBag.flexObjects[0].layer === Layer.CUSTOMER && mPropertyBag.flexObjects[0].fileType === "variant") {
				mPropertyBag.flexObjects[0].layer = Layer.PUBLIC;
			}
			return BackendConnector.write.call(this, mPropertyBag);
		},
		loadFeatures: function (mPropertyBag) {
			return KeyUserConnector.loadFeatures.call(this, mPropertyBag).then(function (oFeatures) {
				// not supported for ui5 version 1.96
				oFeatures.isVariantAdaptationEnabled = false;
				oFeatures.isPublicLayerAvailable = false;
				oFeatures.isPublicFlVariantEnabled = false;
				return oFeatures;
			});
		}
	});

	BtpServiceConnector.initialConnector = InitialConnector;
	return BtpServiceConnector;
});