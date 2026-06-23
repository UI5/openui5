/*global QUnit */
sap.ui.define([
	"sap/ui/core/Element",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/m/App",
	"sap/m/Page",
	"sap/ui/thirdparty/jquery",
	"sap/ui/Device",
	"sap/ui/test/utils/nextUIUpdate"
], function(Element, createAndAppendDiv, App, Page, jQuery, Device, nextUIUpdate) {
	"use strict";

	createAndAppendDiv("content");

	function getBgDomElement(oApp) {
		return oApp.getDomRef("BG");
	}

	const sBackroungImageSrc = "test-resources/sap/m/images/SAPLogo.jpg";

	const app = new App("myFirstApp", {
		initialPage: "page1",
		homeIcon: "test.png",
		pages: [
			new Page("page1", {
				title: "Page 1"
			}),
			new Page("page2", {
				title: "Page 2"
			}),
			new Page("page3", {
				title: "Page 3"
			})
		]
	});
	app.placeAt("content");



	QUnit.test("App is rendered and initial page is displayed", function(assert) {
		assert.ok(document.getElementById("myFirstApp"), "App should be rendered");
		assert.ok(document.getElementById("page1"), "Initially the first page should be rendered");
	});

	QUnit.test("Home icon link tag is created with correct href", function(assert) {
		const $hi = jQuery("link").filter("[rel=apple-touch-icon]");
		assert.equal($hi.length, 1, "There should be 1 link tags with the home icons");
		assert.equal($hi.attr("href"), "test.png", "link tag should point to the home icon");
	});

	QUnit.test("Viewport meta tag is present with correct content", function(assert) {
		// check viewport:  <meta name="viewport" content="width=device-width, initial-scale=1.0">
		const $v = jQuery("meta").filter("[name=viewport]");
		assert.equal($v.length, 1, "There should be a viewport meta tag");
		if (Device.os.ios) {
			assert.equal($v.attr("content"), "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no", "The viewport meta tag content should be correct");
		} else {
			assert.equal($v.attr("content"), "width=device-width, initial-scale=1.0", "The viewport meta tag content should be correct");
		}
	});

	QUnit.test("App dimensions fill the entire window", function(assert) {
		const appDom = document.getElementById("myFirstApp");
		const ww = document.body.getBoundingClientRect().width;
		const wh = document.documentElement.getBoundingClientRect().height;
		assert.equal(appDom.getBoundingClientRect().width, ww, "width should be the complete window width");
		assert.equal(Math.round(appDom.getBoundingClientRect().height), Math.round(wh), "height should be the complete window height"); // rounding needed for IE11
		});

	QUnit.test("App and all pages are removed from DOM and control tree on destroy", function(assert) {
		app.destroy();
		assert.equal(document.getElementById("page1"), undefined, "Page 1 should not exist anymore in the DOM");
		assert.ok(Element.getElementById("page1") === undefined, "Page 1 should not exist anymore as control");
		assert.equal(document.getElementById("page2"), undefined, "Page 2 should not exist anymore in the DOM");
		assert.ok(Element.getElementById("page2") === undefined, "Page 2 should not exist anymore as control");
		assert.equal(document.getElementById("page3"), undefined, "Page 3 should not exist anymore in the DOM");
		assert.ok(Element.getElementById("page3") === undefined, "Page 3 should not exist anymore as control");
	});


	QUnit.module("backgroundColor", {
		beforeEach: async function () {
			this.oApp = new App();
			this.oApp.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function () {
			this.oApp.destroy();
			this.oApp = null;
		}
	});

	QUnit.test("only valid color is set to DOM element", async function(assert) {
		const oApp = this.oApp;

		oApp.setBackgroundColor("blue;5px solid red;");

		// Act
		oApp.invalidate();
		await nextUIUpdate();

		// Check
		assert.strictEqual(getBgDomElement(oApp).style.backgroundColor, '', "correct property value");
	});


	QUnit.module("backgroundImage", {
		beforeEach: async function () {
			this.oApp = new App();
			this.oApp.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function () {
			this.oApp.destroy();
			this.oApp = null;
		}
	});

	QUnit.test("background image style is applied to the DOM element", async function(assert) {
		// Arrange
		const oApp = this.oApp;
		const sExpectedOutputImagePath = 'url("' + (sBackroungImageSrc) + '")';

		// Act
		oApp.setBackgroundImage(sBackroungImageSrc);
		await nextUIUpdate();

		// Arrange
		const $oAppImageHolder = oApp.$().find('.sapUiGlobalBackgroundImage').get(0);

		// Assert
		assert.strictEqual($oAppImageHolder.style.backgroundImage, sExpectedOutputImagePath,
				"background-image URL is correct.");
	});


	QUnit.test("background image URL with special characters is rendered correctly", async function(assert) {
		// Arrange
		const oApp = this.oApp;
		const sPath = "test-resources/sap/m/images/";
		const sUnreservedChars = "img100-._~";
		const sReservedChars1 = encodeURIComponent("#[]@"); // skipped  :/?  because of OS restriction
		const sReservedChars2 = encodeURIComponent("!$&'()+,;=");
		const sOtherChars = encodeURIComponent(" çéд");
		const sReservedCharsUnencoded = "$";
		const sFileExtension = ".png";
		const sQuery = "?q1=1&q2=2";
		const sImgSrc = sPath + sUnreservedChars + sReservedChars1 + sReservedChars2 + sOtherChars + sReservedCharsUnencoded + sFileExtension + sQuery;
		const sExpectedOutputImagePath = 'url("' + (sImgSrc) + '")';

		// Act
		oApp.setBackgroundImage(sImgSrc);
		await nextUIUpdate();

		// Arrange
		const $oAppImageHolder = oApp.$().find('.sapUiGlobalBackgroundImage').get(0);

		// Assert
		assert.strictEqual($oAppImageHolder.style.backgroundImage, sExpectedOutputImagePath,
				"background-image URL is correct.");
	});

	QUnit.test("background image with base64 encoded data URI is rendered correctly", async function(assert) {
		// Arrange
		const oApp = this.oApp;
		const sImgSrc = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==";
		const sExpectedOutputImagePath = 'url("' + sImgSrc + '")';

		// Act
		oApp.setBackgroundImage(sImgSrc);
		await nextUIUpdate();

		// Arrange
		const $oAppImageHolder = oApp.$().find('.sapUiGlobalBackgroundImage').get(0);

		// Assert
		assert.strictEqual($oAppImageHolder.style.backgroundImage, sExpectedOutputImagePath,
				"background-image URL is correct.");
	});


	QUnit.test("CSS-specific characters in backgroundImage value are encoded to prevent style injection", async function(assert) {
		// Arrange
		const sImageSrc = sBackroungImageSrc + ");border:5px solid red;";
		const oApp = this.oApp;
		const oAppDom = getBgDomElement(oApp);
		const sBorderBeforeTest = oAppDom.style.border;

		// Act
		oApp.setBackgroundImage(sImageSrc);
		await nextUIUpdate();

		// Check
		assert.strictEqual(getBgDomElement(oApp).style.border, sBorderBeforeTest, "preserved border style value");
	});


	QUnit.test("HTML-specific characters in backgroundImage value are encoded to prevent handler injection", async function(assert) {
		// Arrange
		const sImageSrc = sBackroungImageSrc + ')"; onmouseover="console.log"';
		const oApp = this.oApp;
		const oAppDom = getBgDomElement(oApp);
		const oHandlerBeforeTest = oAppDom.onmouseover;

		// Act
		oApp.setBackgroundImage(sImageSrc);
		await nextUIUpdate();

		// Check
		assert.strictEqual(getBgDomElement(oApp).onmouseover, oHandlerBeforeTest, "preserved handler value");
	});

	QUnit.module("Parent traversing", {
		beforeEach: async function () {
			this.oApp = new App();
			this.oSpy = this.spy(this.oApp, "_adjustParentsHeight");
			this.oApp.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function () {
			this.oApp.destroy();
			this.oApp = null;
		}
	});

	QUnit.test("isTopLevel property controls whether parent height adjustment is performed", async function(assert) {
		assert.strictEqual(this.oSpy.called, true, "Parents are traversed when isTopLevel value is true");

		this.oSpy.resetHistory();

		this.oApp.setIsTopLevel(false);
		await nextUIUpdate();

		assert.strictEqual(this.oSpy.notCalled, true, "Parents are not traversed when isTopLevel value is false");
	});

	QUnit.module("Invisible App", {
		beforeEach: async function () {
			this.oApp = new App({ visible: false });
			this.oApp.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function () {
			this.oApp.destroy();
			this.oApp = null;
		}
	});

	QUnit.test("Error not thrown when App is invisible and has no parent", function(assert) {
		assert.ok(true, "Error is not thrown when there is no parent of the App and it's initially invisible");
	});
});
