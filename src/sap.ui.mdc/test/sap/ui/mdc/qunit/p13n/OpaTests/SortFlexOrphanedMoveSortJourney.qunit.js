/*!
 * ${copyright}
 */
/* global QUnit */
QUnit.config.autostart = false;

sap.ui.define([
	"sap/ui/test/Opa5",
	"test-resources/sap/ui/mdc/testutils/opa/TestLibrary"
], function(Opa5) {
	"use strict";

	Opa5.extendConfig({
		autoWait: true,
		timeout: 45,
		appParams: {
			"sap-ui-animation": false
		}
	});

	sap.ui.require([
		"test-resources/sap/ui/mdc/qunit/p13n/OpaTests/SortFlexOrphanedMoveSortJourney"
	], function(fnJourney) {
		fnJourney();
		QUnit.start();
	});
});
