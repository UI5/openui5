/*!
 * ${copyright}
 */

/**
 * @typedef {object} EventListener
 */
sap.ui.define([
	"sap/ui/base/Object",
	"sap/base/Log",
	"sap/base/util/isEmptyObject"
], function (BaseObject, Log, isEmptyObject) {
	"use strict";

	/**
	 * <h3>Overview</h3>
	 * The WindowCommunicationBus is responsible for core communication between a tool frame and an application window
	 * Note that in each window there will be one "copy" of the class, so e.g. static properties will be instantiated again for each new window
	 * Since we need to configure the bus for multiple tools, for each tool we should create one inheriting class.
	 * Each of these child classes are singletons, so they will have one instance per window.
	 * If you need to share the exact same data between the two frames, use global variables
	 * @class
	 * @alias sap.ui.support.WindowCommunicationBus
	 * @author SAP SE
	 * @version ${version}
	 * @private
	 */
	var WindowCommunicationBus = BaseObject.extend("sap.ui.support.supportRules.WindowCommunicationBus", {
		constructor: function (oConfig) {
			BaseObject.call(this);
			this.bSilentMode = false;
			this._channels = {};
			this._frame = {};
			this._oConfig = oConfig;

			// inheriting classes will be singletons, and events should only be added once per window
			if (window.addEventListener) {
				window.addEventListener("message", this._onmessage.bind(this), false);
			} else {
				window.attachEvent("onmessage", this._onmessage.bind(this));
			}
		}
	});

	/**
	 * Subscribes to a channel with callback and given context
	 * @param {string} sChannelName Name of the channel to subscribe
	 * @param {function} fnCallback Callback for the SupportAssistant
	 * @param {object} oContext Context for the subscribed channel
	 */
	WindowCommunicationBus.prototype.subscribe = function (sChannelName, fnCallback, oContext) {
		if (this.bSilentMode) {
			return;
		}

		this._channels[sChannelName] = this._channels[sChannelName] || [];
		this._channels[sChannelName].push({
			callback: fnCallback,
			context: oContext
		});
	};

	/**
	 * Publishes given channel by name and settings
	 * @param {string} sChannelName Name of the channel to publish
	 * @param {string} aParams Settings passed to the SupportAssistant
	 */
	WindowCommunicationBus.prototype.publish = function (sChannelName, aParams) {
		if (this.bSilentMode) {
			return;
		}

		var receivingWindow = this._oConfig.getReceivingWindow();
		var dataObject = {
			channelName: sChannelName,
			params: aParams,
			_frameIdentifier: this._getFrameIdentifier(),
			_origin: window.location.href
		};

		// TODO: we need to find a way to make sure we're executing on the
		// correct window. Issue happen in cases where we're too fast to
		// post messages to the iframe but it is not there yet
		receivingWindow.postMessage(dataObject, this._oConfig.getOrigin());
	};

	/**
	 * mark an iframe as a valid participant in the communication
	 * @param {object} oOptions information about the iframe
	 */
	WindowCommunicationBus.prototype.allowFrame = function (oOptions) {
		// when a frame is opened from the application (opener) window, save the frame identifiers
		// this will allow communication between the opener and the new frame
		this._frame = {
			origin: oOptions.origin,
			identifier: oOptions.identifier,
			url: oOptions.url
		};
	};

	/**
	 * Clears all subscribed channels from the WindowCommunicationBus
	 * @private
	 */
	WindowCommunicationBus.prototype.destroyChannels = function () {
		this._channels = {};
	};

	/**
	 * This is the message handler used for communication between the WindowCommunicationBus and {@link sap.ui.support.WCBChannels}
	 * @private
	 * @param {EventListener} eMessage Event fired by the channels attached to the WindowCommunicationBus
	 */
	WindowCommunicationBus.prototype._onmessage = function (eMessage) {
		if (!this._validate(eMessage)) {
			Log.error("Message was received but failed validation");
			return;
		}

		var callbackObjects = this._channels[eMessage.data.channelName] || [];

		callbackObjects.forEach(function (cbObj) {
			cbObj.callback.apply(cbObj.context, [eMessage.data.params]);
		});
	};

	/**
	 * Compare the origins of two URLs. Returns false if either value is not a valid URL.
	 * @private
	 * @param {string} sOriginA First URL string
	 * @param {string} sOriginB Second URL string
	 * @returns {boolean} true if both URLs have the same origin
	 */
	WindowCommunicationBus._compareOrigins = function (sOriginA, sOriginB) {
		try {
			return new URL(sOriginA).origin === new URL(sOriginB).origin;
		} catch (e) {
			return false;
		}
	};

	/**
	 * Validate messages received from external windows.
	 * Both directions are validated:
	 * - Tool frame: validates origin of messages from opener window
	 * - Application window: validates origin, frame identifier, and URL path of messages from tool frame
	 * @private
	 * @param {EventListener} eMessage Event fired by the channels attached to the WindowCommunicationBus
	 * @returns {boolean} true if the message is valid
	 */
	WindowCommunicationBus.prototype._validate = function (eMessage) {
		// 1. Validate origin
		// tool frame: validate against the configured opener origin
		if (isEmptyObject(this._frame)) {
			const sExpectedOrigin = this._oConfig.getOrigin();

			if (sExpectedOrigin) {
				return WindowCommunicationBus._compareOrigins(eMessage.origin, sExpectedOrigin);
			}

			return true;
		}

		// application window: validate against the known tool frame origin
		if (!WindowCommunicationBus._compareOrigins(eMessage.origin, this._frame.origin)) {
			return false;
		}

		// 2. Validate frame identifier
		if (eMessage.data._frameIdentifier !== this._frame.identifier) {
			return false;
		}

		// 3. Validate URL path
		// Compare parsed pathnames to avoid substring-matching attacks.
		// The frame URL may be absolute or relative — strip query string and relative segments
		// to extract the path portion, then verify the message origin's pathname ends with it.
		try {
			const oOriginUrl = new URL(eMessage.data._origin);
			const iFrameUrlQuery = this._frame.url.indexOf("?");
			const sFrameUrlWithoutQuery = this._frame.url.substring(0, iFrameUrlQuery).replace(/\.\.\//g, "").replace(/\.\//g, "");

			// extract just the pathname: parse as URL if absolute, otherwise use the cleaned string as-is
			let sFramePath;
			try {
				sFramePath = new URL(sFrameUrlWithoutQuery).pathname;
			} catch (e) {
				// relative URL — use cleaned string directly as a path suffix
				sFramePath = sFrameUrlWithoutQuery;
			}

			if (!oOriginUrl.pathname.endsWith(sFramePath)) {
				return false;
			}
		} catch (e) {
			return false;
		}

		return true;
	};

	WindowCommunicationBus.prototype._getFrameIdentifier = function () {
		// a tool should start one frame whose ID is known by both the opener window and the frame.
		// within the opener window, the ID of the opened frame is saved in the _frame property
		// within the frame, the ID is 'saved' as a URI parameter.
		return this._frame.identifier || this._oConfig.getFrameId();
	};

	return WindowCommunicationBus;
}, true);
