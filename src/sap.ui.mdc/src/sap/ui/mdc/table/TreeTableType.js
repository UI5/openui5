/*!
 * ${copyright}
 */

sap.ui.define([
	"./GridTableType"
], (
	GridTableType
) => {
	"use strict";

	/**
	 * Constructor for a new <code>TreeTableType</code>.
	 *
	 * @param {string} [sId] Optional ID for the new object; generated automatically if no non-empty ID is given
	 * @param {object} [mSettings] Initial settings for the new object
	 * @class The table type info class for the metadata-driven table.
	 * @extends sap.ui.mdc.table.GridTableType
	 * @author SAP SE
	 * @public
	 * @since 1.109
	 * @alias sap.ui.mdc.table.TreeTableType
	 */
	const TreeTableType = GridTableType.extend("sap.ui.mdc.table.TreeTableType", {
		metadata: {
			library: "sap.ui.mdc"
		}
	});

	return TreeTableType;
});