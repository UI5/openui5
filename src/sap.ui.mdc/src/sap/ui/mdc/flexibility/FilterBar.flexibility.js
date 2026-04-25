/*!
 * ${copyright}
 */

sap.ui.define(['./FilterItemFlex', './ConditionFlex', "./xConfigFlex"], (FilterItemFlex, ConditionFlex, xConfigFlex) => {
	"use strict";

	/**
	 * FilterBar-control-specific change handler that enables the storing of changes in the layered repository of the flexibility services.
	 *
	 * @alias sap.ui.mdc.flexibility.FilterBar
	 * @author SAP SE
	 * @version ${version}
	 */

	return {
		"addFilter": FilterItemFlex.createAddChangeHandler(),
		"removeFilter": FilterItemFlex.createRemoveChangeHandler(),
		"moveFilter": FilterItemFlex.createMoveChangeHandler(),
		"addCondition": ConditionFlex.addCondition,
		"removeCondition": ConditionFlex.removeCondition,

		"setPropertyAttribute": xConfigFlex.createSetChangeHandler({
			aggregation: "propertyInfo",
			property: (oChange) => oChange.getContent().attribute
		})
	};
});