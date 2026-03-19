/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/base/Object",
	"sap/ui/core/support/ToolsAPI",
	"sap/ui/test/_ControlFinder"
], function (BaseObject, ToolsAPI, _ControlFinder) {
	"use strict";

	var ControlAPI = BaseObject.extend("sap.ui.testrecorder.inspector.ControlAPI", {});
	var DEFAULT_MODEL = "default";
	var DEFAULT_PATH = "none";

	ControlAPI.prototype.getFrameworkData = function () {
		var frameworkInfo = ToolsAPI.getFrameworkInformation();
		return {
			framework: {
				name: frameworkInfo.commonInformation.frameworkName,
				version: frameworkInfo.commonInformation.version
			}
		};
	};

	ControlAPI.prototype.getAllControlData = function (oOptions) {
		var renderedControls = ToolsAPI.getRenderedControlTree(oOptions);
		return {
			renderedControls: renderedControls
		};
	};

	/**
	 * Retrieves detailed information about a control based on the provided data.
	 * @param {object} mData The data containing control identification information
	 * @param {object} mData.controlId The ID of the control (optional)
	 * @param {object} mData.domElementId The ID of the DOM element associated with the control (optional)
	 * @param {object} mData.includeAggregations Whether to include aggregations in the control data (optional, default: false)
	 * @param {object} mData.includeAssociations Whether to include associations in the control data (optional, default: false)
	 * @returns {object} An object containing the control's properties and bindings
	 */
	ControlAPI.prototype.getControlData = function (mData) {
		var sControlId;
		if (mData.controlId) {
			// would have control ID e.g. when control is selected from the inspector view control tree
			sControlId = mData.controlId;
		} else if (mData.domElementId) {
			// would have DOM element e.g. when control is selected by clicking on the page
			var oControl = _ControlFinder._getControlForElement(mData.domElementId);
			if (oControl) {
				sControlId = oControl.getId();
			} else {
				return {};
			}
		}

		var aProperties = this._getFormattedProperties(sControlId);
		var aBindings = this._getFormattedBindings(sControlId);

		var oData = {
			properties: aProperties,
			bindings: aBindings
		};

		if (mData.includeAggregations) {
			oData.aggregations = this._getFormattedAggregations(sControlId);
		}
		if (mData.includeAssociations) {
			oData.associations = this._getFormattedAssociations(sControlId);
		}
		return oData;
	};

	ControlAPI.prototype._getFormattedProperties = function (sControlId) {
		var aAllProperties = ToolsAPI.getControlProperties(sControlId);
		aAllProperties.own = [aAllProperties.own];
		var mFormattedProperties = {};
		["own", "inherited"].forEach(function (sType) {
			mFormattedProperties[sType] = [];
			aAllProperties[sType].forEach(function (mPropertiesContainer) {
				Object.keys(mPropertiesContainer.properties).forEach(function (sProperty) {
					var mProperty = mPropertiesContainer.properties[sProperty];
					mFormattedProperties[sType].push({
						inheritedFrom: mPropertiesContainer.meta.controlName,
						property: sProperty,
						value: mProperty.value === undefined ? "" : mProperty.value,
						type: mProperty.type
					});
				});
			});
		});

		return mFormattedProperties;
	};

	ControlAPI.prototype._getFormattedBindings = function (sControlId) {
		var aAllbindings = ToolsAPI.getControlBindings(sControlId);
		var sAbsolutePathPrefix = aAllbindings.contextPath ? aAllbindings.contextPath + "/" : "";
		var mSomeProperty = Object.keys(aAllbindings.properties)[0] && aAllbindings.properties[Object.keys(aAllbindings.properties)[0]];
		var sContextModel = mSomeProperty && mSomeProperty.model.names[0] || DEFAULT_MODEL;
		var aFormattedBindings = {
			context: [{
				path: aAllbindings.contextPath || DEFAULT_PATH,
				model: sContextModel
			}],
			properties: [],
			aggregations: []
		};
		Object.keys(aAllbindings.properties).forEach(function (sProperty) {
			var mProperty = aAllbindings.properties[sProperty];
			aFormattedBindings.properties.push({
				property: sProperty,
				relativePath: mProperty.path,
				absolutePath:  sAbsolutePathPrefix + mProperty.path,
				model: mProperty.model.names[0] || DEFAULT_MODEL
			});
		});
		Object.keys(aAllbindings.aggregations).forEach(function (sAggregation) {
			var mAggregationModel = aAllbindings.aggregations[sAggregation].model;
			aFormattedBindings.aggregations.push({
				aggregation: sAggregation,
				relativePath: mAggregationModel.path,
				absolutePath:  sAbsolutePathPrefix + mAggregationModel.path,
				model: mAggregationModel.names[0] || DEFAULT_MODEL
			});
		});

		return aFormattedBindings;
	};

	ControlAPI.prototype._getFormattedAggregations = function (sControlId) {
		var oAllAggregations = ToolsAPI.getControlAggregations(sControlId);
		oAllAggregations.own = [oAllAggregations.own];
		var mFormattedAggregations = {};
		["own", "inherited"].forEach(function (sType) {
			mFormattedAggregations[sType] = [];
			oAllAggregations[sType].forEach(function (mAggregationsContainer) {
				Object.keys(mAggregationsContainer.aggregations).forEach(function (sAggregation) {
					var mAggregation = mAggregationsContainer.aggregations[sAggregation];
					mFormattedAggregations[sType].push({
						inheritedFrom: mAggregationsContainer.meta.controlName,
						aggregation: sAggregation,
						type: mAggregation.type,
						count: mAggregation.count
					});
				});
			});
		});

		return mFormattedAggregations;
	};

	ControlAPI.prototype._getFormattedAssociations = function (sControlId) {
		var oAllAssociations = ToolsAPI.getControlAssociations(sControlId);
		oAllAssociations.own = [oAllAssociations.own];
		var mFormattedAssociations = {};
		["own", "inherited"].forEach(function (sType) {
			mFormattedAssociations[sType] = [];
			oAllAssociations[sType].forEach(function (mAssociationsContainer) {
				Object.keys(mAssociationsContainer.associations).forEach(function (sAssociation) {
					var mAssociation = mAssociationsContainer.associations[sAssociation];
					var vValue = isManagedObject(mAssociation.value) ? mAssociation.value.getId() : mAssociation.value;
					mFormattedAssociations[sType].push({
						inheritedFrom: mAssociationsContainer.meta.controlName,
						association: sAssociation,
						type: mAssociation.type,
						value: vValue
					});
				});
			});
		});

		return mFormattedAssociations;
	};

	// utils
	function isManagedObject(oValue) {
		return oValue && typeof oValue === "object" && typeof oValue.isA === "function" && oValue.isA("sap.ui.base.ManagedObject");
	}

	return new ControlAPI();

});
