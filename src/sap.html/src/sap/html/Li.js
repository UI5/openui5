/*!
 * ${copyright}
 */
sap.ui.define(["sap/html/HTMLElementBase", "sap/html/library"], function (HTMLElementBase) {
	"use strict";

	const Li = HTMLElementBase.extend("sap.html.Li", {
		metadata: {
			"tag": "li",
			"properties": {
				"value": {
					"type": "int",
					"mapping": "property"
				}
			}
		}
	});

	return Li;
});
