/* global QUnit, sinon */
sap.ui.define([
	"sap/ui/core/Component",
	"sap/ui/core/Lib",
	"sap/ui/core/Manifest"
], function (Component, Library, Manifest) {
	"use strict";

	QUnit.module("Async dependency loading", {
		beforeEach: function () {
			window.sapUiTestScriptForUnitTest = this.stub();

			// spy loadLibrary calls directly on prototype as implementation bypasses Core facade
			this.oLoadLibrarySpy = this.spy(Library, "_load");
			this.oLoadDependeciesAndIncludesSpy = this.spy(Manifest.prototype, "loadDependenciesAndIncludes");
		},
		afterEach: function (assert) {
			var aCssDomElements = document.querySelectorAll("link[data-sap-ui-manifest-uid");
			assert.strictEqual(aCssDomElements.length, 0, "No CSS files with given pattern found in DOM");
		}
	});

	QUnit.test("Simple component", function (assert) {
		return Component.create({
			name: "testdata.dependencyLoading.component1",
			manifest: false
		}).then(function (oComponent) {
			// Check loading of dependencies and includes for each ComponentMetadata of the loaded component
			assert.strictEqual(this.oLoadDependeciesAndIncludesSpy.withArgs(sinon.match.truthy).callCount, 3,
				"Function loadDependenciesAndIncludes called three times (for sap.ui.core.Component, sap.ui.core.UIComponent and testdata.dependencyLoading.component1) with parameter bAsync = true");

			// Check for the expected libraries to be loaded
			assert.strictEqual(this.oLoadLibrarySpy.callCount, 3, "Library._load() called 3 times");
			assert.ok(this.oLoadLibrarySpy.getCall(0).calledWithExactly("sap.m"), "First Library._load() call with arguments: 'sap.m'");
			assert.ok(this.oLoadLibrarySpy.getCall(1).calledWithExactly("sap.tnt"), "Second Library._load() call with arguments: 'sap.tnt'");
			assert.ok(this.oLoadLibrarySpy.getCall(2).calledWithExactly("sap.ui.core"), "Third Library._load() call with arguments: 'sap.ui.core'");

			// Cleanup
			oComponent.destroy();
		}.bind(this));
	});

	QUnit.test("Component variant", function (assert) {
		return Component.create({
			name: "testdata.dependencyLoading.component1",
			manifest: sap.ui.require.toUrl("testdata/dependencyLoading/componentVariant") + "/manifest.json"
		}).then(function (oComponent) {
			// Check loading of dependencies and includes for each ComponentMetadata of the loaded component
			assert.strictEqual(this.oLoadDependeciesAndIncludesSpy.withArgs(sinon.match.truthy).callCount, 3,
				"Function loadDependenciesAndIncludes called three times (for sap.ui.core.Component, sap.ui.core.UIComponent and testdata.dependencyLoading.component1 with variant manifest) with parameter bAsync = true");

			// Check for the expected libraries to be loaded
			assert.strictEqual(this.oLoadLibrarySpy.callCount, 4, "Library._load() called 4 times");
			assert.ok(this.oLoadLibrarySpy.getCall(0).calledWithExactly(["sap.m", "sap.ui.core", "sap.ui.table"]), "First Library._load() call with arguments: '['sap.m', 'sap.ui.core', 'sap.ui.table']'==> preload dependencies");

			assert.ok(this.oLoadLibrarySpy.getCall(1).calledWithExactly("sap.m"), "Second Library._load() call with arguments: 'sap.m'");
			assert.ok(this.oLoadLibrarySpy.getCall(2).calledWithExactly("sap.ui.core"), "Third Library._load() call with arguments: 'sap.ui.core'");
			assert.ok(this.oLoadLibrarySpy.getCall(3).calledWithExactly("sap.ui.table"), "Fourth Library._load() call with arguments: 'sap.ui.table'");

			// Cleanup
			oComponent.destroy();
		}.bind(this));
	});

	QUnit.test("Extended component", function (assert) {
		return Component.create({
			name: "testdata.dependencyLoading.component4",
			manifest: false
		}).then(function (oComponent) {
			// Check loading of dependencies and includes for each ComponentMetadata of the loaded component
			assert.strictEqual(this.oLoadDependeciesAndIncludesSpy.withArgs(sinon.match.truthy).callCount, 5,
				"Function loadDependenciesAndIncludes called five times (for sap.ui.core.Component, sap.ui.core.UIComponent, testdata.dependencyLoading.component1, testdata.dependencyLoading.component3 and testdata.dependencyLoading.component4) with parameter bAsync = true");

			// Check for the expected libraries to be loaded
			assert.strictEqual(this.oLoadLibrarySpy.callCount, 9, "Library._load() called nine times");
			assert.ok(this.oLoadLibrarySpy.getCall(0).calledWithExactly("sap.m"), "First Library._load() call with arguments: 'sap.m'");
			assert.ok(this.oLoadLibrarySpy.getCall(1).calledWithExactly("sap.tnt"), "Second Library._load() call with arguments: 'sap.tnt'");
			assert.ok(this.oLoadLibrarySpy.getCall(2).calledWithExactly("sap.ui.core"), "Third Library._load() call with arguments: 'sap.ui.core'");

			assert.ok(this.oLoadLibrarySpy.getCall(3).calledWithExactly("sap.m"), "Fourth Library._load() call with arguments: 'sap.m'");
			assert.ok(this.oLoadLibrarySpy.getCall(4).calledWithExactly("sap.ui.core"), "Fifth Library._load() call with arguments: 'sap.ui.core'");
			assert.ok(this.oLoadLibrarySpy.getCall(5).calledWithExactly("sap.ui.layout"), "Sixth Library._load() call with arguments: 'sap.ui.layout'");
			assert.ok(this.oLoadLibrarySpy.getCall(6).calledWithExactly("sap.m"), "Seventh Library._load() call with arguments: 'sap.m'");
			assert.ok(this.oLoadLibrarySpy.getCall(7).calledWithExactly("sap.ui.core"), "Eighth Library._load() call with arguments: 'sap.ui.core'");
			assert.ok(this.oLoadLibrarySpy.getCall(8).calledWithExactly("sap.ui.table"), "Ninth Library._load() call with arguments: 'sap.ui.table'");

			var aCssDomElements = document.querySelectorAll("link[data-sap-ui-manifest-uid");
			assert.strictEqual(aCssDomElements.length, 2, "Two CSS files with expected criteria found in DOM");
			// Check that the script are loaded in the correct and expected order
			assert.ok(aCssDomElements[0].href.includes("comp3"), "CSS 'comp3extended.css' defined in 'component3/manifest.json' found in DOM");
			assert.ok(aCssDomElements[1].href.includes("comp4"), "CSS 'comp4extended.css' defined in 'component4/manifest.json' found in DOM");

			// Cleanup
			oComponent.destroy();
		}.bind(this));
	});
});
