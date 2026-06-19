/*global QUnit */

sap.ui.define([
	"sap/f/AvatarGroupItem",
	"sap/ui/test/utils/nextUIUpdate"
],
function (
	AvatarGroupItem,
	nextUIUpdate
) {
	"use strict";

	const DOM_RENDER_LOCATION = "qunit-fixture",
		sControlId = "AvatarGroupItemId";

	function createAvatarGroupItem(oProps, sId) {
		sId = sId || sControlId;

		return new AvatarGroupItem(sId, oProps);
	}

	async function setupFunction() {
		this.oAvatarGroupItem = createAvatarGroupItem({
			initials: "BD",
			src: "src",
			fallbackIcon: "icon"
		});
		this.oAvatarGroupItem.placeAt(DOM_RENDER_LOCATION);
		await nextUIUpdate();
	}

	function teardownFunction() {
		this.oAvatarGroupItem.destroy();
	}

	QUnit.module("Basic Rendering");

	QUnit.test("renders AvatarGroupItem with correct CSS class and tabindex based on group type and interactivity", async function (assert) {
		// Arrange
		const oAvatarGroupItem = createAvatarGroupItem();

		// Act
		oAvatarGroupItem.placeAt(DOM_RENDER_LOCATION);
		await nextUIUpdate();
		const $oDomRef = oAvatarGroupItem.$();

		// Assert
		assert.ok($oDomRef, "The AvatarGroupItem is rendered");
		assert.ok($oDomRef.hasClass("sapFAvatarGroupItem"), "The AvatarGroupItem has 'sapFAvatarGroupItem' class");
		assert.strictEqual($oDomRef.attr("tabindex"), undefined, "The AvatarGroupItem has no tabindex when it is in Group mode");

		// Act
		oAvatarGroupItem._setGroupType("Individual");
		oAvatarGroupItem._setInteractive(true);
		await nextUIUpdate();

		// Assert
		assert.strictEqual($oDomRef.attr("tabindex"), "0", "The AvatarGroupItem has tabindex=0 when it is in Individual mode");

		// Act
		oAvatarGroupItem._setGroupType("Individual");
		oAvatarGroupItem._setInteractive(false);
		await nextUIUpdate();

		// Assert
		assert.strictEqual($oDomRef.attr("tabindex"), undefined, "The AvatarGroupItem has no tabindex when it is in Individual mode and is not interactive");

		// Clean up
		oAvatarGroupItem.destroy();
	});

	QUnit.module("API", {
		beforeEach: setupFunction,
		afterEach: teardownFunction
	});

	QUnit.test("setSrc updates the src property of the inner Avatar", async function (assert) {
		// Arrange
		const sNewSrc = "newSrc",
			oAvatar = this.oAvatarGroupItem._getAvatar();

		// Assert
		assert.strictEqual(oAvatar.getSrc(), "src", "src of Avatar is set correctly");

		// Act
		this.oAvatarGroupItem.setSrc(sNewSrc);
		await nextUIUpdate();

		// Assert
		assert.strictEqual(oAvatar.getSrc(), sNewSrc, "src of Avatar is changed correctly");
	});

	QUnit.test("setInitials updates the initials property of the inner Avatar", async function (assert) {
		// Arrange
		const sNewInitials = "GR",
			oAvatar = this.oAvatarGroupItem._getAvatar();

		// Assert
		assert.strictEqual(oAvatar.getInitials(), "BD", "initials of Avatar is set correctly");

		// Act
		this.oAvatarGroupItem.setInitials(sNewInitials);
		await nextUIUpdate();

		// Assert
		assert.strictEqual(oAvatar.getInitials(), sNewInitials, "initials of Avatar is changed correctly");
	});

	QUnit.test("setFallbackIcon updates the fallbackIcon property of the inner Avatar", async function (assert) {
		// Arrange
		const sNewFallbackIcon = "newIcon",
			oAvatar = this.oAvatarGroupItem._getAvatar();

		// Assert
		assert.strictEqual(oAvatar.getFallbackIcon(), "icon", "fallbackIcon of Avatar is set correctly");

		// Act
		this.oAvatarGroupItem.setFallbackIcon(sNewFallbackIcon);
		await nextUIUpdate();

		// Assert
		assert.strictEqual(oAvatar.getFallbackIcon(), sNewFallbackIcon, "fallbackIcon of Avatar is changed correctly");
	});


	QUnit.test("setTooltip renders tooltip as title attribute on the AvatarGroupItem DOM element", async function (assert) {
		// Arrange

		this.oAvatarGroupItem.setTooltip("New Tooltip");
		await nextUIUpdate();

		// Assert
		assert.strictEqual(this.oAvatarGroupItem.$().attr("title"), "New Tooltip", "Avatar tooltip was correctly attached tp AvatarGroupItem");
	});

	QUnit.module("Private API", {
		beforeEach: setupFunction,
		afterEach: teardownFunction
	});

	QUnit.test("_setDisplaySize sets the displaySize property of the inner Avatar", function (assert) {
		// Arrange
		const oAvatar = this.oAvatarGroupItem._getAvatar();
		this.oAvatarGroupItem._setDisplaySize("S");

		// Assert
		assert.strictEqual(oAvatar.getDisplaySize(), "S", "displaySize of Avatar is set correctly");
	});

	QUnit.test("_setAvatarColor sets the backgroundColor property of the inner Avatar", function (assert) {
		// Arrange
		const oAvatar = this.oAvatarGroupItem._getAvatar();
		this.oAvatarGroupItem._setAvatarColor("Accent1");

		// Assert
		assert.strictEqual(oAvatar.getBackgroundColor(), "Accent1", "backgroundColor of Avatar is set correctly");
	});

	QUnit.test("_setGroupType sets the groupType and triggers invalidation", function (assert) {
		// Arrange
		const oSpy = this.spy(this.oAvatarGroupItem, "invalidate");
		this.oAvatarGroupItem._setGroupType("Group");

		// Assert
		assert.strictEqual(this.oAvatarGroupItem._getGroupType(), "Group", "groupType of AvatarGroupItem is set correctly");
		assert.strictEqual(oSpy.callCount, 1, "Invalidate is called");
	});

	QUnit.test("_getAvatar returns a sap.m.Avatar instance with showBorder set to true", function (assert) {
		// Arrange
		const oAvatar = this.oAvatarGroupItem._getAvatar();

		// Assert
		assert.ok(oAvatar.isA("sap.m.Avatar"), "Avatar instance is created");
		assert.strictEqual(oAvatar.getShowBorder(), true, "showBorder of Avatar is true");
	});

	QUnit.test("_setCustomDisplaySize sets custom display size and font size on the inner Avatar", function (assert) {
		// Arrange
		const oAvatar = this.oAvatarGroupItem._getAvatar();
		this.oAvatarGroupItem._setDisplaySize("Custom");
		this.oAvatarGroupItem._setCustomDisplaySize("3rem");

		// Assert
		assert.strictEqual(oAvatar.getDisplaySize(), "Custom", "displaySize of Avatar is set correctly");
		assert.strictEqual(oAvatar.getCustomDisplaySize(), "3rem", "customDisplaySize of Avatar is set correctly");
	});

	QUnit.test("_setCustomFontSize sets custom font size on the inner Avatar when display size is Custom", function (assert) {
		// Arrange
		const oAvatar = this.oAvatarGroupItem._getAvatar();
		this.oAvatarGroupItem._setDisplaySize("Custom");
		this.oAvatarGroupItem._setCustomFontSize("0.5rem");

		// Assert
		assert.strictEqual(oAvatar.getDisplaySize(), "Custom", "displaySize of Avatar is set correctly");
		assert.strictEqual(oAvatar.getCustomFontSize(), "0.5rem", "customFontSize of Avatar is set correctly");
	});
});
