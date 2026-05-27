/* global QUnit */

sap.ui.define([
	"sap/base/util/deepEqual",
	"sap/m/Button",
	"sap/m/Page",
	"sap/ui/core/ComponentContainer",
	"sap/ui/core/Element",
	"sap/ui/core/UIComponent",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/rta/plugin/Plugin",
	"sap/ui/rta/plugin/Remove",
	"sap/ui/rta/RuntimeAuthoring",
	"sap/ui/thirdparty/sinon-4",
	"test-resources/sap/ui/rta/qunit/RtaQunitUtils"
], function(
	deepEqual,
	Button,
	Page,
	ComponentContainer,
	Element,
	UIComponent,
	OverlayRegistry,
	BasePlugin,
	Remove,
	RuntimeAuthoring,
	sinon,
	RtaQunitUtils
) {
	"use strict";

	const sandbox = sinon.createSandbox();

	QUnit.module("basic functionality", {
		async before() {
			QUnit.config.fixture = null;
			this.oComponentContainer = await RtaQunitUtils.renderTestAppAtAsync("qunit-fixture");
			this.oComponent = this.oComponentContainer.getComponentInstance();
			const oView = Element.getElementById("Comp1---idMain1");
			await oView.getController().isDataReady();
		},
		async beforeEach() {
			this.oRta = new RuntimeAuthoring({
				showToolbars: false,
				rootControl: this.oComponent
			});

			await this.oRta.start();
			this.oActionService = await this.oRta.getService("action");
			this.oGroupOverlay = OverlayRegistry.getOverlay("Comp1---idMain1--GeneralLedgerDocument");
		},
		afterEach() {
			this.oRta.destroy();
			sandbox.restore();
		},
		after() {
			QUnit.config.fixture = "";
			this.oComponentContainer.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("get()", function(assert) {
			return this.oActionService.get(this.oGroupOverlay.getId()).then(function(aActions) {
				assert.ok(Array.isArray(aActions));
				assert.strictEqual(aActions.length, 6, "6 actions are available for the given control");
				assert.strictEqual(aActions[0].id, "CTX_RENAME", "the first action is the rename action");
				assert.strictEqual(aActions[1].id, "CTX_ADD_ELEMENTS_AS_CHILD", "the second action is the add action");
				assert.strictEqual(aActions[2].id, "CTX_CREATE_SIBLING_CONTAINER", "the third action is the create container action");
				assert.strictEqual(aActions[3].id, "CTX_REMOVE", "the fourth action is the remove action");
				assert.strictEqual(aActions[4].id, "CTX_CUT", "the fifth action is the cut action");
				assert.strictEqual(aActions[5].id, "CTX_PASTE", "the sixth action is the paste action");
			});
		});

		QUnit.test("get() with non-existent control/non under RTA control", function(assert) {
			return this.oActionService.get([this.oGroupOverlay.getId(), "fakeControl"]).then(
				function() {
					assert.ok(false, "this must never be called");
				},
				function() {
					assert.ok(true);
				}
			);
		});

		QUnit.test("execute()", async function(assert) {
			const oHandlerStub = sandbox.stub(Remove.prototype, "handler").resolves();
			await this.oActionService.execute(this.oGroupOverlay.getId(), "CTX_REMOVE");
			assert.ok(oHandlerStub.calledOnce, "the handler of the remove action was called");
			assert.strictEqual(oHandlerStub.firstCall.args[0][0], this.oGroupOverlay, "the handler was called with the correct overlay");
			assert.strictEqual(oHandlerStub.firstCall.args[1].menuItem.id, "CTX_REMOVE", "the handler was called with the remove item");
		});

		QUnit.test("execute() with non-existent control/non under RTA control", function(assert) {
			return this.oActionService.execute([this.oGroupOverlay.getId(), "fakeControl"], "CTX_REMOVE").then(
				function() {
					assert.ok(false, "this must never be called");
				},
				function() {
					assert.ok(true);
				}
			);
		});

		QUnit.test("execute() with non-existent action", function(assert) {
			return this.oActionService.execute(this.oGroupOverlay.getId(), "fakeAction").then(
				function() {
					assert.ok(false, "this must never be called");
				},
				function() {
					assert.ok(true);
				}
			);
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});