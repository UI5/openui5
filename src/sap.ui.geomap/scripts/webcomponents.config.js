"use strict";

const path = require("node:path");

module.exports = {
	libraryRoot: path.resolve(__dirname, ".."),
	libSrc: path.join("src", "sap", "ui", "geomap"),
	packages: ["@ui5/webcomponents-geomap"],
	genFiles: {
		"@ui5/webcomponents-geomap": "gen/ui5/webcomponents_geomap.js"
	}
};
