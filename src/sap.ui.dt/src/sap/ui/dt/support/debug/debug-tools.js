/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/support/debug/UI5Debug",
	"sap/ui/core/Element",
	"sap/ui/dt/OverlayRegistry"
], function(UI5Debug, Element, OverlayRegistry) {
	"use strict";

	// scope() is a helper function to create a clean empty object without a prototype chain
	const { scope } = UI5Debug;

	return {
		// Help entries shown by "ui5.help()"
		__help: [
			{ cmd: "ui5.flexDt.getOverlay($0)", text: "Get the overlay for an HTMLElement, UI5 element, or id" },
			{ cmd: "ui5.flexDt.getEditableOverlays()", text: "Get all registered, editable overlays" }
		],

		// Tools are merged into the global "ui5" object under a dedicated "flexDt" sub-namespace
		// to avoid name clashes with the base tools or other libraries
		flexDt: scope({
			/**
			 * Retrieves the overlay registered for a control, element, id, or DOM node from the OverlayRegistry.
			 * Use the special variable $0 in the debugger to access the currently selected DOM node from the
			 * "Elements" tab - it is resolved to the closest UI5 element automatically.
			 * @param {string|HTMLElement|sap.ui.core.Element|sap.ui.core.Component} vElementOrId - Element instance, id, or DOM node
			 * @returns {sap.ui.dt.Overlay|undefined} The registered overlay, or undefined if none is found
			 */
			getOverlay(vElementOrId) {
				const vTarget = vElementOrId instanceof HTMLElement
					? Element.closestTo(vElementOrId)
					: vElementOrId;
				return OverlayRegistry.getOverlay(vTarget);
			},

			/**
			 * Retrieves all editable overlays currently registered in the OverlayRegistry.
			 * @returns {sap.ui.dt.Overlay[]} Array of all registered overlays
			 */
			getEditableOverlays() {
				return OverlayRegistry.getOverlays().filter((oOverlay) => oOverlay.isEditable?.());
			}
		})
	};
});
