sap.ui.define([], function() {

	"use strict";

	const mConfig = {
		name: "Library 'sap.ui.mdc' - Testsuite Geomap",	/* Just for a nice title on the pages */
		defaults: {
			group: "Geomap",
			qunit: {
				version: 2					// Whether QUnit should be loaded and if so, what version
			},
			sinon: {
				version: 4					// Whether Sinon should be loaded and if so, what version
			},
			ui5: {
				language: "en-US",
				rtl: false,					// Whether to run the tests in RTL mode
				libs: ["sap.ui.mdc"],		// Libraries to load upfront in addition to the library which is tested (sap.ui.mdc), if null no libs are loaded
				"xx-waitForTheme": true		// Whether the start of the test should be delayed until the theme is applied
			},
			coverage: {
				only: "[sap/ui/mdc]",	// Which files to show in the coverage report, if null, no files are excluded from coverage
				never: "[sap/ui/mdc/qunit]",
				branchCoverage: true		// Whether to enable standard branch coverage
			},
			loader: {
				paths: {
					"sap/ui/mdc/qunit/geomap": "test-resources/sap/ui/mdc/qunit/geomap",
					"delegates": "test-resources/sap/ui/mdc/delegates"
				}
			},
			page: "test-resources/sap/ui/mdc/qunit/teststarter.qunit.html?testsuite={suite}&test={name}",
			autostart: true
		},
		tests: {
			"Geomap": {
				module: "./Geomap.qunit",
				/*coverage: {
						only: "[sap/ui/mdc/geomap]"
				},*/
				sinon: {
					qunitBridge: true
				}
			}
		}
	};
	return mConfig;
});
