/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/dnd/DragDropBase",
	"sap/ui/core/dnd/DragInfo",
	"sap/ui/core/dnd/DropInfo",
	"sap/ui/base/ManagedObjectObserver"
], (
	DragDropBase,
	DragInfo,
	DropInfo,
	ManagedObjectObserver
) => {
	"use strict";

	/**
	 * Constructor for a new <code>DragDropConfigBase</code>.
	 *
	 * Provides the shared drag-and-drop infrastructure for <code>sap.ui.mdc.list.DragDropConfig</code>
	 * and <code>sap.ui.mdc.table.DragDropConfig</code>. Not intended for direct use by applications.
	 *
	 * @param {string} [sId] ID for the new object, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new object
	 *
	 * @class
	 * Abstract base class for drag-and-drop configuration of MDC controls that wrap an inner control
	 * behind a hidden <code>_content</code> aggregation.
	 *
	 * Subclasses must implement {@link #_getItemsAggregationName} and {@link #_getDragSource}.
	 *
	 * @extends sap.ui.core.dnd.DragDropBase
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @abstract
	 * @public
	 * @since 1.153
	 * @alias sap.ui.mdc.util.DragDropConfigBase
	 */
	const DragDropConfigBase = DragDropBase.extend("sap.ui.mdc.util.DragDropConfigBase", {
		metadata: {
			library: "sap.ui.mdc",
			"abstract": true,
			properties: {
				/**
				 * Determines whether the items are draggable.
				 *
				 * <b>Note:</b> Setting this property to <code>true</code> may expose the items in other
				 * <code>DropInfo</code> event parameters. In this case, only the binding context of the item is allowed
				 * to be used. Internal controls and their types are subject to change without notice.
				 */
				draggable: {type: "boolean", defaultValue: false},

				/**
				 * Determines whether the items are droppable.
				 */
				droppable: {type: "boolean", defaultValue: false},

				/**
				 * Defines the visual drop effect.
				 */
				dropEffect: {type: "sap.ui.core.dnd.DropEffect", defaultValue: "Move"},

				/**
				 * Defines the position for the drop action, visualized by a rectangle.
				 */
				dropPosition: {type: "sap.ui.core.dnd.DropPosition", defaultValue: "On"}
			},
			events: {
				/**
				 * This event is fired when the user starts dragging an item, if the <code>draggable</code>
				 * property is set to <code>true</code>.
				 */
				dragStart: {
					allowPreventDefault: true,
					parameters: {
						/**
						 * The binding context of the dragged item
						 */
						bindingContext: {type: "sap.ui.model.Context"},

						/**
						 * The underlying browser event
						 */
						browserEvent: {type: "DragEvent"}
					}
				},

				/**
				 * This event is fired when the drag operation is ended, if the <code>draggable</code>
				 * property is set to <code>true</code>.
				 */
				dragEnd: {
					parameters: {
						/**
						 * The binding context of the dragged item
						 */
						bindingContext: {type: "sap.ui.model.Context"},

						/**
						 * The underlying browser event
						 */
						browserEvent: {type: "DragEvent"}
					}
				},

				/**
				 * This event is fired when a dragged element enters an item, if the <code>droppable</code>
				 * property is set to <code>true</code>.
				 */
				dragEnter: {
					allowPreventDefault: true
				},

				/**
				 * This event is fired when an element is being dragged over an item, if the
				 * <code>droppable</code> property is set to <code>true</code>.
				 */
				dragOver: {
					allowPreventDefault: true
				},

				/**
				 * This event is fired when an element is dropped on an item, if the <code>droppable</code>
				 * property is set to <code>true</code>.
				 */
				drop: {}
			}
		}
	});

	// --- Lifecycle ---

	DragDropConfigBase.prototype.init = function() {
		this._oObserver = new ManagedObjectObserver(this._observeChanges.bind(this));
	};

	DragDropConfigBase.prototype.exit = function() {
		this._oObserver.destroy();
		this._oObserver = null;
	};

	// --- Property setters with suppressed invalidation ---

	DragDropConfigBase.prototype.setDraggable = function(bDraggable) {
		this.setProperty("draggable", bDraggable, true);
		if (this.getDraggable()) {
			this._addDragInfo();
		} else {
			this._removeDragInfo();
		}
		return this;
	};

	DragDropConfigBase.prototype.setDroppable = function(bDroppable) {
		this.setProperty("droppable", bDroppable, true);
		if (this.getDroppable()) {
			this._addDropInfo();
		} else {
			this._removeDropInfo();
		}
		return this;
	};

	DragDropConfigBase.prototype.setEnabled = function(bEnabled) {
		this.setProperty("enabled", bEnabled, true);
		this._oDragInfo?.setEnabled(bEnabled);
		this._oDropInfo?.setEnabled(bEnabled);
		return this;
	};

	DragDropConfigBase.prototype.setGroupName = function(sGroupName) {
		this.setProperty("groupName", sGroupName, true);
		this._oDragInfo?.setGroupName(sGroupName);
		this._oDropInfo?.setGroupName(sGroupName);
		return this;
	};

	DragDropConfigBase.prototype.setKeyboardHandling = function(bKeyboardHandling) {
		this.setProperty("keyboardHandling", bKeyboardHandling, true);
		this._oDragInfo?.setKeyboardHandling(bKeyboardHandling);
		this._oDropInfo?.setKeyboardHandling(bKeyboardHandling);
		return this;
	};

	DragDropConfigBase.prototype.setDropEffect = function(sDropEffect) {
		this.setProperty("dropEffect", sDropEffect, true);
		this._oDropInfo?.setDropEffect(sDropEffect);
		return this;
	};

	DragDropConfigBase.prototype.setDropPosition = function(sDropPosition) {
		this.setProperty("dropPosition", sDropPosition, true);
		this._oDropInfo?.setDropPosition(sDropPosition);
		return this;
	};

	// --- Parent/inner control connection ---

	DragDropConfigBase.prototype.setParent = function() {
		const oOldParent = this.getParent();
		if (oOldParent) {
			this._disconnectFromParent(oOldParent);
		}

		DragDropBase.prototype.setParent.apply(this, arguments);

		const oNewParent = this.getParent();
		if (oNewParent) {
			this._connectToParent(oNewParent);
		}
	};

	DragDropConfigBase.prototype._connectToParent = function(oMDCControl) {
		this._oObserver.observe(oMDCControl, {aggregations: ["_content"]});

		const oInnerControl = oMDCControl.getAggregation("_content");
		if (oInnerControl) {
			this._connectToInnerControl(oInnerControl);
		}
	};

	DragDropConfigBase.prototype._disconnectFromParent = function(oMDCControl) {
		this._oObserver?.unobserve(oMDCControl, {aggregations: ["_content"]});
		this._disconnectFromInnerControl();
	};

	DragDropConfigBase.prototype._observeChanges = function(mChange) {
		if (mChange.mutation === "insert") {
			this._connectToInnerControl(mChange.child);
		} else {
			this._disconnectFromInnerControl();
		}
	};

	DragDropConfigBase.prototype._connectToInnerControl = function(oInnerControl) {
		this._oInnerControl = oInnerControl;
		this._addDragInfo();
		this._addDropInfo();
	};

	DragDropConfigBase.prototype._disconnectFromInnerControl = function() {
		this._removeDragInfo();
		this._removeDropInfo();
		this._oInnerControl = null;
	};

	// --- DragInfo / DropInfo management ---

	DragDropConfigBase.prototype._addDragInfo = function() {
		if (this._oInnerControl && !this._oDragInfo && this.getDraggable()) {
			this._oDragInfo = new DragInfo({
				enabled: this.getEnabled(),
				groupName: this.getGroupName(),
				keyboardHandling: this.getKeyboardHandling(),
				sourceAggregation: this._getItemsAggregationName(),
				dragStart: [this._onDragInfoEvent, this],
				dragEnd: [this._onDragInfoEvent, this]
			});
			this._oInnerControl.addDragDropConfig(this._oDragInfo);
		}
	};

	DragDropConfigBase.prototype._removeDragInfo = function() {
		if (this._oInnerControl && this._oDragInfo) {
			this._oInnerControl.removeDragDropConfig(this._oDragInfo);
			this._oDragInfo.destroy();
			this._oDragInfo = null;
		}
	};

	DragDropConfigBase.prototype._addDropInfo = function() {
		if (this._oInnerControl && !this._oDropInfo && this.getDroppable()) {
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

	DragDropConfigBase.prototype._removeDropInfo = function() {
		if (this._oInnerControl && this._oDropInfo) {
			this._oInnerControl.removeDragDropConfig(this._oDropInfo);
			this._oDropInfo.destroy();
			this._oDropInfo = null;
		}
	};

	// --- Event handling ---

	DragDropConfigBase.prototype._onDragInfoEvent = function(oEvent) {
		const oDragSession = oEvent.getParameter("dragSession");
		const bAllowPreventDefault = (oEvent.getId() === "dragStart");
		const mEventParameters = {
			bindingContext: this._getDragSource(oDragSession),
			browserEvent: oEvent.getParameter("browserEvent")
		};

		const bEventResult = this.fireEvent(oEvent.getId(), mEventParameters, bAllowPreventDefault);
		if (bAllowPreventDefault && !bEventResult) {
			oEvent.preventDefault();
		}
	};

	DragDropConfigBase.prototype._onDropInfoEvent = function(oEvent) {
		const oDragSession = oEvent.getParameter("dragSession");
		const oDropControl = oDragSession.getDropControl();
		const sDropPosition = oEvent.getParameter("dropPosition");
		const bAllowPreventDefault = oEvent.getId().startsWith("drag");
		const mEventParameters = {
			bindingContext: this._getItemBindingContext(oDropControl),
			dragSource: this._getDragSource(oDragSession),
			browserEvent: oEvent.getParameter("browserEvent")
		};

		if (sDropPosition) {
			mEventParameters.dropPosition = sDropPosition;
		}

		const bEventResult = this.fireEvent(oEvent.getId(), mEventParameters, bAllowPreventDefault);
		if (bAllowPreventDefault && !bEventResult) {
			oEvent.preventDefault();
		}
	};

	// --- Template methods (must be implemented by subclasses) ---

	/**
	 * Returns the aggregation name used for items/rows in the inner control.
	 *
	 * @returns {string} The aggregation name (for example, <code>"items"</code> or <code>"rows"</code>)
	 * @private
	 * @abstract
	 */
	DragDropConfigBase.prototype._getItemsAggregationName = function() {
		throw new Error(this + " does not implement #_getItemsAggregationName");
	};

	/**
	 * Returns the binding context of an inner control item for use in event parameters.
	 *
	 * @param {sap.ui.core.Element} oControl The inner item/row control
	 * @returns {sap.ui.model.Context|undefined} The binding context, or undefined
	 * @private
	 */
	DragDropConfigBase.prototype._getItemBindingContext = function(oControl) {
		const sAggregation = this._getItemsAggregationName();
		const oBindingInfo = oControl.getParent().getBindingInfo(sAggregation) || {};
		return oControl.getBindingContext(oBindingInfo.model);
	};

	/**
	 * Returns the drag source from a drag session. Subclasses may override this to handle
	 * additional control types (for example, <code>sap.ui.table.Row</code>).
	 *
	 * @param {sap.ui.core.dnd.DragSession} oDragSession The drag session
	 * @returns {sap.ui.model.Context|sap.ui.core.Element} The drag source
	 * @private
	 */
	DragDropConfigBase.prototype._getDragSource = function(oDragSession) {
		const oDragControl = oDragSession.getDragControl();
		if (oDragControl?.isA("sap.m.ListItemBase")) {
			return this._getItemBindingContext(oDragControl) || oDragControl;
		}
		return oDragControl;
	};

	return DragDropConfigBase;
});
