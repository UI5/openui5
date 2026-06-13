/*global QUnit, sinon */
sap.ui.define([
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/test/utils/nextUIUpdate",
	"sap/m/Tooltip",
	"sap/m/Button",
	"sap/m/library",
	"sap/ui/Device"
], function(createAndAppendDiv, nextUIUpdate, Tooltip, Button, mLibrary, Device) {
	"use strict";
	const PlacementType = mLibrary.PlacementType;
	createAndAppendDiv("content");

	function makeFakePopover() {
		const oText = {setText: function() {}};
		return {
			getContent: function() { return [oText]; },
			setPlacement: function() {},
			openBy: function() {},
			close: function() {},
			isOpen: function() { return false; },
			destroy: function() { this.bIsDestroyed = true; },
			addStyleClass: function() {},
			addEventDelegate: function() {},
			fireAfterClose: function() { if (this._afterClose) { this._afterClose(); } },
			attachAfterClose: function(fn) { this._afterClose = fn; },
			bIsDestroyed: false,
			_getInitialFocusId: null,
			_applyFocus: null,
			_restoreFocus: null
		};
	}

	// Creates a plain HTMLElement stub that satisfies the oControl contract expected by
	// Tooltip.attachEvent / _detachEvent: getDomRef() and optional getAggregation().
	function makeStub(oTooltipInstance, sTagName) {
		const el = document.createElement(sTagName || "div");
		el.tabIndex = 0;
		document.getElementById("content").appendChild(el);

		const stub = {
			getDomRef: function() { return el; },
			_div: el
		};
		if (oTooltipInstance) {
			stub.getAggregation = function(sName) {
				return sName === "_tooltip" ? oTooltipInstance : null;
			};
		}
		return stub;
	}

	function removeStub(oStub) {
		if (oStub._div && oStub._div.parentNode) {
			oStub._div.parentNode.removeChild(oStub._div);
		}
	}

	QUnit.module("Defaults", {
		beforeEach: function() {
			this.t = new Tooltip();
		},
		afterEach: function() {
			this.t.destroy();
		}
	});

	QUnit.test("defaults", function(assert) {
		assert.strictEqual(this.t.getText(), "", "text");
		assert.strictEqual(this.t.getPlacement(), PlacementType.VerticalPreferredTop, "placement");
		assert.strictEqual(this.t.getDelay(), 500, "delay");
		assert.strictEqual(this.t.getDisabledForMobile(), false, "disabledForMobile");
	});

	QUnit.module("Props", {
		beforeEach: function() {
			this.t = new Tooltip();
		},
		afterEach: function() {
			this.t.destroy();
		}
	});

	QUnit.test("set all", function(assert) {
		this.t.setText("Hi");
		this.t.setPlacement(PlacementType.Bottom);
		this.t.setDelay(1000);
		this.t.setDisabledForMobile(true);
		assert.strictEqual(this.t.getText(), "Hi");
		assert.strictEqual(this.t.getPlacement(), PlacementType.Bottom);
		assert.strictEqual(this.t.getDelay(), 1000);
		assert.strictEqual(this.t.getDisabledForMobile(), true);
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
			this.t = new Tooltip();
		},
		afterEach: function() {
			if (!this.t.bIsDestroyed) {
				this.t.destroy();
			}
		}
	});

	QUnit.test("destroys popover", function(assert) {
		this.t._oPopover = makeFakePopover();
		const p = this.t._oPopover;
		this.t.exit();
		assert.ok(p.bIsDestroyed);
		assert.strictEqual(this.t._oPopover, null);
	});

	QUnit.test("clears open timeout", function(assert) {
		this.t._iOpenTimeout = setTimeout(function(){}, 9999);
		this.t.exit();
		assert.strictEqual(this.t._iOpenTimeout, null);
	});

	QUnit.test("clears close timeout", function(assert) {
		this.t._iCloseTimeout = setTimeout(function(){}, 9999);
		this.t.exit();
		assert.strictEqual(this.t._iCloseTimeout, null);
	});

	QUnit.test("removes from registry", function(assert) {
		Tooltip.registry.add(this.t);
		this.t.exit();
		assert.notOk(Tooltip.registry.has(this.t));
	});

	QUnit.test("safe without popover/timeouts", function(assert) {
		this.t.exit();
		assert.ok(true);
	});

	QUnit.module("getInvisibleTooltipId");

	QUnit.test("id", function(assert) {
		const t = new Tooltip("ttA");
		assert.strictEqual(t.getInvisibleTooltipId(), "ttA-invisibleTooltip");
		t.destroy();
	});

	QUnit.module("_clearTimeouts", {
		beforeEach: function() {
			this.t = new Tooltip();
		},
		afterEach: function() {
			this.t.destroy();
		}
	});

	QUnit.test("clears open", function(assert) {
		this.t._iOpenTimeout = setTimeout(function(){}, 9999);
		this.t._clearTimeouts();
		assert.strictEqual(this.t._iOpenTimeout, null);
	});

	QUnit.test("clears close", function(assert) {
		this.t._iCloseTimeout = setTimeout(function(){}, 9999);
		this.t._clearTimeouts();
		assert.strictEqual(this.t._iCloseTimeout, null);
	});

	QUnit.module("close", {
		beforeEach: function() {
			this.t = new Tooltip({delay:500});
		},
		afterEach: function() {
			this.t.destroy();
		}
	});

	QUnit.test("bFromPress phone early return", function(assert) {
		const oDeviceStub = sinon.stub(Device, "system").value({phone: true, tablet: false, combi: false, desktop: false});
		this.t._oPopover = makeFakePopover();
		const spy = sinon.spy(this.t._oPopover, "close");
		this.t.close(0, true);
		assert.notOk(spy.called);
		spy.restore();
		oDeviceStub.restore();
	});

	QUnit.test("bFromPress tablet early return", function(assert) {
		const oDeviceStub = sinon.stub(Device, "system").value({phone: false, tablet: true, combi: false, desktop: false});
		this.t._oPopover = makeFakePopover();
		const spy = sinon.spy(this.t._oPopover, "close");
		this.t.close(0, true);
		assert.notOk(spy.called);
		spy.restore();
		oDeviceStub.restore();
	});

	QUnit.test("bFromPress desktop proceeds", function(assert) {
		const oDeviceStub = sinon.stub(Device, "system").value({phone: false, tablet: false, combi: false, desktop: true});
		this.t._oPopover = makeFakePopover();
		const spy = sinon.spy(this.t._oPopover, "close");
		this.t.close(0, true);
		assert.ok(spy.calledOnce);
		spy.restore();
		oDeviceStub.restore();
	});

	QUnit.test("bFromPress combi proceeds", function(assert) {
		const oDeviceStub = sinon.stub(Device, "system").value({phone: true, tablet: true, combi: true, desktop: false});
		this.t._oPopover = makeFakePopover();
		const spy = sinon.spy(this.t._oPopover, "close");
		this.t.close(0, true);
		assert.ok(spy.calledOnce);
		spy.restore();
		oDeviceStub.restore();
	});

	QUnit.test("close returns this", function(assert) {
		assert.strictEqual(this.t.close(0), this.t);
	});

	QUnit.test("delayed close actually executes", function(assert) {
		const done = assert.async();
		this.t._oPopover = makeFakePopover();
		const spy = sinon.spy(this.t._oPopover, "close");
		Tooltip.registry.add(this.t);
		this.t._bIsOpen = true;
		this.t.close(50);
		setTimeout(() => {
			assert.ok(spy.calledOnce, "popover.close called after delay");
			assert.strictEqual(this.t._bIsOpen, false, "isOpen false");
			assert.notOk(Tooltip.registry.has(this.t), "removed from registry");
			spy.restore();
			done();
		}, 150);
	});

	QUnit.test("close with default delay", function(assert) {
		this.t.setDelay(50);
		this.t._oPopover = makeFakePopover();
		this.t.close();
		assert.ok(this.t._iCloseTimeout, "uses default delay");
	});

	QUnit.test("bFromPress false on non-touch does not early return", function(assert) {
		this.t._oPopover = makeFakePopover();
		const spy = sinon.spy(this.t._oPopover, "close");
		this.t.close(0, false);
		assert.ok(spy.calledOnce);
		spy.restore();
	});

	QUnit.module("openBy", {
		beforeEach: function() {
			this.t = new Tooltip({text:"PlacementType", delay: 0});
			this.stub = makeStub();
			// Stub _createPopover so openBy never calls real Popover DOM positioning
			this.t._createPopover = function() {
				return Promise.resolve(makeFakePopover());
			};
		},
		afterEach: function() {
			Tooltip.registry.clear();
			this.t._clearTimeouts();
			this.t.destroy();
			removeStub(this.stub);
		}
	});

	QUnit.test("creates popover and opens", async function(assert) {
		const done = assert.async();
		await this.t.openBy(this.stub, 0);
		setTimeout(() => {
			assert.ok(this.t._oPopover, "popover created");
			assert.ok(this.t._bIsOpen, "is open");
			assert.ok(Tooltip.registry.has(this.t), "in registry");
			done();
		}, 100);
	});

	QUnit.test("early return if scheduled", async function(assert) {
		await this.t.openBy(this.stub, 200);
		const t1 = this.t._iOpenTimeout;
		await this.t.openBy(this.stub, 200);
		assert.strictEqual(this.t._iOpenTimeout, t1);
	});

	QUnit.test("registry not empty uses closeAllButCurrent", async function(assert) {
		const o = new Tooltip({text:"o"});
		Tooltip.registry.add(o);
		const spy = sinon.spy(Tooltip, "closeAllButCurrent");
		await this.t.openBy(this.stub, 500);
		assert.ok(spy.calledOnce);
		spy.restore();
		o.destroy();
	});

	QUnit.test("openBy reuses existing popover", async function(assert) {
		const done = assert.async();
		await this.t.openBy(this.stub, 0);
		setTimeout(async () => {
			const p1 = this.t._oPopover;
			this.t._bIsOpen = false;
			this.t._iOpenTimeout = null;
			await this.t.openBy(this.stub, 0);
			setTimeout(() => {
				assert.strictEqual(this.t._oPopover, p1, "same popover reused");
				done();
			}, 100);
		}, 100);
	});

	QUnit.test("openBy default delay", async function(assert) {
		const done = assert.async();
		this.t.setDelay(10);
		await this.t.openBy(this.stub);
		setTimeout(() => {
			assert.ok(this.t._bIsOpen, "opened with default delay");
			done();
		}, 100);
	});

	QUnit.test("close while popover instantiation is in flight aborts the open", function(assert) {
		const done = assert.async();
		// Force _createPopover to a manually-controlled deferred so we can simulate
		// the Tab-storm race: focusin → openBy starts and awaits → focusout → close()
		// → _pPopover finally resolves → resumed openBy must NOT schedule the popup.
		let fnResolvePopover;
		this.t._createPopover = function() {
			return new Promise(function(resolve) { fnResolvePopover = resolve; });
		};

		this.t.openBy(this.stub, 50);
		// At this point openBy is awaiting — _bOpenRequested should be set.
		assert.ok(this.t._bOpenRequested, "openBy marked the open intent before awaiting");

		// Simulate focusout: close() arrives while we are still awaiting.
		this.t.close(0);
		assert.notOk(this.t._bOpenRequested, "close() cleared the open intent");

		// Now resolve _pPopover to let the resumed openBy run.
		fnResolvePopover(makeFakePopover());

		// Give the microtask queue a chance to deliver the resolution.
		setTimeout(() => {
			assert.strictEqual(this.t._iOpenTimeout, null, "resumed openBy did not schedule a timer");
			assert.notOk(this.t._bIsOpen, "tooltip did not open");
			assert.notOk(Tooltip.registry.has(this.t), "tooltip not in the registry");
			done();
		}, 100);
	});

	QUnit.module("Registry", {
		afterEach: function() {
			Tooltip.registry.clear();
		}
	});

	QUnit.test("closeAllButCurrent", function(assert) {
		const t1 = new Tooltip();
		const t2 = new Tooltip();
		const t3 = new Tooltip();
		const s1 = sinon.spy(t1, "close");
		const s2 = sinon.spy(t2, "close");
		const s3 = sinon.spy(t3, "close");
		Tooltip.registry.add(t1);
		Tooltip.registry.add(t2);
		Tooltip.registry.add(t3);
		Tooltip.closeAllButCurrent(t2);
		assert.ok(s1.calledOnce);
		assert.notOk(s2.called);
		assert.ok(s3.calledOnce);
		t1.destroy();
		t2.destroy();
		t3.destroy();
	});

	QUnit.module("_detachEvent", {
		beforeEach: function() {
			this.stub = makeStub();
		},
		afterEach: function() {
			removeStub(this.stub);
		}
	});

	QUnit.test("no domref", function(assert) {
		Tooltip._detachEvent({getDomRef: function() { return null; }});
		assert.ok(true);
	});

	QUnit.test("removes mousedown", function(assert) {
		const d = this.stub.getDomRef();
		d.fnMouseDown = function() {};
		Tooltip._detachEvent(this.stub);
		assert.strictEqual(d.fnMouseDown, null);
	});

	QUnit.test("removes keydown", function(assert) {
		const d = this.stub.getDomRef();
		d.fnKeyDown = function() {};
		Tooltip._detachEvent(this.stub);
		assert.strictEqual(d.fnKeyDown, null);
	});

	QUnit.test("removes contextmenu", function(assert) {
		const d = this.stub.getDomRef();
		d.fnContextMenu = function() {};
		Tooltip._detachEvent(this.stub);
		assert.strictEqual(d.fnContextMenu, null);
	});

	QUnit.test("removes touchstart", function(assert) {
		const d = this.stub.getDomRef();
		d.fnTouchStart = function() {};
		Tooltip._detachEvent(this.stub);
		assert.strictEqual(d.fnTouchStart, null);
	});

	QUnit.test("safe with no handlers", function(assert) {
		Tooltip._detachEvent(this.stub);
		assert.ok(true);
	});

	QUnit.module("attachEvent - desktop", {
		beforeEach: function() {
			this.oDeviceStub = sinon.stub(Device, "system").value({desktop: true, combi: false, phone: false, tablet: false});
			this.tt = new Tooltip({text:"PlacementType", delay: 500});
			this.stub = makeStub(this.tt);
			this.oSpy = sinon.spy();
			this.cSpy = sinon.spy();
		},
		afterEach: function() {
			Tooltip._detachEvent(this.stub);
			this.tt.destroy();
			removeStub(this.stub);
			this.oDeviceStub.restore();
		}
	});

	QUnit.test("mousedown calls close", function(assert) {
		Tooltip.attachEvent(this.stub, this.oSpy, this.cSpy);
		this.stub.getDomRef().dispatchEvent(new MouseEvent("mousedown", {button: 0}));
		assert.ok(this.cSpy.calledWith(0));
	});

	QUnit.test("right mousedown does not call close", function(assert) {
		Tooltip.attachEvent(this.stub, this.oSpy, this.cSpy);
		this.stub.getDomRef().dispatchEvent(new MouseEvent("mousedown", {button: 2}));
		assert.notOk(this.cSpy.called, "right-click mousedown is ignored");
	});

	QUnit.test("mousedown ignored when text is selected", function(assert) {
		// Stub window.getSelection so the mousedown handler sees an active selection
		const oOrig = window.getSelection;
		window.getSelection = function() { return {toString: function() { return "some selected words"; }}; };
		try {
			Tooltip.attachEvent(this.stub, this.oSpy, this.cSpy);
			this.stub.getDomRef().dispatchEvent(new MouseEvent("mousedown", {button: 0}));
			assert.notOk(this.cSpy.called, "left-click mousedown ignored while a selection exists");
		} finally {
			window.getSelection = oOrig;
		}
	});

	QUnit.test("mouseenter calls open", function(assert) {
		Tooltip.attachEvent(this.stub, this.oSpy, this.cSpy);
		this.stub.getDomRef().dispatchEvent(new Event("mouseenter"));
		assert.ok(this.oSpy.calledOnce);
	});

	QUnit.test("mouseleave calls close", function(assert) {
		Tooltip.attachEvent(this.stub, this.oSpy, this.cSpy);
		this.stub.getDomRef().dispatchEvent(new Event("mouseleave"));
		assert.ok(this.cSpy.calledOnce);
	});

	QUnit.test("focusout calls close", function(assert) {
		Tooltip.attachEvent(this.stub, this.oSpy, this.cSpy);
		this.stub.getDomRef().dispatchEvent(new Event("focusout"));
		assert.ok(this.cSpy.calledOnce);
	});

	QUnit.test("Escape closes open tooltip", function(assert) {
		this.tt._bIsOpen = true;
		Tooltip.attachEvent(this.stub, this.oSpy, this.cSpy);
		const ev = new KeyboardEvent("keydown", {key:"Escape", bubbles:true});
		this.stub.getDomRef().dispatchEvent(ev);
		assert.ok(this.cSpy.calledWith(0));
	});

	QUnit.test("Escape does nothing if not open", function(assert) {
		this.tt._bIsOpen = false;
		Tooltip.attachEvent(this.stub, this.oSpy, this.cSpy);
		this.stub.getDomRef().dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
		assert.notOk(this.cSpy.called);
	});

	QUnit.test("no tooltip aggregation uses default delay", function(assert) {
		const stubNoTooltip = makeStub();
		Tooltip.attachEvent(stubNoTooltip, this.oSpy, this.cSpy);
		stubNoTooltip.getDomRef().dispatchEvent(new Event("mouseenter"));
		assert.ok(this.oSpy.calledOnce);
		Tooltip._detachEvent(stubNoTooltip);
		removeStub(stubNoTooltip);
	});

	QUnit.test("focusin opens when focus is visible (keyboard)", function(assert) {
		Tooltip.attachEvent(this.stub, this.oSpy, this.cSpy);
		const d = this.stub.getDomRef();
		const oOrig = d.matches;
		d.matches = function(s) { return s === ":focus-visible" || oOrig.call(d, s); };
		d.dispatchEvent(new Event("focusin"));
		assert.ok(this.oSpy.called, "open called when :focus-visible matches");
		d.matches = oOrig;
	});

	QUnit.test("focusin does not open when focus is not visible", function(assert) {
		Tooltip.attachEvent(this.stub, this.oSpy, this.cSpy);
		const d = this.stub.getDomRef();
		const oOrig = d.matches;
		d.matches = function(s) { return s === ":focus-visible" ? false : oOrig.call(d, s); };
		d.dispatchEvent(new Event("focusin"));
		assert.notOk(this.oSpy.called, "open not called when not :focus-visible");
		d.matches = oOrig;
	});

	QUnit.test("non-escape keydown does nothing", function(assert) {
		this.tt._bIsOpen = true;
		Tooltip.attachEvent(this.stub, this.oSpy, this.cSpy);
		this.stub.getDomRef().dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
		assert.notOk(this.cSpy.called, "close not called for Enter key");
	});

	QUnit.test("Escape with no tooltip aggregation", function(assert) {
		const stubNoTooltip = makeStub();
		const oSpy = sinon.spy();
		const cSpy = sinon.spy();
		Tooltip.attachEvent(stubNoTooltip, oSpy, cSpy);
		stubNoTooltip.getDomRef().dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
		assert.notOk(cSpy.called, "close not called when no tooltip");
		Tooltip._detachEvent(stubNoTooltip);
		removeStub(stubNoTooltip);
	});

	QUnit.module("attachEvent - mobile", {
		beforeEach: function() {
			this.oDeviceStub = sinon.stub(Device, "system").value({desktop: false, combi: false, phone: true, tablet: false});
			this.tt = new Tooltip({text:"PlacementType", disabledForMobile: false});
			this.stub = makeStub(this.tt);
			this.oSpy = sinon.spy();
			this.cSpy = sinon.spy();
		},
		afterEach: function() {
			Tooltip._detachEvent(this.stub);
			this.tt.destroy();
			removeStub(this.stub);
			this.oDeviceStub.restore();
		}
	});

	QUnit.test("contextmenu prevented", function(assert) {
		Tooltip.attachEvent(this.stub, this.oSpy, this.cSpy);
		const ev = new Event("contextmenu", {cancelable: true});
		this.stub.getDomRef().dispatchEvent(ev);
		assert.ok(ev.defaultPrevented);
	});

	QUnit.test("contextmenu not prevented if disabled", function(assert) {
		this.tt.setDisabledForMobile(true);
		Tooltip.attachEvent(this.stub, this.oSpy, this.cSpy);
		const ev = new Event("contextmenu", {cancelable: true});
		this.stub.getDomRef().dispatchEvent(ev);
		assert.notOk(ev.defaultPrevented);
	});

	QUnit.test("iOS webkitTouchCallout none", function(assert) {
		sinon.stub(Device, "os").value({ios: true});
		Tooltip.attachEvent(this.stub, this.oSpy, this.cSpy);
		assert.strictEqual(this.stub.getDomRef().style.webkitTouchCallout, "none");
	});

	QUnit.test("iOS webkitTouchCallout default when disabled", function(assert) {
		sinon.stub(Device, "os").value({ios: true});
		this.tt.setDisabledForMobile(true);
		Tooltip.attachEvent(this.stub, this.oSpy, this.cSpy);
		assert.strictEqual(this.stub.getDomRef().style.webkitTouchCallout, "default");
	});

	QUnit.test("long press opens tooltip on mobile", function(assert) {
		const done = assert.async();
		Tooltip.attachEvent(this.stub, this.oSpy, this.cSpy);
		const dom = this.stub.getDomRef();
		dom.dispatchEvent(new TouchEvent("touchstart", {bubbles: true, touches: [new Touch({identifier: 1, target: dom, pageX: 0, pageY: 0})]}));
		setTimeout(() => {
			assert.ok(this.oSpy.calledOnce, "open called after long press");
			done();
		}, 600);
	});

	QUnit.test("touchend clears long press timer", function(assert) {
		const done = assert.async();
		Tooltip.attachEvent(this.stub, this.oSpy, this.cSpy);
		const dom = this.stub.getDomRef();
		dom.dispatchEvent(new TouchEvent("touchstart", {bubbles: true, touches: [new Touch({identifier: 1, target: dom, pageX: 0, pageY: 0})]}));
		dom.dispatchEvent(new TouchEvent("touchend", {bubbles: true, changedTouches: [new Touch({identifier: 1, target: dom, pageX: 0, pageY: 0, screenX: 0, screenY: 0, clientX: 0, clientY: 0})]}));
		setTimeout(() => {
			assert.notOk(this.oSpy.called, "open not called");
			done();
		}, 600);
	});

	QUnit.test("touchcancel clears timer", function(assert) {
		const done = assert.async();
		Tooltip.attachEvent(this.stub, this.oSpy, this.cSpy);
		const dom = this.stub.getDomRef();
		dom.dispatchEvent(new TouchEvent("touchstart", {bubbles: true, touches: [new Touch({identifier: 1, target: dom, pageX: 0, pageY: 0})]}));
		dom.dispatchEvent(new TouchEvent("touchcancel", {bubbles: true}));
		setTimeout(() => {
			assert.notOk(this.oSpy.called);
			done();
		}, 600);
	});

	QUnit.test("touchmove clears timer", function(assert) {
		const done = assert.async();
		Tooltip.attachEvent(this.stub, this.oSpy, this.cSpy);
		const dom = this.stub.getDomRef();
		dom.dispatchEvent(new TouchEvent("touchstart", {bubbles: true, touches: [new Touch({identifier: 1, target: dom, pageX: 0, pageY: 0})]}));
		dom.dispatchEvent(new TouchEvent("touchmove", {bubbles: true, touches: [new Touch({identifier: 1, target: dom, pageX: 0, pageY: 0, screenX: 0, screenY: 0, clientX: 0, clientY: 0})]}));
		setTimeout(() => {
			assert.notOk(this.oSpy.called);
			done();
		}, 600);
	});

	QUnit.test("long press disabled for mobile does not open", function(assert) {
		const done = assert.async();
		this.tt.setDisabledForMobile(true);
		Tooltip.attachEvent(this.stub, this.oSpy, this.cSpy);
		const dom = this.stub.getDomRef();
		dom.dispatchEvent(new TouchEvent("touchstart", {bubbles: true, touches: [new Touch({identifier: 1, target: dom, pageX: 0, pageY: 0})]}));
		setTimeout(() => {
			assert.notOk(this.oSpy.called);
			done();
		}, 600);
	});

	QUnit.test("links: native context menu is preserved on mobile (disabledForMobile=false ignored)", function(assert) {
		// disabledForMobile is explicitly false, but for <a> elements the tooltip must
		// still leave the native context menu intact per design.
		this.tt.setDisabledForMobile(false);
		const linkStub = makeStub(this.tt, "a");
		Tooltip.attachEvent(linkStub, this.oSpy, this.cSpy);
		const ev = new Event("contextmenu", {cancelable: true});
		linkStub.getDomRef().dispatchEvent(ev);
		assert.notOk(ev.defaultPrevented, "contextmenu not prevented for <a> on mobile");
		Tooltip._detachEvent(linkStub);
		removeStub(linkStub);
	});

	QUnit.test("links: long-press does not open tooltip on mobile (disabledForMobile=false ignored)", function(assert) {
		const done = assert.async();
		this.tt.setDisabledForMobile(false);
		const linkStub = makeStub(this.tt, "a");
		Tooltip.attachEvent(linkStub, this.oSpy, this.cSpy);
		const dom = linkStub.getDomRef();
		dom.dispatchEvent(new TouchEvent("touchstart", {bubbles: true, touches: [new Touch({identifier: 1, target: dom, pageX: 0, pageY: 0})]}));
		setTimeout(() => {
			assert.notOk(this.oSpy.called, "open not called for <a> on mobile long-press");
			Tooltip._detachEvent(linkStub);
			removeStub(linkStub);
			done();
		}, 600);
	});

	QUnit.test("links: iOS webkitTouchCallout stays default (native preview preserved)", function(assert) {
		sinon.stub(Device, "os").value({ios: true});
		this.tt.setDisabledForMobile(false);
		const linkStub = makeStub(this.tt, "a");
		Tooltip.attachEvent(linkStub, this.oSpy, this.cSpy);
		assert.strictEqual(linkStub.getDomRef().style.webkitTouchCallout, "default",
			"webkitTouchCallout left at 'default' for <a> so native preview keeps working");
		Tooltip._detachEvent(linkStub);
		removeStub(linkStub);
	});

	QUnit.module("attachEvent detach first", {
		beforeEach: function() {
			this.oDeviceStub = sinon.stub(Device, "system").value({desktop: true, combi: false, phone: false, tablet: false});
			this.tt = new Tooltip({text:"PlacementType"});
			this.stub = makeStub(this.tt);
		},
		afterEach: function() {
			Tooltip._detachEvent(this.stub);
			this.tt.destroy();
			removeStub(this.stub);
			this.oDeviceStub.restore();
		}
	});

	QUnit.test("attachEvent calls _detachEvent first", function(assert) {
		const spy = sinon.spy(Tooltip, "_detachEvent");
		Tooltip.attachEvent(this.stub, function(){}, function(){});
		assert.ok(spy.calledOnce);
		spy.restore();
	});

	QUnit.module("attachEvent - combi device", {
		beforeEach: function() {
			this.oDeviceStub = sinon.stub(Device, "system").value({desktop: false, combi: true, phone: false, tablet: true});
			this.tt = new Tooltip({text:"PlacementType", delay: 100});
			this.stub = makeStub(this.tt);
			this.oSpy = sinon.spy();
			this.cSpy = sinon.spy();
		},
		afterEach: function() {
			Tooltip._detachEvent(this.stub);
			this.tt.destroy();
			removeStub(this.stub);
			this.oDeviceStub.restore();
		}
	});

	QUnit.test("combi device gets desktop events", function(assert) {
		Tooltip.attachEvent(this.stub, this.oSpy, this.cSpy);
		this.stub.getDomRef().dispatchEvent(new Event("mouseenter"));
		assert.ok(this.oSpy.calledOnce, "mouseenter works on combi");
		this.stub.getDomRef().dispatchEvent(new Event("focusout"));
		assert.ok(this.cSpy.calledOnce, "focusout works on combi");
	});

	QUnit.test("combi device does not get mobile-only events", function(assert) {
		Tooltip.attachEvent(this.stub, this.oSpy, this.cSpy);
		const ev = new Event("contextmenu", {cancelable: true});
		this.stub.getDomRef().dispatchEvent(ev);
		assert.notOk(ev.defaultPrevented, "contextmenu not prevented on combi");
	});

	QUnit.module("attachEvent - tablet only", {
		beforeEach: function() {
			this.oDeviceStub = sinon.stub(Device, "system").value({desktop: false, combi: false, phone: false, tablet: true});
			this.tt = new Tooltip({text:"PlacementType", disabledForMobile: false});
			this.stub = makeStub(this.tt);
			this.oSpy = sinon.spy();
			this.cSpy = sinon.spy();
		},
		afterEach: function() {
			Tooltip._detachEvent(this.stub);
			this.tt.destroy();
			removeStub(this.stub);
			this.oDeviceStub.restore();
		}
	});

	QUnit.test("tablet gets mobile events", function(assert) {
		Tooltip.attachEvent(this.stub, this.oSpy, this.cSpy);
		const ev = new Event("contextmenu", {cancelable: true});
		this.stub.getDomRef().dispatchEvent(ev);
		assert.ok(ev.defaultPrevented, "contextmenu prevented on tablet");
	});

	QUnit.module("attachEvent - no getAggregation", {
		beforeEach: function() {
			this.oDeviceStub = sinon.stub(Device, "system").value({desktop: true, combi: false, phone: false, tablet: false});
			this.stub = makeStub(); // no getAggregation at all
			this.oSpy = sinon.spy();
			this.cSpy = sinon.spy();
		},
		afterEach: function() {
			removeStub(this.stub);
			this.oDeviceStub.restore();
		}
	});

	QUnit.test("control without getAggregation uses 500ms default", function(assert) {
		Tooltip.attachEvent(this.stub, this.oSpy, this.cSpy);
		this.stub.getDomRef().dispatchEvent(new Event("mouseenter"));
		assert.ok(this.oSpy.calledOnce, "open called");
	});

	QUnit.module("keyboard focus detector");

	QUnit.test("modifier keys are ignored by keyboard detector", function(assert) {
		document.dispatchEvent(new KeyboardEvent("keydown", {key:"Tab", shiftKey:true, bubbles:true}));
		document.dispatchEvent(new KeyboardEvent("keydown", {key:"Tab", ctrlKey:true, bubbles:true}));
		document.dispatchEvent(new KeyboardEvent("keydown", {key:"Tab", altKey:true, bubbles:true}));
		document.dispatchEvent(new KeyboardEvent("keydown", {key:"Tab", metaKey:true, bubbles:true}));
		assert.ok(true, "modifier key events dispatched without error");
	});

	QUnit.test("non-focus keys are ignored", function(assert) {
		document.dispatchEvent(new KeyboardEvent("keydown", {key:"a", bubbles:true}));
		document.dispatchEvent(new KeyboardEvent("keydown", {key:"Enter", bubbles:true}));
		document.dispatchEvent(new KeyboardEvent("keydown", {key:"Space", bubbles:true}));
		assert.ok(true, "non-focus key events dispatched without error");
	});

	QUnit.test("ArrowUp triggers keyboard detection", function(assert) {
		document.dispatchEvent(new KeyboardEvent("keydown", {key:"ArrowUp", bubbles:true}));
		assert.ok(true, "ArrowUp dispatched");
	});

	QUnit.test("ArrowDown triggers keyboard detection", function(assert) {
		document.dispatchEvent(new KeyboardEvent("keydown", {key:"ArrowDown", bubbles:true}));
		assert.ok(true, "ArrowDown dispatched");
	});

	QUnit.test("ArrowLeft triggers keyboard detection", function(assert) {
		document.dispatchEvent(new KeyboardEvent("keydown", {key:"ArrowLeft", bubbles:true}));
		assert.ok(true, "ArrowLeft dispatched");
	});

	QUnit.test("ArrowRight triggers keyboard detection", function(assert) {
		document.dispatchEvent(new KeyboardEvent("keydown", {key:"ArrowRight", bubbles:true}));
		assert.ok(true, "ArrowRight dispatched");
	});

	QUnit.module("_createPopover content", {
		beforeEach: function() {
			this.t = new Tooltip({text:"Hello"});
		},
		afterEach: function() {
			if (this.pp && !this.pp.bIsDestroyed) {
				this.pp.destroy();
			}
			this.t.destroy();
		}
	});

	QUnit.test("popover has Text content", async function(assert) {
		this.pp = await this.t._createPopover();
		const content = this.pp.getContent();
		assert.strictEqual(content.length, 1, "one content item");
		assert.ok(content[0].setText, "content has setText method");
	});

	QUnit.test("popover modal is false", async function(assert) {
		this.pp = await this.t._createPopover();
		assert.strictEqual(this.pp.getModal(), false, "not modal");
	});

	QUnit.test("popover has event delegate", async function(assert) {
		this.pp = await this.t._createPopover();
		assert.ok(this.pp.aDelegates && this.pp.aDelegates.length > 0, "has delegates");
	});

	QUnit.module("close edge cases", {
		beforeEach: function() {
			this.t = new Tooltip({delay:500});
		},
		afterEach: function() {
			this.t._clearTimeouts();
			if (this.t._oPopover && !this.t._oPopover.bIsDestroyed) {
				this.t._oPopover.destroy();
			}
			this.t.destroy();
			Tooltip.registry.clear();
		}
	});

	QUnit.test("close with bFromPress=true on non-mobile desktop", function(assert) {
		const oDeviceStub = sinon.stub(Device, "system").value({phone: false, tablet: false, combi: true, desktop: false});
		this.t._oPopover = makeFakePopover();
		const spy = sinon.spy(this.t._oPopover, "close");
		this.t.close(0, true);
		assert.ok(spy.calledOnce, "close proceeds on combi+desktop");
		spy.restore();
		oDeviceStub.restore();
	});

	QUnit.test("immediate close removes from registry even without popover", function(assert) {
		Tooltip.registry.add(this.t);
		this.t.close(0);
		assert.notOk(Tooltip.registry.has(this.t), "removed from registry");
	});

	QUnit.test("close calls _clearTimeouts before scheduling", function(assert) {
		const spy = sinon.spy(this.t, "_clearTimeouts");
		this.t.close(100);
		assert.ok(spy.calledOnce, "_clearTimeouts called");
		spy.restore();
	});

	QUnit.test("close with no popover does not throw", function(assert) {
		Tooltip.registry.add(this.t);
		this.t.close(0);
		assert.notOk(Tooltip.registry.has(this.t));
	});

	QUnit.module("openBy - internal behaviour", {
		beforeEach: function() {
			this.t = new Tooltip({text: "Hello", delay: 0});
			this.stub = makeStub();
			this.fakePopover = makeFakePopover();
			this.t._createPopover = () => Promise.resolve(this.fakePopover);
		},
		afterEach: function() {
			Tooltip.registry.clear();
			this.t._clearTimeouts();
			this.t.destroy();
			removeStub(this.stub);
		}
	});

	QUnit.test("openBy sets text on popover content", async function(assert) {
		const done = assert.async();
		const spy = sinon.spy(this.fakePopover.getContent()[0], "setText");
		await this.t.openBy(this.stub, 0);
		setTimeout(function() {
			assert.ok(spy.calledWith("Hello"), "setText called with tooltip text");
			done();
		}, 50);
	});

	QUnit.test("openBy calls setPlacement on popover", async function(assert) {
		const done = assert.async();
		const spy = sinon.spy(this.fakePopover, "setPlacement");
		await this.t.openBy(this.stub, 0);
		setTimeout(function() {
			assert.ok(spy.calledOnce, "setPlacement called");
			done();
		}, 50);
	});

	QUnit.test("openBy calls openBy on popover", async function(assert) {
		const done = assert.async();
		const spy = sinon.spy(this.fakePopover, "openBy");
		await this.t.openBy(this.stub, 0);
		setTimeout(function() {
			assert.ok(spy.calledOnce, "popover.openBy called");
			done();
		}, 50);
	});

	QUnit.test("openBy with other tooltips open uses 200ms shortcut delay", async function(assert) {
		const done = assert.async();
		const other = new Tooltip();
		Tooltip.registry.add(other);
		const spy = sinon.spy(this.fakePopover, "openBy");
		await this.t.openBy(this.stub, 500);
		// at 100ms the shortcut delay (200ms) has not fired yet
		setTimeout(function() {
			assert.notOk(spy.called, "not opened yet at 100ms");
		}, 100);
		// at 300ms the 200ms shortcut delay should have fired
		setTimeout(function() {
			assert.ok(spy.calledOnce, "opened after 200ms shortcut delay");
			other.destroy();
			done();
		}, 300);
	});

	QUnit.module("_popoverAfterRendering", {
		beforeEach: function() {
			this.t = new Tooltip({text: "T"});
			// Build a real DOM node to act as the popover's domRef
			this.popoverDiv = document.createElement("div");
			document.getElementById("content").appendChild(this.popoverDiv);
			this.fakePopover = makeFakePopover();
			this.fakePopover.getDomRef = () => this.popoverDiv;
			this.t._oPopover = this.fakePopover;
		},
		afterEach: function() {
			if (this.popoverDiv.parentNode) {
				this.popoverDiv.parentNode.removeChild(this.popoverDiv);
			}
			this.t.destroy();
		}
	});

	QUnit.test("adds sapMTooltipBottom class when placement is Bottom", function(assert) {
		this.fakePopover._getCalculatedPlacement = function() { return "Bottom"; };
		this.t._popoverAfterRendering();
		assert.ok(this.popoverDiv.classList.contains("sapMTooltipBottom"));
		assert.notOk(this.popoverDiv.classList.contains("sapMTooltipTop"));
	});

	QUnit.test("adds sapMTooltipTop class when placement is Top", function(assert) {
		this.fakePopover._getCalculatedPlacement = function() { return "Top"; };
		this.t._popoverAfterRendering();
		assert.ok(this.popoverDiv.classList.contains("sapMTooltipTop"));
	});

	QUnit.test("adds sapMTooltipLeft class when placement is Left", function(assert) {
		this.fakePopover._getCalculatedPlacement = function() { return "Left"; };
		this.t._popoverAfterRendering();
		assert.ok(this.popoverDiv.classList.contains("sapMTooltipLeft"));
	});

	QUnit.test("adds sapMTooltipRight class when placement is Right", function(assert) {
		this.fakePopover._getCalculatedPlacement = function() { return "Right"; };
		this.t._popoverAfterRendering();
		assert.ok(this.popoverDiv.classList.contains("sapMTooltipRight"));
	});

	QUnit.test("removes stale placement class before adding new one", function(assert) {
		this.popoverDiv.classList.add("sapMTooltipTop");
		this.fakePopover._getCalculatedPlacement = function() { return "Bottom"; };
		this.t._popoverAfterRendering();
		assert.notOk(this.popoverDiv.classList.contains("sapMTooltipTop"), "old class removed");
		assert.ok(this.popoverDiv.classList.contains("sapMTooltipBottom"), "new class added");
	});

	QUnit.test("no class added for unknown placement", function(assert) {
		this.fakePopover._getCalculatedPlacement = function() { return "Unknown"; };
		this.t._popoverAfterRendering();
		assert.notOk(this.popoverDiv.classList.contains("sapMTooltipTop"));
		assert.notOk(this.popoverDiv.classList.contains("sapMTooltipBottom"));
	});

	QUnit.test("mouseenter on popover cancels pending close timeout", function(assert) {
		this.fakePopover._getCalculatedPlacement = function() { return "Bottom"; };
		this.t._popoverAfterRendering();
		this.t._iCloseTimeout = setTimeout(function() {}, 9999);
		this.popoverDiv.dispatchEvent(new Event("mouseenter"));
		assert.strictEqual(this.t._iCloseTimeout, null, "close timeout cleared");
		assert.ok(this.t._bIsMouseOver, "_bIsMouseOver set");
	});

	QUnit.test("mouseleave on popover triggers close when tooltip is open", function(assert) {
		this.fakePopover._getCalculatedPlacement = function() { return "Bottom"; };
		this.t._popoverAfterRendering();
		this.t._bIsOpen = true;
		const spy = sinon.spy(this.t, "close");
		this.popoverDiv.dispatchEvent(new Event("mouseleave"));
		assert.ok(spy.calledOnce, "close called on mouseleave");
		assert.notOk(this.t._bIsMouseOver, "_bIsMouseOver cleared");
		spy.restore();
	});

	QUnit.test("mouseleave on popover does not call close when not open", function(assert) {
		this.fakePopover._getCalculatedPlacement = function() { return "Bottom"; };
		this.t._popoverAfterRendering();
		this.t._bIsOpen = false;
		const spy = sinon.spy(this.t, "close");
		this.popoverDiv.dispatchEvent(new Event("mouseleave"));
		assert.notOk(spy.called, "close not called when not open");
		spy.restore();
	});

	QUnit.module("_createPopover configuration", {
		beforeEach: function() {
			this.t = new Tooltip({text: "Hi", placement: PlacementType.Top});
		},
		afterEach: function() {
			if (this.pp && !this.pp.bIsDestroyed) {
				this.pp.destroy();
			}
			this.t.destroy();
		}
	});

	QUnit.test("popover has sapMTooltip style class", async function(assert) {
		this.pp = await this.t._createPopover();
		assert.ok(this.pp.hasStyleClass("sapMTooltip"), "sapMTooltip class present");
	});

	QUnit.test("popover _restoreFocus is a no-op", async function(assert) {
		this.pp = await this.t._createPopover();
		const focused = document.activeElement;
		this.pp._restoreFocus();
		assert.strictEqual(document.activeElement, focused, "focus not restored");
	});

	QUnit.test("popover _getInitialFocusId returns null", async function(assert) {
		this.pp = await this.t._createPopover();
		assert.strictEqual(this.pp._getInitialFocusId(), null);
	});

	QUnit.test("popover.close() nulls _oPreviousFocus to skip Popover's focus-restore path", async function(assert) {
		this.pp = await this.t._createPopover();
		// Simulate the state Popover.openBy leaves behind: a captured "previous focus"
		// that Popover.close would otherwise hand to Popup.applyFocusInfo, yanking
		// keyboard focus back to the previously-tooltipped control.
		this.pp._oPreviousFocus = {sFocusId: "btn-A", oFocusedElement: null};
		this.pp.close();
		assert.strictEqual(this.pp._oPreviousFocus, null,
			"override clears _oPreviousFocus so the focus-restore path is skipped");
	});

	QUnit.test("popover afterClose calls _clearTimeouts", async function(assert) {
		this.pp = await this.t._createPopover();
		const spy = sinon.spy(this.t, "_clearTimeouts");
		// Trigger afterClose by firing the event directly
		this.pp.fireAfterClose();
		assert.ok(spy.calledOnce, "_clearTimeouts called on afterClose");
		spy.restore();
	});

	QUnit.module("Placement class on Popover DOM", {
		beforeEach: async function() {
			// Center the anchor so every strict side (Top/Bottom/Left/Right) has
			// room and the auto-flip fallback never kicks in.
			this.oButton = new Button({text: "Anchor"});
			this.oButton.placeAt("content");
			await nextUIUpdate();
			Object.assign(this.oButton.getDomRef().style, {
				position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)"
			});
		},
		afterEach: function() {
			this.oButton.destroy();
		}
	});

	async function openAndWait(oTooltip, oAnchor) {
		await oTooltip.openBy(oAnchor);
		await new Promise((r) => { oTooltip._oPopover.attachEventOnce("afterOpen", r); });
	}

	[
		{placement: PlacementType.Top, expected: "sapMTooltipTop"},
		{placement: PlacementType.Bottom, expected: "sapMTooltipBottom"},
		{placement: PlacementType.Left, expected: "sapMTooltipLeft"},
		{placement: PlacementType.Right, expected: "sapMTooltipRight"}
	].forEach(function(oCase) {
		QUnit.test("placement " + oCase.placement + " → " + oCase.expected, async function(assert) {
			this.t = new Tooltip({text: "Hi", placement: oCase.placement, delay: 0});
			await openAndWait(this.t, this.oButton);

			const oCl = this.t._oPopover.getDomRef().classList;
			["Top", "Bottom", "Left", "Right"].forEach(function(s) {
				const sCls = "sapMTooltip" + s;
				assert[sCls === oCase.expected ? "ok" : "notOk"](oCl.contains(sCls), sCls);
			});
		});
	});

	QUnit.test("strict Top is promoted to VerticalPreferredTop on the Popover", async function(assert) {
		this.t = new Tooltip({text: "Hi", placement: PlacementType.Top, delay: 0});
		this.t._oPopover = await this.t._createPopover();
		const oSpy = sinon.spy(this.t._oPopover, "setPlacement");

		await openAndWait(this.t, this.oButton);

		assert.ok(oSpy.calledWith(PlacementType.VerticalPreferredTop),
			"Popover.setPlacement called with the promoted preferred variant");
		oSpy.restore();
		this.t.destroy();
	});
});
