/*!
 * ${copyright}
 */

// Provides class sap.ui.dt.plugin.ElementMover.
sap.ui.define([
	"sap/ui/base/Object",
	"sap/ui/base/ManagedObject",
	"sap/ui/dt/ElementUtil",
	"sap/ui/dt/OverlayUtil",
	"sap/ui/dt/Util"
], function(
	BaseObject,
	ManagedObject,
	ElementUtil,
	OverlayUtil,
	DtUtil
) {
	"use strict";

	/**
	 * Constructor for a new ElementMover.
	 *
	 * @param {string}
	 *          [sId] id for the new object, generated automatically if no id is given
	 * @param {object}
	 *          [mSettings] initial settings for the new object
	 * @class The ElementMover enables movement of UI5 elements based on aggregation types, which can be used by drag and
	 *        drop or cut and paste behavior.
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @private
	 * @since 1.34
	 * @alias sap.ui.dt.plugin.ElementMover
	 */
	var ElementMover = ManagedObject.extend("sap.ui.dt.plugin.ElementMover", /** @lends sap.ui.dt.plugin.ElementMover.prototype */ {
		metadata: {
			library: "sap.ui.dt",
			properties: {
				movableTypes: {
					type: "string[]",
					defaultValue: ["sap.ui.core.Element"]
				}
			},
			associations: {},
			events: {
				/** Event fired when the requested valid target zones are activated */
				validTargetZonesActivated: {}
			}
		}
	});

	/**
	 * @private
	 */
	ElementMover.prototype._getMovableTypes = function() {
		return this.getProperty("movableTypes") || [];
	};

	/**
	 * Predicate to compute movability of a type
	 * @param {object} oElement - Element to be checked
	 * @returns {boolean} <code>true</code> if type is movable, <code>false</code> otherwise
	 * @public
	 */
	ElementMover.prototype.isMovableType = function(oElement) {
		var aMovableTypes = this._getMovableTypes();

		return aMovableTypes.some(function(sType) {
			return BaseObject.isObjectA(oElement, sType);
		});
	};

	/**
	 * @param {sap.ui.dt.Overlay} oOverlay - overlay instance
	 * @return {Promise} Resolved promise with true value
	 * @protected
	 */
	ElementMover.prototype.checkMovable = function() {
		return Promise.resolve(true);
	};

	/**
	 * returns the moved overlay (only during movements)
	 *
	 * @public
	 * @return {sap.ui.dt.Overlay} overlay which is moved
	 */
	ElementMover.prototype.getMovedOverlay = function() {
		return this._oMovedOverlay;
	};

	/**
	 * set the moved overlay (only during movements)
	 *
	 * @param {sap.ui.dt.Overlay}
	 *          [oMovedOverlay] overlay which is moved
	 */
	ElementMover.prototype.setMovedOverlay = function(oMovedOverlay) {
		if (oMovedOverlay) {
			this._source = OverlayUtil.getParentInformation(oMovedOverlay);
		} else {
			delete this._source;
		}
		this._oMovedOverlay = oMovedOverlay;
	};

	ElementMover.prototype._getSource = function() {
		return this._source;
	};

	/**
	 * @private
	 */
	ElementMover.prototype.activateAllValidTargetZones = function(oDesignTime, sAdditionalStyleClass) {
		return this._iterateAllAggregations(oDesignTime, this._activateValidTargetZone.bind(this), sAdditionalStyleClass, true)
		.then(function() {
			this.fireValidTargetZonesActivated();
		}.bind(this));
	};

	/**
	 * @private
	 */
	ElementMover.prototype._activateValidTargetZone = function(oAggregationOverlay, sAdditionalStyleClass) {
		return this.checkTargetZone(oAggregationOverlay)
		.then(function(bValidTargetZone) {
			if (bValidTargetZone) {
				oAggregationOverlay.setTargetZone(true);
				if (sAdditionalStyleClass) {
					oAggregationOverlay.addStyleClass(sAdditionalStyleClass);
				}
			}
		})
		.catch(function(oError) {
			throw DtUtil.createError(
				"ElementMover#_activateValidTargetZone",
				`An error occurred during activation of valid target zones: ${oError}`
			);
		});
	};

	/**
	 * @param {sap.ui.dt.AggregationOverlay} oAggregationOverlay - Aggregation overlay to be checked for target zone
	 * @param {sap.ui.dt.ElementOverlay} oOverlay - Overlay being moved
	 * @param {boolean} bOverlayNotInDom - Flag defining if overlay is not in DOM
	 * @returns {Promise.<boolean>} Resolved promise with <code>true</code> if the aggregation overlay is a valid target zone for the overlay
	 * @protected
	 */
	ElementMover.prototype.checkTargetZone = function(oAggregationOverlay, oOverlay, bOverlayNotInDom) {
		var oMovedOverlay = oOverlay || this.getMovedOverlay();
		return ElementUtil.checkTargetZone(oAggregationOverlay, oMovedOverlay, bOverlayNotInDom);
	};

	/**
	 * @private
	 */
	ElementMover.prototype._deactivateTargetZone = function(oAggregationOverlay, sAdditionalStyleClass) {
		oAggregationOverlay.setTargetZone(false);
		if (sAdditionalStyleClass) {
			oAggregationOverlay.removeStyleClass(sAdditionalStyleClass);
		}
	};

	/**
	 * @private
	 */
	ElementMover.prototype.activateTargetZonesFor = function(oOverlay, sAdditionalStyleClass) {
		return this._iterateOverlayAggregations(oOverlay, this._activateValidTargetZone.bind(this), sAdditionalStyleClass, true)
		.then(function() {
			this.fireValidTargetZonesActivated();
		}.bind(this));
	};

	/**
	 * @private
	 */
	ElementMover.prototype.deactivateTargetZonesFor = function(oOverlay, sAdditionalStyleClass) {
		this._iterateOverlayAggregations(oOverlay, this._deactivateTargetZone.bind(this), sAdditionalStyleClass);
	};

	/**
	 * @private
	 */
	ElementMover.prototype.deactivateAllTargetZones = function(oDesignTime, sAdditionalStyleClass) {
		this._iterateAllAggregations(oDesignTime, this._deactivateTargetZone.bind(this), sAdditionalStyleClass);
	};

	/**
	 * @private
	 */
	ElementMover.prototype._iterateAllAggregations = function(oDesignTime, fnStep, sAdditionalStyleClass, bAsync) {
		var aOverlays = oDesignTime.getElementOverlays();
		// if bAsync true the return value of fnStep should return promises
		var aResultPromises = aOverlays.map(function(oOverlay) {
			return this._iterateOverlayAggregations(oOverlay, fnStep, sAdditionalStyleClass, bAsync);
		}, this);
		if (bAsync) {
			return Promise.all(aResultPromises);
		}
	};

	/**
	 * @private
	 */
	ElementMover.prototype._iterateOverlayAggregations = function(oOverlay, fnStep, sAdditionalStyleClass, bAsync) {
		var aAggregationOverlays = oOverlay.getChildren();
		// if bAsync true the return value of fnStep should return promises
		var aResultPromises = aAggregationOverlays.map(function(oAggregationOverlay) {
			return fnStep(oAggregationOverlay, sAdditionalStyleClass);
		});
		if (bAsync) {
			return Promise.all(aResultPromises);
		}
	};

	// If the source and target are different, we need to store the parent instance,
	// as templates do not get immediately updated and we search for the moved element there.
	function storeInformationIfNecessary(oMovedOverlay, oSourceParent, oTargetParent) {
		if (oTargetParent.getId() !== oSourceParent.getId()) {
			oMovedOverlay.setOngoingMoveInformation({
				sourceParentInstance: oSourceParent
			});
		}
	}

	/**
	 * Move an element before or after a passed element.
	 * In case of special handling required (e.g. SimpleForm), the methods "beforeMove" and "afterMove"
	 * are called before and after the reposition. They should be implemented on the control design time
	 * metadata for the relevant aggregation.
	 * @param  {sap.ui.dt.Overlay} oMovedOverlay The overlay of the element being moved
	 * @param  {sap.ui.dt.Overlay} oTargetElementOverlay The overlay of the target element for the move
	 * @param  {boolean} bInsertAfterElement Flag defining if the Element should be inserted After the Selection
	 */
	ElementMover.prototype.repositionOn = function(oMovedOverlay, oTargetElementOverlay, bInsertAfterElement) {
		const oTargetParentInformation = OverlayUtil.getParentInformation(oTargetElementOverlay);
		const oParentAggregationOverlay = oMovedOverlay.getParentAggregationOverlay();
		const oParentElementOverlay = oMovedOverlay.getParentElementOverlay();
		let oAggregationDesignTimeMetadata;
		if (oParentAggregationOverlay && oParentElementOverlay) {
			const sAggregationName = oParentAggregationOverlay.getAggregationName();
			oAggregationDesignTimeMetadata = oParentElementOverlay.getDesignTimeMetadata().getAggregation(sAggregationName);
		}

		if (oTargetParentInformation.index !== -1) {
			const oMovedElement = oMovedOverlay.getElement();
			const oSourceParentInformation = OverlayUtil.getParentInformation(oMovedOverlay);
			const oRelevantContainerElement = oMovedOverlay.getRelevantContainer();

			storeInformationIfNecessary(oMovedOverlay, oSourceParentInformation.parent, oTargetParentInformation.parent);

			if (oAggregationDesignTimeMetadata?.beforeMove) {
				oAggregationDesignTimeMetadata.beforeMove(oRelevantContainerElement, oMovedElement);
			}
			if (bInsertAfterElement) {
				oTargetParentInformation.index++;
				if (oSourceParentInformation.aggregation === oTargetParentInformation.aggregation) {
					// index should not be incremented if cut-paste occurs inside the same container,
					// where source index is less than the target index
					oTargetParentInformation.index = ElementUtil.adjustIndexForMove(
						oSourceParentInformation.parent, oTargetParentInformation.parent,
						oSourceParentInformation.index, oTargetParentInformation.index
					);
				}
			}
			ElementUtil.insertAggregation(
				oTargetParentInformation.parent, oTargetParentInformation.aggregation,
				oMovedElement, oTargetParentInformation.index
			);
			if (oAggregationDesignTimeMetadata?.afterMove) {
				oAggregationDesignTimeMetadata.afterMove(oRelevantContainerElement, oMovedElement);
			}
			this._setSourceAndTargetParentInformation(oSourceParentInformation, oTargetParentInformation);
			oMovedOverlay.resetOngoingMoveInformation();
		}
	};

	/**
	 * Insert an element inside another container.
	 * In case of special handling required (e.g. SimpleForm), the methods "beforeMove" and "afterMove"
	 * are called before and after the insertion. They should be implemented on the control design time
	 * metadata for the relevant aggregation.
	 * @param  {sap.ui.dt.Overlay} oMovedOverlay The overlay of the element being moved
	 * @param  {sap.ui.dt.Overlay} oTargetAggregationOverlay The overlay of the target aggregation for the move
	 * @param  {boolean} bInsertAtEnd Flag defining if the Element should be inserted at the End of an Aggregation
	 */
	ElementMover.prototype.insertInto = function(oMovedOverlay, oTargetAggregationOverlay, bInsertAtEnd) {
		const oMovedElement = oMovedOverlay.getElement();
		const oParentAggregationOverlay = oMovedOverlay.getParentAggregationOverlay();
		const oParentElementOverlay = oMovedOverlay.getParentElementOverlay();
		const sTargetAggregationName = oTargetAggregationOverlay.getAggregationName();
		const aTargetAggregationItems = ElementUtil.getAggregation(oTargetAggregationOverlay.getElement(), sTargetAggregationName);

		let oAggregationDesignTimeMetadata;
		if (oParentAggregationOverlay && oParentElementOverlay) {
			const sSourceAggregationName = oParentAggregationOverlay.getAggregationName();
			oAggregationDesignTimeMetadata = oParentElementOverlay.getDesignTimeMetadata().getAggregation(sSourceAggregationName);
		}

		const iInsertIndex = bInsertAtEnd ? aTargetAggregationItems.length : 0;
		const iCurrentIndex = aTargetAggregationItems.indexOf(oMovedElement);
		// check if element already on desired position
		// for checking last position, we have to reduce the iInsertIndex by one
		if (!(iCurrentIndex > -1 && iCurrentIndex === (iInsertIndex === 0 ? iInsertIndex : iInsertIndex - 1))) {
			const oTargetParentElement = oTargetAggregationOverlay.getElement();
			const oTargetParentInformation = {
				parent: oTargetParentElement,
				aggregation: sTargetAggregationName,
				index: iInsertIndex
			};
			const oSourceParentInformation = OverlayUtil.getParentInformation(oMovedOverlay);

			storeInformationIfNecessary(oMovedOverlay, oSourceParentInformation.parent, oTargetParentInformation.parent);

			const oRelevantContainerElement = oMovedOverlay.getRelevantContainer();
			if (oAggregationDesignTimeMetadata && oAggregationDesignTimeMetadata.beforeMove) {
				oAggregationDesignTimeMetadata.beforeMove(oRelevantContainerElement, oMovedElement);
			}
			ElementUtil.insertAggregation(oTargetParentElement, sTargetAggregationName, oMovedElement, iInsertIndex);
			if (oAggregationDesignTimeMetadata && oAggregationDesignTimeMetadata.afterMove) {
				oAggregationDesignTimeMetadata.afterMove(oRelevantContainerElement, oMovedElement);
			}
			this._setSourceAndTargetParentInformation(oSourceParentInformation, oTargetParentInformation);
			oMovedOverlay.resetOngoingMoveInformation();
		}
	};

	ElementMover.prototype._compareSourceAndTarget = function(oSource, oTarget) {
		var vProperty;
		for (vProperty in oSource) {
			switch (typeof (oSource[vProperty])) {
				case "object":
					if (oSource[vProperty].getId() !== oTarget[vProperty].getId()) {return false;}
					break;
				default:
					if (oSource[vProperty] !== oTarget[vProperty]) {return false;}
			}
		}

		return true;
	};

	ElementMover.prototype._setSourceAndTargetParentInformation = function(oSourceParentInformation, oTargetParentInformation) {
		var oMovedOverlay = this.getMovedOverlay();
		if (!oMovedOverlay || !oSourceParentInformation || !oTargetParentInformation) {
			delete this._mSourceParentInformation;
			delete this._mTargetParentInformation;
			return;
		}
		this._mSourceParentInformation = {};
		Object.assign(this._mSourceParentInformation, oSourceParentInformation);
		this._mTargetParentInformation = oTargetParentInformation;
	};

	/**
	 * Returns a structure with objects containing information about the source and target
	 * parents of the move. The structure contains the parent element, the aggregation name
	 * and the index.
	 * @returns {object} Object containing the move source and target parent information
	 */
	ElementMover.prototype.getSourceAndTargetParentInformation = function() {
		return {
			sourceParentInformation: this._mSourceParentInformation,
			targetParentInformation: this._mTargetParentInformation
		};
	};

	return ElementMover;
});