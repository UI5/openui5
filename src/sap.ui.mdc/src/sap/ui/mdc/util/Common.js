/*!
 * ${copyright}
 */

sap.ui.define([], () => {
	"use strict";

	/**
	 * @namespace
	 * @alias sap.ui.mdc.util.Common
	 * @ui5-restricted sap.ui.mdc
	 * @since 1.151
	 */
	const Common = {
		/**
		 * Applies control settings, ensuring the <code>type</code> (or the property named by
		 * <code>sTypeProperty</code>) and <code>delegate</code> are applied first so that the
		 * control is fully initialized before dependent settings are processed.
		 *
		 * Only a shallow copy of <code>mSettings</code> is made internally; callers that need
		 * deep isolation must copy their settings before calling this function.
		 *
		 * @param {sap.ui.core.Control} oControl The control to apply settings to
		 * @param {object} mSettings The settings map (not mutated by this function)
		 * @param {object} oScope The scope passed through to <code>fnApplySettings</code>
		 * @param {function} fnApplySettings The original <code>applySettings</code> function to call
		 * @param {string} [sTypeProperty="type"] The name of the type property to hoist; defaults to <code>"type"</code>
		 * @returns {void}
		 * @ui5-restricted sap.ui.mdc
		 */
		applySettingsWithEarlyTypeAndDelegate: function(oControl, mSettings, oScope, fnApplySettings, sTypeProperty = "type") {
			if (mSettings && sTypeProperty in mSettings) {
				const mEarlySettings = {[sTypeProperty]: mSettings[sTypeProperty]};
				const mRemainingSettings = {...mSettings};
				delete mRemainingSettings[sTypeProperty];

				if ("delegate" in mSettings) {
					mEarlySettings.delegate = mSettings.delegate;
					delete mRemainingSettings.delegate;
				}

				fnApplySettings.call(oControl, mEarlySettings, oScope);
				fnApplySettings.call(oControl, mRemainingSettings, oScope);
				return;
			}

			fnApplySettings.call(oControl, mSettings, oScope);
		},

		/**
		 * Destroys and nullifies the given fields on the target object.
		 *
		 * @param {object} oTarget The target object
		 * @param {string[]} aFields The field names to clean up
		 * @ui5-restricted sap.ui.mdc
		 */
		cleanup: function(oTarget, aFields) {
			aFields.forEach((sField) => {
				const oRemovable = oTarget[sField];
				if (oRemovable) {
					if (oRemovable.destroy && !oRemovable.bIsDestroyed) {
						oRemovable.destroy();
					}
					oTarget[sField] = null;
				}
			});
		}
	};

	return Common;

});