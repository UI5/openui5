/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/fl/write/api/ControlVariantWriteAPI",
	"sap/ui/fl/apply/api/FlexRuntimeInfoAPI",
	"sap/ui/rta/command/BaseCommand"
], function(
	ControlVariantWriteAPI,
	FlexRuntimeInfoAPI,
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
		this.sFlexReference = FlexRuntimeInfoAPI.getFlexReference({ element: oVMControl });
		this._aControlChanges = ControlVariantWriteAPI.getControlChangesForVariant(
			this.sFlexReference,
			oVMControl.getVariantManagementReference(),
			oVMControl.getCurrentVariantReference()
		);
		this._aDirtyChanges = ControlVariantWriteAPI.getDirtyControlChangesFromVariant(this._aControlChanges, this.sFlexReference);
		ControlVariantWriteAPI.setSavedToVariant(this.sFlexReference, this._aDirtyChanges, true);
		return Promise.resolve();
	};

	/**
	 * Undo logic for the execution.
	 * @public
	 * @returns {Promise} Returns resolve after undo
	 */
	ControlVariantSave.prototype.undo = function() {
		ControlVariantWriteAPI.setSavedToVariant(this.sFlexReference, this._aDirtyChanges, false);
		return Promise.resolve();
	};

	return ControlVariantSave;
});
