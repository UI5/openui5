/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/util/restricted/_omit",
	"sap/base/Log",
	"sap/ui/base/ManagedObject",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/fl/write/api/ChangesWriteAPI",
	"sap/ui/fl/changeHandler/common/ChangeCategories",
	"sap/ui/rta/util/changeVisualization/ChangeStates"
], function(
	_omit,
	Log,
	ManagedObject,
	JsControlTreeModifier,
	ChangesWriteAPI,
	ChangeCategories,
	ChangeStates
) {
	"use strict";

	/**
	 * @class
	 * Registry for <code>sap.ui.rta.util.changeVisualization.ChangeIndicator</code> instances.
	 *
	 * Two-layer design:
	 *   _oChangeCatalog    — change metadata that requires no live DOM (populated synchronously)
	 *   _oResolutionCache  — per-change visualization info resolved against live controls (populated lazily)
	 *
	 * A change is "registered" (visible to consumers) only when both layers have an entry for it.
	 * When a control is not yet in the DOM its entry sits in the catalog but not in the resolution
	 * cache; as soon as the corresponding overlay is created ChangeVisualization triggers
	 * resolveVisualizationInfo() and the entry becomes visible.
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

			// Layer 1: change metadata, populated synchronously without DOM access.
			// Map<changeId, { change, commandName, changeCategory, changeStates }>
			this._oChangeCatalog = {};

			// Layer 2: resolved visualization info, populated lazily when controls are available.
			// Map<changeId, vizInfo>  where vizInfo = { affectedElementIds, displayElementIds,
			//                                          dependentElementIds, descriptionPayload, updateRequired }
			this._oResolutionCache = {};

			// Reverse index: elementId (from selector.id) → Set<changeId>
			// Built synchronously during addChangeToCatalog so that _onElementOverlayCreated
			// can look up pending changes in O(1) without scanning the whole catalog.
			this._oSelectorIndex = {};

			// Forward index: changeId → Set<elementId> — the element ids a change was indexed under
			// in _oSelectorIndex. Lets removeRegisteredChange clean up in O(k) without scanning
			// every entry. Kept in sync by _addToSelectorIndex.
			this._oSelectorIndexByChange = {};

			// Reverse index: elementId → Set<changeId> for both display and affected element ids.
			// Maintained by resolveVisualizationInfo / invalidateResolution so that
			// hasChangesForElement is O(k) where k is the number of changes on that element.
			this._oElementIndex = {};
		}
	});

	ChangeIndicatorRegistry.prototype.exit = function() {
		this.reset();
	};

	function deriveChangeStates(oChange, oVersionsModel) {
		let aDraftChangesList = [];
		if (oVersionsModel) {
			aDraftChangesList = oVersionsModel.getData().draftFilenames;
		}
		if (oChange.getState() === "NEW") {
			return ChangeStates.getDraftAndDirtyStates();
		} else if (aDraftChangesList?.includes(oChange.getId())) {
			return [ChangeStates.DRAFT];
		}
		return [ChangeStates.ALL];
	}

	/**
	 * Adds a change to the catalog layer (Layer 1) without resolving visualization info.
	 * Safe to call before overlays exist.
	 *
	 * @param {sap.ui.fl.apply._internal.flexObjects.UIChange} oChange - The FL UIChange
	 * @param {string} sCommandName - RTA command name derived from the change's support info
	 * @param {object} oVersionsModel - Versions model instance (may be undefined)
	 */
	ChangeIndicatorRegistry.prototype.addChangeToCatalog = function(oChange, sCommandName, oVersionsModel) {
		const aCategories = this.getChangeCategories();
		let sChangeCategory = Object.keys(aCategories).find((sChangeCategoryName) => {
			return aCategories[sChangeCategoryName].includes(sCommandName);
		});
		sChangeCategory ||= ChangeCategories.OTHER;

		this._oChangeCatalog[oChange.getId()] = {
			change: oChange,
			commandName: sCommandName,
			changeCategory: sChangeCategory,
			changeStates: deriveChangeStates(oChange, oVersionsModel)
		};

		// Update reverse selector index so _onElementOverlayCreated can find this change by element ID.
		const oSelector = oChange.getOriginalSelector?.() || oChange.getSelector?.();
		if (oSelector?.id) {
			this._addToSelectorIndex(oSelector.id, oChange.getId());
		}
	};

	/**
	 * Adds a change id to the reverse selector index Set for an element id. Shared by catalog
	 * registration and the provisional-resolution path so both index changes the same way.
	 *
	 * @param {string} sElementId - The element ID to index under
	 * @param {string} sChangeId - The change ID to add
	 */
	ChangeIndicatorRegistry.prototype._addToSelectorIndex = function(sElementId, sChangeId) {
		this._oSelectorIndex[sElementId] ||= new Set();
		this._oSelectorIndex[sElementId].add(sChangeId);
		this._oSelectorIndexByChange[sChangeId] ||= new Set();
		this._oSelectorIndexByChange[sChangeId].add(sElementId);
	};

	/**
	 * Re-classifies the changeStates of every catalog entry against the current versioning
	 * model. Must be called after a version is activated (DRAFT → ALL) or discarded.
	 *
	 * @param {object} oVersionsModel - The current versions model instance
	 */
	ChangeIndicatorRegistry.prototype.refreshChangeStates = function(oVersionsModel) {
		Object.keys(this._oChangeCatalog).forEach((sId) => {
			this._oChangeCatalog[sId].changeStates = deriveChangeStates(this._oChangeCatalog[sId].change, oVersionsModel);
		});
	};

	/**
	 * Returns all change IDs that are in the catalog but not yet resolved (no entry in the resolution cache,
	 * or the entry was invalidated via invalidateResolution).
	 *
	 * @returns {string[]} Array of unresolved change IDs
	 */
	ChangeIndicatorRegistry.prototype.getUnresolvedChangeIds = function() {
		return Object.keys(this._oChangeCatalog).filter((sId) => !this._oResolutionCache[sId]);
	};

	/**
	 * Returns the catalog entry for a change (Layer 1 data only, without resolved viz info).
	 *
	 * @param {string} sChangeId - The change ID
	 * @returns {object|undefined} Catalog entry or undefined
	 */
	ChangeIndicatorRegistry.prototype.getCatalogEntry = function(sChangeId) {
		const oEntry = this._oChangeCatalog[sChangeId];
		return oEntry ? { ...oEntry } : undefined;
	};

	/**
	 * Returns all change IDs present in the catalog (resolved and unresolved).
	 *
	 * @returns {string[]} All catalogued change IDs
	 */
	ChangeIndicatorRegistry.prototype.getCatalogIds = function() {
		return Object.keys(this._oChangeCatalog);
	};

	/**
	 * Returns the change IDs from the catalog that target the given element ID (via the selector reverse index).
	 * This includes both resolved and unresolved changes.
	 *
	 * @param {string} sElementId - The element ID to look up
	 * @returns {string[]} Change IDs that reference this element
	 */
	ChangeIndicatorRegistry.prototype.getChangeIdsForSelector = function(sElementId) {
		const oIds = this._oSelectorIndex[sElementId];
		return oIds ? [...oIds] : [];
	};

	/**
	 * Resolves visualization info for a single change and stores it in the resolution cache.
	 * Should be called when the control referenced by the change becomes available.
	 *
	 * @param {sap.ui.fl.apply._internal.flexObjects.UIChange} oChange - The FL UIChange to resolve
	 * @param {sap.ui.core.Component} oAppComponent - The app component for selector resolution
	 * @returns {Promise<object|undefined>} Resolves to the vizInfo object, or undefined when
	 *   the control is still unavailable
	 */
	ChangeIndicatorRegistry.prototype.resolveVisualizationInfo = async function(oChange, oAppComponent) {
		const sChangeId = oChange.getId();
		const oCatalogEntry = this._oChangeCatalog[sChangeId];
		if (!oCatalogEntry) {
			return undefined;
		}

		const sCommandName = oCatalogEntry.commandName;

		const mChangeVisualizationInfo = await getVisualizationInfo(oChange, oAppComponent);
		if (
			!mChangeVisualizationInfo
			|| mChangeVisualizationInfo.displayElementIds.length === 0
			|| mChangeVisualizationInfo.provisional
		) {
			// Not resolvable to a final target yet: the control is absent (empty displayElementIds)
			// or the change is not applied yet (provisional). Leave the cache empty and index the
			// change under its intended target ids so _onElementOverlayCreated re-resolves it once
			// that control's overlay appears — otherwise a lazily-rendered add-field change would be
			// cached against its container and never corrected.
			(mChangeVisualizationInfo?.localIdsOfMissingControls || []).forEach((sId) => {
				this._addToSelectorIndex(sId, sChangeId);
			});
			return undefined;
		}

		// For "settings" we need the handler's descriptionPayload to determine the category,
		// so we re-derive the category after resolution if the command is "settings".
		if (sCommandName === "settings") {
			const aCategories = this.getChangeCategories();
			const sHandlerCategory = mChangeVisualizationInfo.descriptionPayload?.category;
			if (sHandlerCategory && Object.keys(aCategories).includes(sHandlerCategory)) {
				oCatalogEntry.changeCategory = sHandlerCategory;
			}
		}

		this._oResolutionCache[sChangeId] = mChangeVisualizationInfo;

		// Update the element reverse index (display + affected ids) so hasChangesForElement is O(k).
		const aIndexedIds = [
			...mChangeVisualizationInfo.displayElementIds,
			...mChangeVisualizationInfo.affectedElementIds
		];
		new Set(aIndexedIds).forEach((sId) => {
			this._oElementIndex[sId] ||= new Set();
			this._oElementIndex[sId].add(sChangeId);
		});

		return mChangeVisualizationInfo;
	};

	/**
	 * Removes the resolution cache entry for a change, forcing it to be re-resolved on the next
	 * overlay creation or refreshBorders call. Use for changes with updateRequired=true.
	 *
	 * @param {string} sChangeId - The change ID to invalidate
	 */
	ChangeIndicatorRegistry.prototype.invalidateResolution = function(sChangeId) {
		const oVizInfo = this._oResolutionCache[sChangeId];
		if (oVizInfo) {
			const aIndexedIds = [...oVizInfo.displayElementIds, ...oVizInfo.affectedElementIds];
			new Set(aIndexedIds).forEach((sId) => {
				const oSet = this._oElementIndex[sId];
				if (oSet) {
					oSet.delete(sChangeId);
					if (oSet.size === 0) {
						delete this._oElementIndex[sId];
					}
				}
			});
		}
		delete this._oResolutionCache[sChangeId];
	};

	/**
	 * Returns the IDs of all registered changes (catalog a∩d resolution cache).
	 *
	 * @returns {string[]} Array of resolved change IDs
	 */
	ChangeIndicatorRegistry.prototype.getRegisteredChangeIds = function() {
		return Object.keys(this._oChangeCatalog).filter((sId) => !!this._oResolutionCache[sId]);
	};

	/**
	 * Returns the change indicator data for all registered (resolved) changes.
	 *
	 * @returns {object[]} Change indicator data for all registered changes
	 */
	ChangeIndicatorRegistry.prototype.getAllRegisteredChanges = function() {
		return this.getRegisteredChangeIds().map((sId) => {
			return {
				...this._oChangeCatalog[sId],
				visualizationInfo: { ...this._oResolutionCache[sId] }
			};
		});
	};

	/**
	 * Returns a data entry of a registered change indicator for a change ID.
	 *
	 * @param {string} sChangeId - ID of the registered change
	 * @returns {object|undefined} Registered change or undefined
	 */
	ChangeIndicatorRegistry.prototype.getRegisteredChange = function(sChangeId) {
		if (!this._oChangeCatalog[sChangeId] || !this._oResolutionCache[sChangeId]) {
			return undefined;
		}
		return {
			...this._oChangeCatalog[sChangeId],
			visualizationInfo: { ...this._oResolutionCache[sChangeId] }
		};
	};

	/**
	 * Groups all registered changes by their selectors and returns a list of selectors
	 * with all dependent and non-dependent change indicator data.
	 *
	 * @returns {object} List of selectors with change indicator data.
	 */
	ChangeIndicatorRegistry.prototype.getSelectorsWithRegisteredChanges = function() {
		const oChangeIndicators = {};

		this.getAllRegisteredChanges().forEach((oChangeIndicatorData) => {
			const aDisplayIds = oChangeIndicatorData.visualizationInfo.displayElementIds;
			const aAffectedIds = oChangeIndicatorData.visualizationInfo.affectedElementIds;
			aDisplayIds.forEach((sId, iIndex) => {
				// Fallback is scoped to this change only — the affected id at the same index,
				// or the first affected id when the arrays lengths differ.
				const sAffectedElementId = aAffectedIds[iIndex] || aAffectedIds[0];
				oChangeIndicators[sId] ||= [];
				oChangeIndicators[sId].push({
					id: oChangeIndicatorData.change.getId(),
					dependent: false,
					affectedElementId: sAffectedElementId,
					displayElementsKey: aDisplayIds.toString(),
					descriptionPayload: oChangeIndicatorData.visualizationInfo.descriptionPayload || {},
					..._omit(oChangeIndicatorData, ["visualizationInfo"])
				});
			});
		});

		return oChangeIndicators;
	};

	/**
	 * Indicates whether the catalog (Layer 1) holds at least one activated change (ChangeStates.ALL)
	 * whose application has not failed. Reads the catalog rather than the resolution cache so the
	 * result is available before the target controls have produced overlays.
	 *
	 * @returns {boolean} true if at least one activated, non-failed change is catalogued
	 */
	ChangeIndicatorRegistry.prototype.hasPersistedChanges = function() {
		return Object.values(this._oChangeCatalog).some((oEntry) => {
			return Array.isArray(oEntry.changeStates)
				&& oEntry.changeStates.includes(ChangeStates.ALL)
				&& !oEntry.change.hasApplyProcessFailed?.();
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
		const oIds = this._oElementIndex[sElementId];
		if (!oIds) {
			return false;
		}
		return [...oIds].some((sId) => {
			if (!this._oChangeCatalog[sId]) {
				return false;
			}
			return !fnFilter || fnFilter(this._oChangeCatalog[sId]);
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
		const oChangeInfosById = new Map();

		this.getAllRegisteredChanges().forEach((oEntry) => {
			const sChangeId = oEntry.change.getId();
			if (fnFilter && !fnFilter(oEntry)) {
				return;
			}
			const aDisplayIds = oEntry.visualizationInfo.displayElementIds;
			const aAffectedIds = oEntry.visualizationInfo.affectedElementIds;
			if (!aDisplayIds.includes(sElementId) && !aAffectedIds.includes(sElementId)) {
				return;
			}
			if (!oChangeInfosById.has(sChangeId)) {
				oChangeInfosById.set(sChangeId, {
					id: sChangeId,
					dependent: false,
					affectedElementId: aAffectedIds[0],
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
	 * Resets the change registry (both catalog and resolution cache).
	 */
	ChangeIndicatorRegistry.prototype.reset = function() {
		this._oChangeCatalog = {};
		this._oResolutionCache = {};
		this._oSelectorIndex = {};
		this._oSelectorIndexByChange = {};
		this._oElementIndex = {};
	};

	/**
	 * Removes a data entry of a registered change indicator.
	 *
	 * @param {string} sChangeId - ID of the registered change
	 */
	ChangeIndicatorRegistry.prototype.removeRegisteredChange = function(sChangeId) {
		const oCatalogEntry = this._oChangeCatalog[sChangeId];
		if (oCatalogEntry) {
			// Clean up display-element reverse index (must happen before the cache entry is deleted).
			this.invalidateResolution(sChangeId);
			// A change may be indexed under its own selector and its intended display ids. The forward
			// index tells us exactly which entries to touch, so we clean up in O(k) rather than
			// scanning every entry.
			(this._oSelectorIndexByChange[sChangeId] || new Set()).forEach((sElementId) => {
				const oSet = this._oSelectorIndex[sElementId];
				if (oSet) {
					oSet.delete(sChangeId);
					if (oSet.size === 0) {
						delete this._oSelectorIndex[sElementId];
					}
				}
			});
			delete this._oSelectorIndexByChange[sChangeId];
		}
		delete this._oChangeCatalog[sChangeId];
	};

	/**
	 * Invalidates resolution cache entries whose display target can shift after other changes are
	 * applied (e.g. HideControl must re-find the first visible ancestor). They will be re-resolved
	 * on the next overlay creation or refreshBorders call.
	 */
	ChangeIndicatorRegistry.prototype.invalidateOutdatedResolutions = function() {
		Object.keys(this._oResolutionCache).forEach((sId) => {
			if (this._oResolutionCache[sId].updateRequired) {
				this.invalidateResolution(sId);
			}
		});
	};

	async function getVisualizationInfo(oChange, oAppComponent) {
		function getSelectorIds(aSelectorList) {
			if (!aSelectorList) {
				return [];
			}
			return aSelectorList
			.map((vSelector) => {
				const oElement = typeof vSelector.getId === "function"
					? vSelector
					: JsControlTreeModifier.bySelector(vSelector, oAppComponent);
				return oElement?.getId();
			})
			.filter(Boolean);
		}

		// Local ids of the change's intended display targets, resolved from the selectors without a
		// live-tree lookup so they are available even for controls not yet in the tree. Uses the
		// stable local id (a selector's .id, or a plain id string) to match the key
		// _onElementOverlayCreated looks up by — not the global control id from getId().
		function getLocalIdsOfMissingControls(aSelectorList) {
			if (!aSelectorList) {
				return [];
			}
			return aSelectorList
			.map((vSelector) => (typeof vSelector === "string" ? vSelector : vSelector?.id))
			.filter(Boolean);
		}

		const oInfoFromChangeHandler = await getInfoFromChangeHandler(oAppComponent, oChange);
		const mVisualizationInfo = oInfoFromChangeHandler || {};
		const aChangeSelectors = oChange.getSelector?.() && [oChange.getSelector()];
		const aAffectedElementSelectors = mVisualizationInfo.affectedControls || aChangeSelectors || [];
		const oChangeOriginalSelector = oChange.getOriginalSelector?.();
		const aDisplayElementSelectors = oChangeOriginalSelector ? aChangeSelectors : aAffectedElementSelectors;
		const aIntendedDisplaySelectors = mVisualizationInfo.displayControls || aDisplayElementSelectors;

		const bProvisional = !!mVisualizationInfo.notApplied;

		// updateRequired: true means the display target can shift after other changes are applied
		// (e.g. HideControl must find the first visible ancestor). Cache is invalidated via
		// removeOutdatedRegisteredChanges before every refreshBorders call.
		const bUpdateRequired = (oInfoFromChangeHandler && !oInfoFromChangeHandler.noVisualizationInfo)
			? !!mVisualizationInfo.updateRequired
			: false;

		return {
			affectedElementIds: getSelectorIds(aAffectedElementSelectors),
			dependentElementIds: getSelectorIds(mVisualizationInfo.dependentControls),
			// Prefer the handler's explicit displayControls; otherwise fall back to the default
			// display selectors. Resolve each list once — do NOT re-feed resolved ids through
			// getSelectorIds, which would treat plain id strings as selectors and misresolve them.
			displayElementIds: getSelectorIds(aIntendedDisplaySelectors),
			// Local ids of the change's intended display targets, resolvable even for controls not yet
			// in the tree, so a change can be indexed and re-resolved once its (e.g. not-yet-rendered)
			// target control's overlay is created.
			localIdsOfMissingControls: getLocalIdsOfMissingControls(aIntendedDisplaySelectors),
			provisional: bProvisional,
			updateRequired: bUpdateRequired,
			descriptionPayload: mVisualizationInfo.descriptionPayload || {}
		};
	}

	async function getInfoFromChangeHandler(oAppComponent, oChange) {
		let oSelector = oChange.getOriginalSelector?.();
		oSelector ||= oChange.getSelector?.();
		const oControl = JsControlTreeModifier.bySelector(oSelector, oAppComponent);
		if (!oControl) {
			return undefined;
		}
		try {
			const oChangeHandler = await ChangesWriteAPI.getChangeHandler({
				changeType: oChange.getChangeType(),
				element: oControl,
				modifier: JsControlTreeModifier,
				layer: oChange.getLayer()
			});
			if (typeof oChangeHandler?.getChangeVisualizationInfo === "function") {
				if (oChange.isSuccessfullyApplied?.()) {
					return oChangeHandler.getChangeVisualizationInfo(oChange, oAppComponent);
				}
				return { notApplied: true };
			}
			return { noVisualizationInfo: true };
		} catch (vErr) {
			Log.error(vErr);
			return undefined;
		}
	}

	return ChangeIndicatorRegistry;
});
