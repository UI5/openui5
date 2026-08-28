/*!
 * ${copyright}
 */
sap.ui.define(["sap/html/HTMLElementBase", "sap/html/library"], function (HTMLElementBase) {
	"use strict";

	const Area = HTMLElementBase.extend("sap.html.Area", {
		metadata: {
			"tag": "area",
			"void": true,
			"properties": {
				"alt": {
					"type": "string",
					"mapping": "property"
				},
				"coords": {
					"type": "string",
					"mapping": "property"
				},
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
				"shape": {
					"type": "sap.html.enums.Shape",
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

	return Area;
});
