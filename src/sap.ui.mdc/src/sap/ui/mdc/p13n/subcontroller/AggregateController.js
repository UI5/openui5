/*!
 * ${copyright}
 */
sap.ui.define([
	"./SelectionController", 'sap/ui/mdc/p13n/P13nBuilder', 'sap/base/util/merge', 'sap/ui/mdc/util/getKey'
], (BaseController, P13nBuilder, merge, getKey) => {
	"use strict";

	const AggregateController = BaseController.extend("sap.ui.mdc.p13n.subcontroller.AggregateController");

	AggregateController.prototype.getStateKey = function() {
		return "aggregations";
	};

	AggregateController.prototype.getCurrentState = function() {
		return this.getAdaptationControl().getAggregateConditions() || {};
	};

	AggregateController.prototype.sanityCheck = function(change) {
		const aAggregations = [];
		Object.keys({ ...change }).forEach((sKey) => {
			const oAggregate = {
				name: sKey,
				key: sKey
			};
			if (change[sKey].hasOwnProperty("aggregated")) {
				oAggregate["aggregated"] = change[sKey].aggregated;
			}
			aAggregations.push(oAggregate);
		});
		return aAggregations;
	};

	AggregateController.prototype.getDelta = function(mPropertyBag) {
		mPropertyBag.existingState = this.sanityCheck(mPropertyBag.existingState);
		return BaseController.prototype.getDelta.apply(this, arguments);
	};

	AggregateController.prototype.initAdaptationUI = function(oPropertyHelper) {
		return null;
	};

	AggregateController.prototype.getChangeOperations = function() {
		return {
			add: "addAggregate",
			remove: "removeAggregate"
		};
	};

	AggregateController.prototype._getPresenceAttribute = function() {
		return "aggregated";
	};

	AggregateController.prototype.changesToState = function(aChanges) {

		const mStateDiff = {};

		aChanges.forEach((oChange) => {
			const sKey = getKey(oChange.changeSpecificData.content);

			if (!mStateDiff[sKey]) {
				mStateDiff[sKey] = [];
			}

			const oAggregationValue = {};
			//set the presence attribute to false in case of an explicit remove
			if (oChange.changeSpecificData.changeType === this.getChangeOperations()["remove"]) {
				oAggregationValue.aggregated = false;
			}
			mStateDiff[sKey] = oAggregationValue;
		});

		return mStateDiff;
	};

	AggregateController.prototype.mixInfoAndState = function(oPropertyHelper) {

		const mExistingAggregations = this.getCurrentState();

		const oP13nData = this.prepareAdaptationData(oPropertyHelper, (mItem, oProperty) => {
			const oExisting = mExistingAggregations[oProperty.key];
			mItem.aggregated = !!oExisting;
			return oProperty.aggregatable;
		});

		return oP13nData;
	};

	return AggregateController;

});