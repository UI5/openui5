/*!
 * ${copyright}
 */
sap.ui.define(["sap/html/HTMLElementBase", "sap/html/library"], function (HTMLElementBase) {
	"use strict";

	const H1 = HTMLElementBase.extend("sap.html.H1", {
		metadata: {
			"tag": "h1"
		}
	});

	return H1;
});
