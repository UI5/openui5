/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/util/merge",
	"sap/ui/fl/initial/_internal/connectors/KeyUserConnector",
	"sap/ui/fl/initial/_internal/connectors/BackendConnector",
	"sap/ui/fl/Layer"
], function(
	merge,
	KeyUserConnector,
	BackendConnector,
	Layer
) {
	"use strict";

	var PREFIX = "/flex/all";
	var API_VERSION = "/v3";
	var ROOT = PREFIX + API_VERSION;

	/**
	 * Connector for requesting all data from SAPUI5 Flexibility KeyUser service - including personalization.
	 *
	 * @namespace sap.ui.fl.initial._internal.connectors.BtpServiceConnector
	 * @private
	 * @ui5-restricted sap.ui.fl.initial._internal.Storage, sap.ui.fl.write._internal.Storage
	 */
	var BtpServiceConnector = merge({}, KeyUserConnector, {
		/** @lends sap.ui.fl.initial._internal.connectors.BtpServiceConnector */
		layers: [
			Layer.CUSTOMER,
			Layer.PUBLIC,
			Layer.USER
		],
		ROOT: ROOT,
		ROUTES: {
			DATA: ROOT + "/data",
			SETTINGS: ROOT + "/settings"
		},
		loadFlexData: function(mPropertyBag) {
			return BackendConnector.sendRequest.call(this, mPropertyBag).then(function (oResult) {
				oResult.contents.map(function(oContent, iIndex, oResult) {
					oResult[iIndex].changes = (oContent.changes || []).concat(oContent.compVariants);
				});
				oResult.contents.cacheKey = oResult.cacheKey;
				return oResult.contents;
			});
		}
	});

	return BtpServiceConnector;
});