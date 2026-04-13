
/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/util/merge",
	"sap/ui/fl/library",
	"sap/ui/fl/write/_internal/connectors/KeyUserConnector",
	"sap/ui/fl/apply/_internal/connectors/BtpServiceConnector"
], function(
	merge,
	flLibrary,
	KeyUserConnector,
	ApplyConnector
) {
	"use strict";

	var PUBLIC = "PUBLIC";

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
			flLibrary.Layer.CUSTOMER,
			PUBLIC,
			flLibrary.Layer.USER
		],
		ROUTES: {
			CHANGES: ApplyConnector.ROOT + "/changes",
			SETTINGS: ApplyConnector.ROOT + "/settings",
			TOKEN: ApplyConnector.ROOT + "/settings"
		},
		update: function (mPropertyBag) {
			// public comp variants are save as customer layer and must be handle with the v1 route, because the backend has some extra logic, e.g. version
			if (mPropertyBag.flexObject && mPropertyBag.flexObject.layer === flLibrary.Layer.CUSTOMER && mPropertyBag.flexObject.fileType === "variant") {
				mPropertyBag.flexObject.layer = PUBLIC;
			}
			return KeyUserConnector.update.call(this, mPropertyBag);
		},
		write: function (mPropertyBag) {
			// public comp variants are save as customer layer and must be handle with the v1 route, because the backend has some extra logic, e.g. version
			if (mPropertyBag.flexObjects.length && mPropertyBag.flexObjects[0].layer === flLibrary.Layer.CUSTOMER && mPropertyBag.flexObjects[0].fileType === "variant") {
				mPropertyBag.flexObjects[0].layer = PUBLIC;
			}
			return KeyUserConnector.write.call(this, mPropertyBag);
		}
	});
	BtpServiceConnector.initialConnector = ApplyConnector;
	return BtpServiceConnector;
});