/*global QUnit, sinon */

sap.ui.define([
	"sap/ui/unified/calendar/Header",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/core/tooltip/TooltipEnablement",
	"sap/ui/events/KeyCodes"
], function(Header, nextUIUpdate, TooltipEnablement, KeyCodes) {
	"use strict";

	QUnit.module("Rendering", function (hooks) {
		hooks.beforeEach(async function () {
			this.oHeader = new Header();

			this.oHeader.placeAt("qunit-fixture");
			await nextUIUpdate();
		});
		hooks.afterEach(function () {
			this.oHeader.destroy();
			this.oHeader = null;
		});

		QUnit.module("DOM", function () {
			QUnit.test("Header tag should have sapUiCalHead CSS class", function (assert) {
				// assert
				assert.equal(this.oHeader.$().hasClass("sapUiCalHead"), true, "sapUiCalHead CSS class should present");
			});
		});

		QUnit.module("Helper methods", function (hooks) {
			hooks.beforeEach(function () {
				this.oRenderer = this.oHeader.getRenderer();
			});
			hooks.afterEach(function () {
				this.oRenderer = null;
			});

			QUnit.module("getVisibleButton()", function () {
				QUnit.test("should return false if no public or private method with the provided index is defined on the Header", function (assert) {
					// arrange
					var oHead = this.oHeader;

					// act & assert
					assert.equal(this.oRenderer.getVisibleButton(oHead, 5), false, "no _getVisibleButton5 or getVisibleButton5 exits");
				});

				QUnit.test("should return the value from the public method with the provided index if it is defined on the Header", function (assert) {
					// arrange
					var bResult,
						bExpectedValue = true,
						oHead = { getVisibleButton2: this.stub().returns(bExpectedValue), _getVisibleButton2: this.spy() };

					// act
					bResult = this.oRenderer.getVisibleButton(oHead, 2);

					// assert
					assert.equal(oHead.getVisibleButton2.callCount, 1, "getVisibleButton2 should be called once");
					assert.equal(oHead._getVisibleButton2.callCount, 0, "_getVisibleButton2 should not be called");
					assert.equal(bResult, bExpectedValue, "getVisibleButton should return " + bExpectedValue);
				});

				QUnit.test("should return the value from the private method with the provided index if public is not defined on the Header", function (assert) {
					// arrange
					var bResult,
						bExpectedValue = true,
						oHead = { _getVisibleButton2: this.stub().returns(bExpectedValue) };

					// act
					bResult = this.oRenderer.getVisibleButton(oHead, 2);

					// assert
					assert.equal(oHead._getVisibleButton2.callCount, 1, "_getVisibleButton2 should be called once");
					assert.equal(bResult, bExpectedValue, "getVisibleButton should return " + bExpectedValue);
				});
			});

			QUnit.module("getAriaLabelButton()", function () {
				QUnit.test("should return undefined if no public or private method with the provided index is defined on the Header", function (assert) {
					// arrange
					var oHead = this.oHeader;

					// act & assert
					assert.equal(this.oRenderer.getAriaLabelButton(oHead, 5), undefined, "no _getAriaLabelButton5 or getAriaLabelButton5 exits");
				});

				QUnit.test("should return the value from the public method with the provided index if it is defined on the Header", function (assert) {
					// arrange
					var sResult,
						sExpectedValue = "Aria Label",
						oHead = { getAriaLabelButton2: this.stub().returns(sExpectedValue), _getAriaLabelButton2: this.spy() };

					// act
					sResult = this.oRenderer.getAriaLabelButton(oHead, 2);

					// assert
					assert.equal(oHead.getAriaLabelButton2.callCount, 1, "getAriaLabelButton2 should be called once");
					assert.equal(oHead._getAriaLabelButton2.callCount, 0, "_getAriaLabelButton2 should not be called");
					assert.equal(sResult, sExpectedValue, "getAriaLabelButton should return " + sExpectedValue);
				});

				QUnit.test("should return the value from the private method with the provided index if public is not defined on the Header", function (assert) {
					// arrange
					var sResult,
						sExpectedValue = "Aria Label",
						oHead = { _getAriaLabelButton2: this.stub().returns(sExpectedValue) };

					// act
					sResult = this.oRenderer.getAriaLabelButton(oHead, 2);

					// assert
					assert.equal(oHead._getAriaLabelButton2.callCount, 1, "_getAriaLabelButton2 should be called once");
					assert.equal(sResult, sExpectedValue, "getAriaLabelButton should return " + sExpectedValue);
				});
			});

			QUnit.module("getTextButton()", function () {
				QUnit.test("should return undefined if no public or private method with the provided index is defined on the Header", function (assert) {
					// arrange
					var oHead = this.oHeader;

					// act & assert
					assert.equal(this.oRenderer.getTextButton(oHead, 5), undefined, "no _getTextButton5 or getTextButton5 exits");
				});

				QUnit.test("should return the value from the public method with the provided index if it is defined on the Header", function (assert) {
					// arrange
					var sResult,
						sExpectedValue = "Aria Label",
						oHead = { getTextButton2: this.stub().returns(sExpectedValue), _getTextButton2: this.spy() };

					// act
					sResult = this.oRenderer.getTextButton(oHead, 2);

					// assert
					assert.equal(oHead.getTextButton2.callCount, 1, "getTextButton2 should be called once");
					assert.equal(oHead._getTextButton2.callCount, 0, "_getTextButton2 should not be called");
					assert.equal(sResult, sExpectedValue, "getTextButton should return " + sExpectedValue);
				});

				QUnit.test("should return the value from the private method with the provided index if public is not defined on the Header", function (assert) {
					// arrange
					var sResult,
						sExpectedValue = "Aria Label",
						oHead = { _getTextButton2: this.stub().returns(sExpectedValue) };

					// act
					sResult = this.oRenderer.getTextButton(oHead, 2);

					// assert
					assert.equal(oHead._getTextButton2.callCount, 1, "_getTextButton2 should be called once");
					assert.equal(sResult, sExpectedValue, "getTextButton should return " + sExpectedValue);
				});
			});

			QUnit.module("getAdditionalTextButton()", function () {
				QUnit.test("should return undefined if no public or private method with the provided index is defined on the Header", function (assert) {
					// arrange
					var oHead = this.oHeader;

					// act & assert
					assert.equal(this.oRenderer.getAdditionalTextButton(oHead, 5), undefined, "no _getAdditionalTextButton5 or getAdditionalTextButton5 exits");
				});

				QUnit.test("should return the value from the public method with the provided index if it is defined on the Header", function (assert) {
					// arrange
					var sResult,
						sExpectedValue = "Aria Label",
						oHead = { getAdditionalTextButton2: this.stub().returns(sExpectedValue), _getAdditionalTextButton2: this.spy() };

					// act
					sResult = this.oRenderer.getAdditionalTextButton(oHead, 2);

					// assert
					assert.equal(oHead.getAdditionalTextButton2.callCount, 1, "getAdditionalTextButton2 should be called once");
					assert.equal(oHead._getAdditionalTextButton2.callCount, 0, "_getAdditionalTextButton2 should not be called");
					assert.equal(sResult, sExpectedValue, "getAdditionalTextButton should return " + sExpectedValue);
				});

				QUnit.test("should return the value from the private method with the provided index if public is not defined on the Header", function (assert) {
					// arrange
					var sResult,
						sExpectedValue = "Aria Label",
						oHead = { _getAdditionalTextButton2: this.stub().returns(sExpectedValue) };

					// act
					sResult = this.oRenderer.getAdditionalTextButton(oHead, 2);

					// assert
					assert.equal(oHead._getAdditionalTextButton2.callCount, 1, "_getAdditionalTextButton2 should be called once");
					assert.equal(sResult, sExpectedValue, "getAdditionalTextButton should return " + sExpectedValue);
				});
			});

			// Fake test to have a root module with at least one test, otherwise qunit-2 will fail
			QUnit.test("Helper methods module starts", function (assert) {
				assert.ok(true, "assert ok");
			});
		});

		QUnit.test("visibleCurrentDateButton", async function (assert) {
			var oHeader = this.oHeader,
				sHeaderId = "#" + oHeader.getId() + "-today";

			// assert
			assert.notOk(oHeader.getDomRef().querySelector(sHeaderId), "button is not rendered");

			// act
			oHeader.setVisibleCurrentDateButton(true);
			await nextUIUpdate();

			// assert
			assert.ok(oHeader.getDomRef().querySelector(sHeaderId), "button is rendered");
		});

		QUnit.test("renders left content only for single month mode", function (assert) {
			var oHeader = this.oHeader,
				oDomRef = oHeader.getDomRef(),
				oLeftContent = oDomRef.querySelector("#" + oHeader.getId() + "-contentLeft"),
				oRightContent = oDomRef.querySelector("#" + oHeader.getId() + "-contentRight"),
				oPrevButton = oHeader.$("prev")[0],
				oNextButton = oHeader.$("next")[0];

			assert.ok(oLeftContent, "left content container is rendered");
			assert.ok(oLeftContent.classList.contains("sapUiCalHeadContent"), "left content has sapUiCalHeadContent class");
			assert.ok(oLeftContent.classList.contains("sapUiCalHeadAlignCenter"), "left content has default center alignment");
			assert.notOk(oRightContent, "right content container is not rendered");
			assert.strictEqual(oPrevButton.parentNode, oDomRef, "previous button is outside content containers");
			assert.strictEqual(oNextButton.parentNode, oDomRef, "next button is outside content containers");
		});

		QUnit.test("renders right content container and alignment classes for two months mode", async function (assert) {
			var oHeader = this.oHeader,
				oRenderer = oHeader.getRenderer(),
				oIsTwoMonthsCalendarStub = this.stub(oRenderer, "_isTwoMonthsCalendar").returns(true),
				oDomRef,
				oLeftContent,
				oRightContent;

			oHeader._setVisibleButton3(true);
			oHeader._setVisibleButton4(true);
			oHeader._setTextButton3("March");
			oHeader._setTextButton4("2024");
			oHeader.setProperty("_alignLeft", "Start");
			oHeader.setProperty("_alignRight", "End");
			await nextUIUpdate();

			oDomRef = oHeader.getDomRef();
			oLeftContent = oDomRef.querySelector("#" + oHeader.getId() + "-contentLeft");
			oRightContent = oDomRef.querySelector("#" + oHeader.getId() + "-contentRight");

			assert.ok(oLeftContent.classList.contains("sapUiCalHeadAlignStart"), "left content has start alignment class");
			assert.ok(oRightContent, "right content container is rendered");
			assert.ok(oRightContent.classList.contains("sapUiCalHeadContent"), "right content has sapUiCalHeadContent class");
			assert.ok(oRightContent.classList.contains("sapUiCalHeadAlignEnd"), "right content has end alignment class");
			assert.ok(oRightContent.querySelector("#" + oHeader.getId() + "-B3"), "button 3 is rendered in right content");
			assert.ok(oRightContent.querySelector("#" + oHeader.getId() + "-B4"), "button 4 is rendered in right content");

			oIsTwoMonthsCalendarStub.restore();
		});

		// Fake test to have a root module with at least one test, otherwise qunit-2 will fail
		QUnit.test("Rendering module starts", function (assert) {
			assert.ok(true, "assert ok");
		});
	});

	QUnit.module("Private API", function (hooks) {
		hooks.beforeEach(async function () {
			this.oHeader = new Header();

			this.oHeader.placeAt("qunit-fixture");
			await nextUIUpdate();
		});
		hooks.afterEach(function () {
			this.oHeader.destroy();
			this.oHeader = null;
		});

		QUnit.module("_set- and _getVisibleButton", function () {
			QUnit.test("_setVisibleButton3 should set inner property and invalidate the control", function (assert) {
				// arrange
				var bExpectedValue = true,
					oInvalidateSpy = this.spy(this.oHeader, "invalidate");

				// act
				this.oHeader._setVisibleButton3(bExpectedValue);

				// assert
				assert.equal(this.oHeader._visibleButton3, bExpectedValue, "visibleButton3 property should be set properly");
				assert.equal(oInvalidateSpy.callCount, 1, "invalidate should be called once");

				// cleanup
				oInvalidateSpy.restore();
			});

			QUnit.test("_getVisibleButton3 should get the value from inner property", function (assert) {
				// arrange
				var bExpectedValue = true;
				this.oHeader._visibleButton3 = bExpectedValue;

				// act & assert
				assert.equal(this.oHeader._getVisibleButton3(), bExpectedValue, "_getVisibleButton3 should return the inner value property");
			});

			QUnit.test("_setVisibleButton4 should set inner property and invalidate the control", function (assert) {
				// arrange
				var bExpectedValue = true,
					oInvalidateSpy = this.spy(this.oHeader, "invalidate");

				// act
				this.oHeader._setVisibleButton4(bExpectedValue);

				// assert
				assert.equal(this.oHeader._visibleButton4, bExpectedValue, "visibleButton4 property should be set properly");
				assert.equal(oInvalidateSpy.callCount, 1, "invalidate should be called once");

				// cleanup
				oInvalidateSpy.restore();
			});

			QUnit.test("_getVisibleButton4 should get the value from inner property", function (assert) {
				// arrange
				var bExpectedValue = true;
				this.oHeader._visibleButton4 = bExpectedValue;

				// act & assert
				assert.equal(this.oHeader._getVisibleButton4(), bExpectedValue, "_getVisibleButton4 should return the inner value property");
			});
		});

		QUnit.module("_set- and _getTextButton", function () {
			QUnit.test("_setTextButton3 should set property and change the text of the DOM element", async function (assert) {
				this.oHeader._setVisibleButton3(true);
				// arrange
				var sExpectedText = "Expected text",
					oInvalidateSpy = this.spy(this.oHeader, "invalidate");

				// act
				this.oHeader._setTextButton3(sExpectedText);
				await nextUIUpdate();

				// assert
				assert.equal(this.oHeader._textButton3, sExpectedText, "inner property should be set properly");
				assert.equal(this.oHeader.$("B3").text(), sExpectedText, "The DOM should be properly updated");
				assert.equal(oInvalidateSpy.callCount, 0, "invalidate should not be called");

				// cleanup
				oInvalidateSpy.restore();
			});

			QUnit.test("_getTextButton3 should get the value from inner property", function (assert) {
				// arrange
				var bExpectedValue = true;
				this.oHeader._textButton3 = bExpectedValue;

				// act & assert
				assert.equal(this.oHeader._getTextButton3(), bExpectedValue, "_getTextButton3 should return the inner value property");
			});

			QUnit.test("_setTextButton4 should set property and change the text of the DOM element", async function (assert) {
				this.oHeader._setVisibleButton4(true);
				// arrange
				var sExpectedText = "Expected text",
					oInvalidateSpy = this.spy(this.oHeader, "invalidate");

				// act
				this.oHeader._setTextButton4(sExpectedText);
				await nextUIUpdate();

				// assert
				assert.equal(this.oHeader._textButton4, sExpectedText, "inner property should be set properly");
				assert.equal(this.oHeader.$("B4").text(), sExpectedText, "The DOM should be properly updated");
				assert.equal(oInvalidateSpy.callCount, 0, "invalidate should not be called");

				// cleanup
				oInvalidateSpy.restore();
			});

			QUnit.test("_getTextButton4 should get the value from inner property", function (assert) {
				// arrange
				var bExpectedValue = true;
				this.oHeader._textButton4 = bExpectedValue;

				// act & assert
				assert.equal(this.oHeader._getTextButton4(), bExpectedValue, "_getTextButton4 should return the inner value property");
			});
		});

		QUnit.module("_set- and _getAriaLabelButton", function () {
			QUnit.test("_setAriaLabelButton3 should set property and change the aria-label of the DOM element", async function (assert) {
				this.oHeader._setVisibleButton3(true);
				// arrange
				var sExpectedText = "Expected text",
					oInvalidateSpy = this.spy(this.oHeader, "invalidate");

				// act
				this.oHeader._setAriaLabelButton3(sExpectedText);
				await nextUIUpdate();

				// assert
				assert.equal(this.oHeader._ariaLabelButton3, sExpectedText, "inner property should be set properly");
				assert.equal(this.oHeader.$("B3").attr("aria-label"), sExpectedText, "The DOM should be properly updated");
				assert.equal(oInvalidateSpy.callCount, 0, "invalidate should not be called");

				// cleanup
				oInvalidateSpy.restore();
			});

			QUnit.test("_getAriaLabelButton3 should get the value from inner property", function (assert) {
				// arrange
				var bExpectedValue = true;
				this.oHeader._ariaLabelButton3 = bExpectedValue;

				// act & assert
				assert.equal(this.oHeader._getAriaLabelButton3(), bExpectedValue, "_getAriaLabelButton3 should return the inner value property");
			});

			QUnit.test("_setAriaLabelButton4 should set property and change the aria-label of the DOM element", async function (assert) {
				this.oHeader._setVisibleButton4(true);
				// arrange
				var sExpectedText = "Expected text",
					oInvalidateSpy = this.spy(this.oHeader, "invalidate");

				// act
				this.oHeader._setAriaLabelButton4(sExpectedText);
				await nextUIUpdate();

				// assert
				assert.equal(this.oHeader._ariaLabelButton4, sExpectedText, "inner property should be set properly");
				assert.equal(this.oHeader.$("B4").attr("aria-label"), sExpectedText, "The DOM should be properly updated");
				assert.equal(oInvalidateSpy.callCount, 0, "invalidate should not be called");

				// cleanup
				oInvalidateSpy.restore();
			});

			QUnit.test("_getAriaLabelButton4 should get the value from inner property", function (assert) {
				// arrange
				var bExpectedValue = true;
				this.oHeader._ariaLabelButton4 = bExpectedValue;

				// act & assert
				assert.equal(this.oHeader._getAriaLabelButton4(), bExpectedValue, "_getAriaLabelButton4 should return the inner value property");
			});
		});

		// Fake test to have a root module with at least one test, otherwise qunit-2 will fail
		QUnit.test("Private API module starts", function (assert) {
			assert.ok(true, "assert ok");
		});
	});

	// ----------------------------------------------------------------
	// TooltipEnablement — prev/next/today/B-buttons title attribute
	// ----------------------------------------------------------------
	QUnit.module("TooltipEnablement — title attributes", function(hooks) {
		var oFlagStub;

		hooks.beforeEach(function() {
			oFlagStub = sinon.stub(TooltipEnablement, "isEnhancedTooltipEnabled");
		});
		hooks.afterEach(function() {
			oFlagStub.restore();
			if (this.oHeader) {
				this.oHeader.destroy();
				this.oHeader = null;
			}
		});

		QUnit.test("prev button has native title attribute when enhanced tooltip is disabled", async function(assert) {
			oFlagStub.returns(false);
			this.oHeader = new Header();
			this.oHeader.placeAt("qunit-fixture");
			await nextUIUpdate();

			const oPrevBtn = this.oHeader.getDomRef().querySelector("#" + this.oHeader.getId() + "-prev");
			assert.ok(oPrevBtn.getAttribute("title"), "prev button has a title attribute when enhanced tooltip is off");
		});

		QUnit.test("prev button has no title attribute when enhanced tooltip is enabled", async function(assert) {
			oFlagStub.returns(true);
			this.oHeader = new Header();
			this.oHeader.placeAt("qunit-fixture");
			await nextUIUpdate();

			const oPrevBtn = this.oHeader.getDomRef().querySelector("#" + this.oHeader.getId() + "-prev");
			assert.strictEqual(oPrevBtn.getAttribute("title"), null,
				"prev button has no title attribute when enhanced tooltip is on");
		});

		QUnit.test("next button has native title attribute when enhanced tooltip is disabled", async function(assert) {
			oFlagStub.returns(false);
			this.oHeader = new Header();
			this.oHeader.placeAt("qunit-fixture");
			await nextUIUpdate();

			const oNextBtn = this.oHeader.getDomRef().querySelector("#" + this.oHeader.getId() + "-next");
			assert.ok(oNextBtn.getAttribute("title"), "next button has a title attribute when enhanced tooltip is off");
		});

		QUnit.test("next button has no title attribute when enhanced tooltip is enabled", async function(assert) {
			oFlagStub.returns(true);
			this.oHeader = new Header();
			this.oHeader.placeAt("qunit-fixture");
			await nextUIUpdate();

			const oNextBtn = this.oHeader.getDomRef().querySelector("#" + this.oHeader.getId() + "-next");
			assert.strictEqual(oNextBtn.getAttribute("title"), null,
				"next button has no title attribute when enhanced tooltip is on");
		});

		QUnit.test("today button has native title attribute when enhanced tooltip is disabled", async function(assert) {
			oFlagStub.returns(false);
			this.oHeader = new Header({ visibleCurrentDateButton: true });
			this.oHeader.placeAt("qunit-fixture");
			await nextUIUpdate();

			const oTodayBtn = this.oHeader.getDomRef().querySelector("#" + this.oHeader.getId() + "-today");
			assert.ok(oTodayBtn.getAttribute("title"), "today button has a title attribute when enhanced tooltip is off");
		});

		QUnit.test("today button has no title attribute when enhanced tooltip is enabled", async function(assert) {
			oFlagStub.returns(true);
			this.oHeader = new Header({ visibleCurrentDateButton: true });
			this.oHeader.placeAt("qunit-fixture");
			await nextUIUpdate();

			const oTodayBtn = this.oHeader.getDomRef().querySelector("#" + this.oHeader.getId() + "-today");
			assert.strictEqual(oTodayBtn.getAttribute("title"), null,
				"today button has no title attribute when enhanced tooltip is on");
		});

		QUnit.test("B1 button has native title attribute when enhanced tooltip is disabled", async function(assert) {
			oFlagStub.returns(false);
			this.oHeader = new Header({ visibleButton1: true });
			this.oHeader.setProperty("_tooltipButton1", "January");
			this.oHeader.placeAt("qunit-fixture");
			await nextUIUpdate();

			const oB1 = this.oHeader.getDomRef().querySelector("#" + this.oHeader.getId() + "-B1");
			assert.strictEqual(oB1.getAttribute("title"), "January",
				"B1 button has title attribute when enhanced tooltip is off");
		});

		QUnit.test("B1 button has no title attribute when enhanced tooltip is enabled", async function(assert) {
			oFlagStub.returns(true);
			this.oHeader = new Header({ visibleButton1: true });
			this.oHeader.setProperty("_tooltipButton1", "January");
			this.oHeader.placeAt("qunit-fixture");
			await nextUIUpdate();

			const oB1 = this.oHeader.getDomRef().querySelector("#" + this.oHeader.getId() + "-B1");
			assert.strictEqual(oB1.getAttribute("title"), null,
				"B1 button has no title attribute when enhanced tooltip is on");
		});

		QUnit.test("prev button aria-label is set regardless of enhanced tooltip state", async function(assert) {
			oFlagStub.returns(true);
			this.oHeader = new Header();
			this.oHeader.placeAt("qunit-fixture");
			await nextUIUpdate();

			const oPrevBtn = this.oHeader.getDomRef().querySelector("#" + this.oHeader.getId() + "-prev");
			assert.ok(oPrevBtn.getAttribute("aria-label"),
				"prev button has aria-label even when enhanced tooltip is on");
		});

		QUnit.test("next button aria-label is set regardless of enhanced tooltip state", async function(assert) {
			oFlagStub.returns(true);
			this.oHeader = new Header();
			this.oHeader.placeAt("qunit-fixture");
			await nextUIUpdate();

			const oNextBtn = this.oHeader.getDomRef().querySelector("#" + this.oHeader.getId() + "-next");
			assert.ok(oNextBtn.getAttribute("aria-label"),
				"next button has aria-label even when enhanced tooltip is on");
		});

		// Native mode: aria-description is set (deduplicates SR announcement of title vs aria-label)

		QUnit.test("prev button has aria-description set to label-only in native mode", async function(assert) {
			oFlagStub.returns(false);
			this.oHeader = new Header();
			this.oHeader.placeAt("qunit-fixture");
			await nextUIUpdate();

			const oPrevBtn = this.oHeader.getDomRef().querySelector("#" + this.oHeader.getId() + "-prev");
			const sTitle = oPrevBtn.getAttribute("title");
			const sDescription = oPrevBtn.getAttribute("aria-description");
			assert.ok(sTitle, "prev button has a title in native mode");
			assert.ok(sDescription, "prev button has aria-description in native mode");
			assert.notStrictEqual(sDescription, sTitle,
				"prev button aria-description is label-only and does not include the shortcut suffix from title");
			assert.strictEqual(oPrevBtn.getAttribute("aria-describedby"), null,
				"prev button has no aria-describedby in native mode");
		});

		QUnit.test("next button has aria-description set to label-only in native mode", async function(assert) {
			oFlagStub.returns(false);
			this.oHeader = new Header();
			this.oHeader.placeAt("qunit-fixture");
			await nextUIUpdate();

			const oNextBtn = this.oHeader.getDomRef().querySelector("#" + this.oHeader.getId() + "-next");
			const sTitle = oNextBtn.getAttribute("title");
			const sDescription = oNextBtn.getAttribute("aria-description");
			assert.ok(sTitle, "next button has a title in native mode");
			assert.ok(sDescription, "next button has aria-description in native mode");
			assert.notStrictEqual(sDescription, sTitle,
				"next button aria-description is label-only and does not include the shortcut suffix from title");
			assert.strictEqual(oNextBtn.getAttribute("aria-describedby"), null,
				"next button has no aria-describedby in native mode");
		});

		QUnit.test("today button has aria-description matching title in native mode", async function(assert) {
			oFlagStub.returns(false);
			this.oHeader = new Header({ visibleCurrentDateButton: true });
			this.oHeader.placeAt("qunit-fixture");
			await nextUIUpdate();

			const oTodayBtn = this.oHeader.getDomRef().querySelector("#" + this.oHeader.getId() + "-today");
			const sTitle = oTodayBtn.getAttribute("title");
			assert.ok(sTitle, "today button has a title in native mode");
			assert.strictEqual(oTodayBtn.getAttribute("aria-description"), sTitle,
				"today button aria-description matches the title value");
			assert.strictEqual(oTodayBtn.getAttribute("aria-describedby"), null,
				"today button has no aria-describedby in native mode");
		});

		QUnit.test("B1 button has aria-description set from _descriptionButton1 in native mode", async function(assert) {
			oFlagStub.returns(false);
			this.oHeader = new Header({ visibleButton1: true });
			this.oHeader.setProperty("_tooltipButton1", "Select Month (F4)");
			this.oHeader.setProperty("_descriptionButton1", "January 2024");
			this.oHeader.placeAt("qunit-fixture");
			await nextUIUpdate();

			const oB1 = this.oHeader.getDomRef().querySelector("#" + this.oHeader.getId() + "-B1");
			assert.strictEqual(oB1.getAttribute("aria-description"), "January 2024",
				"B1 button aria-description is set from _descriptionButton1 in native mode");
			assert.strictEqual(oB1.getAttribute("aria-describedby"), null,
				"B1 button has no aria-describedby in native mode");
		});
	});

	QUnit.module("Space key — deferred action and cancellation", function(hooks) {
		hooks.beforeEach(async function() {
			this.oHeader = new Header({
				visibleButton1: true,
				visibleButton2: true,
				visibleCurrentDateButton: true
			});
			this.oHeader.placeAt("qunit-fixture");
			await nextUIUpdate();
		});
		hooks.afterEach(function() {
			this.oHeader.destroy();
			this.oHeader = null;
		});

		function pressSpace(oDomRef) {
			oDomRef.focus();
			oDomRef.dispatchEvent(new KeyboardEvent("keydown", { which: KeyCodes.SPACE, keyCode: KeyCodes.SPACE, bubbles: true, cancelable: true }));
			oDomRef.dispatchEvent(new KeyboardEvent("keyup",  { which: KeyCodes.SPACE, keyCode: KeyCodes.SPACE, bubbles: true }));
		}

		function pressSpaceThenCancel(oDomRef, iCancelKey) {
			oDomRef.focus();
			oDomRef.dispatchEvent(new KeyboardEvent("keydown", { which: KeyCodes.SPACE,  keyCode: KeyCodes.SPACE,  bubbles: true, cancelable: true }));
			oDomRef.dispatchEvent(new KeyboardEvent("keydown", { which: iCancelKey,       keyCode: iCancelKey,       bubbles: true, cancelable: true }));
			oDomRef.dispatchEvent(new KeyboardEvent("keyup",   { which: KeyCodes.SPACE,  keyCode: KeyCodes.SPACE,  bubbles: true }));
		}

		QUnit.test("Space on prev button fires pressPrevious on keyup", function(assert) {
			const oSpy = sinon.spy(this.oHeader, "firePressPrevious");
			pressSpace(this.oHeader.getDomRef("prev"));
			assert.strictEqual(oSpy.callCount, 1, "pressPrevious fired once on Space keyup");
			oSpy.restore();
		});

		QUnit.test("Space on next button fires pressNext on keyup", function(assert) {
			const oSpy = sinon.spy(this.oHeader, "firePressNext");
			pressSpace(this.oHeader.getDomRef("next"));
			assert.strictEqual(oSpy.callCount, 1, "pressNext fired once on Space keyup");
			oSpy.restore();
		});

		QUnit.test("Space on today button fires pressCurrentDate on keyup", function(assert) {
			const oSpy = sinon.spy(this.oHeader, "firePressCurrentDate");
			pressSpace(this.oHeader.getDomRef("today"));
			assert.strictEqual(oSpy.callCount, 1, "pressCurrentDate fired once on Space keyup");
			oSpy.restore();
		});

		QUnit.test("Space on B1 button fires pressButton1 on keyup", function(assert) {
			const oSpy = sinon.spy(this.oHeader, "firePressButton1");
			pressSpace(this.oHeader.getDomRef("B1"));
			assert.strictEqual(oSpy.callCount, 1, "pressButton1 fired once on Space keyup");
			oSpy.restore();
		});

		QUnit.test("Space + Shift cancels the action on prev button", function(assert) {
			const oSpy = sinon.spy(this.oHeader, "firePressPrevious");
			pressSpaceThenCancel(this.oHeader.getDomRef("prev"), KeyCodes.SHIFT);
			assert.strictEqual(oSpy.callCount, 0, "pressPrevious not fired when Shift is held during Space");
			oSpy.restore();
		});

		QUnit.test("Space + Escape cancels the action on prev button", function(assert) {
			const oSpy = sinon.spy(this.oHeader, "firePressPrevious");
			pressSpaceThenCancel(this.oHeader.getDomRef("prev"), KeyCodes.ESCAPE);
			assert.strictEqual(oSpy.callCount, 0, "pressPrevious not fired when Escape is held during Space");
			oSpy.restore();
		});

		QUnit.test("Space + Shift cancels the action on B1 button", function(assert) {
			const oSpy = sinon.spy(this.oHeader, "firePressButton1");
			pressSpaceThenCancel(this.oHeader.getDomRef("B1"), KeyCodes.SHIFT);
			assert.strictEqual(oSpy.callCount, 0, "pressButton1 not fired when Shift is held during Space");
			oSpy.restore();
		});

		QUnit.test("Space + Escape cancels the action on B1 button", function(assert) {
			const oSpy = sinon.spy(this.oHeader, "firePressButton1");
			pressSpaceThenCancel(this.oHeader.getDomRef("B1"), KeyCodes.ESCAPE);
			assert.strictEqual(oSpy.callCount, 0, "pressButton1 not fired when Escape is held during Space");
			oSpy.restore();
		});

		QUnit.test("Escape alone without Space does not leave flags dirty", function(assert) {
			const oPrevBtn = this.oHeader.getDomRef("prev");
			oPrevBtn.focus();
			oPrevBtn.dispatchEvent(new KeyboardEvent("keydown", { which: KeyCodes.ESCAPE, keyCode: KeyCodes.ESCAPE, bubbles: true, cancelable: true }));
			assert.strictEqual(this.oHeader._bSpacePressed, false, "_bSpacePressed remains false");
			assert.strictEqual(this.oHeader._bPressedEscapeOrShift, false, "_bPressedEscapeOrShift remains false");
		});

		QUnit.test("Space keydown calls preventDefault to prevent page scroll", function(assert) {
			const oPrevBtn = this.oHeader.getDomRef("prev");
			oPrevBtn.focus();
			const oEvent = new KeyboardEvent("keydown", { which: KeyCodes.SPACE, keyCode: KeyCodes.SPACE, bubbles: true, cancelable: true });
			const oPreventDefaultSpy = sinon.spy(oEvent, "preventDefault");
			oPrevBtn.dispatchEvent(oEvent);
			assert.ok(oPreventDefaultSpy.called, "preventDefault called on Space keydown");
		});

		QUnit.test("Mouse click still fires press event regardless of Space state", function(assert) {
			const oSpy = sinon.spy(this.oHeader, "firePressNext");
			const oNextBtn = this.oHeader.getDomRef("next");
			oNextBtn.focus();
			oNextBtn.dispatchEvent(new MouseEvent("click", { detail: 1, bubbles: true }));
			assert.strictEqual(oSpy.callCount, 1, "pressNext fires on mouse click");
			oSpy.restore();
		});
	});
});
