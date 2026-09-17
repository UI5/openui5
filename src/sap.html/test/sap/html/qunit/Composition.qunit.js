/*global QUnit */
sap.ui.define([
	"sap/html/Div",
	"sap/m/Text",
	"sap/m/VBox",
	"sap/ui/core/mvc/XMLView",
	"sap/ui/model/json/JSONModel",
	"sap/ui/test/utils/nextUIUpdate"
], function(Div, Text, VBox, XMLView, JSONModel, nextUIUpdate) {
	"use strict";

	QUnit.module("Programmatic", {
		afterEach: function() {
			this.oControl?.destroy();
		}
	});

	QUnit.test("a UI5 control can be nested inside an HTML node", async function(assert) {
		this.oControl = new Div({ children: [ new Text({ text: "I am a UI5 control" }) ] });
		this.oControl.placeAt("qunit-fixture");
		await nextUIUpdate();

		const oText = this.oControl.getChildren()[0];
		assert.ok(oText.isA("sap.m.Text"), "the UI5 control is aggregated in the HTML node");
		assert.ok(this.oControl.getDomRef().contains(oText.getDomRef()), "the UI5 control is rendered inside the HTML node's DOM");
		assert.strictEqual(this.oControl.getDomRef().textContent, "I am a UI5 control", "the nested content is rendered");
	});

	QUnit.test("an HTML node can be nested inside a UI5 control", async function(assert) {
		this.oControl = new VBox({ items: [ new Div({ text: "I am an HTML node" }) ] });
		this.oControl.placeAt("qunit-fixture");
		await nextUIUpdate();

		const oDiv = this.oControl.getItems()[0];
		assert.ok(oDiv.isA("sap.ui.core.html.HTMLElement"), "the HTML node is aggregated in the UI5 control");
		assert.strictEqual(oDiv.getDomRef().tagName.toLowerCase(), "div", "the HTML node is rendered as its tag");
		assert.ok(this.oControl.getDomRef().contains(oDiv.getDomRef()), "the HTML node is rendered inside the UI5 control's DOM");
	});

	QUnit.module("Declarative (XMLView)", {
		afterEach: function() {
			this.oView?.destroy();
		}
	});

	QUnit.test("nests UI5 controls and HTML nodes into each other", async function(assert) {
		this.oView = await XMLView.create({
			definition:
				"<mvc:View xmlns=\"sap.html\" xmlns:mvc=\"sap.ui.core.mvc\" xmlns:m=\"sap.m\">" +
					"<m:VBox id=\"box\">" +
						"<div id=\"htmlNode\">" +
							"<m:Text id=\"ui5Text\" text=\"nested UI5\"/>" +
						"</div>" +
					"</m:VBox>" +
				"</mvc:View>"
		});
		this.oView.placeAt("qunit-fixture");
		await nextUIUpdate();

		const oBox = this.oView.byId("box");
		const oDiv = this.oView.byId("htmlNode");
		const oText = this.oView.byId("ui5Text");

		assert.ok(oBox.getDomRef().contains(oDiv.getDomRef()), "the HTML node is nested in the UI5 control");
		assert.ok(oDiv.getDomRef().contains(oText.getDomRef()), "the UI5 control is nested in the HTML node");
	});

	QUnit.test("supports aggregation binding of the 'children' aggregation", async function(assert) {
		this.oView = await XMLView.create({
			definition:
				"<mvc:View xmlns=\"sap.html\" xmlns:mvc=\"sap.ui.core.mvc\" xmlns:m=\"sap.m\">" +
					"<div id=\"list\" children=\"{/items}\">" +
						"<m:Text text=\"{name}\"/>" +
					"</div>" +
				"</mvc:View>"
		});
		this.oView.setModel(new JSONModel({ items: [ { name: "A" }, { name: "B" }, { name: "C" } ] }));
		this.oView.placeAt("qunit-fixture");
		await nextUIUpdate();

		const oDiv = this.oView.byId("list");
		assert.strictEqual(oDiv.getChildren().length, 3, "one child control is created per bound entry");
		assert.strictEqual(oDiv.getDomRef().textContent, "ABC", "the bound children are rendered in order");
	});

	QUnit.test("mixed content wraps inline text in TextContent controls rendered as bare text", async function(assert) {
		this.oView = await XMLView.create({
			definition:
				"<mvc:View xmlns=\"sap.html\" xmlns:mvc=\"sap.ui.core.mvc\" xmlns:m=\"sap.m\">" +
					"<div id=\"mixed\">before<m:Text id=\"mid\" text=\"MID\"/>after</div>" +
				"</mvc:View>"
		});
		this.oView.placeAt("qunit-fixture");
		await nextUIUpdate();

		const oDiv = this.oView.byId("mixed");
		const aChildren = oDiv.getChildren();
		assert.strictEqual(aChildren.length, 3, "text fragments and the UI5 control each become a child");
		assert.ok(aChildren[0].isA("sap.ui.core.html.TextContent"), "the leading text becomes a TextContent control");
		assert.ok(aChildren[2].isA("sap.ui.core.html.TextContent"), "the trailing text becomes a TextContent control");
		assert.strictEqual(oDiv.getDomRef().textContent, "beforeMIDafter", "the mixed content is rendered in order");

		// the TextContent must render as a bare text node, not a wrapper element
		assert.strictEqual(oDiv.getDomRef().firstChild.nodeType, Node.TEXT_NODE, "leading text is a bare DOM text node (no wrapper element)");
	});
});
