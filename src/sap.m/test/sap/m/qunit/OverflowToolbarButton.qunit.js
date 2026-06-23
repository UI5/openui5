/*global QUnit */

sap.ui.define([
	"sap/m/library",
	"sap/m/OverflowToolbar",
	"sap/m/OverflowToolbarButton",
	"sap/m/OverflowToolbarLayoutData",
	"sap/ui/core/IconPool",
	"sap/ui/test/utils/nextUIUpdate"
], function(
	mLibrary,
	OverflowToolbar,
	OverflowToolbarButton,
	OverflowToolbarLayoutData,
	IconPool,
	nextUIUpdate
) {
	"use strict";

	const oOTBPriority = mLibrary.OverflowToolbarPriority;

	QUnit.module("Private methods", {
		beforeEach: async function () {
			this.oOTB = new OverflowToolbar({
				content: [
					new OverflowToolbarButton({
						icon: "sap-icon://search",
						text: "Search button"
					})
				]
			});

			this.oOTB.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function () {
			this.oOTB.destroy();
			this.oOTB = null;
		}
	});

	QUnit.test("_getText returns empty string when button is not in overflow area and text when it is in overflow", async function (assert) {
		// Arrange
		const oButton = this.oOTB.getContent()[0];
		const oLayoutData = new OverflowToolbarLayoutData({
			priority: oOTBPriority.AlwaysOverflow
		});

		// Assert initial state
		assert.notOk(oButton._bInOverflow, "OverflowToolbarButton is not in the overflow area");
		assert.strictEqual(oButton._getText(), "", "OverflowToolbarButton text value is correct");

		// Act
		oButton.setLayoutData(oLayoutData);
		await nextUIUpdate();

		// Assert overflow state
		assert.ok(this.oOTB._getOverflowButton().$().is(":visible"), "Overflow button is visible");
		assert.ok(oButton._bInOverflow, "OverflowToolbarButton is in the overflow area");
		assert.strictEqual(oButton._getText(), oButton.getText(), "OverflowToolbarButton text value is correct");
	});

	QUnit.test("_getTooltip returns icon text when button has no custom tooltip and is not in overflow, and undefined when in overflow", async function (assert) {
		// Arrange
		const oButton = this.oOTB.getContent()[0];
		const oLayoutData = new OverflowToolbarLayoutData({
			priority: oOTBPriority.AlwaysOverflow
		});
		const oIconInfo = IconPool.getIconInfo("sap-icon://search");

		// Assert initial state
		assert.notOk(oButton._bInOverflow, "OverflowToolbarButton is not in the overflow area");
		assert.strictEqual(oButton._getTooltip(), oIconInfo.text, "OverflowToolbarButton tooltip value is correct");

		// Act
		oButton.setLayoutData(oLayoutData);
		await nextUIUpdate();

		// Assert overflow state
		assert.ok(this.oOTB._getOverflowButton().$().is(":visible"), "Overflow button is visible");
		assert.ok(oButton._bInOverflow, "OverflowToolbarButton is in the overflow area");
		assert.strictEqual(oButton._getTooltip(), undefined, "OverflowToolbarButton tooltip value is correct");
	});

	QUnit.test("_getTooltip returns correct tooltip based on overflow state and whether tooltip matches button text", async function (assert) {
		// Arrange
		const oButton = this.oOTB.getContent()[0];
		const oLayoutData = new OverflowToolbarLayoutData({
			priority: oOTBPriority.AlwaysOverflow
		});
		const sTooltipText = "Simple tooltip";

		// Act - set custom tooltip before overflow
		oButton.setTooltip(sTooltipText);
		await nextUIUpdate();

		// Assert - not in overflow, tooltip is returned as-is
		assert.notOk(oButton._bInOverflow, "OverflowToolbarButton is not in the overflow area");
		assert.strictEqual(oButton._getTooltip(), sTooltipText, "OverflowToolbarButton tooltip value is correct on icon only button");

		// Act - move to overflow with tooltip different from text
		oButton.setLayoutData(oLayoutData);
		await nextUIUpdate();

		// Assert - in overflow, tooltip different from text is returned
		assert.ok(this.oOTB._getOverflowButton().$().is(":visible"), "Overflow button is visible");
		assert.ok(oButton._bInOverflow, "OverflowToolbarButton is in the overflow area");
		assert.strictEqual(oButton._getTooltip(), sTooltipText, "OverflowToolbarButton tooltip value is correct when the tooltip is different to text");

		// Act - remove from overflow and set tooltip same as text
		oLayoutData.setPriority(oOTBPriority.NeverOverflow);
		oButton.setLayoutData(oLayoutData);
		oButton.setTooltip(oButton.getText());
		await nextUIUpdate();

		// Assert - not in overflow, tooltip same as text is returned
		assert.notOk(oButton._bInOverflow, "OverflowToolbarButton is not in the overflow area");
		assert.strictEqual(oButton._getTooltip(), oButton.getText(), "OverflowToolbarButton tooltip value is correct on icon only button");

		// Act - move back to overflow with tooltip same as text
		oLayoutData.setPriority(oOTBPriority.AlwaysOverflow);
		oButton.setLayoutData(oLayoutData);
		await nextUIUpdate();

		// Assert - in overflow, tooltip same as text returns empty string
		assert.ok(this.oOTB._getOverflowButton().$().is(":visible"), "Overflow button is visible");
		assert.ok(oButton._bInOverflow, "OverflowToolbarButton is in the overflow area");
		assert.strictEqual(oButton._getTooltip(), "", "OverflowToolbarButton tooltip value is correct when the tooltip is same to text");
	});

	QUnit.module("Public methods");

	QUnit.test("getOverflowToolbarConfig returns correct configuration with expected overflow behavior and event settings", function (assert) {
		// Arrange
		const oButton = new OverflowToolbarButton();

		// Act
		const oConfig = oButton.getOverflowToolbarConfig();

		// Assert
		assert.strictEqual(oConfig.canOverflow, true, "OverflowToolbarButton can overflow");
		assert.ok(oConfig.propsUnrelatedToSize.indexOf("enabled") > -1, "OverflowToolbarButton does not invalidate on 'enabled' property change");
		assert.ok(oConfig.propsUnrelatedToSize.indexOf("type") > -1, "OverflowToolbarButton does not invalidate on 'type' property change");
		assert.ok(oConfig.propsUnrelatedToSize.indexOf("accesskey") > -1, "OverflowToolbarButton does not invalidate on 'accesskey' property change");
		assert.ok(oConfig.autoCloseEvents.indexOf("press") > -1, "OverflowToolbarButton listen for 'press' event");

		//Clean up
		oButton.destroy();
	});
});
