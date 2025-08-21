/* global QUnit */

sap.ui.define([
	"sap/base/util/restricted/_omit",
	"sap/base/Log",
	"sap/m/App",
	"sap/m/Button",
	"sap/ui/core/mvc/XMLView",
	"sap/ui/core/ComponentContainer",
	"sap/ui/core/Element",
	"sap/ui/core/UIComponent",
	"sap/ui/fl/apply/_internal/changes/Reverter",
	"sap/ui/fl/apply/_internal/controlVariants/URLHandler",
	"sap/ui/fl/apply/_internal/flexObjects/FlexObjectFactory",
	"sap/ui/fl/apply/_internal/flexState/controlVariants/Switcher",
	"sap/ui/fl/apply/_internal/flexState/controlVariants/VariantManagementState",
	"sap/ui/fl/apply/_internal/flexState/FlexObjectState",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/apply/api/ControlVariantApplyAPI",
	"sap/ui/fl/initial/_internal/ManifestUtils",
	"sap/ui/fl/variants/VariantManagement",
	"sap/ui/fl/variants/VariantModel",
	"sap/ui/fl/write/_internal/flexState/FlexObjectManager",
	"sap/ui/fl/Layer",
	"sap/ui/fl/LayerUtils",
	"sap/ui/fl/Utils",
	"sap/ui/test/utils/nextUIUpdate",
	"sap/ui/thirdparty/hasher",
	"sap/ui/thirdparty/sinon-4"
], function(
	_omit,
	Log,
	App,
	Button,
	XMLView,
	ComponentContainer,
	Element,
	Component,
	Reverter,
	URLHandler,
	FlexObjectFactory,
	Switcher,
	VariantManagementState,
	FlexObjectState,
	FlexState,
	ControlVariantApplyAPI,
	ManifestUtils,
	VariantManagement,
	VariantModel,
	FlexObjectManager,
	Layer,
	LayerUtils,
	Utils,
	nextUIUpdate,
	hasher,
	sinon
) {
	"use strict";

	var sandbox = sinon.createSandbox();

	function stubTechnicalParameterValues(aUrlTechnicalParameters) {
		sandbox.stub(this.oModel, "getLocalId").withArgs(this.oDummyControl.getId(), this.oAppComponent).returns("variantMgmtId1");
		sandbox.spy(URLHandler, "update");
		sandbox.stub(this.oModel, "getVariant").withArgs("variant1", "variantMgmtId1").returns({simulate: "foundVariant"});
		sandbox.stub(hasher, "replaceHash");
		this.fnParseShellHashStub = sandbox.stub().callsFake(function() {
			if (!this.bCalled) {
				var oReturnObject = {
					params: {}
				};
				oReturnObject.params[URLHandler.variantTechnicalParameterName] = aUrlTechnicalParameters;
				this.bCalled = true;
				return oReturnObject;
			}
			return {};
		}.bind(this));
		sandbox.stub(this.oModel, "getUShellService").callsFake(function(sServiceName) {
			switch (sServiceName) {
				case "URLParsing":
					return {
						parseShellHash: this.fnParseShellHashStub,
						constructShellHash() {return "constructedHash";}
					};
				case "ShellNavigationInternal":
					return {registerNavigationFilter() {}, unregisterNavigationFilter() {}};
				case "Navigation":
					return {navigate() {}};
				default:
					return undefined;
			}
		}.bind(this));
	}

	function stubUpdateCurrentVariant() {
		sandbox.stub(this.oModel, "updateCurrentVariant").resolves();
	}

	function checkUpdateCurrentVariantCalled(assert, sVariantManagement, sVariant) {
		assert.ok(this.oModel.updateCurrentVariant.calledOnce, "then variantModel.updateCurrentVariant called once");
		assert.ok(this.oModel.updateCurrentVariant.calledWithExactly({
			variantManagementReference: sVariantManagement,
			newVariantReference: sVariant,
			appComponent: this.oAppComponent
		}), "then variantModel.updateCurrentVariant called to activate the target variant");
	}

	function checkActivateVariantErrorResponse(assert, sExpectedError, sReceivedError) {
		assert.equal(sReceivedError, sExpectedError, "then Promise.reject() with the appropriate error message returned");
		assert.equal(this.oModel.updateCurrentVariant.callCount, 0, "then variantModel.updateCurrentVariant not called");
	}

	QUnit.module("Given an instance of VariantModel", {
		beforeEach() {
			this.oData = {
				variantMgmtId1: {
					defaultVariant: "variantMgmtId1",
					originalDefaultVariant: "variantMgmtId1",
					variants: [
						{
							author: "SAP",
							key: "variantMgmtId1",
							layer: Layer.VENDOR,
							title: "Standard",
							favorite: true,
							visible: true
						},
						{
							author: "Me",
							key: "variant1",
							layer: Layer.CUSTOMER,
							title: "variant B",
							favorite: false,
							visible: true
						}
					]
				}
			};

			this.oDummyControl = new VariantManagement("variantMgmtId1");

			this.oAppComponent = new Component("AppComponent");
			sandbox.stub(ManifestUtils, "getFlexReferenceForControl").returns("myReference");
			this.getVMRefForVariantStub = sandbox.stub(VariantManagementState, "getVariantManagementReferenceForVariant")
			.withArgs("myReference", "variant1").returns("variantMgmtId1");
			sandbox.stub(this.oDummyControl, "waitForInit").resolves();
			this.oModel = new VariantModel(this.oData, {
				appComponent: this.oAppComponent
			});
			return this.oModel.initialize()
			.then(function() {
				this.oAppComponent.setModel(this.oModel, ControlVariantApplyAPI.getVariantModelName());
				this.oComponent = new Component("EmbeddedComponent");
				sandbox.stub(Utils, "getAppComponentForControl")
				.callThrough()
				.withArgs(this.oDummyControl).returns(this.oAppComponent)
				.withArgs(this.oComponent).returns(this.oAppComponent);
			}.bind(this));
		},
		afterEach() {
			sandbox.restore();
			this.oModel.destroy();
			this.oAppComponent.destroy();
			this.oComponent.destroy();
			this.oDummyControl.destroy();
		}
	}, function() {
		QUnit.test("when calling 'clearVariantParameterInURL' with a control as parameter", function(assert) {
			var aUrlTechnicalParameters = ["fakevariant", "variant1"];
			stubTechnicalParameterValues.call(this, aUrlTechnicalParameters);

			ControlVariantApplyAPI.clearVariantParameterInURL({control: this.oDummyControl});

			assert.ok(this.fnParseShellHashStub.calledTwice, "then variant parameter values were requested; once for read and write each");
			assert.deepEqual(_omit(URLHandler.update.getCall(0).args[0], "model"), {
				parameters: [aUrlTechnicalParameters[0]],
				updateURL: true,
				updateHashEntry: true,
				silent: false
			}, "then URLHandler.update called with the desired arguments");
		});

		QUnit.test("when calling 'clearVariantParameterInURL' without a VariantModel available", function(assert) {
			sandbox.stub(Log, "error");
			sandbox.stub(this.oAppComponent, "getModel").returns(undefined);
			sandbox.spy(URLHandler, "update");
			ControlVariantApplyAPI.clearVariantParameterInURL({control: this.oDummyControl});
			assert.strictEqual(URLHandler.update.callCount, 0, "the URLHandler was not called");
			assert.strictEqual(
				Log.error.lastCall.args[0],
				"Variant model could not be found on the provided control",
				"an error was logged"
			);
		});

		QUnit.test("when calling 'activateVariant' with a control id", function(assert) {
			stubUpdateCurrentVariant.call(this);

			return ControlVariantApplyAPI.activateVariant({
				element: "variantMgmtId1",
				variantReference: "variant1"
			})
			.then(function() {
				assert.equal(this.oDummyControl.waitForInit.callCount, 1, "the function waits for the VM control");
				checkUpdateCurrentVariantCalled.call(this, assert, "variantMgmtId1", "variant1");
			}.bind(this));
		});

		QUnit.test("when calling 'activateVariant' with a control", function(assert) {
			stubUpdateCurrentVariant.call(this);

			return ControlVariantApplyAPI.activateVariant({
				element: this.oDummyControl,
				variantReference: "variant1"
			})
			.then(function() {
				checkUpdateCurrentVariantCalled.call(this, assert, "variantMgmtId1", "variant1");
			}.bind(this));
		});

		QUnit.test("when calling 'activateVariant' with a component id", function(assert) {
			stubUpdateCurrentVariant.call(this);

			return ControlVariantApplyAPI.activateVariant({
				element: this.oComponent.getId(),
				variantReference: "variant1"
			})
			.then(function() {
				checkUpdateCurrentVariantCalled.call(this, assert, "variantMgmtId1", "variant1");
			}.bind(this));
		});

		QUnit.test("when calling 'activateVariant' with a component", function(assert) {
			stubUpdateCurrentVariant.call(this);

			return ControlVariantApplyAPI.activateVariant({
				element: this.oComponent,
				variantReference: "variant1"
			})
			.then(function() {
				checkUpdateCurrentVariantCalled.call(this, assert, "variantMgmtId1", "variant1");
			}.bind(this));
		});

		QUnit.test("when calling 'activateVariant' with an invalid variant reference", function(assert) {
			stubUpdateCurrentVariant.call(this);

			return ControlVariantApplyAPI.activateVariant({
				element: this.oComponent,
				variantReference: "variantInvalid"
			})
			.then(function() {
				assert.ok(false, "should not resolve");
			})
			.catch(function(oError) {
				checkActivateVariantErrorResponse.call(
					this,
					assert,
					"Variant management reference not found. Check the passed element and variantReference",
					oError.message
				);
			}.bind(this));
		});

		QUnit.test("when calling 'activateVariant' with a random object", function(assert) {
			stubUpdateCurrentVariant.call(this);

			return ControlVariantApplyAPI.activateVariant({
				element: {},
				variantReference: "variant1"
			})
			.then(function() {
				assert.ok(false, "should not resolve");
			})
			.catch(function(oError) {
				checkActivateVariantErrorResponse.call(
					this,
					assert,
					"A valid variant management control or component (instance or ID) should be passed as parameter",
					oError.message
				);
			}.bind(this));
		});

		QUnit.test("when calling 'activateVariant' with an invalid id", function(assert) {
			stubUpdateCurrentVariant.call(this);

			return ControlVariantApplyAPI.activateVariant({
				element: "invalidId",
				variantReference: "variant1"
			})
			.then(function() {
				assert.ok(false, "should not resolve");
			})
			.catch(function(oError) {
				checkActivateVariantErrorResponse.call(
					this,
					assert,
					"No valid component or control found for the provided ID",
					oError.message
				);
			}.bind(this));
		});

		QUnit.test("when calling 'activateVariant' with a control with an invalid variantModel", function(assert) {
			stubUpdateCurrentVariant.call(this);
			this.oAppComponent.setModel(null, ControlVariantApplyAPI.getVariantModelName());

			return ControlVariantApplyAPI.activateVariant({
				element: this.oDummyControl,
				variantReference: "variant1"
			})
			.then(function() {
				assert.ok(false, "should not resolve");
			})
			.catch(function(oError) {
				checkActivateVariantErrorResponse.call(
					this,
					assert,
					"No variant management model found for the passed control or application component",
					oError.message
				);
			}.bind(this));
		});

		QUnit.test("when calling 'activateVariant' with an unavailable variant", async function(assert) {
			stubUpdateCurrentVariant.call(this);
			const oLazyLoadStub = sandbox.stub(VariantManagementState, "loadVariant").callsFake((mPropertyBag) => {
				assert.strictEqual(mPropertyBag.reference, "myReference", "then the reference is passed");
				assert.deepEqual(mPropertyBag.variantReference, "notYetLoadedVariant", "then the variant reference is passed");

				// simulate what would happen if the variant was loaded and added to the model
				this.getVMRefForVariantStub.withArgs("myReference", "notYetLoadedVariant").returns("variantMgmtId1");
			});
			await ControlVariantApplyAPI.activateVariant({
				element: "variantMgmtId1",
				variantReference: "notYetLoadedVariant"
			});
			assert.strictEqual(this.oDummyControl.waitForInit.callCount, 1, "the function waits for the VM control");
			assert.strictEqual(oLazyLoadStub.callCount, 1, "then the variant is loaded lazily");
			checkUpdateCurrentVariantCalled.call(this, assert, "variantMgmtId1", "notYetLoadedVariant");
		});

		QUnit.test("when calling 'activateVariant' with an unavailable variant, but the variant can't be loaded", async function(assert) {
			assert.expect(4);
			const oUpdateVariantStub = sandbox.stub(this.oModel, "updateCurrentVariant");
			const oLazyLoadStub = sandbox.stub(VariantManagementState, "loadVariant")
			.rejects(new Error("Variant with reference 'notYetLoadedVariant' could not be found"));
			const bLogStub = sandbox.stub(Log, "error");

			try {
				await ControlVariantApplyAPI.activateVariant({
					element: "variantMgmtId1",
					variantReference: "notYetLoadedVariant"
				});
			} catch (oError) {
				assert.strictEqual(
					oError.message,
					"Variant with reference 'notYetLoadedVariant' could not be found",
					"then the error is thrown"
				);
				assert.strictEqual(bLogStub.callCount, 1, "then an error is logged");
			}
			assert.strictEqual(oLazyLoadStub.callCount, 1, "then the variant loading is triggered");
			assert.strictEqual(oUpdateVariantStub.callCount, 0, "then the variant is not activated");
		});

		QUnit.test("when calling 'activateVariant' with standardVariant set", async function(assert) {
			stubUpdateCurrentVariant.call(this);

			await ControlVariantApplyAPI.activateVariant({
				element: this.oDummyControl,
				variantReference: "variant1",
				standardVariant: true

			});
			checkUpdateCurrentVariantCalled.call(this, assert, "variantMgmtId1", "variantMgmtId1");
		});

		QUnit.test("when calling 'activateVariant' with standardVariant set without VM control passed", async function(assert) {
			const oLogStub = sandbox.stub(Log, "error");
			stubUpdateCurrentVariant.call(this);

			try {
				await ControlVariantApplyAPI.activateVariant({
					element: this.oComponent,
					variantReference: "variant1",
					standardVariant: true
				});
			} catch (oError) {
				const sError = "With using standardVariant and no variantReference, a variant management control must be passed as element";
				assert.strictEqual(oError.message, sError, "then the error is thrown");
				assert.strictEqual(oLogStub.firstCall.args[0].message, sError, "then an error is logged");
			}
		});
	});

	QUnit.module("Attach and detach listeners", {
		beforeEach() {
			return FlexState.initialize({
				reference: "MockController",
				componentId: "testComponent",
				componentData: {},
				manifest: {}
			}).then(async function() {
				const oView = await XMLView.create({
					id: "testComponent---mockview",
					viewName: "fl.test.VariantManagementTestApp"
				});
				const MockComponent = Component.extend("MockController", {
					metadata: {
						manifest: {
							"_version": "2.0.0",

							"sap.app": {
								applicationVersion: {
									version: "1.2.3"
								},
								id: "MockController"
							}
						}
					},
					createContent() {
						const oApp = new App(oView.createId("mockapp"));
						oApp.addPage(oView);
						return oApp;
					}
				});

				this.oComp = new MockComponent({id: "testComponent"});
				this.oView = oView;
				this.oVariantModel = new VariantModel({}, {
					appComponent: this.oComp
				});
				return this.oVariantModel.initialize();
			}.bind(this)).then(async function() {
				this.oComp.setModel(this.oVariantModel, ControlVariantApplyAPI.getVariantModelName());
				this.sVMReference = "mockview--VariantManagement1";
				this.sVMControlId = "testComponent---mockview--VariantManagement1";
				this.oVMControl = this.oView.byId(this.sVMControlId);

				const oData = this.oVariantModel.getData();
				oData[this.sVMReference].defaultVariant = "variant1";
				oData[this.sVMReference].currentVariant = "variant1";
				this.oVariant1 = {
					author: "Me",
					key: "variant1",
					layer: Layer.CUSTOMER,
					title: "variant A",
					favorite: true,
					visible: true,
					executeOnSelect: false
				};
				this.oVariant2 = {
					author: "Me",
					key: "variant2",
					layer: Layer.CUSTOMER,
					title: "variant B",
					favorite: true,
					visible: true,
					executeOnSelect: false
				};
				oData[this.sVMReference].variants.push(this.oVariant1);
				oData[this.sVMReference].variants.push(this.oVariant2);
				this.oUpdateCurrentVariantStub = sandbox.stub(this.oVariantModel, "updateCurrentVariant").resolves();
				sandbox.stub(VariantManagementState, "getCurrentVariantReference").returns("variant1");
				sandbox.stub(VariantManagementState, "getControlChangesForVariant").returns([]);
				sandbox.stub(FlexObjectManager, "deleteFlexObjects");
				this.oVariantManagementStateGetVariantStub = sandbox.stub(VariantManagementState, "getVariant")
				.withArgs({
					reference: "MockController",
					vmReference: this.sVMReference,
					vReference: "variant1"
				}).returns(this.oVariant1)
				.withArgs({
					reference: "MockController",
					vmReference: this.sVMReference,
					vReference: "variant2"
				}).returns(this.oVariant2);
				this.oGetDirtyFlexObjectsStub = sandbox.stub(FlexObjectState, "getDirtyFlexObjects");
				sandbox.stub(Switcher, "switchVariant").resolves();
				sandbox.stub(Reverter, "revertMultipleChanges").resolves();

				this.oVariantModel.setData(oData);
				this.oVariantModel.checkUpdate(true);

				this.oCompContainer = new ComponentContainer("ComponentContainer", {
					component: this.oComp
				}).placeAt("qunit-fixture");
				await nextUIUpdate();
			}.bind(this));
		},
		afterEach() {
			this.oCompContainer.destroy();
			FlexState.clearState();
			sandbox.restore();
		}
	}, function() {
		function waitForInitialCallbackCall(fnCallbackStub, oExpectedVariant, assert) {
			return new Promise(function(resolve) {
				fnCallbackStub.callsFake(function(oNewVariant) {
					assert.ok(true, "the callback was called once");
					assert.deepEqual(oNewVariant, oExpectedVariant, "the correct variant was passed");
					resolve();
				});
			});
		}

		QUnit.test("when 'attachVariantApplied' is called with callAfterInitialVariant=false", async function(assert) {
			const sVMReference1 = "mockview--VariantManagement1";
			const fnCallback1 = sandbox.stub();
			const fnCallback2 = sandbox.stub();
			const fnCallback3 = sandbox.stub();
			const oErrorStub = sandbox.stub(Log, "error");
			const setShowExecuteOnSelectionSpy = sandbox.spy(this.oVMControl, "setShowExecuteOnSelection");

			await ControlVariantApplyAPI.attachVariantApplied({
				vmControlId: this.sVMControlId,
				selector: this.oView.byId("MainForm"),
				callback: fnCallback1,
				callAfterInitialVariant: false
			});
			await ControlVariantApplyAPI.attachVariantApplied({
				vmControlId: this.sVMControlId,
				selector: this.oView.byId("hbox2InnerButton1"),
				callback: fnCallback2,
				callAfterInitialVariant: false
			});
			assert.strictEqual(oErrorStub.callCount, 1, "an error was logged");
			assert.ok(setShowExecuteOnSelectionSpy.calledWith(true), "the parameter is set to true");
			assert.strictEqual(fnCallback1.callCount, 0, "the callback was not called yet");
			assert.strictEqual(fnCallback2.callCount, 0, "the callback was not called yet");

			this.oVariantModel.callVariantSwitchListeners(sVMReference1, "variant1");
			assert.strictEqual(fnCallback1.callCount, 1, "the callback was called once");
			assert.deepEqual(fnCallback1.lastCall.args[0], this.oVariant1, "the new variant is passed as parameter");
			assert.strictEqual(fnCallback2.callCount, 0, "the callback was not called");

			this.oVariantModel.callVariantSwitchListeners(sVMReference1, "variant1", fnCallback3, "scenario");
			assert.strictEqual(fnCallback3.callCount, 1, "the callback was called once");
			assert.strictEqual(fnCallback3.lastCall.args[0].key, this.oVariant1.key, "the new variant is passed as parameter");
			assert.strictEqual(fnCallback3.lastCall.args[0].createScenario, "scenario", "the scenario was saved in the variant");
			assert.strictEqual(fnCallback1.callCount, 1, "the callback was not called");
			assert.strictEqual(fnCallback2.callCount, 0, "the callback was not called");

			await ControlVariantApplyAPI.attachVariantApplied({
				vmControlId: this.sVMControlId,
				selector: this.oView.byId("MainForm"),
				callback: fnCallback2,
				callAfterInitialVariant: false
			});

			this.oVariantModel.callVariantSwitchListeners(sVMReference1, "variant2");
			assert.strictEqual(fnCallback1.callCount, 1, "the callback was not called again");
			assert.strictEqual(fnCallback2.callCount, 1, "the callback was called once");
			assert.deepEqual(fnCallback2.lastCall.args[0], this.oVariant2, "the new variant is passed as parameter");

			await ControlVariantApplyAPI.attachVariantApplied({
				vmControlId: this.sVMControlId,
				selector: this.oView.byId("ObjectPageSection1"),
				callback: fnCallback1,
				callAfterInitialVariant: false
			});

			this.oVariantModel.callVariantSwitchListeners(sVMReference1, "variant2");
			assert.strictEqual(fnCallback1.callCount, 2, "the callback was called again");
			assert.strictEqual(fnCallback2.callCount, 2, "the callback was called again");

			await ControlVariantApplyAPI.detachVariantApplied({
				vmControlId: this.sVMControlId,
				selector: this.oView.byId("MainForm")
			});

			this.oVariantModel.callVariantSwitchListeners(sVMReference1, "variant2");
			assert.strictEqual(fnCallback1.callCount, 3, "the callback was called again");
			assert.strictEqual(fnCallback2.callCount, 2, "the callback was not called again");

			await ControlVariantApplyAPI.detachVariantApplied({
				vmControlId: this.sVMControlId,
				selector: this.oView.byId("ObjectPageSection1")
			});

			this.oVariantModel.callVariantSwitchListeners(sVMReference1, "variant2");
			assert.strictEqual(fnCallback1.callCount, 3, "the callback was not called again");
			assert.strictEqual(fnCallback2.callCount, 2, "the callback was not called again");
		});

		QUnit.test("when 'attachVariantApplied' is called with the control not being rendered yet", async function(assert) {
			const fnCallback1 = sandbox.stub();
			const fnCallback2 = sandbox.stub();
			const fnCallback3 = sandbox.stub();
			const oNewControl1 = new Button("newControl1", {text: "foo"});
			const oNewControl2 = new Button("newControl2", {text: "foo"});
			const oNewControl3 = new Button("newControl3", {text: "foo"});
			const oLogStub = sandbox.stub(Log, "error");

			Promise.all([
				waitForInitialCallbackCall(fnCallback1, this.oVariant1, assert),
				waitForInitialCallbackCall(fnCallback2, this.oVariant1, assert)
			]).then(() => {
				this.oView.byId("MainForm").addContent(oNewControl1);
				this.oView.byId("hbox1").addItem(oNewControl2);
				this.oView.byId("MainForm").addContent(oNewControl3);
			});

			await Promise.all([
				ControlVariantApplyAPI.attachVariantApplied({
					vmControlId: this.sVMControlId,
					selector: oNewControl1,
					callback: fnCallback1,
					callAfterInitialVariant: true
				}),
				ControlVariantApplyAPI.attachVariantApplied({
					vmControlId: this.sVMControlId,
					selector: oNewControl2,
					callback: fnCallback2,
					callAfterInitialVariant: true
				}),
				ControlVariantApplyAPI.attachVariantApplied({
					vmControlId: this.sVMControlId,
					selector: oNewControl3,
					callback: fnCallback3,
					callAfterInitialVariant: false
				})
			])
			.then(() => {
				assert.ok(fnCallback3.notCalled, "Callback for control with callAfterInitialVariant=false is not called before the switch");

				this.oVariantModel.callVariantSwitchListeners(this.sVMReference, "variant1");
				assert.strictEqual(fnCallback1.callCount, 2, "callback for first control with callAfterInitialVariant was called twice");
				assert.strictEqual(
					fnCallback2.callCount,
					1,
					"callback for control not in VM context but with callAfterInitialVariant was called once"
				);
				assert.ok(oLogStub.called, "an error was logged for the second control - not in VM context");
				assert.strictEqual(fnCallback3.callCount, 1, "callback for control with callAfterInitialVariant=false was called once");
			});
		});

		QUnit.test("when 'attachVariantApplied' is called with executeOnSelectionForStandardDefault set, standard being default and no flex change for apply automatically", async function(assert) {
			const sVMReference1 = "mockview--VariantManagement2";
			const sVMControlId = `testComponent---${sVMReference1}`;
			this.oView.byId(sVMControlId).setExecuteOnSelectionForStandardDefault(true);
			const fnCallback1 = sandbox.stub();
			const fnCallback2 = sandbox.stub();
			sandbox.stub(VariantManagementState, "getVariantChangesForVariant").returns([]);
			this.oVariant1.instance = {
				setExecuteOnSelection: sandbox.stub()
			};
			this.oVariantManagementStateGetVariantStub.withArgs({
				reference: "MockController",
				vmReference: sVMReference1,
				vReference: sVMReference1
			}).returns(this.oVariant1);

			await Promise.all([
				ControlVariantApplyAPI.attachVariantApplied({
					vmControlId: sVMControlId,
					selector: this.oView.byId("ObjectPageSection3"),
					callback: fnCallback1,
					callAfterInitialVariant: true
				}),
				ControlVariantApplyAPI.attachVariantApplied({
					vmControlId: sVMControlId,
					selector: this.oView.byId("ObjectPageSection3"),
					callback: fnCallback2,
					callAfterInitialVariant: false
				})
			]).then(() => {
				assert.strictEqual(fnCallback1.callCount, 1, "the callback was called");
				assert.ok(this.oVariant1.instance.setExecuteOnSelection.calledWith(true), "the flag to apply automatically is set");
				assert.strictEqual(fnCallback2.callCount, 1, "the callback was called");
				assert.ok(this.oVariant1.instance.setExecuteOnSelection.calledTwice, "the flag to apply automatically is set again");
			});
		});

		QUnit.test("when 'attachVariantApplied' is called with executeOnSelectionForStandardDefault set, standard being default, no flex change for apply automatically and a different current variant", async function(assert) {
			const sVMReference1 = "mockview--VariantManagement2";
			const sVMControlId = `testComponent---${sVMReference1}`;
			this.oView.byId(sVMControlId).setExecuteOnSelectionForStandardDefault(true);
			sandbox.stub(VariantManagementState, "getVariantChangesForVariant").returns([]);
			this.oVariant1.instance = {
				setExecuteOnSelection: sandbox.stub()
			};
			this.oVariantManagementStateGetVariantStub.withArgs({
				reference: "MockController",
				vmReference: sVMReference1,
				vReference: sVMReference1
			}).returns(this.oVariant1);

			await ControlVariantApplyAPI.attachVariantApplied({
				vmControlId: sVMControlId,
				selector: this.oView.byId("ObjectPageSection3"),
				callback() {},
				callAfterInitialVariant: true
			});
			assert.ok(this.oVariant1.instance.setExecuteOnSelection.calledWith(true), "the flag to apply automatically is set");
		});

		QUnit.test("when 'attachVariantApplied' is called without executeOnSelectionForStandardDefault set, standard being default and no flex change for apply automatically", async function(assert) {
			const sVMReference1 = "mockview--VariantManagement2";
			const sVMControlId = `testComponent---${sVMReference1}`;
			const fnCallback1 = sandbox.stub();
			const fnCallback2 = sandbox.stub();
			sandbox.stub(VariantManagementState, "getVariantChangesForVariant").returns([]);
			this.oVariant1.instance = {
				setExecuteOnSelection: sandbox.stub()
			};
			this.oVariantManagementStateGetVariantStub.withArgs({
				reference: "MockController",
				vmReference: sVMReference1,
				vReference: sVMReference1
			}).returns(this.oVariant1);

			await Promise.all([
				ControlVariantApplyAPI.attachVariantApplied({
					vmControlId: sVMControlId,
					selector: this.oView.byId("ObjectPageSection3"),
					callback: fnCallback1,
					callAfterInitialVariant: true
				}),
				ControlVariantApplyAPI.attachVariantApplied({
					vmControlId: sVMControlId,
					selector: this.oView.byId("ObjectPageSection3"),
					callback: fnCallback2,
					callAfterInitialVariant: false
				})
			]).then(() => {
				assert.strictEqual(fnCallback1.callCount, 1, "the callback with callAfterInitialVariant: true was called");
				assert.ok(this.oVariant1.instance.setExecuteOnSelection.notCalled, "the flag to apply automatically is not set");
				assert.strictEqual(fnCallback2.callCount, 0, "the callback with callAfterInitialVariant: false was not called");
			});
		});

		QUnit.test("when 'attachVariantApplied' is called with executeOnSelectionForStandardDefault set, standard being default and a flex change for apply automatically", function(assert) {
			const sVMReference1 = "mockview--VariantManagement2";
			const sVMControlId = `testComponent---${sVMReference1}`;
			this.oView.byId(sVMControlId).setExecuteOnSelectionForStandardDefault(true);
			const fnCallback1 = sandbox.stub();
			const fnCallback2 = sandbox.stub();
			sandbox.stub(VariantManagementState, "getVariantChangesForVariant").returns([
				FlexObjectFactory.createVariantChange({
					content: {
						executeOnSelect: false
					},
					changeType: "setExecuteOnSelect"
				})
			]);
			this.oVariant1.instance = {
				setExecuteOnSelection: sandbox.stub()
			};
			this.oVariantManagementStateGetVariantStub.withArgs({
				reference: "MockController",
				vmReference: sVMReference1,
				vReference: sVMReference1
			}).returns(this.oVariant1);

			return Promise.all([
				ControlVariantApplyAPI.attachVariantApplied({
					vmControlId: sVMControlId,
					selector: this.oView.byId("ObjectPageSection3"),
					callback: fnCallback1,
					callAfterInitialVariant: true
				}),
				ControlVariantApplyAPI.attachVariantApplied({
					vmControlId: sVMControlId,
					selector: this.oView.byId("ObjectPageSection3"),
					callback: fnCallback2,
					callAfterInitialVariant: false
				})
			]).then(() => {
				assert.strictEqual(fnCallback1.callCount, 1, "the callback with callAfterInitialVariant: true was called");
				assert.strictEqual(fnCallback2.callCount, 0, "the callback with callAfterInitialVariant: false was not called");
			});
		});

		QUnit.test("when 'attachVariantApplied' is called with executeOnSelectionForStandardDefault set, standard not being default and no flex change for apply automatically", async function(assert) {
			this.oVMControl.setExecuteOnSelectionForStandardDefault(true);
			const fnCallback1 = sandbox.stub();
			const fnCallback2 = sandbox.stub();
			sandbox.stub(VariantManagementState, "getVariantChangesForVariant").returns([]);
			sandbox.stub(VariantManagementState, "getDefaultVariantReference").returns("variant2");
			this.oVariant1.instance = {
				setExecuteOnSelection: sandbox.stub()
			};
			this.oVariantManagementStateGetVariantStub.withArgs({
				reference: "MockController",
				vmReference: this.sVMReference,
				vReference: this.sVMReference
			}).returns(this.oVariant1);

			await Promise.all([
				ControlVariantApplyAPI.attachVariantApplied({
					vmControlId: this.sVMControlId,
					selector: this.oView.byId("MainForm"),
					callback: fnCallback1,
					callAfterInitialVariant: true
				}),
				ControlVariantApplyAPI.attachVariantApplied({
					vmControlId: this.sVMControlId,
					selector: this.oView.byId("MainForm"),
					callback: fnCallback2,
					callAfterInitialVariant: false
				})
			]).then(() => {
				assert.strictEqual(fnCallback1.callCount, 1, "the callback with callAfterInitialVariant: true was called");
				assert.strictEqual(fnCallback2.callCount, 0, "the callback with callAfterInitialVariant: false was not called");
			});
		});
	});

	QUnit.module("Others", function() {
		QUnit.test("getVariantModelName returns the correct model name", function(assert) {
			assert.strictEqual(
				ControlVariantApplyAPI.getVariantModelName(),
				"$FlexVariants",
				"The variant model name is correct"
			);
		});

		QUnit.test("getVariantModel resolves with the variant model if present", function(assert) {
			const done = assert.async();
			const oFakeModel = {};
			const oAppComponent = {
				getModel(sName) {
					return sName === "$FlexVariants" ? oFakeModel : null;
				}
			};
			ControlVariantApplyAPI.getVariantModel(oAppComponent).then(function(oModel) {
				assert.strictEqual(oModel, oFakeModel, "Resolves with the correct model");
				done();
			});
		});

		QUnit.test("getVariantManagementControlByVMReference returns the correct control instance", function(assert) {
			const oFakeControl = { id: "myVMRef" };
			const oAppComponent = {
				byId() { return true; },
				createId(sId) { return sId; }
			};
			const getElementByIdStub = sinon.stub(Element, "getElementById").returns(oFakeControl);
			const result = ControlVariantApplyAPI.getVariantManagementControlByVMReference("myVMRef", oAppComponent);
			assert.strictEqual(result, oFakeControl, "Returns the correct control instance");
			getElementByIdStub.restore();
		});

		QUnit.test("getVariantModel waits for ModelContextChange event if model is not yet loaded", function(assert) {
			const fnDone = assert.async();
			const oFakeModel = {};
			let bModelLoaded = false;
			let fnModelContextChangeHandler;
			const oAppComponent = {
				getModel(sName) {
					return (sName === "$FlexVariants" && bModelLoaded) ? oFakeModel : null;
				},
				attachModelContextChange(fnFunction) {
					fnModelContextChangeHandler = fnFunction;
				},
				detachModelContextChange(fnFunction) {
					if (fnModelContextChangeHandler === fnFunction) {
						fnModelContextChangeHandler = null;
					}
				}
			};
			const oPromise = ControlVariantApplyAPI.getVariantModel(oAppComponent);
			setTimeout(function() {
				bModelLoaded = true;
				fnModelContextChangeHandler();
			}, 0);
			oPromise.then(function(oModel) {
				assert.strictEqual(oModel, oFakeModel, "Resolves with the model after ModelContextChange event");
				fnDone();
			});
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
