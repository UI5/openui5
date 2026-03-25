/*global QUnit */
sap.ui.define([
	"sap/m/PlanningCalendarHeader",
	"sap/ui/test/utils/nextUIUpdate",
	"sap/ui/unified/Calendar",
	"sap/ui/unified/calendar/CustomMonthPicker",
	"sap/ui/unified/calendar/CustomYearPicker",
	"sap/m/SegmentedButtonItem",
	'sap/ui/core/InvisibleText'
], function(
	PlanningCalendarHeader,
	nextUIUpdate,
	Calendar,
	CustomMonthPicker,
	CustomYearPicker,
	SegmentedButtonItem,
	InvisibleText
) {
	"use strict";

	QUnit.module("initialize");

	QUnit.test("unified.Calendar aggregations are instantiated correctly", function (assert) {
		// Prepare
		var oPCHeader = new PlanningCalendarHeader(),
			oCalendar = oPCHeader.getAggregation("_calendarPicker"),
			oCustomMonthPicker = oPCHeader.getAggregation("_monthPicker"),
			oCustomYearPicker = oPCHeader.getAggregation("_yearPicker");

		// Act
		// Assert
		assert.ok(oCalendar instanceof Calendar, "Calendar is instantiated");
		assert.ok(oCustomMonthPicker instanceof CustomMonthPicker, "CustomMonthPicker is instantiated");
		assert.ok(oCustomYearPicker instanceof CustomYearPicker, "CustomYearPicker is instantiated");

		// Clean
		oPCHeader.destroy();
	});

	QUnit.module("ARIA");

	QUnit.test("View switch label visibility and references", async function (assert) {
		var oPlanningCalendarHeader = new PlanningCalendarHeader(),
			oFirstMockView = new SegmentedButtonItem({ text: "A view" }),
			oSecondMockView = new SegmentedButtonItem({ text: "Another view" }),
			oViewSwitchLabel,
			$viewSwitch;

		oPlanningCalendarHeader._oViewSwitch.addItem(oFirstMockView);
		oPlanningCalendarHeader._oViewSwitch.addItem(oSecondMockView);

		oPlanningCalendarHeader.placeAt("qunit-fixture");
		await nextUIUpdate();

		oViewSwitchLabel = oPlanningCalendarHeader._oViewSwitchLabel;
		$viewSwitch = oPlanningCalendarHeader._oViewSwitch.$();

		// Test initial state (SegmentedButton mode)
		assert.notOk(oViewSwitchLabel.getVisible(), "Label is invisible when view switch is in normal SegmentedButton mode");
		assert.strictEqual(oViewSwitchLabel.getLabelFor(), null, "Label has no labelFor reference in SegmentedButton mode");
		assert.strictEqual($viewSwitch.attr("aria-labelledby"), InvisibleText.getStaticId("sap.m", "PCH_VIEW_SWITCH"),
			"View switch has an invisible label, which indicates its purpose ");

		// Force view switch to select mode to test label behavior
		oPlanningCalendarHeader._convertViewSwitchToSelect();
		await nextUIUpdate();

		$viewSwitch = oPlanningCalendarHeader._oViewSwitch.$();
		assert.ok(oViewSwitchLabel.getVisible(), "Label is visible when view switch is in select mode");
		assert.strictEqual(oViewSwitchLabel.getLabelFor(), oPlanningCalendarHeader._oViewSwitch.getId() + "-select",
			"Label references the select element when in select mode");
		assert.strictEqual($viewSwitch.attr("aria-labelledby"), undefined,
			"Invisible label, is removed when the switch is in select mode ");

		// Test conversion back to normal mode
		oPlanningCalendarHeader._convertViewSwitchToSegmentedButton();
		await nextUIUpdate();

		$viewSwitch = oPlanningCalendarHeader._oViewSwitch.$();
		assert.notOk(oViewSwitchLabel.getVisible(), "Label is invisible again when converted back to SegmentedButton mode");
		assert.strictEqual(oViewSwitchLabel.getLabelFor(), null, "Label has no labelFor reference when back in SegmentedButton mode");
		assert.strictEqual($viewSwitch.attr("aria-labelledby"), InvisibleText.getStaticId("sap.m", "PCH_VIEW_SWITCH"),
			"View switch has an invisible label again when converted back to SegmentedButton mode");

		oPlanningCalendarHeader.destroy();
	});
});