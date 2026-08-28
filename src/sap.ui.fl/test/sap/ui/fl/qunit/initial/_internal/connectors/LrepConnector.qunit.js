/* global QUnit */

sap.ui.define([
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/fl/initial/_internal/connectors/LrepConnector",
	"sap/ui/fl/initial/_internal/connectors/Utils",
	"sap/ui/fl/initial/_internal/FlexInfoSession",
	"sap/ui/fl/initial/_internal/StorageUtils",
	"sap/ui/fl/Layer"
], function(
	sinon,
	LrepConnector,
	InitialUtils,
	FlexInfoSession,
	StorageUtils,
	Layer
) {
	"use strict";

	var sandbox = sinon.createSandbox();
	const oFLVariantServerResponse = {
		variants: [],
		variantChanges: [],
		variantDependentControlChanges: []
	};

	const oCompVariantServerResponse = {
		changes: [],
		compVariants: []
	};

	function fnReturnData(nStatus, oHeader, sBody) {
		sandbox.server.respondWith(function(request) {
			request.respond(nStatus, oHeader, sBody);
		});
	}

	function mockResponse(sData, sEtag, sResponseType, sContentType) {
		this.xhr.onCreate = function(oRequest) {
			var oHeaders = { "Content-Type": sContentType || "application/json" };
			if (sEtag) {
				oHeaders.Etag = sEtag;
			}
			oRequest.addEventListener("loadstart", function(oEvent) {
				oEvent.target.responseType = sResponseType || "";
				this.oXHR = oRequest;
				this.oXHRLoadSpy = sandbox.spy(oRequest, "onload");
				oEvent.target.respond(200, oHeaders, sData);
			}.bind(this));
		}.bind(this);
	}
	QUnit.module("Given LrepConnector with a fake server", {
		beforeEach() {
			sandbox.useFakeServer();
			sandbox.server.autoRespond = true;
		},
		afterEach() {
			sandbox.verifyAndRestore();
		}
	}, function() {
		QUnit.test("given a mock server, when loadVariantsAuthors is triggered", function(assert) {
			var oServerResponse = {
				variants: {
					id1: "name1"
				},
				compVariants: {
					id2: "name2"
				}
			};

			fnReturnData(200, { "Content-Type": "application/json" }, JSON.stringify(oServerResponse));
			var mPropertyBag = { url: "/sap/bc/lrep", reference: "test.app" };
			var sUrl = "/sap/bc/lrep/variants/authors/test.app";

			return LrepConnector.loadVariantsAuthors(mPropertyBag).then(function(oResponse) {
				assert.equal(sandbox.server.getRequest(0).method, "GET", "request method is GET");
				assert.equal(sandbox.server.getRequest(0).url, sUrl, "Url is correct");
				assert.deepEqual(oResponse, oServerResponse, "loadVariantsAuthors response is correct");
			});
		});

		QUnit.test("given a mock server, when loadFeatures is triggered without a public layer available", function(assert) {
			const oServerResponse = {
				isKeyUser: true,
				isVersioningEnabled: false,
				isContextSharingEnabled: true,
				isPublicLayerAvailable: false,
				isLocalResetEnabled: true
			};

			const oExpectedResponse = { isVariantAdaptationEnabled: false, ...oServerResponse };

			fnReturnData(200, { "Content-Type": "application/json" }, JSON.stringify(oServerResponse));
			const mPropertyBag = { url: "/sap/bc/lrep" };
			const sUrl = "/sap/bc/lrep/flex/settings";

			return LrepConnector.loadFeatures(mPropertyBag).then(function(oResponse) {
				assert.equal(sandbox.server.getRequest(0).method, "GET", "request method is GET");
				assert.equal(sandbox.server.getRequest(0).url, sUrl, "Url is correct");
				assert.deepEqual(oExpectedResponse, oResponse, "loadFeatures response flow is correct");
			});
		});

		QUnit.test("given a mock server, when loadFeatures is triggered with a public layer available", function(assert) {
			const oServerResponse = {
				isKeyUser: true,
				isVersioningEnabled: false,
				isContextSharingEnabled: true,
				isPublicLayerAvailable: true,
				isLocalResetEnabled: true
			};

			const oExpectedResponse = { isVariantAdaptationEnabled: true, ...oServerResponse };

			fnReturnData(200, { "Content-Type": "application/json" }, JSON.stringify(oServerResponse));
			const mPropertyBag = { url: "/sap/bc/lrep" };
			const sUrl = "/sap/bc/lrep/flex/settings";

			return LrepConnector.loadFeatures(mPropertyBag).then(function(oResponse) {
				assert.equal(sandbox.server.getRequest(0).method, "GET", "request method is GET");
				assert.equal(sandbox.server.getRequest(0).url, sUrl, "Url is correct");
				assert.deepEqual(oExpectedResponse, oResponse, "loadFeatures response flow is correct");
			});
		});

		QUnit.test("given a mock server, when loadFeatures is triggered when settings already stored in apply connector", function(assert) {
			var oExpectedResponse = {
				isKeyUser: false
			};
			var mPropertyBag = { url: "/sap/bc/lrep" };
			LrepConnector.settings = { isKeyUser: false };
			return LrepConnector.loadFeatures(mPropertyBag).then(function(oResponse) {
				assert.deepEqual(oResponse, oExpectedResponse, "the settings object is obtain from apply connector correctly");
				assert.equal(sandbox.server.requestCount, 0, "no request is sent to back end");
			});
		});
	});

	QUnit.module("Given LrepConnector with a fake XHR", {
		beforeEach() {
			this.xhr = sandbox.useFakeXMLHttpRequest();
			// todos#18: Remove when done
			sandbox.stub(FlexInfoSession, "getByReference").returns({ adaptationMode: true });
		},
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when no static changes-bundle.json is placed, loading flex data is triggered and an empty response as default is returned", function(assert) {
			var oResponse = { changes: [], loadModules: false };
			mockResponse.call(this, JSON.stringify(oResponse));

			return LrepConnector.loadFlexData({ url: "/sap/bc/lrep", reference: "reference" }).then(function(oResult) {
				assert.deepEqual(oResult, oResponse, "the default response resolves the request Promise");
				assert.strictEqual(this.oXHRLoadSpy.firstCall.args[0].target.response, JSON.stringify(oResponse), "then xhr.onLoad was called with the right response");
			}.bind(this));
		});

		QUnit.test("when no static changes-bundle.json is placed, loading flex data is triggered and an empty response as 'json' is returned", function(assert) {
			var oResponse = { changes: [], loadModules: false };
			mockResponse.call(this, JSON.stringify(oResponse), undefined, "json");

			return LrepConnector.loadFlexData({ url: "/sap/bc/lrep", reference: "reference" }).then(function(oResult) {
				assert.deepEqual(oResult, oResponse, "the default response resolves the request Promise");
				assert.deepEqual(this.oXHRLoadSpy.firstCall.args[0].target.response, oResponse, "then xhr.onLoad was called with the right response");
			}.bind(this));
		});

		QUnit.test("when loading flex data is triggered with a cacheKey", function(assert) {
			var sCacheKey = "abc123";

			mockResponse.call(this, JSON.stringify({ changes: [], loadModules: false }));

			return LrepConnector.loadFlexData({ url: "/sap/bc/lrep", reference: "reference", cacheKey: sCacheKey }).then(function() {
				assert.equal(this.oXHR.url, "/sap/bc/lrep/flex/data/~abc123~/reference?sap-language=EN", "the cacheKey is included in the request");
			}.bind(this));
		});

		QUnit.test("when loading flex data is triggered with a preview", function(assert) {
			var sCacheKey = "abc123";
			var sBaseAppReference = "base.app.reference";
			var oPreview = {
				reference: sBaseAppReference,
				maxLayer: Layer.PARTNER
			};

			mockResponse.call(this, JSON.stringify({ changes: [], loadModules: false }));

			return LrepConnector.loadFlexData({ url: "/sap/bc/lrep", reference: "reference", cacheKey: sCacheKey, preview: oPreview }).then(function() {
				assert.equal(this.oXHR.url, "/sap/bc/lrep/flex/data/~abc123~/base.app.reference?sap-language=EN&upToLayerType=PARTNER", "the reference is replaced by the base apps and the upToLayerType is included in the request");
			}.bind(this));
		});

		QUnit.test("when loading flex data is triggered end Etag is available in the response header", function(assert) {
			mockResponse.call(this, JSON.stringify({ changes: [], loadModules: false }), "cacheKey");

			return LrepConnector.loadFlexData({ url: "/sap/bc/lrep", reference: "reference" }).then(function(oResult) {
				assert.deepEqual(oResult, { changes: [], loadModules: false, cacheKey: "cacheKey" }, "/sap/bc/lrep/flex/data/reference", "cacheKey is set in the result");
			});
		});

		QUnit.test("when loading flex data is triggered with a sideId and appDescriptorId info passed", function(assert) {
			var sCacheKey = "abc123";

			mockResponse.call(this, JSON.stringify({ changes: [], loadModules: false }));

			return LrepConnector.loadFlexData({
				url: "/sap/bc/lrep",
				reference: "reference",
				cacheKey: sCacheKey,
				siteId: "dummySite",
				appDescriptor: {
					"_version": "2.0.0",

					"sap.app": {
						id: "appDescriptorId"
					}
				}
			}).then(function() {
				assert.equal(this.oXHR.url, "/sap/bc/lrep/flex/data/~abc123~/reference?sap-language=EN", "the cacheKey is included in the request");
				assert.equal(this.oXHR.requestHeaders["X-LRep-Site-Id"], "dummySite", "the siteId is included in the request");
				assert.equal(this.oXHR.requestHeaders["X-LRep-AppDescriptor-Id"], "appDescriptorId", "the appDescriptorId is included in the request");
			}.bind(this));
		});

		QUnit.test("when loading flex data and returning the flag to also load modules", function(assert) {
			var sCacheKey = "abc123";

			mockResponse.call(this, JSON.stringify({ changes: [], loadModules: true }));
			var oStubLoadModule = sandbox.stub(LrepConnector, "_loadModules").resolves();
			return LrepConnector.loadFlexData({ url: "/sap/bc/lrep", reference: "reference", cacheKey: sCacheKey }).then(function(oResult) {
				assert.equal(this.oXHR.url, "/sap/bc/lrep/flex/data/~abc123~/reference?sap-language=EN", "and the URL was correct");
				assert.ok(oStubLoadModule.calledOnce, "loadModule triggered");
				assert.deepEqual(oResult, { changes: [], loadModules: true, cacheKey: "abc123" }, "and the flex_data response resolves the promise");
			}.bind(this));
		});

		QUnit.test("when loading flex data the settings value is stored", function(assert) {
			mockResponse.call(this, JSON.stringify({ changes: [], settings: { isKeyUser: true } }));
			return LrepConnector.loadFlexData({ url: "/sap/bc/lrep", reference: "reference" }).then(function() {
				assert.deepEqual(LrepConnector.settings, { isContextSharingEnabled: true, isKeyUser: true, isLocalResetEnabled: true, isVariantAdaptationEnabled: false }, "and the settings value is stored");
			});
		});

		QUnit.test("when loading flex data the settings value is stored and the PUBLIC layer is available", function(assert) {
			mockResponse.call(this, JSON.stringify({ changes: [], settings: { isKeyUser: true, isPublicLayerAvailable: true } }));
			return LrepConnector.loadFlexData({ url: "/sap/bc/lrep", reference: "reference" }).then(function() {
				assert.deepEqual(LrepConnector.settings, { isContextSharingEnabled: true, isKeyUser: true, isLocalResetEnabled: true, isPublicLayerAvailable: true, isVariantAdaptationEnabled: true }, "and the settings value is stored");
			});
		});

		QUnit.test("when loading flex data with all contexts parameter", function(assert) {
			mockResponse.call(this, JSON.stringify({ changes: [], loadModules: true }));
			var oStubLoadModule = sandbox.stub(LrepConnector, "_loadModules").resolves();
			return LrepConnector.loadFlexData({ url: "/sap/bc/lrep", reference: "reference", allContexts: true }).then(function() {
				assert.equal(this.oXHR.url, "/sap/bc/lrep/flex/data/reference?allContexts=true&sap-language=EN", "and the URL was correct");
				assert.equal(oStubLoadModule.callCount, 1, "loadModule triggered");
			}.bind(this));
		});

		QUnit.test("when loading flex data with version parameter", function(assert) {
			mockResponse.call(this, JSON.stringify({ changes: [], loadModules: true }));
			var oStubLoadModule = sandbox.stub(LrepConnector, "_loadModules").resolves();
			return LrepConnector.loadFlexData({ url: "/sap/bc/lrep", reference: "reference", version: "versionGUID" }).then(function() {
				assert.equal(this.oXHR.url, "/sap/bc/lrep/flex/data/reference?version=versionGUID&sap-language=EN", "and the URL was correct");
				assert.equal(oStubLoadModule.callCount, 1, "loadModule triggered");
			}.bind(this));
		});

		QUnit.test("when loading flex data with version and all context parameter", function(assert) {
			mockResponse.call(this, JSON.stringify({ changes: [], loadModules: true }));
			var oStubLoadModule = sandbox.stub(LrepConnector, "_loadModules").resolves();
			return LrepConnector.loadFlexData({ url: "/sap/bc/lrep", reference: "reference", allContexts: true, version: "0" }).then(function() {
				assert.equal(this.oXHR.url, "/sap/bc/lrep/flex/data/reference?version=0&allContexts=true&sap-language=EN", "and the URL was correct");
				assert.equal(oStubLoadModule.callCount, 1, "loadModule triggered");
			}.bind(this));
		});

		QUnit.test("when loading flex data with version and filled adaptationId parameter", function(assert) {
			mockResponse.call(this, JSON.stringify({ changes: [], loadModules: true }));
			var oStubLoadModule = sandbox.stub(LrepConnector, "_loadModules").resolves();
			return LrepConnector.loadFlexData({ url: "/sap/bc/lrep", reference: "reference", adaptationId: "id_1234", version: "0" }).then(function() {
				assert.equal(this.oXHR.url, "/sap/bc/lrep/flex/data/reference?version=0&adaptationId=id_1234&sap-language=EN", "and the URL was correct");
				assert.equal(oStubLoadModule.callCount, 1, "loadModule triggered");
				return LrepConnector.loadVariantsAuthors({ url: "/sap/bc/lrep", reference: "reference", version: "0", adaptationId: "id_1234" }).then(function() {
					assert.equal(this.oXHR.url, "/sap/bc/lrep/variants/authors/reference?version=0&adaptationId=id_1234", "then the subsequence get variants authors inherit correct parameters");
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("when loading flex data with version and undefined adaptationId parameter", function(assert) {
			mockResponse.call(this, JSON.stringify({ changes: [], loadModules: true }));
			var oStubLoadModule = sandbox.stub(LrepConnector, "_loadModules").resolves();
			return LrepConnector.loadFlexData({ url: "/sap/bc/lrep", reference: "reference", adaptationId: undefined, version: "0" }).then(function() {
				assert.equal(this.oXHR.url, "/sap/bc/lrep/flex/data/reference?version=0&sap-language=EN", "and the URL was correct");
				assert.equal(oStubLoadModule.callCount, 1, "loadModule triggered");
			}.bind(this));
		});

		QUnit.test("when loading flex data with content type 'application/manifest+json'", function(assert) {
			mockResponse.call(this, JSON.stringify({ changes: [], loadModules: true }), undefined, undefined, "application/manifest+json");
			var oStubLoadModule = sandbox.stub(LrepConnector, "_loadModules").resolves();
			return LrepConnector.loadFlexData({ url: "/sap/bc/lrep", reference: "reference" }).then(function() {
				assert.equal(this.oXHR.url, "/sap/bc/lrep/flex/data/reference?sap-language=EN", "and the URL was correct");
				assert.equal(oStubLoadModule.callCount, 1, "loadModule triggered");
			}.bind(this));
		});

		QUnit.test("when loading flex data with content type 'application/json; charset=UTF-8'", function(assert) {
			mockResponse.call(this, JSON.stringify({ changes: [], loadModules: false }), undefined, undefined, "application/json; charset=UTF-8");
			var oStubLoadModule = sandbox.stub(LrepConnector, "_loadModules").resolves();
			return LrepConnector.loadFlexData({ url: "/sap/bc/lrep", reference: "reference" }).then(function() {
				assert.equal(this.oXHR.url, "/sap/bc/lrep/flex/data/reference?sap-language=EN", "and the URL was correct");
				assert.equal(oStubLoadModule.callCount, 0, "loadModule triggered");
			}.bind(this));
		});

		QUnit.test("when loading flex data with lazyLoadingViewsEnabled parameter", function(assert) {
			mockResponse.call(this, JSON.stringify({ changes: [], loadModules: false }));
			return LrepConnector.loadFlexData({
				url: "/sap/bc/lrep", reference: "reference", lazyLoadingViewsEnabled: true
			}).then(function() {
				const sExpectedUrl = "/sap/bc/lrep/flex/data/reference?lazyLoadingViewsEnabled=true&sap-language=EN";
				assert.equal(this.oXHR.url, sExpectedUrl, "the lazyLoadingViewsEnabled parameter is included in the request URL");
			}.bind(this));
		});

		// todos#18: Remove when done
		QUnit.test("when loading flex data, lazyLoadingViewsEnabled is set by default", function(assert) {
			FlexInfoSession.getByReference.returns({});
			mockResponse.call(this, JSON.stringify({ changes: [], loadModules: false }));
			return LrepConnector.loadFlexData({
				url: "/sap/bc/lrep", reference: "reference"
			}).then(function() {
				const sExpectedUrl = "/sap/bc/lrep/flex/data/reference?lazyLoadingViewsEnabled=true&sap-language=EN";
				assert.equal(this.oXHR.url, sExpectedUrl, "lazyLoadingViewsEnabled is set to true");
			}.bind(this));
		});

		// todos#18: Remove when done
		QUnit.test("when loading flex data in adaptation mode, lazyLoadingViewsEnabled is not set", function(assert) {
			FlexInfoSession.getByReference.returns({ adaptationMode: true });
			mockResponse.call(this, JSON.stringify({ changes: [], loadModules: false }));
			return LrepConnector.loadFlexData({
				url: "/sap/bc/lrep", reference: "reference"
			}).then(function() {
				const sExpectedUrl = "/sap/bc/lrep/flex/data/reference?sap-language=EN";
				assert.equal(this.oXHR.url, sExpectedUrl, "lazyLoadingViewsEnabled is not included");
			}.bind(this));
		});

		// todos#18: Remove when done
		QUnit.test("when loading flex data with RTA restart, lazyLoadingViewsEnabled is not set", function(assert) {
			FlexInfoSession.getByReference.returns({});
			const sRtaRestartKey = `sap.ui.rta.restart.${Layer.CUSTOMER}`;
			window.sessionStorage.setItem(sRtaRestartKey, true);
			mockResponse.call(this, JSON.stringify({ changes: [], loadModules: false }));
			return LrepConnector.loadFlexData({
				url: "/sap/bc/lrep", reference: "reference"
			}).then(function() {
				const sExpectedUrl = "/sap/bc/lrep/flex/data/reference?sap-language=EN";
				assert.equal(this.oXHR.url, sExpectedUrl, "lazyLoadingViewsEnabled is not included");
				window.sessionStorage.removeItem(sRtaRestartKey);
			}.bind(this));
		});

		QUnit.test("when loading flex data with compVariants in the response, they are kept separate from changes", function(assert) {
			const oResponse = {
				changes: [{ fileName: "change1", fileType: "change" }],
				compVariants: [{ fileName: "variant1", fileType: "variant" }],
				loadModules: false
			};
			mockResponse.call(this, JSON.stringify(oResponse));

			return LrepConnector.loadFlexData({ url: "/sap/bc/lrep", reference: "reference" }).then(function(oResult) {
				assert.equal(oResult.changes.length, 1, "changes contains only the change");
				assert.equal(oResult.changes[0].fileName, "change1", "the change is in changes");
				assert.equal(oResult.compVariants.length, 1, "compVariants contains only the comp variant");
				assert.equal(oResult.compVariants[0].fileName, "variant1", "the comp variant is in compVariants");
			});
		});

		QUnit.test("when loadAllFlVariants is triggered", function(assert) {
			mockResponse.call(this, JSON.stringify(oFLVariantServerResponse));
			const mPropertyBag = { url: "/sap/bc/lrep", reference: "test.app", vmReference: "vmControl1" };

			return LrepConnector.loadAllFlVariants(mPropertyBag).then(function(oResponse) {
				assert.equal(this.oXHR.method, "GET", "request method is GET");
				const sExpectedUrl = "/sap/bc/lrep/flex/variantdata/test.app?vmReference=vmControl1&sap-language=EN";
				assert.equal(this.oXHR.url, sExpectedUrl, "the URL is correct");
				assert.deepEqual(oResponse, oFLVariantServerResponse, "the response is returned correctly");
			}.bind(this));
		});

		QUnit.test("when loadFlVariant is triggered for lazy-loaded content", function(assert) {
			mockResponse.call(this, JSON.stringify(oFLVariantServerResponse));
			const mPropertyBag = { url: "/sap/bc/lrep", reference: "test.app", variantReference: "variant1" };

			return LrepConnector.loadFlVariant(mPropertyBag).then(function(oResponse) {
				assert.equal(this.oXHR.method, "GET", "request method is GET");
				const sExpectedUrl = "/sap/bc/lrep/flex/variantdata/content/test.app?id=variant1&sap-language=EN";
				assert.equal(this.oXHR.url, sExpectedUrl, "the URL is correct");
				assert.deepEqual(oResponse, oFLVariantServerResponse, "the response is returned correctly");
			}.bind(this));
		});

		QUnit.test("when loadAllCompVariants is triggered", function(assert) {
			mockResponse.call(this, JSON.stringify(oCompVariantServerResponse));
			const mPropertyBag = { url: "/sap/bc/lrep", reference: "test.app", persistencyKey: "myPersistencyKey" };

			return LrepConnector.loadAllCompVariants(mPropertyBag).then(function(oResponse) {
				assert.equal(this.oXHR.method, "GET", "request method is GET");
				const sExpectedUrl = "/sap/bc/lrep/flex/compvariantdata/test.app?persistencyKey=myPersistencyKey&sap-language=EN";
				assert.equal(this.oXHR.url, sExpectedUrl, "the URL is correct");
				assert.deepEqual(oResponse, oCompVariantServerResponse, "the response is returned correctly");
			}.bind(this));
		});

		QUnit.test("when loadAllCompVariants is triggered with an empty persistencyKey", function(assert) {
			mockResponse.call(this, JSON.stringify(oCompVariantServerResponse));
			const mPropertyBag = { url: "/sap/bc/lrep", reference: "test.app", persistencyKey: "" };

			return LrepConnector.loadAllCompVariants(mPropertyBag).then(function(oResponse) {
				const sExpectedUrl = "/sap/bc/lrep/flex/compvariantdata/test.app?persistencyKey=&sap-language=EN";
				assert.equal(this.oXHR.url, sExpectedUrl, "empty persistencyKey is included in the URL");
				assert.deepEqual(oResponse, oCompVariantServerResponse, "the response is returned correctly");
			}.bind(this));
		});

		QUnit.test("when loadCompVariantContent is triggered", function(assert) {
			mockResponse.call(this, JSON.stringify(oCompVariantServerResponse));
			const mPropertyBag = { url: "/sap/bc/lrep", reference: "test.app", variantId: "compVariant1" };

			return LrepConnector.loadCompVariantContent(mPropertyBag).then(function(oResponse) {
				assert.equal(this.oXHR.method, "GET", "request method is GET");
				const sExpectedUrl = "/sap/bc/lrep/flex/compvariantdata/content/test.app?id=compVariant1&sap-language=EN";
				assert.equal(this.oXHR.url, sExpectedUrl, "the URL is correct");
				assert.deepEqual(oResponse, oCompVariantServerResponse, "the response is returned correctly");
			}.bind(this));
		});
	});

	QUnit.module("LrepConnector without fake server", {
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when loadFlexData is called with <NO CHANGES> as cache key", function(assert) {
			var oSendRequestStub = sandbox.stub(InitialUtils, "sendRequest");
			const expectedDefaultFlexDataResponse = StorageUtils.getEmptyFlexDataResponse();
			return LrepConnector.loadFlexData({ cacheKey: "<NO CHANGES>" }).then(function(oResponse) {
				assert.equal(oSendRequestStub.callCount, 0, "no request was sent");
				assert.propEqual(oResponse, expectedDefaultFlexDataResponse, "the function returns no data");
			});
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
