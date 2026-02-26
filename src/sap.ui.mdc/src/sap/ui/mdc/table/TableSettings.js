/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/m/OverflowToolbarButton",
	"sap/m/library",
	"sap/m/OverflowToolbarMenuButton",
	"sap/m/Menu",
	"sap/m/MenuItem",
	"sap/ui/core/Lib",
	"sap/ui/core/library",
	"sap/ui/Device",
	"sap/ui/core/ShortcutHintsMixin",
	"sap/ui/core/theming/Parameters",
	"sap/ui/performance/trace/FESRHelper",
	"sap/ui/mdc/enums/TableActionPosition",
	"./ActionLayoutData"
], (
	OverflowToolbarButton,
	MLibrary,
	OverflowToolbarMenuButton,
	Menu,
	MenuItem,
	Library,
	CoreLibrary,
	Device,
	ShortcutHintsMixin,
	ThemeParameters,
	FESRHelper,
	TableActionPosition,
	ActionLayoutData
) => {
	"use strict";

	const {HasPopup} = CoreLibrary.aria;
	let oRb;

	function getToolbarButtonType() {
		return ThemeParameters.get({name: "_sap_ui_mdc_Table_OverflowButtonType"}) || "Ghost";
	}

	/**
	 * P13n/Settings helper class for sap.ui.mdc.Table.
	 *
	 * @author SAP SE
	 * @private
	 * @since 1.60
	 * @alias sap.ui.mdc.table.TableSettings
	 */
	const TableSettings = {
		getToolbarButtonType,
		createSettingsButton: function(sIdPrefix, aEventInfo) {
			if (!oRb) {
				this._loadResourceBundle();
			}
			const oBtn = this._createButton(sIdPrefix + "-settings", {
				icon: "sap-icon://action-settings",
				text: oRb.getText("table.SETTINGS"),
				press: aEventInfo,
				tooltip: oRb.getText("table.SETTINGS"),
				ariaHasPopup: HasPopup.Dialog,
				layoutData: new ActionLayoutData({
					position: TableActionPosition.PersonalizationActionsSettings
				})
			});

			FESRHelper.setSemanticStepname(oBtn, "press", "mdc:tbl:p13n");

			ShortcutHintsMixin.addConfig(oBtn, {
					addAccessibilityLabel: true,
					messageBundleKey: Device.os.macintosh ? "mdc.PERSONALIZATION_SHORTCUT_MAC" : "mdc.PERSONALIZATION_SHORTCUT" // Cmd+, or Ctrl+,
				}, aEventInfo[1] // we need the table instance, otherwise the messageBundleKey does not find the resource bundle
			);

			return oBtn;
		},
		createCopyButton: function(sIdPrefix, oCopyProvider) {
			return oCopyProvider.getCopyButton({
				...this._getButtonSettings(),
				id: sIdPrefix + "-copy",
				layoutData: new ActionLayoutData({
					position: TableActionPosition.ModificationActionsCopy
				})
			});
		},
		createPasteButton: function(sIdPrefix) {
			const oPasteButton = this._createButton(sIdPrefix + "-paste", {
				layoutData: new ActionLayoutData({
					position: TableActionPosition.ModificationActionsPaste
				})
			});

			FESRHelper.setSemanticStepname(oPasteButton, "press", "mdc:tbl:paste");

			sap.ui.require(["sap/m/plugins/PasteProvider"], (PasteProvider) => {
				oPasteButton.addDependent(new PasteProvider({
					pasteFor: sIdPrefix + "-innerTable"
				}));
			});

			return oPasteButton;
		},
		createExportButton: function(sIdPrefix, mEventInfo) {
			if (!oRb) {
				this._loadResourceBundle();
			}
			const oMenuButton = this._createMenuButton(sIdPrefix + "-export", {
				icon: "sap-icon://excel-attachment",
				text: oRb.getText("table.QUICK_EXPORT"),
				tooltip: oRb.getText("table.EXPORT_BUTTON_TEXT"),
				buttonMode: MLibrary.MenuButtonMode.Split,
				useDefaultActionOnly: true,
				defaultAction: mEventInfo.default,
				layoutData: new ActionLayoutData({
					position: TableActionPosition.ExportActionsExport
				})
			});

			const oMenu = new Menu({
				items: [
					new MenuItem({
						text: oRb.getText("table.QUICK_EXPORT"),
						press: mEventInfo.default
					}), new MenuItem({
						text: oRb.getText("table.EXPORT_WITH_SETTINGS"),
						press: mEventInfo.exportAs
					})
				]
			});
			oMenuButton.setMenu(oMenu);

			FESRHelper.setSemanticStepname(oMenuButton, "defaultAction", "OI:QE");
			FESRHelper.setSemanticStepname(oMenu.getItems()[0], "press", "OI:QE");
			FESRHelper.setSemanticStepname(oMenu.getItems()[1], "press", "OI:EXP:SETTINGS");

			ShortcutHintsMixin.addConfig(oMenuButton._getButtonControl(), {
				addAccessibilityLabel: true,
				// Cmd+Shift+E or Ctrl+Shift+E
				messageBundleKey: Device.os.macintosh ? "table.SHORTCUT_EXPORT_TO_EXCEL_MAC" : "table.SHORTCUT_EXPORT_TO_EXCEL"
			}, mEventInfo.exportAs[1]); // we need the table instance, otherwise the messageBundleKey does not find the resource bundle

			return oMenuButton;
		},
		createExpandCollapseButton: function(sIdPrefix, bIsExpand, fnPressEvent) {
			if (!oRb) {
				this._loadResourceBundle();
			}

			const sId = bIsExpand ? sIdPrefix + "-expandAll" : sIdPrefix + "-collapseAll";
			const sText = bIsExpand ? oRb.getText("table.EXPAND_TREE") : oRb.getText("table.COLLAPSE_TREE");
			const oButton = this._createButton(sId, {
				icon: bIsExpand ? "sap-icon://expand-all" : "sap-icon://collapse-all",
				text: sText,
				press: fnPressEvent,
				tooltip: sText,
				layoutData: new ActionLayoutData({
					position: bIsExpand ? TableActionPosition.PersonalizationActionsExpandAll : TableActionPosition.PersonalizationActionsCollapseAll
				})
			});

			FESRHelper.setSemanticStepname(oButton, "press", "mdc:tbl:" + (bIsExpand ? "expandAll" : "collapseAll"));

			return oButton;
		},
		createExpandCollapseMenuButton: function(sIdPrefix, bIsExpand, mItemEventInfo) {
			if (!oRb) {
				this._loadResourceBundle();
			}

			const sId = bIsExpand ? sIdPrefix + "-expandAll" : sIdPrefix + "-collapseAll";
			const sTree = bIsExpand ? oRb.getText("table.EXPAND_TREE") : oRb.getText("table.COLLAPSE_TREE");
			const sNode = bIsExpand ? oRb.getText("table.EXPAND_NODE") : oRb.getText("table.COLLAPSE_NODE");
			const sText = bIsExpand ? oRb.getText("table.EXPAND_MENU_BUTTON_TEXT") : oRb.getText("table.COLLAPSE_MENU_BUTTON_TEXT");
			const oMenuButton = this._createMenuButton(sId, {
				icon: bIsExpand ? "sap-icon://expand-all" : "sap-icon://collapse-all",
				tooltip: sText,
				menu: new Menu({
					items: [
						new MenuItem({text: sTree, press: mItemEventInfo.tree}),
						new MenuItem({text: sNode, press: mItemEventInfo.node})
					]
				}),
				layoutData: new ActionLayoutData({
					position: bIsExpand ? TableActionPosition.PersonalizationActionsExpandAll : TableActionPosition.PersonalizationActionsCollapseAll
				})
			});
			return oMenuButton;
		},
		_createButton: function(sId, mSettings) {
			return new OverflowToolbarButton(sId, {
				...this._getButtonSettings(),
				...mSettings
			});
		},
		_createMenuButton: function(sId, mSettings) {
			return new OverflowToolbarMenuButton(sId, {
				...this._getButtonSettings(),
				...mSettings
			});
		},
		_getButtonSettings: function() {
			return {type: "{$sap.ui.mdc.Table>/@custom/toolbarButtonType}"};
		},
		_loadResourceBundle: function() {
			oRb = Library.getResourceBundleFor("sap.ui.mdc");
		}
	};

	return TableSettings;
});