/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/performance/Measurement",
	"sap/ui/performance/XHRInterceptor",
	"sap/ui/performance/trace/FESRHelper",
	"sap/ui/util/isCrossOriginURL",
	"sap/base/util/LoaderExtensions",
	"sap/base/util/now",
	"sap/base/util/uid",
	"sap/base/Log"
], function(Measurement, XHRInterceptor, FESRHelper, isCrossOriginURL, LoaderExtensions, now, uid, Log) {

	"use strict";

	let bIsNavigation = false,
		iResetCurrentBrowserEventTimer = false,
		aInteractions = [],
		oPendingInteraction,
		oCurrentBrowserEvent,
		bPerfectMatch = false,
		bMatched = false,
		iInteractionStepTimer,
		iRenderingCounter = 0,
		iRequestCounter = 0,
		iInteractionCounter = 0,
		bIdle = false,
		bInteractionActive = false,
		FESR,
		oBrowserElement,
		lastHash;

	const UI5_URL_SYMBOL = Symbol("ui5Url");
	const UI5_REQUEST_INFO_SYMBOL = Symbol("ui5Url");
	const mRequestInfo = new Map();

	const mCompressedMimeTypes = {
			"application/zip": true,
			"application/vnd.rar": true,
			"application/gzip": true,
			"application/x-tar": true,
			"application/java-archive": true,
			"image/jpeg": true,
			"application/pdf": true
		},
		sCompressedExtensions = "zip,rar,arj,z,gz,tar,lzh,cab,hqx,ace,jar,ear,war,jpg,jpeg,pdf,gzip";

	let oAggregatedTiming;
	let oValidAggregatedTiming;
	let aTimingCache = [];

	function createMeasurement(iTime) {
		return {
			event: "startup", // event which triggered interaction - default is startup interaction
			trigger: "undetermined", // control which triggered interaction
			component: "undetermined", // component or app identifier
			appVersion: "undetermined", // application version as from app descriptor
			start: iTime, // interaction start - page timeOrigin if initial
			preliminaryEnd: 0,
			end: 0, // interaction end
			navigation: 0, // sum over all navigation times
			roundtrip: 0, // time from first request sent to last received response end - without gaps and ignored overlap
			processing: 0, // client processing time
			duration: 0, // interaction duration
			requests: [], // Performance API requests during interaction
			measurements: [], // Measurements
			sapStatistics: [], // SAP Statistics for OData
			requestTime: 0, // sum over all requests in the interaction (oPendingInteraction.requests[0].responseEnd-oPendingInteraction.requests[0].requestStart)
			networkTime: 0, // request time minus server time from the header
			bytesSent: 0, // sum over all requests bytes
			bytesReceived: 0, // sum over all response bytes
			requestCompression: "X", // ok per default, if compression does not match SAP rules we report an empty string
			busyDuration: 0, // summed GlobalBusyIndicator duration during this interaction
			id: uid(), //Interaction ID
			passportAction: "undetermined_startup_0", //default PassportAction for startup
			rootId: undefined, // root context ID
			fesrecTime: 0, // sum over all backend times as reported by sap-perf-fesrec header
			fesrecRequestTime: 0, // sum over all requests which have sap-perf-fesrec header
			fesrecRequestCount: 0 // number of requests which have sap-perf-fesrec header
		};
	}

	/**
	 *
	 * @param {module:sap/ui/performance/Measurement} oMeasurement The Measurement to check for completeness.
	 * @returns {module:sap/ui/performance/Measurement | undefined} The checked Measurement if completed, otherwise undefined
	 */
	function isCompleteMeasurement(oMeasurement) {
		if (oMeasurement.start > oPendingInteraction.start && oMeasurement.end < oPendingInteraction.end) {
			return oMeasurement;
		}
	}

	/**
	 * Check if request is initiated by XHR, comleted and timeframe of request is within timeframe of current interaction
	 *
	 * @param {object} oRequestTiming PerformanceResourceTiming as retrieved by performance.getEntryByType("resource")
	 * @return {boolean} true if the request is a completed XHR with started and ended within the current interaction
	 * @private
	 */
	function isValidInteractionXHR(oRequestTiming) {
		// if the request has been completed it has complete timing figures)
		const bPartOfInteraction = oPendingInteraction.start - performance.timeOrigin <= oRequestTiming.startTime
			&& oPendingInteraction.end - performance.timeOrigin >= oRequestTiming.responseEnd;
		const bStartsInInteraction = oPendingInteraction.start - performance.timeOrigin <= oRequestTiming.startTime;
		const oRequestInfo = oRequestTiming[UI5_REQUEST_INFO_SYMBOL];
		const bCached = oRequestTiming.transferSize === 0 && oRequestTiming.decodedBodySize >= 0;
		const bIsValid = !bCached && !isCrossOriginURL(oRequestTiming.name) && oRequestInfo && bPartOfInteraction && oRequestTiming.initiatorType === "xmlhttprequest";

		// calculate navigation and roundtrip time for all requests to calculate client CPU time
		if (bStartsInInteraction) {
			oAggregatedTiming ??= {
				navigation: 0,
				roundtrip: 0,
				// for CPU calculation consider requests starting at interaction start to include index loading...
				roundtripLowerLimit: oPendingInteraction.start - performance.timeOrigin ? oRequestTiming.startTime : 0,
				roundtripHigherLimit: oRequestTiming.responseEnd
			};
			aggregateRequestTiming(oRequestTiming, oAggregatedTiming);
		}

		// calculate navigation and roundtrip time for all non CORS requests
		if (bIsValid) {
			oValidAggregatedTiming ??= {
				navigation: 0,
				roundtrip: 0,
				roundtripLowerLimit: oRequestTiming.startTime,
				roundtripHigherLimit: oRequestTiming.responseEnd
			};
			aggregateRequestTiming(oRequestTiming, oValidAggregatedTiming);
			// collect bytes and network time for valid requests
			oPendingInteraction.bytesReceived += oRequestInfo.bytesReceived;
			oPendingInteraction.bytesSent += oRequestInfo.bytesSent;
			// this should be true only if all responses are compressed
			oPendingInteraction.requestCompression = oRequestInfo.requestCompression && (oPendingInteraction.requestCompression !== false);
			// sum up request time as a grand total over all requests
			oPendingInteraction.requestTime += (oRequestTiming.responseEnd - oRequestTiming.startTime);
			if (oRequestInfo.fesrecTime) {
				// sap-perf-fesrec header contains milliseconds
				oPendingInteraction.fesrecTime += oRequestInfo.fesrecTime;
				oPendingInteraction.fesrecRequestTime += (oRequestTiming.responseEnd - oRequestTiming.startTime);
				oPendingInteraction.fesrecRequestCount++;
			}
		}
		return bIsValid;
	}

	function aggregateRequestTiming(oRequest, oTiming) {
		if (oRequest.responseEnd <= oPendingInteraction.end - performance.timeOrigin) { // request is completely within interaction time
			// if there is a gap between requests we add the times to the aggregate and shift the limits
			if (oTiming.roundtripHigherLimit <= oRequest.startTime) {
				oTiming.roundtrip += (oTiming.roundtripHigherLimit - oTiming.roundtripLowerLimit);
				oTiming.roundtripLowerLimit = oRequest.startTime;
				oTiming.roundtripHigherLimit = oRequest.responseEnd;
			} else if (oRequest.responseEnd > oTiming.roundtripHigherLimit) { // no gap
				// shift the limits if the request was completed later than the earlier requests
				oTiming.roundtripHigherLimit = oRequest.responseEnd;
			}
		} else if (oRequest.startTime < oPendingInteraction.end - performance.timeOrigin) { // request was only partially within interaction time
			// shift limit to end of interaction for CPU time calculation
			oTiming.roundtripHigherLimit = oPendingInteraction.end - performance.timeOrigin;
		}
		oTiming.navigation += oRequest.requestStart ? oRequest.requestStart - oRequest.startTime : 0;
	}

	function finalizeInteraction(iTime) {
		if (oPendingInteraction) {
			let oFinshedInteraction;
			oPendingInteraction.legacyEndTime = oPendingInteraction.legacyEndTime || now(); //ts
			oPendingInteraction.legacyDuration = oPendingInteraction.legacyEndTime - oPendingInteraction.start; //ms
			oPendingInteraction.end = iTime; //ts
			oPendingInteraction.duration = oPendingInteraction.end - oPendingInteraction.start; //ms
			// copy missing entries into cache
			aTimingCache.push(...performance.getEntriesByType("resource"));
			// sort by start time like done in performance.getEntriesByType
			aTimingCache.sort((a, b) => {
				return a.startTime - b.startTime;
			});
			oPendingInteraction.requests = aTimingCache.filter(isValidInteractionXHR);

			// calculate the roundtrip time for all valid requests
			oPendingInteraction.roundtrip = oValidAggregatedTiming ? oValidAggregatedTiming.roundtrip + (oValidAggregatedTiming.roundtripHigherLimit - oValidAggregatedTiming.roundtripLowerLimit) : 0;
			// set navigation time for all valid requests
			oPendingInteraction.navigation = oValidAggregatedTiming ? oValidAggregatedTiming.navigation : 0;

			// calculate the last roundtrip time for all requests to calculate CPU time correctly
			oPendingInteraction.roundtripAllRequests = oAggregatedTiming ? oAggregatedTiming.roundtrip + (oAggregatedTiming.roundtripHigherLimit - oAggregatedTiming.roundtripLowerLimit) : 0;

			// calculate average network time per request
			if (oPendingInteraction.fesrecTime) {
				const iTotalNetworkTime = oPendingInteraction.fesrecRequestTime - oPendingInteraction.fesrecTime;
				oPendingInteraction.networkTime = iTotalNetworkTime / oPendingInteraction.fesrecRequestCount;
			} else {
				oPendingInteraction.networkTime = 0;
			}

			oPendingInteraction.completeRoundtrips = 0;
			oPendingInteraction.measurements = Measurement.filterMeasurements(isCompleteMeasurement, true);
			oPendingInteraction.completeRoundtrips = oPendingInteraction.requests.length;

			// calculate CPU exclusive time if all neccessary infos are available. Otherwise set it to -1
			const iProcessing = oPendingInteraction.duration - oPendingInteraction.roundtripAllRequests;
			oPendingInteraction.processing = iRequestCounter > 0 ? -1 : iProcessing;

			oPendingInteraction.completed = true;

			// Duration threshold 2 in order to filter not performance relevant aInteractions such as liveChange
			if (oPendingInteraction.semanticStepName || oPendingInteraction.duration >= 2 || oPendingInteraction.requests.length > 0 || bIsNavigation) {
				aInteractions.push(oPendingInteraction);
				oFinshedInteraction = aInteractions[aInteractions.length - 1];
				if (Log.isLoggable()) {
					Log.debug("Interaction step finished: trigger: " + oPendingInteraction.trigger + "; duration: " + oPendingInteraction.duration + "; requests: " + oPendingInteraction.requests.length, "_InteractionImpl.js");
				}
			}
			// Execute onInteractionFinished always in case function exist to enable cleanup in FESR independent of filtering
			if (FESR?.onInteractionFinished) {
				FESR.onInteractionFinished(oFinshedInteraction);
			}
			Object.freeze(oPendingInteraction);
			oAggregatedTiming = null;
			oValidAggregatedTiming = null;
			oPendingInteraction = null;
			oCurrentBrowserEvent = null;
			bIsNavigation = false;
			bMatched = false;
			bPerfectMatch = false;
			aTimingCache = [];
			clearTimeout(iResetCurrentBrowserEventTimer);
		}
	}

	// component determination - heuristic
	function createOwnerComponentInfo(oSrcElement) {
		let sName, sId, sVersion;
		if (oSrcElement) {
			const Component = sap.ui.require("sap/ui/core/Component");
			if (Component) {
				while (oSrcElement && oSrcElement.getParent) {
					let oComponent = Component.getOwnerComponentFor(oSrcElement);
					if (oComponent || oSrcElement instanceof Component) {
						oComponent = oComponent || oSrcElement;
						const oApp = oComponent.getManifestEntry("sap.app");
						// get app id or module name for FESR
						sId = oComponent.getId();
						sName = oApp && oApp.id || oComponent.getMetadata().getName();
						sVersion = oApp && oApp.applicationVersion && oApp.applicationVersion.version;
					}
					oSrcElement = oSrcElement.getParent();
				}
			}
		}
		return {
			id: sId,
			name: sName ? sName : "undetermined",
			version: sVersion ? sVersion : ""
		};
	}

	/* As UI5 resources gets also loaded via script tags we need to
	 * intercept this kind of loading as well. We assume that changing the
	 * 'src' property indicates a resource loading via a script tag. In some cases
	 * the src property will be updated multiple times, so we should intercept
	 * the same script tag only once (dataset.sapUiCoreInteractionHandled)
	 */
	function interceptScripts() {
		const descScriptSrc = Object.getOwnPropertyDescriptor(HTMLScriptElement.prototype, "src");
		Object.defineProperty(HTMLScriptElement.prototype, "src", {
			set: function(val) {
				var fnDone;

				if (!this.dataset.sapUiCoreInteractionHandled) {
					fnDone = _InteractionImpl.notifyAsyncStep("request");
					this.addEventListener("load", function() {
						fnDone();
					});
					this.addEventListener("error" , function() {
						fnDone();
					});
					this.dataset.sapUiCoreInteractionHandled = "true";
				}
				descScriptSrc.set.call(this, val);
			},
			get: descScriptSrc.get
		});
	}

	function registerXHROverrides() {
		// store the byte size of the body
		XHRInterceptor.register("INTERACTION", "send" ,function() {
			if (this.oPendingInteraction && !isCrossOriginURL(this[UI5_URL_SYMBOL])) {
				// double string length for byte length as in js characters are stored as 16 bit ints
				mRequestInfo.get(this._id).bytesSent += arguments[0] ? arguments[0].length : 0;
			}
		});

		// store request header size
		XHRInterceptor.register("INTERACTION", "setRequestHeader", function(sHeader, sValue) {
			if (oPendingInteraction && !isCrossOriginURL(this[UI5_URL_SYMBOL])) {
				mRequestInfo.get(this._id).bytesSent += (sHeader + "").length + (sValue + "").length;
			}
		});

		// register the response handler for data collection
		XHRInterceptor.register("INTERACTION", "open", function (sMethod, sUrl, bAsync) {

			// remember url for later use in handleResponse/setRequestHeader
			this[UI5_URL_SYMBOL] = new URL(sUrl, document.baseURI).href;

			if (oPendingInteraction && !isCrossOriginURL(this[UI5_URL_SYMBOL])) {
				// only use Interaction for non CORS requests
				this.addEventListener("readystatechange", handleResponse.bind(this, oPendingInteraction.id, _InteractionImpl.notifyAsyncStep("request")));
				const oRequestInfo = Object.create(null);
				// init bytesSent
				oRequestInfo.bytesSent = 0;
				// assign the current interaction to the xhr for later response header retrieval.
				oRequestInfo.pendingInteraction = oPendingInteraction;
				mRequestInfo.set(this._id, oRequestInfo);
			}
		});

	}

	// check if SAP compression rules are fulfilled
	function checkCompression(sURL, sContentEncoding, sContentType, sContentLength) {
		//remove hashes and queries + find extension (last . segment)
		var fileExtension = sURL.split('.').pop().split(/\#|\?/)[0];

		if (sContentEncoding === 'gzip' ||
			sContentEncoding === 'br' ||
			sContentType in mCompressedMimeTypes ||
			(fileExtension && sCompressedExtensions.indexOf(fileExtension) !== -1) ||
			sContentLength < 1024) {
				return true;
		} else {
			return false;
		}
	}

	// response handler which uses the custom properties we added to the xhr to retrieve information from the response headers
	function handleResponse(sId, fnDone) {
		if (this.readyState === 4) {
			const oRequestInfo = mRequestInfo.get(this._id);
			let aTimings = performance.getEntriesByType("resource");
			aTimingCache.push(...aTimings);
			performance.clearResourceTimings();
			if (aTimings.length && !oPendingInteraction?.completed && oPendingInteraction?.id === sId) {
				if (oRequestInfo) {
					aTimings = aTimings.filter((timing) => {
						return timing.name === this[UI5_URL_SYMBOL];
					});
					// enrich interaction with information
					const sContentLength = this.getResponseHeader("content-length"),
						bCompressed = checkCompression(this.responseURL, this.getResponseHeader("content-encoding"), this.getResponseHeader("content-type"), sContentLength),
						sFesrec = this.getResponseHeader("sap-perf-fesrec");

					oRequestInfo.bytesReceived = sContentLength ? parseInt(sContentLength) : 0;
					oRequestInfo.bytesReceived = this.getAllResponseHeaders().length;
					// this should be true only if all responses are compressed
					oRequestInfo.requestCompression = bCompressed;

					// sap-perf-fesrec header contains milliseconds
					oRequestInfo.fesrecTime = sFesrec ? Math.round(parseFloat(sFesrec, 10) / 1000) : 0;
					const sSapStatistics = this.getResponseHeader("sap-statistics");
					aTimings[0][UI5_REQUEST_INFO_SYMBOL] = oRequestInfo;
					if (sSapStatistics) {
						oRequestInfo.pendingInteraction.sapStatistics.push({
							// add response url for mapping purposes
							url: this.responseURL,
							statistics: sSapStatistics,
							timing: aTimings ? aTimings[aTimings.length - 1] : undefined
						});
					}
				}
			}
			fnDone();
		}
	}

	var _InteractionImpl = {
		getAll : function(bFinalize) {
			if (bFinalize) {
				// force the finalization of the currently pending interaction
				_InteractionImpl.end(true);
			}
			return aInteractions;
		},

		filter : function(fnFilter) {
			var aFilteredInteractions = [];
			if (fnFilter) {
				for (var i = 0, l = aInteractions.length; i < l; i++) {
					if (fnFilter(aInteractions[i])) {
						aFilteredInteractions.push(aInteractions[i]);
					}
				}
			}
			return aFilteredInteractions;
		},

		getPending : function() {
			return oPendingInteraction;
		},

		clear : function() {
			aInteractions = [];
		},

		start : function(sType, oSrcElement) {
			const iTime = sType === "startup" ? performance.timeOrigin : now();

			if (oPendingInteraction) {
				finalizeInteraction(iTime);
			}

			//reset async counter/timer
			if (iInteractionStepTimer) {
				clearTimeout(iInteractionStepTimer);
			}

			iInteractionCounter = 0;
			iRenderingCounter = 0;
			iRequestCounter = 0;

			// clear request timings for new interaction
			if (sType !== "startup" && performance.clearResourceTimings) {
				performance.clearResourceTimings();
			}

			// setup new pending interaction
			oPendingInteraction = createMeasurement(iTime);

			const oComponentInfo = createOwnerComponentInfo(oSrcElement);
			oPendingInteraction.componentId = oComponentInfo.id;
			oPendingInteraction.component = oComponentInfo.name;

			oPendingInteraction.event = sType;
			oPendingInteraction.appVersion = oComponentInfo.version;
			if (oSrcElement && oSrcElement.getId) {
				oPendingInteraction.trigger = oSrcElement.getId();
				oPendingInteraction.semanticStepName = FESRHelper.getSemanticStepname(oSrcElement, sType);
			}
			/*eslint-disable no-console */
			if (Log.isLoggable(null, "sap.ui.Performance")) {
				console.time("INTERACTION: " + oPendingInteraction.trigger + " - " + oPendingInteraction.event);
			}
			/*eslint-enable no-console */
			if (Log.isLoggable()) {
				Log.debug("Interaction step started: trigger: " + oPendingInteraction.trigger + "; type: " + oPendingInteraction.event, "_InteractionImpl.js");
			}
		},

		end : function(bForce) {
			if (oPendingInteraction) {
				if (bForce) {
					/*eslint-disable no-console */
					if (Log.isLoggable(null, "sap.ui.Performance")) {
						console.timeEnd("INTERACTION: " + oPendingInteraction.trigger + " - " + oPendingInteraction.event);
					}
					/*eslint-enable no-console */
					finalizeInteraction(oPendingInteraction.preliminaryEnd || now());
					if (Log.isLoggable()) {
						Log.debug("Interaction ended...");
					}
				} else {
					// set provisionary processing time from start to end and calculate later
					oPendingInteraction.preliminaryEnd = now();
				}
			}
		},

		notifyNavigation: function() {
			bIsNavigation = true;
		},

		notifyShowBusyIndicator : function(oControl) {
			oControl._sapui_fesr_fDelayedStartTime = now() + oControl.getBusyIndicatorDelay();
		},

		notifyHideBusyIndicator : function(oControl) {
			if (oControl._sapui_fesr_fDelayedStartTime) {
				// The busy indicator shown duration d is calculated with:
				// d = "time busy indicator was hidden" - "time busy indicator was requested" - "busy indicator delay"
				var fBusyIndicatorShownDuration = now() - oControl._sapui_fesr_fDelayedStartTime;
				_InteractionImpl.addBusyDuration((fBusyIndicatorShownDuration > 0) ? fBusyIndicatorShownDuration : 0);
				delete oControl._sapui_fesr_fDelayedStartTime;
			}
		},

		notifyStepStart : function(sEventId, oElement, bForce) {
			if (bInteractionActive) {
				let sType,
					elem,
					sClosestSemanticStepName;

				if ((!oPendingInteraction && oCurrentBrowserEvent) || bForce) {
					if (bForce) {
						sType = "startup";
					} else {
						sType = sEventId;
					}
					_InteractionImpl.start(sType, oElement);
					oPendingInteraction = _InteractionImpl.getPending();

					// update pending interaction infos
					if (oPendingInteraction && !oPendingInteraction.completed && FESR?.onInteractionStarted) {
						oPendingInteraction.passportAction = FESR.onInteractionStarted(oPendingInteraction, bForce);
					}
					// _InteractionImpl.start will delete oCurrentBrowserEvent in case there is an oPendingInteraction
					// (notifyStepStart is called with parameter bForce)
					// Conscious decision to not move the coding because this shouldn't be a productive scenario
					if (oCurrentBrowserEvent) {
						oBrowserElement = oCurrentBrowserEvent.srcControl;
					}
					// if browser event matches the first control event we take it for trigger/event determination (step name)
					sClosestSemanticStepName = FESRHelper.getSemanticStepname(oBrowserElement, sEventId);
					if (oElement && oElement.getId && oBrowserElement && oElement.getId() === oBrowserElement.getId()) {
						bPerfectMatch = true;
					} else if (sClosestSemanticStepName) {
						oPendingInteraction.trigger = oBrowserElement.getId();
						oPendingInteraction.semanticStepName = sClosestSemanticStepName;
						bPerfectMatch = true;
					} else {
						elem = oBrowserElement;
						while (elem && elem.getParent()) {
							elem = elem.getParent();
							if (oElement.getId() === elem.getId()) {
								// Stop looking for better fitting control in case the current browser event source control
								// is already child of the control event which triggers the interaction because all other
								// control events most likely does not suit better.
								// Example: Click on image of an button will not pass the previous if
								// (oElement.getId() !== oBrowserElement.getId() ==> btn !== btn-img).
								// In case the button is part of an popover and the click on the button closes the popover,
								// the coding below overwrites the button control id with the popover control id in case we
								// don't stop here.
								// Only look for better fitting control in case browser and control event does not fit at all
								bMatched = true;
								break;
							}
						}
					}
					oCurrentBrowserEvent = null;
					bIsNavigation = false;
					iResetCurrentBrowserEventTimer = setTimeout(function() {
						//cleanup internal registry after actual call stack.
						oCurrentBrowserEvent = null;
					}, 0);
					bIdle = false;
					_InteractionImpl.notifyStepEnd(true); // Start timer to end Interaction in case there is no timing relevant action e.g. rendering, request
				} else if (oPendingInteraction && oBrowserElement && !bPerfectMatch) {
					// if browser event matches one of the next control events we take it for trigger/event determination (step name)
					elem = oBrowserElement;
					sClosestSemanticStepName = FESRHelper.getSemanticStepname(oBrowserElement, sEventId);
					if (elem && oElement.getId() === elem.getId()) {
						oPendingInteraction.trigger = oElement.getId();
						oPendingInteraction.semanticStepName = sClosestSemanticStepName;
						oPendingInteraction.event = sEventId;
						bPerfectMatch = true;
					} else if (sClosestSemanticStepName) {
						oPendingInteraction.trigger = oBrowserElement.getId();
						oPendingInteraction.semanticStepName = sClosestSemanticStepName;
						bPerfectMatch = true;
					} else if (!bMatched) {
						while (elem && elem.getParent()) {
							elem = elem.getParent();
							if (oElement.getId() === elem.getId()) {
								oPendingInteraction.trigger = oElement.getId();
								oPendingInteraction.semanticStepName = FESRHelper.getSemanticStepname(oElement, sEventId);
								oPendingInteraction.event = sEventId;
								//if we find no direct match we consider the last control event for the trigger/event (step name)
								break;
							}
						}
					}
				}
			}
		},

		notifyControlRendering : function(sOwnerId, sStepName) {
			if (oPendingInteraction) {
				iRenderingCounter++;
				if (Log.isLoggable()) {
					Log.debug("Interaction relevant step started - Number of pending steps: " + (iInteractionCounter + iRenderingCounter + iRequestCounter));
				}
				return function() {
					iRenderingCounter--;
					const a2aComponentId = _InteractionImpl._a2aNavInfo.get(oPendingInteraction.hash);
					if (oPendingInteraction.componentId) {
						if (a2aComponentId && a2aComponentId === sOwnerId || sOwnerId === oPendingInteraction.componentId) {
							_InteractionImpl.end(); // set preliminary end time
						}
					} else {
						_InteractionImpl.end(); // set preliminary end time
					}
					_InteractionImpl.notifyStepEnd(true);
					if (Log.isLoggable()) {
						Log.debug("Interaction relevant step stopped - Number of pending steps: " + (iInteractionCounter + iRenderingCounter + iRequestCounter));
					}
					/*eslint-disable no-console */
					if (Log.isLoggable(null, "sap.ui.Performance") && sStepName) {
						console.timeEnd(sStepName);
					}
					/*eslint-enable no-console */
				};
			} else {
				return function() {};
			}
		},

		notifyAsyncStep : function(sType, sStepName) {
			if (oPendingInteraction) {
				/*eslint-disable no-console */
				if (Log.isLoggable(null, "sap.ui.Performance") && sStepName) {
					console.time(sStepName);
				}
				/*eslint-enable no-console */
				var sInteractionId = oPendingInteraction.id;
				_InteractionImpl.notifyAsyncStepStart(sType);
				return function() {
					_InteractionImpl.notifyAsyncStepEnd(sType, sInteractionId);
					/*eslint-disable no-console */
					if (Log.isLoggable(null, "sap.ui.Performance") && sStepName) {
						console.timeEnd(sStepName);
					}
					/*eslint-enable no-console */
				};
			} else {
				return function() {};
			}
		},

		notifyAsyncStepStart : function(sType) {
			if (oPendingInteraction) {
				if (sType === "request") {
					iRequestCounter++;
				} else {
					iInteractionCounter++;
				}
				clearTimeout(iInteractionStepTimer);
				delete oPendingInteraction.legacyEndTime;
				bIdle = false;
				if (Log.isLoggable()) {
					Log.debug("Interaction relevant step started - Number of pending steps: " + (iInteractionCounter + iRenderingCounter + iRequestCounter));
				}
			}
		},

		notifyAsyncStepEnd : function(sType, sId) {
			if (oPendingInteraction && sId === oPendingInteraction.id) {
				if (sType === "request") {
					iRequestCounter--;
				} else {
					iInteractionCounter--;
				}
				_InteractionImpl.notifyStepEnd(true);
				if (Log.isLoggable()) {
					Log.debug("Interaction relevant step stopped - Number of pending steps: " + (iInteractionCounter + iRenderingCounter + iRequestCounter));
				}
			}
		},

		notifyStepEnd : function(bCheckIdle) {
			if (bInteractionActive) {
				if ((iInteractionCounter === 0 && iRenderingCounter === 0 && iRequestCounter === 0) || !bCheckIdle) {
					if (bIdle || !bCheckIdle) {
						_InteractionImpl.end(true);
						if (Log.isLoggable()) {
							Log.debug("Interaction stopped");
						}
						bIdle = false;
					} else {
						oPendingInteraction.legacyEndTime = now();
						bIdle = true;
						if (iInteractionStepTimer) {
							clearTimeout(iInteractionStepTimer);
						}
						// There are control events using a debouncing mechanism for e.g. suggest event (see sap.m.Input)
						// A common debounce treshhold (also used by sap.m.Input) is 300ms therefore we use setTimeout
						// with 301ms to end the Interaction after execution of the debounced event
						iInteractionStepTimer = setTimeout(_InteractionImpl.notifyStepEnd, 301);
						if (Log.isLoggable()) {
							Log.debug("Interaction check for bIdle time - Number of pending steps: " + (iInteractionCounter + iRenderingCounter + iRequestCounter));
						}
					}
				}
			}
		},

		notifyEventStart : function(oEvent) {
			oCurrentBrowserEvent = bInteractionActive ? oEvent : null;
		},

		notifyScrollEvent : function(oEvent) {
			/* Scrolling is disabled as it does not work properly for non user triggered scrolling */
		},

		notifyEventEnd : function() {
			if (oCurrentBrowserEvent) {
				// End interaction when a new potential interaction starts
				if (oCurrentBrowserEvent.type.match(/^(mousedown|touchstart|keydown)$/)) {
					_InteractionImpl.end(/*bForce*/true);
				}
				// Clean up oCurrentBrowserEvent at the end to prevent dangling events
				// Since oCurrentBrowser event is prerequisite to start an event we need to
				// clean dangling browser events to avoid creating aInteractions based on these events
				// e.g. The user clicks first somewhere on the UI on a control without press handler.
				// After that the user scrolls in a table and triggers implicit requests via paging.
				// This combination will create an interaction based on the first browser event,
				// created and not cleaned up by the first click within the UI
				if (this.eventEndTimer) {
					clearTimeout(this.eventEndTimer);
				}
				this.eventEndTimer = setTimeout(function() {
					oCurrentBrowserEvent = null;
					delete this.eventEndTimer;
				// There are events fired within a timeout with delay. Cleanup after 10ms
				// to hopefully prevent cleaning up to early (before control event was fired)
				}.bind(this), 10);
			}
		},

		setStepComponent : function(sComponentName) {
			if (bInteractionActive && oPendingInteraction && sComponentName && !oPendingInteraction.stepComponent) {
				oPendingInteraction.stepComponent = sComponentName;
			}
		},

		addBusyDuration : function (iDuration) {
			if (bInteractionActive && oPendingInteraction) {
				if (!oPendingInteraction.busyDuration) {
					oPendingInteraction.busyDuration = 0;
				}
				oPendingInteraction.busyDuration += iDuration;
			}
		},

		_setActive: function(bActive) {
			bInteractionActive = bActive;
			if (bActive) {
				_InteractionImpl.notifyStepStart("startup", "startup", true);
				// listen to hash changes. If the first degment changes we guess its an A2A navigation
				globalThis.addEventListener('hashchange', function() {
					// Get the hash from the current URL
					const hash = globalThis.location.hash;

					// Regular expression to extract the first segment of the hash
					const match = hash.match(/#([^&/]+)/);

					if (match?.[0]) {
						if (!lastHash) {
							lastHash = match[0];
						} else if (lastHash !== match[0]) {
							if (this.getPending() && !this.getPending().maybeA2A) {
								// mark pending interaction as A2A navigation
								this.getPending().maybeA2A = match[0];
							}
							lastHash = match[0];
						}
					}
				}.bind(this));
				// Get the initial hash from the current URL
				lastHash = lastHash || globalThis.location.hash.match(/#([^&/]+)/)?.[0];
			}
		},

		_setFESR: function(oFESR) {
			FESR = oFESR;
		},

		_a2aNavInfo: new Map(),

		_createOwnerComponentInfo: createOwnerComponentInfo

	};

	registerXHROverrides();
	interceptScripts();

	LoaderExtensions.notifyResourceLoading = _InteractionImpl.notifyAsyncStep.bind(this, "request");

	return _InteractionImpl;
});
