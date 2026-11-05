/*global QUnit*/
sap.ui.define([
	"sap/ui/documentation/sdk/controller/Code.controller",
	"sap/ui/Device",
	"sap/ui/core/EventBus",
	"sap/ui/documentation/sdk/controller/util/ControlsInfo"
],
function (
	CodeController,
	Device,
	EventBus,
	ControlsInfo
) {
	"use strict";

	QUnit.module("_createHTMLControl", {
		beforeEach: function () {
			this.controller = new CodeController();
			this.controller.sIFrameUrl = "https://sdk.example.com/index.html?sap-ui-xx-sample-id=sample.id";
		},
		afterEach: function () {
			this.controller.destroy();
			this.controller = null;
		}
	});

	QUnit.test("HTML content does not contain the iframe src URL", function (assert) {
		var oControl = this.controller._createHTMLControl();
		var sContent = oControl.getContent();

		assert.notOk(
			sContent.indexOf(this.controller.sIFrameUrl) !== -1,
			"sIFrameUrl must not appear inside the HTML content string"
		);
		assert.notOk(
			/src\s*=/i.test(sContent),
			"HTML content must not contain a src attribute"
		);

		oControl.destroy();
	});

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

	QUnit.module("resourceResolved", {
		beforeEach: function () {
			this.controller = new CodeController();
			this.publishSpy = this.spy(EventBus.getInstance(), "publish");
		},
		afterEach: function () {
			this.controller.destroy();
			this.controller = null;
		}
	});

	QUnit.test("valid code page publishes resourceResolved exactly once; _loadSample does not add extra publish", function (assert) {
		var done = assert.async();
		var oSampleData = { id: "test.sample", files: [] };

		this.controller.oModel = {
			getData: function() { return {}; },
			setData: function() {},
			setProperty: function() {},
			getProperty: function() { return undefined; }
		};

		this.stub(ControlsInfo, "loadData").returns(Promise.resolve({ samples: {} }));
		this.stub(this.controller, "_loadCode").returns(Promise.resolve(oSampleData));
		this.stub(this.controller, "_getPage").returns({ setBusy: function() {} });
		this.stub(this.controller, "onRouteNotFound");
		this.stub(this.controller, "_showCode");

		this.controller._loadCodeAndSample();

		setTimeout(function () {
			assert.strictEqual(
				this.publishSpy.withArgs("usageTracking", "resourceResolved").callCount,
				1,
				"resourceResolved is published exactly once on success; _loadSample (not-found path) adds no extra publish"
			);
			done();
		}.bind(this), 0);
	});

	QUnit.test("code not found: no resourceResolved published", function (assert) {
		var done = assert.async();

		this.stub(ControlsInfo, "loadData").returns(Promise.resolve({}));
		this.stub(this.controller, "_loadCode").returns(Promise.reject(new Error("not found")));
		this.stub(this.controller, "_loadSample").returns(Promise.resolve(false));
		this.stub(this.controller, "_showCacheCleanupDialog");

		this.controller._loadCodeAndSample(true);

		setTimeout(function () {
			assert.strictEqual(
				this.publishSpy.withArgs("usageTracking", "resourceResolved").callCount,
				0,
				"resourceResolved must not be published when code is not found"
			);
			done();
		}.bind(this), 0);
	});

});
