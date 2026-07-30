/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/util/values",
	"sap/base/util/restricted/_omit",
	"sap/base/Log",
	"sap/ui/base/ManagedObject",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/dt/ElementUtil",
	"sap/ui/fl/write/api/ChangesWriteAPI",
	"sap/ui/fl/Utils",
	"sap/ui/fl/changeHandler/common/ChangeCategories",
	"sap/ui/rta/util/changeVisualization/ChangeStates"
], function(
	values,
	_omit,
	Log,
	ManagedObject,
	JsControlTreeModifier,
	ElementUtil,
	ChangesWriteAPI,
	FlUtils,
	ChangeCategories,
	ChangeStates
) {
	"use strict";

	/**
	 * @class
	 * Registry for <code>sap.ui.rta.util.changeVisualization.ChangeIndicator</code> instances.
	 *
	 * @extends sap.ui.base.ManagedObject
	 * @alias sap.ui.rta.util.changeVisualization.ChangeIndicatorRegistry
	 * @author SAP SE
	 * @since 1.86.0
	 * @version ${version}
	 * @private
	 */
	const ChangeIndicatorRegistry = ManagedObject.extend("sap.ui.rta.util.changeVisualization.ChangeIndicatorRegistry", {
		metadata: {
			properties: {
				/**
				 * Available command categories
				 */
				changeCategories: {
					type: "object",
					defaultValue: []
				},
				/**
				 * Id of the component or control to visualize the changes for
				 */
				 rootControlId: {
					type: "string"
				}
			}
		},
		constructor: function(...aArgs) {
			ManagedObject.prototype.constructor.apply(this, aArgs);

			// List of entries with indicator data, grouped by Change ID
			this._oRegisteredChanges = {};
		}
	});

	ChangeIndicatorRegistry.prototype.exit = function() {
		this.reset();
	};

	/**
	 * Returns the change indicator data for all registered changes.
	 *
	 * @returns {object[]} Change indicator data for all registered changes
	 */
	ChangeIndicatorRegistry.prototype.getAllRegisteredChanges = function() {
		return values(this._oRegisteredChanges || {}).map(function(oChange) {
			return { ...oChange };
		});
	};

	/**
	 * Returns the IDs of all registered changes.
	 *
	 * @returns {string[]} Array with both design time and runtime registered changes
	 */
	ChangeIndicatorRegistry.prototype.getRegisteredChangeIds = function() {
		return Object.keys(this._oRegisteredChanges || {});
	};

	/**
	 * Returns a data entry of a registered change indicator for a change ID.
	 *
	 * @param {string} sChangeId - ID of the registered change
	 * @returns {object} Registered change
	 */
	ChangeIndicatorRegistry.prototype.getRegisteredChange = function(sChangeId) {
		return this._oRegisteredChanges[sChangeId] && { ...this._oRegisteredChanges[sChangeId] };
	};

	/**
	 * Groups all registered changes by their selectors and returns a list of selectors
	 * with all dependent and non-dependent change indicator data.
	 *
	 * @returns {object} List of selectors with change indicator data.
	 */
	ChangeIndicatorRegistry.prototype.getSelectorsWithRegisteredChanges = function() {
		const oChangeIndicators = {};
		let sPreviousAffectedElementId;

		function addSelector(sSelectorId, sAffectedElementId, oChangeIndicatorData, bDependent) {
			if (oChangeIndicators[sSelectorId] === undefined) {
				oChangeIndicators[sSelectorId] = [];
			}
			oChangeIndicators[sSelectorId].push({
				id: oChangeIndicatorData.change.getId(),
				dependent: bDependent,
				affectedElementId: sAffectedElementId || sPreviousAffectedElementId,
				displayElementsKey: oChangeIndicatorData.visualizationInfo.displayElementIds.toString(),
				descriptionPayload: oChangeIndicatorData.visualizationInfo.descriptionPayload || {},
				..._omit(oChangeIndicatorData, ["visualizationInfo"])
			});
			sPreviousAffectedElementId = sAffectedElementId || sPreviousAffectedElementId;
		}

		values(this._oRegisteredChanges)
		.forEach(function(oChangeIndicatorData) {
			oChangeIndicatorData.visualizationInfo.displayElementIds
			.forEach(function(sId, iIndex) {
				addSelector(sId, oChangeIndicatorData.visualizationInfo.affectedElementIds[iIndex], oChangeIndicatorData, false);
			});
		});

		return oChangeIndicators;
	};

	/**
	 * Indicates whether the registry currently holds at least one activated change that is actually
	 * visualizable. A change is visualizable when its visualizationInfo resolves to at least one
	 * affected or display element.
	 *
	 * Changes are ignored here when they are still draft or dirty, when their handler has no
	 * getChangeVisualizationInfo, or when their selectors do not resolve in the current control tree.
	 *
	 * @returns {boolean} true if at least one activated, visualizable change is registered
	 */
	ChangeIndicatorRegistry.prototype.hasPersistedChanges = function() {
		return this.getAllRegisteredChanges().some(function(oEntry) {
			if (!Array.isArray(oEntry.changeStates) || !oEntry.changeStates.includes(ChangeStates.ALL)) {
				return false;
			}
			const oChange = oEntry.change;
			if (oChange.isSuccessfullyApplied) {
				return oChange.isSuccessfullyApplied();
			}
			return false;
		});
	};

	/**
	 * Checks whether the given element appears as either a display target or an affected element
	 * for any registered change. An optional <code>fnFilter</code> predicate can be passed to scope
	 * the considered changes (e.g. by state).
	 *
	 * @param {string} sElementId - ID of the UI element
	 * @param {function(object):boolean} [fnFilter] - Optional predicate; only entries for which it
	 *   returns <code>true</code> are considered
	 * @returns {boolean} true if at least one matching change references the element
	 */
	ChangeIndicatorRegistry.prototype.hasChangesForElement = function(sElementId, fnFilter) {
		return this.getAllRegisteredChanges().some(function(oEntry) {
			if (fnFilter && !fnFilter(oEntry)) {
				return false;
			}
			return oEntry.visualizationInfo.displayElementIds.includes(sElementId)
				|| oEntry.visualizationInfo.affectedElementIds.includes(sElementId);
		});
	};

	/**
	 * Returns the flat change-info entries for the given element, deduped by change id. Combines
	 * matches by displayElementIds (the primary path used for the dashed-border decoration) and
	 * matches by affectedElementIds (so changes that only carry affected info still surface in the
	 * detail popup). An optional <code>fnFilter</code> predicate scopes the considered changes.
	 *
	 * @param {string} sElementId - ID of the UI element
	 * @param {function(object):boolean} [fnFilter] - Optional predicate; only entries for which it
	 *   returns <code>true</code> are considered
	 * @returns {object[]} Flat change-info entries (same shape as the values of
	 *   <code>getSelectorsWithRegisteredChanges</code>)
	 */
	ChangeIndicatorRegistry.prototype.getChangeInfosForElement = function(sElementId, fnFilter) {
		const oSelectors = this.getSelectorsWithRegisteredChanges();
		const oChangeInfosById = new Map();

		// Path A: direct lookup by displayElementId
		(oSelectors[sElementId] || []).forEach(function(oChangeInfo) {
			if (!oChangeInfo.dependent && (!fnFilter || fnFilter(oChangeInfo))) {
				oChangeInfosById.set(oChangeInfo.id, oChangeInfo);
			}
		});

		// Path B: catch changes that reference this element only as an affected element.
		// In the common case displayElementIds === affectedElementIds, so we'd produce duplicates of
		// Path A here — the Map dedupes them by change id.
		this.getAllRegisteredChanges().forEach(function(oEntry) {
			const sChangeId = oEntry.change.getId();
			if (oChangeInfosById.has(sChangeId) || (fnFilter && !fnFilter(oEntry))) {
				return;
			}
			if (
				oEntry.visualizationInfo.affectedElementIds.includes(sElementId)
				|| oEntry.visualizationInfo.displayElementIds.includes(sElementId)
			) {
				// Build a flat change info similar to what getSelectorsWithRegisteredChanges returns
				oChangeInfosById.set(sChangeId, {
					id: sChangeId,
					dependent: false,
					affectedElementId: oEntry.visualizationInfo.affectedElementIds[0],
					descriptionPayload: oEntry.visualizationInfo.descriptionPayload || {},
					change: oEntry.change,
					commandName: oEntry.commandName,
					changeCategory: oEntry.changeCategory,
					changeStates: oEntry.changeStates
				});
			}
		});

		return [...oChangeInfosById.values()];
	};

	/**
	 * Registers a change under its ID.
	 *
	 * @param {object} oChange - The change to register
	 * @param {string} sCommandName - Command name of the change
	 * @param {string} oVersionsModel - Model with versioning data
	 * @returns {Promise<undefined>} Resolves as soon as the change is registered
	 */
	ChangeIndicatorRegistry.prototype.registerChange = function(oChange, sCommandName, oVersionsModel) {
		const oAppComponent = FlUtils.getAppComponentForControl(ElementUtil.getElementInstance(this.getRootControlId()));
		return getVisualizationInfo(oChange, oAppComponent).then(function(mChangeVisualizationInfo) {
			const aCategories = this.getChangeCategories();
			let sChangeCategory;
			// For "settings", the control developer can choose one of the existing categories
			if (sCommandName === "settings" && Object.keys(aCategories).includes(mChangeVisualizationInfo.descriptionPayload.category)) {
				sChangeCategory = mChangeVisualizationInfo.descriptionPayload.category;
			} else {
				sChangeCategory = Object.keys(aCategories).find(function(sChangeCategoryName) {
					return aCategories[sChangeCategoryName].includes(sCommandName);
				});
				sChangeCategory ||= ChangeCategories.OTHER;
			}
			let aChangeStates;
			let aDraftChangesList = [];
			if (oVersionsModel) {
				aDraftChangesList = oVersionsModel.getData().draftFilenames;
			}

			if (oChange.getState() === "NEW") {
				aChangeStates = ChangeStates.getDraftAndDirtyStates();
			} else if (aDraftChangesList && aDraftChangesList.includes(oChange.getId())) {
				aChangeStates = [ChangeStates.DRAFT];
			} else {
				aChangeStates = [ChangeStates.ALL];
			}

			this._oRegisteredChanges[oChange.getId()] = {
				change: oChange,
				commandName: sCommandName,
				changeCategory: sChangeCategory,
				changeStates: aChangeStates,
				visualizationInfo: mChangeVisualizationInfo
			};
		}.bind(this));
	};

	function getVisualizationInfo(oChange, oAppComponent) {
		function getSelectorIds(aSelectorList) {
			if (!aSelectorList) {
				return undefined;
			}
			return aSelectorList
			.map(function(vSelector) {
				const oElement = typeof vSelector.getId === "function"
					? vSelector
					: JsControlTreeModifier.bySelector(vSelector, oAppComponent);
				return oElement && oElement.getId();
			})
			.filter(Boolean);
		}

		return getInfoFromChangeHandler(oAppComponent, oChange)
		.then(function(oInfoFromChangeHandler) {
			const mVisualizationInfo = oInfoFromChangeHandler || {};
			const aChangeSelectors = oChange.getSelector && oChange.getSelector() && [oChange.getSelector()];
			const aAffectedElementSelectors = mVisualizationInfo.affectedControls || aChangeSelectors || [];
			// If there is an original selector (e.g. control is inside a template),
			// the indicator should be displayed on the host control (change selector)
			const oChangeOriginalSelector = oChange.getOriginalSelector && oChange.getOriginalSelector();
			const aDisplayElementSelectors = oChangeOriginalSelector ? aChangeSelectors : aAffectedElementSelectors;

			// When the change handler did not provide visualization info, mark as updateRequired
			// so the next refreshBorders flushes and retries - UNLESS the handler explicitly
			// has no getChangeVisualizationInfo function (sentinel value), in which case retrying won't help.
			let bUpdateRequired;
			if (oInfoFromChangeHandler && !oInfoFromChangeHandler.noVisualizationInfo) {
				// Handler provided info - use its updateRequired flag
				bUpdateRequired = !!mVisualizationInfo.updateRequired;
			} else if (oInfoFromChangeHandler && oInfoFromChangeHandler.noVisualizationInfo) {
				// Handler found but has no getChangeVisualizationInfo - don't retry
				bUpdateRequired = false;
			} else {
				// Control not in tree yet - worth retrying
				bUpdateRequired = true;
			}

			return {
				affectedElementIds: getSelectorIds(aAffectedElementSelectors),
				dependentElementIds: getSelectorIds(mVisualizationInfo.dependentControls) || [],
				displayElementIds: getSelectorIds(mVisualizationInfo.displayControls || getSelectorIds(aDisplayElementSelectors)),
				updateRequired: bUpdateRequired,
				descriptionPayload: mVisualizationInfo.descriptionPayload || {}
			};
		});
	}

	function getInfoFromChangeHandler(oAppComponent, oChange) {
		let oSelector = oChange.getOriginalSelector && oChange.getOriginalSelector();
		oSelector ||= oChange.getSelector && oChange.getSelector();
		const oControl = JsControlTreeModifier.bySelector(oSelector, oAppComponent);
		if (oControl) {
			return ChangesWriteAPI.getChangeHandler({
				changeType: oChange.getChangeType(),
				element: oControl,
				modifier: JsControlTreeModifier,
				layer: oChange.getLayer()
			})
			.then(function(oChangeHandler) {
				if (
					oChangeHandler && typeof oChangeHandler.getChangeVisualizationInfo === "function"
						&& oChange.isSuccessfullyApplied && oChange.isSuccessfullyApplied()
				) {
					return oChangeHandler.getChangeVisualizationInfo(oChange, oAppComponent);
				}
				// Return a sentinel to indicate handler was found but has no getChangeVisualizationInfo
				return { noVisualizationInfo: true };
			})
			.catch(function(vErr) {
				Log.error(vErr);
				return undefined;
			});
		}

		return Promise.resolve();
	}

	/**
	 * Resets the change registry.
	 */
	ChangeIndicatorRegistry.prototype.reset = function() {
		Object.keys(this._oRegisteredChanges).forEach(function(sKeyToRemove) {
			this.removeRegisteredChange(sKeyToRemove);
		}.bind(this));
	};

	/**
	 * Removes a data entry of a registered change indicator.
	 *
	 * @param {string} sChangeId - ID of the registered change
	 */
	ChangeIndicatorRegistry.prototype.removeRegisteredChange = function(sChangeId) {
		delete this._oRegisteredChanges[sChangeId];
	};

	/**
	 * Removes changes with the updateRequired flag from the registry so the change can be re-registered and
	 * the visualizationInfo is updated => if an element has an unstable id this updates the id information
	 * in the registry (e.g simple forms)
	 */
	ChangeIndicatorRegistry.prototype.removeOutdatedRegisteredChanges = function() {
		this.getAllRegisteredChanges().forEach(function(oChange) {
			if (oChange.visualizationInfo && oChange.visualizationInfo.updateRequired) {
				this.removeRegisteredChange(oChange.change.getId());
			}
		}.bind(this));
	};

	/**
	 * Removes changes without any displayElementIds from the registry so the change can be re-registered and
	 * the visualizationInfo is updated => if an element is inside a dialog which hasn't been opened yet
	 */
	ChangeIndicatorRegistry.prototype.removeRegisteredChangesWithoutVizInfo = function() {
		this.getAllRegisteredChanges().forEach(function(oChange) {
			if (oChange.visualizationInfo && oChange.visualizationInfo.displayElementIds.length === 0) {
				this.removeRegisteredChange(oChange.change.getId());
			}
		}.bind(this));
	};

	return ChangeIndicatorRegistry;
});