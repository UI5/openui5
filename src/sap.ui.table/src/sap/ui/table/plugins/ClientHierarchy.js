/*
 * ${copyright}
 */
sap.ui.define([
	"./PluginBase",
	"../utils/TableUtils",
	"sap/ui/model/ClientTreeBindingAdapter"
], function(
	PluginBase,
	TableUtils,
	ClientTreeBindingAdapter
) {
	"use strict";

	const HIERARCHY_INFO = Symbol("HierarchyInfo");

	/**
	 * @class
	 * Integrates the information about the hierarchical data structure of a {@link sap.ui.model.ClientTreeBinding} (for example when using
	 * a {@link sap.ui.model.json.JSONModel}) and the table. The table is enabled to visualize hierarchical data.
	 *
	 * <b>Note:</b> When the plugin is activated or deactivated, the <code>rows</code> aggregation is rebound using the existing binding info.
	 *
	 * @extends sap.ui.table.plugins.PluginBase
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @private
	 * @alias sap.ui.table.plugins.ClientHierarchy
	 *
	 * @borrows sap.ui.table.plugins.PluginBase.findOn as findOn
	 */
	const ClientHierarchy = PluginBase.extend("sap.ui.table.plugins.ClientHierarchy", {
		metadata: {
			library: "sap.ui.table",
			properties: {
				/**
				 * Indicates whether this plugin is enabled.
				 */
				enabled: {type: "boolean", defaultValue: true}, // TODO: Inherited from private PluginBase. Remove once PluginBase is public.

				/**
				 * Indicates whether the plugin tolerates setups it does not support. By default, it validates the model and binding and throws an
				 * error for unsupported setups. If set to <code>true</code>, the plugin stays applied but behaves as a no-op for unsupported setups
				 * instead of throwing. This allows a container that always applies this plugin (for example the model-agnostic
				 * <code>sap.ui.mdc.TableDelegate</code>) to handle models that the plugin does not support without failing.
				 *
				 * @private
				 * @ui5-restricted sap.ui.mdc.TableDelegate
				 */
				tolerateUnsupportedModel: {type: "boolean", defaultValue: false}
			}
		}
	});

	ClientHierarchy.findOn = PluginBase.findOn;

	/**
	 * @inheritDoc
	 */
	ClientHierarchy.prototype.isApplicable = function(oControl) {
		return PluginBase.prototype.isApplicable.apply(this, arguments) && oControl.getMetadata().getName() === "sap.ui.table.Table";
	};

	/**
	 * @inheritDoc
	 */
	ClientHierarchy.prototype.onActivate = function(oTable) {
		PluginBase.prototype.onActivate.apply(this, arguments);

		// Override isTreeBinding on the table instance so bindTree is called on the model instead of bindList when the rows aggregation is
		// bound. The check is defensive: if the model is not a supported ClientModel, false is returned so bindList is used.
		oTable.isTreeBinding = (sName) => {
			if (!sName || sName === "rows") {
				const oModel = oTable.getModel(oTable.getBindingInfo("rows")?.model);
				return !oModel || oModel.isA("sap.ui.model.ClientModel");
			}
			return false;
		};

		// Override getBinding on the table instance to lazily apply the tree binding adapter.
		oTable.getBinding = function(sName) {
			sName = sName == null ? "rows" : sName;
			const oBinding = this.constructor.prototype.getBinding.call(this, sName);

			if (oBinding && sName === "rows" && !oBinding.getLength) {
				ClientTreeBindingAdapter.apply(oBinding);
			}

			return oBinding;
		};

		// Override _getContexts on the table instance to stamp hierarchy information onto each context.
		oTable._getContexts = function(iStartIndex, iLength, iThreshold, bKeepCurrent) {
			const aContexts = this.constructor.prototype._getContexts.call(this, iStartIndex, iLength, iThreshold, bKeepCurrent);

			const oBinding = this.getBinding();
			if (aContexts.length === 0 || !oBinding.getNodes) {
				return aContexts;
			}

			const aNodes = oBinding.getNodes(iStartIndex, iLength, iThreshold);

			aNodes.forEach((oNode) => {
				oNode.context[HIERARCHY_INFO] = {
					level: oNode.level + 1,
					expandable: oBinding.nodeHasChildren(oNode),
					expanded: oNode.nodeState.expanded
				};
			});

			return aContexts;
		};

		TableUtils.Hook.register(oTable, TableUtils.Hook.Keys.Table.RowsBound, onRowsBound, this);
		TableUtils.Hook.register(oTable, TableUtils.Hook.Keys.Row.UpdateState, updateRowState, this);
		TableUtils.Hook.register(oTable, TableUtils.Hook.Keys.Row.Expand, expandRow, this);
		TableUtils.Hook.register(oTable, TableUtils.Hook.Keys.Row.Collapse, collapseRow, this);

		// Set Tree mode optimistically for when the table has no rows binding yet. It will be updated in the RowsBound hook if necessary.
		TableUtils.Grouping.setHierarchyMode(oTable, TableUtils.Grouping.HierarchyMode.Tree);

		// Rebind the rows aggregation so the list binding is replaced with a tree binding due to isTreeBinding.
		rebindIfBound(oTable);
	};

	/**
	 * @inheritDoc
	 */
	ClientHierarchy.prototype.onDeactivate = function(oTable) {
		PluginBase.prototype.onDeactivate.apply(this, arguments);
		TableUtils.Hook.deregister(oTable, TableUtils.Hook.Keys.Table.RowsBound, onRowsBound, this);
		TableUtils.Hook.deregister(oTable, TableUtils.Hook.Keys.Row.UpdateState, updateRowState, this);
		TableUtils.Hook.deregister(oTable, TableUtils.Hook.Keys.Row.Expand, expandRow, this);
		TableUtils.Hook.deregister(oTable, TableUtils.Hook.Keys.Row.Collapse, collapseRow, this);
		TableUtils.Grouping.setHierarchyMode(oTable, TableUtils.Grouping.HierarchyMode.Flat);

		// Restore the default implementations.
		delete oTable.isTreeBinding;
		delete oTable.getBinding;
		delete oTable._getContexts;

		// Rebind the rows aggregation so the tree binding is replaced with a list binding.
		rebindIfBound(oTable);
	};

	function rebindIfBound(oTable) {
		const oBindingInfo = oTable.getBindingInfo("rows");

		if (oBindingInfo) {
			oTable.bindRows(oBindingInfo);
		}
	}

	function onRowsBound(oBinding) {
		validateBinding.call(this, oBinding);
		updateHierarchyMode.call(this, oBinding);
	}

	// In strict mode, throws for unsupported model or binding type. In non-strict mode with an unsupported setup, the plugin stays a no-op.
	function validateBinding(oBinding) {
		if (this.getTolerateUnsupportedModel()) {
			return;
		}

		const oModel = oBinding.getModel();
		const bModelSupported = !oModel || oModel.isA("sap.ui.model.ClientModel");

		if (!bModelSupported || !oBinding.isA("sap.ui.model.ClientTreeBinding")) {
			throw new Error(bModelSupported
				? "Only sap.ui.model.ClientTreeBinding is supported"
				: "Only sap.ui.model.ClientModel is supported");
		}
	}

	function updateHierarchyMode(oBinding) {
		const bTree = oBinding.isA("sap.ui.model.ClientTreeBinding");
		const HierarchyMode = TableUtils.Grouping.HierarchyMode;

		TableUtils.Grouping.setHierarchyMode(this.getControl(), bTree ? HierarchyMode.Tree : HierarchyMode.Flat);
	}

	function updateRowState(oState) {
		const oInfo = oState.context?.[HIERARCHY_INFO];

		if (!oInfo) {
			return;
		}

		oState.level = oInfo.level;
		oState.expandable = oInfo.expandable;
		oState.expanded = oInfo.expanded;
	}

	function expandRow(oRow) {
		const oBinding = this.getControl().getBinding();
		oBinding?.expand?.(oRow.getIndex());
	}

	function collapseRow(oRow) {
		const oBinding = this.getControl().getBinding();
		oBinding?.collapse?.(oRow.getIndex());
	}

	return ClientHierarchy;
});