/*!
 * ${copyright}
 */
/*
 * IMPORTANT: This is a private module, its API must not be used and is subject to change.
 * Code other than the OpenUI5 libraries must not introduce dependencies to this module.
 */
sap.ui.define([
	"sap/base/Log"
], function(Log) {
	"use strict";

	/**
	 * `FetchInterceptor` overrides the native `Fetch API` and provides
	 * convenient hooks to instrument the request and response lifecycles.
	 *
	 * The interceptor is designed to be an equivalent of the `XHRInterceptor`:
	 * like the XHR overrides, its hooks are called <b>synchronously</b> for the
	 * request phase and in a <b>fire-and-forget</b> manner for the response
	 * phase. In no case does a registered hook delay the promise the caller of
	 * `fetch()` awaits — the interceptor must never slow down the productive
	 * request/response, it only observes and (for the request) synchronously
	 * enriches it.
	 *
	 * ## Request
	 * - **`onRequest(request: Request): Request`**
	 *   Called synchronously after a `Request` instance is created, immediately
	 *   before the native `Fetch API` is invoked. It may return a modified
	 *   `Request` instance, which is passed to subsequent `onRequest` hooks and
	 *   used by the native `Fetch API`. Anything that influences the request MUST
	 *   happen synchronously in the hook — a returned promise is not awaited and
	 *   does not affect the request. If the hook throws, the error is logged and
	 *   the request is sent unchanged: an instrumentation hook must never break
	 *   the productive request.
	 *
	 * ## Response
	 * - **`onResponse(response: Response, request: Request): void`**
	 *   Called once the response body has been fully received (the equivalent
	 *   of XHR `readyState === 4`), so that the `PerformanceResourceTiming`
	 *   entry is guaranteed to exist. The hook receives its own independent
	 *   clone of the response and the originating request, and may consume the
	 *   response body freely (`text()`, `json()`, `blob()`, …) without affecting
	 *   the caller's response or other hooks. The hook is fire-and-forget: it
	 *   never delays the promise the caller of `fetch()` awaits. A returned
	 *   value is ignored.
	 * - **`onResponseError(error: any, request: Request): void`**
	 *   Called fire-and-forget when the native `Fetch API` call rejects. Receives
	 *   the error and the originating request. Does not rethrow — the original
	 *   rejection is always propagated to the caller.
	 *
	 * @module
	 * @since 1.152
	 * @private
	 */
	const mInterceptors = {};
	const aFunctionNames = ["onRequest", "onResponse", "onResponseError"];

	// Collect the registered hook functions for a phase into an array (in registration order).
	// Returns an empty array when nothing is registered, so callers can cheaply skip work.
	function getHooks(sPhase) {
		const mPhase = mInterceptors[sPhase];
		const aHooks = [];
		for (const sName in mPhase) {
			if (mPhase[sName]) {
				aHooks.push(mPhase[sName]);
			}
		}
		return aHooks;
	}

	/*
	 * Fire the given onResponse hooks once the response body is fully received.
	 * Each hook gets its own clone so it can consume the body independently, plus the
	 * originating request as second argument. The clones must be taken synchronously
	 * (before any body read), so this runs on the resolved response. An extra internal
	 * clone is drained via arrayBuffer() to detect body completion — the equivalent of
	 * XHR readyState === 4, which guarantees the PerformanceResourceTiming entry exists.
	 * If that body read fails (e.g. the connection drops mid-body), the terminal state is
	 * routed to the onResponseError hooks instead — onResponse cannot be called because its
	 * "body fully received" contract cannot be honoured, and swallowing the failure would
	 * leave observers (e.g. an open interaction async step) hanging.
	 * All of this is fire-and-forget and never delays the caller's promise.
	 */
	function dispatchResponse(aHooks, aErrorHooks, oResponse, oRequest) {
		const aClones = aHooks.map((fn) => ({ fn, clone: oResponse.clone() }));
		oResponse.clone().arrayBuffer().then(() => {
			for (const oHook of aClones) {
				try {
					oHook.fn(oHook.clone, oRequest);
				} catch (oErr) {
					Log.error("FetchInterceptor onResponse failed: " + oErr, "FetchInterceptor");
				}
			}
		}, (oErr) => {
			Log.error("FetchInterceptor could not read response body: " + oErr, "FetchInterceptor");
			dispatchResponseError(aErrorHooks, oErr, oRequest);
		});
	}

	/*
	 * Fire the given onResponseError hooks when the native fetch rejects. The originating
	 * request is passed as second argument so hooks can correlate the error with the
	 * request that caused it (e.g. to close an open async step).
	 */
	function dispatchResponseError(aHooks, oErr, oRequest) {
		for (const fn of aHooks) {
			try {
				fn(oErr, oRequest);
			} catch (oInner) {
				Log.error("FetchInterceptor onResponseError failed: " + oInner, "FetchInterceptor");
			}
		}
	}

	globalThis.fetch = (function(fetch) {
		return function(...args) {
			// Always construct a Request from the arguments so that any init overrides
			// (signal, method, headers, body …) in the second argument are respected,
			// even when the first argument is already a Request instance.  Native fetch
			// does the same: `fetch(existingRequest, { signal })` creates a new Request
			// that merges the init overrides.  Skipping the init would silently drop
			// caller-provided options like AbortSignal, changing observable behaviour.
			let oRequest = new globalThis.Request(...args);

			// Request phase — synchronous, runs immediately before the native fetch and may
			// replace the request. Anything that influences the request must happen
			// synchronously (a returned promise is not a Request and is ignored). If a hook
			// throws, the error is logged and the request is sent unchanged — an
			// instrumentation hook must never break the productive request.
			for (const sName in mInterceptors.onRequest) {
				const onRequest = mInterceptors.onRequest[sName];
				if (onRequest) {
					try {
						const oRes = onRequest(oRequest);
						if (oRes instanceof globalThis.Request) {
							oRequest = oRes;
						}
					} catch (oErr) {
						Log.error("FetchInterceptor onRequest failed: " + oErr, "FetchInterceptor");
					}
				}
			}

			const pResponse = fetch(oRequest);

			// Response phase — fire-and-forget, never delays the caller's promise.
			// Collect the hooks once; only attach the observation .then() if any exist,
			// so a fetch without registered response hooks is not touched at all.
			const aResponseHooks = getHooks("onResponse");
			const aResponseErrorHooks = getHooks("onResponseError");
			if (aResponseHooks.length || aResponseErrorHooks.length) {
				pResponse.then(
					(oResponse) => dispatchResponse(aResponseHooks, aResponseErrorHooks, oResponse, oRequest),
					(oErr) => dispatchResponseError(aResponseErrorHooks, oErr, oRequest)
				// The caller receives pResponse directly and handles its own rejection.
				// This .then() is a second consumer; the no-op catch prevents the runtime
				// from reporting an unhandled rejection on this internal observation fork
				// when the fetch fails (abort, network error, etc.).
				).catch(() => {});
			}

			// The caller gets the untouched native fetch promise — no interceptor
			// hook is ever awaited in this chain.
			return pResponse;
		};
	})(globalThis.fetch);

	/**
	 * @typedef {object} sap.ui.performance.FetchInterceptor.Interceptor
	 *
	 * @property {function(Request)} onRequest
	 * @property {function(Response, Request)} onResponse
	 * @property {function(Error, Request)} onResponseError
	 */

	/**
	 * @namespace
	 * @since 1.152
	 * @alias module:sap/ui/performance/FetchInterceptor
	 * @private
	 * @ui5-restricted sap.ui.core
	 */
	const FetchInterceptor = {
		/**
		 * Register an interceptor.
		 *
		 * There's only one function saved per combination of Interceptor name and interception phase
		 *
		 * @param {string} sName The name of the interceptor
		 * @param {sap.ui.performance.FetchInterceptor.Interceptor} oInterceptor The Interceptor object
		 */
		register: function(sName, oInterceptor) {
			aFunctionNames.forEach((sFunctionName) => {
				mInterceptors[sFunctionName] ??= {};
				if (sFunctionName in oInterceptor) {
					mInterceptors[sFunctionName][sName] = oInterceptor[sFunctionName];
				}
			});
		},

		/**
		 * Unregister an interceptor.
		 *
		 * @param {string} sName The name of the interceptor
		 * @param {string} sFunctionName The name of the interceptor function
		 * @return {boolean} whether at least one phase function is removed
		 */
		unregister: function(sName, sFunctionName) {
			if (aFunctionNames.includes(sFunctionName) && mInterceptors[sFunctionName]?.[sName]) {
				delete mInterceptors[sFunctionName][sName];
				return true;
			}
			return false;
		},

		/**
		 * Checks if the given function name is registered under the given interceptor name
		 *
		 * @param {string} sName The name of the interceptor
		 * @param {sFunctionName} sFunctionName The name of the function
		 * @return {boolean} Whether the function name is registered under the interceptor
		 */
		isRegistered: function(sName, sFunctionName) {
			if (aFunctionNames.includes(sFunctionName)) {
				return !!mInterceptors[sFunctionName]?.[sName];
			}

			return false;
		}
	};

	return FetchInterceptor;
});
