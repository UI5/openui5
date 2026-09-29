/*global QUnit */
sap.ui.define([
	"sap/ui/qunit/utils/ControlIterator"
], function(ControlIterator) {
	"use strict";

	// disable require.js to avoid issues with thirdparty
	sap.ui.loader.config({
		map: {
			"*": {
				"sap/ui/thirdparty/require": "test-resources/sap/ui/core/qunit/generic/helper/_emptyModule"
			}
		}
	});

	QUnit.test("Testing all controls", function(assert) { // one single QUnit test for all controls
		var testDone = assert.async();                    // this test is asynchronous, hence need to tell QUnit later when done

		ControlIterator.run(function(sControlName, oControlClass, oInfo) { // loop over all controls
			assert.ok(true, sControlName + " would be tested now");        // do one or more asserts per control
		},{
			excludedControls: [
				"sap.m._overflowToolbarHelpers.OverflowToolbarAssociativePopover",
				"sap.m._PlanningCalendarInternalHeader",
				"sap.m._PlanningCalendarIntervalPlaceholder",
				"sap.m._PlanningCalendarRowHeader",
				"sap.m._PlanningCalendarRowTimeline",
				"sap.m.DynamicDateRangeListItem",
				"sap.m.HeaderContainerItemContainer",
				"sap.m.internal.CustomNumericInput",
				"sap.m.internal.DateTimePickerPopup",
				"sap.m.internal.DynamicDateRangeInput",
				"sap.m.internal.ObjectMarkerCustomLink",
				"sap.m.internal.ObjectMarkerCustomText",
				"sap.m.internal.PlanningCalendarRowListItem",
				"sap.m.internal.TabStripSelect",
				"sap.m.internal.TabStripSelectList",
				"sap.m.internal.ToggleSpinButton",
				"sap.m.SinglePlanningCalendarGrid._internal.IntervalPlaceholder",
				"sap.m.SinglePlanningCalendarMonthGrid._internal.IntervalPlaceholder",
				"sap.m.table.columnmenu.AssociativeControl",
				"sap.m.upload.DynamicItemContent",
				"sap.ui.comp.SmartToggle",
				"sap.ui.documentation.Container",
				"sap.ui.layout.form.ResponsiveLayoutPanel",
				"sap.ui.unified._ColorPickerBox",
				"sap.ui.unified.internal.CustomMonthPicker",
				"sap.ui.unified.internal.CustomYearPicker"
			],
			done: function(oResult) {
				// do something when all control tests have been executed

				testDone(); // tell QUnit that this test is done
			}
		});
	});

});
