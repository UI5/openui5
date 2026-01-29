/*!
 * ${copyright}
 */
sap.ui.define(
  [
    "sap/f/gen/ui5/webcomponents/dist/ListItemBase",
    "sap/f/gen/ui5/webcomponents_fiori",
    "sap/f/thirdparty/SearchItemShowMore"
  ],
  function (WebComponentBaseClass) {
    "use strict";

    /**
     * @class
     * ### Overview
     *
     * A `ui5-search-item-show-more` is a special type of ui5-li that acts as a button to progressively reveal additional (overflow) items within a group.
     *
     * ### ES6 Module Import
     *
     * `import "@ui5/webcomponents-fiori/dist/SearchItemShowMore.js";`
     *
     * @extends module:sap/f/gen/ui5/webcomponents/dist/ListItemBase
     * @constructor
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     * @alias module:sap/f/gen/ui5/webcomponents_fiori/dist/SearchItemShowMore
     */

    const WrapperClass = WebComponentBaseClass.extend(
      "sap.f.gen.ui5.webcomponents_fiori.dist.SearchItemShowMore",
      {
        metadata: {
          tag: "ui5-search-item-show-more-0df29cf2",

          namespace: "sap.f.gen.ui5.webcomponents_fiori",

          library: "sap.f",

          designtime:
            "sap/f/gen/ui5/webcomponents_fiori/designtime/SearchItemShowMore.designtime",

          interfaces: [],

          defaultAggregation: "",

          properties: {
            /**
             * Specifies the number of additional items available to show.
             * This value replaces the placeholder (N) in the "Show more (N)" text.
             * If not set, the placeholder will remain as (N).
             */
            itemsToShowCount: { type: "float", mapping: "property" },

            /**
             * Defines whether the show more item is selected.
             */
            selected: {
              type: "boolean",
              mapping: "property",
              defaultValue: false
            },

            /**
             * The 'width' of the Web Component in <code>sap.ui.core.CSSSize</code>.
             */
            width: { type: "sap.ui.core.CSSSize", mapping: "style" },

            /**
             * The 'height' of the Web Component in <code>sap.ui.core.CSSSize</code>.
             */
            height: { type: "sap.ui.core.CSSSize", mapping: "style" }
          },

          aggregations: {},

          associations: {},

          events: {},

          getters: [],

          methods: []
        }
      }
    );

    return WrapperClass;
  }
);
