/* global QUnit, sinon */

sap.ui.define([
	"sap/ui/mdc/util/P13nUtils"
],
function(
	P13nUtils
) {
	"use strict";

	QUnit.module("sap.ui.mdc.util.P13nUtils", {
		beforeEach: function() {
			this.oControl = {
				isControlDelegateInitialized: sinon.stub(),
				getControlDelegate: sinon.stub()
			};
		}
	});

	// --- getIntersection ---

	QUnit.test("#getIntersection returns values present in both arrays", function(assert) {
		assert.deepEqual(P13nUtils.getIntersection(["Sort", "Filter", "Group"], ["Filter", "Group", "Aggregate"]), ["Filter", "Group"], "Intersection of overlapping arrays");
	});

	QUnit.test("#getIntersection returns empty array when no overlap", function(assert) {
		assert.deepEqual(P13nUtils.getIntersection(["Sort"], ["Filter"]), [], "No overlap → empty array");
	});

	QUnit.test("#getIntersection returns empty array when either input is empty", function(assert) {
		assert.deepEqual(P13nUtils.getIntersection([], ["Sort", "Filter"]), [], "Empty first array");
		assert.deepEqual(P13nUtils.getIntersection(["Sort", "Filter"], []), [], "Empty second array");
	});

	// --- getSupportedP13nModes ---

	QUnit.test("#getSupportedP13nModes returns all modes when delegate is not initialized", function(assert) {
		this.oControl.isControlDelegateInitialized.returns(false);

		const aResult = P13nUtils.getSupportedP13nModes(this.oControl, ["Sort", "Filter", "Group"]);

		assert.deepEqual(aResult, ["Sort", "Filter", "Group"], "All modes returned when delegate not initialized");
		assert.ok(this.oControl.getControlDelegate.notCalled, "getControlDelegate not called");
	});

	QUnit.test("#getSupportedP13nModes intersects with delegate's supported p13nModes when initialized", function(assert) {
		this.oControl.isControlDelegateInitialized.returns(true);
		this.oControl.getControlDelegate.returns({
			getSupportedFeatures: sinon.stub().returns({p13nModes: ["Sort", "Filter"]})
		});

		const aResult = P13nUtils.getSupportedP13nModes(this.oControl, ["Sort", "Filter", "Group"]);

		assert.deepEqual(aResult, ["Sort", "Filter"], "Returns intersection with delegate's supported modes");
	});

	QUnit.test("#getSupportedP13nModes handles missing p13nModes in delegate's getSupportedFeatures", function(assert) {
		this.oControl.isControlDelegateInitialized.returns(true);
		this.oControl.getControlDelegate.returns({
			getSupportedFeatures: sinon.stub().returns({})
		});

		const aResult = P13nUtils.getSupportedP13nModes(this.oControl, ["Sort", "Filter"]);

		assert.deepEqual(aResult, [], "Returns empty array when delegate has no p13nModes");
	});

	// --- getActiveP13nModes ---

	QUnit.test("#getActiveP13nModes returns intersection of enabled modes and supported modes", function(assert) {
		this.oControl.isControlDelegateInitialized.returns(false);

		const aResult = P13nUtils.getActiveP13nModes(this.oControl, ["Sort", "Group"], ["Sort", "Filter", "Group"]);

		assert.deepEqual(aResult, ["Sort", "Group"], "Returns intersection of enabled and supported modes");
	});

	QUnit.test("#getActiveP13nModes returns empty array when no enabled modes overlap supported modes", function(assert) {
		this.oControl.isControlDelegateInitialized.returns(false);

		const aResult = P13nUtils.getActiveP13nModes(this.oControl, ["Aggregate"], ["Sort", "Filter"]);

		assert.deepEqual(aResult, [], "No overlap → empty array");
	});

	// --- isSettingsButtonVisible ---

	QUnit.test("#isSettingsButtonVisible returns false for null/undefined modes", function(assert) {
		assert.strictEqual(P13nUtils.isSettingsButtonVisible(null, false, false), false, "null modes → false");
		assert.strictEqual(P13nUtils.isSettingsButtonVisible(undefined, false, false), false, "undefined modes → false");
	});

	QUnit.test("#isSettingsButtonVisible returns false for empty modes array", function(assert) {
		assert.strictEqual(P13nUtils.isSettingsButtonVisible([], false, false), false, "Empty array → false");
	});

	QUnit.test("#isSettingsButtonVisible returns false when bButtonHidden is true", function(assert) {
		assert.strictEqual(P13nUtils.isSettingsButtonVisible(["Sort"], true, false), false, "bButtonHidden=true → false");
	});

	QUnit.test("#isSettingsButtonVisible returns false when only Aggregate mode and bHideIfAggregateOnly is true", function(assert) {
		assert.strictEqual(P13nUtils.isSettingsButtonVisible(["Aggregate"], false, true), false, "Only Aggregate + bHideIfAggregateOnly → false");
	});

	QUnit.test("#isSettingsButtonVisible returns true when only Aggregate mode but bHideIfAggregateOnly is false", function(assert) {
		assert.strictEqual(P13nUtils.isSettingsButtonVisible(["Aggregate"], false, false), true, "Only Aggregate but bHideIfAggregateOnly=false → true");
	});

	QUnit.test("#isSettingsButtonVisible returns true for valid non-aggregate modes", function(assert) {
		assert.strictEqual(P13nUtils.isSettingsButtonVisible(["Sort", "Filter"], false, false), true, "Sort + Filter → true");
		assert.strictEqual(P13nUtils.isSettingsButtonVisible(["Sort", "Aggregate"], false, true), true, "Multiple modes including Aggregate → true (not aggregate-only)");
	});
});
