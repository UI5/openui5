/*!
 * ${copyright}
 */

// Provides the Design Time Metadata for the sap.ui.core.mvc.XMLView control
sap.ui.define([],
	function() {
	"use strict";

	return {
		aggregations : {
			content : {
				domRef : ":sap-domref"
			}
		},
		// These actions are available by default, but are not relevant for this control, so they must be explicitly disabled
		actions: {
			extendController: null,
			addXML: null
		}
	};

});