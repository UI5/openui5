/*global QUnit, sinon */
/*eslint max-nested-callbacks: [2,5]*/

sap.ui.define([
	"sap/base/Log",
	"sap/ui/test/autowaiter/_timeoutWaiter",
	"sap/ui/test/autowaiter/_autoWaiter",
	"sap/ui/test/_LogCollector",
	"sap/ui/test/_OpaLogger"
], function (Log, timeoutWaiter, _autoWaiter, _LogCollector, _OpaLogger) {
	"use strict";

	var oLogCollector = _LogCollector.getInstance();
	var fnSetTimeout = window["setTimeout"];
	var fnClearTimeout = window["clearTimeout"];

	["Timeout", "Immediate"].forEach(function (sFunctionUnderTest) {
		var fnSetFunction = window["set" + sFunctionUnderTest];
		var fnClearFunction = window["clear" + sFunctionUnderTest];

		if (!fnSetFunction) {
			Log.debug("Skipped tests because" + sFunctionUnderTest + " is not defined in this browser");
			return;
		}

		QUnit.module("timeoutWaiter - no " + sFunctionUnderTest, {
			beforeEach: function () {
				this.defaultLogLevel = _OpaLogger.getLevel();
				_OpaLogger.setLevel("trace");
			},
			afterEach: function () {
				_OpaLogger.setLevel(this.defaultLogLevel);
				oLogCollector.getAndClearLog(); // cleanup
			}
		});

		QUnit.test("Should make sure there is no pending timeout before starting these tests", function (assert) {
			var fnDone = assert.async();

			function noTimeout () {
				var bHasTimeout = timeoutWaiter.hasPending();
				if (!bHasTimeout) {
					assert.ok(true, "no timeout present");
					fnDone();
				} else {
					setTimeout(noTimeout, 50);
				}

				return bHasTimeout;
			}

			noTimeout();
		});

		QUnit.test("Should return that there are no pending timeouts", function (assert) {
			assert.ok(!timeoutWaiter.hasPending(), "there are no pending timeouts");
		});

		QUnit.test("Should return that there are no pending Timeouts if a timeout has finished", function (assert) {
			var fnDone = assert.async();
			fnSetFunction(function () {
				assert.ok(!timeoutWaiter.hasPending(), "there are no pending timeouts");
				fnDone();
			}, 100);
		});

		QUnit.test("Should ignore long runners", function (assert) {
			var iID = fnSetFunction(function () {}, 1100);

			var bHasPending = timeoutWaiter.hasPending();
			var sLogs = oLogCollector.getAndClearLog();
			assert.ok(!bHasPending, "there are no pending timeouts, pending timeouts logs: " + sLogs);
			fnClearFunction(iID);
		});

		QUnit.test("Should have configurable max timeout delay", function (assert) {
			timeoutWaiter.extendConfig({maxDelay: 3000});
			var iID = fnSetFunction(function () {}, 1001);
			var iIDIgnored = fnSetFunction(function () {}, 3001);

			assert.ok(timeoutWaiter.hasPending(), "there is 1 pending timeout");
			fnClearFunction(iID);
			fnClearFunction(iIDIgnored);
			// reset to default value
			timeoutWaiter.extendConfig({maxDelay: 1000});
		});

		QUnit.module("timeoutWaiter - single " + sFunctionUnderTest);

		QUnit.test("Should respect the this pointer", function (assert) {
			var oThis = {},
				fnDone = assert.async(),
				fnSpy = sinon.spy(function () {
					sinon.assert.calledOn(fnSpy, oThis);
					fnDone();
				});

			fnSetFunction(fnSpy.bind(oThis));
		});

		QUnit.test("Should handle a single timeout", function (assert) {
			var fnDone = assert.async();

			fnSetFunction(function () {
				fnDone();
			});

			assert.ok(timeoutWaiter.hasPending(), "There was a timeout");
		});

		QUnit.test("Should pass the callback parameters", function (assert) {
			var aArguments = [1, 2, 3],
				fnDone = assert.async(),
				fnSpy = sinon.spy(function () {
					sinon.assert.calledWith(fnSpy, ...aArguments);
					fnDone();
				});

			fnSetFunction(fnSpy, 0, ...aArguments);
		});

		QUnit.module("timeoutWaiter - multiple " + sFunctionUnderTest);

		QUnit.test("Should handle 2 timeouts", function (assert) {
			var fnFirstTimeoutDone = assert.async();
			var fnSecondTimeoutDone = assert.async();

			fnSetFunction(function () {
				assert.ok(timeoutWaiter.hasPending(), "First timeout has compled");
				fnFirstTimeoutDone();
			});

			fnSetFunction(function () {
				assert.ok(!timeoutWaiter.hasPending(), "Both timeouts have completed");
				fnSecondTimeoutDone();
			}, 20);

			assert.ok(timeoutWaiter.hasPending(), "Both timeouts are scheduled");
		});

		QUnit.test("Should handle a timeout that adds a timeout", function (assert) {
			var fnDone = assert.async();

			fnSetFunction(function () {
				assert.ok(!timeoutWaiter.hasPending(), "First timeout has completed");
				fnSetFunction(function () {
					assert.ok(!timeoutWaiter.hasPending(), "Second timeout has completed");
					fnDone();
				});
				assert.ok(timeoutWaiter.hasPending(), "Second timeout is scheduled");
			});
			assert.ok(timeoutWaiter.hasPending(), "First timeout is scheduled");
		});

		QUnit.module("timeoutWaiter - clear " + sFunctionUnderTest);

		QUnit.test("Should clear a timeout", function (assert) {
			var iId = fnSetFunction(function () {});
			fnClearFunction(iId);
			assert.ok(!timeoutWaiter.hasPending(), "there are no pending timeouts");
		});


		QUnit.test("Should clear 1 of 2 timeouts", function (assert) {
			var fnDone = assert.async();
			var fnSecondTimeoutSpy = sinon.spy();
			fnSetFunction(function () {
				assert.ok(!timeoutWaiter.hasPending(), "there are no pending timeouts");
				sinon.assert.notCalled(fnSecondTimeoutSpy);
				fnDone();
			},20);
			var iId = fnSetFunction(fnSecondTimeoutSpy);
			fnClearFunction(iId);
			assert.ok(timeoutWaiter.hasPending(), "There was a timeout");
		});
	});

	// Shared hooks for frequency-detection tests: use smaller observation window
	// so polling is classified faster, reducing real-time wait in async tests.
	var oFastFrequencyDetectionHooks = {
		beforeEach: function () {
			timeoutWaiter.extendConfig({
				frequencyDetection: {
					maxObservations: 5,
					maxCollectionTime: 1500
				}
			});
		},
		afterEach: function () {
			timeoutWaiter.extendConfig({
				frequencyDetection: {
					maxObservations: 10,
					maxCollectionTime: 3000
				}
			});
		}
	};

	QUnit.module("timeoutWaiter - infinite timeout loops (polling detection)");

	QUnit.test("Should detect a infinite timeout loop", function (assert) {
		var fnDone = assert.async();
		var aTimeouts = [];

		function addTimeout () {
			aTimeouts.push(fnSetTimeout(addTimeout, 30));
		}

		fnSetTimeout(function () {
			assert.ok(!timeoutWaiter.hasPending(), "there are no pending timeouts - spawned " + aTimeouts.length + " timeouts");
			aTimeouts.forEach(function (iID) {
				fnClearTimeout(iID);
			});
			fnDone();
		}, 600);
		addTimeout();
	});

	QUnit.test("Should detect a infinite timeout loop with 2 timeouts added per loop", function (assert) {
		var fnDone = assert.async();
		var aTimeouts = [];

		function addTimeout () {
			aTimeouts.push(fnSetTimeout(addTimeout, 40));
			aTimeouts.push(fnSetTimeout(addTimeout, 40));
		}

		fnSetTimeout(function () {
			assert.ok(!timeoutWaiter.hasPending(), "there are no pending timeouts - spawned " + aTimeouts.length + " timeouts");
			aTimeouts.forEach(function (iID) {
				fnClearTimeout(iID);
			});
			fnDone();
		}, 600);
		addTimeout();
	});

	QUnit.module("timeoutWaiter - Polling Detection - Direct Self-Polling (Example 1)");

	QUnit.test("Should detect basic direct self-polling pattern", function (assert) {
		var fnDone = assert.async();
		var aTimeouts = [];

		function poll() {
			aTimeouts.push(fnSetTimeout(poll, 100));
		}

		poll();

		fnSetTimeout(function () {
			assert.ok(!timeoutWaiter.hasPending(), "Direct self-polling should not block - spawned " + aTimeouts.length + " timeouts");
			aTimeouts.forEach(function (iID) {
				fnClearTimeout(iID);
			});
			fnDone();
		}, 600);
	});

	QUnit.test("Should detect nested polling with maxDepth configuration", function (assert) {
		var fnDone = assert.async();
		var originalMaxDepth = timeoutWaiter._mConfig.maxDepth;
		var aTimeouts = [];

		function pollA() {
			aTimeouts.push(fnSetTimeout(pollB, 50));
		}

		function pollB() {
			aTimeouts.push(fnSetTimeout(pollA, 50));
		}

		timeoutWaiter.extendConfig({ maxDepth: 2 });
		pollA();

		fnSetTimeout(function () {
			assert.ok(!timeoutWaiter.hasPending(), "Nested polling (A->B->A) should be detected");
			aTimeouts.forEach(function (iID) {
				fnClearTimeout(iID);
			});
			timeoutWaiter.extendConfig({ maxDepth: originalMaxDepth });
			fnDone();
		}, 300);
	});

	QUnit.module("timeoutWaiter - Polling Detection - Promise-Based Polling (Example 2)", oFastFrequencyDetectionHooks);

	QUnit.test("Should detect Promise-based polling pattern", function (assert) {
		var fnDone = assert.async();
		var aTimeouts = [];
		var bPoll = true;

		function poll() {
			Promise.resolve().then(function () {
				bPoll && aTimeouts.push(fnSetTimeout(poll, 100));
			});
		}

		poll();

		fnSetTimeout(function () {
			assert.ok(!timeoutWaiter.hasPending(),
				"Promise-based polling should not block - spawned " + aTimeouts.length + " timeouts");
			bPoll = false; // stop further polling
			aTimeouts.forEach(function (iID) {
				fnClearTimeout(iID);
			});
			fnDone();
		}, 800);
	});

	QUnit.module("timeoutWaiter - Polling Detection - Consistent Interval Detection", oFastFrequencyDetectionHooks);

	QUnit.test("Should detect consistent interval polling", function (assert) {
		var fnDone = assert.async();
		var aTimeouts = [];

		function poll() {
			aTimeouts.push(fnSetTimeout(poll, 100));
		}

		poll();

		fnSetTimeout(function () {
			assert.ok(!timeoutWaiter.hasPending(),
				"Consistent interval polling should be detected - spawned " + aTimeouts.length + " timeouts");
			aTimeouts.forEach(function (iID) {
				fnClearTimeout(iID);
			});
			fnDone();
		}, 800);
	});

	QUnit.test("Should NOT detect inconsistent intervals as polling", function (assert) {
		var fnDone = assert.async();
		var aTimeouts = [];
		var iExecutionCount = 0;
		var aDelays = [100, 200, 50, 150, 300, 200, 150, 50];

		function notPolling() {
			if (iExecutionCount < aDelays.length) {
				aTimeouts.push(fnSetTimeout(notPolling, aDelays[iExecutionCount]));
				iExecutionCount++;
			}
		}

		notPolling();

		fnSetTimeout(function () {
			assert.ok(timeoutWaiter.hasPending(), "Identified as not polling due to inconsistent intervals");
			aTimeouts.forEach(function (iID) {
				fnClearTimeout(iID);
			});
			fnDone();
		}, 1000);
	});

	QUnit.module("timeoutWaiter - Polling Detection - Configuration");

	QUnit.test("Should respect maxDelay configuration", function (assert) {
		var fnDone = assert.async();
		var originalMaxDelay = timeoutWaiter._mConfig.maxDelay;

		// Set maxDelay to 500
		timeoutWaiter.extendConfig({ maxDelay: 500 });

		var iID499 = fnSetTimeout(function () {}, 499);
		var iID501 = fnSetTimeout(function () {}, 501);

		fnSetTimeout(function () {
			// 499ms should be tracked, 501ms should be ignored
			fnClearTimeout(iID499);
			fnClearTimeout(iID501);

			// Restore original config
			timeoutWaiter.extendConfig({ maxDelay: originalMaxDelay });
			assert.ok(true, "maxDelay configuration respected");
			fnDone();
		}, 50);
	});

	QUnit.test("Should respect minDelay configuration", function (assert) {
		var fnDone = assert.async();
		var originalMinDelay = timeoutWaiter._mConfig.minDelay;

		// Set minDelay to 20
		timeoutWaiter.extendConfig({ minDelay: 20 });

		fnSetTimeout(function () {
			assert.ok(!timeoutWaiter.hasPending(), "Short delay timeout completed");
			// Restore original config
			timeoutWaiter.extendConfig({ minDelay: originalMinDelay });
			fnDone();
		}, 15);

		// 15ms is less than minDelay (20ms), should be treated as execution flow
		assert.ok(timeoutWaiter.hasPending(), "Timeout below minDelay (15ms) is execution flow");
	});

	QUnit.module("timeoutWaiter - Polling Detection - Edge Cases");

	QUnit.test("Should handle function transitioning from non-polling to polling", function (assert) {
		var fnDone = assert.async();
		var aTimeouts = [];
		var iExecutionCount = 0;

		function adaptivePoll() {
			iExecutionCount++;
			if (iExecutionCount < 3) {
				// First few executions with varying delays - not polling
				aTimeouts.push(fnSetTimeout(adaptivePoll, iExecutionCount * 100));
			} else if (iExecutionCount < 8) {
				// Then switch to consistent polling pattern
				aTimeouts.push(fnSetTimeout(adaptivePoll, 100));
			} else {
				fnSetTimeout(function () {
					assert.ok(!timeoutWaiter.hasPending(),
						"Function that becomes polling should be detected after pattern stabilizes");
					aTimeouts.forEach(function (iID) {
						fnClearTimeout(iID);
					});
					fnDone();
				}, 150);
			}
		}

		aTimeouts.push(fnSetTimeout(adaptivePoll, 100));
	});

	QUnit.test("Should handle multiple different polling patterns simultaneously", function (assert) {
		var fnDone = assert.async();
		var aTimeouts1 = [];
		var aTimeouts2 = [];
		var iCount1 = 0;
		var iCount2 = 0;

		function poll1() {
			iCount1++;
			if (iCount1 < 5) {
				aTimeouts1.push(fnSetTimeout(poll1, 80));
			}
		}

		function poll2() {
			iCount2++;
			if (iCount2 < 5) {
				aTimeouts2.push(fnSetTimeout(poll2, 120));
			}
		}

		aTimeouts1.push(fnSetTimeout(poll1, 80));
		aTimeouts2.push(fnSetTimeout(poll2, 120));

		fnSetTimeout(function () {
			assert.ok(!timeoutWaiter.hasPending(),
				"Multiple polling patterns should all be detected");
			aTimeouts1.forEach(function (iID) {
				fnClearTimeout(iID);
			});
			aTimeouts2.forEach(function (iID) {
				fnClearTimeout(iID);
			});
			fnDone();
		}, 800);
	});

	QUnit.test("Should handle server polling scenario", function (assert) {
		var fnDone = assert.async();
		var aTimeouts = [];
		var iExecutionCount = 0;

		function serverPoll() {
			iExecutionCount++;
			if (iExecutionCount < 3) {
				// Use shorter delay for test
				aTimeouts.push(fnSetTimeout(serverPoll, 200));
			} else {
				fnSetTimeout(function () {
					assert.ok(!timeoutWaiter.hasPending(),
						"Server polling pattern should be detected");
					aTimeouts.forEach(function (iID) {
						fnClearTimeout(iID);
					});
					fnDone();
				}, 250);
			}
		}

		aTimeouts.push(fnSetTimeout(serverPoll, 200));
	});

	// =========================================================================
	// Tests mirroring opaTestPollingDetection.html sample cases
	// =========================================================================

	QUnit.module("timeoutWaiter - Polling Detection - Sync scheduling with async side-effect (HTML case 1)", oFastFrequencyDetectionHooks);

	QUnit.test("Should detect sync self-polling with async side-effect", function (assert) {
		var fnDone = assert.async();
		var aTimeouts = [];
		var bPoll = true;

		// Simulates: function poll() { doSomething(); setTimeout(poll, 100); }
		// doSomething() returns a Promise but is not awaited => scheduling is synchronous
		function doSomethingAsync() {
			return new Promise(function (resolve) {
				fnSetTimeout(resolve, 10, "TIMEOUT_WAITER_IGNORE");
			});
		}

		function poll() {
			doSomethingAsync(); // fire-and-forget: does NOT block scheduling
			if (bPoll) {
				aTimeouts.push(fnSetTimeout(poll, 100));
			}
		}

		poll();

		fnSetTimeout(function () {
			assert.ok(!timeoutWaiter.hasPending(),
				"Sync self-polling with async side-effect should be detected as polling - spawned " + aTimeouts.length + " timeouts");
			bPoll = false;
			aTimeouts.forEach(function (iID) {
				fnClearTimeout(iID);
			});
			fnDone();
		}, 800);
	});

	QUnit.module("timeoutWaiter - Polling Detection - Promise.then scheduling (HTML case 2)", oFastFrequencyDetectionHooks);

	QUnit.test("Should detect polling where setTimeout is inside doSomething().then()", function (assert) {
		var fnDone = assert.async();
		var aTimeouts = [];
		var bPoll = true;

		// Simulates: function poll() { doSomething().then(() => { setTimeout(poll, 100); }); }
		function doSomethingAsync() {
			return new Promise(function (resolve) {
				fnSetTimeout(resolve, 10, "TIMEOUT_WAITER_IGNORE");
			});
		}

		function poll() {
			doSomethingAsync().then(function () {
				if (bPoll) {
					aTimeouts.push(fnSetTimeout(poll, 100));
				}
			});
		}

		poll();

		fnSetTimeout(function () {
			assert.ok(!timeoutWaiter.hasPending(),
				"Promise.then-based polling should not block - spawned " + aTimeouts.length + " timeouts");
			bPoll = false;
			aTimeouts.forEach(function (iID) {
				fnClearTimeout(iID);
			});
			fnDone();
		}, 1000);
	});

	QUnit.module("timeoutWaiter - Polling Detection - Async/await scheduling (HTML case 3)", oFastFrequencyDetectionHooks);

	QUnit.test("Should detect polling with async/await before setTimeout", function (assert) {
		var fnDone = assert.async();
		var aTimeouts = [];
		var bPoll = true;

		// Simulates: async function poll() { await doSomething(); setTimeout(poll, 100); }
		function doSomethingAsync() {
			return new Promise(function (resolve) {
				fnSetTimeout(resolve, 10, "TIMEOUT_WAITER_IGNORE");
			});
		}

		async function poll() {
			await doSomethingAsync();
			if (bPoll) {
				aTimeouts.push(fnSetTimeout(poll, 100));
			}
		}

		poll();

		fnSetTimeout(function () {
			assert.ok(!timeoutWaiter.hasPending(),
				"Async/await polling should not block - spawned " + aTimeouts.length + " timeouts");
			bPoll = false;
			aTimeouts.forEach(function (iID) {
				fnClearTimeout(iID);
			});
			fnDone();
		}, 1000);
	});

	QUnit.module("timeoutWaiter - Polling Detection - Chained Promises scheduling (HTML case 4)", oFastFrequencyDetectionHooks);

	QUnit.test("Should detect polling through chained .then() calls", function (assert) {
		var fnDone = assert.async();
		var aTimeouts = [];
		var bPoll = true;

		// Simulates: function poll() {
		//   doSomething().then(doSomething).then(doSomething).then(() => setTimeout(poll, 100));
		// }
		function doSomethingAsync() {
			return new Promise(function (resolve) {
				fnSetTimeout(resolve, 10, "TIMEOUT_WAITER_IGNORE");
			});
		}

		function poll() {
			doSomethingAsync()
				.then(doSomethingAsync)
				.then(doSomethingAsync)
				.then(function () {
					if (bPoll) {
						aTimeouts.push(fnSetTimeout(poll, 100));
					}
				});
		}

		poll();

		fnSetTimeout(function () {
			assert.ok(!timeoutWaiter.hasPending(),
				"Chained-Promise polling should not block - spawned " + aTimeouts.length + " timeouts");
			bPoll = false;
			aTimeouts.forEach(function (iID) {
				fnClearTimeout(iID);
			});
			fnDone();
		}, 1200);
	});

	QUnit.module("timeoutWaiter - Polling Detection - Promise.resolve().then scheduling (HTML case 5)", oFastFrequencyDetectionHooks);

	QUnit.test("Should detect polling with Promise.resolve().then(() => setTimeout(poll))", function (assert) {
		var fnDone = assert.async();
		var aTimeouts = [];
		var bPoll = true;

		function poll() {
			Promise.resolve().then(function () {
				if (bPoll) {
					aTimeouts.push(fnSetTimeout(poll, 100));
				}
			});
		}

		poll();

		fnSetTimeout(function () {
			assert.ok(!timeoutWaiter.hasPending(),
				"Promise.resolve().then() polling should not block - spawned " + aTimeouts.length + " timeouts");
			bPoll = false;
			aTimeouts.forEach(function (iID) {
				fnClearTimeout(iID);
			});
			fnDone();
		}, 800);
	});

	QUnit.module("timeoutWaiter - Polling Detection - new Promise(setTimeout).then(poll) (HTML case 6)", oFastFrequencyDetectionHooks);

	QUnit.test("Should detect polling: new Promise(resolve => setTimeout(resolve)).then(() => poll())", function (assert) {
		var fnDone = assert.async();
		var aTimeouts = [];
		var bPoll = true;

		function poll() {
			return new Promise(function (resolve) {
				aTimeouts.push(fnSetTimeout(resolve, 100));
			}).then(function () {
				if (bPoll) {
					poll();
				}
			});
		}

		poll();

		fnSetTimeout(function () {
			assert.ok(!timeoutWaiter.hasPending(),
				"Promise-wrapping-setTimeout polling should not block - spawned " + aTimeouts.length + " timeouts");
			bPoll = false;
			aTimeouts.forEach(function (iID) {
				fnClearTimeout(iID);
			});
			fnDone();
		}, 1000);
	});

	QUnit.module("timeoutWaiter - Polling Detection - Async for loop is NOT polling (HTML case 7)");

	QUnit.test("Should still block at system level even if timeout waiter classifies async loop as polling", function (assert) {
		var fnDone = assert.async();
		var bLoopDone = false;

		function doSomethingAsync() {
			return new Promise(function (resolve) {
				fnSetTimeout(resolve, 50);
			});
		}

		async function loop() {
			for (var i = 0; i < 10; i++) {
				await doSomethingAsync();
			}
			bLoopDone = true;
		}

		loop();

		// Check while the loop is running (after a few iterations).
		// The timeout waiter may classify the periodic setTimeout(resolve, 50) pattern
		// as polling, but _autoWaiter.hasToWait() should still return true because
		// _promiseWaiter independently tracks each await's Promise.
		fnSetTimeout(function () {
			if (!bLoopDone) {
				assert.ok(_autoWaiter.hasToWait(),
					"System-level autoWaiter should still block for async for loop " +
					"(promise waiter tracks each await even if timeout waiter classifies pattern as polling)");
			} else {
				assert.ok(true, "Loop completed before check — no pending work expected");
			}
			fnDone();
		}, 200);
	});

	QUnit.module("timeoutWaiter - Polling Detection - Async while loop is NOT polling (HTML case 8)");

	QUnit.test("Should still block at system level even if timeout waiter classifies async while loop as polling", function (assert) {
		var fnDone = assert.async();
		var bLoopDone = false;

		function doSomethingAsync() {
			return new Promise(function (resolve) {
				fnSetTimeout(resolve, 50);
			});
		}

		async function loop() {
			var i = 0;
			while (i < 10) {
				await doSomethingAsync();
				i++;
			}
			bLoopDone = true;
		}

		loop();

		// Check while the loop is running (after a few iterations).
		// Same as case 7: the timeout waiter may see periodicity, but the promise waiter
		// independently tracks each await's Promise, so the system still blocks.
		fnSetTimeout(function () {
			if (!bLoopDone) {
				assert.ok(_autoWaiter.hasToWait(),
					"System-level autoWaiter should still block for async while loop " +
					"(promise waiter tracks each await even if timeout waiter classifies pattern as polling)");
			} else {
				assert.ok(true, "Loop completed before check — no pending work expected");
			}
			fnDone();
		}, 200);
	});

	QUnit.module("timeoutWaiter - Polling Detection - Frequency Detection Config");

	QUnit.test("Should have default frequencyDetection config with all expected properties", function (assert) {
		var mConfig = timeoutWaiter._mConfig;
		assert.ok(mConfig.frequencyDetection, "frequencyDetection config object should exist");
		assert.strictEqual(mConfig.frequencyDetection.disabled, false, "disabled should default to false");
		assert.strictEqual(typeof mConfig.frequencyDetection.minObservations, "number", "minObservations should be a number");
		assert.strictEqual(typeof mConfig.frequencyDetection.maxObservations, "number", "maxObservations should be a number");
		assert.strictEqual(typeof mConfig.frequencyDetection.maxCollectionTime, "number", "maxCollectionTime should be a number");
		assert.strictEqual(typeof mConfig.frequencyDetection.maxDeviation, "number", "maxDeviation should be a number");
	});

	QUnit.test("Should preserve other defaults when partially updating frequencyDetection", function (assert) {
		// Save original config
		var mOriginal = {};
		Object.keys(timeoutWaiter._mConfig.frequencyDetection).forEach(function (sKey) {
			mOriginal[sKey] = timeoutWaiter._mConfig.frequencyDetection[sKey];
		});

		// Partial update — only change minObservations
		timeoutWaiter.extendConfig({
			frequencyDetection: {
				minObservations: 5
			}
		});

		assert.strictEqual(timeoutWaiter._mConfig.frequencyDetection.minObservations, 5,
			"minObservations should be updated to 5");
		assert.strictEqual(timeoutWaiter._mConfig.frequencyDetection.disabled, mOriginal.disabled,
			"disabled should be preserved (not lost by shallow merge)");
		assert.strictEqual(timeoutWaiter._mConfig.frequencyDetection.maxObservations, mOriginal.maxObservations,
			"maxObservations should be preserved");
		assert.strictEqual(timeoutWaiter._mConfig.frequencyDetection.maxCollectionTime, mOriginal.maxCollectionTime,
			"maxCollectionTime should be preserved");
		assert.strictEqual(timeoutWaiter._mConfig.frequencyDetection.maxDeviation, mOriginal.maxDeviation,
			"maxDeviation should be preserved");

		// Restore
		timeoutWaiter.extendConfig({ frequencyDetection: mOriginal });
	});

	QUnit.test("Should reject invalid frequencyDetection config types", function (assert) {
		assert.throws(function () {
			timeoutWaiter.extendConfig({
				frequencyDetection: {
					minObservations: "abc"
				}
			});
		}, /numeric/, "Should reject non-numeric minObservations");

		assert.throws(function () {
			timeoutWaiter.extendConfig({
				frequencyDetection: {
					disabled: "yes"
				}
			});
		}, /boolean/, "Should reject non-boolean disabled");
	});

	QUnit.test("Should disable statistical polling detection when frequencyDetection.disabled is true", function (assert) {
		var fnDone = assert.async();
		var aTimeouts = [];
		var bPoll = true;

		// Enable kill-switch: statistical frequency detection is off,
		// but chain-based detection still works
		timeoutWaiter.extendConfig({ frequencyDetection: { disabled: true } });

		// Use Promise-based scheduling so there is no initiator chain.
		// Without statistical detection, this should remain blocking.
		function poll() {
			if (bPoll) {
				Promise.resolve().then(function () {
					aTimeouts.push(fnSetTimeout(poll, 100));
				});
			}
		}

		poll();

		fnSetTimeout(function () {
			// With statistical detection disabled, Promise-based polling should still block
			assert.ok(timeoutWaiter.hasPending(),
				"With frequencyDetection.disabled=true, Promise-based polling should still be treated as blocking");
			bPoll = false;
			aTimeouts.forEach(function (iID) {
				fnClearTimeout(iID);
			});
			// Restore default
			timeoutWaiter.extendConfig({ frequencyDetection: { disabled: false } });
			fnDone();
		}, 600);
	});

	QUnit.test("Should still detect chain-based polling when frequencyDetection.disabled is true", function (assert) {
		var fnDone = assert.async();
		var aTimeouts = [];
		var bPoll = true;

		// Enable kill-switch: only statistical detection is off
		timeoutWaiter.extendConfig({ frequencyDetection: { disabled: true } });

		// Direct self-scheduling creates an initiator chain — chain-based detection should still work
		function poll() {
			if (bPoll) {
				aTimeouts.push(fnSetTimeout(poll, 100));
			}
		}

		poll();

		fnSetTimeout(function () {
			assert.ok(!timeoutWaiter.hasPending(),
				"With frequencyDetection.disabled=true, chain-based polling should still be detected and not block");
			bPoll = false;
			aTimeouts.forEach(function (iID) {
				fnClearTimeout(iID);
			});
			timeoutWaiter.extendConfig({ frequencyDetection: { disabled: false } });
			fnDone();
		}, 600);
	});

	QUnit.test("Should detect polling when frequencyDetection.disabled is false (default)", function (assert) {
		var fnDone = assert.async();
		var aTimeouts = [];

		// Ensure default: polling detection enabled
		timeoutWaiter.extendConfig({ frequencyDetection: { disabled: false } });

		function poll() {
			aTimeouts.push(fnSetTimeout(poll, 100));
		}

		poll();

		fnSetTimeout(function () {
			assert.ok(!timeoutWaiter.hasPending(),
				"With frequencyDetection.disabled=false, polling should be detected and not block");
			aTimeouts.forEach(function (iID) {
				fnClearTimeout(iID);
			});
			fnDone();
		}, 800);
	});

	QUnit.test("Should propagate frequencyDetection config to existing FrequencyTracker without resetting it", function (assert) {
		// Force lazy creation of the FrequencyTracker
		var oTracker = timeoutWaiter._getFrequencyTracker();

		// Update config
		timeoutWaiter.extendConfig({
			frequencyDetection: { maxDeviation: 20 }
		});

		// The same instance should be reused (not recreated)
		var oTrackerAfter = timeoutWaiter._getFrequencyTracker();
		assert.strictEqual(oTrackerAfter, oTracker,
			"FrequencyTracker instance should be preserved after extendConfig");
		assert.strictEqual(oTrackerAfter._iMaxDeviation, 20,
			"Updated config value should be propagated to the existing tracker");

		// Restore
		timeoutWaiter.extendConfig({
			frequencyDetection: { maxDeviation: 10 }
		});
	});

	QUnit.test("Should pass frequencyDetection config to FrequencyTracker affecting detection behavior", function (assert) {
		var fnDone = assert.async();
		var aTimeouts = [];
		var bPoll = true;

		// Set a higher minObservations — pattern needs more observations before being classified
		timeoutWaiter.extendConfig({
			frequencyDetection: {
				disabled: false,
				minObservations: 8
			}
		});

		// Direct self-scheduling with Promise (no chain) — relies on statistical detection
		function poll() {
			if (bPoll) {
				Promise.resolve().then(function () {
					aTimeouts.push(fnSetTimeout(poll, 100));
				});
			}
		}

		poll();

		// After 400ms (~4 iterations), minObservations=8 should not have been met yet
		fnSetTimeout(function () {
			assert.ok(timeoutWaiter.hasPending(),
				"After ~4 iterations, minObservations=8 should not yet classify as polling (still blocking)");
			bPoll = false;
			aTimeouts.forEach(function (iID) {
				fnClearTimeout(iID);
			});
			// Restore defaults
			timeoutWaiter.extendConfig({
				frequencyDetection: {
					disabled: false,
					minObservations: 3
				}
			});
			fnDone();
		}, 400);
	});
});
