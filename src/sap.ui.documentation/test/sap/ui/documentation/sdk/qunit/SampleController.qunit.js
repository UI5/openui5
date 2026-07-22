/*global QUnit*/
sap.ui.define([
	"sap/ui/documentation/sdk/controller/Sample.controller",
	"sap/ui/documentation/sdk/util/Resources"
],
function (
	SampleController,
	ResourcesUtil
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

});