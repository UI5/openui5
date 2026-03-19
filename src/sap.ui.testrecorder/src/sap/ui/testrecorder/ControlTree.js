/*!
* ${copyright}
*/
sap.ui.define([
	"sap/base/Log",
	"sap/ui/base/ManagedObject",
	"sap/ui/core/Element",
	"sap/base/util/merge",
	"sap/ui/testrecorder/inspector/ControlAPI",
	"sap/ui/testrecorder/inspector/ControlInspector",
	"sap/ui/testrecorder/utils/filterControlTree",
	"sap/ui/testrecorder/utils/convertTreeToMarkdown"
], function (Log, ManagedObject, Element, merge, ControlAPI, ControlInspector, filterControlTree, convertTreeToMarkdown) {
	"use strict";

	var oControlTree = null;

	var NODE_ID_REGEX = /^(\d+)_(\d+)$/;

	const TREE_CONFIG = {
		filter: {
			includeAncestors: true,
			includeDescendants: true,
			includeInvisibleText: false
		},
		nodeData: {
			includeAssignedProperties: true,
			includeAssignedAssociations: true,
			includeTooltipText: true
		},
		output: {
			verbose: false
		}
	};

	/**
	 * @class A singleton that provides methods to interact with the UI5 control tree, such as searching for controls, performing actions, and retrieving control information.
	 * @extends sap.ui.base.ManagedObject
	 * @alias sap.ui.testrecorder.ControlTree
	 * @private
	 * @since 1.147
	 */
	var ControlTree = ManagedObject.extend("sap.ui.testrecorder.ControlTree", {
		constructor: function () {
			if (!oControlTree) {
				ManagedObject.apply(this, arguments);
				this._oNodeIdToControlIdMap = {};
				this._iSnapshotsCount = 0;
				this._iNodesCount = 0;  // count of nodes in last snapshot
			} else {
				Log.warning("Only one ControlTree allowed");
				return oControlTree;
			}
		}
	});

	/**
	 * @typedef {sap.ui.core.support.ToolsAPI.ControlTreeNode} sap.ui.testrecorder.ControlTreeNode
	 * @description Extends {@link sap.ui.core.support.ToolsAPI.ControlTreeNode} with snapshot-relative identifier
	 * for API consumers to retrieve detailed control information.
	 * @property {string} [nodeId] - Snapshot-relative identifier (format: "snapshotNumber_nodeNumber").
	 *   Can be passed to getControlData() to identify the control.
	 * @private
	 * @since 1.147
	 */

	/**
	 * Search for controls matching the provided query
	 * @param {string} sQuery The search query string
	 * @returns {Promise<String>} A promise that resolves with the matched subtree formatted as a markdown string
	 * @private
	 * @since 1.147
	 */
	ControlTree.prototype.search = function (sQuery) {
		var aTree = ControlAPI.getAllControlData(TREE_CONFIG.nodeData).renderedControls;

		var oFilterOptions = merge({ query: sQuery }, TREE_CONFIG.filter);
		var aFilteredTree = filterControlTree(aTree, oFilterOptions);

		// assign nodeIds to survivors
		this._assignNodeIdsToTree(aFilteredTree);

		// to output format
		return Promise.resolve(convertTreeToMarkdown(aFilteredTree, {
			verbose: TREE_CONFIG.output.verbose
		}));
	};

	/**
	 * Obtains detailed information about a control identified by the given node ID, including a selector snippet and customized control data
	 * @param {string} sNodeId
	 * @returns {Promise<object>} A promise that resolves with an object containing the control information
	 * @private
	 * @since 1.147
	 */
	ControlTree.prototype.getControlData = function (sId) {
		var sControlId = this._getControlId(sId),
			sControlType = this._getControlType(sControlId),
			oControlData = ControlAPI.getControlData({
				controlId: sControlId,
				includeAggregations: true,
				includeAssociations: true
			}),
			oPrunedData = this._pruneControlData(oControlData, {
				inheritedFrom: false,
				type: false,
				bindings: false
			});

		return ControlInspector._getCodeSnippet({ domElementId: sControlId })
			.then(function (sSnippet) {
				return Object.assign({
					controlId: sControlId,
					controlType: sControlType,
					selectorSnippet: sSnippet
				}, oPrunedData);
			});
	};

	/**
	 * Walk the filtered tree and assign nodeIds to all control nodes.
	 * @param {Array<sap.ui.testrecorder.ControlTreeNode>} aNodes - Array of filtered tree nodes
	 * @private
	 */
	ControlTree.prototype._assignNodeIdsToTree = function (aNodes) {
		this._iSnapshotsCount++;
		this._iNodesCount = 0;

		var assignRecursive = function (aInnerNodes) {
			for (var i = 0; i < aInnerNodes.length; i++) {
				this._assignNodeId(aInnerNodes[i]);
				if (aInnerNodes[i].content && aInnerNodes[i].content.length) {
					assignRecursive(aInnerNodes[i].content);
				}
			}
		}.bind(this);

		assignRecursive(aNodes);
	};

	/**
	 * Assign a unique nodeId to a control node.
	 * Stores the mapping between nodeId and control ID for later retrieval.
	 * @param {sap.ui.testrecorder.ControlTreeNode} oNode - Node to enhance (mutated)
	 * @private
	 */
	ControlTree.prototype._assignNodeId = function (oNode) {
		if (oNode.type === 'sap-ui-control') {
			var sNodeId = this._iSnapshotsCount + "_" + (++this._iNodesCount);
			oNode.nodeId = sNodeId;
			this._oNodeIdToControlIdMap[sNodeId] = oNode.id;
		}
	};

	/**
	 * Retrieve original control id for a previously assigned nodeId or return the raw controlId as-is.
	 * @param {string} sId - nodeId (format: "snapshotNumber_nodeNumber") or raw controlId
	 * @returns {string|null} original control id or null when not found
	 */
	ControlTree.prototype._getControlId = function (sId) {
		if (typeof sId !== "string") {
			return null;
		}

		return NODE_ID_REGEX.test(sId) ? (this._oNodeIdToControlIdMap[sId] || null) : sId;
	};

	/**
	 * Retrieve control type name for either a nodeId or a raw controlId.
	 * When given a nodeId, resolves it to a controlId via the map first.
	 * @param {string} sControlId - control id
	 * @returns {string|null} control type name or null when not found
	 */
	ControlTree.prototype._getControlType = function (sControlId) {
		var oControl = Element.getElementById(sControlId);
		return oControl ? oControl.getMetadata().getName() : null;
	};

	ControlTree.prototype._pruneControlData = function (oControlData, oOptions) {
		var fnPrune = function (oProperty) {
			if (oOptions.inheritedFrom === false) {
				delete oProperty.inheritedFrom;
			}
			if (oOptions.type === false) {
				delete oProperty.type;
			}
		};

		if (oOptions.bindings === false) {
			delete oControlData.bindings;
		}

		oControlData.properties?.own.forEach(fnPrune);
		oControlData.properties?.inherited.forEach(fnPrune);
		oControlData.aggregations?.own.forEach(fnPrune);
		oControlData.aggregations?.inherited.forEach(fnPrune);
		oControlData.associations?.own.forEach(fnPrune);
		oControlData.associations?.inherited.forEach(fnPrune);

		return oControlData;
	};

	oControlTree = new ControlTree();

	return oControlTree;

});
