sap.ui.define(function () {
	"use strict";

	return {
		name : "QUnit test suite for Currency and unit amount in two fields",
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
			"OPA.TwoFields" : {
				autostart : false,
				module : ["test-resources/sap/ui/core/internal/samples/odata/twoFields/Opa.qunit"],
				loader : {
					paths : {
						"sap/ui/core/sample" : "/test-resources/sap/ui/core/demokit/sample",
						"sap/ui/core/internal/samples" : "/test-resources/sap/ui/core/internal/samples"
					}
				},
				title : "OPA test sap.ui.core.internal.samples.odata.twoFields",
				ui5 : {
					language : "en-US"
				}
			}
		}
	};
});

