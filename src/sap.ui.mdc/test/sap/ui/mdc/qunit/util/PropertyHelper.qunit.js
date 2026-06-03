/*!
 * ${copyright}
 */

/* global QUnit, sinon */
/* eslint-disable no-new */

sap.ui.define([
	"sap/ui/mdc/util/PropertyHelper",
	"sap/ui/mdc/Control",
	"sap/ui/model/type/String",
	"sap/base/util/merge"
], function(
	_PropertyHelper,
	MDCControl,
	StringType,
	merge
) {
	"use strict";

	const PropertyHelper = _PropertyHelper.extend("sap.ui.mdc.util.test.PropertyHelper", {
		constructor: function(aProperties, oParent, mAdditionalAttributes) {
			_PropertyHelper.call(this, aProperties, oParent, Object.assign({
				filterable: true,
				sortable: true,
				propertyInfos: true,
				unit: {
					type: "PropertyReference"
				},
				exportSettings: {
					type: "object",
					"default": {
						value: {}
					},
					inComplexProperty: {allowed: true}
				}
			}, mAdditionalAttributes));
		}
	});
	const TestControl = MDCControl.extend("sap.ui.mdc.util.test.TestControl", {metadata: {library: "sap.ui.mdc"}, renderer: null});

	QUnit.module("Validation of property infos");

	QUnit.test("Without property infos", function(assert) {
		assert.throws(function() {
			new PropertyHelper();
		}, new Error("Invalid property definition: Property infos must be an array."));
	});

	QUnit.test("Empty array as property infos", function(assert) {
		new PropertyHelper([]).destroy();
		assert.ok(true, "No error thrown");
	});

	QUnit.test("Contains non-plain objects", function(assert) {
		assert.throws(function() {
			new PropertyHelper([{
				key: "foo",
				label: "bar",
				dataType: "String"
			}, "string"
			]);
		}, new Error("Invalid property definition: Property info must be a plain object."), "string");

		assert.throws(function() {
			new PropertyHelper([{
				key: "foo",
				label: "bar",
				dataType: "String"
			}, new TestControl()
			]);
		}, new Error("Invalid property definition: Property info must be a plain object."), "object");

		assert.throws(function() {
			new PropertyHelper([Object.create({
				key: "prop",
				label: "prop",
				dataType: "String"
			})]);
		}, new Error("Invalid property definition: Property info must be a plain object."), "complex object");
	});

	QUnit.test("Properties with the same name", function(assert) {
		assert.throws(function() {
			new PropertyHelper([{
				key: "foo",
				label: "bar",
				dataType: "String"
			}, {
				key: "foo",
				label: "bar2",
				dataType: "String"
			}]);
		}, new Error("Invalid property definition: Properties do not have unique keys."));
	});

	QUnit.test("Unknown attribute", function(assert) {
		assert.throws(function() {
			new PropertyHelper([{
				key: "foo",
				label: "bar",
				dataType: "String",
				foo: "bar"
			}]);
		}, new Error("Invalid property definition for property with key 'foo': Property contains invalid attribute 'foo'."));

		assert.throws(function() {
			new PropertyHelper([{
				key: "foo",
				label: "bar",
				dataType: "String",
				additionalAttribute: {
					doesNotExist: true
				}
			}], null, {
				additionalAttribute: {
					type: {
						exists: {type: "string"}
					}
				}
			});
		},
			new Error("Invalid property definition for property with key 'foo': Property contains invalid attribute 'additionalAttribute.doesNotExist'."),
			"Deeply nested attribute"
		);
	});

	QUnit.test("Default attribute that was not allowed", function(assert) {
		assert.throws(function() {
			new _PropertyHelper([{
				key: "foo",
				label: "bar",
				dataType: "String",
				filterable: true
			}]);
		}, new Error("Invalid property definition for property with key 'foo': Property contains invalid attribute 'filterable'."));
	});

	QUnit.test("Missing mandatory attribute", function(assert) {
		assert.throws(function() {
			new PropertyHelper([{
				label: "foo",
				dataType: "String"
			}]);
		},
			new Error("Invalid property definition for property with key 'undefined': Property does not contain mandatory attribute 'key'."),
			"key"
		);

		assert.throws(function() {
			new PropertyHelper([{
				key: "foo",
				dataType: "String"
			}]);
		}, new Error("Invalid property definition for property with key 'foo': Property does not contain mandatory attribute 'label'."),
			"label"
		);

		new PropertyHelper([{
			key: "foo",
			label: "bar",
			dataType: "String",
			additionalAttribute: {}
		}], null, {
			additionalAttribute: {
				type: {
					bar: {type: "string", mandatory: true}
				}
			}
		}).destroy();
		assert.ok(true, "No error thrown if a deeply nested attribute is missing");

		assert.throws(function() {
			new PropertyHelper([{
				key: undefined,
				label: "foo",
				dataType: "String"
			}]);
		},
			new Error("Invalid property definition for property with key 'undefined': Property does not contain mandatory attribute 'key'."),
			"Mandatory attribute is set to 'undefined'"
		);

		assert.throws(function() {
			new PropertyHelper([{
				key: null,
				label: "foo",
				dataType: "String"
			}]);
		},
			new Error("Invalid property definition for property with key 'null': Property does not contain mandatory attribute 'key'."),
			"Mandatory attribute is set to 'null'"
		);

		assert.throws(function() {
			new PropertyHelper([{
				key: "foo",
				label: "bar",
				dataType: "String",
				additionalAttribute: null
			}], null, {
				additionalAttribute: {type: "object", mandatory: true, "default": {value: {}}}
			});
		},
			new Error("Invalid property definition for property with key 'foo': Property does not contain mandatory attribute 'additionalAttribute'."),
			"Mandatory attribute of type 'object' is set to 'null'"
		);

		assert.throws(function() {
			new PropertyHelper([{
				key: "foo",
				label: "bar",
				dataType: "String",
				additionalAttribute: null
			}], null, {
				additionalAttribute: {
					type: {
						bar: {type: "object"}
					},
					mandatory: true
				}
			});
		},
			new Error("Invalid property definition for property with key 'foo': Property does not contain mandatory attribute 'additionalAttribute'."),
			"Mandatory complex attribute is set to 'null'"
		);
	});

	QUnit.test("Invalid values", function(assert) {
		assert.throws(function() {
			new PropertyHelper([{
				key: true,
				dataType: "String",
				label: "label"
			}]);
		}, new Error("Invalid property definition for property with key 'true': The value of 'key' is invalid."));

		assert.throws(function() {
			new PropertyHelper([{
				key: "foo",
				label: "bar",
				propertyInfos: "invalid"
			}]);
		},
			new Error("Invalid property definition for property with key 'foo': The value of 'propertyInfos' is invalid."),
			"'propertyInfos' attribute"
		);

		assert.throws(function() {
			new PropertyHelper([{
				key: "foo",
				label: "bar",
				dataType: "String",
				exportSettings: true
			}]);
		},
			new Error("Invalid property definition for property with key 'foo': The value of 'exportSettings' is invalid."),
			"Complex object attribute"
		);

		assert.throws(function() {
			new PropertyHelper([{
				key: "foo",
				label: "bar",
				dataType: "String",
				additionalAttribute: {
					bar: true
				}
			}], null, {
				additionalAttribute: {
					type: {
						bar: {type: "string"}
					}
				}
			});
		},
			new Error("Invalid property definition for property with key 'foo': The value of 'additionalAttribute.bar' is invalid."),
			"Deeply nested attribute"
		);

		assert.throws(function() {
			new PropertyHelper([{
				key: "foo",
				label: "bar",
				dataType: "String",
				additionalAttribute: "bar"
			}], null, {
				additionalAttribute: {type: "string[]"}
			});
		},
			new Error("Invalid property definition for property with key 'foo': The value of 'additionalAttribute' is invalid."),
			"Value for an attribute of type 'string[]' is a string"
		);
	});

	QUnit.test("Invalid values for mandatory attributes", function(assert) {
		assert.throws(function() {
			new PropertyHelper([{
				key: undefined,
				label: "bar",
				dataType: "String"
			}]);
		},
			new Error("Invalid property definition for property with key 'undefined': Property does not contain mandatory attribute 'key'."),
			"Attribute of type 'string' is 'undefined'"
		);

		assert.throws(function() {
			new PropertyHelper([{
				key: null,
				label: "bar",
				dataType: "String"
			}]);
		},
			new Error("Invalid property definition for property with key 'null': Property does not contain mandatory attribute 'key'."),
			"Attribute of type 'string' is 'null'"
		);

		assert.throws(function() {
			new PropertyHelper([{
				key: "foo",
				label: "bar",
				dataType: "String",
				additionalAttribute: undefined
			}], null, {
				additionalAttribute: {type: "object", mandatory: true}
			});
		},
			new Error("Invalid property definition for property with key 'foo': Property does not contain mandatory attribute 'additionalAttribute'."),
			"Attribute of type 'object' is 'undefined'"
		);

		assert.throws(function() {
			new PropertyHelper([{
				key: "foo",
				label: "bar",
				dataType: "String",
				additionalAttribute: null
			}], null, {
				additionalAttribute: {type: "object", mandatory: true}
			});
		},
			new Error("Invalid property definition for property with key 'foo': Property does not contain mandatory attribute 'additionalAttribute'."),
			"Attribute of type 'object' is 'null'"
		);
	});

	QUnit.test("Valid values for optional attributes", function(assert) {
		new PropertyHelper([{
			key: "foo",
			label: "bar",
			dataType: "String",
			path: undefined
		}]).destroy();
		assert.ok(true, "No error thrown if the value for an optional attribute is 'undefined'");

		new PropertyHelper([{
			key: "foo",
			label: "bar",
			dataType: "String",
			path: null
		}]).destroy();
		assert.ok(true, "No error thrown if the value for an optional attribute is 'null'");

		new PropertyHelper([{
			key: "foo",
			label: "bar",
			dataType: "String",
			additionalAttribute: {
				bar: undefined
			}
		}], null, {
			additionalAttribute: {
				type: {
					bar: {type: "string"}
				}
			}
		}).destroy();
		assert.ok(true, "No error thrown if the value of a deeply nested attribute is 'undefined'");

		new PropertyHelper([{
			key: "foo",
			label: "bar",
			dataType: "String",
			additionalAttribute: {
				bar: null
			}
		}], null, {
			additionalAttribute: {
				type: {
					bar: {type: "string"}
				}
			}
		}).destroy();
		assert.ok(true, "No error thrown if the value of a deeply nested attribute is 'null'");
	});

	QUnit.test("Single property reference: Referencing a complex property", function(assert) {
		assert.throws(function() {
			new PropertyHelper([{
				key: "prop",
				label: "Property",
				dataType: "String",
				unit: "complexProperty"
			}, {
				key: "complexProperty",
				label: "Complex property",
				propertyInfos: ["prop"]
			}]);
		}, new Error("Invalid property definition for property with key 'prop': Property references complex properties in the 'unit' attribute."));
	});

	QUnit.test("Single property reference: Referencing a property which does not exist", function(assert) {
		assert.throws(function() {
			new PropertyHelper([{
				key: "propA",
				label: "Property A",
				dataType: "String",
				unit: "propB"
			}]);
		}, new Error("Invalid property definition for property with key 'propA': Property references non-existing properties in the 'unit' attribute."));
	});

	QUnit.test("Single property reference: Referencing itself", function(assert) {
		assert.throws(function() {
			new PropertyHelper([{
				key: "propA",
				label: "Property A",
				dataType: "String",
				unit: "propA"
			}]);
		}, new Error("Invalid property definition for property with key 'propA': Property references itself in the 'unit' attribute."));
	});

	QUnit.test("Multiple property references: Referencing a complex property", function(assert) {
		assert.throws(function() {
			new PropertyHelper([{
				key: "prop",
				label: "Property",
				dataType: "String"
			}, {
				key: "complexPropertyA",
				label: "Complex property A",
				propertyInfos: ["complexPropertyB"]
			}, {
				key: "complexPropertyB",
				label: "Complex property B",
				propertyInfos: ["prop"]
			}]);
		}, new Error("Invalid property definition for property with key 'complexPropertyA': Property references complex properties in the 'propertyInfos' attribute."));
	});

	QUnit.test("Multiple property references: One referenced property does not exist", function(assert) {
		assert.throws(function() {
			new PropertyHelper([{
				key: "prop",
				label: "Property",
				dataType: "String"
			}, {
				key: "complexProperty",
				label: "Complex property",
				propertyInfos: ["prop", "nonExistingProperty"]
			}]);
		}, new Error("Invalid property definition for property with key 'complexProperty': Property references non-existing properties in the 'propertyInfos' attribute."));
	});

	QUnit.test("Multiple property references: All referenced properties do not exist", function(assert) {
		assert.throws(function() {
			new PropertyHelper([{
				key: "complexProperty",
				label: "Complex property",
				propertyInfos: ["nonExistingProperty"]
			}]);
		}, new Error("Invalid property definition for property with key 'complexProperty': Property references non-existing properties in the 'propertyInfos' attribute."));
	});

	QUnit.test("Multiple property references: Duplicate keys", function(assert) {
		assert.throws(function() {
			new PropertyHelper([{
				key: "prop",
				label: "Property",
				dataType: "String"
			}, {
				key: "complexProperty",
				label: "Complex property",
				propertyInfos: ["prop", "prop"]
			}]);
		}, new Error("Invalid property definition for property with key 'complexProperty': Property contains duplicate names in the 'propertyInfos' attribute."));
	});

	QUnit.test("Multiple property references: Referencing itself", function(assert) {
		assert.throws(function() {
			new PropertyHelper([{
				key: "complexProperty",
				label: "Complex property",
				propertyInfos: ["complexProperty"]
			}]);
		}, new Error("Invalid property definition for property with key 'complexProperty': Property references itself in the 'propertyInfos' attribute."));
	});

	QUnit.test("Property references in a nested attribute: Referencing a complex property", function(assert) {
		assert.throws(function() {
			new PropertyHelper([{
				key: "prop",
				label: "Property",
				dataType: "String",
				additionalAttribute: {
					foo: "complexProperty"
				}
			}, {
				key: "complexProperty",
				label: "Complex property",
				propertyInfos: ["prop"]
			}], null, {
				additionalAttribute: {
					type: {
						foo: {type: "PropertyReference"}
					}
				}
			});
		}, new Error("Invalid property definition for property with key 'prop': Property references complex properties in the 'additionalAttribute.foo' attribute."));
	});

	QUnit.test("Property references in a nested attribute: One referenced property does not exist", function(assert) {
		assert.throws(function() {
			new PropertyHelper([{
				key: "propA",
				label: "Property A",
				dataType: "String",
				additionalAttribute: {
					foo: ["propB", "nonExistingProperty"]
				}
			}, {
				key: "propB",
				label: "Property B",
				dataType: "String"
			}], null, {
				additionalAttribute: {
					type: {
						foo: {type: "PropertyReference[]"}
					}
				}
			});
		}, new Error("Invalid property definition for property with key 'propA': Property references non-existing properties in the 'additionalAttribute.foo' attribute."));
	});

	QUnit.test("Property references in a nested attribute: All referenced properties do not exist", function(assert) {
		assert.throws(function() {
			new PropertyHelper([{
				key: "prop",
				label: "Property",
				dataType: "String",
				additionalAttribute: {
					foo: ["nonExistingProperty"]
				}
			}], null, {
				additionalAttribute: {
					type: {
						foo: {type: "PropertyReference[]"}
					}
				}
			});
		}, new Error("Invalid property definition for property with key 'prop': Property references non-existing properties in the 'additionalAttribute.foo' attribute."));
	});

	QUnit.test("Property references in a nested attribute: Duplicate keys", function(assert) {
		assert.throws(function() {
			new PropertyHelper([{
				key: "propA",
				label: "Property A",
				dataType: "String",
				additionalAttribute: {
					foo: ["propB", "propB"]
				}
			}, {
				key: "propB",
				label: "Property B",
				dataType: "String"
			}], null, {
				additionalAttribute: {
					type: {
						foo: {type: "PropertyReference[]"}
					}
				}
			});
		}, new Error("Invalid property definition for property with key 'propA': Property contains duplicate names in the 'additionalAttribute.foo' attribute."));
	});

	QUnit.test("Property references in a nested attribute: Referencing itself", function(assert) {
		assert.throws(function() {
			new PropertyHelper([{
				key: "propA",
				label: "Property A",
				dataType: "String",
				additionalAttribute: {
					foo: ["propA"]
				}
			}], null, {
				additionalAttribute: {
					type: {
						foo: {type: "PropertyReference[]"}
					}
				}
			});
		}, new Error("Invalid property definition for property with key 'propA': Property references itself in the 'additionalAttribute.foo' attribute."));
	});

	QUnit.test("Property references in a nested attribute: No references", function(assert) {
		new PropertyHelper([{
			key: "propA",
			label: "Property A",
			dataType: "String",
			additionalAttribute: {
				foo: []
			}
		}], null, {
			additionalAttribute: {
				type: {
					foo: {type: "PropertyReference[]"}
				}
			}
		}).destroy();
		assert.ok(true, "No error thrown");
	});

	QUnit.test("Complex property with an attribute that is not allowed", function(assert) {
		assert.throws(function() {
			new PropertyHelper([{
				key: "prop",
				label: "Property",
				dataType: "String"
			}, {
				key: "complexProperty",
				label: "Complex property",
				path: "complexPath", // not allowed in complex properties
				propertyInfos: ["prop"]
			}]);
		}, new Error("Invalid property definition for property with key 'complexProperty': Complex property contains invalid attribute 'path'."));
	});

	QUnit.test("Complex property does not reference any properties", function(assert) {
		assert.throws(function() {
			new PropertyHelper([{
				key: "complexProperty",
				label: "Complex property",
				propertyInfos: []
			}]);
		},
			new Error("Invalid property definition for property with key 'complexProperty': Complex property does not reference existing properties."),
			"'propertyInfos' is an empty array"
		);

		assert.throws(function() {
			new PropertyHelper([{
				key: "complexProperty",
				label: "Complex property",
				propertyInfos: null
			}]);
		},
			new Error("Invalid property definition for property with key 'complexProperty': Complex property does not reference existing properties."),
			"'propertyInfos' is 'null'"
		);
	});

	QUnit.test("Complex property with nested attribute including attributes that are not allowed in complex properties", function(assert) {
		assert.throws(function() {
			new PropertyHelper([{
				key: "propA",
				label: "prop A",
				dataType: "String"
			}, {
				key: "propB",
				label: "prop B",
				propertyInfos: ["propA"],
				foo: {
					bar: {
						propB: 2
					}
				}
			}], null, {
				foo: {
					type: {
						bar: {
							type: {
								propA: {type: "string"},
								propB: {type: "int", inComplexProperty: {allowed: false}}
							},
							"default": {value: {}}
						}
					},
					inComplexProperty: {
						allowed: true
					},
					"default": {value: {}}
				}
			});
		}, new Error("Invalid property definition for property with key 'propB': Complex property contains invalid attribute 'foo.bar.propB'."));
	});

	/**
	 * @deprecated As of version 1.121
	 */
	QUnit.test("legacyAlias for key attribute", function (assert) {
		let oPropertyHelper = new PropertyHelper([{
			key: "propA",
			label: "prop A",
			dataType: "String"
		}]);
		assert.ok(oPropertyHelper.getProperties()[0].name === "propA", "PropertyHelper interpolates legacy-attribute.");
		oPropertyHelper.destroy();

		oPropertyHelper = new PropertyHelper([{
			name: "propA",
			label: "prop A",
			dataType: "String"
		}]);
		assert.ok(oPropertyHelper.getProperties()[0].key === "propA", "PropertyHelper interpolates legacy-attribute replacement.");
		oPropertyHelper.destroy();

		assert.throws(function() {
			new PropertyHelper([{
				key: "propA",
				name: "propB",
				label: "prop A",
				dataType: "String"
			}]);
		}, new Error("Invalid property definition for property with key 'propA': The values of legacy-attribute 'name' and it's replacement 'key' must be identical."));
	});

	QUnit.test("Property info consistency: Property missing", function(assert) {
		const oPropertyHelper = new PropertyHelper([{
			key: "foo",
			label: "bar",
			dataType: "String"
		}]);
		assert.throws(function() {
			oPropertyHelper.setProperties([]);
		}, new Error("Invalid property definition for properties with keys 'foo': Detected property info modifications after update:"));

		oPropertyHelper.destroy();
	});

	QUnit.test("Property info consistency: Attribute value mismatch - Previous attribute value ->  New attribute value", function(assert) {
		const oPropertyHelper = new PropertyHelper([{
			key: "foo",
			label: "foo",
			dataType: "String"
		}]);
		assert.throws(function() {
			oPropertyHelper.setProperties([{
				key: "foo",
				label: "bar",
				dataType: "Integer"
			}]);
		}, new Error("Invalid property definition for properties with keys 'foo': Detected property info modifications after update:"));
		oPropertyHelper.destroy();
	});

	QUnit.test("Property info consistency: Attribute value mismatch - Default value -> New attribute value", function(assert) {
		const oPropertyHelper = new PropertyHelper([{
			key: "foo",
			label: "foo",
			dataType: "String"
		}]);
		assert.throws(function() {
			oPropertyHelper.setProperties([{
				key: "foo",
				label: "foo",
				dataType: "String",
				tooltip: "bar"
			}]);
		}, new Error("Invalid property definition for properties with keys 'foo': Detected property info modifications after update:"));
		oPropertyHelper.destroy();
	});

	QUnit.test("Property info consistency: Attribute value mismatch - Previous attribute value -> Default value", function(assert) {
		const oPropertyHelper = new PropertyHelper([{
			key: "foo",
			label: "foo",
			dataType: "String",
			tooltip: "bar"
		}]);
		assert.throws(function() {
			oPropertyHelper.setProperties([{
				key: "foo",
				label: "foo",
				dataType: "String"
			}]);
		}, new Error("Invalid property definition for properties with keys 'foo': Detected property info modifications after update:"));
		oPropertyHelper.destroy();
	});

	QUnit.test("Property info consistency: Complex attribute value mismatch - Default value -> New attribute value", function(assert) {
		const oPropertyHelper = new PropertyHelper([{
			key: "foo",
			label: "foo",
			dataType: "String"
		}], null, {
			foo: {
				type: {
					bar: {type: "string", "default": {value: "ABC"}}
				},
				"default": {value: {}}
			}
		});

		assert.throws(function() {
			oPropertyHelper.setProperties([{
				key: "foo",
				label: "foo",
				dataType: "String",
				foo: {
					bar: "XYZ"
				}
			}]);
		}, new Error("Invalid property definition for properties with keys 'foo': Detected property info modifications after update:"));

		oPropertyHelper.destroy();
	});

	QUnit.module("Validation of additional attributes");

	QUnit.test("Provide a reserved standard attribute that is not added", function(assert) {
		assert.throws(function() {
			new _PropertyHelper([{
				key: "foo",
				label: "bar",
				dataType: "String",
				filterable: true
			}]);
		}, new Error("Invalid property definition for property with key 'foo': Property contains invalid attribute 'filterable'."));
	});

	QUnit.test("Add a reserved standard attribute", function(assert) {
		new _PropertyHelper([{
			key: "foo",
			label: "bar",
			dataType: "String",
			filterable: true
		}], null, {
			key: true,
			filterable: true
		}).destroy();
		assert.ok(true, "No error thrown");
	});

	QUnit.test("Override a reserved standard attribute", function(assert) {
		assert.throws(function() {
			new PropertyHelper([{
				key: "foo",
				label: "bar",
				dataType: "String"
			}], null, {
				key: {type: "string"}
			});
		}, new Error("The attribute 'key' is reserved and cannot be overridden by additional attributes."));
	});

	QUnit.test("Exclude a reserved standard attribute", function(assert) {
		assert.throws(function() {
			new PropertyHelper([{
				key: "foo",
				label: "bar",
				dataType: "String"
			}], null, {
				key: false
			});
		}, new Error("The attribute 'key' is reserved and cannot be overridden by additional attributes."));

		assert.throws(function() {
			new PropertyHelper([{
				key: "foo",
				label: "bar",
				dataType: "String"
			}], null, {
				key: undefined
			});
		}, new Error("The attribute 'key' is reserved and cannot be overridden by additional attributes."));
	});

	QUnit.test("Missing mandatory attribute", function(assert) {
		assert.throws(function() {
			new PropertyHelper([{
				key: "foo",
				label: "bar",
				dataType: "String"
			}], null, {
				additionalAttribute: {type: "string", mandatory: true}
			});
		}, new Error("Invalid property definition for property with key 'foo': Property does not contain mandatory attribute 'additionalAttribute'."));
	});

	QUnit.test("Complex property with an attribute that is not allowed", function(assert) {
		assert.throws(function() {
			new PropertyHelper([{
				key: "prop",
				label: "Property",
				dataType: "String"
			}, {
				key: "complexProperty",
				label: "Complex property",
				propertyInfos: ["prop"],
				additionalAttribute: "value"
			}], null, {
				additionalAttribute: {type: "string"}
			});
		}, new Error("Invalid property definition for property with key 'complexProperty': Complex property contains invalid attribute 'additionalAttribute'."));
	});

	QUnit.module("Setting defaults and cloning of property infos", {
		deepEqualProperties: function(assert, oPropertyHelper, aExpected, sMessage) {
			const mSimpleDefaults = {
				visible: true,
				sortable: true,
				filterable: true,
				path: "",
				unit: "",
				group: "",
				groupLabel: "",
				tooltip: "",
				exportSettings: {},
				caseSensitive: true,
				maxConditions: -1,
				formatOptions: null,
				constraints: null
			};
			const mComplexDefaults = {
				propertyInfos: [],
				visible: true,
				sortable: false,
				filterable: false,
				group: "",
				groupLabel: "",
				tooltip: "",
				exportSettings: {}
			};
			let aExpectedWithDefaults = aExpected.map(function(oProperty) {
				if ("propertyInfos" in oProperty) {
					return Object.assign({}, mComplexDefaults, oProperty);
				}

				return Object.assign({}, mSimpleDefaults, oProperty);
			});

			/**
			 * @deprecated As of version 1.121
			 */
			aExpectedWithDefaults = aExpectedWithDefaults.map((oProperty) => ({...oProperty, name: oProperty.key || oProperty.key}));

			assert.deepEqual(oPropertyHelper.getProperties(), aExpectedWithDefaults, sMessage || "Properties");
		}
	});

	QUnit.test("Basic defaults", function(assert) {
		const aPropertyInfos = [{
			key: "prop",
			label: "prop",
			dataType: "String"
		}, {
			key: "complexProperty",
			label: "Complex property",
			tooltip: "Complex custom tooltip",
			propertyInfos: ["prop"]
		}];
		const oPropertyHelper = new PropertyHelper(aPropertyInfos);

		this.deepEqualProperties(assert, oPropertyHelper, [{
			key: "prop",
			label: "prop",
			dataType: "String"
		}, {
			key: "complexProperty",
			label: "Complex property",
			tooltip: "Complex custom tooltip",
			propertyInfos: ["prop"]
		}]);

		oPropertyHelper.destroy();
	});

	QUnit.test("Extended defaults", function(assert) {
		const aPropertyInfos = [{
			key: "propA",
			label: "Property A",
			dataType: "String",
			unit: "unit",
			additionalAttribute: "attr",
			additionalComplexAttribute: {
				subAttribute: "subAttr"
			}
		}, {
			key: "propB",
			label: "Property B",
			dataType: "String",
			unit: "unit",
			defaultValueUndefined: null
		}, {
			key: "complexPropA",
			label: "Complex property A",
			propertyInfos: ["propA"],
			defaultValueUndefined: undefined
		}, {
			key: "complexPropB",
			label: "Complex property B",
			propertyInfos: ["propA"],
			defaultValueUndefined: false
		}, {
			key: "unit",
			label: "Unit",
			dataType: "String",
			defaultValueUndefined: true
		}];
		const oPropertyHelper = new PropertyHelper(aPropertyInfos, null, {
			additionalAttribute: {
				type: "string",
				"default": {value: "AttributeDefault"},
				inComplexProperty: {
					valueIfNotAllowed: "DefaultForComplex"
				}
			},
			additionalComplexAttribute: {
				type: {
					subAttribute: {type: "string"}
				}
			},
			additionalDefaultWithDeepPath: {
				type: "string",
				"default": {value: "attribute:additionalComplexAttribute.subAttribute"}
			},
			defaultValueUndefined: {
				type: "boolean",
				"default": {value: undefined},
				inComplexProperty: {allowed: true}
			}
		});

		this.deepEqualProperties(assert, oPropertyHelper, [{
			key: "propA",
			label: "Property A",
			dataType: "String",
			unit: "unit",
			additionalAttribute: "attr",
			additionalComplexAttribute: {
				subAttribute: "subAttr"
			},
			additionalDefaultWithDeepPath: "subAttr",
			defaultValueUndefined: undefined
		}, {
			key: "propB",
			label: "Property B",
			dataType: "String",
			unit: "unit",
			additionalAttribute: "AttributeDefault",
			additionalComplexAttribute: null,
			additionalDefaultWithDeepPath: "",
			defaultValueUndefined: undefined
		}, {
			key: "complexPropA",
			label: "Complex property A",
			propertyInfos: ["propA"],
			additionalAttribute: "DefaultForComplex",
			defaultValueUndefined: undefined
		}, {
			key: "complexPropB",
			label: "Complex property B",
			propertyInfos: ["propA"],
			additionalAttribute: "DefaultForComplex",
			defaultValueUndefined: false
		}, {
			key: "unit",
			label: "Unit",
			dataType: "String",
			additionalAttribute: "AttributeDefault",
			additionalComplexAttribute: null,
			additionalDefaultWithDeepPath: "",
			defaultValueUndefined: true
		}]);

		oPropertyHelper.destroy();
	});

	QUnit.test("Complex settings object not set", function(assert) {
		const aPropertyInfos = [{
			key: "prop",
			label: "prop",
			dataType: "String"
		}];
		const oPropertyHelper = new PropertyHelper(aPropertyInfos, null, {
			additionalAttribute: {
				type: {
					foo: {type: "string"}
				}
			}
		});

		this.deepEqualProperties(assert, oPropertyHelper, [{
			key: "prop",
			label: "prop",
			dataType: "String",
			additionalAttribute: null
		}]);

		oPropertyHelper.destroy();
	});

	QUnit.test("Complex settings object set to 'undefined'", function(assert) {
		const aPropertyInfos = [{
			key: "prop",
			label: "prop",
			dataType: "String",
			additionalAttribute: undefined
		}];
		const oPropertyHelper = new PropertyHelper(aPropertyInfos, null, {
			additionalAttribute: {
				type: {
					foo: {type: "string"}
				}
			}
		});

		this.deepEqualProperties(assert, oPropertyHelper, [{
			key: "prop",
			label: "prop",
			dataType: "String",
			additionalAttribute: null
		}]);

		oPropertyHelper.destroy();
	});

	QUnit.test("Complex settings object set to 'null'", function(assert) {
		const aPropertyInfos = [{
			key: "prop",
			label: "prop",
			dataType: "String",
			additionalAttribute: null
		}];
		const oPropertyHelper = new PropertyHelper(aPropertyInfos, null, {
			additionalAttribute: {
				type: {
					foo: {type: "string"}
				}
			}
		});

		this.deepEqualProperties(assert, oPropertyHelper, [{
			key: "prop",
			label: "prop",
			dataType: "String",
			additionalAttribute: null
		}]);

		oPropertyHelper.destroy();
	});

	QUnit.test("Property reference in a nested attribute defaults to another attribute", function(assert) {
		const oPropertyHelper = new PropertyHelper([{
			key: "complexProp",
			label: "Complex property",
			propertyInfos: ["prop"]
		}, {
			key: "prop",
			label: "Property",
			dataType: "String"
		}]);

		this.deepEqualProperties(assert, oPropertyHelper, [{
			key: "complexProp",
			label: "Complex property",
			propertyInfos: ["prop"]
		}, {
			key: "prop",
			label: "Property",
			dataType: "String"
		}]);

		oPropertyHelper.destroy();
	});

	QUnit.test("Property reference in a nested attribute defaults to another nested attribute", function(assert) {
		const oPropertyHelper = new PropertyHelper([{
			key: "propA",
			label: "Property A",
			dataType: "String",
			foo: {},
			bar: {
				props: ["propB"]
			}
		}, {
			key: "propB",
			label: "Property B",
			dataType: "String"
		}], null, {
			foo: {
				type: {
					props: {type: "PropertyReference[]", "default": {value: "attribute:bar.props"}}
				}
			},
			bar: {
				type: {
					props: {type: "PropertyReference[]"}
				}
			}
		});

		this.deepEqualProperties(assert, oPropertyHelper, [{
			key: "propA",
			label: "Property A",
			dataType: "String",
			foo: {props: ["propB"]},
			bar: {props: ["propB"]}
		}, {
			key: "propB",
			label: "Property B",
			dataType: "String",
			foo: null,
			bar: null
		}]);

		oPropertyHelper.destroy();
	});

	QUnit.test("Circular property reference", function(assert) {
		const oPropertyHelper = new PropertyHelper([{
			key: "propA",
			label: "Property A",
			dataType: "String",
			foo: "propB"
		}, {
			key: "propB",
			label: "Property B",
			dataType: "String",
			foo: "propA"
		}], null, {
			foo: {type: "PropertyReference"}
		});

		this.deepEqualProperties(assert, oPropertyHelper, [{
			key: "propA",
			label: "Property A",
			dataType: "String",
			foo: "propB"
		}, {
			key: "propB",
			label: "Property B",
			dataType: "String",
			foo: "propA"
		}]);

		oPropertyHelper.destroy();
	});

	QUnit.test("Propagation of 'allowed in complex property' to child attributes", function(assert){
		const oPropertyHelper = new PropertyHelper([{
			key: "prop",
			label: "prop",
			dataType: "String"
		}, {
			key: "complexProp",
			label: "Complex property",
			propertyInfos: ["prop"]
		}], null, {
			foo: {
				type: {
					bar: {
						type: {
							propA: {type: "string", "default": {value: "XYZ"}},
							propB: {type: "int", "default": {value: 2}, inComplexProperty: {allowed: false}}
						}
					}
				},
				"default": {value: {bar: {}}},
				inComplexProperty: {allowed: true}
			}
		});

		this.deepEqualProperties(assert, oPropertyHelper, [{
			key: "prop",
			label: "prop",
			dataType: "String",
			foo: {
				bar: {
					propA: "XYZ",
					propB: 2
				}
			}
		}, {
			key: "complexProp",
			label: "Complex property",
			propertyInfos: ["prop"],
			foo: {
				bar: {
					propA: "XYZ"
				}
			}
		}]);
	});

	QUnit.test("Prevent propagation of 'allowed in complex property' to child attributes", function(assert){
		const oPropertyHelper = new PropertyHelper([{
			key: "prop",
			label: "prop",
			dataType: "String"
		}, {
			key: "complexProp",
			label: "Complex property",
			propertyInfos: ["prop"]
		}], null, {
			foo: {
				type: {
					bar: {type: "string", "default": {value: "XYZ"}}
				},
				"default": {value: {}},
				inComplexProperty: {allowed: true, propagateAllowance: false}
			}
		});

		this.deepEqualProperties(assert, oPropertyHelper, [{
			key: "prop",
			label: "prop",
			dataType: "String",
			foo: {
				bar: "XYZ"
			}
		}, {
			key: "complexProp",
			label: "Complex property",
			propertyInfos: ["prop"],
			foo: {}
		}]);
	});

	QUnit.test("Ignore default values if ignoreIfNull = true", function(assert){
		const aPropertyInfos = [{
			key: "propX",
			label: "prop X",
			dataType: "String",
			foo: {
				bar: null,
				lot: undefined
			}
		}, {
			key: "propY",
			label: "prop Y",
			propertyInfos: ["propX"],
			foo: {
				bar: undefined,
				lot: "Test"
			}
		}, {
			key: "propK",
			label: "prop K",
			dataType: "String",
			foo: {
				bar: {
					propA: null,
					propB: null
				},
				lot: null
			}
		}, {
			key: "propZ",
			label: "prop Z",
			dataType: "String",
			foo: null
		}, {
			key: "propJ",
			label: "prop J",
			propertyInfos: ["propZ"],
			foo: undefined
		}];
		const oPropertyHelper = new PropertyHelper(aPropertyInfos, null, {
			foo: {
				type: {
					bar: {
						type: {
							propA: {type: "string", "default": {value: "XYZ"}},
							propB: {type: "int", "default": {value: 2, ignoreIfNull: true}}
						},
						"default": {value: {}, ignoreIfNull: true}
					},
					lot: {type: "string", "default": {ignoreIfNull: true}}
				},
				"default": {value: {}},
				inComplexProperty: {allowed: true}
			}
		});

		this.deepEqualProperties(assert, oPropertyHelper, [{
			key: "propX",
			label: "prop X",
			dataType: "String",
			foo: {
				bar: null,
				lot: ""
			}
		}, {
			key: "propY",
			label: "prop Y",
			propertyInfos: ["propX"],
			foo: {
				bar: {
					propA: "XYZ",
					propB: 2
				},
				lot: "Test"
			}
		}, {
			key: "propK",
			label: "prop K",
			dataType: "String",
			foo: {
				bar: {
					propA: "XYZ",
					propB: null
				},
				lot: null
			}
		}, {
			key: "propZ",
			label: "prop Z",
			dataType: "String",
			foo: {
				bar: {
					propA: "XYZ",
					propB: 2
				},
				lot: ""
			}
		}, {
			key: "propJ",
			label: "prop J",
			propertyInfos: ["propZ"],
			foo: {
				bar: {
					propA: "XYZ",
					propB: 2
				},
				lot: ""
			}
		}]);
	});

	QUnit.test("Don't modify original property infos", function(assert) {
		const aPropertyInfos = [{
			key: "prop",
			label: "prop",
			dataType: "String"
		}, {
			key: "complexProperty",
			label: "Complex property",
			propertyInfos: ["prop"]
		}];
		const oPropertyHelper = new PropertyHelper(aPropertyInfos);

		this.deepEqualProperties(assert, oPropertyHelper, [{
			key: "prop",
			label: "prop",
			dataType: "String"
		}, {
			key: "complexProperty",
			label: "Complex property",
			propertyInfos: ["prop"]
		}]);

		assert.deepEqual(aPropertyInfos, [{
			key: "prop",
			label: "prop",
			dataType: "String"
		}, {
			key: "complexProperty",
			label: "Complex property",
			propertyInfos: ["prop"]
		}], "Original property infos were not modified");

		oPropertyHelper.destroy();
	});

	QUnit.test("Cloning original property infos", function(assert) {
		const oStringType = new StringType();
		const aPropertyInfos = [{
			key: "prop",
			label: "prop",
			dataType: "String",
			exportSettings: {
				label: "exportLabel",
				width: 10
			}
		}, {
			key: "complexProperty",
			label: "Complex property",
			propertyInfos: ["prop"]
		}];
		const oPropertyHelper = new PropertyHelper(aPropertyInfos);
		const aClonedProperties = oPropertyHelper.getProperties();

		assert.notStrictEqual(aClonedProperties, aPropertyInfos, "Property info array was cloned");
		assert.notStrictEqual(aClonedProperties[0], aPropertyInfos[0], "Property object was cloned");
		assert.notStrictEqual(aClonedProperties[0].exportSettings, aPropertyInfos[0].exportSettings, "Setting of type 'object' was cloned");
		assert.notStrictEqual(aClonedProperties[1], aPropertyInfos[1], "Complex property was cloned");
		assert.notStrictEqual(aClonedProperties[1].propertyInfos, aPropertyInfos[1].propertyInfos,
			"Property infos array of complex property was cloned");

		oStringType.destroy();
		oPropertyHelper.destroy();
	});

	QUnit.test("Changing original property infos", function(assert) {
		const aPropertyInfos = [{
			key: "prop",
			label: "prop",
			dataType: "String",
			exportSettings: {
				label: "exportLabel",
				width: 10
			}
		}, {
			key: "complexProperty",
			label: "Complex property",
			propertyInfos: ["prop"]
		}];
		const oPropertyHelper = new PropertyHelper(aPropertyInfos);

		aPropertyInfos.push({
			key: "newProperty",
			label: "Newly added property"
		});
		aPropertyInfos[0].key = "newName";
		aPropertyInfos[0].exportSettings.width = 0;
		aPropertyInfos[1].propertyInfos.push("something");

		this.deepEqualProperties(assert, oPropertyHelper, [{
			key: "prop",
			label: "prop",
			dataType: "String",
			exportSettings: {
				label: "exportLabel",
				width: 10
			}
		}, {
			key: "complexProperty",
			label: "Complex property",
			propertyInfos: ["prop"]
		}], "Cloned property infos did not change");

		oPropertyHelper.destroy();
	});

	QUnit.test("Modifying default values in #prepareProperty", function(assert) {
		const MyPropertyHelper = PropertyHelper.extend("sap.ui.mdc.test.table.PropertyHelper", {
			prepareProperty: function(oProperty) {
				PropertyHelper.prototype.prepareProperty.apply(this, arguments);

				if (oProperty.key === "propA") {
					oProperty.myObject.myDefault = false;
					oProperty.myObject.newEntry = true;
					oProperty.myObjectArray[0].myDefault = false;
					oProperty.myObjectArray.push({newEntry: true});
					oProperty.myPropertyReferenceArray.push("propB");
				}
			}
		});
		const oPropertyHelper = new MyPropertyHelper([{
			key: "propA",
			label: "prop A",
			dataType: "String"
		}, {
			key: "propB",
			label: "prop B",
			dataType: "String"
		}], null, {
			myObject: {type: "object", "default": {value: {myDefault: true}}},
			myObjectArray: {type: "object[]", "default": {value: [{myDefault: true}]}},
			myPropertyReferenceArray: {type: "PropertyReference[]"}
		});

		this.deepEqualProperties(assert, oPropertyHelper, [{
			key: "propA",
			label: "prop A",
			dataType: "String",
			myObject: {myDefault: false, newEntry: true},
			myObjectArray: [{myDefault: false}, {newEntry: true}],
			myPropertyReferenceArray: ["propB"]
		}, {
			key: "propB",
			label: "prop B",
			dataType: "String",
			myObject: {myDefault: true},
			myObjectArray: [{myDefault: true}],
			myPropertyReferenceArray: []
		}], "Modifying the default value in does not affect other properties with default values");

		oPropertyHelper.destroy();
	});

	QUnit.test("Cloning of non-enumerable attributes", function(assert) {
		const aPropertyInfos = [{
			key: "prop",
			label: "prop",
			dataType: "String"
		}];
		Object.defineProperty(aPropertyInfos[0], "foo", {
			value: "bar"
		});
		const oPropertyHelper = new PropertyHelper(aPropertyInfos);

		this.deepEqualProperties(assert, oPropertyHelper, [{
			key: "prop",
			label: "prop",
			dataType: "String"
		}], "Cloned property infos");
		assert.notOk(oPropertyHelper.getProperties()[0].hasOwnProperty("foo"), "The non-enumerable attribute was not cloned");

		oPropertyHelper.destroy();
	});

	QUnit.module("Attribute overrides of dynamic properties", {
		before: function() {
			this.oPropertyHelperParent = new TestControl();
			this.oPropertyHelper = new PropertyHelper([{
				key: "staticSimpleProperty",
				label: "Static Simple Property",
				dataType: "String"
			}, {
				key: "activeDynamicSimpleProperty",
				label: "Active Dynamic Simple Property",
				dataType: "String",
				isActive: true
			}, {
				key: "inactiveDynamicSimpleProperty",
				label: "Inactive Dynamic Simple Property",
				dataType: "String",
				isActive: false
			}, {
				key: "staticComplexProperty",
				label: "Static Complex Property",
				propertyInfos: ["staticSimpleProperty"]
			}, {
				key: "activeDynamicComplexProperty",
				label: "Active Dynamic Complex Property",
				propertyInfos: ["staticSimpleProperty"],
				isActive: true
			}, {
				key: "inactiveDynamicComplexProperty",
				label: "Inactive Dynamic Complex Property",
				propertyInfos: ["staticSimpleProperty"],
				isActive: false
			}], this.oPropertyHelperParent, {
				isActive: true
			});
		},
		after: function() {
			this.oPropertyHelperParent.destroy();
			this.oPropertyHelper.destroy();
		}
	});

	QUnit.test("Without a parent", function(assert) {
		const oPropertyHelper = new PropertyHelper([{
			key: "activeDynamicSimpleProperty",
			label: "Active Dynamic Simple Property",
			dataType: "String",
			isActive: true
		}], null, {
			isActive: true
		});
		const oDynamicProperty = oPropertyHelper.getProperty("activeDynamicSimpleProperty");
		const oLabelDescriptor = Object.getOwnPropertyDescriptor(oDynamicProperty, "label");

		assert.strictEqual(oDynamicProperty.label, "Active Dynamic Simple Property",
			"Dynamic property label is not overridden without a parent");
		assert.ok(oLabelDescriptor && "value" in oLabelDescriptor, "Label is a value property without a parent");
		assert.strictEqual(oLabelDescriptor.get, undefined, "Label has no getter override without a parent");

		oPropertyHelper.destroy();
	});

	QUnit.test("Overrides of static properties", function(assert) {
		const oEngine = {
			readXConfig: sinon.stub().returns({
				aggregations: {
					propertyInfo: {
						staticSimpleProperty: {
							label: "Overridden Static Simple Property",
							tooltip: "Overridden Static Simple Tooltip"
						},
						staticComplexProperty: {
							label: "Overridden Static Complex Property",
							tooltip: "Overridden Static Complex Tooltip"
						}
					}
				}
			})
		};
		const oGetEngineStub = sinon.stub(this.oPropertyHelperParent, "getEngine").returns(oEngine);
		const oStaticSimpleProperty = this.oPropertyHelper.getProperty("staticSimpleProperty");
		const oStaticComplexProperty = this.oPropertyHelper.getProperty("staticComplexProperty");

		assert.strictEqual(oStaticSimpleProperty.label, "Static Simple Property", "Static simple property ignores overrides");
		assert.strictEqual(oStaticSimpleProperty.tooltip, "", "Static simple property retains original tooltip");
		assert.strictEqual(oStaticComplexProperty.label, "Static Complex Property", "Static complex property ignores overrides");
		assert.strictEqual(oStaticComplexProperty.tooltip, "", "Static complex property retains original tooltip");

		oGetEngineStub.restore();
	});

	QUnit.test("Overrides of dynamic properties", function(assert) {
		const oEngine = {
			readXConfig: sinon.stub().returns({
				propertyInfo: {
					activeDynamicSimpleProperty: {
						label: "Overridden Dynamic Simple Property",
						tooltip: "Overridden Dynamic Simple Tooltip",
						key: "OverriddenKey"
					},
					activeDynamicComplexProperty: {
						label: "Overridden Dynamic Complex Property",
						tooltip: "Overridden Dynamic Complex Tooltip"
					}
				}
			})
		};
		const oGetEngineStub = sinon.stub(this.oPropertyHelperParent, "getEngine").returns(oEngine);
		const oActiveDynamicSimpleProperty = this.oPropertyHelper.getProperty("activeDynamicSimpleProperty");
		const oActiveDynamicComplexProperty = this.oPropertyHelper.getProperty("activeDynamicComplexProperty");
		const oLabelDescriptor = Object.getOwnPropertyDescriptor(oActiveDynamicSimpleProperty, "label");
		const oKeyDescriptor = Object.getOwnPropertyDescriptor(oActiveDynamicSimpleProperty, "key");

		assert.strictEqual(oActiveDynamicSimpleProperty.label, "Overridden Dynamic Simple Property",
			"Dynamic simple property uses XConfig override for label");
		assert.strictEqual(oActiveDynamicSimpleProperty.tooltip, "Overridden Dynamic Simple Tooltip",
			"Dynamic simple property uses XConfig override for tooltip");
		assert.strictEqual(oActiveDynamicSimpleProperty.dataType, "String",
			"Dynamic simple property retains original dataType when not overridden");
		assert.strictEqual(oActiveDynamicSimpleProperty.key, "activeDynamicSimpleProperty",
			"Dynamic property key is not overridden");
		assert.strictEqual(typeof oLabelDescriptor.get, "function", "Dynamic property label uses a getter override");
		assert.strictEqual(oKeyDescriptor.get, undefined, "Dynamic property key remains a value property");
		assert.strictEqual(oActiveDynamicComplexProperty.label, "Overridden Dynamic Complex Property",
			"Dynamic complex property uses XConfig override for label");
		assert.strictEqual(oActiveDynamicComplexProperty.tooltip, "Overridden Dynamic Complex Tooltip",
			"Dynamic complex property uses XConfig override for tooltip");
		assert.deepEqual(oActiveDynamicComplexProperty.propertyInfos, ["staticSimpleProperty"],
			"Dynamic complex property retains original propertyInfos when not overridden");

		oGetEngineStub.restore();
	});

	QUnit.test("Dynamic properties without overrides", function(assert) {
		const oEngine = {
			readXConfig: sinon.stub().returns(undefined)
		};
		const oGetEngineStub = sinon.stub(this.oPropertyHelperParent, "getEngine").returns(oEngine);
		const oActiveDynamicSimpleProperty = this.oPropertyHelper.getProperty("activeDynamicSimpleProperty");

		assert.strictEqual(oActiveDynamicSimpleProperty.label, "Active Dynamic Simple Property",
			"Dynamic property falls back to original label when XConfig is missing");
		assert.strictEqual(oActiveDynamicSimpleProperty.tooltip, "",
			"Dynamic property falls back to original tooltip when XConfig is missing");

		oGetEngineStub.restore();
	});

	QUnit.module("Reference to a parent");

	QUnit.test("Without a parent", function(assert) {
		let oPropertyHelper = new PropertyHelper([]);
		assert.strictEqual(oPropertyHelper.getParent(), null, "The property helper has no parent");
		oPropertyHelper.destroy();

		oPropertyHelper = new PropertyHelper([], null, null);
		assert.strictEqual(oPropertyHelper.getParent(), null, "The property helper has no parent");
		oPropertyHelper.destroy();
	});

	QUnit.test("With a valid parent", function(assert) {
		const oParent = new TestControl();
		const oPropertyHelper = new PropertyHelper([], oParent);

		assert.strictEqual(oPropertyHelper.getParent(), oParent, "#getParent returns the reference to the parent");

		oPropertyHelper.destroy();
		assert.strictEqual(oPropertyHelper.getParent(), null, "#getParent no longer returns the parent after destroying the property helper");

		oParent.destroy();
	});

	QUnit.test("With an invalid parent", function(assert) {
		assert.throws(function() {
			new PropertyHelper([], new (MDCControl.getMetadata().getParent().getClass())());
		}, new Error("The type of the parent is invalid."), "Error thrown if the type of the parent is invalid");

		assert.throws(function() {
			new PropertyHelper([], {});
		}, new Error("The type of the parent is invalid."), "Error thrown if the parent is a plain object");
	});

	QUnit.module("Immutability of property infos", {
		before: function() {
			this.oPropertyHelper = new PropertyHelper([{
				key: "prop",
				label: "Property",
				dataType: "String",
				additionalAttribute: {
					object: {
						object: {}
					},
					array: [{}],
					func: function() {}
				}
			}, {
				key: "complexProp",
				label: "Complex property",
				propertyInfos: ["prop", "otherProp"]
			}, {
				key: "otherProp",
				label: "My other property",
				dataType: "String"
			}], null, {
				additionalAttribute: {type: "object"}
			});
		},
		after: function() {
			this.oPropertyHelper.destroy();
		}
	});

	QUnit.test("Property", function(assert) {
		const oProp = this.oPropertyHelper.getProperty("prop");
		const oComplexProp = this.oPropertyHelper.getProperty("complexProp");
		const oOtherProp = this.oPropertyHelper.getProperty("otherProp");

		assert.ok(Object.isFrozen(oProp, "Simple property is frozen"));
		assert.ok(Object.isFrozen(oComplexProp), "Complex property is frozen");
		assert.ok(Object.isFrozen(oOtherProp), "Simple property referenced by complex property is frozen");
		assert.ok(Object.isFrozen(oComplexProp.propertyInfos), "Attribute 'propertyInfos' is frozen");
		assert.ok(Object.isFrozen(oProp.additionalAttribute), "Plain object attribute is frozen");
		assert.ok(Object.isFrozen(oProp.additionalAttribute.object), "Plain object attribute: Nested object is frozen");
		assert.ok(Object.isFrozen(oProp.additionalAttribute.object.object), "Plain object attribute: Deeply nested object is frozen");
		assert.ok(Object.isFrozen(oProp.additionalAttribute.array), "Plain object attribute: Nested array is frozen");
		assert.ok(Object.isFrozen(oProp.additionalAttribute.array[0]), "Plain object attribute: Object in nested array is frozen");
		assert.ok(Object.isFrozen(oProp.additionalAttribute.func), "Function attribute is frozen");
	});

	QUnit.test("Property info array", function(assert) {
		const aProperties = this.oPropertyHelper.getProperties();

		assert.ok(Object.isFrozen(aProperties), "The property infos array is frozen");
		assert.ok(Object.isFrozen(aProperties[0]), "Simple property is frozen");
		assert.ok(Object.isFrozen(aProperties[1]), "Complex property is frozen");
		assert.ok(Object.isFrozen(aProperties[2]), "Simple property referenced by a complex property is frozen");
		assert.ok(Object.isFrozen(aProperties[1].getSimpleProperties()[0]), "Properties returned by 'getSimpleProperties' are frozen");
		assert.ok(Object.isFrozen(aProperties[0].additionalAttribute), "Object attributes are frozen");
		assert.ok(Object.isFrozen(aProperties[0].additionalAttribute.object), "Objects nested in object attributes are frozen");
		assert.ok(Object.isFrozen(aProperties[0].additionalAttribute.object.object), "Objects deeply nested in object attributes are frozen");
		assert.ok(Object.isFrozen(aProperties[0].additionalAttribute.array), "Arrays nested in object attributes are frozen");
		assert.ok(Object.isFrozen(aProperties[0].additionalAttribute.array[0]), "Objects in arrays nested in object attributes are frozen");
	});

	QUnit.test("Property info map", function(assert) {
		const mPropertyMap = this.oPropertyHelper.getPropertyMap();

		assert.ok(Object.isFrozen(mPropertyMap), "The property map is frozen");
		assert.ok(Object.isFrozen(mPropertyMap.prop), "Simple property is frozen");
		assert.ok(Object.isFrozen(mPropertyMap.complexProp), "Complex property is frozen");
		assert.ok(Object.isFrozen(mPropertyMap.otherProp), "Simple property referenced by a complex property is frozen");
		assert.ok(Object.isFrozen(mPropertyMap.complexProp.getSimpleProperties()[0]), "Properties returned by 'getSimpleProperties' are frozen");
		assert.ok(Object.isFrozen(mPropertyMap.prop.additionalAttribute), "Object attributes are frozen");
		assert.ok(Object.isFrozen(mPropertyMap.prop.additionalAttribute.object), "Objects nested in object attributes are frozen");
		assert.ok(Object.isFrozen(mPropertyMap.prop.additionalAttribute.object.object), "Objects deeply nested in object attributes are frozen");
		assert.ok(Object.isFrozen(mPropertyMap.prop.additionalAttribute.array), "Arrays nested in object attributes are frozen");
		assert.ok(Object.isFrozen(mPropertyMap.prop.additionalAttribute.array[0]), "Objects in arrays nested in object attributes are frozen");
	});

	QUnit.module("API", {
		beforeEach: function() {
			this.aOriginalProperties = [{
				key: "propA",
				label: "Property A",
				dataType: "String",
				path: "propAPath",
				unit: "propB",
				groupLabel: "Property A group label",
				exportSettings: {
					width: 20,
					label: "Property A export label"
				},
				maxConditions: 2
			}, {
				key: "propB",
				label: "Property B",
				dataType: "String",
				sortable: false,
				filterable: false,
				visible: false
			}, {
				key: "complexPropA",
				label: "Complex Property A",
				propertyInfos: ["propA", "propB"],
				groupLabel: "Complex Property A group label",
				exportSettings: {
					width: 30,
					label: "Complex Property A export label"
				}
			}, {
				key: "complexPropB",
				label: "Complex Property B",
				propertyInfos: ["propB"],
				visible: false
			}, {
				key: "complexPropC",
				label: "Complex Property C",
				propertyInfos: ["propB"]
			}, {
				key: "complexPropD",
				label: "Complex Property C",
				propertyInfos: ["propA"],
				visible: false
			}];
			this.oPropertyHelper = new PropertyHelper(this.aOriginalProperties);
			this.aProperties = this.oPropertyHelper.getProperties();
		},
		afterEach: function() {
			this.oPropertyHelper.destroy();
		}
	});

	QUnit.test("getProperties", function(assert) {
		const aProperties = this.oPropertyHelper.getProperties();

		assert.equal(aProperties.length, this.aOriginalProperties.length,
			"The property array contains as many entries as there are properties");

		this.aOriginalProperties.forEach(function(oOriginalProperty, iIndex) {
			assert.strictEqual(aProperties[iIndex].key, oOriginalProperty.key,
				"The property array references the correct property at index " + iIndex);
		});

		this.oPropertyHelper.destroy();
		assert.deepEqual(this.oPropertyHelper.getProperties(), [], "After destruction");
	});

	QUnit.test("setProperties", function(assert) {
		const oValidatePropertiesSpy = sinon.spy();
		const oValidatePropertySpy = sinon.spy();

		const aUpdatedProperties = [...this.aOriginalProperties, {
			key: "ReplacedPropA",
			label: "Replaced Property A",
			dataType: "String",
			sortable: false,
			filterable: false,
			visible: false
		}, {
			key: "ReplacedPropB",
			label: "Replaced Property B",
			dataType: "String",
			sortable: false,
			filterable: false,
			visible: false
		}];

		const MyPropertyHelper = PropertyHelper.extend("sap.ui.mdc.test.table.PropertyHelper", {
			validateProperties: function() {
				PropertyHelper.prototype.validateProperties.apply(this, arguments);
				oValidatePropertiesSpy.apply(this, merge([], arguments));
			},
			validateProperty: function() {
				PropertyHelper.prototype.validateProperty.apply(this, arguments);
				oValidatePropertySpy.apply(this, merge([], arguments));
			}
		});
		const oMyPropertyHelper = new MyPropertyHelper(this.aOriginalProperties);

		oValidatePropertiesSpy.resetHistory();
		oValidatePropertySpy.resetHistory();
		oMyPropertyHelper.setProperties(aUpdatedProperties);
		const aProperties = oMyPropertyHelper.getProperties();

		assert.equal(aProperties.length, aUpdatedProperties.length,
			"The property array contains as many entries as there are replaced properties");
			aUpdatedProperties.forEach(function(oReplacementProperty, iIndex) {
			assert.strictEqual(aProperties[iIndex].key, oReplacementProperty.key,
				"The property array references the correct replaced property at index " + iIndex);
		});
		assert.ok(oValidatePropertiesSpy.calledOnceWithExactly(aUpdatedProperties, this.aOriginalProperties),
			"#validateProperties called once with the correct arguments");
		assert.equal(oValidatePropertySpy.callCount, aUpdatedProperties.length, "#validateProperty called for every incoming property");
		assert.ok(oValidatePropertySpy.getCall(0).calledWithExactly(aUpdatedProperties[0], aUpdatedProperties, this.aOriginalProperties),
			"Arguments of first call");
		assert.ok(oValidatePropertySpy.getCall(1).calledWithExactly(aUpdatedProperties[1], aUpdatedProperties, this.aOriginalProperties),
			"Arguments of first call");

		assert.throws(function() {
			oMyPropertyHelper.setProperties();
		}, new Error("Invalid property definition: Property infos must be an array."));

		oMyPropertyHelper.destroy();
	});

	QUnit.test("getPropertyMap", function(assert) {
		const mProperties = this.oPropertyHelper.getPropertyMap();

		assert.equal(Object.keys(mProperties).length, this.aOriginalProperties.length,
			"The property map contains as many entries as there are properties");

		this.aProperties.forEach(function(oProperty) {
			assert.strictEqual(mProperties[oProperty.key], oProperty,
				"The map references the correct property for the key '" + oProperty.key + "'");
		});

		this.oPropertyHelper.destroy();
		assert.deepEqual(this.oPropertyHelper.getPropertyMap(), {}, "After destruction");
	});

	QUnit.test("getProperty", function(assert) {
		assert.strictEqual(this.oPropertyHelper.getProperty(), null, "No arguments");
		assert.strictEqual(this.oPropertyHelper.getProperty({}), null, "Empty object");
		assert.strictEqual(this.oPropertyHelper.getProperty("propA"), this.aProperties[0], "Name of a simple property");
		assert.strictEqual(this.oPropertyHelper.getProperty(this.aProperties[0]), null, "Simple property");
		assert.strictEqual(this.oPropertyHelper.getProperty("complexPropA"), this.aProperties[2], "Name of a complex property");
		assert.strictEqual(this.oPropertyHelper.getProperty(this.aProperties[2]), null, "Complex property");
		assert.strictEqual(this.oPropertyHelper.getProperty("unknownProp"), null, "Unknown property key");
		assert.strictEqual(this.oPropertyHelper.getProperty({
			key: "propA",
			label: "Property"
		}), null, "Unknown simple property");
		assert.strictEqual(this.oPropertyHelper.getProperty({
			key: "complexPropA",
			label: "Complex Property",
			propertyInfos: ["propA", "propB"]
		}), null, "Unknown complex property");

		this.oPropertyHelper.destroy();
		assert.strictEqual(this.oPropertyHelper.getProperty("propA"), null, "After destruction");
	});

	QUnit.test("hasProperty", function(assert) {
		assert.strictEqual(this.oPropertyHelper.hasProperty(), false, "No arguments");
		assert.strictEqual(this.oPropertyHelper.hasProperty({}), false, "Empty object");
		assert.strictEqual(this.oPropertyHelper.hasProperty("propA"), true, "Name of a simple property");
		assert.strictEqual(this.oPropertyHelper.hasProperty(this.aProperties[0]), false, "Simple property");
		assert.strictEqual(this.oPropertyHelper.hasProperty("complexPropA"), true, "Name of a complex property");
		assert.strictEqual(this.oPropertyHelper.hasProperty(this.aProperties[2]), false, "Complex property");
		assert.strictEqual(this.oPropertyHelper.hasProperty("unknownProp"), false, "Unknown property key");
		assert.strictEqual(this.oPropertyHelper.hasProperty({
			key: "propA",
			label: "Property"
		}), false, "Unknown simple property");
		assert.strictEqual(this.oPropertyHelper.hasProperty({
			key: "complexPropA",
			label: "Complex Property",
			propertyInfos: ["propA", "propB"]
		}), false, "Unknown complex property");

		this.oPropertyHelper.destroy();
		assert.strictEqual(this.oPropertyHelper.hasProperty("propA"), false, "After destruction");
	});

	QUnit.test("isPropertyComplex", function(assert) {
		assert.strictEqual(_PropertyHelper.isPropertyComplex(), undefined, "No arguments");
		assert.strictEqual(_PropertyHelper.isPropertyComplex({}), false, "Empty object");
		assert.strictEqual(_PropertyHelper.isPropertyComplex("propA"), undefined, "Name of a simple property");
		assert.strictEqual(_PropertyHelper.isPropertyComplex(this.aProperties[0]), false, "Known simple property");
		assert.strictEqual(_PropertyHelper.isPropertyComplex("complexPropA"), undefined, "Name of a complex property");
		assert.strictEqual(_PropertyHelper.isPropertyComplex(this.aProperties[2]), true, "Known complex property");
		assert.strictEqual(_PropertyHelper.isPropertyComplex("unknownProp"), undefined, "Unknown property key");
		assert.strictEqual(_PropertyHelper.isPropertyComplex({
			key: "propA",
			label: "Property"
		}), false, "Unknown simple property");
		assert.strictEqual(_PropertyHelper.isPropertyComplex({
			key: "complexPropA",
			label: "Complex Property",
			propertyInfos: ["propA", "propB"]
		}), true, "Unknown complex property");
		assert.strictEqual(_PropertyHelper.isPropertyComplex({
			propertyInfos: ["propA"]
		}), true, "Property-like object with correct structure");

		this.oPropertyHelper.destroy();
		assert.strictEqual(_PropertyHelper.isPropertyComplex({
			key: "complexPropA",
			label: "Complex Property",
			propertyInfos: ["propA", "propB"]
		}), true, "After destruction");
	});

	QUnit.test("throwInvalidPropertyError", function(assert) {
		assert.throws(() => {
			_PropertyHelper.throwInvalidPropertyError = function() { };
		}, "Trying to override the function throws an error");

		assert.throws(() => {
			_PropertyHelper.throwInvalidPropertyError();
		}, new Error("Invalid property definition: undefined"), "No arguments");

		assert.throws(() => {
			_PropertyHelper.throwInvalidPropertyError("Oh no...");
		}, new Error("Invalid property definition: Oh no..."), "Error message");

		assert.throws(() => {
			_PropertyHelper.throwInvalidPropertyError("Oh no...", this.oPropertyHelper.getProperties()[0]);
		}, new Error("Invalid property definition for property with key 'propA': Oh no..."), "Error message and property");
	});

	QUnit.test("_getAttributeMetadata", function(assert) {
		const mOriginalMetadata = merge({}, this.oPropertyHelper._getAttributeMetadata());

		this.oPropertyHelper._getAttributeMetadata().key.type = "YAY!";
		assert.deepEqual(mOriginalMetadata, this.oPropertyHelper._getAttributeMetadata(),
			"Manipulations of the returned metadata information do not affect the property helper");
	});

	QUnit.test("getRedundantProperties", function(assert) {
		const aRedundantProperties = this.oPropertyHelper.getRedundantProperties();

		assert.ok(Array.isArray(aRedundantProperties), "Returns an array");
		assert.equal(aRedundantProperties.length, 0, "Returns an empty array");
	});

	QUnit.module("API with dynamic properties", {
		beforeEach: function() {
			this.aOriginalProperties = [{
				key: "staticSimpleProperty",
				label: "Static Simple Property",
				dataType: "String"
			}, {
				key: "activeDynamicSimpleProperty",
				label: "Active Dynamic Simple Property",
				dataType: "String",
				isActive: true
			}, {
				key: "inactiveDynamicSimpleProperty",
				label: "Inactive Dynamic Simple Property",
				dataType: "String",
				isActive: false
			}, {
				key: "staticComplexProperty",
				label: "Static Complex Property",
				propertyInfos: ["staticSimpleProperty"]
			}, {
				key: "activeDynamicComplexProperty",
				label: "Active Dynamic Complex Property",
				propertyInfos: ["staticSimpleProperty"],
				isActive: true
			}, {
				key: "inactiveDynamicComplexProperty",
				label: "Inactive Dynamic Complex Property",
				propertyInfos: ["staticSimpleProperty"],
				isActive: false
			}];
			this.aOriginalActiveProperties = this.aOriginalProperties.filter((oProperty) => oProperty.isActive !== false);
			this.oPropertyHelper = new PropertyHelper(this.aOriginalProperties, null, {
				isActive: true
			});
			this.aProperties = this.oPropertyHelper.getProperties();
		},
		afterEach: function() {
			this.oPropertyHelper.destroy();
		}
	});

	QUnit.test("getProperties", function(assert) {
		const aProperties = this.oPropertyHelper.getProperties();

		assert.equal(aProperties.length, this.aOriginalActiveProperties.length,
			"The property array contains as many entries as there are active properties");

		this.aOriginalActiveProperties.forEach(function(oOriginalProperty, iIndex) {
			assert.strictEqual(aProperties[iIndex].key, oOriginalProperty.key,
				"The property array references the correct property at index " + iIndex);
		});

		assert.ok(Object.isFrozen(aProperties), "Returned array is frozen");
	});

	QUnit.test("getPropertyMap", function(assert) {
		const mProperties = this.oPropertyHelper.getPropertyMap();

		assert.equal(Object.keys(mProperties).length, this.aOriginalActiveProperties.length,
			"The property map contains as many entries as there are active properties");

		this.aProperties.forEach(function(oProperty) {
			assert.strictEqual(mProperties[oProperty.key], oProperty,
				"The map references the correct property for the key '" + oProperty.key + "'");
		});

		assert.ok(Object.isFrozen(mProperties), "Returned map is frozen");
	});

	QUnit.test("getProperty", function(assert) {
		assert.strictEqual(this.oPropertyHelper.getProperty("staticSimpleProperty"), this.aProperties[0],
			"Static simple property");
		assert.strictEqual(this.oPropertyHelper.getProperty("activeDynamicSimpleProperty"), this.aProperties[1],
			"Dynamic active simple property");
		assert.strictEqual(this.oPropertyHelper.getProperty("inactiveDynamicSimpleProperty"), null,
			"Dynamic inactive simple property");
		assert.strictEqual(this.oPropertyHelper.getProperty("staticComplexProperty"), this.aProperties[2],
			"Static complex property");
		assert.strictEqual(this.oPropertyHelper.getProperty("activeDynamicComplexProperty"), this.aProperties[3],
			"Dynamic active complex property");
		assert.strictEqual(this.oPropertyHelper.getProperty("inactiveDynamicComplexProperty"), null,
			"Dynamic inactive complex property");
	});

	QUnit.test("hasProperty", function(assert) {
		assert.strictEqual(this.oPropertyHelper.hasProperty("staticSimpleProperty"), true,
			"Static simple property");
		assert.strictEqual(this.oPropertyHelper.hasProperty("activeDynamicSimpleProperty"), true,
			"Dynamic active simple property");
		assert.strictEqual(this.oPropertyHelper.hasProperty("inactiveDynamicSimpleProperty"), false,
			"Dynamic inactive simple property");
		assert.strictEqual(this.oPropertyHelper.hasProperty("staticComplexProperty"), true,
			"Static complex property");
		assert.strictEqual(this.oPropertyHelper.hasProperty("activeDynamicComplexProperty"), true,
			"Dynamic active complex property");
		assert.strictEqual(this.oPropertyHelper.hasProperty("inactiveDynamicComplexProperty"), false,
			"Dynamic inactive complex property");
	});

	QUnit.test("getProperties with bIncludeInactive=true", function(assert) {
		const aAllProperties = this.oPropertyHelper.getProperties(true);

		assert.equal(aAllProperties.length, this.aOriginalProperties.length,
			"Returns all properties including inactive");

		this.aOriginalProperties.forEach(function(oOriginalProperty, iIndex) {
			assert.strictEqual(aAllProperties[iIndex].key, oOriginalProperty.key,
				"Property at index " + iIndex + " has key '" + oOriginalProperty.key + "'");
		});

		assert.ok(Object.isFrozen(aAllProperties), "Returned array is frozen");
	});

	QUnit.test("getPropertyMap with bIncludeInactive=true", function(assert) {
		const mAllProperties = this.oPropertyHelper.getPropertyMap(true);

		assert.equal(Object.keys(mAllProperties).length, this.aOriginalProperties.length,
			"Map contains all properties including inactive");
		assert.ok(mAllProperties.inactiveDynamicSimpleProperty, "Inactive simple property included in map");
		assert.ok(mAllProperties.inactiveDynamicComplexProperty, "Inactive complex property included in map");
		assert.ok(Object.isFrozen(mAllProperties), "Returned map is frozen");
	});

	QUnit.test("getProperty with bIncludeInactive=true", function(assert) {
		assert.ok(this.oPropertyHelper.getProperty("inactiveDynamicSimpleProperty", true) !== null,
			"Inactive simple property returned when bIncludeInactive=true");
		assert.ok(this.oPropertyHelper.getProperty("inactiveDynamicComplexProperty", true) !== null,
			"Inactive complex property returned when bIncludeInactive=true");
		assert.strictEqual(this.oPropertyHelper.getProperty("activeDynamicSimpleProperty", true).key,
			"activeDynamicSimpleProperty", "Active property still returned with bIncludeInactive=true");
		assert.strictEqual(this.oPropertyHelper.getProperty("unknownProp", true), null,
			"Unknown property returns null even with bIncludeInactive=true");
	});

	QUnit.module("Memoization of getProperties / getPropertyMap", {
		afterEach: function() {
			this.oPropertyHelper?.destroy();
		}
	});

	QUnit.test("Aggregation mode: Repeated getProperties returns the same array reference", function(assert) {
		this.oPropertyHelper = new PropertyHelper([
			{key: "p1", label: "P1", dataType: "String"},
			{key: "p2", label: "P2", dataType: "String"}
		]);

		const aFirst = this.oPropertyHelper.getProperties();
		const aSecond = this.oPropertyHelper.getProperties();

		assert.strictEqual(aFirst, aSecond, "Same array reference returned on repeated calls");
		assert.ok(Object.isFrozen(aFirst), "Returned array is frozen");
	});

	QUnit.test("Aggregation mode: Repeated getProperties(true) returns the same array reference", function(assert) {
		this.oPropertyHelper = new PropertyHelper([
			{key: "p1", label: "P1", dataType: "String"}
		]);

		assert.strictEqual(this.oPropertyHelper.getProperties(true), this.oPropertyHelper.getProperties(true),
			"Same array reference returned on repeated calls with bIncludeInactive=true");
	});

	QUnit.test("Aggregation mode: Repeated getPropertyMap returns the same object reference", function(assert) {
		this.oPropertyHelper = new PropertyHelper([
			{key: "p1", label: "P1", dataType: "String"}
		]);

		const mFirst = this.oPropertyHelper.getPropertyMap();
		const mSecond = this.oPropertyHelper.getPropertyMap();

		assert.strictEqual(mFirst, mSecond, "Same map reference returned on repeated calls");
		assert.ok(Object.isFrozen(mFirst), "Returned map is frozen");
	});

	QUnit.test("Aggregation mode: Repeated getPropertyMap(true) returns the same object reference", function(assert) {
		this.oPropertyHelper = new PropertyHelper([
			{key: "p1", label: "P1", dataType: "String"}
		]);

		const mFirst = this.oPropertyHelper.getPropertyMap(true);
		const mSecond = this.oPropertyHelper.getPropertyMap(true);

		assert.strictEqual(mFirst, mSecond, "Same map reference returned on repeated calls");
		assert.ok(Object.isFrozen(mFirst), "Returned map is frozen");
	});

	QUnit.test("setProperties invalidates the cache", function(assert) {
		this.oPropertyHelper = new PropertyHelper([
			{key: "p1", label: "P1", dataType: "String"}
		]);

		const aBefore = this.oPropertyHelper.getProperties();
		const mBefore = this.oPropertyHelper.getPropertyMap();
		this.oPropertyHelper.setProperties([
			{key: "p1", label: "P1", dataType: "String"},
			{key: "p2", label: "P2", dataType: "String"}
		]);
		const aAfter = this.oPropertyHelper.getProperties();
		const mAfter = this.oPropertyHelper.getPropertyMap();

		assert.notStrictEqual(aBefore, aAfter, "getProperties returns a new reference after setProperties");
		assert.notStrictEqual(mBefore, mAfter, "getPropertyMap returns a new reference after setProperties");
		assert.equal(aAfter.length, 2, "New property included");
	});

	QUnit.test("PropertyHelper without dynamic properties does not call readXConfig", function(assert) {
		// Build a parent stub with isInPropertyKeysMode === true but properties have no isActive.
		// bHasDynamicProperties must remain false; refreshActiveCacheIfStale must be a no-op.
		let iReadXConfigCallCount = 0;
		const oParentStub = new (MDCControl.extend("test.MockMdcControlNoIsActive", {}))();
		oParentStub.isInPropertyKeysMode = () => true;
		oParentStub.getEngine = () => ({
			readXConfig: () => {
				iReadXConfigCallCount++;
				return {};
			}
		});

		this.oPropertyHelper = new PropertyHelper([
			{key: "p1", label: "P1", dataType: "String"},
			{key: "p2", label: "P2", dataType: "String"}
		], oParentStub);

		this.oPropertyHelper.getProperties();
		this.oPropertyHelper.getProperties();
		this.oPropertyHelper.getPropertyMap();
		this.oPropertyHelper.getPropertyMap();

		assert.equal(iReadXConfigCallCount, 0, "readXConfig was not called");

		oParentStub.destroy();
	});

	QUnit.test("Property keys mode: Cache hit when xConfig identity is stable", function(assert) {
		const oFrozenXConfig = {propertyInfo: {}};
		const oParentStub = new (MDCControl.extend("test.MockMdcControlStableXConfig", {}))();
		oParentStub.isInPropertyKeysMode = () => true;
		oParentStub.getEngine = () => ({
			readXConfig: () => oFrozenXConfig
		});

		this.oPropertyHelper = new PropertyHelper([
			{key: "p1", label: "P1", dataType: "String", isActive: true},
			{key: "p2", label: "P2", dataType: "String", isActive: false}
		], oParentStub, {isActive: true});

		const aFirst = this.oPropertyHelper.getProperties();
		const aSecond = this.oPropertyHelper.getProperties();
		const mFirst = this.oPropertyHelper.getPropertyMap();
		const mSecond = this.oPropertyHelper.getPropertyMap();

		assert.strictEqual(aFirst, aSecond, "getProperties returns the same reference when xConfig is stable");
		assert.strictEqual(mFirst, mSecond, "getPropertyMap returns the same reference when xConfig is stable");

		oParentStub.destroy();
	});

	QUnit.test("Property keys mode: Caches invalidate when xConfig identity changes", function(assert) {
		let oCurrentXConfig = {propertyInfo: {}};
		const oParentStub = new (MDCControl.extend("test.MockMdcControlChangingXConfig", {}))();
		oParentStub.isInPropertyKeysMode = () => true;
		oParentStub.getEngine = () => ({
			readXConfig: () => oCurrentXConfig
		});

		this.oPropertyHelper = new PropertyHelper([
			{key: "p1", label: "P1", dataType: "String", isActive: true},
			{key: "p2", label: "P2", dataType: "String", isActive: true}
		], oParentStub, {isActive: true});

		const aBefore = this.oPropertyHelper.getProperties();
		const mBefore = this.oPropertyHelper.getPropertyMap();
		assert.deepEqual(aBefore.map((p) => p.key), ["p1", "p2"], "Both properties active before xConfig change");
		assert.deepEqual(Object.keys(mBefore), ["p1", "p2"], "Property map contains both keys before xConfig change");

		// Simulate xConfig commit
		oCurrentXConfig = {propertyInfo: {p1: {isActive: false}}};

		const aAfter = this.oPropertyHelper.getProperties();
		const mAfter = this.oPropertyHelper.getPropertyMap();

		assert.notStrictEqual(aBefore, aAfter, "getProperties returns a new reference after xConfig changes");
		assert.notStrictEqual(mBefore, mAfter, "getPropertyMap returns a new reference after xConfig changes");
		assert.deepEqual(aAfter.map((p) => p.key), ["p2"], "Active set reflects the new xConfig: p1 is filtered out, p2 remains");
		assert.deepEqual(Object.keys(mAfter), ["p2"], "Property map reflects the new xConfig: p1 is filtered out, p2 remains");
		assert.strictEqual(this.oPropertyHelper.getProperty("p1", true).isActive, false,
			"Dynamic getter reflects the new isActive override from xConfig");

		oParentStub.destroy();
	});

	QUnit.module("validateDynamicProperties", {
		afterEach: function() {
			this.oPropertyHelper?.destroy();
		}
	});

	QUnit.test("No error when all complex properties reference only active simple properties", function(assert) {
		this.oPropertyHelper = new PropertyHelper([
			{key: "simpleActive", label: "Simple Active", dataType: "String", isActive: true},
			{key: "simpleStatic", label: "Simple Static", dataType: "String"},
			{key: "complexActive", label: "Complex Active", isActive: true, propertyInfos: ["simpleActive", "simpleStatic"]}
		], null, {isActive: true});

		this.oPropertyHelper.validateDynamicProperties();
		assert.ok(true, "No error thrown");
	});

	QUnit.test("Error when active complex property references inactive simple property", function(assert) {
		this.oPropertyHelper = new PropertyHelper([
			{key: "simpleActive", label: "Simple Active", dataType: "String", isActive: true},
			{key: "simpleInactive", label: "Simple Inactive", dataType: "String", isActive: false},
			{key: "complexActive", label: "Complex Active", isActive: true, propertyInfos: ["simpleActive", "simpleInactive"]}
		], null, {isActive: true});

		assert.throws(function() {
			this.oPropertyHelper.validateDynamicProperties();
		}.bind(this), /complexActive.*simpleInactive/, "Error thrown for active complex referencing inactive simple");
	});

	QUnit.test("No error when inactive complex property references inactive simple property", function(assert) {
		this.oPropertyHelper = new PropertyHelper([
			{key: "simpleActive", label: "Simple Active", dataType: "String", isActive: true},
			{key: "simpleInactive", label: "Simple Inactive", dataType: "String", isActive: false},
			{key: "complexInactive", label: "Complex Inactive", isActive: false, propertyInfos: ["simpleActive", "simpleInactive"]}
		], null, {isActive: true});

		this.oPropertyHelper.validateDynamicProperties();
		assert.ok(true, "No error thrown for inactive complex property");
	});

	QUnit.test("Error when static complex property references inactive simple property", function(assert) {
		this.oPropertyHelper = new PropertyHelper([
			{key: "simpleActive", label: "Simple Active", dataType: "String", isActive: true},
			{key: "simpleInactive", label: "Simple Inactive", dataType: "String", isActive: false},
			{key: "complexStatic", label: "Complex Static", propertyInfos: ["simpleActive", "simpleInactive"]}
		], null, {isActive: true});

		assert.throws(function() {
			this.oPropertyHelper.validateDynamicProperties();
		}.bind(this), /complexStatic.*simpleInactive/, "Error thrown for static complex referencing inactive simple");
	});

	QUnit.test("No error when no dynamic properties exist", function(assert) {
		this.oPropertyHelper = new PropertyHelper([
			{key: "simple", label: "Simple", dataType: "String"},
			{key: "complex", label: "Complex", propertyInfos: ["simple"]}
		]);

		this.oPropertyHelper.validateDynamicProperties();
		assert.ok(true, "No error thrown when no dynamic properties exist");
	});

	QUnit.module("Property", {
		beforeEach: function() {
			this.oPropertyHelper = new PropertyHelper([{
				key: "prop",
				label: "Property",
				dataType: "String"
			}, {
				key: "prop2",
				label: "Property 2",
				dataType: "String",
				sortable: false,
				filterable: false,
				visible: false
			}, {
				key: "complexProp",
				label: "Complex property",
				propertyInfos: ["prop"]
			}, {
				key: "complexProp2",
				label: "Complex property 2",
				propertyInfos: ["prop2"]
			}, {
				key: "complexProp3",
				label: "Complex property 3",
				propertyInfos: ["prop"],
				visible: false
			}, {
				key: "complexProp4",
				label: "Complex property 4",
				propertyInfos: ["prop2"],
				visible: false
			}]);
		},
		afterEach: function() {
			this.oPropertyHelper.destroy();
		},
		assertProperty: function(assert, oProperty) {
			const aExpectedMethods = [
				"isComplex", "getSimpleProperties", "getSortableProperties", "getFilterableProperties"
			];
			const aActualMethods = [];

			assert.ok(Object.getPrototypeOf(oProperty) === Object.prototype, "The property inherits directly from Object");

			Object.getOwnPropertyNames(oProperty).forEach(function(sProperty) {
				if (typeof oProperty[sProperty] === "function") {
					aActualMethods.push(sProperty);
				}
			});

			assert.deepEqual(aActualMethods.sort(), aExpectedMethods.sort(), "Methods");
		}
	});

	QUnit.test("Simple property", function(assert) {
		this.assertProperty(assert, this.oPropertyHelper.getProperties()[0]);
	});

	QUnit.test("Complex property", function(assert) {
		this.assertProperty(assert, this.oPropertyHelper.getProperties()[1]);
	});

	QUnit.test("Property referenced by complex property", function(assert) {
		this.assertProperty(assert, this.oPropertyHelper.getProperty("complexProp").getSimpleProperties()[0]);
	});

	QUnit.test("isComplex", function(assert) {
		const oComplexProperty = this.oPropertyHelper.getProperty("complexProp");

		assert.strictEqual(this.oPropertyHelper.getProperty("prop").isComplex(), false, "Simple property");
		assert.strictEqual(oComplexProperty.isComplex(), true, "Complex property");
		assert.ok(Object.isFrozen(oComplexProperty.isComplex), "The function is frozen");

		this.oPropertyHelper.destroy();
		assert.strictEqual(oComplexProperty.isComplex(), true, "After destruction");
	});

	QUnit.test("getSimpleProperties", function(assert) {
		const oSimpleProperty = this.oPropertyHelper.getProperty("prop");
		const oComplexProperty = this.oPropertyHelper.getProperty("complexProp");

		oSimpleProperty.getSimpleProperties().push("s"); // Returned array must not be influenced by changes to previously returned arrays.
		assert.deepEqual(oSimpleProperty.getSimpleProperties(), [oSimpleProperty], "Simple property");
		assert.deepEqual(oComplexProperty.getSimpleProperties(), [oSimpleProperty], "Complex property");
		assert.ok(Object.isFrozen(oComplexProperty.getSimpleProperties), "The function 'getSimpleProperties' is frozen");
		assert.ok(Object.isFrozen(oComplexProperty.getSimpleProperties()[0]), "Properties returned by 'getSimpleProperties' are frozen");

		this.oPropertyHelper.destroy();
		assert.deepEqual(oSimpleProperty.getSimpleProperties(), [], "Simple property: After destruction");
		assert.deepEqual(oComplexProperty.getSimpleProperties(), [], "Complex property: After destruction");
	});

	QUnit.test("getSortableProperties", function(assert) {
		const oSimpleProperty = this.oPropertyHelper.getProperty("prop");
		const oComplexProperty = this.oPropertyHelper.getProperty("complexProp");

		oSimpleProperty.getSortableProperties().push("s"); // Returned array must not be influenced by changes to previously returned arrays.
		assert.deepEqual(oSimpleProperty.getSortableProperties(), [oSimpleProperty], "Sortable simple property");
		assert.deepEqual(oComplexProperty.getSortableProperties(), [oSimpleProperty], "Complex property referencing sortable properties");
		assert.deepEqual(this.oPropertyHelper.getProperty("prop2").getSortableProperties(), [], "Non-sortable simple property");
		assert.deepEqual(this.oPropertyHelper.getProperty("complexProp2").getSortableProperties(), [],
			"Complex property referencing non-sortable properties");
		assert.ok(Object.isFrozen(oSimpleProperty.getSortableProperties), "The function is frozen");
		assert.ok(Object.isFrozen(oSimpleProperty.getSortableProperties()[0]), "Returned properties are frozen");

		this.oPropertyHelper.destroy();
		assert.deepEqual(oSimpleProperty.getSortableProperties(), [], "Simple property: After destruction");
		assert.deepEqual(oComplexProperty.getSortableProperties(), [], "Complex property: After destruction");
	});

	QUnit.test("getFilterableProperties", function(assert) {
		const oSimpleProperty = this.oPropertyHelper.getProperty("prop");
		const oComplexProperty = this.oPropertyHelper.getProperty("complexProp");

		oSimpleProperty.getFilterableProperties().push("s"); // Returned array must not be influenced by changes to previously returned arrays.
		assert.deepEqual(oSimpleProperty.getFilterableProperties(), [oSimpleProperty], "Filterable simple property");
		assert.deepEqual(oComplexProperty.getFilterableProperties(), [oSimpleProperty], "Complex property referencing filterable properties");
		assert.deepEqual(this.oPropertyHelper.getProperty("prop2").getFilterableProperties(), [], "Non-filterable simple property");
		assert.deepEqual(this.oPropertyHelper.getProperty("complexProp2").getFilterableProperties(), [],
			"Complex property referencing non-filterable properties");
		assert.ok(Object.isFrozen(oSimpleProperty.getFilterableProperties), "The function is frozen");
		assert.ok(Object.isFrozen(oSimpleProperty.getFilterableProperties()[0]), "Returned properties are frozen");

		this.oPropertyHelper.destroy();
		assert.deepEqual(oSimpleProperty.getFilterableProperties(), [], "Simple property: After destruction");
		assert.deepEqual(oComplexProperty.getFilterableProperties(), [], "Complex property: After destruction");
	});

	QUnit.module("Inheritance");

	QUnit.test("Property validation", function(assert) {
		const oValidatePropertiesSpy = sinon.spy();
		const oValidatePropertySpy = sinon.spy();
		const aProperties = [{
			key: "prop",
			label: "Property",
			dataType: "String"
		}, {
			key: "complexProp",
			label: "Complex property",
			propertyInfos: ["prop"]
		}];
		const MyPropertyHelper = PropertyHelper.extend("sap.ui.mdc.test.table.PropertyHelper", {
			validateProperties: function() {
				PropertyHelper.prototype.validateProperties.apply(this, arguments);
				oValidatePropertiesSpy.apply(this, merge([], arguments));
			},
			validateProperty: function() {
				oValidatePropertySpy.apply(this, merge([], arguments));
				PropertyHelper.prototype.validateProperty.apply(this, arguments);
			}
		});
		const oMyPropertyHelper = new MyPropertyHelper(aProperties);

		assert.ok(oValidatePropertiesSpy.calledOnceWithExactly(aProperties, undefined), "#validateProperties called once with the correct arguments");
		assert.equal(oValidatePropertySpy.callCount, 2, "#validateProperty called twice");
		assert.ok(oValidatePropertySpy.firstCall.calledWithExactly(aProperties[0], aProperties, undefined), "Arguments of first #validateProperty call");
		assert.ok(oValidatePropertySpy.secondCall.calledWithExactly(aProperties[1], aProperties, undefined), "Arguments of second #validateProperty call");

		oMyPropertyHelper.destroy();
	});

	QUnit.test("Property preparation", function(assert) {
		const oPreparePropertySpy = sinon.spy();
		const aProperties = [{
			key: "prop",
			label: "Property",
			dataType: "String"
		}, {
			key: "complexProp",
			label: "Complex property",
			propertyInfos: ["prop"]
		}];

		const oCustomPropertyAttribute = {prop: "value"};
		const MyPropertyHelper = PropertyHelper.extend("sap.ui.mdc.test.table.PropertyHelper", {
			prepareProperty: function(oProperty) {
				oPreparePropertySpy.apply(this, merge([], arguments));
				PropertyHelper.prototype.prepareProperty.apply(this, arguments);
				oProperty.myAttribute = oCustomPropertyAttribute;
				oProperty.myMethod = function() {return "MyMethod";};
				oProperty.label = "label modified";
				oProperty.isComplex = function() {return "isComplex modified";};
			}
		});
		const oMyPropertyHelper = new MyPropertyHelper(aProperties);
		const oProperty = oMyPropertyHelper.getProperties()[0];

		assert.equal(oPreparePropertySpy.callCount, 2, "#prepareProperty called twice");

		const aExpectedFirstCallResult = [aProperties[0], {prop: aProperties[0], complexProp: aProperties[1]}];
		const aExpectedSecondCallResult = [aProperties[1], {prop: oProperty, complexProp: aProperties[1]}];

		/**
		 * @deprecated As of version 1.121
		 */
		[aExpectedFirstCallResult, aExpectedSecondCallResult].forEach(function(aArgs) {
			aArgs.forEach(function(oExpectedResult, index) {
				if (oExpectedResult.key) {
					oExpectedResult.name = oExpectedResult.key;
				}
			});
		});

		assert.ok(oPreparePropertySpy.firstCall.calledWithExactly.apply(oPreparePropertySpy, aExpectedFirstCallResult), "Arguments of first #prepareProperty call");
		assert.ok(oPreparePropertySpy.secondCall.calledWithExactly.apply(oPreparePropertySpy, aExpectedSecondCallResult), "Arguments of second #prepareProperty call");
		assert.deepEqual(oProperty.myAttribute, oCustomPropertyAttribute, "Attributes can be added");
		assert.ok(Object.isFrozen(oProperty.myAttribute), "Added attributes are frozen");
		assert.deepEqual(oProperty.myMethod(), "MyMethod", "Methods can be added");
		assert.ok(Object.isFrozen(oProperty.myMethod), "Added methods are frozen");
		assert.strictEqual(oProperty.label, "label modified", "Default attributes can be changed");
		assert.ok(Object.isFrozen(oProperty.label), "Changed default attributes are frozen");
		assert.strictEqual(oProperty.isComplex(), "isComplex modified", "Default methods can be changed");
		assert.ok(Object.isFrozen(oProperty.isComplex), "Changed default methods are frozen");

		oMyPropertyHelper.destroy();
	});
});