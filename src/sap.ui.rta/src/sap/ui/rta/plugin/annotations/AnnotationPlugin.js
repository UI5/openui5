/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/Log",
	"sap/ui/base/DesignTime",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/dt/Util",
	"sap/ui/fl/write/api/PersistenceWriteAPI",
	"sap/ui/fl/Utils",
	"sap/ui/rta/plugin/annotations/AnnotationChangeDialog",
	"sap/ui/rta/plugin/annotations/AnnotationTypes",
	"sap/ui/rta/plugin/Plugin"
], function(
	BaseLog,
	DesignTime,
	JsControlTreeModifier,
	DtUtil,
	PersistenceWriteAPI,
	Utils,
	AnnotationChangeDialog,
	AnnotationTypes,
	Plugin
) {
	"use strict";

	async function handleCompositeCommand(oElement, oAction, aAnnotationChanges, aLegacyRenameChanges) {
		const oCompositeCommand = await this.getCommandFactory().getCommandFor(oElement, "composite");
		for (const oChange of aAnnotationChanges) {
			// the annotation could have different text types, depending on where the annotation is used
			// but the backend needs to know the type, so we just set it to "XFLD" if it is not defined
			if (oChange.content.text && !oChange.content.textType) {
				oChange.content.textType = "XFLD";
			}
			const oAnnotationCommand = await this.getCommandFactory().getCommandFor(
				oElement,
				"annotation",
				{
					changeType: oAction.changeType,
					serviceUrl: oChange.serviceUrl,
					content: { ...oChange.content, objectTemplateInfo: oAction.objectTemplateInfo },
					// aLegacyRenameChanges is only passed for singleRename scenarios, where there is only one annotation change to be saved
					// so we can simply add it in the loop
					changesToDelete: aLegacyRenameChanges
				}
			);
			oCompositeCommand.addCommand(oAnnotationCommand);
		}

		if (oCompositeCommand.getCommands().length > 0) {
			this.fireElementModified({
				command: oCompositeCommand
			});
		}
	}

	function getActionText(oElementOverlay, oAction) {
		const vName = oAction.title;
		const oElement = oElementOverlay.getElement();
		if (vName) {
			if (typeof vName === "function") {
				return vName(oElement);
			}
			const sText = oElementOverlay.getDesignTimeMetadata()?.getLibraryText(oElement, vName);
			if (sText) {
				return sText;
			}
		}
		BaseLog.error("Annotation action title is not properly defined in the designtime metadata");
		return undefined;
	}

	function getActionIcon(oAnnotationAction) {
		const sDefaultIcon = oAnnotationAction.type === AnnotationTypes.StringType ? "sap-icon://edit" : "sap-icon://request";
		const sActionIcon = oAnnotationAction.icon;
		if (!sActionIcon) {
			return sDefaultIcon;
		}
		if (typeof sActionIcon !== "string") {
			BaseLog.error("Icon setting for annotation action should be a string");
			return sDefaultIcon;
		}
		return sActionIcon;
	}

	function checkDesigntimeActionProperties(oAction) {
		if (oAction.singleRename && !oAction.controlBasedRenameChangeType) {
			BaseLog.error("When using singleRename, controlBasedRenameChangeType must also be defined");
			return false;
		}
		return true;
	}

	/**
	 * Constructor for a new Annotation Plugin.
	 * Multiple annotation actions can be defined for the same overlay. Each action is represented by a menu item.
	 * The Annotation change specific data are entered in a dialog which returns the change data.
	 * One action/dialog can also create multiple changes.
	 *
	 * @param {string} [sId] id for the new object, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new object
	 * @class
	 * @extends sap.ui.rta.plugin.Plugin
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @private
	 * @since 1.132
	 * @alias sap.ui.rta.plugin.AnnotationPlugin
	 */
	const AnnotationPlugin = Plugin.extend("sap.ui.rta.plugin.annotations.AnnotationPlugin", /** @lends sap.ui.rta.plugin.annotations.AnnotationPlugin.prototype */ {
		metadata: {
			library: "sap.ui.rta"
		}
	});

	const sPluginIdDefault = "CTX_ANNOTATION";
	const sPluginIdSingleLabelChange = "CTX_ANNOTATION_CHANGE_SINGLE_LABEL";

	AnnotationPlugin.prototype.init = function(...aArgs) {
		Plugin.prototype.init.apply(this, aArgs);
		this._oDialog = new AnnotationChangeDialog();
	};

	/**
	 * @override
	 */
	AnnotationPlugin.prototype._isEditable = function(oElementOverlay) {
		// Currently annotation changes are not supported for developers,
		// because the changes are not guaranteed to be loaded in time to be properly applied
		if (DesignTime.isDesignModeEnabled()) {
			return false;
		}

		const oActions = this.getAction(oElementOverlay);

		if (oActions) {
			return Object.values(oActions).some((oAction) => {
				return oAction.changeType;
			});
		}

		return false;
	};

	/**
	 * @override
	 */
	AnnotationPlugin.prototype.handler = async function(aElementOverlays, mPropertyBag) {
		const oElementOverlay = aElementOverlays[0];
		const oElement = oElementOverlay.getElement();
		const oAction = mPropertyBag.menuItem.action;

		try {
			const aAnnotationChanges = await this._oDialog.openDialogAndHandleChanges({
				title: this.getActionText(oElementOverlay, oAction),
				type: oAction.type,
				control: oElement,
				delegate: oAction.delegate,
				annotation: oAction.annotation,
				description: oAction.description,
				singleRename: oAction.singleRename,
				controlBasedRenameChangeType: oAction.controlBasedRenameChangeType,
				featureKey: oAction.featureKey
			});

			if (aAnnotationChanges.length) {
				const aLegacyRenameChanges = [];
				// for single rename scenarios we are able to remove any existing control based rename change in the context of
				// the given control and change type
				if (oAction.singleRename) {
					const aUIChanges = await PersistenceWriteAPI._getUIChanges({
						selector: oElement
					});
					const oAppComponent = Utils.getAppComponentForControl(oElement);
					aLegacyRenameChanges.push(...aUIChanges.filter((oChange) =>
						oChange.getChangeType() === oAction.controlBasedRenameChangeType
						&& JsControlTreeModifier.getControlIdBySelector(oChange.getSelector(), oAppComponent) === oElement.getId()
					));
				}
				return handleCompositeCommand.call(this, oElement, oAction, aAnnotationChanges, aLegacyRenameChanges);
			}
			return undefined;
		} catch (vError) {
			throw DtUtil.propagateError(
				vError,
				"AnnotationPlugin#handler",
				"Error occurred during handler execution",
				"sap.ui.rta.plugin.annotations.AnnotationPlugin"
			);
		}
	};

	/**
	 * @override
	 */
	AnnotationPlugin.prototype.getMenuItems = async function(aElementOverlays) {
		const oElementOverlay = aElementOverlays[0];
		const oResponsibleElementOverlay = this.getResponsibleElementOverlay(oElementOverlay);
		const oAnnotationActionMap = this.getAction(oResponsibleElementOverlay);

		const aMenuItems = [];
		if (oAnnotationActionMap) {
			let iIndex = 0;
			for (const sKey in oAnnotationActionMap) {
				const oAction = oAnnotationActionMap[sKey];
				oAction.featureKey = sKey;
				const sPluginId = oAction.type === AnnotationTypes.StringType && oAction.singleRename
					? sPluginIdSingleLabelChange
					: sPluginIdDefault;
				const iRank = this.getRank(sPluginId);
				const sActionText = getActionText(oResponsibleElementOverlay, oAction);
				if (checkDesigntimeActionProperties(oAction) && sActionText) {
					aMenuItems.push(await this._getMenuItems(aElementOverlays, {
						pluginId: `${sPluginId}_${sKey}`,
						icon: getActionIcon(oAction),
						rank: iRank + iIndex,
						action: oAction,
						text: sActionText
					}));
				}
				iIndex++;
			}
		}

		return aMenuItems.flat();
	};

	/**
	 * @override
	 */
	AnnotationPlugin.prototype.getActionName = function() {
		return "annotation";
	};

	AnnotationPlugin.prototype.destroy = function(...args) {
		Plugin.prototype.destroy.apply(this, args);
		this._oDialog.destroy();
		delete this._oDialog;
	};

	return AnnotationPlugin;
});