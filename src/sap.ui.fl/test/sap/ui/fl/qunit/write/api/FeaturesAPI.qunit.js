/* global QUnit */

sap.ui.define([
	"sap/base/Log",
	"sap/ui/fl/initial/api/InitialFlexAPI",
	"sap/ui/fl/initial/_internal/Settings",
	"sap/ui/fl/write/_internal/Storage",
	"sap/ui/fl/write/api/FeaturesAPI",
	"sap/ui/fl/Layer",
	"sap/ui/fl/Utils",
	"sap/ui/model/odata/v2/ODataModel",
	"sap/ui/thirdparty/sinon-4"
], function(
	Log,
	InitialFlexAPI,
	Settings,
	Storage,
	FeaturesAPI,
	Layer,
	Utils,
	ODataV2Model,
	sinon
) {
	"use strict";

	var sandbox = sinon.createSandbox();

	QUnit.module("Given FeaturesAPI", {
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		[true, false].forEach(function(bValueToBeSet) {
			QUnit.test(`when isPublishAvailable() is called for ${bValueToBeSet ? "a" : "not a"} productive system with transports and no publish available info`, async function(assert) {
				sandbox.stub(Settings, "getInstance").resolves(new Settings({
					isProductiveSystem: bValueToBeSet,
					isPublishAvailable: false,
					system: "dummySystem",
					client: "dummyClient"
				}));

				const bIsPublishAvailable = await FeaturesAPI.isPublishAvailable();
				assert.strictEqual(bIsPublishAvailable, !bValueToBeSet, `then ${!bValueToBeSet} is returned`);
			});

			QUnit.test(`when isPublishAvailable() is called for ${bValueToBeSet ? "a" : "not a"} productive system without transports and no publish available info`, async function(assert) {
				sandbox.stub(Settings, "getInstance").resolves(new Settings({
					isProductiveSystem: bValueToBeSet,
					isPublishAvailable: false
				}));

				const bIsPublishAvailable = await FeaturesAPI.isPublishAvailable();
				assert.notOk(bIsPublishAvailable, "then false is returned");
			});

			QUnit.test(`when isPublishAvailable() is called for ${bValueToBeSet ? "a" : "not a"} productive system with transports and publish available info`, async function(assert) {
				sandbox.stub(Settings, "getInstance").resolves(new Settings({
					isProductiveSystem: bValueToBeSet,
					isPublishAvailable: true,
					system: "dummySystem",
					client: "dummyClient"
				}));

				const bIsPublishAvailable = await FeaturesAPI.isPublishAvailable();
				assert.ok(bIsPublishAvailable, "then true is returned");
			});

			QUnit.test(`when isPublishAvailable() is called for ${bValueToBeSet ? "a" : "not a"} productive system without transports and publish available info`, async function(assert) {
				sandbox.stub(Settings, "getInstance").resolves(new Settings({
					isProductiveSystem: bValueToBeSet,
					isPublishAvailable: true
				}));

				const bIsPublishAvailable = await FeaturesAPI.isPublishAvailable();
				assert.ok(bIsPublishAvailable, "then true is returned");
			});

			QUnit.test(`when isSaveAsAvailable() is called for ${bValueToBeSet ? "not a" : "a"} steampunk system`, function(assert) {
				sandbox.stub(Settings, "getInstance").resolves({
					getIsAppVariantSaveAsEnabled() {
						return bValueToBeSet;
					},
					getIsContextBasedAdaptationEnabled() {
						return false;
					}
				});

				sandbox.stub(Utils, "getUShellService").withArgs("Navigation").returns(Promise.resolve("DummyService"));

				return FeaturesAPI.isSaveAsAvailable(Layer.CUSTOMER).then(function(bReturnValue) {
					assert.strictEqual(bReturnValue, bValueToBeSet, `then ${bValueToBeSet} is returned`);
				});
			});

			QUnit.test(`when isSaveAsAvailable() is called for ${bValueToBeSet ? "not a" : "a"} steampunk system and standalone app without Navigation service`, function(assert) {
				sandbox.stub(Settings, "getInstance").resolves({
					getIsAppVariantSaveAsEnabled() {
						return bValueToBeSet;
					}
				});

				sandbox.stub(Utils, "getUShellService").withArgs("Navigation").returns(Promise.reject(new Error("DummyService")));

				return FeaturesAPI.isSaveAsAvailable(Layer.CUSTOMER).then(function(bReturnValue) {
					assert.strictEqual(bReturnValue, false, "then false is returned");
				});
			});

			QUnit.test(`when isKeyUser() is called for ${bValueToBeSet ? "a" : "not a"} key user`, function(assert) {
				sandbox.stub(InitialFlexAPI, "isKeyUser").resolves(bValueToBeSet);
				return FeaturesAPI.isKeyUser()
				.then(function(bReturnValue) {
					assert.strictEqual(bReturnValue, bValueToBeSet, `then ${bValueToBeSet} is returned`);
				});
			});

			QUnit.test(`when isKeyUserTranslationEnabled() is called for ${bValueToBeSet ? "a" : "not a"} admin key user`, function(assert) {
				sandbox.stub(Settings, "getInstance").resolves({
					getIsKeyUserTranslationEnabled() {
						return bValueToBeSet;
					}
				});
				return FeaturesAPI.isKeyUserTranslationEnabled(Layer.CUSTOMER)
				.then(function(bReturnValue) {
					assert.strictEqual(bReturnValue, bValueToBeSet, `then ${bValueToBeSet} is returned`);
				});
			});

			QUnit.test(`when isVersioningEnabled(sLayer) is called in a ${
				bValueToBeSet ? "draft enabled" : "non draft enabled"} layer`, async function(assert) {
				sandbox.stub(Settings, "getInstance").resolves({
					getIsVersioningEnabled: () => bValueToBeSet
				});
				const bVersioningEnabled1 = await FeaturesAPI.isVersioningEnabled(Layer.CUSTOMER);
				assert.strictEqual(bVersioningEnabled1, bValueToBeSet, `then ${bValueToBeSet} is returned`);

				const bVersioningEnabled2 = await FeaturesAPI.isVersioningEnabled(Layer.USER);
				assert.strictEqual(bVersioningEnabled2, false, "then false is returned");
			});

			QUnit.test(`when getSeenFeatureIds is called with the feature ${bValueToBeSet ? "enabled" : "disabled"}`, async function(assert) {
				sandbox.stub(Settings, "getInstance").resolves({
					getIsSeenFeaturesAvailable() {
						return bValueToBeSet;
					}
				});
				const oStorageStub = sandbox.stub(Storage, "getSeenFeatureIds").resolves(["feature1"]);
				const oSeenFeatures = await FeaturesAPI.getSeenFeatureIds({ layer: Layer.CUSTOMER });
				assert.deepEqual(oSeenFeatures, bValueToBeSet ? ["feature1"] : [], "then the correct seen features are returned");
				if (bValueToBeSet) {
					assert.strictEqual(oStorageStub.getCall(0).args[0].layer, Layer.CUSTOMER, "the correct layer is passed");
				}
			});

			QUnit.test(`when setSeenFeatureIds is called with the feature ${bValueToBeSet ? "enabled" : "disabled"}`, async function(assert) {
				sandbox.stub(Settings, "getInstance").resolves({
					getIsSeenFeaturesAvailable() {
						return bValueToBeSet;
					}
				});
				const oStorageStub = sandbox.stub(Storage, "setSeenFeatureIds").resolves(["feature1"]);
				let oResult;
				try {
					oResult = await FeaturesAPI.setSeenFeatureIds({
						layer: Layer.CUSTOMER,
						seenFeatureIds: ["feature1"]
					});
				} catch (oError) {
					oResult = oError.message;
				}
				assert.deepEqual(oResult,
					bValueToBeSet ? ["feature1"] : "The backend does not support saving seen features.",
					"then the correct seen features are returned"
				);
				if (bValueToBeSet) {
					assert.strictEqual(oStorageStub.getCall(0).args[0].layer, Layer.CUSTOMER, "the correct layer is passed");
					assert.deepEqual(oStorageStub.getCall(0).args[0].seenFeatureIds, ["feature1"], "the correct list is passed");
				}
			});
		});
	});

	QUnit.module("areAnnotationChangesEnabled", {
		beforeEach() {
			this.oIsManifestModelStub = sandbox.stub();
			sandbox.stub(Utils, "getComponentForControl").returns({
				_isManifestModel: this.oIsManifestModelStub
			});
			this.oAnnotationSetting = true;
			sandbox.stub(Settings, "getInstanceOrUndef").returns({
				getIsAnnotationChangeEnabled: () => this.oAnnotationSetting
			});
		},
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when areAnnotationChangesEnabled is called with settings already loaded, and a model that exists in manifest", function(assert) {
			this.oIsManifestModelStub.returns(true);
			const bIsEnabled = FeaturesAPI.areAnnotationChangesEnabled({}, {});
			assert.strictEqual(bIsEnabled, true, "then 'true' is returned");
		});

		QUnit.test("when areAnnotationChangesEnabled is called with settings already loaded, and a model that exists in an outer appComponent", function(assert) {
			this.oIsManifestModelStub
			.onFirstCall().returns(false)
			.onSecondCall().returns(true);
			sandbox.stub(Utils, "isApplicationComponent").returns(false);
			const bIsEnabled = FeaturesAPI.areAnnotationChangesEnabled({}, {});
			assert.strictEqual(bIsEnabled, true, "then 'true' is returned");
		});

		QUnit.test("when areAnnotationChangesEnabled is called with settings already loaded, and a model that does not exist in manifest and no app component", function(assert) {
			this.oIsManifestModelStub.returns(false);
			sandbox.stub(Utils, "isApplicationComponent").returns(false);
			sandbox.stub(Utils, "getAppComponentForControl").returns();
			const bIsEnabled = FeaturesAPI.areAnnotationChangesEnabled({}, {});
			assert.strictEqual(bIsEnabled, false, "then 'false' is returned");
			assert.strictEqual(this.oIsManifestModelStub.callCount, 1, "then _isManifestModel is called once");
		});

		QUnit.test("when areAnnotationChangesEnabled is called with settings loaded, and control/model parameters are missing", function(assert) {
			const bIsEnabled = FeaturesAPI.areAnnotationChangesEnabled();
			assert.strictEqual(bIsEnabled, true, "then 'true' is returned");
			assert.strictEqual(this.oIsManifestModelStub.callCount, 0, "then _isManifestModel is not called");
		});

		QUnit.test("when areAnnotationChangesEnabled is called without settings loaded, but with control and model parameters", function(assert) {
			Settings.getInstanceOrUndef.restore();
			sandbox.stub(Settings, "getInstanceOrUndef").returns();
			this.oIsManifestModelStub.returns(true);
			const bIsEnabled = FeaturesAPI.areAnnotationChangesEnabled({}, {});
			assert.strictEqual(bIsEnabled, false, "then 'false' is returned");
			assert.strictEqual(this.oIsManifestModelStub.callCount, 0, "then _isManifestModel is not called");
		});

		QUnit.test("when areAnnotationChangesEnabled is called without settings loaded, and control/model parameters are missing", function(assert) {
			Settings.getInstanceOrUndef.restore();
			sandbox.stub(Settings, "getInstanceOrUndef").returns();
			this.oIsManifestModelStub.returns(true);
			const bIsEnabled = FeaturesAPI.areAnnotationChangesEnabled();
			assert.strictEqual(bIsEnabled, false, "then 'false' is returned");
			assert.strictEqual(this.oIsManifestModelStub.callCount, 0, "then _isManifestModel is not called");
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});