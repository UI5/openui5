/*!
 * ${copyright}
 */
sap.ui.define(
  [
    "sap/f/gen/ui5/webcomponents/dist/ListItemBase",
    "sap/f/gen/ui5/webcomponents",
    "sap/f/thirdparty/UserMenuItem"
  ],
  function (WebComponentBaseClass) {
    "use strict";

    /**
     * @class
     * A class to serve as a base
     * for the `ListItemStandard` and `ListItemCustom` classes.
     *
     * @extends module:sap/f/gen/ui5/webcomponents/dist/ListItemBase
     * @constructor
     * @public
     * @alias module:sap/f/gen/ui5/webcomponents/dist/ListItem
     */

    const WrapperClass = WebComponentBaseClass.extend(
      "sap.f.gen.ui5.webcomponents.dist.ListItem",
      {
        metadata: {
          tag: "",

          namespace: "sap.f.gen.ui5.webcomponents",

          designtime: "sap/f/gen/ui5/webcomponents/designtime/ListItem.designtime",

          interfaces: [],

          defaultAggregation: "",

          properties: {
            /**
             * Defines the visual indication and behavior of the list items.
             * Available options are `Active` (by default), `Inactive`, `Detail` and `Navigation`.
             *
             * **Note:** When set to `Active` or `Navigation`, the item will provide visual response upon press and hover,
             * while with type `Inactive` and `Detail` - will not.
             *
             * @type module:sap/f/gen/ui5/webcomponents.ListItemType
             */
            type: {
              type: "sap.f.gen.ui5.webcomponents.ListItemType",
              mapping: "property",
              defaultValue: "Active"
            },
            /**
             * Defines the additional accessibility attributes that will be applied to the component.
             * The following fields are supported:
             *
             * - **ariaSetsize**: Defines the number of items in the current set  when not all items in the set are present in the DOM.
             * **Note:** The value is an integer reflecting the number of items in the complete set. If the size of the entire set is unknown, set `-1`.
             *
             * 	- **ariaPosinset**: Defines an element's number or position in the current set when not all items are present in the DOM.
             * 	**Note:** The value is an integer greater than or equal to 1, and less than or equal to the size of the set when that size is known.
             */
            accessibilityAttributes: {
              type: "any",
              mapping: "property",
              defaultValue: "{}"
            },
            /**
             * The navigated state of the list item.
             * If set to `true`, a navigation indicator is displayed at the end of the list item.
             */
            navigated: {
              type: "boolean",
              mapping: "property",
              defaultValue: false
            },
            /**
             * Defines the highlight state of the list items.
             * Available options are: `"None"` (by default), `"Positive"`, `"Critical"`, `"Information"` and `"Negative"`.
             *
             * @type module:sap/f/gen/ui5/webcomponents.Highlight
             */
            highlight: {
              type: "sap.f.gen.ui5.webcomponents.Highlight",
              mapping: "property",
              defaultValue: "None"
            },
            /**
             * Defines the selected state of the component.
             */
            selected: {
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

          aggregations: {
            /**
             * Defines the delete button, displayed in "Delete" mode.
             * **Note:** While the slot allows custom buttons, to match
             * design guidelines, please use the `ui5-button` component.
             * **Note:** When the slot is not present, a built-in delete button will be displayed.
             *
             * @type module:sap/f/gen/ui5/webcomponents.IButton
             */
            deleteButton: {
              type: "sap.f.gen.ui5.webcomponents.IButton",
              multiple: true,
              slot: "deleteButton"
            }
          },

          associations: {},

          events: {
            /**
             * Fired when the user clicks on the detail button when type is `Detail`.
             */
            detailClick: {
              enableEventBubbling: true,
              parameters: {}
            }
          },

          getters: [],

          methods: []
        }
      }
    );

    return WrapperClass;
  }
);
