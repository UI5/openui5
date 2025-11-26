/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/i18n/Localization",
	'sap/ui/mdc/filterbar/IFilterContainer',
	"sap/ui/layout/VerticalLayout",
	"sap/ui/layout/HorizontalLayout",
	"sap/m/Text",
	"./FilterBarBaseLayout"
], (Localization, IFilterContainer, VerticalLayout, HorizontalLayout, Text, FilterBarBaseLayout) => {
	"use strict";
	/**
	 * Constructor for a new filterBar/FilterContainer.
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @class The <code>FilterContainer</code> is an {@link sap.ui.layout.IFilterContainer IFilterContainer} implementation for {@link sap.ui.mdc.filterbar.FilterBarBaseLayout FilterBarBaseLayout}.
	 * It is used by the {@link sap.ui.mdc.FilterBar FilterBar} to display the filter items.
	 * @extends sap.ui.mdc.filterbar.IFilterContainer
	 * @constructor
	 * @since 1.144
	 * @alias sap.ui.mdc.filterbar.FilterContainer
	 * @private
	 * @ui5-restricted sap.ui.mdc, sap.fe
	 */
	const FilterContainer = IFilterContainer.extend("sap.ui.mdc.filterbar.FilterContainer", {
		metadata: {
			library: "sap.ui.mdc",
			aggregations: {
					/**
					 * Contains the internal hidden aggregation to hold the inner layout.
					 */
					_layout: {
						type: "sap.ui.core.Element",
						multiple: false,
						visibility: "hidden"
					}
			}
		}
	});

	FilterContainer.prototype.init = function() {
		this.oLayout = new FilterBarBaseLayout();
		this.setAggregation("_layout", this.oLayout, true);
	};

	FilterContainer.prototype.addButton = function(oButton) {
		this.oLayout.addButton(oButton);
	};

	FilterContainer.prototype.insertFilterField = function(oControl, iIndex) {
		this.oLayout.insertContent(oControl, iIndex);
	};

	FilterContainer.prototype.removeFilterField = function(oControl) {
		this.oLayout.removeContent(oControl);
	};

	FilterContainer.prototype.getFilterFields = function() {
		return this.oLayout.getContent();
	};

	return FilterContainer;
});