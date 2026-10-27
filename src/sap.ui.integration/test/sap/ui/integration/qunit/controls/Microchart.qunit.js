/* global QUnit */

sap.ui.define([
	"sap/ui/integration/controls/Microchart",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/base/Log",
	"sap/base/util/deepClone"
], function(
	Microchart,
	nextUIUpdate,
	Log,
	deepClone
) {
	"use strict";

	const DOM_RENDER_LOCATION = "qunit-fixture";

	const aSamples = [
		{
			"type": "Bullet",
			"minValue": 0,
			"maxValue": 100,
			"target": 150,
			"value": 120,
			"scale": "€",
			"displayValue": "120 EUR",
			"color": "Critical"
		},
		{
			"type": "Column",
			"leftTopLabel": "0M",
			"rightTopLabel": "80M",
			"leftBottomLabel": "June 1",
			"rightBottomLabel": "June 30",
			"columns": {
				"path": "chart/columns",
				"template": {
					"color": "Critical",
					"value": 44
				}
			}
		},
		{
			"type": "Column",
			"leftTopLabel": "0M",
			"rightTopLabel": "80M",
			"leftBottomLabel": "June 1",
			"rightBottomLabel": "June 30",
			"columns": [
				{
					"color": "Error",
					"value": 10,
					"displayValue": "10M",
					"label": "2022"
				},
				{
					"color": "Critical",
					"value": 20,
					"displayValue": "20M",
					"label": "2023"
				},
				{
					"color": "Good",
					"value": 30,
					"displayValue": "30M",
					"label": "2024"
				}
			]
		},
		{
			"type": "HarveyBall",
			"color": "Critical",
			"total": 100,
			"totalScale": "K",
			"showTotal": true,
			"percentage": 25,
			"fraction": 25,
			"fractionScale": "K"
		},
		{
			"type": "Line",
			"leftTopLabel": "0",
			"rightTopLabel": "30",
			"maxXValue": 30,
			"maxYValue": 400,
			"minXValue": 0,
			"minYValue": 0,
			"leftBottomLabel": "June 1",
			"rightBottomLabel": "June 30",
			"lines": {
				"path": "Lines",
				"template": {
					"color": "Critical",
					"lineType": "Dotted",
					"showPoints": true,
					"points": {
						"path": "Points",
						"template": {
							"x": "{X}",
							"y": "{Y}"
						}
					}
				}
			}
		},
		{
			"type": "Line",
			"leftTopLabel": "0",
			"rightTopLabel": "30",
			"maxXValue": 30,
			"maxYValue": 400,
			"minXValue": 0,
			"minYValue": 0,
			"leftBottomLabel": "June 1",
			"rightBottomLabel": "June 30",
			"lines": [
				{
					"color": "Critical",
					"lineType": "Dotted",
					"showPoints": true,
					"points": [
						{
							"x": 10,
							"y": 100
						},
						{
							"x": 20,
							"y": 400
						},
						{
							"x": 30,
							"y": 50
						}
					]
				},
				{
					"color": "Good",
					"lineType": "Dashed",
					"showPoints": true,
					"points": [
						{
							"x": 10,
							"y": 400
						},
						{
							"x": 20,
							"y": 100
						},
						{
							"x": 30,
							"y": 50
						}
					]
				}
			]
		},
		{
			"type": "Line",
			"leftTopLabel": "0",
			"rightTopLabel": "30",
			"maxXValue": 30,
			"maxYValue": 400,
			"minXValue": 0,
			"minYValue": 0,
			"leftBottomLabel": "June 1",
			"rightBottomLabel": "June 30",
			"points": [
				{
					"x": 10,
					"y": 100
				},
				{
					"x": 20,
					"y": 400
				},
				{
					"x": 30,
					"y": 50
				}
			]
		},
		{
			"type": "Line",
			"leftTopLabel": "0",
			"rightTopLabel": "30",
			"maxXValue": 30,
			"maxYValue": 400,
			"minXValue": 0,
			"minYValue": 0,
			"leftBottomLabel": "June 1",
			"rightBottomLabel": "June 30",
			"points": {
				"path": "Lines/0/Points",
				"template": {
					"x": "{X}",
					"y": "{Y}"
				}
			}
		},
		{
			"type": "Radial",
			"color": "Critical",
			"total": 100,
			"showPercentageSymbol": true,
			"percentage": 25,
			"fraction": 25
		},
		{
			"type": "StackedBar",
			"displayValue": "150K",
			"maxValue": 170,
			"bars": [
				{
					"value": 120,
					"displayValue": "Notebook 13 120K",
					"legendTitle": "Notebook 13"
				},
				{
					"value": 150,
					"displayValue": "Notebook 17 150K",
					"legendTitle": "Notebook 17"
				}
			]
		}
	];

	const pIfMicroChartsAvailable = Microchart.loadDependencies();

	function testWithMicrochart(assert, fnTest) {
		const done = assert.async();

		return pIfMicroChartsAvailable
			.then(async () => {
				await fnTest();
				done();
			}, () => {
				assert.ok(true, "Usage of Microcharts is not available with this distribution.");
				done();
			});
	}

	QUnit.module("Rendering");

	QUnit.test("Value of the chart has same color as the chart", async function (assert) {
		// arrange
		const oMicrochart = new Microchart({
			valueColor: "Good",
			displayValue: "123"
		});

		oMicrochart.placeAt(DOM_RENDER_LOCATION);
		await nextUIUpdate();

		// assert
		assert.ok(oMicrochart.$().find(".sapUiIntMicrochartValue" + oMicrochart.getValueColor()).length, "The value div should have 'Good' class.");

		// clean up
		oMicrochart.destroy();
	});

	QUnit.module("Creating");

	QUnit.test("Create different types", async function (assert) {
		// Add also with size S. Size S is only valid in the card header and not for the stacked bar.
		const aSizeSamples = aSamples
			.filter((oSample) => oSample.type !== "StackedBar")
			.map((oSample) => {
				oSample = deepClone(oSample);
				oSample.size = "S";
				return oSample;
			});

		await testWithMicrochart(assert, async () => {
			for (const oSettings of aSamples) {
				await assertChartCreated.call(this, assert, oSettings, false);
			}

			for (const oSettings of aSizeSamples) {
				await assertChartCreated.call(this, assert, oSettings, true);
			}
		});

	});

	async function assertChartCreated(assert, oSettings, bIsForHeader) {
		// Arrange
		const fnLogErrorSpy = this.spy(Log, "error");
		const oChartWrapper = Microchart.create(oSettings, bIsForHeader);
		const oChart = oChartWrapper.getChart();
		const sClassName = oChart.getMetadata().getName();
		const sExpectedClassName = `sap.suite.ui.microchart.${oSettings.type}MicroChart`;

		oChartWrapper.placeAt(DOM_RENDER_LOCATION);
		await nextUIUpdate();

		// Assert
		assert.strictEqual(sClassName, sExpectedClassName, `${oSettings.type} was created with correct class.`);
		assert.ok(fnLogErrorSpy.notCalled, `${oSettings.type} was created without errors.`);
		assert.ok(oChartWrapper.$(), `${oSettings.type} was rendered.`);

		// Clean up
		oChartWrapper.destroy();
		fnLogErrorSpy.restore();
	}

	QUnit.module("Error handling");

	QUnit.test("Invalid bar color logs error and is not applied", async function (assert) {
		await testWithMicrochart(assert, () => {
			// Arrange
			const fnLogErrorSpy = this.spy(Log, "error");
			const oChartWrapper = Microchart.create({
				type: "StackedBar",
				bars: [{ value: 10, color: "NotAColor" }]
			});

			// Assert
			assert.ok(fnLogErrorSpy.calledOnce, "Log.error called for invalid bar color.");
			assert.notStrictEqual(oChartWrapper.getChart().getBars()[0].getValueColor(), "NotAColor", "Invalid color is not applied to the bar.");

			// Clean up
			oChartWrapper.destroy();
			fnLogErrorSpy.restore();
		});
	});

	QUnit.test("Bar with no color does not log error", async function (assert) {
		await testWithMicrochart(assert, () => {
			// Arrange
			const fnLogErrorSpy = this.spy(Log, "error");
			const oChartWrapper = Microchart.create({
				type: "StackedBar",
				bars: [{ value: 10 }]
			});

			// Assert
			assert.ok(fnLogErrorSpy.notCalled, "Log.error not called when bar has no color.");

			// Clean up
			oChartWrapper.destroy();
			fnLogErrorSpy.restore();
		});
	});

	QUnit.test("Invalid size logs error and falls back to Responsive", async function (assert) {
		await testWithMicrochart(assert, () => {
			// Arrange
			const fnLogErrorSpy = this.spy(Log, "error");
			const oChartWrapper = Microchart.create({
				type: "Column",
				size: "XL",
				columns: [{ value: 10 }]
			}, true);

			// Assert
			assert.ok(fnLogErrorSpy.called, "Log.error called for invalid size.");
			assert.strictEqual(oChartWrapper.getChart().getSize(), "Responsive", "Size falls back to Responsive.");

			// Clean up
			oChartWrapper.destroy();
			fnLogErrorSpy.restore();
		});
	});

	QUnit.test("Valid size S is kept", async function (assert) {
		await testWithMicrochart(assert, () => {
			// Arrange
			const fnLogErrorSpy = this.spy(Log, "error");
			const oChartWrapper = Microchart.create({
				type: "Column",
				size: "S",
				columns: [{ value: 10 }]
			}, true);

			// Assert
			assert.ok(fnLogErrorSpy.notCalled, "Log.error not called for valid size S.");
			assert.strictEqual(oChartWrapper.getChart().getSize(), "S", "Size S is preserved.");

			// Clean up
			oChartWrapper.destroy();
			fnLogErrorSpy.restore();
		});
	});

	QUnit.test("Size S for a chart in a list item logs error", async function (assert) {
		await testWithMicrochart(assert, () => {
			// Arrange
			const fnLogErrorSpy = this.spy(Log, "error");
			const oChartWrapper = Microchart.create({
				type: "Column",
				size: "S",
				columns: [{ value: 10 }]
			}, false);

			// Assert
			assert.ok(fnLogErrorSpy.called, "Log.error called for size S in a list item.");

			// Clean up
			oChartWrapper.destroy();
			fnLogErrorSpy.restore();
		});
	});

	QUnit.test("StackedBar ignores the size property and logs error", async function (assert) {
		await testWithMicrochart(assert, () => {
			// Arrange
			const fnLogErrorSpy = this.spy(Log, "error");
			const oChartWrapper = Microchart.create({
				type: "StackedBar",
				size: "S",
				bars: [{ value: 10 }]
			}, true);

			// Assert
			assert.ok(fnLogErrorSpy.called, "Log.error called when size is passed to the stacked bar.");
			assert.notStrictEqual(oChartWrapper.getChart().getSize(), "S", "Size S is not applied to the stacked bar chart.");

			// Clean up
			oChartWrapper.destroy();
			fnLogErrorSpy.restore();
		});
	});

	QUnit.test("StackedBar without size does not log error", async function (assert) {
		await testWithMicrochart(assert, () => {
			// Arrange
			const fnLogErrorSpy = this.spy(Log, "error");
			const oChartWrapper = Microchart.create({
				type: "StackedBar",
				bars: [{ value: 10 }]
			}, true);

			// Assert
			assert.ok(fnLogErrorSpy.notCalled, "Log.error not called when size is not passed to the stacked bar.");

			// Clean up
			oChartWrapper.destroy();
			fnLogErrorSpy.restore();
		});
	});

	QUnit.test("Line chart with neither points nor lines logs info", async function (assert) {
		await testWithMicrochart(assert, () => {
			// Arrange
			const fnLogInfoSpy = this.spy(Log, "info");
			const oChartWrapper = Microchart.create({
				type: "Line"
			});

			// Assert
			assert.ok(fnLogInfoSpy.calledOnce, "Log.info called when neither lines nor points configured.");
			assert.ok(
				fnLogInfoSpy.getCall(0).args[0].indexOf("lines or points") !== -1,
				"Log.info message mentions 'lines or points'."
			);

			// Clean up
			oChartWrapper.destroy();
			fnLogInfoSpy.restore();
		});
	});

	QUnit.test("Column chart with no columns property logs info", async function (assert) {
		await testWithMicrochart(assert, () => {
			// Arrange
			const fnLogInfoSpy = this.spy(Log, "info");
			const oChartWrapper = Microchart.create({
				type: "Column"
			});

			// Assert
			assert.ok(fnLogInfoSpy.calledOnce, "Log.info called when columns is not configured.");
			assert.ok(
				fnLogInfoSpy.getCall(0).args[0].indexOf("Columns") !== -1,
				"Log.info message mentions 'Columns'."
			);

			// Clean up
			oChartWrapper.destroy();
			fnLogInfoSpy.restore();
		});
	});

	QUnit.module("Header usage");

	QUnit.test("bIsForHeader true adds sapUiIntMicrochartInHeader style class", async function (assert) {
		await testWithMicrochart(assert, () => {
			// Arrange
			const oChartWrapper = Microchart.create({
				type: "StackedBar",
				bars: [{ value: 10 }]
			}, true);

			// Assert
			assert.ok(oChartWrapper.hasStyleClass("sapUiIntMicrochartInHeader"), "Style class added for header usage.");

			// Clean up
			oChartWrapper.destroy();
		});
	});

	QUnit.test("bIsForHeader false or omitted does not add header style class", async function (assert) {
		await testWithMicrochart(assert, () => {
			// Arrange
			const oChartWrapperFalse = Microchart.create({
				type: "StackedBar",
				bars: [{ value: 10 }]
			}, false);
			const oChartWrapperOmitted = Microchart.create({
				type: "StackedBar",
				bars: [{ value: 10 }]
			});

			// Assert
			assert.notOk(oChartWrapperFalse.hasStyleClass("sapUiIntMicrochartInHeader"), "Style class absent when bIsForHeader is false.");
			assert.notOk(oChartWrapperOmitted.hasStyleClass("sapUiIntMicrochartInHeader"), "Style class absent when bIsForHeader is omitted.");

			// Clean up
			oChartWrapperFalse.destroy();
			oChartWrapperOmitted.destroy();
		});
	});

	QUnit.module("Property mapping");

	QUnit.test("Bullet showTargetValue is true when target is set", async function (assert) {
		await testWithMicrochart(assert, () => {
			// Arrange
			const oChartWrapper = Microchart.create({
				type: "Bullet",
				value: 50,
				target: 80
			});

			// Assert
			assert.strictEqual(oChartWrapper.getChart().getShowTargetValue(), true, "showTargetValue is true when target is set.");

			// Clean up
			oChartWrapper.destroy();
		});
	});

	QUnit.test("Bullet showTargetValue is false when target is omitted", async function (assert) {
		await testWithMicrochart(assert, () => {
			// Arrange
			const oChartWrapper = Microchart.create({
				type: "Bullet",
				value: 50
			});

			// Assert
			assert.strictEqual(oChartWrapper.getChart().getShowTargetValue(), false, "showTargetValue is false when target is omitted.");

			// Clean up
			oChartWrapper.destroy();
		});
	});

	QUnit.test("HarveyBall showTotal true is passed through to the chart", async function (assert) {
		await testWithMicrochart(assert, () => {
			// Arrange
			const oChartWrapper = Microchart.create({
				type: "HarveyBall",
				total: 100,
				showTotal: true
			});

			// Assert
			assert.strictEqual(oChartWrapper.getChart().getShowTotal(), true, "showTotal is true on the chart.");

			// Clean up
			oChartWrapper.destroy();
		});
	});

	QUnit.test("HarveyBall showTotal false is passed through to the chart", async function (assert) {
		await testWithMicrochart(assert, () => {
			// Arrange
			const oChartWrapper = Microchart.create({
				type: "HarveyBall",
				total: 100,
				showTotal: false
			});

			// Assert
			assert.strictEqual(oChartWrapper.getChart().getShowTotal(), false, "showTotal is false on the chart.");

			// Clean up
			oChartWrapper.destroy();
		});
	});

	QUnit.test("visible false is passed through to the wrapper", async function (assert) {
		await testWithMicrochart(assert, () => {
			// Arrange
			const oChartWrapper = Microchart.create({
				type: "StackedBar",
				bars: [{ value: 10 }],
				visible: false
			});

			// Assert
			assert.strictEqual(oChartWrapper.getVisible(), false, "Wrapper visible is false.");

			// Clean up
			oChartWrapper.destroy();
		});
	});

	QUnit.test("Line threshold and showThresholdLine are passed through to the chart", async function (assert) {
		await testWithMicrochart(assert, () => {
			// Arrange
			const oChartWrapper = Microchart.create({
				type: "Line",
				threshold: 42,
				showThresholdLine: true,
				points: [{ x: 0, y: 0 }, { x: 1, y: 10 }]
			});

			// Assert
			assert.strictEqual(oChartWrapper.getChart().getThreshold(), 42, "threshold is passed to the chart.");
			assert.strictEqual(oChartWrapper.getChart().getShowThresholdLine(), true, "showThresholdLine is passed to the chart.");

			// Clean up
			oChartWrapper.destroy();
		});
	});
});
