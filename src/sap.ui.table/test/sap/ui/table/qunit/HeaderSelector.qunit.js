/*global QUnit */

sap.ui.define([
	"sap/ui/table/HeaderSelector",
	"sap/ui/table/Table",
	"sap/ui/table/utils/TableUtils",
	"sap/ui/test/utils/nextUIUpdate"
], function(
	HeaderSelector,
	Table,
	TableUtils,
	nextUIUpdate
) {
	"use strict";

	QUnit.module("API", {
		beforeEach: function() {
			this.oHeaderSelector = new HeaderSelector();
		},
		afterEach: function() {
			this.oHeaderSelector.destroy();
		}
	});

	QUnit.test("Defaults", function(assert) {
		assert.strictEqual(this.oHeaderSelector.getType(), "CheckBox", "Default type is 'CheckBox'");
		assert.strictEqual(this.oHeaderSelector.getVisible(), false, "Default visible is false");
		assert.strictEqual(this.oHeaderSelector.getEnabled(), true, "Default enabled is true");
		assert.strictEqual(this.oHeaderSelector.getCheckBoxSelected(), false, "Default checkBoxSelected is false");
		assert.strictEqual(this.oHeaderSelector.getIcon(), "", "Default icon is empty string");
		assert.strictEqual(this.oHeaderSelector.getTooltip(), null, "Default tooltip is null");
	});

	QUnit.test("#resetSettings", function(assert) {
		this.oHeaderSelector.setType("Icon");
		this.oHeaderSelector.setVisible(true);
		this.oHeaderSelector.setEnabled(false);
		this.oHeaderSelector.setCheckBoxSelected(true);
		this.oHeaderSelector.setIcon("sap-icon://accept");
		this.oHeaderSelector.setTooltip("Test Tooltip");

		this.oHeaderSelector.resetSettings();

		assert.strictEqual(this.oHeaderSelector.getType(), "CheckBox", "Type reset to default");
		assert.strictEqual(this.oHeaderSelector.getVisible(), false, "Visible reset to default");
		assert.strictEqual(this.oHeaderSelector.getEnabled(), true, "Enabled reset to default");
		assert.strictEqual(this.oHeaderSelector.getCheckBoxSelected(), false, "CheckBoxSelected reset to default");
		assert.strictEqual(this.oHeaderSelector.getIcon(), "", "Icon reset to default");
		assert.strictEqual(this.oHeaderSelector.getTooltip(), null, "Tooltip reset to default");
	});

	QUnit.module("Rendering", {
		beforeEach: async function() {
			this.oHeaderSelector = new HeaderSelector();
			this.oHeaderSelector.placeAt("qunit-fixture");

			// Stub the parent to avoid errors during rendering when the renderer tries to access the table's accessibility extension
			this.oHeaderSelector.getParent()._getAccRenderExtension = () => {
				return {
					writeAriaAttributesFor: () => { }
				};
			};

			await nextUIUpdate();
		},
		afterEach: function() {
			this.oHeaderSelector.destroy();
		}
	});

	QUnit.test("Base structure when not visible", function(assert) {
		const oDomRef = this.oHeaderSelector.getDomRef();
		const assertDOM = () => {
			assert.ok(oDomRef, "Root element is rendered");
			assert.strictEqual(oDomRef.tagName, "DIV", "Root element is a div");
			assert.strictEqual(oDomRef.getAttribute("id"), this.oHeaderSelector.getId(), "Root element has correct ID");
			assert.strictEqual(oDomRef.children.length, 0, "No child elements when visible=false");
			assert.ok(oDomRef.classList.contains("sapUiTableHeaderSelector"), "Has sapUiTableHeaderSelector class");
			assert.notOk(oDomRef.classList.contains("sapUiTableHeaderSelectorDisabled"), "No sapUiTableHeaderSelectorDisabled class");
			assert.notOk(oDomRef.hasAttribute("title"), "No title attribute");
		};

		assertDOM();

		this.oHeaderSelector.setType("Icon");
		this.oHeaderSelector.setIcon("sap-icon://decline");
		this.oHeaderSelector.setTooltip("Test Tooltip");
		assertDOM();
	});

	QUnit.test("Base classes", async function(assert) {
		let oDomRef = this.oHeaderSelector.getDomRef();
		assert.ok(oDomRef.classList.contains("sapUiTableCell"), "sapUiTableCell present when not visible");
		assert.ok(oDomRef.classList.contains("sapUiTableHeaderCell"), "sapUiTableHeaderCell present when not visible");
		assert.ok(oDomRef.classList.contains("sapUiTableRowSelectionHeaderCell"), "sapUiTableRowSelectionHeaderCell present when not visible");

		this.oHeaderSelector.setVisible(true);
		await nextUIUpdate();
		oDomRef = this.oHeaderSelector.getDomRef();
		assert.ok(oDomRef.classList.contains("sapUiTableCell"), "sapUiTableCell present when visible");
		assert.ok(oDomRef.classList.contains("sapUiTableHeaderCell"), "sapUiTableHeaderCell present when visible");
		assert.ok(oDomRef.classList.contains("sapUiTableRowSelectionHeaderCell"), "sapUiTableRowSelectionHeaderCell present when visible");

		this.oHeaderSelector.setEnabled(false);
		await nextUIUpdate();
		oDomRef = this.oHeaderSelector.getDomRef();
		assert.ok(oDomRef.classList.contains("sapUiTableCell"), "sapUiTableCell present when disabled");
		assert.ok(oDomRef.classList.contains("sapUiTableHeaderCell"), "sapUiTableHeaderCell present when disabled");
		assert.ok(oDomRef.classList.contains("sapUiTableRowSelectionHeaderCell"), "sapUiTableRowSelectionHeaderCell present when disabled");
	});

	QUnit.test("tabindex", async function(assert) {
		let oDomRef = this.oHeaderSelector.getDomRef();
		assert.strictEqual(oDomRef.getAttribute("tabindex"), "-1", "tabindex when not visible");

		this.oHeaderSelector.setVisible(true);
		await nextUIUpdate();
		oDomRef = this.oHeaderSelector.getDomRef();
		assert.strictEqual(oDomRef.getAttribute("tabindex"), "-1", "tabindex for checkbox");

		this.oHeaderSelector.setType("Icon");
		await nextUIUpdate();
		oDomRef = this.oHeaderSelector.getDomRef();
		assert.strictEqual(oDomRef.getAttribute("tabindex"), "-1", "tabindex for icon");

		this.oHeaderSelector.setEnabled(false);
		await nextUIUpdate();
		oDomRef = this.oHeaderSelector.getDomRef();
		assert.strictEqual(oDomRef.getAttribute("tabindex"), "-1", "tabindex when disabled");
	});

	QUnit.test("type=checkbox, selected=false, enabled=true", async function(assert) {
		this.oHeaderSelector.setVisible(true);
		await nextUIUpdate();

		const oDomRef = this.oHeaderSelector.getDomRef();

		// Base classes
		assert.ok(oDomRef.classList.contains("sapUiTableCell"), "Has sapUiTableCell class");
		assert.ok(oDomRef.classList.contains("sapUiTableHeaderCell"), "Has sapUiTableHeaderCell class");
		assert.ok(oDomRef.classList.contains("sapUiTableRowSelectionHeaderCell"), "Has sapUiTableRowSelectionHeaderCell class");

		assert.notOk(oDomRef.classList.contains("sapUiTableHeaderSelectorDisabled"), "No sapUiTableHeaderSelectorDisabled class");

		// Default tooltip for checkbox
		assert.ok(oDomRef.getAttribute("title"), TableUtils.getResourceText("TBL_SELECT_ALL"), "Default tooltip");

		// Checkbox child element
		const oCheckbox = oDomRef.querySelector(".sapUiTableCheckBox");
		assert.ok(oCheckbox, "Checkbox div is rendered");
		assert.strictEqual(oCheckbox.tagName, "DIV", "Checkbox is a div element");
		assert.ok(oCheckbox.classList.contains("sapUiTableCheckBox"), "Checkbox has sapUiTableCheckBox class");
		assert.notOk(oCheckbox.classList.contains("sapUiTableCheckBoxSelected"), "Checkbox has no sapUiTableCheckBoxSelected class");

		assert.notOk(oDomRef.querySelector(".sapUiIcon"), "No icon element");
	});

	QUnit.test("type=checkbox, selected=true, enabled=true", async function(assert) {
		this.oHeaderSelector.setVisible(true);
		this.oHeaderSelector.setCheckBoxSelected(true);
		await nextUIUpdate();

		const oDomRef = this.oHeaderSelector.getDomRef();

		// Default tooltip for checkbox
		assert.ok(oDomRef.getAttribute("title"), TableUtils.getResourceText("TBL_DESELECT_ALL"), "Default tooltip");

		// Checkbox child element
		const oCheckbox = oDomRef.querySelector(".sapUiTableCheckBox");
		assert.ok(oCheckbox, "Checkbox div is rendered");
		assert.ok(oCheckbox.classList.contains("sapUiTableCheckBox"), "Has sapUiTableCheckBox class");
		assert.ok(oCheckbox.classList.contains("sapUiTableCheckBoxSelected"), "Has sapUiTableCheckBoxSelected class");
	});

	QUnit.test("type=checkbox, selected=false, enabled=false", async function(assert) {
		this.oHeaderSelector.setVisible(true);
		this.oHeaderSelector.setEnabled(false);
		await nextUIUpdate();

		const oDomRef = this.oHeaderSelector.getDomRef();

		// Disabled class on root
		assert.ok(oDomRef.classList.contains("sapUiTableHeaderSelectorDisabled"), "Has sapUiTableHeaderSelectorDisabled class");

		// Checkbox child element
		const oCheckbox = oDomRef.querySelector(".sapUiTableCheckBox");
		assert.ok(oCheckbox, "Checkbox div is rendered");
		assert.ok(oCheckbox.classList.contains("sapUiTableCheckBox"), "Has sapUiTableCheckBox class");
		assert.notOk(oCheckbox.classList.contains("sapUiTableCheckBoxSelected"), "No sapUiTableCheckBoxSelected class");
	});

	QUnit.test("type=checkbox, selected=true, enabled=false", async function(assert) {
		this.oHeaderSelector.setVisible(true);
		this.oHeaderSelector.setCheckBoxSelected(true);
		this.oHeaderSelector.setEnabled(false);
		await nextUIUpdate();

		const oDomRef = this.oHeaderSelector.getDomRef();

		// Disabled class on root
		assert.ok(oDomRef.classList.contains("sapUiTableHeaderSelectorDisabled"), "Has sapUiTableHeaderSelectorDisabled class");

		// Checkbox child element
		const oCheckbox = oDomRef.querySelector(".sapUiTableCheckBox");
		assert.ok(oCheckbox, "Checkbox div is rendered");
		assert.ok(oCheckbox.classList.contains("sapUiTableCheckBox"), "Has sapUiTableCheckBox class");
		assert.ok(oCheckbox.classList.contains("sapUiTableCheckBoxSelected"), "Has sapUiTableCheckBoxSelected class");
	});

	QUnit.test("type=checkbox with custom tooltip", async function(assert) {
		this.oHeaderSelector.setVisible(true);
		this.oHeaderSelector.setTooltip("My Custom Tooltip");
		await nextUIUpdate();

		const oDomRef = this.oHeaderSelector.getDomRef();
		assert.strictEqual(oDomRef.getAttribute("title"), "My Custom Tooltip", "Custom tooltip is used");
	});

	QUnit.test("type=custom, enabled=true, visible=true with icon", async function(assert) {
		this.oHeaderSelector.setVisible(true);
		this.oHeaderSelector.setType("Icon");
		this.oHeaderSelector.setIcon("sap-icon://decline");
		await nextUIUpdate();

		const oDomRef = this.oHeaderSelector.getDomRef();

		// Base classes only, no checkbox-specific classes
		assert.ok(oDomRef.classList.contains("sapUiTableCell"), "Has sapUiTableCell class");
		assert.ok(oDomRef.classList.contains("sapUiTableHeaderCell"), "Has sapUiTableHeaderCell class");
		assert.ok(oDomRef.classList.contains("sapUiTableRowSelectionHeaderCell"), "Has sapUiTableRowSelectionHeaderCell class");

		assert.notOk(oDomRef.classList.contains("sapUiTableHeaderSelectorDisabled"), "No sapUiTableHeaderSelectorDisabled class");

		// Icon is rendered
		const oIcon = oDomRef.querySelector(".sapUiIcon");
		assert.ok(oIcon, "Icon element is rendered");
		assert.ok(oIcon.classList.contains("sapUiTableHeaderSelectorIcon"), "Icon has sapUiTableHeaderSelectorIcon class");
		assert.ok(!oIcon.hasAttribute("title"), "Icon has no title attribute");

		assert.notOk(oDomRef.querySelector(".sapUiTableCheckBox"), "No checkbox element");
		assert.notOk(oDomRef.hasAttribute("title"), "No title on container");
	});

	QUnit.test("type=custom with icon and tooltip", async function(assert) {
		this.oHeaderSelector.setVisible(true);
		this.oHeaderSelector.setType("Icon");
		this.oHeaderSelector.setIcon("sap-icon://accept");
		this.oHeaderSelector.setTooltip("Clear Selection");
		await nextUIUpdate();

		const oDomRef = this.oHeaderSelector.getDomRef();
		const oIcon = oDomRef.querySelector(".sapUiIcon");

		assert.strictEqual(oDomRef.getAttribute("title"), "Clear Selection", "Container has tooltip");
		assert.ok(!oIcon.hasAttribute("title"), "Icon has no title attribute");
	});

	QUnit.test("type=custom, enabled=false with icon", async function(assert) {
		this.oHeaderSelector.setVisible(true);
		this.oHeaderSelector.setType("Icon");
		this.oHeaderSelector.setIcon("sap-icon://decline");
		this.oHeaderSelector.setEnabled(false);
		await nextUIUpdate();

		const oDomRef = this.oHeaderSelector.getDomRef();

		assert.ok(oDomRef.classList.contains("sapUiTableHeaderSelectorDisabled"), "Has sapUiTableHeaderSelectorDisabled class");

		// Icon still rendered
		const oIcon = oDomRef.querySelector(".sapUiIcon");
		assert.ok(oIcon, "Icon element is rendered");
		assert.ok(oIcon.classList.contains("sapUiTableHeaderSelectorIcon"), "Icon has sapUiTableHeaderSelectorIcon class");
	});

	QUnit.test("type=custom, selected property is ignored", async function(assert) {
		this.oHeaderSelector.setVisible(true);
		this.oHeaderSelector.setType("Icon");
		this.oHeaderSelector.setIcon("sap-icon://decline");
		this.oHeaderSelector.setCheckBoxSelected(true);
		await nextUIUpdate();

		const oDomRef = this.oHeaderSelector.getDomRef();

		// Selected state doesn't affect custom type - no checkbox element rendered
		assert.notOk(oDomRef.querySelector(".sapUiTableCheckBox"), "No checkbox element");
	});

	QUnit.test("Switching from visible=false to visible=true", async function(assert) {
		// Start with visible=false (already in beforeEach)
		let oDomRef = this.oHeaderSelector.getDomRef();
		assert.strictEqual(oDomRef.children.length, 0, "No children when not visible");

		// Switch to visible
		this.oHeaderSelector.setVisible(true);
		await nextUIUpdate();

		oDomRef = this.oHeaderSelector.getDomRef();
		assert.ok(oDomRef.querySelector(".sapUiTableCheckBox"), "Checkbox rendered after becoming visible");
	});

	QUnit.test("Switching from type=checkbox to type=custom", async function(assert) {
		this.oHeaderSelector.setVisible(true);
		await nextUIUpdate();

		let oDomRef = this.oHeaderSelector.getDomRef();
		assert.ok(oDomRef.querySelector(".sapUiTableCheckBox"), "Initially has checkbox");

		this.oHeaderSelector.setType("Icon");
		this.oHeaderSelector.setIcon("sap-icon://decline");
		await nextUIUpdate();

		oDomRef = this.oHeaderSelector.getDomRef();
		assert.notOk(oDomRef.querySelector(".sapUiTableCheckBox"), "No checkbox after switch");
		assert.ok(oDomRef.querySelector(".sapUiIcon"), "Has icon after switch");
	});

	QUnit.test("Switching from type=custom to type=checkbox", async function(assert) {
		this.oHeaderSelector.setVisible(true);
		this.oHeaderSelector.setType("Icon");
		this.oHeaderSelector.setIcon("sap-icon://accept");
		await nextUIUpdate();

		let oDomRef = this.oHeaderSelector.getDomRef();
		assert.ok(oDomRef.querySelector(".sapUiIcon"), "Initially has icon");

		this.oHeaderSelector.setType("CheckBox");
		await nextUIUpdate();

		oDomRef = this.oHeaderSelector.getDomRef();
		assert.ok(oDomRef.querySelector(".sapUiTableCheckBox"), "Has checkbox after switch");
		assert.notOk(oDomRef.querySelector(".sapUiIcon"), "No icon after switch");
	});

	QUnit.module("Accessibility", {
		beforeEach: async function() {
			// ARIA attributes are rendered by the Table's accessibility extension, so we need a Table parent
			this.oTable = new Table();
			this.oHeaderSelector = this.oTable._getHeaderSelector();
			this.oHeaderSelector.setVisible(true);
			this.oTable.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("ARIA role; type=checkbox", async function(assert) {
		await nextUIUpdate();
		assert.strictEqual(this.oHeaderSelector.getDomRef().getAttribute("role"), "checkbox");
	});

	QUnit.test("ARIA role; type=custom", async function(assert) {
		this.oHeaderSelector.setType("Icon");
		await nextUIUpdate();
		assert.strictEqual(this.oHeaderSelector.getDomRef().getAttribute("role"), "button");
	});

	QUnit.test("ARIA checked; type=checkbox", async function(assert) {
		const oDomRef = this.oHeaderSelector.getDomRef();

		await nextUIUpdate();
		assert.strictEqual(oDomRef.getAttribute("aria-checked"), "false", "aria-checked when not selected");

		this.oHeaderSelector.setCheckBoxSelected(true);
		await nextUIUpdate();
		assert.strictEqual(oDomRef.getAttribute("aria-checked"), "true", "aria-checked when selected");
	});

	QUnit.test("ARIA checked; type=custom", async function(assert) {
		const oDomRef = this.oHeaderSelector.getDomRef();

		this.oHeaderSelector.setType("Icon");
		await nextUIUpdate();
		assert.ok(!oDomRef.hasAttribute("aria-checked"), "No aria-checked attribute when not selected");

		this.oHeaderSelector.setCheckBoxSelected(true);
		await nextUIUpdate();
		assert.ok(!oDomRef.hasAttribute("aria-checked"), "No aria-checked attribute when selected");
	});

	QUnit.test("ARIA disabled; type=checkbox", async function(assert) {
		const oDomRef = this.oHeaderSelector.getDomRef();

		assert.strictEqual(oDomRef.getAttribute("aria-disabled"), "false", "aria-disabled when enabled");

		this.oHeaderSelector.setEnabled(false);
		await nextUIUpdate();
		assert.strictEqual(oDomRef.getAttribute("aria-disabled"), "true", "aria-disabled when disabled");
	});

	QUnit.test("ARIA disabled; type=custom", async function(assert) {
		const oDomRef = this.oHeaderSelector.getDomRef();

		this.oHeaderSelector.setType("Icon");
		await nextUIUpdate();
		assert.strictEqual(oDomRef.getAttribute("aria-disabled"), "false", "aria-disabled when enabled");

		this.oHeaderSelector.setEnabled(false);
		await nextUIUpdate();
		assert.strictEqual(oDomRef.getAttribute("aria-disabled"), "true", "aria-disabled when disabled");
	});
});