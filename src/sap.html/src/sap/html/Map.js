/*!
 * ${copyright}
 */
sap.ui.define(["sap/html/HTMLElementBase", "sap/html/library"], function (HTMLElementBase) {
	"use strict";

	const Map = HTMLElementBase.extend("sap.html.Map", {
		metadata: {
			"tag": "map",
			"properties": {
				"name": {
					"type": "string",
					"mapping": "property"
				}
			}
		}
	});

	return Map;
});
