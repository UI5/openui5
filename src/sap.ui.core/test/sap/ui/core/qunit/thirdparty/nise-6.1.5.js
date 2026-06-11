(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.nise = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
		"use strict";

// cache a reference to setTimeout, so that our reference won't be stubbed out
// when using fake timers and errors will still get logged
// https://github.com/cjohansen/Sinon.JS/issues/381
		var realSetTimeout = setTimeout;

		/**
		 * Creates an error logger for asynchronous callbacks.
		 * @param {object} [config] Logger configuration.
		 * @param {function(string): void} [config.logger] Receives formatted error messages.
		 * @param {boolean} [config.useImmediateExceptions] Throws in the current
		 * execution frame when `true`.
		 * @param {function(function(): void, number): (number|object)} [config.setTimeout] Timer function used for deferred
		 * exceptions.
		 * @returns {function(string, Error|object): void} Function that logs and rethrows callback errors.
		 */
		function configureLogger(config) {
			// eslint-disable-next-line no-param-reassign
			config = config || {};
			// Function which prints errors.
			if (!config.hasOwnProperty("logger")) {
				// eslint-disable-next-line no-empty-function
				config.logger = function () {};
			}
			// When set to true, any errors logged will be thrown immediately;
			// If set to false, the errors will be thrown in separate execution frame.
			if (!config.hasOwnProperty("useImmediateExceptions")) {
				config.useImmediateExceptions = true;
			}
			// wrap realSetTimeout with something we can stub in tests
			if (!config.hasOwnProperty("setTimeout")) {
				config.setTimeout = realSetTimeout;
			}

			return function logError(label, e) {
				var msg = `${label} threw exception: `;
				var err = {
					name: e.name || label,
					message: e.message || e.toString(),
					stack: e.stack,
				};

				/** Throws the normalized error after the logger has been called. */
				function throwLoggedError() {
					err.message = msg + err.message;
					throw err;
				}

				config.logger(`${msg}[${err.name}] ${err.message}`);

				if (err.stack) {
					config.logger(err.stack);
				}

				if (config.useImmediateExceptions) {
					throwLoggedError();
				} else {
					config.setTimeout(throwLoggedError, 0);
				}
			};
		}

		module.exports = configureLogger;

	},{}],2:[function(require,module,exports){
		"use strict";

		var Event = require("./event");

		/**
		 * Creates an event with an additional `detail` payload.
		 * @param {string} type Event type.
		 * @param {{detail?: unknown}} customData Source object for the `detail`
		 * payload.
		 * @param {object} [target] Event target.
		 * @class
		 */
		function CustomEvent(type, customData, target) {
			this.initEvent(type, false, false, target);
			this.detail = customData.detail || null;
		}

		CustomEvent.prototype = new Event();

		CustomEvent.prototype.constructor = CustomEvent;

		module.exports = CustomEvent;

	},{"./event":4}],3:[function(require,module,exports){
		"use strict";

		/**
		 * Normalizes boolean and object listener options to a DOM-like shape.
		 * @param {boolean|object} options Listener options or capture flag.
		 * @returns {{capture: boolean, once: boolean, passive: boolean}} Normalized listener options.
		 */
		function flattenOptions(options) {
			if (options !== Object(options)) {
				return {
					capture: Boolean(options),
					once: false,
					passive: false,
				};
			}
			return {
				capture: Boolean(options.capture),
				once: Boolean(options.once),
				passive: Boolean(options.passive),
			};
		}
		/**
		 * Inverts a predicate used while filtering listener registrations.
		 * @param {function(...object): boolean} fn Predicate to invert.
		 * @returns {function(...object): boolean} Inverted predicate.
		 */
		function not(fn) {
			return function () {
				return !fn.apply(this, arguments);
			};
		}
		/**
		 * Matches a listener registration by callback identity and capture mode.
		 * @param {function(object): void|{handleEvent: function(object): void}} listener Listener to match.
		 * @param {boolean} capture Expected capture mode.
		 * @returns {function({capture: boolean, listener: (function(object): void|{handleEvent: function(object): void})}): boolean} Listener matcher.
		 */
		function hasListenerFilter(listener, capture) {
			return function (listenerSpec) {
				return (
					listenerSpec.capture === capture &&
					listenerSpec.listener === listener
				);
			};
		}

		/**
		 * Mixin with a DOM-like event target API.
		 */
		var EventTarget = {
			// https://dom.spec.whatwg.org/#dom-eventtarget-addeventlistener
			/**
			 * Registers a listener for the given event type.
			 * @param {string} event Event type.
			 * @param {function(object): void|{handleEvent: function(object): void}} listener Callback or object with `handleEvent`.
			 * @param {boolean|object} [providedOptions] Listener options or capture flag.
			 * @returns {void}
			 */
			addEventListener: function addEventListener(
				event,
				listener,
				providedOptions,
			) {
				// 3. Let capture, passive, and once be the result of flattening more options.
				// Flatten property before executing step 2,
				// feture detection is usually based on registering handler with options object,
				// that has getter defined
				// addEventListener("load", () => {}, {
				//    get once() { supportsOnce = true; }
				// });
				var options = flattenOptions(providedOptions);

				// 2. If callback is null, then return.
				if (listener === null || listener === undefined) {
					return;
				}

				this.eventListeners = this.eventListeners || {};
				this.eventListeners[event] = this.eventListeners[event] || [];

				// 4. If context object’s associated list of event listener
				//    does not contain an event listener whose type is type,
				//    callback is callback, and capture is capture, then append
				//    a new event listener to it, whose type is type, callback is
				//    callback, capture is capture, passive is passive, and once is once.
				if (
					!this.eventListeners[event].some(
						hasListenerFilter(listener, options.capture),
					)
				) {
					this.eventListeners[event].push({
						listener: listener,
						capture: options.capture,
						once: options.once,
					});
				}
			},

			// https://dom.spec.whatwg.org/#dom-eventtarget-removeeventlistener
			/**
			 * Removes a listener previously added for the given event type.
			 * @param {string} event Event type.
			 * @param {function(object): void|{handleEvent: function(object): void}} listener Callback or object with `handleEvent`.
			 * @param {boolean|object} [providedOptions] Listener options or capture flag.
			 * @returns {void}
			 */
			removeEventListener: function removeEventListener(
				event,
				listener,
				providedOptions,
			) {
				if (!this.eventListeners || !this.eventListeners[event]) {
					return;
				}

				// 2. Let capture be the result of flattening options.
				var options = flattenOptions(providedOptions);

				// 3. If there is an event listener in the associated list of
				//    event listeners whose type is type, callback is callback,
				//    and capture is capture, then set that event listener’s
				//    removed to true and remove it from the associated list of event listeners.
				this.eventListeners[event] = this.eventListeners[event].filter(
					not(hasListenerFilter(listener, options.capture)),
				);
			},

			/**
			 * Dispatches an event to the registered listeners.
			 * @param {object} event Event object with a `type` property.
			 * @returns {boolean} Whether the event was prevented.
			 */
			dispatchEvent: function dispatchEvent(event) {
				if (!this.eventListeners || !this.eventListeners[event.type]) {
					return Boolean(event.defaultPrevented);
				}

				var self = this;
				var type = event.type;
				var listeners = self.eventListeners[type];

				// Remove listeners, that should be dispatched once
				// before running dispatch loop to avoid nested dispatch issues
				self.eventListeners[type] = listeners.filter(function (listenerSpec) {
					return !listenerSpec.once;
				});
				listeners.forEach(function (listenerSpec) {
					var listener = listenerSpec.listener;
					if (typeof listener === "function") {
						listener.call(self, event);
					} else {
						listener.handleEvent(event);
					}
				});

				return Boolean(event.defaultPrevented);
			},
		};

		module.exports = EventTarget;

	},{}],4:[function(require,module,exports){
		"use strict";

		/**
		 * Creates a minimal DOM-like event object.
		 * @param {string} type Event type.
		 * @param {boolean} bubbles Whether the event bubbles.
		 * @param {boolean} cancelable Whether the default action can be prevented.
		 * @param {object} [target] Event target.
		 * @class
		 */
		function Event(type, bubbles, cancelable, target) {
			this.initEvent(type, bubbles, cancelable, target);
		}

		Event.prototype = {
			/**
			 * Reinitializes the event instance with new values.
			 * @param {string} type Event type.
			 * @param {boolean} bubbles Whether the event bubbles.
			 * @param {boolean} cancelable Whether the default action can be prevented.
			 * @param {object} [target] Event target.
			 * @returns {void}
			 */
			initEvent: function (type, bubbles, cancelable, target) {
				this.type = type;
				this.bubbles = bubbles;
				this.cancelable = cancelable;
				this.target = target;
				this.currentTarget = target;
			},

			/** Included for API compatibility with DOM events. */
			// eslint-disable-next-line no-empty-function
			stopPropagation: function () {},

			/**
			 * Marks the event as prevented.
			 *
			 * Unlike DOM events, this implementation sets `defaultPrevented` even when
			 * the event is not cancelable.
			 * @returns {void}
			 */
			preventDefault: function () {
				this.defaultPrevented = true;
			},
		};

		module.exports = Event;

	},{}],5:[function(require,module,exports){
		"use strict";

		module.exports = {
			Event: require("./event"),
			ProgressEvent: require("./progress-event"),
			CustomEvent: require("./custom-event"),
			EventTarget: require("./event-target"),
		};

	},{"./custom-event":2,"./event":4,"./event-target":3,"./progress-event":6}],6:[function(require,module,exports){
		"use strict";

		var Event = require("./event");

		/**
		 * Creates an event that exposes transfer progress information.
		 * @param {string} type Event type.
		 * @param {object} progressEventRaw Source progress values.
		 * @param {object} [target] Event target.
		 * @class
		 */
		function ProgressEvent(type, progressEventRaw, target) {
			this.initEvent(type, false, false, target);
			this.loaded =
				typeof progressEventRaw.loaded === "number"
					? progressEventRaw.loaded
					: null;
			this.total =
				typeof progressEventRaw.total === "number"
					? progressEventRaw.total
					: null;
			this.lengthComputable = Boolean(progressEventRaw.total);
		}

		ProgressEvent.prototype = new Event();

		ProgressEvent.prototype.constructor = ProgressEvent;

		module.exports = ProgressEvent;

	},{"./event":4}],7:[function(require,module,exports){
		"use strict";

		var FakeTimers = require("@sinonjs/fake-timers");
		var fakeServer = require("./index");

		/**
		 * Internal constructor used to create a clock-aware fake server variant.
		 */
// eslint-disable-next-line no-empty-function
		function Server() {}
		Server.prototype = fakeServer;

		/**
		 * Fake server variant that advances fake timers while processing responses.
		 * @type {object}
		 */
		var fakeServerWithClock = new Server();

		/**
		 * Registers a request and installs fake timers for async request handling.
		 * @param {object} xhr Fake XMLHttpRequest instance.
		 * @returns {void}
		 */
		fakeServerWithClock.addRequest = function addRequest(xhr) {
			if (xhr.async) {
				if (typeof setTimeout.clock === "object") {
					this.clock = setTimeout.clock;
				} else {
					this.clock = FakeTimers.install();
					this.resetClock = true;
				}

				if (!this.longestTimeout) {
					var clockSetTimeout = this.clock.setTimeout;
					var clockSetInterval = this.clock.setInterval;
					var server = this;

					this.clock.setTimeout = function (fn, timeout) {
						server.longestTimeout = Math.max(
							timeout,
							server.longestTimeout || 0,
						);

						return clockSetTimeout.apply(this, arguments);
					};

					this.clock.setInterval = function (fn, timeout) {
						server.longestTimeout = Math.max(
							timeout,
							server.longestTimeout || 0,
						);

						return clockSetInterval.apply(this, arguments);
					};
				}
			}

			return fakeServer.addRequest.call(this, xhr);
		};

		/**
		 * Responds to queued requests and advances the fake clock to flush timers.
		 * @returns {void}
		 */
		fakeServerWithClock.respond = function respond() {
			var returnVal = fakeServer.respond.apply(this, arguments);

			if (this.clock) {
				this.clock.tick(this.longestTimeout || 0);
				this.longestTimeout = 0;

				if (this.resetClock) {
					this.clock.uninstall();
					this.resetClock = false;
				}
			}

			return returnVal;
		};

		/**
		 * Restores the server and uninstalls any fake clock created for it.
		 * @returns {void}
		 */
		fakeServerWithClock.restore = function restore() {
			if (this.clock) {
				this.clock.uninstall();
			}

			return fakeServer.restore.apply(this, arguments);
		};

		module.exports = fakeServerWithClock;

	},{"./index":8,"@sinonjs/fake-timers":32}],8:[function(require,module,exports){
		"use strict";

		var fakeXhr = require("../fake-xhr");
		var push = [].push;
		var log = require("./log");
		var configureLogError = require("../configure-logger");
		var pathToRegexp = require("path-to-regexp").pathToRegexp;

		var supportsArrayBuffer = typeof ArrayBuffer !== "undefined";

		/**
		 * @typedef {[number, object, string|ArrayBuffer]} FakeServerResponse
		 */

		/**
		 * @callback FakeServerResponder
		 * @param {object} request Fake XMLHttpRequest instance.
		 * @returns {FakeServerResponse|boolean}
		 */

		/**
		 * Normalize shorthand response values into `[status, headers, body]`.
		 * @param {string|ArrayBuffer|FakeServerResponse} handler Response shorthand or tuple.
		 * @returns {FakeServerResponse}
		 */
		function responseArray(handler) {
			var response = handler;

			if (Object.prototype.toString.call(handler) !== "[object Array]") {
				response = [200, {}, handler];
			}

			if (typeof response[2] !== "string") {
				if (!supportsArrayBuffer) {
					throw new TypeError(
						`Fake server response body should be a string, but was ${typeof response[2]}`,
					);
				} else if (!(response[2] instanceof ArrayBuffer)) {
					throw new TypeError(
						`Fake server response body should be a string or ArrayBuffer, but was ${typeof response[2]}`,
					);
				}
			}

			return response;
		}

		/**
		 * Return the fallback location used when no browser location is available.
		 * @returns {{hostname: string, port: string | number, protocol: string, host: string}}
		 */
		function getDefaultWindowLocation() {
			var winloc = {
				hostname: "localhost",
				port: process.env.PORT || 80,
				protocol: "http:",
			};
			winloc.host =
				winloc.hostname +
				(String(winloc.port) === "80" ? "" : `:${winloc.port}`);
			return winloc;
		}

		/**
		 * Resolve the active window location across supported environments.
		 * @returns {{hostname: string, port: string | number, protocol: string, host: string}}
		 */
		function getWindowLocation() {
			if (typeof window === "undefined") {
				// Fallback
				return getDefaultWindowLocation();
			}

			if (typeof window.location !== "undefined") {
				// Browsers place location on window
				return window.location;
			}

			if (
				typeof window.window !== "undefined" &&
				typeof window.window.location !== "undefined"
			) {
				// React Native on Android places location on window.window
				return window.window.location;
			}

			return getDefaultWindowLocation();
		}

		/**
		 * Check whether a response definition matches a method/url pair.
		 * @param {{method?: string, url?: string | RegExp | ((url: string) => boolean)}} response
		 * Response definition.
		 * @param {string} reqMethod Request method.
		 * @param {string} reqUrl Request URL.
		 * @returns {boolean}
		 */
		function matchOne(response, reqMethod, reqUrl) {
			var rmeth = response.method;
			var matchMethod = !rmeth || rmeth.toLowerCase() === reqMethod.toLowerCase();
			var url = response.url;
			var matchUrl =
				!url ||
				url === reqUrl ||
				(typeof url.test === "function" && url.test(reqUrl)) ||
				(typeof url === "function" && url(reqUrl) === true);

			return matchMethod && matchUrl;
		}

		/**
		 * Resolve and optionally execute a matching response definition.
		 * @this {typeof fakeServer}
		 * @param {{method?: string, url?: string|RegExp|function(string): boolean|{exec?: function(string): Array<string>|null}, response?: FakeServerResponder}} response
		 * Response definition.
		 * @param {{url: string}} request Fake XHR request.
		 * @returns {boolean|FakeServerResponse}
		 */
		function match(response, request) {
			var wloc = getWindowLocation();

			var rCurrLoc = new RegExp(`^${wloc.protocol}//${wloc.host}/`);

			var requestUrl = request.url;

			if (!/^https?:\/\//.test(requestUrl) || rCurrLoc.test(requestUrl)) {
				requestUrl = requestUrl.replace(rCurrLoc, "/");
			}

			if (matchOne(response, this.getHTTPMethod(request), requestUrl)) {
				if (typeof response.response === "function") {
					var ru = response.url;
					var args = [request].concat(
						ru && typeof ru.exec === "function"
							? ru.exec(requestUrl).slice(1)
							: [],
					);
					return response.response.apply(response, args);
				}

				return true;
			}

			return false;
		}

		/**
		 * Update request counters and convenience references on the server.
		 * @this {typeof fakeServer}
		 * @returns {void}
		 */
		function incrementRequestCount() {
			var count = ++this.requestCount;

			this.requested = true;

			this.requestedOnce = count === 1;
			this.requestedTwice = count === 2;
			this.requestedThrice = count === 3;

			this.firstRequest = this.getRequest(0);
			this.secondRequest = this.getRequest(1);
			this.thirdRequest = this.getRequest(2);

			this.lastRequest = this.getRequest(count - 1);
		}

		var fakeServer = {
			/**
			 * Creates a fake server instance backed by fake XMLHttpRequest.
			 * @param {object} [config] Server configuration.
			 * @returns {object} Fake server instance.
			 */
			create: function (config) {
				var server = Object.create(this);
				server.configure(config);
				this.xhr = fakeXhr.useFakeXMLHttpRequest();
				server.requests = [];
				server.requestCount = 0;
				server.queue = [];
				server.responses = [];

				this.xhr.onCreate = function (xhrObj) {
					xhrObj.unsafeHeadersEnabled = function () {
						return !(server.unsafeHeadersEnabled === false);
					};
					server.addRequest(xhrObj);
				};

				return server;
			},

			/**
			 * Applies supported runtime options to the server instance.
			 * @param {object} [config] Server configuration.
			 * @returns {void}
			 */
			configure: function (config) {
				var self = this;
				var allowlist = {
					autoRespond: true,
					autoRespondAfter: true,
					respondImmediately: true,
					fakeHTTPMethods: true,
					logger: true,
					unsafeHeadersEnabled: true,
				};

				// eslint-disable-next-line no-param-reassign
				config = config || {};

				Object.keys(config).forEach(function (setting) {
					if (setting in allowlist) {
						self[setting] = config[setting];
					}
				});

				self.logError = configureLogError(config);
			},

			/**
			 * Registers a fake XHR instance so the server can observe and respond to it.
			 * @param {object} xhrObj Fake XMLHttpRequest instance.
			 * @returns {void}
			 */
			addRequest: function addRequest(xhrObj) {
				var server = this;
				push.call(this.requests, xhrObj);

				incrementRequestCount.call(this);

				xhrObj.onSend = function () {
					server.handleRequest(this);

					if (server.respondImmediately) {
						server.respond();
					} else if (server.autoRespond && !server.responding) {
						setTimeout(function () {
							server.responding = false;
							server.respond();
						}, server.autoRespondAfter || 10);

						server.responding = true;
					}
				};
			},

			/**
			 * Resolves the effective HTTP method for a request.
			 * @param {object} request Request object created by fake XHR.
			 * @returns {string} HTTP method used for route matching.
			 */
			getHTTPMethod: function getHTTPMethod(request) {
				if (this.fakeHTTPMethods && /post/i.test(request.method)) {
					var matches = (request.requestBody || "").match(
						/_method=([^\b;]+)/,
					);
					return matches ? matches[1] : request.method;
				}

				return request.method;
			},

			/**
			 * Queues or processes a request depending on whether it is asynchronous.
			 * @param {object} xhr Fake XMLHttpRequest instance.
			 * @returns {void}
			 */
			handleRequest: function handleRequest(xhr) {
				if (xhr.async) {
					push.call(this.queue, xhr);
				} else {
					this.processRequest(xhr);
				}
			},

			logger: function () {
				// no-op; override via configure()
			},

			logError: configureLogError({}),

			log: log,

			/**
			 * Adds a canned response definition to the server.
			 * @param {string|FakeServerResponder|FakeServerResponse} [method] HTTP method, response body, or responder.
			 * @param {string|RegExp|function(string): boolean|FakeServerResponse} [url] URL matcher or response payload.
			 * @param {FakeServerResponse|FakeServerResponder|string|ArrayBuffer} [body] Response tuple or responder.
			 * @returns {void}
			 */
			respondWith: function respondWith(method, url, body) {
				if (arguments.length === 1 && typeof method !== "function") {
					this.response = responseArray(method);
					return;
				}

				if (arguments.length === 1) {
					// eslint-disable-next-line no-param-reassign
					body = method;
					// eslint-disable-next-line no-param-reassign
					url = method = null;
				}

				if (arguments.length === 2) {
					// eslint-disable-next-line no-param-reassign
					body = url;
					// eslint-disable-next-line no-param-reassign
					url = method;
					// eslint-disable-next-line no-param-reassign
					method = null;
				}

				// Escape port number to prevent "named" parameters in 'path-to-regexp' module
				if (typeof url === "string" && url !== "") {
					if (/:[0-9]+\//.test(url)) {
						var m = url.match(/^(https?:\/\/.*?):([0-9]+\/.*)$/);
						// eslint-disable-next-line no-param-reassign
						url = `${m[1]}\\:${m[2]}`;
					}
					if (/:\/\//.test(url)) {
						// eslint-disable-next-line no-param-reassign
						url = url.replace("://", "\\://");
					}
					if (/\*/.test(url)) {
						// Uses the new syntax for repeating parameters in path-to-regexp,
						// see https://github.com/pillarjs/path-to-regexp#unexpected--or-
						// eslint-disable-next-line no-param-reassign
						url = url.replace(/\/\*/g, "/*path");
					}
				}
				push.call(this.responses, {
					method: method,
					url:
						typeof url === "string" && url !== ""
							? pathToRegexp(url).regexp
							: url,
					response: typeof body === "function" ? body : responseArray(body),
				});
			},

			/**
			 * Responds to queued asynchronous requests.
			 * @returns {void}
			 */
			respond: function respond() {
				if (arguments.length > 0) {
					this.respondWith.apply(this, arguments);
				}

				var queue = this.queue || [];
				var requests = queue.splice(0, queue.length);
				var self = this;

				requests.forEach(function (request) {
					self.processRequest(request);
				});
			},

			/**
			 * Responds to all recorded requests, including ones already seen synchronously.
			 * @returns {void}
			 */
			respondAll: function respondAll() {
				if (this.respondImmediately) {
					return;
				}

				this.queue = this.requests.slice(0);

				var request;
				while ((request = this.queue.shift())) {
					this.processRequest(request);
				}
			},

			/**
			 * Resolves a matching fake response and applies it to a request.
			 * @param {object} request Fake XMLHttpRequest instance.
			 * @returns {void}
			 */
			processRequest: function processRequest(request) {
				try {
					if (request.aborted) {
						return;
					}

					var response = this.response || [404, {}, ""];

					if (this.responses) {
						for (var l = this.responses.length, i = l - 1; i >= 0; i--) {
							if (match.call(this, this.responses[i], request)) {
								response = this.responses[i].response;
								break;
							}
						}
					}

					if (request.readyState !== 4) {
						this.log(response, request);

						request.respond(response[0], response[1], response[2]);
					}
				} catch (e) {
					this.logError("Fake server request processing", e);
				}
			},

			/**
			 * Restores the original XMLHttpRequest implementation.
			 * @returns {void}
			 */
			restore: function restore() {
				return this.xhr.restore && this.xhr.restore.apply(this.xhr, arguments);
			},

			/**
			 * Retrieves a request by index from the request history.
			 * @param {number} index Request index.
			 * @returns {object|null} Matching request or `null`.
			 */
			getRequest: function getRequest(index) {
				return this.requests[index] || null;
			},

			/**
			 * Clears both response definitions and request history.
			 * @returns {void}
			 */
			reset: function reset() {
				this.resetBehavior();
				this.resetHistory();
			},

			/**
			 * Removes configured responses and queued requests.
			 * @returns {void}
			 */
			resetBehavior: function resetBehavior() {
				this.responses.length = this.queue.length = 0;
			},

			/**
			 * Clears recorded requests and derived request state flags.
			 * @returns {void}
			 */
			resetHistory: function resetHistory() {
				this.requests.length = this.requestCount = 0;

				this.requestedOnce =
					this.requestedTwice =
						this.requestedThrice =
							this.requested =
								false;

				this.firstRequest =
					this.secondRequest =
						this.thirdRequest =
							this.lastRequest =
								null;
			},
		};

		module.exports = fakeServer;

	},{"../configure-logger":1,"../fake-xhr":11,"./log":9,"path-to-regexp":37}],9:[function(require,module,exports){
		"use strict";
		var inspect = require("util").inspect;

		/**
		 * Logs a formatted request/response pair through the server's configured logger.
		 * @param {[number, object, string | ArrayBuffer]} response Fake server response tuple.
		 * @param {object} request Fake XMLHttpRequest instance.
		 * @returns {void}
		 */
		function log(response, request) {
			var str;

			str = `Request:\n${inspect(request)}\n\n`;
			str += `Response:\n${inspect(response)}\n\n`;

			/* istanbul ignore else: when this.logger is not a function, it can't be called */
			if (typeof this.logger === "function") {
				this.logger(str);
			}
		}

		module.exports = log;

	},{"util":35}],10:[function(require,module,exports){
		"use strict";

		var globalObject = require("@sinonjs/commons").global;

		exports.isSupported = (function () {
			try {
				return (
					typeof globalObject.Blob !== "undefined" &&
					Boolean(new globalObject.Blob())
				);
			} catch (e) {
				return false;
			}
		})();

	},{"@sinonjs/commons":19}],11:[function(require,module,exports){
		"use strict";

		var globalObject = require("@sinonjs/commons").global;
		var configureLogError = require("../configure-logger");
		var sinonEvent = require("../event");
		var extend = require("just-extend");

		var supportsProgress = typeof ProgressEvent !== "undefined";
		var supportsCustomEvent = typeof CustomEvent !== "undefined";
		var supportsArrayBuffer = typeof ArrayBuffer !== "undefined";
		var supportsBlob = require("./blob").isSupported;

		/** @returns {typeof Blob|undefined} Blob constructor for the current global scope */
		function getBlobConstructor() {
			return supportsBlob ? globalObject.Blob : undefined;
		}

		/** @returns {typeof FormData|undefined} FormData constructor for the current global scope */
		function getFormDataConstructor() {
			return globalObject.FormData;
		}

		/**
		 * Resolve the native XHR constructor available in a given global scope.
		 * @param {object} globalScope
		 * @returns {typeof XMLHttpRequest|function(): XMLHttpRequest|false}
		 */
		function getWorkingXHR(globalScope) {
			var supportsXHR = typeof globalScope.XMLHttpRequest !== "undefined";
			if (supportsXHR) {
				return globalScope.XMLHttpRequest;
			}

			var supportsActiveX = typeof globalScope.ActiveXObject !== "undefined";
			if (supportsActiveX) {
				return function () {
					return new globalScope.ActiveXObject("MSXML2.XMLHTTP.3.0");
				};
			}

			return false;
		}

// Ref: https://fetch.spec.whatwg.org/#forbidden-header-name
		var unsafeHeaders = {
			"Accept-Charset": true,
			"Access-Control-Request-Headers": true,
			"Access-Control-Request-Method": true,
			"Accept-Encoding": true,
			Connection: true,
			"Content-Length": true,
			Cookie: true,
			Cookie2: true,
			"Content-Transfer-Encoding": true,
			Date: true,
			DNT: true,
			Expect: true,
			Host: true,
			"Keep-Alive": true,
			Origin: true,
			Referer: true,
			TE: true,
			Trailer: true,
			"Transfer-Encoding": true,
			Upgrade: true,
			"User-Agent": true,
			Via: true,
		};

		/**
		 * Minimal event target wrapper used for FakeXMLHttpRequest and its upload target.
		 * @class
		 */
		function EventTargetHandler() {
			var self = this;
			var events = [
				"loadstart",
				"progress",
				"abort",
				"error",
				"load",
				"timeout",
				"loadend",
			];

			/**
			 * Relay DOM-style `on*` handlers through the EventTarget listener API.
			 * @param {string} eventName
			 * @returns {void}
			 */
			function addEventListener(eventName) {
				self.addEventListener(eventName, function (event) {
					var listener = self[`on${eventName}`];

					if (listener && typeof listener === "function") {
						listener.call(this, event);
					}
				});
			}

			events.forEach(addEventListener);
		}

		EventTargetHandler.prototype = sinonEvent.EventTarget;

		/**
		 * Trim HTTP whitespace bytes from a header value.
		 * @param {string} value
		 * @returns {string}
		 */
		function normalizeHeaderValue(value) {
			// Ref: https://fetch.spec.whatwg.org/#http-whitespace-bytes
			/*eslint no-control-regex: "off"*/
			return value.replace(/^[\x09\x0A\x0D\x20]+|[\x09\x0A\x0D\x20]+$/g, "");
		}

		/**
		 * Find a header name using case-insensitive matching.
		 * @param {object} headers
		 * @param {string} header
		 * @returns {string|null}
		 */
		function getHeader(headers, header) {
			var foundHeader = Object.keys(headers).filter(function (h) {
				return h.toLowerCase() === header.toLowerCase();
			});

			return foundHeader[0] || null;
		}

		/**
		 * Exclude Set-Cookie headers from the aggregated response header string.
		 * @param {string} header
		 * @returns {boolean}
		 */
		function excludeSetCookie2Header(header) {
			return !/^Set-Cookie2?$/i.test(header);
		}

		/**
		 * Ensure a mocked response body is compatible with the requested responseType.
		 * @param {unknown} body
		 * @param {string} responseType
		 * @returns {void}
		 * @throws {Error} If the body cannot be represented as the requested response type.
		 */
		function verifyResponseBodyType(body, responseType) {
			var error = null;
			var isString = typeof body === "string";
			var BlobConstructor = getBlobConstructor();

			if (responseType === "arraybuffer") {
				if (!isString && !(body instanceof ArrayBuffer)) {
					error = new Error(
						`Attempted to respond to fake XMLHttpRequest with ${body}, which is not a string or ArrayBuffer.`,
					);
					error.name = "InvalidBodyException";
				}
			} else if (responseType === "blob") {
				if (
					!isString &&
					!(body instanceof ArrayBuffer) &&
					BlobConstructor &&
					!(body instanceof BlobConstructor)
				) {
					error = new Error(
						`Attempted to respond to fake XMLHttpRequest with ${body}, which is not a string, ArrayBuffer, or Blob.`,
					);
					error.name = "InvalidBodyException";
				}
			} else if (!isString) {
				error = new Error(
					`Attempted to respond to fake XMLHttpRequest with ${body}, which is not a string.`,
				);
				error.name = "InvalidBodyException";
			}

			if (error) {
				throw error;
			}
		}

		/**
		 * Encode a JavaScript string as a UTF-8 ArrayBuffer.
		 * @param {string} input
		 * @returns {ArrayBuffer}
		 */
		function stringToUtf8ArrayBuffer(input) {
			/*eslint no-bitwise: "off"*/
			var bytes = [];

			for (var i = 0; i < input.length; i++) {
				var codePoint = input.charCodeAt(i);

				if (codePoint >= 0xd800 && codePoint <= 0xdbff) {
					var nextCodePoint = input.charCodeAt(i + 1);

					if (nextCodePoint >= 0xdc00 && nextCodePoint <= 0xdfff) {
						codePoint =
							((codePoint - 0xd800) << 10) +
							(nextCodePoint - 0xdc00) +
							0x10000;
						i += 1;
					} else {
						codePoint = 0xfffd;
					}
				} else if (codePoint >= 0xdc00 && codePoint <= 0xdfff) {
					codePoint = 0xfffd;
				}

				if (codePoint <= 0x7f) {
					bytes.push(codePoint);
				} else if (codePoint <= 0x7ff) {
					bytes.push(0xc0 | (codePoint >> 6), 0x80 | (codePoint & 0x3f));
				} else if (codePoint <= 0xffff) {
					bytes.push(
						0xe0 | (codePoint >> 12),
						0x80 | ((codePoint >> 6) & 0x3f),
						0x80 | (codePoint & 0x3f),
					);
				} else {
					bytes.push(
						0xf0 | (codePoint >> 18),
						0x80 | ((codePoint >> 12) & 0x3f),
						0x80 | ((codePoint >> 6) & 0x3f),
						0x80 | (codePoint & 0x3f),
					);
				}
			}

			return new Uint8Array(bytes).buffer;
		}

		/**
		 * Normalize string responses into an ArrayBuffer when required by responseType.
		 * @param {string|ArrayBuffer} body
		 * @returns {ArrayBuffer}
		 */
		function convertToArrayBuffer(body) {
			if (body instanceof ArrayBuffer) {
				return body;
			}

			return stringToUtf8ArrayBuffer(body);
		}

		/**
		 * Check whether a content type should be treated as XML.
		 * @param {string|null|undefined} contentType
		 * @returns {boolean}
		 */
		function isXmlContentType(contentType) {
			return (
				!contentType ||
				/(text\/xml)|(application\/xml)|(\+xml)/.test(contentType)
			);
		}

		/**
		 * @param {string} contentType
		 * @returns {boolean}
		 */
		function isHtmlContentType(contentType) {
			return /text\/html/i.test(contentType || "");
		}

		/**
		 * Reset the response fields exposed on a fake XHR instance.
		 * @param {object} xhr
		 * @returns {void}
		 */
		function clearResponse(xhr) {
			if (xhr.responseType === "" || xhr.responseType === "text") {
				xhr.response = xhr.responseText = "";
			} else {
				xhr.response = xhr.responseText = null;
			}
			xhr.responseXML = null;
		}

		/**
		 * @param {string} text
		 * @returns {Document|null}
		 */
		function parseHTML(text) {
			if (text === "" || typeof DOMParser === "undefined") {
				return null;
			}

			return new DOMParser().parseFromString(text, "text/html");
		}

		/**
		 * @typedef {object} FakeXMLHttpRequestApi
		 * @property {object} xhr Native XHR references captured from the provided global scope.
		 * @property {typeof FakeXMLHttpRequest} FakeXMLHttpRequest Fake XHR constructor bound to the provided global.
		 * @property {typeof useFakeXMLHttpRequest} useFakeXMLHttpRequest Installer for the fake XHR globals.
		 */

		/**
		 * Create the fake XHR API bound to a specific global object.
		 * @param {object} globalScope
		 * @returns {FakeXMLHttpRequestApi}
		 */
		function fakeXMLHttpRequestFor(globalScope) {
			var isReactNative =
				globalScope.navigator &&
				globalScope.navigator.product === "ReactNative";
			var sinonXhr = { XMLHttpRequest: globalScope.XMLHttpRequest };
			sinonXhr.GlobalXMLHttpRequest = globalScope.XMLHttpRequest;
			sinonXhr.GlobalActiveXObject = globalScope.ActiveXObject;
			sinonXhr.supportsActiveX =
				typeof sinonXhr.GlobalActiveXObject !== "undefined";
			sinonXhr.supportsXHR = typeof sinonXhr.GlobalXMLHttpRequest !== "undefined";
			sinonXhr.workingXHR = getWorkingXHR(globalScope);
			sinonXhr.supportsTimeout =
				sinonXhr.supportsXHR &&
				"timeout" in new sinonXhr.GlobalXMLHttpRequest();
			sinonXhr.supportsCORS =
				isReactNative ||
				(sinonXhr.supportsXHR &&
					"withCredentials" in new sinonXhr.GlobalXMLHttpRequest());

			// Note that for FakeXMLHttpRequest to work pre ES5
			// we lose some of the alignment with the spec.
			// To ensure as close a match as possible,
			// set responseType before calling open, send or respond;
			/**
			 * Fake `XMLHttpRequest` implementation used by Sinon servers and stubs.
			 * @class
			 * @param {object} [config] Logger configuration forwarded to `configureLogError`.
			 */
			function FakeXMLHttpRequest(config) {
				EventTargetHandler.call(this);
				this.readyState = FakeXMLHttpRequest.UNSENT;
				this.requestHeaders = {};
				this.requestBody = null;
				this.status = 0;
				this.statusText = "";
				this.upload = new EventTargetHandler();
				this.responseType = "";
				this.response = "";
				this.logError = configureLogError(config);

				if (sinonXhr.supportsTimeout) {
					this.timeout = 0;
				}

				if (sinonXhr.supportsCORS) {
					this.withCredentials = false;
				}

				if (typeof FakeXMLHttpRequest.onCreate === "function") {
					FakeXMLHttpRequest.onCreate(this);
				}
			}

			/**
			 * Ensure the request is open and not already sending before mutating it.
			 * @param {FakeXMLHttpRequest} xhr
			 * @returns {void}
			 * @throws {Error} If the fake request is not in the OPENED state.
			 */
			function verifyState(xhr) {
				if (xhr.readyState !== FakeXMLHttpRequest.OPENED) {
					throw new Error("INVALID_STATE_ERR");
				}

				if (xhr.sendFlag) {
					throw new Error("INVALID_STATE_ERR");
				}
			}

			// largest arity in XHR is 5 - XHR#open
			var apply = function (obj, method, args) {
				switch (args.length) {
					case 0:
						return obj[method]();
					case 1:
						return obj[method](args[0]);
					case 2:
						return obj[method](args[0], args[1]);
					case 3:
						return obj[method](args[0], args[1], args[2]);
					case 4:
						return obj[method](args[0], args[1], args[2], args[3]);
					case 5:
						return obj[method](args[0], args[1], args[2], args[3], args[4]);
					default:
						throw new Error("Unhandled case");
				}
			};

			FakeXMLHttpRequest.filters = [];
			/**
			 * Register a predicate that decides whether a request should fall back to the native XHR.
			 * @param {function(...unknown): boolean} fn
			 * @returns {void}
			 */
			FakeXMLHttpRequest.addFilter = function addFilter(fn) {
				this.filters.push(fn);
			};

			/**
			 * Replace fake request methods with the native XHR implementation for one request.
			 * @param {object} fakeXhr
			 * @param {object} xhrArgs
			 * @returns {void}
			 */
			/**
			 * Keep writable request-side properties in sync before delegating send().
			 * @param {object} fakeXhr
			 * @param {XMLHttpRequest} xhr
			 */
			function syncRequestProperties(fakeXhr, xhr) {
				var properties = ["responseType"];
				var isSynchronousRequest =
					fakeXhr.async === false || xhr.async === false;

				if (!isSynchronousRequest) {
					properties.push("withCredentials", "timeout");
				}

				properties.forEach(function (property) {
					if (xhr[property] !== fakeXhr[property]) {
						xhr[property] = fakeXhr[property];
					}
				});
			}
			FakeXMLHttpRequest.defake = function defake(fakeXhr, xhrArgs) {
				var xhr = new sinonXhr.workingXHR(); // eslint-disable-line new-cap

				[
					"open",
					"setRequestHeader",
					"abort",
					"getResponseHeader",
					"getAllResponseHeaders",
					"addEventListener",
					"overrideMimeType",
					"removeEventListener",
				].forEach(function (method) {
					fakeXhr[method] = function () {
						return apply(xhr, method, arguments);
					};
				});

				fakeXhr.send = function () {
					syncRequestProperties(fakeXhr, xhr);
					return apply(xhr, "send", arguments);
				};

				var copyAttrs = function (args) {
					args.forEach(function (attr) {
						fakeXhr[attr] = xhr[attr];
					});
				};

				var stateChangeStart = function () {
					fakeXhr.readyState = xhr.readyState;
					if (xhr.readyState >= FakeXMLHttpRequest.HEADERS_RECEIVED) {
						copyAttrs(["status", "statusText"]);
					}
					if (xhr.readyState >= FakeXMLHttpRequest.LOADING) {
						copyAttrs(["response"]);
						if (xhr.responseType === "" || xhr.responseType === "text") {
							copyAttrs(["responseText"]);
						}
					}
					if (
						xhr.readyState === FakeXMLHttpRequest.DONE &&
						(xhr.responseType === "" || xhr.responseType === "document")
					) {
						copyAttrs(["responseXML"]);
					}
				};

				var stateChangeEnd = function () {
					if (fakeXhr.onreadystatechange) {
						// eslint-disable-next-line no-useless-call
						fakeXhr.onreadystatechange.call(fakeXhr, {
							target: fakeXhr,
							currentTarget: fakeXhr,
						});
					}
				};

				var stateChange = function stateChange() {
					stateChangeStart();
					stateChangeEnd();
				};

				if (xhr.addEventListener) {
					xhr.addEventListener("readystatechange", stateChangeStart);

					Object.keys(fakeXhr.eventListeners).forEach(function (event) {
						fakeXhr.eventListeners[event].forEach(function (handler) {
							xhr.addEventListener(event, handler.listener, {
								capture: handler.capture,
								once: handler.once,
							});
						});
					});

					xhr.addEventListener("readystatechange", stateChangeEnd);
				} else {
					xhr.onreadystatechange = stateChange;
				}
				apply(xhr, "open", xhrArgs);
			};
			FakeXMLHttpRequest.useFilters = false;

			/**
			 * Ensure status and response headers are only set after `open`.
			 * @param {FakeXMLHttpRequest} xhr
			 * @returns {void}
			 * @throws {Error} If the request has not been opened.
			 */
			function verifyRequestOpened(xhr) {
				if (xhr.readyState !== FakeXMLHttpRequest.OPENED) {
					const errorMessage =
						xhr.readyState === FakeXMLHttpRequest.UNSENT
							? "INVALID_STATE_ERR - you might be trying to set the request state for a request that has already been aborted, it is recommended to check 'readyState' first..."
							: `INVALID_STATE_ERR - ${xhr.readyState}`;
					throw new Error(errorMessage);
				}
			}

			/**
			 * Ensure a response body is not written after the request has completed.
			 * @param {FakeXMLHttpRequest} xhr
			 * @returns {void}
			 * @throws {Error} If the request is already done.
			 */
			function verifyRequestSent(xhr) {
				if (xhr.readyState === FakeXMLHttpRequest.DONE) {
					throw new Error("Request done");
				}
			}

			/**
			 * Ensure headers are available before a response body is written asynchronously.
			 * @param {FakeXMLHttpRequest} xhr
			 * @returns {void}
			 * @throws {Error} If response headers have not been received yet.
			 */
			function verifyHeadersReceived(xhr) {
				if (
					xhr.async &&
					xhr.readyState !== FakeXMLHttpRequest.HEADERS_RECEIVED
				) {
					throw new Error("No headers received");
				}
			}

			/**
			 * Convert a mocked response body to the representation requested by `responseType`.
			 * @param {string} responseType
			 * @param {string|null|undefined} contentType
			 * @param {string|ArrayBuffer|Blob} body
			 * @returns {string|ArrayBuffer|Blob|Document|object|null}
			 */
			function convertResponseBody(responseType, contentType, body) {
				var BlobConstructor = getBlobConstructor();

				if (responseType === "" || responseType === "text") {
					return body;
				} else if (supportsArrayBuffer && responseType === "arraybuffer") {
					return convertToArrayBuffer(body);
				} else if (responseType === "json") {
					try {
						return JSON.parse(body);
					} catch (e) {
						// Return parsing failure as null
						return null;
					}
				} else if (BlobConstructor && responseType === "blob") {
					if (body instanceof BlobConstructor) {
						return body;
					}

					var blobOptions = {};
					if (contentType) {
						blobOptions.type = contentType;
					}
					return new BlobConstructor(
						[convertToArrayBuffer(body)],
						blobOptions,
					);
				} else if (responseType === "document") {
					if (isXmlContentType(contentType)) {
						return FakeXMLHttpRequest.parseXML(body);
					}
					if (isHtmlContentType(contentType)) {
						return parseHTML(body);
					}
					return null;
				}
				throw new Error(`Invalid responseType ${responseType}`);
			}

			/**
			 * Steps to follow when there is an error, according to:
			 * https://xhr.spec.whatwg.org/#request-error-steps
			 * @param {FakeXMLHttpRequest} xhr
			 * @returns {void}
			 */
			function requestErrorSteps(xhr) {
				clearResponse(xhr);
				xhr.errorFlag = true;
				xhr.requestHeaders = {};
				xhr.responseHeaders = {};

				if (
					xhr.readyState !== FakeXMLHttpRequest.UNSENT &&
					xhr.sendFlag &&
					xhr.readyState !== FakeXMLHttpRequest.DONE
				) {
					xhr.readyStateChange(FakeXMLHttpRequest.DONE);
					xhr.sendFlag = false;
				}
			}

			/**
			 * Parse a response body as XML, returning null when parsing fails.
			 * @param {string} text
			 * @returns {Document|null}
			 */
			FakeXMLHttpRequest.parseXML = function parseXML(text) {
				// Treat empty string as parsing failure
				if (text !== "") {
					try {
						if (typeof DOMParser !== "undefined") {
							var parser = new DOMParser();
							var parsererrorNS = "";

							try {
								var parsererrors = parser
									.parseFromString("INVALID", "text/xml")
									.getElementsByTagName("parsererror");
								if (parsererrors.length) {
									parsererrorNS = parsererrors[0].namespaceURI;
								}
							} catch (e) {
								// passing invalid XML makes IE11 throw
								// so no namespace needs to be determined
							}

							var result;
							try {
								result = parser.parseFromString(text, "text/xml");
							} catch (err) {
								return null;
							}

							return result.getElementsByTagNameNS(
								parsererrorNS,
								"parsererror",
							).length
								? null
								: result;
						}
						var xmlDoc = new window.ActiveXObject("Microsoft.XMLDOM");
						xmlDoc.async = "false";
						xmlDoc.loadXML(text);
						return xmlDoc.parseError.errorCode !== 0 ? null : xmlDoc;
					} catch (e) {
						// Unable to parse XML - no biggie
					}
				}

				return null;
			};

			FakeXMLHttpRequest.statusCodes = {
				100: "Continue",
				101: "Switching Protocols",
				200: "OK",
				201: "Created",
				202: "Accepted",
				203: "Non-Authoritative Information",
				204: "No Content",
				205: "Reset Content",
				206: "Partial Content",
				207: "Multi-Status",
				300: "Multiple Choice",
				301: "Moved Permanently",
				302: "Found",
				303: "See Other",
				304: "Not Modified",
				305: "Use Proxy",
				307: "Temporary Redirect",
				400: "Bad Request",
				401: "Unauthorized",
				402: "Payment Required",
				403: "Forbidden",
				404: "Not Found",
				405: "Method Not Allowed",
				406: "Not Acceptable",
				407: "Proxy Authentication Required",
				408: "Request Timeout",
				409: "Conflict",
				410: "Gone",
				411: "Length Required",
				412: "Precondition Failed",
				413: "Request Entity Too Large",
				414: "Request-URI Too Long",
				415: "Unsupported Media Type",
				416: "Requested Range Not Satisfiable",
				417: "Expectation Failed",
				422: "Unprocessable Entity",
				500: "Internal Server Error",
				501: "Not Implemented",
				502: "Bad Gateway",
				503: "Service Unavailable",
				504: "Gateway Timeout",
				505: "HTTP Version Not Supported",
			};

			extend(FakeXMLHttpRequest.prototype, sinonEvent.EventTarget, {
				async: true,

				/**
				 * Initialize the fake request and transition it to OPENED.
				 * @param {string} method
				 * @param {string} url
				 * @param {boolean} [async]
				 * @param {string} [username]
				 * @param {string} [password]
				 * @returns {void}
				 */
				open: function open(method, url, async, username, password) {
					this.method = method;
					this.url = url;
					this.async = typeof async === "boolean" ? async : true;
					this.username = username;
					this.password = password;
					clearResponse(this);
					this.requestHeaders = {};
					this.sendFlag = false;

					if (FakeXMLHttpRequest.useFilters === true) {
						var xhrArgs = arguments;
						var defake = FakeXMLHttpRequest.filters.some(function (filter) {
							return filter.apply(this, xhrArgs);
						});
						if (defake) {
							FakeXMLHttpRequest.defake(this, arguments);
							return;
						}
					}
					this.readyStateChange(FakeXMLHttpRequest.OPENED);
				},

				/**
				 * Update `readyState` and dispatch the matching XHR events.
				 * @param {number} state
				 * @returns {void}
				 */
				readyStateChange: function readyStateChange(state) {
					this.readyState = state;

					var readyStateChangeEvent = new sinonEvent.Event(
						"readystatechange",
						false,
						false,
						this,
					);
					if (typeof this.onreadystatechange === "function") {
						try {
							this.onreadystatechange(readyStateChangeEvent);
						} catch (e) {
							this.logError("Fake XHR onreadystatechange handler", e);
						}
					}

					if (this.readyState !== FakeXMLHttpRequest.DONE) {
						this.dispatchEvent(readyStateChangeEvent);
					} else {
						var event, progress;

						if (this.timedOut || this.aborted || this.status === 0) {
							progress = { loaded: 0, total: 0 };
							event =
								(this.timedOut && "timeout") ||
								(this.aborted && "abort") ||
								"error";
						} else {
							progress = { loaded: 100, total: 100 };
							event = "load";
						}

						if (supportsProgress) {
							this.upload.dispatchEvent(
								new sinonEvent.ProgressEvent(
									"progress",
									progress,
									this,
								),
							);
							this.upload.dispatchEvent(
								new sinonEvent.ProgressEvent(event, progress, this),
							);
							this.upload.dispatchEvent(
								new sinonEvent.ProgressEvent("loadend", progress, this),
							);
						}

						this.dispatchEvent(
							new sinonEvent.ProgressEvent("progress", progress, this),
						);
						this.dispatchEvent(
							new sinonEvent.ProgressEvent(event, progress, this),
						);
						this.dispatchEvent(readyStateChangeEvent);
						this.dispatchEvent(
							new sinonEvent.ProgressEvent("loadend", progress, this),
						);
					}
				},

				// Ref https://xhr.spec.whatwg.org/#the-setrequestheader()-method
				/**
				 * Add or merge a request header unless it is forbidden by the XHR spec.
				 * @param {string} header
				 * @param {string} value
				 * @returns {void}
				 */
				setRequestHeader: function setRequestHeader(header, value) {
					if (typeof value !== "string") {
						throw new TypeError(
							`By RFC7230, section 3.2.4, header values should be strings. Got ${typeof value}`,
						);
					}
					verifyState(this);

					var checkUnsafeHeaders = true;
					if (typeof this.unsafeHeadersEnabled === "function") {
						checkUnsafeHeaders = this.unsafeHeadersEnabled();
					}

					if (
						checkUnsafeHeaders &&
						(getHeader(unsafeHeaders, header) !== null ||
							/^(Sec-|Proxy-)/i.test(header))
					) {
						return;
					}

					// eslint-disable-next-line no-param-reassign
					value = normalizeHeaderValue(value);

					var existingHeader = getHeader(this.requestHeaders, header);
					if (existingHeader) {
						this.requestHeaders[existingHeader] += `, ${value}`;
					} else {
						this.requestHeaders[header] = value;
					}
				},

				/**
				 * Set the HTTP status code used by `respond`.
				 * @param {number} status
				 * @returns {void}
				 */
				setStatus: function setStatus(status) {
					var sanitizedStatus = typeof status === "number" ? status : 200;

					verifyRequestOpened(this);
					this.status = sanitizedStatus;
					this.statusText = FakeXMLHttpRequest.statusCodes[sanitizedStatus];
				},

				// Helps testing
				/**
				 * Store response headers and move the request to HEADERS_RECEIVED.
				 * @param {object} headers
				 * @returns {void}
				 */
				setResponseHeaders: function setResponseHeaders(headers) {
					verifyRequestOpened(this);

					var responseHeaders = (this.responseHeaders = {});

					Object.keys(headers).forEach(function (header) {
						responseHeaders[header] = headers[header];
					});

					if (this.async) {
						this.readyStateChange(FakeXMLHttpRequest.HEADERS_RECEIVED);
					} else {
						this.readyState = FakeXMLHttpRequest.HEADERS_RECEIVED;
					}
				},

				// Currently treats ALL data as a DOMString (i.e. no Document)
				/**
				 * Send the fake request and normalize default request headers.
				 * @param {string|ArrayBuffer|Blob|FormData|null|undefined} data
				 * @returns {void}
				 */
				send: function send(data) {
					verifyState(this);

					if (!/^(head)$/i.test(this.method)) {
						var contentType = getHeader(
							this.requestHeaders,
							"Content-Type",
						);
						var FormDataConstructor = getFormDataConstructor();
						if (
							!this.requestHeaders[contentType] &&
							!(
								FormDataConstructor &&
								data instanceof FormDataConstructor
							)
						) {
							this.requestHeaders["Content-Type"] =
								"text/plain;charset=utf-8";
						}

						this.requestBody = data;
					}

					this.errorFlag = false;
					this.sendFlag = this.async;
					clearResponse(this);

					if (typeof this.onSend === "function") {
						this.onSend(this);
					}

					// Only listen if setInterval and Date are a stubbed.
					if (
						sinonXhr.supportsTimeout &&
						typeof setInterval.clock === "object" &&
						typeof Date.clock === "object"
					) {
						var initiatedTime = Date.now();
						var self = this;

						// Listen to any possible tick by fake timers and check to see if timeout has
						// been exceeded. It's important to note that timeout can be changed while a request
						// is in flight, so we must check anytime the end user forces a clock tick to make
						// sure timeout hasn't changed.
						// https://xhr.spec.whatwg.org/#dfnReturnLink-2
						var clearIntervalId = setInterval(function () {
							// Check if the readyState has been reset or is done. If this is the case, there
							// should be no timeout. This will also prevent aborted requests and
							// fakeServerWithClock from triggering unnecessary responses.
							if (
								self.readyState === FakeXMLHttpRequest.UNSENT ||
								self.readyState === FakeXMLHttpRequest.DONE
							) {
								clearInterval(clearIntervalId);
							} else if (
								typeof self.timeout === "number" &&
								self.timeout > 0
							) {
								if (Date.now() >= initiatedTime + self.timeout) {
									self.triggerTimeout();
									clearInterval(clearIntervalId);
								}
							}
						}, 1);
					}

					this.dispatchEvent(
						new sinonEvent.Event("loadstart", false, false, this),
					);
				},

				abort: function abort() {
					this.aborted = true;
					requestErrorSteps(this);
					this.readyState = FakeXMLHttpRequest.UNSENT;
				},

				error: function () {
					clearResponse(this);
					this.errorFlag = true;
					this.requestHeaders = {};
					this.responseHeaders = {};

					this.readyStateChange(FakeXMLHttpRequest.DONE);
				},

				triggerTimeout: function triggerTimeout() {
					if (sinonXhr.supportsTimeout) {
						this.timedOut = true;
						requestErrorSteps(this);
					}
				},

				getResponseHeader: function getResponseHeader(header) {
					if (this.readyState < FakeXMLHttpRequest.HEADERS_RECEIVED) {
						return null;
					}

					if (/^Set-Cookie2?$/i.test(header)) {
						return null;
					}

					// eslint-disable-next-line no-param-reassign
					header = getHeader(this.responseHeaders, header);

					return this.responseHeaders[header] || null;
				},

				getAllResponseHeaders: function getAllResponseHeaders() {
					if (this.readyState < FakeXMLHttpRequest.HEADERS_RECEIVED) {
						return "";
					}

					var responseHeaders = this.responseHeaders;
					var headers = Object.keys(responseHeaders)
						.filter(excludeSetCookie2Header)
						.reduce(function (prev, header) {
							var value = responseHeaders[header];

							return `${prev}${header}: ${value}\r\n`;
						}, "");

					return headers;
				},

				setResponseBody: function setResponseBody(body) {
					verifyRequestSent(this);
					verifyHeadersReceived(this);
					verifyResponseBodyType(body, this.responseType);
					var contentType =
						this.overriddenMimeType ||
						this.getResponseHeader("Content-Type");

					var isTextResponse =
						this.responseType === "" || this.responseType === "text";
					clearResponse(this);
					if (this.async) {
						var chunkSize = this.chunkSize || 10;
						var index = 0;

						do {
							this.readyStateChange(FakeXMLHttpRequest.LOADING);

							if (isTextResponse) {
								this.responseText = this.response += body.substring(
									index,
									index + chunkSize,
								);
							}
							index += chunkSize;
						} while (index < body.length);
					}

					this.response = convertResponseBody(
						this.responseType,
						contentType,
						body,
					);
					if (isTextResponse) {
						this.responseText = this.response;
					}

					if (this.responseType === "document") {
						this.responseXML = this.response;
					} else if (
						this.responseType === "" &&
						isXmlContentType(contentType)
					) {
						this.responseXML = FakeXMLHttpRequest.parseXML(
							this.responseText,
						);
					}
					this.readyStateChange(FakeXMLHttpRequest.DONE);
				},

				respond: function respond(status, headers, body) {
					this.responseURL = this.url;

					this.setStatus(status);
					this.setResponseHeaders(headers || {});
					this.setResponseBody(body || "");
				},

				uploadProgress: function uploadProgress(progressEventRaw) {
					if (supportsProgress) {
						this.upload.dispatchEvent(
							new sinonEvent.ProgressEvent(
								"progress",
								progressEventRaw,
								this.upload,
							),
						);
					}
				},

				downloadProgress: function downloadProgress(progressEventRaw) {
					if (supportsProgress) {
						this.dispatchEvent(
							new sinonEvent.ProgressEvent(
								"progress",
								progressEventRaw,
								this,
							),
						);
					}
				},

				uploadError: function uploadError(error) {
					if (supportsCustomEvent) {
						this.upload.dispatchEvent(
							new sinonEvent.CustomEvent("error", { detail: error }),
						);
					}
				},

				overrideMimeType: function overrideMimeType(type) {
					if (this.readyState >= FakeXMLHttpRequest.LOADING) {
						throw new Error("INVALID_STATE_ERR");
					}
					this.overriddenMimeType = type;
				},
			});

			var states = {
				UNSENT: 0,
				OPENED: 1,
				HEADERS_RECEIVED: 2,
				LOADING: 3,
				DONE: 4,
			};

			extend(FakeXMLHttpRequest, states);
			extend(FakeXMLHttpRequest.prototype, states);

			/**
			 * Install FakeXMLHttpRequest into the provided global scope.
			 * @returns {typeof FakeXMLHttpRequest} The fake XMLHttpRequest constructor.
			 */
			function useFakeXMLHttpRequest() {
				FakeXMLHttpRequest.restore = function restore(keepOnCreate) {
					if (sinonXhr.supportsXHR) {
						globalScope.XMLHttpRequest = sinonXhr.GlobalXMLHttpRequest;
					}

					if (sinonXhr.supportsActiveX) {
						globalScope.ActiveXObject = sinonXhr.GlobalActiveXObject;
					}

					delete FakeXMLHttpRequest.restore;

					if (keepOnCreate !== true) {
						delete FakeXMLHttpRequest.onCreate;
					}
				};
				if (sinonXhr.supportsXHR) {
					globalScope.XMLHttpRequest = FakeXMLHttpRequest;
				}

				if (sinonXhr.supportsActiveX) {
					globalScope.ActiveXObject = function ActiveXObject(objId) {
						if (
							objId === "Microsoft.XMLHTTP" ||
							/^Msxml2\.XMLHTTP/i.test(objId)
						) {
							return new FakeXMLHttpRequest();
						}

						return new sinonXhr.GlobalActiveXObject(objId);
					};
				}

				return FakeXMLHttpRequest;
			}

			return {
				xhr: sinonXhr,
				FakeXMLHttpRequest: FakeXMLHttpRequest,
				useFakeXMLHttpRequest: useFakeXMLHttpRequest,
			};
		}

		module.exports = extend(fakeXMLHttpRequestFor(globalObject), {
			fakeXMLHttpRequestFor: fakeXMLHttpRequestFor,
		});

	},{"../configure-logger":1,"../event":5,"./blob":10,"@sinonjs/commons":19,"just-extend":36}],12:[function(require,module,exports){
		"use strict";

		module.exports = {
			fakeServer: require("./fake-server"),
			fakeServerWithClock: require("./fake-server/fake-server-with-clock"),
			fakeXhr: require("./fake-xhr"),
		};

	},{"./fake-server":8,"./fake-server/fake-server-with-clock":7,"./fake-xhr":11}],13:[function(require,module,exports){
		"use strict";

		var every = require("./prototypes/array").every;

		/**
		 * @private
		 */
		function hasCallsLeft(callMap, spy) {
			if (callMap[spy.id] === undefined) {
				callMap[spy.id] = 0;
			}

			return callMap[spy.id] < spy.callCount;
		}

		/**
		 * @private
		 */
		function checkAdjacentCalls(callMap, spy, index, spies) {
			var calledBeforeNext = true;

			if (index !== spies.length - 1) {
				calledBeforeNext = spy.calledBefore(spies[index + 1]);
			}

			if (hasCallsLeft(callMap, spy) && calledBeforeNext) {
				callMap[spy.id] += 1;
				return true;
			}

			return false;
		}

		/**
		 * A Sinon proxy object (fake, spy, stub)
		 * @typedef {object} SinonProxy
		 * @property {Function} calledBefore - A method that determines if this proxy was called before another one
		 * @property {string} id - Some id
		 * @property {number} callCount - Number of times this proxy has been called
		 */

		/**
		 * Returns true when the spies have been called in the order they were supplied in
		 * @param  {SinonProxy[] | SinonProxy} spies An array of proxies, or several proxies as arguments
		 * @returns {boolean} true when spies are called in order, false otherwise
		 */
		function calledInOrder(spies) {
			var callMap = {};
			// eslint-disable-next-line no-underscore-dangle
			var _spies = arguments.length > 1 ? arguments : spies;

			return every(_spies, checkAdjacentCalls.bind(null, callMap));
		}

		module.exports = calledInOrder;

	},{"./prototypes/array":21}],14:[function(require,module,exports){
		"use strict";

		/**
		 * Returns a display name for a value from a constructor
		 * @param  {object} value A value to examine
		 * @returns {(string|null)} A string or null
		 */
		function className(value) {
			const name = value.constructor && value.constructor.name;
			return name || null;
		}

		module.exports = className;

	},{}],15:[function(require,module,exports){
		/* eslint-disable no-console */
		"use strict";

		/**
		 * Returns a function that will invoke the supplied function and print a
		 * deprecation warning to the console each time it is called.
		 * @param  {Function} func
		 * @param  {string} msg
		 * @returns {Function}
		 */
		exports.wrap = function (func, msg) {
			var wrapped = function () {
				exports.printWarning(msg);
				return func.apply(this, arguments);
			};
			if (func.prototype) {
				wrapped.prototype = func.prototype;
			}
			return wrapped;
		};

		/**
		 * Returns a string which can be supplied to `wrap()` to notify the user that a
		 * particular part of the sinon API has been deprecated.
		 * @param  {string} packageName
		 * @param  {string} funcName
		 * @returns {string}
		 */
		exports.defaultMsg = function (packageName, funcName) {
			return `${packageName}.${funcName} is deprecated and will be removed from the public API in a future version of ${packageName}.`;
		};

		/**
		 * Prints a warning on the console, when it exists
		 * @param  {string} msg
		 * @returns {undefined}
		 */
		exports.printWarning = function (msg) {
			/* istanbul ignore next */
			if (typeof process === "object" && process.emitWarning) {
				// Emit Warnings in Node
				process.emitWarning(msg);
			} else if (console.info) {
				console.info(msg);
			} else {
				console.log(msg);
			}
		};

	},{}],16:[function(require,module,exports){
		"use strict";

		/**
		 * Returns true when fn returns true for all members of obj.
		 * This is an every implementation that works for all iterables
		 * @param  {object}   obj
		 * @param  {Function} fn
		 * @returns {boolean}
		 */
		module.exports = function every(obj, fn) {
			var pass = true;

			try {
				// eslint-disable-next-line @sinonjs/no-prototype-methods/no-prototype-methods
				obj.forEach(function () {
					if (!fn.apply(this, arguments)) {
						// Throwing an error is the only way to break `forEach`
						throw new Error();
					}
				});
			} catch (e) {
				pass = false;
			}

			return pass;
		};

	},{}],17:[function(require,module,exports){
		"use strict";

		/**
		 * Returns a display name for a function
		 * @param  {Function} func
		 * @returns {string}
		 */
		module.exports = function functionName(func) {
			if (!func) {
				return "";
			}

			try {
				return (
					func.displayName ||
					func.name ||
					// Use function decomposition as a last resort to get function
					// name. Does not rely on function decomposition to work - if it
					// doesn't debugging will be slightly less informative
					// (i.e. toString will say 'spy' rather than 'myFunc').
					(String(func).match(/function ([^\s(]+)/) || [])[1]
				);
			} catch (e) {
				// Stringify may fail and we might get an exception, as a last-last
				// resort fall back to empty string.
				return "";
			}
		};

	},{}],18:[function(require,module,exports){
		"use strict";

		/**
		 * A reference to the global object
		 * @type {object} globalObject
		 */
		var globalObject;

		/* istanbul ignore else */
		if (typeof global !== "undefined") {
			// Node
			globalObject = global;
		} else if (typeof window !== "undefined") {
			// Browser
			globalObject = window;
		} else {
			// WebWorker
			globalObject = self;
		}

		module.exports = globalObject;

	},{}],19:[function(require,module,exports){
		"use strict";

		module.exports = {
			global: require("./global"),
			calledInOrder: require("./called-in-order"),
			className: require("./class-name"),
			deprecated: require("./deprecated"),
			every: require("./every"),
			functionName: require("./function-name"),
			orderByFirstCall: require("./order-by-first-call"),
			prototypes: require("./prototypes"),
			typeOf: require("./type-of"),
			valueToString: require("./value-to-string"),
		};

	},{"./called-in-order":13,"./class-name":14,"./deprecated":15,"./every":16,"./function-name":17,"./global":18,"./order-by-first-call":20,"./prototypes":24,"./type-of":30,"./value-to-string":31}],20:[function(require,module,exports){
		"use strict";

		var sort = require("./prototypes/array").sort;
		var slice = require("./prototypes/array").slice;

		/**
		 * @private
		 */
		function comparator(a, b) {
			// uuid, won't ever be equal
			var aCall = a.getCall(0);
			var bCall = b.getCall(0);
			var aId = (aCall && aCall.callId) || -1;
			var bId = (bCall && bCall.callId) || -1;

			return aId < bId ? -1 : 1;
		}

		/**
		 * A Sinon proxy object (fake, spy, stub)
		 * @typedef {object} SinonProxy
		 * @property {Function} getCall - A method that can return the first call
		 */

		/**
		 * Sorts an array of SinonProxy instances (fake, spy, stub) by their first call
		 * @param  {SinonProxy[] | SinonProxy} spies
		 * @returns {SinonProxy[]}
		 */
		function orderByFirstCall(spies) {
			return sort(slice(spies), comparator);
		}

		module.exports = orderByFirstCall;

	},{"./prototypes/array":21}],21:[function(require,module,exports){
		"use strict";

		var copyPrototype = require("./copy-prototype-methods");

		module.exports = copyPrototype(Array.prototype);

	},{"./copy-prototype-methods":22}],22:[function(require,module,exports){
		"use strict";

		var call = Function.call;
		var throwsOnProto = require("./throws-on-proto");

		var disallowedProperties = [
			// ignore size because it throws from Map
			"size",
			"caller",
			"callee",
			"arguments",
		];

// This branch is covered when tests are run with `--disable-proto=throw`,
// however we can test both branches at the same time, so this is ignored
		/* istanbul ignore next */
		if (throwsOnProto) {
			disallowedProperties.push("__proto__");
		}

		module.exports = function copyPrototypeMethods(prototype) {
			// eslint-disable-next-line @sinonjs/no-prototype-methods/no-prototype-methods
			return Object.getOwnPropertyNames(prototype).reduce(function (
					result,
					name
				) {
					if (disallowedProperties.includes(name)) {
						return result;
					}

					if (typeof prototype[name] !== "function") {
						return result;
					}

					result[name] = call.bind(prototype[name]);

					return result;
				},
				Object.create(null));
		};

	},{"./throws-on-proto":29}],23:[function(require,module,exports){
		"use strict";

		var copyPrototype = require("./copy-prototype-methods");

		module.exports = copyPrototype(Function.prototype);

	},{"./copy-prototype-methods":22}],24:[function(require,module,exports){
		"use strict";

		module.exports = {
			array: require("./array"),
			function: require("./function"),
			map: require("./map"),
			object: require("./object"),
			set: require("./set"),
			string: require("./string"),
		};

	},{"./array":21,"./function":23,"./map":25,"./object":26,"./set":27,"./string":28}],25:[function(require,module,exports){
		"use strict";

		var copyPrototype = require("./copy-prototype-methods");

		module.exports = copyPrototype(Map.prototype);

	},{"./copy-prototype-methods":22}],26:[function(require,module,exports){
		"use strict";

		var copyPrototype = require("./copy-prototype-methods");

		module.exports = copyPrototype(Object.prototype);

	},{"./copy-prototype-methods":22}],27:[function(require,module,exports){
		"use strict";

		var copyPrototype = require("./copy-prototype-methods");

		module.exports = copyPrototype(Set.prototype);

	},{"./copy-prototype-methods":22}],28:[function(require,module,exports){
		"use strict";

		var copyPrototype = require("./copy-prototype-methods");

		module.exports = copyPrototype(String.prototype);

	},{"./copy-prototype-methods":22}],29:[function(require,module,exports){
		"use strict";

		/**
		 * Is true when the environment causes an error to be thrown for accessing the
		 * __proto__ property.
		 * This is necessary in order to support `node --disable-proto=throw`.
		 *
		 * See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/proto
		 * @type {boolean}
		 */
		let throwsOnProto;
		try {
			const object = {};
			// eslint-disable-next-line no-proto, no-unused-expressions
			object.__proto__;
			throwsOnProto = false;
		} catch (_) {
			// This branch is covered when tests are run with `--disable-proto=throw`,
			// however we can test both branches at the same time, so this is ignored
			/* istanbul ignore next */
			throwsOnProto = true;
		}

		module.exports = throwsOnProto;

	},{}],30:[function(require,module,exports){
		"use strict";

		var type = require("type-detect");

		/**
		 * Returns the lower-case result of running type from type-detect on the value
		 * @param  {*} value
		 * @returns {string}
		 */
		module.exports = function typeOf(value) {
			return type(value).toLowerCase();
		};

	},{"type-detect":38}],31:[function(require,module,exports){
		"use strict";

		/**
		 * Returns a string representation of the value
		 * @param  {*} value
		 * @returns {string}
		 */
		function valueToString(value) {
			if (value && value.toString) {
				// eslint-disable-next-line @sinonjs/no-prototype-methods/no-prototype-methods
				return value.toString();
			}
			return String(value);
		}

		module.exports = valueToString;

	},{}],32:[function(require,module,exports){
		"use strict";

		const globalObject = require("@sinonjs/commons").global;
		let timersModule, timersPromisesModule;
		if (typeof require === "function" && typeof module === "object") {
			try {
				timersModule = require("timers");
			} catch (e) {
				// ignored
			}
			try {
				timersPromisesModule = require("timers/promises");
			} catch (e) {
				// ignored
			}
		}

		/**
		 * @typedef {"nextAsync" | "manual" | "interval"} TickMode
		 */

		/**
		 * @typedef {object} NextAsyncTickMode
		 * @property {"nextAsync"} mode
		 */

		/**
		 * @typedef {object} ManualTickMode
		 * @property {"manual"} mode
		 */

		/**
		 * @typedef {object} IntervalTickMode
		 * @property {"interval"} mode
		 * @property {number} [delta]
		 */

		/**
		 * @typedef {IntervalTickMode | NextAsyncTickMode | ManualTickMode} TimerTickMode
		 */

		/**
		 * @typedef {object} IdleDeadline
		 * @property {boolean} didTimeout - whether or not the callback was called before reaching the optional timeout
		 * @property {function():number} timeRemaining - a floating-point value providing an estimate of the number of milliseconds remaining in the current idle period
		 */

		/**
		 * Queues a function to be called during a browser's idle periods
		 * @callback RequestIdleCallback
		 * @param {function(IdleDeadline)} callback
		 * @param {{timeout: number}} options - an options object
		 * @returns {number} the id
		 */

		/**
		 * @callback NextTick
		 * @param {VoidVarArgsFunc} callback - the callback to run
		 * @param {...*} args - optional arguments to call the callback with
		 * @returns {void}
		 */

		/**
		 * @callback SetImmediate
		 * @param {VoidVarArgsFunc} callback - the callback to run
		 * @param {...*} args - optional arguments to call the callback with
		 * @returns {NodeImmediate}
		 */

		/**
		 * @callback VoidVarArgsFunc
		 * @param {...*} callback - the callback to run
		 * @returns {void}
		 */

		/**
		 * @typedef RequestAnimationFrame
		 * @property {function(number):void} requestAnimationFrame
		 * @returns {number} - the id
		 */

		/**
		 * @typedef Performance
		 * @property {function(): number} now
		 */

		/* eslint-disable jsdoc/require-property-description */
		/**
		 * @typedef {object} Clock
		 * @property {number} now - the current time
		 * @property {Date} Date - the Date constructor
		 * @property {number} loopLimit - the maximum number of timers before assuming an infinite loop
		 * @property {RequestIdleCallback} requestIdleCallback
		 * @property {function(number):void} cancelIdleCallback
		 * @property {setTimeout} setTimeout
		 * @property {clearTimeout} clearTimeout
		 * @property {NextTick} nextTick
		 * @property {queueMicrotask} queueMicrotask
		 * @property {setInterval} setInterval
		 * @property {clearInterval} clearInterval
		 * @property {SetImmediate} setImmediate
		 * @property {function(NodeImmediate):void} clearImmediate
		 * @property {function():number} countTimers
		 * @property {RequestAnimationFrame} requestAnimationFrame
		 * @property {function(number):void} cancelAnimationFrame
		 * @property {function():void} runMicrotasks
		 * @property {function(string | number): number} tick
		 * @property {function(string | number): Promise<number>} tickAsync
		 * @property {function(): number} next
		 * @property {function(): Promise<number>} nextAsync
		 * @property {function(): number} runAll
		 * @property {function(): number} runToFrame
		 * @property {function(): Promise<number>} runAllAsync
		 * @property {function(): number} runToLast
		 * @property {function(): Promise<number>} runToLastAsync
		 * @property {function(): void} reset
		 * @property {function(number | Date): void} setSystemTime
		 * @property {function(number): void} jump
		 * @property {Performance} performance
		 * @property {function(number[]): number[]} hrtime - process.hrtime (legacy)
		 * @property {function(): void} uninstall Uninstall the clock.
		 * @property {Function[]} methods - the methods that are faked
		 * @property {boolean} [shouldClearNativeTimers] inherited from config
		 * @property {{methodName:string, original:any}[] | undefined} timersModuleMethods
		 * @property {{methodName:string, original:any}[] | undefined} timersPromisesModuleMethods
		 * @property {Map<function(): void, AbortSignal>} abortListenerMap
		 * @property {function(TimerTickMode): void} setTickMode
		 */
		/* eslint-enable jsdoc/require-property-description */

		/**
		 * Configuration object for the `install` method.
		 * @typedef {object} Config
		 * @property {number|Date} [now] a number (in milliseconds) or a Date object (default epoch)
		 * @property {string[]} [toFake] names of the methods that should be faked.
		 * @property {number} [loopLimit] the maximum number of timers that will be run when calling runAll()
		 * @property {boolean} [shouldAdvanceTime] tells FakeTimers to increment mocked time automatically (default false)
		 * @property {number} [advanceTimeDelta] increment mocked time every <<advanceTimeDelta>> ms (default: 20ms)
		 * @property {boolean} [shouldClearNativeTimers] forwards clear timer calls to native functions if they are not fakes (default: false)
		 * @property {boolean} [ignoreMissingTimers] default is false, meaning asking to fake timers that are not present will throw an error
		 */

		/* eslint-disable jsdoc/require-property-description */
		/**
		 * The internal structure to describe a scheduled fake timer
		 * @typedef {object} Timer
		 * @property {Function} func
		 * @property {*[]} args
		 * @property {number} delay
		 * @property {number} callAt
		 * @property {number} createdAt
		 * @property {boolean} immediate
		 * @property {number} id
		 * @property {Error} [error]
		 */

		/**
		 * A Node timer
		 * @typedef {object} NodeImmediate
		 * @property {function(): boolean} hasRef
		 * @property {function(): NodeImmediate} ref
		 * @property {function(): NodeImmediate} unref
		 */
		/* eslint-enable jsdoc/require-property-description */

		/* eslint-disable complexity */

		/**
		 * Mocks available features in the specified global namespace.
		 * @param {*} _global Namespace to mock (e.g. `window`)
		 * @returns {FakeTimers}
		 */
		function withGlobal(_global) {
			const maxTimeout = Math.pow(2, 31) - 1; //see https://heycam.github.io/webidl/#abstract-opdef-converttoint
			const idCounterStart = 1e12; // arbitrarily large number to avoid collisions with native timer IDs
			const NOOP = function () {
				return undefined;
			};
			const NOOP_ARRAY = function () {
				return [];
			};
			const isPresent = {};
			let timeoutResult,
				addTimerReturnsObject = false;

			if (_global.setTimeout) {
				isPresent.setTimeout = true;
				timeoutResult = _global.setTimeout(NOOP, 0);
				addTimerReturnsObject = typeof timeoutResult === "object";
			}
			isPresent.clearTimeout = Boolean(_global.clearTimeout);
			isPresent.setInterval = Boolean(_global.setInterval);
			isPresent.clearInterval = Boolean(_global.clearInterval);
			isPresent.hrtime =
				_global.process && typeof _global.process.hrtime === "function";
			isPresent.hrtimeBigint =
				isPresent.hrtime && typeof _global.process.hrtime.bigint === "function";
			isPresent.nextTick =
				_global.process && typeof _global.process.nextTick === "function";
			const utilPromisify = _global.process && require("util").promisify;
			isPresent.performance =
				_global.performance && typeof _global.performance.now === "function";
			const hasPerformancePrototype =
				_global.Performance &&
				(typeof _global.Performance).match(/^(function|object)$/);
			const hasPerformanceConstructorPrototype =
				_global.performance &&
				_global.performance.constructor &&
				_global.performance.constructor.prototype;
			isPresent.queueMicrotask = _global.hasOwnProperty("queueMicrotask");
			isPresent.requestAnimationFrame =
				_global.requestAnimationFrame &&
				typeof _global.requestAnimationFrame === "function";
			isPresent.cancelAnimationFrame =
				_global.cancelAnimationFrame &&
				typeof _global.cancelAnimationFrame === "function";
			isPresent.requestIdleCallback =
				_global.requestIdleCallback &&
				typeof _global.requestIdleCallback === "function";
			isPresent.cancelIdleCallbackPresent =
				_global.cancelIdleCallback &&
				typeof _global.cancelIdleCallback === "function";
			isPresent.setImmediate =
				_global.setImmediate && typeof _global.setImmediate === "function";
			isPresent.clearImmediate =
				_global.clearImmediate && typeof _global.clearImmediate === "function";
			isPresent.Intl = _global.Intl && typeof _global.Intl === "object";

			if (_global.clearTimeout) {
				_global.clearTimeout(timeoutResult);
			}

			const NativeDate = _global.Date;
			const NativeIntl = isPresent.Intl
				? Object.defineProperties(
					Object.create(null),
					Object.getOwnPropertyDescriptors(_global.Intl),
				)
				: undefined;
			let uniqueTimerId = idCounterStart;

			if (NativeDate === undefined) {
				throw new Error(
					"The global scope doesn't have a `Date` object" +
					" (see https://github.com/sinonjs/sinon/issues/1852#issuecomment-419622780)",
				);
			}
			isPresent.Date = true;

			/**
			 * The PerformanceEntry object encapsulates a single performance metric
			 * that is part of the browser's performance timeline.
			 *
			 * This is an object returned by the `mark` and `measure` methods on the Performance prototype
			 */
			class FakePerformanceEntry {
				constructor(name, entryType, startTime, duration) {
					this.name = name;
					this.entryType = entryType;
					this.startTime = startTime;
					this.duration = duration;
				}

				toJSON() {
					return JSON.stringify({ ...this });
				}
			}

			/**
			 * @param {number} num
			 * @returns {boolean}
			 */
			function isNumberFinite(num) {
				if (Number.isFinite) {
					return Number.isFinite(num);
				}

				return isFinite(num);
			}

			let isNearInfiniteLimit = false;

			/**
			 * @param {Clock} clock
			 * @param {number} i
			 */
			function checkIsNearInfiniteLimit(clock, i) {
				if (clock.loopLimit && i === clock.loopLimit - 1) {
					isNearInfiniteLimit = true;
				}
			}

			/**
			 *
			 */
			function resetIsNearInfiniteLimit() {
				isNearInfiniteLimit = false;
			}

			/**
			 * Parse strings like "01:10:00" (meaning 1 hour, 10 minutes, 0 seconds) into
			 * number of milliseconds. This is used to support human-readable strings passed
			 * to clock.tick()
			 * @param {string} str
			 * @returns {number}
			 */
			function parseTime(str) {
				if (!str) {
					return 0;
				}

				const strings = str.split(":");
				const l = strings.length;
				let i = l;
				let ms = 0;
				let parsed;

				if (l > 3 || !/^(\d\d:){0,2}\d\d?$/.test(str)) {
					throw new Error(
						"tick only understands numbers, 'm:s' and 'h:m:s'. Each part must be two digits",
					);
				}

				while (i--) {
					parsed = parseInt(strings[i], 10);

					if (parsed >= 60) {
						throw new Error(`Invalid time ${str}`);
					}

					ms += parsed * Math.pow(60, l - i - 1);
				}

				return ms * 1000;
			}

			/**
			 * Get the decimal part of the millisecond value as nanoseconds
			 * @param {number} msFloat the number of milliseconds
			 * @returns {number} an integer number of nanoseconds in the range [0,1e6)
			 *
			 * Example: nanoRemainer(123.456789) -> 456789
			 */
			function nanoRemainder(msFloat) {
				const modulo = 1e6;
				const remainder = (msFloat * 1e6) % modulo;
				const positiveRemainder =
					remainder < 0 ? remainder + modulo : remainder;

				return Math.floor(positiveRemainder);
			}

			/**
			 * Used to grok the `now` parameter to createClock.
			 * @param {Date|number} epoch the system time
			 * @returns {number}
			 */
			function getEpoch(epoch) {
				if (!epoch) {
					return 0;
				}
				if (typeof epoch.getTime === "function") {
					return epoch.getTime();
				}
				if (typeof epoch === "number") {
					return epoch;
				}
				throw new TypeError("now should be milliseconds since UNIX epoch");
			}

			/**
			 * @param {number} from
			 * @param {number} to
			 * @param {Timer} timer
			 * @returns {boolean}
			 */
			function inRange(from, to, timer) {
				return timer && timer.callAt >= from && timer.callAt <= to;
			}

			/**
			 * @param {Clock} clock
			 * @param {Timer} job
			 */
			function getInfiniteLoopError(clock, job) {
				const infiniteLoopError = new Error(
					`Aborting after running ${clock.loopLimit} timers, assuming an infinite loop!`,
				);

				if (!job.error) {
					return infiniteLoopError;
				}

				// pattern never matched in Node
				const computedTargetPattern = /target\.*[<|(|[].*?[>|\]|)]\s*/;
				let clockMethodPattern = new RegExp(
					String(Object.keys(clock).join("|")),
				);

				if (addTimerReturnsObject) {
					// node.js environment
					clockMethodPattern = new RegExp(
						`\\s+at (Object\\.)?(?:${Object.keys(clock).join("|")})\\s+`,
					);
				}

				let matchedLineIndex = -1;
				job.error.stack.split("\n").some(function (line, i) {
					// If we've matched a computed target line (e.g. setTimeout) then we
					// don't need to look any further. Return true to stop iterating.
					const matchedComputedTarget = line.match(computedTargetPattern);
					/* istanbul ignore if */
					if (matchedComputedTarget) {
						matchedLineIndex = i;
						return true;
					}

					// If we've matched a clock method line, then there may still be
					// others further down the trace. Return false to keep iterating.
					const matchedClockMethod = line.match(clockMethodPattern);
					if (matchedClockMethod) {
						matchedLineIndex = i;
						return false;
					}

					// If we haven't matched anything on this line, but we matched
					// previously and set the matched line index, then we can stop.
					// If we haven't matched previously, then we should keep iterating.
					return matchedLineIndex >= 0;
				});

				const stack = `${infiniteLoopError}\n${job.type || "Microtask"} - ${
					job.func.name || "anonymous"
				}\n${job.error.stack
					.split("\n")
					.slice(matchedLineIndex + 1)
					.join("\n")}`;

				try {
					Object.defineProperty(infiniteLoopError, "stack", {
						value: stack,
					});
				} catch (e) {
					// noop
				}

				return infiniteLoopError;
			}

			//eslint-disable-next-line jsdoc/require-jsdoc
			function createDate() {
				class ClockDate extends NativeDate {
					/**
					 * @param {number} year
					 * @param {number} month
					 * @param {number} date
					 * @param {number} hour
					 * @param {number} minute
					 * @param {number} second
					 * @param {number} ms
					 * @returns void
					 */
					// eslint-disable-next-line no-unused-vars
					constructor(year, month, date, hour, minute, second, ms) {
						// Defensive and verbose to avoid potential harm in passing
						// explicit undefined when user does not pass argument
						if (arguments.length === 0) {
							super(ClockDate.clock.now);
						} else {
							super(...arguments);
						}

						// ensures identity checks using the constructor prop still works
						// this should have no other functional effect
						Object.defineProperty(this, "constructor", {
							value: NativeDate,
							enumerable: false,
						});
					}

					static [Symbol.hasInstance](instance) {
						return instance instanceof NativeDate;
					}
				}

				ClockDate.isFake = true;

				if (NativeDate.now) {
					ClockDate.now = function now() {
						return ClockDate.clock.now;
					};
				}

				if (NativeDate.toSource) {
					ClockDate.toSource = function toSource() {
						return NativeDate.toSource();
					};
				}

				ClockDate.toString = function toString() {
					return NativeDate.toString();
				};

				// noinspection UnnecessaryLocalVariableJS
				/**
				 * A normal Class constructor cannot be called without `new`, but Date can, so we need
				 * to wrap it in a Proxy in order to ensure this functionality of Date is kept intact
				 * @type {ClockDate}
				 */
				const ClockDateProxy = new Proxy(ClockDate, {
					// handler for [[Call]] invocations (i.e. not using `new`)
					apply() {
						// the Date constructor called as a function, ref Ecma-262 Edition 5.1, section 15.9.2.
						// This remains so in the 10th edition of 2019 as well.
						if (this instanceof ClockDate) {
							throw new TypeError(
								"A Proxy should only capture `new` calls with the `construct` handler. This is not supposed to be possible, so check the logic.",
							);
						}

						return new NativeDate(ClockDate.clock.now).toString();
					},
				});

				return ClockDateProxy;
			}

			/**
			 * Mirror Intl by default on our fake implementation
			 *
			 * Most of the properties are the original native ones,
			 * but we need to take control of those that have a
			 * dependency on the current clock.
			 * @returns {object} the partly fake Intl implementation
			 */
			function createIntl() {
				const ClockIntl = {};
				/*
         * All properties of Intl are non-enumerable, so we need
         * to do a bit of work to get them out.
         */
				Object.getOwnPropertyNames(NativeIntl).forEach(
					(property) => (ClockIntl[property] = NativeIntl[property]),
				);

				ClockIntl.DateTimeFormat = function (...args) {
					const realFormatter = new NativeIntl.DateTimeFormat(...args);
					const formatter = {};

					["formatRange", "formatRangeToParts", "resolvedOptions"].forEach(
						(method) => {
							formatter[method] =
								realFormatter[method].bind(realFormatter);
						},
					);

					["format", "formatToParts"].forEach((method) => {
						formatter[method] = function (date) {
							return realFormatter[method](date || ClockIntl.clock.now);
						};
					});

					return formatter;
				};

				ClockIntl.DateTimeFormat.prototype = Object.create(
					NativeIntl.DateTimeFormat.prototype,
				);

				ClockIntl.DateTimeFormat.supportedLocalesOf =
					NativeIntl.DateTimeFormat.supportedLocalesOf;

				return ClockIntl;
			}

			//eslint-disable-next-line jsdoc/require-jsdoc
			function enqueueJob(clock, job) {
				// enqueues a microtick-deferred task - ecma262/#sec-enqueuejob
				if (!clock.jobs) {
					clock.jobs = [];
				}
				clock.jobs.push(job);
			}

			//eslint-disable-next-line jsdoc/require-jsdoc
			function runJobs(clock) {
				// runs all microtick-deferred tasks - ecma262/#sec-runjobs
				if (!clock.jobs) {
					return;
				}
				for (let i = 0; i < clock.jobs.length; i++) {
					const job = clock.jobs[i];
					job.func.apply(null, job.args);

					checkIsNearInfiniteLimit(clock, i);
					if (clock.loopLimit && i > clock.loopLimit) {
						throw getInfiniteLoopError(clock, job);
					}
				}
				resetIsNearInfiniteLimit();
				clock.jobs = [];
			}

			/**
			 * @param {Clock} clock
			 * @param {Timer} timer
			 * @returns {number} id of the created timer
			 */
			function addTimer(clock, timer) {
				if (timer.func === undefined) {
					throw new Error("Callback must be provided to timer calls");
				}

				if (addTimerReturnsObject) {
					// Node.js environment
					if (typeof timer.func !== "function") {
						throw new TypeError(
							`[ERR_INVALID_CALLBACK]: Callback must be a function. Received ${
								timer.func
							} of type ${typeof timer.func}`,
						);
					}
				}

				if (isNearInfiniteLimit) {
					timer.error = new Error();
				}

				timer.type = timer.immediate ? "Immediate" : "Timeout";

				if (timer.hasOwnProperty("delay")) {
					if (typeof timer.delay !== "number") {
						timer.delay = parseInt(timer.delay, 10);
					}

					if (!isNumberFinite(timer.delay)) {
						timer.delay = 0;
					}
					timer.delay = timer.delay > maxTimeout ? 1 : timer.delay;
					timer.delay = Math.max(0, timer.delay);
				}

				if (timer.hasOwnProperty("interval")) {
					timer.type = "Interval";
					timer.interval = timer.interval > maxTimeout ? 1 : timer.interval;
				}

				if (timer.hasOwnProperty("animation")) {
					timer.type = "AnimationFrame";
					timer.animation = true;
				}

				if (timer.hasOwnProperty("idleCallback")) {
					timer.type = "IdleCallback";
					timer.idleCallback = true;
				}

				if (!clock.timers) {
					clock.timers = {};
				}

				timer.id = uniqueTimerId++;
				timer.createdAt = clock.now;
				timer.callAt =
					clock.now + (parseInt(timer.delay) || (clock.duringTick ? 1 : 0));

				clock.timers[timer.id] = timer;

				if (addTimerReturnsObject) {
					const res = {
						refed: true,
						ref: function () {
							this.refed = true;
							return res;
						},
						unref: function () {
							this.refed = false;
							return res;
						},
						hasRef: function () {
							return this.refed;
						},
						refresh: function () {
							timer.callAt =
								clock.now +
								(parseInt(timer.delay) || (clock.duringTick ? 1 : 0));

							// it _might_ have been removed, but if not the assignment is perfectly fine
							clock.timers[timer.id] = timer;

							return res;
						},
						[Symbol.toPrimitive]: function () {
							return timer.id;
						},
					};
					return res;
				}

				return timer.id;
			}

			/* eslint consistent-return: "off" */
			/**
			 * Timer comparitor
			 * @param {Timer} a
			 * @param {Timer} b
			 * @returns {number}
			 */
			function compareTimers(a, b) {
				// Sort first by absolute timing
				if (a.callAt < b.callAt) {
					return -1;
				}
				if (a.callAt > b.callAt) {
					return 1;
				}

				// Sort next by immediate, immediate timers take precedence
				if (a.immediate && !b.immediate) {
					return -1;
				}
				if (!a.immediate && b.immediate) {
					return 1;
				}

				// Sort next by creation time, earlier-created timers take precedence
				if (a.createdAt < b.createdAt) {
					return -1;
				}
				if (a.createdAt > b.createdAt) {
					return 1;
				}

				// Sort next by id, lower-id timers take precedence
				if (a.id < b.id) {
					return -1;
				}
				if (a.id > b.id) {
					return 1;
				}

				// As timer ids are unique, no fallback `0` is necessary
			}

			/**
			 * @param {Clock} clock
			 * @param {number} from
			 * @param {number} to
			 * @returns {Timer}
			 */
			function firstTimerInRange(clock, from, to) {
				const timers = clock.timers;
				let timer = null;
				let id, isInRange;

				for (id in timers) {
					if (timers.hasOwnProperty(id)) {
						isInRange = inRange(from, to, timers[id]);

						if (
							isInRange &&
							(!timer || compareTimers(timer, timers[id]) === 1)
						) {
							timer = timers[id];
						}
					}
				}

				return timer;
			}

			/**
			 * @param {Clock} clock
			 * @returns {Timer}
			 */
			function firstTimer(clock) {
				const timers = clock.timers;
				let timer = null;
				let id;

				for (id in timers) {
					if (timers.hasOwnProperty(id)) {
						if (!timer || compareTimers(timer, timers[id]) === 1) {
							timer = timers[id];
						}
					}
				}

				return timer;
			}

			/**
			 * @param {Clock} clock
			 * @returns {Timer}
			 */
			function lastTimer(clock) {
				const timers = clock.timers;
				let timer = null;
				let id;

				for (id in timers) {
					if (timers.hasOwnProperty(id)) {
						if (!timer || compareTimers(timer, timers[id]) === -1) {
							timer = timers[id];
						}
					}
				}

				return timer;
			}

			/**
			 * @param {Clock} clock
			 * @param {Timer} timer
			 */
			function callTimer(clock, timer) {
				if (typeof timer.interval === "number") {
					clock.timers[timer.id].callAt += timer.interval;
				} else {
					delete clock.timers[timer.id];
				}

				if (typeof timer.func === "function") {
					timer.func.apply(null, timer.args);
				} else {
					/* eslint no-eval: "off" */
					const eval2 = eval;
					(function () {
						eval2(timer.func);
					})();
				}
			}

			/**
			 * Gets clear handler name for a given timer type
			 * @param {string} ttype
			 */
			function getClearHandler(ttype) {
				if (ttype === "IdleCallback" || ttype === "AnimationFrame") {
					return `cancel${ttype}`;
				}
				return `clear${ttype}`;
			}

			/**
			 * Gets schedule handler name for a given timer type
			 * @param {string} ttype
			 */
			function getScheduleHandler(ttype) {
				if (ttype === "IdleCallback" || ttype === "AnimationFrame") {
					return `request${ttype}`;
				}
				return `set${ttype}`;
			}

			/**
			 * Creates an anonymous function to warn only once
			 */
			function createWarnOnce() {
				let calls = 0;
				return function (msg) {
					// eslint-disable-next-line
					!calls++ && console.warn(msg);
				};
			}
			const warnOnce = createWarnOnce();

			/**
			 * @param {Clock} clock
			 * @param {number} timerId
			 * @param {string} ttype
			 */
			function clearTimer(clock, timerId, ttype) {
				if (!timerId) {
					// null appears to be allowed in most browsers, and appears to be
					// relied upon by some libraries, like Bootstrap carousel
					return;
				}

				if (!clock.timers) {
					clock.timers = {};
				}

				// in Node, the ID is stored as the primitive value for `Timeout` objects
				// for `Immediate` objects, no ID exists, so it gets coerced to NaN
				const id = Number(timerId);

				if (Number.isNaN(id) || id < idCounterStart) {
					const handlerName = getClearHandler(ttype);

					if (clock.shouldClearNativeTimers === true) {
						const nativeHandler = clock[`_${handlerName}`];
						return typeof nativeHandler === "function"
							? nativeHandler(timerId)
							: undefined;
					}

					// Include the stacktrace, excluding the 'error' line
					const stackTrace = new Error().stack
						.split("\n")
						.slice(1)
						.join("\n");

					warnOnce(
						`FakeTimers: ${handlerName} was invoked to clear a native timer instead of one created by this library.` +
						"\nTo automatically clean-up native timers, use `shouldClearNativeTimers`." +
						`\n${stackTrace}`,
					);
				}

				if (clock.timers.hasOwnProperty(id)) {
					// check that the ID matches a timer of the correct type
					const timer = clock.timers[id];
					if (
						timer.type === ttype ||
						(timer.type === "Timeout" && ttype === "Interval") ||
						(timer.type === "Interval" && ttype === "Timeout")
					) {
						delete clock.timers[id];
					} else {
						const clear = getClearHandler(ttype);
						const schedule = getScheduleHandler(timer.type);
						throw new Error(
							`Cannot clear timer: timer created with ${schedule}() but cleared with ${clear}()`,
						);
					}
				}
			}

			/**
			 * @param {Clock} clock
			 * @returns {Timer[]}
			 */
			function uninstall(clock) {
				let method, i, l;
				const installedHrTime = "_hrtime";
				const installedNextTick = "_nextTick";

				for (i = 0, l = clock.methods.length; i < l; i++) {
					method = clock.methods[i];
					if (method === "hrtime" && _global.process) {
						_global.process.hrtime = clock[installedHrTime];
					} else if (method === "nextTick" && _global.process) {
						_global.process.nextTick = clock[installedNextTick];
					} else if (method === "performance") {
						const originalPerfDescriptor = Object.getOwnPropertyDescriptor(
							clock,
							`_${method}`,
						);
						if (
							originalPerfDescriptor &&
							originalPerfDescriptor.get &&
							!originalPerfDescriptor.set
						) {
							Object.defineProperty(
								_global,
								method,
								originalPerfDescriptor,
							);
						} else if (originalPerfDescriptor.configurable) {
							_global[method] = clock[`_${method}`];
						}
					} else {
						if (_global[method] && _global[method].hadOwnProperty) {
							_global[method] = clock[`_${method}`];
						} else {
							try {
								delete _global[method];
							} catch (ignore) {
								/* eslint no-empty: "off" */
							}
						}
					}
					if (clock.timersModuleMethods !== undefined) {
						for (let j = 0; j < clock.timersModuleMethods.length; j++) {
							const entry = clock.timersModuleMethods[j];
							timersModule[entry.methodName] = entry.original;
						}
					}
					if (clock.timersPromisesModuleMethods !== undefined) {
						for (
							let j = 0;
							j < clock.timersPromisesModuleMethods.length;
							j++
						) {
							const entry = clock.timersPromisesModuleMethods[j];
							timersPromisesModule[entry.methodName] = entry.original;
						}
					}
				}

				clock.setTickMode("manual");

				// Prevent multiple executions which will completely remove these props
				clock.methods = [];

				for (const [listener, signal] of clock.abortListenerMap.entries()) {
					signal.removeEventListener("abort", listener);
					clock.abortListenerMap.delete(listener);
				}

				// return pending timers, to enable checking what timers remained on uninstall
				if (!clock.timers) {
					return [];
				}
				return Object.keys(clock.timers).map(function mapper(key) {
					return clock.timers[key];
				});
			}

			/**
			 * @param {object} target the target containing the method to replace
			 * @param {string} method the keyname of the method on the target
			 * @param {Clock} clock
			 */
			function hijackMethod(target, method, clock) {
				clock[method].hadOwnProperty = Object.prototype.hasOwnProperty.call(
					target,
					method,
				);
				clock[`_${method}`] = target[method];

				if (method === "Date") {
					target[method] = clock[method];
				} else if (method === "Intl") {
					target[method] = clock[method];
				} else if (method === "performance") {
					const originalPerfDescriptor = Object.getOwnPropertyDescriptor(
						target,
						method,
					);
					// JSDOM has a read only performance field so we have to save/copy it differently
					if (
						originalPerfDescriptor &&
						originalPerfDescriptor.get &&
						!originalPerfDescriptor.set
					) {
						Object.defineProperty(
							clock,
							`_${method}`,
							originalPerfDescriptor,
						);

						const perfDescriptor = Object.getOwnPropertyDescriptor(
							clock,
							method,
						);
						Object.defineProperty(target, method, perfDescriptor);
					} else {
						target[method] = clock[method];
					}
				} else {
					target[method] = function () {
						return clock[method].apply(clock, arguments);
					};

					Object.defineProperties(
						target[method],
						Object.getOwnPropertyDescriptors(clock[method]),
					);
				}

				target[method].clock = clock;
			}

			/**
			 * @param {Clock} clock
			 * @param {number} advanceTimeDelta
			 */
			function doIntervalTick(clock, advanceTimeDelta) {
				clock.tick(advanceTimeDelta);
			}

			/**
			 * @typedef {object} Timers
			 * @property {setTimeout} setTimeout
			 * @property {clearTimeout} clearTimeout
			 * @property {setInterval} setInterval
			 * @property {clearInterval} clearInterval
			 * @property {Date} Date
			 * @property {Intl} Intl
			 * @property {SetImmediate=} setImmediate
			 * @property {function(NodeImmediate): void=} clearImmediate
			 * @property {function(number[]):number[]=} hrtime
			 * @property {NextTick=} nextTick
			 * @property {Performance=} performance
			 * @property {RequestAnimationFrame=} requestAnimationFrame
			 * @property {boolean=} queueMicrotask
			 * @property {function(number): void=} cancelAnimationFrame
			 * @property {RequestIdleCallback=} requestIdleCallback
			 * @property {function(number): void=} cancelIdleCallback
			 */

			/** @type {Timers} */
			const timers = {
				setTimeout: _global.setTimeout,
				clearTimeout: _global.clearTimeout,
				setInterval: _global.setInterval,
				clearInterval: _global.clearInterval,
				Date: _global.Date,
			};

			if (isPresent.setImmediate) {
				timers.setImmediate = _global.setImmediate;
			}

			if (isPresent.clearImmediate) {
				timers.clearImmediate = _global.clearImmediate;
			}

			if (isPresent.hrtime) {
				timers.hrtime = _global.process.hrtime;
			}

			if (isPresent.nextTick) {
				timers.nextTick = _global.process.nextTick;
			}

			if (isPresent.performance) {
				timers.performance = _global.performance;
			}

			if (isPresent.requestAnimationFrame) {
				timers.requestAnimationFrame = _global.requestAnimationFrame;
			}

			if (isPresent.queueMicrotask) {
				timers.queueMicrotask = _global.queueMicrotask;
			}

			if (isPresent.cancelAnimationFrame) {
				timers.cancelAnimationFrame = _global.cancelAnimationFrame;
			}

			if (isPresent.requestIdleCallback) {
				timers.requestIdleCallback = _global.requestIdleCallback;
			}

			if (isPresent.cancelIdleCallback) {
				timers.cancelIdleCallback = _global.cancelIdleCallback;
			}

			if (isPresent.Intl) {
				timers.Intl = NativeIntl;
			}

			const originalSetTimeout = _global.setImmediate || _global.setTimeout;
			const originalClearInterval = _global.clearInterval;
			const originalSetInterval = _global.setInterval;

			/**
			 * @param {Date|number} [start] the system time - non-integer values are floored
			 * @param {number} [loopLimit] maximum number of timers that will be run when calling runAll()
			 * @returns {Clock}
			 */
			function createClock(start, loopLimit) {
				// eslint-disable-next-line no-param-reassign
				start = Math.floor(getEpoch(start));
				// eslint-disable-next-line no-param-reassign
				loopLimit = loopLimit || 1000;
				let nanos = 0;
				const adjustedSystemTime = [0, 0]; // [millis, nanoremainder]

				const clock = {
					now: start,
					Date: createDate(),
					loopLimit: loopLimit,
					tickMode: { mode: "manual", counter: 0, delta: undefined },
				};

				clock.Date.clock = clock;

				//eslint-disable-next-line jsdoc/require-jsdoc
				function getTimeToNextFrame() {
					return 16 - ((clock.now - start) % 16);
				}

				//eslint-disable-next-line jsdoc/require-jsdoc
				function hrtime(prev) {
					const millisSinceStart = clock.now - adjustedSystemTime[0] - start;
					const secsSinceStart = Math.floor(millisSinceStart / 1000);
					const remainderInNanos =
						(millisSinceStart - secsSinceStart * 1e3) * 1e6 +
						nanos -
						adjustedSystemTime[1];

					if (Array.isArray(prev)) {
						if (prev[1] > 1e9) {
							throw new TypeError(
								"Number of nanoseconds can't exceed a billion",
							);
						}

						const oldSecs = prev[0];
						let nanoDiff = remainderInNanos - prev[1];
						let secDiff = secsSinceStart - oldSecs;

						if (nanoDiff < 0) {
							nanoDiff += 1e9;
							secDiff -= 1;
						}

						return [secDiff, nanoDiff];
					}
					return [secsSinceStart, remainderInNanos];
				}

				/**
				 * A high resolution timestamp in milliseconds.
				 * @typedef {number} DOMHighResTimeStamp
				 */

				/**
				 * performance.now()
				 * @returns {DOMHighResTimeStamp}
				 */
				function fakePerformanceNow() {
					const hrt = hrtime();
					const millis = hrt[0] * 1000 + hrt[1] / 1e6;
					return millis;
				}

				if (isPresent.hrtimeBigint) {
					hrtime.bigint = function () {
						const parts = hrtime();
						return BigInt(parts[0]) * BigInt(1e9) + BigInt(parts[1]); // eslint-disable-line
					};
				}

				if (isPresent.Intl) {
					clock.Intl = createIntl();
					clock.Intl.clock = clock;
				}

				/**
				 * @param {TimerTickMode} tickModeConfig - The new configuration for how the clock should tick.
				 */
				clock.setTickMode = function (tickModeConfig) {
					const { mode: newMode, delta: newDelta } = tickModeConfig;
					const { mode: oldMode, delta: oldDelta } = clock.tickMode;
					if (newMode === oldMode && newDelta === oldDelta) {
						return;
					}

					if (oldMode === "interval") {
						originalClearInterval(clock.attachedInterval);
					}

					clock.tickMode = {
						counter: clock.tickMode.counter + 1,
						mode: newMode,
						delta: newDelta,
					};

					if (newMode === "nextAsync") {
						advanceUntilModeChanges();
					} else if (newMode === "interval") {
						createIntervalTick(clock, newDelta || 20);
					}
				};

				async function advanceUntilModeChanges() {
					async function newMacrotask() {
						// MessageChannel ensures that setTimeout is not throttled to 4ms.
						// https://developer.mozilla.org/en-US/docs/Web/API/setTimeout#reasons_for_delays_longer_than_specified
						// https://stackblitz.com/edit/stackblitz-starters-qtlpcc
						const channel = new MessageChannel();
						await new Promise((resolve) => {
							channel.port1.onmessage = () => {
								resolve();
								channel.port1.close();
							};
							channel.port2.postMessage(undefined);
						});
						channel.port1.close();
						channel.port2.close();
						// setTimeout ensures microtask queue is emptied
						await new Promise((resolve) => {
							originalSetTimeout(resolve);
						});
					}

					const { counter } = clock.tickMode;
					while (clock.tickMode.counter === counter) {
						await newMacrotask();
						if (clock.tickMode.counter !== counter) {
							return;
						}
						clock.next();
					}
				}

				function pauseAutoTickUntilFinished(promise) {
					if (clock.tickMode.mode !== "nextAsync") {
						return promise;
					}
					clock.setTickMode({ mode: "manual" });
					return promise.finally(() => {
						clock.setTickMode({ mode: "nextAsync" });
					});
				}

				clock.requestIdleCallback = function requestIdleCallback(
					func,
					timeout,
				) {
					let timeToNextIdlePeriod = 0;

					if (clock.countTimers() > 0) {
						timeToNextIdlePeriod = 50; // const for now
					}

					const result = addTimer(clock, {
						func: func,
						args: Array.prototype.slice.call(arguments, 2),
						delay:
							typeof timeout === "undefined"
								? timeToNextIdlePeriod
								: Math.min(timeout, timeToNextIdlePeriod),
						idleCallback: true,
					});

					return Number(result);
				};

				clock.cancelIdleCallback = function cancelIdleCallback(timerId) {
					return clearTimer(clock, timerId, "IdleCallback");
				};

				clock.setTimeout = function setTimeout(func, timeout) {
					return addTimer(clock, {
						func: func,
						args: Array.prototype.slice.call(arguments, 2),
						delay: timeout,
					});
				};
				if (typeof _global.Promise !== "undefined" && utilPromisify) {
					clock.setTimeout[utilPromisify.custom] =
						function promisifiedSetTimeout(timeout, arg) {
							return new _global.Promise(function setTimeoutExecutor(
								resolve,
							) {
								addTimer(clock, {
									func: resolve,
									args: [arg],
									delay: timeout,
								});
							});
						};
				}

				clock.clearTimeout = function clearTimeout(timerId) {
					return clearTimer(clock, timerId, "Timeout");
				};

				clock.nextTick = function nextTick(func) {
					return enqueueJob(clock, {
						func: func,
						args: Array.prototype.slice.call(arguments, 1),
						error: isNearInfiniteLimit ? new Error() : null,
					});
				};

				clock.queueMicrotask = function queueMicrotask(func) {
					return clock.nextTick(func); // explicitly drop additional arguments
				};

				clock.setInterval = function setInterval(func, timeout) {
					// eslint-disable-next-line no-param-reassign
					timeout = parseInt(timeout, 10);
					return addTimer(clock, {
						func: func,
						args: Array.prototype.slice.call(arguments, 2),
						delay: timeout,
						interval: timeout,
					});
				};

				clock.clearInterval = function clearInterval(timerId) {
					return clearTimer(clock, timerId, "Interval");
				};

				if (isPresent.setImmediate) {
					clock.setImmediate = function setImmediate(func) {
						return addTimer(clock, {
							func: func,
							args: Array.prototype.slice.call(arguments, 1),
							immediate: true,
						});
					};

					if (typeof _global.Promise !== "undefined" && utilPromisify) {
						clock.setImmediate[utilPromisify.custom] =
							function promisifiedSetImmediate(arg) {
								return new _global.Promise(
									function setImmediateExecutor(resolve) {
										addTimer(clock, {
											func: resolve,
											args: [arg],
											immediate: true,
										});
									},
								);
							};
					}

					clock.clearImmediate = function clearImmediate(timerId) {
						return clearTimer(clock, timerId, "Immediate");
					};
				}

				clock.countTimers = function countTimers() {
					return (
						Object.keys(clock.timers || {}).length +
						(clock.jobs || []).length
					);
				};

				clock.requestAnimationFrame = function requestAnimationFrame(func) {
					const result = addTimer(clock, {
						func: func,
						delay: getTimeToNextFrame(),
						get args() {
							return [fakePerformanceNow()];
						},
						animation: true,
					});

					return Number(result);
				};

				clock.cancelAnimationFrame = function cancelAnimationFrame(timerId) {
					return clearTimer(clock, timerId, "AnimationFrame");
				};

				clock.runMicrotasks = function runMicrotasks() {
					runJobs(clock);
				};

				/**
				 * @param {number|string} tickValue milliseconds or a string parseable by parseTime
				 * @param {boolean} isAsync
				 * @param {Function} resolve
				 * @param {Function} reject
				 * @returns {number|undefined} will return the new `now` value or nothing for async
				 */
				function doTick(tickValue, isAsync, resolve, reject) {
					const msFloat =
						typeof tickValue === "number"
							? tickValue
							: parseTime(tickValue);
					const ms = Math.floor(msFloat);
					const remainder = nanoRemainder(msFloat);
					let nanosTotal = nanos + remainder;
					let tickTo = clock.now + ms;

					if (msFloat < 0) {
						throw new TypeError("Negative ticks are not supported");
					}

					// adjust for positive overflow
					if (nanosTotal >= 1e6) {
						tickTo += 1;
						nanosTotal -= 1e6;
					}

					nanos = nanosTotal;
					let tickFrom = clock.now;
					let previous = clock.now;
					// ESLint fails to detect this correctly
					/* eslint-disable prefer-const */
					let timer,
						firstException,
						oldNow,
						nextPromiseTick,
						compensationCheck,
						postTimerCall;
					/* eslint-enable prefer-const */

					clock.duringTick = true;

					// perform microtasks
					oldNow = clock.now;
					runJobs(clock);
					if (oldNow !== clock.now) {
						// compensate for any setSystemTime() call during microtask callback
						tickFrom += clock.now - oldNow;
						tickTo += clock.now - oldNow;
					}

					//eslint-disable-next-line jsdoc/require-jsdoc
					function doTickInner() {
						// perform each timer in the requested range
						timer = firstTimerInRange(clock, tickFrom, tickTo);
						// eslint-disable-next-line no-unmodified-loop-condition
						while (timer && tickFrom <= tickTo) {
							if (clock.timers[timer.id]) {
								tickFrom = timer.callAt;
								clock.now = timer.callAt;
								oldNow = clock.now;
								try {
									runJobs(clock);
									callTimer(clock, timer);
								} catch (e) {
									firstException = firstException || e;
								}

								if (isAsync) {
									// finish up after native setImmediate callback to allow
									// all native es6 promises to process their callbacks after
									// each timer fires.
									originalSetTimeout(nextPromiseTick);
									return;
								}

								compensationCheck();
							}

							postTimerCall();
						}

						// perform process.nextTick()s again
						oldNow = clock.now;
						runJobs(clock);
						if (oldNow !== clock.now) {
							// compensate for any setSystemTime() call during process.nextTick() callback
							tickFrom += clock.now - oldNow;
							tickTo += clock.now - oldNow;
						}
						clock.duringTick = false;

						// corner case: during runJobs new timers were scheduled which could be in the range [clock.now, tickTo]
						timer = firstTimerInRange(clock, tickFrom, tickTo);
						if (timer) {
							try {
								clock.tick(tickTo - clock.now); // do it all again - for the remainder of the requested range
							} catch (e) {
								firstException = firstException || e;
							}
						} else {
							// no timers remaining in the requested range: move the clock all the way to the end
							clock.now = tickTo;

							// update nanos
							nanos = nanosTotal;
						}
						if (firstException) {
							throw firstException;
						}

						if (isAsync) {
							resolve(clock.now);
						} else {
							return clock.now;
						}
					}

					nextPromiseTick =
						isAsync &&
						function () {
							try {
								compensationCheck();
								postTimerCall();
								doTickInner();
							} catch (e) {
								reject(e);
							}
						};

					compensationCheck = function () {
						// compensate for any setSystemTime() call during timer callback
						if (oldNow !== clock.now) {
							tickFrom += clock.now - oldNow;
							tickTo += clock.now - oldNow;
							previous += clock.now - oldNow;
						}
					};

					postTimerCall = function () {
						timer = firstTimerInRange(clock, previous, tickTo);
						previous = tickFrom;
					};

					return doTickInner();
				}

				/**
				 * @param {string|number} tickValue number of milliseconds or a human-readable value like "01:11:15"
				 * @returns {number} will return the new `now` value
				 */
				clock.tick = function tick(tickValue) {
					return doTick(tickValue, false);
				};

				if (typeof _global.Promise !== "undefined") {
					/**
					 * @param {string|number} tickValue number of milliseconds or a human-readable value like "01:11:15"
					 * @returns {Promise}
					 */
					clock.tickAsync = function tickAsync(tickValue) {
						return pauseAutoTickUntilFinished(
							new _global.Promise(function (resolve, reject) {
								originalSetTimeout(function () {
									try {
										doTick(tickValue, true, resolve, reject);
									} catch (e) {
										reject(e);
									}
								});
							}),
						);
					};
				}

				clock.next = function next() {
					runJobs(clock);
					const timer = firstTimer(clock);
					if (!timer) {
						return clock.now;
					}

					clock.duringTick = true;
					try {
						clock.now = timer.callAt;
						callTimer(clock, timer);
						runJobs(clock);
						return clock.now;
					} finally {
						clock.duringTick = false;
					}
				};

				if (typeof _global.Promise !== "undefined") {
					clock.nextAsync = function nextAsync() {
						return pauseAutoTickUntilFinished(
							new _global.Promise(function (resolve, reject) {
								originalSetTimeout(function () {
									try {
										const timer = firstTimer(clock);
										if (!timer) {
											resolve(clock.now);
											return;
										}

										let err;
										clock.duringTick = true;
										clock.now = timer.callAt;
										try {
											callTimer(clock, timer);
										} catch (e) {
											err = e;
										}
										clock.duringTick = false;

										originalSetTimeout(function () {
											if (err) {
												reject(err);
											} else {
												resolve(clock.now);
											}
										});
									} catch (e) {
										reject(e);
									}
								});
							}),
						);
					};
				}

				clock.runAll = function runAll() {
					let numTimers, i;
					runJobs(clock);
					for (i = 0; i < clock.loopLimit; i++) {
						if (!clock.timers) {
							resetIsNearInfiniteLimit();
							return clock.now;
						}

						numTimers = Object.keys(clock.timers).length;
						if (numTimers === 0) {
							resetIsNearInfiniteLimit();
							return clock.now;
						}

						clock.next();
						checkIsNearInfiniteLimit(clock, i);
					}

					const excessJob = firstTimer(clock);
					throw getInfiniteLoopError(clock, excessJob);
				};

				clock.runToFrame = function runToFrame() {
					return clock.tick(getTimeToNextFrame());
				};

				if (typeof _global.Promise !== "undefined") {
					clock.runAllAsync = function runAllAsync() {
						return pauseAutoTickUntilFinished(
							new _global.Promise(function (resolve, reject) {
								let i = 0;
								/**
								 *
								 */
								function doRun() {
									originalSetTimeout(function () {
										try {
											runJobs(clock);

											let numTimers;
											if (i < clock.loopLimit) {
												if (!clock.timers) {
													resetIsNearInfiniteLimit();
													resolve(clock.now);
													return;
												}

												numTimers = Object.keys(
													clock.timers,
												).length;
												if (numTimers === 0) {
													resetIsNearInfiniteLimit();
													resolve(clock.now);
													return;
												}

												clock.next();

												i++;

												doRun();
												checkIsNearInfiniteLimit(clock, i);
												return;
											}

											const excessJob = firstTimer(clock);
											reject(
												getInfiniteLoopError(clock, excessJob),
											);
										} catch (e) {
											reject(e);
										}
									});
								}
								doRun();
							}),
						);
					};
				}

				clock.runToLast = function runToLast() {
					const timer = lastTimer(clock);
					if (!timer) {
						runJobs(clock);
						return clock.now;
					}

					return clock.tick(timer.callAt - clock.now);
				};

				if (typeof _global.Promise !== "undefined") {
					clock.runToLastAsync = function runToLastAsync() {
						return pauseAutoTickUntilFinished(
							new _global.Promise(function (resolve, reject) {
								originalSetTimeout(function () {
									try {
										const timer = lastTimer(clock);
										if (!timer) {
											runJobs(clock);
											resolve(clock.now);
										}

										resolve(
											clock.tickAsync(timer.callAt - clock.now),
										);
									} catch (e) {
										reject(e);
									}
								});
							}),
						);
					};
				}

				clock.reset = function reset() {
					nanos = 0;
					clock.timers = {};
					clock.jobs = [];
					clock.now = start;
				};

				clock.setSystemTime = function setSystemTime(systemTime) {
					// determine time difference
					const newNow = getEpoch(systemTime);
					const difference = newNow - clock.now;
					let id, timer;

					adjustedSystemTime[0] = adjustedSystemTime[0] + difference;
					adjustedSystemTime[1] = adjustedSystemTime[1] + nanos;
					// update 'system clock'
					clock.now = newNow;
					nanos = 0;

					// update timers and intervals to keep them stable
					for (id in clock.timers) {
						if (clock.timers.hasOwnProperty(id)) {
							timer = clock.timers[id];
							timer.createdAt += difference;
							timer.callAt += difference;
						}
					}
				};

				/**
				 * @param {string|number} tickValue number of milliseconds or a human-readable value like "01:11:15"
				 * @returns {number} will return the new `now` value
				 */
				clock.jump = function jump(tickValue) {
					const msFloat =
						typeof tickValue === "number"
							? tickValue
							: parseTime(tickValue);
					const ms = Math.floor(msFloat);

					for (const timer of Object.values(clock.timers)) {
						if (clock.now + ms > timer.callAt) {
							timer.callAt = clock.now + ms;
						}
					}
					clock.tick(ms);
				};

				if (isPresent.performance) {
					clock.performance = Object.create(null);
					clock.performance.now = fakePerformanceNow;
				}

				if (isPresent.hrtime) {
					clock.hrtime = hrtime;
				}

				return clock;
			}

			function createIntervalTick(clock, delta) {
				const intervalTick = doIntervalTick.bind(null, clock, delta);
				const intervalId = originalSetInterval(intervalTick, delta);
				clock.attachedInterval = intervalId;
			}

			/* eslint-disable complexity */

			/**
			 * @param {Config=} [config] Optional config
			 * @returns {Clock}
			 */
			function install(config) {
				if (
					arguments.length > 1 ||
					config instanceof Date ||
					Array.isArray(config) ||
					typeof config === "number"
				) {
					throw new TypeError(
						`FakeTimers.install called with ${String(
							config,
						)} install requires an object parameter`,
					);
				}

				if (_global.Date.isFake === true) {
					// Timers are already faked; this is a problem.
					// Make the user reset timers before continuing.
					throw new TypeError(
						"Can't install fake timers twice on the same global object.",
					);
				}

				// eslint-disable-next-line no-param-reassign
				config = typeof config !== "undefined" ? config : {};
				config.shouldAdvanceTime = config.shouldAdvanceTime || false;
				config.advanceTimeDelta = config.advanceTimeDelta || 20;
				config.shouldClearNativeTimers =
					config.shouldClearNativeTimers || false;

				if (config.target) {
					throw new TypeError(
						"config.target is no longer supported. Use `withGlobal(target)` instead.",
					);
				}

				/**
				 * @param {string} timer/object the name of the thing that is not present
				 * @param timer
				 */
				function handleMissingTimer(timer) {
					if (config.ignoreMissingTimers) {
						return;
					}

					throw new ReferenceError(
						`non-existent timers and/or objects cannot be faked: '${timer}'`,
					);
				}

				let i, l;
				const clock = createClock(config.now, config.loopLimit);
				clock.shouldClearNativeTimers = config.shouldClearNativeTimers;

				clock.uninstall = function () {
					return uninstall(clock);
				};

				clock.abortListenerMap = new Map();

				clock.methods = config.toFake || [];

				if (clock.methods.length === 0) {
					clock.methods = Object.keys(timers);
				}

				if (config.shouldAdvanceTime === true) {
					clock.setTickMode({
						mode: "interval",
						delta: config.advanceTimeDelta,
					});
				}

				if (clock.methods.includes("performance")) {
					const proto = (() => {
						if (hasPerformanceConstructorPrototype) {
							return _global.performance.constructor.prototype;
						}
						if (hasPerformancePrototype) {
							return _global.Performance.prototype;
						}
					})();
					if (proto) {
						Object.getOwnPropertyNames(proto).forEach(function (name) {
							if (name !== "now") {
								clock.performance[name] =
									name.indexOf("getEntries") === 0
										? NOOP_ARRAY
										: NOOP;
							}
						});
						// ensure `mark` returns a value that is valid
						clock.performance.mark = (name) =>
							new FakePerformanceEntry(name, "mark", 0, 0);
						clock.performance.measure = (name) =>
							new FakePerformanceEntry(name, "measure", 0, 100);
						// `timeOrigin` should return the time of when the Window session started
						// (or the Worker was installed)
						clock.performance.timeOrigin = getEpoch(config.now);
					} else if ((config.toFake || []).includes("performance")) {
						return handleMissingTimer("performance");
					}
				}
				if (_global === globalObject && timersModule) {
					clock.timersModuleMethods = [];
				}
				if (_global === globalObject && timersPromisesModule) {
					clock.timersPromisesModuleMethods = [];
				}
				for (i = 0, l = clock.methods.length; i < l; i++) {
					const nameOfMethodToReplace = clock.methods[i];

					if (!isPresent[nameOfMethodToReplace]) {
						handleMissingTimer(nameOfMethodToReplace);
						// eslint-disable-next-line
						continue;
					}

					if (nameOfMethodToReplace === "hrtime") {
						if (
							_global.process &&
							typeof _global.process.hrtime === "function"
						) {
							hijackMethod(_global.process, nameOfMethodToReplace, clock);
						}
					} else if (nameOfMethodToReplace === "nextTick") {
						if (
							_global.process &&
							typeof _global.process.nextTick === "function"
						) {
							hijackMethod(_global.process, nameOfMethodToReplace, clock);
						}
					} else {
						hijackMethod(_global, nameOfMethodToReplace, clock);
					}
					if (
						clock.timersModuleMethods !== undefined &&
						timersModule[nameOfMethodToReplace]
					) {
						const original = timersModule[nameOfMethodToReplace];
						clock.timersModuleMethods.push({
							methodName: nameOfMethodToReplace,
							original: original,
						});
						timersModule[nameOfMethodToReplace] =
							_global[nameOfMethodToReplace];
					}
					if (clock.timersPromisesModuleMethods !== undefined) {
						if (nameOfMethodToReplace === "setTimeout") {
							clock.timersPromisesModuleMethods.push({
								methodName: "setTimeout",
								original: timersPromisesModule.setTimeout,
							});

							timersPromisesModule.setTimeout = (
								delay,
								value,
								options = {},
							) =>
								new Promise((resolve, reject) => {
									const abort = () => {
										options.signal.removeEventListener(
											"abort",
											abort,
										);
										clock.abortListenerMap.delete(abort);

										// This is safe, there is no code path that leads to this function
										// being invoked before handle has been assigned.
										// eslint-disable-next-line no-use-before-define
										clock.clearTimeout(handle);
										reject(options.signal.reason);
									};

									const handle = clock.setTimeout(() => {
										if (options.signal) {
											options.signal.removeEventListener(
												"abort",
												abort,
											);
											clock.abortListenerMap.delete(abort);
										}

										resolve(value);
									}, delay);

									if (options.signal) {
										if (options.signal.aborted) {
											abort();
										} else {
											options.signal.addEventListener(
												"abort",
												abort,
											);
											clock.abortListenerMap.set(
												abort,
												options.signal,
											);
										}
									}
								});
						} else if (nameOfMethodToReplace === "setImmediate") {
							clock.timersPromisesModuleMethods.push({
								methodName: "setImmediate",
								original: timersPromisesModule.setImmediate,
							});

							timersPromisesModule.setImmediate = (value, options = {}) =>
								new Promise((resolve, reject) => {
									const abort = () => {
										options.signal.removeEventListener(
											"abort",
											abort,
										);
										clock.abortListenerMap.delete(abort);

										// This is safe, there is no code path that leads to this function
										// being invoked before handle has been assigned.
										// eslint-disable-next-line no-use-before-define
										clock.clearImmediate(handle);
										reject(options.signal.reason);
									};

									const handle = clock.setImmediate(() => {
										if (options.signal) {
											options.signal.removeEventListener(
												"abort",
												abort,
											);
											clock.abortListenerMap.delete(abort);
										}

										resolve(value);
									});

									if (options.signal) {
										if (options.signal.aborted) {
											abort();
										} else {
											options.signal.addEventListener(
												"abort",
												abort,
											);
											clock.abortListenerMap.set(
												abort,
												options.signal,
											);
										}
									}
								});
						} else if (nameOfMethodToReplace === "setInterval") {
							clock.timersPromisesModuleMethods.push({
								methodName: "setInterval",
								original: timersPromisesModule.setInterval,
							});

							timersPromisesModule.setInterval = (
								delay,
								value,
								options = {},
							) => ({
								[Symbol.asyncIterator]: () => {
									const createResolvable = () => {
										let resolve, reject;
										const promise = new Promise((res, rej) => {
											resolve = res;
											reject = rej;
										});
										promise.resolve = resolve;
										promise.reject = reject;
										return promise;
									};

									let done = false;
									let hasThrown = false;
									let returnCall;
									let nextAvailable = 0;
									const nextQueue = [];

									const handle = clock.setInterval(() => {
										if (nextQueue.length > 0) {
											nextQueue.shift().resolve();
										} else {
											nextAvailable++;
										}
									}, delay);

									const abort = () => {
										options.signal.removeEventListener(
											"abort",
											abort,
										);
										clock.abortListenerMap.delete(abort);

										clock.clearInterval(handle);
										done = true;
										for (const resolvable of nextQueue) {
											resolvable.resolve();
										}
									};

									if (options.signal) {
										if (options.signal.aborted) {
											done = true;
										} else {
											options.signal.addEventListener(
												"abort",
												abort,
											);
											clock.abortListenerMap.set(
												abort,
												options.signal,
											);
										}
									}

									return {
										next: async () => {
											if (options.signal?.aborted && !hasThrown) {
												hasThrown = true;
												throw options.signal.reason;
											}

											if (done) {
												return { done: true, value: undefined };
											}

											if (nextAvailable > 0) {
												nextAvailable--;
												return { done: false, value: value };
											}

											const resolvable = createResolvable();
											nextQueue.push(resolvable);

											await resolvable;

											if (returnCall && nextQueue.length === 0) {
												returnCall.resolve();
											}

											if (options.signal?.aborted && !hasThrown) {
												hasThrown = true;
												throw options.signal.reason;
											}

											if (done) {
												return { done: true, value: undefined };
											}

											return { done: false, value: value };
										},
										return: async () => {
											if (done) {
												return { done: true, value: undefined };
											}

											if (nextQueue.length > 0) {
												returnCall = createResolvable();
												await returnCall;
											}

											clock.clearInterval(handle);
											done = true;

											if (options.signal) {
												options.signal.removeEventListener(
													"abort",
													abort,
												);
												clock.abortListenerMap.delete(abort);
											}

											return { done: true, value: undefined };
										},
									};
								},
							});
						}
					}
				}

				return clock;
			}

			/* eslint-enable complexity */

			return {
				timers: timers,
				createClock: createClock,
				install: install,
				withGlobal: withGlobal,
			};
		}

		/**
		 * @typedef {object} FakeTimers
		 * @property {Timers} timers
		 * @property {createClock} createClock
		 * @property {Function} install
		 * @property {withGlobal} withGlobal
		 */

		/* eslint-enable complexity */

		/** @type {FakeTimers} */
		const defaultImplementation = withGlobal(globalObject);

		exports.timers = defaultImplementation.timers;
		exports.createClock = defaultImplementation.createClock;
		exports.install = defaultImplementation.install;
		exports.withGlobal = withGlobal;

	},{"@sinonjs/commons":19,"timers":"timers","timers/promises":"timers/promises","util":35}],33:[function(require,module,exports){
		if (typeof Object.create === 'function') {
			// implementation from standard node.js 'util' module
			module.exports = function inherits(ctor, superCtor) {
				ctor.super_ = superCtor
				ctor.prototype = Object.create(superCtor.prototype, {
					constructor: {
						value: ctor,
						enumerable: false,
						writable: true,
						configurable: true
					}
				});
			};
		} else {
			// old school shim for old browsers
			module.exports = function inherits(ctor, superCtor) {
				ctor.super_ = superCtor
				var TempCtor = function () {}
				TempCtor.prototype = superCtor.prototype
				ctor.prototype = new TempCtor()
				ctor.prototype.constructor = ctor
			}
		}

	},{}],34:[function(require,module,exports){
		module.exports = function isBuffer(arg) {
			return arg && typeof arg === 'object'
				&& typeof arg.copy === 'function'
				&& typeof arg.fill === 'function'
				&& typeof arg.readUInt8 === 'function';
		}
	},{}],35:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

		var formatRegExp = /%[sdj%]/g;
		exports.format = function(f) {
			if (!isString(f)) {
				var objects = [];
				for (var i = 0; i < arguments.length; i++) {
					objects.push(inspect(arguments[i]));
				}
				return objects.join(' ');
			}

			var i = 1;
			var args = arguments;
			var len = args.length;
			var str = String(f).replace(formatRegExp, function(x) {
				if (x === '%%') return '%';
				if (i >= len) return x;
				switch (x) {
					case '%s': return String(args[i++]);
					case '%d': return Number(args[i++]);
					case '%j':
						try {
							return JSON.stringify(args[i++]);
						} catch (_) {
							return '[Circular]';
						}
					default:
						return x;
				}
			});
			for (var x = args[i]; i < len; x = args[++i]) {
				if (isNull(x) || !isObject(x)) {
					str += ' ' + x;
				} else {
					str += ' ' + inspect(x);
				}
			}
			return str;
		};


// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
		exports.deprecate = function(fn, msg) {
			// Allow for deprecating things in the process of starting up.
			if (isUndefined(global.process)) {
				return function() {
					return exports.deprecate(fn, msg).apply(this, arguments);
				};
			}

			if (process.noDeprecation === true) {
				return fn;
			}

			var warned = false;
			function deprecated() {
				if (!warned) {
					if (process.throwDeprecation) {
						throw new Error(msg);
					} else if (process.traceDeprecation) {
						console.trace(msg);
					} else {
						console.error(msg);
					}
					warned = true;
				}
				return fn.apply(this, arguments);
			}

			return deprecated;
		};


		var debugs = {};
		var debugEnviron;
		exports.debuglog = function(set) {
			if (isUndefined(debugEnviron))
				debugEnviron = process.env.NODE_DEBUG || '';
			set = set.toUpperCase();
			if (!debugs[set]) {
				if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
					var pid = process.pid;
					debugs[set] = function() {
						var msg = exports.format.apply(exports, arguments);
						console.error('%s %d: %s', set, pid, msg);
					};
				} else {
					debugs[set] = function() {};
				}
			}
			return debugs[set];
		};


		/**
		 * Echos the value of a value. Trys to print the value out
		 * in the best way possible given the different types.
		 *
		 * @param {Object} obj The object to print out.
		 * @param {Object} opts Optional options object that alters the output.
		 */
		/* legacy: obj, showHidden, depth, colors*/
		function inspect(obj, opts) {
			// default options
			var ctx = {
				seen: [],
				stylize: stylizeNoColor
			};
			// legacy...
			if (arguments.length >= 3) ctx.depth = arguments[2];
			if (arguments.length >= 4) ctx.colors = arguments[3];
			if (isBoolean(opts)) {
				// legacy...
				ctx.showHidden = opts;
			} else if (opts) {
				// got an "options" object
				exports._extend(ctx, opts);
			}
			// set default options
			if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
			if (isUndefined(ctx.depth)) ctx.depth = 2;
			if (isUndefined(ctx.colors)) ctx.colors = false;
			if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
			if (ctx.colors) ctx.stylize = stylizeWithColor;
			return formatValue(ctx, obj, ctx.depth);
		}
		exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
		inspect.colors = {
			'bold' : [1, 22],
			'italic' : [3, 23],
			'underline' : [4, 24],
			'inverse' : [7, 27],
			'white' : [37, 39],
			'grey' : [90, 39],
			'black' : [30, 39],
			'blue' : [34, 39],
			'cyan' : [36, 39],
			'green' : [32, 39],
			'magenta' : [35, 39],
			'red' : [31, 39],
			'yellow' : [33, 39]
		};

