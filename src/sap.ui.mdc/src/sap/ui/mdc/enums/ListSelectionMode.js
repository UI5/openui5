/*!
 * ${copyright}
 */

sap.ui.define(["sap/ui/base/DataType"], (DataType) => {
	"use strict";

	/**
	 * Selection mode of the list.
	 *
	 * @enum {string}
	 * @alias sap.ui.mdc.enums.ListSelectionMode
	 * @since 1.153
	 * @ui5-restricted sap.fe
	 */
	const ListSelectionMode = {
		/**
		 * No item selection available.
		 *
		 * @ui5-restricted sap.fe
		 */
		None: "None",
		/**
		 * Only one item can be selected at a time.
		 *
		 * @ui5-restricted sap.fe
		 */
		Single: "Single",
		/**
		 * Only one item can be selected at a time. The selection control is not shown. Instead, the user can press the item to select it.
		 *
		 * <b>Note:</b> If this selection mode is used, the list does not fire the <code>itemPress</code> event.
		 *
		 * @ui5-restricted sap.fe
		 */
		SingleMaster: "SingleMaster",
		/**
		 * Multiple items can be selected at a time.
		 *
		 * @ui5-restricted sap.fe
		 */
		Multi: "Multi"
	};

	DataType.registerEnum("sap.ui.mdc.enums.ListSelectionMode", ListSelectionMode);

	return ListSelectionMode;

}, /* bExport= */ true);
