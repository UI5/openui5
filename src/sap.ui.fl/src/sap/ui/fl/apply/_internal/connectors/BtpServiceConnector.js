
/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/util/merge",
	"sap/ui/fl/apply/_internal/connectors/KeyUserConnector",
	"sap/ui/fl/apply/_internal/connectors/Utils",
	"sap/ui/fl/library"
], function(
	merge,
	KeyUserConnector,
	ApplyUtils,
	flLibrary
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
			flLibrary.Layer.CUSTOMER,
			flLibrary.Layer.PUBLIC,
			flLibrary.Layer.USER
		],
		ROOT: ROOT,
		ROUTES: {
			DATA: ROOT + "/data",
			SETTINGS: ROOT + "/settings"
		},
		loadFlexData: function(mPropertyBag) {
			var sDataUrl = ApplyUtils.getUrl(this.ROUTES.DATA, mPropertyBag);
			return ApplyUtils.sendRequest(sDataUrl, "GET", { xsrfToken: this.xsrfToken }).then(function (oResult) {
				var oResponse = oResult.response;
				oResponse.contents.map(function(oContent, iIndex, oResult) {
					oResult[iIndex].changes = (oContent.changes || []).concat(oContent.compVariants);
					if (iIndex === 1) {
						// The PUBLIC layer lacks variantManagementChanges, which are required by the ConnectorResultMerger
						oResult[1].variantManagementChanges = [];
					}
				});
				oResponse.contents.cacheKey = oResponse.cacheKey;
				return oResponse.contents;
			});
		}
	});
	return BtpServiceConnector;
});