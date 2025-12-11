/*!
 * ${copyright}
 */

sap.ui.define(["sap/ui/base/DataType"], (DataType) => {
	"use strict";

	/**
	 * Defines the supported positions for table-relevant actions within the table toolbar, in accordance with the {@link https://www.sap.com/design-system/fiori-design-web/ui-elements/table-bar/ SAP Design System guidelines}.
	 *
	 * @enum {string}
	 * @alias sap.ui.mdc.enums.TableActionPosition
	 * @since 1.143
	 * @public
	 */
	const TableActionPosition = {
		/**
		 * Extension point for the modification actions at the start of the group.
		 * These actions modify the structure or content of the table, such as cut, copy, paste, reorder.
		 * @public
		 */
		ModificationActions: "ModificationActions",

		/**
		 * The position of the copy action in the modification actions group.
		 * @private
		 */
		ModificationActionsCopy: "ModificationActionsCopy",

		/**
		 * The position of the paste action in the modification actions group.
		 * @private
		 */
		ModificationActionsPaste: "ModificationActionsPaste",

		/**
		 * Extension point for the modification actions at the end of the group.
		 * These actions modify the structure or content of the table, such as cut, copy, paste, reorder.
		 * @public
		 */
		ModificationActionsEnd: "ModificationActionsEnd",

		/**
		 * Extension point for the personalization actions at the start of the group.
		 * These actions change the arrangement or personalization of the table at the item level, such as Expand/Collapse All Rows, Show/Hide Details, Table Settings.
		 * @public
		 */
		PersonalizationActions: "PersonalizationActions",

		/**
		 * The position of the collapse all action in the personalization actions group.
		 * @private
		 */
		PersonalizationActionsCollapseAll: "PersonalizationActionsCollapseAll",

		/**
		 * The position of the expand all action in the personalization actions group.
		 * @private
		 */
		PersonalizationActionsExpandAll: "PersonalizationActionsExpandAll",

		/**
		 * The position of the show/hide details action in the personalization actions group.
		 * @private
		 */
		PersonalizationActionsShowHideDetails: "PersonalizationActionsShowHideDetails",

		/**
		 * Extension point for the personalization actions inserted after the first and before the second group of predefined actions.
		 * These actions change the arrangement or personalization of the table at the item level, such as Expand/Collapse Node, Show/Hide Details, Table Settings.
		 * @public
		 */
		PersonalizationActionsMiddle: "PersonalizationActionsMiddle",

		/**
		 * The position of the settings action in the personalization actions group.
		 * @private
		 */
		PersonalizationActionsSettings: "PersonalizationActionsSettings",

		/**
		 * Extension point for the share actions at the start of the group.
		 * These actions allow users to share table content with another application or with the homepage as a tile, such as Send as Email, Save as Tile.
		 * @public
		 */
		ShareActions: "ShareActions",

		/**
		 * Extension point for the export actions at the start of the group.
		 * These actions convert the content of the table into an external format, such as Excel, PDF, a printed document.
		 * @public
		 */
		ExportActions: "ExportActions",

		/**
		 * The position of the export action in the export actions group.
		 * @private
		 */
		ExportActionsExport: "ExportActionsExport",

		/**
		 * Extension point for the view actions at the start of the group.
		 * These actions change the representation of the entire table, such as View Switch, Fullscreen.
		 * @public
		 */
		ViewActions: "ViewActions",

		/**
		 * Extension point for actions displayed after all table-relevant actions.
		 * These actions allow applications to add additional functionality, such as pagination, refresh.
		 * @public
		 */
		EndActions: "EndActions"
	};

	DataType.registerEnum("sap.ui.mdc.enums.TableActionPosition", TableActionPosition);

	return TableActionPosition;

});