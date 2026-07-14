/*!
 * ${copyright}
 */

// Provides class sap.ui.core.tooltip.TooltipEventTrigger.
sap.ui.define([
	"sap/ui/Device",
	"sap/ui/base/Object"
],
	function(
		Device,
		BaseObject
	) {
		"use strict";

		// Long-press threshold in ms for touch devices.
		const LONG_PRESS_MS = 500;

		/**
		 * Constructor for a new <code>sap.ui.core.tooltip.TooltipEventTrigger</code>.
		 *
		 * @param {object} oConfig Configuration for the trigger.
		 * @param {function(boolean)} oConfig.onOpen Callback invoked when a gesture asks to open the tooltip. Receives <code>true</code> for deferred gestures (hover, keyboard focus). Invoked with no argument for instant gestures (long-press).
		 * @param {function(boolean)} oConfig.onClose Callback invoked when a gesture asks to close the tooltip. Receives <code>true</code> for deferred gestures (mouseleave, focusout). Invoked with no argument for instant gestures (left mousedown, Escape).
		 * @param {function():boolean} oConfig.isPendingOrOpen Predicate used by the Escape handler to decide whether to consume the key.
		 * @param {boolean} [oConfig.enableForTouchDevices=true] Whether long-press should open the tooltip on touch devices.
		 *
		 * @class
		 * Translates raw DOM gestures (hover, keyboard focus, Escape, long-press)
		 * on a given DOM element into open/close signals delivered via the
		 * configured callbacks. The trigger is host-agnostic: callers attach it
		 * to a DOM element via {@link #attach} and detach it via {@link #detach}.
		 *
		 * Only one DOM element is attached at a time. Calling <code>attach</code>
		 * for a different element detaches the current one first — callers do
		 * not need to track the currently attached ref themselves.
		 *
		 * @author SAP SE
		 * @version ${version}
		 *
		 * @extends sap.ui.base.Object
		 *
		 * @since 1.151
		 * @constructor
		 * @private
		 * @alias sap.ui.core.tooltip.TooltipEventTrigger
		 */
		const TooltipEventTrigger = BaseObject.extend("sap.ui.core.tooltip.TooltipEventTrigger", /** @lends sap.ui.core.tooltip.TooltipEventTrigger.prototype */ {
			constructor: function(oConfig) {
				BaseObject.apply(this);

				oConfig = oConfig || {};

				this._fnOnOpen = oConfig.onOpen;
				this._fnOnClose = oConfig.onClose;
				this._fnIsPendingOrOpen = oConfig.isPendingOrOpen;
				this._bEnableForTouchDevices = oConfig.enableForTouchDevices !== false;

				this._oDomRef = null;
				// Array of [type, handler] pairs recorded by _on for later removal.
				this._aListeners = [];
				this._iLongPressTimer = null;
			}
		});

		/**
		 * Toggles the long-press / contextmenu branch. If a DOM element is
		 * currently attached, it is re-wired so the new state takes effect
		 * immediately.
		 * @public
		 * @param {boolean} bEnable
		 * @returns {this}
		 */
		TooltipEventTrigger.prototype.setEnableForTouchDevices = function(bEnable) {
			this._bEnableForTouchDevices = !!bEnable;

			if (this._oDomRef) {
				const oDomRef = this._oDomRef;
				this.detach();
				this.attach(oDomRef);
			}
			return this;
		};

		/**
		 * @public
		 * @returns {boolean}
		 */
		TooltipEventTrigger.prototype.getEnableForTouchDevices = function() {
			return this._bEnableForTouchDevices;
		};

		/**
		 * Attaches gesture listeners to the given DOM element. If another
		 * element is already attached, it is detached first — attaching is
		 * idempotent from the caller's point of view.
		 *
		 * @public
		 * @param {HTMLElement} oDomRef
		 * @returns {this}
		 */
		TooltipEventTrigger.prototype.attach = function(oDomRef) {
			if (!oDomRef) {
				return this;
			}
			if (this._oDomRef === oDomRef) {
				return this;
			}
			if (this._oDomRef) {
				this.detach();
			}

			this._oDomRef = oDomRef;

			if (Device.system.desktop || Device.system.combi) {
				// Left mousedown (normal activation) closes the tooltip immediately.
				// Right mousedown is left to the browser's contextmenu gesture.
				this._on("mousedown", (e) => {
					if (e.button === 2) {
						return;
					}
					const oSel = window.getSelection && window.getSelection();
					if (oSel && oSel.toString().length > 0) {
						return;
					}
					this._fnOnClose();
				});

				this._on("mouseenter", () => {
					// If a text selection exists, the user is likely about to right-click
					// for the context menu (or is mid-drag-select). Opening would clear it.
					const oSel = window.getSelection && window.getSelection();
					if (oSel && oSel.toString().length > 0) {
						return;
					}
					this._fnOnOpen(true);
				});

				this._on("mouseleave", () => {
					this._fnOnClose(true);
				});

				// Open on keyboard focus only (not on initial programmatic focus).
				// :focus-visible is the standard CSS/DOM signal that distinguishes
				// keyboard focus from mouse/programmatic focus.
				this._on("focusin", () => {
					if (!(oDomRef.matches && oDomRef.matches(":focus-visible"))) {
						return;
					}
					this._fnOnOpen(true);
				});

				this._on("focusout", () => {
					this._fnOnClose(true);
				});

				// Escape closes a pending or open tooltip without swallowing the event
				// from ancestor handlers (e.g. a Dialog's Escape).
				this._on("keydown", (e) => {
					if (e.key !== "Escape") {
						return;
					}
					if (this._fnIsPendingOrOpen && this._fnIsPendingOrOpen()) {
						this._fnOnClose();
						e.preventDefault();
					}
				});
			}

			// Touch-only (phone or tablet, not combi)
			if ((Device.system.phone || Device.system.tablet) && !Device.system.combi) {
				this._on("contextmenu", (e) => {
					const bDisabled = !this._bEnableForTouchDevices;

					// @todo review the need of webkitTouchCallout. We should try all we can to avoid side effects on the element, or at least we need to properly restore this
					// if (Device.os.ios) {
					// 	oDomRef.style.webkitTouchCallout = bDisabled ? "default" : "none";
					// }

					if (!bDisabled) {
						e.preventDefault();
					}
				});

				this._on("touchstart", () => {
					if (!this._bEnableForTouchDevices) {
						return;
					}
					clearTimeout(this._iLongPressTimer);
					this._iLongPressTimer = setTimeout(() => {
						this._iLongPressTimer = null;
						this._fnOnOpen();
					}, LONG_PRESS_MS);
				});
				this._on("touchmove", () => {
					clearTimeout(this._iLongPressTimer);
					this._iLongPressTimer = null;
				});
				this._on("touchend", () => {
					clearTimeout(this._iLongPressTimer);
					this._iLongPressTimer = null;
				});
				this._on("touchcancel", () => {
					clearTimeout(this._iLongPressTimer);
					this._iLongPressTimer = null;
				});
			}

			return this;
		};

		/**
		 * Detaches gesture listeners from the currently attached DOM element,
		 * if any. Safe to call when nothing is attached.
		 *
		 * @public
		 * @returns {this}
		 */
		TooltipEventTrigger.prototype.detach = function() {
			if (!this._oDomRef) {
				return this;
			}
			const oCurrent = this._oDomRef;
			if (this._iLongPressTimer) {
				clearTimeout(this._iLongPressTimer);
				this._iLongPressTimer = null;
			}
			this._aListeners.forEach(([sType, fnHandler]) => {
				oCurrent.removeEventListener(sType, fnHandler);
			});
			this._aListeners = [];
			this._oDomRef = null;
			return this;
		};

		/**
		 * Disposes the trigger: detaches the currently attached DOM element, if any.
		 * @public
		 */
		TooltipEventTrigger.prototype.destroy = function() {
			this.detach();
			this._fnOnOpen = null;
			this._fnOnClose = null;
			this._fnIsPendingOrOpen = null;
			BaseObject.prototype.destroy.apply(this, arguments);
		};

		/**
		 * Adds a single event listener on the currently attached DOM element
		 * and records it for later removal by {@link #detach}.
		 * @private
		 * @param {string} sType
		 * @param {function} fnHandler
		 */
		TooltipEventTrigger.prototype._on = function(sType, fnHandler) {
			this._oDomRef.addEventListener(sType, fnHandler);
			this._aListeners.push([sType, fnHandler]);
		};

		return TooltipEventTrigger;
	});
