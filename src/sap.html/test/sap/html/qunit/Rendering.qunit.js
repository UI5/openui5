/*global QUnit */
sap.ui.define([
	"sap/html/Div",
	"sap/html/Br",
	"sap/html/Input",
	"sap/html/A",
	"sap/ui/core/CustomData",
	"sap/ui/core/mvc/XMLView",
	"sap/ui/test/utils/nextUIUpdate"
], function(Div, Br, Input, A, CustomData, XMLView, nextUIUpdate) {
	"use strict";

	QUnit.module("Programmatic", {
		afterEach: function() {
			this.oControl?.destroy();
		}
	});

	QUnit.test("instantiation and metadata", function(assert) {
		this.oControl = new Div();
		assert.ok(this.oControl.isA("sap.ui.core.Control"), "Div is a Control");
		assert.ok(this.oControl.isA("sap.ui.core.html.HTMLElement"), "Div inherits from the HTMLElement base class");
		assert.strictEqual(this.oControl.getMetadata().getTag(), "div", "the metadata reports the 'div' tag");
	});

	QUnit.test("renders the correct tag and id", async function(assert) {
		this.oControl = new Div("myDiv");
		this.oControl.placeAt("qunit-fixture");
		await nextUIUpdate();

		const oDomRef = this.oControl.getDomRef();
		assert.ok(oDomRef, "a DOM reference exists after rendering");
		assert.strictEqual(oDomRef.tagName.toLowerCase(), "div", "the DOM element uses the 'div' tag");
		assert.strictEqual(oDomRef.id, "myDiv", "the control id is rendered onto the DOM element");
	});

	QUnit.test("renders the 'text' property as native textContent", async function(assert) {
		this.oControl = new Div({ text: "Hello World" });
		this.oControl.placeAt("qunit-fixture");
		await nextUIUpdate();

		assert.strictEqual(this.oControl.getDomRef().textContent, "Hello World", "the text is rendered as textContent");
	});

	QUnit.test("renders UI5 style classes onto the DOM element", async function(assert) {
		this.oControl = new Div();
		this.oControl.addStyleClass("myStyleClass");
		this.oControl.placeAt("qunit-fixture");
		await nextUIUpdate();

		assert.ok(this.oControl.getDomRef().classList.contains("myStyleClass"), "the style class added via addStyleClass is rendered");
	});

	QUnit.test("renders custom data with writeToDom as a data-* attribute", async function(assert) {
		this.oControl = new Div({
			customData: [ new CustomData({ key: "my-attribute", value: "42", writeToDom: true }) ]
		});
		this.oControl.placeAt("qunit-fixture");
		await nextUIUpdate();

		assert.strictEqual(this.oControl.getDomRef().getAttribute("data-my-attribute"), "42", "the custom data is rendered as a data-* attribute");
	});

	QUnit.test("void element renders without a closing tag or children", async function(assert) {
		this.oControl = new Br();
		this.oControl.placeAt("qunit-fixture");
		await nextUIUpdate();

		const oDomRef = this.oControl.getDomRef();
		assert.strictEqual(oDomRef.tagName.toLowerCase(), "br", "the void element renders its tag");
		assert.strictEqual(oDomRef.childNodes.length, 0, "the void element has no child nodes");
	});

	QUnit.test("void element silently ignores programmatically set text content", async function(assert) {
		// Programmatic usage is intentionally not guarded (unlike the declarative XMLView path);
		// the renderer simply does not emit content for void elements.
		this.oControl = new Br({ text: "ignored" });
		this.oControl.placeAt("qunit-fixture");
		await nextUIUpdate();

		assert.strictEqual(this.oControl.getDomRef().textContent, "", "the text content is not rendered for a void element");
	});

	QUnit.test("accepts and renders a hyphenated enum value (InputType 'datetime-local')", async function(assert) {
		// sap.html enums use native key/value (e.g. "datetime-local"), so a
		// hyphenated value must be accepted as-is.
		this.oControl = new Input({ type: "datetime-local" });
		this.oControl.placeAt("qunit-fixture");
		await nextUIUpdate();

		assert.strictEqual(this.oControl.getType(), "datetime-local", "the native hyphenated enum value is accepted as-is");
		assert.strictEqual(this.oControl.getDomRef().getAttribute("type"), "datetime-local", "the hyphenated value is rendered verbatim as the 'type' attribute");
	});

	QUnit.module("Declarative (XMLView)", {
		afterEach: function() {
			this.oView?.destroy();
		}
	});

	QUnit.test("creates and renders HTML nodes from an XMLView", async function(assert) {
		this.oView = await XMLView.create({
			definition:
				"<mvc:View xmlns=\"sap.html\" xmlns:mvc=\"sap.ui.core.mvc\">" +
					"<div id=\"myDiv\" class=\"myStyleClass\">Hello XML</div>" +
				"</mvc:View>"
		});
		this.oView.placeAt("qunit-fixture");
		await nextUIUpdate();

		const oDiv = this.oView.byId("myDiv");
		assert.ok(oDiv.isA("sap.ui.core.html.HTMLElement"), "the node was transformed into an HTMLElement control");
		const oDomRef = oDiv.getDomRef();
		assert.strictEqual(oDomRef.tagName.toLowerCase(), "div", "the correct tag is rendered");
		assert.strictEqual(oDomRef.textContent, "Hello XML", "the inline text is rendered as textContent");
		assert.ok(oDomRef.classList.contains("myStyleClass"), "the class attribute is rendered as a style class");
	});

	QUnit.test("renders data-* attributes declared in the XMLView", async function(assert) {
		this.oView = await XMLView.create({
			definition:
				"<mvc:View xmlns=\"sap.html\" xmlns:mvc=\"sap.ui.core.mvc\">" +
					"<div id=\"myDiv\" data-my-attribute=\"42\"/>" +
				"</mvc:View>"
		});
		this.oView.placeAt("qunit-fixture");
		await nextUIUpdate();

		assert.strictEqual(this.oView.byId("myDiv").getDomRef().getAttribute("data-my-attribute"), "42", "the data-* attribute is rendered onto the DOM element");
	});

	QUnit.test("accepts a hyphenated enum value (InputType 'datetime-local') from an XMLView", async function(assert) {
		this.oView = await XMLView.create({
			definition:
				"<mvc:View xmlns=\"sap.html\" xmlns:mvc=\"sap.ui.core.mvc\">" +
					"<input id=\"myInput\" type=\"datetime-local\"/>" +
				"</mvc:View>"
		});
		this.oView.placeAt("qunit-fixture");
		await nextUIUpdate();

		const oInput = this.oView.byId("myInput");
		assert.strictEqual(oInput.getType(), "datetime-local", "the native hyphenated enum value is parsed from the XMLView");
		assert.strictEqual(oInput.getDomRef().getAttribute("type"), "datetime-local", "the hyphenated value is rendered as the 'type' attribute");
	});

	QUnit.module("URL validation (sap.ui.core.URI properties)", {
		afterEach: function() {
			this.oControl?.destroy();
			this.oView?.destroy();
		}
	});

	QUnit.test("suppresses an unsafe scheme (javascript:) but keeps it in the control state", async function(assert) {
		// eslint-disable-next-line no-script-url -- intentional unsafe value under test
		this.oControl = new A({ href: "javascript:alert(1)" });
		this.oControl.placeAt("qunit-fixture");
		await nextUIUpdate();

		// eslint-disable-next-line no-script-url -- intentional unsafe value under test
		assert.strictEqual(this.oControl.getHref(), "javascript:alert(1)", "the value is accepted into the control state");
		assert.notOk(this.oControl.getDomRef().hasAttribute("href"), "the unsafe href is not rendered onto the DOM element");
	});

	QUnit.test("suppress evil data: URL", async function(assert) {
		this.oControl = new A({ href: "data:text/html,<script>alert(1)<\/script>" });
		this.oControl.placeAt("qunit-fixture");
		await nextUIUpdate();

		assert.notOk(this.oControl.getDomRef().hasAttribute("href"), "the data: URL is not rendered");
	});

	QUnit.test("renders safe http(s) and relative URLs", async function(assert) {
		this.oControl = new A({ href: "https://example.com/page" });
		this.oControl.placeAt("qunit-fixture");
		await nextUIUpdate();
		assert.strictEqual(this.oControl.getDomRef().getAttribute("href"), "https://example.com/page", "https URL is rendered");

		this.oControl.setHref("relative/page.html");
		await nextUIUpdate();
		assert.strictEqual(this.oControl.getDomRef().getAttribute("href"), "relative/page.html", "relative URL is rendered");
	});

	QUnit.test("suppresses an unsafe href declared in an XMLView", async function(assert) {
		this.oView = await XMLView.create({
			definition:
				"<mvc:View xmlns=\"sap.html\" xmlns:mvc=\"sap.ui.core.mvc\">" +
					// eslint-disable-next-line no-script-url -- intentional unsafe value under test
					"<a id=\"myLink\" href=\"javascript:alert(1)\">Click</a>" +
				"</mvc:View>"
		});
		this.oView.placeAt("qunit-fixture");
		await nextUIUpdate();

		assert.notOk(this.oView.byId("myLink").getDomRef().hasAttribute("href"), "the unsafe href from the XMLView is not rendered");
	});

	QUnit.module("Reverse-tabnabbing (rel/target)", {
		afterEach: function() {
			this.oControl?.destroy();
		}
	});

	QUnit.test("adds rel='noopener' when target opens a new context and no rel was set", async function(assert) {
		this.oControl = new A({ target: "_blank" });
		this.oControl.placeAt("qunit-fixture");
		await nextUIUpdate();

		assert.strictEqual(this.oControl.getDomRef().getAttribute("rel"), "noopener", "noopener is added for target='_blank'");
	});

	QUnit.test("merges 'noopener' into the existing rel-attribute tokens", async function(assert) {
		this.oControl = new A({ target: "_blank", rel: "nofollow" });
		this.oControl.placeAt("qunit-fixture");
		await nextUIUpdate();

		assert.strictEqual(this.oControl.getDomRef().getAttribute("rel"), "nofollow noopener", "author token is kept and noopener appended");
	});

	QUnit.test("does not duplicate when 'noreferrer' is already present", async function(assert) {
		// note: noreferrer implies also noopener
		this.oControl = new A({ target: "_blank", rel: "noreferrer" });
		this.oControl.placeAt("qunit-fixture");
		await nextUIUpdate();

		assert.strictEqual(this.oControl.getDomRef().getAttribute("rel"), "noreferrer", "noreferrer already implies noopener, so nothing is added");
	});

	QUnit.test("leaves rel untouched for same-context targets", async function(assert) {
		this.oControl = new A({ target: "_self", rel: "nofollow" });
		this.oControl.placeAt("qunit-fixture");
		await nextUIUpdate();

		assert.strictEqual(this.oControl.getDomRef().getAttribute("rel"), "nofollow", "no noopener is added for target='_self'");
	});
});
