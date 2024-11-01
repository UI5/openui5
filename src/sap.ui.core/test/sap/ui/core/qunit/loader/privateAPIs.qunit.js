/*global QUnit */
sap.ui.define(function() {
	"use strict";

	var privateLoaderAPI = sap.ui.loader._;

	// ========================================================================================
	// Non-JS Resources (_getModuleContent)
	// ========================================================================================

	QUnit.module("getModuleContent", {
		beforeEach: function() {
			this.EXPECTED_VIEW_CONTENT = '<mvc:View xmlns:mvc="sap.ui.core.mvc"></mvc:View>';
			sap.ui.require.preload({
				'fixture/resource-preload/Main.view.xml': this.EXPECTED_VIEW_CONTENT,
				'fixture/resource-preload/App.view.xml': this.EXPECTED_VIEW_CONTENT,
				'fixture/resource-preload/Details.view.xml': this.EXPECTED_VIEW_CONTENT,
				'fixture/resource-preload/i18n.properties': ""
			});
			sap.ui.predefine("fixture/resource-preload/App.controller", function() {
				return {};
			});
			sap.ui.predefine("fixture/resource-preload/Helper", function() {
				return {};
			});
			sap.ui.loader.config({
				depCacheUI5: {
					'fixture/resource-preload/App.view.xml': [
						"fixture/resource-preload/App.controller.js",
						"fixture/resource-preload/Details.view.xml",
						"fixture/private-apis/ControlX.js"
					],
					'fixture/private-apis/ControlX.js': [
						"fixture/private-apis/ControlY.js"
					]
				}
			});
		}
	});

	QUnit.test("Simple access to a resource", function(assert) {
		assert.strictEqual(
			privateLoaderAPI.getModuleState('fixture/resource-preload/Main.view.xml'),
			-1,
			"(precondition) View resource should be in state PRELOADED"
		);

		assert.strictEqual(
			privateLoaderAPI.getModuleContent('fixture/resource-preload/Main.view.xml'),
			this.EXPECTED_VIEW_CONTENT,
			"reading a preloaded non-JS resource should return the expected text result");

		assert.strictEqual(
			privateLoaderAPI.getModuleState('fixture/resource-preload/Main.view.xml'),
			2,
			"After accessing its content, View resource should be in state LOADED"
		);
	});

	QUnit.test("Access via a denormalized name", function(assert) {
		assert.strictEqual(
			privateLoaderAPI.getModuleContent('fixture/resource-preload/dummy/../Main.view.xml'),
			this.EXPECTED_VIEW_CONTENT,
			"reading a preloaded non-JS resource by a denormalized name should return the expected text result");
	});

	QUnit.test("Access via a mapped name", function(assert) {
		sap.ui.loader.config({
			map: {
				'resource-preload-alias': 'fixture/resource-preload',
				'resource-preload-alias-Main.view': 'fixture/resource-preload/Main.view'
				// Note: mapping doesn't handle subtypes like '.view', to be compliant with the AMD spec!
			}
		});
		assert.strictEqual(
			privateLoaderAPI.getModuleContent('resource-preload-alias/Main.view.xml'),
			this.EXPECTED_VIEW_CONTENT,
			"reading a preloaded non-JS resource by a prefixed-mapped module ID should return the expected text result");
		assert.strictEqual(
			privateLoaderAPI.getModuleContent('resource-preload-alias-Main.view.xml'),
			this.EXPECTED_VIEW_CONTENT,
			"reading a preloaded non-JS resource by a name-mapped module ID should return the expected text result");
	});

	QUnit.test("Access empty resource via url", function(assert) {
		assert.strictEqual(
			privateLoaderAPI.getModuleContent(undefined, sap.ui.require.toUrl('fixture/resource-preload/i18n.properties')),
			"",
			"reading a preloaded empty resource via url should return the expected text result");
	});

	QUnit.test("Access to a resource with depCache info requires the dependencies", function (assert) {
		// App.controller.js is a direct dependency of the view and also preloaded
		assert.strictEqual(
			privateLoaderAPI.getModuleState("fixture/resource-preload/App.controller.js"),
			-1,
			"(precondition) dependency JS resource still should be in state PRELOADED"
		);
		// ControlX is a direct dependency of the view
		assert.strictEqual(
			privateLoaderAPI.getModuleState("fixture/private-apis/ControlX.js"),
			0,
			"(precondition) dependency JS resource still should be in state INITIAL"
		);
		// ControlX is a transitive dependency of the view (dependency of Control)
		assert.strictEqual(
			privateLoaderAPI.getModuleState("fixture/private-apis/ControlY.js"),
			0,
			"(precondition) dependency JS resource still should be in state INITIAL"
		);

		// Act
		privateLoaderAPI.getModuleContent("fixture/resource-preload/App.view.xml");

		// Assert
		assert.ok(
			privateLoaderAPI.getModuleState("fixture/private-apis/ControlX.js") > 0,
			"Retrieving the content of the view should have triggered loading the JS resource"
		);
		assert.ok(
			privateLoaderAPI.getModuleState("fixture/private-apis/ControlY.js") > 0,
			"Retrieving the content of the view should have triggered loading the JS resource"
		);
		assert.ok(
			privateLoaderAPI.getModuleState("fixture/resource-preload/App.controller.js") > 0,
			"Retrieving the content of the view should have triggered loading the JS resource"
		);
	});

	QUnit.test("Access to a JS resource does not change its state", function(assert) {
		const JS_RESOURCE = "fixture/resource-preload/Helper.js";

		assert.strictEqual(
			privateLoaderAPI.getModuleState(JS_RESOURCE),
			-1,
			"(precondition) JS resource shouls be in state PRELOADED"
		);

		// Act and assert
		assert.ok(
			Array.isArray(privateLoaderAPI.getModuleContent(JS_RESOURCE)),
			"getModuleContent should return the predefined JS module"
		);

		assert.strictEqual(
			privateLoaderAPI.getModuleState(JS_RESOURCE),
			-1,
			"Retrieving the content of a JS resource should not change its state"
		);
	});


	// ========================================================================================
	// Non-JS Resources (guessResourceName)
	// ========================================================================================

	QUnit.module("guessResourceName", {
		before: function() {
			this.sExistingResourceName = 'fixture/guessResourceName/Existing.view.xml';
			this.sNonExistingResourceName = 'fixture/guessResourceName/NonExisting.view.xml';
			sap.ui.require.preload({
				'fixture/guessResourceName/Existing.view.xml': '<mvc:View xmlns:mvc="sap.ui.core.mvc"></mvc:View>'
			});
		}
	});

	QUnit.test("preloaded resource with bLoadedResourcesOnly:true", function(assert) {
		var sResource = this.sExistingResourceName;
		var sUrl = sap.ui.require.toUrl(sResource);

		// act
		var sGuess = privateLoaderAPI.guessResourceName(sUrl, true);

		// assert
		assert.strictEqual(sGuess, sResource, "guess should return the expected name");
	});

	QUnit.test("preloaded resource with bLoadedResourcesOnly:false", function(assert) {
		var sResource = this.sExistingResourceName;
		var sUrl = sap.ui.require.toUrl(sResource);

		// act
		var sGuess = privateLoaderAPI.guessResourceName(sUrl, false);

		// assert
		assert.strictEqual(sGuess, sResource, "guess should return the expected name");
	});

	QUnit.test("preloaded resource with bLoadedResourcesOnly:true", function(assert) {
		var sResource = this.sNonExistingResourceName;
		var sUrl = sap.ui.require.toUrl(sResource);

		// act
		var sGuess = privateLoaderAPI.guessResourceName(sUrl, true);

		// assert
		assert.strictEqual(sGuess, undefined, "guess should return undefined");
	});

	QUnit.test("preloaded resource with bLoadedResourcesOnly:false", function(assert) {
		var sResource = this.sNonExistingResourceName;
		var sUrl = sap.ui.require.toUrl(sResource);

		// act
		var sGuess = privateLoaderAPI.guessResourceName(sUrl, false);

		// assert
		assert.strictEqual(sGuess, sResource, "guess should return the expected name");
	});

	QUnit.test("multiple matching mappings", function(assert) {
		sap.ui.loader.config({
			paths: {
				"fixture/alternative1": "./",
				"fixture/alternative2": "./foo/"
			}
		});
		var sUrl = "./foo/Main.view.xml";

		// act
		var sGuess = privateLoaderAPI.guessResourceName(sUrl, false);

		// assert
		assert.ok(sGuess === "fixture/alternative1/foo/Main.view.xml" || sGuess === "fixture/alternative2/Main.view.xml",
			"guess should return one of the expected names (returned: " + sGuess + ")");
	});

});