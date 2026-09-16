/*!
 * ${copyright}
 */
sap.ui.define(["sap/html/HTMLElementBase", "sap/html/library"], function (HTMLElementBase) {
	"use strict";

	const Details = HTMLElementBase.extend("sap.html.Details", {
		metadata: {
			"tag": "details",
			"properties": {
				"name": {
					"type": "string",
					"mapping": "property"
				},
				"open": {
					"type": "boolean",
					"mapping": "property"
				}
			}
		}
	});

	return Details;
});
