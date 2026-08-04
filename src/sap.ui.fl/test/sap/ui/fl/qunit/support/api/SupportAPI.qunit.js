/* global QUnit */

sap.ui.define([
	"sap/base/Log",
	"sap/base/util/Deferred",
	"sap/ui/core/Component",
	"sap/ui/core/ComponentContainer",
	"sap/ui/core/ComponentRegistry",
	"sap/ui/fl/apply/_internal/flexState/changes/UIChangesState",
	"sap/ui/fl/apply/_internal/flexState/controlVariants/VariantManagementState",
	"sap/ui/fl/apply/_internal/flexState/FlexObjectState",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/initial/_internal/ManifestUtils",
	"sap/ui/fl/initial/_internal/Settings",
	"sap/ui/fl/support/_internal/extractChangeDependencies",
	"sap/ui/fl/support/api/SupportAPI",
	"sap/ui/fl/Utils",
	"sap/m/MessageBox",
	"sap/ui/thirdparty/sinon-4"
], function(
	Log,
	Deferred,
	Component,
	ComponentContainer,
	ComponentRegistry,
	UIChangesState,
	VariantManagementState,
	FlexObjectState,
	FlexState,
	ManifestUtils,
	Settings,
	extractChangeDependencies,
	SupportAPI,
	Utils,
	MessageBox,
	sinon
) {
	"use strict";

	const sandbox = sinon.createSandbox();

	QUnit.module("Module 1: Standalone Application Scenarios (No UShell)", {
		async beforeEach() {
			const oComponent = await Component.create({
				name: "testComponentAsync",
				id: "testComponentStandalone"
			});
			this.oComponentContainer = new ComponentContainer({
				component: oComponent,
				async: true
			});
			sandbox.stub(Utils, "getUshellContainer").returns(false);
		},
		afterEach() {
			sandbox.restore();
			this.oComponentContainer.destroy();
		}
	}, function() {
		QUnit.test("getAllUIChanges - retrieves all UI changes", async function(assert) {
			const aExpectedChanges = [
				{ id: "change1", changeType: "addField" },
				{ id: "change2", changeType: "hideControl" }
			];
			sandbox.stub(UIChangesState, "getAllUIChanges").returns(aExpectedChanges);

			const aChanges = await SupportAPI.getAllUIChanges();

			assert.deepEqual(aChanges, aExpectedChanges, "Returns all UI changes");
			assert.ok(UIChangesState.getAllUIChanges.calledOnce, "getAllUIChanges was called once");
		});

		QUnit.test("getApplicationComponent - returns component in standalone", async function(assert) {
			const oComponent = await SupportAPI.getApplicationComponent();

			assert.ok(oComponent, "Component is returned");
			assert.strictEqual(oComponent.getId(), "testComponentStandalone", "Correct component ID");
		});
	});

	QUnit.module("Module 2: FLP Scenarios (with UShell and Component)", {
		async beforeEach() {
			this.oComponent = await Component.create({
				name: "testComponentAsync",
				id: "testComponentFLP"
			});
			this.oComponentContainer = new ComponentContainer({
				component: this.oComponent,
				async: true
			});
			sandbox.stub(Utils, "getUshellContainer").returns(true);
			sandbox.stub(Utils, "getUShellService")
			.withArgs("AppLifeCycle").resolves({
				getCurrentApplication: () => ({
					componentInstance: this.oComponent
				})
			});

			this.getFlexReferenceForControlSpy = sandbox.spy(ManifestUtils, "getFlexReferenceForControl");
			this.getObjectDataSelectorStub = sandbox.stub(FlexState, "getFlexObjectsDataSelector")
			.returns({
				get: () => {
					return ["objectDataSelector"];
				}
			});
			this.getDirtyFlexObjectsStub = sandbox.stub(FlexObjectState, "getDirtyFlexObjects")
			.returns(["dirtyFlexObjects"]);
			this.getCompleteDependencyMapStub = sandbox.stub(FlexObjectState, "getCompleteDependencyMap")
			.returns("completeDependencyMap");
			this.getLiveDependencyMapStub = sandbox.stub(FlexObjectState, "getLiveDependencyMap")
			.returns("liveDependencyMap");
			this.getVariantManagementMapStub = sandbox.stub(VariantManagementState, "getVariantManagementMap")
			.returns({
				get: () => {
					return "variantManagementMap";
				}
			});
			this.getAllUIChangesStub = sandbox.stub(UIChangesState, "getAllUIChanges").returns([
				{ id: "flpChange1", changeType: "rename" }
			]);
		},
		afterEach() {
			sandbox.restore();
			this.oComponentContainer.destroy();
		}
	}, function() {
		QUnit.test("getAllUIChanges - in FLP context", async function(assert) {
			const aChanges = await SupportAPI.getAllUIChanges();

			assert.ok(Array.isArray(aChanges), "Returns an array");
			assert.strictEqual(aChanges.length, 1, "Returns one change");
			assert.strictEqual(aChanges[0].id, "flpChange1", "Correct change ID");
		});

		QUnit.test("getApplicationComponent - retrieves FLP component", async function(assert) {
			const oComponent = await SupportAPI.getApplicationComponent();

			assert.ok(oComponent, "Component is returned");
			assert.strictEqual(oComponent.getId(), "testComponentFLP", "Correct FLP component ID");
		});

		QUnit.test("getFlexObjectInfos - in FLP context", async function(assert) {
			const oFlexObjectInfos = await SupportAPI.getFlexObjectInfos();

			assert.strictEqual(
				this.getFlexReferenceForControlSpy.callCount,
				1,
				"then the flex reference is fetched"
			);
			assert.strictEqual(
				this.getObjectDataSelectorStub.callCount,
				1,
				"then the object data selector is fetched"
			);
			assert.deepEqual(
				oFlexObjectInfos.allFlexObjects,
				["objectDataSelector"],
				"then the object data selectors are returned"
			);
			assert.strictEqual(
				this.getDirtyFlexObjectsStub.callCount,
				1,
				"then the dirty flex objects are fetched"
			);
			assert.strictEqual(
				this.getDirtyFlexObjectsStub.getCall(0).args[0],
				"testComponentAsync",
				"then the flex reference is passed to the dirty flex objects function"
			);
			assert.deepEqual(
				oFlexObjectInfos.dirtyFlexObjects,
				["dirtyFlexObjects"],
				"then the dirty flex objects are returned"
			);
			assert.strictEqual(
				this.getCompleteDependencyMapStub.callCount,
				1,
				"then the complete dependency map is fetched"
			);
			assert.strictEqual(
				this.getCompleteDependencyMapStub.getCall(0).args[0],
				"testComponentAsync",
				"then the flex reference is passed to the complete dependency map function"
			);
			assert.strictEqual(
				oFlexObjectInfos.completeDependencyMap,
				"completeDependencyMap",
				"then the complete dependency map is returned"
			);
			assert.strictEqual(
				this.getLiveDependencyMapStub.called,
				true,
				"then the live dependency map is fetched"
			);
			assert.strictEqual(
				this.getLiveDependencyMapStub.getCall(0).args[0],
				"testComponentAsync",
				"then the flex reference is passed to the live dependency map function"
			);
			assert.strictEqual(
				oFlexObjectInfos.liveDependencyMap,
				"liveDependencyMap",
				"then the live dependency map is returned"
			);
			assert.strictEqual(
				this.getVariantManagementMapStub.callCount,
				1,
				"then the variant management map is fetched"
			);
			assert.strictEqual(
				oFlexObjectInfos.variantManagementMap,
				"variantManagementMap",
				"then the variant management map is returned"
			);
			assert.strictEqual(
				this.getAllUIChangesStub.callCount,
				1,
				"then the all UI changes are fetched"
			);
			assert.strictEqual(
				this.getAllUIChangesStub.getCall(0).args[0],
				"testComponentAsync",
				"then the flex reference is passed to the all UI changes function"
			);
			assert.deepEqual(
				oFlexObjectInfos.allUIChanges,
				[{ id: "flpChange1", changeType: "rename" }],
				"then the all UI changes are returned"
			);
		});

		QUnit.test("getFlexSettings - in FLP context", async function(assert) {
			const oSettings = await Settings.getInstance();
			oSettings.mySampleGetter = function() {
				return "mySampleValue";
			};
			const oGetFlexSettingsStub = sandbox.stub(oSettings.getMetadata(), "getProperties").returns({
				sampleKey: { _sGetter: "mySampleGetter" },
				versioning: { _sGetter: "getIsVersioningEnabled" }
			});
			const oFlexSettings = await SupportAPI.getFlexSettings();

			assert.strictEqual(
				oGetFlexSettingsStub.callCount,
				1,
				"then the flex settings are fetched"
			);
			assert.strictEqual(
				oFlexSettings[0].key,
				"sampleKey",
				"then the flex settings key is returned"
			);
			assert.strictEqual(
				oFlexSettings[0].value,
				"mySampleValue",
				"then the flex settings value is returned"
			);
		});

		QUnit.test("getChangeDependencies - in FLP context", async function(assert) {
			const oExtractChangeDependenciesStub = sandbox.stub(extractChangeDependencies, "extract").returns("dependencyMap");
			const oChangeDependencies = await SupportAPI.getChangeDependencies();

			assert.strictEqual(
				oExtractChangeDependenciesStub.callCount,
				1,
				"then the change dependencies are extracted"
			);
			assert.strictEqual(
				oChangeDependencies,
				"dependencyMap",
				"then the dependency map is returned"
			);
		});

		QUnit.test("printAllUIChanges - logs to console in FLP context", async function(assert) {
			const oConsoleStub = sandbox.stub(console, "log");

			await SupportAPI.printAllUIChanges();

			assert.ok(oConsoleStub.calledOnce, "Console.log was called");
			assert.ok(Array.isArray(oConsoleStub.getCall(0).args[0]), "Logged data is an array");
		});

		QUnit.test("printFlexObjectInfos - logs to console in FLP context", async function(assert) {
			const oConsoleStub = sandbox.stub(console, "log");

			await SupportAPI.printFlexObjectInfos();

			assert.ok(oConsoleStub.calledOnce, "Console.log was called");
			assert.ok(oConsoleStub.getCall(0).args[0].allFlexObjects, "Logged object contains allFlexObjects");
		});

		QUnit.test("printMixOfChanges - logs to console in FLP context", async function(assert) {
			const oConsoleStub = sandbox.stub(console, "log");
			sandbox.stub(SupportAPI, "getFlexObjectInfos").resolves({
				allFlexObjects: [
					{ isChangeFromOtherSystem: () => true, getLayer: () => "CUSTOMER" },
					{ isChangeFromOtherSystem: () => false, getLayer: () => "CUSTOMER" }
				]
			});

			await SupportAPI.printMixOfChanges();

			assert.ok(oConsoleStub.calledOnce, "Console.log was called");
			const oOutput = oConsoleStub.getCall(0).args[0];
			assert.strictEqual(oOutput.flexObjectsFromOtherSystems.length, 1, "Contains one change from other systems");
			assert.strictEqual(oOutput.localFlexObjects.length, 1, "Contains one local change");
		});

		QUnit.test("printLocalChangeDescriptions - logs to console in FLP context", async function(assert) {
			const oConsoleStub = sandbox.stub(console, "log");
			sandbox.stub(SupportAPI, "getAllUIChanges").resolves([
				{
					isChangeFromOtherSystem: () => false,
					getDefinition: () => ({
						changeType: "hideControl",
						selector: { id: "control1" }
					})
				}
			]);

			await SupportAPI.printLocalChangeDescriptions();

			assert.ok(oConsoleStub.calledOnce, "Console.log was called");
			const oOutput = oConsoleStub.getCall(0).args[0];
			assert.ok(oOutput.descriptions, "Logged object contains descriptions");
			assert.strictEqual(oOutput.descriptions[0], "control1 was hidden", "Correct description generated");
		});
	});

	QUnit.module("Module 3: cFLP Scenarios (MessageBroker Mode - No Component)", {
		beforeEach() {
			sandbox.stub(Utils, "getUshellContainer").returns(true);
			this.oPublishStub = sandbox.stub().resolves();
			this.oSubscribeStub = sandbox.stub().resolves();
			this.oConnectStub = sandbox.stub().resolves();
			this.oDisconnectStub = sandbox.stub().resolves();

			sandbox.stub(Utils, "getUShellService")
			.withArgs("AppLifeCycle").resolves({
				getCurrentApplication: () => ({})
			})
			.withArgs("MessageBroker").resolves({
				publish: this.oPublishStub,
				subscribe: this.oSubscribeStub,
				connect: this.oConnectStub,
				disconnect: this.oDisconnectStub
			});

			sandbox.stub(SupportAPI, "checkAndPrepareMessageBroker").resolves();
		},
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("printAllUIChanges - sends message via MessageBroker", async function(assert) {
			await SupportAPI.printAllUIChanges();

			assert.ok(SupportAPI.checkAndPrepareMessageBroker.calledOnce, "checkAndPrepareMessageBroker was called");
			assert.ok(this.oPublishStub.calledOnce, "Publish was called");
			assert.strictEqual(this.oPublishStub.getCall(0).args[0], "flex.support.channel", "Correct channel");
			assert.strictEqual(this.oPublishStub.getCall(0).args[1], "FlexSupportClient", "Correct client ID");
			assert.strictEqual(this.oPublishStub.getCall(0).args[2], "printAllUIChanges", "Correct message ID");
			assert.deepEqual(this.oPublishStub.getCall(0).args[3], ["FlexAppClient"], "Correct recipient");
		});

		QUnit.test("printMixOfChanges - sends message via MessageBroker", async function(assert) {
			await SupportAPI.printMixOfChanges();

			assert.ok(SupportAPI.checkAndPrepareMessageBroker.calledOnce, "checkAndPrepareMessageBroker was called");
			assert.ok(this.oPublishStub.calledOnce, "Publish was called");
			assert.strictEqual(this.oPublishStub.getCall(0).args[2], "printMixOfChanges", "Correct message ID");
		});

		QUnit.test("printLocalChangeDescriptions - sends message via MessageBroker", async function(assert) {
			await SupportAPI.printLocalChangeDescriptions();

			assert.ok(SupportAPI.checkAndPrepareMessageBroker.calledOnce, "checkAndPrepareMessageBroker was called");
			assert.ok(this.oPublishStub.calledOnce, "Publish was called");
			assert.strictEqual(this.oPublishStub.getCall(0).args[2], "printLocalChangeDescriptions", "Correct message ID");
		});

		QUnit.test("printFlexObjectInfos - sends message via MessageBroker", async function(assert) {
			await SupportAPI.printFlexObjectInfos();

			assert.ok(SupportAPI.checkAndPrepareMessageBroker.calledOnce, "checkAndPrepareMessageBroker was called");
			assert.ok(this.oPublishStub.calledOnce, "Publish was called");
			assert.strictEqual(this.oPublishStub.getCall(0).args[2], "getFlexObjectInfos", "Correct message ID");
		});

		QUnit.test("getChangeDependencies - sends message via MessageBroker and resolves with response data",
			async function(assert) {
				const oExpectedData = { changeDependencies: "testData" };
				this.oPublishStub.callsFake(() => {
					SupportAPI.oDeferredResult.resolve(oExpectedData);
					return Promise.resolve();
				});

				const oResult = await SupportAPI.getChangeDependencies();

				assert.ok(SupportAPI.checkAndPrepareMessageBroker.calledOnce, "checkAndPrepareMessageBroker was called");
				assert.ok(this.oPublishStub.calledOnce, "Publish was called once");
				assert.strictEqual(
					this.oPublishStub.getCall(0).args[2],
					"getChangeDependencies",
					"Correct message ID sent"
				);
				assert.deepEqual(oResult, oExpectedData, "Returns the data resolved by the Deferred");
			});

		QUnit.test("getFlexSettings - sends message via MessageBroker and resolves with response data",
			async function(assert) {
				const oExpectedData = { flexSettings: "testData" };
				this.oPublishStub.callsFake(() => {
					SupportAPI.oDeferredResult.resolve(oExpectedData);
					return Promise.resolve();
				});

				const oResult = await SupportAPI.getFlexSettings();

				assert.ok(SupportAPI.checkAndPrepareMessageBroker.calledOnce, "checkAndPrepareMessageBroker was called");
				assert.ok(this.oPublishStub.calledOnce, "Publish was called once");
				assert.strictEqual(
					this.oPublishStub.getCall(0).args[2],
					"getFlexSettings",
					"Correct message ID sent"
				);
				assert.deepEqual(oResult, oExpectedData, "Returns the data resolved by the Deferred");
			});
	});

	QUnit.module("Module 4: MessageBroker Integration (Application Client Side)", {
		beforeEach() {
			delete SupportAPI.pAppClientConnected;
			sandbox.stub(Utils, "getUshellContainer").returns(true);
			this.oSubscribeStub = sandbox.stub();
			this.oConnectStub = sandbox.stub().resolves();
			this.oPublishStub = sandbox.stub().resolves();

			sandbox.stub(Utils, "getUShellService")
			.withArgs("AppLifeCycle").resolves({
				getCurrentApplication: () => ({})
			})
			.withArgs("MessageBroker").resolves({
				subscribe: this.oSubscribeStub,
				connect: this.oConnectStub,
				publish: this.oPublishStub
			});
		},
		afterEach() {
			delete SupportAPI.pAppClientConnected;
			sandbox.restore();
		}
	}, function() {
		QUnit.test("initializeMessageBrokerForComponent - connects and subscribes", async function(assert) {
			this.oSubscribeStub.callsFake((sClientId, aChannels, fnHandler) => {
				this.messageHandler = fnHandler;
			});

			await SupportAPI.initializeMessageBrokerForComponent();

			assert.ok(this.oConnectStub.calledOnce, "Connect was called");
			assert.strictEqual(this.oConnectStub.getCall(0).args[0], "FlexAppClient", "Correct client ID");
			assert.ok(this.oSubscribeStub.calledOnce, "Subscribe was called");
			assert.deepEqual(this.oSubscribeStub.getCall(0).args[1], [{ channelId: "flex.support.channel" }], "Correct channel");
			assert.ok(typeof this.messageHandler === "function", "Message handler is set");
		});

		QUnit.test("Message handler - MESSAGE_GET_FLEX_OBJECT_INFOS logs to console", async function(assert) {
			const oConsoleStub = sandbox.stub(console, "log");
			sandbox.stub(SupportAPI, "getFlexObjectInfos").resolves({ data: "test" });

			this.oSubscribeStub.callsFake((sClientId, aChannels, fnHandler) => {
				this.messageHandler = fnHandler;
			});

			await SupportAPI.initializeMessageBrokerForComponent();
			await this.messageHandler("FlexSupportClient", "flex.support.channel", "getFlexObjectInfos");

			assert.ok(SupportAPI.getFlexObjectInfos.calledOnce, "getFlexObjectInfos was called");
			assert.ok(oConsoleStub.calledOnce, "Console.log was called");
			assert.deepEqual(oConsoleStub.getCall(0).args[0], { data: "test" }, "Correct data logged");
		});

		QUnit.test("Message handler - MESSAGE_PRINT_MIX_OF_CHANGES logs to console", async function(assert) {
			const oConsoleStub = sandbox.stub(console, "log");
			sandbox.stub(SupportAPI, "getFlexObjectInfos").resolves({
				allFlexObjects: [
					{
						isChangeFromOtherSystem: () => true,
						getLayer: () => "CUSTOMER"
					},
					{
						isChangeFromOtherSystem: () => false,
						getLayer: () => "CUSTOMER"
					}
				]
			});

			this.oSubscribeStub.callsFake((sClientId, aChannels, fnHandler) => {
				this.messageHandler = fnHandler;
			});

			await SupportAPI.initializeMessageBrokerForComponent();
			await this.messageHandler("FlexSupportClient", "flex.support.channel", "printMixOfChanges");

			assert.ok(oConsoleStub.calledOnce, "Console.log was called");
			const oOutput = oConsoleStub.getCall(0).args[0];
			assert.ok(oOutput.flexObjectsFromOtherSystems, "Contains flexObjectsFromOtherSystems");
			assert.ok(oOutput.localFlexObjects, "Contains localFlexObjects");
		});

		QUnit.test("Message handler - MESSAGE_PRINT_LOCAL_CHANGE_DESCRIPTIONS logs to console", async function(assert) {
			const oConsoleStub = sandbox.stub(console, "log");
			sandbox.stub(SupportAPI, "getAllUIChanges").resolves([
				{
					isChangeFromOtherSystem: () => false,
					getDefinition: () => ({
						changeType: "hideControl",
						selector: { id: "control1" }
					})
				}
			]);

			this.oSubscribeStub.callsFake((sClientId, aChannels, fnHandler) => {
				this.messageHandler = fnHandler;
			});

			await SupportAPI.initializeMessageBrokerForComponent();
			await this.messageHandler("FlexSupportClient", "flex.support.channel", "printLocalChangeDescriptions");

			assert.ok(oConsoleStub.calledOnce, "Console.log was called");
			const oOutput = oConsoleStub.getCall(0).args[0];
			assert.ok(oOutput.descriptions, "Contains descriptions array");
			assert.strictEqual(oOutput.descriptions[0], "control1 was hidden", "Correct description generated");
		});

		QUnit.test("Message handler - MESSAGE_GET_CHANGE_DEPENDENCIES publishes response", async function(assert) {
			sandbox.stub(SupportAPI, "getChangeDependencies").resolves({ deps: "data" });

			this.oSubscribeStub.callsFake((sClientId, aChannels, fnHandler) => {
				this.messageHandler = fnHandler;
			});

			await SupportAPI.initializeMessageBrokerForComponent();
			await this.messageHandler("FlexSupportClient", "flex.support.channel", "getChangeDependencies");

			assert.ok(this.oPublishStub.calledOnce, "Publish was called");
			assert.strictEqual(this.oPublishStub.getCall(0).args[2], "changeDependenciesResult", "Correct message type");
			assert.deepEqual(this.oPublishStub.getCall(0).args[4], { deps: "data" }, "Correct data sent");
		});

		QUnit.test("Message handler - MESSAGE_GET_FLEX_SETTINGS publishes response", async function(assert) {
			sandbox.stub(SupportAPI, "getFlexSettings").resolves({ settings: "data" });

			this.oSubscribeStub.callsFake((sClientId, aChannels, fnHandler) => {
				this.messageHandler = fnHandler;
			});

			await SupportAPI.initializeMessageBrokerForComponent();
			await this.messageHandler("FlexSupportClient", "flex.support.channel", "getFlexSettings");

			assert.ok(this.oPublishStub.calledOnce, "Publish was called");
			assert.strictEqual(this.oPublishStub.getCall(0).args[2], "getFlexSettingsResult", "Correct message type");
			assert.deepEqual(this.oPublishStub.getCall(0).args[4], { settings: "data" }, "Correct data sent");
		});

		QUnit.test("Message handler - MESSAGE_CHECK_CONNECTION publishes response", async function(assert) {
			this.oSubscribeStub.callsFake((sClientId, aChannels, fnHandler) => {
				this.messageHandler = fnHandler;
			});

			await SupportAPI.initializeMessageBrokerForComponent();
			await this.messageHandler("FlexSupportClient", "flex.support.channel", "CheckConnection");

			assert.ok(this.oPublishStub.calledOnce, "Publish was called");
			assert.strictEqual(this.oPublishStub.getCall(0).args[2], "ConnectionEstablished", "Correct message type");
		});

		QUnit.test("Message handler - ignores messages from wrong client", async function(assert) {
			const oConsoleStub = sandbox.stub(console, "log");

			this.oSubscribeStub.callsFake((sClientId, aChannels, fnHandler) => {
				this.messageHandler = fnHandler;
			});

			await SupportAPI.initializeMessageBrokerForComponent();
			await this.messageHandler("WrongClient", "flex.support.channel", "getFlexObjectInfos");

			assert.notOk(oConsoleStub.called, "Console.log was not called");
		});

		QUnit.test("Message handler - ignores messages from wrong channel", async function(assert) {
			const oConsoleStub = sandbox.stub(console, "log");

			this.oSubscribeStub.callsFake((sClientId, aChannels, fnHandler) => {
				this.messageHandler = fnHandler;
			});

			await SupportAPI.initializeMessageBrokerForComponent();
			await this.messageHandler("FlexSupportClient", "wrong.channel", "getFlexObjectInfos");

			assert.notOk(oConsoleStub.called, "Console.log was not called");
		});
	});

	QUnit.module("Module 5: MessageBroker Integration (Support Client Side)", {
		beforeEach() {
			sandbox.stub(Utils, "getUshellContainer").returns(true);
			this.oSubscribeStub = sandbox.stub();
			this.oConnectStub = sandbox.stub().resolves();

			sandbox.stub(Utils, "getUShellService")
			.withArgs("AppLifeCycle").resolves({
				getCurrentApplication: () => ({})
			})
			.withArgs("MessageBroker").resolves({
				subscribe: this.oSubscribeStub,
				connect: this.oConnectStub,
				publish: sandbox.stub().resolves()
			});
		},
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("Response handler - MESSAGE_CONNECTION_ESTABLISHED logs to console", async function(assert) {
			const oLogStub = sandbox.stub(Log, "info");

			this.oSubscribeStub.callsFake((sClientId, aChannels, fnHandler) => {
				this.responseHandler = fnHandler;
			});

			await SupportAPI.checkAndPrepareMessageBroker();
			this.responseHandler.call({}, "FlexAppClient", "flex.support.channel", "ConnectionEstablished");

			assert.ok(oLogStub.calledWith("Connection Established"), "Connection message logged");
		});

		QUnit.test("Response handler - MESSAGE_CHANGE_DEPENDENCIES_RESULT resolved", async function(assert) {
			this.oSubscribeStub.callsFake((sClientId, aChannels, fnHandler) => {
				this.responseHandler = fnHandler;
			});

			await SupportAPI.checkAndPrepareMessageBroker();
			SupportAPI.oDeferredResult = new Deferred();
			const oExpectedResponse = { aAppliedChanges: ["change1"] };
			const oDeferredPromise = SupportAPI.oDeferredResult.promise;
			this.responseHandler.call({}, "FlexAppClient", "flex.support.channel", "changeDependenciesResult", oExpectedResponse);

			const oResult = await oDeferredPromise;
			assert.deepEqual(oResult, oExpectedResponse, "Deferred resolved with expected data");
		});

		QUnit.test("Response handler - MESSAGE_GET_FLEX_SETTINGS_RESULT resolved", async function(assert) {
			this.oSubscribeStub.callsFake((sClientId, aChannels, fnHandler) => {
				this.responseHandler = fnHandler;
			});

			await SupportAPI.checkAndPrepareMessageBroker();
			SupportAPI.oDeferredResult = new Deferred();
			const oExpectedResponse = [{ client: "test" }, { user: "DEFAULT_USER" }];
			const oDeferredPromise = SupportAPI.oDeferredResult.promise;
			this.responseHandler.call({}, "FlexAppClient", "flex.support.channel", "getFlexSettingsResult", oExpectedResponse);

			const oResult = await oDeferredPromise;
			assert.deepEqual(oResult, oExpectedResponse, "Deferred resolved with expected data");
		});

		QUnit.test("Response handler - ignores messages from wrong client", async function(assert) {
			const oConsoleStub = sandbox.stub(console, "log");

			this.oSubscribeStub.callsFake((sClientId, aChannels, fnHandler) => {
				this.responseHandler = fnHandler;
			});

			await SupportAPI.checkAndPrepareMessageBroker();
			this.responseHandler.call({}, "WrongClient", "flex.support.channel", "ConnectionEstablished");

			assert.notOk(oConsoleStub.called, "Console.log was not called");
		});
	});

	QUnit.module("Module 6: MessageBroker Initialization (checkAndPrepareMessageBroker)", {
		beforeEach() {
			sandbox.stub(Utils, "getUshellContainer").returns(true);
			this.oSubscribeStub = sandbox.stub().resolves();
			this.oConnectStub = sandbox.stub().resolves();
			this.oDisconnectStub = sandbox.stub().resolves();
			this.oPublishStub = sandbox.stub().resolves();

			this.oGetUShellServiceStub = sandbox.stub(Utils, "getUShellService")
			.withArgs("MessageBroker").resolves({
				subscribe: this.oSubscribeStub,
				connect: this.oConnectStub,
				disconnect: this.oDisconnectStub,
				publish: this.oPublishStub
			});
		},
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("Does not initialize MessageBroker when component exists", async function(assert) {
			this.oGetUShellServiceStub.withArgs("AppLifeCycle").resolves({
				getCurrentApplication: () => ({
					componentInstance: { id: "testComponent" }
				})
			});

			await SupportAPI.checkAndPrepareMessageBroker();

			assert.notOk(this.oConnectStub.called, "Connect not called");
			assert.notOk(this.oSubscribeStub.called, "Subscribe not called");
		});

		QUnit.test("Initializes MessageBroker when component not found", async function(assert) {
			this.oGetUShellServiceStub.withArgs("AppLifeCycle").resolves({
				getCurrentApplication: () => ({})
			});

			await SupportAPI.checkAndPrepareMessageBroker();

			assert.ok(this.oConnectStub.calledWith("FlexSupportClient"), "Connect called with correct client ID");
			assert.ok(this.oSubscribeStub.calledOnce, "Subscribe called");
			assert.ok(this.oPublishStub.calledOnce, "Connection check message published");
		});

		QUnit.test("Handles 'already connected' error gracefully", async function(assert) {
			this.oGetUShellServiceStub.withArgs("AppLifeCycle").resolves({
				getCurrentApplication: () => ({})
			});
			this.oConnectStub.rejects(new Error("Client is already connected"));

			await SupportAPI.checkAndPrepareMessageBroker();

			assert.notOk(this.oSubscribeStub.called, "Subscribe not called after already connected error");
		});

		QUnit.test("Propagates other connection errors", async function(assert) {
			this.oGetUShellServiceStub.withArgs("AppLifeCycle").resolves({
				getCurrentApplication: () => ({})
			});
			this.oConnectStub.rejects(new Error("Connection failed"));

			try {
				await SupportAPI.checkAndPrepareMessageBroker();
				assert.ok(false, "Should have thrown error");
			} catch (oError) {
				assert.strictEqual(oError.message, "Connection failed", "Correct error thrown");
			}
		});

		QUnit.test("Handles connection check failure and disconnects", async function(assert) {
			this.oGetUShellServiceStub.withArgs("AppLifeCycle").resolves({
				getCurrentApplication: () => ({})
			});
			this.oPublishStub.rejects(new Error("Publish failed"));
			sandbox.stub(MessageBox, "error");

			await SupportAPI.checkAndPrepareMessageBroker();

			assert.ok(this.oDisconnectStub.calledWith("FlexSupportClient"), "Disconnect called");
		});

		QUnit.test("Shows error dialog with reload action on connection check failure", async function(assert) {
			this.oGetUShellServiceStub.withArgs("AppLifeCycle").resolves({
				getCurrentApplication: () => ({})
			});
			this.oPublishStub.rejects(new Error("Publish failed"));
			const oMessageBoxStub = sandbox.stub(MessageBox, "error");

			await SupportAPI.checkAndPrepareMessageBroker();

			assert.ok(oMessageBoxStub.calledOnce, "MessageBox.error was shown");
			const oOptions = oMessageBoxStub.getCall(0).args[1];
			assert.ok(oOptions.actions.length === 2, "then two actions are offered");
			assert.strictEqual(oOptions.actions[1], MessageBox.Action.CLOSE, "then the second action is CLOSE");
			assert.ok(typeof oOptions.onClose === "function", "then an onClose handler is provided");
		});

		QUnit.test("Reloads the app with debug sources when the reload action is chosen", async function(assert) {
			this.oGetUShellServiceStub.withArgs("AppLifeCycle").resolves({
				getCurrentApplication: () => ({})
			});
			this.oPublishStub.rejects(new Error("Publish failed"));
			const oMessageBoxStub = sandbox.stub(MessageBox, "error");
			const oReloadStub = sandbox.stub(SupportAPI, "reloadAppWithDebugSources");

			await SupportAPI.checkAndPrepareMessageBroker();
			const fnOnClose = oMessageBoxStub.getCall(0).args[1].onClose;

			// user chooses the reload (non-CLOSE) action
			fnOnClose("someReloadAction");

			assert.ok(oReloadStub.calledOnce, "then the app is reloaded with debug sources");
		});

		QUnit.test("Does not reload the app when the CLOSE action is chosen", async function(assert) {
			this.oGetUShellServiceStub.withArgs("AppLifeCycle").resolves({
				getCurrentApplication: () => ({})
			});
			this.oPublishStub.rejects(new Error("Publish failed"));
			const oMessageBoxStub = sandbox.stub(MessageBox, "error");
			const oReloadStub = sandbox.stub(SupportAPI, "reloadAppWithDebugSources");

			await SupportAPI.checkAndPrepareMessageBroker();
			const fnOnClose = oMessageBoxStub.getCall(0).args[1].onClose;

			fnOnClose(MessageBox.Action.CLOSE);

			assert.notOk(oReloadStub.called, "then the app is not reloaded");
		});
	});

	QUnit.module("Module 7: Edge Cases and Error Handling", {
		beforeEach() {
			sandbox.stub(Utils, "getUshellContainer").returns(true);
		},
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("getAllUIChanges throws in MessageBroker scenario", async function(assert) {
			sandbox.stub(Utils, "getUShellService")
			.withArgs("AppLifeCycle").resolves({
				getCurrentApplication: () => ({})
			});

			try {
				await SupportAPI.getAllUIChanges();
				assert.ok(false, "Should have thrown error");
			} catch (oError) {
				assert.ok(oError, "Error was thrown");
				assert.ok(oError.message.includes("MessageBroker"), "Error message mentions 'MessageBroker'");
			}
		});

		QUnit.test("getFlexObjectInfos throws in MessageBroker scenario", async function(assert) {
			sandbox.stub(Utils, "getUShellService")
			.withArgs("AppLifeCycle").resolves({
				getCurrentApplication: () => ({})
			})
			.withArgs("MessageBroker").resolves(null);

			try {
				await SupportAPI.getFlexObjectInfos();
				assert.ok(false, "Should have thrown error");
			} catch (oError) {
				assert.ok(oError, "Error was thrown");
				assert.ok(oError.message.includes("MessageBroker"), "Error message mentions 'MessageBroker'");
			}
		});
	});

	QUnit.module("Module 8: Reusable broker primitives (for other support tools)", {
		beforeEach() {
			delete SupportAPI.pAppClientConnected;
			sandbox.stub(Utils, "getUshellContainer").returns(true);
			this.oSubscribeStub = sandbox.stub().resolves();
			this.oConnectStub = sandbox.stub().resolves();
			this.oPublishStub = sandbox.stub().resolves();

			sandbox.stub(Utils, "getUShellService")
			.withArgs("AppLifeCycle").resolves({
				getCurrentApplication: () => ({})
			})
			.withArgs("MessageBroker").resolves({
				subscribe: this.oSubscribeStub,
				connect: this.oConnectStub,
				publish: this.oPublishStub
			});
		},
		afterEach() {
			SupportAPI.deregisterMessageHandler("myTool.custom");
			delete SupportAPI.pAppClientConnected;
			sandbox.restore();
		}
	}, function() {
		QUnit.test("getSupportChannelInfo returns the channel and client ids", function(assert) {
			const oInfo = SupportAPI.getSupportChannelInfo();
			assert.strictEqual(oInfo.channelId, "flex.support.channel", "then the channel id is returned");
			assert.strictEqual(oInfo.appClientId, "FlexAppClient", "then the app client id is returned");
			assert.strictEqual(oInfo.supportClientId, "FlexSupportClient", "then the support client id is returned");
		});

		QUnit.test("connectAppClient connects and subscribes the app client", async function(assert) {
			await SupportAPI.connectAppClient();
			assert.ok(this.oConnectStub.calledWith("FlexAppClient"), "then the app client is connected");
			assert.ok(this.oSubscribeStub.calledOnce, "then the app client is subscribed");
			assert.deepEqual(
				this.oSubscribeStub.getCall(0).args[1],
				[{ channelId: "flex.support.channel" }],
				"then the correct channel is used"
			);
		});

		QUnit.test("connectAppClient forwards connection events to the provided callback", async function(assert) {
			const aCalls = [];
			const fnConnectionCallback = function(...aArgs) {
				aCalls.push(aArgs);
			};
			await SupportAPI.connectAppClient(fnConnectionCallback);
			// The client is connected with a stable internal dispatcher, not the raw callback,
			// so that a later caller's callback is still honored despite the one-time connect.
			const fnDispatcher = this.oConnectStub.getCall(0).args[1];
			assert.strictEqual(typeof fnDispatcher, "function", "then a connection callback is passed to the broker connect");
			assert.notStrictEqual(fnDispatcher, fnConnectionCallback, "then it is the internal dispatcher, not the raw callback");

			// The dispatcher forwards broker connection events to the stored callback.
			fnDispatcher("clientSubscribed", "FlexSupportClient", [{ channelId: "flex.support.channel" }]);
			assert.strictEqual(aCalls.length, 1, "then the provided callback is invoked when the dispatcher fires");
			assert.deepEqual(
				aCalls[0],
				["clientSubscribed", "FlexSupportClient", [{ channelId: "flex.support.channel" }]],
				"then the connection event arguments are forwarded unchanged"
			);
		});

		QUnit.test("connectAppClient honors a callback provided after the client was already connected", async function(assert) {
			// First caller connects the client without a connection callback (e.g. the flex
			// ComponentLifecycleHook in debug mode).
			await SupportAPI.connectAppClient();
			const fnDispatcher = this.oConnectStub.getCall(0).args[1];

			// A later caller (e.g. RTA SupportTools) provides the connection callback. Because the
			// client is already connected, connect is not called again - but the callback must still fire.
			const aCalls = [];
			await SupportAPI.connectAppClient(function(...aArgs) {
				aCalls.push(aArgs);
			});
			assert.strictEqual(this.oConnectStub.callCount, 1, "then the client is not connected a second time");

			fnDispatcher("clientSubscribed", "FlexSupportClient", []);
			assert.strictEqual(aCalls.length, 1, "then the later-provided callback is still invoked via the dispatcher");
		});

		QUnit.test("connectAppClient only connects once across repeated calls", async function(assert) {
			await SupportAPI.connectAppClient();
			await SupportAPI.connectAppClient();
			assert.strictEqual(this.oConnectStub.callCount, 1, "then connect is only called once");
			assert.strictEqual(this.oSubscribeStub.callCount, 1, "then subscribe is only called once");
		});

		QUnit.test("connectSupportClient connects and subscribes the support client", async function(assert) {
			await SupportAPI.connectSupportClient();
			assert.ok(this.oConnectStub.calledWith("FlexSupportClient"), "then the support client is connected");
			assert.ok(this.oSubscribeStub.calledOnce, "then the support client is subscribed");
		});

		QUnit.test("connectAppClient tolerates an already connected client", async function(assert) {
			this.oConnectStub.rejects(new Error("Client is already connected"));
			await SupportAPI.connectAppClient();
			assert.ok(this.oSubscribeStub.calledOnce, "then it still subscribes after the already-connected error");
		});

		QUnit.test("connectAppClient rethrows other connect errors", async function(assert) {
			this.oConnectStub.rejects(new Error("boom"));
			await SupportAPI.connectAppClient().then(function() {
				assert.ok(false, "should have thrown");
			}).catch(function(oError) {
				assert.strictEqual(oError.message, "boom", "then the error is rethrown");
			});
		});

		QUnit.test("connectAppClient allows a retry after a genuine connect failure", async function(assert) {
			this.oConnectStub.onFirstCall().rejects(new Error("boom"));
			await SupportAPI.connectAppClient().catch(() => {});
			assert.notOk(SupportAPI.pAppClientConnected, "then the memoized promise is cleared after the failure");

			await SupportAPI.connectAppClient();
			assert.strictEqual(this.oConnectStub.callCount, 2, "then a later call retries the connect");
			assert.ok(this.oSubscribeStub.calledOnce, "then the retry subscribes the app client");
		});

		QUnit.test("connectAppClient rethrows a subscribe failure and allows a retry", async function(assert) {
			this.oSubscribeStub.onFirstCall().rejects(new Error("subscribe boom"));
			await SupportAPI.connectAppClient().then(() => {
				assert.ok(false, "should have thrown");
			}).catch((oError) => {
				assert.strictEqual(oError.message, "subscribe boom", "then the subscribe error is rethrown");
			});
			assert.notOk(SupportAPI.pAppClientConnected, "then the memoized promise is cleared after the subscribe failure");

			await SupportAPI.connectAppClient();
			assert.strictEqual(this.oSubscribeStub.callCount, 2, "then a later call retries the subscribe");
		});

		QUnit.test("publishToAppClient publishes from the support client to the app client", async function(assert) {
			await SupportAPI.publishToAppClient("myTool.command", { a: 1 });
			assert.ok(this.oPublishStub.calledOnce, "then publish was called");
			const aArgs = this.oPublishStub.getCall(0).args;
			assert.strictEqual(aArgs[0], "flex.support.channel", "then the correct channel is used");
			assert.strictEqual(aArgs[1], "FlexSupportClient", "then the sender is the support client");
			assert.strictEqual(aArgs[2], "myTool.command", "then the correct message id is used");
			assert.deepEqual(aArgs[3], ["FlexAppClient"], "then the target is the app client");
			assert.deepEqual(aArgs[4], { a: 1 }, "then the data payload is forwarded");
		});

		QUnit.test("publishToSupportClient publishes from the app client to the support client", async function(assert) {
			await SupportAPI.publishToSupportClient("myTool.result", { b: 2 });
			const aArgs = this.oPublishStub.getCall(0).args;
			assert.strictEqual(aArgs[1], "FlexAppClient", "then the sender is the app client");
			assert.strictEqual(aArgs[2], "myTool.result", "then the correct message id is used");
			assert.deepEqual(aArgs[3], ["FlexSupportClient"], "then the target is the support client");
			assert.deepEqual(aArgs[4], { b: 2 }, "then the data payload is forwarded");
		});

		QUnit.test("registerMessageHandler dispatches unknown ids on the app client subscription", async function(assert) {
			this.oSubscribeStub.callsFake((sClientId, aChannels, fnHandler) => {
				this.messageHandler = fnHandler;
			});
			const oHandler = sandbox.stub();
			SupportAPI.registerMessageHandler("myTool.custom", oHandler);

			await SupportAPI.connectAppClient();
			await this.messageHandler("FlexSupportClient", "flex.support.channel", "myTool.custom", { x: 1 });

			assert.ok(oHandler.calledOnce, "then the registered handler is invoked");
			assert.deepEqual(oHandler.getCall(0).args[0], { x: 1 }, "then the data payload is passed");
			assert.deepEqual(
				oHandler.getCall(0).args[1],
				{ clientId: "FlexSupportClient", channelId: "flex.support.channel" },
				"then the sender meta is passed"
			);
		});

		QUnit.test("registerMessageHandler dispatches unknown ids on the support client subscription", async function(assert) {
			this.oSubscribeStub.callsFake((sClientId, aChannels, fnHandler) => {
				this.responseHandler = fnHandler;
			});
			const oHandler = sandbox.stub();
			SupportAPI.registerMessageHandler("myTool.custom", oHandler);

			await SupportAPI.connectSupportClient();
			this.responseHandler("FlexAppClient", "flex.support.channel", "myTool.custom", { y: 2 });

			assert.ok(oHandler.calledOnce, "then the registered handler is invoked");
			assert.deepEqual(oHandler.getCall(0).args[0], { y: 2 }, "then the data payload is passed");
		});

		QUnit.test("deregisterMessageHandler stops the dispatch", async function(assert) {
			this.oSubscribeStub.callsFake((sClientId, aChannels, fnHandler) => {
				this.messageHandler = fnHandler;
			});
			const oHandler = sandbox.stub();
			SupportAPI.registerMessageHandler("myTool.custom", oHandler);
			SupportAPI.deregisterMessageHandler("myTool.custom");

			await SupportAPI.connectAppClient();
			await this.messageHandler("FlexSupportClient", "flex.support.channel", "myTool.custom", {});

			assert.notOk(oHandler.called, "then the handler is not invoked after deregistration");
		});

		QUnit.test("deregisterConnectionCallback stops forwarding connection events", async function(assert) {
			const aCalls = [];
			const fnConnectionCallback = (...aArgs) => {
				aCalls.push(aArgs);
			};
			await SupportAPI.connectAppClient(fnConnectionCallback);
			const fnDispatcher = this.oConnectStub.getCall(0).args[1];

			SupportAPI.deregisterConnectionCallback(fnConnectionCallback);
			fnDispatcher("clientSubscribed", "FlexSupportClient", []);

			assert.strictEqual(aCalls.length, 0, "then the callback is no longer invoked after deregistration");
		});

		QUnit.test("deregisterConnectionCallback only removes the matching callback", async function(assert) {
			const aCalls = [];
			const fnConnectionCallback = (...aArgs) => {
				aCalls.push(aArgs);
			};
			await SupportAPI.connectAppClient(fnConnectionCallback);
			const fnDispatcher = this.oConnectStub.getCall(0).args[1];

			SupportAPI.deregisterConnectionCallback(() => {});
			fnDispatcher("clientSubscribed", "FlexSupportClient", []);

			assert.strictEqual(aCalls.length, 1, "then a non-matching callback does not remove the stored one");
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});