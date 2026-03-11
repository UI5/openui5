sap.ui.define(function () {
	"use strict";

	return {
		name: "Opa sample for table actions with keydown/keyup and right-click",
		defaults: {
			page: "ui5://test-resources/appUnderTest/Test.qunit.html?testsuite={suite}&test={name}",
			qunit: {
				version: 2
			},
			sinon: {
				version: 1
			},
			ui5: {
				theme: "sap_horizon"
			},
			loader: {
				paths: {
					"appUnderTest" : "./applicationUnderTest"
				}
			}
		},
		tests: {
			"Opa": {
				title: "Opa sample for table actions with keydown/keyup and right-click"
			}
		}
	};
});
