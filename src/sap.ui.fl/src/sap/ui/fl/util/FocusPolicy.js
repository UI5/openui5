/*!
 * ${copyright}
 */

sap.ui.define([], () => {
	"use strict";

	/**
	 * Utility for checking Permissions Policy support for focus control.
	 * This utility can be removed once the "focus-without-user-activation" Permissions Policy is implemented in all supported browsers.
	 *
	 * @namespace
	 * @private
	 * @ui5-restricted sap.ui.fl, sap.ui.rta
	 * @since 1.149
	 */
	const FocusPolicy = {
		/**
		 * Checks whether the browser supports the "focus-without-user-activation" Permissions Policy.
		 * The result is cached on the first call since the browser capability cannot change at runtime.
		 *
		 * @returns {boolean} Whether the policy is supported
		 */
		isFocusPolicySupported() {
			if (FocusPolicy._bSupported === undefined) {
				const oPolicy = document.permissionsPolicy || document.featurePolicy;
				FocusPolicy._bSupported = !!oPolicy?.features().includes("focus-without-user-activation");
			}
			return FocusPolicy._bSupported;
		}
	};

	return FocusPolicy;
});
