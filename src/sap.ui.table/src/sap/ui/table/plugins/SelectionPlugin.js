/*
 * ${copyright}
 */
sap.ui.define([
	"./PluginBase"
], function(
	PluginBase
) {
	"use strict";

	/**
	 * @abstract
	 * @class
	 * Base class for the selection plugins. A selection plugin is responsible for the selection behavior of the table. It handles the selection state
	 * and provides information about the selection state to the table. The subclass is also responsible for firing the <code>selectionChange</code>
	 * event when the selection is changed.
	 *
	 * Do not add more than one selection plugin to a table.
	 * @extends sap.ui.core.Element
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @public
	 * @since 1.64
	 * @alias sap.ui.table.plugins.SelectionPlugin
	 *
	 * @borrows sap.ui.table.plugins.PluginBase.findOn as findOn
	 */
	const SelectionPlugin = PluginBase.extend("sap.ui.table.plugins.SelectionPlugin", {
		metadata: {
			"abstract": true,
			library: "sap.ui.table",
			properties: {
				/**
				 * Indicates whether this plugin is enabled.
				 */
				enabled: {type: "boolean", defaultValue: true} // TODO: Inherited from private PluginBase. Remove once PluginBase is public.
			},
			events: {
				/**
				 * This event is fired when the selection is changed.
				 */
				selectionChange: {}
			}
		}
	});

	SelectionPlugin.findOn = PluginBase.findOn;

	SelectionPlugin.prototype.setParent = function(oParent) {
		const oOldParent = this.getParent();

		oOldParent?._onSelectionPluginChange();
		if (oOldParent !== oParent) {
			oParent?._onSelectionPluginChange();
		}

		PluginBase.prototype.setParent.apply(this, arguments);

		return this;
	};

	SelectionPlugin.prototype.onDeactivate = function() {
		PluginBase.prototype.onDeactivate.apply(this, arguments);
		this._getHeaderSelector()?.setVisible(false);
	};

	/**
	 * Returns the table's header selector control if available.
	 * Only the table's main selection plugin can access the table's header selector.
	 *
	 * @returns {sap.ui.table.HeaderSelector|undefined}
	 * @private
	 */
	SelectionPlugin.prototype._getHeaderSelector = function() {
		return this.isMainSelectionPlugin ? this.getControl()?._getHeaderSelector() : undefined;
	};

	/**
	 * This hook is called when the header selector is pressed.
	 *
	 * @private
	 */
	SelectionPlugin.prototype.onHeaderSelectorPress = function() {
		if (this.isActive()) {
			this.handleHeaderSelectorPress();
		}
	};

	/**
	 * Handles a header selector press. Subclasses override this method to implement the selection behavior.
	 *
	 * @returns {Promise} A promise that resolves once the selection change has completed.
	 * @private
	 */
	SelectionPlugin.prototype.handleHeaderSelectorPress = function() {
		return Promise.resolve();
	};

	/**
	 * This hook is called when a keyboard shortcut relevant for selection is pressed.
	 *
	 * @param {string} sType Type of the keyboard shortcut. Can be <code>toggle</code> or <code>clear</code>.
	 * @private
	 */
	SelectionPlugin.prototype.onKeyboardShortcut = function(sType) {
		if (this.isActive()) {
			this.handleKeyboardShortcut(sType);
		}
	};

	/**
	 * Handles a selection-relevant keyboard shortcut.
	 * TODO: Document type parameter to that possible values are clear
	 *
	 * @param {string} sType Type of the keyboard shortcut. Can be <code>toggle</code> or <code>clear</code>.
	 * @returns {Promise} A promise that resolves once the selection change has completed.
	 * @private
	 */
	SelectionPlugin.prototype.handleKeyboardShortcut = function(sType) {
		return Promise.resolve();
	};

	/**
	 * Changes the selection state of a row.
	 *
	 * TODO: mConfig was a quick solution. Replace parameterization with dedicated methods? This signature looks like there could also be a
	 * range deselection. Table isn't requesting it, yet, maybe it will one day.
	 * Plugins need to remember the last selected row/context/index. The table should not need to. In simple words: The table should just tell the
	 * plugin that the user wants to select a range to the given row (pressed shift+click on a row) and the plugin should handle the rest. A plugin
	 * might even ignore the request to select a range (if it cannot do it) and select just the row.
	 *
	 * @param {sap.ui.table.Row} oRow Instance of the row
	 * @param {boolean} bSelected The new selection state
	 * @param {object} [mConfig]
	 * @param {boolean} [mConfig.range=false]
	 *     Whether to change the selection of the range from the last changed row to this one. The table's preferred selection status of the range is
	 *     indicated with the <code>bSelected</code> parameter, but the plugin may decide otherwise.
	 * @abstract
	 * @private
	 */
	SelectionPlugin.prototype.setSelected = function(oRow, bSelected, mConfig) {
		throw new Error(this + " does not implement #setSelected");
	};

	/**
	 * Checks whether a row is selected.
	 *
	 * @param {sap.ui.table.Row} oRow Instance of the row
	 * @returns {boolean} Whether the row is selected
	 * @abstract
	 * @private
	 */
	SelectionPlugin.prototype.isSelected = function(oRow) {
		throw new Error(this + " does not implement #isSelected");
	};

	/**
	 * Returns the number of selected rows.
	 *
	 * TODO: Only used for the row drag ghost. Replace with getSelectedContexts() (getSelectedContexts().length)? Useful in integration scenarios.
	 * Check if this is possible with our index-based selection plugins. And if not, does that need to impact the modern interface? Legacy alternative
	 * possible?
	 * If we keep this method, rename to getSelectionCount?
	 *
	 * @returns {int} The number of selected rows
	 * @abstract
	 * @private
	 */
	SelectionPlugin.prototype.getSelectedCount = function() {
		throw new Error(this + " does not implement #getSelectedCount");
	};

	return SelectionPlugin;
});