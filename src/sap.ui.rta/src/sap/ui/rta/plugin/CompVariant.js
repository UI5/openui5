/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/util/restricted/_omit",
	"sap/base/util/isEmptyObject",
	"sap/m/MessageBox",
	"sap/ui/core/Lib",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/dt/Util",
	"sap/ui/fl/write/api/ContextSharingAPI",
	"sap/ui/rta/plugin/rename/RenameDialog",
	"sap/ui/rta/plugin/Plugin",
	"sap/ui/rta/Utils"
], function(
	_omit,
	isEmptyObject,
	MessageBox,
	Lib,
	OverlayRegistry,
	DtUtil,
	ContextSharingAPI,
	RenameDialog,
	Plugin,
	Utils
) {
	"use strict";

	const CompVariant = Plugin.extend("sap.ui.rta.plugin.CompVariant", /** @lends sap.ui.rta.plugin.CompVariant.prototype */ {
		metadata: {
			library: "sap.ui.rta",
			properties: {
				// needed for rename
				oldValue: {
					type: "string"
				}
			}
		}
	});

	function isCompVariant(oElement) {
		return oElement.getMetadata().getName() === "sap.ui.comp.smartvariants.SmartVariantManagement";
	}

	async function createCommandAndFireEvent(oOverlay, aCommandNames, mProperties, oElement) {
		const oDesignTimeMetadata = oOverlay.getDesignTimeMetadata();
		const oTargetElement = oElement || oOverlay.getElement();
		let oCommand;
		try {
			if (aCommandNames.length === 1) {
				oCommand = await this.getCommandFactory().getCommandFor(oTargetElement, aCommandNames[0], mProperties, oDesignTimeMetadata);
			} else {
				oCommand = await this.getCommandFactory().getCommandFor(oTargetElement, "composite");
				for (const sCommandName of aCommandNames) {
					oCommand.addCommand(await this.getCommandFactory().getCommandFor(
						oTargetElement,
						sCommandName,
						mProperties[sCommandName],
						oDesignTimeMetadata
					));
				}
			}

			this.fireElementModified({
				command: oCommand
			});
		} catch (oError) {
			throw DtUtil.propagateError(
				oError,
				"CompVariant#createCommand",
				"Error occurred in CompVariant handler function",
				"sap.ui.rta"
			);
		}
	}

	function getAllVariants(oOverlay) {
		return oOverlay.getElement().getAllVariants();
	}

	CompVariant.prototype.init = function(...aArgs) {
		Plugin.prototype.init.apply(this, aArgs);
		this._oDialog = new RenameDialog();
	};

	// ------ rename ------
	async function renameVariant(aOverlays) {
		const [oOverlay] = aOverlays;
		const sVariantId = oOverlay.getElement().getPresentVariantId();
		const vDomRef = oOverlay.getDesignTimeMetadata().getData().variantRenameDomRef;
		const sNewText = await this._oDialog.openDialogAndHandleRename({
			overlay: oOverlay,
			domRef: vDomRef,
			action: this.getAction(oOverlay)
		});
		if (!sNewText) {
			return;
		}
		const mPropertyBag = {
			newVariantProperties: {
				[sVariantId]: {
					name: sNewText
				}
			}
		};
		createCommandAndFireEvent.call(this, oOverlay, ["compVariantUpdate"], mPropertyBag);
	}

	/**
	 * Checks if variant rename is available for the overlay.
	 *
	 * @param {sap.ui.dt.ElementOverlay} oElementOverlay - Overlay object
	 * @return {boolean} <code>true</code> if available
	 * @public
	 */
	CompVariant.prototype.isRenameAvailable = function(oElementOverlay) {
		const oVariantManagementControl = oElementOverlay.getElement();
		if (isCompVariant(oVariantManagementControl)) {
			const aVariants = getAllVariants(oElementOverlay);
			const oCurrentVariant = aVariants.find(function(oVariant) {
				return oVariant.getVariantId() === oVariantManagementControl.getPresentVariantId();
			});
			const sLayer = this.getCommandFactory().getFlexSettings().layer;
			return oCurrentVariant.isRenameEnabled(sLayer);
		}
		return false;
	};

	/**
	 * Checks if variant rename is enabled for the overlays.
	 * @param {sap.ui.dt.ElementOverlay[]} aElementOverlays - Target overlays
	 * @return {boolean} <code>true</code> if available
	 * @public
	 */
	CompVariant.prototype.isRenameEnabled = function(aElementOverlays) {
		return this.isRenameAvailable(aElementOverlays[0]);
	};

	// ------ configure ------
	function configureVariants(aOverlays) {
		const oVariantManagementControl = aOverlays[0].getElement();
		const mComponentPropertyBag = this.getCommandFactory().getFlexSettings();
		mComponentPropertyBag.variantManagementControl = oVariantManagementControl;
		const sSelectedVariantId = oVariantManagementControl.getCurrentVariantId();
		const mPropertyBag = {
			layer: this.getCommandFactory().getFlexSettings().layer,
			contextSharingComponentContainer: ContextSharingAPI.createComponent(mComponentPropertyBag),
			rtaStyleClass: Utils.getRtaStyleClassName()
		};
		oVariantManagementControl.openManageViewsDialogForKeyUser(mPropertyBag, (oData) => {
			if (!isEmptyObject(oData)) {
				createCommandAndFireEvent.call(this, aOverlays[0], ["compVariantUpdate"], {
					newVariantProperties: _omit(oData, ["default"]),
					newDefaultVariantId: oData.default,
					oldDefaultVariantId: oVariantManagementControl.getDefaultVariantId(),
					oldSelectedVariantId: sSelectedVariantId
				});
			}
		});
	}

	// ------ switch ------
	async function onDirtySwitchWarningClose(oVariantManagementOverlay, sTargetVariantId, sAction) {
		if (sAction === MessageBox.Action.CANCEL) {
			return;
		}

		const oLibraryBundle = Lib.getResourceBundleFor("sap.ui.rta");
		const oVariantManagementControl = oVariantManagementOverlay.getElement();

		if (sAction === oLibraryBundle.getText("BTN_MODIFIED_VARIANT_SAVE")) {
			// Create composite command for compVariantUpdate + compVariantSwitch
			const oCompVariantUpdateProperties = await getCompVariantUpdateProperties(oVariantManagementControl);
			const mProperties = {
				compVariantSwitch: {
					targetVariantId: sTargetVariantId,
					sourceVariantId: oVariantManagementControl.getPresentVariantId()
				},
				compVariantUpdate: oCompVariantUpdateProperties
			};
			createCommandAndFireEvent.call(this, oVariantManagementOverlay, ["compVariantUpdate", "compVariantSwitch"], mProperties);
		}
		if (sAction === oLibraryBundle.getText("BTN_MODIFIED_VARIANT_DISCARD")) {
			createCommandAndFireEvent.call(this, oVariantManagementOverlay, ["compVariantSwitch"], {
				targetVariantId: sTargetVariantId,
				sourceVariantId: oVariantManagementControl.getPresentVariantId(),
				discardVariantContent: true
			});
		}
	}

	function isSwitchEnabled(aOverlays) {
		return getAllVariants(aOverlays[0]).length > 1;
	}

	function switchVariant(aOverlays, mPropertyBag) {
		const oVariantManagementOverlay = aOverlays[0];
		const oVariantManagementControl = oVariantManagementOverlay.getElement();

		// If the variant was modified, user must choose whether to save changes before switching
		if (oVariantManagementControl.getModified()) {
			const oLibraryBundle = Lib.getResourceBundleFor("sap.ui.rta");
			const sTargetVariantId = mPropertyBag.eventItem.getParameters().item.getProperty("key");
			MessageBox.warning(oLibraryBundle.getText("MSG_CHANGE_MODIFIED_VARIANT"), {
				onClose: onDirtySwitchWarningClose.bind(this, oVariantManagementOverlay, sTargetVariantId),
				actions: [
					oLibraryBundle.getText("BTN_MODIFIED_VARIANT_SAVE"),
					oLibraryBundle.getText("BTN_MODIFIED_VARIANT_DISCARD"),
					MessageBox.Action.CANCEL
				],
				emphasizedAction: oLibraryBundle.getText("BTN_MODIFIED_VARIANT_SAVE"),
				styleClass: Utils.getRtaStyleClassName(),
				id: "compVariantWarningDialog"
			});
		} else {
			createCommandAndFireEvent.call(this, oVariantManagementOverlay, ["compVariantSwitch"], {
				targetVariantId: mPropertyBag.eventItem.getParameters().item.getProperty("key"),
				sourceVariantId: oVariantManagementControl.getPresentVariantId()
			});
		}
	}

	// ------ save ------
	async function getCompVariantUpdateProperties(oVariantManagementControl) {
		const oContent = await oVariantManagementControl.getPresentVariantContent();
		const oPropertyBag = {
			onlySave: true,
			newVariantProperties: {}
		};
		oPropertyBag.newVariantProperties[oVariantManagementControl.getPresentVariantId()] = {
			content: oContent
		};
		return oPropertyBag;
	}

	async function saveVariant(aOverlays) {
		const oVariantManagementControl = aOverlays[0].getElement();
		const oPropertyBag = await getCompVariantUpdateProperties(oVariantManagementControl);
		createCommandAndFireEvent.call(this, aOverlays[0], ["compVariantUpdate"], oPropertyBag);
	}

	function isSaveEnabled(aOverlays) {
		return aOverlays[0].getElement().currentVariantGetModified();
	}

	// ------ save as ------
	function saveAsNewVariant(aOverlays, bImplicitSaveAs) {
		const oVariantManagementControl = aOverlays[0].getElement();
		const mComponentPropertyBag = this.getCommandFactory().getFlexSettings();
		mComponentPropertyBag.variantManagementControl = oVariantManagementControl;
		const oContextSharingComponentContainer = ContextSharingAPI.createComponent(mComponentPropertyBag);
		return new Promise((fnResolve) => {
			oVariantManagementControl.openSaveAsDialogForKeyUser(Utils.getRtaStyleClassName(), async (oReturn) => {
				if (oReturn) {
					await createCommandAndFireEvent.call(this, aOverlays[0], ["compVariantSaveAs"], {
						newVariantProperties: {
							"default": oReturn.default,
							executeOnSelection: oReturn.executeOnSelection,
							content: oReturn.content,
							type: oReturn.type,
							text: oReturn.text,
							contexts: oReturn.contexts
						},
						previousDirtyFlag: oVariantManagementControl.getModified(),
						previousVariantId: oVariantManagementControl.getPresentVariantId(),
						previousDefault: oVariantManagementControl.getDefaultVariantId(),
						activateAfterUndo: !!bImplicitSaveAs
					});
				}
				fnResolve(oReturn);
			}, oContextSharingComponentContainer);
		});
	}

	// ------ change content ------
	async function onWarningClose(oVariantManagementControl, sVariantId, sAction) {
		const oLibraryBundle = Lib.getResourceBundleFor("sap.ui.rta");
		if (sAction === oLibraryBundle.getText("BTN_CREATE_NEW_VIEW")) {
			const oReturn = await saveAsNewVariant.call(this, [OverlayRegistry.getOverlay(oVariantManagementControl)], true);
			// in case the user cancels the save as the original variant is applied again and the changes are gone
			if (!oReturn) {
				oVariantManagementControl.activateVariant(sVariantId);
			}
		} else {
			oVariantManagementControl.activateVariant(sVariantId);
		}
	}

	async function changeContent(oAction, aOverlays) {
		const oLibraryBundle = Lib.getResourceBundleFor("sap.ui.rta");
		const oElementOverlay = aOverlays[0];
		const oControl = oElementOverlay.getElement();
		oAction = oAction.action || oAction;
		const oVariantManagementControl = oControl.getVariantManagement();
		// the modified flag might be changed before the dialog is closed, so it has to be saved here already
		const bIsModified = oVariantManagementControl.getModified();

		const aChangeContentData = await oAction.handler(oControl, { styleClass: Utils.getRtaStyleClassName() });
		if (aChangeContentData?.length) {
			const sPersistencyKey = aChangeContentData[0].changeSpecificData.content.persistencyKey;
			const aVariants = oVariantManagementControl.getAllVariants();
			const oCurrentVariant = aVariants.find(function(oVariant) {
				return oVariant.getVariantId() === oVariantManagementControl.getPresentVariantId();
			});

			// a variant that can't be overwritten must never get dirty,
			// instead the user needs to save the changes to a new variant
			if (oCurrentVariant.isEditEnabled(this.getCommandFactory().getFlexSettings().layer)) {
				createCommandAndFireEvent.call(this, oElementOverlay, ["compVariantContent"], {
					variantId: aChangeContentData[0].changeSpecificData.content.key,
					newContent: aChangeContentData[0].changeSpecificData.content.content,
					persistencyKey: sPersistencyKey,
					isModifiedBefore: bIsModified
				}, oVariantManagementControl);
			} else {
				MessageBox.warning(oLibraryBundle.getText("MSG_CHANGE_READONLY_VARIANT"), {
					onClose: onWarningClose.bind(this, oVariantManagementControl, oCurrentVariant.getVariantId()),
					actions: [oLibraryBundle.getText("BTN_CREATE_NEW_VIEW"), MessageBox.Action.CANCEL],
					emphasizedAction: oLibraryBundle.getText("BTN_CREATE_NEW_VIEW"),
					styleClass: Utils.getRtaStyleClassName()
				});
			}
		}
	}

	CompVariant.prototype._isEditable = function(oOverlay) {
		return this.hasStableId(oOverlay) && !!this.getAction(oOverlay);
	};

	CompVariant.prototype.getMenuItems = function(aElementOverlays) {
		const oElementOverlay = aElementOverlays[0];
		const oVariantManagementControl = oElementOverlay.getElement();
		const oAction = this.getAction(oElementOverlay);
		const aMenuItems = [];
		if (this.isAvailable([oElementOverlay])) {
			if (oAction) {
				if (oAction.changeType === "variantContent") {
					aMenuItems.push({
						id: "CTX_COMP_VARIANT_CONTENT",
						additionalInfo: this._getAdditionalInfo(oElementOverlay, oAction),
						text: this.getActionText(oElementOverlay, oAction),
						handler: changeContent.bind(this, oAction),
						enabled: true,
						rank: this.getRank("CTX_COMP_VARIANT_CONTENT"),
						icon: "sap-icon://key-user-settings"
					});
				} else {
					const sLayer = this.getCommandFactory().getFlexSettings().layer;
					const oLibraryBundle = Lib.getResourceBundleFor("sap.ui.rta");
					const aVariants = getAllVariants(oElementOverlay);
					const oCurrentVariant = aVariants.find(function(oVariant) {
						return oVariant.getVariantId() === oVariantManagementControl.getPresentVariantId();
					});

					if (oCurrentVariant.isRenameEnabled(sLayer)) {
						aMenuItems.push({
							id: "CTX_COMP_VARIANT_RENAME",
							text: oLibraryBundle.getText("CTX_RENAME"),
							handler: renameVariant.bind(this),
							enabled: true,
							rank: this.getRank("CTX_COMP_VARIANT_RENAME"),
							icon: "sap-icon://edit"
						});
					}

					if (oCurrentVariant.isEditEnabled(sLayer)) {
						aMenuItems.push({
							id: "CTX_COMP_VARIANT_SAVE",
							text: oLibraryBundle.getText("CTX_VARIANT_SAVE"),
							handler: saveVariant.bind(this),
							enabled: isSaveEnabled,
							rank: this.getRank("CTX_COMP_VARIANT_SAVE"),
							icon: "sap-icon://save"
						});
					}

					aMenuItems.push({
						id: "CTX_COMP_VARIANT_SAVE_AS",
						text: oLibraryBundle.getText("CTX_VARIANT_SAVEAS"),
						handler: saveAsNewVariant.bind(this),
						enabled: true,
						rank: this.getRank("CTX_COMP_VARIANT_SAVE_AS"),
						icon: "sap-icon://duplicate"
					});

					aMenuItems.push({
						id: "CTX_COMP_VARIANT_MANAGE",
						text: oLibraryBundle.getText("CTX_VARIANT_MANAGE"),
						handler: configureVariants.bind(this),
						enabled: true,
						rank: this.getRank("CTX_COMP_VARIANT_MANAGE"),
						icon: "sap-icon://action-settings"
					});

					const aSubmenuItems = aVariants.map(function(oVariant) {
						const bCurrentItem = oVariantManagementControl.getPresentVariantId() === oVariant.getVariantId();
						const oItem = {
							id: oVariant.getVariantId(),
							text: oVariant.getText("variantName"),
							icon: bCurrentItem ? "sap-icon://accept" : "blank",
							enabled: !bCurrentItem
						};
						return oItem;
					});

					aMenuItems.push({
						id: "CTX_COMP_VARIANT_SWITCH",
						text: oLibraryBundle.getText("CTX_VARIANT_SWITCH"),
						handler: switchVariant.bind(this),
						enabled: isSwitchEnabled,
						submenu: aSubmenuItems,
						rank: this.getRank("CTX_COMP_VARIANT_SWITCH"),
						icon: "sap-icon://switch-views"
					});
				}
			}
		}

		return aMenuItems;
	};

	CompVariant.prototype.getActionName = function() {
		return "compVariant";
	};

	CompVariant.prototype.destroy = function(...args) {
		Plugin.prototype.destroy.apply(this, args);
		this._oDialog.destroy();
		delete this._oDialog;
	};

	return CompVariant;
});