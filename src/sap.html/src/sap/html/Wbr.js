/*!
 * ${copyright}
 */
sap.ui.define(["sap/html/HTMLElementBase", "sap/html/library"], function (HTMLElementBase) {
	"use strict";

	const Wbr = HTMLElementBase.extend("sap.html.Wbr", {
		metadata: {
			"tag": "wbr",
			"void": true
		}
	});

	return Wbr;
});
