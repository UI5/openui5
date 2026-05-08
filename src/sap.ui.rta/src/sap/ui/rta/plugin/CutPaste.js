/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/Lib",
	"sap/ui/dt/plugin/CutPaste",
	"sap/ui/dt/Util",
	"sap/ui/rta/plugin/Plugin",
	"sap/ui/rta/plugin/RTAElementMover",
	"sap/ui/rta/Utils"
], function(
	Lib,
	DtCutPaste,
	DtUtil,
	Plugin,
	RTAElementMover,
	Utils
) {
	"use strict";

	/**
	 * Constructor for a new CutPaste plugin.
	 *
	 * @param {string} [sId] id for the new object, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new object
	 *
	 * @class
	 * The CutPaste plugin adds functionality/styling required for RTA.
	 * @extends sap.ui.dt.plugin.CutPaste
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @since 1.30
	 * @alias sap.ui.rta.plugin.CutPaste
	 */
	const CutPaste = DtCutPaste.extend("sap.ui.rta.plugin.CutPaste", /** @lends sap.ui.rta.plugin.CutPaste.prototype */ {
		metadata: {
			library: "sap.ui.rta",
			properties: {
				commandFactory: {
					type: "object",
					multiple: false
				},
				commandStack: {
					type: "object",
					multiple: false
				}
			},
			events: {
				dragStarted: {},

				elementModified: {
					command: {
						type: "sap.ui.rta.command.BaseCommand"
					}
				}
			}
		}
	});

	// Extends the CutPaste Plugin with all the functions from our rta base plugin
	Utils.extendWith(CutPaste.prototype, Plugin.prototype, function(vDestinationValue, vSourceValue, sProperty) {
		return sProperty !== "getMetadata";
	});

	/**
	 * @override
	 */
	CutPaste.prototype.init = function(...aArgs) {
		DtCutPaste.prototype.init.apply(this, aArgs);
		this.setElementMover(new RTAElementMover({ commandFactory: this.getCommandFactory() }));
	};

	/**
	 * @override
	 */
	CutPaste.prototype._isEditable = async function(oOverlay, mPropertyBag) {
		// asSibling = Cut, asChild = Paste
		// if cut is editable, paste should also always be editable
		const bCutEditable = await this._isCutEditable(oOverlay, mPropertyBag);
		return {
			asSibling: bCutEditable,
			asChild: bCutEditable || await this._isPasteEditable(oOverlay)
		};
	};

	CutPaste.prototype._isCutEditable = function(oOverlay, mPropertyBag) {
		return this.getElementMover().isEditable(oOverlay, mPropertyBag.onRegistration);
	};

	CutPaste.prototype._isPasteEditable = async function(oOverlay) {
		const oElementMover = this.getElementMover();
		if (!this.hasStableId(oOverlay)) {
			return false;
		}
		const bMoveAvailable = await oElementMover.isMoveAvailableOnRelevantContainer(oOverlay);
		if (!bMoveAvailable) {
			return false;
		}
		return Utils.doIfAllControlsAreAvailable([oOverlay], function() {
			return oElementMover.isMoveAvailableForChildren(oOverlay);
		});
	};

	/**
	 * @override
	 */
	CutPaste.prototype.isAvailable = function(...args) {
		// This is required as the rta.cutPaste plugin is extended by both the
		// dt.CutPaste and rta.Plugin module. See Utils.extendWith in this file.
		return DtCutPaste.prototype.isAvailable.apply(this, args);
	};

	/**
	 * @override
	 */
	CutPaste.prototype.isEnabled = function(...args) {
		// This is required as the rta.cutPaste plugin is extended by both the
		// dt.CutPaste and rta.Plugin module. See Utils.extendWith in this file.
		return DtCutPaste.prototype.isEnabled.apply(this, args);
	};

	/**
	 * @override
	 */
	CutPaste.prototype.registerElementOverlay = function(...aArgs) {
		DtCutPaste.prototype.registerElementOverlay.apply(this, aArgs);
		Plugin.prototype.registerElementOverlay.apply(this, aArgs);
	};

	/**
	 * Additionally to super->deregisterOverlay this method detaches the browser events
	 * @param {sap.ui.dt.Overlay} oOverlay overlay object
	 * @override
	 */
	CutPaste.prototype.deregisterElementOverlay = function(...aArgs) {
		DtCutPaste.prototype.deregisterElementOverlay.apply(this, aArgs);
		Plugin.prototype.removeFromPluginsList.apply(this, aArgs);
	};

	/**
	 * @override
	 */
	CutPaste.prototype.handler = function(aOverlays, mPropertyBag) {
		if (mPropertyBag.menuItem.id === "CTX_PASTE") {
			return this.paste(aOverlays[0]);
		}
		return this.cut(aOverlays[0]);
	};

	/**
	 * @override
	 */
	CutPaste.prototype.paste = async function(oTargetOverlay) {
		try {
			this._executePaste(oTargetOverlay);
			await DtUtil.waitForSynced(this.getDesignTime())();
			const oMoveCommand = await this.getElementMover().buildMoveCommand();
			this.fireElementModified({
				command: oMoveCommand
			});
			this.stopCutAndPaste();
		} catch (oError) {
			throw DtUtil.propagateError(
				oError,
				"CutPaste#paste",
				"Error occurred during handler execution",
				"sap.ui.rta.plugin"
			);
		}
	};

	/**
	 * @override
	 */
	CutPaste.prototype.cut = async function(...aArgs) {
		const [oOverlay] = aArgs;
		await DtCutPaste.prototype.cut.apply(this, aArgs);
		oOverlay.setSelected(false);
	};

	/**
	 * Retrieve the context menu item for the actions.
	 * Two items are returned here: one for "cut" and one for "paste".
	 * @param {sap.ui.dt.ElementOverlay[]} aElementOverlays - Target overlays
	 * @return {object[]} - array of the items with required data
	 */
	CutPaste.prototype.getMenuItems = async function(aElementOverlays) {
		// the action is already checked during the isEditable check, so we don't need to fetch it here again
		// but we still need to differentiate the two different scenarios, and the _getMenuItems should not fetch the action,
		// so a dummy action is used.
		// The two different actions have different editable values, which are differentiated by the bAsSibling value
		// Cut has the value of bAsSibling=true, since mostly the movable objects are the siblings
		// Paste has the value bAsSibling=false, since it additionally is available on parents
		const oPasteMenuItem = (await this._getMenuItems(aElementOverlays, {
			pluginId: "CTX_PASTE",
			text: Lib.getResourceBundleFor("sap.ui.rta").getText("CTX_PASTE"),
			icon: "sap-icon://paste",
			rank: this.getRank("CTX_PASTE"),
			action: { dummyAction: true, id: "CTX_PASTE" },
			bAsSibling: false
		}))[0];
		const oCutMenuItem = (await this._getMenuItems(aElementOverlays, {
			pluginId: "CTX_CUT",
			text: Lib.getResourceBundleFor("sap.ui.rta").getText("CTX_CUT"),
			icon: "sap-icon://scissors",
			rank: this.getRank("CTX_CUT"),
			action: { dummyAction: true, id: "CTX_CUT" },
			bAsSibling: true
		}))[0];
		return [oCutMenuItem, oPasteMenuItem].filter(Boolean);
	};

	CutPaste.prototype.getActionName = function() {
		return "move";
	};

	return CutPaste;
});