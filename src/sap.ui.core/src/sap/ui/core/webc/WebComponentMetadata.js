/*!
 * ${copyright}
 */

// Provides class sap.ui.core.webc.WebComponentMetadata
sap.ui.define([
	"../html/HTMLElementMetadata",
	"../html/HTMLElementRenderer"
],
function(HTMLElementMetadata, WebComponentRenderer) {
	"use strict";

	/**
	 * Creates a new metadata object for a WebComponent Wrapper subclass.
	 *
	 * @param {string} sClassName fully qualified name of the class that is described by this metadata object
	 * @param {object} oClassInfo static info to construct the metadata from
	 *
	 * @class
	 * @author SAP SE
	 * @version ${version}
	 * @since 1.138.0
	 * @alias sap.ui.core.webc.WebComponentMetadata
	 * @extends sap.ui.core.html.HTMLElementMetadata
	 * @public
	 */
	var WebComponentMetadata = function(sClassName, oClassInfo) {
		// call super constructor
		HTMLElementMetadata.apply(this, arguments);
	};

	//chain the prototypes
	WebComponentMetadata.prototype = Object.create(HTMLElementMetadata.prototype);
	WebComponentMetadata.prototype.constructor = WebComponentMetadata;

	/**
	 * Returns the slot to be assigned to a particular aggregation's items.
	 *
	 * @param {string} sAggregationName The name of the aggregation.
	 * @returns {string|undefined} The slot assigned to the aggregation's items, or undefined if not found.
	 * @private
	 */
	WebComponentMetadata.prototype.getAggregationSlot = function(sAggregationName) {
		var oAggregation = this._mAllAggregations[sAggregationName];
		return oAggregation ? oAggregation._sSlot : undefined;
	};

	/**
	 * Returns the renderer for the described web component class.
	 *
	 * <b>Note:</b> This always returns the default renderer. Web Component wrappers must not define custom renderers.
	 *
	 * @returns {object} The default renderer instance.
	 * @public
	 */
	WebComponentMetadata.prototype.getRenderer = function() {
		if (this._oRenderer) {
			return this._oRenderer;
		}

		return WebComponentRenderer;
	};

	return WebComponentMetadata;

});
