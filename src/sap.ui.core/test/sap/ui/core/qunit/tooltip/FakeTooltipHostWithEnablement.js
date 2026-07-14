sap.ui.define([
	"./FakeTooltipHost",
	"sap/ui/core/tooltip/TooltipEnablement"
], function(FakeTooltipHost, TooltipEnablement) {
	"use strict";

	// Variant of FakeTooltipHost that wires its own TooltipEnablement in init().
	// Use this for scenarios that need the enablement to be part of the host's
	// own lifecycle — e.g. host cloning.
	return FakeTooltipHost.extend("test.tooltip.FakeTooltipHostWithEnablement", {
		init: function() {
			this._oTooltipEnablement = new TooltipEnablement(this, {
				textProvider: () => this.getTooltipText()
			});
		},
		exit: function() {
			if (this._oTooltipEnablement) {
				this._oTooltipEnablement.destroy();
				this._oTooltipEnablement = null;
			}
		},
		renderer: FakeTooltipHost.getMetadata().getRenderer()
	});
});
