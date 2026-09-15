/*!
 * ${copyright}
 */

sap.ui.define(["sap/ui/base/DataType"], (DataType) => {
	"use strict";

	/**
	 * Type of the list.
	 *
	 * @enum {string}
	 * @alias sap.ui.mdc.enums.ListType
	 * @since 1.153
	 * @ui5-restricted sap.fe
	 */
	const ListType = {
		/**
		 * Equivalent to the default configuration of {@link sap.ui.mdc.list.ListType}.
		 *
		 * @ui5-restricted sap.fe
		 */
		List: "List",
		/**
		 * Equivalent to the default configuration of {@link sap.ui.mdc.list.GridListType}.
		 *
		 * @ui5-restricted sap.fe
		 */
		GridList: "GridList"
	};

	DataType.registerEnum("sap.ui.mdc.enums.ListType", ListType);

	return ListType;

}, /* bExport= */ true);