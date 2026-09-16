/*!
 * ${copyright}
 */
sap.ui.define(["sap/html/HTMLElementBase", "sap/html/library"], function (HTMLElementBase) {
	"use strict";

	const Form = HTMLElementBase.extend("sap.html.Form", {
		metadata: {
			"tag": "form",
			"properties": {
				"acceptCharset": {
					"type": "string",
					"mapping": "property"
				},
				"action": {
					"type": "sap.ui.core.URI",
					"mapping": {
						"type": "property",
						"formatter": "_validateUrl"
					}
				},
				"autocomplete": {
					"type": "sap.html.enums.Toggle",
					"mapping": "property"
				},
				"enctype": {
					"type": "sap.html.enums.EncodingType",
					"mapping": "property"
				},
				"method": {
					"type": "sap.html.enums.Method",
					"mapping": "property"
				},
				"name": {
					"type": "string",
					"mapping": "property"
				},
				"novalidate": {
					"type": "boolean",
					"mapping": "property"
				},
				"rel": {
					"type": "string",
					"mapping": "property"
				},
				"target": {
					"type": "string",
					"mapping": "property"
				}
			}
		}
	});

	return Form;
});
