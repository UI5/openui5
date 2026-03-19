/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/util/uid",
	"sap/ui/dt/Util",
	"sap/ui/fl/Utils",
	"sap/ui/rta/plugin/rename/RenameDialog",
	"sap/ui/rta/plugin/BaseCreate",
	"sap/ui/rta/plugin/Plugin"
], function(
	uid,
	DtUtil,
	FlexUtils,
	RenameDialog,
	BaseCreate,
	Plugin
) {
	"use strict";

	/**
	 * Constructor for a new CreateContainer Plugin.
	 *
	 * @param {string} [sId] - Id for the new object, generated automatically if no id is given
	 * @param {object} [mSettings] - Initial settings for the new object
	 * @class The CreateContainer allows trigger CreateContainer operations on the overlay
	 * @extends sap.ui.rta.plugin.BaseCreate
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @private
	 * @since 1.34
	 * @alias sap.ui.rta.plugin.CreateContainer
	 */
	const CreateContainer = BaseCreate.extend("sap.ui.rta.plugin.CreateContainer", /** @lends sap.ui.rta.plugin.CreateContainer.prototype */ {
		metadata: {
			library: "sap.ui.rta"
		}
	});

	CreateContainer.prototype.init = function(...aArgs) {
		Plugin.prototype.init.apply(this, aArgs);
		this._oDialog = new RenameDialog();
	};

	/**
	 * Returns true if create container action is enabled for the selected element overlays
	 * @param {sap.ui.dt.ElementOverlay[]} aElementOverlays - Array of selected element overlays
	 * @param {boolean} bSibling - Indicator for a sibling action
	 * @return {boolean} Whether the action is enabled
	 * @override
	 */
	CreateContainer.prototype.isEnabled = function(aElementOverlays, bSibling) {
		const oElementOverlay = aElementOverlays[0];
		const oAction = this.getCreateAction(bSibling, oElementOverlay);
		return this.isActionEnabled(oAction, bSibling, oElementOverlay);
	};

	CreateContainer.prototype.getCreateContainerText = function(bSibling, oOverlay) {
		const vAction = this.getCreateAction(bSibling, oOverlay);
		const oParentOverlay = this._getParentOverlay(bSibling, oOverlay);
		const oDesignTimeMetadata = oParentOverlay.getDesignTimeMetadata();
		const oElement = oParentOverlay.getElement();
		const sText = "CTX_CREATE_CONTAINER";
		return this._getText(vAction, oElement, oDesignTimeMetadata, sText);
	};

	CreateContainer.prototype._getContainerTitle = function(vAction, oElement, oDesignTimeMetadata) {
		const sText = "TITLE_CREATE_CONTAINER";
		return this._getText(vAction, oElement, oDesignTimeMetadata, sText);
	};

	CreateContainer.prototype.handleCreate = async function(bSibling, oOverlay) {
		const vAction = this.getCreateAction(bSibling, oOverlay);
		const oParentOverlay = this._getParentOverlay(bSibling, oOverlay);
		const oParent = oParentOverlay.getElement();
		const oDesignTimeMetadata = oParentOverlay.getDesignTimeMetadata();
		const oView = FlexUtils.getViewForControl(oParent);
		const oSiblingElement = bSibling ? oOverlay.getElement() : null;
		const sNewControlID = oView.createId(uid());
		const fnGetIndex = oDesignTimeMetadata.getAggregation(vAction.aggregation).getIndex;
		const iIndex = this._determineIndex(oParent, oSiblingElement, vAction.aggregation, fnGetIndex);
		const sVariantManagementReference = this.getVariantManagementReference(oParentOverlay);
		const sDefaultContainerTitle = this._getContainerTitle(vAction, oParent, oDesignTimeMetadata);

		const sNewText = await this._oDialog.openDialogAndHandleRename({
			overlay: oOverlay,
			action: vAction,
			currentText: sDefaultContainerTitle,
			acceptSameText: true,
			dialogSettings: {
				title: this.getCreateContainerText(bSibling, oOverlay)
			}
		});

		if (!sNewText) {
			// If the user cancels the dialog, do not create a container
			return;
		}

		try {
			const oCreateCommand = await this.getCommandFactory().getCommandFor(oParent, "createContainer", {
				newControlId: sNewControlID,
				label: sNewText,
				index: iIndex,
				parentId: oParent.getId()
			}, oDesignTimeMetadata, sVariantManagementReference);

			this.fireElementModified({
				command: oCreateCommand,
				action: vAction,
				newControlId: sNewControlID
			});
		} catch (oError) {
			throw DtUtil.propagateError(
				oError,
				"CreateContainer#handleCreate",
				"Error occurred in CreateContainer handler function",
				"sap.ui.rta"
			);
		}
	};

	/**
	 * Retrieve the context menu item for the actions.
	 * Two items are returned here: one for when the overlay is sibling and one for when it is child.
	 * @param {sap.ui.dt.ElementOverlay[]} aElementOverlays - Target overlays
	 * @return {object[]} returns array containing the items with required data
	 */
	CreateContainer.prototype.getMenuItems = function(aElementOverlays) {
		let bOverlayIsSibling = true;
		let sPluginId = "CTX_CREATE_SIBLING_CONTAINER";
		let iRank = this.getRank(sPluginId);
		const aMenuItems = [];

		function isMenuItemEnabled(bOverlayIsSibling, aOverlays) {
			return this.isEnabled(aOverlays, bOverlayIsSibling);
		}

		for (let i = 0; i < 2; i++) {
			if (this.isAvailable(aElementOverlays, bOverlayIsSibling)) {
				aMenuItems.push({
					id: sPluginId,
					text: this.getCreateContainerText.bind(this, bOverlayIsSibling),
					handler: this.handleCreate.bind(this, bOverlayIsSibling, aElementOverlays[0]),
					enabled: isMenuItemEnabled.bind(this, bOverlayIsSibling),
					icon: "sap-icon://add-folder",
					rank: iRank
				});
			}
			bOverlayIsSibling = false;
			sPluginId = "CTX_CREATE_CHILD_CONTAINER";
			iRank = this.getRank(sPluginId);
		}
		return aMenuItems;
	};

	/**
	 * Get the name of the action related to this plugin.
	 * @return {string} Action name
	 */
	CreateContainer.prototype.getActionName = function() {
		return "createContainer";
	};

	CreateContainer.prototype.destroy = function(...args) {
		Plugin.prototype.destroy.apply(this, args);
		this._oDialog.destroy();
		delete this._oDialog;
	};

	return CreateContainer;
});
