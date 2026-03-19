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
	 * @param {sap.ui.dt.ElementOverlay} oOverlay - Overlay to be checked for editable
	 * @returns {boolean} <code>true</code> if it's editable
	 * @private
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
	 * Checks if settings is enabled for oOverlay
	 *
	 * @param {sap.ui.dt.ElementOverlay[]} aElementOverlays - Target overlays
	 * @returns {boolean} <code>true</code> if it's enabled
	 * @public
	 */
	Settings.prototype.isEnabled = function(aElementOverlays) {
		const oElementOverlay = aElementOverlays[0];
		const oResponsibleElementOverlay = this.getResponsibleElementOverlay(oElementOverlay);
		const vSettingsAction = this.getAction(oResponsibleElementOverlay);
		if (vSettingsAction) {
			const oSettingsActions = getValidActions(vSettingsAction, oResponsibleElementOverlay);
			return oSettingsActions.some((oSettingsAction) => {
				if (typeof oSettingsAction.isEnabled !== "undefined") {
					if (typeof oSettingsAction.isEnabled === "function") {
						return oSettingsAction.isEnabled(oResponsibleElementOverlay.getElement());
					}
					return oSettingsAction.isEnabled;
				}
				return !!oSettingsAction.handler;
			});
		}

		return false;
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
	 * Retrieves the available actions from the DesignTime Metadata and creates
	 * the corresponding commands for them.
	 * @param {sap.ui.dt.ElementOverlay[]} aElementOverlays - Target Overlays of the action
	 * @param {object} mPropertyBag - Property bag
	 * @param {function} [mPropertyBag.fnHandler] - Handler function for the case of multiple settings actions
	 * @param {object} [oSettingsAction] - The action object defined in the designtime
	 * @returns {Promise} Returns promise resolving with the creation of the commands
	 */
	Settings.prototype.handler = async function(aElementOverlays, mPropertyBag, oSettingsAction) {
		const mProperties = Object.assign({}, mPropertyBag);
		const oElement = aElementOverlays[0].getElement();
		const fnHandler = mProperties.fnHandler || aElementOverlays[0].getDesignTimeMetadata().getAction("settings").handler;

		if (!fnHandler) {
			throw new Error("Handler not found for settings action");
		}
		mProperties.getUnsavedChanges = this._getUnsavedChanges.bind(this);
		mProperties.styleClass = Utils.getRtaStyleClassName();

		try {
			const aChanges = await fnHandler(oElement, mProperties);
			if (aChanges.length > 0) {
				return this._handleCompositeCommand(aElementOverlays, oElement, aChanges, oSettingsAction);
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
	 * Retrieve the context menu item for the actions.
	 * If multiple actions are defined for Settings, it returns multiple menu items.
	 * @param {sap.ui.dt.ElementOverlay[]} aElementOverlays - Target overlays
	 * @returns {object[]} Items with required data
	 */
	Settings.prototype.getMenuItems = async function(aElementOverlays) {
		const oElementOverlay = aElementOverlays[0];
		const oResponsibleElementOverlay = this.getResponsibleElementOverlay(oElementOverlay);
		const vSettingsActions = this.getAction(oResponsibleElementOverlay);

		const aMenuItems = [];
		if (vSettingsActions) {
			const iRank = this.getRank("CTX_SETTINGS");
			const aSettingsActions = getValidActions(vSettingsActions, oResponsibleElementOverlay);

			if (this._isEditableByPlugin(oResponsibleElementOverlay) === undefined) {
				// The responsibleElement editableByPlugin state was not evaluated yet e.g. because it
				// has no visible geometry, thus evaluateEditable now
				await this.evaluateEditable([oResponsibleElementOverlay], { onRegistration: false });
			}
			aSettingsActions.forEach((oSettingsAction, iIndex, aActions) => {
				if (
					this._checkRelevantContainerStableID(oSettingsAction, oResponsibleElementOverlay)
					&& this.isAvailable([oResponsibleElementOverlay])
				) {
					const bSingleAction = aActions.length === 1;

					aMenuItems.push({
						id: bSingleAction ? sPluginId : sPluginId + iIndex,
						additionalInfo: this._getAdditionalInfo(oResponsibleElementOverlay, oSettingsAction),
						rank: bSingleAction ? iRank : iRank + iIndex,
						text: this.getActionText(oResponsibleElementOverlay, oSettingsAction, sPluginId),
						icon: getActionIcon(oSettingsAction),
						enabled:
							(typeof oSettingsAction.isEnabled === "function"
							&& ((aElementOverlays) => oSettingsAction.isEnabled(aElementOverlays[0].getElement())))
							|| oSettingsAction.isEnabled
							|| this.isEnabled([oResponsibleElementOverlay]),
						handler: function(fnHandler, aElementOverlays, mPropertyBag) {
							mPropertyBag ||= {};
							mPropertyBag.fnHandler = fnHandler;
							return this.handler(aElementOverlays, mPropertyBag, oSettingsAction);
						}.bind(this, oSettingsAction.handler),
						submenu: formatSubMenuItems(oSettingsAction.submenu)
					});
				} else {
					BaseLog.warning("Action is not available or relevant container has no stable id");
				}
			});
		}

		return aMenuItems;
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
	 * Get the name of the action related to this plugin.
	 * @returns {string} Action name
	 */
	Settings.prototype.getActionName = function() {
		return "settings";
	};

	return Settings;
});