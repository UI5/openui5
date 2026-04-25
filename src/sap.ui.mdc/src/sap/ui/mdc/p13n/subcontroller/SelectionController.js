/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/m/p13n/SelectionController", "sap/base/util/merge", "sap/ui/mdc/util/DynamicPropertiesUtil"
], (SelectionController, merge, DynamicPropertiesUtil) => {
	"use strict";

	const MDCSelectionController = SelectionController.extend("sap.ui.mdc.p13n.subcontroller.SelectionController");

	MDCSelectionController.prototype._createAddRemoveChange = function(oControl, sOperation, oContent) {
		delete oContent.key;
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
		let vState = this.getAdaptationControl().getCurrentState()[this.getStateKey()];

		if (vState instanceof Array && !bExternalize) {
			vState = vState.map((o) => {
				o.key = o.name;
				return o;
			});
		}
		return vState;
	};

	MDCSelectionController.prototype.getDelta = function(mDeltaConfig) {
		if (mDeltaConfig.changedState instanceof Array) {
			const aStateMapped = merge([], mDeltaConfig.changedState);
			aStateMapped.map((oStateItem) => {
				if (oStateItem.hasOwnProperty("name") && !oStateItem.hasOwnProperty("key")) {
					oStateItem.key = oStateItem.name;
				}
				return oStateItem;
			});
			mDeltaConfig.changedState = aStateMapped;
		}

		if (mDeltaConfig.existingState instanceof Array) {
			const aExistingStateMapped = merge([], mDeltaConfig.existingState);
			aExistingStateMapped.map((oStateItem) => {
				oStateItem.key = oStateItem.name;
				return oStateItem;
			});
			mDeltaConfig.existingState = aExistingStateMapped;
		}
		mDeltaConfig.deltaAttributes.push("name");

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
					name: sPropertykey,
					index: iNewIndex
				}
			}
		};
		return oMoveChange;
	};

	MDCSelectionController.prototype._getChangeContent = (oProperty, aDeltaAttributes) => {

		const oChangeContent = {};

		// Index
		if (oProperty.hasOwnProperty("index") && oProperty.index >= 0) {
			oChangeContent.index = oProperty.index;
		}

		aDeltaAttributes.forEach((sAttribute) => {
			if (oProperty.hasOwnProperty(sAttribute)) {
				oChangeContent[sAttribute == "key" ? "name" : sAttribute] = oProperty[sAttribute];
			}
		});

		return oChangeContent;
	};

	return MDCSelectionController;

});