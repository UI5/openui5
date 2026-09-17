/*!
 * ${copyright}
 */
sap.ui.define(["sap/html/HTMLElementBase", "sap/html/library"], function (HTMLElementBase) {
	"use strict";

	const Br = HTMLElementBase.extend("sap.html.Br", {
		metadata: {
			"tag": "br",
			"void": true
		}
	});

	return Br;
});
