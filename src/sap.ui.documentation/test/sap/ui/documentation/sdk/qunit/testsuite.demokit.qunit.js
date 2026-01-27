sap.ui.define(function () {

	"use strict";
	return {
		name: "Demo Kit in sap.ui.documentation",
		defaults: {
			qunit: {
				version: 2
			},
			module: "test-resources/sap/ui/documentation/sdk/integration/{name}.qunit",
			ui5: {
				language: "en",
				libs: "sap.m",
				animation: "false",
				compatVersion: "edge"
			}
		},

		tests: {
			"opaTestsWithComponent": {
				group: "Integration Tests",
				title: "Opa test using an embedded Component"
			},
			"opaTestsWithIFrame": {
				group: "Integration Tests",
				title: "Opa test using an IFrame",
				ui5: {
					frameOptions: 'deny'
				}
			}
		}
	};
});
