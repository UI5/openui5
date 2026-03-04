/*!
 * ${copyright}
 */
/* eslint-disable max-len */
// Provides mixin sap.ui.model.AggregationBinding with common functionality for sap.ui.model.(ListBinding|TreeBinding)
sap.ui.define([
	'./FilterType'], function (FilterType) {
	"use strict";

	/**
	 * A mixin for bindings that support bound filters in aggregations.
	 *
	 * This mixin provides functionality for bindings (ListBinding and TreeBinding) to support
	 * bound filters, where filter values can be binding expressions that automatically update
	 * when the bound value changes.
	 *
	 * @alias sap.ui.model.AggregationBinding
	 * @mixin
	 */
	function AggregationBinding() {
		// whether the current call to this binding's filter method is invoked by data binding for a bound filter
		this.bBoundFilterUpdate = false;
	}

	/**
	 * Returns whether the current call to this binding's filter method is invoked by data binding for a bound filter.
	 *
	 * @returns {boolean} Whether the current filter method call is invoked by data binding for a bound filter
	 *
	 * @private
	 */
	AggregationBinding.prototype._isBoundFilterUpdate = function () {
		return this.bBoundFilterUpdate;
	};

	/**
	 * Updates the given single filter in the binding's application filters with the given values.
	 *
	 * @param {sap.ui.model.Filter} oFilter
	 *   The single filter to update; must be contained in the binding's application filters
	 * @param {any} vValue1
	 *   The new <code>value1</code> for the filter
	 * @param {any} vValue2
	 *   The new <code>value2</code> for the filter
	 * @returns {sap.ui.model.Filter}
	 *   The new single filter which has the given values
	 * @throws {Error}
	 *   If the given filter is not contained in this binding's application filters
	 *
	 * @private
	 */
	AggregationBinding.prototype._updateFilter = function (oFilter, vValue1, vValue2) {
		const oFilterClone = oFilter.cloneWithValues(vValue1, vValue2);
		let bFilterFound = false;
		const aNewApplicationFilters = this.aApplicationFilters.map((oApplicationFilter) => {
			const oClonedApplicationFilter = oApplicationFilter.cloneIfContained(oFilter, oFilterClone);
			bFilterFound ||= oClonedApplicationFilter !== oApplicationFilter;

			return oClonedApplicationFilter;
		});
		if (!bFilterFound) {
			throw new Error("Filter cannot be updated: Not found in binding's application filters");
		}

		this.bBoundFilterUpdate = true;
		this.filter(aNewApplicationFilters, FilterType.Application);
		this.bBoundFilterUpdate = false;

		return oFilterClone;
	};

	/**
	 * Computes the binding's application filters by replacing application filters of the given type with the
	 * given new filters. Subclasses call this method from their filter method implementation.
	 *
	 * @param {sap.ui.model.Filter[]|sap.ui.model.Filter} [vFilter]
	 *   The new filters for the given filter type
	 * @param {sap.ui.model.FilterType.Application|sap.ui.model.FilterType.ApplicationBound} [sFilterType=sap.ui.model.FilterType.Application]
	 *   The type of the application filters to replace
	 * @returns {sap.ui.model.Filter[]|sap.ui.model.Filter|undefined}
	 *   The new application filters
	 * @throws {Error}
	 *   If
	 *   <ul>
	 *   <li> The filter type is <code>sap.ui.model.FilterType.Control</code>. </li>
	 *   <li> The binding wasn't created for an aggregation of a control when the filter type is
	 *        <code>sap.ui.model.FilterType.ApplicationBound</code>. </li>
	 *   </ul>
	 *
	 * @protected
	 * @since 1.146.0
	 */
	AggregationBinding.prototype.computeApplicationFilters = function (vFilter, sFilterType) {
		if (sFilterType === FilterType.ApplicationBound) {
			throw new Error("Binding has not been created for an aggregation of a control: Must not use filter type "
				+ "ApplicationBound");
		}

		if (sFilterType === FilterType.Control) {
			throw new Error("Must not use filter type Control");
		}

		return vFilter;
	};

	/**
	 * The mixin applicator function that can be used in two modes:
	 * 1. Constructor mode: Called with context to initialize mixin properties on an instance
	 * 2. Prototype mode: Called without context to mix methods into a prototype
	 *
	 * @param {object} [oPrototype]
	 *   The prototype to mix AggregationBinding methods into (when called without context)
	 *
	 * @private
	 */
	function asAggregationBinding(oPrototype) {
		if (this) {	// Constructor mode
			AggregationBinding.apply(this, arguments);
		} else { // Prototype mode
			Object.assign(oPrototype, AggregationBinding.prototype);
		}
	}

	return asAggregationBinding;
});
