/*!
 * ${copyright}
 */

/* eslint-disable no-console */

sap.ui.define([
	"sap/base/Log",
	"sap/base/util/Deferred",
	"sap/m/MessageBox",
	"sap/ui/core/ComponentRegistry",
	"sap/ui/core/Lib",
	"sap/ui/fl/support/_internal/getAllUIChanges",
	"sap/ui/fl/support/_internal/getFlexObjectInfos",
	"sap/ui/fl/support/_internal/getFlexSettings",
	"sap/ui/fl/support/_internal/getChangeDependencies",
	"sap/ui/fl/Utils"
], function(
	Log,
	Deferred,
	MessageBox,
	ComponentRegistry,
	Lib,
	getAllUIChanges,
	getFlexObjectInfos,
	getFlexSettings,
	getChangeDependencies,
	Utils
) {
	"use strict";
	/**
	 * Provides an API for support tools
	 *
	 * @namespace sap.ui.fl.support.api.SupportAPI
	 * @since 1.98
	 * @version ${version}
	 * @private
	 * @ui5-restricted ui5 support tools, ui5 diagnostics
	 */
	const SupportAPI = {};

	const APP_CLIENT_ID = "FlexAppClient";
	const SUPPORT_CLIENT_ID = "FlexSupportClient";
	const CHANNEL_ID = "flex.support.channel";
	const MESSAGE_PRINT_ALL_UI_CHANGES = "printAllUIChanges";
	const MESSAGE_GET_FLEX_OBJECT_INFOS = "getFlexObjectInfos";
	const MESSAGE_GET_CHANGE_DEPENDENCIES = "getChangeDependencies";
	const MESSAGE_CHANGE_DEPENDENCIES_RESULT = "changeDependenciesResult";
	const MESSAGE_GET_FLEX_SETTINGS = "getFlexSettings";
	const MESSAGE_GET_FLEX_SETTINGS_RESULT = "getFlexSettingsResult";
	const MESSAGE_PRINT_MIX_OF_CHANGES = "printMixOfChanges";
	const MESSAGE_PRINT_LOCAL_CHANGE_DESCRIPTIONS = "printLocalChangeDescriptions";
	const MESSAGE_CHECK_CONNECTION = "CheckConnection";
	const MESSAGE_CONNECTION_ESTABLISHED = "ConnectionEstablished";
	const oResourceBundle = Lib.getResourceBundleFor("sap.ui.fl");
	let sMessageBrokerStatus = "initial";
	/**
	 * Retrieves the application component from either FLP or standalone scenarios.
	 *
	 * @returns {Promise<sap.ui.core.Component|undefined>} The application component, or undefined if not found
	 */
	async function getComponent() {
		// FLP case
		if (Utils.getUshellContainer()) {
			const oAppLifeCycleService = await Utils.getUShellService("AppLifeCycle");
			const oCurrentApp = oAppLifeCycleService.getCurrentApplication();
			if (oCurrentApp.componentInstance) {
				return oCurrentApp.componentInstance;
			}
		}

		// standalone case
		const aApplications = ComponentRegistry.filter(function(oComponent) {
			return oComponent.getManifestObject().getRawJson()["sap.app"].type === "application";
		});
		if (aApplications.length === 1) {
			return aApplications[0];
		}

		return undefined;
	}

	/**
	 * Reloads the current application with the debug parameter enabled.
	 */
	function reloadAppWithDebugSources() {
		const oUrl = new URL(window.location.href);
		oUrl.searchParams.set("sap-ui-debug", "true");
		window.location.href = oUrl.toString();
	}

	/**
	 * Creates human-readable descriptions for local changes.
	 *
	 * @param {Array} aAllChanges - Array of all changes to process
	 * @returns {object} Object containing an array of change descriptions under the 'descriptions' property
	 */
	function createLocalChangeDescriptions(aAllChanges) {
		const fnGetDescription = (oChange) => {
			const oChangeDefinition = oChange.getDefinition();
			const oGenerators = {
				addFields: () => `Field ${oChangeDefinition.content.field.value} was added to ${oChangeDefinition.selector.id}`,
				moveControls: () => `Field ${oChangeDefinition.content.movedElements[0].selector.id} was moved from ${oChangeDefinition.content.source.selector.id} [Index ${oChangeDefinition.content.movedElements[0].sourceIndex}] to  ${oChangeDefinition.content.target.selector.id} [Index ${oChangeDefinition.content.movedElements[0].targetIndex}]`,
				moveSimpleFormField: () => `Formfield ${oChangeDefinition.content.movedElements[0].elementSelector.id} was moved from ${oChangeDefinition.content.movedElements[0].source.groupSelector.id} [Index ${oChangeDefinition.content.movedElements[0].source.fieldIndex}] to  ${oChangeDefinition.content.movedElements[0].target.groupSelector.id} [Index ${oChangeDefinition.content.movedElements[0].target.fieldIndex}]`,
				addGroup: () => `New group ${oChangeDefinition.content.group.selector.id} added to ${oChangeDefinition.selector.id}`,
				hideControl: () => `${oChangeDefinition.selector.id} was hidden`,
				unhideControl: () => `${oChangeDefinition.selector.id} was revealed`,
				renameGroup: () => `${oChangeDefinition.selector.id} renamed to ${oChangeDefinition.texts.groupLabel.value}`,
				renameLabel: () => `${oChangeDefinition.selector.id} renamed to ${oChangeDefinition.texts.formText.value}`,
				renameTitle: () => oGenerators.renameLabel(),
				propertyChange: () => `Property "${oChangeDefinition.content.property}" of ${oChangeDefinition.selector.id} changed to "${oChangeDefinition.content.newValue}"`
			};
			const fnGenerateDescription = oGenerators[oChangeDefinition.changeType];
			return fnGenerateDescription ? fnGenerateDescription() : `Unknown change type: ${oChangeDefinition.changeType}`;
		};

		const aLocalChangeDescriptions = aAllChanges.filter((oChange) => !oChange.isChangeFromOtherSystem()).map(fnGetDescription);
		return {
			descriptions: aLocalChangeDescriptions
		};
	}

	/**
	 * Logs local change descriptions for the current application component to the browser console.
	 */
	async function printLocalChangeDescriptionsDirect() {
		const aAllChanges = await SupportAPI.getAllUIChanges();
		const oLocalChangeDescriptions = createLocalChangeDescriptions(aAllChanges);
		console.log(oLocalChangeDescriptions);
	}

	/**
	 * Logs a mix of local and foreign flex objects for the current application component to the browser console.
	 */
	async function printMixOfChangesDirect() {
		const oFlexObjectInfos = await SupportAPI.getFlexObjectInfos();
		const oMixOfChangesOutput = createMixOfChangesOutput(oFlexObjectInfos.allFlexObjects);
		console.log(oMixOfChangesOutput);
	}

	/**
	 * Logs flex object information for the current application component to the browser console.
	 */
	async function printFlexObjectInfosDirect() {
		const oFlexObjectInfos = await SupportAPI.getFlexObjectInfos();
		console.log(oFlexObjectInfos);
	}

	/**
	 * Logs all UI changes for the current application component to the browser console.
	 */
	async function printAllUIChangesDirect() {
		const aAllChanges = await SupportAPI.getAllUIChanges();
		console.log(aAllChanges);
	}

	/**
	 * Sends a print request message to the application client via the MessageBroker.
	 * Initializes the MessageBroker connection if it is not yet ready.
	 *
	 * @param {string} sMessage - The message ID to send to the application client
	 */
	async function printUsingMessageBroker(sMessage) {
		if (sMessageBrokerStatus !== "ready") {
			await SupportAPI.checkAndPrepareMessageBroker();
		}
		await sendMessageToAppClient(sMessage);
	}

	/**
	 * Retrieves the MessageBroker service instance.
	 *
	 * @throws {Error} If the MessageBroker service is not available
	 * @returns {Promise<object>} The MessageBroker service instance
	 */
	async function getMessageBroker() {
		const oMessageBroker = await Utils.getUShellService("MessageBroker");
		if (!oMessageBroker) {
			throw new Error("MessageBroker service is not available");
		}
		return oMessageBroker;
	}

	/**
	 * Sends a data request message to the application client via the MessageBroker and waits for the response.
	 * Initializes the MessageBroker connection if it is not yet ready.
	 *
	 * @param {string} sMessage - The message ID to send to the application client
	 * @returns {Promise<object>} Resolves with the response data from the application client
	 */
	async function getDataUsingMessageBroker(sMessage) {
		if (sMessageBrokerStatus !== "ready") {
			await SupportAPI.checkAndPrepareMessageBroker();
		}
		SupportAPI.oDeferredResult = new Deferred();
		await sendMessageToAppClient(sMessage);
		return SupportAPI.oDeferredResult.promise;
	}

	/**
	 * Creates an output object containing flex objects split into changes from other systems
	 * and local changes from the CUSTOMER layer.
	 *
	 * @param {Array} aAllFlexObjects - Array of all flex objects to process
	 * @returns {object} Object with 'flexObjectsFromOtherSystems' and 'localFlexObjects' arrays
	 */
	function createMixOfChangesOutput(aAllFlexObjects) {
		/**
		 * Filters changes to return only local changes from the CUSTOMER layer.
		 * @param {Array} aAllChanges - Array of all changes to filter
		 * @returns {Array} Array of local changes from the CUSTOMER layer
		 */
		function getLocalChanges(aAllChanges) {
			return aAllChanges.filter(
				(oChange) => (
					oChange.isChangeFromOtherSystem &&
					!oChange.isChangeFromOtherSystem() &&
					oChange.getLayer() === "CUSTOMER"
				)
			);
		}

		return {
			flexObjectsFromOtherSystems: aAllFlexObjects.filter((oFlexObject) => {
				return oFlexObject.isChangeFromOtherSystem() && oFlexObject.getLayer() === "CUSTOMER";
			}),
			localFlexObjects: getLocalChanges(aAllFlexObjects || [])
		};
	}

	/**
	 * Sends a message to the application client via the MessageBroker service.
	 * Uses the Flex support channel to communicate between support tools and the application.
	 *
	 * @param {string} sMessageId - The ID of the message to send
	 */
	async function sendMessageToAppClient(sMessageId) {
		const oMessageBroker = await getMessageBroker();
		await oMessageBroker.publish(
			CHANNEL_ID,
			SUPPORT_CLIENT_ID,
			sMessageId,
			[APP_CLIENT_ID]
		);
	}

	/**
	 * Sends a message with data to the support client via the MessageBroker service.
	 *
	 * @param {string} sMessageId - The ID of the message to send
	 * @param {object} oData - The data payload to send with the message
	 */
	async function sendMessageToFlexClient(sMessageId, oData) {
		const oMessageBroker = await getMessageBroker();
		await oMessageBroker.publish(
			CHANNEL_ID,
			APP_CLIENT_ID,
			sMessageId,
			[SUPPORT_CLIENT_ID],
			oData
		);
	}

	/**
	 * Handles messages received via the Flex support message broker channel.
	 *
	 * @param {string} sClientId - The client ID of the sender. Should always be "FlexSupportClient"
	 * @param {string} sChannelId - The channel ID on which the message was received. Should always be "flex.support.channel"
	 * @param {string} sMessageId - The ID of the received message.
	 */
	async function onSupportClientMessageReceived(sClientId, sChannelId, sMessageId) {
		if (sClientId === SUPPORT_CLIENT_ID && sChannelId === CHANNEL_ID) {
			switch (sMessageId) {
				case MESSAGE_GET_FLEX_OBJECT_INFOS: {
					await printFlexObjectInfosDirect();
					break;
				}
				case MESSAGE_PRINT_MIX_OF_CHANGES: {
					await printMixOfChangesDirect();
					break;
				}
				case MESSAGE_PRINT_ALL_UI_CHANGES: {
					await printAllUIChangesDirect();
					break;
				}
				case MESSAGE_PRINT_LOCAL_CHANGE_DESCRIPTIONS: {
					await printLocalChangeDescriptionsDirect();
					break;
				}
				case MESSAGE_GET_CHANGE_DEPENDENCIES: {
					const oResponse = await SupportAPI.getChangeDependencies();
					await sendMessageToFlexClient(MESSAGE_CHANGE_DEPENDENCIES_RESULT, oResponse);
					break;
				}
				case MESSAGE_GET_FLEX_SETTINGS: {
					const oResponse = await SupportAPI.getFlexSettings();
					await sendMessageToFlexClient(MESSAGE_GET_FLEX_SETTINGS_RESULT, oResponse);
					break;
				}
				case MESSAGE_CHECK_CONNECTION: {
					await sendMessageToFlexClient(MESSAGE_CONNECTION_ESTABLISHED);
					break;
				}
				default:
					break;
			}
		}
	}

	/**
	 * Handles messages received from the application client via the MessageBroker.
	 *
	 * @param {string} sClientId - The client ID of the sender. Should always be "FlexAppClient"
	 * @param {string} sChannelId - The channel ID on which the message was received. Should always be "flex.support.channel"
	 * @param {string} sMessageId - The ID of the received message
	 * @param {object} oData - The data payload sent with the message
	 */
	function onAppClientMessageReceived(sClientId, sChannelId, sMessageId, oData) {
		if (sClientId === APP_CLIENT_ID && sChannelId === CHANNEL_ID) {
			switch (sMessageId) {
				case MESSAGE_CONNECTION_ESTABLISHED: {
					Log.info("Connection Established");
					break;
				}
				case MESSAGE_CHANGE_DEPENDENCIES_RESULT: {
					SupportAPI.oDeferredResult.resolve(oData);
					break;
				}
				case MESSAGE_GET_FLEX_SETTINGS_RESULT: {
					SupportAPI.oDeferredResult.resolve(oData);
					break;
				}
				default:
					break;
			}
		}
	}

	/**
	 * Determines whether the MessageBroker scenario should be used.
	 * Returns true when no application component is found (e.g. in the cFLP host frame).
	 *
	 * @returns {Promise<boolean>} Resolves with true if the MessageBroker scenario should be used, false otherwise
	 */
	async function checkForMessageBrokerScenario() {
		const oComponent = await getComponent();
		return !(oComponent);
	}

	/**
	 * Retrieves all UI changes for the current application component.
	 *
	 * @throws {Error} If called in the MessageBroker scenario
	 * @returns {Promise<Array>} Array of all UI changes
	 * @since 1.128
	 * @ui5-restricted ui5 support tools
	 */
	SupportAPI.getAllUIChanges = async function() {
		if (await checkForMessageBrokerScenario()) {
			throw new Error("getFlexObjectInfos cannot be used in MessageBroker scenario");
		} else {
			const oComponent = await getComponent();
			return getAllUIChanges(oComponent);
		}
	};

	/**
	 * Retrieves flexibility object information for the current application component.
	 *
	 * @throws {Error} If called in the MessageBroker scenario
	 * @returns {Promise<object>} Flex object information
	 * @since 1.128
	 * @ui5-restricted ui5 support tools
	 */
	SupportAPI.getFlexObjectInfos = async function() {
		if (await checkForMessageBrokerScenario()) {
			throw new Error("getFlexObjectInfos cannot be used in MessageBroker scenario");
		} else {
			const oComponent = await getComponent();
			return getFlexObjectInfos(oComponent);
		}
	};

	/**
	 * Prints all UI changes for the current application component to the browser console.
	 * In the MessageBroker scenario, sends a message to the application client to trigger printing there.
	 *
	 * @since 1.147
	 * @ui5-restricted ui5 support tools
	 */
	SupportAPI.printAllUIChanges = async function() {
		if (await checkForMessageBrokerScenario()) {
			await printUsingMessageBroker(MESSAGE_PRINT_ALL_UI_CHANGES);
		} else {
			await printAllUIChangesDirect();
		}
	};

	/**
	 * Prints flexibility object information to the browser console.
	 * In the MessageBroker scenario, sends a message to the application client to trigger printing there.
	 *
	 * @since 1.147
	 * @ui5-restricted ui5 support tools
	 */
	SupportAPI.printFlexObjectInfos = async function() {
		if (await checkForMessageBrokerScenario()) {
			await printUsingMessageBroker(MESSAGE_GET_FLEX_OBJECT_INFOS);
		} else {
			await printFlexObjectInfosDirect();
		}
	};

	/**
	 * Prints a mix of local and foreign flex objects to the browser console.
	 * In the MessageBroker scenario, sends a message to the application client to trigger printing there.
	 *
	 * @since 1.147
	 * @ui5-restricted ui5 support tools
	 */
	SupportAPI.printMixOfChanges = async function() {
		if (await checkForMessageBrokerScenario()) {
			await printUsingMessageBroker(MESSAGE_PRINT_MIX_OF_CHANGES);
		} else {
			await printMixOfChangesDirect();
		}
	};

	/**
	 * Prints local change descriptions to the browser console.
	 * In the MessageBroker scenario, sends a message to the application client to trigger printing there.
	 *
	 * @since 1.147
	 * @ui5-restricted ui5 support tools
	 */
	SupportAPI.printLocalChangeDescriptions = async function() {
		if (await checkForMessageBrokerScenario()) {
			await printUsingMessageBroker(MESSAGE_PRINT_LOCAL_CHANGE_DESCRIPTIONS);
		} else {
			await printLocalChangeDescriptionsDirect();
		}
	};

	/**
	 * Retrieves change dependencies for the current application component.
	 * Can operate in two modes: direct retrieval or via MessageBroker for cross-frame communication.
	 *
	 * @returns {Promise<object>} Change dependencies information
	 * @since 1.98
	 * @ui5-restricted ui5 support tools
	 */
	SupportAPI.getChangeDependencies = async function() {
		if (await checkForMessageBrokerScenario()) {
			return await getDataUsingMessageBroker(MESSAGE_GET_CHANGE_DEPENDENCIES);
		}
		const oComponent = await getComponent();
		return getChangeDependencies(oComponent);
	};

	/**
	 * Retrieves flexibility settings for the current application component.
	 * Can operate in two modes: direct retrieval or via MessageBroker for cross-frame communication.
	 *
	 * @returns {Promise<object>} Flex settings information
	 * @since 1.99
	 * @ui5-restricted ui5 support tools
	 */
	SupportAPI.getFlexSettings = async function() {
		if (await checkForMessageBrokerScenario()) {
			return await getDataUsingMessageBroker(MESSAGE_GET_FLEX_SETTINGS);
		}
		const oComponent = await getComponent();
		return getFlexSettings(oComponent);
	};

	/**
	 * Retrieves the current application component.
	 *
	 * @returns {Promise<sap.ui.core.Component|undefined>} The application component, or undefined if not found
	 * @since 1.128
	 * @ui5-restricted ui5 support tools
	 */
	SupportAPI.getApplicationComponent = function() {
		return getComponent();
	};

	/**
	 * Checks if an application component exists and, if not, initializes the MessageBroker for the support client.
	 * This happens in the "external" application of the cFLP (central Fiori Launchpad) scenario - the one hosting the iFrame.
	 * Connects and subscribes to the support channel only in the cFLP case.
	 *
	 * @returns {Promise<void>} Resolves when the MessageBroker is connected and subscribed, or immediately if a component exists.
	 * @since 1.145
	 * @ui5-restricted ui5 support tools
	 */
	SupportAPI.checkAndPrepareMessageBroker = async function() {
		const oComponent = await getComponent();
		if (oComponent) {
			sMessageBrokerStatus = "notRequired";
			return;
		}
		// The MessageBroker should only be initialized when a component is not found (e.g. cFLP case)
		const oMessageBroker = await getMessageBroker();
		try {
			await oMessageBroker.connect(SUPPORT_CLIENT_ID, () => {});
		} catch (oError) {
			// Ignore "Already connected" error
			if (oError.message && oError.message.includes("Client is already connected")) {
				sMessageBrokerStatus = "ready";
				return;
			}
			sMessageBrokerStatus = "failed";
			throw oError;
		}
		await oMessageBroker.subscribe(SUPPORT_CLIENT_ID, [{ channelId: CHANNEL_ID }], onAppClientMessageReceived.bind(this));
		// check the connection by sending a message to the app client,
		// which should respond with a "Connection Established" message that we log in the console.
		try {
			await oMessageBroker.publish(
				CHANNEL_ID,
				SUPPORT_CLIENT_ID,
				MESSAGE_CHECK_CONNECTION,
				[APP_CLIENT_ID]
			);
		} catch (oError) {
			// Message Broker could not be initialized, show an error message and
			// give the user the possibility to reload the app in debug mode
			await oMessageBroker.disconnect(SUPPORT_CLIENT_ID);
			sMessageBrokerStatus = "client_not_connected";
			MessageBox.error(oResourceBundle.getText("MSG_MESSAGE_BROKER_INIT_FAILED"), {
				title: oResourceBundle.getText("TIT_MESSAGE_BROKER_INIT_FAILED"),
				actions: [
					oResourceBundle.getText("BTN_RELOAD_DEBUG"),
					MessageBox.Action.CLOSE
				],
				emphasizedAction: oResourceBundle.getText("BTN_RELOAD_DEBUG_LIMITED"),
				onClose: (sAction) => {
					if (sAction !== MessageBox.Action.CLOSE) {
						reloadAppWithDebugSources();
					}
				}
			});
			return;
		}
		sMessageBrokerStatus = "ready";
	};

	/**
	 * Initializes the MessageBroker service for the application client.
	 * Connects to the MessageBroker and subscribes to the support channel.
	 *
	 * @since 1.145
	 * @ui5-restricted ui5 support tools
	 */
	SupportAPI.initializeMessageBrokerForComponent = async function() {
		const oMessageBrokerService = await getMessageBroker();
		await oMessageBrokerService.connect(APP_CLIENT_ID, () => {});
		oMessageBrokerService.subscribe(APP_CLIENT_ID, [{ channelId: CHANNEL_ID }], onSupportClientMessageReceived.bind(this));
	};

	return SupportAPI;
});