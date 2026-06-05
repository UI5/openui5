/*!
 * ${copyright}
 */
sap.ui.define([], function() {
	"use strict";

	/**
	 * Filters a control tree based on search query and options.
	 *
	 * Applies node-skip rules (e.g. InvisibleText exclusion) and, when a search query is
	 * present, prunes the tree so that only matching nodes (and optionally their ancestors
	 * and/or descendants) survive.
	 *
	 * <b>Note:</b> No module from <code>sap/ui/testrecorder</code> should be used for productive coding!
	 *
	 * @alias module:sap/ui/testrecorder/utils/filterControlTree
	 * @param {Array<sap.ui.core.support.ToolsAPI.ControlTreeNode>} aRawTree - Array of root control-tree nodes
	 * @param {Object} oOptions - Filter options
	 * @param {string} [oOptions.query] - Free-text query to match against node id, name, and data
	 * @param {boolean} [oOptions.includeAncestors=true] - Keep ancestor nodes when a descendant matches
	 * @param {boolean} [oOptions.includeDescendants=true] - Keep descendant nodes when a node matches
	 * @param {boolean} [oOptions.includeInvisibleText=false] - Whether to include InvisibleText controls
	 * @returns {Array<sap.ui.testrecorder.ControlTreeNode>} Filtered copy of the tree (original is not mutated)
	 * @private
	 * @since 1.147
	 */
	function filterControlTree(aRawTree, oOptions) {
		return aRawTree.map(function(oControlNode) {
			return filterNode(oControlNode, oOptions, false);
		}).filter(Boolean);
	}

	/**
	 * Filter a control node and its subtree based on search query and options.
	 * @param {sap.ui.core.support.ToolsAPI.ControlTreeNode} controlNode - Original tree node
	 * @param {Object} oOptions - Filter options
	 * @param {boolean} bAncestorMatched - Whether an ancestor matched the query (propagated down)
	 * @returns {sap.ui.testrecorder.ControlTreeNode|null} Filtered node or null if pruned
	 * @private
	 */
	function filterNode(controlNode, oOptions, bAncestorMatched) {
		if (!controlNode || shouldSkipNode(controlNode, oOptions)) {
			return null;
		}
		var sQuery = oOptions.query;

		// No query → keep entire subtree (only apply skip checks)
		if (!sQuery || !sQuery.trim()) {
			return Object.assign({}, controlNode, { content: copyChildren(controlNode, oOptions) });
		}

		var bThisNodeMatches = doesNodeMatchQuery(controlNode, sQuery);

		// If this node (or an ancestor) matched and includeDescendants is on,
		// keep the entire subtree below (only apply skip checks)
		if ((bAncestorMatched || bThisNodeMatches) && oOptions.includeDescendants) {
			return Object.assign({}, controlNode, { content: copyChildren(controlNode, oOptions) });
		}

		// Recurse children — only surviving children are kept
		var aFilteredChildren = [];
		if (controlNode.content && Array.isArray(controlNode.content)) {
			for (var i = 0; i < controlNode.content.length; i++) {
				var oChild = filterNode(controlNode.content[i], oOptions, bThisNodeMatches);
				if (oChild) {
					aFilteredChildren.push(oChild);
				}
			}
		}

		// Keep this node if it directly matches,
		// or if includeAncestors is on and a descendant survived (i.e. matched)
		var bHasMatchingDescendant = aFilteredChildren.length > 0;
		if (bThisNodeMatches || (oOptions.includeAncestors && bHasMatchingDescendant)) {
			return Object.assign({}, controlNode, { content: aFilteredChildren });
		}

		return null; // prune
	}

	/**
	 * Copy children of a node, applying only skip checks (no query filtering).
	 * Used when the entire subtree should be kept.
	 * @param {sap.ui.core.support.ToolsAPI.ControlTreeNode} controlNode - Parent node whose children to copy
	 * @param {Object} oOptions - Filter options
	 * @returns {Array<sap.ui.testrecorder.ControlTreeNode>} Copied children
	 * @private
	 */
	function copyChildren(controlNode, oOptions) {
		var aChildren = [];
		if (controlNode.content && Array.isArray(controlNode.content)) {
			for (var i = 0; i < controlNode.content.length; i++) {
				var oChild = controlNode.content[i];
				if (!oChild || shouldSkipNode(oChild, oOptions)) {
					continue;
				}
				aChildren.push(Object.assign({}, oChild, { content: copyChildren(oChild, oOptions) }));
			}
		}
		return aChildren;
	}

	/**
	 * Check if a node should be skipped during processing.
	 * @param {sap.ui.core.support.ToolsAPI.ControlTreeNode} controlNode - Control node to check
	 * @param {Object} oOptions - Filter options
	 * @returns {boolean} True if node should be skipped
	 * @private
	 */
	function shouldSkipNode(controlNode, oOptions) {
		// Skip InvisibleText controls unless explicitly included
		return !oOptions.includeInvisibleText && isInvisibleText(controlNode);
	}

	/**
	 * Check if a single node matches the query (without checking descendants).
	 * @param {sap.ui.core.support.ToolsAPI.ControlTreeNode} oNode - Control node to check
	 * @param {string} sQuery - Query string to match against
	 * @returns {boolean} True if THIS node matches (ignoring descendants)
	 * @private
	 */
	function doesNodeMatchQuery(oNode, sQuery) {
		if (!oNode || typeof sQuery !== "string" || !sQuery.trim()) {
			return false; // no match if no query
		}
		sQuery = sQuery.toLowerCase().trim();

		return primitiveMatchesQuery(sQuery, oNode.id) ||
			primitiveMatchesQuery(sQuery, oNode.name) ||
			matchesObjectKeysOrValues(oNode.data, sQuery);
	}

	/**
	 * Case-insensitive substring match for a primitive value against a normalized query.
	 * @param {string} sQuery - Normalized (lowercase, trimmed) query
	 * @param {*} vValue - Primitive value to compare
	 * @returns {boolean} True if the value matches the query
	 * @private
	 */
	function primitiveMatchesQuery(sQuery, vValue) {
		if (!isPrimitiveValue(vValue)) {
			return false;
		}
		return String(vValue).toLowerCase().indexOf(sQuery) !== -1;
	}

	/**
	 * Whether a data value matches the query. Objects and functions are skipped.
	 * Arrays are matched element-wise when elements are primitives.
	 * @param {string} sQuery - Normalized (lowercase, trimmed) query
	 * @param {*} vValue - Property or association value from node.data
	 * @returns {boolean} True if the value matches the query
	 * @private
	 */
	function valueMatchesQuery(sQuery, vValue) {
		if (vValue == null) {
			return false;
		}
		if (Array.isArray(vValue)) {
			for (var i = 0; i < vValue.length; i++) {
				if (isPrimitiveValue(vValue[i]) && primitiveMatchesQuery(sQuery, vValue[i])) {
					return true;
				}
			}
			return false;
		}
		if (typeof vValue === "object" || typeof vValue === "function") {
			return false;
		}
		return primitiveMatchesQuery(sQuery, vValue);
	}

	/**
	 * Whether a value is a JavaScript primitive suitable for query matching.
	 * @param {*} vValue - Value to check
	 * @returns {boolean} True if the value is a primitive
	 * @private
	 */
	function isPrimitiveValue(vValue) {
		if (vValue == null) {
			return false;
		}
		var sType = typeof vValue;
		return sType === "string" || sType === "number" || sType === "boolean" ||
			sType === "bigint" || sType === "symbol";
	}

	/**
	 * Checks if a control node represents an InvisibleText control.
	 * @param {sap.ui.core.support.ToolsAPI.ControlTreeNode} controlNode - Control node to check
	 * @returns {boolean} True if the node is an InvisibleText control
	 * @private
	 */
	function isInvisibleText(controlNode) {
		return controlNode.type === 'sap-ui-control' &&
			controlNode.name && controlNode.name.indexOf('InvisibleText') !== -1;
	}

	/**
	 * Check if any key or value in an object matches the query.
	 * @param {Object} oObject - Object to check
	 * @param {string} sQuery - Normalized (lowercase, trimmed) query
	 * @returns {boolean} True if any key or value matches
	 * @private
	 */
	function matchesObjectKeysOrValues(oObject, sQuery) {
		if (!oObject || typeof oObject !== 'object') {
			return false;
		}
		var aKeys = Object.keys(oObject);
		for (var i = 0; i < aKeys.length; i++) {
			var sKey = aKeys[i];
			if (primitiveMatchesQuery(sQuery, sKey)) {
				return true;
			}
			var vValue = oObject[sKey];
			if (valueMatchesQuery(sQuery, vValue)) {
				return true;
			}
		}
		return false;
	}

	return filterControlTree;
});
