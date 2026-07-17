/*global QUnit, sinon */
sap.ui.define([
	"sap/ui/core/tooltip/TooltipManager",
	"sap/ui/core/tooltip/Tooltip",
	"./FakeTooltipHost"
], function (TooltipManager, Tooltip, FakeTooltipHost) {
	"use strict";

	QUnit.module("Constants", {});

	QUnit.test("HOVER_DELAY_MS is 500", function (assert) {
		assert.strictEqual(TooltipManager.HOVER_DELAY_MS, 500);
	});

	QUnit.test("HANDOFF_DELAY_MS is 200", function (assert) {
		assert.strictEqual(TooltipManager.HANDOFF_DELAY_MS, 200);
	});

	QUnit.module("open / close / registry", {
		beforeEach: function () {
			this.oOpener = new FakeTooltipHost();
			this.oTooltipA = new Tooltip({ text: "a" });
			this.oTooltipB = new Tooltip({ text: "b" });
			// Stub the public open/close to observe calls without scheduling real timers.
			this.oOpenStub = sinon.stub(Tooltip.prototype, "openBy");
			this.oCloseStub = sinon.stub(Tooltip.prototype, "close");
		},
		afterEach: function () {
			this.oOpenStub.restore();
			this.oCloseStub.restore();
			if (this.oTooltipA) {
				this.oTooltipA.destroy();
			}
			if (this.oTooltipB) {
				this.oTooltipB.destroy();
			}
			this.oOpener.destroy();
			TooltipManager._getRegistry().clear();
		}
	});

	QUnit.test("openSingle with bWithDelay=false uses delay 0", function (assert) {
		TooltipManager.openSingle(this.oTooltipA, this.oOpener, false);
		TooltipManager.registerOpening(this.oTooltipA);
		assert.ok(TooltipManager._getRegistry().has(this.oTooltipA), "registered");
		assert.ok(this.oOpenStub.calledOnce, "openBy called once");
		assert.strictEqual(this.oOpenStub.firstCall.args[0], this.oOpener, "opener forwarded");
		assert.strictEqual(this.oOpenStub.firstCall.args[1], 0, "delay resolved to 0");
	});

	QUnit.test("opening a second tooltip uses the handoff delay and closes the first", function (assert) {
		TooltipManager.openSingle(this.oTooltipA, this.oOpener, false);
		TooltipManager.registerOpening(this.oTooltipA);
		this.oOpenStub.resetHistory();

		TooltipManager.openSingle(this.oTooltipB, this.oOpener, true);
		TooltipManager.registerOpening(this.oTooltipB);

		assert.strictEqual(this.oOpenStub.firstCall.args[1],
			TooltipManager.HANDOFF_DELAY_MS,
			"second open used the handoff delay (200ms)");
		assert.ok(this.oCloseStub.called, "the first tooltip was asked to close");
		assert.strictEqual(this.oCloseStub.firstCall.args[0],
			TooltipManager.HANDOFF_DELAY_MS,
			"first close used the handoff delay");
		assert.ok(TooltipManager._getRegistry().has(this.oTooltipB),
			"second tooltip is registered");
	});

	QUnit.test("re-opening the same sole-registered tooltip with bWithDelay=true uses the hover delay", function (assert) {
		TooltipManager.openSingle(this.oTooltipA, this.oOpener, false);
		TooltipManager.registerOpening(this.oTooltipA);
		this.oOpenStub.resetHistory();

		TooltipManager.openSingle(this.oTooltipA, this.oOpener, true);
		assert.strictEqual(this.oOpenStub.firstCall.args[1],
			TooltipManager.HOVER_DELAY_MS,
			"sole-registered tooltip does not trigger self-handoff");
	});

	QUnit.test("deregister removes the tooltip from the registry", function (assert) {
		TooltipManager.registerOpening(this.oTooltipA);
		assert.ok(TooltipManager._getRegistry().has(this.oTooltipA), "registered");
		TooltipManager.deregister(this.oTooltipA);
		assert.notOk(TooltipManager._getRegistry().has(this.oTooltipA),
			"removed after deregister");
	});

	QUnit.test("closeOthers closes every registered tooltip except the given one", function (assert) {
		TooltipManager.registerOpening(this.oTooltipA);
		TooltipManager._getRegistry().add(this.oTooltipB);
		this.oCloseStub.resetHistory();

		TooltipManager.closeOthers(this.oTooltipB);

		assert.ok(this.oCloseStub.called, "close was called");
		// The set iteration order matches insertion order, so first close ⇒ A.
		assert.strictEqual(this.oCloseStub.firstCall.thisValue, this.oTooltipA,
			"closed the other tooltip");
		assert.strictEqual(this.oCloseStub.firstCall.args[0],
			TooltipManager.HANDOFF_DELAY_MS,
			"closed with the handoff delay");
	});

	QUnit.test("close on a null tooltip is a no-op", function (assert) {
		TooltipManager.close(null, false);
		assert.notOk(this.oCloseStub.called, "no close call");
	});
});
