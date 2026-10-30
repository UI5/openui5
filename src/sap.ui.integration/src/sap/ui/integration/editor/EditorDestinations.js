/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/Log",
	"sap/base/util/merge",
	"sap/ui/model/json/JSONModel",
	"sap/ui/integration/util/Destinations"
], function (
	Log,
	merge,
	JSONModel,
	Destinations
) {
	"use strict";

	/**
	 * Destination management helper for the Editor control.
	 * Contains methods for initialising the destinations model and
	 * adding or removing destination settings in the designtime form.
	 *
	 * @namespace
	 * @alias sap.ui.integration.editor.EditorDestinations
	 * @static
	 * @private
	 */
	var EditorDestinations = {};

	/**
	 * Initialises the destinations model and the Destinations instance on the editor.
	 *
	 * @param {sap.ui.integration.editor.Editor} oEditor
	 * @param {string} [vHost] optional host ID
	 */
	EditorDestinations.initDestinations = function (oEditor, vHost) {
		oEditor._oDestinationsModel = new JSONModel({});
		oEditor.setModel(oEditor._oDestinationsModel, "destinations");
		var oHostInstance = oEditor.getHostInstance();

		if (vHost && !oHostInstance) {
			Log.error(
				"sap.ui.integration.editor.Editor: Host with id '" + vHost + "' is not available during editor initialization. It must be available for host specific features to work.",
				"Make sure that the host already exists, before assigning it to the editor.",
				"sap.ui.integration.editor.Editor"
			);
		}

		// use configurations of main manifest for destinations if current is child and useMainDestinations flag is true
		var sConfigurationPath = oEditor.getConfigurationPath();
		var sPrefix = "destinations";
		var oManifestConfig = oEditor._oManifestModel.getProperty(sConfigurationPath + "/destinations");
		const bUseMainDestinations = oEditor._oManifestModel.getProperty(sConfigurationPath + "/useMainDestinations") === true;

		if (oEditor.isChild && bUseMainDestinations) {
			sPrefix = "mainDestinations";
			oManifestConfig = oEditor._mainManifest.get(sConfigurationPath + "/destinations");
		}
		oEditor._oDestinations = new Destinations({
			host: oHostInstance,
			manifestConfig: oManifestConfig,
			prefix: sPrefix
		});
	};

	/**
	 * Adds additional settings for destinations section in admin mode and all mode.
	 *
	 * @param {sap.ui.integration.editor.Editor} oEditor
	 * @param {object} oConfiguration
	 * @param {sap.ui.integration.Designtime} oDesigntimeInstance
	 * @param {sap.ui.core.resource.ResourceBundle} oResourceBundle
	 */
	EditorDestinations.addDestinationSettings = function (oEditor, oConfiguration, oDesigntimeInstance, oResourceBundle) {
		var oSettings = oDesigntimeInstance.getSettings(),
			sBasePath = oEditor.getConfigurationPath() + "/destinations";
		oSettings.form = oSettings.form || {};
		oSettings.form.items = oSettings.form.items || {};
		if (oSettings && oConfiguration && oConfiguration.destinations) {
			oEditor._bDestinationGroupAtTop = false;
			var oItems = oSettings.form.items,
				oDestinations = {},
				oHost = oEditor.getHostInstance();
			var oDestinationGroup = {
				label: oResourceBundle.getText("EDITOR_DESTINATIONS") || "Destinations",
				type: "group",
				expanded: true,
				visible: true,
				_settingspath: "/form/items/destination.group"
			};
			if (oItems["destination.group"]) {
				// if the 1st item is destination group, set oEditor._bDestinationGroupAtTop to true. Then render destination group at top
				oEditor._bDestinationGroupAtTop = Object.keys(oItems)[0] === "destination.group";
				oDestinationGroup = merge(oDestinationGroup, oItems["destination.group"]);
				delete oItems["destination.group"];
			}
			oDestinations["destination.group"] = oDestinationGroup;
			Object.keys(oConfiguration.destinations).forEach(function (n) {
				var oDestination = merge({
					manifestpath: sBasePath + "/" + n + "/name", //destination points to name not value
					visible: true,
					type: "destination",
					editable: true,
					allowDynamicValues: false,
					allowSettings: false,
					value: oConfiguration.destinations[n].name,
					defaultValue: oConfiguration.destinations[n].defaultUrl,
					_settingspath: "/form/items/" + [n + ".destination"],
					_values: [],
					_destinationName: n
				}, oConfiguration.destinations[n]);
				if (typeof oDestination.label === "undefined") {
					oDestination.label = n;
				}
				if (oItems[n + ".destination"]) {
					oDestination = merge(oDestination, oItems[n + ".destination"]);
					delete oItems[n + ".destination"];
				}
				oDestinations[n + ".destination"] = oDestination;
			});
			// reorder the items according by oEditor._bDestinationGroupAtTop
			if (oEditor._bDestinationGroupAtTop) {
				oSettings.form.items = merge(oDestinations, oItems);
			} else {
				oSettings.form.items = merge(oItems, oDestinations);
			}
			var getDestinationsDone = false;
			if (oHost) {
				oEditor._oDestinationsModel.setProperty("/_loading", true);
				oEditor._oDestinationsModel.checkUpdate(true);
				oEditor.getHostInstance().getDestinations().then(function (a) {
					getDestinationsDone = true;
					oEditor._oDestinationsModel.setProperty("/_values", a);
					oEditor._oDestinationsModel.setProperty("/_loading", false);
					oEditor._oDestinationsModel.setSizeLimit(a.length);
					oEditor._oDestinationsModel.checkUpdate(true);
					setTimeout(function () {
						oEditor.fireDestinationReady();
					}, 100);
				}).catch(function () {
					//Fix DIGITALWORKPLACE-4359, retry once for the timeout issue
					return oEditor.getHostInstance().getDestinations();
				}).then(function (b) {
					if (getDestinationsDone) {
						return;
					}
					oEditor._oDestinationsModel.setProperty("/_values", b);
					oEditor._oDestinationsModel.setProperty("/_loading", false);
					oEditor._oDestinationsModel.setSizeLimit(b.length);
					oEditor._oDestinationsModel.checkUpdate(true);
					setTimeout(function () {
						oEditor.fireDestinationReady();
					}, 100);
				}).catch(function (e) {
					oEditor._oDestinationsModel.setProperty("/_loading", false);
					oEditor._oDestinationsModel.checkUpdate(true);
					setTimeout(function () {
						oEditor.fireDestinationReady();
					}, 100);
					Log.error("sap.ui.integration.editor.Editor: can not get destinations list from '" + oHost.getId() + "'.");
				});
			}
		}
	};

	/**
	 * Deletes destination settings if mode is NOT admin or all.
	 *
	 * @param {sap.ui.integration.Designtime} oDesigntimeInstance
	 */
	EditorDestinations.deleteDestinationSettings = function (oDesigntimeInstance) {
		var oSettings = oDesigntimeInstance.getSettings();
		oSettings.form = oSettings.form || {};
		oSettings.form.items = oSettings.form.items || {};
		delete oSettings.form.items["destination.group"];
		for (var n in oSettings.form.items) {
			var oItem = oSettings.form.items[n];
			if (oItem.type === "destination") {
				delete oSettings.form.items[n];
			}
		}
	};

	return EditorDestinations;

});
