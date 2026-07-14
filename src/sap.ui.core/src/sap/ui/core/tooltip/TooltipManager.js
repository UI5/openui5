/*!
 * ${copyright}
 */

// Provides static class sap.ui.core.tooltip.TooltipManager.
sap.ui.define([
	"sap/ui/core/Lib"
],
	function(
		Library
	) {
		"use strict";

		// Open/close delay in ms for hover and keyboard-focus gestures.
		const HOVER_DELAY_MS = 500;

		// Shortened delay (ms) used during handoff between adjacent tooltips.
		const HANDOFF_DELAY_MS = 200;

		// Registry of currently-open or pending sap.m.Tooltip instances.
		const oOpenTooltips = new Set();

		/**
		 * @class
		 * Static helper that owns cross-tooltip concerns: lazy creation of
		 * <code>sap.m.Tooltip</code>, the shared registry of open tooltips,
		 * and the timing constants used for handoff between adjacent tooltips.
		 *
		 * Per-host gesture wiring lives in
		 * {@link sap.ui.core.tooltip.TooltipEnablement} and
		 * {@link sap.ui.core.tooltip.TooltipEventTrigger}.
		 *
		 * @author SAP SE
		 * @version ${version}
		 *
		 * @namespace
		 * @since 1.151
		 * @private
		 * @alias sap.ui.core.tooltip.TooltipManager
		 */
		const TooltipManager = {};

		/**
		 * Open/close delay in ms for hover and keyboard-focus gestures.
		 * @type {int}
		 */
		TooltipManager.HOVER_DELAY_MS = HOVER_DELAY_MS;

		/**
		 * Shortened delay (ms) used during handoff between adjacent tooltips.
		 * @type {int}
		 */
		TooltipManager.HANDOFF_DELAY_MS = HANDOFF_DELAY_MS;

		/**
		 * Lazy-loads <code>sap.m</code> and creates a new <code>sap.m.Tooltip</code>.
		 *
		 * @param {object} [mSettings] Settings forwarded to the constructor.
		 * @returns {Promise<sap.m.Tooltip>}
		 */
		TooltipManager.create = async function(mSettings) {
			await Library.load({ name: "sap.m" });
			return new Promise((resolve) => {
				sap.ui.require(["sap/m/Tooltip"], (Tooltip) => {
					resolve(new Tooltip(mSettings));
				});
			});
		};

		/**
		 * Opens the given tooltip by the given opener, closing any other
		 * registered tooltip first. The delay is <code>0</code> for instant
		 * gestures, <code>HANDOFF_DELAY_MS</code> when another tooltip is
		 * open, or <code>HOVER_DELAY_MS</code> otherwise.
		 *
		 * @param {sap.m.Tooltip} oTooltip
		 * @param {sap.ui.core.Control} oOpenBy
		 * @param {boolean} [bWithDelay=false]
		 */
		TooltipManager.openSingle = function(oTooltip, oOpenBy, bWithDelay = false) {
			const bOtherOpen = oOpenTooltips.size > 0
				&& !(oOpenTooltips.size === 1 && oOpenTooltips.has(oTooltip));
			let iDelay;
			if (!bWithDelay) {
				iDelay = 0;
			} else if (bOtherOpen) {
				iDelay = HANDOFF_DELAY_MS;
			} else {
				iDelay = HOVER_DELAY_MS;
			}
			if (bOtherOpen) {
				TooltipManager.closeOthers(oTooltip);
			}
			oTooltip.openBy(oOpenBy, iDelay);
		};

		/**
		 * Closes the given tooltip with <code>0</code> or
		 * <code>HOVER_DELAY_MS</code>. The registry entry is kept until
		 * <code>afterClose</code> fires so a handoff during the close-delay
		 * window is still recognized.
		 *
		 * @param {sap.m.Tooltip} oTooltip
		 * @param {boolean} [bWithDelay=false]
		 */
		TooltipManager.close = function(oTooltip, bWithDelay = false) {
			if (!oTooltip) {
				return;
			}
			oTooltip.close(bWithDelay ? HOVER_DELAY_MS : 0);
		};

		/**
		 * Closes every registered tooltip except <code>oCurrent</code> with
		 * the handoff delay.
		 *
		 * @param {sap.m.Tooltip} oCurrent
		 */
		TooltipManager.closeOthers = function(oCurrent) {
			oOpenTooltips.forEach((oTooltip) => {
				if (oTooltip !== oCurrent) {
					oTooltip.close(HANDOFF_DELAY_MS);
				}
			});
		};

		/**
		 * Registers <code>oTooltip</code> as about-to-open. The entry stays in
		 * the registry through the open-delay and open-lifetime windows until
		 * {@link #deregister} is called on <code>afterClose</code>.
		 *
		 * @param {sap.m.Tooltip} oTooltip
		 */
		TooltipManager.registerOpening = function(oTooltip) {
			oOpenTooltips.add(oTooltip);
		};

		/**
		 * Removes <code>oTooltip</code> from the registry.
		 *
		 * @param {sap.m.Tooltip} oTooltip
		 */
		TooltipManager.deregister = function(oTooltip) {
			oOpenTooltips.delete(oTooltip);
		};

		/**
		 * @returns {Set<sap.m.Tooltip>} The internal registry. Test-only.
		 * @private
		 */
		TooltipManager._getRegistry = function() {
			return oOpenTooltips;
		};

		return TooltipManager;
	});
