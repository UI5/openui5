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

		QUnit.test("get() exposes and normalizes submenu entries", function(assert) {
			// A plugin whose menu item carries a submenu with function-valued fields (like the variant switch actions)
			const oPlugin = this.oRta._oDesignTime.getPlugins()[0];
			sandbox.stub(oPlugin, "getMenuItems").returns([{
				id: "CTX_TEST_SWITCH",
				text: "Switch",
				rank: 10,
				handler() {},
				submenu: [
					{
						id: "variant1",
						text: () => "Variant 1",
						icon: "sap-icon://accept",
						enabled: () => false,
						someInternalField: "should-be-stripped"
					},
					{
						id: "variant2",
						text: "Variant 2",
						icon: "blank",
						enabled: true
					}
				]
			}]);

			return this.oActionService.get(this.oGroupOverlay.getId()).then(function(aActions) {
				const oSwitchAction = aActions.find((mAction) => mAction.id === "CTX_TEST_SWITCH");
				assert.ok(oSwitchAction, "the action carrying the submenu is exposed");
				assert.ok(Array.isArray(oSwitchAction.submenu), "the submenu is exposed as an array");
				assert.strictEqual(oSwitchAction.submenu.length, 2, "both submenu entries are exposed");

				const oFirst = oSwitchAction.submenu[0];
				assert.strictEqual(oFirst.id, "variant1", "the submenu entry id (target key) is preserved");
				assert.strictEqual(oFirst.text, "Variant 1", "a function-valued text is resolved to its value");
				assert.strictEqual(oFirst.enabled, false, "a function-valued enabled is resolved to its value");
				assert.strictEqual(oFirst.icon, "sap-icon://accept", "the icon is preserved");
				assert.notOk(
					oFirst.hasOwnProperty("someInternalField"),
					"internal fields are stripped from submenu entries"
				);

				assert.strictEqual(oSwitchAction.submenu[1].id, "variant2", "the second target key is preserved");
				assert.strictEqual(oSwitchAction.submenu[1].enabled, true, "a plain enabled value is preserved");
			});
		});

		QUnit.test("get() exposes the agentic action metadata fields", function(assert) {
			// Plugins may attach programmatic-consumption metadata to their menu items (see sap.ui.dt.Plugin#_getMenuItems).
			const fnCreateCommands = function() {};
			const fnGetContext = function() {};
			const aParameters = [
				{ name: "fragmentPath", type: "string", required: true, description: "Path to the fragment" }
			];
			const oPlugin = this.oRta._oDesignTime.getPlugins()[0];
			sandbox.stub(oPlugin, "getMenuItems").returns([{
				id: "CTX_TEST_AGENTIC",
				text: "Agentic Action",
				rank: 10,
				handler() {},
				description: "does the thing",
				parameters: aParameters,
				createCommands: fnCreateCommands,
				getContext: fnGetContext,
				someInternalField: "should-be-stripped"
			}]);

			return this.oActionService.get(this.oGroupOverlay.getId()).then(function(aActions) {
				const oAction = aActions.find((mAction) => mAction.id === "CTX_TEST_AGENTIC");
				assert.ok(oAction, "the action is exposed");
				assert.strictEqual(oAction.description, "does the thing", "the description is exposed");
				assert.strictEqual(oAction.parameters, aParameters, "the parameters are exposed");
				assert.strictEqual(oAction.createCommands, fnCreateCommands, "createCommands is exposed");
				assert.strictEqual(oAction.getContext, fnGetContext, "getContext is exposed");
				assert.notOk(
					oAction.hasOwnProperty("someInternalField"),
					"internal fields are still stripped"
				);
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
			const mPropertyBag = oHandlerStub.firstCall.args[1];
			assert.strictEqual(mPropertyBag.menuItem.id, "CTX_REMOVE", "the handler was called with the remove item");
			assert.strictEqual(
				mPropertyBag.contextElement,
				this.oGroupOverlay.getElement(),
				"the handler received the contextElement matching the targeted overlay"
			);
		});

		QUnit.test("execute() forwards the payload to the handler", async function(assert) {
			const oHandlerStub = sandbox.stub(Remove.prototype, "handler").resolves();
			const mPayload = { key: "variant-id-42", extra: "abc" };
			await this.oActionService.execute(this.oGroupOverlay.getId(), "CTX_REMOVE", mPayload);
			assert.ok(oHandlerStub.calledOnce, "the handler was called");
			assert.deepEqual(
				oHandlerStub.firstCall.args[1].payload,
				mPayload,
				"the third argument to execute() is forwarded verbatim as mPropertyBag.payload"
			);
		});

		QUnit.test("execute() without payload leaves mPropertyBag.payload undefined", async function(assert) {
			const oHandlerStub = sandbox.stub(Remove.prototype, "handler").resolves();
			await this.oActionService.execute(this.oGroupOverlay.getId(), "CTX_REMOVE");
			assert.strictEqual(
				oHandlerStub.firstCall.args[1].payload,
				undefined,
				"payload is undefined when no third argument is passed"
			);
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