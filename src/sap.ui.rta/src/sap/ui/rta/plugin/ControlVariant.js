/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/Log",
	"sap/m/MessageBox",
	"sap/ui/base/ManagedObject",
	"sap/ui/core/Element",
	"sap/ui/core/Lib",
	"sap/ui/dt/ElementOverlay",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/dt/OverlayUtil",
	"sap/ui/dt/Util",
	"sap/ui/fl/variants/VariantManagement",
	"sap/ui/fl/variants/VariantManager",
	"sap/ui/fl/write/api/ContextSharingAPI",
	"sap/ui/fl/Layer",
	"sap/ui/fl/Utils",
	"sap/ui/rta/plugin/rename/RenameDialog",
	"sap/ui/rta/plugin/Plugin",
	"sap/ui/rta/Utils"
], function(
	Log,
	MessageBox,
	ManagedObject,
	Element,
	Lib,
	ElementOverlay,
	OverlayRegistry,
	OverlayUtil,
	DtUtil,
	VariantManagement,
	VariantManager,
	ContextSharingAPI,
	Layer,
	flUtils,
	RenameDialog,
	Plugin,
	Utils
) {
	"use strict";

	/**
	 * Constructor for a new ControlVariant Plugin.
	 *
	 * @param {string} [sId] id for the new object, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new object
	 * @class The ControlVariant allows propagation of variantManagement key
	 * @extends sap.ui.rta.plugin.Plugin
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @private
	 * @since 1.50
	 * @alias sap.ui.rta.plugin.ControlVariant
	 */

	/* Mix-in Variant Methods */
	ElementOverlay.prototype._variantManagement = undefined;
	ElementOverlay.prototype.getVariantManagement = function() { return this._variantManagement;};
	ElementOverlay.prototype.setVariantManagement = function(sKey) { this._variantManagement = sKey; };
	ElementOverlay.prototype.hasVariantManagement = function() { return !!this._variantManagement; };

	function destroyManageDialog(oOverlay) {
		const oManageDialog = oOverlay.getElement().getManageDialog();
		if (oManageDialog && !oManageDialog.bIsDestroyed) {
			oManageDialog.destroy();
		}
	}

	const ControlVariant = Plugin.extend("sap.ui.rta.plugin.ControlVariant", /** @lends sap.ui.rta.plugin.ControlVariant.prototype */ {
		metadata: {
			library: "sap.ui.rta",
			properties: {
				oldValue: "string"
			},
			associations: {},
			events: {}
		}
	});

	function getCommandForSave(oOverlay) {
		const oElement = oOverlay.getElement();
		const oDesignTimeMetadata = oOverlay.getDesignTimeMetadata();
		const sVariantManagementReference = oOverlay.getVariantManagement();

		return this.getCommandFactory().getCommandFor(oElement, "save", {}, oDesignTimeMetadata, sVariantManagementReference);
	}

	function getCommandForSwitch(oOverlay, sNewVariantReference, sCurrentVariantReference, bDiscardVariantContent) {
		const oElement = oOverlay.getElement();
		const oDesignTimeMetadata = oOverlay.getDesignTimeMetadata();

		return this.getCommandFactory().getCommandFor(oElement, "switch", {
			targetVariantReference: sNewVariantReference,
			sourceVariantReference: sCurrentVariantReference,
			discardVariantContent: bDiscardVariantContent
		}, oDesignTimeMetadata);
	}

	ControlVariant.prototype.init = function(...aArgs) {
		Plugin.prototype.init.apply(this, aArgs);
		this._oDialog = new RenameDialog();
	};

	/**
	 * Registers an overlay.
	 *
	 * @param {sap.ui.dt.Overlay} oOverlay overlay object
	 * @override
	 */
	ControlVariant.prototype.registerElementOverlay = function(...aArgs) {
		const [oOverlay] = aArgs;
		const oControl = oOverlay.getElement();
		let sVariantManagementReference;

		Plugin.prototype.registerElementOverlay.apply(this, aArgs);

		if (oControl instanceof VariantManagement) {
			const vAssociationElement = oControl.getFor();
			const oAppComponent = flUtils.getAppComponentForControl(oControl);
			const sControlId = oControl.getId();
			sVariantManagementReference = oAppComponent.getLocalId(sControlId) || sControlId;
			oOverlay.setVariantManagement(sVariantManagementReference);

			// If "for" association is not valid
			if (
				!vAssociationElement
				|| (Array.isArray(vAssociationElement) && vAssociationElement.length === 0)
			) {
				return;
			}

			const aVariantManagementTargetElements = !Array.isArray(vAssociationElement) ? [vAssociationElement] : vAssociationElement;

			// Propagate variant management reference to all children overlays starting from the "for" association element as the root
			aVariantManagementTargetElements.forEach(function(sVariantManagementTargetElement) {
				const oVariantManagementTargetElement = sVariantManagementTargetElement instanceof ManagedObject
					? sVariantManagementTargetElement : Element.getElementById(sVariantManagementTargetElement);
				const oVariantManagementTargetOverlay = OverlayRegistry.getOverlay(oVariantManagementTargetElement);

				// the control or overlay might not be available on rta start (e.g. dialog or view hidden by navigation)
				if (!oVariantManagementTargetOverlay) {
					const fnEventHandler = (oEvent, sVMTargetElementId) => {
						const oCreatedOverlay = oEvent.getParameter("elementOverlay");
						if (oCreatedOverlay.getElement().getId() === sVMTargetElementId) {
							this._propagateVariantManagement(oCreatedOverlay, sVariantManagementReference);
							this.getDesignTime().detachEvent("elementOverlayCreated", fnEventHandler);
						}
					};

					this.getDesignTime().attachEvent("elementOverlayCreated", sVariantManagementTargetElement, fnEventHandler, this);
				} else {
					this._propagateVariantManagement(oVariantManagementTargetOverlay, sVariantManagementReference);
				}
			}.bind(this));
			destroyManageDialog(oOverlay);
		} else if (!oOverlay.getVariantManagement()) {
			// Case where overlay is dynamically created - variant management reference should be identified from parent
			sVariantManagementReference = this._getVariantManagementFromParent(oOverlay);
			if (sVariantManagementReference) {
				oOverlay.setVariantManagement(sVariantManagementReference);
			}
		}
	};

	ControlVariant.prototype._isPersonalizationMode = function() {
		return this.getCommandFactory().getFlexSettings().layer === Layer.USER;
	};

	/**
	 * Top-down approach for setting VariantManagement reference to all children overlays.
	 *
	 * @param {sap.ui.dt.Overlay} oParentElementOverlay overlay object for which children overlays are computed
	 * @param {string} sVariantManagementReference VariantManagement reference to be set
	 * @returns {array} array of rendered ElementOverlays which have been set with passed VariantManagement reference
	 * @private
	 */
	ControlVariant.prototype._propagateVariantManagement = function(oParentElementOverlay, sVariantManagementReference) {
		oParentElementOverlay.setVariantManagement(sVariantManagementReference);
		let aElementOverlaysRendered = OverlayUtil.getAllChildOverlays(oParentElementOverlay);

		aElementOverlaysRendered.forEach(function(oElementOverlay) {
			aElementOverlaysRendered = aElementOverlaysRendered.concat(
				this._propagateVariantManagement(oElementOverlay, sVariantManagementReference)
			);
		}.bind(this));

		return aElementOverlaysRendered;
	};

	/**
	 * Bottom-up approach for setting VariantManagement reference from parent ElementOverlays.
	 *
	 * @param {sap.ui.dt.Overlay} oOverlay overlay object for which VariantManagement reference is to be set
	 * @returns {string} VariantManagement reference
	 * @private
	 */
	ControlVariant.prototype._getVariantManagementFromParent = function(oOverlay) {
		const sVariantManagementReference = oOverlay.getVariantManagement();
		if (!sVariantManagementReference && oOverlay.getParentElementOverlay()) {
			return this._getVariantManagementFromParent(oOverlay.getParentElementOverlay());
		}
		return sVariantManagementReference;
	};

	/**
	 * Additionally to super->deregisterOverlay this method detatches the browser events
	 *
	 * @param {sap.ui.dt.Overlay} oOverlay overlay object
	 * @override
	 */
	ControlVariant.prototype.deregisterElementOverlay = function(...aArgs) {
		const oOverlay = aArgs[0];
		if (this._isVariantManagementControl(oOverlay)) {
			destroyManageDialog(oOverlay);
		}
		this.removeFromPluginsList(oOverlay);
		Plugin.prototype.deregisterElementOverlay.apply(this, aArgs);
	};

	/**
	 * @param {sap.ui.dt.ElementOverlay} oOverlay overlay
	 * @returns {boolean} editable or not
	 * @private
	 */
	ControlVariant.prototype._isEditable = function(oOverlay) {
		if (this._isPersonalizationMode()) {
			return false;
		}
		return this._isVariantManagementControl(oOverlay) && this.hasStableId(oOverlay);
	};

	ControlVariant.prototype._isVariantManagementControl = function(oOverlay) {
		const oElement = oOverlay.getElement();
		const vAssociationElement = oElement.getAssociation("for");
		return !!(vAssociationElement && oElement instanceof VariantManagement);
	};

	/**
	 * Checks if variant switch is available for oOverlay.
	 * @param {sap.ui.dt.ElementOverlay} oElementOverlay - Overlay object
	 * @return {boolean} <code>true</code> if available
	 * @public
	 */
	ControlVariant.prototype.isVariantSwitchAvailable = function(oElementOverlay) {
		return this._isVariantManagementControl(oElementOverlay);
	};

	/**
	 * Checks if Variant Switch is enabled for oOverlay.
	 * @param {sap.ui.dt.ElementOverlay[]} aElementOverlays - Target overlays
	 * @return {boolean} <code>true</code> if enabled
	 * @public
	 */
	ControlVariant.prototype.isVariantSwitchEnabled = function(aElementOverlays) {
		const oElementOverlay = aElementOverlays[0];
		if (this._isVariantManagementControl(oElementOverlay)) {
			const oVMControl = oElementOverlay.getElement();
			const sVariantManagementReference = oElementOverlay.getVariantManagement ? oElementOverlay.getVariantManagement() : undefined;
			if (!sVariantManagementReference) {
				return false;
			}
			const aVariants = oVMControl.getVariants().reduce(function(aReducedVariants, oVariant) {
				if (oVariant.getVisible()) {
					return aReducedVariants.concat(oVariant);
				}
				return aReducedVariants;
			}, []);
			const bEnabled = aVariants.length > 1;
			return bEnabled;
		}
		return false;
	};

	/**
	 * Checks if variant rename is available for the overlay.
	 *
	 * @param {sap.ui.dt.ElementOverlay} oElementOverlay - Overlay object
	 * @return {boolean} <code>true</code> if available
	 * @public
	 */
	ControlVariant.prototype.isRenameAvailable = function(oElementOverlay) {
		return this._isVariantManagementControl(oElementOverlay);
	};

	/**
	 * Checks if variant rename is enabled for the overlays.
	 * @param {sap.ui.dt.ElementOverlay[]} aElementOverlays - Target overlays
	 * @return {boolean} <code>true</code> if available
	 * @public
	 */
	ControlVariant.prototype.isRenameEnabled = function(aElementOverlays) {
		return this._isVariantManagementControl(aElementOverlays[0]);
	};

	/**
	 * Checks if variant Save is available for the overlay.
	 * @param {sap.ui.dt.ElementOverlay} oElementOverlay - Overlay object
	 * @return {boolean} <code>true</code> if available
	 * @public
	 */
	ControlVariant.prototype.isVariantSaveAvailable = function(oElementOverlay) {
		return this._isVariantManagementControl(oElementOverlay);
	};

	/**
	 * Checks if variant Save is enabled for the overlays.
	 * @param {sap.ui.dt.ElementOverlay[]} aElementOverlays - Target overlays
	 * @return {boolean} <code>true</code> if available
	 * @public
	 */
	ControlVariant.prototype.isVariantSaveEnabled = function(aElementOverlays) {
		const oOverlay = aElementOverlays[0];
		const oVMControl = oOverlay.getElement();
		return oVMControl.getModified();
	};

	/**
	 * Checks if variant SaveAs is available for the overlay.
	 * @param {sap.ui.dt.ElementOverlay} oElementOverlay - Overlay object
	 * @return {boolean} <code>true</code> if available
	 * @public
	 */
	ControlVariant.prototype.isVariantSaveAsAvailable = function(oElementOverlay) {
		return this._isVariantManagementControl(oElementOverlay);
	};

	/**
	 * Checks if variant SaveAs is enabled for the overlays.
	 * @param {sap.ui.dt.ElementOverlay[]} aElementOverlays - Target overlays
	 * @return {boolean} <code>true</code> if available
	 * @public
	 */
	ControlVariant.prototype.isVariantSaveAsEnabled = function(aElementOverlays) {
		return this._isVariantManagementControl(aElementOverlays[0]);
	};

	/**
	 * Checks if variant configure is available for the overlay.
	 * @param {sap.ui.dt.ElementOverlay} oElementOverlay - Overlay object
	 * @return {boolean} <code>true</code> if available
	 * @public
	 */
	ControlVariant.prototype.isVariantConfigureAvailable = function(oElementOverlay) {
		return this._isVariantManagementControl(oElementOverlay);
	};

	/**
	 * Checks if variant configure is enabled for oOverlay.
	 * @param {sap.ui.dt.ElementOverlay[]} aElementOverlays - Target overlays
	 * @return {boolean} <code>true</code> if available
	 * @public
	 */
	ControlVariant.prototype.isVariantConfigureEnabled = function(aElementOverlays) {
		return this._isVariantManagementControl(aElementOverlays[0]);
	};

	/**
	 * Performs a variant switch.
	 *
	 * @param {object} oTargetOverlay Target variant management overlay
	 * @param {string} sNewVariantReference The new variant reference
	 * @param {string} sCurrentVariantReference The current variant reference
	 * @public
	 */
	ControlVariant.prototype.switchVariant = function(oTargetOverlay, sNewVariantReference, sCurrentVariantReference) {
		const oTargetElement = oTargetOverlay.getElement();
		const oLibraryBundle = Lib.getResourceBundleFor("sap.ui.rta");

		function onDirtySwitchWarningClose(sAction) {
			if (sAction === MessageBox.Action.CANCEL) {
				return;
			}

			if (sAction === oLibraryBundle.getText("BTN_MODIFIED_VARIANT_SAVE")) {
				let oCompositeCommand;
				this.getCommandFactory().getCommandFor(oTargetElement, "composite")
				.then(function(_oCompositeCommand) {
					oCompositeCommand = _oCompositeCommand;
					return getCommandForSave.call(this, oTargetOverlay);
				}.bind(this))
				.then(function(oSaveCommand) {
					oCompositeCommand.addCommand(oSaveCommand);
					return getCommandForSwitch.call(this, oTargetOverlay, sNewVariantReference, sCurrentVariantReference);
				}.bind(this))
				.then(function(oSwitchCommand) {
					oCompositeCommand.addCommand(oSwitchCommand);
					this.fireElementModified({
						command: oCompositeCommand
					});
				}.bind(this));
			}

			if (sAction === oLibraryBundle.getText("BTN_MODIFIED_VARIANT_DISCARD")) {
				getCommandForSwitch.call(
					this,
					oTargetOverlay,
					sNewVariantReference,
					sCurrentVariantReference,
					true // discard variant content
				)
				.then(function(oSwitchCommand) {
					this.fireElementModified({
						command: oSwitchCommand
					});
				}.bind(this));
			}
		}

		if (oTargetElement.getModified()) {
			MessageBox.warning(oLibraryBundle.getText("MSG_CHANGE_MODIFIED_VARIANT"), {
				onClose: onDirtySwitchWarningClose.bind(this),
				actions: [
					oLibraryBundle.getText("BTN_MODIFIED_VARIANT_SAVE"),
					oLibraryBundle.getText("BTN_MODIFIED_VARIANT_DISCARD"),
					MessageBox.Action.CANCEL
				],
				emphasizedAction: oLibraryBundle.getText("BTN_MODIFIED_VARIANT_SAVE"),
				styleClass: Utils.getRtaStyleClassName(),
				id: "controlVariantWarningDialog"
			});
		} else {
			getCommandForSwitch.call(this, oTargetOverlay, sNewVariantReference, sCurrentVariantReference)
			.then(function(oSwitchCommand) {
				this.fireElementModified({
					command: oSwitchCommand
				});
			}.bind(this))

			.catch(function(oMessage) {
				throw DtUtil.createError("ControlVariant#switchVariant", oMessage, "sap.ui.rta");
			});
		}
	};

	/**
	 * Performs a variant set title.
	 * @param {sap.ui.dt.ElementOverlay[]} aElementOverlays - Target overlays
	 * @public
	 */
	ControlVariant.prototype.renameVariant = async function(aElementOverlays) {
		const [oOverlay] = aElementOverlays;
		const sVariantManagementReference = oOverlay.getVariantManagement();
		const oDesignTimeMetadata = oOverlay.getDesignTimeMetadata();
		const oRenamedElement = oOverlay.getElement();
		const vDomRef = oDesignTimeMetadata.getData().variantRenameDomRef;
		const sNewText = await this._oDialog.openDialogAndHandleRename({
			overlay: oOverlay,
			domRef: vDomRef,
			action: this.getAction(oOverlay)
		});
		if (!sNewText) {
			return;
		}

		const oSetTitleCommand = await this._createSetTitleCommand({
			text: sNewText,
			element: oRenamedElement,
			designTimeMetadata: oDesignTimeMetadata,
			variantManagementReference: sVariantManagementReference
		});

		this.fireElementModified({
			command: oSetTitleCommand
		});
	};

	ControlVariant.prototype.createSaveCommand = function(aElementOverlays) {
		const oOverlay = aElementOverlays[0];
		return getCommandForSave.call(this, oOverlay)
		.then(function(oSaveCommand) {
			this.fireElementModified({
				command: oSaveCommand
			});
		}.bind(this));
	};

	ControlVariant.prototype.createSaveAsCommand = function(aElementOverlays) {
		const oOverlay = aElementOverlays[0];
		const oVMControl = oOverlay.getElement();
		const oDesignTimeMetadata = oOverlay.getDesignTimeMetadata();
		const sVariantManagementReference = oOverlay.getVariantManagement();

		return this.getCommandFactory().getCommandFor(oVMControl, "saveAs", {
			sourceVariantReference: oVMControl.getCurrentVariantReference()
		}, oDesignTimeMetadata, sVariantManagementReference)
		.then(function(oSaveAsCommand) {
			this.fireElementModified({
				command: oSaveAsCommand
			});
		}.bind(this));
	};

	/**
	 * Sets the domref text, creates a setTitle command and fires element modified.
	 * @param {map} mPropertyBag - (required) contains required properties to create the command
	 * @returns {object} setTitle command
	 * @private
	 */
	ControlVariant.prototype._createSetTitleCommand = function(mPropertyBag) {
		return this.getCommandFactory().getCommandFor(mPropertyBag.element, "setTitle", {
			newText: mPropertyBag.text
		}, mPropertyBag.designTimeMetadata, mPropertyBag.variantManagementReference)

		.catch(function(oMessage) {
			Log.error("Error during rename: ", oMessage);
		});
	};

	/**
	 * Opens a dialog for Variant configuration.
	 * @param {sap.ui.dt.ElementOverlay[]} aElementOverlays - Target overlays
	 * @returns {Promise} Resolving when the dialog is closed and the command is created
	 * @public
	 */
	ControlVariant.prototype.configureVariants = function(aElementOverlays) {
		const oElementOverlay = aElementOverlays[0];
		const oVariantManagementControl = oElementOverlay.getElement();
		const sVariantManagementReference = oElementOverlay.getVariantManagement();
		const oDesignTimeMetadata = oElementOverlay.getDesignTimeMetadata();
		const mFlexSettings = this.getCommandFactory().getFlexSettings();
		const mComponentPropertyBag = mFlexSettings;
		mComponentPropertyBag.variantManagementControl = oVariantManagementControl;

		return VariantManager.manageVariants(
			oVariantManagementControl,
			sVariantManagementReference,
			mFlexSettings.layer,
			Utils.getRtaStyleClassName(),
			ContextSharingAPI.createComponent(mComponentPropertyBag)
		)
		.then(function(oModelChanges) {
			if (oModelChanges.changes.length > 0) {
				return this.getCommandFactory().getCommandFor(
					oVariantManagementControl,
					"configure",
					{
						control: oVariantManagementControl,
						changes: oModelChanges.changes,
						deletedVariants: oModelChanges.variantsToBeDeleted
					},
					oDesignTimeMetadata,
					sVariantManagementReference
				);
			}
			return undefined;
		}.bind(this))

		.then(function(oConfigureCommand) {
			if (oConfigureCommand) {
				this.fireElementModified({
					command: oConfigureCommand
				});
			}
		}.bind(this))

		.catch(function(oMessage) {
			throw DtUtil.createError("ControlVariant#configureVariants", oMessage, "sap.ui.rta");
		});
	};

	/**
	 * Retrieve the context menu item for the actions.
	 * @param {sap.ui.dt.ElementOverlay[]} aElementOverlays - Target overlays
	 * @return {object[]} - array containing the items with required data
	 */
	ControlVariant.prototype.getMenuItems = function(aElementOverlays) {
		const oElementOverlay = aElementOverlays[0];
		const oVMControl = oElementOverlay.getElement();
		const aMenuItems = [];

		if (this.isRenameAvailable(oElementOverlay)) {
			aMenuItems.push({
				id: "CTX_VARIANT_SET_TITLE",
				text: Lib.getResourceBundleFor("sap.ui.rta").getText("CTX_RENAME"),
				handler: this.renameVariant.bind(this),
				enabled: this.isRenameEnabled.bind(this),
				rank: this.getRank("CTX_VARIANT_SET_TITLE"),
				icon: "sap-icon://edit"
			});
		}

		if (this.isVariantSaveAvailable(oElementOverlay)) {
			aMenuItems.push({
				id: "CTX_VARIANT_SAVE",
				text: Lib.getResourceBundleFor("sap.ui.rta").getText("CTX_VARIANT_SAVE"),
				handler: this.createSaveCommand.bind(this),
				enabled: this.isVariantSaveEnabled.bind(this),
				rank: this.getRank("CTX_VARIANT_SAVE"),
				icon: "sap-icon://save"
			});
		}

		if (this.isVariantSaveAsAvailable(oElementOverlay)) {
			aMenuItems.push({
				id: "CTX_VARIANT_SAVEAS",
				text: Lib.getResourceBundleFor("sap.ui.rta").getText("CTX_VARIANT_SAVEAS"),
				handler: this.createSaveAsCommand.bind(this),
				enabled: this.isVariantSaveAsEnabled.bind(this),
				rank: this.getRank("CTX_VARIANT_SAVEAS"),
				icon: "sap-icon://duplicate"
			});
		}

		if (this.isVariantConfigureAvailable(oElementOverlay)) {
			aMenuItems.push({
				id: "CTX_VARIANT_MANAGE",
				text: Lib.getResourceBundleFor("sap.ui.rta").getText("CTX_VARIANT_MANAGE"),
				handler: this.configureVariants.bind(this),
				enabled: this.isVariantConfigureEnabled.bind(this),
				startSection: true,
				rank: this.getRank("CTX_VARIANT_MANAGE"),
				icon: "sap-icon://action-settings"
			});
		}

		if (this.isVariantSwitchAvailable(oElementOverlay)) {
			const oCurrentVariant = oVMControl.getVariantByKey(oVMControl.getCurrentVariantReference());
			const aSubmenuItems = oVMControl.getVariants().reduce(function(aReducedVariants, oVariant) {
				if (oVariant.getVisible()) {
					const bCurrentItem = oCurrentVariant.getKey() === oVariant.getKey();
					const oItem = {
						id: oVariant.getKey(),
						text: oVariant.getTitle(),
						icon: bCurrentItem ? "sap-icon://accept" : "blank",
						enabled: !bCurrentItem
					};
					return aReducedVariants.concat(oItem);
				}
				return aReducedVariants;
			}, []);

			aMenuItems.push({
				id: "CTX_VARIANT_SWITCH_SUBMENU",
				text: Lib.getResourceBundleFor("sap.ui.rta").getText("CTX_VARIANT_SWITCH"),
				handler: function(aElementOverlays, mPropertyBag) {
					const sNewVariantKey = mPropertyBag.eventItem.getParameters().item.getProperty("key");
					const oTargetOverlay = aElementOverlays[0];
					const sCurrentVariantKey = oCurrentVariant.getKey();
					return this.switchVariant(oTargetOverlay, sNewVariantKey, sCurrentVariantKey);
				}.bind(this),
				enabled: this.isVariantSwitchEnabled.bind(this),
				submenu: aSubmenuItems,
				rank: this.getRank("CTX_VARIANT_SWITCH_SUBMENU"),
				icon: "sap-icon://switch-views"
			});
		}

		return aMenuItems;
	};

	ControlVariant.prototype.getActionName = function() {
		return "controlVariant";
	};

	ControlVariant.prototype.destroy = function(...args) {
		Plugin.prototype.destroy.apply(this, args);
		this._oDialog.destroy();
		delete this._oDialog;
	};

	return ControlVariant;
});