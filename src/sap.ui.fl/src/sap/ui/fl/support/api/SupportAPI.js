/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/Log",
	"sap/ui/core/ComponentRegistry",
	"sap/ui/fl/support/_internal/getAllUIChanges",
	"sap/ui/fl/support/_internal/getFlexObjectInfos",
	"sap/ui/fl/support/_internal/getFlexSettings",
	"sap/ui/fl/support/_internal/getChangeDependencies",
	"sap/ui/fl/Utils"
], function(
	Log,
	ComponentRegistry,
	getAllUIChanges,
	getFlexObjectInfos,
	getFlexSettings,
	getChangeDependencies,
	Utils
) {
	"use strict";

	// Returns the iFrame DOM element in cFLP scenario
	async function getIFrame() {
		const oAppLifeCycleService = await Utils.getUShellService("AppLifeCycle");
		const oCurrentApp = oAppLifeCycleService.getCurrentApplication();
		// potential cFLP scenario with the instance running in an iFrame where the top has no access to the componentInstance
		// in this case the module has to be required inside the iFrame and executed there
		const oIntent = await oCurrentApp.getIntent();
		// TODO: The following approaches do not work in all cFLP cases, so the communication with the iFrame
		// must be done using the Message Broker. todos#11
		// Previous implementation - id was "application-<semanticObject>-<action>"
		let oIFrame = document.getElementById(`application-${oIntent.semanticObject}-${oIntent.action}`);
		if (!oIFrame) {
			// New implementation - data-help-id attribute is used
			const aIFrames = [...document.getElementsByTagName("iFrame")];
			// find the iFrame by checking the data-help-id attribute
			oIFrame = aIFrames.find((oIFrame) => {
				const sHelpId = oIFrame.getAttribute("data-help-id");
				return sHelpId === `application-${oIntent.semanticObject}-${oIntent.action}`;
			});
		}
		if (!oIFrame) {
			const sError = "Possible cFLP scenario, but the iFrame can't be found";
			Log.error(sError);
			throw Error(sError);
		}
		return oIFrame;
	}

	async function getComponentAndIFrame() {
		// FLP case
		if (Utils.getUshellContainer()) {
			const oAppLifeCycleService = await Utils.getUShellService("AppLifeCycle");
			const oCurrentApp = oAppLifeCycleService.getCurrentApplication();
			if (oCurrentApp.componentInstance) {
				return {
					component: oCurrentApp.componentInstance
				};
			}
			// potential cFLP scenario with the instance running in an iFrame where the top has no access to the componentInstance
			const oIFrame = await getIFrame();
			return new Promise(function(resolve) {
				oIFrame.contentWindow.sap.ui.require(["sap/ui/fl/Utils"], function(oUtilsInIFrame) {
					oUtilsInIFrame.getUShellService("AppLifeCycle").then(function(oAppLifeCycleServiceInIFrame) {
						const oCurrentAppInIFrame = oAppLifeCycleServiceInIFrame.getCurrentApplication();
						resolve(oCurrentAppInIFrame.componentInstance);
					});
				});
			}).then(function(oComponentInIFrame) {
				if (oComponentInIFrame) {
					return {
						iFrame: oIFrame,
						component: oComponentInIFrame
					};
				}
				throw new Error("No application component found");
			});
		}

		// standalone case
		const aApplications = ComponentRegistry.filter(function(oComponent) {
			return oComponent.getManifestObject().getRawJson()["sap.app"].type === "application";
		});

		if (aApplications.length === 1) {
			return {
				component: aApplications[0]
			};
		}

		throw new Error("No application component found");
	}

	async function findComponentAndCallFunction(fnFunction, sModulePath) {
		const oComponentAndIFrame = await getComponentAndIFrame();

		if (!oComponentAndIFrame.iFrame) {
			return fnFunction(oComponentAndIFrame.component);
		}
		return new Promise(function(resolve) {
			oComponentAndIFrame.iFrame.contentWindow.sap.ui.require([sModulePath], function(fnModuleInsideIFrame) {
				fnModuleInsideIFrame(oComponentAndIFrame.component).then(resolve);
			});
		});
	}

	/**
	 * Provides an API for support tools
	 *
	 * @namespace sap.ui.fl.support.api.SupportAPI
	 * @since 1.98
	 * @version ${version}
	 * @private
	 * @ui5-restricted ui5 support tools, ui5 diagnostics
	 */
	const SupportAPI = /** @lends sap.ui.fl.support.api.SupportAPI */{
		getAllUIChanges() {
			return findComponentAndCallFunction(getAllUIChanges, "sap/ui/fl/support/_internal/getAllUIChanges");
		},
		getFlexObjectInfos() {
			return findComponentAndCallFunction(getFlexObjectInfos, "sap/ui/fl/support/_internal/getFlexObjectInfos");
		},
		getChangeDependencies() {
			return findComponentAndCallFunction(getChangeDependencies, "sap/ui/fl/support/_internal/getChangeDependencies");
		},
		getFlexSettings() {
			return findComponentAndCallFunction(getFlexSettings, "sap/ui/fl/support/_internal/getFlexSettings");
		},
		async getApplicationComponent() {
			const oComponentAndIFrame = await getComponentAndIFrame();
			return oComponentAndIFrame.component;
		}
	};

	return SupportAPI;
});
