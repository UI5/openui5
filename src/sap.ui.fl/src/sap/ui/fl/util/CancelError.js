/*!
 * ${copyright}
 */

sap.ui.define([], function() {
	"use strict";

	/**
	 * Error indicating that the reason for throwing was not an actual issue but rather a cancelation of the current action.
	 *
	 * @class
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @alias sap.ui.fl.util.CancelError
	 * @private
	 * @ui5-restricted sap.ui.fl, sap.ui.rta
	 * @since 1.144
	 */

	class CancelError extends Error {
		constructor(message, options) {
			super(message, options);
			this.name = "CancelError";
		}
	}

	return CancelError;
});