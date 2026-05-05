/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/core/Lib",
	"sap/ui/core/support/debug/UI5Debug"
], function(Log, Lib, UI5Debug) {
	"use strict";

	// Object containing all debugging tools, collected from different libraries.
	const oCollectedTools = UI5Debug.scope();

	/**
	 * @param {object} oFrom From context
	 * @param {object} oTo To context
	 * @param {string} libraryName Name of the library from which the tools are collected, used for logging and to prevent naming conflicts
	 * @returns {object} Collected tools
	 */
	function collectTools(oFrom, oTo, libraryName) {
		if (typeof oTo === "string") {
			libraryName = oTo;
			oTo = oCollectedTools;
		}

		// defaulting to oCollectedTools in any other case
		oTo = oTo || oCollectedTools;

		for (const entry of Object.keys(oFrom)) {
			if (!Object.hasOwn(oTo, entry)) {
				oTo[entry] = oFrom[entry];
			} else if (typeof oFrom[entry] === "object") {
				collectTools(oFrom[entry], oTo[entry], libraryName);
			} else {
				// Debugging tools already contain the specific function/class...
				// appending library name to function name to not lose it
				Log.warning(`Debugging tool with name ${entry} already exists. Renaming the new one to ${libraryName}:${entry}`);
				oTo[`${libraryName}:${entry}`] = oFrom[entry];
			}
		}

		return oCollectedTools;
	}

	/**
	 * Helper function to load the debugging tools for a specific library and attach them to the debugNamespace
	 * @param {object} libraryInfo The library info object containing the library name and extensions
	 * @return {Promise} Promise that resolves when the debugging tools are loaded and attached
	 */
	function loadDebuggingTools(libraryInfo) {
		const debugEnabled = libraryInfo.extensions?.["sap.ui.debug"];
		if (debugEnabled === true) {
			const libraryName = libraryInfo.name;

			// by convention we load the debug utils from a sub path "{library}/support/debug/debug-tools.js"
			sap.ui.require([libraryName.replaceAll(".", "/") + "/support/debug/debug-tools"], async function(depReturn) {
				const oTools = await depReturn;

				// Collect help entries if the library provides them
				if (Array.isArray(oTools.__help)) {
					UI5Debug._libraryHelp.push({
						library: libraryName,
						entries: oTools.__help
					});
					delete oTools.__help;
				}

				globalThis.ui5 = collectTools(oTools, libraryName);
			}, function() {
				Log.warning(`Library '${libraryName}' declares 'sap.ui.debug' extension but no module was found at '${libraryName.replaceAll(".", "/")}/support/debug/debug-tools'.`);
			});
		} else if (debugEnabled !== undefined) {
			Log.warning(`Invalid value for 'sap.ui.debug' extension in library '${libraryInfo.name}'. Expected 'true', but got '${debugEnabled}'.`);
		}
	}

	// 1. Copy base debugging tools
	globalThis.ui5 = collectTools(UI5Debug);

	// 2. Load debugging tools for libraries that are loaded at this point
	const allLibs = Lib.all();
	for (const library of Object.keys(allLibs)) {
		loadDebuggingTools(allLibs[library]);
	}

	// 3. Attach listener to load debugging tools for libraries that will be loaded in the future
	Lib.attachLibraryChanged((evt) => {
		if (evt.getParameter("stereotype") === "library") {
			loadDebuggingTools(evt.getParameter("metadata"));
		}
	});
});
