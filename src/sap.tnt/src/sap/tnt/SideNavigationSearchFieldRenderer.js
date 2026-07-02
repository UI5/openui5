/*!
 * ${copyright}
 */

sap.ui.define(["sap/ui/core/Renderer",
		"sap/ui/core/InvisibleText",
		"sap/m/SearchFieldRenderer"],
	function(Renderer,
			 InvisibleText,
			 SearchFieldRenderer) {
		"use strict";

		const ARIA_LABELLEDBY_ID = InvisibleText.getStaticId("sap.tnt", "SIDE_NAVIGATION_SEARCH_LABEL");
		const ARIA_DESCRIBEDBY_ID = InvisibleText.getStaticId("sap.tnt", "SIDE_NAVIGATION_SEARCH_DESCRIPTION");


		/**
		 * SideNavigationSearchField renderer.
		 *
		 * SideNavigationSearchFieldRenderer extends the SearchFieldRenderer
		 * @namespace
		 * @alias sap.tnt.SideNavigationSearchFieldRenderer
		 */
		const SideNavigationSearchFieldRenderer = Renderer.extend(SearchFieldRenderer);
		SideNavigationSearchFieldRenderer.apiVersion = 2;

		SideNavigationSearchFieldRenderer._accessibilityState = function (rm, oSF, oAccAttributes) {
			const aAriaLabelledBy = oSF.getAriaLabelledBy();
			const aAriaDescribedBy = oSF.getAriaDescribedBy();

			if (!aAriaLabelledBy.length) {
				oAccAttributes.labelledby = {
					value: ARIA_LABELLEDBY_ID
				};
			}

			if (!aAriaDescribedBy.length) {
				oAccAttributes.describedby = {
					value: ARIA_DESCRIBEDBY_ID
				};
			}

			rm.accessibilityState(oSF, oAccAttributes);
		};

		return SideNavigationSearchFieldRenderer;
	});
