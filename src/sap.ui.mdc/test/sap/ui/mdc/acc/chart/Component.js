/*!
 * ${copyright}
 */

/**
 * @fileOverview Application component to display information on entities from the TEA_BUSI OData service.
 * @version
 * @version@
 */
sap.ui.define([
	'sap/ui/core/mvc/View',
	'sap/ui/core/mvc/ViewType',
	'sap/ui/core/UIComponent',
	'sap/ui/model/odata/v2/ODataModel',
	'sap/ui/core/util/MockServer'
], function(
	View,
	ViewType,
	UIComponent,
	ODataModel,
	MockServer
) {
	"use strict";

	var Component = UIComponent.extend("sap.ui.mdc.acc.chart.Component", {
		metadata: {
			manifest: "json"
		},
		exit: function() {
		},

		init: function() {
			UIComponent.prototype.init.apply(this, arguments);
		},
		config: {
			sample: {
				stretch: true,
				files: [
					"Chart.view.xml", "Chart.controller.js"
				]
			}
		}
	});

	return Component;
});
