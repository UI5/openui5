/*!
 * ${copyright}
 */

sap.ui.define(["sap/ui/base/DataType"], (DataType) => {
	"use strict";

	/**
	 * Growing mode of the list.
	 *
	 * @enum {string}
	 * @alias sap.ui.mdc.enums.ListGrowingMode
	 * @since 1.153
	 * @ui5-restricted sap.fe
	 */
	const ListGrowingMode = {
		/**
		 * A fixed number of items is shown.
		 *
		 * @ui5-restricted sap.fe
		 */
		None: "None",
		/**
		 * A More button is shown with which the user can request to load more items.
		 *
		 * @ui5-restricted sap.fe
		 */
		Basic: "Basic",
		/**
		 * Either the user requests to load more items by scrolling down, or the More button is displayed if no scrolling is required because the
		 * list is fully visible.
		 *
		 * @ui5-restricted sap.fe
		 */
		Scroll: "Scroll"
	};

	DataType.registerEnum("sap.ui.mdc.enums.ListGrowingMode", ListGrowingMode);

	return ListGrowingMode;

}, /* bExport= */ true);
