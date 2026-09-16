sap.ui.define(function() {

	"use strict";

	return {
		name: "TestSuite for sap.ui.core.html",
		defaults: {
			qunit: {
				version: 2
			},
			sinon: {
				version: 4
			},
			loader:{
				paths:{
					"html": "test-resources/sap/ui/core/qunit/html/"
				}
			},
			module: "test-resources/sap/ui/core/qunit/html/{name}.qunit"
		},
		tests: {
			HTMLElement: {
				title: "sap.ui.core.html.HTMLElement",
				coverage: {
					only: ["sap/ui/core/html"]
				}
			}
		}
	};
});
