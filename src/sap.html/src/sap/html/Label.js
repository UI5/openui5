/*!
 * ${copyright}
 */
sap.ui.define(["sap/html/HTMLElementBase", "sap/html/library"], function (HTMLElementBase) {
	"use strict";

	const Label = HTMLElementBase.extend("sap.html.Label", {
		metadata: {
			"tag": "label",
			"properties": {
				"for": {
					"type": "string",
					"mapping": "property"
				}
			},
			"associations": {
				"form": {
					"type": "sap.html.Form",
					"mapping": {
						"type": "property",
						"to": "form"
					}
				}
			}
		}
	});

	return Label;
});
