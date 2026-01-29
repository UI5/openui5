/*!
 * ${copyright}
 */
sap.ui.define(
  [
    "sap/ui/core/webc/WebComponent",
    "sap/f/gen/ui5/webcomponents_fiori",
    "sap/f/thirdparty/UserMenuAccount"
  ],
  function (WebComponentBaseClass) {
    "use strict";

    /**
     * @class
     * ### Overview
     *
     * The `ui5-user-menu-account` represents an account in the `ui5-user-menu`.
     *
     * ### ES6 Module Import
     * `import "@ui5/webcomponents-fiori/dist/UserMenuAccount.js";`
     *
     * @extends sap.ui.core.webc.WebComponent
     * @constructor
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     * @alias module:sap/f/gen/ui5/webcomponents_fiori/dist/UserMenuAccount
     */

    const WrapperClass = WebComponentBaseClass.extend(
      "sap.f.gen.ui5.webcomponents_fiori.dist.UserMenuAccount",
      {
        metadata: {
          tag: "ui5-user-menu-account-0df29cf2",

          namespace: "sap.f.gen.ui5.webcomponents_fiori",

          library: "sap.f",

          designtime:
            "sap/f/gen/ui5/webcomponents_fiori/designtime/UserMenuAccount.designtime",

          interfaces: [],

          defaultAggregation: "",

          properties: {
            /**
             * Defines the avatar image url of the user.
             */
            avatarSrc: {
              type: "string",
              mapping: "property",
              defaultValue: ""
            },

            /**
             * Defines the avatar initials of the user.
             */
            avatarInitials: { type: "string", mapping: "property" },

            /**
             * Defines the title text of the user.
             */
            titleText: {
              type: "string",
              mapping: "property",
              defaultValue: ""
            },

            /**
             * Defines additional text of the user.
             */
            subtitleText: {
              type: "string",
              mapping: "property",
              defaultValue: ""
            },

            /**
             * Defines description of the user.
             */
            description: {
              type: "string",
              mapping: "property",
              defaultValue: ""
            },

            /**
             * Defines if the user is selected.
             */
            selected: {
              type: "boolean",
              mapping: "property",
              defaultValue: false
            },

            /**
             * Indicates whether a loading indicator should be shown.
             */
            loading: {
              type: "boolean",
              mapping: "property",
              defaultValue: false
            },

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
