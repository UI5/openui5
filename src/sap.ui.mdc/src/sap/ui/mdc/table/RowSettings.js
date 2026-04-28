/*!
 * ${copyright}
 */

sap.ui.define([
	'sap/ui/core/Element'
], (
	Element
) => {
	"use strict";
	/**
	 * Constructor for new <code>RowSettings</code>.
	 *
	 * <b>Note:</b> Only use bindings that are bound against the rows, as working functionality cannot be ensured for other binding types.
	 *
	 * @param {string} [sId] Optional ID for the new object; generated automatically if no non-empty ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * The <code>RowSettings</code> control is used to configure a row.
	 * This control can only be used in the context of the <code>sap.ui.mdc.Table</code> control to define row settings.
	 * @extends sap.ui.core.Element
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @alias sap.ui.mdc.table.RowSettings
	 */

	const RowSettings = Element.extend("sap.ui.mdc.table.RowSettings", {
		metadata: {
			library: "sap.ui.mdc",
			properties: {
				/**
				 * The highlight state of the rows.
				 *
				 * If the highlight is set to {@link module:sap/ui/core/message/MessageType MessageType.None} (default), no highlights are visible.
				 * Valid values for the <code>highlight</code> property are values of the enumerations {@link module:sap/ui/core/message/MessageType}
				 * or {@link sap.ui.core.IndicationColor} (only values of <code>Indication01</code> to <code>Indication10</code> are supported
				 * for accessibility contrast reasons).
				 *
				 * Accessibility support is provided with the {@link sap.ui.mdc.table.RowSettings#setHighlightText highlightText} property.
				 * If the <code>highlight</code> property is set to a value of {@link module:sap/ui/core/message/MessageType}, the
				 * <code>highlightText</code> property does not need to be set because a default text is used. However, the default text can be
				 * overridden by setting the <code>highlightText</code> property.
				 * In all other cases the <code>highlightText</code> property must be set.
				 *
				 */
				highlight: {type: "string", group: "Appearance", defaultValue: "None"},

				/**
				 * Defines the semantics of the {@link sap.ui.mdc.table.RowSettings#setHighlight highlight} property for accessibility purposes.
				 */
				highlightText: {type: "string", group: "Misc", defaultValue: ""},

				/**
				 * The navigated state of a row. The navigation indicator is displayed at the end of a row.
				 */
				navigated: {type: "boolean", group: "Appearance", defaultValue: false},

				/**
				 * Defines the number of row actions to display.
				 *
				 * This property is useful for bound row actions where the count
				 * cannot be determined automatically. If not set, the count is derived from:
				 * <ul>
				 *   <li>Bound actions: Defaults to 1 (must be set explicitly if multiple actions exist)</li>
				 *   <li>Static actions: The length of the <code>rowActions</code> aggregation</li>
				 * </ul>
				 *
				 * <b>Note:</b><br>
				 * If the <code>rowActionCount</code> property is not explicitly set, the table will automatically determine the number of row actions
				 * that is displayed based on the configuration of the <code>RowSettings</code> and the underlying table type.
				 * In this case, the table will check how many actions are configured in the <code>RowSettings</code> and will display as many actions
				 * as possible up to the maximum number of actions supported by the underlying table type.<br>
				 *
				 * If the <code>rowActionCount</code> property is explicitly set,
				 * its value will be used to determine how many row actions are displayed,
				 * regardless of the number of actions configured in the <code>RowSettings</code>. However,
				 * the actual number of displayed actions will
				 * still be limited by the maximum number of actions supported by the underlying table type.
				 *
				 * <b>Example:</b><br>
				 * If the underlying table type supports a maximum number of 3 row actions,
				 * and there are 5 actions configured in the <code>RowSettings</code>:
				 *
				 * <ul>
				 *   <li><code>rowActionCount</code> is not set, the table will display 3 actions (the maximum supported).</li>
				 *   <li><code>rowActionCount</code> is set to 2, the table will display 2 actions (as specified),
				 *   even though more actions are configured in the <code>RowSettings</code>.</li>
				 * </ul>
				 *
				 * For bound row actions, the <code>rowActionCount</code> must be set explicitly, as the count cannot be determined automatically.
				 * For static actions, the count defaults to the length of the <code>rowActions</code> aggregation in the <code>RowSettings</code>.
				 *
				 * @since 1.148
				 */
				rowActionCount: {type: "int", group: "Appearance", defaultValue: -1}
			},
			aggregations: {
				/**
				 * The actions that appear at the end of a row.
				 *
				 * <b>Note:</b> This aggregation cannot be bound with a factory. If the table type is
				 * {@link sap.ui.mdc.table.ResponsiveTableType ResponsiveTable}, only the <code>Navigation</code> row action type is supported.
				 */
				rowActions: {type: "sap.ui.mdc.table.RowActionItem", multiple: true}
			}
		}
	});

	RowSettings.prototype.getAllSettings = function() {
		const mSettings = {};
		const thisCloned = this.clone(); // To make sure the binding info instances are not shared between different tables

		if (this.isBound("navigated")) {
			mSettings.navigated = thisCloned.getBindingInfo("navigated");
		} else {
			mSettings.navigated = this.getNavigated();
		}

		if (this.isBound("highlight")) {
			mSettings.highlight = thisCloned.getBindingInfo("highlight");
		} else {
			mSettings.highlight = this.getHighlight();
		}

		if (this.isBound("highlightText")) {
			mSettings.highlightText = thisCloned.getBindingInfo("highlightText");
		} else {
			mSettings.highlightText = this.getHighlightText();
		}

		thisCloned.destroy();
		return mSettings;
	};

	RowSettings.prototype.getAllActions = function() {
		const mSettings = {};

		if (this.isBound("rowActions")) {
			const thisCloned = this.clone();
			// Set bindingInfo for items aggregation to bindingInfo of rowActions
			mSettings.items = thisCloned.getBindingInfo("rowActions");
			const oTemplate = mSettings.items.template;
			// Create temporary metdata information for later processing
			mSettings.templateInfo = {
				type: oTemplate.isBound("type") ? oTemplate.getBindingInfo("type") : oTemplate.getType(),
				text: oTemplate.isBound("text") ? oTemplate.getBindingInfo("text") : oTemplate.getText(),
				icon: oTemplate.isBound("icon") ? oTemplate.getBindingInfo("icon") : oTemplate.getIcon(),
				visible: oTemplate.isBound("visible") ? oTemplate.getBindingInfo("visible") : oTemplate.getVisible()
			};
			thisCloned.destroy();
		} else {
			mSettings.items = this.getRowActions();
		}
		return mSettings;
	};

	/**
	 * Returns the effective number of row actions to display.
	 *
	 * Returns the explicitly set <code>rowActionCount</code> if available. Otherwise:
	 * <ul>
	 *   <li>For bound actions: Returns 1 (default fallback)</li>
	 *   <li>For static actions: Returns the aggregation length</li>
	 * </ul>
	 *
	 * <b>Note:</b> When using bound row actions, set <code>rowActionCount</code> explicitly
	 * if more than one action should be displayed.
	 *
	 * @returns {int} The number of row actions
	 * @private
	 */
	RowSettings.prototype.getEffectiveRowActionCount = function() {
		// 1. If explicitly set, use that value
		if (!this.isPropertyInitial("rowActionCount") || this.getProperty("rowActionCount") !== -1) {
			return this.getProperty("rowActionCount");
		}

		// 2. Fallback to automatic detection
		let iCount = 0;
		if (this.isBound("rowActions")) {
			// Bound actions: Default to 1 (developer should set explicitly)
			iCount = 1;
		} else {
			// Static actions: Use array length
			iCount = this.getRowActions().length;
		}

		return iCount;
	};

	return RowSettings;
});