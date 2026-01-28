
/* global QUnit */

sap.ui.define([
	"sap/ui/base/Event",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/core/Control",
	"sap/ui/fl/apply/_internal/changes/Applier",
	"sap/ui/fl/apply/_internal/changes/Reverter",
	"sap/ui/fl/apply/_internal/flexObjects/FlexObjectFactory",
	"sap/ui/fl/apply/_internal/flexState/changes/DependencyHandler",
	"sap/ui/fl/apply/_internal/flexState/controlVariants/VariantManagementState",
	"sap/ui/fl/apply/_internal/flexState/controlVariants/VariantManagerApply",
	"sap/ui/fl/apply/_internal/flexState/FlexObjectState",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/apply/api/ControlVariantApplyAPI",
	"sap/ui/fl/initial/_internal/Settings",
	"sap/ui/fl/variants/VariantManagement",
	"sap/ui/fl/variants/VariantManager",
	"sap/ui/fl/variants/VariantModel",
	"sap/ui/fl/write/_internal/controlVariants/ControlVariantWriteUtils",
	"sap/ui/fl/write/_internal/flexState/changes/UIChangeManager",
	"sap/ui/fl/write/_internal/flexState/FlexObjectManager",
	"sap/ui/fl/Layer",
	"sap/ui/fl/Utils",
	"sap/ui/thirdparty/sinon-4",
	"test-resources/sap/ui/fl/qunit/FlQUnitUtils",
	"test-resources/sap/ui/rta/qunit/RtaQunitUtils"
], function(
	BaseEvent,
	JsControlTreeModifier,
	Control,
	Applier,
	Reverter,
	FlexObjectFactory,
	DependencyHandler,
	VariantManagementState,
	VariantManagerApply,
	FlexObjectState,
	FlexState,
	ControlVariantApplyAPI,
	Settings,
	VariantManagement,
	VariantManager,
	VariantModel,
	ControlVariantWriteUtils,
	UIChangeManager,
	FlexObjectManager,
	Layer,
	Utils,
	sinon,
	FlQUnitUtils,
	RtaQunitUtils
) {
	"use strict";
	const sandbox = sinon.createSandbox();
	const sVMReference = "variantManagementId1";
	const sReference = "myFlexReference";
	const oComponent = RtaQunitUtils.createAndStubAppComponent(sinon, sReference);

	function createChanges(sReference, sLayer, sVariantReference) {
		var oChange1 = FlexObjectFactory.createFromFileContent({
			fileName: "change1",
			layer: sLayer || Layer.USER, // Changes are on user layer until they are saved to a variant
			selector: {
				id: "abc123"
			},
			variantReference: sVariantReference || "variant1"
		});
		var oChange2 = FlexObjectFactory.createFromFileContent({
			fileName: "change2",
			layer: sLayer || Layer.USER,
			selector: {
				id: "abc123"
			},
			variantReference: sVariantReference || "variant1"
		});
		var oChange3 = FlexObjectFactory.createFromFileContent({
			fileName: "change3",
			layer: sLayer || Layer.USER,
			selector: {
				id: "abc123"
			},
			variantReference: sVariantReference || "variant1"
		});
		return FlexObjectManager.addDirtyFlexObjects(sReference, sReference, [oChange1, oChange2, oChange3]);
	}

	function createVariant(mVariantProperties) {
		return FlexObjectFactory.createFlVariant({
			id: mVariantProperties.fileName || mVariantProperties.key,
			reference: mVariantProperties.reference || sReference,
			layer: mVariantProperties.layer,
			user: mVariantProperties.author,
			variantReference: mVariantProperties.variantReference,
			variantManagementReference: mVariantProperties.variantManagementReference || sVMReference,
			variantName: mVariantProperties.title,
			contexts: mVariantProperties.contexts
		});
	}

	QUnit.module("VariantManager", {
		async beforeEach() {
			this.oSettingsStub = sandbox.stub(Settings, "getInstanceOrUndef").callsFake(() => {
				const oSettings = this.oSettingsStub.wrappedMethod();
				return oSettings || { getUser: () => "test user" };
			});
			FlQUnitUtils.stubFlexObjectsSelector(sandbox, [
				createVariant({
					author: ControlVariantWriteUtils.DEFAULT_AUTHOR,
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
				})
			]);

			this.oVMControl = new VariantManagement(sVMReference);
			this.oModel = new VariantModel({}, {
				appComponent: oComponent
			});
			oComponent.setModel(this.oModel, ControlVariantApplyAPI.getVariantModelName());
			await FlexState.initialize({
				reference: sReference,
				componentId: sReference
			});
			return this.oModel.initialize();
		},
		async afterEach() {
			sandbox.restore();
			this.oVMControl.destroy();
			this.oModel.destroy();
			await this.oModel.oDestroyPromise.promise;
			FlexState.clearState();
			FlexState.clearRuntimeSteadyObjects(sReference, sReference);
		}
	}, function() {
		QUnit.test("When eraseDirtyChangesOnVariant is called", async function(assert) {
			const aDummyChanges = [{
				getId() { return "change1"; },
				getSavedToVariant() { return false; }
			}, {
				getId() { return "change2"; },
				getSavedToVariant() { return false; }
			}];

			const oRevertMultipleChangesStub = sandbox.stub(Reverter, "revertMultipleChanges");
			const oGetControlChangesForVariantStub = sandbox.stub(
				VariantManagementState,
				"getControlChangesForVariant"
			).returns(aDummyChanges);
			sandbox.stub(FlexObjectState, "getDirtyFlexObjects").returns(aDummyChanges);
			sandbox.stub(FlexObjectManager, "deleteFlexObjects");

			const aChanges = await VariantManager.eraseDirtyChangesOnVariant("vm1", "v1", oComponent);
			assert.deepEqual(aChanges, aDummyChanges, "then the correct changes are returned");
			assert.ok(oRevertMultipleChangesStub.calledOnce, "then the changes were reverted");
			assert.ok(oGetControlChangesForVariantStub.calledOnce, "then are changes are retrieved for the variant");
		});

		QUnit.test("When addAndApplyChangesOnVariant is called", async function(assert) {
			const oControl = new Control("control");
			var aDummyChanges = [
				{
					fileName: "c1",
					getSelector() { return { id: "control" }; }
				},
				{
					fileName: "c2",
					getSelector() { return { id: "control" }; }
				}
			];
			const oAddChangesStub = sandbox.stub(UIChangeManager, "addDirtyChanges").returnsArg(1);
			var oApplyChangeStub = sandbox.stub(Applier, "applyChangeOnControl").resolves({ success: true });
			sandbox.stub(JsControlTreeModifier, "getControlIdBySelector");

			await VariantManager.addAndApplyChangesOnVariant(aDummyChanges, oComponent);
			assert.strictEqual(oAddChangesStub.lastCall.args[1].length, 2, "then every change in the array was added");
			assert.ok(oApplyChangeStub.calledTwice, "then every change in the array was applied");
			oControl.destroy();
		});

		QUnit.test("when calling 'removeVariant' with a component", async function(assert) {
			const fnDeleteFlexObjectsStub = sandbox.stub(FlexObjectManager, "deleteFlexObjects");
			const oChangeInVariant = {
				fileName: "change0",
				variantReference: "variant0",
				layer: Layer.VENDOR,
				getId() {
					return this.fileName;
				},
				getVariantReference() {
					return this.variantReference;
				}
			};
			const oVariant = {
				fileName: "variant0",
				getId() {
					return this.fileName;
				}
			};
			const aDummyDirtyChanges = [oVariant].concat(oChangeInVariant);

			const fnUpdateCurrentVariantStub = sandbox.stub(VariantManagerApply, "updateCurrentVariant").resolves();
			sandbox.stub(FlexObjectState, "getDirtyFlexObjects").returns(aDummyDirtyChanges);

			assert.strictEqual(this.oModel.oData[sVMReference].variants.length, 5, "then initial length is 5");
			const mPropertyBag = {
				variant: oVariant,
				sourceVariantReference: "sourceVariant",
				appComponent: oComponent,
				vmControl: this.oVMControl
			};
			await VariantManager.removeVariant(mPropertyBag);
			assert.deepEqual(fnUpdateCurrentVariantStub.getCall(0).args[0], {
				newVariantReference: mPropertyBag.sourceVariantReference,
				appComponent: mPropertyBag.appComponent,
				vmControl: this.oVMControl
			}, "then updateCurrentVariant() called with the correct parameters");
			assert.ok(fnDeleteFlexObjectsStub.calledOnce, "then FlexObjectManager.deleteFlexObjects called once");
			assert.strictEqual(fnDeleteFlexObjectsStub.lastCall.args[0].flexObjects.length, 2, "with both changes");
			assert.strictEqual(
				fnDeleteFlexObjectsStub.lastCall.args[0].flexObjects[0],
				oVariant,
				"then FlexObjectManager.deleteFlexObjects called including variant"
			);
			assert.strictEqual(
				fnDeleteFlexObjectsStub.lastCall.args[0].flexObjects[1],
				oChangeInVariant,
				"then FlexObjectManager.deleteFlexObjects called including change in variant"
			);
		});

		QUnit.test("when calling 'handleManageEvent' without parameters", async function(assert) {
			const oSaveStub = sandbox.stub(FlexObjectManager, "saveFlexObjects");
			const oManageEvent = new BaseEvent("manage", this.oVMControl, { });
			await VariantManager.handleManageEvent(oManageEvent, this.oVMControl);
			assert.strictEqual(oSaveStub.callCount, 0, "then no changes were saved");
		});

		QUnit.test("when calling 'handleManageEvent' deleting a USER and a PUBLIC variants", async function(assert) {
			const sPublicVariantKey = this.oModel.getData()[sVMReference].variants[2].key;
			const sUserVariantKey = this.oModel.getData()[sVMReference].variants[4].key;
			const oManageEvent = new BaseEvent("manage", this.oVMControl, {
				fav: [{
					key: sPublicVariantKey,
					visible: false
				}, {
					key: sUserVariantKey,
					visible: false
				}],
				deleted: [sPublicVariantKey, sUserVariantKey]
			});

			const oSaveStub = sandbox.stub(FlexObjectManager, "saveFlexObjects");
			await VariantManager.handleManageEvent(oManageEvent, this.oVMControl);
			assert.strictEqual(oSaveStub.callCount, 2, "then saveDirtyChanges is called twice, once for each layer");
		});

		QUnit.test("when calling 'handleManageEvent' deleting the current USER variant", async function(assert) {
			const sCurrentUserVariantKey = this.oModel.getData()[sVMReference].variants[3].key;
			const oManageEvent = new BaseEvent("manage", this.oVMControl, {
				deleted: [sCurrentUserVariantKey]
			});
			sandbox.stub(VariantManagementState, "getCurrentVariantReference").returns("variant2");
			const oSaveStub = sandbox.stub(FlexObjectManager, "saveFlexObjects");
			const oGetDefaultVariantReferenceSpy = sandbox.spy(VariantManagementState, "getDefaultVariantReference");
			const oUpdateCurrentVariantSpy = sandbox.spy(VariantManagerApply, "updateCurrentVariant");
			await VariantManager.handleManageEvent(oManageEvent, this.oVMControl);
			assert.strictEqual(oSaveStub.callCount, 1, "then saveDirtyChanges is called once");
			assert.ok(oGetDefaultVariantReferenceSpy.called, "then default variant is requested");
			assert.strictEqual(oUpdateCurrentVariantSpy.callCount, 1, "then current variant is updated");
			assert.strictEqual(oUpdateCurrentVariantSpy.lastCall.args[0].newVariantReference, "variant1", "to the default variant");
		});

		QUnit.test("when calling 'handleManageEvent' and public variant is enabled", async function(assert) {
			this.oSettingsStub.callsFake(() => {
				const oSettings = this.oSettingsStub.wrappedMethod();
				oSettings.getIsPublicFlVariantEnabled = () => true;
				return oSettings;
			});

			// variant0 CUSTOMER -> set as default => USER change
			// variant1 PUBLIC -> renamed to "test" (PUBLIC change), favorite set to true (USER change)
			// variant2 PUBLIC -> deleted => "setVisible = false" PUBLIC change
			// variant3 USER -> previously invisible, now deleted => USER deletion
			const sNewDefaultVariantKey = this.oModel.getData()[sVMReference].variants[1].key; // variant0
			const sPublicVariantKey = this.oModel.getData()[sVMReference].variants[2].key; // variant1
			const sPublicVariantKey2 = this.oModel.getData()[sVMReference].variants[3].key; // variant2
			const sUserVariantKey = this.oModel.getData()[sVMReference].variants[4].key; // variant3
			const oManageEvent = new BaseEvent("manage", this.oVMControl, {
				renamed: [{
					key: sPublicVariantKey,
					name: "test"
				}],
				fav: [{
					key: sPublicVariantKey,
					visible: true
				}],
				deleted: [sPublicVariantKey2, sUserVariantKey],
				def: sNewDefaultVariantKey
			});

			const oSaveStub = sandbox.stub(FlexObjectManager, "saveFlexObjects");
			const oDeleteStub = sandbox.stub(FlexObjectManager, "deleteFlexObjects");

			await VariantManager.handleManageEvent(oManageEvent, this.oVMControl);
			const aPublicChanges = oSaveStub.firstCall.args[0].flexObjects;
			const aUserChanges = oSaveStub.lastCall.args[0].flexObjects;
			const aDeletedFlexObjects = oDeleteStub.firstCall.args[0].flexObjects;

			assert.strictEqual(aUserChanges.length, 2, "then 2 changes are saved for USER layer");
			assert.strictEqual(aPublicChanges.length, 2, "then 2 changes are saved for PUBLIC layer");
			assert.strictEqual(
				aDeletedFlexObjects.length,
				2,
				"then the USER layer variant (variant3) and the 'setVisible' change for the variant are deleted"
			);

			assert.strictEqual(aPublicChanges[0].getChangeType(), "setTitle", "then the first PUBLIC change is of type 'setTitle'");
			assert.strictEqual(aPublicChanges[0].getTexts().title.value, "test", "then the variant is renamed correctly");
			assert.strictEqual(aPublicChanges[1].getChangeType(), "setVisible", "then the second PUBLIC change is of type 'setVisible'");
			assert.strictEqual(aPublicChanges[1].getContent().visible, false, "then the visible property is set to false correctly");

			assert.strictEqual(aUserChanges[0].getChangeType(), "setFavorite", "then the first USER change is of type 'setFavorite'");
			assert.strictEqual(aUserChanges[0].getContent().favorite, true, "then the favorite property is set to true correctly");
			assert.strictEqual(aUserChanges[1].getChangeType(), "setDefault", "then the second USER change is of type 'setDefault'");
			assert.strictEqual(
				aUserChanges[1].getContent().defaultVariant, sNewDefaultVariantKey, "then the default variant is set correctly"
			);

			assert.strictEqual(aDeletedFlexObjects[0].getId(), sUserVariantKey, "then the correct USER variant is deleted");
			assert.strictEqual(aDeletedFlexObjects[1].getChangeType(), "setVisible", "then the 'setVisible' change is deleted");
		});

		QUnit.test("when the VM Control fires the manage event in Personalization mode with dirty VM changes and UI Changes", function(assert) {
			const fnDone = assert.async();
			const oDeleteVariantSpy = sandbox.stub(ControlVariantWriteUtils, "deleteVariant");

			const sVariantKey = VariantManagementState.getAllVariants(sVMReference)[1].key;
			const oManageParameters = {
				renamed: [{
					key: sVariantKey,
					name: "test"
				}],
				fav: [{
					key: sVariantKey,
					visible: false
				}],
				deleted: [sVariantKey],
				def: sVariantKey
			};

			const oUpdateVariantSpy = sandbox.spy(VariantManagerApply, "updateCurrentVariant");
			const oSaveStub = sandbox.stub(FlexObjectManager, "saveFlexObjects");
			const oAddVariantChangesSpy = sandbox.stub(VariantManager, "handleManageEvent").callsFake(async (...aArgs) => {
				await oAddVariantChangesSpy.wrappedMethod.apply(this, aArgs);

				assert.strictEqual(oUpdateVariantSpy.callCount, 0, "the variant was not switched");
				const oPassedPropertyBag = oSaveStub.lastCall.args[0];
				assert.strictEqual(oPassedPropertyBag.selector, oComponent, "the app component was passed");
				// Changes must be passed in this case to avoid that UI changes are read from the FlexState and persisted as well
				assert.deepEqual(
					oPassedPropertyBag.flexObjects.length,
					4,
					"an array with 4 changes was passed instead of taking the changes directly from the FlexState"
				);
				assert.ok(oDeleteVariantSpy.notCalled, "for the CUSTOMER layer variant, deleteVariant is not called");
				fnDone();
			});

			this.oVMControl.fireManage(oManageParameters, { variantManagementReference: sVMReference });
		});

		QUnit.test("when the VM Control fires the manage event in Personalization mode with deleting the current variant", function(assert) {
			const fnDone = assert.async();

			const oManageParameters = {
				deleted: [VariantManagementState.getCurrentVariantReference({
					vmReference: sVMReference,
					reference: sReference
				})]
			};

			const oUpdateVariantStub = sandbox.stub(VariantManagerApply, "updateCurrentVariant");
			const oAddVariantChangesSpy = sandbox.spy(VariantManager, "addVariantChanges");
			sandbox.stub(FlexObjectManager, "saveFlexObjects").callsFake((oPropertyBag) => {
				assert.strictEqual(oUpdateVariantStub.callCount, 1, "the variant was switched");
				assert.deepEqual(oUpdateVariantStub.lastCall.args[0], {
					newVariantReference: "variant1",
					appComponent: oComponent,
					vmControl: this.oVMControl
				}, "the correct variant was switched to");
				assert.strictEqual(oPropertyBag.selector, oComponent, "the app component was passed");
				assert.strictEqual(oAddVariantChangesSpy.lastCall.args[1].length, 1, "1 change was added");
				assert.strictEqual(oPropertyBag.flexObjects.length, 1, "an array with 1 change was passed");
				fnDone();
			});

			this.oVMControl.fireManage(oManageParameters, { variantManagementReference: sVMReference });
		});

		QUnit.test("when the VM Control fires the manage event in Personalization mode deleting a USER and a PUBLIC layer variant", function(assert) {
			const fnDone = assert.async();
			const oDeleteVariantSpy = sandbox.spy(ControlVariantWriteUtils, "deleteVariant");

			const oManageParameters = {
				deleted: ["variant2", "variant3"]
			};

			sandbox.stub(FlexObjectManager, "saveFlexObjects").callsFake((oPropertyBag) => {
				assert.ok(
					oDeleteVariantSpy.calledWith(sReference, sReference, sVMReference, "variant3"),
					"then the variant and related objects were deleted"
				);
				assert.notOk(
					oDeleteVariantSpy.calledWith(sReference, sReference, sVMReference, "variant2"),
					"then the PUBLIC variant is only hidden and not deleted"
				);

				assert.strictEqual(
					oPropertyBag.flexObjects.length,
					1,
					"then only one change is saved since the rest is dirty and directly removed from FlexState"
				);
				assert.strictEqual(
					oPropertyBag.flexObjects[0].getChangeType(),
					"setVisible",
					"then the change is of the correct type (setVisible)"
				);
				assert.strictEqual(
					oPropertyBag.flexObjects[0].getVariantId(),
					"variant2",
					"then only the PUBLIC variant is hidden via setVisible"
				);

				fnDone();
			});

			this.oVMControl.fireManage(oManageParameters, { variantManagementReference: sVMReference });
		});

		QUnit.test("when calling 'handleSaveEvent' with parameter from SaveAs button and default/execute box checked", async function(assert) {
			const aChanges = createChanges(sReference);
			const sCopyVariantName = "variant1";
			const oParameters = {
				overwrite: false,
				name: "Test",
				def: true,
				execute: true,
				contexts: {
					role: ["testRole"]
				}
			};
			const sUserName = "testUser";
			const oResponse = { response: [{ fileName: sCopyVariantName, fileType: "ctrl_variant", support: { user: sUserName } }] };

			sandbox.stub(this.oModel, "getLocalId").returns(sVMReference);
			sandbox.stub(DependencyHandler, "addChangeAndUpdateDependencies");
			const oSaveStub = sandbox.stub(FlexObjectManager, "saveFlexObjects").resolves(oResponse);
			const oDeleteFlexObjectsSpy = sandbox.spy(FlexObjectManager, "deleteFlexObjects");
			const oCreateVManagementChangeSpy = sandbox.spy(FlexObjectFactory, "createVariantManagementChange");
			const oCreateDefaultFileNameSpy = sandbox.spy(Utils, "createDefaultFileName");

			await VariantManager.handleSaveEvent(this.oVMControl, oParameters, this.oModel);
			assert.strictEqual(
				oCreateDefaultFileNameSpy.getCall(0).args[0],
				"flVariant",
				"then the file type was passed to sap.ui.fl.Utils.createDefaultFileName"
			);
			assert.strictEqual(oCreateVManagementChangeSpy.callCount, 1, "one variant management change was created");

			assert.strictEqual(oSaveStub.callCount, 1, "then dirty changes were saved");
			assert.strictEqual(
				oSaveStub.getCall(0).args[0].flexObjects.length, 5,
				"then five dirty changes were saved (new variant, 3 copied ctrl changes, setDefault change"
			);
			assert.ok(
				oDeleteFlexObjectsSpy.calledBefore(oSaveStub),
				"the changes were deleted from default variant before the copied variant was saved"
			);
			assert.ok(
				oDeleteFlexObjectsSpy.calledWith({
					reference: sReference, componentId: sReference, flexObjects: aChanges.reverse()
				}), // the last change is reverted first
				"then dirty changes from source variant were deleted from the persistence (in the right order)"
			);

			const oAffectedVariant = this.oModel.getData()[sVMReference].variants.find((oVariant) => {
				return oVariant.key === sCopyVariantName;
			});
			// Only check the support user, the author is handled independently
			assert.strictEqual(
				oAffectedVariant.instance.getSupportInformation().user,
				sUserName,
				"then 'testUser' is set as support user"
			);
		});

		QUnit.test("when calling 'handleSaveEvent' with parameter from SaveAs button and default/execute and public box checked", async function(assert) {
			const aChanges = createChanges(sReference);
			const sCopyVariantName = "variant1";
			const oParameters = {
				overwrite: false,
				"public": true,
				name: "Test",
				def: true,
				execute: true,
				contexts: {
					role: ["testRole"]
				}
			};
			const sUserName = "testUser";
			const oResponse = { response: [{ fileName: sCopyVariantName, fileType: "ctrl_variant", support: { user: sUserName } }] };

			sandbox.stub(this.oModel, "getLocalId").returns(sVMReference);
			sandbox.stub(DependencyHandler, "addChangeAndUpdateDependencies");
			const oSaveStub = sandbox.stub(FlexObjectManager, "saveFlexObjects").resolves(oResponse);
			const oDeleteFlexObjectsSpy = sandbox.spy(FlexObjectManager, "deleteFlexObjects");
			const oCreateDefaultFileNameSpy = sandbox.spy(Utils, "createDefaultFileName");
			const oCreateVManagementChangeSpy = sandbox.spy(FlexObjectFactory, "createVariantManagementChange");
			const oCreateVChangeSpy = sandbox.spy(FlexObjectFactory, "createVariantChange");

			await VariantManager.handleSaveEvent(this.oVMControl, oParameters, this.oModel);
			assert.strictEqual(
				oCreateDefaultFileNameSpy.getCall(0).args[0],
				"flVariant",
				"then the file type was passed to sap.ui.fl.Utils.createDefaultFileName"
			);
			assert.strictEqual(oCreateVManagementChangeSpy.callCount, 1, "one variant management change was created");
			assert.strictEqual(oCreateVChangeSpy.callCount, 1, "two variant changes were created");

			assert.strictEqual(
				oSaveStub.callCount, 1,
				"then dirty changes were saved"
			);
			assert.strictEqual(
				oSaveStub.getCall(0).args[0].flexObjects.length, 6,
				"then a new variant, 3 copied ctrl changes, setDefault change, setFavorite change were saved"
			);
			assert.strictEqual(
				oSaveStub.getCall(0).args[0].flexObjects[0].getChangeType(), "setFavorite",
				"then a setFavorite change was added"
			);
			assert.strictEqual(
				oSaveStub.getCall(0).args[0].flexObjects[5].getChangeType(), "setDefault",
				"the last change was 'setDefault'"
			);
			assert.ok(
				oDeleteFlexObjectsSpy.calledBefore(oSaveStub),
				"the changes were deleted from default variant before the copied variant was saved"
			);
			assert.ok(
				oDeleteFlexObjectsSpy.calledWith({
					reference: sReference, componentId: sReference, flexObjects: aChanges.reverse()
				}), // the last change is reverted first
				"then dirty changes from source variant were deleted from the persistence (in the right order)"
			);
			this.oModel.getData()[sVMReference].variants.forEach(function(oVariant) {
				if (oVariant.key === sCopyVariantName) {
					assert.strictEqual(
						oVariant.instance.getSupportInformation().user,
						sUserName,
						"then 'testUser' is set as support user"
					);
				}
			});
		});

		QUnit.test("when calling 'handleSaveEvent' with parameter from Save button", async function(assert) {
			createChanges(sReference);
			const oParameters = {
				overwrite: true,
				name: "Test"
			};

			var oSaveStub = sandbox.stub(FlexObjectManager, "saveFlexObjects").resolves({
				response: [{ fileName: "change1" }, { fileName: "change2" }, { fileName: "change3" }]
			});
			var oSetVariantPropertiesSpy = sandbox.spy(this.oModel, "setVariantProperties");

			await VariantManager.handleSaveEvent(this.oVMControl, oParameters, this.oModel);
			assert.ok(oSetVariantPropertiesSpy.notCalled, "SetVariantProperties is not called");
			assert.ok(oSaveStub.calledOnce, "SaveAll is called");
			oSaveStub.getCall(0).args[0].flexObjects.forEach((oChange) => {
				assert.equal(oChange.getLayer(), Layer.PUBLIC, "layer of dirty change is PUBLIC layer when source variant is PUBLIC");
			});
		});

		QUnit.test("when calling 'handleSaveEvent' on a USER variant with setDefault, executeOnSelect and public boxes checked", async function(assert) {
			createChanges(sReference);
			var sCopyVariantName = "variant1";
			const oParameters = {
				name: "Test",
				def: true,
				"public": true,
				execute: true
			};
			var sUserName = "testUser";
			var oResponse = { response: [
				{ fileName: "id_123_setFavorite", fileType: "setFavorite" },
				{ fileName: sCopyVariantName, fileType: "ctrl_variant", support: { user: sUserName } }
			] };

			sandbox.stub(this.oModel, "getLocalId").returns(sVMReference);
			sandbox.stub(DependencyHandler, "addChangeAndUpdateDependencies");
			sandbox.stub(FlexObjectManager, "saveFlexObjects").resolves(oResponse);

			const aChanges = await VariantManager.handleSaveEvent(this.oVMControl, oParameters, this.oModel);
			assert.strictEqual(
				aChanges[0].getChangeType(),
				"setFavorite",
				"then a 'setFavorite' change is created"
			);
			assert.strictEqual(
				aChanges[0].getLayer(),
				Layer.USER,
				"then the 'setFavorite' change is created on the USER layer"
			);
			assert.strictEqual(
				aChanges[1].getFileType(),
				"ctrl_variant",
				"then the variant is created correctly"
			);
			assert.strictEqual(
				aChanges[1].getLayer(),
				Layer.PUBLIC,
				"then the variant is created on the PUBLIC layer"
			);
		});

		QUnit.test("when calling 'handleSaveEvent' with parameter from SaveAs button and default box unchecked", async function(assert) {
			const aChanges = createChanges(sReference);
			const sCopyVariantName = "variant1";
			const oParameters = {
				overwrite: false,
				name: "Test",
				def: false,
				execute: false,
				contexts: {
					role: ["testRole"]
				}
			};
			const sUserName = "testUser";
			const oResponse = { response: [{ fileName: sCopyVariantName, fileType: "ctrl_variant", support: { user: sUserName } }] };

			sandbox.stub(this.oModel, "getLocalId").returns(sVMReference);
			sandbox.stub(DependencyHandler, "addChangeAndUpdateDependencies");
			const oSaveStub = sandbox.stub(FlexObjectManager, "saveFlexObjects").resolves(oResponse);
			const oDeleteFlexObjectsSpy = sandbox.spy(FlexObjectManager, "deleteFlexObjects");
			const oAddVariantChangeSpy = sandbox.spy(VariantManager, "addVariantChange");
			const oCreateDefaultFileNameSpy = sandbox.spy(Utils, "createDefaultFileName");

			await VariantManager.handleSaveEvent(this.oVMControl, oParameters, this.oModel);
			assert.strictEqual(
				oCreateDefaultFileNameSpy.getCall(0).args[0],
				"flVariant",
				"then the file type was passed to sap.ui.fl.Utils.createDefaultFileName"
			);

			assert.ok(oAddVariantChangeSpy.notCalled, "then no new changes were created");
			assert.strictEqual(oSaveStub.callCount, 1, "then dirty changes were saved");
			assert.strictEqual(
				oSaveStub.getCall(0).args[0].flexObjects.length,
				4,
				"then six dirty changes were saved (new variant, 3 copied ctrl changes"
			);
			assert.ok(
				oDeleteFlexObjectsSpy.calledBefore(oSaveStub),
				"the changes were deleted from default variant before the copied variant was saved"
			);
			assert.ok(
				oDeleteFlexObjectsSpy.calledWith({
					reference: sReference, componentId: sReference, flexObjects: aChanges.reverse()
				}), // the last change is reverted first
				"then dirty changes from source variant were deleted from the persistence (in the right order)"
			);
			this.oModel.getData()[sVMReference].variants.forEach(function(oVariant) {
				if (oVariant.key === sCopyVariantName) {
					assert.strictEqual(
						oVariant.instance.getSupportInformation().user,
						sUserName,
						"then 'testUser' is set as support user"
					);
				}
			});
		});

		QUnit.test("when calling 'handleSaveEvent' in Design Mode and parameters from SaveAs button and default/execute box checked", async function(assert) {
			const sNewVariantReference = "variant2";
			const aChanges = createChanges(sReference, Layer.CUSTOMER, "variant0");
			const sCopyVariantName = "variant0";
			const mParameters = {
				overwrite: false,
				name: "Key User Test Variant",
				def: true,
				execute: true,
				layer: Layer.CUSTOMER,
				newVariantReference: sNewVariantReference,
				generator: "myFancyGenerator",
				contexts: {
					role: ["testRole"]
				}
			};
			const sUserName = "testUser";
			const oResponse = { response: [
				{ fileName: "id_123_setFavorite", fileType: "setFavorite" },
				{ fileName: sCopyVariantName, fileType: "ctrl_variant", support: { user: sUserName } }
			] };

			sandbox.stub(DependencyHandler, "addChangeAndUpdateDependencies");
			const oSaveStub = sandbox.stub(FlexObjectManager, "saveFlexObjects").resolves(oResponse);
			const oDeleteFlexObjectsSpy = sandbox.spy(FlexObjectManager, "deleteFlexObjects");
			const oCreateVManagementChangeSpy = sandbox.spy(FlexObjectFactory, "createVariantManagementChange");

			// Copy a variant from the CUSTOMER layer
			VariantManagementState.setCurrentVariant({
				reference: sReference,
				vmReference: sVMReference,
				newVReference: "variant0"
			});
			sandbox.stub(this.oVMControl, "getDesignMode").returns(true);
			const aDirtyChanges = await VariantManager.handleSaveEvent(this.oVMControl, mParameters, this.oModel);
			assert.strictEqual(oCreateVManagementChangeSpy.callCount, 1, "one variant management change was created");
			assert.strictEqual(oSaveStub.callCount, 0, "then dirty changes were not saved");
			assert.strictEqual(
				aDirtyChanges.length,
				5,
				"then six dirty changes were created (new variant, 3 copied ctrl changes, setDefault change"
			);
			assert.strictEqual(aDirtyChanges[4].getChangeType(), "setDefault", "the last change was 'setDefault'");
			assert.strictEqual(aDirtyChanges[0].getLayer(), Layer.CUSTOMER, "the ctrl change has the correct layer");
			assert.ok(
				oDeleteFlexObjectsSpy.calledBefore(oSaveStub),
				"the changes were deleted from default variant before the copied variant was saved"
			);
			assert.ok(
				oDeleteFlexObjectsSpy.calledWith({
					reference: sReference, componentId: sReference, flexObjects: aChanges.reverse()
				}), // the last change is reverted first
				"then dirty changes from source variant were deleted from the persistence (in the right order)"
			);
		});

		QUnit.test("getDirtyChangesFromVariantChanges", function(assert) {
			const aControlChanges = [
				FlexObjectFactory.createUIChange({
					id: "dirtyChange",
					variantReference: "DummyVReference"
				}),
				FlexObjectFactory.createUIChange({
					id: "otherChange",
					variantReference: "DummyVReference"
				}),
				FlexObjectFactory.createUIChange({
					id: "savedToVariantChange",
					variantReference: "DummyVReference"
				})
			];
			aControlChanges[2].setSavedToVariant(true);
			sandbox.stub(FlexObjectState, "getDirtyFlexObjects").withArgs("DummyReference").returns([aControlChanges[0]]);
			const aDirtyChanges = VariantManager.getDirtyChangesFromVariantChanges(aControlChanges, "DummyReference");
			assert.strictEqual(aDirtyChanges.length, 1, "then one dirty change is returned");
			assert.strictEqual(aDirtyChanges[0].getId(), "dirtyChange", "then the dirty change is returned");
		});

		QUnit.test("updateVariantManagementMap", function(assert) {
			const sFlexReference = "myFlexReference";
			const oCheckUpdateStub = sandbox.stub();
			sandbox.stub(VariantManagementState, "getVariantManagementMap").returns({
				checkUpdate: oCheckUpdateStub
			});
			VariantManager.updateVariantManagementMap(sFlexReference);
			assert.ok(
				oCheckUpdateStub.calledWith({ reference: sFlexReference }),
				"then the invalidate method was called for the reference"
			);
		});

		QUnit.test("getControlChangesForVariant", function(assert) {
			const aControlChanges = ["change1", "change2"];
			sandbox.stub(VariantManagementState, "getVariant")
			.withArgs({
				reference: "fakeVMReference",
				vmReference: "variantMgmt1",
				vReference: "variant1"
			}).returns({ controlChanges: aControlChanges });
			const aChanges = VariantManager.getControlChangesForVariant("fakeVMReference", "variantMgmt1", "variant1");
			assert.strictEqual(aChanges, aControlChanges, "then the changes are returned");
		});

		QUnit.test("when calling 'manageVariants' in Adaptation mode with changes", function(assert) {
			const sLayer = Layer.CUSTOMER;
			const sDummyClass = "DummyClass";
			const oFakeComponentContainerPromise = { property: "fake" };

			const sVariant1Key = this.oModel.oData[sVMReference].variants[1].key;
			const oManageParameters = {
				renamed: [{
					key: sVariant1Key,
					name: "test"
				}],
				fav: [{
					key: sVariant1Key,
					visible: false
				}],
				exe: [{
					key: this.oModel.oData[sVMReference].variants[2].key,
					exe: false
				}],
				deleted: [sVariant1Key],
				contexts: [{
					key: this.oModel.oData[sVMReference].variants[3].key,
					contexts: { foo: "bar" }
				}],
				def: "variant0"
			};

			this.oVMControl._oVM.setDesignMode(true);

			const oOpenManagementDialogStub = sandbox.stub(this.oVMControl, "openManagementDialog")
			.callsFake(() => this.oVMControl.fireManage(oManageParameters));

			this.oModel.setModelPropertiesForControl(sVMReference, true, this.oVMControl);

			return VariantManager.manageVariants(this.oVMControl, sLayer, sDummyClass, oFakeComponentContainerPromise)
			.then(function({ changes: aChanges, variantsToBeDeleted: aVariantsToBeDeleted }) {
				assert.strictEqual(aChanges.length, 6, "then 6 changes were returned since changes were made in the manage dialog");
				assert.deepEqual(aChanges[0], {
					variantReference: "variant0",
					changeType: "setTitle",
					title: "test",
					originalTitle: "variant A",
					layer: Layer.CUSTOMER
				}, "the setTitle change is correct");
				assert.deepEqual(aChanges[1], {
					variantReference: "variant0",
					changeType: "setFavorite",
					favorite: false,
					originalFavorite: true,
					layer: Layer.CUSTOMER
				}, "the setFavorite change is correct");
				assert.deepEqual(aChanges[2], {
					variantReference: "variant1",
					changeType: "setExecuteOnSelect",
					executeOnSelect: false,
					originalExecuteOnSelect: true,
					layer: Layer.PUBLIC
				}, "the setExecuteOnSelect change is correct");
				assert.deepEqual(aChanges[3], {
					variantReference: "variant0",
					changeType: "setVisible",
					visible: false,
					layer: Layer.CUSTOMER
				}, "the setVisible change is correct");
				assert.deepEqual(aChanges[4], {
					variantReference: "variant2",
					changeType: "setContexts",
					contexts: { foo: "bar" },
					originalContexts: {},
					layer: Layer.CUSTOMER
				}, "the setContexts change is correct");
				assert.deepEqual(aChanges[5], {
					variantManagementReference: sVMReference,
					changeType: "setDefault",
					defaultVariant: "variant0",
					originalDefaultVariant: "variant1",
					layer: Layer.CUSTOMER
				}, "the setDefault change is correct");
				assert.ok(
					oOpenManagementDialogStub.calledWith(true, sDummyClass, oFakeComponentContainerPromise),
					"then openManagementControl is called with the right parameters"
				);
				assert.deepEqual(
					aVariantsToBeDeleted,
					["variant0"],
					"then the removed variant is returned as variant to be deleted"
				);
			});
		});
	});

	QUnit.module("handleSaveEvent - check variant references", {
		beforeEach() {
			sandbox.stub(Settings, "getInstance").resolves({});
			sandbox.stub(FlexObjectManager, "saveFlexObjects").resolves();
			sandbox.stub(VariantManagerApply, "updateCurrentVariant").resolves();
			this.oVMControl = new VariantManagement(sVMReference);
			this.oModel = new VariantModel({}, {
				appComponent: oComponent
			});
			oComponent.setModel(this.oModel, ControlVariantApplyAPI.getVariantModelName());

			this.oOriginalVariant = createVariant({
				fileName: "variant0",
				title: "foo",
				adaptationId: "id_12345",
				variantManagementReference: sVMReference,
				variantReference: sVMReference,
				contexts: {
					role: ["testRole"]
				},
				layer: Layer.CUSTOMER
			});
			FlQUnitUtils.stubFlexObjectsSelector(sandbox, [
				createVariant({
					author: ControlVariantWriteUtils.DEFAULT_AUTHOR,
					key: sVMReference,
					layer: Layer.VENDOR,
					title: "Standard",
					contexts: {}
				}),
				createVariant({
					author: "Me",
					key: "publicVariant",
					layer: Layer.PUBLIC,
					variantReference: sVMReference,
					title: "variant B"
				}),
				FlexObjectFactory.createFromFileContent({
					fileName: "change0",
					adaptationId: "id_12345",
					selector: { id: "abc123" },
					variantReference: "variant0",
					layer: Layer.CUSTOMER,
					support: {},
					reference: "test",
					packageName: "MockPackageName"
				}),
				FlexObjectFactory.createFromFileContent({
					fileName: "change1",
					selector: { id: "abc123" },
					variantReference: "variant0",
					layer: Layer.USER,
					reference: "test"
				}),
				this.oOriginalVariant
			]);

			return this.oModel.initialize();
		},
		async afterEach() {
			sandbox.restore();
			this.oVMControl.destroy();
			this.oModel.destroy();
			await this.oModel.oDestroyPromise.promise;
			FlexState.clearState();
			FlexState.clearRuntimeSteadyObjects(sReference, sReference);
		}
	}, function() {
		QUnit.test("on the same layer - CUSTOMER", async function(assert) {
			const mParameters = {
				overwrite: false,
				def: false,
				execute: true,
				name: "variant A Copy",
				layer: Layer.CUSTOMER,
				newVariantReference: "newVariant",
				generator: "myFancyGenerator",
				contexts: {
					role: ["testRole2"]
				}
			};

			VariantManagementState.setCurrentVariant({
				reference: sReference,
				vmReference: sVMReference,
				newVReference: "variant0"
			});

			const aChanges = await VariantManager.handleSaveEvent(this.oVMControl, mParameters, this.oModel);
			const oNewVariant = aChanges[0];
			assert.strictEqual(oNewVariant.getName(), "variant A Copy", "the name is correct");
			assert.strictEqual(oNewVariant.getId(), "newVariant", "the id is correct");
			assert.strictEqual(oNewVariant.getLayer(), Layer.CUSTOMER, "the layer is correct");
			assert.deepEqual(oNewVariant.getContexts(), { role: ["testRole2"] }, "the contexts object is correct");
			assert.strictEqual(oNewVariant.getVariantReference(), sVMReference, "the variantReference is correct");
			assert.strictEqual(oNewVariant.getExecuteOnSelection(), true, "apply automatically is true");
			assert.strictEqual(
				aChanges[1].getSupportInformation().sourceChangeFileName,
				"change0",
				"the sourceChangeFileName is correct"
			);
			assert.strictEqual(
				aChanges[2].getSupportInformation().sourceChangeFileName,
				"change1",
				"the sourceChangeFileName is correct"
			);
			assert.notEqual(aChanges[1].getId(), "change0", "the fileName is different from the source");
			assert.notEqual(aChanges[2].getId(), "change1", "the fileName is different from the source");
		});

		QUnit.test("from USER layer referencing a CUSTOMER layer variant", async function(assert) {
			const mParameters = {
				overwrite: false,
				def: false,
				execute: false,
				name: "variant A Copy",
				layer: Layer.USER,
				newVariantReference: "newVariant",
				generator: "myFancyGenerator",
				contexts: {
					role: ["testRole2"]
				}
			};

			VariantManagementState.setCurrentVariant({
				reference: sReference,
				vmReference: sVMReference,
				newVReference: "variant0"
			});

			const oFlexObjectFactorySpy = sandbox.spy(FlexObjectFactory, "createFromFileContent");

			const aChanges = await VariantManager.handleSaveEvent(this.oVMControl, mParameters, this.oModel);
			const oNewVariant = aChanges[0];
			assert.notOk(oFlexObjectFactorySpy.getCall(0).args[0].adaptationId, "the properties for the change don't contain adaptationId");
			assert.strictEqual(oNewVariant.getName(), "variant A Copy", "the name is correct");
			assert.strictEqual(oNewVariant.getId(), "newVariant", "the id is correct");
			assert.strictEqual(oNewVariant.getLayer(), Layer.USER, "the layer is correct");
			assert.deepEqual(oNewVariant.getContexts(), { role: ["testRole2"] }, "the contexts object is correct");
			assert.strictEqual(oNewVariant.getVariantReference(), "variant0", "the variantReference is correct");
			assert.strictEqual(oNewVariant.getExecuteOnSelection(), false, "apply automatically is false");
			assert.strictEqual(aChanges[1].getVariantReference(), "newVariant", "the control change variantReference is correct");
			assert.strictEqual(
				aChanges[1].getSupportInformation().sourceChangeFileName,
				"change1",
				"the sourceChangeFileName is correct"
			);
		});

		QUnit.test("from PUBLIC layer referencing a USER layer variant", async function(assert) {
			const mParameters = {
				overwrite: false,
				def: false,
				execute: false,
				name: "variant A Copy",
				layer: Layer.PUBLIC,
				newVariantReference: "newVariant",
				generator: "myFancyGenerator",
				contexts: {
					role: ["testRole2"]
				}
			};

			this.oOriginalVariant.setLayer(Layer.USER);
			VariantManagementState.setCurrentVariant({
				reference: sReference,
				vmReference: sVMReference,
				newVReference: "variant0"
			});

			const aChanges = await VariantManager.handleSaveEvent(this.oVMControl, mParameters, this.oModel);
			assert.strictEqual(aChanges[0].getChangeType(), "setFavorite", "the first change is setFavorite");
			assert.strictEqual(aChanges[0].getLayer(), Layer.USER, "the layer of the setFavorite change is USER");
			const oNewVariant = aChanges[1];
			assert.strictEqual(oNewVariant.getName(), "variant A Copy", "the name is correct");
			assert.strictEqual(oNewVariant.getId(), "newVariant", "the id is correct");
			assert.strictEqual(oNewVariant.getLayer(), Layer.PUBLIC, "the layer is correct");
			assert.deepEqual(oNewVariant.getContexts(), { role: ["testRole2"] }, "the contexts object is correct");
			assert.strictEqual(oNewVariant.getVariantReference(), sVMReference, "the variantReference is correct");
			assert.strictEqual(aChanges[2].getVariantReference(), "newVariant", "the control change variantReference is correct");
			assert.strictEqual(
				aChanges[2].getSupportInformation().sourceChangeFileName,
				"change1",
				"the sourceChangeFileName is correct"
			);
			assert.strictEqual(aChanges[2].getLayer(), Layer.PUBLIC, "the layer of the control change is correct");
		});

		QUnit.test("from USER layer referencing a PUBLIC layer variant", async function(assert) {
			const mParameters = {
				overwrite: false,
				def: false,
				execute: false,
				name: "variant A Copy",
				layer: Layer.USER,
				newVariantReference: "newVariant",
				generator: "myFancyGenerator",
				contexts: {
					role: ["testRole2"]
				}
			};

			this.oOriginalVariant.setLayer(Layer.PUBLIC);
			VariantManagementState.setCurrentVariant({
				reference: sReference,
				vmReference: sVMReference,
				newVReference: "variant0"
			});

			const aChanges = await VariantManager.handleSaveEvent(this.oVMControl, mParameters, this.oModel);
			const oNewVariant = aChanges[0];
			assert.strictEqual(oNewVariant.getName(), "variant A Copy", "the name is correct");
			assert.strictEqual(oNewVariant.getId(), "newVariant", "the id is correct");
			assert.strictEqual(oNewVariant.getLayer(), Layer.USER, "the layer is correct");
			assert.deepEqual(oNewVariant.getContexts(), { role: ["testRole2"] }, "the contexts object is correct");
			assert.strictEqual(oNewVariant.getVariantReference(), "variant0", "the variantReference is correct");
			assert.strictEqual(
				aChanges[1].getSupportInformation().sourceChangeFileName,
				"change1",
				"the control change is correct"
			);
			assert.strictEqual(aChanges[1].getVariantReference(), "newVariant", "the variantReference of the control change is correct");
		});

		QUnit.test("from PUBLIC layer referencing a USER layer variant, that in turn references a PUBLIC layer variant", async function(assert) {
			const mParameters = {
				overwrite: false,
				def: false,
				execute: false,
				name: "variant A Copy",
				layer: Layer.PUBLIC,
				newVariantReference: "newVariant",
				generator: "myFancyGenerator",
				contexts: {
					role: ["testRole2"]
				}
			};

			this.oOriginalVariant.setLayer(Layer.USER);
			this.oOriginalVariant.setVariantReference("publicVariant");
			VariantManagementState.setCurrentVariant({
				reference: sReference,
				vmReference: sVMReference,
				newVReference: "variant0"
			});

			const aChanges = await VariantManager.handleSaveEvent(this.oVMControl, mParameters, this.oModel);
			assert.strictEqual(aChanges[0].getChangeType(), "setFavorite", "the first change is setFavorite");
			assert.strictEqual(aChanges[0].getLayer(), Layer.USER, "the layer of the setFavorite change is USER");
			const oNewVariant = aChanges[1];
			assert.strictEqual(oNewVariant.getName(), "variant A Copy", "the name is correct");
			assert.strictEqual(oNewVariant.getId(), "newVariant", "the id is correct");
			assert.strictEqual(oNewVariant.getLayer(), Layer.PUBLIC, "the layer is correct");
			assert.deepEqual(oNewVariant.getContexts(), { role: ["testRole2"] }, "the contexts object is correct");
			assert.strictEqual(
				oNewVariant.getVariantReference(),
				sVMReference,
				"the variantReference is correct"
			);
			assert.strictEqual(
				aChanges[2].getSupportInformation().sourceChangeFileName,
				"change1",
				"the control change is correct"
			);
			assert.strictEqual(aChanges[2].getVariantReference(), "newVariant", "the variantReference of the control change is correct");
			assert.strictEqual(aChanges[2].getLayer(), Layer.PUBLIC, "the layer of the control change is correct");
		});
	});

	QUnit.done(function() {
		oComponent._restoreGetAppComponentStub();
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
