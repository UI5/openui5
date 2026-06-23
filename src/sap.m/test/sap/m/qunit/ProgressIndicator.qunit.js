/*global QUnit, sinon */
sap.ui.define([
	"sap/ui/core/Lib",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/m/ProgressIndicator",
	"sap/m/Page",
	"sap/ui/thirdparty/jquery",
	"sap/ui/core/library",
	"sap/ui/core/ControlBehavior",
	"sap/ui/test/utils/nextUIUpdate"
], function(Library, createAndAppendDiv, ProgressIndicator, Page, jQuery, coreLibrary, ControlBehavior, nextUIUpdate) {
	"use strict";

	// shortcut for sap.ui.core.ValueState
	const ValueState = coreLibrary.ValueState;

	const POPOVER_WAIT_TIME = 500;

	createAndAppendDiv("content");


	QUnit.module("ProgressIndicator - General", {
		beforeEach: function() {
			this.oProgInd = new ProgressIndicator("pi1", {
				width : "50%",
				percentValue : 30,
				displayValue : "display 30%"
			});
			this.oProgInd.placeAt("content");

			this.oProgInd2 = new ProgressIndicator("pi2", {
				width : "50%",
				percentValue : 70,
				displayValue : "display 10%",
				showValue : false
			});
			this.oProgInd2.placeAt("content");

			this.oProgInd3 = new ProgressIndicator("pi3", {
				width : "50%",
				percentValue : 30,
				displayValue : "display 30 %",
				textDirection: "RTL"
			});
			this.oProgInd3.placeAt("content");

			this.oProgInd4 = new ProgressIndicator("pi4", {
				width : "50%",
				percentValue : 30,
				displayValue : "display 30 %",
				textDirection: "LTR"
			});
			this.oProgInd4.placeAt("content");

			nextUIUpdate.runSync()/*fake timer is used in module*/;
		},
		afterEach: function() {
			this.oProgInd.destroy();
			this.oProgInd2.destroy();
			this.oProgInd3.destroy();
			this.oProgInd4.destroy();
		}
	});

	QUnit.test("basic rendering should reflect control width and remaining bar", function(assert) {
		const oDomRefPI = document.getElementById("pi1");
		assert.equal(oDomRefPI.style.width, "50%", "control width should be the same");
		const oDomRefPIRemainingBar = document.getElementById("pi1" + "-remainingBar");
		assert.ok(oDomRefPIRemainingBar, "the remaining bar  is rendered");
	});

	QUnit.test("tooltip should be rendered in the DOM", function(assert) {
		let sTooltipText = "Some tooltip";
		const oProgressIndicator = new ProgressIndicator({
			percentValue: 50,
			width: "100%",
			tooltip: sTooltipText
		});

		oProgressIndicator.placeAt("qunit-fixture");
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		assert.strictEqual(oProgressIndicator.$().attr("title"), sTooltipText, "Tooltip is in the DOM");

		sTooltipText = undefined;
		oProgressIndicator.destroy();
	});

	QUnit.test("percentValue greater than half should add the sapMPIValueGreaterHalf CSS class", function(assert) {
		assert.equal(jQuery("#pi1").hasClass("sapMPIValueGreaterHalf"), false, "css-class sapMPIValueGreaterHalf should not be set");
		assert.equal(jQuery("#pi2").hasClass("sapMPIValueGreaterHalf"), true, "css-class sapMPIValueGreaterHalf should be set");
	});

	QUnit.test("showValue false should hide the text and add sapMPINoValue class", function(assert) {
		assert.equal(jQuery("#pi1").hasClass("sapMPIValueGreaterHalf"), false, "css-class sapMPIValueGreaterHalf should not be set");
		assert.equal(jQuery("#pi2").hasClass("sapMPIValueGreaterHalf"), true, "css-class sapMPIValueGreaterHalf should be set");

		const sDomRefPIText2Left = document.getElementById("pi2-textLeft").firstChild;
		const sDomRefPIText2Right = document.getElementById("pi2-textRight").firstChild;
		assert.equal(sDomRefPIText2Left, null, "textValue should not be shown");
		assert.equal(sDomRefPIText2Right, null, "textValue should not be shown");

		assert.strictEqual(this.oProgInd.$().hasClass("sapMPINoValue"), false, "ProgressIndicator with showValue=true does not have class sapMPINoValue");
		assert.strictEqual(this.oProgInd2.$().hasClass("sapMPINoValue"), true, "ProgressIndicator with showValue=false has class sapMPINoValue");
	});

	QUnit.test("setPercentValue should apply sapMPIValueMin and sapMPIValueMax classes at boundary values", function(assert) {
		const oProgIndicator = new ProgressIndicator({
			percentValue: 10
		});

		oProgIndicator.placeAt("qunit-fixture");
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		oProgIndicator.setPercentValue(0);
		assert.strictEqual(oProgIndicator.$().hasClass("sapMPIValueMin"), true, "sapMPIValueMin class added");
		assert.strictEqual(oProgIndicator.$().hasClass("sapMPIValueMax"), false, "sapMPIValueMax not added");

		oProgIndicator.setPercentValue(100);
		assert.strictEqual(oProgIndicator.$().hasClass("sapMPIValueMin"), false, "sapMPIValueMin removed");
		assert.strictEqual(oProgIndicator.$().hasClass("sapMPIValueMax"), true, "sapMPIValueMax added");

		oProgIndicator.destroy();
	});

	QUnit.test("setPercentValue should clamp values greater than 100 to the maximum", function(assert) {
		const iPercentTest = 120;
		this.oProgInd.setPercentValue(iPercentTest);
		const iPercentAfter = this.oProgInd.getPercentValue();
		assert.equal(iPercentAfter, 100, "the value should be set to the mximum one");
	});

	QUnit.test("setPercentValue should clamp negative values to the minimum", function(assert) {
		const iPercentTest = -20;
		this.oProgInd.setPercentValue(iPercentTest);
		const iPercentAfter = this.oProgInd.getPercentValue();
		assert.equal(iPercentAfter, 0, "the value should be set to the minimum one");
	});


	QUnit.test("setPercentValue should apply the correct CSS class for each value range", function(assert) {
		const oProgressIndicator = new ProgressIndicator({
			percentValue: 0
		});
		const aTestCases = [
			{value: 100, expectedClass: "sapMPIValueMax"},
			{value: 99, expectedClass: "sapMPIValueNormal"},
			{value: 99.9952, expectedClass: "sapMPIValueNormal"},
			{value: 70, expectedClass: "sapMPIValueNormal"},
			{value: 1, expectedClass: "sapMPIValueNormal"},
			{value: 0.1, expectedClass: "sapMPIValueNormal"},
			{value: 0.255, expectedClass: "sapMPIValueNormal"},
			{value: 101, expectedClass: "sapMPIValueMax"},
			{value: 0, expectedClass: "sapMPIValueMin"},
			{value: -1, expectedClass: "sapMPIValueMin"},
			{value: null, expectedClass: "sapMPIValueMin"}, // null is normalized to 0 by the framework
			{value: undefined, expectedClass: "sapMPIValueMin"} // null is normalized to 0 by the framework
		];
		oProgressIndicator.placeAt("qunit-fixture");
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		const $progressIndicator = oProgressIndicator.$();
		const fnTestForClassesToValuesMapping = function (fPercentValueToSet, sExpectedClass){
			oProgressIndicator.setPercentValue(fPercentValueToSet);
			assert.ok($progressIndicator.hasClass(sExpectedClass),
					"the progress indicator has the correct class: " + sExpectedClass + " for " + fPercentValueToSet + "%");
		};

		aTestCases.forEach(function (oTestCase){
			fnTestForClassesToValuesMapping(oTestCase.value, oTestCase.expectedClass);
		});

		oProgressIndicator.destroy();
	});

	QUnit.test("setPercentValue should handle non-numeric string inputs by casting or ignoring them", function(assert) {
		const oProgressIndicator = new ProgressIndicator({percentValue: 0});

		oProgressIndicator.placeAt("qunit-fixture");
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		oProgressIndicator.setPercentValue("11");
		assert.strictEqual(oProgressIndicator.getPercentValue(), 11, "Percent value should be cast correctly to the number 11.");

		oProgressIndicator.setPercentValue("110");
		assert.strictEqual(oProgressIndicator.getPercentValue(), 100, "Value greater than 100 should be set to 100.");

		oProgressIndicator.setPercentValue("-10");
		assert.strictEqual(oProgressIndicator.getPercentValue(), 0, "Value lower than 0 should be set to 0.");

		oProgressIndicator.setPercentValue(50);
		oProgressIndicator.setPercentValue("invalid");
		assert.strictEqual(oProgressIndicator.getPercentValue(), 50, "Invalid value should not be set. Previous valid value should be maintained.");

		oProgressIndicator.destroy();
	});

	QUnit.test("setPercentValue when not rendered should apply correctly after re-adding to parent aggregation", function(assert) {
		// Arrange
		const oProgressIndicator = new ProgressIndicator({
			percentValue: 1
		});
		const oPage = new Page({
			content: [ oProgressIndicator ]
		});

		oPage.placeAt("qunit-fixture");
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// Act - set percentValue to 0 and remove it from parent's aggregation
		oProgressIndicator.setPercentValue(0);
		oPage.removeContent(oProgressIndicator);
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// Act - set percentValue to 5 and add it again to the parent's aggregation
		oProgressIndicator.setPercentValue(5);
		oPage.addContent(oProgressIndicator);
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// Assert
		assert.notOk(oProgressIndicator.$().hasClass("sapMPIValueMin"),
			"ProgressIndicator does not have 'sapMPIValueMin' class, when percentValue is greater than 0");

		// Clean up
		oPage.destroy();
	});


	QUnit.test("text should not be rendered when displayValue is not set", function(assert) {
		const oProgIndicator = new ProgressIndicator({
			percentValue: 50
		});

		oProgIndicator.placeAt("qunit-fixture");
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		assert.strictEqual(oProgIndicator.$().find(".sapMPITextLeft").text(), "", "no text is rendered");
		assert.strictEqual(oProgIndicator.$().find(".sapMPITextRight").text(), "", "no text is rendered");

		oProgIndicator.destroy();
	});

	QUnit.test("Display-Only progress indicator should add and remove the sapMPIDisplayOnly CSS class", function(assert) {
		const oProgIndicator = new ProgressIndicator({
			displayOnly: true
		});

		oProgIndicator.placeAt("qunit-fixture");
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		assert.strictEqual(oProgIndicator.$().hasClass("sapMPIDisplayOnly"), true, "should have class 'sapMPIDisplayOnly'");

		oProgIndicator.setDisplayOnly(false);
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		assert.strictEqual(oProgIndicator.$().hasClass("sapMPIDisplayOnly"), false, "class 'sapMPIDisplayOnly' should be removed");

		oProgIndicator.destroy();
	});

	QUnit.test("ARIA attributes should be present with correct values after rendering", function(assert) {
		const oProgIndicator = new ProgressIndicator({
			percentValue: 50
		});

		oProgIndicator.placeAt("qunit-fixture");
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		assert.strictEqual(parseInt(oProgIndicator.$().attr("aria-valuemin")), 0, "aria-valuemin should equal 0");
		assert.strictEqual(parseInt(oProgIndicator.$().attr("aria-valuenow")), 50, "aria-valuenow should equal 50");
		assert.strictEqual(parseInt(oProgIndicator.$().attr("aria-valuemax")), 100, "aria-valuemax should equal 100");
		assert.strictEqual(oProgIndicator.$().attr("aria-valuetext"), "50%", "aria-valuetext should be 50%");

		oProgIndicator.destroy();
	});

	QUnit.test("ARIA attributes should update in the DOM when percent value changes", function(assert) {
		const oProgIndicator = new ProgressIndicator({
			percentValue: 50
		});

		oProgIndicator.placeAt("qunit-fixture");
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		assert.strictEqual(parseInt(oProgIndicator.$().attr("aria-valuenow")), 50, "aria-valuenow should equal 50");
		assert.strictEqual(oProgIndicator.$().attr("aria-valuetext"), "50%", "aria-valuetext should be 50%");

		oProgIndicator.setPercentValue(15);
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		assert.strictEqual(parseInt(oProgIndicator.$().attr("aria-valuenow")), 15, "aria-valuenow should equal 15");
		assert.strictEqual(oProgIndicator.$().attr("aria-valuetext"), "15%", "aria-valuetext should be 15%");

		oProgIndicator.setPercentValue(95);
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		assert.strictEqual(parseInt(oProgIndicator.$().attr("aria-valuenow")), 95, "aria-valuenow should equal 95");
		assert.strictEqual(oProgIndicator.$().attr("aria-valuetext"), "95%", "aria-valuetext should be 95%");

		oProgIndicator.destroy();
	});

	QUnit.test("ARIA valuetext should update in the DOM when display value changes", function(assert) {
		const oProgIndicator = new ProgressIndicator({
			percentValue: 50,
			displayValue: "50/100"
		});

		oProgIndicator.placeAt("qunit-fixture");
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		assert.strictEqual(oProgIndicator.$().attr("aria-valuetext"), "50/100", "aria-valuetext should be '50/100'");

		oProgIndicator.setDisplayValue("65/100");
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		assert.strictEqual(oProgIndicator.$().attr("aria-valuetext"), "65/100", "aria-valuetext should be '65/100'");

		oProgIndicator.destroy();
	});

	QUnit.test("ARIA valuetext should contain information about the state", function(assert) {
		const oProgIndicator = new ProgressIndicator({
			percentValue: 50,
			state: ValueState.Success
		});

		oProgIndicator.placeAt("qunit-fixture");
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		let stateText = oProgIndicator._getStateText();
		assert.strictEqual(oProgIndicator.$().attr("aria-valuetext"), "50% " + stateText, "aria-valuetext should be '50% " + stateText + "'");

		oProgIndicator.setState(ValueState.Error);
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		stateText = oProgIndicator._getStateText();
		assert.strictEqual(oProgIndicator.$().attr("aria-valuetext"), "50% " + stateText, "aria-valuetext should be '50% " + stateText + "'");

		oProgIndicator.setState(ValueState.Warning);
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		stateText = oProgIndicator._getStateText();
		assert.strictEqual(oProgIndicator.$().attr("aria-valuetext"), "50% " + stateText, "aria-valuetext should be '50% " + stateText + "'");

		oProgIndicator.setState(ValueState.Information);
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		stateText = oProgIndicator._getStateText();
		assert.strictEqual(oProgIndicator.$().attr("aria-valuetext"), "50% " + stateText, "aria-valuetext should be '50% " + stateText + "'");

		oProgIndicator.destroy();
	});

	QUnit.test("ARIA labelledBy and describedBy associations should be reflected in the DOM", function(assert) {
		const oProgIndicator = new ProgressIndicator({
			ariaLabelledBy: "id1",
			ariaDescribedBy: "id2"
		});

		oProgIndicator.placeAt("qunit-fixture");
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		assert.strictEqual(oProgIndicator.$().attr("aria-labelledby"), "id1", "aria-labelledby is set correctly");
		assert.strictEqual(oProgIndicator.$().attr("aria-describedby"), "id2", "aria-describedby is set correctly");

		oProgIndicator.destroy();
	});

	QUnit.test("explicitly setting textDirection to RTL should override the global setting", function(assert) {
		const $TestSubject = jQuery("#pi3").find("span");
		const sDirAttribute = $TestSubject.attr("dir");
		assert.equal(sDirAttribute, 'rtl', "the attribute 'dir' should have it's value set to rtl");
	});

	QUnit.test("explicitly setting textDirection to LTR should override the global setting", function(assert) {
		const $TestSubject = jQuery("#pi4").find("span");
		const sDirAttribute = $TestSubject.attr("dir");
		assert.equal(sDirAttribute, 'ltr', "the attribute 'dir' should have it's value set to ltr");
	});

	QUnit.test("not setting textDirection should not add the dir attribute to the DOM", function(assert) {
		const $TestSubject = jQuery("#pi1").find("span");
		const sDirAttribute = $TestSubject.attr("dir");
		assert.equal(sDirAttribute, undefined, "the attribute 'dir' should not exist");
	});

	QUnit.test("explicitly setting textDirection to RTL should result in dir attribute being added to the DOM", function(assert) {
		const $TestSubject = jQuery("#pi3").find("span");
		const sDirAttribute = $TestSubject.attr("dir");
		const bDirAttributeExists = sDirAttribute !== null && sDirAttribute !== undefined;
		assert.equal(bDirAttributeExists, true, "the attribute 'dir' should exist");
	});

	QUnit.test("getAccessibilityInfo should return a valid info object with correct role, type, and description", function(assert) {
		const oControl = new ProgressIndicator({percentValue: 50});
		const sDisplayValue = "Display value";
		assert.ok(!!oControl.getAccessibilityInfo, "ProgressIndicator has a getAccessibilityInfo function");
		let oInfo = oControl.getAccessibilityInfo();
		assert.ok(!!oInfo, "getAccessibilityInfo returns a info object");
		assert.strictEqual(oInfo.role, "progressbar", "AriaRole");
		assert.strictEqual(oInfo.type, Library.getResourceBundleFor("sap.m").getText("ACC_CTR_TYPE_PROGRESS"), "Type");
		assert.strictEqual(oInfo.description, Library.getResourceBundleFor("sap.m").getText("ACC_CTR_STATE_PROGRESS", [50]), "Description");
		assert.ok(oInfo.editable === undefined || oInfo.editable === null, "Editable");
		oControl.setPercentValue(10);
		oInfo = oControl.getAccessibilityInfo();
		assert.strictEqual(oInfo.description, Library.getResourceBundleFor("sap.m").getText("ACC_CTR_STATE_PROGRESS", [10]), "Description");
		oControl.setDisplayValue(sDisplayValue);
		oInfo = oControl.getAccessibilityInfo();
		assert.strictEqual(oInfo.description, sDisplayValue, "Description should equal the displayValue when set");
		oControl.destroy();
	});

	QUnit.test("displayAnimation property should default to true and be settable to false", function(assert) {
		// Arrange
		const oProgressIndicator = new ProgressIndicator();

		// Assert
		assert.ok(oProgressIndicator.getDisplayAnimation(), "DisplayAnimation is with correct default value");

		// Act
		oProgressIndicator.setDisplayAnimation(false);

		// Assert
		assert.notOk(oProgressIndicator.getDisplayAnimation(), "DisplayAnimation value is successfully changed");

		// Clean up
		oProgressIndicator.destroy();
	});

	QUnit.test("CSS animation properties are applied when displayAnimation is true", function(assert) {
		// Arrange
		const oProgressIndicator = new ProgressIndicator();

		// Act
		oProgressIndicator.placeAt("content");
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		oProgressIndicator.setPercentValue(100);
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		const oBarDomRef = oProgressIndicator.getDomRef().querySelector(".sapMPIBar");

		// Assert
		assert.strictEqual(oBarDomRef.style.transitionProperty, "flex-basis", "The bar's transition-property is set to 'flex-basis'");
		assert.strictEqual(oBarDomRef.style.transitionDuration, "2000ms", "The bar's transition-duration is set to '2000ms'");
		assert.strictEqual(oBarDomRef.style.transitionTimingFunction, "linear", "The bar's transition-timing-function is set to 'linear'");

		// Clean up
		oProgressIndicator.destroy();
	});

	QUnit.test("CSS animation properties are not applied when displayAnimation is false", function(assert) {
		// Arrange
		const oProgressIndicator = new ProgressIndicator({
			displayAnimation: false
		});

		// Act
		oProgressIndicator.placeAt("content");
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		oProgressIndicator.setPercentValue(100);

		const oBarDomRef = oProgressIndicator.getDomRef().querySelector(".sapMPIBar");

		// Assert
		assert.notOk(oBarDomRef.style.transitionProperty, "The bar's transition-property is not set");
		assert.notOk(oBarDomRef.style.transitionDuration, "The bar's transition-duration is not set");
		assert.notOk(oBarDomRef.style.transitionTimingFunction, "The bar's transition-timing-function is not set");

		// Clean up
		oProgressIndicator.destroy();
	});

	QUnit.test("CSS animation properties are not applied when Configuration.AnimationMode is 'none'", function(assert) {
		// Arrange
		const oProgressIndicator = new ProgressIndicator();
		const oStub = sinon.stub(ControlBehavior, "getAnimationMode").returns("none");

		// Act
		oProgressIndicator.placeAt("content");
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		oProgressIndicator.setPercentValue(100);

		const oBarDomRef = oProgressIndicator.getDomRef().querySelector(".sapMPIBar");

		// Assert
		assert.notOk(oBarDomRef.style.transitionProperty, "The bar's transition-property is not set");
		assert.notOk(oBarDomRef.style.transitionDuration, "The bar's transition-duration is not set");
		assert.notOk(oBarDomRef.style.transitionTimingFunction, "The bar's transition-timing-function is not set");

		// Clean up
		oProgressIndicator.destroy();
		oStub.restore();
	});

	/* --------------------------- ProgressIndicator Popover -------------------------------------- */

	QUnit.module("ProgressIndicator - Popover ", {
		beforeEach: function () {
			this.clock = sinon.useFakeTimers(); // fake timers active — await nextUIUpdate() would hang
			this.oPI = new ProgressIndicator({
				width : "30%",
				percentValue : 30,
				displayValue : "Very Very Very Very Very Very Very Very Very Very Very Very Very Very Very Very Very Very Very Very Very Very Very Very Very Very Very Very Very Very Very Very Very Very Very Very Very Very Very Very Very Very Very Very Very Very Very Very Very Very Very Very Very Very Very Very Very Very Very Very Very Very Long Value"
			});
			this.oPIPopover = this.oPI._getPopover();
			this.oPI.placeAt("qunit-fixture");
			nextUIUpdate.runSync()/*fake timer is used in module*/; // fake timers active — await nextUIUpdate() would hang
		},
		afterEach: function () {
			this.oPI.destroy();
			this.oPI = null;
			this.clock.restore();
		}
	});

	QUnit.test("Popover should open and close when the Progress Indicator is pressed", function (assert) {
		// Arrange
		const done = assert.async();
		assert.expect(3);

		this.oPIPopover.attachAfterOpen(function(){
			// Assert
			assert.ok(this.oPIPopover.isOpen(), "Popover is opened when the Progress Indicator is pressed.");

			this.oPIPopover.attachAfterClose(function(){
				// Assert
				assert.notOk(this.oPIPopover.isOpen(), "Popover is closed when the Progress Indicator is pressed.");
				done();
			}, this);

			// Act
			this.oPI.ontap();
			this.clock.tick(POPOVER_WAIT_TIME);
		}, this);

		// Assert
		assert.ok(this.oPI._isHoverable(), "Popover is hoverable.");

		// Act
		this.oPI.ontap();
		this.clock.tick(POPOVER_WAIT_TIME);
	});

	QUnit.test("Popover should not open when displayValue is not truncated", function (assert) {
		// Act
		this.oPI.setDisplayValue(".");
		nextUIUpdate.runSync()/*fake timer is used in module*/; // fake timers active — await nextUIUpdate() would hang
		this.oPI.ontap();
		this.clock.tick(POPOVER_WAIT_TIME);

		// Assert
		assert.notOk(this.oPIPopover.isOpen(), "Popover is not opened when the Progress Indicator is pressed.");
		assert.notOk(this.oPI._isHoverable(), "Popover is not hoverable.");
	});

	QUnit.test("Popover should not open when displayValue is empty", function (assert) {
		// Act
		this.oPI.setDisplayValue("");
		nextUIUpdate.runSync()/*fake timer is used in module*/; // fake timers active — await nextUIUpdate() would hang
		this.oPI.ontap();
		this.clock.tick(POPOVER_WAIT_TIME);

		// Assert
		assert.notOk(this.oPIPopover.isOpen(), "Popover is not opened when the Progress Indicator is pressed.");
		assert.notOk(this.oPI._isHoverable(), "Popover is not hoverable.");
	});

	QUnit.test("Popover should close when its close icon or button is pressed", function (assert) {
		// Arrange
		const done = assert.async();
		assert.expect(1);

		this.oPIPopover.attachAfterOpen(function(){
			this.oPIPopover.attachAfterClose(function(){
				// Assert
				assert.notOk(this.oPIPopover.isOpen(), "Popover is closed when its close icon/button is pressed.");
				done();
			}, this);

			// Act
			this.oPI._onPopoverCloseIconPress();
			this.clock.tick(POPOVER_WAIT_TIME);
		}, this);

		// Act
		this.oPI.ontap();
		this.clock.tick(POPOVER_WAIT_TIME);
	});

	QUnit.test("Popover text should stay in sync with displayValue of the ProgressIndicator", function (assert) {
		// Assert
		assert.strictEqual(this.oPI.getDisplayValue(), this.oPI._oPopoverText.getText(),
			"The text inside the popover is initially equal with the displayValue text of the ProgressIndicator.");

		// Act
		this.oPI.setDisplayValue("Test");

		// Assert
		assert.strictEqual(this.oPI.getDisplayValue(), this.oPI._oPopoverText.getText(),
			"The text inside the popover is synced with the displayValue text after updating the displayValue property of the ProgressIndicator.");
	});

});
