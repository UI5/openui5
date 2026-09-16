/*!
 * ${copyright}
 */
sap.ui.define(["sap/html/HTMLElementBase", "sap/html/library"], function (HTMLElementBase) {
	"use strict";

	const Canvas = HTMLElementBase.extend("sap.html.Canvas", {
		metadata: {
			"tag": "canvas",
			"properties": {
				"height": {
					"type": "int",
					"mapping": "property"
				},
				"width": {
					"type": "int",
					"mapping": "property"
				}
			}
		}
	});

	return Canvas;
});
