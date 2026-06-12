/*!
 * ${copyright}
 */

// Provides control sap.m.Tooltip.
sap.ui.define([
	"sap/m/library",
	"sap/ui/core/Control",
	"sap/ui/Device",
	"sap/m/Text",
	"sap/ui/core/InvisibleText",
	"sap/m/Popover"
],
	function(
		library,
		Control,
		Device,
		Text,
		InvisibleText,
		Popover
	) {
		"use strict";

		const PlacementType = library.PlacementType;

		// Shortened open/close delay
		const TOOLTIP_HANDOFF_DELAY = 200;

		/**
		* Constructor for a new Tooltip.
		*
		* @param {string} [sId] ID for the new control, generated automatically if no ID is given
		* @param {object} [mSettings] Initial settings for the new control
		*
		* @class
		* The tooltip displays a short, non-interactive text near a control to provide supplementary information about it.
		*
		* <h3>Overview</h3>
		* The tooltip is shown on hover or keyboard focus on desktop, and on long-press on touch devices.
		*
		* <h3>Usage</h3>
		* Use the tooltip for brief, supplementary information about a control.
		*
		* <h4>When to use:</h4>
		* <ul>
		* <li>For interactive controls without a visible label, such as icon buttons or avatars.</li>
		* <li>To display supplementary, non-critical descriptions for elements such as icon buttons with badges. Users should still be able to complete their task without this information.</li>
		* <li>To show a keyboard shortcut for an action.</li>
		* <li>To display the full version of truncated text on a specific control, when no other wrapping or truncation pattern can be applied.</li>
		* </ul>
		*
		* <h4>When not to use:</h4>
		* <ul>
		* <li>If you want to label a control, use a label instead.</li>
		* <li>If you want to provide a large amount of information about the control, use a popover.</li>
		* <li>If you need to include an interactive element or formatted text within the additional information, use a popover.</li>
		* <li>If the information is essential for completing the task. Don't hide critical information in a tooltip.</li>
		* <li>If you need to display long truncated text, use another wrapping or truncation pattern.</li>
		* <li>If you need to provide in-app help such as context help or guided tour, use SAP Companion.</li>
		* </ul>
		*
		* <h3>Accessibility</h3>
		* Use aria-describedBy to associate the tooltip with the control it describes.
		*
		* @extends sap.ui.core.Control
		* @implements sap.ui.core.PopupInterface
		* @author SAP SE
		* @version ${version}
		*
		* @private
		* @alias sap.m.Tooltip
		*/
		const Tooltip = Control.extend("sap.m.Tooltip", /** @lends sap.m.Tooltip.prototype */ {
			metadata: {
				interfaces: [
					"sap.ui.core.PopupInterface"
				],
				library: "sap.m",
				properties: {
					/**
					 * The text of the tooltip.
					 */
					text: {type: "string", group: "Appearance", defaultValue: ""},

					/**
					 * If mobile context menu should open first instead of the tooltip
					 */
					disabledForMobile: {type: "boolean", group: "Appearance", defaultValue: false},

					/**
					 * Defines the placement of the tooltip relative to its target.
					 */
					placement: {
						type: "sap.m.PlacementType", group: "Behavior", defaultValue: PlacementType.VerticalPreferredTop
					},

					/**
					 * Defines the delay in milliseconds after which the tooltip will be shown.
					 * <b>Note:</b> The delay of show/dismiss Tooltip only applies on mouse and keyboard focus.
					 * With gesture from touch and keyboard shortcut, the tooltip will be displayed / dismissed immediately.
					 */
					delay: {type: "int", group: "Behavior", defaultValue: 500}
				}
			},
			renderer: {
				apiVersion: 2,
				render: function () {}
			}
		});

		Tooltip.prototype.exit = function () {

			this._removeAriaDescribedBy();

			if (this._oInvisibleText) {
				this._oInvisibleText.destroy();
				this._oInvisibleText = null;
			}

			if (this._oPopover) {
				this._oPopover.destroy();
				this._oPopover = null;
			}
			this._pPopover = null;

			if (this._iOpenTimeout) {
				clearTimeout(this._iOpenTimeout);
				this._iOpenTimeout = null;
			}

			if (this._iCloseTimeout) {
				clearTimeout(this._iCloseTimeout);
				this._iCloseTimeout = null;
			}

			this._bOpenRequested = false;
			Tooltip.registry.delete(this);
		};

		Tooltip.prototype._onPopoverMouseEnter = function () {
			if (this._iCloseTimeout) {
				clearTimeout(this._iCloseTimeout);
				this._iCloseTimeout = null;
			}
			this._bIsMouseOver = true;
		};

		Tooltip.prototype._onPopoverMouseLeave = function () {
			this._bIsMouseOver = false;
			if (this._bIsOpen) {
				this.close(500);
			}
		};

		Tooltip.prototype._applyPlacementClass = function () {
			const oDomRef = this._oPopover && this._oPopover.getDomRef();
			if (!oDomRef) {
				return;
			}
			// Reflect the *resolved* placement (after any auto-flip by Popover) on the popover root.
			// The base TooltipPlacementType-style classes drive the LESS pseudo-elements that extend
			// the clickable area beyond the arrow so the tooltip stays open when the mouse moves
			// over the gap between popover body and target element.
			oDomRef.classList.remove("sapMTooltipTop", "sapMTooltipBottom", "sapMTooltipLeft", "sapMTooltipRight");
			const sCalcedPos = this._oPopover._getCalculatedPlacement && this._oPopover._getCalculatedPlacement();
			if (sCalcedPos === "Top" || sCalcedPos === "Bottom" || sCalcedPos === "Left" || sCalcedPos === "Right") {
				oDomRef.classList.add("sapMTooltip" + sCalcedPos);
			}
		};

		Tooltip.prototype._popoverAfterRendering = function () {
			const oDomRef = this._oPopover.getDomRef();

			// During the first afterRendering of the Popover, _calcPlacement has not yet run for
			// non-strict placements, so the class may be applied again from afterOpen below.
			this._applyPlacementClass();

			// Bind mouse handlers exactly once per Popover DOM node. Re-renders may produce a new
			// node (or the same node), so we tag it to detect first time vs. repeat.
			if (oDomRef._sapMTooltipMouseBound !== this.getId()) {
				oDomRef._sapMTooltipMouseBound = this.getId();
				oDomRef.addEventListener("mouseenter", this._onPopoverMouseEnter.bind(this));
				oDomRef.addEventListener("mouseleave", this._onPopoverMouseLeave.bind(this));
			}
		};

		// Strict edges (Top/Bottom/Left/Right) do not flip in Popover.
		const mPromoteToPreferred = {
			[PlacementType.Top]: PlacementType.VerticalPreferredTop,
			[PlacementType.Bottom]: PlacementType.VerticalPreferredBottom,
			[PlacementType.Left]: PlacementType.HorizontalPreferredLeft,
			[PlacementType.Right]: PlacementType.HorizontalPreferredRight
		};

		// Popover has a known issue with Preferred*OrFlip: when the preferred side
		// has insufficient space, _calcHorizontal/_calcVertical correctly set
		// _oCalcedPos to the opposite side, but _getOffsetX/_getOffsetY then add
		// an extra ±parentWidth/Height shift on top, double-counting the flip and
		// leaving the popover overlapping the opener. Until that is fixed in
		// Popover, the Tooltip side-steps the broken path: when the preferred
		// side does not have enough room for the popover, we return the strict
		// opposite edge (which mPromoteToPreferred then re-routes through
		// Popover's correct HorizontalPreferred* / VerticalPreferred* path).
		// Conservative defaults are used for the very first open, where the
		// popover has not been rendered yet and its real dimensions are unknown.
		const FALLBACK_TOOLTIP_WIDTH = 200;
		const FALLBACK_TOOLTIP_HEIGHT = 40;

		Tooltip.prototype._resolvePlacement = function (oControl) {
			const sPlacement = this.getPlacement();
			// Only the Preferred*OrFlip placements need the measurement-based fallback;
			// every other value is forwarded as-is.
			if (sPlacement !== PlacementType.PreferredRightOrFlip
				&& sPlacement !== PlacementType.PreferredLeftOrFlip
				&& sPlacement !== PlacementType.PreferredTopOrFlip
				&& sPlacement !== PlacementType.PreferredBottomOrFlip) {
				return sPlacement;
			}
			const oHost = this._getHostElement(oControl);
			if (!oHost) {
				return sPlacement;
			}
			const oRect = oHost.getBoundingClientRect();
			// Use the Popover's rendered size after the first open; before that
			// fall back to conservative estimates that match a typical tooltip.
			const $popover = this._oPopover && this._oPopover.$ && this._oPopover.$();
			const iPopoverWidth = ($popover && $popover.length && $popover.outerWidth()) || FALLBACK_TOOLTIP_WIDTH;
			const iPopoverHeight = ($popover && $popover.length && $popover.outerHeight()) || FALLBACK_TOOLTIP_HEIGHT;
			const iArrow = (this._oPopover && this._oPopover._arrowOffset) || 18;

			switch (sPlacement) {
				case PlacementType.PreferredRightOrFlip:
					return (window.innerWidth - oRect.right) > (iPopoverWidth + iArrow) ? sPlacement : PlacementType.Left;
				case PlacementType.PreferredLeftOrFlip:
					return oRect.left > (iPopoverWidth + iArrow) ? sPlacement : PlacementType.Right;
				case PlacementType.PreferredTopOrFlip:
					return oRect.top > (iPopoverHeight + iArrow) ? sPlacement : PlacementType.Bottom;
				case PlacementType.PreferredBottomOrFlip:
					return (window.innerHeight - oRect.bottom) > (iPopoverHeight + iArrow) ? sPlacement : PlacementType.Top;
				default:
					return sPlacement;
			}
		};

		/**
		 * Opens the tooltip next to the given control or DOM element.
		 *
		 * @param {sap.ui.core.Control|HTMLElement} oControl The control or DOM element relative to which the tooltip is positioned.
		 * @param {int} [iDelay] Delay in milliseconds before the tooltip opens. Defaults to the value of the <code>delay</code> property.
		 * @public
		 */
		Tooltip.prototype.openBy = async function (oControl, iDelay = this.getDelay()) {

			// Mark the intent to open immediately so a close() that arrives while we
			// are still awaiting Popover instantiation can cancel the pending open.
			this._bOpenRequested = true;

			// Cache the in-flight Promise so simultaneous callers (e.g. mouseenter+focusin)
			// share a single Popover instance instead of racing and leaking duplicates.
			if (!this._oPopover) {
				if (!this._pPopover) {
					this._pPopover = this._createPopover().then((oPopover) => {
						this._oPopover = oPopover;
						return oPopover;
					});
				}
				await this._pPopover;
			}

			if (!this._bOpenRequested) {
				return;
			}

			if (this._iOpenTimeout) {
				return;
			}

			let iEffectiveDelay = iDelay;
			if (Tooltip.registry.size > 0) {
				Tooltip.closeAllButCurrent(this);
				iEffectiveDelay = TOOLTIP_HANDOFF_DELAY;
			}

			this._iOpenTimeout = setTimeout(() => {
				this._iOpenTimeout = null;
				// A close() that arrived between scheduling and firing has cleared the open intent — abort.
				if (!this._bOpenRequested) {
					Tooltip.registry.delete(this);
					return;
				}
				// Final selection guard: if a selection appeared during the open delay
				// (e.g. user is mid-drag-select or about to right-click a selection), suppress the open so the popover render does not clear the selection.
				const oSelection = window.getSelection && window.getSelection();
				if (oSelection && oSelection.toString().length > 0) {
					Tooltip.registry.delete(this);
					return;
				}
				this._oPopover.getContent()[0].setText(this.getText());
				const sPlacement = this._resolvePlacement(oControl);
				this._oPopover.setPlacement(mPromoteToPreferred[sPlacement] || sPlacement);
				this._oPopover.openBy(oControl);
				this._bIsOpen = true;
				this._setAriaDescribedBy(oControl);
			}, iEffectiveDelay);

			Tooltip.registry.add(this);
		};

		// Resolve the host control's DOM element from a UI5 control or a plain HTMLElement.
		Tooltip.prototype._getHostElement = function (oControl) {
			if (!oControl) {
				return null;
			}
			if (oControl instanceof Element) {
				return oControl;
			}
			return (oControl.getDomRef && oControl.getDomRef()) || null;
		};

		// Wire the tooltip text into the host's aria-describedby so screen readers
		// announce the tooltip content alongside the host's own accessible name.
		Tooltip.prototype._setAriaDescribedBy = function (oControl) {
			const oHost = this._getHostElement(oControl);
			if (!oHost) {
				return;
			}

			// Lazily create a single static InvisibleText carrying the tooltip's text.
			// Using core/InvisibleText avoids the need for a renderer DOM node.
			if (!this._oInvisibleText) {
				this._oInvisibleText = new InvisibleText(this.getInvisibleTooltipId());
				this._oInvisibleText.toStatic();
			}
			this._oInvisibleText.setText(this.getText());

			const sId = this._oInvisibleText.getId();
			const sExisting = oHost.getAttribute("aria-describedby") || "";
			const aIds = sExisting.split(/\s+/).filter(Boolean);
			if (!aIds.includes(sId)) {
				aIds.push(sId);
				oHost.setAttribute("aria-describedby", aIds.join(" "));
			}
			this._oAriaHost = oHost;
		};

		Tooltip.prototype._removeAriaDescribedBy = function () {
			const oHost = this._oAriaHost;
			if (!oHost || !this._oInvisibleText) {
				return;
			}
			const sId = this._oInvisibleText.getId();
			const sExisting = oHost.getAttribute("aria-describedby") || "";
			const aIds = sExisting.split(/\s+/).filter(Boolean).filter((s) => s !== sId);
			if (aIds.length) {
				oHost.setAttribute("aria-describedby", aIds.join(" "));
			} else {
				oHost.removeAttribute("aria-describedby");
			}
			this._oAriaHost = null;
		};

		Tooltip.prototype._createPopover = function () {
			return new Promise((fnResolve) => {

				const oPopover = new Popover({
					showHeader: false,
					placement: this.getPlacement(),
					modal: false,
					content: new Text(),
					afterOpen: () => {
						// At this point _calcPlacement has run, so _getCalculatedPlacement
						// returns the resolved Top/Bottom/Left/Right side.
						this._applyPlacementClass();
					},
					afterClose: () => {
						this._bIsOpen = false;
						this._bOpenRequested = false;
						this._clearTimeouts();
						this._removeAriaDescribedBy();
						Tooltip.registry.delete(this);
					}
				});


				oPopover.addStyleClass("sapMTooltip");

				oPopover.addEventDelegate({
					onAfterRendering: this._popoverAfterRendering
				}, this);

				oPopover._getInitialFocusId = () => {
					return null;
				};

				oPopover._restoreFocus = function() {
					// Do nothing - don't restore focus on close
				};

				// Popover.close() also calls Popup.applyFocusInfo(_oPreviousFocus) when
				// the focused element at close-time differs from the one at open-time.
				const fnSuperClose = oPopover.close.bind(oPopover);
				oPopover.close = function () {
					this._oPreviousFocus = null;
					return fnSuperClose.apply(this, arguments);
				};

				fnResolve(oPopover);
			});
		};

		/**
		 * Closes the tooltip if it is open.
		 *
		 * @return {this} Reference to the control instance for chaining
		 * @public
		 */
		Tooltip.prototype.close = function (delay = this.getDelay(), bFromPress = false) {
			this._clearTimeouts();
			// Cancel any in-flight openBy that is still awaiting Popover instantiation
			// (the resumed openBy checks this flag before scheduling its open timer).
			this._bOpenRequested = false;

			if (bFromPress) {
				// @todo remove this hack when button does not fire press on longpress
				if ((Device.system.phone || Device.system.tablet) && !Device.system.combi) {
					return this;
				}
			}

			const fnClose = () => {
				if (this._oPopover) {
					this._oPopover.close();
					this._bIsOpen = false;
				}
				this._removeAriaDescribedBy();
				Tooltip.registry.delete(this);
			};

			if (!delay) {
				fnClose();
			} else {
				this._iCloseTimeout = setTimeout(fnClose, delay);
			}

			return this;
		};

		Tooltip.prototype.getInvisibleTooltipId = function () {
			return this.getId() + "-invisibleTooltip";
		};

		Tooltip.prototype._clearTimeouts = function () {
			clearTimeout(this._iOpenTimeout);
			this._iOpenTimeout = null;
			clearTimeout(this._iCloseTimeout);
			this._iCloseTimeout = null;
		};

		// Start Registry
		Tooltip.registry = new Set();
		Tooltip.closeAllButCurrent = function (oCurrent) {
			Tooltip.registry.forEach((oTooltip) => {
				if (oTooltip !== oCurrent) {
					oTooltip.close(TOOLTIP_HANDOFF_DELAY);
				}
			});
		};
		// End Registry

		// Start Event Handling

		/**
		 * Wires the host's DOM element to open/close the tooltip on hover, keyboard
		 * focus, Escape (desktop/combi) and long-press (touch). Detaches any existing
		 * handlers first to prevent duplicates.
		 *
		 * @param {sap.ui.core.Control|object} oControl Host with <code>getDomRef()</code>;
		 *   <code>getAggregation("_tooltip")</code> is read for the per-tooltip
		 *   <code>delay</code> and <code>disabledForMobile</code> values.
		 * @param {function(int):void} fnCallbackOpen Called with the resolved delay to open.
		 * @param {function(int):void} fnCallbackClose Called with the resolved delay to close.
		 * @private
		 */
		// TODO: once Tooltip only attaches to UI5 Controls (not plain DOM), replace
		// the native listeners + expando bookkeeping with oControl.addDelegate()
		// so handlers follow the UI5 re-render lifecycle automatically.
		Tooltip.attachEvent = function (oControl, fnCallbackOpen, fnCallbackClose) {

			const oDomRef = oControl.getDomRef();

			// Detach any existing handlers first to prevent duplicates
			Tooltip._detachEvent(oControl);

			let iDelay = 500; // default value if the control does not have the tooltip aggregation, for example the Select arrow

			if (oControl.getAggregation) {
				iDelay = oControl.getAggregation("_tooltip")?.getDelay() ?? iDelay;
			}

			// If the control is activated (clicked/pressed), the tooltip should close immediately.
			// The close logic lives here in Tooltip.attachEvent (not in individual controls) so that
			// tooltip behavior remains centralized and no control needs to be aware of the tooltip.
			//
			// On desktop/combi, left mousedown closes any open tooltip immediately
			// (normal activation). Right mousedown (button === 2) is *not* handled here
			// because closing on right-click would race with the browser's contextmenu
			// gesture and clear an existing text selection. We also bail out when a
			// selection exists, so right-clicking after selecting text never triggers
			// any tooltip activity. On mobile, browsers synthesize a mousedown from
			// touch events — attaching it there would close the tooltip the moment a
			// long-press begins, before contextmenu fires.
			if (Device.system.desktop || Device.system.combi) {
				oDomRef.fnMouseDown = (e) => {
					if (e.button === 2) {
						return;
					}
					const oSelection = window.getSelection && window.getSelection();
					if (oSelection && oSelection.toString().length > 0) {
						return;
					}
					fnCallbackClose(0);
				};
				oDomRef.addEventListener("mousedown", oDomRef.fnMouseDown);
			}

			// Desktop and combi devices (e.g. tablets with mouse and keyboard):
			if (Device.system.desktop || Device.system.combi) {
				// add the events only on desktop and combi, those triggers brake the experience on mobile

				oDomRef.fnMouseEnter = (e) => {
					// If a text selection exists in the document, the user is likely about to
					// right-click for the context menu (or is mid-drag-select). Opening a
					// tooltip in that state would clear the selection, so skip it.
					const oSelection = window.getSelection && window.getSelection();
					if (oSelection && oSelection.toString().length > 0) {
						return;
					}
					fnCallbackOpen(iDelay);
				};
				oDomRef.addEventListener("mouseenter", oDomRef.fnMouseEnter);

				oDomRef.fnMouseLeave = (e) => {
					fnCallbackClose(iDelay);
				};
				oDomRef.addEventListener("mouseleave", oDomRef.fnMouseLeave);

				// Open on focus only when the focus is "visible" (i.e. came from keyboard
				// navigation), not on initial programmatic focus that fires on page load.
				// :focus-visible is the standard CSS/DOM signal browsers use to distinguish
				// keyboard focus from mouse/programmatic focus. This replaces the previous
				// page-wide keydown listener and makes the behavior correct for any tooltip,
				// independent of the extended tab chain feature.
				oDomRef.fnFocusIn = () => {
					if (oDomRef.matches && oDomRef.matches(":focus-visible")) {
						fnCallbackOpen(iDelay);
					}
				};
				oDomRef.addEventListener("focusin", oDomRef.fnFocusIn);

				oDomRef.fnFocusOut = () => {
					fnCallbackClose(iDelay);
				};
				oDomRef.addEventListener("focusout", oDomRef.fnFocusOut);

				// Escape handling is bound to the host element (not document) so it stays
				// scoped to the host: it cannot accidentally swallow Escape for an unrelated
				// ancestor (e.g. a Dialog) just because some other tooltip on the page is open.
				// We also treat a *pending* open delay (_iOpenTimeout) as "in flight" so a quick
				// Escape during the delay cancels the schedule instead of letting it pop later.
				oDomRef.fnKeyDown = (e) => {
					if (e.key !== "Escape") {
						return;
					}
					const oTooltip = oControl.getAggregation && oControl.getAggregation("_tooltip");
					if (oTooltip && (oTooltip._bIsOpen || oTooltip._iOpenTimeout)) {
						fnCallbackClose(0);
						// Only prevent the default — do NOT stopPropagation, so an ancestor
						// Dialog still receives Escape and can close as the user expects.
						e.preventDefault();
					}
				};
				oDomRef.addEventListener("keydown", oDomRef.fnKeyDown);
			}

			// Mobile
			// context menu should open for links
			// tooltip should open for texts, later the tooltip text can be selected to open the context menu again
			if ((Device.system.phone || Device.system.tablet) && !Device.system.combi) {

				const oTooltipAggregation = oControl.getAggregation && oControl.getAggregation("_tooltip");
				// Per design, links on mobile must always preserve their native context menu,
				// so the tooltip is disabled regardless of the user-set value.
				//  For all other elements, honor the property (default false).
				const bIsLink = oDomRef.tagName === "A";
				const bDisabledForMobile = bIsLink ||
					(oTooltipAggregation ? oTooltipAggregation.getDisabledForMobile() : false);

				// On iOS, suppress the native callout (image save / link preview) when the
				// tooltip is enabled, so the long-press gesture is fully available for the tooltip.
				if (Device.os.ios) {
					oDomRef.style.webkitTouchCallout = bDisabledForMobile ? "default" : "none";
				}

				// Prevent the native context menu when the tooltip is enabled so the
				// long-press gesture opens the tooltip instead of the browser menu.
				oDomRef.fnContextMenu = (e) => {
					if (!bDisabledForMobile) {
						e.preventDefault();
					}
				};
				oDomRef.addEventListener("contextmenu", oDomRef.fnContextMenu);

				let iTimeoutHandle;
				oDomRef.fnTouchStart = () => {
					if (!bDisabledForMobile) {
						iTimeoutHandle = setTimeout(() => fnCallbackOpen(0), iDelay);
					}
				};
				oDomRef.addEventListener("touchstart", oDomRef.fnTouchStart);

				oDomRef.fnTouchMove = () => {
					clearTimeout(iTimeoutHandle);
				};
				oDomRef.addEventListener("touchmove", oDomRef.fnTouchMove);

				oDomRef.fnTouchClear = () => {
					clearTimeout(iTimeoutHandle);
				};
				oDomRef.addEventListener("touchend", oDomRef.fnTouchClear);
				oDomRef.addEventListener("touchcancel", oDomRef.fnTouchClear);

			}
		};

		Tooltip._detachEvent = function (oControl, fnCallbackOpen, fnCallbackClose) {
			const oDomRef = oControl.getDomRef();
			if (!oDomRef) {
				return;
			}

			if (oDomRef.fnMouseDown) {
				oDomRef.removeEventListener("mousedown", oDomRef.fnMouseDown);
				oDomRef.fnMouseDown = null;
			}

			if (oDomRef.fnMouseEnter) {
				oDomRef.removeEventListener("mouseenter", oDomRef.fnMouseEnter);
				oDomRef.fnMouseEnter = null;
			}

			if (oDomRef.fnMouseLeave) {
				oDomRef.removeEventListener("mouseleave", oDomRef.fnMouseLeave);
				oDomRef.fnMouseLeave = null;
			}

			if (oDomRef.fnFocusIn) {
				oDomRef.removeEventListener("focusin", oDomRef.fnFocusIn);
				oDomRef.fnFocusIn = null;
			}

			if (oDomRef.fnFocusOut) {
				oDomRef.removeEventListener("focusout", oDomRef.fnFocusOut);
				oDomRef.fnFocusOut = null;
			}

			if (oDomRef.fnKeyDown) {
				oDomRef.removeEventListener("keydown", oDomRef.fnKeyDown);
				oDomRef.fnKeyDown = null;
			}

			if (oDomRef.fnContextMenu) {
				oDomRef.removeEventListener("contextmenu", oDomRef.fnContextMenu);
				oDomRef.fnContextMenu = null;
			}

			if (oDomRef.fnTouchStart) {
				oDomRef.removeEventListener("touchstart", oDomRef.fnTouchStart);
				oDomRef.fnTouchStart = null;
			}

			if (oDomRef.fnTouchClear) {
				oDomRef.removeEventListener("touchend", oDomRef.fnTouchClear);
				oDomRef.removeEventListener("touchcancel", oDomRef.fnTouchClear);
				oDomRef.fnTouchClear = null;
			}

			if (oDomRef.fnTouchMove) {
				oDomRef.removeEventListener("touchmove", oDomRef.fnTouchMove);
				oDomRef.fnTouchMove = null;
			}
		};

		// End Event Handling

		return Tooltip;
	});
