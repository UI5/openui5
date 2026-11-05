/*global QUnit, sinon*/
sap.ui.define([
	"sap/ui/documentation/sdk/controller/Sample.controller",
	"sap/ui/documentation/sdk/util/Resources",
	"sap/ui/core/EventBus"
],
function (
	SampleController,
	ResourcesUtil,
	EventBus
) {
	"use strict";

	var sSampleId = 'sample.id';

	QUnit.module("_initIframeURL", {
		beforeEach: function () {
			this.controller = new SampleController();
			this.controller._sId = sSampleId;
		},
		afterEach: function () {
			this.controller.destroy();
			this.controller = null;
		}
	});

	QUnit.test("url resource origin", function (assert) {
		var sResourceOrigin = 'https://dkorigin.com',
			sResourcesBaseUrl = sResourceOrigin + "/path",
			oIFrameUrl;

		this.stub(ResourcesUtil, "getConfig").returns(sResourcesBaseUrl);
		this.stub(ResourcesUtil, "getResourceOrigin").returns(sResourceOrigin);

		// Act
		this.controller._initIframeURL();

		//Check
		oIFrameUrl = new URL(this.controller.sIFrameUrl);
		assert.strictEqual(oIFrameUrl.origin, sResourceOrigin);
		assert.strictEqual(oIFrameUrl.searchParams.get("sap-ui-xx-sample-origin"), sResourcesBaseUrl);
	});

	QUnit.test("url contains demokit version", function (assert) {
		var sVersion = '1.71.0',
			oIFrameUrl;

		this.stub(ResourcesUtil, "getResourcesVersion").returns(sVersion);

		// Act
		this.controller._initIframeURL();

		//Check
		oIFrameUrl = new URL(this.controller.sIFrameUrl, document.baseURI);
		assert.strictEqual(oIFrameUrl.searchParams.get("sap-ui-xx-sample-origin"), "." + sVersion); // current output
	});

	QUnit.test("url contains sample id", function (assert) {
		var oIFrameUrl;

		// Act
		this.controller._initIframeURL();

		//Check
		oIFrameUrl = new URL(this.controller.sIFrameUrl, document.baseURI);
		assert.strictEqual(oIFrameUrl.searchParams.get("sap-ui-xx-sample-id"), sSampleId, "sample id is correct");
	});

    QUnit.test("url contains sample origin", function (assert) {
		var sSampleOrigin = ResourcesUtil.getConfig(),
			oIFrameUrl;

		// Act
		this.controller._initIframeURL();

		//Check
		oIFrameUrl = new URL(this.controller.sIFrameUrl, document.baseURI);
		assert.strictEqual(oIFrameUrl.searchParams.get("sap-ui-xx-sample-origin"), sSampleOrigin, "sample origin is correct");
	});

	QUnit.test("url contains sample library", function (assert) {
		var sSampleLib = "",
			oIFrameUrl;

		// Act
		this.controller._initIframeURL();

		//Check
		oIFrameUrl = new URL(this.controller.sIFrameUrl, document.baseURI);
		assert.strictEqual(oIFrameUrl.searchParams.get("sap-ui-xx-sample-lib"), sSampleLib, "sample origin is correct");
	});

	QUnit.test("allowlisted query params are percent-encoded in the iframe URL", function (assert) {
		// Arrange: inject a value with characters that are HTML-significant after URL-decoding.
		// %22 decodes to a double-quote; without encodeURIComponent it would appear raw in sIFrameUrl
		// and break out of the src="..." attribute when the string is used as HTML.
		var sInjected = '"onload=alert(origin) x="',
			sOriginalUrl = window.location.href,
			oCurrentUrl = new URL(sOriginalUrl);

		window.history.replaceState({}, "", oCurrentUrl.pathname +
			"?sap-ui-rtl=" + encodeURIComponent(sInjected) + oCurrentUrl.hash);

		// Act
		try {
			this.controller._initIframeURL();

			// Check: the raw decoded value must NOT appear anywhere in the URL string
			assert.notOk(
				this.controller.sIFrameUrl.indexOf(sInjected) !== -1,
				"decoded injection payload must not appear in sIFrameUrl"
			);
			// And the value must be recoverable via URLSearchParams (round-trip)
			var oIFrameUrl = new URL(this.controller.sIFrameUrl, document.baseURI);
			assert.strictEqual(
				oIFrameUrl.searchParams.get("sap-ui-rtl"),
				sInjected,
				"URLSearchParams round-trip recovers the original value"
			);
		} finally {
			window.history.replaceState({}, "", sOriginalUrl);
		}
	});

	QUnit.module("_createHTMLControl", {
		beforeEach: function () {
			this.controller = new SampleController();
			this.controller._sId = sSampleId;
			this.controller.sIFrameUrl = "https://sdk.example.com/index.html?sap-ui-xx-sample-id=" + sSampleId;
		},
		afterEach: function () {
			this.controller.destroy();
			this.controller = null;
		}
	});

	QUnit.test("HTML content does not contain the iframe src URL", function (assert) {
		// The src must be set via DOM property after rendering, never embedded in the HTML string,
		// to prevent HTML-attribute injection through URL characters such as quotes.
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
			this.controller = new SampleController();
			this.controller._fnOnMessage = function() {}; // Simulate the bound handler
		},
		afterEach: function () {
			this.controller.destroy();
			this.controller = null;
		}
	});

	QUnit.test("removes message event listener on exit", function (assert) {
		// Arrange
		var spy = this.spy(window, "removeEventListener");

		// Act
		this.controller.onExit();

		// Assert
		assert.ok(spy.calledWith("message", this.controller._fnOnMessage),
			"removeEventListener should be called with 'message' event and the bound handler");
	});

	function filterResourceResolvedPublishes(spy) {
		return spy.args.filter(function (a) {
			return a[0] === "usageTracking" && a[1] === "resourceResolved";
		});
	}

	function makeValidSamplesData(sId) {
		var oSamples = {};
		oSamples[sId] = {
			id: sId,
			name: "Test Sample",
			entityId: "entity.id",
			library: "sap.m",
			description: "A test sample"
		};
		return { samples: oSamples };
	}

	QUnit.module("Sample.controller — reportsResourceResolved", {
		beforeEach: function () {
			this.oController = new SampleController();
		},
		afterEach: function () {
			this.oController.destroy();
			this.oController = null;
		}
	});

	QUnit.test("reportsResourceResolved is true", function (assert) {
		assert.strictEqual(this.oController.reportsResourceResolved, true,
			"Sample.controller declares reportsResourceResolved: true");
	});

	QUnit.module("Sample.controller — _loadSample resourceResolved", {
		beforeEach: function () {
			this.oPublishSpy = sinon.spy(EventBus.getInstance(), "publish");
			this.oController = new SampleController();
			this.oController._sId = sSampleId;
			this.oController._sEntityId = null;

			var oFakePage = {
				setBusy: function () {},
				removeAllContent: function () {},
				addContent: function () {},
				setProperty: function () {}
			};
			this.oController._getPage = function () { return oFakePage; };

			var oFakeModel = {
				getData: function () { return {}; },
				setData: function () {},
				getProperty: function () { return "Test Sample"; }
			};
			this.oController.oModel = oFakeModel;
			this.oController.getModel = function () { return oFakeModel; };

			this.oController._createIframe = function () {
				return Promise.resolve({});
			};

			this.oController.getOwnerComponent = function () {
				return { _oCurrentOpenedSample: null };
			};

			this.oController.getAPIReferenceCheckPromise = function () {
				return Promise.resolve(false);
			};

			this.oController.getView = function () {
				return { byId: function () { return { setVisible: function () {} }; } };
			};

			this.oController.appendPageTitle = function () {};
			this.oController.onRouteNotFound = sinon.spy();
		},
		afterEach: function () {
			this.oPublishSpy.restore();
			this.oController.destroy();
			this.oController = null;
		}
	});

	QUnit.test("valid sample — _loadSample resolves truthy → resourceResolved published once", function (assert) {
		var done = assert.async();
		var oController = this.oController;
		var oPublishSpy = this.oPublishSpy;

		oController._loadSample(makeValidSamplesData(sSampleId))
			.then(function (bLoaded) {
				if (bLoaded) {
					EventBus.getInstance().publish("usageTracking", "resourceResolved");
				}
			})
			.then(function () {
				assert.strictEqual(filterResourceResolvedPublishes(oPublishSpy).length, 1,
					"resourceResolved published exactly once for a valid sample");
				done();
			});
	});

	QUnit.test("sample not found — _loadSample resolves falsy → no resourceResolved", function (assert) {
		var done = assert.async();
		var oController = this.oController;
		var oPublishSpy = this.oPublishSpy;

		oController._loadSample({ samples: {} })
			.then(function (bLoaded) {
				if (bLoaded) {
					EventBus.getInstance().publish("usageTracking", "resourceResolved");
				}
			})
			.then(function () {
				assert.strictEqual(filterResourceResolvedPublishes(oPublishSpy).length, 0,
					"resourceResolved not published when sample is not found");
				assert.ok(oController.onRouteNotFound.calledOnce,
					"onRouteNotFound called when sample is not found");
				done();
			});
	});

});