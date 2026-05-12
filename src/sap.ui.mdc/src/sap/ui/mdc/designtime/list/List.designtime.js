/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/m/p13n/Engine", "sap/ui/mdc/List", "../Util"
], (Engine, List, Util) => {
	"use strict";

	const oDesignTime = {
		name: {
			singular: "LIST_NAME",
			plural: "LIST_NAME_PLURAL"
		},
		description: "{description}",
		actions: {
			settings: {
				"sap.ui.mdc": function(oControl) {
					const bIsGlobal = Engine.getInstance()._getKeyUserPersistence(oControl);
					return {
						name: "p13nDialog.VIEW_SETTINGS",
						handler: function(oControl, mPropertyBag) {
							return oControl.finalizePropertyHelper().then(() => {
								return Engine.getInstance().getRTASettingsActionHandler(oControl, mPropertyBag, oControl.getActiveP13nModes());
							});
						},
						CAUTION_variantIndependent: bIsGlobal
					};
				}
			}
		},
		properties: {},
		aggregations: {
			_content: {
				domRef: ":sap-domref",
				propagateMetadata: function(oElement) {
					if (oElement.isA("sap.ui.fl.variants.VariantManagement") ||
						oElement.isA("sap.ui.mdc.ActionToolbar") ||
						oElement.isA("sap.ui.mdc.actiontoolbar.ActionToolbarAction") ||
						oElement.isA("sap.ui.mdc.Field") ||
						(oElement.getParent() &&
							(oElement.getParent().isA("sap.ui.mdc.actiontoolbar.ActionToolbarAction") ||
								oElement.getParent().isA("sap.ui.mdc.Field")))) {
						return null;
					}

					return {
						actions: "not-adaptable"
					};
				}
			}
		}
	};

	const aAllowedProperties = [
		"header",
		"headerVisible",
		"headerLevel",
		"showItemCount",
		"enableExport"
	],
		aAllowedAggregations = [
			"_content"
		];

	return Util.getDesignTime(List, aAllowedProperties, aAllowedAggregations, oDesignTime);

});
