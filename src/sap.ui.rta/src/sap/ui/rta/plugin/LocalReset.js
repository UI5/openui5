/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/Element",
	"sap/ui/core/Lib",
	"sap/ui/rta/plugin/Plugin",
	"sap/ui/dt/Util",
	"sap/ui/fl/Utils",
	"sap/ui/fl/apply/api/ControlVariantApplyAPI",
	"sap/ui/fl/write/api/LocalResetAPI",
	"sap/ui/rta/command/CompositeCommand",
	"sap/m/MessageToast",
	"sap/ui/dt/OverlayRegistry"
], function(
	Element,
	Lib,
	Plugin,
	DtUtil,
	FlUtils,
	ControlVariantApplyAPI,
	LocalResetAPI,
	CompositeCommand,
	MessageToast,
	OverlayRegistry
) {
	"use strict";

	/**
	 * Constructor for a new LocalReset plugin.
	 *
	 * @class
	 * @extends sap.ui.rta.plugin.Plugin
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @private
	 * @since 1.90
	 * @alias sap.ui.rta.plugin.LocalReset
	 */
	const LocalReset = Plugin.extend("sap.ui.rta.plugin.LocalReset", /** @lends sap.ui.rta.plugin.LocalReset.prototype */ {
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
	LocalReset.prototype._isEditable = function(oOverlay) {
		if (!this.hasStableId(oOverlay)) {
			return false;
		}
		const vLocalResetAction = this.getAction(oOverlay);
		return !!vLocalResetAction;
	};

	/**
	 * @override
	 */
	LocalReset.prototype.isEnabled = function(aElementOverlays, oMenuItem) {
		if (aElementOverlays.length !== 1) {
			return false;
		}
		const oElementOverlay = oMenuItem.responsible?.[0] || aElementOverlays[0];
		const oElement = oElementOverlay.getElement();
		const oAction = oMenuItem.action;
		if (!oAction) {
			return false;
		}

		let bIsActionEnabled = true;
		if (typeof oAction.isEnabled !== "undefined") {
			if (typeof oAction.isEnabled === "function") {
				bIsActionEnabled = oAction.isEnabled(oElement);
			} else {
				bIsActionEnabled = oAction.isEnabled;
			}
		}

		const oRelevantElement = oAction.changeOnRelevantContainer ? oElementOverlay.getRelevantContainer() : oElement;
		const oRelevantOverlay = OverlayRegistry.getOverlay(oRelevantElement);
		const oAppComponent = FlUtils.getAppComponentForControl(oRelevantElement);
		const sVariantManagementReference = this.getVariantManagementReference(oRelevantOverlay);
		const oVMControl = ControlVariantApplyAPI.getVariantManagementControlByVMReference(sVariantManagementReference, oAppComponent);
		return (
			bIsActionEnabled
			&& LocalResetAPI.isResetEnabled(
				oRelevantElement,
				{
					layer: this.getCommandFactory().getFlexSettings().layer,
					currentVariant: oVMControl?.getCurrentVariantReference()
				}
			)
		);
	};

	/**
	 * @override
	 */
	LocalReset.prototype.getMenuItems = function(vElementOverlays) {
		return this._getMenuItems(vElementOverlays, {
			pluginId: "CTX_LOCAL_RESET",
			icon: "sap-icon://reset",
			additionalInfoKey: "LOCALRESET_RTA_CONTEXT_MENU_INFO"
		});
	};

	/**
	 * @override
	 */
	LocalReset.prototype.getActionName = function() {
		return "localReset";
	};

	/**
	 * @override
	 */
	LocalReset.prototype.handler = function(aOverlays) {
		const oOverlay = aOverlays[0];
		const oElement = oOverlay.getElement();
		const oDesignTimeMetadata = oOverlay.getDesignTimeMetadata();
		const sVariantManagementReference = this.getVariantManagementReference(oOverlay);
		const oAppComponent = FlUtils.getAppComponentForControl(oElement);
		const oVMControl = ControlVariantApplyAPI.getVariantManagementControlByVMReference(sVariantManagementReference, oAppComponent);
		const sCurrentVariantKey = oVMControl?.getCurrentVariantReference();
		const bHasVariant = !!sCurrentVariantKey;
		const oVariantManagementControl = bHasVariant
			? oAppComponent.byId(sVariantManagementReference) || Element.getElementById(sVariantManagementReference)
			: undefined;
		const oCommandFactory = this.getCommandFactory();

		const oCompositeCommand = new CompositeCommand();

		return Promise.all([
			oCommandFactory.getCommandFor(
				oElement,
				"localReset",
				{
					currentVariant: sCurrentVariantKey
				},
				oDesignTimeMetadata,
				sVariantManagementReference
			),
			bHasVariant && oCommandFactory.getCommandFor(
				oVariantManagementControl,
				"save",
				oDesignTimeMetadata,
				sVariantManagementReference
			)
		].filter(Boolean))
		.then(function(aCommands) {
			aCommands.forEach(function(oCommand) {
				oCompositeCommand.addCommand(oCommand);
			});
			this.fireElementModified({
				command: oCompositeCommand
			});
			if (bHasVariant) {
				const sMessage = Lib.getResourceBundleFor("sap.ui.rta").getText("MSG_LOCAL_RESET_VARIANT_SAVE");
				MessageToast.show(sMessage, {
					duration: 5000
				});
			}
		}.bind(this))
		.catch(function(vError) {
			throw DtUtil.propagateError(
				vError,
				"LocalReset#handler",
				"Error occurred during handler execution",
				"sap.ui.rta.plugin"
			);
		});
	};

	return LocalReset;
});
