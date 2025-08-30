sap.ui.define(function() {
	"use strict";

	return {
		name : "TestSuite for MockServer",
		defaults : {
			qunit : {
				version : "2.18",
				versions : {
					"2.18" : {
						module : "test-resources/sap/ui/core/qunit/thirdparty/qunit-2.18",
						css : "test-resources/sap/ui/core/qunit/thirdparty/qunit-2.18.css"
					}
				}
			},
			sinon : {
				version : 4,
				qunitBridge : true,
				useFakeTimers : false
			}
		},
		tests : {
			// run tests twice with sinon 1 and sinon 4
			// sinon 1 tests (for legacy compatibility)
			MockServer1 : {
				title : "Tests for sap/ui/core/util/MockServer (Sinon 1)",
				module : "./MockServer.qunit",
				sinon : {
					version : 1
				},
				ui5 : {
					libs : ["sap.m"]
				}
			},
			MockServerFeature1 : {
				title : "Tests for sap/ui/core/util/Mockserver: given data and complex filter features (Sinon 1)",
				module : "./MockServerFeature.qunit",
				sinon : {
					version : 1
				}
			},
			MockServerAPF1 : {
				title : "Tests for sap/ui/core/util/MockServer: APF model (Sinon 1)",
				module : "./MockServerAPF.qunit",
				sinon : {
					version: 1
				}
			},
			DraftEnabledMockServer1 : {
				title : "Tests for sap/ui/core/util/DraftEnabledMockServer (Sinon 1)",
				module : "./DraftEnabledMockServer.qunit",
				sinon : {
					version : 1
				}
			},

			// sinon 4 tests (default)
			MockServer4 : {
				title : "Tests for sap/ui/core/util/MockServer (Sinon 4)",
				module : "./MockServer.qunit",
				ui5 : {
					libs : ["sap.m"]
				}
			},
			MockServerFeature4 : {
				title : "Tests for sap/ui/core/util/Mockserver: given data and complex filter features (Sinon 4)",
				module : "./MockServerFeature.qunit"
			},
			MockServerAPF4 : {
				title : "Tests for sap/ui/core/util/MockServer: APF model (Sinon 4)",
				module : "./MockServerAPF.qunit"
			},
			DraftEnabledMockServer4 : {
				title : "Tests for sap/ui/core/util/DraftEnabledMockServer (Sinon 4)",
				module : "./DraftEnabledMockServer.qunit"
			}
		}
	};
});
