/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/util/uid",
	"sap/ui/dt/Util",
	"sap/ui/fl/Utils",
	"sap/ui/rta/plugin/Plugin",
	"sap/ui/rta/Utils"
], function(
	uid,
	DtUtil,
	FlUtils,
	Plugin,
	Utils
) {
	"use strict";

	/**
	 * Constructor for a new Combine Plugin.
	 *
	 * @class
	 * @extends sap.ui.rta.plugin.Plugin
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @private
	 * @since 1.46
	 * @alias sap.ui.rta.plugin.Combine
	 */
	const Combine = Plugin.extend("sap.ui.rta.plugin.Combine", /** @lends sap.ui.rta.plugin.Combine.prototype */ {
		metadata: {
			library: "sap.ui.rta"
		}
	});

	/**
	 * @override
	 */
	Combine.prototype._isEditable = function(oOverlay) {
		const oCombineAction = this.getAction(oOverlay);
		if (!oOverlay.isRoot() && oCombineAction?.changeOnRelevantContainer) {
			return this._checkChangeHandlerAndStableId(oOverlay);
		}
		return Promise.resolve(false);
	};

	Combine.prototype._checkForSameRelevantContainer = function(aElementOverlays) {
		const aRelevantContainer = [];
		for (let i = 0, n = aElementOverlays.length; i < n; i++) {
			aRelevantContainer[i] = aElementOverlays[i].getRelevantContainer();
			const oCombineAction = this.getAction(aElementOverlays[i]);
			if (!oCombineAction || !oCombineAction.changeType) {
				return false;
			}
			if (i > 0) {
				if (
					(aRelevantContainer[0] !== aRelevantContainer[i])
					|| (this.getAction(aElementOverlays[0]).changeType !== oCombineAction.changeType)
				) {
					return false;
				}
			}
		}
		return true;
	};

	/**
	 * Checks the binding compatibility of all given elements. Absolute binding will not be considered
	 *
	 * @param {sap.ui.core.Element[]|sap.ui.core.Component[]} aControls - Array of controls to be checked for binding compatibility
	 * @param {sap.ui.model.Model} oModel - Model for filtering irrelevant binding paths
	 * @return {boolean} <code>true</code> when the controls have compatible bindings.
	 */
	Combine.prototype._checkBindingCompatibilityOfControls = function(aControls, oModel) {
		return aControls.every(function(oSource) {
			return aControls.every(function(oTarget) {
				return oSource !== oTarget ? Utils.checkSourceTargetBindingCompatibility(oSource, oTarget, oModel) : true;
			});
		});
	};

	/**
	 * @override
	 */
	Combine.prototype.isAvailable = function(aElementOverlays) {
		if (aElementOverlays.length <= 1) {
			return false;
		}

		return (
			aElementOverlays.every((oElementOverlay) => this._isEditableByPlugin(oElementOverlay))
			&& this._checkForSameRelevantContainer(aElementOverlays)
		);
	};

	/**
	 * @override
	 */
	Combine.prototype.isEnabled = function(aElementOverlays, oMenuItem) {
		// check that at least 2 fields can be combined
		if (!this.isAvailable(aElementOverlays) || aElementOverlays.length <= 1) {
			return false;
		}
		const oResponsibleElementOverlays = oMenuItem.responsible || aElementOverlays;

		const aControls = oResponsibleElementOverlays.map((oElementOverlay) => oElementOverlay.getElement());

		// check that each specified element has an enabled action
		const bActionCheck = oResponsibleElementOverlays.every((oElementOverlay) => {
			const oAction = this.getAction(oElementOverlay);
			if (!oAction) {
				return false;
			}

			// when isEnabled is not defined the default is true
			if (typeof oAction.isEnabled !== "undefined") {
				if (typeof oAction.isEnabled === "function") {
					return oAction.isEnabled(aControls);
				}
				return oAction.isEnabled;
			}

			return true;
		});

		if (bActionCheck) {
			// check if all the target elements have the same binding context
			const oDefaultModel = aControls[0]?.getModel();
			return this._checkBindingCompatibilityOfControls(aControls, oDefaultModel);
		}

		return bActionCheck;
	};

	/**
	 * @param {sap.ui.dt.ElementOverlay[]} aElementOverlays - specified overlays
	 * @param {sap.ui.core.Element} oCombineElement - element where the combine was triggered
	 * @returns {Promise} Promise
	 */
	Combine.prototype.handleCombine = async function(aElementOverlays, oCombineElement) {
		let oCombineElementOverlay;
		const aElements = aElementOverlays.map((oElementOverlay) => {
			if (oElementOverlay.getElement().getId() === oCombineElement.getId()) {
				oCombineElementOverlay = oElementOverlay;
			}
			return oElementOverlay.getElement();
		});
		const oDesignTimeMetadata = oCombineElementOverlay.getDesignTimeMetadata();
		const sVariantManagementReference = this.getVariantManagementReference(oCombineElementOverlay);
		const oView = FlUtils.getViewForControl(oCombineElement);
		const sNewElementId = oView.createId(uid());

		try {
			const oCombineCommand = await this.getCommandFactory().getCommandFor(
				oCombineElement,
				"combine",
				{
					newElementId: sNewElementId,
					source: oCombineElement,
					combineElements: aElements
				},
				oDesignTimeMetadata,
				sVariantManagementReference
			);

			this.fireElementModified({
				command: oCombineCommand
			});
		} catch (oError) {
			throw DtUtil.propagateError(
				oError,
				"Combine#handleCombine",
				"Error occurred in Combine handler function",
				"sap.ui.rta"
			);
		}
	};

	/**
	 * @override
	 */
	Combine.prototype.getMenuItems = function(aElementOverlays) {
		return this._getMenuItems(
			aElementOverlays,
			{
				pluginId: "CTX_GROUP_FIELDS",
				icon: "sap-icon://combine"
			}
		);
	};

	/**
	 * @override
	 */
	Combine.prototype.getActionName = function() {
		return "combine";
	};

	/**
	 * @override
	 */
	Combine.prototype.handler = function(aElementOverlays, mPropertyBag) {
		this.handleCombine(aElementOverlays, mPropertyBag.contextElement);
	};

	return Combine;
});
