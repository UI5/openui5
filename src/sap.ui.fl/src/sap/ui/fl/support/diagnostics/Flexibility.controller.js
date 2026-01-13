/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function(
	Controller
) {
	"use strict";

	/**
	 * Controller for the flexibility diagnostics view.
	 *
	 * @constructor
	 * @alias sap.ui.fl.support.diagnostics.Flexibility
	 * @author SAP SE
	 * @version ${version}
	 */
	return Controller.extend("sap.ui.fl.support.diagnostics.Flexibility", {
		onDownloadPress() {
			const oFlexToolSettingsModel = this.getView().getModel("flexToolSettings");
			const bAnonymizeData = oFlexToolSettingsModel.getProperty("/anonymizeData");
			const bExportFullData = oFlexToolSettingsModel.getProperty("/exportFullData");
			const oFlexibilityPlugin = this.getView().getViewData().plugin;
			// The download is handled by the plugin
			oFlexibilityPlugin.sendGetDataEvent(bAnonymizeData, bExportFullData);
		}
	});
});