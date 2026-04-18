/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/base/ManagedObject",
	"sap/ui/core/Lib",
	"sap/ui/dt/OverlayRegistry"
], function(
	ManagedObject,
	Lib,
	OverlayRegistry
) {
	"use strict";
	/**
	 * Constructor for a new Plugin.
	 *
	 * @param {string} [sId] id for the new object, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new object
	 *
	 * @abstract
	 * @class
	 * The Plugin allows to handle the overlays and aggregation overlays from the DesignTime
	 * The Plugin should be overridden by the real plugin implementations, which define some actions through events attached to an overlays
	 * @extends sap.ui.base.ManagedObject
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @since 1.30
	 * @alias sap.ui.dt.Plugin
	 */

	var Plugin = ManagedObject.extend("sap.ui.dt.Plugin", /** @lends sap.ui.dt.Plugin.prototype */ {
		metadata: {
			"abstract": true,
			library: "sap.ui.dt",
			properties: {
				/**
				 * DesignTime where this plugin will be used
				 */
				designTime: { // its defined as a property because spa.ui.dt.designTime is a managed object and UI5 only allows associations for elements
					type: "object",
					multiple: false
				},
				busy: {
					type: "boolean",
					defaultValue: false
				}
			},
			events: {
				processingStatusChange: {
					parameters: {
						processing: { type: "boolean" }
					}
				}
			}
		}
	});

	Plugin.prototype._bProcessingCounter = 0;

	Plugin.prototype._oBusyPromise = {};

	/**
	 * Called when the Plugin is initialized
	 * @protected
	 */
	Plugin.prototype.init = function() {};

	/**
	 * Called when the Plugin is destroyed
	 * @protected
	 */
	Plugin.prototype.exit = function() {
		this.setDesignTime(null);
	};

	/**
	 * Function is called initially for every overlay in the DesignTime and then when any new overlay is created inside of the DesignTime
	 * This function should be overridden by the plugins to handle the overlays (attach events and etc.)
	 * @function
	 * @name sap.ui.dt.Plugin.prototype.registerElementOverlay
	 * @param {sap.ui.dt.ElementOverlay} an oElementOverlay which should be registered
	 * @protected
	 */
	// Plugin.prototype.registerElementOverlay = function(oElementOverlay) {};

	/**
	 * Function is called for every overlay in the DesignTime when the Plugin is deactivated.
	 * This function should be overridden by the plugins to rollback the registration and cleanup attached event etc.
	 * @function
	 * @name sap.ui.dt.Plugin.prototype.deregisterElementOverlay
	 * @param {sap.ui.dt.ElementOverlay} an oElementOverlay which should be deregistered
	 * @protected
	 */
	// Plugin.prototype.deregisterElementOverlay = function(oElementOverlay) {};

	/**
	 * Function is called initially for every aggregation overlay in the DesignTime and then when any new aggregation overlay is created inside of the DesignTime
	 * This function should be overridden by the plugins to handle the aggregation overlays (attach events and etc.)
	 * @function
	 * @name sap.ui.dt.Plugin.prototype.registerAggregationOverlay
	 * @param {sap.ui.dt.AggregationOverlay} oAggregationOverlay which should be registered
	 * @protected
	 */
	// Plugin.prototype.registerAggregationOverlay = function(oAggregationOverlay) {};

	/**
	 * Function is called for every aggregation overlay in the DesignTime when the Plugin is deactivated.
	 * This function should be overridden by the plugins to rollback the registration and cleanup attached event etc.
	 * @function
	 * @name sap.ui.dt.Plugin.prototype.deregisterAggregationOverlay
	 * @param {sap.ui.dt.AggregationOverlay} oAggregationOverlay which should be deregistered
	 * @protected
	 */
	// Plugin.prototype.deregisterAggregationOverlay = function(oAggregationOverlay) {};

	/**
	 * Sets a DesignTime, where the plugin should be used. Automatically called by "addPlugin" into DesignTime
	 * @param {sap.ui.dt.DesignTime} oDesignTime to set
	 * @return {sap.ui.dt.Plugin} returns this
	 * @public
	 */
	Plugin.prototype.setDesignTime = function(oDesignTime) {
		var oOldDesignTime = this.getDesignTime();
		if (oOldDesignTime) {
			this._deregisterOverlays(oOldDesignTime);
		}

		this.setProperty("designTime", oDesignTime);

		if (oDesignTime) {
			this._registerOverlays(oDesignTime);
		}

		return this;
	};

	/**
	 * @param {sap.ui.dt.DesignTime} oDesignTime to register overlays for
	 * @private
	 */
	Plugin.prototype._registerOverlays = function(oDesignTime) {
		if (this.registerElementOverlay || this.registerAggregationOverlay) {
			var aElementOverlays = oDesignTime.getElementOverlays();
			this.setProcessingStatus(true);
			aElementOverlays.forEach(this.callElementOverlayRegistrationMethods.bind(this));
			this.setProcessingStatus(false);
		}
	};

	/**
	 * @param {sap.ui.dt.DesignTime} oDesignTime to register overlays for
	 * @private
	 */
	Plugin.prototype._deregisterOverlays = function(oDesignTime) {
		if (this.deregisterElementOverlay || this.deregisterAggregationOverlay) {
			var aOverlays = oDesignTime.getElementOverlays();
			aOverlays.forEach(this._callElementOverlayDeregistrationMethods.bind(this));
		}
	};

	/**
	 * @param {sap.ui.dt.Overlay} oElementOverlay to call registration methods for
	 * @protected
	 */
	Plugin.prototype.callAggregationOverlayRegistrationMethods = function(oElementOverlay) {
		if (this.registerAggregationOverlay) {
			var aAggregationOverlays = oElementOverlay.getChildren();
			aAggregationOverlays.forEach(this.registerAggregationOverlay.bind(this));
		}
	};

	/**
	 * @param {sap.ui.dt.Overlay} oElementOverlay to call registration methods for
	 * @protected
	 */
	Plugin.prototype.callElementOverlayRegistrationMethods = function(oElementOverlay) {
		if (this.registerElementOverlay) {
			this.registerElementOverlay(oElementOverlay);
		}

		this.callAggregationOverlayRegistrationMethods(oElementOverlay);
	};

	/**
	 * @param {sap.ui.dt.ElementOverlay} oElementOverlay to call deregistration methods for
	 * @private
	 */
	Plugin.prototype._callElementOverlayDeregistrationMethods = function(oElementOverlay) {
		if (this.deregisterElementOverlay) {
			this.deregisterElementOverlay(oElementOverlay);
		}

		if (this.deregisterAggregationOverlay) {
			var aAggregationOverlays = oElementOverlay.getChildren();
			aAggregationOverlays.forEach(this.deregisterAggregationOverlay.bind(this));
		}
	};

	/**
	 * @param {sap.ui.baseEvent} oEvent event object
	 * @private
	 */
	Plugin.prototype._onElementOverlayCreated = function(oEvent) {
		var oOverlay = oEvent.getParameter("elementOverlay");

		this.callElementOverlayRegistrationMethods(oOverlay);
	};

	/**
	 * Called to retrieve a context menu item for the plugin.
	 * Needs to be overridden by extending plugins.
	 * @returns {array} Empty array
	 * @protected
	 */
	Plugin.prototype.getMenuItems = function() {
		return [];
	};

	/**
	 * Retrieve the action name related to the plugin
	 * Method to be overridden by the different plugins
	 *
	 * @public
	 */
	Plugin.prototype.getActionName = function() {};

	/**
	 * Indicate if a plugin is currently busy
	 *
	 * @returns {boolean} Returns whether the plugin is currently busy
	 */
	Plugin.prototype.isBusy = Plugin.prototype.getBusy;

	/**
	 * Setter for the busy property. Sets a promise internally to be able to wait for a busy plugin
	 *
	 * @param {boolean} bBusy - Value for the busy state
	 * @returns {this} Returns <code>this</code>
	 */
	Plugin.prototype.setBusy = function(bBusy) {
		if (bBusy && !this.getBusy()) {
			this._oBusyPromise.promise = new Promise(function(resolve) {
				this._oBusyPromise.resolveFunction = resolve;
			}.bind(this));
		} else if (!bBusy && this.getBusy() && this._oBusyPromise.resolveFunction) {
			this._oBusyPromise.resolveFunction();
		}
		this.setProperty("busy", bBusy);
		return this;
	};

	/**
	 * Waits for the busy promise and resolves as soon as the plugin is not busy anymore
	 *
	 * @returns {Promise<undefined>} Resolves with undefined
	 */
	Plugin.prototype.waitForBusyAction = function() {
		return this._oBusyPromise.promise || Promise.resolve();
	};

	/**
	 * @param {boolean} bProcessing - processing state to set
	 */
	Plugin.prototype.setProcessingStatus = function(bProcessing) {
		this._bProcessingCounter = bProcessing ? this._bProcessingCounter + 1 : this._bProcessingCounter - 1;
		if (
			(bProcessing === true && this._bProcessingCounter === 1)
			|| (bProcessing === false && this._bProcessingCounter === 0)
		) {
			this.fireProcessingStatusChange({
				processing: bProcessing
			});
		}
	};

	/**
	 * Retrieve the action data from the Designtime Metadata
	 * @param  {sap.ui.dt.ElementOverlay} oOverlay Overlay containing the Designtime Metadata
	 * @return {object} Returns an object with the action data from the Designtime Metadata
	 */
	Plugin.prototype.getAction = function(oOverlay) {
		return oOverlay.getDesignTimeMetadata() ?
			oOverlay.getDesignTimeMetadata().getAction(this.getActionName(), oOverlay.getElement())
			: null;
	};

	/**
	 * Retrieve the propagated action info from the Designtime Metadata, like the propagating control
	 * and its name.
	 * @param  {sap.ui.dt.ElementOverlay} oOverlay Overlay containing the Designtime Metadata
	 * @return {object} Returns an object with the propagated action info from the Designtime Metadata
	 */
	Plugin.prototype.getPropagatedActionInfo = function(oOverlay) {
		return oOverlay.getDesignTimeMetadata() ?
			oOverlay.getDesignTimeMetadata().getPropagatedActionInfo(this.getActionName())
			: null;
	};

	/**
	 * Asks the Design Time which overlays are selected
	 *
	 * @return {sap.ui.dt.ElementOverlay[]} selected overlays
	 */
	Plugin.prototype.getSelectedOverlays = function() {
		return this.getDesignTime().getSelectionManager().get();
	};

	/**
	 * Retrieve the action text (for context menu item) from the Designtime Metadata
	 * @param {sap.ui.dt.ElementOverlay} oOverlay Overlay containing the Designtime Metadata
	 * @param {object} mAction The action data from the Designtime Metadata
	 * @param {string} sPluginId The ID of the plugin
	 * @return {string} The text for the menu item
	 */
	Plugin.prototype.getActionText = function(oOverlay, mAction, sPluginId) {
		const vName = mAction.name;
		const oElement = oOverlay.getElement();
		if (vName) {
			if (typeof vName === "function") {
				return vName(oElement);
			}
			return oOverlay.getDesignTimeMetadata() ? oOverlay.getDesignTimeMetadata().getLibraryText(oElement, vName) : "";
		}
		return Lib.getResourceBundleFor("sap.ui.rta").getText(sPluginId);
	};

	/**
	 * Checks if the plugin is available for an overlay
	 * Method to be overwritten by the different plugins
	 * @param {sap.ui.dt.ElementOverlay[]} aElementOverlays - Overlays to be checked
	 * @returns {boolean} <code>false</code> by default
	 */
	Plugin.prototype.isAvailable = function() {
		return false;
	};

	/**
	 * Executes the plugin action
	 * Method to be overwritten by the different plugins
	 * @param {sap.ui.dt.ElementOverlay[]} aElementOverlays - Target overlays
	 * @param {object} mPropertyBag - Additional properties for the action defined by the plugin
	 * @param {object} mPropertyBag.menuItem - The menu item object containing the action to be executed
	 * @param {object} mPropertyBag.eventItem - The event item object containing the event which triggered the action
	 * @param {object} mPropertyBag.contextElement - The element which is the context of the action, e.g. the element on which the context menu was opened
	 * @override
	 * @public
	 */
	Plugin.prototype.handler = function() {};

	/**
	 * Checks if the plugin is enabled for a set of overlays
	 * Method can be overwritten by the different plugins
	 * @param {sap.ui.dt.ElementOverlay[]} aElementOverlays - Target overlays
	 * @param {object} oMenuItem - The menu item object containing the action to be executed
	 * @returns {boolean} <code>true</code> if plugin is enabled
	 */
	Plugin.prototype.isEnabled = function(aElementOverlays, oMenuItem) {
		// The default implementation considers only one overlay
		if (!Array.isArray(aElementOverlays) || aElementOverlays.length > 1) {
			return false;
		}
		const oResponsibleElementOverlay = oMenuItem?.responsible?.[0] || aElementOverlays[0];

		const oAction = oMenuItem ? oMenuItem.action : this.getAction(oResponsibleElementOverlay);
		if (!oAction) {
			return false;
		}

		if (oAction.isEnabled === undefined) {
			return true;
		}
		if (typeof oAction.isEnabled === "function") {
			const oElement = oResponsibleElementOverlay.getElement();
			return oAction.isEnabled(oElement);
		}
		return oAction.isEnabled;
	};

	/**
	 * Generic function to return the menu items for a context menu.
	 * The text for the item can be defined in the control Designtime Metadata;
	 * otherwise the default text is used.
	 * @param {sap.ui.dt.ElementOverlay[]} aElementOverlays - Target overlays
	 * @param {object} mPropertyBag - Additional properties for the menu item
	 * @param {string} mPropertyBag.pluginId - The ID of the plugin
	 * @param {number} mPropertyBag.rank - The rank deciding the position of the action in the context menu
	 * @param {string} mPropertyBag.icon - an icon for the Button inside the context menu
	 * @param {boolean} [mPropertyBag.bAsSibling] - Indicates if the action is executed on the sibling overlay instead of the responsible element overlay
	 * @param {object} [mPropertyBag.action] - The action object defined in the designtime, if the plugin wants to define it by itself instead of taking it from the designtime
	 * @param {object[]} [mPropertyBag.submenu] - All submenu items if the item should open a submenu
	 * @param {string} [mPropertyBag.additionalInfoKey] - The key for the additional information defined by the plugin
	 * @return {object[]} Returns an array with the object containing the required data for a context menu item
	 */
	Plugin.prototype._getMenuItems = async function(aElementOverlays, mPropertyBag) {
		const oMenuItem = this.enhanceItemWithResponsibleElement({
			id: mPropertyBag.pluginId,
			handler: this.handler.bind(this),
			enabled: this.isEnabled.bind(this),
			rank: mPropertyBag.rank,
			icon: mPropertyBag.icon,
			bAsSibling: mPropertyBag.bAsSibling,
			submenu: mPropertyBag.submenu
		}, aElementOverlays);

		// menu items with submenus don't trigger an action and must always be enabled
		if (mPropertyBag.submenu) {
			oMenuItem.enabled = true;
		}

		const aResponsibleElementOverlays = oMenuItem.responsible || aElementOverlays;
		const oResponsibleElementOverlay = aResponsibleElementOverlays[0];

		if (this._isEditableByPlugin(oResponsibleElementOverlay, mPropertyBag.bAsSibling) === undefined) {
			// The responsibleElement editableByPlugin state was not evaluated yet e.g. because it
			// has no visible geometry, thus evaluateEditable now
			await this.evaluateEditable(aResponsibleElementOverlays, { onRegistration: false });
		}
		const oAction = mPropertyBag.action || this.getAction(oResponsibleElementOverlay, mPropertyBag.bAsSibling);
		oMenuItem.action = oAction;
		// For most plugins, the action must be available on the responsible element and the element overlay
		// because the element overlay is where the action is executed, e.g. rename in anchor bar
		if (
			!oAction
			|| !this.isAvailable(aResponsibleElementOverlays, oAction, mPropertyBag.bAsSibling)
			|| !this.isAvailable(aElementOverlays, oAction, mPropertyBag.bAsSibling)
		) {
			return [];
		}

		oMenuItem.additionalInfo = this._getAdditionalInfo(oResponsibleElementOverlay, oAction, mPropertyBag);
		oMenuItem.text = mPropertyBag.text || this.getActionText(oResponsibleElementOverlay, oAction, mPropertyBag.pluginId);
		return [oMenuItem];
	};

	/**
	 * Returns additional information for a menu item, if declared by the action
	 * @param {sap.ui.dt.ElementOverlay} oElementOverlay - Target overlay
	 * @param {object} mAction - The action object defined in the designtime
	 * @param {object} [mAction.additionalInfoKey] - The key for the additional information
	 * @param {object} [mPropertyBag] - Additional properties for the menu item defined by the plugin
	 * @param {string} [mPropertyBag.additionalInfoKey] - The key for the additional information defined by the plugin
	 * @return {string|undefined} The translated additional information string or undefined
	 */
	Plugin.prototype._getAdditionalInfo = function(oElementOverlay, mAction, mPropertyBag) {
		const sAdditionalInfoKeyFromDesigntime = mAction.additionalInfoKey;
		const sAdditionalInfoKeyFromPlugin = mPropertyBag && mPropertyBag.additionalInfoKey;
		if (sAdditionalInfoKeyFromDesigntime) {
			const oDesignTimeMetadata = oElementOverlay.getDesignTimeMetadata();
			const oElement = oElementOverlay.getElement();
			return oDesignTimeMetadata.getLibraryText(oElement, sAdditionalInfoKeyFromDesigntime);
		} else if (sAdditionalInfoKeyFromPlugin) {
			return Lib.getResourceBundleFor("sap.ui.rta").getText(sAdditionalInfoKeyFromPlugin);
		}
		return undefined;
	};

	/**
	 * Returns true if the plugin action from a responsible element is available on the element overlay
	 *
	 * @param {sap.ui.dt.ElementOverlay} oElementOverlay - Element overlay
	 * @param {string} [sActionName] - Action name
	 * @return {boolean} Indicates if the action is enabled
	 */
	Plugin.prototype.isResponsibleElementActionAvailable = function(oElementOverlay, sActionName) {
		var oDesignTimeMetadata = oElementOverlay.getDesignTimeMetadata();
		if (oDesignTimeMetadata) {
			// TODO: support for sub actions required
			return oDesignTimeMetadata.isResponsibleActionAvailable(sActionName || this.getActionName());
		}
		return false;
	};

	/**
	 * Checks if the action is available on the responsible element overlay instead of the element overlay where the context menu is opened,
	 * e.g. in case of ObjectPageSection and the anchor bar, and returns the responsible element overlay.
	 * If the action is not available on the responsible element overlay, returns the source element overlay.
	 *
	 * @param {sap.ui.dt.ElementOverlay} oElementOverlay - Source element overlay
	 * @param {string} [sActionName] - Action name
	 * @return {sap.ui.dt.ElementOverlay} Returns the element overlay of the responsible element
	 */
	Plugin.prototype.getResponsibleElementOverlay = function(oElementOverlay, sActionName) {
		const bActionOnResponsibleElement = this.isResponsibleElementActionAvailable(oElementOverlay, sActionName || this.getActionName());
		const oElement = oElementOverlay.getElement();
		const oDesignTimeMetadata = oElementOverlay.getDesignTimeMetadata();
		if (bActionOnResponsibleElement && oDesignTimeMetadata) {
			const oResponsibleElement = oDesignTimeMetadata.getResponsibleElement(oElement);
			if (oResponsibleElement) {
				try {
					return OverlayRegistry.getOverlay(oResponsibleElement);
				} catch (oError) {
					return oElementOverlay;
				}
			}
		}
		return oElementOverlay;
	};

	/**
	 * Enhances a context menu item with the responsible element overlay if applicable.
	 * This is only the case if the action is copied from the responsible element.
	 * Example: ObjectPageSection and the anchor bar
	 *
	 * @param {object} oMenuItem - Menu item
	 * @param {sap.ui.dt.ElementOverlay[]} aElementOverlays - Source element overlays
	 * @param {string[]} [aActionNames] - Action names
	 * @return {object} Enhanced menu item
	 */
	Plugin.prototype.enhanceItemWithResponsibleElement = function(oMenuItem, aElementOverlays, aActionNames) {
		let aResponsibleElementOverlays = [];
		const aActionsFromResponsibleElement = aActionNames || [this.getActionName()];
		const bEnhanceMenuItem = aActionsFromResponsibleElement.some((sActionName) => {
			if (this.isResponsibleElementActionAvailable(aElementOverlays[0], sActionName)) {
				aResponsibleElementOverlays = aElementOverlays.map((oElementOverlay) => this.getResponsibleElementOverlay(oElementOverlay, sActionName));
				return true;
			}
			return false;
		});
		return { ...oMenuItem, ...(bEnhanceMenuItem && { responsible: aResponsibleElementOverlays }) };
	};

	return Plugin;
});