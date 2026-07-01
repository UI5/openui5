(function(globalThis) {
	"use strict";
	/*global CollectGarbage */
	/*
	 * Simulate the JSUnit Testsuite to collect the available
	 * test pages per Suite
	 */
	globalThis.jsUnitTestSuite = function() {};
	globalThis.jsUnitTestSuite.prototype.getTestPages = function() {
		return this.aPages;
	};
	globalThis.jsUnitTestSuite.prototype.addTestPage = function(sTestPage) {
		this.aPages = this.aPages || [];
		// in case of running in the root context the testsuites right now
		// generate an invalid URL because they assume that test-resources is
		// the context path - this section makes sure to remove the duplicate
		// test-resources segments in the path
		if (sTestPage.indexOf("/test-resources/test-resources") === 0 || sTestPage.indexOf("/test-resources/resources") === 0) {
			sTestPage = sTestPage.substr("/test-resources".length);
		}
		this.aPages.push(sTestPage);
	};
	class Deferred {
		constructor() {
			this.promise = new Promise((resolve, reject) => {
				this.resolve = resolve;
				this.reject = reject;
			});
		}
	}
	const byId = (id) => document.getElementById(id);
	const querySelector = (selector, root = document) => root.querySelector(selector);
	const querySelectorAll = (selector, root = document) => root.querySelectorAll(selector);
	const h = (name, ext, content) => {
		const el = document.createElement(name);
		if ( typeof ext === "string" ) {
			el.className = ext;
		} else if ( ext ) {
			Object.entries(ext).forEach(
				([key, value]) => {
					if ( key === "style" ) {
						Object.assign(el.style, value);
					} else if ( typeof value === "function" && key.startsWith("on") ) {
						el.addEventListener(key.slice(2), value);
					} else {
						el.setAttribute(key, value);
					}
				}
			);
		}
		if ( Array.isArray(content) ) {
			content.forEach((item) => el.appendChild(item));
		} else if ( content ) {
			content.split("<br>").forEach((text, idx) => {
				if ( idx > 0 ) {
					el.appendChild(document.createElement("BR"));
				}
				el.appendChild(document.createTextNode(text));
			});
		}
		return el;
	};
	const click = (id, callback) => byId(id).addEventListener("click", callback);
	const toggleDisplay = (elem, bForceOpenClose) => {
		const aElements = Array.isArray(elem) ? elem : [elem];
		aElements.forEach((elem) => {
			const bOpen = bForceOpenClose ?? globalThis.getComputedStyle(elem).display === "none";
			const domElem = typeof elem === "string" ? byId(elem) : elem;
			domElem.style.display = bOpen ? "" : "none";
		});
	};
	const setVisibile = (elem, bVisible) => {
		const aElements = Array.isArray(elem) ? elem : [elem];
		aElements.forEach((elem) => {
			const domElem = typeof elem === "string" ? byId(elem) : elem;
			domElem.style.visibility = bVisible ? "" : "hidden";
		});
	};

	function toggleArea(sAreaId, bForceOpenClose) {
		const uiArea = byId(sAreaId),
			bOpen = bForceOpenClose ?? uiArea.classList.contains("collapsed");

		uiArea.classList.add(bOpen ? "expanded" : "collapsed");
		uiArea.classList.remove(bOpen ? "collapsed" : "expanded");

		return bOpen;
	}
	/**
	 * Simple task scheduler that bounds both the number of concurrently
	 * running tasks and the minimum delay between starting two tasks.
	 *
	 * Used in two flavours:
	 *  - As a queue for HTML probe requests in {@link Discovery#checkTestPage}.
	 *  - As a queue for hidden discovery iframes in
	 *    {@link Discovery##loadSuitePages}. Safari aborts/stalls when too many
	 *    XHRs/page loads are in flight simultaneously, so testsuite discovery
	 *    is throttled there by default; see the URL parameters
	 *    `iframe-parallel` and `iframe-wait` (and the Safari defaults applied
	 *    in {@link Discovery}).
	 */
	class TaskQueue {
		constructor(iMaxParallel, iWaitTime) {
			this.iLimit = iMaxParallel === undefined ? Infinity : iMaxParallel;
			this.iWaitTime = iWaitTime === undefined ? 0 : iWaitTime;
			this.aPendingTasks = [];
			this.oRunningTasks = new Set();
			this.iLastTaskExecution = -Infinity;
			this.iCompleted = 0;
			this.fnStateChange = null;
		}
		/**
		 * Register a listener that is called whenever the queue's state changes
		 * (task enqueued, started, or finished). The listener receives a
		 * snapshot object with <code>running</code>, <code>pending</code>,
		 * <code>completed</code>, and <code>limit</code>.
		 */
		setStateChangeListener(fnStateChange) {
			this.fnStateChange = fnStateChange;
		}
		_emitState() {
			if (this.fnStateChange) {
				this.fnStateChange({
					running: this.oRunningTasks.size,
					pending: this.aPendingTasks.length,
					completed: this.iCompleted,
					limit: this.iLimit
				});
			}
		}
		/**
		 * Schedule <code>fnTask</code> to be executed once a slot is free and
		 * the inter-task gap has elapsed.
		 * @param {function():Promise<T>} fnTask zero-arg function returning a Promise
		 * @returns {Promise<T>} a promise that resolves/rejects with the result of fnTask
		 */
		run(fnTask) {
			const oTask = Object.assign(new Deferred(), { fn: fnTask });
			this.aPendingTasks.push(oTask);
			this._emitState();
			this._processNext();
			return oTask.promise;
		}
		_processNext() {
			var iNow = Date.now();
			var iElapsed = iNow - this.iLastTaskExecution;
			if ( iElapsed < this.iWaitTime ) {
				// Wait the REMAINING time, not the time already elapsed
				setTimeout(() => this._processNext(), this.iWaitTime - iElapsed);
				return;
			}
			if ( this.aPendingTasks.length > 0 && this.oRunningTasks.size < this.iLimit ) {
				var oTask = this.aPendingTasks.shift();
				this.oRunningTasks.add(oTask);
				this.iLastTaskExecution = iNow;
				this._emitState();
				Promise.resolve()
					.then(() => oTask.fn())
					.then(oTask.resolve, oTask.reject)
					.finally(() => {
						this.oRunningTasks.delete(oTask);
						this.iCompleted++;
						this._emitState();
						this._processNext();
					});
			}
		}
	}

	/**
	 * Read a single URL parameter from <code>globalThis.location.search</code>.
	 * Lifted out of {@link TestRunner} so {@link Discovery} can read its tuning
	 * parameters at construction time.
	 */
	const getUrlParameter = (sName) => {
		const params = new URLSearchParams(globalThis.location.search);
		return params.get(sName);
	};

	// Safari (WebKit, non-Chromium) has trouble keeping up when too many
	// XHRs / page loads run concurrently during testsuite discovery. Only
	// Safari gets a throttling default; all other browsers default to no
	// throttling. The URL parameters below override the default per run.
	const bIsSafari = /Safari/.test(navigator.userAgent)
		&& !/Chrome|Chromium|Edg/.test(navigator.userAgent);
	const parsePositiveIntOrInfinity = (sValue, iDefault) => {
		if (sValue == null) {
			return iDefault;
		}
		if (sValue === "Infinity") {
			return Infinity;
		}
		const iParsed = parseInt(sValue);
		return Number.isFinite(iParsed) && iParsed > 0 ? iParsed : iDefault;
	};
	const parseNonNegativeIntOr = (sValue, iDefault) => {
		if (sValue == null) {
			return iDefault;
		}
		const iParsed = parseInt(sValue);
		return Number.isFinite(iParsed) && iParsed >= 0 ? iParsed : iDefault;
	};
	/**
	 * Utility class to find test pages and check them for being
	 * a testsuite or a QUnit testpage.
	 */
	class Discovery {
		#fetchQueue = new TaskQueue(50, 2);
		#iframeQueue = new TaskQueue(
			parsePositiveIntOrInfinity(getUrlParameter("iframe-parallel"), bIsSafari ? 3 : Infinity),
			parseNonNegativeIntOr(getUrlParameter("iframe-wait"), bIsSafari ? 50 : 0)
		);
		#pagesFound = 0;
		#fnProgressListener = null;
		/**
		 * Register a listener invoked whenever discovery progress changes.
		 * Receives an aggregated snapshot:
		 *   {
		 *     iframes:    {running, pending, completed, limit},  // <iframe> testsuite loads
		 *     fetches:    {running, pending, completed, limit},  // HTML probe fetches
		 *     pagesFound: <number of leaf test pages discovered so far>
		 *   }
		 */
		setProgressListener(fnListener) {
			this.#fnProgressListener = fnListener;
			const fnRelay = () => this.#emitProgress();
			this.#iframeQueue.setStateChangeListener(fnRelay);
			this.#fetchQueue.setStateChangeListener(fnRelay);
		}
		/**
		 * Reset discovery counters so a new `find()` invocation starts at zero.
		 * The queues themselves keep their lifetime totals — but at the start
		 * of a discovery run no jobs are in flight, so the counters are reset
		 * on the queues too for a clean display.
		 */
		resetProgress() {
			this.#pagesFound = 0;
			this.#iframeQueue.iCompleted = 0;
			this.#fetchQueue.iCompleted = 0;
			this.#emitProgress();
		}
		#emitProgress() {
			if (!this.#fnProgressListener) {
				return;
			}
			const snap = (q) => ({
				running: q.oRunningTasks.size,
				pending: q.aPendingTasks.length,
				completed: q.iCompleted,
				limit: q.iLimit
			});
			this.#fnProgressListener({
				iframes: snap(this.#iframeQueue),
				fetches: snap(this.#fetchQueue),
				pagesFound: this.#pagesFound
			});
		}
		checkTestPage(sTestPage, bSequential) {
			return this.#checkTestPage(sTestPage, bSequential);
		}
		async #checkTestPage(sTestPage, bSequential) {
			if (typeof sTestPage !== "string") {
				console.log("QUnit: invalid test page specified"); // eslint-disable-line no-console
				throw new Error("QUnit: invalid test page specified");
			}
			// console.log("QUnit: checking test page: " + sTestPage);
			// check for an existing test page and check for test suite or page
			const sData = await this.#fetchQueue.run(() => fetch(sTestPage).then((response) => {
				const pText = response.text();
				return response.ok ? pText : pText.then((sText) => Promise.reject(sText));
			})).catch((err) => {
				console.error(`QUnit: failed to load page '${sTestPage}':`, err); // eslint-disable-line no-console
				return null;
			});
			if ( sData == null ) {
				return [];
			}
			if (/(?:window\.suite\s*=|function\s*suite\s*\(\s*\)\s*{)/.test(sData)
				|| (/data-sap-ui-testsuite/.test(sData) && !/sap\/ui\/test\/starter\/runTest/.test(sData))
				|| /sap\/ui\/test\/starter\/createSuite/.test(sData) ) {
				const aTestPages = await this.#collectPagesFromSuite(sTestPage, bSequential);
				console.info(`got test pages for ${sTestPage}: ${aTestPages.length}`); // eslint-disable-line no-console
				return aTestPages;
			} else {
				this.#pagesFound++;
				this.#emitProgress();
				return [sTestPage];
			}
		}
		async #collectPagesFromSuite(sTestPage, bSequential) {
			// Load the suite page in a throttled iframe slot. The slot is
			// released as soon as we have extracted the page list — recursive
			// resolution of nested pages happens AFTER the iframe is removed,
			// so deep testsuite trees cannot deadlock the queue.
			const aPages = await this.#loadSuitePages(sTestPage);
			const aTestPages = await this.#resolveNestedPages(sTestPage, aPages, bSequential);
			// avoid duplicates in test pages
			const aUniqueTestPages = aTestPages.filter((e, i, a) => a.indexOf(e) === i);
			console.info(`test pages for ${sTestPage}: ${aUniqueTestPages.length}`); // eslint-disable-line no-console
			return aUniqueTestPages;
		}
		/**
		 * Load <code>sTestPage</code> in a hidden iframe, wait for its
		 * <code>window.suite</code> to be available, call it and return the
		 * list of test pages it exposes. The iframe is always removed when
		 * this method resolves, regardless of outcome.
		 *
		 * Throttled via {@link Discovery##iframeQueue} — Safari aborts/stalls
		 * when too many discovery iframes load in parallel, see the constructor.
		 */
		#loadSuitePages(sTestPage) {
			return this.#iframeQueue.run(() => {
				const oDeferred = new Deferred();
				let bSettled = false;

				// Forward-declared via the closure; assigned exactly once at
				// the end of the setup below. All listeners only read it after
				// the iframe enters the DOM, so they never observe undefined.
				/* eslint-disable prefer-const */
				let frame;

				const cleanup = () => {
					if (frame && frame.parentNode) {
						frame.remove();
					}
				};

				const onSuiteReady = async (oFrame) => {
					if (bSettled) {
						return;
					}
					bSettled = true;
					let aPages = [];
					try {
						const oSuite = await oFrame.contentWindow.suite();
						aPages = oSuite?.getTestPages() ?? [];
					} catch (oError) {
						console.error(`QUnit: failed to read suite '${sTestPage}', Error:`, oError); // eslint-disable-line no-console
					}
					cleanup();
					oDeferred.resolve(aPages);
				};

				// Bounded poll for window.suite — covers suites that assign it
				// asynchronously after load (ES module testsuites, createSuite, …)
				// without relying solely on the optional sap-ui-testsuite-ready event.
				const waitForSuite = (oWin, iDeadline) => {
					if (bSettled) {
						return;
					}
					if (typeof oWin.suite === "function") {
						onSuiteReady(frame);
						return;
					}
					if (Date.now() > iDeadline) {
						console.error(`QUnit: testsuite '${sTestPage}' did not expose window.suite within the timeout`); // eslint-disable-line no-console
						bSettled = true;
						cleanup();
						oDeferred.resolve([]);
						return;
					}
					setTimeout(() => waitForSuite(oWin, iDeadline), 50);
				};

				// Note: use <iframe> (not <frame>) — <frame> outside a <frameset>
				// is ignored by WebKit/Safari, the src is never fetched, and load
				// never fires. h() attaches the onload listener via addEventListener
				// BEFORE setting src, and the element only starts loading when it
				// enters the DOM via appendChild, so there is no load/listener race.
				frame = h("iframe", {
					style: {
						display: "none"
					},
					onload: function() {
						const oWin = this.contentWindow;
						// Fast path: suite already defined (legacy synchronous suites)
						if (typeof oWin.suite === "function") {
							onSuiteReady(this);
							return;
						}
						// Subscribe first so we never miss the event
						const onReady = () => {
							oWin.removeEventListener("sap-ui-testsuite-ready", onReady);
							onSuiteReady(frame);
						};
						oWin.addEventListener("sap-ui-testsuite-ready", onReady);
						// Fallback: poll for up to 30s in case the suite neither fires
						// the event nor is defined synchronously at load time.
						waitForSuite(oWin, Date.now() + 30000);
					},
					src: sTestPage
				});
				document.body.appendChild(frame);
				return oDeferred.promise;
			});
		}
		/**
		 * Recursively resolve each entry in <code>aPages</code> via
		 * {@link Discovery##checkTestPage}. NOT throttled itself — the
		 * underlying fetches and (for nested testsuites) iframe loads pass
		 * through {@link Discovery##fetchQueue} / {@link Discovery##iframeQueue}
		 * on their own.
		 */
		async #resolveNestedPages(sParentPage, aPages, bSequential) {
			try {
				if (aPages.length === 0) {
					return [];
				}
				let aTestPages = [];
				if (bSequential) {
					await aPages.reduce((oPromise, sTestPage) => {
						return oPromise.then(this.#checkTestPage.bind(this, sTestPage, bSequential)).then((aFoundTestPages) => {
							aTestPages = aTestPages.concat(aFoundTestPages);
						});
					}, Promise.resolve([]));
					return aTestPages;
				}
				const aTestPagePromises = [];
				for (let i = 0, l = aPages.length; i < l; i++) {
					aTestPagePromises.push(this.#checkTestPage(aPages[i], bSequential));
				}
				const aFoundTestPages = await Promise.all(aTestPagePromises);
				for (let i = 0, l = aFoundTestPages.length; i < l; i++) {
					aTestPages = aTestPages.concat(aFoundTestPages[i]);
				}
				return aTestPages;
			} catch (ex) {
				console.error("QUnit: error while analyzing test page '" + sParentPage + "':\n", ex); // eslint-disable-line no-console
				return [];
			}
		}
	}
	class ProgressBar {
		constructor(selector) {
			this.selector = selector;
			this.selector.classList.add("progressBar");
			this.selector.appendChild(h("div", {id: "innerBar"}, "0%"));
		}
		progress(nBarStep) {
			const innerBar = byId("innerBar");
			var nBarwidth = parseFloat(innerBar.style.width);
			var sNewwidth = nBarwidth + nBarStep + "%";
			innerBar.textContent = Math.round(nBarwidth + nBarStep) + "%";
			innerBar.style.width = sNewwidth;
			if (parseInt(querySelector("div#reportingHeader span.failed").innerText) > 0) {
				innerBar.style.backgroundColor = '#ed866f';
			}
			const time = byId("time");
			time.textContent = Math.round((new Date() - globalThis.oStartTime) / 1000) + " Seconds";
		}
		reset() {
			byId("innerBar").style.width = "0%";
		}
	}
	let progressBar;
	const discovery = new Discovery();
	/**
	 * Utility class to find test pages and check them for being
	 * a testsuite or a QUnit testpage - also it returns the coverage
	 * results.
	 */
	class TestRunner {
		// TODO clarify for what is the internal flag used
		async runTests(aTestPages, nBarStep) {
			const sTestPage = aTestPages.shift();
			if (sTestPage) {
				await this.runTest(sTestPage).then(() => {
					progressBar.progress(nBarStep);
				});
				querySelectorAll("#selectedTests > option").forEach((item) => {
					if (item.textContent === sTestPage) {
						item.remove();
					}
				});
				// notify the status bar in the DOM-ready scope
				document.dispatchEvent(new CustomEvent("ui5-testrunner-selection-changed"));
				return this.runTests(aTestPages, nBarStep);
			}
		}
		printTestResultAndRemoveFrame(frame, oContext) {
			frame.src = "about:blank";
			frame.contentWindow.document.write('');
			frame.contentWindow.close();
			if ( typeof CollectGarbage == "function") {
				CollectGarbage(); // eslint-disable-line
			}
			frame.remove();
			this.printTestResult(oContext);
		}
		printTestResult(oContext) {
			const toggleSibling = (e) => toggleDisplay(e.target.nextElementSibling);
			const toggleSibling2 = (e) => toggleDisplay(e.target.nextElementSibling.nextElementSibling);
			oContext.tests.forEach(({outcome, header, results}) => {
				const div =
					h("div", `testResult ${outcome}`, [
						h("p", {onclick: toggleSibling}, header),
						h("ol", {style: {display: "none"}}, results.map(({result}) =>
							h("li", `${result.sLiClass} test`, [
								h("p", {style: {display: "inline"}, onclick: toggleSibling2},
									`${result.TestName} (${result.Failed} ,${result.Passed} ,${result.All}) `),
								h("a", {href: result.rerunlink}, " Rerun"),
								h("ol", null, result.testmessages.map(({classname, message, expected, actual, diff, source}) =>
									h("li", `${classname} check`,
									`${message}<br>${expected}<br>${actual}<br>${diff}<br>${source}`)
								))
							])
						))
					]);
				querySelector("div#reportingContent").appendChild(div);
			});
		}
		runTest(sTestPage) {
			if (this._bStopped) {
				delete this._bStopped;
				return Promise.reject();
			}
			const oDeferred = new Deferred();
			if (this.getUrlParameter("hidepassed") !== null) {
				sTestPage += (sTestPage.includes("?") ? "&" : "?") + "hidepassed";
			}
			// we could make this configurable
			const frame = h("iframe", {id: "test-iframe", src: sTestPage});
			querySelector("div.test-execution").appendChild(frame);
			const iTestTimeout = parseInt(this.getUrlParameter("test-timeout")) || 300000;
			const tBegin = Date.now();
			const fnCheckSuccess = () => {
				var doc = frame.contentWindow.document;
				var sTestName = querySelector("h1#qunit-header > a", doc)?.text;
				var results = querySelectorAll("ol#qunit-tests > li", doc);
				var qunitBanner = querySelector("#qunit-banner", doc);
				if (qunitBanner?.classList.contains("qunit-fail") || qunitBanner?.classList.contains("qunit-pass")) {
					if (!sTestName) {
						sTestName = "QUnit page for " + doc.baseURI.substring(doc.baseURI.indexOf("test-resources") + 15, doc.baseURI.length);
					}
					const oContext = this.#extractTestResults(sTestName, results);
					this.printTestResultAndRemoveFrame(frame, oContext);
					oDeferred.resolve();
					return;
				}
				if (Date.now() - tBegin < iTestTimeout) {
					setTimeout(fnCheckSuccess, 100);
				} else {
					const QUnit = frame.contentWindow.QUnit;
					let oContext;
					if (QUnit) {
						// push a failure and add the results that where run to the report
						oContext = this.#extractTestResults(sTestName, results);
						oContext.tests[0].header = "Testsuite was not completed after " + Math.round(iTestTimeout / 1000) + " seconds : " + sTestName;
						oContext.tests[0].outcome = "fail";
						oContext.tests[0].results.push(
							{
								result : {
									TestName: "Timeout occured",
									outcome: "fail",
									Failed: "1",
									Passed: "0",
									All: "1",
									rerunlink : frame.contentWindow.location.href,
									sLiClass: "fail",
									testmessages: ["no assertions"]
								}
							}
						);
					} else {
						// No qunit print error message
						oContext = this.#createFailContext(frame.contentWindow.location.href, "Testsite did not load QUnit after 5 minutes");
					}
					this.printTestResultAndRemoveFrame(frame, oContext);
					oDeferred.resolve();
				}
			};
			fnCheckSuccess();
			return oDeferred.promise;
		}
		#createFailContext(sHref, sHeaderMessage) {
			this.updateResultHeader("1", "0", "1");
			return {
				tests: [{
					header: sHeaderMessage + " : " + sHref,
					outcome: "fail",
					results:[
						{
							result: {
								TestName: "No test where run",
								Failed: "1",
								Passed: "0",
								All: "1",
								rerunlink : sHref,
								sLiClass: "fail",
								testmessages: ["no assertions"]
							}
						}
					]
				}]
			};
		}
		stopTests() {
			this._bStopped = true;
		}

		getTestPageUrl(sFallbackUrl) {
			// TODO rewrite using URL
			const sTestPageUrl = this.getUrlParameter("testpage");
			if (sTestPageUrl) {
				const sOrigin = globalThis.location.origin;
				// Check whether first character is "/"
				if (sTestPageUrl.match(/^\/(?!\/)/)) {
					return sOrigin + sTestPageUrl;
				}
				// sTestPageUrl might be a full href
				// => check whether protocol and host matches current location
				const aTestPageUrlMatch = sTestPageUrl.match(/^(https?:\/\/[^\/]+)(\/.*)$/i);
				if (aTestPageUrlMatch && aTestPageUrlMatch[1] === sOrigin) {
					// Still use the known current location and append given path segment just to make sure
					return sOrigin + aTestPageUrlMatch[2];
				}
				throw new Error("Invalid value for URL parameter 'testpage': Path segment must start with '/'. " +
					"If given, protocol and host must match the current location.");
			}
			// Fallback to generic testsuite page
			if ( sFallbackUrl == null ) {
				let sContextPath;
				// Match the path segment before the first "test-resources" segment
				const aContextPathMatch = globalThis.location.pathname.match(/(.*?)\/(?:test-resources)/);
				if (aContextPathMatch && aContextPathMatch[1]) {
					sContextPath = aContextPathMatch[1];
				} else {
					sContextPath = "";
				}
				sFallbackUrl = sContextPath + "/test-resources/qunit/testsuite.qunit.html";
			}
			return sFallbackUrl;
		}
		getAutoStart() {
			const sAutoStart = this.getUrlParameter("autostart");
			return sAutoStart == "true";
		}
		getUrlParameter(sName) {
			return getUrlParameter(sName);
		}
		updateResultHeader(sNumAll, sNumPassed, sNumFailed) {
			const total = querySelector("div#reportingHeader span.total");
			total.textContent = parseInt(total.textContent) + parseInt(sNumAll);
			const passed = querySelector("div#reportingHeader span.passed");
			passed.textContent = parseInt(passed.textContent) + parseInt(sNumPassed);
			const failed = querySelector("div#reportingHeader span.failed");
			failed.textContent = parseInt(failed.textContent) + parseInt(sNumFailed);
		}
		#extractTestResults(sHeader, aTestResults) {
			// build the context
			const oContext = {
				tests: [{
					header: sHeader,
					outcome: "pass",
					results:[]
				}]
			};
			for (let i = 0; i < aTestResults.length; i++) {
				const $checkItems = querySelectorAll("ol > li", aTestResults[i]);
				const aTestMessages = [];
				for (let y = 0; y < $checkItems.length; y++) {
					const oTestMessage = {
						message: "",
						expected: "",
						actual: "",
						diff: "",
						source: "",
						classname: $checkItems[y].className
					};
					if ($checkItems[y].className === "pass") {
						oTestMessage.message = $checkItems[y].textContent;
					} else {
						const messageSpan = querySelector("span.test-message", $checkItems[y]);
						oTestMessage.message = messageSpan.textContent;
						const testExpected = querySelector("tr.test-expected", $checkItems[y]);
						if (testExpected) {
							oTestMessage.expected = testExpected.textContent;
						}
						const testActual = querySelector("tr.test-actual", $checkItems[y]);
						if (testActual) {
							oTestMessage.actual = testActual.textContent;
						}
						const testDiff = querySelector("tr.test-diff", $checkItems[y]);
						if (testDiff) {
							oTestMessage.diff = testDiff.textContent;
						}
						const testSource = querySelector("tr.test-source", $checkItems[y]);
						if (testSource) {
							oTestMessage.source = testSource.textContent;
						}
					}
					aTestMessages.push(oTestMessage);
				}
				const test = aTestResults[i];
				const sTestSummary = [...querySelector("strong", test).childNodes].reduce((result, node) => {
					result += node.textContent || '';
					return result;
				}, "");
				const m = sTestSummary.match(/^([\S\s]*)\((\d+)(?:,\s*(\d+),\s*(\d+))?\)\s*$/);
				let sTestName;
				let sNumFailed;
				let sNumPassed;
				let sNumAll;
				// test still running
				if (!m) {
					sTestName = sTestSummary + " - Timed out and did not run completely";
					sNumPassed = 0;
					sNumFailed = sNumAll = "1";
				} else {
					sTestName = m[1];
					if ( m[3] || m[4] ) {
						sNumFailed = m[2];
						sNumPassed = m[3];
						sNumAll = m[4];
					} else {
						sNumPassed = sNumAll = m[2];
						sNumFailed = "0";
					}
				}
				const sRerunLink = test.querySelector("A").href;
				const sLineItemClass = sNumFailed === "0" ? "pass" : "fail";
				if (sLineItemClass === "fail") {
					oContext.tests[0].outcome = sLineItemClass;
				}
				oContext.tests[0].results.push({result:{
					TestName: sTestName,
					Failed: sNumFailed,
					Passed: sNumPassed,
					All: sNumAll,
					rerunlink: sRerunLink,
					sLiClass: sLineItemClass,
					testmessages: aTestMessages }
				});
				this.updateResultHeader(sNumAll, sNumPassed, sNumFailed);
			}
			return oContext;
		}
		checkTestPage(...args) {
			const pDone = discovery.checkTestPage(...args);
			pDone.done = pDone.then;
			return pDone;
		}
	}
	const testRunner = new TestRunner();

	/**
	 * Utility class to find test pages and check them for being
	 * a testsuite or a QUnit testpage - also it returns the coverage
	 * results.
	 */
	// ui5lint-disable no-globals
	globalThis.sap = globalThis.sap || {};
	globalThis.sap.ui = globalThis.sap.ui || {};
	globalThis.sap.ui.qunit = globalThis.sap.ui.qunit || {};
	globalThis.sap.ui.qunit.TestRunner = testRunner;
	// ui5lint-enable no-globals
	const ready = () => {
		return new Promise(function(resolve, reject) {
			if (document.readyState !== "loading") {
				resolve();
			} else {
				var fnDomReady = function(res) {
					document.removeEventListener("DOMContentLoaded", fnDomReady);
					resolve();
				};
				document.addEventListener("DOMContentLoaded", fnDomReady);
			}
		});
	};

	ready().then(function() {
		/**
		 * Helper functions
		 */
		function prepareNewRun() {
			progressBar.reset();
			toggleArea("test-selection", false);
			toggleDisplay("test-reporting", false);
			querySelector("div#reportingContent").innerHTML = "";
			querySelector("span.total").textContent =
			querySelector("span.passed").textContent =
			querySelector("span.failed").textContent = "0";
			querySelector("#qunit-banner").className = "qunit-running";
		}

		function createTestPageSelectionOptions(sFilter) {
			byId("testPageSelect").innerHTML  = "";
			const oFilterRegex = new RegExp(sFilter, "gi");
			globalThis.aTestPages.forEach((page) => {
				if (!sFilter || page.match(oFilterRegex) !== null) {
					const optionElement = h("option", {
						value: page,
						ondblclick: (event) => {
							copy([event.target]);
						}
					}, page);
					byId("testPageSelect").appendChild(optionElement);
				}
			});
			updateSelectionStatus();
		}

		/**
		 * Refresh the "N of M tests selected" status bar from the current
		 * DOM state. Call from any path that adds/removes options in the
		 * left (discovered) or right (selected) lists, or that re-filters
		 * the left list.
		 */
		function updateSelectionStatus() {
			const iTotal = (globalThis.aTestPages || []).length;
			const iVisible = querySelectorAll("#testPageSelect > option").length;
			const iSelected = querySelectorAll("#selectedTests > option").length;
			byId("selectionStatusTotal").textContent = iTotal;
			byId("selectionStatusVisible").textContent = iVisible;
			byId("selectionStatusCount").textContent = iSelected;
		}

		// Discovery duration ticker — runs at ~10 Hz while find() is in
		// flight, freezes at the final value when discovery completes.
		let iDiscoveryStart = 0;
		let iDiscoveryTicker = 0;
		function formatDuration(iMs) {
			return (iMs / 1000).toFixed(1) + " s";
		}
		function startDiscoveryTimer() {
			iDiscoveryStart = Date.now();
			byId("discoveryDuration").textContent = "0.0 s";
			iDiscoveryTicker = setInterval(() => {
				byId("discoveryDuration").textContent =
					formatDuration(Date.now() - iDiscoveryStart);
			}, 100);
		}
		function stopDiscoveryTimer() {
			if (iDiscoveryTicker) {
				clearInterval(iDiscoveryTicker);
				iDiscoveryTicker = 0;
			}
			if (iDiscoveryStart) {
				byId("discoveryDuration").textContent =
					formatDuration(Date.now() - iDiscoveryStart);
			}
		}

		async function find() {
			prepareNewTestDiscovery();
			startDiscoveryTimer();
			const sTestPage = byId("testPage").value;
			const bSequential = byId("sequential").checked;
			const aTestPages = await discovery.checkTestPage(sTestPage, bSequential);
			stopDiscoveryTimer();
			toggleDisplay("busy", false);
			toggleDisplay("discoveryStats", false);
			globalThis.aTestPages = aTestPages;

			if (aTestPages.length) {
				createTestPageSelectionOptions();

				setVisibile(["run"], true);
				toggleDisplay(["statusBarFilter", "select", "selectionStatus"], true);
			} else {
				alert(`Testpage ${sTestPage} could not be loaded`); // eslint-disable-line no-alert
			}
		}

		function copyAll() {
			const aSelectedTests = querySelectorAll("#testPageSelect > option");
			const selectedTestsContainer = byId("selectedTests");
			selectedTestsContainer.innerHTML = "";
			for (var i = 0; i < aSelectedTests.length; i++) {
				selectedTestsContainer.appendChild(
					h("option", {value: aSelectedTests[i].textContent}, aSelectedTests[i].textContent)
				);
			}
			updateSelectionStatus();
		}

		function copy(aElements) {
			const selectedTestsContainer = byId("selectedTests");
			const findDuplicates = (option) => {
				return option.label === aElements[i].label;
			};
			for (var i = 0; i < aElements.length; i++) {
				const bElementExists = [...selectedTestsContainer.options].some(findDuplicates);
				if (!bElementExists) {
					selectedTestsContainer.appendChild(
						h("option", {value: aElements[i].textContent}, aElements[i].textContent)
					);
				}
			}
			updateSelectionStatus();
		}

		function removeSelectedTest(aSelectedTests) {
			aSelectedTests.forEach((selectedTest) => {
				selectedTest.remove();
			});
			updateSelectionStatus();
		}

		function run() {
			prepareNewRun();
			globalThis.oStartTime = new Date();
			var aTests = [...querySelectorAll("#selectedTests > option")].map((option) => option.textContent);
			var nStep = 100 / aTests.length;
			setVisibile(["progressSection", "stop"], true);
			testRunner.runTests(aTests, nStep).then(displayTestResults);
		}

		function prepareNewTestDiscovery() {
			setVisibile(["run", "stop"], false);
			toggleDisplay(["statusBarFilter", "select", "selectionStatus", "test-reporting"], false);
			byId("filter").value = "";
			removeSelectedTest([...querySelectorAll("#select select > option")]);
			toggleDisplay("busy", true);
			discovery.resetProgress();
			toggleDisplay(["statusBar", "discoveryStats", "statusBarDuration"], true);
		}

		function displayTestResults() {
			const aAreas = ["test-reporting"];

			setVisibile(["progressSection", "stop"], false);
			toggleDisplay(aAreas, true);
			toggleArea("test-reporting", true);
			const banner = querySelector("#qunit-banner");
			const failed = parseInt(querySelector("span.failed").textContent) || 0;
			banner.className = failed > 0 ? "qunit-fail" : "qunit-pass";
		}

		/**
		 * Setup test runner
		 */
		byId("testPageLabel").textContent = globalThis.location.origin;
		byId("testPage").value = testRunner.getTestPageUrl();

		progressBar = new ProgressBar(byId("bar"));

		// Cross-scope notification: runTests removes options from the
		// #selectedTests list as each test completes, but it lives on the
		// TestRunner class above this IIFE and has no closure access to
		// updateSelectionStatus(). Bridge via a DOM event.
		document.addEventListener("ui5-testrunner-selection-changed", updateSelectionStatus);

		// Live discovery indicator: re-render the three counters in
		// #discoveryStats whenever the iframe or fetch queue ticks.
		(() => {
			const statsRoot = byId("discoveryStats");
			const ifr = byId("discoveryIframes");
			const fet = byId("discoveryFetches");
			const pgs = byId("discoveryPages");
			let iPending = false;
			const setStat = (root, snap) => {
				root.querySelector(".running").textContent = snap.running;
				root.querySelector(".pending").textContent = snap.pending;
				root.querySelector(".completed").textContent = snap.completed;
				root.querySelector(".limit").textContent =
					snap.limit === Infinity ? "∞" : snap.limit;
			};
			discovery.setProgressListener((oSnapshot) => {
				if (iPending || statsRoot.style.display === "none") {
					return;
				}
				// Coalesce bursts of updates into one paint per frame.
				iPending = true;
				requestAnimationFrame(() => {
					iPending = false;
					setStat(ifr, oSnapshot.iframes);
					setStat(fet, oSnapshot.fetches);
					pgs.querySelector(".found").textContent = oSnapshot.pagesFound;
				});
			});
		})();

		byId("filter").addEventListener("keyup", (event) => {
			createTestPageSelectionOptions(event.target.value.trim());
		});
		byId("testPage").addEventListener("keypress", (event) => {
			if (event.key === "Enter") {
				find();
			}
		});

		setVisibile(["progressSection", "run", "stop"], false);

		/**
		 * Register click handler
		 */
		click("showResults", () => {
			const button = byId("showResults");
			toggleArea("test-reporting", true);
			if (button.value === "Show all results") {
				byId("test-reporting").classList.add("showAll");
				button.value = "Show errors only";
			} else {
				byId("test-reporting").classList.remove("showAll");
				button.value = "Show all results";
			}
		});

		click("find", find);

		click("copy", () => {
			copy([...byId("testPageSelect").selectedOptions]);
		});

		click("copyall", copyAll);

		click("remove", () => {
			removeSelectedTest([...byId("selectedTests").selectedOptions]);
		});

		click("removeall", () => {
			removeSelectedTest([...querySelectorAll("#selectedTests > option")]);
		});

		click("run", () => {
			if (querySelectorAll("#selectedTests > option").length === 0) {
				alert("Please select at least one test to execute"); // eslint-disable-line no-alert
			} else {
				run();
			}
		});

		click("open", () => {
			toggleArea("test-selection");
		});

		click("openReporting", () => {
			toggleArea("test-reporting");
		});

		click("stop", testRunner.stopTests.bind(testRunner));

		if (testRunner.getAutoStart()) {
			find().then(function() {
				copyAll();
				run();
			});
		}
	});
}(globalThis));
