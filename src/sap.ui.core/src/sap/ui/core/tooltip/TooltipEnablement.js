/*!
 * ${copyright}
 */

// Provides class sap.ui.core.tooltip.TooltipEnablement.
sap.ui.define([
	"sap/base/config",
	"sap/ui/base/EventProvider",
	"sap/ui/core/Control",
	"sap/ui/core/tooltip/TooltipEventTrigger",
	"sap/ui/core/tooltip/TooltipManager"
],
	function(
		BaseConfig,
		EventProvider,
		Control,
		TooltipEventTrigger,
		TooltipManager
	) {
		"use strict";

		/**
		 * Constructor for a new <code>sap.ui.core.tooltip.TooltipEnablement</code>.
		 *
		 * @param {sap.ui.core.Control} oHost The host control.
		 * @param {object} [oConfig] Configuration for the helper.
		 * @param {function():string} [oConfig.textProvider] Callback that builds the visible tooltip text.
		 * @param {function():string} [oConfig.invisibleTextProvider] Callback that builds the text written into the invisible ARIA anchor. Falls back to <code>textProvider</code> when omitted.
		 * @param {function():HTMLElement} [oConfig.domRefProvider] Callback that returns the DOM element the gesture listeners should attach to. Defaults to <code>oHost.getFocusDomRef()</code>. Override this when neither the host's focus DOM nor the outer DOM ref is the correct attachment point — for example a wrapper element that owns the hover/focus area.
		 * @param {boolean} [oConfig.enableForTouchDevices=true] Whether long-press should open the tooltip on touch devices. Use this to disable it for links.
		 *
		 * @class
		 * Helper that adds a <code>sap.m.Tooltip</code> to a control.
		 *
		 * Create an instance for your host control, keep it on the host, and call its
		 * hooks from your renderer and lifecycle methods. The helper takes care
		 * of showing and hiding the tooltip on hover, focus and touch, of
		 * rendering an invisible ARIA anchor for screen readers, and of cleaning
		 * up when the host is destroyed.
		 *
		 * The inner <code>sap.m.Tooltip</code> and its <code>sap.m</code> library
		 * are loaded lazily on first use, so a host in another library may use
		 * this helper without statically depending on <code>sap.m</code>.
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
		 * The host control should also refer to the tooltip via aria-describedby.
		 * For this purpose an invisible tooltip is rendered inside the control, this way it is always available for the aria reference.
		 * Use the methods TooltipEnablement#renderInvisibleTooltip and TooltipEnablement#getInvisibleTooltipId to achieve this behaviour.
		 *
		 * <h3>Integrating into a control</h3>
		 *
		 * The enhanced tooltip is currently opt-in. Only create the helper when
		 * {@link sap.ui.core.tooltip.TooltipEnablement.isEnhancedTooltipEnabled} returns
		 * <code>true</code>, which happens when the app is started with
		 * <code>sap-ui-xx-tooltip='enhanced'</code>.
		 *
		 * The following three steps are mandatory for every host control.
		 *
		 * <b>1. Create the helper in the host's <code>init</code></b> and pass a
		 * <code>textProvider</code> callback that returns the desired tooltip
		 * text. This allows the displayed text to depend on
		 * runtime state (for example a base tooltip combined with a keyboard
		 * shortcut). Pass <code>invisibleTextProvider</code> when the
		 * screen-reader text should differ from the visible one (for example to
		 * leave out a shortcut that is already exposed via
		 * <code>aria-keyshortcuts</code>).
		 *
		 * <pre>
		 * MyControl.prototype.init = function() {
		 *     if (TooltipEnablement.isEnhancedTooltipEnabled()) {
		 *         this._oTooltipEnablement = new TooltipEnablement(this, {
		 *             textProvider: () =&gt; this._buildVisibleTooltip(),
		 *             invisibleTextProvider: () =&gt; this._buildInvisibleTooltip() || ""
		 *         });
		 *     }
		 * };
		 * </pre>
		 *
		 * <b>2. Render the invisible ARIA anchor</b> from the host's renderer
		 * and reference it via <code>aria-describedby</code> on the host's
		 * focusable element. The anchor's id is
		 * <code>oControl._oTooltipEnablement.getInvisibleTooltipId()</code>.
		 *
		 * <pre>
		 * MyControlRenderer.render = function(oRm, oControl) {
		 *     oRm.openStart("button", oControl);
		 *     if (oControl._oTooltipEnablement) {
		 *         oRm.attr("aria-describedby", oControl._oTooltipEnablement.getInvisibleTooltipId());
		 *     }
		 *     oRm.openEnd();
		 *     // ...host content...
		 *     if (oControl._oTooltipEnablement) {
		 *         oControl._oTooltipEnablement.renderInvisibleTooltip(oRm);
		 *     }
		 *     oRm.close("button");
		 * };
		 * </pre>
		 *
		 * <b>3. Destroy the helper in the host's <code>exit</code></b> so its
		 * inner <code>sap.m.Tooltip</code> and DOM listeners are released. The
		 * helper extends <code>sap.ui.base.EventProvider</code>, so it is not
		 * disposed automatically by the host.
		 *
		 * <pre>
		 * MyControl.prototype.exit = function() {
		 *     if (this._oTooltipEnablement) {
		 *         this._oTooltipEnablement.destroy();
		 *         this._oTooltipEnablement = null;
		 *     }
		 * };
		 * </pre>
		 *
		 * <h3>Optional integration steps</h3>
		 *
		 * The following steps are only needed for hosts with specific requirements.
		 *
		 * <b>React to runtime state changes</b> by invalidating the host
		 * whenever the text returned by your providers can change. The helper
		 * re-resolves the text on the next render.
		 *
		 * <b>Open or close imperatively</b> with
		 * <code>open()</code> / <code>close()</code> when your control has a
		 * gesture beyond the built-in hover/focus/touch handling.
		 *
		 * <b>Opt out on touch devices</b> via
		 * <code>setEnableForTouchDevices(false)</code> when the long-press
		 * gesture would conflict with native browser behavior — for example on
		 * links, where long-press must remain available for the browser's
		 * context menu.
		 *
		 * <b>Customize the attachment element</b> via the
		 * <code>domRefProvider</code> config when neither the host's focus DOM
		 * ref nor its outer DOM ref is the right element to listen on — for
		 * example when gestures must fire on a wrapper.
		 *
		 * <h3>Links</h3>
		 * The design guidelines for sap.m.Link and link-like controls is to
		 * disable the tooltip on mobile, because the long-press gesture
		 * must remain to be used to open the context menu.
		 *
		 * @author SAP SE
		 * @version ${version}
		 *
		 * @extends sap.ui.base.EventProvider
		 *
		 * @since 1.151
		 * @constructor
		 * @private
		 * @ui5-restricted sap.m
		 * @alias sap.ui.core.tooltip.TooltipEnablement
		 */
		const TooltipEnablement = EventProvider.extend("sap.ui.core.tooltip.TooltipEnablement", /** @lends sap.ui.core.tooltip.TooltipEnablement.prototype */ {
			constructor: function(oHost, oConfig) {
				if (!(oHost instanceof Control)) {
					throw new Error("TooltipEnablement: oHost must be a sap.ui.core.Control");
				}

				EventProvider.apply(this);

				oConfig = oConfig || {};

				this._oHost = oHost;
				this._fnTextProvider = oConfig.textProvider;
				this._fnInvisibleTextProvider = oConfig.invisibleTextProvider;
				this._fnDomRefProvider = oConfig.domRefProvider || (() => oHost.getFocusDomRef());

				this._oTooltip = null;

				this._oPendingOpen = null;

				this._oEventTrigger = new TooltipEventTrigger({
					onOpen: (bWithDelay) => this._open(bWithDelay),
					onClose: (bWithDelay) => this._close(bWithDelay),
					isPendingOrOpen: this._isPendingOrOpen.bind(this),
					enableForTouchDevices: oConfig.enableForTouchDevices
				});

				// Re-wire DOM listeners across host re-renders. The trigger itself is host-agnostic.
				this._oDelegate = {
					onBeforeRendering: this._onHostBeforeRendering,
					onAfterRendering: this._onHostAfterRendering
				};
				oHost.addDelegate(this._oDelegate, this);

				// If the host is already rendered, attach immediately —
				// onAfterRendering won't fire until the next render.
				const oDomRef = this._fnDomRefProvider();
				if (oDomRef) {
					this._oEventTrigger.attach(oDomRef);
				}
			}
		});

		/**
		 * Toggles the long-press tooltip on touch devices.
		 * Use this to disable it for links.
		 * @public
		 * @param {boolean} bEnable
		 * @returns {this}
		 */
		TooltipEnablement.prototype.setEnableForTouchDevices = function(bEnable) {
			this._oEventTrigger.setEnableForTouchDevices(bEnable);
			return this;
		};

		/**
		 * Is this tooltip enabled for long press on touch devices.
		 * @public
		 * @returns {boolean}
		 */
		TooltipEnablement.prototype.getEnableForTouchDevices = function() {
			return this._oEventTrigger.getEnableForTouchDevices();
		};

		/**
		 * Id of the invisible aria-anchor span, or <code>null</code> when there is no text.
		 * @public
		 * @returns {string|null}
		 */
		TooltipEnablement.prototype.getInvisibleTooltipId = function() {
			return this._resolveInvisibleText() !== ""
				? this._oHost.getId() + "-invisibleTooltip"
				: null;
		};

		/**
		 * Opens the tooltip. The open is asynchronous — the returned reference
		 * is chainable but does not await the actual on-screen open. To act
		 * when the tooltip has opened, listen for the <code>afterOpen</code>
		 * event via {@link #attachAfterOpen}.
		 * @public
		 * @returns {this}
		 */
		TooltipEnablement.prototype.open = function() {
			this._open();
			return this;
		};

		/**
		 * Whether the tooltip is currently open.
		 * @public
		 * @returns {boolean}
		 */
		TooltipEnablement.prototype.isOpen = function() {
			return !!this._oTooltip?.isOpen();
		};

		/**
		 * Attaches a handler to the <code>afterOpen</code> event, fired once
		 * the inner tooltip has opened on screen.
		 * @public
		 * @param {function} fnFunction
		 * @param {object} [oListener]
		 * @returns {this}
		 */
		TooltipEnablement.prototype.attachAfterOpen = function(fnFunction, oListener) {
			this.attachEvent("afterOpen", fnFunction, oListener);
			return this;
		};

		/**
		 * Detaches a handler previously attached with {@link #attachAfterOpen}.
		 * @public
		 * @param {function} fnFunction
		 * @param {object} [oListener]
		 * @returns {this}
		 */
		TooltipEnablement.prototype.detachAfterOpen = function(fnFunction, oListener) {
			this.detachEvent("afterOpen", fnFunction, oListener);
			return this;
		};

		/**
		 * Attaches a handler to the <code>afterClose</code> event, fired once
		 * the inner tooltip has closed.
		 * @public
		 * @param {function} fnFunction
		 * @param {object} [oListener]
		 * @returns {this}
		 */
		TooltipEnablement.prototype.attachAfterClose = function(fnFunction, oListener) {
			this.attachEvent("afterClose", fnFunction, oListener);
			return this;
		};

		/**
		 * Detaches a handler previously attached with {@link #attachAfterClose}.
		 * @public
		 * @param {function} fnFunction
		 * @param {object} [oListener]
		 * @returns {this}
		 */
		TooltipEnablement.prototype.detachAfterClose = function(fnFunction, oListener) {
			this.detachEvent("afterClose", fnFunction, oListener);
			return this;
		};

		/**
		 * Closes the tooltip immediately.
		 * @public
		 * @returns {this}
		 */
		TooltipEnablement.prototype.close = function() {
			this._close();
			return this;
		};

		/**
		 * Disposes the helper and its inner Tooltip.
		 * @public
		 */
		TooltipEnablement.prototype.destroy = function() {
			this._cancelPendingOpen();

			if (this._oHost && this._oDelegate) {
				this._oHost.removeDelegate(this._oDelegate);
			}

			this._oDelegate = null;

			if (this._oEventTrigger) {
				this._oEventTrigger.destroy();
				this._oEventTrigger = null;
			}

			if (this._oTooltip) {
				this._oTooltip.destroy();
				this._oTooltip = null;
			}

			this._oHost = null;

			EventProvider.prototype.destroy.apply(this, arguments);
		};

		/**
		 * Renders the invisible aria-anchor span. Called from the host's renderer.
		 * @public
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager
		 */
		TooltipEnablement.prototype.renderInvisibleTooltip = function(oRm) {
			const sId = this.getInvisibleTooltipId();
			if (!sId) {
				return;
			}
			oRm.openStart("span", sId);
			oRm.attr("role", "tooltip");
			oRm.class("sapUiInvisibleText");
			oRm.openEnd();
			oRm.text(this._resolveInvisibleText());
			oRm.close("span");
		};

		/**
		 * Whether the tooltip is open or pending an open (delay running).
		 * @returns {boolean}
		 * @private
		 */
		TooltipEnablement.prototype._isPendingOrOpen = function() {
			return !!this._oPendingOpen || !!(this._oTooltip && this._oTooltip.isPendingOrOpen());
		};

		/**
		 * Aborts an in-flight <code>_open</code>, if any. The suspended <code>_open</code>
		 * detects the flipped flag on its local token when it resumes and bails out.
		 * @private
		 */
		TooltipEnablement.prototype._cancelPendingOpen = function() {
			if (this._oPendingOpen) {
				this._oPendingOpen.aborted = true;
				this._oPendingOpen = null;
			}
		};

		/**
		 * Detaches gesture listeners before the host re-renders.
		 * @private
		 */
		TooltipEnablement.prototype._onHostBeforeRendering = function() {
			this._oEventTrigger.detach();
		};

		/**
		 * Re-attaches gesture listeners after the host has been re-rendered.
		 * @private
		 */
		TooltipEnablement.prototype._onHostAfterRendering = function() {
			const oDomRef = this._oHost && this._fnDomRefProvider();
			if (oDomRef) {
				this._oEventTrigger.attach(oDomRef);
			}
		};

		/**
		 * Resolves the visible tooltip text from <code>textProvider</code>.
		 * @returns {string}
		 * @private
		 */
		TooltipEnablement.prototype._resolveText = function() {
			if (this._fnTextProvider) {
				return this._fnTextProvider() || "";
			}
			return "";
		};

		/**
		 * Resolves the invisible-anchor text, falling back to the visible text.
		 * @returns {string}
		 * @private
		 */
		TooltipEnablement.prototype._resolveInvisibleText = function() {
			if (this._fnInvisibleTextProvider) {
				return this._fnInvisibleTextProvider() || "";
			}
			return this._resolveText();
		};

		/**
		 * Mirrors the current text onto the inner Tooltip.
		 * @private
		 */
		TooltipEnablement.prototype._syncInnerTooltip = function() {
			if (!this._oTooltip) {
				return;
			}
			this._oTooltip.setText(this._resolveText());
		};

		/**
		 * Lazy-creates the inner <code>sap.m.Tooltip</code> on first use via
		 * {@link sap.ui.core.tooltip.TooltipManager#create}.
		 *
		 * @returns {Promise<sap.m.Tooltip|null>}
		 * @private
		 */
		TooltipEnablement.prototype._ensureTooltip = async function() {

			// @todo make the popover dependency of the Tooltip to be lazy and move Tooltip itself to sap.ui.core

			if (this._oTooltip) {
				return this._oTooltip;
			}

			const oTooltip = await TooltipManager.create({
				text: this._resolveText(),
				afterOpen: () => this.fireEvent("afterOpen"),
				afterClose: () => this.fireEvent("afterClose")
			});

			if (!this._oHost) {
				oTooltip.destroy();
				return null;
			}

			if (this._oTooltip) {
				// Raced with a parallel ensure; keep the existing one.
				oTooltip.destroy();
			} else {
				this._oTooltip = oTooltip;
			}

			return this._oTooltip;
		};

		/**
		 * Opens the tooltip via {@link sap.ui.core.tooltip.TooltipManager#open},
		 * which decides the actual delay.
		 * @param {boolean} [bWithDelay=false]
		 * @returns {Promise<void>}
		 * @private
		 */
		TooltipEnablement.prototype._open = async function(bWithDelay = false) {
			if (!this._resolveText()) {
				return;
			}

			this._cancelPendingOpen();

			// Handles races when open or close is called during the async tooltip creation.
			const oPendingOpen = { aborted: false };
			this._oPendingOpen = oPendingOpen;

			const oTooltip = await this._ensureTooltip();

			if (oPendingOpen.aborted || !oTooltip || !this._oHost || !this._resolveText()) {
				// Clear our own pending token if it's still current, so a stale token can't keep _isPendingOrOpen() true (would swallow Escape).
				if (this._oPendingOpen === oPendingOpen) {
					this._oPendingOpen = null;
				}
				return;
			}

			this._oPendingOpen = null;

			this._syncInnerTooltip();

			TooltipManager.openSingle(oTooltip, this._oHost, bWithDelay);
		};

		/**
		 * Closes the tooltip via {@link sap.ui.core.tooltip.TooltipManager#close},
		 * which decides the actual delay.
		 * @param {boolean} [bWithDelay=false]
		 * @private
		 */
		TooltipEnablement.prototype._close = function(bWithDelay = false) {
			this._cancelPendingOpen();

			if (!this._oTooltip) {
				return;
			}

			TooltipManager.close(this._oTooltip, bWithDelay);
		};

		/**
		 * Whether the enhanced tooltip is enabled.
		 *
		 * The enhanced tooltip is opt-in and activated by starting the app with
		 * the configuration <code>sap-ui-xx-tooltip='enhanced'</code>; any other
		 * value keeps the native browser tooltip. Host controls should gate the
		 * creation of their {@link sap.ui.core.tooltip.TooltipEnablement} on this
		 * check.
		 *
		 * @public
		 * @returns {boolean}
		 */
		TooltipEnablement.isEnhancedTooltipEnabled = function() {
			return BaseConfig.get({
				name: "sapUiXxTooltip",
				type: BaseConfig.Type.String,
				external: true,
				defaultValue: "native"
			}) === "enhanced";
		};

		return TooltipEnablement;
	});
