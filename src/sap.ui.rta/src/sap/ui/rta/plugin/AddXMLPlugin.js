/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/Lib",
	"sap/ui/dt/Util",
	"sap/ui/rta/plugin/Plugin"
], function(
	Lib,
	DtUtil,
	Plugin
) {
	"use strict";

	/**
	 * Callback function responsible for fragment handling.
	 *
	 * The fragment handling function needs to be provided from outside of key user adaptation. It is called during the execution of the
	 * plugin handler with the target overlay.
	 *
	 * @typedef {function} sap.ui.rta.plugin.AddXML.fragmentHandler
	 * @since 1.134
	 * @param {sap.ui.dt.ElementOverlay} oOverlay - Target overlay for where XML will be added
	 * @param {string[]} aExcludedAggregation - Aggregations that should be excluded from the fragment handling
	 * @returns {Promise<{fragmentPath: string, fragment: string, targetAggregation: string, index: number}>} Object wrapped in a Promise containing values that are relevant for the <code>addXML</code> command

	/**
	 * Constructor for a new AddXML plugin.
	 * Adds the content of the XML fragment
	 * The fragment handler <code>{@link sap.ui.rta.plugin.AddXML.fragmentHandler FragmentHandler}</code>
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
	 * @alias sap.ui.rta.plugin.AddXMLPlugin
	 */
	const AddXML = Plugin.extend("sap.ui.rta.plugin.AddXML", /** @lends sap.ui.rta.plugin.AddXMLPlugin.prototype */ {
		metadata: {
			library: "sap.ui.rta",
			properties: {
				fragmentHandler: {
					type: "function"
				}
			}
		}
	});

	const FLEX_CHANGE_TYPE = "addXML";

	/**
	 * @override
	 */
	AddXML.prototype._isEditable = async function(oOverlay) {
		// Action should be available by default
		const oAddXMLAction = this.getAction(oOverlay);
		if (oAddXMLAction === null) {
			return false;
		}
		const bHasChangeHandler = await this.hasChangeHandler(FLEX_CHANGE_TYPE, oOverlay.getElement());
		return bHasChangeHandler;
	};

	/**
	 * @override
	 */
	AddXML.prototype.isEnabled = function(aElementOverlays) {
		return (aElementOverlays.length === 1)
			&& !this.isInReuseComponentOnS4HanaCloud(aElementOverlays[0])
			&& this.hasStableId(aElementOverlays[0]);
	};

	/**
	 * @override
	 */
	AddXML.prototype.getActionText = function(oOverlay, mAction, sPluginId) {
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
		// The cases where the control is in a reuse component on S4HanaCloud or has no stable ID
		// are not enabled and have special texts in parenthesis on the context menu
		if (this.isInReuseComponentOnS4HanaCloud(oOverlay)) {
			sText += ` (${Lib.getResourceBundleFor("sap.ui.rta").getText("CTX_DISABLED_REUSE")})`;
		} else if (!this.hasStableId(oOverlay)) {
			sText += ` (${Lib.getResourceBundleFor("sap.ui.rta").getText("CTX_DISABLED_NO_STABLE_ID")})`;
		}
		return sText;
	};

	/**
	 * Returns the parameters that a programmatic consumer must provide to create the commands for this plugin.
	 * @returns {object[]} List of parameter descriptors (name, type, required, description)
	 * @since 1.153
	 */
	AddXML.prototype.getParameters = function() {
		return [
			{
				name: "fragmentPath",
				type: "string",
				required: true,
				description: "The path to the fragment XML file, should be 'fragments/{someFragmentName}.fragment.xml'"
			},
			{
				name: "targetAggregation",
				type: "string",
				required: true,
				description: "The aggregation of the parent element to which the fragment should be added"
			},
			{
				name: "index",
				type: "int",
				required: true,
				description: "The position index at which the fragment should be added"
			}
		];
	};

	/**
	 * Creates the command for this plugin from the given parameters and fires the "elementModified" event.
	 * @param {sap.ui.dt.ElementOverlay} oOverlay - Target overlay
	 * @param {object} mParameters - Parameters as described by {@link #getParameters}
	 * @returns {Promise} Resolves once the command has been created and the event has been fired
	 * @since 1.153
	 */
	AddXML.prototype.createCommands = async function(oOverlay, mParameters) {
		const mCommandParameters = {
			...mParameters,
			fragment: mParameters.fragment || "<core:FragmentDefinition xmlns:core='sap.ui.core'></core:FragmentDefinition>"
		};
		const oAddXmlCommand = await this.getCommandFactory().getCommandFor(
			oOverlay.getElement(),
			FLEX_CHANGE_TYPE,
			mCommandParameters
		);

		this.fireElementModified({
			command: oAddXmlCommand
		});
		return oAddXmlCommand;
	};

	/**
	 * @override
	 */
	AddXML.prototype.handler = async function(aElementOverlays, mPropertyBag) {
		try {
			const fnFragmentHandler = mPropertyBag.fragmentHandler || this.getFragmentHandler();
			if (!fnFragmentHandler) {
				throw Error("Fragment handler function is not available in the handler");
			}
			const oOverlay = aElementOverlays[0];

			const aExcludedAggregation = mPropertyBag.menuItem.action?.excludedAggregations || [];

			const mAddXmlData = await fnFragmentHandler(oOverlay, aExcludedAggregation);

			return await this.createCommands(oOverlay, mAddXmlData);
		} catch (vError) {
			throw DtUtil.propagateError(
				vError,
				"AddXML#handler",
				"Error occurred in AddXML handler function",
				"sap.ui.rta"
			);
		}
	};

	/**
	 * @override
	 */
	AddXML.prototype.getMenuItems = function(aElementOverlays) {
		return this._getMenuItems(aElementOverlays, {
			pluginId: "CTX_ADDXML",
			icon: "sap-icon://attachment-html",
			additionalInfoKey: "ADDXML_RTA_CONTEXT_MENU_INFO",
			description: "add an XML fragment to a target aggregation of the element",
			aggregationRelevant: true
		});
	};

	/**
	 * @override
	 */
	AddXML.prototype.getActionName = function() {
		return "addXML";
	};

	/**
	 * @override
	 */
	AddXML.prototype.getAction = function(oOverlay) {
		const oAction = Plugin.prototype.getAction.apply(this, [oOverlay]);
		if (oAction === null) {
			return null;
		}
		return oAction || { changeType: FLEX_CHANGE_TYPE };
	};

	return AddXML;
});