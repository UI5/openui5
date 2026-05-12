/*!
 * ${copyright}
 */

sap.ui.define(["sap/ui/base/DataType"], (DataType) => {
	"use strict";

	/**
	 * Personalization mode of the list.
	 *
	 * @enum {string}
	 * @alias sap.ui.mdc.enums.ListP13nMode
	 * @since 1.153
	 * @ui5-restricted sap.fe
	 */
	const ListP13nMode = {
		/**
		 * The list can be sorted
		 *
		 * @ui5-restricted sap.fe
		 */
		Sort: "Sort",
		/**
		 * The list can be filtered
		 *
		 * @ui5-restricted sap.fe
		 */
		Filter: "Filter",
		/**
		 * The list can be grouped
		 *
		 * @ui5-restricted sap.fe
		 */
		Group: "Group"
	};

	DataType.registerEnum("sap.ui.mdc.enums.ListP13nMode", ListP13nMode);

	return ListP13nMode;

}, /* bExport= */ true);
