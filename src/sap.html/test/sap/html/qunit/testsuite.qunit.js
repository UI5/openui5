sap.ui.define(function () {
	"use strict";
	return {
		name: "QUnit TestSuite for sap.html",
		defaults: {
			group: "Default",
			qunit: {
				version: 2
			},
			sinon: {
				version: 4
			},
			ui5: {
				language: "en",
				rtl: false,
				libs: ["sap.html"],
				"xx-waitForTheme": "init"
			},
			coverage: {
				only: ["sap/html"]
			}
		},
		tests: {
			Rendering: {
				title: "sap.html - Instantiation & DOM rendering"
			},
			Composition: {
				title: "sap.html - Composition & data binding"
			},
			Validation: {
				title: "sap.html - Restrictions & error handling"
			}
		}
	};
});

