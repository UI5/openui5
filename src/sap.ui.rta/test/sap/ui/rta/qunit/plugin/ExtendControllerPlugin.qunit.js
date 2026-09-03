/* global QUnit */
sap.ui.define([
	"sap/ui/core/mvc/XMLView",
	"sap/ui/core/Component",
	"sap/ui/core/Lib",
	"sap/ui/dt/DesignTime",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/dt/Util",
	"sap/ui/fl/Layer",
	"sap/ui/fl/Utils",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/rta/command/CommandFactory",
	"sap/ui/rta/command/ExtendControllerCommand",
	"sap/ui/rta/plugin/ExtendControllerPlugin",
	"sap/ui/rta/plugin/Plugin",
	"sap/ui/thirdparty/sinon-4",
	"test-resources/sap/ui/rta/qunit/RtaQunitUtils"
], function(
	XMLView,
	Component,
	Lib,
	DesignTime,
	OverlayRegistry,
	Util,
	Layer,
	Utils,
	nextUIUpdate,
	CommandFactory,
	ExtendControllerCommand,
	ExtendControllerPlugin,
	Plugin,
	sinon,
	RtaQunitUtils
) {
	"use strict";

	const sandbox = sinon.createSandbox();
	const oResourceBundle = Lib.getResourceBundleFor("sap.ui.rta");

	const sXmlString =
	'<mvc:View xmlns:mvc="sap.ui.core.mvc"  xmlns:core="sap.ui.core" xmlns="sap.m">' +
		'<Panel id="panel">' +
			"<content>" +
				'<core:ExtensionPoint name="ExtensionPoint1" />' +
				'<Label id="label2" text="Panel with stable id" />' +
			"</content>" +
		"</Panel>" +
	"</mvc:View>";

	function createComponent() {
		return Component.create({
			name: "testComponent",
			id: "testComponent",
			metadata: {
				manifest: "json"
			}
		});
	}

	function createAsyncView(sViewName, oComponent) {
		return oComponent.runAsOwner(function() {
			return XMLView.create({
				id: sViewName,
				definition: sXmlString,
				async: true
			});
		});
	}

	async function beforeEachSetup(sViewId) {
		this.oComponent = await createComponent();
		this.oXmlView = await createAsyncView(sViewId, this.oComponent);
		[this.oPanel] = this.oXmlView.getContent();
		this.oXmlView.placeAt("qunit-fixture");
		await nextUIUpdate();

		this.oControllerHandlerStub = sandbox.stub().resolves({});
		sandbox.stub(this.oXmlView, "getControllerModuleName").returns("test.controller.TestController");

		this.oCommandFactory = new CommandFactory({
			flexSettings: {
				layer: Layer.CUSTOMER_BASE,
				namespace: "test.namespace"
			}
		});

		this.oExtendControllerPlugin = new ExtendControllerPlugin({
			handlerFunction: this.oControllerHandlerStub,
			commandFactory: this.oCommandFactory
		});

		this.oHasChangeHandlerStub = sandbox.stub(this.oExtendControllerPlugin, "hasChangeHandler").resolves(true);

		this.oDesignTime = new DesignTime({
			rootElements: this.oXmlView,
			plugins: [this.oExtendControllerPlugin]
		});
		await Util.waitForSynced(this.oDesignTime)();

		this.oPanelOverlay = OverlayRegistry.getOverlay(this.oPanel);
	}

	QUnit.module("ExtendControllerPlugin", {
		beforeEach() {
			return beforeEachSetup.call(this, "myView");
		},
		afterEach() {
			this.oDesignTime.destroy();
			this.oComponent.destroy();
			this.oXmlView.destroy();
			this.oExtendControllerPlugin.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("isEditable check - positive case", function(assert) {
			return this.oExtendControllerPlugin._isEditable(this.oPanelOverlay).then(function(bEditable) {
				assert.ok(bEditable, "then the Overlay is editable");
			});
		});

		QUnit.test("Menu Item, positive case", async function(assert) {
			const aMenuItems = await this.oExtendControllerPlugin.getMenuItems([this.oPanelOverlay]);
			assert.strictEqual(aMenuItems[0].icon, "sap-icon://create-form", "then the icon is set correctly");
			assert.strictEqual(
				aMenuItems[0].text,
				oResourceBundle.getText("CTX_EXTEND_CONTROLLER"),
				"then the text is set correctly"
			);
			assert.strictEqual(
				aMenuItems[0].additionalInfo,
				oResourceBundle.getText("EXTEND_CONTROLLER_RTA_CONTEXT_MENU_INFO"),
				"then the additional info is set correctly"
			);
		});

		QUnit.test("When the Action is set to null", function(assert) {
			sandbox.stub(Plugin.prototype, "getAction").returns(null);
			return this.oExtendControllerPlugin._isEditable(this.oPanelOverlay).then(function(bEditable) {
				assert.notOk(bEditable, "then the Overlay is not editable");
			});
		});

		QUnit.test("When the Action is not defined in the designtimeMetadata", function(assert) {
			sandbox.stub(Plugin.prototype, "getAction").returns(undefined);
			return this.oExtendControllerPlugin._isEditable(this.oPanelOverlay).then(function(bEditable) {
				assert.ok(bEditable, "then the Overlay is editable");
			});
		});

		QUnit.test("When the system is an S4HanaCloud system and the control is in a reuse component", async function(assert) {
			sandbox.stub(this.oExtendControllerPlugin, "isInReuseComponentOnS4HanaCloud").returns(true);

			assert.notOk(this.oExtendControllerPlugin.isEnabled([this.oPanelOverlay]), "then the action is not enabled");
			const aMenuItems = await this.oExtendControllerPlugin.getMenuItems([this.oPanelOverlay]);
			const sFoundText = oResourceBundle.getText("CTX_DISABLED_REUSE");
			assert.notStrictEqual(sFoundText, "CTX_DISABLED_REUSE", "then the text is found in the resource bundle");
			assert.strictEqual(
				aMenuItems[0].text,
				`${oResourceBundle.getText("CTX_EXTEND_CONTROLLER")} (${sFoundText})`,
				"then the menu item has the correct text"
			);
		});

		QUnit.test("When the control is not in an async view", async function(assert) {
			sandbox.stub(Utils, "getViewForControl").returns({});

			assert.notOk(this.oExtendControllerPlugin.isEnabled([this.oPanelOverlay]), "then the action is not enabled");
			const aMenuItems = await this.oExtendControllerPlugin.getMenuItems([this.oPanelOverlay]);
			const sFoundText = oResourceBundle.getText("CTX_DISABLED_NOT_ASYNC");
			assert.notStrictEqual(sFoundText, "CTX_DISABLED_NOT_ASYNC", "then the text is found in the resource bundle");
			assert.strictEqual(
				aMenuItems[0].text,
				`${oResourceBundle.getText("CTX_EXTEND_CONTROLLER")} (${sFoundText})`,
				"then the menu item has the correct text"
			);
		});

		QUnit.test("isEnabled function when not in reusable component on S4HanaCloud", function(assert) {
			const oExtendControllerPlugin = new ExtendControllerPlugin();

			sandbox.stub(this.oExtendControllerPlugin, "isInReuseComponentOnS4HanaCloud").returns(false);
			sandbox.stub(Utils, "getViewForControl").returns({ oAsyncState: { promise: Promise.resolve() } });

			// Test with one overlay
			const aElementOverlays = [{ getElement: () => {} }];
			assert.strictEqual(
				oExtendControllerPlugin.isEnabled(aElementOverlays),
				true,
				"then isEnabled returns true when there is one overlay"
			);

			// Test with no overlays
			const aNoOverlays = [];
			assert.strictEqual(
				oExtendControllerPlugin.isEnabled(aNoOverlays),
				false,
				"then isEnabled returns false when there are no overlays"
			);

			// Test with multiple overlays
			const aMultipleOverlays = [{}, {}];
			assert.strictEqual(
				oExtendControllerPlugin.isEnabled(aMultipleOverlays),
				false,
				"then isEnabled returns false when there are multiple overlays"
			);
		});

		QUnit.test("When the handler function is called and the fragment handler and the action is available", function(assert) {
			const fnDone = assert.async();

			const mPropertyBag = {
				handlerFunction: (...aArgs) => {
					assert.deepEqual(
						aArgs[0],
						this.oPanelOverlay,
						"then the overlay is passed to the fragment handler"
					);
					return {
						viewId: "myView",
						codeRef: "TestCodeRef"
					};
				}
			};

			this.oExtendControllerPlugin.attachEventOnce("elementModified", function(oEvent) {
				const oCommand = oEvent.getParameter("command");
				assert.ok(oCommand instanceof ExtendControllerCommand, "then the command is created");
				assert.strictEqual(oCommand.getSelector().id, "myView--panel", "then the selector is set correctly");
				assert.strictEqual(
					oCommand.getPreparedChange().mProperties.content.codeRef,
					"TestCodeRef",
					"then the codeRef is set correctly"
				);
				assert.notOk(
					oCommand.getPreparedChange().mProperties.content.viewId,
					"then the viewId is not set in the change content"
				);
				assert.strictEqual(
					oCommand.getPreparedChange().mProperties.flexObjectMetadata.moduleName,
					"testComponent/changes/TestCodeRef",
					"then the moduleName is set correctly"
				);

				fnDone();
			});

			this.oExtendControllerPlugin.handler([this.oPanelOverlay], mPropertyBag);
		});

		QUnit.test("When the handler function is called and the fragment handler and it returns instanceSpecific = true", function(assert) {
			const fnDone = assert.async();

			const mPropertyBag = {
				handlerFunction: (...aArgs) => {
					assert.deepEqual(
						aArgs[0],
						this.oPanelOverlay,
						"then the overlay is passed to the fragment handler"
					);
					return {
						viewId: "myView",
						codeRef: "TestCodeRef",
						instanceSpecific: true
					};
				}
			};

			this.oExtendControllerPlugin.attachEventOnce("elementModified", function(oEvent) {
				const oCommand = oEvent.getParameter("command");
				assert.ok(oCommand instanceof ExtendControllerCommand, "then the command is created");
				assert.strictEqual(oCommand.getSelector().id, "myView--panel", "then the selector is set correctly");
				assert.strictEqual(
					oCommand.getPreparedChange().mProperties.content.codeRef,
					"TestCodeRef",
					"then the codeRef is set correctly"
				);
				assert.strictEqual(
					oCommand.getPreparedChange().mProperties.content.viewId,
					"myView",
					"then the viewId is set correctly in the change content"
				);
				assert.strictEqual(
					oCommand.getPreparedChange().mProperties.flexObjectMetadata.moduleName,
					"testComponent/changes/TestCodeRef",
					"then the moduleName is set correctly"
				);

				fnDone();
			});

			this.oExtendControllerPlugin.handler([this.oPanelOverlay], mPropertyBag);
		});

		RtaQunitUtils.testGetParameters(function() {
			return this.oExtendControllerPlugin;
		}, ["codeRef", "viewId"]);

		QUnit.test("when createCommands is called directly", async function(assert) {
			const oFireStub = sandbox.stub();
			this.oExtendControllerPlugin.attachElementModified(oFireStub);

			const oCommand = await this.oExtendControllerPlugin.createCommands(this.oPanelOverlay, {
				viewId: "myView",
				codeRef: "TestCodeRef",
				instanceSpecific: true
			});

			assert.ok(oCommand instanceof ExtendControllerCommand, "then createCommands returns the ExtendController command");
			assert.strictEqual(oCommand.getSelector().id, "myView--panel", "then the selector is set correctly");
			assert.strictEqual(oFireStub.callCount, 1, "then the elementModified event is fired once");
			assert.strictEqual(oFireStub.getCall(0).args[0].getParameter("command"), oCommand, "then the fired command matches the returned command");
		});

		QUnit.test("when createCommands is called with a viewId that does not resolve", async function(assert) {
			try {
				await this.oExtendControllerPlugin.createCommands(this.oPanelOverlay, {
					viewId: "doesNotExist",
					codeRef: "TestCodeRef"
				});
				assert.ok(false, "then the promise should not resolve");
			} catch (oError) {
				assert.ok(oError instanceof Error, "then createCommands rejects with an error");
			}
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});