// Don't use 'blue' not visible on cmd.exe
		inspect.styles = {
			'special': 'cyan',
			'number': 'yellow',
			'boolean': 'yellow',
			'undefined': 'grey',
			'null': 'bold',
			'string': 'green',
			'date': 'magenta',
			// "name": intentionally not styling
			'regexp': 'red'
		};


		function stylizeWithColor(str, styleType) {
			var style = inspect.styles[styleType];

			if (style) {
				return '\u001b[' + inspect.colors[style][0] + 'm' + str +
					'\u001b[' + inspect.colors[style][1] + 'm';
			} else {
				return str;
			}
		}


		function stylizeNoColor(str, styleType) {
			return str;
		}


		function arrayToHash(array) {
			var hash = {};

			array.forEach(function(val, idx) {
				hash[val] = true;
			});

			return hash;
		}


		function formatValue(ctx, value, recurseTimes) {
			// Provide a hook for user-specified inspect functions.
			// Check that value is an object with an inspect function on it
			if (ctx.customInspect &&
				value &&
				isFunction(value.inspect) &&
				// Filter out the util module, it's inspect function is special
				value.inspect !== exports.inspect &&
				// Also filter out any prototype objects using the circular check.
				!(value.constructor && value.constructor.prototype === value)) {
				var ret = value.inspect(recurseTimes, ctx);
				if (!isString(ret)) {
					ret = formatValue(ctx, ret, recurseTimes);
				}
				return ret;
			}

			// Primitive types cannot have properties
			var primitive = formatPrimitive(ctx, value);
			if (primitive) {
				return primitive;
			}

			// Look up the keys of the object.
			var keys = Object.keys(value);
			var visibleKeys = arrayToHash(keys);

			if (ctx.showHidden) {
				keys = Object.getOwnPropertyNames(value);
			}

			// IE doesn't make error fields non-enumerable
			// http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
			if (isError(value)
				&& (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
				return formatError(value);
			}

			// Some type of object without properties can be shortcutted.
			if (keys.length === 0) {
				if (isFunction(value)) {
					var name = value.name ? ': ' + value.name : '';
					return ctx.stylize('[Function' + name + ']', 'special');
				}
				if (isRegExp(value)) {
					return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
				}
				if (isDate(value)) {
					return ctx.stylize(Date.prototype.toString.call(value), 'date');
				}
				if (isError(value)) {
					return formatError(value);
				}
			}

			var base = '', array = false, braces = ['{', '}'];

			// Make Array say that they are Array
			if (isArray(value)) {
				array = true;
				braces = ['[', ']'];
			}

			// Make functions say that they are functions
			if (isFunction(value)) {
				var n = value.name ? ': ' + value.name : '';
				base = ' [Function' + n + ']';
			}

			// Make RegExps say that they are RegExps
			if (isRegExp(value)) {
				base = ' ' + RegExp.prototype.toString.call(value);
			}

			// Make dates with properties first say the date
			if (isDate(value)) {
				base = ' ' + Date.prototype.toUTCString.call(value);
			}

			// Make error with message first say the error
			if (isError(value)) {
				base = ' ' + formatError(value);
			}

			if (keys.length === 0 && (!array || value.length == 0)) {
				return braces[0] + base + braces[1];
			}

			if (recurseTimes < 0) {
				if (isRegExp(value)) {
					return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
				} else {
					return ctx.stylize('[Object]', 'special');
				}
			}

			ctx.seen.push(value);

			var output;
			if (array) {
				output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
			} else {
				output = keys.map(function(key) {
					return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
				});
			}

			ctx.seen.pop();

			return reduceToSingleString(output, base, braces);
		}


		function formatPrimitive(ctx, value) {
			if (isUndefined(value))
				return ctx.stylize('undefined', 'undefined');
			if (isString(value)) {
				var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
					.replace(/'/g, "\\'")
					.replace(/\\"/g, '"') + '\'';
				return ctx.stylize(simple, 'string');
			}
			if (isNumber(value))
				return ctx.stylize('' + value, 'number');
			if (isBoolean(value))
				return ctx.stylize('' + value, 'boolean');
			// For some reason typeof null is "object", so special case here.
			if (isNull(value))
				return ctx.stylize('null', 'null');
		}


		function formatError(value) {
			return '[' + Error.prototype.toString.call(value) + ']';
		}


		function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
			var output = [];
			for (var i = 0, l = value.length; i < l; ++i) {
				if (hasOwnProperty(value, String(i))) {
					output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
						String(i), true));
				} else {
					output.push('');
				}
			}
			keys.forEach(function(key) {
				if (!key.match(/^\d+$/)) {
					output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
						key, true));
				}
			});
			return output;
		}


		function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
			var name, str, desc;
			desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
			if (desc.get) {
				if (desc.set) {
					str = ctx.stylize('[Getter/Setter]', 'special');
				} else {
					str = ctx.stylize('[Getter]', 'special');
				}
			} else {
				if (desc.set) {
					str = ctx.stylize('[Setter]', 'special');
				}
			}
			if (!hasOwnProperty(visibleKeys, key)) {
				name = '[' + key + ']';
			}
			if (!str) {
				if (ctx.seen.indexOf(desc.value) < 0) {
					if (isNull(recurseTimes)) {
						str = formatValue(ctx, desc.value, null);
					} else {
						str = formatValue(ctx, desc.value, recurseTimes - 1);
					}
					if (str.indexOf('\n') > -1) {
						if (array) {
							str = str.split('\n').map(function(line) {
								return '  ' + line;
							}).join('\n').substr(2);
						} else {
							str = '\n' + str.split('\n').map(function(line) {
								return '   ' + line;
							}).join('\n');
						}
					}
				} else {
					str = ctx.stylize('[Circular]', 'special');
				}
			}
			if (isUndefined(name)) {
				if (array && key.match(/^\d+$/)) {
					return str;
				}
				name = JSON.stringify('' + key);
				if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
					name = name.substr(1, name.length - 2);
					name = ctx.stylize(name, 'name');
				} else {
					name = name.replace(/'/g, "\\'")
						.replace(/\\"/g, '"')
						.replace(/(^"|"$)/g, "'");
					name = ctx.stylize(name, 'string');
				}
			}

			return name + ': ' + str;
		}


		function reduceToSingleString(output, base, braces) {
			var numLinesEst = 0;
			var length = output.reduce(function(prev, cur) {
				numLinesEst++;
				if (cur.indexOf('\n') >= 0) numLinesEst++;
				return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
			}, 0);

			if (length > 60) {
				return braces[0] +
					(base === '' ? '' : base + '\n ') +
					' ' +
					output.join(',\n  ') +
					' ' +
					braces[1];
			}

			return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
		}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
		function isArray(ar) {
			return Array.isArray(ar);
		}
		exports.isArray = isArray;

		function isBoolean(arg) {
			return typeof arg === 'boolean';
		}
		exports.isBoolean = isBoolean;

		function isNull(arg) {
			return arg === null;
		}
		exports.isNull = isNull;

		function isNullOrUndefined(arg) {
			return arg == null;
		}
		exports.isNullOrUndefined = isNullOrUndefined;

		function isNumber(arg) {
			return typeof arg === 'number';
		}
		exports.isNumber = isNumber;

		function isString(arg) {
			return typeof arg === 'string';
		}
		exports.isString = isString;

		function isSymbol(arg) {
			return typeof arg === 'symbol';
		}
		exports.isSymbol = isSymbol;

		function isUndefined(arg) {
			return arg === void 0;
		}
		exports.isUndefined = isUndefined;

		function isRegExp(re) {
			return isObject(re) && objectToString(re) === '[object RegExp]';
		}
		exports.isRegExp = isRegExp;

		function isObject(arg) {
			return typeof arg === 'object' && arg !== null;
		}
		exports.isObject = isObject;

		function isDate(d) {
			return isObject(d) && objectToString(d) === '[object Date]';
		}
		exports.isDate = isDate;

		function isError(e) {
			return isObject(e) &&
				(objectToString(e) === '[object Error]' || e instanceof Error);
		}
		exports.isError = isError;

		function isFunction(arg) {
			return typeof arg === 'function';
		}
		exports.isFunction = isFunction;

		function isPrimitive(arg) {
			return arg === null ||
				typeof arg === 'boolean' ||
				typeof arg === 'number' ||
				typeof arg === 'string' ||
				typeof arg === 'symbol' ||  // ES6 symbol
				typeof arg === 'undefined';
		}
		exports.isPrimitive = isPrimitive;

		exports.isBuffer = require('./support/isBuffer');

		function objectToString(o) {
			return Object.prototype.toString.call(o);
		}


		function pad(n) {
			return n < 10 ? '0' + n.toString(10) : n.toString(10);
		}


		var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
			'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
		function timestamp() {
			var d = new Date();
			var time = [pad(d.getHours()),
				pad(d.getMinutes()),
				pad(d.getSeconds())].join(':');
			return [d.getDate(), months[d.getMonth()], time].join(' ');
		}


