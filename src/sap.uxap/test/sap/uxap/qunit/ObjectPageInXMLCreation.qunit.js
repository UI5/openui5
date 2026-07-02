/*global QUnit*/
sap.ui.define(["sap/ui/core/mvc/XMLView", "sap/ui/test/utils/nextUIUpdate"],
function(XMLView, nextUIUpdate) {
	"use strict";

	QUnit.module("aat_UxAP-162", {
		beforeEach: function (assert) {
			const done = assert.async();
			XMLView.create({
				id: "UxAP-162_ObjectPageSample",
				viewName: "view.UxAP-162_ObjectPageSample"
			}).then(async function(oView) {
				this.objectPageSampleView = oView;
				this.objectPageSampleView.placeAt("qunit-fixture");
				await nextUIUpdate();
				done();
			}.bind(this));
		},
		afterEach: function () {
			this.objectPageSampleView.destroy();
		}
	});

	QUnit.test("Should find ObjectPageLayout created from XML view", function (assert) {
		// Arrange
		const referencedObjectPage = this.objectPageSampleView.byId("objectPage162");

		// Assert
		assert.ok(referencedObjectPage != undefined, "ObjectPageLayout created successfuly");
	});

	QUnit.test("Should find ObjectPageSection created from XML view", function (assert) {
		// Arrange
		const objectPageSection = this.objectPageSampleView.byId("ObjectPageSection162");

		// Assert
		assert.ok(objectPageSection != undefined, "Object Page Section created successfuly");
	});

	QUnit.test("Should find first ObjectPageSubSection created from XML view", function (assert) {
		// Arrange
		const objectPageSubSection1 = this.objectPageSampleView.byId("ObjectPageSubSection162_1");

		// Assert
		assert.ok(objectPageSubSection1 != undefined, "Object Page Sub Section 1 created successfuly");
	});

	QUnit.test("Should find second ObjectPageSubSection created from XML view", function (assert) {
		// Arrange
		const objectPageSubSection2 = this.objectPageSampleView.byId("ObjectPageSubSection162_2");

		// Assert
		assert.ok(objectPageSubSection2 != undefined, "Object Page Sub Section 2 created successfuly");
	});

	QUnit.test("Should find header description control created from XML view", function (assert) {
		// Arrange
		const headerDesc = this.objectPageSampleView.byId("headerDescription");

		// Assert
		assert.ok(headerDesc != undefined, "Header description created successfuly");
	});

	QUnit.test("Should find header role control created from XML view", function (assert) {
		// Arrange
		const headerRole = this.objectPageSampleView.byId("headerRole162");

		// Assert
		assert.ok(headerRole != undefined, "Header role created successfuly");
	});

	QUnit.test("Should find header job title text control created from XML view", function (assert) {
		// Arrange
		const text = this.objectPageSampleView.byId("HeaderJobTitle");

		// Assert
		assert.ok(text != undefined, "First Contents created successfuly");
	});

});
