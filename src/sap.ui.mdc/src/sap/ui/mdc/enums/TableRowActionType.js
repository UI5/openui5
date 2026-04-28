/*!
 * ${copyright}
 */

sap.ui.define(["sap/ui/base/DataType"], (DataType) => {
	"use strict";

	/**
	 * Type of a table row action.
	 *
	 * @enum {string}
	 * @alias sap.ui.mdc.enums.TableRowActionType
	 * @since 1.115
	 * @public
	 */
	const TableRowActionType = {
		/**
		 * Custom-defined row action
		 * @public
		 * @since 1.148
		 */
		Custom: "Custom",

		/**
		 * Navigation arrow (chevron) is shown
		 *
		 * @public
		 */
		Navigation: "Navigation",

		/**
		 * Row action for deletion
		 * @public
		 * @since 1.148
		 */
		Delete: "Delete"
	};

	DataType.registerEnum("sap.ui.mdc.enums.TableRowActionType", TableRowActionType);

	return TableRowActionType;

});