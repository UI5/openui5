sap.ui.define([
    "sap/m/Text",
	"sap/m/Table",
	"sap/m/Column",
	"sap/m/ColumnListItem",
	"sap/ui/table/Table",
	"sap/ui/table/Column",
	"sap/ui/mdc/Table",
	"sap/ui/mdc/table/Column",
	"sap/m/plugins/PluginBase",
	"sap/m/plugins/ContextMenuSetting",
	"sap/ui/model/json/JSONModel",
	"sap/m/List",
	"sap/m/Menu",
	"sap/m/MenuItem",
	"sap/ui/unified/Menu",
	"sap/ui/test/utils/nextUIUpdate",
	"sap/ui/thirdparty/jquery"
], function(Text, Table, Column, ColumnListItem, GridTable, GridColumn, MDCTable, MDCColumn, PluginBase, ContextMenuSetting, JSONModel, List, Menu, MenuItem, UnifiedMenu, nextUIUpdate, jQuery) {

	"use strict";
	/*global QUnit */

	var aData = [];
	for (var i = 0; i < 25; i++) {
		aData.push({
			id: i,
			name: "name" + i,
			color: "color" + (i % 10)
		});
	}

	var oJSONModel = new JSONModel(aData);

	function createResponsiveTable(mSettings) {
		mSettings = Object.assign({
			growing: true,
			growingThreshold: 10,
			mode: "MultiSelect",
			columns: Object.keys(aData[0]).map(function(sKey) {
				return new Column({
					header: new Text({ text: sKey })
				});
			}),
			items: {
				path: "/",
				template: new ColumnListItem({
					cells: Object.keys(aData[0]).map(function(sKey) {
						return new Text({
							text: "{" + sKey + "}"
						});
					})
				})
			},
			models: oJSONModel
		}, mSettings);

		var oTable = new Table(mSettings);
		oTable.placeAt("qunit-fixture");
		return oTable;
	}

	function createGridTable(mSettings) {
		mSettings = Object.assign({
			columns: Object.keys(aData[0]).map(function(sKey) {
				return new GridColumn({
					label: new Text({ text: sKey }),
					template: new Text({ text: "{" + sKey + "}", wrapping: false })
				});
			}),
			rows: { path: "/" },
			models: oJSONModel
		}, mSettings);

		var oTable = new GridTable(mSettings);
		oTable.placeAt("qunit-fixture");
		return oTable;
	}


	QUnit.module("API", {
		beforeEach: async function() {
			this.oTable = createResponsiveTable({
				contextMenu: new Menu({
					items: [
						new MenuItem({text: "Item"})
					]
				})
			});
			await nextUIUpdate();
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("findOn", function(assert) {
		const oSetting = new ContextMenuSetting();
		this.oTable.addDependent(oSetting);
		assert.ok(ContextMenuSetting.findOn(this.oTable) === oSetting, "Plugin found via ContextMenuSetting.findOn");
	});

	QUnit.test("isApplicable", function(assert) {
		const oSetting = new ContextMenuSetting();
		this.oTable.addDependent(oSetting);
		assert.ok(oSetting.isApplicable(), "Plugin is applicable on ResponsiveTable");
		const oList = new List();
		oList.addDependent(oSetting);
		assert.ok(oSetting.isApplicable(), "Plugin is applicable on List");
		const oText = new Text();
		assert.throws(function() {
			oText.addDependent(oSetting);
		}, "Plugin is not applicable on Text");
		const oTable = createGridTable();
		oTable.addDependent(oSetting);
		assert.ok(oSetting.isApplicable(), "Plugin is applicable on GridTable");

		oText.destroy();
		oList.destroy();
		oTable.destroy();
	});

	QUnit.test("Event Handlers", function(assert) {
		const oMenu = this.oTable.getContextMenu();
		const oSetting = new ContextMenuSetting({scope: "Selection"});

		assert.notOk(this.oTable.hasListeners("beforeOpenContextMenu"), "No 'beforeOpenContextMenu' listener before plugin is added");
		this.oTable.addDependent(oSetting);
		assert.ok(this.oTable.hasListeners("beforeOpenContextMenu"), "'beforeOpenContextMenu' listener attached on activate");
		oSetting.setEnabled(false);
		assert.notOk(this.oTable.hasListeners("beforeOpenContextMenu"), "'beforeOpenContextMenu' listener detached on disable");
		oSetting.setEnabled(true);
		assert.ok(this.oTable.hasListeners("beforeOpenContextMenu"), "'beforeOpenContextMenu' listener re-attached on enable");
		this.oTable.removeAllDependents();
		assert.notOk(this.oTable.hasListeners("beforeOpenContextMenu"), "'beforeOpenContextMenu' listener detached on remove");

		// open/closed listeners on sap.m.Menu are attached transiently during beforeOpenContextMenu
		this.oTable.addDependent(oSetting);
		assert.notOk(oMenu.hasListeners("open"), "No 'open' listener before context menu is triggered");
		this.oTable.fireBeforeOpenContextMenu({listItem: this.oTable.getItems()[0]});
		assert.ok(oMenu.hasListeners("open"), "'open' listener attached after beforeOpenContextMenu");
		assert.ok(oMenu.hasListeners("closed"), "'closed' listener attached after beforeOpenContextMenu");
		oMenu.fireOpen();
		assert.notOk(oMenu.hasListeners("open"), "'open' listener detached after menu opened");
		oMenu.fireClosed();
		assert.notOk(oMenu.hasListeners("closed"), "'closed' listener detached after menu closed");

		// when beforeOpenContextMenu is prevented, handlers must not accumulate
		this.oTable.attachBeforeOpenContextMenu(function(oEvent) { oEvent.preventDefault(); });
		this.oTable.fireBeforeOpenContextMenu({listItem: this.oTable.getItems()[0]});
		this.oTable.fireBeforeOpenContextMenu({listItem: this.oTable.getItems()[0]});
		this.oTable.fireBeforeOpenContextMenu({listItem: this.oTable.getItems()[0]});
		assert.equal(oMenu.mEventRegistry["open"]?.length, 1, "Only one 'open' listener after multiple prevented beforeOpenContextMenu events");
		assert.equal(oMenu.mEventRegistry["closed"]?.length, 1, "Only one 'closed' listener after multiple prevented beforeOpenContextMenu events");

		// no listeners attached for non-sap.m.Menu
		this.oTable.setContextMenu(new UnifiedMenu());
		this.oTable.fireBeforeOpenContextMenu({listItem: this.oTable.getItems()[0]});
		assert.notOk(this.oTable.getContextMenu().hasListeners("open"), "No 'open' listener for UnifiedMenu");
	});

	QUnit.module("ResponsiveTable", {
		beforeEach: async function() {
			this.oTable = createResponsiveTable({
				contextMenu: new Menu({
					items: [
						new MenuItem({text: "Item"})
					]
				})
			});

			this.triggerContextMenuOnItem = (assert, iIndex) => {
				const oItem = this.oTable.getItems()[iIndex];
				oItem.focus();
				oItem.$().trigger("contextmenu");
				assert.ok(this.oTable.getContextMenu().isOpen(), "Context menu is open");
				oItem.$().trigger("contextmenu");
				return oItem;
			};

			this.checkNoStyleClassOnItems = (assert) => {
				this.oTable.getItems().forEach((oItem) => {
					assert.notOk(oItem.hasStyleClass("sapMContextMenuSettingContentOpacity"), "Items does not have style class for opacity");
				});
			};

			await nextUIUpdate();
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("Scope Default", function(assert) {
		this.oTable.addDependent(new ContextMenuSetting({scope: "Default"}));
		this.oTable.getItems()[0].setSelected(true);
		this.oTable.getItems()[2].setSelected(true);

		this.triggerContextMenuOnItem(assert, 0);
		this.checkNoStyleClassOnItems(assert);
		this.oTable.getContextMenu().close();
		this.checkNoStyleClassOnItems(assert);
	});

	QUnit.test("Scope Selection", async function(assert) {
		this.oTable.getColumns().forEach(function(oCol) {
			oCol.setDemandPopin(true);
			oCol.setMinScreenWidth("48000px");
		});
		await nextUIUpdate();

		this.oTable.addDependent(new ContextMenuSetting({scope: "Selection"}));
		this.oTable.getItems()[0].setSelected(true);
		this.oTable.getItems()[2].setSelected(true);

		this.triggerContextMenuOnItem(assert, 0);

		this.oTable.getItems().forEach((oListItem) => {
			if (oListItem.getSelected()) {
				assert.notOk(oListItem.hasStyleClass("sapMContextMenuSettingContentOpacity"), "Selected Items does not have style class for opacity");
			} else {
				assert.ok(oListItem.hasStyleClass("sapMContextMenuSettingContentOpacity"), "Not Selected Items have style class for opacity");
			}
		});
		this.oTable.getContextMenu().close();

		this.checkNoStyleClassOnItems(assert);

		const oItem = this.triggerContextMenuOnItem(assert, 1);

		this.oTable.getItems().forEach((oListItem) => {
			if (oListItem.getId() === oItem.getId()) {
				assert.notOk(oListItem.hasStyleClass("sapMContextMenuSettingContentOpacity"), "Clicked Item does not have style class for opacity");
				assert.ok(oListItem.getPopin && (oListItem.getPopin() !== undefined), "Popin exists");
				assert.equal(getComputedStyle(oListItem.getPopin().getDomRef()).opacity, getComputedStyle(oListItem.getDomRef()).opacity, "ListItem and Popin area of selected item do have same opacity");
			} else {
				assert.ok(oListItem.hasStyleClass("sapMContextMenuSettingContentOpacity"), "Other Item have style class for opacity");
				assert.ok(oListItem.getPopin && oListItem.getPopin(), "Popin exists");
				assert.equal(getComputedStyle(oListItem.getPopin().getDomRef()).opacity, getComputedStyle(oListItem.getDomRef()).opacity, "ListItem and Popin area of non-selected item do have same opacity");
			}
		});

		this.oTable.getContextMenu().close();

		this.checkNoStyleClassOnItems(assert);
	});

	QUnit.test("Using other Menu than sap.m.Menu", function(assert) {
		this.oTable.getContextMenu().destroy();
		this.oTable.setContextMenu(new UnifiedMenu());

		this.oTable.addDependent(new ContextMenuSetting({scope: "Selection"}));
		this.oTable.getItems()[0].setSelected(true);
		this.oTable.getItems()[2].setSelected(true);

		this.triggerContextMenuOnItem(assert, 0);
		this.checkNoStyleClassOnItems(assert);
		this.oTable.getContextMenu().close();
		this.checkNoStyleClassOnItems(assert);
		this.triggerContextMenuOnItem(assert, 1);
		this.checkNoStyleClassOnItems(assert);
		this.oTable.getContextMenu().close();
		this.checkNoStyleClassOnItems(assert);
	});


	QUnit.module("GridTable", {
		beforeEach: async function() {
			this.oTable = createGridTable({
				contextMenu: new Menu({
					items: [
						new MenuItem({text: "Item"})
					]
				})
			});

			this.triggerContextMenuOnItem = (assert, iIndex) => {
				const oCell = this.oTable.getRows()[iIndex].getDomRef("col" + iIndex);
				oCell.focus();
				jQuery(oCell).trigger("contextmenu");
				assert.ok(this.oTable.getContextMenu().isOpen(), "Context menu is open");
			};

			this.checkNoStyleClassOnItems = (assert) => {
				this.oTable.getRows().forEach((oRow) => {
					assert.notOk(oRow.getDomRef().classList.value.includes("sapMContextMenuSettingContentOpacity"), "Selected Items do not have style class for opacity");
				});
			};

			await nextUIUpdate();
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("Scope Default", function(assert) {
		this.oTable.addDependent(new ContextMenuSetting({scope: "Default"}));
		this.oTable.addSelectionInterval(0, 0);
		this.oTable.addSelectionInterval(2, 2);

		this.triggerContextMenuOnItem(assert, 0);
		this.checkNoStyleClassOnItems(assert);
		this.oTable.getContextMenu().close();
		this.checkNoStyleClassOnItems(assert);
	});

	QUnit.test("Scope Selection", function(assert) {
		this.oTable.addDependent(new ContextMenuSetting({scope: "Selection"}));
		this.oTable.addSelectionInterval(0, 0);
		this.oTable.addSelectionInterval(2, 2);

		this.triggerContextMenuOnItem(assert, 0);

		this.oTable.getRows().forEach((oRow) => {
			if (this.oTable._getSelectionPlugin().isSelected(oRow)) {
				assert.notOk(oRow.getDomRef().classList.value.includes("sapMContextMenuSettingContentOpacity"), "Selected Items does not have style class for opacity");
			} else {

				assert.ok(oRow.getDomRef().classList.value.includes("sapMContextMenuSettingContentOpacity"), "Not Selected Items have style class for opacity");
			}
		});
		this.oTable.getContextMenu().close();

		this.checkNoStyleClassOnItems(assert);

		this.triggerContextMenuOnItem(assert, 1);

		this.oTable.getRows().forEach((oRow) => {
			if (oRow.getId() === this.oTable.getRows()[1].getId()) {
				assert.notOk(oRow.getDomRef().classList.value.includes("sapMContextMenuSettingContentOpacity"), "Clicked Item does not have style class for opacity");
			} else {
				assert.ok(oRow.getDomRef().classList.value.includes("sapMContextMenuSettingContentOpacity"), "Other Item have style class for opacity");
			}
		});

		this.oTable.getContextMenu().close();

		this.checkNoStyleClassOnItems(assert);
	});

	QUnit.test("Using other Menu than sap.m.Menu", function(assert) {
		this.oTable.getContextMenu().destroy();
		this.oTable.setContextMenu(new UnifiedMenu());

		this.oTable.addDependent(new ContextMenuSetting({scope: "Selection"}));
		this.oTable.addSelectionInterval(0, 0);
		this.oTable.addSelectionInterval(2, 2);

		this.triggerContextMenuOnItem(assert, 0);
		this.checkNoStyleClassOnItems(assert);
		this.oTable.getContextMenu().close();
		this.checkNoStyleClassOnItems(assert);
		this.triggerContextMenuOnItem(assert, 1);
		this.checkNoStyleClassOnItems(assert);
		this.oTable.getContextMenu().close();
		this.checkNoStyleClassOnItems(assert);
	});

});