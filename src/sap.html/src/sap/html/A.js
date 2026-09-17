/*!
 * ${copyright}
 */
sap.ui.define(["sap/html/HTMLElementBase", "sap/html/library"], function (HTMLElementBase) {
	"use strict";

	const A = HTMLElementBase.extend("sap.html.A", {
		metadata: {
			"tag": "a",
			"properties": {
				"download": {
					"type": "string",
					"mapping": "property"
				},
				"href": {
					"type": "sap.ui.core.URI",
					"mapping": {
						"type": "property",
						"formatter": "_validateUrl"
					}
				},
				"hreflang": {
					"type": "string",
					"mapping": "property"
				},
				"ping": {
					"type": "sap.ui.core.URI",
					"mapping": {
						"type": "property",
						"formatter": "_validateUrl"
					}
				},
				"referrerpolicy": {
					"type": "string",
					"mapping": "property"
				},
				"rel": {
					"type": "string",
					"mapping": "property"
				},
				"target": {
					"type": "string",
					"mapping": "property"
				},
				"type": {
					"type": "string",
					"mapping": "property"
				}
			}
		}
	});

	return A;
});
