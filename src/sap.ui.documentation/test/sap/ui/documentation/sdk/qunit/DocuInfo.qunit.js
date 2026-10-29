/*global QUnit, sinon*/
sap.ui.define([
	"sap/ui/documentation/sdk/controller/util/DocuInfo",
	"sap/ui/thirdparty/jquery"
], function (DocuInfo, jQuery) {
	"use strict";

	// DocuInfo keeps oCachedData and an in-flight promise in module-level closures
	// that survive across tests. The three behaviours form a natural sequence:
	// (1) concurrent calls share one XHR → reject → (2) retry fires a new XHR →
	// succeed → (3) subsequent call hits cache. One chained async test avoids any
	// cross-test state leak.

	var oConfig = { docuPath: "docs/topics/" };

	QUnit.module("DocuInfo.getDocuIndexPromise");

	QUnit.test("deduplicates concurrent calls, retries after rejection, caches after success",
		function (assert) {
			var done = assert.async();
			var sandbox = sinon.createSandbox();
			var ajaxDeferred;
			var oData = { topics: ["item"] };

			sandbox.stub(jQuery, "ajax").callsFake(function (oSettings) {
				ajaxDeferred = {
					resolve: oSettings.success,
					reject: oSettings.error
				};
			});

			// ── Phase 1: two concurrent calls share one XHR ──────────────────
			var p1 = DocuInfo.getDocuIndexPromise(oConfig);
			var p2 = DocuInfo.getDocuIndexPromise(oConfig);

			assert.strictEqual(jQuery.ajax.callCount, 1,
				"phase 1: only one jQuery.ajax call for two concurrent requests");

			ajaxDeferred.reject({ status: 469 });

			Promise.all([
				p1.catch(function (e) { return e; }),
				p2.catch(function (e) { return e; })
			])

			// ── Phase 2: after rejection retry fires a new XHR ───────────────
			.then(function (aErrors) {
				assert.ok(aErrors[0] && aErrors[0].status === 469,
					"phase 1: first caller receives the rejection value");
				assert.strictEqual(aErrors[0], aErrors[1],
					"phase 1: both callers receive the same rejection value");

				var p3 = DocuInfo.getDocuIndexPromise(oConfig);

				assert.strictEqual(jQuery.ajax.callCount, 2,
					"phase 2: a new ajax call is made after rejection (cache cleared)");

				ajaxDeferred.resolve(oData);
				return p3;
			})

			// ── Phase 3: after success subsequent call hits cache ─────────────
			.then(function (oResult) {
				assert.strictEqual(oResult, oData,
					"phase 2: retry resolves with data");

				var callCountBeforeCache = jQuery.ajax.callCount;
				var p4 = DocuInfo.getDocuIndexPromise(oConfig);

				assert.strictEqual(jQuery.ajax.callCount, callCountBeforeCache,
					"phase 3: no new ajax call when cache is populated");

				return p4;
			})

			.then(function (oCachedResult) {
				assert.strictEqual(oCachedResult, oData,
					"phase 3: cached result is returned");
			})
			.catch(function (oErr) {
				assert.ok(false, "unexpected rejection: " + (oErr && oErr.message || oErr));
			})
			.finally(function () {
				sandbox.restore();
				done();
			});
		}
	);
});
