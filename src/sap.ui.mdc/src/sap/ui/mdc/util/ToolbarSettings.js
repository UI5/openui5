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
	"../table/ActionLayoutData"
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
	 * Toolbar button factory shared by sap.ui.mdc.Table and sap.ui.mdc.List.
	 *
	 * @author SAP SE
	 * @private
	 * @since 1.60
	 * @alias sap.ui.mdc.util.ToolbarSettings
	 */
	const ToolbarSettings = {
		getToolbarButtonType,
		/**
		 * @param {string} sIdPrefix ID prefix for the button
		 * @param {Array} aEventInfo Event handler info array
		 * @param {string} sModelName Model name used for the toolbar button type binding
		 */
		createSettingsButton: function(sIdPrefix, aEventInfo, sModelName) {
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
			}, sModelName);

			FESRHelper.setSemanticStepname(oBtn, "press", "mdc:tbl:p13n");

			ShortcutHintsMixin.addConfig(oBtn, {
					addAccessibilityLabel: true,
					shortcut: "Ctrl+,"
				}, aEventInfo[1] // we need the table instance, otherwise the messageBundleKey does not find the resource bundle
			);

			return oBtn;
		},
		createCopyButton: function(sIdPrefix, oCopyProvider) {
			return oCopyProvider.getCopyButton({
				...this._getButtonSettings("$sap.ui.mdc.Table"),
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
			}, "$sap.ui.mdc.Table");

			FESRHelper.setSemanticStepname(oPasteButton, "press", "mdc:tbl:paste");

			sap.ui.require(["sap/m/plugins/PasteProvider"], (PasteProvider) => {
				oPasteButton.addDependent(new PasteProvider({
					pasteFor: sIdPrefix + "-innerTable"
				}));
			});

			return oPasteButton;
		},
		/**
		 * @param {string} sIdPrefix ID prefix for the button
		 * @param {object} mEventInfo Map with <code>default</code> and <code>exportAs</code> press handlers
		 * @param {string} sModelName Model name used for the toolbar button type binding
		 */
		createExportButton: function(sIdPrefix, mEventInfo, sModelName) {
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
			}, sModelName);

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
				shortcut: "Ctrl+Shift+E"
			}, mEventInfo.exportAs[1]); // we need the table instance, otherwise the messageBundleKey does not find the resource bundle

			return oMenuButton;
		},
		createExpandCollapseButton: function(sIdPrefix, bIsExpand, fnPressEvent, sModelName) {
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
			}, sModelName);

			FESRHelper.setSemanticStepname(oButton, "press", "mdc:tbl:" + (bIsExpand ? "expandAll" : "collapseAll"));

			return oButton;
		},
		createExpandCollapseMenuButton: function(sIdPrefix, bIsExpand, mItemEventInfo, sModelName) {
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
			}, sModelName);
			return oMenuButton;
		},
		/**
		 * @param {string} sId Control ID
		 * @param {object} mSettings Settings passed to <code>OverflowToolbarButton</code>
		 * @param {string} sModelName Model name used for the toolbar button type binding
		 */
		_createButton: function(sId, mSettings, sModelName) {
			return new OverflowToolbarButton(sId, {
				...this._getButtonSettings(sModelName),
				...mSettings
			});
		},
		/**
		 * @param {string} sId Control ID
		 * @param {object} mSettings Settings passed to <code>OverflowToolbarMenuButton</code>
		 * @param {string} sModelName Model name used for the toolbar button type binding
		 */
		_createMenuButton: function(sId, mSettings, sModelName) {
			return new OverflowToolbarMenuButton(sId, {
				...this._getButtonSettings(sModelName),
				...mSettings
			});
		},
		_getButtonSettings: function(sModelName) {
			return {type: `{${sModelName}>/@custom/toolbarButtonType}`};
		},
		_loadResourceBundle: function() {
			oRb = Library.getResourceBundleFor("sap.ui.mdc");
		}
	};

	return ToolbarSettings;
});
