/*global QUnit, sinon*/

sap.ui.define([
	"sap/ui/core/mvc/XMLView",
	"sap/ui/core/StashedControlSupport",
	"sap/ui/test/utils/nextUIUpdate",
	"sap/uxap/ObjectPageLazyLoader"
],
function(XMLView, StashedSupport, nextUIUpdate, ObjectPageLazyLoader) {
	"use strict";

	/**
	 * Returns a Promise that resolves after the ObjectPageLayout fires onAfterRenderingDOMReady.
	 * @param {sap.uxap.ObjectPageLayout} oOPL
	 * @returns {Promise<void>}
	 */
	function waitForDOMReady(oOPL) {
		return new Promise((resolve) => {
			oOPL.attachEventOnce("onAfterRenderingDOMReady", resolve);
		});
	}

	QUnit.module("Stashing Tests", {
		beforeEach: function (assert) {
			const done = assert.async();
			XMLView.create({
				id: "UxAP-12-ObjectPageSubSectionStashing",
				viewName: "view.UxAP-12-ObjectPageSubSectionStashing"
			}).then(async function(oView) {
				this.objectPageSampleView = oView;
				this.objectPageSampleView.placeAt('qunit-fixture');
				await nextUIUpdate();
				done();
			}.bind(this));
		},
		afterEach: function () {
			this.objectPageSampleView.destroy();
		}
	});

	QUnit.test("ObjectPageSubSection stashing", async function (assert) {
		assert.expect(8);
		// Arrange
		const oTestedSection = this.objectPageSampleView.byId("subsection10");
		const oDestroySpy = sinon.spy(ObjectPageLazyLoader.prototype, "destroy");
		const oLazyLoaderRemoveAllContentSpy = sinon.spy(ObjectPageLazyLoader.prototype, "removeAllContent");
		const stashedObjects = 3;

		const aBlocks = oTestedSection.getBlocks();

		// Assert initial state
		assert.equal(aBlocks.length, 0, "There are no blocks in the section");

		// Act
		await oTestedSection.connectToModelsAsync();

		// Assert
		assert.equal(oTestedSection.getBlocks().length, stashedObjects, "Blocks successfully unstashed");
		assert.equal(StashedSupport.getStashedControls(oTestedSection.getId()).length, 0, "There are no blocks left to unstash");

		oTestedSection.getBlocks().forEach((oContent) => {
			assert.ok(oContent.isA("sap.m.Toolbar"), "The correct content is inside the blocks aggregation");
		});

		assert.equal(oLazyLoaderRemoveAllContentSpy.callCount, stashedObjects,
			"Remove all content from the LazyLoader so it can be properly destroyed.");

		// destroy is called once from <code>sap.ui.core.StashedControlSupport</code> after unstashing,
		// and then a second time from <code>sap.uxap.ObjectPageSubSection</code> after emptying the unstashed content
		assert.equal(oDestroySpy.callCount, stashedObjects, "LazyLoaders are properly disposed of");
	});

	QUnit.test("ObjectPageSubSection async unstashing does not throw an error if a control is already unstashed", async function (assert) {
		assert.expect(1);
		// Arrange
		const oTestedSection = this.objectPageSampleView.byId("subsection10");
		const oStashedControl = oTestedSection._aStashedControls[0].control;

		this.stub(oStashedControl, "isStashed").returns(false);

		// Act
		await oTestedSection.connectToModelsAsync();

		// Assert
		assert.ok(true, "No error is thrown");
	});

	QUnit.module("Stashing optimization", {
		beforeEach: function (assert) {
			const done = assert.async();
			XMLView.create({
				id: "UxAP-12-ObjectPageSubSectionStashing-Optimization",
				viewName: "view.UxAP-12-ObjectPageSubSectionStashing-Optimization"
			}).then(async function(oView) {
				this.objectPageSampleView = oView;
				this.objectPageSampleView.placeAt('qunit-fixture');
				await nextUIUpdate();
				done();
			}.bind(this));
		},
		afterEach: function () {
			this.objectPageSampleView.destroy();
		}
	});

	QUnit.test("ObjectPageSubSection unstashing improved", async function (assert) {
		// Arrange
		const oOpl = this.objectPageSampleView.byId("ObjectPageLayout");
		const oSection1 = this.objectPageSampleView.byId("subsection1");
		const oSection2 = this.objectPageSampleView.byId("subsection2");
		const oSection4 = this.objectPageSampleView.byId("subsection4");

		assert.expect(6);

		// Act + Assert — wait for OPL internal DOM-ready event
		await waitForDOMReady(oOpl);

		// Assert
		assert.strictEqual(oSection1._aStashedControls.length, 0, "First SubSection is unstashed");
		assert.ok(!oSection1.$().hasClass("sapUxAPObjectPageSubSectionStashed"), "sapUxAPObjectPageSubSectionStashed class is not added to first SubSection");
		assert.strictEqual(oSection2._aStashedControls.length, 0, "Second SubSection is unstashed");
		assert.ok(!oSection2.$().hasClass("sapUxAPObjectPageSubSectionStashed"), "sapUxAPObjectPageSubSectionStashed class is not added to second SubSection");
		assert.strictEqual(oSection4._aStashedControls.length, 1, "Forth SubSection is not unstashed after optimization");
		assert.ok(oSection4.$().hasClass("sapUxAPObjectPageSubSectionStashed"), "sapUxAPObjectPageSubSectionStashed class is added to forth SubSection");
	});

});
