/*global QUnit */
sap.ui.define([
	"sap/ui/core/ControlBehavior",
	"sap/ui/core/boot/ExtendedKeyboardNavigationSupport"
], (ControlBehavior, ExtendedKeyboardNavigationSupport) => {
	"use strict";

	function fireKeydown(oOpts) {
		const oEvent = new KeyboardEvent("keydown", Object.assign({
			key: "F6",
			shiftKey: false,
			altKey: false,
			ctrlKey: false,
			metaKey: false,
			bubbles: true,
			cancelable: true
		}, oOpts));
		document.dispatchEvent(oEvent);
		return oEvent;
	}

	QUnit.module("ExtendedKeyboardNavigationSupport — module shape", {});

	QUnit.test("exports run() returning a resolved promise", function(assert) {
		assert.strictEqual(typeof ExtendedKeyboardNavigationSupport.run, "function", "run is a function");
		return ExtendedKeyboardNavigationSupport.run().then(() => {
			assert.ok(true, "run resolves");
		});
	});

	QUnit.module("ExtendedKeyboardNavigationSupport — Shift+Alt+F6 toggle", {
		beforeEach: function() {
			this.bInitial = ControlBehavior.isExtendedKeyboardNavigationEnabled();
		},
		afterEach: function() {
			// restore initial state regardless of test outcome
			if (ControlBehavior.isExtendedKeyboardNavigationEnabled() !== this.bInitial) {
				ControlBehavior.setExtendedKeyboardNavigationEnabled(this.bInitial);
			}
		}
	});

	QUnit.test("Shift+Alt+F6 toggles the Extended Keyboard Navigation", function(assert) {
		const bBefore = ControlBehavior.isExtendedKeyboardNavigationEnabled();
		fireKeydown({ shiftKey: true, altKey: true, key: "F6" });
		assert.strictEqual(
			ControlBehavior.isExtendedKeyboardNavigationEnabled(),
			!bBefore,
			"Extended Keyboard Navigation toggled"
		);
		fireKeydown({ shiftKey: true, altKey: true, key: "F6" });
		assert.strictEqual(
			ControlBehavior.isExtendedKeyboardNavigationEnabled(),
			bBefore,
			"Extended Keyboard Navigation toggled back"
		);
	});

	QUnit.test("preventDefault is called on the keydown event", function(assert) {
		const oEvent = fireKeydown({ shiftKey: true, altKey: true, key: "F6" });
		assert.ok(oEvent.defaultPrevented, "preventDefault was called");
	});

	QUnit.module("ExtendedKeyboardNavigationSupport — non-matching combinations leave state untouched", {
		beforeEach: function() {
			this.bInitial = ControlBehavior.isExtendedKeyboardNavigationEnabled();
		},
		afterEach: function() {
			// mirror the toggle module: if any non-matching case unexpectedly mutated state,
			// restore it so subsequent tests start from a known baseline.
			if (ControlBehavior.isExtendedKeyboardNavigationEnabled() !== this.bInitial) {
				ControlBehavior.setExtendedKeyboardNavigationEnabled(this.bInitial);
			}
		}
	});

	[
		// Note: "F6 alone" and "Shift+F6" are intercepted by the sap.ui.events.F6Navigation
		// framework listener (registered in UIArea.js) which calls preventDefault() on all
		// plain-F6 and Shift+F6 events as part of the fast-navigation feature. Those two cases
		// carry skipDefaultPreventedCheck:true so the assertion is not made for them.
		{ name: "F6 alone",        opts: { key: "F6" },                                        skipDefaultPreventedCheck: true },
		{ name: "Ctrl+Alt+F6",     opts: { ctrlKey: true, altKey: true, key: "F6" } },
		{ name: "Meta+Alt+F6",     opts: { metaKey: true, altKey: true, key: "F6" } },
		{ name: "Shift+Alt+F5",    opts: { shiftKey: true, altKey: true, key: "F5" } },
		{ name: "Shift+Alt+F7",    opts: { shiftKey: true, altKey: true, key: "F7" } },
		{ name: "Shift+F6",        opts: { shiftKey: true, key: "F6" },                        skipDefaultPreventedCheck: true },
		{ name: "Alt+F6",          opts: { altKey: true, key: "F6" } }
	].forEach(({ name, opts, skipDefaultPreventedCheck }) => {
		QUnit.test("no toggle on " + name, function(assert) {
			const bBefore = ControlBehavior.isExtendedKeyboardNavigationEnabled();
			const oEvent = fireKeydown(opts);
			assert.strictEqual(
				ControlBehavior.isExtendedKeyboardNavigationEnabled(),
				bBefore,
				"state unchanged"
			);
			if (!skipDefaultPreventedCheck) {
				assert.notOk(oEvent.defaultPrevented, "preventDefault was NOT called");
			}
		});
	});
});
