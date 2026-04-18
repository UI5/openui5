/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/i18n/Localization",
	"sap/ui/dt/util/ZIndexManager",
	"sap/ui/dt/Overlay",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/dt/Util",
	"sap/ui/rta/plugin/Plugin"
], function(
	Localization,
	ZIndexManager,
	Overlay,
	OverlayRegistry,
	DtUtil,
	Plugin
) {
	"use strict";

	/**
	 * Constructor for a new Resize plugin.
	 *
	 * @class
	 * @extends sap.ui.rta.plugin.Plugin
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @private
	 * @since 1.101
	 * @alias sap.ui.rta.plugin.Resize
	 */
	const Resize = Plugin.extend("sap.ui.rta.plugin.Resize", /** @lends sap.ui.rta.plugin.Resize.prototype */ {
		metadata: {
			library: "sap.ui.rta",
			properties: {
				// Handle used for resizing (dragging or keyboard)
				handle: "object",
				// Defines if resize dragging is currently happening
				dragging: "boolean"
			}
		}
	});

	const HANDLE_CLASS_NAME = "sapUiRtaResizeHandle";
	const HANDLE_EXTENSION_CLASS_NAME = "sapUiRtaResizeHandleExtension";
	const FULL_SCREEN_DIV_CLASS_NAME = "sapUiRtaFullScreenDiv";
	const MINIMUM_WIDTH = 15; // px

	const bRTL = Localization.getRTL();
	const iDirectionFactor = bRTL ? -1 : 1;
	const sBeginDirection = bRTL ? "right" : "left";
	const iKeyboardStep = 15 * iDirectionFactor; // px

	function getWidth(oOverlay) {
		return oOverlay.getDomRef().offsetWidth;
	}

	function createFullScreenDiv() {
		this._oFullScreenDiv = document.createElement("div");
		this._oFullScreenDiv.className = FULL_SCREEN_DIV_CLASS_NAME;
		this._oFullScreenDiv.style["z-index"] = ZIndexManager.getNextZIndex();
		const oOverlayContainer = Overlay.getOverlayContainer();
		oOverlayContainer.append(this._oFullScreenDiv);
	}

	function removeFullScreenDiv() {
		this._oFullScreenDiv.removeEventListener("mouseup", this._fnOnMouseUp);
		this._oFullScreenDiv.removeEventListener("mousemove", this._fnOnMouseMove);
		this._oFullScreenDiv.remove();
		delete this._oFullScreenDiv;
	}

	/**
	 * @override
	 */
	Resize.prototype._isEditable = function(oOverlay) {
		if (this.getAction(oOverlay)?.handler) {
			return Promise.resolve(this.hasStableId(oOverlay));
		}
		return this._checkChangeHandlerAndStableId(oOverlay);
	};

	Resize.prototype._createCompositeCommand = async function(oOverlay, oElement, aChanges) {
		const oCompositeCommand = await this.getCommandFactory().getCommandFor(oElement, "composite");

		for (const oChange of aChanges) {
			const oResizeCommand = await this.getCommandFactory().getCommandFor(
				oChange.selectorElement,
				"resize",
				oChange.changeSpecificData,
				undefined,
				this.getVariantManagementReference(oOverlay)
			);
			oCompositeCommand.addCommand(oResizeCommand);
		}
		return oCompositeCommand;
	};

	Resize.prototype._createCommand = async function(oOverlay, iNewWidth) {
		const oElement = oOverlay.getElement();
		const oAction = this.getAction(oOverlay);
		const fnHandler = oAction.handler;

		let oCompositeCommand;
		if (fnHandler) {
			try {
				const aChanges = await fnHandler(oElement, { newWidth: iNewWidth });
				if (aChanges.length > 0) {
					oCompositeCommand = await this._createCompositeCommand(oOverlay, oElement, aChanges);
				}
			} catch (oError) {
				throw DtUtil.propagateError(
					oError,
					"Resize#handler",
					"Error occurred during handler execution",
					"sap.ui.rta.plugin"
				);
			}
		} else {
			// Case without handler - single command (= one change)
			oCompositeCommand = await this._createCompositeCommand(oOverlay, oElement, [{
				changeSpecificData: {
					changeType: oAction.changeType,
					content: {
						resizedElementId: oElement.getId(),
						newWidth: iNewWidth
					}
				},
				selectorElement: oElement
			}]);
		}

		if (oCompositeCommand?.getCommands().length > 0) {
			this.fireElementModified({
				command: oCompositeCommand
			});
		}
	};

	Resize.prototype._onHandleMouseDown = function(oOverlay, oEvent) {
		this.setBusy(true);
		if (oEvent.detail === 2) {
			this._onDoubleClick(oOverlay);
			this.setBusy(false);
			return;
		}
		createFullScreenDiv.call(this);
		const oHandle = this.getHandle();
		const oOverlayDomElement = oOverlay.getDomRef();
		const iOverlayBoundary = Math.round(oOverlayDomElement.getBoundingClientRect()[sBeginDirection]);
		const iHalfOffsetWidth = Math.round(oHandle.offsetWidth / 2);
		const iMousePosition = oEvent.clientX;
		let oExtension;

		// Initially set the current size of the element
		let iNewWidth = getWidth(oOverlay);
		// Place the middle of the handle on the mouse position
		oHandle.style[sBeginDirection] = `${(iMousePosition - iOverlayBoundary) * iDirectionFactor - iHalfOffsetWidth}px`;

		this.setDragging(true);
		oOverlay.focus();

		this._fnOnMouseMove = onMouseMove.bind(this);
		this._fnOnMouseUp = onMouseUp.bind(this);

		const oElement = oOverlay.getElement();
		const oAction = this.getAction(oOverlay);
		// Create handle extension (e.g. vertical line on the handle end going through all the lines of a table)
		if (oAction.getHandleExtensionHeight) {
			const iHandleExtensionHeight = oAction.getHandleExtensionHeight(oElement);
			oExtension = document.createElement("div");
			oExtension.className = HANDLE_EXTENSION_CLASS_NAME;
			oExtension.style.height = `${iHandleExtensionHeight}px`;
			oExtension.style["pointer-events"] = "none";
		}

		// The handle position is relative to the parent Overlay
		function onMouseMove(oEvent) {
			if (oExtension) {
				oHandle.append(oExtension);
				oHandle.extension = oExtension;
			}

			iNewWidth = (oEvent.clientX - iOverlayBoundary) * iDirectionFactor + iHalfOffsetWidth;

			iNewWidth = this._limitNewWidth(oOverlay, iNewWidth);

			// The middle of the handle is on the mouse cursor
			oHandle.style[sBeginDirection] = `${iNewWidth - oHandle.offsetWidth}px`;
		}

		function onMouseUp() {
			this._finalizeResize(oOverlay, iNewWidth);

			removeFullScreenDiv.call(this);
			this.setDragging(false);
			this.setBusy(false);
		}

		this._oFullScreenDiv.addEventListener("mousemove", this._fnOnMouseMove);
		this._oFullScreenDiv.addEventListener("mouseup", this._fnOnMouseUp);
	};

	Resize.prototype._onDoubleClick = function(oOverlay) {
		const vAction = this.getAction(oOverlay);
		if (vAction.getDoubleClickWidth) {
			const iNewWidth = vAction.getDoubleClickWidth(oOverlay.getElement());
			this._finalizeResize(oOverlay, iNewWidth);
		}
	};

	Resize.prototype._finalizeResize = async function(oOverlay, iNewWidth) {
		const iOldWidth = getWidth(oOverlay);

		if (iNewWidth === iOldWidth) {
			return undefined;
		}

		const fnRestoreEventHandler = function() {
			oOverlay.setSelected(true);
			oOverlay.focus();
			oOverlay.detachEvent("geometryChanged", fnRestoreEventHandler, this);
			oOverlay.attachEvent("geometryChanged", this._onOverlayGeometryChanged, this);
		};

		oOverlay.detachEvent("geometryChanged", this._onOverlayGeometryChanged, this);
		oOverlay.attachEvent("geometryChanged", fnRestoreEventHandler, this);
		oOverlay.setSelected(false);

		try {
			await this._createCommand(oOverlay, iNewWidth);
		} catch (oError) {
			fnRestoreEventHandler.call(this);
			throw DtUtil.propagateError(
				oError,
				"Resize",
				"Error occurred during resize command creation",
				"sap.ui.rta.plugin"
			);
		}
	};

	Resize.prototype._limitNewWidth = function(oOverlay, iNewWidth) {
		const vAction = this.getAction(oOverlay);
		const oElement = oOverlay.getElement();
		const mSizeLimits = vAction.getSizeLimits && vAction.getSizeLimits(oElement);
		// Prevent resize to negative widths (minimum = 15px)
		const iMinimumWidth = mSizeLimits && mSizeLimits.minimumWidth || MINIMUM_WIDTH;
		const iMaximumWidth = mSizeLimits && mSizeLimits.maximumWidth;

		let iReturnWidth = iNewWidth;
		if (iMinimumWidth && (iNewWidth < iMinimumWidth)) {
			iReturnWidth = iMinimumWidth;
		}
		if (iMaximumWidth && (iNewWidth > iMaximumWidth)) {
			iReturnWidth = iMaximumWidth;
		}

		return iReturnWidth;
	};

	Resize.prototype._createHandle = function(oEvent) {
		const oCurrentHandle = this.getHandle();
		const oOverlay = OverlayRegistry.getOverlay(oEvent.target.id);

		// Mouse is over Overlay without action (e.g. child overlay)
		const oAction = this.getAction(oOverlay);
		if (!oAction || !this.isEnabled([oOverlay], { action: oAction })) {
			this._removeHandle(false);
			return;
		}

		// Create the handle and attach it to active overlay
		if (!oCurrentHandle && !this.getDragging()) {
			const oOverlayDomElement = oOverlay.getDomRef();
			const oNewHandle = document.createElement("div");
			oNewHandle.className = HANDLE_CLASS_NAME;
			oOverlayDomElement.append(oNewHandle);
			oNewHandle.style[sBeginDirection] = `${oOverlayDomElement.clientWidth - oNewHandle.clientWidth}px`;
			oNewHandle.style["z-index"] = ZIndexManager.getNextZIndex();
			oNewHandle.addEventListener("mousedown", this._onHandleMouseDown.bind(this, oOverlay));
			this.setHandle(oNewHandle);
		}
	};

	Resize.prototype._removeHandle = function(bIgnoreDrag) {
		const oHandle = this.getHandle();
		if (oHandle && (bIgnoreDrag || !this.getDragging())) {
			oHandle.remove();
			this.setDragging(false);
			this.setHandle(null);
		}
	};

	Resize.prototype._onOverlayMouseMove = function(oEvent) {
		const oOverlay = OverlayRegistry.getOverlay(oEvent.target.id);
		if (oOverlay?.isSelectable()) {
			this._createHandle(oEvent);
		}
	};

	Resize.prototype._onOverlayKeyDown = function(oEvent) {
		const oOverlay = OverlayRegistry.getOverlay(oEvent.target.id);
		// During drag the focus remains on the overlay
		if (oEvent.key === "Escape") {
			this._removeHandle(true);
			if (this._oFullScreenDiv) {
				removeFullScreenDiv.call(this);
			}
			oEvent.stopImmediatePropagation();
			return;
		}
		// Shift + right/left to resize
		if (!oEvent.shiftKey || oEvent.ctrlKey || oEvent.metaKey || oEvent.altKey) {
			return;
		}
		const iCurrentWidth = getWidth(oOverlay);
		if (oEvent.key === "ArrowLeft" || oEvent.key === "ArrowRight") {
			const iDeltaWidth = oEvent.key === "ArrowLeft" ? iKeyboardStep * (-1) : iKeyboardStep;
			const iNewWidth = this._limitNewWidth(oOverlay, iCurrentWidth + iDeltaWidth);
			this._finalizeResize(oOverlay, iNewWidth);
		}
	};

	Resize.prototype._onOverlayMouseLeave = function() {
		this._removeHandle(false);
	};

	// Handle selection change via keyboard - show handle without mouseover
	Resize.prototype._onOverlaySelectionChange = function(oEvent) {
		if (oEvent.getParameter("selected")) {
			this._removeHandle(false);
			// Add target.id to DT event so it can be handled like a browser event
			oEvent.target = {
				id: oEvent.getParameter("id")
			};
			this._createHandle(oEvent);
		} else {
			this._removeHandle();
		}
	};

	Resize.prototype._onOverlayFocus = function(oEvent) {
		const oOverlay = OverlayRegistry.getOverlay(oEvent.target.id);
		if (oOverlay.getSelected() && !this.getHandle()) {
			this._createHandle(oEvent);
		}
	};

	Resize.prototype._onOverlayGeometryChanged = function(oEvent) {
		const oOverlay = OverlayRegistry.getOverlay(oEvent.getParameter("id"));
		if (oOverlay.getSelected() && oOverlay.hasFocus()) {
			this._removeHandle();
			this._createHandle(oEvent);
		}
	};

	/**
	 * @override
	 */
	Resize.prototype.registerElementOverlay = function(...aArgs) {
		const [oOverlay] = aArgs;
		const oAction = this.getAction(oOverlay);
		if (oAction && this.isEnabled([oOverlay], { action: oAction })) {
			oOverlay.attachBrowserEvent("mousemove", this._onOverlayMouseMove, this);
			oOverlay.attachBrowserEvent("mouseleave", this._onOverlayMouseLeave, this);
			oOverlay.attachBrowserEvent("keydown", this._onOverlayKeyDown, this);
			oOverlay.attachBrowserEvent("focus", this._onOverlayFocus, this);
			oOverlay.attachEvent("selectionChange", this._onOverlaySelectionChange, this);
			oOverlay.attachEvent("geometryChanged", this._onOverlayGeometryChanged, this);
		}
		Plugin.prototype.registerElementOverlay.apply(this, aArgs);
	};

	/**
	 * @override
	 */
	Resize.prototype.deregisterElementOverlay = function(...aArgs) {
		const [oOverlay] = aArgs;
		oOverlay.detachBrowserEvent("mousemove", this._onOverlayMouseMove, this);
		oOverlay.detachBrowserEvent("mouseleave", this._onOverlayMouseLeave, this);
		oOverlay.detachBrowserEvent("keydown", this._onOverlayKeyDown, this);
		oOverlay.detachBrowserEvent("focus", this._onOverlayFocus, this);
		oOverlay.detachEvent("selectionChange", this._onOverlaySelectionChange, this);
		oOverlay.detachEvent("geometryChanged", this._onOverlayGeometryChanged, this);
		Plugin.prototype.deregisterElementOverlay.apply(this, aArgs);
	};

	/**
	 * @override
	 */
	Resize.prototype.getActionName = function() {
		return "resize";
	};

	return Resize;
});