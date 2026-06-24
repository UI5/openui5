/* global QUnit */

sap.ui.define([
	"sap/m/App",
	"sap/ui/core/Element",
	"sap/ui/core/mvc/XMLView",
	"sap/ui/core/ComponentContainer",
	"sap/ui/fl/apply/_internal/controlVariants/URLHandler",
	"sap/ui/fl/apply/_internal/flexObjects/FlexObjectFactory",
	"sap/ui/fl/apply/_internal/flexState/controlVariants/VariantManagementState",
	"sap/ui/fl/apply/_internal/flexState/controlVariants/VariantManagerApply",
	"sap/ui/fl/apply/_internal/flexState/FlexObjectState",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/initial/_internal/Loader",
	"sap/ui/fl/initial/_internal/Storage",
	"sap/ui/fl/initial/_internal/StorageUtils",
	"sap/ui/fl/write/_internal/flexState/FlexObjectManager",
	"sap/ui/fl/Layer",
	"sap/ui/thirdparty/sinon-4",
	"test-resources/sap/ui/rta/qunit/RtaQunitUtils"
], (
	App,
	Element,
	XMLView,
	ComponentContainer,
	URLHandler,
	FlexObjectFactory,
	VariantManagementState,
	VariantManagerApply,
	FlexObjectState,
	FlexState,
	Loader,
	Storage,
	StorageUtils,
	FlexObjectManager,
	Layer,
	sinon,
	RtaQunitUtils
) => {
	"use strict";

	const sandbox = sinon.createSandbox();
	const sReference = "ControlVariantLazyLoadingTest";

	function createLazyLoadResponse(aVariantDefinitions, aVariantChanges, aVariantManagementChanges) {
		const oResponse = StorageUtils.getEmptyFlexDataResponse();
		oResponse.variants = aVariantDefinitions;
		oResponse.variantChanges = aVariantChanges || [];
		oResponse.variantManagementChanges = aVariantManagementChanges || [];
		return oResponse;
	}

	function createVariantContentResponse(aVariants, aChanges) {
		const oResponse = StorageUtils.getEmptyFlexDataResponse();
		oResponse.variants = aVariants;
		oResponse.variantDependentControlChanges = aChanges;
		return oResponse;
	}

	QUnit.module("Given an app with variant lazy loading...", {
		async beforeEach() {
			const oApp = new App("lazyLoadTestApp");
			const oView = await XMLView.create({
				id: "lazyLoadView",
				viewName: "test-resources.sap.ui.fl.qunit.testResources.VariantManagementTestApp"
			});
			oApp.addPage(oView);
			await oView.loaded();
			this.oComponent = RtaQunitUtils.createAndStubAppComponent(sandbox, sReference, undefined, oApp);
			this.sVMReference = "lazyLoadView--VariantManagement1";
			this.oVariantManagement = oView.byId("VariantManagement1");
			this.oComponentContainer = new ComponentContainer("lazyLoadTestContainer", {
				component: this.oComponent
			}).placeAt("qunit-fixture");

			await FlexState.initialize({
				reference: sReference,
				componentId: sReference,
				componentData: {},
				manifest: {}
			});
			sandbox.stub(FlexObjectManager, "saveFlexObjects").resolves();
			sandbox.stub(URLHandler.prototype, "registerControl");
			sandbox.stub(VariantManagementState, "getInitialUIChanges").returns([]);
			sandbox.stub(FlexObjectState, "waitForFlexObjectsToBeApplied").resolves();
			sandbox.stub(Loader, "getCachedFlexData").returns({
				parameters: { nonFavoriteVariantsRemoved: [this.sVMReference] }
			});

			await this.oVariantManagement.waitForInit();
			this.oModel = this.oVariantManagement.getVariantModel();
		},
		afterEach() {
			this.oComponent.destroy();
			this.oComponentContainer.destroy();
			sandbox.restore();
			FlexState.clearState();
		}
	}, function() {
		QUnit.test("Lazy loading flow: startup, manage views, favorite, select with content loading", async function(assert) {
			const oVMControl = this.oVariantManagement;

			// --- Step 1: Verify initial state with Standard variant only ---
			const oSetCallbackSpy = sandbox.spy(oVMControl, "setDynamicVariantsLoadedCallback");
			const oLoadAllVariantsForVMSpy = sandbox.spy(VariantManagerApply, "loadAllVariantsForVM");

			this.oModel.registerToModel();
			await VariantManagementState.waitForVariantSwitch(sReference, this.sVMReference);

			// Verify the VariantModel's registerToModel set the callback
			assert.strictEqual(oSetCallbackSpy.callCount, 1,
				"VariantModel.registerToModel called setDynamicVariantsLoadedCallback");
			const fnRegisteredCallback = oSetCallbackSpy.firstCall.args[0];
			assert.ok(typeof fnRegisteredCallback === "function",
				"A callback function was registered by the VariantModel");

			const aInitialVariants = VariantManagementState.getVariantManagementMap()
			.get({ reference: sReference })[this.sVMReference].variants;
			assert.strictEqual(aInitialVariants.length, 1, "Initially only the Standard variant is present in State");
			assert.strictEqual(aInitialVariants[0].title, "Standard", "The initial variant is the Standard variant");

			FlexState.addDirtyFlexObjects(sReference, [
				FlexObjectFactory.createFlVariant({
					id: "userVariant1",
					variantName: "User Variant 1",
					variantManagementReference: this.sVMReference,
					user: "TestUser",
					layer: Layer.USER,
					favorite: true
				})
			], sReference);

			const aVariantsAfterAdd = VariantManagementState.getVariantManagementMap()
			.get({ reference: sReference })[this.sVMReference].variants;
			assert.strictEqual(aVariantsAfterAdd.length, 2, "After adding user variant, 2 variants are present in State");

			// --- Step 2: Stub backend, invoke the VariantModel's callback, and open Manage Views dialog ---
			const oLazyLoadResponse = createLazyLoadResponse([
				{
					fileName: "lazyVariant1",
					fileType: "ctrl_variant",
					variantManagementReference: this.sVMReference,
					variantReference: this.sVMReference,
					layer: Layer.USER,
					title: "Lazy Variant Alpha",
					favorite: false,
					content: {},
					selector: { id: this.sVMReference },
					texts: { variantName: { value: "Lazy Variant Alpha" } },
					namespace: `apps/${sReference}/variants/`,
					reference: sReference,
					support: { user: "LazyUser" },
					variantDependentControlChangesRemoved: true
				},
				{
					fileName: "lazyVariant2",
					fileType: "ctrl_variant",
					variantManagementReference: this.sVMReference,
					variantReference: this.sVMReference,
					layer: Layer.USER,
					title: "Lazy Variant Beta",
					favorite: false,
					content: {},
					selector: { id: this.sVMReference },
					texts: { variantName: { value: "Lazy Variant Beta" } },
					namespace: `apps/${sReference}/variants/`,
					reference: sReference,
					support: { user: "LazyUser" }
				}
			], [
				{
					fileName: "setFavoriteChange1",
					fileType: "ctrl_variant_change",
					changeType: "setFavorite",
					selector: { id: "lazyVariant1" },
					layer: Layer.USER,
					content: { favorite: true },
					namespace: `apps/${sReference}/changes/`,
					reference: sReference,
					support: { user: "LazyUser" }
				}
			], [
				{
					fileName: "setDefaultChange1",
					fileType: "ctrl_variant_management_change",
					changeType: "setDefault",
					selector: { id: this.sVMReference },
					layer: Layer.USER,
					content: { defaultVariant: "lazyVariant2" },
					namespace: `apps/${sReference}/changes/`,
					reference: sReference,
					support: { user: "LazyUser" }
				}
			]);

			sandbox.stub(Storage, "loadAllFlVariants").resolves(oLazyLoadResponse);

			// Trigger the registered callback directly to avoid control dependency
			await fnRegisteredCallback();

			// Verify the callback triggered VariantManagerApply.loadAllVariantsForVM
			assert.strictEqual(oLoadAllVariantsForVMSpy.callCount, 1,
				"The VariantModel callback called loadAllVariantsForVM");
			assert.deepEqual(
				oLoadAllVariantsForVMSpy.firstCall.args[0],
				{ reference: sReference, componentId: this.oComponent.getId(), vmReference: this.sVMReference },
				"loadAllVariantsForVM called with correct parameters from VariantModel callback"
			);

			// Verify the idempotency guard: VM is marked as lazy-loaded
			assert.ok(
				FlexState.getLazyVariantsLoaded(sReference).includes(this.sVMReference),
				"VM reference is marked as lazy-loaded in FlexState"
			);

			// Verify that calling the callback again does NOT trigger another load
			await fnRegisteredCallback();
			assert.strictEqual(oLoadAllVariantsForVMSpy.callCount, 1,
				"Second callback invocation skips loading (idempotency guard)");

			// --- Step 3: Verify all variants are in State after lazy load ---
			const aAllVariants = VariantManagementState.getVariantManagementMap()
			.get({ reference: sReference })[this.sVMReference].variants;
			assert.strictEqual(aAllVariants.length, 4, "State shows 4 variants (Standard + 1 user + 2 lazy)");

			const aVariantTitles = aAllVariants.map((oVariant) => oVariant.title);
			assert.ok(aVariantTitles.includes("Standard"), "Standard variant is in State");
			assert.ok(aVariantTitles.includes("User Variant 1"), "User Variant 1 is in State");
			assert.ok(aVariantTitles.includes("Lazy Variant Alpha"), "Lazy Variant Alpha is in State");
			assert.ok(aVariantTitles.includes("Lazy Variant Beta"), "Lazy Variant Beta is in State");

			const oVMData = VariantManagementState.getVariantManagementMap()
			.get({ reference: sReference })[this.sVMReference];
			const oLazyVariantAlpha = oVMData.variants.find((oVariant) => oVariant.key === "lazyVariant1");
			assert.strictEqual(oLazyVariantAlpha.favorite, true,
				"setFavorite change was applied - Lazy Variant Alpha is marked as favorite");

			assert.strictEqual(oVMData.defaultVariant, "lazyVariant2",
				"setDefault change was applied - Lazy Variant Beta is set as default variant");

			// --- Step 4: Select the lazy variant and verify lazy content loading ---
			const oVariantData = VariantManagementState.getVariant({
				reference: sReference,
				vmReference: this.sVMReference,
				vReference: "lazyVariant1"
			});
			assert.ok(oVariantData, "Lazy Variant Alpha exists in VariantManagementState");

			assert.ok(
				VariantManagementState.areVariantDependentControlChangesRemoved({
					reference: sReference,
					vmReference: this.sVMReference,
					variantId: "lazyVariant1"
				}),
				"Lazy Variant Alpha content is marked as removed"
			);

			// Stub loadFlVariantDependentControlChanges to return a hideControl change targeting a section
			const sTargetControlId = "lazyLoadView--ObjectPageSection1";
			const oContentResponse = createVariantContentResponse([
				{
					fileName: "lazyVariant1",
					fileType: "ctrl_variant",
					variantManagementReference: this.sVMReference,
					variantReference: this.sVMReference,
					reference: sReference,
					layer: Layer.USER,
					content: { title: "Lazy Variant Alpha" }
				}
			], [
				{
					fileName: "lazyUIChange1",
					fileType: "change",
					changeType: "hideControl",
					reference: sReference,
					layer: Layer.USER,
					selector: { id: sTargetControlId, idIsLocal: false },
					variantReference: "lazyVariant1",
					content: {},
					namespace: `apps/${sReference}/changes/`,
					support: { user: "LazyUser" }
				}
			]);
			const oLoadFlVariantDependentControlChangesStub = sandbox.stub(Storage, "loadFlVariantDependentControlChanges")
			.resolves(oContentResponse);

			// Verify the target control is visible before variant switch
			const oTargetControl = Element.getElementById(sTargetControlId);
			assert.ok(oTargetControl, "Target control (ObjectPageSection1) exists");
			assert.ok(oTargetControl.getVisible(), "Target control is visible before variant switch");

			// Select the lazy variant — triggers lazy content loading via switchVariant
			await VariantManagerApply.updateCurrentVariant({
				newVariantReference: "lazyVariant1",
				vmControl: oVMControl,
				appComponent: this.oComponent
			});

			assert.strictEqual(
				oLoadFlVariantDependentControlChangesStub.callCount, 1,
				"Storage.loadFlVariantDependentControlChanges was called once"
			);
			assert.deepEqual(
				oLoadFlVariantDependentControlChangesStub.firstCall.args[0],
				{ reference: sReference, variantId: "lazyVariant1" },
				"loadFlVariantDependentControlChanges called with correct parameters"
			);

			assert.notOk(
				oVariantData.instance.getVariantDependentControlChangesRemoved(),
				"variantDependentControlChangesRemoved flag is cleared after content loading"
			);

			assert.notOk(
				VariantManagementState.areVariantDependentControlChangesRemoved({
					reference: sReference,
					vmReference: this.sVMReference,
					variantId: "lazyVariant1"
				}),
				"VariantManagementState confirms content is no longer marked as removed"
			);

			// Verify the hideControl change was actually applied — section is now hidden
			assert.notOk(oTargetControl.getVisible(),
				"Target control (ObjectPageSection1) is hidden after variant switch");
		});
	});

	QUnit.done(() => {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
