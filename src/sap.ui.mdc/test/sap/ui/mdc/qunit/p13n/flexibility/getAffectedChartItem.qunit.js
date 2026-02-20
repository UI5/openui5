/* global QUnit */
sap.ui.define([
	"sap/ui/mdc/flexibility/helpers/getAffectedChartItem"
], function(getAffectedChartItem) {
	"use strict";

	QUnit.module("getAffectedChartItem helper");

	QUnit.test("Returns key with role suffix", function(assert) {
		// Given a change content with name and role
		const oChangeContent = {
			name: "field1",
			role: "series"
		};

		// When getting the affected chart item
		const sResult = getAffectedChartItem(oChangeContent);

		// Then it should return the name with role suffix
		assert.strictEqual(sResult, "field1-series", "Returns 'name-role' format");
	});

	QUnit.test("Handles key property instead of name", function(assert) {
		// Given a change content with key (instead of name) and role
		const oChangeContent = {
			key: "field1",
			role: "category"
		};

		// When getting the affected chart item
		const sResult = getAffectedChartItem(oChangeContent);

		// Then it should use the key property and append role
		assert.strictEqual(sResult, "field1-category", "Uses key property when name is not present");
	});

	QUnit.test("Defaults to 'category' when role is undefined", function(assert) {
		// Given a change content without role
		const oChangeContent = {
			name: "field1"
		};

		// When getting the affected chart item
		const sResult = getAffectedChartItem(oChangeContent);

		// Then it should default role to "category"
		assert.strictEqual(sResult, "field1-category", "Defaults to 'category' when role is undefined");
	});

	QUnit.test("Defaults to 'category' when role is null", function(assert) {
		// Given a change content with null role
		const oChangeContent = {
			name: "field1",
			role: null
		};

		// When getting the affected chart item
		const sResult = getAffectedChartItem(oChangeContent);

		// Then it should default role to "category"
		assert.strictEqual(sResult, "field1-category", "Defaults to 'category' when role is null");
	});

	QUnit.test("Handles both key and name present with same value", function(assert) {
		// Given a change content with both key and name (same value)
		const oChangeContent = {
			key: "field1",
			name: "field1",
			role: "axis1"
		};

		// When getting the affected chart item
		const sResult = getAffectedChartItem(oChangeContent);

		// Then it should work correctly
		assert.strictEqual(sResult, "field1-axis1", "Handles both key and name correctly");
	});
});
