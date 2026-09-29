/*global QUnit */
sap.ui.define([
	"sap/m/ToggleButton",
	"sap/ui/core/tooltip/TooltipEnablement",
	"sap/ui/qunit/utils/nextUIUpdate"
], function(
	ToggleButton,
	TooltipEnablement,
	nextUIUpdate
) {
	"use strict";

	// ----------------------------------------------------------------
	// Module: ToggleButton — tooltip with pressed state
	// ----------------------------------------------------------------
	QUnit.module("ToggleButton — tooltip with pressed state", {
		beforeEach: async function() {
			this.stub(TooltipEnablement, "isEnhancedTooltipEnabled").returns(true);
			this.oButton = new ToggleButton("tbtn", {
				text: "Bold",
				tooltip: "Toggle bold formatting"
			});
			this.oButton.placeAt("qunit-fixture");
			await nextUIUpdate(this.clock);
		},
		afterEach: async function() {
			this.oButton.destroy();
			await nextUIUpdate(this.clock);
		}
	});

	QUnit.test("_buildTooltipText returns tooltip text regardless of pressed state",
			function(assert) {
		assert.ok(this.oButton._buildTooltipText().indexOf("Toggle bold formatting") !== -1,
			"tooltip text returned when not pressed");

		this.oButton.setPressed(true);

		assert.ok(this.oButton._buildTooltipText().indexOf("Toggle bold formatting") !== -1,
			"tooltip text still returned when pressed");
	});

	QUnit.test("no native title and invisible tooltip span present after setPressed",
			async function(assert) {
		// Act
		this.oButton.setPressed(true);
		await nextUIUpdate(this.clock);

		// Assert
		const sId = this.oButton._oTooltipEnablement.getInvisibleTooltipId();
		assert.strictEqual(this.oButton.getDomRef().getAttribute("title"), null,
			"no native title attribute when pressed");
		assert.ok(document.getElementById(sId),
			"invisible tooltip span still present in the DOM when pressed");
	});
});
