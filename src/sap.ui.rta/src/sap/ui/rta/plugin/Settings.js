/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/Log",
	"sap/ui/dt/Util",
	"sap/ui/fl/Utils",
	"sap/ui/rta/plugin/Plugin",
	"sap/ui/rta/Utils"

], function(
	BaseLog,
	DtUtil,
	FlUtils,
	Plugin,
	Utils
) {
	"use strict";

	/**
	 * Constructor for a new Settings Plugin.
	 *
	 * @param {string} [sId] id for the new object, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new object
	 * @class The Settings allows trigger change of settings operations on the overlay
	 * @extends sap.ui.rta.plugin.Plugin
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @private
	 * @since 1.44
	 * @alias sap.ui.rta.plugin.Settings
	 */
	const Settings = Plugin.extend("sap.ui.rta.plugin.Settings", /** @lends sap.ui.rta.plugin.Settings.prototype */ {
		metadata: {
			library: "sap.ui.rta"
		}
	});

	const sPluginId = "CTX_SETTINGS";

	function getValidActions(vSettingsAction, oOverlay) {
		if (vSettingsAction.handler) {
			return [vSettingsAction];
		}
		const aSettingsActions = [];
		Object.keys(vSettingsAction).forEach((sSettingsAction) => {
			let oSettingsAction = vSettingsAction[sSettingsAction];
			if (typeof oSettingsAction === "function") {
				oSettingsAction = oSettingsAction(oOverlay.getElement());
			}
			if (oSettingsAction.handler) {
				oSettingsAction.key = sSettingsAction;
				aSettingsActions.push(oSettingsAction);
			} else {
				BaseLog.warning("Handler not found for settings action");
			}
		});
		return aSettingsActions;
	}

	/**
	 * @override
	 */
	Settings.prototype._isEditable = function(oOverlay) {
		const vSettingsAction = this.getAction(oOverlay);
		// If no additional actions are defined in settings, a handler must be present to make it available
		if (vSettingsAction) {
			const aSettingsActions = getValidActions(vSettingsAction, oOverlay);
			return aSettingsActions.some((oSettingsAction) => {
				return this._checkRelevantContainerStableID(oSettingsAction, oOverlay);
			});
		}

		return false;
	};

	/**
	 * @override
	 */
	Settings.prototype.isEnabled = function(aElementOverlays, oMenuItem) {
		const oResponsibleElementOverlay = oMenuItem.responsible?.[0] || aElementOverlays[0];
		const oSettingsAction = oMenuItem.action;
		if (typeof oSettingsAction.isEnabled !== "undefined") {
			if (typeof oSettingsAction.isEnabled === "function") {
				return oSettingsAction.isEnabled(oResponsibleElementOverlay.getElement());
			}
			return oSettingsAction.isEnabled;
		}
		return !!oSettingsAction.handler;
	};

	Settings.prototype._getUnsavedChanges = function(sId, aChangeTypes) {
		let sElementId;

		const aUnsavedChanges = this.getCommandStack().getAllExecutedCommands()
		.filter((oCommand) => {
			sElementId = oCommand.getElementId && oCommand.getElementId() || oCommand.getElement && oCommand.getElement().getId();
			return sElementId === sId && aChangeTypes.indexOf(oCommand.getChangeType()) >= 0;
		}).map((oCommand) => oCommand.getPreparedChange());

		return aUnsavedChanges;
	};

	Settings.prototype._handleFlexChangeCommand = async function(mChange, aSelectedOverlays, oCompositeCommand, oSettingsAction) {
		const mChangeSpecificData = mChange.changeSpecificData;
		let sVariantManagementReference;
		// temporarily support both
		const vSelector = mChange.selectorElement || mChange.selectorControl;
		let sControlType;
		let oControl;

		if (vSelector.controlType) {
			sControlType = vSelector.controlType;
		} else {
			oControl = vSelector;
		}

		const bHasChangeHandler = await this.hasChangeHandler(mChangeSpecificData.changeType, oControl, sControlType);
		if (aSelectedOverlays[0].getVariantManagement && bHasChangeHandler && !oSettingsAction.CAUTION_variantIndependent) {
			sVariantManagementReference = aSelectedOverlays[0].getVariantManagement();
		}
		const oSettingsCommand = await this.getCommandFactory().getCommandFor(
			vSelector,
			"settings",
			mChangeSpecificData,
			undefined,
			sVariantManagementReference
		);
		const bRuntimeOnly = oSettingsAction.runtimeOnly;
		if (oSettingsCommand && bRuntimeOnly) {
			oSettingsCommand.setRuntimeOnly(bRuntimeOnly);
		}
		return oCompositeCommand.addCommand(oSettingsCommand);
	};

	Settings.prototype._handleManifestChangeCommand = async function(mChange, oElement, oCompositeCommand) {
		const mChangeSpecificData = mChange.changeSpecificData;
		const oComponent = mChange.appComponent;

		const oManifestCommand = await this.getCommandFactory().getCommandFor(
			oElement,
			"manifest",
			{
				reference: oComponent.getManifest()["sap.app"].id,
				appComponent: oComponent,
				changeType: mChangeSpecificData.appDescriptorChangeType,
				parameters: mChangeSpecificData.content.parameters,
				texts: mChangeSpecificData.content.texts
			}
		);
		return oCompositeCommand.addCommand(oManifestCommand);
	};

	Settings.prototype._handleCompositeCommand = async function(aElementOverlays, oElement, aChanges, oSettingsAction) {
		const oCompositeCommand = await this.getCommandFactory().getCommandFor(oElement, "composite");

		const aPromises = aChanges.map((mChange) => {
			const mChangeSpecificData = mChange.changeSpecificData;
			// Flex Change
			if (mChangeSpecificData.changeType) {
				return () => this._handleFlexChangeCommand(mChange, aElementOverlays, oCompositeCommand, oSettingsAction);
			// Manifest Change
			} else if (mChangeSpecificData.appDescriptorChangeType) {
				return () => this._handleManifestChangeCommand(mChange, oElement, oCompositeCommand);
			}
			return undefined;
		});

		// Since oCompositeCommand gets modified by each handler, the promise execution must be sequential
		// to ensure the correct order of the commands
		await FlUtils.execPromiseQueueSequentially(aPromises);

		if (oCompositeCommand.getCommands().length > 0) {
			this.fireElementModified({
				command: oCompositeCommand
			});
		}
	};

	/**
	 * @override
	 */
	Settings.prototype.handler = async function(aElementOverlays, mPropertyBag) {
		const mProperties = Object.assign({}, mPropertyBag);
		const oElement = aElementOverlays[0].getElement();
		const oAction = mPropertyBag.menuItem.action;

		if (!oAction.handler) {
			throw new Error("Handler not found for settings action");
		}
		mProperties.getUnsavedChanges = this._getUnsavedChanges.bind(this);
		mProperties.styleClass = Utils.getRtaStyleClassName();

		try {
			const aChanges = await oAction.handler(oElement, mProperties);
			if (aChanges.length > 0) {
				return this._handleCompositeCommand(aElementOverlays, oElement, aChanges, oAction);
			}
		} catch (vError) {
			throw DtUtil.propagateError(
				vError,
				"Settings#handler",
				"Error occurred during handler execution",
				"sap.ui.rta.plugin"
			);
		}
	};

	/**
	 * @override
	 */
	Settings.prototype.getMenuItems = async function(aElementOverlays) {
		const oResponsibleElementOverlay = this.getResponsibleElementOverlay(aElementOverlays[0]);
		const oSettingsActions = this.getAction(oResponsibleElementOverlay);

		const aMenuItems = [];
		if (oSettingsActions) {
			const iRank = this.getRank("CTX_SETTINGS");
			const aSettingsActions = getValidActions(oSettingsActions, oResponsibleElementOverlay);

			let iIndex = 0;
			for (const oSettingsAction of aSettingsActions) {
				if (this._checkRelevantContainerStableID(oSettingsAction, oResponsibleElementOverlay)) {
					const bSingleAction = aSettingsActions.length === 1;
					aMenuItems.push(await this._getMenuItems(aElementOverlays, {
						pluginId: bSingleAction ? sPluginId : sPluginId + iIndex,
						icon: getActionIcon(oSettingsAction),
						rank: iRank + iIndex,
						action: oSettingsAction,
						submenu: formatSubMenuItems(oSettingsAction.submenu)
					}));
					iIndex++;
				} else {
					BaseLog.warning("Action is not available or relevant container has no stable id");
				}
			}
		}

		return aMenuItems.flat();
	};

	function formatSubMenuItems(aSubMenu) {
		if (aSubMenu) {
			return aSubMenu.map((oSubMenu, iIndex) => {
				return {
					id: oSubMenu.key || `${sPluginId}_SUB_${iIndex}`,
					icon: oSubMenu.icon || "blank",
					text: oSubMenu.name || "",
					enabled: oSubMenu.hasOwnProperty("enabled") ? oSubMenu.enabled : true
				};
			});
		}
		return undefined;
	}

	function getActionIcon(oSettingsAction) {
		const sDefaultSettingIcon = "sap-icon://key-user-settings";
		const sActionIcon = oSettingsAction.icon;
		if (!sActionIcon) {
			return sDefaultSettingIcon;
		}
		if (typeof sActionIcon !== "string") {
			BaseLog.error("Icon setting for settingsAction should be a string");
			return sDefaultSettingIcon;
		}
		return sActionIcon;
	}

	/**
	 * @override
	 */
	Settings.prototype.getActionName = function() {
		return "settings";
	};

	return Settings;
});