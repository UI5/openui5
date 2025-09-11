/*!
 * ${copyright}
 */

sap.ui.define([], () => {
	"use strict";

	/**
	 * FilterBarLayout renderer.
	 * @namespace
	 */
	const FilterBarLayoutRenderer = { apiVersion: 2 };

	/**
	 * Renders the HTML for the given control, using the provided
	 * {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.ui.comp.filterbar.FilterBar} oFilterBar the button to be rendered
	 */
	FilterBarLayoutRenderer.render = function(oRm, oFilterBar) {
		oRm.openStart("div", oFilterBar);
		this.addRootDivClasses(oRm, oFilterBar);
		oRm.openEnd();
		this.renderToolbar(oRm, oFilterBar);
		this.renderItems(oRm, oFilterBar);

		this.renderHintText(oRm, oFilterBar);
		oRm.close("div");
	};

	FilterBarLayoutRenderer.addRootDivClasses = function (oRm, oFilterBar) {};

	FilterBarLayoutRenderer.renderToolbar = function (oRm, oFilterBar) {};

	FilterBarLayoutRenderer.renderHintText = function (oRm, oFilterBar) {};

	FilterBarLayoutRenderer.renderItems = function (oRm, oFilterBar) {
		throw new Error("Method 'renderItems' is not implemented. Implementation should be provided by child classes.");
	};

	FilterBarLayoutRenderer.renderFilterItems = function (oRm, oFilterBar) {
		if (!oFilterBar._getFilterBarExpanded() && oFilterBar._getUseToolbar()) {
			// Early return if the filter bar is not expanded and toolbar is used
			return;
		}

		const aItems = oFilterBar._getFilterItems();
		oRm.openStart("div", `${oFilterBar.getId()}-items`);
		oRm.class("sapUiMdcFilterBarLayoutItems");
		oRm.openEnd();
		this.renderBasicSearch(oRm, oFilterBar);

		const iTotalHiddenFilters = aItems.filter(oFilterBar._isFilterItemHidden).length;

		let iHiddenFilters = 0;
		for (let i = 0; i < aItems.length; i++) {
			const iRenderedFilters = i - iHiddenFilters;

			if (oFilterBar._shouldSkipRenderFilters(iRenderedFilters)) {
				break;
			}

			if (oFilterBar._isFilterItemHidden(aItems[i])) {
				iHiddenFilters++;
				continue; // skip rendering
			}

			this.renderFilterItem(oRm, oFilterBar, aItems[i].filterItem || aItems[i]); // TODO: handle the difference between comp and mdc
		}

		const iSpacersCount = Math.max(4, aItems.length - 1);
		for (let i = 0; i < iSpacersCount; i++) {
			if (aItems[i]?.isA?.("sap.ui.mdc.filterbar.aligned.FilterItemLayout") || aItems[i]?.filterItem?.getVisibleInFilterBar()) { // TODO: handle the difference between comp and mdc
				this.renderFilterItemSpacer(oRm, oFilterBar);
			}
		}

		this.renderButtons(oRm, oFilterBar);
		this.renderShowAllButton(oRm, oFilterBar, aItems.length - iTotalHiddenFilters);
		oRm.close("div");
	};

	FilterBarLayoutRenderer.renderFilterItem = function (oRm, oFilterBar, oFilterGroupItem) {
		oRm.openStart("div", oFilterGroupItem);
		if (oFilterBar._shouldRenderAdvancedLayout()) {
			oRm.class("sapUiCompFilterBarAdvancedItem");
		} else {
			oRm.class("sapUiMdcFilterBarLayoutItem");
			this.setContainerWidth(oRm, oFilterBar);
		}

		oRm.openEnd();
		if (oFilterGroupItem.getAggregation("_debug")) {
			oRm.openStart("div");
			oRm.openEnd();
			oRm.renderControl(oFilterGroupItem.getAggregation("_debug"));
		}
		this.renderLabel(oRm, oFilterBar, oFilterGroupItem);
		if (oFilterGroupItem.getAggregation("_debug")) {
			oRm.close("div");
		}
		oRm.openStart("div");
		oRm.class("sapUiMdcFilterBarLayoutItemEmptyDiv");
		oRm.openEnd();
		oRm.close("div");
		this.renderControl(oRm, oFilterBar, oFilterGroupItem);
		oRm.close("div");
	};

	FilterBarLayoutRenderer.renderFilterItemSpacer = function (oRm, oFilterBar) {
		oRm.openStart("div");
		oRm.class("sapUiMdcFilterBarLayoutItemSpacer");
		this.setContainerWidth(oRm, oFilterBar);
		oRm.openEnd();
		oRm.close("div");
	};

	FilterBarLayoutRenderer.renderBasicSearch = function (oRm, oFilterBar) {
		// TODO: find how it is rendered in mdc
		const oBasicSearchField = oFilterBar._oBasicSearchField;
		if (!oBasicSearchField || oFilterBar._getUseToolbar()
			|| oBasicSearchField.getParent() !== oFilterBar || (oBasicSearchField.getParent() === oFilterBar && oBasicSearchField.sParentAggregationName === "content")) {
			return; // Early return if basic search field doesn't exist or toolbar is used
		}

		oRm.openStart("div", `${oFilterBar.getId()}-item-basicSearch`);
		oRm.class("sapUiMdcFilterBarLayoutBasicSearch");
		this.setContainerWidth(oRm, oFilterBar);
		oRm.openEnd();
		oRm.renderControl(oFilterBar._oBasicSearchField);
		oRm.close("div");
	};

	FilterBarLayoutRenderer.renderButtons = function(oRm, oFilterBar) {
		if (oFilterBar._shouldSkipRenderButtons()) {
			return; // Early return if toolbar is used
		}

		oRm.openStart("div", `${oFilterBar.getId()}-item-buttons`);
		oRm.class("sapUiMdcFilterBarLayoutButtons");
		oRm.openEnd();
		oFilterBar._getButtons().forEach(oRm.renderControl);
		oRm.close("div");
	};

	FilterBarLayoutRenderer.renderLabel = function (oRm, oFilterBar, oFilterGroupItem) {
		throw new Error("FilterBarLayoutRenderer.renderLabel is not implemented. Implementation should be provided by child classes.");
	};

	FilterBarLayoutRenderer.renderControl = function(oRm, oFilterBar, oFilterGroupItem) {
		throw new Error("FilterBarLayoutRenderer.renderControl is not implemented. Implementation should be provided by child classes.");
	};

	FilterBarLayoutRenderer.renderShowAllButton = function(oRm, oFilterBar, iItemsCount) {};

	FilterBarLayoutRenderer.setContainerWidth = function (oRm, oFilterBar) {};

	FilterBarLayoutRenderer.renderAdvancedFilterItems = function (oRm, oFilterBar) {};

	FilterBarLayoutRenderer.renderAdvancedFilterItemsSingleGroup = function (oRm, oFilterBar, aItems) {};

	FilterBarLayoutRenderer.renderAdvancedFilterItemsMultiGroups = function (oRm, oFilterBar, aItems, iNumberOfGroups) {};

	return FilterBarLayoutRenderer;
});
