/*global QUnit, sinon */
sap.ui.define([
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/core/tooltip/Tooltip",
	"sap/m/Button",
	"sap/ui/core/library",
	"sap/ui/core/popover/Positioning",
	"sap/ui/Device",
	"sap/ui/core/tooltip/TooltipManager",
	"sap/base/i18n/Localization"
], function(createAndAppendDiv, nextUIUpdate, Tooltip, Button, coreLibrary, Positioning, Device, TooltipManager, Localization) {
	"use strict";
	const PopoverPlacement = coreLibrary.popover.PopoverPlacement;
	const PopoverHorizontalAlign = coreLibrary.popover.PopoverHorizontalAlign;
	const PopoverVerticalAlign = coreLibrary.popover.PopoverVerticalAlign;
	// Mirrors EDGE_MARGIN_PX in sap/ui/core/tooltip/Tooltip.js — the gap the
	// tooltip keeps from the within-area edge.
	const EDGE_MARGIN_PX = 10;
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
		assert.strictEqual(this.oTooltip.getPlacement(), PopoverPlacement.Top, "placement");
		assert.strictEqual(this.oTooltip.getDelay(), 500, "delay");
		assert.strictEqual(this.oTooltip.getHorizontalAlign(), PopoverHorizontalAlign.Center, "horizontalAlign");
		assert.strictEqual(this.oTooltip.getVerticalAlign(), PopoverVerticalAlign.Center, "verticalAlign");
	});

	QUnit.test("_resolvePlacementAndAlign forwards the placement, MoreSpace flip mode and alignments", function(assert) {
		const oTooltip = new Tooltip({
			placement: PopoverPlacement.Begin,
			horizontalAlign: PopoverHorizontalAlign.End,
			verticalAlign: PopoverVerticalAlign.Bottom
		});
		const oStub = sinon.stub(Positioning, "resolvePlacementAndAlign").returns({
			side: "Left", horizontalAlign: PopoverHorizontalAlign.End, verticalAlign: PopoverVerticalAlign.Bottom
		});
		oTooltip._resolvePlacementAndAlign();
		assert.strictEqual(oStub.calledOnce, true, "resolvePlacementAndAlign called");
		const oArg = oStub.firstCall.args[0];
		assert.strictEqual(oArg.placement, PopoverPlacement.Begin, "placement forwarded");
		assert.strictEqual(oArg.flipMode, "MoreSpace", "MoreSpace flip mode");
		assert.strictEqual(oArg.horizontalAlign, PopoverHorizontalAlign.End, "horizontalAlign forwarded");
		assert.strictEqual(oArg.verticalAlign, PopoverVerticalAlign.Bottom, "verticalAlign forwarded");
		oStub.restore();
		oTooltip.destroy();
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
		this.oTooltip.setPlacement(PopoverPlacement.Bottom);
		this.oTooltip.setDelay(1000);
		this.oTooltip.setHorizontalAlign(PopoverHorizontalAlign.End);
		this.oTooltip.setVerticalAlign(PopoverVerticalAlign.Bottom);
		assert.strictEqual(this.oTooltip.getText(), "Hi");
		assert.strictEqual(this.oTooltip.getPlacement(), PopoverPlacement.Bottom);
		assert.strictEqual(this.oTooltip.getDelay(), 1000);
		assert.strictEqual(this.oTooltip.getHorizontalAlign(), PopoverHorizontalAlign.End);
		assert.strictEqual(this.oTooltip.getVerticalAlign(), PopoverVerticalAlign.Bottom);
	});

	QUnit.test("alignment properties reject unknown values", function(assert) {
		assert.throws(function() {
			this.oTooltip.setHorizontalAlign("Nope");
		}.bind(this), "horizontalAlign is type-checked against the enum");
		assert.throws(function() {
			this.oTooltip.setVerticalAlign("Nope");
		}.bind(this), "verticalAlign is type-checked against the enum");
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
		this.oTooltip._sCalcedPos = "Bottom";
		this.oTooltip._applyPlacementClass();
		const oCl = this.oTooltip.getDomRef().classList;
		assert.ok(oCl.contains("sapUiCoreTooltip-Bottom"));
		assert.notOk(oCl.contains("sapUiCoreTooltip-Top"));
	});

	QUnit.test("adds sapUiCoreTooltip-Top class when placement is Top", function(assert) {
		this.oTooltip._sCalcedPos = "Top";
		this.oTooltip._applyPlacementClass();
		assert.ok(this.oTooltip.getDomRef().classList.contains("sapUiCoreTooltip-Top"));
	});

	QUnit.test("adds sapUiCoreTooltip-Left class when placement is Left", function(assert) {
		this.oTooltip._sCalcedPos = "Left";
		this.oTooltip._applyPlacementClass();
		assert.ok(this.oTooltip.getDomRef().classList.contains("sapUiCoreTooltip-Left"));
	});

	QUnit.test("adds sapUiCoreTooltip-Right class when placement is Right", function(assert) {
		this.oTooltip._sCalcedPos = "Right";
		this.oTooltip._applyPlacementClass();
		assert.ok(this.oTooltip.getDomRef().classList.contains("sapUiCoreTooltip-Right"));
	});

	QUnit.test("removes stale placement class before adding new one", function(assert) {
		this.oTooltip.getDomRef().classList.add("sapUiCoreTooltip-Top");
		this.oTooltip._sCalcedPos = "Bottom";
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

	QUnit.test("RTL emits the logical horizontal side class (undoes the CSS build-mirror)", function(assert) {
		const oStub = sinon.stub(Localization, "getRTL").returns(true);

		this.oTooltip._sCalcedPos = "Left";
		this.oTooltip._applyPlacementClass();
		let oCl = this.oTooltip.getDomRef().classList;
		assert.ok(oCl.contains("sapUiCoreTooltip-Right"), "physical Left maps to logical -Right class in RTL");
		assert.notOk(oCl.contains("sapUiCoreTooltip-Left"), "physical Left does not keep -Left in RTL");

		this.oTooltip._sCalcedPos = "Right";
		this.oTooltip._applyPlacementClass();
		oCl = this.oTooltip.getDomRef().classList;
		assert.ok(oCl.contains("sapUiCoreTooltip-Left"), "physical Right maps to logical -Left class in RTL");
		assert.notOk(oCl.contains("sapUiCoreTooltip-Right"), "physical Right does not keep -Right in RTL");

		oStub.restore();
	});

	QUnit.test("RTL leaves the vertical side class unchanged", function(assert) {
		const oStub = sinon.stub(Localization, "getRTL").returns(true);

		this.oTooltip._sCalcedPos = "Top";
		this.oTooltip._applyPlacementClass();
		assert.ok(this.oTooltip.getDomRef().classList.contains("sapUiCoreTooltip-Top"), "Top unchanged in RTL");

		this.oTooltip._sCalcedPos = "Bottom";
		this.oTooltip._applyPlacementClass();
		assert.ok(this.oTooltip.getDomRef().classList.contains("sapUiCoreTooltip-Bottom"), "Bottom unchanged in RTL");

		oStub.restore();
	});

	QUnit.test("renderer emits base class only; no side class before positioning", function(assert) {
		const oCl = this.oTooltip.getDomRef().classList;
		assert.ok(oCl.contains("sapUiCoreTooltip"), "base class present");
		assert.strictEqual(this.oTooltip._sCalcedPos, null, "side not yet resolved");
		["Top", "Bottom", "Left", "Right"].forEach(function(s) {
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

		// Assert — getFollowOf() returns a function (scroll-close handler)
		assert.strictEqual(typeof oPopup.getFollowOf(), "function",
			"getFollowOf() returns a function (scroll-close handler)");
	});

	QUnit.test("scroll (followOf) closes the tooltip instantly, cancelling a pending delayed close", function(assert) {
		const oPopup = this.oTooltip._ensurePopup();
		const oCloseSpy = sinon.spy(this.oTooltip, "close");

		// A delayed close (e.g. mouseout during scroll) is pending.
		this.oTooltip._bIsOpen = true;
		this.oTooltip.close(500);
		assert.ok(this.oTooltip._iCloseTimeout, "delayed close scheduled");

		// The scroll poll fires the wired followOf handler.
		oPopup.getFollowOf()();

		assert.ok(oCloseSpy.calledWith(0), "followOf routed through Tooltip.close(0)");
		assert.strictEqual(this.oTooltip._iCloseTimeout, null,
			"pending delayed close was cancelled");
		oCloseSpy.restore();
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

	QUnit.module("PopoverPlacement class on tooltip DOM", {
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
		PopoverPlacement.Top,
		PopoverPlacement.Bottom,
		PopoverPlacement.Begin,
		PopoverPlacement.End
	].forEach(function(sPlacement) {
		QUnit.test("placement " + sPlacement + " → a resolved physical side class", async function(assert) {
			this.oTooltip = new Tooltip({text: "Hi", placement: sPlacement, delay: 0});
			await openAndWait(this.clock, this.oTooltip, this.oButton);

			const oCl = this.oTooltip.getDomRef().classList;
			const aPresent = ["Top", "Bottom", "Left", "Right"].filter(function(s) {
				return oCl.contains("sapUiCoreTooltip-" + s);
			});
			assert.strictEqual(aPresent.length, 1, "exactly one physical side class is applied (" + aPresent.join(",") + ")");
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
		["Top", "Bottom", "Left", "Right"].forEach(function(s) {
			const sCls = "sapUiCoreTooltip-" + s;
			assert[s === sExpected ? "ok" : "notOk"](oCl.contains(sCls), sCls + " " + sWhen);
		});
	}

	QUnit.test("class retained when the tooltip is invalidated while open", async function(assert) {
		this.oTooltip = new Tooltip({text: "Hi", placement: PopoverPlacement.Bottom, delay: 0});
		await openAndWait(this.clock, this.oTooltip, this.oButton);
		assertOnlySide(assert, this.oTooltip, "Bottom", "after open");

		// Re-render while open; _sCalcedPos stays resolved, class must survive.
		this.oTooltip.invalidate();
		await nextUIUpdate(this.clock);
		await this.clock.tickAsync(1000);

		assert.ok(this.oTooltip.isOpen(), "still open after invalidate");
		assertOnlySide(assert, this.oTooltip, "Bottom", "after invalidate");
	});

	QUnit.test("class retained when setText triggers a re-render while open", async function(assert) {
		this.oTooltip = new Tooltip({text: "Hi", placement: PopoverPlacement.End, delay: 0});
		await openAndWait(this.clock, this.oTooltip, this.oButton);
		assertOnlySide(assert, this.oTooltip, "Right", "after open");

		this.oTooltip.setText("Longer tooltip text");
		await nextUIUpdate(this.clock);
		await this.clock.tickAsync(1000);

		assert.strictEqual(this.oTooltip.getDomRef().textContent.indexOf("Longer") !== -1, true, "text updated");
		assertOnlySide(assert, this.oTooltip, "Right", "after setText re-render");
	});

	QUnit.test("no stale side class after reopening on a different side", async function(assert) {
		this.oTooltip = new Tooltip({text: "Hi", placement: PopoverPlacement.Top, delay: 0});
		await openAndWait(this.clock, this.oTooltip, this.oButton);
		assertOnlySide(assert, this.oTooltip, "Top", "after first open");

		this.oTooltip.close();
		await this.clock.tickAsync(1000);

		// Reopen on the opposite side; the previous class must not linger.
		this.oTooltip.setPlacement(PopoverPlacement.Bottom);
		await openAndWait(this.clock, this.oTooltip, this.oButton);
		assertOnlySide(assert, this.oTooltip, "Bottom", "after reopen on Bottom");
	});

	QUnit.test("side class is present in the rendered DOM (renderer emits resolved side)", async function(assert) {
		this.oTooltip = new Tooltip({text: "Hi", placement: PopoverPlacement.Begin, delay: 0});
		await openAndWait(this.clock, this.oTooltip, this.oButton);

		// Re-render must re-emit the class from the renderer, not only _applyPlacementClass.
		assert.strictEqual(this.oTooltip._sCalcedPos, "Left", "side resolved");
		this.oTooltip.getDomRef().classList.remove("sapUiCoreTooltip-Left"); // simulate lost class
		this.oTooltip.invalidate();
		await nextUIUpdate(this.clock);
		assert.ok(
			this.oTooltip.getDomRef().classList.contains("sapUiCoreTooltip-Left"),
			"renderer re-emits the resolved side class on re-render"
		);
	});

	// The tooltip must dock on the correct side of the opener. Regression guard
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
		this.oTooltip = new Tooltip({text: "Hi", placement: PopoverPlacement.Bottom, delay: 0});
		const oBtnDom = this.oButton.getDomRef();
		oBtnDom.focus();
		assert.strictEqual(document.activeElement, oBtnDom, "opener focused before open");

		await openAndWait(this.clock, this.oTooltip, this.oButton);

		assert.ok(this.oTooltip.isOpen(), "tooltip open");
		assert.strictEqual(document.activeElement, oBtnDom,
			"focus stays on the opener; the tooltip never steals it");
	});

	QUnit.test("Left places the tooltip to the left of the opener", async function(assert) {
		this.oTooltip = new Tooltip({text: "Hi", placement: PopoverPlacement.Begin, delay: 0});
		await openAndWait(this.clock, this.oTooltip, this.oButton);

		const oTipRect = this.oTooltip.getDomRef().getBoundingClientRect();
		const oBtnRect = this.oButton.getDomRef().getBoundingClientRect();
		assert.ok(oTipRect.right <= oBtnRect.left + 1, "tooltip right edge is at/left of the opener left edge");
		assert.ok(oTipRect.left > 0, "tooltip not pinned to the document origin");
	});

	QUnit.test("Right places the tooltip to the right of the opener", async function(assert) {
		this.oTooltip = new Tooltip({text: "Hi", placement: PopoverPlacement.End, delay: 0});
		await openAndWait(this.clock, this.oTooltip, this.oButton);

		const oTipRect = this.oTooltip.getDomRef().getBoundingClientRect();
		const oBtnRect = this.oButton.getDomRef().getBoundingClientRect();
		assert.ok(oTipRect.left >= oBtnRect.right - 1, "tooltip left edge is at/right of the opener right edge");
	});

	QUnit.test("Top places the tooltip above the opener", async function(assert) {
		this.oTooltip = new Tooltip({text: "Hi", placement: PopoverPlacement.Top, delay: 0});
		await openAndWait(this.clock, this.oTooltip, this.oButton);

		const oTipRect = this.oTooltip.getDomRef().getBoundingClientRect();
		const oBtnRect = this.oButton.getDomRef().getBoundingClientRect();
		assert.ok(oTipRect.bottom <= oBtnRect.top + 1, "tooltip bottom edge is at/above the opener top edge");
		assert.ok(oTipRect.top > 0, "tooltip not pinned to the document origin");
	});

	QUnit.test("Bottom places the tooltip below the opener", async function(assert) {
		this.oTooltip = new Tooltip({text: "Hi", placement: PopoverPlacement.Bottom, delay: 0});
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

	[PopoverPlacement.Begin, PopoverPlacement.End, PopoverPlacement.Top, PopoverPlacement.Bottom].forEach(function(sPlacement) {
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
		this.oTooltip = new Tooltip({text: "Short", placement: PopoverPlacement.Begin, delay: 0});
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

	QUnit.test("clears stale position before docking", function(assert) {
		// Wire up the real _applyPosition override.
		this.oTooltip._ensurePopup();
		this.oTooltip._oHostForArrow = this.oStub.getDomRef();
		this.oTooltip._bPosResolved = false; // first pass: clear, resolve side, re-anchor, re-dock

		const oDomRef = this.oTooltip.getDomRef();
		// Simulate stale inline position from a previous open.
		oDomRef.style.left = "123px";
		oDomRef.style.right = "45px";
		oDomRef.style.top = "67px";
		oDomRef.style.bottom = "89px";

		// The Popup is open state-wise so the override does not early-return.
		sinon.stub(this.oTooltip._oPopup, "getOpenState").returns("OPEN");
		this.oTooltip._oPopup._applyPosition({});

		// The first pass wipes the stale offsets, then re-docks the box via
		// _fitIntoWithinArea — so the offsets now hold freshly-computed values, not
		// the stale ones. Assert the stale values did not leak through rather than
		// that the offsets stayed empty.
		assert.notStrictEqual(oDomRef.style.left, "123px", "stale left did not leak through");
		assert.notStrictEqual(oDomRef.style.right, "45px", "stale right did not leak through");
		assert.notStrictEqual(oDomRef.style.top, "67px", "stale top did not leak through");
		assert.notStrictEqual(oDomRef.style.bottom, "89px", "stale bottom did not leak through");
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
		const oStubElement = this.stub.getDomRef();
		window.getSelection = function() {
			return {
				toString: function() { return "user has a selection"; },
				anchorNode: oStubElement
			};
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

	// ---------------------------------------------------------------------------
	// Cross-axis alignment: horizontalAlign / verticalAlign
	// ---------------------------------------------------------------------------

	QUnit.module("Alignment is forwarded to Positioning", {
		beforeEach: function() {
			this.oTooltip = new Tooltip({
				text: "Hi",
				delay: 0,
				horizontalAlign: PopoverHorizontalAlign.End,
				verticalAlign: PopoverVerticalAlign.Bottom
			});
			this.stub = makeStub();
			this.oPopup = stubPopup(this.oTooltip);
		},
		afterEach: async function() {
			this.oTooltip._clearTimeouts();
			this.oTooltip.destroy();
			removeStub(this.stub);
			// "_positionArrow forwards ..." renders the tooltip. Destroying a
			// rendered control leaves a pending rendering task on the fake clock;
			// draining it here keeps it from deadlocking the next module's
			// nextUIUpdate().
			await this.clock.tickAsync(2000);
		}
	});

	QUnit.test("_doOpen forwards both alignments to computeAnchor", function(assert) {
		const oSpy = sinon.spy(Positioning, "computeAnchor");
		this.oTooltip._ensurePopup();

		this.oTooltip._doOpen(this.stub);

		assert.ok(oSpy.calledOnce, "computeAnchor called");
		const oArg = oSpy.firstCall.args[0];
		assert.strictEqual(oArg.horizontalAlign, PopoverHorizontalAlign.End, "horizontalAlign forwarded");
		assert.strictEqual(oArg.verticalAlign, PopoverVerticalAlign.Bottom, "verticalAlign forwarded");
		oSpy.restore();
	});

	QUnit.test("_positionArrow forwards both alignments to computeArrowOffset", async function(assert) {
		this.oTooltip.placeAt("content");
		await nextUIUpdate(this.clock);
		this.oTooltip._oHostForArrow = this.stub.getDomRef();
		this.oTooltip._sCalcedPos = "Bottom";

		const oSpy = sinon.spy(Positioning, "computeArrowOffset");
		this.oTooltip._positionArrow();

		assert.ok(oSpy.calledOnce, "computeArrowOffset called");
		const oArg = oSpy.firstCall.args[0];
		assert.strictEqual(oArg.horizontalAlign, PopoverHorizontalAlign.End, "horizontalAlign forwarded");
		assert.strictEqual(oArg.verticalAlign, PopoverVerticalAlign.Bottom, "verticalAlign forwarded");
		oSpy.restore();
	});

	QUnit.module("_applyStretchSize", {
		beforeEach: function() {
			this.oStub = makeStub();
			// Give the opener a deterministic size.
			Object.assign(this.oStub.getDomRef().style, {width: "180px", height: "60px"});
			// The alignment is passed to the constructor: changing it with a setter
			// on an already rendered tooltip would schedule a re-render that the
			// fake clock in afterEach would have to drain.
			this.render = async function(mSettings) {
				this.oTooltip = new Tooltip(Object.assign({text: "Hi"}, mSettings));
				this.oTooltip.placeAt("content");
				await nextUIUpdate(this.clock);
				this.oTooltip._oHostForArrow = this.oStub.getDomRef();
				return this.oTooltip.getDomRef();
			}.bind(this);
		},
		afterEach: async function() {
			this.oTooltip.destroy();
			removeStub(this.oStub);
			await this.clock.tickAsync(2000);
		}
	});

	QUnit.test("Stretch on a vertical side sizes the tooltip to the opener width", async function(assert) {
		const oDomRef = await this.render({horizontalAlign: PopoverHorizontalAlign.Stretch});

		this.oTooltip._applyStretchSize("Bottom");

		assert.strictEqual(oDomRef.style.width, "180px", "width taken from the opener");
		assert.strictEqual(oDomRef.style.height, "", "height untouched on a vertical side");
	});

	QUnit.test("Stretch on a horizontal side sizes the tooltip to the opener height", async function(assert) {
		const oDomRef = await this.render({verticalAlign: PopoverVerticalAlign.Stretch});

		this.oTooltip._applyStretchSize("Left");

		assert.strictEqual(oDomRef.style.height, "60px", "height taken from the opener");
		assert.strictEqual(oDomRef.style.width, "", "width untouched on a horizontal side");
	});

	QUnit.test("the alignment of the other axis is ignored", async function(assert) {
		// Stretch on the vertical axis must not size a Top/Bottom-placed tooltip.
		const oDomRef = await this.render({verticalAlign: PopoverVerticalAlign.Stretch});

		this.oTooltip._applyStretchSize("Top");

		assert.strictEqual(oDomRef.style.width, "", "no width for a vertical side driven by verticalAlign");
		assert.strictEqual(oDomRef.style.height, "", "no height either");
	});

	QUnit.test("a non-Stretch alignment leaves the size alone", async function(assert) {
		const oDomRef = await this.render({horizontalAlign: PopoverHorizontalAlign.Begin});

		this.oTooltip._applyStretchSize("Bottom");

		assert.strictEqual(oDomRef.style.width, "", "no width set");
		assert.strictEqual(oDomRef.style.height, "", "no height set");
	});

	QUnit.test("a size from a previous open is reset first", async function(assert) {
		const oDomRef = await this.render({horizontalAlign: PopoverHorizontalAlign.Center});
		// Previous open stretched the tooltip.
		oDomRef.style.width = "999px";
		oDomRef.style.height = "999px";

		this.oTooltip._applyStretchSize("Bottom");

		assert.strictEqual(oDomRef.style.width, "", "stale width cleared");
		assert.strictEqual(oDomRef.style.height, "", "stale height cleared");
	});

	QUnit.module("_computeAlignedMaxSize", {
		beforeEach: function() {
			this.oStub = makeStub();
			// Pin the opener so its rect is stable and known.
			Object.assign(this.oStub.getDomRef().style, {
				position: "fixed", top: "100px", left: "300px", width: "180px", height: "60px"
			});
			this.oHostRect = this.oStub.getDomRef().getBoundingClientRect();
			this.render = async function(mSettings) {
				this.oTooltip = new Tooltip(Object.assign({text: "Hi"}, mSettings));
				this.oTooltip.placeAt("content");
				await nextUIUpdate(this.clock);
				this.oTooltip._oHostForArrow = this.oStub.getDomRef();
				return this.oTooltip.getDomRef();
			}.bind(this);
		},
		afterEach: async function() {
			this.oTooltip.destroy();
			removeStub(this.oStub);
			await this.clock.tickAsync(2000);
		}
	});

	QUnit.test("Begin leaves only the room towards the end of the viewport", async function(assert) {
		await this.render({horizontalAlign: PopoverHorizontalAlign.Begin});

		const oMax = this.oTooltip._computeAlignedMaxSize("Bottom");

		assert.strictEqual(
			oMax.maxWidth,
			document.documentElement.clientWidth - this.oHostRect.left - EDGE_MARGIN_PX,
			"measured from the opener's left edge to the right bound"
		);
		assert.strictEqual(oMax.maxHeight, undefined, "no height limit on a vertical side");
	});

	QUnit.test("End leaves only the room towards the start of the viewport", async function(assert) {
		await this.render({horizontalAlign: PopoverHorizontalAlign.End});

		const oMax = this.oTooltip._computeAlignedMaxSize("Top");

		assert.strictEqual(
			oMax.maxWidth,
			this.oHostRect.right - EDGE_MARGIN_PX,
			"measured from the left bound to the opener's right edge"
		);
	});

	QUnit.test("Begin pins the right edge in RTL", async function(assert) {
		await this.render({horizontalAlign: PopoverHorizontalAlign.Begin});
		const oRtl = sinon.stub(Localization, "getRTL").returns(true);

		assert.strictEqual(
			this.oTooltip._computeAlignedMaxSize("Bottom").maxWidth,
			this.oHostRect.right - EDGE_MARGIN_PX,
			"Begin measures towards the left bound in RTL"
		);

		oRtl.restore();
	});

	QUnit.test("End pins the left edge in RTL", async function(assert) {
		await this.render({horizontalAlign: PopoverHorizontalAlign.End});
		const oRtl = sinon.stub(Localization, "getRTL").returns(true);

		assert.strictEqual(
			this.oTooltip._computeAlignedMaxSize("Bottom").maxWidth,
			document.documentElement.clientWidth - this.oHostRect.left - EDGE_MARGIN_PX,
			"End measures towards the right bound in RTL"
		);

		oRtl.restore();
	});

	QUnit.test("Top limits the height on a horizontal side", async function(assert) {
		await this.render({verticalAlign: PopoverVerticalAlign.Top});

		assert.strictEqual(
			this.oTooltip._computeAlignedMaxSize("Right").maxHeight,
			document.documentElement.clientHeight - this.oHostRect.top - EDGE_MARGIN_PX,
			"Top measures down from the opener's top edge"
		);
	});

	QUnit.test("Bottom limits the height on a horizontal side", async function(assert) {
		await this.render({verticalAlign: PopoverVerticalAlign.Bottom});

		assert.strictEqual(
			this.oTooltip._computeAlignedMaxSize("Left").maxHeight,
			this.oHostRect.bottom - EDGE_MARGIN_PX,
			"Bottom measures up from the opener's bottom edge"
		);
	});

	QUnit.test("Center imposes no limit", async function(assert) {
		await this.render({
			horizontalAlign: PopoverHorizontalAlign.Center,
			verticalAlign: PopoverVerticalAlign.Center
		});

		assert.deepEqual(this.oTooltip._computeAlignedMaxSize("Bottom"), {}, "on a vertical side");
		assert.deepEqual(this.oTooltip._computeAlignedMaxSize("Left"), {}, "on a horizontal side");
	});

	QUnit.test("Stretch limits to the opener's own extent", async function(assert) {
		await this.render({
			horizontalAlign: PopoverHorizontalAlign.Stretch,
			verticalAlign: PopoverVerticalAlign.Stretch
		});

		// The theme caps the tooltip at max-width: 17rem. A stretched tooltip must
		// match its opener instead, so the limit is reported as the opener's extent
		// and overrides the theme cap rather than letting it shrink the box.
		assert.deepEqual(
			this.oTooltip._computeAlignedMaxSize("Bottom"),
			{maxWidth: this.oHostRect.width},
			"on a vertical side the limit is the opener's width"
		);
		assert.deepEqual(
			this.oTooltip._computeAlignedMaxSize("Left"),
			{maxHeight: this.oHostRect.height},
			"on a horizontal side the limit is the opener's height"
		);
	});

	QUnit.test("no opener yields no limit", async function(assert) {
		await this.render({horizontalAlign: PopoverHorizontalAlign.Begin});
		this.oTooltip._oHostForArrow = null;

		assert.deepEqual(this.oTooltip._computeAlignedMaxSize("Bottom"), {}, "nothing to measure against");
	});

	QUnit.test("_applyAlignedSizeCaps writes the limit to the DOM and resets a stale one", async function(assert) {
		const oDomRef = await this.render({horizontalAlign: PopoverHorizontalAlign.Begin});
		oDomRef.style.maxWidth = "999px";
		oDomRef.style.maxHeight = "999px";

		this.oTooltip._applyAlignedSizeCaps("Bottom");

		assert.strictEqual(
			oDomRef.style.maxWidth,
			(document.documentElement.clientWidth - this.oHostRect.left - EDGE_MARGIN_PX) + "px",
			"max-width applied"
		);
		assert.strictEqual(oDomRef.style.maxHeight, "", "stale max-height cleared");
	});

	QUnit.test("_applyAlignedSizeCaps clears the cap for a centered alignment", async function(assert) {
		const oDomRef = await this.render({horizontalAlign: PopoverHorizontalAlign.Center});
		oDomRef.style.maxWidth = "999px";

		this.oTooltip._applyAlignedSizeCaps("Bottom");

		assert.strictEqual(oDomRef.style.maxWidth, "", "cap removed for a centered alignment");
	});

	QUnit.module("_hasOpenerBoundCrossAxis", {
		beforeEach: function() {
			this.check = function(mSettings, sSide) {
				const oTooltip = new Tooltip(mSettings);
				const bResult = oTooltip._hasOpenerBoundCrossAxis(sSide);
				oTooltip.destroy();
				return bResult;
			};
		}
	});

	QUnit.test("only a centered cross axis leaves the clamp in charge", function(assert) {
		// The cross axis of a vertical side is horizontal, and vice versa — the
		// alignment of the *other* axis must not influence the answer.
		[PopoverHorizontalAlign.Begin, PopoverHorizontalAlign.End, PopoverHorizontalAlign.Stretch]
			.forEach((sAlign) => {
				assert.ok(this.check({horizontalAlign: sAlign}, "Bottom"),
					"horizontalAlign " + sAlign + " owns the cross axis of a vertical side");
				assert.notOk(this.check({horizontalAlign: sAlign}, "Left"),
					"horizontalAlign " + sAlign + " is ignored on a horizontal side");
			});

		[PopoverVerticalAlign.Top, PopoverVerticalAlign.Bottom, PopoverVerticalAlign.Stretch]
			.forEach((sAlign) => {
				assert.ok(this.check({verticalAlign: sAlign}, "Right"),
					"verticalAlign " + sAlign + " owns the cross axis of a horizontal side");
				assert.notOk(this.check({verticalAlign: sAlign}, "Top"),
					"verticalAlign " + sAlign + " is ignored on a vertical side");
			});

		assert.notOk(this.check({}, "Bottom"), "the default Center leaves a vertical side to the clamp");
		assert.notOk(this.check({}, "Left"), "the default Center leaves a horizontal side to the clamp");
	});

	QUnit.module("_dockCrossAxis", {
		beforeEach: function() {
			this.oStub = makeStub();
			Object.assign(this.oStub.getDomRef().style, {
				position: "fixed", top: "100px", left: "300px", width: "180px", height: "60px"
			});

			this.render = async function(mSettings) {
				this.oTooltip = new Tooltip(Object.assign({text: "Hi"}, mSettings));
				this.oTooltip.placeAt("content");
				await nextUIUpdate(this.clock);
				this.oTooltip._oHostForArrow = this.oStub.getDomRef();

				const oDomRef = this.oTooltip.getDomRef();
				// Mimic the Popup's dock: absolute, offsets owned by the "left"/"top"
				// pair, deliberately off the opener so the correction is measurable.
				Object.assign(oDomRef.style, {position: "fixed", left: "0px", top: "0px", width: "50px", height: "20px"});
				return oDomRef;
			}.bind(this);
		},
		afterEach: async function() {
			this.oTooltip.destroy();
			removeStub(this.oStub);
			await this.clock.tickAsync(2000);
		}
	});

	QUnit.test("Begin pulls the tooltip's left edge onto the opener's left edge", async function(assert) {
		const oDomRef = await this.render({horizontalAlign: PopoverHorizontalAlign.Begin});

		this.oTooltip._dockCrossAxis("Bottom");

		assert.strictEqual(Math.round(oDomRef.getBoundingClientRect().left), 300, "left edges meet");
	});

	QUnit.test("End pulls the tooltip's right edge onto the opener's right edge", async function(assert) {
		const oDomRef = await this.render({horizontalAlign: PopoverHorizontalAlign.End});

		this.oTooltip._dockCrossAxis("Bottom");

		assert.strictEqual(Math.round(oDomRef.getBoundingClientRect().right), 480, "right edges meet");
	});

	QUnit.test("Stretch docks the start edge, like Begin", async function(assert) {
		const oDomRef = await this.render({horizontalAlign: PopoverHorizontalAlign.Stretch});

		this.oTooltip._dockCrossAxis("Bottom");

		assert.strictEqual(Math.round(oDomRef.getBoundingClientRect().left), 300, "left edges meet");
	});

	QUnit.test("verticalAlign Top/Bottom dock the matching horizontal edge", async function(assert) {
		let oDomRef = await this.render({verticalAlign: PopoverVerticalAlign.Top});
		this.oTooltip._dockCrossAxis("Right");
		assert.strictEqual(Math.round(oDomRef.getBoundingClientRect().top), 100, "top edges meet");

		this.oTooltip.destroy();
		oDomRef = await this.render({verticalAlign: PopoverVerticalAlign.Bottom});
		this.oTooltip._dockCrossAxis("Right");
		assert.strictEqual(Math.round(oDomRef.getBoundingClientRect().bottom), 160, "bottom edges meet");
	});

	QUnit.test("the offsets the dock did not use are left alone", async function(assert) {
		const oDomRef = await this.render({horizontalAlign: PopoverHorizontalAlign.End});
		// The Popup docks with only one offset per axis; "right" must stay untouched
		// so the box keeps reacting to its content.
		oDomRef.style.right = "";

		this.oTooltip._dockCrossAxis("Bottom");

		assert.strictEqual(oDomRef.style.right, "", "the unused offset stays unset");
		assert.notStrictEqual(oDomRef.style.left, "0px", "the used offset carries the correction");
	});

	QUnit.test("a centered cross axis is not touched", async function(assert) {
		const oDomRef = await this.render({horizontalAlign: PopoverHorizontalAlign.Center});

		this.oTooltip._dockCrossAxis("Bottom");

		assert.strictEqual(oDomRef.style.left, "0px", "the clamp keeps ownership of a centered axis");
	});

	QUnit.test("no opener leaves the position untouched", async function(assert) {
		const oDomRef = await this.render({horizontalAlign: PopoverHorizontalAlign.Begin});
		this.oTooltip._oHostForArrow = null;

		this.oTooltip._dockCrossAxis("Bottom");

		assert.strictEqual(oDomRef.style.left, "0px", "nothing to dock against");
	});


	QUnit.module("Alignment on tooltip DOM", {
		beforeEach: async function() {
			// A wide, tall anchor: the tooltip is much smaller on both axes, so
			// each alignment lands on a clearly different edge.
			this.oButton = new Button({text: "Anchor"});
			this.oButton.placeAt("content");
			await nextUIUpdate(this.clock);
			Object.assign(this.oButton.getDomRef().style, {
				position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
				width: "320px", height: "160px"
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

	QUnit.test("horizontalAlign Begin docks the tooltip's left edge to the opener's left edge", async function(assert) {
		this.oTooltip = new Tooltip({
			text: "Hi", placement: PopoverPlacement.Bottom, delay: 0,
			horizontalAlign: PopoverHorizontalAlign.Begin
		});
		await openAndWait(this.clock, this.oTooltip, this.oButton);

		const oTipRect = this.oTooltip.getDomRef().getBoundingClientRect();
		const oBtnRect = this.oButton.getDomRef().getBoundingClientRect();
		assert.ok(Math.abs(oTipRect.left - oBtnRect.left) <= 2,
			"left edges aligned (" + oTipRect.left + " vs " + oBtnRect.left + ")");
		assert.ok(oTipRect.right < oBtnRect.right, "the tooltip is narrower, so it does not reach the opener's right edge");
	});

	QUnit.test("horizontalAlign End docks the tooltip's right edge to the opener's right edge", async function(assert) {
		this.oTooltip = new Tooltip({
			text: "Hi", placement: PopoverPlacement.Bottom, delay: 0,
			horizontalAlign: PopoverHorizontalAlign.End
		});
		await openAndWait(this.clock, this.oTooltip, this.oButton);

		const oTipRect = this.oTooltip.getDomRef().getBoundingClientRect();
		const oBtnRect = this.oButton.getDomRef().getBoundingClientRect();
		assert.ok(Math.abs(oTipRect.right - oBtnRect.right) <= 2,
			"right edges aligned (" + oTipRect.right + " vs " + oBtnRect.right + ")");
		assert.ok(oTipRect.left > oBtnRect.left, "the tooltip does not reach the opener's left edge");
	});

	QUnit.test("horizontalAlign Center keeps the tooltip centered on the opener", async function(assert) {
		this.oTooltip = new Tooltip({
			text: "Hi", placement: PopoverPlacement.Bottom, delay: 0,
			horizontalAlign: PopoverHorizontalAlign.Center
		});
		await openAndWait(this.clock, this.oTooltip, this.oButton);

		const oTipRect = this.oTooltip.getDomRef().getBoundingClientRect();
		const oBtnRect = this.oButton.getDomRef().getBoundingClientRect();
		const fTipCenter = oTipRect.left + oTipRect.width / 2;
		const fBtnCenter = oBtnRect.left + oBtnRect.width / 2;
		assert.ok(Math.abs(fTipCenter - fBtnCenter) <= 2,
			"centers aligned (" + fTipCenter + " vs " + fBtnCenter + ")");
	});

	QUnit.test("horizontalAlign Stretch sizes the tooltip to the opener width", async function(assert) {
		this.oTooltip = new Tooltip({
			text: "Hi", placement: PopoverPlacement.Bottom, delay: 0,
			horizontalAlign: PopoverHorizontalAlign.Stretch
		});
		await openAndWait(this.clock, this.oTooltip, this.oButton);

		const oTipRect = this.oTooltip.getDomRef().getBoundingClientRect();
		const oBtnRect = this.oButton.getDomRef().getBoundingClientRect();
		assert.ok(Math.abs(oTipRect.width - oBtnRect.width) <= 2,
			"widths match (" + oTipRect.width + " vs " + oBtnRect.width + ")");
		assert.ok(Math.abs(oTipRect.left - oBtnRect.left) <= 2, "and it starts at the opener's left edge");
	});

	QUnit.test("verticalAlign Top docks the tooltip's top edge to the opener's top edge", async function(assert) {
		this.oTooltip = new Tooltip({
			text: "Hi", placement: PopoverPlacement.End, delay: 0,
			verticalAlign: PopoverVerticalAlign.Top
		});
		await openAndWait(this.clock, this.oTooltip, this.oButton);

		const oTipRect = this.oTooltip.getDomRef().getBoundingClientRect();
		const oBtnRect = this.oButton.getDomRef().getBoundingClientRect();
		assert.ok(Math.abs(oTipRect.top - oBtnRect.top) <= 2,
			"top edges aligned (" + oTipRect.top + " vs " + oBtnRect.top + ")");
	});

	QUnit.test("verticalAlign Bottom docks the tooltip's bottom edge to the opener's bottom edge", async function(assert) {
		this.oTooltip = new Tooltip({
			text: "Hi", placement: PopoverPlacement.End, delay: 0,
			verticalAlign: PopoverVerticalAlign.Bottom
		});
		await openAndWait(this.clock, this.oTooltip, this.oButton);

		const oTipRect = this.oTooltip.getDomRef().getBoundingClientRect();
		const oBtnRect = this.oButton.getDomRef().getBoundingClientRect();
		assert.ok(Math.abs(oTipRect.bottom - oBtnRect.bottom) <= 2,
			"bottom edges aligned (" + oTipRect.bottom + " vs " + oBtnRect.bottom + ")");
	});

	QUnit.test("verticalAlign Stretch sizes the tooltip to the opener height", async function(assert) {
		this.oTooltip = new Tooltip({
			text: "Hi", placement: PopoverPlacement.End, delay: 0,
			verticalAlign: PopoverVerticalAlign.Stretch
		});
		await openAndWait(this.clock, this.oTooltip, this.oButton);

		const oTipRect = this.oTooltip.getDomRef().getBoundingClientRect();
		const oBtnRect = this.oButton.getDomRef().getBoundingClientRect();
		assert.ok(Math.abs(oTipRect.height - oBtnRect.height) <= 2,
			"heights match (" + oTipRect.height + " vs " + oBtnRect.height + ")");
	});

	QUnit.test("the alignment of the other axis does not move the tooltip", async function(assert) {
		// verticalAlign must be ignored for a Bottom placement.
		this.oTooltip = new Tooltip({
			text: "Hi", placement: PopoverPlacement.Bottom, delay: 0,
			verticalAlign: PopoverVerticalAlign.Bottom
		});
		await openAndWait(this.clock, this.oTooltip, this.oButton);

		const oTipRect = this.oTooltip.getDomRef().getBoundingClientRect();
		const oBtnRect = this.oButton.getDomRef().getBoundingClientRect();
		const fTipCenter = oTipRect.left + oTipRect.width / 2;
		const fBtnCenter = oBtnRect.left + oBtnRect.width / 2;
		assert.ok(Math.abs(fTipCenter - fBtnCenter) <= 2, "still centered — the default horizontalAlign applies");
		assert.ok(oTipRect.top >= oBtnRect.bottom - 1, "and still below the opener");
	});

	QUnit.test("the arrow is pinned to the aligned corner, not to the opener's center", async function(assert) {
		this.oTooltip = new Tooltip({
			text: "Hi", placement: PopoverPlacement.Bottom, delay: 0,
			horizontalAlign: PopoverHorizontalAlign.Begin
		});
		await openAndWait(this.clock, this.oTooltip, this.oButton);

		const oDomRef = this.oTooltip.getDomRef();
		const oArrow = oDomRef.querySelector(".sapUiCoreTooltipArrow");
		const oTipRect = oDomRef.getBoundingClientRect();
		const oArrowRect = oArrow.getBoundingClientRect();

		// The opener is far wider than the tooltip, so an opener-centered arrow
		// would sit at the tooltip's far (right) end. Begin must keep it near the
		// tooltip's left corner instead.
		assert.ok(oArrowRect.left - oTipRect.left < oTipRect.width / 2,
			"arrow sits in the left half of the tooltip");
	});

	QUnit.module("Edge-aligned wrapping", {
		beforeEach: async function() {
			this.oButton = new Button({text: "Anchor"});
			this.oButton.placeAt("content");
			await nextUIUpdate(this.clock);
			// Push the anchor against the right edge: a Begin-aligned tooltip would
			// grow towards the right, where there is almost no room left.
			Object.assign(this.oButton.getDomRef().style, {
				position: "fixed", top: "50%", right: "20px", width: "120px"
			});
			this.sLong = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. ".repeat(8);
		},
		afterEach: async function() {
			if (this.oTooltip) {
				this.oTooltip.destroy();
			}
			this.oButton.destroy();
			await this.clock.tickAsync(2000);
		}
	});

	QUnit.test("Begin against the right edge flips to End so the long text grows into the free side", async function(assert) {
		this.oTooltip = new Tooltip({
			text: this.sLong, placement: PopoverPlacement.Bottom, delay: 0,
			horizontalAlign: PopoverHorizontalAlign.Begin
		});
		await openAndWait(this.clock, this.oTooltip, this.oButton);

		const oDomRef = this.oTooltip.getDomRef();
		const oTipRect = oDomRef.getBoundingClientRect();
		const oBtnRect = this.oButton.getDomRef().getBoundingClientRect();

		assert.strictEqual(this.oTooltip._getEffectiveHorizontalAlign(), PopoverHorizontalAlign.End,
			"the cramped Begin alignment is flipped to End");
		assert.ok(oDomRef.style.maxWidth, "a max-width is applied");
		assert.ok(Math.round(oTipRect.left) >= 0,
			"the tooltip stays inside the viewport (" + oTipRect.left + " >= 0)");
		assert.ok(Math.abs(oTipRect.right - oBtnRect.right) <= 2,
			"it now docks its right edge to the opener's right edge and grows left");
		assert.ok(oTipRect.height > 0, "the tooltip is rendered");
	});

	QUnit.test("the mirrored case: End against the left edge flips to Begin", async function(assert) {
		Object.assign(this.oButton.getDomRef().style, {right: "", left: "20px"});

		this.oTooltip = new Tooltip({
			text: this.sLong, placement: PopoverPlacement.Bottom, delay: 0,
			horizontalAlign: PopoverHorizontalAlign.End
		});
		await openAndWait(this.clock, this.oTooltip, this.oButton);

		const oDomRef = this.oTooltip.getDomRef();
		const oTipRect = oDomRef.getBoundingClientRect();
		const oBtnRect = this.oButton.getDomRef().getBoundingClientRect();

		assert.strictEqual(this.oTooltip._getEffectiveHorizontalAlign(), PopoverHorizontalAlign.Begin,
			"the cramped End alignment is flipped to Begin");
		assert.ok(oDomRef.style.maxWidth, "a max-width is applied");
		assert.ok(Math.round(oTipRect.right) <= document.documentElement.clientWidth,
			"the tooltip stays inside the viewport");
		assert.ok(Math.abs(oTipRect.left - oBtnRect.left) <= 2,
			"it now docks its left edge to the opener's left edge and grows right");
	});

	QUnit.test("a short Begin tooltip against the right edge keeps its alignment (no flip)", async function(assert) {
		// The anchor still sits against the right edge, but the content is short
		// enough to fit in the room left towards the end — so Begin is honoured.
		this.oTooltip = new Tooltip({
			text: "Hi", placement: PopoverPlacement.Bottom, delay: 0,
			horizontalAlign: PopoverHorizontalAlign.Begin
		});
		await openAndWait(this.clock, this.oTooltip, this.oButton);

		const oTipRect = this.oTooltip.getDomRef().getBoundingClientRect();
		const oBtnRect = this.oButton.getDomRef().getBoundingClientRect();

		assert.strictEqual(this.oTooltip._getEffectiveHorizontalAlign(), PopoverHorizontalAlign.Begin,
			"a fitting tooltip is not flipped");
		assert.ok(Math.abs(oTipRect.left - oBtnRect.left) <= 2,
			"the left edges still match");
	});

	QUnit.test("a centered alignment is not capped by the aligned-edge limit", async function(assert) {
		this.oTooltip = new Tooltip({
			text: "Short", placement: PopoverPlacement.Bottom, delay: 0,
			horizontalAlign: PopoverHorizontalAlign.Center
		});
		await openAndWait(this.clock, this.oTooltip, this.oButton);

		assert.strictEqual(this.oTooltip.getDomRef().style.maxWidth, "",
			"no aligned-edge cap for a centered short tooltip");
	});

	// Regression: with Stretch the side used to be chosen from the tooltip's
	// natural (wide, short) box, then the box was narrowed to the opener width —
	// the wrapped text made it much taller, so a Bottom placement that "fit"
	// before stretching no longer did, and the tooltip scrolled below instead of
	// flipping above. The side must now be resolved from the already-stretched box.
	QUnit.module("Stretch flips the side using the stretched (wrapped) size", {
		beforeEach: async function() {
			this.oButton = new Button({text: "x"});
			this.oButton.placeAt("content");
			await nextUIUpdate(this.clock);
			// A narrow opener near the bottom edge: once the Stretch tooltip is
			// narrowed to this width, the long text wraps to several lines and no
			// longer fits in the small space below.
			Object.assign(this.oButton.getDomRef().style, {
				position: "fixed", left: "40px", bottom: "80px", width: "48px", height: "24px"
			});
			this.sLong = "Lorem ipsum dolor sit amet, consectetur adipiscing.";
		},
		afterEach: async function() {
			if (this.oTooltip) {
				this.oTooltip.destroy();
			}
			this.oButton.destroy();
			await this.clock.tickAsync(2000);
		}
	});

	QUnit.test("Bottom + horizontalAlign Stretch flips above a narrow bottom-edge opener", async function(assert) {
		this.oTooltip = new Tooltip({
			text: this.sLong, placement: PopoverPlacement.Bottom, delay: 0,
			horizontalAlign: PopoverHorizontalAlign.Stretch
		});
		await openAndWait(this.clock, this.oTooltip, this.oButton);

		const oDomRef = this.oTooltip.getDomRef();
		const oTipRect = oDomRef.getBoundingClientRect();
		const oBtnRect = this.oButton.getDomRef().getBoundingClientRect();

		assert.strictEqual(this.oTooltip._sCalcedPos, "Top",
			"the stretched box no longer fits below, so the side flips to Top");
		assert.ok(oTipRect.bottom <= oBtnRect.top + 1,
			"the tooltip sits above the opener");

		// With plenty of room above, the content fits without scrolling.
		const oContRef = oDomRef.querySelector(".sapUiCoreTooltipCont");
		assert.ok(oContRef.scrollHeight <= oContRef.clientHeight + 1,
			"the content is not forced to scroll (" + oContRef.scrollHeight + " <= " + oContRef.clientHeight + ")");
	});
});

