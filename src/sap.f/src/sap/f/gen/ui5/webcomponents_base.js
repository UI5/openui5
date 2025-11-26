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
      version: "2.15.0",
      dependencies: ["sap.ui.core"],
      types: [
        "sap.f.gen.ui5.webcomponents_base.AnimationMode",
        "sap.f.gen.ui5.webcomponents_base.CalendarType",
        "sap.f.gen.ui5.webcomponents_base.ItemNavigationBehavior",
        "sap.f.gen.ui5.webcomponents_base.MovePlacement",
        "sap.f.gen.ui5.webcomponents_base.NavigationMode",
        "sap.f.gen.ui5.webcomponents_base.SortOrder",
        "sap.f.gen.ui5.webcomponents_base.ValueState"
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
     * @alias module:sap/f/gen/ui5/webcomponents_base.AnimationMode
     * @ui5-module-override sap/f/gen/ui5/webcomponents_base AnimationMode
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     */
    pkg["AnimationMode"] = {
      /**
       * Full
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Full: "Full",
      /**
       * Basic
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Basic: "Basic",
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
    registerEnum("sap.f.gen.ui5.webcomponents_base.AnimationMode", pkg["AnimationMode"]);
    /**
     * Different calendar types.
     *
     * @enum {string}
     * @alias module:sap/f/gen/ui5/webcomponents_base.CalendarType
     * @ui5-module-override sap/f/gen/ui5/webcomponents_base CalendarType
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     */
    pkg["CalendarType"] = {
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
       * Buddhist
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Buddhist: "Buddhist",
      /**
       * Persian
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Persian: "Persian"
    };
    registerEnum("sap.f.gen.ui5.webcomponents_base.CalendarType", pkg["CalendarType"]);
    /**
     * Different behavior for ItemNavigation.
     *
     * @enum {string}
     * @alias module:sap/f/gen/ui5/webcomponents_base.ItemNavigationBehavior
     * @ui5-module-override sap/f/gen/ui5/webcomponents_base ItemNavigationBehavior
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     */
    pkg["ItemNavigationBehavior"] = {
      /**
       * Static behavior: navigations stops at the first or last item.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Static: "Static",
      /**
       * Cycling behavior: navigating past the last item continues with the first and vice versa.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Cyclic: "Cyclic"
    };
    registerEnum(
      "sap.f.gen.ui5.webcomponents_base.ItemNavigationBehavior",
      pkg["ItemNavigationBehavior"]
    );
    /**
     * Placements of a moved element relative to a target element.
     *
     * @enum {string}
     * @alias module:sap/f/gen/ui5/webcomponents_base.MovePlacement
     * @ui5-module-override sap/f/gen/ui5/webcomponents_base MovePlacement
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     */
    pkg["MovePlacement"] = {
      /**
       * On
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      On: "On",
      /**
       * Before
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Before: "Before",
      /**
       * After
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      After: "After"
    };
    registerEnum("sap.f.gen.ui5.webcomponents_base.MovePlacement", pkg["MovePlacement"]);
    /**
     * Different navigation modes for ItemNavigation.
     *
     * @enum {string}
     * @alias module:sap/f/gen/ui5/webcomponents_base.NavigationMode
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
       * Vertical
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Vertical: "Vertical",
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
      Paging: "Paging"
    };
    registerEnum(
      "sap.f.gen.ui5.webcomponents_base.NavigationMode",
      pkg["NavigationMode"]
    );
    /**
     * Defines the sort order.
     *
     * @enum {string}
     * @alias module:sap/f/gen/ui5/webcomponents_base.SortOrder
     * @ui5-module-override sap/f/gen/ui5/webcomponents_base SortOrder
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     */
    pkg["SortOrder"] = {
      /**
       * Sorting is not applied.
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      None: "None",
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
      Descending: "Descending"
    };
    registerEnum("sap.f.gen.ui5.webcomponents_base.SortOrder", pkg["SortOrder"]);
    /**
     * Different types of ValueStates.
     *
     * @enum {string}
     * @alias module:sap/f/gen/ui5/webcomponents_base.ValueState
     * @ui5-module-override sap/f/gen/ui5/webcomponents_base ValueState
     * @private
     * @ui5-restricted sap.ushell,sap.esh.search.ui
     */
    pkg["ValueState"] = {
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
      Positive: "Positive",
      /**
       * Critical
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Critical: "Critical",
      /**
       * Negative
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Negative: "Negative",
      /**
       * Information
       *
       * @private
       * @ui5-restricted sap.ushell,sap.esh.search.ui
       */
      Information: "Information"
    };
    registerEnum("sap.f.gen.ui5.webcomponents_base.ValueState", pkg["ValueState"]);

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

    // Fixed with https://github.com/SAP/openui5/commit/7a4615e3fe55221ae9de9d876d3eed209f71a5b1 in UI5 1.128.0

    if (!WebComponent.__renderAttributeProperties__isPatched) {
      const WebComponentRenderer = WebComponent.getMetadata().getRenderer();
      WebComponentRenderer.renderAttributeProperties = function (
        oRm,
        oWebComponent
      ) {
        var oAttrProperties = oWebComponent
          .getMetadata()
          .getPropertiesByMapping("property");
        // ##### MODIFICATION START #####
        var hyphenate = sap.ui.require("sap/base/strings/hyphenate");
        var aPropsToAlwaysSet = ["enabled"].concat(
          Object.entries(oWebComponent.getMetadata().getPropertyDefaults()).map(
            ([key, value]) => {
              return value !== undefined && value !== false ? key : null;
            }
          )
        ); // some properties can be initial and still have a non-default value due to side effects (e.g. EnabledPropagator)
        // ##### MODIFICATION END #####
        for (var sPropName in oAttrProperties) {
          if (
            oWebComponent.isPropertyInitial(sPropName) &&
            !aPropsToAlwaysSet.includes(sPropName)
          ) {
            continue; // do not set attributes for properties that were not explicitly set or bound
          }

          var oPropData = oAttrProperties[sPropName];
          var vPropValue = oPropData.get(oWebComponent);
          if (oPropData.type === "object" || typeof vPropValue === "object") {
            continue; // Properties of type "object" and custom-type properties with object values are set during onAfterRendering
          }

          var sAttrName = oPropData._sMapTo
            ? oPropData._sMapTo
            : hyphenate(sPropName);
          if (oPropData._fnMappingFormatter) {
            vPropValue = oWebComponent[oPropData._fnMappingFormatter].call(
              oWebComponent,
              vPropValue
            );
          }

          if (oPropData.type === "boolean") {
            if (vPropValue) {
              oRm.attr(sAttrName, "");
            }
          } else {
            if (vPropValue != null) {
              oRm.attr(sAttrName, vPropValue);
            }
          }
        }
      };
      WebComponent.__renderAttributeProperties__isPatched = true;
    }

    // Fixed with https://github.com/SAP/openui5/commit/a4b5fe00b49e0e26e5fd845607a2b95db870d55a in UI5 1.136.1

    if (!WebComponent.__CustomEventsListeners__isPatched) {
      WebComponent.prototype.__attachCustomEventsListeners = function () {
        // ##### MODIFICATION START #####
        var hyphenate = sap.ui.require("sap/base/strings/hyphenate");
        var oEvents = this.getMetadata().getAllEvents();
        // ##### MODIFICATION END #####
        for (var sEventName in oEvents) {
          var sCustomEventName = hyphenate(sEventName);
          this.getDomRef().addEventListener(
            sCustomEventName,
            this.__handleCustomEventBound
          );
        }
      };

      WebComponent.prototype.__detachCustomEventsListeners = function () {
        var oDomRef = this.getDomRef();
        if (!oDomRef) {
          return;
        }

        // ##### MODIFICATION START #####
        var hyphenate = sap.ui.require("sap/base/strings/hyphenate");
        var oEvents = this.getMetadata().getAllEvents();
        // ##### MODIFICATION END #####
        for (var sEventName in oEvents) {
          if (oEvents.hasOwnProperty(sEventName)) {
            var sCustomEventName = hyphenate(sEventName);
            oDomRef.removeEventListener(
              sCustomEventName,
              this.__handleCustomEventBound
            );
          }
        }
      };
      WebComponent.__CustomEventsListeners__isPatched = true;
    }

    // Fixed with https://github.com/SAP/openui5/commit/111c4bcd1660f90714ed567fa8cb57fbc448591f in UI5 1.136.1

    if (!WebComponent.___mapValueState__isPatched) {
      WebComponent.prototype._mapValueState ??= function (sValueState) {
        console.warn(
          "ValueState mapping is not implemented for Web Components yet. Please use UI5 version 1.136.1 or higher."
        );
        return sValueState;
      };
      WebComponent.___mapValueState__isPatched = true;
    }

    // Fixed with https://github.com/UI5/openui5/commit/090a19eb317785fc047b9b3d2c59016cacc3e8fa in UI5 1.140.0

    if (!WebComponent.__MappingSupportForEvents__isPatched) {
      var WebComponentMetadataPrototype = Object.getPrototypeOf(
        WebComponent.getMetadata()
      );
      var OriginalEvent = WebComponentMetadataPrototype.metaFactoryEvent;
      var WebComponentEvent = function (oClass, name, info) {
        OriginalEvent.apply(this, arguments);
        if (info.mapping) {
          this._sMapTo =
            typeof info.mapping !== "object" ? info.mapping : info.mapping.to;
        }
        this._isCustomEvent = true; // WebComponent events are always custom events
      };
      WebComponentEvent.prototype = Object.create(OriginalEvent.prototype);
      WebComponentEvent.prototype.constructor = WebComponentEvent;
      WebComponentMetadataPrototype.metaFactoryEvent = WebComponentEvent;

      WebComponentMetadataPrototype.getEventsForCustomEvent = function (
        sCustomEventName
      ) {
        var mFiltered = {};
        var mEvents = this.getAllEvents();
        for (var sEventName in mEvents) {
          var oEventObj = mEvents[sEventName];
          if (oEventObj._isCustomEvent) {
            if (
              sEventName === sCustomEventName ||
              oEventObj._sMapTo === sCustomEventName
            ) {
              mFiltered[sEventName] = oEventObj;
            }
          }
        }

        return mFiltered;
      };

      WebComponent.prototype.__attachCustomEventsListeners = function () {
        var hyphenate = sap.ui.require("sap/base/strings/hyphenate");
        var oDomRef = this.getDomRef();
        var oEvents = this.getMetadata().getAllEvents();
        for (var sEventName in oEvents) {
          if (oEvents[sEventName]._isCustomEvent) {
            var sCustomEventName = hyphenate(
              oEvents[sEventName]._sMapTo || sEventName
            );
            this.__handleCustomEventBound =
              this.__handleCustomEventBound ||
              this.__handleCustomEvent.bind(this);
            oDomRef.addEventListener(
              sCustomEventName,
              this.__handleCustomEventBound
            );
          }
        }
      };

      WebComponent.prototype.__detachCustomEventsListeners = function () {
        var oDomRef = this.getDomRef();
        if (!oDomRef) {
          return;
        }
        var hyphenate = sap.ui.require("sap/base/strings/hyphenate");
        var oEvents = this.getMetadata().getAllEvents();
        for (var sEventName in oEvents) {
          if (oEvents[sEventName]._isCustomEvent) {
            var sCustomEventName = hyphenate(
              oEvents[sEventName]._sMapTo || sEventName
            );
            oDomRef.removeEventListener(
              sCustomEventName,
              this.__handleCustomEventBound
            );
          }
        }
      };

      WebComponent.prototype.__handleCustomEvent = function (oEvent) {
        // Prepare the event data object
        var camelize = sap.ui.require("sap/base/strings/camelize");
        var sEventName = camelize(oEvent.type);
        var oEventData = this.__formatEventData(oEvent.detail);

        // Notify all custom events that are registered for this event name
        var mCustomEvents =
          this.getMetadata().getEventsForCustomEvent(sEventName);
        for (var sName in mCustomEvents) {
          var oEventObj = mCustomEvents[sName];
          var bPrevented = !oEventObj.fire(this, oEventData);
          if (bPrevented) {
            oEvent.preventDefault();
          }
        }
      };

      WebComponent.__MappingSupportForEvents__isPatched = true;
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
