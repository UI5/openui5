/*!
 * ${copyright}
 */
sap.ui.define([], function() {
	"use strict";

	/**
	 * Detect text selection.
	 *
	 * @param {HTMLElement} oDomRef DOM element of the control
	 * @returns {boolean} true if text selection is done within the control, otherwise false.
	 * @private
	 * @ui5-restricted sap.m, sap.ui.integration
	 * @alias module:sap/ui/dom/detectTextSelection
	 */
	const detectTextSelection = function(oDomRef) {
		if (!oDomRef) {
			return false;
		}

		const oSelection = window.getSelection();
		if (!oSelection) {
			return false;
		}

		const sTextSelection = oSelection.toString().replace("\n", "");
		if (!sTextSelection) {
			return false;
		}

		const oFocusNode = oSelection.focusNode;
		const oAnchorNode = oSelection.anchorNode;

		return (oFocusNode && oDomRef !== oFocusNode && oDomRef.contains(oFocusNode)) ||
			(oAnchorNode && oDomRef !== oAnchorNode && oDomRef.contains(oAnchorNode));
	};

	return detectTextSelection;
});
