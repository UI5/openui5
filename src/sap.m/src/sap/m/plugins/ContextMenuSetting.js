/*
 * ${copyright}
 */
sap.ui.define([
	"./PluginBase",
	"../library"
], function(
	PluginBase,
	library
) {

	"use strict";

    const ContextMenuScope = library.plugins.ContextMenuScope;
    /**
	 * Constructs an instance of sap.m.plugins.ContextMenuSetting
	 *
	 * @class Provides configuration options and an extended behavior for the context menu that is applied to the related control.
	 * @extends sap.ui.core.Element
	 * @author SAP SE
	 * @version ${version}
	 * @public
	 * @since 1.121
	 * @alias sap.m.plugins.ContextMenuSetting
	 * @borrows sap.m.plugins.PluginBase.findOn as findOn
	 */
	const ContextMenuSetting = PluginBase.extend("sap.m.plugins.ContextMenuSetting", {metadata: {
		library: "sap.m",
		properties: {

			/**
			 * Defines the scope of the context menu actions.
			 *
			 * The scope of the context menu is visually represented to the user by providing a clear indication of the affected items.
			 * The visual cues help users understand the potential impact of their actions.
			 *
			 * <b>Note:</b> The scope visualization is only supported if a <code>sap.m.Menu</code> is used as context menu.
			 */
			scope: {type: "sap.m.plugins.ContextMenuScope", group: "Behavior", defaultValue: ContextMenuScope.Default}
		},
		events: {}
    }});

	ContextMenuSetting.findOn = PluginBase.findOn;

	ContextMenuSetting.prototype._onBeforeOpenContextMenu = function(oEvent) {
		if (this.getScope() !== ContextMenuScope.Selection) {
			return;
		}

		const oControl = this.getControl();
		const oMenu = oControl.getAggregation(this.getConfig("contextMenuAggregation"));

		if (!oMenu?.isA("sap.m.Menu")) {
			return;
		}

		// Detach handlers from the previous menu in case it was not opened
		this._oMenuWithHandlers?.detachOpen(this._onMenuOpen, this);
		this._oMenuWithHandlers?.detachClosed(this._onMenuClosed, this);

		this._vActiveItem = this.getConfig("getActiveItem", oControl, oEvent);
		this._bActiveItemSelected = this.getConfig("isItemSelected", oControl, this._vActiveItem);
		this._oMenuWithHandlers = oMenu;
		oMenu.attachEventOnce("open", this._onMenuOpen, this);
		oMenu.attachEventOnce("closed", this._onMenuClosed, this);
	};

	ContextMenuSetting.prototype._onMenuOpen = function() {
		const oControl = this.getControl();
		const aItems = this.getConfig("items", oControl);
		aItems.forEach((oItem) => {
			if (oItem !== this._vActiveItem && !(this._bActiveItemSelected && this.getConfig("isItemSelected", oControl, oItem))) {
				oItem.addStyleClass("sapMContextMenuSettingContentOpacity");
			}
		});
	};

	ContextMenuSetting.prototype._onMenuClosed = function() {
		this._oMenuWithHandlers = null;
		const oControl = this.getControl();
		const aItems = this.getConfig("items", oControl);
		aItems.forEach((oItem) => oItem.removeStyleClass("sapMContextMenuSettingContentOpacity"));
	};

	ContextMenuSetting.prototype.onActivate = function(oControl) {
		this.getConfig("attachBeforeOpenContextMenu", oControl, this._onBeforeOpenContextMenu, this);
	};

	ContextMenuSetting.prototype.onDeactivate = function(oControl) {
		this.getConfig("detachBeforeOpenContextMenu", oControl, this._onBeforeOpenContextMenu, this);
		this._oMenuWithHandlers?.detachOpen(this._onMenuOpen, this);
		this._oMenuWithHandlers?.detachClosed(this._onMenuClosed, this);
		this._oMenuWithHandlers = null;
	};

	/**
	 * Plugin-specific control configurations.
	 */
	PluginBase.setConfigs({
		"sap.m.ListBase": {
			items: function(oList) {
				return oList.getItems();
			},
			isItemSelected: function(oTable, oItem) {
				return oItem.getSelected();
			},
			getActiveItem: function(oList, oEvent) {
				return oEvent.getParameter("listItem");
			},
			attachBeforeOpenContextMenu: function(oControl, fnHandler, oContext) {
				oControl.attachBeforeOpenContextMenu(fnHandler, oContext);
			},
			detachBeforeOpenContextMenu: function(oControl, fnHandler, oContext) {
				oControl.detachBeforeOpenContextMenu(fnHandler, oContext);
			},
			contextMenuAggregation: "contextMenu"
		},
		"sap.ui.table.Table": {
			items: function(oTable) {
				return oTable.getRows();
			},
			isItemSelected: function(oTable, oItem) {
				return oTable._getSelectionPlugin().isSelected(oItem);
			},
			getActiveItem: function(oTable, oEvent) {
				const iRowIndex = oEvent.getParameter("rowIndex");
				return oTable.getRows().find((oRow) => oRow.getIndex() === iRowIndex);
			},
			attachBeforeOpenContextMenu: function(oControl, fnHandler, oContext) {
				oControl.attachBeforeOpenContextMenu(fnHandler, oContext);
			},
			detachBeforeOpenContextMenu: function(oControl, fnHandler, oContext) {
				oControl.detachBeforeOpenContextMenu(fnHandler, oContext);
			},
			contextMenuAggregation: "contextMenu"
		}
	}, ContextMenuSetting);

	return ContextMenuSetting;
});
