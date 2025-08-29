/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/fl/apply/api/ControlVariantApplyAPI",
	"sap/ui/fl/variants/VariantManager",
	"sap/ui/fl/Utils",
	"sap/ui/rta/command/BaseCommand"
], function(
	ControlVariantApplyAPI,
	VariantManager,
	flUtils,
	BaseCommand
) {
	"use strict";

	/**
	 * Switch control variants
	 *
	 * @class
	 * @extends sap.ui.rta.command.BaseCommand
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @private
	 * @since 1.50
	 * @alias sap.ui.rta.command.ControlVariantSwitch
	 */
	const ControlVariantSwitch = BaseCommand.extend("sap.ui.rta.command.ControlVariantSwitch", {
		metadata: {
			library: "sap.ui.rta",
			properties: {
				targetVariantReference: {
					type: "string"
				},
				sourceVariantReference: {
					type: "string"
				},
				discardVariantContent: {
					type: "boolean"
				},
				/**
				 * Discarded changes when user switches from a dirty variant choosing "discard"
				 */
				discardedChanges: {
					type: "array"
				}
			},
			associations: {},
			events: {}
		},
		// eslint-disable-next-line object-shorthand
		constructor: function(...aArgs) {
			BaseCommand.apply(this, aArgs);
			this.setRelevantForSave(false);
		}
	});

	async function discardVariantContent(sVReference) {
		const aDirtyChanges = await VariantManager.eraseDirtyChangesOnVariant(
			this.sVariantManagementReference,
			sVReference,
			this.getElement()
		);
		this.setDiscardedChanges(aDirtyChanges);
	}

	/**
	 * Template Method to implement execute logic, with ensure precondition Element is available.
	 *
	 * @public
	 * @returns {Promise} Returns resolve after execution
	 */
	ControlVariantSwitch.prototype.execute = async function() {
		const oElement = this.getElement();
		const sNewVariantReference = this.getTargetVariantReference();
		this.sVariantManagementReference = oElement.getVariantManagementReference();

		if (this.getDiscardVariantContent()) {
			await discardVariantContent.call(this, this.getSourceVariantReference());
		}
		this._updateVariant(sNewVariantReference);
	};

	/**
	 * Template Method to implement undo logic.
	 * @public
	 * @returns {Promise} Returns resolve after undo
	 */
	ControlVariantSwitch.prototype.undo = async function() {
		const sSourceVariantReference = this.getSourceVariantReference();

		await this._updateVariant(sSourceVariantReference);
		// When discarding, dirty changes on source variant need to be applied AFTER the switch
		if (this.getDiscardVariantContent()) {
			await VariantManager.addAndApplyChangesOnVariant(this.getDiscardedChanges(), this.getElement());
			this.setDiscardedChanges([]);
		}
	};

	ControlVariantSwitch.prototype._updateVariant = async function(sVariantReference) {
		if (this.getTargetVariantReference() !== this.getSourceVariantReference()) {
			await ControlVariantApplyAPI.activateVariant({
				element: this.getElement(),
				variantReference: sVariantReference
			});
		}
	};

	return ControlVariantSwitch;
});