// log is just a thin wrapper to console.log that prepends a timestamp
		exports.log = function() {
			console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
		};


		/**
		 * Inherit the prototype methods from one constructor into another.
		 *
		 * The Function.prototype.inherits from lang.js rewritten as a standalone
		 * function (not on Function.prototype). NOTE: If this file is to be loaded
		 * during bootstrapping this function needs to be rewritten using some native
		 * functions as prototype setup using normal JavaScript does not work as
		 * expected during bootstrapping (see mirror.js in r114903).
		 *
		 * @param {function} ctor Constructor function which needs to inherit the
		 *     prototype.
		 * @param {function} superCtor Constructor function to inherit prototype from.
		 */
		exports.inherits = require('inherits');

		exports._extend = function(origin, add) {
			// Don't do anything if add isn't an object
			if (!add || !isObject(add)) return origin;

			var keys = Object.keys(add);
			var i = keys.length;
			while (i--) {
				origin[keys[i]] = add[keys[i]];
			}
			return origin;
		};

		function hasOwnProperty(obj, prop) {
			return Object.prototype.hasOwnProperty.call(obj, prop);
		}

	},{"./support/isBuffer":34,"inherits":33}],36:[function(require,module,exports){
		module.exports = extend;

		/*
  var obj = {a: 3, b: 5};
  extend(obj, {a: 4, c: 8}); // {a: 4, b: 5, c: 8}
  obj; // {a: 4, b: 5, c: 8}

  var obj = {a: 3, b: 5};
  extend({}, obj, {a: 4, c: 8}); // {a: 4, b: 5, c: 8}
  obj; // {a: 3, b: 5}

  var arr = [1, 2, 3];
  var obj = {a: 3, b: 5};
  extend(obj, {c: arr}); // {a: 3, b: 5, c: [1, 2, 3]}
  arr.push(4);
  obj; // {a: 3, b: 5, c: [1, 2, 3, 4]}

  var arr = [1, 2, 3];
  var obj = {a: 3, b: 5};
  extend(true, obj, {c: arr}); // {a: 3, b: 5, c: [1, 2, 3]}
  arr.push(4);
  obj; // {a: 3, b: 5, c: [1, 2, 3]}

  extend({a: 4, b: 5}); // {a: 4, b: 5}
  extend({a: 4, b: 5}, 3); {a: 4, b: 5}
  extend({a: 4, b: 5}, true); {a: 4, b: 5}
  extend('hello', {a: 4, b: 5}); // throws
  extend(3, {a: 4, b: 5}); // throws
*/

		function extend(/* [deep], obj1, obj2, [objn] */) {
			var args = [].slice.call(arguments);
			var deep = false;
			if (typeof args[0] == 'boolean') {
				deep = args.shift();
			}
			var result = args[0];
			if (isUnextendable(result)) {
				throw new Error('extendee must be an object');
			}
			var extenders = args.slice(1);
			var len = extenders.length;
			for (var i = 0; i < len; i++) {
				var extender = extenders[i];
				for (var key in extender) {
					if (Object.prototype.hasOwnProperty.call(extender, key)) {
						var value = extender[key];
						if (deep && isCloneable(value)) {
							var base = Array.isArray(value) ? [] : {};
							result[key] = extend(
								true,
								Object.prototype.hasOwnProperty.call(result, key) && !isUnextendable(result[key])
									? result[key]
									: base,
								value
							);
						} else {
							result[key] = value;
						}
					}
				}
			}
			return result;
		}

		function isCloneable(obj) {
			return Array.isArray(obj) || {}.toString.call(obj) == '[object Object]';
		}

		function isUnextendable(val) {
			return !val || (typeof val != 'object' && typeof val != 'function');
		}

	},{}],37:[function(require,module,exports){
		"use strict";
		Object.defineProperty(exports, "__esModule", { value: true });
		exports.PathError = exports.TokenData = void 0;
		exports.parse = parse;
		exports.compile = compile;
		exports.match = match;
		exports.pathToRegexp = pathToRegexp;
		exports.stringify = stringify;
		const DEFAULT_DELIMITER = "/";
		const NOOP_VALUE = (value) => value;
		const ID_START = /^[$_\p{ID_Start}]$/u;
		const ID_CONTINUE = /^[$\u200c\u200d\p{ID_Continue}]$/u;
		const SIMPLE_TOKENS = {
			// Groups.
			"{": "{",
			"}": "}",
			// Reserved.
			"(": "(",
			")": ")",
			"[": "[",
			"]": "]",
			"+": "+",
			"?": "?",
			"!": "!",
		};
		/**
		 * Escape text for stringify to path.
		 */
		function escapeText(str) {
			return str.replace(/[{}()\[\]+?!:*\\]/g, "\\$&");
		}
		/**
		 * Escape a regular expression string.
		 */
		function escape(str) {
			return str.replace(/[.+*?^${}()[\]|/\\]/g, "\\$&");
		}
		/**
		 * Tokenized path instance.
		 */
		class TokenData {
			constructor(tokens, originalPath) {
				this.tokens = tokens;
				this.originalPath = originalPath;
			}
		}
		exports.TokenData = TokenData;
		/**
		 * ParseError is thrown when there is an error processing the path.
		 */
		class PathError extends TypeError {
			constructor(message, originalPath) {
				let text = message;
				if (originalPath)
					text += `: ${originalPath}`;
				text += `; visit https://git.new/pathToRegexpError for info`;
				super(text);
				this.originalPath = originalPath;
			}
		}
		exports.PathError = PathError;
		/**
		 * Parse a string for the raw tokens.
		 */
		function parse(str, options = {}) {
			const { encodePath = NOOP_VALUE } = options;
			const chars = [...str];
			const tokens = [];
			let index = 0;
			let pos = 0;
			function name() {
				let value = "";
				if (ID_START.test(chars[index])) {
					do {
						value += chars[index++];
					} while (ID_CONTINUE.test(chars[index]));
				}
				else if (chars[index] === '"') {
					let quoteStart = index;
					while (index++ < chars.length) {
						if (chars[index] === '"') {
							index++;
							quoteStart = 0;
							break;
						}
						// Increment over escape characters.
						if (chars[index] === "\\")
							index++;
						value += chars[index];
					}
					if (quoteStart) {
						throw new PathError(`Unterminated quote at index ${quoteStart}`, str);
					}
				}
				if (!value) {
					throw new PathError(`Missing parameter name at index ${index}`, str);
				}
				return value;
			}
			while (index < chars.length) {
				const value = chars[index];
				const type = SIMPLE_TOKENS[value];
				if (type) {
					tokens.push({ type, index: index++, value });
				}
				else if (value === "\\") {
					tokens.push({ type: "escape", index: index++, value: chars[index++] });
				}
				else if (value === ":") {
					tokens.push({ type: "param", index: index++, value: name() });
				}
				else if (value === "*") {
					tokens.push({ type: "wildcard", index: index++, value: name() });
				}
				else {
					tokens.push({ type: "char", index: index++, value });
				}
			}
			tokens.push({ type: "end", index, value: "" });
			function consumeUntil(endType) {
				const output = [];
				while (true) {
					const token = tokens[pos++];
					if (token.type === endType)
						break;
					if (token.type === "char" || token.type === "escape") {
						let path = token.value;
						let cur = tokens[pos];
						while (cur.type === "char" || cur.type === "escape") {
							path += cur.value;
							cur = tokens[++pos];
						}
						output.push({
							type: "text",
							value: encodePath(path),
						});
						continue;
					}
					if (token.type === "param" || token.type === "wildcard") {
						output.push({
							type: token.type,
							name: token.value,
						});
						continue;
					}
					if (token.type === "{") {
						output.push({
							type: "group",
							tokens: consumeUntil("}"),
						});
						continue;
					}
					throw new PathError(`Unexpected ${token.type} at index ${token.index}, expected ${endType}`, str);
				}
				return output;
			}
			return new TokenData(consumeUntil("end"), str);
		}
		/**
		 * Compile a string to a template function for the path.
		 */
		function compile(path, options = {}) {
			const { encode = encodeURIComponent, delimiter = DEFAULT_DELIMITER } = options;
			const data = typeof path === "object" ? path : parse(path, options);
			const fn = tokensToFunction(data.tokens, delimiter, encode);
			return function path(params = {}) {
				const [path, ...missing] = fn(params);
				if (missing.length) {
					throw new TypeError(`Missing parameters: ${missing.join(", ")}`);
				}
				return path;
			};
		}
		function tokensToFunction(tokens, delimiter, encode) {
			const encoders = tokens.map((token) => tokenToFunction(token, delimiter, encode));
			return (data) => {
				const result = [""];
				for (const encoder of encoders) {
					const [value, ...extras] = encoder(data);
					result[0] += value;
					result.push(...extras);
				}
				return result;
			};
		}
		/**
		 * Convert a single token into a path building function.
		 */
		function tokenToFunction(token, delimiter, encode) {
			if (token.type === "text")
				return () => [token.value];
			if (token.type === "group") {
				const fn = tokensToFunction(token.tokens, delimiter, encode);
				return (data) => {
					const [value, ...missing] = fn(data);
					if (!missing.length)
						return [value];
					return [""];
				};
			}
			const encodeValue = encode || NOOP_VALUE;
			if (token.type === "wildcard" && encode !== false) {
				return (data) => {
					const value = data[token.name];
					if (value == null)
						return ["", token.name];
					if (!Array.isArray(value) || value.length === 0) {
						throw new TypeError(`Expected "${token.name}" to be a non-empty array`);
					}
					return [
						value
							.map((value, index) => {
								if (typeof value !== "string") {
									throw new TypeError(`Expected "${token.name}/${index}" to be a string`);
								}
								return encodeValue(value);
							})
							.join(delimiter),
					];
				};
			}
			return (data) => {
				const value = data[token.name];
				if (value == null)
					return ["", token.name];
				if (typeof value !== "string") {
					throw new TypeError(`Expected "${token.name}" to be a string`);
				}
				return [encodeValue(value)];
			};
		}
		/**
		 * Transform a path into a match function.
		 */
		function match(path, options = {}) {
			const { decode = decodeURIComponent, delimiter = DEFAULT_DELIMITER } = options;
			const { regexp, keys } = pathToRegexp(path, options);
			const decoders = keys.map((key) => {
				if (decode === false)
					return NOOP_VALUE;
				if (key.type === "param")
					return decode;
				return (value) => value.split(delimiter).map(decode);
			});
			return function match(input) {
				const m = regexp.exec(input);
				if (!m)
					return false;
				const path = m[0];
				const params = Object.create(null);
				for (let i = 1; i < m.length; i++) {
					if (m[i] === undefined)
						continue;
					const key = keys[i - 1];
					const decoder = decoders[i - 1];
					params[key.name] = decoder(m[i]);
				}
				return { path, params };
			};
		}
		function pathToRegexp(path, options = {}) {
			const { delimiter = DEFAULT_DELIMITER, end = true, sensitive = false, trailing = true, } = options;
			const keys = [];
			const flags = sensitive ? "" : "i";
			const sources = [];
			for (const input of pathsToArray(path, [])) {
				const data = typeof input === "object" ? input : parse(input, options);
				for (const tokens of flatten(data.tokens, 0, [])) {
					sources.push(toRegExpSource(tokens, delimiter, keys, data.originalPath));
				}
			}
			let pattern = `^(?:${sources.join("|")})`;
			if (trailing)
				pattern += `(?:${escape(delimiter)}$)?`;
			pattern += end ? "$" : `(?=${escape(delimiter)}|$)`;
			const regexp = new RegExp(pattern, flags);
			return { regexp, keys };
		}
		/**
		 * Convert a path or array of paths into a flat array.
		 */
		function pathsToArray(paths, init) {
			if (Array.isArray(paths)) {
				for (const p of paths)
					pathsToArray(p, init);
			}
			else {
				init.push(paths);
			}
			return init;
		}
		/**
		 * Generate a flat list of sequence tokens from the given tokens.
		 */
		function* flatten(tokens, index, init) {
			if (index === tokens.length) {
				return yield init;
			}
			const token = tokens[index];
			if (token.type === "group") {
				for (const seq of flatten(token.tokens, 0, init.slice())) {
					yield* flatten(tokens, index + 1, seq);
				}
			}
			else {
				init.push(token);
			}
			yield* flatten(tokens, index + 1, init);
		}
		/**
		 * Transform a flat sequence of tokens into a regular expression.
		 */
		function toRegExpSource(tokens, delimiter, keys, originalPath) {
			let result = "";
			let backtrack = "";
			let isSafeSegmentParam = true;
			for (const token of tokens) {
				if (token.type === "text") {
					result += escape(token.value);
					backtrack += token.value;
					isSafeSegmentParam || (isSafeSegmentParam = token.value.includes(delimiter));
					continue;
				}
				if (token.type === "param" || token.type === "wildcard") {
					if (!isSafeSegmentParam && !backtrack) {
						throw new PathError(`Missing text before "${token.name}" ${token.type}`, originalPath);
					}
					if (token.type === "param") {
						result += `(${negate(delimiter, isSafeSegmentParam ? "" : backtrack)}+)`;
					}
					else {
						result += `([\\s\\S]+)`;
					}
					keys.push(token);
					backtrack = "";
					isSafeSegmentParam = false;
					continue;
				}
			}
			return result;
		}
		/**
		 * Block backtracking on previous text and ignore delimiter string.
		 */
		function negate(delimiter, backtrack) {
			if (backtrack.length < 2) {
				if (delimiter.length < 2)
					return `[^${escape(delimiter + backtrack)}]`;
				return `(?:(?!${escape(delimiter)})[^${escape(backtrack)}])`;
			}
			if (delimiter.length < 2) {
				return `(?:(?!${escape(backtrack)})[^${escape(delimiter)}])`;
			}
			return `(?:(?!${escape(backtrack)}|${escape(delimiter)})[\\s\\S])`;
		}
		/**
		 * Stringify an array of tokens into a path string.
		 */
		function stringifyTokens(tokens) {
			let value = "";
			let i = 0;
			function name(value) {
				const isSafe = isNameSafe(value) && isNextNameSafe(tokens[i]);
				return isSafe ? value : JSON.stringify(value);
			}
			while (i < tokens.length) {
				const token = tokens[i++];
				if (token.type === "text") {
					value += escapeText(token.value);
					continue;
				}
				if (token.type === "group") {
					value += `{${stringifyTokens(token.tokens)}}`;
					continue;
				}
				if (token.type === "param") {
					value += `:${name(token.name)}`;
					continue;
				}
				if (token.type === "wildcard") {
					value += `*${name(token.name)}`;
					continue;
				}
				throw new TypeError(`Unknown token type: ${token.type}`);
			}
			return value;
		}
		/**
		 * Stringify token data into a path string.
		 */
		function stringify(data) {
			return stringifyTokens(data.tokens);
		}
		/**
		 * Validate the parameter name contains valid ID characters.
		 */
		function isNameSafe(name) {
			const [first, ...rest] = name;
			return ID_START.test(first) && rest.every((char) => ID_CONTINUE.test(char));
		}
		/**
		 * Validate the next token does not interfere with the current param name.
		 */
		function isNextNameSafe(token) {
			if (token && token.type === "text")
				return !ID_CONTINUE.test(token.value[0]);
			return true;
		}

	},{}],38:[function(require,module,exports){
		(function (global, factory) {
			typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
				typeof define === 'function' && define.amd ? define(factory) :
					(global.typeDetect = factory());
		}(this, (function () { 'use strict';

			/* !
 * type-detect
 * Copyright(c) 2013 jake luer <jake@alogicalparadox.com>
 * MIT Licensed
 */
			var promiseExists = typeof Promise === 'function';

			/* eslint-disable no-undef */
			var globalObject = typeof self === 'object' ? self : global; // eslint-disable-line id-blacklist

			var symbolExists = typeof Symbol !== 'undefined';
			var mapExists = typeof Map !== 'undefined';
			var setExists = typeof Set !== 'undefined';
			var weakMapExists = typeof WeakMap !== 'undefined';
			var weakSetExists = typeof WeakSet !== 'undefined';
			var dataViewExists = typeof DataView !== 'undefined';
			var symbolIteratorExists = symbolExists && typeof Symbol.iterator !== 'undefined';
			var symbolToStringTagExists = symbolExists && typeof Symbol.toStringTag !== 'undefined';
			var setEntriesExists = setExists && typeof Set.prototype.entries === 'function';
			var mapEntriesExists = mapExists && typeof Map.prototype.entries === 'function';
			var setIteratorPrototype = setEntriesExists && Object.getPrototypeOf(new Set().entries());
			var mapIteratorPrototype = mapEntriesExists && Object.getPrototypeOf(new Map().entries());
			var arrayIteratorExists = symbolIteratorExists && typeof Array.prototype[Symbol.iterator] === 'function';
			var arrayIteratorPrototype = arrayIteratorExists && Object.getPrototypeOf([][Symbol.iterator]());
			var stringIteratorExists = symbolIteratorExists && typeof String.prototype[Symbol.iterator] === 'function';
			var stringIteratorPrototype = stringIteratorExists && Object.getPrototypeOf(''[Symbol.iterator]());
			var toStringLeftSliceLength = 8;
			var toStringRightSliceLength = -1;
			/**
			 * ### typeOf (obj)
			 *
			 * Uses `Object.prototype.toString` to determine the type of an object,
			 * normalising behaviour across engine versions & well optimised.
			 *
			 * @param {Mixed} object
			 * @return {String} object type
			 * @api public
			 */
			function typeDetect(obj) {
				/* ! Speed optimisation
   * Pre:
   *   string literal     x 3,039,035 ops/sec ±1.62% (78 runs sampled)
   *   boolean literal    x 1,424,138 ops/sec ±4.54% (75 runs sampled)
   *   number literal     x 1,653,153 ops/sec ±1.91% (82 runs sampled)
   *   undefined          x 9,978,660 ops/sec ±1.92% (75 runs sampled)
   *   function           x 2,556,769 ops/sec ±1.73% (77 runs sampled)
   * Post:
   *   string literal     x 38,564,796 ops/sec ±1.15% (79 runs sampled)
   *   boolean literal    x 31,148,940 ops/sec ±1.10% (79 runs sampled)
   *   number literal     x 32,679,330 ops/sec ±1.90% (78 runs sampled)
   *   undefined          x 32,363,368 ops/sec ±1.07% (82 runs sampled)
   *   function           x 31,296,870 ops/sec ±0.96% (83 runs sampled)
   */
				var typeofObj = typeof obj;
				if (typeofObj !== 'object') {
					return typeofObj;
				}

				/* ! Speed optimisation
   * Pre:
   *   null               x 28,645,765 ops/sec ±1.17% (82 runs sampled)
   * Post:
   *   null               x 36,428,962 ops/sec ±1.37% (84 runs sampled)
   */
				if (obj === null) {
					return 'null';
				}

				/* ! Spec Conformance
   * Test: `Object.prototype.toString.call(window)``
   *  - Node === "[object global]"
   *  - Chrome === "[object global]"
   *  - Firefox === "[object Window]"
   *  - PhantomJS === "[object Window]"
   *  - Safari === "[object Window]"
   *  - IE 11 === "[object Window]"
   *  - IE Edge === "[object Window]"
   * Test: `Object.prototype.toString.call(this)``
   *  - Chrome Worker === "[object global]"
   *  - Firefox Worker === "[object DedicatedWorkerGlobalScope]"
   *  - Safari Worker === "[object DedicatedWorkerGlobalScope]"
   *  - IE 11 Worker === "[object WorkerGlobalScope]"
   *  - IE Edge Worker === "[object WorkerGlobalScope]"
   */
				if (obj === globalObject) {
					return 'global';
				}

				/* ! Speed optimisation
   * Pre:
   *   array literal      x 2,888,352 ops/sec ±0.67% (82 runs sampled)
   * Post:
   *   array literal      x 22,479,650 ops/sec ±0.96% (81 runs sampled)
   */
				if (
					Array.isArray(obj) &&
					(symbolToStringTagExists === false || !(Symbol.toStringTag in obj))
				) {
					return 'Array';
				}

				// Not caching existence of `window` and related properties due to potential
				// for `window` to be unset before tests in quasi-browser environments.
				if (typeof window === 'object' && window !== null) {
					/* ! Spec Conformance
     * (https://html.spec.whatwg.org/multipage/browsers.html#location)
     * WhatWG HTML$7.7.3 - The `Location` interface
     * Test: `Object.prototype.toString.call(window.location)``
     *  - IE <=11 === "[object Object]"
     *  - IE Edge <=13 === "[object Object]"
     */
					if (typeof window.location === 'object' && obj === window.location) {
						return 'Location';
					}

					/* ! Spec Conformance
     * (https://html.spec.whatwg.org/#document)
     * WhatWG HTML$3.1.1 - The `Document` object
     * Note: Most browsers currently adher to the W3C DOM Level 2 spec
     *       (https://www.w3.org/TR/DOM-Level-2-HTML/html.html#ID-26809268)
     *       which suggests that browsers should use HTMLTableCellElement for
     *       both TD and TH elements. WhatWG separates these.
     *       WhatWG HTML states:
     *         > For historical reasons, Window objects must also have a
     *         > writable, configurable, non-enumerable property named
     *         > HTMLDocument whose value is the Document interface object.
     * Test: `Object.prototype.toString.call(document)``
     *  - Chrome === "[object HTMLDocument]"
     *  - Firefox === "[object HTMLDocument]"
     *  - Safari === "[object HTMLDocument]"
     *  - IE <=10 === "[object Document]"
     *  - IE 11 === "[object HTMLDocument]"
     *  - IE Edge <=13 === "[object HTMLDocument]"
     */
					if (typeof window.document === 'object' && obj === window.document) {
						return 'Document';
					}

					if (typeof window.navigator === 'object') {
						/* ! Spec Conformance
       * (https://html.spec.whatwg.org/multipage/webappapis.html#mimetypearray)
       * WhatWG HTML$8.6.1.5 - Plugins - Interface MimeTypeArray
       * Test: `Object.prototype.toString.call(navigator.mimeTypes)``
       *  - IE <=10 === "[object MSMimeTypesCollection]"
       */
						if (typeof window.navigator.mimeTypes === 'object' &&
							obj === window.navigator.mimeTypes) {
							return 'MimeTypeArray';
						}

						/* ! Spec Conformance
       * (https://html.spec.whatwg.org/multipage/webappapis.html#pluginarray)
       * WhatWG HTML$8.6.1.5 - Plugins - Interface PluginArray
       * Test: `Object.prototype.toString.call(navigator.plugins)``
       *  - IE <=10 === "[object MSPluginsCollection]"
       */
						if (typeof window.navigator.plugins === 'object' &&
							obj === window.navigator.plugins) {
							return 'PluginArray';
						}
					}

					if ((typeof window.HTMLElement === 'function' ||
							typeof window.HTMLElement === 'object') &&
						obj instanceof window.HTMLElement) {
						/* ! Spec Conformance
      * (https://html.spec.whatwg.org/multipage/webappapis.html#pluginarray)
      * WhatWG HTML$4.4.4 - The `blockquote` element - Interface `HTMLQuoteElement`
      * Test: `Object.prototype.toString.call(document.createElement('blockquote'))``
      *  - IE <=10 === "[object HTMLBlockElement]"
      */
						if (obj.tagName === 'BLOCKQUOTE') {
							return 'HTMLQuoteElement';
						}

						/* ! Spec Conformance
       * (https://html.spec.whatwg.org/#htmltabledatacellelement)
       * WhatWG HTML$4.9.9 - The `td` element - Interface `HTMLTableDataCellElement`
       * Note: Most browsers currently adher to the W3C DOM Level 2 spec
       *       (https://www.w3.org/TR/DOM-Level-2-HTML/html.html#ID-82915075)
       *       which suggests that browsers should use HTMLTableCellElement for
       *       both TD and TH elements. WhatWG separates these.
       * Test: Object.prototype.toString.call(document.createElement('td'))
       *  - Chrome === "[object HTMLTableCellElement]"
       *  - Firefox === "[object HTMLTableCellElement]"
       *  - Safari === "[object HTMLTableCellElement]"
       */
						if (obj.tagName === 'TD') {
							return 'HTMLTableDataCellElement';
						}

						/* ! Spec Conformance
       * (https://html.spec.whatwg.org/#htmltableheadercellelement)
       * WhatWG HTML$4.9.9 - The `td` element - Interface `HTMLTableHeaderCellElement`
       * Note: Most browsers currently adher to the W3C DOM Level 2 spec
       *       (https://www.w3.org/TR/DOM-Level-2-HTML/html.html#ID-82915075)
       *       which suggests that browsers should use HTMLTableCellElement for
       *       both TD and TH elements. WhatWG separates these.
       * Test: Object.prototype.toString.call(document.createElement('th'))
       *  - Chrome === "[object HTMLTableCellElement]"
       *  - Firefox === "[object HTMLTableCellElement]"
       *  - Safari === "[object HTMLTableCellElement]"
       */
						if (obj.tagName === 'TH') {
							return 'HTMLTableHeaderCellElement';
						}
					}
				}

				/* ! Speed optimisation
  * Pre:
  *   Float64Array       x 625,644 ops/sec ±1.58% (80 runs sampled)
  *   Float32Array       x 1,279,852 ops/sec ±2.91% (77 runs sampled)
  *   Uint32Array        x 1,178,185 ops/sec ±1.95% (83 runs sampled)
  *   Uint16Array        x 1,008,380 ops/sec ±2.25% (80 runs sampled)
  *   Uint8Array         x 1,128,040 ops/sec ±2.11% (81 runs sampled)
  *   Int32Array         x 1,170,119 ops/sec ±2.88% (80 runs sampled)
  *   Int16Array         x 1,176,348 ops/sec ±5.79% (86 runs sampled)
  *   Int8Array          x 1,058,707 ops/sec ±4.94% (77 runs sampled)
  *   Uint8ClampedArray  x 1,110,633 ops/sec ±4.20% (80 runs sampled)
  * Post:
  *   Float64Array       x 7,105,671 ops/sec ±13.47% (64 runs sampled)
  *   Float32Array       x 5,887,912 ops/sec ±1.46% (82 runs sampled)
  *   Uint32Array        x 6,491,661 ops/sec ±1.76% (79 runs sampled)
  *   Uint16Array        x 6,559,795 ops/sec ±1.67% (82 runs sampled)
  *   Uint8Array         x 6,463,966 ops/sec ±1.43% (85 runs sampled)
  *   Int32Array         x 5,641,841 ops/sec ±3.49% (81 runs sampled)
  *   Int16Array         x 6,583,511 ops/sec ±1.98% (80 runs sampled)
  *   Int8Array          x 6,606,078 ops/sec ±1.74% (81 runs sampled)
  *   Uint8ClampedArray  x 6,602,224 ops/sec ±1.77% (83 runs sampled)
  */
				var stringTag = (symbolToStringTagExists && obj[Symbol.toStringTag]);
				if (typeof stringTag === 'string') {
					return stringTag;
				}

				var objPrototype = Object.getPrototypeOf(obj);
				/* ! Speed optimisation
  * Pre:
  *   regex literal      x 1,772,385 ops/sec ±1.85% (77 runs sampled)
  *   regex constructor  x 2,143,634 ops/sec ±2.46% (78 runs sampled)
  * Post:
  *   regex literal      x 3,928,009 ops/sec ±0.65% (78 runs sampled)
  *   regex constructor  x 3,931,108 ops/sec ±0.58% (84 runs sampled)
  */
				if (objPrototype === RegExp.prototype) {
					return 'RegExp';
				}

				/* ! Speed optimisation
  * Pre:
  *   date               x 2,130,074 ops/sec ±4.42% (68 runs sampled)
  * Post:
  *   date               x 3,953,779 ops/sec ±1.35% (77 runs sampled)
  */
				if (objPrototype === Date.prototype) {
					return 'Date';
				}

				/* ! Spec Conformance
   * (http://www.ecma-international.org/ecma-262/6.0/index.html#sec-promise.prototype-@@tostringtag)
   * ES6$25.4.5.4 - Promise.prototype[@@toStringTag] should be "Promise":
   * Test: `Object.prototype.toString.call(Promise.resolve())``
   *  - Chrome <=47 === "[object Object]"
   *  - Edge <=20 === "[object Object]"
   *  - Firefox 29-Latest === "[object Promise]"
   *  - Safari 7.1-Latest === "[object Promise]"
   */
				if (promiseExists && objPrototype === Promise.prototype) {
					return 'Promise';
				}

				/* ! Speed optimisation
  * Pre:
  *   set                x 2,222,186 ops/sec ±1.31% (82 runs sampled)
  * Post:
  *   set                x 4,545,879 ops/sec ±1.13% (83 runs sampled)
  */
				if (setExists && objPrototype === Set.prototype) {
					return 'Set';
				}

				/* ! Speed optimisation
  * Pre:
  *   map                x 2,396,842 ops/sec ±1.59% (81 runs sampled)
  * Post:
  *   map                x 4,183,945 ops/sec ±6.59% (82 runs sampled)
  */
				if (mapExists && objPrototype === Map.prototype) {
					return 'Map';
				}

				/* ! Speed optimisation
  * Pre:
  *   weakset            x 1,323,220 ops/sec ±2.17% (76 runs sampled)
  * Post:
  *   weakset            x 4,237,510 ops/sec ±2.01% (77 runs sampled)
  */
				if (weakSetExists && objPrototype === WeakSet.prototype) {
					return 'WeakSet';
				}

				/* ! Speed optimisation
  * Pre:
  *   weakmap            x 1,500,260 ops/sec ±2.02% (78 runs sampled)
  * Post:
  *   weakmap            x 3,881,384 ops/sec ±1.45% (82 runs sampled)
  */
				if (weakMapExists && objPrototype === WeakMap.prototype) {
					return 'WeakMap';
				}

				/* ! Spec Conformance
   * (http://www.ecma-international.org/ecma-262/6.0/index.html#sec-dataview.prototype-@@tostringtag)
   * ES6$24.2.4.21 - DataView.prototype[@@toStringTag] should be "DataView":
   * Test: `Object.prototype.toString.call(new DataView(new ArrayBuffer(1)))``
   *  - Edge <=13 === "[object Object]"
   */
				if (dataViewExists && objPrototype === DataView.prototype) {
					return 'DataView';
				}

				/* ! Spec Conformance
   * (http://www.ecma-international.org/ecma-262/6.0/index.html#sec-%mapiteratorprototype%-@@tostringtag)
   * ES6$23.1.5.2.2 - %MapIteratorPrototype%[@@toStringTag] should be "Map Iterator":
   * Test: `Object.prototype.toString.call(new Map().entries())``
   *  - Edge <=13 === "[object Object]"
   */
				if (mapExists && objPrototype === mapIteratorPrototype) {
					return 'Map Iterator';
				}

				/* ! Spec Conformance
   * (http://www.ecma-international.org/ecma-262/6.0/index.html#sec-%setiteratorprototype%-@@tostringtag)
   * ES6$23.2.5.2.2 - %SetIteratorPrototype%[@@toStringTag] should be "Set Iterator":
   * Test: `Object.prototype.toString.call(new Set().entries())``
   *  - Edge <=13 === "[object Object]"
   */
				if (setExists && objPrototype === setIteratorPrototype) {
					return 'Set Iterator';
				}

				/* ! Spec Conformance
   * (http://www.ecma-international.org/ecma-262/6.0/index.html#sec-%arrayiteratorprototype%-@@tostringtag)
   * ES6$22.1.5.2.2 - %ArrayIteratorPrototype%[@@toStringTag] should be "Array Iterator":
   * Test: `Object.prototype.toString.call([][Symbol.iterator]())``
   *  - Edge <=13 === "[object Object]"
   */
				if (arrayIteratorExists && objPrototype === arrayIteratorPrototype) {
					return 'Array Iterator';
				}

				/* ! Spec Conformance
   * (http://www.ecma-international.org/ecma-262/6.0/index.html#sec-%stringiteratorprototype%-@@tostringtag)
   * ES6$21.1.5.2.2 - %StringIteratorPrototype%[@@toStringTag] should be "String Iterator":
   * Test: `Object.prototype.toString.call(''[Symbol.iterator]())``
   *  - Edge <=13 === "[object Object]"
   */
				if (stringIteratorExists && objPrototype === stringIteratorPrototype) {
					return 'String Iterator';
				}

				/* ! Speed optimisation
  * Pre:
  *   object from null   x 2,424,320 ops/sec ±1.67% (76 runs sampled)
  * Post:
  *   object from null   x 5,838,000 ops/sec ±0.99% (84 runs sampled)
  */
				if (objPrototype === null) {
					return 'Object';
				}

				return Object
					.prototype
					.toString
					.call(obj)
					.slice(toStringLeftSliceLength, toStringRightSliceLength);
			}

			return typeDetect;

		})));

	},{}]},{},[12])(12)
});
