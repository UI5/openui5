/* global QUnit */

sap.ui.define([
	"sap/ui/mdc/chart/ToolbarControlFactory",
	"sap/m/OverflowToolbarLayoutData",
	"sap/ui/mdc/chart/ActionLayoutData",
	"sap/ui/mdc/enums/ChartActionPosition"
], (ToolbarControlFactory, OverflowToolbarLayoutData, ActionLayoutData, ChartActionPosition) => {
	"use strict";

	QUnit.module("sap.ui.mdc.chart.ToolbarControlFactory", {
		afterEach: function () {
			if (this.oControl) {
				this.oControl.destroy();
				this.oControl = null;
			}
		}
	});

	QUnit.test("createDrillDownBtn with default settings", function (assert) {
		this.oControl = ToolbarControlFactory.createDrillDownBtn("testChart", {});

		assert.ok(this.oControl, "Drill-down button created");
		assert.strictEqual(this.oControl.getId(), "testChart-drillDown", "Button has correct ID");

		const oLayoutData = this.oControl.getLayoutData();
		assert.ok(oLayoutData instanceof OverflowToolbarLayoutData, "Button has OverflowToolbarLayoutData");
		assert.strictEqual(oLayoutData.getCloseOverflowOnInteraction(), false, "Default closeOverflowOnInteraction is false");
	});

	QUnit.test("createDrillDownBtn with custom layoutData", function (assert) {
		const oCustomLayoutData = new ActionLayoutData({
			position: ChartActionPosition.PersonalizationActionsDrillDown,
			closeOverflowOnInteraction: false
		});

		this.oControl = ToolbarControlFactory.createDrillDownBtn("testChart", {
			layoutData: oCustomLayoutData
		});

		const oLayoutData = this.oControl.getLayoutData();
		assert.strictEqual(oLayoutData, oCustomLayoutData, "Button uses provided layoutData");
		assert.ok(oLayoutData instanceof ActionLayoutData, "Button has ActionLayoutData");
		assert.strictEqual(oLayoutData.getPosition(), ChartActionPosition.PersonalizationActionsDrillDown, "Position is correct");
	});

	QUnit.test("createLegendBtn with default settings", function (assert) {
		this.oControl = ToolbarControlFactory.createLegendBtn("testChart", {});

		assert.ok(this.oControl, "Legend button created");
		assert.strictEqual(this.oControl.getId(), "testChartbtnLegend", "Button has correct ID");
		assert.ok(this.oControl.getLayoutData() === null || this.oControl.getLayoutData() === undefined, "No default layoutData set");
	});

	QUnit.test("createLegendBtn with custom layoutData", function (assert) {
		const oCustomLayoutData = new ActionLayoutData({
			position: ChartActionPosition.PersonalizationActionsLegend
		});

		this.oControl = ToolbarControlFactory.createLegendBtn("testChart", {
			layoutData: oCustomLayoutData
		});

		const oLayoutData = this.oControl.getLayoutData();
		assert.strictEqual(oLayoutData, oCustomLayoutData, "Button uses provided layoutData");
		assert.ok(oLayoutData instanceof ActionLayoutData, "Button has ActionLayoutData");
	});

	QUnit.test("createZoomInBtn with default settings", function (assert) {
		this.oControl = ToolbarControlFactory.createZoomInBtn("testChart", {});

		assert.ok(this.oControl, "Zoom-in button created");
		assert.strictEqual(this.oControl.getId(), "testChartbtnZoomIn", "Button has correct ID");

		const oLayoutData = this.oControl.getLayoutData();
		assert.ok(oLayoutData instanceof OverflowToolbarLayoutData, "Button has OverflowToolbarLayoutData");
		assert.strictEqual(oLayoutData.getCloseOverflowOnInteraction(), false, "Default closeOverflowOnInteraction is false");
	});

	QUnit.test("createZoomInBtn with custom layoutData", function (assert) {
		const oCustomLayoutData = new ActionLayoutData({
			position: ChartActionPosition.PersonalizationActionsZoomIn,
			closeOverflowOnInteraction: false
		});

		this.oControl = ToolbarControlFactory.createZoomInBtn("testChart", {
			layoutData: oCustomLayoutData
		});

		const oLayoutData = this.oControl.getLayoutData();
		assert.strictEqual(oLayoutData, oCustomLayoutData, "Button uses provided layoutData");
		assert.ok(oLayoutData instanceof ActionLayoutData, "Button has ActionLayoutData");
	});

	QUnit.test("createZoomOutBtn with default settings", function (assert) {
		this.oControl = ToolbarControlFactory.createZoomOutBtn("testChart", {});

		assert.ok(this.oControl, "Zoom-out button created");
		assert.strictEqual(this.oControl.getId(), "testChartbtnZoomOut", "Button has correct ID");

		const oLayoutData = this.oControl.getLayoutData();
		assert.ok(oLayoutData instanceof OverflowToolbarLayoutData, "Button has OverflowToolbarLayoutData");
		assert.strictEqual(oLayoutData.getCloseOverflowOnInteraction(), false, "Default closeOverflowOnInteraction is false");
	});

	QUnit.test("createZoomOutBtn with custom layoutData", function (assert) {
		const oCustomLayoutData = new ActionLayoutData({
			position: ChartActionPosition.PersonalizationActionsZoomOut,
			closeOverflowOnInteraction: false
		});

		this.oControl = ToolbarControlFactory.createZoomOutBtn("testChart", {
			layoutData: oCustomLayoutData
		});

		const oLayoutData = this.oControl.getLayoutData();
		assert.strictEqual(oLayoutData, oCustomLayoutData, "Button uses provided layoutData");
		assert.ok(oLayoutData instanceof ActionLayoutData, "Button has ActionLayoutData");
	});

	QUnit.test("createSettingsBtn with custom layoutData", function (assert) {
		const oCustomLayoutData = new ActionLayoutData({
			position: ChartActionPosition.PersonalizationActionsSettings
		});

		this.oControl = ToolbarControlFactory.createSettingsBtn("testChart", {
			layoutData: oCustomLayoutData
		});

		const oLayoutData = this.oControl.getLayoutData();
		assert.strictEqual(oLayoutData, oCustomLayoutData, "Button uses provided layoutData");
		assert.ok(oLayoutData instanceof ActionLayoutData, "Button has ActionLayoutData");
	});

	QUnit.test("createChartTypeBtn with default settings", function (assert) {
		this.oControl = ToolbarControlFactory.createChartTypeBtn("testChart", {});

		assert.ok(this.oControl, "Chart type button created");
		assert.strictEqual(this.oControl.getId(), "testChart-btnChartType", "Button has correct ID");

		const oLayoutData = this.oControl.getLayoutData();
		assert.ok(oLayoutData instanceof OverflowToolbarLayoutData, "Button has OverflowToolbarLayoutData");
		assert.strictEqual(oLayoutData.getCloseOverflowOnInteraction(), false, "Default closeOverflowOnInteraction is false");
	});

	QUnit.test("createChartTypeBtn with custom layoutData", function (assert) {
		const oCustomLayoutData = new ActionLayoutData({
			position: ChartActionPosition.ViewActionsChartType,
			closeOverflowOnInteraction: false
		});

		this.oControl = ToolbarControlFactory.createChartTypeBtn("testChart", {
			layoutData: oCustomLayoutData
		});

		const oLayoutData = this.oControl.getLayoutData();
		assert.strictEqual(oLayoutData, oCustomLayoutData, "Button uses provided layoutData");
		assert.ok(oLayoutData instanceof ActionLayoutData, "Button has ActionLayoutData");
	});

	QUnit.test("layoutData preservation when provided in settings", function (assert) {
		const oCustomLayoutData = new ActionLayoutData({
			position: ChartActionPosition.ViewActions
		});

		this.oControl = ToolbarControlFactory.createZoomInBtn("testChart", {
			layoutData: oCustomLayoutData
		});

		const oLayoutData = this.oControl.getLayoutData();
		assert.strictEqual(oLayoutData, oCustomLayoutData, "Custom layoutData is preserved");
		assert.notOk(oLayoutData instanceof OverflowToolbarLayoutData && !(oLayoutData instanceof ActionLayoutData),
			"Custom layoutData is not replaced with default OverflowToolbarLayoutData");
		assert.strictEqual(oLayoutData.getPriority(), "High", "Custom layoutData properties are intact");
	});

	QUnit.test("Default OverflowToolbarLayoutData only applied when layoutData not provided", function (assert) {
		this.oControl = ToolbarControlFactory.createDrillDownBtn("testChart", {});

		const oLayoutData = this.oControl.getLayoutData();
		assert.ok(oLayoutData instanceof OverflowToolbarLayoutData, "Default OverflowToolbarLayoutData is applied");
		assert.strictEqual(oLayoutData.getCloseOverflowOnInteraction(), false, "Default closeOverflowOnInteraction is false");
	});
});
