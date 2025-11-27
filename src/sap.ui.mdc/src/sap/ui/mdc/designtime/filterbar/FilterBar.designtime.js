/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/m/p13n/Engine",
	"sap/ui/core/Lib"
], ( Engine, Library) => {
	"use strict";

	return {
		actions: {
			settings: {
				"sap.ui.mdc": function(oControl) {
					const bIsGlobal = Engine.getInstance()._getKeyUserPersistence(oControl);
					return {
						name: function() {
							return Library.getResourceBundleFor("sap.ui.mdc").getText("filterbar.ADAPT_TITLE");
						},
						handler: function (oControl, mPropertyBag) {
							//CHECK: move metadata finalizing to Engine?
							return oControl.initializedWithMetadata().then(() => {
								return Engine.getInstance().getRTASettingsActionHandler(oControl, mPropertyBag, "Item");
							});
						},
						CAUTION_variantIndependent: bIsGlobal
					};
				}
			}
		},
		aggregations: {
			layout: {
				ignore: true
			},
			basicSearchField: {
				ignore: true
			},
			filterItems: {
				ignore: true
			}
		},
		properties: {
			showAdaptFiltersButton: {
				ignore: false
			},
			showClearButton: {
				ignore: false
			},
			p13nMode: {
				ignore: false
			}
		}
	};
});