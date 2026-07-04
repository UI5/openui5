/* global QUnit */

sap.ui.define([
	"sap/ui/mdc/table/TableSettings",
	"sap/m/OverflowToolbarButton",
	"sap/ui/mdc/enums/TableActionPosition",
	"sap/ui/core/theming/Parameters"
], function(
	TableSettings,
	OverflowToolbarButton,
	TableActionPosition,
	ThemeParameters
) {
	"use strict";

	QUnit.module("Factory methods");

	QUnit.test("getToolbarButtonType returns configured value or Ghost fallback", function(assert) {
		const oStub = this.stub(ThemeParameters, "get");
		oStub.withArgs({name: "_sap_ui_mdc_Table_OverflowButtonType"}).returns("Transparent");
		assert.strictEqual(TableSettings.getToolbarButtonType(), "Transparent", "Returns theme-configured button type");

		oStub.withArgs({name: "_sap_ui_mdc_Table_OverflowButtonType"}).returns(undefined);
		assert.strictEqual(TableSettings.getToolbarButtonType(), "Ghost", "Falls back to Ghost when theme parameter is undefined");
	});

	QUnit.test("createSettingsButton creates a configured OverflowToolbarButton", function(assert) {
		const oFakeTable = {getId: () => "fakeTable", isA: () => false};
		const oButton = TableSettings.createSettingsButton("myPrefix", [() => {}, oFakeTable]);

		assert.ok(oButton.isA("sap.m.OverflowToolbarButton"), "Returns an OverflowToolbarButton");
		assert.strictEqual(oButton.getId(), "myPrefix-settings", "Correct id");
		assert.strictEqual(oButton.getIcon(), "sap-icon://action-settings", "Correct icon");
		assert.strictEqual(oButton.getAriaHasPopup(), "Dialog", "Correct aria-haspopup");
		assert.ok(oButton.getText().length > 0, "Text is resolved from resource bundle");
		assert.ok(oButton.getTooltip().length > 0, "Tooltip is resolved from resource bundle");
		const oLayout = oButton.getLayoutData();
		assert.ok(oLayout.isA("sap.ui.mdc.table.ActionLayoutData"), "ActionLayoutData is set as layoutData");
		assert.strictEqual(oLayout.getPosition(), TableActionPosition.PersonalizationActionsSettings, "Correct action position");

		oButton.destroy();
	});

	QUnit.test("createCopyButton delegates to CopyProvider with layoutData and id", function(assert) {
		const oReturnedButton = new OverflowToolbarButton();
		const oCopyProvider = {
			getCopyButton: this.stub().returns(oReturnedButton)
		};

		const oButton = TableSettings.createCopyButton("prefixX", oCopyProvider);

		assert.strictEqual(oButton, oReturnedButton, "Returns the button provided by the CopyProvider");
		assert.ok(oCopyProvider.getCopyButton.calledOnce, "getCopyButton was invoked exactly once");
		const mArgs = oCopyProvider.getCopyButton.firstCall.args[0];
		assert.strictEqual(mArgs.id, "prefixX-copy", "Passes correct id");
		assert.ok(mArgs.layoutData.isA("sap.ui.mdc.table.ActionLayoutData"), "Passes ActionLayoutData");
		assert.strictEqual(mArgs.layoutData.getPosition(), TableActionPosition.ModificationActionsCopy, "Correct action position");
		assert.ok("type" in mArgs, "Passes type binding from _getButtonSettings");

		oReturnedButton.destroy();
	});

	QUnit.test("createPasteButton creates a button with paste provider dependent", async function(assert) {
		const oButton = TableSettings.createPasteButton("prefY");

		assert.ok(oButton.isA("sap.m.OverflowToolbarButton"), "Returns an OverflowToolbarButton");
		assert.strictEqual(oButton.getId(), "prefY-paste", "Correct id");
		const oLayout = oButton.getLayoutData();
		assert.strictEqual(oLayout.getPosition(), TableActionPosition.ModificationActionsPaste, "Correct action position");

		// PasteProvider is loaded asynchronously and attached as a dependent.
		await new Promise((resolve) => {
			sap.ui.require(["sap/m/plugins/PasteProvider"], resolve);
		});
		const aDependents = oButton.getDependents();
		assert.strictEqual(aDependents.length, 1, "One dependent added");
		assert.ok(aDependents[0].isA("sap.m.plugins.PasteProvider"), "Dependent is PasteProvider");
		assert.strictEqual(aDependents[0].getPasteFor(), "prefY-innerTable", "PasteProvider references the inner table");

		oButton.destroy();
	});

	QUnit.test("createExportButton creates a split menu button with two menu items", function(assert) {
		const fnDefault = () => {};
		const fnExportAs = () => {};
		const oFakeTable = {getId: () => "fakeTable"};
		const oMenuBtn = TableSettings.createExportButton("expPref", {
			"default": [fnDefault, oFakeTable],
			exportAs: [fnExportAs, oFakeTable]
		});

		assert.ok(oMenuBtn.isA("sap.m.OverflowToolbarMenuButton"), "Returns an OverflowToolbarMenuButton");
		assert.strictEqual(oMenuBtn.getId(), "expPref-export", "Correct id");
		assert.strictEqual(oMenuBtn.getIcon(), "sap-icon://excel-attachment", "Correct icon");
		assert.strictEqual(oMenuBtn.getButtonMode(), "Split", "Split button mode");
		assert.ok(oMenuBtn.getUseDefaultActionOnly(), "Uses default action only");
		const oMenu = oMenuBtn.getMenu();
		assert.ok(oMenu, "Menu is attached");
		assert.strictEqual(oMenu.getItems().length, 2, "Menu has two items");
		const oLayout = oMenuBtn.getLayoutData();
		assert.strictEqual(oLayout.getPosition(), TableActionPosition.ExportActionsExport, "Correct action position");

		oMenuBtn.destroy();
	});

	QUnit.test("createExpandCollapseButton returns Expand variant when bIsExpand is true", function(assert) {
		const oButton = TableSettings.createExpandCollapseButton("expPref", true, () => {});

		assert.ok(oButton.isA("sap.m.OverflowToolbarButton"), "Returns an OverflowToolbarButton");
		assert.strictEqual(oButton.getId(), "expPref-expandAll", "Correct expand id");
		assert.strictEqual(oButton.getIcon(), "sap-icon://expand-all", "Correct expand icon");
		assert.strictEqual(oButton.getLayoutData().getPosition(), TableActionPosition.PersonalizationActionsExpandAll, "Correct expand position");

		oButton.destroy();
	});

	QUnit.test("createExpandCollapseButton returns Collapse variant when bIsExpand is false", function(assert) {
		const oButton = TableSettings.createExpandCollapseButton("colPref", false, () => {});

		assert.strictEqual(oButton.getId(), "colPref-collapseAll", "Correct collapse id");
		assert.strictEqual(oButton.getIcon(), "sap-icon://collapse-all", "Correct collapse icon");
		assert.strictEqual(oButton.getLayoutData().getPosition(), TableActionPosition.PersonalizationActionsCollapseAll,
			"Correct collapse position");

		oButton.destroy();
	});

	QUnit.test("createExpandCollapseMenuButton returns Expand variant with tree/node menu items", function(assert) {
		const oMenuBtn = TableSettings.createExpandCollapseMenuButton("expMenu", true, {
			tree: () => {},
			node: () => {}
		});

		assert.ok(oMenuBtn.isA("sap.m.OverflowToolbarMenuButton"), "Returns an OverflowToolbarMenuButton");
		assert.strictEqual(oMenuBtn.getId(), "expMenu-expandAll", "Correct expand id");
		assert.strictEqual(oMenuBtn.getIcon(), "sap-icon://expand-all", "Correct expand icon");
		assert.strictEqual(oMenuBtn.getMenu().getItems().length, 2, "Menu has two items");
		assert.strictEqual(oMenuBtn.getLayoutData().getPosition(), TableActionPosition.PersonalizationActionsExpandAll,
			"Correct expand position");

		oMenuBtn.destroy();
	});

	QUnit.test("createExpandCollapseMenuButton returns Collapse variant when bIsExpand is false", function(assert) {
		const oMenuBtn = TableSettings.createExpandCollapseMenuButton("colMenu", false, {
			tree: () => {},
			node: () => {}
		});

		assert.strictEqual(oMenuBtn.getId(), "colMenu-collapseAll", "Correct collapse id");
		assert.strictEqual(oMenuBtn.getIcon(), "sap-icon://collapse-all", "Correct collapse icon");
		assert.strictEqual(oMenuBtn.getLayoutData().getPosition(), TableActionPosition.PersonalizationActionsCollapseAll,
			"Correct collapse position");

		oMenuBtn.destroy();
	});
});