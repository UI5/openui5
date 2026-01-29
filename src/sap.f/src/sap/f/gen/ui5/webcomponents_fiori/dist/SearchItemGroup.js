/*!
 * ${copyright}
 */
sap.ui.define(
  [
    "sap/f/gen/ui5/webcomponents/dist/ListItemGroup",
    "sap/f/gen/ui5/webcomponents_fiori",
    "sap/f/thirdparty/SearchItemGroup"
  ],
  function (WebComponentBaseClass) {
    "use strict";

    /**
     * @class
     * The `ui5-search-item-group` is type of suggestion item,
     * that can be used to split the `ui5-search-item` suggestions into groups.
     *
     * @extends module:sap/f/gen/ui5/webcomponents/dist/ListItemGroup
     * @constructor
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     * @alias module:sap/f/gen/ui5/webcomponents_fiori/dist/SearchItemGroup
     */

    const WrapperClass = WebComponentBaseClass.extend(
      "sap.f.gen.ui5.webcomponents_fiori.dist.SearchItemGroup",
      {
        metadata: {
          tag: "ui5-search-item-group-0df29cf2",

          namespace: "sap.f.gen.ui5.webcomponents_fiori",

          library: "sap.f",

          designtime:
            "sap/f/gen/ui5/webcomponents_fiori/designtime/SearchItemGroup.designtime",

          interfaces: [],

          defaultAggregation: "",

          properties: {},

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
