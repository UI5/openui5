/*!
 * ${copyright}
 */
sap.ui.define(["sap/html/HTMLElementBase", "sap/html/library"], function (HTMLElementBase) {
	"use strict";

	const Th = HTMLElementBase.extend("sap.html.Th", {
		metadata: {
			"tag": "th",
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
				},
				"scope": {
					"type": "sap.html.enums.TableSection",
					"mapping": "property"
				}
			}
		}
	});

	return Th;
});
