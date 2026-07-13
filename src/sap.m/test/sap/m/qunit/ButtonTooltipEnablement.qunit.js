/*global QUnit */
sap.ui.define([
	"sap/m/Button",
	"sap/m/ToggleButton",
	"sap/ui/core/ShortcutHintsMixin",
	"sap/ui/core/tooltip/TooltipEnablement",
	"sap/ui/qunit/utils/nextUIUpdate"
], function(
	Button,
	ToggleButton,
	ShortcutHintsMixin,
	TooltipEnablement,
	nextUIUpdate
) {
	"use strict";

	// ----------------------------------------------------------------
	// Module: Initialization
	// ----------------------------------------------------------------
	QUnit.module("Initialization", {
		beforeEach: function() {
			this.oFlagStub = this.stub(TooltipEnablement, "isEnhancedTooltipEnabled");
		},
		afterEach: function() {
			this.oButton.destroy();
		}
	});

	QUnit.test("_oTooltipEnablement is not set when feature flag is off", function(assert) {
		// Prepare
		this.oFlagStub.returns(false);

		// Act
		this.oButton = new Button({ tooltip: "Save" });

		// Assert
		assert.notOk(this.oButton._oTooltipEnablement,
			"_oTooltipEnablement is falsy when the feature flag is off");
	});

	QUnit.test("_oTooltipEnablement is created when feature flag is on", function(assert) {
		// Prepare
		this.oFlagStub.returns(true);

		// Act
		this.oButton = new Button({ tooltip: "Save" });

		// Assert
		assert.ok(this.oButton._oTooltipEnablement instanceof TooltipEnablement,
			"_oTooltipEnablement is a TooltipEnablement instance when the feature flag is on");
	});

	QUnit.test("ShortcutHintsMixin popup is suppressed on init when feature flag is on", function(assert) {
		// Prepare
		this.oFlagStub.returns(true);
		const oSuppressStub = this.stub(ShortcutHintsMixin, "setPopupSuppressed");

		// Act
		this.oButton = new Button({ tooltip: "Save" });

		// Assert
		assert.ok(oSuppressStub.calledWith(this.oButton, true),
			"setPopupSuppressed called with true so the mixin popup is suppressed");
	});

	// ----------------------------------------------------------------
	// Module: _buildTooltipText
	// ----------------------------------------------------------------
	QUnit.module("_buildTooltipText", {
		beforeEach: function() {
			this.stub(TooltipEnablement, "isEnhancedTooltipEnabled").returns(true);
			this.oButton = new Button({ tooltip: "Save document" });
		},
		afterEach: function() {
			this.oButton.destroy();
		}
	});

	QUnit.test("returns empty string when button is disabled", function(assert) {
		// Prepare
		this.oButton.setEnabled(false);

		// Act
		const sResult = this.oButton._buildTooltipText();

		// Assert
		assert.strictEqual(sResult, "", "returns empty string for a disabled button");
	});

	QUnit.test("returns empty string when button is enabled but has no tooltip and no shortcut", function(assert) {
		// Prepare
		this.oButton.setTooltip("");
		this.stub(ShortcutHintsMixin, "getTooltipWithShortcut").returns("");

		// Act
		const sResult = this.oButton._buildTooltipText();

		// Assert
		assert.strictEqual(sResult, "", "returns empty string when both tooltip and shortcut are absent");
	});

	QUnit.test("returns tooltip text when enabled and no shortcut is registered", function(assert) {
		// Prepare
		this.stub(ShortcutHintsMixin, "getTooltipWithShortcut").returns("Save document");

		// Act
		const sResult = this.oButton._buildTooltipText();

		// Assert
		assert.strictEqual(sResult, "Save document", "returns plain tooltip text");
	});

	QUnit.test("returns tooltip combined with shortcut text", function(assert) {
		// Prepare
		this.stub(ShortcutHintsMixin, "getTooltipWithShortcut").returns("Save document (Ctrl+S)");

		// Act
		const sResult = this.oButton._buildTooltipText();

		// Assert
		assert.strictEqual(sResult, "Save document (Ctrl+S)",
			"returns tooltip with shortcut suffix when a shortcut is registered");
	});

	QUnit.test("delegates to ShortcutHintsMixin.getTooltipWithShortcut with correct arguments", function(assert) {
		// Prepare
		const oShortcutStub = this.stub(ShortcutHintsMixin, "getTooltipWithShortcut").returns("Save document");

		// Act
		this.oButton._buildTooltipText();

		// Assert
		assert.ok(oShortcutStub.calledWith(this.oButton, "Save document"),
			"getTooltipWithShortcut called with the button and its tooltip text");
	});

	// ----------------------------------------------------------------
	// Module: _getTitleAttribute
	// ----------------------------------------------------------------
	QUnit.module("_getTitleAttribute", {
		afterEach: function() {
			this.oButton.destroy();
		}
	});

	QUnit.test("returns null when _oTooltipEnablement is set", function(assert) {
		// Prepare
		this.stub(TooltipEnablement, "isEnhancedTooltipEnabled").returns(true);
		this.oButton = new Button({ tooltip: "Save" });

		// Act
		const sResult = this.oButton._getTitleAttribute();

		// Assert
		assert.strictEqual(sResult, null,
			"_getTitleAttribute returns null so the enhanced tooltip handles the presentation");
	});

	QUnit.test("returns tooltip string when _oTooltipEnablement is null", function(assert) {
		// Prepare
		this.stub(TooltipEnablement, "isEnhancedTooltipEnabled").returns(false);
		this.oButton = new Button({ tooltip: "Save" });

		// Act
		const sResult = this.oButton._getTitleAttribute();

		// Assert
		assert.strictEqual(sResult, "Save",
			"_getTitleAttribute returns the tooltip string for the legacy native-title path");
	});

	// ----------------------------------------------------------------
	// Module: exit / lifecycle cleanup
	// ----------------------------------------------------------------
	QUnit.module("exit — lifecycle cleanup", {
		beforeEach: function() {
			this.stub(TooltipEnablement, "isEnhancedTooltipEnabled").returns(true);
			this.oButton = new Button({ tooltip: "Save" });
		}
		// no afterEach — each test destroys the button itself
	});

	QUnit.test("destroy() calls destroy on _oTooltipEnablement and nulls the reference", function(assert) {
		// Prepare
		const oDestroySpy = this.spy(this.oButton._oTooltipEnablement, "destroy");

		// Act
		this.oButton.destroy();

		// Assert
		assert.ok(oDestroySpy.calledOnce,
			"destroy() was called on _oTooltipEnablement during button exit");
		assert.strictEqual(this.oButton._oTooltipEnablement, null,
			"_oTooltipEnablement is set to null during exit so no dangling references remain");
	});

	// ----------------------------------------------------------------
	// Module: DOM rendering — icon-only button (has implicit tooltip from icon)
	// ----------------------------------------------------------------
	QUnit.module("DOM rendering — icon-only button", {
		beforeEach: async function() {
			this.stub(TooltipEnablement, "isEnhancedTooltipEnabled").returns(true);
			this.oButton = new Button("btn-icon", { icon: "sap-icon://add" });
			this.oButton.placeAt("qunit-fixture");
			await nextUIUpdate(this.clock);
		},
		afterEach: async function() {
			this.oButton.destroy();
			await nextUIUpdate(this.clock);
		}
	});

	QUnit.test("no native title attribute on the button element", function(assert) {
		// Assert
		assert.strictEqual(this.oButton.getDomRef().getAttribute("title"), null,
			"native title attribute is suppressed when enhanced tooltip is active");
	});

	QUnit.test("invisible tooltip span is rendered with role='tooltip' and non-empty text", function(assert) {
		// Prepare
		const sId = this.oButton._oTooltipEnablement.getInvisibleTooltipId();
		const oSpan = document.getElementById(sId);

		// Assert
		assert.ok(oSpan, "invisible tooltip span exists in the DOM");
		assert.strictEqual(oSpan.getAttribute("role"), "tooltip",
			"invisible span has role='tooltip' for screen reader association");
		assert.ok(oSpan.textContent.length > 0,
			"invisible span text is not empty — carries the icon's accessible name");
	});

	QUnit.test("legacy -tooltip span is not rendered", function(assert) {
		// Assert
		assert.strictEqual(document.getElementById("btn-icon-tooltip"), null,
			"legacy -tooltip span is absent when enhanced tooltip is active");
	});

	QUnit.test("aria-describedby references the invisible tooltip id", function(assert) {
		// Prepare
		const sInvisibleId = this.oButton._oTooltipEnablement.getInvisibleTooltipId();

		// Assert
		const sDescribedBy = this.oButton.getDomRef().getAttribute("aria-describedby");
		assert.ok(sDescribedBy && sDescribedBy.split(" ").includes(sInvisibleId),
			"aria-describedby references the invisible tooltip span");
	});

	// ----------------------------------------------------------------
	// Module: DOM rendering — text button with explicit tooltip
	// ----------------------------------------------------------------
	QUnit.module("DOM rendering — text button with tooltip", {
		beforeEach: async function() {
			this.stub(TooltipEnablement, "isEnhancedTooltipEnabled").returns(true);
			this.oButton = new Button("btn-text", {
				text: "Save",
				tooltip: "Save document"
			});
			this.oButton.placeAt("qunit-fixture");
			await nextUIUpdate(this.clock);
		},
		afterEach: async function() {
			this.oButton.destroy();
			await nextUIUpdate(this.clock);
		}
	});

	QUnit.test("no native title attribute on the button element", function(assert) {
		// Assert
		assert.strictEqual(this.oButton.getDomRef().getAttribute("title"), null,
			"native title attribute is suppressed when enhanced tooltip is active");
	});

	QUnit.test("invisible tooltip span is rendered with the correct text", function(assert) {
		// Prepare
		const sId = this.oButton._oTooltipEnablement.getInvisibleTooltipId();
		const oSpan = document.getElementById(sId);

		// Assert
		assert.ok(oSpan, "invisible tooltip span is present in the DOM");
		assert.strictEqual(oSpan.textContent, "Save document",
			"invisible span text matches the button's tooltip property");
	});

	QUnit.test("legacy -tooltip span is not rendered", function(assert) {
		// Assert
		assert.strictEqual(document.getElementById("btn-text-tooltip"), null,
			"legacy -tooltip span is absent when enhanced tooltip is active");
	});

	QUnit.test("aria-describedby references the invisible tooltip id", function(assert) {
		// Prepare
		const sInvisibleId = this.oButton._oTooltipEnablement.getInvisibleTooltipId();

		// Assert
		const sDescribedBy = this.oButton.getDomRef().getAttribute("aria-describedby");
		assert.ok(sDescribedBy && sDescribedBy.split(" ").includes(sInvisibleId),
			"aria-describedby references the invisible tooltip span");
	});

	// ----------------------------------------------------------------
	// Module: DOM rendering — text button without tooltip
	// ----------------------------------------------------------------
	QUnit.module("DOM rendering — text button without tooltip", {
		beforeEach: async function() {
			this.stub(TooltipEnablement, "isEnhancedTooltipEnabled").returns(true);
			this.oButton = new Button("btn-no-tip", { text: "Save" });
			this.oButton.placeAt("qunit-fixture");
			await nextUIUpdate(this.clock);
		},
		afterEach: async function() {
			this.oButton.destroy();
			await nextUIUpdate(this.clock);
		}
	});

	QUnit.test("no invisible tooltip span when there is no tooltip", function(assert) {
		// Assert
		assert.strictEqual(this.oButton._oTooltipEnablement.getInvisibleTooltipId(), null,
			"getInvisibleTooltipId returns null — no span id to reference");
		assert.strictEqual(document.getElementById("btn-no-tip-invisibleTooltip"), null,
			"no invisible tooltip span in the DOM when the button has no tooltip");
	});
});
