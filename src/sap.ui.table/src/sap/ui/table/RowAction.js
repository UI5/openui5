/*!
 * ${copyright}
 */

// Provides control sap.ui.table.RowAction
sap.ui.define([
	"./utils/TableUtils",
	"./RowActionRenderer",
	"sap/ui/core/Control",
	"sap/ui/core/Icon",
	"sap/ui/core/IconPool",
	"sap/ui/core/Popup",
	"sap/ui/unified/Menu"
], function(
	TableUtils,
	RowActionRenderer,
	Control,
	Icon,
	IconPool,
	Popup,
	Menu
) {
	"use strict";

	/**
	 * Constructor for a new RowAction.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * The <code>RowAction</code> control allows to display multiple action items which can be selected by the user.
	 * If more action items are available as the available space allows to display an overflow mechanism is provided.
	 * This control must only be used in the context of the <code>sap.ui.table.Table</code> control to define row actions.
	 *
	 * <b>Note</b>: The <code>RowActionItem</code> of type <code>Navigation</code> has a special role and is shown as the rightmost icon independent
	 * of the order in the <code>items</code> aggregation.
	 *
	 * @extends sap.ui.core.Control
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.45
	 * @alias sap.ui.table.RowAction
	 */
	const RowAction = Control.extend("sap.ui.table.RowAction", /** @lends sap.ui.table.RowAction.prototype */ {
		metadata: {
			library: "sap.ui.table",
			properties: {
				/**
				 * Whether the control should be visible on the screen. If set to <code>false</code>, the control is hidden.
				 */
				visible: {type: "boolean", group: "Misc", defaultValue: true}
			},
			defaultAggregation: "items",
			aggregations: {
				/**
				 * The action items which should be displayed.
				 */
				items: {type: "sap.ui.table.RowActionItem", multiple: true}
			},
			events: {}
		},
		renderer: RowActionRenderer
	});

	/*
	 * @override
	 * @inheritDoc
	 */
	RowAction.prototype.getAccessibilityInfo = function() {
		const oRow = this.getRow();
		const iVisibleItems = this._getVisibleItems().length;
		const iSize = this._getSize();
		const bActive = this.getVisible() && iVisibleItems > 0 && iSize > 0
					  && (!oRow || (!oRow.isContentHidden() && !oRow.isGroupHeader() && !oRow.isSummary()));
		let sText;

		if (bActive) {
			sText = TableUtils.getResourceText(iVisibleItems === 1
											   ? "TBL_ROW_ACTION_SINGLE_ACTION"
											   : "TBL_ROW_ACTION_MULTIPLE_ACTION", [iVisibleItems]);
		} else {
			sText = TableUtils.getResourceText("TBL_ROW_ACTION_NO_ACTION");
		}

		return {
			focusable: bActive,
			enabled: bActive,
			description: sText
		};
	};

	/**
	 * Gets the visible items. Only takes into account the visibility of the items, not whether, for example, the content of the row is hidden.
	 *
	 * @returns {sap.ui.table.RowActionItem[]} Returns the visible items.
	 * @private
	 */
	RowAction.prototype._getVisibleItems = function() {
		return this.getItems().filter(function(oItem) {
			return oItem.getVisible();
		});
	};

	/**
	 * Gets the instance of the row this control belongs to.
	 *
	 * @returns {sap.ui.table.Row|null} Row instance this control belongs to, or <code>null</code> if not a child of a row.
	 * @private
	 */
	RowAction.prototype.getRow = function() {
		const oParent = this.getParent();
		return TableUtils.isA(oParent, "sap.ui.table.Row") ? oParent : null;
	};

	/**
	 * Returns the size indicating the number of icons that can be displayed.
	 *
	 * @returns {int} The number of icons.
	 * @private
	 */
	RowAction.prototype._getSize = function() {
		const oRow = this.getRow();
		const oTable = oRow ? oRow.getTable() : null;

		return oTable ? oTable.getRowActionCount() : 3;
	};

	/**
	 * Returns an overflow icon which opens a menu containing the overflowing items.
	 *
	 * @param {sap.ui.table.RowActionItem[]} aItems The visible action items (excluding navigation items)
	 * @param {sap.ui.table.RowActionItem[]} aNavigationItems The visible navigation action items
	 * @param {int} iItemsBeforeOverflow The number of items which are displayed before the overflow
	 *
	 * @returns {sap.ui.core.Icon} The overflow icon.
	 * @private
	 */
	RowAction.prototype._getOverflowIcon = function(aItems, aNavigationItems, iItemsBeforeOverflow) {
		if (!this._oOverflowIcon) {
			this._oOverflowIcon = new Icon({
				src: IconPool.getIconURI("overflow"),
				decorative: false
			}).addStyleClass("sapUiTableActionIcon");

			this._oOverflowIcon.addDelegate({
				onAfterRendering: function() {
					this._oOverflowIcon.getDomRef().setAttribute("aria-haspopup", "Menu");
				}
			}, this);
			this.addDependent(this._oOverflowIcon);
		} else {
			this._oOverflowIcon.detachPress(fnPress, this);
		}

		this._oOverflowIcon.attachPress({aItems, aNavigationItems, iItemsBeforeOverflow}, fnPress, this);

		return this._oOverflowIcon;
	};

	function fnPress(oEvent, mParameters) {
		const aItems = mParameters.aItems;
		const aNavigationItems = mParameters.aNavigationItems;
		const iItemsBeforeOverflow = mParameters.iItemsBeforeOverflow;
		const oTable = this.getRow().getTable();

		if (!oTable._oRowActionOverflowMenu) {
			oTable._oRowActionOverflowMenu = new Menu();
			oTable.addAggregation("_hiddenDependents", oTable._oRowActionOverflowMenu);
		} else {
			oTable._oRowActionOverflowMenu.removeAllItems();
		}

		for (let i = iItemsBeforeOverflow; i < aItems.length; i++) {
			oTable._oRowActionOverflowMenu.addItem(aItems[i]._getOverflowMenuItem());
		}

		if (aNavigationItems.length >= this._getSize()) {
			for (let i = 0; i < aNavigationItems.length - this._getSize(); i++) {
				oTable._oRowActionOverflowMenu.addItem(aNavigationItems[i]._getOverflowMenuItem());
			}
		}

		oTable._oRowActionOverflowMenu.open(true, oEvent.getSource(), Popup.Dock.CenterTop, Popup.Dock.CenterBottom, oEvent.getSource().getDomRef());
	}

	return RowAction;
});