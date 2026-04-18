/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/Lib",
	"sap/ui/dt/Util",
	"sap/ui/fl/Utils",
	"sap/ui/rta/plugin/Plugin"
], function(
	Lib,
	DtUtil,
	Utils,
	Plugin
) {
	"use strict";

	/**
	 *
	 * @typedef {function} sap.ui.rta.plugin.ExtendController.handlerFunction
	 * @since 1.134
	 * @param {sap.ui.dt.ElementOverlay} oOverlay - Target overlay for where XML will be added

	/**
	 * Constructor for a new ExtendController plugin.
	 * The controller handler <code>{@link sap.ui.rta.plugin.ExtendController.handlerFunction HandlerFunction}</code>
	 * is a callback function that needs to be passed on instantiation of the plugin or alternatively into the
	 * propertyBag when the handler function is called.
	 *
	 * @class
	 * @extends sap.ui.rta.plugin.Plugin
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @private
	 * @since 1.134
	 * @alias sap.ui.rta.plugin.ExtendControllerPlugin
	 */
	const ExtendControllerPlugin = Plugin
	.extend("sap.ui.rta.plugin.ExtendController", /** @lends sap.ui.rta.plugin.ExtendControllerPlugin.prototype */ {
		metadata: {
			library: "sap.ui.rta",
			properties: {
				handlerFunction: {
					type: "function"
				}
			},
			associations: {},
			events: {}
		}
	});

	const FLEX_CHANGE_TYPE = "codeExt";

	function isControlInAsyncView(oOverlay) {
		// Currently there is no better way to get this information. When this changes, this code must be adapted.
		return !!Utils.getViewForControl(oOverlay.getElement())?.oAsyncState;
	}

	/**
	 * @override
	 */
	ExtendControllerPlugin.prototype._isEditable = function(oOverlay) {
		// Action should be available by default
		const oAction = this.getAction(oOverlay);
		if (oAction === null) {
			return Promise.resolve(false);
		}
		return Promise.resolve(true);
	};

	/**
	 * @override
	 */
	ExtendControllerPlugin.prototype.isEnabled = function(aElementOverlays) {
		return aElementOverlays.length === 1
			&& !this.isInReuseComponentOnS4HanaCloud(aElementOverlays[0])
			&& isControlInAsyncView(aElementOverlays[0]);
	};

	/**
	 * @override
	 */
	ExtendControllerPlugin.prototype.getActionText = function(oOverlay, mAction, sPluginId) {
		const vName = mAction.name;
		const oElement = oOverlay.getElement();
		let sText;
		if (vName) {
			if (typeof vName === "function") {
				return vName(oElement);
			}
			sText = oOverlay.getDesignTimeMetadata() ? oOverlay.getDesignTimeMetadata().getLibraryText(oElement, vName) : "";
		} else {
			sText = Lib.getResourceBundleFor("sap.ui.rta").getText(sPluginId);
		}
		// The case where the control is in a reuse component on S4HanaCloud
		// is not enabled and has a special text in parenthesis on the context menu
		if (this.isInReuseComponentOnS4HanaCloud(oOverlay)) {
			sText += ` (${Lib.getResourceBundleFor("sap.ui.rta").getText("CTX_DISABLED_REUSE")})`;
		}
		// The case where the control is not in an async view
		// is not enabled and has a special text in parenthesis on the context menu
		if (!isControlInAsyncView(oOverlay)) {
			sText += ` (${Lib.getResourceBundleFor("sap.ui.rta").getText("CTX_DISABLED_NOT_ASYNC")})`;
		}
		return sText;
	};

	/**
	 * @override
	 */
	ExtendControllerPlugin.prototype.handler = async function(aElementOverlays, mPropertyBag) {
		try {
			const fnControllerHandler = mPropertyBag.handlerFunction || this.getHandlerFunction();
			if (!fnControllerHandler) {
				throw Error("Controller handler function is not available in the handler");
			}

			const oElementOverlay = aElementOverlays[0];

			// If the data returned from the handler has the property instanceSpecific = true,
			// it refers to an instance-specific controller extension. In this case, the view ID will be added to the change content.
			const mExtendControllerData = await fnControllerHandler(oElementOverlay);

			const oExtendControllerCommand = await this.getCommandFactory().getCommandFor(
				oElementOverlay.getElement(),
				FLEX_CHANGE_TYPE,
				mExtendControllerData
			);

			this.fireElementModified({
				command: oExtendControllerCommand
			});
		} catch (vError) {
			throw DtUtil.propagateError(
				vError,
				"ExtendController#handler",
				"Error occurred in ExtendController handler function",
				"sap.ui.rta"
			);
		}
	};

	/**
	 * @override
	 */
	ExtendControllerPlugin.prototype.getMenuItems = function(aElementOverlays) {
		return this._getMenuItems(aElementOverlays, {
			pluginId: "CTX_EXTEND_CONTROLLER",
			icon: "sap-icon://create-form",
			additionalInfoKey: "EXTEND_CONTROLLER_RTA_CONTEXT_MENU_INFO"
		});
	};

	/**
	 * @override
	 */
	ExtendControllerPlugin.prototype.getActionName = function() {
		return "extendController";
	};

	/**
	 * @override
	 */
	ExtendControllerPlugin.prototype.getAction = function(oOverlay) {
		const oAction = Plugin.prototype.getAction.apply(this, [oOverlay]);
		if (oAction === null) {
			return null;
		}
		return oAction || { changeType: FLEX_CHANGE_TYPE };
	};

	return ExtendControllerPlugin;
});