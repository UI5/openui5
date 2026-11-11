"use strict";

const path = require("node:path");

module.exports = {
	libraryRoot: path.resolve(__dirname, ".."),
	libSrc: path.join("src", "sap", "f"),
	packages: [
		"@ui5/webcomponents",
		"@ui5/webcomponents-fiori",
		"@ui5/webcomponents-icons",
		"@ui5/webcomponents-icons-business-suite",
		"@ui5/webcomponents-icons-tnt"
	],
	genFiles: {
		"@ui5/webcomponents": "gen/ui5/webcomponents.js",
		"@ui5/webcomponents-fiori": "gen/ui5/webcomponents_fiori.js",
		"@ui5/webcomponents-base": "gen/ui5/webcomponents_base.js"
	},
	// The transitive base package shares the main package's version.
	defaultRefPackage: "@ui5/webcomponents"
};
