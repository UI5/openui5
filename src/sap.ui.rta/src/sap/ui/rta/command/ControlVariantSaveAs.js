/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/fl/apply/api/FlexRuntimeInfoAPI",
	"sap/ui/fl/variants/VariantManager",
	"sap/ui/fl/write/api/ContextSharingAPI",
	"sap/ui/fl/write/api/PersistenceWriteAPI",
	"sap/ui/fl/Utils",
	"sap/ui/rta/command/BaseCommand",
	"sap/ui/rta/library",
	"sap/ui/rta/Utils"
], function(
	FlexRuntimeInfoAPI,
	VariantManager,
	ContextSharingAPI,
	PersistenceWriteAPI,
	FlUtils,
	BaseCommand,
	rtaLibrary,
	rtaUtils
) {
	"use strict";

	/**
	 * Saves a control variant under a different name.
	 *
	 * @class
	 * @extends sap.ui.rta.command.BaseCommand
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @private
	 * @since 1.86
	 * @alias sap.ui.rta.command.ControlVariantSaveAs
	 */
	const ControlVariantSaveAs = BaseCommand.extend("sap.ui.rta.command.ControlVariantSaveAs", {
		metadata: {
			library: "sap.ui.rta",
			properties: {
				sourceVariantReference: {
					type: "string"
				},
				sourceDefaultVariant: {
					type: "string"
				},
				newVariantParameters: {
					type: "object"
				}
			},
			associations: {},
			events: {}
		}
	});

	/**
	 * @override
	 */
	ControlVariantSaveAs.prototype.prepare = async function(mFlexSettings) {
		this.oVariantManagementControl = this.getElement();
		this.oAppComponent = FlUtils.getAppComponentForControl(this.oVariantManagementControl);
		this.sVariantManagementReference = this.oVariantManagementControl.getVariantManagementReference();
		this.setSourceDefaultVariant(this.oVariantManagementControl.getDefaultVariantKey());
		this.sLayer = mFlexSettings.layer;
		const mComponentPropertyBag = mFlexSettings;
		mComponentPropertyBag.variantManagementControl = this.oVariantManagementControl;

		function storeEventParameters(oEvent, oArgs) {
			const mParameters = oEvent.getParameters();
			this.setNewVariantParameters(mParameters);
			this.oVariantManagementControl.detachSave(storeEventParameters, this);
			this.oVariantManagementControl.detachCancel(handleCancel, this);
			oArgs.resolve(true);
		}
		function handleCancel(oEvent, oArgs) {
			this.oVariantManagementControl.detachSave(storeEventParameters, this);
			this.oVariantManagementControl.detachCancel(handleCancel, this);
			oArgs.resolve(false);
		}

		const bState = await new Promise((resolve) => {
			this.oVariantManagementControl.attachSave({ resolve }, storeEventParameters, this);
			this.oVariantManagementControl.attachCancel({ resolve }, handleCancel, this);
			this.oVariantManagementControl.openSaveAsDialogForKeyUser(
				rtaUtils.getRtaStyleClassName(),
				ContextSharingAPI.createComponent(mComponentPropertyBag)
			);
		});
		return bState;
	};

	ControlVariantSaveAs.prototype.getPreparedChange = function() {
		if (!this._aPreparedChanges) {
			return undefined;
		}
		return this._aPreparedChanges;
	};

	/**
	 * Triggers the SaveAs of a variant.
	 * @public
	 * @returns {Promise} Promise that resolves after execution
	 */
	ControlVariantSaveAs.prototype.execute = async function() {
		const sFlexReference = FlexRuntimeInfoAPI.getFlexReference({ element: this.oVariantManagementControl });
		this._aControlChangesWithoutVariant = VariantManager.getControlChangesForVariant(
			sFlexReference,
			this.sVariantManagementReference,
			this.getSourceVariantReference()
		).filter((oFlexObject) => !oFlexObject.getSavedToVariant());
		const mParams = this.getNewVariantParameters();
		mParams.layer = this.sLayer;
		mParams.newVariantReference = this.sNewVariantReference;
		mParams.generator = rtaLibrary.GENERATOR_NAME;
		const aDirtyChanges = await VariantManager.handleSaveEvent(this.oVariantManagementControl, mParams);
		this._aPreparedChanges = aDirtyChanges;
		[this._oVariantChange] = aDirtyChanges;
		this.sNewVariantReference = this._oVariantChange.getId();
		this._aPreparedChanges.forEach(function(oChange) {
			if (oChange.getFileType() === "change") {
				oChange.setSavedToVariant(true);
			}
		});
		VariantManager.updateVariantManagementMap(sFlexReference);
	};

	/**
	 * Undo logic for the execution.
	 * @public
	 * @returns {Promise} Resolves after undo
	 */
	ControlVariantSaveAs.prototype.undo = async function() {
		if (this._oVariantChange) {
			const aChangesToBeDeleted = [];
			this._aPreparedChanges.forEach((oChange) => {
				if (oChange.getFileType() === "ctrl_variant_management_change") {
					aChangesToBeDeleted.push(oChange);
				}
			});
			await PersistenceWriteAPI.remove({
				flexObjects: aChangesToBeDeleted,
				selector: this.oAppComponent
			});

			const mPropertyBag = {
				variant: this._oVariantChange,
				sourceVariantReference: this.getSourceVariantReference(),
				variantManagementReference: this.sVariantManagementReference,
				vmControl: this.getElement(),
				appComponent: this.oAppComponent
			};

			await VariantManager.removeVariant(mPropertyBag, true);
			await VariantManager.addAndApplyChangesOnVariant(this._aControlChangesWithoutVariant, this.oAppComponent);
			this._aPreparedChanges = null;
			this._oVariantChange = null;
		}
	};

	return ControlVariantSaveAs;
});
