/*!
 * ${copyright}
 */

// Provides the Design Time Metadata for the sap.ui.fl.variants.VariantManagement control.
sap.ui.define([
	"sap/ui/core/Lib"
], function(
	Lib
) {
	"use strict";

	async function fnSetControlAttributes(oVariantManagement, bDesignTimeMode) {
		const oModel = oVariantManagement.getVariantModel();

		if (bDesignTimeMode) {
			await oVariantManagement.waitForInit();
		}
		oModel.setModelPropertiesForControl(bDesignTimeMode);
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
				oVariantManagement.getVariantModel()._getURLHandler()?.setDesigntimeMode(true);
				fnSetControlAttributes(oVariantManagement, true);
				oVariantManagement.enteringDesignMode();
			},
			stop(oVariantManagement) {
				oVariantManagement.getVariantModel()._getURLHandler()?.setDesigntimeMode(false);
				fnSetControlAttributes(oVariantManagement, false);
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