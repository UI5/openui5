/*global QUnit, sinon*/
sap.ui.define([
		"sap/ui/support/supportRules/WindowCommunicationBus",
		"sap/base/Log"],
	function (WindowCommunicationBus, Log) {
	"use strict";

	QUnit.module('Testing subscribe functionality', {
		beforeEach: function () {
			this.communicationBus = WindowCommunicationBus;
			this.communicationBus.channels = {};
		},
		afterEach: function () {
			this.communicationBus = null;
		}
	});

	QUnit.test('Subscribe method', function (assert) {
		// arrange
		var channelName = 'testChannel';
		var scope = {id: 'testScope'};
		var testFunction = function () {
			return 'Test';
		};

		// assert
		assert.strictEqual(jQuery.isEmptyObject(this.communicationBus.channels), true,
			'The channels object should be empty before initial subscription');

		// act
		this.communicationBus.subscribe(channelName, testFunction, scope);

		// assert
		assert.strictEqual(this.communicationBus.channels[channelName][0].context.id, 'testScope', 'Should set the scope correctly');
		assert.strictEqual(this.communicationBus.channels[channelName][0].callback, testFunction, 'Should set the callback correctly');
	});

	QUnit.test('Destroy channels', function (assert) {
		// arrange
		var channelName = 'testChannel';
		var scope = {id: 'testScope'};
		var testFunction = function () {
			return 'test function';
		};

		// act
		this.communicationBus.subscribe(channelName, testFunction, scope);
		this.communicationBus.destroyChannels();

		// assert
		assert.strictEqual(jQuery.isEmptyObject(this.communicationBus.channels), true,
			'Should clear all of the subscriptions');
	});

	QUnit.test('Subscribing multiple times to one channel', function (assert) {
		// arrange
		var channelName = 'testChannel';
		var scope = {id: 'testScope'};
		var testFunction = function () {
			return 'This is the first function';
		};
		var secondTestFunction = function () {
			return 'This is the second function';
		};

		// act
		this.communicationBus.subscribe(channelName, testFunction, scope);
		this.communicationBus.subscribe(channelName, secondTestFunction, scope);
		var subscriber = this.communicationBus.channels[channelName];

		// assert
		assert.strictEqual(subscriber.length, 2, 'Should set both of the functions.');
		assert.strictEqual(subscriber[0].callback, testFunction, 'Should set the first passed function first.');
		assert.strictEqual(subscriber[1].callback, secondTestFunction, 'Should set the second passed function after that.');
	});

	QUnit.module('Publish method functionality', {
		setup: function () {
			this.communicationBus = WindowCommunicationBus;
			this.communicationBus.destroyChannels();

			this.channelName = 'testChannel';
		},
		teardown: function () {
			this.communicationBus = null;
			this.channelName = null;
		}
	});

	// =========================================================================
	// onMessageChecks validation
	// =========================================================================
	// These tests verify the validation functions that Main.js pushes into
	// CommunicationBus.onMessageChecks. We replicate the three checks here so
	// they can be tested in isolation without bootstrapping the full plugin.
	// =========================================================================

	QUnit.module('onMessageChecks — origin validation', {
		beforeEach: function () {
			this.communicationBus = WindowCommunicationBus;
			this.savedChecks = this.communicationBus.onMessageChecks.slice();
			this.communicationBus.onMessageChecks = [];
			this.communicationBus.destroyChannels();
		},
		afterEach: function () {
			this.communicationBus.onMessageChecks = this.savedChecks;
			this.communicationBus.destroyChannels();
		}
	});

	QUnit.test('Matching origins should pass', function (assert) {
		// Replicate the origin check from Main.js
		var sFrameOrigin = "http://example.com";
		this.communicationBus.onMessageChecks.push(function (msg) {
			try {
				return new URL(msg.origin).origin === new URL(sFrameOrigin).origin;
			} catch (e) {
				return false;
			}
		});

		var eMessage = {
			origin: "http://example.com",
			data: { channelName: "test" }
		};

		var oCallback = sinon.spy();
		this.communicationBus.subscribe("test", oCallback);
		this.communicationBus._onmessage(eMessage);

		assert.ok(oCallback.calledOnce, 'Message with matching origin should be accepted');
	});

	QUnit.test('Different origins should fail', function (assert) {
		var sFrameOrigin = "http://example.com";
		this.communicationBus.onMessageChecks.push(function (msg) {
			try {
				return new URL(msg.origin).origin === new URL(sFrameOrigin).origin;
			} catch (e) {
				return false;
			}
		});

		var eMessage = {
			origin: "http://evil.com",
			data: { channelName: "test" }
		};

		var oCallback = sinon.spy();
		this.communicationBus.subscribe("test", oCallback);
		this.communicationBus._onmessage(eMessage);

		assert.ok(oCallback.notCalled, 'Message with different origin should be rejected');
	});

	QUnit.test('Different port should fail', function (assert) {
		var sFrameOrigin = "http://example.com";
		this.communicationBus.onMessageChecks.push(function (msg) {
			try {
				return new URL(msg.origin).origin === new URL(sFrameOrigin).origin;
			} catch (e) {
				return false;
			}
		});

		var eMessage = {
			origin: "http://example.com:8080",
			data: { channelName: "test" }
		};

		var oCallback = sinon.spy();
		this.communicationBus.subscribe("test", oCallback);
		this.communicationBus._onmessage(eMessage);

		assert.ok(oCallback.notCalled, 'Message from different port should be rejected');
	});

	QUnit.test('Malformed origin should fail', function (assert) {
		var sFrameOrigin = "http://example.com";
		this.communicationBus.onMessageChecks.push(function (msg) {
			try {
				return new URL(msg.origin).origin === new URL(sFrameOrigin).origin;
			} catch (e) {
				return false;
			}
		});

		var eMessage = {
			origin: "not-a-valid-url",
			data: { channelName: "test" }
		};

		var oCallback = sinon.spy();
		this.communicationBus.subscribe("test", oCallback);
		this.communicationBus._onmessage(eMessage);

		assert.ok(oCallback.notCalled, 'Message with malformed origin should be rejected');
	});

	QUnit.test('Origin comparison should be case-insensitive', function (assert) {
		var sFrameOrigin = "http://Example.COM";
		this.communicationBus.onMessageChecks.push(function (msg) {
			try {
				return new URL(msg.origin).origin === new URL(sFrameOrigin).origin;
			} catch (e) {
				return false;
			}
		});

		var eMessage = {
			origin: "http://example.com",
			data: { channelName: "test" }
		};

		var oCallback = sinon.spy();
		this.communicationBus.subscribe("test", oCallback);
		this.communicationBus._onmessage(eMessage);

		assert.ok(oCallback.calledOnce, 'Origin comparison should be case-insensitive');
	});

	QUnit.module('onMessageChecks — frame identifier validation', {
		beforeEach: function () {
			this.communicationBus = WindowCommunicationBus;
			this.savedChecks = this.communicationBus.onMessageChecks.slice();
			this.communicationBus.onMessageChecks = [];
			this.communicationBus.destroyChannels();
		},
		afterEach: function () {
			this.communicationBus.onMessageChecks = this.savedChecks;
			this.communicationBus.destroyChannels();
		}
	});

	QUnit.test('Matching frame identifier should pass', function (assert) {
		var sFrameIdentifier = "12345";
		this.communicationBus.onMessageChecks.push(function (msg) {
			return msg.data._frameIdentifier === sFrameIdentifier;
		});

		var eMessage = {
			origin: "http://example.com",
			data: { channelName: "test", _frameIdentifier: "12345" }
		};

		var oCallback = sinon.spy();
		this.communicationBus.subscribe("test", oCallback);
		this.communicationBus._onmessage(eMessage);

		assert.ok(oCallback.calledOnce, 'Message with matching frame identifier should be accepted');
	});

	QUnit.test('Wrong frame identifier should fail', function (assert) {
		var sFrameIdentifier = "12345";
		this.communicationBus.onMessageChecks.push(function (msg) {
			return msg.data._frameIdentifier === sFrameIdentifier;
		});

		var eMessage = {
			origin: "http://example.com",
			data: { channelName: "test", _frameIdentifier: "wrong-id" }
		};

		var oCallback = sinon.spy();
		this.communicationBus.subscribe("test", oCallback);
		this.communicationBus._onmessage(eMessage);

		assert.ok(oCallback.notCalled, 'Message with wrong frame identifier should be rejected');
	});

	QUnit.module('onMessageChecks — URL path validation', {
		beforeEach: function () {
			this.communicationBus = WindowCommunicationBus;
			this.savedChecks = this.communicationBus.onMessageChecks.slice();
			this.communicationBus.onMessageChecks = [];
			this.communicationBus.destroyChannels();
		},
		afterEach: function () {
			this.communicationBus.onMessageChecks = this.savedChecks;
			this.communicationBus.destroyChannels();
		}
	});

	QUnit.test('Matching pathname should pass (absolute frame URL)', function (assert) {
		var sFrameUrl = "http://example.com/support-tool.html?param=value";
		this.communicationBus.onMessageChecks.push(function (msg) {
			try {
				var oOriginUrl = new URL(msg.data._origin);
				var sFramePath;
				try {
					sFramePath = new URL(sFrameUrl).pathname;
				} catch (e) {
					sFramePath = sFrameUrl.split("?")[0].replace(/\.\.\//g, "");
				}
				return oOriginUrl.pathname.endsWith(sFramePath);
			} catch (e) {
				return false;
			}
		});

		var eMessage = {
			origin: "http://example.com",
			data: {
				channelName: "test",
				_origin: "http://example.com/support-tool.html?other=param"
			}
		};

		var oCallback = sinon.spy();
		this.communicationBus.subscribe("test", oCallback);
		this.communicationBus._onmessage(eMessage);

		assert.ok(oCallback.calledOnce, 'Message with matching pathname should be accepted');
	});

	QUnit.test('Different pathname should fail', function (assert) {
		var sFrameUrl = "http://example.com/support-tool.html?param=value";
		this.communicationBus.onMessageChecks.push(function (msg) {
			try {
				var oOriginUrl = new URL(msg.data._origin);
				var sFramePath;
				try {
					sFramePath = new URL(sFrameUrl).pathname;
				} catch (e) {
					sFramePath = sFrameUrl.split("?")[0].replace(/\.\.\//g, "");
				}
				return oOriginUrl.pathname.endsWith(sFramePath);
			} catch (e) {
				return false;
			}
		});

		var eMessage = {
			origin: "http://example.com",
			data: {
				channelName: "test",
				_origin: "http://example.com/other-page.html?param=value"
			}
		};

		var oCallback = sinon.spy();
		this.communicationBus.subscribe("test", oCallback);
		this.communicationBus._onmessage(eMessage);

		assert.ok(oCallback.notCalled, 'Message with different pathname should be rejected');
	});

	QUnit.test('Frame URL embedded in query parameter should fail', function (assert) {
		var sFrameUrl = "http://example.com/support-tool.html?param=value";
		this.communicationBus.onMessageChecks.push(function (msg) {
			try {
				var oOriginUrl = new URL(msg.data._origin);
				var sFramePath;
				try {
					sFramePath = new URL(sFrameUrl).pathname;
				} catch (e) {
					sFramePath = sFrameUrl.split("?")[0].replace(/\.\.\//g, "");
				}
				return oOriginUrl.pathname.endsWith(sFramePath);
			} catch (e) {
				return false;
			}
		});

		var eMessage = {
			origin: "http://example.com",
			data: {
				channelName: "test",
				_origin: "http://example.com/evil.html?redirect=http://example.com/support-tool.html?param=value"
			}
		};

		var oCallback = sinon.spy();
		this.communicationBus.subscribe("test", oCallback);
		this.communicationBus._onmessage(eMessage);

		assert.ok(oCallback.notCalled, 'Should reject when frame URL only appears as a query parameter');
	});

	QUnit.test('Relative frame URL with matching pathname should pass', function (assert) {
		var sFrameUrl = "../support/tool.html?sap-ui-xx-support-origin=http%3A%2F%2Fexample.com";
		this.communicationBus.onMessageChecks.push(function (msg) {
			try {
				var oOriginUrl = new URL(msg.data._origin);
				var sFramePath;
				try {
					sFramePath = new URL(sFrameUrl).pathname;
				} catch (e) {
					sFramePath = sFrameUrl.split("?")[0].replace(/\.\.\//g, "");
				}
				return oOriginUrl.pathname.endsWith(sFramePath);
			} catch (e) {
				return false;
			}
		});

		var eMessage = {
			origin: "http://example.com",
			data: {
				channelName: "test",
				_origin: "http://example.com/resources/support/tool.html?sap-ui-xx-support-origin=http%3A%2F%2Fexample.com"
			}
		};

		var oCallback = sinon.spy();
		this.communicationBus.subscribe("test", oCallback);
		this.communicationBus._onmessage(eMessage);

		assert.ok(oCallback.calledOnce, 'Should accept when pathname ends with cleaned relative frame URL path');
	});

	QUnit.test('Relative frame URL with non-matching pathname should fail', function (assert) {
		var sFrameUrl = "../support/tool.html?sap-ui-xx-support-origin=http%3A%2F%2Fexample.com";
		this.communicationBus.onMessageChecks.push(function (msg) {
			try {
				var oOriginUrl = new URL(msg.data._origin);
				var sFramePath;
				try {
					sFramePath = new URL(sFrameUrl).pathname;
				} catch (e) {
					sFramePath = sFrameUrl.split("?")[0].replace(/\.\.\//g, "");
				}
				return oOriginUrl.pathname.endsWith(sFramePath);
			} catch (e) {
				return false;
			}
		});

		var eMessage = {
			origin: "http://example.com",
			data: {
				channelName: "test",
				_origin: "http://example.com/other/page.html?sap-ui-xx-support-origin=http%3A%2F%2Fexample.com"
			}
		};

		var oCallback = sinon.spy();
		this.communicationBus.subscribe("test", oCallback);
		this.communicationBus._onmessage(eMessage);

		assert.ok(oCallback.notCalled, 'Should reject when pathname does not match cleaned relative frame URL path');
	});

	QUnit.test('Malformed _origin should fail', function (assert) {
		var sFrameUrl = "http://example.com/support-tool.html?param=value";
		this.communicationBus.onMessageChecks.push(function (msg) {
			try {
				var oOriginUrl = new URL(msg.data._origin);
				var sFramePath;
				try {
					sFramePath = new URL(sFrameUrl).pathname;
				} catch (e) {
					sFramePath = sFrameUrl.split("?")[0].replace(/\.\.\//g, "");
				}
				return oOriginUrl.pathname.endsWith(sFramePath);
			} catch (e) {
				return false;
			}
		});

		var eMessage = {
			origin: "http://example.com",
			data: {
				channelName: "test",
				_origin: "not-a-valid-url"
			}
		};

		var oCallback = sinon.spy();
		this.communicationBus.subscribe("test", oCallback);
		this.communicationBus._onmessage(eMessage);

		assert.ok(oCallback.notCalled, 'Should reject when _origin is malformed');
	});

	QUnit.module('onMessageChecks — _onmessage integration', {
		beforeEach: function () {
			this.communicationBus = WindowCommunicationBus;
			this.savedChecks = this.communicationBus.onMessageChecks.slice();
			this.communicationBus.onMessageChecks = [];
			this.communicationBus.destroyChannels();
		},
		afterEach: function () {
			this.communicationBus.onMessageChecks = this.savedChecks;
			this.communicationBus.destroyChannels();
		}
	});

	QUnit.test('All three checks must pass together', function (assert) {
		var sFrameOrigin = "http://example.com";
		var sFrameIdentifier = "12345";
		var sFrameUrl = "http://example.com/support-tool.html?param=value";

		// Check 1: origin
		this.communicationBus.onMessageChecks.push(function (msg) {
			try {
				return new URL(msg.origin).origin === new URL(sFrameOrigin).origin;
			} catch (e) {
				return false;
			}
		});
		// Check 2: frame identifier
		this.communicationBus.onMessageChecks.push(function (msg) {
			return msg.data._frameIdentifier === sFrameIdentifier;
		});
		// Check 3: pathname
		this.communicationBus.onMessageChecks.push(function (msg) {
			try {
				var oOriginUrl = new URL(msg.data._origin);
				var sFramePath;
				try {
					sFramePath = new URL(sFrameUrl).pathname;
				} catch (e) {
					sFramePath = sFrameUrl.split("?")[0].replace(/\.\.\//g, "");
				}
				return oOriginUrl.pathname.endsWith(sFramePath);
			} catch (e) {
				return false;
			}
		});

		var oCallback = sinon.spy();
		this.communicationBus.subscribe("test", oCallback);

		// All matching — should pass
		this.communicationBus._onmessage({
			origin: "http://example.com",
			data: {
				channelName: "test",
				_frameIdentifier: "12345",
				_origin: "http://example.com/support-tool.html?other=param"
			}
		});
		assert.ok(oCallback.calledOnce, 'Message passing all three checks should be accepted');

		// Wrong origin — should fail
		oCallback.reset();
		this.communicationBus._onmessage({
			origin: "http://evil.com",
			data: {
				channelName: "test",
				_frameIdentifier: "12345",
				_origin: "http://example.com/support-tool.html?other=param"
			}
		});
		assert.ok(oCallback.notCalled, 'Message with wrong origin should be rejected even if other checks pass');

		// Wrong identifier — should fail
		oCallback.reset();
		this.communicationBus._onmessage({
			origin: "http://example.com",
			data: {
				channelName: "test",
				_frameIdentifier: "wrong",
				_origin: "http://example.com/support-tool.html?other=param"
			}
		});
		assert.ok(oCallback.notCalled, 'Message with wrong identifier should be rejected even if other checks pass');

		// Wrong path — should fail
		oCallback.reset();
		this.communicationBus._onmessage({
			origin: "http://example.com",
			data: {
				channelName: "test",
				_frameIdentifier: "12345",
				_origin: "http://example.com/evil-page.html"
			}
		});
		assert.ok(oCallback.notCalled, 'Message with wrong path should be rejected even if other checks pass');
	});

	QUnit.test('Failed validation should log error', function (assert) {
		this.communicationBus.onMessageChecks.push(function () {
			return false;
		});

		var oLogSpy = sinon.spy(Log, "error");

		this.communicationBus._onmessage({
			origin: "http://evil.com",
			data: { channelName: "test" }
		});

		assert.ok(oLogSpy.calledWith("Message was received but failed validation"),
			'Should log an error when validation fails');

		oLogSpy.restore();
	});

	QUnit.test('Empty onMessageChecks should accept all messages', function (assert) {
		// onMessageChecks is empty (cleared in beforeEach)
		var oCallback = sinon.spy();
		this.communicationBus.subscribe("test", oCallback);

		this.communicationBus._onmessage({
			origin: "http://any-origin.com",
			data: { channelName: "test" }
		});

		assert.ok(oCallback.calledOnce,
			'With no checks registered, all messages should be accepted');
	});
});
