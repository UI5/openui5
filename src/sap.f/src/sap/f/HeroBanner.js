/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/f/library",
	"sap/f/gen/ui5/webcomponents_fiori/dist/HeroBanner"
], function (
	library,
	HeroBannerBase
) {
	"use strict";

	/**
	 * Constructor for a new <code>HeroBanner</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * A flexible, full-width banner designed for placement at the top of a page.
	 *
	 * <h3>Overview</h3>
	 * The <code>HeroBanner</code> provides a personalized greeting and quick access to key
	 * information or actions.
	 *
	 * <h3>Structure</h3>
	 * The <code>HeroBanner</code> consists of the following building blocks:
	 * <ul>
	 * <li><b>Overline</b> (optional) - contextual text at the top, e.g. the current date or a status message.</li>
	 * <li><b>Header</b> (optional) - the main greeting header below the overline, e.g. "Hello, John".</li>
	 * <li><b>Actions</b> (optional) - buttons displayed in the header area.</li>
	 * <li><b>Start Content</b> (optional) - customizable first content column.</li>
	 * <li><b>End Content</b> (optional) - customizable second content column, shown alongside start content.</li>
	 * </ul>
	 *
	 * <h3>Usage</h3>
	 * Place the <code>HeroBanner</code> at the top of a page to welcome the user and surface
	 * relevant information or shortcuts at a glance.
	 *
	 * The hero banner itself is non-interactive. However, interactive elements such as buttons,
	 * cards, or search fields can be placed inside the content slots.
	 *
	 * <h3>Responsive Behavior</h3>
	 * The <code>HeroBanner</code> adapts to different screen sizes:
	 * <ul>
	 * <li>On smaller screens, split layouts collapse to a single stacked column.</li>
	 * <li>The heading text wraps to multiple lines as needed.</li>
	 * <li>On screens &le;1024px, the header text is wrapped to a maximum of 3 lines.</li>
	 * </ul>
	 *
	 * @extends sap.ui.core.webc.WebComponent
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @ui5-experimental-since 1.152
	 * @alias sap.f.HeroBanner
	 */
	var HeroBanner = HeroBannerBase.extend("sap.f.HeroBanner", /** @lends sap.f.HeroBanner.prototype */ {
		metadata: {
			tag: HeroBannerBase.getMetadata().getTag(),
			library: "sap.f",
			defaultAggregation: "startContent",
			properties: {
				/**
				 * Defines the background image of the hero banner.
				 *
				 * Accepts any valid CSS <code>background-image</code> value, e.g.
				 * <code>url("path/to/image.jpg")</code>.
				 */
				backgroundImage: { type: "string", mapping: "style" },

				/**
				 * Defines the placement of the actions slot within the hero banner header.
				 *
				 * Allowed values:
				 * <ul>
				 * <li><code>TopEnd</code> (default) - Actions are displayed to the right of the header text, at the top of the header row.</li>
				 * <li><code>BottomStart</code> - Actions are displayed below the header text, left-aligned, regardless of <code>columnsRatio</code> or slot usage.</li>
				 * </ul>
				 */
				actionsPlacement: {
					type: "sap.f.HeroBannerActionsPlacement",
					mapping: "property",
					defaultValue: "TopEnd"
				},

				/**
				 * Defines the ratio between the two content columns inside the hero banner.
				 *
				 * Takes effect only when <code>endContent</code> is provided. When no <code>endContent</code>
				 * is present, the content spans the full width (single column).
				 *
				 * Allowed values:
				 * <ul>
				 * <li><code>Equal</code> - Two equal columns. Both content blocks share the available width equally.
				 * On smaller screens, both slots stack vertically.</li>
				 * <li><code>FirstWider</code> - Two unequal columns. The start content takes two-thirds of the width,
				 * the end content one-third. On smaller screens, both slots stack vertically.</li>
				 * </ul>
				 */
				columnsRatio: {
					type: "sap.f.HeroBannerColumnsRatio",
					mapping: "property",
					defaultValue: "FirstWider"
				},

				/**
				 * Defines the vertical placement of the header block within the content area.
				 *
				 * Allowed values:
				 * <ul>
				 * <li><code>Top</code> (default) - Header block is placed at the top of the content area.</li>
				 * <li><code>Bottom</code> - Header block is pushed to the bottom of column 1. Only takes effect
				 * when <code>columnsRatio</code> is <code>Equal</code> or <code>FirstWider</code> and only
				 * <code>endContent</code> is provided. When <code>actionsPlacement</code> is also
				 * <code>BottomStart</code>, the <code>endContent</code> slot spans the full height.</li>
				 * </ul>
				 */
				headerBlockPlacement: {
					type: "sap.f.HeroBannerHeaderBlockPlacement",
					mapping: "property",
					defaultValue: "Top"
				},

				/**
				 * Defines the header text displayed in the hero banner.
				 *
				 * This is the main greeting header, typically a personalized message such as "Hello, John".
				 */
				headerText: { type: "string", mapping: "property" },

				/**
				 * Defines text displayed above the heading as an overline.
				 *
				 * Can be used to show the current date, a status message, or any other relevant contextual information.
				 */
				overlineText: { type: "string", mapping: "property" },

				/**
				 * Defines the width of the <code>HeroBanner</code>.
				 */
				width: { type: "sap.ui.core.CSSSize", mapping: "style" },

				/**
				 * Defines the height of the <code>HeroBanner</code>.
				 */
				height: { type: "sap.ui.core.CSSSize", mapping: "style" }
			},

			aggregations: {
				/**
				 * Defines action buttons displayed in the header area of the hero banner.
				 *
				 * Can contain buttons, links, or other interactive elements that provide
				 * quick access to relevant actions directly from the hero banner header.
				 */
				actions: {
					type: "sap.ui.core.Control",
					multiple: true,
					slot: "actions"
				},

				/**
				 * Defines the first (default) content block of the hero banner.
				 *
				 * Content placed directly inside <code>HeroBanner</code> without a slot attribute lands here.
				 * Can contain KPI cards, search input fields, text, buttons, and more.
				 */
				startContent: { type: "sap.ui.core.Control", multiple: true },

				/**
				 * Defines the second content block of the hero banner.
				 *
				 * Used alongside <code>startContent</code> when <code>columnsRatio</code> is set
				 * to <code>Equal</code> or <code>FirstWider</code>.
				 * Can contain cards, buttons, and other interactive elements.
				 */
				endContent: {
					type: "sap.ui.core.Control",
					multiple: true,
					slot: "endContent"
				}
			}
		}
	});

	return HeroBanner;
});
