/*global QUnit*/
sap.ui.define([
	"sap/ui/documentation/sdk/controller/Code.controller",
	"sap/ui/Device"
],
function (
	CodeController,
	Device
) {
	"use strict";

	QUnit.module("onExit", {
		beforeEach: function () {
			this.controller = new CodeController();
			this.controller._onResize = function() {}; // Simulate the resize handler
		},
		afterEach: function () {
			this.controller.destroy();
			this.controller = null;
		}
	});

	QUnit.test("removes resize event listener on exit", function (assert) {
		// Arrange
		var spy = this.spy(Device.media, "detachHandler");

		// Act
		this.controller.onExit();

		// Assert
		assert.ok(spy.calledWith(this.controller._onResize, this.controller),
			"Device.media.detachHandler should be called with the resize handler and controller context");
	});

	QUnit.test("calls parent onExit", function (assert) {
		// Arrange
		var parentOnExitSpy = this.spy(CodeController.getMetadata().getParent().getClass().prototype, "onExit");

		// Act
		this.controller.onExit();

		// Assert
		assert.ok(parentOnExitSpy.calledOnce, "Parent controller's onExit should be called");
		assert.ok(parentOnExitSpy.calledOn(this.controller), "Parent controller's onExit should be called with correct context");
	});

});
