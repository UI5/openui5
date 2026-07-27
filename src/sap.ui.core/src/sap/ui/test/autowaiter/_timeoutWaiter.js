/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/Log",
	"sap/base/util/extend",
	"sap/ui/test/autowaiter/_utils",
	"sap/ui/test/autowaiter/_frequencyTracker",
	"./WaiterBase"
],function(Log, extend, _utils, FrequencyTracker, WaiterBase) {
	"use strict";

	/**
	 * Descriptor for a tracked timeout.
	 *
	 * Created by <code>_timeoutWaiter</code> at registration time with the fields
	 * marked "set by _timeoutWaiter". The same object reference is passed to
	 * {@link sap.ui.test.autowaiter._frequencyTracker#register FrequencyTracker},
	 * which reads and enriches it with derived fields.
	 *
	 * @typedef {object} sap.ui.test.autowaiter.TimeoutDescriptor
	 *
	 * @property {int}    delay        Requested delay in ms — set by _timeoutWaiter at creation
	 * @property {string} func         Function source (<code>toString()</code>) — set by _timeoutWaiter at creation
	 * @property {float}  scheduledAt  <code>performance.now()</code> when <code>setTimeout</code> was called — set by _timeoutWaiter at creation
	 * @property {float}  [startedAt]  <code>performance.now()</code> when the callback began — set by _timeoutWaiter when callback fires
	 * @property {float}  [finishedAt] <code>performance.now()</code> when the callback ended — set by _timeoutWaiter when callback returns
	 * @property {string} status       Lifecycle status (TRACKED → STARTED → FINISHED | CLEARED) — set by _timeoutWaiter
	 * @property {int}    [initiator]  Timeout ID of the callback that scheduled this one — set by _timeoutWaiter at creation
	 * @property {string} [stack]      Stack trace at scheduling time — set by _timeoutWaiter at creation
	 *
	 * @property {boolean} [hasConsistentFrequency]     Whether this record was part of a consistent-frequency window — set by FrequencyTracker
	 * @private
	 */

	var mTimeouts = {};
	var timeoutStatus = {
		TRACKED: "TRACKED",
		STARTED: "STARTED",
		FINISHED: "FINISHED",
		CLEARED: "CLEARED"
	};
	var oFrequencyTracker;
	var fnInitiatorResolver;

	// initiatorId is the timeout id of the currently running timeout callback
	// for opa poll frame, will have the ID of the poll timeout
	// undefined means this is native event frame
	var iInitiatorId;

	var TimeoutWaiter = WaiterBase.extend("sap.ui.test.autowaiter._timeoutWaiter", {
		hasPending: function () {
			var aBlockingTimeoutIds = Object.keys(mTimeouts).filter(function (iID) {
				return isBlocking(iID);
			});
			var bHasBlockingTimeouts = aBlockingTimeoutIds.length > 0;
			logTrackedTimeouts(aBlockingTimeoutIds);
			return bHasBlockingTimeouts;
		},
		extendConfig: function (oConfig) {
			WaiterBase.prototype.extendConfig.call(this, oConfig);
			if (oConfig && oConfig.frequencyDetection && oFrequencyTracker) { // check new config contains frequencyDetection updates
				// propagate config updates and preserve existing FrequencyTracker instance to preserve its accumulated observations
				oFrequencyTracker.updateConfig(this._mConfig.frequencyDetection); // pass the merged config (old + new))
			}
		},
		_getDefaultConfig: function () {
			return extend({
				maxDepth: 1, 		// count
				maxDelay: 1000, 	// milliseconds
				minDelay: 10, 		// milliseconds
				// NB: Keep frequencyDetection config private for now.
				// Once the implementation has proven stable in production,
				// we may expose these parameters as public API. Until then
				// they serve as a safety net: if issues are reported, apps
				// can override them to work around problems immediately.
				frequencyDetection: {
					disabled: false,
					minObservations: 4,
					maxObservations: 10,
					maxCollectionTime: 4000,
					maxDeviation: 10
				}
			}, WaiterBase.prototype._getDefaultConfig.call(this));
		},
		_getValidationInfo: function () {
			return extend({
				maxDepth: "numeric",
				maxDelay: "numeric",
				minDelay: "numeric",
				frequencyDetection: {
					disabled: "bool",
					minObservations: "numeric",
					maxObservations: "numeric",
					maxCollectionTime: "numeric",
					maxDeviation: "numeric"
				}
			}, WaiterBase.prototype._getValidationInfo.call(this));
		},

		// private API used by the promiseWaiter for detecting polling promises

		// return the current execution timeoutId or undefined if not currently in tracked timeout callback
		_getInitiatorId: function() {
			return iInitiatorId;
		},
		/**
		 * Determines whether a timeout is polling by checking chain-based detection first,
		 * then falling back to statistical frequency analysis.
		 * @param {int} iTimeoutId - The timeout ID
		 * @returns {boolean} Whether the timeout is classified as polling
		 * @private
		 */
		_isPolling: function(iTimeoutId) {
			return this._isSelfScheduling(iTimeoutId)
				|| this._hasConsistentFrequency(iTimeoutId);
		},
		/**
		 * Chain-based detection: walks the initiator chain to find self-scheduling loops
		 * where a timeout's callback directly schedules another timeout with the same delay.
		 * @param {int} iTimeoutId - The timeout ID
		 * @param {int} [iDepth=1] - Current chain depth (used for recursion)
		 * @returns {boolean} Whether a self-scheduling chain was found
		 * @private
		 */
		_isSelfScheduling: function(iTimeoutId, iDepth) {
			iDepth = iDepth || 1;
			var oTimeout = mTimeouts[iTimeoutId];
			var oInitiatorTimeout = oTimeout ? mTimeouts[oTimeout.initiator] : undefined;

			if (!oTimeout || !oInitiatorTimeout) {
				return false;
			}

			if (oTimeout.delay === oInitiatorTimeout.delay) {
				if (iDepth >= this._mConfig.maxDepth) {
					return true;
				}
				return this._isSelfScheduling(oTimeout.initiator, iDepth + 1);
			}

			return false;
		},
		/**
		 * Statistical detection: delegates to FrequencyTracker to check if the
		 * timeout's function+delay pattern shows consistent periodic scheduling.
		 * @param {int} iTimeoutId - The timeout ID
		 * @returns {boolean} Whether a consistent frequency pattern was found
		 * @private
		 */
		_hasConsistentFrequency: function(iTimeoutId) {
			var oTimeout = mTimeouts[iTimeoutId];
			return oTimeout && this._getFrequencyTracker().hasConsistentFrequency(
				oTimeout.func, oTimeout.delay
			);
		},
		/**
		 * Determines whether frequency tracking should be applied for the given delay.
		 * Returns false when statistical detection is disabled or the delay falls outside
		 * the trackable range (minDelay, maxDelay].
		 * @param {int} iDelay - The timeout delay in ms
		 * @returns {boolean} Whether frequency tracking should be applied
		 * @private
		 */
		_shouldTrackFrequency: function(iDelay) {
			return !this._mConfig.frequencyDetection.disabled
				&& iDelay > this._mConfig.minDelay
				&& iDelay <= this._mConfig.maxDelay;
		},
		/**
		 * Returns the FrequencyTracker instance, creating it lazily with the current config.
		 * @returns {sap.ui.test.autowaiter._frequencyTracker} The frequency tracker
		 * @private
		 */
		_getFrequencyTracker: function () {
			if (!oFrequencyTracker) {
				oFrequencyTracker = new FrequencyTracker(this._mConfig.frequencyDetection);
			}
			return oFrequencyTracker;
		},
		_registerInitiatorResolverId: function(fnInitiatorResolverCallback) {
			fnInitiatorResolver = fnInitiatorResolverCallback;
		}
	});
	var oTimeoutWaiter = new TimeoutWaiter();

	function _resolveInitiatorId() {
		if (iInitiatorId) {
			return iInitiatorId;
		}
		if (fnInitiatorResolver) {
			return fnInitiatorResolver();
		}
	}

	function createTimeoutWrapper (sName) {
		var sSetName = "set" + sName;
		var sClearName = "clear" + sName;
		var fnOriginal = window[sSetName];
		// set immediate is not standard
		if (!fnOriginal) {
			return;
		}
		var fnOriginalClear = window[sClearName];

		window[sSetName] = function wrappedSetTimeout(fnCallback, iDelay, tracking) {
			iDelay = iDelay || 0;
			var aCallbackArgs = Array.prototype.slice.call(arguments, 2);
			var oNewTimeout = {
				delay: iDelay,
				initiator: _resolveInitiatorId(),
				func: _utils.functionToString(fnCallback),
				stack: _utils.resolveStackTrace(),
				scheduledAt: performance.now(),
				status: timeoutStatus.TRACKED
			};
			var iID;

			// some timeouts do not need to be tracked, like the timeout for long-running promises
			if (tracking && tracking === 'TIMEOUT_WAITER_IGNORE') {
				iID = fnOriginal.apply(null, [fnCallback, iDelay].concat(aCallbackArgs.slice(1)));
				oTimeoutWaiter._oLogger.trace("Timeout with ID " + iID + " should not be tracked. " +
					" Delay: " + iDelay +
					" Initiator: " + iInitiatorId);

				return iID;
			}

			var fnWrappedCallback = function wrappedCallback() {
				// workaround for FF: the mTimeouts[iID] is sometimes cleaned by GC before it is released
				var oCurrentTimeout = mTimeouts[iID];
				if (!oCurrentTimeout) {
					oTimeoutWaiter._oLogger.trace("Timeout data for timeout with ID " + iID + " disapered unexpectedly");
					oCurrentTimeout = {};
				}
				iInitiatorId = iID;

				oTimeoutWaiter._oLogger.trace("Timeout with ID " + iID + " started");
				oCurrentTimeout.status = timeoutStatus.STARTED;
				oCurrentTimeout.startedAt = performance.now();
				try {
					fnCallback.apply(window, aCallbackArgs);
				} finally {
					iInitiatorId = undefined;
					oTimeoutWaiter._oLogger.trace("Timeout with ID " + iID + " finished");
					oCurrentTimeout.status = timeoutStatus.FINISHED;
					oCurrentTimeout.finishedAt = performance.now();
				}
			};

			iID = fnOriginal.apply(null, [fnWrappedCallback, iDelay].concat(aCallbackArgs));
			oTimeoutWaiter._oLogger.trace("Timeout with ID " + iID + " is tracked. " +
				" Delay: " + iDelay +
				" Initiator: " + iInitiatorId);
			mTimeouts[iID] = oNewTimeout;
			if (oTimeoutWaiter._shouldTrackFrequency(iDelay)) {
				oTimeoutWaiter._getFrequencyTracker().register(oNewTimeout);
			}

			return iID;
		};

		window[sClearName] = function wrappedClearTimeout(iID) {
			if (!iID) {
				oTimeoutWaiter._oLogger.trace("Could not clean timeout with invalid ID: " + iID);
				return;
			}

			var oCurrentTimeout = mTimeouts[iID];
			if (!oCurrentTimeout) {
				oTimeoutWaiter._oLogger.trace("Timeout data for timeout with ID " + iID + " disapered unexpectedly or timeout was not tracked intentionally");
				oCurrentTimeout = {};
			}

			oCurrentTimeout.status = timeoutStatus.CLEARED;
			oTimeoutWaiter._oLogger.trace("Timeout with ID " + iID + " cleared");
			fnOriginalClear(iID);
		};
	}

	createTimeoutWrapper("Timeout");
	createTimeoutWrapper("Immediate");

	function createLogForTimeout(iTimeoutID, oTimeout,bBlocking,bDetails) {
		return "\nTimeout: ID: " + iTimeoutID +
			" Type: " + (bBlocking ? "BLOCKING" : "NOT BLOCKING") +
			" Status: " + oTimeout.status +
			" Delay: " + oTimeout.delay +
			" Initiator: " + oTimeout.initiator +
			(bDetails ? ("\nFunction: " + oTimeout.func) : "") +
			(bDetails ? ("\nStack: " + oTimeout.stack) : "");
	}

	function logTrackedTimeouts(aBlockingTimeoutIds) {
		var aTimeoutIds = Object.keys(mTimeouts);

		if (oTimeoutWaiter._oHasPendingLogger.isLoggable(Log.Level.DEBUG)) {
			var sLogMessage = "Found " + aBlockingTimeoutIds.length + " blocking out of " + aTimeoutIds.length + " tracked timeouts";
			aBlockingTimeoutIds.forEach(function (iTimeoutID) {
				sLogMessage += createLogForTimeout(iTimeoutID, mTimeouts[iTimeoutID],aBlockingTimeoutIds.some(function(currentValue){
					return currentValue == iTimeoutID;
				}),true);
			});
			oTimeoutWaiter._oHasPendingLogger.debug(sLogMessage);
		}

		if (oTimeoutWaiter._oHasPendingLogger.isLoggable(Log.Level.TRACE)) {
			var sTraceLogMessage = "Tracked timeouts";
			aTimeoutIds.forEach(function (iTimeoutID) {
				sTraceLogMessage += createLogForTimeout(iTimeoutID, mTimeouts[iTimeoutID],aBlockingTimeoutIds.some(function(currentValue){
					return currentValue == iTimeoutID;
				}),true);
			});
			oTimeoutWaiter._oHasPendingLogger.trace(sTraceLogMessage);
		}
	}

	function isBlocking(iID) {
		var oCurrentTimeout = mTimeouts[iID];
		// we do not care for finished timeouts
		if (oCurrentTimeout.status !== timeoutStatus.TRACKED){
			return false;
		}

		// long runnes are some application level timeouts => we do not care for them
		if (oCurrentTimeout.delay > oTimeoutWaiter._mConfig.maxDelay) {
			return false;
		}

		// zero or up to some small delay timeouts are definitely execution flow that must be waited
		if (oCurrentTimeout.delay > oTimeoutWaiter._mConfig.minDelay) {
			return !oTimeoutWaiter._isPolling(iID);
		}

		// all that are left should be waited for
		return true;
	}

	return oTimeoutWaiter;
}, true);
