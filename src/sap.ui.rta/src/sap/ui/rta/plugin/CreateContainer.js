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

	CreateContainer.prototype.getCreateContainerText = function(bSibling, oOverlay, oAction) {
		const oParentOverlay = this._getParentOverlay(bSibling, oOverlay);
		const oDesignTimeMetadata = oParentOverlay.getDesignTimeMetadata();
		const oElement = oParentOverlay.getElement();
		const sText = "CTX_CREATE_CONTAINER";
		return this._getText(oAction, oElement, oDesignTimeMetadata, sText);
	};

	CreateContainer.prototype._getContainerTitle = function(vAction, oElement, oDesignTimeMetadata) {
		const sText = "TITLE_CREATE_CONTAINER";
		return this._getText(vAction, oElement, oDesignTimeMetadata, sText);
	};

	/**
	 * @override
	 */
	CreateContainer.prototype.handler = async function(aElementOverlays, mPropertyBag) {
		const oOverlay = aElementOverlays[0];
		const oParentOverlay = this._getParentOverlay(mPropertyBag.menuItem.bAsSibling, oOverlay);
		const oParent = oParentOverlay.getElement();
		const oDesignTimeMetadata = oParentOverlay.getDesignTimeMetadata();
		const oView = FlexUtils.getViewForControl(oParent);
		const oSiblingElement = mPropertyBag.menuItem.bAsSibling ? oOverlay.getElement() : null;
		const sNewControlID = oView.createId(uid());
		const fnGetIndex = oDesignTimeMetadata.getAggregation(mPropertyBag.menuItem.action.aggregation).getIndex;
		const iIndex = this._determineIndex(oParent, oSiblingElement, mPropertyBag.menuItem.action.aggregation, fnGetIndex);
		const sVariantManagementReference = this.getVariantManagementReference(oParentOverlay);
		const sDefaultContainerTitle = this._getContainerTitle(mPropertyBag.menuItem.action, oParent, oDesignTimeMetadata);

		const sNewText = await this._oDialog.openDialogAndHandleRename({
			overlay: oOverlay,
			action: mPropertyBag.menuItem.action,
			currentText: sDefaultContainerTitle,
			acceptSameText: true,
			dialogSettings: {
				title: this.getCreateContainerText(mPropertyBag.menuItem.bAsSibling, oOverlay, mPropertyBag.menuItem.action)
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
				action: mPropertyBag.menuItem.action,
				newControlId: sNewControlID
			});
		} catch (oError) {
			throw DtUtil.propagateError(
				oError,
				"CreateContainer#handler",
				"Error occurred in CreateContainer handler function",
				"sap.ui.rta"
			);
		}
	};

	/**
	 * @override
	 */
	CreateContainer.prototype.getMenuItems = async function(aElementOverlays) {
		const oSiblingActions = this.getCreateActions(aElementOverlays[0], true)[0];
		const aChildActions = this.getCreateActions(aElementOverlays[0], false);
		const aMenuItems = await Promise.all([oSiblingActions, ...aChildActions].map((oAction, iIndex) => {
			const sPluginId = iIndex === 0 ? "CTX_CREATE_SIBLING_CONTAINER" : "CTX_CREATE_CHILD_CONTAINER";
			if (!oAction) {
				return [];
			}
			return this._getMenuItems(aElementOverlays, {
				pluginId: sPluginId,
				icon: "sap-icon://add-folder",
				bAsSibling: sPluginId === "CTX_CREATE_SIBLING_CONTAINER",
				text: this.getCreateContainerText(sPluginId === "CTX_CREATE_SIBLING_CONTAINER", aElementOverlays[0], oAction),
				action: oAction
			});
		}));
		return aMenuItems.flat();
	};

	/**
	 * @override
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
