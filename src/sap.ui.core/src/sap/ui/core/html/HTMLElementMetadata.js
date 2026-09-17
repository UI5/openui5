/*!
 * ${copyright}
 */

// Provides class sap.ui.core.html.HTMLElementMetadata
sap.ui.define([
	"../ElementMetadata",
	"./HTMLElementRenderer",
	"sap/base/strings/camelize",
	"sap/base/strings/hyphenate"
],
function(ElementMetadata, HTMLElementRenderer, camelize, hyphenate) {
	"use strict";

	const MAPPING_TYPES = ["property", "style", "textContent", "slot", "none"];

	/**
	 * Creates a new metadata object for a HTMLElement subclass.
	 *
	 * @param {string} sClassName fully qualified name of the class that is described by this metadata object
	 * @param {object} oClassInfo static info to construct the metadata from
	 *
	 * @class
	 * @author SAP SE
	 * @version ${version}
	 * @since 1.154.0
	 * @alias sap.ui.core.html.HTMLElementMetadata
	 * @extends sap.ui.core.ElementMetadata
	 * @public
	 */
	const HTMLElementMetadata = function(sClassName, oClassInfo) {
		// call super constructor
		ElementMetadata.apply(this, arguments);
	};

	//chain the prototypes
	HTMLElementMetadata.prototype = Object.create(ElementMetadata.prototype);
	HTMLElementMetadata.prototype.constructor = HTMLElementMetadata;

	// mapping validation function
	const fnValidateType = function (sType) {
		return MAPPING_TYPES.includes(sType) ? sType : MAPPING_TYPES[0];
	};

	// Enrich property factory
	const OriginalProperty = ElementMetadata.prototype.metaFactoryProperty;
	const HTMLElementProperty = function(oClass, name, info) {
		OriginalProperty.apply(this, arguments);

		if (!info.mapping || typeof info.mapping === "string") {
			this._sMapping = fnValidateType(info.mapping);
		} else if (typeof info.mapping === "object") {
			this._sMapping = fnValidateType(info.mapping.type);
			this._sMapTo = info.mapping.to;
			this._sSlotName = info.mapping.slotName;
			this._fnMappingFormatter = info.mapping.formatter;
			this._fnMappingParser = info.mapping.parser;
		}
	};
	HTMLElementProperty.prototype = Object.create(OriginalProperty.prototype);
	HTMLElementProperty.prototype.constructor = HTMLElementProperty;
	HTMLElementMetadata.prototype.metaFactoryProperty = HTMLElementProperty;

	// Enrich aggregation factory
	const OriginalAggregation = ElementMetadata.prototype.metaFactoryAggregation;
	const HTMLElementAggregation = function(oClass, name, info) {
		OriginalAggregation.apply(this, arguments);
		this._sSlot = info.slot || "";
	};
	HTMLElementAggregation.prototype = Object.create(OriginalAggregation.prototype);
	HTMLElementAggregation.prototype.constructor = HTMLElementAggregation;
	HTMLElementMetadata.prototype.metaFactoryAggregation = HTMLElementAggregation;

	// Enrich association factory
	const OriginalAssociation = ElementMetadata.prototype.metaFactoryAssociation;
	const HTMLElementAssociation = function(oClass, name, info) {
		OriginalAssociation.apply(this, arguments);
		if (!info.mapping || typeof info.mapping !== "object") {
			this._sMapping = ""; // For associations, "mapping" must be an object, because "to" is required
		} else {
			this._sMapping = "property"; // Associations map only to properties, no matter what is set, it's always "property" mapping
			this._sMapTo = info.mapping.to; // The property, to which the association is related
			this._fnMappingFormatter = info.mapping.formatter;
			this._fnMappingParser = info.mapping.parser;
		}
	};
	HTMLElementAssociation.prototype = Object.create(OriginalAssociation.prototype);
	HTMLElementAssociation.prototype.constructor = HTMLElementAssociation;
	HTMLElementMetadata.prototype.metaFactoryAssociation = HTMLElementAssociation;

	// Enrich event factory
	const OriginalEvent = ElementMetadata.prototype.metaFactoryEvent;
	const HTMLElementEvent = function(oClass, name, info) {
		OriginalEvent.apply(this, arguments);
		if (info.mapping) {
			this._sMapTo = info.mapping.to;
		}
		this._sCustomEventName = this._sMapTo ? this._sMapTo : hyphenate(name); // Create the custom event name from the mapping or the event name itself (then hyphenated)
	};
	HTMLElementEvent.prototype = Object.create(OriginalEvent.prototype);
	HTMLElementEvent.prototype.constructor = HTMLElementEvent;
	HTMLElementMetadata.prototype.metaFactoryEvent = HTMLElementEvent;

	HTMLElementMetadata.prototype.applySettings = function(oClassInfo) {
		const oStaticInfo = oClassInfo.metadata;

		this._sTag = oStaticInfo.tag;
		this._bVoid = !!oStaticInfo.void;
		this._aMethods = oStaticInfo.methods || [];
		this._aGetters = oStaticInfo.getters || [];

		ElementMetadata.prototype.applySettings.call(this, oClassInfo);
	};

	HTMLElementMetadata.prototype.generateAccessors = function() {
		ElementMetadata.prototype.generateAccessors.call(this);
		const proto = this.getClass().prototype;

		// Generate accessors for proxied public methods - only if not created explicitly already
		this._aMethods.forEach((name) => {
			if (!proto[name]) {
				proto[name] = function() {
					return this._callPublicMethod(name, arguments);
				};
			}
		});

		// Generate accessors for proxied public getters - only if not created explicitly already
		this._aGetters.forEach((name) => {
			const functionName = "get" + name.substr(0, 1).toUpperCase() + name.substr(1);
			if (!proto[functionName]) {
				proto[functionName] = function() {
					return this._callPublicGetter(name);
				};
			}
		});
	};

	/**
	 * Returns the tag used to render the Component Wrapper.
	 * @public
	 * @returns {string} The HTML tag name.
	 */
	HTMLElementMetadata.prototype.getTag = function() {
		return this._sTag;
	};

	/**
	 * Returns whether the HTML element is a void element.
	 * @returns {boolean} whether the HTML element is a void element
	 */
	HTMLElementMetadata.prototype.isVoid = function() {
		return this._bVoid;
	};

	/**
	 * Returns the list of public methods proxied by the Component Wrapper to the component itself.
	 * @public
	 * @returns {string[]} Array of method names.
	 */
	HTMLElementMetadata.prototype.getMethods = function() {
		return this._aMethods;
	};

	/**
	 * Returns the list of public getters proxied by the Component Wrapper to the component itself.
	 * @public
	 * @returns {string[]} Array of getter names.
	 */
	HTMLElementMetadata.prototype.getGetters = function() {
		return this._aGetters;
	};

	/**
	 * Determines whether the attribute corresponds to a managed property or association.
	 * @param {string} sAttr The attribute's name.
	 * @returns {boolean} True if the attribute is managed, otherwise false.
	 */
	HTMLElementMetadata.prototype.isManagedAttribute = function(sAttr) {
		const mProperties = this.getAllProperties();
		for (const propName in mProperties) {
			if (Object.hasOwn(mProperties, propName)) {
				const propData = mProperties[propName];
				if (propData._sMapping === "property" && (propData._sMapTo === sAttr || camelize(sAttr) === propName)) {
					return true;
				}
			}
		}

		const mAssociations = this.getAllAssociations();
		for (const sAssocName in mAssociations) {
			if (Object.hasOwn(mAssociations, sAssocName)) {
				const oAssocData = mAssociations[sAssocName];
				if (oAssocData._sMapping === "property" && oAssocData._sMapTo === camelize(sAttr)) {
					return true;
				}
			}
		}

		return false;
	};

	/**
	 * Returns a map containing all properties of a certain mapping type.
	 * @param {string} sMapping The mapping type.
	 * @returns {Object<string, object>} Map of all properties of the specified mapping type.
	 */
	HTMLElementMetadata.prototype.getPropertiesByMapping = function(sMapping) {
		if (!this._mPropertiesByMapping) {
			this._mPropertiesByMapping = Object.create(null);
		}
		if (this._mPropertiesByMapping[sMapping] !== undefined) {
			return this._mPropertiesByMapping[sMapping];
		}

		const mFiltered = {};
		const mProperties = this.getAllProperties();
		const mPrivateProperties = this.getAllPrivateProperties();
		for (const propName in mProperties) {
			if (Object.hasOwn(mProperties, propName)) {
				const propData = mProperties[propName];
				if (propData._sMapping === sMapping) {
					mFiltered[propName] = propData;
				}
			}
		}
		for (const propName in mPrivateProperties) {
			if (Object.hasOwn(mPrivateProperties, propName)) {
				const propData = mPrivateProperties[propName];
				if (propData._sMapping === sMapping) {
					mFiltered[propName] = propData;
				}
			}
		}

		this._mPropertiesByMapping[sMapping] = mFiltered;
		return mFiltered;
	};

	/**
	 * Returns a map of all associations that control properties (have mapping to properties).
	 * @returns {Object<string, object>} Map of all associations having mappings.
	 */
	HTMLElementMetadata.prototype.getAssociationsWithMapping = function() {
		const mFiltered = {};
		const mAssociations = this.getAllAssociations();
		for (const sAssocName in mAssociations) {
			if (Object.hasOwn(mAssociations, sAssocName)) {
				const oAssocData = mAssociations[sAssocName];
				if (oAssocData._sMapping) {
					mFiltered[sAssocName] = oAssocData;
				}
			}
		}

		return mFiltered;
	};

	/**
	 * Returns a map of all events that are custom events (have mapping to a custom event).
	 * @param {string} [sCustomEventName] If provided, only returns the event with this name.
	 * @returns {Object<string, object>} Map of custom events, where the key is the event name and the value is the event metadata object.
	 */
	HTMLElementMetadata.prototype.getCustomEvents = function(sCustomEventName) {
		const mFiltered = {};
		const mEvents = this.getAllEvents();
		for (const sEventName in mEvents) {
			const oEventObj = mEvents[sEventName];
			if (oEventObj._sCustomEventName) {
				if (!sCustomEventName || oEventObj._sCustomEventName === sCustomEventName) {
					mFiltered[sEventName] = oEventObj;
				}
			}
		}

		return mFiltered;
	};

	/**
	 * Retrieves the renderer for the described HTMLElement subclasses or web component class.
	 * <b>Note:</b> HTMLElement subclasses or Web Component wrappers must not define custom renderers.
	 * Returns the default HTMLElementRenderer.
	 * @returns {object} The default renderer instance.
	 * @public
	 */
	HTMLElementMetadata.prototype.getRenderer = function() {
		return HTMLElementRenderer;
	};

	return HTMLElementMetadata;

});
