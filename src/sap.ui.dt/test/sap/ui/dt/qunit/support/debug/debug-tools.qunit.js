/* global QUnit */

sap.ui.define([
	"sap/ui/core/Element",
	"sap/ui/dt/support/debug/debug-tools",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/thirdparty/sinon-4"
], function(
	Element,
	debugTools,
	OverlayRegistry,
	sinon
) {
	"use strict";
	const sandbox = sinon.createSandbox();

	QUnit.module("Basic structure", {
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("provides help entries", function(assert) {
			assert.ok(Array.isArray(debugTools.__help), "then __help is an array");
			assert.strictEqual(debugTools.__help.length, 2, "then two help entries are provided");
			debugTools.__help.forEach(function(oEntry) {
				assert.ok(typeof oEntry.cmd === "string" && oEntry.cmd.length > 0, "then the entry has a command string");
				assert.ok(typeof oEntry.text === "string" && oEntry.text.length > 0, "then the entry has a description text");
			});
		});

		QUnit.test("exposes the tools under the 'flexDt' sub-namespace", function(assert) {
			assert.ok(debugTools.flexDt, "then the flexDt scope exists");
			assert.strictEqual(typeof debugTools.flexDt.getOverlay, "function", "then getOverlay is a function");
			assert.strictEqual(typeof debugTools.flexDt.getEditableOverlays, "function", "then getEditableOverlays is a function");
		});

		QUnit.test("the flexDt scope does not inherit from Object.prototype", function(assert) {
			assert.strictEqual(Object.getPrototypeOf(debugTools.flexDt), null, "then the scope has no prototype chain");
		});
	});

	QUnit.module("getOverlay", {
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("resolves an overlay by id (string)", function(assert) {
			const oOverlay = { id: "overlay1" };
			const oGetOverlayStub = sandbox.stub(OverlayRegistry, "getOverlay").returns(oOverlay);

			const oResult = debugTools.flexDt.getOverlay("myControlId");

			assert.ok(oGetOverlayStub.calledOnce, "then OverlayRegistry.getOverlay was called once");
			assert.strictEqual(oGetOverlayStub.getCall(0).args[0], "myControlId", "then the id is passed through unchanged");
			assert.strictEqual(oResult, oOverlay, "then the registered overlay is returned");
		});

		QUnit.test("resolves an overlay by UI5 element instance", function(assert) {
			const oElement = { getId: () => "elementId" };
			const oOverlay = { id: "overlay2" };
			const oClosestToSpy = sandbox.spy(Element, "closestTo");
			const oGetOverlayStub = sandbox.stub(OverlayRegistry, "getOverlay").returns(oOverlay);

			const oResult = debugTools.flexDt.getOverlay(oElement);

			assert.notOk(oClosestToSpy.called, "then Element.closestTo is not called for a non-DOM argument");
			assert.strictEqual(oGetOverlayStub.getCall(0).args[0], oElement, "then the element is passed through unchanged");
			assert.strictEqual(oResult, oOverlay, "then the registered overlay is returned");
		});

		QUnit.test("resolves a DOM node to the closest UI5 element first", function(assert) {
			const oDomNode = document.createElement("div");
			const oElement = { getId: () => "closestElementId" };
			const oOverlay = { id: "overlay3" };
			const oClosestToStub = sandbox.stub(Element, "closestTo").returns(oElement);
			const oGetOverlayStub = sandbox.stub(OverlayRegistry, "getOverlay").returns(oOverlay);

			const oResult = debugTools.flexDt.getOverlay(oDomNode);

			assert.ok(oClosestToStub.calledOnce, "then Element.closestTo was called for the DOM node");
			assert.strictEqual(oClosestToStub.getCall(0).args[0], oDomNode, "then the DOM node was passed to closestTo");
			assert.strictEqual(oGetOverlayStub.getCall(0).args[0], oElement, "then the resolved element is used to look up the overlay");
			assert.strictEqual(oResult, oOverlay, "then the registered overlay is returned");
		});

		QUnit.test("returns undefined when no overlay is registered", function(assert) {
			sandbox.stub(OverlayRegistry, "getOverlay").returns(undefined);

			const oResult = debugTools.flexDt.getOverlay("unknownId");

			assert.strictEqual(oResult, undefined, "then undefined is returned");
		});
	});

	QUnit.module("getEditableOverlays", {
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("returns only the editable overlays", function(assert) {
			const oEditableOverlay = { isEditable: () => true };
			const oNonEditableOverlay = { isEditable: () => false };
			sandbox.stub(OverlayRegistry, "getOverlays").returns([oEditableOverlay, oNonEditableOverlay]);

			const aResult = debugTools.flexDt.getEditableOverlays();

			assert.deepEqual(aResult, [oEditableOverlay], "then only the editable overlay is returned");
		});

		QUnit.test("ignores overlays without an isEditable method", function(assert) {
			const oEditableOverlay = { isEditable: () => true };
			const oOverlayWithoutMethod = {};
			sandbox.stub(OverlayRegistry, "getOverlays").returns([oEditableOverlay, oOverlayWithoutMethod]);

			const aResult = debugTools.flexDt.getEditableOverlays();

			assert.deepEqual(aResult, [oEditableOverlay], "then overlays without isEditable are filtered out via optional chaining");
		});

		QUnit.test("returns an empty array when there are no overlays", function(assert) {
			sandbox.stub(OverlayRegistry, "getOverlays").returns([]);

			const aResult = debugTools.flexDt.getEditableOverlays();

			assert.deepEqual(aResult, [], "then an empty array is returned");
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
