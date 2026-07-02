/*global QUnit */
sap.ui.define([
	"sap/base/strings/highlightText",
	"sap/base/security/encodeXML"
], function(highlightText, encodeXML) {
	"use strict";

	QUnit.module("highlightText");

	QUnit.test("No match returns encoded text", function(assert) {
		assert.strictEqual(highlightText("Hello World", "xyz", "hl"), encodeXML("Hello World"),
			"Text without match is returned encoded without spans");
	});

	QUnit.test("Single match is highlighted", function(assert) {
		assert.strictEqual(highlightText("Home", "Home", "hl"),
			'<span class="hl">' + encodeXML("Home") + '</span>',
			"Full text match is wrapped");
	});

	QUnit.test("Partial match is highlighted", function(assert) {
		assert.strictEqual(highlightText("Accounts", "Acc", "hl"),
			'<span class="hl">' + encodeXML("Acc") + '</span>' + encodeXML("ounts"),
			"Partial match at the start is wrapped");
	});

	QUnit.test("Match in the middle", function(assert) {
		assert.strictEqual(highlightText("My Account", "Acc", "hl"),
			encodeXML("My ") + '<span class="hl">' + encodeXML("Acc") + '</span>' + encodeXML("ount"),
			"Match in the middle is wrapped");
	});

	QUnit.test("Case-insensitive matching", function(assert) {
		assert.strictEqual(highlightText("Home", "home", "hl"),
			'<span class="hl">' + encodeXML("Home") + '</span>',
			"Case-insensitive match preserves original casing");
	});

	QUnit.test("All occurrences are highlighted", function(assert) {
		assert.strictEqual(highlightText("abcabc", "ab", "hl"),
			'<span class="hl">' + encodeXML("ab") + '</span>' + encodeXML("c") + '<span class="hl">' + encodeXML("ab") + '</span>' + encodeXML("c"),
			"Both occurrences are wrapped");
	});

	QUnit.test("Multiple occurrences case-insensitive", function(assert) {
		assert.strictEqual(highlightText("AcAction", "ac", "hl"),
			'<span class="hl">' + encodeXML("Ac") + '</span>' + '<span class="hl">' + encodeXML("Ac") + '</span>' + encodeXML("tion"),
			"All case-insensitive occurrences are wrapped");
	});

	QUnit.test("Special XML characters are encoded", function(assert) {
		assert.strictEqual(highlightText("a<b>c", "b", "hl"),
			encodeXML("a<") + '<span class="hl">' + encodeXML("b") + '</span>' + encodeXML(">c"),
			"XML special characters in surrounding text are encoded");
	});

	QUnit.test("Special XML characters in match are encoded", function(assert) {
		assert.strictEqual(highlightText("<tag>", "<tag>", "hl"),
			'<span class="hl">' + encodeXML("<tag>") + '</span>',
			"XML special characters in matched text are encoded");
	});

	QUnit.test("Empty search term returns encoded text", function(assert) {
		assert.strictEqual(highlightText("Hello", "", "hl"), encodeXML("Hello"),
			"Empty search term returns encoded text without highlights");
	});

	QUnit.test("Custom CSS class is applied", function(assert) {
		assert.strictEqual(highlightText("Test", "Test", "sapTntNLIHighlight"),
			'<span class="sapTntNLIHighlight">' + encodeXML("Test") + '</span>',
			"Custom class name is used in the span");
	});

	QUnit.test("Adjacent matches", function(assert) {
		assert.strictEqual(highlightText("aaaa", "aa", "hl"),
			'<span class="hl">' + encodeXML("aa") + '</span>' + '<span class="hl">' + encodeXML("aa") + '</span>',
			"Non-overlapping adjacent matches are both highlighted");
	});

	QUnit.test("Length-changing lowercase mappings preserve original slice boundaries", function(assert) {
		assert.strictEqual(highlightText("AİB", "İ", "hl"),
			encodeXML("A") + '<span class="hl">' + encodeXML("İ") + '</span>' + encodeXML("B"),
			"Characters like Turkish dotted İ are highlighted without including following text");
	});
});
