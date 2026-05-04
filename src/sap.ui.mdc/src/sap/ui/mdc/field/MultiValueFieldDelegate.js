/*!
 * ${copyright}
 */

sap.ui.define([
	'sap/ui/mdc/field/FieldBaseDelegate'
], (
	FieldBaseDelegate
) => {
	"use strict";

	/**
	 * Delegate for {@link sap.ui.mdc.MultiValueField MultiValueField}.
	 *
	 * @namespace
	 * @author SAP SE
	 * @public
	 * @since 1.93.0
	 * @extends module:sap/ui/mdc/field/FieldBaseDelegate
	 * @alias module:sap/ui/mdc/field/MultiValueFieldDelegate
	 */
	const MultiValueFieldDelegate = Object.assign({}, FieldBaseDelegate);

	/**
	 * Implements the model-specific logic to update items after conditions have been updated.
	 *
	 * Items can be removed, updated, or added.
	 * Use the binding information of the {@link sap.ui.mdc.MultiValueField MultiValueField} control to update the data in the related model.
	 *
	 * @param {object} oPayload Payload for delegate
	 * @param {sap.ui.mdc.condition.ConditionObject[]} aConditions Current conditions of the {@link sap.ui.mdc.MultiValueField MultiValueField} control
	 * @param {sap.ui.mdc.MultiValueField} oMultiValueField Current {@link sap.ui.mdc.MultiValueField MultiValueField} control to determine binding information to update the values of the related model
	 * @public
	 * @deprecated As of version 1.142, replaced by {@link module:sap/ui/mdc/field/MultiValueFieldDelegate.updateItemsFromConditions updateItemsFromConditions}.
	 */
	MultiValueFieldDelegate.updateItems = function(oPayload, aConditions, oMultiValueField) {

	};


	/**
	 * Implements the model-specific logic to update items after conditions have been updated.
	 *
	 * Items can be removed, updated, or added.
	 * Use the binding information of the {@link sap.ui.mdc.MultiValueField MultiValueField} control to update the data in the related model.
	 *
	 * If updating of the items fails, return a rejected <code>Promise</code> to sync the conditions with the items. Set a <code>valueState</code> if needed.
	 *
	 * @param {sap.ui.mdc.MultiValueField} oMultiValueField Current {@link sap.ui.mdc.MultiValueField MultiValueField} control to determine binding information to update the values of the related model
	 * @param {sap.ui.mdc.condition.ConditionObject[]} aConditions Current conditions of the {@link sap.ui.mdc.MultiValueField MultiValueField} control
	 * @returns {null|Promise<sap.ui.mdc.field.MultiValueFieldItem[]>} null or a <code>Promise</code> returning an array containing the current items after update. If update of items fails, the <code>Promise</code> needs to be rejected
	 * @public
	 * @since 1.142
	 */
	MultiValueFieldDelegate.updateItemsFromConditions = function(oMultiValueField, aConditions) {
		/**
		 *  @deprecated As of version 1.142
		 */
		this.updateItems.apply(this, [oMultiValueField.getPayload(), aConditions, oMultiValueField]);
		return null;
	};

	return MultiValueFieldDelegate;
});