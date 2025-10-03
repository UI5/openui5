/*!
 * ${copyright}
 */
sap.ui.define(
  [
    "sap/ui/core/webc/WebComponent",
    "sap/f/gen/ui5/webcomponents",
    "sap/f/thirdparty/SearchItem"
  ],
  function (WebComponentBaseClass) {
    "use strict";

    /**
     * @class
     * A class to serve as a foundation
     * for the `ListItem` and `ListItemGroupHeader` classes.
     *
     * @extends sap.ui.core.webc.WebComponent
     * @constructor
     * @public
     * @alias module:sap/f/gen/ui5/webcomponents/dist/ListItemBase
     */

    const WrapperClass = WebComponentBaseClass.extend(
      "sap.f.gen.ui5.webcomponents.dist.ListItemBase",
      {
        metadata: {
          tag: "",

          namespace: "sap.f.gen.ui5.webcomponents",

          designtime: "sap/f/gen/ui5/webcomponents/designtime/ListItemBase.designtime",

          interfaces: [],

          defaultAggregation: "",

          properties: {
            /**
             * The text-content of the Web Component.
             */
            text: { type: "string", mapping: "textContent" },
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
