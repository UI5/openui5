/* global QUnit */

sap.ui.define([
	"sap/base/Log",
	"sap/m/MessageBox",
	"sap/ui/core/mvc/XMLView",
	"sap/ui/core/support/Plugin",
	"sap/ui/core/support/Support",
	"sap/ui/core/util/File",
	"sap/ui/fl/support/diagnostics/FlexibilityDataExtractor",
	"sap/ui/fl/support/diagnostics/FlexibilityPlugin",
	"sap/ui/model/json/JSONModel",
	"sap/ui/thirdparty/sinon-4"
], function(
	Log,
	MessageBox,
	XMLView,
	Plugin,
	Support,
	File,
	FlexibilityDataExtractor,
	FlexibilityPlugin,
	JSONModel,
	sinon
) {
	"use strict";

	const oSandbox = sinon.createSandbox();
	document.getElementById("qunit-fixture").style.display = "none";

	QUnit.module("sap.ui.fl.support.diagnostics.FlexibilityPlugin", {
		beforeEach() {
			this.oSupportStub = {
				attachEvent: oSandbox.stub(),
				detachEvent: oSandbox.stub(),
				isToolStub: oSandbox.stub(),
				sendEvent: oSandbox.stub()
			};
		},

		afterEach() {
			oSandbox.restore();
			if (this.oPlugin) {
				this.oPlugin.destroy();
			}
		}
	});

	QUnit.test("constructor - creates plugin with correct parameters", function(assert) {
		this.oPlugin = new FlexibilityPlugin(this.oSupportStub);

		assert.ok(this.oPlugin instanceof Plugin, "Plugin extends sap.ui.core.support.Plugin");
		assert.strictEqual(this.oPlugin.getId(), "sapUiSupportFlexibilityPlugin", "Plugin has correct ID");
		assert.strictEqual(this.oPlugin.getTitle(), "Flexibility", "Plugin has correct title");
		assert.strictEqual(this.oPlugin._oStub, this.oSupportStub, "Support stub is stored correctly");
	});

	QUnit.test("constructor - sets correct event IDs for tool plugin", function(assert) {
		oSandbox.stub(Plugin.prototype, "runsAsToolPlugin").returns(true);

		this.oPlugin = new FlexibilityPlugin(this.oSupportStub);

		assert.deepEqual(this.oPlugin._aEventIds, [
			"sapUiSupportFlexibilityPluginSetData"
		], "Tool plugin has correct event IDs");
	});

	QUnit.test("constructor - sets correct event IDs for application plugin", function(assert) {
		oSandbox.stub(Plugin.prototype, "runsAsToolPlugin").returns(false);

		this.oPlugin = new FlexibilityPlugin(this.oSupportStub);

		assert.deepEqual(this.oPlugin._aEventIds, [
			"sapUiSupportFlexibilityPluginGetData"
		], "Application plugin has correct event IDs");
	});

	QUnit.test("init - tool plugin initialization", async function(assert) {
		const oMockView = {
			placeAt: oSandbox.stub(),
			setModel: oSandbox.stub()
		};

		oSandbox.stub(Support, "getStub").returns({
			sendEvent: oSandbox.stub()
		});
		oSandbox.stub(XMLView, "create").resolves(oMockView);
		this.oSupportStub.isToolStub.returns(true);

		this.oPlugin = new FlexibilityPlugin(this.oSupportStub);
		oSandbox.stub(this.oPlugin, "$").returns({
			get: oSandbox.stub().returns({})
		});

		await this.oPlugin.init(this.oSupportStub);

		assert.ok(this.oPlugin.oFlexDataModel instanceof JSONModel, "Flex data model is created");
		assert.ok(this.oPlugin.oToolSettingsModel instanceof JSONModel, "Tool settings model is created");
		assert.strictEqual(this.oPlugin.oToolSettingsModel.getData().anonymizeData, true, "Anonymize data is true by default");
		assert.strictEqual(this.oPlugin.oToolSettingsModel.getData().exportFullData, true, "Export full data is true by default");
		assert.ok(XMLView.create.calledOnce, "XMLView is created");
		assert.ok(oMockView.placeAt.calledWith({}), "View is placed correctly");
	});

	QUnit.test("init - application plugin initialization", function(assert) {
		this.oSupportStub.isToolStub.returns(false);
		this.oPlugin = new FlexibilityPlugin(this.oSupportStub);

		this.oPlugin.init(this.oSupportStub);

		assert.ok(true, "Application plugin initializes without errors");
	});

	QUnit.test("sendGetDataEvent - sends event with anonymization and reduced data settings", function(assert) {
		oSandbox.stub(Support, "getStub").returns({
			sendEvent: oSandbox.stub()
		});
		this.oPlugin = new FlexibilityPlugin(this.oSupportStub);

		this.oPlugin.sendGetDataEvent(true, false);

		assert.ok(
			Support.getStub().sendEvent.calledWith(
				"sapUiSupportFlexibilityPluginGetData",
				{ anonymizeData: true, exportFullData: false }
			),
			"GetData event is sent with anonymization and reduced data"
		);
	});

	QUnit.test("onsapUiSupportFlexibilityPluginGetData - extracts and sends flex data", async function(assert) {
		const oMockFlexData = {
			changes: [],
			variants: [],
			metadata: {}
		};
		const oMockEvent = {
			getParameter: oSandbox.stub().returns(true)
		};
		oSandbox.stub(FlexibilityDataExtractor, "extractFlexibilityData").resolves(oMockFlexData);
		this.oPlugin = new FlexibilityPlugin(this.oSupportStub);

		await this.oPlugin.onsapUiSupportFlexibilityPluginGetData(oMockEvent);

		assert.ok(oMockEvent.getParameter.calledWith("anonymizeData"), "First Event parameter is retrieved");
		assert.ok(oMockEvent.getParameter.calledWith("exportFullData"), "Second Event parameter is retrieved");
		assert.ok(
			FlexibilityDataExtractor.extractFlexibilityData.calledWith(true, true),
			"FlexibilityDataExtractor is called with anonymization and full data"
		);
		assert.ok(
			this.oSupportStub.sendEvent.calledWith("sapUiSupportFlexibilityPluginSetData", oMockFlexData),
			"Flex data is sent correctly"
		);
	});

	QUnit.test("onsapUiSupportFlexibilityPluginGetData - handles extraction error", async function(assert) {
		const oError = new Error("No application component found");
		const oMockEvent = {
			getParameter: oSandbox.stub().returns(false)
		};
		oSandbox.stub(FlexibilityDataExtractor, "extractFlexibilityData").rejects(oError);
		const oLogErrorStub = oSandbox.stub(Log, "error");
		const oMessageBoxStub = oSandbox.stub(MessageBox, "error");
		this.oPlugin = new FlexibilityPlugin(this.oSupportStub);

		await this.oPlugin.onsapUiSupportFlexibilityPluginGetData(oMockEvent);

		assert.ok(
			FlexibilityDataExtractor.extractFlexibilityData.calledWith(false),
			"FlexibilityDataExtractor is called with correct anonymization"
		);
		assert.ok(this.oSupportStub.sendEvent.notCalled, "No event is sent when extraction fails");
		assert.ok(oLogErrorStub.calledOnce, "Log.error is called once");
		assert.ok(oMessageBoxStub.calledWith("Flexibility data could not be retrieved"), "Error message is shown");
		assert.ok(
			oLogErrorStub.calledWith("Error extracting flexibility data: ", oError),
			"Log.error is called with correct parameters"
		);
	});

	QUnit.test("onsapUiSupportFlexibilityPluginSetData - sets data to model and downloads file", function(assert) {
		const oMockFlexData = {
			changes: [],
			variants: [],
			metadata: {}
		};
		const oMockEvent = {
			getParameters: oSandbox.stub().returns(oMockFlexData)
		};
		const oFileSaveStub = oSandbox.stub(File, "save");

		this.oPlugin = new FlexibilityPlugin(this.oSupportStub);
		this.oPlugin.oFlexDataModel = new JSONModel();
		oSandbox.spy(this.oPlugin.oFlexDataModel, "setData");

		this.oPlugin.onsapUiSupportFlexibilityPluginSetData(oMockEvent);

		assert.ok(oMockEvent.getParameters.calledOnce, "Event parameters are retrieved");
		assert.ok(this.oPlugin.oFlexDataModel.setData.calledWith(oMockFlexData), "Flex data is set to model");
		assert.ok(oFileSaveStub.calledOnce, "File.save is called");
		assert.ok(oFileSaveStub.calledWith(
			JSON.stringify(oMockFlexData, null, 2),
			"flexibilitySupportData",
			"json"
		), "File is saved with correct parameters");
	});

	QUnit.test("onsapUiSupportFlexibilityPluginSetData - handles empty data", function(assert) {
		const oMockEvent = {
			getParameters: oSandbox.stub().returns({})
		};
		const oMessageBoxStub = oSandbox.stub(MessageBox, "error");
		const oFileSaveStub = oSandbox.stub(File, "save");

		this.oPlugin = new FlexibilityPlugin(this.oSupportStub);
		this.oPlugin.oFlexDataModel = new JSONModel();

		this.oPlugin.onsapUiSupportFlexibilityPluginSetData(oMockEvent);

		assert.ok(oMessageBoxStub.calledWith("Flexibility data could not be retrieved"), "Error message is shown");
		assert.ok(oFileSaveStub.notCalled, "File is not saved when data is empty");
	});

	QUnit.test("onsapUiSupportFlexibilityPluginSetData - handles file save error", function(assert) {
		const oMockFlexData = {
			changes: [],
			variants: [],
			metadata: {}
		};
		const oMockEvent = {
			getParameters: oSandbox.stub().returns(oMockFlexData)
		};
		const oError = new Error("Save failed");
		const oFileSaveStub = oSandbox.stub(File, "save").throws(oError);
		const oMessageBoxStub = oSandbox.stub(MessageBox, "error");

		this.oPlugin = new FlexibilityPlugin(this.oSupportStub);
		this.oPlugin.oFlexDataModel = new JSONModel();

		this.oPlugin.onsapUiSupportFlexibilityPluginSetData(oMockEvent);

		assert.ok(oFileSaveStub.calledOnce, "File.save is attempted");
		assert.ok(
			oMessageBoxStub.calledWith("Error downloading flexibility support data"),
			"Error message is shown"
		);
	});

	QUnit.test("exit - calls parent exit method", function(assert) {
		this.oPlugin = new FlexibilityPlugin(this.oSupportStub);
		oSandbox.spy(Plugin.prototype, "exit");

		this.oPlugin.exit(this.oSupportStub);

		assert.ok(Plugin.prototype.exit.calledOnce, "Parent exit method is called");
	});

	QUnit.test("renderToolPlugin - creates correct DOM structure", async function(assert) {
		const oMockView = {
			placeAt: oSandbox.stub(),
			setModel: oSandbox.stub()
		};
		const oMockDomElement = {};

		oSandbox.stub(XMLView, "create").resolves(oMockView);

		this.oPlugin = new FlexibilityPlugin(this.oSupportStub);
		this.oPlugin.oFlexDataModel = new JSONModel();
		this.oPlugin.oToolSettingsModel = new JSONModel();
		oSandbox.stub(this.oPlugin, "$").returns({
			get: oSandbox.stub().returns(oMockDomElement)
		});

		this.oSupportStub.isToolStub.returns(true);

		await this.oPlugin.init(this.oSupportStub);

		assert.ok(XMLView.create.calledWith({
			viewName: "sap.ui.fl.support.diagnostics.Flexibility",
			viewData: {
				plugin: this.oPlugin
			}
		}), "XMLView is created with correct parameters");
		assert.ok(oMockView.placeAt.calledWith(oMockDomElement), "View is placed in correct container");
		assert.ok(oMockView.setModel.calledWith(this.oPlugin.oFlexDataModel, "flexData"), "Flex data model is set");
		assert.ok(oMockView.setModel.calledWith(this.oPlugin.oToolSettingsModel, "flexToolSettings"), "Tool settings model is set");
	});

	QUnit.test("exit - destroys models and view when exit is called", function(assert) {
		const oMockView = {
			destroy: oSandbox.stub()
		};
		const oMockFlexDataModel = {
			destroy: oSandbox.stub()
		};
		const oMockToolSettingsModel = {
			destroy: oSandbox.stub()
		};

		this.oPlugin = new FlexibilityPlugin(this.oSupportStub);
		this.oPlugin.oView = oMockView;
		this.oPlugin.oFlexDataModel = oMockFlexDataModel;
		this.oPlugin.oToolSettingsModel = oMockToolSettingsModel;

		oSandbox.stub(Plugin.prototype, "exit");

		this.oPlugin.exit();

		assert.ok(oMockView.destroy.calledOnce, "View is destroyed");
		assert.ok(oMockFlexDataModel.destroy.calledOnce, "Flex data model is destroyed");
		assert.ok(oMockToolSettingsModel.destroy.calledOnce, "Tool settings model is destroyed");
		assert.ok(Plugin.prototype.exit.calledOnce, "Parent exit method is called");
	});

	QUnit.test("integration - full workflow from application to tool plugin", async function(assert) {
		const oMockFlexData = {
			changes: [{ id: "change1" }],
			variants: [{ id: "variant1" }],
			metadata: { version: "1.0" }
		};
		const oMockEvent = {
			getParameter: oSandbox.stub().returns(true)
		};

		oSandbox.stub(FlexibilityDataExtractor, "extractFlexibilityData").resolves(oMockFlexData);
		oSandbox.stub(File, "save");

		// Create application plugin
		const oAppSupportStub = {
			isToolStub: oSandbox.stub().returns(false),
			attachEvent: oSandbox.stub(),
			detachEvent: oSandbox.stub(),
			sendEvent: oSandbox.stub()
		};
		const oAppPlugin = new FlexibilityPlugin(oAppSupportStub);

		// Create tool plugin
		const oToolSupportStub = {
			isToolStub: oSandbox.stub().returns(true),
			attachEvent: oSandbox.stub(),
			detachEvent: oSandbox.stub(),
			sendEvent: oSandbox.stub()
		};
		oSandbox.stub(XMLView, "create").resolves({
			placeAt: oSandbox.stub(),
			setModel: oSandbox.stub()
		});

		const oToolPlugin = new FlexibilityPlugin(oToolSupportStub);
		oSandbox.stub(oToolPlugin, "$").returns({
			get: oSandbox.stub().returns({})
		});

		await oToolPlugin.init(oToolSupportStub);

		// Simulate application plugin getting data request
		await oAppPlugin.onsapUiSupportFlexibilityPluginGetData(oMockEvent);

		// Simulate tool plugin receiving data
		const oMockSetDataEvent = {
			getParameters: oSandbox.stub().returns(oMockFlexData)
		};
		oToolPlugin.onsapUiSupportFlexibilityPluginSetData(oMockSetDataEvent);

		assert.ok(
			FlexibilityDataExtractor.extractFlexibilityData.calledWith(true),
			"Data extraction is called with anonymization"
		);
		assert.ok(
			oAppSupportStub.sendEvent.calledWith("sapUiSupportFlexibilityPluginSetData", oMockFlexData),
			"Application sends data"
		);
		assert.deepEqual(
			oToolPlugin.oFlexDataModel.getData(), oMockFlexData,
			"Tool plugin receives and stores data correctly"
		);

		oAppPlugin.destroy();
		oToolPlugin.destroy();
	});
});