/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/fl/apply/api/ControlVariantApplyAPI",
	"sap/ui/fl/apply/api/FlexRuntimeInfoAPI",
	"sap/ui/fl/write/api/ControlVariantWriteAPI",
	"sap/ui/fl/Utils",
	"sap/ui/rta/command/BaseCommand",
	"sap/ui/rta/library"
], function(
	ControlVariantApplyAPI,
	FlexRuntimeInfoAPI,
	ControlVariantWriteAPI,
	FlUtils,
	BaseCommand,
	rtaLibrary
) {
	"use strict";

	/**
	 * Configure control variants
	 *
	 * @class
	 * @extends sap.ui.rta.command.BaseCommand
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @private
	 * @since 1.52
	 * @alias sap.ui.rta.command.ControlVariantConfigure
	 */
	const ControlVariantConfigure = BaseCommand.extend("sap.ui.rta.command.ControlVariantConfigure", {
		metadata: {
			library: "sap.ui.rta",
			properties: {
				control: {
					type: "any"
				},
				changes: {
					type: "array"
				},
				deletedVariants: {
					type: "array"
				}
			},
			associations: {},
			events: {}
		}
	});

	/**
	 * @override
	 */
	ControlVariantConfigure.prototype.prepare = function(mFlexSettings) {
		this.sLayer = mFlexSettings.layer;
		return true;
	};

	ControlVariantConfigure.prototype.getPreparedChange = function() {
		if (!this._aPreparedChanges) {
			return undefined;
		}
		return this._aPreparedChanges;
	};

	/**
	 * Triggers the configuration of a variant.
	 * @public
	 * @returns {Promise} Returns resolve after execution
	 */
	ControlVariantConfigure.prototype.execute = async function() {
		const oVariantManagementControl = this.getControl();
		this.oAppComponent = FlUtils.getAppComponentForControl(oVariantManagementControl);
		this.sVariantManagementReference = oVariantManagementControl.getVariantManagementReference();
		const sFlexReference = FlexRuntimeInfoAPI.getFlexReference({ element: oVariantManagementControl });
		const sNewDefaultVariantReferenceParameter = ControlVariantWriteAPI.getVariantManagementReferenceForVariant(
			sFlexReference,
			this.sVariantManagementReference
		);

		this._aPreparedChanges = [];

		[
			this._aPreparedChanges,
			this._aDeletedFlexObjects,
			this._sOldVReference
		] = await ControlVariantWriteAPI.handleManageViewDialogExecution({
			vmReference: this.sVariantManagementReference,
			appComponent: this.oAppComponent,
			changeContents: this.getChanges(),
			vmControl: oVariantManagementControl,
			newDefaultVariantReferenceParameter: sNewDefaultVariantReferenceParameter,
			generatorName: rtaLibrary.GENERATOR_NAME,
			variantsToBeDeleted: this.getDeletedVariants(),
			layer: this.sLayer
		});

		return Promise.resolve();
	};

	function removeVariantChanges() {
		this.getChanges().forEach((mChangeProperties, index) => {
			const mPropertyBag = {
				appComponent: this.oAppComponent
			};
			Object.keys(mChangeProperties).forEach(function(sProperty) {
				const sOriginalProperty = `original${sProperty.charAt(0).toUpperCase()}${sProperty.substr(1)}`;
				if (sProperty === "visible") {
					mPropertyBag[sProperty] = true; /* visibility of the variant always set back to true on undo */
				} else if (mChangeProperties[sOriginalProperty]) {
					mPropertyBag[sProperty] = mChangeProperties[sOriginalProperty];
					mPropertyBag[sOriginalProperty] = mChangeProperties[sProperty];
				} else if (sProperty.indexOf("original") === -1) {
					mPropertyBag[sProperty] = mChangeProperties[sProperty];
				}
			});
			const oChange = this._aPreparedChanges[index];
			ControlVariantWriteAPI.deleteVariantChange(this.sVariantManagementReference, mPropertyBag, oChange);
		});
		this._aPreparedChanges = null;
	}

	async function reactivateOldVariantReference() {
		if (this._sOldVReference) {
			await ControlVariantApplyAPI.activateVariant({
				element: this.getControl(),
				variantReference: this._sOldVReference
			});
			delete this._sOldVReference;
		}
	}

	/**
	 * Undo logic for the execution.
	 * @public
	 * @returns {Promise} Returns resolve after undo
	 */
	ControlVariantConfigure.prototype.undo = async function() {
		// Restore deleted variants
		const sFlexReference = FlexRuntimeInfoAPI.getFlexReference({ element: this.getControl() });
		ControlVariantWriteAPI.restoreDeletedFlexObjects({
			reference: sFlexReference,
			flexObjects: this._aDeletedFlexObjects,
			componentId: this.oAppComponent.getId()
		});
		delete this._aDeletedFlexObjects;

		removeVariantChanges.call(this);

		await reactivateOldVariantReference.call(this);
	};

	return ControlVariantConfigure;
});
