
/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/util/isEmptyObject",
	"sap/base/Log",
	"sap/m/MessageBox",
	"sap/ui/core/mvc/XMLView",
	"sap/ui/core/support/Plugin",
	"sap/ui/core/support/Support",
	"sap/ui/core/util/File",
	"sap/ui/fl/support/diagnostics/FlexibilityDataExtractor",
	"sap/ui/model/json/JSONModel"
], function(
	isEmptyObject,
	Log,
	MessageBox,
	XMLView,
	Plugin,
	Support,
	File,
	FlexibilityDataExtractor,
	JSONModel
) {
	"use strict";

	/**
	 *
	 * @class This class represents a plugin for flexibility in the diagnostics tool.
	 * The diagnostics dialog renders the UI and creates a model to hold the flexibility data and the tool settings.
	 * On the application side, data is collected and sent to the diagnostics dialog.
	 * Events are sent between the two plugin instances through the support stub for communication.
	 *
	 * This class is internal, and none of its functions should be used by an application.
	 *
	 * @abstract
	 * @extends sap.ui.core.support.Plugin
	 * @version ${version}
	 * @private
	 * @ui5-restricted
	 * @constructor
	 */
	const FlexibilityPlugin = Plugin.extend("sap.ui.fl.support.diagnostics.FlexibilityPlugin", {
		constructor: function(oSupportStub) {
			Plugin.apply(this, ["sapUiSupportFlexibilityPlugin", "Flexibility", oSupportStub]);
			this._oStub = oSupportStub;
			// Define the events to listen to depending on whether the plugin runs in the tool window or the application window
			if (this.runsAsToolPlugin()) {
				this._aEventIds = [
					`${this.getId()}SetData`
				];
			} else {
				this._aEventIds = [
					`${this.getId()}GetData`
				];
			}
		}
	});

	/**
	 * Rendering the tool plugin side of the UI.
	 * This creates a plain HTML-rendered header and a placeholder for the XML view.
	 */
	async function renderToolPlugin() {
		this.oView = await XMLView.create({
			viewName: "sap.ui.fl.support.diagnostics.Flexibility",
			viewData: {
				plugin: this
			}
		});
		this.oView.placeAt(this.$().get(0));
		this.oView.setModel(this.oFlexDataModel, "flexData");
		this.oView.setModel(this.oToolSettingsModel, "flexToolSettings");
	}

	/**
	 * Creation of the support plugin.
	 *
	 * @param {sap.ui.core.support.Support} oSupportStub - Support instance used as a stub for communication between the diagnostics tool and the application
	 */
	FlexibilityPlugin.prototype.init = function(oSupportStub, ...aArgs) {
		Plugin.prototype.init.apply(this, [oSupportStub, ...aArgs]);
		// isToolStub() returns true when running in the diagnostics tool window
		if (oSupportStub.isToolStub()) {
			this.oFlexDataModel = new JSONModel();
			this.oToolSettingsModel = new JSONModel({
				anonymizeData: true,
				exportFullData: true
			});
			renderToolPlugin.call(this);
		}
	};

	/**
	 * Sends an event to the application plugin requesting the collection of flexibility data.
	 * @param {boolean} bAnonymizeData - Whether user-related data should be anonymized
	 * @param {boolean} bExportFullData - Whether a full data set should be exported instead of a reduced one
	 */
	FlexibilityPlugin.prototype.sendGetDataEvent = function(bAnonymizeData, bExportFullData) {
		Support.getStub().sendEvent(
			`${this.getId()}GetData`,
			{
				anonymizeData: bAnonymizeData,
				exportFullData: bExportFullData
			}
		);
	};

	/**
	 * Collects flex data (called on the application).
	 * @param {sap.ui.base.Event} oEvent - Event sent from the diagnostics tool requesting the flex data
	 */
	FlexibilityPlugin.prototype.onsapUiSupportFlexibilityPluginGetData = async function(oEvent) {
		try {
			const bAnonymizeData = oEvent.getParameter("anonymizeData");
			const bExportFullData = oEvent.getParameter("exportFullData");
			const oFlexData = await FlexibilityDataExtractor.extractFlexibilityData(
				bAnonymizeData,
				bExportFullData
			);
			// Send the data back to the tool
			this._oStub.sendEvent(`${this.getId()}SetData`, oFlexData);
		} catch (oError) {
			MessageBox.error("Flexibility data could not be retrieved");
			Log.error("Error extracting flexibility data: ", oError);
		}
	};

	/**
	 * The diagnostics plugin handler transfers data from the application plugin to a model,
	 * enabling download.
	 *
	 * @param {sap.ui.base.Event} oEvent - Event sent from the application plugin with the flex data
	 */
	FlexibilityPlugin.prototype.onsapUiSupportFlexibilityPluginSetData = function(oEvent) {
		const oFlexData = oEvent.getParameters();
		// Setting the data in the model makes it serializable for download
		this.oFlexDataModel.setData(oFlexData);
		const oData = this.oFlexDataModel.getData();
		if (isEmptyObject(oData)) {
			MessageBox.error("Flexibility data could not be retrieved");
			return;
		}

		// Download the data as JSON file
		try {
			const sDataStr = JSON.stringify(oData, null, 2);
			File.save(sDataStr, "flexibilitySupportData", "json");
		} catch (oError) {
			MessageBox.error("Error downloading flexibility support data");
		}
	};

	FlexibilityPlugin.prototype.exit = function(...aArgs) {
		this.oView?.destroy();
		this.oFlexDataModel?.destroy();
		this.oToolSettingsModel?.destroy();
		Plugin.prototype.exit.apply(this, aArgs);
	};

	return FlexibilityPlugin;
});