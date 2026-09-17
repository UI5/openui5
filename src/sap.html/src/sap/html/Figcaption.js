/*!
 * ${copyright}
 */
sap.ui.define(["sap/html/HTMLElementBase", "sap/html/library"], function (HTMLElementBase) {
	"use strict";

	const Figcaption = HTMLElementBase.extend("sap.html.Figcaption", {
		metadata: {
			"tag": "figcaption"
		}
	});

	return Figcaption;
});
