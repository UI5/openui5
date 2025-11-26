/*!
 * ${copyright}
 */

// Provides control sap.ui.mdc.valuehelp.FilterItemLayout.
sap.ui.define(
	[
		"sap/ui/mdc/filterbar/IFilterContainer",
		"sap/ui/mdc/filterbar/FilterBarBaseLayout",
		"sap/m/OverflowToolbar",
		"sap/m/ToolbarSpacer"
	],
	(
		IFilterContainer,
		FilterBarBaseLayout,
		Toolbar,
		ToolbarSpacer
	) => {
		"use strict";
		/**
		 * Constructor for a new valuehelp/FilterContainer.
		 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
		 * @class The FilterContainer is a IFilterContainer implementation for {@link sap.ui.mdc.filterbar.FilterBarBaseLayout FilterBarBaseLayout}.
		 * @extends sap.ui.mdc.filterbar.IFilterContainer
		 * @constructor
		 * @private
		 * @since 1.124.0
		 * @alias sap.ui.mdc.valuehelp.FilterContainer
		 */
		const FilterContainer = IFilterContainer.extend(
			"sap.ui.mdc.valuehelp.FilterContainer", {
				metadata: {
					library: "sap.ui.mdc",
					aggregations: {

						/**
						 * Internal hidden aggregation to hold the inner layout.
						 */
						_layout: {
							type: "sap.ui.core.Control",
							multiple: true,
							visibility: "hidden"
						}
					}
				}
			}
		);

		FilterContainer.prototype.init = function() {
			this.oLayout = new FilterBarBaseLayout();
			this.oLayout._oToolbar = new Toolbar(this.getId() + "-tbr", { content: [new ToolbarSpacer()] });

			this.aLayoutItems = [];
			this.addAggregation("_layout", this.oLayout._oToolbar, true);
			this.addAggregation("_layout", this.oLayout, true);
		};

		FilterContainer.prototype.exit = function() {
			this.aLayoutItems.forEach((oItem) => {
				oItem.destroy();
			});
			this.aLayoutItems = null;
		};

		FilterContainer.prototype.addControl = function(oControl) {
			this.oLayout._oToolbar.addContent(oControl);
		};

		FilterContainer.prototype.insertControl = function(oControl, iIndex) {
			this.oLayout._oToolbar.insertContent(oControl, iIndex);
		};

		FilterContainer.prototype.removeControl = function(oControl) {
			this.oLayout._oToolbar.removeContent(oControl);
		};

		FilterContainer.prototype.insertFilterField = function(oControl, iIndex) {
			this.aLayoutItems.splice(iIndex, 0, oControl);
			this._updateFilterBarLayout();
		};

		FilterContainer.prototype.removeFilterField = function(oControl) {
			let nIdx = -1;
			this.aLayoutItems.some((oLayoutItem, i) => {
				if (oControl === oLayoutItem) {
					nIdx = i;
					return true;
				}
				return false;
			});

			if (nIdx >= 0) {
				this.aLayoutItems.splice(nIdx, 1);
				this._updateFilterBarLayout();
			}

		};

		FilterContainer.prototype.getFilterFields = function() {
			return this.getParent().getProperty("expandFilterFields") ? this.oLayout.getContent() : [];
		};

		FilterContainer.prototype._updateFilterBarLayout = function(bShowAll) {
			const n = this.aLayoutItems.length;
			const iThreshold = this.getParent().getFilterFieldThreshold();

			let bUpdate = bShowAll || n <= iThreshold;

			if (!bUpdate) {
				const aItems = this.oLayout._getFilterItems();
				aItems.some((oItem, i) => {
					if (oItem != this.aLayoutItems[i]) {
						bUpdate = true;
						return true;
					}
					return false;
				});
			}

			if (bUpdate) {
				this.oLayout.removeAllContent();

				this.aLayoutItems.some((oLayoutItem, nIdx) => {
					if (bShowAll || n <= iThreshold || nIdx < iThreshold) {
						this.oLayout.insertContent(oLayoutItem, nIdx);
						return false;
					}
					return true;
				});
			}

			this.getParent().setProperty("_showAllFiltersEnabled", !bShowAll && n > iThreshold);
		};

		FilterContainer.prototype.exit = function () {
			this.oLayout._oToolbar = null;
			this.oLayout = null;
			this.aLayoutItems = null;
		};

		return FilterContainer;
	}
);