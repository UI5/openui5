/* global QUnit */

sap.ui.define([
	"sap/m/App",
	"sap/ui/core/mvc/XMLView",
	"sap/ui/core/ComponentContainer",
	"sap/ui/fl/apply/api/SmartVariantManagementApplyAPI",
	"sap/ui/fl/apply/_internal/flexObjects/FlexObjectFactory",
	"sap/ui/fl/apply/_internal/flexState/compVariants/CompVariantManagementState",
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
	XMLView,
	ComponentContainer,
	SmartVariantManagementApplyAPI,
	FlexObjectFactory,
	CompVariantManagementState,
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
	const sReference = "CompVariantLazyLoadingTest";

	function createCompVariantLazyLoadResponse(aVariantDefinitions, aChangeDefinitions) {
		const oResponse = {
			...StorageUtils.getEmptyFlexDataResponse(),
			compVariants: aVariantDefinitions,
			changes: aChangeDefinitions || []
		};
		return oResponse;
	}

	QUnit.module("Given an app with comp variant lazy loading...", {
		async beforeEach() {
			const oApp = new App("compLazyLoadTestApp");
			const oView = await XMLView.create({
				id: "compLazyLoadView",
				viewName: "test-resources.sap.ui.fl.qunit.testResources.CompVariantManagementTestApp"
			});
			oApp.addPage(oView);
			await oView.loaded();
			this.oComponent = RtaQunitUtils.createAndStubAppComponent(sandbox, sReference, undefined, oApp);
			this.sPersistencyKey = "myCompVariantPersistencyKey";
			this.oSmartVariantManagement = oView.byId("SmartVariantManagement1");
			this.oComponentContainer = new ComponentContainer("compLazyLoadTestContainer", {
				component: this.oComponent
			}).placeAt("qunit-fixture");

			await FlexState.initialize({
				reference: sReference,
				componentId: sReference,
				componentData: {},
				manifest: {}
			});
			sandbox.stub(FlexObjectManager, "saveFlexObjects").resolves();
		},
		afterEach() {
			sandbox.restore();
			this.oComponentContainer.destroy();
			FlexState.clearState();
		}
	}, function() {
		QUnit.test("Comp variant lazy loading: manage views loads non-favorite comp variants", async function(assert) {
			sandbox.stub(Loader, "getCachedFlexData").returns({
				parameters: { nonFavoriteVariantsRemoved: [this.sPersistencyKey] }
			});

			FlexState.addDirtyFlexObjects(sReference, [
				FlexObjectFactory.createCompVariant({
					fileName: "favoriteCompVariant1",
					persistencyKey: this.sPersistencyKey,
					layer: Layer.USER,
					favorite: true,
					content: { filterBarVariant: { filter0: "value0" } },
					texts: { variantName: { value: "Favorite Comp Variant" } },
					reference: sReference,
					support: { user: "CompUser" }
				})
			], sReference);

			const oSetCallbackSpy = sandbox.spy(this.oSmartVariantManagement, "setDynamicVariantsLoadedCallback");

			await SmartVariantManagementApplyAPI.loadVariants({
				control: this.oSmartVariantManagement,
				standardVariant: {}
			});

			const fnRegisteredCallback = oSetCallbackSpy.firstCall.args[0];

			const aInitialCompVariants = CompVariantManagementState.assembleVariantList({
				reference: sReference,
				persistencyKey: this.sPersistencyKey,
				standardVariant: {},
				componentId: this.oComponent.getId()
			});
			assert.strictEqual(aInitialCompVariants.length, 2,
				"Two comp variants exist in FlexState before lazy loading (Standard + 1 favorite)");

			const oCompVariantResponse = createCompVariantLazyLoadResponse([
				{
					fileName: "compVariant1",
					fileType: "variant",
					selector: { persistencyKey: this.sPersistencyKey },
					layer: Layer.USER,
					content: { filterBarVariant: { filter1: "value1" } },
					favorite: false,
					texts: { variantName: { value: "Comp Variant Alpha" } },
					namespace: `apps/${sReference}/variants/`,
					reference: sReference,
					support: { user: "CompUser" }
				},
				{
					fileName: "compVariant2",
					fileType: "variant",
					selector: { persistencyKey: this.sPersistencyKey },
					layer: Layer.USER,
					content: { filterBarVariant: { filter2: "value2" } },
					favorite: false,
					texts: { variantName: { value: "Comp Variant Beta" } },
					namespace: `apps/${sReference}/variants/`,
					reference: sReference,
					support: { user: "CompUser" }
				}
			], [
				{
					fileName: "compVariantChange1",
					fileType: "change",
					changeType: "updateVariant",
					selector: { persistencyKey: this.sPersistencyKey, variantId: "compVariant1" },
					layer: Layer.USER,
					content: { favorite: true },
					namespace: `apps/${sReference}/changes/`,
					reference: sReference,
					support: { user: "CompUser" }
				}
			]);
			let fnResolveLoadAllCompVariants;
			const oLoadAllCompVariantsPromise = new Promise((resolve) => {
				fnResolveLoadAllCompVariants = resolve;
			});
			const oLoadAllCompVariantsStub = sandbox.stub(Storage, "loadAllCompVariants").returns(oLoadAllCompVariantsPromise);

			// --- Step 1: Invoke callback to trigger lazy loading ---
			const oCallbackResult = fnRegisteredCallback();

			assert.strictEqual(oLoadAllCompVariantsStub.callCount, 1, "Storage.loadAllCompVariants was called once");
			assert.deepEqual(
				oLoadAllCompVariantsStub.firstCall.args[0],
				{ reference: sReference, persistencyKey: this.sPersistencyKey },
				"loadAllCompVariants called with correct reference and persistencyKey"
			);

			fnResolveLoadAllCompVariants(oCompVariantResponse);
			await oCallbackResult;

			// --- Step 2: Verify idempotency guard ---
			assert.ok(
				FlexState.getLazyVariantsLoaded(sReference).includes(this.sPersistencyKey),
				"Persistency key is marked as lazy-loaded in FlexState"
			);

			await fnRegisteredCallback();
			assert.strictEqual(oLoadAllCompVariantsStub.callCount, 1,
				"Second callback invocation skips loading (idempotency guard)");

			// --- Step 3: Verify comp variants were added to FlexState ---
			const aLazyLoadedCompVariants = CompVariantManagementState.assembleVariantList({
				reference: sReference,
				persistencyKey: this.sPersistencyKey,
				standardVariant: {},
				componentId: this.oComponent.getId()
			});
			assert.strictEqual(aLazyLoadedCompVariants.length, 4,
				"Four comp variants in FlexState (Standard + 1 favorite + 2 lazy-loaded)");

			const aCompVariantNames = aLazyLoadedCompVariants.map((oObj) => oObj.getName());
			assert.ok(aCompVariantNames.includes("Favorite Comp Variant"), "Favorite Comp Variant is in FlexState");
			assert.ok(aCompVariantNames.includes("Comp Variant Alpha"), "Comp Variant Alpha is in FlexState");
			assert.ok(aCompVariantNames.includes("Comp Variant Beta"), "Comp Variant Beta is in FlexState");

			const oCompVariantAlpha = aLazyLoadedCompVariants.find((oObj) => oObj.getName() === "Comp Variant Alpha");
			assert.strictEqual(oCompVariantAlpha.getFavorite(), true,
				"updateVariant change was applied - Comp Variant Alpha is marked as favorite");
		});
	});

	QUnit.done(() => {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
