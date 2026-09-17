/*!
 * ${copyright}
 */
sap.ui.define(["sap/html/HTMLElementBase", "sap/html/library"], function (HTMLElementBase) {
	"use strict";

	const Time = HTMLElementBase.extend("sap.html.Time", {
		metadata: {
			"tag": "time",
			"properties": {
				"datetime": {
					"type": "string",
					"mapping": "property"
				}
			}
		}
	});

	return Time;
});
