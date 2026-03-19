/* global QUnit */

sap.ui.define([
	"sap/ui/testrecorder/utils/filterControlTree",
	"../../fixture/tree"
], function (filterControlTree, testTree) {
	"use strict";

	/**
	 * Build a standard options object, optionally overriding individual fields.
	 */
	function makeOptions(oOverrides) {
		return Object.assign({ query: "", includeAncestors: true, includeDescendants: true, includeInvisibleText: false }, oOverrides);
	}

	/**
	 * Helper: collect all control ids from a filtered tree (depth-first).
	 */
	function collectIds(aNodes) {
		var aIds = [];
		(aNodes || []).forEach(function (oNode) {
			aIds.push(oNode.id);
			aIds = aIds.concat(collectIds(oNode.content));
		});
		return aIds;
	}

	/**
	 * Helper: inject an InvisibleText node as child of the given parent id.
	 */
	function treeWithInvisibleText(sParentId) {
		var clone = JSON.parse(JSON.stringify(testTree));
		var invisibleNode = {
			id: "__invisibleText0",
			name: "sap.ui.core.InvisibleText",
			type: "sap-ui-control",
			content: []
		};
		function inject(aNodes) {
			for (var i = 0; i < aNodes.length; i++) {
				if (aNodes[i].id === sParentId) {
					aNodes[i].content.push(invisibleNode);
					return true;
				}
				if (aNodes[i].content && inject(aNodes[i].content)) {
					return true;
				}
			}
			return false;
		}
		inject(clone);
		return clone;
	}

	/**
	 * Helper: enrich a specific node with a data property.
	 */
	function enrichNodeWithData(tree, controlId, data) {
		var enriched = JSON.parse(JSON.stringify(tree));
		function findAndEnrich(nodes) {
			for (var i = 0; i < nodes.length; i++) {
				if (nodes[i].id === controlId) {
					nodes[i].data = data;
					return true;
				}
				if (nodes[i].content && findAndEnrich(nodes[i].content)) {
					return true;
				}
			}
			return false;
		}
		findAndEnrich(enriched);
		return enriched;
	}

	// ── No-query behaviour ──────────────────────────────────────────────

	QUnit.module("filterControlTree - No Query");

	QUnit.test("Returns full tree when query is empty", function (assert) {
		var aResult = filterControlTree(testTree, makeOptions());
		var aIds = collectIds(aResult);

		assert.ok(aIds.indexOf("container") !== -1, "Root control present");
		assert.ok(aIds.indexOf("container-cart---app") !== -1, "XMLView present");
		assert.ok(aIds.indexOf("__button4-container-cart---welcomeView--row-1") !== -1, "Button present");
		assert.ok(aIds.indexOf("__button4-container-cart---welcomeView--row-1-img") !== -1, "Icon present");
		assert.ok(aIds.indexOf("__search-field0-container-cart---welcomeView--row-2") !== -1, "SearchField present");
		assert.ok(aIds.indexOf("__search-field0-container-cart---welcomeView--row-2-input") !== -1, "Input present");
	});

	QUnit.test("Does not mutate original tree", function (assert) {
		var sBefore = JSON.stringify(testTree);
		filterControlTree(testTree, makeOptions({ query: "Button" }));
		assert.strictEqual(JSON.stringify(testTree), sBefore, "Original tree is unchanged");
	});

	// ── Query matching ──────────────────────────────────────────────────

	QUnit.module("filterControlTree - Query Matching");

	QUnit.test("Matches by control ID", function (assert) {
		var aResult = filterControlTree(testTree, makeOptions({ query: "cart" }));
		var aIds = collectIds(aResult);
		assert.ok(aIds.indexOf("container-cart---app") !== -1, "Node with 'cart' in ID is present");
	});

	QUnit.test("Matches by class name", function (assert) {
		var aResult = filterControlTree(testTree, makeOptions({ query: "SearchField" }));
		var aIds = collectIds(aResult);
		assert.ok(aIds.indexOf("__search-field0-container-cart---welcomeView--row-2") !== -1,
			"SearchField node found by class name");
	});

	QUnit.test("Matches by data property name", function (assert) {
		var enriched = enrichNodeWithData(testTree, "container", { myProp: "someValue" });
		var aResult = filterControlTree(enriched, makeOptions({ query: "myProp" }));
		var aIds = collectIds(aResult);
		assert.ok(aIds.indexOf("container") !== -1, "Node matched by data property name");
	});

	QUnit.test("Matches by data property value", function (assert) {
		var enriched = enrichNodeWithData(testTree, "container", { myProp: "uniqueVal123" });
		var aResult = filterControlTree(enriched, makeOptions({ query: "uniqueVal123" }));
		var aIds = collectIds(aResult);
		assert.ok(aIds.indexOf("container") !== -1, "Node matched by data property value");
	});

	QUnit.test("Match is case-insensitive", function (assert) {
		var aResult = filterControlTree(testTree, makeOptions({ query: "SEARCHFIELD" }));
		var aIds = collectIds(aResult);
		assert.ok(aIds.indexOf("__search-field0-container-cart---welcomeView--row-2") !== -1,
			"Uppercase query matches lowercase class name");
	});

	QUnit.test("Non-matching query returns empty subtree controls", function (assert) {
		var aResult = filterControlTree(testTree, makeOptions({ query: "NoSuchControl999" }));
		var aControlIds = collectIds(aResult).filter(function (id) {
			// sap-ui-area nodes are not controls, only check control ids
			return id !== "sap-ui-static" && id !== "id-1564058754299-3";
		});
		assert.strictEqual(aControlIds.length, 0, "No control nodes survive a non-matching query");
	});

	// ── Ancestor / Descendant inclusion ─────────────────────────────────

	QUnit.module("filterControlTree - Ancestor & Descendant Inclusion");

	QUnit.test("includeAncestors retains path from root to matched node", function (assert) {
		var aResult = filterControlTree(testTree, makeOptions({ query: "Icon", includeAncestors: true, includeDescendants: false }));
		var aIds = collectIds(aResult);

		assert.ok(aIds.indexOf("container") !== -1, "Root ancestor retained");
		assert.ok(aIds.indexOf("container-cart---app") !== -1, "XMLView ancestor retained");
		assert.ok(aIds.indexOf("__button4-container-cart---welcomeView--row-1") !== -1, "Button ancestor retained");
		assert.ok(aIds.indexOf("__button4-container-cart---welcomeView--row-1-img") !== -1, "Matched Icon present");
	});

	QUnit.test("includeAncestors does not retain non-matching siblings", function (assert) {
		var aResult = filterControlTree(testTree, makeOptions({ query: "Icon", includeAncestors: true, includeDescendants: false }));
		var aIds = collectIds(aResult);

		assert.ok(aIds.indexOf("__search-field0-container-cart---welcomeView--row-2") === -1,
			"Non-matching sibling SearchField is pruned");
	});

	QUnit.test("includeDescendants retains subtree below matched node", function (assert) {
		var aResult = filterControlTree(testTree, makeOptions({ query: "Button", includeAncestors: true, includeDescendants: true }));
		var aIds = collectIds(aResult);

		assert.ok(aIds.indexOf("__button4-container-cart---welcomeView--row-1") !== -1, "Matched Button present");
		assert.ok(aIds.indexOf("__button4-container-cart---welcomeView--row-1-img") !== -1,
			"Icon descendant of Button retained");
		assert.ok(aIds.indexOf("__search-field0-container-cart---welcomeView--row-2") === -1,
			"Non-matching sibling SearchField is pruned");
	});

	QUnit.test("includeDescendants=false prunes children of matched node", function (assert) {
		// Use "sap.m.Button" so only the Button class name matches,
		// not the Icon (whose ID happens to contain "button")
		var aResult = filterControlTree(testTree, makeOptions({ query: "sap.m.Button", includeAncestors: true, includeDescendants: false }));
		var aIds = collectIds(aResult);

		assert.ok(aIds.indexOf("__button4-container-cart---welcomeView--row-1") !== -1, "Matched Button present");
		assert.ok(aIds.indexOf("__button4-container-cart---welcomeView--row-1-img") === -1,
			"Icon descendant pruned when includeDescendants is off");
	});

	// ── InvisibleText filtering ─────────────────────────────────────────

	QUnit.module("filterControlTree - InvisibleText Handling");

	QUnit.test("InvisibleText nodes excluded by default", function (assert) {
		var tree = treeWithInvisibleText("container-cart---app");
		var aResult = filterControlTree(tree, makeOptions());
		var aIds = collectIds(aResult);

		assert.ok(aIds.indexOf("__invisibleText0") === -1, "InvisibleText node is excluded");
	});

	QUnit.test("InvisibleText nodes included when option is set", function (assert) {
		var tree = treeWithInvisibleText("container-cart---app");
		var aResult = filterControlTree(tree, makeOptions({ includeInvisibleText: true }));
		var aIds = collectIds(aResult);

		assert.ok(aIds.indexOf("__invisibleText0") !== -1, "InvisibleText node is included");
	});

	QUnit.test("InvisibleText excluded even when it matches query", function (assert) {
		var tree = treeWithInvisibleText("container-cart---app");
		var aResult = filterControlTree(tree, makeOptions({ query: "InvisibleText", includeInvisibleText: false }));
		var aIds = collectIds(aResult);

		assert.ok(aIds.indexOf("__invisibleText0") === -1,
			"InvisibleText excluded despite matching query");
	});

	// ── Edge cases ──────────────────────────────────────────────────────

	QUnit.module("filterControlTree - Edge Cases");

	QUnit.test("Empty input tree returns empty array", function (assert) {
		var aResult = filterControlTree([], makeOptions({ query: "anything" }));
		assert.strictEqual(aResult.length, 0, "Empty input yields empty output");
	});

	QUnit.test("Null nodes in tree are skipped", function (assert) {
		var treeWithNull = [null].concat(JSON.parse(JSON.stringify(testTree)));
		var aResult = filterControlTree(treeWithNull, makeOptions());
		// Should not throw; null root is silently dropped
		assert.ok(Array.isArray(aResult), "Returns an array");
	});

	QUnit.test("Whitespace-only query behaves like empty query", function (assert) {
		var aFull = filterControlTree(testTree, makeOptions({ query: "" }));
		var aWhitespace = filterControlTree(testTree, makeOptions({ query: "   " }));
		assert.strictEqual(collectIds(aFull).length, collectIds(aWhitespace).length,
			"Whitespace-only query returns same result as empty query");
	});
});
