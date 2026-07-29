/* global QUnit */

sap.ui.define([
	"sap/ui/fl/support/debug/debug-tools",
	"sap/ui/fl/support/api/SupportAPI",
	"sap/ui/thirdparty/sinon-4"
], function(
	debugTools,
	SupportAPI,
	sinon
) {
	"use strict";

	const sandbox = sinon.createSandbox();

	QUnit.module("Basic structure", {
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("provides help entries", function(assert) {
			assert.ok(Array.isArray(debugTools.__help), "then __help is an array");
			assert.strictEqual(debugTools.__help.length, 5, "then five help entries are provided");
			debugTools.__help.forEach(function(oEntry) {
				assert.ok(typeof oEntry.cmd === "string" && oEntry.cmd.length > 0, "then the entry has a command string");
				assert.ok(typeof oEntry.text === "string" && oEntry.text.length > 0, "then the entry has a description text");
			});
		});

		QUnit.test("exposes the tools under the 'flexFl' sub-namespace", function(assert) {
			assert.ok(debugTools.flexFl, "then the flexFl scope exists");
			assert.strictEqual(typeof debugTools.flexFl.getApplicationComponent, "function", "then getApplicationComponent is a function");
			assert.strictEqual(typeof debugTools.flexFl.getFlexSettings, "function", "then getFlexSettings is a function");
			assert.strictEqual(typeof debugTools.flexFl.getAllUIChanges, "function", "then getAllUIChanges is a function");
			assert.strictEqual(typeof debugTools.flexFl.getFlexObjectInfos, "function", "then getFlexObjectInfos is a function");
			assert.strictEqual(typeof debugTools.flexFl.getChangeDependencies, "function", "then getChangeDependencies is a function");
		});

		QUnit.test("the flexFl scope does not inherit from Object.prototype", function(assert) {
			assert.strictEqual(Object.getPrototypeOf(debugTools.flexFl), null, "then the scope has no prototype chain");
		});
	});

	QUnit.module("Delegation to SupportAPI", {
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("getApplicationComponent delegates to SupportAPI", async function(assert) {
			const oComponent = { id: "appComponent" };
			const oStub = sandbox.stub(SupportAPI, "getApplicationComponent").resolves(oComponent);

			const oResult = await debugTools.flexFl.getApplicationComponent();

			assert.ok(oStub.calledOnce, "then SupportAPI.getApplicationComponent was called once");
			assert.strictEqual(oResult, oComponent, "then the component from SupportAPI is returned");
		});

		QUnit.test("getFlexSettings delegates to SupportAPI", async function(assert) {
			const oSettings = { versioning: true };
			const oStub = sandbox.stub(SupportAPI, "getFlexSettings").resolves(oSettings);

			const oResult = await debugTools.flexFl.getFlexSettings();

			assert.ok(oStub.calledOnce, "then SupportAPI.getFlexSettings was called once");
			assert.strictEqual(oResult, oSettings, "then the settings from SupportAPI are returned");
		});

		QUnit.test("getAllUIChanges delegates to SupportAPI", async function(assert) {
			const aChanges = [{ id: "change1" }, { id: "change2" }];
			const oStub = sandbox.stub(SupportAPI, "getAllUIChanges").resolves(aChanges);

			const aResult = await debugTools.flexFl.getAllUIChanges();

			assert.ok(oStub.calledOnce, "then SupportAPI.getAllUIChanges was called once");
			assert.strictEqual(aResult, aChanges, "then the changes from SupportAPI are returned");
		});

		QUnit.test("getFlexObjectInfos delegates to SupportAPI", async function(assert) {
			const oInfos = { allFlexObjects: [] };
			const oStub = sandbox.stub(SupportAPI, "getFlexObjectInfos").resolves(oInfos);

			const oResult = await debugTools.flexFl.getFlexObjectInfos();

			assert.ok(oStub.calledOnce, "then SupportAPI.getFlexObjectInfos was called once");
			assert.strictEqual(oResult, oInfos, "then the flex object infos from SupportAPI are returned");
		});

		QUnit.test("getChangeDependencies delegates to SupportAPI", async function(assert) {
			const oDependencies = { dependencyMap: {} };
			const oStub = sandbox.stub(SupportAPI, "getChangeDependencies").resolves(oDependencies);

			const oResult = await debugTools.flexFl.getChangeDependencies();

			assert.ok(oStub.calledOnce, "then SupportAPI.getChangeDependencies was called once");
			assert.strictEqual(oResult, oDependencies, "then the change dependencies from SupportAPI are returned");
		});

		QUnit.test("propagates errors from SupportAPI", async function(assert) {
			const oError = new Error("SupportAPI failure");
			sandbox.stub(SupportAPI, "getAllUIChanges").rejects(oError);

			try {
				await debugTools.flexFl.getAllUIChanges();
				assert.ok(false, "then an error should have been thrown");
			} catch (oCaughtError) {
				assert.strictEqual(oCaughtError, oError, "then the error from SupportAPI is propagated");
			}
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
