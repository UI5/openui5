/*!
 * ${copyright}
 */

sap.ui.define([
	"../util/DragDropConfigBase"
], (
	DragDropConfigBase
) => {
	"use strict";

	/**
	 * Constructor for a new DragDropConfig.
	 *
	 * @param {string} [sId] ID for the new DragDropConfig, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new DragDropConfig
	 *
	 * @class
	 * Provides the configuration for the drag-and-drop operations of the rows of the table.
	 *
	 * @extends sap.ui.mdc.util.DragDropConfigBase
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @public
	 * @since 1.119
	 * @alias sap.ui.mdc.table.DragDropConfig
	 */

	/**
	 * @typedef {sap.ui.model.Context|sap.ui.core.Element} sap.ui.mdc.table.DragDropConfig.DragSource
	 * @public
	 */

	/**
	 * This event is fired when a dragged element enters a table row, if the <code>droppable</code> property is set to
	 * <code>true<code>.
	 *
	 * @name sap.ui.mdc.table.DragDropConfig#dragEnter
	 * @event
	 * @param {sap.ui.base.Event} oControlEvent
	 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
	 * @param {object} oControlEvent.getParameters
	 * @param {sap.ui.model.Context} oControlEvent.getParameters.bindingContext
	 *   The binding context of the row on which the dragged element will be dropped
	 * @param {sap.ui.mdc.table.DragDropConfig.DragSource} oControlEvent.getParameters.dragSource
	 *   The binding context of the dragged row or the dragged control itself
	 * @param {sap.ui.core.dnd.RelativeDropPosition} oControlEvent.getParameters.dropPosition
	 *   The calculated position of the drop action relative to the row being dropped
	 * @param {DragEvent} oControlEvent.getParameters.browserEvent The underlying browser event
	 * @public
	 */

	/**
	 * This event is fired when an element is being dragged over a table row, if the <code>droppable</code> property is set to
	 * <code>true<code>.
	 *
	 * @name sap.ui.mdc.table.DragDropConfig#dragOver
	 * @event
	 * @param {sap.ui.base.Event} oControlEvent
	 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
	 * @param {object} oControlEvent.getParameters
	 * @param {sap.ui.model.Context} oControlEvent.getParameters.bindingContext
	 *   The binding context of the row on which the dragged element will be dropped
	 * @param {sap.ui.mdc.table.DragDropConfig.DragSource} oControlEvent.getParameters.dragSource
	 *   The binding context of the dragged row or the dragged control itself
	 * @param {sap.ui.core.dnd.RelativeDropPosition} oControlEvent.getParameters.dropPosition
	 *   The calculated position of the drop action relative to the row being dropped
	 * @param {DragEvent} oControlEvent.getParameters.browserEvent The underlying browser event
	 * @public
	 */

	/**
	 * This event is fired when an element is dropped on a table row, if the <code>droppable</code> property is set to
	 * <code>true<code>.
	 *
	 * @name sap.ui.mdc.table.DragDropConfig#drop
	 * @event
	 * @param {sap.ui.base.Event} oControlEvent
	 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
	 * @param {object} oControlEvent.getParameters
	 * @param {sap.ui.model.Context} oControlEvent.getParameters.bindingContext
	 *   The binding context of the row on which the dragged element is dropped
	 * @param {sap.ui.mdc.table.DragDropConfig.DragSource} oControlEvent.getParameters.dragSource
	 *   The binding context of the dragged row or the dragged control itself
	 * @param {sap.ui.core.dnd.RelativeDropPosition} oControlEvent.getParameters.dropPosition
	 *   The calculated position of the drop action relative to the dropped row
	 * @param {DragEvent} oControlEvent.getParameters.browserEvent The underlying browser event
	 * @public
	 */

	const DragDropConfig = DragDropConfigBase.extend("sap.ui.mdc.table.DragDropConfig", /** @lends sap.ui.mdc.table.DragDropConfig.prototype */ {
		metadata: {
			library: "sap.ui.mdc"
		}
	});

	/**
	 * Returns the aggregation name used for rows/items in the inner table.
	 *
	 * For <code>sap.m.Table</code> the aggregation is <code>"items"</code>;
	 * for <code>sap.ui.table.Table</code> it is <code>"rows"</code>.
	 *
	 * @returns {string} The aggregation name
	 * @private
	 */
	DragDropConfig.prototype._getItemsAggregationName = function() {
		return this._oInnerControl?.isA("sap.m.Table") ? "items" : "rows";
	};

	/**
	 * Returns the binding context used for the given inner control item/row.
	 *
	 * Handles both <code>sap.m.ListItemBase</code> (<code>"items"</code> aggregation)
	 * and <code>sap.ui.table.Row</code> (<code>"rows"</code> aggregation).
	 *
	 * @param {sap.m.ListItemBase|sap.ui.table.Row} oControl The inner row/item control
	 * @returns {sap.ui.model.Context|undefined} The binding context, or undefined
	 * @private
	 */
	DragDropConfig.prototype._getItemBindingContext = function(oControl) {
		const sAggregation = oControl.isA("sap.m.ListItemBase") ? "items" : "rows";
		const oBindingInfo = oControl.getParent().getBindingInfo(sAggregation) || {};
		return oControl.getBindingContext(oBindingInfo.model);
	};

	/**
	 * Returns the drag source from a drag session.
	 *
	 * Handles <code>sap.m.ListItemBase</code> (binding context via items aggregation),
	 * <code>sap.ui.table.Row</code> (binding context via complex data), and external controls.
	 *
	 * @param {sap.ui.core.dnd.DragSession} oDragSession The drag session
	 * @returns {sap.ui.model.Context|sap.ui.core.Element} The drag source
	 * @private
	 */
	DragDropConfig.prototype._getDragSource = function(oDragSession) {
		let oDragSource;
		const oDragControl = oDragSession.getDragControl();
		if (oDragControl?.isA("sap.m.ListItemBase")) {
			oDragSource = this._getItemBindingContext(oDragControl);
		} else if (oDragControl?.isA("sap.ui.table.Row")) {
			oDragSource = oDragSession.getComplexData("sap.ui.table-" + oDragControl.getParent().getId()).draggedRowContext;
		}
		return oDragSource || oDragControl;
	};

	return DragDropConfig;
});
