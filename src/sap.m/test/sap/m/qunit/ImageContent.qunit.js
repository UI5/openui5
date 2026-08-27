/*global QUnit, sinon */
sap.ui.define([
	"sap/m/ImageContent",
	"sap/ui/test/utils/nextUIUpdate",
	"sap/ui/events/KeyCodes",
	"sap/ui/qunit/QUnitUtils"
], function(ImageContent, nextUIUpdate, KeyCodes, qutils) {
	"use strict";


	var IMAGE_PATH = "test-resources/sap/m/images/";

	QUnit.module("Rendering test - sap.m.ImageContent", {
		beforeEach : async function() {
			this.oImageContent = new ImageContent("img-cnt", {
				src: IMAGE_PATH + "headerImg1.png",
				description: "image descriptions ...",
				press: function() {}
			});
			this.oImageContent.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach : function() {
			this.oImageContent.destroy();
			this.oImageContent = null;
		}
	});

	QUnit.test("ImageContent and image rendered", function(assert) {
		assert.ok(document.getElementById("img-cnt"), "ImageContent was rendered successfully");
		assert.ok(document.getElementById("img-cnt-icon-image"), "Image was rendered successfully");
	});

	QUnit.test("Icon rendered", async function(assert) {
		//Arrange
		var oSpy = sinon.spy(this.oImageContent, "_setPointerOnImage");
		//Act
		this.oImageContent.setSrc("sap-icon://travel-expense");
		await nextUIUpdate();
		//Assert
		assert.ok(document.getElementById("img-cnt-icon-image"), "Icon was rendered successfully");
		assert.equal(oSpy.callCount, 1, "During rendering _setPointerOnImage has been called");
	});

	QUnit.module("Tooltip test", {
		beforeEach : async function() {
			this.oImageContent = new ImageContent("img-cnt", {
				src: IMAGE_PATH + "headerImg1.png",
				description: "        image descriptions        ",
				press: function() {}
			});
			this.oImageContent.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach : function() {
			this.oImageContent.destroy();
			this.oImageContent = null;
		}
	});

	QUnit.test("Tooltip generated", function(assert) {
		var sTooltip = this.oImageContent.getTooltip();
		assert.equal(sTooltip, "image descriptions", "The tooltip generated correctly");
	});

	QUnit.test("Inner control alt property is empty for interactive images", function(assert) {
		var sAlt = this.oImageContent.getAggregation("_content").getAlt();
		assert.equal(sAlt, "", "Alt property of inner icon is empty because outer control has role=button with aria-label");
	});

	QUnit.test("getAltText returns description even when inner control is decorative", function(assert) {
		var sAltTest = this.oImageContent.getAltText();
		assert.equal(sAltTest, "        image descriptions        ", "getAltText returns description for semantic meaning");
	});

	QUnit.test("In case no description is set, getAltText method should return the default", async function(assert) {
		this.oImageContent.setDescription("");
		await nextUIUpdate();
		var sAlt = this.oImageContent.getAggregation("_content").getAlt();
		assert.deepEqual(sAlt, "", "Alt property of inner control is empty");
	});

	QUnit.test("In case no description is set, getAltText method should return the default of the inner control", async function(assert) {
		this.oImageContent.setDescription("");
		this.oImageContent.setSrc("sap-icon://travel-expense");
		await nextUIUpdate();
		var sAltText = this.oImageContent.getAltText();
		assert.equal(sAltText, "", "Inner control's text should be ignored for decorative images.");
	});

	QUnit.module("Event tests", {
		beforeEach : async function() {
			this.ftnPressHandler = function() {
			};
			this.ftnHoverHandler = function() {
			};
			this.oImageContent = new ImageContent("img-cnt", {
				src: IMAGE_PATH + "headerImg1.png"
			}).placeAt("qunit-fixture");
			await nextUIUpdate();
			sinon.spy(this, "ftnPressHandler");
		},
		afterEach : function() {
			this.ftnPressHandler.restore();
			this.oImageContent.destroy();
			this.oImageContent = null;
		}
	});

	QUnit.test("Tap test", function(assert) {
		this.oImageContent.attachEvent("press", this.ftnPressHandler);
		qutils.triggerEvent("tap", this.oImageContent.getId());
		assert.ok(this.ftnPressHandler.calledOnce, "Press event is triggered");
	});

	QUnit.test("Enter test", function(assert) {
		this.oImageContent.attachEvent("press", this.ftnPressHandler);
		qutils.triggerKeydown(this.oImageContent.getId(), KeyCodes.ENTER);
		assert.ok(this.ftnPressHandler.calledOnce, "Press event is triggered");
	});

	QUnit.test("Space test", function(assert) {
		this.oImageContent.attachEvent("press", this.ftnPressHandler);
		qutils.triggerKeydown(this.oImageContent.getId(), KeyCodes.SPACE);
		assert.ok(this.ftnPressHandler.calledOnce, "Press event is triggered");
	});

	QUnit.test("Attach not available events", function(assert) {
		//Arrange
		//Act
		this.oImageContent.attachEvent("hover", this.ftnHoverHandler, this.oImageContent);
		//Assert
		var oDomRef = this.oImageContent.getDomRef();
		assert.notOk(oDomRef.getAttribute("tabindex"), "Attribute has not been added successfully because hover handler was not available");
		assert.notOk(oDomRef.classList.contains("sapMPointer"), "Class has not been added successfully because hover handler was not available");
	});

	QUnit.test("Attach events", function(assert) {
		//Arrange
		//Act
		this.oImageContent.attachEvent("press", this.ftnPressHandler, this.oImageContent);
		//Assert
		var oDomRef = this.oImageContent.getDomRef();
		assert.equal(oDomRef.getAttribute("tabindex"), "0", "Attribute has been added successfully because press handler was available");
		assert.ok(oDomRef.classList.contains("sapMPointer"), "Class has been added successfully because press handler was available");
		assert.ok(this.oImageContent.getAggregation("_content").hasStyleClass("sapMPointer"), "Class has been successfully added to the inner Image");
	});

	QUnit.test("Detach events", function(assert) {
		//Arrange
		this.oImageContent.attachEvent("press", this.ftnPressHandler, this.oImageContent);
		//Act
		this.oImageContent.detachEvent("press", this.ftnPressHandler, this.oImageContent);
		//Assert
		var oDomRef = this.oImageContent.getDomRef();
		assert.notOk(oDomRef.getAttribute("tabindex"), "Attribute has been removed successfully");
		assert.notOk(oDomRef.classList.contains("sapMPointer"), "Class has been removed successfully");
		assert.notOk(this.oImageContent.getAggregation("_content").hasStyleClass("sapMPointer"), "Class has been successfully removed from the inner Image");
	});

	QUnit.module("Accessibility test - aria-label", {
		beforeEach : async function() {
			this.oImageContent = new ImageContent("img-cnt-aria", {
				src: IMAGE_PATH + "headerImg1.png",
				description: "image descriptions"
			});
			this.oImageContent.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach : function() {
			this.oImageContent.destroy();
			this.oImageContent = null;
		}
	});

	QUnit.test("Non-interactive image should have alt text from description", function(assert) {
		//Arrange
		var oInnerControl = this.oImageContent.getAggregation("_content");
		//Assert
		assert.notOk(oInnerControl.getDecorative(), "Inner control is NOT decorative for non-interactive images");
		assert.equal(oInnerControl.getAlt(), "image descriptions", "Inner control has alt text from description");
	});

	QUnit.test("Non-interactive icon should have alt text from description", async function(assert) {
		//Arrange
		this.oImageContent.setSrc("sap-icon://travel-expense");
		await nextUIUpdate();
		var oInnerControl = this.oImageContent.getAggregation("_content");
		//Assert
		assert.notOk(oInnerControl.getDecorative(), "Inner control is NOT decorative for non-interactive icons");
		assert.equal(oInnerControl.getAlt(), "image descriptions", "Inner control has alt text from description");
	});

	QUnit.test("Non-interactive icon should update alt text when description changes", async function(assert) {
		//Arrange
		this.oImageContent.setDescription("Important travel icon");
		this.oImageContent.setSrc("sap-icon://travel-expense");
		await nextUIUpdate();
		var oInnerControl = this.oImageContent.getAggregation("_content");
		//Assert
		assert.notOk(oInnerControl.getDecorative(), "Inner control is NOT decorative for non-interactive icons");
		assert.equal(oInnerControl.getAlt(), "Important travel icon", "Inner control has updated alt text from description");
		assert.equal(this.oImageContent.getTooltip(), "Important travel icon", "Description is mapped to tooltip on ImageContent");
	});

	QUnit.module("Accessibility test - interactive button", {
		beforeEach : async function() {
			this.ftnPressHandler = function() {};
			this.oImageContent = new ImageContent("img-cnt-btn", {
				src: "sap-icon://travel-expense",
				description: "Book a flight"
			});
			this.oImageContent.attachEvent("press", this.ftnPressHandler);
			this.oImageContent.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach : function() {
			this.oImageContent.destroy();
			this.oImageContent = null;
		}
	});

	QUnit.test("Outer container should have role='button' when interactive", function(assert) {
		//Arrange
		var oDomRef = this.oImageContent.getDomRef();
		//Assert
		assert.equal(oDomRef.getAttribute("role"), "button", "Outer div has role='button'");
		assert.equal(oDomRef.getAttribute("tabindex"), "0", "Outer div is focusable");
		assert.ok(oDomRef.classList.contains("sapMPointer"), "Outer div has pointer cursor class");
	});

	QUnit.test("Outer container should have aria-label from description when interactive", function(assert) {
		//Arrange
		var oDomRef = this.oImageContent.getDomRef();
		//Assert
		assert.equal(oDomRef.getAttribute("aria-label"), "Book a flight", "Outer div has aria-label from description");
		assert.equal(oDomRef.getAttribute("role"), "button", "Outer div has role='button'");
	});

	QUnit.test("Inner icon should remain decorative even when outer container is interactive", function(assert) {
		//Arrange
		var oInnerControl = this.oImageContent.getAggregation("_content");
		var oInnerDomRef = oInnerControl.getDomRef();
		//Assert
		assert.notOk(oInnerDomRef.getAttribute("aria-label"), "Inner icon does not have aria-label");
		assert.ok(oInnerControl.getDecorative(), "Inner icon is marked as decorative");
		assert.equal(oInnerControl.getAlt(), "", "Inner icon has empty alt text");
	});

	QUnit.test("Outer container should not have aria-label if no description is provided", async function(assert) {
		//Arrange
		this.oImageContent.setDescription("");
		await nextUIUpdate();
		var oDomRef = this.oImageContent.getDomRef();
		//Assert
		assert.notOk(oDomRef.getAttribute("aria-label"), "Outer div has no aria-label when description is empty");
		assert.equal(oDomRef.getAttribute("role"), "button", "Outer div still has role='button'");
	});

	QUnit.test("Non-interactive ImageContent should not have role or aria-label", async function(assert) {
		//Arrange
		var oNonInteractive = new ImageContent({
			src: "sap-icon://home",
			description: "Home icon"
		});
		oNonInteractive.placeAt("qunit-fixture");
		await nextUIUpdate();
		var oDomRef = oNonInteractive.getDomRef();
		//Assert
		assert.notOk(oDomRef.getAttribute("role"), "Non-interactive outer div has no role");
		assert.notOk(oDomRef.getAttribute("aria-label"), "Non-interactive outer div has no aria-label");
		assert.notOk(oDomRef.getAttribute("tabindex"), "Non-interactive outer div is not focusable");
		//Cleanup
		oNonInteractive.destroy();
	});

	QUnit.module("Tooltip persistence test", {
		beforeEach : async function() {
			this.oImageContent = new ImageContent("img-cnt-tooltip", {
				src: IMAGE_PATH + "headerImg1.png",
				description: "Important image"
			});
			this.oImageContent.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach : function() {
			this.oImageContent.destroy();
			this.oImageContent = null;
		}
	});

	QUnit.test("Tooltip should be present for non-interactive ImageContent with description", function(assert) {
		//Arrange
		var oDomRef = this.oImageContent.getDomRef();
		var sTooltip = this.oImageContent.getTooltip();
		//Assert
		assert.equal(sTooltip, "Important image", "Tooltip is set from description");
		assert.equal(oDomRef.getAttribute("title"), "Important image", "Title attribute is present in DOM");
	});

	QUnit.test("Tooltip should remain present when press handler is added", function(assert) {
		//Arrange
		var ftnPressHandler = function() {};
		//Act
		this.oImageContent.attachEvent("press", ftnPressHandler);
		//Assert
		var sTooltip = this.oImageContent.getTooltip();
		var oDomRef = this.oImageContent.getDomRef();
		assert.equal(sTooltip, "Important image", "Tooltip remains set after adding press handler");
		assert.equal(oDomRef.getAttribute("title"), "Important image", "Title attribute remains in DOM");
	});

	QUnit.test("Tooltip should be removed when description is cleared", async function(assert) {
		//Act
		this.oImageContent.setDescription("");
		await nextUIUpdate();
		//Assert
		var sTooltip = this.oImageContent.getTooltip();
		assert.notOk(sTooltip, "Tooltip is removed when description is cleared");
	});

	QUnit.module("Dynamic description updates", {
		beforeEach : async function() {
			this.ftnPressHandler = function() {};
			this.oImageContent = new ImageContent("img-cnt-dynamic", {
				src: "sap-icon://travel-expense",
				description: "Book a flight"
			});
			this.oImageContent.attachEvent("press", this.ftnPressHandler);
			this.oImageContent.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach : function() {
			this.oImageContent.destroy();
			this.oImageContent = null;
		}
	});

	QUnit.test("Dynamic description update should update aria-label for interactive ImageContent", function(assert) {
		//Arrange
		var oDomRef = this.oImageContent.getDomRef();
		assert.equal(oDomRef.getAttribute("aria-label"), "Book a flight", "Initial aria-label is correct");
		//Act
		this.oImageContent.setDescription("Cancel a flight");
		//Assert
		assert.equal(oDomRef.getAttribute("aria-label"), "Cancel a flight", "aria-label updated dynamically without re-render");
		assert.equal(this.oImageContent.getDescription(), "Cancel a flight", "Description property updated");
	});

	QUnit.test("Dynamic description update should update tooltip", async function(assert) {
		//Arrange
		assert.equal(this.oImageContent.getTooltip(), "Book a flight", "Initial tooltip is correct");
		//Act
		this.oImageContent.setDescription("Cancel a flight");
		await nextUIUpdate();
		//Assert
		assert.equal(this.oImageContent.getTooltip(), "Cancel a flight", "Tooltip updated after re-render");
	});

	QUnit.test("Dynamic description removal should remove aria-label for interactive ImageContent", function(assert) {
		//Arrange
		var oDomRef = this.oImageContent.getDomRef();
		assert.equal(oDomRef.getAttribute("aria-label"), "Book a flight", "Initial aria-label is correct");
		//Act
		this.oImageContent.setDescription("");
		//Assert
		assert.notOk(oDomRef.getAttribute("aria-label"), "aria-label removed dynamically");
	});

	QUnit.test("getAltText should return description for decorative images", function(assert) {
		//Assert
		var sAltText = this.oImageContent.getAltText();
		assert.equal(sAltText, "Book a flight", "getAltText returns description when inner control is decorative");
	});

	QUnit.test("getAltText should update when description changes", function(assert) {
		//Arrange
		assert.equal(this.oImageContent.getAltText(), "Book a flight", "Initial alt text is correct");
		//Act
		this.oImageContent.setDescription("Cancel a flight");
		//Assert
		assert.equal(this.oImageContent.getAltText(), "Cancel a flight", "getAltText returns updated description");
	});

	QUnit.test("getAltText should return empty string when description is removed", function(assert) {
		//Act
		this.oImageContent.setDescription("");
		//Assert
		assert.equal(this.oImageContent.getAltText(), "", "getAltText returns empty string when description is empty");
	});

});