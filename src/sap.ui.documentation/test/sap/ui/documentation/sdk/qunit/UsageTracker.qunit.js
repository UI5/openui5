/*global QUnit, sinon*/
sap.ui.define([
	"sap/ui/documentation/sdk/controller/util/UsageTracker",
	"sap/ui/documentation/sdk/controller/util/DocuInfo",
	"sap/base/i18n/Localization",
	"sap/ui/core/EventBus"],
function (UsageTracker, DocuInfo, Localization, EventBus) {
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
			getAppComponent: function(oEventBusOverride) {
				var oMockAppComponent = createMockAppComponent(),
					oMockRouter = createMockRouter();
				associateRouterWithComponent(oMockRouter, oMockAppComponent);

				// keep in closure to prevent being called directly from outside
				function createMockAppComponent() {
					var oMockEventBus = oEventBusOverride || {
						subscribe: function () {},
						unsubscribe: function () {}
					};
					return {
						getConfig: function() {
							return {};
						},
						getEventBus: function() {
							return oMockEventBus;
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
						},
						getTarget: function () {
							return null;
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
			// start() initializes window.adobeDataLayer (via _initRemoteServiceConnector);
			// without it _logPageNotFound → _addToLogs throws when this test runs in isolation.
			this.oTracker.start("testSiteName");
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
	].forEach(function (oCase, iIndex) {
		QUnit.test(oCase.desc + " -> error.pageName = \"" + oCase.expected + "\"", function (assert) {
			var oAddToLogsSpy = this.sandbox.spy(this.oTracker, "_addToLogs");
			// The module reuses one window.adobeDataLayer across cases, and "empty hash" and
			// "root slash hash" both normalize to pageName "/". Give each case a distinct
			// window.location.href (as in the real app) so their errorPage payloads differ by
			// error.pageUrl — otherwise _isPageAlreadyLogged correctly treats the second as a repeat.
			withLocationHash("/#/not-found-case-" + iIndex, function () {
				this.oTracker._logPageNotFound(oCase.input);
			}.bind(this));
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

		// Each navigation lands on a distinct URL, exactly as in the real app — otherwise
		// the two pageView payloads would be byte-identical and the duplicate-suppression
		// guard (_isPageAlreadyLogged) would correctly drop the second as a repeat.
		withLocationHash("/#/welcome", this.oTracker._logRouteMatched.bind(this.oTracker, oRoute1));
		withLocationHash("/#/topic/abc", this.oTracker._logRouteMatched.bind(this.oTracker, oRoute2));

		var aPageViews = getPageViewCalls(this.oAddToLogsSpy);
		assert.strictEqual(aPageViews.length, 2, "two pageViews emitted");
		assert.strictEqual(aPageViews[1].page.referrer, aPageViews[0].page.url, "second pageView referrer equals first page URL");
	});

	QUnit.test("third pageView uses second page URL as referrer", function (assert) {
		var oRoute1 = oFactory.getRouteMatchEventParameters("welcome"),
			oRoute2 = oFactory.getRouteMatchEventParameters("topic"),
			oRoute3 = oFactory.getRouteMatchEventParameters("apiId");

		// Each navigation lands on a distinct URL (see note above).
		withLocationHash("/#/welcome", this.oTracker._logRouteMatched.bind(this.oTracker, oRoute1));
		withLocationHash("/#/topic/abc", this.oTracker._logRouteMatched.bind(this.oTracker, oRoute2));
		withLocationHash("/#/api/sap.m.Button", this.oTracker._logRouteMatched.bind(this.oTracker, oRoute3));

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

		var aErrorPages = this.oAddToLogsSpy.args.map(function(args) { return args[0]; }).filter(function(oLog) {
			return oLog.event === "errorPage";
		});
		assert.strictEqual(aErrorPages.length, 1, "exactly one errorPage event emitted for unknown route");
		assert.strictEqual(aErrorPages[0].error.description, "page not found", "errorPage has description 'page not found'");
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

	QUnit.test("replay path (_logPrecedingRouteVisits) replays only the last cached event", function (assert) {
		// The consent dialog is modal, so at most one route is visited pre-consent.
		// _logPrecedingRouteVisits replays only the last cached event (the one that holds the outcome);
		// earlier entries are superseded. Here the outcome is the 'topic' routeMatched.
		this.oTracker.stop();
		var oNewTracker = new UsageTracker(oFactory.getAppComponent());
		this.sandbox.stub(oNewTracker, "_composeDefaultPageTitleFromRoute").returns("");
		var oReplaySpy = this.sandbox.spy(oNewTracker, "_addToLogs"),
			oRoute1 = oFactory.getRouteMatchEventParameters("welcome"),
			oRoute2 = oFactory.getRouteMatchEventParameters("topic");

		oNewTracker.start("testSiteName", [oRoute1, oRoute2]);

		var aPageViews = oReplaySpy.args.map((args) => args[0]).filter((oLog) => oLog.event === "pageView");
		assert.strictEqual(aPageViews.length, 1, "exactly one pageView replayed — only the last cached event");
		assert.ok(aPageViews[0].page, "the single replayed pageView carries page info");

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

	QUnit.module("unknown route — single errorPage", {
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

	QUnit.test("unknown route produces exactly one errorPage with description 'page not found'", function (assert) {
		var oAddToLogsSpy = this.sandbox.spy(this.oTracker, "_addToLogs");
		this.oTracker.start("testSiteName");
		oAddToLogsSpy.resetHistory();

		this.oTracker._logRouteNotFound({hash: "/api1"});

		var aErrorPages = oAddToLogsSpy.args.map(function(args) { return args[0]; }).filter(function(oLog) {
			return oLog.event === "errorPage";
		});
		assert.strictEqual(aErrorPages.length, 1, "exactly one errorPage event");
		assert.strictEqual(aErrorPages[0].error.description, "page not found", "description is 'page not found'");
	});

	QUnit.test("unknown route does not produce a 'page data not found' errorPage", function (assert) {
		var oAddToLogsSpy = this.sandbox.spy(this.oTracker, "_addToLogs");
		this.oTracker.start("testSiteName");
		oAddToLogsSpy.resetHistory();

		this.oTracker._logRouteNotFound({hash: "/api1"});

		var aDataNotFound = oAddToLogsSpy.args.map(function(args) { return args[0]; }).filter(function(oLog) {
			return oLog.event === "errorPage" && oLog.error.description === "page data not found";
		});
		assert.strictEqual(aDataNotFound.length, 0, "no 'page data not found' event for unknown route");
	});

	QUnit.test("replay of bypassed event produces exactly one errorPage with description 'page not found'", function (assert) {
		var oAddToLogsSpy = this.sandbox.spy(this.oTracker, "_addToLogs"),
			oBypassedEvent = {eventId: "bypassed", hash: "/api1"};

		this.oTracker.start("testSiteName", [oBypassedEvent]);

		var aErrorPages = oAddToLogsSpy.args.map(function(args) { return args[0]; }).filter(function(oLog) {
			return oLog.event === "errorPage";
		});
		assert.strictEqual(aErrorPages.length, 1, "exactly one errorPage replayed for unknown route");
		assert.strictEqual(aErrorPages[0].error.description, "page not found", "replayed errorPage has description 'page not found'");
	});

	QUnit.test("replay of bypassed event does not include a _navToWithoutHash companion event", function (assert) {
		var oAddToLogsSpy = this.sandbox.spy(this.oTracker, "_addToLogs"),
			oBypassedEvent = {eventId: "bypassed", hash: "/api1"};

		this.oTracker.start("testSiteName", [oBypassedEvent]);

		var aDataNotFound = oAddToLogsSpy.args.map(function(args) { return args[0]; }).filter(function(oLog) {
			return oLog.event === "errorPage" && oLog.error.description === "page data not found";
		});
		assert.strictEqual(aDataNotFound.length, 0, "no companion 'page data not found' event in bypass replay");
	});

	QUnit.test("matched-route-but-data-missing still produces exactly one errorPage with description 'page data not found'", function (assert) {
		var oAddToLogsSpy = this.sandbox.spy(this.oTracker, "_addToLogs");
		this.oTracker.start("testSiteName");
		this.oTracker._logRouteMatched(oFactory.getRouteMatchEventParameters("apiId"));
		oAddToLogsSpy.resetHistory();

		this.oTracker._logNavToWithoutHash({viewName: "sap.ui.documentation.sdk.view.NotFound"});

		var aErrorPages = oAddToLogsSpy.args.map(function(args) { return args[0]; }).filter(function(oLog) {
			return oLog.event === "errorPage";
		});
		assert.strictEqual(aErrorPages.length, 1, "exactly one errorPage event");
		assert.strictEqual(aErrorPages[0].error.description, "page data not found", "description is 'page data not found'");
	});

	QUnit.test("SampleNotFound path still produces exactly one errorPage event", function (assert) {
		var oAddToLogsSpy = this.sandbox.spy(this.oTracker, "_addToLogs");
		this.oTracker.start("testSiteName");
		this.oTracker._logRouteMatched(oFactory.getRouteMatchEventParameters("sample"));
		oAddToLogsSpy.resetHistory();

		this.oTracker._logNavToWithoutHash({viewName: "sap.ui.documentation.sdk.view.SampleNotFound"});

		var aErrorPages = oAddToLogsSpy.args.map(function(args) { return args[0]; }).filter(function(oLog) {
			return oLog.event === "errorPage";
		});
		assert.strictEqual(aErrorPages.length, 1, "exactly one errorPage for SampleNotFound path");
	});

	QUnit.module("pageView title — DOCUMENTATION_TOPIC route", {
		beforeEach: function () {
			this.oTracker = new UsageTracker(oFactory.getAppComponent());
			this.sandbox = sinon.createSandbox();
			this.sandbox.stub(this.oTracker, "_getSiteName").returns("ui5");
			this.oAddToLogsSpy = this.sandbox.spy(this.oTracker, "_addToLogs");
			this.oTracker.start(sVersionName.sapui5);
			this.oAddToLogsSpy.resetHistory();
		},
		afterEach: function () {
			this.oTracker.destroy();
			this.oTracker = null;
			this.sandbox.restore();
		}
	});

	QUnit.test("pageView title is the string returned by getDocumentTitle", function (assert) {
		var done = assert.async();
		this.sandbox.stub(DocuInfo, "getDocumentTitle").returns(Promise.resolve("Glossary"));

		this.oTracker._logRouteMatched({
			name: "topicId",
			config: { name: "topicId" },
			arguments: { id: "some-topic-id" }
		});

		Promise.resolve().then(function () {
			var oPageView = this.oAddToLogsSpy.args.map(function (a) { return a[0]; })
				.find(function (o) { return o.event === "pageView"; });
			assert.strictEqual(oPageView.page.title, "Glossary", "title is the resolved string");
			done();
		}.bind(this));
	});

	QUnit.test("pageView title is absent when getDocumentTitle rejects", function (assert) {
		var done = assert.async();
		this.sandbox.stub(DocuInfo, "getDocumentTitle")
			.returns(Promise.reject({ status: 469, statusText: "<unknown status code>" }));

		this.oTracker._logRouteMatched({
			name: "topicId",
			config: { name: "topicId" },
			arguments: { id: "some-topic-id" }
		});

		setTimeout(function () {
			var oPageView = this.oAddToLogsSpy.args.map(function (a) { return a[0]; })
				.find(function (o) { return o.event === "pageView"; });
			assert.notOk("title" in oPageView.page, "title field is absent when fetch fails");
			done();
		}.bind(this), 0);
	});

	QUnit.test("pageView title is absent when getDocumentTitle resolves with undefined", function (assert) {
		var done = assert.async();
		this.sandbox.stub(DocuInfo, "getDocumentTitle").returns(Promise.resolve(undefined));

		this.oTracker._logRouteMatched({
			name: "topicId",
			config: { name: "topicId" },
			arguments: { id: "unknown-topic-id" }
		});

		Promise.resolve().then(function () {
			var oPageView = this.oAddToLogsSpy.args.map(function (a) { return a[0]; })
				.find(function (o) { return o.event === "pageView"; });
			assert.notOk("title" in oPageView.page, "title field is absent when topic not found in index");
			done();
		}.bind(this));
	});

	// ─── reportsResourceResolved state machine ───────────────────────────────────────
	//
	// Model: a route whose target view(s) report reportsResourceResolved: true is
	// "deferred" — _logRouteMatched does NOT log a pageView immediately. Instead it arms
	// the _bAwaitingResourceResolved flag. A single permanent handler (_onResourceResolved,
	// subscribed in start()) listens on the EventBus event ("usageTracking", "resourceResolved")
	// and commits the pageView only when that event is published with { routeParameters }
	// matching the current _oLastRouteParameters while the flag is still armed.

	// Publish a resourceResolved event the way the view controllers do, carrying the
	// route parameters so _onResourceResolved's _areEqualRoutes guard matches.
	function publishResourceResolved(oRouteParameters) {
		EventBus.getInstance().publish("usageTracking", "resourceResolved", { routeParameters: oRouteParameters });
	}

	QUnit.module("reportsResourceResolved — state machine", {
		beforeEach: function () {
			this.sandbox = sinon.createSandbox();
			this.oTracker = new UsageTracker(oFactory.getAppComponent());
			this.sandbox.stub(this.oTracker, "_composeDefaultPageTitleFromRoute").returns("");
			this.oTracker.start("testSiteName");
			this.oAddToLogsSpy = this.sandbox.spy(this.oTracker, "_addToLogs");
		},
		afterEach: function () {
			// stop() removes the permanent resourceResolved subscription from the global EventBus
			// singleton; destroy() alone does not (BaseObject.destroy does not call exit()), so the
			// tracker's handler would otherwise leak into later tests.
			this.oTracker.stop();
			this.oTracker.destroy();
			this.oTracker = null;
			this.sandbox.restore();
		}
	});

	QUnit.test("immediate pageView when no view has reportsResourceResolved: true", function (assert) {
		// arrange: stub _getViewControllersForRoute to return controllers without reportsResourceResolved
		this.sandbox.stub(this.oTracker, "_getViewControllersForRoute").returns([
			{ reportsResourceResolved: false }
		]);
		var oRoute = oFactory.getRouteMatchEventParameters("welcome");

		// act
		this.oTracker._logRouteMatched(oRoute);

		// assert: pageView is logged immediately
		var aPageViews = this.oAddToLogsSpy.args.map(function(a) { return a[0]; }).filter(function(o) { return o.event === "pageView"; });
		assert.strictEqual(aPageViews.length, 1, "pageView is logged immediately");
	});

	QUnit.test("deferred pageView after resourceResolved — no pageView until resourceResolved fires", function (assert) {
		// arrange: stub _getViewControllersForRoute to return controller with reportsResourceResolved: true
		this.sandbox.stub(this.oTracker, "_getViewControllersForRoute").returns([
			{ reportsResourceResolved: true }
		]);
		var oRoute = oFactory.getRouteMatchEventParameters("apiId");

		// act: navigate to route
		this.oTracker._logRouteMatched(oRoute);

		// assert: no pageView yet — the visit is deferred, waiting for resourceResolved
		var aPageViews = this.oAddToLogsSpy.args.map(function(a) { return a[0]; }).filter(function(o) { return o.event === "pageView"; });
		assert.strictEqual(aPageViews.length, 0, "no pageView emitted before resourceResolved");
		assert.strictEqual(this.oTracker._oLastRouteParameters, oRoute, "deferred route is retained as the last route");
	});

	QUnit.test("deferred pageView is pushed after resourceResolved fires", function (assert) {
		// arrange
		this.sandbox.stub(this.oTracker, "_getViewControllersForRoute").returns([
			{ reportsResourceResolved: true }
		]);
		var oRoute = oFactory.getRouteMatchEventParameters("apiId");
		this.oTracker._logRouteMatched(oRoute);
		this.oAddToLogsSpy.resetHistory();

		// act: resourceResolved event fires for the pending route
		publishResourceResolved(oRoute);

		// assert: pageView + stBeaconReady are logged
		var aLogs = this.oAddToLogsSpy.args.map(function(a) { return a[0]; });
		var aPageViews = aLogs.filter(function(o) { return o.event === "pageView"; });
		var aBeacons = aLogs.filter(function(o) { return o.event === "stBeaconReady"; });
		assert.strictEqual(aPageViews.length, 1, "pageView is pushed after resourceResolved");
		assert.strictEqual(aBeacons.length, 1, "stBeaconReady is pushed after resourceResolved");
	});

	QUnit.test("resourceResolved advances referrer", function (assert) {
		// arrange
		this.sandbox.stub(this.oTracker, "_getViewControllersForRoute").returns([
			{ reportsResourceResolved: true }
		]);
		var oRoute1 = oFactory.getRouteMatchEventParameters("apiId");
		var oRoute2 = oFactory.getRouteMatchEventParameters("welcome");

		this.oTracker._logRouteMatched(oRoute1);
		publishResourceResolved(oRoute1); // resolves apiId — referrer advanced

		this.oTracker._getViewControllersForRoute.returns([{ reportsResourceResolved: false }]);
		this.oAddToLogsSpy.resetHistory();

		this.oTracker._logRouteMatched(oRoute2);

		// assert: referrer of route2's pageView is route1's URL (not document.referrer)
		var aPageViews = this.oAddToLogsSpy.args.map(function(a) { return a[0]; }).filter(function(o) { return o.event === "pageView"; });
		assert.strictEqual(aPageViews.length, 1, "one pageView for route2");
		assert.ok(aPageViews[0].page.referrer, "route2 has a referrer");
		assert.notStrictEqual(aPageViews[0].page.referrer, document.referrer, "referrer is the previous page URL, not document.referrer");
	});

	QUnit.test("errorPage-only on _navToWithoutHash while deferred — no pageView, no referrer advance", function (assert) {
		// arrange
		this.sandbox.stub(this.oTracker, "_getViewControllersForRoute").returns([
			{ reportsResourceResolved: true }
		]);
		var oRoute = oFactory.getRouteMatchEventParameters("apiId");
		this.oTracker._logRouteMatched(oRoute);
		var sReferrerBeforeNotFound = this.oTracker._sLastLoggedPageUrl;
		this.oAddToLogsSpy.resetHistory();

		// act: not-found fires while the deferred route is still waiting
		this.oTracker._logNavToWithoutHash({ viewName: "sap.ui.documentation.sdk.view.NotFound" });

		// assert
		var aLogs = this.oAddToLogsSpy.args.map(function(a) { return a[0]; });
		var aPageViews = aLogs.filter(function(o) { return o.event === "pageView"; });
		var aErrorPages = aLogs.filter(function(o) { return o.event === "errorPage"; });
		assert.strictEqual(aPageViews.length, 0, "no pageView emitted — the deferred visit does not become a pageView");
		assert.strictEqual(aErrorPages.length, 1, "errorPage is emitted");
		assert.strictEqual(this.oTracker._sLastLoggedPageUrl, sReferrerBeforeNotFound, "referrer is not advanced by not-found");
	});

	QUnit.test("new routeMatched while deferred: later resourceResolved for the first route does not log it", function (assert) {
		// arrange: first route defers (reportsResourceResolved: true), second route is immediate (reportsResourceResolved: false)
		var oStub = this.sandbox.stub(this.oTracker, "_getViewControllersForRoute").returns([
			{ reportsResourceResolved: true }
		]);
		var oRoute1 = oFactory.getRouteMatchEventParameters("apiId");
		var oRoute2 = oFactory.getRouteMatchEventParameters("welcome");

		this.oTracker._logRouteMatched(oRoute1);
		this.oAddToLogsSpy.resetHistory();

		// switch to immediate (no deferral) for route2
		oStub.returns([{ reportsResourceResolved: false }]);

		// act: new route fires before route1's resourceResolved
		this.oTracker._logRouteMatched(oRoute2);
		// a late resourceResolved for the abandoned route1 must not revive it — it no longer matches _oLastRouteParameters
		publishResourceResolved(oRoute1);

		// assert: exactly one pageView — route2 (immediate); route1 was never logged
		var aPageViews = this.oAddToLogsSpy.args.map(function(a) { return a[0]; }).filter(function(o) { return o.event === "pageView"; });
		assert.strictEqual(aPageViews.length, 1, "route2 logs immediately; abandoned route1 never produces a pageView");
	});

	QUnit.test("bypassed while deferred does not produce a pageView for the deferred route", function (assert) {
		// arrange
		this.sandbox.stub(this.oTracker, "_getViewControllersForRoute").returns([
			{ reportsResourceResolved: true }
		]);
		var oRoute = oFactory.getRouteMatchEventParameters("apiId");
		this.oTracker._logRouteMatched(oRoute);
		this.oAddToLogsSpy.resetHistory();

		// act: bypass fires while the route is still deferred
		this.oTracker._logRouteNotFound({ hash: "/not-found-hash" });

		// assert: no pageView for apiId, errorPage for bypass
		var aLogs = this.oAddToLogsSpy.args.map(function(a) { return a[0]; });
		var aPageViews = aLogs.filter(function(o) { return o.event === "pageView"; });
		var aErrorPages = aLogs.filter(function(o) { return o.event === "errorPage"; });
		assert.strictEqual(aPageViews.length, 0, "no pageView for deferred apiId when bypass fires");
		assert.strictEqual(aErrorPages.length, 1, "errorPage is emitted for the bypass");
	});

	QUnit.test("stale resourceResolved for a non-matching route is silently ignored", function (assert) {
		// arrange: a deferred route is pending
		this.sandbox.stub(this.oTracker, "_getViewControllersForRoute").returns([
			{ reportsResourceResolved: true }
		]);
		var oRoute = oFactory.getRouteMatchEventParameters("apiId");
		this.oTracker._logRouteMatched(oRoute);
		this.oAddToLogsSpy.resetHistory();

		// act: a resourceResolved arrives for a DIFFERENT route
		publishResourceResolved(oFactory.getRouteMatchEventParameters("someOtherRoute"));

		// assert: nothing logged — only the matching route may resolve the deferred visit
		var aPageViews = this.oAddToLogsSpy.args.map(function(a) { return a[0]; }).filter(function(o) { return o.event === "pageView"; });
		assert.strictEqual(aPageViews.length, 0, "resourceResolved for a non-matching route is ignored");
	});

	QUnit.test("stop() detaches _navToWithoutHash listener with context so stop+start leaves only one handler", function (assert) {
		// arrange: build a tracker whose router records detachEvent calls
		var aDetachCalls = [];
		var oMockComponent = oFactory.getAppComponent();
		var oRouter = oMockComponent.getRouter();
		oRouter.detachEvent = function(sEvent, fnHandler, oContext) {
			aDetachCalls.push({ sEvent: sEvent, fnHandler: fnHandler, oContext: oContext });
		};

		var oTracker = new UsageTracker(oMockComponent);
		this.sandbox.stub(oTracker, "_composeDefaultPageTitleFromRoute").returns("");
		oTracker.start("testSiteName");

		// act
		oTracker.stop();

		// assert: detachEvent for _navToWithoutHash was called with the tracker as context
		var oNavDetach = aDetachCalls.find(function(c) { return c.sEvent === "_navToWithoutHash"; });
		assert.ok(oNavDetach, "detachEvent called for _navToWithoutHash");
		assert.strictEqual(oNavDetach.oContext, oTracker,
			"detachEvent for _navToWithoutHash includes the tracker as oListener context");

		oTracker.destroy();
	});

	QUnit.test("a deferred routeMatched arms the pending-resolve state instead of logging immediately", function (assert) {
		// The EventBus subscription is a one-time start() action (not per route); a deferred
		// route match is observable as "awaiting a resolve, no pageView yet".
		this.sandbox.stub(this.oTracker, "_getViewControllersForRoute").returns([
			{ reportsResourceResolved: true }
		]);

		// act
		this.oTracker._logRouteMatched(oFactory.getRouteMatchEventParameters("apiId"));

		// assert
		assert.strictEqual(
			this.oTracker._bAwaitingResourceResolved, true,
			"the pending-resolve state is armed when a deferred route matches"
		);
		var aPageViews = this.oAddToLogsSpy.args.map(function(a) { return a[0]; }).filter(function(o) { return o.event === "pageView"; });
		assert.strictEqual(aPageViews.length, 0, "no pageView is logged immediately for a deferred route");
	});

	QUnit.test("non-first target view with reportsResourceResolved: true still triggers deferral", function (assert) {
		// arrange: first controller has false, second has true
		this.sandbox.stub(this.oTracker, "_getViewControllersForRoute").returns([
			{ reportsResourceResolved: false },
			{ reportsResourceResolved: true }
		]);
		var oRoute = oFactory.getRouteMatchEventParameters("apiId");

		// act
		this.oTracker._logRouteMatched(oRoute);

		// assert: deferred (not immediate) — no pageView until resourceResolved fires
		var aPageViews = this.oAddToLogsSpy.args.map(function(a) { return a[0]; }).filter(function(o) { return o.event === "pageView"; });
		assert.strictEqual(aPageViews.length, 0, "pageView deferred because second controller has reportsResourceResolved: true");
		publishResourceResolved(oRoute);
		var aPageViewsAfter = this.oAddToLogsSpy.args.map(function(a) { return a[0]; }).filter(function(o) { return o.event === "pageView"; });
		assert.strictEqual(aPageViewsAfter.length, 1, "pageView committed once resourceResolved fires for the matching route");
	});

	QUnit.test("a deferred route after stop+restart resolves correctly", function (assert) {
		// arrange: route with reportsResourceResolved
		this.sandbox.stub(this.oTracker, "_getViewControllersForRoute").returns([
			{ reportsResourceResolved: true }
		]);
		var oRoute = oFactory.getRouteMatchEventParameters("apiId");

		// stop and restart the tracker
		this.oTracker.stop();
		this.oTracker.start("testSiteName");
		this.oAddToLogsSpy.resetHistory();

		// post-restart deferred route
		this.oTracker._logRouteMatched(oRoute);

		// resourceResolved fires for the post-restart route
		publishResourceResolved(oRoute);

		var aPageViews = this.oAddToLogsSpy.args.map(function(a) { return a[0]; }).filter(function(o) { return o.event === "pageView"; });
		assert.strictEqual(aPageViews.length, 1, "pageView resolved after resourceResolved post-restart");
	});

	QUnit.test("_navToWithoutHash after resourceResolved started the async fetch still commits that fetch's pageView", function (assert) {
		// arrange: deferred route; resourceResolved fires and starts an async page-info fetch we hold open
		this.sandbox.stub(this.oTracker, "_getViewControllersForRoute").returns([
			{ reportsResourceResolved: true }
		]);
		var fnDelayedCallback,
			oRoute = oFactory.getRouteMatchEventParameters("apiId");

		// intercept _getPageInfoFromRoute to capture the callback without calling it yet
		this.sandbox.stub(this.oTracker, "_getPageInfoFromRoute").callsFake(function(oEventParams, fnCb) {
			fnDelayedCallback = fnCb;
		});

		this.oTracker._logRouteMatched(oRoute);
		publishResourceResolved(oRoute); // starts the async fetch for the matching route

		// act: not-found fires before the title callback resolves
		this.oTracker._logNavToWithoutHash({ viewName: "sap.ui.documentation.sdk.view.NotFound" });

		this.oAddToLogsSpy.resetHistory();

		// now the in-flight async callback fires
		fnDelayedCallback({ url: "http://x/", name: "/", toObject: function() { return {}; } });

		// assert: pageView from the in-flight fetch is still committed — the navigation did not cancel it
		var aPageViews = this.oAddToLogsSpy.args.map(function(a) { return a[0]; }).filter(function(o) { return o.event === "pageView"; });
		assert.strictEqual(aPageViews.length, 1, "resourceResolved fetch completes and commits pageView even after _navToWithoutHash");
	});

	QUnit.test("resourceResolved triggers async page-info fetch and commits pageView when it resolves", function (assert) {
		// arrange: route with reportsResourceResolved; _getPageInfoFromRoute is async
		this.sandbox.stub(this.oTracker, "_getViewControllersForRoute").returns([
			{ reportsResourceResolved: true }
		]);
		var fnDelayedCallback,
			oRoute = oFactory.getRouteMatchEventParameters("apiId");

		this.sandbox.stub(this.oTracker, "_getPageInfoFromRoute").callsFake(function(oEventParams, fnCb) {
			fnDelayedCallback = fnCb;
		});

		this.oTracker._logRouteMatched(oRoute);

		// act: resourceResolved fires — triggers the fetch
		publishResourceResolved(oRoute);
		this.oAddToLogsSpy.resetHistory();

		// now the async page-info callback resolves
		var oFakePageInfo = { url: "http://x/#/api/Button", name: "/#/api/Button", toObject: function() { return { url: this.url, name: this.name }; } };
		fnDelayedCallback(oFakePageInfo);

		var aPageViews = this.oAddToLogsSpy.args.map(function(a) { return a[0]; }).filter(function(o) { return o.event === "pageView"; });
		assert.strictEqual(aPageViews.length, 1, "pageView committed when async fetch completes after resourceResolved");
	});


	QUnit.test("_getViewControllersForRoute returns controllers from oEventParameters.views", function (assert) {
		var oMockController = { reportsResourceResolved: true };
		var oMockView = { getController: function() { return oMockController; } };

		var aResult = this.oTracker._getViewControllersForRoute({
			name: "apiId",
			config: { name: "apiId" },
			views: [oMockView]
		});

		assert.strictEqual(aResult.length, 1, "one controller returned");
		assert.strictEqual(aResult[0], oMockController, "correct controller instance returned");
		assert.strictEqual(aResult[0].reportsResourceResolved, true, "reportsResourceResolved accessible on returned controller");
	});

	QUnit.test("deferred → deferred: a new navigation re-arms the pending-resolve state for the new route", function (assert) {
		// arrange: both routes defer
		this.sandbox.stub(this.oTracker, "_getViewControllersForRoute").returns([
			{ reportsResourceResolved: true }
		]);
		var oRoute1 = oFactory.getRouteMatchEventParameters("apiId"),
			oRoute2 = oFactory.getRouteMatchEventParameters("welcome");

		// act: route1 defers, then route2 matches before route1 resolves
		this.oTracker._logRouteMatched(oRoute1);
		this.oTracker._logRouteMatched(oRoute2);

		// assert: the pending-resolve state now targets route2 (the permanent handler gates on
		// _oLastRouteParameters, which route2's match re-pointed)
		assert.strictEqual(this.oTracker._bAwaitingResourceResolved, true, "still awaiting a resolve after the second deferred route");
		assert.strictEqual(this.oTracker._oLastRouteParameters, oRoute2, "the awaited route is now route2");

		this.oAddToLogsSpy.resetHistory();

		// resourceResolved for the current route2 commits exactly one pageView
		publishResourceResolved(oRoute2);
		var aCurrent = this.oAddToLogsSpy.args.map(function(a) { return a[0]; }).filter(function(o) { return o.event === "pageView"; });
		assert.strictEqual(aCurrent.length, 1, "resourceResolved for the current route2 commits exactly one pageView");

		// a late resourceResolved for the superseded route1 must not log anything — it no longer
		// matches _oLastRouteParameters, and the awaiting flag was already consumed by route2
		this.oAddToLogsSpy.resetHistory();
		publishResourceResolved(oRoute1);
		var aStale = this.oAddToLogsSpy.args.map(function(a) { return a[0]; }).filter(function(o) { return o.event === "pageView"; });
		assert.strictEqual(aStale.length, 0, "late resourceResolved for the superseded route1 logs nothing");
	});

	QUnit.test("deferred → immediate: the immediate route disarms the pending-resolve state", function (assert) {
		// arrange: route1 defers, route2 is immediate
		var oStub = this.sandbox.stub(this.oTracker, "_getViewControllersForRoute").returns([
			{ reportsResourceResolved: true }
		]);
		var oRoute1 = oFactory.getRouteMatchEventParameters("apiId"),
			oRoute2 = oFactory.getRouteMatchEventParameters("welcome");

		this.oTracker._logRouteMatched(oRoute1); // defers, arms the flag
		oStub.returns([{ reportsResourceResolved: false }]); // route2 is immediate
		this.oTracker._logRouteMatched(oRoute2);

		// assert: the immediate route cleared the pending-resolve state left by route1
		assert.strictEqual(this.oTracker._bAwaitingResourceResolved, false, "no longer awaiting a resolve after the immediate route");

		this.oAddToLogsSpy.resetHistory();

		// a late resourceResolved for the superseded route1 must not log anything
		publishResourceResolved(oRoute1);
		var aStale = this.oAddToLogsSpy.args.map(function(a) { return a[0]; }).filter(function(o) { return o.event === "pageView"; });
		assert.strictEqual(aStale.length, 0, "late resourceResolved for the superseded route1 logs nothing");
	});

	QUnit.test("duplicate / legacy route does NOT disarm a pending-resolve state", function (assert) {
		// arrange: route1 defers
		this.sandbox.stub(this.oTracker, "_getViewControllersForRoute").returns([
			{ reportsResourceResolved: true }
		]);
		var oRoute1 = oFactory.getRouteMatchEventParameters("apiId"),
			oRoute1Duplicate = oFactory.getRouteMatchEventParameters("apiId"),
			oRouteLegacy = oFactory.getRouteMatchEventParameters("LegacyRoute");

		this.oTracker._logRouteMatched(oRoute1); // defers, arms the flag
		this.oTracker._logRouteMatched(oRoute1Duplicate); // duplicate — early return, must not disarm
		this.oTracker._logRouteMatched(oRouteLegacy); // legacy — early return, must not disarm

		assert.strictEqual(
			this.oTracker._bAwaitingResourceResolved, true,
			"neither the duplicate nor the legacy event disarms the pending-resolve state"
		);

		this.oAddToLogsSpy.resetHistory();

		// the still-pending route1 resolves and commits its pageView
		publishResourceResolved(oRoute1);
		var aPageViews = this.oAddToLogsSpy.args.map(function(a) { return a[0]; }).filter(function(o) { return o.event === "pageView"; });
		assert.strictEqual(aPageViews.length, 1, "the still-pending route1 commits its pageView after resourceResolved");
	});

	QUnit.test("stale resourceResolved arriving first is ignored and does NOT consume the pending-resolve state", function (assert) {
		// This guards the interaction between a superseded route's late async resolve and the
		// current route's still-pending visit. The detail controllers publish resourceResolved
		// from inside an async loadData().then(), so a superseded route's publish can arrive
		// AFTER a newer route has matched but BEFORE that newer route resolves. The permanent
		// handler must ignore the non-matching (stale) publish and keep awaiting, otherwise the
		// current route's own pageView is lost.
		this.sandbox.stub(this.oTracker, "_getViewControllersForRoute").returns([
			{ reportsResourceResolved: true }
		]);
		var oRoute1 = oFactory.getRouteMatchEventParameters("apiId"),
			oRoute2 = oFactory.getRouteMatchEventParameters("welcome");

		// route1 defers, then route2 matches before route1 resolves — _oLastRouteParameters is
		// now route2 and the awaiting flag is re-armed for route2.
		this.oTracker._logRouteMatched(oRoute1);
		this.oTracker._logRouteMatched(oRoute2);

		this.oAddToLogsSpy.resetHistory();

		// route1's slow async load finally resolves and publishes FIRST — a stale, non-matching
		// event. It must be ignored and must NOT consume route2's pending-resolve state.
		publishResourceResolved(oRoute1);
		var aStale = this.oAddToLogsSpy.args.map(function(a) { return a[0]; }).filter(function(o) { return o.event === "pageView"; });
		assert.strictEqual(aStale.length, 0, "the stale route1 publish logs nothing");

		// route2's own load now resolves — it must still be awaited to commit the pageView.
		publishResourceResolved(oRoute2);
		var aCurrent = this.oAddToLogsSpy.args.map(function(a) { return a[0]; }).filter(function(o) { return o.event === "pageView"; });
		assert.strictEqual(aCurrent.length, 1, "route2 still commits exactly one pageView after the stale publish");
	});

	// ─── pre-consent replay — resourceResolved caching ───────────────────────────────

	QUnit.module("pre-consent replay — resourceResolved caching", {
		beforeEach: function () {
			this.oTracker = new UsageTracker(oFactory.getAppComponent());
			this.sandbox = sinon.createSandbox();
			this.sandbox.stub(this.oTracker, "_composeDefaultPageTitleFromRoute").returns("");
		},
		afterEach: function () {
			// stop() removes the permanent resourceResolved subscription (see note in the
			// state-machine module's afterEach — destroy() does not run exit()).
			this.oTracker.stop();
			this.oTracker.destroy();
			this.oTracker = null;
			this.sandbox.restore();
		}
	});

	QUnit.test("cached resourceResolved (carrying routeParameters) is replayed → pageView", function (assert) {
		// arrange: pre-consent, a deferred route resolved; App caches the resourceResolved event
		// as { eventId, routeParameters }. _logPrecedingRouteVisits replays the last cached event.
		this.sandbox.stub(this.oTracker, "_getViewControllersForRoute").returns([
			{ reportsResourceResolved: true }
		]);
		var oAddToLogsSpy = this.sandbox.spy(this.oTracker, "_addToLogs"),
			oRouteEvent = oFactory.getRouteMatchEventParameters("apiId"),
			aCachedEvents = [
				Object.assign({ eventId: "routeMatched" }, oRouteEvent),
				{ eventId: "resourceResolved", routeParameters: oRouteEvent }
			];

		// act: start with the pre-consent cache (the last entry — resourceResolved — holds the outcome)
		this.oTracker.start("testSiteName", aCachedEvents);

		// assert: pageView is emitted from the replayed resourceResolved
		var aPageViews = oAddToLogsSpy.args.map(function(a) { return a[0]; }).filter(function(o) { return o.event === "pageView"; });
		assert.strictEqual(aPageViews.length, 1, "pageView is emitted when the cached resourceResolved is replayed");
	});

	QUnit.test("cached _navToWithoutHash (last event) → errorPage only, no pageView", function (assert) {
		// arrange: pre-consent, a deferred route hit not-found; the last cached event is _navToWithoutHash
		this.sandbox.stub(this.oTracker, "_getViewControllersForRoute").returns([
			{ reportsResourceResolved: true }
		]);
		var oAddToLogsSpy = this.sandbox.spy(this.oTracker, "_addToLogs"),
			oRouteEvent = oFactory.getRouteMatchEventParameters("apiId"),
			aCachedEvents = [
				Object.assign({ eventId: "routeMatched" }, oRouteEvent),
				{ eventId: "_navToWithoutHash", viewName: "sap.ui.documentation.sdk.view.NotFound" }
			];

		// act: start with the pre-consent cache (routeMatched + _navToWithoutHash)
		this.oTracker.start("testSiteName", aCachedEvents);

		// assert: no pageView; only errorPage
		var aLogs = oAddToLogsSpy.args.map(function(a) { return a[0]; });
		var aPageViews = aLogs.filter(function(o) { return o.event === "pageView"; });
		var aErrorPages = aLogs.filter(function(o) { return o.event === "errorPage"; });
		assert.strictEqual(aPageViews.length, 0, "no pageView when the replayed outcome is not-found");
		assert.strictEqual(aErrorPages.length, 1, "exactly one errorPage for the not-found navigation");
	});

	QUnit.test("resourceResolved published via EventBus.getInstance() is received and resolves the deferred page", function (assert) {
		// arrange: deferred route
		this.sandbox.stub(this.oTracker, "_getViewControllersForRoute").returns([
			{ reportsResourceResolved: true }
		]);
		var oAddToLogsSpy = this.sandbox.spy(this.oTracker, "_addToLogs");
		var oRoute = oFactory.getRouteMatchEventParameters("apiId");
		this.oTracker.start("testSiteName");
		this.oTracker._logRouteMatched(oRoute);

		// act: publish via the global singleton (the same path controllers use), carrying the route params
		EventBus.getInstance().publish("usageTracking", "resourceResolved", { routeParameters: oRoute });

		// assert: pageView resolved
		var aPageViews = oAddToLogsSpy.args.map(function(a) { return a[0]; }).filter(function(o) { return o.event === "pageView"; });
		assert.strictEqual(aPageViews.length, 1, "pageView resolved after resourceResolved published via EventBus.getInstance()");
	});


	QUnit.test("first-ever navigation to a route with reportsResourceResolved view — no pageView until resourceResolved fires", function (assert) {
		var oTracker = new UsageTracker(oFactory.getAppComponent());
		this.sandbox.stub(oTracker, "_composeDefaultPageTitleFromRoute").returns("");
		oTracker.start("testSiteName");

		var oAddToLogsSpy = this.sandbox.spy(oTracker, "_addToLogs");

		// routeMatched event parameters carry the view directly
		var oRoute = Object.assign(oFactory.getRouteMatchEventParameters("entity"), {
			views: [{ getController: function() { return { reportsResourceResolved: true }; } }]
		});
		oTracker._logRouteMatched(oRoute);

		// assert: no pageView yet
		var aPageViews = oAddToLogsSpy.args.map(function(a) { return a[0]; }).filter(function(o) { return o.event === "pageView"; });
		assert.strictEqual(aPageViews.length, 0, "no pageView emitted on first navigation before resourceResolved");

		// act: resourceResolved published via EventBus (full round-trip through the subscription wired by the deferred route)
		EventBus.getInstance().publish("usageTracking", "resourceResolved", { routeParameters: oRoute });

		// assert: pageView now emitted
		var aPageViewsAfter = oAddToLogsSpy.args.map(function(a) { return a[0]; }).filter(function(o) { return o.event === "pageView"; });
		assert.strictEqual(aPageViewsAfter.length, 1, "pageView emitted after resourceResolved on first navigation");

		oTracker.destroy();
	});

	QUnit.test("first-ever navigation to topicId with reportsResourceResolved view — pageView emitted after resourceResolved and async title resolve", function (assert) {
		var done = assert.async();

		// arrange: title fetch is held back so we can control when it resolves
		var oTracker = new UsageTracker(oFactory.getAppComponent());
		var fnResolveTitle;
		this.sandbox.stub(DocuInfo, "getDocumentTitle").returns(new Promise(function(resolve) { fnResolveTitle = resolve; }));
		oTracker.start("testSiteName");

		var oAddToLogsSpy = this.sandbox.spy(oTracker, "_addToLogs");

		// routeMatched event parameters carry the view with reportsResourceResolved: true
		var oRoute = {
			name: "topicId",
			config: { name: "topicId" },
			arguments: { id: "some-topic" },
			views: [{ getController: function() { return { reportsResourceResolved: true }; } }]
		};
		oTracker._logRouteMatched(oRoute);

		var aPageViews = oAddToLogsSpy.args.map(function(a) { return a[0]; }).filter(function(o) { return o.event === "pageView"; });
		assert.strictEqual(aPageViews.length, 0, "no pageView before resourceResolved");

		// act: resourceResolved fires — triggers the async title fetch
		EventBus.getInstance().publish("usageTracking", "resourceResolved", { routeParameters: oRoute });

		var aPageViewsMid = oAddToLogsSpy.args.map(function(a) { return a[0]; }).filter(function(o) { return o.event === "pageView"; });
		assert.strictEqual(aPageViewsMid.length, 0, "still no pageView — title not yet resolved");

		// act: title resolves
		fnResolveTitle("Glossary");

		Promise.resolve().then(function() {
			var aPageViewsAfter = oAddToLogsSpy.args.map(function(a) { return a[0]; }).filter(function(o) { return o.event === "pageView"; });
			assert.strictEqual(aPageViewsAfter.length, 1, "pageView emitted once title resolves after resourceResolved");
			oTracker.destroy();
			done();
		});
	});
});
