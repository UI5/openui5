/*!
 * ${copyright}
 */

sap.ui.define([], () => {
	"use strict";

	/**
	 * How a popover / tooltip reacts when the preferred placement does not fit.
	 *
	 * @enum {string}
	 * @private
	 * @ui5-restricted sap.m, sap.ui.core
	 * @alias sap.ui.core.popover.PopoverFlipMode
	 * @since 1.153
	 */
	const PopoverFlipMode = {

		/**
		 * Never flip; keep the preferred placement even if it does not fit.
		 * @private
		 * @ui5-restricted sap.m, sap.ui.core
		 */
		Never: "Never",

		/**
		 * Use the preferred side if it fits, otherwise the side with more free space on that axis.
		 * @private
		 * @ui5-restricted sap.m, sap.ui.core
		 */
		MoreSpace: "MoreSpace",

		/**
		 * Use the preferred side if it fits, otherwise the exact opposite side.
		 * @private
		 * @ui5-restricted sap.m, sap.ui.core
		 */
		Opposite: "Opposite",

		/**
		 * Ignore the preference; always use the side with more free space on that axis.
		 * @private
		 * @ui5-restricted sap.m, sap.ui.core
		 */
		PureSpace: "PureSpace"
	};

	return Object.freeze(PopoverFlipMode);
});
