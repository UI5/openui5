/*global QUnit */
sap.ui.define([
	"sap/m/MenuButton",
	"sap/m/Menu",
	"sap/m/MenuItem",
	"sap/ui/core/ShortcutHintsMixin",
	"sap/ui/core/tooltip/TooltipEnablement"
], function(MenuButton, Menu, MenuItem, ShortcutHintsMixin, TooltipEnablement) {
	"use strict";

	function makeMenu() {
		return new Menu({ items: [new MenuItem({ text: "Item" })] });
	}

	// ----------------------------------------------------------------
	// Module: Regular mode — init
	// ----------------------------------------------------------------
	QUnit.module("Regular mode — init", {
		beforeEach: function() {
			this.oFlagStub = this.stub(TooltipEnablement, "isEnhancedTooltipEnabled");
		},
		afterEach: function() {
			this.oMenuButton.destroy();
		}
	});

	QUnit.test("ShortcutHintsMixin popup is NOT suppressed when feature flag is off", function(assert) {
		// Prepare
		this.oFlagStub.returns(false);
		const oSuppressStub = this.stub(ShortcutHintsMixin, "setPopupSuppressed");

		// Act
		this.oMenuButton = new MenuButton({ tooltip: "Save", menu: makeMenu() });

		// Assert
		assert.notOk(oSuppressStub.calledWith(this.oMenuButton, true),
			"setPopupSuppressed is not called on the outer MenuButton when feature flag is off");
	});

	QUnit.test("ShortcutHintsMixin popup is suppressed on outer MenuButton when feature flag is on", function(assert) {
		// Prepare
		this.oFlagStub.returns(true);
		const oSuppressStub = this.stub(ShortcutHintsMixin, "setPopupSuppressed");

		// Act
		this.oMenuButton = new MenuButton({ tooltip: "Save", menu: makeMenu() });

		// Assert
		assert.ok(oSuppressStub.calledWith(this.oMenuButton, true),
			"setPopupSuppressed is called with the outer MenuButton so its own mixin tooltip popup is suppressed");
	});

	// ----------------------------------------------------------------
	// Module: Regular mode — _buildTooltipText
	// ----------------------------------------------------------------
	QUnit.module("Regular mode — _buildTooltipText", {
		beforeEach: function() {
			this.stub(TooltipEnablement, "isEnhancedTooltipEnabled").returns(true);
			this.oMenuButton = new MenuButton({ tooltip: "Save document", menu: makeMenu() });
		},
		afterEach: function() {
			this.oMenuButton.destroy();
		}
	});

	QUnit.test("returns empty string when inner button is disabled", function(assert) {
		// Prepare
		const oInnerBtn = this.oMenuButton._getButtonControl();
		oInnerBtn.setEnabled(false);

		// Act
		const sResult = oInnerBtn._buildTooltipText();

		// Assert
		assert.strictEqual(sResult, "", "returns empty string for a disabled inner button");
	});

	QUnit.test("resolves shortcut hint through outer MenuButton", function(assert) {
		// Prepare
		const oInnerBtn = this.oMenuButton._getButtonControl();
		const oShortcutStub = this.stub(ShortcutHintsMixin, "getTooltipWithShortcut").returns("Save document");

		// Act
		oInnerBtn._buildTooltipText();

		// Assert
		assert.strictEqual(oShortcutStub.firstCall.args[0], this.oMenuButton,
			"getTooltipWithShortcut is called with the outer MenuButton so shortcuts registered on it are resolved");
	});

	// ----------------------------------------------------------------
	// Module: Split mode — init
	// ----------------------------------------------------------------
	QUnit.module("Split mode — init", {
		beforeEach: function() {
			this.oFlagStub = this.stub(TooltipEnablement, "isEnhancedTooltipEnabled");
		},
		afterEach: function() {
			this.oMenuButton.destroy();
		}
	});

	QUnit.test("_oTooltipEnablement is NOT created on text button when feature flag is off", function(assert) {
		// Prepare
		this.oFlagStub.returns(false);

		// Act
		this.oMenuButton = new MenuButton({ tooltip: "Save", buttonMode: "Split", menu: makeMenu() });
		const oTextBtn = this.oMenuButton._getButtonControl()._getTextButton();

		// Assert
		assert.notOk(oTextBtn._oTooltipEnablement instanceof TooltipEnablement,
			"_oTooltipEnablement is not created on the text button when the feature flag is off");
	});

	QUnit.test("_oTooltipEnablement is created on inner text button when feature flag is on", function(assert) {
		// Prepare
		this.oFlagStub.returns(true);

		// Act
		this.oMenuButton = new MenuButton({ tooltip: "Save", buttonMode: "Split", menu: makeMenu() });
		const oTextBtn = this.oMenuButton._getButtonControl()._getTextButton();

		// Assert
		assert.ok(oTextBtn._oTooltipEnablement instanceof TooltipEnablement,
			"_oTooltipEnablement is created on the inner text button so the split text area shows the tooltip");
	});

	QUnit.test("ShortcutHintsMixin popup is suppressed on outer MenuButton when feature flag is on", function(assert) {
		// Prepare
		this.oFlagStub.returns(true);
		const oSuppressStub = this.stub(ShortcutHintsMixin, "setPopupSuppressed");

		// Act
		this.oMenuButton = new MenuButton({ tooltip: "Save", buttonMode: "Split", menu: makeMenu() });

		// Assert
		assert.ok(oSuppressStub.calledWith(this.oMenuButton, true),
			"setPopupSuppressed is called with the outer MenuButton so its own mixin tooltip popup is suppressed");
	});

	// ----------------------------------------------------------------
	// Module: Split mode — tooltip text
	// ----------------------------------------------------------------
	QUnit.module("Split mode — tooltip text", {
		beforeEach: function() {
			this.stub(TooltipEnablement, "isEnhancedTooltipEnabled").returns(true);
			this.oMenuButton = new MenuButton({ tooltip: "Save document", buttonMode: "Split", menu: makeMenu() });
		},
		afterEach: function() {
			this.oMenuButton.destroy();
		}
	});

	QUnit.test("returns empty string when inner text button is disabled", function(assert) {
		// Prepare
		const oTextBtn = this.oMenuButton._getButtonControl()._getTextButton();
		oTextBtn.setEnabled(false);

		// Act
		const sResult = oTextBtn._oTooltipEnablement._resolveText();

		// Assert
		assert.strictEqual(sResult, "", "returns empty string for a disabled text button");
	});

	QUnit.test("resolves shortcut hint through outer MenuButton", function(assert) {
		// Prepare
		const oTextBtn = this.oMenuButton._getButtonControl()._getTextButton();
		const oShortcutStub = this.stub(ShortcutHintsMixin, "getTooltipWithShortcut").returns("Save document");

		// Act
		oTextBtn._oTooltipEnablement._resolveText();

		// Assert
		assert.strictEqual(oShortcutStub.firstCall.args[0], this.oMenuButton,
			"getTooltipWithShortcut is called with the outer MenuButton so shortcuts registered on it are resolved");
	});
});
