/*!
 * ${copyright}
 */
/*
 * IMPORTANT: This is a private module, its API must not be used and is subject to change.
 * Code other than the OpenUI5 libraries must not introduce dependencies to this module.
 */
sap.ui.define([
	"sap/base/Log"
], function(Log) {
	"use strict";

	/**
	 * XHRInterceptor provides convenience for overriding XHR methods inside of sap/ui/performance.
	 *
	 * Modules can register functions as callbacks to the actual XHR methods instead of overwriting them
	 * explicitly. Registered functions get called in order of their registration with the same context
	 * and the same arguments the initial call was set up with.
	 *
	 * @module
	 * @private
	 */
	var XHRINTERCEPTOR = "XHRInterceptor";

	/**
	 * Registry for storing functions by registry keys (names).
	 *
	 * @private
	 */
	var mRegistry = Object.create(null);

	/**
	 * Original XHR functions
	 * @private
	 */
	var mXHRFunctions = Object.create(null);

	/**
	 * Creates the initial override for an original XHR method.
	 *
	 * @param {string} sXHRMethod Name of the actual XHR method
	 * @param {function} fnCallback The registered callback function
	 * @private
	 */
	function createOverride(sXHRMethod) {

		mRegistry[sXHRMethod] = Object.create(null);

		//  backup the original function
		mXHRFunctions[sXHRMethod] = window.XMLHttpRequest.prototype[sXHRMethod];

		window.XMLHttpRequest.prototype[sXHRMethod] = function() {
			var oArgs = arguments;

			// call the original function first
			mXHRFunctions[sXHRMethod].apply(this, oArgs);

			// call the registered callbacks in order of their registration
			for (var sName in mRegistry[sXHRMethod]) {
				mRegistry[sXHRMethod][sName].apply(this, oArgs);
			}

		};

	}

	/**
	 * @namespace
	 * @since 1.58
	 * @alias module:sap/ui/performance/XHRInterceptor
	 * @private
	 * @ui5-restricted sap.ui.performance.trace
	 */
	var oXHRInterceptor = {
		/**
		 * Register a function callback which gets called as it would be an own method of XHR.
		 *
		 * @param {string} sName Name under which the function is registered
		 * @param {string} sXHRMethod Name of the actual XHR method
		 * @param {function} fnCallback The registered callback function
		 * @private
		 * @ui5-restricted sap.ui.performance.trace
		 */
		register: function(sName, sXHRMethod, fnCallback) {
			Log.debug("Register '" + sName + "' for XHR function '" + sXHRMethod + "'", XHRINTERCEPTOR);

			// initially the override needs to be placed per XHR method
			if (!mRegistry[sXHRMethod]) {
				createOverride(sXHRMethod);
			}
			mRegistry[sXHRMethod][sName] = fnCallback;
		},

		/**
		 * Unregister a registered function.
		 *
		 * @param {string} sName Name under which the function is registered
		 * @param {string} sXHRMethod Name of the actual XHR method
		 * @return {boolean} True if unregister was successful
		 * @private
		 * @ui5-restricted sap.ui.performance.trace.FESR
		 */
		unregister: function(sName, sXHRMethod) {
			var bRemove = delete mRegistry[sXHRMethod][sName];
			Log.debug("Unregister '" + sName + "' for XHR function '" + sXHRMethod + (bRemove ? "'" : "' failed"), XHRINTERCEPTOR);
			return bRemove;
		},

		/**
		 * Checks if a function is registered for a specific XHR method.
		 *
		 * @param {string} sName Name under which the function is registered
		 * @param {string} sXHRMethod Name of the actual XHR method (e.g., "open", "send", "setRequestHeader")
		 * @returns {boolean} True if a function is registered under the given name for the XHR method, false otherwise
		 * @private
		 * @ui5-restricted sap.ui.performance.trace.FESR
		 */
		isRegistered: function(sName, sXHRMethod) {
			return mRegistry[sXHRMethod] && mRegistry[sXHRMethod][sName];
		}

	};

	return oXHRInterceptor;
});
