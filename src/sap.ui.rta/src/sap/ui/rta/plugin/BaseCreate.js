/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/Lib",
	"sap/ui/fl/Utils",
	"sap/ui/rta/plugin/Plugin",
	"sap/ui/rta/Utils"
], function(
	Lib,
	FlexUtils,
	Plugin,
	RtaUtils
) {
	"use strict";

	/**
	 * Constructor for a new BaseCreate Plugin.
	 *
	 * @param {string} [sId] - ID for the new object, generated automatically if no id is given
	 * @param {object} [mSettings] - Initial settings for the new object
	 * @class The BaseCreate allows trigger BaseCreate operations on the overlay.
	 * @extends sap.ui.rta.plugin.Plugin
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @private
	 * @since 1.75
	 * @alias sap.ui.rta.plugin.BaseCreate
	 * @abstract
	 */
	const BaseCreate = Plugin.extend("sap.ui.rta.plugin.BaseCreate", /** @lends sap.ui.rta.plugin.BaseCreate.prototype */ {
		metadata: {
			library: "sap.ui.rta"
		}
	});

	/**
	 * @override
	 */
	BaseCreate.prototype._isEditable = async function(oOverlay) {
		const aPromiseValues = await Promise.all([this._isEditableCheck(oOverlay, true), this._isEditableCheck(oOverlay, false)]);
		return {
			asSibling: aPromiseValues[0],
			asChild: aPromiseValues[1]
		};
	};

	BaseCreate.prototype._isEditableCheck = async function(oOverlay, bOverlayIsSibling) {
		const oParentOverlay = this._getParentOverlay(bOverlayIsSibling, oOverlay);
		if (!oParentOverlay || !oParentOverlay.getParentElementOverlay()) {
			// root element is not editable as parent and as sibling
			return false;
		}

		let sAggregationName;
		if (bOverlayIsSibling) {
			sAggregationName = oOverlay.getParentAggregationOverlay().getAggregationName();
		}

		const bEditableCheck = await this.checkAggregationsOnSelf(oParentOverlay, this.getActionName(), sAggregationName);
		if (bEditableCheck) {
			// If IDs are created within fragments or controller code,
			// the ID of the parent view might not be part of the control ID.
			// In these cases the control might have a stable ID (this.hasStableId()), but the view doesn't.
			// As the view is needed create the ID for the newly created container,
			// it has to be stable, otherwise the new ID will not be stable.
			const oParentView = FlexUtils.getViewForControl(oParentOverlay.getElement());
			return this.hasStableId(oOverlay) && FlexUtils.checkControlId(oParentView);
		}
		return false;
	};

	BaseCreate.prototype._getParentOverlay = function(bSibling, oOverlay) {
		const oResponsibleElementOverlay = this.getResponsibleElementOverlay(oOverlay);
		return bSibling ? oResponsibleElementOverlay.getParentElementOverlay() : oResponsibleElementOverlay;
	};

	BaseCreate.prototype.getCreateActions = function(oOverlay, bSibling) {
		const oResponsibleElementOverlay = this.getResponsibleElementOverlay(oOverlay);
		const oParentOverlay = this._getParentOverlay(bSibling, oResponsibleElementOverlay);
		const oDesignTimeMetadata = oParentOverlay.getDesignTimeMetadata();
		const aActions = oDesignTimeMetadata.getActionDataFromAggregations(this.getActionName(), oResponsibleElementOverlay.getElement());
		if (bSibling) {
			const sParentAggregation = oResponsibleElementOverlay.getParentAggregationOverlay().getAggregationName();
			return aActions.filter((oAction) => oAction.aggregation === sParentAggregation);
		}
		return aActions;
	};

	/**
	 * @override
	 */
	BaseCreate.prototype.isEnabled = function(aElementOverlays, oMenuItem) {
		if (!oMenuItem.action) {
			return false;
		}

		if (oMenuItem.action.isEnabled && typeof oMenuItem.action.isEnabled === "function") {
			const fnIsEnabled = oMenuItem.action.isEnabled;
			const oParentOverlay = this._getParentOverlay(oMenuItem.bAsSibling, aElementOverlays[0]);
			return fnIsEnabled(oParentOverlay.getElement());
		}

		return true;
	};

	/**
	 * Returns the ID of a newly created container using the function
	 * defined in the control design time metadata to retrieve the correct value
	 * @param  {object} vAction - Create container action from designtime metadata
	 * @param  {string} sNewControlID - ID of the new control
	 * @return {string} ID of the created control
	 */
	BaseCreate.prototype.getCreatedContainerId = function(vAction, sNewControlID) {
		const bHasCreateFunction = vAction.getCreatedContainerId && typeof vAction.getCreatedContainerId === "function";
		return bHasCreateFunction ? vAction.getCreatedContainerId(sNewControlID) : sNewControlID;
	};

	BaseCreate.prototype._determineIndex = function(oParentElement, oSiblingElement, sAggregationName, fnGetIndex) {
		return RtaUtils.getIndex(oParentElement, oSiblingElement, sAggregationName, fnGetIndex);
	};

	BaseCreate.prototype._getText = function(vAction, oElement, oDesignTimeMetadata, sText) {
		if (!vAction) {
			return sText;
		}
		const oAggregationDescription = oDesignTimeMetadata.getAggregationDescription(vAction.aggregation, oElement);
		if (!oAggregationDescription) {
			return sText;
		}
		const sContainerTitle = oAggregationDescription.singular;
		const oTextResources = Lib.getResourceBundleFor("sap.ui.rta");
		return oTextResources.getText(sText, [sContainerTitle]);
	};

	return BaseCreate;
});
