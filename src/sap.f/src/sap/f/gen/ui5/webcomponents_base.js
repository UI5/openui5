/*!
 * ${copyright}
 */
sap.ui.define(
  [
    "sap/f/thirdparty/webcomponents-base",
    "sap/ui/core/webc/WebComponent",
    "sap/ui/base/DataType"
  ],
  function (WebCPackage, WebComponent, DataType) {
    "use strict";
    const { registerEnum } = DataType;

    // re-export package object
    const pkg = Object.assign({}, WebCPackage);

    // export the UI5 metadata along with the package
    pkg["_ui5metadata"] = {
      name: "sap/f/gen/ui5/webcomponents_base",
      version: "2.23.1",
      dependencies: ["sap.ui.core"],
      types: [
        "sap.f.gen.ui5.webcomponents_base.dist.types.AnimationMode",
        "sap.f.gen.ui5.webcomponents_base.dist.types.CalendarType",
        "sap.f.gen.ui5.webcomponents_base.dist.types.ItemNavigationBehavior",
        "sap.f.gen.ui5.webcomponents_base.dist.types.MovePlacement",
        "sap.f.gen.ui5.webcomponents_base.dist.types.NavigationMode",
        "sap.f.gen.ui5.webcomponents_base.dist.types.SortOrder",
        "sap.f.gen.ui5.webcomponents_base.dist.types.ValueState"
      ],
      interfaces: [],
      controls: [],
      elements: [],
      rootPath: "../"
    };

    // Enums
    /**
     * Different types of AnimationMode.
     *
     * @enum {string}
     * @alias module:sap/f/gen/ui5/webcomponents_base/dist/types/AnimationMode
     * @ui5-module-override sap/f/gen/ui5/webcomponents_base AnimationMode
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     */
    pkg["AnimationMode"] = {
      /**
       * Basic
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Basic: "Basic",
      /**
       * Full
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Full: "Full",
      /**
       * Minimal
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Minimal: "Minimal",
      /**
       * None
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      None: "None"
    };
    registerEnum(
      "sap.f.gen.ui5.webcomponents_base.dist.types.AnimationMode",
      pkg["AnimationMode"]
    );
    /**
     * Different calendar types.
     *
     * @enum {string}
     * @alias module:sap/f/gen/ui5/webcomponents_base/dist/types/CalendarType
     * @ui5-module-override sap/f/gen/ui5/webcomponents_base CalendarType
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     */
    pkg["CalendarType"] = {
      /**
       * Buddhist
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Buddhist: "Buddhist",
      /**
       * Gregorian
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Gregorian: "Gregorian",
      /**
       * Islamic
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Islamic: "Islamic",
      /**
       * Japanese
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Japanese: "Japanese",
      /**
       * Persian
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Persian: "Persian"
    };
    registerEnum(
      "sap.f.gen.ui5.webcomponents_base.dist.types.CalendarType",
      pkg["CalendarType"]
    );
    /**
     * Different behavior for ItemNavigation.
     *
     * @enum {string}
     * @alias module:sap/f/gen/ui5/webcomponents_base/dist/types/ItemNavigationBehavior
     * @ui5-module-override sap/f/gen/ui5/webcomponents_base ItemNavigationBehavior
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     */
    pkg["ItemNavigationBehavior"] = {
      /**
       * Cycling behavior: navigating past the last item continues with the first and vice versa.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Cyclic: "Cyclic",
      /**
       * Static behavior: navigations stops at the first or last item.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Static: "Static"
    };
    registerEnum(
      "sap.f.gen.ui5.webcomponents_base.dist.types.ItemNavigationBehavior",
      pkg["ItemNavigationBehavior"]
    );
    /**
     * Placements of a moved element relative to a target element.
     *
     * @enum {string}
     * @alias module:sap/f/gen/ui5/webcomponents_base/dist/types/MovePlacement
     * @ui5-module-override sap/f/gen/ui5/webcomponents_base MovePlacement
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     */
    pkg["MovePlacement"] = {
      /**
       * After
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      After: "After",
      /**
       * Before
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Before: "Before",
      /**
       * On
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      On: "On"
    };
    registerEnum(
      "sap.f.gen.ui5.webcomponents_base.dist.types.MovePlacement",
      pkg["MovePlacement"]
    );
    /**
     * Different navigation modes for ItemNavigation.
     *
     * @enum {string}
     * @alias module:sap/f/gen/ui5/webcomponents_base/dist/types/NavigationMode
     * @ui5-module-override sap/f/gen/ui5/webcomponents_base NavigationMode
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     */
    pkg["NavigationMode"] = {
      /**
       * Auto
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Auto: "Auto",
      /**
       * Horizontal
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Horizontal: "Horizontal",
      /**
       * Paging
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Paging: "Paging",
      /**
       * Vertical
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Vertical: "Vertical"
    };
    registerEnum(
      "sap.f.gen.ui5.webcomponents_base.dist.types.NavigationMode",
      pkg["NavigationMode"]
    );
    /**
     * Defines the sort order.
     *
     * @enum {string}
     * @alias module:sap/f/gen/ui5/webcomponents_base/dist/types/SortOrder
     * @ui5-module-override sap/f/gen/ui5/webcomponents_base SortOrder
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     */
    pkg["SortOrder"] = {
      /**
       * Sorting is applied in ascending order.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Ascending: "Ascending",
      /**
       * Sorting is applied in descending order.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Descending: "Descending",
      /**
       * Sorting is not applied.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      None: "None"
    };
    registerEnum(
      "sap.f.gen.ui5.webcomponents_base.dist.types.SortOrder",
      pkg["SortOrder"]
    );
    /**
     * Different types of ValueStates.
     *
     * @enum {string}
     * @alias module:sap/f/gen/ui5/webcomponents_base/dist/types/ValueState
     * @ui5-module-override sap/f/gen/ui5/webcomponents_base ValueState
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     */
    pkg["ValueState"] = {
      /**
       * Critical
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Critical: "Critical",
      /**
       * Information
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Information: "Information",
      /**
       * Negative
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Negative: "Negative",
      /**
       * None
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      None: "None",
      /**
       * Positive
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Positive: "Positive"
    };
    registerEnum(
      "sap.f.gen.ui5.webcomponents_base.dist.types.ValueState",
      pkg["ValueState"]
    );

    // Interfaces

    // ====================
    // MONKEY PATCHES BEGIN
    // ====================
    // Helper to fix a conversion between "number" and "core.CSSSize".
    // WebC attribute is a number and is written back to the Control
    // wrapper via sap.ui.core.webc.WebComponent base class.
    // The control property is defined as a "sap.ui.core.CSSSize".

    if (!WebComponent.__setProperty__isPatched) {
      const fnOriginalSetProperty = WebComponent.prototype.setProperty;
      WebComponent.prototype.setProperty = function (
        sPropName,
        v,
        bSupressInvalidate
      ) {
        if ((sPropName === "width" || sPropName === "height") && !isNaN(v)) {
          const sType = this.getMetadata()
            .getProperty(sPropName)
            .getType()
            .getName();
          if (sType === "sap.ui.core.CSSSize") {
            v += "px";
          }
        }
        return fnOriginalSetProperty.apply(this, [
          sPropName,
          v,
          bSupressInvalidate
        ]);
      };
      WebComponent.__setProperty__isPatched = true;
    }

    // Helper to forward the CustomData to the root dom ref in the shadow dom.

    if (!WebComponent.__CustomData__isPatched) {
      const fnOriginalOnAfterRendering =
        WebComponent.prototype.onAfterRendering;
      WebComponent.prototype.onAfterRendering = function () {
        const aCustomData = this.getCustomData();
        if (aCustomData?.length > 0) {
          setTimeout(
            function () {
              const oDomRef = this.getDomRef();
              // either use the getFocusDomRef method or the getDomRef method to get the shadow DOM reference
              const oShadowDomRef =
                oDomRef &&
                ((typeof oDomRef.getFocusDomRef === "function" &&
                  oDomRef.getFocusDomRef()) ||
                  (typeof oDomRef.getDomRef === "function" &&
                    oDomRef.getDomRef()) ||
                  (oDomRef.shadowRoot && oDomRef.shadowRoot.firstElementChild)); // for all non UI5Elements
              if (oShadowDomRef) {
                aCustomData.forEach(function (oCustomData) {
                  if (oCustomData.getWriteToDom()) {
                    const sKey = oCustomData.getKey();
                    const sValue = oCustomData.getValue();
                    oShadowDomRef.setAttribute(`data-${sKey}`, sValue);
                  }
                });
              }
            }.bind(this),
            0
          );
        }
        return fnOriginalOnAfterRendering.apply(this, arguments);
      };
      WebComponent.__CustomData__isPatched = true;
    }

    // ====================
    // MONKEY PATCHES END
    // ====================

    // marker to threat this as an ES module to support named exports
    pkg.__esModule = true;

    return pkg;
  }
);
