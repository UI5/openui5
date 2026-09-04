/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/util/uid",
	"sap/ui/core/IconPool",
	"sap/ui/core/Lib",
	"sap/ui/dt/Util",
	"sap/ui/fl/util/CancelError",
	"sap/ui/fl/Utils",
	"sap/ui/rta/plugin/iframe/AddIFrameDialog",
	"sap/ui/rta/plugin/BaseCreate"
], function(
	uid,
	IconPool,
	Lib,
	DtUtil,
	CancelError,
	FlexUtils,
	AddIFrameDialog,
	BaseCreate
) {
	"use strict";

	/**
	 * Constructor for a new AddIFrame plugin.
	 *
	 * @param {string} [sId] - ID for the new object, generated automatically if no ID is given
	 * @param {object} [mSettings] - Initial settings for the new object
	 * @class The AddIFrame allows trigger AddIFrame operations on the overlay.
	 * @extends sap.ui.rta.plugin.BaseCreate
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @private
	 * @since 1.75
	 * @alias sap.ui.rta.plugin.AddIFrame
	 */
	const AddIFrame = BaseCreate.extend("sap.ui.rta.plugin.AddIFrame", /** @lends sap.ui.rta.plugin.AddIFrame.prototype */{
		metadata: {
			library: "sap.ui.rta"
		}
	});

	function getAddIFrameCommand(oModifiedElement, mSettings, oDesignTimeMetadata, sVariantManagementKey) {
		const oView = FlexUtils.getViewForControl(oModifiedElement);
		const sBaseId = oView.createId(uid());
		let sWidth;
		let sHeight;
		if (mSettings.frameWidth) {
			sWidth = mSettings.frameWidth + (mSettings.frameWidthUnit || "px");
		} else {
			sWidth = "100%";
		}
		if (mSettings.frameHeight) {
			sHeight = mSettings.frameHeight + (mSettings.frameHeightUnit || "px");
		} else {
			sHeight = "100%";
		}
		const mCommandContent = {
			targetAggregation: mSettings.aggregation,
			baseId: sBaseId,
			index: mSettings.index,
			url: mSettings.frameUrl,
			width: sWidth,
			height: sHeight,
			title: mSettings.title,
			advancedSettings: mSettings.advancedSettings
		};
		// Only forward allowFocusWithoutUserActivation when the dialog returned it (i.e. the
		// browser supports the Permissions Policy). Otherwise leave it absent so newly created
		// iframes keep the control's default behavior and don't silently activate focus blocking
		// once the browser gains support.
		if (mSettings.allowFocusWithoutUserActivation !== undefined) {
			mCommandContent.allowFocusWithoutUserActivation = mSettings.allowFocusWithoutUserActivation;
		}
		return this.getCommandFactory().getCommandFor(
			oModifiedElement, "addIFrame", mCommandContent, oDesignTimeMetadata, sVariantManagementKey
		);
	}

	/**
	 * @override
	 */
	AddIFrame.prototype.handler = function(aElementOverlays, mPropertyBag) {
		const oResponsibleElementOverlay = aElementOverlays[0];
		const { bAsSibling, action: oAction } = mPropertyBag.menuItem;
		const oParentOverlay = this._getParentOverlay(bAsSibling, oResponsibleElementOverlay);
		const oParent = oParentOverlay.getElement();
		const oDesignTimeMetadata = oParentOverlay.getDesignTimeMetadata();
		let iIndex = 0;

		if (bAsSibling) {
			const oSiblingElement = oResponsibleElementOverlay.getElement();
			const fnGetIndex = oDesignTimeMetadata.getAggregation(oAction.aggregation).getIndex;
			iIndex = this._determineIndex(oParent, oSiblingElement, oAction.aggregation, fnGetIndex);
		}

		const bAsContainer = !!oAction.getCreatedContainerId;

		const oAddIFrameDialog = new AddIFrameDialog();
		return AddIFrameDialog.buildUrlBuilderParametersFor(oParent)
		.then(function(mURLParameters) {
			const mAddIFrameDialogSettings = {
				parameters: mURLParameters,
				asContainer: bAsContainer
			};
			return oAddIFrameDialog.open(mAddIFrameDialogSettings, oParent, oAction);
		})
		.then(function(mSettings) {
			if (!mSettings) {
				throw new CancelError();
			}
			mSettings.index = iIndex;
			mSettings.aggregation = oAction.aggregation;
			mSettings.isSibling = bAsSibling;
			mSettings.action = oAction;
			return this.createCommands(oResponsibleElementOverlay, mSettings);
		}.bind(this))
		.catch(function(vError) {
			if (vError && !(vError instanceof CancelError)) {
				throw DtUtil.createError("AddIFrame#handler", vError, "sap.ui.rta");
			}
		});
	};

	AddIFrame.prototype.getActionText = function(oResponsibleElementOverlay, oAction) {
		const oTextResources = Lib.getResourceBundleFor("sap.ui.rta");
		return oTextResources.getText("CTX_ADDIFRAME", [oAction.text]);
	};

	/**
	 * @override
	 */
	AddIFrame.prototype.getMenuItems = async function(aElementOverlays) {
		IconPool.registerFont({
			collectionName: "tnt",
			fontFamily: "SAP-icons-TNT",
			fontURI: sap.ui.require.toUrl("sap/tnt/themes/base/fonts"),
			lazy: false
		});
		await IconPool.fontLoaded("tnt");

		let iBaseRank = this.getRank("CTX_CREATE_SIBLING_IFRAME");
		const oSiblingAction = this.getCreateActions(aElementOverlays[0], true)[0];
		const aMenuItems = await this._getMenuItems(aElementOverlays, {
			pluginId: "CTX_CREATE_SIBLING_IFRAME",
			icon: "sap-icon://tnt/content-enricher",
			bAsSibling: true,
			additionalInfoKey: "IFRAME_RTA_CONTEXT_MENU_INFO",
			rank: iBaseRank,
			action: oSiblingAction,
			description: "embed an iframe as a sibling of the element; the URL may include UI5 expression bindings computed from the parent element's data"
		});

		const aActions = this.getCreateActions(aElementOverlays[0], false);
		for (const oAction of aActions) {
			aMenuItems.push(await this._getMenuItems(aElementOverlays, {
				pluginId: `CTX_CREATE_CHILD_IFRAME_${oAction.aggregation.toUpperCase()}`,
				icon: "sap-icon://tnt/content-enricher",
				bAsSibling: false,
				additionalInfoKey: "IFRAME_RTA_CONTEXT_MENU_INFO",
				rank: ++iBaseRank,
				action: oAction,
				description: "embed an iframe as a child of the element; the URL may include UI5 expression bindings computed from the parent element's data"
			}));
		}
		return aMenuItems.flat();
	};

	/**
	 * @override
	 */
	AddIFrame.prototype.getActionName = function() {
		return "addIFrame";
	};

	/**
	 * Returns the parameters that a programmatic consumer must provide to create the commands for this plugin.
	 * @returns {object[]} List of parameter descriptors (name, type, required, description)
	 * @since 1.153
	 */
	AddIFrame.prototype.getParameters = function() {
		return [
			{
				name: "isSibling",
				type: "boolean",
				required: true,
				description: "Whether the iframe should be added as a sibling of the given overlay or as a child of the given overlay, depending on user instructions"
			},
			{
				name: "aggregation",
				type: "string",
				required: true,
				description: "The aggregation of the parent element to which the iframe should be added"
			},
			{
				name: "index",
				type: "int",
				required: true,
				description: "The position index at which the iframe should be added"
			},
			{
				name: "title",
				type: "string",
				required: false,
				description: "The title of the section if added as a section"
			},
			{
				name: "frameUrl",
				type: "string",
				required: true,
				description: [
					"The URL of the iframe content.",
					"May contain UI5 expression bindings in the form {= <expression> } to compute parts of the URL from the parent element's data.",
					"Expressions support property access (${PropertyName}), arithmetic (+, -, *, /, %), comparison (<, <=, >, >=, ===, !==), logical operators (&&, ||, !), the ternary conditional (a ? b : c), and standard functions including Math.floor, Math.ceil, Math.round, Math.abs, and String methods.",
					"When the user's request implies a computation (percentages, thresholds, ranges, unit conversions, units requiring rounding), locale/region choice (currency, language, country), express that computation inside {= ... } rather than substituting a raw property value.",
					"You must not encode parameters via encodeURIComponent as this is automatically done!"
				].join(" ")
			},
			{
				name: "frameWidth",
				type: "int",
				required: false,
				description: "The width of the iframe"
			},
			{
				name: "frameWidthUnit",
				type: "string",
				required: false,
				description: "The unit for the iframe width (must be one of %, px, vh)"
			},
			{
				name: "frameHeight",
				type: "int",
				required: false,
				description: "The height of the iframe"
			},
			{
				name: "frameHeightUnit",
				type: "string",
				required: false,
				description: "The unit for the iframe height (must be one of %, px, vh)"
			},
			{
				name: "advancedSettings",
				type: "object",
				signature: {
					allowForms: {
						type: "boolean",
						description: "Allow forms in the iframe",
						required: false
					},
					allowScripts: {
						type: "boolean",
						description: "Allow scripts in the iframe",
						required: false
					},
					allowSameOrigin: {
						type: "boolean",
						description: "Allow same origin access",
						required: false
					},
					allowPopups: {
						type: "boolean",
						description: "Allow popups in the iframe",
						required: false
					},
					allowModals: {
						type: "boolean",
						description: "Allow modals in the iframe",
						required: false
					},
					allowTopNavigation: {
						type: "boolean",
						description: "Allow top navigation in the iframe",
						required: false
					},
					allowDownloads: {
						type: "boolean",
						description: "Allow downloads in the iframe",
						required: false
					},
					additionalSandboxParameters: {
						type: "array",
						description: "Additional sandbox parameters",
						required: false
					}
				},
				required: false,
				description: "Advanced sandbox settings for the iframe, use as few as required. allowScripts, allowForms, allowSameOrigin is a reasonable default"
			}
		];
	};

	/**
	 * Collects the context that a programmatic consumer needs to build the parameters for this plugin,
	 * i.e. the list of parameters that are available for expression bindings in the iframe URL.
	 * The parameters are derived from the sibling parent's element; child insertion resolves to the
	 * same parent, so the available binding parameters are identical for both cases.
	 * @param {sap.ui.dt.ElementOverlay} oOverlay - Overlay for which the context is collected
	 * @returns {Promise<object>} Resolves with the context object containing the available binding parameters
	 * @since 1.153
	 */
	AddIFrame.prototype.getContext = async function(oOverlay) {
		const oParentOverlay = this._getParentOverlay(true, oOverlay);
		const oParent = oParentOverlay.getElement();
		const mParameters = await AddIFrameDialog.buildUrlBuilderParametersFor(oParent);
		return {
			parameters: {
				description: "Available parameters for bindings in the url (including name, label and a sample value)",
				value: mParameters
			}
		};
	};

	/**
	 * Creates the command for this plugin from the given parameters and fires the "elementModified" event.
	 * @param {sap.ui.dt.ElementOverlay} oOverlay - Target overlay
	 * @param {object} mParameters - Parameters as described by {@link #getParameters}
	 * @param {object} [mParameters.action] - Pre-resolved create action. When it defines a
	 *   <code>getCreatedContainerId</code> function the iframe is added as a container and the fired
	 *   event carries the action and title so the rename plugin can rename the new container.
	 * @returns {Promise<sap.ui.rta.command.BaseCommand>} Resolves with the created command
	 * @since 1.153
	 */
	AddIFrame.prototype.createCommands = async function(oOverlay, mParameters) {
		const oParentOverlay = this._getParentOverlay(mParameters.isSibling, oOverlay);
		const oParent = oParentOverlay.getElement();
		const oDesignTimeMetadata = oParentOverlay.getDesignTimeMetadata();
		const sVariantManagementReference = this.getVariantManagementReference(oParentOverlay);

		const oAction = mParameters.action;
		const bAsContainer = !!oAction?.getCreatedContainerId;

		const oCommand = await getAddIFrameCommand.call(
			this,
			oParent,
			mParameters,
			oDesignTimeMetadata,
			sVariantManagementReference
		);
		this.fireElementModified({
			command: oCommand,
			newControlId: oCommand.getBaseId(),
			// providing an action triggers the rename plugin, which we only want for addIFrame as container
			action: bAsContainer ? oAction : undefined,
			title: mParameters.title
		});
		return oCommand;
	};

	return AddIFrame;
});
