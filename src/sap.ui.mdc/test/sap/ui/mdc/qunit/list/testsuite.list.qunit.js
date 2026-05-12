sap.ui.define(function() {
	"use strict";

	return {
		name: "Library 'sap.ui.mdc' - Testsuite List",
		defaults: {
			qunit: {
				version: 2,
				reorder: false
			},
			sinon: {
				version: 4
			},
			ui5: {
				theme: "sap_horizon",
				rtl: false,
				libs: [
					"sap.ui.mdc"
				],
				"xx-waitForTheme": true
			},
			coverage: {
				only: "[sap/ui/mdc]",
				never: "[sap/ui/mdc/qunit]",
				branchCoverage: true
			},
			loader: {
				paths: {
					"delegates": "test-resources/sap/ui/mdc/delegates",
					"sap/ui/demo/mock": "test-resources/sap/ui/documentation/sdk/"
				}
			},
			page: "test-resources/sap/ui/mdc/qunit/teststarter.qunit.html?testsuite={suite}&test={name}",
			autostart: true,
			module: "./{name}.qunit"
		},
		tests: {
			"List": {
				group: "Controls",
				ui5: {
					libs: [
						"sap.f", "sap.m", "sap.ui.fl", "sap.ui.mdc"
					]
				},
				coverage: {
					only: ["sap/ui/mdc/List", "sap/ui/mdc/ListDelegate", "sap/ui/mdc/list", "sap/ui/mdc/enums/ListP13nMode"]
				}
			},
			"ListTypeBase": {
				group: "List types",
				ui5: {
					libs: ["sap.f", "sap.m", "sap.ui.mdc"]
				},
				coverage: {
					only: ["sap/ui/mdc/list/ListTypeBase", "sap/ui/mdc/list/GridListType", "sap/ui/mdc/list/ListType"]
				}
			},
			"DragDropConfig": {
				group: "List types",
				ui5: {
					libs: ["sap.f", "sap.m", "sap.ui.mdc"]
				},
				coverage: {
					only: ["sap/ui/mdc/list/DragDropConfig"]
				}
			}
		}
	};
});
