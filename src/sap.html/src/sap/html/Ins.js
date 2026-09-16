/*!
 * ${copyright}
 */
sap.ui.define(["sap/html/HTMLElementBase", "sap/html/library"], function (HTMLElementBase) {
	"use strict";

	const Ins = HTMLElementBase.extend("sap.html.Ins", {
		metadata: {
			"tag": "ins",
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

	return Ins;
});
