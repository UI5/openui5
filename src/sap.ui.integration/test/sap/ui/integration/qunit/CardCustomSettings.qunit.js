/* global QUnit */

sap.ui.define([
	"sap/ui/integration/widgets/Card",
	"sap/ui/test/utils/nextUIUpdate",
	"qunit/testResources/nextCardReadyEvent",
	"sap/base/Log"
], function(
	Card,
	nextUIUpdate,
	nextCardReadyEvent,
	Log
) {
	"use strict";

	const DOM_RENDER_LOCATION = "qunit-fixture";

	const oManifest_WithCustomSettings = {
		"sap.app": {
			"id": "test.card.customSettings1"
		},
		"sap.card": {
			"type": "List",
			"customSettings": {
				"feature2": false,
				"feature3": "overridden from manifest",
				"cardSpecific": "only in manifest"
			},
			"header": {
				"title": "Custom Settings Test",
				"visible": "{= ${customSettings>/showHeader} !== false}"
			},
			"content": {
				"data": {
					"json": [
						{
							"Name": "Item 1",
							"Description": "Test item 1"
						},
						{
							"Name": "Item 2",
							"Description": "Test item 2"
						}
					]
				},
				"item": {
					"title": "{Name}",
					"description": "{Description}"
				}
			}
		}
	};

	const oManifest_WithoutCustomSettings = {
		"sap.app": {
			"id": "test.card.customSettings2"
		},
		"sap.card": {
			"type": "List",
			"header": {
				"title": "No Custom Settings",
				"visible": "{= ${customSettings>/showHeader} !== false}"
			},
			"content": {
				"data": {
					"json": [
						{
							"Name": "Item 1"
						}
					]
				},
				"item": {
					"title": "{Name}"
				}
			}
		}
	};

	const oManifest_WithObjectsAndArrays = {
		"sap.app": {
			"id": "test.card.customSettings.objects"
		},
		"sap.card": {
			"type": "Object",
			"customSettings": {
				"theme": {
					"primaryColor": "#ff0000"
				},
				"features": ["override1", "override2"]
			},
			"header": {
				"title": "Object and Array Bindings",
				"subtitle": "{customSettings>/theme/primaryColor}",
				"status": {
					"text": "{customSettings>/features/0}"
				}
			},
			"content": {
				"groups": [
					{
						"title": "Test",
						"items": [
							{
								"label": "Nested",
								"value": "{customSettings>/config/nested/value}"
							},
							{
								"label": "Array",
								"value": "{customSettings>/items/1}"
							}
						]
					}
				]
			}
		}
	};

	QUnit.module("Card Custom Settings - Basic Functionality", {
		beforeEach: function () {
			this.oCard = new Card({
				width: "400px",
				height: "600px",
				baseUrl: "test-resources/sap/ui/integration/qunit/testResources/"
			});
			this.oCard.placeAt(DOM_RENDER_LOCATION);
		},
		afterEach: function () {
			this.oCard.destroy();
		}
	});

	QUnit.test("getProperty returns empty object when customSettings not set", function (assert) {
		// Act
		const oSettings = this.oCard.getProperty("customSettings");

		// Assert
		assert.deepEqual(oSettings, {}, "Returns empty object when customSettings not set");
		assert.strictEqual(typeof oSettings, "object", "Returns an object type");
	});

	QUnit.test("Changing customSettings after manifest applied triggers refresh", async function (assert) {
		// Arrange
		this.oCard.setProperty("customSettings", {
			showHeader: true,
			headerText: "Initial"
		});

		const oManifest = {
			"sap.app": {
				"id": "test.card.customSettings.refresh"
			},
			"sap.card": {
				"type": "List",
				"header": {
					"title": "{customSettings>/headerText}",
					"visible": "{= ${customSettings>/showHeader} === true}"
				}
			}
		};

		this.oCard.setManifest(oManifest);
		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		const oHeader1 = this.oCard.getCardHeader();
		assert.strictEqual(oHeader1.getTitle(), "Initial", "Initial header text resolved");
		assert.strictEqual(oHeader1.getVisible(), true, "Header initially visible");

		// Act
		this.oCard.setProperty("customSettings", {
			showHeader: false,
			headerText: "Updated"
		});

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		// Assert
		const oHeader2 = this.oCard.getCardHeader();
		assert.strictEqual(oHeader2.getTitle(), "Updated", "Header text refreshed with new customSettings");
		assert.strictEqual(oHeader2.getVisible(), false, "Header visibility refreshed with new customSettings");
	});

	QUnit.module("Card Custom Settings - getCombinedCustomSettings", {
		beforeEach: function () {
			this.oCard = new Card({
				width: "400px",
				height: "600px",
				baseUrl: "test-resources/sap/ui/integration/qunit/testResources/"
			});
			this.oCard.placeAt(DOM_RENDER_LOCATION);
		},
		afterEach: function () {
			this.oCard.destroy();
		}
	});

	QUnit.test("getCombinedCustomSettings returns merged settings", async function (assert) {
		// Arrange
		this.oCard.setProperty("customSettings", {
			feature1: true,
			feature2: true,
			feature3: "default value",
			showHeader: true
		});

		// Act
		this.oCard.setManifest(oManifest_WithCustomSettings);
		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		const oSettings = this.oCard.getCombinedCustomSettings();

		// Assert
		assert.strictEqual(oSettings.feature1, true, "Property setting preserved when not overridden in the manifest");
		assert.strictEqual(oSettings.feature2, false, "Manifest overrides property setting (was true, now false)");
		assert.strictEqual(oSettings.feature3, "overridden from manifest", "Manifest overrides property setting value");
		assert.strictEqual(oSettings.cardSpecific, "only in manifest", "Manifest can add new properties");
		assert.strictEqual(oSettings.showHeader, true, "Property setting preserved when not in manifest");
	});

	QUnit.test("getCombinedCustomSettings with property settings only", async function (assert) {
		// Arrange
		this.oCard.setProperty("customSettings", {
			feature1: true,
			feature2: false,
			showHeader: true
		});

		// Act
		this.oCard.setManifest(oManifest_WithoutCustomSettings);
		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		const oSettings = this.oCard.getCombinedCustomSettings();

		// Assert
		assert.strictEqual(oSettings.feature1, true, "Property setting present");
		assert.strictEqual(oSettings.feature2, false, "Property setting present");
		assert.strictEqual(oSettings.showHeader, true, "Property setting present");
		assert.strictEqual(Object.keys(oSettings).length, 3, "Only property settings present");
	});

	QUnit.test("getCombinedCustomSettings with manifest settings only", async function (assert) {
		// Act
		this.oCard.setManifest(oManifest_WithCustomSettings);
		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		const oSettings = this.oCard.getCombinedCustomSettings();

		// Assert
		assert.strictEqual(oSettings.feature2, false, "Manifest setting present");
		assert.strictEqual(oSettings.feature3, "overridden from manifest", "Manifest setting present");
		assert.strictEqual(oSettings.cardSpecific, "only in manifest", "Manifest setting present");
		assert.strictEqual(oSettings.feature1, undefined, "Setting not present when not defined in manifest or property");
	});

	QUnit.test("getCombinedCustomSettings with both empty", async function (assert) {
		// Act
		this.oCard.setManifest(oManifest_WithoutCustomSettings);
		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		const oSettings = this.oCard.getCombinedCustomSettings();

		// Assert
		assert.deepEqual(oSettings, {}, "Returns empty object when no customSettings defined");
	});

	QUnit.test("getCombinedCustomSettings logs error before manifest ready", function (assert) {
		// Arrange
		const oLogSpy = this.spy(Log, "error");

		// Act
		const oSettings = this.oCard.getCombinedCustomSettings();

		// Assert
		assert.ok(oLogSpy.calledOnce, "Error logged when called before manifest ready");
		assert.ok(oLogSpy.calledWith("The manifest is not ready. Consider using the 'manifestReady' event.", "sap.ui.integration.widgets.Card"), "Correct error message");
		assert.strictEqual(oSettings, null, "Returns null when manifest not ready");
	});

	QUnit.module("Card Custom Settings - Binding Resolution (Rendered Card)", {
		beforeEach: function () {
			this.oCard = new Card({
				width: "400px",
				height: "600px",
				baseUrl: "test-resources/sap/ui/integration/qunit/testResources/"
			});
			this.oCard.placeAt(DOM_RENDER_LOCATION);
		},
		afterEach: function () {
			this.oCard.destroy();
		}
	});

	QUnit.test("Bindings resolve in rendered Card", async function (assert) {
		// Arrange
		this.oCard.setProperty("customSettings", {
			showHeader: true,
			theme: {
				primaryColor: "#007bff"
			}
		});

		// Act
		this.oCard.setManifest(oManifest_WithObjectsAndArrays);
		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		const oHeader = this.oCard.getCardHeader();

		// Assert
		assert.strictEqual(oHeader.getSubtitle(), "#ff0000", "Nested object binding resolved");
		assert.strictEqual(oHeader.getVisible(), true, "Expression binding resolved");
	});

	QUnit.module("Card Custom Settings - Data Types");

	QUnit.test("Various data types in customSettings", function (assert) {
		// Arrange
		const oCard = new Card();
		oCard.setProperty("customSettings", {
			booleanTrue: true,
			booleanFalse: false,
			number: 42,
			numberZero: 0,
			string: "text",
			emptyString: "",
			nullValue: null,
			array: [1, 2, 3],
			object: { nested: "value" }
		});

		// Act
		const oSettings = oCard.getProperty("customSettings");

		// Assert
		assert.strictEqual(oSettings.booleanTrue, true, "Boolean true preserved");
		assert.strictEqual(oSettings.booleanFalse, false, "Boolean false preserved");
		assert.strictEqual(oSettings.number, 42, "Number preserved");
		assert.strictEqual(oSettings.numberZero, 0, "Zero preserved");
		assert.strictEqual(oSettings.string, "text", "String preserved");
		assert.strictEqual(oSettings.emptyString, "", "Empty string preserved");
		assert.strictEqual(oSettings.nullValue, null, "Null preserved");
		assert.deepEqual(oSettings.array, [1, 2, 3], "Array preserved");
		assert.deepEqual(oSettings.object, { nested: "value" }, "Object preserved");

		oCard.destroy();
	});

});