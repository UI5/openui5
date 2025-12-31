/*!
 * ${copyright}
 */

sap.ui.define([
	"./HeaderSelectorRenderer",
	"sap/ui/core/Control"
], function(
	HeaderSelectorRenderer,
	Control
) {
	"use strict";

	/**
	 * Constructor for a new HeaderSelector.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * The <code>HeaderSelector</code> control renders the header selector cell content.
	 * This control must only be used in the context of the <code>sap.ui.table.Table</code> control.
	 * It is managed by selection plugins which update its state based on the current selection.
	 *
	 * @extends sap.ui.core.Control
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @alias sap.ui.table.HeaderSelector
	 */
	const HeaderSelector = Control.extend("sap.ui.table.HeaderSelector", /** @lends sap.ui.table.HeaderSelector.prototype */ {
		metadata: {
			library: "sap.ui.table",
			properties: {
				/**
				 * Type of the header selector.
				 *
				 * "CheckBox" - Renders a checkbox.
				 * Supported properties: visible, enabled, tooltip (has default value based on selected state), selected
				 *
				 * "Icon" - Renders an icon.
				 * Supported properties: visible, enabled, tooltip, icon
				 */
				type: {type: "string", group: "Appearance", defaultValue: "CheckBox"},

				/**
				 * Whether the header selector is visible.
				 */
				visible: {type: "boolean", group: "Appearance", defaultValue: false},

				/**
				 * Whether the header selector is enabled.
				 */
				enabled: {type: "boolean", group: "Behavior", defaultValue: true},

				/**
				 * Whether the checkbox is selected.
				 *
				 * Only used if type is "CheckBox".
				 */
				checkBoxSelected: {type: "boolean", group: "Appearance", defaultValue: false},

				/**
				 * Icon URI.
				 *
				 * Only used if type is "Icon".
				 */
				icon: {type: "sap.ui.core.URI", group: "Appearance", defaultValue: ""}
			}
		},
		renderer: HeaderSelectorRenderer
	});

	/**
	 * Resets all properties to their default values.
	 */
	HeaderSelector.prototype.resetSettings = function() {
		this.resetProperty("type");
		this.resetProperty("visible");
		this.resetProperty("enabled");
		this.resetProperty("checkBoxSelected");
		this.resetProperty("icon");
		this.destroyTooltip();
	};

	return HeaderSelector;
});