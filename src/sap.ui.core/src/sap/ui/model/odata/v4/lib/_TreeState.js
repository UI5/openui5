/*!
 * ${copyright}
 */

//Provides class sap.ui.model.odata.v4.lib._TreeState
sap.ui.define([
	"./_Helper"
], function (_Helper) {
	"use strict";

	//*********************************************************************************************
	// _TreeState
	//*********************************************************************************************
	/**
	 * A class holding the tree state for a recursive hierarchy. It keeps track which nodes have
	 * been manually expanded resp. collapsed and is able to build the "ExpandLevels" parameter for
	 * the "TopLevels" request (see {@link #getExpandLevels}).
	 *
	 * @alias sap.ui.model.odata.v4.lib._TreeState
	 * @private
	 */
	class _TreeState {
		/**
		 * Keeps track which nodes have been manually expanded resp. collapsed and is able to build
		 * the "ExpandLevels" parameter for the "TopLevels" request (see {@link #getExpandLevels}).
		 * Only exceptions w.r.t. the "Levels" parameter need to be taken into account. For nodes
		 * read from the server, this is simply made sure because you can only collapse what has
		 * been expanded before and vice versa. But for {@link #notALeafAnymore}, special care is
		 * needed!
		 *
		 * @see #collapse
		 * @see #expand
		 */
		mPredicate2ExpandInfo = {};

		// @see #getOutOfPlace
		mPredicate2OutOfPlace = {};

		/**
		 * Constructor for a new _TreeState.
		 *
		 * @param {function(object):string} fnGetKeyFilter
		 *   A function to calculate a node's key filter
		 * @param {function(object):any} fnGetNodeId
		 *   A function to calculate a node's ID
		 *
		 * @public
		 */
		constructor(fnGetKeyFilter, fnGetNodeId) {
			this.fnGetKeyFilter = fnGetKeyFilter;
			this.fnGetNodeId = fnGetNodeId;
		}

		/**
		 * Collapse a node.
		 *
		 * @param {object} oNode - The node
		 * @param {boolean} bAll
		 *   Whether collapsing completely
		 * @param {boolean} [bNested]
		 *   Whether the "collapse all" was performed at an ancestor
		 * @public
		 */
		collapse(oNode, bAll, bNested) {
			const sPredicate = _Helper.getPrivateAnnotation(oNode, "predicate");
			const oExpandInfo = this.mPredicate2ExpandInfo[sPredicate];
			// do not delete important info, except nested below a "collapse all"
			if (oExpandInfo?.important && !bNested) {
				oExpandInfo.levels = 0;
				if (bAll) {
					oExpandInfo.collapseAll = true;
				}
			} else if (bNested || oExpandInfo && oExpandInfo.levels !== 0) {
				delete this.mPredicate2ExpandInfo[sPredicate];
			} else {
				// must determine node ID and key filter now; the node may be missing when calling
				// #getExpandLevels or #getExpandFilters
				this.mPredicate2ExpandInfo[sPredicate] = {
					collapseAll : bAll,
					filter : this.fnGetKeyFilter(oNode),
					levels : 0,
					nodeId : this.fnGetNodeId(oNode)
				};
			}
		}

		/**
		 * Delete all tree state information for the given node and all known descendants. Expects
		 * that the node is collapsed.
		 *
		 * @param {object} oNode - The node
		 * @param {function(string):void} [fnOnDelete]
		 *   Callback for every predicate that is not OOP anymore, see {@link #deleteOutOfPlace}
		 *
		 * @public
		 */
		delete(oNode, fnOnDelete) {
			const sPredicate = _Helper.getPrivateAnnotation(oNode, "predicate");
			delete this.mPredicate2ExpandInfo[sPredicate];
			this.deleteOutOfPlace(sPredicate, false, fnOnDelete);
			_Helper.getPrivateAnnotation(oNode, "spliced", []).forEach((oChild) => {
				this.delete(oChild, fnOnDelete);
			});
		}

		/**
		 * Deletes the expand info for the given node and all its descendants.
		 *
		 * @param {object} oNode - The node
		 *
		 * @public
		 */
		deleteExpandInfo(oNode) {
			delete this.mPredicate2ExpandInfo[_Helper.getPrivateAnnotation(oNode, "predicate")];
			_Helper.getPrivateAnnotation(oNode, "spliced", []).forEach((oChild) => {
				this.deleteExpandInfo(oChild);
			});
		}

		/**
		 * Deletes a node and all its descendants from the out-of-place list (making them in-place).
		 *
		 * @param {string} sPredicate - The node's key predicate
		 * @param {boolean} [bUpAndDown] - Whether to start from top-most out-of-place ancestor
		 * @param {function(string):void} [fnOnDelete]
		 *   Callback for every predicate that is not OOP anymore
		 *
		 * @public
		 */
		deleteOutOfPlace(sPredicate, bUpAndDown, fnOnDelete) {
			if (!this.isOutOfPlace(sPredicate)) {
				return; // already in place
			}
			if (bUpAndDown) {
				for (;;) { // find top-most out-of-place ancestor
					const sParentPredicate = this.mPredicate2OutOfPlace[sPredicate].parentPredicate;
					if (!this.isOutOfPlace(sParentPredicate)) {
						break;
					}
					sPredicate = sParentPredicate;
				}
			}
			this.mPredicate2OutOfPlace[sPredicate].context.setOutOfPlace(false);
			delete this.mPredicate2OutOfPlace[sPredicate];
			fnOnDelete?.(sPredicate);
			Object.values(this.mPredicate2OutOfPlace).forEach((oOutOfPlace) => {
				if (oOutOfPlace.parentPredicate === sPredicate) {
					this.deleteOutOfPlace(oOutOfPlace.nodePredicate, false, fnOnDelete);
				}
			});
		}

		/**
		 * Expand a node by the given number of levels.
		 *
		 * @param {object} oNode - The node
		 * @param {number} [iLevels=1]
		 *   The number of levels to expand, <code>iLevels >= Number.MAX_SAFE_INTEGER</code> can be
		 *   used to expand all levels
		 *
		 * @public
		 * @see #notALeafAnymore
		 */
		expand(oNode, iLevels = 1) {
			if (iLevels >= Number.MAX_SAFE_INTEGER) {
				iLevels = null;
				this.deleteExpandInfo(oNode);
			}
			const sPredicate = _Helper.getPrivateAnnotation(oNode, "predicate");
			const oExpandInfo = this.mPredicate2ExpandInfo[sPredicate];
			if (oExpandInfo?.important) { // do not delete important info
				oExpandInfo.levels = iLevels;
				delete oExpandInfo.collapseAll;
			} else if (oExpandInfo && !oExpandInfo.levels && !oExpandInfo.collapseAll) {
				delete this.mPredicate2ExpandInfo[sPredicate];
			} else {
				// must determine node ID and key filter now; the node may be missing when calling
				// #getExpandLevels or #getExpandFilters
				this.mPredicate2ExpandInfo[sPredicate] = {
					filter : this.fnGetKeyFilter(oNode),
					levels : iLevels,
					nodeId : this.fnGetNodeId(oNode)
				};
			}
		}

		/**
		 * Returns an unsorted list of filter strings for the "$filter" system query option for all
		 * nodes which contribute to the "ExpandLevels" parameter and where the given filter
		 * function is matching.
		 *
		 * @param {function(string):boolean} fnFilter - A filter function for the predicates
		 * @returns {string[]} The filter strings
		 *
		 * @public
		 */
		getExpandFilters(fnFilter) {
			return Object.keys(this.mPredicate2ExpandInfo).filter(fnFilter)
				.map((sPredicate) => this.mPredicate2ExpandInfo[sPredicate].filter);
		}

		/**
		 * Returns the "ExpandLevels" parameter to the "TopLevels" function describing the tree
		 * state in "$apply".
		 *
		 * @returns {string|undefined}
		 *   The "ExpandLevels" parameter or undefined if no tree state is kept
		 *
		 * @public
		 */
		getExpandLevels() {
			const aExpandInfos = Object.values(this.mPredicate2ExpandInfo);
			return aExpandInfos.length
				? JSON.stringify(aExpandInfos.map((oExpandInfo) => {
						// build the server representation
						return {NodeID : oExpandInfo.nodeId, Levels : oExpandInfo.levels};
					}))
				: undefined;
		}

		/**
		 * Returns the out-of-place information for the node with the given key predicate.
		 *
		 * @param {string} sPredicate - The node's key predicate
		 * @returns {{nodeFilter : string, nodePredicate : string, parentFilter : string?, parentPredicate : string?}|undefined}
		 *   The out-of-place information or undefined if the node is in place
		 *
		 * @public
		 */
		getOutOfPlace(sPredicate) {
			return this.mPredicate2OutOfPlace[sPredicate];
		}

		/**
		 * Returns the number of out-of-place nodes.
		 *
		 * @returns {number} The number of out-of-place nodes
		 *
		 * @public
		 */
		getOutOfPlaceCount() {
			return this.getOutOfPlacePredicates().length;
		}

		/**
		 * Returns information about the out-of-place nodes grouped by parent.
		 *
		 * @returns {Array<{nodeFilters : string[], nodePredicates : string[], parentFilter : string?, parentPredicate : string?}>}
		 *   A list of out-of-place nodes grouped by parent. Each entry contains all out-of-place
		 *   nodes for a parent (root nodes if parentFilter and parentPredicate are undefined) in
		 *   the order in which they were created.
		 *
		 * @public
		 */
		getOutOfPlaceGroupedByParent() {
			const mOutOfPlaceGroupedByParent = {};
			for (const oOutOfPlace of Object.values(this.mPredicate2OutOfPlace)) {
				const sParentPredicate = oOutOfPlace.parentPredicate;
				const oOutOfPlaceByParent = mOutOfPlaceGroupedByParent[sParentPredicate] ??= {
					nodeFilters : [],
					nodePredicates : [],
					parentFilter : oOutOfPlace.parentFilter,
					parentPredicate : sParentPredicate
				};
				oOutOfPlaceByParent.nodeFilters.push(oOutOfPlace.nodeFilter);
				oOutOfPlaceByParent.nodePredicates.push(oOutOfPlace.nodePredicate);
			}
			return Object.values(mOutOfPlaceGroupedByParent);
		}

		/**
		 * Returns the key predicates of all out-of-place nodes.
		 *
		 * @returns {string[]} The key predicates of all out-of-place nodes
		 *
		 * @public
		 */
		getOutOfPlacePredicates() {
			return Object.keys(this.mPredicate2OutOfPlace);
		}

		/**
		 * Tells whether the node with the given key predicate is currently known to be expanded.
		 *
		 * @param {string} sPredicate - The node's key predicate
		 * @returns {boolean} Whether the node is (known to be) expanded
		 *
		 * @public
		 */
		isExpanded(sPredicate) {
			const vLevels = this.mPredicate2ExpandInfo[sPredicate]?.levels;
			return vLevels > 0 || vLevels === null;
		}

		/**
		 * Tells whether the node with the given key predicate is currently out of place.
		 *
		 * @param {string} sPredicate - The node's key predicate
		 * @returns {boolean} Whether the node is out of place
		 *
		 * @public
		 */
		isOutOfPlace(sPredicate) {
			return sPredicate in this.mPredicate2OutOfPlace;
		}

		/**
		 * Expands a node because it is not a leaf anymore. Takes care of "expand all" by not
		 * creating an expand info below or, in case of doubt, by creating one that is not easily
		 * deleted by {@link #collapse} or {@link #expand} later on.
		 *
		 * Do NOT call this method for a node within the top pyramid ("Levels" parameter or
		 * <code>$$aggregation.expandTo</code>).
		 *
		 * @param {object} oNode - The node
		 * @param {function(string):boolean?} fnIsAncestor
		 *   Callback function to tell whether the node identified by the given key predicate is for
		 *   sure an ancestor of <code>oNode</code> or not; <code>undefined</code> for "don't know"
		 *   is an important information here
		 *
		 * @public
		 * @see #expand
		 */
		notALeafAnymore(oNode, fnIsAncestor) {
			const sPredicate = _Helper.getPrivateAnnotation(oNode, "predicate");
			if (sPredicate in this.mPredicate2ExpandInfo) {
				throw new Error("Not a leaf before");
			}

			let bImportant = false;
			const bBelow = Object.keys(this.mPredicate2ExpandInfo).some((sPredicate0) => {
				if (this.mPredicate2ExpandInfo[sPredicate0].levels === null) {
					const bIsAncestor = fnIsAncestor(sPredicate0);
					bImportant ||= bIsAncestor === undefined;
					return bIsAncestor;
				}
			});
			if (bBelow) {
				return; // below "expand all", no own entry needed
			}

			// must determine node ID and key filter now; the node may be missing when calling
			// #getExpandLevels or #getExpandFilters
			this.mPredicate2ExpandInfo[sPredicate] = {
				filter : this.fnGetKeyFilter(oNode),
				// keep this expand info through following collapse/expand calls
				important : bImportant,
				levels : 1,
				nodeId : this.fnGetNodeId(oNode)
			};
		}

		/**
		 * Resets the tree state.
		 *
		 * @public
		 */
		reset() {
			this.mPredicate2ExpandInfo = {};
			this.resetOutOfPlace();
		}

		/**
		 * Resets all out-of-place information.
		 *
		 * @public
		 */
		resetOutOfPlace() {
			this.getOutOfPlacePredicates()
				.forEach((sPredicate) => this.deleteOutOfPlace(sPredicate));
		}

		/**
		 * Makes the ("created persisted"!) node out of place.
		 *
		 * @param {object} oNode - The node
		 * @param {object} [oParent] - The parent, unless the node is a root
		 * @throws {Error} If the node is not 'created persisted'
		 *
		 * @public
		 */
		setOutOfPlace(oNode, oParent) {
			if (oNode["@$ui5.context.isTransient"] !== false) {
				throw new Error("Not 'created persisted'");
			}
			const oOutOfPlace = {
				context : _Helper.getPrivateAnnotation(oNode, "context"),
				nodeFilter : this.fnGetKeyFilter(oNode),
				nodePredicate : _Helper.getPrivateAnnotation(oNode, "predicate")
			};
			oOutOfPlace.context.setOutOfPlace(true);
			if (oParent) {
				oOutOfPlace.parentFilter = this.fnGetKeyFilter(oParent);
				oOutOfPlace.parentPredicate = _Helper.getPrivateAnnotation(oParent, "predicate");
			}
			this.mPredicate2OutOfPlace[oOutOfPlace.nodePredicate] = oOutOfPlace;
		}

		/**
		 * The given node is still out of place and thus must keep a client-side annotation
		 * <code>"@$ui5.context.isTransient"</code> as well as a private annotation "context".
		 *
		 * @param {object} oNode - The node
		 * @param {string} sPredicate - The node's key predicate
		 *
		 * @public
		 */
		stillOutOfPlace(oNode, sPredicate) {
			oNode["@$ui5.context.isTransient"] = false;
			_Helper.setPrivateAnnotation(oNode, "context",
				this.mPredicate2OutOfPlace[sPredicate].context);
		}
	}

	return _TreeState;
});
