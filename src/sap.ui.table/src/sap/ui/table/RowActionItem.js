/*!
 * ${copyright}
 */

// Provides control sap.ui.table.RowActionItem.
sap.ui.define([
	"./library",
	"./utils/TableUtils",
	"sap/ui/core/Element",
	"sap/ui/core/Icon",
	"sap/ui/core/IconPool",
	"sap/ui/unified/MenuItem"
], function(
	library,
	TableUtils,
	Element,
	Icon,
	IconPool,
	MenuItem
) {
	"use strict";

	const RowActionType = library.RowActionType;

	/**
	 * Constructor for a new RowActionItem.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * An action items to be displayed in a <code>RowAction</code> control.
	 * This element must only be used in the context of the <code>sap.ui.table.Table</code> control to define row actions.
	 * @extends sap.ui.core.Element
	 *
	 * @author SAP SE
	 * @version ${version}
	 * @since 1.45
	 *
	 * @constructor
	 * @public
	 * @alias sap.ui.table.RowActionItem
	 */
	const Item = Element.extend("sap.ui.table.RowActionItem", /** @lends sap.ui.table.RowActionItem.prototype */ {
		metadata: {
			library: "sap.ui.table",
			properties: {
				/**
				 * The icon of the item.
				 */
				icon: {type: "sap.ui.core.URI", group: "Data", defaultValue: null},

				/**
				 * Whether the item should be visible on the screen.
				 */
				visible: {type: "boolean", group: "Misc", defaultValue: true},

				/**
				 * Determines whether the item is enabled. A disabled item remains visible but cannot be activated
				 * by pointer interaction, keyboard interaction, keyboard shortcuts, or selection in the overflow menu.
				 *
				 * @since 1.155
				 */
				enabled: {type: "boolean", group: "Behavior", defaultValue: true},

				/**
				 * The text of the item. It is used as tooltip and for accessibility purposes.
				 */
				text: {type: "string", group: "Misc", defaultValue: ""},

				/**
				 * The type of the item.
				 * Setting the type ensures default values for the properties <code>icon</code> and <code>text</code>.
				 * If an icon or text is set explicitly this setting is used.
				 */
				type: {type: "sap.ui.table.RowActionType", group: "Behavior", defaultValue: RowActionType.Custom}
			},
			events: {
				/**
				 * The <code>press</code> is fired when the user triggers the corresponding action.
				 */
				press: {
					parameters: {
						/**
						 * The item which was pressed.
						 */
						item: {type: "sap.ui.table.RowActionItem"},
						/**
						 * The table row to which the pressed item belongs to.
						 */
						row: {type: "sap.ui.table.Row"}
					}
				}
			}
		}
	});

	/**
	 * Gets the instance of the row action this control belongs to.
	 *
	 * @returns {sap.ui.table.RowAction|null} Row action instance this control belongs to, or <code>null</code> if not a child of a row action.
	 * @private
	 */
	Item.prototype.getRowAction = function() {
		const oParent = this.getParent();
		return TableUtils.isA(oParent, "sap.ui.table.RowAction") ? oParent : null;
	};

	Item.prototype.setIcon = function(sIcon) {
		this.setProperty("icon", sIcon, true);
		this._updateIcon();
		this._updateOverflowMenuItem();
		return this;
	};

	Item.prototype.setText = function(sText) {
		this.setProperty("text", sText, true);
		this._updateIcon();
		this._updateOverflowMenuItem();
		return this;
	};

	Item.prototype.setEnabled = function(bEnabled) {
		this.setProperty("enabled", bEnabled, true);
		this._updateIcon();
		this._updateOverflowMenuItem();
		return this;
	};

	/**
	 * @inheritDoc
	 */
	Item.prototype.enhanceAccessibilityState = function(oElement, mAriaProps) {
		if (oElement === this._oIcon) {
			mAriaProps.disabled = this.getEnabled() ? null : true;
		}
	};

	/**
	 * Fires the press event of this item with the relevant parameters.
	 *
	 * @private
	 */
	Item.prototype._firePress = function() {
		const oRowAction = this.getRowAction();

		if (!this.getEnabled() || !this.getVisible()
			|| (oRowAction && (!oRowAction.getVisible() || oRowAction._getSize() === 0))) {
			return;
		}

		this.firePress({
			item: this,
			row: oRowAction ? oRowAction.getRow() : null
		});
	};

	/**
	 * Computes which icon should be used for this action item.
	 *
	 * @returns {string} The name of the icon in the icon font.
	 * @private
	 */
	Item.prototype._getIconUri = function() {
		const oIcon = this.getIcon();
		if (oIcon) {
			return oIcon;
		}
		if (this.getType() === RowActionType.Navigation) {
			return IconPool.getIconURI(TableUtils.ThemeParameters.navigationIcon);
		}
		if (this.getType() === RowActionType.Delete) {
			return IconPool.getIconURI(TableUtils.ThemeParameters.deleteIcon);
		}
		return null;
	};

	/**
	 * Returns an icon control which represents this action item.
	 *
	 * @returns {sap.ui.core.Icon} The icon control.
	 * @private
	 */
	Item.prototype._getIcon = function() {
		if (!this._oIcon) {
			this._oIcon = new Icon({
				decorative: false,
				press: [this._firePress, this]
			});
			this.addDependent(this._oIcon);
		}

		this._updateIcon();

		return this._oIcon;
	};

	/**
	 * Updates the existing action icon without creating it.
	 *
	 * @private
	 */
	Item.prototype._updateIcon = function() {
		if (this._oIcon) {
			this._oIcon.setSrc(this._getIconUri());
			this._oIcon.setTooltip(this._getText(true));
			this._oIcon.setNoTabStop(!this.getEnabled());
			this._oIcon.toggleStyleClass("sapUiTableActionItemDisabled", !this.getEnabled());
		}
	};

	/**
	 * Computes which text should be used for this actionitem.
	 *
	 * @param {boolean} bPreferTooltip Whether the tooltip or text is preferred
	 * @returns {string} The item text
	 * @private
	 */
	Item.prototype._getText = function(bPreferTooltip) {
		const sText = bPreferTooltip ? (this.getTooltip_AsString() || this.getText()) : (this.getText() || this.getTooltip_AsString());
		if (sText) {
			return sText;
		}
		if (this.getType() === RowActionType.Navigation) {
			return TableUtils.getResourceText("TBL_ROW_ACTION_NAVIGATE");
		}
		if (this.getType() === RowActionType.Delete) {
			return TableUtils.getResourceText("TBL_ROW_ACTION_DELETE");
		}
		return null;
	};

	/**
	 * Returns a menu item representing this action item.
	 *
	 * @returns {sap.ui.unified.MenuItem} A menu item representing this action item
	 * @private
	 */
	Item.prototype._getOverflowMenuItem = function() {
		this._oMenuItem = new MenuItem({
			select: [this._firePress, this]
		});
		this._updateOverflowMenuItem();
		return this._oMenuItem;
	};

	/**
	 * Updates the existing overflow menu item without creating it.
	 *
	 * @private
	 */
	Item.prototype._updateOverflowMenuItem = function() {
		if (this._oMenuItem && !this._oMenuItem.isDestroyed()) {
			this._oMenuItem.setText(this._getText());
			this._oMenuItem.setIcon(this._getIconUri());
			this._oMenuItem.setEnabled(this.getEnabled());
		}
	};

	/**
	 * Handles a keyboard shortcut
	 *
	 * @param {string} sType type of the shortcut
	 * @private
	 */
	Item.prototype.onKeyboardShortcut = function(sType) {
		if (sType === "navigation" && this.getType() === RowActionType.Navigation) {
			this._firePress();
		}
	};

	return Item;
});