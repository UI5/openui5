// Minimal "fake" host controls used by the Tooltip / TooltipEnablement
// showcases. Each one demonstrates the full documented TooltipEnablement
// integration: create the helper in init(), render the invisible ARIA anchor
// plus aria-describedby in the renderer, and destroy the helper in exit().
sap.ui.define([
	"sap/ui/core/Control",
	"sap/ui/core/tooltip/TooltipEnablement",
	"sap/m/MessageToast"
], function (Control, TooltipEnablement, MessageToast) {
	"use strict";

	const LONG_PRESS_MS = 500;

	// Shows a toast that the control was activated (real click / Enter / Space).
	function showActivated(oControl) {
		MessageToast.show("Activated: " + oControl.getText());
	}

	// Shows a toast that a long-press happened WITHOUT activation, to verify a
	// long-press does not click the control.
	function showLongPress(oControl) {
		MessageToast.show("Long press (no activation): " + oControl.getText());
	}

	// Wires touch long-press detection onto a control's touch handlers.
	function armLongPress(oControl) {
		oControl._bLongPressed = false;
		oControl._iLongPressTimer = setTimeout(function () {
			oControl._iLongPressTimer = null;
			oControl._bLongPressed = true;
			showLongPress(oControl);
		}, LONG_PRESS_MS);
	}

	function clearLongPress(oControl) {
		if (oControl._iLongPressTimer) {
			clearTimeout(oControl._iLongPressTimer);
			oControl._iLongPressTimer = null;
		}
	}

	// A focusable fake button rendered as a native <button>.
	const FakeButton = Control.extend("local.FakeButton", {
		metadata: {
			properties: {
				text: { type: "string", defaultValue: "" },
				tooltipText: { type: "string", defaultValue: "" }
			}
		},
		init: function () {
			this._oTooltipEnablement = new TooltipEnablement(this, {
				textProvider: () => this.getTooltipText()
			});
		},
		exit: function () {
			clearLongPress(this);
			if (this._oTooltipEnablement) {
				this._oTooltipEnablement.destroy();
				this._oTooltipEnablement = null;
			}
		},
		renderer: {
			apiVersion: 2,
			render: function (oRm, oControl) {
				oRm.openStart("button", oControl);
				oRm.class("fakeButton");
				oRm.accessibilityState(oControl, {
					describedby: {
						value: oControl._oTooltipEnablement.getInvisibleTooltipId(),
						append: true
					}
				});
				oRm.openEnd();
				oRm.text(oControl.getText());
				oControl._oTooltipEnablement.renderInvisibleTooltip(oRm);
				oRm.close("button");
			}
		},
		// Mirror a real button: clicking activates and moves focus to it.
		onclick: function () {
			if (this._bLongPressed) {
				this._bLongPressed = false;
				return;
			}
			this.focus();
			showActivated(this);
		},
		onsapenter: function () {
			showActivated(this);
		},
		onsapspace: function () {
			showActivated(this);
		},
		ontouchstart: function () {
			armLongPress(this);
		},
		ontouchmove: function () {
			clearLongPress(this);
		},
		ontouchend: function () {
			clearLongPress(this);
		},
		ontouchcancel: function () {
			clearLongPress(this);
		}
	});

	// A fake text. Non-focusable by default; set focusable=true to render a
	// tabindex so the keyboard-focus path is exercised.
	const FakeText = Control.extend("local.FakeText", {
		metadata: {
			properties: {
				text: { type: "string", defaultValue: "" },
				tooltipText: { type: "string", defaultValue: "" },
				focusable: { type: "boolean", defaultValue: false }
			}
		},
		init: function () {
			this._oTooltipEnablement = new TooltipEnablement(this, {
				textProvider: () => this.getTooltipText(),
				// A non-focusable span has no focus DOM ref; attach to the outer DOM.
				domRefProvider: () => this.getDomRef()
			});
		},
		exit: function () {
			if (this._oTooltipEnablement) {
				this._oTooltipEnablement.destroy();
				this._oTooltipEnablement = null;
			}
		},
		renderer: {
			apiVersion: 2,
			render: function (oRm, oControl) {
				oRm.openStart("span", oControl);
				oRm.class("fakeText");
				if (oControl.getFocusable()) {
					oRm.attr("tabindex", "0");
				}
				oRm.accessibilityState(oControl, {
					describedby: {
						value: oControl._oTooltipEnablement.getInvisibleTooltipId(),
						append: true
					}
				});
				oRm.openEnd();
				oRm.text(oControl.getText());
				oControl._oTooltipEnablement.renderInvisibleTooltip(oRm);
				oRm.close("span");
			}
		},
		getFocusDomRef: function () {
			return this.getFocusable() ? this.getDomRef() : Control.prototype.getFocusDomRef.call(this);
		}
	});

	// A fake link rendered as a native <a>. Tooltip is disabled for touch
	// devices so long-press keeps the native context menu.
	const FakeLink = Control.extend("local.FakeLink", {
		metadata: {
			properties: {
				text: { type: "string", defaultValue: "" },
				href: { type: "string", defaultValue: "#" },
				tooltipText: { type: "string", defaultValue: "" }
			}
		},
		init: function () {
			this._oTooltipEnablement = new TooltipEnablement(this, {
				textProvider: () => this.getTooltipText(),
				enableForTouchDevices: false
			});
		},
		exit: function () {
			clearLongPress(this);
			if (this._oTooltipEnablement) {
				this._oTooltipEnablement.destroy();
				this._oTooltipEnablement = null;
			}
		},
		renderer: {
			apiVersion: 2,
			render: function (oRm, oControl) {
				oRm.openStart("a", oControl);
				oRm.class("fakeLink");
				oRm.attr("href", oControl.getHref());
				oRm.attr("target", "_blank");
				oRm.accessibilityState(oControl, {
					describedby: {
						value: oControl._oTooltipEnablement.getInvisibleTooltipId(),
						append: true
					}
				});
				oRm.openEnd();
				oRm.text(oControl.getText());
				oControl._oTooltipEnablement.renderInvisibleTooltip(oRm);
				oRm.close("a");
			}
		},
		// Show activation instead of navigating away, so the toast stays visible.
		onclick: function (oEvent) {
			oEvent.preventDefault();
			if (this._bLongPressed) {
				this._bLongPressed = false;
				return;
			}
			this.focus();
			showActivated(this);
		},
		onsapenter: function (oEvent) {
			oEvent.preventDefault();
			showActivated(this);
		},
		ontouchstart: function () {
			armLongPress(this);
		},
		ontouchmove: function () {
			clearLongPress(this);
		},
		ontouchend: function () {
			clearLongPress(this);
		},
		ontouchcancel: function () {
			clearLongPress(this);
		}
	});

	// A plain focusable fake button with NO internal TooltipEnablement. Used by
	// the Tooltip showcase to drive a sap.ui.core.tooltip.Tooltip directly
	// (placement, delay, openBy/close) without the helper in the way.
	const PlainButton = Control.extend("local.PlainButton", {
		metadata: {
			properties: {
				text: { type: "string", defaultValue: "" }
			}
		},
		renderer: {
			apiVersion: 2,
			render: function (oRm, oControl) {
				oRm.openStart("button", oControl);
				oRm.class("fakeButton");
				oRm.openEnd();
				oRm.text(oControl.getText());
				oRm.close("button");
			}
		},
		// Mirror a real button: clicking it moves focus to it.
		onclick: function () {
			this.focus();
		}
	});

	// A single control with THREE nested focusable spans, each with its own
	// tooltip. None of the spans is the outer DOM ref — this exercises focus/
	// hover on elements nested inside the host, with a different tooltip per
	// target, all via delegates on the same host control.
	const FakeMultiTarget = Control.extend("local.FakeMultiTarget", {
		metadata: {
			properties: {
				texts: { type: "string[]", defaultValue: ["Alpha", "Beta", "Gamma"] },
				tooltipTexts: { type: "string[]", defaultValue: ["Tooltip Alpha", "Tooltip Beta", "Tooltip Gamma"] }
			}
		},
		init: function () {
			this._aEnablements = this.getTooltipTexts().map((sTooltip, i) => {
				return new TooltipEnablement(this, {
					textProvider: () => this.getTooltipTexts()[i],
					invisibleTooltipIdSuffix: "-invisibleTooltip-" + i,
					domRefProvider: () => {
						return this.getDomRef && this.getDomRef()
							? this.getDomRef().querySelector("[data-target='" + i + "']")
							: null;
					}
				});
			});
		},
		exit: function () {
			this._aEnablements.forEach((oEnablement) => oEnablement.destroy());
			this._aEnablements = null;
		},
		renderer: {
			apiVersion: 2,
			render: function (oRm, oControl) {
				oRm.openStart("div", oControl);
				oRm.class("fakeMultiTarget");
				oRm.openEnd();
				oControl.getTexts().forEach((sText, i) => {
					const oEnablement = oControl._aEnablements[i];
					oRm.openStart("span");
					oRm.attr("data-target", i);
					oRm.attr("tabindex", "0");
					oRm.class("fakeMultiTargetItem");
					const sAnchorId = oEnablement.getInvisibleTooltipId();
					if (sAnchorId) {
						oRm.attr("aria-describedby", sAnchorId);
					}
					oRm.openEnd();
					oRm.text(sText);
					oEnablement.renderInvisibleTooltip(oRm);
					oRm.close("span");
				});
				oRm.close("div");
			}
		}
	});

	return { FakeButton, FakeText, FakeLink, PlainButton, FakeMultiTarget };
});
