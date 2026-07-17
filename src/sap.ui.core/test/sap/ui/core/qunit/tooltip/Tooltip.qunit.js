/*global QUnit, sinon */
sap.ui.define([
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/test/utils/nextUIUpdate",
	"sap/ui/core/tooltip/Tooltip",
	"sap/m/Button",
	"sap/m/library",
	"sap/ui/Device",
	"sap/ui/core/tooltip/TooltipManager"
], function(createAndAppendDiv, nextUIUpdate, Tooltip, Button, mLibrary, Device, TooltipManager) {
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

	QUnit.test("destroys popover", function(assert) {
		this.oTooltip._oPopover = makeFakePopover();
		const p = this.oTooltip._oPopover;
		this.oTooltip.exit();
		assert.ok(p.bIsDestroyed);
		assert.strictEqual(this.oTooltip._oPopover, null);
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

	QUnit.test("safe without popover/timeouts", function(assert) {
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
		this.oTooltip._oPopover = makeFakePopover();
		const spy = sinon.spy(this.oTooltip._oPopover, "close");
		this.oTooltip.close(0, true);
		assert.notOk(spy.called);
		spy.restore();
		oDeviceStub.restore();
	});

	QUnit.test("bFromPress tablet early return", function(assert) {
		const oDeviceStub = sinon.stub(Device, "system").value({phone: false, tablet: true, combi: false, desktop: false});
		this.oTooltip._oPopover = makeFakePopover();
		const spy = sinon.spy(this.oTooltip._oPopover, "close");
		this.oTooltip.close(0, true);
		assert.notOk(spy.called);
		spy.restore();
		oDeviceStub.restore();
	});

	QUnit.test("bFromPress desktop proceeds", function(assert) {
		const oDeviceStub = sinon.stub(Device, "system").value({phone: false, tablet: false, combi: false, desktop: true});
		this.oTooltip._oPopover = makeFakePopover();
		const spy = sinon.spy(this.oTooltip._oPopover, "close");
		this.oTooltip.close(0, true);
		assert.ok(spy.calledOnce);
		spy.restore();
		oDeviceStub.restore();
	});

	QUnit.test("bFromPress combi proceeds", function(assert) {
		const oDeviceStub = sinon.stub(Device, "system").value({phone: true, tablet: true, combi: true, desktop: false});
		this.oTooltip._oPopover = makeFakePopover();
		const spy = sinon.spy(this.oTooltip._oPopover, "close");
		this.oTooltip.close(0, true);
		assert.ok(spy.calledOnce);
		spy.restore();
		oDeviceStub.restore();
	});

	QUnit.test("close returns this", function(assert) {
		assert.strictEqual(this.oTooltip.close(0), this.oTooltip);
	});

	QUnit.test("delayed close actually executes", function(assert) {
		const done = assert.async();
		this.oTooltip._oPopover = makeFakePopover();
		const spy = sinon.spy(this.oTooltip._oPopover, "close");
		this.oTooltip._bIsOpen = true;
		this.oTooltip.close(50);
		setTimeout(() => {
			assert.ok(spy.calledOnce, "popover.close called after delay");
			assert.strictEqual(this.oTooltip._bIsOpen, false, "isOpen false");
			spy.restore();
			done();
		}, 150);
	});

	QUnit.test("close with default delay", function(assert) {
		this.oTooltip.setDelay(50);
		this.oTooltip._oPopover = makeFakePopover();
		this.oTooltip.close();
		assert.ok(this.oTooltip._iCloseTimeout, "uses default delay");
	});

	QUnit.test("bFromPress false on non-touch does not early return", function(assert) {
		this.oTooltip._oPopover = makeFakePopover();
		const spy = sinon.spy(this.oTooltip._oPopover, "close");
		this.oTooltip.close(0, false);
		assert.ok(spy.calledOnce);
		spy.restore();
	});

	QUnit.module("openBy", {
		beforeEach: function() {
			this.oTooltip = new Tooltip({text:"PlacementType", delay: 0});
			this.stub = makeStub();
			// Stub _createPopover so openBy never calls real Popover DOM positioning
			this.oTooltip._createPopover = function() {
				return Promise.resolve(makeFakePopover());
			};
		},
		afterEach: function() {
			this.oTooltip._clearTimeouts();
			this.oTooltip.destroy();
			removeStub(this.stub);
		}
	});

	QUnit.test("creates popover and opens", async function(assert) {
		const done = assert.async();
		await this.oTooltip.openBy(this.stub, 0);
		setTimeout(() => {
			assert.ok(this.oTooltip._oPopover, "popover created");
			assert.ok(this.oTooltip._bIsOpen, "is open");
			done();
		}, 100);
	});

	QUnit.test("early return if scheduled", async function(assert) {
		await this.oTooltip.openBy(this.stub, 200);
		const t1 = this.oTooltip._iOpenTimeout;
		await this.oTooltip.openBy(this.stub, 200);
		assert.strictEqual(this.oTooltip._iOpenTimeout, t1);
	});

	QUnit.test("openBy reuses existing popover", async function(assert) {
		const done = assert.async();
		await this.oTooltip.openBy(this.stub, 0);
		setTimeout(async () => {
			const p1 = this.oTooltip._oPopover;
			this.oTooltip._bIsOpen = false;
			this.oTooltip._iOpenTimeout = null;
			await this.oTooltip.openBy(this.stub, 0);
			setTimeout(() => {
				assert.strictEqual(this.oTooltip._oPopover, p1, "same popover reused");
				done();
			}, 100);
		}, 100);
	});

	QUnit.test("openBy default delay", async function(assert) {
		const done = assert.async();
		this.oTooltip.setDelay(10);
		await this.oTooltip.openBy(this.stub);
		setTimeout(() => {
			assert.ok(this.oTooltip._bIsOpen, "opened with default delay");
			done();
		}, 100);
	});

	QUnit.test("close while popover instantiation is in flight aborts the open", function(assert) {
		const done = assert.async();
		// Force _createPopover to a manually-controlled deferred so we can simulate
		// the Tab-storm race: focusin → openBy starts and awaits → focusout → close()
		// → _pPopover finally resolves → resumed openBy must NOT schedule the popup.
		let fnResolvePopover;
		this.oTooltip._createPopover = function() {
			return new Promise(function(resolve) { fnResolvePopover = resolve; });
		};

		this.oTooltip.openBy(this.stub, 50);
		// At this point openBy is awaiting — _bOpenRequested should be set.
		assert.ok(this.oTooltip._bOpenRequested, "openBy marked the open intent before awaiting");

		// Simulate focusout: close() arrives while we are still awaiting.
		this.oTooltip.close(0);
		assert.notOk(this.oTooltip._bOpenRequested, "close() cleared the open intent");

		// Now resolve _pPopover to let the resumed openBy run.
		fnResolvePopover(makeFakePopover());

		// Give the microtask queue a chance to deliver the resolution.
		setTimeout(() => {
			assert.notOk(this.oTooltip._iOpenTimeout, "resumed openBy did not schedule a timer");
			assert.notOk(this.oTooltip._bIsOpen, "tooltip did not open");
			done();
		}, 100);
	});

	QUnit.test("openBy cancels a pending close so focusin overrides focusout", async function(assert) {
		const done = assert.async();
		// Tooltip already open.
		await this.oTooltip.openBy(this.stub, 0);
		setTimeout(async () => {
			assert.ok(this.oTooltip._bIsOpen, "tooltip open");

			// focusout schedules a delayed close.
			this.oTooltip.close(500);
			assert.ok(this.oTooltip._iCloseTimeout, "close scheduled");

			// focusin re-opens before the close fires.
			await this.oTooltip.openBy(this.stub, 0);
			assert.strictEqual(this.oTooltip._iCloseTimeout, null, "pending close cancelled");

			// After the close delay, the tooltip must remain open.
			setTimeout(() => {
				assert.ok(this.oTooltip._bIsOpen, "tooltip stayed open");
				done();
			}, 600);
		}, 50);
	});

	QUnit.module("_createPopover content", {
		beforeEach: function() {
			this.oTooltip = new Tooltip({text:"Hello"});
		},
		afterEach: function() {
			if (this.oPopover && !this.oPopover.bIsDestroyed) {
				this.oPopover.destroy();
			}
			this.oTooltip.destroy();
		}
	});

	QUnit.test("popover has Text content", async function(assert) {
		this.oPopover = await this.oTooltip._createPopover();
		const content = this.oPopover.getContent();
		assert.strictEqual(content.length, 1, "one content item");
		assert.ok(content[0].setText, "content has setText method");
	});

	QUnit.test("popover modal is false", async function(assert) {
		this.oPopover = await this.oTooltip._createPopover();
		assert.strictEqual(this.oPopover.getModal(), false, "not modal");
	});

	QUnit.test("popover has event delegate", async function(assert) {
		this.oPopover = await this.oTooltip._createPopover();
		assert.ok(this.oPopover.aDelegates && this.oPopover.aDelegates.length > 0, "has delegates");
	});

	QUnit.module("close edge cases", {
		beforeEach: function() {
			this.oTooltip = new Tooltip({delay:500});
		},
		afterEach: function() {
			this.oTooltip._clearTimeouts();
			if (this.oTooltip._oPopover && !this.oTooltip._oPopover.bIsDestroyed) {
				this.oTooltip._oPopover.destroy();
			}
			this.oTooltip.destroy();
		}
	});

	QUnit.test("close with bFromPress=true on non-mobile desktop", function(assert) {
		const oDeviceStub = sinon.stub(Device, "system").value({phone: false, tablet: false, combi: true, desktop: false});
		this.oTooltip._oPopover = makeFakePopover();
		const spy = sinon.spy(this.oTooltip._oPopover, "close");
		this.oTooltip.close(0, true);
		assert.ok(spy.calledOnce, "close proceeds on combi+desktop");
		spy.restore();
		oDeviceStub.restore();
	});

	QUnit.test("close calls _clearTimeouts before scheduling", function(assert) {
		const spy = sinon.spy(this.oTooltip, "_clearTimeouts");
		this.oTooltip.close(100);
		assert.ok(spy.calledOnce, "_clearTimeouts called");
		spy.restore();
	});

	QUnit.test("close with no popover does not throw", function(assert) {
		this.oTooltip.close(0);
		assert.ok(true, "no throw");
	});

	QUnit.module("openBy - internal behaviour", {
		beforeEach: function() {
			this.oTooltip = new Tooltip({text: "Hello", delay: 0});
			this.stub = makeStub();
			this.oFakePopover = makeFakePopover();
			this.oTooltip._createPopover = () => Promise.resolve(this.oFakePopover);
		},
		afterEach: function() {
			this.oTooltip._clearTimeouts();
			this.oTooltip.destroy();
			removeStub(this.stub);
		}
	});

	QUnit.test("openBy sets text on popover content", async function(assert) {
		const done = assert.async();
		const spy = sinon.spy(this.oFakePopover.getContent()[0], "setText");
		await this.oTooltip.openBy(this.stub, 0);
		setTimeout(function() {
			assert.ok(spy.calledWith("Hello"), "setText called with tooltip text");
			done();
		}, 50);
	});

	QUnit.test("openBy calls setPlacement on popover", async function(assert) {
		const done = assert.async();
		const spy = sinon.spy(this.oFakePopover, "setPlacement");
		await this.oTooltip.openBy(this.stub, 0);
		setTimeout(function() {
			assert.ok(spy.calledOnce, "setPlacement called");
			done();
		}, 50);
	});

	QUnit.test("openBy calls openBy on popover", async function(assert) {
		const done = assert.async();
		const spy = sinon.spy(this.oFakePopover, "openBy");
		await this.oTooltip.openBy(this.stub, 0);
		setTimeout(function() {
			assert.ok(spy.calledOnce, "popover.openBy called");
			done();
		}, 50);
	});

	QUnit.module("_popoverAfterRendering", {
		beforeEach: function() {
			this.oTooltip = new Tooltip({text: "T"});
			// Build a real DOM node to act as the popover's domRef
			this.oPopoverDiv = document.createElement("div");
			document.getElementById("content").appendChild(this.oPopoverDiv);
			this.oFakePopover = makeFakePopover();
			this.oFakePopover.getDomRef = () => this.oPopoverDiv;
			this.oTooltip._oPopover = this.oFakePopover;
		},
		afterEach: function() {
			if (this.oPopoverDiv.parentNode) {
				this.oPopoverDiv.parentNode.removeChild(this.oPopoverDiv);
			}
			this.oTooltip.destroy();
		}
	});

	QUnit.test("adds sapUiCoreTooltipBottom class when placement is Bottom", function(assert) {
		this.oFakePopover._getCalculatedPlacement = function() { return "Bottom"; };
		this.oTooltip._popoverAfterRendering();
		assert.ok(this.oPopoverDiv.classList.contains("sapUiCoreTooltipBottom"));
		assert.notOk(this.oPopoverDiv.classList.contains("sapUiCoreTooltipTop"));
	});

	QUnit.test("adds sapUiCoreTooltipTop class when placement is Top", function(assert) {
		this.oFakePopover._getCalculatedPlacement = function() { return "Top"; };
		this.oTooltip._popoverAfterRendering();
		assert.ok(this.oPopoverDiv.classList.contains("sapUiCoreTooltipTop"));
	});

	QUnit.test("adds sapUiCoreTooltipLeft class when placement is Left", function(assert) {
		this.oFakePopover._getCalculatedPlacement = function() { return "Left"; };
		this.oTooltip._popoverAfterRendering();
		assert.ok(this.oPopoverDiv.classList.contains("sapUiCoreTooltipLeft"));
	});

	QUnit.test("adds sapUiCoreTooltipRight class when placement is Right", function(assert) {
		this.oFakePopover._getCalculatedPlacement = function() { return "Right"; };
		this.oTooltip._popoverAfterRendering();
		assert.ok(this.oPopoverDiv.classList.contains("sapUiCoreTooltipRight"));
	});

	QUnit.test("removes stale placement class before adding new one", function(assert) {
		this.oPopoverDiv.classList.add("sapUiCoreTooltipTop");
		this.oFakePopover._getCalculatedPlacement = function() { return "Bottom"; };
		this.oTooltip._popoverAfterRendering();
		assert.notOk(this.oPopoverDiv.classList.contains("sapUiCoreTooltipTop"), "old class removed");
		assert.ok(this.oPopoverDiv.classList.contains("sapUiCoreTooltipBottom"), "new class added");
	});

	QUnit.test("no class added for unknown placement", function(assert) {
		this.oFakePopover._getCalculatedPlacement = function() { return "Unknown"; };
		this.oTooltip._popoverAfterRendering();
		assert.notOk(this.oPopoverDiv.classList.contains("sapUiCoreTooltipTop"));
		assert.notOk(this.oPopoverDiv.classList.contains("sapUiCoreTooltipBottom"));
	});

	QUnit.test("mouseenter on popover cancels pending close timeout", function(assert) {
		this.oFakePopover._getCalculatedPlacement = function() { return "Bottom"; };
		this.oTooltip._popoverAfterRendering();
		this.oTooltip._iCloseTimeout = setTimeout(function() {}, 9999);
		this.oPopoverDiv.dispatchEvent(new Event("mouseenter"));
		assert.strictEqual(this.oTooltip._iCloseTimeout, null, "close timeout cleared");
	});

	QUnit.test("mouseleave on popover triggers close when tooltip is open", function(assert) {
		this.oFakePopover._getCalculatedPlacement = function() { return "Bottom"; };
		this.oTooltip._popoverAfterRendering();
		this.oTooltip._bIsOpen = true;
		const spy = sinon.spy(this.oTooltip, "close");
		this.oPopoverDiv.dispatchEvent(new Event("mouseleave"));
		assert.ok(spy.calledOnce, "close called on mouseleave");
		spy.restore();
	});

	QUnit.test("mouseleave on popover does not call close when not open", function(assert) {
		this.oFakePopover._getCalculatedPlacement = function() { return "Bottom"; };
		this.oTooltip._popoverAfterRendering();
		this.oTooltip._bIsOpen = false;
		const spy = sinon.spy(this.oTooltip, "close");
		this.oPopoverDiv.dispatchEvent(new Event("mouseleave"));
		assert.notOk(spy.called, "close not called when not open");
		spy.restore();
	});

	QUnit.module("_createPopover configuration", {
		beforeEach: function() {
			this.oTooltip = new Tooltip({text: "Hi", placement: PlacementType.Top});
		},
		afterEach: function() {
			if (this.oPopover && !this.oPopover.bIsDestroyed) {
				this.oPopover.destroy();
			}
			this.oTooltip.destroy();
		}
	});

	QUnit.test("popover has sapUiCoreTooltip style class", async function(assert) {
		this.oPopover = await this.oTooltip._createPopover();
		assert.ok(this.oPopover.hasStyleClass("sapUiCoreTooltip"), "sapUiCoreTooltip class present");
	});

	QUnit.test("popover _restoreFocus is a no-op", async function(assert) {
		this.oPopover = await this.oTooltip._createPopover();
		const focused = document.activeElement;
		this.oPopover._restoreFocus();
		assert.strictEqual(document.activeElement, focused, "focus not restored");
	});

	QUnit.test("popover _getInitialFocusId returns null", async function(assert) {
		this.oPopover = await this.oTooltip._createPopover();
		assert.strictEqual(this.oPopover._getInitialFocusId(), null);
	});

	QUnit.test("popover.close() nulls _oPreviousFocus to skip Popover's focus-restore path", async function(assert) {
		this.oPopover = await this.oTooltip._createPopover();
		// Simulate the state Popover.openBy leaves behind: a captured "previous focus"
		// that Popover.close would otherwise hand to Popup.applyFocusInfo, yanking
		// keyboard focus back to the previously-tooltipped control.
		this.oPopover._oPreviousFocus = {sFocusId: "btn-A", oFocusedElement: null};
		this.oPopover.close();
		assert.strictEqual(this.oPopover._oPreviousFocus, null,
			"override clears _oPreviousFocus so the focus-restore path is skipped");
	});

	QUnit.test("popover afterClose calls _clearTimeouts", async function(assert) {
		this.oPopover = await this.oTooltip._createPopover();
		const spy = sinon.spy(this.oTooltip, "_clearTimeouts");
		// Trigger afterClose by firing the event directly
		this.oPopover.fireAfterClose();
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
		{placement: PlacementType.Top, expected: "sapUiCoreTooltipTop"},
		{placement: PlacementType.Bottom, expected: "sapUiCoreTooltipBottom"},
		{placement: PlacementType.Left, expected: "sapUiCoreTooltipLeft"},
		{placement: PlacementType.Right, expected: "sapUiCoreTooltipRight"}
	].forEach(function(oCase) {
		QUnit.test("placement " + oCase.placement + " → " + oCase.expected, async function(assert) {
			this.oTooltip = new Tooltip({text: "Hi", placement: oCase.placement, delay: 0});
			await openAndWait(this.oTooltip, this.oButton);

			const oCl = this.oTooltip._oPopover.getDomRef().classList;
			["Top", "Bottom", "Left", "Right"].forEach(function(s) {
				const sCls = "sapUiCoreTooltip" + s;
				assert[sCls === oCase.expected ? "ok" : "notOk"](oCl.contains(sCls), sCls);
			});
		});
	});

	QUnit.test("strict Top is promoted to VerticalPreferredTop on the Popover", async function(assert) {
		this.oTooltip = new Tooltip({text: "Hi", placement: PlacementType.Top, delay: 0});
		this.oTooltip._oPopover = await this.oTooltip._createPopover();
		const oSpy = sinon.spy(this.oTooltip._oPopover, "setPlacement");

		await openAndWait(this.oTooltip, this.oButton);

		assert.ok(oSpy.calledWith(PlacementType.VerticalPreferredTop),
			"Popover.setPlacement called with the promoted preferred variant");
		oSpy.restore();
		this.oTooltip.destroy();
	});

	// Aborted opens (close-before-open, selection guard) must not leak into the manager registry.
	QUnit.module("TooltipManager registry hygiene", {
		beforeEach: function() {
			this.oTooltip = new Tooltip({text: "Hi", delay: 0});
			this.stub = makeStub();
			// Avoid a real Popover DOM in unit tests.
			this.oTooltip._createPopover = () => Promise.resolve(makeFakePopover());
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

	QUnit.test("openBy registers and close() before the popover opens deregisters", async function(assert) {
		await this.oTooltip.openBy(this.stub, 200);

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
		const done = assert.async();
		const fnOrig = window.getSelection;
		window.getSelection = function() {
			return { toString: function() { return "user has a selection"; } };
		};

		this.oTooltip.openBy(this.stub, 10).then(() => {
			assert.ok(this.fnRegisterSpy.calledWith(this.oTooltip), "registered while pending");
			assert.notOk(this.fnDeregisterSpy.calledWith(this.oTooltip),
				"not yet deregistered before the open timer fires");

			setTimeout(() => {
				assert.notOk(this.oTooltip.isOpen(),
					"tooltip stayed closed — selection guard suppressed the open");
				assert.ok(this.fnDeregisterSpy.calledWith(this.oTooltip),
					"selection-guard path called TooltipManager.deregister");
				window.getSelection = fnOrig;
				done();
			}, 50);
		}).catch((e) => {
			window.getSelection = fnOrig;
			done(e);
		});
	});

	QUnit.test("afterClose deregisters via the init-time listener", function(assert) {
		this.oTooltip.fireAfterClose();
		assert.ok(this.fnDeregisterSpy.calledWith(this.oTooltip),
			"afterClose event triggered TooltipManager.deregister");
	});
});
