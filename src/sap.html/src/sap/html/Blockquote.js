/*!
 * ${copyright}
 */
sap.ui.define(["sap/html/HTMLElementBase", "sap/html/library"], function (HTMLElementBase) {
	"use strict";

	const Blockquote = HTMLElementBase.extend("sap.html.Blockquote", {
		metadata: {
			"tag": "blockquote",
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

	return Blockquote;
});
