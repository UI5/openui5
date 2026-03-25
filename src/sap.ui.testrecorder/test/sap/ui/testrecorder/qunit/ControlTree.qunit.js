/* global QUnit, sinon */

sap.ui.define([
	"sap/ui/testrecorder/ControlTree",
	"sap/ui/testrecorder/inspector/ControlInspector",
	"sap/ui/testrecorder/inspector/ControlAPI",
	"sap/ui/core/Element",
	"sap/m/Button",
	"sap/m/SearchField",
	"sap/ui/test/Opa5",
	"sap/ui/test/RecordReplay",
	"sap/ui/test/actions/Press",
	"sap/ui/test/actions/EnterText",
	"sap/ui/test/utils/nextUIUpdate",
	"../fixture/tree"
], function (ControlTree, ControlInspector, ControlAPI, Element, Button, SearchField, Opa5, RecordReplay, Press, EnterText, nextUIUpdate, testTree) {
	"use strict";

	/**
	 * Helper to create an enriched copy of the test tree with data property on a specific control node.
	 * @param {Array} tree - The original tree fixture
	 * @param {string} controlId - The ID of the control node to enrich
	 * @param {object} data - The data object to add to the node
	 * @returns {Array} A deep clone of the tree with the specified node enriched
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

	QUnit.module("ControlTree - search() - Basic Functionality", {
		beforeEach: function () {
			this.fnGetAllControlData = sinon.stub(ControlAPI, "getAllControlData");
			this.fnGetAllControlData.returns({ renderedControls: testTree });
			this.fnUpdateSettings = sinon.stub(ControlInspector, "updateSettings");
			// Mock Element.getElementById for property enrichment
			this.fnGetElementById = sinon.stub(Element, "getElementById");
		},
		afterEach: function () {
			this.fnGetAllControlData.restore();
			this.fnUpdateSettings.restore();
			this.fnGetElementById.restore();
		}
	});

	QUnit.test("Search finds controls by property name", function (assert) {
		var done = assert.async();

		// Precondition: verify UI5 internal API that ToolsAPI depends on
		assert.strictEqual(new Button({ text: "Test Button" }).mProperties.text, "Test Button", "Non-default property values can be found as expected");

		// Provide enriched tree with data property (ToolsAPI now pre-enriches nodes)
		var enrichedTree = enrichNodeWithData(testTree, "container", { mockPropertyName: true });
		this.fnGetAllControlData.returns({ renderedControls: enrichedTree });

		Promise.all([
			ControlTree.search("mockPropertyName"),
			ControlTree.search("mockProper" /* partial property name */),
			ControlTree.search("ckProper" /* partial property name */)])
			.then(function (aResults) {
				aResults.forEach(function (result) {
					assert.ok(result.includes("ComponentContainer mockPropertyName"), "Result contains property value 'mockPropertyName'");
				});
				done();
		});
	});

	QUnit.test("Search finds controls by property value", function (assert) {
		var done = assert.async();

		// Provide enriched tree with data property (ToolsAPI now pre-enriches nodes)
		var enrichedTree = enrichNodeWithData(testTree, "container", { mockPropertyName: "mockPropertyValue" });
		this.fnGetAllControlData.returns({ renderedControls: enrichedTree });

		Promise.all([
			ControlTree.search("mockPropertyValue"),
			ControlTree.search("mockPropertyVal"),
			ControlTree.search("pertyVal")
		]).then(function (aResults) {
			aResults.forEach(function (result) {
				assert.ok(result.includes('ComponentContainer mockPropertyName="mockPropertyValue"'), "Result contains property value 'mockPropertyValue'");
			});
			done();
		});
	});

	QUnit.test("Search finds controls by aggregation name (tooltip)", function (assert) {
		var done = assert.async();

		// Precondition: verify UI5 internal API that ToolsAPI depends on
		assert.strictEqual(new Button({ tooltip: "Test Button" }).getTooltip_Text(), "Test Button", "Non-default aggregation values can be found as expected");

		// Provide enriched tree with data property (ToolsAPI now pre-enriches nodes)
		var enrichedTree = enrichNodeWithData(testTree, "__button4-container-cart---welcomeView--row-1", { tooltip: "CustomValue" });
		this.fnGetAllControlData.returns({ renderedControls: enrichedTree });

		Promise.all([
			ControlTree.search("tooltip"),
			ControlTree.search("toolt"),
			ControlTree.search("ltip")
		]).then(function (aResults) {
			aResults.forEach(function (result) {
				assert.ok(result.includes('tooltip="CustomValue"'), "Result contains aggregation 'tooltip' with value 'CustomValue'");
			});
			done();
		});
	});

	QUnit.test("Search finds controls by aggregation value (tooltip)", function (assert) {
		var done = assert.async();

		// Provide enriched tree with data property (ToolsAPI now pre-enriches nodes)
		var enrichedTree = enrichNodeWithData(testTree, "__button4-container-cart---welcomeView--row-1", { tooltip: "CustomValue" });
		this.fnGetAllControlData.returns({ renderedControls: enrichedTree });

		Promise.all([
			ControlTree.search("CustomValue"),
			ControlTree.search("CustomVal"),
			ControlTree.search("stomVal")
		]).then(function (aResults) {
			aResults.forEach(function (result) {
				assert.ok(result.includes('tooltip="CustomValue"'), "Result contains aggregation 'tooltip' with value 'CustomValue'");
			});
			done();
		});
	});

	QUnit.test("Search finds controls by association name (component)", function (assert) {
		var done = assert.async();

		// Precondition: verify UI5 internal API that ToolsAPI depends on
		assert.strictEqual(new Button({ ariaLabelledBy: "label1" }).mAssociations.ariaLabelledBy.length, 1, "Non-default association values can be found as expected");

		// Provide enriched tree with data property (ToolsAPI now pre-enriches nodes)
		var enrichedTree = enrichNodeWithData(testTree, "container", { component: "cart-component" });
		this.fnGetAllControlData.returns({ renderedControls: enrichedTree });

		Promise.all([
			ControlTree.search("component"),
			ControlTree.search("compon"),
			ControlTree.search("onent")
		]).then(function (aResults) {
			aResults.forEach(function (result) {
				assert.ok(result.includes('component="cart-component"'), "Result contains association 'component' with value 'cart-component'");
			});
			done();
		});
	});

	QUnit.test("Search finds controls by association value (component)", function (assert) {
		var done = assert.async();

		// Provide enriched tree with data property (ToolsAPI now pre-enriches nodes)
		var enrichedTree = enrichNodeWithData(testTree, "container", { component: "cart-component" });
		this.fnGetAllControlData.returns({ renderedControls: enrichedTree });

		Promise.all([
			ControlTree.search("cart-component"),
			ControlTree.search("cart-comp"),
			ControlTree.search("t-comp")
		]).then(function (aResults) {
			aResults.forEach(function (result) {
				assert.ok(result.includes('component="cart-component"'), "Result contains association 'component' with value 'cart-component'");
			});
			done();
		});
	});

	QUnit.test("Search results are formatted as markdown", function (assert) {
		var done = assert.async();
		ControlTree.search("container").then(function (result) {
			assert.ok(result.startsWith("## Page content"), "Result starts with markdown header");
			assert.ok(result.includes("-"), "Result contains markdown list");
			done();
		});
	});

	QUnit.test("Empty/null query handling - Empty string returns all controls", function (assert) {
		var done = assert.async();
		ControlTree.search("").then(function (result) {
			assert.ok(result.includes("ComponentContainer"), "Empty string returns all controls");
			done();
		});
	});

	QUnit.test("Empty/null query handling - Null query returns all controls", function (assert) {
		var done = assert.async();
		ControlTree.search(null).then(function (result) {
			assert.ok(result.includes("ComponentContainer"), "Null query returns all controls");
			done();
		});
	});

	QUnit.test("Empty/null query handling - Undefined query returns all controls", function (assert) {
		var done = assert.async();
		ControlTree.search(undefined).then(function (result) {
			assert.ok(result.includes("ComponentContainer"), "Undefined query returns all controls");
			done();
		});
	});

	QUnit.test("Empty/null query handling - Whitespace-only query returns all controls", function (assert) {
		var done = assert.async();
		ControlTree.search("   ").then(function (result) {
			assert.ok(result.includes("ComponentContainer"), "Whitespace-only query returns all controls");
			done();
		});
	});

	QUnit.test("Return value structure - Returns a Promise", function (assert) {
		var result = ControlTree.search("container");
		assert.ok(result && typeof result.then === "function", "search() returns a Promise");
	});

	QUnit.test("Return value structure - Promise resolves to a string", function (assert) {
		var done = assert.async();
		ControlTree.search("container").then(function (result) {
			assert.strictEqual(typeof result, "string", "Promise resolves to a string");
			done();
		});
	});

	QUnit.test("Node ID assignment - Each control gets unique nodeId in format {snapshotCount}_{nodeCounter}", function (assert) {
		var done = assert.async();
		ControlTree.search("").then(function (result) {
			// Example result:
			// ## Page content
			// sap-ui-area
			//   ComponentContainer nodeId="22_1"
			//     XMLView nodeId="22_2"
			//       Button nodeId="22_3"
			//         Icon nodeId="22_4"
			//       SearchField nodeId="22_5"
			//         Input nodeId="22_6"

			var lines = result.split("\n");

			// Find all lines with nodeId assignments
			var nodeIdRegex = /nodeId="(\d+)_(\d+)"/g;
			var foundNodeIds = [];
			lines.forEach(function(line) {
				var match;
				while ((match = nodeIdRegex.exec(line)) !== null) {
					foundNodeIds.push(match[1] + "_" + match[2]);
				}
			});

			// There should be 6 nodeIds in the sample tree
			assert.strictEqual(foundNodeIds.length, 6, "All 6 controls have nodeId assigned");

			// All nodeIds should have the same snapshotCount (first part)
			var snapshotCounts = foundNodeIds.map(function(id) { return id.split("_")[0]; });
			var uniqueSnapshotCounts = Array.from(new Set(snapshotCounts));
			assert.strictEqual(uniqueSnapshotCounts.length, 1, "All nodeIds share the same snapshotCount");

			// nodeCounter part should be unique and sequential (1..6)
			var nodeCounters = foundNodeIds.map(function(id) {
				return parseInt(id.split("_")[1]);
			}).sort(function(a, b) {
				return a - b;
			});
			for (var i = 0; i < nodeCounters.length; i++) {
				assert.strictEqual(nodeCounters[i], i + 1, "nodeCounter " + (i + 1) + " assigned correctly");
			}
			done();
		});
	});

	QUnit.test("NodeIds are mapped to control IDs correctly", function (assert) {
		var done = assert.async();
		ControlTree.search("").then(function (result) {
			var lines = result.split("\n");
			var nodeIdRegex = /nodeId="(\d+)_(\d+)"/g;
			var foundNodeIds = [];
			lines.forEach(function(line) {
				var match;
				while ((match = nodeIdRegex.exec(line)) !== null) {
					foundNodeIds.push(match[1] + "_" + match[2]);
				}
			});
			var snapshotCount = foundNodeIds[0].split("_")[0];
			var expectedMapping = {
				[snapshotCount + "_1"]: "container",
				[snapshotCount + "_2"]: "container-cart---app",
				[snapshotCount + "_3"]: "__button4-container-cart---welcomeView--row-1",
				[snapshotCount + "_4"]: "__button4-container-cart---welcomeView--row-1-img",
				[snapshotCount + "_5"]: "__search-field0-container-cart---welcomeView--row-2",
				[snapshotCount + "_6"]: "__search-field0-container-cart---welcomeView--row-2-input"
			};
			Object.keys(expectedMapping).forEach(function(nodeId) {
				var controlId = ControlTree._getControlId(nodeId);
				assert.strictEqual(controlId, expectedMapping[nodeId], "nodeId " + nodeId + " maps to controlId " + expectedMapping[nodeId]);
			});
			done();
		});
	});

	// --- NodeId Validation in Filtered Results ---
	QUnit.module("ControlTree - NodeId Validation in Filtered Results", {
		beforeEach: function () {
			this.fnGetAllControlData = sinon.stub(ControlAPI, "getAllControlData");
			this.fnGetAllControlData.returns({ renderedControls: testTree });
			this.fnUpdateSettings = sinon.stub(ControlInspector, "updateSettings");
			// Mock Element.getElementById for property enrichment
			this.fnGetElementById = sinon.stub(Element, "getElementById");
		},
		afterEach: function () {
			this.fnGetAllControlData.restore();
			this.fnUpdateSettings.restore();
			this.fnGetElementById.restore();
		}
	});

	QUnit.test("Every control node has nodeId assigned", function (assert) {
		var done = assert.async();
		ControlTree.search("").then(function (result) {
			var lines = result.split("\n");
			var nodeIdRegex = /nodeId="(\d+)_(\d+)"/g;
			var controlLines = [];
			var nodeIdLines = [];

			// Find all lines that represent controls (contain control names but not headers/empty lines)
			lines.forEach(function(line) {
				if (line.trim() && !line.startsWith("##") && !line.startsWith("sap-ui-area")) {
					controlLines.push(line);
					var match = nodeIdRegex.exec(line);
					if (match) {
						nodeIdLines.push(line);
						// Reset regex lastIndex for next iteration
						nodeIdRegex.lastIndex = 0;
					}
				}
			});

			// Verify every control line has a nodeId
			assert.strictEqual(nodeIdLines.length, controlLines.length,
				"Every control line should have a nodeId assigned");
			assert.ok(controlLines.length > 0, "Should have found control lines to test");

			done();
		});
	});

	QUnit.test("NodeId format is valid and consistent", function (assert) {
		var done = assert.async();
		ControlTree.search("").then(function (result) {
			var lines = result.split("\n");
			var nodeIdRegex = /nodeId="(\d+)_(\d+)"/g;
			var nodeIdLines = [];

			// Find all lines with nodeId
			lines.forEach(function(line) {
				var match = nodeIdRegex.exec(line);
				if (match) {
					nodeIdLines.push(line);
					// Reset regex lastIndex for next iteration
					nodeIdRegex.lastIndex = 0;
				}
			});

			assert.ok(nodeIdLines.length > 0, "Should have found nodeId lines to test");

			// Verify nodeId format and collect components
			var snapshotCounts = [];
			var nodeCounters = [];
			nodeIdLines.forEach(function(line) {
				var nodeIdMatch = /nodeId="(\d+)_(\d+)"/.exec(line);
				assert.ok(nodeIdMatch, "Line should contain nodeId: " + line);
				assert.ok(/^\d+$/.test(nodeIdMatch[1]), "Snapshot count should be numeric: " + nodeIdMatch[1]);
				assert.ok(/^\d+$/.test(nodeIdMatch[2]), "Node counter should be numeric: " + nodeIdMatch[2]);

				snapshotCounts.push(nodeIdMatch[1]);
				nodeCounters.push(nodeIdMatch[2]);
			});

			// Verify all snapshot counts are the same
			var uniqueSnapshotCounts = Array.from(new Set(snapshotCounts));
			assert.strictEqual(uniqueSnapshotCounts.length, 1, "All nodeIds should have the same snapshot count");

			// Verify all node counters are unique
			var uniqueNodeCounters = Array.from(new Set(nodeCounters));
			assert.strictEqual(uniqueNodeCounters.length, nodeCounters.length, "All node counters should be unique");

			done();
		});
	});

	// --- Hierarchical Matching Tests ---
	QUnit.module("ControlTree - search() - Hierarchical Matching", {
		beforeEach: function () {
			this.fnGetAllControlData = sinon.stub(ControlAPI, "getAllControlData");
			this.fnGetAllControlData.returns({ renderedControls: testTree });
			this.fnUpdateSettings = sinon.stub(ControlInspector, "updateSettings");
			// Mock Element.getElementById for property enrichment (not needed for this test)
			this.fnGetElementById = sinon.stub(Element, "getElementById");
		},
		afterEach: function () {
			this.fnGetAllControlData.restore();
			this.fnUpdateSettings.restore();
			this.fnGetElementById.restore();
		}
	});

	QUnit.test("Parent nodes retained when child matches", function (assert) {
		var done = assert.async();
		// Define the expected nesting order from root to leaf
		var sChild = "Icon";
		var aParentHierarchy = [
			"## Page content",
			"sap-ui-area",
			"ComponentContainer",
			"XMLView",
			"Button"
		];
		// Search for the most deeply nested control
		ControlTree.search(sChild).then(function (result) {
			var lines = result.split("\n");

			// Find the line index for the deepest node (Icon)
			var iconLineIdx = lines.findIndex(function(line) { return line.trim().startsWith(sChild); });
			assert.ok(iconLineIdx > 0, "Icon node found in output");

			var iParentsToVerify = aParentHierarchy.length - 1;
			var lineIndexToVerify = iconLineIdx - 1;

			while (iParentsToVerify > 0) {
				var nextLine = lines[lineIndexToVerify--];
				var nextParent = aParentHierarchy[iParentsToVerify--];
				assert.strictEqual(nextLine.trim().startsWith(nextParent), true, "Parent node found in correct order");

				if (lineIndexToVerify < 0) {
					assert.ok(false, "Reached start of output without finding all expected parent nodes");
					done();
					return;
				}
			}
			done();
		});
	});

	QUnit.test("Child nodes retained when parent matches", function (assert) {
		var done = assert.async();
		// Define the expected child hierarchy from parent to leaf
		var sParent = "Button";
		var aChildHierarchy = [
			"Button",
			"Icon"
		];
		// Search for the parent node ('Button')
		ControlTree.search(sParent).then(function (result) {
			var lines = result.split("\n");
			// Find the line index for the parent node (Button)
			var parentLineIdx = lines.findIndex(function(line) { return line.trim().startsWith(sParent); });
			assert.ok(parentLineIdx >= 0, "Button node found in output");

			for (var i = 0; i < aChildHierarchy.length; i++) {
				var childLineIndex = parentLineIdx + i;
				if (childLineIndex >= lines.length) {
					assert.ok(false, "Reached end of output without finding all expected child nodes");
					done();
					return;
				}
				var nextLine = lines[childLineIndex];
				var nextChild = aChildHierarchy[i];
				assert.strictEqual(nextLine.trim().startsWith(nextChild), true, "Child node found in correct order");
			}
			done();
		});
	});

	// --- getControlData Tests ---
	QUnit.module("ControlTree - getControlData() - Basic Functionality", {
		beforeEach: function () {
			this.fnGetCodeSnippet = sinon.stub(ControlInspector, "_getCodeSnippet");
			this.fnGetCodeSnippet.resolves("mock code snippet");
			this.fnGetControlData = sinon.stub(ControlAPI, "getControlData");
			this.fnGetControlData.returns({
				properties: {
					own: [],
					inherited: []
				}
			});
			this.fnUpdateSettings = sinon.stub(ControlInspector, "updateSettings");

			// Mock Element.getElementById for getBasicControlInfo
			this.fnGetElementById = sinon.stub(Element, "getElementById");
		},
		afterEach: function () {
			this.fnGetCodeSnippet.restore();
			this.fnGetControlData.restore();
			this.fnUpdateSettings.restore();
			this.fnGetElementById.restore();
		}
	});

	QUnit.test("Returns a Promise", function (assert) {
		// Mock Element.getElementById to return a control with metadata
		this.fnGetElementById.withArgs("container").returns({
			getMetadata: function () {
				return {
					getName: function () {
						return "sap.m.Button";
					}
				};
			}
		});

		var result = ControlTree.getControlData("container");

		// Assert that the result has a then function (is thenable/Promise-like)
		assert.strictEqual(typeof result.then, "function", "Result has a then function");

		// Verify it's a proper Promise by checking it has Promise methods
		assert.ok(result instanceof Promise, "Result is a Promise object");
	});

	QUnit.test("Accepts regular control ID", function (assert) {
		var done = assert.async();

		var oMockSnippet = { selector: { id: "container" } };
		this.fnGetCodeSnippet.resolves(oMockSnippet);
		this.fnGetControlData.returns({ properties: { own: [], inherited: [] } });
		this.fnGetElementById.withArgs("container").returns({
			getMetadata: function () {
				return { getName: function () { return "sap.m.Button"; } };
			}
		});

		ControlTree.getControlData("container").then(function (result) {
			assert.ok(this.fnGetCodeSnippet.calledWithMatch({ domElementId: "container" }),
				"_getCodeSnippet called with domElementId: 'container'");
			assert.ok(this.fnGetControlData.calledWithMatch({
				controlId: "container",
				includeAggregations: true,
				includeAssociations: true
			}), "getControlData called with correct parameters");
			assert.ok(result.hasOwnProperty("selectorSnippet"), "Result has selectorSnippet property");
			assert.ok(result.hasOwnProperty("controlId"), "Result has controlId property");
			done();
		}.bind(this));
	});

	QUnit.test("Accepts and converts node ID format", function (assert) {
		var done = assert.async();

		// Populate the map as if search() had previously assigned this nodeId
		ControlTree._oNodeIdToControlIdMap["1_2"] = "container";

		this.fnGetCodeSnippet.resolves({ selector: { id: "container" } });
		this.fnGetControlData.returns({ properties: { own: [], inherited: [] } });
		this.fnGetElementById.withArgs("container").returns({
			getMetadata: function () {
				return { getName: function () { return "sap.m.Button"; } };
			}
		});

		ControlTree.getControlData("1_2").then(function (result) {
			assert.ok(this.fnGetCodeSnippet.calledWithMatch({ domElementId: "container" }),
				"_getCodeSnippet called with resolved control ID 'container'");
			assert.ok(this.fnGetControlData.calledWithMatch({ controlId: "container" }),
				"getControlData called with resolved control ID 'container'");
			assert.ok(result.hasOwnProperty("selectorSnippet"), "Result has selectorSnippet property");
			assert.strictEqual(result.controlId, "container", "controlId resolved from node ID");

			// Cleanup
			delete ControlTree._oNodeIdToControlIdMap["1_2"];
			done();
		}.bind(this));
	});

	QUnit.test("Return structure contains selectorSnippet", function (assert) {
		var done = assert.async();

		var oMockSnippet = { selector: { id: "test-id" } };
		this.fnGetCodeSnippet.resolves(oMockSnippet);
		this.fnGetControlData.returns({ properties: { own: [], inherited: [] } });

		ControlTree.getControlData("test-id").then(function (result) {
			assert.deepEqual(result.selectorSnippet, oMockSnippet,
				"selectorSnippet equals the value returned by getCodeSnippet");
			done();
		});
	});

	QUnit.test("Return structure contains controlData with basic info", function (assert) {
		var done = assert.async();

		this.fnGetElementById.withArgs("test-control-id").returns({
			getMetadata: function () {
				return { getName: function () { return "sap.m.Button"; } };
			}
		});
		this.fnGetControlData.returns({ properties: { own: [], inherited: [] } });

		ControlTree.getControlData("test-control-id").then(function (result) {
			assert.strictEqual(result.controlId, "test-control-id",
				"controlId equals the passed control ID");
			assert.strictEqual(result.controlType, "sap.m.Button",
				"controlType equals the metadata name from the element");
			done();
		});
	});

	QUnit.test("Data pruning removes inheritedFrom and type from properties.own", function (assert) {
		var done = assert.async();

		this.fnGetControlData.returns({
			properties: {
				own: [
					{ name: "text", value: "Hello", inheritedFrom: "sap.m.Button", type: "string" }
				],
				inherited: []
			}
		});

		ControlTree.getControlData("test-id").then(function (result) {
			var ownProp = result.properties.own[0];
			assert.ok(!ownProp.hasOwnProperty("inheritedFrom"),
				"inheritedFrom removed from own property");
			assert.ok(!ownProp.hasOwnProperty("type"),
				"type removed from own property");
			assert.strictEqual(ownProp.name, "text", "name preserved in own property");
			assert.strictEqual(ownProp.value, "Hello", "value preserved in own property");
			done();
		});
	});

	QUnit.test("Data pruning removes inheritedFrom and type from properties.inherited", function (assert) {
		var done = assert.async();

		this.fnGetControlData.returns({
			properties: {
				own: [],
				inherited: [
					{ name: "visible", value: true, inheritedFrom: "sap.ui.core.Control", type: "boolean" }
				]
			}
		});

		ControlTree.getControlData("test-id").then(function (result) {
			var inheritedProp = result.properties.inherited[0];
			assert.ok(!inheritedProp.hasOwnProperty("inheritedFrom"),
				"inheritedFrom removed from inherited property");
			assert.ok(!inheritedProp.hasOwnProperty("type"),
				"type removed from inherited property");
			assert.strictEqual(inheritedProp.name, "visible", "name preserved in inherited property");
			assert.strictEqual(inheritedProp.value, true, "value preserved in inherited property");
			done();
		});
	});

	QUnit.test("Data pruning removes bindings", function (assert) {
		var done = assert.async();

		this.fnGetControlData.returns({
			properties: { own: [], inherited: [] },
			bindings: { text: { path: "/someProperty" } }
		});

		ControlTree.getControlData("test-id").then(function (result) {
			assert.strictEqual(result.bindings, undefined,
				"bindings property removed from result");
			assert.ok(result.hasOwnProperty("properties"),
				"properties object still present after pruning");
			done();
		});
	});

	QUnit.test("Integrates data from getControlData and getBasicControlInfo", function (assert) {
		var done = assert.async();

		this.fnGetControlData.returns({
			properties: { own: [{ name: "text" }], inherited: [] }
		});
		this.fnGetElementById.withArgs("merged-test-id").returns({
			getMetadata: function () {
				return { getName: function () { return "sap.m.Button"; } };
			}
		});

		ControlTree.getControlData("merged-test-id").then(function (result) {
			assert.strictEqual(result.controlId, "merged-test-id",
				"controlId present from basic info");
			assert.strictEqual(result.controlType, "sap.m.Button",
				"controlType present from basic info");
			assert.ok(result.hasOwnProperty("selectorSnippet"),
				"selectorSnippet present from getCodeSnippet");
			assert.ok(Array.isArray(result.properties.own),
				"properties.own array present from getControlData");
			assert.ok(Array.isArray(result.properties.inherited),
				"properties.inherited array present from getControlData");
			assert.strictEqual(result.properties.own[0].name, "text",
				"own property data merged correctly");
			done();
		});
	});

	QUnit.test("Handles invalid node ID gracefully", function (assert) {
		var done = assert.async();

		// Ensure "999_999" is not in the map
		delete ControlTree._oNodeIdToControlIdMap["999_999"];

		ControlTree.getControlData("999_999").then(function (result) {
			assert.strictEqual(result.controlId, null,
				"controlId is null for unmapped node ID");
			assert.strictEqual(result.controlType, null,
				"controlType is null for unmapped node ID");
			assert.ok(result.hasOwnProperty("selectorSnippet"),
				"Promise still resolves with a selectorSnippet property");
			done();
		});
	});

	// --- press() Unit Tests ---
	QUnit.module("ControlTree - press() - Basic Functionality", {
		beforeEach: function () {
			this.fnUpdateSettings = sinon.stub(ControlInspector, "updateSettings");
			this.fnGetCodeSnippet = sinon.stub(ControlInspector, "_getCodeSnippet");
			this.fnGetCodeSnippet.resolves("mock press snippet");
			this.fnGetSelector = sinon.stub(ControlInspector, "getSelector");
			this.fnGetSelector.resolves({});
			this.fnWaitFor = sinon.stub(Opa5.prototype, "waitFor").returns(Promise.resolve());
			this.fnEmptyQueue = sinon.stub(Opa5, "emptyQueue");
			this.fnWaitForUI5 = sinon.stub(RecordReplay, "waitForUI5").resolves();
		},
		afterEach: function () {
			this.fnUpdateSettings.restore();
			this.fnGetCodeSnippet.restore();
			this.fnGetSelector.restore();
			this.fnWaitFor.restore();
			this.fnEmptyQueue.restore();
			this.fnWaitForUI5.restore();
		}
	});

	QUnit.test("Returns a Promise", function (assert) {
		var result = ControlTree.press("test-id");
		assert.strictEqual(typeof result.then, "function", "Result has a then function");
		assert.ok(result instanceof Promise, "Result is a Promise object");
	});

	QUnit.test("Accepts regular control ID", function (assert) {
		var done = assert.async();

		ControlTree.press("container").then(function () {
			assert.ok(this.fnGetCodeSnippet.calledWithMatch({ domElementId: "container", action: "PRESS" }),
				"getCodeSnippet called with domElementId: 'container' and action: 'PRESS'");
			assert.ok(this.fnGetSelector.calledWithMatch({ domElementId: "container" }),
				"getSelector called with domElementId: 'container'");
			done();
		}.bind(this));
	});

	QUnit.test("Accepts and resolves node ID format", function (assert) {
		var done = assert.async();

		// Populate the map as if search() had previously assigned this nodeId
		ControlTree._oNodeIdToControlIdMap["1_2"] = "container";

		ControlTree.press("1_2").then(function () {
			assert.ok(this.fnGetCodeSnippet.calledWithMatch({ domElementId: "container" }),
				"getCodeSnippet called with resolved control ID 'container'");
			assert.ok(this.fnGetSelector.calledWithMatch({ domElementId: "container" }),
				"getSelector called with resolved control ID 'container'");

			// Cleanup
			delete ControlTree._oNodeIdToControlIdMap["1_2"];
			done();
		}.bind(this));
	});

	QUnit.test("Returns the action snippet from getCodeSnippet", function (assert) {
		var done = assert.async();

		this.fnGetCodeSnippet.resolves("press action code");

		ControlTree.press("test-id").then(function (result) {
			assert.strictEqual(result, "press action code",
				"Resolved value equals the snippet returned by getCodeSnippet");
			done();
		});
	});

	QUnit.test("Passes actionSettings to getCodeSnippet", function (assert) {
		var done = assert.async();

		ControlTree.press("test-id", { altKey: true, shiftKey: true }).then(function () {
			assert.ok(this.fnGetCodeSnippet.calledWithMatch({
				action: "PRESS",
				actionSettings: { altKey: true, shiftKey: true }
			}), "getCodeSnippet called with action 'PRESS' and the provided actionSettings");
			done();
		}.bind(this));
	});

	QUnit.test("Executes action via Opa5.waitFor", function (assert) {
		var done = assert.async();

		ControlTree.press("test-id").then(function () {
			assert.ok(this.fnWaitFor.calledOnce, "Opa5.waitFor called once");
			var oSelectorArg = this.fnWaitFor.firstCall.args[0];
			assert.ok(oSelectorArg.actions instanceof Press,
				"waitFor selector has an actions property that is an instance of Press");
			assert.ok(this.fnEmptyQueue.calledOnce, "Opa5.emptyQueue called once");
			assert.ok(this.fnWaitForUI5.calledOnce, "RecordReplay.waitForUI5 called once");
			done();
		}.bind(this));
	});

	QUnit.test("Merges idSuffix from selector into action settings", function (assert) {
		var done = assert.async();

		this.fnGetSelector.resolves({ interaction: { idSuffix: "inner" } });

		ControlTree.press("test-id", { altKey: true }).then(function () {
			var oSelectorArg = this.fnWaitFor.firstCall.args[0];
			var oPressAction = oSelectorArg.actions;
			assert.strictEqual(oPressAction.getIdSuffix(), "inner",
				"idSuffix from selector merged into Press action settings");
			assert.strictEqual(oPressAction.getAltKey(), true,
				"altKey from caller settings preserved");
			done();
		}.bind(this));
	});

	QUnit.test("Handles undefined oSettings gracefully", function (assert) {
		var done = assert.async();

		ControlTree.press("test-id").then(function (result) {
			assert.strictEqual(result, "mock press snippet",
				"Promise resolves successfully when oSettings is undefined");
			done();
		});
	});

	QUnit.test("Handles invalid/unmapped node ID", function (assert) {
		var done = assert.async();

		// Ensure "999_999" is not in the map
		delete ControlTree._oNodeIdToControlIdMap["999_999"];

		ControlTree.press("999_999").then(function () {
			assert.ok(this.fnGetCodeSnippet.calledWithMatch({ domElementId: null }),
				"getCodeSnippet called with domElementId: null for unmapped node ID");
			done();
		}.bind(this));
	});

	QUnit.test("Rejects when getCodeSnippet fails", function (assert) {
		var done = assert.async();

		this.fnGetCodeSnippet.rejects(new Error("snippet error"));

		ControlTree.press("test-id").then(function () {
			assert.ok(false, "Promise should have been rejected");
			done();
		}).catch(function () {
			assert.ok(true, "Promise rejected when getCodeSnippet fails");
			assert.ok(this.fnGetSelector.notCalled,
				"getSelector was not called — action was never executed");
			done();
		}.bind(this));
	});

	QUnit.test("Rejects when getSelector fails", function (assert) {
		var done = assert.async();

		this.fnGetSelector.rejects(new Error("selector error"));

		ControlTree.press("test-id").then(function () {
			assert.ok(false, "Promise should have been rejected");
			done();
		}).catch(function () {
			assert.ok(true, "Promise rejected when getSelector fails");
			done();
		});
	});

	// --- press() Integration Tests ---
	QUnit.module("ControlTree - press() - Integration", {
		beforeEach: async function () {
			// Create and render a real Button
			this.oButton = new Button("integration-btn");
			this.fnPressSpy = sinon.spy();
			this.oButton.attachPress(this.fnPressSpy);
			this.oButton.placeAt("qunit-fixture");
			await nextUIUpdate();

			// Stub ControlInspector
			this.fnUpdateSettings = sinon.stub(ControlInspector, "updateSettings");
			this.fnGetCodeSnippet = sinon.stub(ControlInspector, "_getCodeSnippet");
			this.fnGetCodeSnippet.resolves("integration snippet");
			this.fnGetSelector = sinon.stub(ControlInspector, "getSelector");
			this.fnGetSelector.resolves({ id: "integration-btn" });

			// Stub OPA/RecordReplay — waitFor executes the Press action on the real Button
			var that = this;
			this.fnWaitFor = sinon.stub(Opa5.prototype, "waitFor").callsFake(function (oSelector) {
				if (oSelector.actions) {
					oSelector.actions.executeOn(that.oButton);
				}
				return Promise.resolve();
			});
			this.fnEmptyQueue = sinon.stub(Opa5, "emptyQueue");
			this.fnWaitForUI5 = sinon.stub(RecordReplay, "waitForUI5").resolves();
		},
		afterEach: function () {
			this.oButton.destroy();
			this.fnUpdateSettings.restore();
			this.fnGetCodeSnippet.restore();
			this.fnGetSelector.restore();
			this.fnWaitFor.restore();
			this.fnEmptyQueue.restore();
			this.fnWaitForUI5.restore();
		}
	});

	QUnit.test("Pressing a real Button triggers its press event handler", function (assert) {
		var done = assert.async();

		ControlTree.press("integration-btn").then(function () {
			assert.ok(this.fnPressSpy.calledOnce,
				"Button press event handler was called exactly once");
			done();
		}.bind(this));
	});

	QUnit.test("Press action is constructed with the passed settings", function (assert) {
		var done = assert.async();

		ControlTree.press("integration-btn", { altKey: true, ctrlKey: true, xPercentage: 50 }).then(function () {
			// Verify the Press instance was created with correct settings
			var oSelectorArg = this.fnWaitFor.firstCall.args[0];
			var oPressAction = oSelectorArg.actions;
			assert.ok(oPressAction instanceof Press, "actions is a Press instance");
			assert.strictEqual(oPressAction.getAltKey(), true, "altKey is true");
			assert.strictEqual(oPressAction.getCtrlKey(), true, "ctrlKey is true");
			assert.strictEqual(oPressAction.getXPercentage(), 50, "xPercentage is 50");
			assert.notOk(oPressAction.getShiftKey(), "shiftKey defaults to falsy");

			// The action still executed on the real button
			assert.ok(this.fnPressSpy.calledOnce,
				"Button press event handler was still called");
			done();
		}.bind(this));
	});

	QUnit.test("idSuffix from selector is merged into Press action settings", function (assert) {
		var done = assert.async();

		this.fnGetSelector.resolves({ id: "integration-btn", interaction: { idSuffix: "content" } });

		// Override waitFor to only capture the Press instance without executing
		// (the Button has no "content" sub-element, so executeOn would fail)
		this.fnWaitFor.callsFake(function (oSelector) {
			return Promise.resolve();
		});

		ControlTree.press("integration-btn", { altKey: true }).then(function () {
			var oSelectorArg = this.fnWaitFor.firstCall.args[0];
			var oPressAction = oSelectorArg.actions;
			assert.strictEqual(oPressAction.getIdSuffix(), "content",
				"idSuffix from selector merged into Press action");
			assert.strictEqual(oPressAction.getAltKey(), true,
				"altKey from caller settings preserved after merge");
			done();
		}.bind(this));
	});

	// --- enterText() Unit Tests ---
	QUnit.module("ControlTree - enterText() - Basic Functionality", {
		beforeEach: function () {
			this.fnUpdateSettings = sinon.stub(ControlInspector, "updateSettings");
			this.fnGetCodeSnippet = sinon.stub(ControlInspector, "_getCodeSnippet");
			this.fnGetCodeSnippet.resolves("mock enterText snippet");
			this.fnGetSelector = sinon.stub(ControlInspector, "getSelector");
			this.fnGetSelector.resolves({});
			this.fnWaitFor = sinon.stub(Opa5.prototype, "waitFor").returns(Promise.resolve());
			this.fnEmptyQueue = sinon.stub(Opa5, "emptyQueue");
			this.fnWaitForUI5 = sinon.stub(RecordReplay, "waitForUI5").resolves();
		},
		afterEach: function () {
			this.fnUpdateSettings.restore();
			this.fnGetCodeSnippet.restore();
			this.fnGetSelector.restore();
			this.fnWaitFor.restore();
			this.fnEmptyQueue.restore();
			this.fnWaitForUI5.restore();
		}
	});

	QUnit.test("Returns a Promise", function (assert) {
		var result = ControlTree.enterText("test-id", { text: "hello" });
		assert.strictEqual(typeof result.then, "function", "Result has a then function");
		assert.ok(result instanceof Promise, "Result is a Promise object");
	});

	QUnit.test("Accepts regular control ID", function (assert) {
		var done = assert.async();

		ControlTree.enterText("container", { text: "hello" }).then(function () {
			assert.ok(this.fnGetCodeSnippet.calledWithMatch({ domElementId: "container", action: "ENTER_TEXT" }),
				"getCodeSnippet called with domElementId: 'container' and action: 'ENTER_TEXT'");
			assert.ok(this.fnGetSelector.calledWithMatch({ domElementId: "container" }),
				"getSelector called with domElementId: 'container'");
			done();
		}.bind(this));
	});

	QUnit.test("Accepts and resolves node ID format", function (assert) {
		var done = assert.async();

		// Populate the map as if search() had previously assigned this nodeId
		ControlTree._oNodeIdToControlIdMap["1_2"] = "container";

		ControlTree.enterText("1_2", { text: "hello" }).then(function () {
			assert.ok(this.fnGetCodeSnippet.calledWithMatch({ domElementId: "container" }),
				"getCodeSnippet called with resolved control ID 'container'");
			assert.ok(this.fnGetSelector.calledWithMatch({ domElementId: "container" }),
				"getSelector called with resolved control ID 'container'");

			// Cleanup
			delete ControlTree._oNodeIdToControlIdMap["1_2"];
			done();
		}.bind(this));
	});

	QUnit.test("Returns the action snippet from getCodeSnippet", function (assert) {
		var done = assert.async();

		this.fnGetCodeSnippet.resolves("enterText action code");

		ControlTree.enterText("test-id", { text: "hello" }).then(function (result) {
			assert.strictEqual(result, "enterText action code",
				"Resolved value equals the snippet returned by getCodeSnippet");
			done();
		});
	});

	QUnit.test("Passes adapted actionSettings to getCodeSnippet", function (assert) {
		var done = assert.async();

		ControlTree.enterText("test-id", { text: "hello", clearTextFirst: true, submitText: false }).then(function () {
			var oCallArgs = this.fnGetCodeSnippet.firstCall.args[0];
			assert.strictEqual(oCallArgs.action, "ENTER_TEXT", "action is ENTER_TEXT");
			assert.strictEqual(oCallArgs.actionSettings.text, "hello", "text setting preserved");
			assert.strictEqual(oCallArgs.actionSettings.clearTextFirst, true, "clearTextFirst setting preserved");
			assert.strictEqual(oCallArgs.actionSettings.keepFocus, true,
				"keepFocus set to true (adapted from submitText: false)");
			assert.notOk(oCallArgs.actionSettings.hasOwnProperty("submitText"),
				"submitText removed from actionSettings");
			done();
		}.bind(this));
	});

	QUnit.test("Executes action via Opa5.waitFor", function (assert) {
		var done = assert.async();

		ControlTree.enterText("test-id", { text: "hello" }).then(function () {
			assert.ok(this.fnWaitFor.calledOnce, "Opa5.waitFor called once");
			var oSelectorArg = this.fnWaitFor.firstCall.args[0];
			assert.ok(oSelectorArg.actions instanceof EnterText,
				"waitFor selector has an actions property that is an instance of EnterText");
			assert.ok(this.fnEmptyQueue.calledOnce, "Opa5.emptyQueue called once");
			assert.ok(this.fnWaitForUI5.calledOnce, "RecordReplay.waitForUI5 called once");
			done();
		}.bind(this));
	});

	QUnit.test("Merges idSuffix from selector into action settings", function (assert) {
		var done = assert.async();

		this.fnGetSelector.resolves({ interaction: { idSuffix: "inner" } });

		ControlTree.enterText("test-id", { text: "hello" }).then(function () {
			var oSelectorArg = this.fnWaitFor.firstCall.args[0];
			var oEnterTextAction = oSelectorArg.actions;
			assert.strictEqual(oEnterTextAction.getIdSuffix(), "inner",
				"idSuffix from selector merged into EnterText action settings");
			assert.strictEqual(oEnterTextAction.getText(), "hello",
				"text from caller settings preserved");
			done();
		}.bind(this));
	});

	QUnit.test("Handles invalid/unmapped node ID", function (assert) {
		var done = assert.async();

		// Ensure "999_999" is not in the map
		delete ControlTree._oNodeIdToControlIdMap["999_999"];

		ControlTree.enterText("999_999", { text: "hello" }).then(function () {
			assert.ok(this.fnGetCodeSnippet.calledWithMatch({ domElementId: null }),
				"getCodeSnippet called with domElementId: null for unmapped node ID");
			done();
		}.bind(this));
	});

	QUnit.test("Rejects when getCodeSnippet fails", function (assert) {
		var done = assert.async();

		this.fnGetCodeSnippet.rejects(new Error("snippet error"));

		ControlTree.enterText("test-id", { text: "hello" }).then(function () {
			assert.ok(false, "Promise should have been rejected");
			done();
		}).catch(function () {
			assert.ok(true, "Promise rejected when getCodeSnippet fails");
			assert.ok(this.fnGetSelector.notCalled,
				"getSelector was not called \u2014 action was never executed");
			done();
		}.bind(this));
	});

	QUnit.test("Rejects when getSelector fails", function (assert) {
		var done = assert.async();

		this.fnGetSelector.rejects(new Error("selector error"));

		ControlTree.enterText("test-id", { text: "hello" }).then(function () {
			assert.ok(false, "Promise should have been rejected");
			done();
		}).catch(function () {
			assert.ok(true, "Promise rejected when getSelector fails");
			done();
		});
	});

	// --- enterText() _adaptEnterTextSettings Tests ---
	QUnit.module("ControlTree - enterText() - _adaptEnterTextSettings", {
		beforeEach: function () {
			this.fnUpdateSettings = sinon.stub(ControlInspector, "updateSettings");
			this.fnGetCodeSnippet = sinon.stub(ControlInspector, "_getCodeSnippet");
			this.fnGetCodeSnippet.resolves("mock enterText snippet");
			this.fnGetSelector = sinon.stub(ControlInspector, "getSelector");
			this.fnGetSelector.resolves({});
			this.fnWaitFor = sinon.stub(Opa5.prototype, "waitFor").returns(Promise.resolve());
			this.fnEmptyQueue = sinon.stub(Opa5, "emptyQueue");
			this.fnWaitForUI5 = sinon.stub(RecordReplay, "waitForUI5").resolves();
		},
		afterEach: function () {
			this.fnUpdateSettings.restore();
			this.fnGetCodeSnippet.restore();
			this.fnGetSelector.restore();
			this.fnWaitFor.restore();
			this.fnEmptyQueue.restore();
			this.fnWaitForUI5.restore();
		}
	});

	QUnit.test("submitText: false sets keepFocus: true and removes submitText", function (assert) {
		var done = assert.async();

		ControlTree.enterText("test-id", { text: "hello", submitText: false }).then(function () {
			var oCallArgs = this.fnGetCodeSnippet.firstCall.args[0];
			assert.strictEqual(oCallArgs.actionSettings.keepFocus, true,
				"keepFocus set to true when submitText is false");
			assert.notOk(oCallArgs.actionSettings.hasOwnProperty("submitText"),
				"submitText removed from settings");
			done();
		}.bind(this));
	});

	QUnit.test("submitText: true removes submitText without setting keepFocus", function (assert) {
		var done = assert.async();

		ControlTree.enterText("test-id", { text: "hello", submitText: true }).then(function () {
			var oCallArgs = this.fnGetCodeSnippet.firstCall.args[0];
			assert.notOk(oCallArgs.actionSettings.hasOwnProperty("submitText"),
				"submitText removed from settings");
			assert.notOk(oCallArgs.actionSettings.hasOwnProperty("keepFocus"),
				"keepFocus was not set when submitText is true");
			done();
		}.bind(this));
	});

	QUnit.test("submitText absent — no mutation of keepFocus", function (assert) {
		var done = assert.async();

		ControlTree.enterText("test-id", { text: "hello", clearTextFirst: true }).then(function () {
			var oCallArgs = this.fnGetCodeSnippet.firstCall.args[0];
			assert.notOk(oCallArgs.actionSettings.hasOwnProperty("submitText"),
				"submitText not present in settings");
			assert.notOk(oCallArgs.actionSettings.hasOwnProperty("keepFocus"),
				"keepFocus not set when submitText is absent");
			assert.strictEqual(oCallArgs.actionSettings.clearTextFirst, true,
				"other settings preserved");
			done();
		}.bind(this));
	});

	QUnit.test("EnterText action receives adapted settings", function (assert) {
		var done = assert.async();

		ControlTree.enterText("test-id", { text: "hello", submitText: false, clearTextFirst: true }).then(function () {
			var oSelectorArg = this.fnWaitFor.firstCall.args[0];
			var oEnterTextAction = oSelectorArg.actions;
			assert.strictEqual(oEnterTextAction.getKeepFocus(), true,
				"keepFocus is true (adapted from submitText: false)");
			assert.strictEqual(oEnterTextAction.getClearTextFirst(), true,
				"clearTextFirst preserved");
			assert.strictEqual(oEnterTextAction.getText(), "hello",
				"text preserved");
			done();
		}.bind(this));
	});

	QUnit.test("EnterText action with submitText: true has default keepFocus (false)", function (assert) {
		var done = assert.async();

		ControlTree.enterText("test-id", { text: "hello", submitText: true }).then(function () {
			var oSelectorArg = this.fnWaitFor.firstCall.args[0];
			var oEnterTextAction = oSelectorArg.actions;
			assert.strictEqual(oEnterTextAction.getKeepFocus(), false,
				"keepFocus defaults to false when submitText is true");
			assert.strictEqual(oEnterTextAction.getText(), "hello",
				"text preserved");
			done();
		}.bind(this));
	});

	// --- enterText() Integration Tests ---
	QUnit.module("ControlTree - enterText() - Integration", {
		beforeEach: async function () {
			// Create and render a real SearchField
			this.oSearchField = new SearchField("integration-sf");
			this.oSearchField.placeAt("qunit-fixture");
			await nextUIUpdate();

			// Stub ControlInspector
			this.fnUpdateSettings = sinon.stub(ControlInspector, "updateSettings");
			this.fnGetCodeSnippet = sinon.stub(ControlInspector, "_getCodeSnippet");
			this.fnGetCodeSnippet.resolves("integration enterText snippet");
			this.fnGetSelector = sinon.stub(ControlInspector, "getSelector");
			this.fnGetSelector.resolves({ id: "integration-sf" });

			// Stub OPA/RecordReplay — waitFor executes the EnterText action on the real SearchField
			var that = this;
			this.fnWaitFor = sinon.stub(Opa5.prototype, "waitFor").callsFake(function (oSelector) {
				if (oSelector.actions) {
					oSelector.actions.executeOn(that.oSearchField);
				}
				return Promise.resolve();
			});
			this.fnEmptyQueue = sinon.stub(Opa5, "emptyQueue");
			this.fnWaitForUI5 = sinon.stub(RecordReplay, "waitForUI5").resolves();
		},
		afterEach: function () {
			this.oSearchField.destroy();
			this.fnUpdateSettings.restore();
			this.fnGetCodeSnippet.restore();
			this.fnGetSelector.restore();
			this.fnWaitFor.restore();
			this.fnEmptyQueue.restore();
			this.fnWaitForUI5.restore();
		}
	});

	QUnit.test("Entering text into a real SearchField updates its value", function (assert) {
		var done = assert.async();

		ControlTree.enterText("integration-sf", { text: "search query" }).then(function () {
			assert.strictEqual(this.oSearchField.getValue(), "search query",
				"SearchField value updated to entered text");
			done();
		}.bind(this));
	});

	QUnit.test("EnterText action is constructed with the passed settings", function (assert) {
		var done = assert.async();

		ControlTree.enterText("integration-sf", { text: "typed text", clearTextFirst: true, submitText: false }).then(function () {
			// Verify the EnterText instance was created with correct settings
			var oSelectorArg = this.fnWaitFor.firstCall.args[0];
			var oEnterTextAction = oSelectorArg.actions;
			assert.ok(oEnterTextAction instanceof EnterText, "actions is an EnterText instance");
			assert.strictEqual(oEnterTextAction.getText(), "typed text", "text is 'typed text'");
			assert.strictEqual(oEnterTextAction.getClearTextFirst(), true, "clearTextFirst is true");
			assert.strictEqual(oEnterTextAction.getKeepFocus(), true,
				"keepFocus is true (adapted from submitText: false)");

			// The action still executed on the real SearchField
			assert.strictEqual(this.oSearchField.getValue(), "typed text",
				"SearchField value was updated");
			done();
		}.bind(this));
	});

	QUnit.test("idSuffix from selector is merged into EnterText action settings", function (assert) {
		var done = assert.async();

		this.fnGetSelector.resolves({ id: "integration-sf", interaction: { idSuffix: "I" } });

		// Override waitFor to only capture the EnterText instance without executing
		// (the SearchField may not have an "I" sub-element, so executeOn could fail)
		this.fnWaitFor.callsFake(function (oSelector) {
			return Promise.resolve();
		});

		ControlTree.enterText("integration-sf", { text: "hello", submitText: false }).then(function () {
			var oSelectorArg = this.fnWaitFor.firstCall.args[0];
			var oEnterTextAction = oSelectorArg.actions;
			assert.strictEqual(oEnterTextAction.getIdSuffix(), "I",
				"idSuffix from selector merged into EnterText action");
			assert.strictEqual(oEnterTextAction.getKeepFocus(), true,
				"keepFocus from adapted settings preserved after merge");
			assert.strictEqual(oEnterTextAction.getText(), "hello",
				"text from caller settings preserved after merge");
			done();
		}.bind(this));
	});
});
