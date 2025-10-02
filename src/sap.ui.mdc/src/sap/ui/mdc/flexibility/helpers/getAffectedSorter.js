/*!
 * ${copyright}
 */
sap.ui.define([
	"./addKeyOrName"
], (addKeyOrName) => {
	"use strict";

	/**
	 * Returns the ID of the sorter affected by the change.
	 *
	 * @param {object} oChangeContent content of the change
	 * @returns {string} ID of the affected control
	 *
	 * @private
	 */
	const getAffectedSorter = (oChangeContent) => {
		const sSortOrder = oChangeContent.descending ? "desc" : "asc";
		return `${addKeyOrName(oChangeContent).key}-${sSortOrder}`;
	};

	return getAffectedSorter;
});
