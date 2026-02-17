/*!
 * ${copyright}
 */

sap.ui.define(["sap/ui/base/ManagedObject", "./library"], function (ManagedObject, library) {
	"use strict";

	//shortcut for sap.m.CarouselScrollMode
	var CarouselScrollMode = library.CarouselScrollMode;

	/**
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * Applies a <code>sap.m.CarouselLayout</code> to a provided DOM element or Control.
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @extends sap.ui.base.ManagedObject
	 *
	 * @since 1.62
	 * @constructor
	 * @public
	 * @alias sap.m.CarouselLayout
	 */
	var CarouselLayout = ManagedObject.extend("sap.m.CarouselLayout", /** @lends sap.m.CarouselLayout.prototype */ {
		metadata: {
			library: "sap.m",
			properties: {
				/**
				 * Defines how many pages are displayed in the visible area of the <code>Carousel</code> control.
				 * Value should be a positive number.
				 *
				 * <b>Note:</b> When this property is set to something different from the default value,
				 * the <code>loop</code> property of <code>Carousel</code> is ignored.
				 *
				 * <b>Note:</b> This property is ignored when the <code>responsive</code> property is set to <code>true</code>.
				 */
				visiblePagesCount: {type: "int", group: "Misc", defaultValue: 1},

				/**
				 * Defines how the items will be scrolled through in <code>Carousel</code> control.
				 * One at a time or depending on the <code>visiblePagesCount</code>
				 *
				 * NOTE: <code>visiblePagesCount</code> must be set a value larger than 1, to be able to use <code>scrollMode</code> with value "VisiblePages"
				 * @since 1.121
				 */
				scrollMode: {type : "sap.m.CarouselScrollMode", group : "Appearance", defaultValue : CarouselScrollMode.SinglePage},

				/**
				 * Activates the responsive layout mode, where the number of visible carousel pages automatically
				 * adjusts based on the available viewport width and the specified page width.
				 *
				 * When this option is enabled, the carousel dynamically calculates and displays as many items as can
				 * fit within the viewport while adhering to the <code>minPageWidth</code> constraint.
				 *
				 * <b>Note:</b> Enabling this option overrides the <code>visiblePagesCount</code> property
				 * and disables the <code>loop</code> functionality of the carousel.
				 */
				responsive: {type: "boolean", group: "Misc", defaultValue: false},

				/**
				 * Defines the minimum width, in pixels, for each page to be displayed in the <code>Carousel</code> control.
				 *
				 * This property is used as a constraint when <code>responsive</code> mode is enabled, ensuring that pages
				 * are never rendered smaller than this specified width. The carousel automatically calculates the number
				 * of pages that can fit within the available viewport while respecting the specified minimum width requirement.
				 *
				 * <b>Note:</b> This property is only effective when the <code>responsive</code> property is set to <code>true</code>.
				 */
				minPageWidth: {type: "int", group: "Misc", defaultValue: 148}
			}
		}
	});

	/*!
	 * ${copyright}
	 */

	return CarouselLayout;
});
