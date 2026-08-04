/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/Log",
	"sap/ui/core/Element",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/fl/write/api/ChangesWriteAPI",
	"sap/ui/fl/support/api/SupportAPI"
], function(
	Log,
	Element,
	JsControlTreeModifier,
	OverlayRegistry,
	ChangesWriteAPI,
	SupportAPI
) {
	"use strict";

	/**
	 * Service to register message event listeners for the communication with the
	 * Flex Support web extension.
	 *
	 * This is implemented as a service and not as part of the injected script because
	 * there is no easy way to retrieve the RuntimeAuthoring instance otherwise.
	 *
	 * @namespace
	 * @name sap.ui.rta.service.OverlayInfo
	 * @author SAP SE
	 * @since 1.152
	 * @version ${version}
	 * @private
	 * @ui5-restricted
	 */

	const sHighlightClass = "sapUiFlexibilitySupportExtension_Selected";
	const sGlobalVariableName = "ui5flex$temp";
	const sMessageId = "ui5FlexibilitySupport.submodules.overlayInfo";
	// Prefix for the message IDs used on the shared flex support channel, so OverlayInfo
	// traffic does not collide with the flex messages on the same channel.
	const sBrokerMessagePrefix = "overlayInfo.";
	window[sGlobalVariableName] = {}; // Container for all temp. variables
	const aTempVariables = window[sGlobalVariableName];
	let nTempVarCount = 0;
	// Set per service start by the factory. Determines whether postToExtension uses the
	// direct (same-window) path or the broker path.
	let bBrokerScenario = false;
	// In the broker scenario the app client must not publish before the support client (the
	// extension host bridge) is connected; publishing to a non-connected target makes the
	// ushell MessageBroker log errors. Presence is detected via the broker's connection
	// callback ("clientSubscribed" / "clientUnsubscribed", see fnOnClientConnectionChange);
	// until the support client subscribes, app-initiated pushes are skipped.
	let bSupportClientConnected = false;

	/*
	 * Detects the cFLP scenario: the RTA/app runs inside an iFrame while the support
	 * extension runs in the outer frame. Same-window window.postMessage cannot cross that
	 * boundary, so in this scenario the communication is routed through the sap.ushell
	 * MessageBroker (reusing the sap.ui.fl support channel via SupportAPI). The direct
	 * (same-window) path is kept unchanged for standalone / in-frame scenarios.
	 *
	 * The scenario requires BOTH an iFrame (window.parent !== window) AND a reachable
	 * ushell container (the MessageBroker lives there). The ushell check also keeps the
	 * QUnit test runner - which loads the test page in an iFrame but has no ushell - on
	 * the direct path.
	 *
	 * Evaluated per service start (not at module load).
	 *
	 * @returns {boolean} true if the RTA runs inside a cFLP iFrame
	 */
	function isBrokerScenario() {
		return window.parent !== window && !!window.sap?.ushell?.Container;
	}

	/**
	 * Logs a message to the console
	 * @param {string} sMessage - Message to be logged
	 * @param {object} oVariable - Variable containing Object to be logged
	 */
	function logToConsole(sMessage, oVariable) {
		console.log(`Flextention: ${sMessage}`); // eslint-disable-line no-console
		if (oVariable) {
			console.log(oVariable); // eslint-disable-line no-console
		}
	}

	/*
	 * Sends a message to the support extension.
	 * Direct (standalone / in-frame) scenario: same-window window.postMessage (unchanged behavior).
	 * cFLP scenario: routed through the flex support MessageBroker via SupportAPI.
	 *
	 * @param {string} sType - The message type
	 * @param {object} oContent - The message content
	 */
	function postToExtension(sType, oContent) {
		if (bBrokerScenario) {
			// Only publish when the support client (extension host bridge) is connected.
			// Publishing to a missing target client makes the ushell MessageBroker log errors.
			if (!bSupportClientConnected) {
				return;
			}
			Promise.resolve(SupportAPI.publishToSupportClient(sBrokerMessagePrefix + sType, oContent))
			.catch((oError) => {
				// The support client may have disconnected (extension closed) between the
				// presence check and the publish. Treat as "no one listening" and mark it so.
				bSupportClientConnected = false;
				Log.info(`OverlayInfo: could not publish '${sType}' to the support client`, oError?.message);
			});
			return;
		}
		window.postMessage({
			type: sType,
			id: sMessageId,
			content: oContent
		});
	}

	function getPluginChangeHandler(oPlugin, oElementOverlay, oRta) {
		const oAction = oPlugin.getAction(oElementOverlay);
		if (oAction && oAction.changeType) {
			const oElement = oAction.changeOnRelevantContainer
				? oElementOverlay.getRelevantContainer()
				: oElementOverlay.getElement();
			return ChangesWriteAPI.getChangeHandler({
				changeType: oAction.changeType,
				element: oElement,
				modifier: JsControlTreeModifier,
				layer: oRta.getLayer()
			})
			.then(function(oChangeHandler) {
				return oChangeHandler;
			})
			.catch(function() {
				return;
			});
		}
		return Promise.resolve(undefined);
	}

	function isPluginForSibling(sPluginName) {
		if (sPluginName.endsWith(".asSibling")) {
			return true;
		}
		if (sPluginName.endsWith(".asChild")) {
			return false;
		}
		return undefined;
	}

	function getPluginByName(oRta, sPluginName) {
		const bIsSibling = isPluginForSibling(sPluginName);
		const oAllPlugins = oRta.getPlugins();
		return Object.values(oAllPlugins).find(function(oPlugin) {
			const sName = oPlugin._retrievePluginName
				? oPlugin._retrievePluginName(bIsSibling)
				: oPlugin.getMetadata().getName();
			return sName === sPluginName;
		});
	}

	/*
	 * Removes the highlighting of a non-selectable overlay
	 */
	function removeSelectionHighlight() {
		const aHighlightedDom = document.getElementsByClassName(sHighlightClass);
		if (aHighlightedDom.length > 0) {
			aHighlightedDom[0].classList.remove(sHighlightClass);
		}
	}

	/*
	 * Returns information about an overlay, namely:
	 * For every plugin that is part of the "editableByPlugins"
	 * aggregation, we return the plugin name and the result for
	 * isAvailable(). If the change handler can be determined, we
	 * return this information, which enables a button allowing the
	 * key user to print the change handler to the console.
	 *
	 * @param {sap.ui.rta.RuntimeAuthoring} oRta - Instance of the RuntimeAuthoring class
	 * @param {object} mPayload - Property Bag
	 * @param {string} mPayload.overlayId
	 * @returns {Promise<object|null>} Resolves with the overlay info
	 */
	async function getOverlayInfo(oRta, mPayload) {
		const oOverlay = Element.getElementById(mPayload.overlayId);
		if (!oOverlay) {
			return null;
		}
		const oElement = oOverlay.getElement();

		// remove previous selection highlighting on clicking in the app
		if (oOverlay.getSelectable()) {
			removeSelectionHighlight();
		}

		const mEditableByPlugins = oOverlay.getEditableByPlugins();
		const aEditableByPlugins = Object.keys(mEditableByPlugins)
		.filter(function(sPluginName) {
			return mEditableByPlugins[sPluginName];
		});

		const aPlugins = await Promise.all(aEditableByPlugins.map(async function(sPluginName) {
			const oInstance = getPluginByName(oRta, sPluginName);
			const bIsSibling = isPluginForSibling(sPluginName);

			const oChangeHandler = await getPluginChangeHandler(oInstance, oOverlay, oRta);
			return {
				name: sPluginName,
				isAvailable: oInstance.isAvailable([oOverlay], bIsSibling),
				hasChangeHandler: !!oChangeHandler
			};
		}));

		return {
			elementId: oElement.getId(),
			elementControlType: oElement.getMetadata().getName(),
			overlayId: oOverlay.getId(),
			plugins: aPlugins
		};
	}

	/*
	 * Collects the overlay info for the given overlay and pushes it to the support extension
	 * as an "overlayInfo" message. Used both as the response to a "getOverlayInfo" request and
	 * for the app-initiated focus push.
	 *
	 * @param {sap.ui.rta.RuntimeAuthoring} oRta - Instance of the RuntimeAuthoring class
	 * @param {string} sOverlayId - ID of the Overlay
	 * @returns {Promise<void>} Resolves once the info was pushed (or skipped if no overlay)
	 */
	async function sendOverlayInfo(oRta, sOverlayId) {
		const oOverlayInfo = await getOverlayInfo(oRta, { overlayId: sOverlayId });
		if (oOverlayInfo) {
			postToExtension("overlayInfo", oOverlayInfo);
		}
	}

	/**
	 * Prints the change handler to the console
	 * @param {sap.ui.rta.RuntimeAuthoring} oRta - Instance of the RuntimeAuthoring class
	 * @param {object} mPayload - Property Bag
	 * @param {string} mPayload.overlayId - ID of the Overlay
	 * @param {string} mPayload.pluginName - Name of the Plugin
	 */
	async function printChangeHandler(oRta, mPayload) {
		const oOverlay = Element.getElementById(mPayload.overlayId);
		const oPlugin = getPluginByName(oRta, mPayload.pluginName);
		const oChangeHandler = await getPluginChangeHandler(oPlugin, oOverlay, oRta);
		if (oPlugin) {
			try {
				const sPluginId = oPlugin.getId();
				const sTempVariableName = aTempVariables[sPluginId] && aTempVariables[sPluginId].savedAs || `ui5flex$${nTempVarCount++}`;
				aTempVariables[sPluginId] = {
					description: `ChangeHandler for Plugin: ${sPluginId} - ${mPayload.pluginName}`,
					changeHandler: oChangeHandler,
					savedAs: sTempVariableName
				};
				const oVariable = aTempVariables[sPluginId];
				window[sTempVariableName] = aTempVariables[sPluginId];
				const sMessage = `ChangeHandler copied to global var ${sTempVariableName}, all vars are collected in global var ${sGlobalVariableName}`;
				logToConsole(sMessage, oVariable);
			} catch (oError) {
				// Ignore errors
			}
		} else {
			logToConsole("ChangeHandler could not be logged", undefined);
		}
	}

	/*
	 * Closes the ContextMenu of the UI-Adaptation (if open)
	 * This method is called when user selects a non-selectable
	 * Overlay in Flex Support web extension (Overlay section)
	 *
	 * @param {sap.ui.rta.RuntimeAuthoring} oRta - Instance of the RuntimeAuthoring class
	 */
	function closeContextMenu(oRta) {
		if (document.getElementsByClassName("sapUiDtContextMenu").length > 0) {
			const oContextMenu = oRta.getPlugins().contextMenu;
			oContextMenu.oContextMenuControl.close();
		}
	}

	/*
	 * Changes the focus/selection in UI-Adaptation
	 * This method is called when user selects an entry in
	 * the overlay table of the Flex Support web extension (Overlay Info Section)
	 *
	 * @param {sap.ui.rta.RuntimeAuthoring} oRta - Instance of the RuntimeAuthoring class
	 * @param {object} mPayload - Property Bag
	 * @param {string} mPayload.overlayId - ID of the Overlay
	 */
	function changeOverlaySelection(oRta, mPayload) {
		// set new focus and enforce collecting overlay info data
		const oOverlay = Element.getElementById(mPayload.overlayId);
		oOverlay.focus();
		if (bBrokerScenario) {
			// In the broker scenario re-posting a getOverlayInfo message to the window would
			// not reach the (broker-registered) command handler, so collect and push the
			// overlay info directly.
			sendOverlayInfo(oRta, oOverlay.getId()).catch((oError) => {
				Log.info("OverlayInfo: could not send overlay info", oError?.message);
			});
		} else {
			// Direct scenario (unchanged behavior): re-post a getOverlayInfo message to the
			// window, which re-enters onMessageReceived and pushes the overlayInfo result.
			postToExtension("getOverlayInfo", {
				overlayId: oOverlay.getId()
			});
		}

		// remove previous selection highlighting
		removeSelectionHighlight();
		// close the contextmenu in UI-Adaptation
		closeContextMenu(oRta);

		// remove current selection(s)
		const aSelection = oRta.getSelection();
		aSelection.forEach(function(oSelectedOverlay) {
			oSelectedOverlay.setSelected(false);
		});

		// set new selection (selectable overlays)
		if (oOverlay.getSelectable()) {
			oOverlay.setSelected(true);
		} else if (oOverlay.getDomRef()) {
			// highlight unselectable overlay
			oOverlay.getDomRef().classList.add("sapUiFlexibilitySupportExtension_Selected");
		}
	}

	/*
	 * Collects all relevant data for the overlay table in
	 * Flex Support web extension (Overlay section)
	 * This method is called during initialization of the
	 * Overlay section and on pressing the "Reload" button
	 */
	function collectOverlayTableData() {
		// create an array with all relevant overlays (no aggregation overlays)
		const aAllOverlays = OverlayRegistry.getOverlays();
		const aRelevantOverlayList = [];
		aAllOverlays.forEach(function(oOverlay) {
			if (!oOverlay.isA("sap.ui.dt.AggregationOverlay")) {
				const sParentId = oOverlay.getParentElementOverlay()?.getId();
				const aChildren = oOverlay.getChildren().map(function(oChild) {
					return oChild.getId();
				});
				aRelevantOverlayList.push({
					id: oOverlay.getId(),
					parentId: sParentId,
					elementId: oOverlay.getElement().getId(),
					visible: oOverlay.getSelectable() && oOverlay.isVisible(),
					idNum: parseInt(oOverlay.getId().replace("__overlay", "")),
					children: aChildren,
					hasParent: sParentId !== undefined
				});
			}
		});
		return aRelevantOverlayList;
	}

	/**
	 * Prints the design time metadata to the console
	 * @param {sap.ui.rta.RuntimeAuthoring} oRta - Instance of the RuntimeAuthoring class
	 * @param {object} mPayload - Property Bag
	 * @param {string} mPayload.overlayId - ID of the Overlay
	 */
	function printDesignTimeMetadata(oRta, mPayload) {
		const oOverlay = Element.getElementById(mPayload.overlayId);
		const oMetaData = oOverlay.getDesignTimeMetadata().getData();
		if (oMetaData) {
			try {
				const sMetaDataId = oOverlay.getDesignTimeMetadata().getId();
				const sTempVariableName = aTempVariables[sMetaDataId] && aTempVariables[sMetaDataId].savedAs || `ui5flex$${nTempVarCount++}`;
				aTempVariables[sMetaDataId] = {
					description: `DesignTimeMetaData: ${sMetaDataId} for Overlay: ${mPayload.overlayId}`,
					metaData: oMetaData,
					savedAs: sTempVariableName
				};
				const oVariable = aTempVariables[sMetaDataId];
				window[sTempVariableName] = aTempVariables[sMetaDataId];
				const sMessage = `MetaData copied to global var ${sTempVariableName}, all vars are collected in global var ${sGlobalVariableName}`;
				logToConsole(sMessage, oVariable);
			} catch (oError) {
				// Ignore errors
			}
		} else {
			logToConsole("DesignTimeMetaData could not be logged", undefined);
		}
	}

	// List of supported handlers, keyed by message type. All OverlayInfo messages use the
	// submodule id sMessageId (direct scenario) resp. the sBrokerMessagePrefix (broker scenario).
	const mHandlers = {
		getOverlayInfo: {
			handler: getOverlayInfo,
			returnMessageType: "overlayInfo"
		},
		printChangeHandler: {
			handler: printChangeHandler
		},
		printDesignTimeMetadata: {
			handler: printDesignTimeMetadata
		},
		changeOverlaySelection: {
			handler: changeOverlaySelection
		},
		collectOverlayTableData: {
			handler: collectOverlayTableData,
			returnMessageType: "overlayInfoTableData"
		}
	};

	/*
	 * Handler method for the Rta event "stop"
	 * sends a corresponding message to the
	 * Flex Support web extension (Overlay section)
	 */
	function onRtaStop() {
		postToExtension("rtaStopped", {});
	}

	/*
	 * Sends a message to the Flex Support
	 * web extension (Overlay section) that
	 * UI Adaption has started
	 */
	function onRtaStart() {
		postToExtension("rtaStarted", {});
	}

	/*
	 * Focus listener for the broker (cFLP) scenario. In the direct scenario this listener
	 * lives in the injected script of the support extension (which runs in the same frame
	 * as the app). In cFLP the injected script cannot reach the app frame, so the listener
	 * has to run here (app-side) and push the overlay info through the broker.
	 */
	let fnFocusListener;
	let iFocusDebounce;

	function installFocusListener(oRta) {
		if (fnFocusListener) {
			return;
		}
		fnFocusListener = (oEvent) => {
			const oElement = Element.getElementById(oEvent?.target?.id);
			if (oElement && oElement.isA("sap.ui.dt.Overlay")) {
				// debounce to avoid flooding the broker while the user clicks around
				clearTimeout(iFocusDebounce);
				iFocusDebounce = setTimeout(() => {
					sendOverlayInfo(oRta, oElement.getId()).catch((oError) => {
						Log.info("OverlayInfo: could not send overlay info", oError?.message);
					});
				}, 100);
			}
		};
		window.addEventListener("focus", fnFocusListener, true);
	}

	function removeFocusListener() {
		if (fnFocusListener) {
			window.removeEventListener("focus", fnFocusListener, true);
			fnFocusListener = undefined;
			clearTimeout(iFocusDebounce);
		}
	}

	/*
	 * Executes a command coming from the support extension by looking it up in mHandlers
	 * and, if the handler defines a returnMessageType, pushes the result back.
	 *
	 * @param {sap.ui.rta.RuntimeAuthoring} oRta - Instance of the RuntimeAuthoring class
	 * @param {string} sType - The command type (key in mHandlers)
	 * @param {object} oContent - The command content
	 */
	function handleCommand(oRta, sType, oContent) {
		const mHandler = mHandlers[sType];
		if (!mHandler) {
			return;
		}
		// Receiving a command means a support client is connected and listening, so replies
		// and subsequent pushes are safe to publish.
		bSupportClientConnected = true;
		// Wrap in a Promise executor so a synchronous throw from the handler (e.g. a stale
		// overlayId leading to a null overlay) is caught by the same .catch as an async rejection.
		new Promise((resolve) => {
			resolve(mHandler.handler(oRta, oContent));
		})
		.then((oResult) => {
			if (mHandler.returnMessageType) {
				postToExtension(mHandler.returnMessageType, oResult);
			}
		})
		.catch((oError) => {
			Log.error(`OverlayInfo: command '${sType}' failed`, oError?.message);
		});
	}

	/*
	 * Event handler for the messages sent by the support extension in the direct
	 * (same-window) scenario.
	 *
	 * Messages are contained in oEvent.data - the following properties
	 * are sent:
	 *  - type: specifies, what action should be taken. Possible values:
	 *   - getOverlayInfo (request information about an overlay)
	 *   - printChangeHandler (a specified change handler object is to be printed to the console)
	 *   - printDesignTimeMetadata (the calculated designtime metadata of the overlay is to be printed to the console)
	 * - content: type-specific information, e.g. for getOverlayInfo, an 'overlayId' is provided
	 *
	 * @param {sap.ui.rta.RuntimeAuthoring} oRta - Instance of the RuntimeAuthoring class
	 * @param {object} oEvent - Event thrown by the browser on received message
	 */
	function onMessageReceived(oRta, oEvent) {
		if (oEvent.source !== window) {
			return;
		}
		if (oEvent.data.id !== sMessageId || !mHandlers[oEvent.data.type]) {
			return;
		}
		handleCommand(oRta, oEvent.data.type, oEvent.data.content);
	}

	function OverlayInfoFactory(oRta) {
		bBrokerScenario = OverlayInfoFactory._isBrokerScenario();
		if (bBrokerScenario) {
			// Fresh start: no support client is known to be connected yet.
			bSupportClientConnected = false;
			// Presence detection via the broker's connection callback. The broker notifies us with
			// "clientSubscribed" for every client already subscribed to the channel when we connect
			// (covers the case where the extension opened first) and with "clientSubscribed" /
			// "clientUnsubscribed" for any later change (covers the case where the extension opens
			// after RTA started). No publish-based handshake is needed - publishing into a channel
			// with no target logs an error in the ushell MessageBroker and leaks an uncaught
			// rejection that the caller cannot suppress.
			const fnOnClientConnectionChange = (sMessageName, sClientId) => {
				const { supportClientId } = SupportAPI.getSupportChannelInfo();
				if (sClientId !== supportClientId) {
					return;
				}
				if (sMessageName === "clientSubscribed") {
					bSupportClientConnected = true;
					// Intentionally re-announce on every subscribe: if the extension is closed and
					// reopened, it re-subscribes and needs the rtaStarted signal again to rebuild its
					// state. The extension treats rtaStarted as idempotent.
					onRtaStart();
				} else if (sMessageName === "clientUnsubscribed") {
					bSupportClientConnected = false;
				}
			};
			// cFLP: connect the app client (idempotent - it may already be connected by
			// the flex ComponentLifecycleHooks in debug mode) and register a handler per
			// command on the shared support channel. The focus listener is installed here
			// because the injected script cannot reach the app frame in cFLP.
			const pConnected = SupportAPI.connectAppClient(fnOnClientConnectionChange).then(() => {
				Object.keys(mHandlers).forEach((sType) => {
					SupportAPI.registerMessageHandler(sBrokerMessagePrefix + sType, (oContent) => {
						handleCommand(oRta, sType, oContent);
					});
				});
				installFocusListener(oRta);
				oRta.attachEventOnce("stop", onRtaStop);
			});
			pConnected.catch((oError) => {
				Log.error("OverlayInfo: could not connect to the message broker", oError);
			});

			return {
				// Resolves once the app client is connected and the command handlers are registered.
				// Exposed so consumers (and tests) can await the async setup deterministically.
				pReady: pConnected,
				destroy() {
					removeFocusListener();
					bSupportClientConnected = false;
					Object.keys(mHandlers).forEach((sType) => {
						SupportAPI.deregisterMessageHandler(sBrokerMessagePrefix + sType);
					});
					// Detach our connection callback so its closure (which captures oRta) is not
					// retained and does not fire onRtaStart for this torn-down instance on later
					// broker connection events. The shared app client itself stays connected - it
					// is reused by the flex support API.
					SupportAPI.deregisterConnectionCallback(fnOnClientConnectionChange);
				}
			};
		}

		// Direct (standalone / in-frame) scenario: unchanged same-window communication.
		const fnOnMessageReceivedBound = onMessageReceived.bind(null, oRta);
		window.addEventListener("message", fnOnMessageReceivedBound);
		oRta.attachEventOnce("stop", onRtaStop);
		onRtaStart();

		return {
			destroy() {
				window.removeEventListener("message", fnOnMessageReceivedBound);
			}
		};
	}

	// Exposed as a property so the scenario detection can be stubbed in tests.
	OverlayInfoFactory._isBrokerScenario = isBrokerScenario;

	return OverlayInfoFactory;
});
