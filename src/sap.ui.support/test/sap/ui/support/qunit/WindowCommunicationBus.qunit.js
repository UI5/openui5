/*global QUnit, sinon*/

sap.ui.define([
		"sap/ui/support/supportRules/WindowCommunicationBus",
		"sap/ui/support/supportRules/WCBConfig",
		"sap/base/util/isEmptyObject",
		"sap/base/Log"
	], function (
		WindowCommunicationBus,
		WCBConfig,
		isEmptyObject,
		Log
	) {
	"use strict";

	QUnit.module('Testing subscribe functionality', {
		beforeEach: function () {
			this.communicationBus = new WindowCommunicationBus(new WCBConfig({
				modulePath: "test",
				receivingWindow: "test1",
				uriParams: {
					origin: "test-origin",
					frameId: "test-identifier"
				}
			}));
		},
		afterEach: function () {
			this.communicationBus.destroyChannels();
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
		assert.ok(isEmptyObject(this.communicationBus._channels), 'The channels object should be empty before initial subscription');

		// act
		this.communicationBus.subscribe(channelName, testFunction, scope);

		// assert
		assert.strictEqual(this.communicationBus._channels[channelName][0].context.id, 'testScope', 'Should set the scope correctly');
		assert.strictEqual(this.communicationBus._channels[channelName][0].callback, testFunction, 'Should set the callback correctly');
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
		assert.strictEqual(isEmptyObject(this.communicationBus._channels), true,
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
		var subscriber = this.communicationBus._channels[channelName];

		// assert
		assert.strictEqual(subscriber.length, 2, 'Should set both of the functions.');
		assert.strictEqual(subscriber[0].callback, testFunction, 'Should set the first passed function first.');
		assert.strictEqual(subscriber[1].callback, secondTestFunction, 'Should set the second passed function after that.');
	});

	QUnit.module('Properties', {
		beforeEach: function () {
			this.oWindowCommunicationBus = new WindowCommunicationBus(new WCBConfig({
				modulePath: "test",
				receivingWindow: "test1",
				uriParams: {
					origin: "test-origin",
					frameId: "test-identifier"
				}
			}));

		},
		afterEach: function () {
			this.oWindowCommunicationBus.destroyChannels();
			this.oWindowCommunicationBus = null;
		}
	});

	QUnit.test('bSilentMode', function (assert) {
		// assert
		assert.strictEqual(this.oWindowCommunicationBus.bSilentMode, false, 'Default value of silent mode should be "false".');

		// act - turn silent mode on
		this.oWindowCommunicationBus.bSilentMode = true;
		this.oWindowCommunicationBus.subscribe('test_channel', function () {});

		// assert
		assert.ok(isEmptyObject(this.oWindowCommunicationBus._channels), 'There should NOT be any communication subscriptions when in silent mode.');
	});

	QUnit.module('_validate', {
		beforeEach: function () {
			// create a bus instance without registering a message listener on window
			// to avoid interference between tests and global failures from stale listeners
			this.communicationBus = Object.create(WindowCommunicationBus.prototype);
			this.communicationBus.bSilentMode = false;
			this.communicationBus._channels = {};
			this.communicationBus._frame = {};
			this.communicationBus._oConfig = new WCBConfig({
				modulePath: "test",
				receivingWindow: "test1",
				uriParams: {
					origin: "test-origin",
					frameId: "test-identifier"
				}
			});
		},
		afterEach: function () {
			this.communicationBus.destroyChannels();
			this.communicationBus = null;
		}
	});

	QUnit.test('Empty frame with matching origin should pass', function (assert) {
		// arrange - _frame is empty (tool frame scenario)
		// set the expected origin to match the message origin
		this.communicationBus._oConfig._sOrigin = "http://example.com";

		const eMessage = {
			origin: "http://example.com",
			data: {}
		};

		// act & assert
		assert.strictEqual(this.communicationBus._validate(eMessage), true,
			'Should accept messages from the known opener origin');
	});

	QUnit.test('Empty frame with different origin should fail', function (assert) {
		// arrange - _frame is empty (tool frame scenario)
		this.communicationBus._oConfig._sOrigin = "http://example.com";

		const eMessage = {
			origin: "http://evil.com",
			data: {}
		};

		// act & assert
		assert.strictEqual(this.communicationBus._validate(eMessage), false,
			'Should reject messages from unknown origins');
	});

	QUnit.test('Empty frame origin check should be case-insensitive', function (assert) {
		// arrange
		this.communicationBus._oConfig._sOrigin = "http://Example.COM";

		const eMessage = {
			origin: "http://example.com",
			data: {}
		};

		// act & assert
		assert.strictEqual(this.communicationBus._validate(eMessage), true,
			'Origin comparison should be case-insensitive');
	});

	QUnit.test('Empty frame with different port should fail', function (assert) {
		// arrange
		this.communicationBus._oConfig._sOrigin = "http://example.com";

		const eMessage = {
			origin: "http://example.com:8080",
			data: {}
		};

		// act & assert
		assert.strictEqual(this.communicationBus._validate(eMessage), false,
			'Should reject messages from a different port');
	});

	QUnit.test('Populated frame with matching details should pass', function (assert) {
		// arrange
		const sOrigin = "http://example.com";
		const sIdentifier = "12345";
		const sUrl = sOrigin + "/support-tool.html?param=value";

		this.communicationBus.allowFrame({
			origin: sOrigin,
			identifier: sIdentifier,
			url: sUrl
		});

		const eMessage = {
			origin: sOrigin,
			data: {
				_frameIdentifier: sIdentifier,
				_origin: sUrl
			}
		};

		// act & assert
		assert.strictEqual(this.communicationBus._validate(eMessage), true,
			'Should accept messages with matching frame details');
	});

	QUnit.test('Populated frame with wrong origin should fail', function (assert) {
		// arrange
		const sOrigin = "http://example.com";
		const sIdentifier = "12345";
		const sUrl = sOrigin + "/support-tool.html?param=value";

		this.communicationBus.allowFrame({
			origin: sOrigin,
			identifier: sIdentifier,
			url: sUrl
		});

		const eMessage = {
			origin: "http://evil.com",
			data: {
				_frameIdentifier: sIdentifier,
				_origin: sUrl
			}
		};

		// act & assert
		assert.strictEqual(this.communicationBus._validate(eMessage), false,
			'Should reject messages from wrong origin');
	});

	QUnit.test('Populated frame with wrong identifier should fail', function (assert) {
		// arrange
		const sOrigin = "http://example.com";
		const sUrl = sOrigin + "/support-tool.html?param=value";

		this.communicationBus.allowFrame({
			origin: sOrigin,
			identifier: "12345",
			url: sUrl
		});

		const eMessage = {
			origin: sOrigin,
			data: {
				_frameIdentifier: "wrong-id",
				_origin: sUrl
			}
		};

		// act & assert
		assert.strictEqual(this.communicationBus._validate(eMessage), false,
			'Should reject messages with wrong frame identifier');
	});

	QUnit.test('Populated frame with wrong URL should fail', function (assert) {
		// arrange
		const sOrigin = "http://example.com";
		const sIdentifier = "12345";
		const sUrl = sOrigin + "/support-tool.html?param=value";

		this.communicationBus.allowFrame({
			origin: sOrigin,
			identifier: sIdentifier,
			url: sUrl
		});

		const eMessage = {
			origin: sOrigin,
			data: {
				_frameIdentifier: sIdentifier,
				_origin: "http://example.com/other-page.html?param=value"
			}
		};

		// act & assert
		assert.strictEqual(this.communicationBus._validate(eMessage), false,
			'Should reject messages with wrong URL');
	});

	QUnit.test('Populated frame with missing _origin should fail', function (assert) {
		// arrange - simulates messages from browser extensions (e.g. React DevTools)
		const sOrigin = "http://example.com";
		const sIdentifier = "12345";
		const sUrl = sOrigin + "/support-tool.html?param=value";

		this.communicationBus.allowFrame({
			origin: sOrigin,
			identifier: sIdentifier,
			url: sUrl
		});

		const eMessage = {
			origin: sOrigin,
			data: {
				_frameIdentifier: sIdentifier
			}
		};

		// act & assert
		assert.strictEqual(this.communicationBus._validate(eMessage), false,
			'Should reject messages without _origin property');
	});

	QUnit.test('Populated frame with missing _frameIdentifier should fail', function (assert) {
		// arrange
		const sOrigin = "http://example.com";
		const sUrl = sOrigin + "/support-tool.html?param=value";

		this.communicationBus.allowFrame({
			origin: sOrigin,
			identifier: "12345",
			url: sUrl
		});

		const eMessage = {
			origin: sOrigin,
			data: {
				_origin: sUrl
			}
		};

		// act & assert
		assert.strictEqual(this.communicationBus._validate(eMessage), false,
			'Should reject messages without _frameIdentifier property');
	});

	QUnit.test('_onmessage should log error when validation fails', function (assert) {
		// arrange
		this.communicationBus._oConfig._sOrigin = "http://example.com";
		const oLogSpy = sinon.spy(Log, "error");

		const eMessage = {
			origin: "http://evil.com",
			data: {}
		};

		// act
		this.communicationBus._onmessage(eMessage);

		// assert
		assert.ok(oLogSpy.calledWith("Message was received but failed validation"),
			'Should log an error when validation fails');

		// clean up
		oLogSpy.restore();
	});

	QUnit.module('_compareOrigins', {});

	QUnit.test('Matching origins should return true', function (assert) {
		assert.strictEqual(WindowCommunicationBus._compareOrigins("http://example.com", "http://example.com"), true,
			'Same origins should match');
	});

	QUnit.test('Different origins should return false', function (assert) {
		assert.strictEqual(WindowCommunicationBus._compareOrigins("http://example.com", "http://evil.com"), false,
			'Different origins should not match');
	});

	QUnit.test('Malformed first argument should return false', function (assert) {
		assert.strictEqual(WindowCommunicationBus._compareOrigins("not-a-url", "http://example.com"), false,
			'Malformed first URL should return false');
	});

	QUnit.test('Malformed second argument should return false', function (assert) {
		assert.strictEqual(WindowCommunicationBus._compareOrigins("http://example.com", "not-a-url"), false,
			'Malformed second URL should return false');
	});

	QUnit.test('Empty string arguments should return false', function (assert) {
		assert.strictEqual(WindowCommunicationBus._compareOrigins("", "http://example.com"), false,
			'Empty first URL should return false');
		assert.strictEqual(WindowCommunicationBus._compareOrigins("http://example.com", ""), false,
			'Empty second URL should return false');
	});

	QUnit.test('Null/undefined arguments should return false', function (assert) {
		assert.strictEqual(WindowCommunicationBus._compareOrigins(null, "http://example.com"), false,
			'Null first URL should return false');
		assert.strictEqual(WindowCommunicationBus._compareOrigins("http://example.com", undefined), false,
			'Undefined second URL should return false');
	});

	QUnit.module('_validate — malformed URLs', {
		beforeEach: function () {
			this.communicationBus = Object.create(WindowCommunicationBus.prototype);
			this.communicationBus.bSilentMode = false;
			this.communicationBus._channels = {};
			this.communicationBus._frame = {};
			this.communicationBus._oConfig = new WCBConfig({
				modulePath: "test",
				receivingWindow: "test1",
				uriParams: {
					origin: "test-origin",
					frameId: "test-identifier"
				}
			});
		},
		afterEach: function () {
			this.communicationBus.destroyChannels();
			this.communicationBus = null;
		}
	});

	QUnit.test('Empty frame with malformed message origin should fail', function (assert) {
		// arrange
		this.communicationBus._oConfig._sOrigin = "http://example.com";

		const eMessage = {
			origin: "not-a-valid-url",
			data: {}
		};

		// act & assert
		assert.strictEqual(this.communicationBus._validate(eMessage), false,
			'Should reject messages with malformed origin');
	});

	QUnit.test('Empty frame with malformed configured origin should fail', function (assert) {
		// arrange
		this.communicationBus._oConfig._sOrigin = "not-a-valid-url";

		const eMessage = {
			origin: "http://example.com",
			data: {}
		};

		// act & assert
		assert.strictEqual(this.communicationBus._validate(eMessage), false,
			'Should reject when configured origin is malformed');
	});

	QUnit.test('Populated frame with malformed message origin should fail', function (assert) {
		// arrange
		this.communicationBus.allowFrame({
			origin: "http://example.com",
			identifier: "12345",
			url: "http://example.com/tool.html?param=value"
		});

		const eMessage = {
			origin: "not-a-valid-url",
			data: {
				_frameIdentifier: "12345",
				_origin: "http://example.com/tool.html?param=value"
			}
		};

		// act & assert
		assert.strictEqual(this.communicationBus._validate(eMessage), false,
			'Should reject messages with malformed origin');
	});

	QUnit.test('Populated frame with malformed frame origin should fail', function (assert) {
		// arrange
		this.communicationBus._frame = {
			origin: "not-a-valid-url",
			identifier: "12345",
			url: "http://example.com/tool.html?param=value"
		};

		const eMessage = {
			origin: "http://example.com",
			data: {
				_frameIdentifier: "12345",
				_origin: "http://example.com/tool.html?param=value"
			}
		};

		// act & assert
		assert.strictEqual(this.communicationBus._validate(eMessage), false,
			'Should reject when stored frame origin is malformed');
	});

	QUnit.test('Populated frame with malformed _origin in data should fail', function (assert) {
		// arrange
		this.communicationBus.allowFrame({
			origin: "http://example.com",
			identifier: "12345",
			url: "http://example.com/tool.html?param=value"
		});

		const eMessage = {
			origin: "http://example.com",
			data: {
				_frameIdentifier: "12345",
				_origin: "not-a-valid-url"
			}
		};

		// act & assert
		assert.strictEqual(this.communicationBus._validate(eMessage), false,
			'Should reject when data._origin is not a valid URL');
	});

	QUnit.module('_validate — URL path security', {
		beforeEach: function () {
			this.communicationBus = Object.create(WindowCommunicationBus.prototype);
			this.communicationBus.bSilentMode = false;
			this.communicationBus._channels = {};
			this.communicationBus._frame = {};
			this.communicationBus._oConfig = new WCBConfig({
				modulePath: "test",
				receivingWindow: "test1",
				uriParams: {
					origin: "test-origin",
					frameId: "test-identifier"
				}
			});
		},
		afterEach: function () {
			this.communicationBus.destroyChannels();
			this.communicationBus = null;
		}
	});

	QUnit.test('Should reject _origin that contains frame URL as substring in query parameter', function (assert) {
		// arrange — attacker embeds the legitimate URL in a query parameter
		const sOrigin = "http://example.com";
		const sIdentifier = "12345";
		const sUrl = sOrigin + "/support-tool.html?param=value";

		this.communicationBus.allowFrame({
			origin: sOrigin,
			identifier: sIdentifier,
			url: sUrl
		});

		const eMessage = {
			origin: sOrigin,
			data: {
				_frameIdentifier: sIdentifier,
				_origin: "http://example.com/evil.html?redirect=http://example.com/support-tool.html?param=value"
			}
		};

		// act & assert
		assert.strictEqual(this.communicationBus._validate(eMessage), false,
			'Should reject when frame URL only appears as a query parameter substring');
	});

	QUnit.test('Should reject _origin with frame path as prefix but different file', function (assert) {
		// arrange — pathname is /support-tool.html.evil
		const sOrigin = "http://example.com";
		const sIdentifier = "12345";
		const sUrl = sOrigin + "/support-tool.html?param=value";

		this.communicationBus.allowFrame({
			origin: sOrigin,
			identifier: sIdentifier,
			url: sUrl
		});

		const eMessage = {
			origin: sOrigin,
			data: {
				_frameIdentifier: sIdentifier,
				_origin: "http://example.com/support-tool.html.evil?param=value"
			}
		};

		// act & assert
		assert.strictEqual(this.communicationBus._validate(eMessage), false,
			'Should reject when pathname has the frame path as prefix but is a different file');
	});

	QUnit.test('Should accept _origin with matching pathname for relative frame URL', function (assert) {
		// arrange — frame URL is relative (not absolute)
		const sOrigin = "http://example.com";
		const sIdentifier = "12345";
		const sRelativeUrl = "../support/tool.html?sap-ui-xx-support-origin=" + encodeURIComponent(sOrigin);

		this.communicationBus.allowFrame({
			origin: sOrigin,
			identifier: sIdentifier,
			url: sRelativeUrl
		});

		const eMessage = {
			origin: sOrigin,
			data: {
				_frameIdentifier: sIdentifier,
				_origin: "http://example.com/resources/support/tool.html?sap-ui-xx-support-origin=" + encodeURIComponent(sOrigin)
			}
		};

		// act & assert
		assert.strictEqual(this.communicationBus._validate(eMessage), true,
			'Should accept when pathname ends with the cleaned relative frame URL path');
	});

	QUnit.test('Should reject _origin with non-matching pathname for relative frame URL', function (assert) {
		// arrange
		const sOrigin = "http://example.com";
		const sIdentifier = "12345";
		const sRelativeUrl = "../support/tool.html?sap-ui-xx-support-origin=" + encodeURIComponent(sOrigin);

		this.communicationBus.allowFrame({
			origin: sOrigin,
			identifier: sIdentifier,
			url: sRelativeUrl
		});

		const eMessage = {
			origin: sOrigin,
			data: {
				_frameIdentifier: sIdentifier,
				_origin: "http://example.com/other/page.html?sap-ui-xx-support-origin=" + encodeURIComponent(sOrigin)
			}
		};

		// act & assert
		assert.strictEqual(this.communicationBus._validate(eMessage), false,
			'Should reject when pathname does not end with the cleaned relative frame URL path');
	});
});
