/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/util/uid",
	"sap/ui/dt/Util",
	"sap/ui/fl/Utils",
	"sap/ui/rta/plugin/Plugin"
], function(
	uid,
	DtUtil,
	FlexUtils,
	Plugin
) {
	"use strict";

	/**
	 * Constructor for a new Split Plugin.
	 *
	 * @class
	 * @extends sap.ui.rta.plugin.Plugin
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @private
	 * @since 1.46
	 * @alias sap.ui.rta.plugin.Split
	 */
	const Split = Plugin.extend("sap.ui.rta.plugin.Split", /** @lends sap.ui.rta.plugin.Split.prototype */ {
		metadata: {
			library: "sap.ui.rta",
			properties: {},
			associations: {},
			events: {}
		}
	});

	/**
	 * @override
	 */
	Split.prototype._isEditable = function(oOverlay) {
		if (this.getAction(oOverlay)?.changeOnRelevantContainer) {
			return this._checkChangeHandlerAndStableId(oOverlay);
		}
		return Promise.resolve(false);
	};

	/**
	 * @override
	 */
	Split.prototype.isAvailable = function(aElementOverlays, oAction) {
		if (aElementOverlays.length !== 1) {
			return false;
		}

		const oElementOverlay = aElementOverlays[0];
		if (!this._isEditableByPlugin(oElementOverlay)) {
			return false;
		}

		const oElement = oElementOverlay.getElement();
		if (oAction?.getControlsCount(oElement) <= 1) {
			return false;
		}

		return true;
	};

	/**
	 * @param {sap.ui.dt.ElementOverlay} oElementOverlay - Element overlay to split
	 * @returns {Promise<sap.ui.rta.command.Split>} Resolves with a split command
	 */
	Split.prototype.handler = async function(aElementOverlays, mPropertyBag) {
		const oElementOverlay = aElementOverlays[0];
		const oSplitElement = oElementOverlay.getElement();
		const oAction = mPropertyBag.menuItem.action;
		const aNewElementIds = [];

		for (let i = 0; i < oAction.getControlsCount(oSplitElement); i++) {
			aNewElementIds.push(FlexUtils.getViewForControl(oSplitElement).createId(uid()));
		}

		try {
			const oSplitCommand = await this.getCommandFactory().getCommandFor(oSplitElement, "split", {
				newElementIds: aNewElementIds,
				source: oSplitElement,
				parentElement: oSplitElement.getParent()
			}, oElementOverlay.getDesignTimeMetadata(), this.getVariantManagementReference(oElementOverlay, oAction));

			this.fireElementModified({
				command: oSplitCommand
			});
		} catch (vError) {
			throw DtUtil.propagateError(
				vError,
				"Split#handler",
				"Error occurred during handler execution",
				"sap.ui.rta.plugin"
			);
		}
	};

	/**
	 * @override
	 */
	Split.prototype.getMenuItems = function(vElementOverlays) {
		return this._getMenuItems(vElementOverlays, { pluginId: "CTX_UNGROUP_FIELDS", icon: "sap-icon://split" });
	};

	/**
	 * @override
	 */
	Split.prototype.getActionName = function() {
		return "split";
	};

	return Split;
});