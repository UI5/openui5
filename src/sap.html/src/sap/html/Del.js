/*!
 * ${copyright}
 */
sap.ui.define(["sap/html/HTMLElementBase", "sap/html/library"], function (HTMLElementBase) {
	"use strict";

	const Del = HTMLElementBase.extend("sap.html.Del", {
		metadata: {
			"tag": "del",
			"properties": {
				"cite": {
					"type": "sap.ui.core.URI",
					"mapping": {
						"type": "property",
						"formatter": "_validateUrl"
					}
				},
				"datetime": {
					"type": "string",
					"mapping": "property"
				}
			}
		}
	});

	return Del;
});
