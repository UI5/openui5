sap.ui.define(function() {

	"use strict";
	return {
		name: "TestSuite for sap.ui.core: GTP testcase CORE/GENERIC",
		defaults: {
			qunit: {
				version: 2,
				reorder: false
			}
		},
		tests: {
			ControlIterator: {
				title: "QUnit Page for sap.ui.qunit.utils.ControlIterator",
				ui5: {
					"xx-supportedLanguages": "en"
				},
				// tests are created async with the ControlIterator, so the test has to start QUnit
				autostart: false
			},
			ControlIteratorExample: {
				title: "QUnit Page for sap.ui.qunit.utils.ControlIterator - most basic usage (example 1: one test per control)",
				// tests are added asynchronously, hence autostart is disabled and QUnit.start is called later
				autostart: false
			},
			ControlIteratorExample2: {
				title: "QUnit Page for sap.ui.qunit.utils.ControlIterator - most basic usage (example 2: all controls within one test)"
			},
			ControlMemoryLeaks: {
				title: "QUnit Page for memory leak detection in UI5 controls"
			},
			/**
			 * @deprecated As of version 1.120
			 */
			ControlRenderer: {
				title: "QUnit Page for memory leak detection in UI5 controls"
			},
			ControlMemoryLeaksUsingIterator: {
				title: "QUnit Page for memory leak detection in UI5 controls",
				// tests are added asynchronously, hence autostart is disabled and QUnit.start is called later
				autostart: false
			},
			DuplicateIdCheck: {
				title: "QUnit Page for duplicate ID issues detection in UI5 controls",
				ui5: {
					// preload some libraries upfront to avoid individual requests, e.g. sap/m/Text -> sap/m/library
					// as those prevent a later preload of sap.m
					libs: "sap.m, sap.ui.commons"
				}
			},
			SettersContextReturn: {
				title: "All setters should return correct context (Reason: https://github.com/UI5/openui5/blob/master/docs/guidelines.md#creating-classes)",
				ui5: {
					// preload some libraries upfront to avoid individual requests, e.g. sap/m/Text -> sap/m/library
					// as those prevent a later preload of sap.m
					// also preload sap.chart as sap.ui.comp otherwise loads it lazily when attachInitialize is called by the test
					libs: "sap.m, sap.chart"
				}
			}
		}
	};
});