/* global QUnit */

sap.ui.define([
	"sap/base/util/restricted/_omit",
	"sap/base/util/Deferred",
	"sap/m/App",
	"sap/ui/core/mvc/XMLView",
	"sap/ui/core/BusyIndicator",
	"sap/ui/core/ComponentContainer",
	"sap/ui/core/Lib",
	"sap/ui/fl/apply/_internal/controlVariants/URLHandler",
	"sap/ui/fl/apply/_internal/controlVariants/Utils",
	"sap/ui/fl/apply/_internal/flexObjects/FlexObjectFactory",
	"sap/ui/fl/apply/_internal/flexObjects/States",
	"sap/ui/fl/apply/_internal/flexState/controlVariants/VariantManagementState",
	"sap/ui/fl/apply/_internal/flexState/FlexObjectState",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/apply/api/ControlVariantApplyAPI",
	"sap/ui/fl/initial/_internal/ManifestUtils",
	"sap/ui/fl/initial/_internal/Settings",
	"sap/ui/fl/variants/VariantManagement",
	"sap/ui/fl/variants/VariantManager",
	"sap/ui/fl/variants/VariantModel",
	"sap/ui/fl/write/_internal/flexState/FlexObjectManager",
	"sap/ui/fl/write/api/ContextBasedAdaptationsAPI",
	"sap/ui/fl/Layer",
	"sap/ui/fl/LayerUtils",
	"sap/ui/fl/Utils",
	"sap/ui/model/resource/ResourceModel",
	"sap/ui/thirdparty/sinon-4",
	"test-resources/sap/ui/fl/qunit/FlQUnitUtils",
	"test-resources/sap/ui/rta/qunit/RtaQunitUtils"
], function(
	_omit,
	Deferred,
	App,
	XMLView,
	BusyIndicator,
	ComponentContainer,
	Lib,
	URLHandler,
	VariantUtil,
	FlexObjectFactory,
	States,
	VariantManagementState,
	FlexObjectState,
	FlexState,
	ControlVariantApplyAPI,
	ManifestUtils,
	Settings,
	VariantManagement,
	VariantManager,
	VariantModel,
	FlexObjectManager,
	ContextBasedAdaptationsAPI,
	Layer,
	LayerUtils,
	Utils,
	ResourceModel,
	sinon,
	FlQUnitUtils,
	RtaQunitUtils
) {
	"use strict";

	const sandbox = sinon.createSandbox();
	const oResourceBundle = Lib.getResourceBundleFor("sap.ui.fl");
	const sVMReference = "variantMgmtId1";
	const sReference = "MyComponent";
	sinon.stub(LayerUtils, "getCurrentLayer").returns(Layer.CUSTOMER);
	sinon.stub(BusyIndicator, "show");
	sinon.stub(BusyIndicator, "hide");

	function createVariant(mVariantProperties) {
		return FlexObjectFactory.createFlVariant({
			id: mVariantProperties.fileName || mVariantProperties.key,
			reference: mVariantProperties.reference || sReference,
			layer: mVariantProperties.layer,
			user: mVariantProperties.author,
			variantReference: mVariantProperties.variantReference,
			variantManagementReference: mVariantProperties.variantManagementReference || sVMReference,
			variantName: mVariantProperties.title,
			contexts: mVariantProperties.contexts,
			support: {
				userId: mVariantProperties.userId
			}

		});
	}

	QUnit.module("Given an instance of VariantModel", {
		beforeEach() {
			this.oComponent = RtaQunitUtils.createAndStubAppComponent(sandbox, sReference);
			return FlexState.initialize({
				reference: sReference,
				componentId: sReference,
				componentData: {},
				manifest: {}
			}).then(function() {
				sandbox.stub(ManifestUtils, "getFlexReferenceForControl").returns(sReference);
				sandbox.stub(URLHandler, "attachHandlers");

				sandbox.spy(URLHandler, "initialize");
				this.oDataSelectorUpdateSpy = sandbox.spy(VariantManagementState.getVariantManagementMap(), "addUpdateListener");

				const oPersistedUIChange = FlexObjectFactory.createUIChange({
					id: "someUIChange",
					selector: {
						id: "someControlId"
					},
					layer: Layer.CUSTOMER,
					variantReference: "variant1"
				});
				oPersistedUIChange.setProperty("state", States.LifecycleState.PERSISTED);
				FlQUnitUtils.stubFlexObjectsSelector(sandbox, [
					createVariant({
						author: VariantUtil.DEFAULT_AUTHOR,
						key: sVMReference,
						layer: Layer.VENDOR,
						title: "Standard",
						contexts: {}
					}),
					createVariant({
						author: "Me",
						key: "variant0",
						layer: Layer.CUSTOMER,
						title: "variant A",
						contexts: { role: ["ADMINISTRATOR", "HR"], country: ["DE"] }
					}),
					createVariant({
						author: "Me",
						userId: "Me123",
						key: "variant1",
						layer: Layer.PUBLIC,
						variantReference: sVMReference,
						title: "variant B",
						favorite: false,
						executeOnSelect: true,
						contexts: { role: ["ADMINISTRATOR"], country: ["DE"] }
					}),
					createVariant({
						author: "Not Me",
						userId: "NotMe123",
						key: "variant2",
						layer: Layer.PUBLIC,
						variantReference: sVMReference,
						title: "variant C",
						favorite: false,
						executeOnSelect: true,
						contexts: {}
					}),
					createVariant({
						author: "Me",
						key: "variant3",
						layer: Layer.USER,
						variantReference: sVMReference,
						title: "variant D",
						favorite: false,
						executeOnSelect: true,
						contexts: { role: [], country: [] }
					}),
					FlexObjectFactory.createVariantManagementChange({
						id: "setDefaultVariantChange",
						layer: Layer.CUSTOMER,
						changeType: "setDefault",
						fileType: "ctrl_variant_management_change",
						selector: {
							id: sVMReference
						},
						content: {
							defaultVariant: "variant1"
						}
					}),
					FlexObjectFactory.createVariantChange({
						id: "setFavoriteChange",
						layer: Layer.CUSTOMER,
						changeType: "setFavorite",
						fileType: "ctrl_variant_change",
						variantId: "variant1",
						content: {
							favorite: false
						}
					}),
					FlexObjectFactory.createVariantChange({
						id: "setExecuteOnSelectChange",
						layer: Layer.CUSTOMER,
						changeType: "setExecuteOnSelect",
						fileType: "ctrl_variant_change",
						variantId: "variant1",
						content: {
							executeOnSelect: true
						}
					}),
					oPersistedUIChange
				]);

				this.oVMControl = new VariantManagement(sVMReference);
				this.oModel = new VariantModel({}, {
					appComponent: this.oComponent
				});
				this.oComponent.setModel(this.oModel, ControlVariantApplyAPI.getVariantModelName());
				this.oVMControl.setModel(this.oModel, ControlVariantApplyAPI.getVariantModelName());
				return this.oModel.initialize();
			}.bind(this));
		},
		afterEach() {
			FlexState.clearState();
			FlexState.clearRuntimeSteadyObjects(sReference, "RTADemoAppMD");
			VariantManagementState.resetCurrentVariantReference(sReference);
			sandbox.restore();
			FlexObjectManager.removeDirtyFlexObjects({ reference: sReference });
			this.oVMControl.destroy();
			this.oModel.destroy();
			this.oComponent.destroy();
		}
	}, function() {
		QUnit.test("when initializing a variant model instance", function(assert) {
			assert.ok(URLHandler.initialize.calledOnce, "then URLHandler.initialize() called once");
			assert.ok(
				URLHandler.initialize.calledWith({ model: this.oModel }),
				"then URLHandler.initialize() called with the the VariantModel"
			);

			var oVMData = this.oModel.getData()[sVMReference];
			assert.strictEqual(oVMData.currentVariant, "variant1", "the currentVariant was set");
			assert.strictEqual(oVMData.defaultVariant, "variant1", "the defaultVariant was set");
			assert.strictEqual(oVMData.modified, false, "the modified flag was set");

			assert.strictEqual(
				FlexObjectState.getLiveDependencyMap(sReference).mChanges.someControlId.length,
				1,
				"then the persisted UI change of the current variant is added to the dependency map"
			);
		});

		QUnit.test("when destroy() is called", function(assert) {
			assert.ok(this.oDataSelectorUpdateSpy.calledWith(this.oModel.fnUpdateListener), "the update listener was added");
			var oRemoveSpy = sandbox.spy(VariantManagementState.getVariantManagementMap(), "removeUpdateListener");
			var oClearSpy = sandbox.spy(VariantManagementState, "clearRuntimeSteadyObjects");
			var oClearCurrentVariantSpy = sandbox.spy(VariantManagementState, "resetCurrentVariantReference");
			this.oModel.destroy();
			assert.strictEqual(
				FlexObjectState.getLiveDependencyMap(sReference).mChanges.someControlId.length,
				0,
				"then the persisted UI change of the current variant is removed from the dependency map"
			);
			assert.ok(oClearSpy.calledOnce, "then fake standard variants were reset");
			assert.ok(oClearCurrentVariantSpy.calledOnce, "then the saved current variant was reset");
			assert.ok(oRemoveSpy.calledWith(this.oModel.fnUpdateListener), "the update listener was removed");
		});

		QUnit.test("when there is an update from the DataSelector", function(assert) {
			FlexObjectManager.addDirtyFlexObjects(
				this.oModel.sFlexReference,
				this.oModel.sFlexReference,
				[
					FlexObjectFactory.createVariantManagementChange({
						id: "setDefaultVariantChange",
						layer: Layer.CUSTOMER,
						changeType: "setDefault",
						fileType: "ctrl_variant_management_change",
						selector: {
							id: sVMReference
						},
						content: {
							defaultVariant: "variant2"
						}
					})
				]
			);
			VariantManagementState.setCurrentVariant({
				reference: sReference,
				vmReference: sVMReference,
				newVReference: "variant0"
			});
			FlexObjectManager.addDirtyFlexObjects(
				this.oModel.sFlexReference,
				this.oModel.sFlexReference,
				[
					FlexObjectFactory.createVariantChange({
						id: "setFavoriteChange",
						layer: Layer.CUSTOMER,
						changeType: "setFavorite",
						fileType: "ctrl_variant_change",
						variantId: "variant1",
						content: {
							favorite: true
						}
					})
				]
			);
			FlexObjectManager.addDirtyFlexObjects(
				this.oModel.sFlexReference,
				this.oModel.sFlexReference,
				[
					FlexObjectFactory.createUIChange({
						id: "someUIChange",
						layer: Layer.CUSTOMER,
						variantReference: "variant0"
					})
				]
			);
			FlexObjectManager.addDirtyFlexObjects(
				this.oModel.sFlexReference,
				this.oModel.sFlexReference,
				[
					FlexObjectFactory.createVariantChange({
						id: "setExecuteOnSelectChange",
						layer: Layer.CUSTOMER,
						changeType: "setExecuteOnSelect",
						fileType: "ctrl_variant_change",
						variantId: "variant1",
						content: {
							executeOnSelect: false
						}
					})
				]
			);
			FlexObjectManager.addDirtyFlexObjects(
				this.oModel.sFlexReference,
				this.oModel.sFlexReference,
				[
					FlexObjectFactory.createVariantChange({
						id: "setTitleChange",
						layer: Layer.CUSTOMER,
						changeType: "setTitle",
						fileType: "ctrl_variant_change",
						variantId: "variant1",
						texts: {
							title: { value: "variant B1" }
						}
					})
				]
			);
			FlexObjectManager.addDirtyFlexObjects(
				this.oModel.sFlexReference,
				this.oModel.sFlexReference,
				[
					FlexObjectFactory.createVariantChange({
						id: "setVisibleChange",
						layer: Layer.CUSTOMER,
						changeType: "setVisible",
						fileType: "ctrl_variant_change",
						variantId: "variant1",
						content: {
							visible: false
						}
					})
				]
			);
			FlexObjectManager.addDirtyFlexObjects(
				this.oModel.sFlexReference,
				this.oModel.sFlexReference,
				[
					FlexObjectFactory.createVariantChange({
						id: "setContextsChange",
						layer: Layer.CUSTOMER,
						changeType: "setContexts",
						fileType: "ctrl_variant_change",
						variantId: "variant1",
						content: {
							contexts: { role: ["ADMINISTRATOR1"], country: ["DE1"] }
						}
					})
				]
			);

			var oVMData = this.oModel.getData()[sVMReference];
			assert.strictEqual(oVMData.currentVariant, "variant0", "the currentVariant was set");
			assert.strictEqual(oVMData.defaultVariant, "variant2", "the defaultVariant was set");
			assert.strictEqual(oVMData.modified, true, "the modified flag was set");

			var oVariantEntry = oVMData.variants[2];
			assert.strictEqual(oVariantEntry.executeOnSelect, false, "then executeOnSelect was updated");
			assert.strictEqual(oVariantEntry.favorite, true, "then favorite was updated");
			assert.strictEqual(oVariantEntry.title, "variant B1", "then title was updated");
			assert.strictEqual(oVariantEntry.visible, false, "then visible was updated");
			assert.deepEqual(oVariantEntry.contexts, { role: ["ADMINISTRATOR1"], country: ["DE1"] }, "then contexts were updated");
		});

		QUnit.test("when calling 'setModelPropertiesForControl'", function(assert) {
			var fnDone = assert.async();
			sandbox.stub(Settings, "getInstanceOrUndef").returns({
				getIsKeyUser() {
					return false;
				},
				getIsPublicFlVariantEnabled() {
					return false;
				},
				getIsVariantPersonalizationEnabled() {
					return false;
				},
				getUser() {
					return undefined;
				},
				getUserId() {
					return undefined;
				}
			});
			var oVMData = this.oModel.getData()[sVMReference];
			this.oVMControl.setEditable(true);
			this.oModel.setModelPropertiesForControl(sVMReference, false, this.oVMControl);
			assert.ok(oVMData.variantsEditable, "the parameter variantsEditable is initially true");
			assert.strictEqual(oVMData.variants[4].rename, false, "user variant cannot renamed by default");
			assert.strictEqual(oVMData.variants[4].remove, false, "user variant cannot removed by default");
			assert.strictEqual(oVMData.variants[4].change, false, "user variant cannot changed by default");
			setTimeout(function() {
				assert.notOk(oVMData.variants[4].rename, "user variant can not be renamed after flp setting is received");
				assert.notOk(oVMData.variants[4].remove, "user variant can not be removed after flp setting is received");
				assert.notOk(oVMData.variants[4].change, "user variant can not be changed after flp setting is received");
				fnDone();
			}, 0);
			this.oModel.setModelPropertiesForControl(sVMReference, true, this.oVMControl);
			assert.notOk(oVMData.variantsEditable, "the parameter variantsEditable is set to false for bDesignTimeMode = true");
			this.oModel.setModelPropertiesForControl(sVMReference, false, this.oVMControl);
			assert.ok(oVMData.variantsEditable, "the parameter variantsEditable is set to true for bDesignTimeMode = false");
			Settings.getInstanceOrUndef.restore();
		});

		QUnit.test("when calling 'setModelPropertiesForControl' of a PUBLIC variant", function(assert) {
			let bIsKeyUser = false;
			let bIsPublicFlVariantEnabled = true;
			let sUser;
			let sUserId;
			sandbox.stub(Settings, "getInstanceOrUndef").returns({
				getIsKeyUser() {
					return bIsKeyUser;
				},
				getIsPublicFlVariantEnabled() {
					return bIsPublicFlVariantEnabled;
				},
				getUser() {
					return sUser;
				},
				getUserId() {
					return sUserId;
				},
				getIsVariantPersonalizationEnabled() {
					return true;
				}
			});
			var oVMData = this.oModel.getData()[sVMReference];
			this.oVMControl.setEditable(true);
			this.oModel.setModelPropertiesForControl(sVMReference, false, this.oVMControl);
			assert.strictEqual(oVMData.variantsEditable, true, "the parameter variantsEditable is true");
			assert.strictEqual(oVMData.variants[2].rename, true, "a public view editor can renamed its own PUBLIC variant");
			assert.strictEqual(oVMData.variants[2].remove, true, "a public view editor can removed its own PUBLIC variant");
			assert.strictEqual(oVMData.variants[2].change, true, "a public view editor can changed its own PUBLIC variant");
			assert.strictEqual(
				oVMData.variants[3].rename,
				true,
				"a public view editor can renamed another users PUBLIC variant in case the user cannot be determined"
			);
			assert.strictEqual(
				oVMData.variants[3].remove,
				true,
				"a public view editor can removed another users PUBLIC variant in case the user cannot be determined"
			);
			assert.strictEqual(
				oVMData.variants[3].change,
				true,
				"a public view editor can changed another users PUBLIC variant in case the user cannot be determined"
			);

			sUser = "OtherPerson";
			this.oModel.setModelPropertiesForControl(sVMReference, false, this.oVMControl);
			assert.strictEqual(oVMData.variants[3].rename, false, "a public view editor cannot renamed another users PUBLIC variant");
			assert.strictEqual(oVMData.variants[3].remove, false, "a public view editor cannot removed another users PUBLIC variant");
			assert.strictEqual(oVMData.variants[3].change, false, "a public view editor cannot changed another users PUBLIC variant");

			bIsKeyUser = true;
			bIsPublicFlVariantEnabled = false;
			this.oModel.setModelPropertiesForControl(sVMReference, false, this.oVMControl);
			assert.strictEqual(oVMData.variants[3].rename, true, "a key user can renamed another users PUBLIC variant");
			assert.strictEqual(oVMData.variants[3].remove, true, "a key user can removed another users PUBLIC variant");
			assert.strictEqual(oVMData.variants[3].change, true, "a key user can changed another users PUBLIC variant");

			bIsKeyUser = false;
			sUser = "Me";
			this.oModel.setModelPropertiesForControl(sVMReference, false, this.oVMControl);
			assert.strictEqual(oVMData.variants[3].rename, false, "a end user cannot renamed its own users PUBLIC variant");
			assert.strictEqual(oVMData.variants[3].remove, false, "a end user cannot removed its own users PUBLIC variant");
			assert.strictEqual(oVMData.variants[3].change, false, "a end user cannot changed its own users PUBLIC variant");
			assert.strictEqual(oVMData.variants[4].rename, true, "a end user can renamed its own users variant");
			assert.strictEqual(oVMData.variants[4].remove, true, "a end user can removed its own users variant");
			assert.strictEqual(oVMData.variants[4].change, true, "a end user can changed its own users variant");

			bIsKeyUser = false;
			sUser = "OtherPerson";
			sUserId = "OtherPerson";
			bIsPublicFlVariantEnabled = true;
			this.oModel.setModelPropertiesForControl(sVMReference, false, this.oVMControl);
			assert.strictEqual(oVMData.variants[2].rename, false, "Xa public view editor cannot renamed another users PUBLIC variant");
			assert.strictEqual(oVMData.variants[2].remove, false, "Xa public view editor cannot removed another users PUBLIC variant");
			assert.strictEqual(oVMData.variants[2].change, false, "Xa public view editor cannot changed another users PUBLIC variant");
			assert.strictEqual(oVMData.variants[3].rename, false, "Xa end user can renamed its own users variant");
			assert.strictEqual(oVMData.variants[3].remove, false, "Xa end user can removed its own users variant");
			assert.strictEqual(oVMData.variants[3].change, false, "Xa end user can changed its own users variant");

			bIsKeyUser = false;
			sUser = "OtherPerson";
			sUserId = "Me123";
			bIsPublicFlVariantEnabled = true;
			this.oModel.setModelPropertiesForControl(sVMReference, false, this.oVMControl);
			assert.strictEqual(oVMData.variants[2].rename, true, "Xa public view editor cannot renamed another users PUBLIC variant");
			assert.strictEqual(oVMData.variants[2].remove, true, "Xa public view editor cannot removed another users PUBLIC variant");
			assert.strictEqual(oVMData.variants[2].change, true, "Xa public view editor cannot changed another users PUBLIC variant");
			assert.strictEqual(oVMData.variants[3].rename, false, "Xa end user can renamed its own users variant");
			assert.strictEqual(oVMData.variants[3].remove, false, "Xa end user can removed its own users variant");
			assert.strictEqual(oVMData.variants[3].change, false, "Xa end user can changed its own users variant");

			Settings.getInstanceOrUndef.restore();
		});

		QUnit.test("when calling 'setModelPropertiesForControl' and variant management control has property editable=false", function(assert) {
			this.oVMControl.setEditable(false);
			this.oModel.setModelPropertiesForControl(sVMReference, false, this.oVMControl);
			assert.strictEqual(
				this.oModel.getData()[sVMReference].variantsEditable,
				false,
				"the parameter variantsEditable is initially false"
			);
			this.oModel.setModelPropertiesForControl(sVMReference, true, this.oVMControl);
			assert.strictEqual(
				this.oModel.getData()[sVMReference].variantsEditable,
				false,
				"the parameter variantsEditable stays false for bDesignTimeMode = true"
			);
			this.oModel.setModelPropertiesForControl(sVMReference, false, this.oVMControl);
			assert.strictEqual(
				this.oModel.getData()[sVMReference].variantsEditable,
				false,
				"the parameter variantsEditable stays false for bDesignTimeMode = false"
			);
		});

		QUnit.test("when calling 'setModelPropertiesForControl' with updateVariantInURL = true", function(assert) {
			assert.expect(8);
			this.oVMControl.setEditable(true);
			this.oVMControl.setUpdateVariantInURL(true);
			this.oModel.getData()[sVMReference].updateVariantInURL = true;
			this.oModel.getData()[sVMReference].currentVariant = "variant0";
			var iUpdateCallCount = 0;
			var oParams = {};
			oParams[VariantUtil.VARIANT_TECHNICAL_PARAMETER] = "foo";
			var oMockedURLParser = {
				parseShellHash() {
					return {
						params: oParams
					};
				}
			};
			sandbox.stub(this.oModel, "getUShellService").withArgs("URLParsing").returns(oMockedURLParser);
			sandbox.stub(URLHandler, "update").callsFake(function(mPropertyBag) {
				var mExpectedParameters = {
					parameters: [],
					updateURL: true,
					updateHashEntry: false,
					model: this.oModel
				};

				if (iUpdateCallCount === 1) {
					// second URLHandler.update() call with designTime mode being set from true -> false
					mExpectedParameters.parameters = ["currentHash1", "currentHash2"];
				}
				assert.strictEqual(
					mPropertyBag.model._bDesignTimeMode,
					iUpdateCallCount === 0,
					"then model's _bDesignTime property was set before URLHandler.update() was called"
				);

				assert.deepEqual(mPropertyBag, mExpectedParameters, "then URLHandler.update() called with the correct parameters");
				iUpdateCallCount++;
			}.bind(this));
			sandbox.stub(URLHandler, "getStoredHashParams").returns(["currentHash1", "currentHash2"]);

			this.oModel.setModelPropertiesForControl(sVMReference, false, this.oVMControl);
			assert.strictEqual(URLHandler.getStoredHashParams.callCount, 0, "then URLHandler.getStoredHashParams() not called");
			assert.strictEqual(this.oModel._bDesignTimeMode, false, "the model's _bDesignTimeMode property is initially false");

			this.oModel.setModelPropertiesForControl(sVMReference, true, this.oVMControl);
			assert.strictEqual(URLHandler.getStoredHashParams.callCount, 0, "then URLHandler.getStoredHashParams() not called");

			this.oModel.setModelPropertiesForControl(sVMReference, false, this.oVMControl);
			assert.strictEqual(URLHandler.getStoredHashParams.callCount, 1, "then URLHandler.getStoredHashParams() called once");
		});

		QUnit.test("when calling 'getVariantManagementReference'", function(assert) {
			var mVariantManagementReference = this.oModel.getVariantManagementReference("variant1");
			assert.deepEqual(mVariantManagementReference, {
				variantIndex: 2,
				variantManagementReference: sVMReference
			}, "then the correct variant management reference is returned");
		});

		[
			{
				inputParams: {
					changeType: "setTitle",
					title: "New Title",
					// layer: Layer.CUSTOMER,
					variantReference: "variant1"
				},
				variantCheck: {
					functionName: "getName",
					returnValue: "New Title"
				},
				fileType: "ctrl_variant_change",
				textKey: "title"
			},
			{
				inputParams: {
					changeType: "setFavorite",
					favorite: false,
					variantReference: "variant1"
				},
				variantCheck: {
					functionName: "getFavorite",
					returnValue: false
				},
				expectedChangeContent: {
					favorite: false
				},
				fileType: "ctrl_variant_change"
			},
			{
				inputParams: {
					changeType: "setVisible",
					visible: false,
					variantReference: "variant1"
				},
				variantCheck: {
					functionName: "getVisible",
					returnValue: false
				},
				expectedChangeContent: {
					createdByReset: false,
					visible: false
				},
				fileType: "ctrl_variant_change"
			},
			{
				inputParams: {
					changeType: "setVisible",
					visible: false,
					variantReference: "variant1",
					adaptationId: "migration_test_id"
				},
				variantCheck: {
					functionName: "getVisible",
					returnValue: false
				},
				expectedChangeContent: {
					createdByReset: false,
					visible: false
				},
				fileType: "ctrl_variant_change"
			},
			{
				inputParams: {
					changeType: "setExecuteOnSelect",
					executeOnSelect: true,
					variantReference: "variant1"
				},
				variantCheck: {
					functionName: "getExecuteOnSelection",
					returnValue: true
				},
				expectedChangeContent: {
					executeOnSelect: true
				},
				fileType: "ctrl_variant_change"
			},
			{
				inputParams: {
					changeType: "setContexts",
					contexts: { role: ["ADMIN"], country: ["DE"] },
					variantReference: "variant1"
				},
				variantCheck: {
					functionName: "getContexts",
					returnValue: { role: ["ADMIN"], country: ["DE"] }
				},
				expectedChangeContent: {
					contexts: { role: ["ADMIN"], country: ["DE"] }
				},
				fileType: "ctrl_variant_change"
			},
			{
				inputParams: {
					changeType: "setDefault",
					defaultVariant: "variant0",
					variantManagementReference: sVMReference
				},
				expectedChangeContent: {
					defaultVariant: "variant0"
				},
				fileType: "ctrl_variant_management_change"
			}
		].forEach(function(oTestParams) {
			QUnit.test(`when calling 'addVariantChange' for ${oTestParams.inputParams.changeType} to add a change`, function(assert) {
				oTestParams.inputParams.appComponent = this.oComponent;
				const oAddDirtyFlexObjectsStub = sandbox.stub(FlexObjectManager, "addDirtyFlexObjects");
				if (!oTestParams.inputParams.adaptationId) {
					sandbox.stub(ContextBasedAdaptationsAPI, "hasAdaptationsModel").returns(true);
					sandbox.stub(ContextBasedAdaptationsAPI, "getDisplayedAdaptationId").returns("id_12345");
				}
				var oVariantInstance = createVariant(this.oModel.oData[sVMReference].variants[2]);
				sandbox.stub(this.oModel, "getVariant").returns({ instance: oVariantInstance });

				var oChange = VariantManager.addVariantChange(sVMReference, oTestParams.inputParams);
				if (oTestParams.textKey) {
					assert.strictEqual(
						oChange.getText(oTestParams.textKey),
						oTestParams.inputParams.title,
						"then the new change created with the new title"
					);
				}
				if (oTestParams.expectedChangeContent) {
					assert.deepEqual(oChange.getContent(), oTestParams.expectedChangeContent, "the change content was set");
				}
				if (oTestParams.variantCheck) {
					assert.deepEqual(
						oVariantInstance[oTestParams.variantCheck.functionName](),
						oTestParams.variantCheck.returnValue, "the variant was updated"
					);
				}
				if (oTestParams.inputParams.adaptationId) {
					assert.strictEqual(oChange.getAdaptationId(), oTestParams.inputParams.adaptationId);
				} else {
					assert.strictEqual(oChange.getAdaptationId(), "id_12345", "then the new change created with the current adaptationId");
				}
				assert.strictEqual(
					oChange.getChangeType(),
					oTestParams.inputParams.changeType,
					"then the new change created with 'setTitle' as changeType"
				);
				assert.strictEqual(
					oChange.getFileType(),
					oTestParams.fileType,
					"then the new change created with 'ctrl_variant_change' as fileType"
				);
				assert.deepEqual(
					oAddDirtyFlexObjectsStub.firstCall.args[2],
					[oChange],
					"then 'addDirtyFlexObjects' called with the newly created change"
				);
			});
		});

		QUnit.test("when calling 'deleteVariantChange'", function(assert) {
			const fnChangeStub = sandbox.stub().returns({
				convertToFileContent() {}
			});
			const mPropertyBag = { appComponent: this.oComponent };
			const oDeleteFlexObjectsStub = sandbox.stub(FlexObjectManager, "deleteFlexObjects");
			const oSetPropertiesStub = sandbox.stub(this.oModel, "setVariantProperties");
			VariantManager.deleteVariantChange(sVMReference, mPropertyBag, fnChangeStub());
			assert.ok(oDeleteFlexObjectsStub.calledWith({
				reference: sReference, flexObjects: [fnChangeStub()]
			}), "then deleteFlexObjects called with the passed change");
			assert.ok(oSetPropertiesStub.calledWith(sVMReference, mPropertyBag), "the correct properties were passed");
		});

		[true, false].forEach(function(bUpdateVariantInURL) {
			const sTitle = `when calling 'setVariantProperties' for 'setDefault' with different current and default variants, in UI adaptation mode ${bUpdateVariantInURL ? "with" : "without"} updateVariantInURL`;
			QUnit.test(sTitle, function(assert) {
				sandbox.stub(this.oModel, "getVariant").returns({ instance: createVariant(this.oModel.oData[sVMReference].variants[2]) });
				var mPropertyBag = {
					changeType: "setDefault",
					defaultVariant: "variant1",
					layer: Layer.CUSTOMER,
					variantManagementReference: sVMReference,
					appComponent: this.oComponent,
					change: {
						convertToFileContent() {}
					}
				};
				sandbox.stub(URLHandler, "getStoredHashParams").returns([]);
				sandbox.stub(FlexObjectManager, "addDirtyFlexObjects");
				sandbox.stub(URLHandler, "update");

				// set adaptation mode true
				this.oModel._bDesignTimeMode = true;

				// mock current variant id to make it different
				this.oModel.oData[sVMReference].currentVariant = "variantCurrent";
				this.oVMControl.setUpdateVariantInURL(bUpdateVariantInURL);

				this.oModel.setVariantProperties(sVMReference, mPropertyBag);
				if (bUpdateVariantInURL) {
					assert.ok(URLHandler.update.calledWithExactly({
						parameters: [this.oModel.oData[sVMReference].currentVariant],
						updateURL: false,
						updateHashEntry: true,
						model: this.oModel
					}), "then the URLHandler.update() called with the current variant id as a parameter in UI adaptation mode");
				} else {
					assert.ok(URLHandler.update.notCalled, "then the URLHandler.update() not called");
				}
			});

			const sTitle1 = `when calling 'setVariantProperties' for 'setDefault' with same current and default variants, in personalization mode ${bUpdateVariantInURL ? "with" : "without"} updateVariantInURL`;
			QUnit.test(sTitle1, function(assert) {
				sandbox.stub(this.oModel, "getVariant").returns({ instance: createVariant(this.oModel.oData[sVMReference].variants[2]) });
				var mPropertyBag = {
					changeType: "setDefault",
					defaultVariant: "variant1",
					layer: Layer.CUSTOMER,
					variantManagementReference: sVMReference,
					appComponent: this.oComponent,
					change: {
						convertToFileContent() {}
					}
				};
				// current variant already exists in hash parameters
				sandbox.stub(URLHandler, "getStoredHashParams").returns([this.oModel.oData[sVMReference].currentVariant]);
				sandbox.stub(FlexObjectManager, "addDirtyFlexObjects");
				sandbox.stub(URLHandler, "update");

				// set adaptation mode false
				this.oModel._bDesignTimeMode = false;
				this.oVMControl.setUpdateVariantInURL(bUpdateVariantInURL);

				this.oModel.setVariantProperties(sVMReference, mPropertyBag);
				if (bUpdateVariantInURL) {
					assert.ok(URLHandler.update.calledWithExactly({
						parameters: [],
						updateURL: bUpdateVariantInURL,
						updateHashEntry: true,
						model: this.oModel
					}), "then the URLHandler.update() called without the current variant id as a parameter in personalization mode");
				} else {
					assert.ok(URLHandler.update.notCalled, "then the URLHandler.update() not called");
				}
			});

			const sTitle2 = `when calling 'setVariantProperties' for 'setDefault' with different current and default variants, in personalization mode ${bUpdateVariantInURL ? "with" : "without"} updateVariantInURL`;
			QUnit.test(sTitle2, function(assert) {
				sandbox.stub(this.oModel, "getVariant").returns({ instance: createVariant(this.oModel.oData[sVMReference].variants[2]) });
				var mPropertyBag = {
					changeType: "setDefault",
					defaultVariant: "variant1",
					layer: Layer.CUSTOMER,
					variantManagementReference: sVMReference,
					appComponent: this.oComponent,
					change: {
						convertToFileContent() {}
					}
				};
				sandbox.stub(URLHandler, "getStoredHashParams").returns([]);
				sandbox.stub(FlexObjectManager, "addDirtyFlexObjects");
				sandbox.stub(URLHandler, "update");

				// set adaptation mode false
				this.oModel._bDesignTimeMode = false;

				// mock current variant id to make it different
				this.oModel.oData[sVMReference].currentVariant = "variantCurrent";
				this.oVMControl.setUpdateVariantInURL(bUpdateVariantInURL);

				this.oModel.setVariantProperties(sVMReference, mPropertyBag);
				if (bUpdateVariantInURL) {
					assert.ok(URLHandler.update.calledWithExactly({
						parameters: [this.oModel.oData[sVMReference].currentVariant],
						updateURL: bUpdateVariantInURL,
						updateHashEntry: true,
						model: this.oModel
					}), "then the URLHandler.update() called with the current variant id as a parameter in personalization mode");
				} else {
					assert.ok(URLHandler.update.notCalled, "then the URLHandler.update() not called");
				}
			});
		});

		QUnit.test("when calling '_ensureStandardVariantExists'", function(assert) {
			var oExpectedVariant = {
				id: "mockVariantManagement",
				reference: sReference,
				user: VariantUtil.DEFAULT_AUTHOR,
				variantManagementReference: "mockVariantManagement",
				variantName: oResourceBundle.getText("STANDARD_VARIANT_TITLE"),
				layer: Layer.BASE
			};

			var oAddRuntimeSteadyObjectStub = sandbox.stub(FlexState, "addRuntimeSteadyObject");
			var oCreateVariantStub = sandbox.stub(FlexObjectFactory, "createFlVariant").returns("variant");
			this.oModel.setData({});
			this.oModel._ensureStandardVariantExists("mockVariantManagement");

			assert.strictEqual(oAddRuntimeSteadyObjectStub.callCount, 1, "a variant was added");
			assert.deepEqual(oAddRuntimeSteadyObjectStub.firstCall.args[2], "variant", "the standard variant was added correctly");
			assert.strictEqual(oCreateVariantStub.callCount, 1, "a variant was created");
			assert.deepEqual(oCreateVariantStub.firstCall.args[0], oExpectedVariant, "the standard variant was created correctly");
		});

		QUnit.test("when calling 'getVariant' without a variant management reference", function(assert) {
			assert.deepEqual(
				this.oModel.getVariant("variant0"),
				this.oModel.oData[sVMReference].variants[1],
				"the default Variant is returned"
			);
		});

		QUnit.test("when 'getCurrentControlVariantIds' is called to get all current variant references", function(assert) {
			var oData = {
				variantManagementRef1: {
					currentVariant: "currentVariantRef1"
				},
				variantManagementRef2: {
					currentVariant: "currentVariantRef2"
				}
			};
			this.oModel.setData(oData);
			assert.deepEqual(
				this.oModel.getCurrentControlVariantIds(),
				[oData.variantManagementRef1.currentVariant, oData.variantManagementRef2.currentVariant],
				"then the function returns an array current variant references"
			);
		});

		QUnit.test("when 'getCurrentControlVariantIds' is called with no variant model data", function(assert) {
			this.oModel.setData({});
			assert.deepEqual(this.oModel.getCurrentControlVariantIds(), [], "then the function returns an empty array");
		});
	});

	// In this module, the model is not set on the app component by default as some of the tests
	// simulate model context changes before the VM control is initialized (i.e. before setModel is called)
	QUnit.module("Given a VariantModel with no data and a VariantManagement control", {
		async beforeEach() {
			const oApp = new App("testApp");
			const oView = await XMLView.create({
				id: "testView",
				viewName: "test-resources.sap.ui.fl.qunit.testResources.VariantManagementTestApp"
			});
			oApp.addPage(oView);
			await oView.loaded();
			this.oComponent = RtaQunitUtils.createAndStubAppComponent(sandbox, sReference, undefined, oApp);
			this.sVMReference = "testView--VariantManagement1";
			this.oVariantManagement = oView.byId(this.sVMReference);
			this.oComponentContainer = new ComponentContainer("testComponentContainer", {
				component: this.oComponent
			}).placeAt("qunit-fixture");

			await FlexState.initialize({
				reference: sReference,
				componentId: sReference,
				componentData: {},
				manifest: {}
			});
			sandbox.stub(ManifestUtils, "getFlexReferenceForControl").returns(sReference);
			sandbox.stub(FlexObjectManager, "saveFlexObjects").resolves();
			this.oRegisterControlStub = sandbox.stub(URLHandler, "registerControl");
			sandbox.stub(VariantManagementState, "getInitialUIChanges").returns([FlexObjectFactory.createUIChange({
				changeType: "foo",
				selector: { id: this.sVMReference }
			})]);
			sandbox.stub(FlexObjectState, "waitForFlexObjectsToBeApplied").resolves();

			this.oModel = new VariantModel({}, {
				appComponent: this.oComponent
			});
			await this.oModel.initialize();
		},
		afterEach() {
			sandbox.restore();
			this.oModel.destroy();
			this.oComponent.destroy();
			this.oComponentContainer.destroy();
			FlexObjectManager.removeDirtyFlexObjects({ reference: sReference });
			FlexState.clearState();
		}
	}, function() {
		QUnit.test("when calling invalidateMap", function(assert) {
			var oInvalidationStub = sandbox.stub(this.oModel.oDataSelector, "checkUpdate");
			this.oModel.invalidateMap();
			assert.strictEqual(oInvalidationStub.callCount, 1, "the DataSelector was invalidated");
		});

		QUnit.test("when calling 'setModel' of VariantManagement control", async function(assert) {
			var fnRegisterToModelSpy = sandbox.spy(this.oModel, "registerToModel");
			this.oVariantManagement.setExecuteOnSelectionForStandardDefault(true);
			sandbox.stub(this.oVariantManagement, "setShowExecuteOnSelection");
			this.oVariantManagement.setModel(this.oModel, ControlVariantApplyAPI.getVariantModelName());

			assert.ok(
				fnRegisterToModelSpy.calledOnce,
				"then registerToModel called once, when VariantManagement control setModel is called"
			);
			assert.ok(
				fnRegisterToModelSpy.calledWith(this.oVariantManagement),
				"then registerToModel called with VariantManagement control"
			);
			assert.ok(
				this.oVariantManagement.setShowExecuteOnSelection.calledWith(false),
				"showExecuteOnSelection is set to false"
			);
			await VariantManagementState.waitForVariantSwitch(sReference, this.sVMReference);
			assert.strictEqual(
				FlexObjectState.waitForFlexObjectsToBeApplied.callCount, 1,
				"the initial changes promise was added to the variant switch promise"
			);
		});

		QUnit.test("when creating a new variant based on a faked standard variant, and the Model gets destroyed", async function(assert) {
			const oAddRuntimeOnlySpy = sandbox.spy(VariantManagementState, "addRuntimeOnlyFlexObjects");
			this.oVariantManagement.setModel(this.oModel, ControlVariantApplyAPI.getVariantModelName());
			const oVariant = FlexObjectFactory.createFlVariant({
				id: "newVariant",
				layer: Layer.USER,
				variantReference: this.sVMReference,
				variantManagementReference: this.sVMReference
			});
			FlexObjectManager.addDirtyFlexObjects(sReference, sReference, [oVariant]);
			this.oModel.destroy();
			assert.strictEqual(oAddRuntimeOnlySpy.callCount, 1, "then the fake Standard variant is added to the runtimeOnlyData");

			this.oModel = new VariantModel({}, {
				appComponent: this.oComponent
			});

			await this.oModel.initialize();
			assert.strictEqual(this.oModel.oData[this.sVMReference].variants.length, 2, "then the fake and the new variant are available");
		});

		QUnit.test("when creating and saving a new UIChange based on a faked standard variant, and the Model gets destroyed", async function(assert) {
			const oAddRuntimeOnlySpy = sandbox.spy(VariantManagementState, "addRuntimeOnlyFlexObjects");
			this.oVariantManagement.setModel(this.oModel, ControlVariantApplyAPI.getVariantModelName());
			const oUIChange = FlexObjectFactory.createUIChange({
				id: "newUIChange",
				layer: Layer.CUSTOMER,
				variantReference: this.sVMReference
			});
			FlexObjectManager.addDirtyFlexObjects(this.oModel.sFlexReference, this.oModel.sFlexReference, [oUIChange]);
			oUIChange.setState(States.LifecycleState.PERSISTED);
			this.oModel.destroy();
			const oFlexObjects = FlexState.getFlexObjectsDataSelector().get({ reference: sReference });
			assert.strictEqual(oFlexObjects[0].getId(), "newUIChange", "then the change was not removed from the flex state");
			assert.strictEqual(oAddRuntimeOnlySpy.callCount, 1, "then the fake Standard variant is added to the runtimeOnlyData");

			this.oModel = new VariantModel({}, {
				appComponent: this.oComponent
			});

			await this.oModel.initialize();
			assert.strictEqual(this.oModel.oData[this.sVMReference].variants.length, 1, "then the fake variant is available");
			assert.strictEqual(this.oModel.oData[this.sVMReference].variants[0].controlChanges.length, 1, "then the UIChange is available");
		});

		QUnit.test("when creating a new UIChange based on a faked standard variant, and the Model gets destroyed", async function(assert) {
			const oAddRuntimeOnlySpy = sandbox.spy(VariantManagementState, "addRuntimeOnlyFlexObjects");
			const oDeleteChangeSpy = sandbox.spy(FlexObjectManager, "deleteFlexObjects");
			this.oVariantManagement.setModel(this.oModel, ControlVariantApplyAPI.getVariantModelName());
			const oUIChange = FlexObjectFactory.createUIChange({
				id: "newUIChange",
				layer: Layer.CUSTOMER,
				variantReference: this.sVMReference
			});
			const oPromise = new Deferred();
			const oRequireStub = sandbox.stub(sap.ui, "require");
			oRequireStub.withArgs(["sap/ui/fl/write/_internal/flexState/FlexObjectManager"])
			.callsFake((...aArgs) => {
				aArgs[1](FlexObjectManager);
				oPromise.resolve();
			});
			oRequireStub.callThrough();
			FlexObjectManager.addDirtyFlexObjects(this.oModel.sFlexReference, this.oModel.sFlexReference, [oUIChange]);
			this.oModel.destroy();
			await oPromise.promise;
			assert.strictEqual(oDeleteChangeSpy.callCount, 1, "then the change was removed from the FlexObjectManager");
			assert.strictEqual(oAddRuntimeOnlySpy.callCount, 1, "then the fake Standard variant is added to the runtimeOnlyData");

			this.oModel = new VariantModel({}, {
				appComponent: this.oComponent
			});

			await this.oModel.initialize();
			const oVariantsData = this.oModel.oData[this.sVMReference].variants;
			assert.strictEqual(oVariantsData.length, 1, "then the fake variant is available");
			assert.strictEqual(oVariantsData[0].controlChanges.length, 0, "then the change is not available");
		});

		QUnit.test("when variant management controls are initialized with with 'updateVariantInURL' property set and default (false)", function(assert) {
			this.oRegisterControlStub.resetHistory();
			const oVariantManagementWithoutURLUpdate = new VariantManagement("varMgmtRef1");
			const oVariantManagementWithURLUpdate = new VariantManagement("varMgmtRef2", { updateVariantInURL: true });
			oVariantManagementWithoutURLUpdate.setModel(this.oModel, ControlVariantApplyAPI.getVariantModelName());
			oVariantManagementWithURLUpdate.setModel(this.oModel, ControlVariantApplyAPI.getVariantModelName());
			assert.strictEqual(this.oRegisterControlStub.callCount, 1, "then URLHandler.attachHandlers was called once");
			assert.deepEqual(this.oRegisterControlStub.getCall(0).args[0], {
				vmReference: oVariantManagementWithURLUpdate.getId(),
				updateURL: true,
				model: this.oModel
			}, "then URLHandler.attachHandlers was called once for a control without URL update");
			oVariantManagementWithURLUpdate.destroy();
			oVariantManagementWithoutURLUpdate.destroy();
		});

		QUnit.test("when 'save' event event is triggered from a variant management control for a new variant", function(assert) {
			var fnDone = assert.async();

			ControlVariantApplyAPI.attachVariantApplied({
				selector: this.oVariantManagement,
				vmControlId: this.oVariantManagement.getId(),
				callback: () => {
					const oCurrentVariant = this.oModel.getVariant(this.oVariantManagement.getCurrentVariantReference());
					assert.strictEqual(
						oCurrentVariant.title,
						"variant created title",
						"then when the listeners are called the VM control is up-to-date"
					);
					fnDone();
				}
			});

			this.oComponent.setModel(this.oModel, ControlVariantApplyAPI.getVariantModelName());
			this.oVariantManagement.setModel(this.oModel, ControlVariantApplyAPI.getVariantModelName());

			this.oVariantManagement.fireSave({
				name: "variant created title",
				overwrite: false,
				def: false
			});
		});

		function createTranslationVariants(sTitleBinding) {
			const aVariants = [createVariant({
				author: VariantUtil.DEFAULT_AUTHOR,
				key: this.sVMReference,
				layer: Layer.VENDOR,
				variantManagementReference: this.sVMReference,
				title: "Default",
				favorite: true,
				visible: true,
				executeOnSelect: false
			}), createVariant({
				author: VariantUtil.DEFAULT_AUTHOR,
				key: "translatedVariant",
				layer: Layer.VENDOR,
				title: sTitleBinding, // key chosen arbitrarily
				variantManagementReference: this.sVMReference,
				favorite: true,
				visible: true,
				executeOnSelect: false
			})];
			aVariants.forEach((oVariant) => oVariant.setState(States.LifecycleState.PERSISTED));
			return aVariants;
		}

		QUnit.test("when there is a variant with a resource model key as its title", function(assert) {
			var oResourceModel = new ResourceModel({ bundleUrl: oResourceBundle.oUrlInfo.url });
			this.oVariantManagement.setModel(oResourceModel, "i18n");
			var sTitleBinding = "{i18n>VARIANT_MANAGEMENT_AUTHOR}";
			FlQUnitUtils.stubFlexObjectsSelector(sandbox, createTranslationVariants.call(this, sTitleBinding));
			this.oVariantManagement.setModel(this.oModel, ControlVariantApplyAPI.getVariantModelName());
			return this.oVariantManagement.waitForInit().then(function() {
				assert.strictEqual(
					this.oModel.getData()[this.sVMReference].variants[1].title,
					oResourceBundle.getText("VARIANT_MANAGEMENT_AUTHOR"),
					"then the text is resolved"
				);
				assert.strictEqual(
					FlexObjectState.getDirtyFlexObjects(sReference).length,
					0,
					"and no dirty change was added for the title resolution"
				);
			}.bind(this));
		});

		QUnit.test("when there is a variant with a resource model key with dots as its title", function(assert) {
			var oResourceModel = new ResourceModel({ bundleUrl: oResourceBundle.oUrlInfo.url });
			oResourceModel._oResourceBundle.aPropertyFiles[0].mProperties["test.with.dots"] = "Text From Key With Dots";
			this.oVariantManagement.setModel(oResourceModel, "i18n");
			var sTitleBinding = "{i18n>test.with.dots}";
			FlQUnitUtils.stubFlexObjectsSelector(sandbox, createTranslationVariants.call(this, sTitleBinding));
			this.oVariantManagement.setModel(this.oModel, ControlVariantApplyAPI.getVariantModelName());
			return this.oVariantManagement.waitForInit().then(function() {
				assert.strictEqual(
					this.oModel.getData()[this.sVMReference].variants[1].title,
					"Text From Key With Dots",
					"then the text is resolved"
				);
			}.bind(this));
		});

		QUnit.test("when there is a variant with a resource model key as its title but the model was not yet set", function(assert) {
			var fnDone = assert.async();
			var oResourceModel = new ResourceModel({ bundleUrl: oResourceBundle.oUrlInfo.url });
			this.oVariantManagement.setModel(oResourceModel, "i18n");
			var sTitleBinding = "{anotherResourceModel>VARIANT_MANAGEMENT_AUTHOR}";
			FlQUnitUtils.stubFlexObjectsSelector(sandbox, createTranslationVariants.call(this, sTitleBinding));
			this.oVariantManagement.setModel(this.oModel, ControlVariantApplyAPI.getVariantModelName());
			this.oVariantManagement.attachModelContextChange(function() {
				assert.strictEqual(
					this.oModel.getData()[this.sVMReference].variants[1].title,
					oResourceBundle.getText("VARIANT_MANAGEMENT_AUTHOR"),
					"when the model is set, the text gets resolved"
				);
				fnDone();
			}.bind(this));
			return this.oVariantManagement.waitForInit().then(function() {
				assert.strictEqual(
					this.oModel.getData()[this.sVMReference].variants[1].title,
					"{anotherResourceModel>VARIANT_MANAGEMENT_AUTHOR}",
					"before the model is set, the string is not resolved yet"
				);
				this.oVariantManagement.setModel(oResourceModel, "anotherResourceModel");
			}.bind(this));
		});
	});

	QUnit.module("Given a VariantModel without data and with Ushell available", {
		beforeEach() {
			this.oComponent = RtaQunitUtils.createAndStubAppComponent(sandbox, sReference);
			sandbox.stub(ManifestUtils, "getFlexReferenceForControl").returns("foo");
			this.oModel = new VariantModel({}, {
				appComponent: this.oComponent
			});
			this.oComponent.setModel(this.oModel, ControlVariantApplyAPI.getVariantModelName());

			sandbox.stub(Utils, "getUShellService").callsFake(function(sServiceName) {
				return Promise.resolve(sServiceName);
			});
			sandbox.stub(Utils, "getUshellContainer").returns({});
			sandbox.stub(URLHandler, "initialize");
			return this.oModel.initialize();
		},
		afterEach() {
			this.oModel.destroy();
			this.oComponent.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when calling getUShellService", function(assert) {
			assert.strictEqual(this.oModel.getUShellService("UserInfo"), "UserInfo", "the UserInfo service was loaded");
			assert.strictEqual(this.oModel.getUShellService("URLParsing"), "URLParsing", "the URLParsing service was loaded");
			assert.strictEqual(
				this.oModel.getUShellService("Navigation"),
				"Navigation", "the Navigation service was loaded"
			);
			assert.strictEqual(
				this.oModel.getUShellService("ShellNavigationInternal"),
				"ShellNavigationInternal",
				"the ShellNavigationInternal service was loaded"
			);
			assert.notOk(this.oModel.getUShellService("UnknownService"), "the UnknownService service was not loaded");
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});