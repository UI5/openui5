/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/Log",
	"sap/ui/rta/plugin/rename/RenameDialog",
	"sap/ui/rta/plugin/Plugin"
], function(
	Log,
	RenameDialog,
	Plugin
) {
	"use strict";

	/**
	 * Constructor for a new Rename.
	 *
	 * @param {string}
	 *          [sId] id for the new object, generated automatically if no id is given
	 * @param {object}
	 *          [mSettings] initial settings for the new object
	 *
	 * @class The Rename allows to create a set of Overlays above the root elements and their public children and manage
	 *        their events.
	 * @extends sap.ui.rta.plugin.Plugin
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @since 1.30
	 * @alias sap.ui.rta.plugin.Rename
	 */
	var Rename = Plugin.extend("sap.ui.rta.plugin.Rename", /** @lends sap.ui.rta.plugin.Rename.prototype */ {
		metadata: {
			library: "sap.ui.rta",
			properties: {
				oldValue: "string"
			},
			associations: {},
			events: {
				/*
				 * Fired when renaming is possible
				*/
				editable: {},

				/**
				 * Fired when renaming is switched off
				 */
				nonEditable: {}
			}
		}
	});

	Rename.prototype.init = function(...aArgs) {
		Plugin.prototype.init.apply(this, aArgs);
		this._oDialog = new RenameDialog();
	};

	/**
	 * @override
	 */
	Rename.prototype.handler = async function(aElementOverlays, mPropertyBag) {
		const aSelectedOverlays = this.getSelectedOverlays();
		const [oOverlay] = aSelectedOverlays?.length > 0 ? aSelectedOverlays : aElementOverlays;
		const sNewText = await this._oDialog.openDialogAndHandleRename({
			overlay: oOverlay,
			action: mPropertyBag.menuItem.action
		});
		if (sNewText) {
			this.createCommands(oOverlay, { newValue: sNewText });
		}
	};

	/**
	 * Returns the parameters that a programmatic consumer must provide to create the commands for this plugin.
	 * @returns {object[]} List of parameter descriptors (name, type, required, description)
	 * @since 1.153
	 */
	Rename.prototype.getParameters = function() {
		return [
			{ name: "newValue", type: "string", required: true, description: "The new label / text for the element" }
		];
	};

	/**
	 * Creates the rename command for the given new value.
	 * @param {sap.ui.dt.ElementOverlay} oOverlay - Target overlay
	 * @param {object} mParameters - Parameters as described by {@link #getParameters}
	 * @returns {Promise} Resolves once the command has been created and the event has been fired
	 * @since 1.153
	 */
	Rename.prototype.createCommands = function(oOverlay, mParameters) {
		return this.createRenameCommand(oOverlay, mParameters.newValue);
	};

	/**
	 * @override
	 */
	Rename.prototype._isEditable = function(oOverlay) {
		return this._checkChangeHandlerAndStableId(oOverlay);
	};

	Rename.prototype.createRenameCommand = function(oElementOverlay, sNewText) {
		var oResponsibleElementOverlay = this.getResponsibleElementOverlay(oElementOverlay);
		var oRenamedElement = oResponsibleElementOverlay.getElement();
		var oDesignTimeMetadata = oResponsibleElementOverlay.getDesignTimeMetadata();
		var sVariantManagementReference = this.getVariantManagementReference(oResponsibleElementOverlay);

		return this.getCommandFactory().getCommandFor(oRenamedElement, "rename", {
			renamedElement: oRenamedElement,
			newValue: sNewText
		}, oDesignTimeMetadata, sVariantManagementReference)

		.then(function(oRenameCommand) {
			this.fireElementModified({
				command: oRenameCommand
			});
		}.bind(this))

		.catch(function(oError) {
			Log.error("Error during rename: ", oError);
		});
	};

	/**
	 * @override
	 */
	Rename.prototype.getMenuItems = function(vElementOverlays) {
		return this._getMenuItems(vElementOverlays, {
			pluginId: "CTX_RENAME",
			icon: "sap-icon://edit",
			description: "rename an element"
		});
	};

	/**
	 * @override
	 */
	Rename.prototype.getActionName = function() {
		return "rename";
	};

	Rename.prototype.destroy = function(...args) {
		Plugin.prototype.destroy.apply(this, args);
		this._oDialog.destroy();
		delete this._oDialog;
	};

	return Rename;
});