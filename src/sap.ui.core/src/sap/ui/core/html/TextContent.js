/*!
 * ${copyright}
 */

// Provides control sap.ui.core.html.TextContent
sap.ui.define([
	"sap/ui/core/Control"
], function(Control) {
	"use strict";

	/**
	 * Constructor for a new <code>TextContent</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * A lightweight wrapper that carries a piece of plain text inside the UI5 control tree.
	 *
	 * It represents inline text that appears between the child elements of a
	 * <code>sap.ui.core.html.HTMLElement</code> (mixed content in an XMLView). Rather than wrapping
	 * such text in an actual HTML element (which would alter the rendered DOM), a
	 * <code>TextContent</code> holds the text so its position within the parent's <code>children</code> aggregation is preserved.
	 * The <code>sap.ui.core.html.HTMLElementRenderer</code> handles TextContent instances by writing the text natively,
	 * without a surrounding tag.
	 *
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @since 1.154
	 * @alias sap.ui.core.html.TextContent
	 * @private
	 * @ui5-restricted sap.ui.core
	 */
	const TextContent = Control.extend("sap.ui.core.html.TextContent", {
		metadata: {
			library: "sap.ui.core",
			properties: {
				/**
				 * The plain text content represented by this control.
				 */
				text: { type: "string", defaultValue: "" }
			}
		},
		renderer: null
	});

	return TextContent;
});
