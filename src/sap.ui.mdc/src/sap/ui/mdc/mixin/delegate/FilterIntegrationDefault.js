/*!
 * ${copyright}
 */

// module:sap/ui/mdc/mixin/delegate/FilterIntegrationDefault
sap.ui.define([
	"sap/ui/mdc/util/FilterUtil", "sap/ui/mdc/condition/FilterOperatorUtil", "sap/ui/core/Element", "sap/ui/model/Filter"
], (
	FilterUtil,
	FilterOperatorUtil,
	Element,
	Filter) => {
	"use strict";

	function _createFilterFromExternalConditions(oControl, oTypeMap) {
		const mConditions = oControl?.getConditions() || {};
		// if default values are used, exchange with real default-conditions
		if (oControl?.getDefaultValues) { // currently default values are only supported for FilterBar
			for (const sFieldPath in mConditions) {
				const aConditions = mConditions[sFieldPath];
				const aFilterConditions = [];
				for (let i = 0; i < aConditions.length; i++) {
					const oCondition = aConditions[i];
					const oOperator = FilterOperatorUtil.getOperator(oCondition.operator);
					if (oOperator?.useDefaultValues) {
						const aDefaultConditions = oControl.getDefaultValues(sFieldPath);
						aFilterConditions.push(...aDefaultConditions);
					} else {
						aFilterConditions.push(oCondition);
					}
				}
				mConditions[sFieldPath] = aFilterConditions;
			}
		}

		return FilterUtil.getFilterInfo(oTypeMap, mConditions, oControl?.getPropertyHelper?.()?.getProperties(true) || [])?.filters;
	}

	function _createInnerFilter(oControl, oTypeMap) {
		return oControl.isFilteringEnabled() && _createFilterFromExternalConditions(oControl, oTypeMap);
	}

	function _createOuterFilter(oControl, oTypeMap) {
		const sFilter = oControl.getFilter();
		const oFilter = sFilter && Element.getElementById(sFilter);
		return _createFilterFromExternalConditions(oFilter, oTypeMap);
	}

	/**
	 * Mixin enhancing {@link sap.ui.mdc.Control Control's} {@link module:sap/ui/mdc/BaseDelegate delegates} with a {@link #getFilters  #getFilters} implementation combining filters created from the control itself as well as a configured external {@link sap.ui.mdc.IFilterSource IFilterSource};
	 *
	 * @author SAP SE
	 * @namespace
	 * @alias module:sap/ui/mdc/mixin/delegate/FilterIntegrationDefault
	 * @mixin
	 * @since 1.121
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 */
	const FilterIntegrationDefault = {};

	/**
	 * Returns filters to be applied when updating the control's binding based on the
	 * filter conditions of the control itself and it's associated {@link sap.ui.mdc.IFilterSource IFilterSource}.
	 *
	 * @param {sap.ui.mdc.Control} oControl Instance of the MDC control
	 * @returns {sap.ui.model.Filter[]} Array of filters
	 * @protected
	 */
	FilterIntegrationDefault.getFilters = function(oControl) {
		const oTypeMap = this.getTypeMap(oControl);
		const oInnerFilter = _createInnerFilter(oControl, oTypeMap);
		const oOuterFilter = _createOuterFilter(oControl, oTypeMap);
		if (oInnerFilter && oOuterFilter) {
			return [new Filter([oInnerFilter, oOuterFilter], true)];
		}
		if (oInnerFilter || oOuterFilter) {
			return [oInnerFilter || oOuterFilter];
		}
		return [];
	};

	return FilterIntegrationDefault;
});