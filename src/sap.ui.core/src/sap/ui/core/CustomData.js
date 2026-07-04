/*!
 * ${copyright}
 */

// Provides element sap.ui.core.CustomData.
sap.ui.define([
	'./Element'
], function(Element) {
	"use strict";

	const CustomData = Element.getMetadata().getAggregation("customData").defaultClass;

	return CustomData;

});