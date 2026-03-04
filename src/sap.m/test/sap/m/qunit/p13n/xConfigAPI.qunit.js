/* global QUnit, sinon*/
sap.ui.define([
	"sap/ui/core/Control",
	"sap/m/p13n/modules/xConfigAPI",
	"sap/ui/core/Item",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/core/CustomData"
], function (MDCControl, xConfigAPI, Item, JsControlTreeModifier, CustomData) {
	"use strict";

	QUnit.module("API Tests", {
		beforeEach: function() {

			var TestClass = MDCControl.extend("testClass", {
				metadata: {
					aggregations: {
						items: {
							type: "sap.ui.core.Item"
						}
					}
				},

				// no rendering required for the scenarios in this module
				renderer: null
			});

			this.oControl = new TestClass();
		},
		afterEach: function() {
			this.oControl.destroy();
		}
	});


	QUnit.test("Check #enhanceConfig", function(assert){

		var oModificationPayload = {
			key: "test_property",
			property: "key",
			operation: "add",
			controlMeta: {
				aggregation: "items"
			},
			value: {//TODO
				value: "my_unique_test_key"
			}
		};

		return xConfigAPI.enhanceConfig(this.oControl, oModificationPayload)
		.then(function(){

			var oCustomData = this.oControl.getCustomData()[0];

			assert.equal(oCustomData.getKey(), "xConfig", "The xConfig instance has been created");

			assert.deepEqual(JSON.parse(oCustomData.getValue().replace(/\\/g, '')), {
				"aggregations": {
					"items": {
						"test_property": {
							"key": "my_unique_test_key"
						}
					}
				}
			}, "The correct value has been created");
		}.bind(this));
	});

	[{isA: undefined, called: false}, {isA: () => {}, called: true}].forEach(function(oTestCase) {
		QUnit.test("Check #enhanceConfig destroying controls", function(assert){
			// arrange
			const oModificationPayload = {
				key: "test_property",
				property: "key",
				operation: "add",
				controlMeta: {
					aggregation: "items"
				},
				value: {
					value: "my_unique_test_key"
				}
			};

			const oCustomDataValue = {
					"aggregations": {
						"items": {
							"test_property": {
								"key": "my_unique_test_key",
								"persistenceIdentifier": "custom-identifier"
							}
						}
					}
				};
			const oCustomData = new CustomData({
				key: "xConfig",
				value: JSON.stringify(oCustomDataValue)
			});
			oCustomData.setProperty("value", JSON.stringify(oCustomDataValue));

			const oDestroySpy = sinon.spy(JsControlTreeModifier, "destroy");
			this.oControl.addCustomData(oCustomData);
			this.oControl.isA = oTestCase.isA;

			// act
			return xConfigAPI.enhanceConfig(this.oControl, oModificationPayload)
			.then(function(){
				// assert
				if (oTestCase.called) {
					assert.ok(oDestroySpy.called, "Destroy spy has been called");
				} else {
					assert.ok(oDestroySpy.notCalled, "Destroy spy has not been called");
				}
				oDestroySpy.restore();
			});
		});
	});

	QUnit.test("Check #enhanceConfig with 'persistenceIdentifier'", function(assert){

		var oModificationPayload = {
			key: "test_property",
			property: "key",
			operation: "add",
			controlMeta: {
				aggregation: "items"
			},
			value: {//TODO
				value: "my_unique_test_key",
				persistenceIdentifier: "custom-identifier"
			}
		};

		return xConfigAPI.enhanceConfig(this.oControl, oModificationPayload)
		.then(function(){

			var oCustomData = this.oControl.getCustomData()[0];

			assert.equal(oCustomData.getKey(), "xConfig", "The xConfig instance has been created");

			assert.deepEqual(JSON.parse(oCustomData.getValue().replace(/\\/g, '')), {
				"aggregations": {
					"items": {
						"test_property": {
							"key": "my_unique_test_key",
							"persistenceIdentifier": "custom-identifier"
						}
					}
				}
			}, "The correct value has been created");
		}.bind(this));
	});

	QUnit.test("Check #enhanceConfig for move changes", function(assert){

		var oModificationPayload = {
			key: "test_property",
			property: "position",
			operation: "add",
			controlMeta: {
				aggregation: "items"
			},
			value: {
				index: 0,
				value: true,
				targetAggregation: "items"
			}
		};

		return xConfigAPI.enhanceConfig(this.oControl, oModificationPayload)
		.then(() => {

			var oCustomData = this.oControl.getCustomData()[0];

			assert.equal(oCustomData.getKey(), "xConfig", "The xConfig instance has been created");

			assert.deepEqual(JSON.parse(oCustomData.getValue().replace(/\\/g, '')), {
				"aggregations": {
					"items": {
						"test_property": {
							"position": 0
						}
					}
				}
			}, "The correct value has been created");

			var oSecondMoveConfig = {
				key: "test_property_2",
				property: "position",
				operation: "move",
				controlMeta: {
					aggregation: "items"
				},
				currentState: [{key: "test_property"}, {key: "test_property_2"}],
				value: {
					index: 0,
					targetAggregation: "items"
				}
			};

			return xConfigAPI.enhanceConfig(this.oControl, oSecondMoveConfig);
		})
		.then(() => {
			var oCustomData = this.oControl.getCustomData()[0];

			assert.deepEqual(JSON.parse(oCustomData.getValue().replace(/\\/g, '')), {
				"aggregations": {
					"items": {
						"test_property_2": {
							"position": 0
						},
						"test_property": {
							"position": 1
						}
					}
				}
			}, "The correct value has been created");
		});

	});

	QUnit.test("Check #readConfig", function(assert){

		var oModificationPayload = {
			key: "test_property",
			property: "key",
			operation: "add",
			controlMeta: {
				aggregation: "items"
			},
			value: {//TODO
				value: "my_unique_test_key"
			}
		};

		return xConfigAPI.enhanceConfig(this.oControl, oModificationPayload)
		.then(function(){
			return  xConfigAPI.readConfig(this.oControl);
		}.bind(this))
		.then(function(oXConfig){

			assert.deepEqual(oXConfig, {
				"aggregations": {
					"items": {
						"test_property": {
							"key": "my_unique_test_key"
						}
					}
				}
			}, "The correct value has been created");

			return;

		});

	});

	QUnit.test("Ensure the correct order after inserting the item", function(assert){
		var oModificationPayload = {
			key: "test_property",
			property: "position",
			operation: "add",
			controlMeta: {
				aggregation: "items"
			},
			value: {
				index: 0,
				value: true,
				targetAggregation: "items"
			}
		};

		return xConfigAPI.enhanceConfig(this.oControl, oModificationPayload)
		.then(() => {

			var oCustomData = this.oControl.getCustomData()[0];

			assert.equal(oCustomData.getKey(), "xConfig", "The xConfig instance has been created");

			assert.deepEqual(JSON.parse(oCustomData.getValue().replace(/\\/g, '')), {
				"aggregations": {
					"items": {
						"test_property": {
							"position": 0
						}
					}
				}
			}, "The correct value has been created");

			var oSecondMoveConfig = {
				key: "test_property_2",
				property: "position",
				operation: "add",
				controlMeta: {
					aggregation: "items"
				},
				currentState: [{key: "test_property"}],
				value: {
					index: 0,
					value: true,
					targetAggregation: "items"
				}
			};

			return xConfigAPI.enhanceConfig(this.oControl, oSecondMoveConfig);
		})
		.then(() => {
			var oCustomData = this.oControl.getCustomData()[0];

			assert.deepEqual(JSON.parse(oCustomData.getValue().replace(/\\/g, '')), {
				"aggregations": {
					"items": {
						"test_property_2": {
							"position": 0
						},
						"test_property": {
							"position": 1
						}
					}
				}
			}, "The correct value has been created");
		});
	});

	QUnit.test("Ensure the correct order after removing the item", function(assert){
		var oModificationPayload = {
			key: "test_property",
			property: "position",
			operation: "add",
			controlMeta: {
				aggregation: "items"
			},
			value: {
				index: 0,
				value: true,
				targetAggregation: "items"
			}
		};

		return xConfigAPI.enhanceConfig(this.oControl, oModificationPayload)
		.then(() => {

			var oCustomData = this.oControl.getCustomData()[0];

			assert.equal(oCustomData.getKey(), "xConfig", "The xConfig instance has been created");

			assert.deepEqual(JSON.parse(oCustomData.getValue().replace(/\\/g, '')), {
				"aggregations": {
					"items": {
						"test_property": {
							"position": 0
						}
					}
				}
			}, "The correct value has been created");

			var oSecondAdd = {
				key: "test_property_2",
				property: "position",
				operation: "add",
				controlMeta: {
					aggregation: "items"
				},
				currentState: [{key: "test_property"}],
				value: {
					index: 0,
					value: true,
					targetAggregation: "items"
				}
			};

			return xConfigAPI.enhanceConfig(this.oControl, oSecondAdd);
		})
		.then(() => {
			var oCustomData = this.oControl.getCustomData()[0];

			assert.deepEqual(JSON.parse(oCustomData.getValue().replace(/\\/g, '')), {
				"aggregations": {
					"items": {
						"test_property_2": {
							"position": 0
						},
						"test_property": {
							"position": 1
						}
					}
				}
			}, "The correct value has been created");

			var oRemoveChange = {
				key: "test_property_2",
				property: "visible",
				operation: "remove",
				controlMeta: {
					aggregation: "items"
				},
				currentState: [{key: "test_property_2"}, {key: "test_property"}],
				value: {
					value: false,
					targetAggregation: "items"
				}
			};

			return xConfigAPI.enhanceConfig(this.oControl, oRemoveChange);
		})
		.then(() => {
			var oCustomData = this.oControl.getCustomData()[0];
			assert.deepEqual(JSON.parse(oCustomData.getValue().replace(/\\/g, '')),
			{
			  "aggregations": {
				"items": {
				  "test_property": {
					"position": 0
				  },
				  "test_property_2": {
					"position": 0,
					"visible": false
				  }
				}
			  }
			}, "The correct remove value has been created - removing an item needs to be reflected in the order of existing items");
		});
	});

	QUnit.test("Check #getCurrentItemState (empty)", function(assert){

		return xConfigAPI.getCurrentItemState(this.oControl, {propertyBag: {modifier: JsControlTreeModifier}, changeType: "moveItem"}, null, "items")
		.then(function(aCurrentState){
			assert.deepEqual(aCurrentState, [], "The correct value has been created (no item present yet)");
		});
	});

	QUnit.test("Check #getCurrentItemState (with inital control state in xConfig)", function(assert){

		const oModificationPayload = {
			key: "test_property",
			property: "key",
			operation: "add",
			controlMeta: {
				aggregation: "items"
			},
			value: {
				value: "my_unique_test_key"
			}
		};

		return xConfigAPI.enhanceConfig(this.oControl, oModificationPayload)
		.then(function(oConfig){
			return xConfigAPI.getCurrentItemState(this.oControl, {propertyBag: {modifier: JsControlTreeModifier}, changeType: "addItem"}, oConfig, "items");
		}.bind(this))
		.then(function(aCurrentState){
			assert.deepEqual(aCurrentState, [{key: "test_property"}], "The correct value has been created");
		});
	});

	QUnit.test("Check #getCurrentItemState (with inital control state in targetAggregation)", function(assert){

		const oItem = new Item({id: "test_property"});

		this.oControl.addItem(oItem);

		sinon.stub(JsControlTreeModifier, "getProperty").returns(Promise.resolve(true)); //fake visible property, since "Item" does not have one..

		return xConfigAPI.getCurrentItemState(this.oControl, {propertyBag: {modifier: JsControlTreeModifier}, changeType: "removeItem"}, null, "items")
		.then(function(aCurrentState){
			assert.deepEqual(aCurrentState, [{key: "test_property"}], "The correct value has been created");
			JsControlTreeModifier.getProperty.restore();
		});
	});

	QUnit.test("Check #getCurrentItemState (with inital control state in targetAggregation)", function(assert){

		const oItem = new Item({id: "test_property"});

		this.oControl.addItem(oItem);

		sinon.stub(JsControlTreeModifier, "getProperty").returns(Promise.resolve(true)); //fake visible property, since "Item" does not have one..

		return xConfigAPI.getCurrentItemState(this.oControl, {propertyBag: {modifier: JsControlTreeModifier}, changeType: "removeItem"}, {
			"aggregations": {
				"items": {
				}
			}
		}, "items")
		.then(function(aCurrentState){
			assert.deepEqual(aCurrentState, [{key: "test_property"}], "The correct value has been created");
			JsControlTreeModifier.getProperty.restore();
		});
	});

	QUnit.test("Check #getCurrentSortState (empty)", function(assert){

		return xConfigAPI.getCurrentSortState(this.oControl, {propertyBag: {modifier: JsControlTreeModifier}, changeType: "moveSort"}, null, "sortConditions")
		.then(function(aCurrentState){
			assert.deepEqual(aCurrentState, [], "The correct value has been created (no item present yet)");
		});
	});

	QUnit.test("Check #getCurrentSortState (with inital control state in xConfig)", function(assert){

		const oModificationPayload = {
			key: "test_property",
			property: "sortConditions",
			operation: "add",
			controlMeta: {
				property: "sortConditions"
			},
			value: {
				descending: true,
				index: 2,
				key: "test_property"
			}
		};


		return xConfigAPI.enhanceConfig(this.oControl, oModificationPayload)
		.then(function(oConfig){
			return xConfigAPI.getCurrentSortState(this.oControl, {propertyBag: {modifier: JsControlTreeModifier}, changeType: "addSort"}, oConfig, "sortConditions");
		}.bind(this))
		.then(function(aCurrentState){
			assert.deepEqual(aCurrentState, [{key: "test_property"}], "The correct value has been created");
		});
	});

	// DINC0728376: Test that sort conditions can be removed even when payload index differs from stored index
	// This test verifies that sort removal works correctly - it should pass with key-only comparison
	// but would fail if we used deepEqual (because index differs)
	QUnit.test("Check that sort condition is removed correctly when payload index differs from stored index (DINC0728376)", function(assert) {
		// Step 1: Add a sort condition at index 0
		const oAddPayload = {
			key: "sort_field_1",
			property: "sortConditions",
			operation: "add",
			value: {
				key: "sort_field_1",
				descending: false,
				index: 0
			}
		};

		return xConfigAPI.enhanceConfig(this.oControl, oAddPayload)
		.then(() => {
			const oCustomData = this.oControl.getCustomData()[0];
			const oConfig = JSON.parse(oCustomData.getValue().replace(/\\/g, ''));

			assert.deepEqual(oConfig, {
				"properties": {
					"sortConditions": [
						{
							"key": "sort_field_1",
							"descending": false,
							"index": 0
						}
					]
				}
			}, "Sort condition was added correctly");

			// Step 2: Remove the sort condition with a DIFFERENT index in payload
			// This simulates what happens during revert - the payload index is the "restore to" position,
			// not the current position in the array
			const oRemovePayload = {
				key: "sort_field_1",
				property: "sortConditions",
				operation: "remove",
				value: {
					key: "sort_field_1",
					descending: false,
					index: 5  // Different index than stored (0) - this is the revert scenario
				}
			};

			return xConfigAPI.enhanceConfig(this.oControl, oRemovePayload);
		})
		.then(() => {
			const oCustomData = this.oControl.getCustomData()[0];
			const oConfig = JSON.parse(oCustomData.getValue().replace(/\\/g, ''));

			// The sort condition should be removed, leaving an empty array
			assert.deepEqual(oConfig, {
				"properties": {
					"sortConditions": []
				}
			}, "Sort condition was removed correctly even though payload index differed from stored index");
		});
	});

	// DINC0728376: Test that the correct filter condition is removed when multiple exist for same key
	QUnit.test("Check that correct filter condition is removed when multiple conditions exist for same key (DINC0490163)", function(assert) {
		// Step 1: Add first filter condition
		const oAddPayload1 = {
			key: "filter_field",
			property: "filterConditions",
			operation: "add",
			value: {
				key: "filter_field",
				condition: {
					operator: "EQ",
					values: ["Maria"]
				}
			}
		};

		return xConfigAPI.enhanceConfig(this.oControl, oAddPayload1)
		.then(() => {
			// Step 2: Add second filter condition for same key
			const oAddPayload2 = {
				key: "filter_field",
				property: "filterConditions",
				operation: "add",
				value: {
					key: "filter_field",
					condition: {
						operator: "EQ",
						values: ["John"]
					}
				}
			};
			return xConfigAPI.enhanceConfig(this.oControl, oAddPayload2);
		})
		.then(() => {
			const oCustomData = this.oControl.getCustomData()[0];
			const oConfig = JSON.parse(oCustomData.getValue().replace(/\\/g, ''));

			assert.equal(oConfig.properties.filterConditions.length, 2, "Two filter conditions exist");

			// Step 3: Remove the "Maria" condition specifically
			const oRemovePayload = {
				key: "filter_field",
				property: "filterConditions",
				operation: "remove",
				value: {
					key: "filter_field",
					condition: {
						operator: "EQ",
						values: ["Maria"]
					}
				}
			};

			return xConfigAPI.enhanceConfig(this.oControl, oRemovePayload);
		})
		.then(() => {
			const oCustomData = this.oControl.getCustomData()[0];
			const oConfig = JSON.parse(oCustomData.getValue().replace(/\\/g, ''));

			// Only "John" should remain
			assert.equal(oConfig.properties.filterConditions.length, 1, "One filter condition remains");
			assert.deepEqual(oConfig.properties.filterConditions[0].condition, {
				operator: "EQ",
				values: ["John"]
			}, "The correct filter condition (John) remains - Maria was removed");
		});
	});

});