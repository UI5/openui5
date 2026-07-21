// Minimal "fake" host controls used by the Tooltip / TooltipEnablement
// showcases. Each one demonstrates the full documented TooltipEnablement
// integration: create the helper in init(), render the invisible ARIA anchor
// plus aria-describedby in the renderer, and destroy the helper in exit().
sap.ui.define([
	"sap/ui/core/Control",
	"sap/ui/core/tooltip/TooltipEnablement"
], function (Control, TooltipEnablement) {
	"use strict";

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
		}
	});

	return { FakeButton, FakeText, FakeLink, PlainButton };
});
