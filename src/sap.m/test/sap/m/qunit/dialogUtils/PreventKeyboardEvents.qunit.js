/* global QUnit */

sap.ui.define([
	"sap/m/dialogUtils/PreventKeyboardEvents"
], (
	PreventKeyboardEvents
) => {
	"use strict";

	const DOM_RENDER_LOCATION = "qunit-fixture";

    function createKeyboardEvent(sType, sKey) {
        return new KeyboardEvent(sType, {
			key: sKey,
			bubbles: true,
			cancelable: true
		});
    }

	QUnit.module("Prevent keyboard events", {
		beforeEach: () => {
			this.oTestElement = document.createElement("div");
			this.oTestElement.id = "test-element";
			this.oTestElement.innerHTML = '<textarea id="test-input" />';
			document.getElementById(DOM_RENDER_LOCATION).appendChild(this.oTestElement);
		},
		afterEach: () => {
			document.getElementById(DOM_RENDER_LOCATION).removeChild(this.oTestElement);
		}
	});

	QUnit.test("preventOnce - should prevent keypress and keyup events once", (assert) => {
		const oInput = this.oTestElement.querySelector("#test-input");
		let keypressEventFired = false;
		let keyupEventFired = false;

		oInput.addEventListener("keypress", () => {
			keypressEventFired = true;
		});
		oInput.addEventListener("keyup", () => {
			keyupEventFired = true;
		});

		PreventKeyboardEvents.preventOnce(this.oTestElement);

		// Simulate keypress event
		const keypressEvent = createKeyboardEvent("keypress", "a");
		oInput.dispatchEvent(keypressEvent);

		// Simulate keyup event
		const keyupEvent = createKeyboardEvent("keyup", "a");
		oInput.dispatchEvent(keyupEvent);

		assert.notOk(keypressEventFired, "Keypress event should be prevented");
		assert.notOk(keyupEventFired, "Keyup event should be prevented");
		assert.ok(keypressEvent.defaultPrevented, "Keypress event should have preventDefault called");
		assert.ok(keyupEvent.defaultPrevented, "Keyup event should have preventDefault called");
	});

	QUnit.test("preventOnce - should only prevent events once", (assert) => {
		const oInput = this.oTestElement.querySelector("#test-input");
		let keypressEventCount = 0;
		let keyupEventCount = 0;

		oInput.addEventListener("keypress", () => {
			keypressEventCount++;
		});
		oInput.addEventListener("keyup", () => {
			keyupEventCount++;
		});

		// Prevent events once
		PreventKeyboardEvents.preventOnce(this.oTestElement);

		// First set of events - should be prevented
		const keypressEvent1 = createKeyboardEvent("keypress", "a");
		const keyupEvent1 = createKeyboardEvent("keyup", "a");

		oInput.dispatchEvent(keypressEvent1);
		oInput.dispatchEvent(keyupEvent1);

		// Second set of events - should NOT be prevented
		const keypressEvent2 = createKeyboardEvent("keypress", "a");
		const keyupEvent2 = createKeyboardEvent("keyup", "a");

		oInput.dispatchEvent(keypressEvent2);
		oInput.dispatchEvent(keyupEvent2);

		assert.strictEqual(keypressEventCount, 1, "Only second keypress event should reach the target");
		assert.strictEqual(keyupEventCount, 1, "Only second keyup event should reach the target");
		assert.ok(keypressEvent1.defaultPrevented, "First keypress should be prevented");
		assert.ok(keyupEvent1.defaultPrevented, "First keyup should be prevented");
		assert.notOk(keypressEvent2.defaultPrevented, "Second keypress should not be prevented");
		assert.notOk(keyupEvent2.defaultPrevented, "Second keyup should not be prevented");
	});

	QUnit.test("preventOnce - should handle different keyboard event types correctly", (assert) => {
		const oInput = this.oTestElement.querySelector("#test-input");
		let keydownEventFired = false;
		let keypressEventFired = false;
		let keyupEventFired = false;

		oInput.addEventListener("keydown", () => {
			keydownEventFired = true;
		});
		oInput.addEventListener("keypress", () => {
			keypressEventFired = true;
		});
		oInput.addEventListener("keyup", () => {
			keyupEventFired = true;
		});

		PreventKeyboardEvents.preventOnce(this.oTestElement);

		// Simulate all keyboard event types
		const keydownEvent = createKeyboardEvent("keydown", "a");
		const keypressEvent = createKeyboardEvent("keypress", "a");
		const keyupEvent = createKeyboardEvent("keyup", "a");

		oInput.dispatchEvent(keydownEvent);
		oInput.dispatchEvent(keypressEvent);
		oInput.dispatchEvent(keyupEvent);

		assert.ok(keydownEventFired, "Keydown event should not be prevented (not handled by module)");
		assert.notOk(keypressEventFired, "Keypress event should be prevented");
		assert.notOk(keyupEventFired, "Keyup event should be prevented");
		assert.notOk(keydownEvent.defaultPrevented, "Keydown should not be prevented");
		assert.ok(keypressEvent.defaultPrevented, "Keypress should be prevented");
		assert.ok(keyupEvent.defaultPrevented, "Keyup should be prevented");
	});

	QUnit.test("preventOnce - should handle null/undefined element gracefully", (assert) => {
		PreventKeyboardEvents.preventOnce(null);
		PreventKeyboardEvents.preventOnce(undefined);

        assert.ok(true, "No errors thrown for null/undefined element");
	});

	QUnit.test("restore - should stop preventing the events", (assert) => {
		const oInput = this.oTestElement.querySelector("#test-input");
		let keypressEventFired = false;
		let keyupEventFired = false;

		oInput.addEventListener("keypress", () => {
			keypressEventFired = true;
		});
		oInput.addEventListener("keyup", () => {
			keyupEventFired = true;
		});

		PreventKeyboardEvents.preventOnce(this.oTestElement);

		PreventKeyboardEvents.restore(this.oTestElement);

		// Simulate events after restore
		const keypressEvent = createKeyboardEvent("keypress", "a");
		const keyupEvent = createKeyboardEvent("keyup", "a");

		oInput.dispatchEvent(keypressEvent);
		oInput.dispatchEvent(keyupEvent);

		assert.ok(keypressEventFired, "Keypress event should reach target after restore");
		assert.ok(keyupEventFired, "Keyup event should reach target after restore");
	});

	QUnit.test("restore - should handle null/undefined element gracefully", (assert) => {
		PreventKeyboardEvents.restore(null);
		PreventKeyboardEvents.restore(undefined);

        assert.ok(true, "No errors thrown for null/undefined element");
	});
});