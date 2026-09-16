/*!
 * ${copyright}
 */
sap.ui.define(["sap/html/HTMLElementBase", "sap/html/library"], function (HTMLElementBase) {
	"use strict";

	const Img = HTMLElementBase.extend("sap.html.Img", {
		metadata: {
			"tag": "img",
			"void": true,
			"properties": {
				"alt": {
					"type": "string",
					"mapping": "property"
				},
				"controls": {
					"type": "boolean",
					"mapping": "property"
				},
				"crossorigin": {
					"type": "sap.html.enums.CrossOrigin",
					"mapping": "property"
				},
				"decoding": {
					"type": "sap.html.enums.Decoding",
					"mapping": "property"
				},
				"fetchpriority": {
					"type": "sap.html.enums.FetchPriority",
					"mapping": "property"
				},
				"height": {
					"type": "int",
					"mapping": "property"
				},
				"ismap": {
					"type": "boolean",
					"mapping": "property"
				},
				"loading": {
					"type": "sap.html.enums.Loading",
					"mapping": "property"
				},
				"referrerpolicy": {
					"type": "sap.html.enums.ReferrerPolicy",
					"mapping": "property"
				},
				"sizes": {
					"type": "string",
					"mapping": "property"
				},
				"src": {
					"type": "sap.ui.core.URI",
					"mapping": {
						"type": "property",
						"formatter": "_validateUrl"
					}
				},
				"srcset": {
					"type": "sap.ui.core.URI",
					"mapping": {
						"type": "property",
						"formatter": "_validateUrl"
					}
				},
				"usemap": {
					"type": "string",
					"mapping": "property"
				},
				"width": {
					"type": "int",
					"mapping": "property"
				}
			}
		}
	});

	return Img;
});
