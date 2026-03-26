/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/fl/write/api/ControlVariantWriteAPI",
	"sap/ui/rta/command/BaseCommand"
], function(
	ControlVariantWriteAPI,
	BaseCommand
) {
	"use strict";

	/**
	 * Saves a control variant.
	 *
	 * @class
	 * @extends sap.ui.rta.command.BaseCommand
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @private
	 * @since 1.86
	 * @alias sap.ui.rta.command.ControlVariantSave
	 */
	const ControlVariantSave = BaseCommand.extend("sap.ui.rta.command.ControlVariantSave", {
		metadata: {
			library: "sap.ui.rta",
			associations: {},
			events: {}
		}
	});

	/**
	 * Triggers the Save of a variant.
	 * @public
	 * @returns {Promise} Promise that resolves after execution
	 */
	ControlVariantSave.prototype.execute = function() {
		const oVMControl = this.getElement();
		this._aControlChanges = ControlVariantWriteAPI.getControlChangesForVariant({
			variantManagementControl: oVMControl,
			variantManagementReference: oVMControl.getVariantManagementReference(),
			variantReference: oVMControl.getCurrentVariantReference()
		});
		this._aDirtyChanges = ControlVariantWriteAPI.getDirtyControlChangesFromVariant({
			controlChanges: this._aControlChanges,
			variantManagementControl: oVMControl
		});
		ControlVariantWriteAPI.setSavedToVariant({
			variantManagementControl: oVMControl,
			changes: this._aDirtyChanges,
			setSavedToVariant: true
		});
		return Promise.resolve();
	};

	/**
	 * Undo logic for the execution.
	 * @public
	 * @returns {Promise} Returns resolve after undo
	 */
	ControlVariantSave.prototype.undo = function() {
		const oVMControl = this.getElement();
		ControlVariantWriteAPI.setSavedToVariant({
			variantManagementControl: oVMControl,
			changes: this._aDirtyChanges,
			setSavedToVariant: false
		});
		return Promise.resolve();
	};

	return ControlVariantSave;
});
