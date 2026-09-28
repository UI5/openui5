/*global QUnit */
/**
 * @fileoverview
 * @deprecated As of version 1.120
 */
sap.ui.define([
	"sap/ui/qunit/utils/ControlIterator",
	"sap/ui/Device"
], function(ControlIterator, Device) {
	"use strict";

	QUnit.module("ControlRenderer");

	QUnit.test("check async loading", function(assert) {
		if (!Device.browser.chrome) {
			assert.ok(true, "should only be executed on Chrome since it is a generic, browser independent test");
			return;
		}

		var done = assert.async();

		var syncSpy = this.spy(sap.ui, "requireSync");
		var aNonExistingRenderers = [];
		ControlIterator.run(function(sControlName, oControlClass, oInfo) {
			// check if, although control has been loaded already, retrieving the control's renderer would trigger a successful sync request
			if (oInfo.canRender) {
				var metadata = oControlClass.getMetadata();

				var rendererModuleName = metadata.getRendererName().replace(/\./g, "/");
				var renderer = sap.ui.require(rendererModuleName);
				if (!renderer) {
					// manually call #getRenderer() to trigger a sync call (requireSync)
					try {
						metadata.getRenderer();
					} catch (e) {
						// sync request fails -> no renderer present
						aNonExistingRenderers.push(rendererModuleName);
					}
				}
			}
		}, {
			librariesToTest: ControlIterator.aKnownOpenUI5Libraries,
			includeElements: false,
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
			done: function() {
				var aCalls = syncSpy.getCalls().map(function(o) {
					return o.args[0];
				});

				assert.deepEqual(aCalls.filter(function(r) {
					return r.endsWith("Renderer") && aNonExistingRenderers.indexOf(r) === -1;
				}), [], "Renderers should never be required using synchronously. Check the respective control and add a dependency to its renderer");

				done();
			}
		});
	});

});
