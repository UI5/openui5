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
				/**
				 * @deprecated Since version 1.38
				 */
				"sap.ui.commons.SearchField.TF",
				/**
				 * @deprecated Since version 1.38
				 */
				"sap.ui.commons.SearchField.CB",
				"sap.ui.comp.SmartToggle",
				/**
				 * @deprecated since 1.120
				 */
				"sap.ui.core.mvc.XMLAfterRenderingNotifier",
				"sap.ui.documentation.Container",
				/**
				 * @deprecated As of version 1.93
				 */
				"sap.ui.layout.form.ResponsiveGridLayoutPanel",
				"sap.ui.layout.form.ResponsiveLayoutPanel",
				"sap.ui.unified._ColorPickerBox",
				"sap.ui.unified.internal.CustomMonthPicker",
				"sap.ui.unified.internal.CustomYearPicker",
				/**
				 * @deprecated Since version 1.38
				 */
				"sap.ui.ux3.ExactList.LB",
				/**
				 * @deprecated Since version 1.38
				 */
				"sap.ui.ux3.NotificationBar.NotifierView",
				/**
				 * @deprecated Since version 1.38
				 */
				"sap.ui.ux3.NotificationBar.MessageView"
			],
			done: function(oResult) {
				// do something when all control tests have been executed

				testDone(); // tell QUnit that this test is done
			}
		});
	});

});
