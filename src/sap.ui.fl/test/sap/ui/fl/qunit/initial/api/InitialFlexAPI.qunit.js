/* global QUnit */

sap.ui.define([
	"sap/ui/core/Control",
	"sap/ui/fl/apply/_internal/flexState/FlexObjectState",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/initial/_internal/FlexInfoSession",
	"sap/ui/fl/initial/_internal/Settings",
	"sap/ui/fl/initial/api/InitialFlexAPI",
	"sap/ui/fl/Layer",
	"sap/ui/fl/Utils",
	"sap/ui/thirdparty/sinon-4"
], (
	Control,
	FlexObjectState,
	FlexState,
	FlexInfoSession,
	Settings,
	InitialFlexAPI,
	Layer,
	Utils,
	sinon
) => {
	"use strict";
	const sandbox = sinon.createSandbox();
	const sReference = "test.app";

	QUnit.module("InitialFlexAPI", {
		beforeEach() {
			window.sessionStorage.removeItem(`sap.ui.rta.restart.${Layer.CUSTOMER}`);
			window.sessionStorage.removeItem(`sap.ui.rta.restart.${Layer.USER}`);
		},
		afterEach() {
			sandbox.restore();
			FlexInfoSession.removeByReference(sReference);
		}
	}, function() {
		QUnit.test("isKeyUser", function(assert) {
			sandbox.stub(Settings, "getInstance").resolves({
				getIsKeyUser: () => true
			});
			const bIsKeyUser = InitialFlexAPI.isKeyUser();
			assert.ok(bIsKeyUser, "the user is a key user");
		});

		QUnit.test("getFlexVersion - flex info session exists with version", function(assert) {
			FlexInfoSession.setByReference({ version: "1" }, sReference);
			assert.strictEqual(InitialFlexAPI.getFlexVersion({ reference: sReference }), "1", "version exists");
		});

		QUnit.test("getFlexVersion - no flex info session exists", function(assert) {
			FlexInfoSession.removeByReference(sReference);
			assert.strictEqual(InitialFlexAPI.getFlexVersion({ reference: sReference }), undefined, "version doesn't exists");
		});

		QUnit.test("automaticRtaStartEnabled", function(assert) {
			assert.notOk(InitialFlexAPI.isAutomaticRtaStartEnabled(), "automatic RTA start is not enabled");

			window.sessionStorage.setItem(`sap.ui.rta.restart.${Layer.CUSTOMER}`, true);
			assert.ok(InitialFlexAPI.isAutomaticRtaStartEnabled(), "automatic RTA start is enabled");

			window.sessionStorage.removeItem(`sap.ui.rta.restart.${Layer.CUSTOMER}`);
			assert.notOk(InitialFlexAPI.isAutomaticRtaStartEnabled(), "automatic RTA start is not enabled");

			window.sessionStorage.setItem(`sap.ui.rta.restart.${Layer.USER}`, true);
			assert.ok(InitialFlexAPI.isAutomaticRtaStartEnabled(Layer.USER), "automatic RTA start is enabled for user layer");
			assert.notOk(InitialFlexAPI.isAutomaticRtaStartEnabled(Layer.CUSTOMER), "automatic RTA start is not enabled for customer layer");

			window.sessionStorage.removeItem(`sap.ui.rta.restart.${Layer.USER}`);
			assert.notOk(InitialFlexAPI.isAutomaticRtaStartEnabled(Layer.USER), "automatic RTA start is not enabled for user layer");
		});
	});

	QUnit.module("InitialFlexAPI.waitForChanges", {
		beforeEach() {
			this.oAppComponent = { foo: "bar" };
			sandbox.stub(Utils, "getAppComponentForSelector").returns(this.oAppComponent);
			this.aObjectsToDestroy = [];
			this.oFOStateWaitForFlexObjectsStub = sandbox.stub(FlexObjectState, "waitForFlexObjectsToBeApplied").resolves();
			this.oIsInitializedStub = sandbox.stub(FlexState, "isInitialized").returns(true);
		},
		afterEach() {
			sandbox.restore();
			this.aObjectsToDestroy.forEach((oObject) => oObject.destroy());
		}
	}, function() {
		QUnit.test("with a single control", async function(assert) {
			const oControl = new Control();
			this.aObjectsToDestroy.push(oControl);

			await InitialFlexAPI.waitForChanges({ element: oControl });
			assert.strictEqual(this.oFOStateWaitForFlexObjectsStub.callCount, 1, "the FlexObject.waitForFlexObjects method was called");

			const aPassedValues = [
				[{
					selector: oControl
				}],
				this.oAppComponent
			];
			assert.ok(this.oFOStateWaitForFlexObjectsStub.alwaysCalledWithExactly(...aPassedValues), "the correct parameters are passed");
		});

		QUnit.test("with multiple controls", async function(assert) {
			const oControl = new Control();
			const oControl1 = new Control();
			this.aObjectsToDestroy.push(oControl, oControl1);
			const aControls = [oControl, oControl1];

			await InitialFlexAPI.waitForChanges({ selectors: aControls });
			assert.strictEqual(this.oFOStateWaitForFlexObjectsStub.callCount, 1, "the FlexObject.waitForFlexObjects method was called");

			const aPassedValues = [
				[{
					selector: oControl
				}, {
					selector: oControl1
				}],
				this.oAppComponent
			];
			assert.ok(this.oFOStateWaitForFlexObjectsStub.alwaysCalledWithExactly(...aPassedValues), "the correct parameters are passed");
		});

		QUnit.test("with change types", async function(assert) {
			const oControl = new Control();
			const oControl1 = new Control();
			this.aObjectsToDestroy.push(oControl, oControl1);
			const aComplexSelectors = [
				{
					selector: oControl,
					changeTypes: ["changeType1", "changeType2"]
				},
				{
					selector: oControl1,
					changeTypes: ["changeType3", "changeType4"]
				}
			];

			await InitialFlexAPI.waitForChanges({ complexSelectors: aComplexSelectors });
			assert.strictEqual(this.oFOStateWaitForFlexObjectsStub.callCount, 1, "the FlexObject.waitForFlexObjects method was called");

			const aPassedValues = [
				[{
					selector: oControl,
					changeTypes: ["changeType1", "changeType2"]
				}, {
					selector: oControl1,
					changeTypes: ["changeType3", "changeType4"]
				}],
				this.oAppComponent
			];
			assert.ok(this.oFOStateWaitForFlexObjectsStub.alwaysCalledWithExactly(...aPassedValues), "the correct parameters are passed");
		});

		QUnit.test("skips loading the apply package when FlexState is not initialized for the component", async function(assert) {
			this.oIsInitializedStub.returns(false);
			const oControl = new Control();
			this.aObjectsToDestroy.push(oControl);

			const vResult = await InitialFlexAPI.waitForChanges({ element: oControl });

			assert.strictEqual(vResult, undefined, "the call resolves with undefined");
			assert.strictEqual(this.oFOStateWaitForFlexObjectsStub.callCount, 0,
				"FlexObjectState.waitForFlexObjectsToBeApplied is not called");
			assert.ok(this.oIsInitializedStub.calledWith({ control: this.oAppComponent }),
				"isInitialized is probed with the resolved app component");
		});

		QUnit.test("awaits FlexObjectState when FlexState is initialized (covers in-flight FlexObjects)", async function(assert) {
			const oControl = new Control();
			this.aObjectsToDestroy.push(oControl);

			await InitialFlexAPI.waitForChanges({ element: oControl });

			assert.strictEqual(this.oFOStateWaitForFlexObjectsStub.callCount, 1,
				"the FlexObject.waitForFlexObjects method was called");
		});

		QUnit.test("with multiple types of selectors and an element", async function(assert) {
			const oControl = new Control();
			const oControl1 = new Control();
			const oControl2 = new Control();
			this.aObjectsToDestroy.push(oControl, oControl1, oControl2);
			const aComplexSelectors = [
				{
					selector: oControl2,
					changeTypes: ["changeType1", "changeType2"]
				}
			];
			await InitialFlexAPI.waitForChanges({
				element: oControl,
				selectors: [oControl1],
				complexSelectors: aComplexSelectors
			});
			const aPassedValues = [
				[{
					selector: oControl
				}],
				this.oAppComponent
			];
			assert.ok(this.oFOStateWaitForFlexObjectsStub.alwaysCalledWithExactly(...aPassedValues), "the correct parameters are passed");
		});

		QUnit.test("with multiple types of selectors", async function(assert) {
			const oControl = new Control();
			const oControl1 = new Control();
			this.aObjectsToDestroy.push(oControl, oControl1);
			const aComplexSelectors = [
				{
					selector: oControl1,
					changeTypes: ["changeType1", "changeType2"]
				}
			];
			await InitialFlexAPI.waitForChanges({
				selectors: [oControl],
				complexSelectors: aComplexSelectors
			});
			const aPassedValues = [
				[{
					selector: oControl
				}],
				this.oAppComponent
			];
			assert.ok(this.oFOStateWaitForFlexObjectsStub.alwaysCalledWithExactly(...aPassedValues), "the correct parameters are passed");
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});