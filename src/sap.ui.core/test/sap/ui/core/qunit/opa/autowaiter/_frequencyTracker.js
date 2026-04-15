/*global QUnit */
sap.ui.define([
	"sap/ui/test/autowaiter/_frequencyTracker"
], function (FrequencyTracker) {
	"use strict";

	QUnit.module("FrequencyTracker - Unit Tests");

	QUnit.test("Should cap stored records at maxObservations", function (assert) {
		var oTracker = new FrequencyTracker(); // default maxObservations = 10
		var sFuncStr = "'function poll() {}'";

		// Register 15 records for 100ms delay — only the last 10 should be retained
		for (var i = 0; i < 15; i++) {
			oTracker.register({
				delay: 100,
				func: sFuncStr,
				status: "FINISHED",
				scheduledAt: 1000 + i * 200,
				startedAt: 1000 + i * 200 + 100,
				finishedAt: 1000 + i * 200 + 110,
				actualDelay: 100,
				executionTime: 10
			});
		}

		var aHistory = oTracker._oStore.getRecords(sFuncStr, 100);
		assert.strictEqual(aHistory.length, 10, "Store should cap at maxObservations (10), discarding oldest");
		assert.strictEqual(aHistory[0].scheduledAt, 2000, "Oldest retained record should be the 6th registered (index 5)");
	});

	QUnit.test("Should calculate scheduling gap correctly", function (assert) {
		var oTracker = new FrequencyTracker();

		var oPrev = {
			scheduledAt: 1000, startedAt: 1100, finishedAt: 1110
		};
		var oCurr = {
			scheduledAt: 1210
		};

		// rawInterval = 1210 - 1000 = 210
		// actualDelay = 1100 - 1000 = 100
		// executionTime = 1110 - 1100 = 10
		// schedulingGap = 210 - 100 - 10 = 100
		assert.strictEqual(oTracker._getSchedulingGap(oPrev, oCurr), 100, "Scheduling gap should be 100ms");
	});

	QUnit.test("Should return null for scheduling gap when timestamps are missing", function (assert) {
		var oTracker = new FrequencyTracker();

		var oPrev = { scheduledAt: 1000 };
		var oCurr = { scheduledAt: 1210 };

		assert.strictEqual(oTracker._getSchedulingGap(oPrev, oCurr), null,
			"Should return null when previous record has no startedAt/finishedAt");
	});

	QUnit.test("Should detect consistent timing as polling", function (assert) {
		var oTracker = new FrequencyTracker();
		var sFuncStr = "'function poll() {}'";
		var iDelay = 100;

		// Create 10 records with consistent ~100ms gaps (window size for delay=100 is 10)
		for (var i = 0; i < 10; i++) {
			oTracker.register({
				delay: iDelay, func: sFuncStr, status: "FINISHED",
				scheduledAt: 1000 + i * 210,
				startedAt: 1000 + i * 210 + iDelay,
				finishedAt: 1000 + i * 210 + iDelay + 10,
				actualDelay: iDelay, executionTime: 10
			});
		}

		assert.ok(oTracker.hasConsistentFrequency(sFuncStr, iDelay), "Consistent timing should be detected as polling");
	});

	QUnit.test("Should NOT detect as polling when a schedule gap exceeds maxDeviation", function (assert) {
		var oTracker = new FrequencyTracker();
		var sFuncStr = "'function poll() {}'";
		var iDelay = 100;

		// 9 observations with ~2ms gaps, then 1 observation with ~50ms gap.
		// The 50ms gap deviates far beyond the 10ms maxDeviation floor.
		var iInterval = 112; // gap = 112 - 100 - 10 = 2ms
		for (var i = 0; i < 9; i++) {
			oTracker.register({
				delay: iDelay, func: sFuncStr, status: "FINISHED",
				scheduledAt: 1000 + i * iInterval,
				startedAt: 1000 + i * iInterval + iDelay,
				finishedAt: 1000 + i * iInterval + iDelay + 10,
				actualDelay: iDelay, executionTime: 10
			});
		}
		// 10th observation with a spike: gap = 162 - 100 - 10 = 52ms
		oTracker.register({
			delay: iDelay, func: sFuncStr, status: "FINISHED",
			scheduledAt: 1000 + 9 * iInterval + 50,
			startedAt: 1000 + 9 * iInterval + 50 + iDelay,
			finishedAt: 1000 + 9 * iInterval + 50 + iDelay + 10,
			actualDelay: iDelay, executionTime: 10
		});

		assert.ok(!oTracker.hasConsistentFrequency(sFuncStr, iDelay),
			"A gap of ~52ms among gaps of ~2ms should exceed the 10ms deviation tolerance and prevent polling classification");
	});

	QUnit.test("Should allow gap that deviates exactly at the maxDeviation boundary", function (assert) {
		var oTracker = new FrequencyTracker();
		var sFuncStr = "'function poll() {}'";
		var iDelay = 100;

		// 10 records: 9 with gap=5ms, then 1 with gap=15ms.
		// Mean of gaps ≈ 6ms. Deviation of 15 from 6 = 9 which is < 10ms maxDeviation.
		// So all values are within maxDeviation=10 of the mean.
		var fScheduledAt = 1000;
		oTracker.register({
			delay: iDelay, func: sFuncStr, status: "FINISHED",
			scheduledAt: fScheduledAt,
			startedAt: fScheduledAt + iDelay,
			finishedAt: fScheduledAt + iDelay + 10,
			actualDelay: iDelay, executionTime: 10
		});
		// 8 records with gap=5ms (interval=115)
		for (var i = 0; i < 8; i++) {
			fScheduledAt += 115;
			oTracker.register({
				delay: iDelay, func: sFuncStr, status: "FINISHED",
				scheduledAt: fScheduledAt,
				startedAt: fScheduledAt + iDelay,
				finishedAt: fScheduledAt + iDelay + 10,
				actualDelay: iDelay, executionTime: 10
			});
		}
		// 1 record with gap=15ms (interval=125)
		fScheduledAt += 125;
		oTracker.register({
			delay: iDelay, func: sFuncStr, status: "FINISHED",
			scheduledAt: fScheduledAt,
			startedAt: fScheduledAt + iDelay,
			finishedAt: fScheduledAt + iDelay + 10,
			actualDelay: iDelay, executionTime: 10
		});

		assert.ok(oTracker.hasConsistentFrequency(sFuncStr, iDelay),
			"All gaps within 10ms of the mean should be classified as polling");
	});

	QUnit.test("Should NOT detect as polling when schedule gap is negative", function (assert) {
		var oTracker = new FrequencyTracker();
		var sFuncStr = "'function poll() {}'";
		var iDelay = 100;

		// 9 normal observations
		for (var i = 0; i < 9; i++) {
			oTracker.register({
				delay: iDelay, func: sFuncStr, status: "FINISHED",
				scheduledAt: 1000 + i * 112,
				startedAt: 1000 + i * 112 + iDelay,
				finishedAt: 1000 + i * 112 + iDelay + 10,
				actualDelay: iDelay, executionTime: 10
			});
		}
		// 10th observation: scheduledAt is BEFORE the previous timeout finished
		// Previous finishedAt = 1000 + 8*112 + 100 + 10 = 2006
		// This scheduledAt = 2000 → scheduleGap = (2000 - 1896) - 100 - 10 = -6 (negative)
		oTracker.register({
			delay: iDelay, func: sFuncStr, status: "FINISHED",
			scheduledAt: 2000, startedAt: 2100, finishedAt: 2110,
			actualDelay: iDelay, executionTime: 10
		});

		assert.ok(!oTracker.hasConsistentFrequency(sFuncStr, iDelay),
			"Negative schedule gap should prevent polling classification");
	});

	QUnit.test("Should track two different functions with the same delay independently", function (assert) {
		var oTracker = new FrequencyTracker();
		var sFuncA = "'function pollA() {}'";
		var sFuncB = "'function pollB() {}'";
		var iDelay = 100;

		// Function A: consistent gaps → should be polling (10 records for window)
		for (var i = 0; i < 10; i++) {
			oTracker.register({
				delay: iDelay, func: sFuncA, status: "FINISHED",
				scheduledAt: 1000 + i * 112,
				startedAt: 1000 + i * 112 + iDelay,
				finishedAt: 1000 + i * 112 + iDelay + 10,
				actualDelay: iDelay, executionTime: 10
			});
		}

		// Function B: wildly inconsistent gaps → should NOT be polling
		var aOffsetsB = [0, 112, 350, 400, 900];
		for (var j = 0; j < aOffsetsB.length; j++) {
			oTracker.register({
				delay: iDelay, func: sFuncB, status: "FINISHED",
				scheduledAt: 2000 + aOffsetsB[j],
				startedAt: 2000 + aOffsetsB[j] + iDelay,
				finishedAt: 2000 + aOffsetsB[j] + iDelay + 10,
				actualDelay: iDelay, executionTime: 10
			});
		}

		assert.ok(oTracker.hasConsistentFrequency(sFuncA, iDelay),
			"Function A with consistent gaps should be detected as polling");
		assert.ok(!oTracker.hasConsistentFrequency(sFuncB, iDelay),
			"Function B with inconsistent gaps should NOT be detected as polling (independent tracking)");
	});

	QUnit.test("Should NOT detect insufficient observations as polling", function (assert) {
		var oTracker = new FrequencyTracker();
		var sFuncStr = "'function poll() {}'";

		oTracker.register({
			delay: 100, func: sFuncStr, status: "FINISHED",
			scheduledAt: 1000, startedAt: 1100, finishedAt: 1110,
			actualDelay: 100, executionTime: 10
		});
		oTracker.register({
			delay: 100, func: sFuncStr, status: "TRACKED",
			scheduledAt: 1210
		});

		assert.ok(!oTracker.hasConsistentFrequency(sFuncStr, 100), "Too few observations should not be detected as polling");
	});

	QUnit.test("Should return correct window size for various delays using default config", function (assert) {
		// Default: minObservations=4, maxObservations=10, maxCollectionTime=4000
		// Formula: max(4, min(10, floor(4000/delay)))
		var oTracker = new FrequencyTracker();

		assert.strictEqual(oTracker._getCountRecordsToCheck(50), 10, "50ms delay -> 10 (capped by maxObservations)");
		assert.strictEqual(oTracker._getCountRecordsToCheck(100), 10, "100ms delay -> 10 (capped)");
		assert.strictEqual(oTracker._getCountRecordsToCheck(200), 10, "200ms delay -> 10 (capped)");
		assert.strictEqual(oTracker._getCountRecordsToCheck(400), 10, "400ms delay -> 10 (capped)");
		assert.strictEqual(oTracker._getCountRecordsToCheck(500), 8, "500ms delay -> 8");
		assert.strictEqual(oTracker._getCountRecordsToCheck(1000), 4, "1000ms delay -> 4");
		assert.strictEqual(oTracker._getCountRecordsToCheck(2000), 4, "2000ms delay -> 4 (floor from minObservations)");
		assert.strictEqual(oTracker._getCountRecordsToCheck(0), 4, "0ms delay -> 4 (falls back to minObservations)");
		assert.strictEqual(oTracker._getCountRecordsToCheck(-1), 4, "-1ms delay -> 4 (falls back to minObservations)");
	});

	QUnit.module("FrequencyTracker - Configurable Parameters");

	QUnit.test("Should compute window size from formula: max(minObs, min(maxObs, floor(maxCollTime / delay)))", function (assert) {
		// When config is passed to FrequencyTracker, the formula should replace anchor points.
		// Default: minObservations=3, maxObservations=10, maxCollectionTime=3000
		var oTracker = new FrequencyTracker({
			minObservations: 3,
			maxObservations: 10,
			maxCollectionTime: 3000
		});

		// delay=100: max(3, min(10, floor(3000/100))) = max(3, min(10, 30)) = 10
		assert.strictEqual(oTracker._getCountRecordsToCheck(100), 10, "100ms delay -> 10 (capped by maxObservations)");
		// delay=400: max(3, min(10, floor(3000/400))) = max(3, min(10, 7)) = 7
		assert.strictEqual(oTracker._getCountRecordsToCheck(400), 7, "400ms delay -> 7 (from formula)");
		// delay=1000: max(3, min(10, floor(3000/1000))) = max(3, min(10, 3)) = 3
		assert.strictEqual(oTracker._getCountRecordsToCheck(1000), 3, "1000ms delay -> 3 (floor from minObservations)");
	});

	QUnit.test("Should respect minObservations as floor for window size", function (assert) {
		var oTracker = new FrequencyTracker({
			minObservations: 5,
			maxObservations: 10,
			maxCollectionTime: 3000
		});

		// delay=1000: max(5, min(10, floor(3000/1000))) = max(5, min(10, 3)) = 5
		assert.strictEqual(oTracker._getCountRecordsToCheck(1000), 5,
			"1000ms delay with minObservations=5 -> 5 (not 3)");
		// delay=2000: max(5, min(10, floor(3000/2000))) = max(5, min(10, 1)) = 5
		assert.strictEqual(oTracker._getCountRecordsToCheck(2000), 5,
			"2000ms delay with minObservations=5 -> 5 (floor dominates)");
	});

	QUnit.test("Should respect maxObservations as cap for window size", function (assert) {
		var oTracker = new FrequencyTracker({
			minObservations: 3,
			maxObservations: 8,
			maxCollectionTime: 3000
		});

		// delay=100: max(3, min(8, floor(3000/100))) = max(3, min(8, 30)) = 8
		assert.strictEqual(oTracker._getCountRecordsToCheck(100), 8,
			"100ms delay with maxObservations=8 -> 8 (capped, not 10)");
		// delay=50: max(3, min(8, floor(3000/50))) = max(3, min(8, 60)) = 8
		assert.strictEqual(oTracker._getCountRecordsToCheck(50), 8,
			"50ms delay with maxObservations=8 -> 8 (capped)");
	});

	QUnit.test("Should adjust window size when maxCollectionTime changes", function (assert) {
		var oTracker = new FrequencyTracker({
			minObservations: 3,
			maxObservations: 15,
			maxCollectionTime: 5000
		});

		// delay=400: max(3, min(15, floor(5000/400))) = max(3, min(15, 12)) = 12
		assert.strictEqual(oTracker._getCountRecordsToCheck(400), 12,
			"400ms delay with maxCollectionTime=5000 -> 12");
		// delay=100: max(3, min(15, floor(5000/100))) = max(3, min(15, 50)) = 15
		assert.strictEqual(oTracker._getCountRecordsToCheck(100), 15,
			"100ms delay with maxCollectionTime=5000 and maxObservations=15 -> 15");
	});

	QUnit.test("Should use maxDeviation as tolerance floor in consistency check", function (assert) {
		// With maxDeviation=10 (default), gaps of 1-6ms should all pass because
		// all gaps are within 10ms of the mean.
		var oTrackerDefault = new FrequencyTracker({ maxDeviation: 10 });
		var sFuncStr = "'function poll() {}'";
		var iDelay = 100;

		// 10 records with small gaps: repeating pattern [1, 3, 2, 6, 1, 3, 2, 6, 1] — mean ≈ 2.6, all within 10ms
		var aGaps = [1, 3, 2, 6, 1, 3, 2, 6, 1];
		var fScheduledAt = 1000;
		oTrackerDefault.register({
			delay: iDelay, func: sFuncStr, status: "FINISHED",
			scheduledAt: fScheduledAt,
			startedAt: fScheduledAt + iDelay,
			finishedAt: fScheduledAt + iDelay + 10,
			actualDelay: iDelay, executionTime: 10
		});
		for (var i = 0; i < aGaps.length; i++) {
			fScheduledAt += iDelay + 10 + aGaps[i];
			oTrackerDefault.register({
				delay: iDelay, func: sFuncStr, status: "FINISHED",
				scheduledAt: fScheduledAt,
				startedAt: fScheduledAt + iDelay,
				finishedAt: fScheduledAt + iDelay + 10,
				actualDelay: iDelay, executionTime: 10
			});
		}

		assert.ok(oTrackerDefault.hasConsistentFrequency(sFuncStr, iDelay),
			"With maxDeviation=10, small gaps (1-6ms) should pass consistency check");

		// With maxDeviation=1, tolerance = 1ms.
		// Gap of 6ms deviates ~3.4ms from mean → exceeds 1ms → should fail
		var oTrackerStrict = new FrequencyTracker({ maxDeviation: 1 });

		fScheduledAt = 1000;
		oTrackerStrict.register({
			delay: iDelay, func: sFuncStr, status: "FINISHED",
			scheduledAt: fScheduledAt,
			startedAt: fScheduledAt + iDelay,
			finishedAt: fScheduledAt + iDelay + 10,
			actualDelay: iDelay, executionTime: 10
		});
		for (var j = 0; j < aGaps.length; j++) {
			fScheduledAt += iDelay + 10 + aGaps[j];
			oTrackerStrict.register({
				delay: iDelay, func: sFuncStr, status: "FINISHED",
				scheduledAt: fScheduledAt,
				startedAt: fScheduledAt + iDelay,
				finishedAt: fScheduledAt + iDelay + 10,
				actualDelay: iDelay, executionTime: 10
			});
		}

		assert.ok(!oTrackerStrict.hasConsistentFrequency(sFuncStr, iDelay),
			"With maxDeviation=1, same gaps should fail consistency check (gap of 6 deviates too far from mean)");
	});

	QUnit.test("Should use minObservations for fast re-detection after spike", function (assert) {
		var oTracker = new FrequencyTracker({
			minObservations: 3,
			maxObservations: 7,
			maxCollectionTime: 3000,
			maxDeviation: 10
		});
		var sFuncStr = "'function poll() {}'";
		var iDelay = 400;
		// Window size for 400ms: max(3, min(7, floor(3000/400))) = 7

		// Phase 1: Build up 7 consistent observations → polling detected
		var fBaseTime = 1000;
		for (var i = 0; i < 7; i++) {
			oTracker.register({
				delay: iDelay, func: sFuncStr, status: "FINISHED",
				scheduledAt: fBaseTime + i * (iDelay + 10 + 2),
				startedAt: fBaseTime + i * (iDelay + 10 + 2) + iDelay,
				finishedAt: fBaseTime + i * (iDelay + 10 + 2) + iDelay + 10,
				actualDelay: iDelay, executionTime: 10
			});
		}
		assert.ok(oTracker.hasConsistentFrequency(sFuncStr, iDelay),
			"Phase 1: Should be detected as polling after 7 consistent observations");

		// Phase 2: Add a spike (schedule gap = 100ms instead of ~2ms)
		var fSpikeTime = fBaseTime + 7 * (iDelay + 10 + 2) + 100;
		oTracker.register({
			delay: iDelay, func: sFuncStr, status: "FINISHED",
			scheduledAt: fSpikeTime,
			startedAt: fSpikeTime + iDelay,
			finishedAt: fSpikeTime + iDelay + 10,
			actualDelay: iDelay, executionTime: 10
		});
		assert.ok(!oTracker.hasConsistentFrequency(sFuncStr, iDelay),
			"Phase 2: Spike should break polling classification");

		// Phase 3: Add minObservations (3) consistent observations → should re-detect as polling
		// Start right after the spike so the first gap is also ~2ms
		var fResumeTime = fSpikeTime;
		for (var k = 0; k < 3; k++) {
			fResumeTime += (iDelay + 10 + 2);
			oTracker.register({
				delay: iDelay, func: sFuncStr, status: "FINISHED",
				scheduledAt: fResumeTime,
				startedAt: fResumeTime + iDelay,
				finishedAt: fResumeTime + iDelay + 10,
				actualDelay: iDelay, executionTime: 10
			});
		}
		assert.ok(oTracker.hasConsistentFrequency(sFuncStr, iDelay),
			"Phase 3: Should re-detect polling after only minObservations (3) consistent observations, not full window (7)");
	});

	QUnit.test("Should not break polling classification for gap within tolerance", function (assert) {
		var oTracker = new FrequencyTracker({
			minObservations: 3,
			maxObservations: 10,
			maxCollectionTime: 3000,
			maxDeviation: 10
		});
		var sFuncStr = "'function poll() {}'";
		var iDelay = 100;

		// Build 10 observations with consistent ~2ms gaps
		for (var i = 0; i < 10; i++) {
			oTracker.register({
				delay: iDelay, func: sFuncStr, status: "FINISHED",
				scheduledAt: 1000 + i * (iDelay + 10 + 2),
				startedAt: 1000 + i * (iDelay + 10 + 2) + iDelay,
				finishedAt: 1000 + i * (iDelay + 10 + 2) + iDelay + 10,
				actualDelay: iDelay, executionTime: 10
			});
		}
		assert.ok(oTracker.hasConsistentFrequency(sFuncStr, iDelay), "Should detect polling initially");

		// Add observation with gap = 8ms (within 10ms maxDeviation of mean ~2ms)
		var fTime = 1000 + 10 * (iDelay + 10 + 2) + 6; // 6ms extra gap
		oTracker.register({
			delay: iDelay, func: sFuncStr, status: "FINISHED",
			scheduledAt: fTime,
			startedAt: fTime + iDelay,
			finishedAt: fTime + iDelay + 10,
			actualDelay: iDelay, executionTime: 10
		});

		assert.ok(oTracker.hasConsistentFrequency(sFuncStr, iDelay),
			"Gap within maxDeviation tolerance should not break polling classification");
	});

	QUnit.test("Should require full window for first-time detection, not minObservations", function (assert) {
		var oTracker = new FrequencyTracker({
			minObservations: 3,
			maxObservations: 7,
			maxCollectionTime: 3000,
			maxDeviation: 10
		});
		var sFuncStr = "'function poll() {}'";
		var iDelay = 400;
		// Window for 400ms: max(3, min(7, floor(3000/400))) = 7

		// Add only 3 consistent observations (= minObservations but < full window of 7)
		for (var i = 0; i < 3; i++) {
			oTracker.register({
				delay: iDelay, func: sFuncStr, status: "FINISHED",
				scheduledAt: 1000 + i * (iDelay + 10 + 2),
				startedAt: 1000 + i * (iDelay + 10 + 2) + iDelay,
				finishedAt: 1000 + i * (iDelay + 10 + 2) + iDelay + 10,
				actualDelay: iDelay, executionTime: 10
			});
		}

		assert.ok(!oTracker.hasConsistentFrequency(sFuncStr, iDelay),
			"3 observations should NOT be enough for first-time detection when full window is 7");

		// Add up to 7 observations
		for (var j = 3; j < 7; j++) {
			oTracker.register({
				delay: iDelay, func: sFuncStr, status: "FINISHED",
				scheduledAt: 1000 + j * (iDelay + 10 + 2),
				startedAt: 1000 + j * (iDelay + 10 + 2) + iDelay,
				finishedAt: 1000 + j * (iDelay + 10 + 2) + iDelay + 10,
				actualDelay: iDelay, executionTime: 10
			});
		}

		assert.ok(oTracker.hasConsistentFrequency(sFuncStr, iDelay),
			"7 observations should be enough for first-time detection");
	});

	QUnit.test("Should stay non-polling during multiple consecutive spikes", function (assert) {
		var oTracker = new FrequencyTracker({
			minObservations: 3,
			maxObservations: 7,
			maxCollectionTime: 3000,
			maxDeviation: 10
		});
		var sFuncStr = "'function poll() {}'";
		var iDelay = 400;
		var fTime = 1000;
		var iInterval = iDelay + 10 + 2; // consistent: gap ≈ 2ms

		// Phase 1: Establish polling with 7 consistent observations
		for (var i = 0; i < 7; i++) {
			oTracker.register({
				delay: iDelay, func: sFuncStr, status: "FINISHED",
				scheduledAt: fTime,
				startedAt: fTime + iDelay,
				finishedAt: fTime + iDelay + 10,
				actualDelay: iDelay, executionTime: 10
			});
			fTime += iInterval;
		}
		assert.ok(oTracker.hasConsistentFrequency(sFuncStr, iDelay), "Phase 1: Polling established");

		// Phase 2: Three consecutive spikes with VARYING extra gaps
		// Different spike sizes ensure the last 3 records are not consistent with each other
		var aSpikeExtras = [50, 150, 80];
		for (var j = 0; j < 3; j++) {
			fTime += aSpikeExtras[j]; // spike: varying extra gap
			oTracker.register({
				delay: iDelay, func: sFuncStr, status: "FINISHED",
				scheduledAt: fTime,
				startedAt: fTime + iDelay,
				finishedAt: fTime + iDelay + 10,
				actualDelay: iDelay, executionTime: 10
			});
			assert.ok(!oTracker.hasConsistentFrequency(sFuncStr, iDelay),
				"Phase 2, spike " + (j + 1) + ": Should remain non-polling during consecutive spikes");
			fTime += iInterval;
		}

		// Phase 3: Resume with consistent observations → should re-detect after minObservations
		for (var k = 0; k < 3; k++) {
			oTracker.register({
				delay: iDelay, func: sFuncStr, status: "FINISHED",
				scheduledAt: fTime,
				startedAt: fTime + iDelay,
				finishedAt: fTime + iDelay + 10,
				actualDelay: iDelay, executionTime: 10
			});
			fTime += iInterval;
		}
		assert.ok(oTracker.hasConsistentFrequency(sFuncStr, iDelay),
			"Phase 3: Should re-detect polling after consistent observations resume");
	});

	QUnit.module("FrequencyTracker - Cleared Timeouts");

	QUnit.test("Should break consistency when a cleared record is in the observation window", function (assert) {
		var oTracker = new FrequencyTracker({
			minObservations: 3,
			maxObservations: 10,
			maxCollectionTime: 3000,
			maxDeviation: 10
		});
		var sFuncStr = "'function poll() {}'";
		var iDelay = 100;
		var iInterval = iDelay + 10 + 2; // consistent gap of ~2ms

		// Register 10 records: 5 executed, 1 cleared, 4 executed
		for (var i = 0; i < 10; i++) {
			var oRecord = {
				delay: iDelay, func: sFuncStr,
				scheduledAt: 1000 + i * iInterval,
				status: "FINISHED",
				startedAt: 1000 + i * iInterval + iDelay,
				finishedAt: 1000 + i * iInterval + iDelay + 10
			};
			if (i === 5) {
				// Simulate clearTimeout: status is CLEARED, no execution timestamps
				oRecord.status = "CLEARED";
				delete oRecord.startedAt;
				delete oRecord.finishedAt;
			}
			oTracker.register(oRecord);
		}

		assert.ok(!oTracker.hasConsistentFrequency(sFuncStr, iDelay),
			"A cleared record in the observation window should break the consistency check");
	});

	QUnit.module("FrequencyTracker - updateConfig");

	QUnit.test("Should preserve accumulated observations when config is updated", function (assert) {
		var oTracker = new FrequencyTracker({
			minObservations: 3,
			maxObservations: 10,
			maxCollectionTime: 3000,
			maxDeviation: 10
		});
		var sFuncStr = "'function poll() {}'";
		var iDelay = 100;

		// Build up 10 consistent observations → polling detected
		for (var i = 0; i < 10; i++) {
			oTracker.register({
				delay: iDelay, func: sFuncStr, status: "FINISHED",
				scheduledAt: 1000 + i * (iDelay + 10 + 2),
				startedAt: 1000 + i * (iDelay + 10 + 2) + iDelay,
				finishedAt: 1000 + i * (iDelay + 10 + 2) + iDelay + 10,
				actualDelay: iDelay, executionTime: 10
			});
		}
		assert.ok(oTracker.hasConsistentFrequency(sFuncStr, iDelay),
			"Should detect polling before config update");

		// Update config — observations must survive
		oTracker.updateConfig({
			minObservations: 3,
			maxObservations: 10,
			maxCollectionTime: 3000,
			maxDeviation: 5
		});

		var aHistory = oTracker._oStore.getRecords(sFuncStr, iDelay);
		assert.strictEqual(aHistory.length, 10,
			"All 10 observations should still be present after updateConfig");
		assert.ok(oTracker.hasConsistentFrequency(sFuncStr, iDelay),
			"Polling should still be detected using preserved observations");
	});

	QUnit.module("FrequencyTracker - Ongoing Detection");

	QUnit.test("Should incrementally maintain polling classification", function (assert) {
		var oTracker = new FrequencyTracker();
		var sFuncStr = "'function poll() {}'";
		var iDelay = 100;

		// Build up enough records so that polling is detected (10 for delay=100)
		for (var i = 0; i < 10; i++) {
			oTracker.register({
				delay: iDelay, func: sFuncStr, status: "FINISHED",
				scheduledAt: 1000 + i * 210,
				startedAt: 1000 + i * 210 + iDelay,
				finishedAt: 1000 + i * 210 + iDelay + 10,
				actualDelay: iDelay, executionTime: 10
			});
		}

		// At this point it should be polling
		var bIsPolling = oTracker.hasConsistentFrequency(sFuncStr, iDelay);
		assert.ok(bIsPolling, "Should be detected as polling after 10 observations");

		// Add one more and verify compiled statistics are used
		oTracker.register({
			delay: iDelay, func: sFuncStr, status: "FINISHED",
			scheduledAt: 1000 + 10 * 210,
			startedAt: 1000 + 10 * 210 + iDelay,
			finishedAt: 1000 + 10 * 210 + iDelay + 10,
			actualDelay: iDelay, executionTime: 10
		});

		bIsPolling = oTracker.hasConsistentFrequency(sFuncStr, iDelay);
		assert.ok(bIsPolling, "Should still be detected as polling after adding more observations");

		// Verify the isConsistent flag is set on the last record
		var aHistory = oTracker._oStore.getRecords(sFuncStr, iDelay);
		var oLastRecord = aHistory[aHistory.length - 1];
		assert.ok(oLastRecord.hasConsistentFrequency,
			"Last record should be marked as consistent");
	});
});
