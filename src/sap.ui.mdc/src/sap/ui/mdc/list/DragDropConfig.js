/*!
 * ${copyright}
 */

sap.ui.define([
	"../util/DragDropConfigBase",
	"sap/ui/core/dnd/DropInfo"
], (
	DragDropConfigBase,
	DropInfo
) => {
	"use strict";

	/**
	 * @typedef {sap.ui.model.Context|sap.ui.core.Element} sap.ui.mdc.list.DragDropConfig.DragSource
	 * @public
	 */

	/**
	 * This event is fired when a dragged element enters a list item, if the <code>droppable</code>
	 * property is set to <code>true</code>.
	 *
	 * @name sap.ui.mdc.list.DragDropConfig#dragEnter
	 * @event
	 * @param {sap.ui.base.Event} oControlEvent
	 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
	 * @param {object} oControlEvent.getParameters
	 * @param {sap.ui.model.Context} oControlEvent.getParameters.bindingContext
	 *   The binding context of the item on which the dragged element will be dropped
	 * @param {sap.ui.mdc.list.DragDropConfig.DragSource} oControlEvent.getParameters.dragSource
	 *   The binding context of the dragged item or the dragged control itself
	 * @param {sap.ui.core.dnd.RelativeDropPosition} oControlEvent.getParameters.dropPosition
	 *   The calculated position of the drop action relative to the item being dropped
	 * @param {DragEvent} oControlEvent.getParameters.browserEvent The underlying browser event
	 * @public
	 */

	/**
	 * This event is fired when an element is being dragged over a list item, if the
	 * <code>droppable</code> property is set to <code>true</code>.
	 *
	 * @name sap.ui.mdc.list.DragDropConfig#dragOver
	 * @event
	 * @param {sap.ui.base.Event} oControlEvent
	 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
	 * @param {object} oControlEvent.getParameters
	 * @param {sap.ui.model.Context} oControlEvent.getParameters.bindingContext
	 *   The binding context of the item on which the dragged element will be dropped
	 * @param {sap.ui.mdc.list.DragDropConfig.DragSource} oControlEvent.getParameters.dragSource
	 *   The binding context of the dragged item or the dragged control itself
	 * @param {sap.ui.core.dnd.RelativeDropPosition} oControlEvent.getParameters.dropPosition
	 *   The calculated position of the drop action relative to the item being dropped
	 * @param {DragEvent} oControlEvent.getParameters.browserEvent The underlying browser event
	 * @public
	 */

	/**
	 * This event is fired when an element is dropped on a list item, if the <code>droppable</code>
	 * property is set to <code>true</code>.
	 *
	 * @name sap.ui.mdc.list.DragDropConfig#drop
	 * @event
	 * @param {sap.ui.base.Event} oControlEvent
	 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
	 * @param {object} oControlEvent.getParameters
	 * @param {sap.ui.model.Context} oControlEvent.getParameters.bindingContext
	 *   The binding context of the item on which the dragged element is dropped
	 * @param {sap.ui.mdc.list.DragDropConfig.DragSource} oControlEvent.getParameters.dragSource
	 *   The binding context of the dragged item or the dragged control itself
	 * @param {sap.ui.core.dnd.RelativeDropPosition} oControlEvent.getParameters.dropPosition
	 *   The calculated position of the drop action relative to the dropped item
	 * @param {DragEvent} oControlEvent.getParameters.browserEvent The underlying browser event
	 * @public
	 */

	/**
	 * Constructor for a new DragDropConfig.
	 *
	 * @param {string} [sId] ID for the new DragDropConfig, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new DragDropConfig
	 *
	 * @class
	 * Provides the configuration for the drag-and-drop operations of the items of the list.
	 *
	 * @extends sap.ui.mdc.util.DragDropConfigBase
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @public
	 * @since 1.153
	 * @alias sap.ui.mdc.list.DragDropConfig
	 */
	const DragDropConfig = DragDropConfigBase.extend("sap.ui.mdc.list.DragDropConfig", {
		metadata: {
			library: "sap.ui.mdc"
		}
	});

	/**
	 * Returns the items aggregation name used by the inner list.
	 *
	 * @returns {string} Always <code>"items"</code>
	 * @private
	 */
	DragDropConfig.prototype._getItemsAggregationName = function() {
		return "items";
	};

	/**
	 * Checks whether the inner control is of a given type.
	 *
	 * @param {string} sType The short type name (e.g. <code>"GridList"</code>)
	 * @returns {boolean} Whether the inner control matches the given type
	 * @private
	 */
	DragDropConfig.prototype._isOfType = function(sType) {
		return !!this.getParent()?._isOfType(sType, true);
	};

	/**
	 * Creates a <code>GridDropInfo</code> for <code>sap.f.GridList</code> inner controls to provide
	 * grid-aware drop indicators, or falls back to the default <code>DropInfo</code>.
	 *
	 * @override
	 * @private
	 */
	DragDropConfig.prototype._addDropInfo = function() {
		if (!this._oInnerControl || this._oDropInfo || !this.getDroppable()) {
			return;
		}

		if (this._isOfType("GridList")) {
			sap.ui.require(["sap/f/dnd/GridDropInfo"], (GridDropInfo) => {
				if (!this._oInnerControl || this._oDropInfo || !this.getDroppable()) {
					return;
				}

				this._oDropInfo = new GridDropInfo({
					enabled: this.getEnabled(),
					groupName: this.getGroupName(),
					dropEffect: this.getDropEffect(),
					dropPosition: this.getDropPosition(),
					dropLayout: "Horizontal",
					keyboardHandling: this.getKeyboardHandling(),
					targetAggregation: this._getItemsAggregationName(),
					dragEnter: [this._onDropInfoEvent, this],
					dragOver: [this._onDropInfoEvent, this],
					drop: [this._onDropInfoEvent, this]
				});
				this._oInnerControl.addDragDropConfig(this._oDropInfo);
			});
		} else {
			this._oDropInfo = new DropInfo({
				enabled: this.getEnabled(),
				groupName: this.getGroupName(),
				dropEffect: this.getDropEffect(),
				dropPosition: this.getDropPosition(),
				keyboardHandling: this.getKeyboardHandling(),
				targetAggregation: this._getItemsAggregationName(),
				dragEnter: [this._onDropInfoEvent, this],
				dragOver: [this._onDropInfoEvent, this],
				drop: [this._onDropInfoEvent, this]
			});
			this._oInnerControl.addDragDropConfig(this._oDropInfo);
		}
	};

	return DragDropConfig;
});
