/*!
 * ${copyright}
 */
sap.ui.define(
  [
    "sap/ui/core/webc/WebComponent",
    "sap/f/gen/ui5/webcomponents_fiori",
    "sap/f/thirdparty/SearchScope"
  ],
  function (WebComponentBaseClass) {
    "use strict";

    /**
     * @class
     * The `ui5-search-scope` represents the options for the scope in `ui5-search`.
     *
     * @implements module:sap/f/gen/ui5/webcomponents_fiori.ISearchScope
     * @extends sap.ui.core.webc.WebComponent
     * @constructor
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     * @alias module:sap/f/gen/ui5/webcomponents_fiori/dist/SearchScope
     */

    const WrapperClass = WebComponentBaseClass.extend(
      "sap.f.gen.ui5.webcomponents_fiori.dist.SearchScope",
      {
        metadata: {
          tag: "ui5-search-scope-0df29cf2",

          namespace: "sap.f.gen.ui5.webcomponents_fiori",

          library: "sap.f",

          designtime:
            "sap/f/gen/ui5/webcomponents_fiori/designtime/SearchScope.designtime",

          interfaces: ["sap.f.gen.ui5.webcomponents_fiori.ISearchScope"],

          defaultAggregation: "",

          properties: {
            /**
             * Defines the text of the component.
             */
            text: { type: "string", mapping: "property", defaultValue: "" },

            /**
             * Indicates whether the item is selected
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
