/*global QUnit, sinon */
sap.ui.define([
	"sap/m/Image",
	"sap/ui/core/Lib",
	"sap/ui/thirdparty/jquery",
	"sap/m/library",
	"sap/m/LightBox",
	"sap/m/Page",
	"sap/m/Text",
	"sap/ui/events/KeyCodes",
	"sap/ui/Device",
	"sap/m/VBox",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/core/library",
	"sap/ui/test/utils/nextUIUpdate"
], function(Image, Library, jQuery, mobileLibrary, LightBox, Page, Text, KeyCodes, Device, VBox, createAndAppendDiv, coreLibrary, nextUIUpdate) {
	"use strict";

	// shortcut for sap.m.ImageMode
	const ImageMode = mobileLibrary.ImageMode;

	// shortcut for sap.ui.core.aria.HasPopup
	const AriaHasPopup = coreLibrary.aria.HasPopup;

	createAndAppendDiv("content");

	const IMAGE_PATH = "test-resources/sap/m/images/";
	const sSrc = IMAGE_PATH + "SAPLogo.jpg";
	const sSrc2 = IMAGE_PATH + "SAPLogo@2.jpg";
	const sSrc3 = IMAGE_PATH + "SAPUI5.png";
	const sSrcAction = IMAGE_PATH + "action.png";
	const sSrcActionPressed = IMAGE_PATH + "action_pressed.png";
	const sTooltip = "tooltip";
	const sAlt = "alternative text";

	const sControlId = "ImId";

	// Creates a Image with generic properties
	// Config object can be passed as argument. If some property already exist it will be overridden
	function createImage(oProps) {
		const oImageProps = {
			src: sSrc,
			width: "150px",
			height: "74px"
		};
		oProps && jQuery.extend(oImageProps, oProps);

		return new Image(sControlId, oImageProps);
	}

	function createSVGImage(oProps) {
		const oImageProps = {
			src: "https://openui5.org/7726d076e89ac67994e0a4d96106d534/B_OpenUI5_H.svg",
			width: "150px",
			height: "74px"
		};
		oProps && jQuery.extend(oImageProps, oProps);

		return new Image(sControlId, oImageProps);
	}
	/* tests */
	QUnit.module("Basic rendering");

	QUnit.test("Image is rendered when it's visible", async function(assert) {
		// Arrange
		const oImage = createImage();

		// Act
		oImage.placeAt("qunit-fixture");
		await nextUIUpdate();

		// Assert
		const $oImage = oImage.$();
		assert.ok($oImage.hasClass("sapMImg"), "Image is rendered.");
		assert.ok(($oImage !== undefined) && ($oImage != null), "oImage should not be null");

		// Clean up
		oImage.destroy();
	});

	QUnit.test("Image is not rendered when it's not visible", async function(assert) {
		// Arrange
		const oImage = createImage({
			visible: false
		});

		// Act
		oImage.placeAt("qunit-fixture");
		await nextUIUpdate();

		// Assert
		const $oImage = oImage.$();
		assert.ok(!$oImage.hasClass("sapMImg"), "sapMImage class is not found.");
		assert.ok(!document.getElementById(sControlId) , "oImage is not rendered");

		// Clean up
		oImage.destroy();
	});

	QUnit.test("Image is rendered with correct backgroundPosition value", async function(assert) {
		// Arrange
		const oImage = createImage({
			mode: "Background"
		});
		const aTestInputValues = ["left top", "right bottom", "right top", "50% 50%", "10px 20px", "initial", " left  top ", "50px;5px solid red", '50px" onerror='];
		const aExpOutputValues = ["left top", "right bottom", "right top", "50% 50%", "10px 20px", "initial", "left top", "" /*invalid value should be discarded*/, "" /*invalid value should be discarded*/];

		// Act
		oImage.placeAt("qunit-fixture");
		await nextUIUpdate();

		for (let iIndex = 0; iIndex < aTestInputValues.length; iIndex++) {
			oImage.setBackgroundPosition(aTestInputValues[iIndex]);
			oImage.invalidate();
			await nextUIUpdate();

			// Assert
			const oImageDom = oImage.getDomRef();
			assert.strictEqual(oImageDom.style.backgroundPosition, aExpOutputValues[iIndex], "correct property value");
		}

		// Clean up
		oImage.destroy();
	});

	QUnit.test("Image is rendered with correct backgroundSize value", async function(assert) {
		// Arrange
		const oImage = createImage({
			mode: "Background"
		});
		// BCP: 1970042795 - There is no "auto" value for FireFox
		const sAuto = Device.browser.firefox ? "initial" : "auto";
		const aTestInputValues = ["50% 50%", "10px 20px", "initial", sAuto, "cover", "contain", "50px;5px solid red", '50px" onerror='];
		const aExpOutputValues = ["50% 50%", "10px 20px", "initial", sAuto, "cover", "contain", "" /*invalid value should be discarded*/, "" /*invalid value should be discarded*/];

		// Act
		oImage.placeAt("qunit-fixture");
		await nextUIUpdate();

		for (let iIndex = 0; iIndex < aTestInputValues.length; iIndex++) {
			oImage.setBackgroundSize(aTestInputValues[iIndex]);
			oImage.invalidate();
			await nextUIUpdate();

			// Assert
			const oImageDom = oImage.getDomRef();
			assert.strictEqual(oImageDom.style.backgroundSize, aExpOutputValues[iIndex], "correct property value");
		}

		// Clean up
		oImage.destroy();
	});

	QUnit.test("Image is rendered with correct backgroundRepeat value", async function(assert) {
		// Arrange
		const oImage = createImage({
			mode: "Background"
		});
		const aTestInputValues = ["repeat", "repeat-x", "repeat-y", "no-repeat", "space", "round", "initial", "initial;5px solid red", 'initial" onerror='];
		const aExpOutputValues = ["repeat", "repeat-x", "repeat-y", "no-repeat", "space", "round", "initial", "" /*invalid value should be discarded*/, "" /*invalid value should be discarded*/];

		// Act
		oImage.placeAt("qunit-fixture");
		await nextUIUpdate();

		for (let iIndex = 0; iIndex < aTestInputValues.length; iIndex++) {
			oImage.setBackgroundRepeat(aTestInputValues[iIndex]);
			oImage.invalidate();
			await nextUIUpdate();

			// Assert
			const oImageDom = oImage.getDomRef();
			assert.strictEqual(oImageDom.style.backgroundRepeat, aExpOutputValues[iIndex], "correct property value");
		}

		// Clean up
		oImage.destroy();
	});

	QUnit.test("Image is rendered with detailBox", async function(assert) {
		// Arrange
		const oImage = createImage();

		oImage.setDetailBox(new LightBox());

		// Act
		oImage.placeAt("qunit-fixture");
		await nextUIUpdate();

		// Assert
		const oInnerImg = oImage.$("inner")[0];
		assert.ok(oInnerImg.id, "Internal image has an id.");
		assert.equal(oImage.getFocusDomRef(), oInnerImg, "FocusDomRef is correct");

		// Clean up
		oImage.destroy();
	});

	QUnit.test("Image in 'Svg' mode renders inline 'svg'", async function(assert) {
		// Arrange
		const oImage = createImage({
				src: ("/testsuite/test-resources/sap/m/demokit/sample/Image/images/sap-logo.svg"),
				mode: "InlineSvg"
			});
		const fnDone = assert.async();
		const oSpy = this.spy(oImage.getRenderer(), "_renderSvg");

		assert.expect(1);

		// Act
		oImage.placeAt("qunit-fixture");
		await nextUIUpdate();

		// wait for async SVG load/render
		setTimeout(function() {
			// Assert
			assert.ok(oSpy.called, "Inline svg is rendered");

			// Clean up
			oImage.destroy();
			fnDone();
		}, 1000);
	});

	QUnit.test("Inline Svg with relative links renders correctly", async function(assert) {
		// Arrange
		const oImage = createImage({
				src: (IMAGE_PATH + "avatar_with_nested_images.svg"),
				mode: "InlineSvg"
			});
		const fnDone = assert.async();
		const oSpy = this.spy(oImage, "_toAbsoluteUrl");
		let iRerenderingCount = 0;

		assert.expect(2);

		oImage.addEventDelegate({
			onAfterRendering: function () {
				if (iRerenderingCount === 1) { // we need the second rerendering, as inline-svg images invalidate the control before final rendering
					// Assert
					assert.ok(oSpy.calledWithMatch("avatar_light_theme.svg"));
					assert.ok(oSpy.calledWithMatch("avatar_dark_theme.svg"));

					// Clean up
					oImage.destroy();
					fnDone();
				}
				iRerenderingCount++;
			}
		});

		// Act
		oImage.placeAt("qunit-fixture");
		await nextUIUpdate();
	});

	QUnit.test("Svg data is cached, so upon rerendering svg is not requested twice, but it is still rendered inline", async function(assert) {
		// Arrange
		const oImage = createImage({
				src: ("/testsuite/test-resources/sap/m/demokit/sample/Image/images/sap-logo.svg"),
				mode: "InlineSvg"
			});
		const fnDone = assert.async();
		let oSpy;

		assert.expect(1);

		// Act
		oImage.placeAt("qunit-fixture");
		await nextUIUpdate();

		// wait for async SVG load before testing cache behavior
		setTimeout(function() {
			// Act
			oImage.setWidth("200px");
			oSpy = this.spy(jQuery, "get");

			oImage.addEventDelegate({
				onAfterRendering: function () {

					// Assert
					assert.ok(oSpy.notCalled, "Same svg is not requested twice");

					// Clean up
					oImage.destroy();
					fnDone();
				}
			});
		}.bind(this), 1000);
	});

	QUnit.test("Multiple InlineSvg images have unique scoped IDs", async function(assert) {
		// Arrange - Use same SVG file three times to test duplicate ID handling
		const sSvgPath = IMAGE_PATH + "avatar_with_nested_images.svg";
		const oImage1 = new Image("image1", { src: sSvgPath, mode: "InlineSvg" });
		const oImage2 = new Image("image2", { src: sSvgPath, mode: "InlineSvg" });
		const oImage3 = new Image("image3", { src: sSvgPath, mode: "InlineSvg" });
		const fnDone = assert.async();
		let iRerenderingCount = 0;

		assert.expect(4);

		oImage3.addEventDelegate({
			onAfterRendering: function () {
				if (iRerenderingCount === 1) {
					// wait for all SVG content to be fully rendered into the DOM
					setTimeout(function() {
						// Assert 1: No duplicate IDs in DOM
						const aAllIds = [];
						document.querySelectorAll("pattern[id]").forEach((pattern) => {
							aAllIds.push(pattern.id);
						});
						const bNoDuplicates = aAllIds.length === new Set(aAllIds).size;
						assert.ok(bNoDuplicates, "No duplicate IDs found in the DOM");

						// Assert 2: IDs are scoped with control ID
						const oPattern1 = oImage1.$().find("pattern[id]")[0];
						assert.ok(oPattern1.id.indexOf("image1--") === 0, "Pattern IDs are scoped with control ID");

						// Assert 3: All url(#id) references work
						let bAllReferencesValid = true;
						document.querySelectorAll("path[fill^='url(#']").forEach((path) => {
							const sFill = path.getAttribute("fill");
							const iStart = sFill.indexOf("url(#") + 5;
							const iEnd = sFill.indexOf(")", iStart);
							if (iEnd > iStart) {
								const sRefId = sFill.substring(iStart, iEnd);
								if (!document.getElementById(sRefId)) {
									bAllReferencesValid = false;
								}
							}
						});
						assert.ok(bAllReferencesValid, "All url(#id) references point to existing elements");

						// Assert 4: Re-rendering doesn't cause double-scoping
						oImage1.setWidth("100px");
						// wait for re-render after width change to verify no double-scoping
						setTimeout(function() {
							const oPatternAfter = oImage1.$().find("pattern[id]")[0];
							const bNoDoubleScoping = oPatternAfter.id.split("--").length === 2;
							assert.ok(bNoDoubleScoping, "Re-rendering doesn't cause double-scoping");

							// Clean up
							oImage1.destroy();
							oImage2.destroy();
							oImage3.destroy();
							fnDone();
						}, 100);
					}, 100);
				}
				iRerenderingCount++;
			}
		});

		oImage1.placeAt("qunit-fixture");
		oImage2.placeAt("qunit-fixture");
		oImage3.placeAt("qunit-fixture");
		await nextUIUpdate();
	});

	QUnit.module("Rendering decorative image");

	QUnit.test("Decorative image renders empty alt text and correct tooltip", async function(assert) {
		// Arrange
		const oImage = createImage({
			tooltip: sTooltip,
			alt: sAlt
		});

		// Act
		oImage.placeAt("qunit-fixture");
		await nextUIUpdate();

		// Assert
		// read alt attribute from DOM
		assert.equal(jQuery("#" + sControlId).attr("alt"), "", "alt text of oImage should be an empty string because the image is decorative");

		// read title attribute from DOM
		assert.equal(jQuery("#" + sControlId).attr("title"), sTooltip, "tooltip text should be rendered");

		// Clean up
		oImage.destroy();
	});

	QUnit.test("Decorative image with no alt or tooltip renders empty alt and no title", async function(assert) {
		// Arrange
		const oImage = createImage({
			decorative: true
		});

		// Act
		oImage.placeAt("qunit-fixture");
		await nextUIUpdate();

		// Assert
		assert.equal(document.getElementById(sControlId).getAttribute("alt"), "", "alt attribute of oImage should be an empty string because the image is decorative");
		assert.equal(document.getElementById(sControlId).getAttribute("title"), null, "title attribute of oImage should NOT be rendered");

		// Clean up
		oImage.destroy();
	});

	QUnit.test("Decorative Image ARIA", async function(assert) {
		// Arrange
		const oImage = createImage({
			alt: "abcd"
		});

		// Act
		oImage.placeAt("qunit-fixture");
		await nextUIUpdate();

		// Assert
		const $oImage = oImage.$();
		assert.equal($oImage.attr("role"), "presentation", "role is set to presentation");
		assert.equal($oImage.attr("aria-hidden"), "true", "aria-hidden is set to true");
		assert.ok(!$oImage.attr("alt"), "alt is kept empty");
		assert.ok(!$oImage.attr("title"), "title isn't set when no tooltip is provided");

		oImage.setTooltip(sTooltip);
		await nextUIUpdate();
		assert.equal(oImage.$().attr("title"),sTooltip, "title is updated with tooltip after it's set");

		// Clean up
		oImage.destroy();
	});


	QUnit.module("Rendering non decorative image");

	QUnit.test("Non-decorative image renders alt text and tooltip correctly", async function(assert) {
		// Arrange
		const oImage = createImage({
			decorative: false,
			tooltip: sTooltip,
			alt: sAlt
		});

		// Act
		oImage.placeAt("qunit-fixture");
		await nextUIUpdate();

		// Assert
		// read alt attribute from DOM
		assert.equal(jQuery("#" + sControlId).attr("alt"), sAlt, "alt text of oImage should be rendered");

		// read title attribute from DOM
		assert.equal(jQuery("#" + sControlId).attr("title"), sTooltip, "tooltip text should be rendered");

		// Clean up
		oImage.destroy();
	});

	QUnit.test("Non-decorative image with no alt or tooltip renders no alt or title attributes", async function(assert) {
		// Arrange
		const oImage = createImage({
			decorative: false
		});

		// Act
		oImage.placeAt("qunit-fixture");
		await nextUIUpdate();

		// Assert
		assert.equal(document.getElementById(sControlId).getAttribute("alt"), null, "alt attribute of oImage should NOT be rendered");
		assert.equal(document.getElementById(sControlId).getAttribute("title"), null, "title attribute of oImage should NOT be rendered");

		// Clean up
		oImage.destroy();
	});

	QUnit.test("Non-decorative image uses tooltip as alt text when only tooltip is set", async function(assert) {
		// Arrange
		const oImage = createImage({
			decorative: false,
			tooltip: sTooltip
		});

		// Act
		oImage.placeAt("qunit-fixture");
		await nextUIUpdate();

		// Assert
		assert.equal(jQuery("#" + sControlId).attr("alt"), sTooltip, "alt text of oImage should have the tooltip when alt is not set, but tooltip is");

		oImage.setAlt(sAlt);
		oImage.setTooltip("");
		await nextUIUpdate();

		assert.equal(jQuery("#" + sControlId).attr("alt"), sAlt, "alt text of oImage should be rendered");
		assert.equal(document.getElementById(sControlId).getAttribute("title"), null, "title attribute of oImage should NOT be rendered");

		// Clean up
		oImage.destroy();
	});

	QUnit.test("Non decorative Image ARIA", async function(assert) {
		// Arrange
		const oImage = createImage({
			decorative: false,
			tooltip: sTooltip,
			alt: sAlt
		});

		// Act
		oImage.placeAt("qunit-fixture");
		await nextUIUpdate();

		// Assert
		const $oImage = oImage.$();
		assert.equal($oImage.attr("alt"), sAlt, "alt is rendered");
		assert.equal($oImage.attr("aria-label"), sAlt, "aria-label is rendered");
		assert.equal($oImage.attr("title"), sTooltip, "title is rendered");
		assert.ok(!$oImage.attr("role"), "no role is output");
		assert.ok(!$oImage.attr("aria-hidden"), "no aria-hidden is output");

		// Clean up
		oImage.destroy();
	});


	QUnit.module("Mode property");

	QUnit.test("Default mode property is set to sap.m.ImageMode.Image", async function(assert) {
		// Arrange
		const oImage = createImage();

		// Act
		oImage.placeAt("qunit-fixture");
		await nextUIUpdate();

		// Assert
		assert.equal(oImage.getMode(), ImageMode.Image, "The default mode is set to sap.m.ImageMode.Image");

		// Clean up
		oImage.destroy();
	});

	// BCP: 1880373683 - on zoom 150% img URL is appended with @2 for high density image
	QUnit.test("Image with mode sap.m.ImageMode.Background renders background-image CSS correctly", async function(assert) {
		const done = assert.async();
		const oImage = createImage({
			mode: ImageMode.Background
		});

		// Act
		oImage.placeAt("qunit-fixture");
		await nextUIUpdate();

		// Assert
		jQuery(oImage._oImage).on("load", function() {
			const $Image = oImage.$();
			const sBackgroundImage = $Image.css("background-image");

			assert.equal(sBackgroundImage.indexOf("url("), 0, "The background-image CSS style starts with 'url('");
			assert.equal(sBackgroundImage.charAt(sBackgroundImage.length - 1), ")", "The background-image CSS style ends with ')'");
			assert.ok(sBackgroundImage.substring(4, sBackgroundImage.length - 1).indexOf("images/SAPLogo.jpg") !== -1, "The background-image CSS style has the right path");
			assert.equal($Image.css("background-size"), "cover", "backgroundSize property is set by default to 'cover' and output to the dom CSS style");
			assert.equal($Image.css("background-repeat"), "no-repeat", "backgroundRepeat property is set by default to 'no-repeat' and output to the dom CSS style");
			oImage.destroy();
			assert.equal(oImage._oImage, null, "internal image instance is also set to null");
			done();
		});

	});

	QUnit.module("Aggregations", {
		beforeEach: function () {
			this.oImage = new Image();
		},
		afterEach: function () {
			this.oImage.destroy();
		}
	});

	QUnit.test("detailBox", function (oAssert) {
		oAssert.expect(7);

		// Arrange
		const oLightBox = new LightBox();
		const fnDone = oAssert.async();

		// Act
		this.oImage.setDetailBox(oLightBox);

		// Assert
		oAssert.strictEqual(this.oImage.getDetailBox(), oLightBox, "Returned aggregation should be the same object");
		oAssert.ok(this.oImage._fnLightBoxOpen, "Internal method for opening the LightBox should be available");
		oAssert.ok(this.oImage.hasListeners("press"), "There should be a press event attached to the control");

		// Arrange
		this.oImage.setDetailBox(undefined);

		// Assert
		oAssert.notOk(this.oImage.getDetailBox(), "No LightBox is returned");
		oAssert.notOk(this.oImage._fnLightBoxOpen, "No internal method for opening the LightBox should be assigned");
		oAssert.notOk(this.oImage.hasListeners("press"), "There should no press listeners");

		// Arrange
		this.oImage.attachPress(function () {
			// Assert
			oAssert.ok(true, "Press event also fired");
			fnDone();
		});
		this.oImage.setDetailBox(oLightBox);

		// Act
		this.oImage.firePress();

		// Cleanup
		oLightBox.destroy();
	});

	QUnit.test("detailBox lifecycle and events", function (oAssert) {
		// Arrange
		const oLightBoxA = new LightBox();
		const oLightBoxB = new LightBox();
		const oAttachPressSpy = sinon.spy(this.oImage, "attachPress");
		const oDetachPressSpy = sinon.spy(this.oImage, "detachPress");

		// Act - set LightBox
		this.oImage.setDetailBox(oLightBoxA);

		oAssert.strictEqual(this.oImage.mEventRegistry.press.length, 1, "There should be 1 press event attached");
		oAssert.strictEqual(oAttachPressSpy.callCount, 1, "attachPress method should be called once");
		oAssert.strictEqual(oDetachPressSpy.callCount, 0, "detachPress method should not be called");

		// Act - replace with new LightBox
		oAttachPressSpy.resetHistory();
		this.oImage.setDetailBox(oLightBoxB);

		// Assert
		oAssert.strictEqual(this.oImage.mEventRegistry.press.length, 1, "There should be 1 press event attached");
		oAssert.strictEqual(oAttachPressSpy.callCount, 1, "attachPress method should be called once");
		oAssert.strictEqual(oDetachPressSpy.callCount, 1, "detachPress method should be called once");

		// Act - replace with the same LightBox
		oAttachPressSpy.resetHistory();
		oDetachPressSpy.resetHistory();
		this.oImage.setDetailBox(oLightBoxB);

		// Assert
		oAssert.strictEqual(this.oImage.mEventRegistry.press.length, 1, "There should be 1 press event attached");
		oAssert.strictEqual(oAttachPressSpy.callCount, 0, "attachPress method should not be called");
		oAssert.strictEqual(oDetachPressSpy.callCount, 0, "detachPress method should not be called");

		// Act - replace with the same LightBox
		oDetachPressSpy.resetHistory();
		this.oImage.setDetailBox(undefined);

		// Assert
		oAssert.strictEqual(oDetachPressSpy.callCount, 1, "detachPress method should be called once");

		// Cleanup
		oLightBoxA.destroy();
		oLightBoxB.destroy();
		oAttachPressSpy.restore();
		oDetachPressSpy.restore();
	});

	QUnit.test("detailBox and Image cloning of press event handler", function (assert) {
		// Arrange
		const oLightBox = new LightBox();

		this.oImage.setDetailBox(oLightBox);

		// Act - clone the Image
		const oImageClone = this.oImage.clone();

		// Assert
		assert.strictEqual(oImageClone.hasListeners("press"), true, "Press event listener is cloned");
		assert.notStrictEqual(this.oImage.mEventRegistry.press[0].oListener,
				oImageClone.mEventRegistry.press[0].oListener,
				"Press listener should not be a reference to the original listener");
	});

	QUnit.module("Associations");

	QUnit.test("ariaLabelledBy association is correctly rendered on the image DOM element", async function (assert) {
		// Arrange
		const oSampleText = new Text("sampleText", {
			text: "Sample text"
		});
		const oAnotherText = new Text("anotherText", {
			text: "Another text"
		});
		const oLabelledImage = new Image("labelledImage", {
			decorative: false,
			ariaLabelledBy: [oSampleText, oAnotherText]
		});

		// Act
		oLabelledImage.placeAt("qunit-fixture");
		await nextUIUpdate();

		// Assert
		assert.notOk(oLabelledImage.$().attr("aria-describedby"), "Image with only ariaLabelledBy association shouldn't have aria-describedby attribute");
		assert.strictEqual(oLabelledImage.$().attr("aria-labelledby"), "sampleText anotherText", "aria-labelledby association is set correctly");

		// Clean up
		oLabelledImage.destroy();
		oSampleText.destroy();
		oAnotherText.destroy();
	});

	QUnit.test("ariaDescribedBy association is correctly rendered on the image DOM element", async function (assert) {
		// Arrange
		const oSampleText = new Text("sampleText", {
			text: "Sample text"
		});
		const oAnotherText = new Text("anotherText", {
			text: "Another text"
		});
		const oDescribedImage = new Image("describedImage", {
			decorative: false,
			ariaDescribedBy: [oSampleText, oAnotherText]
		});

		// Act
		oDescribedImage.placeAt("qunit-fixture");
		await nextUIUpdate();

		// Assert
		assert.notOk(oDescribedImage.$().attr("aria-labelledby"), "Image with only ariaDescribedBy association shouldn't have aria-labelledby attribute");
		assert.strictEqual(oDescribedImage.$().attr("aria-describedby"), "sampleText anotherText", "aria-describedby association is set correctly");

		// Clean up
		oDescribedImage.destroy();
		oSampleText.destroy();
		oAnotherText.destroy();
	});

	QUnit.test("ariaDetails association is correctly rendered on the image DOM element", async function (assert) {
		// Arrange
		const oSampleText = new Text("sampleText", {
			text: "Sample text"
		});
		const oAnotherText = new Text("anotherText", {
			text: "Another text"
		});
		const oDescribedImage = new Image("describedImage", {
			decorative: false,
			ariaDetails: [oSampleText, oAnotherText]
		});

		// Act
		oDescribedImage.placeAt("qunit-fixture");
		await nextUIUpdate();

		// Assert
		assert.strictEqual(oDescribedImage.$().attr("aria-details"), "sampleText anotherText", "aria-details association is set correctly");

		// Clean up
		oDescribedImage.destroy();
		oSampleText.destroy();
		oAnotherText.destroy();
	});


	QUnit.module("Dimensions");

	QUnit.test("Default offset dimensions match width and height properties", async function(assert) {
		// Arrange
		const oImage = createImage();

		// Act
		oImage.placeAt("qunit-fixture");
		await nextUIUpdate();

		// Assert
		const oDomRef = document.getElementById(sControlId);
		assert.equal(oDomRef.offsetWidth, parseInt(oImage.getWidth()), "oImage.offsetWidth should equal " + parseInt(oImage.getWidth()));
		assert.equal(oDomRef.offsetHeight, parseInt(oImage.getHeight()), "oImage.offsetHeight should equal " + parseInt(oImage.getHeight()));

		// Clean up
		oImage.destroy();
	});

	QUnit.test("Original Width", async function(assert) {
		const done = assert.async();
		const oImage = createImage();

		// Act
		oImage.placeAt("qunit-fixture");
		await nextUIUpdate();

		// test original width
		oImage.setWidth("");
		oImage.setHeight("");
		await nextUIUpdate();

		// wait for the browser to recalculate natural image dimensions after clearing width/height
		setTimeout(function() {
			const oDomRef = window.document.getElementById(sControlId);
			assert.equal(oDomRef.offsetWidth, 150, "oImage.offsetWidth should equal 150");
			assert.equal(oDomRef.offsetHeight, 74, "oImage.offsetHeight should equal 74");

			// Clean up
			oImage.destroy();
			done();
		}, 100);
	});

	QUnit.test("Dimension Changes", async function(assert) {
		const done = assert.async();
		const oImage = createImage();

		// Act
		oImage.placeAt("qunit-fixture");
		await nextUIUpdate();

		// test changed dimensions
		oImage.setWidth("292px");
		oImage.setHeight("292px");
		await nextUIUpdate();

		// Assert
		// wait for the browser to apply the new dimension constraints on the image
		setTimeout(function() {
			const oDomRef = document.getElementById(sControlId);
			assert.equal(oDomRef.offsetWidth, 292, "oImage.offsetWidth should equal 292");
			assert.equal(oDomRef.offsetHeight, 292, "oImage.offsetHeight should equal 292");

			// Clean up
			oImage.destroy();
			done();
		}, 1000);
	});

	QUnit.test("Aspect Ratio", async function(assert) {
		const done = assert.async();
		const oImage = createImage();

		// Act
		oImage.placeAt("qunit-fixture");
		await nextUIUpdate();

		// test aspect ratio after changed dimensions
		oImage.setWidth("300px");
		oImage.setHeight("");
		await nextUIUpdate();

		// wait for the browser to recalculate the image height based on the new width and natural aspect ratio
		setTimeout(function() {
			const oDomRef = window.document.getElementById(sControlId);
			assert.equal(oDomRef.offsetWidth, 300, "oImage.offsetWidth should equal 300");
			assert.equal(oDomRef.offsetHeight, 148, "oImage.offsetHeight should equal 148");

			// Clean up
			oImage.destroy();
			done();
		}, 100);
	});


	QUnit.module("Density Aware");

	if (window.devicePixelRatio > 1) {
		QUnit.test("Density Aware default value is false and loads standard image", async function(assert) {
			const done = assert.async();
			const oImage = createImage({
				width: "",
				height: ""
			});

			// Act
			oImage.placeAt("qunit-fixture");
			await nextUIUpdate();

			// wait for the image to load and verify the non-density-aware src is used
			setTimeout(function() {
				assert.equal(jQuery("#" + sControlId).attr("src"), sSrc, "oImage is NOT density aware, it loads the default image.");

				const oDomRef = document.getElementById(sControlId);

				assert.equal(oDomRef.offsetWidth, 150, "density perfect image also has the default size");
				assert.equal(oDomRef.offsetHeight, 74, "density perfect image also has the default size");

				// Clean up
				oImage.destroy();
				done();
			}, 1000);
		});

		QUnit.test("Density Aware set to true loads high-resolution image on high-DPI display", async function(assert) {
			const done = assert.async();
			const oImage = createImage({
				densityAware: true,
				width: "",
				height: ""
			});

			// Act
			oImage.placeAt("qunit-fixture");
			await nextUIUpdate();

			// wait for the image to load and verify the density-perfect src is used
			setTimeout(function() {
				assert.equal(jQuery("#" + sControlId).attr("src"), sSrc2, "oImage is density aware, so it loads the density perfect image.");

				const oDomRef = document.getElementById(sControlId);

				assert.equal(oDomRef.offsetWidth, 150, "default image has the default size");
				assert.equal(oDomRef.offsetHeight, 74, "default image has the default size");

				// Clean up
				oImage.destroy();
				done();
			}, 1000);
		});

		QUnit.test("Loading default image when high resolution image not available", async function(assert) {
			const done = assert.async();
			const oImage = createImage({
				densityAware: true,
				src: sSrc3
			});

			// Act
			oImage.placeAt("qunit-fixture");
			await nextUIUpdate();

			// wait for image load to confirm fallback to default image when @2 version is missing
			setTimeout(function() {
				const oDomRef = document.getElementById(sControlId);
				assert.equal(jQuery("#" + sControlId).attr("src"), sSrc3, "default image should be loaded because the high resolution version isn't available");
				assert.equal(oDomRef.naturalWidth === 100, true, "default image loaded successfully");

				// Clean up
				oImage.destroy();
				done();
			}, 1000);
		});
	}

	QUnit.test("Image with density 1.5, source handling after rerendering", async function(assert) {
		const done = assert.async();
		this.stub(Image, "_currentDevicePixelRatio").value(1.5);

		const oImage = createImage({ densityAware: true });

		// Act
		oImage.placeAt("qunit-fixture");
		await nextUIUpdate();

		oImage.$().on("load", function() {
			assert.ok(oImage.$().attr("src").indexOf("@2") !== -1, "@2 version of image is taken");
			oImage.invalidate();
			nextUIUpdate.runSync()/*context not obviously suitable for an async function*/;
			oImage.$().on("load", function() {
				assert.ok(oImage.$().attr("src").indexOf("@2") !== -1, "@2 version of image is still taken");
				oImage.destroy();
				done();
			});
		});
	});


	QUnit.module("Src and ActiveSrc properties");

	if (window.devicePixelRatio === 1) {
		QUnit.test("Active Source changes to activeSrc when pressed and reverts on release", async function(assert) {
			const done = assert.async();
			const oImage = createImage({
				src: sSrcAction,
				activeSrc: sSrcActionPressed,
				alt: sAlt
			});

			// Act
			oImage.placeAt("qunit-fixture");
			await nextUIUpdate();

			const $oImage = jQuery("#" + sControlId);

			oImage.ontouchstart({
				targetTouches: [{}],
				preventDefault: function() {},
				srcControl: oImage
			});

			// wait for src switch animation after touch start
			setTimeout(function() {
				assert.equal($oImage.attr("src"), sSrcActionPressed);

				oImage.ontouchend({
					targetTouches: []
				});

				// wait for src revert animation after touch end
				setTimeout(function() {
					assert.equal($oImage.attr("src"), sSrcAction);
					// Clean up
					oImage.destroy();
					done();
				}, 50);
			}, 50);
		});
	}

	QUnit.test("Image with valid src fires load event and is visible", async function(assert) {
		const done = assert.async();

		const oLoadSpy = sinon.spy(function() {
				const $Image = oImage.$();
				assert.equal($Image.css("visibility"), "visible", "Image with valid src should be visible");
				assert.equal(oErrorSpy.callCount, 0, "Error handler isn't called");

				oImage.destroy();
				done();
			});
		const oErrorSpy = sinon.spy();

		const oImage = createImage({
			src: sSrcAction,
			load: oLoadSpy,
			error: oErrorSpy
		});

		// Act
		oImage.placeAt("qunit-fixture");
		await nextUIUpdate();
	});

	QUnit.test("Image with invalid src shows alt text and becomes visible again after valid src is set", async function(assert) {
		const done = assert.async();
		const oLoadSpy = sinon.spy(function() {
				const $oImage = jQuery("#" + sControlId);
				assert.equal($oImage.css("visibility"), "visible", "Image with valid src should be set back to visible");
				assert.equal(oErrorSpy.callCount, 1, "error handler isn't called again");

				oImage.destroy();
				done();
			});
		const oErrorSpy = sinon.spy(function() {
				assert.equal(oLoadSpy.callCount, 0 ,"load handler shouldn't be called");

				const $oImage = jQuery("#" + sControlId);
				assert.equal($oImage.css("visibility"), "visible", "Image with invalid src should be visible to show the alt text");

				oImage.setSrc(sSrcAction);
			});

		const oImage = createImage({
			decorative: false,
			alt: "invalid picture",
			src: "invalid_src.png",
			width: "48px",
			height: "48px",
			load: oLoadSpy,
			error: oErrorSpy
		});

		// Act
		oImage.placeAt("qunit-fixture");
		await nextUIUpdate();
	});

	QUnit.test("Image with invalid src, no alt text and decorative mode true adds sapMNoImg class", function(assert) {
		assert.expect(2);

		// Arrange
		const fnDone = assert.async();
		const oErrorSpy = sinon.spy(function() {
				// Assert
				assert.strictEqual(oErrorSpy.callCount, 1, "Error spy called once");
				assert.ok(oImage.$().hasClass("sapMNoImg"),
						"'sapMNoImg' class should not be removed from the control");

				// Cleanup
				oImage.destroy();
				fnDone();
			});
		const oImage = createImage({
				src: "invalid_src.png",
				error: oErrorSpy
			});

		// Act
		oImage.placeAt("qunit-fixture");
	});

	QUnit.module("Tabindex");

	QUnit.test("tabindex attribute is added when press handler is attached and removed when all handlers are detached", async function(assert) {
		// Arrange
		const fn1 = function() {};
		const fn2 = function() {};
		const oImage = createImage({
			press: fn1
		});

		// Act
		oImage.placeAt("qunit-fixture");
		await nextUIUpdate();

		// Assert
		const $Image = oImage.$();
		assert.equal($Image.attr("tabindex"), "0", "tabindex 0 is output");
		assert.equal($Image.attr("role"), "button", "role is set to button");

		oImage.attachPress(fn2);
		assert.equal($Image.attr("tabindex"), "0", "tabindex 0 is still output");
		assert.equal($Image.attr("role"), "button", "role is set to button");

		oImage.detachPress(fn1);
		assert.equal($Image.attr("tabindex"), "0", "tabindex 0 is still output");
		assert.equal($Image.attr("role"), "button", "role is set to button");

		oImage.detachPress(fn2);
		assert.strictEqual($Image.attr("tabindex"), undefined, "no tabindex is output");
		assert.equal($Image.attr("role"), "presentation", "role is set to presentation");

		oImage.attachPress(fn2);
		assert.equal($Image.attr("tabindex"), "0", "tabindex 0 is still output");
		assert.equal($Image.attr("role"), "button", "role is set to button");

		oImage.setDecorative(false);
		assert.equal($Image.attr("tabindex"), "0", "tabindex 0 is still output");
		assert.equal($Image.attr("role"), "button", "role is set to button");

		oImage.detachPress(fn2);
		assert.strictEqual($Image.attr("tabindex"), undefined, "no tabindex is output");
		assert.ok(!$Image.attr("role"), "role is removed");

		//Clean up
		oImage.destroy();
	});

	QUnit.module("Accessibility");

	QUnit.test("getAccessibilityInfo returns correct values for decorative and non-decorative images", function(assert) {
		// Arrange
		const oImage = new Image({alt: "Alt", tooltip: "Tooltip"});

		// Assert
		assert.ok(!!oImage.getAccessibilityInfo, "Image has a getAccessibilityInfo function");
		let oInfo = oImage.getAccessibilityInfo();
		assert.ok(!oInfo, "getAccessibilityInfo returns no info object in case of decorative images");
		oImage.setDecorative(false);
		oInfo = oImage.getAccessibilityInfo();
		assert.strictEqual(oInfo.role, "img", "AriaRole");
		assert.strictEqual(oInfo.type, Library.getResourceBundleFor("sap.m").getText("ACC_CTR_TYPE_IMAGE"), "Type");
		assert.strictEqual(oInfo.description, "Alt", "Description");
		assert.strictEqual(oInfo.focusable, false, "Focusable");
		assert.ok(oInfo.enabled === undefined || oInfo.enabled === null, "Enabled");
		assert.ok(oInfo.editable === undefined || oInfo.editable === null, "Editable");
		oImage.setAlt("");
		oImage.attachPress(function(){});
		oInfo = oImage.getAccessibilityInfo();
		assert.strictEqual(oInfo.role, "button", "AriaRole");
		assert.strictEqual(oInfo.type, Library.getResourceBundleFor("sap.m").getText("ACC_CTR_TYPE_BUTTON"), "Type");
		assert.strictEqual(oInfo.description, "Tooltip", "Description");
		assert.strictEqual(oInfo.focusable, true, "Focusable");
		oImage.destroy();
	});

	QUnit.test("aria-haspopup is rendered correctly when set on image with press handler", async function(assert) {
		// Arrange
		const oImage = new Image();

		oImage.placeAt("qunit-fixture");
		await nextUIUpdate();

		//Assert
		assert.equal(oImage.$().attr("aria-haspopup"), undefined, "Image should not have aria-haspopup by default");

		// Act
		oImage.setAriaHasPopup(AriaHasPopup.Dialog);
		await nextUIUpdate();

		//Assert
		assert.equal(oImage.$().attr("aria-haspopup"), "dialog", "Image should have correct aria-haspopup");

		//Cleanup
		oImage.destroy();
	});

	QUnit.module("Bug fixes");

	QUnit.test("Image src attribute updates correctly when detailBox is present", async function(assert) {
		// Arrange
		const oImage = createImage();
		const oLightBox = new LightBox();

		oImage.setDetailBox(oLightBox);
		oImage.placeAt("qunit-fixture");
		await nextUIUpdate();

		// Assert
		assert.ok(oImage._getDomImg().attr("src"), sSrc, "Image src attribute is properly set");

		// Act
		oImage.setSrc(sSrc3);

		// Assert
		assert.ok(oImage._getDomImg().attr("src"), sSrc3, "Image src attribute was properly changed");

		oImage.destroy();
	});

	QUnit.test("Image with valid src and default densityAware fires load event and is visible", async function(assert) {
		const done = assert.async();
		const oLoadSpy = sinon.spy(function() {
				const $Image = oImage.$();
				assert.equal($Image.css("visibility"), "visible", "Image with valid src should be visible");
				assert.equal(oErrorSpy.callCount, 0, "Error handler isn't called");

				oImage.destroy();
				done();
			});
		const oErrorSpy = sinon.spy();

		const oImage = new Image({
			src: sSrcAction,
			load: oLoadSpy,
			error: oErrorSpy
		});

		oImage.placeAt("qunit-fixture");
		await nextUIUpdate();
	});

	QUnit.test("Image with invalid src and src change under default densityAware becomes visible after valid src is set", async function(assert) {
		const done = assert.async();
		const oLoadSpy = sinon.spy(function() {
				const $Image = oImage.$();
				assert.equal($Image.css("visibility"), "visible", "Image with valid src should be set back to visible");
				assert.equal(oErrorSpy.callCount, 1, "error handler isn't called again");

				oImage.destroy();
				done();
			});
		const oErrorSpy = sinon.spy(function() {
				assert.equal(oLoadSpy.callCount, 0 ,"load handler shouldn't be called");
				const $Image = oImage.$();
				assert.equal($Image.css("visibility"), "visible", "Image with invalid src should be visible to show the alt text");

				oImage.setSrc(sSrcAction);
			});

		const oImage = new Image({
			decorative: false,
			alt: "invalid picture",
			src: "invalid_src.png",
			width: "48px",
			height: "48px",
			load: oLoadSpy,
			error: oErrorSpy
		});

		oImage.placeAt("qunit-fixture");
		await nextUIUpdate();
	});

	QUnit.test("Image with density 1.5, source handling after rerendering", async function(assert) {
		const done = assert.async();
		const oLoadSpy = this.spy(function() {
				assert.equal(oErrorSpy.callCount, 0, "error event handler shouldn't be called");
			});
		const oErrorSpy = sinon.spy();

		this.stub(Image, "_currentDevicePixelRatio").value(1.5);

		const oImage = new Image({
			src: sSrc,
			load: oLoadSpy,
			densityAware: true
		});

		oImage.placeAt("qunit-fixture");
		await nextUIUpdate();
		oImage.$().on("load", function() {
			assert.ok(oImage.$().attr("src").indexOf("@2") !== -1, "@2 version of image is taken");
			assert.equal(oLoadSpy.callCount, 1, "load event handler is called");
			oImage.invalidate();
			nextUIUpdate.runSync()/*context not obviously suitable for an async function*/;
			oImage.$().on("load", function() {
				assert.ok(oImage.$().attr("src").indexOf("@2") !== -1, "@2 version of image is still taken");
				assert.equal(oLoadSpy.callCount, 2, "load event handler is called again");
				oImage.destroy();
				done();
			});
		});
	});

	QUnit.test("Invalid image src fires error handler once when detailBox is present", function(assert) {
		// Arrange
		const fnDone = assert.async();
		const oErrorSpy = sinon.spy(function() {
				// Assert
				assert.strictEqual(oErrorSpy.callCount, 1, "Error spy called once");

				// Cleanup
				oImage.destroy();
				fnDone();
			});
		const oImage = createImage({
				src: "invalid_src.png",
				error: oErrorSpy
			});

		// Act
		oImage.setDetailBox(new LightBox());
		oImage.placeAt("qunit-fixture");
	});

	QUnit.test("onsapspace event should be prevented - SPACE", function(assert) {
		//setup
		const oImage = createImage({
				src: sSrc
			});
		const oEvent = {
				which: KeyCodes.SPACE,
				preventDefault: function () {}
			};
		const oSpy = this.spy(oEvent, "preventDefault");

		//act
		oImage.onsapspace(oEvent);

		//assert
		assert.ok(oSpy.calledOnce, "preventDefault is called on SPACE key");

		oImage.destroy();
	});

	// This unit test is meant to cover the current logic of
	// Image control where it fires load event after each
	// re-rendering cycle
	QUnit.test("Load event is fired repeatedly after each rerender cycle", async function(assert) {
		const done = assert.async();
		let callCount = 0;
		const callLimit = 10;

		assert.expect(1);

		//setup
		const oImage = createImage({
				src: sSrc,
				load: function () {
					if (callCount < callLimit) {
						callCount++;
						oImage.invalidate();
					} else {
						assert.ok(true, 'Load after rerendering called ' + callCount + ' times');
						done();
						oImage.destroy();
					}
				}
			});

		oImage.placeAt("qunit-fixture");
		await nextUIUpdate();
	});

	// This test is especially created to cover FF problem loading huge size SVG images,
	// caused by wrongly reading naturalWidth property as '0'
	QUnit.test("SVG Load event is fired repeatedly after each rerender cycle", async function(assert) {
		const done = assert.async();
		let callCount = 0;
		const callLimit = 10;

		assert.expect(1);

		//setup
		const oImage = createSVGImage({
				src: sSrc,
				load: function () {
					if (callCount < callLimit) {
						callCount++;
						oImage.invalidate();
					} else {
						assert.ok(true, 'Load after rerendering called ' + callCount + ' times');
						done();
						oImage.destroy();
					}
				}
			});

		oImage.placeAt("qunit-fixture");
		await nextUIUpdate();
	});

	QUnit.module("Attribute");

	QUnit.test("Lazy loading attribute is set on image DOM element", async function(assert) {
		// Arrange
		const oImage = createImage({
			lazyLoading: true
		});

		// Act
		oImage.placeAt("qunit-fixture");
		await nextUIUpdate();

		// Assert
		assert.equal(document.getElementById(sControlId).getAttribute("loading"), "lazy", "loading attribute should be lazy");

		// Clean up
		oImage.destroy();
	});

	QUnit.module("Load event");

	QUnit.test("Load event is fired with lazyLoading set to true after image scrolls into view", async function(assert) {
		// Arrange
		const oBox = new VBox({
			height: "3000px"
		});
		const oImage = createImage({
			lazyLoading: true
		});
		const oPage = new Page({
			content: [oBox, oImage]
		});
		const done = assert.async();

		oPage.placeAt("content");
		await nextUIUpdate();

		const oLoadSpy = sinon.spy(oImage, "fireLoad");
		document.getElementById("content").style.height = "500px";

		// Assert
		assert.strictEqual(oLoadSpy.callCount, 0, "load event isn`t fired");

		// Act
		oPage.scrollToElement(oImage);

		oImage.attachLoad(function(){
			//Assert
			assert.strictEqual(oLoadSpy.callCount, 1, "load event is fired");
			done();

		// Clean up
		oPage.destroy();
	});


	});

});
