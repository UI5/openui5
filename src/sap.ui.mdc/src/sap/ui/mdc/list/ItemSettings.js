/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/Element"
], (
	Element
) => {
	"use strict";

	/**
	 * Constructor for new <code>ItemSettings</code>.
	 *
	 * <b>Note:</b> Only use bindings that are bound against the items, as correct behavior is not guaranteed for other binding types.
	 *
	 * @param {string} [sId] Optional ID for the new object; generated automatically if no non-empty ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * The <code>ItemSettings</code> control is used to configure an item.
	 * This control can only be used in the context of the <code>sap.ui.mdc.List</code> control to define item settings.
	 * @extends sap.ui.core.Element
	 *
	 * @ui5-restricted sap.fe
	 * @since 1.153
	 * @alias sap.ui.mdc.list.ItemSettings
	 */

	const ItemSettings = Element.extend("sap.ui.mdc.list.ItemSettings", {
		metadata: {
			library: "sap.ui.mdc",
			properties: {
				/**
				 * Defines the highlight state of the item.
				 *
				 * @see sap.ui.core.MessageType
				 */
				highlight: {type: "string", group: "Appearance", defaultValue: "None"},
				/**
				 * Defines the semantics of the highlight state, used for accessibility purposes.
				 */
				highlightText: {type: "string", group: "Misc", defaultValue: ""},
				/**
				 * Defines whether the item is in a navigated state.
				 */
				navigated: {type: "boolean", group: "Appearance", defaultValue: false},
				/**
				 * Defines the number of item actions to display.
				 *
				 * This property is useful for bound item actions where the count cannot be determined automatically.
				 * If not set, the count is derived from:
				 * <ul>
				 *   <li>Bound actions: Defaults to 1 (must be set explicitly if multiple actions exist)</li>
				 *   <li>Static actions: The length of the <code>itemActions</code> aggregation</li>
				 * </ul>
				 *
				 * <b>Note:</b> This property is only relevant for <code>sap.ui.mdc.list.ListType</code>.
				 * It has no effect for <code>sap.ui.mdc.list.GridListType</code>, which uses an overlay approach
				 * that does not require pre-allocated space.
				 */
				itemActionCount: {type: "int", group: "Appearance", defaultValue: -1}
			},
			aggregations: {
				/**
				 * Defines the actions available for each item.
				 */
				itemActions: {type: "sap.ui.mdc.list.ItemActionItem", multiple: true}
			}
		}
	});

	/**
	 * Returns the effective number of item actions to display.
	 *
	 * Returns the explicitly set <code>itemActionCount</code> if available. Otherwise:
	 * <ul>
	 *   <li>For bound actions: Returns 1 (default fallback)</li>
	 *   <li>For static actions: Returns the aggregation length</li>
	 * </ul>
	 *
	 * <b>Note:</b> When using bound item actions, set <code>itemActionCount</code> explicitly
	 * if more than one action should be displayed.
	 *
	 * @returns {int} The number of item actions
	 * @private
	 */
	ItemSettings.prototype.getEffectiveItemActionCount = function() {
		if (!this.isPropertyInitial("itemActionCount") || this.getProperty("itemActionCount") !== -1) {
			return this.getProperty("itemActionCount");
		}

		if (this.isBound("itemActions")) {
			return 1;
		}

		return this.getItemActions().length;
	};

	/**
	 * Returns all settings as an object with property values or binding infos.
	 *
	 * @returns {object} Map of property names to values or binding infos
	 * @private
	 */
	ItemSettings.prototype.getAllSettings = function() {
		// Clone to make sure the binding info instances are not shared between different lists.
		const oClone = this.clone();
		const mSettings = {};

		if (this.isBound("navigated")) {
			mSettings.navigated = oClone.getBindingInfo("navigated");
		} else {
			mSettings.navigated = this.getNavigated();
		}

		if (this.isBound("highlight")) {
			mSettings.highlight = oClone.getBindingInfo("highlight");
		} else {
			mSettings.highlight = this.getHighlight();
		}

		if (this.isBound("highlightText")) {
			mSettings.highlightText = oClone.getBindingInfo("highlightText");
		} else {
			mSettings.highlightText = this.getHighlightText();
		}

		oClone.destroy();
		return mSettings;
	};

	/**
	 * Returns the actions configuration as an object with the items array or binding info.
	 *
	 * @returns {object} Map containing the actions items or binding info
	 * @private
	 */
	ItemSettings.prototype.getAllActions = function() {
		// Clone to make sure the binding info instances are not shared between different lists.
		const oClone = this.clone();
		const mSettings = {};

		if (this.isBound("itemActions")) {
			mSettings.items = oClone.getBindingInfo("itemActions");
			const oTemplate = mSettings.items.template;
			// Extract per-property binding infos or static values from the template so that type
			// classes can map them onto inner controls without needing to read the template directly.
			mSettings.templateInfo = {
				icon:    oTemplate.isBound("icon")    ? oTemplate.getBindingInfo("icon")    : oTemplate.getIcon(),
				text:    oTemplate.isBound("text")    ? oTemplate.getBindingInfo("text")    : oTemplate.getText(),
				visible: oTemplate.isBound("visible") ? oTemplate.getBindingInfo("visible") : oTemplate.getVisible()
			};
		} else {
			mSettings.items = this.getItemActions();
		}

		oClone.destroy();
		return mSettings;
	};

	return ItemSettings;
});
