/*!
 * ${copyright}
 */
sap.ui.define(["sap/html/HTMLElementBase", "sap/html/library"], function (HTMLElementBase) {
	"use strict";

	const Progress = HTMLElementBase.extend("sap.html.Progress", {
		metadata: {
			"tag": "progress",
			"properties": {
				"max": {
					"type": "float",
					"mapping": "property",
					"defaultValue": 1
				},
				"value": {
					"type": "float",
					"mapping": "property"
				}
			}
		}
	});

	return Progress;
});
