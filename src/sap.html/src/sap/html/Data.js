/*!
 * ${copyright}
 */
sap.ui.define(["sap/html/HTMLElementBase", "sap/html/library"], function (HTMLElementBase) {
	"use strict";

	const Data = HTMLElementBase.extend("sap.html.Data", {
		metadata: {
			"tag": "data",
			"properties": {
				"value": {
					"type": "string",
					"mapping": "property"
				}
			}
		}
	});

	return Data;
});
