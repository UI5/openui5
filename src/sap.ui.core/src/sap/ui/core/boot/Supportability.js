/*!
 * ${copyright}
 */

/**
 * Initialize Support related stuff
 *
 * @private
 * @ui5-restricted sap.ui.core
 */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/core/Supportability",
	"sap/ui/core/support/Hotkeys"
], (
	Log,
	Supportability,
	Hotkeys
) => {
	"use strict";

	const aSupportModules = [];

	//init Hotkeys for support tools
	Hotkeys.init();

	// init support assistant
	if (Supportability.getSupportSettings() !== null) {
		aSupportModules.push(
			new Promise((res, rej) => {
				sap.ui.require(["sap/ui/support/Bootstrap", "sap/ui/core/support/Support"], (Bootstrap /*, Support */) => {
					Bootstrap.initSupportRules(Supportability.getSupportSettings());
					res();
				}, rej);
			}).catch((oError) => {
				Log.error("Could not load support mode modules:", oError);
			})
		);
	}

	// Initialize test tools
	if (Supportability.getTestRecorderSettings() !== null) {
		aSupportModules.push(
			new Promise((res, rej) => {
				sap.ui.require(["sap/ui/testrecorder/Bootstrap"], (Bootstrap) => {
					Bootstrap.init(Supportability.getTestRecorderSettings());
					res();
				}, rej);
			}).catch((oError) => {
				Log.error("Could not load test recorder:", oError);
			})
		);
	}

	// Initialize 2.0 Debugger if debugging tools are enabled (also true for regular debug mode)
	if (Supportability.isDebugToolsEnabled()) {
		aSupportModules.push(
			new Promise((res, rej) => {
				sap.ui.require(["sap/ui/core/support/debug/DebugLoader"], (DebugLoader) => {
					res(DebugLoader);
				}, rej);
			})
		);
	}

	const pReady = aSupportModules.length ? Promise.all(aSupportModules) : Promise.resolve();

	return {
		run: () => {
			return pReady;
		}
	};
});
