/*!
 * ${copyright}
 */

/* global QUnit, sinon */

sap.ui.define([
	"sap/ui/mdc/p13n/subcontroller/DynamicPropertiesController"
], function(
	DynamicPropertiesController
) {
	"use strict";

	/**
	 * Creates a minimal mock of the adaptation control needed for DynamicPropertiesController.
	 */
	function createMockControl(mXConfig, mProperties, bPropertyInfoFinal) {
		return {
			getEngine: function() {
				return {
					readXConfig: sinon.stub().returns(mXConfig || undefined)
				};
			},
			getPropertyHelper: function() {
				return {
					getProperty: function(sKey) {
						if (mProperties && sKey in mProperties) {
							return mProperties[sKey];
						}
						return mProperties ? undefined : {isActive: false};
					}
				};
			},
			isPropertyHelperFinal: function() {
				return !!bPropertyInfoFinal;
			},
			isInPropertyKeysMode: function() {
				return true;
			}
		};
	}

	QUnit.module("Constructor validation", {
		afterEach: function() {
			if (this.oController) {
				this.oController.destroy();
			}
		}
	});

	QUnit.test("Throws when allowedPropertyAttributes is missing", function(assert) {
		assert.throws(function() {
			new DynamicPropertiesController({
				control: createMockControl(),
				targetAggregation: "columns"
			});
		}, /allowedPropertyAttributes/, "Error thrown for missing allowedPropertyAttributes");
	});

	QUnit.test("Throws when allowedPropertyAttributes is empty array", function(assert) {
		assert.throws(function() {
			new DynamicPropertiesController({
				control: createMockControl(),
				targetAggregation: "columns",
				allowedPropertyAttributes: []
			});
		}, /allowedPropertyAttributes/, "Error thrown for empty allowedPropertyAttributes");
	});

	QUnit.test("Throws when allowedPropertyAttributes is not an array", function(assert) {
		assert.throws(function() {
			new DynamicPropertiesController({
				control: createMockControl(),
				targetAggregation: "columns",
				allowedPropertyAttributes: "isActive"
			});
		}, /allowedPropertyAttributes/, "Error thrown for non-array allowedPropertyAttributes");
	});

	QUnit.test("Successfully creates with valid settings", function(assert) {
		this.oController = new DynamicPropertiesController({
			control: createMockControl(),
			targetAggregation: "columns",
			allowedPropertyAttributes: ["isActive"]
		});
		assert.ok(this.oController, "Controller created successfully");
	});

	QUnit.test("Throws when control does not implement DynamicPropertiesMixin", function(assert) {
		const oControl = createMockControl();
		delete oControl.isInPropertyKeysMode;
		assert.throws(function() {
			new DynamicPropertiesController({
				control: oControl,
				targetAggregation: "columns",
				allowedPropertyAttributes: ["isActive"]
			});
		}, /does not implement DynamicPropertiesMixin/, "Error thrown when control lacks mixin");
	});

	QUnit.module("getStateKey");

	QUnit.test("Returns 'supplementaryConfig'", function(assert) {
		const oController = new DynamicPropertiesController({
			control: createMockControl(),
			targetAggregation: "columns",
			allowedPropertyAttributes: ["isActive"]
		});
		assert.strictEqual(oController.getStateKey(), "supplementaryConfig", "State key is 'supplementaryConfig'");
		oController.destroy();
	});

	QUnit.module("getChangeOperations");

	QUnit.test("Returns change operations for single attribute", function(assert) {
		const oController = new DynamicPropertiesController({
			control: createMockControl(),
			targetAggregation: "columns",
			allowedPropertyAttributes: ["isActive"]
		});
		const mChangeOperations = oController.getChangeOperations();
		assert.deepEqual(mChangeOperations, {
			setPropertyAttribute: "setPropertyAttribute"
		}, "Single unified change operation");
		oController.destroy();
	});

	QUnit.test("Returns change operations for multiple attributes", function(assert) {
		const oController = new DynamicPropertiesController({
			control: createMockControl(),
			targetAggregation: "columns",
			allowedPropertyAttributes: ["isActive", "label", "tooltip"]
		});
		const mChangeOperations = oController.getChangeOperations();
		assert.deepEqual(mChangeOperations, {
			setPropertyAttribute: "setPropertyAttribute"
		}, "Single unified change operation regardless of attribute count");
		oController.destroy();
	});

	QUnit.module("getCurrentState");

	QUnit.test("Returns undefined when no xConfig exists", function(assert) {
		const oController = new DynamicPropertiesController({
			control: createMockControl(undefined),
			targetAggregation: "columns",
			allowedPropertyAttributes: ["isActive"]
		});
		assert.strictEqual(oController.getCurrentState(), undefined, "undefined returned");
		oController.destroy();
	});

	QUnit.test("Returns undefined when xConfig has no propertyInfo aggregation", function(assert) {
		const oController = new DynamicPropertiesController({
			control: createMockControl({aggregations: {columns: {}}}),
			targetAggregation: "columns",
			allowedPropertyAttributes: ["isActive"]
		});
		assert.strictEqual(oController.getCurrentState(), undefined, "undefined returned for missing propertyInfo");
		oController.destroy();
	});

	QUnit.test("Returns state from xConfig when propertyInfo exists", function(assert) {
		const oXConfig = {
			propertyInfo: {
				prop1: {isActive: false},
				prop2: {label: "Custom Label"}
			}
		};
		const oController = new DynamicPropertiesController({
			control: createMockControl(oXConfig),
			targetAggregation: "columns",
			allowedPropertyAttributes: ["isActive", "label"]
		});
		const oState = oController.getCurrentState();
		assert.deepEqual(oState, {
			propertyInfo: {
				prop1: {isActive: false},
				prop2: {label: "Custom Label"}
			}
		}, "State contains propertyInfo from xConfig");
		oController.destroy();
	});

	QUnit.module("formatToInternalState");

	QUnit.test("Returns empty object for undefined input", function(assert) {
		const oController = new DynamicPropertiesController({
			control: createMockControl(),
			targetAggregation: "columns",
			allowedPropertyAttributes: ["isActive"]
		});
		assert.deepEqual(oController.formatToInternalState(undefined), {}, "Empty object for undefined");
		assert.deepEqual(oController.formatToInternalState(null), {}, "Empty object for null");
		assert.deepEqual(oController.formatToInternalState({}), {}, "Empty object for empty object");
		oController.destroy();
	});

	QUnit.test("Returns empty object when no propertyInfo in external state", function(assert) {
		const oController = new DynamicPropertiesController({
			control: createMockControl(),
			targetAggregation: "columns",
			allowedPropertyAttributes: ["isActive"]
		});
		assert.deepEqual(oController.formatToInternalState({}), {},
			"Empty object when propertyInfo missing");
		oController.destroy();
	});

	QUnit.test("Returns internal state from external state", function(assert) {
		const oController = new DynamicPropertiesController({
			control: createMockControl(),
			targetAggregation: "columns",
			allowedPropertyAttributes: ["isActive"]
		});
		const oExternal = {
			propertyInfo: {
				prop1: {isActive: true}
			}
		};
		assert.deepEqual(oController.formatToInternalState(oExternal), oExternal,
			"Internal state mirrors external state");
		oController.destroy();
	});

	QUnit.module("getDelta - absolute mode");

	QUnit.test("Creates changes for new properties", function(assert) {
		const oControl = createMockControl();
		const oController = new DynamicPropertiesController({
			control: oControl,
			targetAggregation: "columns",
			allowedPropertyAttributes: ["isActive"]
		});
		const mDeltaInfo = {
			control: oControl,
			existingState: {},
			changedState: {
				propertyInfo: {
					prop1: {isActive: false}
				}
			},
			changeOperations: oController.getChangeOperations(),
			applyAbsolute: true,
			propertyInfo: []
		};
		const aChanges = oController.getDelta(mDeltaInfo);
		assert.strictEqual(aChanges.length, 1, "One change created");
		assert.strictEqual(aChanges[0].changeSpecificData.changeType, "setPropertyAttribute", "Correct change type");
		assert.strictEqual(aChanges[0].changeSpecificData.content.name, "prop1", "Correct property name");
		assert.strictEqual(aChanges[0].changeSpecificData.content.attribute, "isActive", "Correct attribute");
		assert.strictEqual(aChanges[0].changeSpecificData.content.value, false, "Correct value");
		assert.strictEqual(aChanges[0]["transient"], true, "Change is transient");
		oController.destroy();
	});

	QUnit.test("Creates changes for modified attribute values in absolute mode", function(assert) {
		const oControl = createMockControl();
		const oController = new DynamicPropertiesController({
			control: oControl,
			targetAggregation: "columns",
			allowedPropertyAttributes: ["isActive", "label"]
		});
		const mDeltaInfo = {
			control: oControl,
			existingState: {
				propertyInfo: {
					prop1: {isActive: true, label: "Old Label"}
				}
			},
			changedState: {
				propertyInfo: {
					prop1: {isActive: false, label: "New Label"}
				}
			},
			changeOperations: oController.getChangeOperations(),
			applyAbsolute: true,
			propertyInfo: []
		};
		const aChanges = oController.getDelta(mDeltaInfo);
		assert.strictEqual(aChanges.length, 2, "Two changes created (isActive + label)");
		const oIsActiveChange = aChanges.find((c) => c.changeSpecificData.content.attribute === "isActive");
		const oLabelChange = aChanges.find((c) => c.changeSpecificData.content.attribute === "label");
		assert.strictEqual(oIsActiveChange.changeSpecificData.changeType, "setPropertyAttribute", "isActive change type");
		assert.strictEqual(oIsActiveChange.changeSpecificData.content.value, false, "isActive value changed");
		assert.strictEqual(oLabelChange.changeSpecificData.changeType, "setPropertyAttribute", "label change type");
		assert.strictEqual(oLabelChange.changeSpecificData.content.value, "New Label", "label value changed");
		assert.ok(aChanges.every((oChange) => oChange["transient"] === true), "All changes are transient");
		oController.destroy();
	});

	QUnit.test("Creates null changes for removed properties in absolute mode", function(assert) {
		const oControl = createMockControl();
		const oController = new DynamicPropertiesController({
			control: oControl,
			targetAggregation: "columns",
			allowedPropertyAttributes: ["isActive"]
		});
		const mDeltaInfo = {
			control: oControl,
			existingState: {
				propertyInfo: {
					prop1: {isActive: false}
				}
			},
			changedState: {
				propertyInfo: {}
			},
			changeOperations: oController.getChangeOperations(),
			applyAbsolute: true,
			propertyInfo: []
		};
		const aChanges = oController.getDelta(mDeltaInfo);
		assert.strictEqual(aChanges.length, 1, "One change created for removed property");
		assert.strictEqual(aChanges[0].changeSpecificData.content.value, null, "Value is null for removal");
		assert.strictEqual(aChanges[0]["transient"], true, "Change is transient");
		oController.destroy();
	});

	QUnit.test("Creates null changes for removed attributes in absolute mode", function(assert) {
		const oControl = createMockControl();
		const oController = new DynamicPropertiesController({
			control: oControl,
			targetAggregation: "columns",
			allowedPropertyAttributes: ["isActive", "label"]
		});
		const mDeltaInfo = {
			control: oControl,
			existingState: {
				propertyInfo: {
					prop1: {isActive: false, label: "Custom"}
				}
			},
			changedState: {
				propertyInfo: {
					prop1: {isActive: false}
				}
			},
			changeOperations: oController.getChangeOperations(),
			applyAbsolute: true,
			propertyInfo: []
		};
		const aChanges = oController.getDelta(mDeltaInfo);
		// Should have a change for the removed "label" attribute set to null
		const aLabelChanges = aChanges.filter(function(oChange) {
			return oChange.changeSpecificData.content.attribute === "label";
		});
		assert.strictEqual(aLabelChanges.length, 1, "Label change created");
		assert.strictEqual(aLabelChanges[0].changeSpecificData.content.value, null, "Label set to null");
		assert.ok(aChanges.every((oChange) => oChange["transient"] === true), "All changes are transient");
		oController.destroy();
	});

	QUnit.module("getDelta - relative mode");

	QUnit.test("Creates changes only for changed attributes", function(assert) {
		const oControl = createMockControl();
		const oController = new DynamicPropertiesController({
			control: oControl,
			targetAggregation: "columns",
			allowedPropertyAttributes: ["isActive", "label"]
		});
		const mDeltaInfo = {
			control: oControl,
			existingState: {
				propertyInfo: {
					prop1: {isActive: true, label: "Old Label"}
				}
			},
			changedState: {
				propertyInfo: {
					prop1: {isActive: true, label: "New Label"}
				}
			},
			changeOperations: oController.getChangeOperations(),
			applyAbsolute: false,
			propertyInfo: []
		};
		const aChanges = oController.getDelta(mDeltaInfo);
		assert.strictEqual(aChanges.length, 1, "One change created for the changed attribute only");
		assert.strictEqual(aChanges[0].changeSpecificData.changeType, "setPropertyAttribute", "Correct change type");
		assert.strictEqual(aChanges[0].changeSpecificData.content.attribute, "label", "Correct attribute");
		assert.strictEqual(aChanges[0].changeSpecificData.content.value, "New Label", "Correct new value");
		assert.strictEqual(aChanges[0]["transient"], true, "Change is transient");
		oController.destroy();
	});

	QUnit.test("No changes when states are identical", function(assert) {
		const oControl = createMockControl();
		const oController = new DynamicPropertiesController({
			control: oControl,
			targetAggregation: "columns",
			allowedPropertyAttributes: ["isActive"]
		});
		const mDeltaInfo = {
			control: oControl,
			existingState: {
				propertyInfo: {
					prop1: {isActive: true}
				}
			},
			changedState: {
				propertyInfo: {
					prop1: {isActive: true}
				}
			},
			changeOperations: oController.getChangeOperations(),
			applyAbsolute: false,
			propertyInfo: []
		};
		const aChanges = oController.getDelta(mDeltaInfo);
		assert.strictEqual(aChanges.length, 0, "No changes for identical states");
		oController.destroy();
	});

	QUnit.test("No changes when property is removed from changedState in relative mode", function(assert) {
		const oControl = createMockControl();
		const oController = new DynamicPropertiesController({
			control: oControl,
			targetAggregation: "columns",
			allowedPropertyAttributes: ["isActive"]
		});
		const mDeltaInfo = {
			control: oControl,
			existingState: {
				propertyInfo: {
					prop1: {isActive: false}
				}
			},
			changedState: {
				propertyInfo: {}
			},
			changeOperations: oController.getChangeOperations(),
			applyAbsolute: false,
			propertyInfo: []
		};
		const aChanges = oController.getDelta(mDeltaInfo);
		assert.strictEqual(aChanges.length, 0, "Relative mode does not generate removal changes");
		oController.destroy();
	});

	QUnit.test("Skips unsupported attribute changes", function(assert) {
		const oControl = createMockControl();
		const oController = new DynamicPropertiesController({
			control: oControl,
			targetAggregation: "columns",
			allowedPropertyAttributes: ["isActive"]
		});
		const mDeltaInfo = {
			control: oControl,
			existingState: {},
			changedState: {
				propertyInfo: {
					prop1: {isActive: false, unknownAttr: "value"}
				}
			},
			changeOperations: oController.getChangeOperations(),
			applyAbsolute: true,
			propertyInfo: []
		};
		const aChanges = oController.getDelta(mDeltaInfo);
		// Only isActive should produce a change, unknownAttr should be skipped
		assert.strictEqual(aChanges.length, 1, "Only supported attribute produces a change");
		assert.strictEqual(aChanges[0].changeSpecificData.changeType, "setPropertyAttribute", "Only isActive change");
		assert.strictEqual(aChanges[0].changeSpecificData.content.attribute, "isActive", "Correct attribute");
		oController.destroy();
	});

	QUnit.test("Detects changes in multiple properties", function(assert) {
		const oControl = createMockControl();
		const oController = new DynamicPropertiesController({
			control: oControl,
			targetAggregation: "columns",
			allowedPropertyAttributes: ["isActive", "label"]
		});
		const mDeltaInfo = {
			control: oControl,
			existingState: {
				propertyInfo: {
					prop1: {isActive: true, label: "Old"},
					prop2: {isActive: false}
				}
			},
			changedState: {
				propertyInfo: {
					prop1: {isActive: false, label: "New"},
					prop2: {isActive: true}
				}
			},
			changeOperations: oController.getChangeOperations(),
			applyAbsolute: false,
			propertyInfo: []
		};
		const aChanges = oController.getDelta(mDeltaInfo);
		assert.strictEqual(aChanges.length, 3, "Three changes: isActive+label for prop1, isActive for prop2");
		assert.ok(aChanges.every(function(oChange) {return oChange["transient"] === true;}), "All changes are transient");
		oController.destroy();
	});

	QUnit.test("Detects new property entry", function(assert) {
		const oControl = createMockControl();
		const oController = new DynamicPropertiesController({
			control: oControl,
			targetAggregation: "columns",
			allowedPropertyAttributes: ["isActive"]
		});
		const mDeltaInfo = {
			control: oControl,
			existingState: {},
			changedState: {
				propertyInfo: {
					newProp: {isActive: true}
				}
			},
			changeOperations: oController.getChangeOperations(),
			applyAbsolute: false,
			propertyInfo: []
		};
		const aChanges = oController.getDelta(mDeltaInfo);
		assert.strictEqual(aChanges.length, 1, "One change for new property");
		assert.strictEqual(aChanges[0].changeSpecificData.content.name, "newProp", "Change is for newProp");
		assert.strictEqual(aChanges[0]["transient"], true, "Change is transient");
		oController.destroy();
	});

	QUnit.module("getDelta - empty/undefined states");

	QUnit.test("Handles undefined existingState and changedState", function(assert) {
		const oControl = createMockControl();
		const oController = new DynamicPropertiesController({
			control: oControl,
			targetAggregation: "columns",
			allowedPropertyAttributes: ["isActive"]
		});
		const mDeltaInfo = {
			control: oControl,
			existingState: {},
			changedState: {},
			changeOperations: oController.getChangeOperations(),
			applyAbsolute: true,
			propertyInfo: []
		};
		const aChanges = oController.getDelta(mDeltaInfo);
		assert.strictEqual(aChanges.length, 0, "No changes for empty states");
		oController.destroy();
	});

	QUnit.test("Returns empty array when control is not in property keys mode", function(assert) {
		const oControl = createMockControl();
		oControl.isInPropertyKeysMode = sinon.stub().returns(false);
		const oController = new DynamicPropertiesController({
			control: oControl,
			targetAggregation: "columns",
			allowedPropertyAttributes: ["isActive"]
		});
		const mDeltaInfo = {
			control: oControl,
			existingState: {},
			changedState: {
				propertyInfo: {
					prop1: {isActive: false}
				}
			},
			changeOperations: oController.getChangeOperations(),
			applyAbsolute: true,
			propertyInfo: []
		};
		const aChanges = oController.getDelta(mDeltaInfo);
		assert.strictEqual(aChanges.length, 0, "No changes created in aggregation mode");
		oController.destroy();
	});

	QUnit.test("Throws for static properties", function(assert) {
		const oControl = createMockControl(undefined, {
			staticProp: {label: "Static"}
		}, true);
		const oController = new DynamicPropertiesController({
			control: oControl,
			targetAggregation: "columns",
			allowedPropertyAttributes: ["isActive"]
		});
		const mDeltaInfo = {
			control: oControl,
			existingState: {},
			changedState: {
				propertyInfo: {
					staticProp: {isActive: false}
				}
			},
			changeOperations: oController.getChangeOperations(),
			applyAbsolute: true,
			propertyInfo: []
		};
		assert.throws(function() {
			oController.getDelta(mDeltaInfo);
		}, /Cannot create change for static property 'staticProp'/, "Error thrown for static property");
		oController.destroy();
	});

	QUnit.test("Throws for unknown property when PropertyInfo is final", function(assert) {
		const oControl = createMockControl(undefined, {}, true);
		const oController = new DynamicPropertiesController({
			control: oControl,
			targetAggregation: "columns",
			allowedPropertyAttributes: ["isActive"]
		});
		const mDeltaInfo = {
			control: oControl,
			existingState: {},
			changedState: {
				propertyInfo: {
					unknownProp: {isActive: false}
				}
			},
			changeOperations: oController.getChangeOperations(),
			applyAbsolute: true,
			propertyInfo: []
		};
		assert.throws(function() {
			oController.getDelta(mDeltaInfo);
		}, /Unknown property 'unknownProp'. Ensure it is defined in the PropertyInfo/, "Error thrown for unknown property with final PropertyHelper");
		oController.destroy();
	});

	QUnit.test("Creates change for unknown property when PropertyInfo is not final", function(assert) {
		const oControl = createMockControl(undefined, {}, false);
		const oController = new DynamicPropertiesController({
			control: oControl,
			targetAggregation: "columns",
			allowedPropertyAttributes: ["isActive"]
		});
		const mDeltaInfo = {
			control: oControl,
			existingState: {},
			changedState: {
				propertyInfo: {
					unknownProp: {isActive: false}
				}
			},
			changeOperations: oController.getChangeOperations(),
			applyAbsolute: true,
			propertyInfo: []
		};
		const aChanges = oController.getDelta(mDeltaInfo);
		assert.strictEqual(aChanges.length, 1, "One change created for unknown property");
		assert.strictEqual(aChanges[0].changeSpecificData.content.name, "unknownProp", "Change targets the unknown property");
		assert.strictEqual(aChanges[0].changeSpecificData.content.value, false, "Correct value");
		assert.strictEqual(aChanges[0]["transient"], true, "Change is transient");
		oController.destroy();
	});

	QUnit.module("changesToState");

	QUnit.test("Transforms single change to state representation", function(assert) {
		const oControl = createMockControl();
		oControl.getMetadata = function() {
			return {
				getDefaultAggregation: function() {return {name: "columns"};},
				hasAggregation: function(sName) {return sName !== "propertyInfo";}
			};
		};
		const oController = new DynamicPropertiesController({
			control: oControl,
			targetAggregation: "columns",
			allowedPropertyAttributes: ["isActive"]
		});
		const aChanges = [{
			selectorElement: oControl,
			changeSpecificData: {
				changeType: "setPropertyAttribute",
				content: {
					name: "prop1",
					attribute: "isActive",
					value: false
				}
			}
		}];
		const oState = oController.changesToState(aChanges);
		assert.ok(oState.propertyInfo, "State has propertyInfo");
		assert.ok(oState.propertyInfo.prop1, "State has prop1 entry");
		assert.strictEqual(oState.propertyInfo.prop1.isActive, false, "isActive value preserved");
		oController.destroy();
	});

	QUnit.test("Transforms multiple changes to state representation", function(assert) {
		const oControl = createMockControl();
		oControl.getMetadata = function() {
			return {
				getDefaultAggregation: function() {return {name: "columns"};},
				hasAggregation: function(sName) {return sName !== "propertyInfo";}
			};
		};
		const oController = new DynamicPropertiesController({
			control: oControl,
			targetAggregation: "columns",
			allowedPropertyAttributes: ["isActive", "label"]
		});
		const aChanges = [{
			selectorElement: oControl,
			changeSpecificData: {
				changeType: "setPropertyAttribute",
				content: {name: "prop1", attribute: "isActive", value: false}
			}
		}, {
			selectorElement: oControl,
			changeSpecificData: {
				changeType: "setPropertyAttribute",
				content: {name: "prop1", attribute: "label", value: "New Label"}
			}
		}, {
			selectorElement: oControl,
			changeSpecificData: {
				changeType: "setPropertyAttribute",
				content: {name: "prop2", attribute: "isActive", value: true}
			}
		}];
		const oState = oController.changesToState(aChanges);
		assert.strictEqual(oState.propertyInfo.prop1.isActive, false, "prop1 isActive");
		assert.strictEqual(oState.propertyInfo.prop1.label, "New Label", "prop1 label");
		assert.strictEqual(oState.propertyInfo.prop2.isActive, true, "prop2 isActive");
		oController.destroy();
	});

	QUnit.test("Handles empty changes array", function(assert) {
		const oControl = createMockControl();
		const oController = new DynamicPropertiesController({
			control: oControl,
			targetAggregation: "columns",
			allowedPropertyAttributes: ["isActive"]
		});
		const oState = oController.changesToState([]);
		assert.deepEqual(oState, {}, "Empty state for empty changes");
		oController.destroy();
	});

	QUnit.test("Transforms null value change to state (cleans up property)", function(assert) {
		const oControl = createMockControl();
		oControl.getMetadata = function() {
			return {
				getDefaultAggregation: function() {return {name: "columns"};},
				hasAggregation: function(sName) {return sName !== "propertyInfo";}
			};
		};
		const oController = new DynamicPropertiesController({
			control: oControl,
			targetAggregation: "columns",
			allowedPropertyAttributes: ["isActive"]
		});
		const aChanges = [{
			selectorElement: oControl,
			changeSpecificData: {
				changeType: "setPropertyAttribute",
				content: {name: "prop1", attribute: "isActive", value: null}
			}
		}];
		const oState = oController.changesToState(aChanges);
		// When value is null, xConfigAPI.createAggregationConfig should delete the property entry
		assert.ok(oState.propertyInfo === undefined ||
			oState.propertyInfo.prop1 === undefined ||
			Object.keys(oState.propertyInfo.prop1).length === 0,
			"Null value results in cleaned-up state entry");
		oController.destroy();
	});

	QUnit.test("Deep-clones object values in changesToState", function(assert) {
		const oControl = createMockControl();
		oControl.getMetadata = function() {
			return {
				getDefaultAggregation: function() {return {name: "columns"};},
				hasAggregation: function(sName) {return sName !== "propertyInfo";}
			};
		};
		const oController = new DynamicPropertiesController({
			control: oControl,
			targetAggregation: "columns",
			allowedPropertyAttributes: ["isActive", "label"]
		});
		const oObjectValue = {nested: "data"};
		const aChanges = [{
			selectorElement: oControl,
			changeSpecificData: {
				changeType: "setPropertyAttribute",
				content: {name: "prop1", attribute: "label", value: oObjectValue}
			}
		}];
		const oState = oController.changesToState(aChanges);
		assert.notStrictEqual(oState.propertyInfo.prop1.label, oObjectValue,
			"Object value is cloned");
		assert.deepEqual(oState.propertyInfo.prop1.label, oObjectValue,
			"Cloned value is equal");
		oController.destroy();
	});
});
