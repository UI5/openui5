/*global QUnit */
sap.ui.define([
	"sap/ui/test/utils/nextUIUpdate",
	"sap/m/NumericInput"
], function(nextUIUpdate, NumericInput) {
	"use strict";

	QUnit.module("Basic rendering", {
		beforeEach: function() {
			this.oNumericInput = new NumericInput();
			this.oNumericInput.placeAt("qunit-fixture");
			return nextUIUpdate();
		},
		afterEach: function() {
			this.oNumericInput.destroy();
		}
	});

	QUnit.test("Renders without errors", function(assert) {
		assert.ok(this.oNumericInput.getDomRef(), "Control is rendered");
		assert.ok(this.oNumericInput.getDomRef().classList.contains("sapMNumericInput"), "Root has sapMNumericInput CSS class");
	});

	QUnit.test("Default property values", function(assert) {
		assert.strictEqual(this.oNumericInput.getValue(), 0, "Default value is 0");
		assert.strictEqual(this.oNumericInput.getEditable(), true, "Default editable is true");
		assert.strictEqual(this.oNumericInput.getEnabled(), true, "Default enabled is true");
	});

	QUnit.module("API", {
		beforeEach: function() {
			this.oNumericInput = new NumericInput({ min: 0, max: 100, value: 50 });
			this.oNumericInput.placeAt("qunit-fixture");
			return nextUIUpdate();
		},
		afterEach: function() {
			this.oNumericInput.destroy();
		}
	});

	QUnit.test("min/max/value properties", function(assert) {
		assert.strictEqual(this.oNumericInput.getMin(), 0, "min is 0");
		assert.strictEqual(this.oNumericInput.getMax(), 100, "max is 100");
		assert.strictEqual(this.oNumericInput.getValue(), 50, "value is 50");
	});

	QUnit.test("setValue within range", function(assert) {
		this.oNumericInput.setValue(75);
		assert.strictEqual(this.oNumericInput.getValue(), 75, "Value set to 75");
	});
});
