/*!
 * ${copyright}
 */
sap.ui.define(
  [
    "sap/ui/core/webc/WebComponent",
    "sap/f/gen/ui5/webcomponents_fiori",
    "sap/f/thirdparty/ShellBarSpacer"
  ],
  function (WebComponentBaseClass) {
    "use strict";

    /**
     * @class
     * ### Overview
     * The `ui5-shellbar-spacer` is an element, used for visual separation between the two content parts of the `ui5-shellbar`.
     * **Note:** The `ui5-shellbar-spacer` component is in an experimental state and is a subject to change.
     *
     * @extends sap.ui.core.webc.WebComponent
     * @constructor
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     * @alias module:sap/f/gen/ui5/webcomponents_fiori/dist/ShellBarSpacer
     */

    const WrapperClass = WebComponentBaseClass.extend(
      "sap.f.gen.ui5.webcomponents_fiori.dist.ShellBarSpacer",
      {
        metadata: {
          tag: "ui5-shellbar-spacer-0df29cf2",

          namespace: "sap.f.gen.ui5.webcomponents_fiori",

          library: "sap.f",

          designtime:
            "sap/f/gen/ui5/webcomponents_fiori/designtime/ShellBarSpacer.designtime",

          interfaces: ["sap.m.IBar", "sap.tnt.IToolHeader"],

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
