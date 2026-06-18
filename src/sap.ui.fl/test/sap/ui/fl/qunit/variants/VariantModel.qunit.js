/* global QUnit */

sap.ui.define([
	"sap/base/util/restricted/_omit",
	"sap/base/util/Deferred",
	"sap/m/App",
	"sap/ui/core/mvc/XMLView",
	"sap/ui/core/BusyIndicator",
	"sap/ui/core/ComponentContainer",
	"sap/ui/core/Lib",
	"sap/ui/fl/apply/_internal/controlVariants/Utils",
	"sap/ui/fl/apply/_internal/flexObjects/FlexObjectFactory",
	"sap/ui/fl/apply/_internal/flexObjects/States",
	"sap/ui/fl/apply/_internal/flexState/controlVariants/VariantManagementState",
	"sap/ui/fl/apply/_internal/flexState/controlVariants/VariantManagerApply",
	"sap/ui/fl/apply/_internal/flexState/FlexObjectState",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/apply/api/ControlVariantApplyAPI",
	"sap/ui/fl/initial/_internal/Loader",
	"sap/ui/fl/initial/_internal/ManifestUtils",
	"sap/ui/fl/initial/_internal/Settings",
	"sap/ui/fl/variants/VariantManagement",
	"sap/ui/fl/variants/VariantManager",
	"sap/ui/fl/variants/VariantModel",
	"sap/ui/fl/write/_internal/flexState/FlexObjectManager",
	"sap/ui/fl/write/api/ContextBasedAdaptationsAPI",
	"sap/ui/fl/write/api/ControlVariantWriteAPI",
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
	VariantUtil,
	FlexObjectFactory,
	States,
	VariantManagementState,
	VariantManagerApply,
	FlexObjectState,
	FlexState,
	ControlVariantApplyAPI,
	Loader,
	ManifestUtils,
	Settings,
	VariantManagement,
	VariantManager,
	VariantModel,
	FlexObjectManager,
	ContextBasedAdaptationsAPI,
	ControlVariantWriteAPI,
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
				sandbox.stub(Utils, "getUshellContainer").returns(true);
				sandbox.stub(Utils, "getUShellService").resolves();

				this.oDataSelectorUpdateSpy = sandbox.spy(VariantManagementState.getVariantManagementDataSelector(), "addUpdateListener");

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
					appComponent: this.oComponent,
					vmReference: sVMReference,
					vmControl: this.oVMControl
				});
				this.oVMControl.setModel(this.oModel, ControlVariantApplyAPI.getVariantModelName());
			}.bind(this));
		},
		afterEach() {
			FlexState.clearState();
			FlexState.clearRuntimeSteadyObjects(sReference, "RTADemoAppMD");
			VariantManagementState.resetCurrentVariantReference(sReference, sVMReference);
			sandbox.restore();
			FlexObjectManager.removeDirtyFlexObjects({ reference: sReference });
			this.oVMControl.destroy();
			this.oModel.destroy();
			this.oComponent.destroy();
		}
	}, function() {
		QUnit.test("when initializing a variant model instance", function(assert) {
			assert.notOk(this.oModel._getURLHandler(), "the URLHandler is not yet created (lazy)");

			const oVMData = this.oModel.getData();
			assert.strictEqual(oVMData.currentVariant, "variant1", "the currentVariant was set");
			assert.strictEqual(oVMData.defaultVariant, "variant1", "the defaultVariant was set");
			assert.strictEqual(oVMData.modified, false, "the modified flag was set");

			assert.strictEqual(
				FlexObjectState.getLiveDependencyMap(sReference).mChanges.someControlId.length,
				1,
				"then the persisted UI change of the current variant is added to the dependency map"
			);

			assert.strictEqual(
				this.oModel.iSizeLimit,
				10000,
				"then the size limit is set to 10000"
			);
		});

		QUnit.test("when calling 'initializeURLHandler' with updateVariantInURL = false", async function(assert) {
			this.oVMControl.setProperty("updateVariantInURL", false);
			await this.oModel.initializeURLHandler();
			assert.notOk(this.oModel._getURLHandler(), "then the URLHandler is not created");
		});

		QUnit.test("when calling 'initializeURLHandler' without a UShell container", async function(assert) {
			this.oVMControl.setProperty("updateVariantInURL", true);
			Utils.getUshellContainer.returns(undefined);
			await this.oModel.initializeURLHandler();
			assert.notOk(this.oModel._getURLHandler(), "then the URLHandler is not created");
		});

		QUnit.test("when calling 'initializeURLHandler' with updateVariantInURL = true and a UShell container", async function(assert) {
			this.oVMControl.setProperty("updateVariantInURL", true);
			await this.oModel.initializeURLHandler();
			assert.ok(this.oModel._getURLHandler(), "then the URLHandler is created");
		});

		QUnit.test("when updateData() sets default UI properties on variants", function(assert) {
			const oFreshModel = new VariantModel({}, { appComponent: this.oComponent, vmReference: sVMReference, vmControl: this.oVMControl });
			const oVMData = oFreshModel.getData();

			oVMData.variants.forEach((oVariant) => {
				assert.strictEqual(oVariant.rename, true, `variant '${oVariant.key}' has rename=true by default`);
				assert.strictEqual(oVariant.change, true, `variant '${oVariant.key}' has change=true by default`);
				assert.strictEqual(oVariant.remove, true, `variant '${oVariant.key}' has remove=true by default`);
			});
			// USER layer variant gets Private sharing, all others get Public
			const oUserVariant = oVMData.variants.find((oV) => oV.layer === Layer.USER);
			assert.strictEqual(oUserVariant.sharing, "Private", "USER layer variant has Private sharing");
			oVMData.variants.filter((oV) => oV.layer !== Layer.USER).forEach((oVariant) => {
				assert.strictEqual(oVariant.sharing, "Public", `'${oVariant.key}' (${oVariant.layer}) has Public sharing`);
			});

			oFreshModel.destroy();
		});

		QUnit.test("when destroy() is called", function(assert) {
			assert.ok(this.oDataSelectorUpdateSpy.calledWith(this.oModel.fnUpdateListener), "the update listener was added");
			const oRemoveSpy = sandbox.spy(VariantManagementState.getVariantManagementDataSelector(), "removeUpdateListener");
			const oClearRuntimeSteadySpy = sandbox.spy(VariantManagementState, "clearRuntimeSteadyObjects");
			const oClearCurrentVariantSpy = sandbox.spy(VariantManagementState, "resetCurrentVariantReference");
			this.oModel.destroy();
			assert.strictEqual(
				FlexObjectState.getLiveDependencyMap(sReference).mChanges.someControlId.length,
				0,
				"then the persisted UI change of the current variant is removed from the dependency map"
			);
			assert.ok(oClearRuntimeSteadySpy.calledOnce, "then the runtime-steady objects for this VM were cleared");
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

			const oVMData = this.oModel.getData();
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
			const oVMData = this.oModel.getData();
			this.oVMControl.setEditable(true);
			this.oModel.setModelPropertiesForControl(false);
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
			this.oModel.setModelPropertiesForControl(true);
			assert.notOk(oVMData.variantsEditable, "the parameter variantsEditable is set to false for bDesignTimeMode = true");
			this.oModel.setModelPropertiesForControl(false);
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
			const oVMData = this.oModel.getData();
			this.oVMControl.setEditable(true);
			this.oModel.setModelPropertiesForControl(false);
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
			this.oModel.setModelPropertiesForControl(false);
			assert.strictEqual(oVMData.variants[3].rename, false, "a public view editor cannot renamed another users PUBLIC variant");
			assert.strictEqual(oVMData.variants[3].remove, false, "a public view editor cannot removed another users PUBLIC variant");
			assert.strictEqual(oVMData.variants[3].change, false, "a public view editor cannot changed another users PUBLIC variant");

			bIsKeyUser = true;
			bIsPublicFlVariantEnabled = false;
			this.oModel.setModelPropertiesForControl(false);
			assert.strictEqual(oVMData.variants[3].rename, true, "a key user can renamed another users PUBLIC variant");
			assert.strictEqual(oVMData.variants[3].remove, true, "a key user can removed another users PUBLIC variant");
			assert.strictEqual(oVMData.variants[3].change, true, "a key user can changed another users PUBLIC variant");

			bIsKeyUser = false;
			sUser = "Me";
			this.oModel.setModelPropertiesForControl(false);
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
			this.oModel.setModelPropertiesForControl(false);
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
			this.oModel.setModelPropertiesForControl(false);
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
			this.oModel.setModelPropertiesForControl(false);
			assert.strictEqual(
				this.oModel.getData().variantsEditable,
				false,
				"the parameter variantsEditable is initially false"
			);
			this.oModel.setModelPropertiesForControl(true);
			assert.strictEqual(
				this.oModel.getData().variantsEditable,
				false,
				"the parameter variantsEditable stays false for bDesignTimeMode = true"
			);
			this.oModel.setModelPropertiesForControl(false);
			assert.strictEqual(
				this.oModel.getData().variantsEditable,
				false,
				"the parameter variantsEditable stays false for bDesignTimeMode = false"
			);
		});

		QUnit.test("when calling 'setModelPropertiesForControl' with updateVariantInURL = true", async function(assert) {
			this.oVMControl.setEditable(true);
			this.oVMControl.setUpdateVariantInURL(true);
			this.oModel.getData().updateVariantInURL = true;
			this.oModel.getData().currentVariant = "variant0";

			await this.oModel.initializeURLHandler();
			const oURLHandler = this.oModel._getURLHandler();
			sandbox.stub(oURLHandler, "clearAllVariantURLParameters").resolves();
			sandbox.stub(oURLHandler, "update").resolves();
			sandbox.stub(oURLHandler, "getStoredHashParams").returns(["currentHash1", "currentHash2"]);

			// First call: undefined -> false - no mode change, no URL operations
			this.oModel.setModelPropertiesForControl(false);
			assert.strictEqual(oURLHandler.clearAllVariantURLParameters.callCount, 0, "then clearAllVariantURLParameters not called");
			assert.strictEqual(oURLHandler.update.callCount, 0, "then URLHandler.update() not called");
			assert.strictEqual(oURLHandler.getStoredHashParams.callCount, 0, "then URLHandler.getStoredHashParams() not called");
			assert.strictEqual(this.oModel._bDesignTimeMode, false, "the model's _bDesignTimeMode property is set to false");

			// Second call: false -> true - mode change to design time, clears URL parameters
			this.oModel.setModelPropertiesForControl(true);
			assert.strictEqual(
				oURLHandler.clearAllVariantURLParameters.callCount,
				1,
				"then clearAllVariantURLParameters called once"
			);
			assert.strictEqual(oURLHandler.getStoredHashParams.callCount, 0, "then URLHandler.getStoredHashParams() still not called");
			assert.strictEqual(this.oModel._bDesignTimeMode, true, "the model's _bDesignTimeMode property is set to true");

			// Third call: true -> false - mode change from design time, no URL restore (URL is the source of truth)
			this.oModel.setModelPropertiesForControl(false);
			assert.strictEqual(oURLHandler.getStoredHashParams.callCount, 0, "then URLHandler.getStoredHashParams() still not called");
			assert.strictEqual(oURLHandler.update.callCount, 0, "then URLHandler.update() still not called");
			assert.strictEqual(this.oModel._bDesignTimeMode, false, "the model's _bDesignTimeMode property is set to false");
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
			QUnit.test(`when calling 'addVariantChanges' for ${oTestParams.inputParams.changeType} to add a change`, function(assert) {
				oTestParams.inputParams.appComponent = this.oComponent;
				const oAddDirtyFlexObjectsStub = sandbox.stub(FlexObjectManager, "addDirtyFlexObjects");
				if (!oTestParams.inputParams.adaptationId) {
					sandbox.stub(ContextBasedAdaptationsAPI, "hasAdaptationsModel").returns(true);
					sandbox.stub(ContextBasedAdaptationsAPI, "getDisplayedAdaptationId").returns("id_12345");
				}
				const oVariantInstance = createVariant(this.oModel.oData.variants[2]);
				// Stub VariantManagementState.getVariant since VariantManager.setVariantProperties uses it
				sandbox.stub(VariantManagementState, "getVariant").returns({ instance: oVariantInstance });

				const oChange = VariantManager.addVariantChanges({
					variantManagementReference: sVMReference,
					appComponent: this.oComponent,
					changeContents: [oTestParams.inputParams],
					generatorName: RtaQunitUtils.GENERATOR_NAME
				})[0];
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
			const mPropertyBag = {
				variantManagementReference: sVMReference,
				appComponent: this.oComponent,
				change: fnChangeStub()
			};
			const oDeleteFlexObjectsStub = sandbox.stub(FlexObjectManager, "deleteFlexObjects");
			VariantManager.deleteVariantChange(mPropertyBag);
			assert.ok(oDeleteFlexObjectsStub.calledWith({
				reference: sReference,
				flexObjects: [fnChangeStub()],
				componentId: "MyComponent"
			}), "then deleteFlexObjects called with the passed change");
		});

		QUnit.test("when calling 'getVariant' without a variant management reference", function(assert) {
			assert.deepEqual(
				this.oModel.getVariant("variant0"),
				this.oModel.oData.variants[1],
				"the default Variant is returned"
			);
		});
	});

	// In this module, the model is not set on the app component by default as some of the tests
	// simulate model context changes before the VM control is initialized (i.e. before setModel is called).
	// The model itself is also not constructed in beforeEach so that tests can stage their FlexState
	// (e.g. via stubFlexObjectsSelector) before the constructor reads the data selector.
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
			sandbox.stub(this.oVariantManagement, "_createOwnModel");
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
			sandbox.stub(Utils, "getUshellContainer").returns(true);
			sandbox.stub(Utils, "getUShellService").resolves();
			sandbox.stub(FlexObjectManager, "saveFlexObjects").resolves();
			sandbox.stub(VariantManagementState, "getInitialUIChanges").returns([FlexObjectFactory.createUIChange({
				changeType: "foo",
				selector: { id: this.sVMReference }
			})]);
			sandbox.stub(FlexObjectState, "waitForFlexObjectsToBeApplied").resolves();

			this.createModel = () => {
				this.oModel = new VariantModel({}, {
					appComponent: this.oComponent,
					vmReference: this.sVMReference,
					vmControl: this.oVariantManagement
				});
				this.oInitializeURLHandlerStub = sandbox.stub(this.oModel, "initializeURLHandler");
				return this.oModel;
			};
		},
		afterEach() {
			sandbox.restore();
			this.oModel?.destroy();
			this.oComponent.destroy();
			this.oComponentContainer.destroy();
			FlexObjectManager.removeDirtyFlexObjects({ reference: sReference });
			FlexState.clearState();
		}
	}, function() {
		QUnit.test("when constructing the model and the variant management has no entry in the map yet", function(assert) {
			const oExpectedVariantArgs = {
				id: this.sVMReference,
				reference: sReference,
				user: VariantUtil.DEFAULT_AUTHOR,
				variantManagementReference: this.sVMReference,
				variantName: oResourceBundle.getText("STANDARD_VARIANT_TITLE"),
				layer: Layer.BASE
			};

			const oAddRuntimeSteadyObjectSpy = sandbox.spy(VariantManagementState, "addRuntimeSteadyObject");
			const oCreateVariantSpy = sandbox.spy(FlexObjectFactory, "createFlVariant");

			this.createModel();

			assert.strictEqual(oAddRuntimeSteadyObjectSpy.callCount, 1, "a variant was added");
			assert.strictEqual(oCreateVariantSpy.callCount, 1, "a variant was created");
			assert.deepEqual(oCreateVariantSpy.firstCall.args[0], oExpectedVariantArgs, "the standard variant was created correctly");
			assert.strictEqual(
				oAddRuntimeSteadyObjectSpy.firstCall.args[2], oCreateVariantSpy.firstCall.returnValue,
				"the created standard variant was added"
			);
		});

		QUnit.test("when calling 'setModel' of VariantManagement control", async function(assert) {
			this.createModel();
			var fnRegisterToModelSpy = sandbox.spy(this.oModel, "registerToModel");
			this.oVariantManagement.setExecuteOnSelectionForStandardDefault(true);
			sandbox.stub(this.oVariantManagement, "setShowExecuteOnSelection");
			FlexObjectState.waitForFlexObjectsToBeApplied.resetHistory();
			this.oVariantManagement.setModel(this.oModel, ControlVariantApplyAPI.getVariantModelName());

			assert.ok(
				fnRegisterToModelSpy.calledOnce,
				"then registerToModel called once, when VariantManagement control setModel is called"
			);
			assert.deepEqual(
				fnRegisterToModelSpy.firstCall.args, [],
				"then registerToModel called without arguments"
			);
			assert.ok(
				this.oVariantManagement.setShowExecuteOnSelection.calledWith(false),
				"showExecuteOnSelection is set to false"
			);
			await fnRegisterToModelSpy.firstCall.returnValue;
			await VariantManagementState.waitForVariantSwitch(sReference, this.sVMReference);
			assert.strictEqual(
				FlexObjectState.waitForFlexObjectsToBeApplied.callCount, 1,
				"the initial changes promise was added to the variant switch promise"
			);
		});

		QUnit.test("when 'registerToModel' is called and the VM reference is in nonFavoriteVariantsRemoved", async function(assert) {
			this.createModel();
			sandbox.stub(Loader, "getCachedFlexData").returns({
				parameters: { nonFavoriteVariantsRemoved: [this.sVMReference] }
			});
			const oSetCallbackStub = sandbox.stub(this.oVariantManagement, "setDynamicVariantsLoadedCallback");
			this.oVariantManagement.setModel(this.oModel, ControlVariantApplyAPI.getVariantModelName());
			await VariantManagementState.waitForVariantSwitch(sReference, this.sVMReference);

			assert.strictEqual(oSetCallbackStub.callCount, 1, "then setDynamicVariantsLoadedCallback is called");
			assert.ok(typeof oSetCallbackStub.firstCall.args[0] === "function", "then a callback function is passed");
		});

		QUnit.test("when 'registerToModel' is called and the VM reference is NOT in nonFavoriteVariantsRemoved", async function(assert) {
			this.createModel();
			sandbox.stub(Loader, "getCachedFlexData").returns({
				parameters: { nonFavoriteVariantsRemoved: ["someOtherVMReference"] }
			});
			const oSetCallbackStub = sandbox.stub(this.oVariantManagement, "setDynamicVariantsLoadedCallback");
			this.oVariantManagement.setModel(this.oModel, ControlVariantApplyAPI.getVariantModelName());
			await VariantManagementState.waitForVariantSwitch(sReference, this.sVMReference);

			assert.strictEqual(oSetCallbackStub.callCount, 0, "then setDynamicVariantsLoadedCallback is not called");
		});

		QUnit.test("when the dynamic variants loaded callback is executed", async function(assert) {
			this.createModel();
			sandbox.stub(Loader, "getCachedFlexData").returns({
				parameters: { nonFavoriteVariantsRemoved: [this.sVMReference] }
			});
			const oGetLazyVariantsLoadedStub = sandbox.stub(FlexState, "getLazyVariantsLoaded").returns([]);
			const oLoadAllVariantsStub = sandbox.stub(VariantManagerApply, "loadAllVariantsForVM").resolves();
			const oSetCallbackSpy = sandbox.spy(this.oVariantManagement, "setDynamicVariantsLoadedCallback");
			this.oVariantManagement.setModel(this.oModel, ControlVariantApplyAPI.getVariantModelName());
			await VariantManagementState.waitForVariantSwitch(sReference, this.sVMReference);

			const fnCallback = oSetCallbackSpy.firstCall.args[0];
			await fnCallback();
			assert.strictEqual(oLoadAllVariantsStub.callCount, 1, "then loadAllVariantsForVM is called");
			assert.deepEqual(oLoadAllVariantsStub.firstCall.args[0], {
				reference: sReference,
				componentId: this.oComponent.getId(),
				vmReference: this.sVMReference
			}, "then loadAllVariantsForVM is called with the correct parameters");

			oGetLazyVariantsLoadedStub.returns([this.sVMReference]);
			await fnCallback();
			assert.strictEqual(oLoadAllVariantsStub.callCount, 1, "then loadAllVariantsForVM is not called again");
		});

		QUnit.test("when creating a new variant based on a faked standard variant, and the Model gets destroyed", function(assert) {
			this.createModel();
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

			this.createModel();

			assert.strictEqual(this.oModel.oData.variants.length, 2, "then the fake and the new variant are available");
		});

		QUnit.test("when creating and saving a new UIChange based on a faked standard variant, and the Model gets destroyed", function(assert) {
			this.createModel();
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

			this.createModel();

			assert.strictEqual(this.oModel.oData.variants.length, 1, "then the fake variant is available");
			assert.strictEqual(this.oModel.oData.variants[0].controlChanges.length, 1, "then the UIChange is available");
		});

		QUnit.test("when creating a new UIChange based on a faked standard variant, and the Model gets destroyed", async function(assert) {
			this.createModel();
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

			this.createModel();

			const oVariantsData = this.oModel.oData.variants;
			assert.strictEqual(oVariantsData.length, 1, "then the fake variant is available");
			assert.strictEqual(oVariantsData[0].controlChanges.length, 0, "then the change is not available");
		});

		QUnit.test("when destroy() is called, runtime-steady objects of other VMs are preserved", function(assert) {
			this.createModel();
			this.oVariantManagement.setModel(this.oModel, ControlVariantApplyAPI.getVariantModelName());
			const sOtherVMReference = "someOtherVMReference";
			const oOtherStandardVariant = FlexObjectFactory.createFlVariant({
				id: sOtherVMReference,
				variantManagementReference: sOtherVMReference,
				variantName: "Standard",
				user: "SAP",
				layer: Layer.BASE,
				reference: sReference
			});
			FlexState.addRuntimeSteadyObject(sReference, this.oComponent.getId(), oOtherStandardVariant);

			this.oModel.destroy();

			const aRemainingObjects = FlexState.getFlexObjectsDataSelector().get({ reference: sReference });
			assert.ok(
				aRemainingObjects.some((oObj) => oObj.getId() === sOtherVMReference),
				"then the runtime-steady object of the other VM is still present"
			);
		});

		QUnit.test("when variant management controls are initialized with with 'updateVariantInURL' property set and default (false)", function(assert) {
			this.createModel();
			this.oInitializeURLHandlerStub.resetHistory();
			this.oVariantManagement.setModel(this.oModel, ControlVariantApplyAPI.getVariantModelName());
			assert.strictEqual(
				this.oInitializeURLHandlerStub.callCount, 1,
				"then initializeURLHandler was called once since the VM control has updateVariantInURL set to true"
			);
		});

		QUnit.test("when 'updateVariantInURL' is set to true at runtime via the control setter", function(assert) {
			this.createModel();
			this.oVariantManagement.setUpdateVariantInURL(false);
			this.oVariantManagement.setModel(this.oModel, ControlVariantApplyAPI.getVariantModelName());
			this.oInitializeURLHandlerStub.resetHistory();

			this.oVariantManagement.setUpdateVariantInURL(true);
			assert.strictEqual(
				this.oInitializeURLHandlerStub.callCount, 1,
				"then initializeURLHandler was called when updateVariantInURL was set to true at runtime"
			);
		});

		QUnit.test("when 'save' event event is triggered from a variant management control for a new variant", function(assert) {
			this.createModel();
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
			this.createModel();
			this.oVariantManagement.setModel(this.oModel, ControlVariantApplyAPI.getVariantModelName());
			return this.oVariantManagement.waitForInit().then(function() {
				assert.strictEqual(
					this.oModel.getData().variants[1].title,
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
			this.createModel();
			this.oVariantManagement.setModel(this.oModel, ControlVariantApplyAPI.getVariantModelName());
			return this.oVariantManagement.waitForInit().then(function() {
				assert.strictEqual(
					this.oModel.getData().variants[1].title,
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
			this.createModel();
			this.oVariantManagement.setModel(this.oModel, ControlVariantApplyAPI.getVariantModelName());
			this.oVariantManagement.attachModelContextChange(function() {
				assert.strictEqual(
					this.oModel.getData().variants[1].title,
					oResourceBundle.getText("VARIANT_MANAGEMENT_AUTHOR"),
					"when the model is set, the text gets resolved"
				);
				fnDone();
			}.bind(this));
			return this.oVariantManagement.waitForInit().then(function() {
				assert.strictEqual(
					this.oModel.getData().variants[1].title,
					"{anotherResourceModel>VARIANT_MANAGEMENT_AUTHOR}",
					"before the model is set, the string is not resolved yet"
				);
				this.oVariantManagement.setModel(oResourceModel, "anotherResourceModel");
			}.bind(this));
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});