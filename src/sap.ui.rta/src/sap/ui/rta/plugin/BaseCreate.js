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
	 * This function gets called on startup. It checks if the overlay is editable by this plugin.
	 * @param {sap.ui.dt.Overlay} oOverlay - Overlay to be checked
	 * @returns {object} Object with editable boolean values for <code>asChild</code> and <code>asSibling</code>
	 * @private
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

	BaseCreate.prototype.getCreateActions = function(bSibling, oOverlay) {
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

	BaseCreate.prototype.getCreateAction = function(bSibling, oOverlay, sAggregationName) {
		const aActions = this.getCreateActions(bSibling, oOverlay);
		if (sAggregationName) {
			let oCreateActionForAggregation;
			aActions.some((oAction) => {
				if (oAction.aggregation === sAggregationName) {
					oCreateActionForAggregation = oAction;
					return true;
				}
				return false;
			});
			return oCreateActionForAggregation;
		}
		return aActions[0];
	};

	BaseCreate.prototype.isAvailable = function(aElementOverlays, bSibling) {
		return this._isEditableByPlugin(aElementOverlays[0], bSibling);
	};

	BaseCreate.prototype.isActionEnabled = function(oAction, bSibling, oElementOverlay) {
		if (!oAction) {
			return false;
		}

		if (oAction.isEnabled && typeof oAction.isEnabled === "function") {
			const fnIsEnabled = oAction.isEnabled;
			const oParentOverlay = this._getParentOverlay(bSibling, oElementOverlay);
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

	/**
	 * Gets the name of the action related to this plugin.
	 * @return {string} Action name
	 * @abstract
	 */
	BaseCreate.prototype.getActionName = function() {
		throw new Error("abstract");
	};

	function ignoreAbstractParameters() {}

	/**
	 * Retrieve the context menu item for the actions.
	 * Two items are returned here: one for when the overlay is a sibling and one for when it is a child.
	 * @param {sap.ui.dt.ElementOverlay[]} aElementOverlays - Target overlays
	 * @return {object[]} Array containing the items with required data
	 * @abstract
	 */
	BaseCreate.prototype.getMenuItems = function(aElementOverlays) {
		ignoreAbstractParameters(aElementOverlays);
		throw new Error("abstract");
	};

	/**
	 * Handles the creation.
	 * @param {boolean} bSibling - Create as a sibling
	 * @param {sap.ui.dt.Overlay} oOverlay - Reference overlay for creation
	 * @abstract
	 */
	BaseCreate.prototype.handleCreate = function(bSibling, oOverlay) {
		ignoreAbstractParameters(bSibling, oOverlay);
		throw new Error("abstract");
	};

	return BaseCreate;
});
