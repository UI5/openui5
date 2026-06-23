/*global QUnit */

sap.ui.define([
	"sap/m/library",
	"sap/m/OverflowToolbar",
	"sap/m/OverflowToolbarMenuButton",
	"sap/m/OverflowToolbarLayoutData",
	"sap/ui/core/IconPool",
	"sap/ui/test/utils/nextUIUpdate"
], function(
	mLibrary,
	OverflowToolbar,
	OverflowToolbarMenuButton,
	OverflowToolbarLayoutData,
	IconPool,
	nextUIUpdate
) {
	"use strict";

	function _inOverflowAndVisible(oOTB, oControl){
		if (oOTB._getOverflowButton().$().is(":visible")){
			if (oControl._bInOverflow){
				return true;
			}
		}
		return false;
	}

	async function checkTooltipValue(assert, oOTB, expectedToolbarTooltip, expectedOverflowTooltip){
		const oMenuButton = oOTB.getContent()[0];
		const oLayoutData = new OverflowToolbarLayoutData({
			priority: oOTBPriority.AlwaysOverflow
		});

		// Outside of overflow
		oMenuButton.setTooltip(expectedToolbarTooltip);
		await nextUIUpdate();

		assert.notOk(oMenuButton._bInOverflow, "OverflowToolbarMenuButton is not in the overflow area");
		assert.strictEqual(oMenuButton.getTooltip(), expectedToolbarTooltip, "OverflowToolbarMenuButton tooltip value is correct");

		// In overflow
		oMenuButton.setLayoutData(oLayoutData);
		await nextUIUpdate();

		assert.ok(_inOverflowAndVisible(oOTB, oMenuButton), "Overflow button is visible and MenuButton is in the overflow area");
		assert.strictEqual(oMenuButton.getTooltip(), expectedOverflowTooltip, "OverflowToolbarMenuButton tooltip value is correct");
	}

	async function checkForDefaultTooltip(assert, oOTB, sIcon){
		const oMenuButton = oOTB.getContent()[0];
		const oLayoutData = new OverflowToolbarLayoutData({
			priority: oOTBPriority.AlwaysOverflow
		});
		const oIconInfo = IconPool.getIconInfo(sIcon);
		const sTooltip = oIconInfo.text ? oIconInfo.text : oIconInfo.name;

		// 1. Shows icon default tooltip when not in overflow
		assert.notOk(oMenuButton._bInOverflow, "OverflowToolbarMenuButton is not in the overflow area");
		assert.strictEqual(oMenuButton.getTooltip(), sTooltip, "OverflowToolbarMenuButton tooltip value is correct");

		oMenuButton.setLayoutData(oLayoutData);
		await nextUIUpdate();

		// 2. Doesn't show anything when in overflow
		assert.ok(_inOverflowAndVisible(oOTB, oMenuButton), "Overflow button is visible and MenuButton is in the overflow area");
		assert.notOk(oMenuButton.getTooltip(), "OverflowToolbarMenuButton has no tooltip");
	}

	const oOTBPriority = mLibrary.OverflowToolbarPriority;

	QUnit.module("Regular MenuButton Tests", {
		beforeEach: async function () {
			this.sMenuButtonText = "Menu";
			this.sIcon = "sap-icon://bullet-text";
			this.oOTB = new OverflowToolbar({
				content: new OverflowToolbarMenuButton( "RegularMenuButton", {
					icon: this.sIcon,
					text: this.sMenuButtonText,
					buttonMode: "Regular",
					useDefaultActionOnly: true
				})
			});

			this.oOTB.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function () {
			this.oOTB.destroy();
			this.oOTB = null;
		}
	});

	QUnit.test("getText returns empty string when not in overflow and full text when in overflow", async function (assert) {
		// Arrange
		const oMenuButton = this.oOTB.getContent()[0];
		const oLayoutData = new OverflowToolbarLayoutData({
			priority: oOTBPriority.AlwaysOverflow
		});

		// Assert - not in overflow
		assert.notOk(oMenuButton._bInOverflow, "OverflowToolbarMenuButton is not in the overflow area");
		assert.strictEqual(oMenuButton.getText(), "", "OverflowToolbarMenuButton text value is correct");

		// Act - move to overflow
		oMenuButton.setLayoutData(oLayoutData);
		await nextUIUpdate();

		// Assert - in overflow
		assert.ok(this.oOTB._getOverflowButton().$().is(":visible"), "OverflowMenuButton is visible");
		assert.ok(oMenuButton._bInOverflow, "OverflowToolbarMenuButton is in the overflow area");
		assert.strictEqual(oMenuButton.getText(), this.sMenuButtonText, "OverflowToolbarMenuButton text value is correct");
	});

	QUnit.test("getTooltip shows icon default tooltip outside overflow and no tooltip inside overflow when no tooltip is set", async function (assert) {
		// 1. Shows icon default tooltip when not in overflow
		// 2. Doesn't show anything when in overflow
		await checkForDefaultTooltip(assert, this.oOTB, this.sIcon);
	});

	QUnit.test("getTooltip hides tooltip when it matches the button text both inside and outside overflow", async function (assert) {
		// 1. Text same as tooltip and ! in Overflow (doesn't show tooltip)
		// 2. Text same as tooltip and in Overflow (doesn't show tooltip)
		await checkTooltipValue(assert, this.oOTB, this.sMenuButtonText, "");
	});

	QUnit.test("getTooltip shows custom tooltip when it differs from button text both inside and outside overflow", async function (assert) {
		// 1. Text diff from tooltip and ! in Overflow (shows tooltip)
		// 2. Text diff from tooltip and in overflow (shows tooltip)
		const sTooltipText = "Simple Tooltip";
		await checkTooltipValue(assert, this.oOTB, sTooltipText, sTooltipText);
	});

	QUnit.module("Split MenuButton Tests", {
		beforeEach: async function () {
			this.sMenuButtonText = "Menu";
			this.sIcon = "sap-icon://bullet-text";
			this.oOTB = new OverflowToolbar({
				content: new OverflowToolbarMenuButton( "SplitMenuButton", {
					icon: this.sIcon,
					text: this.sMenuButtonText,
					buttonMode: "Split",
					useDefaultActionOnly: true
				})
			});

			this.oOTB.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function () {
			this.oOTB.destroy();
			this.oOTB = null;
		}
	});

	QUnit.test("getTooltip shows icon default tooltip outside overflow and no tooltip inside overflow when no tooltip is set", async function (assert) {
		// 1. Shows icon default tooltip when not in overflow
		// 2. Doesn't show anything when in overflow
		await checkForDefaultTooltip(assert, this.oOTB, this.sIcon);
	});

	QUnit.test("getTooltip hides tooltip when it matches the button text both inside and outside overflow", async function (assert) {
		// 1. Text same as tooltip and ! in Overflow (doesn't show tooltip)
		// 2. Text same as tooltip and in Overflow (doesn't show tooltip)
		await checkTooltipValue(assert, this.oOTB, this.sMenuButtonText, "");
	});

	QUnit.test("getTooltip shows custom tooltip when it differs from button text both inside and outside overflow", async function (assert) {
		// 1: Text diff from tooltip and ! in Overflow (shows tooltip)
		// 2. Text diff from tooltip and in overflow (shows tooltip)
		const sTooltipText = "Simple Tooltip";
		await checkTooltipValue(assert, this.oOTB, sTooltipText, sTooltipText);
	});

});
