/*!
 * ${copyright}
 */
sap.ui.define(
  [
    "sap/f/gen/ui5/webcomponents/dist/MenuItem",
    "sap/f/gen/ui5/webcomponents_fiori",
    "sap/f/thirdparty/UserMenuItem"
  ],
  function (WebComponentBaseClass) {
    "use strict";

    /**
     * @class
     * ### Overview
     *
     * `ui5-user-menu-item` is the item to use inside a `ui5-user-menu`.
     * An arbitrary hierarchy structure can be represented by recursively nesting menu items.
     *
     * ### Usage
     *
     * `ui5-user-menu-item` represents a node in a `ui5-user-menu`. The user menu itself is rendered as a list,
     * and each `ui5-menu-item` is represented by a menu item in that menu. Therefore, you should only use
     * `ui5-user-menu-item` directly in your apps. The `ui5-menu` menu item is internal for the menu, and not intended for public use.
     *
     * ### ES6 Module Import
     *
     * `import "@ui5/webcomponents-fiori/dist/UserMenuItem.js";`
     *
     * @extends module:sap/f/gen/ui5/webcomponents/dist/MenuItem
     * @constructor
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     * @alias module:sap/f/gen/ui5/webcomponents_fiori/dist/UserMenuItem
     */

    const WrapperClass = WebComponentBaseClass.extend(
      "sap.f.gen.ui5.webcomponents_fiori.dist.UserMenuItem",
      {
        metadata: {
          tag: "ui5-user-menu-item-0df29cf2",

          namespace: "sap.f.gen.ui5.webcomponents_fiori",

          library: "sap.f",

          designtime:
            "sap/f/gen/ui5/webcomponents_fiori/designtime/UserMenuItem.designtime",

          interfaces: [],

          defaultAggregation: "items",

          properties: {},

          aggregations: {
            /**
             * Defines the items of this component.
             *
             * **Note:** Use `ui5-user-menu-item` for the intended design.
             * @type module:sap/f/gen/ui5/webcomponents_fiori/dist/UserMenuItem
             */
            items: {
              type: "sap.f.gen.ui5.webcomponents_fiori.dist.UserMenuItem",
              multiple: true
            }
          },

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
