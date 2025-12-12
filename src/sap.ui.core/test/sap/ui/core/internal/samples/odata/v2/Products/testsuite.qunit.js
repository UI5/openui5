sap.ui.define(function () {
	"use strict";

	return {
		name : "QUnit test suite for EPM Products",
		defaults : {
			qunit : {
				versions : {
					"2.18" : {
						module : "test-resources/sap/ui/core/qunit/thirdparty/qunit-2.18",
						css : "test-resources/sap/ui/core/qunit/thirdparty/qunit-2.18.css"
					}
				},
				version : "2.18",
				reorder : false
			},
			sinon : {
				versions : {
					"14.0" : {
						module : "test-resources/sap/ui/core/qunit/thirdparty/sinon-14.0",
						bridge : "sap/ui/qunit/sinon-qunit-bridge"
					}
				},
				version : "14.0",
				qunitBridge : true,
				useFakeTimers : false
			},
			ui5 : {
				language : "en-US",
				onInit : "module:sap/ui/core/internal/samples/odata/v2/Products/FakeServer"
			}
		},
		tests : {
			"OPA.Products" : {
				autostart : false,
				module : ["test-resources/sap/ui/core/internal/samples/odata/v2/Products/Opa.qunit"],
				loader : {
					paths : {
						"sap/ui/core/internal/samples/odata/v2/Products" : "/test-resources/sap/ui/core/internal/samples/odata/v2/Products"
					}
				},
				title : "OPA test sap.ui.core.internal.samples.odata.v2.Products",
				ui5 : {
					language : "en-US"
				}
			}
		}
	};
});
