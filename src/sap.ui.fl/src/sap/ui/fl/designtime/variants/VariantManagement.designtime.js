/*!
 * ${copyright}
 */

// Provides the Design Time Metadata for the sap.ui.fl.variants.VariantManagement control.
sap.ui.define([
	"sap/ui/core/Lib",
	"sap/ui/fl/apply/api/ControlVariantApplyAPI",
	"sap/ui/fl/Utils"
], function(
	Lib,
	ControlVariantApplyAPI,
	flUtils
) {
	"use strict";

	async function fnSetControlAttributes(oVariantManagement, bDesignTimeMode) {
		var oAppComponent = flUtils.getAppComponentForControl(oVariantManagement);
		var sControlId = oVariantManagement.getId();
		var oModel = oAppComponent.getModel(ControlVariantApplyAPI.getVariantModelName());
		var sVariantManagementReference = oAppComponent.getLocalId(sControlId) || sControlId;

		if (!oModel) {
			return;
		}

		if (bDesignTimeMode) {
			await oVariantManagement.waitForInit();
		}
		oModel.setModelPropertiesForControl(sVariantManagementReference, bDesignTimeMode, oVariantManagement);
		oModel.checkUpdate(true);
	}

	return {
		annotations: {},
		properties: {
			showSetAsDefault: {
				ignore: false
			},
			inErrorState: {
				ignore: false
			},
			editable: {
				ignore: false
			},
			modelName: {
				ignore: false
			},
			updateVariantInURL: {
				ignore: true
			},
			resetOnContextChange: {
				ignore: true
			},
			executeOnSelectionForStandardDefault: {
				ignore: false
			},
			displayTextForExecuteOnSelectionForStandardVariant: {
				ignore: false
			},
			headerLevel: {
				ignore: false
			}
		},
		variantRenameDomRef(oVariantManagement) {
			return oVariantManagement.getTitle().getDomRef("inner");
		},
		customData: {},
		tool: {
			start(oVariantManagement) {
				// In personalization mode the variant management overlay cannot be selected
				var bDesignTimeMode = true;
				fnSetControlAttributes(oVariantManagement, bDesignTimeMode);
				oVariantManagement.enteringDesignMode();
			},
			stop(oVariantManagement) {
				var bDesignTimeMode = false;
				fnSetControlAttributes(oVariantManagement, bDesignTimeMode);
				oVariantManagement.leavingDesignMode();
			}
		},
		actions: {
			controlVariant(oVariantManagement) {
				return {
					validators: [
						"noEmptyText",
						{
							validatorFunction(sNewText) {
								// Avoid duplicate titles
								return !oVariantManagement.getVariants().some(function(oVariant) {
									if (oVariant.getKey() === oVariantManagement.getCurrentVariantReference()) {
										return false;
									}
									return sNewText.toLowerCase() === oVariant.getTitle().toLowerCase() && oVariant.getVisible();
								});
							},
							errorMessage: Lib.getResourceBundleFor("sap.m").getText("VARIANT_MANAGEMENT_ERROR_DUPLICATE")
						}
					]
				};
			}
		},
		name: {
			singular: "CTX_VM_NAME_SINGULAR",
			plural: "CTX_VM_NAME_PLURAL"
		}
	};
});