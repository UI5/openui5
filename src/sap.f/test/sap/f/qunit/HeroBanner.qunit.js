/*global QUnit */
sap.ui.define([
	"sap/f/HeroBanner",
	"sap/m/Button",
	"sap/m/Text",
	"sap/ui/qunit/utils/nextUIUpdate"
], function(HeroBanner, Button, Text, nextUIUpdate) {
	"use strict";

	QUnit.module("Basic Rendering", {
		beforeEach: async function() {
			this.oHeroBanner = new HeroBanner();
			this.oHeroBanner.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function() {
			this.oHeroBanner.destroy();
		}
	});

	QUnit.test("renders with default settings", function(assert) {
		assert.ok(this.oHeroBanner.getDomRef(), "HeroBanner is rendered");
	});

	QUnit.test("renders the correct custom element tag", function(assert) {
		assert.strictEqual(this.oHeroBanner.getDomRef().localName, "ui5-hero-banner-6bfd01e3", "correct scoped tag is rendered");
	});

	QUnit.test("is instance of sap.f.HeroBanner and the private wrapper", function(assert) {
		assert.ok(this.oHeroBanner.isA("sap.f.HeroBanner"), "control identifies as sap.f.HeroBanner");
		assert.ok(this.oHeroBanner.isA("sap.f.gen.ui5.webcomponents_fiori.dist.HeroBanner"), "control is also an instance of the private wrapper");
	});

	QUnit.test("renders with headerText and overlineText set at construction", async function(assert) {
		this.oHeroBanner.destroy();
		this.oHeroBanner = new HeroBanner({
			headerText: "Hello, World",
			overlineText: "Today is a great day"
		});
		this.oHeroBanner.placeAt("qunit-fixture");
		await nextUIUpdate();

		assert.strictEqual(this.oHeroBanner.getDomRef().getAttribute("header-text"), "Hello, World", "header-text attribute is set on DOM");
		assert.strictEqual(this.oHeroBanner.getDomRef().getAttribute("overline-text"), "Today is a great day", "overline-text attribute is set on DOM");
	});

	QUnit.module("Properties — defaults", {
		beforeEach: async function() {
			this.oHeroBanner = new HeroBanner();
			this.oHeroBanner.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function() {
			this.oHeroBanner.destroy();
		}
	});

	QUnit.test("actionsPlacement defaults to TopEnd", function(assert) {
		assert.strictEqual(this.oHeroBanner.getActionsPlacement(), "TopEnd", "actionsPlacement default is TopEnd");
	});

	QUnit.test("columnsRatio defaults to FirstWider", function(assert) {
		assert.strictEqual(this.oHeroBanner.getColumnsRatio(), "FirstWider", "columnsRatio default is FirstWider");
	});

	QUnit.test("headerBlockPlacement defaults to Top", function(assert) {
		assert.strictEqual(this.oHeroBanner.getHeaderBlockPlacement(), "Top", "headerBlockPlacement default is Top");
	});

	QUnit.test("headerText defaults to undefined", function(assert) {
		assert.strictEqual(this.oHeroBanner.getHeaderText(), undefined, "headerText default is undefined");
	});

	QUnit.test("overlineText defaults to undefined", function(assert) {
		assert.strictEqual(this.oHeroBanner.getOverlineText(), undefined, "overlineText default is undefined");
	});

	QUnit.test("width defaults to undefined", function(assert) {
		assert.strictEqual(this.oHeroBanner.getWidth(), undefined, "width default is undefined");
	});

	QUnit.test("height defaults to undefined", function(assert) {
		assert.strictEqual(this.oHeroBanner.getHeight(), undefined, "height default is undefined");
	});

	QUnit.test("backgroundImage defaults to undefined", function(assert) {
		assert.strictEqual(this.oHeroBanner.getBackgroundImage(), undefined, "backgroundImage default is undefined");
	});

	QUnit.module("Properties — DOM attribute reflection", {
		beforeEach: async function() {
			this.oHeroBanner = new HeroBanner();
			this.oHeroBanner.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function() {
			this.oHeroBanner.destroy();
		}
	});

	QUnit.test("setting headerText reflects as header-text attribute", async function(assert) {
		this.oHeroBanner.setHeaderText("Good Morning");
		await nextUIUpdate();

		assert.strictEqual(this.oHeroBanner.getDomRef().getAttribute("header-text"), "Good Morning", "header-text attribute is set");
	});

	QUnit.test("setting overlineText reflects as overline-text attribute", async function(assert) {
		this.oHeroBanner.setOverlineText("Wednesday, July 9");
		await nextUIUpdate();

		assert.strictEqual(this.oHeroBanner.getDomRef().getAttribute("overline-text"), "Wednesday, July 9", "overline-text attribute is set");
	});

	QUnit.test("setting actionsPlacement reflects as actions-placement attribute", async function(assert) {
		this.oHeroBanner.setActionsPlacement("BottomStart");
		await nextUIUpdate();

		assert.strictEqual(this.oHeroBanner.getDomRef().getAttribute("actions-placement"), "BottomStart", "actions-placement attribute is set");
	});

	QUnit.test("setting columnsRatio reflects as columns-ratio attribute", async function(assert) {
		this.oHeroBanner.setColumnsRatio("Equal");
		await nextUIUpdate();

		assert.strictEqual(this.oHeroBanner.getDomRef().getAttribute("columns-ratio"), "Equal", "columns-ratio attribute is set");
	});

	QUnit.test("setting headerBlockPlacement reflects as header-block-placement attribute", async function(assert) {
		this.oHeroBanner.setHeaderBlockPlacement("Bottom");
		await nextUIUpdate();

		assert.strictEqual(this.oHeroBanner.getDomRef().getAttribute("header-block-placement"), "Bottom", "header-block-placement attribute is set");
	});

	QUnit.module("Properties — style mapping", {
		beforeEach: async function() {
			this.oHeroBanner = new HeroBanner();
			this.oHeroBanner.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function() {
			this.oHeroBanner.destroy();
		}
	});

	QUnit.test("width is applied as inline style", async function(assert) {
		this.oHeroBanner.setWidth("800px");
		await nextUIUpdate();

		assert.strictEqual(this.oHeroBanner.getDomRef().style.width, "800px", "width style is set");
	});

	QUnit.test("height is applied as inline style", async function(assert) {
		this.oHeroBanner.setHeight("300px");
		await nextUIUpdate();

		assert.strictEqual(this.oHeroBanner.getDomRef().style.height, "300px", "height style is set");
	});

	QUnit.test("width and height can be set together", async function(assert) {
		this.oHeroBanner.setWidth("1200px");
		this.oHeroBanner.setHeight("400px");
		await nextUIUpdate();

		assert.strictEqual(this.oHeroBanner.getDomRef().style.width, "1200px", "width style is set");
		assert.strictEqual(this.oHeroBanner.getDomRef().style.height, "400px", "height style is set");
	});

	QUnit.test("backgroundImage is applied as background-image inline style", async function(assert) {
		this.oHeroBanner.setBackgroundImage("url('test.jpg')");
		await nextUIUpdate();

		assert.strictEqual(this.oHeroBanner.getDomRef().style.backgroundImage, "url(\"test.jpg\")", "background-image style is set");
	});

	QUnit.test("backgroundImage is removed from DOM when set back to empty", async function(assert) {
		this.oHeroBanner.setBackgroundImage("url('test.jpg')");
		await nextUIUpdate();

		this.oHeroBanner.setBackgroundImage("");
		await nextUIUpdate();

		assert.strictEqual(this.oHeroBanner.getDomRef().style.backgroundImage, "", "background-image style is removed");
	});

	QUnit.module("Aggregations — actions slot", {
		beforeEach: async function() {
			this.oHeroBanner = new HeroBanner();
			this.oHeroBanner.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function() {
			this.oHeroBanner.destroy();
		}
	});

	QUnit.test("action buttons can be added to the actions aggregation", async function(assert) {
		var oButton = new Button({ text: "Action" });
		this.oHeroBanner.addAction(oButton);
		await nextUIUpdate();

		assert.strictEqual(this.oHeroBanner.getActions().length, 1, "one action is present");
		assert.strictEqual(this.oHeroBanner.getActions()[0], oButton, "correct button is in the aggregation");
	});

	QUnit.test("multiple actions can be added", async function(assert) {
		this.oHeroBanner.addAction(new Button({ text: "First" }));
		this.oHeroBanner.addAction(new Button({ text: "Second" }));
		await nextUIUpdate();

		assert.strictEqual(this.oHeroBanner.getActions().length, 2, "two actions are present");
	});

	QUnit.test("actions are rendered in the DOM with slot attribute", async function(assert) {
		var oButton = new Button({ text: "Action" });
		this.oHeroBanner.addAction(oButton);
		await nextUIUpdate();

		assert.strictEqual(oButton.getDomRef().getAttribute("slot"), "actions", "button has slot='actions' attribute");
	});

	QUnit.test("action can be removed", async function(assert) {
		var oButton = new Button({ text: "Action" });
		this.oHeroBanner.addAction(oButton);
		await nextUIUpdate();

		this.oHeroBanner.removeAction(oButton);
		await nextUIUpdate();

		assert.strictEqual(this.oHeroBanner.getActions().length, 0, "actions aggregation is empty after removal");
		oButton.destroy();
	});

	QUnit.module("Aggregations — startContent slot", {
		beforeEach: async function() {
			this.oHeroBanner = new HeroBanner();
			this.oHeroBanner.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function() {
			this.oHeroBanner.destroy();
		}
	});

	QUnit.test("startContent is the default aggregation", function(assert) {
		assert.strictEqual(this.oHeroBanner.getMetadata().getDefaultAggregationName(), "startContent", "startContent is the default aggregation");
	});

	QUnit.test("controls can be added to startContent", async function(assert) {
		var oText = new Text({ text: "Start" });
		this.oHeroBanner.addAggregation("startContent", oText);
		await nextUIUpdate();

		assert.strictEqual(this.oHeroBanner.getStartContent().length, 1, "one item in startContent");
		assert.strictEqual(this.oHeroBanner.getStartContent()[0], oText, "correct control is in startContent");
	});

	QUnit.test("startContent items are rendered without a slot attribute (default slot)", async function(assert) {
		var oText = new Text({ text: "Start" });
		this.oHeroBanner.addAggregation("startContent", oText);
		await nextUIUpdate();

		assert.notOk(oText.getDomRef().getAttribute("slot"), "startContent item has no slot attribute");
	});

	QUnit.module("Aggregations — endContent slot", {
		beforeEach: async function() {
			this.oHeroBanner = new HeroBanner();
			this.oHeroBanner.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function() {
			this.oHeroBanner.destroy();
		}
	});

	QUnit.test("controls can be added to endContent", async function(assert) {
		var oText = new Text({ text: "End" });
		this.oHeroBanner.addEndContent(oText);
		await nextUIUpdate();

		assert.strictEqual(this.oHeroBanner.getEndContent().length, 1, "one item in endContent");
	});

	QUnit.test("endContent items are rendered with slot='endContent' attribute", async function(assert) {
		var oText = new Text({ text: "End" });
		this.oHeroBanner.addEndContent(oText);
		await nextUIUpdate();

		assert.strictEqual(oText.getDomRef().getAttribute("slot"), "endContent", "endContent item has slot='endContent' attribute");
	});

	QUnit.test("startContent and endContent can be used simultaneously", async function(assert) {
		var oStart = new Text({ text: "Start" });
		var oEnd = new Text({ text: "End" });
		this.oHeroBanner.addAggregation("startContent", oStart);
		this.oHeroBanner.addEndContent(oEnd);
		await nextUIUpdate();

		assert.strictEqual(this.oHeroBanner.getStartContent().length, 1, "one item in startContent");
		assert.strictEqual(this.oHeroBanner.getEndContent().length, 1, "one item in endContent");
	});
});
