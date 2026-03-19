/* global QUnit */

sap.ui.define([
	"sap/ui/testrecorder/utils/convertTreeToMarkdown",
	"../../fixture/tree"
], function (convertTreeToMarkdown, testTree) {
	"use strict";

	QUnit.module("convertTreeToMarkdown");

	QUnit.test("Return value structure - String contains markdown header '## Page content'", function (assert) {
		var result = convertTreeToMarkdown([]);
		assert.ok(result.includes("## Page content"), "String contains markdown header");
	});

	QUnit.test("Return value structure - String contains properly indented hierarchy", function (assert) {
		// testTree[1] is the sap-ui-area root containing the full ComponentContainer hierarchy
		var result = convertTreeToMarkdown(testTree[1]);
		var lines = result.split("\n");
		assert.ok(lines[2].startsWith("  Component"), "ComponentContainer is indented at level 1");
		assert.ok(lines[3].startsWith("    XMLView"), "XMLView is indented at level 2");
		assert.ok(lines[4].startsWith("      Button"), "Button is indented at level 3");
		assert.ok(lines[5].startsWith("        Icon"), "Icon is indented at level 4");
	});
});
