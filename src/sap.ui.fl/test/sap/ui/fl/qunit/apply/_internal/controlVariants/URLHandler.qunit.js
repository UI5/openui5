/* global QUnit */

sap.ui.define([
	"sap/base/Log",
	"sap/ui/fl/apply/_internal/controlVariants/URLHandler",
	"sap/ui/fl/apply/_internal/controlVariants/Utils",
	"sap/ui/fl/apply/_internal/flexObjects/FlexObjectFactory",
	"sap/ui/fl/apply/_internal/flexState/controlVariants/VariantManagementState",
	"sap/ui/fl/apply/_internal/flexState/controlVariants/VariantManagerApply",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/initial/_internal/ManifestUtils",
	"sap/ui/fl/variants/VariantManagement",
	"sap/ui/fl/Layer",
	"sap/ui/fl/Utils",
	"sap/ui/thirdparty/hasher",
	"sap/ui/thirdparty/sinon-4",
	"test-resources/sap/ui/fl/qunit/FlQUnitUtils"
], function(
	Log,
	URLHandler,
	VariantUtil,
	FlexObjectFactory,
	VariantManagementState,
	VariantManagerApply,
	FlexState,
	ManifestUtils,
	VariantManagement,
	Layer,
	Utils,
	hasher,
	sinon,
	FlQUnitUtils
) {
	"use strict";

	document.getElementById("qunit-fixture").style.display = "none";

	const sandbox = sinon.createSandbox();
	const sFlexReference = "someReference";
	const sVMReference = "variantMgmtId1";

	function createURLHandlerWithServices(sandbox, mServices, mConstructorBag) {
		const oRegisterNavigationFilterStub = sandbox.stub();
		const oUnregisterNavigationFilterStub = sandbox.stub();
		const oParseShellHashStub = sandbox.stub().returns({ params: {} });
		const oNavigateStub = sandbox.stub();

		const mDefaultServices = {
			ShellNavigationInternal: {
				registerNavigationFilter: oRegisterNavigationFilterStub,
				unregisterNavigationFilter: oUnregisterNavigationFilterStub,
				NavigationFilterStatus: { Continue: "Continue" }
			},
			URLParsing: { parseShellHash: oParseShellHashStub },
			Navigation: { navigate: oNavigateStub }
		};

		const mResolvedServices = { ...mDefaultServices, ...mServices };

		sandbox.stub(Utils, "getUShellService").callsFake(
			(sServiceName) => Promise.resolve(mResolvedServices[sServiceName])
		);
		sandbox.stub(Utils, "getUshellContainer").returns({});

		const oAppComponent = {
			getId() { return "testAppComponent"; },
			getComponentData() { return null; }
		};

		const oURLHandler = new URLHandler({
			vmReference: sVMReference,
			flexReference: sFlexReference,
			appComponent: oAppComponent,
			...mConstructorBag
		});

		return {
			oURLHandler,
			oAppComponent,
			oRegisterNavigationFilterStub,
			oUnregisterNavigationFilterStub,
			oParseShellHashStub,
			oNavigateStub
		};
	}

	QUnit.module("URLHandler instance lifecycle", {
		async beforeEach() {
			sandbox.stub(hasher, "getHash").returns("");
			const mResult = createURLHandlerWithServices(sandbox);
			this.oURLHandler = mResult.oURLHandler;
			this.oRegisterNavigationFilterStub = mResult.oRegisterNavigationFilterStub;
			this.oUnregisterNavigationFilterStub = mResult.oUnregisterNavigationFilterStub;
			await this.oURLHandler.initialize();
		},
		afterEach() {
			this.oURLHandler.destroy();
			this.oVM?.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("initialize resolves services and registerControl registers the navigation filter", function(assert) {
			assert.deepEqual(this.oURLHandler.getStoredHashParams(), [], "initially has no stored hash params");
			assert.strictEqual(this.oRegisterNavigationFilterStub.callCount, 0, "navigation filter is not yet registered");

			this.oURLHandler.registerControl();

			assert.strictEqual(this.oRegisterNavigationFilterStub.callCount, 1, "navigation filter was registered once");
			assert.strictEqual(
				typeof this.oRegisterNavigationFilterStub.firstCall.args[0],
				"function",
				"a function was registered as navigation filter"
			);
		});

		QUnit.test("destroy deregisters the navigation filter", function(assert) {
			this.oURLHandler.registerControl();

			this.oURLHandler.destroy();

			assert.strictEqual(this.oUnregisterNavigationFilterStub.callCount, 1, "navigation filter was unregistered");
			assert.strictEqual(
				this.oRegisterNavigationFilterStub.firstCall.args[0],
				this.oUnregisterNavigationFilterStub.firstCall.args[0],
				"the same filter function was unregistered that was registered"
			);
		});

		QUnit.test("destroy cleans up the control property observer", function(assert) {
			this.oVM = new VariantManagement(sVMReference);
			this.oURLHandler.registerControl();
			this.oURLHandler.handleModelContextChange(this.oVM);

			this.oURLHandler.destroy();

			assert.ok(true, "destroy completes without error after observer was set up");
		});

		QUnit.test("getStoredHashParams reads variant params live from the URL hash", async function(assert) {
			sandbox.restore();
			hasher.getHash.restore?.();
			const oHasherStub = sandbox.stub(hasher, "getHash").returns("");
			const oParseShellHashStub = sandbox.stub();
			const { oURLHandler } = createURLHandlerWithServices(sandbox, {
				URLParsing: { parseShellHash: oParseShellHashStub }
			});
			await oURLHandler.initialize();

			oParseShellHashStub.returns({ params: {} });
			assert.deepEqual(oURLHandler.getStoredHashParams(), [], "returns empty array when hash has no variant params");

			oParseShellHashStub.returns({
				params: { [VariantUtil.VARIANT_TECHNICAL_PARAMETER]: ["v1,v2"] }
			});
			oHasherStub.returns("#hash");
			assert.deepEqual(
				oURLHandler.getStoredHashParams(),
				["v1", "v2"],
				"splits comma-separated params from the live hash"
			);

			oParseShellHashStub.returns({
				params: { [VariantUtil.VARIANT_TECHNICAL_PARAMETER]: ["v1", "v2"] }
			});
			assert.deepEqual(
				oURLHandler.getStoredHashParams(),
				["v1", "v2"],
				"returns array params from the live hash"
			);

			const aParams = oURLHandler.getStoredHashParams();
			aParams.push("rogue");
			assert.deepEqual(
				oURLHandler.getStoredHashParams(),
				["v1", "v2"],
				"returns a copy so external mutation does not affect the URL state"
			);

			oURLHandler.destroy();
		});

		QUnit.test("initialize logs error when a UShell service is unavailable", async function(assert) {
			sandbox.restore();
			sandbox.stub(hasher, "getHash").returns("");
			const oLogErrorStub = sandbox.stub(Log, "error");
			sandbox.stub(Utils, "getUShellService").callsFake((sServiceName) => {
				if (sServiceName === "Navigation") {
					return Promise.reject(new Error("Service Error"));
				}
				return Promise.resolve({});
			});
			sandbox.stub(Utils, "getUshellContainer").returns({});

			this.oURLHandler = new URLHandler({
				vmReference: sVMReference,
				flexReference: sFlexReference,
				appComponent: {}
			});
			await this.oURLHandler.initialize();

			assert.strictEqual(oLogErrorStub.callCount, 1, "an error was logged");
			assert.ok(
				oLogErrorStub.firstCall.args[0].includes("Navigation"),
				"the error message mentions the failed service"
			);
		});
	});

	QUnit.module("URLHandler URL parameter management", {
		beforeEach() {
			sandbox.stub(hasher, "getHash").returns("");
			sandbox.stub(ManifestUtils, "getFlexReferenceForControl").returns(sFlexReference);
		},
		afterEach() {
			this.oURLHandler?.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("update() with updateURL=true calls navigate only when params changed", async function(assert) {
			const oNavigateStub = sandbox.stub();
			const oParseShellHashStub = sandbox.stub().returns({
				semanticObject: "SO",
				action: "action",
				contextRaw: "ctx",
				params: { [VariantUtil.VARIANT_TECHNICAL_PARAMETER]: ["testParam"] },
				appSpecificRoute: "route",
				writeHistory: false
			});
			const { oURLHandler } = createURLHandlerWithServices(sandbox, {
				URLParsing: { parseShellHash: oParseShellHashStub },
				Navigation: { navigate: oNavigateStub }
			});
			this.oURLHandler = oURLHandler;
			await oURLHandler.initialize();

			oURLHandler.update({ parameters: ["testParam"], updateURL: true });
			assert.strictEqual(oNavigateStub.callCount, 0, "navigate not called when params are unchanged");

			oParseShellHashStub.returns({
				semanticObject: "SO",
				action: "action",
				contextRaw: "ctx",
				params: {},
				appSpecificRoute: "route",
				writeHistory: false
			});
			oURLHandler.update({ parameters: ["testParam"], updateURL: true });
			assert.strictEqual(oNavigateStub.callCount, 1, "navigate called when params changed");
			assert.deepEqual(
				oNavigateStub.firstCall.args[0].params[VariantUtil.VARIANT_TECHNICAL_PARAMETER],
				["testParam"],
				"correct parameter passed to navigate"
			);
		});

		QUnit.test("update() with silent=true uses hasher.replaceHash()", async function(assert) {
			const sConstructedHash = "constructedHash";
			const oConstructShellHashStub = sandbox.stub().callsFake(() => {
				assert.notOk(hasher.changed.active, "hasher changed events are deactivated during silent update");
				return sConstructedHash;
			});
			const oReplaceHashStub = sandbox.stub(hasher, "replaceHash");
			const { oURLHandler } = createURLHandlerWithServices(sandbox, {
				URLParsing: {
					getHash: () => "",
					parseShellHash: sandbox.stub().returns({
						params: { [VariantUtil.VARIANT_TECHNICAL_PARAMETER]: ["oldParam"] }
					}),
					constructShellHash: oConstructShellHashStub
				}
			});
			this.oURLHandler = oURLHandler;
			await oURLHandler.initialize();

			oURLHandler.update({ parameters: ["newParam"], updateURL: true, silent: true });

			assert.deepEqual(
				oConstructShellHashStub.firstCall.args[0].params[VariantUtil.VARIANT_TECHNICAL_PARAMETER],
				["newParam"],
				"constructShellHash was called with the new parameters"
			);
			assert.ok(oReplaceHashStub.calledWith(sConstructedHash), "hasher.replaceHash was called with constructed hash");
			assert.ok(hasher.changed.active, "hasher changed events are re-activated after silent update");
		});

		QUnit.test("update() without a valid app component logs a warning", async function(assert) {
			const oWarnStub = sandbox.stub(Log, "warning");
			const { oURLHandler } = createURLHandlerWithServices(sandbox, {
				URLParsing: {
					parseShellHash: sandbox.stub().returns({
						semanticObject: "SO",
						action: "action",
						params: {},
						appSpecificRoute: "",
						writeHistory: false
					})
				},
				Navigation: { navigate: sandbox.stub() }
			});
			this.oURLHandler = oURLHandler;
			await oURLHandler.initialize();

			oURLHandler.update({ parameters: ["p1"], updateURL: true });

			assert.ok(
				oWarnStub.calledWith(
					"Component instance not provided, so technical parameters in component data and browser history remain unchanged"
				),
				"a warning was logged for missing component data"
			);
		});

		QUnit.test("update() with silent=true and valid component updates technical parameters", async function(assert) {
			const sTechParamKey = VariantUtil.VARIANT_TECHNICAL_PARAMETER;
			const oTechnicalParameters = { [sTechParamKey]: "oldParam" };
			const oAppComponent = {
				getId() { return "testApp"; },
				getComponentData() {
					return { technicalParameters: oTechnicalParameters };
				}
			};

			const sConstructedHash = "constructedHash";
			const oReplaceHashStub = sandbox.stub(hasher, "replaceHash");
			const oConstructShellHashStub = sandbox.stub().returns(sConstructedHash);
			const { oURLHandler } = createURLHandlerWithServices(sandbox, {
				URLParsing: {
					getHash: () => "",
					parseShellHash: sandbox.stub().returns({
						params: { [sTechParamKey]: ["oldParam"] }
					}),
					constructShellHash: oConstructShellHashStub
				}
			}, { appComponent: oAppComponent });
			this.oURLHandler = oURLHandler;
			await oURLHandler.initialize();

			oURLHandler.update({ parameters: ["newParam1", "newParam2"], updateURL: true, silent: true });

			assert.deepEqual(
				oAppComponent.getComponentData().technicalParameters[sTechParamKey],
				["newParam1,newParam2"],
				"component technical parameters were updated"
			);
			assert.ok(oReplaceHashStub.calledWith(sConstructedHash), "hasher.replaceHash was called");
		});

		QUnit.test("clearAllVariantURLParameters() calls update only when variant params are present", async function(assert) {
			const oParseShellHashStub = sandbox.stub().returns({ params: { otherParam: "foo" } });
			const { oURLHandler } = createURLHandlerWithServices(sandbox, {
				URLParsing: { parseShellHash: oParseShellHashStub },
				Navigation: { navigate: sandbox.stub() }
			});
			this.oURLHandler = oURLHandler;
			await oURLHandler.initialize();

			const oUpdateSpy = sandbox.spy(oURLHandler, "update");
			oURLHandler.clearAllVariantURLParameters();
			assert.strictEqual(oUpdateSpy.callCount, 0, "update not called when no variant params in URL");

			oParseShellHashStub.returns({
				params: { [VariantUtil.VARIANT_TECHNICAL_PARAMETER]: ["someVariant"] }
			});
			oURLHandler.clearAllVariantURLParameters();
			assert.strictEqual(oUpdateSpy.callCount, 1, "update called when variant params are present");
			assert.deepEqual(
				oUpdateSpy.firstCall.args[0],
				{ updateURL: true, parameters: [] },
				"update called with empty parameters"
			);
		});

		QUnit.test("removeURLParameterForVariantManagement() returns index -1 and empty params when no params exist", async function(assert) {
			const { oURLHandler } = createURLHandlerWithServices(sandbox);
			this.oURLHandler = oURLHandler;
			await oURLHandler.initialize();

			const oResult = oURLHandler.removeURLParameterForVariantManagement();

			assert.strictEqual(oResult.index, -1, "index is -1 when no URL params exist");
			assert.deepEqual(oResult.parameters, [], "parameters is empty array");
		});

		QUnit.test("update() with silent=true and empty params deletes technical parameters from component", async function(assert) {
			const sTechParamKey = VariantUtil.VARIANT_TECHNICAL_PARAMETER;
			const oTechnicalParameters = { [sTechParamKey]: ["oldParam"] };
			const oAppComponent = {
				getId() { return "testApp"; },
				getComponentData() {
					return { technicalParameters: oTechnicalParameters };
				}
			};

			const oReplaceHashStub = sandbox.stub(hasher, "replaceHash");
			const oConstructShellHashStub = sandbox.stub().returns("emptyHash");
			const { oURLHandler } = createURLHandlerWithServices(sandbox, {
				URLParsing: {
					getHash: () => "",
					parseShellHash: sandbox.stub().returns({
						params: { [sTechParamKey]: ["oldParam"] }
					}),
					constructShellHash: oConstructShellHashStub
				}
			}, { appComponent: oAppComponent });
			this.oURLHandler = oURLHandler;
			await oURLHandler.initialize();

			oURLHandler.update({ parameters: [], updateURL: true, silent: true });

			assert.strictEqual(
				oAppComponent.getComponentData().technicalParameters[sTechParamKey],
				undefined,
				"technical parameter was deleted from component data"
			);
			assert.ok(oReplaceHashStub.calledWith("emptyHash"), "hasher.replaceHash was called");
		});

		QUnit.test("updateVariantInURL() returns early when URLParsing service is unavailable", async function(assert) {
			sandbox.stub(Utils, "getUShellService").callsFake(() => Promise.resolve(undefined));
			sandbox.stub(Utils, "getUshellContainer").returns({});

			this.oURLHandler = new URLHandler({
				vmReference: sVMReference,
				flexReference: sFlexReference,
				appComponent: {}
			});
			await this.oURLHandler.initialize();

			this.oURLHandler.updateVariantInURL("someVariant");

			assert.ok(true, "updateVariantInURL completes without error when service is unavailable");
		});

		QUnit.module("updateVariantInURL()", {
			async beforeEach() {
				await FlexState.initialize({
					reference: sFlexReference,
					componentId: "testid",
					componentData: {},
					manifest: {}
				});

				FlQUnitUtils.stubFlexObjectsSelector(sandbox, [
					FlexObjectFactory.createFlVariant({
						id: sVMReference,
						variantName: "Standard",
						variantManagementReference: sVMReference,
						reference: sFlexReference,
						layer: Layer.VENDOR
					}),
					FlexObjectFactory.createFlVariant({
						id: "variant0",
						variantName: "variant A",
						variantManagementReference: sVMReference,
						variantReference: sVMReference,
						reference: sFlexReference,
						layer: Layer.CUSTOMER
					}),
					FlexObjectFactory.createFlVariant({
						id: "variant1",
						variantName: "variant B",
						variantManagementReference: sVMReference,
						variantReference: sVMReference,
						reference: sFlexReference,
						layer: Layer.CUSTOMER
					}),
					FlexObjectFactory.createVariantManagementChange({
						id: "setDefault_vm1",
						layer: Layer.CUSTOMER,
						changeType: "setDefault",
						fileType: "ctrl_variant_management_change",
						selector: { id: sVMReference },
						content: { defaultVariant: "variant1" }
					})
				]);
			},
			afterEach() {
				this.oURLHandler?.destroy();
				FlexState.clearState();
				VariantManagementState.resetCurrentVariantReference(sFlexReference, sVMReference);
			}
		}, function() {
			QUnit.test("adds new variant or replaces existing one at the correct index", async function(assert) {
				const oParseShellHashStub = sandbox.stub().returns({ params: {} });
				const { oURLHandler } = createURLHandlerWithServices(sandbox, {
					URLParsing: { parseShellHash: oParseShellHashStub },
					Navigation: { navigate: sandbox.stub() }
				});
				this.oURLHandler = oURLHandler;
				await oURLHandler.initialize();
				const oUpdateSpy = sandbox.spy(oURLHandler, "update");

				oURLHandler.updateVariantInURL("variant0");

				assert.ok(oUpdateSpy.calledOnce, "update called for non-default variant");
				assert.deepEqual(oUpdateSpy.firstCall.args[0].parameters, ["variant0"], "variant added to empty params");
				assert.strictEqual(oUpdateSpy.firstCall.args[0].updateURL, true, "updateURL is true");

				oUpdateSpy.resetHistory();
				oParseShellHashStub.returns({
					params: {
						[VariantUtil.VARIANT_TECHNICAL_PARAMETER]: ["otherParam", sVMReference].map(encodeURIComponent)
					}
				});
				oURLHandler.updateVariantInURL("variant0");

				assert.deepEqual(
					oUpdateSpy.firstCall.args[0].parameters,
					["otherParam", "variant0"],
					"existing param for the VM was replaced with the new variant"
				);
			});

			QUnit.test("for default variant removes entry or skips update when not in URL", async function(assert) {
				const oParseShellHashStub = sandbox.stub().returns({ params: {} });
				const { oURLHandler } = createURLHandlerWithServices(sandbox, {
					URLParsing: { parseShellHash: oParseShellHashStub },
					Navigation: { navigate: sandbox.stub() }
				});
				this.oURLHandler = oURLHandler;
				await oURLHandler.initialize();
				const oUpdateSpy = sandbox.spy(oURLHandler, "update");

				oURLHandler.updateVariantInURL("variant1");
				assert.strictEqual(oUpdateSpy.callCount, 0, "update not called for default variant with no params");

				oParseShellHashStub.returns({
					params: { [VariantUtil.VARIANT_TECHNICAL_PARAMETER]: ["Dummy", sVMReference, "Dummy1"] }
				});
				oURLHandler.updateVariantInURL("variant1");

				assert.strictEqual(oUpdateSpy.callCount, 1, "update called to remove default variant entry");
				assert.deepEqual(
					oUpdateSpy.firstCall.args[0].parameters,
					["Dummy", "Dummy1"],
					"the default variant's entry was removed from the parameters"
				);
			});

			QUnit.test("in design time mode reads URL params and sets updateURL=false", async function(assert) {
				const oParseShellHashStub = sandbox.stub().returns({
					params: { [VariantUtil.VARIANT_TECHNICAL_PARAMETER]: ["Dummy", sVMReference, "Dummy1"] }
				});
				const { oURLHandler } = createURLHandlerWithServices(sandbox, {
					URLParsing: { parseShellHash: oParseShellHashStub }
				});
				this.oURLHandler = oURLHandler;
				await oURLHandler.initialize();
				oURLHandler.setDesigntimeMode(true);
				const oUpdateSpy = sandbox.spy(oURLHandler, "update");

				oURLHandler.updateVariantInURL("variant0");

				assert.ok(oUpdateSpy.calledOnce, "update was called");
				assert.deepEqual(
					oUpdateSpy.firstCall.args[0].parameters,
					["Dummy", "variant0", "Dummy1"],
					"the URL params were read and the variant was replaced"
				);
				assert.strictEqual(oUpdateSpy.firstCall.args[0].updateURL, false, "updateURL=false in design time mode");

				oUpdateSpy.restore();
				oParseShellHashStub.returns({ params: {} });
				const oUpdateSpy2 = sandbox.spy(oURLHandler, "update");

				oURLHandler.updateVariantInURL("variant0");

				assert.deepEqual(
					oUpdateSpy2.firstCall.args[0].parameters,
					["variant0"],
					"variant appended to empty URL params"
				);
				assert.strictEqual(oUpdateSpy2.firstCall.args[0].updateURL, false, "updateURL=false");
			});

			QUnit.test("setDesigntimeMode(false) syncs current variant to URL after design time", async function(assert) {
				const oParseShellHashStub = sandbox.stub().returns({ params: {} });
				const { oURLHandler } = createURLHandlerWithServices(sandbox, {
					URLParsing: { parseShellHash: oParseShellHashStub },
					Navigation: { navigate: sandbox.stub() }
				});
				this.oURLHandler = oURLHandler;
				await oURLHandler.initialize();
				oURLHandler.registerControl();
				VariantManagementState.setCurrentVariant({
					reference: sFlexReference,
					vmReference: sVMReference,
					newVReference: "variant0"
				});

				oURLHandler.setDesigntimeMode(true);
				const oUpdateSpy = sandbox.spy(oURLHandler, "update");

				oURLHandler.setDesigntimeMode(false);

				assert.ok(oUpdateSpy.calledOnce, "update was called when leaving design time mode");
				assert.deepEqual(
					oUpdateSpy.firstCall.args[0].parameters,
					["variant0"],
					"the current variant is written to the URL"
				);
				assert.strictEqual(oUpdateSpy.firstCall.args[0].updateURL, true, "updateURL=true outside design time mode");
			});

			QUnit.test("setDesigntimeMode(false) skips URL sync when current variant is the default", async function(assert) {
				const oParseShellHashStub = sandbox.stub().returns({ params: {} });
				const { oURLHandler } = createURLHandlerWithServices(sandbox, {
					URLParsing: { parseShellHash: oParseShellHashStub },
					Navigation: { navigate: sandbox.stub() }
				});
				this.oURLHandler = oURLHandler;
				await oURLHandler.initialize();
				oURLHandler.registerControl();
				// variant1 is the default (see beforeEach setDefault change)
				VariantManagementState.setCurrentVariant({
					reference: sFlexReference,
					vmReference: sVMReference,
					newVReference: "variant1"
				});

				oURLHandler.setDesigntimeMode(true);
				const oUpdateSpy = sandbox.spy(oURLHandler, "update");

				oURLHandler.setDesigntimeMode(false);

				assert.strictEqual(oUpdateSpy.callCount, 0, "update is not called for the default variant on empty URL");
			});

			QUnit.test("setDesigntimeMode(false) does nothing when control was not registered", async function(assert) {
				const oParseShellHashStub = sandbox.stub().returns({ params: {} });
				const { oURLHandler } = createURLHandlerWithServices(sandbox, {
					URLParsing: { parseShellHash: oParseShellHashStub },
					Navigation: { navigate: sandbox.stub() }
				});
				this.oURLHandler = oURLHandler;
				await oURLHandler.initialize();
				VariantManagementState.setCurrentVariant({
					reference: sFlexReference,
					vmReference: sVMReference,
					newVReference: "variant0"
				});

				oURLHandler.setDesigntimeMode(true);
				const oUpdateSpy = sandbox.spy(oURLHandler, "update");

				oURLHandler.setDesigntimeMode(false);

				assert.strictEqual(oUpdateSpy.callCount, 0, "update is not called when control was never registered");
			});

			QUnit.test("setDesigntimeMode(false) is a no-op when not previously in design time mode", async function(assert) {
				const oParseShellHashStub = sandbox.stub().returns({ params: {} });
				const { oURLHandler } = createURLHandlerWithServices(sandbox, {
					URLParsing: { parseShellHash: oParseShellHashStub },
					Navigation: { navigate: sandbox.stub() }
				});
				this.oURLHandler = oURLHandler;
				await oURLHandler.initialize();
				oURLHandler.registerControl();
				VariantManagementState.setCurrentVariant({
					reference: sFlexReference,
					vmReference: sVMReference,
					newVReference: "variant0"
				});
				const oUpdateSpy = sandbox.spy(oURLHandler, "update");

				oURLHandler.setDesigntimeMode(false);

				assert.strictEqual(oUpdateSpy.callCount, 0, "update is not called if design time mode was never entered");
			});
		});
	});

	QUnit.module("URLHandler navigation filter and context change", {
		async beforeEach() {
			sandbox.stub(hasher, "getHash").returns("");
			sandbox.stub(ManifestUtils, "getFlexReferenceForControl").returns(sFlexReference);

			await FlexState.initialize({
				reference: sFlexReference,
				componentId: "testid",
				componentData: {},
				manifest: {}
			});

			FlQUnitUtils.stubFlexObjectsSelector(sandbox, [
				FlexObjectFactory.createFlVariant({
					id: sVMReference,
					variantName: "Standard",
					variantManagementReference: sVMReference,
					reference: sFlexReference,
					layer: Layer.VENDOR
				}),
				FlexObjectFactory.createFlVariant({
					id: "variant1",
					variantName: "variant1",
					variantManagementReference: sVMReference,
					variantReference: sVMReference,
					reference: sFlexReference,
					layer: Layer.VENDOR
				}),
				FlexObjectFactory.createVariantManagementChange({
					id: "setDefault_vm1",
					layer: Layer.VENDOR,
					changeType: "setDefault",
					fileType: "ctrl_variant_management_change",
					selector: { id: sVMReference },
					content: { defaultVariant: "variant1" }
				})
			]);

			VariantManagementState.setCurrentVariant({
				reference: sFlexReference,
				vmReference: sVMReference,
				newVReference: sVMReference
			});

			this.oParseShellHashStub = sandbox.stub().returns({ params: {} });
			this.oRegisterNavigationFilterStub = sandbox.stub();
			this.oUnregisterNavigationFilterStub = sandbox.stub();

			sandbox.stub(Utils, "getUShellService").callsFake((sServiceName) => {
				const mServices = {
					ShellNavigationInternal: {
						registerNavigationFilter: this.oRegisterNavigationFilterStub,
						unregisterNavigationFilter: this.oUnregisterNavigationFilterStub,
						NavigationFilterStatus: { Continue: "Continue" }
					},
					URLParsing: { parseShellHash: this.oParseShellHashStub }
				};
				return Promise.resolve(mServices[sServiceName]);
			});
			sandbox.stub(Utils, "getUshellContainer").returns({});

			this.oURLHandler = new URLHandler({
				vmReference: sVMReference,
				flexReference: sFlexReference,
				appComponent: {}
			});
			await this.oURLHandler.initialize();
			this.oURLHandler.registerControl();
		},
		afterEach() {
			this.oURLHandler.destroy();
			this.oVM?.destroy();
			FlexState.clearState();
			VariantManagementState.resetCurrentVariantReference(sFlexReference, sVMReference);
			sandbox.restore();
		}
	}, function() {
		QUnit.test("navigation filter is called and returns Continue status", function(assert) {
			const fnNavigationFilter = this.oRegisterNavigationFilterStub.firstCall.args[0];
			const sResult = fnNavigationFilter("DummyHash");
			assert.strictEqual(sResult, "Continue", "navigation filter returns Continue status");
		});

		QUnit.test("navigation filter with hash parse error logs error and returns Continue", function(assert) {
			const oLogErrorStub = sandbox.stub(Log, "error");
			this.oParseShellHashStub.throws(new Error("Service Error"));

			const fnNavigationFilter = this.oRegisterNavigationFilterStub.firstCall.args[0];
			const sResult = fnNavigationFilter("DummyHash");

			assert.strictEqual(sResult, "Continue", "Continue status is returned even after error");
			assert.strictEqual(oLogErrorStub.callCount, 1, "the error was logged");
		});

		QUnit.test("navigation filter with a variant parameter belonging to no variant does not update", function(assert) {
			this.oParseShellHashStub.returns({
				params: { [VariantUtil.VARIANT_TECHNICAL_PARAMETER]: ["nonExistingVariant"] }
			});
			const oUpdateSpy = sandbox.spy(this.oURLHandler, "update");

			const fnNavigationFilter = this.oRegisterNavigationFilterStub.firstCall.args[0];
			const sResult = fnNavigationFilter("DummyHash");

			assert.strictEqual(sResult, "Continue", "Continue status is returned");
			assert.strictEqual(oUpdateSpy.callCount, 0, "update() was not called for unknown variant");
		});

		QUnit.test("navigation filter with unchanged variant URL parameter does not call update", function(assert) {
			const sCurrentVariant = VariantManagementState.getCurrentVariantReference({
				vmReference: sVMReference,
				reference: sFlexReference
			});
			this.oParseShellHashStub.returns({
				params: { [VariantUtil.VARIANT_TECHNICAL_PARAMETER]: [sCurrentVariant] }
			});
			const oUpdateSpy = sandbox.spy(this.oURLHandler, "update");

			const fnNavigationFilter = this.oRegisterNavigationFilterStub.firstCall.args[0];
			const sResult = fnNavigationFilter("DummyHash");

			assert.strictEqual(sResult, "Continue", "Continue status is returned");
			assert.strictEqual(oUpdateSpy.callCount, 0, "update() was not called when params are unchanged");
		});

		QUnit.test("navigation filter with changed variant params calls update", function(assert) {
			const sDefaultVariant = VariantManagementState.getDefaultVariantReference({
				vmReference: sVMReference,
				reference: sFlexReference
			});
			const sCurrentVariant = VariantManagementState.getCurrentVariantReference({
				vmReference: sVMReference,
				reference: sFlexReference
			});
			this.oParseShellHashStub.returns({
				params: { [VariantUtil.VARIANT_TECHNICAL_PARAMETER]: [sDefaultVariant, "otherParam"] }
			});
			const oUpdateSpy = sandbox.spy(this.oURLHandler, "update");

			const fnNavigationFilter = this.oRegisterNavigationFilterStub.firstCall.args[0];
			fnNavigationFilter("DummyHash");

			assert.strictEqual(oUpdateSpy.callCount, 1, "update() was called");
			assert.deepEqual(
				oUpdateSpy.firstCall.args[0].parameters,
				[sCurrentVariant, "otherParam"],
				"parameters were replaced with current variant references"
			);
			assert.strictEqual(oUpdateSpy.firstCall.args[0].updateURL, true, "updateURL is true");
		});

		QUnit.test("navigation filter in design time mode sets updateURL=false", function(assert) {
			const sDefaultVariant = VariantManagementState.getDefaultVariantReference({
				vmReference: sVMReference,
				reference: sFlexReference
			});
			this.oParseShellHashStub.returns({
				params: { [VariantUtil.VARIANT_TECHNICAL_PARAMETER]: [sDefaultVariant] }
			});
			this.oURLHandler.setDesigntimeMode(true);
			const oUpdateSpy = sandbox.spy(this.oURLHandler, "update");

			const fnNavigationFilter = this.oRegisterNavigationFilterStub.firstCall.args[0];
			fnNavigationFilter("DummyHash");

			assert.strictEqual(oUpdateSpy.callCount, 1, "update() was called");
			assert.strictEqual(oUpdateSpy.firstCall.args[0].updateURL, false, "updateURL is false in design time mode");
		});

		QUnit.test("navigation filter with empty/falsy variant parameter in URL does not cause error", function(assert) {
			this.oParseShellHashStub.returns({
				params: { [VariantUtil.VARIANT_TECHNICAL_PARAMETER]: [""] }
			});
			const oUpdateSpy = sandbox.spy(this.oURLHandler, "update");

			const fnNavigationFilter = this.oRegisterNavigationFilterStub.firstCall.args[0];
			const sResult = fnNavigationFilter("DummyHash");

			assert.strictEqual(sResult, "Continue", "Continue is returned");
			assert.strictEqual(oUpdateSpy.callCount, 0, "update not called for empty param");
		});

		QUnit.test("handleModelContextChange sets up resetOnContextChange observer and attaches modelContextChange", function(assert) {
			this.oVM = new VariantManagement(sVMReference);

			this.oURLHandler.handleModelContextChange(this.oVM);

			assert.ok(
				this.oVM.hasListeners("modelContextChange"),
				"modelContextChange event listener was attached (resetOnContextChange defaults to true)"
			);
		});

		QUnit.test(
			"handleModelContextChange fires default variant switch on modelContextChange when variant not in URL",
			function(assert) {
				this.oVM = new VariantManagement(sVMReference);
				const oSwitchToDefaultStub = sandbox.stub(VariantManagerApply, "updateCurrentVariant");
				this.oURLHandler.handleModelContextChange(this.oVM);

				this.oParseShellHashStub.returns({ params: {} });
				this.oVM.fireEvent("modelContextChange");

				assert.strictEqual(oSwitchToDefaultStub.callCount, 1, "updateCurrentVariant was called");
				assert.strictEqual(
					oSwitchToDefaultStub.firstCall.args[0].newVariantReference,
					this.oVM.getDefaultVariantKey(),
					"switch was called with the default variant"
				);
			}
		);

		QUnit.test(
			"handleModelContextChange does not switch variant when variant is found in URL",
			function(assert) {
				this.oVM = new VariantManagement(sVMReference);
				const oSwitchToDefaultStub = sandbox.stub(VariantManagerApply, "updateCurrentVariant");
				this.oURLHandler.handleModelContextChange(this.oVM);

				this.oParseShellHashStub.returns({
					params: {
						[VariantUtil.VARIANT_TECHNICAL_PARAMETER]: [sVMReference]
					}
				});
				sandbox.stub(VariantManagementState, "getVariant").callsFake((mParams) => {
					return mParams.vmReference === sVMReference && mParams.vReference === sVMReference
						? { simulate: "foundVariant" }
						: undefined;
				});

				this.oVM.fireEvent("modelContextChange");

				assert.strictEqual(oSwitchToDefaultStub.callCount, 0, "updateCurrentVariant was not called");
			}
		);

		QUnit.test(
			"handleModelContextChange does nothing on modelContextChange when registerControl was not called",
			async function(assert) {
				const oURLHandler = new URLHandler({
					vmReference: sVMReference,
					flexReference: sFlexReference,
					appComponent: {}
				});
				await oURLHandler.initialize();
				this.oVM = new VariantManagement(sVMReference);
				const oSwitchToDefaultStub = sandbox.stub(VariantManagerApply, "updateCurrentVariant");

				oURLHandler.handleModelContextChange(this.oVM);

				this.oVM.fireEvent("modelContextChange");

				assert.strictEqual(
					oSwitchToDefaultStub.callCount, 0, "updateCurrentVariant was not called when registerControl was not called"
				);

				oURLHandler.destroy();
			}
		);

		QUnit.test(
			"handleModelContextChange detaches modelContextChange handler when resetOnContextChange changes to false",
			function(assert) {
				assert.expect(1);
				this.oVM = new VariantManagement(sVMReference);
				this.oURLHandler.handleModelContextChange(this.oVM);

				sandbox.stub(this.oVM, "detachEvent").callsFake((sEventName, fnCallback) => {
					if (sEventName === "modelContextChange") {
						assert.ok(typeof fnCallback === "function", "the event handler was detached from modelContextChange");
					}
				});
				this.oVM.setResetOnContextChange(false);
			}
		);

		QUnit.test(
			"handleModelContextChange re-attaches modelContextChange handler when resetOnContextChange changes to true",
			function(assert) {
				assert.expect(1);
				this.oVM = new VariantManagement(sVMReference);
				this.oVM.setResetOnContextChange(false);
				this.oURLHandler.handleModelContextChange(this.oVM);

				sandbox.stub(this.oVM, "attachEvent").callsFake((sEventName, fnCallback) => {
					if (sEventName === "modelContextChange") {
						assert.ok(typeof fnCallback === "function", "the event handler was re-attached to modelContextChange");
					}
				});
				this.oVM.setResetOnContextChange(true);
			}
		);
	});

	QUnit.module("URLHandler.removeVariantParameterFromURL()", {
		beforeEach() {
			this.oGetHashStub = sandbox.stub(hasher, "getHash").returns("someHash");
			this.oReplaceHashStub = sandbox.stub(hasher, "replaceHash");
			this.oConstructShellHashStub = sandbox.stub().returns("newHash");
		},
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("removes the variant parameter and replaces the hash silently", async function(assert) {
			sandbox.stub(Utils, "getUShellService").withArgs("URLParsing").resolves({
				parseShellHash: sandbox.stub().returns({
					params: { [VariantUtil.VARIANT_TECHNICAL_PARAMETER]: ["variant1"] }
				}),
				constructShellHash: this.oConstructShellHashStub
			});
			let bHasherDisabledDuringReplace;
			this.oReplaceHashStub.callsFake(() => {
				bHasherDisabledDuringReplace = !hasher.changed.active;
			});

			await URLHandler.removeVariantParameterFromURL();

			assert.strictEqual(this.oReplaceHashStub.callCount, 1, "hasher.replaceHash was called once");
			assert.strictEqual(this.oReplaceHashStub.firstCall.args[0], "newHash", "hasher.replaceHash was called with the constructed hash");
			const oConstructArgs = this.oConstructShellHashStub.firstCall.args[0];
			assert.notOk(
				VariantUtil.VARIANT_TECHNICAL_PARAMETER in oConstructArgs.params,
				"the variant technical parameter was removed before constructShellHash was called"
			);
			assert.ok(bHasherDisabledDuringReplace, "hasher changed events were disabled during the hash replacement");
			assert.ok(hasher.changed.active, "hasher changed events are re-activated after the update");
		});

		QUnit.test("returns early when the variant parameter is not present in the URL", async function(assert) {
			sandbox.stub(Utils, "getUShellService").withArgs("URLParsing").resolves({
				parseShellHash: sandbox.stub().returns({ params: {} }),
				constructShellHash: this.oConstructShellHashStub
			});

			await URLHandler.removeVariantParameterFromURL();

			assert.strictEqual(this.oReplaceHashStub.callCount, 0, "hasher.replaceHash was not called");
		});

		QUnit.test("returns early when the URLParsing service is unavailable", async function(assert) {
			sandbox.stub(Utils, "getUShellService").withArgs("URLParsing").resolves(undefined);

			await URLHandler.removeVariantParameterFromURL();

			assert.strictEqual(this.oReplaceHashStub.callCount, 0, "hasher.replaceHash was not called");
		});
	});
});
