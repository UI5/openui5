/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/fl/apply/api/FlexRuntimeInfoAPI",
	"sap/ui/fl/variants/VariantManager",
	"sap/ui/rta/command/BaseCommand"
], function(
	FlexRuntimeInfoAPI,
	VariantManager,
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
		this._aControlChanges = VariantManager.getControlChangesForVariant(
			this.sFlexReference,
			oVMControl.getVariantManagementReference(),
			oVMControl.getCurrentVariantKey()
		);
		this._aDirtyChanges = VariantManager.getDirtyChangesFromVariantChanges(this._aControlChanges, this.sFlexReference);
		this._aDirtyChanges.forEach((oChange) => {
			if (oChange.getFileType() === "change") {
				oChange.setSavedToVariant(true);
			}
		});
		VariantManager.updateVariantManagementMap(this.sFlexReference);
		return Promise.resolve();
	};

	/**
	 * Undo logic for the execution.
	 * @public
	 * @returns {Promise} Returns resolve after undo
	 */
	ControlVariantSave.prototype.undo = function() {
		this._aDirtyChanges.forEach(function(oChange) {
			if (oChange.getFileType() === "change") {
				oChange.setSavedToVariant(false);
			}
		});
		VariantManager.updateVariantManagementMap(this.sFlexReference);
		return Promise.resolve();
	};

	return ControlVariantSave;
});
