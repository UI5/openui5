sap.ui.define(function () {
	"use strict";

	return {
		name : "QUnit test suite for ViewTemplate Types",
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
				language : "en-US"
			}
		},
		tests : {
			"OPA.ViewTemplate.Types" : {
				autostart : false,
				module : ["test-resources/sap/ui/core/demokit/sample/ViewTemplate/types/Opa.qunit"],
				loader : {
					paths : {
						"sap/ui/core/sample" : "/test-resources/sap/ui/core/demokit/sample"
					}
				},
				title : "OPA test sap.ui.core.sample.ViewTemplate.types",
				ui5 : {
					language : "en-US"
				}
			}
		}
	};
});
