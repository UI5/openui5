sap.ui.define([
	"sap/ui/core/Control"
], function(Control) {
	"use strict";

	// Minimal test-only host control. Renders a single <div>. Does NOT wire a
	// TooltipEnablement on its own — tests instantiate one externally when needed.
	return Control.extend("test.tooltip.FakeTooltipHost", {
		metadata: {
			properties: {
				tooltipText: { type: "string", defaultValue: "hi" }
			}
		},
		renderer: {
			apiVersion: 2,
			render: function(oRm, oControl) {
				oRm.openStart("div", oControl).openEnd().close("div");
			}
		}
	});
});
