/*!
 * ${copyright}
 */
sap.ui.define(["sap/html/HTMLElementBase", "sap/html/library"], function (HTMLElementBase) {
	"use strict";

	const Output = HTMLElementBase.extend("sap.html.Output", {
		metadata: {
			"tag": "output",
			"properties": {
				"for": {
					"type": "string",
					"mapping": "property"
				},
				"name": {
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

	return Output;
});
