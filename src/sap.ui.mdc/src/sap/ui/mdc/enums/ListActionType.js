/*!
 * ${copyright}
 */

sap.ui.define(["sap/ui/base/DataType"], (DataType) => {
	"use strict";

	/**
	 * Type of a list item action.
	 *
	 * @enum {string}
	 * @alias sap.ui.mdc.enums.ListActionType
	 * @since 1.153
	 * @ui5-restricted sap.fe
	 */
	const ListActionType = {
		/**
		 * Custom-defined item action.
		 *
		 * @ui5-restricted sap.fe
		 */
		Custom: "Custom",
		/**
		 * Navigation arrow (chevron) is shown.
		 *
		 * @ui5-restricted sap.fe
		 */
		Navigation: "Navigation",
		/**
		 * Item action for deletion.
		 *
		 * @ui5-restricted sap.fe
		 */
		Delete: "Delete"
	};

	DataType.registerEnum("sap.ui.mdc.enums.ListActionType", ListActionType);

	return ListActionType;

}, /* bExport= */ true);
