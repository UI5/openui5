/*!
 * ${copyright}
 */

sap.ui.define([], () => {
	"use strict";

	/**
	 * @namespace
	 * @alias sap.ui.mdc.util.P13nUtils
	 * @ui5-restricted sap.ui.mdc
	 * @since 1.151
	 */
	const P13nUtils = {
		/**
		 * Returns the values present in both arrays.
		 *
		 * @param {string[]} aArr1 The first array
		 * @param {string[]} aArr2 The second array
		 * @returns {string[]} The intersection
		 * @private
		 */
		getIntersection: function(aArr1, aArr2) {
			return aArr1.filter((sValue) => {
				return aArr2.includes(sValue);
			});
		},

		/**
		 * Returns the P13n modes supported by the given control and its current delegate.
		 *
		 * When the delegate is not yet initialized, all modes in <code>aAllModes</code> are
		 * considered supported. When the delegate is initialized, the result is the intersection
		 * of <code>aAllModes</code> and the modes reported by
		 * <code>delegate.getSupportedFeatures(oControl).p13nModes</code>.
		 *
		 * @param {sap.ui.core.Control} oControl The control whose delegate to query
		 * @param {string[]} aAllModes The full set of mode keys to check against
		 * @returns {string[]} The supported P13n mode keys
		 * @private
		 */
		getSupportedP13nModes: function(oControl, aAllModes) {
			let aSupportedP13nModes = aAllModes;

			if (oControl.isControlDelegateInitialized()) {
				aSupportedP13nModes = this.getIntersection(aSupportedP13nModes, oControl.getControlDelegate().getSupportedFeatures(oControl).p13nModes || []);
			}

			return aSupportedP13nModes;
		},

		/**
		 * Returns the active P13n modes for a control — the intersection of the enabled modes
		 * and the supported modes.
		 *
		 * @param {sap.ui.core.Control} oControl The control whose delegate to query
		 * @param {string[]} aEnabledP13nModes The modes currently enabled on the control
		 * @param {string[]} aAllModes The full set of mode keys to check against
		 * @returns {string[]} The active P13n mode keys
		 * @private
		 */
		getActiveP13nModes: function(oControl, aEnabledP13nModes, aAllModes) {
			return this.getIntersection(aEnabledP13nModes, this.getSupportedP13nModes(oControl, aAllModes));
		},

		/**
		 * Determines whether the personalization settings button should be visible.
		 *
		 * @param {string[]} aP13nModes The currently active P13n mode keys
		 * @param {boolean} bButtonHidden Whether the button has been explicitly hidden
		 * @param {boolean} bHideIfAggregateOnly When <code>true</code>, returns <code>false</code>
		 *   if <code>aP13nModes</code> contains only the <code>"Aggregate"</code> mode, because
		 *   aggregation personalization has no settings dialog UI.
		 * @returns {boolean} Whether the settings button should be shown
		 * @private
		 */
		isSettingsButtonVisible: function(aP13nModes, bButtonHidden, bHideIfAggregateOnly) {
			if (!Array.isArray(aP13nModes) || aP13nModes.length === 0 || bButtonHidden) {
				return false;
			}

			if (bHideIfAggregateOnly) {
				const bAggregateOnly = aP13nModes.length === 1 && aP13nModes[0] === "Aggregate";
				if (bAggregateOnly) {
					return false;
				}
			}

			return true;
		}
	};

	return P13nUtils;
});
