/* eslint-disable no-new-func */

/*!
 * ${copyright}
 */

sap.ui.define([], function () {
	"use strict";

	let bIsEvalAllowed;

	// Checks if the Function constructor can be used in the current platform (based on CSP restrictions)
	try {
		// eslint-disable-next-line no-new
		new Function("");
		bIsEvalAllowed = true;
	} catch (e) {
		bIsEvalAllowed = false;
	}

	return {
		/**
		 * @returns {boolean} Whether eval can be used in the current environment
		 */
		isEvalAllowed: function () {
			return bIsEvalAllowed;
		},

		/**
		 * Evaluates a function string
		 * @param {string} sFunction Function as string
		 * @returns {function} Evaluated function
		 * @throws Error why eval failed, for example invalid syntax
		 */
		evalFunction: function (sFunction) {
			return new Function("return (" + sFunction + ")")();
		}
	};
});
