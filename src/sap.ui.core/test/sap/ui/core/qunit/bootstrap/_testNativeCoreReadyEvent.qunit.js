/*global QUnit */
sap.ui.define([], function () {
	"use strict";

	QUnit.test("initModule: Check for custom event 'sap-ui-core-ready' of Core", function(assert) {
		 assert.ok(globalThis.__ui5CoreReady, "Custom event 'sap-ui-core-ready' has been fired");
	});
});
