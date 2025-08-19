/*!
 * ${copyright}
 */

sap.ui.define(["sap/ui/base/DataType"], function(DataType) {
	"use strict";

	/**
	 * Possible badge color options for the {@link sap.m.Avatar} control.
	 *
	 * <b>Notes:</b>
	 * <ul>
	 * <li>Keep in mind that the colors are theme-dependent and can differ based
	 * on the currently used theme.</li>
	 * </ul>
	 *
	 * @enum {string}
	 * @public
	 * @alias sap.m.AvatarBadgeColor
	 * @since 1.132.0
	 */
	var AvatarBadgeColor = {
		/**
		 * Accent 1
		 *
		 * @public
		 */
		Accent1: "Accent1",
		/**
		 * Accent 2
		 *
		 * @public
		 */
		Accent2: "Accent2",
		/**
		 * Accent 3
		 *
		 * @public
		 */
		Accent3: "Accent3",
		/**
		 * Accent 4
		 *
		 * @public
		 */
		Accent4: "Accent4",
		/**
		 * Accent 5
		 *
		 * @public
		 */
		Accent5: "Accent5",
		/**
		 * Accent 6
		 *
		 * @public
		 */
		Accent6: "Accent6",
		/**
		 * Accent 7
		 *
		 * @public
		 */
		Accent7: "Accent7",
		/**
		 * Accent 8
		 *
		 * @public
		 */
		Accent8: "Accent8",
		/**
		 * Accent 9
		 *
		 * @public
		 */
		Accent9: "Accent9",
		/**
		 * Accent 10
		 *
		 * @public
		 */
		Accent10: "Accent10",
		/**
		 * Indication 1
		 *
		 * @public
		 * @since 1.140.0
		 */
		Indication1: "Indication1",
		/**
		 * Indication 2
		 *
		 * @public
		 * @since 1.140.0
		 */
		Indication2: "Indication2",
		/**
		 * Indication 3
		 * @public
		 * @since 1.140.0
		 */
		Indication3: "Indication3",
		/**
		 * Indication 4
		 * @public
		 * @since 1.140.0
		 */
		Indication4: "Indication4",
		/**
		 * Indication 5
		 * @public
		 * @since 1.140.0
		 */
		Indication5: "Indication5",
		/**
		 * Indication 6
		 * @public
		 * @since 1.140.0
		 */
		Indication6: "Indication6",
		/**
		 * Indication 7
		 * @public
		 * @since 1.140.0
		 */
		Indication7: "Indication7",
		/**
		 * Indication 8
		 * @public
		 * @since 1.140.0
		 */
		Indication8: "Indication8",
		/**
		 * Indication 9
		 * @public
		 * @since 1.140.0
		 */
		Indication9: "Indication9",
		/**
		 * Indication 10
		 * @public
		 * @since 1.140.0
		 */
		Indication10: "Indication10"
	};

	DataType.registerEnum("sap.m.AvatarBadgeColor", AvatarBadgeColor);

	return AvatarBadgeColor;
});