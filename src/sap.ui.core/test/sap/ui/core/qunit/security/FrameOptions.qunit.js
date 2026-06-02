/*global QUnit, sinon */
sap.ui.define(['sap/ui/security/FrameOptions'], function(FrameOptions) {
	'use strict';

	var oClock, oServer;
	function mockBrowserAPI(mOptions) {

		var sParentOrigin = mOptions.parentOrigin || 'http://some.other.origin.local';

		// holds mocked functions for assertions
		var oSpies = {
			window: {},
			parent: {}
		};

		// window
		FrameOptions.__window = {};
		FrameOptions.__window.location = {
			origin: new URL(mOptions.selfUrl || 'http://localhost/fake.html').origin
		};
		oSpies.window.addEventListener = sinon.spy(function() {
			oSpies.window.eventListenerFn = arguments[1];
			oSpies.window.eventListener = sinon.spy(arguments[1]);
		});
		if (window.addEventListener) {
			FrameOptions.__window.addEventListener = oSpies.window.addEventListener;
		} else {
			FrameOptions.__window.attachEvent = oSpies.window.addEventListener;
		}

		// parent
		FrameOptions.__parent = {};

		FrameOptions.__parent.postMessage = oSpies.parent.postMessage = sinon.spy(function(sMessage, sTargetOrigin) {
			if (sMessage === 'SAPFrameProtection*require-origin') {
				switch (mOptions.parentMode) {
					case "SAFE":
						setTimeout(function() {
							oSpies.window.eventListener.call(null, {
								source: FrameOptions.__parent,
								data: 'SAPFrameProtection*parent-unlocked',
								origin: sParentOrigin
							});
						}, 0);
						break;
					case "UNSAFE":
						setTimeout(function() {
							oSpies.window.eventListener.call(null, {
								source: FrameOptions.__parent,
								data: 'SAPFrameProtection*parent-origin',
								origin: sParentOrigin
							});
						}, 0);
						break;
					case "SAFE_DELAYED":
						setTimeout(function() {
							oSpies.window.eventListener.call(null, {
								source: FrameOptions.__parent,
								data: 'SAPFrameProtection*parent-origin',
								origin: sParentOrigin
							});
						}, 0);
						setTimeout(function() {
							oSpies.window.eventListener.call(null, {
								source: FrameOptions.__parent,
								data: 'SAPFrameProtection*parent-unlocked',
								origin: sParentOrigin
							});
						}, 100);
						break;
					default:
						break;
				}
			}
		});


		if (mOptions.mode !== 'DIFF_ORIGIN') {
			FrameOptions.__parent.document = {
				domain: 'localhost'
			};
		}

		// self / top
		if (mOptions.mode === 'NO_FRAME') {
			FrameOptions.__top = FrameOptions.__self = FrameOptions.__parent;
		} else {
			FrameOptions.__top = FrameOptions.__parent;
			FrameOptions.__self = {};
		}

		return oSpies;
	}

	function testDirectUnlock(sName, sEnvMode, sParentMode, sMode, bAllowSameOrigin) {
		QUnit.test(sName, function(assert) {

			// arrangements
			var oMock = mockBrowserAPI({
				mode: sEnvMode,
				parentMode: sParentMode
			});
			var fnCallback = sinon.spy();

			// actions
			this.oFrameOptions = new FrameOptions({
				mode: sMode,
				allowSameOrigin: bAllowSameOrigin,
				callback: fnCallback
			});

			// assertions
			assert.ok(oMock.window.addEventListener.calledOnce);
			assert.ok(oMock.window.addEventListener.calledWith(FrameOptions.__window.addEventListener ? 'message' : 'onmessage', oMock.window.eventListenerFn));

			assert.ok(oMock.window.eventListener.notCalled);

			assert.ok(oMock.parent.postMessage.notCalled);

			assert.ok(fnCallback.calledOnce);
			assert.ok(fnCallback.calledWith(true));
		});
	}
	function testDirectLock(sName, sEnvMode, sParentMode, sMode, bAllowSameOrigin) {
		QUnit.test(sName, function(assert) {

			// arrangements
			var oMock = mockBrowserAPI({
				mode: sEnvMode,
				parentMode: sParentMode
			});
			var fnCallback = sinon.spy();

			// actions
			this.oFrameOptions = new FrameOptions({
				mode: sMode,
				allowSameOrigin: bAllowSameOrigin,
				callback: fnCallback
			});

			// assertions
			assert.ok(oMock.window.addEventListener.calledOnce);
			assert.ok(oMock.window.addEventListener.calledWith(FrameOptions.__window.addEventListener ? 'message' : 'onmessage', oMock.window.eventListenerFn));

			assert.ok(oMock.window.eventListener.notCalled);

			assert.ok(oMock.parent.postMessage.notCalled);

			assert.ok(fnCallback.calledOnce);

			assert.ok(fnCallback.calledWith(false));

			assert.ok(document.body.contains(this.oFrameOptions._lockDiv), 'Block layer should be part of the DOM');
			assert.equal(this.oFrameOptions._lockDiv.style.zIndex, '2147483647', 'Block layer should have a high z-index');
		});
	}
	function testPostMessageLock(sName, sEnvMode, sParentMode, sMode, bAllowSameOrigin) {
		QUnit.test(sName, function(assert) {

			// arrangements
			var oMock = mockBrowserAPI({
				mode: sEnvMode,
				parentMode: sParentMode
			});
			var fnCallback = sinon.spy();

			// actions
			this.oFrameOptions = new FrameOptions({
				mode: sMode,
				allowSameOrigin: bAllowSameOrigin,
				callback: fnCallback
			});

			// assertions
			assert.ok(oMock.window.addEventListener.calledOnce);
			assert.ok(oMock.window.addEventListener.calledWith(FrameOptions.__window.addEventListener ? 'message' : 'onmessage', oMock.window.eventListenerFn));

			oClock.tick(10);

			assert.ok(oMock.window.eventListener.calledOnce);
			assert.ok(oMock.window.eventListener.calledWith({
				source: FrameOptions.__parent,
				origin: 'http://some.other.origin.local',
				data: 'SAPFrameProtection*parent-unlocked'
			}));

			assert.ok(oMock.parent.postMessage.calledOnce);

			assert.ok(oMock.parent.postMessage.calledWith('SAPFrameProtection*require-origin', '*'));

			assert.ok(fnCallback.calledOnce);
			assert.ok(fnCallback.calledWith(false));

			assert.ok(document.body.contains(this.oFrameOptions._lockDiv), 'Block layer should be part of the DOM');
			assert.equal(this.oFrameOptions._lockDiv.style.zIndex, '2147483647', 'Block layer should have a high z-index');
		});
	}
	function testAllowlistUnlock(sName, sEnvMode, sParentMode, sMode, bAllowSameOrigin) {
		QUnit.test(sName, function(assert) {

			// arrangements
			var oMock = mockBrowserAPI({
				mode: sEnvMode,
				parentMode: sParentMode
			});
			var fnCallback = sinon.spy();

			// actions
			this.oFrameOptions = new FrameOptions({
				mode: sMode,
				allowSameOrigin: bAllowSameOrigin,
				allowlist: [ 'some.other.origin.local' ],
				callback: fnCallback
			});

			// assertions
			assert.ok(oMock.window.addEventListener.calledOnce);
			assert.ok(oMock.window.addEventListener.calledWith(FrameOptions.__window.addEventListener ? 'message' : 'onmessage', oMock.window.eventListenerFn));

			oClock.tick(10);

			assert.ok(oMock.window.eventListener.calledOnce);
			assert.ok(oMock.window.eventListener.calledWith({
				source: FrameOptions.__parent,
				origin: 'http://some.other.origin.local',
				data: 'SAPFrameProtection*parent-unlocked'
			}));

			assert.ok(oMock.parent.postMessage.calledOnce);
			assert.ok(oMock.parent.postMessage.calledWith('SAPFrameProtection*require-origin', '*'));

			assert.ok(fnCallback.calledOnce);
			assert.ok(fnCallback.calledWith(true));
		});
	}
	function testAllowlistMatch(sName, sEnvMode, sParentMode, sMode, bAllowSameOrigin, sParentOrigin, aAllowlist, bAllow) {
		QUnit.test(sName, function(assert) {

			// arrangements
			var oMock = mockBrowserAPI({
				mode: sEnvMode,
				parentMode: sParentMode,
				parentOrigin: sParentOrigin
			});
			var fnCallback = sinon.spy();

			// actions
			this.oFrameOptions = new FrameOptions({
				mode: sMode,
				allowSameOrigin: bAllowSameOrigin,
				allowlist: aAllowlist,
				callback: fnCallback
			});

			// assertions
			oClock.tick(10);

			assert.ok(oMock.parent.postMessage.calledOnce);
			assert.ok(oMock.parent.postMessage.calledWith('SAPFrameProtection*require-origin', '*'));

			assert.ok(fnCallback.calledOnce);
			assert.ok(
				fnCallback.calledWith(bAllow),
				"Parent origin '" + sParentOrigin + "' against allowlist " +
					JSON.stringify(aAllowlist) + " should " + (bAllow ? "" : "NOT ") + "be trusted"
			);
		});
	}
	function testSameOriginMatch(sName, sParentOrigin, sSelfUrl, bAllow) {
		QUnit.test(sName, function(assert) {

			// arrangements: cross-origin frame whose parent reports sParentOrigin,
			// no allowlist configured. The only path that can grant trust is the
			// same-origin equality check against window.location.origin.
			var oMock = mockBrowserAPI({
				mode: 'DIFF_ORIGIN',
				parentMode: 'SAFE',
				parentOrigin: sParentOrigin,
				selfUrl: sSelfUrl
			});
			var fnCallback = sinon.spy();

			// actions
			this.oFrameOptions = new FrameOptions({
				mode: 'trusted',
				allowSameOrigin: true,
				callback: fnCallback
			});

			// assertions
			oClock.tick(10);

			assert.ok(oMock.parent.postMessage.calledOnce);
			assert.ok(oMock.parent.postMessage.calledWith('SAPFrameProtection*require-origin', '*'));

			assert.ok(fnCallback.calledOnce);
			assert.ok(
				fnCallback.calledWith(bAllow),
				"Parent '" + sParentOrigin + "' framing self '" + sSelfUrl +
					"' should " + (bAllow ? "" : "NOT ") + "be trusted as same-origin"
			);
		});
	}
	function testAllowlistService(sName, sEnvMode, sParentMode, sMode, bAllowSameOrigin, bActive, bFraming, bAllow) {
		QUnit.test(sName, function(assert) {

			// arrangements
			var oMock = mockBrowserAPI({
				mode: sEnvMode,
				parentMode: sParentMode
			});

			var oResponse = {
					version: "1.0",
					active: !!bActive,
					origin: "http://some.other.origin.local",
					framing: !!bFraming
				};
			oServer.respondWith("GET", /\/allowlist\.json\?parentOrigin=.*/, [
				200,
				{
					"Content-Type": "application/json"
				},
				JSON.stringify(oResponse)
			]);

			var fnCallback = sinon.spy();

			// actions
			this.oFrameOptions = new FrameOptions({
				mode: sMode,
				allowSameOrigin: bAllowSameOrigin,
				allowlistService: '/allowlist.json',
				callback: fnCallback,
				timeout: 200
			});

			// assertions
			assert.ok(oMock.window.addEventListener.calledOnce);
			assert.ok(oMock.window.addEventListener.calledWith(FrameOptions.__window.addEventListener ? 'message' : 'onmessage', oMock.window.eventListenerFn));

			oClock.tick(10);

			oServer.respond();

			if (sParentMode === "SAFE") {
				assert.ok(oMock.window.eventListener.calledOnce);
				assert.ok(oMock.window.eventListener.calledWith({
					source: FrameOptions.__parent,
					origin: 'http://some.other.origin.local',
					data: 'SAPFrameProtection*parent-unlocked'
				}));
			} else if (sParentMode === "UNSAFE")	{
				assert.ok(oMock.window.eventListener.calledOnce);
				assert.ok(oMock.window.eventListener.calledWith({
					source: FrameOptions.__parent,
					origin: 'http://some.other.origin.local',
					data: 'SAPFrameProtection*parent-origin'
				}));
			} else if (sParentMode === "SAFE_DELAYED")	{
				assert.ok(oMock.window.eventListener.calledOnce);
				assert.ok(oMock.window.eventListener.calledWith({
					source: FrameOptions.__parent,
					origin: 'http://some.other.origin.local',
					data: 'SAPFrameProtection*parent-origin'
				}));
				oMock.window.eventListener.reset();
			} else {
				assert.ok(oMock.window.eventListener.notCalled);
			}

			assert.ok(oMock.parent.postMessage.calledOnce);
			assert.ok(oMock.parent.postMessage.calledWith('SAPFrameProtection*require-origin', '*'));

			oClock.tick(200);

			if (sParentMode === "SAFE_DELAYED")	{
				assert.ok(oMock.window.eventListener.calledOnce);
				assert.ok(oMock.window.eventListener.calledWith({
					source: FrameOptions.__parent,
					origin: 'http://some.other.origin.local',
					data: 'SAPFrameProtection*parent-unlocked'
				}));
			}

			assert.ok(fnCallback.calledOnce);
			assert.ok(fnCallback.calledWith(bAllow));
		});
	}

	function setup(){
		oClock = sinon.sandbox.useFakeTimers();
	}

	function setupAllowlist(){
		setup.bind(this)();
		oServer = sinon.sandbox.useFakeServer();
	}

	function teardown() {
		if (this.oFrameOptions && this.oFrameOptions._lockDiv) {
			document.body.removeChild(this.oFrameOptions._lockDiv);
		}
		this.oFrameOptions = null;
		oClock.restore();
	}

	function teardownAllowlist(){
		teardown.bind(this)();
		oServer.restore();
	}

	// environment
	// NO_FRAME: not running inside of a frame
	// SAME_ORIGIN: framed, but with the same origin
	// DOMAIN_RELAX: framed, same origin but domain relaxed, so no direct access possibles
	// DIFF_ORIGIN: framed, within a different origin

	// parent mode
	// SAFE: has the postmessage script and reports to be safe
	// UNSAFE: has the postmessage script but only responds parent-origin
	// SAFE_DELAYED: has the postmessage script, but sends parent-unlocked with one second delay
	// NO_HANDLER: no postmessage handler is running in the parent

	//                    test name,                                  environment,     parent mode,    frame option



	QUnit.module("sap.ui.security.FrameOptions - mode: deny", { afterEach: teardown , beforeEach: setup});
	testDirectUnlock(    "no frame",                                  'NO_FRAME',      'SAFE',         'deny');
	testDirectLock(      "same origin",                               'SAME_ORIGIN',   'SAFE',         'deny');
	testDirectLock(      "different origin",                          'DIFF_ORIGIN',   'SAFE',         'deny');

	QUnit.module("sap.ui.security.FrameOptions - mode: allow", { afterEach: teardown , beforeEach: setup});
	testDirectUnlock(    "no frame",                                  'NO_FRAME',      'SAFE',         'allow');
	testDirectUnlock(    "same origin",                               'SAME_ORIGIN',   'SAFE',         'allow');
	testDirectUnlock(    "different origin",                          'DIFF_ORIGIN',   'SAFE',         'allow');

	//                    test name,                                  environment,     parent mode,    frame option,  same origin,

	QUnit.module("sap.ui.security.FrameOptions - mode: trusted", { afterEach: teardown , beforeEach: setup});
	testDirectUnlock(    "no frame",                                  'NO_FRAME',      'SAFE',         'trusted');
	testDirectUnlock(    "same origin",                               'SAME_ORIGIN',   'SAFE',         'trusted');
	testDirectUnlock(    "same origin, unsafe",                       'SAME_ORIGIN',   'UNSAFE',       'trusted');
	testDirectUnlock(    "same origin, no response",                  'SAME_ORIGIN',   'NO_RESPONSE',  'trusted');

	testPostMessageLock( "same origin not allowed",                   'SAME_ORIGIN',   'SAFE',         'trusted',     false);
	testPostMessageLock( "different origin",                          'DIFF_ORIGIN',   'SAFE',         'trusted');

	QUnit.module("sap.ui.security.FrameOptions - mode: trusted, allowlist", { afterEach: teardown , beforeEach: setup});
	testAllowlistUnlock( "same origin not allowed, allowlist",        'SAME_ORIGIN',   'SAFE',         'trusted',     false);
	testAllowlistUnlock( "different origin, allowlist",               'DIFF_ORIGIN',   'SAFE',         'trusted');

	//                   test name,                                   environment,     parent mode,    frame option,  same origin,  active,   framing,  allow

	QUnit.module("sap.ui.security.FrameOptions - mode: trusted, witelist service, parent safe", { afterEach: teardownAllowlist, beforeEach: setupAllowlist});
	testAllowlistService("same origin not allowed, allowlistService", 'SAME_ORIGIN',   'SAFE',         'trusted',     false,        true,     true,     true);
	testAllowlistService("diff origin, allowlistService",             'DIFF_ORIGIN',   'SAFE',         'trusted',     true,         true,     true,     true);
	testAllowlistService("diff origin, allowlistService, denied",     'DIFF_ORIGIN',   'SAFE',         'trusted',     true,         true,     false,    false);
	testAllowlistService("diff origin, allowlistService, inactive",   'DIFF_ORIGIN',   'SAFE',         'trusted',     true,         false,    true,     true);

	QUnit.module("sap.ui.security.FrameOptions - mode: trusted, witelist service, parent safe delayed", { afterEach: teardownAllowlist , beforeEach: setupAllowlist});
	testAllowlistService("same origin not allowed, allowlistService", 'SAME_ORIGIN',   'SAFE_DELAYED', 'trusted',     false,        true,     true,     true);
	testAllowlistService("diff origin, allowlistService",             'DIFF_ORIGIN',   'SAFE_DELAYED', 'trusted',     true,         true,     true,     true);
	testAllowlistService("diff origin, allowlistService, denied",     'DIFF_ORIGIN',   'SAFE_DELAYED', 'trusted',     true,         true,     false,    false);
	testAllowlistService("diff origin, allowlistService, inactive",   'DIFF_ORIGIN',   'SAFE_DELAYED', 'trusted',     true,         false,    true,     true);

	QUnit.module("sap.ui.security.FrameOptions - mode: trusted, witelist service, parent unsafe", { afterEach: teardownAllowlist , beforeEach: setupAllowlist});
	testAllowlistService("same origin not allowed, allowlistService", 'SAME_ORIGIN',   'UNSAFE',       'trusted',     false,        true,     true,     false);
	testAllowlistService("diff origin, allowlistService",             'DIFF_ORIGIN',   'UNSAFE',       'trusted',     true,         true,     true,     false);
	testAllowlistService("diff origin, allowlistService, inactive",   'DIFF_ORIGIN',   'UNSAFE',       'trusted',     true,         false,    true,     true);

	QUnit.module("sap.ui.security.FrameOptions - mode: trusted, witelist service, parent no response", { afterEach: teardownAllowlist , beforeEach: setupAllowlist});
	testAllowlistService("same origin not allowed, allowlistService", 'SAME_ORIGIN',   'NO_RESPONSE',  'trusted',     false,        true,     true,     false);
	testAllowlistService("diff origin, allowlistService",             'DIFF_ORIGIN',   'NO_RESPONSE',  'trusted',     true,         true,     true,     false);
	testAllowlistService("diff origin, allowlistService, inactive",   'DIFF_ORIGIN',   'NO_RESPONSE',  'trusted',     true,         false,    true,     true);

	// Allowlist host matching: an entry must match the full hostname or a
	// dot-bounded suffix. Substring-only matches like "evilcompany.example"
	// against ["company.example"] must NOT pass, otherwise an attacker who
	// registers a lookalike domain can frame the app.

	//                  test name,                              environment,    parent mode,  frame option,  same origin,  parent origin,                                    allowlist,                  allow
	QUnit.module("sap.ui.security.FrameOptions - allowlist host matching", { afterEach: teardown, beforeEach: setup });

	// positive cases: exact host or proper subdomain
	testAllowlistMatch("exact host match",                     'DIFF_ORIGIN',  'SAFE',       'trusted',     true,         'http://company.example',                         ['company.example'],        true);
	testAllowlistMatch("subdomain match",                      'DIFF_ORIGIN',  'SAFE',       'trusted',     true,         'http://www.company.example',                     ['company.example'],        true);
	testAllowlistMatch("deep subdomain match",                 'DIFF_ORIGIN',  'SAFE',       'trusted',     true,         'http://foo.bar.company.example',                 ['company.example'],        true);

	// negative cases: these must be rejected
	testAllowlistMatch("prefix attack: evilcompany.example",   'DIFF_ORIGIN',  'SAFE',       'trusted',     true,         'http://evilcompany.example',                     ['company.example'],        false);
	testAllowlistMatch("prefix attack: notcompany.example",    'DIFF_ORIGIN',  'SAFE',       'trusted',     true,         'http://notcompany.example',                      ['company.example'],        false);
	testAllowlistMatch("prefix attack: attacker-company...",   'DIFF_ORIGIN',  'SAFE',       'trusted',     true,         'http://attacker-company.example',                ['company.example'],        false);
	testAllowlistMatch("suffix attack: company.example.atk",   'DIFF_ORIGIN',  'SAFE',       'trusted',     true,         'http://company.example.attacker.example',        ['company.example'],        false);
	testAllowlistMatch("infix attack: x.company.example.atk",  'DIFF_ORIGIN',  'SAFE',       'trusted',     true,         'http://x.company.example.attacker.example',      ['company.example'],        false);

	// leading-dot entry form (legacy behavior): ".company.example" restricts the
	// match to proper subdomains. The apex "company.example" must NOT match.
	testAllowlistMatch("dot-prefixed entry, apex rejected",    'DIFF_ORIGIN',  'SAFE',       'trusted',     true,         'http://company.example',                         ['.company.example'],       false);
	testAllowlistMatch("dot-prefixed entry, subdomain",        'DIFF_ORIGIN',  'SAFE',       'trusted',     true,         'http://sub.company.example',                     ['.company.example'],       true);
	testAllowlistMatch("dot-prefixed entry, deep subdomain",   'DIFF_ORIGIN',  'SAFE',       'trusted',     true,         'http://foo.bar.company.example',                 ['.company.example'],       true);
	testAllowlistMatch("dot-prefixed entry, prefix attack",    'DIFF_ORIGIN',  'SAFE',       'trusted',     true,         'http://evilcompany.example',                     ['.company.example'],       false);
	testAllowlistMatch("dot-prefixed entry, suffix attack",    'DIFF_ORIGIN',  'SAFE',       'trusted',     true,         'http://company.example.attacker.example',        ['.company.example'],       false);

	// Pin the asymmetry between the two entry forms: bare entry includes the
	// apex, dot-prefixed entry does not.
	testAllowlistMatch("bare entry matches apex",              'DIFF_ORIGIN',  'SAFE',       'trusted',     true,         'http://company.example',                         ['company.example'],        true);
	testAllowlistMatch("dot-prefixed entry skips apex",        'DIFF_ORIGIN',  'SAFE',       'trusted',     true,         'http://company.example',                         ['.company.example'],       false);

	// Same-origin host matching: the allowSameOrigin branch must compare full
	// origins (scheme + host + port) instead of string-prefixing the parent
	// origin against document.URL. Lookalike hostnames and port mismatches must
	// not be trusted.
	//
	//                   test name,                                 parent origin,                              self URL,                                                          allow
	QUnit.module("sap.ui.security.FrameOptions - same-origin host matching", { afterEach: teardown, beforeEach: setup });

	// positive case: true same-origin parent and self
	testSameOriginMatch("exact same origin",                       'https://intranet.company.example',         'https://intranet.company.example/app/index.html',                true);

	// negative cases: these must be rejected
	testSameOriginMatch("domain-prefix attack: company.example framing company.example.attacker.example",
	                                                               'https://company.example',                  'https://company.example.attacker.example/app',                   false);
	testSameOriginMatch("port mismatch: parent :443 vs self :8443",'https://intranet.company.example',         'https://intranet.company.example:8443/app',                      false);

	// Opaque self-origin (sandboxed iframe, data:/blob: document) must NOT be
	// considered same-origin even if the parent reports the same "null" string.
	// Two opaque origins are not the same origin per the HTML spec.
	testSameOriginMatch("opaque self vs opaque parent rejected",   'null',                                     'data:text/html,<p>x</p>',                                        false);
	testSameOriginMatch("opaque self vs https parent rejected",    'https://intranet.company.example',         'data:text/html,<p>x</p>',                                        false);

});
