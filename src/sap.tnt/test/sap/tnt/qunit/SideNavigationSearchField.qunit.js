/*global QUnit */
sap.ui.define([
	"sap/tnt/SideNavigationSearchField",
	"sap/ui/core/Lib",
	"sap/ui/core/InvisibleText",
	"sap/ui/test/utils/nextUIUpdate"
], function(
	SideNavigationSearchField,
	Library,
	InvisibleText,
	nextUIUpdate
) {
	"use strict";

	const DOM_RENDER_LOCATION = "qunit-fixture";

	// ================================================================================
	// SideNavigationSearchField - Control API
	// ================================================================================
	QUnit.module("SideNavigationSearchField - API", {
		beforeEach: async function () {
			this.oSearchField = new SideNavigationSearchField();
			this.oSearchField.placeAt(DOM_RENDER_LOCATION);
			await nextUIUpdate();
		},
		afterEach: function () {
			this.oSearchField.destroy();
		}
	});

	QUnit.test("Default instantiation", function (assert) {
		assert.ok(this.oSearchField, "SideNavigationSearchField is instantiated");
		assert.ok(this.oSearchField.getDomRef(), "SideNavigationSearchField is rendered");
	});

	QUnit.test("Extends sap.m.SearchField", function (assert) {
		assert.ok(this.oSearchField.isA("sap.m.SearchField"), "Control extends sap.m.SearchField");
	});

	QUnit.test("Default placeholder from resource bundle", function (assert) {
		const oRB = Library.getResourceBundleFor("sap.tnt");

		const sExpectedPlaceholder = oRB.getText("SIDE_NAVIGATION_SEARCH_PLACEHOLDER");

		assert.strictEqual(this.oSearchField._getPlaceholder(), sExpectedPlaceholder, "Default placeholder is retrieved from resource bundle");
	});

	QUnit.test("Custom placeholder overrides default", function (assert) {
		const sCustomPlaceholder = "Search items...";

		this.oSearchField.setPlaceholder(sCustomPlaceholder);
		assert.strictEqual(this.oSearchField._getPlaceholder(), sCustomPlaceholder, "Custom placeholder is returned when set");
	});

	QUnit.test("Empty placeholder falls back to resource bundle", function (assert) {
		const oRB = Library.getResourceBundleFor("sap.tnt");
		const sExpectedPlaceholder = oRB.getText("SIDE_NAVIGATION_SEARCH_PLACEHOLDER");

		this.oSearchField.setPlaceholder("");
		assert.strictEqual(this.oSearchField._getPlaceholder(), sExpectedPlaceholder, "Empty placeholder falls back to resource bundle text");
	});

	// ================================================================================
	// SideNavigationSearchField - Accessibility
	// ================================================================================
	QUnit.module("SideNavigationSearchField - Accessibility", {
		beforeEach: async function () {
			this.oSearchField = new SideNavigationSearchField();
			this.oSearchField.placeAt(DOM_RENDER_LOCATION);
			await nextUIUpdate();
		},
		afterEach: function () {
			this.oSearchField.destroy();
		}
	});

	QUnit.test("Default aria-labelledby is set", function (assert) {
		const sExpectedId = InvisibleText.getStaticId("sap.tnt", "SIDE_NAVIGATION_SEARCH_LABEL");
		const oInput = this.oSearchField.getDomRef().querySelector("input");

		assert.ok(
			oInput.getAttribute("aria-labelledby").indexOf(sExpectedId) > -1,
			"Default aria-labelledby references the SIDE_NAVIGATION_SEARCH_LABEL invisible text"
		);
	});

	QUnit.test("Default aria-describedby is set", function (assert) {
		const sExpectedId = InvisibleText.getStaticId("sap.tnt", "SIDE_NAVIGATION_SEARCH_DESCRIPTION");
		const oInput = this.oSearchField.getDomRef().querySelector("input");

		assert.ok(
			oInput.getAttribute("aria-describedby").indexOf(sExpectedId) > -1,
			"Default aria-describedby references the SIDE_NAVIGATION_SEARCH_DESCRIPTION invisible text"
		);
	});

	QUnit.test("Custom ariaLabelledBy overrides default", async function (assert) {
		const oCustomText = new InvisibleText({ text: "Custom label" }).toStatic();
		const sDefaultId = InvisibleText.getStaticId("sap.tnt", "SIDE_NAVIGATION_SEARCH_LABEL");

		this.oSearchField.addAriaLabelledBy(oCustomText);
		await nextUIUpdate();

		const oInput = this.oSearchField.getDomRef().querySelector("input");
		const sLabelledBy = oInput.getAttribute("aria-labelledby") || "";

		assert.ok(
			sLabelledBy.indexOf(oCustomText.getId()) > -1,
			"Custom ariaLabelledBy is applied"
		);
		assert.strictEqual(
			sLabelledBy.indexOf(sDefaultId), -1,
			"Default aria-labelledby is not applied when custom is provided"
		);

		oCustomText.destroy();
	});

	QUnit.test("Custom ariaDescribedBy overrides default", async function (assert) {
		const oCustomText = new InvisibleText({ text: "Custom description" }).toStatic();
		const sDefaultId = InvisibleText.getStaticId("sap.tnt", "SIDE_NAVIGATION_SEARCH_DESCRIPTION");

		this.oSearchField.addAriaDescribedBy(oCustomText);
		await nextUIUpdate();

		const oInput = this.oSearchField.getDomRef().querySelector("input");
		const sDescribedBy = oInput.getAttribute("aria-describedby") || "";

		assert.ok(
			sDescribedBy.indexOf(oCustomText.getId()) > -1,
			"Custom ariaDescribedBy is applied"
		);
		assert.strictEqual(
			sDescribedBy.indexOf(sDefaultId), -1,
			"Default aria-describedby is not applied when custom is provided"
		);

		oCustomText.destroy();
	});
});
