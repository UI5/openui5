/* global QUnit */

sap.ui.define([
	"sap/base/util/Deferred",
	"sap/base/util/merge",
	"sap/base/Log",
	"sap/ui/core/Manifest",
	"sap/ui/fl/apply/_internal/flexObjects/FlexObjectFactory",
	"sap/ui/fl/initial/_internal/FlexInfoSession",
	"sap/ui/fl/initial/_internal/Loader",
	"sap/ui/fl/initial/_internal/ManifestUtils",
	"sap/ui/fl/initial/_internal/Settings",
	"sap/ui/fl/initial/_internal/Storage",
	"sap/ui/fl/initial/_internal/StorageUtils",
	"sap/ui/fl/initial/api/Version",
	"sap/ui/thirdparty/sinon-4"
], function(
	Deferred,
	merge,
	Log,
	Manifest,
	FlexObjectFactory,
	FlexInfoSession,
	Loader,
	ManifestUtils,
	Settings,
	Storage,
	StorageUtils,
	Version,
	sinon
) {
	"use strict";

	var sandbox = sinon.createSandbox();
	const sReference = "my.reference";

	document.getElementById("qunit-fixture").style.display = "none";

	var oComponentData = {
		startupParameters: {
			hcpApplicationId: ["siteId"]
		}
	};

	function removeAllRtaRestartKeys() {
		Object.keys(window.sessionStorage)
		.filter((sKey) => sKey.startsWith("sap.ui.rta.restart."))
		.forEach((sKey) => window.sessionStorage.removeItem(sKey));
	}

	QUnit.module("Loader", {
		beforeEach() {
			removeAllRtaRestartKeys();
			this.oRawManifest = {
				_version: "2.0.0",
				property: "value",

				"sap.ui5": {
					componentName: "baseName"
				}
			};
			this.oManifest = new Manifest(this.oRawManifest);
			const oFlexDataResponse = {
				info: {
					foo: "bar",
					nonFavoriteVariantsRemoved: ["vmReference1"]
				},
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
				variantManagementChanges: [],
				cacheKey: "initialCacheKey"
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
			this.oGetCacheKeyStub = sandbox.stub(ManifestUtils, "getCacheKeyFromAsyncHints").returns("cacheKey");
			this.oLoadVariantsAuthorsStub = sandbox.stub(Storage, "loadVariantsAuthors").resolves("authors");
			this.oSettingsAuthorName = sandbox.stub().returns(true);
			sandbox.stub(Settings, "getInstance").resolves({
				getIsVariantAuthorNameAvailable: this.oSettingsAuthorName
			});
		},
		afterEach() {
			Loader.clearCache(sReference);
			sandbox.restore();
			FlexInfoSession.removeByReference(sReference);
			removeAllRtaRestartKeys();
		}
	}, function() {
		QUnit.test("when getFlexData is called with all information", async function(assert) {
			FlexInfoSession.setByReference({
				version: Version.Number.Draft,
				displayedAdaptationId: "id_1234"
			}, sReference);
			window.sessionStorage.setItem("sap.ui.rta.restart.CUSTOMER", true);

			var oExpectedProperties = {
				reference: sReference,
				componentName: "baseName",
				cacheKey: "cacheKey",
				siteId: "siteId",
				preview: undefined,
				appDescriptor: this.oRawManifest,
				version: Version.Number.Draft,
				adaptationId: "id_1234",
				skipLoadBundle: true,
				legacyBundleHandling: true
			};

			const oResult = await Loader.getFlexData({
				manifest: this.oManifest,
				otherValue: "a",
				reference: sReference,
				componentData: oComponentData,
				skipLoadBundle: true
			});

			assert.strictEqual(oResult.parameters.loaderCacheKey, "initialCacheKey", "a loader cache key is provided in the parameters");
			assert.deepEqual(oResult.data.changes, this.oExpectedFlexDataResponse, "the Loader loads data");
			assert.strictEqual(oResult.data.authors, "authors", "the authors are loaded");
			assert.strictEqual(this.oLoadFlexDataStub.callCount, 1, "the Storage.loadFlexData was called");
			assert.strictEqual(this.oCompleteFlexDataStub.callCount, 0, "the Storage.completeFlexData was not called");
			assert.strictEqual(this.oLoadFlexDataStub.getCall(0).args[0].siteId, "siteId", "the siteId was retrieved from the Utils");
			assert.strictEqual(this.oLoadFlexDataStub.getCall(0).args[0].skipLoadBundle, true, "the bundle loading was skipped");
			assert.strictEqual(
				this.oLoadFlexDataStub.getCall(0).args[0].legacyBundleHandling,
				true,
				"the legacyBundleHandling parameter is true"
			);
			assert.strictEqual(this.oLoadFlexDataStub.getCall(0).args[0].componentName, "baseName", "the name was retrieved via the Utils");
			assert.strictEqual(this.oGetCacheKeyStub.callCount, 1, "the cache key was retrieved from the Utils");
			assert.strictEqual(this.oLoadVariantsAuthorsStub.callCount, 1, "the loadVariantsAuthors was called");
			var mPassedPropertyBag = this.oLoadFlexDataStub.firstCall.args[0];
			assert.deepEqual(mPassedPropertyBag, oExpectedProperties, "and is the property bag");

			const oFlexData = Loader.getCachedFlexData(sReference);
			assert.deepEqual(oFlexData, oResult, "the cached data is correct");

			const oFlexInfoSession = FlexInfoSession.getByReference(sReference);
			assert.strictEqual(oFlexInfoSession.foo, "bar", "the info is stored in the FlexInfoSession");
			assert.deepEqual(
				oResult.parameters.nonFavoriteVariantsRemoved,
				["vmReference1"],
				"the nonFavoriteVariantsRemoved are exposed in the loader parameters"
			);
		});

		QUnit.test("when getFlexData is called and info does not contain nonFavoriteVariantsRemoved", async function(assert) {
			const oFlexDataWithoutInfo = {
				...StorageUtils.getEmptyFlexDataResponse(),
				cacheKey: "cacheKeyWithoutInfo"
			};
			this.oLoadFlexDataStub.callsFake(() => Promise.resolve(oFlexDataWithoutInfo));

			const oResult = await Loader.getFlexData({
				manifest: this.oManifest,
				reference: sReference,
				componentData: oComponentData
			});

			assert.deepEqual(
				oResult.parameters.nonFavoriteVariantsRemoved,
				[],
				"then nonFavoriteVariantsRemoved defaults to an empty array"
			);
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
			assert.deepEqual(oFlexData2, oFlexData, "both calls return the same data");
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
			const oFlexDataPromise = Loader.getFlexData({
				manifest: this.oManifest,
				reference: sReference,
				componentData: oComponentData
			});

			const oFlexData2 = await Loader.getFlexData({
				manifest: this.oManifest,
				reference: sReference,
				componentData: oComponentData
			});
			assert.deepEqual(oFlexData2.data.changes, this.oExpectedCompleteFlexDataResponse, "the Loader loads data");

			await Loader.waitForInitialization(sReference);
			const oFlexData = await oFlexDataPromise;
			assert.deepEqual(oFlexData.data.changes, this.oExpectedCompleteFlexDataResponse, "the Loader loads data");
			assert.strictEqual(this.oLoadFlexDataStub.callCount, 1, "the Storage.loadFlexData was called once");
			assert.strictEqual(this.oLoadVariantsAuthorsStub.callCount, 1, "the loadVariantsAuthors was called once");
		});

		QUnit.test("when waitForInitialization is called without a getFlexData call before", async function(assert) {
			const oLogStub = sandbox.stub(Log, "error");
			await Loader.waitForInitialization(sReference);
			assert.strictEqual(oLogStub.callCount, 1, "an error is logged");
		});

		QUnit.test("when getFlexData is called three times without await", async function(assert) {
			const oDeferred = new Deferred();
			const oDeferred2 = new Deferred();
			this.oLoadFlexDataStub.reset();
			this.oLoadFlexDataStub
			.onFirstCall().callsFake(() => {
				return oDeferred.promise;
			})
			.onSecondCall().callsFake(() => {
				return oDeferred2.promise;
			})
			.onThirdCall().resolves(StorageUtils.getEmptyFlexDataResponse());

			Loader.getFlexData({
				manifest: {
					_version: "2.0.0",
					...this.oManifestRaw,

					"sap.ui5": {
						componentName: "firstCall"
					}
				},
				reference: sReference,
				componentData: oComponentData
			});

			Loader.getFlexData({
				manifest: {
					_version: "2.0.0",
					...this.oManifestRaw,

					"sap.ui5": {
						componentName: "secondCall"
					}
				},
				reInitialize: true,
				reference: sReference,
				componentData: oComponentData
			});

			Loader.getFlexData({
				manifest: {
					_version: "2.0.0",
					...this.oManifestRaw,

					"sap.ui5": {
						componentName: "thirdCall"
					}
				},
				reInitialize: true,
				reference: sReference,
				componentData: oComponentData
			});
			oDeferred.resolve(StorageUtils.getEmptyFlexDataResponse());
			oDeferred2.resolve(StorageUtils.getEmptyFlexDataResponse());

			await Loader.waitForInitialization(sReference);
			assert.strictEqual(this.oLoadFlexDataStub.callCount, 3, "the Storage.loadFlexData was called three times");
			assert.strictEqual(this.oLoadFlexDataStub.firstCall.args[0].componentName, "firstCall", "the order of calls is correct");
			assert.strictEqual(this.oLoadFlexDataStub.secondCall.args[0].componentName, "secondCall", "the order of calls is correct");
			assert.strictEqual(this.oLoadFlexDataStub.thirdCall.args[0].componentName, "thirdCall", "the order of calls is correct");
			assert.strictEqual(this.oLoadVariantsAuthorsStub.callCount, 3, "the loadVariantsAuthors was called three times");
			assert.strictEqual(this.oGetCacheKeyStub.callCount, 1, "the cache key is only fetched once");
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
			assert.strictEqual(
				this.oCompleteFlexDataStub.firstCall.args[0].legacyBundleHandling,
				true,
				"the legacyBundleHandling parameter is passed with value 'true' to completeFlexData"
			);
		});

		QUnit.test("when getFlexData is first called without skipLoadBundle, then with", async function(assert) {
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

		QUnit.test("when getFlexData is called with the same allContextsProvided", async function(assert) {
			FlexInfoSession.setByReference({
				allContextsProvided: true
			}, sReference);
			window.sessionStorage.setItem("sap.ui.rta.restart.CUSTOMER", true);

			await Loader.getFlexData({
				manifest: this.oManifest,
				reference: sReference,
				componentData: oComponentData
			});

			FlexInfoSession.setByReference({
				allContextsProvided: true
			}, sReference);
			const oFlexData2 = await Loader.getFlexData({
				manifest: this.oManifest,
				reference: sReference,
				componentData: oComponentData
			});
			assert.deepEqual(oFlexData2.data.changes, this.oExpectedCompleteFlexDataResponse, "the Loader loads data");
			assert.strictEqual(this.oLoadFlexDataStub.callCount, 1, "the Storage.loadFlexData was called only once");
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
			window.sessionStorage.setItem("sap.ui.rta.restart.CUSTOMER", true);

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
				skipLoadBundle: undefined,
				legacyBundleHandling: true
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
			assert.strictEqual(this.oLoadFlexDataStub.getCall(0).args[0].componentName, "baseName", "the name was retrieved via the Utils");
			assert.strictEqual(this.oGetCacheKeyStub.callCount, 1, "the cache key was retrieved from the Utils");
			assert.deepEqual(this.oLoadFlexDataStub.firstCall.args[0], oExpectedProperties, "the first argument are the properties");
		});

		QUnit.test("when getFlexData is called with an emptyState available", async function(assert) {
			Loader.initializeEmptyCache(sReference);
			await Loader.getFlexData({
				manifest: this.oManifest,
				reference: sReference,
				componentData: oComponentData
			});
			assert.strictEqual(this.oLoadFlexDataStub.callCount, 1, "the Storage.loadFlexData was called");
		});

		QUnit.test("when getFlexData is called with sap.ui.rta.restart, saveChangeKeepSession not set and an empty _mCachedFlexData", async function(assert) {
			const sVersionID = "versionID";
			FlexInfoSession.setByReference({
				allContextsProvided: false,
				version: sVersionID
			}, sReference);

			let oFlexInfoSession = FlexInfoSession.getByReference(sReference);
			assert.strictEqual(oFlexInfoSession.allContextsProvided, false, "the FlexInfoSession is set before getFlexData");
			assert.strictEqual(oFlexInfoSession.version, sVersionID, "the FlexInfoSession is set before getFlexData");

			await Loader.getFlexData({
				manifest: this.oManifest,
				reference: sReference,
				componentData: oComponentData
			});

			assert.strictEqual(this.oLoadFlexDataStub.getCalls().length, 1, "the flex data request is called once");
			assert.strictEqual(this.oLoadFlexDataStub.getCall(0).args[0].version, undefined, "the version is undefined to loadFlexData");
			oFlexInfoSession = FlexInfoSession.getByReference(sReference);
			assert.deepEqual(oFlexInfoSession, {
				foo: "bar",
				nonFavoriteVariantsRemoved: ["vmReference1"]
			}, "the FlexInfoSession is cleared before filled with flex data content");
		});

		QUnit.test("when getFlexData is called with sap.ui.rta.restart, saveChangeKeepSession not set and filled _mCachedFlexData", async function(assert) {
			await Loader.getFlexData({
				manifest: this.oManifest,
				reference: sReference,
				componentData: oComponentData
			});

			let oFlexInfoSession = FlexInfoSession.getByReference(sReference);
			oFlexInfoSession.key = "value";
			FlexInfoSession.setByReference(oFlexInfoSession, sReference);

			assert.strictEqual(this.oLoadFlexDataStub.getCalls().length, 1, "the flex data request is called once");
			assert.strictEqual(oFlexInfoSession.foo, "bar", "the FlexInfoSession is set before getFlexData");
			assert.strictEqual(oFlexInfoSession.key, "value", "the FlexInfoSession is set before getFlexData");

			await Loader.getFlexData({
				manifest: this.oManifest,
				reference: sReference,
				componentData: oComponentData
			});

			oFlexInfoSession = FlexInfoSession.getByReference(sReference);
			assert.strictEqual(this.oLoadFlexDataStub.getCalls().length, 1, "the flex data request is called once");
			assert.deepEqual(oFlexInfoSession, {
				foo: "bar",
				key: "value",
				nonFavoriteVariantsRemoved: ["vmReference1"]
			}, "the FlexInfoSession is not cleared");
		});

		QUnit.test("when getFlexData is called with sap.ui.rta.restart set, saveChangeKeepSession not set and empty _mCachedFlexData", async function(assert) {
			const sVersionID = "versionID";
			window.sessionStorage.setItem("sap.ui.rta.restart.CUSTOMER", true);
			FlexInfoSession.setByReference({
				allContextsProvided: false,
				version: sVersionID
			}, sReference);

			let oFlexInfoSession = FlexInfoSession.getByReference(sReference);
			assert.strictEqual(oFlexInfoSession.allContextsProvided, false, "the FlexInfoSession is set before getFlexData");
			assert.strictEqual(oFlexInfoSession.version, sVersionID, "the FlexInfoSession is set before getFlexData");

			await Loader.getFlexData({
				manifest: this.oManifest,
				reference: sReference,
				componentData: oComponentData
			});

			oFlexInfoSession = FlexInfoSession.getByReference(sReference);
			assert.strictEqual(this.oLoadFlexDataStub.getCalls().length, 1, "the flex data request is called once");
			assert.strictEqual(this.oLoadFlexDataStub.getCall(0).args[0].version, "versionID", "the version is undefined to loadFlexData");
			assert.deepEqual(oFlexInfoSession,
				{
					allContextsProvided: false,
					version: sVersionID,
					foo: "bar",
					nonFavoriteVariantsRemoved: ["vmReference1"]
				}, "the FlexInfoSession is not cleared before filled again");
		});

		QUnit.test("when getFlexData is called with sap.ui.rta.restart is not set, saveChangeKeepSession set and empty _mCachedFlexData", async function(assert) {
			const sVersionID = "versionID";
			FlexInfoSession.setByReference({
				allContextsProvided: false,
				version: sVersionID,
				saveChangeKeepSession: true
			}, sReference);

			let oFlexInfoSession = FlexInfoSession.getByReference(sReference);
			assert.strictEqual(oFlexInfoSession.allContextsProvided, false, "the FlexInfoSession is set before getFlexData");
			assert.strictEqual(oFlexInfoSession.version, sVersionID, "the FlexInfoSession is set before getFlexData");
			assert.strictEqual(oFlexInfoSession.saveChangeKeepSession, true, "the FlexInfoSession is set before getFlexData");

			await Loader.getFlexData({
				manifest: this.oManifest,
				reference: sReference,
				componentData: oComponentData
			});

			oFlexInfoSession = FlexInfoSession.getByReference(sReference);
			assert.strictEqual(this.oLoadFlexDataStub.getCalls().length, 1, "the flex data request is called once");
			assert.strictEqual(this.oLoadFlexDataStub.getCall(0).args[0].version, sVersionID, "the version is undefined to loadFlexData");
			assert.deepEqual(oFlexInfoSession,
				{
					allContextsProvided: false,
					version: sVersionID,
					foo: "bar",
					saveChangeKeepSession: true,
					nonFavoriteVariantsRemoved: ["vmReference1"]
				}, "the FlexInfoSession is not cleared before filled again");
		});

		QUnit.test("when getFlexData is called with sap.ui.rta.restart, saveChangeKeepSession set and filled _mCachedFlexData", async function(assert) {
			const sVersionID = "versionID";
			await Loader.getFlexData({
				manifest: this.oManifest,
				reference: sReference,
				componentData: oComponentData
			});

			window.sessionStorage.setItem("sap.ui.rta.restart.CUSTOMER", true);
			FlexInfoSession.setByReference({
				allContextsProvided: false,
				version: sVersionID,
				saveChangeKeepSession: true
			}, sReference);

			let oFlexInfoSession = FlexInfoSession.getByReference(sReference);
			assert.strictEqual(oFlexInfoSession.allContextsProvided, false, "the FlexInfoSession is set before getFlexData");
			assert.strictEqual(oFlexInfoSession.version, sVersionID, "the FlexInfoSession is set before getFlexData");
			assert.strictEqual(oFlexInfoSession.saveChangeKeepSession, true, "the FlexInfoSession is set before getFlexData");

			await Loader.getFlexData({
				manifest: this.oManifest,
				reference: sReference,
				componentData: oComponentData
			});

			assert.strictEqual(this.oLoadFlexDataStub.getCalls().length, 2, "the flex data request is called twice");
			assert.strictEqual(this.oLoadFlexDataStub.getCall(1).args[0].version, sVersionID, "the flex data request is called with versionID");
			oFlexInfoSession = FlexInfoSession.getByReference(sReference);
			assert.deepEqual(oFlexInfoSession,
				{
					allContextsProvided: false,
					version: sVersionID,
					foo: "bar",
					saveChangeKeepSession: true,
					nonFavoriteVariantsRemoved: ["vmReference1"]
				}, "the FlexInfoSession is not cleared before filled again");
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
			QUnit.test(`when getFlexData is called with a ovp app and ${oTestData.details}`, async function(assert) {
				var mPropertyBag = {
					manifest: oTestData.manifest,
					otherValue: "a",
					reference: sReference,
					componentData: oComponentData
				};

				const oResult = await Loader.getFlexData(mPropertyBag);
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

		QUnit.test("when getFlexData is called with getIsVariantAuthorNameAvailable = false", async function(assert) {
			this.oSettingsAuthorName.reset();
			this.oSettingsAuthorName.returns(false);

			const oResult = await Loader.getFlexData({
				manifest: this.oManifest,
				otherValue: "a",
				reference: sReference,
				componentData: oComponentData
			});
			assert.deepEqual(oResult.data.authors, {}, "the authors are empty");
		});

		QUnit.test("when getFlexData is called twice with flexBundle 'true' in the manifest", async function(assert) {
			sandbox.stub(ManifestUtils, "getFlexBundleEntry").returns(true);
			let oResult = await Loader.getFlexData({
				manifest: this.oManifest,
				reference: sReference,
				componentData: oComponentData,
				skipLoadBundle: true
			});
			assert.deepEqual(oResult.data.changes, this.oExpectedCompleteFlexDataResponse, "the Loader loads data");
			assert.strictEqual(
				this.oLoadFlexDataStub.firstCall.args[0].skipLoadBundle,
				false,
				"the skipLoadBundle parameter is passed to loadFlexData and is adjusted as flex bundle is 'true' in the manifest"
			);
			assert.strictEqual(
				this.oLoadFlexDataStub.firstCall.args[0].legacyBundleHandling,
				false,
				"the legacyBundleHandling parameter is passed to loadFlexData"
			);

			oResult = await Loader.getFlexData({
				manifest: this.oManifest,
				reference: sReference,
				componentData: oComponentData
			});
			assert.deepEqual(oResult.data.changes, this.oExpectedCompleteFlexDataResponse, "the Loader loads data");
			assert.strictEqual(this.oLoadFlexDataStub.callCount, 1, "the Storage.loadFlexData wasn't called second time");
			assert.strictEqual(this.oCompleteFlexDataStub.callCount, 0, "the Storage.completeFlexData wasn't called");
		});

		QUnit.test("When getFlexData is called twice with flexBundle 'false' in the manifest", async function(assert) {
			sandbox.stub(ManifestUtils, "getFlexBundleEntry").returns(false);
			let oResult = await Loader.getFlexData({
				manifest: this.oManifest,
				reference: sReference,
				componentData: oComponentData,
				skipLoadBundle: true
			});
			assert.deepEqual(oResult.data.changes, this.oExpectedFlexDataResponse, "the Loader loads data");
			assert.strictEqual(this.oLoadFlexDataStub.callCount, 1, "the Storage.loadFlexData was called once");
			assert.strictEqual(
				this.oLoadFlexDataStub.firstCall.args[0].skipLoadBundle,
				true,
				"the skipLoadBundle parameter is passed to loadFlexData and is adjusted as flex bundle is 'false' in the manifest"
			);
			assert.strictEqual(
				this.oLoadFlexDataStub.firstCall.args[0].legacyBundleHandling,
				false,
				"the legacyBundleHandling parameter is passed to loadFlexData"
			);

			oResult = await Loader.getFlexData({
				manifest: this.oManifest,
				reference: sReference,
				componentData: oComponentData
			});
			assert.deepEqual(oResult.data.changes, this.oExpectedFlexDataResponse, "the Loader loads data");
			assert.strictEqual(this.oLoadFlexDataStub.callCount, 1, "the Storage.loadFlexData wasn't called second time");
			assert.strictEqual(this.oCompleteFlexDataStub.callCount, 0, "the Storage.completeFlexData wasn't called");
		});

		QUnit.test("When getFlexData is called twice with updateCachedResponse in between", async function(assert) {
			await Loader.getFlexData({
				manifest: this.oManifest,
				reference: sReference,
				componentData: oComponentData
			});
			assert.strictEqual(this.oGetCacheKeyStub.callCount, 1, "the cache key is retrieved once");

			Loader.updateCachedResponse(sReference, []);

			// trigger a new load of flex data by changing the version in the FlexInfoSession
			FlexInfoSession.setByReference({
				version: Version.Number.Draft
			}, sReference);

			await Loader.getFlexData({
				manifest: this.oManifest,
				reference: sReference,
				componentData: oComponentData
			});
			assert.strictEqual(this.oGetCacheKeyStub.callCount, 1, "the cache key is not retrieved again");
			assert.strictEqual(
				this.oLoadFlexDataStub.getCall(1).args[0].cacheKey, undefined,
				"the cache key is undefined after the cached response is updated (token invalidated)"
			);
		});
	});

	QUnit.module("Given new connector configuration in bootstrap", {
		beforeEach() {
			this.oRawManifest = {
				property: "value"
			};
			this.oManifest = new Manifest(this.oRawManifest);
			sandbox.stub(Settings, "getInstance").resolves({
				getIsVariantAuthorNameAvailable() {
					return false;
				}
			});
		},
		afterEach() {
			Loader.clearCache();
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

	QUnit.module("misc", {
		beforeEach() {
			this.oFlexDataResponse = {
				appDescriptorChanges: [
					{ changeType: "changeType", fileName: "appDescriptorChange1" },
					{ changeType: "changeType", fileName: "appDescriptorChange$" }
				],
				annotationChanges: [
					{ changeType: "changeType", fileName: "annotationChange1" },
					{ changeType: "changeType", fileName: "annotationChange%" }
				],
				changes: [
					{ changeType: "changeType", fileName: "change1" },
					{ changeType: "changeType", fileName: "change&" }
				],
				compVariants: [
					{ changeType: "changeType", fileName: "variant1" },
					{ changeType: "changeType", fileName: "variant@" }
				],
				variants: [
					{ changeType: "changeType", fileName: "variant1" },
					{ changeType: "changeType", fileName: "variant@" }
				],
				variantChanges: [
					{ changeType: "changeType", fileName: "variantChange1" },
					{ changeType: "changeType", fileName: "variantChange#" }
				],
				variantDependentControlChanges: [
					{ changeType: "changeType", fileName: "varDepControlChange1" },
					{ changeType: "changeType", fileName: "varDepControlChange$" }
				],
				variantManagementChanges: [
					{ changeType: "changeType", fileName: "variantManagementChange1" },
					{ changeType: "changeType", fileName: "variantManagementChange%" }
				]
			};
			this.oLoadFlexDataStub = sandbox.stub(Storage, "loadFlexData").resolves(this.oFlexDataResponse);
			sandbox.stub(ManifestUtils, "getBaseComponentNameFromManifest").returns("baseName");
			sandbox.stub(Settings, "getInstance").resolves({
				getIsVariantAuthorNameAvailable() {
					return false;
				}
			});
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
			assert.strictEqual(oResult.data.changes.compVariants.length, 1, "the compVariants are filtered");
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
			assert.strictEqual(oResult.data.changes.compVariants.length, 1, "the compVariants are filtered");
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

		QUnit.test("getCachedFlexData result can't be mutated", async function(assert) {
			await Loader.getFlexData({
				manifest: this.oManifest,
				reference: sReference
			});
			const oFlexData1 = Loader.getCachedFlexData(sReference);
			oFlexData1.data.changes.variants = [];
			oFlexData1.data.changes.changes[0].fileName = "mutatedFileName";

			const oFlexData2 = Loader.getCachedFlexData(sReference);
			assert.strictEqual(oFlexData2.data.changes.variants.length, 1, "the variants are not mutated");
			assert.strictEqual(oFlexData2.data.changes.changes[0].fileName, "change1", "the changes are not mutated");
		});
	});

	QUnit.module("Loader with an empty cache", {
		async beforeEach() {
			sandbox.stub(Settings, "getInstance").resolves({
				getIsVariantAuthorNameAvailable() {
					return false;
				}
			});
			const oInitialState = await Loader.initializeEmptyCache(sReference);
			this.sInitialLoaderCacheKey = oInitialState.parameters.loaderCacheKey;
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
			Loader.updateCachedResponse(sReference, aUpdates);
			const oCachedData = Loader.getCachedFlexData(sReference).data.changes;
			assert.strictEqual(oCachedData.changes.length, 2, "two UI changes are stored");
			assert.strictEqual(oCachedData.changes[0].fileName, "uiChange1", "the UI change is stored");
			assert.strictEqual(oCachedData.changes[1].fileName, "uiChange5", "the comp change is stored");
			assert.strictEqual(oCachedData.variantDependentControlChanges.length, 1, "one variant dependent UI change is stored");
			assert.strictEqual(oCachedData.variantDependentControlChanges[0].fileName, "uiChange2", "the variant dependent UI change is stored");
			assert.strictEqual(oCachedData.variantChanges.length, 1, "one variant change is stored");
			assert.strictEqual(oCachedData.variantChanges[0].fileName, "uiChange3", "the variant change is stored");
			assert.strictEqual(oCachedData.variantManagementChanges.length, 1, "one variant management change is stored");
			assert.strictEqual(oCachedData.variantManagementChanges[0].fileName, "uiChange4", "the variant management change is stored");
			assert.strictEqual(oCachedData.variants.length, 1, "one FL variant is stored");
			assert.strictEqual(oCachedData.variants[0].fileName, "flVariant1", "the FL variant is stored");
			assert.strictEqual(oCachedData.compVariants.length, 1, "one comp variant is stored");
			assert.strictEqual(oCachedData.compVariants[0].fileName, "compVariant1", "the comp variant is stored");
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
			Loader.updateCachedResponse(sReference, aSecondUpdates);
			const oCachedData2 = Loader.getCachedFlexData(sReference).data.changes;
			assert.strictEqual(oCachedData2.changes.length, 1, "the comp change is updated, the other UI change is deleted");
			assert.strictEqual(oCachedData2.changes[0].fileName, "uiChange5", "the comp change is updated");
			assert.strictEqual(oCachedData2.changes[0].selector.persistencyKey, "bar", "the comp change persistencyKey is updated");
			assert.strictEqual(oCachedData2.variantDependentControlChanges.length, 0, "the variant dependent UI change is deleted");
			assert.strictEqual(oCachedData2.variantChanges.length, 0, "the variant change is deleted");
			assert.strictEqual(oCachedData2.variantManagementChanges.length, 0, "the variant management change is deleted");
			assert.strictEqual(oCachedData2.variants.length, 1, "the FL variant is still stored");
			assert.strictEqual(oCachedData2.compVariants.length, 1, "the comp variant is still stored");
			assert.strictEqual(oCachedData2.appDescriptorChanges.length, 1, "the manifest change is still stored");
			assert.strictEqual(oCachedData2.annotationChanges.length, 1, "the annotation change is still stored");
			assert.strictEqual(oCachedData2.ui2personalization, "newData2", "the ui2 data is updated");
		});
	});
});