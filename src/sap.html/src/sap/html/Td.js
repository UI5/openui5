/*!
 * ${copyright}
 */
sap.ui.define(["sap/html/HTMLElementBase", "sap/html/library"], function (HTMLElementBase) {
	"use strict";

	const Td = HTMLElementBase.extend("sap.html.Td", {
		metadata: {
			"tag": "td",
			"properties": {
				"abbr": {
					"type": "string",
					"mapping": "property"
				},
				"colspan": {
					"type": "int",
					"mapping": "property",
					"defaultValue": 1
				},
				"headers": {
					"type": "string",
					"mapping": "property"
				},
				"rowspan": {
					"type": "int",
					"mapping": "property",
					"defaultValue": 1
				}
			}
		}
	});

	return Td;
});
