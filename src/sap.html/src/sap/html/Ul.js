/*!
 * ${copyright}
 */
sap.ui.define(["sap/html/HTMLElementBase", "sap/html/library"], function (HTMLElementBase) {
	"use strict";

	const Ul = HTMLElementBase.extend("sap.html.Ul", {
		metadata: {
			"tag": "ul"
		}
	});

	return Ul;
});
