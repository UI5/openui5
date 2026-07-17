/*!
 * ${copyright}
 */

// Provides control sap.ui.core.tooltip.Tooltip.
sap.ui.define([
	"sap/ui/core/Control",
	"sap/ui/core/Lib",
	"sap/ui/core/tooltip/TooltipManager",
	"sap/ui/Device"
],
	function(
		Control,
		Library,
		TooltipManager,
		Device
	) {
		"use strict";

		// Placement string tokens. These match the values of sap.m.PlacementType.
		// They are kept as inline literals so this control has no static AMD
		// dependency on sap.m.library — sap.m.Popover (which understands these
		// values) is loaded lazily on first open.
		const PlacementType = {
			Top: "Top",
			Bottom: "Bottom",
			Left: "Left",
			Right: "Right",
			VerticalPreferredTop: "VerticalPreferredTop",
			VerticalPreferredBottom: "VerticalPreferredBottom",
			HorizontalPreferredLeft: "HorizontalPreferredLeft",
			HorizontalPreferredRight: "HorizontalPreferredRight",
			PreferredLeftOrFlip: "PreferredLeftOrFlip",
			PreferredRightOrFlip: "PreferredRightOrFlip",
			PreferredTopOrFlip: "PreferredTopOrFlip",
			PreferredBottomOrFlip: "PreferredBottomOrFlip"
		};

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
		* <b>Note:</b> Do not instantiate <code>sap.ui.core.tooltip.Tooltip</code> directly from
		* a control. Use {@link sap.ui.core.tooltip.TooltipEnablement} as the integration
		* point — it creates and owns a <code>sap.ui.core.tooltip.Tooltip</code> internally
		* and handles hover, focus, touch and the ARIA anchor on behalf of the
		* host control.
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
		* Use {@link sap.ui.core.tooltip.TooltipEnablement} to create an invisible tooltip and associate it with the control it describes.
		*
		* @extends sap.ui.core.Control
		* @implements sap.ui.core.PopupInterface
		* @author SAP SE
		* @version ${version}
		*
		* @private
		* @alias sap.ui.core.tooltip.Tooltip
		*/
		const Tooltip = Control.extend("sap.ui.core.tooltip.Tooltip", /** @lends sap.ui.core.tooltip.Tooltip.prototype */ {
			metadata: {
				interfaces: [
					"sap.ui.core.PopupInterface"
				],
				library: "sap.ui.core",
				properties: {
					/**
					 * The text of the tooltip.
					 * @since 1.151
					 */
					text: {type: "string", group: "Appearance", defaultValue: ""},

					/**
					 * Defines the placement of the tooltip relative to its target.
					 *
					 * Accepts the placement string tokens understood by
					 * <code>sap.m.Popover</code> (the same set as
					 * <code>sap.m.PlacementType</code>). Typed as <code>string</code>
					 * so that <code>sap.ui.core</code> does not depend on the
					 * <code>sap.m</code> enum.
					 * @since 1.151
					 */
					placement: {
						type: "string", group: "Behavior", defaultValue: PlacementType.VerticalPreferredTop
					},

					/**
					 * Defines the delay in milliseconds after which the tooltip will be shown.
					 * <b>Note:</b> The delay of show/dismiss Tooltip only applies on mouse and keyboard focus.
					 * With gesture from touch and keyboard shortcut, the tooltip will be displayed / dismissed immediately.
					 * @since 1.151
					 */
					delay: {type: "int", group: "Behavior", defaultValue: 500}
				},
				events: {
					/**
					 * Fired after the tooltip has opened (Popover afterOpen has run, placement applied).
					 * @since 1.151
					 */
					afterOpen: {},

					/**
					 * Fired after the tooltip has closed (Popover afterClose has run, timers cleared).
					 * @since 1.151
					 */
					afterClose: {}
				}
			},
			renderer: {
				apiVersion: 2,
				render: function () {}
			}
		});

		Tooltip.prototype.init = function () {
			this.attachAfterClose(() => {
				TooltipManager.deregister(this);
			});
		};

		Tooltip.prototype.exit = function () {

			TooltipManager.deregister(this);

			if (this._oPopover) {
				this._oPopover.destroy();
				this._oPopover = null;
			}
			this._pPopover = null;

			this._clearTimeouts();

			this._bOpenRequested = false;
		};

		Tooltip.prototype._onPopoverMouseEnter = function () {
			this._clearCloseTimeout();
		};

		Tooltip.prototype._onPopoverMouseLeave = function () {
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
			oDomRef.classList.remove("sapUiCoreTooltipTop", "sapUiCoreTooltipBottom", "sapUiCoreTooltipLeft", "sapUiCoreTooltipRight");
			const sCalcedPos = this._oPopover._getCalculatedPlacement && this._oPopover._getCalculatedPlacement();
			if (sCalcedPos === "Top" || sCalcedPos === "Bottom" || sCalcedPos === "Left" || sCalcedPos === "Right") {
				oDomRef.classList.add("sapUiCoreTooltip" + sCalcedPos);
			}
		};

		Tooltip.prototype._popoverAfterRendering = function () {
			const oDomRef = this._oPopover.getDomRef();

			// During the first afterRendering of the Popover, _calcPlacement has not yet run for
			// non-strict placements, so the class may be applied again from afterOpen below.
			this._applyPlacementClass();

			// Bind mouse handlers exactly once per Popover DOM node. Re-renders may produce a new
			// node (or the same node), so we tag it to detect first time vs. repeat.
			if (oDomRef._sapUiCoreTooltipMouseBound !== this.getId()) {
				oDomRef._sapUiCoreTooltipMouseBound = this.getId();
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
			TooltipManager.registerOpening(this);

			// A pending close (e.g. focusout) must not win over a fresh open — cancel it.
			this._clearCloseTimeout();

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

			this._iOpenTimeout = setTimeout(() => {
				this._iOpenTimeout = null;
				// A close() that arrived between scheduling and firing has cleared the open intent — abort.
				if (!this._bOpenRequested) {
					return;
				}
				// Final selection guard: if a selection appeared during the open delay
				// (e.g. user is mid-drag-select or about to right-click a selection), suppress the open so the popover render does not clear the selection.
				const oSelection = window.getSelection && window.getSelection();
				if (oSelection && oSelection.toString().length > 0) {
					// Popover never opens → afterClose won't fire, deregister here.
					this._bOpenRequested = false;
					TooltipManager.deregister(this);
					return;
				}
				this._oPopover.getContent()[0].setText(this.getText());
				const sPlacement = this._resolvePlacement(oControl);
				this._oPopover.setPlacement(mPromoteToPreferred[sPlacement] || sPlacement);
				this._oPopover.openBy(oControl);
				this._bIsOpen = true;
			}, iDelay);
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

		// @todo get rid of sap/m/Popover and sap/m/Text dependencies
		Tooltip.prototype._createPopover = async function () {

			// sap.m.Popover (and its Text content) is loaded lazily so that
			// sap.ui.core keeps no static dependency on sap.m. When sap.m is
			// already loaded the modules are required synchronously; otherwise
			// the library is loaded first.
			let Popover = sap.ui.require("sap/m/Popover");
			let Text = sap.ui.require("sap/m/Text");

			if (!Popover || !Text) {
				await Library.load({ name: "sap.m" });
				[Popover, Text] = await new Promise((fnResolve) => {
					sap.ui.require(["sap/m/Popover", "sap/m/Text"], (P, T) => fnResolve([P, T]));
				});
			}

			const oPopover = new Popover({
				showHeader: false,
				placement: this.getPlacement(),
				modal: false,
				content: new Text(),
				afterOpen: () => {
					// At this point _calcPlacement has run, so _getCalculatedPlacement
					// returns the resolved Top/Bottom/Left/Right side.
					this._applyPlacementClass();
					this.fireAfterOpen();
				},
				afterClose: () => {
					this._bIsOpen = false;
					this._bOpenRequested = false;
					this._clearTimeouts();
					this.fireAfterClose();
				}
			});


			oPopover.addStyleClass("sapUiCoreTooltip");

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

			return oPopover;
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

			// Popover never opened → afterClose won't fire, deregister here.
			if (!this._bIsOpen) {
				TooltipManager.deregister(this);
			}

			const fnClose = () => {
				if (this._oPopover) {
					this._oPopover.close();
					this._bIsOpen = false;
				}
			};

			if (!delay) {
				fnClose();
			} else {
				this._iCloseTimeout = setTimeout(fnClose, delay);
			}

			return this;
		};

		Tooltip.prototype._clearTimeouts = function () {
			this._clearOpenTimeout();
			this._clearCloseTimeout();
		};

		Tooltip.prototype._clearOpenTimeout = function () {
			if (this._iOpenTimeout) {
				clearTimeout(this._iOpenTimeout);
				this._iOpenTimeout = null;
			}
		};

		Tooltip.prototype._clearCloseTimeout = function () {
			if (this._iCloseTimeout) {
				clearTimeout(this._iCloseTimeout);
				this._iCloseTimeout = null;
			}
		};

		/**
		 * Whether the tooltip is currently open.
		 *
		 * @returns {boolean}
		 * @public
		 */
		Tooltip.prototype.isOpen = function () {
			return !!this._bIsOpen;
		};

		/**
		 * Whether the tooltip is open or pending an open (Popover creation or
		 * the hover-delay timer still running).
		 *
		 * @returns {boolean}
		 * @public
		 */
		Tooltip.prototype.isPendingOrOpen = function () {
			return !!(this._bIsOpen || this._iOpenTimeout || this._bOpenRequested);
		};

		return Tooltip;
	});
