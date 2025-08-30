/*!
 * ${copyright}
 */
sap.ui.define(function() {
	"use strict";
	return {
		name: "Analytics",
		defaults: {
			qunit: {
				version : "2.18",
				versions : {
					"2.18" : {
						module : "test-resources/sap/ui/core/qunit/thirdparty/qunit-2.18",
						css : "test-resources/sap/ui/core/qunit/thirdparty/qunit-2.18.css"
					}
				}
			},
			loader: {
				paths: {
					"sap/ui/core/qunit/analytics": "test-resources/sap/ui/core/qunit/analytics"
				}
			}
		},
		tests: {
			AnalyticalBinding: {
				coverage : {
					only : "sap/ui/model/analytics/"
				},
				title: "sap.ui.model.analytics.AnalyticalBinding - QUnit Tests"
			},
			AnalyticalTreeBindingAdapter: {
				title: "sap.ui.model.analytics.AnalyticalTreeBindingAdapter - QUnit Tests"
			},
			ODataModelAdapter: {
				title: "sap.ui.model.analytics.ODataModelAdapter - QUnit Tests"
			},
			odata4analytics: {
				coverage : {
					only : "sap/ui/model/analytics/"
				},
				title: "sap.ui.model.analytics.odata4analytics - QUnit Tests"
			}
		}
	};
});
