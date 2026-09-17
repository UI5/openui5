/*!
 * ${copyright}
 */
sap.ui.define(["sap/html/HTMLElementBase", "sap/html/library"], function (HTMLElementBase) {
	"use strict";

	const Col = HTMLElementBase.extend("sap.html.Col", {
		metadata: {
			"tag": "col",
			"void": true,
			"properties": {
				"span": {
					"type": "int",
					"mapping": "property",
					"defaultValue": 1
				}
			}
		}
	});

	return Col;
});
