/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/fl/variants/VariantManager",
	"sap/ui/fl/Utils",
	"sap/ui/rta/command/BaseCommand",
	"sap/ui/rta/library"
], function(
	VariantManager,
	flUtils,
	BaseCommand,
	rtaLibrary
) {
	"use strict";

	/**
	 * Rename control variants
	 *
	 * @class
	 * @extends sap.ui.rta.command.BaseCommand
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @private
	 * @since 1.50
	 * @alias sap.ui.rta.command.ControlVariantSetTitle
	 */
	const ControlVariantSetTitle = BaseCommand.extend("sap.ui.rta.command.ControlVariantSetTitle", {
		metadata: {
			library: "sap.ui.rta",
			properties: {
				oldText: {
					type: "string"
				},
				newText: {
					type: "string"
				}
			},
			associations: {},
			events: {}
		}
	});

	/**
	 * @override
	 */
	ControlVariantSetTitle.prototype.prepare = function(mFlexSettings) {
		this.sLayer = mFlexSettings.layer;
		return true;
	};

	ControlVariantSetTitle.prototype.getPreparedChange = function() {
		this._oPreparedChange = this.getVariantChange();
		if (!this._oPreparedChange) {
			return undefined;
		}
		return this._oPreparedChange;
	};

	/**
	 * Template Method to implement execute logic, with ensure precondition Element is available.
	 * @public
	 * @returns {Promise} Returns resolve after execution
	 */
	ControlVariantSetTitle.prototype.execute = async function() {
		const oVariantManagementControl = this.getElement();

		this.oAppComponent = flUtils.getAppComponentForControl(oVariantManagementControl);
		this.sVariantManagementReference = oVariantManagementControl.getVariantManagementReference();
		this.sCurrentVariantKey = oVariantManagementControl.getCurrentVariantKey();

		const sCurrentTitle = oVariantManagementControl.getVariantByKey(this.sCurrentVariantKey).getTitle();
		this.setOldText(sCurrentTitle);

		const mPropertyBag = {
			appComponent: this.oAppComponent,
			variantReference: this.sCurrentVariantKey,
			changeType: "setTitle",
			title: this.getNewText(),
			layer: this.sLayer,
			generator: rtaLibrary.GENERATOR_NAME
		};

		this._oVariantChange = await VariantManager.addVariantChange(this.sVariantManagementReference, mPropertyBag);
	};

	/**
	 * Template Method to implement undo logic.
	 * @public
	 * @returns {Promise} Returns resolve after undo
	 */
	ControlVariantSetTitle.prototype.undo = async function() {
		const mPropertyBag = {
			variantReference: this.sCurrentVariantKey,
			changeType: "setTitle",
			title: this.getOldText(),
			appComponent: this.oAppComponent
		};

		await VariantManager.deleteVariantChange(this.sVariantManagementReference, mPropertyBag, this._oVariantChange);
		this._oVariantChange = null;
	};

	return ControlVariantSetTitle;
});
