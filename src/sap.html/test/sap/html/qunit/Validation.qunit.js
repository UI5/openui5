/*global QUnit */
sap.ui.define([
	"sap/ui/core/mvc/XMLView"
], function(XMLView) {
	"use strict";

	function createView(sContent) {
		return XMLView.create({
			definition:
				"<mvc:View xmlns=\"sap.html\" xmlns:mvc=\"sap.ui.core.mvc\" xmlns:m=\"sap.m\">" + sContent + "</mvc:View>"
		});
	}

	QUnit.module("Declarative (XMLView) restrictions");

	QUnit.test("a void element must not host inline text content", async function(assert) {
		try {
			await createView("<br>some text</br>");
			assert.ok(false, "creating the view should have failed");
		} catch (e) {
			assert.ok(/must not have text content or child elements/.test(e.message), "the void-content error is thrown: " + e.message);
		}
	});

	QUnit.test("a void element must not host child nodes", async function(assert) {
		try {
			await createView("<br><span>child</span></br>");
			assert.ok(false, "creating the view should have failed");
		} catch (e) {
			assert.ok(/must not have text content or child elements/.test(e.message), "the void-content error is thrown: " + e.message);
		}
	});

	QUnit.test("text content is only allowed inside HTML nodes, not as a direct aggregation child", async function(assert) {
		try {
			await createView("<m:VBox>bare text</m:VBox>");
			assert.ok(false, "creating the view should have failed");
		} catch (e) {
			assert.ok(/Cannot add text nodes as direct child/.test(e.message), "the misplaced-text error is thrown: " + e.message);
		}
	});

	QUnit.module("Unwanted tags");

	QUnit.test("no wrapper control is generated for unwanted/unsafe tags", async function(assert) {
		// "script" is one of the UNWANTED_TAGS, so no sap/html/Script module exists.
		try {
			await new Promise(function(resolve, reject) {
				sap.ui.require(["sap/html/Script"], resolve, reject);
			});
			assert.ok(false, "sap/html/Script should not be loadable");
		} catch (e) {
			assert.ok(true, "the unwanted tag 'script' has no generated wrapper and cannot be required");
		}
	});

	QUnit.test("using an unwanted tag in an XMLView leads to a runtime error", async function(assert) {
		// Since no sap/html/Script wrapper is generated, the XMLTemplateProcessor cannot resolve
		// the control class and view creation must fail rather than silently render a <script>.
		try {
			await createView("<script/>");
			assert.ok(false, "creating a view with an unwanted tag should have failed");
		} catch (e) {
			assert.ok(true, "the unwanted tag 'script' cannot be used in an XMLView: " + e.message);
		}
	});
});
