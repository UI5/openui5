/*!
 * ${copyright}
 */
sap.ui.define([], function () {
	"use strict";

	/**
	 * Utility class for handling RadioButton and RadioButtonGroup operations in forms.
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @private
	 * @alias sap.ui.integration.util.RadioButtonHelper
	 */
	const RadioButtonHelper = {};

	/**
	 * Extracts RadioButtonGroup selection data including index, key, text, and required status.
	 * @param {sap.m.RadioButtonGroup} oControl RadioButtonGroup control.
	 * @returns {object} Object containing selectedIndex, selectedKey, selectedText, and required properties.
	 * @private
	 */
	RadioButtonHelper.getValueForModel = function (oControl) {
		const iSelectedIndex = oControl.getSelectedIndex(),
			aButtons = oControl.getButtons();
		let sSelectedText = null,
			sSelectedKey = null;

		if (iSelectedIndex >= 0 && aButtons && aButtons[iSelectedIndex]) {
			const oSelectedButton = aButtons[iSelectedIndex];
			sSelectedText = oSelectedButton.getText() || null;
			sSelectedKey = oSelectedButton.data("key");
		}

		return {
			selectedIndex: iSelectedIndex,
			selectedKey: sSelectedKey,
			selectedText: sSelectedText
		};
	};

	/**
	 * Sets the selected index of a RadioButtonGroup control.
	 * @param {sap.m.RadioButtonGroup} oControl The RadioButtonGroup control.
	 * @param {number} iSelectedIndex The index to select.
	 * @param {string} sSelectedKey The key to select.
	 */
	RadioButtonHelper.setSelectedIndexAndKey = function (oControl, iSelectedIndex, sSelectedKey) {
		if (iSelectedIndex !== undefined) {
			oControl.setSelectedIndex(iSelectedIndex);
			return;
		}

		if (sSelectedKey !== undefined) {
			const aButtons = oControl.getButtons();
			const sTargetKey = sSelectedKey;

			const iFoundIndex = aButtons.findIndex(function(oButton) {
				const sKey = oButton.data("key");
				return sKey && sKey.toString() === sTargetKey;
			});

			oControl.setSelectedIndex(iFoundIndex);
		}
	};

	return RadioButtonHelper;
});
