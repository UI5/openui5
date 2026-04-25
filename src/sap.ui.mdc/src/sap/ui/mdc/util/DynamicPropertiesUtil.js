/*!
 * ${copyright}
 */

sap.ui.define([
], () => {
	"use strict";

	const _mModeCache = new WeakMap();

	/**
	 * Utility for managing dynamic property state in MDC controls.
	 *
	 * Provides read/write access to the <code>propertyKeys</code> control property
	 * and mode detection for flex change handlers that operate on both XML nodes
	 * and runtime control instances.
	 *
	 * @namespace
	 * @alias sap.ui.mdc.util.DynamicPropertiesUtil
	 * @private
	 */
	const DynamicPropertiesUtil = {

		/**
		 * Checks whether the control uses property keys mode. Works in both XML preprocessing
		 * and runtime contexts.
		 *
		 * - Runtime: Delegates to the mixin method <code>isInPropertyKeysMode</code> if available.
		 * - XML: Reads <code>propertyKeys</code> from the control property via the modifier.
		 *
		 * Results are cached in a WeakMap.
		 *
		 * @param {sap.ui.mdc.Control|Node} oControl The control instance or XML node
		 * @param {object} mPropertyBag Instance of property bag from Flex change API
		 * @returns {Promise<boolean>} Whether the control uses property keys mode
		 * @private
		 */
		isInPropertyKeysMode: async function(oControl, mPropertyBag) {
			// Runtime path: delegate to mixin
			if (oControl.isInPropertyKeysMode) {
				return oControl.isInPropertyKeysMode();
			}

			// XML path: check cache
			if (_mModeCache.has(oControl)) {
				return _mModeCache.get(oControl);
			}

			// XML path: read propertyKeys via modifier
			const aPropertyKeys = await mPropertyBag.modifier.getProperty(oControl, "propertyKeys");
			const bUsesPropertyKeysMode = Array.isArray(aPropertyKeys) && aPropertyKeys.length > 0;
			_mModeCache.set(oControl, bUsesPropertyKeysMode);
			return bUsesPropertyKeysMode;
		},

		/**
		 * Gets the current property keys from the <code>propertyKeys</code> property.
		 *
		 * @param {sap.ui.mdc.Control|Node} oControl The control instance or XML node
		 * @param {object} mPropertyBag Instance of property bag from Flex change API
		 * @returns {Promise<string[]>} Copy of the property keys array
		 * @private
		 */
		getPropertyKeys: async function(oControl, mPropertyBag) {
			const aState = await mPropertyBag.modifier.getProperty(oControl, "propertyKeys");
			return aState ? aState.slice() : [];
		},

		/**
		 * Sets the property keys to a new order.
		 *
		 * @param {sap.ui.mdc.Control|Node} oControl The control instance or XML node
		 * @param {string[]} aNewOrder New array of property keys
		 * @param {object} mPropertyBag Instance of property bag from Flex change API
		 * @private
		 */
		setPropertyKeys: function(oControl, aNewOrder, mPropertyBag) {
			// XMLTreeModifier stores string[] properties as comma-separated attribute values.
			// Passing an array would JSON-stringify it, which cannot be correctly parsed back.
			const vValue = typeof oControl.getMetadata === "function" ? aNewOrder : aNewOrder.join(",");
			return mPropertyBag.modifier.setProperty(oControl, "propertyKeys", vValue);
		},

		/**
		 * Translates an aggregation index (active items only) to a propertyKeys index
		 * (includes inactive items). Walks the propertyKeys, counting active items until
		 * the target aggregation index is reached, then skips trailing inactive items.
		 *
		 * @param {sap.ui.mdc.Control} oControl The control instance
		 * @param {number} iAggregationIndex The aggregation index to translate
		 * @returns {number} The corresponding propertyKeys index
		 * @private
		 */
		translateAggregationToPropertyKeysIndex: function(oControl, iAggregationIndex) {
			const aPropertyKeys = oControl.getPropertyKeys();
			const oPropertyHelper = oControl.getPropertyHelper();
			let iPropertyKeysIndex = 0;
			let iActiveCount = 0;

			while (iActiveCount < iAggregationIndex && iPropertyKeysIndex < aPropertyKeys.length) {
				const oProperty = oPropertyHelper.getProperty(aPropertyKeys[iPropertyKeysIndex], true);
				if (!(oProperty && oProperty.isActive === false)) {
					iActiveCount++;
				}
				iPropertyKeysIndex++;
			}

			// Skip inactive properties at the landing position
			while (iPropertyKeysIndex < aPropertyKeys.length) {
				const oProperty = oPropertyHelper.getProperty(aPropertyKeys[iPropertyKeysIndex], true);
				if (!(oProperty && oProperty.isActive === false)) {
					break;
				}
				iPropertyKeysIndex++;
			}

			return iPropertyKeysIndex;
		},

		/**
		 * Translates a propertyKeys index (includes inactive items) to an aggregation index
		 * (active items only). Counts active items before the given propertyKeys index.
		 *
		 * @param {sap.ui.mdc.Control} oControl The control instance
		 * @param {number} iPropertyKeysIndex The propertyKeys index to translate
		 * @returns {number} The corresponding aggregation index
		 * @private
		 */
		translatePropertyKeysToAggregationIndex: function(oControl, iPropertyKeysIndex) {
			const aPropertyKeys = oControl.getPropertyKeys();
			const oPropertyHelper = oControl.getPropertyHelper();
			let iAggregationIndex = 0;

			for (let i = 0; i < iPropertyKeysIndex && i < aPropertyKeys.length; i++) {
				const oProperty = oPropertyHelper.getProperty(aPropertyKeys[i], true);
				if (!(oProperty && oProperty.isActive === false)) {
					iAggregationIndex++;
				}
			}

			return iAggregationIndex;
		}
	};

	return DynamicPropertiesUtil;
});
