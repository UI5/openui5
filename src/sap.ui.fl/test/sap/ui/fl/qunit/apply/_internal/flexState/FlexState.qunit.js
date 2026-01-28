/* global QUnit */

sap.ui.define([
	"sap/base/Log",
	"sap/base/util/merge",
	"sap/ui/core/UIComponent",
	"sap/ui/fl/apply/_internal/flexObjects/FlexObjectFactory",
	"sap/ui/fl/apply/_internal/flexObjects/States",
	"sap/ui/fl/apply/_internal/flexState/DataSelector",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/apply/_internal/flexState/changes/UIChangesState",
	"sap/ui/fl/apply/_internal/flexState/InitialPrepareFunctions",
	"sap/ui/fl/initial/_internal/Loader",
	"sap/ui/fl/initial/_internal/ManifestUtils",
	"sap/ui/fl/initial/_internal/FlexInfoSession",
	"sap/ui/fl/initial/_internal/Storage",
	"sap/ui/fl/initial/_internal/StorageUtils",
	"sap/ui/fl/Layer",
	"sap/ui/fl/LayerUtils",
	"sap/ui/fl/Utils",
	"sap/ui/thirdparty/sinon-4"
], function(
	Log,
	merge,
	UIComponent,
	FlexObjectFactory,
	States,
	DataSelector,
	FlexState,
	UIChangesState,
	InitialPrepareFunctions,
	Loader,
	ManifestUtils,
	FlexInfoSession,
	Storage,
	StorageUtils,
	Layer,
	LayerUtils,
	Utils,
	sinon
) {
	"use strict";

	var sandbox = sinon.createSandbox();
	var sReference = "sap.ui.fl.reference";
	var sComponentId = "componentId";
	var mEmptyResponse = {
		changes: StorageUtils.getEmptyFlexDataResponse()
	};

	function mockLoader(oResponse = {}) {
		Loader.getFlexData.restore?.();
		Loader.getCachedFlexData.restore?.();
		const oReturn = merge({}, mEmptyResponse, oResponse);
		const oLoaderReturn = {
			data: oReturn,
			parameters: {}
		};
		sandbox.stub(Loader, "getCachedFlexData").returns(oLoaderReturn);
		return sandbox.stub(Loader, "getFlexData").resolves(oLoaderReturn);
	}

	function mockPrepareFunctions(sMapName) {
		var oReturn = {};
		if (sMapName === "appDescriptorChanges") {
			oReturn.appDescriptorChanges = sMapName;
		} else if (sMapName === "changes") {
			oReturn.changes = sMapName;
		} else if (sMapName === "variants") {
			oReturn.variantsMap = sMapName;
		} else if (sMapName === "compVariants") {
			oReturn = sMapName;
		}
		return oReturn;
	}

	QUnit.module("Clear FlexState with Data Selector", {
		beforeEach() {
			this.oLoadFlexDataStub = mockLoader();
			this.oClearCachedResultSpy = sandbox.spy(DataSelector.prototype, "clearCachedResult");
		},
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when the state is cleared with a reference", function(assert) {
			FlexState.clearState(sReference);
			assert.strictEqual(this.oClearCachedResultSpy.callCount, 1, "then the selector is cleared");
		});
		QUnit.test("when the state is cleared without a reference", function(assert) {
			FlexState.clearState();
			assert.strictEqual(this.oClearCachedResultSpy.callCount, 1, "then the selector is cleared");
		});
	});

	QUnit.module("FlexState with Data Selector and FlexObjects", {
		beforeEach() {
			this.oAppComponent = new UIComponent(sComponentId);
			this.oCheckUpdateSelectorStub = sandbox.spy(DataSelector.prototype, "checkUpdate");
		},
		afterEach() {
			FlexState.clearState();
			this.oAppComponent.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("When the State is initialized", async function(assert) {
			await FlexState.initialize({
				reference: sReference,
				componentId: sComponentId
			});

			assert.ok(FlexState.getFlexObjectsDataSelector(), "then the data selector is created");
			assert.equal(
				this.oCheckUpdateSelectorStub.callCount,
				1,
				"then the selector is updated during the state initialization"
			);
		});

		QUnit.test("when waiting for the state initialization", async function(assert) {
			const oLogErrorStub = sandbox.stub(Log, "error");
			await FlexState.waitForInitialization(sReference);
			assert.strictEqual(
				oLogErrorStub.withArgs("FlexState.waitForInitialization was called before FlexState.initialize").callCount,
				1,
				"then before the init call the promise resolves immediately but an error is logged"
			);

			const oFlexInitPromise = FlexState.initialize({
				reference: sReference,
				componentId: sComponentId
			});
			const fnAfterInitializationFake = sandbox.stub();
			FlexState.waitForInitialization(sReference).then(fnAfterInitializationFake);
			assert.strictEqual(
				fnAfterInitializationFake.callCount,
				0,
				"then the promise is not resolved before the initialization is finished"
			);

			// Finish initialization
			await oFlexInitPromise;

			assert.strictEqual(
				fnAfterInitializationFake.callCount,
				1,
				"then the promise is resolved after the initialization is finished"
			);
		});

		QUnit.test("When a FlexObject is added and removed multiple times", async function(assert) {
			await FlexState.initialize({
				reference: sReference,
				componentId: sComponentId
			});
			var oDummyFlexObject = FlexObjectFactory.createUIChange({ id: "dummyChange" });
			this.oCheckUpdateSelectorStub.reset();
			FlexState.addDirtyFlexObjects(sReference, [oDummyFlexObject], sComponentId);
			assert.deepEqual(
				FlexState.getFlexObjectsDataSelector().get({ reference: sReference })[0],
				oDummyFlexObject,
				"then the flexObject is added to the selector"
			);
			assert.strictEqual(
				FlexState.getFlexObjectsDataSelector().get({ reference: sReference }).length,
				1,
				"then the selector returns one flexObject"
			);
			assert.strictEqual(
				this.oCheckUpdateSelectorStub.callCount,
				1,
				"then the selector is updated after adding a flexObject"
			);

			FlexState.addDirtyFlexObjects(sReference, [oDummyFlexObject], sComponentId);
			assert.strictEqual(
				FlexState.getFlexObjectsDataSelector().get({ reference: sReference }).length,
				1,
				"then the selector returns one flexObject"
			);
			assert.strictEqual(
				this.oCheckUpdateSelectorStub.callCount,
				1,
				"then the selector is not updated again"
			);

			const [oRemovedFlexObject] = FlexState.removeDirtyFlexObjects(sReference, [oDummyFlexObject]);
			assert.strictEqual(
				oRemovedFlexObject,
				oDummyFlexObject,
				"then the removed flex object is returned"
			);
			assert.strictEqual(
				FlexState.getFlexObjectsDataSelector().get({ reference: sReference }).length,
				0,
				"then the flexObject is removed from the selector"
			);
			assert.strictEqual(
				this.oCheckUpdateSelectorStub.callCount,
				2,
				"then the selector is updated after removing a flexObject"
			);

			FlexState.removeDirtyFlexObjects(sReference, [oDummyFlexObject]);
			assert.strictEqual(
				FlexState.getFlexObjectsDataSelector().get({ reference: sReference }).length,
				0,
				"then the selector still returns no flexObjects"
			);
			assert.strictEqual(
				this.oCheckUpdateSelectorStub.callCount,
				2,
				"then the selector is not updated again"
			);

			assert.deepEqual(
				FlexState.getFlexObjectsDataSelector().get({ reference: "wrongReference" }),
				[],
				"then an empty array is returned for invalid references"
			);
		});

		QUnit.test("When multiple FlexObjects are added and removed together", async function(assert) {
			await FlexState.initialize({
				reference: sReference,
				componentId: sComponentId
			});
			var aDummyFlexObjects = [
				FlexObjectFactory.createUIChange({ id: "dummyChange1" }),
				FlexObjectFactory.createUIChange({ id: "dummyChange2" })
			];
			this.oCheckUpdateSelectorStub.reset();
			FlexState.addDirtyFlexObjects(sReference, aDummyFlexObjects, sComponentId);
			assert.deepEqual(
				FlexState.getFlexObjectsDataSelector().get({ reference: sReference }),
				aDummyFlexObjects,
				"then the flexObjects are added to the selector"
			);
			assert.strictEqual(
				this.oCheckUpdateSelectorStub.callCount,
				1,
				"then the selector is updated only once after initialize"
			);
			const aRemovedFlexObjects = FlexState.removeDirtyFlexObjects(sReference, aDummyFlexObjects);
			assert.deepEqual(
				aRemovedFlexObjects,
				aDummyFlexObjects,
				"then the removed flex objects are returned"
			);
			assert.strictEqual(
				FlexState.getFlexObjectsDataSelector().get({ reference: sReference }).length,
				0,
				"then the flexObjects are removed from the selector"
			);
			assert.strictEqual(
				this.oCheckUpdateSelectorStub.callCount,
				2,
				"then the selector is called only once more during the removal"
			);
		});

		QUnit.test("When multiple FlexObjects over max layer are added and removed together", async function(assert) {
			await FlexState.initialize({
				reference: sReference,
				componentId: sComponentId
			});
			var aDummyFlexObjects = [
				FlexObjectFactory.createUIChange({ id: "dummyChange1", layer: "USER" }),
				FlexObjectFactory.createUIChange({ id: "dummyChange2", layer: "USER" })
			];
			this.oCheckUpdateSelectorStub.reset();
			sandbox.stub(FlexInfoSession, "getByReference").returns({ adaptationLayer: Layer.CUSTOMER });
			FlexState.addDirtyFlexObjects(sReference, aDummyFlexObjects, sComponentId);
			assert.deepEqual(
				FlexState.getFlexObjectsDataSelector().get({ reference: sReference }),
				[],
				"then the flexObjects are NOT added to the selector"
			);
			assert.strictEqual(
				this.oCheckUpdateSelectorStub.callCount,
				0,
				"then the selector is NOT updated after initialize"
			);
			FlexState.removeDirtyFlexObjects(sReference, aDummyFlexObjects);
			assert.strictEqual(
				FlexState.getFlexObjectsDataSelector().get({ reference: sReference }).length,
				0,
				"then the flexObjects are removed from the selector"
			);
			assert.strictEqual(
				this.oCheckUpdateSelectorStub.callCount,
				0,
				"then the selector is never updated since nothing was removed"
			);
		});

		QUnit.test("When multiple FlexObjects with just one with over adaptation layer are added and removed together", async function(assert) {
			await FlexState.initialize({
				reference: sReference,
				componentId: sComponentId
			});
			var aDummyFlexObjects = [
				FlexObjectFactory.createUIChange({ id: "dummyChange1", layer: "CUSTOMER" }),
				FlexObjectFactory.createUIChange({ id: "dummyChange2", layer: "VENDOR" })
			];
			this.oCheckUpdateSelectorStub.reset();
			sandbox.stub(FlexInfoSession, "getByReference").returns({ adaptationLayer: Layer.VENDOR });
			FlexState.addDirtyFlexObjects(sReference, aDummyFlexObjects, sComponentId);
			assert.deepEqual(
				FlexState.getFlexObjectsDataSelector().get({ reference: sReference }),
				[aDummyFlexObjects[1]],
				"then just one flexObject with valid layer is added to the selector"
			);
			assert.strictEqual(
				this.oCheckUpdateSelectorStub.callCount,
				1,
				"then the selector is updated once after initialize"
			);
			FlexState.removeDirtyFlexObjects(sReference, aDummyFlexObjects);
			assert.strictEqual(
				FlexState.getFlexObjectsDataSelector().get({ reference: sReference }).length,
				0,
				"then the flexObjects are removed from the selector"
			);
			assert.strictEqual(
				this.oCheckUpdateSelectorStub.callCount,
				2,
				"then the selector is called only once more during the removal"
			);
		});

		QUnit.test("When trying to remove multiple non-existing FlexObjects", async function(assert) {
			await FlexState.initialize({
				reference: sReference,
				componentId: sComponentId
			});
			const aDummyFlexObjects = [
				{ test: "test" },
				{ test2: "test2" }
			];
			FlexState.addDirtyFlexObjects(sReference, aDummyFlexObjects, sComponentId);
			this.oCheckUpdateSelectorStub.reset();

			FlexState.removeDirtyFlexObjects(sReference, [{ test: "someOtherFlexObject" }]);
			assert.strictEqual(
				FlexState.getFlexObjectsDataSelector().get({ reference: sReference }).length,
				2,
				"then the other flex objects are not removed from the selector"
			);
			assert.strictEqual(
				this.oCheckUpdateSelectorStub.callCount,
				0,
				"then the selector is not updated since nothing was removed"
			);
		});

		QUnit.test("When data from the storage response is loaded", function(assert) {
			mockLoader({
				changes: {
					appDescriptorChanges: [
						{ appDescriptorChange: true }
					],
					comp: {
						variants: [{ changeType: "variant1" }]
					}
				}
			});
			return FlexState.initialize({
				reference: sReference,
				componentId: sComponentId
			})
			.then(function() {
				assert.deepEqual(
					FlexState.getFlexObjectsDataSelector().get({ reference: sReference }).length,
					2,
					"then the flexObjects are created and added to the selector"
				);
				assert.deepEqual(FlexState.getAppDescriptorChanges(sReference).length,
					1,
					"then the data is set correctly");
				assert.strictEqual(
					FlexState.getAppDescriptorChanges(sReference)[0].getFileType(),
					"change",
					"then the file type is correct"
				);
				assert.strictEqual(
					FlexState.getFlexObjectsDataSelector().get({ reference: sReference })[0].getFileType(),
					"change",
					"then the file type is correct"
				);
				assert.strictEqual(
					FlexState.getFlexObjectsDataSelector().get({ reference: sReference })[1].getFlexObjectMetadata().changeType,
					"variant1",
					"then the data is set correctly"
				);
			});
		});

		QUnit.test("When the storage response includes variants that reference an unavailable parent variant", function(assert) {
			mockLoader({
				changes: {
					variants: [{
						// Same id but belongs to a different vm
						variantReference: "someOtherVmReference",
						variantManagementReference: "someOtherVmReference",
						fileType: "ctrl_variant",
						fileName: "someOtherVariant",
						layer: "USER",
						support: {
							user: "user1"
						}
					}, {
						variantReference: "someOtherVariant",
						variantManagementReference: "vmReference",
						fileType: "ctrl_variant",
						fileName: "customVariant",
						layer: "PUBLIC",
						support: {
							user: "user2"
						}
					}]
				},
				authors: {
					user1: "First1 Last1",
					user2: "First2 Last2"
				}
			});
			return FlexState.initialize({
				reference: sReference,
				componentId: sComponentId
			})
			.then(function() {
				const aFlexObjects = FlexState.getFlexObjectsDataSelector().get({ reference: sReference });
				assert.strictEqual(aFlexObjects.length, 4, "then two additional flex objects are created");
				assert.equal(aFlexObjects[0].getAuthor(), "You", "then the author of the first variant is correct");
				assert.equal(aFlexObjects[1].getAuthor(), "First2 Last2", "then the author of the second variant is correct");
				assert.strictEqual(
					aFlexObjects[1].getVariantReference(), "vmReference",
					"then the variant reference is changed to the standard variant"
				);
				assert.ok(
					aFlexObjects.every((oFlexObject) => oFlexObject.getState() === States.LifecycleState.PERSISTED),
					"all flex objects are set to persisted"
				);
			});
		});
	});

	QUnit.module("FlexState with loadFlexData, callPrepareFunction and filtering stubbed", {
		beforeEach() {
			this.oLoadFlexDataStub = mockLoader();
			this.oCallPrepareFunctionStub = sandbox.stub(FlexState, "callPrepareFunction").callsFake(mockPrepareFunctions);
			this.oAppComponent = new UIComponent(sComponentId);
			this.oIsLayerFilteringRequiredStub = sandbox.stub(LayerUtils, "isLayerFilteringRequired").returns(false);
			this.oGetFlexInfoSessionStub = sandbox.stub(FlexInfoSession, "getByReference").returns({});
			this.sFlexReference = "flexReference";
		},
		afterEach() {
			FlexInfoSession.removeByReference();
			FlexState.clearState();
			this.oAppComponent.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when initialize is called with complete information", function(assert) {
			assert.notOk(FlexState.isInitialized({ reference: sReference }), "FlexState is not initialized at beginning");
			assert.notOk(FlexState.isInitialized({ control: this.oAppComponent }), "FlexState is not initialized at beginning");
			var aInitialPreparationSpies = Object.getOwnPropertyNames(InitialPrepareFunctions).map(function(sName) {
				return sandbox.spy(InitialPrepareFunctions, sName);
			});

			return FlexState.initialize({
				reference: sReference,
				componentId: sComponentId
			})
			.then(function() {
				assert.ok(FlexState.isInitialized({ reference: sReference }), "FlexState has been initialized");
				assert.notOk(FlexState.isInitialized({ control: this.oAppComponent }), "FlexState is not initialized at beginning");
				assert.strictEqual(this.oLoadFlexDataStub.callCount, 1, "the FlexState made a call to load the flex data");
				assert.strictEqual(this.oCallPrepareFunctionStub.callCount, 0, "no prepare function was called");
				return FlexState.getStorageResponse(sReference);
			}.bind(this))
			.then(function() {
				assert.ok(
					aInitialPreparationSpies.every(function(oSpy) {
						return oSpy.calledOnce;
					}),
					"then the initial prepare functions are all called during the state initialization"
				);
			});
		});

		QUnit.test("when initialize is called without a reference and with a componentID", function(assert) {
			const oMockResponse = { changes: merge(StorageUtils.getEmptyFlexDataResponse(), { foo: "FlexResponse" }), authors: {} };
			this.oLoadFlexDataStub = mockLoader(oMockResponse);

			const oExpectedResponse = { ...oMockResponse };

			return FlexState.initialize({
				componentId: sComponentId
			})
			.then(FlexState.getStorageResponse.bind(null, ManifestUtils.getFlexReference({
				manifest: this.oAppComponent.getManifest(),
				componentData: {}
			})))
			.then(function(oFlexResponse) {
				assert.deepEqual(oFlexResponse, oExpectedResponse, "then flex state was initialized correctly");
			});
		});

		QUnit.test("when initialize is called without a componentId", async function(assert) {
			const aInitialPreparationSpies = Object.getOwnPropertyNames(InitialPrepareFunctions).map(function(sName) {
				return sandbox.spy(InitialPrepareFunctions, sName);
			});
			await FlexState.initialize({
				reference: sReference
			});
			assert.ok(
				aInitialPreparationSpies.every(function(oSpy) {
					return oSpy.notCalled;
				}),
				"then the initial prepare functions are not called during the state initialization"
			);
		});

		QUnit.test("when initialize is called without appComponent", function(assert) {
			this.oAppComponent.destroy();
			return FlexState.initialize({
				reference: sReference,
				componentId: sComponentId
			})
			.then(function() {
				assert.equal(this.oLoadFlexDataStub.callCount, 1, "the data is only requested once");
			}.bind(this));
		});

		QUnit.test("when initialize is called multiple times with the same reference without waiting", async function(assert) {
			assert.expect(3);
			this.oLoadFlexDataStub.callsFake((mProperties) => {
				// Simulate the following scenario:
				// First initialization takes some time and second and third are called before the first one is finished
				// The second one takes longer than then third one
				// Expectation is that the initializations still finish in order
				const oPromise = (mProperties.expectedOrder === 3)
					? Promise.resolve()
					: new Promise((resolve) => {
						setTimeout(() => {
							resolve();
						}, 0);
					});
				return oPromise.then(() => {
					assert.strictEqual(
						this.oLoadFlexDataStub.callCount,
						mProperties.expectedOrder,
						"then the initializations are executed in order and wait for each other"
					);
					return {
						data: mEmptyResponse,
						parameters: {}
					};
				});
			});
			FlexState.initialize({
				reference: sReference,
				componentId: sComponentId,
				expectedOrder: 1
			});
			FlexState.initialize({
				reference: sReference,
				reInitialize: true,
				componentId: sComponentId,
				expectedOrder: 2
			});
			await FlexState.initialize({
				reference: sReference,
				reInitialize: true,
				componentId: sComponentId,
				expectedOrder: 3
			});
		});

		QUnit.test("when initialize is called multiple times with an async callback depending on the state", function(assert) {
			// This test covers a previous bug where the FlexState was not initialized completely
			// i.e. it was cleared during the second initialization but the storageResponse was not yet set
			// because the process was async
			// This resulted in a failing DataSelector, which is tested here

			const oSecondLoadPromise = new Promise((resolve) => {
				this.fnResolve = resolve;
			});
			this.oLoadFlexDataStub.callsFake(() => {
				if (this.oLoadFlexDataStub.callCount === 1) {
					this.fnResolve();
				}
				return Promise.resolve({
					data: mEmptyResponse,
					parameters: {}
				});
			});

			const fnDone = assert.async();
			FlexState.initialize({
				reference: sReference,
				componentId: sComponentId
			})
			.then(async function() {
				await oSecondLoadPromise;
				await Promise.resolve();
				const aFlexObjects = FlexState.getFlexObjectsDataSelector().get({ reference: sReference });
				assert.strictEqual(aFlexObjects.length, 0, "then the flex objects can be accessed");
				fnDone();
			});

			FlexState.initialize({
				reference: sReference,
				reInitialize: true,
				componentId: sComponentId
			});
		});

		QUnit.test("when getAppDescriptorChanges is called without initialization", function(assert) {
			return FlexState.initialize({
				reference: "sap.ui.fl.other.reference",
				componentId: sComponentId
			})
			.then(function() {
				assert.equal(this.oCallPrepareFunctionStub.callCount, 0, "no prepare function was called");
			}.bind(this));
		});

		QUnit.test("when getAppDescriptorChanges is called with proper initialization", function(assert) {
			return FlexState.initialize({
				reference: sReference,
				componentId: sComponentId
			})
			.then(function() {
				assert.strictEqual(this.oIsLayerFilteringRequiredStub.callCount, 1, "the filtering is done during initialization");

				assert.deepEqual(FlexState.getAppDescriptorChanges(sReference), [], "the correct map is returned");
				assert.strictEqual(this.oIsLayerFilteringRequiredStub.callCount, 1, "the filtering was not triggered again");
				assert.deepEqual(FlexState.getAppDescriptorChanges(sReference), [], "the correct map is returned");
				assert.strictEqual(this.oCallPrepareFunctionStub.callCount, 0, "the prepare function was not called again");
				assert.strictEqual(this.oIsLayerFilteringRequiredStub.callCount, 1, "the filtering was not triggered again");
			}.bind(this));
		});
	});

	function getUshellContainerStub(oRegistrationHandlerStub, oDeRegistrationHandlerStub) {
		var oUShellService = {
			getServiceAsync(sService) {
				if (sService === "ShellNavigationInternal") {
					return Promise.resolve({
						registerNavigationFilter: oRegistrationHandlerStub,
						unregisterNavigationFilter: oDeRegistrationHandlerStub,
						NavigationFilterStatus: {
							Continue: "continue"
						}
					});
				}
				return Promise.resolve();
			}
		};
		return sandbox.stub(Utils, "getUshellContainer").returns(oUShellService);
	}

	QUnit.module("FlexState with loadFlexData and callPrepareFunction stubbed, filtering active", {
		beforeEach() {
			this.oLoadFlexDataStub = mockLoader();
			this.oCallPrepareFunctionStub = sandbox.stub(FlexState, "callPrepareFunction").callsFake(mockPrepareFunctions);
			this.oAppComponent = new UIComponent(sComponentId);
			this.oIsLayerFilteringRequiredStub = sandbox.stub(LayerUtils, "isLayerFilteringRequired").returns(true);
			sandbox.stub(FlexInfoSession, "getByReference").returns({ maxLayer: Layer.CUSTOMER });
			getUshellContainerStub(sandbox.stub(), sandbox.stub());
		},
		afterEach() {
			FlexState.clearState();
			this.oAppComponent.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when initialize is called twice with the same reference", function(assert) {
			return FlexState.initialize({
				reference: sReference,
				componentId: sComponentId
			})
			.then(function() {
				assert.equal(this.oIsLayerFilteringRequiredStub.callCount, 1, "the check was made once");
			}.bind(this))
			.then(FlexState.initialize.bind(null, {
				reference: sReference,
				componentId: sComponentId
			}))
			.then(function() {
				assert.equal(this.oIsLayerFilteringRequiredStub.callCount, 1, "the check was not made again");
			}.bind(this));
		});

		QUnit.test("when initialize is called twice with rebuildFilteredResponse() in between", async function(assert) {
			await FlexState.initialize({
				reference: sReference,
				componentId: sComponentId
			});
			assert.equal(this.oIsLayerFilteringRequiredStub.callCount, 1, "the check was made once");

			FlexState.rebuildFilteredResponse(sReference);
			await FlexState.initialize({
				reference: sReference,
				componentId: sComponentId
			});

			FlexState.getAppDescriptorChanges(sReference);
			assert.equal(this.oIsLayerFilteringRequiredStub.callCount, 2, "the check was made again");
		});
	});

	QUnit.module("FlexState with two changes in different layers", {
		beforeEach() {
			FlexInfoSession.removeByReference(sReference);
			this.oLoadFlexDataStub = mockLoader({
				changes: {
					changes: [
						{
							fileName: "uiChangeCustomer",
							layer: Layer.CUSTOMER
						},
						{
							fileName: "uiChangeUser",
							layer: Layer.USER
						}
					]
				}
			});
		},
		afterEach() {
			FlexInfoSession.removeByReference(sReference);
			FlexState.clearState();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when initialize is called with and without max layer set", async function(assert) {
			const oDataSelector = FlexState.getFlexObjectsDataSelector();
			await FlexState.initialize({
				reference: sReference,
				componentId: sComponentId
			});
			assert.strictEqual(oDataSelector.get({ reference: sReference }).length, 2, "without max layer, no changes were filtered");

			FlexInfoSession.setByReference({ maxLayer: Layer.CUSTOMER }, sReference);
			await FlexState.initialize({
				reference: sReference,
				componentId: sComponentId
			});
			assert.strictEqual(oDataSelector.get({ reference: sReference }).length, 1, "adding a max layer, one change was filtered");

			FlexInfoSession.setByReference({}, sReference);
			await FlexState.initialize({
				reference: sReference,
				componentId: sComponentId
			});
			assert.strictEqual(oDataSelector.get({ reference: sReference }).length, 2, "removing max layer, all changes are available again");
		});
	});

	QUnit.module("FlexState with Storage stubs", {
		beforeEach() {
			this.oAppComponent = new UIComponent(sComponentId);

			this.oLoaderSpy = sandbox.spy(Loader, "getFlexData");
			this.oApplyStorageLoadFlexDataStub = sandbox.stub(Storage, "loadFlexData");
			this.oApplyStorageCompleteFlexDataSpy = sandbox.spy(Storage, "completeFlexData");
		},
		afterEach() {
			FlexState.clearState();
			this.oAppComponent.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when initialize is called in parallel after skipLoadBundle is set", function(assert) {
			var mResponse = merge(
				{},
				mEmptyResponse,
				{
					changes: {
						changes: [{
							fileType: "change",
							changeType: "propertyChange",
							layer: LayerUtils.getCurrentLayer()
						}]
					}
				}
			);
			this.oApplyStorageLoadFlexDataStub.resolves(mResponse.changes);
			var oFlexStateSpy = sandbox.spy(FlexState, "initialize");
			return FlexState.initialize({
				reference: sReference,
				componentId: sComponentId,
				skipLoadBundle: true
			})
			.then(function() {
				assert.equal(oFlexStateSpy.callCount, 1, "FlexState is called once");
				assert.equal(this.oLoaderSpy.callCount, 1, "Loader is called once");
				assert.equal(this.oApplyStorageLoadFlexDataStub.callCount, 1, "storage loadFlexData is called once");
				assert.equal(this.oApplyStorageCompleteFlexDataSpy.callCount, 0, "storage completeFlexData is not called");
			}.bind(this))
			.then(function() {
				var oStatePromise1 = FlexState.initialize({
					reference: sReference,
					componentId: sComponentId
				});
				var oStatePromise2 = FlexState.initialize({
					reference: sReference,
					componentId: sComponentId
				});
				return Promise.all([oStatePromise1, oStatePromise2]);
			})
			.then(function() {
				assert.equal(oFlexStateSpy.callCount, 3, "FlexState is called three times");
				assert.equal(this.oLoaderSpy.callCount, 3, "Loader is called three times");
				assert.equal(this.oApplyStorageLoadFlexDataStub.callCount, 1, "storage loadFlexData is called once");
				assert.equal(this.oApplyStorageCompleteFlexDataSpy.callCount, 1, "storage completeFlexData is called once");
				return FlexState.getStorageResponse(sReference);
			}.bind(this))
			.then(function(oUnfilteredStorageResponse) {
				assert.equal(oUnfilteredStorageResponse.changes.changes.length, 1, "there is one changes");
			});
		});

		QUnit.test("when initialize is called multiple times and the loader response changing in between", async function(assert) {
			const mResponse = merge(
				{},
				mEmptyResponse,
				{
					changes: {
						changes: [{
							fileType: "change",
							changeType: "propertyChange",
							layer: LayerUtils.getCurrentLayer()
						}]
					}
				}
			);
			this.oApplyStorageLoadFlexDataStub.resolves(mResponse.changes);
			const oCheckUpdateSpy = sandbox.spy(FlexState.getFlexObjectsDataSelector(), "checkUpdate");
			await FlexState.initialize({
				reference: sReference,
				componentId: sComponentId
			});
			assert.strictEqual(this.oLoaderSpy.callCount, 1, "Loader is called once");
			assert.strictEqual(this.oApplyStorageLoadFlexDataStub.callCount, 1, "storage loadFlexData is called once");
			assert.strictEqual(oCheckUpdateSpy.callCount, 1, "the selector is updated once");

			await FlexState.initialize({
				reference: sReference,
				componentId: sComponentId
			});
			assert.strictEqual(oCheckUpdateSpy.callCount, 1, "the selector is not updated");

			// trigger update of the loader
			Loader.updateCachedResponse(sReference, []);

			await FlexState.initialize({
				reference: sReference,
				componentId: sComponentId
			});
			assert.strictEqual(oCheckUpdateSpy.callCount, 2, "the selector is updated");
		});
	});

	QUnit.module("Fake Standard Variants", {
		beforeEach() {
			sComponentId = "componentId";
			this.sReference = "flexReference";
			this.sSecondReference = "secondReference";
			this.oVariant = FlexObjectFactory.createFlVariant({
				id: "myStandardVariant",
				reference: this.sReference
			});
			mockLoader();
			this.oAppComponent = new UIComponent(sComponentId);
			FlexState.rebuildFilteredResponse(this.sReference);
			return FlexState.initialize({
				reference: this.sReference,
				componentId: sComponentId
			});
		},
		afterEach() {
			sandbox.restore();
			this.oAppComponent.destroy();
			FlexState.rebuildFilteredResponse(this.sReference);
			FlexState.clearRuntimeSteadyObjects(this.sReference, sComponentId);
			FlexState.clearRuntimeSteadyObjects(this.sSecondReference, sComponentId);
		}
	}, function() {
		QUnit.test("when a fake standard variant is added to an initialized state", function(assert) {
			assert.strictEqual(
				FlexState.getFlexObjectsDataSelector().get({ reference: this.sReference }).length,
				0,
				"then initially no variants flex objects are part of the flex state"
			);

			FlexState.addRuntimeSteadyObject(this.sReference, sComponentId, this.oVariant);
			var aFlexObjects = FlexState.getFlexObjectsDataSelector().get({ reference: this.sReference });
			assert.strictEqual(
				aFlexObjects.length,
				1,
				"then the standard variant flex object is added"
			);
			assert.deepEqual(
				aFlexObjects[0],
				this.oVariant,
				"then the standard variant is returned by the data selector"
			);
			assert.strictEqual(
				aFlexObjects[0].getState(),
				States.LifecycleState.PERSISTED,
				"the standard variant state is set to persisted"
			);
		});

		QUnit.test("when a fake standard variant is added without an initialized state", function(assert) {
			assert.strictEqual(
				FlexState.getFlexObjectsDataSelector().get({ reference: this.sSecondReference }).length,
				0,
				"then initially no variants flex objects are part of the flex state"
			);

			FlexState.addRuntimeSteadyObject(this.sSecondReference, sComponentId, this.oVariant);
			var aFlexObjects = FlexState.getFlexObjectsDataSelector().get({ reference: this.sSecondReference });
			assert.strictEqual(
				aFlexObjects.length,
				1,
				"then the standard variant flex object is added"
			);
			assert.deepEqual(
				aFlexObjects[0],
				this.oVariant,
				"then the standard variant is returned by the data selector"
			);
			assert.strictEqual(
				aFlexObjects[0].getState(),
				States.LifecycleState.PERSISTED,
				"the standard variant state is set to persisted"
			);
			const oInitializeEmptyCacheSpy = sandbox.spy(Loader, "initializeEmptyCache");
			FlexState.addRuntimeSteadyObject(this.sSecondReference, sComponentId, this.oVariant);
			assert.ok(
				oInitializeEmptyCacheSpy.notCalled,
				"then the empty state is not initialized twice for the same component ID"
			);
		});

		QUnit.test("when the fake standard variants are reset", function(assert) {
			FlexState.addRuntimeSteadyObject(this.sReference, sComponentId, this.oVariant);
			FlexState.clearRuntimeSteadyObjects(this.sReference, sComponentId);
			assert.strictEqual(
				FlexState.getFlexObjectsDataSelector().get({ reference: this.sReference }).length,
				0,
				"then the variant is removed"
			);
		});

		QUnit.test("adding fake variants for components with the same reference but different IDs", function(assert) {
			var sComponentId2 = "componentId2";
			var oAppComponent2 = new UIComponent(sComponentId2);
			return FlexState.initialize({
				reference: this.sReference,
				componentId: sComponentId2
			}).then(function() {
				var oVariant2 = FlexObjectFactory.createFlVariant({
					id: "bar",
					reference: this.sReference
				});
				FlexState.addRuntimeSteadyObject(this.sReference, sComponentId, this.oVariant);
				const oInitializeEmptyCacheSpy = sandbox.spy(Loader, "initializeEmptyCache");
				FlexState.addRuntimeSteadyObject(this.sReference, sComponentId2, oVariant2);

				FlexState.rebuildFilteredResponse(this.sReference);
				assert.strictEqual(
					FlexState.getFlexObjectsDataSelector().get({ reference: this.sReference }).length,
					1,
					"then only one fake variant is available"
				);
				assert.ok(
					oInitializeEmptyCacheSpy.calledOnce,
					"then the empty state is initialized again for the new component ID"
				);

				FlexState.clearRuntimeSteadyObjects(this.sReference, sComponentId2);
				oAppComponent2.destroy();
			}.bind(this));
		});
	});

	QUnit.module("FlexState update", {
		beforeEach() {
			this.sComponentId = "componentId";
			this.oAppComponent = new UIComponent(sComponentId);
			this.sPersistencyKey = "persistencyKey";
		},
		afterEach() {
			FlexState.clearState();
			this.oAppComponent.destroy();
			sandbox.restore();
		}
	}, function() {
		[true, false].forEach((bInitFlexState) => {
			const sName = `new change is updated (e.g. after a save)${bInitFlexState ? " with initialized FlexState" : ""}`;
			QUnit.test(sName, async function(assert) {
				var oDataSelectorUpdateSpy;
				if (bInitFlexState) {
					await FlexState.initialize({
						reference: sReference,
						componentId: this.sComponentId
					});
				}
				// New change created in runtime
				var oNewChange = FlexObjectFactory.createFromFileContent({
					fileName: "change1",
					fileType: "change",
					changeType: "rename",
					layer: LayerUtils.getCurrentLayer()
				});
				oNewChange.setRevertData("revertData");
				const oLoaderInitializeEmptyCacheSpy = sandbox.spy(Loader, "initializeEmptyCache");
				FlexState.addDirtyFlexObjects(sReference, [oNewChange], this.sComponentId);

				assert.strictEqual(
					oLoaderInitializeEmptyCacheSpy.notCalled,
					bInitFlexState,
					"then initializeEmptyCache is called only if FlexState was not initialized before"
				);

				// Change gets additional information from storage response (user)
				mockLoader({
					changes: {
						changes: [{
							fileName: "change1",
							fileType: "change",
							changeType: "rename",
							layer: LayerUtils.getCurrentLayer(),
							support: {
								user: "supportUser"
							}
						}]
					}
				});
				oDataSelectorUpdateSpy = sandbox.spy(FlexState.getFlexObjectsDataSelector(), "checkUpdate");
				await FlexState.reinitialize({
					reference: sReference,
					componentId: this.sComponentId,
					manifest: {},
					componentData: {}
				});
				var aChanges = FlexState.getFlexObjectsDataSelector().get({ reference: sReference });
				assert.strictEqual(aChanges[0].getRevertData(), "revertData", "then the runtime information is still available");
				assert.strictEqual(
					aChanges[0].getSupportInformation().user,
					"supportUser",
					"then the change is updated with the additional information from the backend"
				);
				assert.strictEqual(oDataSelectorUpdateSpy.callCount, 1, "then the data selector update was called");
			});
		});

		QUnit.test("new comp variant change gets updated", async function(assert) {
			await FlexState.initialize({
				reference: sReference,
				componentId: this.sComponentId
			});

			const oNewChange = FlexObjectFactory.createFromFileContent({
				fileName: "change1",
				reference: sReference,
				fileType: "change",
				selector: {
					persistencyKey: this.sPersistencyKey
				}
			});
			FlexState.addDirtyFlexObjects(sReference, [oNewChange], this.sComponentId);

			// The new change gets additional information from storage response (user)
			mockLoader({
				changes: {
					comp: {
						variants: [],
						changes: [{
							fileName: "change1",
							fileType: "change",
							reference: sReference,
							selector: {
								persistencyKey: this.sPersistencyKey
							},
							support: {
								user: "supportUser"
							}
						}],
						defaultVariants: [],
						standardVariants: []
					}
				}
			});

			const oDataSelectorUpdateSpy = sandbox.spy(FlexState.getFlexObjectsDataSelector(), "checkUpdate");
			await FlexState.reinitialize({
				reference: sReference,
				componentId: this.sComponentId,
				manifest: {},
				componentData: {}
			});

			const aChanges = UIChangesState.getAllUIChanges(sReference);
			assert.strictEqual(
				aChanges[0].getSupportInformation().user,
				"supportUser",
				"then the new change is updated with the additional information from the backend"
			);
			assert.strictEqual(oDataSelectorUpdateSpy.callCount, 1, "then the data selector update was called");
		});

		QUnit.test("A flex object is deleted", async function(assert) {
			// Get initial comp variant changes
			mockLoader({
				changes: {
					comp: {
						variants: [],
						changes: [{
							fileName: "change1",
							fileType: "change",
							selector: {
								persistencyKey: this.sPersistencyKey
							},
							support: {
								user: "supportUser"
							}
						},
						{
							fileName: "change2",
							fileType: "change",
							selector: {
								persistencyKey: this.sPersistencyKey
							},
							support: {
								user: "supportUser"
							}
						}],
						defaultVariants: [],
						standardVariants: []
					}
				}
			});

			await FlexState.initialize({
				reference: sReference,
				componentId: this.sComponentId
			});
			const oDataSelectorUpdateSpy = sandbox.spy(FlexState.getFlexObjectsDataSelector(), "checkUpdate");
			// Change1 is deleted (no longer in storage response)
			mockLoader({
				changes: {
					comp: {
						variants: [],
						changes: [{
							fileName: "change2",
							fileType: "change",
							selector: {
								persistencyKey: this.sPersistencyKey
							},
							support: {
								user: "supportUser"
							}
						}],
						defaultVariants: [],
						standardVariants: []
					}
				}
			});

			await FlexState.reinitialize({
				reference: sReference,
				componentId: this.sComponentId,
				manifest: {},
				componentData: {}
			});

			assert.strictEqual(
				UIChangesState.getAllUIChanges(sReference).length,
				1,
				"then one flex object was deleted"
			);
			assert.strictEqual(oDataSelectorUpdateSpy.callCount, 1, "then the data selector update was called");
		});

		QUnit.test("no update required (nothing changed)", async function(assert) {
			// Get initial comp variant changes
			mockLoader({
				changes: {
					comp: {
						variants: [],
						changes: [{
							fileName: "change1",
							fileType: "change",
							selector: {
								persistencyKey: this.sPersistencyKey
							},
							support: {
								user: "supportUser"
							}
						},
						{
							fileName: "change2",
							fileType: "change",
							selector: {
								persistencyKey: this.sPersistencyKey
							},
							support: {
								user: "supportUser"
							}
						}],
						defaultVariants: [],
						standardVariants: []
					}
				}
			});

			await FlexState.initialize({
				reference: sReference,
				componentId: this.sComponentId
			});

			const oDataSelectorUpdateSpy = sandbox.spy(FlexState.getFlexObjectsDataSelector(), "checkUpdate");
			// nothing changes - same data is returned from the storage
			await FlexState.reinitialize({
				reference: sReference,
				componentId: this.sComponentId,
				manifest: {},
				componentData: {}
			});

			assert.strictEqual(
				UIChangesState.getAllUIChanges(sReference).length,
				2,
				"then both objects are still in the persistence"
			);
			assert.strictEqual(oDataSelectorUpdateSpy.callCount, 0, "then the data selector update was not called");
		});

		QUnit.test("when calling FlexState.reinitialize twice in a row", async function(assert) {
			assert.expect(1);
			this.oLoadFlexDataStub = mockLoader();
			this.oLoadFlexDataStub
			.resolves({
				data: mEmptyResponse,
				parameters: {}
			});

			await FlexState.initialize({
				reference: sReference,
				componentId: this.sComponentId
			});
			this.oLoadFlexDataStub.resetHistory();

			this.oLoadFlexDataStub
			.onFirstCall()
			.callsFake(async () => {
				// Simulate some async stuff happening during load
				await Promise.resolve();

				assert.strictEqual(
					this.oLoadFlexDataStub.callCount,
					1,
					"then the second update doesn't call loadFlexData before the first one finished"
				);
				return {
					data: mEmptyResponse,
					parameters: {}
				};
			});

			await Promise.all([
				FlexState.reinitialize({
					reference: sReference,
					componentId: this.sComponentId,
					manifest: {},
					componentData: {}
				}),
				FlexState.reinitialize({
					reference: sReference,
					componentId: this.sComponentId,
					manifest: {},
					componentData: {}
				})
			]);
		});

		QUnit.test("when reinitialize is called with existing instance", async function(assert) {
			mockLoader({
				changes: {
					changes: [{
						fileName: "change1",
						fileType: "change"
					}]
				}
			});

			await FlexState.initialize({
				reference: sReference,
				componentId: this.sComponentId
			});

			const oChange1 = FlexState.getFlexObjectsDataSelector().get({ reference: sReference })[0];
			FlexState.removeDirtyFlexObjects(sReference, [oChange1]);
			FlexState.addDirtyFlexObjects(sReference, [oChange1], this.sComponentId);

			mockLoader({
				changes: {
					changes: [
						{
							fileName: "change1",
							fileType: "change"
						}
					]
				}
			});

			await FlexState.reinitialize({
				reference: sReference,
				componentId: this.sComponentId,
				manifest: {},
				componentData: {}
			});

			const aChanges = FlexState.getFlexObjectsDataSelector().get({ reference: sReference });
			assert.strictEqual(
				UIChangesState.getAllUIChanges(sReference).length,
				1,
				"then the change is not duplicated"
			);
			assert.strictEqual(aChanges.length, 1, "then the instance is updated with the change");
		});

		QUnit.test("when reinitialize is called multiple times sequentially", async function(assert) {
			this.oLoadFlexDataStub = mockLoader();

			await FlexState.reinitialize({
				reference: sReference,
				componentId: this.sComponentId,
				manifest: {},
				componentData: {}
			});

			await FlexState.reinitialize({
				reference: sReference,
				componentId: this.sComponentId,
				manifest: {},
				componentData: {}
			});

			await FlexState.reinitialize({
				reference: sReference,
				componentId: this.sComponentId,
				manifest: {},
				componentData: {}
			});

			assert.strictEqual(this.oLoadFlexDataStub.callCount, 3, "then loadFlexData is called for each reinitialize");
			assert.ok(FlexState.isInitialized({ reference: sReference }), "then FlexState remains initialized");
		});

		QUnit.test("when reinitialize is called without existing instance", async function(assert) {
			mockLoader({
				changes: {
					changes: [{
						fileName: "change1",
						fileType: "change"
					}]
				}
			});

			await FlexState.reinitialize({
				reference: sReference,
				componentId: this.sComponentId,
				manifest: {},
				componentData: {}
			});

			const aChanges = FlexState.getFlexObjectsDataSelector().get({ reference: sReference });
			assert.strictEqual(aChanges.length, 1, "then the instance is initialized with the changes");
			assert.ok(FlexState.isInitialized({ reference: sReference }), "then FlexState is initialized");
		});

		QUnit.test("An unknown object is returned from storage", function(assert) {
			var fnDone = assert.async();
			FlexState.initialize({
				reference: sReference,
				componentId: this.sComponentId
			})
			.then(function() {
				var oNewChange = FlexObjectFactory.createFromFileContent({
					fileName: "change1",
					fileType: "change",
					selector: {
						persistencyKey: this.sPersistencyKey
					}
				});
				FlexState.addDirtyFlexObjects(sReference, [oNewChange], this.sComponentId);

				// The new change is returned together with an unknown change
				mockLoader({
					changes: {
						comp: {
							variants: [],
							changes: [{
								fileName: "change1",
								fileType: "change",
								selector: {
									persistencyKey: this.sPersistencyKey
								},
								support: {
									user: "supportUser"
								}
							},
							{
								fileName: "change2",
								fileType: "change",
								selector: {
									persistencyKey: this.sPersistencyKey
								},
								support: {
									user: "supportUser"
								}
							}],
							defaultVariants: [],
							standardVariants: []
						}
					}
				});
				return FlexState.reinitialize({
					reference: sReference,
					componentId: this.sComponentId,
					manifest: {},
					componentData: {}
				});
			}.bind(this))
			.catch(function(oError) {
				assert.ok(oError, "then an error is raised");
				// Use assert.async instead of direct return to make sure that the promise is rejected
				fnDone();
			});
		});

		QUnit.test("An unknown object is returned from storage, that is allowed to be returned", async function(assert) {
			await FlexState.initialize({
				reference: sReference,
				componentId: this.sComponentId
			});
			const oNewChange = FlexObjectFactory.createFromFileContent({
				fileName: "change1",
				fileType: "change"
			});
			FlexState.addDirtyFlexObjects(sReference, [oNewChange], this.sComponentId);

			// The new change is returned together with an unknown change
			mockLoader({
				changes: {
					changes: [{
						fileName: "change1",
						fileType: "change"
					}],
					variantChanges: [{
						fileName: "change2_flVariant_contextFiltering_setVisible",
						fileType: "ctrl_variant_change",
						content: {
							visible: false,
							createdByReset: false
						}
					}]
				}
			});

			await FlexState.reinitialize({
				reference: sReference,
				componentId: this.sComponentId,
				manifest: {},
				componentData: {}
			});

			const aChanges = FlexState.getFlexObjectsDataSelector().get({ reference: sReference });
			assert.strictEqual(
				aChanges.length,
				2,
				"then both objects are added to the persistence"
			);
		});
	});

	QUnit.module("FlexState.lazyLoadFlVariant", {
		async beforeEach() {
			mockLoader({
				changes: {
					changes: [
						{
							fileName: "uiChangeCustomer",
							layer: Layer.CUSTOMER
						}
					]
				}
			});
			const oResponse = await fetch("test-resources/sap/ui/fl/qunit/testResources/TestVariantsConnectorResponse.json");
			this.oJson = await oResponse.json();
			sandbox.stub(Loader, "loadFlVariant").resolves({
				newData: this.oJson,
				completeLoaderData: {
					data: merge(
						{},
						this.oJson,
						{
							changes: [{
								fileName: "uiChangeCustomer",
								layer: Layer.CUSTOMER
							}]
						}
					),
					parameters: {
						loaderCacheKey: "someCacheKey"
					}
				}
			});
			this.oCreateFlexObjectSpy = sandbox.spy(FlexObjectFactory, "createFromFileContent");
		},
		afterEach() {
			FlexState.clearState();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("with an initialized state and without max layer filtering", async function(assert) {
			sandbox.stub(LayerUtils, "isLayerFilteringRequired").returns(false);
			sandbox.stub(FlexInfoSession, "getByReference").returns({ maxLayer: Layer.CUSTOMER });
			await FlexState.initialize({
				reference: sReference,
				componentId: sComponentId
			});
			assert.strictEqual(this.oCreateFlexObjectSpy.callCount, 1, "one flexObject is created");
			await FlexState.lazyLoadFlVariant({
				reference: sReference,
				componentId: sComponentId
			});
			const aAllFlexObjects = FlexState.getFlexObjectsDataSelector().get({ reference: sReference });
			assert.strictEqual(aAllFlexObjects.length, 35, "all flex objects are loaded");
			assert.strictEqual(this.oCreateFlexObjectSpy.callCount, 35, "the initial changes is not created again");
		});

		QUnit.test("with an initialized state and with max layer filtering", async function(assert) {
			sandbox.stub(LayerUtils, "isLayerFilteringRequired").returns(true);
			sandbox.stub(FlexInfoSession, "getByReference").returns({ maxLayer: Layer.CUSTOMER });
			await FlexState.initialize({
				reference: sReference,
				componentId: sComponentId
			});
			assert.strictEqual(this.oCreateFlexObjectSpy.callCount, 1, "one flexObject is created");
			await FlexState.lazyLoadFlVariant({
				reference: sReference,
				componentId: sComponentId
			});
			const aAllFlexObjects = FlexState.getFlexObjectsDataSelector().get({ reference: sReference });
			assert.strictEqual(aAllFlexObjects.length, 31, "all flex objects are loaded");
			assert.strictEqual(this.oCreateFlexObjectSpy.callCount, 31, "the initial changes is not created again");
		});

		QUnit.test("without an initialized state", async function(assert) {
			await FlexState.lazyLoadFlVariant({
				reference: sReference,
				componentId: sComponentId
			});
			const aAllFlexObjects = FlexState.getFlexObjectsDataSelector().get({ reference: sReference });
			assert.strictEqual(aAllFlexObjects.length, 34, "all flex objects are loaded");
		});
	});

	QUnit.module("FlexState.update", {
		async beforeEach() {
			this.oAppComponent = new UIComponent(sComponentId);
			sandbox.stub(Storage, "loadFlexData").resolves(StorageUtils.getEmptyFlexDataResponse());
			await FlexState.initialize({
				reference: sReference,
				componentId: sComponentId,
				skipLoadBundle: true
			});
			// initial data
			const aInitialChanges = [
				FlexObjectFactory.createUIChange({ id: "initialUIChange1" }),
				FlexObjectFactory.createUIChange({ id: "initialUIChange2", variantReference: "initialFlVariant1" }),
				FlexObjectFactory.createUIChange({ id: "initialUIChange3", fileType: "ctrl_variant_change" }),
				FlexObjectFactory.createUIChange({ id: "initialUIChange4", fileType: "ctrl_variant_management_change" }),
				FlexObjectFactory.createFlVariant({ id: "initialFlVariant1" }),
				FlexObjectFactory.createCompVariant({ id: "initialCompVariant1" }),
				FlexObjectFactory.createUIChange({
					id: "initialUIChange5",
					selector: {
						persistencyKey: "foo"
					}
				})
			];
			FlexState.addDirtyFlexObjects(sReference, aInitialChanges, sComponentId);
			FlexState.update(sReference, aInitialChanges.map((flexObject) => ({
				type: "add",
				flexObject: flexObject.convertToFileContent()
			})));
			this.oUIChange = FlexObjectFactory.createUIChange({
				id: "uiChange1"
			});
			this.oVariantDepUIChange = FlexObjectFactory.createUIChange({
				id: "uiChange2",
				variantReference: "flVariant1"
			});
			this.oVariantChange1 = FlexObjectFactory.createUIChange({
				id: "uiChange3",
				fileType: "ctrl_variant_change"
			});
			this.oVariantChange2 = FlexObjectFactory.createUIChange({
				id: "uiChange4",
				fileType: "ctrl_variant_management_change"
			});
			this.oFlVariant = FlexObjectFactory.createFlVariant({
				id: "flVariant1"
			});
			this.oCompVariant = FlexObjectFactory.createCompVariant({
				id: "compVariant1"
			});
			this.oCompChange = FlexObjectFactory.createUIChange({
				id: "uiChange5",
				selector: {
					persistencyKey: "foo"
				}
			});
		},
		afterEach() {
			this.oAppComponent.destroy();
			sandbox.restore();
			FlexState.clearState(sReference);
		}
	}, function() {
		QUnit.test("with all operations at once", async function(assert) {
			const oFlexObjectsDataSelector = FlexState.getFlexObjectsDataSelector();
			let aFlexObjects = oFlexObjectsDataSelector.get({ reference: sReference });
			assert.strictEqual(aFlexObjects.length, 7, "initially there are 7 flexObjects");
			const aNewChanges = [
				this.oUIChange,
				this.oVariantChange1,
				this.oVariantChange2,
				this.oVariantDepUIChange,
				this.oFlVariant,
				this.oCompVariant,
				this.oCompChange
			];
			aNewChanges.forEach(function(oFlexObject) {
				FlexState.addDirtyFlexObjects(sReference, [oFlexObject], sComponentId);
			});
			FlexState.update(sReference, [
				...aNewChanges.map((flexObject) => ({
					type: "add",
					flexObject: flexObject.convertToFileContent()
				})),
				{ type: "ui2", newData: "ui2" }
			]);
			const oStorageResponse = await FlexState.getStorageResponse(sReference);
			assert.strictEqual(oStorageResponse.changes.changes.length, 2, "UIChange was added");
			assert.strictEqual(oStorageResponse.changes.variantDependentControlChanges.length, 2, "variant dependent UIChange was added");
			assert.strictEqual(oStorageResponse.changes.comp.changes.length, 2, "comp change was added");
			assert.strictEqual(oStorageResponse.changes.comp.variants.length, 2, "comp variant was added");
			assert.strictEqual(oStorageResponse.changes.variantChanges.length, 2, "variant change was added");
			assert.strictEqual(oStorageResponse.changes.variantManagementChanges.length, 2, "variant management change was added");
			assert.strictEqual(oStorageResponse.changes.variants.length, 2, "fl variant was added");
			assert.strictEqual(oStorageResponse.changes.ui2personalization, "ui2", "ui2 was set");

			aFlexObjects = oFlexObjectsDataSelector.get({ reference: sReference });
			assert.strictEqual(aFlexObjects.length, 14, "all flexObjects are part of the DataSelector");

			this.oFlVariant.setFavorite(true);
			this.oCompVariant.setFavorite(true);
			this.oUIChange.setContent("foo");
			this.oCompChange.setContent("bar");

			const oUpdateSpy = sandbox.spy(oFlexObjectsDataSelector, "checkUpdate");
			const aUpdates = [this.oUIChange, this.oFlVariant, this.oCompVariant, this.oCompChange];
			FlexState.update(sReference, [
				...aUpdates.map((flexObject) => ({
					type: "update",
					flexObject: flexObject.convertToFileContent()
				})),
				{ type: "ui2", newData: "newUi2" }
			]);
			assert.strictEqual(oStorageResponse.changes.ui2personalization, "newUi2", "ui2 was set");
			aFlexObjects = oFlexObjectsDataSelector.get({ reference: sReference });
			assert.strictEqual(aFlexObjects.length, 14, "all flexObjects are part of the DataSelector");
			assert.strictEqual(
				aFlexObjects.find((oFlexObject) => oFlexObject.getId() === "uiChange1").getContent(),
				"foo", "the content was updated"
			);
			assert.strictEqual(
				aFlexObjects.find((oFlexObject) => oFlexObject.getId() === "flVariant1").getFavorite(),
				true, "the favorite flag was updated"
			);
			assert.strictEqual(
				aFlexObjects.find((oFlexObject) => oFlexObject.getId() === "compVariant1").getFavorite(),
				true, "the favorite flag was updated"
			);
			assert.strictEqual(
				aFlexObjects.find((oFlexObject) => oFlexObject.getId() === "uiChange5").getContent(),
				"bar", "the content was updated"
			);

			const aDeletes = [this.oVariantDepUIChange, this.oFlVariant, this.oCompVariant, this.oCompChange];
			FlexState.update(sReference, aDeletes.map((flexObject) => ({
				type: "delete",
				flexObject: flexObject.convertToFileContent()
			})));
			aFlexObjects = oFlexObjectsDataSelector.get({ reference: sReference });
			assert.strictEqual(aFlexObjects.length, 10, "all remaining flexObjects are part of the DataSelector");
			assert.notOk(
				aFlexObjects.find((oFlexObject) => oFlexObject.getId() === this.oVariantDepUIChange.getId()),
				"the flexObject was deleted"
			);
			assert.notOk(
				aFlexObjects.find((oFlexObject) => oFlexObject.getId() === this.oFlVariant.getId()),
				"the flexObject was deleted"
			);
			assert.notOk(
				aFlexObjects.find((oFlexObject) => oFlexObject.getId() === this.oCompVariant.getId()),
				"the flexObject was deleted"
			);
			assert.notOk(
				aFlexObjects.find((oFlexObject) => oFlexObject.getId() === this.oCompChange.getId()),
				"the flexObject was deleted"
			);
			assert.ok(
				oUpdateSpy.firstCall.args[1].every((oUpdateInfo, iIdx) => {
					return oUpdateInfo.type === "updateFlexObject" && oUpdateInfo.updatedObject === aUpdates[iIdx];
				}),
				"the data selector was updated with the correct operation"
			);
			assert.ok(
				oUpdateSpy.secondCall.args[1].every((oUpdateInfo, iIdx) => {
					return oUpdateInfo.type === "removeFlexObject" && oUpdateInfo.updatedObject === aDeletes[iIdx];
				}),
				"the data selector was updated with the correct operation"
			);
		});

		QUnit.test("when only ui2personalization is updated", async function(assert) {
			const oUpdateFlexObjectsSpy = sandbox.spy(FlexState.getFlexObjectsDataSelector(), "checkUpdate");
			await FlexState.update(sReference, [
				{ type: "ui2", newData: "ui2" }
			]);
			assert.strictEqual(oUpdateFlexObjectsSpy.callCount, 0, "then the flex objects data selector is not updated");
		});

		QUnit.test("when adding a flex object that is not part of the runtime pertsistence", function(assert) {
			assert.throws(
				function() {
					FlexState.update(sReference, [
						{ type: "add", flexObject: { id: "unknownObject" } }
					]);
				},
				"then an error is thrown"
			);
		});

		QUnit.test("when updating the storage response", function(assert) {
			FlexState.addDirtyFlexObjects(sReference, [this.oUIChange], sComponentId);
			FlexState.update(sReference, [
				{ type: "add", flexObject: this.oUIChange.convertToFileContent() }
			]);
			FlexState.update(sReference, [
				{
					type: "update",
					flexObject: {
						...this.oUIChange.convertToFileContent(),
						...{ content: "bar" }
					}
				}
			]);
			assert.strictEqual(
				this.oUIChange.getContent(),
				"bar",
				"then the content of the runtime persistence object is also updated"
			);
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
