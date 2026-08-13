/*global QUnit, sinon*/
sap.ui.define([
	"sap/ui/documentation/sdk/controller/util/UsageTracker",
	"sap/base/i18n/Localization"],
function (UsageTracker, Localization) {
	"use strict";

	const testRouteTitle = "test title",
		sVersionName = {
			"openui5": "OpenUI5 Distribution",
			"sapui5": "SAPUI5 Distribution"
		},
		sSiteName = {
			"openui5": "oui5",
			"sapui5": "ui5"
		},
		trackerEventId = {
			"sessionStart": "globalDL",
			"pageView": "pageView",
			"publish": "stBeaconReady"
		};

	var oFactory = (function () {
		return {
			getAppComponent: function() {
				var oMockAppComponent = createMockAppComponent(),
					oMockRouter = createMockRouter();
				associateRouterWithComponent(oMockRouter, oMockAppComponent);

				// keep in closure to prevent being called directly from outside
				function createMockAppComponent() {
					return {
						getConfig: function() {
							return {};
						}
					};
				}
				function createMockRouter() {
					return {
						attachRouteMatched: function () {}, // not relevant to this test
						attachBypassed: function () {}, // not relevant to this test
						attachEvent: function () {}, // not relevant to this test
						detachRouteMatched: function () {}, // not relevant to this test
						detachBypassed: function () {}, // not relevant to this test
						detachEvent: function () {}, // not relevant to this test
						getRouteTopLevelTitle: function () {
							return testRouteTitle;
						},
						getRouteConfig: function (sName) {
							return {name: sName};
						}
					};
				}

				function associateRouterWithComponent(oRouter, oMockAppComponent) {
					oMockAppComponent.getRouter = function () {
						return oRouter;
					};
					oRouter._getOwnerComponent = function () {
						return oMockAppComponent;
					};
				}
				return oMockAppComponent;
			},
			getRouteMatchEventParameters: function (sRouteName){
				return {
					eventId: "routeMatched",
					name: sRouteName,
					config: {
						name: sRouteName
					}
				};
			},
			getSessionStartEventObject: function(sSiteName) {
				return {
					event: trackerEventId.sessionStart,
					site: {
						name: sSiteName
					},
					'user': {
						'loginStatus': 'no'
					}
				};
			}
		};
	})();

	QUnit.module("getPageInfo", {
		before: function () {
			this.oTracker = new UsageTracker(oFactory.getAppComponent());
			this.oTracker.start(sVersionName.sapui5);
		},
		beforeEach: function () {
			this.sandbox = sinon.createSandbox();
			this.sandbox.stub(this.oTracker, "_composeDefaultPageTitleFromRoute")
				.returns(""); // not relevant to this test
		},
		after: function () {
			this.oTracker.destroy();
			this.oTracker = null;
		},
		afterEach: function () {
			this.sandbox.restore();
		}
	});

	QUnit.test("tracks correct section for each route", function (assert) {
		var sRouteName = "apiId",
			oRouteConfig = {
				name: sRouteName
			},
			oRouteMatchEventParameters = {
				config: oRouteConfig
			};
		this.oTracker._getPageInfoFromRoute(oRouteMatchEventParameters, function (oPageInfo) {
			var sSection = oPageInfo.section;
			assert.strictEqual(sSection, testRouteTitle, "section for route " + sRouteName + " is defined");
		});
	});

	QUnit.test("tracks localization info", function (assert) {
		var oUserLanguageTag = Localization.getLanguageTag(),
			sExpectedLanguage = oUserLanguageTag.language,
			sExpectedLocale = oUserLanguageTag.toString(),
			oRouteMatchEventParameters = oFactory.getRouteMatchEventParameters("apiId");

		this.oTracker._getPageInfoFromRoute(oRouteMatchEventParameters, function (oPageInfo) {
			assert.equal(oPageInfo.language, sExpectedLanguage, "language is correct");
			assert.equal(oPageInfo.locale, sExpectedLocale, "locale is correct");
			assert.equal(oPageInfo.country, "glo", "country is always 'glo' for global site");
		});
	});

	QUnit.module("session-start event", {
		beforeEach: function () {
			this.oTracker = new UsageTracker(oFactory.getAppComponent());
			this.sandbox = sinon.createSandbox();
			this.sandbox.stub(this.oTracker, "_composeDefaultPageTitleFromRoute")
				.returns(""); // not relevant to this test
		},
		afterEach: function () {
			this.oTracker.destroy();
			this.oTracker = null;
			this.sandbox.restore();
		}
	});

	QUnit.test("result of _getSiteName is correct", function (assert) {
		// act
		var sTracketVersionNameSAPUI5 = this.oTracker._getSiteName(sVersionName.sapui5),
			sTracketVersionNameOpenui5 = this.oTracker._getSiteName(sVersionName.openui5);

		// assert
		assert.strictEqual(sTracketVersionNameSAPUI5, sSiteName.sapui5, "Site name for SAPUI6 is correct as expected by remote site-registry (AA-side)");
		assert.strictEqual(sTracketVersionNameOpenui5, sSiteName.openui5, "Site name for OpenUI5 is correct as expected by remote site-registry (AA-side)");
	});

	QUnit.test("session-start event is logged", function (assert) {
		var oSpy = this.sandbox.spy(this.oTracker, "_addToLogs"),
			sTestSiteName = "testSiteName",
			oExpectedEventContent = oFactory.getSessionStartEventObject(sTestSiteName);
		this.sandbox.stub(this.oTracker, "_getSiteName").returns(sTestSiteName);

		// act
		this.oTracker.start();

		// assert
		assert.ok(oSpy.calledOnceWithExactly, oExpectedEventContent, "session-start is logged with correct content");
	});

	QUnit.test("session-start event precedes pageView events", function (assert) {
		var oAddToLogsSpy = this.sandbox.spy(this.oTracker, "_addToLogs"),
			sTestSiteName = "testSiteName",
			oMockRouteEventDetail = oFactory.getRouteMatchEventParameters("welcome");

		// act
		this.oTracker.start(sTestSiteName, [oMockRouteEventDetail]);

		// assert low level logs order
		assert.ok(oAddToLogsSpy.calledThrice, "3 events are logged");
		assert.ok(oAddToLogsSpy.firstCall.calledWithMatch({event: trackerEventId.sessionStart}), "first event is for session-start");
		assert.ok(oAddToLogsSpy.secondCall.calledWithMatch({event: trackerEventId.pageView}), "second event is for pageView");
		assert.ok(oAddToLogsSpy.lastCall.calledWithMatch({event: trackerEventId.publish}), "last event is for publishing the logs");
	});

	QUnit.module("page re-visit", {
		beforeEach: function () {
			this.oTracker = new UsageTracker(oFactory.getAppComponent());
			this.sandbox = sinon.createSandbox();
			this.sandbox.stub(this.oTracker, "_composeDefaultPageTitleFromRoute")
				.returns(""); // not relevant to this test
		},
		afterEach: function () {
			this.oTracker.destroy();
			this.oTracker = null;
			this.sandbox.restore();
		}
	});

	QUnit.test("duplicate routeMatched event is ignored", function (assert) {
		var oAddToLogsSpy = this.sandbox.spy(this.oTracker, "_addToLogs"),
			sTestSiteName = "testSiteName",
			oMockRouteEventDetail = oFactory.getRouteMatchEventParameters("welcome");

		this.oTracker.start(sTestSiteName);
		oAddToLogsSpy.resetHistory();

		// act
		this.oTracker._logRouteMatched(oMockRouteEventDetail);
		assert.ok(oAddToLogsSpy.firstCall.calledWithMatch({event: trackerEventId.pageView}), "page-view event is logged");
		assert.ok(oAddToLogsSpy.secondCall.calledWithMatch({event: trackerEventId.publish}), "page-view event is logged");

		oAddToLogsSpy.resetHistory();

		// act: log the same event again
		this.oTracker._logRouteMatched(oMockRouteEventDetail);
		assert.strictEqual(oAddToLogsSpy.callCount, 0, "the duplicate event is ignored");
	});

	QUnit.test("lofs page re-visit after restarting the tracker", function (assert) {
		var oAddToLogsSpy = this.sandbox.spy(this.oTracker, "_addToLogs"),
			sTestSiteName = "testSiteName",
			oMockRouteEventDetail = oFactory.getRouteMatchEventParameters("welcome");

		this.oTracker.start(sTestSiteName);
		oAddToLogsSpy.resetHistory();

		// act: log first route
		this.oTracker._logRouteMatched(oMockRouteEventDetail);
		assert.ok(oAddToLogsSpy.calledTwice, "page-view event is logged");

		this.oTracker.stop();
		this.oTracker.start(sTestSiteName);
		oAddToLogsSpy.resetHistory();

		// act: revisit first route again
		this.oTracker._logRouteMatched(oMockRouteEventDetail);
		assert.ok(oAddToLogsSpy.calledTwice, "page-view event is logged");
	});

	QUnit.module("logActivityMapEvent", {
		beforeEach: function () {
			this.oTracker = new UsageTracker(oFactory.getAppComponent());
			this.sandbox = sinon.createSandbox();
		},
		afterEach: function () {
			this.oTracker.destroy();
			this.oTracker = null;
			this.sandbox.restore();
		}
	});

	QUnit.test("logs activityMap event with correct structure", function (assert) {
		var oAddToLogsSpy = this.sandbox.spy(this.oTracker, "_addToLogs");
		this.oTracker.start("testSiteName");
		oAddToLogsSpy.resetHistory();

		// act
		this.oTracker.logActivityMapEvent({
			region: "body",
			link: "download",
			destination: "no destination"
		});

		// assert
		assert.ok(oAddToLogsSpy.calledTwice, "two events are logged (activityMap event + beacon)");
		assert.ok(oAddToLogsSpy.firstCall.calledWithMatch({
			event: "activityMap",
			activityMap: {
				region: "body",
				link: "download",
				destination: "no destination"
			}
		}), "activityMap event has correct structure");
	});

	QUnit.test("fires stlBeaconReady (non-page-view beacon)", function (assert) {
		var oAddToLogsSpy = this.sandbox.spy(this.oTracker, "_addToLogs");
		this.oTracker.start("testSiteName");
		oAddToLogsSpy.resetHistory();

		// act
		this.oTracker.logActivityMapEvent({
			region: "body",
			link: "download",
			destination: "no destination"
		});

		// assert
		assert.ok(oAddToLogsSpy.secondCall.calledWithMatch({
			event: "stlBeaconReady"
		}), "beacon is stlBeaconReady (non-page-view)");
	});

	QUnit.test("passes all activityMap properties through", function (assert) {
		var oAddToLogsSpy = this.sandbox.spy(this.oTracker, "_addToLogs");
		this.oTracker.start("testSiteName");
		oAddToLogsSpy.resetHistory();

		// act
		this.oTracker.logActivityMapEvent({
			region: "footer",
			link: "Company Information",
			destination: "https://www.sap.com/about/company.html"
		});

		// assert
		var oActivityMap = oAddToLogsSpy.firstCall.args[0].activityMap;
		assert.strictEqual(oActivityMap.region, "footer", "region is passed through");
		assert.strictEqual(oActivityMap.link, "Company Information", "link is passed through");
		assert.strictEqual(oActivityMap.destination, "https://www.sap.com/about/company.html", "destination is passed through");
	});

	QUnit.test("is a no-op when tracker is not started", function (assert) {
		var oAddToLogsSpy = this.sandbox.spy(this.oTracker, "_addToLogs");
		// note: do NOT call this.oTracker.start()

		// act
		this.oTracker.logActivityMapEvent({
			region: "body",
			link: "download",
			destination: "no destination"
		});

		// assert
		assert.strictEqual(oAddToLogsSpy.callCount, 0, "nothing is logged when tracker is not started");
	});

	QUnit.test("is a no-op after tracker is stopped", function (assert) {
		var oAddToLogsSpy = this.sandbox.spy(this.oTracker, "_addToLogs");
		this.oTracker.start("testSiteName");
		this.oTracker.stop();
		oAddToLogsSpy.resetHistory();

		// act
		this.oTracker.logActivityMapEvent({
			region: "body",
			link: "download",
			destination: "no destination"
		});

		// assert
		assert.strictEqual(oAddToLogsSpy.callCount, 0, "nothing is logged after tracker is stopped");
	});

	QUnit.test("always uses activityMap as event type", function (assert) {
		var oAddToLogsSpy = this.sandbox.spy(this.oTracker, "_addToLogs");
		this.oTracker.start("testSiteName");
		oAddToLogsSpy.resetHistory();

		// act
		this.oTracker.logActivityMapEvent({
			region: "header",
			link: "navigation",
			destination: "https://example.com"
		});

		// assert
		assert.strictEqual(oAddToLogsSpy.firstCall.args[0].event, "activityMap", "event type is always activityMap");
	});

	// Helper: temporarily navigate to a path+hash for one test via history.replaceState,
	// then restore the original URL. Same-origin only; does not trigger a page reload.
	function withLocationHash(sPathAndHash, fnTest) {
		var sOriginal = window.location.pathname + window.location.search + window.location.hash;
		history.replaceState(null, "", sPathAndHash);
		try {
			fnTest();
		} finally {
			history.replaceState(null, "", sOriginal);
		}
	}

	QUnit.module("PageInfo - name normalization", {
		before: function () {
			this.oTracker = new UsageTracker(oFactory.getAppComponent());
			this.oTracker.start(sVersionName.sapui5);
		},
		beforeEach: function () {
			this.sandbox = sinon.createSandbox();
			this.sandbox.stub(this.oTracker, "_composeDefaultPageTitleFromRoute").returns("");
		},
		after: function () {
			this.oTracker.destroy();
			this.oTracker = null;
		},
		afterEach: function () {
			this.sandbox.restore();
		}
	});

	// Each test drives composePageName via _logPageDataNotFound (null-route branch):
	// that path calls composePageName(window.location.href) and emits error.pageName.
	// window.location is changed via history.replaceState (same-origin, no page reload).
	[
		{ desc: "bare root URL", pathAndHash: "/", expected: "/" },
		{ desc: "root URL with empty hash (#)", pathAndHash: "/#", expected: "/" },
		{ desc: "root URL with hash-slash (#/)", pathAndHash: "/#/", expected: "/" },
		{ desc: "non-root topic hash", pathAndHash: "/#/topic/abc123", expected: "/#/topic/abc123" },
		{ desc: "non-root API hash", pathAndHash: "/#/api/sap.m.Button", expected: "/#/api/sap.m.Button" },
		{ desc: "legacy .html suffix in hash", pathAndHash: "/#/topic/abc.html", expected: "/#/topic/abc" }
	].forEach(function (oCase) {
		QUnit.test(oCase.desc + " -> page.name = \"" + oCase.expected + "\"", function (assert) {
			var oTracker = this.oTracker,
				oAddToLogsSpy = this.sandbox.spy(oTracker, "_addToLogs"),
				oErrorLog;

			withLocationHash(oCase.pathAndHash, function() {
				oTracker._oLastRouteParameters = null;
				oTracker._logPageDataNotFound();
			});

			oErrorLog = oAddToLogsSpy.args.find(function(aArgs) {
				return aArgs[0].event === "errorPage";
			})[0];
			assert.strictEqual(oErrorLog.error.pageName, oCase.expected, oCase.desc);
		});
	});

	QUnit.module("PageInfo - name normalization (integration via _addToLogs)", {
		beforeEach: function () {
			this.oTracker = new UsageTracker(oFactory.getAppComponent());
			this.sandbox = sinon.createSandbox();
			this.sandbox.stub(this.oTracker, "_composeDefaultPageTitleFromRoute").returns("");
		},
		afterEach: function () {
			this.oTracker.destroy();
			this.oTracker = null;
			this.sandbox.restore();
		}
	});

	QUnit.test("pageView event has normalized page.name for root hash URL", function (assert) {
		var oTracker = this.oTracker,
			oAddToLogsSpy = this.sandbox.spy(oTracker, "_addToLogs"),
			oPageViewCall;

		withLocationHash("/#/", function() {
			oTracker.start("testSiteName", [oFactory.getRouteMatchEventParameters("welcome")]);
		});

		oPageViewCall = oAddToLogsSpy.args.find(function(aArgs) {
			return aArgs[0].event === "pageView";
		});
		assert.ok(oPageViewCall, "pageView event was logged");
		assert.strictEqual(oPageViewCall[0].page.name, "/", "page.name is normalized to '/' for root hash URL");
	});

	QUnit.module("PageInfo - _logPageNotFound normalization", {
		beforeEach: function () {
			this.oTracker = new UsageTracker(oFactory.getAppComponent());
			this.sandbox = sinon.createSandbox();
		},
		afterEach: function () {
			this.oTracker.destroy();
			this.oTracker = null;
			this.sandbox.restore();
		}
	});

	[
		{ desc: "empty hash", input: "", expected: "/" },
		{ desc: "root slash hash", input: "/", expected: "/" },
		{ desc: "non-root hash", input: "/topic/abc", expected: "/topic/abc" }
	].forEach(function (oCase) {
		QUnit.test(oCase.desc + " -> error.pageName = \"" + oCase.expected + "\"", function (assert) {
			var oAddToLogsSpy = this.sandbox.spy(this.oTracker, "_addToLogs");
			this.oTracker._logPageNotFound(oCase.input);
			assert.strictEqual(oAddToLogsSpy.firstCall.args[0].error.pageName, oCase.expected, oCase.desc);
		});
	});

	QUnit.module("PageInfo - _logPrecedingRouteVisits normalization", {
		beforeEach: function () {
			this.oTracker = new UsageTracker(oFactory.getAppComponent());
			this.sandbox = sinon.createSandbox();
			this.sandbox.stub(this.oTracker, "_composeDefaultPageTitleFromRoute").returns("");
		},
		afterEach: function () {
			this.oTracker.destroy();
			this.oTracker = null;
			this.sandbox.restore();
		}
	});

	QUnit.test("replay path produces same normalized page.name as live routeMatched event", function (assert) {
		var oTracker = this.oTracker,
			oAddToLogsSpy = this.sandbox.spy(oTracker, "_addToLogs"),
			oMockRouteEvent = oFactory.getRouteMatchEventParameters("welcome"),
			oLivePageView,
			oReplayPageView;

		withLocationHash("/#/", function() {
			oTracker.start("testSiteName");
			oTracker._logRouteMatched(oMockRouteEvent);
		});
		oLivePageView = oAddToLogsSpy.args.find(function(a) { return a[0].event === "pageView"; });

		oTracker.stop();
		oAddToLogsSpy.resetHistory();
		oTracker._oLastRouteParameters = null;

		withLocationHash("/#/", function() {
			oTracker.start("testSiteName", [oMockRouteEvent]);
		});
		oReplayPageView = oAddToLogsSpy.args.find(function(a) { return a[0].event === "pageView"; });

		assert.strictEqual(oLivePageView[0].page.name, "/", "live page.name is normalized to '/'");
		assert.strictEqual(oReplayPageView[0].page.name, oLivePageView[0].page.name, "replay produces same page.name as live event");
	});

	QUnit.module("page.referrer chain", {
		beforeEach: function () {
			this.oTracker = new UsageTracker(oFactory.getAppComponent());
			this.sandbox = sinon.createSandbox();
			this.sandbox.stub(this.oTracker, "_composeDefaultPageTitleFromRoute")
				.returns(""); // not relevant to this test
			this.sDocumentReferrer = "https://www.google.com/";
			this.sandbox.stub(document, "referrer").get(() => this.sDocumentReferrer);
			this.oTracker.start("testSiteName");
			this.oAddToLogsSpy = this.sandbox.spy(this.oTracker, "_addToLogs");
		},
		afterEach: function () {
			this.oTracker.destroy();
			this.oTracker = null;
			this.sandbox.restore();
		}
	});

	function getPageViewCalls(oSpy) {
		return oSpy.args.map((args) => args[0]).filter((oLog) => oLog.event === "pageView");
	}

	QUnit.test("first pageView uses document.referrer", function (assert) {
		var oRoute = oFactory.getRouteMatchEventParameters("welcome");

		this.oTracker._logRouteMatched(oRoute);

		var aPageViews = getPageViewCalls(this.oAddToLogsSpy);
		assert.strictEqual(aPageViews.length, 1, "one pageView emitted");
		assert.strictEqual(aPageViews[0].page.referrer, this.sDocumentReferrer, "first pageView referrer is document.referrer");
	});

	QUnit.test("second pageView uses first page URL as referrer", function (assert) {
		var oRoute1 = oFactory.getRouteMatchEventParameters("welcome"),
			oRoute2 = oFactory.getRouteMatchEventParameters("topic");

		this.oTracker._logRouteMatched(oRoute1);
		this.oTracker._logRouteMatched(oRoute2);

		var aPageViews = getPageViewCalls(this.oAddToLogsSpy);
		assert.strictEqual(aPageViews.length, 2, "two pageViews emitted");
		assert.strictEqual(aPageViews[1].page.referrer, aPageViews[0].page.url, "second pageView referrer equals first page URL");
	});

	QUnit.test("third pageView uses second page URL as referrer", function (assert) {
		var oRoute1 = oFactory.getRouteMatchEventParameters("welcome"),
			oRoute2 = oFactory.getRouteMatchEventParameters("topic"),
			oRoute3 = oFactory.getRouteMatchEventParameters("apiId");

		this.oTracker._logRouteMatched(oRoute1);
		this.oTracker._logRouteMatched(oRoute2);
		this.oTracker._logRouteMatched(oRoute3);

		var aPageViews = getPageViewCalls(this.oAddToLogsSpy);
		assert.strictEqual(aPageViews.length, 3, "three pageViews emitted");
		assert.strictEqual(aPageViews[2].page.referrer, aPageViews[1].page.url, "third pageView referrer equals second page URL");
	});

	QUnit.test("duplicate routeMatched does not advance referrer", function (assert) {
		var oRouteA = oFactory.getRouteMatchEventParameters("welcome"),
			oRouteB = oFactory.getRouteMatchEventParameters("topic");

		this.oTracker._logRouteMatched(oRouteA); // A — logged
		this.oTracker._logRouteMatched(oRouteA); // A duplicate — suppressed
		this.oTracker._logRouteMatched(oRouteB); // B

		var aPageViews = getPageViewCalls(this.oAddToLogsSpy);
		assert.strictEqual(aPageViews.length, 2, "only two pageViews emitted (duplicate suppressed)");
		assert.strictEqual(aPageViews[1].page.referrer, aPageViews[0].page.url, "B's referrer is A's URL, not the duplicate");
	});

	QUnit.test("legacy route does not advance referrer", function (assert) {
		var oRouteA = oFactory.getRouteMatchEventParameters("welcome"),
			oRouteLegacy = oFactory.getRouteMatchEventParameters("LegacyRoute"),
			oRouteB = oFactory.getRouteMatchEventParameters("topic");

		this.oTracker._logRouteMatched(oRouteA);      // A — logged
		this.oTracker._logRouteMatched(oRouteLegacy); // legacy — skipped
		this.oTracker._logRouteMatched(oRouteB);      // B

		var aPageViews = getPageViewCalls(this.oAddToLogsSpy);
		assert.strictEqual(aPageViews.length, 2, "only two pageViews emitted (legacy skipped)");
		assert.strictEqual(aPageViews[1].page.referrer, aPageViews[0].page.url, "B's referrer is A's URL, not the legacy URL");
	});

	QUnit.test("route-not-found (404) does not advance referrer", function (assert) {
		var oRouteA = oFactory.getRouteMatchEventParameters("welcome"),
			oRouteB = oFactory.getRouteMatchEventParameters("topic");

		this.oTracker._logRouteMatched(oRouteA);             // A — pageView
		this.oTracker._logRouteNotFound({hash: "notFound"}); // 404 errorPage
		this.oTracker._logRouteMatched(oRouteB);             // B — pageView

		var aPageViews = getPageViewCalls(this.oAddToLogsSpy);
		assert.strictEqual(aPageViews.length, 2, "only two pageViews emitted (404 is errorPage, not pageView)");
		assert.strictEqual(aPageViews[1].page.referrer, aPageViews[0].page.url, "B's referrer is A's URL, not the 404 hash");
	});

	QUnit.test("page-data-not-found does not advance referrer", function (assert) {
		var oRouteA = oFactory.getRouteMatchEventParameters("welcome"),
			oRouteB = oFactory.getRouteMatchEventParameters("topic");

		this.oTracker._logRouteMatched(oRouteA); // A — pageView
		// trigger _logPageDataNotFound via _logNavToWithoutHash
		this.oTracker._logNavToWithoutHash({viewName: "sap.ui.documentation.sdk.view.NotFound"});
		this.oTracker._logRouteMatched(oRouteB); // B — pageView

		var aPageViews = getPageViewCalls(this.oAddToLogsSpy);
		assert.strictEqual(aPageViews.length, 2, "only two pageViews emitted (data-not-found is errorPage)");
		assert.strictEqual(aPageViews[1].page.referrer, aPageViews[0].page.url, "B's referrer is A's URL, not the not-found URL");
	});

	QUnit.test("stop() clears remembered URL so first post-restart pageView uses document.referrer", function (assert) {
		var oRouteA = oFactory.getRouteMatchEventParameters("welcome"),
			oRouteB = oFactory.getRouteMatchEventParameters("topic");

		this.oTracker._logRouteMatched(oRouteA); // A — pageView
		this.oTracker.stop();
		this.oTracker.start("testSiteName"); // restart
		this.oAddToLogsSpy.resetHistory();

		this.oTracker._logRouteMatched(oRouteB); // B — first post-restart pageView

		var aPageViews = getPageViewCalls(this.oAddToLogsSpy);
		assert.strictEqual(aPageViews.length, 1, "one pageView emitted after restart");
		assert.strictEqual(aPageViews[0].page.referrer, this.sDocumentReferrer, "post-restart pageView uses document.referrer, not A's URL");
	});

	QUnit.test("replay path (_logPrecedingRouteVisits) builds correct referrer chain", function (assert) {
		this.oTracker.stop();
		var oNewTracker = new UsageTracker(oFactory.getAppComponent());
		this.sandbox.stub(oNewTracker, "_composeDefaultPageTitleFromRoute").returns("");
		var oReplaySpy = this.sandbox.spy(oNewTracker, "_addToLogs"),
			oRoute1 = oFactory.getRouteMatchEventParameters("welcome"),
			oRoute2 = oFactory.getRouteMatchEventParameters("topic");

		oNewTracker.start("testSiteName", [oRoute1, oRoute2]);

		var aPageViews = oReplaySpy.args.map((args) => args[0]).filter((oLog) => oLog.event === "pageView");
		assert.strictEqual(aPageViews.length, 2, "two pageViews replayed");
		assert.strictEqual(aPageViews[1].page.referrer, aPageViews[0].page.url, "second replayed pageView referrer equals first replayed page URL");

		oNewTracker.destroy();
	});

	QUnit.module("getPageInfo — PageInfo constructor", {
		before: function () {
			this.oTracker = new UsageTracker(oFactory.getAppComponent());
			this.oTracker.start("testSiteName");
		},
		beforeEach: function () {
			this.sandbox = sinon.createSandbox();
			this.sandbox.stub(this.oTracker, "_composeDefaultPageTitleFromRoute").returns("");
		},
		after: function () {
			this.oTracker.destroy();
			this.oTracker = null;
		},
		afterEach: function () {
			this.sandbox.restore();
		}
	});

	QUnit.test("explicit referrer argument is honoured", function (assert) {
		var sExplicitReferrer = "http://x/#/prev",
			oRoute = oFactory.getRouteMatchEventParameters("welcome"),
			oAddToLogsSpy = this.sandbox.spy(this.oTracker, "_addToLogs");

		// inject explicit referrer by pre-populating _sLastLoggedPageUrl
		this.oTracker._sLastLoggedPageUrl = sExplicitReferrer;
		this.oTracker._oLastRouteParameters = null; // reset so route is not treated as duplicate
		this.oTracker._logRouteMatched(oRoute);

		var aPageViews = oAddToLogsSpy.args.map((args) => args[0]).filter((oLog) => oLog.event === "pageView");
		assert.strictEqual(aPageViews.length, 1, "one pageView emitted");
		assert.strictEqual(aPageViews[0].page.referrer, sExplicitReferrer, "referrer parameter is honoured in PageInfo");
	});

	QUnit.test("referrer falls back to document.referrer when no previous URL is set", function (assert) {
		var sDocReferrer = "https://external.example.com/",
			oRoute = oFactory.getRouteMatchEventParameters("welcome2"),
			oAddToLogsSpy = this.sandbox.spy(this.oTracker, "_addToLogs");

		this.sandbox.stub(document, "referrer").get(() => sDocReferrer);
		this.oTracker._sLastLoggedPageUrl = null;
		this.oTracker._oLastRouteParameters = null;
		this.oTracker._logRouteMatched(oRoute);

		var aPageViews = oAddToLogsSpy.args.map((args) => args[0]).filter((oLog) => oLog.event === "pageView");
		assert.strictEqual(aPageViews.length, 1, "one pageView emitted");
		assert.strictEqual(aPageViews[0].page.referrer, sDocReferrer, "PageInfo falls back to document.referrer when no previous URL");
	});
});
