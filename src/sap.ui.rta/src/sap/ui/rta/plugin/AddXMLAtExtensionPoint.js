/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/util/values",
	"sap/ui/base/DesignTime",
	"sap/ui/dt/Util",
	"sap/ui/fl/apply/api/ExtensionPointRegistryAPI",
	"sap/ui/fl/initial/_internal/ManifestUtils",
	"sap/ui/fl/Utils",
	"sap/ui/rta/plugin/Plugin"
], function(
	values,
	DesignTime,
	DtUtil,
	ExtensionPointRegistryAPI,
	ManifestUtils,
	FlUtils,
	Plugin
) {
	"use strict";

	/**
	 * Callback function responsible for fragment handling.
	 *
	 * The fragment handling function needs to be provided from outside of key user adaptation. It is called during the execution of the
	 * plugin handler with the target overlay and a list of existing extension point information related to the target overlay. The main
	 * responsibility is to select an extension point from the list an create an XML fragment as an extension for it. After the fragment
	 * is created, the fragment handler needs to resolve the returned promise with the information of the selected extension point name,
	 * the path and the name of the created fragment. If no extension point selection is done into the fragment handler, an empty object
	 * needs to be returned.
	 *
	 * @typedef {function} sap.ui.rta.plugin.AddXMLAtExtensionPoint.fragmentHandler
	 * @since 1.78
	 * @param {sap.ui.fl.ElementOverlay} oOverlay - Target overlay for the extension by fragment change
	 * @param {object[]} aExtensionPointInfos - List of available extension point information for the target overlay
	 * @returns {Promise<{extensionPointName: string, fragmentPath: string, fragment: string}>} Object wrapped in a Promise containing values that are relevant for the <code>addXMLAtExtensionPoint</code> command

	/**
	 * Constructor for a new AddXMLAtExtensionPoint plugin.
	 * Adds the content of the XML fragment behind the ExtensionPoint which needs to be selected by the fragment handler.
	 * The fragment handler <code>{@link sap.ui.rta.plugin.AddXMLAtExtensionPoint.fragmentHandler FragmentHandler}</code>
	 * is a callback function that needs to be passed on instantiation of the plugin or alternatively into the
	 * propertyBag when the handler function is called.
	 *
	 * @class
	 * @extends sap.ui.rta.plugin.Plugin
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @private
	 * @since 1.78
	 * @alias sap.ui.rta.plugin.AddXMLAtExtensionPoint
	 */
	const AddXMLAtExtensionPoint = Plugin
	.extend("sap.ui.rta.plugin.AddXMLAtExtensionPoint", /** @lends sap.ui.rta.plugin.AddXMLAtExtensionPoint.prototype */ {
		metadata: {
			library: "sap.ui.rta",
			properties: {
				fragmentHandler: {
					type: "function"
				}
			}
		}
	});

	const FLEX_CHANGE_TYPE = "addXMLAtExtensionPoint";
	const MANIFEST_CHANGE_TYPE = "appdescr_ui5_setFlexExtensionPointEnabled";

	function getExtensionPointList(oElement) {
		const oElementId = oElement.getId();
		// determine a list of extension points for the given element. In case the element is a view
		// all extension points available for the view are returned
		const aExtensionPointInfo = ExtensionPointRegistryAPI.getExtensionPointInfoByParentId({ parentId: oElementId });
		return aExtensionPointInfo.length
			? aExtensionPointInfo
			: values(ExtensionPointRegistryAPI.getExtensionPointInfoByViewId({ viewId: oElementId }));
	}

	function hasExtensionPoints(oElement) {
		return getExtensionPointList(oElement).length > 0;
	}

	function isDesignMode() {
		return DesignTime.isDesignModeEnabled();
	}

	function checkViewId(oElementOverlay) {
		const oView = getExtensionPointList(oElementOverlay.getElement())[0]?.view;
		return oView && FlUtils.checkControlId(oView);
	}

	AddXMLAtExtensionPoint.prototype.bManifestCommandAlreadyAvailable = false;

	/**
	 * @override
	 */
	AddXMLAtExtensionPoint.prototype._isEditable = async function(oOverlay) {
		if (isDesignMode()) {
			const oElement = oOverlay.getElement();
			const bHasChangeHandler = await this.hasChangeHandler(FLEX_CHANGE_TYPE, oElement);
			return bHasChangeHandler && hasExtensionPoints(oElement) && checkViewId(oOverlay);
		}
		return false;
	};

	/**
	 * @override
	 */
	AddXMLAtExtensionPoint.prototype.isEnabled = function(aElementOverlays) {
		const bEnabled = aElementOverlays.length === 1;
		return bEnabled && !!checkViewId(aElementOverlays[0]);
	};

	AddXMLAtExtensionPoint.prototype.isAvailable = function(aOverlays) {
		if (isDesignMode()) {
			const oElement = aOverlays[0].getElement();
			return hasExtensionPoints(oElement);
		}
		return false;
	};

	async function handleAddXmlAtExtensionPointCommand(oElement, mExtensionData, oCompositeCommand) {
		const sExtensionPointName = mExtensionData.extensionPointName;
		const oView = FlUtils.getViewForControl(oElement);
		const mExtensionPointReference = {
			name: sExtensionPointName,
			view: oView
		};
		const mExtensionPointSettings = {
			fragment: mExtensionData.fragment,
			fragmentPath: mExtensionData.fragmentPath
		};

		const oAddXmlAtExtensionPointCommand = await this.getCommandFactory().getCommandFor(
			mExtensionPointReference,
			FLEX_CHANGE_TYPE,
			mExtensionPointSettings
		);
		oCompositeCommand.addCommand(oAddXmlAtExtensionPointCommand);
	}

	async function handleManifestChangeCommand(oElement, oCompositeCommand) {
		// without manifest change when the FlexExtensionPointEnabled flag is already set
		const bFlexExtensionPointHandlingEnabled = ManifestUtils.isFlexExtensionPointHandlingEnabled(oElement);
		if (bFlexExtensionPointHandlingEnabled || this.bManifestCommandAlreadyAvailable) {
			return;
		}

		const oComponent = FlUtils.getAppComponentForControl(oElement);
		const sReference = oComponent.getManifestEntry("sap.app").id;
		const oManifestCommand = await this.getCommandFactory().getCommandFor(
			oElement,
			"manifest",
			{
				reference: sReference,
				appComponent: oComponent,
				changeType: MANIFEST_CHANGE_TYPE,
				parameters: { flexExtensionPointEnabled: true },
				texts: {}
			}
		);
		this.bManifestCommandAlreadyAvailable = true;
		oCompositeCommand.addCommand(oManifestCommand);
	}

	async function handleCompositeCommand(aElementOverlays, mExtensionData) {
		const oOverlay = aElementOverlays[0];
		const oElement = oOverlay.getElement();

		const oCompositeCommand = await this.getCommandFactory().getCommandFor(oElement, "composite");

		// Flex Change
		await handleAddXmlAtExtensionPointCommand.call(this, oElement, mExtensionData, oCompositeCommand);
		// Manifest Change
		await handleManifestChangeCommand.call(this, oElement, oCompositeCommand);

		return oCompositeCommand;
	}

	/**
	 * @override
	 */
	AddXMLAtExtensionPoint.prototype.handler = async function(aElementOverlays, mPropertyBag) {
		try {
			const fnFragmentHandler = mPropertyBag.fragmentHandler || this.getFragmentHandler();
			if (!fnFragmentHandler) {
				throw new Error("Fragment handler function is not available in the handler");
			}
			const oOverlay = aElementOverlays[0];
			const oElement = oOverlay.getElement();
			const aExtensionPointInfos = getExtensionPointList(oElement);
			const mExtensionData = await fnFragmentHandler(oOverlay, aExtensionPointInfos);

			if (!mExtensionData.extensionPointName || !(typeof mExtensionData.extensionPointName === "string")) {
				throw new Error("Extension point name is not selected!");
			}
			if (!mExtensionData.fragmentPath || !(typeof mExtensionData.fragmentPath === "string")) {
				throw new Error("Fragment path is not available");
			}
			const oCompositeCommand = await handleCompositeCommand.call(this, aElementOverlays, mExtensionData);

			this.fireElementModified({
				command: oCompositeCommand
			});
		} catch (vError) {
			throw DtUtil.propagateError(
				vError,
				"AddXMLAtExtensionPoint#handler",
				"Error occurred in AddXMLAtExtensionPoint handler function",
				"sap.ui.rta"
			);
		}
	};

	/**
	 * @override
	 */
	AddXMLAtExtensionPoint.prototype.getMenuItems = function(aElementOverlays) {
		return this._getMenuItems(aElementOverlays, {
			pluginId: "CTX_ADDXML_AT_EXTENSIONPOINT",
			icon: "sap-icon://add-equipment"
		});
	};

	/**
	 * @override
	 */
	AddXMLAtExtensionPoint.prototype.getActionName = function() {
		return "AddXMLAtExtensionPoint";
	};

	/**
	 * @override
	 */
	AddXMLAtExtensionPoint.prototype.getAction = function() {
		return { changeType: FLEX_CHANGE_TYPE };
	};

	return AddXMLAtExtensionPoint;
});