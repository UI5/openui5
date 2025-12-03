/*!
 * ${copyright}
 */

/* global QUnit */

sap.ui.require([
	"sap/ui/test/Opa5",
	"test-resources/sap/ui/mdc/testutils/opa/TestLibrary", // Adds public OPA page objects of all controls
	"test-resources/sap/ui/mdc/qunit/table/OpaTests/pages/TestObjects" // Adds private OPA page objects for table test apps
], function(
	Opa5
) {
	"use strict";

	const oUrlParams = new URLSearchParams(window.location.search);
	const sApp = oUrlParams.get("app");
	const sJourney = oUrlParams.get("journey");

	Opa5.extendConfig({
		viewNamespace: `sap.ui.mdc.table.OpaTests.${sApp}.`,
		viewName: "View",
		autoWait: true,
		async: true,
		timeout: 30,
		debugTimeout: 30,
		pollingInterval: 10,
		appParams: {
			"sap-ui-animation": false
		}
	});

	QUnit.moduleStart(function() {
		// Async hooks are not supported in the used QUnit version (2.3.2). As soon as it is available, ExportJourney can be adjusted.
		return new Opa5().iStartMyAppInAFrame({
			source: `test-resources/sap/ui/mdc/qunit/table/OpaTests/${sApp}/index.html`,
			autoWait: true,
			width: 1024,
			height: 720
		});
	});

	QUnit.moduleDone(function() {
		return new Opa5().iTeardownMyApp();
	});

	QUnit.done(function() {
		// After the final module, Opa's queue is empty and automatic execution is stopped. This hook is called afterwards, so the teardown is added
		// to the empty queue. Execution of this queue needs to be started manually.
		return Opa5.emptyQueue();
	});

	sap.ui.require([
		`test-resources/sap/ui/mdc/qunit/table/OpaTests/${sApp}/test/${sJourney}`
	], function(oAppParams) {
		Opa5.extendConfig({
			appParams: oAppParams
		});
		QUnit.start();
	});
});