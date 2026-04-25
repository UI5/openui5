/*!
 * ${copyright}
 */

/* global QUnit */

sap.ui.define([
	"sap/ui/mdc/util/DynamicPropertiesUtil"
], (
	DynamicPropertiesUtil
) => {
	"use strict";

	/**
	 * Creates a fake modifier that backs getProperty/setProperty with a simple map.
	 */
	function createModifier(mProperties) {
		const mStore = Object.assign({}, mProperties);
		return {
			getProperty: function(oControl, sProp) {
				return Promise.resolve(mStore[sProp]);
			},
			setProperty: function(oControl, sProp, vValue) {
				mStore[sProp] = vValue;
				return Promise.resolve();
			},
			_store: mStore
		};
	}

	/**
	 * Creates a fake runtime control.
	 */
	function createRuntimeControl(mOptions) {
		const mPropertyMap = {};
		(mOptions.propertyInfo || []).forEach((oEntry) => {
			mPropertyMap[oEntry.key] = oEntry;
		});

		return {
			getMetadata: () => ({getName: () => mOptions.type}),
			getPropertyHelper: () => ({
				getProperty: (sKey, bIncludeInactive) => mPropertyMap[sKey] || null
			}),
			getPropertyKeys: () => mOptions.propertyKeys || [],
			isInPropertyKeysMode: mOptions.isInPropertyKeysMode
		};
	}

	/**
	 * Creates a fake XML node (no getMetadata).
	 */
	function createXmlNode() {
		return {
			namespaceURI: "sap.ui.mdc",
			localName: "Table"
		};
	}

	QUnit.module("isInPropertyKeysMode");

	QUnit.test("Runtime: delegates to mixin method", async function(assert) {
		const oControl = createRuntimeControl({
			type: "sap.ui.mdc.Table",
			isInPropertyKeysMode: () => true
		});
		assert.strictEqual(await DynamicPropertiesUtil.isInPropertyKeysMode(oControl, {}), true);
	});

	QUnit.test("Runtime: delegates to mixin method (false)", async function(assert) {
		const oControl = createRuntimeControl({
			type: "sap.ui.mdc.Table",
			isInPropertyKeysMode: () => false
		});
		assert.strictEqual(await DynamicPropertiesUtil.isInPropertyKeysMode(oControl, {}), false);
	});

	QUnit.test("XML: returns true when propertyKeys is non-empty", async function(assert) {
		const oXmlNode = createXmlNode();
		const oModifier = createModifier({propertyKeys: ["a", "b"]});
		assert.strictEqual(
			await DynamicPropertiesUtil.isInPropertyKeysMode(oXmlNode, {modifier: oModifier}),
			true
		);
	});

	QUnit.test("XML: returns false when propertyKeys is empty", async function(assert) {
		const oXmlNode = createXmlNode();
		const oModifier = createModifier({propertyKeys: []});
		assert.strictEqual(
			await DynamicPropertiesUtil.isInPropertyKeysMode(oXmlNode, {modifier: oModifier}),
			false
		);
	});

	QUnit.test("XML: returns false when propertyKeys is not set", async function(assert) {
		const oXmlNode = createXmlNode();
		const oModifier = createModifier({});
		assert.strictEqual(
			await DynamicPropertiesUtil.isInPropertyKeysMode(oXmlNode, {modifier: oModifier}),
			false
		);
	});

	QUnit.test("XML: caches result", async function(assert) {
		const oXmlNode = createXmlNode();
		const oModifier = createModifier({propertyKeys: ["a"]});
		const mPropertyBag = {modifier: oModifier};

		const bFirst = await DynamicPropertiesUtil.isInPropertyKeysMode(oXmlNode, mPropertyBag);
		// Change the underlying data — cached result should be returned
		oModifier._store.propertyKeys = [];
		const bSecond = await DynamicPropertiesUtil.isInPropertyKeysMode(oXmlNode, mPropertyBag);

		assert.strictEqual(bFirst, true);
		assert.strictEqual(bSecond, true, "Cached result returned despite data change");
	});

	QUnit.module("getPropertyKeys");

	QUnit.test("Returns empty array when property is not set", async function(assert) {
		const oModifier = createModifier({});
		const aResult = await DynamicPropertiesUtil.getPropertyKeys({}, {modifier: oModifier});
		assert.deepEqual(aResult, []);
	});

	QUnit.test("Returns a copy of the stored array", async function(assert) {
		const oModifier = createModifier({propertyKeys: ["a", "b", "c"]});
		const mPropertyBag = {modifier: oModifier};

		const aResult = await DynamicPropertiesUtil.getPropertyKeys({}, mPropertyBag);
		aResult.push("d");

		const aAgain = await DynamicPropertiesUtil.getPropertyKeys({}, mPropertyBag);
		assert.deepEqual(aAgain, ["a", "b", "c"], "Mutation does not affect stored state");
	});

	QUnit.module("setPropertyKeys");

	QUnit.test("Stores array for runtime control", async function(assert) {
		const oModifier = createModifier({});
		const oControl = createRuntimeControl({type: "sap.ui.mdc.Table"});
		await DynamicPropertiesUtil.setPropertyKeys(oControl, ["x", "y"], {modifier: oModifier});
		assert.deepEqual(oModifier._store.propertyKeys, ["x", "y"]);
	});

	QUnit.test("Stores comma-separated string for XML node", async function(assert) {
		const oModifier = createModifier({});
		const oXmlNode = createXmlNode();
		await DynamicPropertiesUtil.setPropertyKeys(oXmlNode, ["x", "y"], {modifier: oModifier});
		assert.strictEqual(oModifier._store.propertyKeys, "x,y");
	});

	QUnit.module("translateAggregationToPropertyKeysIndex");

	QUnit.test("Returns same index when no inactive properties", function(assert) {
		const oControl = createRuntimeControl({
			type: "sap.ui.mdc.Table",
			propertyKeys: ["a", "b", "c"],
			propertyInfo: [
				{key: "a", isActive: true},
				{key: "b", isActive: true},
				{key: "c", isActive: true}
			]
		});
		assert.strictEqual(DynamicPropertiesUtil.translateAggregationToPropertyKeysIndex(oControl, 0), 0);
		assert.strictEqual(DynamicPropertiesUtil.translateAggregationToPropertyKeysIndex(oControl, 2), 2);
	});

	QUnit.test("Skips inactive properties", function(assert) {
		const oControl = createRuntimeControl({
			type: "sap.ui.mdc.Table",
			propertyKeys: ["a", "i1", "b", "i2", "c"],
			propertyInfo: [
				{key: "a", isActive: true},
				{key: "i1", isActive: false},
				{key: "b", isActive: true},
				{key: "i2", isActive: false},
				{key: "c", isActive: true}
			]
		});
		assert.strictEqual(DynamicPropertiesUtil.translateAggregationToPropertyKeysIndex(oControl, 0), 0,
			"Aggregation index 0 maps to propertyKeys index 0");
		assert.strictEqual(DynamicPropertiesUtil.translateAggregationToPropertyKeysIndex(oControl, 1), 2,
			"Aggregation index 1 maps to propertyKeys index 2 (skips inactive i1)");
		assert.strictEqual(DynamicPropertiesUtil.translateAggregationToPropertyKeysIndex(oControl, 2), 4,
			"Aggregation index 2 maps to propertyKeys index 4 (skips inactive i1, i2)");
	});

	QUnit.test("Skips trailing inactive at landing position", function(assert) {
		const oControl = createRuntimeControl({
			type: "sap.ui.mdc.Table",
			propertyKeys: ["a", "i1", "i2", "b"],
			propertyInfo: [
				{key: "a", isActive: true},
				{key: "i1", isActive: false},
				{key: "i2", isActive: false},
				{key: "b", isActive: true}
			]
		});
		assert.strictEqual(DynamicPropertiesUtil.translateAggregationToPropertyKeysIndex(oControl, 1), 3,
			"Aggregation index 1 maps to propertyKeys index 3 (skips consecutive inactive i1, i2)");
	});

	QUnit.module("translatePropertyKeysToAggregationIndex");

	QUnit.test("Returns same index when no inactive properties", function(assert) {
		const oControl = createRuntimeControl({
			type: "sap.ui.mdc.Table",
			propertyKeys: ["a", "b", "c"],
			propertyInfo: [
				{key: "a", isActive: true},
				{key: "b", isActive: true},
				{key: "c", isActive: true}
			]
		});
		assert.strictEqual(DynamicPropertiesUtil.translatePropertyKeysToAggregationIndex(oControl, 0), 0);
		assert.strictEqual(DynamicPropertiesUtil.translatePropertyKeysToAggregationIndex(oControl, 2), 2);
	});

	QUnit.test("Counts only active properties before index", function(assert) {
		const oControl = createRuntimeControl({
			type: "sap.ui.mdc.Table",
			propertyKeys: ["a", "i1", "b", "i2", "c"],
			propertyInfo: [
				{key: "a", isActive: true},
				{key: "i1", isActive: false},
				{key: "b", isActive: true},
				{key: "i2", isActive: false},
				{key: "c", isActive: true}
			]
		});
		assert.strictEqual(DynamicPropertiesUtil.translatePropertyKeysToAggregationIndex(oControl, 0), 0,
			"PropertyKeys index 0 maps to aggregation index 0");
		assert.strictEqual(DynamicPropertiesUtil.translatePropertyKeysToAggregationIndex(oControl, 2), 1,
			"PropertyKeys index 2 maps to aggregation index 1 (only 'a' is active before)");
		assert.strictEqual(DynamicPropertiesUtil.translatePropertyKeysToAggregationIndex(oControl, 4), 2,
			"PropertyKeys index 4 maps to aggregation index 2 (only 'a', 'b' are active before)");
	});

	QUnit.test("Index for inactive property", function(assert) {
		const oControl = createRuntimeControl({
			type: "sap.ui.mdc.Table",
			propertyKeys: ["a", "i1", "b"],
			propertyInfo: [
				{key: "a", isActive: true},
				{key: "i1", isActive: false},
				{key: "b", isActive: true}
			]
		});
		assert.strictEqual(DynamicPropertiesUtil.translatePropertyKeysToAggregationIndex(oControl, 1), 1,
			"PropertyKeys index 1 (inactive i1) maps to aggregation index 1 (only 'a' is active before)");
	});

	QUnit.test("Index beyond array length clamps", function(assert) {
		const oControl = createRuntimeControl({
			type: "sap.ui.mdc.Table",
			propertyKeys: ["a", "b"],
			propertyInfo: [
				{key: "a", isActive: true},
				{key: "b", isActive: true}
			]
		});
		assert.strictEqual(DynamicPropertiesUtil.translatePropertyKeysToAggregationIndex(oControl, 10), 2,
			"PropertyKeys index 10 clamps to total active count (2)");
	});

	QUnit.module("translateAggregationToPropertyKeysIndex - edge cases");

	QUnit.test("Aggregation index at end with trailing inactive", function(assert) {
		const oControl = createRuntimeControl({
			type: "sap.ui.mdc.Table",
			propertyKeys: ["a", "b", "i1", "i2"],
			propertyInfo: [
				{key: "a", isActive: true},
				{key: "b", isActive: true},
				{key: "i1", isActive: false},
				{key: "i2", isActive: false}
			]
		});
		assert.strictEqual(DynamicPropertiesUtil.translateAggregationToPropertyKeysIndex(oControl, 2), 4,
			"Aggregation index 2 maps to propertyKeys index 4 (past all trailing inactive)");
	});

	QUnit.test("Aggregation index beyond active count", function(assert) {
		const oControl = createRuntimeControl({
			type: "sap.ui.mdc.Table",
			propertyKeys: ["a", "b"],
			propertyInfo: [
				{key: "a", isActive: true},
				{key: "b", isActive: true}
			]
		});
		assert.strictEqual(DynamicPropertiesUtil.translateAggregationToPropertyKeysIndex(oControl, 5), 2,
			"Aggregation index 5 clamps to propertyKeys array length (2)");
	});
});
