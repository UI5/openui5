/*global QUnit */
sap.ui.define([
	"sap/m/SegmentedButton",
	"sap/m/SegmentedButtonItem",
	"sap/ui/core/ShortcutHintsMixin",
	"sap/ui/core/tooltip/TooltipEnablement",
	"sap/ui/test/utils/nextUIUpdate"
], function(
	SegmentedButton,
	SegmentedButtonItem,
	ShortcutHintsMixin,
	TooltipEnablement,
	nextUIUpdate
) {
	"use strict";

	// ----------------------------------------------------------------
	// Module: SegmentedButton — initialization
	// ----------------------------------------------------------------
	QUnit.module("SegmentedButton — initialization", {
		beforeEach: function() {
			this.oFlagStub = this.stub(TooltipEnablement, "isEnhancedTooltipEnabled");
		},
		afterEach: function() {
			this.oControl.destroy();
		}
	});

	QUnit.test("inner buttons get _oTooltipEnablement and outer container has ShortcutHintsMixin suppressed",
			function(assert) {
		// Prepare
		this.oFlagStub.returns(true);
		const oSuppressStub = this.stub(ShortcutHintsMixin, "setPopupSuppressed");

		// Act
		this.oControl = new SegmentedButton({
			items: [
				new SegmentedButtonItem({ text: "A", tooltip: "Option A" }),
				new SegmentedButtonItem({ text: "B", tooltip: "Option B" })
			]
		});

		// Assert
		const aButtons = this.oControl.getButtons();
		assert.ok(aButtons[0]._oTooltipEnablement instanceof TooltipEnablement,
			"first inner button has a TooltipEnablement instance");
		assert.ok(aButtons[1]._oTooltipEnablement instanceof TooltipEnablement,
			"second inner button has a TooltipEnablement instance");
		assert.ok(oSuppressStub.calledWith(this.oControl, true),
			"ShortcutHintsMixin popup is suppressed on the outer container");
	});

	// ----------------------------------------------------------------
	// Module: SegmentedButton — tooltip behaviour
	// ----------------------------------------------------------------
	QUnit.module("SegmentedButton — tooltip behaviour", {
		beforeEach: async function() {
			this.stub(TooltipEnablement, "isEnhancedTooltipEnabled").returns(true);
			this.oControl = new SegmentedButton("sbtn", {
				tooltip: "View mode",
				items: [
					new SegmentedButtonItem("sbtn-item0", { text: "Day" }),
					new SegmentedButtonItem("sbtn-item1", {
						text: "Week", tooltip: "Weekly view", enabled: false
					})
				]
			});
			this.oControl.placeAt("qunit-fixture");
			await nextUIUpdate(this.clock);
		},
		afterEach: async function() {
			this.oControl.destroy();
			await nextUIUpdate(this.clock);
		}
	});

	QUnit.test("_buildTooltipText falls back to the parent tooltip when the item has no own tooltip",
			function(assert) {
		const oButton = this.oControl.getButtons()[0];
		assert.ok(oButton._buildTooltipText().indexOf("View mode") !== -1,
			"parent container tooltip used when the item has no own tooltip");
	});

	QUnit.test("_buildTooltipText returns empty string for a disabled segment", function(assert) {
		assert.strictEqual(this.oControl.getButtons()[1]._buildTooltipText(), "",
			"tooltip text is empty for a disabled segment so no popup appears");
	});

	QUnit.test("aria-describedby on the <li> references the invisible tooltip id", function(assert) {
		const oButton = this.oControl.getButtons()[0];
		const sInvisibleId = oButton._oTooltipEnablement.getInvisibleTooltipId();
		const sDescribedBy = oButton.getDomRef().getAttribute("aria-describedby");
		assert.ok(sDescribedBy && sDescribedBy.split(" ").includes(sInvisibleId),
			"aria-describedby on the <li> element references the invisible tooltip span");
	});
});
