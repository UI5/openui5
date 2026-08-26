/*global QUnit, sinon */
sap.ui.define([
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/core/tooltip/Tooltip",
	"sap/m/Button",
	"sap/m/library",
	"sap/ui/Device",
	"sap/ui/core/tooltip/TooltipManager",
	"sap/ui/core/popover/PopoverPhysicalSide"
], function(createAndAppendDiv, nextUIUpdate, Tooltip, Button, mLibrary, Device, TooltipManager, PopoverPhysicalSide) {
	"use strict";
	const PlacementType = mLibrary.PlacementType;
	const aPhysicalSides = Object.values(PopoverPhysicalSide);
	createAndAppendDiv("content");

	// Minimal stand-in for the sap.ui.core.Popup the control wraps. The control
	// only calls attachOpened / attachClosed / setPosition / open / close /
	// destroy on it, and fires the "opened"/"closed" listeners itself.
	function makeFakePopup() {
		return {
			bIsDestroyed: false,
			_openedHandler: null,
			_closedHandler: null,
			attachOpened: function(fn, oScope) { this._openedHandler = fn.bind(oScope); },
			attachClosed: function(fn, oScope) { this._closedHandler = fn.bind(oScope); },
			setPosition: function() {},
			open: function() { if (this._openedHandler) { this._openedHandler(); } },
			close: function() { if (this._closedHandler) { this._closedHandler(); } },
			destroy: function() { this.bIsDestroyed = true; }
		};
	}

	// Installs a fake Popup on the tooltip and short-circuits _ensurePopup so no
	// real Popup / DOM positioning happens in unit tests. The fake's open()/close()
	// drive the same flags and events the real _ensurePopup wiring would, so the
	// tooltip's lifecycle (_bIsOpen, afterOpen/afterClose) behaves as in production.
	// Returns the fake.
	function stubPopup(oTooltip) {
		const oFake = makeFakePopup();
		oTooltip._ensurePopup = function() {
			if (this._oPopup) {
				return this._oPopup;
			}
			this._oPopup = oFake;
			oFake.attachOpened(function() {
				this._bIsOpen = true;
				this.fireAfterOpen();
			}, this);
			oFake.attachClosed(function() {
				this._bIsOpen = false;
				this._bOpenRequested = false;
				this._clearTimeouts();
				this.fireAfterClose();
			}, this);
			return oFake;
		};
		return oFake;
	}

	// Creates a plain HTMLElement stub usable as the openBy opener.
	function makeStub() {
		const el = document.createElement("div");
		el.tabIndex = 0;
		document.getElementById("content").appendChild(el);
		return {
			getDomRef: function() { return el; },
			_div: el
		};
	}

	function removeStub(oStub) {
		if (oStub._div && oStub._div.parentNode) {
			oStub._div.parentNode.removeChild(oStub._div);
		}
	}

	QUnit.module("Defaults", {
		beforeEach: function() {
			this.oTooltip = new Tooltip();
		},
		afterEach: function() {
			this.oTooltip.destroy();
		}
	});

	QUnit.test("defaults", function(assert) {
		assert.strictEqual(this.oTooltip.getText(), "", "text");
		assert.strictEqual(this.oTooltip.getPlacement(), PlacementType.VerticalPreferredTop, "placement");
		assert.strictEqual(this.oTooltip.getDelay(), 500, "delay");
	});

	QUnit.module("Props", {
		beforeEach: function() {
			this.oTooltip = new Tooltip();
		},
		afterEach: function() {
			this.oTooltip.destroy();
		}
	});

	QUnit.test("set all", function(assert) {
		this.oTooltip.setText("Hi");
		this.oTooltip.setPlacement(PlacementType.Bottom);
		this.oTooltip.setDelay(1000);
		assert.strictEqual(this.oTooltip.getText(), "Hi");
		assert.strictEqual(this.oTooltip.getPlacement(), PlacementType.Bottom);
		assert.strictEqual(this.oTooltip.getDelay(), 1000);
	});

	QUnit.module("init");

	QUnit.test("constructs cleanly", function(assert) {
		const t = new Tooltip();
		assert.ok(t, "instance created");
		assert.ok(!t.bIsDestroyed, "not destroyed on construction");
		t.destroy();
	});

	QUnit.module("exit", {
		beforeEach: function() {
			this.oTooltip = new Tooltip();
		},
		afterEach: function() {
			if (!this.oTooltip.bIsDestroyed) {
				this.oTooltip.destroy();
			}
		}
	});

	QUnit.test("destroys popup", function(assert) {
		const oPopup = stubPopup(this.oTooltip);
		this.oTooltip._ensurePopup();
		this.oTooltip.exit();
		assert.ok(oPopup.bIsDestroyed, "popup destroyed");
		assert.strictEqual(this.oTooltip._oPopup, null, "popup reference cleared");
	});

	QUnit.test("clears open timeout", function(assert) {
		this.oTooltip._iOpenTimeout = setTimeout(function(){}, 9999);
		this.oTooltip.exit();
		assert.strictEqual(this.oTooltip._iOpenTimeout, null);
	});

	QUnit.test("clears close timeout", function(assert) {
		this.oTooltip._iCloseTimeout = setTimeout(function(){}, 9999);
		this.oTooltip.exit();
		assert.strictEqual(this.oTooltip._iCloseTimeout, null);
	});

	QUnit.test("safe without popup/timeouts", function(assert) {
		this.oTooltip.exit();
		assert.ok(true);
	});

	QUnit.module("_clearTimeouts", {
		beforeEach: function() {
			this.oTooltip = new Tooltip();
		},
		afterEach: function() {
			this.oTooltip.destroy();
		}
	});

	QUnit.test("clears open", function(assert) {
		this.oTooltip._iOpenTimeout = setTimeout(function(){}, 9999);
		this.oTooltip._clearTimeouts();
		assert.strictEqual(this.oTooltip._iOpenTimeout, null);
	});

	QUnit.test("clears close", function(assert) {
		this.oTooltip._iCloseTimeout = setTimeout(function(){}, 9999);
		this.oTooltip._clearTimeouts();
		assert.strictEqual(this.oTooltip._iCloseTimeout, null);
	});

	QUnit.module("isPendingOrOpen", {
		beforeEach: function() {
			this.oTooltip = new Tooltip();
		},
		afterEach: function() {
			this.oTooltip._clearTimeouts();
			this.oTooltip.destroy();
		}
	});

	QUnit.test("false when neither flag nor open timeout is set", function(assert) {
		assert.strictEqual(this.oTooltip.isPendingOrOpen(), false);
	});

	QUnit.test("true while the open delay timer is pending", function(assert) {
		this.oTooltip._iOpenTimeout = setTimeout(function(){}, 9999);
		assert.strictEqual(this.oTooltip.isPendingOrOpen(), true);
	});

	QUnit.test("true while the tooltip is open", function(assert) {
		this.oTooltip._bIsOpen = true;
		assert.strictEqual(this.oTooltip.isPendingOrOpen(), true);
	});

	QUnit.module("isOpen", {
		beforeEach: function() {
			this.oTooltip = new Tooltip();
		},
		afterEach: function() {
			this.oTooltip.destroy();
		}
	});

	QUnit.test("reflects the _bIsOpen flag", function(assert) {
		assert.strictEqual(this.oTooltip.isOpen(), false, "closed by default");
		this.oTooltip._bIsOpen = true;
		assert.strictEqual(this.oTooltip.isOpen(), true, "open when flag set");
	});

	QUnit.module("close", {
		beforeEach: function() {
			this.oTooltip = new Tooltip({delay:500});
		},
		afterEach: function() {
			this.oTooltip.destroy();
		}
	});

	QUnit.test("bFromPress phone early return", function(assert) {
		const oDeviceStub = sinon.stub(Device, "system").value({phone: true, tablet: false, combi: false, desktop: false});
		const oPopup = stubPopup(this.oTooltip);
		this.oTooltip._ensurePopup();
		this.oTooltip._bIsOpen = true;
		const spy = sinon.spy(oPopup, "close");
		this.oTooltip.close(0, true);
		assert.notOk(spy.called, "popup.close not called on phone longpress");
		spy.restore();
		oDeviceStub.restore();
	});

	QUnit.test("bFromPress tablet early return", function(assert) {
		const oDeviceStub = sinon.stub(Device, "system").value({phone: false, tablet: true, combi: false, desktop: false});
		const oPopup = stubPopup(this.oTooltip);
		this.oTooltip._ensurePopup();
		this.oTooltip._bIsOpen = true;
		const spy = sinon.spy(oPopup, "close");
		this.oTooltip.close(0, true);
		assert.notOk(spy.called, "popup.close not called on tablet longpress");
		spy.restore();
		oDeviceStub.restore();
	});

	QUnit.test("bFromPress desktop proceeds", function(assert) {
		const oDeviceStub = sinon.stub(Device, "system").value({phone: false, tablet: false, combi: false, desktop: true});
		const oPopup = stubPopup(this.oTooltip);
		this.oTooltip._ensurePopup();
		this.oTooltip._bIsOpen = true;
		const spy = sinon.spy(oPopup, "close");
		this.oTooltip.close(0, true);
		assert.ok(spy.calledOnce, "popup.close called on desktop");
		spy.restore();
		oDeviceStub.restore();
	});

	QUnit.test("bFromPress combi proceeds", function(assert) {
		const oDeviceStub = sinon.stub(Device, "system").value({phone: true, tablet: true, combi: true, desktop: false});
		const oPopup = stubPopup(this.oTooltip);
		this.oTooltip._ensurePopup();
		this.oTooltip._bIsOpen = true;
		const spy = sinon.spy(oPopup, "close");
		this.oTooltip.close(0, true);
		assert.ok(spy.calledOnce, "popup.close called on combi");
		spy.restore();
		oDeviceStub.restore();
	});

	QUnit.test("close returns this", function(assert) {
		assert.strictEqual(this.oTooltip.close(0), this.oTooltip);
	});

	QUnit.test("delayed close actually executes", function(assert) {
		const oPopup = stubPopup(this.oTooltip);
		this.oTooltip._ensurePopup();
		this.oTooltip._bIsOpen = true;
		const spy = sinon.spy(oPopup, "close");
		this.oTooltip.close(50);
		this.clock.tick(150);
		assert.ok(spy.calledOnce, "popup.close called after delay");
		assert.strictEqual(this.oTooltip._bIsOpen, false, "isOpen false");
		spy.restore();
	});

	QUnit.test("close with default delay", function(assert) {
		this.oTooltip.setDelay(50);
		stubPopup(this.oTooltip);
		this.oTooltip._ensurePopup();
		this.oTooltip._bIsOpen = true;
		this.oTooltip.close();
		assert.ok(this.oTooltip._iCloseTimeout, "uses default delay");
	});

	QUnit.test("bFromPress false on non-touch does not early return", function(assert) {
		const oPopup = stubPopup(this.oTooltip);
		this.oTooltip._ensurePopup();
		this.oTooltip._bIsOpen = true;
		const spy = sinon.spy(oPopup, "close");
		this.oTooltip.close(0, false);
		assert.ok(spy.calledOnce, "popup.close called");
		spy.restore();
	});

	QUnit.test("close calls _clearTimeouts before scheduling", function(assert) {
		const spy = sinon.spy(this.oTooltip, "_clearTimeouts");
		this.oTooltip.close(100);
		assert.ok(spy.calledOnce, "_clearTimeouts called");
		spy.restore();
	});

	QUnit.test("close with no popup does not throw", function(assert) {
		this.oTooltip.close(0);
		assert.ok(true, "no throw");
	});

	QUnit.module("openBy", {
		beforeEach: function() {
			this.oTooltip = new Tooltip({text:"PlacementType", delay: 0});
			this.stub = makeStub();
			this.oPopup = stubPopup(this.oTooltip);
			// _doOpen would render + measure + call the real Popup; short-circuit
			// it to only flip the flags the "opened" listener normally sets.
			this.oTooltip._doOpen = function() {
				this._oPopup.open(0);
			};
		},
		afterEach: function() {
			this.oTooltip._clearTimeouts();
			this.oTooltip.destroy();
			removeStub(this.stub);
		}
	});

	QUnit.test("creates popup and opens", function(assert) {
		this.oTooltip.openBy(this.stub, 0);
		this.clock.tick(0);
		assert.ok(this.oTooltip._oPopup, "popup created");
		assert.ok(this.oTooltip._bIsOpen, "is open");
	});

	QUnit.test("early return if scheduled", function(assert) {
		this.oTooltip.openBy(this.stub, 200);
		const t1 = this.oTooltip._iOpenTimeout;
		this.oTooltip.openBy(this.stub, 200);
		assert.strictEqual(this.oTooltip._iOpenTimeout, t1, "second openBy did not reschedule");
	});

	QUnit.test("openBy reuses existing popup", function(assert) {
		this.oTooltip.openBy(this.stub, 0);
		this.clock.tick(0);
		const p1 = this.oTooltip._oPopup;
		this.oTooltip._bIsOpen = false;
		this.oTooltip._iOpenTimeout = null;
		this.oTooltip.openBy(this.stub, 0);
		this.clock.tick(0);
		assert.strictEqual(this.oTooltip._oPopup, p1, "same popup reused");
	});

	QUnit.test("openBy default delay", function(assert) {
		this.oTooltip.setDelay(10);
		this.oTooltip.openBy(this.stub);
		this.clock.tick(10);
		assert.ok(this.oTooltip._bIsOpen, "opened with default delay");
	});

	QUnit.test("close before the open timer fires aborts the open", function(assert) {
		const spyOpen = sinon.spy(this.oPopup, "open");

		this.oTooltip.openBy(this.stub, 50);
		// openBy is scheduled — _bOpenRequested should be set.
		assert.ok(this.oTooltip._bOpenRequested, "openBy marked the open intent");

		// Simulate focusout: close() arrives while the open timer is still pending.
		this.oTooltip.close(0);
		assert.notOk(this.oTooltip._bOpenRequested, "close() cleared the open intent");

		// After the original delay elapses the popup must NOT open.
		this.clock.tick(100);
		assert.notOk(spyOpen.called, "popup.open not called after abort");
		assert.notOk(this.oTooltip._bIsOpen, "tooltip did not open");
		spyOpen.restore();
	});

	QUnit.test("openBy cancels a pending close so focusin overrides focusout", function(assert) {
		this.oTooltip.openBy(this.stub, 0);
		this.clock.tick(0);
		assert.ok(this.oTooltip._bIsOpen, "tooltip open");

		// focusout schedules a delayed close.
		this.oTooltip.close(500);
		assert.ok(this.oTooltip._iCloseTimeout, "close scheduled");

		// focusin re-opens before the close fires.
		this.oTooltip.openBy(this.stub, 0);
		assert.strictEqual(this.oTooltip._iCloseTimeout, null, "pending close cancelled");

		// After the close delay would have elapsed, the tooltip must remain open.
		this.clock.tick(600);
		assert.ok(this.oTooltip._bIsOpen, "tooltip stayed open");
	});

	QUnit.module("_doOpen", {
		beforeEach: function() {
			this.oTooltip = new Tooltip({text: "Hello", delay: 0});
			this.stub = makeStub();
			this.oPopup = stubPopup(this.oTooltip);
		},
		afterEach: function() {
			this.oTooltip._clearTimeouts();
			this.oTooltip.destroy();
			removeStub(this.stub);
		}
	});

	QUnit.test("_doOpen anchors provisionally and opens the popup", function(assert) {
		const spyPos = sinon.spy(this.oPopup, "setPosition");
		const spyOpen = sinon.spy(this.oPopup, "open");
		this.oTooltip._ensurePopup();

		this.oTooltip._doOpen(this.stub);

		// The final side is resolved later (in the _applyPosition override, once
		// the popup has rendered), so _doOpen only opens with a provisional anchor.
		assert.strictEqual(this.oTooltip._oHostForArrow, this.stub.getDomRef(), "opener DOM remembered for arrow/side resolution");
		assert.strictEqual(this.oTooltip._bPosResolved, false, "placement not yet resolved");
		assert.ok(spyPos.calledOnce, "popup.setPosition called (provisional anchor)");
		assert.ok(spyOpen.calledOnce, "popup.open called");
		spyPos.restore();
		spyOpen.restore();
	});

	QUnit.test("_doOpen with no host element aborts", function(assert) {
		const spyOpen = sinon.spy(this.oPopup, "open");
		this.oTooltip._ensurePopup();
		this.oTooltip._doOpen(null);
		assert.notOk(spyOpen.called, "popup.open not called without a host");
		assert.notOk(this.oTooltip._bOpenRequested, "open intent cleared");
		spyOpen.restore();
	});

	QUnit.module("_applyPlacementClass", {
		beforeEach: async function() {
			this.oTooltip = new Tooltip({text: "T"});
			// Render the tooltip so it has a DOM ref to receive placement classes.
			this.oTooltip.placeAt("content");
			await nextUIUpdate(this.clock);
		},
		afterEach: async function() {
			this.oTooltip.destroy();
			await this.clock.tickAsync(2000);
		}
	});

	QUnit.test("adds sapUiCoreTooltip-Bottom class when placement is Bottom", function(assert) {
		this.oTooltip._sCalcedPos = PopoverPhysicalSide.Bottom;
		this.oTooltip._applyPlacementClass();
		const oCl = this.oTooltip.getDomRef().classList;
		assert.ok(oCl.contains("sapUiCoreTooltip-Bottom"));
		assert.notOk(oCl.contains("sapUiCoreTooltip-Top"));
	});

	QUnit.test("adds sapUiCoreTooltip-Top class when placement is Top", function(assert) {
		this.oTooltip._sCalcedPos = PopoverPhysicalSide.Top;
		this.oTooltip._applyPlacementClass();
		assert.ok(this.oTooltip.getDomRef().classList.contains("sapUiCoreTooltip-Top"));
	});

	QUnit.test("adds sapUiCoreTooltip-Left class when placement is Left", function(assert) {
		this.oTooltip._sCalcedPos = PopoverPhysicalSide.Left;
		this.oTooltip._applyPlacementClass();
		assert.ok(this.oTooltip.getDomRef().classList.contains("sapUiCoreTooltip-Left"));
	});

	QUnit.test("adds sapUiCoreTooltip-Right class when placement is Right", function(assert) {
		this.oTooltip._sCalcedPos = PopoverPhysicalSide.Right;
		this.oTooltip._applyPlacementClass();
		assert.ok(this.oTooltip.getDomRef().classList.contains("sapUiCoreTooltip-Right"));
	});

	QUnit.test("removes stale placement class before adding new one", function(assert) {
		this.oTooltip.getDomRef().classList.add("sapUiCoreTooltip-Top");
		this.oTooltip._sCalcedPos = PopoverPhysicalSide.Bottom;
		this.oTooltip._applyPlacementClass();
		const oCl = this.oTooltip.getDomRef().classList;
		assert.notOk(oCl.contains("sapUiCoreTooltip-Top"), "old class removed");
		assert.ok(oCl.contains("sapUiCoreTooltip-Bottom"), "new class added");
	});

	QUnit.test("no class added for unknown placement", function(assert) {
		this.oTooltip._sCalcedPos = "Unknown";
		this.oTooltip._applyPlacementClass();
		const oCl = this.oTooltip.getDomRef().classList;
		assert.notOk(oCl.contains("sapUiCoreTooltip-Top"));
		assert.notOk(oCl.contains("sapUiCoreTooltip-Bottom"));
	});

	QUnit.test("renderer emits base class only; no side class before positioning", function(assert) {
		const oCl = this.oTooltip.getDomRef().classList;
		assert.ok(oCl.contains("sapUiCoreTooltip"), "base class present");
		assert.strictEqual(this.oTooltip._sCalcedPos, null, "side not yet resolved");
		aPhysicalSides.forEach(function(s) {
			assert.notOk(oCl.contains("sapUiCoreTooltip-" + s), "no physical side class: " + s);
		});
		assert.notOk(
			oCl.contains("sapUiCoreTooltip-" + this.oTooltip.getPlacement()),
			"raw placement token not emitted as a class"
		);
	});

	QUnit.module("ARIA on tooltip DOM", {
		beforeEach: async function() {
			this.oTooltip = new Tooltip({text: "T"});
			this.oTooltip.placeAt("content");
			await nextUIUpdate(this.clock);
			this.oDom = this.oTooltip.getDomRef();
		},
		afterEach: async function() {
			this.oTooltip.destroy();
			await this.clock.tickAsync(2000);
		}
	});

	QUnit.test("root has role=dialog", function(assert) {
		assert.strictEqual(this.oDom.getAttribute("role"), "dialog", "role is dialog");
	});

	QUnit.test("root has aria-modal=true", function(assert) {
		assert.strictEqual(this.oDom.getAttribute("aria-modal"), "true", "aria-modal is true");
	});

	QUnit.module("tooltip DOM events", {
		beforeEach: async function() {
			this.oTooltip = new Tooltip({text: "T"});
			this.oTooltip.placeAt("content");
			await nextUIUpdate(this.clock);
			this.oTooltip._bindDomEvents();
			this.oDom = this.oTooltip.getDomRef();
		},
		afterEach: async function() {
			this.oTooltip.destroy();
			await this.clock.tickAsync(2000);
		}
	});

	QUnit.test("mouseenter cancels pending close timeout", function(assert) {
		this.oTooltip._iCloseTimeout = setTimeout(function() {}, 9999);
		this.oDom.dispatchEvent(new Event("mouseenter"));
		assert.strictEqual(this.oTooltip._iCloseTimeout, null, "close timeout cleared");
		assert.ok(this.oTooltip._bIsMouseOver, "_bIsMouseOver set");
	});

	QUnit.test("mouseleave triggers close when tooltip is open", function(assert) {
		this.oTooltip._bIsOpen = true;
		const spy = sinon.spy(this.oTooltip, "close");
		this.oDom.dispatchEvent(new Event("mouseleave"));
		assert.ok(spy.calledOnce, "close called on mouseleave");
		assert.notOk(this.oTooltip._bIsMouseOver, "_bIsMouseOver cleared");
		spy.restore();
	});

	QUnit.test("mouseleave does not call close when not open", function(assert) {
		this.oTooltip._bIsOpen = false;
		const spy = sinon.spy(this.oTooltip, "close");
		this.oDom.dispatchEvent(new Event("mouseleave"));
		assert.notOk(spy.called, "close not called when not open");
		spy.restore();
	});

	QUnit.module("_ensurePopup", {
		beforeEach: function() {
			this.oTooltip = new Tooltip({text: "Hi"});
		},
		afterEach: function() {
			this.oTooltip.destroy();
		}
	});

	QUnit.test("creates a Popup once and reuses it", function(assert) {
		const oPopup1 = this.oTooltip._ensurePopup();
		assert.ok(oPopup1, "popup created");
		assert.strictEqual(this.oTooltip._oPopup, oPopup1, "stored on _oPopup");
		const oPopup2 = this.oTooltip._ensurePopup();
		assert.strictEqual(oPopup2, oPopup1, "same popup reused");
	});

	QUnit.test("Popup has close-on-scroll followOf configured", function(assert) {
		// Act
		const oPopup = this.oTooltip._ensurePopup();

		// Assert — getFollowOf() returns a function when CLOSE_ON_SCROLL is active
		assert.strictEqual(typeof oPopup.getFollowOf(), "function",
			"getFollowOf() returns a function (CLOSE_ON_SCROLL handler)");
	});

	QUnit.test("Popup has autoClose enabled", function(assert) {
		// Act
		const oPopup = this.oTooltip._ensurePopup();

		// Assert — autoClose is enabled on all devices (matches the former
		// Popover-based tooltip); its outside-tap handler is touch-gated inside Popup.
		assert.strictEqual(oPopup.getAutoClose(), true,
			"getAutoClose() is true");
	});

	QUnit.test("afterClose clears the open flag and fires afterClose", function(assert) {
		assert.expect(1);
		// Use a fake Popup so close(0) synchronously drives the closed lifecycle.
		const oPopup = stubPopup(this.oTooltip);
		this.oTooltip._ensurePopup();
		this.oTooltip._bIsOpen = true;
		this.oTooltip.attachAfterClose(function() {
			assert.strictEqual(this.oTooltip._bIsOpen, false, "open flag cleared on close");
		}.bind(this));
		// Drive the Popup's closed lifecycle.
		oPopup.close(0);
	});

	QUnit.module("Placement class on tooltip DOM", {
		beforeEach: async function() {
			// Center the anchor so every strict side (Top/Bottom/Left/Right) has
			// room and the auto-flip fallback never kicks in.
			this.oButton = new Button({text: "Anchor"});
			this.oButton.placeAt("content");
			await nextUIUpdate(this.clock);
			Object.assign(this.oButton.getDomRef().style, {
				position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)"
			});
		},
		afterEach: async function() {
			this.oButton.destroy();
			// Drain any reposition/followOf timers a real open left behind.
			await this.clock.tickAsync(2000);
		}
	});

	async function openAndWait(oClock, oTooltip, oAnchor) {
		const pAfterOpen = new Promise((resolve) => {
			oTooltip.attachEventOnce("afterOpen", resolve);
		});
		oTooltip.openBy(oAnchor);
		await nextUIUpdate(oClock);
		await oClock.tickAsync(0);
		return pAfterOpen;
	}

	[
		{placement: PlacementType.Top, expected: "sapUiCoreTooltip-Top"},
		{placement: PlacementType.Bottom, expected: "sapUiCoreTooltip-Bottom"},
		{placement: PlacementType.Left, expected: "sapUiCoreTooltip-Left"},
		{placement: PlacementType.Right, expected: "sapUiCoreTooltip-Right"}
	].forEach(function(oCase) {
		QUnit.test("placement " + oCase.placement + " → " + oCase.expected, async function(assert) {
			this.oTooltip = new Tooltip({text: "Hi", placement: oCase.placement, delay: 0});
			await openAndWait(this.clock, this.oTooltip, this.oButton);

			const oCl = this.oTooltip.getDomRef().classList;
			aPhysicalSides.forEach(function(s) {
				const sCls = "sapUiCoreTooltip-" + s;
				assert[sCls === oCase.expected ? "ok" : "notOk"](oCl.contains(sCls), sCls);
			});
			this.oTooltip.destroy();
		});
	});

	QUnit.module("Placement class retention while open", {
		beforeEach: async function() {
			// Center the anchor so every strict side has room and no auto-flip.
			this.oButton = new Button({text: "Anchor"});
			this.oButton.placeAt("content");
			await nextUIUpdate(this.clock);
			Object.assign(this.oButton.getDomRef().style, {
				position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)"
			});
		},
		afterEach: async function() {
			if (this.oTooltip) {
				this.oTooltip.destroy();
			}
			this.oButton.destroy();
			await this.clock.tickAsync(2000);
		}
	});

	function assertOnlySide(assert, oTooltip, sExpected, sWhen) {
		const oCl = oTooltip.getDomRef().classList;
		aPhysicalSides.forEach(function(s) {
			const sCls = "sapUiCoreTooltip-" + s;
			assert[s === sExpected ? "ok" : "notOk"](oCl.contains(sCls), sCls + " " + sWhen);
		});
	}

	QUnit.test("class retained when the tooltip is invalidated while open", async function(assert) {
		this.oTooltip = new Tooltip({text: "Hi", placement: PlacementType.Bottom, delay: 0});
		await openAndWait(this.clock, this.oTooltip, this.oButton);
		assertOnlySide(assert, this.oTooltip, PopoverPhysicalSide.Bottom, "after open");

		// Re-render while open; _sCalcedPos stays resolved, class must survive.
		this.oTooltip.invalidate();
		await nextUIUpdate(this.clock);
		await this.clock.tickAsync(1000);

		assert.ok(this.oTooltip.isOpen(), "still open after invalidate");
		assertOnlySide(assert, this.oTooltip, PopoverPhysicalSide.Bottom, "after invalidate");
	});

	QUnit.test("class retained when setText triggers a re-render while open", async function(assert) {
		this.oTooltip = new Tooltip({text: "Hi", placement: PlacementType.Right, delay: 0});
		await openAndWait(this.clock, this.oTooltip, this.oButton);
		assertOnlySide(assert, this.oTooltip, PopoverPhysicalSide.Right, "after open");

		this.oTooltip.setText("Longer tooltip text");
		await nextUIUpdate(this.clock);
		await this.clock.tickAsync(1000);

		assert.strictEqual(this.oTooltip.getDomRef().textContent.indexOf("Longer") !== -1, true, "text updated");
		assertOnlySide(assert, this.oTooltip, PopoverPhysicalSide.Right, "after setText re-render");
	});

	QUnit.test("no stale side class after reopening on a different side", async function(assert) {
		this.oTooltip = new Tooltip({text: "Hi", placement: PlacementType.Top, delay: 0});
		await openAndWait(this.clock, this.oTooltip, this.oButton);
		assertOnlySide(assert, this.oTooltip, PopoverPhysicalSide.Top, "after first open");

		this.oTooltip.close();
		await this.clock.tickAsync(1000);

		// Reopen on the opposite side; the previous class must not linger.
		this.oTooltip.setPlacement(PlacementType.Bottom);
		await openAndWait(this.clock, this.oTooltip, this.oButton);
		assertOnlySide(assert, this.oTooltip, PopoverPhysicalSide.Bottom, "after reopen on Bottom");
	});

	QUnit.test("side class is present in the rendered DOM (renderer emits resolved side)", async function(assert) {
		this.oTooltip = new Tooltip({text: "Hi", placement: PlacementType.Left, delay: 0});
		await openAndWait(this.clock, this.oTooltip, this.oButton);

		// Re-render must re-emit the class from the renderer, not only _applyPlacementClass.
		assert.strictEqual(this.oTooltip._sCalcedPos, PopoverPhysicalSide.Left, "side resolved");
		this.oTooltip.getDomRef().classList.remove("sapUiCoreTooltip-Left"); // simulate lost class
		this.oTooltip.invalidate();
		await nextUIUpdate(this.clock);
		assert.ok(
			this.oTooltip.getDomRef().classList.contains("sapUiCoreTooltip-Left"),
			"renderer re-emits the resolved side class on re-render"
		);
	});
	// for the bug where _fitIntoWithinArea cleared the right/bottom edge that the
	// Popup uses to dock Left/Top placements, collapsing the tooltip to the
	// document origin and pinning it to the left/top margin.
	QUnit.module("Position on tooltip DOM", {
		beforeEach: async function() {
			// Center the anchor so every strict side has room and no auto-flip.
			this.oButton = new Button({text: "Anchor"});
			this.oButton.placeAt("content");
			await nextUIUpdate(this.clock);
			Object.assign(this.oButton.getDomRef().style, {
				position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)"
			});
		},
		afterEach: async function() {
			if (this.oTooltip) {
				this.oTooltip.destroy();
			}
			this.oButton.destroy();
			// Drain any reposition/followOf timers a real open left behind.
			await this.clock.tickAsync(2000);
		}
	});

	QUnit.test("focus stays on the opener after the tooltip opens", async function(assert) {
		this.oTooltip = new Tooltip({text: "Hi", placement: PlacementType.Bottom, delay: 0});
		const oBtnDom = this.oButton.getDomRef();
		oBtnDom.focus();
		assert.strictEqual(document.activeElement, oBtnDom, "opener focused before open");

		await openAndWait(this.clock, this.oTooltip, this.oButton);

		assert.ok(this.oTooltip.isOpen(), "tooltip open");
		assert.strictEqual(document.activeElement, oBtnDom,
			"focus stays on the opener; the tooltip never steals it");
	});

	QUnit.test("Left places the tooltip to the left of the opener", async function(assert) {
		this.oTooltip = new Tooltip({text: "Hi", placement: PlacementType.Left, delay: 0});
		await openAndWait(this.clock, this.oTooltip, this.oButton);

		const oTipRect = this.oTooltip.getDomRef().getBoundingClientRect();
		const oBtnRect = this.oButton.getDomRef().getBoundingClientRect();
		assert.ok(oTipRect.right <= oBtnRect.left + 1, "tooltip right edge is at/left of the opener left edge");
		assert.ok(oTipRect.left > 0, "tooltip not pinned to the document origin");
	});

	QUnit.test("Right places the tooltip to the right of the opener", async function(assert) {
		this.oTooltip = new Tooltip({text: "Hi", placement: PlacementType.Right, delay: 0});
		await openAndWait(this.clock, this.oTooltip, this.oButton);

		const oTipRect = this.oTooltip.getDomRef().getBoundingClientRect();
		const oBtnRect = this.oButton.getDomRef().getBoundingClientRect();
		assert.ok(oTipRect.left >= oBtnRect.right - 1, "tooltip left edge is at/right of the opener right edge");
	});

	QUnit.test("Top places the tooltip above the opener", async function(assert) {
		this.oTooltip = new Tooltip({text: "Hi", placement: PlacementType.Top, delay: 0});
		await openAndWait(this.clock, this.oTooltip, this.oButton);

		const oTipRect = this.oTooltip.getDomRef().getBoundingClientRect();
		const oBtnRect = this.oButton.getDomRef().getBoundingClientRect();
		assert.ok(oTipRect.bottom <= oBtnRect.top + 1, "tooltip bottom edge is at/above the opener top edge");
		assert.ok(oTipRect.top > 0, "tooltip not pinned to the document origin");
	});

	QUnit.test("Bottom places the tooltip below the opener", async function(assert) {
		this.oTooltip = new Tooltip({text: "Hi", placement: PlacementType.Bottom, delay: 0});
		await openAndWait(this.clock, this.oTooltip, this.oButton);

		const oTipRect = this.oTooltip.getDomRef().getBoundingClientRect();
		const oBtnRect = this.oButton.getDomRef().getBoundingClientRect();
		assert.ok(oTipRect.top >= oBtnRect.bottom - 1, "tooltip top edge is at/below the opener bottom edge");
	});

	QUnit.module("Overflow on tooltip DOM", {
		beforeEach: async function() {
			this.oButton = new Button({text: "Anchor"});
			this.oButton.placeAt("content");
			await nextUIUpdate(this.clock);
			Object.assign(this.oButton.getDomRef().style, {
				position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)"
			});
			this.sHuge = "Lorem ipsum dolor sit amet. ".repeat(300);
		},
		afterEach: async function() {
			if (this.oTooltip) {
				this.oTooltip.destroy();
			}
			this.oButton.destroy();
			// Drain any reposition/followOf timers a real open left behind.
			await this.clock.tickAsync(2000);
		}
	});

	[PlacementType.Left, PlacementType.Right, PlacementType.Top, PlacementType.Bottom].forEach(function(sPlacement) {
		QUnit.test("huge tooltip scrolls and fits the viewport (" + sPlacement + ")", async function(assert) {
			this.oTooltip = new Tooltip({text: this.sHuge, placement: sPlacement, delay: 0});
			await openAndWait(this.clock, this.oTooltip, this.oButton);

			const oDomRef = this.oTooltip.getDomRef();
			const oContRef = oDomRef.querySelector(".sapUiCoreTooltipCont");

			assert.ok(oContRef.style.maxHeight, "the scroll container has a max-height");
			assert.ok(oContRef.scrollHeight > oContRef.clientHeight + 1, "the scroll container actually scrolls");
			assert.ok(Math.round(oDomRef.getBoundingClientRect().bottom) <= window.innerHeight,
				"the tooltip fits inside the viewport height");
		});
	});

	QUnit.test("a short tooltip is not capped", async function(assert) {
		this.oTooltip = new Tooltip({text: "Short", placement: PlacementType.Left, delay: 0});
		await openAndWait(this.clock, this.oTooltip, this.oButton);

		const oDomRef = this.oTooltip.getDomRef();
		const oContRef = oDomRef.querySelector(".sapUiCoreTooltipCont");
		assert.strictEqual(oDomRef.style.maxHeight, "", "root has no max-height");
		assert.strictEqual(oContRef.style.maxHeight, "", "scroll container has no max-height");
	});

	QUnit.module("_applyPosition clears stale position", {
		beforeEach: async function() {
			this.oTooltip = new Tooltip({text: "Hi", delay: 0});
			this.oTooltip.placeAt("content");
			await nextUIUpdate(this.clock);
			this.oStub = makeStub();
		},
		afterEach: async function() {
			this.oTooltip.destroy();
			removeStub(this.oStub);
			await this.clock.tickAsync(2000);
		}
	});

	QUnit.test("clears left/right/top/bottom before docking", function(assert) {
		// Wire up the real _applyPosition override.
		this.oTooltip._ensurePopup();
		this.oTooltip._oHostForArrow = this.oStub.getDomRef();
		this.oTooltip._bPosResolved = false; // first pass: clear, resolve side, re-anchor, return

		const oDomRef = this.oTooltip.getDomRef();
		// Simulate stale inline position from a previous open.
		oDomRef.style.left = "123px";
		oDomRef.style.right = "45px";
		oDomRef.style.top = "67px";
		oDomRef.style.bottom = "89px";

		// The Popup is open state-wise so the override does not early-return.
		sinon.stub(this.oTooltip._oPopup, "getOpenState").returns("OPEN");
		this.oTooltip._oPopup._applyPosition({});

		assert.strictEqual(oDomRef.style.left, "", "left cleared");
		assert.strictEqual(oDomRef.style.right, "", "right cleared");
		assert.strictEqual(oDomRef.style.top, "", "top cleared");
		assert.strictEqual(oDomRef.style.bottom, "", "bottom cleared");
	});

	// Aborted opens (close-before-open, selection guard) must not leak into the manager registry.
	QUnit.module("TooltipManager registry hygiene", {
		beforeEach: function() {
			this.oTooltip = new Tooltip({text: "Hi", delay: 0});
			this.stub = makeStub();
			// Avoid a real Popup DOM in unit tests.
			stubPopup(this.oTooltip);
			this.oTooltip._doOpen = function() {};
			this.fnRegisterSpy = sinon.spy(TooltipManager, "registerOpening");
			this.fnDeregisterSpy = sinon.spy(TooltipManager, "deregister");
		},
		afterEach: function() {
			this.fnRegisterSpy.restore();
			this.fnDeregisterSpy.restore();
			this.oTooltip.destroy();
			removeStub(this.stub);
		}
	});

	QUnit.test("openBy registers and close() before the popup opens deregisters", function(assert) {
		this.oTooltip.openBy(this.stub, 200);

		assert.ok(this.fnRegisterSpy.calledWith(this.oTooltip),
			"openBy called TooltipManager.registerOpening with this tooltip");
		assert.notOk(this.fnDeregisterSpy.calledWith(this.oTooltip),
			"not yet deregistered while the open is pending");
		assert.notOk(this.oTooltip.isOpen(), "not yet open — still in the open-delay window");

		this.oTooltip.close(0);

		assert.ok(this.fnDeregisterSpy.calledWith(this.oTooltip),
			"close() before open called TooltipManager.deregister");
	});

	QUnit.test("selection guard in the open-timer callback deregisters the tooltip", function(assert) {
		const fnOrig = window.getSelection;
		window.getSelection = function() {
			return { toString: function() { return "user has a selection"; } };
		};

		try {
			this.oTooltip.openBy(this.stub, 10);
			assert.ok(this.fnRegisterSpy.calledWith(this.oTooltip), "registered while pending");
			assert.notOk(this.fnDeregisterSpy.calledWith(this.oTooltip),
				"not yet deregistered before the open timer fires");

			this.clock.tick(10);
			assert.notOk(this.oTooltip.isOpen(),
				"tooltip stayed closed — selection guard suppressed the open");
			assert.ok(this.fnDeregisterSpy.calledWith(this.oTooltip),
				"selection-guard path called TooltipManager.deregister");
		} finally {
			window.getSelection = fnOrig;
		}
	});

	QUnit.test("afterClose deregisters via the init-time listener", function(assert) {
		this.oTooltip.fireAfterClose();
		assert.ok(this.fnDeregisterSpy.calledWith(this.oTooltip),
			"afterClose event triggered TooltipManager.deregister");
	});
});
