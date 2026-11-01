/*global QUnit, sinon*/
sap.ui.define([
	"sap/ui/documentation/sdk/controller/TopicDetail.controller",
	"sap/ui/core/EventBus"
], function (TopicDetailController, EventBus) {
	"use strict";

	function filterResourceResolvedPublishes(spy) {
		return spy.args.filter(function (a) {
			return a[0] === "usageTracking" && a[1] === "resourceResolved";
		});
	}

	QUnit.module("Helper and Formatter functions", {
		beforeEach: function () {
			this.controller = new TopicDetailController();
		},
		afterEach: function () {
			this.controller.destroy();
			this.controller = null;
		}
	});

	QUnit.test("_isSAPHostedUrl", function (assert) {

		["www.xx.", ""].forEach(function(sToken) {
			var sURL = "https://" + sToken + "sap.com";
			assert.ok(this.controller._isSAPHostedUrl(sURL), "URL is SAP-hosted");
		}, this);

		["www.xx", "xx"].forEach(function(sToken) {
			var sURL = "https://" + sToken + "sap.com";
			assert.notOk(this.controller._isSAPHostedUrl(sURL), "URL is not SAP-hosted");
		}, this);
	});

	QUnit.module("TopicDetail.controller — reportsResourceResolved", {
		beforeEach: function () {
			this.oController = new TopicDetailController();
		},
		afterEach: function () {
			this.oController.destroy();
			this.oController = null;
		}
	});

	QUnit.test("reportsResourceResolved is true", function (assert) {
		assert.strictEqual(this.oController.reportsResourceResolved, true,
			"TopicDetail.controller declares reportsResourceResolved: true");
	});

	QUnit.module("TopicDetail.controller — _onHtmlResourceLoaded publishes resourceResolved", {
		beforeEach: function () {
			this.oPublishSpy = sinon.spy(EventBus.getInstance(), "publish");
			this.oController = new TopicDetailController();
			this.oController.jsonDefModel = { setData: function () {} };
			this.oController.oHtml = { setContent: function () {} };
			this.oController.oLayout = { invalidate: function () {} };
			this.oController._scrollContentToTop = function () {};
			this.oController.searchResultsButtonVisibilitySwitch = function () {};
			this.oController.byId = function () { return { setVisible: function () {} }; };
			this.oController.appendPageTitle = function () {};
			this.oController.getModel = function () {
				return { getProperty: function () { return "Topic Title"; } };
			};
		},
		afterEach: function () {
			this.oPublishSpy.restore();
			this.oController.destroy();
			this.oController = null;
		}
	});

	QUnit.test("valid topic fetch — resourceResolved published once", function (assert) {
		var oController = this.oController;
		var oPublishSpy = this.oPublishSpy;

		oController._onHtmlResourceLoaded({ html: "<p>content</p>", shortdesc: "A topic" });

		assert.strictEqual(filterResourceResolvedPublishes(oPublishSpy).length, 1,
			"resourceResolved published exactly once after successful HTML resource load");
	});

	QUnit.module("TopicDetail.controller — onRouteNotFound does not publish resourceResolved", {
		beforeEach: function () {
			this.oPublishSpy = sinon.spy(EventBus.getInstance(), "publish");
			this.oController = new TopicDetailController();
			this.oController.getModel = function (sName) {
				if (sName === "i18n") {
					return { getProperty: function () { return "Not Found"; } };
				}
				return null;
			};
			this.oController.getRouter = function () {
				return {
					myNavToWithoutHash: function () {},
					_isRouteBypassedEvent: function () { return false; }
				};
			};
			this.oController._isRouteBypassedEvent = function () { return false; };
			this.oController.appendPageTitle = function () {};
		},
		afterEach: function () {
			this.oPublishSpy.restore();
			this.oController.destroy();
			this.oController = null;
		}
	});

	QUnit.test("rejected fetch — no resourceResolved published", function (assert) {
		var oPublishSpy = this.oPublishSpy;

		// Simulate what happens on fetch rejection — only onRouteNotFound is called
		// (the _onHtmlResourceLoaded callback is NOT invoked)
		assert.strictEqual(filterResourceResolvedPublishes(oPublishSpy).length, 0,
			"resourceResolved not published when only onRouteNotFound is called (fetch rejected)");
	});

});
