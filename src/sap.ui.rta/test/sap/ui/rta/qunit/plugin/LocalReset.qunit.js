/* global QUnit */

sap.ui.define([
	"sap/m/MessageToast",
	"sap/m/VBox",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/dt/DesignTime",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/dt/Util",
	"sap/ui/fl/apply/api/ControlVariantApplyAPI",
	"sap/ui/fl/write/api/ChangesWriteAPI",
	"sap/ui/fl/write/api/LocalResetAPI",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/rta/command/CommandFactory",
	"sap/ui/rta/plugin/LocalReset",
	"sap/ui/thirdparty/sinon-4",
	"test-resources/sap/ui/rta/qunit/RtaQunitUtils"
], function(
	MessageToast,
	VBox,
	JsControlTreeModifier,
	DesignTime,
	OverlayRegistry,
	DtUtil,
	ControlVariantApplyAPI,
	ChangesWriteAPI,
	LocalResetAPI,
	nextUIUpdate,
	CommandFactory,
	LocalResetPlugin,
	sinon,
	RtaQunitUtils
) {
	"use strict";

	var sandbox = sinon.createSandbox();

	async function getMenuEntryAndCheck(assert, oOverlay, oAssertions) {
		this.oLocalResetPlugin.deregisterElementOverlay(oOverlay);
		this.oLocalResetPlugin.registerElementOverlay(oOverlay);

		await DtUtil.waitForSynced(this.oDesignTime)();
		const bIsEditable = await this.oLocalResetPlugin._isEditable(oOverlay);
		assert.strictEqual(bIsEditable, oAssertions.editable, "then the editable property is correct");
		if (oAssertions.available !== undefined) {
			assert.strictEqual(this.oLocalResetPlugin.isAvailable([oOverlay], {}), oAssertions.available, "then available is correct");
		}

		const oMenuItem = (await this.oLocalResetPlugin.getMenuItems([oOverlay]))[0];
		if (oMenuItem) {
			if (typeof oMenuItem.enabled === "function") {
				assert.strictEqual(oMenuItem.enabled([oOverlay], oMenuItem), oAssertions.enabled, "then the enabled property is correct");
			} else {
				assert.strictEqual(oMenuItem.enabled, oAssertions.enabled, "then the enabled property is correct");
			}
		}
		return oMenuItem;
	}

	QUnit.module("Given a designTime and localReset plugin are instantiated", {
		async beforeEach(assert) {
			var done = assert.async();
			this.oMockedAppComponent = RtaQunitUtils.createAndStubAppComponent(sandbox);
			sandbox.stub(this.oMockedAppComponent, "getModel").returns(this.oVariantModel);
			sandbox.stub(ChangesWriteAPI, "getChangeHandler").resolves();

			this.oLocalResetPlugin = new LocalResetPlugin({
				commandFactory: new CommandFactory()
			});
			this.oNestedForm = new VBox("fakedNestedForm");
			this.oSimpleForm = new VBox("fakedSimpleForm", {
				items: [this.oNestedForm]
			});
			this.oSimpleForm.placeAt("qunit-fixture");
			await nextUIUpdate();

			this.oDesignTime = new DesignTime({
				rootElements: [this.oSimpleForm],
				plugins: [this.oLocalResetPlugin]
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				this.oSimpleFormOverlay = OverlayRegistry.getOverlay(this.oSimpleForm);
				this.oNestedFormOverlay = OverlayRegistry.getOverlay(this.oNestedForm);
				done();
			}.bind(this));
		},
		afterEach() {
			sandbox.restore();
			this.oMockedAppComponent.destroy();
			this.oDesignTime.destroy();
			this.oSimpleForm.destroy();
		}
	}, function() {
		QUnit.test("when an overlay has no localReset action designTime metadata", async function(assert) {
			this.oSimpleFormOverlay.setDesignTimeMetadata({});

			await getMenuEntryAndCheck.call(this, assert, this.oSimpleFormOverlay, {
				editable: false,
				enabled: false
			});
		});

		QUnit.test("when an overlay has localReset action designTime metadata, but has no isEnabled property defined", async function(assert) {
			sandbox.stub(LocalResetAPI, "isResetEnabled").returns(true);

			this.oSimpleFormOverlay.setDesignTimeMetadata({
				actions: {
					localReset: {
						changeType: "localReset"
					}
				}
			});

			await getMenuEntryAndCheck.call(this, assert, this.oSimpleFormOverlay, {
				editable: true,
				enabled: true
			});
		});

		QUnit.test("when an overlay has localReset action designTime metadata, and isEnabled property is boolean", async function(assert) {
			sandbox.stub(LocalResetAPI, "isResetEnabled").returns(true);

			this.oSimpleFormOverlay.setDesignTimeMetadata({
				actions: {
					localReset: {
						changeType: "localReset",
						isEnabled: false
					}
				}
			});

			await getMenuEntryAndCheck.call(this, assert, this.oSimpleFormOverlay, {
				editable: true,
				enabled: false
			});
		});

		QUnit.test("when an overlay has localReset action designTime metadata, and isEnabled is a function", async function(assert) {
			sandbox.stub(LocalResetAPI, "isResetEnabled").returns(true);

			this.oSimpleFormOverlay.setDesignTimeMetadata({
				actions: {
					localReset: {
						changeType: "localReset",
						isEnabled(oElementInstance) {
							return oElementInstance.getMetadata().getName() !== "sap.m.VBox";
						}
					}
				}
			});

			await getMenuEntryAndCheck.call(this, assert, this.oSimpleFormOverlay, {
				editable: true,
				enabled: false
			});
		});

		QUnit.test("when an overlay has localReset action designTime metadata but no stable id", async function(assert) {
			sandbox.stub(LocalResetAPI, "isResetEnabled").returns(true);
			this.oSimpleFormOverlay.data("hasStableId", false);

			this.oSimpleFormOverlay.setDesignTimeMetadata({
				actions: {
					localReset: {
						changeType: "localReset"
					}
				}
			});

			await getMenuEntryAndCheck.call(this, assert, this.oSimpleFormOverlay, {
				editable: false,
				enabled: false
			});
		});

		QUnit.test("when an overlay has localReset action designTime metadata, and isEnabled is function set to true, but there are no changes for localReset", async function(assert) {
			sandbox.stub(LocalResetAPI, "isResetEnabled").returns(false);

			this.oSimpleFormOverlay.setDesignTimeMetadata({
				actions: {
					localReset: {
						changeType: "localReset",
						isEnabled(oElementInstance) {
							return oElementInstance.getMetadata().getName() === "sap.ui.core.Control";
						}
					}
				}
			});

			await getMenuEntryAndCheck.call(this, assert, this.oSimpleFormOverlay, {
				editable: true,
				enabled: false
			});
		});

		QUnit.test("when handler and getMenuItems is called for an overlay with localReset action designTime metadata, and isEnabled property is boolean", async function(assert) {
			sandbox.stub(LocalResetAPI, "isResetEnabled").returns(true);

			this.oSimpleFormOverlay.setDesignTimeMetadata({
				actions: {
					localReset: {
						isEnabled: false
					}
				}
			});

			sandbox.stub(this.oLocalResetPlugin, "isAvailable").returns(true);
			const oHandlerStub = sandbox.stub(this.oLocalResetPlugin, "handler");
			const oIsEnabledSpy = sandbox.spy(this.oLocalResetPlugin, "isEnabled");

			const oMenuItem = await getMenuEntryAndCheck.call(this, assert, this.oSimpleFormOverlay, {
				editable: true,
				enabled: false
			});
			assert.strictEqual(
				oIsEnabledSpy.args[0][0][0].getId(),
				this.oSimpleFormOverlay.getId(),
				"... and isEnabled is called with the correct overlay"
			);

			assert.strictEqual(oMenuItem.id, "CTX_LOCAL_RESET", "'getMenuItems' returns the context menu item for the plugin");

			oMenuItem.handler([this.oSimpleFormOverlay]);
			assert.deepEqual(oHandlerStub.args[0][0], [this.oSimpleFormOverlay], "the 'handler' method is called with the right overlays");
		});

		QUnit.test("when the isEnabled check is called with an element where changeOnRelevantContainer is true", async function(assert) {
			this.oNestedFormOverlay.setDesignTimeMetadata({
				actions: {
					localReset: {
						changeType: "localReset",
						changeOnRelevantContainer: true
					}
				}
			});
			const oIsEnabledStub = sandbox.stub(LocalResetAPI, "isResetEnabled").returns(true);
			sandbox.stub(this.oLocalResetPlugin, "isAvailable").returns(true);
			await getMenuEntryAndCheck.call(this, assert, this.oNestedFormOverlay, {
				editable: true,
				enabled: true
			});

			assert.strictEqual(
				oIsEnabledStub.args[0][0].getId(),
				this.oSimpleForm.getId(),
				"then isEnabled is called with the parent overlay"
			);
		});

		QUnit.test("when the plugin handler is called for a local reset on a variant", function(assert) {
			var oCommandFactoryStub = sandbox.stub(this.oLocalResetPlugin.getCommandFactory(), "getCommandFor");
			sandbox.stub(this.oLocalResetPlugin, "getVariantManagementReference").returns("variantManagement1");
			sandbox.stub(ControlVariantApplyAPI, "getVariantManagementControlByVMReference")
			.withArgs("variantManagement1", this.oMockedAppComponent)
			.returns({
				getCurrentVariantReference() {
					return "variant1";
				}
			});
			sandbox.stub(JsControlTreeModifier, "bySelector");
			var oMessageToastSpy = sandbox.stub(MessageToast, "show");
			return this.oLocalResetPlugin.handler([this.oSimpleFormOverlay]).then(function() {
				assert.strictEqual(
					oCommandFactoryStub.firstCall.args[1], "localReset", "then a local reset command is added to the composite command"
				);
				assert.strictEqual(
					oCommandFactoryStub.secondCall.args[1], "save", "then a save variant command is added to the composite command"
				);
				assert.ok(oMessageToastSpy.called, "then a message toast is shown");
			});
		});

		QUnit.test("when the plugin handler is called for a local reset without a variant", function(assert) {
			var oCommandFactoryStub = sandbox.stub(this.oLocalResetPlugin.getCommandFactory(), "getCommandFor");
			var oMessageToastSpy = sandbox.stub(MessageToast, "show");
			return this.oLocalResetPlugin.handler([this.oSimpleFormOverlay]).then(function() {
				assert.strictEqual(
					oCommandFactoryStub.firstCall.args[1], "localReset", "then a local reset command is added to the composite command"
				);
				assert.strictEqual(oCommandFactoryStub.callCount, 1, "then no save variant command is added to the composite command");
				assert.ok(oMessageToastSpy.notCalled, "then no message toast is shown");
			});
		});

		QUnit.test("when getParameters is called", function(assert) {
			assert.deepEqual(this.oLocalResetPlugin.getParameters(), [], "then no parameters are required for local reset");
		});

		QUnit.test("when createCommands is called directly", async function(assert) {
			const oExpectedCommand = {};
			const oHandlerStub = sandbox.stub(this.oLocalResetPlugin, "handler").resolves(oExpectedCommand);

			const vResult = await this.oLocalResetPlugin.createCommands(this.oSimpleFormOverlay);

			assert.strictEqual(oHandlerStub.callCount, 1, "then the handler is invoked");
			assert.deepEqual(
				oHandlerStub.getCall(0).args[0],
				[this.oSimpleFormOverlay],
				"then the handler is called with the overlay wrapped in an array"
			);
			assert.strictEqual(vResult, oExpectedCommand, "then createCommands returns the handler result");
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});