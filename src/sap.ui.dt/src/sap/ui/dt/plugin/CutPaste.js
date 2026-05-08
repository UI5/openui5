/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/dt/Plugin",
	"sap/ui/dt/plugin/ElementMover",
	"sap/ui/dt/OverlayUtil",
	"sap/ui/dt/Util",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/events/KeyCodes",
	"sap/ui/Device"
], function(
	Plugin,
	ElementMover,
	OverlayUtil,
	DtUtil,
	OverlayRegistry,
	KeyCodes,
	Device
) {
	"use strict";

	var INSERT_AFTER_ELEMENT = true;

	/**
	 * Constructor for a new CutPaste.
	 *
	 * @param {string} [sId] id for the new object, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new object
	 * @class The CutPaste enables Cut & Paste functionality for the overlays based on aggregation types
	 * @extends sap.ui.dt.Plugin
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @private
	 * @since 1.34
	 * @alias sap.ui.dt.plugin.CutPaste
	 */
	var CutPaste = Plugin.extend("sap.ui.dt.plugin.CutPaste", /** @lends sap.ui.dt.plugin.CutPaste.prototype */ {
		metadata: {
			library: "sap.ui.dt",
			properties: {
				movableTypes: {
					type: "string[]",
					defaultValue: [
						"sap.ui.core.Element"
					]
				},
				elementMover: {
					type: "any" // "sap.ui.dt.plugin.ElementMover"
				}
			},
			associations: {}
		}
	});

	function isCutEnabled(oElementOverlay) {
		return OverlayUtil.canBeRemovedFromAggregationOnMove(oElementOverlay, this.getDesignTime());
	}

	CutPaste.prototype.init = function() {
		this.setElementMover(new ElementMover());
	};

	/**
	 * @override
	 */
	CutPaste.prototype.registerElementOverlay = function(oOverlay) {
		var oElement = oOverlay.getElement();
		this.getElementMover().checkMovable(oOverlay)
		.then(function(bMovable) {
			// Register key down so that ESC is possible on all overlays
			oOverlay.attachBrowserEvent("keydown", this._onKeyDown, this);
			if (
				this.getElementMover().isMovableType(oElement)
					&& bMovable
			) {
				oOverlay.setMovable(true);
			}
			if (this.getElementMover().getMovedOverlay()) {
				this.getElementMover().activateTargetZonesFor(this.getElementMover().getMovedOverlay());
			}
		}.bind(this))
		.catch(function(oError) {
			throw DtUtil.createError(
				"CutPaste#registerElementOverlay",
				`An error occurred during checkMovable: ${oError}`
			);
		});
	};

	/**
	 * @override
	 */
	CutPaste.prototype.deregisterElementOverlay = function(oOverlay) {
		oOverlay.setMovable(false);
		oOverlay.detachBrowserEvent("keydown", this._onKeyDown, this);

		if (this.getElementMover().getMovedOverlay()) {
			this.getElementMover().deactivateTargetZonesFor(this.getElementMover().getMovedOverlay());
		}
	};

	CutPaste.prototype.setMovableTypes = function(aMovableTypes) {
		this.getElementMover().setMovableTypes(aMovableTypes);
		return this.setProperty("movableTypes", aMovableTypes);
	};

	CutPaste.prototype.setElementMover = function(oElementMover) {
		oElementMover.setMovableTypes(this.getMovableTypes());
		return this.setProperty("elementMover", oElementMover);
	};

	CutPaste.prototype.isPasteEnabled = function(oTargetOverlay) {
		var oTargetZoneAggregation = this._getTargetZoneAggregation(oTargetOverlay);
		if ((oTargetZoneAggregation) || (OverlayUtil.isInTargetZoneAggregation(oTargetOverlay))) {
			return true;
		}
		return false;
	};

	/**
	 * @override
	 */
	CutPaste.prototype.isAvailable = function(aElementOverlays, oAction, bSibling) {
		// the sibling case represents the Cut action in the context menu
		if (bSibling) {
			return aElementOverlays.every((oElementOverlay) => oElementOverlay.isGenerallyMovable());
		}
		return aElementOverlays.every((oElementOverlay) => this._isEditableByPlugin(oElementOverlay, bSibling));
	};

	/**
	 * @override
	 */
	CutPaste.prototype.isEnabled = function(aElementOverlays, oMenuItem) {
		if (oMenuItem?.id === "CTX_PASTE") {
			return this.isPasteEnabled(aElementOverlays[0]);
		}
		if (aElementOverlays.length === 1) {
			return isCutEnabled.call(this, aElementOverlays[0]);
		}
		return false;
	};

	CutPaste.prototype._onKeyDown = function(oEvent) {
		var oOverlay = OverlayRegistry.getOverlay(oEvent.currentTarget.id);

		// on macintosh os cmd-key is used instead of ctrl-key
		var bCtrlKey = Device.os.macintosh ? oEvent.metaKey : oEvent.ctrlKey;

		if ((oEvent.keyCode === KeyCodes.X) && (oEvent.shiftKey === false) && (oEvent.altKey === false) && (bCtrlKey === true)) {
			// CTRL+X
			if (isCutEnabled.call(this, oOverlay)) {
				this.cut(oOverlay);
				oEvent.stopPropagation();
			}
		} else if ((oEvent.keyCode === KeyCodes.V) && (oEvent.shiftKey === false) && (oEvent.altKey === false) && (bCtrlKey === true)) {
			// CTRL+V
			if (this.getElementMover().getMovedOverlay()) {
				this.paste(oOverlay);
			}
			oEvent.stopPropagation();
		} else if (oEvent.keyCode === KeyCodes.ESCAPE) {
			// ESC
			this.stopCutAndPaste();
			oEvent.stopPropagation();
		}
	};

	CutPaste.prototype.cut = function(oOverlay) {
		this.stopCutAndPaste();

		if (oOverlay.isMovable()) {
			this.getElementMover().setMovedOverlay(oOverlay);
			oOverlay.addStyleClass("sapUiDtOverlayCutted");

			return this.getElementMover().activateAllValidTargetZones(this.getDesignTime())
			.then(function() {
				oOverlay.focus();
			});
		}
		return Promise.resolve(undefined);
	};

	/**
	 * The actual execution of paste. This method is additionally defined because
	 * there might be steps between the execution and finalization (stopCutAndPaste) of
	 * paste (for example in the RTA plugin that extends this one).
	 * @param  {sap.ui.dt.Overlay} oTargetOverlay The Overlay where the element will be pasted
	 * @returns {boolean} <code>true</code> if paste was successfully executed
	 */
	CutPaste.prototype._executePaste = function(oTargetOverlay) {
		const oCutOverlay = this.getElementMover().getMovedOverlay();
		if (!oCutOverlay) {
			return false;
		}

		let bResult = false;
		if (!this._isForSameElement(oCutOverlay, oTargetOverlay)) {
			// if the paste is done on a container, insertInto is used, otherwise repositionOn is used
			const oTargetZoneAggregation = this._getTargetZoneAggregation(oTargetOverlay);
			if (oTargetZoneAggregation) {
				this.getElementMover().insertInto(oCutOverlay, oTargetZoneAggregation);
				bResult = true;
			} else if (OverlayUtil.isInTargetZoneAggregation(oTargetOverlay)) {
				this.getElementMover().repositionOn(oCutOverlay, oTargetOverlay, INSERT_AFTER_ELEMENT);
				bResult = true;
			}
		}

		// focus get invalidated, see BCP 1580061207
		if (bResult) {
			oCutOverlay.setSelected(true);
			setTimeout(function() {
				oCutOverlay.focus();
			}, 0);
		}

		return bResult;
	};

	/**
	 * Paste the element into the target overlay
	 * @param  {sap.ui.dt.Overlay} oTargetOverlay The Overlay where the element will be pasted
	 */
	CutPaste.prototype.paste = function(oTargetOverlay) {
		var bPasteExecuted = this._executePaste(oTargetOverlay);

		if (bPasteExecuted === true) {
			this.stopCutAndPaste();
		}
	};

	/**
	 * Finalize cut&paste operation + cleanup
	 */
	CutPaste.prototype.stopCutAndPaste = function() {
		var oCutOverlay = this.getElementMover().getMovedOverlay();
		if (oCutOverlay) {
			oCutOverlay.removeStyleClass("sapUiDtOverlayCutted");
			this.getElementMover().setMovedOverlay(null);
			this.getElementMover().deactivateAllTargetZones(this.getDesignTime());
		}
	};

	CutPaste.prototype._isForSameElement = function(oCutOverlay, oTargetOverlay) {
		return oTargetOverlay.getElement() === oCutOverlay.getElement();
	};

	CutPaste.prototype._getTargetZoneAggregation = function(oTargetOverlay) {
		var aAggregationOverlays = oTargetOverlay.getChildren();
		var aPossibleTargetZones = aAggregationOverlays.filter(function(oAggregationOverlay) {
			return oAggregationOverlay.isTargetZone();
		});
		if (aPossibleTargetZones.length > 0) {
			return aPossibleTargetZones[0];
		}
		return null;
	};

	return CutPaste;
});