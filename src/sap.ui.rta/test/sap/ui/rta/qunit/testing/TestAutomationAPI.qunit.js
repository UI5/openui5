/* global QUnit */

sap.ui.define([
	"sap/ui/rta/api/FrontendActionsAPI",
	"sap/ui/rta/testing/TestAutomationAPI",
	"sap/ui/rta/util/ai/FrontendActionResult",
	"sap/ui/rta/util/ai/FrontendActionError",
	"sap/ui/thirdparty/sinon-4"
], function(
	FrontendActionsAPI,
	TestAutomationAPI,
	FrontendActionResult,
	FrontendActionError,
	sinon
) {
	"use strict";

	const sandbox = sinon.createSandbox();

	// Every TestAutomationAPI method delegates to FrontendActionsAPI and unwraps its FrontendActionResult
	// envelope (success -> resolve with payload, failure -> reject with a descriptive Error). The tests
	// stub FrontendActionsAPI, so no running RTA is needed.
	QUnit.module("TestAutomationAPI delegates to FrontendActionsAPI", {
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("enterAdaptationMode delegates to startRTA", async function(assert) {
			const oStub = sandbox.stub(FrontendActionsAPI, "startRTA").resolves(FrontendActionResult.success(true));
			await TestAutomationAPI.enterAdaptationMode();
			assert.ok(oStub.calledOnce, "FrontendActionsAPI.startRTA was called once");
		});

		QUnit.test("enterAdaptationMode suppresses the AI visualization overlay before starting", async function(assert) {
			const oReporterStub = sandbox.stub(FrontendActionsAPI, "setStatusReporter");
			const oStartStub = sandbox.stub(FrontendActionsAPI, "startRTA").resolves(FrontendActionResult.success(true));

			await TestAutomationAPI.enterAdaptationMode();

			assert.ok(oReporterStub.calledOnce, "the status reporter was set");
			assert.strictEqual(
				oReporterStub.getCall(0).args[0],
				FrontendActionsAPI.NoopStatusReporter,
				"the NoopStatusReporter was installed (no AI input-gating overlay)"
			);
			assert.ok(
				oReporterStub.calledBefore(oStartStub),
				"the reporter is set BEFORE startRTA, so startRTA's first setStatus never installs the overlay"
			);
		});

		QUnit.test("save delegates to saveChanges", async function(assert) {
			const oStub = sandbox.stub(FrontendActionsAPI, "saveChanges").resolves(FrontendActionResult.success(true));
			await TestAutomationAPI.save();
			assert.ok(oStub.calledOnce, "FrontendActionsAPI.saveChanges was called once");
		});

		QUnit.test("activateVersion forwards the title to saveAndActivateChanges", async function(assert) {
			const oStub = sandbox.stub(FrontendActionsAPI, "saveAndActivateChanges").resolves(FrontendActionResult.success(true));
			await TestAutomationAPI.activateVersion("v1");
			assert.ok(oStub.calledOnce, "saveAndActivateChanges was called once");
			assert.deepEqual(oStub.getCall(0).args[0], { title: "v1" }, "the title was forwarded in the payload");
		});

		QUnit.test("exitRTA delegates to stopRTA", async function(assert) {
			const oStub = sandbox.stub(FrontendActionsAPI, "stopRTA").resolves(FrontendActionResult.success(true));
			await TestAutomationAPI.exitRTA();
			assert.ok(oStub.calledOnce, "FrontendActionsAPI.stopRTA was called once");
		});

		QUnit.test("saveAndReload delegates to saveAndReloadApp", async function(assert) {
			const oReloadStub = sandbox.stub(FrontendActionsAPI, "saveAndReloadApp").resolves(FrontendActionResult.success(true));

			await TestAutomationAPI.saveAndReload();

			assert.ok(oReloadStub.calledOnce, "saveAndReloadApp was called once");
		});

		QUnit.test("saveAndReload rejects if saveAndReloadApp fails", async function(assert) {
			sandbox.stub(FrontendActionsAPI, "saveAndReloadApp")
			.resolves(FrontendActionResult.failure(FrontendActionError.ErrorCodes.GENERIC_ERROR, "reload boom"));

			let bRejected = false;
			try {
				await TestAutomationAPI.saveAndReload();
			} catch (oError) {
				bRejected = true;
				assert.ok(/reload boom/.test(oError.message), "the rejection carries the reload failure message");
			}
			assert.ok(bRejected, "the call rejected on failure");
		});

		QUnit.test("a FrontendActionsAPI failure envelope rejects with a descriptive Error", async function(assert) {
			sandbox.stub(FrontendActionsAPI, "saveAndActivateChanges")
			.resolves(FrontendActionResult.failure(FrontendActionError.ErrorCodes.INVALID_PARAMETERS, "A non-empty title is required"));

			let bRejected = false;
			try {
				await TestAutomationAPI.activateVersion("");
			} catch (oError) {
				bRejected = true;
				assert.ok(/non-empty title/.test(oError.message), "the backend failure message is surfaced");
				assert.ok(/INVALID_PARAMETERS/.test(oError.message), "the error code is surfaced");
			}
			assert.ok(bRejected, "a failure envelope becomes a rejected promise (not a silent resolve)");
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
