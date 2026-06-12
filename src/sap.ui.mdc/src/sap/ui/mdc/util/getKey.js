/*!
 * ${copyright}
 */
sap.ui.define([
], () => {
	"use strict";

	/**
	 * Reads the item identifier from a flex change content object.
	 *
	 * Returns <code>content.key</code> (the current identifier, see <code>sap.ui.mdc.State.Items</code>).
	 * Falls back to <code>content.name</code> for changes that still use the deprecated property (removed in UI5 2.0)
	 * and therefore only carry the legacy identifier. The fallback is removed in UI5 2.0
	 *
	 * @param {object} oContent A change content object
	 * @returns {string|undefined} The item identifier, or <code>undefined</code> if neither property is set
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 */
	const getKey = (oContent) => {
	 const sKey = oContent.key;

	 return sKey;
	};

	return getKey;
});
