sap.ui.define([
	"sap/ui/core/Control",
	"sap/ui/core/tooltip/TooltipEnablement"
], function (Control, TooltipEnablement) {
	"use strict";

	// Minimal host that renders a single <div>. No TooltipEnablement of its own —
	// tests instantiate one externally when needed.
	const PlainHost = Control.extend("test.tooltip.PlainHost", {
		metadata: {
			properties: {
				tooltipText: { type: "string", defaultValue: "hi" }
			}
		},
		renderer: {
			apiVersion: 2,
			render: function (oRm, oControl) {
				oRm.openStart("div", oControl).openEnd().close("div");
			}
		}
	});

	// Host that renders a single focusable <div> we can target.
	const FocusableHost = Control.extend("test.tooltip.FocusableHost", {
		renderer: {
			apiVersion: 2,
			render: function (oRm, oControl) {
				oRm.openStart("div", oControl);
				oRm.attr("tabindex", "0");
				oRm.openEnd();
				oRm.close("div");
			}
		}
	});

	// Host with two nested focusable spans, ids <id>-a and <id>-b.
	const TwoTargetHost = Control.extend("test.tooltip.TwoTargetHost", {
		renderer: {
			apiVersion: 2,
			render: function (oRm, oControl) {
				oRm.openStart("div", oControl);
				oRm.openEnd();
				["a", "b"].forEach(function (s) {
					oRm.openStart("span", oControl.getId() + "-" + s);
					oRm.attr("tabindex", "0");
					oRm.openEnd();
					oRm.text(s);
					oRm.close("span");
				});
				oRm.close("div");
			}
		}
	});

	// One control with three nested focusable spans, each with its own tooltip
	// wired through a per-target TooltipEnablement (exposed via _aEnablements).
	const MultiTargetEnablementHost = Control.extend("test.tooltip.MultiTargetEnablementHost", {
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

	return { PlainHost, FocusableHost, TwoTargetHost, MultiTargetEnablementHost };
});
