/*global QUnit, sinon */
sap.ui.define([
	"sap/m/PagingButton",
	"sap/ui/test/utils/nextUIUpdate",
	"sap/ui/thirdparty/jquery"
],
	function(PagingButton, nextUIUpdate, $) {
		"use strict";


		const helpers = {
				renderObject: async function (oSapUiObject) {
					oSapUiObject.placeAt("qunit-fixture");
					await nextUIUpdate();
					return oSapUiObject;
				},
				objectIsInTheDom: function (sSelector) {
					const $object = $(sSelector);
					return $object.length > 0;
				},
				getPagingButton: function (iCount) {
					return new PagingButton({
						count: iCount || 1
					});
				}
			};

		QUnit.module("sap.m.PagingButton API", {
			beforeEach: function () {
				this.oPagingButton = helpers.getPagingButton();
			},
			afterEach: function () {
				this.oPagingButton.destroy();
			}
		});

		QUnit.test("Default property values are set correctly", function (assert) {
			assert.strictEqual(this.oPagingButton.getPosition(), 1, "for position should be 1");
			assert.strictEqual(this.oPagingButton.getCount(), 1, "for count should be 1");
			assert.ok(!this.oPagingButton.getNextButtonTooltip());
			assert.ok(!this.oPagingButton.getPreviousButtonTooltip());
		});

		QUnit.test("Valid and invalid count and position values are handled correctly", function (assert) {
			// Arrange
			const iValidCount = 10;
			const iInvalidCount = -123;
			const iValidPosition = 4;
			const iInvalidPosition = -10;
			const oPagingButton = this.oPagingButton;
			const oPrevButton = oPagingButton._getPreviousButton();
			const oNextButton = oPagingButton._getNextButton();

			// Act & Assert — count validation
			oPagingButton.setCount(iValidCount);

			assert.strictEqual(oPagingButton.getCount(), iValidCount, "the valid count is correctly set");

			oPagingButton.setCount(iInvalidCount);

			assert.strictEqual(oPagingButton.getCount(), iValidCount,
				"the invalid value of count is not set, and the original value is kept");

			// Act & Assert — position validation
			oPagingButton.setPosition(iValidPosition);

			assert.strictEqual(oPagingButton.getPosition(), iValidPosition, "the valid position is correctly set");

			oPagingButton.setPosition(iInvalidPosition);

			assert.strictEqual(oPagingButton.getPosition(), iValidPosition,
				"the invalid value of position is not set, and the original value is kept");

			// Act & Assert — tooltip propagation
			oPagingButton.setCount(iValidCount);

			oPagingButton.setPreviousButtonTooltip("TestingPrevious");

			assert.strictEqual(oPrevButton.getTooltip(), "TestingPrevious");

			oPagingButton.setNextButtonTooltip("TestingNext");

			assert.strictEqual(oNextButton.getTooltip(), "TestingNext");

		});

		QUnit.module("sap.m.PagingButton Rendering", {
			beforeEach: async function () {
				this.oPagingButton = helpers.getPagingButton(10);
				await helpers.renderObject(this.oPagingButton);
			},
			afterEach: function () {
				this.oPagingButton.destroy();
			}
		});

		QUnit.test("The control is rendered and present in the DOM", function (assert) {
			assert.ok(helpers.objectIsInTheDom("#" + this.oPagingButton.getId()));
		});

		QUnit.module("sap.m.PagingButton Events", {
			beforeEach: async function () {
				this.oSpies = {};
				this.oParams = {};

				this.oSpies.positionChanged = sinon.spy((event) => {
					this.oParams.oldPosition = event.getParameter("oldPosition");
					this.oParams.newPosition = event.getParameter("newPosition");
				});

				this.oPagingButton = helpers.getPagingButton().attachPositionChange(this.oSpies.positionChanged);

				await helpers.renderObject(this.oPagingButton);
			},
			afterEach: function () {
				this.oPagingButton.destroy();
				this.oPagingButton = null;
			}
		});

		QUnit.test("positionChanged event should be fired on each position change", function (assert) {
			// Arrange
			const oPagingButton = this.oPagingButton;
			const oPositionChangedEvent = this.oSpies.positionChanged;

			// Act & Assert
			oPagingButton._getNextButton().firePress();
			assert.ok(oPositionChangedEvent.calledOnce, "PositionChanged is once");

			oPagingButton._getPreviousButton().firePress();
			assert.ok(oPositionChangedEvent.calledTwice, "PositionChanged is twice");

			oPagingButton.setPosition(oPagingButton.getCount());
			oPagingButton._getNextButton().$().trigger("click");
			assert.ok(oPositionChangedEvent.calledTwice, "PositionChanged is not fired when the position doesn't change");
		});
	});
