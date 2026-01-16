/* global QUnit */

sap.ui.define([
	"sap/ui/core/Component",
	"sap/ui/core/ComponentContainer",
	"sap/ui/fl/apply/_internal/flexState/changes/UIChangesState",
	"sap/ui/fl/apply/_internal/flexState/controlVariants/VariantManagementState",
	"sap/ui/fl/apply/_internal/flexState/FlexObjectState",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/initial/_internal/ManifestUtils",
	"sap/ui/fl/initial/_internal/Settings",
	"sap/ui/fl/support/_internal/extractChangeDependencies",
	"sap/ui/fl/support/api/SupportAPI",
	"sap/ui/fl/Utils",
	"sap/ui/thirdparty/sinon-4"
], function(
	Component,
	ComponentContainer,
	UIChangesState,
	VariantManagementState,
	FlexObjectState,
	FlexState,
	ManifestUtils,
	Settings,
	extractChangeDependencies,
	SupportAPI,
	Utils,
	sinon
) {
	"use strict";

	const sandbox = sinon.createSandbox();

	QUnit.module("When the SupportAPI is called with a standalone app without iframe", {
		async beforeEach() {
			const oComponent = await Component.create({
				name: "testComponentAsync",
				id: "testComponentAsync"
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
		QUnit.test("when getAllUIChanges is called", async function(assert) {
			const oGetAllChangesStub = sandbox.stub(UIChangesState, "getAllUIChanges").returns(["myChange"]);
			const aAllChanges = await SupportAPI.getAllUIChanges();
			assert.strictEqual(oGetAllChangesStub.getCall(0).args[0], "testComponentAsync", "then the correct reference is passed");
			assert.deepEqual(aAllChanges, ["myChange"], "then the change is returned");
		});
	});

	QUnit.module("When the SupportAPI is called with an app embedded in a FLP sandbox", {
		async beforeEach() {
			const oComponent = await Component.create({
				name: "testComponentAsync",
				id: "testComponentAsync"
			});
			this.oComponentContainer = new ComponentContainer({
				component: oComponent,
				async: true
			});
			sandbox.stub(Utils, "getUshellContainer").returns(true);
			sandbox.stub(Utils, "getUShellService").resolves({
				getCurrentApplication: () => {
					return {
						componentInstance: oComponent
					};
				}
			});

			this.getFlexReferenceForControlSpy = sandbox.spy(ManifestUtils, "getFlexReferenceForControl");
			this.getAllUIChangesStub = sandbox.stub(UIChangesState, "getAllUIChanges")
			.resolves(["myFlpChange"]);
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
		},
		afterEach() {
			sandbox.restore();
			this.oComponentContainer.destroy();
		}
	}, function() {
		QUnit.test("when getAllUIChanges is called", async function(assert) {
			const aAllChanges = await SupportAPI.getAllUIChanges();
			assert.strictEqual(this.getAllUIChangesStub.getCall(0).args[0], "testComponentAsync", "then the correct reference is passed");
			assert.deepEqual(aAllChanges, ["myFlpChange"], "then the change is returned");
		});

		QUnit.test("when getFlexObjectInfo is called", async function(assert) {
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
			assert.strictEqual(oFlexObjectInfos.liveDependencyMap,
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
		});

		QUnit.test("when getFlexSettings is called", async function(assert) {
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

		QUnit.test("when getChangeDependencies is called", async function(assert) {
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

		QUnit.test("when getApplicationComponent is called", async function(assert) {
			const oComponent = await SupportAPI.getApplicationComponent();
			assert.strictEqual(oComponent.getId(), "testComponentAsync", "then the correct component is returned");
			assert.ok(oComponent, "then a component is returned");
		});
	});

	QUnit.module("When the SupportAPI is called and component not found (possible cFLP scenario - app in iframe)", {
		beforeEach() {
			sandbox.stub(Utils, "getUshellContainer").returns(true);
			this.oGetUShellServiceStub = sandbox.stub(Utils, "getUShellService")
			.withArgs("AppLifeCycle").resolves({
				getCurrentApplication: () => {
					return {};
				}
			});
			this.oPublishStub = sandbox.stub();
			this.oGetUShellServiceStub.withArgs("MessageBroker").resolves({
				publish: this.oPublishStub
			});
		},
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when getFlexObjectInfos (example function) is called", async function(assert) {
			const oResult = await SupportAPI.getFlexObjectInfos();
			assert.strictEqual(
				oResult, undefined, "then nothing is returned because the function is not called, only a message published"
			);
			assert.strictEqual(
				this.oPublishStub.getCall(0).args[0],
				"flex.support.channel",
				"then the correct channel ID is used to publish the message"
			);
			assert.strictEqual(
				this.oPublishStub.getCall(0).args[1],
				"FlexSupportClient",
				"then the correct support client ID is used to publish the message"
			);
			assert.strictEqual(
				this.oPublishStub.getCall(0).args[2],
				"getFlexObjectInfos",
				"then the correct message ID is used to publish the message"
			);
			assert.deepEqual(
				this.oPublishStub.getCall(0).args[3],
				["FlexAppClient"],
				"then the correct app client ID is used to publish the message"
			);
		});
	});

	QUnit.module("Error handling when component not found (possible cFLP scenario)", {
		beforeEach() {
			sandbox.stub(Utils, "getUshellContainer").returns(true);
			this.oGetUShellServiceStub = sandbox.stub(Utils, "getUShellService")
			.withArgs("AppLifeCycle").resolves({
				getCurrentApplication: () => {
					return {};
				}
			});
		},
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when MessageBroker service is not available", async function(assert) {
			this.oGetUShellServiceStub.withArgs("MessageBroker").resolves(undefined);
			const fnDone = assert.async();
			try {
				await SupportAPI.getFlexObjectInfos();
			} catch (oError) {
				assert.strictEqual(
					oError.message,
					"Component not found (possible cFLP scenario) but MessageBroker service is not available",
					"then the correct error is thrown"
				);
				fnDone();
			}
		});
	});

	QUnit.module("Different messages received with Message Broker(e.g. cFLP scenario)", {
		beforeEach() {
			sandbox.stub(Utils, "getUshellContainer").returns(true);
			this.oGetUShellServiceStub = sandbox.stub(Utils, "getUShellService")
			.withArgs("MessageBroker").resolves({
				subscribe: sandbox.stub().callsFake((sAppClientId, aChannels, onFlexMessageReceived) => {
					this.onMessageReceived = onFlexMessageReceived;
				}),
				connect: sandbox.stub().resolves()
			})
			.withArgs("AppLifeCycle").resolves({
				getCurrentApplication: () => {
					// No component instance, simulating cFLP scenario
					return {};
				}
			});
		},
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("check initializeMessageBrokerForComponent", async function(assert) {
			const fnDone = assert.async();
			this.oGetUShellServiceStub.withArgs("MessageBroker").resolves({
				connect: sandbox.stub().callsFake((sClientId, fnCallback) => {
					assert.strictEqual(sClientId, "FlexAppClient", "then the correct client ID is used to connect");
					assert.strictEqual(fnCallback(), undefined, "then the callback is set correctly");
					return Promise.resolve();
				}),
				subscribe: sandbox.stub().callsFake((sAppClientId, aChannels, onFlexMessageReceived) => {
					assert.strictEqual(sAppClientId, "FlexAppClient", "then the correct client ID is used to subscribe");
					assert.deepEqual(aChannels, [{ channelId: "flex.support.channel" }], "then the correct channel is used to subscribe");
					assert.ok(typeof onFlexMessageReceived === "function", "then the message handler function is set");
					fnDone();
				})
			});
			// Simulate client subscription to the message broker (e.g. during component initialization)
			await SupportAPI.initializeMessageBrokerForComponent();
		});

		QUnit.test("when message getFlexObjectInfos is received", async function(assert) {
			// Simulate client subscription to the message broker (e.g. during component initialization)
			await SupportAPI.initializeMessageBrokerForComponent();
			const fnDone = assert.async();
			sandbox.stub(SupportAPI, "getFlexObjectInfos").resolves("dummyResult");
			sandbox.stub(console, "log").callsFake((loggedValue) => {
				assert.deepEqual(
					loggedValue, "dummyResult", "then 'getFlexObjectInfos' result is logged in the console"
				);
				fnDone();
			});
			this.onMessageReceived("FlexSupportClient", "flex.support.channel", "getFlexObjectInfos");
		});
	});

	QUnit.module("When SupportAPI.checkAndPrepareMessageBroker is called", {
		beforeEach() {
			sandbox.stub(Utils, "getUshellContainer").returns(true);
			this.oSubscribeStub = sandbox.stub().resolves();
			this.oConnectStub = sandbox.stub().resolves();
			this.oGetUShellServiceStub = sandbox.stub(Utils, "getUShellService")
			.withArgs("MessageBroker").resolves({
				subscribe: this.oSubscribeStub,
				connect: this.oConnectStub
			});
		},
		afterEach() {
			sandbox.restore();
		}

	}, function() {
		QUnit.test("and component is found", async function(assert) {
			this.oGetUShellServiceStub.withArgs("AppLifeCycle").resolves({
				getCurrentApplication: () => {
					return {
						componentInstance: "dummyComponent"
					};
				}
			});
			await SupportAPI.checkAndPrepareMessageBroker();
			assert.notOk(
				this.oConnectStub.called,
				"then MessageBroker connect is not called"
			);
			assert.notOk(
				this.oSubscribeStub.called,
				"then MessageBroker subscribe is not called"
			);
		});

		QUnit.test("and component is not found", async function(assert) {
			this.oGetUShellServiceStub.withArgs("AppLifeCycle").resolves({
				getCurrentApplication: () => {
					return {};
				}
			});
			await SupportAPI.checkAndPrepareMessageBroker();
			assert.ok(
				this.oConnectStub.calledWith("FlexSupportClient"),
				"then MessageBroker.connect is called with correct client ID"
			);
			assert.ok(
				this.oSubscribeStub.calledWith(
					"FlexSupportClient",
					[{ channelId: "flex.support.channel" }]
				),
				"then MessageBroker.subscribe is called with correct client ID and channel"
			);
		});

		QUnit.test("and component is not found and Message Broker is already connected", async function(assert) {
			this.oGetUShellServiceStub.withArgs("AppLifeCycle").resolves({
				getCurrentApplication: () => {
					return {};
				}
			});
			this.oConnectStub.throws(new Error("Client is already connected"));
			await SupportAPI.checkAndPrepareMessageBroker();
			assert.ok(
				this.oSubscribeStub.notCalled,
				"then MessageBroker subscribe is not called"
			);
		});

		QUnit.test("and component is not found and Message Broker connection fails", async function(assert) {
			this.oGetUShellServiceStub.withArgs("AppLifeCycle").resolves({
				getCurrentApplication: () => {
					return {};
				}
			});
			this.oConnectStub.throws(new Error("Some other connection error"));
			try {
				await SupportAPI.checkAndPrepareMessageBroker();
			} catch (oError) {
				assert.strictEqual(
					oError.message,
					"Some other connection error",
					"then the correct error is thrown"
				);
			}
			assert.notOk(
				this.oSubscribeStub.called,
				"then MessageBroker subscribe is not called"
			);
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});