/*!
 * ${copyright}
 */

// Provides a base exception class
sap.ui.define(function() {
	"use strict";

	/**
	 * @class
	 *
	 * Exception class.
	 *
	 * This is the base exception class. In contrary to the Error an Exception
	 * should be thrown in cases, where the exception can, and should, be handled
	 * within the framework, instead of causing the application to exit.
	 *
	 * The try/catch statement in JavaScript cannot catch specific exceptions, so
	 * when catching internal exceptions you should make sure to rethrow other errors:
	 *
	 * <pre>
	 * // Exception imported from sap/ui/base/Exception
	 * try {
	 *     ...
	 * } catch (oException) {
	 *     if (oException instanceof Exception) {
	 *         ... handle exception ...
	 *     } else {
	 *         throw oException;
	 *     }
	 * }
	 * </pre>
	 *
	 * @param {string} message Message explaining what went wrong
	 * @alias sap.ui.base.Exception
	 */
	var Exception = function(message) {
		this.name = "Exception";
		this.message = message;
	};


	return Exception;

});
