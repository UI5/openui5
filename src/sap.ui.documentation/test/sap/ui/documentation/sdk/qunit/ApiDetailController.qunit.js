/*global QUnit, sinon*/
sap.ui.define([
	"sap/ui/documentation/sdk/controller/ApiDetail.controller",
	"sap/ui/core/EventBus"
], function (ApiDetailController, EventBus) {
	"use strict";

	function filterResourceResolvedPublishes(spy) {
		return spy.args.filter(function (a) {
			return a[0] === "usageTracking" && a[1] === "resourceResolved";
		});
	}

	QUnit.module("ApiDetail.controller — reportsResourceResolved", {
		beforeEach: function () {
			this.oController = new ApiDetailController();
		},
		afterEach: function () {
			this.oController.destroy();
			this.oController = null;
		}
	});

	QUnit.test("reportsResourceResolved is true", function (assert) {
		assert.strictEqual(this.oController.reportsResourceResolved, true,
			"ApiDetail.controller declares reportsResourceResolved: true");
	});

	QUnit.module("ApiDetail.controller — _initSubView publishes resourceResolved", {
		beforeEach: function () {
			this.oPublishSpy = sinon.spy(EventBus.getInstance(), "publish");
			this.oController = new ApiDetailController();
			this.oController._oContainerPage = {
				setBusy: function () {},
				addContent: function () {}
			};
			this.oController.getOwnerComponent = function () { return {}; };
			this.oController.getView = function () { return {}; };
		},
		afterEach: function () {
			this.oPublishSpy.restore();
			this.oController.destroy();
			this.oController = null;
		}
	});

	QUnit.test("single visit — _initSubView publishes resourceResolved once", function (assert) {
		var oController = this.oController;
		var oPublishSpy = this.oPublishSpy;

		oController._sTopicid = "sap.Button";
		var oMockSubController = { initiate: function () {}, scrollToEntity: function () {} };
		var oMockView = {
			data: function () { return "sap.Button"; },
			getController: function () { return oMockSubController; },
			destroy: function () {},
			bIsDestroyed: false
		};

		oController._initSubView(oMockView);

		assert.strictEqual(filterResourceResolvedPublishes(oPublishSpy).length, 1,
			"resourceResolved published exactly once on successful view initialisation");
	});

	QUnit.test("outdated view — _initSubView does NOT publish resourceResolved", function (assert) {
		var oController = this.oController;
		var oPublishSpy = this.oPublishSpy;

		oController._sTopicid = "sap.Button"; // current topic
		var oOutdatedView = {
			data: function () { return "sap.OldThing"; }, // stale
			destroy: function () {},
			getController: function () { return {}; }
		};

		oController._initSubView(oOutdatedView);

		assert.strictEqual(filterResourceResolvedPublishes(oPublishSpy).length, 0,
			"resourceResolved not published when the view is outdated (superseded by a newer route)");
	});

	QUnit.module("ApiDetail.controller — _onTopicMatched revisit branch", {
		beforeEach: function () {
			this.oPublishSpy = sinon.spy(EventBus.getInstance(), "publish");
			this.oController = new ApiDetailController();
			this.oController._oContainerPage = {
				setBusy: function () {},
				addContent: function () {}
			};
			this.oController.getOwnerComponent = function () {
				return { loadVersionInfo: function () { return new Promise(function () {}); } };
			};
			this.oController.getRouter = function () {
				return { _decodeSpecialRouteArguments: function (a) { return a; } };
			};
		},
		afterEach: function () {
			this.oPublishSpy.restore();
			this.oController.destroy();
			this.oController = null;
		}
	});

	function makeRouteEvent(sId) {
		var oArgs = { id: sId, entityType: undefined, entityId: undefined };
		return {
			getParameter: function (sName) {
				return sName === "arguments" ? oArgs : null;
			},
			getParameters: function () {
				return { arguments: oArgs };
			}
		};
	}

	QUnit.test("revisit same symbol — resourceResolved published synchronously", function (assert) {
		var oController = this.oController;
		var oPublishSpy = this.oPublishSpy;

		// Simulate that sap.Button was already displayed
		oController._sTopicid = "sap.Button";
		oController._oView = {
			getController: function () { return { scrollToEntity: function () {} }; },
			bIsDestroyed: false,
			destroy: function () {}
		};

		oController._onTopicMatched(makeRouteEvent("sap.Button"));

		assert.strictEqual(filterResourceResolvedPublishes(oPublishSpy).length, 1,
			"resourceResolved published synchronously when revisiting the same already-displayed symbol");
	});

	QUnit.test("two revisits to same symbol — resourceResolved published on each", function (assert) {
		var oController = this.oController;
		var oPublishSpy = this.oPublishSpy;

		oController._sTopicid = "sap.Button";
		oController._oView = {
			getController: function () { return { scrollToEntity: function () {} }; },
			bIsDestroyed: false,
			destroy: function () {}
		};

		oController._onTopicMatched(makeRouteEvent("sap.Button"));
		oController._onTopicMatched(makeRouteEvent("sap.Button"));

		assert.strictEqual(filterResourceResolvedPublishes(oPublishSpy).length, 2,
			"resourceResolved published on every revisit of the same symbol");
	});

	QUnit.test("navigation to a different symbol — does NOT hit the revisit branch", function (assert) {
		var oController = this.oController;
		var oPublishSpy = this.oPublishSpy;

		// sap.Button is displayed; navigate to sap.Input (different symbol)
		oController._sTopicid = "sap.Button";
		oController._oView = {
			getController: function () { return { scrollToEntity: function () {} }; },
			bIsDestroyed: false,
			destroy: function () {}
		};

		oController._onTopicMatched(makeRouteEvent("sap.Input"));

		// resourceResolved must not be published synchronously on the non-revisit path
		assert.strictEqual(filterResourceResolvedPublishes(oPublishSpy).length, 0,
			"resourceResolved not published synchronously when navigating to a new symbol");
	});
});
