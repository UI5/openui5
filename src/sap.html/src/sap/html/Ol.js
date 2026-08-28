/*!
 * ${copyright}
 */
sap.ui.define(["sap/html/HTMLElementBase", "sap/html/library"], function (HTMLElementBase) {
	"use strict";

	const Ol = HTMLElementBase.extend("sap.html.Ol", {
		metadata: {
			"tag": "ol",
			"properties": {
				"reversed": {
					"type": "boolean",
					"mapping": "property"
				},
				"start": {
					"type": "int",
					"mapping": "property",
					"defaultValue": 1
				},
				"type": {
					"type": "sap.html.enums.ListType",
					"mapping": "property"
				}
			}
		}
	});

	return Ol;
});
