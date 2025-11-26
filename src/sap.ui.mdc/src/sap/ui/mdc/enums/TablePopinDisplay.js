/*!
 * ${copyright}
 */

sap.ui.define(["sap/ui/base/DataType"], (DataType) => {
	"use strict";

	/**
	 * Pop-in display mode of the table.
	 *
	 * @enum {string}
	 * @alias sap.ui.mdc.enums.TablePopinDisplay
	 * @since 1.143
	 * @public
	 */
	const TablePopinDisplay = {
		/**
		 * The header is displayed on the first line, and the cell content is displayed on the next line.
		 * @public
		 */
		Block: "Block",
		/**
		 * The cell content is displayed next to the header on the same line.
		 * <b>Note:</b> If there is not enough space for the cell content, then it is displayed on the next line.
		 * @public
		 */
		Inline: "Inline"
	};

	DataType.registerEnum("sap.ui.mdc.enums.TablePopinDisplay", TablePopinDisplay);

	return TablePopinDisplay;

});