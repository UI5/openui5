/*global QUnit */
sap.ui.define([
	"sap/ui/test/utils/nextUIUpdate",
	"sap/ui/thirdparty/jquery",
	"sap/base/util/isEmptyObject",
	"sap/ui/core/mvc/XMLView"
],
function(nextUIUpdate, $, isEmptyObject, XMLView) {
	"use strict";

	QUnit.module("aat_UxAP-330");

	QUnit.module("Show More", {
		beforeEach: async function () {
			const oView = await XMLView.create({
				id: "UxAP-330_PropertyOnBlockToSayIfItHaveMoreInfoToDisplay",
				viewName: "view.UxAP-330_PropertyOnBlockToSayIfItHaveMoreInfoToDisplay"
			});
			this.objectPageSampleView = oView;
			this.referencedObjectPage = this.objectPageSampleView.byId("objectPage330");
			this.objectPageSampleView.placeAt('qunit-fixture');
			await nextUIUpdate();
		},
		afterEach: function () {
			this.objectPageSampleView.destroy();
			this.referencedObjectPage = null;
		}
	});

	QUnit.test("Should create the ObjectPageLayout", function (assert) {
		// Assert
		assert.notStrictEqual(this.referencedObjectPage, undefined, "ObjectPageLayout created successfuly");
	});
	QUnit.test("Should create the ObjectPageSection", function (assert) {
		// Act
		const objectPageSection = this.objectPageSampleView.byId("ObjectPageSection330");
		// Assert
		assert.notStrictEqual(objectPageSection, undefined, "Object Page Section created successfuly");
	});
	QUnit.test("Should create ObjectPageSubSection 0", function (assert) {
		// Act
		const objectPageSubSection0 = this.objectPageSampleView.byId("ObjectPageSubSection330_0");
		// Assert
		assert.notStrictEqual(objectPageSubSection0, undefined, "Object Page Sub Section 0 created successfuly");
	});
	QUnit.test("Should create ObjectPageSubSection 1", function (assert) {
		// Act
		const objectPageSubSection1 = this.objectPageSampleView.byId("ObjectPageSubSection330_1");
		// Assert
		assert.notStrictEqual(objectPageSubSection1, undefined, "Object Page Sub Section 1 created successfuly");
	});
	QUnit.test("Should create ObjectPageSubSection 2", function (assert) {
		// Act
		const objectPageSubSection1 = this.objectPageSampleView.byId("ObjectPageSubSection330_2");
		// Assert
		assert.notStrictEqual(objectPageSubSection1, undefined, "Object Page Sub Section 2 created successfuly");
	});
	QUnit.test("Should create ObjectPageSubSection 3", function (assert) {
		// Act
		const objectPageSubSection3 = this.objectPageSampleView.byId("ObjectPageSubSection330_3");
		// Assert
		assert.notStrictEqual(objectPageSubSection3, undefined, "Object Page Sub Section 3 created successfuly");
	});
	QUnit.test("Should create ObjectPageSubSection 4", function (assert) {
		// Act
		const objectPageSubSection4 = this.objectPageSampleView.byId("ObjectPageSubSection330_4");
		// Assert
		assert.notStrictEqual(objectPageSubSection4, undefined, "Object Page Sub Section 4 created successfuly");
	});
	QUnit.test("Should create ObjectPageBlockBase 0", function (assert) {
		// Act
		const objectPageBlockBase0 = this.objectPageSampleView.byId("ObjectPageBlockBase330_0");
		// Assert
		assert.notStrictEqual(objectPageBlockBase0, undefined, "Object Page Block Base 0 created successfuly");
	});
	QUnit.test("Should create ObjectPageBlockBase 1", function (assert) {
		// Act
		const objectPageBlockBase1 = this.objectPageSampleView.byId("ObjectPageBlockBase330_1");
		// Assert
		assert.notStrictEqual(objectPageBlockBase1, undefined, "Object Page Block Base 1 created successfuly");
	});
	QUnit.test("Should create ObjectPageBlockBase 2", function (assert) {
		// Act
		const objectPageBlockBase2 = this.objectPageSampleView.byId("ObjectPageBlockBase330_2");
		// Assert
		assert.notStrictEqual(objectPageBlockBase2, undefined, "Object Page Block Base 2 created successfuly");
	});
	QUnit.test("Should create ObjectPageBlockBase 3", function (assert) {
		// Act
		const objectPageBlockBase3 = this.objectPageSampleView.byId("ObjectPageBlockBase330_3");
		// Assert
		assert.notStrictEqual(objectPageBlockBase3, undefined, "Object Page Block Base 3 created successfuly");
	});
	QUnit.test("Should create ObjectPageBlockBase 4", function (assert) {
		// Act
		const objectPageBlockBase4 = this.objectPageSampleView.byId("ObjectPageBlockBase330_4");
		// Assert
		assert.notStrictEqual(objectPageBlockBase4, undefined, "Object Page Block Base 4 created successfuly");
	});
	QUnit.test("ObjectPageBlockBase_0 should have default showSubSectionMore value", function (assert) {
		// Act
		const objectPageBlockBase0 = this.objectPageSampleView.byId("ObjectPageBlockBase330_0");
		// Assert
		assert.strictEqual(objectPageBlockBase0.getShowSubSectionMore(), false, "Object Page Block Base 0: showSubSectionMore set with default value successfuly");
	});
	QUnit.test("ObjectPageBlockBase_1 showSubSectionMore true", function (assert) {
		// Act
		const objectPageBlockBase1 = this.objectPageSampleView.byId("ObjectPageBlockBase330_1");
		// Assert
		assert.strictEqual(objectPageBlockBase1.getShowSubSectionMore(), true, "Object Page Block Base 1: showSubSectionMore set with true successfuly");
	});
	QUnit.test("ObjectPageBlockBase_2 showSubSectionMore false", function (assert) {
		// Act
		const objectPageBlockBase2 = this.objectPageSampleView.byId("ObjectPageBlockBase330_2");
		// Assert
		assert.strictEqual(objectPageBlockBase2.getShowSubSectionMore(), false, "Object Page Block Base 2: showSubSectionMore set with false successfuly");
	});
	QUnit.test("ObjectPageBlockBase_3 showSubSectionMore false", function (assert) {
		// Act
		const objectPageBlockBase3 = this.objectPageSampleView.byId("ObjectPageBlockBase330_3");
		// Assert
		assert.strictEqual(objectPageBlockBase3.getShowSubSectionMore(), true, "Object Page Block Base 3: showSubSectionMore set with true successfuly");
	});
	QUnit.test("ObjectPageBlockBase_4 showSubSectionMore false", function (assert) {
		// Act
		const objectPageBlockBase4 = this.objectPageSampleView.byId("ObjectPageBlockBase330_4");
		// Assert
		assert.strictEqual(objectPageBlockBase4.getShowSubSectionMore(), false, "Object Page Block Base 4: showSubSectionMore set with false successfuly");
	});
	QUnit.test("ObjectPageBlockBase_5 getSupportedModes", function (assert) {
		// Act
		const objectPageBlockBase4 = this.objectPageSampleView.byId("ObjectPageBlockBase330_4");
		// Assert
		assert.strictEqual(isEmptyObject(objectPageBlockBase4.getSupportedModes()), false, "Object Page Block Base 5: can get the supportedModes");
	});
	QUnit.test("ObjectPageSubSection330_0: showSubSectionMore set with default value", function (assert) {
		// Act
		const objectPageSubSectionSeeMore0 = $("#UxAP-330_PropertyOnBlockToSayIfItHaveMoreInfoToDisplay--ObjectPageSubSection330_0--seeMore").is(":visible");
		// Assert
		assert.strictEqual(objectPageSubSectionSeeMore0, false, "Object Page SubSection 0: 1 block with showSubSectionMore default value, seeMore not visible");
	});
	QUnit.test("ObjectPageSubSection330_1: 1 block with showSubSectionMore true", function (assert) {
		// Act
		const objectPageSubSectionSeeMore1 = $("#UxAP-330_PropertyOnBlockToSayIfItHaveMoreInfoToDisplay--ObjectPageSubSection330_1--seeMore").is(":visible");
		// Assert
		assert.strictEqual(objectPageSubSectionSeeMore1, true, "Object Page SubSection 1: 1 block with showSubSectionMore true, seeMore visible");
	});
	QUnit.test("ObjectPageSubSection330_2: 1 block with showSubSectionMore false", function (assert) {
		// Act
		const objectPageSubSectionSeeMore2 = $("#UxAP-330_PropertyOnBlockToSayIfItHaveMoreInfoToDisplay--ObjectPageSubSection330_2--seeMore").is(":visible");
		// Assert
		assert.strictEqual(objectPageSubSectionSeeMore2, false, "Object Page SubSection 2; 1 block with showSubSectionMore false, seeMore not visible");
	});
	QUnit.test("ObjectPageSubSection330_3: 1 block set to true the other set to false", function (assert) {
		// Act
		const objectPageSubSectionSeeMore3 = $("#UxAP-330_PropertyOnBlockToSayIfItHaveMoreInfoToDisplay--ObjectPageSubSection330_3--seeMore").is(":visible");
		// Assert
		assert.strictEqual(objectPageSubSectionSeeMore3, true, "Object Page SubSection 3: 1 block set to true the other set to false, seeMore visible");
	});
	QUnit.test("ObjectPageSubSection330_4: all block set showSubSectionMore value to false", function (assert) {
		// Act
		const objectPageSubSectionSeeMore4 = $("#UxAP-330_PropertyOnBlockToSayIfItHaveMoreInfoToDisplay--ObjectPageSubSection330_4--seeMore").is(":visible");
		// Assert
		assert.strictEqual(objectPageSubSectionSeeMore4, false, "Object Page SubSection 4: all block set showSubSectionMore value to false, seeMore not visible");
	});

});
