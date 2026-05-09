sap.ui.define(function() {

	"use strict";
	return {
		name: "TestSuite for sap.ui.core: GTP testcase CORE/CORE",
		defaults: {
			loader:{
				shim: {
					"test-resources/sap/ui/core/qunit/thirdparty/qunit-2.18": {
						amd: true,
						exports: "QUnit"
					}
				},
				paths:{
					"testdata/core": "test-resources/sap/ui/core/qunit/"
				}
			},
			qunit: {
				versions : {
					"2.18" : {
						module : "test-resources/sap/ui/core/qunit/thirdparty/qunit-2.18",
						css : "test-resources/sap/ui/core/qunit/thirdparty/qunit-2.18.css"
					}
				},
				version: 2
			},
			sinon: {
				// the tests in this suite use the sinon-qunit-bridge also for sinon 1
				versions: {
					1: {
						bridge: "sap/ui/qunit/sinon-qunit-bridge"
					},
					"14.0" : {
						module : "test-resources/sap/ui/core/qunit/thirdparty/sinon-14.0",
						bridge : "sap/ui/qunit/sinon-qunit-bridge"
					}
				},
				version: 4
			}
		},
		tests: {
			baseuri: {
				title: "sap.ui.thirdparty.baseuri",
				bootCore: false
			},

			ContextMenuSupport: {
				title: "sap.ui.core.ContextMenuSupport"
			},

			JSON: {
				title: "sap.ui.core: JSON Native Support",
				ui5: {
					libs: "sap.m"
				}
			},

			QUnit2: {
				title: "QUnit tests: General QUnit 2 checks"
			},

			QUnit2NestedModules: {
				title: "sap.ui.core: QUnit 2 nested modules",
				sinon: {
					// FIXME: Doesn't work with nested modules
					qunitBridge: false
				}
			},

			SinonJS: {
				title: "sap.ui.thirdparty.sinon: Support",
				ui5: {
					libs: "sap.m"
				},
				sinon: {
					version: 1, // sinon 1 itself is tested
					qunitBridge: true
				}
			},

			Sinon1QUnit2Bridge: {
				qunit: 2,
				sinon: 1,
				module: "test-resources/sap/ui/core/qunit/internal/SinonQunitBridge.qunit"
			},

			Sinon4QUnit2Bridge: {
				qunit: 2,
				sinon: 4,
				module: "test-resources/sap/ui/core/qunit/internal/SinonQunitBridge.qunit"
			},

			"Sinon14.0QUnit2.18Bridge": {
				qunit: {
					version: "2.18"
				},
				sinon: {
					version: "14.0"
				},
				module: "test-resources/sap/ui/core/qunit/internal/SinonQunitBridge.qunit"
			},

			Hyphenation: {
				title: "sap.ui.core.hyphenation.Hyphenation"
			}
		}
	};
});
