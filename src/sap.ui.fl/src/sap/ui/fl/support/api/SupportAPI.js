/*!
 * ${copyright}
 */

/* eslint-disable no-console */

sap.ui.define([
	"sap/ui/core/ComponentRegistry",
	"sap/ui/fl/support/_internal/getAllUIChanges",
	"sap/ui/fl/support/_internal/getFlexObjectInfos",
	"sap/ui/fl/support/_internal/getFlexSettings",
	"sap/ui/fl/support/_internal/getChangeDependencies",
	"sap/ui/fl/Utils"
], function(
	ComponentRegistry,
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
	const MESSAGE_GET_FLEX_OBJECT_INFOS = "getFlexObjectInfos";
	const MESSAGE_GET_ALL_UI_CHANGES = "getAllUIChanges";
	const MESSAGE_GET_CHANGE_DEPENDENCIES = "getChangeDependencies";
	const MESSAGE_GET_FLEX_SETTINGS = "getFlexSettings";

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
	 * Finds the application component and calls the provided function with it.
	 * If the component is not found (e.g., in cFLP case), publishes a message via the MessageBroker
	 * to be received by the application (e.g. inside an iFrame), which will then call the function with the component.
	 *
	 * @async
	 * @param {Function} fnFunction - The function to call with the found component as argument.
	 * @param {string} sMessageId - The message ID to publish if the component is not found.
	 * @returns {Promise<*>} The result of the called function, or undefined if the component is not found.
	 * @private
	 */
	async function findComponentAndCallFunction(fnFunction, sMessageId) {
		const oComponent = await getComponent();
		if (oComponent) {
			return fnFunction(oComponent);
		}
		// cFLP case (currently only for getFlexObjectInfos!)
		if (sMessageId === MESSAGE_GET_FLEX_OBJECT_INFOS) {
			const oMessageBroker = await Utils.getUShellService("MessageBroker");
			if (!oMessageBroker) {
				throw new Error("Component not found (possible cFLP scenario) but MessageBroker service is not available");
			}
			await oMessageBroker.publish(
				CHANNEL_ID,
				SUPPORT_CLIENT_ID,
				sMessageId,
				[APP_CLIENT_ID]
			);
			return undefined;
		}
		throw new Error(`Component not found and no MessageBroker publishing implemented for message ID: ${sMessageId}`);
	}

	/**
	 * Handles messages received via the Flex support message broker channel.
	 * The info is directly logged to the console since only the FlexScript "getFlexObjectInfos" supports this scenario at the moment.
	 * Other support tools (dependencies, overlay info and other scripts) need to send serialized content back through the message broker.
	 *
	 * @async
	 * @param {string} sClientId - The client ID of the sender. Should always be "FlexSupportClient"
	 * @param {string} sChannelId - The channel ID on which the message was received. Should always be "flex.support.channel"
	 * @param {string} sMessageId - The ID of the received message.
	 * @returns {Promise<void>} Resolves when the message has been processed.
	 * @private
	 */
	async function onFlexMessageReceived(sClientId, sChannelId, sMessageId) {
		if (sClientId === SUPPORT_CLIENT_ID && sChannelId === CHANNEL_ID) {
			switch (sMessageId) {
				case MESSAGE_GET_FLEX_OBJECT_INFOS: {
					const oFlexObjectInfos = await SupportAPI.getFlexObjectInfos();
					console.log(oFlexObjectInfos);
					break;
				}
				default:
					break;
			}
		}
	}

	SupportAPI.getAllUIChanges = function() {
		return findComponentAndCallFunction(getAllUIChanges, MESSAGE_GET_ALL_UI_CHANGES);
	};

	SupportAPI.getFlexObjectInfos = function() {
		return findComponentAndCallFunction(getFlexObjectInfos, MESSAGE_GET_FLEX_OBJECT_INFOS);
	};

	SupportAPI.getChangeDependencies = function() {
		return findComponentAndCallFunction(getChangeDependencies, MESSAGE_GET_CHANGE_DEPENDENCIES);
	};

	SupportAPI.getFlexSettings = function() {
		return findComponentAndCallFunction(getFlexSettings, MESSAGE_GET_FLEX_SETTINGS);
	};

	SupportAPI.getApplicationComponent = function() {
		return getComponent();
	};

	/**
	 * Checks if an application component exists and, if not, initializes the MessageBroker for the support client.
	 * This happens in the "external" application of the cFLP (central Fiori Launchpad) scenario - the one hosting the iFrame.
	 * Connects and subscribes to the support channel only in the cFLP case.
	 *
	 * @async
	 * @returns {Promise<void>} Resolves when the MessageBroker is connected and subscribed, or immediately if a component exists.
	 * @private
	 */
	SupportAPI.checkAndPrepareMessageBroker = async function() {
		const oComponent = await getComponent();
		if (oComponent) {
			return;
		}
		// The MessageBroker should only be initialized when a component is not found (e.g. cFLP case)
		const oMessageBroker = await Utils.getUShellService("MessageBroker");
		try {
			await oMessageBroker.connect(SUPPORT_CLIENT_ID, () => {});
		} catch (oError) {
			// Ignore "Already connected" error
			if (oError.message && oError.message.includes("Client is already connected")) {
				return;
			}
			throw oError;
		}
		// The subscriber function is empty because the support client only sends messages in this scenario
		// but the callback is required by the MessageBroker API
		await oMessageBroker.subscribe(SUPPORT_CLIENT_ID, [{ channelId: CHANNEL_ID }], () => {});
	};

	/**
	 * Initializes the MessageBroker service for the application client.
	 * Connects to the MessageBroker and subscribes to the support channel.
	 *
	 * @async
	 * @returns {Promise<void>} Resolves when the MessageBroker is connected and subscribed.
	 * @private
	 */
	SupportAPI.initializeMessageBrokerForComponent = async function() {
		const oMessageBrokerService = await Utils.getUShellService("MessageBroker");
		await oMessageBrokerService.connect(APP_CLIENT_ID, () => {});
		oMessageBrokerService.subscribe(APP_CLIENT_ID, [{ channelId: CHANNEL_ID }], onFlexMessageReceived);
	};

	return SupportAPI;
});