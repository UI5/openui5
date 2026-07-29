/*global QUnit, sinon */
sap.ui.define([
	"sap/ui/core/tooltip/TooltipEventTrigger",
	"./FakeControls",
	"sap/ui/test/utils/nextUIUpdate",
	"sap/ui/Device"
], function (TooltipEventTrigger, FakeControls, nextUIUpdate, Device) {
	"use strict";

	const { FocusableHost, TwoTargetHost } = FakeControls;

	async function renderHost(oHost, oClock) {
		oHost.placeAt("qunit-fixture");
		await nextUIUpdate(oClock);
	}

	function makeConfig(oHost, oTargetEl, oOverrides) {
		return Object.assign({
			host: oHost,
			domRefProvider: () => oTargetEl,
			onOpen: sinon.spy(),
			onClose: sinon.spy(),
			isPendingOrOpen: sinon.stub().returns(false)
		}, oOverrides || {});
	}

	// Dispatches so the event bubbles to the host root where the delegate lives.
	function dispatch(oDomRef, oEvent) {
		oDomRef.dispatchEvent(oEvent);
	}

	QUnit.module("Construction");

	QUnit.test("getEnableForTouchDevices defaults to true", function (assert) {
		const oTrigger = new TooltipEventTrigger(makeConfig(null, null));
		try {
			assert.strictEqual(oTrigger.getEnableForTouchDevices(), true);
		} finally {
			oTrigger.destroy();
		}
	});

	QUnit.test("constructor honours enableForTouchDevices=false", function (assert) {
		const oTrigger = new TooltipEventTrigger(
			makeConfig(null, null, { enableForTouchDevices: false }));
		try {
			assert.strictEqual(oTrigger.getEnableForTouchDevices(), false);
		} finally {
			oTrigger.destroy();
		}
	});

	QUnit.module("Setters", {
		beforeEach: async function () {
			this.oDeviceStub = sinon.stub(Device, "system")
				.value({ desktop: false, combi: false, phone: true, tablet: false });
			this.oHost = new FocusableHost();
			await renderHost(this.oHost, this.clock);
			this.oDomRef = this.oHost.getDomRef();
			this.oConfig = makeConfig(this.oHost, this.oDomRef);
			this.oTrigger = new TooltipEventTrigger(this.oConfig);
		},
		afterEach: async function () {
			this.oTrigger.destroy();
			this.oHost.destroy();
			this.oDeviceStub.restore();
			await this.clock.tickAsync(2000);
			this.clock.restore();
		}
	});

	QUnit.test("setEnableForTouchDevices round-trip is chainable", function (assert) {
		assert.strictEqual(this.oTrigger.setEnableForTouchDevices(false), this.oTrigger, "chainable");
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
			TooltipEventTrigger._resetInitialFocusForTesting();
			this.oDeviceStub = sinon.stub(Device, "system")
				.value({ desktop: true, combi: false, phone: false, tablet: false });
			this.oHost = new FocusableHost();
			await renderHost(this.oHost, this.clock);
			this.oDomRef = this.oHost.getDomRef();
			this.oConfig = makeConfig(this.oHost, this.oDomRef);
			this.oTrigger = new TooltipEventTrigger(this.oConfig);
		},
		afterEach: async function () {
			this.oTrigger.destroy();
			this.oHost.destroy();
			this.oDeviceStub.restore();
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
			assert.notOk(this.oConfig.onClose.called);
		} finally {
			window.getSelection = oOrig;
		}
	});

	QUnit.test("mouseover invokes onOpen(true)", function (assert) {
		dispatch(this.oDomRef, new MouseEvent("mouseover", { bubbles: true }));
		assert.ok(this.oConfig.onOpen.calledOnceWith(true));
	});

	QUnit.test("mouseover is ignored while text is selected", function (assert) {
		const oOrig = window.getSelection;
		window.getSelection = function () {
			return { toString: function () { return "selected"; } };
		};
		try {
			dispatch(this.oDomRef, new MouseEvent("mouseover", { bubbles: true }));
			assert.notOk(this.oConfig.onOpen.called);
		} finally {
			window.getSelection = oOrig;
		}
	});

	QUnit.test("mouseout invokes onClose(true)", function (assert) {
		dispatch(this.oDomRef, new MouseEvent("mouseout", { bubbles: true }));
		assert.ok(this.oConfig.onClose.calledOnceWith(true));
	});

	QUnit.test("mouseover whose relatedTarget is inside the target does not invoke onOpen", function (assert) {
		const oChild = document.createElement("span");
		const oRelated = document.createElement("span");
		this.oDomRef.appendChild(oChild);
		this.oDomRef.appendChild(oRelated);
		try {
			// Inner move: both target and relatedTarget are inside the target.
			dispatch(oChild, new MouseEvent("mouseover", { bubbles: true, relatedTarget: oRelated }));
			assert.notOk(this.oConfig.onOpen.called, "onOpen not called for inner mouseover");
		} finally {
			this.oDomRef.removeChild(oChild);
			this.oDomRef.removeChild(oRelated);
		}
	});

	QUnit.test("mouseout whose relatedTarget is inside the target does not invoke onClose", function (assert) {
		const oChild = document.createElement("span");
		const oRelated = document.createElement("span");
		this.oDomRef.appendChild(oChild);
		this.oDomRef.appendChild(oRelated);
		try {
			// Inner move: both target and relatedTarget are inside the target.
			dispatch(oChild, new MouseEvent("mouseout", { bubbles: true, relatedTarget: oRelated }));
			assert.notOk(this.oConfig.onClose.called, "onClose not called for inner mouseout");
		} finally {
			this.oDomRef.removeChild(oChild);
			this.oDomRef.removeChild(oRelated);
		}
	});

	QUnit.test("focusin with :focus-visible after keyboard navigation invokes onOpen(true)", function (assert) {
		const oOrig = this.oDomRef.matches;
		this.oDomRef.matches = function (s) {
			return s === ":focus-visible" || oOrig.call(this, s);
		};
		try {
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
			dispatch(this.oDomRef, new FocusEvent("focusin", { bubbles: true }));
			assert.notOk(this.oConfig.onOpen.called);
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
		const oEvent = new KeyboardEvent("keydown", { key: "Escape", cancelable: true, bubbles: true });
		dispatch(this.oDomRef, oEvent);
		assert.ok(this.oConfig.onClose.calledOnce && !this.oConfig.onClose.firstCall.args[0]);
		assert.ok(oEvent.defaultPrevented);
	});

	QUnit.test("Escape is a no-op when isPendingOrOpen returns false", function (assert) {
		const oEvent = new KeyboardEvent("keydown", { key: "Escape", cancelable: true, bubbles: true });
		dispatch(this.oDomRef, oEvent);
		assert.notOk(this.oConfig.onClose.called);
		assert.notOk(oEvent.defaultPrevented);
	});

	QUnit.module("Multiple focus targets", {
		beforeEach: async function () {
			TooltipEventTrigger._resetInitialFocusForTesting();
			this.oDeviceStub = sinon.stub(Device, "system")
				.value({ desktop: true, combi: false, phone: false, tablet: false });
			this.oHost = new TwoTargetHost("multiHost");
			await renderHost(this.oHost, this.clock);
			this.oTargetA = this.oHost.getDomRef().querySelector("#multiHost-a");
			this.oTargetB = this.oHost.getDomRef().querySelector("#multiHost-b");

			this.oConfigA = makeConfig(this.oHost, this.oTargetA);
			this.oConfigB = makeConfig(this.oHost, this.oTargetB);
			this.oTriggerA = new TooltipEventTrigger(this.oConfigA);
			this.oTriggerB = new TooltipEventTrigger(this.oConfigB);

			// Make both targets report :focus-visible.
			const oOrigA = this.oTargetA.matches;
			const oOrigB = this.oTargetB.matches;
			this.oTargetA.matches = function (s) { return s === ":focus-visible" || oOrigA.call(this, s); };
			this.oTargetB.matches = function (s) { return s === ":focus-visible" || oOrigB.call(this, s); };
			// Leave initial focus so focusin is not suppressed.
			dispatch(document, new KeyboardEvent("keydown", { key: "Tab", bubbles: true }));
		},
		afterEach: async function () {
			this.oTriggerA.destroy();
			this.oTriggerB.destroy();
			this.oHost.destroy();
			this.oDeviceStub.restore();
			await this.clock.tickAsync(2000);
			this.clock.restore();
		}
	});

	QUnit.test("focusin on target A opens only A", function (assert) {
		this.oTargetA.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));
		assert.ok(this.oConfigA.onOpen.calledOnceWith(true), "A opened");
		assert.notOk(this.oConfigB.onOpen.called, "B not opened");
	});

	QUnit.test("focusin on target B opens only B", function (assert) {
		this.oTargetB.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));
		assert.ok(this.oConfigB.onOpen.calledOnceWith(true), "B opened");
		assert.notOk(this.oConfigA.onOpen.called, "A not opened");
	});

	QUnit.test("focusin on the host root (no target) opens neither", function (assert) {
		this.oHost.getDomRef().dispatchEvent(new FocusEvent("focusin", { bubbles: true }));
		assert.notOk(this.oConfigA.onOpen.called);
		assert.notOk(this.oConfigB.onOpen.called);
	});

	QUnit.test("mouseover on target A opens only A", function (assert) {
		this.oTargetA.dispatchEvent(new MouseEvent("mouseover", { bubbles: true }));
		assert.ok(this.oConfigA.onOpen.calledOnceWith(true), "A opened");
		assert.notOk(this.oConfigB.onOpen.called, "B not opened");
	});

	QUnit.test("mouseout to a sibling target invokes A's onClose (real leave)", function (assert) {
		const oEvent = new MouseEvent("mouseout", { bubbles: true, relatedTarget: this.oTargetB });
		this.oTargetA.dispatchEvent(oEvent);
		assert.ok(this.oConfigA.onClose.calledOnceWith(true), "A closed on leave to sibling");
	});

	QUnit.module("Phone events", {
		beforeEach: async function () {
			this.oDeviceStub = sinon.stub(Device, "system")
				.value({ desktop: false, combi: false, phone: true, tablet: false });
			this.oHost = new FocusableHost();
			await renderHost(this.oHost, this.clock);
			this.oDomRef = this.oHost.getDomRef();
			this.oConfig = makeConfig(this.oHost, this.oDomRef);
			this.oTrigger = new TooltipEventTrigger(this.oConfig);
		},
		afterEach: async function () {
			this.oTrigger.destroy();
			this.oHost.destroy();
			this.oDeviceStub.restore();
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

	QUnit.test("target gets sapUiCoreTooltipHostSuppressSelection class when touch enabled", function (assert) {
		assert.ok(this.oDomRef.classList.contains("sapUiCoreTooltipHostSuppressSelection"),
			"touch-suppression class present on the target");
	});

	QUnit.test("target does NOT get the class when constructed with touch disabled", function (assert) {
		this.oTrigger.destroy();
		this.oConfig = makeConfig(this.oHost, this.oDomRef, { enableForTouchDevices: false });
		this.oTrigger = new TooltipEventTrigger(this.oConfig);
		assert.notOk(this.oDomRef.classList.contains("sapUiCoreTooltipHostSuppressSelection"),
			"touch-suppression class absent when disabled");
	});

	QUnit.test("setEnableForTouchDevices(false) removes the class, re-enabling re-adds it", function (assert) {
		this.oTrigger.setEnableForTouchDevices(false);
		assert.notOk(this.oDomRef.classList.contains("sapUiCoreTooltipHostSuppressSelection"),
			"class removed after disabling");
		this.oTrigger.setEnableForTouchDevices(true);
		assert.ok(this.oDomRef.classList.contains("sapUiCoreTooltipHostSuppressSelection"),
			"class re-added after re-enabling");
	});

	QUnit.test("class is reapplied to the freshly rendered target after a host re-render", async function (assert) {
		// Live-resolving provider, as production hosts use.
		this.oTrigger.destroy();
		this.oConfig = makeConfig(this.oHost, null, { domRefProvider: () => this.oHost.getDomRef() });
		this.oTrigger = new TooltipEventTrigger(this.oConfig);
		assert.ok(this.oHost.getDomRef().classList.contains("sapUiCoreTooltipHostSuppressSelection"),
			"class present before re-render");

		this.oHost.invalidate();
		await nextUIUpdate(this.clock);

		assert.ok(this.oHost.getDomRef().classList.contains("sapUiCoreTooltipHostSuppressSelection"),
			"class present on the freshly rendered target after re-render");
	});

	QUnit.test("destroy removes the class from the target", function (assert) {
		this.oTrigger.destroy();
		assert.notOk(this.oDomRef.classList.contains("sapUiCoreTooltipHostSuppressSelection"),
			"touch-suppression class removed on destroy");
		// Re-create so afterEach's destroy() has a live trigger to tear down.
		this.oTrigger = new TooltipEventTrigger(this.oConfig);
	});

	QUnit.test("long-press (500 ms) invokes onOpen(false)", function (assert) {
		dispatch(this.oDomRef, new MouseEvent("mousedown", { bubbles: true }));
		assert.notOk(this.oConfig.onOpen.called, "not yet, timer pending");
		this.clock.tick(499);
		assert.notOk(this.oConfig.onOpen.called, "still not at 499 ms");
		this.clock.tick(1);
		assert.ok(this.oConfig.onOpen.calledOnce && !this.oConfig.onOpen.firstCall.args[0], "fired at 500 ms");
	});

	QUnit.test("touchmove cancels the long-press timer", function (assert) {
		dispatch(this.oDomRef, new MouseEvent("mousedown", { bubbles: true }));
		dispatch(this.oDomRef, new MouseEvent("mousemove", { bubbles: true }));
		this.clock.tick(1000);
		assert.notOk(this.oConfig.onOpen.called);
	});

	QUnit.test("touchend cancels the long-press timer", function (assert) {
		dispatch(this.oDomRef, new MouseEvent("mousedown", { bubbles: true }));
		dispatch(this.oDomRef, new MouseEvent("mouseup", { bubbles: true }));
		this.clock.tick(1000);
		assert.notOk(this.oConfig.onOpen.called);
	});

	QUnit.test("touchstart is ignored when enableForTouchDevices=false", function (assert) {
		this.oTrigger.setEnableForTouchDevices(false);
		dispatch(this.oDomRef, new MouseEvent("mousedown", { bubbles: true }));
		this.clock.tick(1000);
		assert.notOk(this.oConfig.onOpen.called);
	});

	QUnit.module("Combi events (desktop wiring, no mobile)", {
		beforeEach: async function () {
			this.oDeviceStub = sinon.stub(Device, "system")
				.value({ desktop: false, combi: true, phone: true, tablet: true });
			this.oHost = new FocusableHost();
			await renderHost(this.oHost, this.clock);
			this.oDomRef = this.oHost.getDomRef();
			this.oConfig = makeConfig(this.oHost, this.oDomRef);
			this.oTrigger = new TooltipEventTrigger(this.oConfig);
		},
		afterEach: async function () {
			this.oTrigger.destroy();
			this.oHost.destroy();
			this.oDeviceStub.restore();
			await this.clock.tickAsync(2000);
			this.clock.restore();
		}
	});

	QUnit.test("combi gets desktop events (mouseover invokes onOpen)", function (assert) {
		dispatch(this.oDomRef, new MouseEvent("mouseover", { bubbles: true }));
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
			this.oHost = new FocusableHost();
			await renderHost(this.oHost, this.clock);
			this.oDomRef = this.oHost.getDomRef();
			this.oConfig = makeConfig(this.oHost, this.oDomRef);
			this.oTrigger = new TooltipEventTrigger(this.oConfig);
		},
		afterEach: async function () {
			this.oTrigger.destroy();
			this.oHost.destroy();
			this.oDeviceStub.restore();
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
			return this.oAddSpy.getCalls().filter((oCall) => oCall.args[0] === "keydown").length;
		},
		keydownRemoves: function () {
			return this.oRemoveSpy.getCalls().filter((oCall) => oCall.args[0] === "keydown").length;
		}
	});

	QUnit.test("first trigger attaches the document keydown listener; second does not", function (assert) {
		const oFirst = new TooltipEventTrigger(makeConfig(null, null));
		const oSecond = new TooltipEventTrigger(makeConfig(null, null));
		try {
			assert.strictEqual(this.keydownAdds(), 1);
		} finally {
			oFirst.destroy();
			oSecond.destroy();
		}
	});

	QUnit.test("listener is detached only when the last trigger is destroyed", function (assert) {
		const oFirst = new TooltipEventTrigger(makeConfig(null, null));
		const oSecond = new TooltipEventTrigger(makeConfig(null, null));
		oFirst.destroy();
		assert.strictEqual(this.keydownRemoves(), 0);
		oSecond.destroy();
		assert.strictEqual(this.keydownRemoves(), 1);
	});

	QUnit.test("navigation keydown ends initial focus and detaches the listener", function (assert) {
		const oTrigger = new TooltipEventTrigger(makeConfig(null, null));
		try {
			dispatch(document, new KeyboardEvent("keydown", { key: "Tab", bubbles: true }));
			assert.strictEqual(this.keydownRemoves(), 1);
		} finally {
			oTrigger.destroy();
		}
	});

	QUnit.test("a new trigger re-attaches the listener while focus is still initial", function (assert) {
		const oFirst = new TooltipEventTrigger(makeConfig(null, null));
		oFirst.destroy();
		assert.strictEqual(this.keydownRemoves(), 1);
		const oSecond = new TooltipEventTrigger(makeConfig(null, null));
		try {
			assert.strictEqual(this.keydownAdds(), 2);
		} finally {
			oSecond.destroy();
		}
	});

	QUnit.test("a new trigger does not re-attach after initial focus has passed", function (assert) {
		const oFirst = new TooltipEventTrigger(makeConfig(null, null));
		dispatch(document, new KeyboardEvent("keydown", { key: "Tab", bubbles: true }));
		oFirst.destroy();
		const iAddsSoFar = this.keydownAdds();
		const oSecond = new TooltipEventTrigger(makeConfig(null, null));
		try {
			assert.strictEqual(this.keydownAdds(), iAddsSoFar);
		} finally {
			oSecond.destroy();
		}
	});
});
