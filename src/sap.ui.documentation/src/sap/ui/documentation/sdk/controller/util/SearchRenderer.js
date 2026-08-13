/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/f/gen/ui5/webcomponents_fiori/dist/SearchItem",
	"sap/f/gen/ui5/webcomponents_fiori/dist/SearchItemGroup"
], function (SearchItem, SearchItemGroup) {
	"use strict";

	/**
	 * Renders search results into a ShellBarSearch control (sap.f wrapper).
	 *
	 * The controller passes an already-resolved control and a resolved i18n bundle;
	 * this module owns the item-tree construction and population of the suggestions.
	 */

	var CATEGORY_DEFS = [
		{ key: "apiref",   labelKey: "SEARCH_SUGGESTIONS_API_SECTION_TITLE",           countKey: "APILength" },
		{ key: "topics",   labelKey: "SEARCH_SUGGESTIONS_DOCUMENTATION_SECTION_TITLE", countKey: "DocLength" },
		{ key: "entity",   labelKey: "SEARCH_SUGGESTIONS_SAMPLES_SECTION_TITLE",       countKey: "SamplesLength" },
		{ key: "external", labelKey: "SEARCH_SUGGESTIONS_EXTERNAL_SECTION_TITLE",      countKey: "ExternalLength" }
	];

	/**
	 * Creates a SearchItem whose matched query text is highlighted.
	 *
	 * The sap.f SearchItem wrapper does not expose the underlying web component's
	 * `highlightText` property, so it is applied directly to the custom element after
	 * each rendering. The delegate re-applies it on every render (the suggestions
	 * popover renders lazily and can re-render), keeping highlighting robust.
	 *
	 * The delegate is bound to the item instance and is released together with the item
	 * when it is destroyed via `destroyAggregation("items")`, so no explicit cleanup is
	 * needed. If the item is destroyed or invalidated before rendering completes,
	 * highlighting is silently skipped (no error thrown).
	 *
	 * @param {object} mSettings - SearchItem constructor settings
	 * @param {string} [sQuery]  - The query text to highlight within the item text (cleared when falsy)
	 * @returns {sap.f.gen.ui5.webcomponents_fiori.dist.SearchItem} The created search item
	 */
	function createHighlightedItem(mSettings, sQuery) {
		var oSearchItem = new SearchItem(mSettings);
		oSearchItem.addEventDelegate({
			onAfterRendering: function () {
				var oDomRef = oSearchItem.getDomRef();
				if (oDomRef) {
					oDomRef.highlightText = sQuery || "";
				}
			}
		});
		return oSearchItem;
	}

	return {
		/**
		 * Populates the ShellBarSearch control with result items and opens it.
		 *
		 * @param {object} oCtrl          - The fiori:ShellBarSearch UI5 control
		 * @param {Array}  aItems         - Top-N result items from SearchUtil
		 * @param {object} oCounts        - { AllLength, APILength, DocLength, SamplesLength, ExternalLength }
		 * @param {object} oBundle        - Resolved i18n resource bundle
		 * @param {boolean} bPhone        - Whether the current viewport is phone-sized
		 * @param {object} [oSearchModel] - Optional searchData JSONModel
		 */
		render: function (oCtrl, aItems, oCounts, oBundle, bPhone, oSearchModel) {
			// The i18n bundle loads asynchronously; if a search is rendered before it
			// resolves (App startup race), skip this render — a later keystroke/open
			// re-renders once the bundle is ready.
			if (!oBundle) { return; }

			oCtrl.destroyAggregation("items");

			var sQuery = oSearchModel ? (oSearchModel.getProperty("/query") || "") : "";

			var sResultsHeader = aItems.length > 0
				? oBundle.getText("SEARCH_SUGGESTIONS_TITLE_ALL")
				: oBundle.getText("SEARCH_SUGGESTIONS_NO_RESULTS");

			// Section 1: top results (or no-data placeholder)
			var oResultsGroup = new SearchItemGroup(bPhone ? { headerText: sResultsHeader } : {});

			if (aItems.length > 0) {
				aItems.forEach(function (oDataItem) {
					var oSearchItem = createHighlightedItem({
						text: oDataItem.summary ? oDataItem.title + ": " + oDataItem.summary : (oDataItem.title || "")
					}, sQuery);
					oSearchItem.data("_payload", { type: "result", item: oDataItem });
					oResultsGroup.addItem(oSearchItem);
				});

				// "All" entry at the bottom of the results, navigating to the full search results page.
				var oAllItem = createHighlightedItem({
					text: oBundle.getText("SEARCH_SUGGESTIONS_ALL_SECTION_TITLE") + " (" + (oCounts.AllLength || 0) + ")"
				});
				oAllItem.data("_payload", { type: "allResults" });
				oResultsGroup.addItem(oAllItem);
			} else {
				var oNoDataItem = createHighlightedItem({ text: oBundle.getText("SEARCH_SUGGESTIONS_NO_RESULTS") });
				oNoDataItem.data("_payload", { type: "noData" });
				oResultsGroup.addItem(oNoDataItem);
			}

			oCtrl.addAggregation("items", oResultsGroup);

			// Section 2: per-category counts
			var aCategoryDefs = CATEGORY_DEFS
				.map(function (o) { return { key: o.key, labelKey: o.labelKey, count: oCounts[o.countKey] || 0 }; })
				.filter(function (o) { return o.count > 0; });

			if (aCategoryDefs.length > 0) {
				var oCategoryGroup = new SearchItemGroup({
					headerText: oBundle.getText("SEARCH_SUGGESTIONS_BY_CATEGORY_TITLE")
				});
				oCategoryGroup.addStyleClass("sapUiDemokitSearchCategoryGroup");
				aCategoryDefs.forEach(function (oDef) {
					var oCatItem = createHighlightedItem({
						text: oBundle.getText(oDef.labelKey) + " (" + oDef.count + ")"
					});
					oCatItem.data("_payload", { type: "category", key: oDef.key });
					oCategoryGroup.addItem(oCatItem);
				});
				oCtrl.addAggregation("items", oCategoryGroup);
			}

			if (oSearchModel && !bPhone) {
				oSearchModel.setProperty("/messageAreaText", sResultsHeader);
			}
		},

		/**
		 * Populates the ShellBarSearch with the category list only (all counts zero).
		 * Used on phone when the popup opens before any search has been performed,
		 * matching the old GlobalSearchPicker's initial state.
		 *
		 * @param {object} oCtrl   - The fiori:ShellBarSearch UI5 control
		 * @param {object} oBundle - Resolved i18n resource bundle
		 */
		renderEmptyState: function (oCtrl, oBundle) {
			if (!oBundle) { return; }

			oCtrl.destroyAggregation("items");

			var oCategoryGroup = new SearchItemGroup({
				headerText: oBundle.getText("SEARCH_SUGGESTIONS_BY_CATEGORY_TITLE")
			});
			CATEGORY_DEFS.forEach(function (oDef) {
				var oItem = createHighlightedItem({
					text: oBundle.getText(oDef.labelKey) + " (0)"
				});
				oItem.data("_payload", { type: "category", key: oDef.key });
				oCategoryGroup.addItem(oItem);
			});
			oCtrl.addAggregation("items", oCategoryGroup);
		},

		/**
		 * Removes all items from the ShellBarSearch control.
		 *
		 * @param {object} oCtrl - The fiori:ShellBarSearch UI5 control
		 */
		clear: function (oCtrl) {
			oCtrl.destroyAggregation("items");
		}
	};
});
