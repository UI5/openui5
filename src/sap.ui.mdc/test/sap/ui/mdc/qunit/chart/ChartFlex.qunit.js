/* global QUnit */
sap.ui.define([
	"test-resources/sap/ui/mdc/qunit/util/createAppEnvironment",
	"sap/ui/mdc/flexibility/Chart.flexibility",
	"sap/ui/fl/write/api/ChangesWriteAPI",
	"sap/ui/fl/changeHandler/common/ChangeCategories",
	"sap/ui/fl/changeHandler/condenser/Classification",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"test-resources/sap/ui/fl/api/FlexTestAPI",
	"sap/ui/qunit/utils/nextUIUpdate"
], function (createAppEnvironment, ChartFlexibility, ChangesWriteAPI, ChangeCategories, CondenserClassification, JsControlTreeModifier, FlexTestAPI, nextUIUpdate) {
	'use strict';

	function clearChanges() {
		FlexTestAPI.reset();
	}

	function createRemoveChangeDefinition() {
		return {
			"changeType": "removeItem",
			"selector": {
				"id": "myChartView---view--IDChart"
			},
			"content": {
				"name": "agSalesAmount"
			}
		};
	}

	function createAddChangeDefinition(sProperty) {
		return {
			"changeType": "addItem",
			"selector": {
				"id": "myChartView---view--IDChart"
			},
			"content": {
				"name": sProperty,
				"index": "0",
				"role": "category"
			}
		};
	}

	function createAddChangeDefinitionWithRole(sProperty, sRole, iIndex) {
		return {
			"changeType": "addItem",
			"selector": {
				"id": "myChartView---view--IDChart"
			},
			"content": {
				"name": sProperty,
				"index": iIndex || 0,
				"role": sRole
			}
		};
	}

	function createRemoveChangeDefinitionForProperty(sProperty) {
		return {
			"changeType": "removeItem",
			"selector": {
				"id": "myChartView---view--IDChart"
			},
			"content": {
				"name": sProperty
			}
		};
	}

	QUnit.module("Change handler for visibility of items", {
		beforeEach: function () {
			const sChartView = '<mvc:View' +
				'\t\t  xmlns:mvc="sap.ui.core.mvc"\n' +
				'\t\t  xmlns:chart="sap.ui.mdc.chart"\n' +
				'\t\t  xmlns:mdc="sap.ui.mdc"\n' +
				'\t\t  xmlns="sap.m">\n' +
				'\t\t\t\t<mdc:Chart id="IDChart" p13nMode="{=[\'Sort\',\'Item\']}" delegate="{ \'name\': \'test-resources/sap/ui/mdc/qunit/chart/Helper\' }">\n' +
				'\t\t\t\t\t\t<mdc:items><chart:Item id="item0" propertyKey="Name" type="groupable" label="Name" role="category"></chart:Item>\n' +
				'\t\t\t\t\t\t<chart:Item id="item1" propertyKey="agSalesAmount" type="groupable" label="Depth" role="axis1"></chart:Item>\n' +
				'\t\t\t\t\t\t<chart:Item id="item2" propertyKey="SalesNumber" type="aggregatable" label="Width" role="axis2"></chart:Item></mdc:items>\n' +
				'\t\t\t\t</mdc:Chart>\n' +
				'</mvc:View>';
			return createAppEnvironment(sChartView, "Chart")
			.then(async function(mCreatedView){
				this.oView = mCreatedView.view;
				this.oUiComponent = mCreatedView.comp;
				this.oUiComponentContainer = mCreatedView.container;

				this.oChart = this.oView.byId('IDChart');
				this.oItem1 = this.oView.byId('item1');
				this.oUiComponentContainer.placeAt("qunit-fixture");
				await nextUIUpdate();
			}.bind(this));
		},
		afterEach: function () {
			this.oUiComponentContainer.destroy();
			this.oUiComponent.destroy();
			this.oView.destroy();
			this.oChart.destroy();
			clearChanges();
		}
	});

	QUnit.test('RemoveItem - applyChange & revertChange on a js control tree', function(assert) {
		const done = assert.async();
		const oContent = createRemoveChangeDefinition();
		oContent.index = 0;
		return ChangesWriteAPI.create({
			changeSpecificData: oContent,
			selector: this.oChart
		}).then(function(oChange) {
			const oChangeHandler = ChartFlexibility["removeItem"].changeHandler;
			assert.strictEqual(oChange.getContent().hasOwnProperty("index"), false, "remove changes do not require the index");
			assert.strictEqual(this.oChart.getItems().length, 3, "all items existing before the remove change appliance");

			// Test apply
			oChangeHandler.applyChange(oChange, this.oChart, {
				modifier: JsControlTreeModifier,
				appComponent: this.oUiComponent,
				view: this.oView
			}).then(function() {
				assert.strictEqual(this.oChart.getItems().length, 2, "item has been removed after change appliance");

				// Test revert
				oChangeHandler.revertChange(oChange, this.oChart, {
					modifier: JsControlTreeModifier,
					appComponent: this.oUiComponent,
					view: this.oView
				}).then(function() {
					assert.strictEqual(this.oChart.getItems().length, 3, "item has been added again after the change has been reverted");
					done();
				}.bind(this));
			}.bind(this));
		}.bind(this));
	});

	QUnit.test('AddItem - applyChange & revertChange on a js control tree', function(assert) {
		const done = assert.async();
		const sPropertyName = "SomePropertyName";
		return ChangesWriteAPI.create({
			changeSpecificData: createAddChangeDefinition(sPropertyName),
			selector: this.oChart
		}).then(function(oChange) {
			const oChangeHandler = ChartFlexibility["addItem"].changeHandler;
			assert.strictEqual(this.oChart.getItems().length, 3);
			// Test apply
			oChangeHandler.applyChange(oChange, this.oChart, {
				modifier: JsControlTreeModifier,
				appComponent: this.oUiComponent,
				view: this.oView
			}).then(function() {
				assert.strictEqual(this.oChart.getItems()[0].getId(), "myChartView--IDChart--GroupableItem--" + sPropertyName, "item has been added successfully");
				assert.strictEqual(this.oChart.getItems().length, 4);

				// Test revert
				oChangeHandler.revertChange(oChange, this.oChart, {
					modifier: JsControlTreeModifier,
					appComponent: this.oUiComponent,
					view: this.oView
				}).then(function() {
					assert.strictEqual(this.oChart.getItems().length, 3);
					done();
				}.bind(this));
			}.bind(this));
		}.bind(this));
	});

	QUnit.module("Simulate RTA UI Visualisation", {
		beforeEach: function () {
			const sChartView = '<mvc:View' +
				'\t\t  xmlns:mvc="sap.ui.core.mvc"\n' +
				'\t\t  xmlns:chart="sap.ui.mdc.chart"\n' +
				'\t\t  xmlns:mdc="sap.ui.mdc"\n' +
				'\t\t  xmlns="sap.m">\n' +
				'\t\t\t\t<mdc:Chart id="IDChart" p13nMode="{=[\'Sort\',\'Item\']}" delegate="{ \'name\': \'test-resources/sap/ui/mdc/qunit/chart/Helper\' }">\n' +
				'\t\t\t\t\t\t<mdc:items><chart:Item id="item0" propertyKey="Name" type="groupable" label="Name" role="category"></chart:Item>\n' +
				'\t\t\t\t\t\t<chart:Item id="item1" propertyKey="agSalesAmount" type="groupable" label="Depth" role="axis1"></chart:Item>\n' +
				'\t\t\t\t\t\t<chart:Item id="item2" propertyKey="SalesNumber" type="aggregatable" label="Width" role="axis2"></chart:Item></mdc:items>\n' +
				'\t\t\t\t</mdc:Chart>\n' +
				'</mvc:View>';
			return createAppEnvironment(sChartView, "Chart")
			.then(async function(mCreatedView){
				this.oView = mCreatedView.view;
				this.oUiComponent = mCreatedView.comp;
				this.oUiComponentContainer = mCreatedView.container;

				this.oChart = this.oView.byId('IDChart');
				this.oItem1 = this.oView.byId('item1');
				this.oUiComponentContainer.placeAt("qunit-fixture");
				await nextUIUpdate();
			}.bind(this));
		},
		afterEach: function () {
			this.oUiComponentContainer.destroy();
			this.oUiComponent.destroy();
			this.oView.destroy();
			this.oChart.destroy();
			clearChanges();
		}
	});

	QUnit.test('remove item change with change handler getChangeVisualizationInfo', function(assert) {
		const done = assert.async();
		const oContent = createRemoveChangeDefinition();
		oContent.index = 0;
		return ChangesWriteAPI.create({
			changeSpecificData: oContent,
			selector: this.oChart
		}).then(function(oChange) {
			const oChangeHandler = ChartFlexibility["removeItem"].changeHandler;

			// Test apply
			oChangeHandler.applyChange(oChange, this.oChart, {
				modifier: JsControlTreeModifier,
				appComponent: this.oUiComponent,
				view: this.oView
			}).then(function() {
				const oAppComponent = {
					byId: function(s) { return this.oChart; }.bind(this)
				};

				oChangeHandler.getChangeVisualizationInfo(oChange, oAppComponent).then(function(mMsg) {
					assert.ok(mMsg.descriptionPayload);
					assert.equal(mMsg.descriptionPayload.category, ChangeCategories.REMOVE);
					assert.equal(mMsg.descriptionPayload.description, "Item \"agSalesAmount\" removed");

					done();
				});

			}.bind(this));
		}.bind(this));
	});

	QUnit.test('add item change with change handler getChangeVisualizationInfo', function(assert) {
		const done = assert.async();
		const sPropertyName = "SomePropertyName";
		return ChangesWriteAPI.create({
			changeSpecificData: createAddChangeDefinition(sPropertyName),
			selector: this.oChart
		}).then(function(oChange) {
			const oChangeHandler = ChartFlexibility["addItem"].changeHandler;
			assert.strictEqual(this.oChart.getItems().length, 3);
			// Test apply
			oChangeHandler.applyChange(oChange, this.oChart, {
				modifier: JsControlTreeModifier,
				appComponent: this.oUiComponent,
				view: this.oView
			}).then(function() {
				const oAppComponent = {
					byId: function(s) { return this.oChart; }.bind(this)
				};

				oChangeHandler.getChangeVisualizationInfo(oChange, oAppComponent).then(function(mMsg) {
					assert.ok(mMsg.descriptionPayload);
					assert.equal(mMsg.descriptionPayload.category, ChangeCategories.ADD);
					assert.equal(mMsg.descriptionPayload.description, "Dimension item \"SomeProperty\" with layout option \"Category\" added at position \"0\"");

					done();
				});
			}.bind(this));
		}.bind(this));
	});

	QUnit.module("Condenser behavior with role changes (DINC0709459)", {
		beforeEach: function () {
			const sChartView = '<mvc:View' +
				'\t\t  xmlns:mvc="sap.ui.core.mvc"\n' +
				'\t\t  xmlns:chart="sap.ui.mdc.chart"\n' +
				'\t\t  xmlns:mdc="sap.ui.mdc"\n' +
				'\t\t  xmlns="sap.m">\n' +
				'\t\t\t\t<mdc:Chart id="IDChart" p13nMode="{=[\'Sort\',\'Item\']}" delegate="{ \'name\': \'test-resources/sap/ui/mdc/qunit/chart/Helper\' }">\n' +
				'\t\t\t\t\t\t<mdc:items><chart:Item id="item0" propertyKey="Name" type="groupable" label="Name" role="category"></chart:Item>\n' +
				'\t\t\t\t\t\t<chart:Item id="item1" propertyKey="agSalesAmount" type="groupable" label="Depth" role="axis1"></chart:Item>\n' +
				'\t\t\t\t\t\t<chart:Item id="item2" propertyKey="SalesNumber" type="aggregatable" label="Width" role="axis2"></chart:Item></mdc:items>\n' +
				'\t\t\t\t</mdc:Chart>\n' +
				'</mvc:View>';
			return createAppEnvironment(sChartView, "Chart")
			.then(async function(mCreatedView){
				this.oView = mCreatedView.view;
				this.oUiComponent = mCreatedView.comp;
				this.oUiComponentContainer = mCreatedView.container;

				this.oChart = this.oView.byId('IDChart');
				this.oUiComponentContainer.placeAt("qunit-fixture");
				await nextUIUpdate();
			}.bind(this));
		},
		afterEach: function () {
			this.oUiComponentContainer.destroy();
			this.oUiComponent.destroy();
			this.oView.destroy();
			this.oChart.destroy();
			clearChanges();
		}
	});

	QUnit.test('getCondenserInfo returns different affectedControl IDs for different roles', function(assert) {
		const done = assert.async();
		const oChangeHandler = ChartFlexibility["addItem"].changeHandler;

		// Create addItem change with role="series" using existing property "SomePropertyName" (groupable)
		return ChangesWriteAPI.create({
			changeSpecificData: createAddChangeDefinitionWithRole("SomePropertyName", "series", 0),
			selector: this.oChart
		}).then(function(oChangeWithSeries) {

			// Apply the change to populate revert data
			return oChangeHandler.applyChange(oChangeWithSeries, this.oChart, {
				modifier: JsControlTreeModifier,
				appComponent: this.oUiComponent,
				view: this.oView
			}).then(function() {

				// Get condenser info for series role
				return oChangeHandler.getCondenserInfo(oChangeWithSeries, {
					modifier: JsControlTreeModifier,
					appComponent: this.oUiComponent,
					view: this.oView
				}).then(function(oCondenserInfoSeries) {

					// Assert: Series role produces affectedControl ID with "-series" suffix
					assert.ok(oCondenserInfoSeries.affectedControl.id.includes("-series"),
						"Series role affectedControl ID includes '-series': " + oCondenserInfoSeries.affectedControl.id);
					assert.strictEqual(oCondenserInfoSeries.affectedControl.id, "SomePropertyName-series",
						"affectedControl ID is 'SomePropertyName-series'");

					done();
				});
			}.bind(this));
		}.bind(this));
	});

	QUnit.test('getCondenserInfo returns affectedControl ID with category suffix for category role', function(assert) {
		const done = assert.async();
		const oChangeHandler = ChartFlexibility["addItem"].changeHandler;

		// Create addItem change with role="category" using existing property "SomePropertyName" (groupable)
		return ChangesWriteAPI.create({
			changeSpecificData: createAddChangeDefinitionWithRole("SomePropertyName", "category", 0),
			selector: this.oChart
		}).then(function(oChange) {

			return oChangeHandler.applyChange(oChange, this.oChart, {
				modifier: JsControlTreeModifier,
				appComponent: this.oUiComponent,
				view: this.oView
			}).then(function() {

				return oChangeHandler.getCondenserInfo(oChange, {
					modifier: JsControlTreeModifier,
					appComponent: this.oUiComponent,
					view: this.oView
				}).then(function(oCondenserInfo) {

					// Assert: Category role produces affectedControl ID with "-category" suffix
					assert.ok(oCondenserInfo.affectedControl.id.includes("-category"),
						"Category role affectedControl ID includes '-category'");
					assert.strictEqual(oCondenserInfo.affectedControl.id, "SomePropertyName-category",
						"affectedControl ID is 'SomePropertyName-category'");

					done();
				});
			}.bind(this));
		}.bind(this));
	});

	QUnit.test('Role change: removeItem and addItem with different roles have different affectedControl IDs', function(assert) {
		// This is the critical test case that reproduces the bug:
		// When changing a chart item's role (e.g., from category to series):
		// 1. removeItem is created with the old item (which had role="category")
		// 2. addItem is created with the new role (role="series")
		// Without the fix, both have the same affectedControl ID (just the item name)
		// and the condenser incorrectly treats them as canceling each other out.

		const done = assert.async();
		const sPropertyName = "Name"; // Using an existing property that's already in the chart as category

		// First, remove an existing item (simulating remove of category item)
		return ChangesWriteAPI.create({
			changeSpecificData: createRemoveChangeDefinitionForProperty(sPropertyName),
			selector: this.oChart
		}).then(function(oRemoveChange) {

			const oRemoveChangeHandler = ChartFlexibility["removeItem"].changeHandler;

			return oRemoveChangeHandler.applyChange(oRemoveChange, this.oChart, {
				modifier: JsControlTreeModifier,
				appComponent: this.oUiComponent,
				view: this.oView
			}).then(function() {

				// Get condenser info for the remove change
				return oRemoveChangeHandler.getCondenserInfo(oRemoveChange, {
					modifier: JsControlTreeModifier,
					appComponent: this.oUiComponent,
					view: this.oView
				}).then(function(oRemoveCondenserInfo) {

					// Now create an addItem change with a DIFFERENT role (series instead of category)
					return ChangesWriteAPI.create({
						changeSpecificData: createAddChangeDefinitionWithRole(sPropertyName, "series", 0),
						selector: this.oChart
					}).then(function(oAddChange) {

						const oAddChangeHandler = ChartFlexibility["addItem"].changeHandler;

						return oAddChangeHandler.applyChange(oAddChange, this.oChart, {
							modifier: JsControlTreeModifier,
							appComponent: this.oUiComponent,
							view: this.oView
						}).then(function() {

							return oAddChangeHandler.getCondenserInfo(oAddChange, {
								modifier: JsControlTreeModifier,
								appComponent: this.oUiComponent,
								view: this.oView
							}).then(function(oAddCondenserInfo) {

								// The critical assertion: remove (category) and add (series) must have DIFFERENT affectedControl IDs
								// so the condenser doesn't incorrectly treat them as nullifying changes
								assert.notEqual(
									oRemoveCondenserInfo.affectedControl.id,
									oAddCondenserInfo.affectedControl.id,
									"Remove (category) and Add (series) changes have different affectedControl IDs - " +
									"Remove: " + oRemoveCondenserInfo.affectedControl.id + ", Add: " + oAddCondenserInfo.affectedControl.id
								);

								// Verify classifications are correct
								assert.strictEqual(oRemoveCondenserInfo.classification, CondenserClassification.Destroy,
									"Remove change has Destroy classification");
								assert.strictEqual(oAddCondenserInfo.classification, CondenserClassification.Create,
									"Add change has Create classification");

								done();
							});
						}.bind(this));
					}.bind(this));
				}.bind(this));
			}.bind(this));
		}.bind(this));
	});
});
