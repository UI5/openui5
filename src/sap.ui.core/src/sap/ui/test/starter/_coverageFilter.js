/*!
 * ${copyright}
 */

/*
 * IMPORTANT: This is a private module, its API must not be used and is subject to change.
 *
 * It derives the set of modules to load individually (single-file, outside their preload bundle)
 * for a coverage run from the same "cover-only"/"cover-never" matching that decides what gets
 * instrumented. The matching itself lives in sap/ui/qunit/qunit-coverage-istanbul.js (a plain
 * script that must also work on static test pages, before AMD is usable) and is exposed there as
 * window["sap-ui-qunit-coverage-shouldBeInstrumented"].
 */
sap.ui.define(["sap/base/Log"], function(Log) {
	"use strict";

	/**
	 * Build a predicate for <code>sap.ui.loader.config({ ignoreBundledResources })</code> that
	 * returns <code>true</code> for exactly those modules which the Istanbul coverage would
	 * instrument. Such modules are then left in state INITIAL (ignoring their bundle) and fetched
	 * individually as unminified <code>-dbg</code> sources, where the middleware can instrument them.
	 *
	 * @param {string|string[]|null|undefined} vOnly the <code>cover-only</code> config
	 * @param {string|string[]|null|undefined} vNever the <code>cover-never</code> config
	 * @returns {function(string):boolean} the ignore predicate
	 * @private
	 */
	function buildCoverageIgnore(vOnly, vNever) {
		// Config carries "not set" as null/undefined; normalize to undefined so the shared
		// precedence logic (which uses typeof checks) treats it as "absent".
		var vFilter = vOnly == null ? undefined : vOnly;
		var vAntiFilter = vNever == null ? undefined : vNever;
		var bWarned = false;
		return function(sModuleName) {
			try {
				var fnShouldBeInstrumented = window["sap-ui-qunit-coverage-shouldBeInstrumented"];
				if (typeof fnShouldBeInstrumented !== "function") {
					throw new Error("qunit-coverage-istanbul.js has not exposed its coverage matcher");
				}
				// Pass the resource name verbatim, including its ".js" extension: the loader and
				// the instrumenter both match that exact form. Reusing the instrumenter's matcher
				// is what guarantees the single-file set equals the instrumented set.
				return fnShouldBeInstrumented(sModuleName, vFilter, vAntiFilter);
			} catch (e) {
				// This predicate runs inside the loader for every module resolution. A malformed
				// cover pattern (a bad //regex/ or a "#fn" naming a missing global) must not abort
				// module loading: degrade to "keep bundled" (uninstrumented) and warn once.
				if (!bWarned) {
					bWarned = true;
					Log.warning(
						"Invalid coverage filter pattern; affected modules stay bundled and " +
						"uninstrumented. Check the test's cover-only/cover-never configuration.",
						String(e),
						"sap.ui.test.starter._coverageFilter");
				}
				return false;
			}
		};
	}

	/**
	 * Build the predicate for the loader's <code>ignoreBundledResources</code>: the modules to
	 * load single-file (outside their bundle) for a coverage run. That is the covered set
	 * ({@link #buildCoverageIgnore}) plus any modules an active <code>sap-ui-debug</code> filter
	 * selects — those must load unminified even when excluded from coverage, so debug overrides
	 * <code>cover-never</code> (applied with no anti-filter). This only affects what loads
	 * single-file, never what gets instrumented (that still derives from cover-only/cover-never).
	 *
	 * @param {string|string[]|null|undefined} vOnly the <code>cover-only</code> config
	 * @param {string|string[]|null|undefined} vNever the <code>cover-never</code> config
	 * @param {string|null|undefined} vDebug the resolved <code>sap-ui-debug</code> value:
	 *   <code>""</code>/<code>"true"</code> → all modules, <code>"false"</code>/absent → none, any
	 *   other value is a cover-only-syntax pattern (substring / <code>//regex/</code>)
	 * @returns {function(string):boolean} the ignore predicate
	 * @private
	 */
	function buildSingleFileIgnore(vOnly, vNever, vDebug) {
		if (vDebug === "" || vDebug === "true") {
			// debug all: everything single-file, overriding cover-only/cover-never
			return buildCoverageIgnore(undefined, undefined);
		}
		var fnCoverageIgnore = buildCoverageIgnore(vOnly, vNever);
		if (vDebug && vDebug !== "false") {
			// Debug patterns use cover-only syntax, with no anti-filter so cover-never
			// cannot suppress a debug module; OR with the covered set.
			var fnDebugIgnore = buildCoverageIgnore(vDebug, undefined);
			return function(sModuleName) {
				return fnCoverageIgnore(sModuleName) || fnDebugIgnore(sModuleName);
			};
		}
		return fnCoverageIgnore;
	}

	return {
		buildCoverageIgnore: buildCoverageIgnore,
		buildSingleFileIgnore: buildSingleFileIgnore
	};
});
