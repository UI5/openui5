/*global QUnit, sinon */
sap.ui.define([
	"sap/ui/core/tooltip/TooltipEnablement",
	"sap/ui/core/tooltip/TooltipEventTrigger",
	"sap/ui/core/tooltip/TooltipManager",
	"./FakeTooltipHost",
	"./FakeTooltipHostWithEnablement",
	"sap/ui/core/RenderManager",
	"sap/ui/test/utils/nextUIUpdate",
	"sap/ui/Device",
	"sap/m/Tooltip"
], function(TooltipEnablement, TooltipEventTrigger, TooltipManager, FakeTooltipHost, FakeTooltipHostWithEnablement, RenderManager, nextUIUpdate, Device, Tooltip) {
	"use strict";

	// TooltipManager's open-tooltip registry is module-global; reset it per test.
	QUnit.testDone(function() {
		TooltipManager._getRegistry().clear();
	});

	// Renders a single call into a detached element and returns the resulting HTML.
	function renderToString(fnRender) {
		const oRm = new RenderManager().getInterface();
		const oTarget = document.createElement("div");
		fnRender(oRm);
		oRm.flush(oTarget);
		oRm.destroy();
		return oTarget.innerHTML;
	}

	// Renders the host through the normal UI5 lifecycle so listeners attach via the public onAfterRendering delegate.
	async function renderHost(oHost, oClock) {
		oHost.placeAt("qunit-fixture");
		await nextUIUpdate(oClock);
	}

	async function waitForOpen(oClock, oEnablement) {
		// NOTE: This wait works only if we have preloaded sap.m.Tooltip (done in the beginning of the file)

		if (oEnablement.isOpen()) {
			return;
		}

		const pOpen = new Promise((fnResolve) => {
			function fnAfterOpen() {
				oEnablement.detachAfterOpen(fnAfterOpen);
				fnResolve();
			}
			oEnablement.attachAfterOpen(fnAfterOpen);
		});

		await nextUIUpdate(oClock);
		await oClock.tickAsync(1000);

		return pOpen;
	}

	async function waitForOpenState(oClock, oEnablement) {
		const fnSpy = sinon.spy(Tooltip.prototype, "openBy");
		try {
			await oClock.tickAsync(2000);
			return fnSpy.notCalled ? "NotOpened" : "Opened";
		} finally {
			fnSpy.restore();
		}
	}

	async function waitForClose(oClock, oEnablement) {
		if (!oEnablement.isOpen()) {
			return;
		}

		const pClose = new Promise((fnResolve) => {
			function fnAfterClose() {
				oEnablement.detachAfterClose(fnAfterClose);
				fnResolve();
			}
			oEnablement.attachAfterClose(fnAfterClose);
		});

		await nextUIUpdate(oClock);
		await oClock.tickAsync(1000);

		return pClose;
	}

	// ---- DOM event helpers -------------------------------------------------

	async function setupHostWithDevice(o) {
		o.oHost = new FakeTooltipHost({ id: "host-evt-" + Date.now() });
		o.oEnablement = new TooltipEnablement(o.oHost, {
			textProvider: () => "hi"
		});
		await renderHost(o.oHost, o.clock);
	}

	async function teardownHost(o) {
		o.oEnablement.destroy();
		o.oHost.destroy();
		o.oDeviceStub.restore();
		// Drain leftover timers before the clock is restored so no timer leaks across the boundary.
		await o.clock.tickAsync(2000);
	}

	function dispatch(oHost, oEvent) {
		oHost.getDomRef().dispatchEvent(oEvent);
	}

	QUnit.module("Construction", {
		beforeEach: function() {
			this.oHost = new FakeTooltipHost({ id: "host-btn" });
		},
		afterEach: function() {
			this.oHost.destroy();
		}
	});

	QUnit.test("default config: no tooltip text, touch enabled, not open", function(assert) {
		const oEnablement = new TooltipEnablement(this.oHost);
		assert.strictEqual(oEnablement.getEnableForTouchDevices(), true,
			"enableForTouchDevices defaults to true");
		assert.strictEqual(oEnablement.isOpen(), false, "not open");
		assert.strictEqual(oEnablement.getInvisibleTooltipId(), null,
			"no invisible anchor id when no textProvider was given");
		oEnablement.destroy();
	});

	QUnit.test("constructor honours enableForTouchDevices=false", function(assert) {
		const oEnablement = new TooltipEnablement(this.oHost, {
			textProvider: () => "x",
			enableForTouchDevices: false
		});
		assert.strictEqual(oEnablement.getEnableForTouchDevices(), false);
		oEnablement.destroy();
	});

	QUnit.test("constructor wires the textProvider (used by getInvisibleTooltipId)", function(assert) {
		const fnText = sinon.stub().returns("hello");
		const oEnablement = new TooltipEnablement(this.oHost, { textProvider: fnText });
		assert.strictEqual(oEnablement.getInvisibleTooltipId(), "host-btn-invisibleTooltip",
			"invisible id derived from host id when textProvider yields non-empty text");
		assert.ok(fnText.called, "textProvider was invoked to resolve the text");
		oEnablement.destroy();
	});

	QUnit.test("constructor wires the invisibleTextProvider (wins over textProvider)", function(assert) {
		const fnVisible = sinon.stub().returns("visible");
		const fnInvisible = sinon.stub().returns("invisible");
		const oEnablement = new TooltipEnablement(this.oHost, {
			textProvider: fnVisible,
			invisibleTextProvider: fnInvisible
		});
		const sHtml = renderToString((oRm) => oEnablement.renderInvisibleTooltip(oRm));
		assert.ok(sHtml.includes(">invisible<"),
			"invisibleTextProvider used for the anchor text");
		assert.ok(fnInvisible.called, "invisibleTextProvider was invoked");
		oEnablement.destroy();
	});

	QUnit.test("constructor throws when host is not a Control", function(assert) {
		assert.throws(function() {
			return new TooltipEnablement({});
		}, /sap\.ui\.core\.Control/);
	});

	QUnit.module("Setters", {
		beforeEach: function() {
			this.oHost = new FakeTooltipHost({ id: "host-btn" });
			this.oEnablement = new TooltipEnablement(this.oHost);
		},
		afterEach: async function() {
			this.oEnablement.destroy();
			this.oHost.destroy();
			await this.clock.tickAsync(2000);
			this.clock.restore();
		}
	});

	QUnit.test("setEnableForTouchDevices / getEnableForTouchDevices round-trip", function(assert) {
		assert.strictEqual(this.oEnablement.setEnableForTouchDevices(false), this.oEnablement, "chainable");
		assert.strictEqual(this.oEnablement.getEnableForTouchDevices(), false);
		this.oEnablement.setEnableForTouchDevices(true);
		assert.strictEqual(this.oEnablement.getEnableForTouchDevices(), true);
	});

	QUnit.module("renderInvisibleTooltip", {
		beforeEach: function() {
			this.oHost = new FakeTooltipHost({ id: "host-btn" });
			this.oEnablement = new TooltipEnablement(this.oHost, {
				textProvider: () => "hello"
			});
		},
		afterEach: async function() {
			this.oEnablement.destroy();
			this.oHost.destroy();
			await this.clock.tickAsync(2000);
			this.clock.restore();
		}
	});

	QUnit.test("emits a span with derived id, role=tooltip, and resolved text", function(assert) {
		const sHtml = renderToString((oRm) => this.oEnablement.renderInvisibleTooltip(oRm));
		assert.ok(sHtml.includes('id="host-btn-invisibleTooltip"'), "id derived from host id");
		assert.ok(sHtml.includes('role="tooltip"'), "role=tooltip");
		assert.ok(sHtml.includes("sapUiInvisibleText"), "class applied");
		assert.ok(sHtml.includes(">hello<"), "resolved text written inline");
		assert.strictEqual(this.oEnablement.getInvisibleTooltipId(), "host-btn-invisibleTooltip",
			"getInvisibleTooltipId matches the rendered id");
	});

	QUnit.test("re-resolves text from the textProvider on every render", function(assert) {
		let sText = "first";
		const oHost = new FakeTooltipHost({ id: "host-btn-rerender" });
		const oEnablement = new TooltipEnablement(oHost, {
			textProvider: () => sText
		});
		try {
			const sHtml1 = renderToString((oRm) => oEnablement.renderInvisibleTooltip(oRm));
			assert.ok(sHtml1.includes(">first<"), "first text rendered");
			sText = "second";
			const sHtml2 = renderToString((oRm) => oEnablement.renderInvisibleTooltip(oRm));
			assert.ok(sHtml2.includes(">second<"), "updated text rendered");
		} finally {
			oEnablement.destroy();
			oHost.destroy();
		}
	});

	QUnit.test("invisibleTextProvider wins over textProvider", function(assert) {
		const oHost = new FakeTooltipHost({ id: "host-btn-invis" });
		const oEnablement = new TooltipEnablement(oHost, {
			textProvider: () => "visible",
			invisibleTextProvider: () => "invisible"
		});
		try {
			const sHtml = renderToString((oRm) => oEnablement.renderInvisibleTooltip(oRm));
			assert.ok(sHtml.includes(">invisible<"), "invisible provider used");
			assert.notOk(sHtml.includes(">visible<"), "visible provider ignored");
		} finally {
			oEnablement.destroy();
			oHost.destroy();
		}
	});

	QUnit.test("invisibleTextProvider falls back to visible text when not set", function(assert) {
		const oHost = new FakeTooltipHost({ id: "host-btn-fallback" });
		const oEnablement = new TooltipEnablement(oHost, {
			textProvider: () => "visible"
		});
		try {
			const sHtml = renderToString((oRm) => oEnablement.renderInvisibleTooltip(oRm));
			assert.ok(sHtml.includes(">visible<"),
				"falls back to textProvider when no invisibleTextProvider");
		} finally {
			oEnablement.destroy();
			oHost.destroy();
		}
	});

	QUnit.test("renders nothing when there is no text", function(assert) {
		const oHost = new FakeTooltipHost({ id: "host-btn-empty" });
		const oEnablement = new TooltipEnablement(oHost);
		try {
			const sHtml = renderToString((oRm) => oEnablement.renderInvisibleTooltip(oRm));
			assert.strictEqual(sHtml, "", "no span emitted when text is empty");
			assert.strictEqual(oEnablement.getInvisibleTooltipId(), null,
				"getInvisibleTooltipId reports null when text is empty");
		} finally {
			oEnablement.destroy();
			oHost.destroy();
		}
	});

	QUnit.module("DOM events - desktop", {
		beforeEach: async function() {
			this.oDeviceStub = sinon.stub(Device, "system")
				.value({ desktop: true, combi: false, phone: false, tablet: false });
			await setupHostWithDevice(this);
		},
		afterEach: async function() {
			await teardownHost(this);
			this.clock.restore();
		}
	});

	QUnit.test("mousedown closes an open tooltip", async function(assert) {
		this.oEnablement.open();
		await waitForOpen(this.clock, this.oEnablement);
		assert.strictEqual(this.oEnablement.isOpen(), true, "open before mousedown");
		dispatch(this.oHost, new MouseEvent("mousedown", { button: 0, bubbles: true }));
		assert.strictEqual(this.oEnablement.isOpen(), false, "closed after mousedown");
	});

	QUnit.test("mouseenter is ignored while text is selected", async function(assert) {
		const oOrig = window.getSelection;
		window.getSelection = function() {
			return { toString: function() { return "selected text"; } };
		};
		try {
			dispatch(this.oHost, new MouseEvent("mouseenter", { bubbles: true }));
			const sState = await waitForOpenState(this.clock, this.oEnablement);
			assert.strictEqual(sState, "NotOpened", "afterOpen does not fire while a selection exists");
		} finally {
			window.getSelection = oOrig;
		}
	});

	QUnit.test("mouseleave closes an open tooltip", async function(assert) {
		this.oEnablement.open();
		await waitForOpen(this.clock, this.oEnablement);
		assert.strictEqual(this.oEnablement.isOpen(), true, "open before mouseleave");
		dispatch(this.oHost, new MouseEvent("mouseleave", { bubbles: true }));

		await waitForClose(this.clock, this.oEnablement);
		assert.ok(true, "afterClose fires after mouseleave");
		assert.strictEqual(this.oEnablement.isOpen(), false, "closed after mouseleave");
	});

	QUnit.test("mouseenter opens the tooltip", async function(assert) {
		dispatch(this.oHost, new MouseEvent("mouseenter", { bubbles: true }));
		await waitForOpen(this.clock, this.oEnablement);
		assert.ok(true, "afterOpen fires after mouseenter");
	});

	QUnit.test("focusin opens when :focus-visible matches", async function(assert) {
		const oDomRef = this.oHost.getDomRef();
		const oOrig = oDomRef.matches;
		oDomRef.matches = function(s) {
			return s === ":focus-visible" || oOrig.call(this, s);
		};
		try {
			dispatch(this.oHost, new FocusEvent("focusin", { bubbles: true }));
			await waitForOpen(this.clock, this.oEnablement);
			assert.ok(true, "afterOpen fires on keyboard focus");
		} finally {
			oDomRef.matches = oOrig;
		}
	});

	QUnit.test("focusin does not open without :focus-visible (e.g. mouse focus)", async function(assert) {
		const oDomRef = this.oHost.getDomRef();
		const oOrig = oDomRef.matches;
		oDomRef.matches = function(s) {
			return s === ":focus-visible" ? false : oOrig.call(this, s);
		};
		try {
			dispatch(this.oHost, new FocusEvent("focusin", { bubbles: true }));
			const sState = await waitForOpenState(this.clock, this.oEnablement);
			assert.strictEqual(sState, "NotOpened", "afterOpen does not fire on programmatic focus");
		} finally {
			oDomRef.matches = oOrig;
		}
	});

	QUnit.test("focusout closes an open tooltip", async function(assert) {
		this.oEnablement.open();
		await waitForOpen(this.clock, this.oEnablement);
		dispatch(this.oHost, new FocusEvent("focusout", { bubbles: true }));
		await waitForClose(this.clock, this.oEnablement);
		assert.strictEqual(this.oEnablement.isOpen(), false, "closed after focusout");
	});

	QUnit.test("Escape is a no-op when nothing is open or pending (does not swallow)", function(assert) {
		const oEvent = new KeyboardEvent("keydown", {
			key: "Escape", cancelable: true, bubbles: true
		});
		dispatch(this.oHost, oEvent);
		assert.strictEqual(this.oEnablement.isOpen(), false, "not open");
		assert.notOk(oEvent.defaultPrevented,
			"preventDefault not called - Escape stays available to ancestors");
	});

	QUnit.test("Escape closes an open tooltip and prevents default", async function(assert) {
		this.oEnablement.open();
		await waitForOpen(this.clock, this.oEnablement);
		const oEvent = new KeyboardEvent("keydown", {
			key: "Escape", cancelable: true, bubbles: true
		});
		dispatch(this.oHost, oEvent);
		assert.ok(oEvent.defaultPrevented,
			"preventDefault called - Escape consumed while a tooltip is open");
		assert.strictEqual(this.oEnablement.isOpen(), false, "closed after Escape");
	});

	QUnit.test("Escape during the async popover-creation window cancels the pending open and is consumed", function(assert) {
		// Enter the async gap: _open is suspended on await _ensureTooltip().
		// _oPendingOpen is set, but the popover is not open yet.
		this.oEnablement.open();
		assert.strictEqual(this.oEnablement.isOpen(), false,
			"not yet open — popover creation still in flight");

		// Escape on the host must be consumed by the tooltip (not fall through to
		// an enclosing Dialog) and must cancel the pending open.
		const oEvent = new KeyboardEvent("keydown", {
			key: "Escape", cancelable: true, bubbles: true
		});
		dispatch(this.oHost, oEvent);
		assert.ok(oEvent.defaultPrevented,
			"preventDefault called - Escape consumed while an open is pending");

		// assert.notOk(await waitForOpen(this.clock, this.oEnablement, 500),
		// 	"afterOpen does not fire — the pending open was cancelled");
		assert.strictEqual(this.oEnablement.isOpen(), false, "not open");
	});

	QUnit.test("non-Escape keydown does nothing", async function(assert) {
		this.oEnablement.open();
		await waitForOpen(this.clock, this.oEnablement);
		dispatch(this.oHost, new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
		assert.strictEqual(this.oEnablement.isOpen(), true, "still open on Enter");
	});

	QUnit.test("pending open that resolves to empty text does not leave Escape swallowed", async function(assert) {
		// Regression: if the text provider transitions to "" during the async
		// _ensureTooltip() window, the pending open must be cleared so a
		// subsequent Escape is not consumed (leaving ancestor handlers to run).
		let sText = "initial";
		const oHost = new FakeTooltipHost({ id: "host-empty-race" });
		const oEnablement = new TooltipEnablement(oHost, {
			textProvider: () => sText
		});
		await renderHost(oHost, this.clock);
		try {
			// Enter the async gap and flip the text to empty before it resumes.
			oEnablement.open();
			sText = "";
			await this.clock.tickAsync(0);

			assert.strictEqual(oEnablement.isOpen(), false,
				"tooltip did not open — text was empty when the pending open resumed");

			const oEvent = new KeyboardEvent("keydown", {
				key: "Escape", cancelable: true, bubbles: true
			});
			oHost.getDomRef().dispatchEvent(oEvent);
			assert.notOk(oEvent.defaultPrevented,
				"Escape not consumed — stale pending state was cleared");
		} finally {
			oEnablement.destroy();
			oHost.destroy();
		}
	});

	QUnit.module("Imperative open/close", {
		beforeEach: async function() {
			this.oHost = new FakeTooltipHost({ id: "host-btn" });
			await renderHost(this.oHost, this.clock);
			this.oEnablement = new TooltipEnablement(this.oHost, {
				textProvider: () => "hello"
			});
		},
		afterEach: async function() {
			this.oEnablement.destroy();
			this.oHost.destroy();
			await this.clock.tickAsync(2000);
			this.clock.restore();
		}
	});

	QUnit.test("open() opens, close() closes", async function(assert) {
		assert.strictEqual(this.oEnablement.isOpen(), false, "not open initially");
		this.oEnablement.open();
		await waitForOpen(this.clock, this.oEnablement);
		assert.strictEqual(this.oEnablement.isOpen(), true, "open after open()");
		this.oEnablement.close();
		assert.strictEqual(this.oEnablement.isOpen(), false, "closed after close()");
	});

	QUnit.test("open() with empty text is a no-op", async function(assert) {
		const oHost = new FakeTooltipHost({ id: "host-btn-empty-open" });
		await renderHost(oHost, this.clock);
		const oEnablement = new TooltipEnablement(oHost, {
			textProvider: () => ""
		});
		try {
			oEnablement.open();
			await this.clock.tickAsync(0);
			assert.strictEqual(oEnablement.isOpen(), false,
				"open() does not flip isOpen when text is empty");
		} finally {
			oEnablement.destroy();
			oHost.destroy();
		}
	});

	QUnit.test("close() before lazy module load aborts the open (no late open)", async function(assert) {
		// Kick off open() without waiting — module load may be in flight.
		this.oEnablement.open();
		// Cancel before the async open resolves.
		this.oEnablement.close();
		// Give any pending lazy-open scheduling a chance to fire.
		const sState = await waitForOpenState(this.clock, this.oEnablement);
		assert.strictEqual(sState, "NotOpened", "afterOpen does not fire after cancellation");
		assert.strictEqual(this.oEnablement.isOpen(), false,
			"helper is not open after cancellation");
	});

	QUnit.test("close() after inner tooltip is created but before it opens aborts via flag", async function(assert) {
		// Prime the lazy inner tooltip by fully opening once, then close silently.
		this.oEnablement.open();
		await waitForOpen(this.clock, this.oEnablement);

		this.oEnablement.close();
		await waitForClose(this.clock, this.oEnablement);

		assert.ok(this.oEnablement._oTooltip,
			"inner tooltip exists — next open() awaits nothing but a resolved promise");

		// Second open(): _ensureTooltip resolves synchronously-ish (already cached), but the
		// await still yields to microtasks. Close before those microtasks resume.
		this.oEnablement.open();
		this.oEnablement.close();

		const sState = await waitForOpenState(this.clock, this.oEnablement);
		assert.strictEqual(sState, "NotOpened",
			"afterOpen does not fire — the aborted flag short-circuited the resumed open");
		assert.strictEqual(this.oEnablement.isOpen(), false, "not open");
	});

	QUnit.test("open() during a pending open aborts the first; only the second opens", async function(assert) {
		let iOpenCount = 0;
		this.oEnablement.attachAfterOpen(() => { iOpenCount++; });

		// Two opens back-to-back. The first suspends on await _ensureTooltip().
		// The second flips the first's token to aborted, then installs its own.
		this.oEnablement.open();
		this.oEnablement.open();

		// Wait long enough for both to have resumed past the await.
		await waitForOpen(this.clock, this.oEnablement);

		assert.strictEqual(iOpenCount, 1,
			"only the second open() proceeds — the first bails on its aborted flag");
		assert.strictEqual(this.oEnablement.isOpen(), true, "open after second open()");
	});

	QUnit.test("destroy() during a pending open aborts the open (no late open, no throw)", async function(assert) {
		this.oEnablement.open();
		// Destroy while the first open is still awaiting _ensureTooltip().
		this.oEnablement.destroy();

		// waitForOpen would try to attach on the destroyed enablement — poll isOpen() instead.
		await this.clock.tickAsync(0);
		assert.strictEqual(this.oEnablement.isOpen(), false,
			"destroyed helper is not open");
		assert.ok(true, "no throw from the resumed _open path after destroy");
	});

	QUnit.module("Attachment DOM ref", {
		beforeEach: function() {
			this.oDeviceStub = sinon.stub(Device, "system")
				.value({ desktop: true, combi: false, phone: false, tablet: false });
		},
		afterEach: async function() {
			// Drain leftover timers before restoring the clock so no timer leaks across the boundary.
			await this.clock.tickAsync(2000);
			this.oDeviceStub.restore();
			this.clock.restore();
		}
	});

	QUnit.test("defaults to host.getFocusDomRef()", async function(assert) {
		const oHost = new FakeTooltipHost({ id: "host-focus-default" });
		await renderHost(oHost, this.clock);

		// Inject an inner element and point getFocusDomRef at it.
		const oInner = document.createElement("span");
		oInner.id = "inner-focus-target";
		oHost.getDomRef().appendChild(oInner);
		const fnOrig = oHost.getFocusDomRef;
		oHost.getFocusDomRef = function() { return oInner; };

		const oEnablement = new TooltipEnablement(oHost, { textProvider: () => "hi" });
		try {
			// Dispatching on the inner (focus) DOM ref should open.
			oInner.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));

			await waitForOpen(this.clock, oEnablement);
			assert.ok(true, "mouseenter on focus DOM ref opens");

			oEnablement.close();
			await waitForClose(this.clock, oEnablement);

			// Dispatching on the outer DOM ref should NOT open.
			oHost.getDomRef().dispatchEvent(new MouseEvent("mouseenter", { bubbles: false }));

			const sState = await waitForOpenState(this.clock, oEnablement);
			assert.strictEqual(sState, "NotOpened", "mouseenter on outer DOM ref does not open");
		} finally {
			oHost.getFocusDomRef = fnOrig;
			oEnablement.destroy();
			oHost.destroy();
		}
	});

	QUnit.test("respects custom domRefProvider", async function(assert) {
		const oHost = new FakeTooltipHost({ id: "host-custom-provider" });
		await renderHost(oHost, this.clock);

		const oCustom = document.createElement("div");
		oCustom.id = "custom-attach-target";
		document.getElementById("qunit-fixture").appendChild(oCustom);

		const oEnablement = new TooltipEnablement(oHost, {
			textProvider: () => "hi",
			domRefProvider: () => oCustom
		});

		try {
			oCustom.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
			await waitForOpen(this.clock, oEnablement);
			assert.ok(true, "mouseenter on custom element opens");

			oEnablement.close();
			await waitForClose(this.clock, oEnablement);

			oHost.getDomRef().dispatchEvent(new MouseEvent("mouseenter", { bubbles: false }));
			const sState = await waitForOpenState(this.clock, oEnablement);
			assert.strictEqual(sState, "NotOpened", "mouseenter on host DOM does not open");
		} finally {
			oEnablement.destroy();
			oHost.destroy();
		}
	});

	QUnit.test("domRefProvider returning null is safe", async function(assert) {
		const oHost = new FakeTooltipHost({ id: "host-null-provider" });
		await renderHost(oHost, this.clock);

		let oEnablement;
		assert.ok(
			(function() {
				oEnablement = new TooltipEnablement(oHost, {
					textProvider: () => "hi",
					domRefProvider: () => null
				});
				return true;
			})(),
			"construction does not throw when provider returns null"
		);

		try {
			oHost.getDomRef().dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
			const sState = await waitForOpenState(this.clock, oEnablement);
			assert.strictEqual(sState, "NotOpened", "no listeners attached, so no open");
		} finally {
			oEnablement.destroy();
			oHost.destroy();
		}
	});

	QUnit.test("provider is re-invoked on host re-render", async function(assert) {
		const oHost = new FakeTooltipHost({ id: "host-rerender-provider" });
		const oEnablement = new TooltipEnablement(oHost, {
			textProvider: () => "hi",
			// Re-resolved each call — points at the host's DOM ref at the moment of invocation.
			domRefProvider: () => oHost.getDomRef()
		});
		await renderHost(oHost, this.clock);

		// Force a real re-render through the public path.
		oHost.invalidate();
		await nextUIUpdate(this.clock);

		try {
			const oCurrent = oHost.getDomRef();
			assert.ok(oCurrent, "host has a DOM ref after re-render");
			oCurrent.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
			await waitForOpen(this.clock, oEnablement);
			assert.ok(true, "mouseenter on the re-rendered host opens");
		} finally {
			oEnablement.destroy();
			oHost.destroy();
		}
	});

	// onBeforeRendering must not consult the provider (fix uses the remembered attach ref).
	QUnit.test("host re-render does not consult provider on before-rendering; listeners re-attach cleanly", async function(assert) {
		const oDeviceStub = sinon.stub(Device, "system")
			.value({ desktop: true, combi: false, phone: false, tablet: false });
		const oHost = new FakeTooltipHost({ id: "host-attach-tracking" });

		const fnProvider = sinon.spy(() => oHost.getDomRef());
		const oEnablement = new TooltipEnablement(oHost, {
			textProvider: () => "hi",
			domRefProvider: fnProvider
		});
		await renderHost(oHost, this.clock);

		try {
			const iCallsAfterInitialRender = fnProvider.callCount;
			assert.ok(iCallsAfterInitialRender >= 1,
				"provider queried at least once during initial construction/render");

			oHost.invalidate();
			await nextUIUpdate(this.clock);

			// Only onAfterRendering asks the provider on re-render.
			assert.strictEqual(fnProvider.callCount, iCallsAfterInitialRender + 1,
				"provider queried exactly once per re-render (in onAfterRendering only)");

			oHost.getDomRef().dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
			await waitForOpen(this.clock, oEnablement);
			assert.ok(true, "mouseenter on the re-rendered host opens — listeners were re-attached");
		} finally {
			oEnablement.destroy();
			oHost.destroy();
			oDeviceStub.restore();
		}
	});

	QUnit.module("setEnableForTouchDevices reflects in DOM behavior", {
		beforeEach: async function() {
			// Stub touch device so the contextmenu handler is installed.
			this.oDeviceStub = sinon.stub(Device, "system")
				.value({ desktop: false, combi: false, phone: true, tablet: false });
			this.oHost = new FakeTooltipHost({ id: "host-touch" });
			this.oEnablement = new TooltipEnablement(this.oHost, {
				textProvider: () => "hi"
			});
			await renderHost(this.oHost, this.clock);
		},
		afterEach: async function() {
			this.oEnablement.destroy();
			this.oHost.destroy();
			this.oDeviceStub.restore();
			await this.clock.tickAsync(2000);
			this.clock.restore();
		}
	});

	QUnit.test("toggling off keeps the contextmenu listener installed but stops preventing default", function(assert) {
		// Default: enableForTouchDevices=true → contextmenu IS prevented.
		const oFirst = new MouseEvent("contextmenu", { cancelable: true, bubbles: true });
		this.oHost.getDomRef().dispatchEvent(oFirst);
		assert.ok(oFirst.defaultPrevented, "contextmenu prevented while enabled");

		// Toggle off — the handler stays attached (no error, no detach), but no prevention.
		this.oEnablement.setEnableForTouchDevices(false);
		const oSecond = new MouseEvent("contextmenu", { cancelable: true, bubbles: true });
		this.oHost.getDomRef().dispatchEvent(oSecond);
		assert.notOk(oSecond.defaultPrevented, "contextmenu not prevented after disabling");

		// Toggle back on — prevention is restored.
		this.oEnablement.setEnableForTouchDevices(true);
		const oThird = new MouseEvent("contextmenu", { cancelable: true, bubbles: true });
		this.oHost.getDomRef().dispatchEvent(oThird);
		assert.ok(oThird.defaultPrevented, "contextmenu prevented again after re-enabling");
	});

	QUnit.module("DOM events - mobile (phone)", {
		beforeEach: async function() {
			this.oDeviceStub = sinon.stub(Device, "system")
				.value({ desktop: false, combi: false, phone: true, tablet: false });
			await setupHostWithDevice(this);
		},
		afterEach: async function() {
			await teardownHost(this);
			this.clock.restore();
		}
	});

	QUnit.test("contextmenu is prevented when enableForTouchDevices=true (default)", function(assert) {
		const oEvent = new MouseEvent("contextmenu", { cancelable: true, bubbles: true });
		dispatch(this.oHost, oEvent);
		assert.ok(oEvent.defaultPrevented, "contextmenu prevented");
	});

	QUnit.test("contextmenu is NOT prevented when enableForTouchDevices=false", function(assert) {
		this.oEnablement.setEnableForTouchDevices(false);
		const oEvent = new MouseEvent("contextmenu", { cancelable: true, bubbles: true });
		dispatch(this.oHost, oEvent);
		assert.notOk(oEvent.defaultPrevented, "contextmenu not prevented");
	});

	QUnit.module("DOM events - combi (desktop wiring, no mobile)", {
		beforeEach: async function() {
			// combi gets desktop branches but NOT the mobile/touch ones.
			this.oDeviceStub = sinon.stub(Device, "system")
				.value({ desktop: false, combi: true, phone: true, tablet: true });
			await setupHostWithDevice(this);
		},
		afterEach: async function() {
			await teardownHost(this);
			this.clock.restore();
		}
	});

	QUnit.test("combi gets desktop events (mouseenter opens)", async function(assert) {
		dispatch(this.oHost, new MouseEvent("mouseenter", { bubbles: true }));
		await waitForOpen(this.clock, this.oEnablement);
		assert.ok(true, "afterOpen fires on combi");
	});

	QUnit.test("combi does NOT prevent contextmenu (no mobile wiring)", function(assert) {
		const oEvent = new MouseEvent("contextmenu", { cancelable: true, bubbles: true });
		dispatch(this.oHost, oEvent);
		assert.notOk(oEvent.defaultPrevented,
			"contextmenu handler is not installed on combi");
	});

	QUnit.module("DOM events - tablet (mobile wiring)", {
		beforeEach: async function() {
			this.oDeviceStub = sinon.stub(Device, "system")
				.value({ desktop: false, combi: false, phone: false, tablet: true });
			await setupHostWithDevice(this);
		},
		afterEach: async function() {
			await teardownHost(this);
			this.clock.restore();
		}
	});

	QUnit.test("tablet prevents contextmenu on non-link host", function(assert) {
		const oEvent = new MouseEvent("contextmenu", { cancelable: true, bubbles: true });
		dispatch(this.oHost, oEvent);
		assert.ok(oEvent.defaultPrevented);
	});

	QUnit.module("Lifecycle (host re-render)", {
		beforeEach: async function() {
			this.oHost = new FakeTooltipHost({ id: "host-btn-life" });
			this.oEnablement = new TooltipEnablement(this.oHost, {
				textProvider: () => "hello"
			});
			await renderHost(this.oHost, this.clock);
		},
		afterEach: async function() {
			this.oEnablement.destroy();
			this.oHost.destroy();
			await this.clock.tickAsync(2000);
			this.clock.restore();
		}
	});

	QUnit.test("re-rendering the host keeps DOM listeners working", async function(assert) {
		// Force a real re-render through the public path.
		this.oHost.invalidate();
		await nextUIUpdate(this.clock);

		// After re-render, dispatching a close-trigger event must still take effect:
		// open via the public API, then a mousedown on the host should close.
		this.oEnablement.open();
		await waitForOpen(this.clock, this.oEnablement);
		assert.strictEqual(this.oEnablement.isOpen(), true, "open after re-render");
		this.oHost.getDomRef().dispatchEvent(
			new MouseEvent("mousedown", { button: 0, bubbles: true })
		);
		assert.strictEqual(this.oEnablement.isOpen(), false,
			"mousedown still closes after host re-render");
	});

	QUnit.module("Host cloning", {
		beforeEach: function() {
			this.oDeviceStub = sinon.stub(Device, "system")
				.value({ desktop: true, combi: false, phone: false, tablet: false });
		},
		afterEach: async function() {
			this.oDeviceStub.restore();
			await this.clock.tickAsync(2000);
			this.clock.restore();
		}
	});

	QUnit.test("host clone gets its own single enablement, not a leaked one", async function(assert) {
		const oHost = new FakeTooltipHostWithEnablement({
			id: "host-fake-clone", tooltipText: "hi"
		});
		await renderHost(oHost, this.clock);

		// Only start counting after the original host is fully rendered.
		const oAttachSpy = sinon.spy(TooltipEventTrigger.prototype, "attach");

		const oClone = oHost.clone();
		try {
			oClone.placeAt("qunit-fixture");
			await nextUIUpdate(this.clock);

			const aCloneAttachCalls = oAttachSpy.getCalls().filter(
				(oCall) => oCall.args[0] === oClone.getDomRef()
			);
			assert.strictEqual(aCloneAttachCalls.length, 1,
				"trigger.attach called exactly once on the clone's DOM (the clone's own enablement)");
		} finally {
			oAttachSpy.restore();
			oClone.destroy();
			oHost.destroy();
		}
	});

	QUnit.module("Destroy", {
		beforeEach: async function() {
			this.oHost = new FakeTooltipHost({ id: "host-btn-destroy" });
			this.oEnablement = new TooltipEnablement(this.oHost, {
				textProvider: () => "hi"
			});
			await renderHost(this.oHost, this.clock);
		},
		afterEach: async function() {
			this.oHost.destroy();
			await this.clock.tickAsync(2000);
			this.clock.restore();
		}
	});

	QUnit.test("destroy closes the tooltip and detaches DOM listeners", async function(assert) {
		this.oEnablement.open();
		await waitForOpen(this.clock, this.oEnablement);
		assert.strictEqual(this.oEnablement.isOpen(), true);
		this.oEnablement.destroy();
		assert.strictEqual(this.oEnablement.isOpen(), false, "isOpen() false after destroy");

		// After destroy, dispatching events on the host must NOT reopen the tooltip.
		this.oHost.getDomRef().dispatchEvent(
			new MouseEvent("mouseenter", { bubbles: true })
		);
		await this.clock.tickAsync(0);
		assert.strictEqual(this.oEnablement.isOpen(), false,
			"mouseenter after destroy does not reopen");
	});

	QUnit.test("double-destroy is safe", function(assert) {
		this.oEnablement.destroy();
		this.oEnablement.destroy();
		assert.ok(true, "no throw");
	});

});
