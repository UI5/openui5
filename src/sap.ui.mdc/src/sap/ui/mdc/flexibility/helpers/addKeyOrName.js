/*!
 * ${copyright}
 */
sap.ui.define([
], () => {
	"use strict";

	/**
	 * Normalizes the item identifier on a content object, ensuring <code>key</code> is set.
	 *
	 * Content objects may arrive with only the deprecated <code>name</code> property (written by
	 * versions before 1.124.0). This helper promotes <code>name</code> to <code>key</code> when
	 * <code>key</code> is absent. During the 1.x transition window, <code>key</code> is additionally
	 * mirrored back onto <code>name</code> for backward compatibility. In UI5 2.0, the deprecated
	 * branches are removed and this function becomes a one-way key normalizer.
	 *
	 * @param {object} oTarget A content object whose <code>key</code> should be normalized
	 * @returns {object} The same object with <code>key</code> set, and during the 1.x transition window <code>name</code> mirrored for backward compatibility
	 */
	const addKeyOrName = (oTarget) => {
	 oTarget.key ??= oTarget.name;

	 return oTarget;
	};

	return addKeyOrName;
});
