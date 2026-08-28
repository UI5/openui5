/*!
 * ${copyright}
 */
sap.ui.define(["sap/html/HTMLElementBase", "sap/html/library"], function (HTMLElementBase) {
	"use strict";

	const Meter = HTMLElementBase.extend("sap.html.Meter", {
		metadata: {
			"tag": "meter",
			"properties": {
				"high": {
					"type": "float",
					"mapping": "property"
				},
				"low": {
					"type": "float",
					"mapping": "property"
				},
				"max": {
					"type": "float",
					"mapping": "property"
				},
				"min": {
					"type": "float",
					"mapping": "property"
				},
				"optimum": {
					"type": "float",
					"mapping": "property"
				},
				"value": {
					"type": "float",
					"mapping": "property"
				}
			}
		}
	});

	return Meter;
});
