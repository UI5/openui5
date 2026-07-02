/*global QUnit, sinon*/

sap.ui.define(["sap/uxap/ObjectPageLayout"],
function (ObjectPageLayout) {
	"use strict";

	const iLoadingDelay = 2500;

	QUnit.module("Rescheduling", {
		beforeEach: function () {
			this.oPage = new ObjectPageLayout();
		},
		afterEach: function () {
			this.oPage.destroy();
		}
	});

	QUnit.test("task arguments are preserved on rescheduling", function (assert) {
		// Arrange
		this.clock = sinon.useFakeTimers();
		const oPage = this.oPage;
		const oSpy = this.spy(oPage, "_updateScreenHeightSectionBasesAndSpacer");

		// Act
		//schedule WITH lazy loading
		oPage._requestAdjustLayout(true);

		this.clock.tick(iLoadingDelay);

		// Assert
		assert.ok(oSpy.calledOnce, "The lazyloading request is preserved");
	});

});
