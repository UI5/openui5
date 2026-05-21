/*!
 * ${copyright}
 */

// Provides utility class sap.ui.core.BlockLayerUtils
sap.ui.define([
	"sap/ui/events/jquery/EventTriggerHook",
	"sap/base/Log",
	"sap/ui/dom/findTabbable",
	"sap/ui/thirdparty/jquery"
], function(EventTriggerHook, Log, findTabbable, jQuery) {
	"use strict";

	/**
	 * @alias sap.ui.core.BlockLayerUtils
	 * @static
	 * @private
	 * @ui5-restricted sap.ui.core.Control
	 */
	var BlockLayerUtils = {},
		aPreventedEvents = ["keypress", "mousedown", "touchstart", "touchmove", "mouseup", "touchend", "click"],
		rForbiddenTags = /^(?:area|base|br|col|embed|hr|img|input|keygen|link|menuitem|meta|param|source|track|wbr|tr)$/i;

	/**
	 * Creates a block-state for the given Control and its defined section.
	 * The returned block-state object contains all jQuery objects related to the newly added blocking layer.
	 *
	 * Example:
	 * oBlockState: {
	 * 	$parent: {...},     // The jQuery-wrapped DOM ref of the given control
	 * 	$blockLayer: {...}, // The jQuery-wrapped DOM ref of the added block layer
	 * 	control: {...}      // The blocked control instance
	 * }
	 *
	 * Child elements of the blocked section are marked as <code>inert</code> and focus-redirect
	 * listeners are attached to the control's DOM ref.
	 * When unblock() is called all modifications will be cleaned up completely.
	 *
	 * @param  {sap.ui.core.Control} oControl The specified control to block
	 * @param  {string} sBlockedLayerId The block layer ID
	 * @param  {string} sBlockedSection The block section ID
	 * @returns {object|undefined} The block-state object containing the parent and block layer DOM or <code>undefined</code> if no valid control instance is provided.
	 *
	 * @static
	 * @private
	 */
	BlockLayerUtils.block = function(oControl, sBlockedLayerId, sBlockedSection) {
		var oParentDomRef, sTag, oBlockState, oBlockLayerDOM;

		if (oControl) {
			// Retrieves a nested dom ref, but only if the sBlockSection is correctly prefixed with the control-id (best practice)
			oParentDomRef = oControl.getDomRef(sBlockedSection);

			// Fallback if nested dom ref could not be retrieved
			if (!oParentDomRef) {
				oParentDomRef = oControl.getDomRef();
			}
			// if no blocked section/control DOM could be retrieved -> the control is not part of the dom anymore
			// this might happen in certain scenarios when e.g. a dialog is closed faster than the busyIndicatorDelay
			if (!oParentDomRef) {
				Log.warning("BlockLayer could not be rendered. The outer Control instance is not valid anymore or was not rendered yet.");
				return;
			}
			// Check if DOM Element where the busy indicator is supposed to be placed can handle content
			sTag = oParentDomRef.tagName;

			if (rForbiddenTags.test(sTag)) {
				Log.warning("BusyIndicator cannot be placed in elements with tag '" + sTag + "'.");
				return;
			}

			// the block-state contains all relevant DOM elements for the blocked UI sections
			oBlockLayerDOM = fnAddHTML(oParentDomRef, sBlockedLayerId);

			oBlockState = {
				$parent: jQuery(oParentDomRef),
				$blockLayer: jQuery(oBlockLayerDOM),
				control: oControl
			};

			//check if the control has static position, if this is the case we need to change it,
			//because we relay on relative/absolute/fixed positioning
			if (oBlockState.$parent.css('position') == 'static') {
				if (oParentDomRef.style && oParentDomRef.style.position === "static") {
					oBlockState.originalPosition = 'static';
				}
				oBlockState.$parent.css('position', 'relative');
				oBlockState.positionChanged = true;
			}

			fnHandleInteraction.call(oBlockState, true);
		} else {
			Log.warning("BlockLayer couldn't be created. No Control instance given.");
		}

		return oBlockState;
	};

	/**
	 * Removes the block-state
	 * @param  {object} oBlockState The block-state to be removed
	 * @static
	 * @private
	 */
	BlockLayerUtils.unblock = function(oBlockState) {
		if (oBlockState) {
			// reset the position css attribute to its original value (only used for the value "static")
			if (oBlockState.originalPosition) {
				oBlockState.$parent.css('position', oBlockState.originalPosition);
			} else if (oBlockState.positionChanged) {
				// reset the position set to 'relative' by the BlockLayer itself
				oBlockState.$parent.css('position', "");
			}

			// deregister handlers and remove inert from content children
			fnHandleInteraction.call(oBlockState, false);

			// remove blocklayer from dom
			oBlockState.$blockLayer.remove();
		}
	};

	/**
	 * Toggles busy indicator animation for the shared block layer.
	 * @param  {object} oBlockState The shared block-state on which the animation gets toggled
	 * @param  {boolean} bShow  Flag to indicate whether the animation should be shown or hidden
	 * @private
	 */
	BlockLayerUtils.toggleAnimationStyle = function(oBlockState, bShow) {
		var $BS = jQuery(oBlockState.$blockLayer.get(0));
		if (bShow) {
			// show busy animation in shared block-layer
			// marker class for a standalone block-layer is removed
			$BS.removeClass("sapUiHiddenBusyIndicatorAnimation");
			$BS.removeClass("sapUiBlockLayerOnly");
		} else {
			// Hide animation in shared block layer
			$BS.addClass("sapUiBlockLayerOnly");
			$BS.addClass("sapUiHiddenBusyIndicatorAnimation");
		}
	};

	/**
	 * Adds the BlockLayer to the given DOM.
	 *
	 * @param {Element} oBlockSection The DOM element to append the block layer to.
	 * @param {string} sBlockedLayerId The ID for the block layer element
	 * @returns {HTMLElement} The block layer DOM element
	 *
	 * @private
	 */
	function fnAddHTML (oBlockSection, sBlockedLayerId) {
		var oContainer = document.createElement("div");
		oContainer.id = sBlockedLayerId;
		oContainer.classList.add("sapUiBlockLayer");

		// Make the block layer the single tab stop of the blocked section. All other
		// content is marked inert, and focus entering the section is redirected here.
		oContainer.setAttribute("tabindex", "0");

		oBlockSection.appendChild(oContainer);

		return oContainer;
	}

	/**
	 * Sets or clears the <code>inert</code> attribute on all child elements of the blocked section
	 * (excluding the block layer itself), and registers or removes focus redirect event listeners
	 * on the control's DOM ref.
	 *
	 * All calls are bound to the block-state object via <code>call(oBlockState, ...)</code>,
	 * so <code>this</code> always references the block-state.
	 *
	 * @param {boolean} bEnabled Whether to enable (<code>true</code>) or disable (<code>false</code>) the blocked state
	 * @private
	 */
	function fnHandleInteraction (bEnabled) {
		var oParentDOM = this.$parent.get(0);

		if (bEnabled) {
			if (oParentDOM) {
				var oBlockLayerDOM = this.$blockLayer.get(0);

				for (const childElement of oParentDOM.children) {
					if (childElement === oBlockLayerDOM) {
						continue;
					}
					childElement.inert = true;
				}

				// The sentinel spans that used to trap the tab chain are gone. Instead, the busy
				// indicator (block layer) is the single tab stop and all other content is inert.
				// This handler catches focus that enters the blocked section (e.g. by clicking or
				// programmatic focus on the control root) and redirects it onto the busy indicator.
				// "focusin" (unlike "focus") bubbles, so a listener on the control root receives
				// focus events targeting the root itself as well as any descendant.
				this.fnRedirectFocus = redirectFocus.bind(this);
				oParentDOM.addEventListener("focusin", this.fnRedirectFocus);

				this._fnSuppressDefaultAndStopPropagationHandler = suppressDefaultAndStopPropagation.bind(this);

				this._aSuppressHandler = registerInteractionHandler.call(this, this._fnSuppressDefaultAndStopPropagationHandler);
			} else {
				Log.warning("fnHandleInteraction called with bEnabled true, but no DOMRef exists!");
			}
		} else {
			if (oParentDOM) {
				for (const childElement of oParentDOM.children) {
					childElement.removeAttribute("inert");
				}

				if (this.fnRedirectFocus) {
					oParentDOM.removeEventListener("focusin", this.fnRedirectFocus);
				}
			}

			delete this.fnRedirectFocus;

			//trigger handler deregistration needs to be done even if DomRef is already destroyed
			deregisterInteractionHandler.call(this, this._fnSuppressDefaultAndStopPropagationHandler);
		}

		/**
		 * Handler which suppresses event bubbling for blocked section
		 *
		 * @param {object} oEvent The event on the suppressed DOM
		 * @private
		 */
		function suppressDefaultAndStopPropagation(oEvent) {
			const bIsBlocked = !!this.control.getBlocked();
			const bIsBusy = !!this.control.getBusy();

			if (!bIsBlocked && !bIsBusy) {
				// If the control is not blocked anymore, we do not need to suppress events
				return;
			}

			const oBlockLayerDOM = this.$blockLayer.get(0);

			// The busy indicator (block layer) is the single tab stop while busy. Interactions
			// targeting it must be allowed so it can be focused (mouse/touch), left again (Tab)
			// and navigated with the arrow keys, while all other interaction on the
			// blocked/inert content is suppressed.
			if (oEvent.target === oBlockLayerDOM) {
				if (["mousedown", "touchstart"].includes(oEvent.type)) {
					// Do not "preventDefault" so the click can focus the busy indicator
					oEvent.stopImmediatePropagation();
					return;
				}

				const iKey = oEvent.keyCode || oEvent.which;

				// Let "Tab" move focus out of the busy section (inert children are skipped)
				if (oEvent.type === "keydown" && iKey === 9 /* Tab */) {
					return;
				}

				// Arrow keys are forwarded to the busy control's own keyboard navigation, which
				// knows the layout (linear list, 2D grid, table). The busy indicator is not a
				// navigable item, so re-dispatch the key on the busy section root and let the
				// control move focus. If the control has no such navigation, nothing happens.
				if (oEvent.type === "keydown" && iKey >= 37 && iKey <= 40) {
					oEvent.preventDefault();
					oEvent.stopImmediatePropagation();
					forwardArrowKey.call(this, oEvent, iKey);
					return;
				}
			}

			oEvent.stopImmediatePropagation();
			oEvent.preventDefault();
		}

		/**
		 * Captures focus that enters the blocked section and redirects it onto the busy indicator.
		 *
		 * The busy indicator (block layer) is the single tab stop while the section is busy;
		 * all other content is <code>inert</code>. This replaces the sentinel spans that
		 * previously trapped the tab chain.
		 *
		 * @param {FocusEvent} oEvent The <code>focusin</code> event on the control's DOM ref
		 * @private
		 */
		function redirectFocus(oEvent) {
			var oBlockLayerDOM = this.$blockLayer.get(0);

			// Ignore the focusin that results from focusing the busy indicator itself,
			// otherwise we would re-enter this handler in an endless loop. This event is
			// allowed to propagate so the framework tracks the busy indicator as focused.
			if (!oBlockLayerDOM || oEvent.target === oBlockLayerDOM) {
				return;
			}

			// Backward tab (Shift+Tab) from the busy indicator onto a tabbable section root:
			// the busy indicator sits inside the root, so the browser moves
			// focus onto the root, which would otherwise bounce straight back to the indicator.
			// Instead let focus escape to the previous tabbable element (in document order).
			if (oEvent.target === this.$parent.get(0) && oEvent.relatedTarget === oBlockLayerDOM) {
				// Search backwards from the busy section root; its children (incl. the indicator)
				// are not traversed, so focus lands on the tabbable element preceding the section.
				var oResult = findTabbable(this.$parent.get(0), { forward: false });
				if (oResult && oResult.element && !oResult.startOver) {
					oResult.element.focus();
					oEvent.stopImmediatePropagation();
					return;
				}
			}

			// Move focus onto the busy indicator (this fires its own focusin, which propagates),
			// then stop the original - now stale - focusin so that focusin delegates of the
			// control and its ancestors don't react to focus we just redirected away.
			oBlockLayerDOM.focus({ preventScroll: true });
			oEvent.stopImmediatePropagation();
		}

		/**
		 * Forwards an arrow key that was pressed while the busy indicator is focused to the busy
		 * control's own keyboard navigation.
		 *
		 * The busy indicator is not a navigable item of the control, so a fresh keyboard event is
		 * re-dispatched on the busy section root (which typically is a navigable item, e.g. a list
		 * item). The control's navigation delegate (e.g. {@link sap.ui.core.delegate.ItemNavigation})
		 * then moves focus using its own layout knowledge - linear, grid or table. If the control
		 * has no such navigation, the dispatched event has no effect.
		 *
		 * @param {jQuery.Event} oEvent The original arrow keydown event on the busy indicator
		 * @param {int} iKey The <code>keyCode</code> of the pressed arrow key
		 * @private
		 */
		function forwardArrowKey(oEvent, iKey) {
			var oParentDOM = this.$parent.get(0);
			if (!oParentDOM) {
				return;
			}

			var oForwardedEvent = new KeyboardEvent("keydown", {
				bubbles: true,
				cancelable: true,
				key: oEvent.key,
				code: oEvent.code,
				shiftKey: oEvent.shiftKey,
				altKey: oEvent.altKey,
				ctrlKey: oEvent.ctrlKey,
				metaKey: oEvent.metaKey
			});
			// The KeyboardEvent constructor does not reliably set "keyCode"/"which", but UI5's
			// keyboard event mapping (PseudoEvents) relies on them - so define them explicitly.
			Object.defineProperty(oForwardedEvent, "keyCode", { get: function() { return iKey; } });
			Object.defineProperty(oForwardedEvent, "which", { get: function() { return iKey; } });

			oParentDOM.dispatchEvent(oForwardedEvent);
		}

		/**
		 * Register event handler to suppress event within busy section
		 *
		 * @param {function} fnHandler The handler function
		 * @returns {function[]} The suppress handlers
		 */
		function registerInteractionHandler(fnHandler) {
			var aSuppressHandler = [],
				oParentDOM = this.$parent.get(0),
				oBlockLayerDOM = this.$blockLayer.get(0);

			for (var i = 0; i < aPreventedEvents.length; i++) {
				// Add event listeners with "useCapture" settings to suppress events before dispatching/bubbling starts
				oParentDOM.addEventListener(aPreventedEvents[i], fnHandler, {
					capture: true,
					passive: false
				});
				aSuppressHandler.push(EventTriggerHook.suppress(aPreventedEvents[i], oParentDOM, oBlockLayerDOM));
			}
			//for jQuery triggered events we also need the keydown handler
			this.$blockLayer.on('keydown', fnHandler);

			return aSuppressHandler;
		}

		/**
		 * Deregister event handler to suppress event within busy section
		 *
		 * @param {function} fnHandler The handler function
		 */
		function deregisterInteractionHandler(fnHandler) {
			var i,
				oParentDOM = this.$parent.get(0),
				oBlockLayerDOM = this.$blockLayer.get(0);

			if (oParentDOM) {
				for (i = 0; i < aPreventedEvents.length; i++) {
					// Remove event listeners with "useCapture" settings
					oParentDOM.removeEventListener(aPreventedEvents[i], fnHandler, {
						capture: true,
						passive: false
					});
				}
			}
			if (this._aSuppressHandler) {
				for (i = 0; i < this._aSuppressHandler.length; i++) {
					// this part should be done even no DOMRef exists
					EventTriggerHook.release(this._aSuppressHandler[i]);
				}
			}
			if (oBlockLayerDOM) {
				this.$blockLayer.off('keydown', fnHandler);
			}
		}
	}

	return BlockLayerUtils;

});
