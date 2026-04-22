/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/util/uid",
	"sap/ui/core/IconPool",
	"sap/ui/core/Lib",
	"sap/ui/dt/Util",
	"sap/ui/fl/util/CancelError",
	"sap/ui/fl/Utils",
	"sap/ui/rta/plugin/iframe/AddIFrameDialog",
	"sap/ui/rta/plugin/BaseCreate"
], function(
	uid,
	IconPool,
	Lib,
	DtUtil,
	CancelError,
	FlexUtils,
	AddIFrameDialog,
	BaseCreate
) {
	"use strict";

	/**
	 * Constructor for a new AddIFrame plugin.
	 *
	 * @param {string} [sId] - ID for the new object, generated automatically if no ID is given
	 * @param {object} [mSettings] - Initial settings for the new object
	 * @class The AddIFrame allows trigger AddIFrame operations on the overlay.
	 * @extends sap.ui.rta.plugin.BaseCreate
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @private
	 * @since 1.75
	 * @alias sap.ui.rta.plugin.AddIFrame
	 */
	const AddIFrame = BaseCreate.extend("sap.ui.rta.plugin.AddIFrame", /** @lends sap.ui.rta.plugin.AddIFrame.prototype */{
		metadata: {
			library: "sap.ui.rta"
		}
	});

	function getAddIFrameCommand(oModifiedElement, mSettings, oDesignTimeMetadata, sVariantManagementKey) {
		const oView = FlexUtils.getViewForControl(oModifiedElement);
		const sBaseId = oView.createId(uid());
		let sWidth;
		let sHeight;
		if (mSettings.frameWidth) {
			sWidth = mSettings.frameWidth + mSettings.frameWidthUnit;
		} else {
			sWidth = "100%";
		}
		if (mSettings.frameHeight) {
			sHeight = mSettings.frameHeight + mSettings.frameHeightUnit;
		} else {
			sHeight = "100%";
		}
		return this.getCommandFactory().getCommandFor(oModifiedElement, "addIFrame", {
			targetAggregation: mSettings.aggregation,
			baseId: sBaseId,
			index: mSettings.index,
			url: mSettings.frameUrl,
			width: sWidth,
			height: sHeight,
			title: mSettings.title,
			advancedSettings: mSettings.advancedSettings
		}, oDesignTimeMetadata, sVariantManagementKey);
	}

	/**
	 * @override
	 */
	AddIFrame.prototype.handler = function(aElementOverlays, mPropertyBag) {
		const oResponsibleElementOverlay = aElementOverlays[0];
		const oParentOverlay = this._getParentOverlay(mPropertyBag.menuItem.bAsSibling, oResponsibleElementOverlay);
		const oParent = oParentOverlay.getElement();
		const oDesignTimeMetadata = oParentOverlay.getDesignTimeMetadata();
		let iIndex = 0;

		if (mPropertyBag.menuItem.bAsSibling) {
			const oSiblingElement = oResponsibleElementOverlay.getElement();
			const fnGetIndex = oDesignTimeMetadata.getAggregation(mPropertyBag.menuItem.action.aggregation).getIndex;
			iIndex = this._determineIndex(oParent, oSiblingElement, mPropertyBag.menuItem.action.aggregation, fnGetIndex);
		}

		const sVariantManagementReference = this.getVariantManagementReference(oParentOverlay);

		// providing an action will trigger the rename plugin, which we only want in case of addIFrame as container
		// in that case the function getCreatedContainerId has to be provided
		const bAsContainer = !!mPropertyBag.menuItem.action.getCreatedContainerId;

		const oAddIFrameDialog = new AddIFrameDialog();
		let sNewContainerTitle;
		return AddIFrameDialog.buildUrlBuilderParametersFor(oParent)
		.then(function(mURLParameters) {
			const mAddIFrameDialogSettings = {
				parameters: mURLParameters,
				asContainer: bAsContainer
			};
			return oAddIFrameDialog.open(mAddIFrameDialogSettings, oParent, mPropertyBag.menuItem.action);
		})
		.then(function(mSettings) {
			if (!mSettings) {
				throw new CancelError();
			}
			mSettings.index = iIndex;
			mSettings.aggregation = mPropertyBag.menuItem.action.aggregation;
			sNewContainerTitle = mSettings.title;
			return getAddIFrameCommand.call(this, oParent, mSettings, oDesignTimeMetadata, sVariantManagementReference);
		}.bind(this))
		.then(function(oCommand) {
			this.fireElementModified({
				command: oCommand,
				newControlId: oCommand.getBaseId(),
				action: bAsContainer ? mPropertyBag.menuItem.action : undefined,
				title: sNewContainerTitle
			});
		}.bind(this))
		.catch(function(vError) {
			if (vError && !(vError instanceof CancelError)) {
				throw DtUtil.createError("AddIFrame#handler", vError, "sap.ui.rta");
			}
		});
	};

	AddIFrame.prototype.getActionText = function(oResponsibleElementOverlay, oAction) {
		const oTextResources = Lib.getResourceBundleFor("sap.ui.rta");
		return oTextResources.getText("CTX_ADDIFRAME", [oAction.text]);
	};

	/**
	 * @override
	 */
	AddIFrame.prototype.getMenuItems = async function(aElementOverlays) {
		IconPool.registerFont({
			collectionName: "tnt",
			fontFamily: "SAP-icons-TNT",
			fontURI: sap.ui.require.toUrl("sap/tnt/themes/base/fonts"),
			lazy: false
		});
		await IconPool.fontLoaded("tnt");

		let iBaseRank = this.getRank("CTX_CREATE_SIBLING_IFRAME");
		const oSiblingAction = this.getCreateActions(aElementOverlays[0], true)[0];
		const aMenuItems = await this._getMenuItems(aElementOverlays, {
			pluginId: "CTX_CREATE_SIBLING_IFRAME",
			icon: "sap-icon://tnt/content-enricher",
			bAsSibling: true,
			additionalInfoKey: "IFRAME_RTA_CONTEXT_MENU_INFO",
			rank: iBaseRank,
			action: oSiblingAction
		});

		const aActions = this.getCreateActions(aElementOverlays[0], false);
		for (const oAction of aActions) {
			aMenuItems.push(await this._getMenuItems(aElementOverlays, {
				pluginId: `CTX_CREATE_CHILD_IFRAME_${oAction.aggregation.toUpperCase()}`,
				icon: "sap-icon://tnt/content-enricher",
				bAsSibling: false,
				additionalInfoKey: "IFRAME_RTA_CONTEXT_MENU_INFO",
				rank: ++iBaseRank,
				action: oAction
			}));
		}
		return aMenuItems.flat();
	};

	/**
	 * @override
	 */
	AddIFrame.prototype.getActionName = function() {
		return "addIFrame";
	};

	return AddIFrame;
});