/*global QUnit, sinon */
sap.ui.define([
	"sap/ui/core/tooltip/TooltipEventTrigger",
	"./FakeTooltipHost",
	"sap/ui/test/utils/nextUIUpdate",
	"sap/ui/Device"
], function (TooltipEventTrigger, FakeTooltipHost, nextUIUpdate, Device) {
	"use strict";

	async function renderHost(oHost, oClock) {
		oHost.placeAt("qunit-fixture");
		await nextUIUpdate(oClock);
	}

	function makeConfig(oOverrides) {
		return Object.assign({
			onOpen: sinon.spy(),
			onClose: sinon.spy(),
			isPendingOrOpen: sinon.stub().returns(false)
		}, oOverrides || {});
	}

	function dispatch(oDomRef, oEvent) {
		oDomRef.dispatchEvent(oEvent);
	}

	QUnit.module("Construction");

	QUnit.test("getEnableForTouchDevices defaults to true", function (assert) {
		const oTrigger = new TooltipEventTrigger(makeConfig());
		try {
			assert.strictEqual(oTrigger.getEnableForTouchDevices(), true);
		} finally {
			oTrigger.destroy();
		}
	});

	QUnit.test("constructor honours enableForTouchDevices=false", function (assert) {
		const oTrigger = new TooltipEventTrigger(
			makeConfig({ enableForTouchDevices: false }));
		try {
			assert.strictEqual(oTrigger.getEnableForTouchDevices(), false);
		} finally {
			oTrigger.destroy();
		}
	});

	QUnit.module("attach/detach", {
		beforeEach: async function () {
			this.oDeviceStub = sinon.stub(Device, "system")
				.value({ desktop: true, combi: false, phone: false, tablet: false });
			this.oHost = new FakeTooltipHost();
			await renderHost(this.oHost, this.clock);
			this.oDomRef = this.oHost.getDomRef();
			this.oConfig = makeConfig();
			this.oTrigger = new TooltipEventTrigger(this.oConfig);
		},
		afterEach: async function () {
			this.oTrigger.destroy();
			this.oHost.destroy();
			this.oDeviceStub.restore();
			// Drain leftover timers before restoring the clock.
			await this.clock.tickAsync(2000);
			this.clock.restore();
		}
	});

	QUnit.test("attach wires listeners; events invoke callbacks", function (assert) {
		this.oTrigger.attach(this.oDomRef);
		dispatch(this.oDomRef, new MouseEvent("mouseenter", { bubbles: true }));
		assert.ok(this.oConfig.onOpen.calledOnceWith(true),
			"mouseenter after attach invokes onOpen");
	});

	QUnit.test("attach is chainable", function (assert) {
		assert.strictEqual(this.oTrigger.attach(this.oDomRef), this.oTrigger);
	});

	QUnit.test("attach with the same oDomRef twice is idempotent", function (assert) {
		this.oTrigger.attach(this.oDomRef);
		this.oTrigger.attach(this.oDomRef);
		dispatch(this.oDomRef, new MouseEvent("mouseenter", { bubbles: true }));
		assert.strictEqual(this.oConfig.onOpen.callCount, 1,
			"mouseenter handler installed once, not twice");
	});

	QUnit.test("attach with a different oDomRef detaches the previous one first", function (assert) {
		const oOther = document.createElement("div");
		document.getElementById("qunit-fixture").appendChild(oOther);
		try {
			this.oTrigger.attach(this.oDomRef);
			this.oTrigger.attach(oOther);

			dispatch(this.oDomRef, new MouseEvent("mouseenter", { bubbles: true }));
			assert.strictEqual(this.oConfig.onOpen.callCount, 0,
				"listeners removed from the previous oDomRef");

			dispatch(oOther, new MouseEvent("mouseenter", { bubbles: true }));
			assert.strictEqual(this.oConfig.onOpen.callCount, 1,
				"listeners wired on the new oDomRef");
		} finally {
			oOther.remove();
		}
	});

	QUnit.test("attach ignores falsy oDomRef", function (assert) {
		assert.strictEqual(this.oTrigger.attach(null), this.oTrigger,
			"returns this, no throw");
	});

	QUnit.test("detach removes listeners; events become no-ops", function (assert) {
		this.oTrigger.attach(this.oDomRef);
		this.oTrigger.detach();
		dispatch(this.oDomRef, new MouseEvent("mouseenter", { bubbles: true }));
		assert.notOk(this.oConfig.onOpen.called, "no callback after detach");
	});

	QUnit.test("detach is chainable", function (assert) {
		this.oTrigger.attach(this.oDomRef);
		assert.strictEqual(this.oTrigger.detach(), this.oTrigger);
	});

	QUnit.test("detach when nothing is attached is a no-op", function (assert) {
		assert.strictEqual(this.oTrigger.detach(), this.oTrigger,
			"no throw, chainable");
	});

	QUnit.test("destroy detaches the attached ref", function (assert) {
		this.oTrigger.attach(this.oDomRef);
		this.oTrigger.destroy();
		dispatch(this.oDomRef, new MouseEvent("mouseenter", { bubbles: true }));
		assert.notOk(this.oConfig.onOpen.called, "no callback after destroy");
		// Re-create so afterEach's destroy is safe.
		this.oTrigger = new TooltipEventTrigger(this.oConfig);
	});

	QUnit.test("double-destroy is safe", function (assert) {
		this.oTrigger.attach(this.oDomRef);
		this.oTrigger.destroy();
		this.oTrigger.destroy();
		assert.ok(true, "no throw");
		this.oTrigger = new TooltipEventTrigger(this.oConfig);
	});

	QUnit.module("Setters", {
		beforeEach: async function () {
			this.oDeviceStub = sinon.stub(Device, "system")
				.value({ desktop: false, combi: false, phone: true, tablet: false });
			this.oHost = new FakeTooltipHost();
			await renderHost(this.oHost, this.clock);
			this.oDomRef = this.oHost.getDomRef();
			this.oConfig = makeConfig();
			this.oTrigger = new TooltipEventTrigger(this.oConfig);
			this.oTrigger.attach(this.oDomRef);
		},
		afterEach: async function () {
			this.oTrigger.destroy();
			this.oHost.destroy();
			this.oDeviceStub.restore();
			// Drain leftover timers before restoring the clock.
			await this.clock.tickAsync(2000);
			this.clock.restore();
		}
	});

	QUnit.test("setEnableForTouchDevices round-trip is chainable", function (assert) {
		assert.strictEqual(this.oTrigger.setEnableForTouchDevices(false), this.oTrigger,
			"chainable");
		assert.strictEqual(this.oTrigger.getEnableForTouchDevices(), false);
		this.oTrigger.setEnableForTouchDevices(true);
		assert.strictEqual(this.oTrigger.getEnableForTouchDevices(), true);
	});

	QUnit.test("setEnableForTouchDevices reflects in contextmenu behavior", function (assert) {
		const oFirst = new MouseEvent("contextmenu", { cancelable: true, bubbles: true });
		dispatch(this.oDomRef, oFirst);
		assert.ok(oFirst.defaultPrevented, "contextmenu prevented while enabled");

		this.oTrigger.setEnableForTouchDevices(false);
		const oSecond = new MouseEvent("contextmenu", { cancelable: true, bubbles: true });
		dispatch(this.oDomRef, oSecond);
		assert.notOk(oSecond.defaultPrevented, "contextmenu not prevented after disabling");

		this.oTrigger.setEnableForTouchDevices(true);
		const oThird = new MouseEvent("contextmenu", { cancelable: true, bubbles: true });
		dispatch(this.oDomRef, oThird);
		assert.ok(oThird.defaultPrevented, "contextmenu prevented again after re-enabling");
	});

	QUnit.module("Desktop events", {
		beforeEach: async function () {
			// Reset the sticky initial-focus state before the trigger is built,
			// so each test starts from a clean slate regardless of order.
			TooltipEventTrigger._resetInitialFocusForTesting();
			this.oDeviceStub = sinon.stub(Device, "system")
				.value({ desktop: true, combi: false, phone: false, tablet: false });
			this.oHost = new FakeTooltipHost();
			await renderHost(this.oHost, this.clock);
			this.oDomRef = this.oHost.getDomRef();
			this.oConfig = makeConfig();
			this.oTrigger = new TooltipEventTrigger(this.oConfig);
			this.oTrigger.attach(this.oDomRef);
		},
		afterEach: async function () {
			this.oTrigger.destroy();
			this.oHost.destroy();
			this.oDeviceStub.restore();
			// Drain leftover timers before restoring the clock.
			await this.clock.tickAsync(2000);
			this.clock.restore();
		}
	});

	QUnit.test("left mousedown invokes onClose(false)", function (assert) {
		dispatch(this.oDomRef, new MouseEvent("mousedown", { button: 0, bubbles: true }));
		assert.ok(this.oConfig.onClose.calledOnce && !this.oConfig.onClose.firstCall.args[0]);
	});

	QUnit.test("right mousedown is ignored", function (assert) {
		dispatch(this.oDomRef, new MouseEvent("mousedown", { button: 2, bubbles: true }));
		assert.notOk(this.oConfig.onClose.called);
	});

	QUnit.test("mousedown is ignored while text is selected", function (assert) {
		const oOrig = window.getSelection;
		window.getSelection = function () {
			return { toString: function () { return "selected"; } };
		};
		try {
			dispatch(this.oDomRef, new MouseEvent("mousedown", { button: 0, bubbles: true }));
			assert.notOk(this.oConfig.onClose.called,
				"onClose not called while selection exists");
		} finally {
			window.getSelection = oOrig;
		}
	});

	QUnit.test("mouseenter invokes onOpen(true)", function (assert) {
		dispatch(this.oDomRef, new MouseEvent("mouseenter", { bubbles: true }));
		assert.ok(this.oConfig.onOpen.calledOnceWith(true));
	});

	QUnit.test("mouseenter is ignored while text is selected", function (assert) {
		const oOrig = window.getSelection;
		window.getSelection = function () {
			return { toString: function () { return "selected"; } };
		};
		try {
			dispatch(this.oDomRef, new MouseEvent("mouseenter", { bubbles: true }));
			assert.notOk(this.oConfig.onOpen.called);
		} finally {
			window.getSelection = oOrig;
		}
	});

	QUnit.test("mouseleave invokes onClose(true)", function (assert) {
		dispatch(this.oDomRef, new MouseEvent("mouseleave", { bubbles: true }));
		assert.ok(this.oConfig.onClose.calledOnceWith(true));
	});

	QUnit.test("focusin with :focus-visible after keyboard navigation invokes onOpen(true)", function (assert) {
		const oOrig = this.oDomRef.matches;
		this.oDomRef.matches = function (s) {
			return s === ":focus-visible" || oOrig.call(this, s);
		};
		try {
			// Keyboard navigation must precede the focusin to leave initial focus.
			dispatch(document, new KeyboardEvent("keydown", { key: "Tab", bubbles: true }));
			dispatch(this.oDomRef, new FocusEvent("focusin", { bubbles: true }));
			assert.ok(this.oConfig.onOpen.calledOnceWith(true));
		} finally {
			this.oDomRef.matches = oOrig;
		}
	});

	QUnit.test("focusin without :focus-visible does not invoke onOpen", function (assert) {
		const oOrig = this.oDomRef.matches;
		this.oDomRef.matches = function (s) {
			return s === ":focus-visible" ? false : oOrig.call(this, s);
		};
		try {
			dispatch(document, new KeyboardEvent("keydown", { key: "Tab", bubbles: true }));
			dispatch(this.oDomRef, new FocusEvent("focusin", { bubbles: true }));
			assert.notOk(this.oConfig.onOpen.called);
		} finally {
			this.oDomRef.matches = oOrig;
		}
	});

	QUnit.test("focusin during initial focus does not invoke onOpen", function (assert) {
		const oOrig = this.oDomRef.matches;
		this.oDomRef.matches = function (s) {
			return s === ":focus-visible" || oOrig.call(this, s);
		};
		try {
			// No navigation key has been pressed, so focus is still initial.
			dispatch(this.oDomRef, new FocusEvent("focusin", { bubbles: true }));
			assert.notOk(this.oConfig.onOpen.called,
				"initial focus is suppressed even with :focus-visible");
		} finally {
			this.oDomRef.matches = oOrig;
		}
	});

	QUnit.test("any keydown ends initial focus, regardless of key or modifier", function (assert) {
		const oOrig = this.oDomRef.matches;
		this.oDomRef.matches = function (s) {
			return s === ":focus-visible" || oOrig.call(this, s);
		};
		try {
			// A non-navigation, modified key still counts as user activity.
			dispatch(document, new KeyboardEvent("keydown", { key: "a", ctrlKey: true, bubbles: true }));
			dispatch(this.oDomRef, new FocusEvent("focusin", { bubbles: true }));
			assert.ok(this.oConfig.onOpen.calledOnceWith(true),
				"focus after any keydown opens the tooltip");
		} finally {
			this.oDomRef.matches = oOrig;
		}
	});

	QUnit.test("initial focus stays ended after the first navigation key", function (assert) {
		const oOrig = this.oDomRef.matches;
		this.oDomRef.matches = function (s) {
			return s === ":focus-visible" || oOrig.call(this, s);
		};
		try {
			dispatch(document, new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
			dispatch(this.oDomRef, new FocusEvent("focusin", { bubbles: true }));
			assert.ok(this.oConfig.onOpen.calledOnceWith(true), "first focus after navigation opens");

			// The flag is sticky: a later focus still opens without a new keydown.
			dispatch(this.oDomRef, new FocusEvent("focusout", { bubbles: true }));
			dispatch(this.oDomRef, new FocusEvent("focusin", { bubbles: true }));
			assert.strictEqual(this.oConfig.onOpen.callCount, 2,
				"subsequent focus still opens without another navigation key");
		} finally {
			this.oDomRef.matches = oOrig;
		}
	});

	QUnit.test("focusout invokes onClose(true)", function (assert) {
		dispatch(this.oDomRef, new FocusEvent("focusout", { bubbles: true }));
		assert.ok(this.oConfig.onClose.calledOnceWith(true));
	});

	QUnit.test("Escape consumes the event when isPendingOrOpen returns true", function (assert) {
		this.oConfig.isPendingOrOpen.returns(true);
		const oEvent = new KeyboardEvent("keydown", {
			key: "Escape", cancelable: true, bubbles: true
		});
		dispatch(this.oDomRef, oEvent);
		assert.ok(this.oConfig.onClose.calledOnce && !this.oConfig.onClose.firstCall.args[0]);
		assert.ok(oEvent.defaultPrevented, "Escape was preventDefault'd");
	});

	QUnit.test("Escape is a no-op when isPendingOrOpen returns false", function (assert) {
		const oEvent = new KeyboardEvent("keydown", {
			key: "Escape", cancelable: true, bubbles: true
		});
		dispatch(this.oDomRef, oEvent);
		assert.notOk(this.oConfig.onClose.called, "onClose not called");
		assert.notOk(oEvent.defaultPrevented,
			"Escape stays available to ancestors");
	});

	QUnit.test("non-Escape keydown is ignored", function (assert) {
		dispatch(this.oDomRef, new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
		assert.notOk(this.oConfig.onOpen.called);
		assert.notOk(this.oConfig.onClose.called);
	});

	QUnit.module("Phone events", {
		beforeEach: async function () {
			this.oDeviceStub = sinon.stub(Device, "system")
				.value({ desktop: false, combi: false, phone: true, tablet: false });
			this.oHost = new FakeTooltipHost();
			await renderHost(this.oHost, this.clock);
			this.oDomRef = this.oHost.getDomRef();
			this.oConfig = makeConfig();
			this.oTrigger = new TooltipEventTrigger(this.oConfig);
			this.oTrigger.attach(this.oDomRef);
		},
		afterEach: async function () {
			this.oTrigger.destroy();
			this.oHost.destroy();
			this.oDeviceStub.restore();
			// Drain leftover timers before restoring the clock.
			await this.clock.tickAsync(2000);
			this.clock.restore();
		}
	});

	QUnit.test("contextmenu is prevented when enableForTouchDevices=true (default)", function (assert) {
		const oEvent = new MouseEvent("contextmenu", { cancelable: true, bubbles: true });
		dispatch(this.oDomRef, oEvent);
		assert.ok(oEvent.defaultPrevented);
	});

	QUnit.test("contextmenu is NOT prevented when enableForTouchDevices=false", function (assert) {
		this.oTrigger.setEnableForTouchDevices(false);
		const oEvent = new MouseEvent("contextmenu", { cancelable: true, bubbles: true });
		dispatch(this.oDomRef, oEvent);
		assert.notOk(oEvent.defaultPrevented);
	});

	QUnit.test("long-press (500 ms) invokes onOpen(false)", function (assert) {
		dispatch(this.oDomRef, new Event("touchstart", { bubbles: false }));
		assert.notOk(this.oConfig.onOpen.called, "not yet, timer pending");
		this.clock.tick(499);
		assert.notOk(this.oConfig.onOpen.called, "still not at 499 ms");
		this.clock.tick(1);
		assert.ok(this.oConfig.onOpen.calledOnce && !this.oConfig.onOpen.firstCall.args[0], "fired at 500 ms");
	});

	QUnit.test("touchmove cancels the long-press timer", function (assert) {
		dispatch(this.oDomRef, new Event("touchstart", { bubbles: false }));
		dispatch(this.oDomRef, new Event("touchmove", { bubbles: false }));
		this.clock.tick(1000);
		assert.notOk(this.oConfig.onOpen.called);
	});

	QUnit.test("touchend cancels the long-press timer", function (assert) {
		dispatch(this.oDomRef, new Event("touchstart", { bubbles: false }));
		dispatch(this.oDomRef, new Event("touchend", { bubbles: false }));
		this.clock.tick(1000);
		assert.notOk(this.oConfig.onOpen.called);
	});

	QUnit.test("touchcancel cancels the long-press timer", function (assert) {
		dispatch(this.oDomRef, new Event("touchstart", { bubbles: false }));
		dispatch(this.oDomRef, new Event("touchcancel", { bubbles: false }));
		this.clock.tick(1000);
		assert.notOk(this.oConfig.onOpen.called);
	});

	QUnit.test("touchstart is ignored when enableForTouchDevices=false", function (assert) {
		this.oTrigger.setEnableForTouchDevices(false);
		dispatch(this.oDomRef, new Event("touchstart", { bubbles: false }));
		this.clock.tick(1000);
		assert.notOk(this.oConfig.onOpen.called,
			"timer not even started when disabled");
	});

	QUnit.module("Combi events (desktop wiring, no mobile)", {
		beforeEach: async function () {
			this.oDeviceStub = sinon.stub(Device, "system")
				.value({ desktop: false, combi: true, phone: true, tablet: true });
			this.oHost = new FakeTooltipHost();
			await renderHost(this.oHost, this.clock);
			this.oDomRef = this.oHost.getDomRef();
			this.oConfig = makeConfig();
			this.oTrigger = new TooltipEventTrigger(this.oConfig);
			this.oTrigger.attach(this.oDomRef);
		},
		afterEach: async function () {
			this.oTrigger.destroy();
			this.oHost.destroy();
			this.oDeviceStub.restore();
			// Drain leftover timers before restoring the clock.
			await this.clock.tickAsync(2000);
			this.clock.restore();
		}
	});

	QUnit.test("combi gets desktop events (mouseenter invokes onOpen)", function (assert) {
		dispatch(this.oDomRef, new MouseEvent("mouseenter", { bubbles: true }));
		assert.ok(this.oConfig.onOpen.calledOnceWith(true));
	});

	QUnit.test("combi does NOT prevent contextmenu (no mobile wiring)", function (assert) {
		const oEvent = new MouseEvent("contextmenu", { cancelable: true, bubbles: true });
		dispatch(this.oDomRef, oEvent);
		assert.notOk(oEvent.defaultPrevented);
	});

	QUnit.module("Tablet events", {
		beforeEach: async function () {
			this.oDeviceStub = sinon.stub(Device, "system")
				.value({ desktop: false, combi: false, phone: false, tablet: true });
			this.oHost = new FakeTooltipHost();
			await renderHost(this.oHost, this.clock);
			this.oDomRef = this.oHost.getDomRef();
			this.oConfig = makeConfig();
			this.oTrigger = new TooltipEventTrigger(this.oConfig);
			this.oTrigger.attach(this.oDomRef);
		},
		afterEach: async function () {
			this.oTrigger.destroy();
			this.oHost.destroy();
			this.oDeviceStub.restore();
			// Drain leftover timers before restoring the clock.
			await this.clock.tickAsync(2000);
			this.clock.restore();
		}
	});

	QUnit.test("tablet prevents contextmenu by default", function (assert) {
		const oEvent = new MouseEvent("contextmenu", { cancelable: true, bubbles: true });
		dispatch(this.oDomRef, oEvent);
		assert.ok(oEvent.defaultPrevented);
	});

	QUnit.module("Initial-focus document listener lifecycle", {
		beforeEach: function () {
			TooltipEventTrigger._resetInitialFocusForTesting();
			this.oAddSpy = sinon.spy(document, "addEventListener");
			this.oRemoveSpy = sinon.spy(document, "removeEventListener");
		},
		afterEach: function () {
			this.oAddSpy.restore();
			this.oRemoveSpy.restore();
			TooltipEventTrigger._resetInitialFocusForTesting();
		},
		keydownAdds: function () {
			return this.oAddSpy.getCalls().filter(
				(oCall) => oCall.args[0] === "keydown").length;
		},
		keydownRemoves: function () {
			return this.oRemoveSpy.getCalls().filter(
				(oCall) => oCall.args[0] === "keydown").length;
		}
	});

	QUnit.test("first trigger attaches the document keydown listener; second does not", function (assert) {
		const oFirst = new TooltipEventTrigger(makeConfig());
		const oSecond = new TooltipEventTrigger(makeConfig());
		try {
			assert.strictEqual(this.keydownAdds(), 1,
				"only the first trigger attaches the shared listener");
		} finally {
			oFirst.destroy();
			oSecond.destroy();
		}
	});

	QUnit.test("listener is detached only when the last trigger is destroyed", function (assert) {
		const oFirst = new TooltipEventTrigger(makeConfig());
		const oSecond = new TooltipEventTrigger(makeConfig());

		oFirst.destroy();
		assert.strictEqual(this.keydownRemoves(), 0,
			"listener stays while another trigger is alive");

		oSecond.destroy();
		assert.strictEqual(this.keydownRemoves(), 1,
			"listener is removed once the last trigger is gone");
	});

	QUnit.test("navigation keydown ends initial focus and detaches the listener", function (assert) {
		const oTrigger = new TooltipEventTrigger(makeConfig());
		try {
			dispatch(document, new KeyboardEvent("keydown", { key: "Tab", bubbles: true }));
			assert.strictEqual(this.keydownRemoves(), 1,
				"listener detaches itself after the first navigation key");
		} finally {
			oTrigger.destroy();
		}
	});

	QUnit.test("a new trigger re-attaches the listener while focus is still initial", function (assert) {
		const oFirst = new TooltipEventTrigger(makeConfig());
		oFirst.destroy();
		assert.strictEqual(this.keydownRemoves(), 1, "listener removed with the last trigger");

		const oSecond = new TooltipEventTrigger(makeConfig());
		try {
			assert.strictEqual(this.keydownAdds(), 2,
				"new trigger re-attaches the listener because focus is still initial");
		} finally {
			oSecond.destroy();
		}
	});

	QUnit.test("a new trigger does not re-attach after initial focus has passed", function (assert) {
		const oFirst = new TooltipEventTrigger(makeConfig());
		// End initial focus, which also detaches the listener.
		dispatch(document, new KeyboardEvent("keydown", { key: "Tab", bubbles: true }));
		oFirst.destroy();
		const iAddsSoFar = this.keydownAdds();

		const oSecond = new TooltipEventTrigger(makeConfig());
		try {
			assert.strictEqual(this.keydownAdds(), iAddsSoFar,
				"no re-attach once initial focus is over (flag is sticky)");
		} finally {
			oSecond.destroy();
		}
	});
});
