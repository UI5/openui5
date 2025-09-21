/*global QUnit, requirejs */
(function() {
	"use strict";

	QUnit.config.autostart = false;

	const otherDefine = window.define;
	const otherRequire = window.require;
	requirejs.config({baseUrl: './'});

	globalThis.fnInit = function() {
		QUnit.module("Bootstrap config");

		QUnit.test("Expose loader via bootstrap attribute", function(assert) {
			const done = assert.async();
			sap.ui.loader.config({
				baseUrl: "./"
			});
			var privateLoaderAPI = sap.ui.loader._;

			assert.notStrictEqual(window.require, otherRequire, "global require should have changed");
			assert.notStrictEqual(window.define, otherDefine, "global define should have changed");
			assert.strictEqual(window.require, privateLoaderAPI.amdRequire, "global require should be the UI5 implementation");
			assert.strictEqual(window.define, privateLoaderAPI.amdDefine, "global define should be the UI5 implementation");

			// hide UI5 implementation again
			sap.ui.loader.config({
				amd: false
			});

			assert.strictEqual(window.require, otherRequire, "global require should be the 'other' loader's implementation again");
			assert.strictEqual(window.define, otherDefine, "global define should be the 'other' loader's implementation again");

			done();
		});

		QUnit.start();
	};
}());
