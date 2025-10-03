/*!
 * ${copyright}
 */
sap.ui.define(
  [
    "sap/ui/core/webc/WebComponent",
    "sap/f/gen/ui5/webcomponents_fiori",
    "sap/f/thirdparty/SearchMessageArea"
  ],
  function (WebComponentBaseClass) {
    "use strict";

    /**
     * @class
     * `import "sap/f/gen/ui5/webcomponents_fiori/dist/SearchMessageArea.js";`
     *
     * @extends sap.ui.core.webc.WebComponent
     * @constructor
     * @public
     * @alias module:sap/f/gen/ui5/webcomponents_fiori/dist/SearchMessageArea
     */

    const WrapperClass = WebComponentBaseClass.extend(
      "sap.f.gen.ui5.webcomponents_fiori.dist.SearchMessageArea",
      {
        metadata: {
          tag: "ui5-search-message-area-87689b96",

          namespace: "sap.f.gen.ui5.webcomponents_fiori",

          designtime:
            "sap/f/gen/ui5/webcomponents_fiori/designtime/SearchMessageArea.designtime",

          interfaces: [],

          defaultAggregation: "",

          properties: {
            /**
             * Defines the text to be displayed.
             */
            text: { type: "string", mapping: "property" },
            /**
             * Defines the description text to be displayed.
             */
            description: { type: "string", mapping: "property" },
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
