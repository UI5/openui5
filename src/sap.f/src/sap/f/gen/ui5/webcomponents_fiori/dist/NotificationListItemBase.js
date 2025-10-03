/*!
 * ${copyright}
 */
sap.ui.define(
  [
    "sap/f/gen/ui5/webcomponents/dist/ListItemBase",
    "sap/f/gen/ui5/webcomponents_fiori",
    "sap/f/thirdparty/NotificationListItem"
  ],
  function (WebComponentBaseClass) {
    "use strict";

    /**
     * @class
     * The base class of the `NotificationListItem` and `NotificationListGroupItem`.
     *
     * @extends module:sap/f/gen/ui5/webcomponents/dist/ListItemBase
     * @constructor
     * @public
     * @alias module:sap/f/gen/ui5/webcomponents_fiori/dist/NotificationListItemBase
     */

    const WrapperClass = WebComponentBaseClass.extend(
      "sap.f.gen.ui5.webcomponents_fiori.dist.NotificationListItemBase",
      {
        metadata: {
          tag: "",

          namespace: "sap.f.gen.ui5.webcomponents_fiori",

          designtime:
            "sap/f/gen/ui5/webcomponents_fiori/designtime/NotificationListItemBase.designtime",

          interfaces: [],

          defaultAggregation: "",

          properties: {
            /**
             * Defines the `titleText` of the item.
             */
            titleText: { type: "string", mapping: "property" },
            /**
             * Defines if the `notification` is new or has been already read.
             *
             * **Note:** if set to `false` the `titleText` has bold font,
             * if set to true - it has a normal font.
             */
            read: { type: "boolean", mapping: "property", defaultValue: false },
            /**
             * Defines if a busy indicator would be displayed over the item.
             */
            loading: {
              type: "boolean",
              mapping: "property",
              defaultValue: false
            },
            /**
             * Defines the delay in milliseconds, after which the busy indicator will show up for this component.
             */
            loadingDelay: {
              type: "float",
              mapping: "property",
              defaultValue: 1000
            }
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
