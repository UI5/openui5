/*!
 * ${copyright}
 */
sap.ui.define(["sap/html/HTMLElementBase", "sap/html/library"], function (HTMLElementBase) {
	"use strict";

	const Colgroup = HTMLElementBase.extend("sap.html.Colgroup", {
		metadata: {
			"tag": "colgroup",
			"properties": {
				"span": {
					"type": "int",
					"mapping": "property",
					"defaultValue": 1
				}
			}
		}
	});

	return Colgroup;
});
