/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/test/starter/_coverageFilter",
	"sap/ui/qunit/qunit-coverage-istanbul"
], function (_coverageFilter) {
	/*global QUnit */
	"use strict";

	// These cases exercise the single shared matcher (matchPatternAttribute + shouldBeInstrumented
	// precedence) that lives in sap/ui/qunit/qunit-coverage-istanbul.js, reached through
	// buildCoverageIgnore. They lock the resource-name handling (verbatim ".js") and the
	// cover-only/cover-never precedence that _coverageFilter relies on.

	QUnit.module("buildCoverageIgnore");

	QUnit.test("cover-only allowlist (substring match)", function (assert) {
		var fnIgnore = _coverageFilter.buildCoverageIgnore("sap/m/", undefined);
		assert.strictEqual(fnIgnore("sap/m/Button.js"), true, "covered module loads single-file");
		assert.strictEqual(fnIgnore("sap/ui/core/Core.js"), false, "non-covered module stays bundled");
	});

	QUnit.test("resource name is matched verbatim, including its '.js' extension", function (assert) {
		// The loader passes the resource name with the ".js" extension (e.g. "sap/m/Button.js"),
		// and the instrument side in qunit-coverage-istanbul.js matches the very same form. The
		// filter must therefore not strip ".js" — doing so would make the single-file set differ
		// from the instrumented set for extension-sensitive (anchored) patterns.
		var fnIgnore = _coverageFilter.buildCoverageIgnore("sap/m/Button", undefined);
		assert.strictEqual(fnIgnore("sap/m/Button.js"), true, "substring match still covers the .js name");
	});

	QUnit.test("cover-never wins over cover-only", function (assert) {
		var fnIgnore = _coverageFilter.buildCoverageIgnore("sap/m/", "sap/m/Button");
		assert.strictEqual(fnIgnore("sap/m/Button.js"), false, "excluded although it matches 'only'");
		assert.strictEqual(fnIgnore("sap/m/Text.js"), true, "other 'only' matches stay included");
	});

	QUnit.test("absent cover-only includes everything except cover-never", function (assert) {
		var fnIgnoreAll = _coverageFilter.buildCoverageIgnore(undefined, undefined);
		assert.strictEqual(fnIgnoreAll("anything/at/all.js"), true, "no 'only' => everything");

		var fnIgnore = _coverageFilter.buildCoverageIgnore(undefined, "sap/ui/thirdparty/");
		assert.strictEqual(fnIgnore("sap/ui/thirdparty/jquery.js"), false, "'never' still excludes");
		assert.strictEqual(fnIgnore("sap/m/Button.js"), true);
	});

	QUnit.test("null and undefined are both treated as 'not set'", function (assert) {
		var fnIgnore = _coverageFilter.buildCoverageIgnore("sap/m/", null);
		assert.strictEqual(fnIgnore("sap/m/Button.js"), true, "null 'never' behaves like absent 'never'");

		var fnIgnoreNull = _coverageFilter.buildCoverageIgnore(null, null);
		assert.strictEqual(fnIgnoreNull("sap/m/Button.js"), true, "null 'only' behaves like absent 'only'");
	});

	QUnit.test("array cover-only", function (assert) {
		var fnIgnore = _coverageFilter.buildCoverageIgnore(["sap/m/", "sap/f/"], undefined);
		assert.strictEqual(fnIgnore("sap/m/Button.js"), true);
		assert.strictEqual(fnIgnore("sap/f/Card.js"), true);
		assert.strictEqual(fnIgnore("sap/ui/core/Core.js"), false);
	});

	QUnit.test("serialized-array string cover-only (as written to the script attribute)", function (assert) {
		// _setupAndStart serializes array filters via JSON.stringify; matchPatternAttribute
		// understands the "[...]" string form as well.
		var fnIgnore = _coverageFilter.buildCoverageIgnore('["sap/m/","sap/f/"]', undefined);
		assert.strictEqual(fnIgnore("sap/m/Button.js"), true);
		assert.strictEqual(fnIgnore("sap/ui/core/Core.js"), false);
	});

	QUnit.test("regex cover-only matches the full resource name (incl. '.js')", function (assert) {
		// Because the name is matched verbatim, a "$"-anchored pattern must account for the
		// ".js" extension — exactly as it would on the instrument side.
		var fnIgnore = _coverageFilter.buildCoverageIgnore("//Button\\.js$/", undefined);
		assert.strictEqual(fnIgnore("sap/m/Button.js"), true, "anchored $ matches the '.js' name");
		assert.strictEqual(fnIgnore("sap/m/Buttons.js"), false);

		// A pattern that forgot the extension does NOT match the loader's ".js" name — the same
		// (non-)match the instrument side would produce, so the two sets stay in agreement.
		var fnIgnoreNoExt = _coverageFilter.buildCoverageIgnore("//Button$/", undefined);
		assert.strictEqual(fnIgnoreNoExt("sap/m/Button.js"), false, "anchored $ without .js does not match");
	});

	QUnit.test("malformed filter pattern degrades to 'stay bundled' instead of throwing", function (assert) {
		// The predicate runs inside the loader for every module. A "#fn" pattern naming a
		// missing global throws inside matchPatternAttribute; it must be caught and resolved
		// to false (keep bundled) rather than abort module loading. If it threw, QUnit would
		// report this test as errored.
		var fnIgnore = _coverageFilter.buildCoverageIgnore("#__missingCoverageFilterFn__", undefined);
		assert.strictEqual(fnIgnore("sap/m/Button.js"), false,
			"throwing pattern is caught; module stays bundled");
	});

	QUnit.module("buildSingleFileIgnore (covered set ∪ sap-ui-debug)");

	QUnit.test("no debug — equals the covered set", function (assert) {
		[undefined, null, "false"].forEach(function(vDebug) {
			var fn = _coverageFilter.buildSingleFileIgnore("sap/m/", undefined, vDebug);
			assert.strictEqual(fn("sap/m/Button.js"), true, "covered → single-file (" + JSON.stringify(vDebug) + ")");
			assert.strictEqual(fn("sap/ui/core/Core.js"), false, "non-covered → bundled (" + JSON.stringify(vDebug) + ")");
		});
	});

	QUnit.test("debug all ('' / 'true') — everything single-file, overriding cover-only", function (assert) {
		["", "true"].forEach(function(vDebug) {
			var fn = _coverageFilter.buildSingleFileIgnore("sap/m/", undefined, vDebug);
			assert.strictEqual(fn("sap/m/Button.js"), true, JSON.stringify(vDebug) + " → all");
			assert.strictEqual(fn("sap/ui/core/Core.js"), true, "even outside cover-only (" + JSON.stringify(vDebug) + ")");
		});
	});

	QUnit.test("debug all overrides cover-never too", function (assert) {
		var fn = _coverageFilter.buildSingleFileIgnore("sap/m/", "sap/ui/thirdparty/", "true");
		assert.strictEqual(fn("sap/ui/thirdparty/jquery.js"), true, "debug all beats cover-never");
	});

	QUnit.test("debug pattern — adds modules beyond the covered set", function (assert) {
		var fn = _coverageFilter.buildSingleFileIgnore("sap/m/", undefined, "sap/ui/core/");
		assert.strictEqual(fn("sap/m/Button.js"), true, "covered");
		assert.strictEqual(fn("sap/ui/core/Core.js"), true, "debug-only → single-file although not covered");
		assert.strictEqual(fn("sap/f/Card.js"), false, "neither → bundled");
	});

	QUnit.test("debug pattern overrides cover-never (the key merge rule)", function (assert) {
		// cover-never excludes sap/m/Button from the covered set, but an overlapping sap-ui-debug
		// still selects it for (uninstrumented) single-file loading — debug wins.
		var fn = _coverageFilter.buildSingleFileIgnore("sap/m/", "sap/m/Button", "sap/m/Button");
		assert.strictEqual(fn("sap/m/Button.js"), true, "debug re-selects what cover-never excluded");
		assert.strictEqual(fn("sap/m/Text.js"), true, "other covered modules unaffected");

		var fnNoDebug = _coverageFilter.buildSingleFileIgnore("sap/m/", "sap/m/Button", undefined);
		assert.strictEqual(fnNoDebug("sap/m/Button.js"), false, "without debug it stays bundled");
	});

	QUnit.test("malformed debug pattern degrades to 'stay bundled'", function (assert) {
		// The debug half is built via buildCoverageIgnore, so it inherits the same try/catch:
		// a throwing pattern must not abort module loading.
		var fn = _coverageFilter.buildSingleFileIgnore("sap/m/", undefined, "#__missingDebugFilterFn__");
		assert.strictEqual(fn("sap/m/Button.js"), true, "covered module still loads single-file");
		assert.strictEqual(fn("sap/f/Card.js"), false, "throwing debug pattern caught; stays bundled");
	});

	QUnit.module("exports");

	QUnit.test("public shape", function (assert) {
		// Only the predicate builders are public; the matcher and precedence helpers are internal
		// (their behaviour is exercised through buildCoverageIgnore above).
		assert.strictEqual(typeof _coverageFilter.buildCoverageIgnore, "function");
		assert.strictEqual(typeof _coverageFilter.buildSingleFileIgnore, "function");
		assert.deepEqual(Object.keys(_coverageFilter),
			["buildCoverageIgnore", "buildSingleFileIgnore"],
			"no internal helpers are exported");
	});
});
