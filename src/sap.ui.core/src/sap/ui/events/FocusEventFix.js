/*!
 * ${copyright}
 */
/*
 * IMPORTANT: This is a private module, its API must not be used and is subject to change.
 * Code other than the OpenUI5 libraries must not introduce dependencies to this module.
 */
sap.ui.define(function() {
	"use strict";

	const _fnOriginalFocus = HTMLElement.prototype.focus;
	HTMLElement.prototype.focus = function() {
		if (document.hasFocus()) {
			_fnOriginalFocus.apply(this, arguments);
		} else {
			const oLastFocusElement = document.activeElement;

			let bEventFired = false;
			const fnFocusIn = () => { bEventFired = true; };
			this.addEventListener("focusin", fnFocusIn, { once: true });
			// fires focus/focusin immediately after calling the original 'focus' method if browser does it
			_fnOriginalFocus.apply(this, arguments);
			this.removeEventListener("focusin", fnFocusIn);

			// when focus not in browser, the focus events need to be fired manually
			if ( !bEventFired && this !== oLastFocusElement ) {
				oLastFocusElement?.dispatchEvent(new FocusEvent("focusout", {bubbles: true}));
				oLastFocusElement?.dispatchEvent(new FocusEvent("blur", {bubbles: false}));
				this.dispatchEvent(new FocusEvent("focusin", {bubbles: true}));
				this.dispatchEvent(new FocusEvent("focus", {bubbles: false}));
			}
		}
	};
});
