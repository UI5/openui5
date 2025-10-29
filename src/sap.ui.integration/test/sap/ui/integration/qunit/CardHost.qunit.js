/* global QUnit, sinon*/

sap.ui.define([
	"sap/ui/integration/widgets/Card",
	"sap/ui/integration/Host",
	"sap/ui/core/Supportability",
	"qunit/testResources/nextCardReadyEvent"
], function (
	Card,
	Host,
	Supportability,
	nextCardReadyEvent
) {
	"use strict";

	const DOM_RENDER_LOCATION = "qunit-fixture";

	const oContextsManifest = {
		"sap.app": {
			"id": "test2",
			"type": "card"
		},
		"sap.card": {
			"type": "List",
			"configuration": {
				"parameters": {
					"userId": {
						"value": "{context>/sap.sample/user/id/value}"
					}
				}
			},
			"header": {
				"title": "{context>/sap.sample/user/name/value}",
				"subtitle": "{{parameters.userId}}"
			}
		}
	};

	QUnit.module("Context", {
		beforeEach: function () {
			const oSamples = {
				"sap.sample/user/id/value": 15,
				"sap.sample/user/name/value": "User name"
			};

			this.oSamples = oSamples;

			this.oHost = new Host();

			this.oHost.getContextValue = function (sPath) {
				const sResult = oSamples[sPath];
				if (sResult) {
					return Promise.resolve(sResult);
				} else {
					return Promise.reject(sPath + " was not found.");
				}
			};

			this.oCard = new Card({
				baseUrl: "test-resources/sap/ui/integration/qunit/testResources",
				manifest: oContextsManifest,
				host: this.oHost
			});
			this.oCard.setHost(this.oHost);
		},
		afterEach: function () {
			this.oCard.destroy();
			this.oCard = null;
			this.oHost.destroy();
			this.oHost = null;
		}
	});

	QUnit.test("Context values", async function (assert) {
		// Act
		this.oCard.placeAt(DOM_RENDER_LOCATION);

		await nextCardReadyEvent(this.oCard);

		const oHeader = this.oCard.getCardHeader(),
			sTitle = oHeader.getTitle(),
			sSubtitle = oHeader.getSubtitle();

		// Assert
		assert.strictEqual(sTitle, "User name", "User name parameter is parsed correctly.");
		assert.strictEqual(sSubtitle, "15", "User id parameter is parsed correctly.");
	});

	QUnit.module("Events", {
		beforeEach: function () {
			this.oHost = new Host();
		},
		afterEach: function () {
			this.oHost.destroy();
			this.oHost = null;
		}
	});

	QUnit.test("Context values", async function (assert) {
		// Arrange
		const oHost = this.oHost,
			oCard = new Card({
				baseUrl: "test-resources/sap/ui/integration/qunit/testResources",
				dataMode: "Active",
				manifest: {
					"sap.app": {
						"id": "test4",
						"type": "card"
					},
					"sap.card": {
						"type": "List",
						"data": {
							"request": {
								"url": "items.json"
							}
						},
						"header": {
							"title": "{context>/sap.sample/user/name/value}",
							"subtitle": "{{parameters.userId}}"
						},
						"content": {
							"data": {
								"path": "/"
							},
							"item": {
								"title": "{Name}"
							}
						}
					}
				},
				host: oHost
			});
			let iCounter = 0;

		oHost.attachCardInitialized(function (oEvent) {
			// Assert
			assert.ok(true, "cardInitialized is fired.");
			assert.strictEqual(oEvent.getParameter("card"), oCard, "The passed card is correct.");
			iCounter++;
		});

		// Act
		oCard.startManifestProcessing();

		await nextCardReadyEvent(oCard);
		oCard.refresh();
		oCard.startManifestProcessing();

		await nextCardReadyEvent(oCard);

		// Assert
		assert.strictEqual(iCounter, 1, "The cardInitialized is fired only once even if refresh() is called.");
	});

	QUnit.module("Destinations", {
		beforeEach: function () {
			this.oHost = new Host();
			this.oCard = new Card();
			this.sDestinationName = "testDestination";
		},
		afterEach: function () {
			this.oHost.destroy();
			this.oHost = null;
			this.oCard.destroy();
			this.oCard = null;
		}
	});

	QUnit.test("getDestination - successful resolution", async function (assert) {
		const sExpectedUrl = "https://example.com/api";

		// Test string return
		this.oHost.setResolveDestination(function (sName, oCard) {
			assert.strictEqual(sName, this.sDestinationName, "Destination name is passed correctly");
			assert.ok(oCard, "Card instance is passed correctly");
			return sExpectedUrl;
		}.bind(this));

		let sResult = await this.oHost.getDestination(this.sDestinationName, this.oCard);
		assert.strictEqual(sResult, sExpectedUrl, "String return value is resolved correctly");

		// Test Promise return
		this.oHost.setResolveDestination(function () {
			return Promise.resolve(sExpectedUrl);
		});

		sResult = await this.oHost.getDestination(this.sDestinationName, this.oCard);
		assert.strictEqual(sResult, sExpectedUrl, "Promise return value is resolved correctly");
	});

	QUnit.test("getDestination - no resolveDestination function", async function (assert) {
		try {
			await this.oHost.getDestination(this.sDestinationName, this.oCard);
			assert.ok(false, "Should reject when no resolveDestination function is set");
		} catch (sError) {
			assert.strictEqual(sError, "Could not resolve destination '" + this.sDestinationName + "'. There is no 'resolveDestination' callback function configured in the host.",
				"Correct error when no resolveDestination function");
		}
	});

	QUnit.test("getDestination - resolveDestination returns null/undefined", async function (assert) {
		this.oHost.setResolveDestination(function () {
			return null;
		});

		try {
			await this.oHost.getDestination(this.sDestinationName, this.oCard);
			assert.ok(false, "Should reject when resolveDestination returns null/undefined");
		} catch (sError) {
			assert.strictEqual(sError, "Destination '" + this.sDestinationName + "' could not be resolved by the host.",
				"Correct error when destination returns null/undefined");
		}
	});

	QUnit.test("getDestination - promise rejected", async function (assert) {
		this.oHost.setResolveDestination(function () {
			return Promise.reject("Custom rejection");
		});

		try {
			await this.oHost.getDestination(this.sDestinationName, this.oCard);
			assert.ok(false, "Should reject when Promise is rejected");
		} catch (sError) {
			assert.strictEqual(sError, "Custom rejection", "Promise rejection is forwarded correctly");
		}
	});

	QUnit.test("getDestinations - default return", async function (assert) {
		const aResult = await this.oHost.getDestinations();
		assert.ok(Array.isArray(aResult), "Returns an array");
		assert.strictEqual(aResult.length, 0, "Default implementation returns empty array");
	});

	QUnit.module("Context Operations", {
		beforeEach: function () {
			this.oHost = new Host();
		},
		afterEach: function () {
			this.oHost.destroy();
			this.oHost = null;
		}
	});

	QUnit.test("getContextValue - default return", async function (assert) {
		const oResult = await this.oHost.getContextValue("sap.sample/test/path");
		assert.strictEqual(oResult, null, "Default implementation returns null");
	});

	QUnit.test("getContexts - default return", async function (assert) {
		const oResult = await this.oHost.getContexts();
		assert.ok(typeof oResult === "object" && oResult !== null, "Returns an object");
		assert.deepEqual(oResult, {}, "Default implementation returns empty object");
	});

	QUnit.module("Experimental Caching", {
		beforeEach: function () {
			this.oHost = new Host();
		},
		afterEach: function () {
			this.oHost.destroy();
			this.oHost = null;
		}
	});

	QUnit.test("useExperimentalCaching - enables caching and message subscription", function (assert) {
		const fnSubscribeForMessagesSpy = sinon.spy(this.oHost, "subscribeForMessages");

		this.oHost.useExperimentalCaching();

		assert.strictEqual(this.oHost.bUseExperimentalCaching, true, "Caching flag is set");
		assert.ok(fnSubscribeForMessagesSpy.calledOnce, "Message subscription is initiated");

		fnSubscribeForMessagesSpy.restore();
	});

	QUnit.test("stopUsingExperimentalCaching - disables caching and message subscription", function (assert) {
		this.oHost.useExperimentalCaching();

		const fnUnsubscribeForMessagesSpy = sinon.spy(this.oHost, "unsubscribeForMessages");

		this.oHost.stopUsingExperimentalCaching();

		assert.strictEqual(this.oHost.bUseExperimentalCaching, false, "Caching flag is cleared");
		assert.ok(fnUnsubscribeForMessagesSpy.calledOnce, "Message subscription is removed");

		fnUnsubscribeForMessagesSpy.restore();
	});

	QUnit.test("subscribeForMessages - handles service worker availability", function (assert) {
		const fnAddEventListenerSpy = sinon.spy();
		let oNavigatorStub = sinon.stub(window, "navigator").value({});

		this.oHost.subscribeForMessages();
		assert.ok(true, "subscribeForMessages handles missing serviceWorker gracefully");

		oNavigatorStub.restore();

		oNavigatorStub = sinon.stub(window, "navigator").value({
			serviceWorker: {
				addEventListener: fnAddEventListenerSpy
			}
		});

		this.oHost.subscribeForMessages();

		assert.ok(fnAddEventListenerSpy.calledOnce, "addEventListener is called when serviceWorker is available");
		assert.strictEqual(fnAddEventListenerSpy.getCall(0).args[0], "message", "Subscribes to 'message' event");
		assert.strictEqual(fnAddEventListenerSpy.getCall(0).args[1], this.oHost._handlePostMessageBound, "Uses bound handler");

		oNavigatorStub.restore();
	});

	QUnit.test("unsubscribeForMessages - handles service worker availability", function (assert) {
		const fnRemoveEventListenerSpy = sinon.spy();
		let oNavigatorStub = sinon.stub(window, "navigator").value({});

		this.oHost.unsubscribeForMessages();
		assert.ok(true, "unsubscribeForMessages handles missing serviceWorker gracefully");

		oNavigatorStub.restore();

		oNavigatorStub = sinon.stub(window, "navigator").value({
			serviceWorker: {
				removeEventListener: fnRemoveEventListenerSpy
			}
		});

		this.oHost.unsubscribeForMessages();

		assert.ok(fnRemoveEventListenerSpy.calledOnce, "removeEventListener is called when serviceWorker is available");
		assert.strictEqual(fnRemoveEventListenerSpy.getCall(0).args[0], "message", "Unsubscribes from 'message' event");
		assert.strictEqual(fnRemoveEventListenerSpy.getCall(0).args[1], this.oHost._handlePostMessageBound, "Uses bound handler");

		oNavigatorStub.restore();
	});

	QUnit.module("Fetch Method", {
		beforeEach: function () {
			this.oHost = new Host();
			this.oCard = new Card();
			this.oServer = sinon.createFakeServer({
				autoRespond: true
			});
		},
		afterEach: function () {
			this.oHost.destroy();
			this.oHost = null;
			this.oCard.destroy();
			this.oCard = null;
			this.oServer.restore();
		}
	});

	QUnit.test("fetch - adds statistics parameter when statistics are globally enabled", function (assert) {
		const done = assert.async();
		const sResource = "/api/data";
		const mOptions = { method: "GET", headers: new Headers() };
		const mRequestSettings = {};

		const oStatisticsStub = sinon.stub(Supportability, "isStatisticsEnabled").returns(true);

		this.oServer.respondWith("GET", /\/api\/data/, function (oXhr) {
			assert.ok(oXhr.url.includes("sap-statistics=true"), "Statistics parameter is added to URL");

			oXhr.respond(200, { "Content-Type": "application/json" }, "{}");

			oStatisticsStub.restore();
			done();
		});

		this.oHost.fetch(sResource, mOptions, mRequestSettings, this.oCard);
	});

	QUnit.test("fetch - adds cache headers when experimental caching enabled", function (assert) {
		const done = assert.async();
		const sResource = "/api/data";
		const mOptions = { method: "GET", headers: new Headers() };
		const mRequestSettings = {
			cache: {
				enabled: true,
				maxAge: 300,
				staleWhileRevalidate: true
			}
		};

		this.oHost.useExperimentalCaching();

		this.oServer.respondWith("GET", "/api/data", function (oXhr) {
			const oRequestHeaders = oXhr.requestHeaders;
			assert.ok(oRequestHeaders["cache-control"], "cache-control header is added");

			const sCacheControlHeader = oRequestHeaders["cache-control"];
			assert.ok(sCacheControlHeader.includes("max-age=300"), "Max-age is set correctly");
			assert.ok(sCacheControlHeader.includes("x-stale-while-revalidate"), "x-stale-while-revalidate is set");
			assert.strictEqual(oRequestHeaders["x-sap-card"], "true", "x-sap-card header is set");
			assert.strictEqual(oRequestHeaders["x-use-cryptocache"], "true", "x-use-cryptocache header is set");

			oXhr.respond(200, { "Content-Type": "application/json" }, "{}");
			done();
		});

		this.oHost.fetch(sResource, mOptions, mRequestSettings, this.oCard);
	});

	QUnit.test("fetch - handles disabled caching correctly", function (assert) {
		const done = assert.async();
		const sResource = "/api/data";
		const mOptions = { method: "GET", headers: new Headers() };
		const mRequestSettings = {
			cache: {
				enabled: false
			}
		};

		this.oHost.useExperimentalCaching();

		this.oServer.respondWith("GET", "/api/data", function (oXhr) {
			const oRequestHeaders = oXhr.requestHeaders;
			const sCacheControlHeader = oRequestHeaders["cache-control"];
			assert.ok(sCacheControlHeader.includes("max-age=0"), "Max-age is set to 0");
			assert.ok(sCacheControlHeader.includes("no-store"), "No-store is set when caching disabled");

			oXhr.respond(200, { "Content-Type": "application/json" }, "{}");
			done();
		});

		this.oHost.fetch(sResource, mOptions, mRequestSettings, this.oCard);
	});
});
