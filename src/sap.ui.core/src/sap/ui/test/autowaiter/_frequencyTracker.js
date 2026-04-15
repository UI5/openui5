/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/base/Object",
	"sap/ui/test/_OpaLogger"
], function (UI5Object, _OpaLogger) {
	"use strict";

	var iDEFAULT_MIN_OBSERVATIONS = 4;
	var iDEFAULT_MAX_OBSERVATIONS = 10;
	var iDEFAULT_MAX_COLLECTION_TIME = 4000;
	var iDEFAULT_MAX_DEVIATION = 10;

	/**
	 * Tracks timeout execution frequency to detect polling patterns.
	 *
	 * Uses an {@link ObservationStore} to store records keyed by (func, delay).
	 * Statistical consistency of scheduling gaps is used to determine if a
	 * pattern is periodic (i.e. polling).
	 *
	 * @class
	 * @extends sap.ui.base.Object
	 * @param {object} [mConfig] Configuration options
	 * @param {int} [mConfig.minObservations=4] Minimum observations required (floor for window size)
	 * @param {int} [mConfig.maxObservations=10] Maximum observations (cap for window size)
	 * @param {int} [mConfig.maxCollectionTime=4000] Max time in ms to collect statistics before deciding
	 * @param {int} [mConfig.maxDeviation=10] Max allowed gap deviation in ms
	 * @private
	 */
	var FrequencyTracker = UI5Object.extend("sap.ui.test.autowaiter._frequencyTracker", {
		constructor: function (mConfig) {
			UI5Object.call(this);
			mConfig = mConfig || {};
			this._oStore = new ObservationStore(mConfig.maxObservations || iDEFAULT_MAX_OBSERVATIONS);
			this._oLogger = _OpaLogger.getLogger("sap.ui.test.autowaiter._frequencyTracker");
			this.updateConfig(mConfig);
		},

		/**
		 * Updates config parameters in-place without discarding accumulated observations.
		 * @param {object} [mConfig] Configuration options (same shape as the constructor config)
		 * @private
		 */
		updateConfig: function (mConfig) {
			mConfig = mConfig || {};
			this._iMinObservations = mConfig.minObservations || iDEFAULT_MIN_OBSERVATIONS;
			this._iMaxObservations = mConfig.maxObservations || iDEFAULT_MAX_OBSERVATIONS;
			this._iMaxCollectionTime = mConfig.maxCollectionTime || iDEFAULT_MAX_COLLECTION_TIME;
			this._iMaxDeviation = mConfig.maxDeviation !== undefined ? mConfig.maxDeviation : iDEFAULT_MAX_DEVIATION;
			this._oStore._iMaxRecordsPerKey = this._iMaxObservations;
		},

		/**
		 * Registers a timeout into the observation buffer.
		 *
		 * @param {sap.ui.test.autowaiter.TimeoutDescriptor} oTimeout The timeout descriptor (shared reference with _timeoutWaiter)
		 * @public
		 */
		register: function (oTimeout) {
			this._oStore.add(oTimeout.func, oTimeout.delay, oTimeout);
		},

		/**
		 * Determines whether a function+delay pattern has consistent scheduling frequency.
		 * @param {string} sFunc - The function's toString representation
		 * @param {int} iDelay - The timeout delay in ms
		 * @returns {boolean} Whether the pattern has consistent frequency
		 * @public
		 */
		hasConsistentFrequency: function (sFunc, iDelay) {
			var aRecords = this._getRecordsForConsistencyCheck(sFunc, iDelay);
			if (!aRecords || !aRecords.length) {
				return false;
			}

			var bIsConsistent = this._areIntervalsConsistent(aRecords);
			var oLastRecord = aRecords[aRecords.length - 1];
			// cache the result for later lookup
			oLastRecord.hasConsistentFrequency = bIsConsistent;

			return bIsConsistent;
		},

		/**
		 * Returns the most recent records for a pattern, or null if insufficient
		 * observations have been collected.
		 * Uses fast re-detection (minObservations) when the pattern was previously consistent,
		 * otherwise requires the full window size.
		 * @param {string} sFunc - The function's toString representation
		 * @param {int} iDelay - The timeout delay in ms
		 * @returns {Array<object>|null} Records to check, or null if not enough observations
		 * @private
		 */
		_getRecordsForConsistencyCheck: function (sFunc, iDelay) {
			var aHistory = this._oStore.getRecords(sFunc, iDelay);
			if (!aHistory) {
				return null;
			}

			var iFullWindow = this._getCountRecordsToCheck(iDelay);
			var iRequiredRecords = this._hasBeenConsistentBefore(aHistory, iFullWindow)
				? this._iMinObservations // fast re-check after a spike
				: iFullWindow;

			if (aHistory.length < iRequiredRecords) {
				return null;
			}

			return aHistory.slice(-iRequiredRecords);
		},

		/**
		 * Checks whether any record within the last <code>iLookback</code> entries
		 * was previously classified as consistent.
		 * Used after a spike to allow fast re-detection with a smaller window.
		 * @param {Array<object>} aHistory - The history array
		 * @param {int} iLookback - Number of recent records to inspect
		 * @returns {boolean} True if any recent record was previously consistent
		 * @private
		 */
		_hasBeenConsistentBefore: function (aHistory, iLookback) {
			var iStart = Math.max(0, aHistory.length - iLookback);
			return aHistory.slice(iStart).some(function (oRecord) {
				return oRecord.hasConsistentFrequency === true;
			});
		},

		/**
		 * Checks whether the scheduling gaps between consecutive records are
		 * within maxDeviation of the mean and non-negative.
		 * @param {Array<object>} aRecords - Consecutive timeout records (at least 2)
		 * @returns {boolean} Whether the intervals are consistent
		 * @private
		 */
		_areIntervalsConsistent: function (aRecords) {
			var aIntervals = [];
			for (var k = 1; k < aRecords.length; k++) {
				var fGap = this._getSchedulingGap(aRecords[k - 1], aRecords[k]);
				if (fGap === null || fGap < 0) { // negative gap can be throttling but not polling pattern
					return false;
				}
				aIntervals.push(fGap);
			}

			var fAvg = this._getAverage(aIntervals);

			for (var i = 0; i < aIntervals.length; i++) {
				if (Math.abs(aIntervals[i] - fAvg) > this._iMaxDeviation) {
					return false;
				}
			}

			this._oLogger.trace(
				"Consistent frequency detected" +
				" | delay: " + aRecords[0].delay +
				" | window: " + aRecords.length +
				" | gaps: [" + aIntervals.map(function(f) { return f.toFixed(2); }).join(", ") + "]" +
				" | avg: " + fAvg.toFixed(2) +
				" | maxDeviation: " + this._iMaxDeviation +
				"\nFunction: " + aRecords[0].func
			);

			return true;
		},

		/**
		 * Computes the scheduling gap between two consecutive records.
		 * This is the time between the previous callback finishing and the
		 * next timeout being scheduled — i.e. the raw interval minus the
		 * browser's actual timer delay and the callback's execution time.
		 * @param {object} oPrev - The previous timeout record
		 * @param {object} oCurr - The current timeout record
		 * @returns {float|null} The scheduling gap in ms, or null if required timestamps are missing
		 * @private
		 */
		_getSchedulingGap: function (oPrev, oCurr) {
			if (!oPrev.startedAt || !oPrev.finishedAt || !oCurr.scheduledAt || !oPrev.scheduledAt) {
				return null;
			}

			var fRawInterval = oCurr.scheduledAt - oPrev.scheduledAt;
			var fActualDelay = oPrev.startedAt - oPrev.scheduledAt;
			var fExecutionTime = oPrev.finishedAt - oPrev.startedAt;
			return fRawInterval - fActualDelay - fExecutionTime;
		},

		/**
		 * Computes the arithmetic mean of an array of numbers.
		 * @param {Array<float>} aValues - The values to average
		 * @returns {float} The arithmetic mean
		 * @private
		 */
		_getAverage: function (aValues) {
			var fSum = 0;
			for (var i = 0; i < aValues.length; i++) {
				fSum += aValues[i];
			}
			return fSum / aValues.length;
		},

		/**
		 * Determines the observation window size based on delay.
		 * Uses formula: max(minObservations, min(maxObservations, floor(maxCollectionTime / delay))).
		 * Shorter delays allow more observations within the collection time budget.
		 * @param {int} iDelay - The timeout delay in ms
		 * @returns {int} Number of records to check
		 * @private
		 */
		_getCountRecordsToCheck: function (iDelay) {
			if (iDelay <= 0) {
				return this._iMinObservations;
			}
			var iFromTime = Math.floor(this._iMaxCollectionTime / iDelay);
			return Math.max(this._iMinObservations, Math.min(this._iMaxObservations, iFromTime));
		}

	});

	/**
	 * Stores timeout records keyed by (func, delay) pairs.
	 * @param {int} iMaxRecordsPerKey Maximum number of records to retain per key.
	 *   Oldest entries are discarded when the limit is exceeded.
	 * @private
	 */
	function ObservationStore(iMaxRecordsPerKey) {
		this._mRecords = new Map();
		this._iMaxRecordsPerKey = iMaxRecordsPerKey;
	}

	/**
	 * Stores a timeout record.
	 * @param {string} sFunc - The function's toString representation
	 * @param {int} iDelay - The timeout delay in ms
	 * @param {sap.ui.test.autowaiter.TimeoutDescriptor} oTimeout The timeout descriptor
	 */
	ObservationStore.prototype.add = function (sFunc, iDelay, oTimeout) {
		var sKey = this._toKey(sFunc, iDelay);

		if (!this._mRecords.has(sKey)) {
			this._mRecords.set(sKey, []);
		}

		var aRecords = this._mRecords.get(sKey);
		aRecords.push(oTimeout);
		this._discardOldestOverLimit(aRecords);
	};

	/**
	 * Returns all stored records for a (func, delay) pair.
	 * @param {string} sFunc - The function's toString representation
	 * @param {int} iDelay - The timeout delay in ms
	 * @returns {Array<object>|null} The records array, or null if none exist
	 */
	ObservationStore.prototype.getRecords = function (sFunc, iDelay) {
		var sKey = this._toKey(sFunc, iDelay);
		return this._mRecords.has(sKey) ? this._mRecords.get(sKey) : null;
	};

	/**
	 * Builds a storage key from a function string and delay.
	 * @param {string} sFunc - The function's toString representation
	 * @param {int} iDelay - The timeout delay in ms
	 * @returns {string} The storage key
	 * @private
	 */
	ObservationStore.prototype._toKey = function (sFunc, iDelay) {
		return iDelay + "-" + sFunc;
	};

	/**
	 * Removes the oldest entries from the array so that its length
	 * does not exceed the configured maximum.
	 * @param {Array<object>} aRecords - The records array to trim in place
	 * @private
	 */
	ObservationStore.prototype._discardOldestOverLimit = function (aRecords) {
		if (aRecords.length > this._iMaxRecordsPerKey) {
			aRecords.splice(0, aRecords.length - this._iMaxRecordsPerKey);
		}
	};

	return FrequencyTracker;
});
