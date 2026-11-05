/*global QUnit, sinon*/
sap.ui.define([
	"sap/ui/documentation/sdk/controller/App.controller",
	"sap/ui/core/EventBus"
], function (AppController, EventBus) {
	"use strict";

	QUnit.module("App.controller — _startUsageTracking", {
		beforeEach: function () {
			this.sandbox = sinon.createSandbox();
			this.oController = new AppController();
			this.oBus = EventBus.getInstance();

			// Set up the state that onInit establishes before the consent check
			this.oController.bus = this.oBus;
			this.oController._aRouterCachedEventDetails = [];

			// Subscribe the pre-consent handler, as onInit does
			this.oBus.subscribe("usageTracking", "resourceResolved",
				this.oController._onResourceResolvedBeforeConsent, this.oController);

			// Mock the two dependencies _startUsageTracking calls
			this.oMockTracker = { start: sinon.spy() };
			this.oController.getOwnerComponent = function () {
				return { getUsageTracker: function () { return this.oMockTracker; }.bind(this) };
			}.bind(this);
		},
		afterEach: function () {
			// idempotent — harmless if already removed by the test
			this.oBus.unsubscribe("usageTracking", "resourceResolved",
				this.oController._onResourceResolvedBeforeConsent, this.oController);
			this.sandbox.restore();
			this.oController.destroy();
			this.oController = null;
		}
	});

	QUnit.test("_onResourceResolvedBeforeConsent caches resourceResolved events before start()", function (assert) {
		this.oBus.publish("usageTracking", "resourceResolved");

		assert.strictEqual(this.oController._aRouterCachedEventDetails.length, 1,
			"pre-consent resourceResolved is cached");
		assert.deepEqual(this.oController._aRouterCachedEventDetails[0], { eventId: "resourceResolved" },
			"cached entry has correct shape");
	});

	QUnit.test("_startUsageTracking starts UsageTracker with cached events", function (assert) {
		this.oController._aRouterCachedEventDetails = [{ eventId: "routeMatched" }, { eventId: "resourceResolved" }];

		this.oController._startUsageTracking("1.0.0");

		assert.ok(this.oMockTracker.start.calledOnce, "UsageTracker.start() called once");
		assert.strictEqual(this.oMockTracker.start.args[0][0], "1.0.0", "version name forwarded");
		assert.deepEqual(this.oMockTracker.start.args[0][1],
			[{ eventId: "routeMatched" }, { eventId: "resourceResolved" }],
			"cached event array forwarded to start()");
	});

	QUnit.test("_startUsageTracking clears the cache after start()", function (assert) {
		this.oController._aRouterCachedEventDetails = [{ eventId: "routeMatched" }];

		this.oController._startUsageTracking("1.0.0");

		assert.strictEqual(this.oController._aRouterCachedEventDetails.length, 0,
			"cache is cleared after start()");
	});

	QUnit.test("after _startUsageTracking, resourceResolved publish does not push to cache", function (assert) {
		this.oController._startUsageTracking("1.0.0");

		// simulate a deferred-route navigation that fires resourceResolved post-consent
		this.oBus.publish("usageTracking", "resourceResolved");

		assert.strictEqual(this.oController._aRouterCachedEventDetails.length, 0,
			"resourceResolved after start() does not push to _aRouterCachedEventDetails");
	});

	QUnit.test("pre-consent resourceResolved events are passed to start() before the cache is cleared", function (assert) {
		this.oController._aRouterCachedEventDetails = [{ eventId: "resourceResolved" }];

		// Spy on start() to capture what was in the array AT the time start() was called
		var aCapturedCache;
		this.oMockTracker.start = function (sVersion, aCache) {
			aCapturedCache = aCache.slice(); // snapshot at call time
		};

		this.oController._startUsageTracking("1.0.0");

		assert.deepEqual(aCapturedCache, [{ eventId: "resourceResolved" }],
			"pre-consent resourceResolved event is present when start() is called (replay not lost)");
		assert.strictEqual(this.oController._aRouterCachedEventDetails.length, 0,
			"cache is cleared after start() returns");
	});
});
