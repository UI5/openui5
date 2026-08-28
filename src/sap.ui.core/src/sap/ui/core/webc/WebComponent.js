/*!
 * ${copyright}
 */

// Provides the base class for all Web Component wrappers.
sap.ui.define([
	"../html/HTMLElement",
	"../html/HTMLElementRenderer",
	"./WebComponentMetadata",
	"../library"
],
function(
	HTMLElement,
	HTMLElementRenderer,
	WebComponentMetadata,
	coreLibrary
) {
	"use strict";

	const ValueState = coreLibrary.ValueState;

	// Mapping sap.ui.core.ValueState to web component value sates
	const webcValueStateMapping = {
		[ValueState.Error]: "Negative",
		[ValueState.Warning]: "Critical",
		[ValueState.Success]: "Positive",
		[ValueState.Information]: "Information",
		[ValueState.None]: "None"
	};
	// reverse map for parsing
	const coreValueStateMapping = Object.fromEntries(
		Object.entries(webcValueStateMapping).map(([key, value]) => [value, key])
	);

	/**
	 * Constructs and initializes a Web Component Wrapper with the given <code>sId</code> and settings.
	 *
	 * @param {string} [sId] Optional ID for the new control; generated automatically if no non-empty ID is given
	 *      Note: this can be omitted, no matter whether <code>mSettings</code> will be given or not!
	 * @param {object} [mSettings] Object with initial settings for the new control
	 *
	 * @class Base Class for Web Components.
	 * Web Components are agnostic UI elements which can be integrated into the UI5
	 * programming model by using this wrapper control. This wrapper control takes
	 * care to propagate the properties, the aggregations and the events. It also
	 * ensures to render the control and put the aggregated controls in the dedicated
	 * slots of the Web Component.
	 *
	 * <b>Note:</b> This class is abstract and must not be instantiated directly.
	 *
	 * @abstract
	 * @extends sap.ui.core.html.HTMLElement
	 * @author SAP SE
	 * @version ${version}
	 * @public
	 * @since 1.138.0
	 * @alias sap.ui.core.webc.WebComponent
	 */
	var WebComponent = HTMLElement.extend("sap.ui.core.webc.WebComponent", {
		metadata : {
			stereotype : "webcomponent",
			"abstract" : true,
			library : "sap.ui.core",
			properties: {
				__isBusy: {
					type: "boolean",
					visibility: "hidden",
					defaultValue: false,
					mapping: {
						type: "property",
						to: "__is-busy"
					}
				}
			}
		},

		constructor : function(sId, mSettings) {
			HTMLElement.apply(this, arguments);

			this.__busyIndicatorTimeout = null;
			this.__onInvalidation = this.__onInvalidationBound = this.__onInvalidation.bind(this);
		},

		renderer: HTMLElementRenderer

	}, /* Metadata constructor */ WebComponentMetadata);

	/**
	 * @typedef {sap.ui.core.Element.MetadataOptions} sap.ui.core.webc.WebComponent.MetadataOptions
	 *
	 * The structure of the "metadata" object which is passed when inheriting from sap.ui.core.Element using its static "extend" method.
	 * See {@link sap.ui.core.Element.extend} for details on its usage.
	 *
	 * @property {string} tag
	 *     Tag name of the Web Component to be used in the renderer to render the HTML.
	 * @property {Object<string, string | sap.ui.core.webc.WebComponent.MetadataOptions.Property>} [properties]
	 *     An object literal whose properties each define a new managed property in the WebComponent subclass.
	 *     See {@link sap.ui.base.ManagedObject.MetadataOptions.Property Property} for more details.
	 * @property {Object<string, string | sap.ui.core.webc.WebComponent.MetadataOptions.Aggregation>} [aggregations]
	 *     An object literal whose properties each define a new aggregation in the ManagedObject subclass.
	 *     See {@link sap.ui.base.ManagedObject.MetadataOptions.Aggregation Aggregation} for more details.
	 * @property {Object<string, string | sap.ui.core.webc.WebComponent.MetadataOptions.Association>} [associations]
	 *     An object literal whose properties each define a new association in the ManagedObject subclass.
	 *     See {@link sap.ui.base.ManagedObject.MetadataOptions.Association Association} for more details.
	 * @property {Object<string, string | sap.ui.core.webc.WebComponent.MetadataOptions.Event>} [events]
	 *     An object literal whose properties each define a new event of the ManagedObject subclass.
	 *     See {@link sap.ui.base.ManagedObject.MetadataOptions.Event Event} for more details.
	 * @property {string[]} [getters]
	 *     Proxied public getters of the Web Component which are directly accessible on the wrapper Control.
	 * @property {string[]} [methods]
	 *     Proxied public methods of the Web Component which are directly accessible on the wrapper Control.
	 *
	 * @public
	 */

	/**
	 * @typedef {sap.ui.base.ManagedObject.MetadataOptions.Property} sap.ui.core.webc.WebComponent.MetadataOptions.Property
	 *
	 * An object literal describing a property of a class derived from <code>sap.ui.core.webc.WebComponent</code>.
	 * See {@link sap.ui.core.webc.WebComponent.MetadataOptions MetadataOptions} for details on its usage.
	 *
	 * @property {"property" | "style" | "textContent" | "slot" | "none" | sap.ui.core.webc.WebComponent.MetadataOptionsPropertyMapping} [mapping="property"] Defines the mapping of the property to be either "property", "style", "textContent", "slot", or "none".
	 *     The default mapping of a property is "property" which either renders the value of the property into an attribute of the custom tag or forwards object properties to the mutator in the onAfterRendering phase.
	 *
	 * @public
	 */

	/**
	 * @typedef {object} sap.ui.core.webc.WebComponent.MetadataOptions.Property.Mapping
	 *
	 * An object literal describing the mapping of a property of a class derived from <code>sap.ui.core.webc.WebComponent</code>.
	 *
	 * @property {"property" | "style" | "textContent" | "slot" | "none"} [type="property"] Defines the mapping of the property to be either "property", "style", "textContent", "slot", or "none".
	 *     The default mapping of a property is "property" which either renders the value of the property into an attribute of the custom tag or forwards object properties to the mutator in the onAfterRendering phase.
	 * @property {string} [to] Defines the target of the mapping of the property (e.g. the name of the attribute/property).
	 * @property {string} [formatter] Defines the name of the formatter function at the WebComponent instance to format the value before its being mapped.
	 *
	 * @public
	 */

	/**
	 * @typedef {sap.ui.base.ManagedObject.MetadataOptions.Aggregation} sap.ui.core.webc.WebComponent.MetadataOptions.Aggregation
	 *
	 * An object literal describing a property of a class derived from <code>sap.ui.core.webc.WebComponent</code>.
	 * See {@link sap.ui.core.webc.WebComponent.MetadataOptions MetadataOptions} for details on its usage.
	 *
	 * @property {string} [slot] Flag that marks the property as deprecated (defaults to false). May lead to an additional warning
	 *     log message at runtime when the property is still used. For the documentation, also add a <code>@deprecated</code> tag in the JSDoc,
	 *     describing since when it is deprecated and what any alternatives are.
	 *
	 * @public
	 */

	/**
	 * @typedef {sap.ui.base.ManagedObject.MetadataOptions.Association} sap.ui.core.webc.WebComponent.MetadataOptions.Association
	 *
	 * An object literal describing an association of a class derived from <code>sap.ui.core.webc.WebComponent</code>.
	 * See {@link sap.ui.core.webc.WebComponent.MetadataOptions MetadataOptions} for details on its usage.
	 *
	 * @property {"property" | sap.ui.core.webc.WebComponent.MetadataOptionsAssociationMapping} [mapping="property"] Defines the mapping of the association which defaults to "property".
	 *     Associations are forwarded to the corresponding mutator of the Web Component.
	 *
	 * @public
	 */

	/**
	 * @typedef {object} sap.ui.core.webc.WebComponent.MetadataOptions.Association.Mapping
	 *
	 * An object literal describing the mapping of an association as property of a class derived from <code>sap.ui.core.webc.WebComponent</code>.
	 *
	 * @property {"property"} [type="property"] Defines the mapping of the association which defaults to "property".
	 *     Associations are forwarded to the corresponding mutator of the Web Component.
	 * @property {string} [to] Defines the target of the mapping of the association to which property it will be mapped to.
	 * @property {string} [formatter] Defines the name of the formatter function at the WebComponent instance to format the value before its being mapped.
	 *
	 * @public
	 */

	// [FIX] The following mapping omits the <code>no-unnecessary-qualifier</code> error or we need to extend the <code>tslint.json</code>!
	/**
	 * @typedef {sap.ui.core.webc.WebComponent.MetadataOptions.Association.Mapping} sap.ui.core.webc.WebComponent.MetadataOptionsAssociationMapping
	 *
	 * @public
	 */

	/**
	 * @typedef {sap.ui.base.ManagedObject.MetadataOptions.Event} sap.ui.core.webc.WebComponent.MetadataOptions.Event
	 *
	 * An object literal describing an event of a class derived from <code>sap.ui.core.webc.WebComponent</code>.
	 * See {@link sap.ui.core.webc.WebComponent.MetadataOptions MetadataOptions} for details on its usage.
	 *
	 * @property {sap.ui.core.webc.WebComponent.MetadataOptionsEventMapping} [mapping] Defines the mapping of the event.
	 *
	 * @public
	 */

	/**
	 * @typedef {object} sap.ui.core.webc.WebComponent.MetadataOptions.Event.Mapping
	 *
	 * An object literal describing the mapping of an event of a class derived from <code>sap.ui.core.webc.WebComponent</code>.
	 *
	 * @property {string} [to] Defines the target of the mapping of the event to which name it will be mapped to.
	 *
	 * @public
	 */

	// [FIX] The following mapping omits the <code>no-unnecessary-qualifier</code> error or we need to extend the <code>tslint.json</code>!
	/**
	 * @typedef {sap.ui.core.webc.WebComponent.MetadataOptions.Event.Mapping} sap.ui.core.webc.WebComponent.MetadataOptionsEventMapping
	 *
	 * @public
	 */

	/**
	 * Defines a new subclass of WebComponent with the name <code>sClassName</code> and enriches it with
	 * the information contained in <code>oClassInfo</code>.
	 *
	 * <code>oClassInfo</code> can contain the same information that {@link sap.ui.base.ManagedObject.extend} already accepts,
	 * plus the <code>dnd</code> property in the metadata object literal to configure drag-and-drop behavior
	 * (see {@link sap.ui.core.webc.WebComponent.MetadataOptions MetadataOptions} for details). Objects describing aggregations can also
	 * have a <code>dnd</code> property when used for a class extending <code>WebComponent</code>
	 * (see {@link sap.ui.base.ManagedObject.MetadataOptions.AggregationDnD AggregationDnD}).
	 *
	 * Example:
	 * <pre>
	 * WebComponent.extend('sap.mylib.MyElement', {
	 *   metadata : {
	 *     library : 'sap.mylib',
	 *     tag : 'my-webcomponent',
	 *     properties : {
	 *       value : 'string',
	 *       width : {
	 *         type: 'sap.ui.core.CSSSize',
	 *         mapping: 'style'
	 *       }
	 *     },
	 *     defaultAggregation: "content",
	 *     aggregations : {
	 *       content : {
	 *         type: 'sap.ui.core.Control',
	 *         multiple : true
	 *       },
	 *       header : {
	 *         type : 'sap.ui.core.Control',
	 *         multiple : false,
	 *         slot: 'header'
	 *       }
	 *     }
	 *   }
	 * });
	 * </pre>
	 *
	 * @param {string} sClassName Name of the class to be created
	 * @param {object} [oClassInfo] Object literal with information about the class
	 * @param {sap.ui.core.webc.WebComponent.MetadataOptions} [oClassInfo.metadata] the metadata object describing the class: tag, properties, aggregations, events etc.
	 * @param {function} [FNMetaImpl] Constructor function for the metadata object. If not given, it defaults to <code>sap.ui.core.ElementMetadata</code>.
	 * @returns {function} Created class / constructor function
	 *
	 * @public
	 * @static
	 * @name sap.ui.core.webc.WebComponent.extend
	 * @function
	 */

	/**
	 * Assigns the __slot property which tells RenderManager to render the sap.ui.core.Element (oElement) with a "slot" attribute
	 *
	 * @param {sap.ui.core.Element} oElement a UI5 Element instance that is aggregated in the Web Component
	 * @param {string} sAggregationName the name of the aggregation to which the element is added
	 * @private
	 */
	WebComponent.prototype._setSlot = function(oElement, sAggregationName) {
		var aDenyList = ["tooltip", "customData", "layoutData", "dependents", "dragDropConfig"];
		if (oElement && !aDenyList.includes(sAggregationName)) {
			var sSlot = this.getMetadata().getAggregationSlot(sAggregationName);
			oElement.__slot = sSlot;
		}
	};

	/**
	 * Removes the __slot property from the sap.ui.core.Element instance
	 *
	 * @param {sap.ui.core.Element} oElement Element from which to remove the slot
	 * @private
	 */
	WebComponent.prototype._unsetSlot = function(oElement) {
		if (oElement) {
			delete oElement.__slot;
		}
	};

	/**
	 * Set the slot for each newly added child control, based on its aggregation
	 *
	 * @override
	 * @param {string}
	 *            sAggregationName name of an 0..1 aggregation
	 * @param {sap.ui.base.ManagedObject}
	 *            oObject the managed object that is set as aggregated object
	 * @param {boolean}
	 *            [bSuppressInvalidate] if true, this ManagedObject is not marked as changed
	 * @returns {this} Returns <code>this</code> to allow method chaining
	 * @throws {Error}
	 * @protected
	 */
	WebComponent.prototype.setAggregation = function(sAggregationName, oObject, bSuppressInvalidate) {
		var vResult = HTMLElement.prototype.setAggregation.apply(this, arguments);
		this._setSlot(oObject, sAggregationName);
		return vResult;
	};

	/**
	 * Set the slot for each newly added child control, based on its aggregation
	 *
	 * @override
	 * @param {string}
	 *            sAggregationName the string identifying the aggregation the managed object <code>oObject</code>
	 *            should be inserted into.
	 * @param {sap.ui.base.ManagedObject}
	 *            oObject the ManagedObject to add; if empty, nothing is inserted.
	 * @param {int}
	 *            iIndex the <code>0</code>-based index the managed object should be inserted at; for a negative
	 *            value <code>iIndex</code>, <code>oObject</code> is inserted at position 0; for a value
	 *            greater than the current size of the aggregation, <code>oObject</code> is inserted at
	 *            the last position
	 * @param {boolean}
	 *            [bSuppressInvalidate] if true, this ManagedObject as well as the added child are not marked as changed
	 * @returns {this} Returns <code>this</code> to allow method chaining
	 * @protected
	 */
	WebComponent.prototype.insertAggregation = function(sAggregationName, oObject, iIndex, bSuppressInvalidate) {
		var vResult = HTMLElement.prototype.insertAggregation.apply(this, arguments);
		this._setSlot(oObject, sAggregationName);
		return vResult;
	};

	/**
	 * Set the slot for each newly added child control, based on its aggregation
	 *
	 * @override
	 * @param {string}
	 *            sAggregationName the string identifying the aggregation that <code>oObject</code> should be added to.
	 * @param {sap.ui.base.ManagedObject}
	 *            oObject the object to add; if empty, nothing is added
	 * @param {boolean}
	 *            [bSuppressInvalidate] if true, this ManagedObject as well as the added child are not marked as changed
	 * @returns {this} Returns <code>this</code> to allow method chaining
	 * @protected
	 */
	WebComponent.prototype.addAggregation = function(sAggregationName, oObject, bSuppressInvalidate) {
		var vResult = HTMLElement.prototype.addAggregation.apply(this, arguments);
		this._setSlot(oObject, sAggregationName);
		return vResult;
	};

	/**
	 * Remove the slot for each removed child control
	 *
	 * @override
	 * @param {string}
	 *            sAggregationName the string identifying the aggregation that the given object should be removed from
	 * @param {int | string | sap.ui.base.ManagedObject}
	 *            vObject the position or ID of the ManagedObject that should be removed or that ManagedObject itself;
	 *            if <code>vObject</code> is invalid, a negative value or a value greater or equal than the current size
	 *            of the aggregation, nothing is removed.
	 * @param {boolean}
	 *            [bSuppressInvalidate] if true, this ManagedObject is not marked as changed
	 * @returns {sap.ui.base.ManagedObject|null} the removed object or <code>null</code>
	 * @protected
	 */
	WebComponent.prototype.removeAggregation = function(sAggregationName, vObject, bSuppressInvalidate) {
		var oChild = HTMLElement.prototype.removeAggregation.apply(this, arguments);
		this._unsetSlot(oChild);
		return oChild;
	};

	/**
	 * Remove the slot for each removed child control
	 *
	 * @override
	 * @param {string} sAggregationName
	 *   Name of the aggregation to remove all objects from
	 * @param {boolean} [bSuppressInvalidate=false]
	 *   If true, this <code>ManagedObject</code> is not marked as changed
	 * @returns {sap.ui.base.ManagedObject[]} An array of the removed elements (might be empty)
	 * @protected
	 */
	WebComponent.prototype.removeAllAggregation = function(sAggregationName, bSuppressInvalidate) {
		var aChildren = HTMLElement.prototype.removeAllAggregation.apply(this, arguments);
		aChildren.forEach(function(oChild) {
			this._unsetSlot(oChild);
		}, this);

		return aChildren;
	};

	/**
	 * @private
	 */
	WebComponent.prototype._onAfterRenderingDelegate = function() {
		// TODO: Make super call?
		this._attachCustomEventsListeners();
		var oDomRef = this.getDomRef();
		this._updateObjectProperties(oDomRef);
		// ----
		window.customElements.whenDefined(oDomRef.localName).then(function() {
			if (typeof oDomRef.attachInvalidate === "function") {
				oDomRef.attachInvalidate(this.__onInvalidation);
			}

			if (oDomRef._individualSlot) {
				this.__slot = oDomRef._individualSlot; // If the component creates individual slots for children, f.e. columns-3 or default-1, update the __slot property, otherwise RenderManager will set the normal slot name, f.e. columns or ""
			}
		}.bind(this));
	};

	WebComponent.prototype.setBusy = function(bBusy) {
		var bCurrentBusyState = this.getBusy();

		this.setProperty("busy", bBusy, true);

		if (bCurrentBusyState !== bBusy) {
			if (bBusy) {
				this.__busyIndicatorTimeout = setTimeout(function() {
					this.setProperty("__isBusy", bBusy);
				}.bind(this), this.getBusyIndicatorDelay());
			} else {
				this.setProperty("__isBusy", bBusy);
				clearTimeout(this.__busyIndicatorTimeout);
			}
		}

		return this;
	};

	/**
	 * Synchronize user-controlled properties (such as checked, value)
	 * @param {object} oChangeInfo the change information object
	 * @private
	 */
	WebComponent.prototype.__onInvalidation = function(oChangeInfo) {
		if (oChangeInfo.type === "property") {
			var sPropName = oChangeInfo.name;
			var vNewValue = oChangeInfo.newValue;
			var oPropData = this.getMetadata().getProperty(sPropName);
			if (oPropData) {
				// some properties might need to parse a value before synchronizing it from webc level to ui5-control level
				// refer to the WebComponentRenderer for the formatting part.
				if (oPropData._fnMappingParser) {
					vNewValue = this[oPropData._fnMappingParser](vNewValue);
				}
				this.setProperty(sPropName, vNewValue, true); // must suppress invalidation as this is intended to only sync the managed object state, not to trigger a rerender
			}
		}
	};

	WebComponent.prototype.destroy = function() {
		var oDomRef = this.getDomRef();
		if (oDomRef && typeof oDomRef.detachInvalidate === "function") {
			oDomRef.detachInvalidate(this.__onInvalidation);
		}

		return HTMLElement.prototype.destroy.apply(this, arguments);
	};

	/**
	 * Maps the "valueState" property from "sap.ui.core.ValueState" to
	 * the corresponding web component values.
	 * @param {sap.ui.core.ValueState} sValueState the original core value state
	 * @returns {string} the mapped ValueState values
	 * @private
	 * @since 1.132
	 */
	WebComponent.prototype._mapValueState = function(sValueState) {
		return webcValueStateMapping[sValueState];
	};

	/**
	 * Parses a web component value state string into the "sap.ui.core.ValueState" representation.
	 * @param {string} sWebCValueState the web component's value state (refer to the maps at the top of this module)
	 * @returns {sap.ui.core.ValueState} the value state in core representation
	 * @private
	 * @since 1.132
	 */
	WebComponent.prototype._parseValueState = function(sWebCValueState) {
		return coreValueStateMapping[sWebCValueState];
	};

	return WebComponent;
});
