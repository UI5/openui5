/*!
 * ${copyright}
 */
sap.ui.define(["sap/html/HTMLElementBase", "sap/html/library"], function (HTMLElementBase) {
	"use strict";

	const Q = HTMLElementBase.extend("sap.html.Q", {
		metadata: {
			"tag": "q",
			"properties": {
				"cite": {
					"type": "sap.ui.core.URI",
					"mapping": {
						"type": "property",
						"formatter": "_validateUrl"
					}
				}
			}
		}
	});

	return Q;
});
