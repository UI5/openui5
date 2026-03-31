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

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});