/*!
 * ${copyright}
 */

// Provides control sap.ui.core.tooltip.Tooltip.
sap.ui.define([
	"sap/ui/core/Control",
	"sap/ui/Device",
	"sap/ui/core/Popup",
	"sap/ui/core/popover/Positioning",
	"sap/ui/core/popover/PopoverPhysicalSide",
	"sap/ui/core/theming/Parameters",
	"sap/ui/dom/units/Rem",
	"sap/ui/core/popover/PopoverFlipMode",
	"sap/ui/core/tooltip/TooltipManager",
	"sap/ui/core/library",
	"sap/base/i18n/Localization",
	"./TooltipRenderer"
],
	function(
		Control,
		Device,
		Popup,
		Positioning,
		PopoverPhysicalSide,
		Parameters,
		Rem,
		PopoverFlipMode,
		TooltipManager,
		coreLibrary,
		Localization,
		TooltipRenderer
	) {
		"use strict";

		// shortcut for sap.ui.core.popover.PopoverPlacement
		const PopoverPlacement = coreLibrary.popover.PopoverPlacement;

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
					 * @since 1.151
					 */
					placement: {
						type: "sap.ui.core.popover.PopoverPlacement", group: "Behavior", defaultValue: PopoverPlacement.Top
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
					 * Fired after the tooltip has opened.
					 * @since 1.151
					 */
					afterOpen: {},

					/**
					 * Fired after the tooltip has closed.
					 * @since 1.151
					 */
					afterClose: {}
				}
			},
			renderer: TooltipRenderer
		});

		// Minimum distance the arrow keeps from a tooltip corner, in px —
		// roughly the corner radius. Small so the arrow can still center on
		// short tooltips instead of being pushed to a corner.
		const ARROW_CORNER_INSET_PX = 4;
		// Base gap the tooltip keeps from the within-area edge.
		const EDGE_MARGIN_PX = 10;

		// Positioning clamp/class helpers expect a LOGICAL side (they re-derive
		// physical via RTL, as sap.m.Popover feeds them). The tooltip resolves a
		// physical side, so swap Left<->Right in RTL before calling them.
		function toLogicalSide(sSide) {
			if (!Localization.getRTL()) {
				return sSide;
			}

			if (sSide === PopoverPhysicalSide.Left) {
				return PopoverPhysicalSide.Right;
			}

			if (sSide === PopoverPhysicalSide.Right) {
				return PopoverPhysicalSide.Left;
			}

			return sSide;
		}

		Tooltip.prototype.init = function () {
			this._sCalcedPos = null;
			this._bIsOpen = false;
			this._bOpenRequested = false;

			this.attachAfterClose(() => {
				TooltipManager.deregister(this);
			});
		};

		Tooltip.prototype.exit = function () {
			TooltipManager.deregister(this);

			if (this._oPopup) {
				this._oPopup.destroy();
				this._oPopup = null;
			}

			this._clearTimeouts();
			this._bOpenRequested = false;
		};

		Tooltip.prototype._loadThemeParameters = function () {
			this._arrowProtrusion = Rem.toPx(Parameters.get({
				name: "_sap_ui_core_Tooltip_ArrowProtrusion",
				callback: (sValue) => { this._arrowProtrusion = Rem.toPx(sValue); }
			}) || "0.375rem");
			this._arrowContainerSize = Rem.toPx(Parameters.get({
				name: "_sap_ui_core_Tooltip_ArrowContainerSize",
				callback: (sValue) => { this._arrowContainerSize = Rem.toPx(sValue); }
			}) || "0.75rem");
		};

		Tooltip.prototype._ensurePopup = function () {
			if (this._oPopup) {
				return this._oPopup;
			}

			this._oPopup = new Popup(this, /*bModal*/ false, /*bShadow*/ false, /*bAutoClose*/ true);
			this._oPopup.setFollowOf(Popup.CLOSE_ON_SCROLL);

			// Resolve placement from the *rendered* DOM. The Popup renders the
			// tooltip content during open() and then calls _applyPosition; at
			// that point getDomRef() has a real size, so we measure it, pick the
			// side, re-anchor, and let the base positioning run — a two-pass
			// reposition. This avoids pre-rendering the
			// tooltip into a hidden holder just to measure it.
			const oTooltip = this;
			const fnBaseApplyPosition = this._oPopup._applyPosition;
			this._oPopup._applyPosition = function (oPosition) {
				const sState = this.getOpenState();

				if (sState === "CLOSING" || sState === "CLOSED") {
					return;
				}

				// Clear stale position before the Popup re-docks below (clear -> dock -> measure).
				const oDomRef = oTooltip.getDomRef();

				if (oDomRef) {
					oDomRef.style.left = "";
					oDomRef.style.right = "";
					oDomRef.style.top = "";
					oDomRef.style.bottom = "";
				}

				// First pass for this open: resolve the side from the measured
				// DOM, re-anchor, and return — the setPosition below triggers a
				// second _applyPosition pass where _bPosResolved is true.
				if (!oTooltip._bPosResolved && oTooltip._oHostForArrow) {
					const sSide = oTooltip._resolveSide(oTooltip._oHostForArrow);
					oTooltip._sCalcedPos = sSide;
					oTooltip._applyPlacementClass();

					const oAnchor = Positioning.computeAnchor({
						side: sSide,
						arrowSize: oTooltip._arrowProtrusion,
						mirror: false
					});

					oTooltip._bPosResolved = true;
					this.setPosition(oAnchor.my, oAnchor.at, oTooltip._oHostForArrow, oAnchor.offset, "none");
					return;
				}

				fnBaseApplyPosition.call(this, oPosition);
			};

			this._oPopup.attachOpened(function () {
				this._bIsOpen = true;
				this._fitIntoWithinArea();
				this._positionArrow();
				this._bindDomEvents();
				this.fireAfterOpen();
			}, this);
			this._oPopup.attachClosed(function () {
				this._bIsOpen = false;
				this._bOpenRequested = false;
				this._bPosResolved = false;
				this._clearTimeouts();
				this.fireAfterClose();
			}, this);
			return this._oPopup;
		};

		Tooltip.prototype._bindDomEvents = function () {
			const oDomRef = this.getDomRef();
			if (!oDomRef) {
				return;
			}
			if (oDomRef._sapUiCoreTooltipMouseBound === this.getId()) {
				return;
			}
			oDomRef._sapUiCoreTooltipMouseBound = this.getId();
			oDomRef.addEventListener("mouseenter", this._onTooltipMouseEnter.bind(this));
			oDomRef.addEventListener("mouseleave", this._onTooltipMouseLeave.bind(this));
		};

		Tooltip.prototype._onTooltipMouseEnter = function () {
			this._clearCloseTimeout();
			this._bIsMouseOver = true;
		};

		Tooltip.prototype._onTooltipMouseLeave = function () {
			this._bIsMouseOver = false;
			if (this._bIsOpen) {
				this.close(500);
			}
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

		Tooltip.prototype._applyPlacementClass = function () {
			const oDomRef = this.getDomRef();

			if (!oDomRef) {
				return;
			}

			oDomRef.classList.remove(
				"sapUiCoreTooltip-" + PopoverPhysicalSide.Top, "sapUiCoreTooltip-" + PopoverPhysicalSide.Bottom,
				"sapUiCoreTooltip-" + PopoverPhysicalSide.Left, "sapUiCoreTooltip-" + PopoverPhysicalSide.Right
			);

			const sSide = this._sCalcedPos || this.getPlacement();

			if (Object.hasOwn(PopoverPhysicalSide, sSide)) {
				// Logical class: build-mirrored library-RTL.css re-flips it to the
				// correct physical edge.
				oDomRef.classList.add("sapUiCoreTooltip-" + toLogicalSide(sSide));
			}
		};

		Tooltip.prototype._resolveSide = function (oHostElement) {
			return Positioning.resolvePlacement({
				placement: this.getPlacement(),
				flipMode: PopoverFlipMode.MoreSpace,
				openerRef: oHostElement,
				popoverRef: this.getDomRef(),
				withinAreaRef: Popup.getWithinAreaDomRef(),
				margin: {
					top: EDGE_MARGIN_PX,
					right: EDGE_MARGIN_PX,
					bottom: EDGE_MARGIN_PX,
					left: EDGE_MARGIN_PX
				},
				arrowSize: this._arrowProtrusion
			});
		};

		/**
		 * Opens the tooltip next to the given control or DOM element.
		 *
		 * @param {sap.ui.core.Control|HTMLElement} oControl The control or DOM element relative to which the tooltip is positioned.
		 * @param {int} [iDelay] Delay in milliseconds before the tooltip opens. Defaults to the value of the <code>delay</code> property.
		 * @public
		 */
		Tooltip.prototype.openBy = function (oControl, iDelay) {
			if (iDelay === undefined) {
				iDelay = this.getDelay();
			}

			this._bOpenRequested = true;
			TooltipManager.registerOpening(this);

			// A pending close (e.g. focusout) must not win over a fresh open — cancel it.
			this._clearCloseTimeout();

			// Load arrow dimensions from the theme before positioning.
			this._loadThemeParameters();

			this._ensurePopup();

			if (this._iOpenTimeout) {
				return;
			}

			this._iOpenTimeout = setTimeout(() => {
				this._iOpenTimeout = null;
				if (!this._bOpenRequested) {
					return;
				}
				// If a selection appeared during the open delay, suppress the
				// open so the tooltip DOM insertion doesn't clear it.
				// Only check if the selection is within the tooltip's target element or its ancestors to avoid
				// false positives from selections in other form fields (e.g., when tabbing through inputs).
				const oSelection = window.getSelection && window.getSelection();
				const oHostElement = this._getHostElement(oControl);
				const bHasRelevantSelection = !!(oSelection && oSelection.toString().length > 0 &&
					oHostElement && oSelection.anchorNode && oHostElement.contains(oSelection.anchorNode));
				if (bHasRelevantSelection) {
					this._bOpenRequested = false;
					TooltipManager.deregister(this);
					return;
				}
				this._doOpen(oControl);
			}, iDelay);
		};

		Tooltip.prototype._doOpen = function (oControl) {
			const oHost = this._getHostElement(oControl);
			if (!oHost) {
				this._bOpenRequested = false;
				return;
			}

			// Remember the opener so the _applyPosition override (during open)
			// and _positionArrow (on the "opened" event) can resolve the side
			// and point the arrow at the opener's center.
			this._oHostForArrow = oHost;
			this._bPosResolved = false;

			// Open with a provisional anchor derived from the preferred placement,
			// resolved to a physical side without measurement (flipMode Never). The
			// Popup renders the content, then the _applyPosition override measures
			// the real DOM, resolves the final side, and re-anchors before paint.
			const sProvisionalSide = Positioning.resolvePlacement({
				placement: this.getPlacement(),
				flipMode: PopoverFlipMode.Never
			});
			const oAnchor = Positioning.computeAnchor({
				side: sProvisionalSide,
				arrowSize: this._arrowProtrusion,
				mirror: false
			});

			this._oPopup.setPosition(oAnchor.my, oAnchor.at, oHost, oAnchor.offset, "none");
			this._oPopup.open(0);
		};

		/**
		 * After the Popup has docked the tooltip, re-clamp its position inside the
		 * within-area and cap its size so it fits those bounds.
		 */
		Tooltip.prototype._fitIntoWithinArea = function () {
			const oDomRef = this.getDomRef();

			if (!oDomRef) {
				return;
			}

			// Reset size caps only; position is owned by the Popup dock (cleared and
			// re-docked in _applyPosition).
			oDomRef.style.maxWidth = "";
			oDomRef.style.maxHeight = "";

			const oContRef = oDomRef.querySelector(".sapUiCoreTooltipCont");

			if (oContRef) {
				oContRef.style.maxHeight = "";
			}

			const oWithinRef = Popup.getWithinAreaDomRef();
			const oMargins = {
				top: EDGE_MARGIN_PX,
				right: EDGE_MARGIN_PX,
				bottom: EDGE_MARGIN_PX,
				left: EDGE_MARGIN_PX
			};

			// Cap before clamp: the clamp reads the box rect, so
			// the box must already be shrunk to fit — else it can't be pulled on-screen.
			const oBoxMax = Positioning.computeMaxContentSize({
				margin: oMargins,
				withinAreaRef: oWithinRef,
				side: toLogicalSide(this._sCalcedPos),
				openerRef: this._oHostForArrow,
				arrowSize: this._arrowProtrusion
			});

			if (oBoxMax.maxWidth < oDomRef.getBoundingClientRect().width) {
				oDomRef.style.maxWidth = oBoxMax.maxWidth + "px";
			}

			// Cap root + scroll container so a too-tall tooltip scrolls. Cap on content
			// height, not the root rect.
			if (oContRef) {
				const oCs = window.getComputedStyle(oDomRef);
				const iPadY = parseFloat(oCs.paddingTop) + parseFloat(oCs.paddingBottom);
				const iContMax = Positioning.computeMaxContentSize({
					margin: oMargins,
					withinAreaRef: oWithinRef,
					side: toLogicalSide(this._sCalcedPos),
					openerRef: this._oHostForArrow,
					arrowSize: this._arrowProtrusion,
					reservedHeight: iPadY
				}).maxHeight;

				if (oContRef.scrollHeight > iContMax) {
					oDomRef.style.maxHeight = oBoxMax.maxHeight + "px";
					oContRef.style.maxHeight = iContMax + "px";
				}
			}

			// Clamp: where the (now fit-sized) box may sit. Positioning folds in the
			// within-area and reserves the opener side from the base margin.
			const oPosition = Positioning.computePopoverPositionCss({
				popoverRef: oDomRef,
				hasVerticalScrollbar: false,
				margin: oMargins,
				withinAreaRef: oWithinRef,
				side: toLogicalSide(this._sCalcedPos),
				openerRef: this._oHostForArrow,
				arrowSize: this._arrowProtrusion
			});

			["top", "bottom", "left", "right"].forEach((sSide) => {
				const vValue = oPosition[sSide];
				if (typeof vValue === "number") {
					oDomRef.style[sSide] = vValue + "px";
				} else if (vValue === "") {
					oDomRef.style[sSide] = "";
				}
			});
		};

		// Sets the arrow's offset along the tooltip edge so it points at the opener.
		Tooltip.prototype._positionArrow = function () {
			const oDomRef = this.getDomRef();
			const oHost = this._oHostForArrow;
			if (!oDomRef || !oHost) {
				return;
			}
			const oArrow = oDomRef.querySelector(".sapUiCoreTooltipArrow");
			if (!oArrow) {
				return;
			}

			const sSide = this._sCalcedPos;

			const oOffset = Positioning.computeArrowOffset({
				side: sSide,
				openerRef: oHost,
				popoverRef: oDomRef,
				arrowSize: this._arrowProtrusion,
				arrowWidth: this._arrowContainerSize,
				arrowHeight: this._arrowContainerSize,
				// small inset so the clamp band doesn't collapse on short tooltips
				cornerInset: ARROW_CORNER_INSET_PX
			});

			// Reset offsets from a prior open (possibly on another side / direction).
			oArrow.style.top = "";
			oArrow.style.left = "";
			oArrow.style.right = "";

			if (sSide === PopoverPhysicalSide.Left || sSide === PopoverPhysicalSide.Right) {
				oArrow.style.top = oOffset.along + "px";
			} else if (oOffset.rtlRight) {
				// RTL Top/Bottom: offset is measured from the tooltip's right edge.
				oArrow.style.right = oOffset.along + "px";
			} else {
				oArrow.style.left = oOffset.along + "px";
			}
		};

		/**
		 * Closes the tooltip if it is open.
		 *
		 * @param {int} [delay] Delay in ms before actually closing.
		 * @param {boolean} [bFromPress] Whether the close was triggered by a press/touch gesture.
		 * @returns {this} Reference to the control instance for chaining
		 * @public
		 */
		Tooltip.prototype.close = function (delay, bFromPress) {
			if (delay === undefined) {
				delay = this.getDelay();
			}
			this._clearTimeouts();
			this._bOpenRequested = false;

			if (bFromPress) {
				// @todo remove this hack when button does not fire press on longpress
				if ((Device.system.phone || Device.system.tablet) && !Device.system.combi) {
					return this;
				}
			}

			// Popup never opened → closed won't fire, deregister here.
			if (!this._bIsOpen) {
				TooltipManager.deregister(this);
			}

			const fnClose = () => {
				if (this._oPopup && this._bIsOpen) {
					this._oPopup.close(0);
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
		 * Whether the tooltip is open or pending an open (delay running).
		 *
		 * @returns {boolean}
		 * @public
		 */
		Tooltip.prototype.isPendingOrOpen = function () {
			return !!(this._bIsOpen || this._iOpenTimeout);
		};

		return Tooltip;
	});
