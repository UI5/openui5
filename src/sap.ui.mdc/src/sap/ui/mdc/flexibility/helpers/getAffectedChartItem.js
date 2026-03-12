/*!
 * ${copyright}
 */
sap.ui.define([
	"./addKeyOrName"
], (addKeyOrName) => {
	"use strict";

	/**
	 * Returns the ID of the chart item affected by the change.
	 * Includes the role to distinguish items with the same key but different roles.
	 *
	 * DINC0709459: When chart items change role (e.g., from category to series),
	 * both removeItem and addItem changes are created. Without the role in the
	 * affectedControl ID, the condenser incorrectly treats them as nullifying
	 * changes and deletes both.
	 *
	 * Similar to SortFlex (where undefined descending defaults to "asc"),
	 * undefined role defaults to "category" - the most common initial role.
	 * This ensures removeItem (which has no role in content) matches the
	 * original addItem when the item was a category.
	 *
	 * @param {object} oChangeContent content of the change
	 * @returns {string} ID of the affected control
	 *
	 * @private
	 */
	const getAffectedChartItem = (oChangeContent) => {
		// Default to "category" when role is not specified (similar to SortFlex defaulting to "asc")
		const sRole = oChangeContent.role || "category";
		return `${addKeyOrName(oChangeContent).key}-${sRole}`;
	};

	return getAffectedChartItem;
});
