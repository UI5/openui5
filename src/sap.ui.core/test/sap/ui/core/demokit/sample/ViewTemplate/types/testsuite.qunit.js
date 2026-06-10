sap.ui.define(function () {
	"use strict";

	return {
		name : "QUnit test suite for ViewTemplate Types",
		defaults : {
			qunit : {
				version : 2,
				reorder : false
			},
			sinon : {
				version : 4,
				qunitBridge : true,
				useFakeTimers : false
			},
			ui5 : {
				language : "en-US"
			}
		},
		tests : {
			"OPA.ViewTemplate.Types" : {
				module : ["test-resources/sap/ui/core/demokit/sample/ViewTemplate/types/Opa.qunit"],
				loader : {
					paths : {
						"sap/ui/core/sample" : "/test-resources/sap/ui/core/demokit/sample"
					}
				},
				title : "OPA test sap.ui.core.sample.ViewTemplate.types"
			}
		}
	};
});
