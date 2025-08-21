/* global QUnit */

sap.ui.define([
	"sap/base/util/merge",
	"sap/ui/core/Manifest",
	"sap/ui/fl/apply/_internal/flexObjects/FlexObjectFactory",
	"sap/ui/fl/initial/_internal/FlexInfoSession",
	"sap/ui/fl/initial/_internal/Loader",
	"sap/ui/fl/initial/_internal/ManifestUtils",
	"sap/ui/fl/initial/_internal/Settings",
	"sap/ui/fl/initial/_internal/Storage",
	"sap/ui/fl/initial/api/Version",
	"sap/ui/fl/write/_internal/connectors/JsObjectConnector",
	"sap/ui/thirdparty/sinon-4"
], function(
	merge,
	Manifest,
	FlexObjectFactory,
	FlexInfoSession,
	Loader,
	ManifestUtils,
	Settings,
	Storage,
	Version,
	JsObjectConnector,
	sinon
) {
	"use strict";

	var sandbox = sinon.createSandbox();
	const sReference = "my.reference";

	var oComponentData = {
		startupParameters: {
			hcpApplicationId: ["siteId"]
		}
	};

	QUnit.module("Loader", {
		beforeEach() {
			this.oRawManifest = {
				property: "value"
			};
			this.oManifest = new Manifest(this.oRawManifest);
			const oFlexDataResponse = {
				info: {
					foo: "bar"
				},
				authors: {},
				changes: [
					{
						fileName: "c1",
						selector: {
							id: "ProductDetail--GeneralForm--generalForm",
							idIsLocal: false
						},
						dependentSelector: {
							movedElements: [
								{
									id: "ProductDetail--GeneralForm--productLabel",
									idIsLocal: false
								},
								{
									id: "ProductDetail--GeneralForm--productLabel2",
									idIsLocal: false
								}
							],
							anotherElement: {
								id: "ProductDetail--GeneralForm--anotherProductLabel",
								idIsLocal: false
							}
						}
					}, {
						fileName: "c2",
						selector: {
							id: "ProductDetail--GeneralForm--generalForm",
							idIsLocal: true
						},
						dependentSelector: {
							movedElements: [
								{
									id: "ProductDetail--GeneralForm--productLabel",
									idIsLocal: true
								}
							]
						}
					}, {
						fileName: "c3",
						selector: "ProductDetail--GeneralForm--generalForm",
						dependentSelector: {
							movedElements: [
								"ProductDetail--GeneralForm--productLabel"
							]
						}
					}, {
						fileName: "4c", // Invalid file name (id must not start with number)
						selector: "ProductDetail--GeneralForm--generalForm",
						dependentSelector: {
							movedElements: [
								"ProductDetail--GeneralForm--productLabel"
							]
						}
					}, {
						fileName: "some_appDescr_change_without_selector"
					}
				],
				variantDependentControlChanges: [],
				compVariants: [],
				variantChanges: [],
				variants: [],
				variantManagementChanges: []
			};
			const oCompleteFlexDataResponse = merge({}, oFlexDataResponse, {
				variants: [{
					fileName: "variant1"
				}]
			});
			this.oExpectedFlexDataResponse = merge({}, oFlexDataResponse);
			this.oExpectedFlexDataResponse.changes.splice(3, 1); // remove invalid file name change
			this.oExpectedCompleteFlexDataResponse = merge({}, this.oExpectedFlexDataResponse, {
				variants: [{
					fileName: "variant1"
				}]
			});
			this.oLoadFlexDataStub = sandbox.stub(Storage, "loadFlexData").callsFake((mPropertyBag) => {
				return mPropertyBag.skipLoadBundle ? Promise.resolve(oFlexDataResponse) : Promise.resolve(oCompleteFlexDataResponse);
			});
			this.oCompleteFlexDataStub = sandbox.stub(Storage, "completeFlexData").resolves(oCompleteFlexDataResponse);
			this.oGetBaseCompNameStub = sandbox.stub(ManifestUtils, "getBaseComponentNameFromManifest").returns("baseName");
			this.oGetCacheKeyStub = sandbox.stub(ManifestUtils, "getCacheKeyFromAsyncHints").returns("cacheKey");
			this.oLoadVariantsAuthorsStub = sandbox.stub(Loader, "loadVariantsAuthors").returns({});
		},
		afterEach() {
			Loader.clearCache();
			sandbox.restore();
			FlexInfoSession.removeByReference(sReference);
		}
	}, function() {
		QUnit.test("when getFlexData is called with all information", async function(assert) {
			FlexInfoSession.setByReference({
				version: Version.Number.Draft,
				displayedAdaptationId: "id_1234"
			}, sReference);

			var oExpectedProperties = {
				reference: sReference,
				componentName: "baseName",
				cacheKey: "cacheKey",
				siteId: "siteId",
				preview: undefined,
				appDescriptor: this.oRawManifest,
				version: Version.Number.Draft,
				adaptationId: "id_1234",
				skipLoadBundle: true
			};

			const oResult = await Loader.getFlexData({
				manifest: this.oManifest,
				otherValue: "a",
				reference: sReference,
				componentData: oComponentData,
				skipLoadBundle: true
			});

			assert.deepEqual(oResult.data.changes, this.oExpectedFlexDataResponse, "the Loader loads data");
			assert.strictEqual(this.oLoadFlexDataStub.callCount, 1, "the Storage.loadFlexData was called");
			assert.strictEqual(this.oCompleteFlexDataStub.callCount, 0, "the Storage.completeFlexData was not called");
			assert.strictEqual(this.oLoadFlexDataStub.getCall(0).args[0].siteId, "siteId", "the siteId was retrieved from the Utils");
			assert.strictEqual(this.oLoadFlexDataStub.getCall(0).args[0].skipLoadBundle, true, "the bundle loading was skipped");
			assert.strictEqual(this.oGetBaseCompNameStub.callCount, 1, "the name was retrieved from the Utils");
			assert.strictEqual(this.oGetCacheKeyStub.callCount, 1, "the cache key was retrieved from the Utils");
			assert.strictEqual(this.oLoadVariantsAuthorsStub.callCount, 1, "the loadVariantsAuthors was called");
			var mPassedPropertyBag = this.oLoadFlexDataStub.firstCall.args[0];
			assert.deepEqual(mPassedPropertyBag, oExpectedProperties, "and is the property bag");

			const oFlexData = Loader.getCachedFlexData(sReference);
			assert.deepEqual(oFlexData, oResult.data, "the cached data is correct");

			const oFlexInfoSession = FlexInfoSession.getByReference(sReference);
			assert.strictEqual(oFlexInfoSession.foo, "bar", "the info is stored in the FlexInfoSession");
		});

		QUnit.test("when getFlexData is called twice for the same component with skipLoadBundle", async function(assert) {
			const oFlexData = await Loader.getFlexData({
				manifest: this.oManifest,
				reference: sReference,
				componentData: oComponentData,
				skipLoadBundle: true
			});
			assert.deepEqual(oFlexData.data.changes, this.oExpectedFlexDataResponse, "the Loader loads data");
			assert.strictEqual(this.oLoadFlexDataStub.callCount, 1, "the Storage.loadFlexData was called once");

			const oFlexData2 = await Loader.getFlexData({
				manifest: this.oManifest,
				reference: sReference,
				componentData: oComponentData,
				skipLoadBundle: true
			});
			assert.deepEqual(oFlexData2.data.changes, this.oExpectedFlexDataResponse, "the Loader loads data");
			assert.strictEqual(this.oLoadFlexDataStub.callCount, 1, "the Storage.loadFlexData was not called again");
		});

		QUnit.test("when getFlexData is called with reInitialize", async function(assert) {
			const oFlexData = await Loader.getFlexData({
				manifest: this.oManifest,
				reference: sReference,
				componentData: oComponentData,
				skipLoadBundle: true
			});
			assert.deepEqual(oFlexData.data.changes, this.oExpectedFlexDataResponse, "the Loader loads data");
			assert.strictEqual(this.oLoadFlexDataStub.callCount, 1, "the Storage.loadFlexData was called once");

			const oFlexData2 = await Loader.getFlexData({
				manifest: this.oManifest,
				reference: sReference,
				componentData: oComponentData,
				skipLoadBundle: true,
				reInitialize: true
			});
			assert.deepEqual(oFlexData2.data.changes, this.oExpectedFlexDataResponse, "the Loader loads data");
			assert.strictEqual(this.oLoadFlexDataStub.callCount, 2, "the Storage.loadFlexData was called again");
		});

		QUnit.test("when getFlexData is called twice for the same component without skipLoadBundle", async function(assert) {
			const oFlexData = await Loader.getFlexData({
				manifest: this.oManifest,
				reference: sReference,
				componentData: oComponentData
			});
			assert.deepEqual(oFlexData.data.changes, this.oExpectedCompleteFlexDataResponse, "the Loader loads data");
			assert.strictEqual(this.oLoadFlexDataStub.callCount, 1, "the Storage.loadFlexData was called once");
			assert.strictEqual(this.oLoadVariantsAuthorsStub.callCount, 1, "the loadVariantsAuthors was called once");

			const oFlexData2 = await Loader.getFlexData({
				manifest: this.oManifest,
				reference: sReference,
				componentData: oComponentData
			});
			assert.deepEqual(oFlexData2.data.changes, this.oExpectedCompleteFlexDataResponse, "the Loader loads data");
			assert.strictEqual(this.oLoadFlexDataStub.callCount, 1, "the Storage.loadFlexData was not called again");
			assert.strictEqual(this.oLoadVariantsAuthorsStub.callCount, 1, "the loadVariantsAuthors was not called again");
		});

		QUnit.test("when getFlexData is called with different versions and skipLoadBundle", async function(assert) {
			const oFlexData = await Loader.getFlexData({
				manifest: this.oManifest,
				reference: sReference,
				componentData: oComponentData,
				skipLoadBundle: true
			});
			assert.deepEqual(oFlexData.data.changes, this.oExpectedFlexDataResponse, "the Loader loads data");
			assert.strictEqual(this.oLoadFlexDataStub.callCount, 1, "the Storage.loadFlexData was called once");

			FlexInfoSession.setByReference({
				version: "firstVersion"
			}, sReference);
			const oFlexData2 = await Loader.getFlexData({
				manifest: this.oManifest,
				reference: sReference,
				componentData: oComponentData
			});
			assert.deepEqual(oFlexData2.data.changes, this.oExpectedCompleteFlexDataResponse, "the Loader loads data");
			assert.strictEqual(this.oLoadFlexDataStub.callCount, 2, "the Storage.loadFlexData was called again");
			assert.strictEqual(this.oCompleteFlexDataStub.callCount, 0, "the Storage.completeFlexData was not called");
		});

		QUnit.test("when getFlexData is first called with skipLoadBundle, then without", async function(assert) {
			await Loader.getFlexData({
				manifest: this.oManifest,
				reference: sReference,
				componentData: oComponentData,
				skipLoadBundle: true
			});

			const oFlexData2 = await Loader.getFlexData({
				manifest: this.oManifest,
				reference: sReference,
				componentData: oComponentData
			});
			assert.deepEqual(oFlexData2.data.changes, this.oExpectedCompleteFlexDataResponse, "the Loader loads data");
			assert.strictEqual(this.oLoadFlexDataStub.callCount, 1, "the Storage.loadFlexData was not called again");
			assert.strictEqual(this.oCompleteFlexDataStub.callCount, 1, "the Storage.completeFlexData was called once");
			assert.strictEqual(this.oLoadVariantsAuthorsStub.callCount, 1, "the loadVariantsAuthors was called once");
		});

		QUnit.test("when loadFlexData is first called without skipLoadBundle, then with", async function(assert) {
			await Loader.getFlexData({
				manifest: this.oManifest,
				reference: sReference,
				componentData: oComponentData
			});
			const oFlexData2 = await Loader.getFlexData({
				manifest: this.oManifest,
				reference: sReference,
				componentData: oComponentData,
				skipLoadBundle: true
			});
			assert.deepEqual(
				oFlexData2.data.changes,
				this.oExpectedCompleteFlexDataResponse,
				"then the loader returns all data, including the bundle data"
			);
			assert.strictEqual(
				this.oLoadFlexDataStub.callCount,
				1,
				"then Storage.loadFlexData is only called once"
			);
			assert.ok(
				this.oCompleteFlexDataStub.notCalled,
				"then Storage.completeFlexData is not called as the bundle is already loaded during loadFlexData"
			);
		});

		QUnit.test("when getFlexData is called with different versions", async function(assert) {
			FlexInfoSession.setByReference({
				version: "firstVersion"
			}, sReference);
			await Loader.getFlexData({
				manifest: this.oManifest,
				reference: sReference,
				componentData: oComponentData
			});

			FlexInfoSession.setByReference({
				version: "secondVersion"
			}, sReference);
			const oFlexData2 = await Loader.getFlexData({
				manifest: this.oManifest,
				reference: sReference,
				componentData: oComponentData
			});
			assert.deepEqual(oFlexData2.data.changes, this.oExpectedCompleteFlexDataResponse, "the Loader loads data");
			assert.strictEqual(this.oLoadFlexDataStub.callCount, 2, "the Storage.loadFlexData was called twice");
			assert.strictEqual(this.oCompleteFlexDataStub.callCount, 0, "the Storage.completeFlexData was not called");
		});

		QUnit.test("when getFlexData is called with different allContextsProvided", async function(assert) {
			FlexInfoSession.setByReference({
				allContextsProvided: true
			}, sReference);
			await Loader.getFlexData({
				manifest: this.oManifest,
				reference: sReference,
				componentData: oComponentData
			});

			FlexInfoSession.setByReference({
				allContextsProvided: false
			}, sReference);
			const oFlexData2 = await Loader.getFlexData({
				manifest: this.oManifest,
				reference: sReference,
				componentData: oComponentData
			});
			assert.deepEqual(oFlexData2.data.changes, this.oExpectedCompleteFlexDataResponse, "the Loader loads data");
			assert.strictEqual(this.oLoadFlexDataStub.callCount, 2, "the Storage.loadFlexData was called twice");
			assert.strictEqual(this.oCompleteFlexDataStub.callCount, 0, "the Storage.completeFlexData was not called");
		});

		QUnit.test("when Loader.setAllContextsProvided is called to change the value and loadFlexData is called again", async function(assert) {
			// calling this before an initialized Cache the call will be ignored
			Loader.setAllContextsProvided(sReference, true);

			// initially the value is not set
			await Loader.getFlexData({
				manifest: this.oManifest,
				reference: sReference,
				componentData: oComponentData
			});
			assert.strictEqual(this.oLoadFlexDataStub.callCount, 1, "the Storage.loadFlexData was called once");

			Loader.setAllContextsProvided(sReference, true);
			await Loader.getFlexData({
				manifest: this.oManifest,
				reference: sReference,
				componentData: oComponentData
			});
			assert.strictEqual(this.oLoadFlexDataStub.callCount, 2, "the Storage.loadFlexData was called twice");
		});

		QUnit.test("when getFlexData is called with different adaptationIds", async function(assert) {
			FlexInfoSession.setByReference({
				displayedAdaptationId: "firstAdaptationId"
			}, sReference);
			await Loader.getFlexData({
				manifest: this.oManifest,
				reference: sReference,
				componentData: oComponentData
			});

			FlexInfoSession.setByReference({
				displayedAdaptationId: "secondAdaptationId"
			}, sReference);
			const oFlexData2 = await Loader.getFlexData({
				manifest: this.oManifest,
				reference: sReference,
				componentData: oComponentData
			});
			assert.deepEqual(oFlexData2.data.changes, this.oExpectedCompleteFlexDataResponse, "the Loader loads data");
			assert.strictEqual(this.oLoadFlexDataStub.callCount, 2, "the Storage.loadFlexData was called twice");
			assert.strictEqual(this.oCompleteFlexDataStub.callCount, 0, "the Storage.completeFlexData was not called");
		});

		QUnit.test("when getFlexData is called without app version and all contexts", async function(assert) {
			var oExpectedProperties = {
				reference: sReference,
				cacheKey: "cacheKey",
				siteId: "siteId",
				preview: undefined,
				appDescriptor: this.oRawManifest,
				componentName: "baseName",
				version: undefined,
				adaptationId: undefined,
				skipLoadBundle: undefined
			};

			const oResult = await Loader.getFlexData({
				manifest: this.oManifest,
				otherValue: "a",
				reference: sReference,
				componentData: oComponentData
			});
			assert.deepEqual(oResult.data.changes, this.oExpectedCompleteFlexDataResponse, "the Loader tries to load data");
			assert.strictEqual(this.oLoadFlexDataStub.callCount, 1, "the Storage.loadFlexData was called");
			assert.strictEqual(this.oCompleteFlexDataStub.callCount, 0, "the Storage.completeFlexData was not called");
			assert.strictEqual(this.oLoadFlexDataStub.getCall(0).args[0].siteId, "siteId", "the siteId was retrieved from the Utils");
			assert.strictEqual(this.oGetBaseCompNameStub.callCount, 1, "the name was retrieved from the Utils");
			assert.strictEqual(this.oGetCacheKeyStub.callCount, 1, "the cache key was retrieved from the Utils");
			assert.deepEqual(this.oLoadFlexDataStub.firstCall.args[0], oExpectedProperties, "the first argument are the properties");
		});

		QUnit.test("when getFlexData is called with an emptyState available", function(assert) {
			Loader.initializeEmptyCache(sReference);
			Loader.getFlexData({
				manifest: this.oManifest,
				reference: sReference,
				componentData: oComponentData
			});
			assert.strictEqual(this.oLoadFlexDataStub.callCount, 1, "the Storage.loadFlexData was called");
		});

		[{
			details: "with a manifest object",
			manifest: new Manifest({
				"_version": "2.0.0",
				"sap.ovp": {}
			})
		}, {
			details: "with a manifest JSON",
			manifest: {
				"_version": "2.0.0",
				"sap.ovp": {}
			}
		}].forEach(function(oTestData) {
			QUnit.test(`when getFlexData is called with a ovp app and ${oTestData.details}`, function(assert) {
				var mPropertyBag = {
					manifest: oTestData.manifest,
					otherValue: "a",
					reference: sReference,
					componentData: oComponentData
				};

				return Loader.getFlexData(mPropertyBag).then(function(oResult) {
					var aChanges = oResult.data.changes.changes;
					assert.strictEqual(aChanges.length, 4, "four changes are loaded");
					assert.strictEqual(aChanges[0].fileName, "c1", "the file name of the first change is correct - MUST BE THE SAME");
					assert.deepEqual(aChanges[0].selector, {
						id: "ProductDetail--GeneralForm--generalForm",
						idIsLocal: true
					}, "the selector of the first change is correct");
					assert.deepEqual(aChanges[0].dependentSelector, {
						movedElements: [{
							id: "ProductDetail--GeneralForm--productLabel",
							idIsLocal: true
						}, {
							id: "ProductDetail--GeneralForm--productLabel2",
							idIsLocal: true
						}],
						anotherElement: {
							id: "ProductDetail--GeneralForm--anotherProductLabel",
							idIsLocal: true
						}
					}, "the dependent selector of the first change is correct");
					assert.strictEqual(aChanges[1].fileName, "c2", "the file name of the third change is correct");
					assert.deepEqual(aChanges[1].selector, {
						id: "ProductDetail--GeneralForm--generalForm",
						idIsLocal: true
					}, "the selector of the third change is correct");
					assert.deepEqual(aChanges[1].dependentSelector, {
						movedElements: [{
							id: "ProductDetail--GeneralForm--productLabel",
							idIsLocal: true
						}]
					}, "the dependent selector of the second change is correct");
					assert.strictEqual(aChanges[2].fileName, "c3", "the file name of the forth change is correct - MUST BE THE SAME");
					assert.deepEqual(aChanges[2].selector, {
						id: "ProductDetail--GeneralForm--generalForm",
						idIsLocal: true
					}, "the selector of the forth change is correct");
					assert.deepEqual(aChanges[2].dependentSelector, {
						movedElements: [{
							id: "ProductDetail--GeneralForm--productLabel",
							idIsLocal: true
						}]
					}, "the dependent selector of the forth change is correct");
				});
			});
		});

		QUnit.test("when getFlexData is called with a non-ovp app", function(assert) {
			const mPropertyBag = {
				manifest: { ...this.oManifest },
				otherValue: "a",
				reference: sReference,
				componentData: oComponentData
			};

			return Loader.getFlexData(mPropertyBag).then(function(oResult) {
				const aChanges = oResult.data.changes.changes;
				assert.strictEqual(aChanges.length, 4, "four changes are loaded");
				assert.strictEqual(aChanges[0].fileName, "c1", "the file name of the first change is correct");
				assert.deepEqual(aChanges[0].selector, {
					id: "ProductDetail--GeneralForm--generalForm",
					idIsLocal: false
				}, "the selector of the first change is correct");
				assert.deepEqual(aChanges[0].dependentSelector, {
					movedElements: [{
						id: "ProductDetail--GeneralForm--productLabel",
						idIsLocal: false
					}, {
						id: "ProductDetail--GeneralForm--productLabel2",
						idIsLocal: false
					}],
					anotherElement: {
						id: "ProductDetail--GeneralForm--anotherProductLabel",
						idIsLocal: false
					}
				}, "the dependent selector of the first change is correct");
				assert.strictEqual(aChanges[1].fileName, "c2", "the file name of the second change is correct");
				assert.deepEqual(aChanges[1].selector, {
					id: "ProductDetail--GeneralForm--generalForm",
					idIsLocal: true
				}, "the selector of the second change is correct");
				assert.deepEqual(aChanges[1].dependentSelector, {
					movedElements: [{
						id: "ProductDetail--GeneralForm--productLabel",
						idIsLocal: true
					}]
				}, "the dependent selector of the second change is correct");
				assert.strictEqual(aChanges[2].fileName, "c3", "the file name of the third change is correct");
				assert.deepEqual(aChanges[2].selector, "ProductDetail--GeneralForm--generalForm", "the selector of the third change is correct");
				assert.deepEqual(aChanges[2].dependentSelector, {
					movedElements: ["ProductDetail--GeneralForm--productLabel"]
				}, "the dependent selector of the third change is correct");
			});
		});
	});

	QUnit.module("Given new connector configuration in bootstrap", {
		beforeEach() {
			this.oRawManifest = {
				property: "value"
			};
			this.oManifest = new Manifest(this.oRawManifest);
		},
		afterEach() {
			Loader.clearCache();
			JsObjectConnector.storage.clear();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("and static preload when loading flex data, get name/reference from mComponent", async function(assert) {
			// simulate a component-preload
			sap.ui.require.preload({
				"test/app/changes/changes-bundle.json": '[{"otherDummy":true}]'
			});

			var mPropertyBag = {
				manifest: this.oManifest,
				reference: "test.app",
				componentData: oComponentData
			};

			const oResult = await Loader.getFlexData(mPropertyBag);
			assert.strictEqual(oResult.data.changes.changes.length, 1, "one change was loaded");
			const oChange = oResult.data.changes.changes[0];
			assert.strictEqual(oChange.otherDummy, true, "the change dummy data is correctly loaded");
		});
	});

	QUnit.module("Load variant author name", {
		afterEach() {
			Loader.clearCache();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("When load variant author name is triggered and feature is not available", async function(assert) {
			const oBackEndResult = {
				compVariants: {
					comp_id1: "comp_name1"
				},
				variants: {
					id1: "name1"
				}
			};
			sandbox.stub(Settings, "getInstanceOrUndef").returns({
				getIsVariantAuthorNameAvailable() {
					return false;
				}
			});
			const oStubLoadVariantsAuthors = sandbox.stub(Storage, "loadVariantsAuthors").resolves(oBackEndResult);

			const oResult = await Loader.loadVariantsAuthors("test.app");
			assert.deepEqual(oResult, {}, "then empty result is returned");
			assert.strictEqual(oStubLoadVariantsAuthors.callCount, 0, "then correct function of storage is not called");
		});

		QUnit.test("When load variant author name is triggered and the settings are not loaded (i.e. '<NO CACHE>' mentioned in the asyncHints)", async function(assert) {
			sandbox.stub(Settings, "getInstanceOrUndef");
			const oStubLoadVariantsAuthors = sandbox.stub(Storage, "loadVariantsAuthors");

			const oResult = await Loader.loadVariantsAuthors("test.app");
			assert.deepEqual(oResult, {}, "then empty result is returned");
			assert.strictEqual(oStubLoadVariantsAuthors.callCount, 0, "then correct function of storage is not called");
		});

		QUnit.test("When load variant author name is triggered and feature is available", async function(assert) {
			const oBackEndResult = {
				compVariants: {
					comp_id1: "comp_name1"
				},
				variants: {
					id1: "name1"
				}
			};
			sandbox.stub(Settings, "getInstanceOrUndef").returns({
				getIsVariantAuthorNameAvailable() {
					return true;
				}
			});
			const oStubLoadVariantsAuthors = sandbox.stub(Storage, "loadVariantsAuthors").resolves(oBackEndResult);

			const oResult = await Loader.loadVariantsAuthors("test.app");
			assert.deepEqual(oResult, oBackEndResult, "then result is get from LRep back end");
			assert.strictEqual(oStubLoadVariantsAuthors.callCount, 1, "then correct function of storage is called");
			assert.strictEqual(oStubLoadVariantsAuthors.getCall(0).args[0], "test.app", "with correct reference");
		});
	});

	QUnit.module("misc", {
		beforeEach() {
			this.oFlexDataResponse = {
				appDescriptorChanges: [{changeType: "changeType", fileName: "appDescriptorChange1"}, {changeType: "changeType", fileName: "appDescriptorChange$"}],
				annotationChanges: [{changeType: "changeType", fileName: "annotationChange1"}, {changeType: "changeType", fileName: "annotationChange%"}],
				changes: [{changeType: "changeType", fileName: "change1"}, {changeType: "changeType", fileName: "change&"}],
				comp: {
					variants: [{changeType: "changeType", fileName: "variant1"}, {changeType: "changeType", fileName: "variant@"}],
					changes: [{changeType: "changeType", fileName: "compChange1"}, {changeType: "changeType", fileName: "compChange#"}],
					defaultVariants: [{changeType: "changeType", fileName: "defaultVariant1"}, {changeType: "changeType", fileName: "defaultVariant$"}],
					standardVariants: [{changeType: "changeType", fileName: "standardVariant1"}, {changeType: "changeType", fileName: "standardVariant%"}]
				},
				variants: [{changeType: "changeType", fileName: "variant1"}, {changeType: "changeType", fileName: "variant@"}],
				variantChanges: [{changeType: "changeType", fileName: "variantChange1"}, {changeType: "changeType", fileName: "variantChange#"}],
				variantDependentControlChanges: [{changeType: "changeType", fileName: "varDepControlChange1"}, {changeType: "changeType", fileName: "varDepControlChange$"}],
				variantManagementChanges: [{changeType: "changeType", fileName: "variantManagementChange1"}, {changeType: "changeType", fileName: "variantManagementChange%"}]
			};
			this.oLoadFlexDataStub = sandbox.stub(Storage, "loadFlexData").resolves(this.oFlexDataResponse);
			sandbox.stub(ManifestUtils, "getBaseComponentNameFromManifest").returns("baseName");
			const oRawManifest = {
				property: "value"
			};
			this.oManifest = new Manifest(oRawManifest);
		},
		afterEach() {
			Loader.clearCache();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("invalidFileNames", async function(assert) {
			var mPropertyBag = {
				manifest: this.oManifest,
				reference: sReference
			};

			const oResult = await Loader.getFlexData(mPropertyBag);
			assert.strictEqual(oResult.data.changes.appDescriptorChanges.length, 1, "the appDescriptorChanges are filtered");
			assert.strictEqual(oResult.data.changes.annotationChanges.length, 1, "the annotationChanges are filtered");
			assert.strictEqual(oResult.data.changes.changes.length, 1, "the changes are filtered");
			assert.strictEqual(oResult.data.changes.comp.changes.length, 1, "the comp.changes are filtered");
			assert.strictEqual(oResult.data.changes.comp.defaultVariants.length, 1, "the comp.defaultVariants are filtered");
			assert.strictEqual(oResult.data.changes.comp.standardVariants.length, 1, "the comp.standardVariants are filtered");
			assert.strictEqual(oResult.data.changes.variants.length, 1, "the variants are filtered");
			assert.strictEqual(oResult.data.changes.variantChanges.length, 1, "the variantChanges are filtered");
			assert.strictEqual(oResult.data.changes.variantDependentControlChanges.length, 1, "the variantDependentControlChanges are filtered");
			assert.strictEqual(oResult.data.changes.variantManagementChanges.length, 1, "the variantManagementChanges are filtered");
		});

		QUnit.test("deactivateChanges", async function(assert) {
			const mPropertyBag = {
				manifest: this.oManifest,
				reference: sReference
			};
			this.oFlexDataResponse.changes.push({
				fileName: "deactivateChange",
				changeType: "deactivateChanges",
				content: {
					changeIds: ["appDescriptorChange1", "annotationChange1", "variantChange1"]
				}
			}, {
				fileName: "deactivateChange2",
				changeType: "deactivateChanges",
				content: {
					changeIds: ["change1", "compChange1"]
				}
			});

			const oResult = await Loader.getFlexData(mPropertyBag);
			assert.strictEqual(oResult.data.changes.appDescriptorChanges.length, 0, "the appDescriptorChanges are filtered");
			assert.strictEqual(oResult.data.changes.annotationChanges.length, 0, "the annotationChanges are filtered");
			assert.strictEqual(oResult.data.changes.changes.length, 0, "the changes are filtered");
			assert.strictEqual(oResult.data.changes.comp.changes.length, 0, "the comp.changes are filtered");
			assert.strictEqual(oResult.data.changes.comp.defaultVariants.length, 1, "the comp.defaultVariants are filtered");
			assert.strictEqual(oResult.data.changes.comp.standardVariants.length, 1, "the comp.standardVariants are filtered");
			assert.strictEqual(oResult.data.changes.variants.length, 1, "the variants are filtered");
			assert.strictEqual(oResult.data.changes.variantChanges.length, 0, "the variantChanges are filtered");
			assert.strictEqual(oResult.data.changes.variantDependentControlChanges.length, 1, "the variantDependentControlChanges are filtered");
			assert.strictEqual(oResult.data.changes.variantManagementChanges.length, 1, "the variantManagementChanges are filtered");
		});

		QUnit.test("getCachedFlexData without data", function(assert) {
			const oLoadFlexDataStub = sandbox.stub(Loader, "getFlexData");
			const oFlexData = Loader.getCachedFlexData("test.app");
			assert.deepEqual(oFlexData, {}, "no data is returned");
			assert.strictEqual(oLoadFlexDataStub.callCount, 0, "loadFlexData is not called");
		});
	});

	QUnit.module("Loader with an empty cache", {
		async beforeEach() {
			await Loader.initializeEmptyCache(sReference);
		},
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("updateStorageResponse with all kinds of updates at once", function(assert) {
			const oUIChange = FlexObjectFactory.createUIChange({ id: "uiChange1" });
			const oVariantDepUIChange = FlexObjectFactory.createUIChange({
				id: "uiChange2",
				variantReference: "flVariant1"
			});
			const oVariantChange1 = FlexObjectFactory.createUIChange({
				id: "uiChange3",
				fileType: "ctrl_variant_change"
			});
			const oVariantChange2 = FlexObjectFactory.createUIChange({
				id: "uiChange4",
				fileType: "ctrl_variant_management_change"
			});
			const oFlVariant = FlexObjectFactory.createFlVariant({ id: "flVariant1" });
			const oCompVariant = FlexObjectFactory.createCompVariant({ id: "compVariant1" });
			const oCompChange = FlexObjectFactory.createUIChange({
				id: "uiChange5",
				selector: {
					persistencyKey: "foo"
				}
			});
			const oManifestChange = FlexObjectFactory.createAppDescriptorChange({ id: "manifestChange1" });
			const oAnnotationChange = FlexObjectFactory.createAnnotationChange({ id: "annotationChange1" });
			const aUpdates = [
				oUIChange,
				oVariantDepUIChange,
				oVariantChange1,
				oVariantChange2,
				oFlVariant,
				oCompVariant,
				oCompChange,
				oManifestChange,
				oAnnotationChange
			].map((oChange) => {
				return {
					flexObject: oChange.convertToFileContent(),
					type: "add"
				};
			});
			aUpdates.push({
				type: "ui2",
				newData: "newData"
			});

			// Step 1: add some changes to the cache
			Loader.updateStorageResponse(sReference, aUpdates);
			const oCachedData = Loader.getCachedFlexData(sReference).changes;
			assert.strictEqual(oCachedData.changes.length, 1, "one UI change is stored");
			assert.strictEqual(oCachedData.changes[0].fileName, "uiChange1", "the UI change is stored");
			assert.strictEqual(oCachedData.variantDependentControlChanges.length, 1, "one variant dependent UI change is stored");
			assert.strictEqual(oCachedData.variantDependentControlChanges[0].fileName, "uiChange2", "the variant dependent UI change is stored");
			assert.strictEqual(oCachedData.variantChanges.length, 1, "one variant change is stored");
			assert.strictEqual(oCachedData.variantChanges[0].fileName, "uiChange3", "the variant change is stored");
			assert.strictEqual(oCachedData.variantManagementChanges.length, 1, "one variant management change is stored");
			assert.strictEqual(oCachedData.variantManagementChanges[0].fileName, "uiChange4", "the variant management change is stored");
			assert.strictEqual(oCachedData.variants.length, 1, "one FL variant is stored");
			assert.strictEqual(oCachedData.variants[0].fileName, "flVariant1", "the FL variant is stored");
			assert.strictEqual(oCachedData.comp.variants.length, 1, "one comp variant is stored");
			assert.strictEqual(oCachedData.comp.variants[0].fileName, "compVariant1", "the comp variant is stored");
			assert.strictEqual(oCachedData.comp.changes.length, 1, "one comp change is stored");
			assert.strictEqual(oCachedData.comp.changes[0].fileName, "uiChange5", "the comp change is stored");
			assert.strictEqual(oCachedData.appDescriptorChanges.length, 1, "one manifest change is stored");
			assert.strictEqual(oCachedData.appDescriptorChanges[0].fileName, "manifestChange1", "the manifest change is stored");
			assert.strictEqual(oCachedData.annotationChanges.length, 1, "one annotation change is stored");
			assert.strictEqual(oCachedData.annotationChanges[0].fileName, "annotationChange1", "the annotation change is stored");
			assert.strictEqual(oCachedData.ui2personalization, "newData", "the ui2 data is stored");

			// Step 2: update / delete some of the changes
			const aSecondUpdates = [
				oUIChange,
				oVariantDepUIChange,
				oVariantChange1,
				oVariantChange2
			].map((oChange) => {
				return {
					flexObject: oChange.convertToFileContent(),
					type: "delete"
				};
			});
			aSecondUpdates.push({
				type: "ui2",
				newData: "newData2"
			});
			const oUpdatedChange = oCompChange.convertToFileContent();
			oUpdatedChange.selector.persistencyKey = "bar";
			aSecondUpdates.push({
				type: "update",
				flexObject: oUpdatedChange
			});
			Loader.updateStorageResponse(sReference, aSecondUpdates);
			const oCachedData2 = Loader.getCachedFlexData(sReference).changes;
			assert.strictEqual(oCachedData2.changes.length, 0, "the UI change is deleted");
			assert.strictEqual(oCachedData2.variantDependentControlChanges.length, 0, "the variant dependent UI change is deleted");
			assert.strictEqual(oCachedData2.variantChanges.length, 0, "the variant change is deleted");
			assert.strictEqual(oCachedData2.variantManagementChanges.length, 0, "the variant management change is deleted");
			assert.strictEqual(oCachedData2.variants.length, 1, "the FL variant is still stored");
			assert.strictEqual(oCachedData2.comp.variants.length, 1, "the comp variant is still stored");
			assert.strictEqual(oCachedData2.comp.changes.length, 1, "the comp change is updated");
			assert.strictEqual(oCachedData2.comp.changes[0].fileName, "uiChange5", "the comp change is updated");
			assert.strictEqual(oCachedData2.comp.changes[0].selector.persistencyKey, "bar", "the comp change persistencyKey is updated");
			assert.strictEqual(oCachedData2.appDescriptorChanges.length, 1, "the manifest change is still stored");
			assert.strictEqual(oCachedData2.annotationChanges.length, 1, "the annotation change is still stored");
			assert.strictEqual(oCachedData2.ui2personalization, "newData2", "the ui2 data is updated");
		});

		QUnit.test("loadFlVariant with getIsVariantAuthorNameAvailable = true", async function(assert) {
			sandbox.stub(Storage, "loadFlVariant").resolves({
				variants: [
					FlexObjectFactory.createFlVariant({ id: "flVariant2" }).convertToFileContent(),
					FlexObjectFactory.createFlVariant({ id: "flVariant3" }).convertToFileContent()
				],
				variantChanges: [
					FlexObjectFactory.createUIChange({
						id: "uiChange3",
						fileType: "ctrl_variant_change"
					}).convertToFileContent()
				],
				variantDependentControlChanges: [
					FlexObjectFactory.createUIChange({
						id: "uiChange2",
						variantReference: "flVariant2"
					}).convertToFileContent()
				],
				variantManagementChanges: [
					FlexObjectFactory.createUIChange({
						id: "uiChange4",
						fileType: "ctrl_variant_management_change"
					}).convertToFileContent()
				]
			});

			Loader.updateStorageResponse(sReference, [
				{
					type: "add",
					flexObject: FlexObjectFactory.createFlVariant({ id: "flVariant1" }).convertToFileContent()
				}
			]);

			const oLoadedVariantData = await Loader.loadFlVariant({
				reference: sReference,
				variantReference: "flVariant1"
			});

			const oFlexData = Loader.getCachedFlexData(sReference);
			assert.deepEqual(oFlexData.changes, oLoadedVariantData.completeData.changes, "the cached data is correct");
			assert.strictEqual(oLoadedVariantData.newData.variants.length, 2, "the cached data contains two FL variants");
			assert.strictEqual(oLoadedVariantData.newData.variants[0].fileName, "flVariant2", "the first FL variant is the one requested");
			assert.strictEqual(oLoadedVariantData.newData.variants[1].fileName, "flVariant3", "the second FL variant is the one loaded from the backend");
			assert.strictEqual(oLoadedVariantData.newData.variantChanges.length, 1, "the cached data contains one variant change");
			assert.strictEqual(oLoadedVariantData.newData.variantChanges[0].fileName, "uiChange3", "the variant change is the one loaded from the backend");
			assert.strictEqual(oLoadedVariantData.newData.variantDependentControlChanges.length, 1, "the cached data contains one variant dependent control change");
			assert.strictEqual(oLoadedVariantData.newData.variantDependentControlChanges[0].fileName, "uiChange2", "the variant dependent control change is the one loaded from the backend");
			assert.strictEqual(oLoadedVariantData.newData.variantManagementChanges.length, 1, "the cached data contains one variant management change");
			assert.strictEqual(oLoadedVariantData.newData.variantManagementChanges[0].fileName, "uiChange4", "the variant management change is the one loaded from the backend");
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
