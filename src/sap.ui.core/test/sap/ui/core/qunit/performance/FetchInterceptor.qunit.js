/*global QUnit */
sap.ui.define([
	'sap/ui/performance/FetchInterceptor',
	'sap/ui/performance/trace/Interaction',
	'sap/ui/performance/trace/FESR'
], function(FetchInterceptor, Interaction, FESR) {
	"use strict";

	const sUrl = sap.ui.require.toUrl("performance/FetchInterceptor.qunit.js");

	// onResponse / onResponseError fire only once the response body has been fully
	// received (the FetchInterceptor's readyState===4 equivalent) and are fire-and-forget,
	// i.e. they run asynchronously after the caller's fetch() promise resolved. This helper
	// wraps a spy so the test can deterministically await the hook being called, without timers.
	function spyOnceResolved(oTestContext) {
		let fnResolve;
		const pCalled = new Promise((resolve) => { fnResolve = resolve; });
		const oSpy = oTestContext.spy(() => { fnResolve(); });
		oSpy.calledPromise = pCalled;
		return oSpy;
	}

	QUnit.module("FetchInterceptor");

	QUnit.test("module", function(assert) {
		assert.ok(FetchInterceptor, "module loaded");
		assert.ok(FetchInterceptor.register, "register method available");
	});

	QUnit.test("before register any interceptor", async function(assert) {
		const oResponse = await globalThis.fetch(sUrl);
		const sText = await oResponse.text();

		assert.ok(sText, "content is returned");
	});

	QUnit.test("register a interceptor", async function(assert) {
		const oInterceptor = {
			onRequest: this.spy(),
			onResponse: spyOnceResolved(this),
			onResponseError: this.spy()
		};

		Object.keys(oInterceptor).forEach((sName) => {
			assert.notOk(FetchInterceptor.isRegistered("UNIT_TEST", sName), `'isRegistered(${sName})' returns false before registering`);
		});

		FetchInterceptor.register("UNIT_TEST", oInterceptor);

		Object.keys(oInterceptor).forEach((sName) => {
			assert.ok(FetchInterceptor.isRegistered("UNIT_TEST", sName), `'isRegistered(${sName})' returns true after registering`);
		});

		const oResponse = await globalThis.fetch(sUrl);
		assert.ok(oResponse.ok, "oResponse returned successfully");
		const sText = await oResponse.text();

		assert.ok(sText, "content is returned");

		assert.equal(oInterceptor.onRequest.callCount, 1, "onRequest is called");
		const oRequestCall = oInterceptor.onRequest.getCall(0);
		assert.equal(oRequestCall.args.length, 1, "only one argument is given");
		assert.ok(oRequestCall.args[0] instanceof globalThis.Request, "The argument is provided to the 'onRequest'");
		assert.ok(oRequestCall.args[0].url.includes(sUrl), "The url is included in the argument");

		// onResponse fires only after the body is complete — await it deterministically
		await oInterceptor.onResponse.calledPromise;
		assert.equal(oInterceptor.onResponse.callCount, 1, "onResponse is called");
		const oResponseCall = oInterceptor.onResponse.getCall(0);
		assert.equal(oResponseCall.args.length, 2, "response and request are passed");
		assert.ok(oResponseCall.args[0] instanceof globalThis.Response, "the response clone is passed as first argument");
		assert.ok(oResponseCall.args[1] instanceof globalThis.Request, "the originating request is passed as second argument");

		assert.equal(oInterceptor.onResponseError.callCount, 0, "onResponseError isn't called");

		for (const sFunctionName in oInterceptor) {
			FetchInterceptor.unregister("UNIT_TEST", sFunctionName);
		}

		Object.keys(oInterceptor).forEach((sName) => {
			assert.notOk(FetchInterceptor.isRegistered("UNIT_TEST", sName), `'isRegistered(${sName})' returns false after unregistering`);
		});
	});

	QUnit.test("onRequest error is logged and the request is still sent", async function(assert) {
		const oInterceptor = {
			onRequest() {
				throw new Error("test error");
			},
			onResponse: spyOnceResolved(this),
			onResponseError: this.spy()
		};

		FetchInterceptor.register("UNIT_TEST", oInterceptor);

		// A throwing onRequest must never break the productive request: the error is logged
		// and the request is sent unchanged, so the fetch resolves normally.
		const oResponse = await globalThis.fetch(sUrl);
		assert.ok(oResponse.ok, "fetch still resolves although onRequest threw");
		const sText = await oResponse.text();
		assert.ok(sText, "content is returned");

		// onResponse still fires (the request was sent) — await it deterministically
		await oInterceptor.onResponse.calledPromise;
		assert.equal(oInterceptor.onResponse.callCount, 1, "onResponse is called");
		assert.equal(oInterceptor.onResponseError.callCount, 0, "onResponseError isn't called");

		for (const sFunctionName in oInterceptor) {
			FetchInterceptor.unregister("UNIT_TEST", sFunctionName);
		}
	});

	QUnit.test("onResponseError is called on abort (and receives the originating request)", async function(assert) {
		let fnResolve;
		const pCalled = new Promise(function(resolve) { fnResolve = resolve; });
		const oInterceptor = {
			onResponseError: function(oErr, oRequest) { fnResolve({ err: oErr, request: oRequest }); }
		};

		FetchInterceptor.register("UNIT_TEST_ABORT", oInterceptor);

		const oController = new AbortController();
		const pFetch = globalThis.fetch(sUrl + "?abort=" + Date.now(), { signal: oController.signal });
		await Promise.resolve(); // let the interceptor attach its rejection handler
		oController.abort();

		try { await pFetch; } catch (e) { /* expected AbortError */ }

		const oResult = await pCalled;
		assert.ok(oResult.err, "onResponseError is called on abort");
		assert.ok(oResult.request instanceof globalThis.Request,
			"the originating request is passed to the hook as second argument");

		FetchInterceptor.unregister("UNIT_TEST_ABORT", "onResponseError");
	});

	QUnit.test("onResponseError closes the interaction async step (fnDone is called)", async function(assert) {
		// Verifies the _InteractionImpl INTERACTION hook: when a fetch fails, the async step opened
		// in onRequest must be closed via fnDone() in onResponseError so that iRequestCounter does
		// not hang and the interaction can finalize correctly.
		await FESR.setActive(true);
		Interaction.start("test");

		let fnResolve;
		const pErrorHandled = new Promise(function(resolve) { fnResolve = resolve; });
		FetchInterceptor.register("UNIT_TEST_ERROR_STEP", {
			onResponseError() {
				FetchInterceptor.unregister("UNIT_TEST_ERROR_STEP", "onResponseError");
				fnResolve();
			}
		});

		// Abort a real fetch so the native fetch rejects: the INTERACTION onRequest opened an async
		// step (fnDone on the request); onResponseError must close it.
		const oController = new AbortController();
		const pFetch = globalThis.fetch(sUrl + "?errStep=" + Date.now(), { signal: oController.signal });
		await Promise.resolve(); // let the interceptor attach its rejection handler
		oController.abort();

		let bRejected = false;
		try {
			await pFetch;
		} catch (e) {
			bRejected = true;
		}
		assert.ok(bRejected, "fetch rejected due to abort");

		await pErrorHandled;

		Interaction.start("second");
		assert.ok(Interaction.getAll().length >= 1,
			"Interaction finalized after failed fetch — async step closed by onResponseError");
		Interaction.end(true);
		Interaction.clear();
		await FESR.setActive(false);
	});

	QUnit.test("onResponseError is called when reading the response body fails", async function(assert) {
		// The fetch() promise resolves at header-arrival, so onResponse fires the internal
		// clone().arrayBuffer() to await body completion. If that body read fails (e.g. the
		// connection drops mid-body), the terminal state must still be delivered: the
		// FetchInterceptor routes it to onResponseError (not onResponse, whose "body fully
		// received" contract cannot be honoured). This keeps the interaction async step from
		// hanging — the INTERACTION hook closes fnDone() in onResponseError.
		const oBodyError = new Error("body stream failed");
		// Make the internal observation clone's arrayBuffer() reject, simulating a body-read
		// failure after the response headers already arrived. clone() is called once per hook
		// plus once internally; stubbing arrayBuffer() on every clone covers the internal one.
		const fnOrigClone = globalThis.Response.prototype.clone;
		this.stub(globalThis.Response.prototype, "clone").callsFake(function() {
			const oClone = fnOrigClone.call(this);
			oClone.arrayBuffer = () => Promise.reject(oBodyError);
			return oClone;
		});

		const oResponseSpy = this.spy();
		let fnResolve;
		const pErrored = new Promise(function(resolve) { fnResolve = resolve; });
		FetchInterceptor.register("UNIT_TEST_BODY_ERROR", {
			onResponse: oResponseSpy,
			onResponseError: function(oErr, oRequest) { fnResolve({ err: oErr, request: oRequest }); }
		});

		// The caller's fetch() promise still resolves normally — only the internal body read fails.
		const oResponse = await globalThis.fetch(sUrl + "?bodyErr=" + Date.now());
		assert.ok(oResponse.ok, "the caller's fetch() promise still resolves at header-arrival");

		const oResult = await pErrored;
		assert.strictEqual(oResult.err, oBodyError, "onResponseError receives the body-read error");
		assert.ok(oResult.request instanceof globalThis.Request,
			"the originating request is passed as second argument");
		assert.equal(oResponseSpy.callCount, 0,
			"onResponse is NOT called — its 'body fully received' contract cannot be honoured");

		FetchInterceptor.unregister("UNIT_TEST_BODY_ERROR", "onResponse");
		FetchInterceptor.unregister("UNIT_TEST_BODY_ERROR", "onResponseError");
	});

});