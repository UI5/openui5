/* global QUnit */

sap.ui.define([
	"sap/base/Log",
	"sap/ui/base/ManagedObjectObserver",
	"sap/ui/core/UIComponent",
	"sap/ui/fl/apply/_internal/controlVariants/URLHandler",
	"sap/ui/fl/apply/_internal/flexObjects/FlexObjectFactory",
	"sap/ui/fl/apply/_internal/flexState/controlVariants/VariantManagementState",
	"sap/ui/fl/apply/_internal/flexState/controlVariants/VariantManagerApply",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/apply/api/ControlVariantApplyAPI",
	"sap/ui/fl/initial/_internal/ManifestUtils",
	"sap/ui/fl/variants/VariantManagement",
	"sap/ui/fl/variants/VariantModel",
	"sap/ui/fl/Layer",
	"sap/ui/fl/Utils",
	"sap/ui/thirdparty/hasher",
	"sap/ui/thirdparty/sinon-4",
	"test-resources/sap/ui/fl/qunit/FlQUnitUtils"
], function(
	Log,
	ManagedObjectObserver,
	UIComponent,
	URLHandler,
	FlexObjectFactory,
	VariantManagementState,
	VariantManagerApply,
	FlexState,
	ControlVariantApplyAPI,
	ManifestUtils,
	VariantManagement,
	VariantModel,
	Layer,
	Utils,
	hasher,
	sinon,
	FlQUnitUtils
) {
	"use strict";
	document.getElementById("qunit-fixture").style.display = "none";
	const sandbox = sinon.createSandbox();
	const sFlexReference = "someReference";

	function stubUShellServices(oStub, mServices) {
		oStub.callsFake((sServiceName) => Promise.resolve(mServices[sServiceName]));
	}

	QUnit.module("Given an instance of VariantModel", {
		beforeEach() {
			this.oAppComponent = new UIComponent("appComponent");
			sandbox.stub(ManifestUtils, "getFlexReferenceForControl").returns(sFlexReference);
			this.oModel = new VariantModel({}, { appComponent: this.oAppComponent });
			this.fnDestroyObserverSpy = sandbox.spy(ManagedObjectObserver.prototype, "observe");
			this.fnDestroyUnobserverSpy = sandbox.spy(ManagedObjectObserver.prototype, "unobserve");
			this.oGetUShellServiceStub = sandbox.stub(Utils, "getUShellService");
		},
		async afterEach() {
			if (this.oAppComponent instanceof UIComponent) {
				this.oAppComponent.destroy();
			}
			// Variant switch promise is awaited in the observerHandler before deregistering
			await VariantManagementState.waitForAllVariantSwitches(sFlexReference);
			URLHandler._reset();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when initialize() is called, followed by a getStoredHashParams() call", async function(assert) {
			const oRegisterNavigationFilterStub = sandbox.stub();
			const oUnregisterNavigationFilterStub = sandbox.stub();
			stubUShellServices(this.oGetUShellServiceStub, {
				ShellNavigationInternal: {
					registerNavigationFilter: oRegisterNavigationFilterStub,
					unregisterNavigationFilter: oUnregisterNavigationFilterStub
				},
				URLParsing: { parseShellHash() {} }
			});
			sandbox.stub(Utils, "getUshellContainer").returns({});

			sandbox.spy(URLHandler, "attachHandlers");
			const mPropertyBag = { flexReference: this.oModel.sFlexReference, appComponent: this.oAppComponent };
			await URLHandler.initialize(mPropertyBag);

			assert.ok(URLHandler.attachHandlers.calledWith(mPropertyBag), "then required handlers and observers were subscribed");

			// Update hash params via URLHandler.update
			await URLHandler.update({
				parameters: ["expectedParameter1", "expectedParameter2"],
				updateHashEntry: true,
				flexReference: this.oModel.sFlexReference
			});
			assert.strictEqual(oRegisterNavigationFilterStub.callCount, 1, "then a navigation filter was registered");
			assert.strictEqual(typeof oRegisterNavigationFilterStub.firstCall.args[0], "function");
			assert.ok(oUnregisterNavigationFilterStub.notCalled, "then the navigation filter is not unregistered");
			assert.deepEqual(
				URLHandler.getStoredHashParams({ flexReference: this.oModel.sFlexReference }),
				["expectedParameter1", "expectedParameter2"],
				"then expected parameters are returned"
			);
		});

		QUnit.test("when registerControl is called for a variant management control's local id", async function(assert) {
			const sVariantManagementReference = "sLocalControlId";
			await URLHandler.initialize({ flexReference: this.oModel.sFlexReference, appComponent: this.oAppComponent });
			URLHandler.registerControl({ vmReference: sVariantManagementReference, updateURL: true, flexReference: this.oModel.sFlexReference });
			const aCallArgs = this.fnDestroyObserverSpy.getCall(0).args;
			assert.deepEqual(aCallArgs[0], this.oAppComponent, "then ManagedObjectObserver observers the AppComponent");
			assert.strictEqual(aCallArgs[1].destroy, true, "then ManagedObjectObserver observers the destroy() method");

			assert.strictEqual(
				URLHandler.getStoredHashParams({ flexReference: this.oModel.sFlexReference }).length,
				0,
				"then the rendered control's local id was added to URLHandler's hash register"
			);
		});

		QUnit.test("when attachHandlers() is called", async function(assert) {
			await URLHandler.initialize({ flexReference: this.oModel.sFlexReference, appComponent: this.oAppComponent });

			// first call
			URLHandler.attachHandlers({ vmReference: "mockControlId1", updateURL: false, flexReference: this.oModel.sFlexReference, appComponent: this.oAppComponent });
			const aCallArgs = this.fnDestroyObserverSpy.getCall(0).args;
			assert.deepEqual(aCallArgs[0], this.oAppComponent, "then ManagedObjectObserver observers the AppComponent");
			assert.strictEqual(aCallArgs[1].destroy, true, "then ManagedObjectObserver observers the destroy() method");

			// second call
			URLHandler.attachHandlers({ vmReference: "mockControlId2", updateURL: false, flexReference: this.oModel.sFlexReference, appComponent: this.oAppComponent });
			assert.ok(this.fnDestroyObserverSpy.calledOnce, "then no new observers were listening to Component.destroy()");
		});

		QUnit.test("when app component is destroyed after attachHandlers() was already called", async function(assert) {
			const sVariantManagementReference = "sLocalControlId";

			const oRegisterNavigationFilterStub = sandbox.stub();
			const oUnregisterNavigationFilterStub = sandbox.stub();
			stubUShellServices(this.oGetUShellServiceStub, {
				ShellNavigationInternal: {
					registerNavigationFilter: oRegisterNavigationFilterStub,
					unregisterNavigationFilter: oUnregisterNavigationFilterStub
				},
				URLParsing: { parseShellHash() {} }
			});
			sandbox.stub(Utils, "getUshellContainer").returns({});

			await URLHandler.initialize({ flexReference: this.oModel.sFlexReference, appComponent: this.oAppComponent });

			this.oModel.destroy = sandbox.stub();
			URLHandler.attachHandlers(
				{ vmReference: sVariantManagementReference, updateURL: true, flexReference: this.oModel.sFlexReference, appComponent: this.oAppComponent }
			); // app component's destroy handlers are attached here

			const fnVariantSwitchPromiseStub = sandbox.stub();
			VariantManagementState.setVariantSwitchPromise(
				sFlexReference,
				sVariantManagementReference,
				new Promise((resolve) => {
					setTimeout(() => {
						resolve();
					}, 0);
				}).then(fnVariantSwitchPromiseStub)
			);

			this.oAppComponent.destroy();

			await VariantManagementState.waitForAllVariantSwitches(sFlexReference);
			const aCallArgs = this.fnDestroyUnobserverSpy.getCall(0).args;
			assert.deepEqual(
				aCallArgs[0],
				this.oAppComponent,
				"then ManagedObjectObserver unobserve() was called for the AppComponent"
			);
			assert.ok(oRegisterNavigationFilterStub.calledOnce, "then a navigation filter was registered");
			assert.ok(oUnregisterNavigationFilterStub.calledOnce, "then the navigation filter was deregistered");
			assert.strictEqual(
				oRegisterNavigationFilterStub.firstCall.args[0],
				oUnregisterNavigationFilterStub.firstCall.args[0],
				"then the same filter that was added is removed"
			);
			assert.strictEqual(
				aCallArgs[1].destroy,
				true,
				"then ManagedObjectObserver unobserve() was called for the destroy() method"
			);
			assert.ok(
				fnVariantSwitchPromiseStub.calledBefore(this.fnDestroyUnobserverSpy),
				"then first variant switch was resolved and then component's destroy callback was called"
			);
		});

		QUnit.test("when app component is destroyed, the variant model is also destroyed", async function(assert) {
			stubUShellServices(this.oGetUShellServiceStub, {
				ShellNavigationInternal: {
					registerNavigationFilter: sandbox.stub(),
					unregisterNavigationFilter: sandbox.stub()
				},
				URLParsing: { parseShellHash() {} }
			});
			sandbox.stub(Utils, "getUshellContainer").returns({});

			// Set the variant model on the component as ComponentLifecycleHooks would
			this.oAppComponent.setModel(
				this.oModel,
				ControlVariantApplyAPI.getVariantModelName()
			);

			await URLHandler.initialize({
				flexReference: this.oModel.sFlexReference,
				appComponent: this.oAppComponent
			});

			const oModelDestroySpy = sandbox.spy(this.oModel, "destroy");

			this.oAppComponent.destroy();
			await VariantManagementState.waitForAllVariantSwitches(sFlexReference);

			assert.ok(
				oModelDestroySpy.calledOnce,
				"then the variant model's destroy was called"
			);
		});

		QUnit.test("when update() is called to update the URL with a hash register update", async function(assert) {
			const mPropertyBag = {
				parameters: ["testParam1,testParam2"],
				updateHashEntry: true,
				updateURL: true,
				flexReference: this.oModel.sFlexReference,
				appComponent: this.oModel.oAppComponent
			};

			const oNavigateStub = sandbox.stub();
			stubUShellServices(this.oGetUShellServiceStub, {
				URLParsing: { parseShellHash: () => ({ params: {} }) },
				Navigation: { navigate: oNavigateStub }
			});
			sandbox.stub(Utils, "getUshellContainer").returns({});
			await URLHandler.initialize({ flexReference: this.oModel.sFlexReference, appComponent: this.oAppComponent });

			await URLHandler.update(mPropertyBag);
			assert.deepEqual(
				oNavigateStub.firstCall.args[0].params[URLHandler.variantTechnicalParameterName],
				mPropertyBag.parameters,
				"then correct parameters were passed to be set for the URL hash"
			);
			assert.deepEqual(
				URLHandler.getStoredHashParams({ flexReference: this.oModel.sFlexReference }),
				mPropertyBag.parameters,
				"then hash register was updated"
			);
		});

		QUnit.test("when update() is called to update the URL without a hash register update", async function(assert) {
			const mPropertyBag = {
				parameters: ["testParam1,testParam2"],
				updateHashEntry: false,
				updateURL: true,
				flexReference: this.oModel.sFlexReference,
				appComponent: this.oModel.oAppComponent
			};

			const oNavigateStub = sandbox.stub();
			stubUShellServices(this.oGetUShellServiceStub, {
				URLParsing: { parseShellHash: () => ({ params: {} }) },
				Navigation: { navigate: oNavigateStub }
			});
			sandbox.stub(Utils, "getUshellContainer").returns({});
			await URLHandler.initialize({ flexReference: this.oModel.sFlexReference, appComponent: this.oAppComponent });

			await URLHandler.update(mPropertyBag);
			assert.deepEqual(
				oNavigateStub.firstCall.args[0].params[URLHandler.variantTechnicalParameterName],
				mPropertyBag.parameters,
				"then correct parameters were passed to be set for the URL hash"
			);
			assert.strictEqual(
				URLHandler.getStoredHashParams({ flexReference: this.oModel.sFlexReference }).length,
				0,
				"then hash register was not updated"
			);
		});

		QUnit.test("when update() is called without a component", async function(assert) {
			this.oAppComponent.destroy();
			const mPropertyBag = {
				parameters: ["testParam1,testParam2"],
				updateURL: true,
				flexReference: this.oModel.sFlexReference,
				appComponent: undefined
			};

			const oNavigateStub = sandbox.stub();
			stubUShellServices(this.oGetUShellServiceStub, {
				URLParsing: { parseShellHash: () => ({ params: {} }) },
				Navigation: { navigate: oNavigateStub }
			});
			sandbox.stub(Utils, "getUshellContainer").returns({});
			await URLHandler.initialize({ flexReference: this.oModel.sFlexReference, appComponent: this.oAppComponent });

			await URLHandler.update(mPropertyBag);
			assert.deepEqual(
				oNavigateStub.firstCall.args[0].params[URLHandler.variantTechnicalParameterName],
				mPropertyBag.parameters,
				"then correct parameters were passed to be set for the URL hash"
			);
		});

		QUnit.test("when update() is called to update hash register without a URL update", async function(assert) {
			await URLHandler.initialize({ flexReference: this.oModel.sFlexReference, appComponent: this.oAppComponent });
			const mPropertyBag = {
				parameters: ["testParam1,testParam2"],
				updateHashEntry: true,
				flexReference: this.oModel.sFlexReference
			};

			await URLHandler.update(mPropertyBag);
			assert.deepEqual(
				URLHandler.getStoredHashParams({ flexReference: this.oModel.sFlexReference }),
				mPropertyBag.parameters,
				"then hash register was updated"
			);
		});

		QUnit.test("when update() is called to update hash register with a URL update, but the parameters didn't change", async function(assert) {
			const mPropertyBag = {
				parameters: ["testParam1,testParam2"],
				updateHashEntry: true,
				updateURL: true,
				flexReference: this.oModel.sFlexReference,
				appComponent: this.oModel.oAppComponent
			};

			const oReturnObject = { params: {} };
			oReturnObject.params[URLHandler.variantTechnicalParameterName] = ["testParam1,testParam2"];
			stubUShellServices(this.oGetUShellServiceStub, {
				URLParsing: { parseShellHash: () => oReturnObject },
				Navigation: { navigate() { assert.ok(false, "but 'navigate' should not be called"); } }
			});
			sandbox.stub(Utils, "getUshellContainer").returns({});
			await URLHandler.initialize({ flexReference: this.oModel.sFlexReference, appComponent: this.oAppComponent });

			await URLHandler.update(mPropertyBag);
			assert.ok(true, "update is called");
		});
	});

	function stubParseShellHash(aParameterValues) {
		const mParameters = {};
		if (aParameterValues) {
			mParameters[URLHandler.variantTechnicalParameterName] = aParameterValues;
		}
		this.oParseShellHashStub.returns({ params: mParameters });
	}

	QUnit.module("Given multiple variant management controls", {
		async beforeEach() {
			this.oAppComponent = new UIComponent("appComponent");
			this.oRegisterNavigationFilterStub = sandbox.stub();
			this.oUnregisterNavigationFilterStub = sandbox.stub();
			this.oManagedObjectObserverSpy = sandbox.spy(ManagedObjectObserver.prototype, "observe");
			sandbox.stub(hasher, "getHash").returns("");

			this.sDefaultStatus = "Continue";

			sandbox.stub(ManifestUtils, "getFlexReferenceForControl").returns(sFlexReference);
			await FlexState.initialize({
				reference: sFlexReference,
				componentId: "appComponent",
				componentData: {},
				manifest: {}
			});

			FlQUnitUtils.stubFlexObjectsSelector(sandbox, [
				// VM1: standard variant + variant1, default set to variant1
				FlexObjectFactory.createFlVariant({
					id: "variantMgmtId1",
					variantName: "Standard",
					variantManagementReference: "variantMgmtId1",
					reference: sFlexReference,
					layer: Layer.VENDOR
				}),
				FlexObjectFactory.createFlVariant({
					id: "variant1",
					variantName: "variant1",
					variantManagementReference: "variantMgmtId1",
					variantReference: "variantMgmtId1",
					reference: sFlexReference,
					layer: Layer.VENDOR
				}),
				FlexObjectFactory.createVariantManagementChange({
					id: "setDefault_vm1",
					layer: Layer.VENDOR,
					changeType: "setDefault",
					fileType: "ctrl_variant_management_change",
					selector: { id: "variantMgmtId1" },
					content: { defaultVariant: "variant1" }
				}),

				// VM2: standard variant + variant2
				FlexObjectFactory.createFlVariant({
					id: "variantMgmtId2",
					variantName: "Standard",
					variantManagementReference: "variantMgmtId2",
					reference: sFlexReference,
					layer: Layer.VENDOR
				}),
				FlexObjectFactory.createFlVariant({
					id: "variant2",
					variantName: "variant2",
					variantManagementReference: "variantMgmtId2",
					variantReference: "variantMgmtId2",
					reference: sFlexReference,
					layer: Layer.VENDOR
				}),

				// VM3: standard variant + variant3
				FlexObjectFactory.createFlVariant({
					id: "variantMgmtId3",
					variantName: "Standard",
					variantManagementReference: "variantMgmtId3",
					reference: sFlexReference,
					layer: Layer.VENDOR
				}),
				FlexObjectFactory.createFlVariant({
					id: "variant3",
					variantName: "variant3",
					variantManagementReference: "variantMgmtId3",
					variantReference: "variantMgmtId3",
					reference: sFlexReference,
					layer: Layer.VENDOR
				})
			]);

			// VM1: default=variant1, current=variantMgmtId1 (standard)
			VariantManagementState.setCurrentVariant({
				reference: sFlexReference,
				vmReference: "variantMgmtId1",
				newVReference: "variantMgmtId1"
			});
			// VM2: default=variantMgmtId2 (standard), current=variant2
			VariantManagementState.setCurrentVariant({
				reference: sFlexReference,
				vmReference: "variantMgmtId2",
				newVReference: "variant2"
			});
			// VM3: default=variantMgmtId3 (standard), current=variantMgmtId3

			this.oModel = new VariantModel({}, { appComponent: this.oAppComponent });

			this.oParseShellHashStub = sandbox.stub().returns({ params: {} });
			this.oGetUShellServiceStub = sandbox.stub(Utils, "getUShellService");
			stubUShellServices(this.oGetUShellServiceStub, {
				ShellNavigationInternal: {
					NavigationFilterStatus: { Continue: this.sDefaultStatus },
					registerNavigationFilter: this.oRegisterNavigationFilterStub,
					unregisterNavigationFilter: this.oUnregisterNavigationFilterStub
				},
				URLParsing: { parseShellHash: this.oParseShellHashStub }
			});
			sandbox.stub(Utils, "getUshellContainer").returns({});

			await this.oModel.initialize();
			this.oSwitchToDefaultVariantStub = sandbox.stub(VariantManagerApply, "updateCurrentVariant");

			// variant management controls
			this.oVariantManagement1 = new VariantManagement("variantMgmtId1", { updateVariantInURL: true });
			this.oVariantManagement1.setModel(this.oModel, ControlVariantApplyAPI.getVariantModelName());
			this.oVariantManagement2 = new VariantManagement("variantMgmtId2", { updateVariantInURL: true });
			this.oVariantManagement2.setModel(this.oModel, ControlVariantApplyAPI.getVariantModelName());
			this.oVariantManagement3 = new VariantManagement("variantMgmtId3", { updateVariantInURL: true });
			this.oVariantManagement3.setModel(this.oModel, ControlVariantApplyAPI.getVariantModelName());

			// mock property bag for URLHandler.update
			this.mPropertyBag = {
				parameters: ["testParam1,testParam2"],
				updateHashEntry: true,
				updateURL: true
			};
		},
		async afterEach() {
			this.oVariantManagement1.destroy();
			this.oVariantManagement2.destroy();
			this.oVariantManagement3.destroy();
			if (this.oAppComponent instanceof UIComponent) {
				this.oAppComponent.destroy();
			}
			await VariantManagementState.waitForAllVariantSwitches(sFlexReference);
			URLHandler._reset();
			FlexState.clearState();
			VariantManagementState.resetCurrentVariantReference(sFlexReference);
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when 3 variant management controls are rendered", function(assert) {
			assert.ok(this.oVariantManagement1.getResetOnContextChange(), "then by default 'resetOnContextChange' is set to true");
			assert.strictEqual(
				this.oManagedObjectObserverSpy.getCalls()
				.filter((oCall) => oCall.args[1].properties?.includes("resetOnContextChange")).length,
				3,
				"then an observer for 'resetOnContextChange' was added for each control"
			);
		});

		QUnit.test("when event 'modelContextChange' is fired on a control rendered at position 1, out of 3 controls", function(assert) {
			const fnDone = assert.async();
			// Make updateCurrentVariant call the done after all expected calls
			this.oSwitchToDefaultVariantStub.callsFake(() => {
				if (this.oSwitchToDefaultVariantStub.callCount === 3) {
					assert.strictEqual(
						this.oSwitchToDefaultVariantStub.args[0][0].newVariantReference,
						"variant1",
						"then the first VM control was reset to default variant"
					);
					assert.strictEqual(
						this.oSwitchToDefaultVariantStub.args[1][0].newVariantReference,
						"variantMgmtId2",
						"then the second VM control was reset to default variant"
					);
					assert.strictEqual(
						this.oSwitchToDefaultVariantStub.args[2][0].newVariantReference,
						"variantMgmtId3",
						"then the third VM control was reset to default variant"
					);
					fnDone();
				}
			});
			this.oVariantManagement1.fireEvent("modelContextChange");
		});

		QUnit.test("when event 'modelContextChange' is fired on a control rendered at position 1 with a URL parameter, out of 3 controls", function(assert) {
			const fnDone = assert.async();
			stubParseShellHash.call(this, [this.oVariantManagement1.getId()]);

			sandbox.stub(VariantManagementState, "getVariant").callsFake((mPropertyBag) => {
				if (
					mPropertyBag.vmReference === this.oVariantManagement1.getId()
					&& mPropertyBag.vReference === this.oVariantManagement1.getId()
				) {
					return { simulate: "foundVariant" };
				}
				return undefined;
			});

			// Make updateCurrentVariant call done after all expected calls
			this.oSwitchToDefaultVariantStub.callsFake(() => {
				if (this.oSwitchToDefaultVariantStub.callCount === 2) {
					assert.strictEqual(
						this.oSwitchToDefaultVariantStub.args[0][0].newVariantReference,
						"variantMgmtId2",
						"then the second VM control was reset to default variant"
					);
					assert.strictEqual(
						this.oSwitchToDefaultVariantStub.args[1][0].newVariantReference,
						"variantMgmtId3",
						"then the third VM control was reset to default variant"
					);
					fnDone();
				}
			});

			this.oVariantManagement1.fireEvent("modelContextChange");
		});

		QUnit.test("when event 'modelContextChange' is fired on a control rendered at position 2, out of 3 controls", function(assert) {
			const fnDone = assert.async();
			assert.ok(this.oVariantManagement1.getResetOnContextChange(), "then by default 'resetOnContextChange' is set to true");

			// Make updateCurrentVariant call done after all expected calls
			this.oSwitchToDefaultVariantStub.callsFake(() => {
				if (this.oSwitchToDefaultVariantStub.callCount === 2) {
					assert.strictEqual(
						this.oSwitchToDefaultVariantStub.args[0][0].newVariantReference,
						"variantMgmtId2",
						"then the second VM control was reset to default variant"
					);
					assert.strictEqual(
						this.oSwitchToDefaultVariantStub.args[1][0].newVariantReference,
						"variantMgmtId3",
						"then the third VM control was reset to default variant"
					);
					fnDone();
				}
			});

			this.oVariantManagement2.fireEvent("modelContextChange");
		});

		QUnit.test("when event 'modelContextChange' is fired on a control rendered at position 3, out of 3 controls", function(assert) {
			const fnDone = assert.async();

			// Make updateCurrentVariant call done after all expected calls
			this.oSwitchToDefaultVariantStub.callsFake(() => {
				assert.strictEqual(
					this.oSwitchToDefaultVariantStub.callCount,
					1,
					"then the variant switch is called once"
				);
				assert.strictEqual(
					this.oSwitchToDefaultVariantStub.args[0][0].newVariantReference,
					"variantMgmtId3",
					"then the third VM control was reset to default variant"
				);
				fnDone();
			});

			this.oVariantManagement3.fireEvent("modelContextChange");
		});

		QUnit.test("when event 'resetOnContextChange' is changed to false from true(default)", function(assert) {
			const done = assert.async();
			assert.ok(this.oVariantManagement1.getResetOnContextChange(), "then initially 'resetOnContextChange' is set to true");
			sandbox.stub(this.oVariantManagement1, "detachEvent").callsFake((sEventName, fnCallBack) => {
				if (sEventName === "modelContextChange") {
					assert.ok(typeof fnCallBack === "function", "then the event handler was detached from 'modelContextChange'");
					done();
				}
			});
			this.oVariantManagement1.setResetOnContextChange(false);
		});

		QUnit.test("when property 'resetOnContextChange' is changed to true from false", function(assert) {
			const fnDone = assert.async();
			this.oVariantManagement1.setResetOnContextChange(false);
			assert.notOk(this.oVariantManagement1.getResetOnContextChange(), "then initially 'resetOnContextChange' is set to false");
			sandbox.stub(this.oVariantManagement1, "attachEvent").callsFake((sEventName, mParameters, fnCallBack) => {
				if (sEventName === "modelContextChange") {
					assert.deepEqual(
						mParameters.flexReference,
						sFlexReference,
						"then the correct parameters were passed for the event handler"
					);
					assert.ok(typeof fnCallBack === "function", "then the event handler was attached to 'modelContextChange'");
					fnDone();
				}
			});
			this.oVariantManagement1.setResetOnContextChange(true);
		});

		QUnit.test("when the registered navigationFilter function is called and there is an error in hash parsing", async function(assert) {
			this.oParseShellHashStub.throws("Service Error");
			const oLogErrorStub = sandbox.stub(Log, "error");
			const fnVariantIdChangeHandler = this.oRegisterNavigationFilterStub.getCall(0).args[0];
			const sResult = await fnVariantIdChangeHandler();
			assert.strictEqual(sResult, this.sDefaultStatus, "then the default navigation filter status was returned");
			assert.strictEqual(oLogErrorStub.callCount, 1, "then the error was logged");
		});

		QUnit.test("when the registered navigationFilter function is called and there is a variant parameter, belonging to no variant", async function(assert) {
			sandbox.stub(URLHandler, "update").callsFake(() => {
				assert.notOk(true, "then update is incorrectly called");
			});

			const fnVariantIdChangeHandler = this.oRegisterNavigationFilterStub.getCall(0).args[0];
			stubParseShellHash.call(this, ["nonExistingVariant"]);
			const sResult = await fnVariantIdChangeHandler("DummyHash");
			assert.strictEqual(
				sResult,
				this.sDefaultStatus,
				"then the default navigation filter status was returned"
			);
		});

		QUnit.test("when the registered navigationFilter function is called and there is an unchanged variant URL parameter", async function(assert) {
			const aParameterValues = [this.oModel.oData.variantMgmtId1.currentVariant, "paramValue2"];
			stubParseShellHash.call(this, aParameterValues);
			sandbox.stub(URLHandler, "update").callsFake(() => {
				assert.notOk(true, "then update is called incorrectly");
			});
			const fnVariantIdChangeHandler = this.oRegisterNavigationFilterStub.getCall(0).args[0];
			const sResult = await fnVariantIdChangeHandler("DummyHash");
			assert.strictEqual(
				sResult,
				this.sDefaultStatus,
				"then the default navigation filter status was returned"
			);
		});

		QUnit.test("when the registered navigationFilter function is called and there are unchanged variant URL parameters for two different variant managements", async function(assert) {
			const aParameterValues = [
				this.oModel.oData.variantMgmtId1.currentVariant,
				this.oModel.oData.variantMgmtId2.currentVariant,
				"otherParamValue"
			];

			stubParseShellHash.call(this, aParameterValues);

			sandbox.stub(URLHandler, "update").callsFake(() => {
				assert.notOk(true, "then update is called incorrectly");
			});

			const fnVariantIdChangeHandler = this.oRegisterNavigationFilterStub.getCall(0).args[0];
			const sResult = await fnVariantIdChangeHandler("DummyHash");
			assert.strictEqual(
				sResult,
				this.sDefaultStatus,
				"then the default navigation filter status was returned"
			);
		});

		QUnit.test("when the registered navigationFilter function is called and there are changed variant URL parameters", async function(assert) {
			const aParameterValues = [
				this.oModel.oData.variantMgmtId1.defaultVariant,
				this.oModel.oData.variantMgmtId2.defaultVariant,
				"otherParamValue"
			];

			stubParseShellHash.call(this, aParameterValues);

			const mExpectedPropertyBag = {
				flexReference: this.oModel.sFlexReference,
				appComponent: this.oModel.oAppComponent,
				updateURL: true,
				updateHashEntry: true,
				parameters: [
					this.oModel.oData.variantMgmtId1.currentVariant,
					this.oModel.oData.variantMgmtId2.currentVariant,
					"otherParamValue"
				]
			};
			const oUpdateStub = sandbox.stub(URLHandler, "update");

			const fnVariantIdChangeHandler = this.oRegisterNavigationFilterStub.getCall(0).args[0];
			const sResult = await fnVariantIdChangeHandler("DummyHash");
			assert.deepEqual(
				oUpdateStub.firstCall.args[0],
				mExpectedPropertyBag,
				"then URLHandler.update() was called with right parameters"
			);
			assert.strictEqual(
				sResult,
				this.sDefaultStatus,
				"then the default navigation filter status was returned"
			);
		});

		QUnit.test("when the registered navigationFilter function is called in UI Adaptation mode and there is a changed variant parameter, belonging to a variant", async function(assert) {
			const aParameterValues = [
				this.oModel.oData.variantMgmtId1.defaultVariant,
				this.oModel.oData.variantMgmtId2.defaultVariant,
				"otherParamValue"
			];
			URLHandler.setDesigntimeMode(true);
			const mExpectedPropertyBagToUpdate = {
				flexReference: this.oModel.sFlexReference,
				appComponent: this.oModel.oAppComponent,
				updateURL: false,
				updateHashEntry: true,
				parameters: [
					this.oModel.oData.variantMgmtId1.currentVariant,
					this.oModel.oData.variantMgmtId2.currentVariant,
					"otherParamValue"
				]
			};
			const oUpdateStub = sandbox.stub(URLHandler, "update");

			stubParseShellHash.call(this, aParameterValues);

			const fnVariantIdChangeHandler = this.oRegisterNavigationFilterStub.getCall(0).args[0];
			const sResult = await fnVariantIdChangeHandler("DummyHash");
			assert.deepEqual(
				oUpdateStub.firstCall.args[0],
				mExpectedPropertyBagToUpdate,
				"then URLHandler.update() was called with right parameters to update hash register"
			);
			assert.strictEqual(
				sResult,
				this.sDefaultStatus,
				"then the default navigation filter status was returned"
			);
		});
	});

	QUnit.module("Given URLHandler.updateVariantInURL() to update a new variant parameter in the URL", {
		async beforeEach() {
			sandbox.stub(ManifestUtils, "getFlexReferenceForControl").returns(sFlexReference);
			await FlexState.initialize({
				reference: sFlexReference,
				componentId: "testid",
				componentData: {},
				manifest: {}
			});

			FlQUnitUtils.stubFlexObjectsSelector(sandbox, [
				// VM1: standard + variant0 (CUSTOMER) + variant1 (CUSTOMER, default)
				FlexObjectFactory.createFlVariant({
					id: "variantMgmtId1",
					variantName: "Standard",
					variantManagementReference: "variantMgmtId1",
					reference: sFlexReference,
					layer: Layer.VENDOR
				}),
				FlexObjectFactory.createFlVariant({
					id: "variant0",
					variantName: "variant A",
					variantManagementReference: "variantMgmtId1",
					variantReference: "variantMgmtId1",
					reference: sFlexReference,
					layer: "CUSTOMER",
					user: "Me"
				}),
				FlexObjectFactory.createFlVariant({
					id: "variant1",
					variantName: "variant B",
					variantManagementReference: "variantMgmtId1",
					variantReference: "variantMgmtId1",
					reference: sFlexReference,
					layer: "CUSTOMER",
					user: "Me"
				}),
				FlexObjectFactory.createVariantManagementChange({
					id: "setDefault_vm1",
					layer: "CUSTOMER",
					changeType: "setDefault",
					fileType: "ctrl_variant_management_change",
					selector: { id: "variantMgmtId1" },
					content: { defaultVariant: "variant1" }
				}),

				// VM2: standard + variant20 (CUSTOMER) + variant21 (CUSTOMER, default)
				FlexObjectFactory.createFlVariant({
					id: "variantMgmtId2",
					variantName: "Standard",
					variantManagementReference: "variantMgmtId2",
					reference: sFlexReference,
					layer: Layer.VENDOR
				}),
				FlexObjectFactory.createFlVariant({
					id: "variant20",
					variantName: "variant A",
					variantManagementReference: "variantMgmtId2",
					variantReference: "variantMgmtId2",
					reference: sFlexReference,
					layer: "CUSTOMER",
					user: "Me"
				}),
				FlexObjectFactory.createFlVariant({
					id: "variant21",
					variantName: "variant B",
					variantManagementReference: "variantMgmtId2",
					variantReference: "variantMgmtId2",
					reference: sFlexReference,
					layer: "CUSTOMER",
					user: "Me"
				}),
				FlexObjectFactory.createVariantManagementChange({
					id: "setDefault_vm2",
					layer: "CUSTOMER",
					changeType: "setDefault",
					fileType: "ctrl_variant_management_change",
					selector: { id: "variantMgmtId2" },
					content: { defaultVariant: "variant21" }
				})
			]);

			this.oModel = new VariantModel({}, {
				appComponent: { getId() { return "testid"; }, byId() { return undefined; } }
			});

			this.oParseShellHashStub = sandbox.stub().returns({ params: {} });
			this.oGetUShellServiceStub = sandbox.stub(Utils, "getUShellService");
			stubUShellServices(this.oGetUShellServiceStub, {
				URLParsing: { parseShellHash: this.oParseShellHashStub }
			});
			sandbox.stub(Utils, "getUshellContainer").returns({});

			await this.oModel.initialize();
			sandbox.stub(URLHandler, "update");
		},
		afterEach() {
			URLHandler._reset();
			sandbox.restore();
			this.oModel.destroy();
			FlexState.clearState();
			VariantManagementState.resetCurrentVariantReference(sFlexReference);
		}
	}, function() {
		QUnit.test("when called with no variant URL parameter", async function(assert) {
			this.oParseShellHashStub.returns({ params: {} });
			const aModifiedUrlTechnicalParameters = ["variant0"];
			sandbox.stub(VariantManagementState, "getVariant").callsFake((mParams) => {
				return mParams.vmReference === "variantMgmtId1" && mParams.vReference === "variantMgmtId1"
					? { simulate: "foundVariant" }
					: undefined;
			});
			sandbox.spy(URLHandler, "removeURLParameterForVariantManagement");

			await URLHandler.updateVariantInURL({
				vmReference: "variantMgmtId1",
				newVReference: "variant0",
				flexReference: this.oModel.sFlexReference,
				appComponent: this.oModel.oAppComponent
			});
			assert.ok(this.oGetUShellServiceStub.called, "then url parameters requested");
			const oRemoveResult = await URLHandler.removeURLParameterForVariantManagement.returnValues[0];
			assert.deepEqual(oRemoveResult, {
				parameters: [],
				index: -1
			}, "then URLHandler.removeURLParameterForVariantManagement() returns the correct parameters and index");
			assert.ok(URLHandler.update.calledWithExactly({
				parameters: aModifiedUrlTechnicalParameters,
				updateURL: true,
				updateHashEntry: true,
				flexReference: this.oModel.sFlexReference,
				appComponent: this.oModel.oAppComponent
			}), "then URLHandler.update() called with the correct object as parameter");
		});

		QUnit.test("when called with encoded variant URL parameter for the same variant management", async function(assert) {
			const aExistingParameters = ["Dummy::'123'/'456'", "variantMgmtId1"];
			const oReturnObject = {
				params: {
					[URLHandler.variantTechnicalParameterName]: aExistingParameters
					.map((sParam) => { return encodeURIComponent(sParam); })
				}
			};

			sandbox.stub(VariantManagementState, "getVariant").callsFake((mParams) => {
				return mParams.vmReference === "variantMgmtId1" && mParams.vReference === "variantMgmtId1"
					? { simulate: "foundVariant" }
					: undefined;
			});
			this.oParseShellHashStub.returns(oReturnObject);
			sandbox.spy(URLHandler, "removeURLParameterForVariantManagement");

			await URLHandler.updateVariantInURL({
				vmReference: "variantMgmtId1",
				newVReference: "variant0",
				flexReference: this.oModel.sFlexReference,
				appComponent: this.oModel.oAppComponent
			});
			assert.ok(this.oGetUShellServiceStub.called, "then url parameters requested");
			const oRemoveResult = await URLHandler.removeURLParameterForVariantManagement.returnValues[0];
			assert.deepEqual(oRemoveResult, {
				parameters: [aExistingParameters[0]],
				index: 1
			}, "then URLHandler.removeURLParameterForVariantManagement() returns the correct parameters and index");
			assert.deepEqual(
				URLHandler.update.firstCall.args[0], {
					parameters: [aExistingParameters[0], "variant0"],
					updateURL: true,
					updateHashEntry: true,
					flexReference: this.oModel.sFlexReference,
					appComponent: this.oModel.oAppComponent
				},
				"then URLHandler.update() called with the correct object as parameter"
			);
		});

		QUnit.test("when called in standalone mode (without a ushell container)", async function(assert) {
			this.oParseShellHashStub.returns({});
			sandbox.spy(URLHandler, "removeURLParameterForVariantManagement");

			await URLHandler.updateVariantInURL({
				vmReference: "variantMgmtId1",
				newVReference: "variant0",
				flexReference: this.oModel.sFlexReference,
				appComponent: this.oModel.oAppComponent
			});

			assert.ok(this.oGetUShellServiceStub.called, "then url parameters requested");
			const oRemoveResult = await URLHandler.removeURLParameterForVariantManagement.returnValues[0];
			assert.deepEqual(oRemoveResult, {
				index: -1
			}, "then URLHandler.removeURLParameterForVariantManagement() returns the correct parameters and index");
			assert.strictEqual(URLHandler.update.callCount, 0, "then URLHandler.update() not called");
		});

		QUnit.test("when called for the default variant with no variant URL parameters", async function(assert) {
			this.oParseShellHashStub.returns({});

			await URLHandler.updateVariantInURL({
				vmReference: "variantMgmtId1",
				newVReference: "variant1",
				flexReference: this.oModel.sFlexReference,
				appComponent: this.oModel.oAppComponent
			}); // default variant

			assert.strictEqual(URLHandler.update.callCount, 0, "then URLHandler.update() not called");
		});

		QUnit.test("when called for the default variant with a valid variant URL parameter for the same variant management", async function(assert) {
			const oReturnObject = { params: {} };
			oReturnObject.params[URLHandler.variantTechnicalParameterName] = ["Dummy", "variantMgmtId1", "Dummy1"];
			this.oParseShellHashStub.returns(oReturnObject);

			sandbox.stub(VariantManagementState, "getVariant").callsFake((mParams) => {
				return mParams.vmReference === "variantMgmtId1" && mParams.vReference === "variantMgmtId1"
					? { simulate: "foundVariant" }
					: undefined;
			});

			await URLHandler.updateVariantInURL({
				vmReference: "variantMgmtId1",
				newVReference: "variant1",
				flexReference: this.oModel.sFlexReference,
				appComponent: this.oModel.oAppComponent
			}); // default variant

			assert.ok(URLHandler.update.calledWith({
				parameters: ["Dummy", "Dummy1"],
				updateURL: true,
				updateHashEntry: true,
				flexReference: this.oModel.sFlexReference,
				appComponent: this.oModel.oAppComponent
			}), "then URLHandler.update() called with the correct object with a parameter list excluding default variant");
		});

		QUnit.test("when called while in adaptation mode with variant parameters present in the hash register", async function(assert) {
			// return parameters saved at the current index of the hash register
			sandbox.stub(URLHandler, "getStoredHashParams").returns(["Dummy", "variantMgmtId1", "Dummy1"]);
			sandbox.stub(VariantManagementState, "getVariant").callsFake((mParams) => {
				return mParams.vmReference === "variantMgmtId1" && mParams.vReference === "variantMgmtId1"
					? { simulate: "foundVariant" }
					: undefined;
			});
			URLHandler.setDesigntimeMode(true);

			await URLHandler.updateVariantInURL({
				vmReference: "variantMgmtId1",
				newVReference: "variant0",
				flexReference: this.oModel.sFlexReference,
				appComponent: this.oModel.oAppComponent
			});

			assert.ok(URLHandler.update.calledWith({
				parameters: ["Dummy", "variant0", "Dummy1"],
				updateURL: false,
				updateHashEntry: true,
				flexReference: this.oModel.sFlexReference,
				appComponent: this.oModel.oAppComponent
			}), "then URLHandler.update() called with the update parameter list but the url is not updated");
		});

		QUnit.test("when called while in adaptation mode and there are no variant parameters saved in the hash register", async function(assert) {
			URLHandler.setDesigntimeMode(true);

			await URLHandler.updateVariantInURL({
				vmReference: "variantMgmtId1",
				newVReference: "variant0",
				flexReference: this.oModel.sFlexReference,
				appComponent: this.oModel.oAppComponent
			});

			assert.ok(URLHandler.update.calledWith({
				parameters: ["variant0"],
				updateURL: false,
				updateHashEntry: true,
				flexReference: this.oModel.sFlexReference,
				appComponent: this.oModel.oAppComponent
			}), "then URLHandler.update() called with the correct object with an empty parameter list");
		});
	});

	QUnit.module("Given URLHandler.update to update hash parameters in URL", {
		beforeEach() {
			sandbox.stub(Log, "warning");
			sandbox.stub(hasher, "replaceHash");
			this.oGetUShellServiceStub = sandbox.stub(Utils, "getUShellService");
			sandbox.stub(Utils, "getUshellContainer").returns({});

			this.oAppComponent = new UIComponent("appComponent");
			sandbox.stub(ManifestUtils, "getFlexReferenceForControl").returns(sFlexReference);
			this.oModel = new VariantModel({}, { appComponent: this.oAppComponent });
		},
		afterEach() {
			this.oAppComponent.destroy();
			URLHandler._reset();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when called to process silently, with an invalid component and some parameter values", async function(assert) {
			const aNewParamValues = ["testValue1, testValue2"];
			const oParameters = {};
			const sParamValue = "testValue";
			const sConstructedHashValue = "hashValue";
			oParameters[URLHandler.variantTechnicalParameterName] = [sParamValue];

			const oConstructShellHashStub = sandbox.stub().callsFake(() => {
				assert.notOk(hasher.changed.active, "then the hasher changed events are deactivated");
				return sConstructedHashValue;
			});
			stubUShellServices(this.oGetUShellServiceStub, {
				URLParsing: {
					getHash: () => "",
					parseShellHash: () => ({ params: oParameters }),
					constructShellHash: oConstructShellHashStub
				}
			});
			await URLHandler.initialize({ flexReference: this.oModel.sFlexReference, appComponent: this.oAppComponent });

			await URLHandler.update({
				flexReference: sFlexReference,
				appComponent: undefined,
				parameters: aNewParamValues,
				updateURL: true,
				silent: true
			});

			assert.deepEqual(
				oConstructShellHashStub.firstCall.args[0].params[URLHandler.variantTechnicalParameterName],
				aNewParamValues,
				"then the new shell hash is created with the passed parameters"
			);
			assert.ok(hasher.replaceHash.calledWith(sConstructedHashValue), "then hasher.replaceHash is called with the correct hash");
			assert.ok(Log.warning.calledWith(
				"Component instance not provided, so technical parameters in component data and browser history remain unchanged"
			), "then warning produced as component is invalid");
			assert.ok(hasher.changed.active, "then the hasher changed events are activated again");
		});

		QUnit.test("when called to process silently, with a valid component and some parameter values", async function(assert) {
			const aNewParamValues = ["testValue1, testValue2"];
			const oParameters = {};
			const sParamValue = "testValue";
			const sConstructedHashValue = "hashValue";
			oParameters[URLHandler.variantTechnicalParameterName] = [sParamValue];

			const oTechnicalParameters = {};
			oTechnicalParameters[URLHandler.variantTechnicalParameterName] = sParamValue;
			const oAppComponent = {
				oComponentData: {
					technicalParameters: oTechnicalParameters
				},
				getComponentData() {
					return this.oComponentData;
				}
			};

			const oConstructShellHashStub = sandbox.stub().callsFake(() => {
				assert.notOk(hasher.changed.active, "then the hasher changed events are deactivated");
				return sConstructedHashValue;
			});
			stubUShellServices(this.oGetUShellServiceStub, {
				URLParsing: {
					getHash: () => "",
					parseShellHash: () => ({ params: oParameters }),
					constructShellHash: oConstructShellHashStub
				}
			});
			await URLHandler.initialize({ flexReference: this.oModel.sFlexReference, appComponent: this.oAppComponent });

			await URLHandler.update({
				flexReference: sFlexReference,
				appComponent: oAppComponent,
				parameters: aNewParamValues,
				updateURL: true,
				silent: true
			});

			assert.deepEqual(
				oConstructShellHashStub.firstCall.args[0].params[URLHandler.variantTechnicalParameterName],
				aNewParamValues,
				"then the new shell hash is created with the passed parameters"
			);
			assert.ok(hasher.replaceHash.calledWith(sConstructedHashValue), "then hasher.replaceHash is called with the correct hash");
			assert.deepEqual(
				oAppComponent.getComponentData().technicalParameters[URLHandler.variantTechnicalParameterName],
				aNewParamValues,
				"then new parameter values were set as component's technical parameters"
			);
			assert.ok(Log.warning.notCalled, "then no warning for invalid component was produced");
			assert.ok(hasher.changed.active, "then the hasher changed events are activated again");
		});

		QUnit.test("when called without the silent parameter set, with a valid component and some parameter values", async function(assert) {
			const aNewParamValues = ["testValue1, testValue2"];
			const oParameters = {};
			const sParamValue = "testValue";
			oParameters[URLHandler.variantTechnicalParameterName] = [sParamValue];

			const oTechnicalParameters = {};
			oTechnicalParameters[URLHandler.variantTechnicalParameterName] = sParamValue;
			const oAppComponent = {
				oComponentData: {
					technicalParameters: oTechnicalParameters
				},
				getComponentData() {
					return this.oComponentData;
				}
			};

			const oUshellNav = {
				navigate: sandbox.stub()
			};

			const oMockParsedHash = {
				semanticObject: "semanticObject",
				action: "action",
				contextRaw: "context",
				params: oParameters,
				appSpecificRoute: "appSpecificRoute",
				writeHistory: false
			};

			stubUShellServices(this.oGetUShellServiceStub, {
				URLParsing: { parseShellHash: () => oMockParsedHash },
				Navigation: oUshellNav
			});
			await URLHandler.initialize({ flexReference: this.oModel.sFlexReference, appComponent: this.oAppComponent });
			const oExpectedResult = {
				target: {
					semanticObject: oMockParsedHash.semanticObject,
					action: oMockParsedHash.action,
					context: oMockParsedHash.contextRaw
				},
				params: {},
				appSpecificRoute: oMockParsedHash.appSpecificRoute,
				writeHistory: false
			};
			oExpectedResult.params[URLHandler.variantTechnicalParameterName] = aNewParamValues;

			await URLHandler.update({
				flexReference: sFlexReference,
				appComponent: oAppComponent,
				parameters: aNewParamValues,
				updateURL: true
			});

			assert.deepEqual(
				oAppComponent.getComponentData().technicalParameters[URLHandler.variantTechnicalParameterName],
				aNewParamValues,
				"then new parameter values were set as component's technical parameters"
			);
			assert.ok(Log.warning.notCalled, "then no warning for invalid component was produced");
			assert.ok(
				oUshellNav.navigate.calledWithExactly(oExpectedResult),
				"then the ushell navigation service was called with the correct parameters"
			);
		});

		QUnit.test("when clearAllVariantURLParameters is called without variants in the url", async function(assert) {
			stubUShellServices(this.oGetUShellServiceStub, {
				URLParsing: { parseShellHash: () => ({ params: { myFancyParameter: "foo" } }) }
			});
			await URLHandler.initialize({ flexReference: this.oModel.sFlexReference, appComponent: this.oAppComponent });

			const oUpdateStub = sandbox.stub(URLHandler, "update");
			await URLHandler.clearAllVariantURLParameters({ flexReference: sFlexReference, appComponent: {} });
			assert.strictEqual(oUpdateStub.callCount, 0, "the update function was not called");
		});
	});
});