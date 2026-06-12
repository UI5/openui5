/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/m/p13n/SelectionController", "sap/ui/mdc/util/getKey", "sap/ui/mdc/util/DynamicPropertiesUtil"
], (SelectionController, getKey, DynamicPropertiesUtil) => {
	"use strict";

	/**
	 * MDC-specific override of the sap.m.p13n.SelectionController.
	 *
	 * Two-layer identifier architecture:
	 * The p13n stack uses different identifiers at different layers.
	 * - p13n layer (sap.m.p13n.Item): items are identified by "name". This is permanent and
	 *   never deprecated — BasePanel uses it as the list-binding key.
	 * - State (sap.ui.mdc.State.Items): items are identified by "key".
	 *   The former "name" property was deprecated in 1.124.0 and is removed in UI5 2.0.
	 *
	 * Boundary adapters — the only two correct translation points between the layers:
	 * - Downward (Engine to Panel): prepareAdaptationData copies key to name so the panel
	 *   can identify items.
	 * - Upward (Panel to Engine): _getP13nDataAsStateItems reads oItem.name from panel items
	 *   and emits state items with only "key".
	 *
	 * sap.ui.comp compatibility:
	 * sap.ui.comp's LinkPanelController reads oContent.name from flex change content.
	 * The permanent (non-deprecated) shim in _getChangeContent and _createMoveChange ensures
	 * "name" is always present alongside "key" in change content. This shim must remain until
	 * sap.ui.comp is migrated to read oContent.key instead.
	 *
	 */
	const MDCSelectionController = SelectionController.extend("sap.ui.mdc.p13n.subcontroller.SelectionController");

	MDCSelectionController.prototype._createAddRemoveChange = function(oControl, sOperation, oContent) {
		const oAddRemoveChange = {
			selectorElement: oControl,
			changeSpecificData: {
				changeType: sOperation,
				content: oContent
			}
		};
		return oAddRemoveChange;
	};

	MDCSelectionController.prototype.getCurrentState = function(bExternalize) {
		const vState = this.getAdaptationControl().getCurrentState()[this.getStateKey()];

		return vState;
	};

	/**
	 * Ensures both <code>changedState</code> and <code>existingState</code> carry a
	 * <code>key</code> property before the base delta calculation runs.
	 *
	 * <code>sap.m.p13n</code> panels identify items by <code>name</code>; the MDC
	 * state uses <code>key</code>. This override is the explicit
	 * boundary adapter between the two worlds: it maps <code>name&nbsp;→&nbsp;key</code>
	 * on any item that has <code>name</code> but no <code>key</code>, so the base
	 * <code>getDelta</code> always operates on a uniform <code>key</code>-based
	 * representation.
	 *
	 * @override
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 */
	MDCSelectionController.prototype.getDelta = function(mDeltaConfig) {
		const fnEnsureKey = (oStateItem) => {
			if (oStateItem.hasOwnProperty("name") && !oStateItem.hasOwnProperty("key")) {
				return Object.assign({}, oStateItem, { key: oStateItem.name });
			}
			return oStateItem;
		};

		if (mDeltaConfig.changedState instanceof Array) {
			mDeltaConfig.changedState = mDeltaConfig.changedState.map(fnEnsureKey);
		}

		if (mDeltaConfig.existingState instanceof Array) {
			mDeltaConfig.existingState = mDeltaConfig.existingState.map(fnEnsureKey);
		}

		const aChanges = SelectionController.prototype.getDelta.apply(this, arguments);

		// In property keys mode, translate aggregation indices to propertyKeys indices.
		// The base SelectionController computes indices in aggregation space (active items only),
		// but ItemBaseFlex operates on the propertyKeys array (which could include inactive items).
		const oControl = mDeltaConfig.control;
		if (oControl.isInPropertyKeysMode?.()) {
			aChanges.forEach((oChange) => {
				const oContent = oChange.changeSpecificData.content;

				if (oContent.index != null &&
					(oChange.changeSpecificData.changeType === mDeltaConfig.changeOperations.add ||
						oChange.changeSpecificData.changeType === mDeltaConfig.changeOperations.move)) {

					oContent.index = DynamicPropertiesUtil.translateAggregationToPropertyKeysIndex(oControl, oContent.index);
				}
			});
		}

		return aChanges;
	};

	MDCSelectionController.prototype._createMoveChange = function(sPropertykey, iNewIndex, sMoveOperation, oControl) {
		const oMoveChange = {
			selectorElement: oControl,
			changeSpecificData: {
				changeType: sMoveOperation,
				content: {
					key: sPropertykey,
					// Permanent shim: flex change content always carries `name` for sap.ui.comp.
					// See class JSDoc for the removal condition.
					name: sPropertykey,
					index: iNewIndex
				}
			}
		};
		return oMoveChange;
	};

	/**
	 * Extends the base implementation to bridge panel items that carry only a
	 * <code>name</code> property (the <code>sap.m.p13n</code> item identifier)
	 * into change content that also contains <code>key</code> (the MDC state
	 * item identifier), so that flex changes and state restoration work correctly.
	 *
	 * @override
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 */
	MDCSelectionController.prototype._getChangeContent = function(oProperty, aDeltaAttributes) {
		const oChangeContent = SelectionController.prototype._getChangeContent(oProperty, aDeltaAttributes);
		if (oChangeContent.name && !oChangeContent.key) {
			oChangeContent.key = oChangeContent.name;
		}

		// Permanent shim: flex change content always carries `name` for sap.ui.comp consumers.
		// Decoupled from deltaAttributes so that deltaAttributes.push("name") can be deprecated.
		if (oChangeContent.key && !oChangeContent.name) {
			oChangeContent.name = oChangeContent.key;
		}
		return oChangeContent;
	};

	/**
	 * Overrides the base implementation to ensure panel items carry both
	 * <code>name</code> and <code>key</code> with the same value.
	 *
	 * The base <code>prepareAdaptationData</code> already sets both fields, but
	 * may derive them from <code>oProperty.name</code> for backward compatibility.
	 * This override additionally guarantees that <code>name</code> is populated
	 * from <code>key</code> when it is absent, so the <code>sap.m.p13n</code>
	 * panel layer can identify items by <code>name</code> while
	 * <code>_getKeyFromContext</code> can retrieve the identifier via <code>key</code>.
	 *
	 * @override
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 * @since 1.148
	 */
	MDCSelectionController.prototype.prepareAdaptationData = function(...args) {
		const oAdaptationData = SelectionController.prototype.prepareAdaptationData.apply(this, args);
		oAdaptationData.items.forEach((oItem) => {
			if (!oItem.name && oItem.key) {
				oItem.name = oItem.key;
			}
		});
		return oAdaptationData;
	};

	/**
	 * Reads panel data and extracts items whose presence attribute is truthy,
	 * returning them as state items with only the <code>key</code> property.
	 *
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 * @param {string} sPresenceAttribute The attribute signaling the item is "active"
	 *   in this controller's domain (e.g. "sorted", "grouped", "visible")
	 * @returns {sap.ui.mdc.State.Item[]} Array of state items each with a single <code>key</code> property
	 * @since 1.148
	 */
	MDCSelectionController.prototype._getP13nDataAsStateItems = function(sPresenceAttribute) {
		const aItems = [];
		this._oPanel.getP13nData(true).forEach((oItem) => {
			if (oItem[sPresenceAttribute]) {
				aItems.push({ key: oItem.name });
			}
		});
		return aItems;
	};

	/**
	 * Returns a map (keyed by state item key) of the current controller state items,
	 * each annotated with a <code>position</code> index reflecting their order.
	 *
	 * Convenience wrapper for use in <code>mixInfoAndState</code> implementations.
	 *
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 * @returns {Object.<string, object>} Map of state items keyed by their <code>key</code> property
	 * @since 1.148
	 */
	MDCSelectionController.prototype._stateToMap = function() {
		return this.getCurrentState().reduce((mMap, oItem, iIndex) => {
			const sKey = getKey(oItem);
			mMap[sKey] = oItem;
			mMap[sKey].position = iIndex;
			return mMap;
		}, {});
	};

	return MDCSelectionController;

});